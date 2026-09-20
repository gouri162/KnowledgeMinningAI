export function renderWorkflowPanel(workflowState, referencedDocs, allDocsCount = 0) {
  const docs = (referencedDocs && referencedDocs.length > 0)
    ? referencedDocs
    : [];

  return `
    <aside class="workflow-workspace-panel">
      <!-- Widget 1: Referenced Documents -->
      <div class="referenced-docs-card">
        <div class="referenced-docs-header">
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <span class="referenced-main-title">Referenced Documents</span>
            <span class="badge-count">${docs.length}</span>
          </div>
          <a href="#" class="ref-view-all-link" id="link-view-all-docs">
            <span>Knowledge Base</span>
            <span>→</span>
          </a>
        </div>

        <div class="referenced-docs-list">
          ${docs.length > 0 ? docs.map(doc => `
            <div class="referenced-doc-row">
              <div class="ref-doc-left">
                <div class="pdf-icon-badge">PDF</div>
                <div class="ref-doc-info">
                  <span class="ref-doc-filename" title="${doc.name}">${doc.name}</span>
                  <span class="ref-doc-usage">${doc.description || 'Used for answer generation'}</span>
                </div>
              </div>
              <button class="ref-open-link btn-view-doc" data-doc-name="${doc.name}" title="View Document">
                <span>Open</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </button>
            </div>
          `).join('') : `
            <div style="padding:1.5rem 1rem;text-align:center;color:var(--color-text-muted);font-size:0.8rem;background:#F8FAFC;border-radius:var(--radius-md);border:1px dashed #CBD5E1;">
              <div style="font-size:1.4rem;margin-bottom:0.35rem;">📚</div>
              <div style="font-weight:600;color:var(--color-text-main);margin-bottom:0.2rem;">No documents referenced yet</div>
              <span>Ask a business query to retrieve context from Supabase</span>
            </div>
          `}
        </div>
      </div>

      <!-- Widget 2: Knowledge Base Connection Status -->
      <div class="kb-status-card">
        <div class="kb-status-header">
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <div class="kb-status-indicator"></div>
            <span style="font-weight:700;font-size:0.85rem;color:var(--color-text-main);">Supabase Vector Store</span>
          </div>
          <span style="font-size:0.7rem;font-weight:600;color:#059669;background:#ECFDF5;padding:0.15rem 0.45rem;border-radius:9999px;border:1px solid #A7F3D0;">Live</span>
        </div>
        <div class="kb-status-details">
          <div class="kb-detail-row">
            <span class="kb-detail-label">Model:</span>
            <span class="kb-detail-val">text-embedding-3-small</span>
          </div>
          <div class="kb-detail-row">
            <span class="kb-detail-label">Similarity:</span>
            <span class="kb-detail-val">Cosine Metric (1536 dim)</span>
          </div>
        </div>
      </div>

      <!-- Widget 3: Quote Card -->
      <div class="quote-widget-card">
        <div class="quote-lightbulb-circle">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18h6"></path>
            <path d="M10 22h4"></path>
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
          </svg>
        </div>
        <div class="quote-widget-text">
          "Better questions lead to brighter solutions."
        </div>
        
        <svg class="quote-wave-bg" viewBox="0 0 140 45" fill="none">
          <path d="M0 25 Q 35 10, 70 20 T 140 15 L 140 45 L 0 45 Z" fill="#93C5FD" opacity="0.4"/>
          <path d="M0 32 Q 40 22, 80 28 T 140 22 L 140 45 L 0 45 Z" fill="#60A5FA" opacity="0.6"/>
        </svg>
      </div>
    </aside>
  `;
}
