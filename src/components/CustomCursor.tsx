import React, { useEffect, useRef, useState } from 'react';

interface CustomCursorProps {
  reducedMotion: boolean;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ reducedMotion }) => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [cursorMode, setCursorMode] = useState<'default' | 'hover' | 'view'>('default');
  const [isTouch, setIsTouch] = useState(true);

  useEffect(() => {
    if (reducedMotion) return;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer) {
      setIsTouch(true);
      return;
    }
    setIsTouch(false);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let rafId = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-cursor="view"]')) {
        setCursorMode('view');
      } else if (target.closest('a, button, input, textarea, [role="button"]')) {
        setCursorMode('hover');
      } else {
        setCursorMode('default');
      }
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      rafId = requestAnimationFrame(animateRing);
    };

    const onClick = () => {
      setCursorMode('default');
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('click', onClick, { passive: true });
    rafId = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  if (isTouch || reducedMotion) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-1.5 -mt-1.5 w-3 h-3 rounded-full bg-[#ff4fa3] transition-opacity duration-150"
      />
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 flex items-center justify-center rounded-full border transition-all duration-150 ${
          cursorMode === 'view'
            ? '-ml-10 -mt-10 w-20 h-20 bg-[#7b5cff]/90 border-white/40 text-white text-[11px] font-bold tracking-widest'
            : cursorMode === 'hover'
            ? '-ml-7 -mt-7 w-14 h-14 border-[#ff4fa3] bg-[#ff4fa3]/15'
            : '-ml-5 -mt-5 w-10 h-10 border-white/45 bg-transparent'
        }`}
      >
        {cursorMode === 'view' && <span>VIEW</span>}
      </div>
    </div>
  );
};
