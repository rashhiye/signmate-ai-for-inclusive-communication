/**
 * Accessibility (a11y) helper utilities
 */

export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const containerId = priority === 'assertive' ? 'a11y-assertive-announcer' : 'a11y-polite-announcer';
  let announcer = document.getElementById(containerId);

  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = containerId;
    announcer.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  }

  // Clear and update with slight delay to ensure screen readers announce
  announcer.textContent = '';
  setTimeout(() => {
    if (announcer) {
      announcer.textContent = message;
    }
  }, 50);
}
