export const CARD_BACKGROUND = '/images/cards/destiny-background-v2.webp'
export const CARD_KEY = '/images/cards/destiny-key-v2.png'
export const CARD_STARS = [[112,350],[221,481],[315,342],[762,368],[948,454],[860,660],[156,729],[728,756],[422,309],[989,795],[87,575],[925,307]] as const
/** One full turn in six seconds, also used by the downloaded video. */
export function keyTurn(seconds: number) { const scale = Math.cos(seconds * Math.PI / 3); return Math.abs(scale) < .025 ? (scale < 0 ? -.025 : .025) : scale }
