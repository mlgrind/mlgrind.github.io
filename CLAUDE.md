# ML Coding Lab - Claude Project Guide

This file contains context and instructions for Claude to work on this project effectively.

## Project Overview

This is a LeetCode/HelloInterview-style web application for learning ML by building. Users can:
- Read problem descriptions and theory introductions
- Write Python code in a Monaco editor
- Execute code in-browser via Pyodide (WebAssembly)
- Run tests and see pass/fail results
- Edit test cases to experiment with different inputs/expected values
- Track progress across sections
- Use a Python scratchpad to experiment with code (NumPy pre-loaded)
- Submit feedback via in-app form (sends email via Formspree)
- Sign in with Google to sync progress across devices (Firebase Auth + Firestore)

**Live site:** https://mlgrind.github.io/
**Repository:** https://github.com/mlgrind/mlgrind.github.io

## Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI framework | 18.x |
| TypeScript | Type safety | 5.6 |
| Vite | Build tool | 5.x |
| Tailwind CSS | Styling | 3.x |
| Monaco Editor | Code editor | 4.6 |
| Pyodide | In-browser Python | 0.26 |
| React Router | Routing | 6.x |
| Vitest | Testing | 2.x |
| react-markdown | Markdown rendering | 9.x |
| remark-gfm | GitHub Flavored Markdown (tables, etc.) | - |
| react-helmet-async | Dynamic SEO meta tags | 2.x |
| Firebase | Auth + Firestore cloud sync | 11.x |

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout/
│   │   ├── Header.tsx   # Top navigation with progress
│   │   ├── Footer.tsx   # Copyright notice and legal links
│   │   ├── Sidebar.tsx  # Section navigation
│   │   └── Layout.tsx   # Main layout wrapper
│   ├── CodeEditor/
│   │   └── CodeEditor.tsx   # Monaco editor wrapper
│   ├── Console/
│   │   └── Console.tsx      # Tests/Output tabs with editable test cases
│   ├── ProblemView/
│   │   ├── ProblemDescription.tsx  # Markdown renderer
│   │   ├── Examples.tsx            # Input/output examples
│   │   └── Hints.tsx               # Progressive hints + solution
│   ├── TestRunner/
│   │   └── TestResults.tsx  # Pass/fail display
│   ├── Progress/
│   │   └── ProgressBar.tsx  # Progress indicator
│   ├── Auth/
│   │   └── UserMenu.tsx     # Google sign-in button / avatar dropdown
│   ├── FeedbackModal/
│   │   └── FeedbackModal.tsx  # Feedback form modal (Formspree)
│   └── SEO/
│       └── SEO.tsx          # Dynamic meta tags component
├── context/
│   ├── AuthContext.tsx      # Firebase auth state (Google sign-in/out)
│   └── ProgressContext.tsx  # Global progress state (localStorage + Firestore sync)
├── lib/
│   ├── firebase.ts          # Firebase app init, auth, Firestore exports
│   ├── firestoreSync.ts     # Firestore read/write for progress data
│   └── mergeProgress.ts     # Local + cloud progress merge algorithm
├── data/
│   ├── sections.ts          # Section definitions with intros (14 sections)
│   └── problems/            # Problem definitions by section (~55 problems)
│       ├── index.ts         # Exports all problems
│       ├── numpy-fundamentals.ts   # Part 1: Foundations
│       ├── python-basics.ts
│       ├── einsum.ts
│       ├── pytorch-basics.ts
│       ├── data-preprocessing.ts   # Part 2: Data
│       ├── supervised-learning.ts  # Part 3: Classical ML
│       ├── unsupervised-learning.ts
│       ├── model-evaluation.ts
│       ├── deep-learning.ts        # Part 4: Deep Learning
│       ├── neural-networks.ts
│       ├── cnn.ts
│       ├── transformers.ts
│       ├── generative-models.ts
│       └── e2e-implementations.ts  # Part 5: Capstone
├── hooks/
│   ├── usePyodide.ts    # Python execution hook
│   └── useProgress.ts   # Progress tracking (if needed separately)
├── pages/
│   ├── HomePage.tsx     # Landing page with section cards
│   ├── SectionPage.tsx  # Section intro + problem list
│   ├── ProblemPage.tsx  # Main coding interface (split-pane)
│   ├── ScratchpadPage.tsx  # Python playground for experimentation
│   ├── TermsPage.tsx    # Terms of Service
│   └── PrivacyPage.tsx  # Privacy Policy
├── types/
│   └── index.ts         # TypeScript interfaces
└── __tests__/           # Test files
```

## Key Files to Understand

### Data Layer
- **`src/data/sections.ts`** - Defines the 14 learning sections organized in 5 parts (Foundations → Data → Classical ML → Deep Learning → Capstone)
- **`src/data/problems/*.ts`** - Problem definitions with descriptions, starter code, test cases, hints, solutions (~55 problems total)

### Authentication & Sync
- **`src/lib/firebase.ts`** - Initializes Firebase app from `VITE_FIREBASE_*` env vars. Exports `auth`, `db` (Firestore), `googleProvider`, and `isConfigured` boolean. Gracefully no-ops when env vars are missing.
- **`src/context/AuthContext.tsx`** - React Context wrapping Firebase Auth. Provides `user`, `loading`, `signInWithGoogle` (popup-based), `signOut`, and `useAuth()` hook.
- **`src/lib/firestoreSync.ts`** - `loadProgressFromFirestore(uid)` and `saveProgressToFirestore(uid, progress, userInfo)`. Document path: `users/{uid}`.
- **`src/lib/mergeProgress.ts`** - Per-problem merge: `completed` > `in_progress` > `not_started`. On tie, keeps the more recent `lastAttempt`.

### State Management
- **`src/context/ProgressContext.tsx`** - React Context for tracking problem completion, saved code. Stored in localStorage under key `ml-interview-progress`. When signed in, also syncs to Firestore with debounced writes (2s). Merges local + cloud progress on login.

### Python Execution
- **`src/hooks/usePyodide.ts`** - Loads Pyodide, executes user code, runs test cases, captures stdout/stderr

### Main UI
- **`src/pages/ProblemPage.tsx`** - The main coding interface with split panes (problem description | code editor + console)
- **`src/pages/ScratchpadPage.tsx`** - Python playground for freeform experimentation (accessible via header button, code auto-saves to localStorage key `ml-interview-scratchpad`)
- **`src/components/Console/Console.tsx`** - Console with Tests/Output tabs; users can edit visible test cases to experiment with different inputs

## Current Sections & Problems

Sections are organized in a logical learning progression:

### Part 1: Foundations
| Section | File | Problems |
|---------|------|----------|
| **NumPy Fundamentals** | `numpy-fundamentals.ts` | Array Creation, Indexing, Broadcasting, Aggregations, Reshape/Transpose |
| **Python Basics for ML** | `python-basics.ts` | Array Sum, Matrix Multiply, Broadcast Add |
| **Einstein Summation** | `einsum.ts` | Basics, Matrix Ops, Batch Ops, Advanced (Multi-Head), Equivalences |
| **PyTorch Basics** | `pytorch-basics.ts` | Tensor Creation, Operations, Autograd Concepts, NN Modules, Loss Functions |

### Part 2: Data
| Section | File | Problems |
|---------|------|----------|
| **Data Preprocessing** | `data-preprocessing.ts` | Normalize Features, Handle Missing Data, One-Hot Encode |

### Part 3: Classical ML
| Section | File | Problems |
|---------|------|----------|
| **Supervised Learning** | `supervised-learning.ts` | Linear Regression (GD), Logistic Regression, Logistic (Full), Binary Cross-Entropy, Decision Tree Split |
| **Unsupervised Learning** | `unsupervised-learning.ts` | K-Means Clustering, PCA Implementation |
| **Model Evaluation** | `model-evaluation.ts` | Precision/Recall/F1, Cross-Validation, Confusion Matrix |

### Part 4: Deep Learning
| Section | File | Problems |
|---------|------|----------|
| **Deep Learning Basics** | `deep-learning.ts` | Perceptron, Neural Network Forward, Backpropagation |
| **Neural Networks** | `neural-networks.ts` | Cross-Entropy Loss, MLP Forward, Backprop Gradients, Weight Init, Batch Norm, Dropout |
| **CNNs** | `cnn.ts` | Conv Output Size, 2D Convolution, Max Pooling, Flatten Layer |
| **Transformers** | `transformers.ts` | Scaled Dot-Product Attention, Multi-Head Attention, Positional Encoding, Layer Norm, Causal Mask |
| **Generative Models** | `generative-models.ts` | KL Divergence, VAE Reparameterization, VAE Loss, Diffusion Noise Schedule, Diffusion Forward |

### Part 5: Capstone
| Section | File | Problems |
|---------|------|----------|
| **E2E Implementations** | `e2e-implementations.ts` | 2-Layer MLP (full backprop), Transformer Encoder, VAE, Diffusion Model, CNN |

## Commands

```bash
npm install      # Install dependencies
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build
npm test         # Run tests
npm run deploy   # Build and deploy to GitHub Pages
```

## Firebase / Environment Setup

Firebase is used for Google Sign-In and cross-device progress sync. The app works without Firebase config (auth features are hidden when `isConfigured` is false).

### Environment Variables

Create `.env.local` (gitignored) with:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

These are public Firebase identifiers (not secrets). Security is enforced by Firestore rules.

### Firebase Console Requirements

- **Authentication**: Google sign-in provider enabled, `mlgrind.github.io` in authorized domains
- **Firestore**: Production mode, `nam5` (US) location
- **Firestore Rules**: Users can only read/write their own `users/{uid}` document

### Provider Nesting Order (src/main.tsx)

```
HelmetProvider > BrowserRouter > AuthProvider > ProgressProvider > App
```

`AuthProvider` must wrap `ProgressProvider` because `ProgressContext` calls `useAuth()`.

## Common Tasks

### Adding a New Problem

1. Edit the appropriate file in `src/data/problems/[section].ts`
2. Add a problem object following this interface:

```typescript
{
  id: 'unique-problem-id',           // URL-safe ID
  title: 'Problem Title',
  section: 'section-id',             // Must match section.id
  difficulty: 'easy' | 'medium' | 'hard',
  description: `## Markdown description...`,
  examples: [
    { input: 'np.array([1,2,3])', output: '6', explanation: 'Sum of elements' }
  ],
  starterCode: `import numpy as np

def function_name(arr):
    # Your code here
    pass
`,
  testCases: [
    { id: '1', description: 'Test name', input: '[1,2,3]', expected: '6', hidden: false },
    { id: '2', description: 'Hidden test', input: '[4,5,6]', expected: '15', hidden: true }
  ],
  hints: ['Hint 1', 'Hint 2'],
  solution: `import numpy as np

def function_name(arr):
    return np.sum(arr)
`
}
```

3. Add the problem ID to the section's `problems` array in `src/data/sections.ts`

### Problem Description Best Practices

When writing problem descriptions, follow these guidelines to ensure clarity:

#### 1. Always Document Dictionary Return Formats

If a function returns a dictionary, **always** include an "Expected Return Format" section listing all required keys:

```markdown
### Expected Return Format
Return a dictionary with these keys:
- \`'key1'\`: Description of what this contains
- \`'key2'\`: Description of what this contains
- \`'key3'\`: Description of what this contains
```

**Bad example** (vague):
```typescript
examples: [{ output: "{'zeros': array([[0,0,0,0],...]), ...}" }]
```

**Good example** (explicit):
```typescript
description: `
### Expected Return Format
Return a dictionary with these keys:
- \`'zeros'\`: 3x4 array of zeros
- \`'ones'\`: 2x3 array of ones
- \`'arange'\`: array from 0 to 9
`,
examples: [{ output: "{'zeros': shape (3,4), 'ones': shape (2,3), ...}" }]
```

#### 2. Ensure Example Keys Match Solution Keys

The keys shown in examples must exactly match what the solution returns:

**Wrong** (example uses different keys than solution):
```typescript
// Example shows 'shape_4x6' but solution returns 'arr_2d'
examples: [{ output: "{'shape_4x6': (4,6), ...}" }]
solution: `return { 'arr_2d': arr.reshape(4, 6), ... }`
```

**Correct** (keys match):
```typescript
examples: [{ output: "{'arr_2d': shape (4,6), ...}" }]
solution: `return { 'arr_2d': arr.reshape(4, 6), ... }`
```

#### 3. Match Return Type in Docstring to Actual Return

Ensure the docstring's return description matches what the solution actually returns:

**Wrong** (docstring says matrix, but returns scalar):
```python
def initialize_weights(n_in, n_out):
    """
    Returns:
        W: Initialized weight matrix (n_in, n_out)  # Wrong!
    """
    ...
    return round(np.std(W), 4)  # Actually returns scalar
```

**Correct**:
```python
def initialize_weights(n_in, n_out):
    """
    Returns:
        std: Standard deviation of initialized weights (rounded to 4 decimals)
    """
    ...
    return round(np.std(W), 4)
```

#### 4. Organize Dictionary Keys by Category

For functions returning many keys, group them logically:

```markdown
### Expected Return Format
Return a dictionary with these keys:
- **Global**: \`'global_mean'\`, \`'global_std'\`, \`'global_min'\`, \`'global_max'\`, \`'global_sum'\`
- **Row-wise**: \`'row_mean'\`, \`'row_sum'\`
- **Column-wise**: \`'col_mean'\`, \`'col_sum'\`
- **Indices**: \`'argmax'\` (2D index tuple), \`'argmin'\` (2D index tuple)
```

#### 5. Document Cache/Tuple Return Formats

For functions that return tuples with cache values (common in forward pass implementations), **always** document what goes in the cache:

**Bad example** (vague):
```python
def batch_norm_forward(X, gamma, beta, eps=1e-5):
    """
    Returns:
        out: Normalized output
        cache: Values needed for backward pass  # What values?!
    """
```

**Good example** (explicit):
```markdown
### Return Format
Return \`(out, cache)\` where:
- \`out\`: Normalized and scaled output
- \`cache\`: Tuple \`(X, X_norm, mu, var, gamma, eps)\` for backward pass
```

```python
def batch_norm_forward(X, gamma, beta, eps=1e-5):
    """
    Returns:
        out: Normalized output (batch_size, features)
        cache: Tuple (X, X_norm, mu, var, gamma, eps) for backward pass
    """
```

This ensures users know exactly what to store and in what order, which is critical for implementing the backward pass correctly.

### Adding a New Section

**IMPORTANT CHECKLIST** - Follow ALL steps to avoid common mistakes:

1. **Create the problems file** `src/data/problems/new-section.ts`:
   - Define all problems with solutions
   - **VERIFY each solution against test cases** (see "Validating Test Cases" below)

2. **Add section to `src/data/sections.ts`**:
```typescript
{
  id: 'new-section-id',
  title: 'Section Title',
  description: 'Short description for cards',
  introduction: `# Markdown intro with theory...`,
  icon: '🔥',
  problems: ['problem-1', 'problem-2']
}
```

3. **Export from `src/data/problems/index.ts`**:
   - Add import: `import { newSectionProblems } from './new-section';`
   - Add to allProblems: `...newSectionProblems,`
   - Add to exports: `newSectionProblems,`

4. **Update test expectations** in `src/__tests__/problems.test.ts`:
   - Update sections count: `expect(sections.length).toBe(N)` where N is new total

5. **Verify markdown rendering**:
   - Run `npm run dev` and navigate to the new section
   - Check that tables, code blocks, and formatting render correctly

6. **Run full test suite**: `npm test` - all tests must pass

#### Section Introduction Markdown Requirements

The section introduction uses `ReactMarkdown` with `remarkGfm`. Ensure your markdown includes:

- **Code blocks**: Always specify language for syntax highlighting
  ```markdown
  \`\`\`python
  # Code here
  \`\`\`
  ```

- **Tables**: Use standard markdown table syntax (remarkGfm handles this)
  ```markdown
  | Column 1 | Column 2 |
  |----------|----------|
  | Value 1  | Value 2  |
  ```

- **Inline code**: Use single backticks: \`code\`

### Test Case Format & Guidelines

The test runner in `src/hooks/usePyodide.ts` supports two types of test inputs:

#### 1. Expression-Based Tests (Recommended)

Use when you need to call the function and check properties of the result:

```typescript
// Check output shape
{ input: 'function_name(np.random.randn(4, 8)).shape', expected: '(4, 8)' }

// Check boolean condition with np.allclose
{ input: 'bool(np.allclose(function_name(np.ones((4,))), np.array([0.25, 0.25, 0.25, 0.25])))', expected: 'True' }

// Access dictionary keys from returned dict
{ input: 'create_arrays()["zeros"].shape', expected: '(3, 3)' }

// Access tuple elements
{ input: 'function_name(x, y)[0].shape', expected: '(4, 8)' }
```

**Detection**: The test runner detects expressions by checking if `input` contains the function name, contains `.`, or is a simple identifier.

#### 2. Argument-Based Tests (Simple Cases)

For simple functions where input is passed directly as arguments:

```typescript
// Single array argument
{ input: '[1, 2, 3]', expected: '6' }

// Multiple arguments as tuple
{ input: '([1, 2], [3, 4])', expected: '[[1, 2], [3, 4]]' }

// Dict argument
{ input: '{"key": "value"}', expected: 'result' }
```

#### Critical: Boolean Handling

**ALWAYS wrap boolean comparisons with `bool()`** to avoid NumPy boolean issues:

```typescript
// WRONG - np.allclose returns np.bool_ which stringifies to '1' or '0'
{ input: 'np.allclose(result, expected)', expected: 'True' }  // Will show '1' not 'True'

// CORRECT - wrap with bool()
{ input: 'bool(np.allclose(result, expected))', expected: 'True' }
```

This is because `np.bool_` is a NumPy type that Python's `isinstance(x, int)` catches (since `bool` is a subclass of `int`), causing `1`/`0` output instead of `True`/`False`.

#### Complex Test Setups with Lambda

For tests requiring setup code, use lambda with walrus operator:

```typescript
{
  input: '(lambda: (model := create_mlp([784, 128, 10]), model.forward(np.random.randn(1, 784)).shape)[-1])()',
  expected: '(1, 10)',
}
```

Or multi-step validation:

```typescript
{
  input: `(lambda: (
    x := np.random.randn(2, 4),
    out := function_name(x),
    bool(out.shape == (2, 4) and np.allclose(out.mean(axis=-1), 0, atol=1e-5))
  )[-1])()`,
  expected: 'True',
}
```

#### Common Patterns

| Pattern | Example |
|---------|---------|
| Shape check | `function(input).shape` → `'(4, 8)'` |
| Boolean check | `bool(np.allclose(...))` → `'True'` |
| Dict access | `function()["key"]` → `'value'` |
| Tuple access | `function()[0].shape` → `'(2, 2)'` |
| Rounded float | `round(function(x), 4)` → `'0.1234'` |
| List output | `function(x).tolist()` → `'[[1, 2], [3, 4]]'` |

#### Common Pitfalls to Avoid

1. **Undefined variables**: Never use bare variable names like `zeros_shape` - always call the function: `create_arrays()["zeros"].shape`

2. **NumPy booleans**: Always wrap with `bool()` when comparing with `np.allclose`, `np.all`, `np.any`

3. **Floating point precision**: Use `round(value, N)` or `np.allclose` for float comparisons

4. **Random inputs in expected values**: For random-dependent tests, check shapes/properties, not exact values

5. **Tuple vs List**: Python tuples use `()`, lists use `[]`. Be consistent with expected output format

#### Validating Test Cases

**CRITICAL**: Before adding new problems, you MUST verify solutions work:

**Option 1: Manual Testing via Browser**
1. Run the dev server: `npm run dev`
2. Navigate to the problem
3. Click "Show Solution" and copy it to the editor
4. Click "Run Tests" - all tests should pass

**Option 2: Python Script Validation (Recommended for bulk additions)**
When adding multiple problems, create a Python test script to validate all solutions:

```python
import numpy as np

# Copy solution function
def my_function(...):
    # solution code
    pass

# Test against expected values
result = my_function(test_input)
assert str(result) == expected, f"Got {result}, expected {expected}"
```

Run with: `python3 test_script.py`

**Common Test Case Mistakes to Avoid**:

1. **Incorrect expected values**: Always COMPUTE the expected value, don't guess
   - Wrong: Assuming `1 + 0.9*3 = 3.7` (actually 3.7)
   - Right: Actually calculate: `1 + 0.9*3 = 3.7` ✓

2. **Rounding mismatches**: Match the rounding in solution and expected
   - Solution returns `round(x, 2)` → expected should match precision

3. **List vs string representation**: `[[1, 2], [3, 4]]` not `[[1,2],[3,4]]`
   - Python's default spacing matters for string comparison

4. **Off-by-one in formulas**: Double-check mathematical formulas
   - TD error: `r + γ*V(s') - V(s)` (not `r + γ*V(s) - V(s')`)

5. **Tolerance in floating-point tests**: Use `np.allclose` with appropriate `atol`

### Modifying the UI

- **Layout changes**: `src/components/Layout/`
- **Problem page layout**: `src/pages/ProblemPage.tsx` (uses react-split for panes)
- **Editor settings**: `src/components/CodeEditor/CodeEditor.tsx`
- **Styling**: Tailwind classes, theme colors in `tailwind.config.js`

### Markdown Rendering

Problem descriptions use `react-markdown` with `remark-gfm` for GitHub Flavored Markdown support (tables, strikethrough, etc.).

**Key file**: `src/components/ProblemView/ProblemDescription.tsx`

#### Table Support

Tables require:
1. `remark-gfm` plugin (already installed)
2. Custom component renderers for `table`, `thead`, `tbody`, `tr`, `th`, `td`

Example table in problem description:
```markdown
| Einsum | NumPy |
|--------|-------|
| `'ij->'` | `np.sum(A)` |
```

#### Preventing Horizontal Scrolling

The left panel uses the `.problem-panel` CSS class (defined in `src/index.css`) to prevent horizontal overflow:

```css
.problem-panel {
  word-break: break-word;
  overflow-wrap: break-word;
}

.problem-panel pre {
  white-space: pre-wrap;
  word-break: break-all;
  overflow-x: hidden;
}

.problem-panel code {
  word-break: break-all;
}
```

**Key strategies used:**
1. `overflow-x-hidden` on the container
2. `min-w-0` on flex children (fixes flexbox overflow issues)
3. `break-words` / `break-all` on text elements
4. `whitespace-pre-wrap` on `<pre>` tags (allows wrapping while preserving whitespace)

**When adding new components to the problem panel**, ensure they:
- Don't use `whitespace-nowrap` on text that could be long
- Have proper overflow handling
- Use `break-words` or `break-all` for long strings

### Fixing Python Execution Issues

The Python execution logic is in `src/hooks/usePyodide.ts`:
- `runCode()` - Executes arbitrary Python code
- `runTests()` - Runs test cases against user's function
- Function name is extracted from starter code via regex

## Deployment

The site deploys to GitHub Pages via the `gh-pages` npm package:

```bash
npm run deploy   # Builds and pushes to gh-pages branch
```

The `base` path in `vite.config.ts` is set to `/` for GitHub Pages (org site at `mlgrind.github.io`).

## Known Limitations

1. **Pyodide loading time** - First load takes a few seconds to download WebAssembly
2. **Limited Python packages** - Only numpy is pre-loaded; sklearn requires additional loading
3. **No code execution timeout** - Long-running code can freeze the browser
4. **Firestore sync requires sign-in** - Anonymous users still use localStorage only

## Content References

The problem content was developed using these resources:
- [CS231n: Convolutional Neural Networks for Visual Recognition](https://cs231n.github.io/) - Stanford's deep learning course
- [CS231n Course Schedule](https://cs231n.stanford.edu/schedule.html) - Lecture topics and assignments
- [ML Interview Grind](https://twopug.com/interview-prep-ml-grind/) - Common ML interview topics

## Future Improvements to Consider

- Add more ML packages (sklearn, pandas)
- Implement code execution timeout
- ~~Add user authentication for cloud sync~~ (Done - Firebase Auth + Firestore)
- Add problem difficulty filters
- Add search functionality
- Add code submission history
- Add discussion/comments section
- Add dark/light theme toggle (currently light theme only)
- Add RNN/LSTM section
- Add reinforcement learning basics
- Add more optimization algorithms (SGD variants, Adam details)
- Add GAN implementation section

## Testing

Tests are in `src/__tests__/`:
- `Console.test.tsx` - Console component (editable test cases, tabs, parsing)
- `ProgressContext.test.tsx` - Progress state management
- `problems.test.ts` - Problem data validation

Run with: `npm test`

## Architecture Decisions

1. **Pyodide over backend** - Eliminates need for server, enables offline use
2. **localStorage + Firestore for progress** - localStorage for all users, Firestore sync when signed in via Google
3. **Monaco Editor** - Feature-rich, familiar to developers
4. **Tailwind CSS** - Rapid styling, consistent design system
5. **React Context over Redux** - Simpler state management for this scale

## SEO & LLM Agent Crawling

The site is optimized for both traditional search engines and LLM-based crawlers.

### SEO Files (in `public/`)

| File | Purpose |
|------|---------|
| `robots.txt` | Crawler permissions, allows all major search engines and LLM bots (GPTBot, Claude-Web, etc.) |
| `sitemap.xml` | Complete URL index of all sections and problems |
| `llms.txt` | Summary for LLM agents - site structure, content overview, key URLs |
| `llms-full.txt` | Comprehensive documentation for LLM agents - all sections, problems, formulas |
| `.well-known/ai-plugin.json` | AI agent discovery file |
| `og-image.svg` | Social sharing preview image |

### Dynamic Meta Tags

The `src/components/SEO/SEO.tsx` component provides dynamic meta tags per page using `react-helmet-async`:

```tsx
import SEO from '../components/SEO/SEO';

// In a page component:
<SEO
  title="Page Title"           // Appended with " | ML Coding Lab"
  description="Page description for search results"
  canonical="/path/to/page"    // Canonical URL path
  keywords="optional, extra, keywords"
/>
```

Each page has customized meta tags:
- **HomePage**: Default site-wide tags
- **SectionPage**: Section title and description
- **ProblemPage**: Problem title, difficulty, and description excerpt
- **ScratchpadPage**: Python playground description
- **TermsPage**: Terms of Service
- **PrivacyPage**: Privacy Policy

### index.html Meta Tags

The `index.html` contains:
- Primary meta tags (title, description, keywords)
- Open Graph tags for Facebook/LinkedIn
- Twitter Card tags
- JSON-LD structured data (WebSite + Course schemas)
- Canonical URL

### Updating SEO Content

When adding new sections or problems:
1. The sitemap.xml should be updated with new URLs
2. The llms.txt and llms-full.txt should be updated with new content
3. Dynamic meta tags are automatic via the SEO component

## Legal & Copyright

The project includes copyright protection for educational content.

### License Structure

| Content Type | License | File |
|--------------|---------|------|
| Source code | MIT License | `LICENSE` |
| Educational content | All Rights Reserved | `LICENSE` |

**Educational content** includes problem descriptions, solutions, explanations, test cases, and learning materials. This content may not be reproduced or redistributed without permission.

### Legal Pages

| Page | Route | Purpose |
|------|-------|---------|
| Terms of Service | `/terms` | Usage terms, IP rights, prohibited uses |
| Privacy Policy | `/privacy` | Data collection practices, local storage usage |

### Footer

The `Footer.tsx` component appears on all pages and includes:
- Dynamic copyright year
- Links to Terms and Privacy pages
- GitHub repository link
- License summary text

### Copyright Metadata

Copyright information is included in:
- `index.html` meta tags (`copyright`, `rights`)
- JSON-LD structured data (`copyrightYear`, `copyrightHolder`)
- Footer on every page
