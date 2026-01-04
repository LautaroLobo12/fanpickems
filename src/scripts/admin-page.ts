import { onAuthStateChanged, type User as AuthUser } from 'firebase/auth';
import { auth } from '../scripts/firebase';
import { initializeAllData, initializeTeams, initializeTournament, type InitTournamentData } from '../scripts/initializeData';



type InitTeamsResult = { success: boolean; count?: number; error?: string };
type InitTournamentResult = { success: boolean; tournament?: InitTournamentData; error?: string };
type InitAllResult = { success: boolean; teamsCount?: number; tournament?: InitTournamentData; error?: string };

function initializeAdminPage() {
    const ADMIN_EMAIL = import.meta.env.PUBLIC_ADMIN_EMAIL;

    const statusArea = document.getElementById('status') as HTMLDivElement | null;
    const adminCheck = document.getElementById('admin-check') as HTMLDivElement | null;
    const adminContent = document.getElementById('admin-content') as HTMLDivElement | null;
    const accessDenied = document.getElementById('access-denied') as HTMLDivElement | null;
    const initTeamsBtn = document.getElementById('init-teams') as HTMLButtonElement | null;
    const initTournamentBtn = document.getElementById('init-tournament') as HTMLButtonElement | null;
    const initAllBtn = document.getElementById('init-all') as HTMLButtonElement | null;

    if (!statusArea || !adminCheck || !adminContent || !accessDenied || !initTeamsBtn || !initTournamentBtn || !initAllBtn) {
        console.error('One or more admin page elements are missing from the DOM.');
        return;
    }

    const showStatus = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        statusArea.innerHTML = `<div class="status ${type}">${message}</div>`;
    };

    const checkAdminAccess = (user: AuthUser | null): boolean => {
        if (!user) {
            window.location.href = '/';
            return false;
        }

        if (user.email === ADMIN_EMAIL) {
            adminCheck.style.display = 'none';
            adminContent.style.display = 'block';
            return true;
        } else {
            adminCheck.style.display = 'none';
            accessDenied.style.display = 'block';
            return false;
        }
    };

    onAuthStateChanged(auth, (user) => {
        if (checkAdminAccess(user)) {
            // Add event listeners only if user is admin
            initTeamsBtn.addEventListener('click', async () => {
                showStatus('Initializing teams...', 'info');
                const result: InitTeamsResult = await initializeTeams();
                if (result.success) {
                    showStatus(`Successfully initialized ${result.count} teams!`, 'success');
                } else {
                    showStatus(`Error: ${result.error}`, 'error');
                }
            });

            initTournamentBtn.addEventListener('click', async () => {
                showStatus('Initializing tournament...', 'info');
                const result: InitTournamentResult = await initializeTournament();
                if (result.success && result.tournament) {
                    showStatus(`Successfully initialized tournament: ${result.tournament.name}!`, 'success');
                } else {
                    showStatus(`Error: ${result.error}`, 'error');
                }
            });

            initAllBtn.addEventListener('click', async () => {
                showStatus('Initializing all data...', 'info');
                const result: InitAllResult = await initializeAllData();
                if (result.success && result.tournament) {
                    showStatus(`Successfully initialized ${result.teamsCount} teams and tournament: ${result.tournament.name}!`, 'success');
                } else {
                    showStatus(`Error: ${result.error}`, 'error');
                }
            });
        }
    });
}

initializeAdminPage();