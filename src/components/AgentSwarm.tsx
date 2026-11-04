import React, { useEffect, useRef } from 'react';

// ============================================================================
// CONFIGURATION & SCOPES
// ============================================================================
export const AGENT_SWARM_CONFIG = {
  k: 1.8,

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

  maxNavWorkersDesktop: 2,
  maxNavWorkersMobile: 1,
  maxHeroWorkersDesktop: 4,
  maxHeroWorkersMobile: 2,

  maxContactWorkersDesktop: 3,
  maxContactWorkersMobile: 1,
  maxFooterWorkersDesktop: 3,
  maxFooterWorkersMobile: 1,

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
    spawnInterval: 70, // 60-80ms apart
    mergeInterval: 45, // Staggered death into cursor (total ~600-800ms)
    flyToElement: 500,
    dragBox: 450,
    typingPerChar: 45,
    typingPerCharHeroName: 90, // 90ms * K per letter for hero name
    typingMaxPerElement: 1500,
    blockWireframe: 650,
    buttonRipple: 320,
    shapePlacement: 400,
    boxFadeOut: 350,
  },

  lerp: {
    working: 0.18,
    helper: 0.035,
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

interface AgentState {
  id: string;
  name: string;
  color: string;
  assignedLane: WorkLane;
  role: 'worker' | 'ambient';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  scale: number;
  spawnTime: number;
  mergeDepartureTime?: number;
  mode: 'unspawned' | 'spawning' | 'idle' | 'flying' | 'dragging' | 'acting' | 'finishing' | 'merging' | 'hidden';
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
    registerTarget(contact.querySelector('[data-swarm-target="contact-link-phone"]'), 'contact-phone', 'text', 'contact', 2, { x: 6, y: 3 });
    registerTarget(contact.querySelector('[data-swarm-target="contact-intro"]'), 'contact-intro', 'text', 'contact', 3, { x: 6, y: 4 });

    const chips = Array.from(contact.querySelectorAll('[data-swarm-target="contact-chip"]')) as HTMLElement[];
    chips.forEach((ch, idx) => registerTarget(ch, `contact-chip-${idx}`, 'chip', 'contact', 4 + idx, { x: 4, y: 3 }));

    registerTarget(contact.querySelector('[data-swarm-target="contact-figure-bolt"]'), 'figure-bolt', 'figure', 'contact', 8, { x: 8, y: 8 });
    registerTarget(contact.querySelector('[data-swarm-target="contact-figure-hand"]'), 'figure-hand', 'figure', 'contact', 9, { x: 8, y: 8 });

    const fields = Array.from(contact.querySelectorAll('[data-swarm-target="contact-field"]')) as HTMLElement[];
    fields.forEach((f, idx) => registerTarget(f, `contact-field-${idx}`, 'form-field', 'contact', 10 + idx, { x: 6, y: 4 }));

    registerTarget(contact.querySelector('[data-swarm-target="contact-send-btn"]'), 'contact-send', 'button', 'contact', 14, { x: 8, y: 6 });
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

        registerTarget(shapeEl, `footer-shape-${idx}`, 'svg-shape', 'footer', 4 + idx, { x: 4, y: 4 }, { shapeIndex: idx });
      });
    }
  }

  return list;
}

