/**
 * Visual Workflow Infographic Engine
 * Renders high-end colorful process posters (matching Canva / Mr. Study educational infographics)
 * with color-coded step cards, icons, decision diamond, feedback loop, and left quote box.
 * Automatically rasterizes and exports as a high-resolution PNG image format.
 */

// Step theme styles matching the user's reference infographic
export const STEP_THEMES = [
  { bg: '#FEE2E2', border: '#F87171', titleColor: '#991B1B', textColor: '#7F1D1D', iconBg: '#FCA5A5', icon: '🎯' }, // 1. Set Goals
  { bg: '#FEF3C7', border: '#FBBF24', titleColor: '#92400E', textColor: '#78350F', iconBg: '#FDE68A', icon: '📋' }, // 2. Plan
  { bg: '#DCFCE7', border: '#34D399', titleColor: '#065F46', textColor: '#047857', iconBg: '#A7F3D0', icon: '📚' }, // 3. Learn
  { bg: '#EDE9FE', border: '#A78BFA', titleColor: '#5B21B6', textColor: '#4C1D95', iconBg: '#DDD6FE', icon: '⚙️' }, // 4. Practice
  { bg: '#CCFBF1', border: '#2DD4BF', titleColor: '#115E59', textColor: '#0F766E', iconBg: '#99F6E4', icon: '📝' }, // 5. Review
  { bg: '#FFE4E6', border: '#FB7185', titleColor: '#9F1239', textColor: '#881337', iconBg: '#FECDD3', icon: '📊' }  // 6. Track Progress
];

/**
 * Standard Mr. Study Workflow Model
 */
export const DEFAULT_STUDY_WORKFLOW = {
  title: 'GIVRE MR. STUDY WORKFLOW',
  quote: '"A LITTLE\nPROGRESS\nEACH DAY\nLEADS TO\nBIG RESULTS."',
  author: 'MR. STUDY',
  steps: [
    { num: 1, title: 'SET GOALS', line1: 'Decide what to study and why', line2: '(Short-term & Long-term)', icon: '🎯' },
    { num: 2, title: 'PLAN', line1: 'Create a study schedule', line2: 'Break topics into smaller tasks', icon: '📋' },
    { num: 3, title: 'LEARN', line1: 'Read, watch, attend classes', line2: 'Take notes in your own words', icon: '📚' },
    { num: 4, title: 'PRACTICE', line1: 'Solve questions, do exercises', line2: 'Apply what you learn', icon: '⚙️' },
    { num: 5, title: 'REVIEW', line1: 'Revise regularly', line2: 'Use flashcards, summaries, or mind maps', icon: '📝' },
    { num: 6, title: 'TRACK PROGRESS', line1: 'Test yourself', line2: 'Identify strengths and weak areas', icon: '📊' }
  ],
  decision: {
    title: '7. GOAL ACHIEVED?',
    line1: 'Are you confident',
    line2: 'with the topics?',
    noLabel: 'No',
    noCardTitle: 'IMPROVE & REPEAT',
    noCardSub1: 'Focus on weak areas',
    noCardSub2: 'Adjust your plan',
    noCardSub3: 'Keep practicing',
    yesLabel: 'Yes',
    successTitle: 'SUCCESS!',
    successSub1: 'Move to the next goal',
    successSub2: 'Keep learning and growing'
  }
};

/**
 * Generates an SVG string for the exact infographic workflow matching the user's reference
 */
