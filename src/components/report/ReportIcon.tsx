const paths: Record<string, string> = {
  personality: 'M12 21V11 M12 14C4 14 3 8 3 3c6 0 10 2 9 8 M12 11c-1-6 3-9 9-9 0 6-3 10-9 10',
  career: 'M3 7h18v13H3z M8 7V4h8v3 M3 12c5 3 13 3 18 0 M10 13h4',
  money: 'M3 6h17v14H3z M3 6V4h14 M15 11h7v5h-7z M18 13.5h1',
  love: 'M12 21 3.5 12.5C-2 6 7 0 12 7c5-7 14-1 8.5 5.5z',
  social: 'M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M3 21v-3a6 6 0 0 1 12 0v3 M17 4a3 3 0 0 1 0 6 M17 13a5 5 0 0 1 5 5v3',
  balance: 'M12 2 21.5 9 18 20H6L2.5 9z M12 2v10 M21.5 9 12 12 18 20 M6 20l6-8-9.5-3',
  patterns: 'M3 6h7v12h11 M3 18h7V6h11 M18 3l3 3-3 3 M18 15l3 3-3 3',
  timeline: 'M4 5h16v16H4z M8 2v6 M16 2v6 M4 10h16 M8 14h2 M14 14h2 M8 18h2',
  'next-moves': 'M14 10a5 5 0 1 0-4 4 L4 20H2v-4l6-6 M16 5h.01',
  support: 'M4 12l5 5L20 6',
  caution: 'M12 3 22 21H2z M12 9v5 M12 17h.01',
}

export default function ReportIcon({ kind, className = '' }: { kind: string; className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[kind] ?? paths.personality} /></svg>
}
