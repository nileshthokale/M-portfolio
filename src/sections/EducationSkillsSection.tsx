import React, { useEffect, useRef, useState } from 'react';
import { Award, Cpu, FileText, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolio';
import { filterSkillCategories } from '../lib/portfolioLogic';
import { GlossyShape3D } from '../components/GlossyShape3D';
import { MagneticButton } from '../components/MagneticButton';

export const EducationSkillsSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const sectionRef = useRef<HTMLElement | null>(null);
  const starOrbRef = useRef<HTMLDivElement | null>(null);
  const wowOrbRef = useRef<HTMLDivElement | null>(null);
  const flowerOrbRef = useRef<HTMLDivElement | null>(null);
  const headingLine1Ref = useRef<HTMLSpanElement | null>(null);
  const headingLine2Ref = useRef<HTMLSpanElement | null>(null);
  const summaryBannerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filteredCategories = filterSkillCategories(
    PORTFOLIO_DATA.skillCategories,
    selectedCategory
  );

  // 60fps scroll-driven choreography: split heading reveal, counter-sliding rows, 3D card tilt & active center glow
  useEffect(() => {
    let rafId = 0;

    const updateScrollAnimation = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      const viewportCenter = vh * 0.52;

      // Overall section progress (0 when entering bottom, 1 when leaving top)
      const sectionProgress = Math.max(
        0,
        Math.min(1, (vh - rect.top) / (vh + rect.height))
      );

      // 1. Split Heading Reveal (Line 1 slides from left + outline-to-solid, Line 2 slides from right)
      const headingProgress = Math.max(
        0,
        Math.min(1, (vh * 0.9 - rect.top) / (vh * 0.45))
      );
      const easedHeading = 1 - Math.pow(1 - headingProgress, 3);

      if (headingLine1Ref.current) {
        const x1 = (1 - easedHeading) * -90;
        const y1 = (1 - easedHeading) * 28;
        headingLine1Ref.current.style.transform = `translate3d(${x1.toFixed(1)}px, ${y1.toFixed(1)}px, 0)`;
        headingLine1Ref.current.style.opacity = `${(0.2 + easedHeading * 0.8).toFixed(2)}`;
        headingLine1Ref.current.style.color =
          easedHeading > 0.35
            ? `rgba(238, 240, 245, ${((easedHeading - 0.35) / 0.65).toFixed(2)})`
            : 'transparent';
      }

      if (headingLine2Ref.current) {
        const x2 = (1 - easedHeading) * 90;
        const y2 = (1 - easedHeading) * 36;
        headingLine2Ref.current.style.transform = `translate3d(${x2.toFixed(1)}px, ${y2.toFixed(1)}px, 0)`;
        headingLine2Ref.current.style.opacity = `${(0.2 + easedHeading * 0.8).toFixed(2)}`;
      }

      // 2. Floating 3D Orbs Multi-Speed Scroll Parallax
      if (starOrbRef.current) {
        const y = (0.5 - sectionProgress) * 140;
        const x = Math.sin(sectionProgress * Math.PI * 2) * 18;
        const rot = (sectionProgress - 0.5) * 55;
        starOrbRef.current.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg)`;
      }

      if (wowOrbRef.current) {
        const y = (sectionProgress - 0.5) * -150;
        const x = Math.cos(sectionProgress * Math.PI * 2) * -16;
        const rot = (0.5 - sectionProgress) * 50;
        wowOrbRef.current.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg)`;
      }

      if (flowerOrbRef.current) {
        const y = (0.5 - sectionProgress) * -110;
        const rot = sectionProgress * 90;
        flowerOrbRef.current.style.transform = `translate3d(0px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg)`;
      }

      // 3. Per-Card 3D Scroll Choreography (Staggered wave + Row counter-drift + Center focus glow)
      cardRefs.current.forEach((card, idx) => {
        if (!card) return;
        const cRect = card.getBoundingClientRect();
        const cardCenter = cRect.top + cRect.height * 0.5;

        // Entry progress from bottom of viewport (staggered by column 0, 1, 2)
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        const staggerOffset = col * 55;
        const rawEntry = (vh * 0.96 - (cRect.top + staggerOffset * 0.35)) / (vh * 0.48);
        const entry = Math.max(0, Math.min(1, rawEntry));
        const easedEntry = 1 - Math.pow(1 - entry, 3);

        // Distance from viewport center for focus spotlight & scale
        const distFromCenter = (cardCenter - viewportCenter) / (vh * 0.58);
        const absDist = Math.min(1, Math.abs(distFromCenter));
        const centerFocus = 1 - absDist; // 1 at viewport center, 0 at edges

        // Counter-horizontal drift between Row 0 and Row 1 as user scrolls
        const rowDirection = row % 2 === 0 ? 1 : -1;
        const driftX = distFromCenter * rowDirection * -26 + (1 - easedEntry) * (col - 1) * 34;
        const liftY = (1 - easedEntry) * 75 + distFromCenter * 14;
        const scale = 0.9 + easedEntry * 0.06 + centerFocus * 0.055;
        const rotateX = (1 - easedEntry) * 14 - distFromCenter * 6;
        const rotateY = (col - 1) * (1 - centerFocus) * -4;
        const opacity = Math.max(0.18, Math.min(1, 0.18 + easedEntry * 0.52 + centerFocus * 0.35));

        card.style.opacity = `${opacity.toFixed(3)}`;
        card.style.transform = `perspective(1100px) translate3d(${driftX.toFixed(1)}px, ${liftY.toFixed(1)}px, 0) scale(${scale.toFixed(3)}) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg)`;

        // Dynamic border & glow intensity when near viewport center
        const borderAlpha = (0.22 + centerFocus * 0.65).toFixed(2);
        card.style.borderColor =
          centerFocus > 0.55
            ? `rgba(255, 79, 163, ${borderAlpha})`
            : `rgba(255, 255, 255, ${borderAlpha})`;
        card.style.boxShadow =
          centerFocus > 0.5
            ? `0 22px 50px -18px rgba(123, 92, 255, ${(centerFocus * 0.38).toFixed(2)})`
            : 'none';

        // Animate mastery progress bar width on scroll
        const bar = barRefs.current[idx];
        if (bar) {
          const targetWidth = Math.max(15, Math.min(100, Math.round(easedEntry * (86 + (idx % 3) * 5))));
          bar.style.width = `${targetWidth}%`;
        }
      });

      // 4. Bottom SPPU Summary Banner Scroll Reveal
      if (summaryBannerRef.current) {
        const bRect = summaryBannerRef.current.getBoundingClientRect();
        const bReveal = Math.max(0, Math.min(1, (vh * 0.95 - bRect.top) / (vh * 0.35)));
        const bEased = 1 - Math.pow(1 - bReveal, 3);
        summaryBannerRef.current.style.opacity = `${(0.2 + bEased * 0.8).toFixed(2)}`;
        summaryBannerRef.current.style.transform = `translate3d(0px, ${((1 - bEased) * 40).toFixed(1)}px, 0) scale(${(0.95 + bEased * 0.05).toFixed(3)})`;
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScrollAnimation);
    };

    updateScrollAnimation();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [filteredCategories.length]);

  return (
    <section
      id="education"
      ref={sectionRef}
      aria-labelledby="education-heading"
      className="scroll-mt-20 relative py-28 sm:py-36 px-5 sm:px-8 max-w-[1380px] mx-auto overflow-hidden"
    >
      {/* Ambient Background Glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[420px] rounded-full opacity-20 blur-[140px]"
        style={{
          background: 'radial-gradient(circle, #7b5cff 0%, #ff4fa3 50%, transparent 75%)',
        }}
        aria-hidden="true"
      />

      {/* Floating 3D Orbs with Strong Scroll Parallax */}
      <div
        ref={starOrbRef}
        className="hidden sm:block absolute top-10 right-6 lg:right-12 w-28 h-28 lg:w-40 lg:h-40 pointer-events-none will-change-transform z-10"
      >
        <GlossyShape3D variant="star-orb" className="w-full h-full" />
      </div>

      <div
        ref={wowOrbRef}
        className="hidden sm:block absolute bottom-14 left-4 lg:left-8 w-28 h-28 lg:w-40 lg:h-40 pointer-events-none will-change-transform z-10"
      >
        <GlossyShape3D variant="wow-orb" className="w-full h-full" />
      </div>

      <div
        ref={flowerOrbRef}
        className="hidden lg:block absolute top-1/2 -right-6 w-28 h-28 opacity-80 pointer-events-none will-change-transform z-10"
      >
        <GlossyShape3D variant="violet-flower" className="w-full h-full" />
      </div>

      {/* Centered Giant Split-Scroll Heading */}
      <div className="relative z-20 text-center max-w-4xl mx-auto">
        <p className="inline-flex items-center gap-2 text-xs font-mono-num uppercase tracking-[0.22em] text-[#ff9a3c]">
          <Sparkles className="w-3.5 h-3.5 text-[#ff4fa3]" />
          <span>SAVITRIBAI PHULE PUNE UNIVERSITY (SPPU) &amp; TECHNICAL ARSENAL</span>
        </p>

        <h2
          id="education-heading"
          className="mt-4 font-display uppercase text-[clamp(2.3rem,5.8vw,4.8rem)] leading-[0.96] tracking-tight flex flex-col items-center select-none"
        >
          <span
            ref={headingLine1Ref}
            className="block will-change-transform"
            style={{
              WebkitTextStroke: '1.5px rgba(238, 240, 245, 0.92)',
              color: '#eef0f5',
            }}
          >
            EDUCATION &amp;
          </span>
          <span
            ref={headingLine2Ref}
            className="block hero-title-gradient will-change-transform"
          >
            TECHNICAL SKILLS
          </span>
        </h2>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <MagneticButton
            variant="gradient"
            href={PORTFOLIO_DATA.profile.resumePdfUrl}
            external
            ariaLabel="Download Nilesh Thokale Resume PDF"
          >
            <FileText className="w-4 h-4" />
            <span>DOWNLOAD RESUME (PDF)</span>
          </MagneticButton>
        </div>
      </div>

      {/* Interactive Category Filter Bar */}
      <div
        className="relative z-20 mt-10 flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-[#0b0d14]/90 border border-white/15 rounded-full max-w-fit mx-auto backdrop-blur-md"
        role="group"
        aria-label="Filter Education and Technical Skills by Category"
      >
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-[#ff4fa3] via-[#7b5cff] to-[#ff9a3c] text-white'
              : 'text-[#eef0f5]/70 hover:text-white'
          }`}
        >
          All ({PORTFOLIO_DATA.skillCategories.length})
        </button>
        {PORTFOLIO_DATA.skillCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-[#ff4fa3] via-[#7b5cff] to-[#ff9a3c] text-white'
                : 'text-[#eef0f5]/70 hover:text-white'
            }`}
          >
            {cat.category.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* Scroll-Choreographed 2x3 3D Card Grid */}
      <div className="relative z-20 mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {filteredCategories.map((group, idx) => {
          const isEducation = group.id.startsWith('education-');
          const numberLabel = String(idx + 1).padStart(2, '0');

          return (
            <article
              key={group.id}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              className="group relative rounded-[28px] border border-white/30 bg-[#070910]/95 p-7 sm:p-8 flex flex-col justify-between gap-6 will-change-transform transition-colors overflow-hidden"
            >
              {/* Subtle Top-Right Outlined Index Number */}
              <span
                className="pointer-events-none absolute top-5 right-6 font-display text-3xl sm:text-4xl select-none opacity-25 group-hover:opacity-60 transition-opacity"
                style={{
                  WebkitTextStroke: '1px rgba(238, 240, 245, 0.6)',
                  color: 'transparent',
                }}
                aria-hidden="true"
              >
                {numberLabel}
              </span>

              {/* Top Content: Circular Avatar/Icon Badge + Category & Subtitle */}
              <div>
                <div className="flex items-center gap-4 pr-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-110 ${
                      isEducation
                        ? 'bg-[#7b5cff]/20 border-[#7b5cff]/60 text-[#ff9a3c]'
                        : 'bg-[#ff4fa3]/15 border-[#ff4fa3]/50 text-[#ff4fa3]'
                    }`}
                  >
                    {isEducation ? (
                      <GraduationCap className="w-6 h-6" />
                    ) : idx % 2 === 0 ? (
                      <ShieldCheck className="w-6 h-6" />
                    ) : (
                      <Cpu className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-display text-sm sm:text-base uppercase text-white tracking-tight leading-snug">
                      {group.category}
                    </h3>
                    <p className="mt-0.5 text-xs font-mono-num text-[#ff9a3c]">
                      {isEducation
                        ? 'SAVITRIBAI PHULE PUNE UNIVERSITY'
                        : `DOMAIN · ${group.badge || 'TECH'}`}
                    </p>
                  </div>
                </div>

                {/* Description Summary */}
                <p className="mt-5 text-sm text-[#eef0f5]/80 leading-relaxed">
                  {group.summary}
                </p>
              </div>

              {/* Scroll-Animated Mastery Bar + Skill List */}
              <div className="space-y-3.5">
                <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    ref={(el) => {
                      barRefs.current[idx] = el;
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-[#ff4fa3] via-[#7b5cff] to-[#ff9a3c] transition-[width] duration-300 ease-out"
                    style={{ width: '85%' }}
                  />
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs font-mono-num text-[#eef0f5]/90">
                  {group.skills.map((skill, sIdx) => (
                    <React.Fragment key={skill}>
                      {sIdx > 0 && (
                        <span className="text-[#ff4fa3]" aria-hidden="true">
                          ·
                        </span>
                      )}
                      <span>{skill}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* SPPU Academic Summary Banner with Scroll Reveal */}
      <div
        ref={summaryBannerRef}
        className="relative z-20 mt-10 rounded-[26px] border border-white/25 bg-[#080a12] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 will-change-transform"
      >
        <div className="flex items-center gap-3.5">
          <Award className="w-6 h-6 text-[#4ade80] shrink-0" />
          <p className="text-xs sm:text-sm text-[#eef0f5]/90">
            <strong className="text-white">Savitribai Phule Pune University (SPPU):</strong>{' '}
            M.Sc. in Data Science (Pursuing, 2026–Present) &amp; B.C.S. Bachelor of Computer Science (2023–2026 ·{' '}
            <span className="text-[#4ade80] font-mono-num font-bold">
              CGPA 7.09 · Final Grade A
            </span>
            )
          </p>
        </div>
        <span className="text-xs font-mono-num uppercase tracking-wider text-[#ff9a3c] shrink-0">
          Ahilyanagar, Maharashtra
        </span>
      </div>
    </section>
  );
};
