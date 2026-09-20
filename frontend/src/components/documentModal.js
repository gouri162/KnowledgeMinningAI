export function renderDocumentModal(docModalState) {
  if (!docModalState || !docModalState.isOpen) return '';

  const { filename, chunks_count, content, isLoading, error } = docModalState;

  return `
    <div class="modal-backdrop" id="doc-modal-backdrop">
      <div class="doc-viewer-modal" role="dialog" aria-modal="true">
        <!-- Modal Header -->
        <div class="doc-modal-header">
          <div class="doc-modal-header-left">
            <div class="pdf-icon-badge" style="font-size:0.75rem;padding:0.25rem 0.55rem;">PDF</div>
            <div class="doc-modal-title-wrap">
              <h3 class="doc-modal-filename" title="${filename}">${filename}</h3>
              <div class="doc-modal-meta">
                ${chunks_count !== undefined ? `<span class="doc-modal-pill">${chunks_count} Vector Chunks</span>` : ''}
                <span class="doc-modal-pill-green">Stored in Supabase</span>
              </div>
            </div>
          </div>
          
          <div class="doc-modal-header-actions">
            ${content ? `
              <button class="doc-modal-btn-copy" id="btn-modal-copy-text" title="Copy document text">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Copy Text</span>
              </button>
            ` : ''}
            <button class="doc-modal-btn-close" id="btn-modal-close" title="Close modal (Esc)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="doc-modal-body">
          ${isLoading ? `
            <div class="doc-modal-loading">
              <div class="spinner-circle"></div>
              <span>Fetching document chunks from Supabase...</span>
            </div>
          ` : error ? `
            <div class="doc-modal-error">
              <div style="font-size:1.5rem;margin-bottom:0.5rem;">⚠️</div>
              <p>${error}</p>
            </div>
          ` : `
            <div class="doc-modal-content-area">
              <div class="doc-modal-search-bar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" id="doc-modal-filter-input" placeholder="Search within document text..." />
              </div>
              <div class="doc-content-text" id="doc-modal-text-content">${escapeHtml(content)}</div>
            </div>
          `}
        </div>

        <!-- Modal Footer -->
        <div class="doc-modal-footer">
          <span style="font-size:0.75rem;color:var(--color-text-muted);">
            Parsed via PyMuPDF & Azure OpenAI Vision and indexed into PostgreSQL pgvector
          </span>
          <button class="btn-action-secondary" id="btn-modal-close-footer" style="padding:0.4rem 0.9rem;font-size:0.8rem;">
            Close
          </button>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
