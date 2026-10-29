import Link from 'next/link';
import Card3D, { Lift } from '../ui/Card3D.jsx';
import Icon from '../ui/Icon.jsx';
import { homeOnly } from '../../data/site.js';

export default function ServiceCard({ service, index = 0 }) {
  // While the site is homepage-only the service pages are hidden, so the
  const linkProps = homeOnly
    ? {}
    : {
        as: Link,
        prefetch: false,
        href: `/service/${service.slug}`,
        title: `Explore ${service.title} — ${service.short}`,
        'aria-label': `${service.title} study abroad advisory`,
      };
  return (
    <Card3D {...linkProps} tilt={8} className="flex-col p-3 sm:p-5 md:p-6 h-full justify-between">
      <div>
        <Lift depth="lg" className="flex items-center gap-2.5 sm:gap-3.5">
          <span className="icon-3d h-9 w-9 sm:h-12 sm:w-12 shrink-0 rounded-xl sm:rounded-2xl">
            <Icon name={service.icon} className="h-4.5 w-4.5 sm:h-6 sm:w-6" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <h3 className="text-xs sm:text-base md:text-lg font-bold text-fg leading-snug line-clamp-2" title={service.title}>
                {service.title}
              </h3>
              <span className="text-[10px] sm:text-xs tabular-nums text-fg-faint shrink-0 mt-0.5">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
          </div>
        </Lift>

        <Lift depth="sm" className="mt-2 sm:mt-3.5">
          <p className="text-[10.5px] sm:text-xs md:text-sm leading-snug sm:leading-relaxed text-fg-muted line-clamp-3 sm:line-clamp-none">
            {service.short}
          </p>
        </Lift>
      </div>

      {!homeOnly && (
        <Lift depth="sm" className="mt-2 sm:mt-auto pt-2 sm:pt-4">
          <span className="inline-flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm font-semibold text-brand-700 dark:text-brand-300">
            Learn more
            <Icon
              name="arrow-right"
              className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover/card3d:translate-x-1"
            />
          </span>
        </Lift>
      )}
    </Card3D>
  );
}
