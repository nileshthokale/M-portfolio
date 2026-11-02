import React, { useEffect, useRef } from 'react';
import { PORTFOLIO_DATA } from '../data/portfolio';

export const FooterSection: React.FC = () => {
  const footerRef = useRef<HTMLElement | null>(null);
  const wordmarkRef = useRef<HTMLParagraphElement | null>(null);

  // Smooth scroll-linked slide-up transition overlapping the bottom of the light Contact section (Video 00:18-00:19)
  useEffect(() => {
    let rafId = 0;

    const updateFooter = () => {
      const el = footerRef.current;
      if (!el || !wordmarkRef.current) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const reveal = Math.max(0, Math.min(1, (vh - rect.top) / (vh * 0.45)));
      const eased = 1 - Math.pow(1 - reveal, 3);

      wordmarkRef.current.style.opacity = `${0.25 + eased * 0.75}`;
      wordmarkRef.current.style.transform = `translate3d(0px, ${((1 - eased) * 28).toFixed(1)}px, 0)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateFooter);
    };

    updateFooter();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative z-20 -mt-12 sm:-mt-16 rounded-t-[40px] sm:rounded-t-[52px] bg-black text-[#eef0f5] border-t border-white/15 pt-16 sm:pt-20 overflow-hidden"
    >
      <div className="max-w-[1380px] mx-auto px-5 sm:px-8 pb-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Giant Name Wordmark on Left (Video 00:19) */}
        <div className="lg:col-span-6">
          <p
            ref={wordmarkRef}
            className="font-display uppercase text-[clamp(2.6rem,6.5vw,5.5rem)] leading-[0.94] tracking-tight text-[#eef0f5] will-change-transform"
          >
            NILESH
            <br />
            THOKALE
          </p>
          <p className="mt-4 text-xs sm:text-sm text-[#eef0f5]/65 max-w-md">
            {PORTFOLIO_DATA.profile.role} at {PORTFOLIO_DATA.profile.university} · Creator of{' '}
            <a
              href="https://gokalifree.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff9a3c] hover:underline font-semibold"
            >
              GoKaliFree (gokalifree.in)
            </a>
          </p>
        </div>

        {/* SOCIAL Column */}
        <div className="lg:col-span-3">
          <h3 className="font-display text-xs uppercase tracking-widest text-[#eef0f5]">
            SOCIAL
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-[#eef0f5]/75">
            <li>
              <a
                href={PORTFOLIO_DATA.profile.socials.gokalifree}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#ff4fa3] transition-colors"
              >
                GoKaliFree (gokalifree.in)
              </a>
            </li>
            <li>
              <a
                href={PORTFOLIO_DATA.profile.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#ff4fa3] transition-colors"
              >
                GitHub (nileshthokale)
              </a>
            </li>
            <li>
              <a
                href={PORTFOLIO_DATA.profile.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#ff4fa3] transition-colors"
              >
                LinkedIn (nileshthokale)
              </a>
            </li>
            <li>
              <a
                href={PORTFOLIO_DATA.profile.resumePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#ff9a3c] transition-colors font-semibold"
              >
                Download Resume (PDF)
              </a>
            </li>
          </ul>
        </div>

        {/* CONTACT Column */}
        <div className="lg:col-span-3">
          <h3 className="font-display text-xs uppercase tracking-widest text-[#eef0f5]">
            CONTACT
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-[#eef0f5]/75">
            <li>
              <a
                href={`mailto:${PORTFOLIO_DATA.profile.email}`}
                className="hover:text-[#ff9a3c] transition-colors break-all"
              >
                {PORTFOLIO_DATA.profile.email}
              </a>
            </li>
            <li>
              <a
                href={`tel:${PORTFOLIO_DATA.profile.phone.replace(/\s+/g, '')}`}
                className="hover:text-[#ff9a3c] transition-colors font-mono-num"
              >
                {PORTFOLIO_DATA.profile.phone}
              </a>
            </li>
            <li>{PORTFOLIO_DATA.profile.location}</li>
            <li className="text-xs text-[#eef0f5]/50 pt-2">
              © {new Date().getFullYear()} Nilesh Thokale. All rights reserved.
            </li>
          </ul>
        </div>
      </div>

      {/* Signature Colorful Geometric 3D-Bauhaus Strip at Bottom Edge (Video 00:19) */}
      <div className="w-full overflow-hidden select-none pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1440 160" className="w-full h-auto block">
          <path d="M20 20 L140 140 M140 20 L20 140" stroke="#9333ea" strokeWidth="36" strokeLinecap="round" />
          <circle cx="205" cy="52" r="28" fill="#a855f7" />
          <circle cx="265" cy="52" r="28" fill="#a855f7" />
          <circle cx="205" cy="112" r="28" fill="#a855f7" />
          <circle cx="265" cy="112" r="28" fill="#a855f7" />
          <path d="M320 20 H390 V90 A45 45 0 0 1 300 90 V70 H345 V90 A10 10 0 0 0 365 90 V20 Z" fill="#3b82f6" />
          <circle cx="485" cy="82" r="64" fill="#7b5cff" />
          <rect x="575" y="20" width="44" height="124" rx="8" fill="#ff9a3c" />
          <path d="M620 20 H690 A34 34 0 0 1 690 88 H620 Z" fill="#ff9a3c" />
          <polygon points="620,84 715,144 655,144 620,110" fill="#ff9a3c" />
          <polygon points="740,144 740,20 860,144" fill="#3b82f6" />
          <polygon points="790,20 885,20 885,115" fill="#60a5fa" />
          <polygon points="915,20 1045,82 915,144" fill="#ff9a3c" />
          <polygon points="1045,20 915,82 1045,144" fill="#fb923c" />
          <rect x="1075" y="20" width="140" height="44" rx="10" fill="#a855f7" />
          <polygon points="1075,144 1145,74 1215,144" fill="#9333ea" />
          <circle cx="1325" cy="82" r="64" fill="#ff4fa3" />
          <circle cx="1325" cy="82" r="22" fill="#000000" />
        </svg>
      </div>
    </footer>
  );
};
