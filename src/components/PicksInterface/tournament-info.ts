import { getCurrentTournament } from '../../scripts/services/picks-service.js';
import type { Tournament } from '../../types';

function initializePicksPage() {
    const tournamentInfo = document.getElementById('tournament-info') as HTMLDivElement | null;

    if (!tournamentInfo) {
        console.error('Tournament info element not found in the DOM.');
        return;
    }

    const loadTournamentInfo = async () => {
        try {
            const tournament: Tournament | null = await getCurrentTournament();

            if (!tournament) {
                tournamentInfo.innerHTML = `
                    <div class="no-tournament">
                        <h3>No Active Tournament</h3>
                        <p>There are currently no active tournaments. Check back later!</p>
                    </div>`;
                return;
            }

            tournamentInfo.innerHTML = `
                <div class="tournament-card">
                    <h2>${tournament.name}</h2>
                    <div class="tournament-dates">
                        <span class="date-range">
                            ${new Date(tournament.startDate.seconds * 1000).toLocaleDateString()} - 
                            ${new Date(tournament.endDate.seconds * 1000).toLocaleDateString()}
                        </span>
                    </div>
                    <div class="tournament-status">
                        <span class="status-badge active">Active Tournament</span>
                    </div>
                </div>`;
        } catch (error) {
            console.error('Error loading tournament:', error);
            tournamentInfo.innerHTML = `
                <div class="error">
                    <p>Error loading tournament information. Please refresh the page.</p>
                </div>`;
        }
    };

    loadTournamentInfo();
}

initializePicksPage();