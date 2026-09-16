# aquaengineering.mk

Static site for **Aqua Engineering**, a water and environmental engineering consultancy in Skopje.
Vue 3, Vite, TypeScript. Two languages, no backend.

It replaces a WordPress install, which is being retired. Serving the site as static files removes
the CMS and its plugin surface entirely: there is no PHP, no database and no admin login.

## Quick start

```sh
npm install
cp .env.example .env    # both keys may stay empty
npm run dev
```

English at `http://localhost:5173/`, Macedonian at `http://localhost:5173/mk`.

Requires Node 24, pinned in `.nvmrc`.

## Scripts

| Command                 | Does                                                  |
| ----------------------- | ----------------------------------------------------- |
| `npm run dev`           | Dev server with HMR                                   |
| `npm run build`         | Typecheck, bundle, and emit one HTML shell per locale |
| `npm run preview`       | Serve the production build locally                    |
| `npm test`              | Run the test suite                                    |
| `npm run test:watch`    | Same, in watch mode                                   |
| `npm run test:coverage` | Same, with a coverage report                          |
| `npm run lint`          | ESLint, zero warnings tolerated                       |
| `npm run lint:fix`      | ESLint with `--fix`                                   |
| `npm run format`        | Prettier, write                                       |
| `npm run format:check`  | Prettier, check only (what CI runs)                   |
| `npm run typecheck`     | `vue-tsc --noEmit`                                    |
| `npm run images`        | Resize the licence scans to display-size WebP         |
| `npm run og`            | Regenerate the social cards                           |

The last two write files that are committed, so the build never depends on them. Re-run `images`
after replacing a licence scan and `og` after changing the logo or the taglines.

## Environment

Both are optional and the site degrades rather than breaking without them.

| Variable             | Effect when unset                                                        |
| -------------------- | ------------------------------------------------------------------------ |
| `VITE_WEB3FORMS_KEY` | The contact form hides itself and the published email addresses stand in |
| `VITE_GA4_ID`        | Currently unused — see Known gaps                                        |

## How it is put together

```
src/
  content/      every string on the site, one module per locale
  composables/  useLocale, useHead, useAssets
  components/   one per page section, plus SiteHeader/SiteFooter/SiteLogo
  router/       / and /privacy in English, /mk and /mk/privacy in Macedonian
  assets/       logo, licence scans, self-hosted fonts, design tokens
public/         .htaccess, robots.txt, sitemap.xml, social cards, verification file
scripts/        build-time asset and shell generation
```

**Content is data.** `src/content/types.ts` defines one `SiteContent` interface and both locales are
checked against it, so a missing Macedonian string fails the build instead of leaking English onto
the Macedonian page. A test suite goes further and checks the Macedonian copy is genuinely
translated rather than English pasted across.

**Dates are formatted from content, not from `Intl`.** Chrome ships no Macedonian date data and
resolves `mk-MK` to `en-US`, so `Intl.DateTimeFormat` would print dates in English on the Macedonian
page with nothing to signal it. Month names live in the locale modules.

**The URLs match the old site.** Polylang served English at `/` and Macedonian at `/mk`, so inbound
links and anything already indexed still resolve.

**Design tokens were recovered, not invented.** The palette, type scale, 1140px container and 20px
spacing rhythm in `src/assets/styles/tokens.css` come from the previous site.

**Each locale ships its own HTML shell.** Social unfurlers do not run JavaScript, so per-locale
metadata has to be in the file rather than applied at runtime. A Vite plugin writes both shells from
the same content modules at build time.

## Deployment

GitHub Actions rsyncs the build to cPanel over SSH. CI runs format, lint, typecheck, tests and build
on every push and pull request.

**The deploy workflow is manual only, deliberately.** It rsyncs with `--delete`, and the document
root still holds the previous WordPress install, so a push-triggered run would wipe it and cut the
site over before a backup exists. The `push` trigger gets added at cutover; the reason is recorded
in `.github/workflows/deploy.yml`.

## Known gaps

- **`VITE_GA4_ID` is wired through the environment and CI but nothing reads it.** Analytics is
  either to be implemented behind a consent gate or the variable removed.
- **A non-JS client sees an empty shell.** Per-locale metadata is baked into each shell, so
  unfurlers and crawlers read the right tags, but the body renders through JavaScript. Removing
  that would need prerendering.
- **`ContactSection.vue` is the one file over 250 lines.** The form and the address block are
  independent and could split.

## Licence

None declared. The site, its content, the logo and the licence certificates belong to Aqua
Engineering; the repository is private and no open-source licence is granted. If the code should
carry one, that is the owner's decision and wants a `LICENSE` file to go with it.
