import { customerDeliveryText } from '../../src/report/customer-delivery.ts'
import { reportReference } from '../../src/report/report-reference.ts'
import type { ReportCertificate } from '../../src/report/report-reference.ts'
import sharp from 'sharp'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import DestinyCardArtwork from '../../src/components/report/destiny-card-artwork.ts'
import { readFile } from 'node:fs/promises'
import { PDFDocument, PDFName, PDFNumber, PDFNull, rgb, StandardFonts, pushGraphicsState, popGraphicsState, rectangle, clip, endPath } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { calculateSaju } from '../../packages/core/src/saju.ts'
import { buildCompleteReading, REPORT_EDITION } from '../../src/report/complete-reading.ts'
import { buildBundleReading, buildCategoryReading, DESTINY_COLLECTION_QUESTIONS } from '../../src/report/category-readings.ts'
import { buildDestinyCard } from '../../src/report/destiny-card.ts'
import { plainReadingText, readingTextParts } from '../../src/report/reading-text.ts'
import { previewProduct } from '../../src/report/personal-products.ts'
import { careerMoneyChartData } from '../../src/report/career-money-charts.ts'
import type { OrderInput } from './input.ts'
import { auditBirthInput } from './independent-audit.ts'
import { applyBuyerQuestions, BUYER_QUESTIONS } from '../../src/report/buyer-outline.ts'
import { inspectReport } from '../../src/lib/report-quality-gate.ts'
import { buildAnswerProvenance, buildCollectionAnswerProvenance, type AnswerProvenance } from '../../src/report/answer-provenance.ts'
import { summarizeCalculationVerification, type CalculationVerification } from '../../src/report/independent-personalization.ts'

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
  /** Internal sandbox audit only; never presented as an objective accuracy guarantee. */
  qualityAudit?: ReturnType<typeof inspectReport>
  /** Internal structured provenance, encrypted with the stored order artifact; never sent to customers. */
  answerProvenance?: AnswerProvenance[]
  /** Independent pillar comparison only; does not certify narrative accuracy. */
  calculationVerification?: CalculationVerification
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
  let text: string, documents: string[], source: unknown, answerProvenance: AnswerProvenance[] | undefined
  let calculationVerification: CalculationVerification | undefined
  let careerCharts: ReturnType<typeof careerMoneyChartData> | undefined
  let careerCalculationVerified = false
  if (input.kind === 'complete') {
    const independentAudit = await auditBirthInput(input.first, a)
    calculationVerification = summarizeCalculationVerification(independentAudit, Boolean(input.first.unknownTime))
    const reading = buildCompleteReading(a, referenceYear, independentAudit)
    answerProvenance = buildAnswerProvenance('complete', reading.chapters)
    source = reading; documents = [previewProduct('complete').title]; text = applyBuyerQuestions(reading.fullText.replace('THE FATE KEY · ' + reading.title + '\n\n', 'THE FATE KEY · ' + documents[0] + '\n\n'), 'complete', reading.chapters, reading.periods)
  } else if (input.kind === 'bundle') {
    if (!b) throw new Error('Missing second chart')
    const reading = buildBundleReading(a, b, Number(input.periodStart?.slice(0, 4) ?? input.year!), referenceYear, input.periodStart, input.periodTimezone)
    const chapter = (chapters: typeof reading.complete.chapters, id: string) => {
      const found = chapters.find(item => item.id === id)
      if (!found) throw new Error(`Missing collection answer source: ${id}`)
      return found
    }
    answerProvenance = buildCollectionAnswerProvenance([
      { questionId: 'collection-q1', sourceChapterId: 'complete.personality', ruleId: 'category-readings.buildBundleReading.q1.v1', chapters: [chapter(reading.complete.chapters, 'personality')] },
      { questionId: 'collection-q2', sourceChapterId: 'complete.social', ruleId: 'category-readings.buildBundleReading.q2.v1', chapters: [chapter(reading.complete.chapters, 'social')] },
      { questionId: 'collection-q3', sourceChapterId: 'career.two-work-layers', ruleId: 'category-readings.buildBundleReading.q3.v1', chapters: [chapter(reading.career.chapters, 'two-work-layers')] },
      { questionId: 'collection-q4', sourceChapterId: 'career.money-commitments', ruleId: 'category-readings.buildBundleReading.q4.v1', chapters: [chapter(reading.career.chapters, 'money-commitments')] },
      { questionId: 'collection-q5', sourceChapterId: 'love.love-needs', ruleId: 'category-readings.buildBundleReading.q5.v1', chapters: [chapter(reading.love.chapters, 'love-needs')] },
      { questionId: 'collection-q6', sourceChapterId: 'compatibility.two-styles', ruleId: 'category-readings.buildBundleReading.q6.v1', chapters: [chapter(reading.compatibility.chapters, 'two-styles')] },
      { questionId: 'collection-q7', sourceChapterId: 'complete.life-challenges', ruleId: 'category-readings.buildBundleReading.q7.v1', chapters: [chapter(reading.complete.chapters, 'life-challenges')] },
      { questionId: 'collection-q8', sourceChapterId: 'annual.annual-theme', ruleId: 'category-readings.buildBundleReading.q8.v1', chapters: [chapter(reading.annual.chapters, 'annual-theme')] },
      { questionId: 'collection-q9', sourceChapterId: 'complete.patterns', ruleId: 'category-readings.buildBundleReading.q9.v1', chapters: [chapter(reading.complete.chapters, 'patterns')] },
      { questionId: 'collection-q10', sourceChapterId: 'collection.integration', ruleId: 'category-readings.buildBundleReading.q10.v1', chapters: [
        chapter(reading.career.chapters, 'two-work-layers'), chapter(reading.career.chapters, 'money-commitments'),
        chapter(reading.love.chapters, 'love-needs'), chapter(reading.annual.chapters, 'annual-theme'),
      ] },
    ])
    source = reading
    documents = [previewProduct('bundle').title]
    text = reading.fullText.replace('THE FATE KEY · ' + reading.title + '\n\n', 'THE FATE KEY · ' + documents[0] + '\n\n')
  } else {
    const reading = buildCategoryReading(input.kind, a, { second: b, year: Number(input.periodStart?.slice(0, 4) ?? input.year ?? referenceYear), ...(input.periodStart ? { periodStart: input.periodStart } : {}), ...(input.periodTimezone ? { periodTimezone: input.periodTimezone } : {}) })
    if (input.kind === 'career') {
      careerCharts = careerMoneyChartData(a, referenceYear)
      const audit = await auditBirthInput(input.first, a)
      careerCalculationVerified = Boolean(audit && audit.current.slice(0, 3).every((pillar, index) => pillar && pillar === audit.independent[index]))
    }
    answerProvenance = buildAnswerProvenance(input.kind, reading.chapters)
    source = reading; documents = [previewProduct(input.kind).title]; text = applyBuyerQuestions(reading.fullText.replace('THE FATE KEY · ' + reading.title + '\n\n', 'THE FATE KEY · ' + documents[0] + '\n\n'), input.kind, reading.chapters, [], 'standalone', careerCharts?.years)
  }
  const certificates = documents.map((title,index) => ({ title, number: reportReference(orderId, referenceYear, input.kind === 'bundle' ? 5 : index + 1) }))
  const reference = input.kind === 'bundle' ? reportReference(orderId, referenceYear, 0) : certificates[0].number
  for (const certificate of certificates) {
    const heading = 'THE FATE KEY · ' + certificate.title
    text = text.replace(heading + '\n\n', heading + '\n\nReport ID: ' + certificate.number + '\n\n')
  }
  if (input.kind === 'bundle') text = text.replace('THE FATE KEY · ' + documents[0] + '\n\n', 'THE FATE KEY · ' + documents[0] + '\n\nCollection ID: ' + reference + '\n\nReport ID: ' + certificates[0].number + '\n\n')
  const report: BuyerReport = {
    title: previewProduct(input.kind).title, kind: input.kind, edition: REPORT_EDITION, reference, certificates,
    ...(input.recipientName ? { recipientName: input.recipientName } : {}),
    issuedAt: new Date().toISOString(), text: customerDeliveryText(plainReadingText(text).replaceAll('Person A', 'You').replaceAll('Person B', 'Your partner'), input.kind !== 'career' && input.kind !== 'bundle'), emphasis: reportEmphasis(source), documents,
    cards: [buildDestinyCard(input.first, input.recipientName ?? ''), ...(input.second ? [buildDestinyCard(input.second, 'Your partner')] : [])], pdf: '',
    ...(careerCharts ? { careerCharts } : {}),
    ...(answerProvenance ? { answerProvenance } : {}),
    ...(calculationVerification ? { calculationVerification } : {}),
  }
  // Run non-blocking diagnostics for both sandbox and live orders.
  // Never delay fulfillment because a heuristic score is low or QA throws.
  try {
    const questionTexts = input.kind === 'bundle' ? DESTINY_COLLECTION_QUESTIONS : BUYER_QUESTIONS[input.kind].map(item => item.question)
    const expected = [...questionTexts]
    const matches = [...report.text.matchAll(/(?:^|\n)Question: ([^\n]+)\n/g)]
    const answerLabel = /^(?:Your Answer|Answer|Answer detail|What This Means for You|Important Timing|Bottom Line|Practical point|Main caution):\s*/i
    const sections = matches.map((match, index) => {
      const raw = report.text.slice(match.index! + match[0].length, matches[index + 1]?.index ?? report.text.length)
      const blocks: string[] = []
      for (const block of raw.split(/\n\s*\n/).map(value => value.trim()).filter(Boolean)) {
        if (!answerLabel.test(block)) break
        blocks.push(block.replace(answerLabel, ''))
      }
      return { question: match[1].trim(), answer: blocks.join('\n\n') }
    })
    const audit = inspectReport({
      productId: input.kind, expectedQuestions: expected,
      questions: sections.map((section, index) => ({ ...section, questionId: input.kind === 'bundle'
        ? `collection-q${index + 1}`
        : BUYER_QUESTIONS[input.kind].find(question => question.question === section.question)?.id ?? section.question })),
      birthTimeKnown: !input.first.unknownTime && (!input.second || !input.second.unknownTime),
      usesHourPillar: (Boolean(input.first.unknownTime) || Boolean(input.second?.unknownTime)) && sections.some(section =>
        /\b(?:hour pillar|hour stem|hour branch|birth-hour marker|hour sign)\b/i.test(section.answer)),
      calculationVerified: input.kind === 'complete' ? calculationVerification?.status === 'verified' : input.kind === 'career' ? careerCalculationVerified : false,
      ...(input.kind === 'complete' ? { calculationVerification: calculationVerification?.status ?? 'unavailable' } : {}),
      provenance: report.answerProvenance,
    })
    if (mode === 'test') report.qualityAudit = audit
    // Log codes only: do not log customer names, birth details or report content.
    console.info('report_quality_diagnostic', {
      orderId, kind: input.kind, mode, score: audit.score,
      passed: audit.passed, requiresHumanReview: audit.requiresHumanReview,
      findingCodes: [...new Set(audit.findings.map(finding => finding.code))],
      ...(input.kind === 'complete' ? { calculationVerification: calculationVerification?.status ?? 'unavailable' } : {}),
    })
  } catch {
    console.warn('report_quality_diagnostic_unavailable', { orderId, kind: input.kind, mode })
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
  artworkBytes ??= readFile(new URL('./assets/HomepageArtwork.jpg', import.meta.url))
  const artwork = await pdf.embedJpg(await artworkBytes)
  const letterStationery = await pdf.embedJpg(await readFile(new URL('./assets/fate-letter-stationery.jpg', import.meta.url)))
  const envelopeCover = await pdf.embedJpg(await readFile(new URL('./assets/fate-letter-envelope-cover.jpg', import.meta.url)))
  const display = await pdf.embedFont(StandardFonts.TimesRoman)
  const italic = await pdf.embedFont(StandardFonts.TimesRomanItalic)
  const cardFontBytes = await readFile(new URL('./assets/NotoSansSC-Report.ttf', import.meta.url))
  const cardFontCss = `@font-face{font-family:FateCard;src:url(data:font/ttf;base64,${cardFontBytes.toString('base64')})}`
  pdf.setTitle(report.title + ' | THE FATE KEY')
  pdf.setAuthor('THE FATE KEY')
  pdf.setSubject((mode === 'test' ? 'Private Sandbox purchase report - ' : 'Purchased report - ') + report.edition + (report.reference ? ' | ' + report.reference : ''))
  const supported = new Set(font.getCharacterSet())
  const clean = (text: string) => Array.from(text.replace(/\*\*/g, '').replace(/[\u2010-\u2015]/g, '-').replace(/[\u2018\u2019]/g, "'"))
    .map(c => supported.has(c.codePointAt(0)!) ? c : c === '\t' ? ' ' : '?').join('')
  const phrases = [...new Set(emphasis.map(clean))].sort((a, b) => b.length - a.length)
  const emphasisPattern = phrases.length ? new RegExp(phrases.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g') : undefined
  const W = 595.28, H = 841.89
  // Moonlit Envelope (70%) + Antique Scroll Letter (30%): shared by every paid PDF.
  const night = rgb(.065, .092, .155), gold = rgb(.68, .54, .32), paper = rgb(.982, .963, .925)
  const ink = rgb(.17, .20, .25), muted = rgb(.36, .38, .41)
  const parchmentEdge = rgb(.85, .79, .68)
  let page = pdf.addPage([W, H]), y = 748
  const tocRows: { label: string; page: ReturnType<typeof pdf.addPage>; bottom: number; top: number }[] = []
  const tocDestinations = new Map<string, { page: ReturnType<typeof pdf.addPage>; y: number }>()
  let tocRowsRemaining = 0
  const textX = 54, textWidth = W - 108
  const centre = (text: string, yy: number, size: number, color = gold, face = display) => {
    page.drawText(text, { x: (W - face.widthOfTextAtSize(text, size)) / 2, y: yy, size, font: face, color })
  }
  const frame = (dark = false) => {
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: dark ? night : paper })
    if (!dark) {
      page.drawImage(letterStationery, { x: 0, y: 0, width: W, height: H })
      return
    }
    // The dark cover is rendered from the supplied artwork below.
    if (!dark) {
      page.drawRectangle({ x: 0, y: H - 25, width: W, height: 25, color: night })
      page.drawRectangle({ x: 0, y: 0, width: W, height: 25, color: night })
      for (const [sx, sy, radius] of [[52, H - 12, 3], [W - 52, H - 12, 3], [W / 2, H - 13, 4], [65, 13, 2.5], [W - 65, 13, 2.5], [W / 2, 13, 4]] as const) {
        page.drawLine({ start: { x: sx - radius * 2, y: sy }, end: { x: sx + radius * 2, y: sy }, color: gold, thickness: .75 })
        page.drawLine({ start: { x: sx, y: sy - radius * 2 }, end: { x: sx, y: sy + radius * 2 }, color: gold, thickness: .75 })
        page.drawCircle({ x: sx, y: sy, size: 1.2, color: gold })
      }
      page.drawLine({ start: { x: 42, y: H - 46 }, end: { x: W - 42, y: H - 46 }, color: gold, thickness: .45, opacity: .6 })
      page.drawLine({ start: { x: 42, y: 46 }, end: { x: W - 42, y: 46 }, color: gold, thickness: .45, opacity: .6 })
    }
    page.drawRectangle({ x: 28, y: 28, width: W - 56, height: H - 56, borderColor: gold, borderWidth: .6 })
    page.drawRectangle({ x: 33, y: 33, width: W - 66, height: H - 66, borderColor: gold, borderWidth: .2 })
    if (!dark) {
      // Quiet antique-letter border, kept outside the body text safe area.
      page.drawRectangle({ x: 38, y: 38, width: W - 76, height: H - 76, borderColor: parchmentEdge, borderWidth: .4, borderOpacity: .7 })
      for (const side of [-1, 1]) {
        const cx = side < 0 ? 41 : W - 41
        for (const cy of [77, H - 77]) {
          page.drawCircle({ x: cx, y: cy, size: 9, borderColor: gold, borderWidth: .55, borderOpacity: .4 })
          page.drawCircle({ x: cx, y: cy, size: 3, color: gold, opacity: .24 })
        }
      }
    }
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
      // Celestial detail stays in the outer margins; a central medallion
      // crossed body copy in narrow and mobile PDF viewers.
    }
  }
  const addPage = () => {
    page = pdf.addPage([W, H]); y = 620; frame()
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
    let runs: { text: string; bold: boolean }[] = [], width = 0
    const flush = () => {
      if (!runs.length) return
      if (y < 83) addPage()
      let x = textX
      for (const run of runs) {
        // Keep emphasis in the same embedded font as body copy. Mixing the
        // embedded CJK-capable face with PDF standard Helvetica caused visible
        // tracking changes in bold phrases on some mobile PDF viewers.
        const runColor = run.bold ? rgb(.47, .30, .12) : color
        page.drawText(run.text, { x, y, size, font, color: runColor })
        const runWidth = font.widthOfTextAtSize(run.text, size)
        if (run.bold) page.drawText(run.text, { x: x + .34, y, size, font, color: runColor })
        x += runWidth
      }
      y -= size * 1.65; runs = []; width = 0
    }
    for (const part of parts) {
      for (const token of part.text.match(/\S+|\s+/g) ?? []) {
        if (!width && !token.trim()) continue
        const tokenWidth = font.widthOfTextAtSize(token, size)
        if (width + tokenWidth > textWidth && width) {
          flush()
          if (!token.trim()) continue
        }
        const previous = runs.at(-1)
        if (previous?.bold === part.bold) previous.text += token
        else runs.push({ text: token, bold: part.bold })
        width += tokenWidth
      }
    }
    flush(); y -= 9
  }
  // The supplied envelope artwork is the shared cover; text remains product-specific and selectable.
  frame(true)
  page.drawImage(envelopeCover, { x: 0, y: 0, width: W, height: H })
  const coverTitleLines: string[] = []
  let coverLine = ''
  for (const word of report.title.split(' ')) {
    const candidate = coverLine ? coverLine + ' ' + word : word
    if (font.widthOfTextAtSize(candidate, 24) > W - 130 && coverLine) { coverTitleLines.push(coverLine); coverLine = word }
    else coverLine = candidate
  }
  if (coverLine) coverTitleLines.push(coverLine)
  const titleGold = rgb(.98, .90, .72)
  let coverY = 566 + (coverTitleLines.length - 1) * 28
  for (const line of coverTitleLines) { centre(line, coverY, 24, titleGold, font); coverY -= 30 }
  centre('A PERSONAL SAJU READING', coverY - 6, 8.5, titleGold, font)
  centre(report.kind === 'bundle' ? '10 PERSONAL ANSWERS' : '7 PERSONAL ANSWERS', 92, 7.5, muted, font)
  centre(mode === 'test' ? 'SANDBOX TEST / No real payment charged' : 'YOUR PRIVATE READING', 81, 6.5, muted, font)
  addPage()
  const greeting = report.recipientName ? clean(`Dear ${report.recipientName},`) : 'Dear reader,'
  const greetingSize = Math.min(27, (W - 108) / font.widthOfTextAtSize(greeting, 1))
  centre(greeting, 620, greetingSize, ink, report.recipientName ? font : italic); y = 568
  paragraph('Some parts of your story may feel familiar. Others may give you a new way to look at a choice, a relationship or the work you do every day.', 12)
  paragraph('This letter follows the patterns in your Saju chart. Read slowly, notice what feels relevant, and leave room for the life you know better than any report can.', 12)
  paragraph('The chart notes explain where each interpretation begins. You can return to them whenever you want to look more closely.', 12)
  y -= 25; paragraph('With care,', 13); paragraph('THE FATE KEY', 16, gold)
  y -= 25; paragraph('Your reading follows on the next page.', 10, muted)
  addPage()
  let inAppendix = false
  const shortPdfAppendix = (text: string) => {
    const start = text.indexOf('Calculation notes')
    const end = text.indexOf('How this reading is prepared', start < 0 ? 0 : start)
    if (start < 0 || end < 0) return text
    const unknownBirthTime = /birth time (?:was )?not (?:provided|known)|unknown birth time|birth time is unknown/i.test(text)
    const summary = [
      'Calculation notes',
      'This reading uses your calculated birth-year, birth-month and birth-day signs. Technical chart terms and repeated calculation details are omitted here; your answers above explain the personal meaning.',
    ].join('\n\n')
    const prepared = text.slice(0, start) + summary + '\n\n' + text.slice(end)
    const methodStart = prepared.indexOf('How this reading is prepared', start)
    if (methodStart < 0) return prepared
    // The source method notes are detailed for auditability. Buyers need only
    // the input/timezone policy and the limits that change how their reading is read.
    const limit = prepared.indexOf('\n\nTHE FATE KEY |', methodStart)
    const methodEnd = limit < 0 ? prepared.length : limit
    const method = [
      'How this reading is prepared',
      'Birthplace local time, including historical daylight saving, is used for the chart. Longitude adjustment is approximate.',
      ...(unknownBirthTime ? ['Your birth time is unknown, so no hour sign is included or estimated. Ten-year cycle start dates are approximate.'] : ['Your recorded birth time is used; timing descriptions are comparisons, not guaranteed events.']),
      'This is a traditional Saju interpretation, not a diagnosis or a validated prediction. Annual comparisons use a shared reference time and do not change your birthplace chart.',
    ].join('\n\n')
    return prepared.slice(0, methodStart) + method + prepared.slice(methodEnd)
  }
  const pdfText = shortPdfAppendix(report.text)
  const blocks = pdfText.split(/\n+/).map(block => block.trim()).filter(Boolean)
  for (const [blockIndex, block] of blocks.entries()) {
    const value = block.trim()
    if (!value) continue
    if (/^THE FATE KEY · /.test(value)) inAppendix = false
    if (value === 'Calculation notes') { inAppendix = true; if (y < 650) addPage() }
    // A two-person header must not consume the space reserved for five key answers.
    if (value === 'Your reading at a glance') {
      tocRowsRemaining = 5
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
    if (heading && !inAppendix && value !== 'Your reading at a glance' && y < 350) addPage()
    if (heading) {
      if (/^\d{2} [·-]/.test(value)) {
        const destinationTitle = value.replace(/^\d{2} [·-]\s*/, '').trim()
        // Some detailed/source sections repeat the buyer-facing headings.
        // Preserve the first occurrence so overview links land on the actual
        // customer answer, not a later appendix copy.
        if (!tocDestinations.has(destinationTitle)) tocDestinations.set(destinationTitle, { page, y: y - 10 })
      }
      y -= 10; paragraph(value, 16, gold); y -= 5
    } else {
      const toc = tocRowsRemaining > 0 && value.includes(' — ')
      const top = y + 14
      const tocLabel = toc ? value.split(' — ', 1)[0].trim() : ''
      const tocPage = page
      paragraph(value, note ? 10.2 : 13.4, note ? muted : ink, !note)
      if (toc) { tocRows.push({ label: tocLabel, page: tocPage, bottom: y + 2, top }); tocRowsRemaining-- }
    }
  }
  if (report.kind === 'career' && report.careerCharts) {
    const charts = report.careerCharts
    const section = (title: string, subtitle: string) => {
      addPage(); paragraph(title, 16, gold); paragraph(subtitle, 10.2, muted)
    }
    section('Four Pillars & Five Elements', 'Calculated birth-chart symbols. The bars count visible markers only; they do not measure strength or fortune.')
    for (const pillar of charts.pillars) paragraph(`${pillar.position}: ${pillar.ganzi} | stem ${pillar.stemGod} | branch ${pillar.branchGod} | hidden ${pillar.hidden.map(item => item.god).join(', ') || 'none listed'}`, 10.2, ink)
    paragraph(`Day Master: ${charts.dayMaster} | strength: ${charts.strength}`, 10.5)
    paragraph(`Strength basis: ${charts.strengthEvidence.join(' ')}`, 9.8, muted)
    paragraph('Visible Five Elements · exposed stems and branches', 12, gold)
    paragraph(charts.elements.map(item => `${item.element} ${item.count}`).join('  ·  ') + `  |  ${charts.elementTotal} counted markers`, 10.5)
    y -= 8
    const elementPalette: Record<string, ReturnType<typeof rgb>> = { Wood: rgb(.25,.43,.34), Fire: rgb(.65,.32,.28), Earth: rgb(.65,.51,.28), Metal: rgb(.39,.46,.51), Water: rgb(.20,.32,.49) }
    const maxElement = Math.max(1, ...charts.elements.map(item => item.count))
    for (const [index, item] of charts.elements.entries()) {
      const yy = y - index * 25
      page.drawText(item.element, { x: textX, y: yy, size: 10, font, color: ink })
      page.drawRectangle({ x: textX + 70, y: yy - 1, width: 290, height: 10, color: rgb(.91,.89,.83) })
      if (item.count) page.drawRectangle({ x: textX + 70, y: yy - 1, width: 290 * item.count / maxElement, height: 10, color: elementPalette[item.element] ?? gold })
      page.drawText(String(item.count), { x: textX + 372, y: yy, size: 10, font, color: ink })
    }
    y -= charts.elements.length * 25 + 10
    const visibleGods = charts.visibleCounts.filter(row => row.count).map(row => `${row.label} ${row.count}`).join(' · ')
    const hiddenGods = charts.hiddenCounts.filter(row => row.count).map(row => `${row.label} ${row.count}`).join(' · ')
    paragraph(`Ten Gods · visible: ${visibleGods || 'none counted'}; hidden: ${hiddenGods || 'none counted'}. These are placement counts, not weights.`, 9.6, muted)
    section('Career & Money Structure', 'The indicators below name chart features; the reading above explains what they mean for you.')
    paragraph(`Visible money markers: ${charts.moneyEvidence.map(item => `${item.label} · ${item.source}`).join('; ') || 'none'}. Hidden money markers: ${charts.hiddenMoneyEvidence.map(item => `${item.label} · ${item.source}`).join('; ') || 'none'}.`, 10.2)
    paragraph('Income routes', 12, gold)
    for (const route of charts.incomeRoutes) paragraph(`${route.from} → ${route.to}: ${route.present ? `present (${[...new Set(route.gods)].join(', ') || 'calculated route'})` : 'not found in checked positions'}.`, 10.2)
    paragraph(charts.structureStatus.startsWith('Conditional route:') ? 'A conditional balancing preference is assigned under the stated rule. It is a reading aid, not a universally lucky element.' : 'No single balancing preference is assigned because the checked signals do not point to one route.', 9.8, muted)
    paragraph('Employment vs independent work', 12, gold)
    for (const signal of [...charts.employmentSignals, ...charts.independentSignals]) paragraph(`${signal.label}: ${signal.present ? 'present' : 'not prominent'} — ${signal.note}`, 9.8)
    const relevantCycles = charts.cycles.filter(cycle => Number(cycle.span.slice(0, 4)) <= charts.years.at(-1)!.year && Number(cycle.span.slice(5, 9)) >= charts.years[0].year)
    paragraph('Ten-year cycle timeline', 12, gold)
    paragraph(charts.caveat, 9.5, muted)
    for (const cycle of relevantCycles) paragraph(`${cycle.start} to ${cycle.end ?? 'next calculated boundary'} · ${cycle.ganzi} · ${cycle.stemGod} / ${cycle.branchGod} · work: ${cycle.workTheme.split(/[.!?]/)[0]} · money: ${cycle.moneyTheme.split(/[.!?]/)[0]}`, 9.8)
    section('Year-by-Year Outlook', 'Annual comparison points show the calculated pillar, active cycle and whether a checked relationship needs review. No luck score is assigned.')
    for (const year of charts.years) paragraph(`${year.year} · ${year.pillar} · ${year.stemGod} / ${year.branchGod} · cycle ${year.cycle.split(' (')[0]} · ${year.tension ? 'a checked pair relationship is present' : 'no checked friction pattern at this reference'}.`, 10.1)
    paragraph('Use the chapter text for the personal meaning of these markers. A recorded relationship signals a question to examine; it does not predict a specific event.', 9.6, muted)
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
      fontFamily: 'FateCard, sans-serif',
      labels: { personal: 'MY PERSONAL KEY', element: 'ELEMENT', numbers: 'MY NUMBERS', colour: 'MY COLOUR', watermark: mode === 'test' ? 'SANDBOX EDITION' : 'PERSONAL EDITION' },
    }))
    const svgWithCardFont = Buffer.from(svg.toString().replace(/<svg([^>]*)>/, `<svg$1><style>${cardFontCss} text{font-family:FateCard,sans-serif}</style>`))
    const raster = await sharp(svgWithCardFont).resize(1080, 1350)
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
  // The closing seal rests on an antique stationery ribbon.
  page.drawLine({ start: { x: 108, y: 370 }, end: { x: W - 108, y: 370 }, color: gold, thickness: .8, opacity: .48 })
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
  // Make the five opening overview entries real internal PDF links. Each
  // destination is captured from the rendered section heading, so page breaks
  // do not invalidate the target.
  for (const row of tocRows) {
    const destination = [...tocDestinations.entries()].find(([title]) => title === row.label || title.startsWith(row.label) || row.label.startsWith(title))?.[1]
    if (!destination) continue
    const annotation = pdf.context.obj({
      Type: PDFName.of('Annot'), Subtype: PDFName.of('Link'),
      Rect: pdf.context.obj([PDFNumber.of(textX), PDFNumber.of(row.bottom), PDFNumber.of(W - 54), PDFNumber.of(row.top)]),
      Border: pdf.context.obj([PDFNumber.of(0), PDFNumber.of(0), PDFNumber.of(0)]),
      Dest: pdf.context.obj([destination.page.ref, PDFName.of('XYZ'), PDFNull, PDFNumber.of(destination.y), PDFNull]),
    })
    row.page.node.addAnnot(pdf.context.register(annotation))
  }
  return pdf.save()
}
