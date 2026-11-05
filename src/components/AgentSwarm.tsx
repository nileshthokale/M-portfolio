import React, { useEffect, useRef } from 'react';

// ============================================================================
// CONFIGURATION & SCOPES
// ============================================================================
export const AGENT_SWARM_CONFIG = {
  k: 1.8,

  // Flag: absolutely no idle wandering or random hovering
  IDLE_WANDER: false,

  // Config switch: toggle 'hero' or 'contact'. If 'contact' is removed, effect runs only on hero
  runs: ['hero', 'contact'] as Array<'hero' | 'contact'>,

  thresholds: {
    heroScopeRatio: 0.35,
    heroScopeMinPx: 300,
    contactScopeRatio: 0.15,
    contactScopeMinPx: 200,
    targetInView: 0.50,
  },

  viewportMargin: 8,     // All agents clamped to [8, window.innerWidth - 8] and [8, window.innerHeight - 8]

  accentColor: '#2f6bff',
  guideLineColor: 'rgba(47, 107, 255, 0.35)',
  redGuideColor: '#ff3b30',
  redGuideX: 42,

  totalAgentsDesktop: 18,
  totalAgentsMobile: 10,

  // Concurrency slots per lane (on-demand creation up to limits)
  maxNavWorkersDesktop: 4,
  maxNavWorkersMobile: 2,
  maxHeroWorkersDesktop: 14,
  maxHeroWorkersMobile: 8,

  maxContactWorkersDesktop: 9,
  maxContactWorkersMobile: 5,
  maxFooterWorkersDesktop: 9,
  maxFooterWorkersMobile: 5,

  paletteColors: [
    '#2f6bff', // blue
    '#ff375f', // pink
    '#ff9f0a', // orange
    '#30d158', // green
    '#bf5af2', // purple
    '#00c7be', // teal
    '#ffd60a', // yellow
    '#ff453a', // red
    '#5e5ce6', // indigo
    '#38bdf8', // sky
    '#f43f5e', // rose
    '#fb923c', // amber
    '#4ade80', // emerald
    '#c084fc', // violet
    '#2dd4bf', // cyan
    '#facc15', // lime
    '#f87171', // coral
    '#818cf8', // lavender
  ],

  durations: {
    pointerWaitMax: 400,
    spawnIntervalMin: 60, // Spawn no faster than 60-80ms apart
    spawnIntervalTarget: 70,
    travelSpeedPxPerSec: 720, // Fixed velocity so closer tasks are faster
    travelMinDuration: 500,
    travelMaxDuration: 900,
    returnMinDuration: 400,
    returnMaxDuration: 800,
    dragBox: 450,
    typingPerChar: 45,
    typingPerCharHeroName: 90, // 90ms * K per letter for hero name
    typingMaxPerElement: 1500,
    blockWireframe: 650,
    buttonRipple: 320,
    shapePlacement: 400,
    boxFadeOut: 240,
  },

  lerp: {
    working: 0.18,
    merge: 0.18,
  },

  failsafes: {
    heroMaxDuration: 25000,
    contactMaxDuration: 40000,
    startWatchdogDelay: 1500,
    stuckElementThreshold: 6000,
  },
};

type TargetType =
  | 'nav-header'
  | 'text'
  | 'hero-name-word'
  | 'button'
  | 'chip'
  | 'figure'
  | 'form-field'
  | 'svg-shape';

type WorkLane = 'nav' | 'hero' | 'contact' | 'footer';

interface SwarmTarget {
  id: string;
  element: HTMLElement;
  type: TargetType;
  lane: WorkLane;
  order: number;
  spans?: HTMLElement[];
  padding?: { x: number; y: number };
  status: 'pending' | 'in-progress' | 'completed';
  assignedAgentId?: string;
  queuedAt: number;
  customData?: any;
}

type AgentStateMode = 'traveling' | 'working' | 'returning';

interface AgentState {
  id: string;
  name: string;
  color: string;
  assignedLane: WorkLane;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  scale: number;
  mode: AgentStateMode;
  workPhase?: 'dragging' | 'acting' | 'finishing';
  cursorType: 'arrow' | 'ibeam';
  activeTargetId: string;
  actionStart: number;
  actionDuration: number;
  departureTime?: number;
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

// ----------------------------------------------------------------------------
// DOM & SCOPE UTILITIES
// ----------------------------------------------------------------------------

export function isBlockOnScreen(el: HTMLElement | null, minRatio = 0.15, maxPx = 200): boolean {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (r.height <= 0) return false;
  const vTop = Math.max(0, r.top);
  const vBottom = Math.min(window.innerHeight, r.bottom);
  const vH = Math.max(0, vBottom - vTop);
  const reqH = Math.min(r.height * minRatio, maxPx);
  return vH >= reqH;
}

export function isContactScopeOnScreen(): boolean {
  const contact = document.getElementById('contact');
  const footer = document.querySelector('footer');
  return isBlockOnScreen(contact, 0.15, 200) || isBlockOnScreen(footer, 0.15, 200);
}

export function isHeroScopeOnScreen(): boolean {
  const hero = document.getElementById('top');
  if (!hero) return false;
  const r = hero.getBoundingClientRect();
  if (r.height <= 0) return false;
  const vTop = Math.max(0, r.top);
  const vBottom = Math.min(window.innerHeight, r.bottom);
  const vH = Math.max(0, vBottom - vTop);
  return (vH / r.height) >= AGENT_SWARM_CONFIG.thresholds.heroScopeRatio || vH >= AGENT_SWARM_CONFIG.thresholds.heroScopeMinPx;
}

export function isTargetInView(el: HTMLElement, minRatio = 0.50): boolean {
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return true;
  const vTop = Math.max(0, r.top);
  const vBottom = Math.min(window.innerHeight, r.bottom);
  const vH = Math.max(0, vBottom - vTop);
  if (r.top >= 0 && r.bottom <= window.innerHeight) return true;
  return (vH / r.height) >= minRatio;
}

export function isTargetScrolledPast(el: HTMLElement): boolean {
  const r = el.getBoundingClientRect();
  return r.bottom < -50;
}

export function revealTarget(t: SwarmTarget) {
  t.status = 'completed';
  t.element.setAttribute('data-agent-active', 'true');
  t.element.style.opacity = '1';
  t.element.style.visibility = 'visible';
  t.element.style.transform = t.type === 'svg-shape' ? 'scale(1)' : '';

  // Also ensure ancestor [data-swarm-target] is marked active so children are never hidden by container
  let ancestor = t.element.parentElement;
  while (ancestor) {
    if (ancestor.hasAttribute('data-swarm-target')) {
      ancestor.setAttribute('data-agent-active', 'true');
      ancestor.style.opacity = '1';
      ancestor.style.visibility = 'visible';
    }
    if (ancestor.tagName === 'BODY' || ancestor.tagName === 'FOOTER' || ancestor.id === 'contact') break;
    ancestor = ancestor.parentElement;
  }

  if (t.spans) {
    t.spans.forEach((s) => {
      s.setAttribute('data-char-revealed', 'true');
      s.style.opacity = '1';
      s.style.visibility = 'visible';
    });
  }
}

export function revealHeroScopeTargets() {
  document.querySelectorAll('#navbar-header, #top [data-swarm-target]').forEach((el) => {
    el.setAttribute('data-agent-active', 'true');
    (el as HTMLElement).style.opacity = '1';
    (el as HTMLElement).style.visibility = 'visible';
    (el as HTMLElement).style.transform = '';
  });
  document.querySelectorAll('#navbar-header .agent-char, #top .agent-char').forEach((el) => {
    el.setAttribute('data-char-revealed', 'true');
    (el as HTMLElement).style.opacity = '1';
    (el as HTMLElement).style.visibility = 'visible';
  });
}

export function revealContactScopeTargets() {
  document.querySelectorAll('#contact [data-swarm-target], footer [data-swarm-target], footer [data-swarm-shape]').forEach((el) => {
    el.setAttribute('data-agent-active', 'true');
    (el as HTMLElement).style.opacity = '1';
    (el as HTMLElement).style.visibility = 'visible';
    if ((el as HTMLElement).hasAttribute('data-swarm-shape')) {
      (el as HTMLElement).style.transform = 'scale(1)';
    } else {
      (el as HTMLElement).style.transform = '';
    }
  });
  document.querySelectorAll('#contact .agent-char, footer .agent-char').forEach((el) => {
    el.setAttribute('data-char-revealed', 'true');
    (el as HTMLElement).style.opacity = '1';
    (el as HTMLElement).style.visibility = 'visible';
  });
}

export function revealAllPageTargets() {
  revealHeroScopeTargets();
  revealContactScopeTargets();
  document.querySelectorAll('[data-swarm-target], [data-swarm-shape]').forEach((el) => {
    el.setAttribute('data-agent-active', 'true');
    (el as HTMLElement).style.opacity = '1';
    (el as HTMLElement).style.visibility = 'visible';
    (el as HTMLElement).style.transform = '';
  });
  document.querySelectorAll('.agent-char').forEach((el) => {
    el.setAttribute('data-char-revealed', 'true');
    (el as HTMLElement).style.opacity = '1';
    (el as HTMLElement).style.visibility = 'visible';
  });
  document.documentElement.classList.remove('agent-swarm-active');
}

export function cancelAgentSwarm() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cancel-agent-swarm'));
  }
}

