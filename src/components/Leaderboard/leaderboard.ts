import { onAuthStateChanged, type User as AuthUser } from 'firebase/auth';
import { auth } from '../../scripts/firebase';
import { getLeaderboardWithUserPosition } from '../../scripts/services/leaderboard-service';
import { getCurrentTournament } from '../../scripts/services/picks-service';
import type { LeaderboardEntry, Tournament } from '../../types';

function initializeLeaderboard() {
  const loading = document.getElementById('loading') as HTMLElement | null;
  const leaderboardContent = document.getElementById('leaderboard-content') as HTMLElement | null;
  const errorMessage = document.getElementById('error-message') as HTMLElement | null;
  const tournamentName = document.getElementById('tournament-name') as HTMLElement | null;
  const leaderboardList = document.getElementById('leaderboard-list') as HTMLElement | null;
  const userPosition = document.getElementById('user-position') as HTMLElement | null;
  const userRankInfo = document.getElementById('user-rank-info') as HTMLElement | null;

  if (!loading || !leaderboardContent || !errorMessage || !tournamentName || !leaderboardList || !userPosition || !userRankInfo) {
    console.error('One or more leaderboard elements are missing from the DOM.');
    return;
  }

  let currentUser: AuthUser | null = null;

  const setVisibility = (element: HTMLElement, visible: boolean) => {
    element.style.display = visible ? 'block' : 'none';
  };

  const loadLeaderboard = async () => {
    try {
      setVisibility(loading, true);
      setVisibility(leaderboardContent, false);
      setVisibility(errorMessage, false);

      const tournament: Tournament | null = await getCurrentTournament();
      if (!tournament) {
        throw new Error('No active tournament found');
      }

      tournamentName.textContent = `${tournament.name} - Top 5`;

      const userId = currentUser?.uid;
      const result = await getLeaderboardWithUserPosition(tournament.id, userId ?? '', 5);

      displayLeaderboard(result.leaderboard);

      if (userId && result.userRank) {
        displayUserPosition(result.userRank, result.userInTop);
      }

      setVisibility(loading, false);
      setVisibility(leaderboardContent, true);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setVisibility(loading, false);
      setVisibility(errorMessage, true);
    }
  };

  const displayLeaderboard = (leaderboard: LeaderboardEntry[]) => {
    if (leaderboard.length === 0) {
      leaderboardList.innerHTML = '<div class="no-data">No picks submitted yet</div>';
      return;
    }

    const leaderboardHTML = leaderboard.map((entry, index) => {
      const rank = index + 1;
      const medal = getRankMedal(rank);
      const displayName = entry.displayName || 'Anonymous';

      return `
        <div class="leaderboard-entry ${rank <= 3 ? 'top-three' : ''}">
          <div class="rank">
            ${medal ? `<span class="medal">${medal}</span>` : `<span class="rank-number">${rank}</span>`}
          </div>
          <div class="leaderboard-user-info">
            <span class="display-name">${displayName}</span>
          </div>
          <div class="points">
            <span class="points-value">${entry.totalPoints}</span>
            <span class="points-label">pts</span>
          </div>
        </div>
      `;
    }).join('');

    leaderboardList.innerHTML = leaderboardHTML;
  };

  const displayUserPosition = (userRank: number, userInTop: boolean) => {
    if (userInTop) {
      userRankInfo.innerHTML = `
        <div class="user-in-top">
          <span class="congrats">🎉 You're in the top 5!</span>
        </div>
      `;
    } else {
      userRankInfo.innerHTML = `
        <div class="user-rank">
          <span class="rank-text">Your rank: #${userRank}</span>
          <span class="encouragement">Keep predicting to climb the leaderboard!</span>
        </div>
      `;
    }

    setVisibility(userPosition, true);
  };

  const getRankMedal = (rank: number): string | null => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    loadLeaderboard();
  });

  setInterval(loadLeaderboard, 30000);
}

// Run the script
initializeLeaderboard();