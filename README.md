# FunStuff
A collection of minigames built with React, TypeScript, and Netlify Functions.

## Games
Game	Description
Chain Reaction	Fill in the blanks of a 4-word chain so each word connects with its neighbors. Locked end words are given; middle words must be guessed, with hints available letter by letter.
Learn with Pixels
Solar Sizer
Vibe Check	
Each game lives under src/components/games/ and is rendered from a shared home screen (Home.tsx), so you can jump between them from one entry point.

## Tech Stack
React + TypeScript — UI, built with Vite

Netlify Functions — serverless backend under netlify/functions/, one or more per game, for AI-generated content

Groq API — fast LLM inference powering the dynamic content in each game

Netlify Dev — runs the frontend and all functions together locally behind a single proxy port

## Prerequisites
- Node.js v22.13.0 or above (required by the current Netlify CLI)
- A Groq account and API key
- npm

## 1. Install Dependencies
```bash
npm install
```
## 2. Install and Set Up Netlify CLI
```bash
npm install -g netlify-cli
```
Log in and link this project to a Netlify site:

```bash
netlify login
netlify link      # link to an existing site
# or
netlify init      # create + link a new site
```

Linking matters even for local development, since Netlify Dev pulls project config and environment variables through this link.
## 3. Get a Groq API Key
1. Sign up at [console.groq.com](https://console.groq.com).
2. Open **API Keys** and create a new key (it starts with `gsk_`).
3. Copy it for the next step.

## 4. Configure Environment Variables
Create a `.env` file in the project root:

```
GROQ_API_KEY=gsk_your_key_here
```

`.env` should already be in `.gitignore` — double check it never gets committed. Netlify Dev automatically loads `.env` and injects variables into every function under `netlify/functions/`, so all four games' backends share the same key without extra config.

For production, set the key on Netlify directly:

```bash
netlify env:set GROQ_API_KEY gsk_your_key_here --context production
```

## 5. Run Locally

Always start the project with Netlify Dev, not a plain `npm run dev`. Netlify Dev proxies Vite and runs every function in `netlify/functions/` side-by-side on one port, so each game's `/api/*` calls resolve correctly:

```bash
netlify dev
```

Open the URL printed in the terminal — typically:

```
http://localhost:8888
```

> **Important:** Don't open Vite's own port (e.g. `http://localhost:5173`) directly. It has no knowledge of the Netlify Functions redirect rules, so any game's API calls will silently fall through to `index.html` instead of hitting the real function — you'll see a `200` response in the network tab that's actually just your HTML shell, and the game will fail to load content.

## Adding a New Game

1. Create a new folder under `src/components/games/` for the game's UI.
2. Add a corresponding function under `netlify/functions/` if it needs AI-generated content.
3. Register the game in `src/data/games.ts` so it shows up on the home screen.
4. Add a `Card.tsx`-based tile if the home screen lists games as cards.

## Deploying

Draft preview:

```bash
netlify deploy
```

Production:

```bash
netlify deploy --prod
```

Confirm `GROQ_API_KEY` is set on Netlify (step 4) before deploying, or AI-dependent games will only serve fallback content, if a fallback exists for that game.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| A game shows "couldn't load" on open | You're likely on Vite's raw port instead of the Netlify Dev proxy port — see step 5 |
| Network tab shows `200` but content fails to parse | Same cause — the catch-all route is serving `index.html` instead of JSON from the function |
| A game always falls back to static/default content | Its Groq call is failing — check `GROQ_API_KEY` is set and check the `netlify dev` terminal logs for that function |
| `netlify dev` can't find a function | Confirm the function file lives under `netlify/functions/` and check the `functions` path in `netlify.toml` |

## Scripts

```bash
npm run build              # Production build of the frontend
npm run preview            # Preview the production build locally
netlify dev                 # Run frontend + all functions together locally
netlify deploy               # Deploy a draft preview
netlify deploy --prod          # Deploy to production
netlify env:set KEY value       # Set an environment variable on Netlify
```

## License

MIT