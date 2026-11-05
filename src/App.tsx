import React, { useEffect, useState, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { PORTFOLIO_DATA } from './data/portfolio';
import { useDeviceMode } from './lib/deviceMode';
import { MobileStorytelling } from './components/MobileStorytelling';
import { Navbar } from './sections/Navbar';
import { HeroSection } from './sections/HeroSection';
import { SkillsMarqueeSection } from './sections/SkillsMarqueeSection';
import { AboutSection } from './sections/AboutSection';
import { ServicesSection } from './sections/ServicesSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { EducationSkillsSection } from './sections/EducationSkillsSection';
import { ContactSection } from './sections/ContactSection';
import { FooterSection } from './sections/FooterSection';
import { ProjectDetailView } from './sections/ProjectDetailView';

// Code splitting: AgentSwarm is ONLY imported and downloaded when desktop mode is active!
const AgentSwarm = React.lazy(() =>
  import('./components/AgentSwarm').then((m) => ({ default: m.AgentSwarm }))
);

export default function App() {
  const [activeProjectSlug, setActiveProjectSlug] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const match = window.location.pathname.match(/^\/projects\/([^/]+)/);
    return match ? match[1] : null;
  });

  // Ensure the page always starts at top on initial load/refresh, never opening at #about or projects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      if (window.location.hash && window.location.hash !== '#top') {
        window.history.replaceState(null, '', window.location.pathname);
      }
      window.scrollTo(0, 0);

      const forceTop = () => window.scrollTo(0, 0);
      window.addEventListener('load', forceTop);
      const timer = setTimeout(forceTop, 50);
      return () => {
        window.removeEventListener('load', forceTop);
        clearTimeout(timer);
      };
    }
  }, []);

  // Sync browser history on project route navigation
  useEffect(() => {
    const onPopState = () => {
      const match = window.location.pathname.match(/^\/projects\/([^/]+)/);
      setActiveProjectSlug(match ? match[1] : null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleOpenProject = (slug: string) => {
    window.history.pushState({}, '', `/projects/${slug}`);
    setActiveProjectSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackHome = () => {
    window.history.pushState({}, '', '/');
    setActiveProjectSlug(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeProject = activeProjectSlug
    ? PORTFOLIO_DATA.projects.find((p) => p.slug === activeProjectSlug) || null
    : null;

  const deviceMode = useDeviceMode();

  return (
    <div className="min-h-screen bg-black text-[#eef0f5] relative selection:bg-[#ff4fa3] selection:text-white">
      <Navbar onNavigateHome={activeProject ? handleBackHome : undefined} />

      <main id="main-content">
        {activeProject ? (
          <ProjectDetailView
            project={activeProject}
            onBack={handleBackHome}
            onSelectProject={handleOpenProject}
          />
        ) : (
          <>
            <HeroSection />
            <SkillsMarqueeSection />
            <AboutSection />
            <ServicesSection />
            <ProjectsSection onOpenProject={handleOpenProject} />
            <EducationSkillsSection />
            <ContactSection />
            <FooterSection />
          </>
        )}
      </main>

      {/* Device Switch: Desktop gets AI Swarm; Mobile gets Touch Scroll Storytelling */}
      {deviceMode === 'desktop' ? (
        <Suspense fallback={null}>
          <AgentSwarm />
        </Suspense>
      ) : (
        <MobileStorytelling />
      )}

      <Analytics />
    </div>
  );
}
