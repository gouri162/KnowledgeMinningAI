// ── SLEEK TOAST NOTIFICATION & CONFIRMATION DIALOG SYSTEM ──

let toastContainer = null;

function ensureToastContainer() {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-notification-container';
    toastContainer.className = 'toast-notification-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/**
 * Show a modern toast notification
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.message
 * @param {'success'|'error'|'info'|'warning'|'loading'} [options.type='success']
 * @param {number} [options.duration=4500]
 * @returns {Function} dismiss function
 */
export function showToast({ title, message, type = 'success', duration = 4500 }) {
  const container = ensureToastContainer();

  const toast = document.createElement('div');
  toast.className = `custom-toast toast-${type}`;

  const icons = {
    success: `
      <div class="toast-icon-wrapper toast-icon-success">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>`,
    error: `
      <div class="toast-icon-wrapper toast-icon-error">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>`,
    info: `
      <div class="toast-icon-wrapper toast-icon-info">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>`,
    loading: `
      <div class="toast-icon-wrapper toast-icon-loading">
        <svg class="toast-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"></circle>
        </svg>
      </div>`,
    warning: `
      <div class="toast-icon-wrapper toast-icon-warning">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>`
  };

  toast.innerHTML = `
    ${icons[type] || icons.info}
    <div class="toast-text-content">
      ${title ? `<div class="toast-title">${escapeHtml(title)}</div>` : ''}
      <div class="toast-message">${escapeHtml(message)}</div>
    </div>
    <button class="toast-close-btn" title="Close">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    ${duration > 0 ? `<div class="toast-progress-bar" style="animation-duration: ${duration}ms;"></div>` : ''}
  `;

  const dismiss = () => {
    toast.classList.add('toast-dismissing');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 280);
  };

  toast.querySelector('.toast-close-btn').addEventListener('click', dismiss);

  container.appendChild(toast);

  // Trigger entering transition
  requestAnimationFrame(() => {
    toast.classList.add('toast-visible');
  });

  if (duration > 0) {
    setTimeout(dismiss, duration);
  }

  return dismiss;
}

/**
 * Modern Confirmation Dialog to replace window.confirm
 */
export function showConfirmDialog({
  title = 'Confirmation',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  onConfirm = () => {}
}) {
  const existing = document.getElementById('custom-confirm-modal-backdrop');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'custom-confirm-modal-backdrop';
  backdrop.className = 'custom-confirm-backdrop';

  backdrop.innerHTML = `
    <div class="custom-confirm-card">
      <div class="confirm-icon-box ${isDanger ? 'confirm-danger' : 'confirm-info'}">
        ${isDanger ? `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        ` : `
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        `}
      </div>
      <div class="confirm-content">
        <h3 class="confirm-title">${escapeHtml(title)}</h3>
        <p class="confirm-desc">${escapeHtml(message)}</p>
      </div>
      <div class="confirm-actions">
        <button class="confirm-btn-cancel" id="confirm-btn-cancel">${escapeHtml(cancelText)}</button>
        <button class="confirm-btn-action ${isDanger ? 'confirm-btn-danger' : 'confirm-btn-primary'}" id="confirm-btn-ok">
          ${escapeHtml(confirmText)}
        </button>
      </div>
    </div>
  `;

  const closeDialog = () => {
    backdrop.classList.add('fade-out');
    setTimeout(() => {
      if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
    }, 200);
  };

  backdrop.querySelector('#confirm-btn-cancel').addEventListener('click', closeDialog);
  backdrop.querySelector('#confirm-btn-ok').addEventListener('click', () => {
    closeDialog();
    if (typeof onConfirm === 'function') onConfirm();
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeDialog();
  });

  document.body.appendChild(backdrop);
  requestAnimationFrame(() => {
    backdrop.classList.add('visible');
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
