# Static assets to copy

Copy from the **CraveFood repo root** into the **target app’s** `public/` directory (same relative paths).

## Required for the current `site.config.ts` references

| File | Purpose |
|------|---------|
| `public/images/logo.png` | Layout favicon (`icons.icon`, `icons.apple`) and hero branding |
| `public/images/hero-mockups/hero-1-app-mockup.mov` | Hero 1 background video (`isVideo: true`) |
| `public/images/hero-mockups/hero-2-app-mockup.png` | Hero 2 mockup |
| `public/images/hero-mockups/hero-3-app-mockup.png` | Hero 3 mockup |

## Optional

| File | Purpose |
|------|---------|
| `public/images/app-store-badge.svg` | Not required by current React code (inline SVG used for App Store CTA) |
| `public/images/README.md`, `public/images/hero-mockups/README.md` | Documentation only |

## Command (from CraveFood repo root, target = your new project)

Adjust `TARGET` to your destination app path:

```bash
TARGET="/path/to/your-next-app"
mkdir -p "$TARGET/public/images/hero-mockups"
cp public/images/logo.png "$TARGET/public/images/"
cp public/images/hero-mockups/hero-1-app-mockup.mov "$TARGET/public/images/hero-mockups/"
cp public/images/hero-mockups/hero-2-app-mockup.png "$TARGET/public/images/hero-mockups/"
cp public/images/hero-mockups/hero-3-app-mockup.png "$TARGET/public/images/hero-mockups/"
```

If you skip a file, update `src/config/site.config.ts` so `mockupImage` / `fixedSection.logo.image` point to assets you actually provide.
