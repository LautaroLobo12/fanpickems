// Picks interface functionality
import { onAuthStateChanged } from 'firebase/auth';
import type { AuthUser, Team, Tournament, UserPicks } from '../../types';
import { auth } from '../../scripts/firebase';
import { getCurrentTournament, getTeamsFromIds, getUserPicksForTournament, saveUserPicks, validatePicks } from '../../scripts/services/picks-service';

interface PicksState {
  tournament: Tournament | null;
  teams: Team[];
  userPicks: UserPicks | null;
  currentUser: AuthUser | null;
  selectedPicks: Record<string, string[]>;
}

class PicksInterface {
  private state: PicksState = {
    tournament: null,
    teams: [],
    userPicks: null,
    currentUser: null,
    selectedPicks: {}
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

      // Initialize selectedPicks structure based on tournament stages
      // This ensures we have a valid array for every stage defined in the tournament
      this.state.selectedPicks = {};
      Object.keys(tournament.stages).forEach(stageName => {
        this.state.selectedPicks[stageName] = [];
      });

      // Get teams for tournament
      const teams = await getTeamsFromIds(tournament.participatingTeams);
      this.state.teams = teams;

      // Get user's existing picks
      if (this.state.currentUser) {
        const userPicks = await getUserPicksForTournament(tournament.id, this.state.currentUser.uid);
        this.state.userPicks = userPicks;

        if (userPicks && userPicks.picks) {
          // Merge user picks into state
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
    const stages = Object.entries(tournament.stages)
      .sort(([, a], [, b]) => a.deadline.seconds - b.deadline.seconds);

    const stagesHTML = stages.map(([stageName, stageConfig]) => {
      const isDeadlinePassed = new Date() > new Date(stageConfig.deadline.seconds * 1000);
      const maxPicks = stageConfig.maxPicks;
      const pointValue = stageConfig.pointValue;
      const currentPicks = this.state.selectedPicks[stageName as keyof typeof this.state.selectedPicks];
      const currentPickCount = Array.isArray(currentPicks) ? currentPicks.length : (currentPicks ? 1 : 0);
      const isComplete = currentPickCount === maxPicks;
      const description = stageConfig.description;

      let statusBadge = '';
      if (isDeadlinePassed) {
        statusBadge = '<span class="status-badge closed">Locked</span>';
      } else if (isComplete) {
        statusBadge = '<span class="status-badge complete">Complete</span>';
      } else if (currentPickCount > 0) {
        statusBadge = '<span class="status-badge in-progress">In Progress</span>';
      } else {
        statusBadge = '<span class="status-badge open">Open</span>';
      }

      return `
        <div class="stage-section ${isDeadlinePassed ? 'stage-locked' : ''}">
          <div class="stage-header">
            <div class="header-top">
              <div class="stage-title-group">
                <h3>${this.formatStageName(stageName)}</h3>
                ${description ? `<span class="stage-description">- ${description}</span>` : ''}
              </div>
              ${statusBadge}
            </div>
            <div class="stage-info">
              <span class="info-item"><i class="icon">📝</i> Pick ${maxPicks}</span>
              <span class="info-item"><i class="icon">💎</i> ${pointValue} pts</span>
              <span class="info-item"><i class="icon">⏰</i> ${this.formatDeadline(stageConfig.deadline)}</span>
            </div>
            <div class="pick-progress-bar">
              <div class="progress-fill" style="width: ${(currentPickCount / maxPicks) * 100}%"></div>
            </div>
            <div class="pick-counter">
              ${currentPickCount} / ${maxPicks} Selected
            </div>
          </div>
          
          <div class="teams-grid ${isDeadlinePassed ? 'disabled' : ''}" data-stage="${stageName}" data-max-picks="${maxPicks}">
            ${this.renderTeamsForStage(stageName, isDeadlinePassed, stageConfig)}
          </div>
        </div>
      `;
    }).join('');

    this.elements.container.innerHTML = `
      <div class="picks-content">
        <div class="tournament-header">
          <h2>${tournament.name}</h2>
          ${tournament.description ? `<p class="tournament-desc">${tournament.description}</p>` : ''}
          
          <div class="tournament-meta">
            <div class="tournament-dates">
              <span class="date-range">
                ${new Date(tournament.startDate.seconds * 1000).toLocaleDateString()} - 
                ${new Date(tournament.endDate.seconds * 1000).toLocaleDateString()}
              </span>
            </div>
            <div class="tournament-status">
              <span class="status-badge active">Active Tournament</span>
            </div>
          </div>
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

  private renderTeamsForStage(stageName: string, isDisabled: boolean, stageConfig: any): string {
    // Filter teams if allowedTeams is specified
    const teamsToDisplay = stageConfig.allowedTeams && stageConfig.allowedTeams.length > 0
      ? this.state.teams.filter(team => stageConfig.allowedTeams.includes(team.id))
      : this.state.teams;

    if (teamsToDisplay.length === 0) {
      return `<div style="grid-column: 1 / -1; text-align: center; color: #666; padding: 2rem;">No teams available for this stage yet.</div>`;
    }

    return teamsToDisplay.map(team => {
      const currentPicks = this.state.selectedPicks[stageName as keyof typeof this.state.selectedPicks];
      const isSelected = Array.isArray(currentPicks)
        ? currentPicks.includes(team.id)
        : currentPicks === team.id;

      // Generate initials for placeholder
      const initials = team.name.substring(0, 2).toUpperCase();

      return `
        <div class="team-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}" 
             data-team-id="${team.id}" 
             data-stage="${stageName}">
          <div class="selection-indicator">✓</div>
          <div class="team-logo-container">
            ${team.logo ?
          `<img class="team-logo-img" src="${team.logo}" alt="${team.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
           <div class="team-logo-placeholder" style="display: none;">${initials}</div>` :
          `<div class="team-logo-placeholder random-bg">${initials}</div>`
        }
          </div>
          <div class="team-info">
            <div class="team-name team-name-full" title="${team.name}">${team.name}</div>
            <div class="team-name team-name-short" title="${team.name}">${team.shortName || team.name.substring(0, 3).toUpperCase()}</div>
          </div>
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

    // if (maxPicks === 1) {
    //   // Single selection (finals)
    //   // Deselect all other teams in this stage
    //   stageGrid.querySelectorAll('.team-card').forEach(card => {
    //     card.classList.remove('selected');
    //   });

    //   // Select this team
    //   teamCard.classList.add('selected');
    //   this.state.selectedPicks[stageName].push(teamId);
    // } else {
    // Multiple selection (other stages)
    const currentPicks = this.state.selectedPicks[stageName] || [];
    const isSelected = teamCard.classList.contains('selected');

    if (isSelected) {
      // Deselect team
      teamCard.classList.remove('selected');
      const index = currentPicks.indexOf(teamId);
      if (index > -1) {
        this.state.selectedPicks[stageName].splice(index, 1);
      }
    } else {
      // Select team (if under limit)
      if (currentPicks.length < maxPicks) {
        teamCard.classList.add('selected');
        this.state.selectedPicks[stageName].push(teamId);
      } else {
        // Show message about limit
        this.showSaveStatus(`You can only select ${maxPicks} teams for ${this.formatStageName(stageName)}`, 'error');
        return;
      }

    }

    this.updatePickSummary(stageName);
    this.updateSaveButton();
  }

  private updatePickSummary(stageName: string) {
    const stageSection = document.querySelector(`[data-stage="${stageName}"]`)?.closest('.stage-section');
    if (!stageSection || !this.state.tournament) return;

    const counter = stageSection.querySelector('.pick-counter');
    const progressFill = stageSection.querySelector('.progress-fill') as HTMLElement;
    const headerTop = stageSection.querySelector('.header-top');

    const maxPicks = this.state.tournament.stages[stageName as keyof typeof this.state.tournament.stages].maxPicks;
    const currentPicks = this.state.selectedPicks[stageName as keyof typeof this.state.selectedPicks];
    const currentCount = Array.isArray(currentPicks) ? currentPicks.length : (currentPicks ? 1 : 0);
    const isComplete = currentCount === maxPicks;

    // Update counter text
    if (counter) {
      counter.textContent = `${currentCount} / ${maxPicks} Selected`;
    }

    // Update progress bar
    if (progressFill) {
      progressFill.style.width = `${(currentCount / maxPicks) * 100}%`;
    }

    // Update status badge
    if (headerTop) {
      const existingBadge = headerTop.querySelector('.status-badge');
      if (existingBadge) {
        existingBadge.remove();
      }

      let statusBadge = '';
      if (isComplete) {
        statusBadge = '<span class="status-badge complete">Complete</span>';
      } else if (currentCount > 0) {
        statusBadge = '<span class="status-badge in-progress">In Progress</span>';
      } else {
        statusBadge = '<span class="status-badge open">Open</span>';
      }

      headerTop.insertAdjacentHTML('beforeend', statusBadge);
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

    // Check if user has made at least one pick in any stage
    return Object.values(this.state.selectedPicks).some(picks =>
      Array.isArray(picks) && picks.length > 0
    );
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
      const isNew = !this.state.userPicks;
      const result = await saveUserPicks(
        this.state.tournament.id,
        this.state.currentUser.uid,
        this.state.selectedPicks,
        isNew
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