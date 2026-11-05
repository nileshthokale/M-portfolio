import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, Globe } from 'lucide-react';
import { PORTFOLIO_DATA, ProjectItem } from '../data/portfolio';
import { MagneticButton } from '../components/MagneticButton';
import { ProjectArtwork } from '../components/ProjectArtwork';

// Configurable mobile project card behavior:
// 'auto': stacks if card fits on screen, normal flow otherwise
// 'stack': forces sticky stack
// 'flow': forces normal flow for all cards without sticky
export type ProjectCardMode = 'auto' | 'stack' | 'flow';
export const PROJECT_CARD_MODE: ProjectCardMode = ('auto' as ProjectCardMode);

interface ProjectsSectionProps {
  onOpenProject: (slug: string) => void;
}

// Compact Mobile 16:10 Horizontal Swipe Gallery with Dots
const MobileProjectGallery: React.FC<{
  project: ProjectItem;
  isFlagship: boolean;
  isEmpty: boolean;
  index: number;
  onOpen: () => void;
}> = ({ project, isFlagship, isEmpty, index, onOpen }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Single slide for empty template, full set for flagship
  const previews = isEmpty ? [project.previews[0]] : project.previews;

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const slideW = el.clientWidth || 1;
    const newSlide = Math.round(el.scrollLeft / slideW);
    setActiveSlide(Math.max(0, Math.min(previews.length - 1, newSlide)));
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-[20px] aspect-[16/10] bg-[#050814] border border-white/20 touch-pan-x"
      >
        {previews.map((preview, pIdx) => (
          <div
            key={pIdx}
            className="w-full h-full shrink-0 snap-center overflow-hidden flex flex-col"
            onClick={onOpen}
          >
            <ProjectArtwork
              visual={preview}
              large={pIdx === 0}
              featured={isFlagship}
              stackIndex={index}
            />
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      {previews.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-1">
          {previews.map((_, pIdx) => (
            <button
              key={pIdx}
              type="button"
              onClick={() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollTo({
                    left: pIdx * scrollRef.current.clientWidth,
                    behavior: 'smooth',
                  });
                }
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeSlide === pIdx
                  ? 'w-6 bg-gradient-to-r from-[#ff4fa3] to-[#ff9a3c]'
                  : 'w-1.5 bg-white/25'
              }`}
              aria-label={`Go to slide ${pIdx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onOpenProject }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [canCardStack, setCanCardStack] = useState<boolean[]>([true, true, true]);

  useEffect(() => {
    const checkCardHeights = () => {
      const isMobile = window.innerWidth < 1024;
      if (!isMobile) {
        setCanCardStack([true, true, true]);
        return;
      }

      if (PROJECT_CARD_MODE === 'flow') {
        setCanCardStack([false, false, false]);
        return;
      }
      if (PROJECT_CARD_MODE === 'stack') {
        setCanCardStack([true, true, true]);
        return;
      }

      // 'auto' mode: only cards that fit (100svh - headerOffset - 32px) may stick
      const vh = window.visualViewport?.height || window.innerHeight || 800;
      const headerOffset = 64;
      const maxAllowedHeight = vh - headerOffset - 32;

      const fits = cardRefs.current.map((card) => {
        if (!card) return true;
        const h = card.offsetHeight || card.getBoundingClientRect().height;
        return h <= maxAllowedHeight;
      });

      setCanCardStack(fits);
    };

    checkCardHeights();
    window.addEventListener('resize', checkCardHeights);
    window.addEventListener('orientationchange', checkCardHeights);
    return () => {
      window.removeEventListener('resize', checkCardHeights);
      window.removeEventListener('orientationchange', checkCardHeights);
    };
  }, []);

  useEffect(() => {
    let ticking = false;

    const updateOnScroll = () => {
      const vh = window.innerHeight || 900;

      if (headingRef.current) {
        const hRect = headingRef.current.getBoundingClientRect();
        if (hRect.top < vh * 0.68) {
          headingRef.current.classList.remove('text-outline-white');
          headingRef.current.classList.add('text-[#eef0f5]');
        } else {
          headingRef.current.classList.add('text-outline-white');
          headingRef.current.classList.remove('text-[#eef0f5]');
        }
      }

      // Highlight project numbers 01, 02, 03 from outline to solid white as each card stacks into view (video 00:11 -> 00:13)
      cardRefs.current.forEach((card, index) => {
        const numEl = numRefs.current[index];
        if (!card || !numEl) return;
        const rect = card.getBoundingClientRect();
        const stickyTarget = 82 + index * 92;
        if (index === 0 || rect.top <= stickyTarget + 80) {
          numEl.classList.remove('text-outline-white');
          numEl.classList.add('text-[#eef0f5]');
        } else {
          numEl.classList.add('text-outline-white');
          numEl.classList.remove('text-[#eef0f5]');
        }
      });

      // Keep the 3-card stack locked together when scrolling out of view:
      // The last card (Card 03) hits the bottom of the section first at top: 266px.
      // If Card 03 is pushed upward (lastCardRect.top < lastStickyTop), all preceding cards
      // (Card 01 & 02) lift in exact lockstep so Card 03 never blocks or covers them.
      const isDesktop = window.innerWidth >= 1024;
      const lastIndex = cardRefs.current.length - 1;
      const lastCard = cardRefs.current[lastIndex];

      if (isDesktop && lastCard) {
        const lastCardRect = lastCard.getBoundingClientRect();
        const lastStickyTop = 82 + lastIndex * 92;
        if (lastCardRect.top < lastStickyTop) {
          const liftDelta = lastStickyTop - lastCardRect.top;
          for (let i = 0; i < lastIndex; i++) {
            const prevCard = cardRefs.current[i];
            if (prevCard) {
              prevCard.style.transform = `translate3d(0, -${liftDelta}px, 0)`;
            }
          }
        } else {
          for (let i = 0; i < lastIndex; i++) {
            const prevCard = cardRefs.current[i];
            if (prevCard && prevCard.style.transform) {
              prevCard.style.transform = '';
            }
          }
        }
      } else {
        for (let i = 0; i < lastIndex; i++) {
          const prevCard = cardRefs.current[i];
          if (prevCard && prevCard.style.transform) {
            prevCard.style.transform = '';
          }
        }
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
      id="projects"
      ref={sectionRef}
      aria-labelledby="projects-heading"
      className="scroll-mt-20 bg-[#000000] text-[#eef0f5] rounded-t-[40px] sm:rounded-t-[64px] -mt-8 pt-20 sm:pt-24 pb-24 sm:pb-28 px-4 sm:px-6 lg:px-8 xl:px-10 relative z-20 shadow-[0_-24px_60px_rgba(0,0,0,0.45)]"
    >
      {/* Full-Width Portfolio Showcase Container (90–95% Desktop Viewport Width, matching Screenshot 2) */}
      <div className="w-full max-w-[92vw] 2xl:max-w-[1680px] mx-auto">
        {/* Giant Centered PROJECTS Heading (00:10 outline -> 00:11 solid white) */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-mono-num uppercase tracking-[0.24em] text-[#ff9a3c]">
            FEATURED WORK &amp; LIVE PLATFORMS
          </p>
          <h2
            id="projects-heading"
            ref={headingRef}
            className="mt-3 font-display uppercase text-[clamp(3.2rem,9.5vw,8rem)] tracking-tight transition-colors duration-300 text-outline-white"
          >
            PROJECTS
          </h2>
        </div>

        {/* Video-Matched Sticky Stacking Project Cards (00:11 -> 00:12 -> 00:13 -> 00:14) */}
        <div className="relative flex flex-col gap-8 sm:gap-10 lg:gap-16 pb-12 lg:pb-36">
          {PORTFOLIO_DATA.projects.map((project: ProjectItem, index: number) => {
            const isEmpty = Boolean(project.isEmptyTemplate);
            const isFlagship = index === 0;
            const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
            const isSticky = isDesktop || canCardStack[index];
            const desktopStickyTop = 82 + index * 92;
            const mobileStickyTop = 64 + 12 + index * 10;
            const topValue = isDesktop ? desktopStickyTop : mobileStickyTop;

            return (
              <article
                key={project.slug}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                style={{
                  top: isSticky ? `${topValue}px` : undefined,
                  zIndex: 10 + index,
                }}
                className={`w-full ${
                  isSticky ? 'sticky' : 'relative'
                } rounded-[28px] sm:rounded-[34px] border bg-[#05070e] shadow-[0_-18px_48px_rgba(0,0,0,0.88)] transition-colors px-4 sm:px-8 lg:px-10 pt-4 sm:pt-5 pb-5 sm:pb-6 will-change-transform ${
                  isFlagship
                    ? 'border-white/45 hover:border-[#ff4fa3]/80'
                    : 'border-white/35 hover:border-white/65'
                }`}
              >
                {/* Compact Header Strip (stays completely visible in the sticky stack) */}
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 lg:h-[68px] pb-3 sm:pb-4 border-b border-white/15">
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    <span
                      ref={(el) => {
                        numRefs.current[index] = el;
                      }}
                      className={`font-display leading-none tracking-tight shrink-0 transition-colors duration-300 ${
                        isFlagship
                          ? 'text-4xl sm:text-5xl lg:text-[3.5rem] text-[#eef0f5]'
                          : 'text-4xl sm:text-5xl lg:text-[3.5rem] text-outline-white'
                      }`}
                    >
                      {project.number}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="font-display uppercase tracking-tight text-white text-base sm:text-2xl lg:text-[1.7rem] truncate">
                          {project.name}
                        </h3>

                        {isFlagship && (
                          <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono-num font-bold uppercase tracking-wider bg-[#ff4fa3]/15 border border-[#ff4fa3]/45 text-[#ff9a3c]">
                            <Globe className="w-3 h-3 text-[#ff4fa3]" />
                            <span>GOKALIFREE.IN</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-[#eef0f5]/70 truncate mt-0.5">
                        {project.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {!isEmpty && (
                      <MagneticButton
                        variant="outline"
                        onClick={() => onOpenProject(project.slug)}
                        ariaLabel={`Read case study for ${project.name}`}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span className="hidden sm:inline">CASE STUDY</span>
                      </MagneticButton>
                    )}

                    <MagneticButton
                      variant={isFlagship ? 'gradient' : 'outline'}
                      href={isEmpty ? '#contact' : project.liveUrl}
                      external={!isEmpty}
                      ariaLabel={`Open live project ${project.name}`}
                    >
                      <span>LIVE PROJECT</span>
                      {!isEmpty && <ArrowUpRight className="w-4 h-4" />}
                    </MagneticButton>
                  </div>
                </div>

                {/* Mobile Preview Area: Compact 16:10 Horizontal Swipe Gallery with Dots */}
                <div className="block lg:hidden mt-3 relative z-10">
                  <MobileProjectGallery
                    project={project}
                    isFlagship={isFlagship}
                    isEmpty={isEmpty}
                    index={index}
                    onOpen={() => {
                      if (!isEmpty) onOpenProject(project.slug);
                    }}
                  />
                </div>

                {/* Desktop Preview Area: 3-Preview Bento Grid (1 Large Left + 2 Stacked Right) */}
                <div
                  onClick={() => {
                    if (!isEmpty) onOpenProject(project.slug);
                  }}
                  className={`hidden lg:grid relative z-10 mt-5 grid-cols-12 gap-5 items-stretch ${
                    isEmpty ? '' : 'cursor-pointer'
                  }`}
                >
                  <div className="col-span-8 flex">
                    <ProjectArtwork
                      visual={project.previews[0]}
                      large
                      featured={isFlagship}
                      stackIndex={index}
                    />
                  </div>
                  <div className="col-span-4 flex flex-col justify-between gap-5">
                    <ProjectArtwork
                      visual={project.previews[1]}
                      featured={isFlagship}
                      stackIndex={index}
                    />
                    <ProjectArtwork
                      visual={project.previews[2]}
                      featured={isFlagship}
                      stackIndex={index}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
