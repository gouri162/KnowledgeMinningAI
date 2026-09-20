export function renderConsultingBanner() {
  return `
    <div class="consulting-banner-card">
      <div class="banner-left-content">
        <h1 class="banner-headline">Your Intelligent Consulting Assistant</h1>
        <p class="banner-subheadline">Ask questions. Get insights. Make better decisions.</p>
        
        <div class="banner-feature-cards-row">
          <div class="banner-feature-card" data-prompt="Find answers from your documents for strategic decisions">
            <div class="feature-card-icon-box" style="background:#EFF6FF; color:#2563EB;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div class="feature-card-texts">
              <span class="feature-card-title">Find Answers</span>
              <span class="feature-card-desc">from your documents</span>
            </div>
          </div>

          <div class="banner-feature-card" data-prompt="Analyze key strategic insights and drivers">
            <div class="feature-card-icon-box" style="background:#F5F3FF; color:#8B5CF6;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="feature-card-texts">
              <span class="feature-card-title">Analyze</span>
              <span class="feature-card-desc">key insights</span>
            </div>
          </div>

          <div class="banner-feature-card" data-prompt="Get recommendations for actionable next steps">
            <div class="feature-card-icon-box" style="background:#ECFDF5; color:#10B981;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </div>
            <div class="feature-card-texts">
              <span class="feature-card-title">Get Recommendations</span>
              <span class="feature-card-desc">for actionable steps</span>
            </div>
          </div>

          <div class="banner-feature-card" data-prompt="How can I save time and optimize operational efficiency?">
            <div class="feature-card-icon-box" style="background:#FFF7ED; color:#F97316;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
            <div class="feature-card-texts">
              <span class="feature-card-title">Save Time</span>
              <span class="feature-card-desc">and work smarter</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mountain Graphic & Italic Quote -->
      <div class="banner-right-mountain">
        <span class="banner-quote-text">"Insights today.<br>Better decisions tomorrow."</span>
        <svg class="banner-mountain-art" viewBox="0 0 240 70" fill="none">
          <path d="M0 65 L45 28 L90 52 L145 15 L200 48 L240 32 L240 70 L0 70 Z" fill="#93C5FD" opacity="0.5"/>
          <path d="M30 65 L80 35 L125 58 L170 24 L220 54 L240 45 L240 70 L0 70 Z" fill="#60A5FA" opacity="0.8"/>
          <path d="M70 65 L115 42 L160 62 L200 38 L240 58 L240 70 L0 70 Z" fill="#3B82F6" opacity="0.9"/>
        </svg>
      </div>
    </div>
  `;
}

