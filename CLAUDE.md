# ML Interview Prep - Claude Project Guide

This file contains context and instructions for Claude to work on this project effectively.

## Project Overview

This is a LeetCode/HelloInterview-style web application for ML interview preparation. Users can:
- Read problem descriptions and theory introductions
- Write Python code in a Monaco editor
- Execute code in-browser via Pyodide (WebAssembly)
- Run tests and see pass/fail results
- Track progress across sections

**Live site:** https://itzsid.github.io/ml-interview-prep/
**Repository:** https://github.com/itzsid/ml-interview-prep

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

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout/
│   │   ├── Header.tsx   # Top navigation with progress
│   │   ├── Sidebar.tsx  # Section navigation
│   │   └── Layout.tsx   # Main layout wrapper
│   ├── CodeEditor/
│   │   └── CodeEditor.tsx   # Monaco editor wrapper
│   ├── Console/
│   │   └── Console.tsx      # Output/debug console
│   ├── ProblemView/
│   │   ├── ProblemDescription.tsx  # Markdown renderer
│   │   ├── Examples.tsx            # Input/output examples
│   │   └── Hints.tsx               # Progressive hints + solution
│   ├── TestRunner/
│   │   └── TestResults.tsx  # Pass/fail display
│   └── Progress/
│       └── ProgressBar.tsx  # Progress indicator
├── context/
│   └── ProgressContext.tsx  # Global progress state (localStorage)
├── data/
│   ├── sections.ts          # Section definitions with intros
│   └── problems/            # Problem definitions by section
│       ├── index.ts         # Exports all problems
│       ├── python-basics.ts
│       ├── data-preprocessing.ts
│       ├── supervised-learning.ts
│       ├── unsupervised-learning.ts
│       ├── deep-learning.ts
│       ├── model-evaluation.ts
│       ├── neural-networks.ts
│       ├── cnn.ts
│       ├── transformers.ts
│       └── generative-models.ts
├── hooks/
│   ├── usePyodide.ts    # Python execution hook
│   └── useProgress.ts   # Progress tracking (if needed separately)
├── pages/
│   ├── HomePage.tsx     # Landing page with section cards
│   ├── SectionPage.tsx  # Section intro + problem list
│   └── ProblemPage.tsx  # Main coding interface (split-pane)
├── types/
│   └── index.ts         # TypeScript interfaces
└── __tests__/           # Test files
```

## Key Files to Understand

### Data Layer
- **`src/data/sections.ts`** - Defines the 10 learning sections with titles, descriptions, introductions (markdown), and problem IDs
- **`src/data/problems/*.ts`** - Problem definitions with descriptions, starter code, test cases, hints, solutions (~35 problems total)

### State Management
- **`src/context/ProgressContext.tsx`** - React Context for tracking problem completion, saved code, stored in localStorage under key `ml-interview-progress`

### Python Execution
- **`src/hooks/usePyodide.ts`** - Loads Pyodide, executes user code, runs test cases, captures stdout/stderr

### Main UI
- **`src/pages/ProblemPage.tsx`** - The main coding interface with split panes (problem description | code editor + console)

## Current Sections & Problems

| Section | File | Problems |
|---------|------|----------|
| **Python Basics for ML** | `python-basics.ts` | Array Sum, Matrix Multiply, Broadcast Add |
| **Data Preprocessing** | `data-preprocessing.ts` | Normalize Features, Handle Missing Data, One-Hot Encode |
| **Supervised Learning** | `supervised-learning.ts` | Linear Regression (GD), Sigmoid, Gini Impurity, Logistic Regression (full), Binary Cross-Entropy |
| **Unsupervised Learning** | `unsupervised-learning.ts` | K-Means Clustering, PCA Implementation |
| **Deep Learning Basics** | `deep-learning.ts` | Perceptron, Neural Network Forward, Backpropagation |
| **Model Evaluation** | `model-evaluation.ts` | Precision/Recall/F1, Cross-Validation, Confusion Matrix |
| **Neural Networks** | `neural-networks.ts` | Cross-Entropy Loss, MLP Forward Pass, Backprop Gradients, Weight Init (Xavier/He), Batch Normalization, Dropout |
| **CNNs** | `cnn.ts` | Conv Output Size, 2D Convolution, Max Pooling, Flatten Layer |
| **Transformers** | `transformers.ts` | Scaled Dot-Product Attention, Multi-Head Attention, Positional Encoding, Layer Normalization, Causal Mask |
| **Generative Models** | `generative-models.ts` | KL Divergence, VAE Reparameterization, VAE Loss, Diffusion Noise Schedule, Diffusion Forward Process |

## Commands

```bash
npm install      # Install dependencies
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build
npm test         # Run tests
npm run deploy   # Build and deploy to GitHub Pages
```

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

### Adding a New Section

1. Add to `src/data/sections.ts`:
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

2. Create `src/data/problems/new-section.ts` with problem definitions
3. Export from `src/data/problems/index.ts`

### Test Case Format

- **input**: JSON string representing function arguments
  - Single arg: `'[1, 2, 3]'`
  - Multiple args: `'([1,2], [3,4])'` (tuple)
  - Dict arg: `'{"key": "value"}'`
- **expected**: String representation of expected output
- The test runner in `usePyodide.ts` handles numpy array conversion

### Modifying the UI

- **Layout changes**: `src/components/Layout/`
- **Problem page layout**: `src/pages/ProblemPage.tsx` (uses react-split for panes)
- **Editor settings**: `src/components/CodeEditor/CodeEditor.tsx`
- **Styling**: Tailwind classes, theme colors in `tailwind.config.js`

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

The `base` path in `vite.config.ts` is set to `/ml-interview-prep/` for GitHub Pages.

## Known Limitations

1. **Pyodide loading time** - First load takes a few seconds to download WebAssembly
2. **Limited Python packages** - Only numpy is pre-loaded; sklearn requires additional loading
3. **No code execution timeout** - Long-running code can freeze the browser
4. **localStorage only** - Progress doesn't sync across devices

## Content References

The problem content was developed using these resources:
- [CS231n: Convolutional Neural Networks for Visual Recognition](https://cs231n.github.io/) - Stanford's deep learning course
- [CS231n Course Schedule](https://cs231n.stanford.edu/schedule.html) - Lecture topics and assignments
- [ML Interview Grind](https://twopug.com/interview-prep-ml-grind/) - Common ML interview topics

## Future Improvements to Consider

- Add more ML packages (sklearn, pandas)
- Implement code execution timeout
- Add user authentication for cloud sync
- Add problem difficulty filters
- Add search functionality
- Add code submission history
- Add discussion/comments section
- Add dark/light theme toggle
- Add RNN/LSTM section
- Add reinforcement learning basics
- Add more optimization algorithms (SGD variants, Adam details)

## Testing

Tests are in `src/__tests__/`:
- `ProgressContext.test.tsx` - Progress state management
- `problems.test.ts` - Problem data validation

Run with: `npm test`

## Architecture Decisions

1. **Pyodide over backend** - Eliminates need for server, enables offline use
2. **localStorage for progress** - Simple, no auth needed for MVP
3. **Monaco Editor** - Feature-rich, familiar to developers
4. **Tailwind CSS** - Rapid styling, consistent design system
5. **React Context over Redux** - Simpler state management for this scale
