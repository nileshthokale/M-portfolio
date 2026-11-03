import React, { useEffect, useRef } from 'react';
import { PORTFOLIO_DATA } from '../data/portfolio';

export const ServicesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let ticking = false;

    const updateServicesScroll = () => {
      const section = sectionRef.current;
      if (!section) {
        ticking = false;
        return;
      }

      const sRect = section.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const viewportCenter = vh * 0.52;

      // 1. Heading transitions from silver-grey (#c2c6d1 at 00:07) to solid black (#05060a at 00:08)
      if (headingRef.current) {
        const hProgress = Math.max(0, Math.min(1, (vh * 0.82 - sRect.top) / (vh * 0.35)));
        headingRef.current.style.opacity = (0.22 + hProgress * 0.78).toFixed(2);
      }

      // 2. Compute each numbered row's center from static section bounds so touch-scrolling never reads transformed child rects
      const totalRows = rowRefs.current.length || 5;
      const listTop = sRect.top + sRect.height * 0.22;
      const listHeight = sRect.height * 0.72;
      const rowHeight = listHeight / totalRows;

      rowRefs.current.forEach((row, idx) => {
        if (!row) return;
        const rowCenter = listTop + (idx + 0.5) * rowHeight;
        const dist = Math.abs(rowCenter - viewportCenter);
        const maxDist = vh * 0.46;
        const focus = Math.max(0, Math.min(1, 1 - dist / maxDist));
        const opacity = 0.24 + focus * 0.76;
        const translateY = (1 - focus) * 6;
        row.style.opacity = opacity.toFixed(2);
        row.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
      });

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateServicesScroll);
      }
    };

    updateServicesScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      aria-labelledby="services-heading"
      className="scroll-mt-20 bg-[#eef0f5] text-[#05060a] rounded-[40px] sm:rounded-[52px] mx-2 sm:mx-5 py-20 sm:py-28 px-5 sm:px-12"
    >
      <div className="max-w-[1040px] mx-auto">
        {/* Giant Centered SERVICES Heading (Matches 00:07-00:08 of video) */}
        <div className="text-center mb-14 sm:mb-20">
          <h2
            id="services-heading"
            ref={headingRef}
            className="font-display uppercase text-[clamp(3rem,9vw,7.5rem)] tracking-tight text-[#05060a] leading-[0.94] transition-opacity duration-150"
          >
            SERVICES
          </h2>
        </div>

        {/* Single-Column Numbered Rows 01 / 02 / 03 / 04 / 05 (Matches 00:08-00:09 of video) */}
        <div className="divide-y divide-[#05060a]/15 border-t border-b border-[#05060a]/15">
          {PORTFOLIO_DATA.services.map((service, idx) => (
            <div
              key={service.number}
              ref={(el) => {
                rowRefs.current[idx] = el;
              }}
              className="py-9 sm:py-12 px-3 sm:px-4 -mx-3 sm:-mx-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-12 will-change-transform transition-all duration-150 active:bg-[#05060a]/[0.05] touch-manipulation"
            >
              {/* Huge Chunky Number 01..05 on Left */}
              <span className="font-display text-5xl sm:text-7xl tracking-tight text-[#05060a] shrink-0 sm:w-36">
                {service.number}
              </span>

              {/* Title + Description on Right */}
              <div className="flex-1">
                <h3 className="font-display text-lg sm:text-2xl uppercase tracking-tight text-[#05060a]">
                  {service.title}
                </h3>
                <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-[#05060a]/80 font-medium max-w-[62ch]">
                  {service.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono-num text-[#05060a]/65">
                  {service.deliverables.map((item, i) => (
                    <React.Fragment key={item}>
                      {i > 0 && <span aria-hidden="true">·</span>}
                      <span>{item}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