export function ensureCharSpans(el: HTMLElement): HTMLElement[] {
  let spans = Array.from(el.querySelectorAll('.agent-char')) as HTMLElement[];
  if (spans.length > 0) return spans;

  const walkTextNodes = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (!text.trim()) return;
      const frag = document.createDocumentFragment();
      for (const char of text) {
        const span = document.createElement('span');
        span.className = `agent-char${char === ' ' ? ' agent-space' : ''}`;
        span.textContent = char;
        frag.appendChild(span);
      }
      node.parentNode?.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName !== 'SVG') {
      Array.from(node.childNodes).forEach(walkTextNodes);
    }
  };

  walkTextNodes(el);
  return Array.from(el.querySelectorAll('.agent-char')) as HTMLElement[];
}

// ----------------------------------------------------------------------------
// RUN TARGET SCANNERS
// ----------------------------------------------------------------------------

function scanRun1Targets(): SwarmTarget[] {
  const list: SwarmTarget[] = [];

  const registerTarget = (
    el: HTMLElement | null,
    id: string,
    type: TargetType,
    lane: WorkLane,
    order: number,
    padding?: { x: number; y: number },
    customData?: any
  ) => {
    if (!el) return;
    const spans = Array.from(el.querySelectorAll('.agent-char')) as HTMLElement[];
    list.push({
      id,
      element: el,
      type,
      lane,
      order,
      spans,
      padding,
      status: 'pending',
      queuedAt: performance.now(),
      customData,
    });
  };

  // NAV BAR targets
  registerTarget(document.getElementById('navbar-header'), 'nav-header', 'nav-header', 'nav', 0);
  registerTarget(document.querySelector('[data-swarm-target="nav-logo"]'), 'nav-logo', 'text', 'nav', 1, { x: 4, y: 2 });
  registerTarget(document.querySelector('[data-swarm-target="nav-link-0"]'), 'nav-link-0', 'text', 'nav', 2, { x: 4, y: 2 });
  registerTarget(document.querySelector('[data-swarm-target="nav-link-1"]'), 'nav-link-1', 'text', 'nav', 3, { x: 4, y: 2 });
  registerTarget(document.querySelector('[data-swarm-target="nav-link-2"]'), 'nav-link-2', 'text', 'nav', 4, { x: 4, y: 2 });
  registerTarget(document.querySelector('[data-swarm-target="nav-link-3"]'), 'nav-link-3', 'text', 'nav', 5, { x: 4, y: 2 });
  registerTarget(document.querySelector('[data-swarm-target="nav-resume"]'), 'nav-resume', 'button', 'nav', 6, { x: 6, y: 3 });

  // HERO CONTENT targets (parallel lane)
  const hero = document.getElementById('top');
  if (hero) {
    registerTarget(hero.querySelector('[data-swarm-target="hero-subtitle"]'), 'hero-subtitle', 'text', 'hero', 0);
    registerTarget(hero.querySelector('[data-swarm-target="hero-location"]'), 'hero-location', 'text', 'hero', 1);
    registerTarget(hero.querySelector('[data-swarm-target="hero-bottom"]'), 'hero-bottom', 'text', 'hero', 2);
    registerTarget(hero.querySelector('[data-swarm-target="hero-button"]'), 'hero-button', 'button', 'hero', 3);
    registerTarget(hero.querySelector('[data-swarm-target="hero-explore"]'), 'hero-explore', 'button', 'hero', 4);

    const nameHeading = hero.querySelector('#hero-heading');
    if (nameHeading) {
      const words = Array.from(nameHeading.querySelectorAll('.agent-word')) as HTMLElement[];
      words.forEach((wEl, idx) => {
        registerTarget(wEl, `hero-name-word-${idx}`, 'hero-name-word', 'hero', 5, undefined, { wordIndex: idx });
      });
    }
  }

  return list;
}

