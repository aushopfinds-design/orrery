import { describe, expect, it } from 'vitest'
import type Stripe from 'stripe'
import { LIVE_CATALOG, livePriceMatches, requireLivePrice } from './live-catalog.ts'
import { REPORT_PRICE_CENTS, type PricedReportKind } from '../../src/report/pricing.ts'

describe('approved live catalog', () => {
  for (const [kind, entry] of Object.entries(LIVE_CATALOG) as [PricedReportKind, { product: string; price: string }][]) {
    it(`rejects substituted, inactive and non-USD prices for ${kind}`, () => {
      const price = { id: entry.price, livemode: true, active: true, type: 'one_time', currency: 'usd', unit_amount: REPORT_PRICE_CENTS[kind],
        product: { id: entry.product, livemode: true, active: true, default_price: entry.price, metadata: { report_kind: kind } } } as unknown as Stripe.Price
      expect(() => requireLivePrice(kind, price)).not.toThrow()
      for (const patch of [{ id: 'price_wrong' }, { currency: 'aud' }, { unit_amount: 1 }, { livemode: false }, { active: false }, { type: 'recurring' },
        { product: entry.product }, { product: { id: entry.product, deleted: true } }, { product: { ...price.product as Stripe.Product, id: 'wrong' } },
        { product: { ...price.product as Stripe.Product, active: false } }, { product: { ...price.product as Stripe.Product, default_price: 'price_old' } }]) {
        expect(() => requireLivePrice(kind, { ...price, ...patch } as Stripe.Price)).toThrow()
      }
      // Retiring a price later must not revoke an already paid purchase.
      expect(livePriceMatches(kind, { ...price, active: false })).toBe(true)
    })
  }
})
