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


## Approach for Development (Always use this approach for development) : very important
1.	First deeply understand the goal: analyze user requirements and acceptance criteria, scan the codebase for impacted/leveragable components/services/routes, consult relevant docs (Context7/web), and ask clarifying questions until the feature’s purpose and constraints are crystal clear.
2.	Then propose a detailed implementation plan: summarize the feature and intended behavior, list exactly which files will be created/modified, describe any new components/API endpoints/database schema changes, and explain the reasoning behind your chosen technical approach.
3.	Do NOT generate any code until I explicitly say “proceed”/“yes”/“continue”; after approval, execute the plan, summarize all changes made, and provide clear, step-by-step instructions for how I can manually test and verify the feature.



product info score for seller / product 
Image scoring for product (more than 5 images)  / seller


filter based on last product updated at 
Active inventory table(view): product detail updated in last 3 days 

seller score based on how frequently he's updating, image quality, product info quality