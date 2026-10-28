# Round 14 API route fix

This update fixes the catch-all Vercel dispatcher so it resolves endpoint names from `req.query.path` when available and falls back to the request URL path when Vercel rewrites do not populate that query field. This specifically addresses the generic `API endpoint not found.` response for known endpoints such as `/api/publish`.

## Deploy
1. Replace repository files with this ZIP's contents.
2. Commit and push to `main`.
3. Confirm Vercel deploys the new commit (not `dd3fe54`).
4. Test `/api/pricing` in a browser and then test the authenticated Get the share link flow.

This source-level fix does not prove the deployed route or payment system works until runtime-tested. Keep existing environment variables and Supabase migrations.
