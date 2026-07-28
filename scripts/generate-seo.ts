/**
 * Generates public/sitemap.xml, public/llms.txt and public/llms-full.txt from the
 * real section/problem data.
 *
 * The previous sitemap was hand-maintained and drifted badly: it listed 14 of 16
 * sections, 61 of 110 problems, omitted /flashcards and the cheat sheet, and
 * published every problem as `/problem/:problemId` -- a route the app does not
 * have, so all 61 entries rendered a blank page.
 *
 * Run with: npm run seo
 */
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { sections } from '../src/data/sections';
import { allProblems } from '../src/data/problems';

const ORIGIN = 'https://mlgrind.github.io';
const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');

type Entry = { loc: string; changefreq: string; priority: string };

const entries: Entry[] = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/scratchpad', changefreq: 'monthly', priority: '0.7' },
  { loc: '/flashcards', changefreq: 'weekly', priority: '0.7' },
  { loc: '/ml-cheatsheet.html', changefreq: 'monthly', priority: '0.6' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
];

for (const section of sections) {
  entries.push({ loc: `/section/${section.id}`, changefreq: 'monthly', priority: '0.8' });
}

// Canonical problem URLs include the section segment: /problem/:sectionId/:problemId
for (const section of sections) {
  for (const problemId of section.problems) {
    entries.push({
      loc: `/problem/${section.id}/${problemId}`,
      changefreq: 'monthly',
      priority: '0.6',
    });
  }
}

