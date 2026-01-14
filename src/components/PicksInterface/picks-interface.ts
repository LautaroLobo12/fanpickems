// Picks interface functionality (client-side interaction)
import { onAuthStateChanged } from 'firebase/auth';
import type { AuthUser, Tournament } from '../../types'; // Removed Team, UserPicks as they are passed via data attributes
import { auth } from '../../scripts/firebase';
import { saveUserPicks, validatePicks, getUserPicksForTournament } from '../../scripts/services/picks-service';

interface PicksState {
  tournament: Tournament | null;
  teams: any[]; // Teams are now passed as any[] from data attribute
  currentUserUid: string | null; // Changed to uid only
  selectedPicks: Record<string, string[]>;
  originalPicks: Record<string, string[]>;
}

class PicksInterface {
  private state: PicksState = {
    tournament: null,
    teams: [],
    currentUserUid: null,
    selectedPicks: {},
    originalPicks: {}
  };

  private elements = {
    container: document.getElementById('picks-interface') as HTMLElement,
    saveBtn: null as HTMLButtonElement | null,
    saveStatus: null as HTMLElement | null
  };

  constructor() {
    const { tournament, teams, initialPicks, currentUserUid } = this.elements.container.dataset;

    if (tournament) this.state.tournament = JSON.parse(tournament);
    if (teams) this.state.teams = JSON.parse(teams);
    if (initialPicks) {
      this.state.selectedPicks = JSON.parse(initialPicks);
      this.state.originalPicks = JSON.parse(initialPicks);
    }
    if (currentUserUid !== undefined) this.state.currentUserUid = currentUserUid === 'null' ? null : currentUserUid; // Handle 'null' string

    this.init();
  }

  private init() {
    // If there's no tournament, the .astro component already rendered the appropriate message.
    if (!this.state.tournament) {
      return;
    }

    // Find the save button and status elements
    this.elements.saveBtn = document.getElementById('save-picks-btn') as HTMLButtonElement;
    this.elements.saveStatus = document.getElementById('save-status') as HTMLElement;

    // Initial update of the save button state and UI based on pre-rendered picks
    this.updateSaveButton();
    this.renderPicks();
    this.bindEvents();
  }

