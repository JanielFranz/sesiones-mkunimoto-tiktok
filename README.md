<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.
https://ai.studio/apps/fe303d0a-4501-4a24-a304-22d48a585201

## Run Locally

**Prerequisites:** Node.js, Docker (for the local Supabase stack)

1. Install dependencies:
   `npm install`
2. Start the local Supabase stack (from the parent folder): `npx supabase start`, then copy `API_URL` and `SERVICE_ROLE_KEY` from `npx supabase status` into `.env` (see `.env.example`).
3. Create the database tables:
   `npm run db:setup`
4. Run the app:
   `npm run dev`

Payments run in **mock mode** by default (`CULQI_MODE=mock`) — any 6-digit Yape approval code is accepted, except `000000` (simulates insufficient funds) and `111111` (simulates an expired code). No external API keys are required for local development; the career roadmap is generated from a curated, local dataset (no AI service).