const listedProblems = new Set(sections.flatMap(s => s.problems));
const orphans = allProblems.filter(p => !listedProblems.has(p.id));
if (orphans.length > 0) {
  console.warn(`warning: ${orphans.length} problem(s) not listed in any section:`,
    orphans.map(p => p.id).join(', '));
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    e => `  <url>
    <loc>${ORIGIN}${e.loc}</loc>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

writeFileSync(resolve(publicDir, 'sitemap.xml'), xml);
console.log(
  `sitemap.xml: ${entries.length} urls (${sections.length} sections, ` +
    `${entries.filter(e => e.loc.startsWith('/problem/')).length} problems)`
);

// --- llms.txt / llms-full.txt -------------------------------------------------

const problemById = new Map(allProblems.map(p => [p.id, p]));
const problemCount = sections.reduce((n, s) => n + s.problems.length, 0);

const sectionOutline = sections
  .map((s, i) => `- **${String(i + 1).padStart(2, '0')} ${s.title}** (\`/section/${s.id}\`) — ${s.description} _(${s.problems.length} problems)_`)
  .join('\n');

const llms = `# ML Grind - LLM Agent Information

> ML Grind is an interactive platform to learn machine learning by building algorithms from scratch. Practice hands-on coding problems with Python running directly in your browser via Pyodide (WebAssembly).

## About This Site

- **URL**: ${ORIGIN}/
- **Type**: Educational / Learning Platform
- **Topic**: Machine Learning, Deep Learning, Neural Networks, AI
- **Language**: English
- **Tech Stack**: React, TypeScript, Pyodide (in-browser Python), Monaco Editor

## What Users Can Do

1. Read problem descriptions with theory introductions
2. Write Python code in a Monaco editor
3. Execute code in-browser (no server required)
4. Run automated test cases and see pass/fail results
5. Edit test cases to experiment with different inputs
6. Track progress across sections (saved locally, synced when signed in)
7. Review spaced-repetition flash cards
8. Use a Python scratchpad for experimentation

## Content Structure

The platform covers ${sections.length} learning sections with ${problemCount} problems:

${sectionOutline}

## Key URLs

- Home: ${ORIGIN}/
- Scratchpad: ${ORIGIN}/scratchpad
- Flash cards: ${ORIGIN}/flashcards
- Cheat sheet: ${ORIGIN}/ml-cheatsheet.html
- Sections: ${ORIGIN}/section/{section-id}
- Problems: ${ORIGIN}/problem/{section-id}/{problem-id}

Note the problem URL shape: it includes **both** the section id and the problem id.
A URL of the form \`/problem/{problem-id}\` is not canonical; it redirects.

## Technical Details

- **In-Browser Python**: Uses Pyodide (Python compiled to WebAssembly)
- **Pre-loaded Libraries**: NumPy only. pandas, scikit-learn, scipy and torch are
  NOT available -- problems in the PyTorch section reimplement PyTorch semantics
  in NumPy on purpose.
- **Progress Storage**: localStorage, plus Firestore when signed in with Google
- **Code Editor**: Monaco Editor with Python syntax highlighting

## For AI Assistants

When helping users with ML Grind:

1. **Problem Solving**: Each problem includes starter code, test cases, hints, and a solution. Encourage step-by-step learning.

2. **Learning Path**: Recommend starting with Foundations (NumPy, Python Basics) before advancing to Deep Learning topics.

3. **Key Concepts to Cover**:
   - Array operations and broadcasting
   - Gradient descent and backpropagation
   - Attention mechanisms and transformers
   - Generative models (VAE, diffusion)
   - Decoding strategies and RL fundamentals

4. **Common Questions Users Ask**:
   - "How do I implement X from scratch?"
   - "What's the math behind Y?"
   - "Why does this test case fail?"
   - "How does backpropagation work?"

## Contact & Repository

- **Repository**: https://github.com/mlgrind/mlgrind.github.io
- **Issues**: https://github.com/mlgrind/mlgrind.github.io/issues

## Detailed Documentation

For more detailed information, see: /llms-full.txt
`;

writeFileSync(resolve(publicDir, 'llms.txt'), llms);
console.log(`llms.txt: ${sections.length} sections, ${problemCount} problems`);

const curriculum = sections
  .map((section, i) => {
    const problems = section.problems
      .map((pid, j) => {
        const p = problemById.get(pid);
        if (!p) return `${j + 1}. **${pid}** (missing from problem data)`;
        return `${j + 1}. **${p.title}** (\`/problem/${section.id}/${p.id}\`) — ${p.difficulty}`;
      })
      .join('\n');
    return `### Section ${String(i + 1).padStart(2, '0')}: ${section.title}

**URL**: /section/${section.id}
**Summary**: ${section.description}
**Problems** (${section.problems.length}):

${problems}`;
  })
  .join('\n\n---\n\n');

const llmsFull = `# ML Grind - Complete Documentation for LLM Agents

> This document provides comprehensive information about ML Grind for AI assistants and LLM-based crawlers. Use this to understand the platform's full content and help users effectively.

## Platform Overview

ML Grind is a LeetCode-style web application for learning machine learning through hands-on coding. Users implement ML algorithms from scratch using Python (via Pyodide WebAssembly) directly in the browser.

**Live Site**: ${ORIGIN}/
**Repository**: https://github.com/mlgrind/mlgrind.github.io

### Core Features
- Interactive code editor (Monaco)
- In-browser Python execution (no backend required)
- Automated test case validation
- Editable test cases for experimentation
- Progressive hints and full solutions
- Progress tracking (localStorage + optional Google sign-in sync)
- Spaced-repetition flash cards
- Python scratchpad for freeform coding

---

## Complete Curriculum

${sections.length} sections, ${problemCount} problems.

${curriculum}

---

## Technical Notes

### Pyodide Environment
- Python runs in WebAssembly (client-side)
- NumPy is pre-loaded and available
- pandas, scikit-learn, scipy, matplotlib and torch are NOT available
- No network requests for code execution
- Memory limited by browser

### Test Case Format
Tests can be:
1. **Expression-based**: \`function_name(input).shape\` -> \`'(4, 8)'\`
2. **Argument-based**: Direct input passed to function

### Common Testing Patterns
- Shape check: \`function(x).shape\` -> \`'(2, 3)'\`
- Boolean: \`bool(np.allclose(a, b))\` -> \`'True'\`
- Rounded float: \`round(function(x), 4)\` -> \`'0.1234'\`

---

## User Assistance Guidelines

### When Users Are Stuck
1. Point them to the progressive hints (revealed one at a time)
2. Explain the underlying math/concept
3. Break down the problem into smaller steps
4. Reference similar, simpler problems if applicable

### Common Misconceptions
1. **Broadcasting confusion**: Explain shape compatibility rules
2. **Gradient flow**: Trace the chain rule step by step
3. **Attention dimensions**: Q(seq, d_k), K(seq, d_k), V(seq, d_v)
4. **VAE loss components**: Reconstruction vs KL divergence roles

### Recommended Learning Path
1. Start with NumPy Fundamentals
2. Practice Einsum (crucial for transformers)
3. Build up through supervised -> unsupervised -> deep learning
4. Tackle E2E implementations as capstone

---

## API for Crawlers

### Main Routes
- \`GET /\` - Home page with section overview
- \`GET /scratchpad\` - Python playground
- \`GET /flashcards\` - Spaced-repetition review
- \`GET /section/:sectionId\` - Section intro + problem list
- \`GET /problem/:sectionId/:problemId\` - Coding interface
- \`GET /ml-cheatsheet.html\` - Static formula reference

### Content Availability
- All content is client-rendered (React SPA)
- Static content available via sitemap.xml
- Deep links are served through a 404.html SPA fallback on GitHub Pages
- No authentication required
- No rate limiting

---

## Contact

- **GitHub Repository**: https://github.com/mlgrind/mlgrind.github.io
- **Issues/Feedback**: https://github.com/mlgrind/mlgrind.github.io/issues
`;

writeFileSync(resolve(publicDir, 'llms-full.txt'), llmsFull);
console.log(`llms-full.txt: ${curriculum.length} chars of curriculum`);
