/**
 * Global navigation utility functions that can be used anywhere in the application
 * These functions bypass React routing for direct window navigation
 */

/**
 * Navigates directly to the landing page (home page)
 * This function is safe to use anywhere in the application, including nested components
 * and will always work regardless of the current route or state
 */
export const goToLandingPage = () => {
  window.location.href = '/';
};

/**
 * Navigates directly to the auth page (login/register)
 */
export const goToAuthPage = () => {
  window.location.href = '/auth';
};

/**
 * Navigates directly to the dashboard page
 */
export const goToDashboard = () => {
  window.location.href = '/dashboard';
};

/**
 * Navigates to a specific tab on the dashboard
 */
export const goToDashboardTab = (tab: 'wedding' | 'vendors' | 'guests') => {
  window.location.href = `/dashboard?tab=${tab}`;
};