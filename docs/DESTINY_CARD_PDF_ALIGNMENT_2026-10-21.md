# Destiny card PDF alignment

The user identified that the PDF's plain box and key were not the illustrated SNS card. The simple placeholder has been removed.

- Extracted the existing illustrated SVG into DestinyCardArtwork. The public preview wrapper supplies translated labels and keeps its preview watermark; verified server issuance uses the same artwork with a Sandbox edition label.
- Reused the approved card poster, with the tree, crescent and ornate golden key. Shifted its art viewport to keep the top of the key visible without showing the poster's fixed sample name or birth date.
- PDF card fields are calculated from the order: the first card uses the optional recipient name, with the correct day-stem title, element, number pair, palette and reflection. A second subject remains separately identified. Birthday remains hidden by default.
- The PDF's CJK day stem is overlaid with the embedded report font so native SVG fallback fonts cannot turn it into a missing-glyph box.
- Moved the existing sharp dependency into runtime dependencies, aligned the Bun lock workspace entry, enabled JSX for server type checking and included the existing card poster in the function bundle.
- Rendered at 1080 by 1350 and embedded as a high-quality 4:4:4 JPEG. This retains the design while keeping PDFs below the platform response limit; the purchaser access checks remain unchanged.

## Verification

- Full final suite: 38 files, 482 tests passed, 121.43 seconds. This includes the new shared-artwork/watermark test and the seven-product PDF size limit check.
- TypeScript, changed-source ESLint, Vite production build and generation of 21 public content paths passed.
- All seven final PDFs have no text outside page bounds. Complete: 30 pages / 1,079,545 bytes; Compatibility: 27 / 1,473,373; Year: 33 / 1,136,426; Career: 25 / 1,044,409; Business: 24 / 1,036,988; Balance: 22 / 1,012,129; Bundle: 82 / 2,000,262.
- The corrected Complete card page was rendered and visually inspected, including the entire key and actual 乙 caption. A 4:5 review image was rendered from that PDF card area. Review data and the name Minji are fictional.
- Existing purchased snapshots remain immutable. No live payments or operating-domain changes. This does not add a public unwatermarked card export endpoint or claim an actual-phone review.
