// Picks management
import type { PickValidationResult, Tournament, TournamentStageName, UserPicks } from '../../types/index.js';
import { getActiveTournament, getTeamsByIds, getTournamentTeams, getUserPicks, savePicks } from '../firestore.js';

// Save user picks for a tournament
export const saveUserPicks = async (tournamentId: string, userId: string, picks: UserPicks['picks'], isNew: boolean = false) => {
  try {
    await savePicks(tournamentId, userId, picks, isNew);
    return { success: true };
  } catch (error) {
    console.error('Error saving picks:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get user's picks for a tournament
export const getUserPicksForTournament = async (tournamentId: string, userId: string) => {
  try {
    return await getUserPicks(tournamentId, userId);
  } catch (error) {
    console.error('Error getting user picks:', error);
    return null;
  }
};

// Get the current active tournament
export const getCurrentTournament = async () => {
  try {
    return await getActiveTournament();
  } catch (error) {
    console.error('Error getting active tournament:', error);
    return null;
  }
};

// Get teams participating in a tournament
export const getTeamsForTournament = async (tournamentId: string) => {
  try {
    return await getTournamentTeams(tournamentId);
  } catch (error) {
    console.error('Error getting tournament teams:', error);
    return [];
  }
};

// Get teams by their IDs
export const getTeamsFromIds = async (teamIds: string[]) => {
  try {
    return await getTeamsByIds(teamIds);
  } catch (error) {
    console.error('Error getting teams by IDs:', error);
    return [];
  }
};

// Validate picks against tournament rules
export const validatePicks = (picks: UserPicks['picks'], tournament: Tournament): PickValidationResult => {
  const errors: string[] = [];

  if (!tournament || !tournament.stages) {
    errors.push('Tournament data not available');
    return { valid: false, errors };
  }

  // Check each stage
  Object.entries(tournament.stages).forEach(([stage, config]) => {
    const stagePicks = picks[stage as keyof UserPicks['picks']];

    // Skip validation if no picks for this stage (optional)
    if (!stagePicks || (Array.isArray(stagePicks) && stagePicks.length === 0)) {
      return;
    }

    // Check pick count
    const expectedCount = config.maxPicks;
    const actualCount = Array.isArray(stagePicks) ? stagePicks.length : (stagePicks ? 1 : 0);

    if (actualCount > expectedCount) {
      errors.push(`${stage} allows maximum ${expectedCount} pick(s), but ${actualCount} provided`);
    }

    // Check deadline
    const now = new Date();
    const deadline = config.deadline?.toDate ? config.deadline.toDate() : new Date((config.deadline as any).seconds * 1000);

    if (now > deadline) {
      errors.push(`Deadline for ${stage} has passed (${deadline.toLocaleString()})`);
    }

    // Validate team IDs exist in tournament
    const teamIds = Array.isArray(stagePicks) ? stagePicks : [stagePicks];
    teamIds.forEach(teamId => {
      if (teamId && !tournament.participatingTeams.includes(teamId)) {
        errors.push(`Team ${teamId} is not participating in this tournament`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

// Check if a specific stage is still open for picks
export const isStageOpen = (tournament: Tournament, stageName: TournamentStageName): boolean => {
  if (!tournament || !tournament.stages || !tournament.stages[stageName]) {
    return false;
  }

  const stage = tournament.stages[stageName];
  const now = new Date();
  const deadline = stage.deadline?.toDate ? stage.deadline.toDate() : new Date((stage.deadline as any).seconds * 1000);

  return now <= deadline;
};

// Get time remaining for a stage
export const getTimeRemaining = (tournament: Tournament, stageName: TournamentStageName) => {
  if (!tournament || !tournament.stages || !tournament.stages[stageName]) {
    return null;
  }

  const stage = tournament.stages[stageName];
  const now = new Date();
  const deadline = stage.deadline?.toDate ? stage.deadline.toDate() : new Date((stage.deadline as any).seconds * 1000);

  const timeRemaining = deadline.getTime() - now.getTime();

  if (timeRemaining <= 0) {
    return { expired: true, timeLeft: 0 };
  }

  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  return {
    expired: false,
    timeLeft: timeRemaining,
    days,
    hours,
    minutes,
    formatted: `${days}d ${hours}h ${minutes}m`
  };
};