export function generateWorkflowInfographicSvg(data = DEFAULT_STUDY_WORKFLOW) {
  const steps = (data.steps && data.steps.length > 0) ? data.steps : DEFAULT_STUDY_WORKFLOW.steps;
  const decision = data.decision || DEFAULT_STUDY_WORKFLOW.decision;
  const title = (data.title || 'GIVRE MR. STUDY WORKFLOW').toUpperCase();

  const width = 840;
  const totalHeight = 930;

  const cardWidth = 370;
  const cardHeight = 58;
  const cardGap = 16;
  const mainX = 265;
  const startY = 100;

  // Build Step Cards
  let stepsSvg = '';
  steps.forEach((step, idx) => {
    const y = startY + idx * (cardHeight + cardGap);
    const theme = STEP_THEMES[idx % STEP_THEMES.length];
    const icon = step.icon || theme.icon;

    stepsSvg += `
      <!-- Step ${step.num} -->
      <g class="wf-step-node" transform="translate(${mainX}, ${y})">
        <!-- Card Background -->
        <rect width="${cardWidth}" height="${cardHeight}" rx="10" fill="${theme.bg}" stroke="${theme.border}" stroke-width="1.8" filter="url(#nodeShadow)"/>
        
        <!-- Icon Badge Circle -->
        <circle cx="28" cy="${cardHeight / 2}" r="17" fill="${theme.iconBg}" stroke="${theme.border}" stroke-width="1"/>
        <text x="28" y="${cardHeight / 2 + 6}" font-size="17" text-anchor="middle">${icon}</text>

        <!-- Step Title -->
        <text x="56" y="24" font-family="'Inter', system-ui, sans-serif" font-weight="800" font-size="13.5" fill="${theme.titleColor}">
          ${step.num}. ${escapeXml(step.title)}
        </text>

        <!-- Step Description Lines -->
        <text x="56" y="40" font-family="'Inter', system-ui, sans-serif" font-weight="500" font-size="10.5" fill="${theme.textColor}">
          ${escapeXml(step.line1 || step.desc || '')}
        </text>
        ${step.line2 ? `
        <text x="56" y="52" font-family="'Inter', system-ui, sans-serif" font-weight="500" font-size="9.5" fill="${theme.textColor}" opacity="0.9">
          ${escapeXml(step.line2)}
        </text>
        ` : ''}
      </g>
    `;

    // Arrow pointing down to next step
    if (idx < steps.length - 1) {
      const arrowY = y + cardHeight;
      stepsSvg += `
        <g stroke="#64748B" stroke-width="1.8" fill="#64748B">
          <line x1="${mainX + cardWidth / 2}" y1="${arrowY}" x2="${mainX + cardWidth / 2}" y2="${arrowY + cardGap - 4}"/>
          <polygon points="${mainX + cardWidth / 2 - 4},${arrowY + cardGap - 5} ${mainX + cardWidth / 2 + 4},${arrowY + cardGap - 5} ${mainX + cardWidth / 2},${arrowY + cardGap}"/>
        </g>
      `;
    }
  });

  // Calculate Diamond Position
  const lastStepY = startY + (steps.length - 1) * (cardHeight + cardGap);
  const diamondCenterY = lastStepY + cardHeight + 46;
  const diamondCenterX = mainX + cardWidth / 2;
  const dw = 190;
  const dh = 66;

  // Arrow to Diamond
  const arrowToDiamond = `
    <g stroke="#64748B" stroke-width="1.8" fill="#64748B">
      <line x1="${diamondCenterX}" y1="${lastStepY + cardHeight}" x2="${diamondCenterX}" y2="${diamondCenterY - dh / 2 - 4}"/>
      <polygon points="${diamondCenterX - 4},${diamondCenterY - dh / 2 - 5} ${diamondCenterX + 4},${diamondCenterY - dh / 2 - 5} ${diamondCenterX},${diamondCenterY - dh / 2}"/>
    </g>
  `;

  // Decision Diamond (Rhombus shape)
  const diamondSvg = `
    <!-- Decision Diamond -->
    <g>
      <polygon 
        points="${diamondCenterX},${diamondCenterY - dh / 2} ${diamondCenterX + dw / 2},${diamondCenterY} ${diamondCenterX},${diamondCenterY + dh / 2} ${diamondCenterX - dw / 2},${diamondCenterY}" 
        fill="#E0F2FE" 
        stroke="#38BDF8" 
        stroke-width="1.8" 
        filter="url(#nodeShadow)"
      />
      <text x="${diamondCenterX}" y="${diamondCenterY - 6}" font-family="'Inter', system-ui, sans-serif" font-weight="800" font-size="12" fill="#0369A1" text-anchor="middle">
        ${escapeXml(decision.title)}
      </text>
      <text x="${diamondCenterX}" y="${diamondCenterY + 10}" font-family="'Inter', system-ui, sans-serif" font-weight="500" font-size="10" fill="#0C4A6E" text-anchor="middle">
        ${escapeXml(decision.line1)}
      </text>
      ${decision.line2 ? `
      <text x="${diamondCenterX}" y="${diamondCenterY + 22}" font-family="'Inter', system-ui, sans-serif" font-weight="500" font-size="9" fill="#0C4A6E" text-anchor="middle">
        ${escapeXml(decision.line2)}
      </text>
      ` : ''}
    </g>
  `;

  // Feedback Loop: "No" branch from right vertex to "IMPROVE & REPEAT", looping to Step 4
  const practiceStepIndex = Math.min(3, steps.length - 1);
  const practiceStepY = startY + practiceStepIndex * (cardHeight + cardGap) + cardHeight / 2;
  const sideCardX = 650;
  const sideCardY = diamondCenterY - 100;
  const sideCardW = 150;
  const sideCardH = 76;

  const loopbackSvg = `
    <!-- 'No' Arrow from Right vertex -->
    <g stroke="#64748B" stroke-width="1.8" fill="#64748B">
      <line x1="${diamondCenterX + dw / 2}" y1="${diamondCenterY}" x2="${sideCardX + sideCardW / 2}" y2="${diamondCenterY}"/>
      <text x="${diamondCenterX + dw / 2 + 18}" y="${diamondCenterY - 6}" font-family="'Inter', system-ui" font-size="11" font-weight="700" fill="#64748B">No</text>
      <line x1="${sideCardX + sideCardW / 2}" y1="${diamondCenterY}" x2="${sideCardX + sideCardW / 2}" y2="${sideCardY + sideCardH + 4}"/>
      <polygon points="${sideCardX + sideCardW / 2 - 4},${sideCardY + sideCardH + 5} ${sideCardX + sideCardW / 2 + 4},${sideCardY + sideCardH + 5} ${sideCardX + sideCardW / 2},${sideCardY + sideCardH}"/>
    </g>

    <!-- Side Card: IMPROVE & REPEAT -->
    <g transform="translate(${sideCardX}, ${sideCardY})">
      <rect width="${sideCardW}" height="${sideCardH}" rx="10" fill="#F0FDF4" stroke="#4ADE80" stroke-width="1.6" filter="url(#nodeShadow)"/>
      <circle cx="22" cy="38" r="13" fill="#DCFCE7"/>
      <text x="22" y="43" font-size="14" text-anchor="middle">🔄</text>
      <text x="42" y="24" font-family="'Inter', system-ui" font-weight="800" font-size="10.5" fill="#15803D">${escapeXml(decision.noCardTitle)}</text>
      <text x="42" y="38" font-family="'Inter', system-ui" font-weight="500" font-size="9" fill="#166534">${escapeXml(decision.noCardSub1)}</text>
      <text x="42" y="50" font-family="'Inter', system-ui" font-weight="500" font-size="9" fill="#166534">${escapeXml(decision.noCardSub2)}</text>
      <text x="42" y="62" font-family="'Inter', system-ui" font-weight="500" font-size="9" fill="#166534">${escapeXml(decision.noCardSub3)}</text>
    </g>

    <!-- Loop Arrow returning back to Step 4 (Practice) -->
    <g stroke="#4ADE80" stroke-width="1.8" fill="#4ADE80">
      <path d="M ${sideCardX + sideCardW / 2} ${sideCardY} V ${practiceStepY} H ${mainX + cardWidth + 6}" fill="none"/>
      <polygon points="${mainX + cardWidth + 7},${practiceStepY - 4} ${mainX + cardWidth + 7},${practiceStepY + 4} ${mainX + cardWidth},${practiceStepY}"/>
    </g>
  `;

  // "Yes" Branch to SUCCESS!
  const successY = diamondCenterY + dh / 2 + 28;
  const successSvg = `
    <!-- 'Yes' Arrow from Bottom vertex -->
    <g stroke="#16A34A" stroke-width="1.8" fill="#16A34A">
      <line x1="${diamondCenterX}" y1="${diamondCenterY + dh / 2}" x2="${diamondCenterX}" y2="${successY - 5}"/>
      <text x="${diamondCenterX + 10}" y="${diamondCenterY + dh / 2 + 16}" font-family="'Inter', system-ui" font-size="11" font-weight="700" fill="#16A34A">Yes</text>
      <polygon points="${diamondCenterX - 4},${successY - 5} ${diamondCenterX + 4},${successY - 5} ${diamondCenterX},${successY}"/>
    </g>

    <!-- SUCCESS! Goal Card -->
    <g transform="translate(${mainX}, ${successY})">
      <rect width="${cardWidth}" height="${cardHeight}" rx="10" fill="#DCFCE7" stroke="#22C55E" stroke-width="1.8" filter="url(#nodeShadow)"/>
      <circle cx="28" cy="${cardHeight / 2}" r="17" fill="#BBF7D0" stroke="#22C55E" stroke-width="1"/>
      <text x="28" y="${cardHeight / 2 + 6}" font-size="17" text-anchor="middle">🏆</text>
      <text x="56" y="24" font-family="'Inter', system-ui" font-weight="800" font-size="14" fill="#15803D">${escapeXml(decision.successTitle)}</text>
      <text x="56" y="40" font-family="'Inter', system-ui" font-weight="500" font-size="10.5" fill="#166534">${escapeXml(decision.successSub1)}</text>
      <text x="56" y="52" font-family="'Inter', system-ui" font-weight="500" font-size="9.5" fill="#166534">${escapeXml(decision.successSub2)}</text>
    </g>
  `;

  // Left Column Quote Card
  const quoteLines = (data.quote || DEFAULT_STUDY_WORKFLOW.quote).split('\n');
  const quoteSvg = `
    <g transform="translate(36, 180)">
      <rect width="195" height="230" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.6" filter="url(#nodeShadow)"/>
      ${quoteLines.map((line, lIdx) => `
        <text x="97" y="${56 + lIdx * 22}" font-family="'Inter', system-ui" font-weight="800" font-size="13" fill="#1E293B" text-anchor="middle" letter-spacing="0.5">
          ${escapeXml(line.replace(/"/g, ''))}
        </text>
      `).join('')}
      <line x1="65" y1="${56 + quoteLines.length * 22 + 10}" x2="130" y2="${56 + quoteLines.length * 22 + 10}" stroke="#CBD5E1" stroke-width="1.5"/>
      <text x="97" y="${56 + quoteLines.length * 22 + 32}" font-family="'Inter', system-ui" font-weight="700" font-size="11" fill="#64748B" text-anchor="middle">
        — ${escapeXml(data.author || 'MR. STUDY')}
      </text>
    </g>
  `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${totalHeight}" width="${width}" height="${totalHeight}" style="background: #FFFFFF; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
      <defs>
        <filter id="nodeShadow" x="-3%" y="-6%" width="106%" height="116%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0, 0, 0, 0.04)"/>
        </filter>
        <filter id="cardFrameShadow" x="-2%" y="-2%" width="104%" height="104%">
          <feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="rgba(0, 0, 0, 0.06)"/>
        </filter>
      </defs>

      <!-- Outer Frame -->
      <rect x="10" y="10" width="${width - 20}" height="${totalHeight - 20}" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#cardFrameShadow)"/>

      <!-- Header Banner Pill -->
      <g transform="translate(${width / 2}, 34)">
        <rect x="-170" y="0" width="340" height="42" rx="21" fill="#DCEBFE" stroke="#93C5FD" stroke-width="1.5"/>
        <text x="0" y="27" font-family="'Inter', system-ui" font-weight="900" font-size="15" fill="#1E3A8A" text-anchor="middle" letter-spacing="1">
          ${escapeXml(title)}
        </text>
      </g>

      <!-- Left Column Quote -->
      ${quoteSvg}

      <!-- Main Step Cards Stack -->
      ${stepsSvg}

      <!-- Arrow to Decision -->
      ${arrowToDiamond}

      <!-- Decision Diamond -->
      ${diamondSvg}

      <!-- Feedback Loop & Side Card -->
      ${loopbackSvg}

      <!-- Success Card -->
      ${successSvg}

      <!-- Bottom Row Elements -->
      <!-- Left 'Edit' capsule -->
      <g transform="translate(36, ${totalHeight - 56})">
        <rect width="64" height="28" rx="14" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1"/>
        <text x="32" y="18" font-family="'Inter', system-ui" font-size="11.5" font-weight="700" fill="#475569" text-anchor="middle">Edit</text>
      </g>

      <!-- Right Signature -->
      <g transform="translate(${width - 48}, ${totalHeight - 64})">
        <text x="0" y="0" font-family="'Inter', system-ui" font-size="11.5" font-weight="600" fill="#64748B" font-style="italic" text-anchor="end">Study Smarter</text>
        <text x="0" y="15" font-family="'Inter', system-ui" font-size="11.5" font-weight="600" fill="#64748B" font-style="italic" text-anchor="end">Build a Habit</text>
        <text x="0" y="30" font-family="'Inter', system-ui" font-size="11" font-weight="700" fill="#475569" text-anchor="end">— Mr. Study</text>
      </g>
    </svg>
  `;
}

/**
 * Converts the generated SVG into a high-res PNG Data URL for instant <img src="..." /> rendering
 */
export async function generateWorkflowPngDataUrl(data = DEFAULT_STUDY_WORKFLOW) {
  const svgString = generateWorkflowInfographicSvg(data);
  return new Promise((resolve) => {
    try {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      const fallbackUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

      const timer = setTimeout(() => {
        URL.revokeObjectURL(url);
        resolve(fallbackUrl);
      }, 1500);

      img.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          const scale = 2; // 2x high-DPI crisp retina resolution
          canvas.width = 840 * scale;
          canvas.height = 930 * scale;

          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          resolve(canvas.toDataURL('image/png'));
        } catch {
          URL.revokeObjectURL(url);
          resolve(fallbackUrl);
        }
      };

      img.onerror = () => {
        clearTimeout(timer);
        URL.revokeObjectURL(url);
        resolve(fallbackUrl);
      };

      img.src = url;
    } catch {
      resolve(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`);
    }
  });
}

