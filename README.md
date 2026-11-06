# ML Grind

Practice machine learning by implementing algorithms in real Python, directly in your browser. No installation or account required.

**[Solve your first problem](https://mlgrind.github.io/problem/python-basics/numpy-array-sum)** · **[Seven-day challenge](https://mlgrind.github.io/challenge)** · **[Live curriculum](https://mlgrind.github.io/)**

![ML Grind: real Python, instant feedback, no setup](https://mlgrind.github.io/og-image.png)

The curriculum contains **110 exercises across 16 sections**, covering NumPy, einsum, classical ML, neural networks, computer vision, transformers, LLM decoding, generative models, reinforcement learning, and end-to-end implementations. PyTorch exercises teach PyTorch concepts through NumPy implementations; this browser runtime does not include PyTorch.

- Real CPython and NumPy via Pyodide, isolated in a Web Worker with Stop and a 30-second execution limit.
- Monaco editor, progressive hints, reference solutions, and numerical test feedback.
- Progress and code saved locally; optional Google sign-in syncs progress through Firebase.
- Curated [NumPy](https://mlgrind.github.io/learn/numpy-foundations), [interview](https://mlgrind.github.io/learn/ml-interview-prep), and [transformer](https://mlgrind.github.io/learn/build-a-transformer) paths.
- Shareable exercise links and downloadable completion cards.
- Static descriptions and examples for every exercise, accessible without JavaScript; execution requires JavaScript and an initial runtime download.

## Develop

Use Node.js 22.12+ (or a supported newer release).

```bash
npm ci
npm run dev
```

Optional Firebase configuration is read from `VITE_FIREBASE_*` variables documented in `src/lib/firebase.ts`. Without configuration, local learning works without authentication. See [worker/README.md](worker/README.md) for the optional AI-feedback service; its credentials stay on the server.

| Command | Purpose |
| --- | --- |
| `npm run check` | Lint, unit/reference tests, and production build |
| `npm run test:run` | Run tests once |
| `npm run test:runtime` | Run reference solutions using real Pyodide and NumPy; requires network on first run |
| `npm run build` | Generate discovery files, compile, and generate static routes/PNG cards |
| `npm run verify:static` | Verify built route files, canonical URLs, content, and sitemap coverage |
| `npm run preview` | Preview the production build |
| `npm run deploy` | Build and publish to ML Grind’s GitHub Pages repository; requires write access |

The main app lives in `src/`. Problems and paths live in `src/data/`. `scripts/generate-seo.ts` generates LLM discovery files; `scripts/prerender.tsx` generates HTML for known routes, the deployed sitemap/robots file, and social images. New curriculum entries automatically receive static pages. Unknown routes retain the GitHub Pages 404 fallback and are marked noindex.

## Contribute

1. Add or improve a problem under `src/data/problems/` and register it in its section.
2. Include examples, prerequisites in the description when useful, progressive hints, a reference solution, and visible/hidden tests. Hidden means hidden from the normal UI; client-side tests are not secret or suitable for proctored assessment.
3. Run `npm run check`, `npm run test:runtime`, and `npm run verify:static`. Exercise the editor in a browser for execution changes.
4. Open a pull request with the learning objective, behavior changed, and validation.

Report incorrect answers, unclear explanations, and bugs through [GitHub issues](https://github.com/mlgrind/mlgrind.github.io/issues). See [the outreach kit](docs/outreach.md) and [instructor guide](docs/instructors.md) for sharing and teaching.

## License

Application source code is MIT licensed. Educational content is copyrighted separately; see [LICENSE](LICENSE). Link to exercises when sharing or teaching; contact the maintainer before redistributing educational content.
