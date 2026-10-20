import { readFile } from 'node:fs/promises'
import { PDFDocument, rgb } from 'pdf-lib'
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
  pdf.setTitle(report.title + ' | THE FATE KEY')
  pdf.setAuthor('THE FATE KEY')
  pdf.setSubject('Private Sandbox purchase report - ' + report.edition)
  const supported = new Set(font.getCharacterSet())
  const clean = (text: string) => Array.from(text.replace(/\*\*/g, '').replace(/[\u2010-\u2015]/g, '-'))
    .map(c => supported.has(c.codePointAt(0)!) ? c : c === '\t' ? ' ' : '?').join('')
  let page = pdf.addPage([595.28, 841.89]), y = 770
  const addPage = () => { page = pdf.addPage([595.28, 841.89]); y = 770 }
  const line = (text: string, size = 10.2, color = rgb(.15, .19, .24)) => {
    if (y < 70) addPage()
    page.drawText(text, { x: 48, y, size, font, color }); y -= size * 1.55
  }
  const paragraph = (text: string, size = 10.2) => {
    let current = ''
    for (const word of clean(text).split(/\s+/)) {
      const proposed = current ? current + ' ' + word : word
      if (font.widthOfTextAtSize(proposed, size) > 498 && current) { line(current, size); current = word }
      else current = proposed
    }
    if (current) line(current, size)
    y -= 7
  }
  line('THE FATE KEY', 24, rgb(.19, .30, .29)); y -= 12
  paragraph(report.title, 20)
  paragraph('SANDBOX PURCHASE - Test payment only. No real money charged.', 10)
  paragraph(`Order ${orderId} | Edition ${report.edition}`, 8)
  paragraph(`Issued ${report.issuedAt.slice(0, 10)} | Private personal reading`, 8)
  y -= 12
  for (const block of report.text.split(/\n+/)) {
    const value = block.trim()
    if (!value) continue
    const heading = /^(\d{2} [·-]|THE FATE KEY|Report edition|From the chart:|Your Ten-Year)/.test(value)
    if (heading && y < 130) addPage()
    paragraph(value, heading ? 12 : 10.2)
  }
  report.cards.forEach((card, index) => {
    addPage()
    line('YOUR PERSONAL DESTINY CARD', 17, rgb(.19, .30, .29)); y -= 30
    paragraph(report.cards.length === 2 ? `Person ${index === 0 ? 'A' : 'B'}` : card.displayName, 12)
    paragraph(card.title, 24); paragraph(card.daySymbol, 16); paragraph(card.sentence, 13)
    paragraph(`${card.element} | Symbolic numbers: ${card.numbers.join(' and ')}`, 12)
    paragraph('Symbolic colours: ' + card.colors.map(c => c.name).join(', '), 12)
    y -= 12; paragraph('A cultural keepsake for personal reflection. Symbolic numbers and colours do not predict luck or outcomes.', 10)
  })
  const pages = pdf.getPages()
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: 48, y: 48 }, end: { x: 547, y: 48 }, color: rgb(.76, .79, .79), thickness: .5 })
    p.drawText(`THE FATE KEY  |  Private Sandbox report  |  ${i + 1} / ${pages.length}`, { x: 48, y: 33, size: 8, font, color: rgb(.35, .40, .42) })
  })
  return pdf.save()
}