export function renderChatPanel(messages, isStreaming = false) {
  return `
    <main class="chat-workspace-panel">
      <!-- Scrollable Message Stream -->
      <div class="chat-messages-container" id="chat-messages-container">
        <!-- Messages Stream -->
        ${messages.map(msg => renderMessageRow(msg)).join('')}

        ${isStreaming ? `
          <div class="message-row-assistant">
            <div class="assistant-msg-avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
              </svg>
            </div>
            <div class="assistant-msg-content-wrap">
              <div class="assistant-header-line">
                <div class="assistant-header-left">
                  <span class="assistant-name">ConsultAI</span>
                  <span class="execution-badge" style="background:#EFF6FF; border-color:#BFDBFE; color:#1D4ED8;">
                    <span style="display:inline-block;width:6px;height:6px;background:#2563EB;border-radius:50%;margin-right:4px;animation:pulse 1s infinite;"></span>
                    Executing Workflow...
                  </span>
                </div>
              </div>
              <div style="color:var(--color-text-muted);font-size:0.88rem;padding:0.4rem 0;">
                ConsultAI executive engine analyzing query across RAG pipeline & Azure OpenAI...
              </div>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Bottom Dock: Input Pill + Suggestion Chips -->
      <div class="chat-bottom-dock">
        <div class="input-pill-wrapper">
          <input type="file" id="pdf-file-picker" accept=".pdf" style="display: none;" />
          <button class="btn-input-attach" id="btn-attach-doc" title="Attach PDF document">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
          </button>
          
          <input 
            type="text" 
            class="chat-text-input" 
            id="chat-user-input" 
            placeholder="Ask a question or upload a document..." 
            autocomplete="off"
          />
          
          <button class="btn-send-message" id="btn-send-message" title="Send question">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>

        <!-- Quick Chips under Input -->
        <div class="quick-suggestion-chips-row">
          <button class="quick-chip" data-prompt="CSE-AIFT - 3D mo first class">
            <span class="chip-icon">📅</span>
            <span>CSE-AIFT - 3D Monday first class</span>
          </button>
          <button class="quick-chip" data-prompt="What classes are on Wednesday for 3D?">
            <span class="chip-icon">🕒</span>
            <span>Wednesday 3D classes</span>
          </button>
          <button class="quick-chip" data-prompt="What documents are available in the knowledge base?">
            <span class="chip-icon">📄</span>
            <span>Knowledge Base documents</span>
          </button>
          <button class="quick-chip" data-prompt="Who teaches OOP in CSE-AIFT - 3D?">
            <span class="chip-icon">🎓</span>
            <span>Who teaches OOP?</span>
          </button>
        </div>
      </div>
    </main>
  `;
}

function renderMessageRow(msg) {
  if (msg.role === 'user') {
    return `
      <div class="message-row-user">
        <div class="user-msg-avatar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="user-msg-content-wrap">
          <div class="user-bubble">${escapeHtml(msg.content)}</div>
          <span class="msg-timestamp">${msg.timestamp || '10:24 AM'}</span>
        </div>
      </div>
    `;
  }

  const timestamp = msg.timestamp || '10:24 AM';

  // Greeting message when new chat starts
  if (msg.isGreeting) {
    return `
      <div class="message-row-assistant greeting-message-row">
        <div class="assistant-msg-avatar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
          </svg>
        </div>
        <div class="assistant-msg-content-wrap">
          <div class="assistant-header-line">
            <div class="assistant-header-left">
              <span class="assistant-name">ConsultAI</span>
              <span class="execution-badge" style="background:#ECFDF5; border-color:#A7F3D0; color:#065F46;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Ready</span>
              </span>
            </div>
            <span class="msg-timestamp">${timestamp}</span>
          </div>

          <div class="greeting-hero-card">
            <div class="greeting-hero-header">
              <span class="greeting-hero-badge">AI Assistant</span>
              <h2 class="greeting-hero-title">Hello! This is ConsultAI, how can I help you?</h2>
            </div>
            <p class="greeting-hero-desc">
              ConsultAI is your intelligent assistant powered by <strong>Azure OpenAI</strong> and <strong>Supabase Vector Knowledge Base</strong>. You can ask me questions about your academic timetables, upload reports, or extract precise insights.
            </p>
            <div class="greeting-hero-features">
              <div class="greeting-feature-pill">
                <span class="feature-icon">📅</span>
                <span><strong>Timetables & Batches:</strong> Ask about periods, times, rooms, and teachers (e.g. <em>"CSE-AIFT - 3D mo first class"</em>).</span>
              </div>
              <div class="greeting-feature-pill">
                <span class="feature-icon">📄</span>
                <span><strong>Document Intelligence:</strong> Analyze PDF reports, circulars, and course materials.</span>
              </div>
              <div class="greeting-feature-pill">
                <span class="feature-icon">⚡</span>
                <span><strong>Instant Precision:</strong> Direct answers, verbatim citations, and schedule lookups.</span>
              </div>
            </div>
            <div class="greeting-quick-action-note">
              <span>💡 Ask any question below or click an example chip to begin:</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Assistant message matching reference image exactly
  const answer = msg.answer || msg.content || '';
  const explanation = msg.explanation || '';
  const sources = msg.sources || [];
  const duration = msg.duration || '12s';

  return `
    <div class="message-row-assistant">
      <div class="assistant-msg-avatar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/>
        </svg>
      </div>

      <div class="assistant-msg-content-wrap">
        <!-- Card Header: ConsultAI + Completed badge + Timestamp -->
        <div class="assistant-header-line">
          <div class="assistant-header-left">
            <span class="assistant-name">ConsultAI</span>
            <span class="execution-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Completed</span>
            </span>
          </div>
          <span class="msg-timestamp">${timestamp}</span>
        </div>

        <!-- Section 1: Answer -->
        ${answer ? `
          <div class="answer-section-card">
            <div class="section-label-row">
              <div class="section-label-icon-green">✓</div>
              <span class="section-label-title">Answer</span>
            </div>
            <div class="answer-text">${escapeHtml(answer)}</div>
          </div>
        ` : ''}

        <!-- Section 2: Explanation -->
        ${explanation ? `
          <div class="explanation-section-card">
            <div class="section-label-row">
              <div class="section-label-icon-blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
              </div>
              <span class="section-label-title">Explanation</span>
            </div>
            <div class="explanation-text">${escapeHtml(explanation)}</div>
          </div>
        ` : ''}

        <!-- Section 3: Source -->
        ${sources && sources.length > 0 ? `
          <div class="source-section-row">
            <span class="source-label-text">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <span>Source</span>
            </span>
            ${sources.map(s => `
              <button class="source-pill-btn btn-view-doc" data-doc-name="${s.name || s}" title="View document in viewer">
                <span>${s.name || s}</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </button>
            `).join('')}
          </div>
        ` : ''}

        <!-- Action Buttons Footer -->
        <div class="assistant-card-footer">
          <div class="assistant-actions-left">
            <button class="action-icon-btn btn-like" title="Helpful answer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
            </button>
            <button class="action-icon-btn btn-dislike" title="Not helpful">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
              </svg>
            </button>
            <button class="action-icon-btn btn-copy" title="Copy answer" data-copy-text="${escapeForAttr(`${answer}\n\n${explanation}`)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            <button class="action-icon-btn btn-share" title="Share insight">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
          </div>

          <button class="btn-regenerate" id="btn-regenerate-chat" title="Regenerate this response">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            <span>Regenerate</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}

function escapeForAttr(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
}