function scanRun2Targets(): SwarmTarget[] {
  const list: SwarmTarget[] = [];

  const registerTarget = (
    el: HTMLElement | null,
    id: string,
    type: TargetType,
    lane: WorkLane,
    order: number,
    padding?: { x: number; y: number },
    customData?: any
  ) => {
    if (!el) return;
    let spans: HTMLElement[] = [];
    if (type === 'text' || type === 'hero-name-word' || type === 'form-field') {
      spans = ensureCharSpans(el);
    }

    list.push({
      id,
      element: el,
      type,
      lane,
      order,
      spans,
      padding,
      status: 'pending',
      queuedAt: performance.now(),
      customData,
    });
  };

  const contact = document.getElementById('contact');
  const footer = document.querySelector('footer');

  // CONTACT lane targets
  if (contact) {
    registerTarget(contact.querySelector('[data-swarm-target="contact-heading"]'), 'contact-heading', 'text', 'contact', 0, { x: 8, y: 4 });
    registerTarget(contact.querySelector('[data-swarm-target="contact-link-email"]'), 'contact-email', 'text', 'contact', 1, { x: 6, y: 3 });
    registerTarget(contact.querySelector('[data-swarm-target="contact-link-phone"]'), 'contact-phone', 'text', 'contact', 1, { x: 6, y: 3 });
    registerTarget(contact.querySelector('[data-swarm-target="contact-intro"]'), 'contact-intro', 'text', 'contact', 2, { x: 6, y: 4 });

    const chips = Array.from(contact.querySelectorAll('[data-swarm-target="contact-chip"]')) as HTMLElement[];
    chips.forEach((ch, idx) => registerTarget(ch, `contact-chip-${idx}`, 'chip', 'contact', 3, { x: 4, y: 3 }));

    registerTarget(contact.querySelector('[data-swarm-target="contact-figure-bolt"]'), 'figure-bolt', 'figure', 'contact', 4, { x: 8, y: 8 });
    registerTarget(contact.querySelector('[data-swarm-target="contact-figure-hand"]'), 'figure-hand', 'figure', 'contact', 4, { x: 8, y: 8 });

    const fields = Array.from(contact.querySelectorAll('[data-swarm-target="contact-field"]')) as HTMLElement[];
    fields.forEach((f, idx) => registerTarget(f, `contact-field-${idx}`, 'form-field', 'contact', 5, { x: 6, y: 4 }));

    registerTarget(contact.querySelector('[data-swarm-target="contact-send-btn"]'), 'contact-send', 'button', 'contact', 6, { x: 8, y: 6 });
  }

  // FOOTER lane targets (parallel lane)
  if (footer) {
    const wordmarkEl = footer.querySelector('[data-swarm-target="footer-wordmark"]');
    if (wordmarkEl) {
      wordmarkEl.setAttribute('data-agent-active', 'true');
      (wordmarkEl as HTMLElement).style.opacity = '1';
      (wordmarkEl as HTMLElement).style.visibility = 'visible';

      const words = Array.from(wordmarkEl.querySelectorAll('.agent-word')) as HTMLElement[];
      if (words.length >= 2) {
        registerTarget(words[0], 'footer-word-0', 'text', 'footer', 0, { x: 8, y: 4 }, { wordIndex: 0 });
        registerTarget(words[1], 'footer-word-1', 'text', 'footer', 0, { x: 8, y: 4 }, { wordIndex: 1 });
      } else {
        registerTarget(wordmarkEl as HTMLElement, 'footer-wordmark', 'text', 'footer', 0, { x: 8, y: 4 });
      }
    }

    registerTarget(footer.querySelector('[data-swarm-target="footer-desc"]'), 'footer-desc', 'text', 'footer', 1, { x: 6, y: 4 });
    registerTarget(footer.querySelector('[data-swarm-target="footer-col-social"]'), 'footer-social', 'text', 'footer', 2, { x: 6, y: 6 });
    registerTarget(footer.querySelector('[data-swarm-target="footer-col-contact"]'), 'footer-contact', 'text', 'footer', 2, { x: 6, y: 6 });
    registerTarget(footer.querySelector('[data-swarm-target="footer-download"]'), 'footer-download', 'button', 'footer', 3, { x: 6, y: 4 });

    const shapeContainer = footer.querySelector('[data-swarm-target="footer-shapes"]');
    if (shapeContainer) {
      shapeContainer.setAttribute('data-agent-active', 'true');
      (shapeContainer as HTMLElement).style.opacity = '1';
      (shapeContainer as HTMLElement).style.visibility = 'visible';

      const shapeElements = Array.from(shapeContainer.querySelectorAll('[data-swarm-shape]')) as HTMLElement[];
      shapeElements.forEach((shapeEl, idx) => {
        (shapeEl as HTMLElement).style.opacity = '0';
        (shapeEl as HTMLElement).style.transform = 'scale(0.4)';
        (shapeEl as HTMLElement).style.transformOrigin = 'center';

        registerTarget(shapeEl, `footer-shape-${idx}`, 'svg-shape', 'footer', 4, { x: 4, y: 4 }, { shapeIndex: idx });
      });
    }
  }

  return list;
}

// ----------------------------------------------------------------------------
// SWARM RUN INSTANCE FACTORY (On-Demand Agent Architecture)
// ----------------------------------------------------------------------------

interface SwarmRunConfig {
  name: 'hero' | 'contact';
  lanes: WorkLane[];
  scanTargets: () => SwarmTarget[];
  onScreenCheck: () => boolean;
  maxDuration: number;
  getUserPointer: () => { x: number; y: number; active: boolean };
  onFinished?: (status: 'completed' | 'cancelled' | 'forced-reveal') => void;
}

export interface SwarmRunInstance {
  start: () => void;
  cancel: () => void;
  isActive: () => boolean;
  isStarted: () => boolean;
  isDone: () => boolean;
  destroy: () => void;
}

