import { formatLandingCount } from '@/application/landing/map-landing-public-response';
import { useAnimatedStatCount } from '../hooks/use-animated-stat-count';

/**
 * @param {'landing' | 'plain'} [format]
 * - landing: pakai formatLandingCount (mis. 12+, 1.2rb+)
 * - plain: angka bulat tanpa suffix marketing
 */
function formatAnimatedCount(display, format) {
  if (format === 'plain') {
    const value = Number(display);
    return Number.isFinite(value) ? String(Math.max(0, Math.round(value))) : '0';
  }
  return formatLandingCount(display);
}

/**
 * @param {{
 *   count: number;
 *   isRefreshing: boolean;
 *   staggerIndex?: number;
 *   suffix?: string;
 *   className?: string;
 *   format?: 'landing' | 'plain';
 * }} props
 */
export function LandingAnimatedStatValue({
  count,
  isRefreshing,
  staggerIndex = 0,
  suffix = '',
  className = '',
  format = 'landing',
}) {
  const display = useAnimatedStatCount(count, isRefreshing, staggerIndex * 90);
  return (
    <span
      className={`tabular-nums ${className}`.trim()}
      aria-live='polite'
      aria-busy={isRefreshing}
    >
      {formatAnimatedCount(display, format)}
      {suffix}
    </span>
  );
}