  // --- Event Handlers ---
  private bindEvents() {
    // Team selection events
    this.elements.container.addEventListener('click', (e) => {
      const teamCard = (e.target as HTMLElement).closest('.team-card');
      if (teamCard && !teamCard.classList.contains('disabled')) {
        this.handleTeamSelection(teamCard as HTMLElement);
      }
    });

    // Save button event
    if (this.elements.saveBtn) {
      this.elements.saveBtn.addEventListener('click', () => this.savePicks());
    }

    // Listen for auth state changes on client-side to potentially enable/disable functionality
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.state.currentUserUid = user.uid;
        // If user logs in after page load, enable save button and pick functionality if not already
        this.elements.container.querySelectorAll('.teams-grid.disabled').forEach(grid => {
          // Check if the parent stage is locked before re-enabling
          const stageSection = grid.closest('.stage-section');
          if (stageSection && !stageSection.classList.contains('stage-locked')) {
            grid.classList.remove('disabled'); // Removes pointer-events: none from grid
            // Remove disabled from individual team-cards within this grid
            grid.querySelectorAll('.team-card.disabled').forEach(card => {
              card.classList.remove('disabled'); // Re-enables cursor: pointer and clickability
            });
          }
        });
        if (this.elements.saveBtn) {
          this.elements.saveBtn.disabled = !this.canSavePicks();
        }

        // Fetch and apply user picks
        if (this.state.tournament) {
          getUserPicksForTournament(this.state.tournament.id, user.uid).then(userPicks => {
            if (userPicks) {
              this.state.selectedPicks = userPicks.picks || {};
              this.state.originalPicks = JSON.parse(JSON.stringify(userPicks.picks || {})); // Deep copy
              this.renderPicks();
            }
          });
        }
      } else {
        this.state.currentUserUid = null;
        // If user logs out, disable save button and pick functionality
        this.elements.container.querySelectorAll('.teams-grid').forEach(grid => {
          grid.classList.add('disabled');
        });
        if (this.elements.saveBtn) {
          this.elements.saveBtn.disabled = true;
        }
      }
    });
  }

  private handleTeamSelection(teamCard: HTMLElement) {
    if (!this.state.tournament || !this.state.currentUserUid) {
      // Should already be disabled, but a safety check
      return;
    }

    const teamId = teamCard.dataset.teamId!;
    const stageName = teamCard.dataset.stage!;
    const stageGrid = teamCard.parentElement!;
    const maxPicks = parseInt(stageGrid.dataset.maxPicks!);

    if (!this.state.selectedPicks[stageName]) {
      this.state.selectedPicks[stageName] = [];
    }
    const currentPicks = this.state.selectedPicks[stageName];
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
        this.showSaveStatus(`You can only select ${maxPicks} teams for this stage`, 'error');
        return;
      }
    }

    this.updatePickSummary(stageName);
    this.updateSaveButton();
  }

  // --- UI Updates ---
  private updatePickSummary(stageName: string) {
    const stageSection = this.elements.container.querySelector(`[data-stage-name="${stageName}"]`);
    if (!stageSection || !this.state.tournament) return;

    const counter = stageSection.querySelector('.pick-counter');
    const progressFill = stageSection.querySelector('.progress-fill') as HTMLElement;
    const headerTop = stageSection.querySelector('.header-top');
    const statusBadge = headerTop?.querySelector('.status-badge');

    const maxPicks = this.state.tournament.stages[stageName].maxPicks;
    const currentPicks = this.state.selectedPicks[stageName] || [];
    const currentCount = currentPicks.length;
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
    if (statusBadge) {
      let statusBadgeClass = '';
      let statusBadgeText = '';

      // Check if the stage is locked based on the stage-section class
      const isStageLocked = stageSection.classList.contains('stage-locked');

      if (isStageLocked) {
        statusBadgeClass = 'closed';
        statusBadgeText = 'Locked';
      } else if (isComplete) {
        statusBadgeClass = 'complete';
        statusBadgeText = 'Complete';
      } else if (currentCount > 0) {
        statusBadgeClass = 'in-progress';
        statusBadgeText = 'In Progress';
      } else {
        statusBadgeClass = 'open';
        statusBadgeText = 'Open';
      }

      // Remove all previous status classes and add the new one
      statusBadge.classList.remove('open', 'in-progress', 'complete', 'closed');
      statusBadge.classList.add(statusBadgeClass);
      statusBadge.textContent = statusBadgeText;
    }
  }

  private renderPicks() {
    if (!this.state.tournament) return;

    // Iterate through all stages in the UI
    const stageSections = this.elements.container.querySelectorAll('.stage-section');
    stageSections.forEach(section => {
      const stageName = (section as HTMLElement).dataset.stageName!;
      const picks = this.state.selectedPicks[stageName] || [];

      // Update team cards in this stage
      const teamCards = section.querySelectorAll('.team-card');
      teamCards.forEach(card => {
        const teamId = (card as HTMLElement).dataset.teamId!;
        if (picks.includes(teamId)) {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
      });

      // Update counter and progress bar
      this.updatePickSummary(stageName);
    });

    this.updateSaveButton();
  }

  private updateSaveButton() {
    if (this.elements.saveBtn) {
      this.elements.saveBtn.disabled = !this.canSavePicks();
    }
  }

  private canSavePicks(): boolean {
    if (!this.state.tournament || !this.state.currentUserUid) return false;

    // Check if user has made at least one pick in any stage
    return Object.values(this.state.selectedPicks).some(picks =>
      Array.isArray(picks) && picks.length > 0
    );
  }

  private async savePicks() {
    if (!this.state.tournament || !this.state.currentUserUid) return;

    const saveBtn = this.elements.saveBtn;
    if (!saveBtn) return; // Should not happen if init() works

    const originalText = saveBtn.textContent;

    try {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      // Validate picks
      const validation = validatePicks(this.state.selectedPicks, this.state.tournament, this.state.originalPicks);
      if (!validation.valid) {
        this.showSaveStatus(validation.errors.join(', '), 'error');
        return;
      }

      // Save picks
      // We don't have userPicks object from the server anymore, assume it's always an update if currentUserUid exists.
      // Firebase will create it if it doesn't exist.
      const result = await saveUserPicks(
        this.state.tournament.id,
        this.state.currentUserUid,
        this.state.selectedPicks,
        true // Always treat as potentially new or update (Firestore handles upsert)
      );

      if (result.success) {
        this.state.originalPicks = JSON.parse(JSON.stringify(this.state.selectedPicks)); // Update original picks on successful save
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
    const statusEl = this.elements.saveStatus;
    if (statusEl) {
      // Clear any existing timeout
      clearTimeout((statusEl as any).hideTimeout);

      statusEl.innerHTML = `<div class="${type}">${message}</div>`;

      // Clear after 5 seconds
      (statusEl as any).hideTimeout = setTimeout(() => {
        statusEl.innerHTML = '';
      }, 5000);
    }
  }
}

// Initialize picks interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PicksInterface();
});