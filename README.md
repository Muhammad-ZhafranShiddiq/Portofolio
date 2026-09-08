# Muhammad Zhafran Shiddiq — Portfolio

A responsive portfolio and lightweight content management system built with Next.js, React, TypeScript, MongoDB, Auth.js/NextAuth.js, Cloudinary, Tailwind CSS, and Motion.

## Features

- Server-rendered public portfolio with animated client islands
- Responsive navigation and layouts from small phones to large desktops
- Google OAuth admin access restricted to one verified email address
- CRUD management for profile, experiences, projects, certifications, and skills
- Draft/published content states and deterministic display ordering
- Direct signed Cloudinary uploads without exposing the API secret
- MongoDB-backed content with a read-only bundled fallback
- SEO metadata, Open Graph image, sitemap, robots rules, and accessible error states

## Local setup

Requirements:

- Node.js 20 or newer
- A MongoDB Atlas database
- A Google OAuth client
- A Cloudinary account with a signed upload preset

Install dependencies and create the local environment file:

```bash
npm install
copy .env.example .env.local
```

Fill in every value in `.env.local`. Never commit this file.

### Google OAuth

Create a Web application OAuth client and add these exact redirect URLs:

```text
http://localhost:3000/api/auth/callback/google
https://your-production-domain.com/api/auth/callback/google
```

Set `ADMIN_EMAIL` to the verified Google account that may access `/admin`. If the Google consent screen is in testing mode, add that account as a test user.

Generate a stable `NEXTAUTH_SECRET` with at least 32 random bytes. Changing it signs out existing sessions.

### MongoDB

Set `MONGODB_URI` to the Atlas connection string and optionally change `MONGODB_DB_NAME`. Then migrate the bundled portfolio content:

```bash
npm run seed
```

The seed is idempotent: it adds the bundled records only when each collection is empty and does not overwrite later admin edits.

Without MongoDB, the public page continues to show bundled content. Admin mutations fail closed until the database is configured.

### Cloudinary

Create separate **signed** presets matching `CLOUDINARY_IMAGE_UPLOAD_PRESET` and `CLOUDINARY_RESUME_UPLOAD_PRESET`. Recommended restrictions:

- Unique generated public IDs and `overwrite` disabled
- JPEG, PNG, WebP, and AVIF for images
- PDF only for résumé uploads
- Maximum file size of 10 MB or lower
- Incoming image dimension limit
- SVG disabled unless separately sanitized

The browser requests a short-lived signature from the protected application endpoint and uploads directly to Cloudinary. `CLOUDINARY_API_SECRET` must never use a `NEXT_PUBLIC_` prefix.

## Development

```bash
npm run dev
```

Open `http://localhost:3000` for the portfolio and `http://localhost:3000/admin` for content management.

Quality checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Content model

Public list records include a `draft` or `published` state, a numeric display order, and timestamps. Only published records are shown publicly. Month-only dates use `YYYY-MM` strings to avoid timezone drift.

All mutations validate a strict allowlist of fields, re-check the current admin email on the server, and revalidate the public portfolio only after a successful database write.
