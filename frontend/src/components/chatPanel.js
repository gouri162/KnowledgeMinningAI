import { marked } from 'marked';
import { wrapUnfencedMermaid, buildMermaidContainerHtml } from './diagramRenderer.js';
import { getMotionRobotHtml } from './motionRobot.js';

export function getRobotAvatarHtml(size = 38, isHero = false) {
  return getMotionRobotHtml(size, isHero);
}

marked.setOptions({
  gfm: true,
  breaks: true
});

marked.use({
  renderer: {
    code(token) {
      const codeText = token.text || '';
      const lang = (token.lang || '').toLowerCase().trim();
      const isDiagram =
        lang === 'mermaid' ||
        lang === 'flowchart' ||
        lang === 'graph' ||
        /^(?:flowchart|graph)\s+(?:TD|TB|BT|RL|LR)\b/m.test(codeText.trim()) ||
        /^(?:sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|gantt|mindmap)\b/m.test(codeText.trim());

      if (isDiagram) {
        return buildMermaidContainerHtml(codeText);
      }

      // Default code block rendering
      const cleanLang = lang ? `language-${escapeHtml(lang)}` : '';
      return `
        <div class="code-snippet-block">
          <div class="code-snippet-header">
            <span class="code-lang-tag">${escapeHtml(lang || 'code')}</span>
            <button class="btn-copy-code" data-code="${encodeURIComponent(codeText)}" title="Copy code">Copy</button>
          </div>
          <pre><code class="${cleanLang}">${escapeHtml(codeText)}</code></pre>
        </div>
      `;
    }
  }
});

function renderMarkdown(text) {
  if (!text) return '';
  // 1. Wrap raw/unfenced flowcharts into ```mermaid blocks
  let s = wrapUnfencedMermaid(text);
  // 2. Normalize markdown tables so they are surrounded by blank lines if attached to text
  s = s.replace(/([^\n])\n(\|[^\n]+\|\n\|[- :|]+\|)/g, '$1\n\n$2');
  s = s.replace(/(\|[^\n]+\|)\n([^\|\n\s][^\n]*)/g, '$1\n\n$2');
  try {
    const raw = marked.parse(s);
    return raw
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
  } catch (e) {
    console.error('Markdown parse error:', e);
    return escapeHtml(text);
  }
}

export function renderChatPanel(messages, isStreaming = false) {
  const hasUserMessages = messages.some(msg => msg.role === 'user');

  return `
    <main class="chat-workspace-panel ${!hasUserMessages ? 'is-hero-state' : ''}">
      <!-- Scrollable Message Stream -->
      <div class="chat-messages-container" id="chat-messages-container">
        ${!hasUserMessages ? `
          <!-- Centered Hero Greeting (No box, utilizes full screen) -->
          <div class="greeting-hero-wrap">
            <div class="greeting-sparkle-icon">
              ${getRobotAvatarHtml(64, true)}
            </div>
            <h1 class="greeting-hero-heading">Hello! This is ConsultAI, how can I help you?</h1>
          </div>
        ` : `
          ${messages.filter(msg => !msg.isGreeting).map((msg, idx) => renderMessageRow(msg, idx)).join('')}
        `}

        ${isStreaming ? `
          <div class="message-row-assistant">
            <div class="assistant-msg-avatar" title="ConsultAI Robot Assistant">
              ${getRobotAvatarHtml(36)}
            </div>
            <div class="streaming-bubble">
              <span class="streaming-dot"></span>
              <span class="streaming-dot"></span>
              <span class="streaming-dot"></span>
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

function renderMessageRow(msg, idx) {
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
          <span class="msg-timestamp">${msg.timestamp || 'Just now'}</span>
        </div>
      </div>
    `;
  }

  // If initial greeting placeholder, do not render inside active conversation
  if (msg.isGreeting) {
    return '';
  }

  // Regular assistant message
  const answer = msg.answer || msg.content || '';
  const explanation = msg.explanation || '';
  const sources = msg.sources || [];
  const timestamp = msg.timestamp || 'Just now';

  return `
    <div class="message-row-assistant">
      <div class="assistant-msg-avatar" title="ConsultAI Robot Assistant">
        ${getRobotAvatarHtml(36)}
      </div>

      <div class="assistant-msg-content-wrap">
        <!-- Assistant Header -->
        <div class="assistant-header-line">
          <div class="assistant-header-left">
            <span class="assistant-name">ConsultAI</span>
            <span class="execution-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Ready</span>
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
            <div class="answer-text">${renderMarkdown(answer)}</div>
          </div>
        ` : ''}

        <!-- Section 2: Explanation -->
        ${explanation ? `
          <div class="explanation-section-card">
            <div class="section-label-row">
              <div class="section-label-icon-blue">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <span class="section-label-title">Explanation</span>
            </div>
            <div class="explanation-text">${renderMarkdown(explanation)}</div>
          </div>
        ` : ''}

        <!-- Section 3: Sources -->
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
              <button class="source-pill-btn btn-view-doc" data-doc-name="${s.name || s}" title="View document">
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
            <button class="action-icon-btn btn-like" title="Helpful">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
            </button>
            <button class="action-icon-btn btn-dislike" title="Not helpful">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
              </svg>
            </button>
            <button class="action-icon-btn btn-copy" title="Copy" data-copy-text="${escapeForAttr(`${answer}\n\n${explanation}`)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
          <button class="btn-regenerate" data-msg-idx="${idx}" title="Regenerate">
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
