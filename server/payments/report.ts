import { readFile } from 'node:fs/promises'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { calculateSaju } from '../../packages/core/src/saju.ts'
import { buildCompleteReading, REPORT_EDITION } from '../../src/report/complete-reading.ts'
import { buildBundleReading, buildCategoryReading } from '../../src/report/category-readings.ts'
import { buildDestinyCard } from '../../src/report/destiny-card.ts'
import { plainReadingText } from '../../src/report/reading-text.ts'
import { previewProduct } from '../../src/report/personal-products.ts'
import type { OrderInput } from './input.ts'

export interface BuyerReport {
  title: string
  kind: OrderInput['kind']
  edition: string
  issuedAt: string
  text: string
  documents: string[]
  cards: ReturnType<typeof buildDestinyCard>[]
  pdf: string
}
let fontBytes: Promise<Buffer> | undefined
/** All report content is calculated from the encrypted order, never from the return URL. */
export async function issueReport(input: OrderInput, orderId: string, referenceYear: number): Promise<BuyerReport> {
  const a = calculateSaju(input.first), b = input.second ? calculateSaju(input.second) : undefined
  let text: string, documents: string[]
  if (input.kind === 'complete') {
    const reading = buildCompleteReading(a, referenceYear)
    text = reading.fullText; documents = [reading.title]
  } else if (input.kind === 'bundle') {
    if (!b) throw new Error('Missing second chart')
    const reading = buildBundleReading(a, b, input.year!, referenceYear)
    text = reading.fullText; documents = [reading.complete.title, reading.compatibility.title, reading.annual.title]
  } else {
    const reading = buildCategoryReading(input.kind, a, { second: b, year: input.year ?? referenceYear })
    text = reading.fullText; documents = [reading.title]
  }
  const report: BuyerReport = {
    title: previewProduct(input.kind).title, kind: input.kind, edition: REPORT_EDITION,
    issuedAt: new Date().toISOString(), text: plainReadingText(text), documents,
    cards: [buildDestinyCard(input.first), ...(input.second ? [buildDestinyCard(input.second)] : [])], pdf: '',
  }
  const pdf = await reportPdf(report, orderId)
  report.pdf = Buffer.from(pdf).toString('base64')
  return report
}

