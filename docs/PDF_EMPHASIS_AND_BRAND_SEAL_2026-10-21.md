# PDF emphasis and home-page seal

- Increased the parchment watermark and margin ornament contrast after the user could not see the previous design.
- Retained authored emphasis from the structured report before plain-text serialisation. The PDF now wraps and measures mixed regular/bold runs and embeds Helvetica Bold for the selected English passages and practical next steps. Plain body text remains regular; notes stay lighter. Adjacent runs using the same face are coalesced.
- Reused the actual home-page FateEmblem artwork, using its existing 62/6/105/108 viewport from the approved hero. HomepageArtwork.jpg is a format conversion of public/images/fate-key-approved-hero.webp for PDF embedding. It is not a newly invented logo. The existing publisher seal surrounds this mark.
- TypeScript and ESLint passed. Final server verification: 27 tests passed (26 payment/report checks plus an emphasis regression), 67.87 seconds.
- All seven regenerated PDFs include real bold text spans and no text outside page bounds. Complete 30 pages, Compatibility 27, Year 33, Career 25, Business 24, Balance 22, Bundle 82. Complete contains 128 bold spans. Representative body and closing pages were rendered and visually inspected.
- Text, calculations, prices and edition r6 remain unchanged. Existing issued artifacts remain immutable. No live payments or operating-domain changes.
