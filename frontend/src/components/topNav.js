export function renderTopNav(searchQuery = '') {
  return `
    <header class="app-top-header">
      <!-- Search Chats Input -->
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
          placeholder="Search chats..." 
          value="${searchQuery ? searchQuery.replace(/"/g, '&quot;') : ''}"
          autocomplete="off"
        />
      </div>

      <!-- Action Icons: Profile -->
      <div class="header-actions-group">
        <div class="header-user-profile" id="btn-user-profile">
          <div class="header-avatar-circle">U</div>
          <span class="header-username">User</span>
        </div>
      </div>
    </header>
  `;
}
