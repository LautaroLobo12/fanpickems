// Tournament-scoped points calculation system
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import type {
  BulkPointsUpdateResult,
  PointsBreakdown,
  PointsUpdateResult,
  Tournament,
  TournamentStageName,
  UserPicks
} from '../types';
import { db } from './firebase';
import { getTournament, getUserPicks } from './firestore';

/**
 * Calculate points for a user based on their picks and tournament results
 */
export const calculateUserPoints = (userPicks: UserPicks, tournament: Tournament): number => {
  if (!userPicks || !tournament || !tournament.stages) {
    return 0;
  }
  
  let totalPoints = 0;
  
  // Calculate points for each tournament stage
  Object.entries(tournament.stages).forEach(([stageName, stageConfig]) => {
    const stagePicks = userPicks.picks[stageName as TournamentStageName];
    const stageResults = stageConfig.results;
    
    // Skip if no picks or results for this stage
    if (!stagePicks || !stageResults || stageResults.length === 0) {
      return;
    }
    
    const pointValue = stageConfig.pointValue || 1;
    const stagePoints = calculateStagePoints(stagePicks, stageResults, pointValue);
    totalPoints += stagePoints;
  });
  
  return totalPoints;
};

/**
 * Calculate points for a specific tournament stage
 */
export const calculateStagePoints = (
  stagePicks: string[] | string, 
  stageResults: string[], 
  pointValue: number
): number => {
  if (Array.isArray(stagePicks)) {
    // Multiple picks stage (playoffs, play-ins, semifinals)
    const correctPicks = stagePicks.filter(pick => stageResults.includes(pick));
    return correctPicks.length * pointValue;
  } else {
    // Single pick stage (finals)
    return stageResults.includes(stagePicks) ? pointValue : 0;
  }
};

/**
 * Update points for a specific user in a tournament
 */
export const updateUserPoints = async (
  tournamentId: string, 
  userId: string
): Promise<PointsUpdateResult> => {
  try {
    // Get tournament data and user picks
    const tournament = await getTournament(tournamentId);
    const userPicks = await getUserPicks(tournamentId, userId);
    
    if (!tournament || !userPicks) {
      return { success: false, error: 'Tournament or user picks not found' };
    }
    
    // Calculate new points
    const newPoints = calculateUserPoints(userPicks, tournament);
    
    // Update points in Firestore
    const picksRef = doc(db, 'tournaments', tournamentId, 'picks', userId);
    await updateDoc(picksRef, {
      totalPoints: newPoints
    });
    
    return { 
      success: true, 
      points: newPoints,
      previousPoints: userPicks.totalPoints 
    };
  } catch (error) {
    console.error('Error updating user points:', error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Update points for all users in a tournament
 */
export const updateAllUserPoints = async (tournamentId: string): Promise<BulkPointsUpdateResult> => {
  try {
    // Get tournament data
    const tournament = await getTournament(tournamentId);
    if (!tournament) {
      return { success: false, error: 'Tournament not found' };
    }
    
    // Get all user picks for this tournament
    const picksRef = collection(db, 'tournaments', tournamentId, 'picks');
    const querySnapshot = await getDocs(picksRef);
    
    const updatePromises: Promise<void>[] = [];
    const updateResults: Array<{
      userId: string;
      previousPoints: number;
      newPoints: number;
    }> = [];
    
    // Process each user's picks
    querySnapshot.forEach((docSnap) => {
      const userPicks = docSnap.data() as UserPicks;
      const userId = docSnap.id;
      
      // Calculate new points
      const newPoints = calculateUserPoints(userPicks, tournament);
      
      // Only update if points changed
      if (newPoints !== userPicks.totalPoints) {
        const updatePromise = updateDoc(doc(db, 'tournaments', tournamentId, 'picks', userId), {
          totalPoints: newPoints
        }).then(() => {
          updateResults.push({
            userId,
            previousPoints: userPicks.totalPoints,
            newPoints
          });
        });
        
        updatePromises.push(updatePromise);
      }
    });
    
    // Execute all updates
    await Promise.all(updatePromises);
    
    return { 
      success: true, 
      updatedCount: updatePromises.length,
      totalUsers: querySnapshot.size,
      updates: updateResults
    };
  } catch (error) {
    console.error('Error updating all user points:', error);
    return { success: false, error: (error as Error).message };
  }
};

/**
 * Get detailed points breakdown for a user
 */
export const getPointsBreakdown = (userPicks: UserPicks, tournament: Tournament): PointsBreakdown => {
  if (!userPicks || !tournament || !tournament.stages) {
    return { stages: {}, total: 0 };
  }
  
  const breakdown: PointsBreakdown = { stages: {}, total: 0 };
  
  Object.entries(tournament.stages).forEach(([stageName, stageConfig]) => {
    const stagePicks = userPicks.picks[stageName as TournamentStageName];
    const stageResults = stageConfig.results;
    const pointValue = stageConfig.pointValue || 1;
    
    if (stagePicks && stageResults && stageResults.length > 0) {
      const stagePoints = calculateStagePoints(stagePicks, stageResults, pointValue);
      const correctPicks = Array.isArray(stagePicks) 
        ? stagePicks.filter(pick => stageResults.includes(pick))
        : (stageResults.includes(stagePicks) ? [stagePicks] : []);
      
      breakdown.stages[stageName] = {
        picks: stagePicks,
        results: stageResults,
        correctPicks,
        points: stagePoints,
        maxPoints: Array.isArray(stagePicks) ? stagePicks.length * pointValue : pointValue
      };
      
      breakdown.total += stagePoints;
    } else {
      breakdown.stages[stageName] = {
        picks: stagePicks || null,
        results: stageResults || [],
        correctPicks: [],
        points: 0,
        maxPoints: 0
      };
    }
  });
  
  return breakdown;
};