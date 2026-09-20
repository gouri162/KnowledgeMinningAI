export function renderTopNav() {
  return `
    <header class="app-top-header">
      <!-- Search Documents Input -->
      <div class="header-search-bar">
        <span class="header-search-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <input 
          type="text" 
          class="header-search-input" 
          id="global-search-input" 
          placeholder="Search documents..." 
          autocomplete="off"
        />
      </div>

      <!-- Action Icons: Notifications & Profile -->
      <div class="header-actions-group">
        <button class="header-icon-btn" id="btn-notifications" title="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span class="notification-badge-dot"></span>
        </button>

        <div class="header-user-profile" id="btn-user-profile">
          <div class="header-avatar-circle">U</div>
          <span class="header-username">User</span>
          <svg class="header-chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </header>
  `;
}

