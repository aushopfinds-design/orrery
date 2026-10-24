# Launch pricing — 15 October 2026

The owner requested prices for the two undecided reports and a clear promotional price presentation. All displayed prices remain launch plans because purchases are not open.

| Product | Planned launch price (USD) |
| --- | ---: |
| Everyday Balance | 6.99 |
| Year Ahead | 7.99 |
| Career & Money | 8.99 |
| Love Compatibility | 9.99 |
| Business & Entrepreneurship | 9.99 |
| Complete Life Reading | 14.99 |
| Complete Bundle | 22.99 |

## Price positioning

Business has seven focused chapters and sits with the US$9.99 focused reports. Everyday Balance has five chapters and is the lowest-price entry at US$6.99. Existing individual prices are preserved. The bundle drops from its previous proposed US$24.99 to US$22.99 to provide a genuine comparison of at least 30% against its three included individual reports.

Official comparison references checked on 15 October 2026:

- [Astrology.com Career Report](https://shop.astrology.com/product/career-report/) — listed at $21.99 in the retrieved product listing.
- [Astrology.com report catalog](https://shop.astrology.com/product-category/reports/) — includes focused digital reports and larger chart reports. These are positioning references, not identical products or evidence that our price guarantees conversion.
- [ACCC price displays](https://www.accc.gov.au/consumers/pricing/price-displays) — explains misleading prior-price and sale-price comparisons.

## Promotion basis

Individual reports have a launch-price label without an invented higher historical price or percentage-off claim. No countdown, deadline or stock scarcity was added.

The three bundle components are Complete Life Reading (14.99), Love Compatibility (9.99) and Year Ahead (7.99). Their separate planned prices total **US$32.97**. The bundle at **US$22.99** saves **US$9.98**, or about **30.27%**. Displayed savings round down to **30%**. The crossed-out figure is labelled **Bought separately**; it is not presented as a previous bundle price.

`src/report/pricing.ts` owns integer USD cents and computes the comparison. Catalog, product pages, the buyer guide and personal previews use the same price component and source. This prevents a price change on one screen from leaving an inconsistent amount elsewhere.

## Verification

Automated checks cover complete catalog prices, the two new amounts, bundle composition, exact subtotal/saving, conservative percentage rounding and USD formatting. Existing report tests, locale key parity and the production build are checked before deployment. Browser/on-device visual testing is unavailable in this managed environment; production checks verify the deployed source and CSS rather than a rendered phone screen.
