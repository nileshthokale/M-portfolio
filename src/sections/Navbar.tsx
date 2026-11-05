import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolio';
import { cancelAgentSwarm } from '../components/AgentSwarm';

interface NavbarProps {
  onNavigateHome?: () => void;
}

const renderCharSpans = (text: string) => {
  return text.split('').map((char, index) => (
    <span
      key={index}
      className={`agent-char ${char === ' ' ? 'agent-space' : ''}`}
    >
      {char}
    </span>
  ));
};

export const Navbar: React.FC<NavbarProps> = ({ onNavigateHome }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const scrollYRef = useRef<number>(0);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      // Ensure body scroll is cleanly unlocked if component unmounts while menu is open
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, []);

  const openMenu = () => {
    // 1. Immediately cancel any active AgentSwarm runs
    cancelAgentSwarm();

    // 2. Reliable iOS Safari scroll lock (saving window.scrollY, fixing body top to -scrollY)
    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    scrollYRef.current = currentScrollY;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${currentScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    setMobileMenuOpen(true);
  };

  const closeMenu = (restoreScroll = true) => {
    setMobileMenuOpen(false);

    // Restore body styles
    const savedY = scrollYRef.current;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';

    if (restoreScroll) {
      window.scrollTo(0, savedY);
    }
  };

  const toggleMenu = () => {
    if (mobileMenuOpen) {
      closeMenu(true);
      menuTriggerRef.current?.focus();
    } else {
      openMenu();
    }
  };

  // Keyboard accessibility: Escape key to close, and screen resize listener (close if >= 768px)
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu(true);
        menuTriggerRef.current?.focus();
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        closeMenu(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);

  // Accessible focus management & focus trap inside mobile dialog
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleTabTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusableEls = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusableEls.length === 0) return;

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    window.addEventListener('keydown', handleTabTrap);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleTabTrap);
    };
  }, [mobileMenuOpen]);

  // Smooth scroll handler with header offset calculation
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    // Close menu and restore body scroll coordinate first
    closeMenu(true);

    if (onNavigateHome) {
      onNavigateHome();
    }

    requestAnimationFrame(() => {
      if (href === '#top' || href === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '#top');
        return;
      }

      const targetEl = document.querySelector(href);
      if (targetEl) {
        const header = document.getElementById('navbar-header');
        const headerHeight = header ? header.offsetHeight : 72;
        const targetRect = targetEl.getBoundingClientRect();
        const absoluteTop = targetRect.top + window.scrollY;
        const offsetPosition = Math.max(0, absoluteTop - headerHeight - 16);

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
        window.history.pushState(null, '', href);
      } else {
        window.location.hash = href;
      }
    });
  };

  const handleHeaderLinkClick = (href: string) => {
    if (onNavigateHome) onNavigateHome();
    if (href === '#top' || href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      id="navbar-header"
      data-swarm-target="nav-header"
      className="sticky top-0 z-40 w-full bg-[#000000]/90 backdrop-blur-md border-b border-white/5 transition-opacity duration-300"
    >
      <div className="max-w-[1380px] mx-auto flex items-center justify-between gap-6 px-4 sm:px-12 py-3.5 sm:py-4">
        {/* Zone 1: Brand Wordmark with 44px+ touch target */}
        <a
          href="#top"
          onClick={() => handleHeaderLinkClick('#top')}
          data-swarm-target="nav-logo"
          className="inline-flex items-center min-h-[44px] px-2 -ml-2 rounded-lg font-display text-sm sm:text-base tracking-wider text-[#eef0f5] active:scale-95 active:text-[#ff4fa3] transition-all whitespace-nowrap shrink-0 touch-manipulation"
        >
          <span className="agent-word" data-word-idx="0">
            {renderCharSpans('NILESH')}
          </span>
        </a>

        {/* Zone 2: 4 Uppercase Letter-Spaced Links matching 00:00 of reference video */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center justify-between gap-12 lg:gap-24 text-xs font-bold uppercase tracking-[0.22em] text-[#eef0f5]/90"
        >
          {PORTFOLIO_DATA.navLinks.map((link, idx) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => handleHeaderLinkClick(link.href)}
              data-swarm-target={`nav-link-${idx}`}
              className="relative inline-flex items-center min-h-[44px] px-3 rounded-lg hover:text-[#ff4fa3] active:text-[#ff4fa3] active:scale-95 transition-all whitespace-nowrap shrink-0 touch-manipulation"
            >
              <span className="agent-word" data-word-idx={idx}>
                {renderCharSpans(link.label)}
              </span>
            </a>
          ))}
        </nav>

        {/* Zone 3: Resume PDF Link + 48x48px Mobile Menu Button */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={PORTFOLIO_DATA.profile.resumePdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-swarm-target="nav-resume"
            className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-[#eef0f5]/85 rounded-full border border-white/20 hover:border-[#ff4fa3] hover:text-white active:scale-95 active:border-[#ff4fa3] active:bg-white/10 transition-all whitespace-nowrap shrink-0 touch-manipulation"
          >
            RESUME PDF
          </a>

          <button
            ref={menuTriggerRef}
            type="button"
            onClick={toggleMenu}
            className="md:hidden inline-flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-full border border-white/25 text-[#eef0f5] active:scale-90 active:bg-white/15 active:border-[#ff4fa3] transition-all touch-manipulation cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-dialog"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Full-viewport Portaled Mobile Navigation Menu */}
      {mounted &&
        mobileMenuOpen &&
        createPortal(
          <div
            id="mobile-navigation-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            ref={dialogRef}
            className="mobile-menu-overlay fixed inset-0 w-full flex flex-col justify-between overflow-y-auto no-scrollbar md:hidden"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100dvh',
              minHeight: '-webkit-fill-available',
              backgroundColor: '#000000',
              zIndex: 2147483640,
              paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
              paddingLeft: 'calc(env(safe-area-inset-left, 0px) + 20px)',
              paddingRight: 'calc(env(safe-area-inset-right, 0px) + 20px)',
            }}
          >
            {/* Top Bar inside modal: Logo + Close Button */}
            <div className="flex items-center justify-between gap-6 pb-4 border-b border-white/10 shrink-0">
              <a
                href="#top"
                onClick={(e) => handleNavClick(e, '#top')}
                className="inline-flex items-center min-h-[44px] px-2 -ml-2 rounded-lg font-display text-sm sm:text-base tracking-wider text-[#eef0f5] active:scale-95 active:text-[#ff4fa3] transition-all whitespace-nowrap touch-manipulation"
              >
                NILESH
              </a>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => {
                  closeMenu(true);
                  menuTriggerRef.current?.focus();
                }}
                className="inline-flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-full border border-white/25 text-[#eef0f5] active:scale-90 active:bg-white/15 active:border-[#ff4fa3] transition-all touch-manipulation cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links with staggered CSS animation and plain CSS fallback */}
            <nav className="flex flex-col gap-3 my-auto py-6" aria-label="Mobile Primary Navigation">
              {PORTFOLIO_DATA.navLinks.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  style={{ animationDelay: `${i * 60 + 80}ms` }}
                  className="mobile-menu-item min-h-[56px] px-4 py-3 rounded-2xl font-display text-2xl sm:text-3xl uppercase text-[#eef0f5] hover:text-[#ff4fa3] active:text-[#ff4fa3] active:bg-white/10 active:scale-[0.98] transition-all flex items-center gap-4 touch-manipulation"
                >
                  <span className="font-mono-num text-sm text-[#ff9a3c]">0{i + 1}</span>
                  <span>{link.label}</span>
                </a>
              ))}
            </nav>

            {/* Bottom action: Resume PDF button */}
            <div className="pt-6 border-t border-white/10 shrink-0">
              <a
                href={PORTFOLIO_DATA.profile.resumePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => closeMenu(true)}
                style={{ animationDelay: `${PORTFOLIO_DATA.navLinks.length * 60 + 80}ms` }}
                className="mobile-menu-item w-full min-h-[52px] inline-flex items-center justify-center rounded-full btn-gradient-pill text-white font-bold uppercase tracking-widest text-xs active:scale-[0.97] transition-all touch-manipulation"
              >
                DOWNLOAD RESUME (PDF)
              </a>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};
