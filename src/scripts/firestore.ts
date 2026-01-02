// Firestore data operations for tournament-scoped collections
import type { LeaderboardEntry, Team, Tournament, User, UserPicks } from '@/types';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  documentId
} from 'firebase/firestore';
import type { DocumentData, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore/lite';
import { db } from './firebase';

// Users Collection Operations
export const createUser = async (uid: string, email: string, displayName: string): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  const publicUserRef = doc(db, 'publicUserProfiles', uid); // New: reference to public profile

  await setDoc(userRef, {
    uid,
    email,
    displayName,
    createdAt: serverTimestamp()
  });

  // New: Create public user profile
  await setDoc(publicUserRef, {
    uid,
    displayName,
    createdAt: serverTimestamp()
  });
};

export const getUser = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap: DocumentSnapshot<DocumentData> = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() as User : null;
};

// New: Public User Profile Operations
export const getPublicUserProfile = async (uid: string): Promise<{ uid: string; displayName: string; createdAt: any } | null> => {
  const publicUserRef = doc(db, 'publicUserProfiles', uid);
  const publicUserSnap: DocumentSnapshot<DocumentData> = await getDoc(publicUserRef);
  return publicUserSnap.exists() ? publicUserSnap.data() as { uid: string; displayName: string; createdAt: any } : null;
};

// Tournaments Collection Operations
export const createTournament = async (tournamentData: Omit<Tournament, 'createdAt'>): Promise<void> => {
  const tournamentRef = doc(db, 'tournaments', tournamentData.id);
  await setDoc(tournamentRef, {
    ...tournamentData,
    createdAt: serverTimestamp()
  });
};

export const getTournament = async (tournamentId: string): Promise<Tournament | null> => {
  const tournamentRef = doc(db, 'tournaments', tournamentId);
  const tournamentSnap: DocumentSnapshot<DocumentData> = await getDoc(tournamentRef);
  return tournamentSnap.exists() ? tournamentSnap.data() as Tournament : null;
};

export const getActiveTournament = async (): Promise<(Tournament & { id: string }) | null> => {
  const tournamentsRef = collection(db, 'tournaments');
  const q = query(tournamentsRef, where('active', '==', true), limit(1));
  const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const docSnap = querySnapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Tournament & { id: string };
};

export const updateTournamentResults = async (
  tournamentId: string,
  stage: string,
  results: string[]
): Promise<void> => {
  const tournamentRef = doc(db, 'tournaments', tournamentId);
  await updateDoc(tournamentRef, {
    [`stages.${stage}.results`]: results
  });
};

// Tournament Picks Operations (Subcollection)
export const savePicks = async (
  tournamentId: string,
  uid: string,
  picks: UserPicks['picks']
): Promise<void> => {
  const picksRef = doc(db, 'tournaments', tournamentId, 'picks', uid);
  await setDoc(picksRef, {
    uid,
    picks,
    totalPoints: 0, // Will be calculated when results are available
    lastUpdated: serverTimestamp()
  }, { merge: true });
};

export const getUserPicks = async (tournamentId: string, uid: string): Promise<UserPicks | null> => {
  const picksRef = doc(db, 'tournaments', tournamentId, 'picks', uid);
  const picksSnap: DocumentSnapshot<DocumentData> = await getDoc(picksRef);
  return picksSnap.exists() ? picksSnap.data() as UserPicks : null;
};

export const getTournamentLeaderboard = async (
  tournamentId: string,
  limitCount: number = 5
): Promise<LeaderboardEntry[]> => {
  const picksRef = collection(db, 'tournaments', tournamentId, 'picks');
  const q = query(picksRef, orderBy('totalPoints', 'desc'), limit(limitCount));
  const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

  const leaderboard: LeaderboardEntry[] = [];
  for (const docSnap of querySnapshot.docs) {
    const pickData = docSnap.data() as UserPicks;
    // Get public user info for display name
    const publicUserData = await getPublicUserProfile(pickData.uid);
    leaderboard.push({
      uid: pickData.uid,
      displayName: publicUserData?.displayName || 'Unknown User',
      totalPoints: pickData.totalPoints,
      createdAt: publicUserData?.createdAt // Use createdAt from public profile for leaderboard entry
    });
  }

  return leaderboard;
};

// Teams Collection Operations
export const createTeam = async (teamData: Team): Promise<void> => {
  const teamRef = doc(db, 'teams', teamData.id);
  await setDoc(teamRef, teamData);
};

export const getTeam = async (teamId: string): Promise<Team | null> => {
  const teamRef = doc(db, 'teams', teamId);
  const teamSnap: DocumentSnapshot<DocumentData> = await getDoc(teamRef);
  return teamSnap.exists() ? teamSnap.data() as Team : null;
};

export const getAllTeams = async (): Promise<Team[]> => {
  const teamsRef = collection(db, 'teams');
  const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(teamsRef);

  const teams: Team[] = [];
  querySnapshot.forEach((doc) => {
    teams.push({ id: doc.id, ...doc.data() } as Team);
  });

  return teams;
};

export const getActiveTeams = async (): Promise<Team[]> => {
  const teamsRef = collection(db, 'teams');
  const q = query(teamsRef, where('active', '==', true));
  const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

  const teams: Team[] = [];
  querySnapshot.forEach((doc) => {
    teams.push({ id: doc.id, ...doc.data() } as Team);
  });

  return teams;
};

export const getTournamentTeams = async (tournamentId: string): Promise<Team[]> => {
  const tournament = await getTournament(tournamentId);
  if (!tournament || !tournament.participatingTeams) {
    return [];
  }

  return getTeamsByIds(tournament.participatingTeams);
};

export const getTeamsByIds = async (teamIds: string[]): Promise<Team[]> => {
  if (!teamIds || teamIds.length === 0) return [];

  // Firestore 'in' query is limited to 10 items
  const chunks = [];
  for (let i = 0; i < teamIds.length; i += 10) {
    chunks.push(teamIds.slice(i, i + 10));
  }

  const promises = chunks.map(chunk => {
    const teamsRef = collection(db, 'teams');
    const q = query(teamsRef, where(documentId(), 'in', chunk));
    return getDocs(q);
  });

  const snapshots = await Promise.all(promises);
  const teams: Team[] = [];

  snapshots.forEach(snap => {
    snap.forEach(doc => {
      teams.push({ id: doc.id, ...doc.data() } as Team);
    });
  });

  return teams;
};