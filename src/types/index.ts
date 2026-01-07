// TypeScript type definitions for LCK Pickems App

import { Timestamp } from 'firebase/firestore';

// User types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
}

// Team types
export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  active: boolean;
}

// Tournament stage configuration
export interface TournamentStage {
  deadline: Timestamp;
  maxPicks: number;
  pointValue: number;
  results: string[];
  description?: string;
  allowedTeams?: string[];
}

// Tournament types
export interface Tournament {
  id: string;
  name: string;
  description?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  active: boolean;
  participatingTeams: string[];
  stages: Record<string, TournamentStage>;
  createdAt?: Timestamp;
  picks?: UserPicks[];
}

// User picks for a tournament
export interface UserPicks {
  uid: string;
  picks: Record<string, string[]>;
  totalPoints: number;
  lastUpdated: Timestamp;
  pointsCalculated?: boolean;
}

// Leaderboard entry
export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  totalPoints: number;
  createdAt?: Timestamp; // Submission/Last update time for the picks (used for tie-breaking)
}

// Points calculation types
export interface StagePointsBreakdown {
  picks: string[] | string | null;
  results: string[];
  correctPicks: string[];
  points: number;
  maxPoints: number;
}

export interface PointsBreakdown {
  stages: {
    [stageName: string]: StagePointsBreakdown;
  };
  total: number;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PointsUpdateResult {
  success: boolean;
  points?: number;
  previousPoints?: number;
  error?: string;
}

export interface BulkPointsUpdateResult {
  success: boolean;
  updatedCount?: number;
  totalUsers?: number;
  updates?: Array<{
    userId: string;
    previousPoints: number;
    newPoints: number;
  }>;
  error?: string;
}

export interface LeaderboardWithUserPosition {
  leaderboard: LeaderboardEntry[];
  userRank: number | null;
  userInTop: boolean;
}

// Validation types
export interface PickValidationResult {
  valid: boolean;
  errors: string[];
}

// Tournament stage names
export type TournamentStageName = string;

// Firebase Auth user type (simplified)
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Public user profile type
export interface PublicUserProfile {
  uid: string;
  displayName: string;
  createdAt: Timestamp;
}