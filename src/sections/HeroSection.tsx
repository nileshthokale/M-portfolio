import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolio';
import { MagneticButton } from '../components/MagneticButton';
import { GlossyShape3D } from '../components/GlossyShape3D';

const renderCharSpans = (text: string) => {
  return text.split('').map((char, index) => (
    <span
      key={index}
      className={`agent-char ${char === ' ' ? 'agent-space' : ''}`}
    >
      {char}
    </span>
  ));
};

export const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const titleWrapRef = useRef<HTMLDivElement | null>(null);
  const bottomRowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let ticking = false;
    let rafId: number;

    const updateParallax = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const vh = window.innerHeight || 900;

      if (scrollY <= vh * 1.2) {
        if (titleWrapRef.current) {
          const titleY = scrollY * 0.18;
          titleWrapRef.current.style.transform = `translate3d(0, ${titleY}px, 0)`;
        }

        if (bottomRowRef.current) {
          const rowY = scrollY * 0.08;
          bottomRowRef.current.style.transform = `translate3d(0, ${rowY}px, 0)`;
        }
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateParallax();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative min-h-[calc(100vh-80px)] w-full max-w-[1440px] mx-auto flex flex-col justify-between pt-10 sm:pt-16 pb-6 px-4 sm:px-8 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Subtle Ambient Purple/Pink Glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[380px] rounded-full opacity-25 blur-[135px]"
        style={{
          background: 'radial-gradient(circle, #7b5cff 0%, #ff4fa3 55%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      {/* Giant Full-Width Uppercase Hero Heading: "HI, I'M NILESH" */}
      <div ref={titleWrapRef} className="w-full overflow-hidden text-center pt-2 sm:pt-6 will-change-transform">
        <h1
          id="hero-heading"
          aria-label="HI, I'M NILESH"
          className="w-full font-display uppercase text-[clamp(2.4rem,9.2vw,8.8rem)] tracking-tight leading-[0.96] select-none"
        >
          <span className="hero-word-mask" aria-hidden="true">
            <span className="hero-word-inner hero-title-gradient agent-word" data-word-idx="0">
              <span className="agent-char">H</span>
              <span className="agent-char">I</span>
              <span className="agent-char">,</span>
            </span>
          </span>{' '}
          <span className="hero-word-mask" aria-hidden="true">
            <span className="hero-word-inner hero-title-gradient agent-word" data-word-idx="1">
              <span className="agent-char">I</span>
              <span className="agent-char">&apos;</span>
              <span className="agent-char">M</span>
            </span>
          </span>
          <br className="block sm:hidden" />{' '}
          <span className="hero-word-mask" aria-hidden="true">
            <span className="hero-word-inner hero-title-gradient agent-word" data-word-idx="2">
              <span className="agent-char">N</span>
              <span className="agent-char">I</span>
              <span className="agent-char">L</span>
              <span className="agent-char">E</span>
              <span className="agent-char">S</span>
              <span className="agent-char">H</span>
            </span>
          </span>
        </h1>
      </div>

      {/* Mobile-Only Reactive 3D Glossy Blob */}
      <div id="mobile-hero-blob-wrap" className="block lg:hidden my-4 sm:my-6 flex justify-center">
        <div
          id="mobile-hero-blob"
          className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full cursor-grab active:cursor-grabbing select-none touch-none will-change-transform"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#7b5cff] via-[#ff4fa3] to-[#ff9a3c] p-[2px] shadow-[0_0_36px_rgba(255,79,163,0.35)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#120a26] via-[#24082e] to-[#0a0714] relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_60%)]" />
              <GlossyShape3D variant="silver-splash" className="w-16 h-16 sm:w-20 sm:h-20 opacity-90 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Center / Lower Full-Screen Row: Left Uppercase Subtitle | Right Glowing Gradient "CONTACT ME" Pill */}
      <div
        ref={bottomRowRef}
        className="my-auto py-10 sm:py-14 flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-10 px-2 sm:px-6 will-change-transform"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="max-w-[40ch] text-center sm:text-left"
        >
          <p
            data-swarm-target="hero-subtitle"
            className="text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-[0.06em] leading-relaxed text-[#eef0f5]"
          >
            {renderCharSpans(PORTFOLIO_DATA.profile.heroSubtitle)}
          </p>
          <p
            data-swarm-target="hero-location"
            className="mt-3 text-xs sm:text-sm text-[#eef0f5]/65 font-mono-num"
          >
            {renderCharSpans(`${PORTFOLIO_DATA.profile.location} · B.C.S. (CGPA 7.09) · M.Sc. Data Science (SPPU)`)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.22 }}
          className="flex items-center gap-4 shrink-0"
        >
          <div data-swarm-target="hero-button">
            <MagneticButton variant="gradient" href="#contact">
              CONTACT ME
            </MagneticButton>
          </div>
        </motion.div>
      </div>

      {/* Bottom Scroll Cue anchored at bottom of 100vh Hero */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2 sm:px-6 pt-4 border-t border-white/10 text-[11px] font-mono-num uppercase tracking-[0.2em] text-[#eef0f5]/55">
        <span data-swarm-target="hero-bottom" className="text-center sm:text-left">
          {renderCharSpans('GOKALIFREE.IN · CYBERSECURITY & WEB ENGINEERING')}
        </span>
        <a
          href="#about"
          data-swarm-target="hero-explore"
          className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full text-[#eef0f5]/80 hover:text-white active:bg-white/10 active:scale-95 transition-all touch-manipulation"
        >
          <span>SCROLL TO EXPLORE</span>
          <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#ff4fa3]" />
        </a>
      </div>
    </section>
  );
};
