// Initialize sample tournament and team data
import type { Team } from '../types/index.js';
import { createTeam, createTournament } from './firestore.js';

// Define tournament data type with Date objects (not Timestamps)
interface InitTournamentData {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  active: boolean;
  participatingTeams: string[];
  stages: {
    'Group Stage': { deadline: Date; maxPicks: number; pointValue: number; results: string[]; allowedTeams: string[], description: string };
    'Play-Ins': { deadline: Date; maxPicks: number; pointValue: number; results: string[]; allowedTeams: string[], description: string };
    'Finals Winner': { deadline: Date; maxPicks: number; pointValue: number; results: string[]; allowedTeams: string[], description: string };
  };
}

// Sample LCK teams data
const lckTeams: Team[] = [
  {
    id: 't1',
    name: 'T1',
    shortName: 'T1',
    logo: '/logos/t1.png',
    active: true
  },
  {
    id: 'geng',
    name: 'Gen.G',
    shortName: 'GEN',
    logo: '/logos/geng.png',
    active: true
  },
  {
    id: 'hle',
    name: 'Hanwha Life Esports',
    shortName: 'HLE',
    logo: '/logos/hle.png',
    active: true
  },
  {
    id: 'kt',
    name: 'KT Rolster',
    shortName: 'KT',
    logo: '/logos/kt.png',
    active: true
  },
  {
    id: 'dk',
    name: 'Dplus KIA',
    shortName: 'DK',
    logo: '/logos/dk.png',
    active: true
  },
  {
    id: 'dns',
    name: 'DN SOOPers',
    shortName: 'DNS',
    logo: '/logos/dns.png',
    active: true
  },
  {
    id: 'drx',
    name: 'DRX',
    shortName: 'DRX',
    logo: '/logos/drx.png',
    active: true
  },
  {
    id: 'brion',
    name: 'HANJIN BRION',
    shortName: 'BRO',
    logo: '/logos/brion.png',
    active: true
  },
  {
    id: 'ns',
    name: 'Nongshim RedForce',
    shortName: 'NS',
    logo: '/logos/ns.png',
    active: true
  },
  {
    id: 'bnk',
    name: 'BNK FEARX',
    shortName: 'BNK',
    logo: '/logos/bnk.png',
    active: true
  }
];

// Sample tournament data
const sampleTournament: InitTournamentData = {
  id: 'lck-cup-2026',
  name: 'LCK Cup 2026',
  description: 'Kickoff Tournament',
  startDate: new Date('2026-01-14'),
  endDate: new Date('2026-02-25'),
  active: true,
  participatingTeams: [
    't1', 'geng', 'hle', 'kt', 'dk',
    'dns', 'drx', 'brion', 'ns', 'bnk'
  ],
  stages: {
    'Play-Ins': {
      deadline: new Date('2026-02-05T00:00:00'),
      description: 'Choose the 3 teams that will get through to the Playoffs stage',
      allowedTeams: [],
      maxPicks: 3,
      pointValue: 5,
      results: [] // Will be filled when play-ins conclude
    },
    'Finals Winner': {
      deadline: new Date('2026-02-10T00:00:00'),
      description: 'Choose the overall winner of the LCK Cup 2026',
      maxPicks: 1,
      pointValue: 15,
      allowedTeams: [],
      results: [] // Will be filled when semifinals conclude
    },
    'Group Stage': {
      deadline: new Date('2026-01-14T00:00:00'),
      description: 'Choose the top three teams that will lock directly into Playoffs',
      allowedTeams: [],
      maxPicks: 3,
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