async function reportPdf(report: BuyerReport, orderId: string) {
  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  fontBytes ??= readFile(new URL('./assets/NotoSansSC-Report.ttf', import.meta.url))
  const font = await pdf.embedFont(await fontBytes, { subset: true })
  const display = await pdf.embedFont(StandardFonts.TimesRoman)
  const italic = await pdf.embedFont(StandardFonts.TimesRomanItalic)
  pdf.setTitle(report.title + ' | THE FATE KEY')
  pdf.setAuthor('THE FATE KEY')
  pdf.setSubject('Private Sandbox purchase report - ' + report.edition)
  const supported = new Set(font.getCharacterSet())
  const clean = (text: string) => Array.from(text.replace(/\*\*/g, '').replace(/[\u2010-\u2015]/g, '-'))
    .map(c => supported.has(c.codePointAt(0)!) ? c : c === '\t' ? ' ' : '?').join('')
  const W = 595.28, H = 841.89
  const night = rgb(.07, .10, .17), gold = rgb(.65, .51, .28), paper = rgb(.98, .96, .91)
  const ink = rgb(.17, .20, .25), muted = rgb(.36, .38, .41)
  let page = pdf.addPage([W, H]), y = 748
  let textX = 54, textWidth = W - 108
  const centre = (text: string, yy: number, size: number, color = gold, face = display) => {
    page.drawText(text, { x: (W - face.widthOfTextAtSize(text, size)) / 2, y: yy, size, font: face, color })
  }
  const key = (x: number, yy: number, scale = 1) => {
    page.drawCircle({ x, y: yy, size: 17 * scale, borderColor: gold, borderWidth: 1.6 })
    page.drawCircle({ x, y: yy, size: 9 * scale, borderColor: gold, borderWidth: .6 })
    page.drawLine({ start: { x, y: yy - 17 * scale }, end: { x, y: yy - 89 * scale }, color: gold, thickness: 2 })
    for (const d of [65, 80]) page.drawLine({ start: { x, y: yy - d * scale }, end: { x: x + 15 * scale, y: yy - d * scale }, color: gold, thickness: 2 })
  }
  const frame = (dark = false) => {
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: dark ? night : paper })
    page.drawRectangle({ x: 28, y: 28, width: W - 56, height: H - 56, borderColor: gold, borderWidth: .6 })
    page.drawRectangle({ x: 33, y: 33, width: W - 66, height: H - 66, borderColor: gold, borderWidth: .2 })
  }
  const addPage = () => {
    page = pdf.addPage([W, H]); y = 748; frame()
    page.drawText('THE FATE KEY', { x: 54, y: 786, size: 9, font: display, color: gold })
    page.drawLine({ start: { x: 54, y: 774 }, end: { x: W - 54, y: 774 }, thickness: .4, color: gold })
  }
  const line = (text: string, size = 10.4, color = ink) => {
    if (y < 83) addPage()
    page.drawText(text, { x: textX, y, size, font, color }); y -= size * 1.65
  }
  const paragraph = (text: string, size = 10.4, color = ink) => {
    let current = ''
    for (const word of clean(text).split(/\s+/)) {
      const proposed = current ? current + ' ' + word : word
      if (font.widthOfTextAtSize(proposed, size) > textWidth && current) { line(current, size, color); current = word }
      else current = proposed
    }
    if (current) line(current, size, color)
    y -= 9
  }
  // A private letter, with honest Sandbox labelling kept separate from the story.
  frame(true)
  centre('THE FATE KEY', 744, 17)
  centre('A LETTER FROM YOUR CHART', 708, 10)
  page.drawCircle({ x: W / 2, y: 610, size: 33, color: gold })
  page.drawCircle({ x: W / 2 + 14, y: 620, size: 30, color: night })
  key(W / 2, 529, 1.1)
  for (const [x, yy] of [[130, 625], [443, 580], [168, 475], [412, 690]]) {
    page.drawLine({ start: { x: x - 4, y: yy }, end: { x: x + 4, y: yy }, color: gold, thickness: .6 })
    page.drawLine({ start: { x, y: yy - 4 }, end: { x, y: yy + 4 }, color: gold, thickness: .6 })
  }
  const words = report.title.split(' '); let titleLine = '', titleY = 367
  for (const word of words) {
    const candidate = titleLine ? titleLine + ' ' + word : word
    if (display.widthOfTextAtSize(candidate, 29) > W - 120 && titleLine) { centre(titleLine, titleY, 29, paper); titleY -= 37; titleLine = word }
    else titleLine = candidate
  }
  centre(titleLine, titleY, 29, paper)
  centre('A little clarity for the road ahead.', 245, 16, paper, italic)
  centre('Prepared from the birth details inside', 194, 10, paper, display)
  centre('Edition ' + report.edition + ' / ' + report.issuedAt.slice(0, 10), 163, 9)
  centre('SANDBOX TEST / No real payment charged', 83, 9, paper, display)
  addPage()
  centre('Dear reader,', 720, 27, ink, italic); y = 668
  paragraph('Some parts of your story may feel familiar. Others may give you a new way to look at a choice, a relationship or the work you do every day.', 12)
  paragraph('This letter follows the patterns in your Saju chart. Read slowly, notice what feels relevant, and leave room for the life you know better than any report can.', 12)
  paragraph('The chart notes explain where each interpretation begins. You can return to them whenever you want to look more closely.', 12)
  y -= 25; paragraph('With care,', 13); paragraph('THE FATE KEY', 16, gold)
  y -= 25; paragraph('Your reading follows on the next page.', 10, muted)
  addPage()
  for (const block of report.text.split(/\n+/)) {
    const value = block.trim()
    if (!value) continue
    const heading = /^(\d{2} [·-]|THE FATE KEY|Your Ten-Year|Your Everyday Compass|Symbolic colours & numbers|Chart terms in plain English|How this reading is prepared)/.test(value)
    const note = /^(From (your|the) chart:|Why this focus:|Report edition|Sources|Method|Calculated start:)/.test(value)
    if (heading && y < 650) addPage()
    if (heading) { y -= 10; paragraph(value, 16, gold); y -= 5 }
    else paragraph(value, note ? 9.2 : 10.4, note ? muted : ink)
  }
  report.cards.forEach((card, index) => {
    addPage()
    centre('YOUR PERSONAL DESTINY CARD', 721, 12)
    page.drawRectangle({ x: 86, y: 245, width: W - 172, height: 425, color: night, borderColor: gold, borderWidth: 1 })
    key(W / 2, 603, .65)
    centre(report.cards.length === 2 ? `Person ${index === 0 ? 'A' : 'B'}` : 'Your personal keepsake', 480, 12)
    centre(card.title, 440, 25, paper)
    // Keep card copy on a parchment inset for reliable contrast and wrapping.
    page.drawRectangle({ x: 101, y: 270, width: W - 202, height: 137, color: paper })
    textX = 118; textWidth = W - 236
    y = 376; paragraph(card.daySymbol, 14); paragraph(card.sentence, 11)
    textX = 54; textWidth = W - 108
    y = 207
    paragraph(`${card.element} | Symbolic numbers: ${card.numbers.join(' and ')}`, 11)
    paragraph('Symbolic colours: ' + card.colors.map(c => c.name).join(', '), 11)
    paragraph('A cultural keepsake for personal reflection.', 10, muted)
  })
  addPage()
  centre('The letter ends. Your story continues.', 685, 25, ink, italic)
  y = 618
  paragraph('You do not have to act on every page. Keep the passage that helped you understand yourself a little more clearly, and come back when another part of life asks for your attention.', 12)
  paragraph('With care, THE FATE KEY', 12, gold)
  const sealY = 370
  page.drawCircle({ x: W / 2, y: sealY, size: 73, color: rgb(.35, .12, .16), borderColor: gold, borderWidth: 2 })
  page.drawCircle({ x: W / 2, y: sealY, size: 65, borderColor: gold, borderWidth: .7 })
  centre('THE FATE KEY', sealY + 34, 12, paper)
  key(W / 2 - 2, sealY + 12, .40)
  centre('PRIVATE EDITION', sealY - 44, 9, paper)
  centre('Issued by THE FATE KEY', 248, 12, ink)
  y = 207
  paragraph('Report reference: ' + orderId, 9, muted)
  paragraph('Edition ' + report.edition + ' | Issued ' + report.issuedAt.slice(0, 10), 9, muted)
  paragraph('The seal identifies the publisher; it is not an external certification.', 9, muted)
  paragraph('SANDBOX PURCHASE - Test payment only. No real money charged.', 9, muted)
  const pages = pdf.getPages()
  pages.forEach((p, i) => {
    if (i === 0) return
    p.drawLine({ start: { x: 54, y: 63 }, end: { x: W - 54, y: 63 }, color: gold, thickness: .4 })
    p.drawText(`THE FATE KEY | PRIVATE LETTER | ${i + 1} / ${pages.length}`, { x: 54, y: 47, size: 8, font, color: muted })
  })
  return pdf.save()
}