/**
 * Parses Mermaid or plain text lines to extract workflow structure
 */
export function parseWorkflowDataFromText(text) {
  const isStudy = /study|learn|goals?|exam|revision|givre|mr\.?\s*study|effective\s*study/i.test(text);
  if (isStudy) {
    return DEFAULT_STUDY_WORKFLOW;
  }

  const lines = text.split('\n');
  const extractedSteps = [];
  let stepCounter = 1;

  for (const line of lines) {
    const matchNode = line.match(/\[(.*?)\]/);
    if (matchNode && matchNode[1]) {
      const content = matchNode[1].trim();
      if (/start|end|begin|phase\s*0/i.test(content)) continue;

      const parts = content.split(/[:–-]/);
      const title = (parts[0] || content).trim();
      const desc = parts[1] ? parts[1].trim() : `Execute ${title} step efficiently`;
      const icon = STEP_THEMES[(stepCounter - 1) % STEP_THEMES.length].icon;

      extractedSteps.push({
        num: stepCounter++,
        title: title.length > 20 ? title.substring(0, 20) + '…' : title,
        line1: desc.length > 38 ? desc.substring(0, 38) + '…' : desc,
        line2: desc.length > 38 ? desc.substring(38, 76) : '',
        icon
      });
      if (extractedSteps.length >= 6) break;
    }
  }

  if (extractedSteps.length >= 3) {
    return {
      title: 'PROCESS WORKFLOW',
      quote: '"A LITTLE\nPROGRESS\nEACH DAY\nLEADS TO\nBIG RESULTS."',
      author: 'CONSULTAI',
      steps: extractedSteps,
      decision: DEFAULT_STUDY_WORKFLOW.decision
    };
  }

  return DEFAULT_STUDY_WORKFLOW;
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
