import { customerDeliveryText } from '../../src/report/customer-delivery.ts'
import { reportReference } from '../../src/report/report-reference.ts'
import type { ReportCertificate } from '../../src/report/report-reference.ts'
import sharp from 'sharp'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import DestinyCardArtwork from '../../src/components/report/destiny-card-artwork.ts'
import { readFile } from 'node:fs/promises'
import { PDFDocument, rgb, StandardFonts, pushGraphicsState, popGraphicsState, rectangle, clip, endPath } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { calculateSaju } from '../../packages/core/src/saju.ts'
import { buildCompleteReading, REPORT_EDITION } from '../../src/report/complete-reading.ts'
import { buildBundleReading, buildCategoryReading } from '../../src/report/category-readings.ts'
import { buildDestinyCard } from '../../src/report/destiny-card.ts'
import { plainReadingText, readingTextParts } from '../../src/report/reading-text.ts'
import { previewProduct } from '../../src/report/personal-products.ts'
import { careerMoneyChartData } from '../../src/report/career-money-charts.ts'
import type { OrderInput } from './input.ts'

export interface BuyerReport {
  title: string
  reference?: string
  certificates?: ReportCertificate[]
  recipientName?: string
  kind: OrderInput['kind']
  edition: string
  issuedAt: string
  text: string
  emphasis?: string[]
  documents: string[]
  cards: ReturnType<typeof buildDestinyCard>[]
  pdf: string
  careerCharts?: ReturnType<typeof careerMoneyChartData>
}
let fontBytes: Promise<Buffer> | undefined
let artworkBytes: Promise<Buffer> | undefined
let cardArtData: Promise<string> | undefined
let cardKeyData: Promise<string> | undefined

/** Keep authored emphasis even though the saved plain-text report omits Markdown. */
export function reportEmphasis(source: unknown): string[] {
  const phrases = new Set<string>()
  const visit = (value: unknown, key = '') => {
    if (typeof value === 'string') {
      for (const part of readingTextParts(value)) if (part.bold) phrases.add(part.text)
      if (key === 'tryThis' || key === 'firstStep') phrases.add(plainReadingText(value))
    } else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) visit(v, k)
    }
  }
  visit(source)
  return [...phrases].filter(x => x.length >= 6 && x.length <= 240)
}
/** All report content is calculated from the encrypted order, never from the return URL. */
export async function issueReport(input: OrderInput, orderId: string, referenceYear: number, mode: 'test' | 'live' = 'test'): Promise<BuyerReport> {
  const a = calculateSaju(input.first), b = input.second ? calculateSaju(input.second) : undefined
  let text: string, documents: string[], source: unknown
  if (input.kind === 'complete') {
    const reading = buildCompleteReading(a, referenceYear)
    source = reading; text = reading.fullText; documents = [reading.title]
  } else if (input.kind === 'bundle') {
    if (!b) throw new Error('Missing second chart')
    const reading = buildBundleReading(a, b, input.year!, referenceYear)
    source = reading; text = reading.fullText; documents = [reading.complete.title, reading.compatibility.title, reading.annual.title]
  } else {
    const reading = buildCategoryReading(input.kind, a, { second: b, year: input.year ?? referenceYear })
    source = reading; text = reading.fullText; documents = [reading.title]
  }
  const certificates = documents.map((title,index) => ({ title, number: reportReference(orderId, referenceYear, index + 1) }))
  const reference = input.kind === 'bundle' ? reportReference(orderId, referenceYear, 0) : certificates[0].number
  for (const certificate of certificates) {
    const heading = 'THE FATE KEY · ' + certificate.title
    text = text.replace(heading + '\n\n', heading + '\n\nReport ID: ' + certificate.number + '\n\n')
  }
  if (input.kind === 'bundle') text = text.replace('THE FATE KEY · Your Destiny Collection\n\n', 'THE FATE KEY · Your Destiny Collection\n\nCollection ID: ' + reference + '\n\n')
  const report: BuyerReport = {
    title: previewProduct(input.kind).title, kind: input.kind, edition: REPORT_EDITION, reference, certificates,
    ...(input.recipientName ? { recipientName: input.recipientName } : {}),
    issuedAt: new Date().toISOString(), text: customerDeliveryText(plainReadingText(text)), emphasis: reportEmphasis(source), documents,
    cards: [buildDestinyCard(input.first, input.recipientName ?? ''), ...(input.second ? [buildDestinyCard(input.second, 'Person B')] : [])], pdf: '',
    ...(input.kind === 'career' ? { careerCharts: careerMoneyChartData(a, referenceYear) } : {}),
  }
  const pdf = await reportPdf(report, orderId, reportEmphasis(source), mode)
  report.pdf = Buffer.from(pdf).toString('base64')
  return report
}

