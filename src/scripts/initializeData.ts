// Initialize sample tournament and team data
import type { Team } from '../types/index.js';
import { createTeam, createTournament } from './firestore.js';

// Define tournament data type with Date objects (not Timestamps)
interface InitTournamentData {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  active: boolean;
  participatingTeams: string[];
  stages: {
    playoffs: { deadline: Date; maxPicks: number; pointValue: number; results: string[] };
    playins: { deadline: Date; maxPicks: number; pointValue: number; results: string[] };
    semifinals: { deadline: Date; maxPicks: number; pointValue: number; results: string[] };
    finals: { deadline: Date; maxPicks: number; pointValue: number; results: string[] };
  };
}

// Sample LCK teams data
const lckTeams: Team[] = [
  {
    id: 't1',
    name: 'T1',
    logo: '/logos/t1.png',
    active: true
  },
  {
    id: 'gen-g',
    name: 'Gen.G',
    logo: '/logos/geng.png',
    active: true
  },
  {
    id: 'hanwha-life',
    name: 'Hanwha Life Esports',
    logo: '/logos/hle.png',
    active: true
  },
  {
    id: 'kt-rolster',
    name: 'KT Rolster',
    logo: '/logos/kt.png',
    active: true
  },
  {
    id: 'dk',
    name: 'DWG KIA',
    logo: '/logos/dk.png',
    active: true
  },
  {
    id: 'kdf',
    name: 'Kwangdong Freecs',
    logo: '/logos/kdf.png',
    active: true
  },
  {
    id: 'drx',
    name: 'DRX',
    logo: '/logos/drx.png',
    active: true
  },
  {
    id: 'brion',
    name: 'OK BRION',
    logo: '/logos/brion.png',
    active: true
  },
  {
    id: 'ns',
    name: 'Nongshim RedForce',
    logo: '/logos/ns.png',
    active: true
  },
  {
    id: 'fearx',
    name: 'FearX',
    logo: '/logos/fearx.png',
    active: true
  }
];

// Sample tournament data
const sampleTournament: InitTournamentData = {
  id: 'lck-spring-2025',
  name: 'LCK Spring 2025',
  startDate: new Date('2025-01-15'),
  endDate: new Date('2025-04-15'),
  active: true,
  participatingTeams: [
    't1', 'gen-g', 'hanwha-life', 'kt-rolster', 'dk',
    'kdf', 'drx', 'brion', 'ns', 'fearx'
  ],
  stages: {
    playoffs: {
      deadline: new Date('2025-03-15T23:59:59'),
      maxPicks: 6,
      pointValue: 1,
      results: [] // Will be filled when playoffs conclude
    },
    playins: {
      deadline: new Date('2025-03-20T23:59:59'),
      maxPicks: 4,
      pointValue: 2,
      results: [] // Will be filled when play-ins conclude
    },
    semifinals: {
      deadline: new Date('2025-04-05T23:59:59'),
      maxPicks: 2,
      pointValue: 3,
      results: [] // Will be filled when semifinals conclude
    },
    finals: {
      deadline: new Date('2025-04-12T23:59:59'),
      maxPicks: 1,
      pointValue: 5,
      results: [] // Will be filled when finals conclude
    }
  }
};

// Initialize all teams
export const initializeTeams = async () => {
  try {
    console.log('Initializing LCK teams...');

    for (const team of lckTeams) {
      await createTeam(team);
      console.log(`Created team: ${team.name}`);
    }

    console.log('All teams initialized successfully!');
    return { success: true, count: lckTeams.length };
  } catch (error) {
    console.error('Error initializing teams:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Initialize sample tournament
export const initializeTournament = async () => {
  try {
    console.log('Initializing sample tournament...');

    // Cast to the expected type for Firestore (Timestamps will be created by Firestore)
    await createTournament(sampleTournament as any);
    console.log(`Created tournament: ${sampleTournament.name}`);

    console.log('Tournament initialized successfully!');
    return { success: true, tournament: sampleTournament };
  } catch (error) {
    console.error('Error initializing tournament:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Initialize all data
export const initializeAllData = async () => {
  console.log('Starting data initialization...');

  const teamsResult = await initializeTeams();
  if (!teamsResult.success) {
    return { success: false, error: `Teams initialization failed: ${teamsResult.error}` };
  }

  const tournamentResult = await initializeTournament();
  if (!tournamentResult.success) {
    return { success: false, error: `Tournament initialization failed: ${tournamentResult.error}` };
  }

  console.log('All data initialized successfully!');
  return {
    success: true,
    teamsCount: teamsResult.count,
    tournament: tournamentResult.tournament
  };
};

// Export the sample data for reference
export { lckTeams, sampleTournament };

