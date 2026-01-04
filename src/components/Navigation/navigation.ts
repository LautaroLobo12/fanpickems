import { onAuthStateChanged, signOut, type User as AuthUser } from 'firebase/auth';
import { auth } from '../../scripts/firebase';

function initializeNavigation() {
  const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement | null;
  const userAvatar = document.getElementById('user-avatar') as HTMLImageElement | null;
  const userName = document.getElementById('user-name') as HTMLElement | null;

  if (!logoutBtn || !userAvatar || !userName) {
    // Elements might not be present on all pages, so we don't log an error.
    return;
  }

  // Handle logout
  logoutBtn.addEventListener('click', async () => {
    logoutBtn.disabled = true;
    logoutBtn.textContent = 'Logging out...';

    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      logoutBtn.disabled = false;
      logoutBtn.textContent = 'Logout';
      // Consider a more user-friendly notification instead of alert()
      alert('Logout failed. Please try again.');
    }
  });

  // Update user info when auth state changes
  onAuthStateChanged(auth, (user: AuthUser | null) => {
    if (user) {
      userName.textContent = user.displayName || user.email || 'User';
      if (user.photoURL) {
        userAvatar.src = user.photoURL;
        userAvatar.style.display = 'block';
      } else {
        userAvatar.style.display = 'none';
      }
    } else {
      // Not logged in, or session expired.
      // The AuthGuard component should handle redirection to the login page.
      // We can hide user-specific elements here if needed.
      userName.textContent = '';
      userAvatar.style.display = 'none';
    }
  });
}

initializeNavigation();

function initializeScrollNavbar() {
  const navbar = document.querySelector('.navbar') as HTMLElement | null;
  if (!navbar) return;

  let lastScrollY = window.scrollY;

  const handleScroll = () => {
    if (window.innerWidth <= 768) {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        navbar.classList.add('navbar-hidden');
      } else {
        navbar.classList.remove('navbar-hidden');
      }
      lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
    } else {
      navbar.classList.remove('navbar-hidden');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
}

initializeScrollNavbar();