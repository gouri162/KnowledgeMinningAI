/**
 * 3D Motion Robot Model Component
 * Features GPU-accelerated 60fps continuous floating, waving arm,
 * blinking LED matrix eyes, pulsing chest reactor, and rotating neon halo.
 */

export function getMotionRobotHtml(size = 42, isHero = false) {
  const s = isHero ? 96 : size;
  
  return `
    <div class="motion-robot-container ${isHero ? 'hero-robot-container' : ''}" style="--robot-size: ${s}px;">
      <!-- Glowing 3D Neon Halo Ring -->
      <div class="robot-neon-halo"></div>

      <!-- Main Animated 3D Robot Figure -->
      <div class="robot-3d-figure">
        <svg 
          viewBox="0 0 120 130" 
          width="${s}" 
          height="${Math.round(s * 1.08)}" 
          class="motion-robot-svg" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <!-- 3D Metallic Head & Body Gradient -->
            <linearGradient id="metalChassis" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF"/>
              <stop offset="45%" stop-color="#EDE9FE"/>
              <stop offset="85%" stop-color="#C4B5FD"/>
              <stop offset="100%" stop-color="#8B5CF6"/>
            </linearGradient>

            <!-- 3D Purple Core Gradient -->
            <linearGradient id="purpleCore" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stop-color="#A78BFA"/>
              <stop offset="50%" stop-color="#7C3AED"/>
              <stop offset="100%" stop-color="#4C1D95"/>
            </linearGradient>

            <!-- Visor Glass Depth Gradient -->
            <linearGradient id="visorGlass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#0F172A"/>
              <stop offset="70%" stop-color="#1E1B4B"/>
              <stop offset="100%" stop-color="#0B0F19"/>
            </linearGradient>

            <!-- Neon Cyan Glow -->
            <filter id="cyanNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <!-- Soft Specular 3D Highlight -->
            <linearGradient id="specularGlint" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
              <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0"/>
            </linearGradient>
          </defs>

          <!-- Floating Shadow Beneath Robot -->
          <ellipse cx="60" cy="122" rx="22" ry="4.5" fill="rgba(79, 70, 229, 0.28)" class="robot-ground-shadow"/>

          <!-- Floating Robot Group -->
          <g class="robot-bobbing-body">
            <!-- Left Arm (Resting) -->
            <g class="robot-left-arm">
              <rect x="22" y="74" width="10" height="24" rx="5" fill="url(#metalChassis)" stroke="#7C3AED" stroke-width="1.2"/>
              <circle cx="27" cy="98" r="4.5" fill="url(#purpleCore)"/>
            </g>

            <!-- Torso / Chest Body -->
            <g class="robot-torso">
              <!-- Back Armor Shell -->
              <rect x="36" y="68" width="48" height="42" rx="14" fill="url(#metalChassis)" stroke="#7C3AED" stroke-width="1.5"/>
              <!-- Purple Chest Inset -->
              <rect x="42" y="73" width="36" height="32" rx="10" fill="url(#purpleCore)"/>
              <!-- Glowing AI Core Reactor -->
              <circle cx="60" cy="87" r="9" fill="#06B6D4" filter="url(#cyanNeonGlow)" class="robot-reactor-core"/>
              <text x="60" y="90.5" font-family="'Inter', system-ui, sans-serif" font-weight="900" font-size="7" fill="#FFFFFF" text-anchor="middle">AI</text>
              <!-- Chest Seam Lights -->
              <path d="M46 76 Q60 80 74 76" stroke="#22D3EE" stroke-width="1" fill="none" opacity="0.85"/>
            </g>

            <!-- Right Waving Arm (Active 3D Motion) -->
            <g class="robot-waving-arm-group">
              <!-- Shoulder Joint -->
              <circle cx="89" cy="74" r="5.5" fill="url(#purpleCore)"/>
              <!-- Forearm -->
              <path d="M89 74 Q97 60 102 48" stroke="url(#metalChassis)" stroke-width="8" stroke-linecap="round"/>
              <path d="M89 74 Q97 60 102 48" stroke="#7C3AED" stroke-width="1" fill="none"/>
              <!-- Waving Hand -->
              <g class="robot-hand" transform="translate(102, 48)">
                <circle cx="0" cy="0" r="5" fill="url(#purpleCore)"/>
                <!-- Friendly Fingers -->
                <path d="M-2 -3 L-2 -8" stroke="#22D3EE" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M1 -4 L1 -9" stroke="#22D3EE" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M4 -3 L4 -7" stroke="#22D3EE" stroke-width="1.8" stroke-linecap="round"/>
                <path d="M-4 0 L-7 -3" stroke="#22D3EE" stroke-width="1.8" stroke-linecap="round"/>
              </g>
            </g>

            <!-- Neck Connector -->
            <rect x="53" y="60" width="14" height="10" rx="3" fill="#4C1D95"/>

            <!-- 3D Robot Head -->
            <g class="robot-head-group">
              <!-- Left & Right Ear Pods with Cyan LEDs -->
              <rect x="22" y="32" width="7" height="18" rx="3.5" fill="url(#purpleCore)"/>
              <rect x="91" y="32" width="7" height="18" rx="3.5" fill="url(#purpleCore)"/>
              <circle cx="25.5" cy="41" r="2" fill="#22D3EE" filter="url(#cyanNeonGlow)" class="robot-ear-light"/>
              <circle cx="94.5" cy="41" r="2" fill="#22D3EE" filter="url(#cyanNeonGlow)" class="robot-ear-light"/>

              <!-- Antennas with Flashing Beacon Beams -->
              <path d="M42 22 L35 12" stroke="#7C3AED" stroke-width="2.2" stroke-linecap="round"/>
              <circle cx="35" cy="12" r="3" fill="#22D3EE" filter="url(#cyanNeonGlow)" class="robot-beacon-light"/>

              <path d="M78 22 L85 12" stroke="#7C3AED" stroke-width="2.2" stroke-linecap="round"/>
              <circle cx="85" cy="12" r="3" fill="#22D3EE" filter="url(#cyanNeonGlow)" class="robot-beacon-light"/>

              <!-- Outer 3D Metallic Head Shape -->
              <rect x="28" y="18" width="64" height="46" rx="20" fill="url(#metalChassis)" stroke="#7C3AED" stroke-width="1.8"/>
              <!-- Head Top Glint -->
              <ellipse cx="60" cy="23" rx="20" ry="3.5" fill="url(#specularGlint)"/>

              <!-- Glossy Dark Screen Visor -->
              <rect x="34" y="24" width="52" height="34" rx="14" fill="url(#visorGlass)" stroke="#22D3EE" stroke-width="1.2"/>
              <!-- Visor Corner Specular Reflection -->
              <path d="M38 27 Q50 25 62 27" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round" fill="none"/>

              <!-- 3D Blinking LED Digital Eyes -->
              <g class="robot-digital-eyes">
                <!-- Left Eye -->
                <g class="robot-left-eye">
                  <path d="M44 38 Q50 33 54 38" stroke="#22D3EE" stroke-width="3" stroke-linecap="round" fill="none" filter="url(#cyanNeonGlow)"/>
                  <circle cx="49" cy="40" r="1" fill="#FFFFFF"/>
                </g>
                <!-- Right Eye -->
                <g class="robot-right-eye">
                  <path d="M66 38 Q70 33 76 38" stroke="#22D3EE" stroke-width="3" stroke-linecap="round" fill="none" filter="url(#cyanNeonGlow)"/>
                  <circle cx="71" cy="40" r="1" fill="#FFFFFF"/>
                </g>
              </g>

              <!-- Happy Digital Smile -->
              <path d="M54 47 Q60 52 66 47" stroke="#22D3EE" stroke-width="2.2" stroke-linecap="round" fill="none" filter="url(#cyanNeonGlow)"/>

              <!-- Cute Rosy Cheek Accents -->
              <circle cx="41" cy="47" r="2.2" fill="#F472B6" opacity="0.6"/>
              <circle cx="79" cy="47" r="2.2" fill="#F472B6" opacity="0.6"/>
            </g>
          </g>
        </svg>
      </div>
    </div>
  `;
}
