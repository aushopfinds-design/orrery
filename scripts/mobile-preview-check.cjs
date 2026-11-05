const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require('playwright')

const origin = process.env.FATE_PREVIEW_ORIGIN || 'https://thefatekey.com'
const products = [
  ['01', 'complete-life-reading'],
  ['02', 'career-money'],
  ['03', 'love-compatibility'],
  ['04', 'year-ahead'],
  ['05', 'business-reading'],
  ['06', 'everyday-balance'],
  ['07', 'complete-destiny'],
]
const widths = [375, 390, 430]
const outputDir = path.resolve(process.env.MOBILE_SCREENSHOT_DIR || 'artifacts/mobile-preview')

async function main() {
  fs.mkdirSync(outputDir, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const results = []
  try {
    for (const [number, slug] of products) {
      for (const width of widths) {
        const page = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
        const pageErrors = []
        page.on('pageerror', error => pageErrors.push(error.message))
        const url = `${origin}/samples/${slug}/`
        const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
        await page.evaluate(() => document.fonts.ready)
        const layout = await page.evaluate(() => {
          const visible = element => {
            const style = getComputedStyle(element)
            const rect = element.getBoundingClientRect()
            return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0
          }
          const rectData = element => {
            const rect = element.getBoundingClientRect()
            return { tag: element.tagName.toLowerCase(), className: typeof element.className === 'string' ? element.className : '', text: (element.innerText || element.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 100), left: Math.round(rect.left), right: Math.round(rect.right), top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) }
          }
          const viewportWidth = document.documentElement.clientWidth
          const clipped = [...document.querySelectorAll('body *')].filter(element => {
            if (!visible(element)) return false
            const style = getComputedStyle(element)
            return ((style.overflowX === 'hidden' || style.overflowX === 'clip') && element.scrollWidth > element.clientWidth + 2) || (style.textOverflow === 'ellipsis' && element.scrollWidth > element.clientWidth + 2)
          }).map(rectData).slice(0, 20)
          const outOfBounds = [...document.querySelectorAll('img,svg,canvas,table,button,a[role="button"]')].filter(element => visible(element) && element.getBoundingClientRect().right > viewportWidth + 1).map(rectData).slice(0, 20)
          const actions = [...document.querySelectorAll('button,a.public-button,a[role="button"]')].filter(visible).map(element => ({ element, rect: element.getBoundingClientRect(), data: rectData(element) }))
          const overlaps = []
          for (let i = 0; i < actions.length; i++) for (let j = i + 1; j < actions.length; j++) {
            const a = actions[i].rect, b = actions[j].rect
            const width = Math.min(a.right, b.right) - Math.max(a.left, b.left)
            const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
            const containment = (a.left <= b.left && a.right >= b.right && a.top <= b.top && a.bottom >= b.bottom) || (b.left <= a.left && b.right >= a.right && b.top <= a.top && b.bottom >= a.bottom)
            if (width > 2 && height > 2 && !containment) overlaps.push([actions[i].data, actions[j].data])
          }
          const main = document.querySelector('main')
          const mainRect = main?.getBoundingClientRect()
          return {
            viewportWidth,
            documentWidth: document.documentElement.scrollWidth,
            bodyWidth: document.body.scrollWidth,
            main: mainRect ? { left: Math.round(mainRect.left), right: Math.round(mainRect.right), width: Math.round(mainRect.width) } : null,
            title: document.querySelector('h1')?.innerText.trim() || null,
            pageHeight: document.documentElement.scrollHeight,
            visibleImages: [...document.querySelectorAll('img')].filter(visible).length,
            visibleCharts: [...document.querySelectorAll('svg,canvas,table')].filter(visible).length,
            clipped,
            outOfBounds,
            overlaps,
          }
        })
        const screenshotPath = path.join(outputDir, `${number}-${slug}-${width}.png`)
        await page.screenshot({ path: screenshotPath, fullPage: true, animations: 'disabled' })
        const result = { product: number, slug, width, url, status: response?.status() ?? null, screenshot: screenshotPath, pageErrors, ...layout }
        results.push(result)
        await page.close()
      }
    }
  } finally {
    await browser.close()
  }
  fs.writeFileSync(path.join(outputDir, 'results.json'), JSON.stringify(results, null, 2))
  const failures = results.filter(result => result.status !== 200 || result.documentWidth > result.viewportWidth + 1 || result.bodyWidth > result.viewportWidth + 1 || !result.main || result.main.right > result.viewportWidth + 1 || result.main.left < -1 || result.clipped.length || result.outOfBounds.length || result.overlaps.length || result.pageErrors.length)
  for (const result of results) {
    console.log(`${failures.includes(result) ? 'FAIL' : 'PASS'} Product ${result.product} @ ${result.width}px: HTTP ${result.status}, viewport ${result.viewportWidth}px, document ${result.documentWidth}px, main ${JSON.stringify(result.main)}, clipped ${result.clipped.length}, out-of-bounds ${result.outOfBounds.length}, overlaps ${result.overlaps.length}, page errors ${result.pageErrors.length}`)
  }
  if (failures.length) {
    console.error(`Mobile preview check failed for ${failures.length} of ${results.length} renderings. See ${path.join(outputDir, 'results.json')} and screenshots.`)
    process.exitCode = 1
  } else {
    console.log(`All ${results.length} mobile renderings passed.`)
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
