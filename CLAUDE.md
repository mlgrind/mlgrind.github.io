# ML Coding Lab - Claude Project Guide

This file contains context and instructions for Claude to work on this project effectively.

## Project Overview

This is a LeetCode/HelloInterview-style web application for learning ML by building. Users can:
- Read problem descriptions and theory introductions
- Write Python code in a Monaco editor
- Execute code in-browser via Pyodide (WebAssembly)
- Run tests and see pass/fail results
- Track progress across sections
- Use a Python scratchpad to experiment with code (NumPy pre-loaded)
- Submit feedback via in-app form (sends email via Formspree)

**Live site:** https://itzsid.github.io/ml-coding-lab/
**Repository:** https://github.com/itzsid/ml-coding-lab

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
│   ├── Progress/
│   │   └── ProgressBar.tsx  # Progress indicator
│   └── FeedbackModal/
│       └── FeedbackModal.tsx  # Feedback form modal (Formspree)
├── context/
│   └── ProgressContext.tsx  # Global progress state (localStorage)
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
│   └── ScratchpadPage.tsx  # Python playground for experimentation
├── types/
│   └── index.ts         # TypeScript interfaces
└── __tests__/           # Test files
```

## Key Files to Understand

### Data Layer
- **`src/data/sections.ts`** - Defines the 14 learning sections organized in 5 parts (Foundations → Data → Classical ML → Deep Learning → Capstone)
- **`src/data/problems/*.ts`** - Problem definitions with descriptions, starter code, test cases, hints, solutions (~55 problems total)

### State Management
- **`src/context/ProgressContext.tsx`** - React Context for tracking problem completion, saved code, stored in localStorage under key `ml-interview-progress`

### Python Execution
- **`src/hooks/usePyodide.ts`** - Loads Pyodide, executes user code, runs test cases, captures stdout/stderr

### Main UI
- **`src/pages/ProblemPage.tsx`** - The main coding interface with split panes (problem description | code editor + console)
- **`src/pages/ScratchpadPage.tsx`** - Python playground for freeform experimentation (accessible via header button, code auto-saves to localStorage key `ml-interview-scratchpad`)

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

Before adding new test cases, verify they pass with the solution:
1. Run the dev server: `npm run dev`
2. Navigate to the problem
3. Click "Show Solution" and copy it to the editor
4. Click "Run Tests" - all tests should pass

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

The `base` path in `vite.config.ts` is set to `/ml-coding-lab/` for GitHub Pages.

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
- Add dark/light theme toggle (currently light theme only)
- Add RNN/LSTM section
- Add reinforcement learning basics
- Add more optimization algorithms (SGD variants, Adam details)
- Add GAN implementation section

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
