import React from 'react';
import { motion } from 'motion/react';
import { PORTFOLIO_DATA, TestimonialItem } from '../data/portfolio';
import { GlossyShape3D } from '../components/GlossyShape3D';

interface TestimonialsSectionProps {
  reducedMotion: boolean;
}

const AVATAR_GRADIENTS: Record<TestimonialItem['avatarTheme'], string> = {
  pink: 'from-[#ff4fa3] to-[#7b5cff]',
  violet: 'from-[#7b5cff] to-[#38bdf8]',
  orange: 'from-[#ff9a3c] to-[#ff4fa3]',
  cyan: 'from-[#38bdf8] to-[#6366f1]',
  emerald: 'from-[#10b981] to-[#3b82f6]',
  amber: 'from-[#f59e0b] to-[#ec4899]',
};

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ reducedMotion }) => {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative py-20 sm:py-28 px-5 sm:px-8 max-w-[1380px] mx-auto overflow-hidden"
    >
      {/* Floating 3D Expressive Glossy Orbs (Matches 00:14-00:16 of reference video) */}
      <div className="hidden md:block absolute top-8 right-12 w-24 h-24 lg:w-28 lg:h-28 animate-float-slow">
        <GlossyShape3D variant="star-orb" className="w-full h-full" />
      </div>
      <div className="hidden md:block absolute bottom-6 left-10 w-24 h-24 lg:w-28 lg:h-28 animate-float-reverse">
        <GlossyShape3D variant="wow-orb" className="w-full h-full" />
      </div>

      {/* Centered Section Heading */}
      <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
        <h2
          id="testimonials-heading"
          className="font-display text-[clamp(2rem,5vw,4rem)] tracking-tight text-[#eef0f5] leading-tight"
          style={{ textWrap: 'balance' }}
        >
          What Clients Are Saying
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#eef0f5]/70">
          Feedback from GoKaliFree learners, faculty mentors, and freelance engineering clients.
        </p>
      </div>

      {/* 2x3 Grid of Outlined Rounded Quote Cards (Matches 00:15-00:16 of reference video) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PORTFOLIO_DATA.testimonials.map((item, idx) => (
          <motion.article
            key={item.id}
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: idx * 0.06 }}
            className="card-outlined-dark p-6 sm:p-7 flex flex-col justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              {/* Stylized High-Contrast Avatar Portrait */}
              <div
                className={`w-14 h-14 rounded-full bg-gradient-to-br ${
                  AVATAR_GRADIENTS[item.avatarTheme]
                } p-[2px] shrink-0`}
              >
                <div className="w-full h-full rounded-full bg-[#090c15] flex items-center justify-center font-display text-sm text-white">
                  {item.initials}
                </div>
              </div>

              <blockquote className="text-xs sm:text-sm leading-relaxed text-[#eef0f5]/88">
                “{item.quote}”
              </blockquote>
            </div>

            <footer className="pt-4 border-t border-white/10 flex flex-col gap-1">
              <p className="font-display text-xs sm:text-sm uppercase tracking-wide text-white">
                {item.name}
              </p>
              <p className="text-xs text-[#eef0f5]/65">
                {item.role} · {item.organization}
              </p>
              <p className="text-[11px] font-mono-num text-[#ff9a3c] mt-0.5">
                Outcome: {item.outcome}
              </p>
            </footer>
          </motion.article>
        ))}
      </div>
    </section>
  );
};
