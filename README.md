# StudyMate AI — deploy guide

## What's in this folder
- `index.html` — the whole frontend (one file, no build step)
- `api/ai.js` — the backend function that talks to Google's Gemini API
- `package.json` — tells Vercel this project uses Node functions
- `.env.example` — template for your API key (copy to `.env.local` for local testing)

## 1. Get a free AI key (2 minutes, no credit card)
1. Go to https://ai.google.dev
2. Sign in with any Google account
3. Click "Get API key" -> "Create API key"
4. Copy the key somewhere safe

## 2. Put the project on GitHub
1. Create a new repo on github.com
2. Upload all the files in this folder (keep the `api/` folder structure intact)

## 3. Deploy on Vercel (free)
1. Go to https://vercel.com, sign in with GitHub
2. "Add New Project" -> pick your repo -> Deploy
3. After the first deploy, go to Project -> Settings -> Environment Variables
4. Add: Name = `GEMINI_API_KEY`, Value = the key from step 1
5. Go to the Deployments tab -> redeploy (so it picks up the new env variable)

## 4. Test it
Open the live URL Vercel gives you (something like `studymate-ai.vercel.app`).
Pick a level, subject, and topic, and ask — it should return a real explanation
within a few seconds. If it shows an error, double check the environment
variable name matches exactly: `GEMINI_API_KEY`.

## Notes for the hackathon writeup
- No visitor needs their own AI account or key — your one free Gemini key
  serves everyone, held privately on the server.
- Free tier limits (Gemini 1.5 Flash): ~1,500 requests/day, which is plenty
  for a hackathon demo and judging.
- If you outgrow the free tier later, only `api/ai.js` needs to change —
  the frontend won't need any edits.