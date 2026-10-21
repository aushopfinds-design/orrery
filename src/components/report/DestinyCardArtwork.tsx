// Keep the screen import stable; the shared implementation is plain TypeScript
// so the serverless dependency tracer includes its compiled JavaScript.
export { default } from './destiny-card-artwork.ts'
export type { DestinyCardLabels } from './destiny-card-artwork.ts'
