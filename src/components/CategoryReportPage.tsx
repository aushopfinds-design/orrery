import BuyReportLink from './report/BuyReportLink.tsx'
import { useEffect, useMemo } from 'react'
import { calculateSaju } from '@orrery/core/saju'
import { useLocale } from '../i18n/index.ts'
import { CATEGORY_SCENARIOS, categoryInfo } from '../report/category-catalog.ts'
import type { FocusCategory } from '../report/category-catalog.ts'
import { buildBundleReading, buildCategoryReading } from '../report/category-readings.ts'
import { FateEmblem } from './HomeOverview.tsx'
import ReadingText from './report/ReadingText.tsx'
import { previewHash } from '../report/personal-products.ts'
import ReportPrice from './report/ReportPrice.tsx'

export default function CategoryReportPage({ kind }: { kind: FocusCategory | 'bundle' }) {
  const { t } = useLocale()
  const info = kind === 'bundle' ? null : categoryInfo(kind)
  const slug = info?.slug ?? 'complete-bundle'
  const title = info?.title ?? t('category.bundle.title')
  const contents = useMemo(() => {
    const example = CATEGORY_SCENARIOS[0]
    const first = calculateSaju(example.first)
    const second = calculateSaju(example.second)
    if (kind === 'bundle') {
      const bundle = buildBundleReading(first, second)
      return { count: bundle.wordCount, items: [
        { title: bundle.complete.title, text: t('category.bundle.life'), href: '#sample-report' },
        { title: bundle.compatibility.title, text: t('category.bundle.compatibility'), href: '#love-compatibility-sample' },
        { title: bundle.annual.title, text: t('category.bundle.year'), href: '#year-ahead-sample' },
      ] }
    }
    const reading = buildCategoryReading(kind, first, { second })
    return { count: reading.wordCount, items: [
      ...reading.chapters.map(chapter => ({ title: chapter.title.replace(/^\d+ · /, ''), text: chapter.lead, href: `#${slug}-sample-${chapter.id}` })),
      ...(reading.months.length ? [{ title: t('category.months.title'), text: t('category.months.intro'), href: `#${slug}-sample-calendar` }] : []),
    ] }
  }, [kind, slug, t])
  useEffect(() => { document.getElementById(slug)?.scrollIntoView({ block: 'start' }) }, [slug])
  return <article id={slug} className="fate-complete-product" lang="en" aria-labelledby={`${slug}-title`}>
    <a href="#reports" className="fate-product-back">← {t('complete.back')}</a>
    <header className="fate-complete-product-hero">
      <div><p className="fate-eyebrow">{t('category.series')}</p><h1 id={`${slug}-title`}>{title}</h1><p className="fate-complete-description">{info?.description ?? t('category.bundle.description')}</p><p className="fate-complete-price"><ReportPrice kind={kind} /><span>{t('category.product.priceNote')}</span></p>
        <div className="fate-complete-actions"><BuyReportLink kind={kind} /><a href={previewHash(kind)} className="fate-complete-primary">{t('buyer.preview.cta')}</a><a href={`#${slug}-sample`} className="fate-outline-button">{t('complete.sample')}</a></div><p className="fate-reading-small-note">{t('category.product.status')}</p>
      </div>
      <div className="fate-complete-book" aria-hidden="true"><FateEmblem className="fate-complete-book-emblem" /><span>THE FATE KEY</span><strong>{title}</strong><small>YOUR STORY HOLDS THE KEY</small></div>
    </header>
    <section className="fate-complete-section"><h2>{t('category.product.insideTitle')}</h2><p>{t('category.product.inside')}</p><p className="fate-reading-small-note">{t('category.product.length').replace('{n}', contents.count.toLocaleString('en-US'))}</p><ol className="fate-complete-chapter-list">{contents.items.map((item, index) => <li key={item.href}><span>{String(index + 1).padStart(2, '0')}</span><div><h3><a href={item.href}>{item.title}</a></h3><p><ReadingText text={item.text} /></p></div></li>)}</ol></section>
    <section className="fate-complete-section fate-complete-expectations"><h2>{t('category.product.inputs')}</h2><p>{kind === 'bundle' ? t('category.product.twoPeople') : kind === 'compatibility' ? t('category.product.pairOnly') : kind === 'year' ? t('category.product.oneYear') : t('category.product.onePerson')}</p><p>{t('category.examples.note')}</p><details><summary>{t('complete.expectations.scopeTitle')}</summary><p>{info?.scope ?? t('category.bundle.scope')}</p></details></section>
    <section className="fate-complete-section fate-complete-bottom"><h2>{t('complete.bottom.title')}</h2><p>{t('complete.bottom.text')}</p><a href={previewHash(kind)} className="fate-complete-primary">{t('buyer.preview.cta')}</a><p className="fate-reading-small-note">{t('category.product.status')}</p></section>
  </article>
}
