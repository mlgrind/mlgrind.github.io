# Test UX - ML Grind

Run an end-to-end UX test of ML Grind (production: https://mlgrind.github.io/) against a local production build, the way real learners use it.

**Setup**

```bash
npm run build
npx vite preview --port 4197 --strictPort   # serves dist/ at http://localhost:4197/
```

The site is served at the root (`base: '/'`). Drive it with Playwright (`require('playwright')`, `chromium.launch()`). Pyodide loads from cdn.jsdelivr.net, so in a sandbox launch Chromium with the HTTPS proxy (`proxy: { server: process.env.HTTPS_PROXY, bypass: 'localhost,127.0.0.1' }`). Monaco is bundled (there is no `window.monaco`): to replace editor code, click the editor, press Ctrl+A, write the code with `navigator.clipboard.writeText` (grant `clipboard-read`/`clipboard-write`) and press Ctrl+V.

Collect `console` errors and `pageerror`s on every page, and check `document.documentElement.scrollWidth <= clientWidth` (no horizontal overflow) on every page.

## Personas, themes, viewports

Test each persona in **light and dark** at **1440px** and **390px** (plus a pass at **768px**). Seed `localStorage` before the app loads (`context.addInitScript`):

| Key | Purpose |
|-----|---------|
| `ml-lab-dark-mode` | `"true"` / `"false"` (the default with no key is dark) |
| `ml-interview-progress` | `{ [sectionId]: { [problemId]: { status: 'in_progress' \| 'completed', code?, codes?: { pytorch }, solvedIn?: ['numpy' \| 'pytorch'], lastAttempt: ISO } } }` |
| `ml-grind-flashcard-progress` | `{ [cardId]: { cardId, ease, interval, repetitions, nextReview: ISO, lastReviewed? } }` (card ids like `fc-numpy-broadcasting`) |
| `ml-lab-language` | `"pytorch"` or `"numpy"` (the problem page track preference) |
| `mlgrind-analytics-disabled` | `"true"` to keep test runs out of analytics |

1. **First-time visitor**: empty localStorage. Expect "Solve your first problem →" and no dashboard.
2. **Returning user**: several problems completed / in progress across sections, saved code, `lastAttempt` timestamps over the last week, some flash-card state. Expect the "Continue: <problem> →" CTA, the "Your dashboard" cards (CONTINUE / NEXT), Recent activity and the Flash cards panel.
3. **PyTorch user**: returning progress plus `ml-lab-language = pytorch`. Problem pages open on the PyTorch track (`import torch` starter) with the "PyTorch track" note.

## Flows

### Home `/`
- Hero (eyebrow with the problem count, "Learn Machine Learning by Building"), primary CTA.
- **Learning paths** dropdown: every item (NumPy foundations, ML interview prep, Build a transformer, Seven days of ML coding) must be fully visible and clickable **above** the dashboard cards and panels, on desktop and inside the viewport at 390px. Check with `document.elementFromPoint` at each item's centre.
- Dashboard cards, Recent activity (collapsible), Flash cards → Review Now.
- Grouped curriculum (Foundations … Capstone) with `done/total` counts per section.
- "Browse problems reported in interviews →" goes to `/companies`.

### Header and navigation
- Logo → home. **Tools** menu (Scratchpad, Flash Cards with due badge, Cheat Sheet opens `/ml-cheatsheet.html` in a new tab, Send feedback opens the feedback dialog). Theme toggle. Progress pill (`solved / total`).
- On problem pages and below 1024px, **☰** opens the curriculum drawer: collapsible groups, Tools links on mobile, Escape and backdrop click close it, navigating closes it.

### Section page `/section/<id>`
- Icon, title, progress bar; the Introduction collapses and expands (state remembered per section, `aria-expanded` on the toggle); markdown renders (headings, lists, code, tables).
- Problem list: status circle / check, difficulty, test count, "PyTorch" tag when a track exists.

### Problem page `/problem/<section>/<problem>`
- Title row: H1, difficulty, `n / total` with prev/next, share. Company tags ("Reported in interviews at …") toggle a sources panel.
- Tabs: Description, Examples, Hints & Solution.
- NumPy | PyTorch toggle swaps the starter code and saved code per track.
- **Run Tests** with the starter code (fails), with a wrong solution (fails, Expected vs Actual), then reveal all hints → Reveal Solution → Load into Editor → Run Tests (all pass, green "All tests passed!" banner auto-dismisses after 3 s, "Next Problem →" appears, progress pill increments).
- Infinite loop (`while True: pass`) → **Stop** appears next to Run; clicking it stops the run ("Execution stopped.") and Python is ready again. The layout must not shift while running.
- ⋯ menu: Maximize editor / Restore layout, Reset code (confirm dialog), Copy share link (copies `https://mlgrind.github.io/problem/...`).
- Console tabs: Tests (editable visible tests, "+ N hidden tests"), Output, Results, AI Feedback (when the worker is not configured it must fail gracefully).
- **Mobile (390px)**: Problem | Code segmented control, sticky "Start coding" bar, Load into Editor from the Hints view, console tabs on one line, ⋯ menu inside the viewport.

### Other pages
- `/learn/<id>` (e.g. `numpy-foundations`, `ml-interview-prep`, `build-a-transformer`): steps with completion ticks and "n of m completed".
- `/challenge`: seven days.
- `/flashcards`: deck filter chips, Show Answer, grading buttons, due counts.
- `/scratchpad`: Run Code (NumPy available), Stop on long runs, Reset, Clear Output, autosave.
- `/companies` and `/companies?company=uber`: company chips with logos and counts, filtered problem list.
- `/terms`, `/privacy`: readable in both themes.
- An unknown URL shows the 404 page ("Page not found", Back to curriculum).
- Legacy `/problem/<id>` redirects to `/problem/<section>/<id>`.

### Keyboard and accessibility
- Tab through the header and home page: visible focus rings, logical order, no traps.
- Menus (Tools, Learning paths, ⋯): Enter / ArrowDown opens with focus on the first item, ArrowUp/ArrowDown wrap, Home/End, Escape closes and returns focus to the trigger (also after a mouse click), Tab closes and continues from the trigger.
- Feedback dialog: `role="dialog"`, focus starts in the Name field, Tab stays inside, Escape closes and returns focus.

### Visual
- Overlap / z-index (menus and banners above content), clipped text, horizontal overflow, broken layouts at 390px and 768px, light-mode contrast, dark-mode text that is too dark, inconsistent spacing.

## Reporting

For each issue: severity (blocker / major / minor / nit), URL, persona, theme, viewport, repro steps, expected vs actual, and a screenshot path. Finish with a PASS/FAIL table per flow and the console errors found (there should be none).
