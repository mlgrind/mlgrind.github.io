# mlgrind-ai-feedback

Cloudflare Worker backing the **AI Feedback** tab in the problem console.

The browser posts the learner's code plus their test results; the worker asks
Claude for a short markdown critique and returns it. The API key lives here as a
Worker secret and is never exposed to the browser.

**Model: `claude-sonnet-5`** (`src/index.ts` → `DEFAULT_MODEL`). Override without
a code change by setting the `ANTHROPIC_MODEL` var in `wrangler.toml`.

## Contract

Consumed by `src/hooks/useAIFeedback.ts` in the parent repo, which posts to
`VITE_AI_FEEDBACK_URL` (default `https://mlgrind-ai-feedback.itzsid.workers.dev`).

| Request | Response |
|---|---|
| `POST` `{code, problemTitle, problemDescription, testResults[]}` | `200 {feedback: "<markdown>"}` |
| `POST` with missing fields | `400 {error: "Missing required fields"}` |
| `POST` with unparseable body | `400 {error: "Invalid JSON"}` |
| `OPTIONS` | `204` + CORS headers |
| any other method | `405 {error: "Method not allowed"}` |
| model declined the submission | `422 {error}` |
| upstream API error / rate limit | `502` / `429 {error}` |

`feedback` is markdown with four `###` sections — Correctness, Implementation,
NumPy / Python Tips, Next Steps — rendered by
`src/components/AIFeedback/AIFeedback.tsx`. That renderer styles `h3`, `p`,
`ul`/`ol`, `li`, `code`, and `strong`; anything else falls back to unstyled
defaults, so keep the system prompt's output shape in sync with it.

CORS is an allowlist: `https://mlgrind.github.io` plus the Vite dev and preview
ports. Unknown origins get the production origin back, so the browser blocks them.

## Setup

> **Run wrangler from this directory, not the repo root.** wrangler resolves its
> config from the current directory. From the repo root it finds no Worker config
> and fails with `Required Worker name missing` (or tries to treat the React app
> as the deploy target). Either `cd worker` first, or use the `worker:*`
> passthrough scripts in the root `package.json`.

```bash
cd worker
npm install
npx wrangler secret put ANTHROPIC_API_KEY   # paste the key when prompted
```

Equivalent from the repo root:

```bash
npm run worker:secret     # set the API key
npm run worker:dev        # local dev server
npm run worker:deploy     # deploy
```

## Develop

```bash
npm run dev          # http://localhost:8787
npm run typecheck
```

`wrangler dev` reads the key from `.dev.vars` (gitignored):

```
ANTHROPIC_API_KEY=sk-ant-...
```

To point the frontend at a local worker, set `VITE_AI_FEEDBACK_URL=http://localhost:8787`
in the parent repo's `.env.local`.

## Deploy

```bash
npm run deploy
```

## Tuning

Both knobs are constants at the top of `src/index.ts`:

- `EFFORT` (`medium`) — raise to `high` if critiques feel shallow, drop to `low`
  for latency. The tab shows a spinner while this runs, so latency is visible.
- `MAX_TOKENS` (`2000`) — deliberately small; the panel is a narrow sidebar and
  long critiques get scrolled past rather than read.

Adaptive thinking is on, so `response.content` can lead with a thinking block —
the handler collects text blocks rather than indexing `content[0]`.
