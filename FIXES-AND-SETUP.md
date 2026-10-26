# Lovora Meow — fixes and setup notes

## Changes in this revision

- Theme selection now applies the chosen skin and synchronizes the light/dark mode from that skin in one place.
- Finishing an app-level preview now saves the current experience locally and returns to the editor's Share step instead of simply closing to the homepage.
- Opening the editor after the preview can start at a specified step; normal editing still starts at step 1.
- Starting an editor preview explicitly attempts to save the current draft before opening the scene player.

## Important deployment configuration

The UI fixes do not remove the backend requirements for public sharing or AI writing.

### Groq AI

Set `GROQ_API_KEY` in Vercel Project → Settings → Environment Variables. The project endpoint is `api/ai-draft.js`, and the UI calls `/api/ai-draft`. Optional variables include `GROQ_MODEL` and `AI_HOURLY_LIMIT`. Never expose the Groq secret in frontend code.

### Owner account

Set `OWNER_EMAILS` in Vercel to the exact email address(es) that should receive owner privileges, comma-separated if there are multiple. The server helper checks the signed-in user's verified identity/email against this list. This setting does not create an account; sign up/sign in using that email separately. Avoid using `VITE_OWNER_EMAILS` for privileged access because VITE variables can be exposed to browser code.

### Public share links

The current share flow calls `/api/publish`, requires Supabase authentication and cloud storage/database configuration, and may require payment for non-owner users. Check the Vercel function logs and the browser Network tab if the button fails. Verify the Supabase project has the `experiences` table, `published_experiences` view, and `surprise-media` storage bucket/policies expected by the app. Payment configuration is separate from Groq.

## Validation note

A build was attempted in this environment, but dependencies are not installed in this extracted archive (`react`, `lucide-react`, and other packages are missing). Run `npm install` and then `npm run build` locally or in the deployment pipeline to perform the full TypeScript/Vite build check.
