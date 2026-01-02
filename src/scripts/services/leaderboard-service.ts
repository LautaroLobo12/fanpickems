// Leaderboard data fetching
import type { LeaderboardEntry, LeaderboardWithUserPosition } from '../../types/index.js';
import { getTournamentLeaderboard } from '../firestore.js';
import { calculateUserPoints, getPointsBreakdown, updateAllUserPoints } from './points.js';

// Get leaderboard for a tournament
export const getLeaderboard = async (tournamentId: string, limit: number = 5): Promise<LeaderboardEntry[]> => {
  try {
    return await getTournamentLeaderboard(tournamentId, limit);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
};

// Update points for all users in a tournament (called when results are updated)
export const updateAllTournamentPoints = async (tournamentId: string) => {
  try {
    return await updateAllUserPoints(tournamentId);
  } catch (error) {
    console.error('Error updating tournament points:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get user's rank in tournament leaderboard
export const getUserRank = async (tournamentId: string, userId: string): Promise<number | null> => {
  try {
    const fullLeaderboard = await getTournamentLeaderboard(tournamentId, 100); // Get more entries to find rank
    const userIndex = fullLeaderboard.findIndex(entry => entry.uid === userId);
    return userIndex >= 0 ? userIndex + 1 : null; // Return 1-based rank or null if not found
  } catch (error) {
    console.error('Error getting user rank:', error);
    return null;
  }
};

// Get leaderboard with user's position highlighted
export const getLeaderboardWithUserPosition = async (tournamentId: string, userId: string, limit: number = 5): Promise<LeaderboardWithUserPosition> => {
  try {
    const leaderboard = await getLeaderboard(tournamentId, limit);
    const userRank = await getUserRank(tournamentId, userId);

    return {
      leaderboard,
      userRank,
      userInTop: leaderboard.some(entry => entry.uid === userId)
    };
  } catch (error) {
    console.error('Error getting leaderboard with user position:', error);
    return { leaderboard: [], userRank: null, userInTop: false };
  }
};

// Export points calculation functions for use in other components
export { calculateUserPoints, getPointsBreakdown };

