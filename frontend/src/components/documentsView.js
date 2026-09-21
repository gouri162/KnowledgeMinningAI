export function renderDocumentsView(documents = [], isUploading = false) {
  return `
    <div class="full-tab-workspace">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <h1 class="tab-header-title">Document Knowledge Base</h1>
          <p class="tab-header-desc">Manage business PDFs indexed in Supabase vector store for semantic retrieval and RAG analysis.</p>
        </div>
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <button id="btn-refresh-docs" class="btn-action-secondary" title="Refresh document list from Supabase">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            <span>Sync</span>
          </button>
          <button id="btn-purge-vector" class="btn-action-danger" title="Purge all embeddings from Supabase vector store">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>Purge Vector Store</span>
          </button>
        </div>
      </div>

      <!-- Upload Dropzone -->
      <div class="docs-upload-dropzone ${isUploading ? 'uploading' : ''}" id="docs-tab-dropzone" role="button" tabindex="0">
        <input type="file" id="docs-tab-file-input" accept=".pdf,.png,.jpg,.jpeg,.webp" style="display:none;" />
        ${isUploading ? `
          <div class="upload-spinner-icon">⏳</div>
          <div style="font-weight:700;font-size:1.05rem;color:var(--color-brand-blue);margin-top:0.4rem;">
            Uploading & Extracting Document into Supabase...
          </div>
          <div style="font-size:0.8rem;color:var(--color-text-muted);margin-top:0.25rem;">
            Extracting text with Azure OpenAI Vision & generating vector embeddings
          </div>
        ` : `
          <div style="font-size:2.4rem;margin-bottom:0.4rem;">📁</div>
          <div style="font-weight:700;font-size:1.05rem;color:var(--color-text-main);">
            Click or Drag & Drop PDF or Image to Index
          </div>
          <div style="font-size:0.8rem;color:var(--color-text-muted);margin-top:0.25rem;">
            PDF documents, PNG, JPG, WEBP images, timetables, certificates, notes
          </div>
        `}
      </div>

      <!-- Header & Count -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.5rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <span style="font-weight:700;font-size:0.95rem;color:var(--color-text-main);">
            Active Indexed Documents & Images
          </span>
          <span class="badge-count">${documents.length}</span>
        </div>
        <span style="font-size:0.75rem;color:var(--color-text-muted);">
          Indexed in Supabase <code style="font-size:0.72rem;background:#F1F5F9;padding:0.1rem 0.35rem;border-radius:4px;">documents</code> table
        </span>
      </div>

      <!-- Documents Grid List -->
      <div class="docs-grid-list">
        ${documents.length > 0 ? documents.map(d => {
          const isImg = d.type === 'image' || /\.(png|jpe?g|webp|bmp)$/i.test(d.name);
          return `
          <div class="doc-grid-card">
            <div class="doc-card-main-info">
              <span class="${isImg ? 'img-icon-badge' : 'pdf-icon-badge'}">${isImg ? 'IMG' : 'PDF'}</span>
              <div class="doc-card-text">
                <div class="doc-card-name" title="${d.name}">${d.name}</div>
                <div class="doc-card-chunks">${d.chunks || 1} vector chunks indexed</div>
              </div>
            </div>
            
            <div class="doc-card-actions">
              <button class="doc-action-open btn-view-doc" data-doc-name="${d.name}" title="Open and view document content">
                <span>Open</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </button>
              <button class="doc-action-delete btn-delete-single-doc" data-doc-name="${d.name}" title="Delete document from Supabase">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        `}).join('') : `
          <div class="docs-empty-state">
            <div style="font-size:2rem;margin-bottom:0.5rem;">📂</div>
            <div style="font-weight:700;font-size:1rem;color:var(--color-text-main);margin-bottom:0.25rem;">
              No documents currently indexed
            </div>
            <p style="color:var(--color-text-muted);font-size:0.84rem;max-width:380px;margin:0 auto 1rem auto;">
              Upload your first PDF or image document above. It will be parsed and embedded in Supabase vector store for live AI search and consultation.
            </p>
          </div>
        `}
      </div>
    </div>
  `;
}
