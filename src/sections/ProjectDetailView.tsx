import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2, Layers } from 'lucide-react';
import { PORTFOLIO_DATA, ProjectItem } from '../data/portfolio';
import { getNextProjectSlug } from '../lib/portfolioLogic';
import { MagneticButton } from '../components/MagneticButton';
import { ProjectArtwork } from '../components/ProjectArtwork';

interface ProjectDetailViewProps {
  project: ProjectItem;
  onBack: () => void;
  onSelectProject: (slug: string) => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  onBack,
  onSelectProject,
}) => {
  const allSlugs = PORTFOLIO_DATA.projects.map((p) => p.slug);
  const nextSlug = getNextProjectSlug(allSlugs, project.slug);
  const nextProject =
    PORTFOLIO_DATA.projects.find((p) => p.slug === nextSlug) || PORTFOLIO_DATA.projects[0];

  return (
    <article className="min-h-screen bg-[#05060a] text-[#eef0f5] pt-8 pb-24 px-5 sm:px-8">
      <div className="max-w-[1280px] mx-auto">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between gap-4 pb-8 border-b border-white/15">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#eef0f5]/80 hover:text-[#ff4fa3] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portfolio</span>
          </button>

          <span className="font-mono-num text-xs text-[#ff9a3c]">
            PROJECT {project.number} / 0{PORTFOLIO_DATA.projects.length}
          </span>
        </div>

        {/* Hero Header */}
        <header className="mt-10 sm:mt-14">
          <p className="text-xs sm:text-sm font-mono-num uppercase tracking-widest text-[#ff4fa3]">
            {project.category}
          </p>
          <h1 className="mt-2 font-display uppercase text-[clamp(2.5rem,7vw,6rem)] tracking-tight hero-title-gradient">
            {project.name}
          </h1>
          <p className="mt-4 text-lg sm:text-2xl font-semibold text-[#eef0f5]/90 max-w-3xl">
            {project.tagline}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <MagneticButton variant="gradient" href={project.liveUrl} external>
              <span>VISIT LIVE PROJECT</span>
              <ArrowUpRight className="w-4 h-4" />
            </MagneticButton>
            <MagneticButton variant="outline" href={project.repoUrl} external>
              <span>SOURCE / DOCS</span>
              <ArrowUpRight className="w-4 h-4" />
            </MagneticButton>
          </div>
        </header>

        {/* Primary Showcase Visual */}
        <div className="mt-12">
          <ProjectArtwork visual={project.previews[0]} large />
        </div>

        {/* Role, Timeline, and Tech Stack Metadata Strip */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 card-outlined-dark">
          <div>
            <p className="text-xs font-mono-num uppercase tracking-wider text-[#eef0f5]/55">
              ROLE &amp; OWNERSHIP
            </p>
            <p className="mt-1 text-base font-bold text-white">{project.role}</p>
          </div>
          <div>
            <p className="text-xs font-mono-num uppercase tracking-wider text-[#eef0f5]/55">
              TIMELINE
            </p>
            <p className="mt-1 text-base font-bold text-white">{project.timeline}</p>
          </div>
          <div>
            <p className="text-xs font-mono-num uppercase tracking-wider text-[#eef0f5]/55">
              TECH STACK
            </p>
            <p className="mt-1 text-sm font-mono-num text-[#ff9a3c]">
              {project.techStack.join(' · ')}
            </p>
          </div>
        </div>

        {/* Deep-Dive Narrative & Results */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <section>
              <h2 className="font-display text-xl sm:text-2xl uppercase text-white">
                Overview
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#eef0f5]/80">
                {project.summary}
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl sm:text-2xl uppercase text-white">
                The Engineering Challenge
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#eef0f5]/80">
                {project.challenge}
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl sm:text-2xl uppercase text-white">
                Architecture &amp; Execution
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#eef0f5]/80">
                {project.architecture}
              </p>
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="card-outlined-dark p-6 sm:p-8">
              <div className="flex items-center gap-2 text-[#ff4fa3]">
                <Layers className="w-5 h-5" />
                <h2 className="font-display text-lg uppercase text-white">
                  Key Outcomes
                </h2>
              </div>
              <ul className="mt-5 space-y-4">
                {project.results.map((res, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#eef0f5]/85">
                    <CheckCircle2 className="w-5 h-5 text-[#ff9a3c] shrink-0 mt-0.5" />
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Secondary Gallery */}
        <section className="mt-14">
          <h2 className="font-display text-xl sm:text-2xl uppercase text-white mb-6">
            Module &amp; Telemetry Gallery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProjectArtwork visual={project.previews[1]} large />
            <ProjectArtwork visual={project.previews[2]} large />
          </div>
        </section>

        {/* Next Project Banner */}
        <div className="mt-16 pt-10 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-mono-num uppercase tracking-widest text-[#eef0f5]/60">
              NEXT PROJECT ({nextProject.number})
            </p>
            <h3 className="font-display text-2xl sm:text-4xl uppercase text-white mt-1">
              {nextProject.name}
            </h3>
          </div>

          <MagneticButton
            variant="gradient"
            onClick={() => onSelectProject(nextProject.slug)}
            ariaLabel={`Next project: ${nextProject.name}`}
          >
            <span>NEXT PROJECT</span>
            <ArrowRight className="w-4 h-4" />
          </MagneticButton>
        </div>
      </div>
    </article>
  );
};
