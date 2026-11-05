import React, { useEffect, useRef, useState } from 'react';
import { GlossyShape3D } from './GlossyShape3D';

export const MobileStorytelling: React.FC = () => {
  // --------------------------------------------------------------------------
  // 1. INTRO PRELOADER (2.1)
  // --------------------------------------------------------------------------
  const [introVisible, setIntroVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return false;
    return true;
  });
  const [introSlidingOut, setIntroSlidingOut] = useState(false);
  const [introCounter, setIntroCounter] = useState(0);

  // --------------------------------------------------------------------------
  // 2. HERO 3D TILT BLOB STATE (2.2)
  // --------------------------------------------------------------------------
  const [blobTilt, setBlobTilt] = useState({ x: 0, y: 0 });
  const [hasGyro, setHasGyro] = useState(false);
  const [gyroState, setGyroState] = useState<'unsupported' | 'requestable' | 'active'>('unsupported');
  const blobTouchStartRef = useRef<{ x: number; y: number } | null>(null);

  // --------------------------------------------------------------------------
  // 3. GLOBAL SCROLL PROGRESS & MARQUEE VELOCITY (2.3)
  // --------------------------------------------------------------------------
  const [scrollProgress, setScrollProgress] = useState(0);

  // --------------------------------------------------------------------------
  // 5. SERVICES ACCORDION (2.5)
  // --------------------------------------------------------------------------
  const [openServiceIndex, setOpenServiceIndex] = useState<number | null>(null);

  // Skip / complete preloader immediately
  const skipIntro = () => {
    if (!introVisible || introSlidingOut) return;
    setIntroSlidingOut(true);
    setTimeout(() => {
      setIntroVisible(false);
      triggerHeroReveal();
    }, 450);
  };

  // Animate preloader counter 0 -> 100 in ~1.4s
  useEffect(() => {
    if (!introVisible) return;

    let start = performance.now();
    const duration = 1350;
    let animId: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / duration);
      setIntroCounter(Math.floor(p * 100));

      if (p < 1) {
        animId = requestAnimationFrame(tick);
      } else {
        skipIntro();
      }
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [introVisible]);

  // --------------------------------------------------------------------------
  // HERO REVEAL SEQUENCE (2.1 & Bug 2 Fix)
  // --------------------------------------------------------------------------
  const triggerHeroReveal = () => {
    // Reveal Heading Words with 80ms stagger
    const words = document.querySelectorAll('#hero-heading .hero-word-inner');
    words.forEach((w, idx) => {
      const el = w as HTMLElement;
      setTimeout(() => {
        el.classList.add('hero-word-animate');
      }, idx * 80);
    });

    // Reveal Subtitle & Location
    const sub = document.querySelector('[data-swarm-target="hero-subtitle"]') as HTMLElement;
    const loc = document.querySelector('[data-swarm-target="hero-location"]') as HTMLElement;
    const btn = document.querySelector('[data-swarm-target="hero-button"]') as HTMLElement;

    if (sub) {
      setTimeout(() => {
        sub.style.opacity = '1';
        sub.style.transform = 'translate3d(0, 0, 0)';
        sub.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      }, 260);
    }
    if (loc) {
      setTimeout(() => {
        loc.style.opacity = '1';
        loc.style.transform = 'translate3d(0, 0, 0)';
        loc.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      }, 340);
    }
    if (btn) {
      setTimeout(() => {
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1)';
        btn.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }, 420);
    }
  };

  // --------------------------------------------------------------------------
  // GYRO TILT (2.2)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      setGyroState('requestable');
    } else if ('ondeviceorientation' in window) {
      setGyroState('active');
      attachOrientation();
    }

    function attachOrientation() {
      const handleOrientation = (e: DeviceOrientationEvent) => {
        if (e.gamma == null || e.beta == null) return;
        // Clamp gamma (left/right tilt) to [-25, 25], beta (front/back) to [-25, 25]
        const tiltY = Math.max(-25, Math.min(25, e.gamma));
        const tiltX = Math.max(-25, Math.min(25, (e.beta - 45) * 0.8));
        setBlobTilt({ x: -tiltX, y: tiltY });
        setHasGyro(true);
      };

      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, []);

  const requestGyroPermission = async () => {
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const res = await (DeviceOrientationEvent as any).requestPermission();
        if (res === 'granted') {
          setGyroState('active');
          setHasGyro(true);
          const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.gamma == null || e.beta == null) return;
            const tiltY = Math.max(-25, Math.min(25, e.gamma));
            const tiltX = Math.max(-25, Math.min(25, (e.beta - 45) * 0.8));
            setBlobTilt({ x: -tiltX, y: tiltY });
          };
          window.addEventListener('deviceorientation', handleOrientation, { passive: true });
        } else {
          setGyroState('unsupported');
        }
      } catch (err) {
        setGyroState('unsupported');
      }
    }
  };

  // Touch drag fallback for 3D Blob when gyro is not active
  const handleBlobTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    blobTouchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleBlobTouchMove = (e: React.TouchEvent) => {
    if (!blobTouchStartRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - blobTouchStartRef.current.x;
    const dy = t.clientY - blobTouchStartRef.current.y;
    const tiltY = Math.max(-25, Math.min(25, dx * 0.35));
    const tiltX = Math.max(-25, Math.min(25, -dy * 0.35));
    setBlobTilt({ x: tiltX, y: tiltY });
  };

  const handleBlobTouchEnd = () => {
    blobTouchStartRef.current = null;
    // Ease back to neutral
    setBlobTilt({ x: 0, y: 0 });
  };

  // --------------------------------------------------------------------------
  // UNIFIED 60FPS SCROLL ENGINE (Passive + Single rAF)
  // --------------------------------------------------------------------------
  useEffect(() => {
    let ticking = false;
    let rafId: number;
    let lastScrollY = window.scrollY || window.pageYOffset || 0;
    let lastTime = performance.now();
    let marqueeVelocity = 1;

    // Grab DOM element references
    const heroHeading = document.getElementById('hero-heading');
    const heroBlob = document.getElementById('mobile-hero-blob');
    const aboutSection = document.getElementById('about');
    const aboutLines = Array.from(document.querySelectorAll('#about p.about-bio-line')) as HTMLElement[];
    const contactSection = document.getElementById('contact');
    const footerWordmark = document.querySelector('[data-swarm-target="footer-wordmark"]');
    const footerShapesContainer = document.querySelector('[data-swarm-target="footer-shapes"]');
    const projectCards = Array.from(document.querySelectorAll('#projects article')) as HTMLElement[];
    const servicesRows = Array.from(document.querySelectorAll('#services .divide-y > div')) as HTMLElement[];
    const educationCards = Array.from(document.querySelectorAll('#education .border-white\\/10, [aria-labelledby="education-heading"] article')) as HTMLElement[];

    // 2.4 Setup About Word-by-Word Scrubbing (BUG 1 FIX: target only paragraph lines, keep <h2> untouched)
    let aboutWords: HTMLElement[] = [];
    aboutLines.forEach((p) => {
      if (p.getAttribute('data-scrub-initialized')) {
        aboutWords.push(...(Array.from(p.querySelectorAll('.about-scrub-word')) as HTMLElement[]));
        return;
      }
      p.setAttribute('data-scrub-initialized', 'true');
      const text = p.innerText || p.textContent || '';
      p.setAttribute('aria-label', text);
      const words = text.split(/\s+/).filter(Boolean);
      p.innerHTML = '';
      words.forEach((w, idx) => {
        const span = document.createElement('span');
        span.className = 'about-scrub-word';
        span.textContent = w;
        span.style.opacity = '0.25';
        span.style.display = 'inline';
        span.style.transition = 'opacity 0.15s ease, color 0.15s ease';
        span.setAttribute('aria-hidden', 'true');
        p.appendChild(span);
        aboutWords.push(span);
        if (idx < words.length - 1) {
          p.appendChild(document.createTextNode(' '));
        }
      });
    });

    // 2.5 Setup Services Line Drawing
    servicesRows.forEach((row) => {
      if (!row.querySelector('.services-line-draw')) {
        const line = document.createElement('div');
        line.className = 'services-line-draw w-full h-[1.5px] bg-[#05060a]/25 mt-4';
        row.appendChild(line);
      }
    });

    // 2.7 Counters setup (CGPA, Numbers)
    let countersAnimated = false;

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(updateScroll);
      }
    };

    const updateScroll = () => {
      const now = performance.now();
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      const vh = window.innerHeight || 800;
      const docHeight = Math.max(1, document.documentElement.scrollHeight - vh);

      // 2.3 Global Scroll Progress
      const progress = Math.max(0, Math.min(1, currentScrollY / docHeight));
      setScrollProgress(progress);

      // 2.3 Marquee Velocity & Direction
      const dt = Math.max(16, now - lastTime);
      const dy = currentScrollY - lastScrollY;
      const speed = dy / dt; // px/ms

      if (Math.abs(speed) > 0.05) {
        // Scrolling up -> reverse marquee direction
        const direction = dy < 0 ? -1 : 1;
        const boost = Math.min(2.5, 1 + Math.abs(speed) * 1.5);
        marqueeVelocity = direction * boost;
      } else {
        // Ease back to 1.0
        marqueeVelocity += (1 - marqueeVelocity) * 0.08;
      }

      const marqueeEl = document.querySelector('.animate-marquee-css') as HTMLElement;
      if (marqueeEl) {
        marqueeEl.style.animationPlayState = document.hidden ? 'paused' : 'running';
        if (marqueeVelocity < 0) {
          marqueeEl.style.animationDirection = 'reverse';
        } else {
          marqueeEl.style.animationDirection = 'normal';
        }
      }

      lastScrollY = currentScrollY;
      lastTime = now;

      // 2.2 Hero Scroll Parallax
      if (currentScrollY <= vh * 1.2) {
        const heroP = currentScrollY / vh;
        if (heroHeading) {
          const scale = Math.max(0.92, 1 - heroP * 0.08);
          const y = heroP * 40;
          const op = Math.max(0.4, 1 - heroP * 0.6);
          heroHeading.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
          heroHeading.style.opacity = op.toFixed(2);
        }
        if (heroBlob) {
          const blobY = -heroP * 55;
          heroBlob.style.transform = `translate3d(0, ${blobY.toFixed(1)}px, 0)`;
        }
      }

      // 2.4 About Word-by-Word Scrubbing
      if (aboutSection && aboutWords.length > 0) {
        const aRect = aboutSection.getBoundingClientRect();
        // Progress as section crosses middle of viewport
        const aProgress = Math.max(0, Math.min(1, (vh * 0.7 - aRect.top) / (vh * 0.45)));
        const activeCount = Math.floor(aProgress * aboutWords.length);

        aboutWords.forEach((word, idx) => {
          if (idx <= activeCount) {
            word.style.opacity = '1';
            word.style.color = '#eef0f5';
          } else {
            word.style.opacity = '0.25';
            word.style.color = 'rgba(238, 240, 245, 0.4)';
          }
        });
      }

      // 2.5 Services Row Line Draw & Number Count
      servicesRows.forEach((row, idx) => {
        const rRect = row.getBoundingClientRect();
        if (rRect.top <= vh * 0.65) {
          const line = row.querySelector('.services-line-draw') as HTMLElement;
          if (line) line.classList.add('drawn');

          const numEl = row.querySelector('.font-display.text-5xl, .font-display.text-7xl') as HTMLElement;
          if (numEl && !numEl.getAttribute('data-counted')) {
            numEl.setAttribute('data-counted', 'true');
            const target = idx + 1;
            let step = 0;
            const timer = setInterval(() => {
              step++;
              numEl.textContent = step.toString().padStart(2, '0');
              if (step >= target) clearInterval(timer);
            }, 60);
          }
        }
      });

      // 2.6 Projects Sticky Stacking & Darken Effect (BUG 3 FIX)
      projectCards.forEach((card, idx) => {
        const isSticky = window.getComputedStyle(card).position === 'sticky';
        const cardRect = card.getBoundingClientRect();

        if (isSticky) {
          const nextCard = projectCards[idx + 1];
          if (nextCard) {
            const nextRect = nextCard.getBoundingClientRect();
            // Stacking scale & dim ONLY while next card covers it, purely driven by scroll position
            if (nextRect.top < vh * 0.72) {
              const overlap = Math.max(0, Math.min(1, (vh * 0.72 - nextRect.top) / (vh * 0.38)));
              const scale = 1 - overlap * 0.05; // Scale down to 0.95
              const brightness = 1 - overlap * 0.30; // Dim to 0.70
              card.style.transform = `scale(${scale.toFixed(3)})`;
              card.style.filter = `brightness(${brightness.toFixed(2)})`;
            } else {
              card.style.transform = 'scale(1)';
              card.style.filter = 'brightness(1)';
            }
          }
        } else {
          // Flow card: scroll-driven entrance (translateY 32px to 0, opacity 0.6 to 1)
          // and gentle scale 0.97, opacity 0.7 after passing top
          if (cardRect.top > vh * 0.85) {
            const enterP = Math.max(0, Math.min(1, (vh - cardRect.top) / (vh * 0.15)));
            const transY = (1 - enterP) * 32;
            const op = 0.6 + enterP * 0.4;
            card.style.transform = `translate3d(0, ${transY.toFixed(1)}px, 0)`;
            card.style.opacity = op.toFixed(2);
            card.style.filter = 'brightness(1)';
          } else if (cardRect.top < 0) {
            const pastP = Math.max(0, Math.min(1, -cardRect.top / (vh * 0.6)));
            const scale = 1 - pastP * 0.03;
            const op = 1 - pastP * 0.3;
            card.style.transform = `scale(${scale.toFixed(3)})`;
            card.style.opacity = op.toFixed(2);
            card.style.filter = 'brightness(1)';
          } else {
            card.style.transform = 'scale(1)';
            card.style.opacity = '1';
            card.style.filter = 'brightness(1)';
          }
        }
      });

      // 2.7 Skills Progress Bars Fill (when 70% in view)
      educationCards.forEach((card) => {
        const cRect = card.getBoundingClientRect();
        if (cRect.top <= vh * 0.7) {
          const bars = Array.from(card.querySelectorAll('[data-skill-progress], .bg-white\\/10 > div')) as HTMLElement[];
          bars.forEach((b) => {
            b.style.transition = 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
          });
        }
      });

      // CGPA Count-up once
      if (!countersAnimated) {
        const cgpaEl = document.querySelector('[data-swarm-target="hero-location"], [data-cgpa]') as HTMLElement;
        if (cgpaEl) {
          const cgpaRect = cgpaEl.getBoundingClientRect();
          if (cgpaRect.top <= vh * 0.85) {
            countersAnimated = true;
          }
        }
      }

      // 2.8 Contact Bottom-Sheet Reveal
      if (contactSection) {
        const cRect = contactSection.getBoundingClientRect();
        if (cRect.top < vh) {
          const rawSheet = Math.max(0, Math.min(1, (vh - cRect.top) / (vh * 0.75)));
          const eased = 1 - Math.pow(1 - rawSheet, 3);
          const sheetY = (1 - eased) * 12; // Starts 12% lower
          const sheetScale = 0.96 + eased * 0.04; // 0.96 -> 1.0
          contactSection.style.transform = `translate3d(0, ${sheetY.toFixed(1)}%, 0) scale(${sheetScale.toFixed(3)})`;
          contactSection.style.transformOrigin = 'center top';
        }
      }

      // 2.9 Footer Wordmark Slide (NILESH moves left, THOKALE moves right)
      if (footerWordmark) {
        const fRect = footerWordmark.getBoundingClientRect();
        if (fRect.top <= vh) {
          const fProgress = Math.max(0, Math.min(1, (vh - fRect.top) / vh));
          const words = footerWordmark.querySelectorAll('.agent-word');
          const shiftPx = fProgress * (window.innerWidth * 0.05); // ~5% each way = 10% total

          if (words[0]) {
            (words[0] as HTMLElement).style.transform = `translate3d(${-shiftPx.toFixed(1)}px, 0, 0)`;
            (words[0] as HTMLElement).style.display = 'inline-block';
          }
          if (words[1]) {
            (words[1] as HTMLElement).style.transform = `translate3d(${shiftPx.toFixed(1)}px, 0, 0)`;
            (words[1] as HTMLElement).style.display = 'inline-block';
          }
        }
      }

      // 2.9 Footer Shapes Bounce Drop (when footer is 40% in view)
      if (footerShapesContainer) {
        const fsRect = footerShapesContainer.getBoundingClientRect();
        if (fsRect.top <= vh * 0.6) {
          const shapes = Array.from(footerShapesContainer.querySelectorAll('path, circle, rect, polygon')) as SVGElement[];
          shapes.forEach((sh, idx) => {
            if (!sh.classList.contains('footer-shape-drop')) {
              setTimeout(() => {
                sh.classList.add('footer-shape-drop');
              }, idx * 45); // 45-60ms stagger
            }
          });
        }
      }

      ticking = false;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateScroll();

    // ------------------------------------------------------------------------
    // 2.3 Global Tap Feedback (delegated listener)
    // ------------------------------------------------------------------------
    const handleTapFeedback = (e: TouchEvent) => {
      const target = (e.target as HTMLElement)?.closest('button, a, [role="button"], .magnetic-btn, [data-swarm-target="contact-chip"]');
      if (target) {
        target.classList.add('tap-active-scale');
        setTimeout(() => target.classList.remove('tap-active-scale'), 140);
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(8);
          } catch (err) {}
        }
      }
    };
    window.addEventListener('touchstart', handleTapFeedback, { passive: true });

    // ------------------------------------------------------------------------
    // 2.9 Footer Shape Tap Spin
    // ------------------------------------------------------------------------
    const handleShapeTap = (e: MouseEvent | TouchEvent) => {
      const shape = (e.target as SVGElement)?.closest('svg [data-swarm-shape], #footer svg *');
      if (shape) {
        shape.classList.add('footer-shape-tap-spin');
        setTimeout(() => shape.classList.remove('footer-shape-tap-spin'), 650);
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(12);
          } catch (err) {}
        }
      }
    };
    footerShapesContainer?.addEventListener('click', handleShapeTap as any);

    // ------------------------------------------------------------------------
    // 2.8 Virtual Keyboard & Input Protection
    // ------------------------------------------------------------------------
    const handleInputFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setTimeout(() => {
          target.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 250);
      }
    };
    window.addEventListener('focusin', handleInputFocus);

    // iOS visualViewport handler
    const onViewportResize = () => {
      if (window.visualViewport) {
        const offset = window.innerHeight - window.visualViewport.height;
        if (offset > 120 && contactSection) {
          // Keyboard is open
          document.body.style.paddingBottom = `${offset}px`;
        } else {
          document.body.style.paddingBottom = '0px';
        }
      }
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onViewportResize);
    }

    // ------------------------------------------------------------------------
    // CLEANUP ON UNMOUNT / RESIZE TO DESKTOP
    // ------------------------------------------------------------------------
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('touchstart', handleTapFeedback);
      window.removeEventListener('focusin', handleInputFocus);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onViewportResize);
      }
      footerShapesContainer?.removeEventListener('click', handleShapeTap as any);
      document.body.style.paddingBottom = '';

      // Reset inline styles
      if (heroHeading) heroHeading.style.transform = '';
      if (heroHeading) heroHeading.style.opacity = '';
      if (contactSection) contactSection.style.transform = '';
      aboutWords.forEach((w) => {
        w.style.opacity = '';
        w.style.color = '';
      });
      projectCards.forEach((c) => {
        c.style.transform = '';
        c.style.filter = '';
        c.style.opacity = '';
      });
    };
  }, []);

  // --------------------------------------------------------------------------
  // 2.5 Services Row Toggle Accordion
  // --------------------------------------------------------------------------
  useEffect(() => {
    const rows = Array.from(document.querySelectorAll('#services .divide-y > div')) as HTMLElement[];
    const handlers: (() => void)[] = [];

    rows.forEach((row, idx) => {
      const desc = row.querySelector('p.mt-2\\.5, .flex-1 p') as HTMLElement;
      const num = row.querySelector('.font-display.text-5xl, .font-display.text-7xl') as HTMLElement;

      if (desc && !desc.parentElement?.classList.contains('services-accordion-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'services-accordion-wrapper';
        const inner = document.createElement('div');
        inner.className = 'services-accordion-content';

        desc.parentNode?.insertBefore(wrapper, desc);
        inner.appendChild(desc);
        wrapper.appendChild(inner);
      }

      const onClick = () => {
        setOpenServiceIndex((prev) => (prev === idx ? null : idx));
      };

      row.addEventListener('click', onClick);
      handlers.push(() => row.removeEventListener('click', onClick));
    });

    return () => {
      handlers.forEach((h) => h());
    };
  }, []);

  // Sync Accordion state to DOM
  useEffect(() => {
    const rows = Array.from(document.querySelectorAll('#services .divide-y > div')) as HTMLElement[];
    rows.forEach((row, idx) => {
      const wrapper = row.querySelector('.services-accordion-wrapper');
      const num = row.querySelector('.font-display.text-5xl, .font-display.text-7xl') as HTMLElement;

      if (openServiceIndex === idx) {
        wrapper?.classList.add('is-open');
        if (num) {
          num.classList.add('hero-title-gradient');
          num.style.backgroundClip = 'text';
          (num.style as any).webkitBackgroundClip = 'text';
          num.style.color = 'transparent';
        }
      } else {
        wrapper?.classList.remove('is-open');
        if (num) {
          num.classList.remove('hero-title-gradient');
          num.style.backgroundClip = '';
          (num.style as any).webkitBackgroundClip = '';
          num.style.color = '';
        }
      }
    });
  }, [openServiceIndex]);

  // --------------------------------------------------------------------------
  // 2.8 Contact Form Submit Confetti Celebration
  // --------------------------------------------------------------------------
  useEffect(() => {
    const form = document.querySelector('#contact form') as HTMLFormElement;
    if (!form) return;

    const onSubmit = (e: SubmitEvent) => {
      // Check if validation passes before triggering celebration
      const btn = form.querySelector('button[type="submit"]') as HTMLElement;
      if (!btn) return;

      setTimeout(() => {
        // Trigger haptic
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate([25, 45, 25]);
          } catch (err) {}
        }

        // Create 8 floating confetti shapes popping out from the send button
        const container = document.createElement('div');
        container.className = 'submit-burst-container';
        btn.style.position = 'relative';
        btn.appendChild(container);

        const colors = ['#7b5cff', '#ff4fa3', '#ff9a3c', '#4ade80', '#38bdf8', '#c084fc', '#facc15', '#f43f5e'];
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const dist = 48 + Math.random() * 32;
          const dx = Math.cos(angle) * dist;
          const dy = Math.sin(angle) * dist - 20; // Slight upward pop

          const particle = document.createElement('div');
          particle.className = 'submit-particle';
          particle.style.width = '12px';
          particle.style.height = '12px';
          particle.style.backgroundColor = colors[i % colors.length];
          particle.style.setProperty('--p-dx', `${dx}px`);
          particle.style.setProperty('--p-dy', `${dy}px`);
          particle.style.setProperty('--p-rot', `${(Math.random() - 0.5) * 360}deg`);
          container.appendChild(particle);
        }

        // Clean up after 1.2s
        setTimeout(() => {
          container.remove();
        }, 1250);
      }, 50);
    };

    form.addEventListener('submit', onSubmit as any);
    return () => form.removeEventListener('submit', onSubmit as any);
  }, []);

  return (
    <>
      {/* 2.3 Global Scroll Progress Bar */}
      <div
        className="fixed left-0 right-0 z-[100] h-[3px] pointer-events-none origin-left"
        style={{
          top: 'env(safe-area-inset-top, 0px)',
          background: 'linear-gradient(90deg, #7b5cff 0%, #ff4fa3 50%, #ff9a3c 100%)',
          transform: `scaleX(${scrollProgress})`,
        }}
        aria-hidden="true"
      />

      {/* 2.1 Short Intro Preloader (skippable by tap) */}
      {introVisible && (
        <div
          className={`fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
            introSlidingOut ? '-translate-y-full' : 'translate-y-0'
          }`}
          onClick={skipIntro}
          onTouchStart={skipIntro}
          role="dialog"
          aria-label="Loading portfolio"
        >
          <div className="flex flex-col items-center text-center px-6">
            <span className="font-display uppercase text-5xl sm:text-6xl tracking-tight hero-title-gradient">
              NILESH
            </span>
            <div className="w-52 h-[2px] bg-white/10 rounded-full mt-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7b5cff] via-[#ff4fa3] to-[#ff9a3c] transition-all duration-75"
                style={{ width: `${introCounter}%` }}
              />
            </div>
            <div className="mt-3 font-mono-num text-xs tracking-widest text-[#eef0f5]/60 flex items-center gap-3">
              <span>{introCounter.toString().padStart(3, '0')}%</span>
              <span>·</span>
              <span className="text-[10px] uppercase text-[#eef0f5]/40">TAP TO SKIP</span>
            </div>
          </div>
        </div>
      )}

      {/* 2.2 Hero 3D Tilt Blob (rendered in Hero on mobile) */}
      <div
        id="mobile-hero-blob-portal"
        className="fixed pointer-events-none z-10"
        style={{ display: 'none' }}
      >
        <div
          id="mobile-hero-blob-hidden-portal"
          className="relative mx-auto w-28 h-28 rounded-full pointer-events-auto cursor-grab active:cursor-grabbing select-none touch-none will-change-transform"
          style={{
            transform: `rotateX(${blobTilt.x}deg) rotateY(${blobTilt.y}deg)`,
            transition: hasGyro ? 'transform 0.08s ease-out' : 'transform 0.25s ease-out',
          }}
          onTouchStart={handleBlobTouchStart}
          onTouchMove={handleBlobTouchMove}
          onTouchEnd={handleBlobTouchEnd}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#7b5cff] via-[#ff4fa3] to-[#ff9a3c] p-[2px] shadow-[0_0_40px_rgba(255,79,163,0.35)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#120a26] via-[#24082e] to-[#0a0714] relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_60%)]" />
              <GlossyShape3D variant="silver-splash" className="w-16 h-16 opacity-90 pointer-events-none" />
            </div>
          </div>
          {gyroState === 'requestable' && (
            <button
              onClick={requestGyroPermission}
              className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-white/20 text-[#eef0f5]/80 whitespace-nowrap touch-manipulation backdrop-blur-sm pointer-events-auto"
            >
              Tilt ✦
            </button>
          )}
        </div>
      </div>
    </>
  );
};

