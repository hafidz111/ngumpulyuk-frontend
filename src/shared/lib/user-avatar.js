/** @param {string} name */
export function userInitialFromName(name) {
  const first = String(name || '').trim().charAt(0).toUpperCase();
  return first || 'U';
}

/** @param {string} identity */
export function userAvatarColorClass(identity) {
  const palette = [
    'bg-rose-200 text-rose-900',
    'bg-sky-200 text-sky-900',
    'bg-emerald-200 text-emerald-900',
    'bg-amber-200 text-amber-900',
    'bg-violet-200 text-violet-900',
    'bg-fuchsia-200 text-fuchsia-900',
    'bg-cyan-200 text-cyan-900',
  ];
  const source = String(identity || 'user');
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash + source.charCodeAt(i)) % 9973;
  }
  return palette[hash % palette.length];
}
