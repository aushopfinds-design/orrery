const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require('playwright')

const url = process.env.FATE_SAMPLE_URL || 'https://thefatekey.com/#sample-report'
const widths = [375, 390, 430]
const out = path.resolve(process.env.MOBILE_SCREENSHOT_DIR || 'artifacts/mobile-full-sample')

async function main() {
  fs.mkdirSync(out, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const results = []
  try {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
      await page.locator('#sample-report .fate-sample-answer').first().waitFor({ state: 'visible', timeout: 20000 })
      await page.evaluate(() => document.fonts.ready)
      const metrics = await page.evaluate(() => {
        const visible = element => {
          const style = getComputedStyle(element)
          const rect = element.getBoundingClientRect()
          return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0
        }
        const data = element => {
          const r = element.getBoundingClientRect()
          return { tag: element.tagName.toLowerCase(), className: typeof element.className === 'string' ? element.className : '', text: (element.innerText || '').trim().replace(/\\s+/g, ' ').slice(0, 100), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) }
        }
        const vw = document.documentElement.clientWidth
        const sample = document.querySelector('#sample-report')
        const clipped = [...sample.querySelectorAll('*')].filter(element => {
          if (!visible(element)) return false
          const style = getComputedStyle(element)
          return ((style.overflowX === 'hidden' || style.overflowX === 'clip') && element.scrollWidth > element.clientWidth + 2) || (style.textOverflow === 'ellipsis' && element.scrollWidth > element.clientWidth + 2)
        }).map(data).slice(0, 10)
        const outside = [...sample.querySelectorAll('img,svg,canvas,table,button,a')].filter(element => visible(element) && element.getBoundingClientRect().right > vw + 1).map(data).slice(0, 10)
        const actions = [...sample.querySelectorAll('.fate-complete-primary,.fate-buyer-sample-link')].filter(visible)
        const overlaps = []
        for (let i = 0; i < actions.length; i++) for (let j = i + 1; j < actions.length; j++) {
          const a = actions[i].getBoundingClientRect(), b = actions[j].getBoundingClientRect()
          if (Math.min(a.right,b.right)-Math.max(a.left,b.left)>2 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2) overlaps.push([data(actions[i]),data(actions[j])])
        }
        return {
          viewport: vw, documentWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth,
          sampleWidth: Math.round(sample.getBoundingClientRect().width),
          questionCount: sample.querySelectorAll('.fate-sample-answer').length,
          title: sample.querySelector('h1')?.innerText.trim() || null,
          clipped, outside, overlaps,
          visibleCoverArt: visible(sample.querySelector('.fate-sample-cover-art')),
          allQuestionsInContents: sample.querySelectorAll('.fate-sample-contents a[href*="question-"]').length
        }
      })
      const screenshot = path.join(out, `sample-report-${width}.png`)
      await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' })
      const failure = response?.status() !== 200 || metrics.documentWidth > width + 1 || metrics.bodyWidth > width + 1 || metrics.questionCount !== 7 || metrics.allQuestionsInContents !== 7 || metrics.clipped.length > 0 || metrics.outside.length > 0 || metrics.overlaps.length > 0 || !metrics.visibleCoverArt || errors.length > 0
      const result = { width, status: response?.status() ?? null, screenshot, pageErrors: errors, ...metrics, result: failure ? 'FAIL' : 'PASS' }
      results.push(result)
      console.log(`${result.result} sample report @ ${width}px: HTTP ${result.status}, document ${metrics.documentWidth}px, questions ${metrics.questionCount}/7, clipped ${metrics.clipped.length}, outside ${metrics.outside.length}, overlaps ${metrics.overlaps.length}, artwork ${metrics.visibleCoverArt}, page errors ${errors.length}`)
      await page.close()
    }
  } finally {
    await browser.close()
  }
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ url, results }, null, 2))
  if (results.some(result => result.result === 'FAIL')) process.exitCode = 1
}
main().catch(error => { console.error(error); process.exitCode = 1 })
