import mermaid from 'mermaid';
import { generateWorkflowPngDataUrl, parseWorkflowDataFromText } from './workflowInfographic.js';

// Initialize Mermaid with clean, modern executive theme and pure SVG text for crisp rendering
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: '13px',
    primaryColor: '#EEF2FF',
    primaryTextColor: '#1E1B4B',
    primaryBorderColor: '#6366F1',
    lineColor: '#4F46E5',
    secondaryColor: '#F5F3FF',
    tertiaryColor: '#FFFFFF',
    mainBkg: '#FFFFFF',
    nodeBorder: '1.8px',
    clusterBkg: '#F8FAFC',
    clusterBorder: '#CBD5E1',
    titleColor: '#0F172A',
    edgeLabelBackground: '#FFFFFF',
    actorBorder: '#6366F1',
    actorBkg: '#EEF2FF'
  },
  flowchart: {
    htmlLabels: false, // Pure SVG text: scales sharply and allows instant canvas PNG rasterization
    curve: 'basis',
    useMaxWidth: true,
    padding: 16,
    nodeSpacing: 36,
    rankSpacing: 38
  },
  securityLevel: 'loose'
});

let diagramCounter = 0;

/**
 * Checks whether a line is a valid Mermaid statement
 */
function checkIsDiagramLine(trimmed) {
  if (!trimmed) return false;
  return (
    /(-->|---|==>|-\.->|--\s*[\w\s]+\s*-->|\.->|:=)/.test(trimmed) ||
    /^[A-Za-z0-9_]+\s*[[({>"']/.test(trimmed) ||
    /^(subgraph|end|click|style|classDef|class|direction|linkStyle)\b/i.test(trimmed) ||
    /^%%/.test(trimmed)
  );
}

/**
 * Automatically wraps raw flowchart text into ```mermaid ... ```
 */
export function wrapUnfencedMermaid(text) {
  if (!text) return '';
  if (/```(?:mermaid|flowchart)[\s\S]*?```/i.test(text)) {
    return text;
  }

  const lines = text.split('\n');
  let inDiagram = false;
  let diagramLines = [];
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!inDiagram) {
      if (/^(?:flowchart|graph)\s+(?:TD|TB|BT|RL|LR)\b/i.test(trimmed) ||
          /^(?:sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|gantt|mindmap)\b/i.test(trimmed)) {
        inDiagram = true;
        diagramLines = [line];
      } else {
        result.push(line);
      }
    } else {
      if (trimmed === '') {
        let nextIsDiagram = false;
        for (let j = i + 1; j < lines.length; j++) {
          const nextTrimmed = lines[j].trim();
          if (!nextTrimmed) continue;
          if (checkIsDiagramLine(nextTrimmed)) {
            nextIsDiagram = true;
          }
          break;
        }
        if (nextIsDiagram) {
          diagramLines.push(line);
        } else {
          inDiagram = false;
          result.push('```mermaid');
          result.push(diagramLines.join('\n').trim());
          result.push('```\n');
          diagramLines = [];
        }
      } else if (checkIsDiagramLine(trimmed)) {
        diagramLines.push(line);
      } else {
        inDiagram = false;
        result.push('```mermaid');
        result.push(diagramLines.join('\n').trim());
        result.push('```\n');
        result.push(line);
        diagramLines = [];
      }
    }
  }

  if (inDiagram && diagramLines.length > 0) {
    result.push('```mermaid');
    result.push(diagramLines.join('\n').trim());
    result.push('```\n');
  }

  return result.join('\n');
}

/**
 * Creates the HTML container placeholder for a diagram
 */
export function buildMermaidContainerHtml(rawCode) {
  const cleanCode = (rawCode || '').trim();
  const encoded = encodeURIComponent(cleanCode);
  const containerId = `wf_img_${Date.now()}_${++diagramCounter}`;

  return `
    <div class="workflow-image-card" id="${containerId}">
      <div class="workflow-image-placeholder" data-mermaid="${encoded}">
        <div class="workflow-generating-indicator">
          <div class="workflow-spinner"></div>
          <span>Generating visual workflow image…</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders all workflow diagrams directly into Image Format
 */
export async function renderAllDiagrams(scope = document) {
  const elements = scope.querySelectorAll('.workflow-image-placeholder:not([data-rendered="true"])');
  for (const el of elements) {
    const rawCode = decodeURIComponent(el.getAttribute('data-mermaid') || '');
    if (!rawCode.trim()) continue;

    try {
      const data = parseWorkflowDataFromText(rawCode);
      const imageUrl = await generateWorkflowPngDataUrl(data);

      el.setAttribute('data-rendered', 'true');
      el.innerHTML = `
        <div class="workflow-direct-image-wrap">
          <div class="workflow-image-header">
            <div class="workflow-header-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="3"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>${data.title} (Workflow Image)</span>
            </div>
            <div class="workflow-header-actions">
              <a href="${imageUrl}" download="${(data.title || 'study-workflow').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png" class="btn-workflow-action" title="Download Image">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Download Image</span>
              </a>
              <button class="btn-workflow-action btn-expand-img" data-img-src="${encodeURIComponent(imageUrl)}" title="View Fullscreen">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <polyline points="9 21 3 21 3 15"></polyline>
                  <line x1="21" y1="3" x2="14" y2="10"></line>
                  <line x1="3" y1="21" x2="10" y2="14"></line>
                </svg>
                <span>View Full</span>
              </button>
            </div>
          </div>
          <div class="workflow-img-container">
            <img 
              src="${imageUrl}" 
              alt="${data.title}" 
              class="workflow-image-element" 
              title="Click to view in high-resolution"
            />
          </div>
        </div>
      `;
    } catch (err) {
      console.warn('Workflow image rendering error:', err);
      el.setAttribute('data-rendered', 'error');
      el.innerHTML = `
        <div class="workflow-error-fallback">
          <div class="workflow-error-title">Workflow Diagram</div>
          <pre><code>${escapeHtml(rawCode)}</code></pre>
        </div>
      `;
    }
  }

  attachWorkflowImageControls(scope);
}

/**
 * Attaches image modal lightbox and click controls
 */
export function attachWorkflowImageControls(scope = document) {
  // Click on image or View Full button opens full-res lightbox
  scope.querySelectorAll('.workflow-image-element:not([data-bound="true"]), .btn-expand-img:not([data-bound="true"])').forEach(el => {
    el.setAttribute('data-bound', 'true');
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const img = el.classList.contains('workflow-image-element') 
        ? el 
        : el.closest('.workflow-direct-image-wrap')?.querySelector('.workflow-image-element');
      const src = img ? img.src : decodeURIComponent(el.getAttribute('data-img-src') || '');
      if (src) {
        openWorkflowLightbox(src);
      }
    });
  });
}

/**
 * Fullscreen Lightbox Modal for Workflow Image
 */
function openWorkflowLightbox(imgSrc) {
  let modal = document.getElementById('workflow-lightbox-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'workflow-lightbox-modal';
    modal.className = 'workflow-lightbox-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="workflow-lightbox-content">
      <div class="workflow-lightbox-header">
        <span>Workflow Image (Full Resolution)</span>
        <div class="workflow-lightbox-actions">
          <a href="${imgSrc}" download="workflow-${Date.now()}.png" class="btn-lightbox-action" title="Download Image">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download</span>
          </a>
          <button class="btn-lightbox-close" id="btn-close-lightbox" title="Close">✕</button>
        </div>
      </div>
      <div class="workflow-lightbox-body">
        <img src="${imgSrc}" alt="Workflow Diagram Fullscreen" class="workflow-lightbox-img" />
      </div>
    </div>
  `;

  modal.classList.add('active');

  const close = () => {
    modal.classList.remove('active');
  };

  modal.querySelector('#btn-close-lightbox')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