async function reportPdf(report: BuyerReport, orderId: string, emphasis: string[], mode: 'test' | 'live') {
  const pdf = await PDFDocument.create()
  pdf.registerFontkit(fontkit)
  fontBytes ??= readFile(new URL('./assets/NotoSansSC-Report.ttf', import.meta.url))
  const font = await pdf.embedFont(await fontBytes, { subset: true })
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold)
  const boldCharacters = new Set(boldFont.getCharacterSet())
  artworkBytes ??= readFile(new URL('./assets/HomepageArtwork.jpg', import.meta.url))
  const artwork = await pdf.embedJpg(await artworkBytes)
  const display = await pdf.embedFont(StandardFonts.TimesRoman)
  const italic = await pdf.embedFont(StandardFonts.TimesRomanItalic)
  pdf.setTitle(report.title + ' | THE FATE KEY')
  pdf.setAuthor('THE FATE KEY')
  pdf.setSubject((mode === 'test' ? 'Private Sandbox purchase report - ' : 'Purchased report - ') + report.edition + (report.reference ? ' | ' + report.reference : ''))
  const supported = new Set(font.getCharacterSet())
  const clean = (text: string) => Array.from(text.replace(/\*\*/g, '').replace(/[\u2010-\u2015]/g, '-'))
    .map(c => supported.has(c.codePointAt(0)!) ? c : c === '\t' ? ' ' : '?').join('')
  const phrases = [...new Set(emphasis.map(clean))].sort((a, b) => b.length - a.length)
  const emphasisPattern = phrases.length ? new RegExp(phrases.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g') : undefined
  const W = 595.28, H = 841.89
  const night = rgb(.07, .10, .17), gold = rgb(.65, .51, .28), paper = rgb(.98, .96, .91)
  const ink = rgb(.17, .20, .25), muted = rgb(.36, .38, .41)
  let page = pdf.addPage([W, H]), y = 748
  const textX = 54, textWidth = W - 108
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
    if (!dark) {
      // Vector ornament remains faint behind type and crisp at print resolution.
      const star = (x: number, yy: number, r: number, opacity = .17) => {
        page.drawLine({ start: { x: x - r, y: yy }, end: { x: x + r, y: yy }, color: gold, thickness: .6, opacity })
        page.drawLine({ start: { x, y: yy - r }, end: { x, y: yy + r }, color: gold, thickness: .6, opacity })
        page.drawCircle({ x, y: yy, size: 1.1, color: gold, opacity })
      }
      for (const x of [43, W - 43]) {
        for (const yy of [92, H - 92]) {
          star(x, yy, 7, .72)
          for (const d of [-17, 17]) page.drawCircle({ x, y: yy + d, size: 2.4, borderColor: gold, borderWidth: .4, borderOpacity: .55 })
        }
        for (let yy = 138; yy < H - 130; yy += 71) {
          star(x, yy, 3.4, .52)
          page.drawCircle({ x, y: yy + 26, size: .65, color: gold, opacity: .48 })
        }
      }
      // A quiet celestial medallion, visible through the parchment rather than over it.
      for (const radius of [113, 121, 148]) page.drawCircle({ x: W / 2, y: H / 2, size: radius, borderColor: gold, borderWidth: .7, borderOpacity: .28 })
      for (let i = 0; i < 12; i++) {
        const angle = i * Math.PI / 6
        const x = W / 2 + Math.cos(angle) * 135, yy = H / 2 + Math.sin(angle) * 135
        star(x, yy, i % 3 === 0 ? 8 : 3, .28)
      }
      page.drawCircle({ x: W / 2, y: H / 2 + 24, size: 32, borderColor: gold, borderWidth: 1, borderOpacity: .28 })
      page.drawLine({ start: { x: W / 2, y: H / 2 - 8 }, end: { x: W / 2, y: H / 2 - 83 }, color: gold, thickness: 1, opacity: .28 })
      for (const offset of [60, 75]) page.drawLine({ start: { x: W / 2, y: H / 2 - offset }, end: { x: W / 2 + 18, y: H / 2 - offset }, color: gold, thickness: 1, opacity: .28 })
    }
  }
  const addPage = () => {
    page = pdf.addPage([W, H]); y = 748; frame()
    page.drawText('THE FATE KEY', { x: 54, y: 786, size: 9, font: display, color: gold })
    page.drawLine({ start: { x: 54, y: 774 }, end: { x: W - 54, y: 774 }, thickness: .4, color: gold })
  }
  const paragraph = (text: string, size = 12.4, color = ink, emphasise = false) => {
    const value = clean(text)
    const parts: { text: string; bold: boolean }[] = []
    let last = 0
    if (emphasise && emphasisPattern) {
      emphasisPattern.lastIndex = 0
      for (const match of value.matchAll(emphasisPattern)) {
        if (match.index! > last) parts.push({ text: value.slice(last, match.index), bold: false })
        parts.push({ text: match[0], bold: true }); last = match.index! + match[0].length
      }
    }
    if (last < value.length) parts.push({ text: value.slice(last), bold: false })
    let runs: { text: string; face: typeof font }[] = [], width = 0
    const flush = () => {
      if (!runs.length) return
      if (y < 83) addPage()
      let x = textX
      for (const run of runs) {
        page.drawText(run.text, { x, y, size, font: run.face, color })
        x += run.face.widthOfTextAtSize(run.text, size)
      }
      y -= size * (size === 12.4 ? 1.72 : 1.65); runs = []; width = 0
    }
    for (const part of parts) {
      for (const token of part.text.match(/\S+|\s+/g) ?? []) {
        if (!width && !token.trim()) continue
        const face = part.bold && (token.trim() === '' || [...token].every(c => boldCharacters.has(c.codePointAt(0)!))) ? boldFont : font
        const tokenWidth = face.widthOfTextAtSize(token, size)
        if (width + tokenWidth > textWidth && width) {
          flush()
          if (!token.trim()) continue
        }
        const previous = runs.at(-1)
        if (previous?.face === face) previous.text += token
        else runs.push({ text: token, face })
        width += tokenWidth
      }
    }
    flush(); y -= 9
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
  if (report.reference) centre(report.reference, 135, 8, gold, font)
  centre(mode === 'test' ? 'SANDBOX TEST / No real payment charged' : 'YOUR PRIVATE READING', 83, 9, paper, display)
  addPage()
  const greeting = report.recipientName ? clean(`Dear ${report.recipientName},`) : 'Dear reader,'
  const greetingSize = Math.min(27, (W - 108) / font.widthOfTextAtSize(greeting, 1))
  centre(greeting, 720, greetingSize, ink, report.recipientName ? font : italic); y = 668
  paragraph('Some parts of your story may feel familiar. Others may give you a new way to look at a choice, a relationship or the work you do every day.', 12)
  paragraph('This letter follows the patterns in your Saju chart. Read slowly, notice what feels relevant, and leave room for the life you know better than any report can.', 12)
  paragraph('The chart notes explain where each interpretation begins. You can return to them whenever you want to look more closely.', 12)
  y -= 25; paragraph('With care,', 13); paragraph('THE FATE KEY', 16, gold)
  y -= 25; paragraph('Your reading follows on the next page.', 10, muted)
  addPage()
  let inAppendix = false
  const blocks = report.text.split(/\n+/).map(block => block.trim()).filter(Boolean)
  for (const [blockIndex, block] of blocks.entries()) {
    const value = block.trim()
    if (!value) continue
    if (/^THE FATE KEY · /.test(value)) inAppendix = false
    if (value === 'Calculation notes') { inAppendix = true; if (y < 650) addPage() }
    // A two-person header must not consume the space reserved for five key answers.
    if (value === 'Your reading at a glance') {
      const answerHeight = blocks.slice(blockIndex + 1, blockIndex + 6).reduce((height, answer) => {
        let lines = 1, width = 0
        for (const word of clean(answer).split(/\s+/)) {
          const next = font.widthOfTextAtSize(word + ' ', 11.4)
          if (width + next > textWidth && width) { lines++; width = 0 }
          width += next
        }
        return height + lines * 11.4 * 1.72 + 9
      }, 70)
      if (y - answerHeight < 83) addPage()
    }
    const heading = /^(\d{2} [·-]|THE FATE KEY|Your Ten-Year|Your reading at a glance|Your Everyday Compass|Calculation notes|Symbolic colours & numbers|Chart terms in plain English|How this reading is prepared)/.test(value)
    const note = inAppendix || /^(From (your|the) chart:|Why this focus:|Report edition|Sources|Method|Calculated start:)/.test(value)
    if (heading && !inAppendix && value !== 'Your reading at a glance' && y < 650) addPage()
    if (heading) { y -= 10; paragraph(value, 16, gold); y -= 5 }
    else paragraph(value, note ? 10.2 : 12.4, note ? muted : ink, !note)
  }
  if (report.kind === 'career' && report.careerCharts) {
    const charts = report.careerCharts
    const section = (title: string, subtitle: string) => {
      addPage(); paragraph(title, 16, gold); paragraph(subtitle, 9.6, muted)
    }
    section('Career & Money Chart Appendix', 'Labels describe calculated chart relationships; they are not scores or income predictions.')
    paragraph('Four Pillars', 13, gold)
    for (const pillar of charts.pillars) paragraph(`${pillar.position}: ${pillar.ganzi} | stem ${pillar.stemGod} | branch ${pillar.branchGod} | hidden ${pillar.hidden.map(item => item.god).join(', ') || 'none listed'}`, 9.6, ink)
    paragraph(`Day Master: ${charts.dayMaster} | strength: ${charts.strength}`, 10)
    paragraph(charts.strengthEvidence.join(' '), 9.6, muted)
    paragraph('Visible Five Elements (exposed stems and branches)', 13, gold)
    paragraph(charts.elements.map(item => `${item.element} ${item.count}`).join('  ·  ') + `  |  ${charts.elementTotal} counted markers`, 10)
    y -= 8
    const elementPalette: Record<string, ReturnType<typeof rgb>> = { Wood: rgb(.25,.43,.34), Fire: rgb(.65,.32,.28), Earth: rgb(.65,.51,.28), Metal: rgb(.39,.46,.51), Water: rgb(.20,.32,.49) }
    const maxElement = Math.max(1, ...charts.elements.map(item => item.count))
    for (const [index, item] of charts.elements.entries()) {
      const yy = y - index * 25
      page.drawText(item.element, { x: textX, y: yy, size: 9, font, color: ink })
      page.drawRectangle({ x: textX + 70, y: yy - 1, width: 290, height: 10, color: rgb(.91,.89,.83) })
      if (item.count) page.drawRectangle({ x: textX + 70, y: yy - 1, width: 290 * item.count / maxElement, height: 10, color: elementPalette[item.element] ?? gold })
      page.drawText(String(item.count), { x: textX + 372, y: yy, size: 9, font, color: ink })
    }
    y -= charts.elements.length * 25 + 10
    section('Ten Gods & Money Structure', 'Visible and hidden counts are kept separate. A count is not a fortune score.')
    for (const item of charts.visibleCounts.filter(row => row.count)) paragraph(`${item.label}: ${item.count} visible`, 10)
    for (const item of charts.hiddenCounts.filter(row => row.count)) paragraph(`${item.label}: ${item.count} hidden`, 10)
    paragraph(`Visible money markers: ${charts.moneyEvidence.map(item => `${item.label} (${item.source})`).join('; ') || 'none in the available visible positions'}`, 9.6)
    paragraph(`Hidden money markers: ${charts.hiddenMoneyEvidence.map(item => `${item.label} (${item.source})`).join('; ') || 'none in the listed hidden stems'}`, 9.6)
    paragraph('Checked income routes', 13, gold)
    for (const route of charts.incomeRoutes) paragraph(`${route.from} → ${route.to}: ${route.present ? route.gods.join(', ') || 'route detected' : 'not detected in the checked structure'}`, 9.6)
    paragraph(charts.structureStatus, 9.6, muted)
    section('Employment & Independent Work Signals', 'Signals reflect principal positions in this chart and do not promise an outcome.')
    for (const signal of [...charts.employmentSignals, ...charts.independentSignals]) paragraph(`${signal.label}: ${signal.note}`, 10)
    section('Ten-Year Cycle Timeline', charts.caveat)
    for (const cycle of charts.cycles) paragraph(`${cycle.span} · ${cycle.ganzi} · ${cycle.stemGod} / ${cycle.branchGod}. Work: ${cycle.workTheme}. Money: ${cycle.moneyTheme}. ${cycle.relation}`, 9.6)
    section('Year-by-Year Outlook', 'Annual pillars and checked relationships are interpretive themes, not event or income forecasts.')
    for (const year of charts.years) paragraph(`${year.year} · ${year.pillar} · ${year.stemGod} / ${year.branchGod}. Work: ${year.work}. Money: ${year.money} Cycle: ${year.cycle}. ${year.direction}. ${year.caution} ${year.evidence.join(' ')}`, 9.8)
  }
  cardArtData ??= readFile(new URL('../../public/images/cards/destiny-background-v2.webp', import.meta.url))
    .then(bytes => sharp(bytes).png().toBuffer()).then(bytes => 'data:image/png;base64,' + bytes.toString('base64'))
  cardKeyData ??= readFile(new URL('../../public/images/cards/destiny-key-v2.png', import.meta.url))
    .then(bytes => 'data:image/png;base64,' + bytes.toString('base64'))
  for (const [index, card] of report.cards.entries()) {
    addPage()
    centre('YOUR PERSONAL DESTINY CARD', 721, 12)
    const svg = renderToStaticMarkup(createElement(DestinyCardArtwork, {
      card, id: `issued-card-${index}`, artworkHref: await cardArtData, keyHref: await cardKeyData, preview: false, showStem: false,
      labels: { personal: 'MY PERSONAL KEY', element: 'ELEMENT', numbers: 'MY NUMBERS', colour: 'MY COLOUR', watermark: mode === 'test' ? 'SANDBOX EDITION' : 'PERSONAL EDITION' },
    }))
    const raster = await sharp(Buffer.from(svg)).resize(1080, 1350)
      .flatten({ background: { r: 250, g: 245, b: 232 } }).jpeg({ quality: 94, chromaSubsampling: '4:4:4' }).toBuffer()
    const cardImage = await pdf.embedJpg(raster)
    page.drawImage(cardImage, { x: 72.64, y: 120, width: 450, height: 562.5 })
    const caption = clean(`${card.stem} · ${card.daySymbol.toUpperCase()}`), captionSize = 25 * 450 / 1080
    page.drawText(caption, { x: (W - font.widthOfTextAtSize(caption, captionSize)) / 2, y: 120 + (1350 - 862) * 450 / 1080, size: captionSize, font, color: rgb(.91, .75, .45) })
    y = 91
    paragraph('A personal keepsake. Symbolic colours and numbers are cultural associations.', 9, muted)
  }
  addPage()
  centre('The letter ends. Your story continues.', 685, 25, ink, italic)
  y = 618
  paragraph('You do not have to act on every page. Keep the passage that helped you understand yourself a little more clearly, and come back when another part of life asks for your attention.', 12)
  paragraph('With care, THE FATE KEY', 12, gold)
  const sealY = 370
  const wax = rgb(.35, .12, .16), lightGold = rgb(.88, .72, .43)
  // Scalloped wax edge, engraved rays and a beaded double rim.
  page.drawCircle({ x: W / 2 + 2, y: sealY - 3, size: 84, color: rgb(.20, .10, .12), opacity: .12 })
  for (let i = 0; i < 32; i++) {
    const angle = i * Math.PI / 16
    page.drawCircle({ x: W / 2 + Math.cos(angle) * 76, y: sealY + Math.sin(angle) * 76, size: 7, color: wax, borderColor: gold, borderWidth: .55 })
  }
  page.drawCircle({ x: W / 2, y: sealY, size: 76, color: wax, borderColor: lightGold, borderWidth: 1.3 })
  for (let i = 0; i < 64; i++) {
    const angle = i * Math.PI / 32
    page.drawCircle({ x: W / 2 + Math.cos(angle) * 70, y: sealY + Math.sin(angle) * 70, size: .9, color: lightGold })
  }
  page.drawCircle({ x: W / 2, y: sealY, size: 65, borderColor: gold, borderWidth: .7 })
  page.drawCircle({ x: W / 2, y: sealY, size: 60, borderColor: gold, borderWidth: .3 })
  for (const side of [-1, 1]) {
    for (let i = 0; i < 7; i++) {
      const angle = side === 1 ? -.5 + i / 6 : Math.PI + .5 - i / 6
      const x = W / 2 + Math.cos(angle) * 49, yy = sealY + Math.sin(angle) * 49
      page.drawEllipse({ x, y: yy, xScale: 2.2, yScale: 4.0, color: gold, opacity: .8 })
    }
  }
  for (const dx of [-27, 27]) {
    page.drawLine({ start: { x: W / 2 + dx - 3, y: sealY + 4 }, end: { x: W / 2 + dx + 3, y: sealY + 4 }, color: lightGold, thickness: .7 })
    page.drawLine({ start: { x: W / 2 + dx, y: sealY + 1 }, end: { x: W / 2 + dx, y: sealY + 7 }, color: lightGold, thickness: .7 })
  }
  centre('THE FATE KEY', sealY + 47, 11, paper)
  const markSize = 66, markScale = markSize / 105
  const markX = W / 2 - markSize / 2, markY = sealY - 30
  page.pushOperators(pushGraphicsState(), rectangle(markX, markY, markSize, 108 * markScale), clip(), endPath())
  page.drawImage(artwork, { x: markX - 62 * markScale, y: markY - (979 - 6 - 108) * markScale, width: 1606 * markScale, height: 979 * markScale })
  page.pushOperators(popGraphicsState())
  centre('PRIVATE EDITION', sealY - 44, 9, paper)
  centre('Issued by THE FATE KEY', 248, 12, ink)
  y = 207
  paragraph('Report reference: ' + (report.reference ?? orderId), 9, muted)
  paragraph('Edition ' + report.edition + ' | Issued ' + report.issuedAt.slice(0, 10), 9, muted)
  paragraph('The seal identifies the publisher; it is not an external certification.', 9, muted)
  paragraph(mode === 'test' ? 'SANDBOX PURCHASE - Test payment only. No real money charged.' : 'Your private purchase. Keep this report and recovery code safe.', 9, muted)
  const pages = pdf.getPages()
  pages.forEach((p, i) => {
    if (i === 0) return
    p.drawLine({ start: { x: 54, y: 63 }, end: { x: W - 54, y: 63 }, color: gold, thickness: .4 })
    if (report.reference) p.drawText(report.reference, { x: 54, y: 62, size: 7, font, color: muted })
    p.drawText(`THE FATE KEY | PRIVATE LETTER | ${i + 1} / ${pages.length}`, { x: 54, y: 47, size: 8, font, color: muted })
  })
  return pdf.save()
}