export function createSwarmRun(config: SwarmRunConfig): SwarmRunInstance {
  let status: 'unstarted' | 'active' | 'cancelling' | 'done' = 'unstarted';
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let animFrameId = 0;
  let startTime = 0;
  let lastSpawnTime = 0;
  let agentCounter = 0;
  let debugTimer: any = null;

  let agents: AgentState[] = [];
  let targetsQueue: SwarmTarget[] = [];
  const pulseRings: PulseRing[] = [];
  const stuckMap = new Map<string, number>();

  const K = AGENT_SWARM_CONFIG.k;
  const d = AGENT_SWARM_CONFIG.durations;
  const lerpCfg = AGENT_SWARM_CONFIG.lerp;

  const isMob = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const maxTotalAgents = isMob ? AGENT_SWARM_CONFIG.totalAgentsMobile : AGENT_SWARM_CONFIG.totalAgentsDesktop;

  const handleResize = () => {
    if (!canvas) return;
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
  };

  const cleanupDOM = () => {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = 0;
    }
    if (debugTimer) {
      clearInterval(debugTimer);
      debugTimer = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize);
    }
    if (canvas && canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
      canvas = null;
      ctx = null;
    }
  };

  const isLaneTargetReady = (target: SwarmTarget, activeTargets: SwarmTarget[]): boolean => {
    if (target.status !== 'pending') return false;

    if (target.lane === 'nav') {
      if (target.order === 0) return true;
      const prev = activeTargets.find((t) => t.lane === 'nav' && t.order === target.order - 1);
      return !prev || prev.status === 'completed' || prev.status === 'in-progress';
    }

    if (target.lane === 'hero') {
      if (target.order < 5) return true;
      if (target.order === 5) {
        // Name words: only when pre-name hero items 0-4 are completely finished
        const heroPreName = activeTargets.filter((t) => t.lane === 'hero' && t.order < 5 && t.status !== 'completed');
        return heroPreName.length === 0;
      }
    }

    if (target.lane === 'contact') {
      const prev = activeTargets.filter((t) => t.lane === 'contact' && t.order < target.order && t.status === 'pending');
      return prev.length === 0;
    }

    if (target.lane === 'footer') {
      const prev = activeTargets.filter((t) => t.lane === 'footer' && t.order < target.order && t.status === 'pending');
      return prev.length === 0;
    }

    return true;
  };

  // DEVELOPER SELF-CHECK (?swarmdebug=1)
  if (typeof window !== 'undefined' && window.location.search.includes('swarmdebug=1')) {
    debugTimer = setInterval(() => {
      if (status !== 'active' && status !== 'cancelling') return;
      const travel = agents.filter((a) => a.mode === 'traveling').length;
      const work = agents.filter((a) => a.mode === 'working').length;
      const ret = agents.filter((a) => a.mode === 'returning').length;
      console.log(`[SwarmDebug:${config.name}] Agents: travel=${travel}, work=${work}, return=${ret}, total=${agents.length}`);

      agents.forEach((a) => {
        const isIllegal = a.mode !== 'traveling' && a.mode !== 'working' && a.mode !== 'returning';
        const isWorkingWithoutTask = a.mode === 'working' && !a.activeTargetId;
        if (isIllegal || isWorkingWithoutTask) {
          console.warn(`IDLE AGENT FOUND: ${a.id} in illegal state mode=${(a as any).mode}, target=${a.activeTargetId}`);
        }
      });
    }, 1000);
  }

  const render = (now: number) => {
    if (status === 'done' || !canvas || !ctx) return;

    // Scope check: if user scrolled away from this run's scope, cancel cleanly
    if (status === 'active' && !config.onScreenCheck()) {
      instance.cancel();
      return;
    }

    // Run Time Limit Failsafe
    if (status === 'active' && now - startTime > config.maxDuration) {
      instance.cancel();
      return;
    }

    ctx.save();
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Pulse rings (spawn pops & death pops at pointer)
    pulseRings.forEach((r, idx) => {
      r.radius += 2.2;
      r.alpha = Math.max(0, 1 - r.radius / r.maxRadius);
      if (r.alpha > 0.01) {
        ctx!.save();
        ctx!.globalAlpha = r.alpha;
        ctx!.strokeStyle = r.color;
        ctx!.lineWidth = 2.2;
        ctx!.beginPath();
        ctx!.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx!.stroke();
        ctx!.restore();
      } else {
        pulseRings.splice(idx, 1);
      }
    });

    // Top Ruler & Red Guide Line during active building
    if (status === 'active') {
      const rulerH = 22;
      ctx.fillStyle = 'rgba(6, 12, 28, 0.92)';
      ctx.fillRect(0, 0, window.innerWidth, rulerH);
      ctx.strokeStyle = 'rgba(47, 107, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, rulerH - 0.5);
      ctx.lineTo(window.innerWidth, rulerH - 0.5);
      ctx.stroke();

      ctx.fillStyle = 'rgba(148, 163, 184, 0.75)';
      ctx.font = '8.5px JetBrains Mono, monospace';

      for (let x = 0; x < window.innerWidth; x += 10) {
        const is100 = x % 100 === 0;
        const is50 = x % 50 === 0;
        const tickH = is100 ? 10 : is50 ? 6 : 3;

        ctx.beginPath();
        ctx.moveTo(x + 0.5, rulerH - tickH);
        ctx.lineTo(x + 0.5, rulerH);
        ctx.stroke();

        if (is100 && x > 0 && x < window.innerWidth - 40) {
          ctx.fillText(`${x}`, x + 3, rulerH - 11);
        }
      }

      const redX = AGENT_SWARM_CONFIG.redGuideX;
      ctx.strokeStyle = 'rgba(255, 59, 48, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(redX + 0.5, 0);
      ctx.lineTo(redX + 0.5, window.innerHeight);
      ctx.stroke();

      ctx.fillStyle = '#ff3b30';
      ctx.fillRect(redX - 16, 26, 32, 14);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`X:${redX}`, redX, 36);
      ctx.textAlign = 'left';
    }

    // Target queues
    const activeTargets = targetsQueue.filter((t) => config.lanes.includes(t.lane));
    const pendingTargets = activeTargets.filter((t) => t.status === 'pending');
    const inProgressTargets = activeTargets.filter((t) => t.status === 'in-progress');

    // Targets scrolled far past are revealed instantly
    pendingTargets.forEach((t) => {
      if (isTargetScrolledPast(t.element)) {
        revealTarget(t);
      }
    });

    // STUCK-ELEMENT WATCHDOG: any element >= 50% in view for > 6s without active job is revealed instantly
    activeTargets.forEach((t) => {
      if (t.status === 'pending') {
        if (isTargetInView(t.element, AGENT_SWARM_CONFIG.thresholds.targetInView)) {
          if (!stuckMap.has(t.id)) {
            stuckMap.set(t.id, now);
          } else {
            const timeInView = now - stuckMap.get(t.id)!;
            if (timeInView > AGENT_SWARM_CONFIG.failsafes.stuckElementThreshold) {
              revealTarget(t);
              stuckMap.delete(t.id);
            }
          }
        } else {
          stuckMap.delete(t.id);
        }
      } else {
        stuckMap.delete(t.id);
      }
    });

    // ------------------------------------------------------------------------
    // ON-DEMAND AGENT CREATION (One Task per Agent)
    // ------------------------------------------------------------------------
    if (status === 'active') {
      const remainingPending = activeTargets.filter((t) => t.status === 'pending');

      config.lanes.forEach((lane) => {
        const laneTargets = remainingPending.filter((t) => t.lane === lane && isLaneTargetReady(t, activeTargets));
        if (laneTargets.length === 0) return;

        // Current agents working or heading to this lane
        const laneAgentsCount = agents.filter(
          (a) => a.assignedLane === lane && (a.mode === 'traveling' || a.mode === 'working')
        ).length;

        let maxLaneAllowed = 4;
        if (lane === 'nav') maxLaneAllowed = isMob ? AGENT_SWARM_CONFIG.maxNavWorkersMobile : AGENT_SWARM_CONFIG.maxNavWorkersDesktop;
        else if (lane === 'hero') maxLaneAllowed = laneTargets[0]?.type === 'hero-name-word' ? 3 : (isMob ? AGENT_SWARM_CONFIG.maxHeroWorkersMobile : AGENT_SWARM_CONFIG.maxHeroWorkersDesktop);
        else if (lane === 'contact') maxLaneAllowed = isMob ? AGENT_SWARM_CONFIG.maxContactWorkersMobile : AGENT_SWARM_CONFIG.maxContactWorkersDesktop;
        else if (lane === 'footer') maxLaneAllowed = isMob ? AGENT_SWARM_CONFIG.maxFooterWorkersMobile : AGENT_SWARM_CONFIG.maxFooterWorkersDesktop;

        // Total active slots check
        const totalAlive = agents.length;
        if (totalAlive < maxTotalAgents && laneAgentsCount < maxLaneAllowed) {
          if (now - lastSpawnTime >= d.spawnIntervalMin) {
            const candidate = laneTargets[0];

            // Target must be >= 50% in view. If not on screen yet, wait in queue!
            if (isTargetInView(candidate.element, AGENT_SWARM_CONFIG.thresholds.targetInView)) {
              candidate.status = 'in-progress';
              lastSpawnTime = now;

              const ptr = config.getUserPointer();
              const spawnX = ptr.active ? ptr.x : window.innerWidth / 2;
              const spawnY = ptr.active ? ptr.y : config.name === 'hero' ? 220 : 180;

              const padX = candidate.padding?.x || 0;
              const padY = candidate.padding?.y || 0;
              const rect = candidate.element.getBoundingClientRect();
              const targetX = rect.left - padX;
              const targetY = rect.top - padY;
              const width = Math.max(24, rect.width + padX * 2);
              const height = Math.max(18, rect.height + padY * 2);

              const dist = Math.hypot(targetX - spawnX, targetY - spawnY);
              const rawDuration = Math.max(d.travelMinDuration, Math.min(d.travelMaxDuration, (dist / d.travelSpeedPxPerSec) * 1000));
              const travelDuration = rawDuration * K;

              agentCounter++;
              const agentId = `agent-${agentCounter}`;
              const color = AGENT_SWARM_CONFIG.paletteColors[(agentCounter - 1) % AGENT_SWARM_CONFIG.paletteColors.length];

              candidate.assignedAgentId = agentId;

              // Emit birth pop pulse ring at pointer
              pulseRings.push({
                x: spawnX,
                y: spawnY,
                radius: 0,
                maxRadius: 28,
                alpha: 1,
                color,
              });

              agents.push({
                id: agentId,
                name: agentId,
                color,
                assignedLane: lane,
                x: spawnX,
                y: spawnY,
                startX: spawnX,
                startY: spawnY,
                targetX,
                targetY,
                scale: 0,
                mode: 'traveling',
                cursorType: 'arrow',
                activeTargetId: candidate.id,
                actionStart: now,
                actionDuration: travelDuration,
                boxRect: {
                  x: targetX,
                  y: targetY,
                  w: 0,
                  h: 0,
                  fullW: width,
                  fullH: height,
                },
                tagLabel: `${candidate.element.tagName.toLowerCase()} · ${Math.round(width)}×${Math.round(height)}`,
                trail: [],
              });
            }
          }
        }
      });
    }

    const activeGuides: Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      tag: string;
      opacity: number;
    }> = [];

    // ------------------------------------------------------------------------
    // UPDATE AGENTS: Exactly Traveling -> Working -> Returning -> Die
    // ------------------------------------------------------------------------
    const deadAgentIds: string[] = [];

    agents.forEach((agent) => {
      const activeTarget = targetsQueue.find((t) => t.id === agent.activeTargetId);

      // Check if target scrolled out of view mid-job
      if (agent.mode === 'traveling' || agent.mode === 'working') {
        if (activeTarget) {
          const r = activeTarget.element.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) {
            revealTarget(activeTarget);
            // Immediately start returning to cursor
            agent.mode = 'returning';
            agent.departureTime = now;
            agent.boxRect = undefined;
          }
        }
      }

      // STATE 1: TRAVELING (Flying from cursor to task)
      if (agent.mode === 'traveling') {
        const progress = Math.min(1, (now - agent.actionStart) / agent.actionDuration);
        const eased = 1 - Math.pow(1 - progress, 3); // Smooth cubic ease-out

        // Dynamic target tracking in case of scroll
        if (activeTarget) {
          const rect = activeTarget.element.getBoundingClientRect();
          const padX = activeTarget.padding?.x || 0;
          const padY = activeTarget.padding?.y || 0;
          agent.targetX = rect.left - padX;
          agent.targetY = rect.top - padY;
          if (agent.boxRect) {
            agent.boxRect.x = agent.targetX;
            agent.boxRect.y = agent.targetY;
          }
        }

        agent.x = agent.startX + (agent.targetX - agent.startX) * eased;
        agent.y = agent.startY + (agent.targetY - agent.startY) * eased;

        // Pop scale from 0 to 1 over first 120ms
        const popProgress = Math.min(1, (now - agent.actionStart) / 120);
        agent.scale = Math.min(1, popProgress * 1.15);

        // Emit fading path trail
        agent.trail.push({ x: agent.x, y: agent.y, alpha: 0.75 });
        if (agent.trail.length > 5) agent.trail.shift();

        if (progress >= 1 || Math.hypot(agent.targetX - agent.x, agent.targetY - agent.y) < 6) {
          agent.scale = 1;
          agent.mode = 'working';
          agent.workPhase = 'dragging';
          agent.actionStart = now;
          agent.actionDuration = d.dragBox * K;

          if (activeTarget && agent.boxRect) {
            const rect = activeTarget.element.getBoundingClientRect();
            const padX = activeTarget.padding?.x || 0;
            const padY = activeTarget.padding?.y || 0;
            agent.boxRect.x = rect.left - padX;
            agent.boxRect.y = rect.top - padY;
            agent.boxRect.fullW = Math.max(24, rect.width + padX * 2);
            agent.boxRect.fullH = Math.max(18, rect.height + padY * 2);
          }
        }
      }

      // STATE 2: WORKING ON TASK
      else if (agent.mode === 'working') {
        if (agent.workPhase === 'dragging') {
          const progress = Math.min(1, (now - agent.actionStart) / agent.actionDuration);
          const easeOut = 1 - Math.pow(1 - progress, 3);

          if (activeTarget && agent.boxRect) {
            const rect = activeTarget.element.getBoundingClientRect();
            const padX = activeTarget.padding?.x || 0;
            const padY = activeTarget.padding?.y || 0;
            agent.boxRect.x = rect.left - padX;
            agent.boxRect.y = rect.top - padY;
            agent.boxRect.fullW = Math.max(24, rect.width + padX * 2);
            agent.boxRect.fullH = Math.max(18, rect.height + padY * 2);
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
            agent.workPhase = 'acting';
            agent.actionStart = now;

            if (activeTarget && activeTarget.type !== 'hero-name-word') {
              activeTarget.element.setAttribute('data-agent-active', 'true');
            }

            if (activeTarget?.type === 'nav-header') {
              agent.cursorType = 'arrow';
              agent.actionDuration = d.dragBox * K;
              activeTarget.element.style.opacity = '1';
              activeTarget.element.style.visibility = 'visible';
            } else if (activeTarget?.type === 'text') {
              agent.cursorType = 'ibeam';
              const totalChars = activeTarget.spans?.length || 1;
              agent.actionDuration = Math.min(d.typingMaxPerElement * K, totalChars * d.typingPerChar * K);
            } else if (activeTarget?.type === 'hero-name-word') {
              agent.cursorType = 'ibeam';
              const totalChars = activeTarget.spans?.length || 1;
              agent.actionDuration = totalChars * d.typingPerCharHeroName * K;
            } else if (activeTarget?.type === 'svg-shape') {
              agent.cursorType = 'arrow';
              agent.actionDuration = d.shapePlacement * K;
            } else if (activeTarget?.type === 'button' || activeTarget?.type === 'chip') {
              agent.cursorType = 'arrow';
              agent.actionDuration = d.buttonRipple * K * 1.5;
            } else {
              agent.cursorType = 'arrow';
              agent.actionDuration = d.blockWireframe * K;
            }
          }
        } else if (agent.workPhase === 'acting') {
          const progress = Math.min(1, (now - agent.actionStart) / agent.actionDuration);

          if (activeTarget && agent.boxRect) {
            const rect = activeTarget.element.getBoundingClientRect();
            const padX = activeTarget.padding?.x || 0;
            const padY = activeTarget.padding?.y || 0;
            agent.boxRect.x = rect.left - padX;
            agent.boxRect.y = rect.top - padY;
            agent.boxRect.w = rect.width + padX * 2;
            agent.boxRect.h = rect.height + padY * 2;

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

          // Specific building animation per type
          if (activeTarget?.type === 'text' || activeTarget?.type === 'hero-name-word') {
            if (activeTarget.spans && activeTarget.spans.length > 0) {
              const totalChars = activeTarget.spans.length;
              const charIndex = Math.min(totalChars - 1, Math.floor(progress * totalChars));

              for (let i = 0; i <= charIndex; i++) {
                const s = activeTarget.spans[i];
                s.setAttribute('data-char-revealed', 'true');
                s.style.opacity = '1';
                s.style.visibility = 'visible';
              }

              const activeSpan = activeTarget.spans[charIndex];
              const spanRect = activeSpan.getBoundingClientRect();
              agent.x = spanRect.right;
              agent.y = spanRect.top + spanRect.height / 2;
            }
          } else if (activeTarget?.type === 'button' || activeTarget?.type === 'chip') {
            const btnRect = activeTarget.element.getBoundingClientRect();
            const centerX = btnRect.left + btnRect.width / 2;
            const centerY = btnRect.top + btnRect.height / 2;

            agent.x += (centerX - agent.x) * 0.35;
            agent.y += (centerY - agent.y) * 0.35;

            const rippleProgress = Math.min(1, (now - agent.actionStart) / (d.buttonRipple * K));
            const rippleR = 10 + rippleProgress * 30;
            const rippleAlpha = Math.max(0, 1 - rippleProgress);

            if (rippleAlpha > 0.01) {
              ctx!.save();
              ctx!.globalAlpha = rippleAlpha;
              ctx!.strokeStyle = agent.color;
              ctx!.lineWidth = 2;
              ctx!.beginPath();
              ctx!.arc(centerX, centerY, rippleR, 0, Math.PI * 2);
              ctx!.stroke();
              ctx!.restore();
            }

            activeTarget.element.style.opacity = `${progress}`;
            activeTarget.element.style.visibility = 'visible';
          } else if (activeTarget?.type === 'nav-header') {
            activeTarget.element.style.opacity = '1';
            activeTarget.element.style.visibility = 'visible';
          } else if (activeTarget?.type === 'form-field') {
            if (activeTarget.spans && activeTarget.spans.length > 0) {
              const totalChars = activeTarget.spans.length;
              const charIndex = Math.min(totalChars - 1, Math.floor(progress * totalChars));
              for (let i = 0; i <= charIndex; i++) {
                const s = activeTarget.spans[i];
                s.setAttribute('data-char-revealed', 'true');
                s.style.opacity = '1';
                s.style.visibility = 'visible';
              }
              const activeSpan = activeTarget.spans[charIndex];
              const spanRect = activeSpan.getBoundingClientRect();
              agent.x = spanRect.right;
              agent.y = spanRect.top + spanRect.height / 2;
            }

            if (agent.boxRect) {
              const borderY = agent.boxRect.y + agent.boxRect.h;
              const borderW = agent.boxRect.w * progress;
              ctx!.save();
              ctx!.strokeStyle = agent.color;
              ctx!.lineWidth = 2.5;
              ctx!.beginPath();
              ctx!.moveTo(agent.boxRect.x, borderY);
              ctx!.lineTo(agent.boxRect.x + borderW, borderY);
              ctx!.stroke();
              ctx!.restore();
            }

            activeTarget.element.style.opacity = `${progress}`;
            activeTarget.element.style.visibility = 'visible';
          } else if (activeTarget?.type === 'figure') {
            if (agent.boxRect) {
              ctx!.save();
              ctx!.fillStyle = 'rgba(15, 23, 42, 0.5)';
              ctx!.fillRect(agent.boxRect.x, agent.boxRect.y, agent.boxRect.w, agent.boxRect.h);

              ctx!.strokeStyle = agent.color;
              ctx!.lineWidth = 1.5;
              ctx!.setLineDash([4, 4]);
              ctx!.strokeRect(agent.boxRect.x + 4, agent.boxRect.y + 4, agent.boxRect.w - 8, agent.boxRect.h - 8);
              ctx!.restore();
            }
            activeTarget.element.style.opacity = `${progress}`;
            activeTarget.element.style.visibility = 'visible';
          } else if (activeTarget?.type === 'svg-shape') {
            const scale = 0.4 + progress * 0.6;
            activeTarget.element.setAttribute('data-agent-active', 'true');
            activeTarget.element.style.opacity = `${progress}`;
            activeTarget.element.style.visibility = 'visible';
            activeTarget.element.style.transformOrigin = 'center';
            activeTarget.element.style.transform = `scale(${scale})`;

            if (agent.boxRect) {
              const centerX = agent.boxRect.x + agent.boxRect.w / 2;
              const centerY = agent.boxRect.y + agent.boxRect.h / 2;
              agent.x += (centerX - agent.x) * 0.25;
              agent.y += (centerY - agent.y) * 0.25;
            }
          }

          if (progress >= 1) {
            if (activeTarget) {
              revealTarget(activeTarget);
            }
            agent.cursorType = 'arrow';
            agent.workPhase = 'finishing';
            agent.actionStart = now;
            agent.actionDuration = d.boxFadeOut * K;
          }
        } else if (agent.workPhase === 'finishing') {
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
            // Task is completely finished -> RETURN IMMEDIATELY TO CURSOR!
            agent.mode = 'returning';
            agent.departureTime = now;
            agent.boxRect = undefined;
          }
        }
      }

      // STATE 3: RETURNING DIRECTLY TO VISITOR'S LIVE CURSOR
      else if (agent.mode === 'returning') {
        if (agent.departureTime && now < agent.departureTime) {
          // Waiting for staggered departure (during cancel)
          return;
        }

        const ptr = config.getUserPointer();
        const destX = ptr.active ? ptr.x : window.innerWidth / 2;
        const destY = ptr.active ? ptr.y : window.innerHeight / 2;

        agent.x += (destX - agent.x) * (lerpCfg.merge / K);
        agent.y += (destY - agent.y) * (lerpCfg.merge / K);

        // Emit fading path trail while flying back
        agent.trail.push({ x: agent.x, y: agent.y, alpha: 0.75 });
        if (agent.trail.length > 5) agent.trail.shift();

        const dist = Math.hypot(destX - agent.x, destY - agent.y);

        // Shrink within 40px of pointer
        if (dist < 40) {
          agent.scale = Math.max(0, agent.scale - 0.16);
        }

        // DIE within 10px of pointer
        if (dist < 10 || agent.scale <= 0.05) {
          pulseRings.push({
            x: destX,
            y: destY,
            radius: 0,
            maxRadius: 18,
            alpha: 0.8,
            color: agent.color,
          });
          deadAgentIds.push(agent.id);
        }
      }

      // Clamp coordinates to viewport with 8px margin
      agent.x = Math.max(AGENT_SWARM_CONFIG.viewportMargin, Math.min(window.innerWidth - AGENT_SWARM_CONFIG.viewportMargin, agent.x));
      agent.y = Math.max(AGENT_SWARM_CONFIG.viewportMargin, Math.min(window.innerHeight - AGENT_SWARM_CONFIG.viewportMargin, agent.y));
    });

    // Remove dead agents from state array
    if (deadAgentIds.length > 0) {
      agents = agents.filter((a) => !deadAgentIds.includes(a.id));
    }

    // DRAW SELECTION BOXES & VIEWPORT GUIDE LINES
    activeGuides.forEach((g) => {
      ctx!.save();
      ctx!.globalAlpha = g.opacity;

      ctx!.strokeStyle = AGENT_SWARM_CONFIG.guideLineColor;
      ctx!.lineWidth = 1;
      ctx!.setLineDash([3, 3]);

      ctx!.beginPath();
      ctx!.moveTo(0, g.y + 0.5);
      ctx!.lineTo(window.innerWidth, g.y + 0.5);
      ctx!.moveTo(0, g.y + g.h + 0.5);
      ctx!.lineTo(window.innerWidth, g.y + g.h + 0.5);
      ctx!.moveTo(g.x + 0.5, 0);
      ctx!.lineTo(g.x + 0.5, window.innerHeight);
      ctx!.moveTo(g.x + g.w + 0.5, 0);
      ctx!.lineTo(g.x + g.w + 0.5, window.innerHeight);
      ctx!.stroke();
      ctx!.setLineDash([]);

      ctx!.strokeStyle = g.color || AGENT_SWARM_CONFIG.accentColor;
      ctx!.lineWidth = 1.5;
      ctx!.strokeRect(g.x, g.y, g.w, g.h);

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

      ctx!.fillStyle = '#ffffff';
      ctx!.strokeStyle = g.color || AGENT_SWARM_CONFIG.accentColor;
      ctx!.lineWidth = 1;
      handlePts.forEach(([hx, hy]) => {
        ctx!.fillRect(hx - half, hy - half, handleSize, handleSize);
        ctx!.strokeRect(hx - half, hy - half, handleSize, handleSize);
      });

      if (g.tag) {
        ctx!.font = 'bold 9px JetBrains Mono, monospace';
        const txtW = ctx!.measureText(g.tag).width;
        const badgeX = g.x;
        const badgeY = g.y + g.h + 4;

        ctx!.fillStyle = g.color || AGENT_SWARM_CONFIG.accentColor;
        ctx!.fillRect(badgeX, badgeY, txtW + 8, 14);
        ctx!.fillStyle = '#ffffff';
        ctx!.fillText(g.tag, badgeX + 4, badgeY + 10);
      }

      ctx!.restore();
    });

    // DRAW CURSORS, "+" TRAILS & NAME TAGS
    const ptr = config.getUserPointer();
    const ptrX = ptr.active ? ptr.x : window.innerWidth / 2;
    const ptrY = ptr.active ? ptr.y : 200;

    agents.forEach((agent) => {
      // Trails only while traveling or returning along path
      if (agent.mode === 'traveling' || agent.mode === 'returning') {
        ctx!.font = '10px sans-serif';
        ctx!.fillStyle = agent.color;
        agent.trail.forEach((pt) => {
          pt.alpha *= 0.88;
          if (pt.alpha > 0.08) {
            ctx!.save();
            ctx!.globalAlpha = pt.alpha;
            ctx!.fillText('+', pt.x - 3, pt.y + 4);
            ctx!.restore();
          }
        });
      }

      ctx!.save();
      ctx!.translate(agent.x, agent.y);
      ctx!.scale(agent.scale, agent.scale);
      ctx!.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx!.shadowBlur = 4;
      ctx!.shadowOffsetX = 1;
      ctx!.shadowOffsetY = 2;

      if (agent.cursorType === 'ibeam') {
        ctx!.strokeStyle = agent.color;
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.moveTo(-4, -7);
        ctx!.lineTo(4, -7);
        ctx!.moveTo(0, -7);
        ctx!.lineTo(0, 7);
        ctx!.moveTo(-4, 7);
        ctx!.lineTo(4, 7);
        ctx!.stroke();
      } else {
        ctx!.fillStyle = agent.color;
        ctx!.strokeStyle = '#ffffff';
        ctx!.lineWidth = 1.2;

        ctx!.beginPath();
        ctx!.moveTo(0, 0);
        ctx!.lineTo(11, 14);
        ctx!.lineTo(5, 14);
        ctx!.lineTo(2, 19);
        ctx!.lineTo(0, 18);
        ctx!.closePath();
        ctx!.fill();
        ctx!.stroke();
      }
      ctx!.restore();

      // Show name tag ONLY when > 40px away from the pointer and not returning
      const distFromPointer = Math.hypot(agent.x - ptrX, agent.y - ptrY);
      if (distFromPointer > 40 && agent.scale > 0.5 && agent.mode !== 'returning') {
        ctx!.save();
        const badgeText = agent.name;
        ctx!.font = 'bold 8.5px JetBrains Mono, monospace';
        const tw = ctx!.measureText(badgeText).width;
        const bx = agent.x + 10;
        const by = agent.cursorType === 'ibeam' ? agent.y - 18 : agent.y + 12;

        ctx!.fillStyle = agent.color;
        ctx!.beginPath();
        ctx!.roundRect(bx, by, tw + 8, 13, 3);
        ctx!.fill();

        ctx!.fillStyle = '#ffffff';
        ctx!.fillText(badgeText, bx + 4, by + 9.5);
        ctx!.restore();
      }
    });

    // ------------------------------------------------------------------------
    // NATURAL RUN COMPLETION: Queue is empty AND every agent has died
    // ------------------------------------------------------------------------
    const remainingTasks = activeTargets.filter((t) => t.status === 'pending' || t.status === 'in-progress');
    if (activeTargets.length > 0 && remainingTasks.length === 0 && agents.length === 0) {
      ctx.restore();
      const finishReason = status === 'cancelling' ? 'cancelled' : 'completed';
      status = 'done';
      cleanupDOM();

      if (config.name === 'hero') {
        revealHeroScopeTargets();
      } else {
        revealContactScopeTargets();
        document.documentElement.classList.remove('agent-swarm-active');
      }

      console.log(`swarm run finished: ${config.name} (${finishReason})`);
      config.onFinished?.(finishReason);
      return;
    }

    ctx.restore();
    animFrameId = requestAnimationFrame(render);
  };

  const instance: SwarmRunInstance = {
    start: () => {
      if (status !== 'unstarted') return;
      status = 'active';
      startTime = performance.now();
      lastSpawnTime = 0;
      agentCounter = 0;
      agents = [];
      console.log(`swarm run started: ${config.name}`);

      try {
        targetsQueue = config.scanTargets();

        canvas = document.createElement('canvas');
        canvas.className = 'fixed inset-0 pointer-events-none z-[2147483000] w-screen h-screen block select-none';
        canvas.setAttribute('aria-hidden', 'true');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '2147483000';
        document.body.appendChild(canvas);

        ctx = canvas.getContext('2d');
        handleResize();
        window.addEventListener('resize', handleResize);

        animFrameId = requestAnimationFrame(render);
      } catch (err) {
        if (config.name === 'contact') {
          console.error('swarm run finished: contact (forced reveal)', err);
          revealContactScopeTargets();
        } else {
          console.error('swarm run finished: hero (forced reveal)', err);
          revealHeroScopeTargets();
        }
        status = 'done';
        cleanupDOM();
        config.onFinished?.('forced-reveal');
        throw err;
      }
    },

    cancel: () => {
      if (status !== 'active') return;
      status = 'cancelling';
      console.log(`swarm run cancelled: ${config.name}`);

      // Finish every running job & reveal targets instantly
      targetsQueue.forEach((t) => {
        if (config.lanes.includes(t.lane)) {
          revealTarget(t);
        }
      });

      if (config.name === 'hero') {
        revealHeroScopeTargets();
      } else {
        revealContactScopeTargets();
        document.documentElement.classList.remove('agent-swarm-active');
      }

      // Stagger return for any alive agents (40-70ms apart)
      const now = performance.now();
      agents.forEach((ag, idx) => {
        ag.mode = 'returning';
        ag.departureTime = now + idx * 45;
        ag.boxRect = undefined;
      });

      // If no agents were alive, finish immediately
      if (agents.length === 0) {
        status = 'done';
        cleanupDOM();
        config.onFinished?.('cancelled');
      }
    },

    isActive: () => status === 'active' || status === 'cancelling',
    isStarted: () => status !== 'unstarted',
    isDone: () => status === 'done',
    destroy: () => {
      status = 'done';
      cleanupDOM();
    },
  };

  return instance;
}

