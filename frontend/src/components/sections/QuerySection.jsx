import Section from '../ui/Section.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';
import Card3D, { Lift } from '../ui/Card3D.jsx';
import QueryForm from '../forms/QueryForm.jsx';
import { querySection as copy, site } from '../../data/site.js';

/**
 * "Send us your query" — enquiry form beside quick contact options.
 * @param {{source?: string}} props  label saved with each query (which page it came from)
 */
export default function QuerySection({ source = 'Homepage query form', alt = false, variant, seq }) {
  const contacts = [
    { icon: 'phone', label: 'Call us', value: site.phone, href: site.phoneHref },
    { icon: 'message-circle', label: 'WhatsApp', value: 'Chat with a counsellor', href: site.whatsappHref, external: true },
    { icon: 'mail', label: 'Email', value: site.email, href: site.emailHref },
    { icon: 'clock', label: 'Office hours', value: site.hours },
  ];

  return (
    <Section id="query" alt={alt} variant={variant} seq={seq}>
      <div className="grid gap-6 sm:gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <SectionHeading eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} highlightLast={2} />

          <div className="mt-5 sm:mt-8 grid grid-cols-2 gap-2.5 sm:gap-4">
            {contacts.map((c, i) => {
              const linkProps = c.href
                ? {
                    as: 'a',
                    href: c.href,
                    title:
                      c.label === 'Call us'
                        ? `Call HopeFairy Admission Helpdesk: ${site.phone}`
                        : c.label === 'WhatsApp'
                          ? 'Chat on WhatsApp with HopeFairy Education Counsellor'
                          : c.label === 'Email'
                            ? `Send an Inquiry Email to HopeFairy Admissions: ${site.email}`
                            : c.label,
                    'aria-label': c.label,
                    ...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
                  }
                : {};
              return (
                <Reveal key={c.label} i={i}>
                  <Card3D {...linkProps} tilt={6} className="items-center gap-2 sm:gap-4 p-2.5 sm:p-4">
                    <Lift depth="lg">
                      <span className="icon-3d h-8 w-8 sm:h-11 sm:w-11 rounded-xl shrink-0">
                        <Icon name={c.icon} className="h-4 w-4 sm:h-5 sm:w-5" />
                      </span>
                    </Lift>
                    <Lift depth="sm" className="min-w-0">
                      <span className="block text-[9.5px] sm:text-[0.7rem] uppercase tracking-[0.16em] text-fg-faint">{c.label}</span>
                      <span className="block text-xs sm:text-sm font-semibold leading-snug text-fg truncate sm:[overflow-wrap:anywhere]">{c.value}</span>
                    </Lift>
                  </Card3D>
                </Reveal>
              );
            })}
          </div>
        </div>

        <Reveal i={1}>
          <QueryForm source={source} />
        </Reveal>
      </div>
    </Section>
  );
}
