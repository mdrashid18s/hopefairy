import Link from 'next/link';
import { mainNav, homeOnly, services, destinations, site, counsellingLink } from '../../data/site.js';
import { legalNav } from '../../data/legal.js';
import SmartLink from '../ui/SmartLink.jsx';
import Icon from '../ui/Icon.jsx';
import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer id="main-footer" className="relative overflow-hidden border-t border-brand-400/15 bg-surface/60 dark:bg-ink-950">
      {/* thin gold rule across the top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/70 to-transparent" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[120px]" />

      <div className="container-x relative py-6 sm:py-16">
        <div
          className={`grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-2 lg:gap-10 xl:gap-12 ${
            homeOnly
              ? 'lg:grid-cols-[2fr_1fr_1fr]'
              : 'lg:grid-cols-[1.8fr_1fr_1.2fr_1.1fr_1.3fr]'
          }`}
        >
          <div className="col-span-2 lg:col-span-1 max-w-sm">
            <Link
              prefetch={false}
              href="/"
              title="HopeFairy — Best Abroad Admission Advisor & Best Career Counselling in India"
              aria-label={`${site.name} — Home`}
              className="inline-block"
            >
              <Logo className="h-8 w-8 sm:h-12 sm:w-12" wordmark tagline />
            </Link>
            <p className="mt-3 sm:mt-5 text-xs sm:text-sm leading-relaxed text-fg-muted">{site.description}</p>
            <div className="mt-4 sm:mt-6 flex items-center gap-2">
              {site.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Follow HopeFairy on ${s.label} for Study Abroad Updates & University Admissions`}
                  aria-label={`HopeFairy on ${s.label}`}
                  className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-hair/10 bg-tint/5 text-fg-muted transition-all hover:-translate-y-0.5 hover:border-brand-400/60 hover:text-brand-500"
                >
                  <Icon name={s.icon} className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title={homeOnly ? 'Explore' : 'Company'}>
            {mainNav.map((n) => (
              <FooterLink key={n.to} to={n.to} title={`${n.label} — HopeFairy`}>
                {n.label}
              </FooterLink>
            ))}
            {/* below Contact: sitemap and legal pages */}
            {legalNav.map((n) => (
              <FooterLink key={n.to} to={n.to} title={`${n.label} — HopeFairy`}>
                {n.label}
              </FooterLink>
            ))}
          </FooterCol>

          {!homeOnly && (
            <>
              <FooterCol title="Services">
                {services.map((s) => (
                  <FooterLink key={s.slug} to={`/service/${s.slug}/`} title={`Explore ${s.title} advisory & guidance`}>
                    {s.title}
                  </FooterLink>
                ))}
              </FooterCol>

              <FooterCol title="Destinations">
                {destinations.map((d) => (
                  <FooterLink key={d.slug} to={`/destinations/#${d.slug}`} title={`Study in ${d.name} — courses, intakes and visas`}>
                    Study in {d.name}
                  </FooterLink>
                ))}
              </FooterCol>
            </>
          )}

          <FooterCol title="Get in touch">
            <a
              href={site.phoneHref}
              title={`Call HopeFairy Admission Helpdesk: ${site.phone}`}
              aria-label="Call HopeFairy admission desk on phone"
              className="flex items-center gap-1.5 py-0.5 sm:gap-2 sm:py-1 text-xs sm:text-sm text-fg-muted hover:text-fg"
            >
              <Icon name="phone" className="h-3 w-3 sm:h-4 sm:w-4 text-brand-500 shrink-0" />
              <span className="truncate">{site.phone}</span>
            </a>
            <a
              href={site.emailHref}
              title={`Send Email to HopeFairy Admissions: ${site.email}`}
              aria-label="Email HopeFairy admissions office"
              className="flex items-center gap-1.5 py-0.5 sm:gap-2 sm:py-1 text-xs sm:text-sm text-fg-muted hover:text-fg"
            >
              <Icon name="mail" className="h-3 w-3 sm:h-4 sm:w-4 text-brand-500 shrink-0" />
              <span className="truncate">{site.email}</span>
            </a>
            <span className="flex items-center gap-1.5 py-0.5 sm:gap-2 sm:py-1 text-xs sm:text-sm text-fg-muted">
              <Icon name="clock" className="h-3 w-3 sm:h-4 sm:w-4 text-brand-500 shrink-0" />
              <span className="truncate">{site.hours}</span>
            </span>
            <span className="flex items-center gap-1.5 py-0.5 sm:gap-2 sm:py-1 text-xs sm:text-sm text-fg-muted">
              <Icon name="map-pin" className="h-3 w-3 sm:h-4 sm:w-4 text-brand-500 shrink-0" />
              <span>{site.location}</span>
            </span>
            <SmartLink
              {...counsellingLink}
              title="Book a Free 1-on-1 Consultation with Best Abroad Admission Advisor & Career Counsellor"
              aria-label="Book free counselling session with HopeFairy"
              className="btn-primary mt-2 sm:mt-4 self-start !px-3 !py-1.5 text-xs sm:!px-5 sm:!py-2.5 sm:text-sm"
            >
              Free Counselling
            </SmartLink>
          </FooterCol>
        </div>

        <div className="mt-6 sm:mt-14 flex flex-col items-center justify-between gap-2 sm:gap-4 border-t border-hair/10 pt-3.5 sm:pt-6 text-[10px] sm:text-xs text-fg-muted sm:flex-row text-center sm:text-left">
          <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
            <p>
              © {new Date().getFullYear()} {site.name}. All rights reserved.
            </p>
            <p>
              Design &amp; Develop by{' '}
              <a
                href="https://areezsoftware.com/"
                target="_blank"
                rel="noopener noreferrer"
                title="Areez Software — Websites, Mobile Apps & Custom Software"
                className="font-medium text-fg-muted transition-colors hover:text-brand-600 dark:hover:text-brand-300"
              >
                Areez Software
              </a>
            </p>
          </div>
          <p className="text-[11px] sm:text-sm text-brand-700 dark:text-brand-300">{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, className = '', children }) {
  return (
    <div className={className}>
      {/* h2: footer columns start a new outline level after the page content (same look as before) */}
      <h2 className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
        {title}
      </h2>
      <div className="mt-1.5 sm:mt-4 flex flex-col">{children}</div>
    </div>
  );
}

function FooterLink({ to, title, children }) {
  return (
    <Link
      prefetch={false}
      href={to}
      title={title || (typeof children === 'string' ? children : undefined)}
      className="py-0.5 text-xs sm:py-1.5 sm:text-sm text-fg-muted transition-colors hover:text-brand-600 dark:hover:text-brand-300 leading-snug"
    >
      {children}
    </Link>
  );
}
