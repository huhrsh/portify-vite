# Profile SEO deployment

Use Node.js 22.12 or newer (Node 24 is also supported by the current Vite version). Run `npm run build` before `npm run test:seo`; endpoint tests read the built HTML template.

Deploy this project to Vercel using `npm run build` and output directory `dist`. Public profile requests use `api/page.js`, which reads the built HTML and returns visible portfolio content with per-page metadata before JavaScript runs. React then mounts the interactive portfolio. All visitors receive the same HTML; there is no crawler-specific rendering.

The functions need the existing `VITE_FIREBASE_PROJECT_ID` and `VITE_FIREBASE_API_KEY` environment variables at runtime as well as build time. They use unauthenticated Firestore REST requests and obey existing Security Rules. No admin credentials are used. Verify that queries for an active username and for `websiteStatus == active` are permitted. If Firestore requests an index, create the index it identifies. Do not broadly relax rules or expose private user fields to enable SEO. Requests fail with 503 if configuration or public data access fails.

The default domain is https://the-portify.vercel.app. For another production domain, set both `SITE_URL` (functions) and `VITE_SITE_URL` (client) to the same HTTPS origin without a trailing slash, and update the Sitemap line in `public/robots.txt`.

`/sitemap.xml` queries active profiles on each request, pages through Firestore results, and excludes sign-in, sign-up, and private routes. It reflects publication, deletion, and username changes without rebuilding. At about 49,000 profiles, implement multiple sitemap files before expanding further. Avoid removing former username URLs from a future redirect history if permanent redirects are desired; the current database has no such history.

After deployment:

1. Open an active profile with JavaScript disabled or inspect View Source. Confirm its name, bio, links, unique title, description, and single canonical URL.
2. Open `/sitemap.xml` and verify it lists active users only. Verify missing and inactive profiles return HTTP 404, and backend failures return 503.
3. Verify authentication and dashboard pages return `X-Robots-Tag: noindex`.
4. In Google Search Console, verify the production domain, submit `/sitemap.xml`, and use URL Inspection on several profiles. Request indexing of representative profiles. Search Console access and Google's indexing decisions are outside the repository.

`npm run dev` and `npm run preview` serve the client only. Use Vercel's development environment or a deployment to exercise the server functions. Local automated tests mock Firestore; they cannot verify production permissions or Google indexing.
