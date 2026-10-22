import en from '../../src/i18n/locales/en.ts'
import ko from './locales/ko.ts'
import { PREVIEW_KINDS, previewProduct } from '../../src/report/personal-products.ts'

export const guideText = (key: string) => ko[`admin.guide.${key}`]
export function operatorProducts() {
  return PREVIEW_KINDS.map(kind => {
    const product = previewProduct(kind)
    return { kind, english: product.title, korean: ko[`admin.review.${kind === 'year' ? 'annual' : kind}`],
      price: product.price, count: product.chapters, unit: guideText(kind === 'bundle' ? 'documents' : 'chapters'),
      people: guideText(kind === 'bundle' || kind === 'compatibility' ? 'two' : 'one'), explanation: guideText(`${kind}.what`) }
  })
}
/** Read the customer English directly from its source dictionary; do not maintain a second English version. */
export function operatorSiteGuide() {
  return [
    ['hero', 'home.hero.title'], ['free', 'buyer.step.free.text'], ['card', 'destiny.policy.single.text'],
    ['catalog', 'buyer.catalog.count'], ['preview', 'buyer.preview.intro'], ['sample', 'buyer.preview.sampleNote'],
    ['checkout', 'buyer.checkout.pending'], ['delivery', 'buyer.preview.delivery'],
  ].map(([id, sourceKey]) => ({ id, sourceKey, title: guideText(`site.${id}`), english: en[sourceKey], korean: guideText(`site.${id}.ko`) }))
}
