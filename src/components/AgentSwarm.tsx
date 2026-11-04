import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

// ============================================================================
// CONFIGURATION
// ============================================================================
export const AGENT_SWARM_CONFIG = {
  k: 1.8,

  accentColor: '#2f6bff',
  guideLineColor: 'rgba(47, 107, 255, 0.35)',
  redGuideColor: '#ff3b30',
  redGuideX: 42,

  totalAgentsDesktop: 8,
  totalAgentsMobile: 4,
  maxWorkersDesktop: 3,
  maxWorkersMobile: 2,
  enableOnMobile: true,

  agentPalette: [
    { name: 'agent-1', color: '#2f6bff', role: 'worker' as const },
    { name: 'agent-2', color: '#ff375f', role: 'worker' as const },
    { name: 'agent-3', color: '#ff9f0a', role: 'worker' as const },
    { name: 'agent-4', color: '#30d158', role: 'worker' as const },
    { name: 'agent-5', color: '#bf5af2', role: 'worker' as const },
    { name: 'agent-6', color: '#00c7be', role: 'ambient' as const },
    { name: 'agent-7', color: '#ffd60a', role: 'ambient' as const },
    { name: 'agent-8', color: '#ff453a', role: 'ambient' as const },
  ],

  durations: {
    pointerWaitMax: 600,
    spawnScale: 300,
    flyToElement: 500,
    dragBox: 450,
    typingPerChar: 45,
    typingPerCharHeroName: 90,
    typingMaxPerElement: 1500,
    blockWireframe: 650,
    buttonRipple: 320,
    shapePlacement: 400,
    boxFadeOut: 350,
  },

  lerp: {
    working: 0.18,
    helper: 0.035,
    merge: 0.1,
  },

  failsafes: {
    heroMaxDuration: 25000,
    lateMaxDuration: 40000,
  },
};

type TargetType =
  | 'text'
  | 'hero-name-word'
  | 'button'
  | 'chip'
  | 'figure'
  | 'form-field'
  | 'svg-shape';

type SwarmPhase =
  | 'spawning-hero'
  | 'hero'
  | 'hero-merge'
  | 'waiting-late'
  | 'spawning-late'
  | 'late'
  | 'late-merge'
  | 'finished';

interface SwarmTarget {
  id: string;
  element: HTMLElement;
  type: TargetType;
  section: 'hero' | 'late';
  spans?: HTMLElement[];
  localX: number;
  localY: number;
  width: number;
  height: number;
  status: 'pending' | 'in-progress' | 'completed';
  assignedAgentId?: string;
  queuedAt: number;
  customData?: any;
}

interface AgentState {
  id: string;
  name: string;
  color: string;
  role: 'worker' | 'ambient';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  scale: number;
  mode: 'spawning' | 'idle' | 'flying' | 'dragging' | 'acting' | 'finishing' | 'merging' | 'hidden';
  cursorType: 'arrow' | 'ibeam' | 'crosshair';
  activeTargetId?: string;
  actionStart: number;
  actionDuration: number;
  lastWanderPick: number;
  wanderInterval: number;
  boxRect?: { x: number; y: number; w: number; h: number; fullW: number; fullH: number };
  tagLabel?: string;
  trail: Array<{ x: number; y: number; alpha: number }>;
}

interface PulseRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export const AgentSwarm: React.FC = () => {
  const [phase, setPhaseState] = useState<SwarmPhase>('spawning-hero');
  const [totalLayers, setTotalLayers] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [mountedHeroContainer, setMountedHeroContainer] = useState<HTMLElement | null>(null);
  const [mountedLateContainer, setMountedLateContainer] = useState<HTMLElement | null>(null);

  const heroCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lateCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const phaseRef = useRef<SwarmPhase>('spawning-hero');
  const agentsRef = useRef<AgentState[]>([]);
  const targetsQueueRef = useRef<SwarmTarget[]>([]);
  const userPointerRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const pulseRingsRef = useRef<PulseRing[]>([]);
  const animFrameIdRef = useRef<number>(0);
  const heroStartTimeRef = useRef<number>(0);
  const lateStartTimeRef = useRef<number>(0);
  const isMobileRef = useRef<boolean>(false);
  const lateTriggeredRef = useRef<boolean>(false);

  const K = AGENT_SWARM_CONFIG.k;

