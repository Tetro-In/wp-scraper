# Project Context: WPPConnect Catalog Fetcher

## Product Description
This tool is a specialized Node.js automation script designed to extract complete product catalogs from WhatsApp Business accounts. It bypasses standard API limitations by aggregating data from both the main listing and individual collections, ensuring 100% inventory retrieval. The output is structured, deduplicated, and formatted for immediate analytical use or integration.

## Technical Decisions

1.  **Library Selection**: Utilized `@wppconnect-team/wppconnect` for its robust injection-based access to WhatsApp Web internals, allowing deeper access than standard web scraping.
2.  **Nightly Build Utilization**: Adopted the `nightly` build of wppconnect to instantly mitigate breaking changes in WhatsApp Web's module structure (specifically the `reading 'm'` error).
3.  **Dual-Strategy Fetching**: Implemented a hybrid fetching strategy that queries the main `getProducts` endpoint AND iterates through `getCollections` to circumvent the default 10-item pagination limit.
4.  **Data Deduplication**: Employed a `Map<string, Product>` data structure keyed by unique Product IDs to seamlessly merge catalog data from multiple sources without duplicates.
5.  **Graceful Resource Management**: Integrated `SIGINT`/`SIGTERM` listeners and `try/finally` blocks to guarantee Puppeteer browser closure, preventing "SingletonLock" errors and zombie processes.
6.  **Smart Price Formatting**: Applied a standardization logic (dividing raw values by 1000 and using `Intl.NumberFormat`) to convert WhatsApp's internal micro-currency format into human-readable strings.
7.  **Session Persistence**: Configured custom `userDataDir` paths to persist browser sessions, eliminating the need for repetitive QR code scanning during development and execution.
8.  **Race Condition Handling**: Introduced explicit wait buffers (10s) post-initialization to ensure the internal `wapi.js` bridge is fully injected and synchronized before attempting API calls.
9.  **Automated Lock Cleanup**: Added startup routines to detect and clean stale `SingletonLock` files from previous crashed sessions, ensuring reliable subsequent executions.
10. **Structured Output**: Transitioned from console logging to JSON file output to preserve data fidelity, nested structures (like media URLs), and facilitate downstream data consumption.

