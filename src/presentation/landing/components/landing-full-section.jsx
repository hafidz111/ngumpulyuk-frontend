import { cn } from '@/lib/utils';

/** @type {Record<string, string>} */
const VARIANT_CLASS = {
  surface: 'bg-surface',
  'surface-low': 'bg-surface-low',
};

/**
 * @param {{
 *   id?: string;
 *   variant?: keyof typeof VARIANT_CLASS;
 *   className?: string;
 *   children: import('react').ReactNode;
 * }} props
 */
export function LandingFullSection({
  id,
  variant = 'surface',
  className,
  children,
}) {
  return (
    <section
      id={id}
      className={cn('py-20 md:py-28', VARIANT_CLASS[variant] ?? VARIANT_CLASS.surface, className)}
    >
      {children}
    </section>
  );
}

/**
 * @param {{ className?: string; children: import('react').ReactNode }} props
 */
export function LandingFullSectionInner({ className, children }) {
  return <div className={cn('mx-auto max-w-7xl px-6 md:px-8', className)}>{children}</div>;
}
