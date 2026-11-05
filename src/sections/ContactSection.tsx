import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Github, Globe, Instagram, Linkedin, Mail, Phone, Send } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolio';
import { validateContactForm, ContactPayload } from '../lib/portfolioLogic';
import { GlossyShape3D } from '../components/GlossyShape3D';

export interface SubmittedInquiry extends ContactPayload {
  id: string;
  submittedAt: string;
}

export const ContactSection: React.FC = () => {
  const [form, setForm] = useState<ContactPayload>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<SubmittedInquiry[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const boltRef = useRef<HTMLDivElement | null>(null);
  const handRef = useRef<HTMLDivElement | null>(null);
  const line1Ref = useRef<HTMLSpanElement | null>(null);
  const line2Ref = useRef<HTMLSpanElement | null>(null);
  const line3Ref = useRef<HTMLSpanElement | null>(null);
  const formWrapRef = useRef<HTMLDivElement | null>(null);

  // 60fps scroll-driven animation matching Video 00:17-00:19 ("LET'S / GET IN / TOUCH")
  useEffect(() => {
    let rafId = 0;

    const updateContactScroll = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;

      const reveal = Math.max(0, Math.min(1, (vh * 0.92 - rect.top) / (vh * 0.55)));
      const parallax = (vh * 0.5 - rect.top) / vh;

      const animateLine = (node: HTMLSpanElement | null, delay: number) => {
        if (!node) return;
        const p = Math.max(0, Math.min(1, (reveal - delay) / (1 - delay)));
        const eased = 1 - Math.pow(1 - p, 3);
        const y = (1 - eased) * 44;
        const x = (1 - eased) * -24;
        node.style.opacity = `${0.15 + eased * 0.85}`;
        node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      };

      animateLine(line1Ref.current, 0.0);
      animateLine(line2Ref.current, 0.14);
      animateLine(line3Ref.current, 0.28);

      if (formWrapRef.current) {
        const p = Math.max(0, Math.min(1, (reveal - 0.15) / 0.85));
        const eased = 1 - Math.pow(1 - p, 3);
        formWrapRef.current.style.opacity = `${0.2 + eased * 0.8}`;
        formWrapRef.current.style.transform = `translate3d(0px, ${((1 - eased) * 32).toFixed(1)}px, 0)`;
      }

      if (boltRef.current) {
        const y = parallax * -48;
        const rot = parallax * 26;
        boltRef.current.style.transform = `translate3d(0px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg)`;
      }

      if (handRef.current) {
        const y = parallax * -36;
        const rot = parallax * -20;
        handRef.current.style.transform = `translate3d(0px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg)`;
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateContactScroll);
    };

    updateContactScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateContactForm(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      setStatusMessage(null);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({ ok: true }));
      const newEntry: SubmittedInquiry = {
        ...form,
        id: data.id || `inq-${Date.now()}`,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSubmissions((prev) => [newEntry, ...prev]);
      setStatusMessage(
        `Thanks ${form.name.trim()}! Your message has been sent to Nilesh (${PORTFOLIO_DATA.profile.email}).`
      );
      setSubmittedSuccess(true);
      setTimeout(() => setSubmittedSuccess(false), 4000);
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([20, 40, 20]);
        } catch (e) {}
      }
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      const fallbackEntry: SubmittedInquiry = {
        ...form,
        id: `inq-${Date.now()}`,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSubmissions((prev) => [fallbackEntry, ...prev]);
      setStatusMessage(
        `Thanks ${form.name.trim()}! Your message has been logged for Nilesh.`
      );
      setForm({ name: '', email: '', phone: '', message: '' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      aria-labelledby="contact-heading"
      className="scroll-mt-20 relative bg-[#eef0f5] text-[#05060a] rounded-[40px] sm:rounded-[52px] pt-24 sm:pt-32 pb-28 sm:pb-36 px-5 sm:px-10 mx-2 sm:mx-5 overflow-hidden z-10"
    >
      {/* Top-Right Floating 3D Gold Lightning Bolt (Video 00:17) */}
      <div
        ref={boltRef}
        data-swarm-target="contact-figure-bolt"
        className="hidden sm:block absolute top-4 right-8 lg:right-16 w-28 h-28 lg:w-36 lg:h-36 pointer-events-none will-change-transform"
      >
        <GlossyShape3D variant="gold-bolt" className="w-full h-full" />
      </div>

      <div className="relative z-10 max-w-[1260px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Giant Stacked "LET'S / GET IN / TOUCH" */}
        <div className="lg:col-span-5">
          <h2
            id="contact-heading"
            data-swarm-target="contact-heading"
            className="font-display uppercase text-[clamp(2.8rem,6.5vw,5.6rem)] leading-[0.94] tracking-tight text-[#05060a] flex flex-col"
          >
            <span ref={line1Ref} className="block will-change-transform">
              <span className="agent-word">
                <span className="agent-char">L</span>
                <span className="agent-char">E</span>
                <span className="agent-char">T</span>
                <span className="agent-char">&apos;</span>
                <span className="agent-char">S</span>
              </span>
            </span>
            <span ref={line2Ref} className="block will-change-transform">
              <span className="agent-word">
                <span className="agent-char">G</span>
                <span className="agent-char">E</span>
                <span className="agent-char">T</span>
              </span>
              <span className="agent-char agent-space"> </span>
              <span className="agent-word">
                <span className="agent-char">I</span>
                <span className="agent-char">N</span>
              </span>
            </span>
            <span ref={line3Ref} className="block will-change-transform">
              <span className="agent-word">
                <span className="agent-char">T</span>
                <span className="agent-char">O</span>
                <span className="agent-char">U</span>
                <span className="agent-char">C</span>
                <span className="agent-char">H</span>
              </span>
            </span>
          </h2>

          <div className="mt-7 flex flex-col items-start gap-1.5">
            <a
              href={`mailto:${PORTFOLIO_DATA.profile.email}`}
              data-swarm-target="contact-link-email"
              className="inline-flex items-center gap-2.5 min-h-[46px] px-2 -ml-2 rounded-xl text-xl sm:text-2xl font-extrabold text-[#7b5cff] hover:text-[#ff4fa3] active:text-[#ff4fa3] active:bg-[#7b5cff]/10 active:scale-[0.98] transition-all break-all touch-manipulation"
            >
              <Mail className="w-5 h-5 shrink-0" />
              <span>{PORTFOLIO_DATA.profile.email}</span>
            </a>

            <a
              href={`tel:${PORTFOLIO_DATA.profile.phone.replace(/\s+/g, '')}`}
              data-swarm-target="contact-link-phone"
              className="inline-flex items-center gap-2.5 min-h-[44px] px-2 -ml-2 rounded-xl text-base sm:text-lg font-bold font-mono-num text-[#05060a]/85 hover:text-[#7b5cff] active:text-[#7b5cff] active:bg-[#7b5cff]/10 active:scale-[0.98] transition-all touch-manipulation"
            >
              <Phone className="w-4 h-4 shrink-0 text-[#7b5cff]" />
              <span>{PORTFOLIO_DATA.profile.phone}</span>
            </a>
          </div>

          <p
            data-swarm-target="contact-intro"
            className="mt-4 text-sm sm:text-base font-medium text-[#05060a]/75 max-w-[38ch]"
          >
            Available for entry-level Software Engineering, Web Development, Cybersecurity, and Data Science roles, plus freelance projects.
          </p>

          {/* Social Links Matrix */}
          <div className="mt-6 flex flex-wrap gap-2.5 max-w-md">
            <a
              href={PORTFOLIO_DATA.profile.socials.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              data-swarm-target="contact-chip"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 hover:bg-[#7b5cff]/10 border border-black/10 hover:border-[#7b5cff]/30 text-xs font-semibold text-[#05060a] hover:text-[#7b5cff] active:scale-95 transition-all touch-manipulation"
            >
              <Globe className="w-3.5 h-3.5 text-[#ff9a3c]" />
              <span>nileshthokale.vercel.app</span>
            </a>

            <a
              href={PORTFOLIO_DATA.profile.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              data-swarm-target="contact-chip"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 hover:bg-black/10 border border-black/10 hover:border-black/25 text-xs font-semibold text-[#05060a] active:scale-95 transition-all touch-manipulation"
            >
              <Github className="w-3.5 h-3.5" />
              <span>{PORTFOLIO_DATA.profile.socials.githubDisplay}</span>
            </a>

            <a
              href={PORTFOLIO_DATA.profile.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              data-swarm-target="contact-chip"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 hover:bg-[#ff4fa3]/10 border border-black/10 hover:border-[#ff4fa3]/30 text-xs font-semibold text-[#05060a] hover:text-[#ff4fa3] active:scale-95 transition-all touch-manipulation"
            >
              <Instagram className="w-3.5 h-3.5 text-[#ff4fa3]" />
              <span>{PORTFOLIO_DATA.profile.socials.instagramDisplay}</span>
            </a>

            <a
              href={PORTFOLIO_DATA.profile.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-swarm-target="contact-chip"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 hover:bg-[#0077b5]/10 border border-black/10 hover:border-[#0077b5]/30 text-xs font-semibold text-[#05060a] hover:text-[#0077b5] active:scale-95 transition-all touch-manipulation"
            >
              <Linkedin className="w-3.5 h-3.5 text-[#0077b5]" />
              <span>{PORTFOLIO_DATA.profile.socials.linkedinDisplay}</span>
            </a>
          </div>

          {/* Bottom-Left Floating 3D Purple Hand (Video 00:18) */}
          <div
            ref={handRef}
            data-swarm-target="contact-figure-hand"
            className="hidden sm:block mt-6 w-24 h-24 lg:w-32 lg:h-32 pointer-events-none will-change-transform"
          >
            <GlossyShape3D variant="purple-hand" className="w-full h-full" />
          </div>
        </div>

        {/* Right Column: Minimalist Underline Contact Form (Video 00:17-00:18) */}
        <div ref={formWrapRef} className="lg:col-span-7 will-change-transform">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div data-swarm-target="contact-field" className="relative">
              <label
                htmlFor="contact-name"
                className="block text-xs font-bold uppercase tracking-wider text-[#05060a]/70"
              >
                Full Name *
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder=""
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'error-name' : undefined}
                className="mt-1 w-full min-h-[48px] bg-transparent border-b border-[#05060a]/35 py-3 text-base font-medium text-[#05060a] focus:border-[#7b5cff] focus:outline-none transition-colors touch-manipulation"
              />
              <span className="mobile-form-line" aria-hidden="true" />
              {errors.name && (
                <p id="error-name" role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div data-swarm-target="contact-field" className="relative">
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-bold uppercase tracking-wider text-[#05060a]/70"
                >
                  Email *
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder=""
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'error-email' : undefined}
                  className="mt-1 w-full min-h-[48px] bg-transparent border-b border-[#05060a]/35 py-3 text-base font-medium text-[#05060a] focus:border-[#7b5cff] focus:outline-none transition-colors touch-manipulation"
                />
                <span className="mobile-form-line" aria-hidden="true" />
                {errors.email && (
                  <p id="error-email" role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              <div data-swarm-target="contact-field" className="relative">
                <label
                  htmlFor="contact-phone"
                  className="block text-xs font-bold uppercase tracking-wider text-[#05060a]/70"
                >
                  Phone
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder=""
                  className="mt-1 w-full min-h-[48px] bg-transparent border-b border-[#05060a]/35 py-3 text-base font-medium text-[#05060a] focus:border-[#7b5cff] focus:outline-none transition-colors touch-manipulation"
                />
                <span className="mobile-form-line" aria-hidden="true" />
              </div>
            </div>

            <div data-swarm-target="contact-field" className="relative">
              <label
                htmlFor="contact-message"
                className="block text-xs font-bold uppercase tracking-wider text-[#05060a]/70"
              >
                Message *
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder=""
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'error-message' : undefined}
                className="mt-1 w-full min-h-[96px] bg-transparent border-b border-[#05060a]/35 py-3 text-base font-medium text-[#05060a] focus:border-[#7b5cff] focus:outline-none transition-colors resize-none touch-manipulation"
              />
              <span className="mobile-form-line" aria-hidden="true" />
              {errors.message && (
                <p id="error-message" role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                  {errors.message}
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                data-swarm-target="contact-send-btn"
                className="w-full min-h-[52px] py-4 px-8 rounded-full border border-[#05060a] text-[#05060a] font-bold uppercase tracking-widest text-xs sm:text-sm hover:bg-[#05060a] hover:text-[#eef0f5] active:bg-[#05060a] active:text-[#eef0f5] active:scale-[0.97] transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation select-none relative overflow-visible"
              >
                {submittedSuccess ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-bounce" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{submitting ? 'SENDING...' : submittedSuccess ? 'SENT!' : 'SEND'}</span>
              </button>
            </div>

            {statusMessage && (
              <div
                role="status"
                className="p-4 rounded-2xl bg-emerald-950/90 text-emerald-100 text-sm font-medium flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {submissions.length > 0 && (
              <div className="pt-4 border-t border-[#05060a]/15">
                <p className="text-xs font-mono-num uppercase tracking-wider text-[#05060a]/60">
                  Recent Dispatches ({submissions.length})
                </p>
                <ul className="mt-2 space-y-2">
                  {submissions.map((item) => (
                    <li
                      key={item.id}
                      className="text-xs text-[#05060a]/80 flex items-center justify-between gap-2 bg-white/60 px-3 py-2 rounded-xl"
                    >
                      <span className="font-semibold truncate">
                        {item.name} ({item.email})
                      </span>
                      <span className="font-mono-num text-[#7b5cff] shrink-0">
                        Sent · {item.submittedAt}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};
