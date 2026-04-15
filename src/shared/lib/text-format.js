export function toTitleCase(value) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  return text.replace(
    /\b([A-Za-z])[A-Za-z']*/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
}
