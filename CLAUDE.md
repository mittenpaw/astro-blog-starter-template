# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at localhost:4321
npm run build        # Build production site to ./dist/
npm run preview      # Build then run via wrangler dev (Cloudflare Workers emulation)
npm run check        # Full validation: astro build + tsc + wrangler deploy --dry-run
npm run deploy       # Build and deploy to Cloudflare Workers (requires wrangler auth)
npm run cf-typegen   # Regenerate worker-configuration.d.ts from wrangler.json bindings
```

There is no test suite. `npm run check` is the closest equivalent — it validates TypeScript and ensures the build + Cloudflare deployment config are valid.

## Architecture

This is an Astro static site deployed as a **Cloudflare Workers static asset site** (not Cloudflare Pages). The `@astrojs/cloudflare` adapter wraps the output in a Worker (`dist/_worker.js/index.js`) that serves assets from the `dist/` directory via the `ASSETS` binding.

### Content Layer

Blog posts live in `src/content/blog/` as `.md` or `.mdx` files. The collection is defined in `src/content.config.ts` with a Zod schema enforcing these frontmatter fields:

- `title` (string, required)
- `description` (string, required)
- `pubDate` (date, required)
- `updatedDate` (date, optional)
- `heroImage` (string path, optional)

Posts are retrieved with `getCollection('blog')` and rendered via `render(post)` from `astro:content`. The URL slug is `post.id` (the filename without extension), not `post.slug`.

### Page Routing

- `/` — `src/pages/index.astro` (homepage)
- `/about` — `src/pages/about.astro`
- `/blog/` — `src/pages/blog/index.astro` (post listing, sorted by `pubDate` descending)
- `/blog/[slug]/` — `src/pages/blog/[...slug].astro` (individual posts via `getStaticPaths`)
- `/rss.xml` — `src/pages/rss.xml.js`

### Component Hierarchy

Every page uses `BaseHead` for all `<head>` content (SEO meta, OG tags, font preloads, canonical URL, global CSS import). `Header` and `Footer` wrap page bodies. `BlogPost.astro` is the shared layout for individual post pages.

### Site-Wide Configuration

`src/consts.ts` exports `SITE_TITLE` and `SITE_DESCRIPTION` — update these when customizing the blog. The canonical site URL is set in `astro.config.mjs` (`site: "https://example.com"`) and must be updated before deployment.

### Styling

All global styles are in `src/styles/global.css` (imported via `BaseHead`). The design uses CSS custom properties (`--accent`, `--gray`, `--black`, etc.) defined on `:root`. The Atkinson Hyperlegible font is loaded from `public/fonts/`. Component-scoped styles are written directly in `.astro` files using `<style>` blocks.

### Cloudflare Integration

`wrangler.json` configures the Worker with `nodejs_compat` flag (required for Astro SSR). Observability logging is enabled by default and source maps are uploaded on deploy. The `platformProxy` option in `astro.config.mjs` enables Cloudflare bindings during local `astro dev`.
