import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, BookOpen, Globe } from 'lucide-react';
import { PORTFOLIO_DATA, ProjectItem } from '../data/portfolio';
import { MagneticButton } from '../components/MagneticButton';
import { ProjectArtwork } from '../components/ProjectArtwork';

interface ProjectsSectionProps {
  onOpenProject: (slug: string) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onOpenProject }) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);

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
      className="scroll-mt-20 bg-[#000000] text-[#eef0f5] rounded-t-[40px] sm:rounded-t-[64px] -mt-8 pt-20 sm:pt-24 pb-24 sm:pb-28 px-4 sm:px-6 lg:px-10 relative z-20 shadow-[0_-24px_60px_rgba(0,0,0,0.45)]"
    >
      {/* Full-Width Portfolio Showcase Container */}
      <div className="w-full max-w-[1640px] mx-auto">
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
        <div className="relative flex flex-col gap-10 lg:gap-16 pb-4">
          {PORTFOLIO_DATA.projects.map((project: ProjectItem, index: number) => {
            const isEmpty = Boolean(project.isEmptyTemplate);
            const isFlagship = index === 0;
            // 92px vertical step matches the card header height + top padding so each previous card's
            // header strip ("01 GOKALIFREE", "02 PROJECT SLOT 02") stays 100% visible when stacked.
            const stickyTopPx = 82 + index * 92;

            return (
              <article
                key={project.slug}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                style={{
                  top: `${stickyTopPx}px`,
                  zIndex: 10 + index,
                }}
                className={`w-full lg:sticky rounded-[28px] sm:rounded-[34px] border bg-[#05070e] shadow-[0_-18px_48px_rgba(0,0,0,0.88)] transition-colors px-5 sm:px-8 lg:px-10 pt-4 sm:pt-5 pb-5 sm:pb-6 ${
                  isFlagship
                    ? 'border-white/45 hover:border-[#ff4fa3]/80'
                    : 'border-white/35 hover:border-white/65'
                }`}
              >
                {/* Compact Header Strip (stays completely visible in the 92px sticky stack) */}
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
                      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                        <h3 className="font-display uppercase tracking-tight text-white text-lg sm:text-2xl lg:text-[1.7rem] truncate">
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

                  <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
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

                {/* Card Body: 3-Preview Bento Grid (1 Large Left + 2 Stacked Right, matching video 00:11-00:13) */}
                <div
                  onClick={() => {
                    if (!isEmpty) onOpenProject(project.slug);
                  }}
                  className={`relative z-10 mt-4 sm:mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch ${
                    isEmpty ? '' : 'cursor-pointer'
                  }`}
                >
                  <div className="lg:col-span-7 xl:col-span-8 flex">
                    <ProjectArtwork
                      visual={project.previews[0]}
                      large
                      featured={isFlagship}
                      stackIndex={index}
                    />
                  </div>
                  <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between gap-4 sm:gap-5">
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
