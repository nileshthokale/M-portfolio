import React from 'react';
import { ImagePlus } from 'lucide-react';
import { ProjectPreviewVisual } from '../data/portfolio';

interface ProjectArtworkProps {
  visual: ProjectPreviewVisual;
  large?: boolean;
}

/**
 * Renders domain-authentic GoKaliFree (gokalifree.in) previews (70+ tools, 164 commands,
 * 111 articles, browser terminal sandbox) and clean Empty Slot wireframes for Projects 02 & 03.
 */
export const ProjectArtwork: React.FC<ProjectArtworkProps> = ({ visual, large = false }) => {
  if (visual.theme === 'empty-slot') {
    return (
      <div
        className={`group relative overflow-hidden rounded-[20px] border border-dashed border-white/25 bg-[#0b0e17]/70 flex flex-col items-center justify-center p-6 text-center transition-colors hover:border-[#ff4fa3]/60 ${
          large ? 'h-[250px] sm:h-[320px] lg:h-[360px]' : 'h-[168px] sm:h-[172px]'
        }`}
      >
        <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center text-[#ff9a3c] mb-3">
          <ImagePlus className="w-5 h-5" />
        </div>
        <p className="text-[11px] font-mono-num uppercase tracking-widest text-[#ff4fa3]">
          {visual.metricBadge}
        </p>
        <h4 className="text-sm sm:text-base font-bold text-white mt-1">
          {visual.title}
        </h4>
        <p className="text-xs text-[#eef0f5]/55 mt-1 max-w-xs">
          {visual.caption}
        </p>
      </div>
    );
  }

  const renderGoKaliFreeScene = () => {
    switch (visual.theme) {
      case 'gokalifree-tools':
        return (
          <svg viewBox="0 0 640 400" className="w-full h-full object-cover">
            <defs>
              <linearGradient id="gkfBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#070b18" />
                <stop offset="55%" stopColor="#13102e" />
                <stop offset="100%" stopColor="#061724" />
              </linearGradient>
            </defs>
            <rect width="640" height="400" fill="url(#gkfBg)" />
            {/* Browser Frame for gokalifree.in */}
            <rect
              x="32"
              y="28"
              width="576"
              height="344"
              rx="16"
              fill="#060811"
              stroke="#ffffff"
              strokeOpacity="0.2"
              strokeWidth="1.5"
            />
            <circle cx="58" cy="52" r="5.5" fill="#ff4fa3" />
            <circle cx="76" cy="52" r="5.5" fill="#ff9a3c" />
            <circle cx="94" cy="52" r="5.5" fill="#22c55e" />
            <rect x="120" y="41" width="280" height="22" rx="6" fill="#111626" />
            <text x="134" y="56" fill="#38bdf8" fontSize="11.5" fontFamily="JetBrains Mono, monospace">
              https://gokalifree.in/tools
            </text>
            <line x1="32" y1="74" x2="608" y2="74" stroke="#ffffff" strokeOpacity="0.1" />

            {/* Header inside GoKaliFree */}
            <text x="56" y="110" fill="#ffffff" fontSize="18" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
              GO KALI FREE — Ethical Hacking &amp; Linux Hub
            </text>
            <text x="56" y="132" fill="#94a3b8" fontSize="12" fontFamily="JetBrains Mono, monospace">
              70+ Security Tools · 164 Linux Commands · 111 Educational Articles
            </text>

            {/* 3 Feature Cards representing Tool Library */}
            <rect x="56" y="154" width="164" height="96" rx="12" fill="#0f1526" stroke="#ff4fa3" strokeOpacity="0.55" />
            <text x="72" y="180" fill="#ff4fa3" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              NETWORK RECON
            </text>
            <text x="72" y="204" fill="#ffffff" fontSize="15" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
              Nmap &amp; Wireshark
            </text>
            <text x="72" y="226" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono, monospace">
              Port Scanning &amp; PCAP
            </text>

            <rect x="238" y="154" width="164" height="96" rx="12" fill="#0f1526" stroke="#7b5cff" strokeOpacity="0.55" />
            <text x="254" y="180" fill="#a78bfa" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              WEB SECURITY
            </text>
            <text x="254" y="204" fill="#ffffff" fontSize="15" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
              Burp Suite &amp; OWASP
            </text>
            <text x="254" y="226" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono, monospace">
              Proxy &amp; Top 10 Vulnerabilities
            </text>

            <rect x="420" y="154" width="164" height="96" rx="12" fill="#0f1526" stroke="#ff9a3c" strokeOpacity="0.55" />
            <text x="436" y="180" fill="#ff9a3c" fontSize="11" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              LINUX CLI
            </text>
            <text x="436" y="204" fill="#ffffff" fontSize="15" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
              164 Linux Commands
            </text>
            <text x="436" y="226" fill="#94a3b8" fontSize="11" fontFamily="JetBrains Mono, monospace">
              Permissions, Greps &amp; Net
            </text>

            {/* Bottom Command Strip */}
            <rect x="56" y="268" width="528" height="44" rx="10" fill="#090d18" stroke="#38bdf8" strokeOpacity="0.35" />
            <text x="74" y="295" fill="#4ade80" fontSize="13" fontFamily="JetBrains Mono, monospace">
              root@gokalifree:~# nmap -sV -sC -T4 target.local
            </text>
          </svg>
        );

      case 'gokalifree-sandbox':
        return (
          <svg viewBox="0 0 480 280" className="w-full h-full object-cover">
            <rect width="480" height="280" fill="#0d0a1f" />
            <rect x="24" y="22" width="432" height="236" rx="14" fill="#070912" stroke="#7b5cff" strokeOpacity="0.4" />
            <text x="44" y="54" fill="#ff9a3c" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              BROWSER TERMINAL SANDBOX &amp; UTILITIES
            </text>
            <text x="44" y="82" fill="#4ade80" fontSize="12" fontFamily="JetBrains Mono, monospace">
              $ whoami &amp;&amp; uname -a
            </text>
            <text x="44" y="104" fill="#cbd5e1" fontSize="11.5" fontFamily="JetBrains Mono, monospace">
              kali-learner · Linux gokalifree 6.6.15-amd64
            </text>
            <rect x="44" y="124" width="392" height="42" rx="8" fill="#13182b" stroke="#ff4fa3" strokeOpacity="0.45" />
            <text x="58" y="150" fill="#eef0f5" fontSize="12" fontFamily="JetBrains Mono, monospace">
              SHA-256 / Base64 / URL Encoder · Zero Local Setup
            </text>
          </svg>
        );

      case 'gokalifree-articles':
      default:
        return (
          <svg viewBox="0 0 480 280" className="w-full h-full object-cover">
            <rect width="480" height="280" fill="#08131d" />
            <rect x="24" y="22" width="432" height="236" rx="14" fill="#050811" stroke="#38bdf8" strokeOpacity="0.35" />
            <text x="44" y="56" fill="#38bdf8" fontSize="13" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
              111 EDUCATIONAL ARTICLES &amp; SEO CLUSTER
            </text>
            <rect x="44" y="76" width="392" height="14" rx="7" fill="#1e293b" />
            <rect x="44" y="76" width="340" height="14" rx="7" fill="#ff4fa3" />
            <rect x="44" y="106" width="392" height="14" rx="7" fill="#1e293b" />
            <rect x="44" y="106" width="305" height="14" rx="7" fill="#7b5cff" />
            <rect x="44" y="136" width="392" height="14" rx="7" fill="#1e293b" />
            <rect x="44" y="136" width="365" height="14" rx="7" fill="#ff9a3c" />
            <text x="44" y="182" fill="#94a3b8" fontSize="11.5" fontFamily="JetBrains Mono, monospace">
              Sitemap Architecture · Keyword Clustering · Internal Linking
            </text>
          </svg>
        );
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-[20px] border border-white/15 bg-[#0b0e18] ${
        large ? 'h-[250px] sm:h-[320px] lg:h-[360px]' : 'h-[168px] sm:h-[172px]'
      }`}
    >
      <div className="w-full h-full transition-transform duration-300 ease-out group-hover:scale-[1.03]">
        {renderGoKaliFreeScene()}
      </div>
      <div className="inset-x-0 bottom-0 absolute bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-mono-num uppercase tracking-wider text-[#ff9a3c]">
            {visual.metricBadge}
          </p>
          <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
            {visual.title}
          </h4>
        </div>
      </div>
    </div>
  );
};
