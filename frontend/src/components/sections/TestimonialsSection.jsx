'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Section from '../ui/Section.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Icon from '../ui/Icon.jsx';
import { getApiBaseUrl } from '../../services/httpClient.js';

/**
 * Default fallback student testimonials aligned with HopeFairy production database.
 * Ensures the 3D coverflow is immediately populated without waiting or blank states.
 */
const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    client_name: 'Rashid Shaikh',
    client_role: 'MSc Data Science',
    avatar: 'https://tse1.mm.bing.net/th/id/OIP.1War81n_eDWpXSBQTh_L_wAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    rating: 5,
    review: 'I have had the most seamless and empowering guidance experience with HopeFairy from counseling to final admission.',
    destination_country: 'USA',
    course_program: 'B.Tech / Data Science',
    is_featured: true,
    is_active: true,
  },
  {
    id: 3,
    client_name: 'Aanya Sharma',
    client_role: 'MSc International Business',
    avatar: null,
    rating: 5,
    review: 'HopeFairy guided me step-by-step from SOP drafting to visa clearance. Their counselors are patient, transparent, and always available. I received my UK Tier 4 visa within 12 days without any stress!',
    destination_country: 'United Kingdom',
    course_program: 'University of Warwick',
    is_featured: true,
    is_active: true,
  },
  {
    id: 4,
    client_name: 'Rohan Mehta',
    client_role: 'MS Computer Science',
    avatar: null,
    rating: 5,
    review: 'The test prep alongside personalized university shortlisting was phenomenal. They helped me secure a $15,000 merit scholarship. Truly life-changing mentorship for any study abroad aspirant.',
    destination_country: 'United States',
    course_program: 'Northeastern University',
    is_featured: true,
    is_active: true,
  },
  {
    id: 5,
    client_name: 'Priya Patel',
    client_role: 'Healthcare Administration',
    avatar: null,
    rating: 5,
    review: 'From documentation to post-landing guidance, HopeFairy treated my ambitions as their own. Their mock visa interview sessions gave me the exact confidence I needed to succeed on the first try.',
    destination_country: 'Canada',
    course_program: 'University of Toronto',
    is_featured: true,
    is_active: true,
  },
  {
    id: 6,
    client_name: 'Karan Verma',
    client_role: 'MBA Management',
    avatar: null,
    rating: 5,
    review: 'Navigating public universities in Germany seemed daunting until I met HopeFairy. They handled APS verification, blocked account setup, and university portal submissions effortlessly.',
    destination_country: 'Germany',
    course_program: 'TU Munich',
    is_featured: true,
    is_active: true,
  },
];

/**
 * TestimonialsSection — Executive 3D Coverflow Experience:
 * - Exactly 3 cards visible at a time (Left, Center, Right)
 * - Both side cards are softly blurred (blur-sm / 4.5px) and dimmed (opacity-48)
 * - The Center card is 100% crystal clear, elevated, and framed in HopeFairy signature Gold
 * - Smooth swipe / drag gestures with an authentic dynamic 45° 3D tilt effect on swipe
 * - Perfectly centered vertically without double-translation clipping
 */
