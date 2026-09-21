/**
 * 3D Motion Robot Component
 * Inspired by modern 3D AI companion designs:
 * - Ceramic white pearlescent body with cute cat/devil ears
 * - Dark curved glossy monitor visor
 * - Floating anti-gravity pill arms
 * - Digital scanline matrix screen with expressive blinking & winking eyes
 * - Smooth 60fps hovering, breathing shadow, and interactive 3D physics
 */

export function getMotionRobotHtml(size = 42, isHero = false) {
  const s = isHero ? 96 : size;
  const h = Math.round(s * 0.88);
  
  return `
    <div class="motion-robot-container ${isHero ? 'hero-robot-container' : ''}" style="--robot-size: ${s}px;">
      <!-- Subtle Ambient Glow Halo -->
      <div class="robot-ambient-glow"></div>

      <!-- Main Animated 3D Robot Figure -->
      <div class="robot-3d-figure">
        <svg 
          viewBox="0 0 160 140" 
          width="${s}" 
          height="${h}" 
          class="motion-robot-svg" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <!-- 3D Pearlescent White Ceramic Head/Body Shading -->
            <radialGradient id="robotWhiteBody3D" cx="44%" cy="28%" r="68%">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="38%" stop-color="#F8FAFD" />
              <stop offset="68%" stop-color="#E2E8F0" />
              <stop offset="92%" stop-color="#CBD5E1" />
              <stop offset="100%" stop-color="#94A3B8" />
            </radialGradient>

            <!-- 3D Floating Pill Arm Gradient -->
            <linearGradient id="robotArmGrad" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="40%" stop-color="#F1F5F9" />
              <stop offset="80%" stop-color="#CBD5E1" />
              <stop offset="100%" stop-color="#94A3B8" />
            </linearGradient>

            <!-- Deep Glossy Monitor Face / Visor Gradient -->
            <linearGradient id="robotScreenVisor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#26282E" />
              <stop offset="25%" stop-color="#18191E" />
              <stop offset="70%" stop-color="#0F1013" />
              <stop offset="100%" stop-color="#07080A" />
            </linearGradient>

            <!-- Inner Screen Bezel Rim Gradient -->
            <linearGradient id="robotScreenRim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#383C46" />
              <stop offset="50%" stop-color="#1E2129" />
              <stop offset="100%" stop-color="#0E1015" />
            </linearGradient>

            <!-- Digital LED Matrix Scanlines Pattern -->
            <pattern id="digitalScanlines" width="16" height="3" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="16" height="2" fill="#FFFFFF" />
              <rect x="0" y="2" width="16" height="1" fill="rgba(10, 15, 20, 0.45)" />
            </pattern>

            <!-- Phosphor Emission Screen Glow -->
            <filter id="screenPhosphorGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.6" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <!-- Ear Specular Highlights -->
            <linearGradient id="earHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9" />
              <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
            </linearGradient>
          </defs>

          <!-- Ground Contact Shadow with breathing scale -->
          <ellipse cx="80" cy="132" rx="36" ry="5.5" fill="rgba(15, 23, 42, 0.2)" class="robot-ground-shadow" />

          <!-- Hovering Floating Body Entity -->
          <g class="robot-bobbing-body">
            
            <!-- Left Floating Pill Arm / Hand -->
            <g class="robot-floating-arm-left-wrap">
              <rect 
                x="9" 
                y="54" 
                width="13" 
                height="34" 
                rx="6.5" 
                fill="url(#robotArmGrad)" 
                stroke="rgba(148, 163, 184, 0.3)" 
                stroke-width="0.8" 
                transform="rotate(-15 15.5 71)" 
                class="robot-arm-pill"
              />
              <!-- Arm 3D Specular Sheen -->
              <ellipse cx="13" cy="62" rx="2.5" ry="7" fill="rgba(255,255,255,0.7)" transform="rotate(-15 13 62)" />
            </g>

            <!-- Right Floating Pill Arm / Hand -->
            <g class="robot-floating-arm-right-wrap">
              <rect 
                x="138" 
                y="54" 
                width="13" 
                height="34" 
                rx="6.5" 
                fill="url(#robotArmGrad)" 
                stroke="rgba(148, 163, 184, 0.3)" 
                stroke-width="0.8" 
                transform="rotate(15 144.5 71)" 
                class="robot-arm-pill"
              />
              <!-- Arm 3D Specular Sheen -->
              <ellipse cx="147" cy="62" rx="2.5" ry="7" fill="rgba(255,255,255,0.7)" transform="rotate(15 147 62)" />
            </g>

            <!-- Main White Chassis / Head with Integrated Cat-Ears -->
            <path 
              d="
                M 80 27
                C 93 27 101 16 107 16
                C 113 16 117 22 116 32
                C 119 42 133 54 133 78
                C 133 108 109 123 80 123
                C 51 123 27 108 27 78
                C 27 54 41 42 44 32
                C 43 22 47 16 53 16
                C 59 16 67 27 80 27
                Z
              "
              fill="url(#robotWhiteBody3D)"
              stroke="rgba(148, 163, 184, 0.45)"
              stroke-width="1.2"
              class="robot-chassis-shell"
            />

            <!-- Forehead & Horn Specular Glints -->
            <ellipse cx="53" cy="20" rx="3.5" ry="2.2" fill="url(#earHighlight)" transform="rotate(-20 53 20)" />
            <ellipse cx="107" cy="20" rx="3.5" ry="2.2" fill="url(#earHighlight)" transform="rotate(20 107 20)" />
            <path d="M 64 32 Q 80 29 96 32" stroke="rgba(255,255,255,0.85)" stroke-width="2.5" stroke-linecap="round" fill="none" />

            <!-- Robot Face Assembly (Screen Visor + Eyes + Mouth) -->
            <g class="robot-face-assembly">
              <!-- Dark Screen Visor Bezel / Rim Frame -->
              <rect 
                x="42" 
                y="40" 
                width="76" 
                height="64" 
                rx="23" 
                fill="url(#robotScreenRim)" 
                stroke="#26282F" 
                stroke-width="1.2"
              />

              <!-- Glossy Black Screen Face -->
              <rect 
                x="44" 
                y="42" 
                width="72" 
                height="60" 
                rx="21" 
                fill="url(#robotScreenVisor)" 
                class="robot-screen-face"
              />

              <!-- Screen Top-Right Glass Specular Curve -->
              <path 
                d="M 90 47 Q 107 50 109 68" 
                stroke="rgba(255,255,255,0.22)" 
                stroke-width="2.2" 
                stroke-linecap="round" 
                fill="none" 
              />
              <ellipse cx="98" cy="52" rx="8" ry="4" fill="rgba(255,255,255,0.06)" transform="rotate(-15 98 52)" />

              <!-- Digital Scanline Features (Blinking/Winking Eyes + Happy Mouth) -->
              <g class="robot-face-features" filter="url(#screenPhosphorGlow)">
                
                <!-- Left Eye (Open Rounded Square with Scanlines & Natural Blink) -->
                <g class="robot-eye-left-group">
                  <!-- Phosphor Background Base for Rich Brightness -->
                  <rect x="58" y="56" width="18" height="18" rx="4.5" fill="rgba(255, 255, 255, 0.45)" />
                  <!-- LED Scanline Overlay -->
                  <rect x="58" y="56" width="18" height="18" rx="4.5" fill="url(#digitalScanlines)" />
                </g>

                <!-- Right Eye (Playful Winking Slit with Scanlines & Twinkle) -->
                <g class="robot-eye-right-group">
                  <!-- Phosphor Base -->
                  <rect x="85" y="63" width="17" height="6.5" rx="3.2" fill="rgba(255, 255, 255, 0.45)" />
                  <!-- LED Scanlines -->
                  <rect x="85" y="63" width="17" height="6.5" rx="3.2" fill="url(#digitalScanlines)" />
                </g>

                <!-- Cute Smiling Mouth with Scanlines -->
                <g class="robot-mouth-group">
                  <path 
                    d="M 71 83 C 71 83 75 90 80 90 C 85 90 89 83 89 83 Z" 
                    fill="rgba(255, 255, 255, 0.35)" 
                  />
                  <path 
                    d="M 71 83 C 71 83 75 90 80 90 C 85 90 89 83 89 83 Z" 
                    fill="url(#digitalScanlines)" 
                  />
                </g>

              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  `;
}
