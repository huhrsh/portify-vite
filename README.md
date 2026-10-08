# Portify

React/Vite portfolio builder with Firebase authentication and Firestore storage, Cloudinary image uploads and Vercel profile rendering.

## Local setup

1. Use Node **22.12 or newer** (Node 24 recommended).
2. Run `npm ci`. The existing `.npmrc` uses `legacy-peer-deps` for the current dependency tree; keep that setting consistent with the lockfile until a separate dependency update.
3. Copy `.env.example` to `.env.local` and fill in your Firebase web app configuration and Cloudinary cloud name/unsigned upload preset. Environment files with real values must remain untracked. Never put service-account or Cloudinary API secrets in `VITE_*` variables.
4. Enable the required Firebase Email/Password and Google sign-in providers. Configure Firebase authorized domains for local and deployment hosts.
5. Verify deployed Firestore rules and indexes with the project owner. The repository does not provision them. Public profiles query `users` by `username` and `websiteStatus`; dashboard writes must be authorized for the owning account. Do not broadly relax rules to make a query work. Public view counters require carefully restricted updates.
6. Configure Cloudinary preset upload limits (file types, sizes and allowed destinations). Browser file-picker restrictions alone do not enforce these limits.
7. Run `npm run dev`, then open the local URL Vite prints. Use a development Firebase project for editing tests.

## Checks

```sh
npm run build
npm test
npm run lint
```

The SEO endpoint tests read `dist/index.html`, so build before running the complete test suite. The reliability tests cover immutable editor updates, URL normalization and mixed section ordering. These tests mock backend requests; they do not verify deployed security rules, image presets or production account flows.

## Deployment

See [SEO-SETUP.md](SEO-SETUP.md) for Vercel runtime variables, public-query permissions, sitemap and profile metadata checks. `npm run dev` and `npm run preview` serve the client only; serverless endpoints require Vercel development or a preview deployment. Keep `SITE_URL` and `VITE_SITE_URL` set to the intended canonical production domain.

Use a pull-request preview to verify existing profiles and authenticated save/reload flows before merging. No database migration is required by the reliability fixes. Section toggles currently control navigation visibility, not confidentiality of content at direct URLs.
