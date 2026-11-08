import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import DestinyCardArtwork from '../components/report/DestinyCardArtwork.tsx'
import type { DestinyCardData } from '../report/destiny-card.ts'
import { CARD_BACKGROUND, CARD_KEY, CARD_STARS, keyTurn } from '../report/card-motion.ts'

export function cardVideoMime(): string | null {
  if (typeof MediaRecorder === 'undefined') return null
  return ['video/mp4;codecs=avc1.42E01E', 'video/mp4'].find(type => MediaRecorder.isTypeSupported(type)) ?? null
}
export function saveCardBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob), a = document.createElement('a')
  a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30000)
}
async function dataUrl(path: string, signal: AbortSignal) {
  const response = await fetch(path, { signal })
  if (!response.ok) throw new Error('card_asset_unavailable')
  const blob = await response.blob()
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('card_asset_unavailable'))
    reader.readAsDataURL(blob)
  })
}
async function image(src: string) {
  const img = new Image(); img.src = src; await img.decode(); return img
}
/** Local rendering only: no name, birth details, or order keys go to a video service. */
export async function exportCard(card: DestinyCardData, format: 'png' | 'mp4', signal: AbortSignal, progress: (value: number) => void, preview = false, mode: 'test' | 'live' = 'test'): Promise<Blob> {
  const mime = format === 'mp4' ? cardVideoMime() : null
  if (format === 'mp4' && !mime) throw new Error('card_video_unsupported')
  signal.throwIfAborted()
  const [background, key] = await Promise.all([dataUrl(CARD_BACKGROUND, signal), dataUrl(CARD_KEY, signal)])
  const svg = renderToStaticMarkup(createElement(DestinyCardArtwork, { card, id: 'export', preview, artworkHref: background, keyHref: '', labels: { personal: 'MY PERSONAL KEY', element: 'ELEMENT', numbers: 'MY NUMBERS', colour: 'MY COLOUR', watermark: preview ? 'DESIGN SAMPLE' : mode === 'test' ? 'SANDBOX EDITION' : 'PERSONAL EDITION' } }))
  const baseUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
  try {
    const [base, keyImage] = await Promise.all([image(baseUrl), image(key)])
    signal.throwIfAborted()
    await document.fonts.ready
    const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1350
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('card_canvas_unavailable')
    const draw = (seconds: number, effects: boolean) => {
      ctx.clearRect(0, 0, 1080, 1350); ctx.drawImage(base, 0, 0)
      ctx.save(); ctx.translate(540, 505); ctx.scale(keyTurn(seconds), 1); ctx.drawImage(keyImage, -150, -225, 300, 450); ctx.restore()
      if (!effects) return
      ctx.save(); ctx.strokeStyle = '#fff2bd'; ctx.lineWidth = 5; ctx.shadowColor = '#ffe0a0'; ctx.shadowBlur = 10
      ctx.setLineDash([186, 2150]); ctx.lineDashOffset = -seconds / 8 * 4660
      ctx.beginPath(); ctx.roundRect(20, 20, 1040, 1310, 35); ctx.stroke(); ctx.restore()
      CARD_STARS.forEach(([x,y], i) => {
        ctx.save(); ctx.translate(x,y); ctx.globalAlpha = .15 + .85 * (1 - Math.cos(seconds * Math.PI * 2 / 3.8 + i % 4 * 1.5)) / 2
        ctx.fillStyle = '#ffe8a8'; ctx.shadowColor = '#ffdb8c'; ctx.shadowBlur = 12
        ctx.beginPath(); ctx.moveTo(0,-10); [[2,-2],[10,0],[2,2],[0,10],[-2,2],[-10,0],[-2,-2]].forEach(([px,py]) => ctx.lineTo(px,py)); ctx.closePath(); ctx.fill(); ctx.restore()
      })
      // Public samples always retain a visible mark above every animation layer.
      if (preview) { ctx.fillStyle = '#03111e'; ctx.fillRect(310, 760, 460, 44); ctx.fillStyle = '#fff0cc'; ctx.font = '24px Georgia'; ctx.textAlign = 'center'; ctx.fillText('DESIGN SAMPLE',540,790) }
    }
    draw(0, format === 'mp4')
    if (format === 'png') return await new Promise<Blob>((resolve,reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('card_encode_failed')), 'image/png'))
    if (document.hidden) throw new Error('card_keep_open')
    const stream = canvas.captureStream(0)
    try {
      return await new Promise<Blob>((resolve, reject) => {
        const recorder = new MediaRecorder(stream, { mimeType: mime!, videoBitsPerSecond: 5_000_000 })
        const chunks: Blob[] = []; let frame = 0, failure: Error | undefined
        const cleanup = () => { clearInterval(frame); clearTimeout(watchdog); signal.removeEventListener('abort', abort); document.removeEventListener('visibilitychange', visibility) }
        const stop = (error?: Error) => { failure = error; clearInterval(frame); if (recorder.state !== 'inactive') recorder.stop(); else { cleanup(); reject(error ?? new Error('card_encode_failed')) } }
        const abort = () => stop(new DOMException('Aborted', 'AbortError'))
        const visibility = () => { if (document.hidden) stop(new Error('card_keep_open')) }
        const watchdog = setTimeout(() => stop(new Error('card_encode_failed')), 20000)
        recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
        recorder.onerror = () => stop(new Error('card_encode_failed'))
        recorder.onstop = async () => { cleanup(); const blob = new Blob(chunks, { type: 'video/mp4' }); const header = await blob.slice(4,8).text(); if (failure || !blob.size || header !== 'ftyp') reject(failure ?? new Error('card_encode_failed')); else { progress(100); resolve(blob) } }
        signal.addEventListener('abort', abort, { once: true }); document.addEventListener('visibilitychange', visibility)
        if (signal.aborted) { abort(); return }
        const start = performance.now(); recorder.start(250)
        const track = stream.getVideoTracks()[0] as CanvasCaptureMediaStreamTrack
        track.requestFrame()
        const tick = () => { const seconds = Math.min((performance.now()-start)/1000, 6); draw(seconds, true); track.requestFrame(); progress(Math.round(seconds / 6 * 100)); if (seconds >= 6) stop() }
        frame = window.setInterval(tick, 1000 / 30)
      })
    } finally { stream.getTracks().forEach(track => track.stop()) }
  } finally { URL.revokeObjectURL(baseUrl) }
}
