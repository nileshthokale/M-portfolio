import React from 'react';
import { ExternalLink, ImagePlus } from 'lucide-react';
import { ProjectPreviewVisual } from '../data/portfolio';

interface ProjectArtworkProps {
  visual: ProjectPreviewVisual;
  large?: boolean;
  featured?: boolean;
  stackIndex?: number;
}

/**
 * Renders complete, uncropped GoKaliFree (gokalifree.in) previews (70+ tools, 164 commands,
 * 111 articles, browser terminal sandbox) and clean Empty Slot wireframes for Projects 02 & 03.
 * Graduated desktop heights (Card 01 = H + 184px, Card 02 = H + 92px, Card 03 = H) ensure:
 * 1) Flagship 01 GOKALIFREE has the largest showcase canvas.
 * 2) When stacked at top: 82px / 174px / 266px (92px step), all 3 cards share the exact same
 *    bottom edge (742px) and un-stick together as a single locked stack at 00:14.
 */
export const ProjectArtwork: React.FC<ProjectArtworkProps> = ({
  visual,
  large = false,
  featured = false,
  stackIndex = 0,
}) => {
  // Desktop bento grid heights graduated by 92px per stack level:
  // stackIndex 0 (Card 01): grid = 524px (large) / two 252px right cards + 20px gap
  // stackIndex 1 (Card 02): grid = 432px (large) / two 206px right cards + 20px gap
  // stackIndex 2 (Card 03): grid = 340px (large) / two 160px right cards + 20px gap
  const emptyLargeHeightClass =
    stackIndex === 1
      ? 'min-h-[220px] sm:min-h-[300px] lg:h-[432px]'
      : 'min-h-[220px] sm:min-h-[280px] lg:h-[340px]';

  const emptySmallHeightClass =
    stackIndex === 1
      ? 'min-h-[145px] sm:min-h-[165px] lg:h-[206px]'
      : 'min-h-[140px] sm:min-h-[155px] lg:h-[160px]';

  if (visual.theme === 'empty-slot') {
    return (
      <div
        className={`group relative w-full rounded-[22px] border border-dashed border-white/25 bg-[#090c15]/90 flex flex-col items-center justify-center p-4 sm:p-5 text-center transition-all duration-300 hover:border-[#ff4fa3]/65 hover:bg-[#0d111f] ${
          large ? emptyLargeHeightClass : emptySmallHeightClass
        }`}
      >
        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center text-[#ff9a3c] mb-2 transition-transform duration-300 group-hover:scale-105">
          <ImagePlus className="w-5 h-5" />
        </div>
        <p className="text-[11px] font-mono-num uppercase tracking-widest text-[#ff4fa3]">
          {visual.metricBadge}
        </p>
        <h4 className="text-sm sm:text-base font-bold text-white mt-0.5">
          {visual.title}
        </h4>
        <p className="text-xs text-[#eef0f5]/60 mt-0.5 max-w-sm">
          {visual.caption}
        </p>
      </div>
    );
  }

  const renderGoKaliFreeScene = () => {
    switch (visual.theme) {
      case 'gokalifree-tools':
        return (
          <svg
            viewBox="0 0 960 400"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full block"
          >
            <defs>
              <linearGradient id="gkfBgLarge" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#050814" />
                <stop offset="50%" stopColor="#110e2c" />
                <stop offset="100%" stopColor="#051622" />
              </linearGradient>
              <radialGradient id="gkfGlowPink" cx="25%" cy="20%" r="55%">
                <stop offset="0%" stopColor="#ff4fa3" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#ff4fa3" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="gkfGlowViolet" cx="80%" cy="75%" r="55%">
                <stop offset="0%" stopColor="#7b5cff" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#7b5cff" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="960" height="400" fill="url(#gkfBgLarge)" />
            <rect width="960" height="400" fill="url(#gkfGlowPink)" />
            <rect width="960" height="400" fill="url(#gkfGlowViolet)" />

            {/* Full Browser Window Frame for gokalifree.in */}
            <rect
              x="20"
              y="14"
              width="920"
              height="372"
              rx="16"
              fill="#060913"
              stroke="#ffffff"
              strokeOpacity="0.24"
              strokeWidth="1.5"
            />
            {/* Browser Top Chrome Bar */}
            <circle cx="48" cy="38" r="6" fill="#ff4fa3" />
            <circle cx="68" cy="38" r="6" fill="#ff9a3c" />
            <circle cx="88" cy="38" r="6" fill="#22c55e" />
            <rect x="116" y="24" width="490" height="28" rx="8" fill="#0f1526" stroke="#ffffff" strokeOpacity="0.1" />
            <text x="134" y="43" fill="#38bdf8" fontSize="13" fontFamily="JetBrains Mono, monospace">
              https://gokalifree.in/tools — Free Cybersecurity Platform
            </text>
            <rect x="786" y="24" width="132" height="28" rx="14" fill="#172554" stroke="#38bdf8" strokeOpacity="0.45" />
            <text x="804" y="42" fill="#7dd3fc" fontSize="11.5" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              70+ TOOLS LIVE
            </text>
            <line x1="20" y1="62" x2="940" y2="62" stroke="#ffffff" strokeOpacity="0.12" />

            {/* Hero Header Inside GoKaliFree Window */}
            <text x="48" y="98" fill="#ffffff" fontSize="22" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
              GO KALI FREE — Ethical Hacking, Kali Linux &amp; Security Hub
            </text>
            <text x="48" y="122" fill="#94a3b8" fontSize="13.5" fontFamily="JetBrains Mono, monospace">
              70+ Security Tools · 164 Linux Commands · 111 Educational Articles · Browser Sandbox
            </text>

            {/* 3 Large Tool Category Cards */}
            <rect x="48" y="140" width="276" height="118" rx="12" fill="#0d1324" stroke="#ff4fa3" strokeOpacity="0.65" strokeWidth="1.5" />
            <rect x="66" y="156" width="106" height="20" rx="6" fill="#ff4fa3" fillOpacity="0.15" />
            <text x="75" y="170" fill="#ff4fa3" fontSize="10.5" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              NETWORK RECON
            </text>
            <text x="66" y="198" fill="#ffffff" fontSize="18" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
              Nmap &amp; Wireshark
            </text>
            <text x="66" y="220" fill="#cbd5e1" fontSize="12" fontFamily="Plus Jakarta Sans, sans-serif">
              Port Scanning, Service Discovery
            </text>
            <text x="66" y="240" fill="#94a3b8" fontSize="11.5" fontFamily="JetBrains Mono, monospace">
              &amp; Deep Packet Inspection Labs
            </text>

            <rect x="342" y="140" width="276" height="118" rx="12" fill="#0d1324" stroke="#7b5cff" strokeOpacity="0.65" strokeWidth="1.5" />
            <rect x="360" y="156" width="104" height="20" rx="6" fill="#7b5cff" fillOpacity="0.2" />
            <text x="369" y="170" fill="#c4b5fd" fontSize="10.5" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              WEB SECURITY
            </text>
            <text x="360" y="198" fill="#ffffff" fontSize="18" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
              Burp Suite &amp; OWASP
            </text>
            <text x="360" y="220" fill="#cbd5e1" fontSize="12" fontFamily="Plus Jakarta Sans, sans-serif">
              HTTP Intercept Proxy, SQLi, XSS
            </text>
            <text x="360" y="240" fill="#94a3b8" fontSize="11.5" fontFamily="JetBrains Mono, monospace">
              &amp; OWASP Top 10 Testing Guides
            </text>

            <rect x="636" y="140" width="276" height="118" rx="12" fill="#0d1324" stroke="#ff9a3c" strokeOpacity="0.65" strokeWidth="1.5" />
            <rect x="654" y="156" width="92" height="20" rx="6" fill="#ff9a3c" fillOpacity="0.18" />
            <text x="663" y="170" fill="#ff9a3c" fontSize="10.5" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              LINUX CLI
            </text>
            <text x="654" y="198" fill="#ffffff" fontSize="18" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
              164 Linux Commands
            </text>
            <text x="654" y="220" fill="#cbd5e1" fontSize="12" fontFamily="Plus Jakarta Sans, sans-serif">
              File Permissions, Networking,
            </text>
            <text x="654" y="240" fill="#94a3b8" fontSize="11.5" fontFamily="JetBrains Mono, monospace">
              System Auditing &amp; Bash Filters
            </text>

            {/* Interactive Live Terminal Output Strip Inside Browser */}
            <rect x="48" y="272" width="864" height="98" rx="12" fill="#050811" stroke="#38bdf8" strokeOpacity="0.4" />
            <text x="68" y="296" fill="#38bdf8" fontSize="11.5" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              LIVE COMMAND SANDBOX · ZERO LOCAL SETUP REQUIRED
            </text>
            <text x="68" y="320" fill="#4ade80" fontSize="14" fontFamily="JetBrains Mono, monospace">
              root@gokalifree:~# nmap -sV -sC -T4 scanme.gokalifree.in
            </text>
            <text x="68" y="342" fill="#cbd5e1" fontSize="12.5" fontFamily="JetBrains Mono, monospace">
              PORT STATE SERVICE VERSION  ·  22/tcp open ssh  ·  80/tcp open http  ·  443/tcp open ssl/http
            </text>
            <text x="68" y="361" fill="#ff9a3c" fontSize="11.5" fontFamily="JetBrains Mono, monospace">
              [+] 70+ Security Tools · 164 Commands · 111 Articles Indexed on Google
            </text>
          </svg>
        );

      case 'gokalifree-sandbox':
        return (
          <svg
            viewBox="0 0 640 210"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full block"
          >
            <rect width="640" height="210" fill="#0b091b" />
            <rect
              x="16"
              y="12"
              width="608"
              height="186"
              rx="14"
              fill="#060812"
              stroke="#7b5cff"
              strokeOpacity="0.5"
              strokeWidth="1.5"
            />
            <circle cx="38" cy="32" r="5" fill="#ff4fa3" />
            <circle cx="54" cy="32" r="5" fill="#ff9a3c" />
            <circle cx="70" cy="32" r="5" fill="#22c55e" />
            <text x="90" y="36" fill="#ff9a3c" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              BROWSER TERMINAL SANDBOX &amp; SECURITY UTILITIES
            </text>
            <line x1="16" y1="48" x2="624" y2="48" stroke="#ffffff" strokeOpacity="0.1" />
            <text x="38" y="74" fill="#4ade80" fontSize="14" fontFamily="JetBrains Mono, monospace">
              $ whoami &amp;&amp; uname -a
            </text>
            <text x="38" y="98" fill="#e2e8f0" fontSize="13" fontFamily="JetBrains Mono, monospace">
              kali-learner · Linux gokalifree 6.6.15-amd64 #1 SMP
            </text>
            <rect
              x="38"
              y="112"
              width="564"
              height="42"
              rx="8"
              fill="#11162a"
              stroke="#ff4fa3"
              strokeOpacity="0.5"
            />
            <text x="54" y="138" fill="#ffffff" fontSize="13.5" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              SHA-256 · Base64 · URL Encoder · CIDR &amp; Port Lookup
            </text>
            <text x="38" y="180" fill="#94a3b8" fontSize="12.5" fontFamily="JetBrains Mono, monospace">
              Run Linux commands &amp; encoders safely inside your browser
            </text>
          </svg>
        );

      case 'gokalifree-articles':
      default:
        return (
          <svg
            viewBox="0 0 640 210"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-full block"
          >
            <rect width="640" height="210" fill="#07121c" />
            <rect
              x="16"
              y="12"
              width="608"
              height="186"
              rx="14"
              fill="#050811"
              stroke="#38bdf8"
              strokeOpacity="0.45"
              strokeWidth="1.5"
            />
            <text x="38" y="42" fill="#38bdf8" fontSize="14" fontWeight="bold" fontFamily="Plus Jakarta Sans, sans-serif">
              111 EDUCATIONAL ARTICLES &amp; TECHNICAL SEO CLUSTER
            </text>
            <text x="38" y="66" fill="#cbd5e1" fontSize="12" fontFamily="JetBrains Mono, monospace">
              OWASP Top 10 · Kali Linux Tutorials · Network Reconnaissance
            </text>
            <rect x="38" y="84" width="564" height="14" rx="7" fill="#1e293b" />
            <rect x="38" y="84" width="495" height="14" rx="7" fill="#ff4fa3" />
            <rect x="38" y="110" width="564" height="14" rx="7" fill="#1e293b" />
            <rect x="38" y="110" width="450" height="14" rx="7" fill="#7b5cff" />
            <rect x="38" y="136" width="564" height="14" rx="7" fill="#1e293b" />
            <rect x="38" y="136" width="525" height="14" rx="7" fill="#ff9a3c" />
            <text x="38" y="178" fill="#e2e8f0" fontSize="12.5" fontWeight="bold" fontFamily="JetBrains Mono, monospace">
              Sitemap Architecture · Keyword Clustering · Internal Linking
            </text>
          </svg>
        );
    }
  };

  return (
    <div
      className={`group w-full rounded-[22px] border border-white/20 bg-[#050814] hover:border-[#ff4fa3]/65 active:border-[#ff4fa3] active:scale-[0.99] transition-all flex flex-col justify-between overflow-hidden touch-manipulation ${
        large ? 'lg:h-[524px]' : 'lg:h-[252px]'
      }`}
    >
      {/* Uncropped Media Preview Frame */}
      <div
        className={`w-full bg-[#050814] overflow-hidden flex items-center justify-center flex-1 ${
          large
            ? 'min-h-[220px] sm:min-h-[300px] lg:min-h-0'
            : 'min-h-[140px] sm:min-h-[160px] lg:min-h-0'
        }`}
      >
        <div className="w-full h-full flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-[1.015]">
          {renderGoKaliFreeScene()}
        </div>
      </div>

      {/* Dedicated Non-Overlapping Caption Footer */}
      <div className="px-4 py-2.5 sm:px-5 sm:py-3 bg-[#080b15] border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] font-mono-num uppercase tracking-wider text-[#ff9a3c]">
            {visual.metricBadge}
          </p>
          <h4
            className={`font-bold text-white leading-snug mt-0.5 ${
              featured && large ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
            }`}
          >
            {visual.title}
          </h4>
          {visual.caption && (
            <p className="text-[11px] sm:text-xs text-[#eef0f5]/70 mt-0.5 line-clamp-1">
              {visual.caption}
            </p>
          )}
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 group-hover:bg-[#ff4fa3] group-hover:border-[#ff4fa3] group-active:bg-[#ff4fa3] group-active:border-[#ff4fa3] group-active:scale-95 transition-all">
          <ExternalLink className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