  const setPhase = useCallback((p: SwarmPhase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  // Reveal all targets failsafe
  const revealAllTargets = useCallback(() => {
    targetsQueueRef.current.forEach((t) => {
      t.status = 'completed';
      t.element.setAttribute('data-agent-active', 'true');
      t.element.style.opacity = '1';
      t.element.style.visibility = 'visible';
    });

    document.querySelectorAll('[data-swarm-target]').forEach((el) => {
      el.setAttribute('data-agent-active', 'true');
      (el as HTMLElement).style.opacity = '1';
      (el as HTMLElement).style.visibility = 'visible';
    });

    document.querySelectorAll('.agent-char').forEach((el) => {
      el.setAttribute('data-char-revealed', 'true');
      (el as HTMLElement).style.opacity = '1';
    });

    document.documentElement.classList.remove('agent-swarm-active');
  }, []);

  const handleDismiss = useCallback(() => {
    revealAllTargets();
    setPhase('finished');
  }, [revealAllTargets, setPhase]);

  // Section navigation
  const handleNav = (dir: 'prev' | 'next') => {
    const sections = ['#top', '#about', '#services', '#projects', '#education', '#contact'];
    const currentScroll = window.scrollY;
    let targetSelector = dir === 'next' ? '#contact' : '#top';

    for (let i = 0; i < sections.length; i++) {
      const el = document.querySelector(sections[i]);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (dir === 'next' && top > currentScroll + 80) {
          targetSelector = sections[i];
          break;
        } else if (dir === 'prev' && top < currentScroll - 80) {
          targetSelector = sections[i];
        }
      }
    }
    const targetEl = document.querySelector(targetSelector);
    targetEl?.scrollIntoView({ behavior: 'smooth' });
  };

  // Find and bind container mount points
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const heroMount = document.getElementById('hero-swarm-mount');
    const lateMount = document.getElementById('late-swarm-mount');
    if (heroMount) setMountedHeroContainer(heroMount);
    if (lateMount) setMountedLateContainer(lateMount);
  }, []);

  // --------------------------------------------------------------------------
  // Scan Hero Targets (Name heading is split & deferred to LAST)
  // --------------------------------------------------------------------------
  const scanHeroTargets = useCallback((): SwarmTarget[] => {
    const heroMount = document.getElementById('hero-swarm-mount');
    const hero = document.getElementById('top');
    if (!hero || !heroMount) return [];

    const mountRect = heroMount.getBoundingClientRect();
    const list: SwarmTarget[] = [];

    const registerTarget = (
      el: HTMLElement | null,
      id: string,
      type: TargetType,
      customData?: any
    ) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const localX = rect.left - mountRect.left;
      const localY = rect.top - mountRect.top;
      const spans = Array.from(el.querySelectorAll('.agent-char')) as HTMLElement[];

      list.push({
        id,
        element: el,
        type,
        section: 'hero',
        spans,
        localX,
        localY,
        width: rect.width,
        height: rect.height,
        status: 'pending',
        queuedAt: performance.now(),
        customData,
      });
    };

    // 1. Subtitle
    registerTarget(hero.querySelector('[data-swarm-target="hero-subtitle"]'), 'hero-subtitle', 'text');
    // 2. Location line
    registerTarget(hero.querySelector('[data-swarm-target="hero-location"]'), 'hero-location', 'text');
    // 3. Bottom line
    registerTarget(hero.querySelector('[data-swarm-target="hero-bottom"]'), 'hero-bottom', 'text');
    // 4. "Contact me" button
    registerTarget(hero.querySelector('[data-swarm-target="hero-button"]'), 'hero-button', 'button');
    // 5. "Scroll to explore" hint
    registerTarget(hero.querySelector('[data-swarm-target="hero-explore"]'), 'hero-explore', 'button');

    // 6. Name Heading: "HI, I'M NILESH" (Built LAST by 3 agents in parallel)
    const nameHeading = hero.querySelector('[data-swarm-target="hero-heading"]') as HTMLElement | null;
    if (nameHeading) {
      const words = Array.from(nameHeading.querySelectorAll('.agent-word')) as HTMLElement[];
      words.forEach((wEl, idx) => {
        const wRect = wEl.getBoundingClientRect();
        const spans = Array.from(wEl.querySelectorAll('.agent-char')) as HTMLElement[];
        list.push({
          id: `hero-name-word-${idx}`,
          element: wEl,
          type: 'hero-name-word',
          section: 'hero',
          spans,
          localX: wRect.left - mountRect.left,
          localY: wRect.top - mountRect.top,
          width: wRect.width,
          height: wRect.height,
          status: 'pending',
          queuedAt: performance.now(),
          customData: { parentHeading: nameHeading, wordIndex: idx },
        });
      });
    }

    return list;
  }, []);

  // --------------------------------------------------------------------------
  // Scan Contact & Footer Targets
  // --------------------------------------------------------------------------
  const scanLateTargets = useCallback((): SwarmTarget[] => {
    const lateMount = document.getElementById('late-swarm-mount');
    if (!lateMount) return [];

    const mountRect = lateMount.getBoundingClientRect();
    const list: SwarmTarget[] = [];

    const registerTarget = (
      el: HTMLElement | null,
      id: string,
      type: TargetType,
      customData?: any
    ) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const localX = rect.left - mountRect.left;
      const localY = rect.top - mountRect.top;
      const spans = Array.from(el.querySelectorAll('.agent-char')) as HTMLElement[];

      list.push({
        id,
        element: el,
        type,
        section: 'late',
        spans,
        localX,
        localY,
        width: rect.width,
        height: rect.height,
        status: 'pending',
        queuedAt: performance.now(),
        customData,
      });
    };

    const contact = document.getElementById('contact');
    const footer = document.querySelector('footer');

    if (contact) {
      registerTarget(contact.querySelector('[data-swarm-target="contact-heading"]'), 'contact-heading', 'text');
      registerTarget(contact.querySelector('[data-swarm-target="contact-link-email"]'), 'contact-email', 'text');
      registerTarget(contact.querySelector('[data-swarm-target="contact-link-phone"]'), 'contact-phone', 'text');
      registerTarget(contact.querySelector('[data-swarm-target="contact-intro"]'), 'contact-intro', 'text');

      const chips = Array.from(contact.querySelectorAll('[data-swarm-target="contact-chip"]')) as HTMLElement[];
      chips.forEach((ch, idx) => registerTarget(ch, `contact-chip-${idx}`, 'chip'));

      registerTarget(contact.querySelector('[data-swarm-target="contact-figure-bolt"]'), 'figure-bolt', 'figure');
      registerTarget(contact.querySelector('[data-swarm-target="contact-figure-hand"]'), 'figure-hand', 'figure');

      const fields = Array.from(contact.querySelectorAll('[data-swarm-target="contact-field"]')) as HTMLElement[];
      fields.forEach((f, idx) => registerTarget(f, `contact-field-${idx}`, 'form-field'));

      registerTarget(contact.querySelector('[data-swarm-target="contact-send-btn"]'), 'contact-send', 'button');
    }

    if (footer) {
      registerTarget(footer.querySelector('[data-swarm-target="footer-wordmark"]'), 'footer-wordmark', 'text');
      registerTarget(footer.querySelector('[data-swarm-target="footer-desc"]'), 'footer-desc', 'text');
      registerTarget(footer.querySelector('[data-swarm-target="footer-col-social"]'), 'footer-social', 'chip');
      registerTarget(footer.querySelector('[data-swarm-target="footer-col-contact"]'), 'footer-contact', 'chip');
      registerTarget(footer.querySelector('[data-swarm-target="footer-download"]'), 'footer-download', 'button');

      const shapeContainer = footer.querySelector('[data-swarm-target="footer-shapes"]');
      if (shapeContainer) {
        const shapeElements = Array.from(shapeContainer.querySelectorAll('[data-swarm-shape]')) as HTMLElement[];
        shapeElements.forEach((shapeEl, idx) => {
          registerTarget(shapeEl, `footer-shape-${idx}`, 'svg-shape', { shapeIndex: idx });
        });
      }
    }

    return list;
  }, []);

  // --------------------------------------------------------------------------
  // Lifecycle & Spawning Setup
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setPhase('finished');
      return;
    }

    const isMob = window.innerWidth < 768;
    isMobileRef.current = isMob;
    if (isMob && !AGENT_SWARM_CONFIG.enableOnMobile) {
      setPhase('finished');
      return;
    }

    const agentCount = isMob ? AGENT_SWARM_CONFIG.totalAgentsMobile : AGENT_SWARM_CONFIG.totalAgentsDesktop;
    const palette = AGENT_SWARM_CONFIG.agentPalette.slice(0, agentCount);

    const onPointerMove = (e: PointerEvent) => {
      userPointerRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Wait up to 600ms for visitor pointer, then spawn agents inside Hero Section
    const spawnTimer = setTimeout(() => {
      const heroMount = document.getElementById('hero-swarm-mount');
      if (!heroMount) return;

      const mountRect = heroMount.getBoundingClientRect();
      const heroTargets = scanHeroTargets();
      targetsQueueRef.current = heroTargets;
      setTotalLayers(heroTargets.length);
      setCompletedCount(0);

      // Local coordinates inside Hero Section
      const spawnX = userPointerRef.current.active
        ? userPointerRef.current.x - mountRect.left
        : mountRect.width / 2;
      const spawnY = userPointerRef.current.active
        ? userPointerRef.current.y - mountRect.top
        : mountRect.height / 2;

      pulseRingsRef.current.push({
        x: spawnX,
        y: spawnY,
        radius: 0,
        maxRadius: 46,
        alpha: 1,
        color: AGENT_SWARM_CONFIG.accentColor,
      });

      agentsRef.current = palette.map((p, idx) => ({
        id: p.name,
        name: p.name,
        color: p.color,
        role: p.role,
        x: spawnX,
        y: spawnY,
        targetX: spawnX + (Math.random() - 0.5) * 60,
        targetY: spawnY + (Math.random() - 0.5) * 60,
        scale: 0,
        mode: 'spawning',
        cursorType: p.role === 'ambient' ? 'crosshair' : 'arrow',
        actionStart: performance.now() + idx * 35,
        actionDuration: AGENT_SWARM_CONFIG.durations.spawnScale,
        lastWanderPick: performance.now(),
        wanderInterval: 2500 + Math.random() * 1500,
        trail: [],
      }));

      heroStartTimeRef.current = performance.now();
      setPhase('hero');
    }, AGENT_SWARM_CONFIG.durations.pointerWaitMax);

    // Observer on Contact Section (~25% in view)
    const contactEl = document.getElementById('contact');
    let contactObserver: IntersectionObserver | null = null;

    if (contactEl) {
      contactObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && phaseRef.current === 'waiting-late' && !lateTriggeredRef.current) {
              lateTriggeredRef.current = true;
              const lateMount = document.getElementById('late-swarm-mount');
              if (!lateMount) return;

              const mountRect = lateMount.getBoundingClientRect();
              const lateTargets = scanLateTargets();

              if (lateTargets.length > 0) {
                targetsQueueRef.current = lateTargets;
                setTotalLayers(lateTargets.length);
                setCompletedCount(0);

                const originX = userPointerRef.current.active
                  ? userPointerRef.current.x - mountRect.left
                  : mountRect.width / 2;
                const originY = userPointerRef.current.active
                  ? userPointerRef.current.y - mountRect.top
                  : 120;

                pulseRingsRef.current.push({
                  x: originX,
                  y: originY,
                  radius: 0,
                  maxRadius: 46,
                  alpha: 1,
                  color: AGENT_SWARM_CONFIG.accentColor,
                });

                agentsRef.current.forEach((ag, idx) => {
                  ag.x = originX;
                  ag.y = originY;
                  ag.scale = 0;
                  ag.mode = 'spawning';
                  ag.cursorType = ag.role === 'ambient' ? 'crosshair' : 'arrow';
                  ag.actionStart = performance.now() + idx * 35;
                  ag.actionDuration = AGENT_SWARM_CONFIG.durations.spawnScale;
                  ag.activeTargetId = undefined;
                  ag.boxRect = undefined;
                });

                lateStartTimeRef.current = performance.now();
                setPhase('late');
              }
            }
          });
        },
        { threshold: 0.25 }
      );
      contactObserver.observe(contactEl);
    }

    return () => {
      clearTimeout(spawnTimer);
      if (contactObserver) contactObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(animFrameIdRef.current);
      revealAllTargets();
    };
  }, [setPhase, scanHeroTargets, scanLateTargets, revealAllTargets]);

  // --------------------------------------------------------------------------
  // Main Animation Loop
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (phase === 'finished' || phase === 'waiting-late') return;

    const isHero = phase === 'hero' || phase === 'hero-merge' || phase === 'spawning-hero';
    const canvas = isHero ? heroCanvasRef.current : lateCanvasRef.current;
    const mountEl = isHero ? mountedHeroContainer : mountedLateContainer;

    if (!canvas || !mountEl) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      if (!canvas || !mountEl) return;
      canvas.width = mountEl.offsetWidth * window.devicePixelRatio;
      canvas.height = mountEl.offsetHeight * window.devicePixelRatio;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const maxWorkers = isMobileRef.current
      ? AGENT_SWARM_CONFIG.maxWorkersMobile
      : AGENT_SWARM_CONFIG.maxWorkersDesktop;

    const render = (now: number) => {
      const currentPhase = phaseRef.current;

      if (currentPhase === 'finished' || currentPhase === 'waiting-late') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.save();
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.clearRect(0, 0, mountEl.offsetWidth, mountEl.offsetHeight);

      const d = AGENT_SWARM_CONFIG.durations;
      const lerpCfg = AGENT_SWARM_CONFIG.lerp;
      const failsafes = AGENT_SWARM_CONFIG.failsafes;

      // Failsafe time checks
      if (currentPhase === 'hero' && now - heroStartTimeRef.current > failsafes.heroMaxDuration) {
        revealAllTargets();
        setPhase('hero-merge');
      }
      if (currentPhase === 'late' && now - lateStartTimeRef.current > failsafes.lateMaxDuration) {
        revealAllTargets();
        setPhase('late-merge');
      }

      // Pulse rings
      pulseRingsRef.current.forEach((r, idx) => {
        r.radius += 2.2;
        r.alpha = Math.max(0, 1 - r.radius / r.maxRadius);
        if (r.alpha > 0.01) {
          ctx.save();
          ctx.globalAlpha = r.alpha;
          ctx.strokeStyle = r.color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } else {
          pulseRingsRef.current.splice(idx, 1);
        }
      });

      // Top Ruler & Red Guide (drawn inside the section's local coordinates)
      if (currentPhase === 'hero' || currentPhase === 'late') {
        const rulerH = 22;
        ctx.fillStyle = 'rgba(6, 12, 28, 0.9)';
        ctx.fillRect(0, 0, mountEl.offsetWidth, rulerH);
        ctx.strokeStyle = 'rgba(47, 107, 255, 0.38)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, rulerH - 0.5);
        ctx.lineTo(mountEl.offsetWidth, rulerH - 0.5);
        ctx.stroke();

        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.font = '8.5px JetBrains Mono, monospace';

        for (let x = 0; x < mountEl.offsetWidth; x += 10) {
          const is100 = x % 100 === 0;
          const is50 = x % 50 === 0;
          const tickH = is100 ? 10 : is50 ? 6 : 3;

          ctx.beginPath();
          ctx.moveTo(x + 0.5, rulerH - tickH);
          ctx.lineTo(x + 0.5, rulerH);
          ctx.stroke();

          if (is100 && x > 0 && x < mountEl.offsetWidth - 40) {
            ctx.fillText(`${x}`, x + 3, rulerH - 11);
          }
        }

        const redX = AGENT_SWARM_CONFIG.redGuideX;
        ctx.strokeStyle = 'rgba(255, 59, 48, 0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(redX + 0.5, 0);
        ctx.lineTo(redX + 0.5, mountEl.offsetHeight);
        ctx.stroke();

        ctx.fillStyle = '#ff3b30';
        ctx.fillRect(redX - 16, 26, 32, 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`X:${redX}`, redX, 36);
        ctx.textAlign = 'left';
      }

      // Target Completion & Worker Assignment
      const sectionKey = currentPhase === 'hero' || currentPhase === 'hero-merge' ? 'hero' : 'late';
      const queue = targetsQueueRef.current;
      const activeSectionTargets = queue.filter((t) => t.section === sectionKey);
      const pendingTargets = activeSectionTargets.filter((t) => t.status === 'pending');
      const completed = activeSectionTargets.filter((t) => t.status === 'completed').length;
      setCompletedCount(completed);

      if (activeSectionTargets.length > 0 && pendingTargets.length === 0) {
        const inProgress = activeSectionTargets.filter((t) => t.status === 'in-progress').length;
        if (inProgress === 0) {
          if (currentPhase === 'hero') {
            setPhase('hero-merge');
          } else if (currentPhase === 'late') {
            setPhase('late-merge');
          }
        }
      }

      // Hero build order: Hero Name is built LAST!
      const nonNamePending = pendingTargets.filter((t) => t.type !== 'hero-name-word');
      const canStartHeroName = nonNamePending.length === 0;

      const idleWorkers = agentsRef.current.filter((a) => a.mode === 'idle' && a.role === 'worker');

      if ((currentPhase === 'hero' || currentPhase === 'late') && idleWorkers.length > 0) {
        let candidateTarget: SwarmTarget | undefined;

        if (currentPhase === 'hero') {
          if (nonNamePending.length > 0) {
            candidateTarget = nonNamePending[0];
          } else if (canStartHeroName) {
            candidateTarget = pendingTargets.find((t) => t.type === 'hero-name-word');
          }
        } else {
          candidateTarget = pendingTargets[0];
        }

        if (candidateTarget) {
          const currentWorkingCount = agentsRef.current.filter(
            (a) => a.role === 'worker' && (a.mode === 'flying' || a.mode === 'dragging' || a.mode === 'acting')
          ).length;

          const limit = candidateTarget.type === 'hero-name-word' ? 3 : maxWorkers;

          if (currentWorkingCount < limit) {
            // Local coordinates relative to container mount
            const mountRect = mountEl.getBoundingClientRect();
            const targetRect = candidateTarget.element.getBoundingClientRect();
            const localX = targetRect.left - mountRect.left;
            const localY = targetRect.top - mountRect.top;

            let bestAgent = idleWorkers[0];
            let minDist = Infinity;

            idleWorkers.forEach((ag) => {
              const dist = Math.hypot(ag.x - localX, ag.y - localY);
              if (dist < minDist) {
                minDist = dist;
                bestAgent = ag;
              }
            });

            candidateTarget.localX = localX;
            candidateTarget.localY = localY;
            candidateTarget.width = targetRect.width;
            candidateTarget.height = targetRect.height;
            candidateTarget.status = 'in-progress';
            candidateTarget.assignedAgentId = bestAgent.id;

            bestAgent.activeTargetId = candidateTarget.id;
            bestAgent.mode = 'flying';
            bestAgent.targetX = localX;
            bestAgent.targetY = localY;
            bestAgent.actionStart = now;
            bestAgent.actionDuration = d.flyToElement * K;
            bestAgent.boxRect = {
              x: localX,
              y: localY,
              w: 0,
              h: 0,
              fullW: Math.max(24, targetRect.width),
              fullH: Math.max(18, targetRect.height),
            };
            bestAgent.tagLabel = `${candidateTarget.element.tagName.toLowerCase()} · ${Math.round(targetRect.width)}×${Math.round(targetRect.height)}`;
          }
        }
      }

      // Work Center for Tethering Helpers
      let workCenterX = mountEl.offsetWidth / 2;
      let workCenterY = mountEl.offsetHeight / 3;
      const activeWorkers = agentsRef.current.filter((a) => a.mode === 'acting' || a.mode === 'dragging' || a.mode === 'flying');

      if (activeWorkers.length > 0) {
        workCenterX = activeWorkers.reduce((acc, a) => acc + a.x, 0) / activeWorkers.length;
        workCenterY = activeWorkers.reduce((acc, a) => acc + a.y, 0) / activeWorkers.length;
      }

      const phaseNow = phaseRef.current;
      const activeGuides: Array<{
        x: number;
        y: number;
        w: number;
        h: number;
        color: string;
        tag: string;
        opacity: number;
      }> = [];

      // Update Agents
      agentsRef.current.forEach((agent) => {
        const isMerging = phaseNow === 'hero-merge' || phaseNow === 'late-merge';

        if (isMerging) {
          if (agent.mode !== 'hidden') {
            agent.mode = 'merging';
            const mountRect = mountEl.getBoundingClientRect();
            // Destination relative to this section mount
            let destX = mountEl.offsetWidth / 2;
            let destY = mountEl.offsetHeight / 2;

            if (userPointerRef.current.active) {
              const ptrLocalX = userPointerRef.current.x - mountRect.left;
              const ptrLocalY = userPointerRef.current.y - mountRect.top;
              if (ptrLocalX >= 0 && ptrLocalX <= mountEl.offsetWidth && ptrLocalY >= 0 && ptrLocalY <= mountEl.offsetHeight) {
                destX = ptrLocalX;
                destY = ptrLocalY;
              }
            }

            agent.x += (destX - agent.x) * lerpCfg.merge;
            agent.y += (destY - agent.y) * lerpCfg.merge;

            const dist = Math.hypot(destX - agent.x, destY - agent.y);
            if (dist < 20) {
              agent.scale = Math.max(0, agent.scale - 0.12);
              if (agent.scale <= 0.05) {
                agent.mode = 'hidden';
              }
            }
          }
          return;
        }

        if (agent.mode === 'spawning') {
          const progress = Math.min(1, (now - agent.actionStart) / agent.actionDuration);
          agent.scale = Math.min(1, progress * 1.15);
          if (progress >= 1) {
            agent.scale = 1;
            agent.mode = 'idle';
          }
          return;
        }

        if (agent.mode === 'idle') {
          if (now > agent.lastWanderPick + agent.wanderInterval) {
            agent.lastWanderPick = now;
            agent.wanderInterval = 2500 + Math.random() * 2000;
            const angle = Math.random() * Math.PI * 2;
            const dist = 70 + Math.random() * 150;
            agent.targetX = Math.max(40, Math.min(mountEl.offsetWidth - 40, workCenterX + Math.cos(angle) * dist));
            agent.targetY = Math.max(40, Math.min(mountEl.offsetHeight - 40, workCenterY + Math.sin(angle) * dist));
          }
          agent.x += (agent.targetX - agent.x) * lerpCfg.helper;
          agent.y += (agent.targetY - agent.y) * lerpCfg.helper;
          return;
        }

        if (agent.mode === 'flying') {
          agent.x += (agent.targetX - agent.x) * (lerpCfg.working / K);
          agent.y += (agent.targetY - agent.y) * (lerpCfg.working / K);

          if (now - agent.actionStart >= agent.actionDuration || Math.hypot(agent.targetX - agent.x, agent.targetY - agent.y) < 5) {
            agent.mode = 'dragging';
            agent.actionStart = now;
            agent.actionDuration = d.dragBox * K;
            if (agent.boxRect) {
              agent.targetX = agent.boxRect.x + agent.boxRect.fullW;
              agent.targetY = agent.boxRect.y + agent.boxRect.fullH;
            }
          }
        } else if (agent.mode === 'dragging') {
          const progress = Math.min(1, (now - agent.actionStart) / agent.actionDuration);
          const easeOut = 1 - Math.pow(1 - progress, 3);

          if (agent.boxRect) {
            agent.boxRect.w = agent.boxRect.fullW * easeOut;
            agent.boxRect.h = agent.boxRect.fullH * easeOut;
            agent.x = agent.boxRect.x + agent.boxRect.w;
            agent.y = agent.boxRect.y + agent.boxRect.h;

            activeGuides.push({
              x: agent.boxRect.x,
              y: agent.boxRect.y,
              w: agent.boxRect.w,
              h: agent.boxRect.h,
              color: agent.color,
              tag: agent.tagLabel || '',
              opacity: 1,
            });
          }

          if (progress >= 1) {
            agent.mode = 'acting';
            agent.actionStart = now;
            const target = queue.find((t) => t.id === agent.activeTargetId);

            if (target) {
              target.element.setAttribute('data-agent-active', 'true');
              if (target.customData?.parentHeading) {
                target.customData.parentHeading.setAttribute('data-agent-active', 'true');
              }
            }

            if (target?.type === 'text') {
              agent.cursorType = 'ibeam';
              const totalChars = target.spans?.length || 1;
              agent.actionDuration = Math.min(d.typingMaxPerElement * K, totalChars * d.typingPerChar * K);
            } else if (target?.type === 'hero-name-word') {
              agent.cursorType = 'ibeam';
              const totalChars = target.spans?.length || 1;
              agent.actionDuration = totalChars * d.typingPerCharHeroName * K;
            } else if (target?.type === 'svg-shape') {
              agent.cursorType = 'arrow';
              agent.actionDuration = d.shapePlacement * K;
            } else if (target?.type === 'button' || target?.type === 'chip') {
              agent.cursorType = 'arrow';
              agent.actionDuration = d.buttonRipple * K * 1.5;
            } else {
              agent.cursorType = 'arrow';
              agent.actionDuration = d.blockWireframe * K;
            }
          }
        } else if (agent.mode === 'acting') {
          const progress = Math.min(1, (now - agent.actionStart) / agent.actionDuration);
          const target = queue.find((t) => t.id === agent.activeTargetId);

          if (agent.boxRect) {
            activeGuides.push({
              x: agent.boxRect.x,
              y: agent.boxRect.y,
              w: agent.boxRect.w,
              h: agent.boxRect.h,
              color: agent.color,
              tag: agent.tagLabel || '',
              opacity: 1,
            });
          }

          // Type letter by letter: reveals exact spans with data-char-revealed
          if (target?.type === 'text' || target?.type === 'hero-name-word') {
            if (target.spans && target.spans.length > 0) {
              const totalChars = target.spans.length;
              const charIndex = Math.min(totalChars - 1, Math.floor(progress * totalChars));

              for (let i = 0; i <= charIndex; i++) {
                const s = target.spans[i];
                s.setAttribute('data-char-revealed', 'true');
                s.style.opacity = '1';
              }

              const activeSpan = target.spans[charIndex];
              const mountRect = mountEl.getBoundingClientRect();
              const spanRect = activeSpan.getBoundingClientRect();
              agent.x = spanRect.right - mountRect.left;
              agent.y = spanRect.top - mountRect.top + spanRect.height / 2;
            }
          } else if (target?.type === 'button' || target?.type === 'chip') {
            const mountRect = mountEl.getBoundingClientRect();
            const btnRect = target.element.getBoundingClientRect();
            const centerX = btnRect.left - mountRect.left + btnRect.width / 2;
            const centerY = btnRect.top - mountRect.top + btnRect.height / 2;

            agent.x += (centerX - agent.x) * 0.35;
            agent.y += (centerY - agent.y) * 0.35;

            const rippleProgress = Math.min(1, (now - agent.actionStart) / (d.buttonRipple * K));
            const rippleR = 10 + rippleProgress * 30;
            const rippleAlpha = Math.max(0, 1 - rippleProgress);

            if (rippleAlpha > 0.01) {
              ctx.save();
              ctx.globalAlpha = rippleAlpha;
              ctx.strokeStyle = agent.color;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(centerX, centerY, rippleR, 0, Math.PI * 2);
              ctx.stroke();
              ctx.restore();
            }

            target.element.style.opacity = `${progress}`;
          } else if (target?.type === 'form-field') {
            if (target.spans) {
              target.spans.forEach((s) => {
                s.setAttribute('data-char-revealed', 'true');
                s.style.opacity = '1';
              });
            }
            target.element.style.opacity = `${progress}`;
          } else if (target?.type === 'figure') {
            if (agent.boxRect) {
              ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
              ctx.fillRect(agent.boxRect.x, agent.boxRect.y, agent.boxRect.w, agent.boxRect.h);

              ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
              ctx.setLineDash([4, 4]);
              ctx.strokeRect(agent.boxRect.x + 8, agent.boxRect.y + 8, agent.boxRect.w * 0.45, agent.boxRect.h * 0.4);
              ctx.strokeRect(agent.boxRect.x + 8, agent.boxRect.y + 8 + agent.boxRect.h * 0.45, agent.boxRect.w - 16, agent.boxRect.h * 0.45);
              ctx.setLineDash([]);
            }
            target.element.style.opacity = `${progress}`;
          } else if (target?.type === 'svg-shape') {
            const scale = 0.4 + progress * 0.6;
            target.element.style.opacity = `${progress}`;
            target.element.style.transformOrigin = 'center';
            target.element.style.transform = `scale(${scale})`;
          }

          if (progress >= 1) {
            if (target) {
              target.status = 'completed';
              target.element.style.opacity = '1';
              target.element.style.visibility = 'visible';
            }
            agent.cursorType = 'arrow';
            agent.mode = 'finishing';
            agent.actionStart = now;
            agent.actionDuration = d.boxFadeOut * K;
          }
        } else if (agent.mode === 'finishing') {
          const progress = Math.min(1, (now - agent.actionStart) / agent.actionDuration);
          const boxOpacity = 1 - progress;

          if (agent.boxRect && boxOpacity > 0.05) {
            activeGuides.push({
              x: agent.boxRect.x,
              y: agent.boxRect.y,
              w: agent.boxRect.w,
              h: agent.boxRect.h,
              color: agent.color,
              tag: agent.tagLabel || '',
              opacity: boxOpacity,
            });
          }

          if (progress >= 1) {
            agent.mode = 'idle';
            agent.activeTargetId = undefined;
            agent.boxRect = undefined;
            const angle = Math.random() * Math.PI * 2;
            const dist = 70 + Math.random() * 150;
            agent.targetX = Math.max(40, Math.min(mountEl.offsetWidth - 40, workCenterX + Math.cos(angle) * dist));
            agent.targetY = Math.max(40, Math.min(mountEl.offsetHeight - 40, workCenterY + Math.sin(angle) * dist));
          }
        }
      });

      // Selection Boxes
      activeGuides.forEach((g) => {
        ctx.save();
        ctx.globalAlpha = g.opacity;

        ctx.strokeStyle = AGENT_SWARM_CONFIG.guideLineColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);

        ctx.beginPath();
        ctx.moveTo(0, g.y + 0.5);
        ctx.lineTo(mountEl.offsetWidth, g.y + 0.5);
        ctx.moveTo(0, g.y + g.h + 0.5);
        ctx.lineTo(mountEl.offsetWidth, g.y + g.h + 0.5);
        ctx.moveTo(g.x + 0.5, 0);
        ctx.lineTo(g.x + 0.5, mountEl.offsetHeight);
        ctx.moveTo(g.x + g.w + 0.5, 0);
        ctx.lineTo(g.x + g.w + 0.5, mountEl.offsetHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = g.color || AGENT_SWARM_CONFIG.accentColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(g.x, g.y, g.w, g.h);

        const handleSize = 5;
        const half = handleSize / 2;
        const handlePts = [
          [g.x, g.y],
          [g.x + g.w / 2, g.y],
          [g.x + g.w, g.y],
          [g.x + g.w, g.y + g.h / 2],
          [g.x + g.w, g.y + g.h],
          [g.x + g.w / 2, g.y + g.h],
          [g.x, g.y + g.h],
          [g.x, g.y + g.h / 2],
        ];

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = g.color || AGENT_SWARM_CONFIG.accentColor;
        ctx.lineWidth = 1;
        handlePts.forEach(([hx, hy]) => {
          ctx.fillRect(hx - half, hy - half, handleSize, handleSize);
          ctx.strokeRect(hx - half, hy - half, handleSize, handleSize);
        });

        if (g.tag) {
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          const txtW = ctx.measureText(g.tag).width;
          const badgeX = g.x;
          const badgeY = g.y + g.h + 4;

          ctx.fillStyle = g.color || AGENT_SWARM_CONFIG.accentColor;
          ctx.fillRect(badgeX, badgeY, txtW + 8, 14);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(g.tag, badgeX + 4, badgeY + 10);
        }

        ctx.restore();
      });

      // Draw Cursors & Badges
      agentsRef.current.forEach((agent) => {
        if (agent.mode === 'hidden') return;

        if (agent.role === 'ambient') {
          agent.trail.push({ x: agent.x, y: agent.y, alpha: 0.8 });
          if (agent.trail.length > 8) agent.trail.shift();

          ctx.font = '10px sans-serif';
          ctx.fillStyle = agent.color;
          agent.trail.forEach((pt) => {
            pt.alpha *= 0.92;
            ctx.save();
            ctx.globalAlpha = pt.alpha;
            ctx.fillText('+', pt.x - 3, pt.y + 4);
            ctx.restore();
          });
        }

        ctx.save();
        ctx.translate(agent.x, agent.y);
        ctx.scale(agent.scale, agent.scale);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 2;

        if (agent.cursorType === 'crosshair') {
          ctx.strokeStyle = agent.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-6, 0);
          ctx.lineTo(6, 0);
          ctx.moveTo(0, -6);
          ctx.lineTo(0, 6);
          ctx.stroke();
        } else if (agent.cursorType === 'ibeam') {
          ctx.strokeStyle = agent.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-4, -7);
          ctx.lineTo(4, -7);
          ctx.moveTo(0, -7);
          ctx.lineTo(0, 7);
          ctx.moveTo(-4, 7);
          ctx.lineTo(4, 7);
          ctx.stroke();
        } else {
          ctx.fillStyle = agent.color;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(11, 14);
          ctx.lineTo(5, 14);
          ctx.lineTo(2, 19);
          ctx.lineTo(0, 18);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();

        if (agent.mode !== 'merging' && agent.scale > 0.4) {
          ctx.save();
          const badgeText = agent.name;
          ctx.font = 'bold 8.5px JetBrains Mono, monospace';
          const tw = ctx.measureText(badgeText).width;
          const bx = agent.x + 10;
          const by = agent.cursorType === 'ibeam' ? agent.y - 18 : agent.y + 12;

          ctx.fillStyle = agent.color;
          ctx.beginPath();
          ctx.roundRect(bx, by, tw + 8, 13, 3);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.fillText(badgeText, bx + 4, by + 9.5);
          ctx.restore();
        }
      });

      // Merge Complete Transition
      const phaseFinal = phaseRef.current;
      if ((phaseFinal === 'hero-merge' || phaseFinal === 'late-merge') && agentsRef.current.every((a) => a.mode === 'hidden')) {
        ctx.restore();
        if (phaseFinal === 'hero-merge') {
          setPhase('waiting-late');
        } else {
          revealAllTargets();
          setPhase('finished');
        }
        return;
      }

      ctx.restore();
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [phase, K, setPhase, revealAllTargets, mountedHeroContainer, mountedLateContainer]);

  if (phase === 'finished') {
    return null;
  }

  const isHeroPhase = phase === 'hero' || phase === 'hero-merge' || phase === 'spawning-hero';
  const isLatePhase = phase === 'late' || phase === 'late-merge' || phase === 'spawning-late';
  const showBar = phase === 'hero' || phase === 'late';

  return (
    <>
      {/* 1. Hero Canvas portaled directly into #hero-swarm-mount (Attached to Hero Section) */}
      {isHeroPhase && mountedHeroContainer &&
        createPortal(
          <canvas ref={heroCanvasRef} className="w-full h-full block" />,
          mountedHeroContainer
        )}

      {/* 2. Late Canvas portaled directly into #late-swarm-mount (Attached to Contact & Footer) */}
      {isLatePhase && mountedLateContainer &&
        createPortal(
          <canvas ref={lateCanvasRef} className="w-full h-full block" />,
          mountedLateContainer
        )}

      {/* 3. Floating Control Bar portaled to document.body (Fixed UI HUD) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] pointer-events-auto transition-all duration-500 ease-out select-none ${
              showBar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
            }`}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#080d1c]/90 backdrop-blur-xl border border-white/20 shadow-2xl text-xs font-mono text-[#eef0f5]">
              <div className="flex items-center -space-x-1">
                {AGENT_SWARM_CONFIG.agentPalette.slice(0, 5).map((p) => (
                  <span
                    key={p.name}
                    className="w-2.5 h-2.5 rounded-full border border-black/40"
                    style={{ backgroundColor: p.color }}
                  />
                ))}
              </div>

              <span className="font-semibold text-[11px] tracking-wide text-white">
                {isMobileRef.current ? AGENT_SWARM_CONFIG.totalAgentsMobile : AGENT_SWARM_CONFIG.totalAgentsDesktop} agents ·{' '}
                <span className="text-[#38bdf8]">{completedCount}</span> / {totalLayers} layers
              </span>

              <span className="w-px h-3.5 bg-white/20" />

              <button
                type="button"
                onClick={() => handleNav('prev')}
                title="Scroll to previous section"
                className="px-2 py-0.5 rounded-md hover:bg-white/10 active:scale-95 text-[#94a3b8] hover:text-white transition-all text-[11px] font-semibold cursor-pointer"
              >
                Prev
              </button>

              <button
                type="button"
                onClick={() => handleNav('next')}
                title="Scroll to next section"
                className="px-2 py-0.5 rounded-md hover:bg-white/10 active:scale-95 text-[#94a3b8] hover:text-white transition-all text-[11px] font-semibold cursor-pointer"
              >
                Next
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                title="Reveal all content and hide swarm"
                className="ml-1 px-2.5 py-0.5 rounded-full bg-[#ff4fa3]/20 hover:bg-[#ff4fa3]/40 border border-[#ff4fa3]/50 text-[#ff4fa3] hover:text-white text-[11px] font-bold active:scale-95 transition-all cursor-pointer"
              >
                Hide
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
