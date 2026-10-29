import TiltCard from './TiltCard.jsx';

const SURFACES = {
  light: 'card-3d',
  gold: 'card-3d card-3d-gold',
  dark: 'card-3d card-3d-dark',
  none: '',
};

/**
 * The site's standard 3D card. At rest it reads as a physical slab (top
 * light, visible bottom edge, soft ground shadow — see .card-3d in
 * globals.css); on hover it tilts toward the pointer and any <Lift> layers
 * inside rise off the surface. Hover adds no extra shadow.
 *
 *   <Card3D as={Link} href="/x" className="flex-col p-6">
 *     <Lift depth="lg"><IconTile /></Lift>
 *     <Lift depth="sm"><h3>…</h3></Lift>
 *   </Card3D>
 *
 * @param {object} p
 * @param {React.ElementType} [p.as]  element/component to render (div, Link, SmartLink, a…)
 * @param {'light'|'gold'|'dark'|'none'} [p.surface]  'none' = bring your own background
 * @param {number} [p.tilt]  max tilt in degrees
 */
export default function Card3D({
  as: Cmp = 'div',
  surface = 'light',
  radius = 'rounded-2xl',
  tilt = 8,
  className = '',
  children,
  ...props
}) {
  return (
    <TiltCard className="h-full w-full flex flex-col flex-1" max={tilt} radius={radius}>
      <Cmp
        {...props}
        className={`group/card3d relative flex flex-1 h-full w-full transform-3d ${radius} ${SURFACES[surface]} ${className}`}
      >
        {children}
      </Cmp>
    </TiltCard>
  );
}

const DEPTHS = {
  sm: 'group-hover/card3d:translate-z-4',
  md: 'group-hover/card3d:translate-z-8',
  lg: 'group-hover/card3d:translate-z-12',
};

/**
 * A layer that lifts toward the viewer when its Card3D is hovered. Must be
 * a direct child of Card3D (or of another element with `transform-3d`) —
 * a plain wrapper in between flattens the 3D stack. For the same reason,
 * nothing between the card and a Lift may use overflow-hidden.
 */
export function Lift({ as: Cmp = 'div', depth = 'md', className = '', children, ...props }) {
  return (
    <Cmp
      {...props}
      className={`relative transition-[translate,scale] duration-500 ease-out ${DEPTHS[depth]} ${className}`}
    >
      {children}
    </Cmp>
  );
}
