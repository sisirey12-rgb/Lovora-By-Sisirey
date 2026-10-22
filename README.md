# LOVORA MEOW
### Interactive Surprise & Celebration Studio — by Sisirey

LOVORA MEOW is a mobile-first web experience for creating personalized digital surprises and celebration stories. It combines playful, cat-inspired branding with animated scenes, personal messages, photos, video, and a creator dashboard—designed for birthdays, special occasions, and meaningful moments.

> **Project status:** Feature-rich MVP. Review the configuration notes and run a production build before relying on a deployment. Cloud publishing requires a configured Supabase project.

---

## Contents

- [Overview](#overview)
- [Highlights](#highlights)
- [Experience creation flow](#experience-creation-flow)
- [Interactive story scenes](#interactive-story-scenes)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Requirements](#requirements)
- [Run locally](#run-locally)
- [Build and type-check](#build-and-type-check)
- [Deploy to Vercel](#deploy-to-vercel)
- [Optional Supabase setup](#optional-supabase-setup)
- [Environment variables](#environment-variables)
- [Storage and sharing behaviour](#storage-and-sharing-behaviour)
- [Accessibility and responsive design](#accessibility-and-responsive-design)
- [Security and privacy](#security-and-privacy)
- [Troubleshooting](#troubleshooting)
- [Roadmap ideas](#roadmap-ideas)
- [Credits and project identity](#credits-and-project-identity)

---

## Overview

LOVORA MEOW turns a personal greeting into a small interactive story. A creator can personalize an experience, select a visual theme, add memories, preview the scenes, and manage saved creations from a dashboard.

The app supports two storage paths:

1. **Local mode** — saves drafts in the current browser on the current device. This is useful for trying the creator without configuring a backend.
2. **Supabase mode** — supports account-aware cloud saving and published experiences after the Supabase project, database migration, authentication provider, and environment variables are configured.

Local drafts are not public links and are not automatically available on another device. A cloud share link requires a saved, published experience in the configured Supabase project.

## Highlights

- Mobile-first layout with touch-friendly controls and responsive scenes.
- Cat-inspired visual identity and polished celebration-focused interface.
- Light and dark appearance options.
- Multi-step experience editor with personalization and theme selection.
- Photo and video memory support, subject to browser storage limits.
- Interactive story playback with animated transitions.
- Birthday cake, balloons, bouquet, letter, gallery, and celebration finale scenes.
- Optional vibration feedback where the browser and device support it.
- Local draft management: create, preview, edit, duplicate, and delete.
- Dashboard for managing saved experiences.
- Supabase integration for authentication, cloud data, and publishing.
- Public experience routes intended for published content.
- Reduced-motion support, keyboard-focus styling, accessible scene labels, safe-area spacing, and file-size checks.
- Vercel rewrite configuration for app routes and share links.

## Experience creation flow

The creator is organized as a guided, multi-step workflow. Depending on the current app version, steps include:

1. **Occasion and details** — choose the occasion and enter personal details.
2. **Personalization** — customize the names and message content.
3. **Visual theme** — select from the available visual palettes.
4. **Memories** — add supported images or videos.
5. **Scene setup** — choose and arrange the story scenes.
6. **Preview** — play through the experience before saving or publishing.
7. **Save or publish** — keep a local draft or publish through a configured Supabase account.

The exact available fields and order are defined by the current UI in `src/components/Editor.tsx`.

## Interactive story scenes

The project includes a collection of animated story components, including:

- **Magical introduction** — an animated opening to the experience.
- **Cake assembly and wish** — a staged cake-building sequence and candle moment.
- **Balloon interactions** — balloons that can be popped to reveal personalized messages.
- **Envelope and letter** — an animated envelope that opens to reveal a personal letter.
- **Cat video scene** — a dedicated video moment within the story.
- **Photo and video gallery** — a memory-focused scene.
- **Bouquet artwork** — layered floral illustration and animation.
- **Bow interaction** — a drag-and-release interaction used to trigger a reveal when the target is hit.
- **Balloon tree** — an animated tree and rising heart balloons.
- **Finale** — a celebratory ending with visual effects.

Scene availability and behaviour are implemented in `src/components/scenes/` and coordinated by `src/components/ScenePlayer.tsx`. Some media playback behaviours depend on browser autoplay restrictions and user interaction.

## Technology stack

### Application
- **React 18** — component-based UI.
- **TypeScript** — typed application code.
- **Vite 6** — local development server and production bundler.
- **Framer Motion** — interface and scene animation.
- **Lucide React** — interface icons.
- **Tailwind CSS 3**, PostCSS, and project CSS — styling.

### Data and deployment
- **Supabase JavaScript client** — optional authentication and cloud data.
- **Supabase SQL migration** — database tables, row-level security (RLS), and published-experience access.
- **Vercel** — recommended hosting and route rewrites.

See `package.json` for the authoritative dependency list and scripts.

## Project structure

```text
.
├── api/
│   └── share.js                 # Share-route handler
├── public/
│   ├── media/
│   │   ├── birthday-videos/     # Bundled story video
│   │   ├── effects/             # Sound effects
│   │   └── music/               # Story music
│   ├── photos/                  # Example/gallery imagery
│   ├── og-image.png             # Social sharing preview
│   ├── favicon.svg
│   └── ...
├── src/
│   ├── components/
│   │   ├── scenes/               # Individual animated story scenes
│   │   └── ui/                   # Reusable interface controls
│   ├── pages/
│   │   ├── Landing.tsx
│   │   └── Dashboard.tsx
│   ├── services/
│   │   ├── storage/              # Local/cloud storage adapters
│   │   └── supabase/             # Supabase client integration
│   ├── lib/                      # Audio, reminders, effects, helpers
│   ├── config.ts                 # Site and social configuration
│   ├── data.ts                   # Themes and experience data
│   ├── App.tsx
│   ├── main.tsx
│   └── ...
├── supabase/
│   └── migrations/
│       └── 0001_experiences.sql  # Database schema and RLS policies
├── .env.example                 # Environment variable template
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── vercel.json
└── vite.config.ts
```

Some files may change as the project evolves. Check the repository for the current structure.

## Requirements

- Node.js **20 or newer recommended**
- npm (included with Node.js)
- Git, if cloning or contributing
- A modern browser
- Optional: a Supabase project for accounts and cloud publishing
- Optional: a Vercel account for deployment

## Run locally

Clone the repository and enter its root directory:

```bash
git clone https://github.com/sisirey12-rgb/Lovora-By-Sisirey.git
cd Lovora-By-Sisirey
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite prints a local URL in the terminal (usually `http://localhost:5173`). Open that address in your browser.

The app can run in local demo mode without Supabase environment variables. Cloud-specific features require the additional setup described below.

## Build and type-check

Run the TypeScript project check:

```bash
npm run typecheck
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The production output is written to `dist/`.

> **Release check:** Run `npm install` and `npm run build` after pulling changes and before deploying. A successful development-server start does not guarantee that the production build passes.

## Deploy to Vercel

1. Push the project to GitHub.
2. Sign in to Vercel and choose **Add New → Project**.
3. Import `sisirey12-rgb/Lovora-By-Sisirey`.
4. Set the **Root Directory** to the repository root (`.`) if Vercel asks.
5. Select the **Vite** framework preset (normally detected automatically).
6. Set the build command to `npm run build`.
7. Set the output directory to `dist`.
8. Add the required environment variables if using Supabase.
9. Deploy and test the landing page, creator, dashboard, and share routes.

The included `vercel.json` configures rewrites for `/s/:id`, `/wish/:id`, `/dashboard`, and `/create`. The `/s/:id` route is directed to the share API handler. Verify the deployed behaviour after any route or API changes.

### Vercel environment variables

For cloud features, add the variables listed in [Environment variables](#environment-variables) under **Project Settings → Environment Variables**. Redeploy after changing them.

## Optional Supabase setup

Supabase is optional for local-only use. To enable accounts and cloud publishing:

### 1. Create a Supabase project

Create a project in Supabase and keep its credentials private.

### 2. Apply the database migration

In the Supabase dashboard, open **SQL Editor** and run the SQL from:

```text
supabase/migrations/0001_experiences.sql
```

Review the migration and its policies before applying it to an existing production database.

### 3. Configure authentication

In **Authentication → Providers**, enable the Email provider (or another provider supported by your implementation). Configure email confirmation according to your needs.

In the authentication URL settings, add your local development URL and deployed site URL to the allowed site and redirect URL lists.

### 4. Configure the app

Copy `.env.example` to `.env.local` and fill in your project URL and public anon key. Restart the development server after changing local environment variables.

For Vercel, add the same values to the project's environment-variable settings and redeploy.

### 5. Test cloud behaviour

- Create an account and sign in.
- Save an experience to the account.
- Verify that the dashboard can load and manage the account's experiences.
- Publish a test experience.
- Open the share link in a separate browser profile or private window.
- Confirm that unpublished experiences are not available to anonymous visitors.

Cloud publishing depends on the database schema, authentication settings, row-level security policies, and the current application implementation all being configured consistently.

## Environment variables

The `.env.example` template documents the supported public client configuration:

| Variable | Required for local mode | Purpose |
|---|---:|---|
| `VITE_SUPABASE_URL` | No | URL of the Supabase project |
| `VITE_SUPABASE_ANON_KEY` | No | Supabase public/anon key used by the browser client |
| `VITE_SITE_URL` | No | Optional public site URL for links and social metadata; Vercel may provide the site URL automatically |

Example `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_SITE_URL=https://your-site.vercel.app
```

Replace the example values with your own. Do not commit `.env.local`.

**Never put a Supabase service-role key, private API key, password, or other secret in a `VITE_*` variable.** Vite exposes `VITE_*` values to client-side code. Use only the public anon key in the browser and rely on correctly configured RLS policies for data protection.

## Storage and sharing behaviour

### Local drafts

- Local drafts are stored in the current browser's LocalStorage.
- They belong to that browser profile and device; they do not automatically sync to another device.
- Clearing site data or browser storage can remove saved drafts.
- Images, videos, and other media encoded into browser storage can use substantial space.
- The current app includes an 8 MB per-file limit, but the combined size of multiple files may still exceed browser storage quotas.

If saving fails, try removing large media files, reducing the number of uploaded assets, or clearing obsolete drafts only after backing up anything important.

### Cloud experiences and public links

- Cloud publishing requires a configured Supabase project and a signed-in user.
- Public links are intended for experiences that have been published.
- Anyone with access to a public share link may be able to view its published content.
- Local drafts are not public share links.
- Do not publish sensitive information, private messages, or photos unless you have permission to share them.

### Media playback

Modern browsers may block audio autoplay until the user interacts with the page. Music and video behaviour can therefore differ across browsers and devices. Test the experience on mobile and desktop before sharing it.

## Accessibility and responsive design

The project includes accessibility-minded interface features such as:

- Responsive, touch-friendly controls.
- Keyboard-focus styling.
- Reduced-motion support.
- Scene labels and semantic interface elements.
- Safe-area spacing for devices with display cut-outs.
- Graceful handling when vibration is not supported.

These features should be checked on target devices as the application evolves; they do not replace a full accessibility audit.

## Security and privacy

- Keep `.env.local` and other secret-bearing files out of Git.
- Use only the Supabase public anon key in browser code.
- Never expose the Supabase service-role key in frontend code or `VITE_*` variables.
- Review the SQL migration and RLS policies before production use.
- Validate public access with an anonymous browser session.
- Treat all publicly published experiences and media as shareable by anyone who obtains the link.
- Browser storage is not encrypted private storage; other people using the same unlocked browser profile may be able to access locally saved content.
- Client-side file checks improve usability but are not a malware scanner. Only upload files you have the right to use and share.

## Troubleshooting

### `npm run build` fails

Run:

```bash
npm install
npm run typecheck
npm run build
```

Read the first meaningful TypeScript or build error and resolve it before deploying. Confirm that the Node.js version meets the requirements.

### The page is blank

- Open the browser developer console and check for JavaScript errors.
- Confirm that dependencies installed successfully.
- Check that the deployed build contains the latest GitHub commit.
- Test with a fresh browser tab or reload after deployment completes.

### Vercel returns 404 for `/s/...`

- Confirm that `vercel.json` is present in the deployed repository root.
- Confirm that the `/s/:id` rewrite and `api/share.js` handler are included in the deployment.
- Check Vercel function logs for API errors.
- Confirm that the requested experience exists and is published in Supabase.

### Supabase sign-in or publishing fails

- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Confirm that the database migration has been applied.
- Check that the required authentication provider is enabled.
- Review site URL and redirect URL settings.
- Inspect the browser console and Supabase logs.
- Confirm that RLS policies allow the intended operation.

### A share link does not open an experience

A local draft cannot be opened by another device through a public link. Confirm that the experience was saved to Supabase, published, and is available through the configured published-experience view.

### LocalStorage quota is exceeded

Remove large media from the draft and try saving again. Browser storage limits vary. For larger-scale use, consider moving uploaded media to a properly secured cloud storage bucket rather than storing base64 media in database rows.

## Roadmap ideas

Potential future improvements include:

- Dedicated cloud storage buckets for uploaded media.
- More granular upload validation and storage limits.
- Expanded theme and scene libraries.
- More automated build, type-check, and deployment checks.
- End-to-end testing for creator, dashboard, authentication, and share flows.
- Additional accessibility testing across mobile and desktop browsers.
- More comprehensive setup documentation for production authentication and publishing.

These are suggestions, not promises of features already implemented.

## Credits and project identity

**LOVORA MEOW** is a personalized interactive-surprise project by **Sisirey**.

- Project repository: https://github.com/sisirey12-rgb/Lovora-By-Sisirey
- Brand and site configuration: `src/config.ts`
- Social preview image: `public/og-image.png` (recommended size: 1200 × 630)
- Theme and experience data: `src/data.ts`

Update the project configuration and preview image when changing the deployed site URL or brand details.

---

<p align="center">
  <strong>LOVORA MEOW — Make a moment feel magical.</strong><br>
  Built with care by Sisirey.
</p>
