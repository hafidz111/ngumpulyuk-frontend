/**
 * @param {number} currentPage
 * @param {number} totalPages
 * @returns {Array<{ type: 'page'; n: number } | { type: 'ellipsis'; key: string }>}
 */
export function getVisiblePageNumbers(currentPage, totalPages) {
  const out = [];
  if (totalPages < 1) return out;
  if (totalPages === 1) {
    out.push({ type: 'page', n: 1 });
    return out;
  }
  if (totalPages <= 9) {
    for (let i = 1; i <= totalPages; i += 1) {
      out.push({ type: 'page', n: i });
    }
    return out;
  }

  out.push({ type: 'page', n: 1 });
  const start = Math.max(2, currentPage - 2);
  const end = Math.min(totalPages - 1, currentPage + 2);
  if (start > 2) {
    out.push({ type: 'ellipsis', key: 'start' });
  }
  for (let i = start; i <= end; i += 1) {
    out.push({ type: 'page', n: i });
  }
  if (end < totalPages - 1) {
    out.push({ type: 'ellipsis', key: 'end' });
  }
  out.push({ type: 'page', n: totalPages });
  return out;
}