export default function TestimonialsSection({ alt = true, variant, seq }) {
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1200);

  const containerRef = useRef(null);

  // Fetch active testimonials from Laravel API
  useEffect(() => {
    let isMounted = true;
    const apiUrl = getApiBaseUrl();

    fetch(`${apiUrl}/api/testimonials`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        const data = json?.data;
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        }
      })
      .catch(() => {
        // Keeps DEFAULT_TESTIMONIALS fallback gracefully
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Track viewport width for responsive card spacing and scale
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setViewportWidth(window.innerWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const total = testimonials.length;

  // Navigation handlers (circular wrapping)
  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  // Subtle auto-rotation (pauses on user hover, touch, or active drag)
  useEffect(() => {
    if (isPaused || isDragging || total <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused, isDragging, total, handleNext]);

  // Keyboard navigation (Left / Right Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Dynamic sizing based on viewport (Portrait Luxury Card Proportions)
  const getStepOffset = () => {
    if (viewportWidth >= 1280) return 300;
    if (viewportWidth >= 1024) return 270;
    if (viewportWidth >= 768) return 240;
    if (viewportWidth >= 640) return 210;
    return Math.min(185, viewportWidth * 0.56);
  };

  const getCardWidth = () => {
    if (viewportWidth >= 1024) return 310;
    if (viewportWidth >= 768) return 290;
    if (viewportWidth >= 640) return 275;
    return Math.min(285, Math.max(260, viewportWidth * 0.78));
  };

/**
 * Truncate text to a maximum number of words.
 */
function truncateWords(text, limit = 40) {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(' ') + '...';
}

/**
 * Format country names for uniform, clean rectangular badge presentation.
 */
function formatCountry(name) {
  if (!name) return 'ABROAD';
  const map = {
    'united kingdom': 'UK',
    'united states': 'USA',
    'united states of america': 'USA',
    'united arab emirates': 'UAE',
  };
  return (map[name.trim().toLowerCase()] || name).toUpperCase();
}

  const cardHeight =
    viewportWidth >= 768
      ? 440
      : viewportWidth >= 640
      ? 415
      : Math.min(390, Math.max(345, Math.round(viewportWidth * 0.96)));
  const stageHeight = viewportWidth >= 768 ? 520 : viewportWidth >= 640 ? 495 : cardHeight + 55;

  const stepOffset = getStepOffset();
  const cardWidth = getCardWidth();

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    setIsPaused(true);
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
    setDragX(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    setDragX(currentX - dragStartX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX < -40) {
      handleNext();
    } else if (dragX > 40) {
      handlePrev();
    }
    setDragX(0);
    setTimeout(() => setIsPaused(false), 2000);
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsPaused(true);
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragX(0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setDragX(e.clientX - dragStartX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX < -45) {
      handleNext();
    } else if (dragX > 45) {
      handlePrev();
    }
    setDragX(0);
    setTimeout(() => setIsPaused(false), 2000);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
    setIsPaused(false);
  };

  if (total === 0) return null;

  // Normalized drag fraction for real-time swipe lean (-1 to 1)
  const dragFraction = isDragging
    ? Math.max(-1.1, Math.min(1.1, dragX / (stepOffset || 300)))
    : 0;

  return (
    <Section id="testimonials" alt={alt} variant={variant} seq={seq} className="relative overflow-hidden py-16 sm:py-24">

      {/* Section Header */}
      <div className="flex flex-col items-center text-center px-4">
        <SectionHeading
          eyebrow="VOICES OF HOPEFAIRY"
          title="What Our Students & Parents Say"
          intro="Verified reviews and guidance experiences from students accepted to top institutions worldwide."
          align="center"
          highlightLast={2}
        />
      </div>

      {/* Carousel Stage Container with 3D Perspective */}
      <div
        className="relative mt-10 sm:mt-14 max-w-6xl mx-auto px-2 select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Left Side Floating Arrow Button */}
        <button
          type="button"
          onClick={handlePrev}
          title="Previous student success story"
          aria-label="Previous student success story"
          className="absolute left-2 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-hair/15 dark:border-white/15 bg-surface dark:bg-[#151412] text-fg flex items-center justify-center shadow-xl hover:bg-[#d8b056] hover:text-[#0b0b0c] hover:border-[#d8b056] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer shadow-amber-500/10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Side Floating Arrow Button */}
        <button
          type="button"
          onClick={handleNext}
          title="Next student success story"
          aria-label="Next student success story"
          className="absolute right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-hair/15 dark:border-white/15 bg-surface dark:bg-[#151412] text-fg flex items-center justify-center shadow-xl hover:bg-[#d8b056] hover:text-[#0b0b0c] hover:border-[#d8b056] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer shadow-amber-500/10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* 3D Coverflow Stage */}
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`relative w-full flex items-center justify-center overflow-hidden ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            height: `${stageHeight}px`,
            perspective: '1200px',
            perspectiveOrigin: '50% 50%',
          }}
        >
          {testimonials.map((t, idx) => {
            // Circular offset distance from active currentIndex (-floor(total/2) to floor(total/2))
            let diff = idx - currentIndex;
            while (diff > total / 2) diff -= total;
            while (diff < -total / 2) diff += total;

            // Effective position accounting for real-time drag progress
            const effectivePos = diff + dragFraction;
            const absPos = Math.abs(effectivePos);

            // Hide cards beyond the 3 slots (Left, Center, Right)
            const isVisible = absPos < 1.7;
            if (!isVisible && total > 3) {
              return null;
            }

            const isCenter = Math.abs(effectivePos) < 0.45;
            const isLeft = effectivePos < -0.45;
            const isRight = effectivePos > 0.45;

            // 1. Horizontal pixel translation
            const xOffset = effectivePos * stepOffset;

            // 2. 45° 3D Tilt on Y-Axis (Inward Angle) & Lean on Swipe
            // Left card rotates +42° inward; Center is 0°; Right card rotates -42° inward
            const rotateY = Math.max(-48, Math.min(48, -effectivePos * 42));

            // 3. Subtle Z-tilt (2.5°) for authentic physical floating lean
            const rotateZ = Math.max(-3, Math.min(3, -effectivePos * 2.2));

            // 4. Depth translation (Center comes forward +30px, sides recede -80px)
            const translateZ = 30 - Math.min(1, absPos) * 110;

            // 5. Scale (Center 1.04x elevated, sides 0.88x)
            const scale = Math.max(0.85, 1.04 - Math.min(1, absPos) * 0.16);

            // 6. Zero blur: Cards remain 100% sharp and legible with zero filter blur
            // 7. Opacity: Center is 1.0, sides are 0.48, edges fade out
            let opacity = 1;
            if (absPos <= 1) {
              opacity = 1 - absPos * 0.52;
            } else {
              opacity = Math.max(0, 0.48 - (absPos - 1) * 1.5);
            }

            // 8. Stacking order: Center on top
            const zIndex = Math.round(30 - Math.min(2, absPos) * 10);

            // Clicking side card brings it to center
            const handleCardClick = (e) => {
              if (Math.abs(dragX) > 8) return; // Ignore if user was dragging
              if (isLeft) {
                e.stopPropagation();
                handlePrev();
              } else if (isRight) {
                e.stopPropagation();
                handleNext();
              }
            };

            return (
              <div
                key={t.id || idx}
                data-testimonial-card
                onClick={handleCardClick}
                className="absolute will-change-transform select-none"
                style={{
                  top: '50%',
                  left: '50%',
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  transform: `translate(-50%, -50%) translate3d(${xOffset}px, 0, ${translateZ}px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
                  transformOrigin: 'center center',
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden',
                  opacity: Math.max(0, opacity),
                  zIndex,
                  transformStyle: 'preserve-3d',
                  transition: isDragging
                    ? 'none'
                    : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.55s ease, box-shadow 0.55s ease',
                  cursor: isCenter ? 'default' : 'pointer',
                }}
              >
                {/* Luxury Compact Card Surface — Clean, crisp & zero blur */}
                <div
                  className={`group relative flex flex-col justify-between w-full h-full p-4 sm:p-6 rounded-[26px] overflow-hidden transition-all duration-300 ${
                    isCenter
                      ? 'bg-white dark:bg-[#121110] border border-slate-300 dark:border-white/15 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_36px_-12px_rgba(0,0,0,0.8)]'
                      : 'bg-white dark:bg-[#11100f] border border-slate-200/70 dark:border-white/10 shadow-sm'
                  }`}
                >


                  {/* Side Card Tap Hint Indicator */}
                  {!isCenter && (
                    <div className="absolute inset-0 z-30 rounded-[26px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/10 dark:bg-black/20 pointer-events-none">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#d8b056] text-[#0b0b0c] shadow-lg shadow-amber-500/30 flex items-center gap-1.5">
                        <span>✦</span> Click to view
                      </span>
                    </div>
                  )}

                  {/* 1. Student Header: Avatar, Name, Role, Rating & Quote Emblem */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`relative w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-base shrink-0 shadow-md transition-all duration-300 ${
                          isCenter
                            ? 'ring-[0.5px] ring-[#d8b056]/30 bg-[#d8b056]/15 text-[#d8b056] scale-105'
                            : 'ring-[0.5px] ring-hair/20 bg-brand-400/10 text-brand-600 dark:text-brand-300'
                        }`}
                      >
                        {t.avatar ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={t.avatar}
                            alt={`${t.client_name} — HopeFairy student testimonial`}
                            title={`${t.client_name} (${t.course_program || 'Admitted Student'})`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          t.client_name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3
                          className={`text-base font-bold leading-tight capitalize truncate transition-colors ${
                            isCenter
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {t.client_name}
                        </h3>
                        {t.client_role && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5 capitalize truncate">
                            {t.client_role}
                          </p>
                        )}
                        {/* Rating stars under student name */}
                        <div className="flex items-center gap-1 text-[#d8b056] text-xs mt-0.5">
                          {Array.from({ length: t.rating || 5 }).map((_, i) => (
                            <span
                              key={i}
                              className="text-xs drop-shadow-[0_1px_3px_rgba(216,176,86,0.35)]"
                            >
                              ★
                            </span>
                          ))}
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1">
                            {(t.rating || 5).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Decorative Quotation Emblem */}
                    <span
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm ${
                        isCenter
                          ? 'bg-gradient-to-br from-[#eedb9f] via-[#d8b056] to-[#c89b3c] text-[#0b0b0c] shadow-amber-500/30 scale-105'
                          : 'bg-brand-400/10 text-brand-500 border border-brand-400/25'
                      }`}
                    >
                      <Icon name="quote" className="w-4 h-4" />
                    </span>
                  </div>

                  {/* 2. Review Quote Body (Balanced vertical space coverage) */}
                  <div className="flex-1 flex items-center my-2 sm:my-3 min-h-0">
                    <p
                      className={`text-xs sm:text-[14px] leading-relaxed italic line-clamp-4 sm:line-clamp-5 md:line-clamp-6 transition-colors ${
                        isCenter
                          ? 'text-slate-800 dark:text-slate-200 font-medium'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      &ldquo;{truncateWords(t.review, 40)}&rdquo;
                    </p>
                  </div>

                  {/* 3. Verified Credentials & Badges (Uniform Rectangular Tags with Subtle Radius) */}
                  <div className="pt-2.5 sm:pt-3 border-t border-hair/10 dark:border-white/10 space-y-1.5 sm:space-y-2 shrink-0">
                    {/* Consistent 2-Column Badges Row (Guarantees identical height across ALL cards) */}
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold bg-[#d8b056]/12 text-brand-700 dark:text-brand-300 border border-[#d8b056]/30 min-w-0 shadow-sm">
                        <span className="shrink-0 text-xs">📍</span>
                        <span className="truncate">{formatCountry(t.destination_country || 'ABROAD')}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-medium bg-hair/5 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-hair/10 dark:border-white/10 min-w-0 shadow-sm">
                        <span className="shrink-0 text-xs">🎓</span>
                        <span className="truncate" title={t.course_program || 'University Admission'}>{t.course_program || 'Admitted'}</span>
                      </div>
                    </div>

                    {/* Verified Admission Badge — Clean Rectangular Bar with subtle radius */}
                    <div className="flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/[0.08] dark:bg-emerald-500/[0.12] border border-emerald-500/20 text-[10px] sm:text-[11px] min-w-0 shadow-sm">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold truncate min-w-0">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="truncate">Verified Acceptance</span>
                      </span>
                      <span className="text-[9.5px] sm:text-[10px] uppercase tracking-wider text-brand-700 dark:text-brand-400 font-bold shrink-0 text-right">
                        <span className="hidden xs:inline sm:hidden lg:inline">HopeFairy </span>Alum
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation Toolbar: Mobile Controls, Interactive Dots & Counter */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
          {/* Mobile Arrows Control */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              title="Previous student success story"
              aria-label="Previous student success story"
              className="p-2.5 rounded-xl border border-hair/15 bg-surface text-fg active:scale-95 transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              title="Next student success story"
              aria-label="Next student success story"
              className="p-2.5 rounded-xl border border-hair/15 bg-surface text-fg active:scale-95 transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Interactive Navigation Dots */}
          {/* Each dot sits in a 24px-tall tap target (the visible dot is unchanged) */}
          <div className="flex items-center mx-auto">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                title={`View testimonial ${i + 1} of ${testimonials.length}`}
                aria-label={`View testimonial ${i + 1} of ${testimonials.length}`}
                className="group grid h-6 min-w-6 place-items-center px-[3px] cursor-pointer"
              >
                <span
                  className={`block transition-all duration-300 rounded-full ${
                    currentIndex === i
                      ? 'w-8 h-2.5 bg-gradient-to-r from-[#eedb9f] via-[#d8b056] to-[#c89b3c] shadow-sm shadow-amber-500/40'
                      : 'w-2.5 h-2.5 bg-hair/20 dark:bg-white/20 group-hover:bg-hair/40 dark:group-hover:bg-white/40'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Live Counter Badge & Swipe Hint */}
          <div className="hidden sm:inline-flex items-center gap-3">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              ✦ Swipe or tap side cards
            </span>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider border border-hair/10 dark:border-white/10 bg-surface/80 dark:bg-[#151412]/80 text-fg-muted">
              <span className="text-brand-700 dark:text-brand-400">0{currentIndex + 1}</span>
              <span>/</span>
              <span>0{testimonials.length}</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
