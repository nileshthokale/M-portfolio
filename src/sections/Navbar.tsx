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
    <header className="sticky top-0 z-40 w-full bg-[#000000]/90 border-b border-white/5">
      <div className="max-w-[1380px] mx-auto flex items-center justify-between gap-8 px-6 sm:px-12 py-5">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#top"
          onClick={handleLinkClick}
          className="font-display text-sm sm:text-base tracking-wider text-[#eef0f5] whitespace-nowrap shrink-0"
        >
          NILESH
        </a>

        {/* Zone 2: 4 Uppercase Letter-Spaced Links matching 00:00 of reference video */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center justify-between gap-16 lg:gap-28 text-xs font-bold uppercase tracking-[0.22em] text-[#eef0f5]/90"
        >
          {PORTFOLIO_DATA.navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              className="relative py-1 hover:text-[#ff4fa3] transition-colors whitespace-nowrap shrink-0"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Resume PDF Link + Mobile Menu Button */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={PORTFOLIO_DATA.profile.resumePdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#eef0f5]/85 rounded-full border border-white/20 hover:border-[#ff4fa3] hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            RESUME PDF
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/20 text-[#eef0f5]"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-[68px] z-50 bg-[#000000] px-6 py-10 flex flex-col justify-between md:hidden border-t border-white/10"
          role="dialog"
          aria-label="Mobile Navigation Menu"
        >
          <nav className="flex flex-col gap-6">
            {PORTFOLIO_DATA.navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="font-display text-3xl uppercase text-[#eef0f5] hover:text-[#ff4fa3] transition-colors flex items-center gap-4"
              >
                <span className="font-mono-num text-sm text-[#ff9a3c]">0{i + 1}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
