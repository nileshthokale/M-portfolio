import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolio';

interface NavbarProps {
  onNavigateHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateHome }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    if (onNavigateHome) onNavigateHome();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#000000]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1380px] mx-auto flex items-center justify-between gap-6 px-4 sm:px-12 py-3.5 sm:py-4">
        {/* Zone 1: Brand Wordmark with 44px+ touch target */}
        <a
          href="#top"
          onClick={handleLinkClick}
          className="inline-flex items-center min-h-[44px] px-2 -ml-2 rounded-lg font-display text-sm sm:text-base tracking-wider text-[#eef0f5] active:scale-95 active:text-[#ff4fa3] transition-all whitespace-nowrap shrink-0 touch-manipulation"
        >
          NILESH
        </a>

        {/* Zone 2: 4 Uppercase Letter-Spaced Links matching 00:00 of reference video */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center justify-between gap-12 lg:gap-24 text-xs font-bold uppercase tracking-[0.22em] text-[#eef0f5]/90"
        >
          {PORTFOLIO_DATA.navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              className="relative inline-flex items-center min-h-[44px] px-3 rounded-lg hover:text-[#ff4fa3] active:text-[#ff4fa3] active:scale-95 transition-all whitespace-nowrap shrink-0 touch-manipulation"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Resume PDF Link + 48x48px Mobile Menu Button */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={PORTFOLIO_DATA.profile.resumePdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-[#eef0f5]/85 rounded-full border border-white/20 hover:border-[#ff4fa3] hover:text-white active:scale-95 active:border-[#ff4fa3] active:bg-white/10 transition-all whitespace-nowrap shrink-0 touch-manipulation"
          >
            RESUME PDF
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-12 h-12 min-w-[48px] min-h-[48px] rounded-full border border-white/25 text-[#eef0f5] active:scale-90 active:bg-white/15 active:border-[#ff4fa3] transition-all touch-manipulation cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-[76px] z-50 bg-[#000000]/98 backdrop-blur-xl px-6 py-8 flex flex-col justify-between md:hidden border-t border-white/10 overflow-y-auto"
          role="dialog"
          aria-label="Mobile Navigation Menu"
        >
          <nav className="flex flex-col gap-3">
            {PORTFOLIO_DATA.navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="min-h-[56px] px-4 py-3 rounded-2xl font-display text-2xl sm:text-3xl uppercase text-[#eef0f5] hover:text-[#ff4fa3] active:text-[#ff4fa3] active:bg-white/10 active:scale-[0.98] transition-all flex items-center gap-4 touch-manipulation"
              >
                <span className="font-mono-num text-sm text-[#ff9a3c]">0{i + 1}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/10">
            <a
              href={PORTFOLIO_DATA.profile.resumePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full min-h-[52px] inline-flex items-center justify-center rounded-full btn-gradient-pill text-white font-bold uppercase tracking-widest text-xs active:scale-[0.97] transition-all touch-manipulation"
            >
              DOWNLOAD RESUME (PDF)
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
