# LOVORA MEOW
### Interactive Surprise & Celebration Studio — by Sisirey

LOVORA MEOW is a mobile-first web experience for creating personalized digital surprises and celebration stories. It combines playful, cat-inspired branding with animated scenes, personal messages, photos, video, and a creator dashboard—designed for birthdays, special occasions, and meaningful moments.

> **Project status:** Feature-rich MVP. Review configuration and run a production build before relying on a deployment. Cloud publishing requires a configured Supabase project.

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
- [Credits](#credits)

---

## Overview

LOVORA MEOW turns a personal greeting into a small interactive story. A creator can personalize an experience, select a visual theme, add memories, preview scenes, and manage saved creations from a dashboard.

The app is designed around two possible storage paths:

1. **Local mode** — drafts stay in the current browser on the current device. They are useful for trying the creator but are not automatically available on another device.
2. **Supabase mode** — account-aware cloud saving and published experiences can be enabled after the Supabase project, database migration, authentication, and environment variables are configured.

A successful preview does not necessarily mean an experience has been published as a shareable public link. Test the published URL before sharing it.

## Highlights

- Mobile-first layout with touch-friendly controls and responsive scenes.
- Cat-inspired visual identity and celebration-focused interface.
- Light and dark appearance options.
- Guided editor for personal details, messages, and themes.
- Photo and video memory support, subject to browser and upload limits.
- Interactive story playback with animated transitions.
- Celebration scenes that may include a cake, balloons, bouquet, letter, gallery, and finale.
- Optional vibration feedback where browser and device support it.
- Local draft management, such as previewing and editing saved creations, depending on the current implementation.
- Dashboard for saved experiences.
- Optional Supabase integration for authentication, cloud data, and publishing.
- Public experience routes intended for published content.
- Accessibility-minded details such as visible focus styling and reduced-motion support where implemented.
- Vercel configuration for app routes and sharing, depending on the current repository setup.

## Experience creation flow

The creator is organized as a guided workflow. Steps can vary by version and may include:

1. **Occasion and details** — choose the occasion and enter personal details.
2. **Personalization** — customize names and message content.
3. **Visual theme** — choose from available styles.
4. **Memories** — add supported images or videos.
5. **Scene setup** — choose or arrange story scenes.
6. **Preview** — play through the experience before saving or publishing.
7. **Save or publish** — keep a local draft or publish through a configured Supabase account.

## Interactive story scenes

LOVORA MEOW is designed to make a greeting feel like an experience rather than a static card. Depending on the configured story, scenes may include:

- **Welcome scene** — introduces the surprise and recipient.
- **Birthday cake** — a celebratory cake moment.
- **Balloons and effects** — animated decorative elements.
- **Bouquet** — a visual gift moment.
- **Personal letter** — a space for a longer message.
- **Memory gallery** — photos and supported video memories.
- **Finale** — a closing celebration scene.

Audio, sound effects, background music, and vibration depend on browser permissions, user interaction, device support, and the assets included in the project. Browsers commonly block autoplay audio until the visitor interacts with the page.

## Technology stack

- **React** — component-based user interface.
- **TypeScript** — typed application code.
- **Vite** — development server and production bundler.
- **Tailwind CSS** — utility-first styling.
- **Supabase (optional)** — authentication and cloud data for publishing.
- **Vercel** — deployment and serverless route hosting.
- **GitHub** — source control and collaboration.

Check `package.json` and the source code for the exact versions and enabled dependencies.

## Project structure

The repository may contain a structure similar to this:

```text
Lovora-By-Sisirey/
├── api/
│   └── share.js                 # Share-route handler
├── public/
│   ├── media/
│   │   ├── birthday-videos/     # Story video assets
│   │   ├── effects/             # Sound effects
│   │   └── music/               # Background music
│   ├── photos/                  # Example/gallery imagery
│   ├── og-image.png             # Social sharing preview
│   ├── favicon.svg
│   └── ...
├── src/
│   ├── components/
│   │   ├── scenes/              # Individual story scenes
│   │   └── ui/                  # Reusable interface controls
│   ├── pages/
│   │   ├── Landing.tsx
│   │   └── Dashboard.tsx
│   ├── services/
│   │   ├── storage/             # Local/cloud storage adapters
│   │   └── supabase/            # Supabase client integration
│   ├── lib/                     # Audio, effects, and helpers
│   ├── config.ts                # Site configuration
│   ├── data.ts                  # Themes and experience data
│   ├── App.tsx
│   ├── main.tsx
│   └── ...
├── supabase/
│   └── migrations/
│       └── 0001_experiences.sql # Database schema and policies
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vercel.json
└── vite.config.ts
```

Some filenames may differ as the project evolves. Check the repository for the current structure before changing configuration.

## Requirements

- Node.js 20 or newer recommended.
- npm, included with Node.js.
- Git, if cloning or contributing.
- A modern browser.
- Optional: a Supabase project for cloud saving and publishing.
- Optional: a Vercel account for deployment.

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

The app may run in local/demo mode without Supabase variables. Cloud-specific features require the setup described below.

## Build and type-check

Run the type-check command if it exists in `package.json`:

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

The build output is usually written to `dist/`.

> **Release check:** Run `npm install` and `npm run build` after pulling changes and before deploying. Starting the development server does not guarantee that the production build will pass.

## Deploy to Vercel

1. Push the project to GitHub.
2. Sign in to Vercel and choose **Add New → Project**.
3. Import `sisirey12-rgb/Lovora-By-Sisirey`.
4. Set the root directory to the repository root if Vercel asks.
5. Let Vercel detect Vite, or choose the Vite framework preset.
6. Set the build command to `npm run build`.
7. Set the output directory to `dist`.
8. Add required environment variables if using Supabase.
9. Deploy, then test the landing page, creator, dashboard, and share routes.

If the repository includes `vercel.json`, review its rewrites against the current API handlers and frontend routes. Verify deployed behaviour after route changes.

## Optional Supabase setup

Supabase is optional for local-only use. To enable accounts and cloud publishing:

### 1. Create a Supabase project
Create a project in Supabase and keep its credentials private.

### 2. Apply the database migration
If this migration exists in your repository, open the Supabase dashboard's SQL Editor and run the SQL from:

```text
supabase/migrations/0001_experiences.sql
```

Review the migration and its access policies before applying it to an existing production database.

### 3. Configure authentication
Enable the authentication provider supported by the current implementation. Configure email confirmation and redirect URLs as required. Add both your local development URL and deployed site URL to the allowed site and redirect URL lists.

### 4. Add environment variables
Use the exact variable names expected by the project code. Never commit secret values to GitHub.

### 5. Test publishing
Test sign-in, saving, opening a published experience, and access rules with a test experience before sharing publicly.

## Environment variables

The exact names depend on the source code. A typical Vite/Supabase setup may use:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Use `.env.example` and search the source code for `import.meta.env` to confirm the actual names. Vite exposes variables prefixed with `VITE_` to browser code, so **never put service-role keys, private API keys, or other secrets in `VITE_` variables**.

For local development, create `.env.local` in the project root and fill it with your own values. Keep it out of version control.

For Vercel, add the required values under **Project Settings → Environment Variables**, then redeploy.

## Storage and sharing behaviour

### Local drafts
- Stored in the current browser/device using the storage mechanism implemented by the app.
- May be cleared by browser data cleanup, app resets, or storage limits.
- Are not automatically synchronized across devices.
- Are not the same as a public share link.

### Cloud-published experiences
- Require a correctly configured backend and database.
- Should be tested with the project's authentication and database policies.
- Can be shared only if the publish flow successfully creates a valid public route.
- May stop working if the deployment, database, or required configuration is removed.

Do not assume a share link is live merely because the experience previews correctly. Test it in a private/incognito window or a second browser before sending it.

## Accessibility and responsive design

The project aims to provide a comfortable experience across mobile and desktop screens. Good practices include:

- Touch-friendly buttons and controls.
- Visible keyboard focus.
- Clear labels for interactive controls.
- Respect for reduced-motion preferences where implemented.
- Safe-area spacing for phones with display cut-outs.
- Avoiding reliance on sound alone to communicate important information.

Support for individual features can vary by browser, operating system, and current implementation.

## Security and privacy

- Never commit `.env.local`, API secrets, database service-role keys, or private credentials.
- Keep `.env.example` limited to variable names and safe example values.
- Validate uploads and enforce sensible file-size limits.
- Configure database row-level security and access policies before enabling cloud publishing.
- Avoid storing sensitive personal information in surprise messages or media.
- Ask permission before uploading or sharing someone else's photos, videos, or personal messages.
- Test public share links and account permissions before production use.

## Troubleshooting

### `vite: not found`

Install dependencies from the project root:

```bash
npm install
npm run dev
```

### Build fails

Check the first error printed in the terminal, confirm Node.js is supported, and run:

```bash
npm install
npm run build
```

### Supabase or publishing does not work

- Confirm environment variable names match the source code.
- Check the Supabase URL and public/anonymous key.
- Confirm the migration has been applied.
- Check authentication redirect URLs and database policies.
- Redeploy after changing Vercel environment variables.
- Review Vercel function logs for API errors.

### Music or sound does not autoplay

Browsers may block autoplay until the visitor taps or clicks the page. Provide a clear play/unmute control and test on the target mobile browser.

### Photos or videos fail to save

Check file size, supported formats, available browser storage, and upload limits configured by the app. Local browser storage is not intended for unlimited media.

### A shared link shows an error

Confirm the experience was published successfully, the share ID is valid, the deployed route/rewrite exists, and any API or database dependency is configured.

## Roadmap ideas

Possible future enhancements:

- More celebration themes and story templates.
- More customization for typography, colours, and scene order.
- Better media optimization and upload progress.
- Additional language support.
- Optional QR codes for published experiences.
- Improved preview cards for messaging apps.
- More accessibility and reduced-motion controls.
- Exportable keepsakes or downloadable greeting formats.

These are ideas, not promises that the features are already implemented.

## Credits

**LOVORA MEOW** is an interactive surprise and celebration project by **Sisirey**.

- **GitHub repository:** https://github.com/sisirey12-rgb/Lovora-By-Sisirey
- **Live website:** Check the repository or Vercel dashboard for the current deployment URL.

Made for meaningful moments, personal messages, and memorable digital surprises.

---

<p align="center">
  <strong>LOVORA MEOW</strong><br>
  <em>Make the moment feel magical.</em><br>
  Built with care by Sisirey.
</p>
