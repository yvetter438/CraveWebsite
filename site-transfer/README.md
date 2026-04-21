# Site transfer bundle (home + legal pages)

This folder contains everything needed to move the **marketing home page** (`/`) and the **Community Guidelines**, **Privacy Policy**, and **Terms of Service** routes to another URL or Next.js app.

**Excluded by design (per your request):** `business` routes, Stripe checkout (`/api/create-checkout-session`), admin routes.

---

## Routes included

| URL path | Source file |
|----------|-------------|
| `/` | `src/app/page.tsx` |
| `/community-guidelines` | `src/app/community-guidelines/page.tsx` |
| `/privacy` | `src/app/privacy/page.tsx` |
| `/terms` | `src/app/terms/page.tsx` |

Shared **root layout** (fonts, metadata, global CSS): `src/app/layout.tsx`, `src/app/globals.css`.

---

## Files in this folder

- **`src/app/page.tsx`** — Full landing (desktop split layout + mobile/tablet). Uses `siteConfig` for copy, colors, hero sections, media paths.
- **`src/app/layout.tsx`** — Barlow Condensed (Google Fonts), favicon paths under `/images/logo.png`.
- **`src/app/globals.css`** — Tailwind layers, scrollbar, mockup animation classes.
- **`src/app/community-guidelines/page.tsx`**, **`privacy/page.tsx`**, **`terms/page.tsx`** — Legal content; internal links use `/`, `/privacy`, `/terms`, `/community-guidelines`.
- **`src/components/Footer.tsx`** — Social + legal links from `siteConfig.footer` and `appStoreLinks`.
- **`src/components/ui/Text.tsx`**, **`Button.tsx`** — Typography and CTA styling from config.
- **`src/config/site.config.ts`** — **Single place** for colors, hero content, footer links, logo path, mockup paths, external URLs (App Store, social).
- **Config copies:** `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json` (path alias `@/*` → `./src/*`).

---

## Static assets (copy from the main repo)

Binary files were **not** duplicated here (disk space). Copy the **`public/`** tree from the project root into the target app’s `public/` so paths match `site.config.ts`:

- `public/images/logo.png` — favicon + header logo
- `public/images/hero-mockups/hero-1-app-mockup.mov` — hero 1 video
- `public/images/hero-mockups/hero-2-app-mockup.png`
- `public/images/hero-mockups/hero-3-app-mockup.png`
- Optional: `public/images/app-store-badge.svg`, README files under `public/images/`

See **`ASSETS-TO-COPY.md`** for a checklist.

---

## npm dependencies (minimal for this slice)

You do **not** need Stripe for these pages. A minimal set:

- **dependencies:** `next`, `react`, `react-dom`
- **devDependencies:** `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `tailwindcss`, `postcss`, `autoprefixer`

Use the main repo’s `package.json` as a reference; omit `@stripe/stripe-js` and `stripe` if the new site has no checkout.

---

## After you move to a new domain or base path

1. **`src/config/site.config.ts`** — Update `footer.social` URLs, `fixedSection.logo`, hero `mockupImage` paths if you reorganize `public/`.
2. **App Store / deep links** — Home page hardcodes `https://crave.onelink.me/7FzW/r6ggd7ej`; change if needed.
3. **“Learn More” (hero section 5)** — Desktop still links to **`/business`** (`page.tsx`). You asked to ignore the business page for this transfer: either add a stub route on the new site, point `href` to an external restaurant URL, or change the mobile `#contact` behavior to match.
4. **Metadata** — Edit `title`, `description`, and `icons` in `src/app/layout.tsx` for SEO on the new URL.
5. **Legal cross-links** — Terms link to `/privacy` and `/community-guidelines`; ensure those routes exist at the new host (same paths, or update `Link href` values).

---

## Environment variables

These pages do **not** require `.env` or Stripe. No checkout or server secrets are needed for static rendering of this bundle.

---

## Quick integration (another Next.js 14 app)

1. Merge `src/` into the target project (preserve `app/` structure).
2. Merge Tailwind/PostCSS/TS path config or align `content` globs with your `tailwind.config.ts`.
3. Copy `public/images/` as above.
4. Run `npm run dev` and hit `/`, `/privacy`, `/terms`, `/community-guidelines`.
