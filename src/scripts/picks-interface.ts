// Picks interface functionality
import { onAuthStateChanged } from 'firebase/auth';
import type { AuthUser, Team, Tournament, UserPicks } from '../types';
import { auth } from './firebase';
import { getCurrentTournament, getTeamsForTournament, getUserPicksForTournament, saveUserPicks, validatePicks } from './picks';

interface PicksState {
  tournament: Tournament | null;
  teams: Team[];
  userPicks: UserPicks | null;
  currentUser: AuthUser | null;
  selectedPicks: {
    playoffs: string[];
    playins: string[];
    semifinals: string[];
    finals: string;
  };
}

class PicksInterface {
  private state: PicksState = {
    tournament: null,
    teams: [],
    userPicks: null,
    currentUser: null,
    selectedPicks: {
      playoffs: [],
      playins: [],
      semifinals: [],
      finals: ''
    }
  };

  private elements = {
    container: document.getElementById('picks-interface') as HTMLElement,
    loading: null as HTMLElement | null,
    content: null as HTMLElement | null,
    saveBtn: null as HTMLButtonElement | null,
    saveStatus: null as HTMLElement | null
  };

  constructor() {
    this.init();
  }

  private async init() {
    // Wait for auth state
    onAuthStateChanged(auth, async (user) => {
      this.state.currentUser = user as AuthUser;
      if (user) {
        await this.loadTournamentData();
      } else {
        this.showError('Please log in to make picks');
      }
    });
  }

  private async loadTournamentData() {
    try {
      this.showLoading();

      // Get current tournament
      const tournament = await getCurrentTournament();
      if (!tournament) {
        this.showNoTournament();
        return;
      }

      this.state.tournament = tournament;

      // Get teams for tournament
      const teams = await getTeamsForTournament(tournament.id);
      this.state.teams = teams;

      // Get user's existing picks
      if (this.state.currentUser) {
        const userPicks = await getUserPicksForTournament(tournament.id, this.state.currentUser.uid);
        this.state.userPicks = userPicks;
        
        if (userPicks && userPicks.picks) {
          this.state.selectedPicks = { 
            ...this.state.selectedPicks,
            ...userPicks.picks 
          };
        }
      }

      this.renderPicksInterface();
    } catch (error) {
      console.error('Error loading tournament data:', error);
      this.showError('Failed to load tournament data. Please try again.');
    }
  }

  private showLoading() {
    this.elements.container.innerHTML = `
      <div class="loading-picks">
        <div class="loading-spinner"></div>
        <p>Loading tournament picks...</p>
      </div>
    `;
  }

  private showError(message: string) {
    this.elements.container.innerHTML = `
      <div class="error">
        <h3>Error</h3>
        <p>${message}</p>
        <button onclick="location.reload()" class="retry-btn">Try Again</button>
      </div>
    `;
  }

  private showNoTournament() {
    this.elements.container.innerHTML = `
      <div class="no-tournament">
        <h3>No Active Tournament</h3>
        <p>There are currently no active tournaments available for picks.</p>
        <p>Check back later when a new tournament starts!</p>
      </div>
    `;
  }

