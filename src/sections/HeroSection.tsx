import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolio';
import { MagneticButton } from '../components/MagneticButton';

// Helper to render text as word-wrapped, character-level spans for letter-by-letter typing
const renderCharSpans = (text: string) => {
  const words = text.split(/(\s+)/);
  return words.map((w, idx) => {
    if (/^\s+$/.test(w)) {
      return (
        <span key={idx} className="agent-char agent-space">
          {w}
        </span>
      );
    }
    return (
      <span key={idx} className="agent-word">
        {Array.from(w).map((ch, cIdx) => (
          <span key={cIdx} className="agent-char">
            {ch}
          </span>
        ))}
      </span>
    );
  });
};

export const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const titleWrapRef = useRef<HTMLDivElement | null>(null);
  const bottomRowRef = useRef<HTMLDivElement | null>(null);

  // Smooth 60fps scroll parallax on the full-screen hero as user scrolls down
  useEffect(() => {
    let rafId = 0;

    const updateHeroScroll = () => {
      const y = window.scrollY || 0;
      const vh = window.innerHeight || 900;
      const progress = Math.max(0, Math.min(1, y / vh));

      if (titleWrapRef.current) {
        const translateY = progress * -70;
        const scale = 1 - progress * 0.06;
        const opacity = Math.max(0, 1 - progress * 1.25);
        titleWrapRef.current.style.transform = `translate3d(0px, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        titleWrapRef.current.style.opacity = `${opacity.toFixed(2)}`;
      }

      if (bottomRowRef.current) {
        const translateY = progress * -40;
        const opacity = Math.max(0, 1 - progress * 1.4);
        bottomRowRef.current.style.transform = `translate3d(0px, ${translateY.toFixed(1)}px, 0)`;
        bottomRowRef.current.style.opacity = `${opacity.toFixed(2)}`;
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateHeroScroll);
    };

    updateHeroScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

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
      {/* Hero Swarm Mount — Canvas is attached here so it stays inside Hero on scroll */}
      <div id="hero-swarm-mount" className="absolute inset-0 pointer-events-none overflow-hidden z-30" />

      {/* Subtle Ambient Purple/Pink Glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[380px] rounded-full opacity-25 blur-[135px]"
        style={{
          background: 'radial-gradient(circle, #7b5cff 0%, #ff4fa3 55%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      {/* Giant Full-Width Uppercase Hero Heading: "HI, I'M NILESH" (Built LAST by 3 agents) */}
      <div ref={titleWrapRef} className="w-full overflow-hidden text-center pt-2 sm:pt-6 will-change-transform">
        <motion.h1
          id="hero-heading"
          data-swarm-target="hero-heading"
          initial={{ y: '90%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="w-full font-display uppercase hero-title-gradient text-[clamp(2.4rem,9.1vw,8.8rem)] tracking-tight leading-[0.94] sm:whitespace-nowrap select-none"
        >
          <span className="agent-word" data-word-idx="0">
            <span className="agent-char">H</span>
            <span className="agent-char">I</span>
            <span className="agent-char">,</span>
          </span>
          <span className="agent-char agent-space"> </span>
          <span className="agent-word" data-word-idx="1">
            <span className="agent-char">I</span>
            <span className="agent-char">&apos;</span>
            <span className="agent-char">M</span>
          </span>
          <span className="agent-char agent-space"> </span>
          <span className="agent-word" data-word-idx="2">
            <span className="agent-char">N</span>
            <span className="agent-char">I</span>
            <span className="agent-char">L</span>
            <span className="agent-char">E</span>
            <span className="agent-char">S</span>
            <span className="agent-char">H</span>
          </span>
        </motion.h1>
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
          data-swarm-target="hero-button"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.22 }}
          className="flex items-center gap-4 shrink-0"
        >
          <MagneticButton variant="gradient" href="#contact">
            CONTACT ME
          </MagneticButton>
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