// ----------------------------------------------------------------------------
// SWARM RUN INSTANCE FACTORY (Independent Runs Architecture)
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
  let status: 'unstarted' | 'active' | 'merging' | 'done' = 'unstarted';
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let animFrameId = 0;
  let startTime = 0;
  let mergeTriggerTime = 0;

  let agents: AgentState[] = [];
  let targetsQueue: SwarmTarget[] = [];
  const pulseRings: PulseRing[] = [];
  const stuckMap = new Map<string, number>();

  const K = AGENT_SWARM_CONFIG.k;
  const d = AGENT_SWARM_CONFIG.durations;
  const lerpCfg = AGENT_SWARM_CONFIG.lerp;

  const isMob = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const totalAgents = isMob ? AGENT_SWARM_CONFIG.totalAgentsMobile : AGENT_SWARM_CONFIG.totalAgentsDesktop;

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
      if (target.order === 1) {
        const h = activeTargets.find((t) => t.lane === 'nav' && t.order === 0);
        return !h || h.status === 'completed' || h.status === 'in-progress';
      }
      const prev = activeTargets.find((t) => t.lane === 'nav' && t.order === target.order - 1);
      return !prev || prev.status === 'completed' || prev.status === 'in-progress';
    }

    if (target.lane === 'hero') {
      if (target.order < 5) return true;
      if (target.order === 5) {
        const heroPreName = activeTargets.filter((t) => t.lane === 'hero' && t.order < 5 && t.status !== 'completed');
        return heroPreName.length === 0;
      }
    }

    if (target.lane === 'contact') {
      const prev = activeTargets.filter((t) => t.lane === 'contact' && t.order < target.order && t.status === 'pending');
      return prev.length === 0;
    }

    if (target.lane === 'footer') {
      if (target.order === 0) return true; // Both word 0 and word 1 can be typed in parallel
      const prev = activeTargets.filter((t) => t.lane === 'footer' && t.order < target.order && t.status === 'pending');
      return prev.length === 0;
    }

    return true;
  };

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

    // Spawn agents progressively from live cursor
    agents.forEach((ag) => {
      if (ag.mode === 'unspawned' && now >= ag.spawnTime) {
        ag.mode = 'spawning';
        ag.actionStart = now;
        ag.actionDuration = 200;

        const ptr = config.getUserPointer();
        const spawnX = ptr.active ? ptr.x : window.innerWidth / 2;
        const spawnY = ptr.active ? ptr.y : config.name === 'hero' ? 220 : 180;
        ag.x = spawnX;
        ag.y = spawnY;

        pulseRings.push({
          x: spawnX,
          y: spawnY,
          radius: 0,
          maxRadius: 36,
          alpha: 1,
          color: ag.color,
        });
      }
    });

    // Render pulse rings
    pulseRings.forEach((r, idx) => {
      r.radius += 2.5;
      r.alpha = Math.max(0, 1 - r.radius / r.maxRadius);
      if (r.alpha > 0.01) {
        ctx!.save();
        ctx!.globalAlpha = r.alpha;
        ctx!.strokeStyle = r.color;
        ctx!.lineWidth = 2.5;
        ctx!.beginPath();
        ctx!.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx!.stroke();
        ctx!.restore();
      } else {
        pulseRings.splice(idx, 1);
      }
    });

    // Top Ruler & Red Guide Line
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

    // Queue status checks
    const activeTargets = targetsQueue.filter((t) => config.lanes.includes(t.lane));
    const pendingTargets = activeTargets.filter((t) => t.status === 'pending');

    // Reveal targets scrolled far past
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

    // Check completion
    const remainingPending = activeTargets.filter((t) => t.status === 'pending');
    if (activeTargets.length > 0 && remainingPending.length === 0) {
      const inProgressCount = activeTargets.filter((t) => t.status === 'in-progress').length;
      if (inProgressCount === 0 && status === 'active') {
        // All targets completed naturally!
        status = 'merging';
        mergeTriggerTime = now;
        agents.forEach((ag, idx) => {
          ag.activeTargetId = undefined;
          ag.boxRect = undefined;
          ag.mergeDepartureTime = now + idx * d.mergeInterval;
        });
      }
    }

    // Worker Job Assignment per Lane
    if (status === 'active') {
      config.lanes.forEach((lane) => {
        const laneTargets = remainingPending.filter((t) => t.lane === lane && isLaneTargetReady(t, activeTargets));
        if (laneTargets.length === 0) return;

        const idleWorkers = agents.filter(
          (a) => a.role === 'worker' && a.assignedLane === lane && a.mode === 'idle'
        );
        if (idleWorkers.length === 0) return;

        const activeWorkersCount = agents.filter(
          (a) => a.role === 'worker' && a.assignedLane === lane && (a.mode === 'flying' || a.mode === 'dragging' || a.mode === 'acting')
        ).length;

        let maxAllowed = 2;
        if (lane === 'nav') maxAllowed = isMob ? AGENT_SWARM_CONFIG.maxNavWorkersMobile : AGENT_SWARM_CONFIG.maxNavWorkersDesktop;
        else if (lane === 'hero') maxAllowed = laneTargets[0]?.type === 'hero-name-word' ? 3 : (isMob ? AGENT_SWARM_CONFIG.maxHeroWorkersMobile : AGENT_SWARM_CONFIG.maxHeroWorkersDesktop);
        else if (lane === 'contact') maxAllowed = isMob ? AGENT_SWARM_CONFIG.maxContactWorkersMobile : AGENT_SWARM_CONFIG.maxContactWorkersDesktop;
        else if (lane === 'footer') maxAllowed = isMob ? AGENT_SWARM_CONFIG.maxFooterWorkersMobile : AGENT_SWARM_CONFIG.maxFooterWorkersDesktop;

        if (activeWorkersCount < maxAllowed) {
          const candidate = laneTargets[0];

          // A worker only takes jobs whose target is >= 50% inside viewport. If not visible yet, wait!
          if (!isTargetInView(candidate.element, AGENT_SWARM_CONFIG.thresholds.targetInView)) {
            return;
          }

          const targetRect = candidate.element.getBoundingClientRect();
          const padX = candidate.padding?.x || 0;
          const padY = candidate.padding?.y || 0;

          const localX = targetRect.left - padX;
          const localY = targetRect.top - padY;
          const width = targetRect.width + padX * 2;
          const height = targetRect.height + padY * 2;

          let bestAgent = idleWorkers[0];
          let minDist = Infinity;
          idleWorkers.forEach((ag) => {
            const dist = Math.hypot(ag.x - localX, ag.y - localY);
            if (dist < minDist) {
              minDist = dist;
              bestAgent = ag;
            }
          });

          candidate.status = 'in-progress';
          candidate.assignedAgentId = bestAgent.id;

          bestAgent.activeTargetId = candidate.id;
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
            fullW: Math.max(24, width),
            fullH: Math.max(18, height),
          };
          bestAgent.tagLabel = `${candidate.element.tagName.toLowerCase()} · ${Math.round(width)}×${Math.round(height)}`;
        }
      });
    }

    const inViewTargets = activeTargets.filter((t) => {
      const r = t.element.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    });

    const activeGuides: Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      tag: string;
      opacity: number;
    }> = [];

    // UPDATE AGENTS
    agents.forEach((agent, agentIdx) => {
      if (agent.mode === 'unspawned') return;

      // Merging: Fly directly into visitor's live cursor and vanish
      if (status === 'merging') {
        if (agent.mode !== 'hidden') {
          if (!agent.mergeDepartureTime) {
            agent.mergeDepartureTime = mergeTriggerTime + agentIdx * d.mergeInterval;
          }

          if (now >= agent.mergeDepartureTime) {
            agent.mode = 'merging';

            const ptr = config.getUserPointer();
            const destX = ptr.active ? ptr.x : window.innerWidth / 2;
            const destY = ptr.active ? ptr.y : window.innerHeight / 2;

            agent.x += (destX - agent.x) * lerpCfg.merge;
            agent.y += (destY - agent.y) * lerpCfg.merge;

            const dist = Math.hypot(destX - agent.x, destY - agent.y);
            if (dist < 40) {
              agent.scale = Math.max(0, agent.scale - 0.16);
            }

            if (dist < 10 || agent.scale <= 0.05) {
              agent.mode = 'hidden';
              pulseRings.push({
                x: destX,
                y: destY,
                radius: 0,
                maxRadius: 22,
                alpha: 0.8,
                color: agent.color,
              });
            }
          } else {
            agent.x += (agent.targetX - agent.x) * 0.04;
            agent.y += (agent.targetY - agent.y) * 0.04;
          }
        }

        agent.x = Math.max(AGENT_SWARM_CONFIG.viewportMargin, Math.min(window.innerWidth - AGENT_SWARM_CONFIG.viewportMargin, agent.x));
        agent.y = Math.max(AGENT_SWARM_CONFIG.viewportMargin, Math.min(window.innerHeight - AGENT_SWARM_CONFIG.viewportMargin, agent.y));
        return;
      }

      // Spawning
      if (agent.mode === 'spawning') {
        const progress = Math.min(1, (now - agent.actionStart) / agent.actionDuration);
        agent.scale = Math.min(1, progress * 1.15);
        agent.x += (agent.targetX - agent.x) * 0.08;
        agent.y += (agent.targetY - agent.y) * 0.08;

        if (progress >= 1) {
          agent.scale = 1;
          agent.mode = 'idle';
        }

        agent.x = Math.max(AGENT_SWARM_CONFIG.viewportMargin, Math.min(window.innerWidth - AGENT_SWARM_CONFIG.viewportMargin, agent.x));
        agent.y = Math.max(AGENT_SWARM_CONFIG.viewportMargin, Math.min(window.innerHeight - AGENT_SWARM_CONFIG.viewportMargin, agent.y));
        return;
      }

      // Idle: Ambient wandering near in-view elements
      if (agent.mode === 'idle') {
        if (now > agent.lastWanderPick + agent.wanderInterval) {
          agent.lastWanderPick = now;
          agent.wanderInterval = 2200 + Math.random() * 1400;

          const laneInView = inViewTargets.filter((t) => t.lane === agent.assignedLane);
          const targetsToUse = laneInView.length > 0 ? laneInView : inViewTargets;

          if (targetsToUse.length === 0) {
            const ptr = config.getUserPointer();
            agent.targetX = ptr.active ? ptr.x : window.innerWidth / 2;
            agent.targetY = ptr.active ? ptr.y : window.innerHeight / 2;
          } else {
            const pick = targetsToUse[Math.floor(Math.random() * targetsToUse.length)];
            const r = pick.element.getBoundingClientRect();
            const angle = Math.random() * Math.PI * 2;
            const dist = 50 + Math.random() * 120;
            const candX = r.left + r.width / 2 + Math.cos(angle) * dist;
            const candY = r.top + r.height / 2 + Math.sin(angle) * dist;

            agent.targetX = Math.max(AGENT_SWARM_CONFIG.viewportMargin, Math.min(window.innerWidth - AGENT_SWARM_CONFIG.viewportMargin, candX));
            agent.targetY = Math.max(AGENT_SWARM_CONFIG.viewportMargin, Math.min(window.innerHeight - AGENT_SWARM_CONFIG.viewportMargin, candY));
          }
        }
        agent.x += (agent.targetX - agent.x) * lerpCfg.helper;
        agent.y += (agent.targetY - agent.y) * lerpCfg.helper;

        agent.x = Math.max(AGENT_SWARM_CONFIG.viewportMargin, Math.min(window.innerWidth - AGENT_SWARM_CONFIG.viewportMargin, agent.x));
        agent.y = Math.max(AGENT_SWARM_CONFIG.viewportMargin, Math.min(window.innerHeight - AGENT_SWARM_CONFIG.viewportMargin, agent.y));
        return;
      }

      // Check if target scrolled out of view mid-job
      const activeTarget = targetsQueue.find((t) => t.id === agent.activeTargetId);
      if (activeTarget) {
        const r = activeTarget.element.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) {
          revealTarget(activeTarget);
          agent.activeTargetId = undefined;
          agent.boxRect = undefined;
          agent.mode = 'idle';
          return;
        }
      }

      if (agent.mode === 'flying') {
        if (activeTarget) {
          const rect = activeTarget.element.getBoundingClientRect();
          const padX = activeTarget.padding?.x || 0;
          const padY = activeTarget.padding?.y || 0;
          agent.targetX = rect.left - padX;
          agent.targetY = rect.top - padY;
        }

        agent.x += (agent.targetX - agent.x) * (lerpCfg.working / K);
        agent.y += (agent.targetY - agent.y) * (lerpCfg.working / K);

        if (now - agent.actionStart >= agent.actionDuration || Math.hypot(agent.targetX - agent.x, agent.targetY - agent.y) < 6) {
          agent.mode = 'dragging';
          agent.actionStart = now;
          agent.actionDuration = d.dragBox * K;

          if (activeTarget) {
            const rect = activeTarget.element.getBoundingClientRect();
            const padX = activeTarget.padding?.x || 0;
            const padY = activeTarget.padding?.y || 0;
            agent.boxRect = {
              x: rect.left - padX,
              y: rect.top - padY,
              w: 0,
              h: 0,
              fullW: Math.max(24, rect.width + padX * 2),
              fullH: Math.max(18, rect.height + padY * 2),
            };
          }
        }
      } else if (agent.mode === 'dragging') {
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
          agent.mode = 'acting';
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
      } else if (agent.mode === 'acting') {
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

        // Action per type
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
          agent.targetX = Math.max(8, Math.min(window.innerWidth - 8, agent.x + Math.cos(angle) * dist));
          agent.targetY = Math.max(8, Math.min(window.innerHeight - 8, agent.y + Math.sin(angle) * dist));
        }
      }

      agent.x = Math.max(AGENT_SWARM_CONFIG.viewportMargin, Math.min(window.innerWidth - AGENT_SWARM_CONFIG.viewportMargin, agent.x));
      agent.y = Math.max(AGENT_SWARM_CONFIG.viewportMargin, Math.min(window.innerHeight - AGENT_SWARM_CONFIG.viewportMargin, agent.y));
    });

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
    let totalPlusMarks = 0;

    agents.forEach((agent) => {
      if (agent.mode === 'unspawned' || agent.mode === 'hidden') return;

      if (agent.role === 'ambient' && totalPlusMarks < 40) {
        agent.trail.push({ x: agent.x, y: agent.y, alpha: 0.75 });
        if (agent.trail.length > 4) agent.trail.shift();

        ctx!.font = '10px sans-serif';
        ctx!.fillStyle = agent.color;
        agent.trail.forEach((pt) => {
          pt.alpha *= 0.88;
          if (pt.alpha > 0.08) {
            totalPlusMarks++;
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

      if (agent.cursorType === 'crosshair') {
        ctx!.strokeStyle = agent.color;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.moveTo(-6, 0);
        ctx!.lineTo(6, 0);
        ctx!.moveTo(0, -6);
        ctx!.lineTo(0, 6);
        ctx!.stroke();
      } else if (agent.cursorType === 'ibeam') {
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

      const ptr = config.getUserPointer();
      const distFromSpawn = Math.hypot(
        agent.x - (ptr.active ? ptr.x : window.innerWidth / 2),
        agent.y - (ptr.active ? ptr.y : 200)
      );
      if (agent.mode !== 'merging' && agent.scale > 0.5 && distFromSpawn > 40) {
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

    // Check Merge Completion
    if (status === 'merging' && agents.every((a) => a.mode === 'hidden')) {
      ctx.restore();
      status = 'done';
      cleanupDOM();

      if (config.name === 'hero') {
        revealHeroScopeTargets();
      } else {
        revealContactScopeTargets();
        document.documentElement.classList.remove('agent-swarm-active');
      }

      console.log(`swarm run finished: ${config.name}`);
      config.onFinished?.('completed');
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

        const ptr = config.getUserPointer();
        const spawnX = ptr.active ? ptr.x : window.innerWidth / 2;
        const spawnY = ptr.active ? ptr.y : config.name === 'hero' ? 220 : 180;

        const maxNavW = isMob ? AGENT_SWARM_CONFIG.maxNavWorkersMobile : AGENT_SWARM_CONFIG.maxNavWorkersDesktop;
        const maxHeroW = isMob ? AGENT_SWARM_CONFIG.maxHeroWorkersMobile : AGENT_SWARM_CONFIG.maxHeroWorkersDesktop;
        const maxContactW = isMob ? AGENT_SWARM_CONFIG.maxContactWorkersMobile : AGENT_SWARM_CONFIG.maxContactWorkersDesktop;
        const maxFooterW = isMob ? AGENT_SWARM_CONFIG.maxFooterWorkersMobile : AGENT_SWARM_CONFIG.maxFooterWorkersDesktop;

        agents = [];
        for (let idx = 0; idx < totalAgents; idx++) {
          const name = `agent-${idx + 1}`;
          const color = AGENT_SWARM_CONFIG.paletteColors[idx % AGENT_SWARM_CONFIG.paletteColors.length];

          let role: 'worker' | 'ambient' = 'ambient';
          let lane: WorkLane = config.lanes[0];

          if (config.name === 'hero') {
            if (idx < maxNavW) {
              role = 'worker';
              lane = 'nav';
            } else if (idx < maxNavW + maxHeroW) {
              role = 'worker';
              lane = 'hero';
            } else {
              role = 'ambient';
              lane = idx % 2 === 0 ? 'nav' : 'hero';
            }
          } else {
            // Contact + Footer parallel lanes
            if (idx < maxContactW) {
              role = 'worker';
              lane = 'contact';
            } else if (idx < maxContactW + maxFooterW) {
              role = 'worker';
              lane = 'footer';
            } else {
              role = 'ambient';
              lane = idx % 2 === 0 ? 'contact' : 'footer';
            }
          }

          const angle = (idx / totalAgents) * Math.PI * 2;
          const initialDepX = Math.max(8, Math.min(window.innerWidth - 8, spawnX + Math.cos(angle) * (110 + (idx % 4) * 30)));
          const initialDepY = Math.max(8, Math.min(window.innerHeight - 8, spawnY + Math.sin(angle) * (110 + (idx % 4) * 30)));

          agents.push({
            id: name,
            name,
            color,
            assignedLane: lane,
            role,
            x: spawnX,
            y: spawnY,
            targetX: initialDepX,
            targetY: initialDepY,
            scale: 0,
            spawnTime: startTime + idx * d.spawnInterval,
            mode: 'unspawned',
            cursorType: role === 'ambient' ? 'crosshair' : 'arrow',
            actionStart: 0,
            actionDuration: 200,
            lastWanderPick: startTime,
            wanderInterval: 2200 + Math.random() * 1400,
            trail: [],
          });
        }

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
      status = 'merging';
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

      // Send all agents directly to cursor
      const now = performance.now();
      mergeTriggerTime = now;
      agents.forEach((ag, idx) => {
        ag.activeTargetId = undefined;
        ag.boxRect = undefined;
        ag.mergeDepartureTime = now + idx * d.mergeInterval;
      });

      config.onFinished?.('cancelled');
    },

    isActive: () => status === 'active' || status === 'merging',
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
      // Page loaded directly at #contact or bottom
      revealHeroScopeTargets();
      heroDoneRef.current = true;
      triggerContactRun();
    } else if (isHeroScopeOnScreen()) {
      // Wait pointerWaitMax for pointer then start hero run
      const spawnTimer = setTimeout(() => {
        if (isContactScopeOnScreen()) {
          revealHeroScopeTargets();
          heroDoneRef.current = true;
          triggerContactRun();
        } else {
          triggerHeroRun();
        }
      }, AGENT_SWARM_CONFIG.durations.pointerWaitMax);

      // Save spawnTimer for cleanup
      (heroRunRef.current as any)._spawnTimer = spawnTimer;
    } else {
      // Page loaded somewhere in the middle
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

      heroRunRef.current?.destroy();
      contactRunRef.current?.destroy();
      revealAllPageTargets();
    };
  }, []);

  return null;
};
