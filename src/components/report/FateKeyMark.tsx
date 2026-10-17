/** A small vector ornament echoing the star and scrollwork of our cover key. */
export default function FateKeyMark({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 60 124" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M30 3c-7 8-6 12 0 16 6-4 7-8 0-16Z M30 14v8" />
    <circle cx="30" cy="40" r="22" /><circle cx="30" cy="40" r="17" />
    <path d="m30 27 2.5 10.5L43 40l-10.5 2.5L30 53l-2.5-10.5L17 40l10.5-2.5Z M30 23v4 M47 40h4 M9 40h4 M30 53v5" />
    <path d="M10 52c-8 10 3 23 12 17 6-4 0-11-4-7-3 3 1 5 3 4 M50 52c8 10-3 23-12 17-6-4 0-11 4-7 3 3-1 5-3 4 M21 65l9 13 9-13 M26 77h8v5h-8Z M27 82h6v33l-3 6-3-6Z M33 96h13v5h-8v7h8v5H33 M25 88h10" />
    <path d="m7 25 1.5 3.5L12 30l-3.5 1.5L7 35l-1.5-3.5L2 30l3.5-1.5Z m46 0 1.5 3.5L58 30l-3.5 1.5L53 35l-1.5-3.5L48 30l3.5-1.5Z" strokeWidth="1" />
  </svg>
}
