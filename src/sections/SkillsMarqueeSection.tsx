import React, { useEffect, useRef } from 'react';
import { Shield, Terminal, Code2, Database, Cpu, Globe, Lock, Sparkles } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolio';

const SKILL_ICONS = [Terminal, Globe, Code2, Shield, Lock, Database, Cpu, Sparkles];

const SHOWCASE_CARDS = [
  {
    id: 'reel-1',
    title: 'GoKaliFree (gokalifree.in)',
    subtitle: '70+ Security Tools · 164 Commands',
    gradient: 'radial-gradient(circle at 30% 30%, #ff9a3c 0%, #ff4fa3 48%, #2e1065 100%)',
    orbs: ['#fef08a', '#ff4fa3', '#7b5cff'],
  },
  {
    id: 'reel-2',
    title: 'Browser Terminal Sandbox',
    subtitle: 'Practice Linux & Recon In-Browser',
    gradient: 'radial-gradient(circle at 70% 25%, #38bdf8 0%, #7b5cff 52%, #090d16 100%)',
    orbs: ['#38bdf8', '#a855f7', '#ec4899'],
  },
  {
    id: 'reel-3',
    title: '111 Security Articles & SEO',
    subtitle: 'OWASP Top 10 · Nmap · Burp Suite',
    gradient: 'radial-gradient(circle at 35% 70%, #facc15 0%, #fb7185 50%, #4c1d95 100%)',
    orbs: ['#fde047', '#fb923c', '#c084fc'],
  },
  {
    id: 'reel-4',
    title: 'React.js, TypeScript & Node.js',
    subtitle: 'SPPU B.C.S. (7.09) & M.Sc. Data Science',
    gradient: 'radial-gradient(circle at 65% 65%, #c084fc 0%, #6366f1 48%, #0f172a 100%)',
    orbs: ['#e879f9', '#818cf8', '#38bdf8'],
  },
];

export const SkillsMarqueeSection: React.FC = () => {
  const reelRef = useRef<HTMLDivElement | null>(null);
  const marqueeItems = [...PORTFOLIO_DATA.skillsMarquee, ...PORTFOLIO_DATA.skillsMarquee];

  useEffect(() => {
    let ticking = false;
    const updateReel = () => {
      if (reelRef.current) {
        const y = window.scrollY;
        const shift = Math.sin(y * 0.0025) * 28;
        reelRef.current.style.transform = `translate3d(${shift.toFixed(1)}px, 0, 0)`;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateReel);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      aria-label="Core Technical Skills and Visual Showcase"
      className="py-6 sm:py-10 overflow-hidden"
    >
      {/* 1. Infinite Monochrome Logo Strip (Matches 00:02 of video) */}
      <div className="relative w-full overflow-hidden py-5 border-t border-white/10">
        <div className="animate-marquee-css gap-12 sm:gap-20 px-4">
          {marqueeItems.map((skill, idx) => {
            const Icon = SKILL_ICONS[idx % SKILL_ICONS.length];
            return (
              <div
                key={`${skill.name}-${idx}`}
                className="flex items-center gap-3 text-[#eef0f5] shrink-0"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display text-sm sm:text-base tracking-wide uppercase whitespace-nowrap">
                    {skill.name}
                  </p>
                  <p className="text-[11px] text-[#eef0f5]/60 whitespace-nowrap">
                    {skill.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Glossy 3D Fluid Showcase Strip (Matches 00:02-00:04 of video) */}
      <div className="mt-4 px-4 sm:px-8 max-w-[1420px] mx-auto overflow-hidden">
        <div
          ref={reelRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 will-change-transform"
        >
          {SHOWCASE_CARDS.map((card) => (
            <div
              key={card.id}
              className="group relative h-[200px] sm:h-[225px] rounded-[24px] overflow-hidden border border-white/25 p-5 flex flex-col justify-end"
              style={{ background: card.gradient }}
            >
              <svg
                viewBox="0 0 300 200"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
                aria-hidden="true"
              >
                <defs>
                  <radialGradient id={`g1-${card.id}`} cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="40%" stopColor={card.orbs[0]} />
                    <stop offset="100%" stopColor={card.orbs[2]} />
                  </radialGradient>
                  <radialGradient id={`g2-${card.id}`} cx="35%" cy="28%" r="70%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="45%" stopColor={card.orbs[1]} />
                    <stop offset="100%" stopColor="#090a10" />
                  </radialGradient>
                </defs>
                <circle cx="220" cy="65" r="56" fill={`url(#g1-${card.id})`} />
                <circle cx="115" cy="95" r="42" fill={`url(#g2-${card.id})`} />
                <circle cx="170" cy="135" r="28" fill={`url(#g1-${card.id})`} />
                <circle cx="75" cy="52" r="22" fill={`url(#g1-${card.id})`} opacity="0.85" />
              </svg>

              <div className="relative z-10 bg-gradient-to-t from-black/85 via-black/45 to-transparent -mx-5 -mb-5 p-5">
                <p className="text-[11px] font-mono-num uppercase tracking-wider text-white/80">
                  {card.subtitle}
                </p>
                <h3 className="text-base font-bold text-white mt-0.5">{card.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
