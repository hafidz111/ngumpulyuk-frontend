/**
 * Scrollable content area for pages inside ChatFirstLayout.
 */
export function ChatFirstPageBody({ children, className = '' }) {
  return (
    <div
      className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-6 [scrollbar-gutter:stable] md:px-6 md:py-8 ${className}`.trim()}
    >
      <div className='mx-auto w-full max-w-6xl'>{children}</div>
    </div>
  );
}