// ============================================================================
// REACT COMPONENT: AgentSwarm
// ============================================================================
export const AgentSwarm: React.FC = () => {
  const heroRunRef = useRef<SwarmRunInstance | null>(null);
  const contactRunRef = useRef<SwarmRunInstance | null>(null);

  const heroDoneRef = useRef<boolean>(false);
  const contactDoneRef = useRef<boolean>(false);
  const userPointerRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  const contactInViewSinceRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      revealAllPageTargets();
      heroDoneRef.current = true;
      contactDoneRef.current = true;
      return;
    }

    // Pointer tracking across mouse, touch, and pen
    const updatePointer = (clientX: number, clientY: number) => {
      userPointerRef.current = {
        x: Math.max(AGENT_SWARM_CONFIG.viewportMargin, Math.min(window.innerWidth - AGENT_SWARM_CONFIG.viewportMargin, clientX)),
        y: Math.max(AGENT_SWARM_CONFIG.viewportMargin, Math.min(window.innerHeight - AGENT_SWARM_CONFIG.viewportMargin, clientY)),
        active: true,
      };
    };

    const onPointerMove = (e: PointerEvent) => updatePointer(e.clientX, e.clientY);
    const onPointerDown = (e: PointerEvent) => updatePointer(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });

    // Cancel active run if tab loses visibility
    const onVisibilityChange = () => {
      if (document.hidden) {
        if (heroRunRef.current?.isActive()) heroRunRef.current.cancel();
        if (contactRunRef.current?.isActive()) contactRunRef.current.cancel();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Cancel active run immediately when mobile navigation menu opens
    const onCancelSwarm = () => {
      if (heroRunRef.current?.isActive()) {
        heroRunRef.current.cancel();
        heroRunRef.current.destroy();
      }
      if (contactRunRef.current?.isActive()) {
        contactRunRef.current.cancel();
        contactRunRef.current.destroy();
      }
      heroDoneRef.current = true;
      contactDoneRef.current = true;
      revealAllPageTargets();
    };
    window.addEventListener('cancel-agent-swarm', onCancelSwarm);

    // ------------------------------------------------------------------------
    // CREATE HERO RUN INSTANCE
    // ------------------------------------------------------------------------
    heroRunRef.current = createSwarmRun({
      name: 'hero',
      lanes: ['nav', 'hero'],
      scanTargets: scanRun1Targets,
      onScreenCheck: isHeroScopeOnScreen,
      maxDuration: AGENT_SWARM_CONFIG.failsafes.heroMaxDuration,
      getUserPointer: () => userPointerRef.current,
      onFinished: () => {
        heroDoneRef.current = true;
      },
    });

    // ------------------------------------------------------------------------
    // CREATE CONTACT RUN INSTANCE (Run 2: Contact + Footer in parallel)
    // ------------------------------------------------------------------------
    contactRunRef.current = createSwarmRun({
      name: 'contact',
      lanes: ['contact', 'footer'],
      scanTargets: scanRun2Targets,
      onScreenCheck: isContactScopeOnScreen,
      maxDuration: AGENT_SWARM_CONFIG.failsafes.contactMaxDuration,
      getUserPointer: () => userPointerRef.current,
      onFinished: () => {
        contactDoneRef.current = true;
      },
    });

    // Helper: start contact run safely
    const triggerContactRun = () => {
      if (contactDoneRef.current || !AGENT_SWARM_CONFIG.runs.includes('contact')) return;
      if (contactRunRef.current?.isStarted()) return;

      // Cleanly cancel hero run if still active
      if (heroRunRef.current?.isActive()) {
        heroRunRef.current.cancel();
      }

      try {
        contactRunRef.current?.start();
      } catch (err) {
        console.error('swarm run finished: contact (forced reveal)', err);
        revealContactScopeTargets();
        contactDoneRef.current = true;
      }
    };

    // Helper: start hero run safely
    const triggerHeroRun = () => {
      if (heroDoneRef.current || !AGENT_SWARM_CONFIG.runs.includes('hero')) return;
      if (heroRunRef.current?.isStarted()) return;

      if (!isHeroScopeOnScreen()) {
        revealHeroScopeTargets();
        heroDoneRef.current = true;
        return;
      }

      try {
        heroRunRef.current?.start();
      } catch (err) {
        console.error('swarm run finished: hero (forced reveal)', err);
        revealHeroScopeTargets();
        heroDoneRef.current = true;
      }
    };

    // Initial check on load
    if (isContactScopeOnScreen()) {
      revealHeroScopeTargets();
      heroDoneRef.current = true;
      triggerContactRun();
    } else if (isHeroScopeOnScreen()) {
      const spawnTimer = setTimeout(() => {
        if (isContactScopeOnScreen()) {
          revealHeroScopeTargets();
          heroDoneRef.current = true;
          triggerContactRun();
        } else {
          triggerHeroRun();
        }
      }, AGENT_SWARM_CONFIG.durations.pointerWaitMax);

      (heroRunRef.current as any)._spawnTimer = spawnTimer;
    } else {
      revealHeroScopeTargets();
      heroDoneRef.current = true;
    }

    // Scroll listener for immediate transition and cancellation
    const onScrollCheck = () => {
      const contactOnScreen = isContactScopeOnScreen();
      const heroOnScreen = isHeroScopeOnScreen();

      if (contactOnScreen && !contactDoneRef.current && AGENT_SWARM_CONFIG.runs.includes('contact')) {
        triggerContactRun();
      }

      if (heroRunRef.current?.isActive() && !heroOnScreen) {
        heroRunRef.current.cancel();
      }

      if (contactRunRef.current?.isActive() && !contactOnScreen) {
        contactRunRef.current.cancel();
      }
    };
    window.addEventListener('scroll', onScrollCheck, { passive: true });

    // Observers for both scopes at setup
    let contactObserver: IntersectionObserver | null = null;
    let heroObserver: IntersectionObserver | null = null;

    const setupObservers = () => {
      const contactEl = document.getElementById('contact');
      const footerEl = document.querySelector('footer');
      const heroEl = document.getElementById('top');

      if (contactEl && AGENT_SWARM_CONFIG.runs.includes('contact')) {
        contactObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !contactDoneRef.current) {
                if (isContactScopeOnScreen()) {
                  triggerContactRun();
                }
              }
            });
          },
          { threshold: [0, 0.05, 0.15] }
        );
        contactObserver.observe(contactEl);
        if (footerEl) contactObserver.observe(footerEl);
      }

      if (heroEl && AGENT_SWARM_CONFIG.runs.includes('hero')) {
        heroObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !heroDoneRef.current) {
                if (isHeroScopeOnScreen() && !contactDoneRef.current && !isContactScopeOnScreen()) {
                  triggerHeroRun();
                }
              }
            });
          },
          { threshold: [0, 0.1, 0.35] }
        );
        heroObserver.observe(heroEl);
      }
    };

    setupObservers();

    // Retry checking DOM elements if not immediately available (up to 10s, every 500ms)
    let retryCount = 0;
    const retryInterval = setInterval(() => {
      retryCount++;
      const contactEl = document.getElementById('contact');
      if (!contactEl && retryCount < 20) {
        setupObservers();
      } else {
        clearInterval(retryInterval);
      }
    }, 500);

    // Watchdog Timer: Runs every 250ms to enforce Start Watchdog and Safety Nets
    const watchdogInterval = setInterval(() => {
      const contactOnScreen = isContactScopeOnScreen();

      // START WATCHDOG: if scope has been on screen for 1.5s and run hasn't started, force-start
      if (contactOnScreen && !contactDoneRef.current && AGENT_SWARM_CONFIG.runs.includes('contact')) {
        if (!contactRunRef.current?.isStarted()) {
          if (contactInViewSinceRef.current === null) {
            contactInViewSinceRef.current = performance.now();
          } else if (performance.now() - contactInViewSinceRef.current >= AGENT_SWARM_CONFIG.failsafes.startWatchdogDelay) {
            triggerContactRun();
          }
        }
      } else {
        contactInViewSinceRef.current = null;
      }
    }, 250);

    return () => {
      if ((heroRunRef.current as any)?._spawnTimer) {
        clearTimeout((heroRunRef.current as any)._spawnTimer);
      }
      clearInterval(retryInterval);
      clearInterval(watchdogInterval);
      if (contactObserver) contactObserver.disconnect();
      if (heroObserver) heroObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('scroll', onScrollCheck);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('cancel-agent-swarm', onCancelSwarm);

      heroRunRef.current?.destroy();
      contactRunRef.current?.destroy();
      revealAllPageTargets();
    };
  }, []);

  return null;
};