  private renderPicksInterface() {
    if (!this.state.tournament || !this.state.teams.length) {
      this.showError('Tournament data not available');
      return;
    }

    const tournament = this.state.tournament;
    const stages = Object.entries(tournament.stages);

    const stagesHTML = stages.map(([stageName, stageConfig]) => {
      const isDeadlinePassed = new Date() > new Date(stageConfig.deadline.seconds * 1000);
      const maxPicks = stageConfig.maxPicks;
      const pointValue = stageConfig.pointValue;
      const currentPicks = this.state.selectedPicks[stageName as keyof typeof this.state.selectedPicks];
      const currentPickCount = Array.isArray(currentPicks) ? currentPicks.length : (currentPicks ? 1 : 0);

      return `
        <div class="stage-section">
          <div class="stage-header">
            <h3>${this.formatStageName(stageName)}</h3>
            <div class="stage-info">
              <span class="pick-count">Pick ${maxPicks} team${maxPicks > 1 ? 's' : ''}</span>
              <span class="points-value">${pointValue} point${pointValue > 1 ? 's' : ''} each</span>
              <span class="deadline">Deadline: ${this.formatDeadline(stageConfig.deadline)}</span>
              ${isDeadlinePassed ? '<span class="deadline-passed">Deadline Passed</span>' : ''}
            </div>
          </div>
          
          <div class="teams-grid ${isDeadlinePassed ? 'disabled' : ''}" data-stage="${stageName}" data-max-picks="${maxPicks}">
            ${this.renderTeamsForStage(stageName, isDeadlinePassed)}
          </div>
          
          <div class="pick-summary">
            Selected: ${currentPickCount}/${maxPicks}
          </div>
        </div>
      `;
    }).join('');

    this.elements.container.innerHTML = `
      <div class="picks-content">
        <div class="tournament-header">
          <h2>${tournament.name}</h2>
          <p>Make your predictions for each tournament stage</p>
        </div>
        
        ${stagesHTML}
        
        <div class="picks-actions">
          <button id="save-picks-btn" class="save-btn" ${this.canSavePicks() ? '' : 'disabled'}>
            Save Picks
          </button>
          <div id="save-status" class="save-status"></div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  private renderTeamsForStage(stageName: string, isDisabled: boolean): string {
    return this.state.teams.map(team => {
      const currentPicks = this.state.selectedPicks[stageName as keyof typeof this.state.selectedPicks];
      const isSelected = Array.isArray(currentPicks) 
        ? currentPicks.includes(team.id)
        : currentPicks === team.id;

      return `
        <div class="team-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}" 
             data-team-id="${team.id}" 
             data-stage="${stageName}">
          <div class="team-logo">
            ${team.logo ? 
              `<img src="${team.logo}" alt="${team.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
               <div class="team-name-fallback" style="display: none;">${team.name.substring(0, 3).toUpperCase()}</div>` :
              `<div class="team-name-fallback">${team.name.substring(0, 3).toUpperCase()}</div>`
            }
          </div>
          <div class="team-name">${team.name}</div>
        </div>
      `;
    }).join('');
  }

  private bindEvents() {
    // Team selection events
    this.elements.container.addEventListener('click', (e) => {
      const teamCard = (e.target as HTMLElement).closest('.team-card');
      if (teamCard && !teamCard.classList.contains('disabled')) {
        this.handleTeamSelection(teamCard as HTMLElement);
      }
    });

    // Save button event
    const saveBtn = document.getElementById('save-picks-btn') as HTMLButtonElement;
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.savePicks());
    }
  }

  private handleTeamSelection(teamCard: HTMLElement) {
    const teamId = teamCard.dataset.teamId!;
    const stageName = teamCard.dataset.stage! as keyof typeof this.state.selectedPicks;
    const stageGrid = teamCard.parentElement!;
    const maxPicks = parseInt(stageGrid.dataset.maxPicks!);

    if (maxPicks === 1) {
      // Single selection (finals)
      // Deselect all other teams in this stage
      stageGrid.querySelectorAll('.team-card').forEach(card => {
        card.classList.remove('selected');
      });
      
      // Select this team
      teamCard.classList.add('selected');
      this.state.selectedPicks[stageName] = teamId as any;
    } else {
      // Multiple selection (other stages)
      const currentPicks = this.state.selectedPicks[stageName] as string[];
      const isSelected = teamCard.classList.contains('selected');

      if (isSelected) {
        // Deselect team
        teamCard.classList.remove('selected');
        const index = currentPicks.indexOf(teamId);
        if (index > -1) {
          currentPicks.splice(index, 1);
        }
      } else {
        // Select team (if under limit)
        if (currentPicks.length < maxPicks) {
          teamCard.classList.add('selected');
          currentPicks.push(teamId);
        } else {
          // Show message about limit
          this.showSaveStatus(`You can only select ${maxPicks} teams for ${this.formatStageName(stageName)}`, 'error');
          return;
        }
      }
    }

    this.updatePickSummary(stageName);
    this.updateSaveButton();
  }

  private updatePickSummary(stageName: string) {
    const stageSection = document.querySelector(`[data-stage="${stageName}"]`)?.closest('.stage-section');
    const summary = stageSection?.querySelector('.pick-summary');
    if (summary && this.state.tournament) {
      const maxPicks = this.state.tournament.stages[stageName as keyof typeof this.state.tournament.stages].maxPicks;
      const currentPicks = this.state.selectedPicks[stageName as keyof typeof this.state.selectedPicks];
      const currentCount = Array.isArray(currentPicks) ? currentPicks.length : (currentPicks ? 1 : 0);
      
      summary.textContent = `Selected: ${currentCount}/${maxPicks}`;
    }
  }

  private updateSaveButton() {
    const saveBtn = document.getElementById('save-picks-btn') as HTMLButtonElement;
    if (saveBtn) {
      saveBtn.disabled = !this.canSavePicks();
    }
  }

  private canSavePicks(): boolean {
    if (!this.state.tournament || !this.state.currentUser) return false;

    // Check if user has made at least one pick
    const picks = this.state.selectedPicks;
    return picks.playoffs.length > 0 || picks.playins.length > 0 || 
           picks.semifinals.length > 0 || picks.finals.length > 0;
  }

  private async savePicks() {
    if (!this.state.tournament || !this.state.currentUser) return;

    const saveBtn = document.getElementById('save-picks-btn') as HTMLButtonElement;
    const originalText = saveBtn.textContent;
    
    try {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      // Validate picks
      const validation = validatePicks(this.state.selectedPicks, this.state.tournament);
      if (!validation.valid) {
        this.showSaveStatus(validation.errors.join(', '), 'error');
        return;
      }

      // Save picks
      const result = await saveUserPicks(
        this.state.tournament.id,
        this.state.currentUser.uid,
        this.state.selectedPicks
      );

      if (result.success) {
        this.showSaveStatus('Picks saved successfully!', 'success');
      } else {
        this.showSaveStatus(result.error || 'Failed to save picks', 'error');
      }
    } catch (error) {
      console.error('Error saving picks:', error);
      this.showSaveStatus('Failed to save picks. Please try again.', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = originalText;
    }
  }

  private showSaveStatus(message: string, type: 'success' | 'error') {
    const statusEl = document.getElementById('save-status');
    if (statusEl) {
      statusEl.innerHTML = `<div class="${type}">${message}</div>`;
      
      // Clear after 5 seconds
      setTimeout(() => {
        statusEl.innerHTML = '';
      }, 5000);
    }
  }

  private formatStageName(stageName: string): string {
    const names: Record<string, string> = {
      playoffs: 'Playoffs',
      playins: 'Play-ins',
      semifinals: 'Semifinals', 
      finals: 'Finals'
    };
    return names[stageName] || stageName;
  }

  private formatDeadline(deadline: any): string {
    const date = new Date(deadline.seconds * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

// Initialize picks interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PicksInterface();
});