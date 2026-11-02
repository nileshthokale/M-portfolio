import React from 'react';

export type GlossyVariant =
  | 'silver-splash'
  | 'red-heart'
  | 'crystal-sphere'
  | 'violet-flower'
  | 'gold-bolt'
  | 'purple-hand'
  | 'star-orb'
  | 'wow-orb';

interface GlossyShape3DProps {
  variant: GlossyVariant;
  className?: string;
}

/**
 * High-gloss 3D volumetric SVG sculptures with multi-stop specular lighting,
 * rim reflections, and soft drop shadows matching the reference video's 3D shapes.
 */
export const GlossyShape3D: React.FC<GlossyShape3DProps> = ({ variant, className = '' }) => {
  switch (variant) {
    case 'silver-splash':
      return (
        <div className={`select-none pointer-events-none ${className}`} aria-hidden="true">
          <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-[0_18px_28px_rgba(123,92,255,0.28)]">
            <defs>
              <radialGradient id="chromeSplash" cx="35%" cy="28%" r="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#cfd8ef" />
                <stop offset="70%" stopColor="#6c79a6" />
                <stop offset="100%" stopColor="#1e243b" />
              </radialGradient>
              <linearGradient id="chromeRim" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#ff4fa3" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#7b5cff" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {/* 5-lobe 3D liquid chrome jack shape from 00:05 top-left */}
            <path
              d="M90 16 C104 16, 108 55, 118 62 C128 69, 164 52, 168 68 C172 84, 132 98, 128 110 C124 122, 152 154, 138 164 C124 174, 100 136, 88 136 C76 136, 52 172, 38 162 C24 152, 54 120, 50 108 C46 96, 10 82, 14 66 C18 50, 54 68, 64 60 C74 52, 76 16, 90 16 Z"
              fill="url(#chromeSplash)"
              stroke="url(#chromeRim)"
              strokeWidth="2"
            />
            <ellipse cx="76" cy="54" rx="10" ry="22" transform="rotate(-18 76 54)" fill="#ffffff" fillOpacity="0.65" />
            <circle cx="126" cy="76" r="8" fill="#ffffff" fillOpacity="0.55" />
          </svg>
        </div>
      );

    case 'red-heart':
      return (
        <div className={`select-none pointer-events-none ${className}`} aria-hidden="true">
          <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-[0_20px_32px_rgba(255,45,85,0.38)]">
            <defs>
              <radialGradient id="glossyHeart" cx="32%" cy="28%" r="68%">
                <stop offset="0%" stopColor="#ff9eb5" />
                <stop offset="28%" stopColor="#ff2957" />
                <stop offset="72%" stopColor="#b80028" />
                <stop offset="100%" stopColor="#4a0010" />
              </radialGradient>
            </defs>
            {/* Puffy 3D tilted glossy red heart from 00:05 bottom-left */}
            <g transform="rotate(-14 90 90)">
              <path
                d="M90 156 C90 156, 20 112, 20 62 C20 34, 44 18, 66 22 C80 25, 88 38, 90 46 C92 38, 100 25, 114 22 C136 18, 160 34, 160 62 C160 112, 90 156, 90 156 Z"
                fill="url(#glossyHeart)"
              />
              <ellipse cx="56" cy="52" rx="18" ry="10" transform="rotate(-32 56 52)" fill="#ffffff" fillOpacity="0.65" />
              <circle cx="44" cy="70" r="5" fill="#ffffff" fillOpacity="0.45" />
            </g>
          </svg>
        </div>
      );

    case 'crystal-sphere':
      return (
        <div className={`select-none pointer-events-none ${className}`} aria-hidden="true">
          <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-[0_18px_32px_rgba(123,92,255,0.42)]">
            <defs>
              <radialGradient id="crystalOrb" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#a5f3fc" />
                <stop offset="35%" stopColor="#8b5cf6" />
                <stop offset="75%" stopColor="#3b0764" />
                <stop offset="100%" stopColor="#0f0728" />
              </radialGradient>
              <linearGradient id="facetGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#ff4fa3" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <circle cx="90" cy="90" r="66" fill="url(#crystalOrb)" />
            <polygon
              points="90,26 138,54 138,118 90,152 42,118 42,54"
              fill="none"
              stroke="url(#facetGlow)"
              strokeWidth="2.5"
            />
            <polygon
              points="90,48 124,70 112,118 68,118 56,70"
              fill="#ffffff"
              fillOpacity="0.12"
              stroke="#ffffff"
              strokeOpacity="0.4"
              strokeWidth="1.5"
            />
            <ellipse cx="68" cy="56" rx="18" ry="9" transform="rotate(-28 68 56)" fill="#ffffff" fillOpacity="0.7" />
          </svg>
        </div>
      );

    case 'violet-flower':
      return (
        <div className={`select-none pointer-events-none ${className}`} aria-hidden="true">
          <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-[0_20px_32px_rgba(168,85,247,0.42)]">
            <defs>
              <radialGradient id="petalGrad" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#f0abfc" />
                <stop offset="45%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#4c1d95" />
              </radialGradient>
              <radialGradient id="centerGrad" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="55%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </radialGradient>
            </defs>
            {/* 6 puffy 3D petals from 00:05 bottom-right */}
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <g key={angle} transform={`rotate(${angle} 90 90)`}>
                <circle cx="90" cy="42" r="28" fill="url(#petalGrad)" />
                <ellipse cx="82" cy="32" rx="8" ry="4" fill="#ffffff" fillOpacity="0.45" />
              </g>
            ))}
            <circle cx="90" cy="90" r="25" fill="url(#centerGrad)" />
            <ellipse cx="82" cy="82" rx="8" ry="5" transform="rotate(-25 82 82)" fill="#ffffff" fillOpacity="0.7" />
          </svg>
        </div>
      );

    case 'gold-bolt':
      return (
        <div className={`select-none pointer-events-none ${className}`} aria-hidden="true">
          <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-[0_18px_28px_rgba(234,179,8,0.35)]">
            <defs>
              <linearGradient id="bolt3D" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="45%" stopColor="#a3e635" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
            {/* 3D glossy lightning bolt from 00:17 top-right */}
            <path
              d="M106 16 L42 98 H88 L72 164 L142 78 H94 L106 16 Z"
              fill="url(#bolt3D)"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      );

    case 'purple-hand':
      return (
        <div className={`select-none pointer-events-none ${className}`} aria-hidden="true">
          <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-[0_18px_28px_rgba(123,92,255,0.35)]">
            <defs>
              <radialGradient id="purpleSculpt" cx="35%" cy="28%" r="70%">
                <stop offset="0%" stopColor="#e9d5ff" />
                <stop offset="40%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#3b0764" />
              </radialGradient>
            </defs>
            {/* Glossy 3D sculptural wave/peace blob from 00:18 bottom-left */}
            <rect x="44" y="72" width="84" height="76" rx="38" fill="url(#purpleSculpt)" />
            <rect x="54" y="22" width="24" height="68" rx="12" transform="rotate(-10 66 56)" fill="url(#purpleSculpt)" />
            <rect x="88" y="18" width="24" height="72" rx="12" transform="rotate(8 100 54)" fill="url(#purpleSculpt)" />
            <rect x="112" y="54" width="22" height="48" rx="11" transform="rotate(18 123 78)" fill="url(#purpleSculpt)" />
            <ellipse cx="64" cy="40" rx="4" ry="12" transform="rotate(-10 64 40)" fill="#ffffff" fillOpacity="0.55" />
          </svg>
        </div>
      );

    case 'star-orb':
      return (
        <div className={`select-none pointer-events-none ${className}`} aria-hidden="true">
          <svg viewBox="0 0 140 140" className="w-full h-full drop-shadow-[0_14px_24px_rgba(255,154,60,0.4)]">
            <defs>
              <radialGradient id="amberOrb" cx="35%" cy="28%" r="68%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="45%" stopColor="#ff9a3c" />
                <stop offset="100%" stopColor="#9a3412" />
              </radialGradient>
            </defs>
            <circle cx="70" cy="70" r="54" fill="url(#amberOrb)" />
            <path d="M48 42 C48 34, 34 34, 34 42 C34 52, 48 62, 48 62 C48 62, 62 52, 62 42 C62 34, 48 34, 48 42 Z" fill="#e11d48" />
            <path d="M92 42 C92 34, 78 34, 78 42 C78 52, 92 62, 92 62 C92 62, 106 52, 106 42 C106 34, 92 34, 92 42 Z" fill="#e11d48" />
            <path d="M46 84 Q70 106 94 84" stroke="#431407" strokeWidth="7" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      );

    case 'wow-orb':
      return (
        <div className={`select-none pointer-events-none ${className}`} aria-hidden="true">
          <svg viewBox="0 0 140 140" className="w-full h-full drop-shadow-[0_14px_24px_rgba(255,154,60,0.4)]">
            <circle cx="70" cy="70" r="54" fill="url(#amberOrb)" />
            <ellipse cx="50" cy="54" rx="7" ry="10" fill="#291205" />
            <ellipse cx="90" cy="54" rx="7" ry="10" fill="#291205" />
            <ellipse cx="70" cy="90" rx="12" ry="16" fill="#291205" />
            <ellipse cx="48" cy="34" rx="12" ry="5" transform="rotate(-18 48 34)" fill="#ffffff" fillOpacity="0.6" />
          </svg>
        </div>
      );
  }
};
