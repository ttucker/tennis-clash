# TennisClash

This project currently uses Angular 22.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build --configuration production` to build the project. Build output is written to the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via Karma.

Note: headless test runs require a local Chrome binary (or setting `CHROME_BIN`).

## Running end-to-end tests

Run `npm run e2e` to execute end-to-end tests via Playwright.

- First-time setup: `npx playwright install chromium`
- Optional UI mode: `npm run e2e:ui`

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Scraper

This repository includes a MediaWiki-based scraper that regenerates `src/app/gears.ts` from Tennis Clash Fandom pages.

- Run it with: `npm run scrape`
- The canonical scraper is `scripts/scrape_api.mjs` (ESM). The generated file is `src/app/gears.ts`.

Legacy scrapers were previously archived in `scripts/legacy/` and have been removed.
