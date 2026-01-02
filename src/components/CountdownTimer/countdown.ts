class CountdownTimer {
  element: HTMLElement;
  deadline: Date;
  stageName: string;
  textElement: HTMLElement | null;
  interval?: number;

  constructor(element: HTMLElement) {
    this.element = element;
    this.deadline = new Date(element.dataset.deadline as string);
    this.stageName = element.dataset.stage as string;
    this.textElement = element.querySelector('.countdown-text');
    
    if (this.textElement) {
        this.updateTimer();
        this.interval = window.setInterval(() => this.updateTimer(), 1000);
    } else {
        console.error("Countdown timer text element not found for", element);
    }
  }
  
  updateTimer() {
    const now = new Date();
    const timeRemaining = this.deadline.getTime() - now.getTime();
    
    if (timeRemaining <= 0) {
      if (this.textElement) {
        this.textElement.textContent = 'Picks Closed';
      }
      this.element.classList.add('expired');
      if (this.interval) {
        window.clearInterval(this.interval);
      }
      return;
    }
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    if (this.textElement) {
        if (days > 0) {
            this.textElement.textContent = `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            this.textElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
        } else {
            this.textElement.textContent = `${minutes}m ${seconds}s`;
        }
    }
    
    // Add urgency classes
    if (timeRemaining < 60 * 60 * 1000) { // Less than 1 hour
      this.element.classList.add('urgent');
    } else if (timeRemaining < 24 * 60 * 60 * 1000) { // Less than 1 day
      this.element.classList.add('warning');
    }
  }
  
  destroy() {
    if (this.interval) {
      window.clearInterval(this.interval);
    }
  }
}

// Initialize all countdown timers on the page
document.addEventListener('DOMContentLoaded', () => {
  const timers = document.querySelectorAll('.countdown-timer');
  timers.forEach(timer => {
    new CountdownTimer(timer as HTMLElement)
  });
});