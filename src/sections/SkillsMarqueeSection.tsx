import React from 'react';
import { Shield, Terminal, Code2, Database, Cpu, Globe, Lock, Sparkles } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolio';

const SKILL_ICONS = [Terminal, Globe, Code2, Shield, Lock, Database, Cpu, Sparkles];

export const SkillsMarqueeSection: React.FC = () => {
  const marqueeItems = [...PORTFOLIO_DATA.skillsMarquee, ...PORTFOLIO_DATA.skillsMarquee];

  return (
    <section
      aria-label="Core Technical Skills Ticker"
      className="w-full overflow-hidden border-y border-white/10 bg-black py-5"
    >
      <div className="relative w-full overflow-hidden">
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
    </section>
  );
};
