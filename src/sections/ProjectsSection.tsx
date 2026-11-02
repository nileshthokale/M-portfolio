import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, BookOpen } from 'lucide-react';
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

  useEffect(() => {
    let ticking = false;

    const updateStackOnScroll = () => {
      const vh = window.innerHeight;

      // 1. Heading outline-to-solid reveal (Matches 00:10-00:11 of video)
      if (headingRef.current) {
        const hRect = headingRef.current.getBoundingClientRect();
        if (hRect.top < vh * 0.58) {
          headingRef.current.classList.remove('text-outline-white');
          headingRef.current.classList.add('text-[#eef0f5]');
        } else {
          headingRef.current.classList.add('text-outline-white');
          headingRef.current.classList.remove('text-[#eef0f5]');
        }
      }

      // 2. Smooth scale down of underlying card as the next sticky card slides up over it (00:11-00:13)
      cardRefs.current.forEach((card, idx) => {
        if (!card) return;
        const nextCard = cardRefs.current[idx + 1];
        if (!nextCard) {
          card.style.transform = 'scale(1)';
          return;
        }
        const rect = card.getBoundingClientRect();
        const nextRect = nextCard.getBoundingClientRect();
        const distance = nextRect.top - rect.top;
        const overlapRange = 360;
        const overlap = Math.max(0, Math.min(1, 1 - (distance - 92) / overlapRange));
        const scale = 1 - overlap * 0.035;
        card.style.transform = `scale(${scale.toFixed(4)})`;
      });

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateStackOnScroll);
      }
    };

    updateStackOnScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      id="projects"
      ref={sectionRef}
      aria-labelledby="projects-heading"
      className="scroll-mt-20 bg-[#000000] text-[#eef0f5] pt-24 pb-28 px-4 sm:px-8 relative z-10"
    >
      <div className="max-w-[1320px] mx-auto">
        {/* Giant Centered PROJECTS Heading (Outline to Solid on Scroll — Matches 00:10 of video) */}
        <div className="text-center mb-14 sm:mb-20">
          <h2
            id="projects-heading"
            ref={headingRef}
            className="font-display uppercase text-[clamp(3rem,9vw,7.5rem)] tracking-tight transition-colors duration-300 text-[#eef0f5]"
          >
            PROJECTS
          </h2>
        </div>

        {/* Sticky Stacking Project Cards (01, 02, 03 stack with stepped top offsets so headers remain visible like 00:12-00:14 in video!) */}
        <div className="flex flex-col gap-12 sm:gap-16 pb-10">
          {PORTFOLIO_DATA.projects.map((project: ProjectItem, index: number) => {
            const isEmpty = Boolean(project.isEmptyTemplate);
            // Stepped sticky top offset (80px, 174px, 268px) so each card's header strip stays visible when overlapped!
            const stickyTopPx = 80 + index * 94;

            return (
              <article
                key={project.slug}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                style={{ top: `${stickyTopPx}px` }}
                className="sticky card-outlined-dark p-6 sm:p-8 lg:p-10 shadow-[0_-18px_48px_rgba(0,0,0,0.85)] origin-top will-change-transform"
              >
                {/* Card Header Strip (Matches 01 CLIENT / LIVE PROJECT header in 00:11-00:13 of video) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/15">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span
                      className={`font-display text-4xl sm:text-6xl tracking-tight ${
                        index === 0 ? 'text-[#eef0f5]' : 'text-outline-white'
                      }`}
                    >
                      {project.number}
                    </span>
                    <div>
                      <h3 className="font-display text-lg sm:text-2xl uppercase tracking-tight text-white">
                        {project.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#eef0f5]/70 mt-0.5">
                        {project.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {!isEmpty && (
                      <MagneticButton
                        variant="outline"
                        onClick={() => onOpenProject(project.slug)}
                        ariaLabel={`Read case study for ${project.name}`}
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>CASE STUDY</span>
                      </MagneticButton>
                    )}

                    <MagneticButton
                      variant="outline"
                      href={isEmpty ? '#contact' : project.liveUrl}
                      external={!isEmpty}
                      ariaLabel={`Open live project ${project.name}`}
                    >
                      <span>LIVE PROJECT</span>
                      {!isEmpty && <ArrowUpRight className="w-4 h-4" />}
                    </MagneticButton>
                  </div>
                </div>

                {/* Card Body: 3-Preview Bento Grid (1 Large Left + 2 Stacked Right — Matches 00:11-00:13 of video) */}
                <div
                  onClick={() => {
                    if (!isEmpty) onOpenProject(project.slug);
                  }}
                  className={`mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 ${
                    isEmpty ? '' : 'cursor-pointer'
                  }`}
                >
                  <div className="lg:col-span-7">
                    <ProjectArtwork visual={project.previews[0]} large />
                  </div>
                  <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-5">
                    <ProjectArtwork visual={project.previews[1]} />
                    <ProjectArtwork visual={project.previews[2]} />
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
