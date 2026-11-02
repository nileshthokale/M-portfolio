import React, { useEffect, useRef } from 'react';
import { PORTFOLIO_DATA } from '../data/portfolio';
import { GlossyShape3D } from '../components/GlossyShape3D';
import { MagneticButton } from '../components/MagneticButton';

export const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const textWrapRef = useRef<HTMLDivElement | null>(null);
  const ctaWrapRef = useRef<HTMLDivElement | null>(null);
  const topLeftShapeRef = useRef<HTMLDivElement | null>(null);
  const bottomLeftShapeRef = useRef<HTMLDivElement | null>(null);
  const topRightShapeRef = useRef<HTMLDivElement | null>(null);
  const bottomRightShapeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let ticking = false;

    const updateOnScroll = () => {
      const section = sectionRef.current;
      if (!section) {
        ticking = false;
        return;
      }

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // Normalize progress: 0 when section top enters bottom of screen, 1 when section reaches upper third
      const rawProgress = (vh * 0.85 - rect.top) / (vh * 0.65);
      const p = Math.max(0, Math.min(1, rawProgress));

      // 1. Heading transitions from outlined stroke (00:04) to solid white fill (00:06)
      if (headingRef.current) {
        if (p > 0.52) {
          headingRef.current.classList.remove('text-outline-white');
          headingRef.current.classList.add('text-[#eef0f5]');
        } else {
          headingRef.current.classList.add('text-outline-white');
          headingRef.current.classList.remove('text-[#eef0f5]');
        }
      }

      // 2. Center-outward horizontal clip-path reveal on bio lines (Matches 00:05 -> 00:06 of video!)
      if (textWrapRef.current) {
        const insetSide = Math.max(0, (1 - p * 1.15) * 42);
        const opacity = Math.max(0.15, Math.min(1, p * 1.35));
        textWrapRef.current.style.clipPath = `inset(0% ${insetSide.toFixed(1)}% 0% ${insetSide.toFixed(1)}%)`;
        textWrapRef.current.style.opacity = opacity.toFixed(2);
      }

      // 3. CTA pill reveal
      if (ctaWrapRef.current) {
        const ctaProgress = Math.max(0, Math.min(1, (p - 0.35) / 0.55));
        ctaWrapRef.current.style.opacity = ctaProgress.toFixed(2);
        ctaWrapRef.current.style.transform = `translate3d(0, ${((1 - ctaProgress) * 24).toFixed(1)}px, 0)`;
      }

      // 4. 4 Glossy 3D Shapes float & parallax in from corners (Matches 00:05-00:06 of video)
      const shift = (1 - p) * 55;
      if (topLeftShapeRef.current) {
        topLeftShapeRef.current.style.transform = `translate3d(${-shift.toFixed(1)}px, ${(-shift * 0.6).toFixed(1)}px, 0)`;
      }
      if (bottomLeftShapeRef.current) {
        bottomLeftShapeRef.current.style.transform = `translate3d(${(-shift * 0.8).toFixed(1)}px, ${(shift * 0.9).toFixed(1)}px, 0)`;
      }
      if (topRightShapeRef.current) {
        topRightShapeRef.current.style.transform = `translate3d(${shift.toFixed(1)}px, ${(-shift * 0.7).toFixed(1)}px, 0)`;
      }
      if (bottomRightShapeRef.current) {
        bottomRightShapeRef.current.style.transform = `translate3d(${(shift * 0.85).toFixed(1)}px, ${(shift * 0.85).toFixed(1)}px, 0)`;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateOnScroll);
      }
    };

    updateOnScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      aria-labelledby="about-heading"
      className="scroll-mt-20 relative py-28 sm:py-40 px-5 sm:px-8 max-w-[1380px] mx-auto overflow-hidden"
    >
      {/* 4 Corner Glossy 3D Shapes with Scroll Parallax (Matches 00:05-00:06 of reference video) */}
      <div
        ref={topLeftShapeRef}
        className="hidden sm:block absolute top-10 left-4 lg:left-8 w-28 h-28 lg:w-44 lg:h-44 will-change-transform"
      >
        <GlossyShape3D variant="silver-splash" className="w-full h-full animate-float-slow" />
      </div>

      <div
        ref={bottomLeftShapeRef}
        className="hidden sm:block absolute bottom-10 left-6 lg:left-16 w-28 h-28 lg:w-40 lg:h-40 will-change-transform"
      >
        <GlossyShape3D variant="red-heart" className="w-full h-full animate-float-reverse" />
      </div>

      <div
        ref={topRightShapeRef}
        className="hidden sm:block absolute top-8 right-4 lg:right-10 w-28 h-28 lg:w-40 lg:h-40 will-change-transform"
      >
        <GlossyShape3D variant="crystal-sphere" className="w-full h-full animate-float-reverse" />
      </div>

      <div
        ref={bottomRightShapeRef}
        className="hidden sm:block absolute bottom-12 right-6 lg:right-14 w-28 h-28 lg:w-44 lg:h-44 will-change-transform"
      >
        <GlossyShape3D variant="violet-flower" className="w-full h-full animate-float-slow" />
      </div>

      {/* Centered Content Block */}
      <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
        <h2
          id="about-heading"
          ref={headingRef}
          className="font-display uppercase text-[clamp(2.85rem,8.5vw,7rem)] tracking-tight transition-colors duration-300 text-[#eef0f5]"
        >
          {PORTFOLIO_DATA.about.heading}
        </h2>

        <div
          ref={textWrapRef}
          className="mt-8 sm:mt-10 space-y-2.5 text-base sm:text-xl font-bold leading-relaxed text-[#eef0f5] max-w-[54ch] will-change-transform"
        >
          {PORTFOLIO_DATA.about.lines.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>

        <div ref={ctaWrapRef} className="mt-10 will-change-transform">
          <MagneticButton variant="gradient" href="#contact">
            {PORTFOLIO_DATA.about.ctaLabel}
          </MagneticButton>
        </div>
      </div>
    </section>
  );
};
