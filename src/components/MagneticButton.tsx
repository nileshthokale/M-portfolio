import React from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  variant?: 'gradient' | 'outline' | 'outline-dark';
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  external?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  variant = 'gradient',
  href,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  ariaLabel,
  external = false,
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-full font-bold uppercase tracking-wider text-xs sm:text-sm px-7 py-3.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff4fa3] transition-all duration-150 cursor-pointer';

  const variantClasses =
    variant === 'gradient'
      ? 'btn-gradient-pill text-white'
      : variant === 'outline-dark'
      ? 'border border-[#05060a] text-[#05060a] hover:bg-[#05060a] hover:text-[#eef0f5]'
      : 'border border-[#eef0f5]/50 text-[#eef0f5] hover:border-[#ff4fa3] hover:bg-white/5';

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        aria-label={ariaLabel}
        className={`${baseClasses} ${variantClasses} ${className}`}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${baseClasses} ${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};
