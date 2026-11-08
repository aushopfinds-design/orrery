# Server side independent Saju checker

`oh-my-saju.js.gz` is a compressed bundle of Oh My Saju / Saju Engine 0.9.0 from upstream commit `a8c0cf64adfde8fb1ce253112529edd8e90cc94b`.

It is imported only by `src/report/customer-audit.ts`. It does not replace THE FATE KEY calculations. The browser loads it as a separate on-demand chunk, and the server uses the same code when issuing a My Life report. Birth details are not sent to a third party.

The JavaScript bundle was produced from upstream `dist/index.js` with esbuild using `--bundle --platform=node --format=esm --target=node22`, then gzip-compressed. The report server loads the compressed local file; the buyer preview downloads it from the same site and decompresses it in the browser. The upstream Apache-2.0 license, notice, and bundled third-party license files are included in this directory.
