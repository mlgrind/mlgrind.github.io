# ML Interview Prep - Project Guide

## Overview

This is a LeetCode/HelloInterview-style web application for machine learning interview preparation. It features browser-based Python execution, progress tracking, and organized learning paths.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **Python Execution**: Pyodide (WebAssembly-based Python with NumPy support)
- **State Management**: React Context + localStorage
- **Routing**: React Router v6
- **Testing**: Vitest + React Testing Library

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout/          # Header, Sidebar, Layout wrapper
│   ├── CodeEditor/      # Monaco editor wrapper
│   ├── Console/         # Output display
│   ├── ProblemView/     # Problem description, examples, hints
│   ├── TestRunner/      # Test results display
│   └── Progress/        # Progress bar components
├── context/
│   └── ProgressContext.tsx  # Global progress state
├── data/
│   ├── sections.ts      # Section definitions with introductions
│   └── problems/        # Problem definitions by section
├── hooks/
│   ├── usePyodide.ts    # Python execution hook
│   └── useProgress.ts   # Progress tracking hook
├── pages/
│   ├── HomePage.tsx     # Landing page with section cards
│   ├── SectionPage.tsx  # Section intro + problem list
│   └── ProblemPage.tsx  # Split-pane coding interface
├── types/
│   └── index.ts         # TypeScript interfaces
└── __tests__/           # Test files
```

## Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Preview production build
npm run preview
```

## Key Features

### 1. Browser-Based Python Execution
- Uses Pyodide (CPython compiled to WebAssembly)
- NumPy is pre-loaded for ML operations
- Code runs entirely client-side, no backend required

### 2. Problem Structure
Each problem has:
- Description (Markdown)
- Examples with input/output
- Starter code template
- Test cases (visible and hidden)
- Progressive hints
- Solution (revealed after hints)

### 3. Progress Tracking
- Stored in localStorage under key `ml-interview-progress`
- Tracks: problem status, saved code, last attempt timestamp
- Auto-saves code changes

### 4. Test Runner
- Extracts function name from starter code
- Runs user code against test cases
- Shows pass/fail with expected vs actual values
- Hidden tests prevent hardcoding answers

## Adding New Problems

1. Create/edit file in `src/data/problems/[section].ts`
2. Follow the `Problem` interface:

```typescript
{
  id: 'unique-problem-id',
  title: 'Problem Title',
  section: 'section-id',
  difficulty: 'easy' | 'medium' | 'hard',
  description: '## Markdown description...',
  examples: [{ input: '...', output: '...', explanation: '...' }],
  starterCode: 'import numpy as np\n\ndef solution():\n    pass',
  testCases: [
    { id: '1', description: 'Test name', input: '[1,2,3]', expected: '6', hidden: false }
  ],
  hints: ['Hint 1', 'Hint 2'],
  solution: '# Solution code'
}
```

3. Add problem ID to the section's `problems` array in `src/data/sections.ts`

## Adding New Sections

1. Add section to `src/data/sections.ts`:

```typescript
{
  id: 'section-id',
  title: 'Section Title',
  description: 'Short description',
  introduction: '# Markdown intro content...',
  icon: '🔥',
  problems: ['problem-id-1', 'problem-id-2']
}
```

2. Create corresponding problem file in `src/data/problems/`

## Test Case Format

- `input`: JSON-parseable string representing function arguments
  - Single arg: `'[1, 2, 3]'`
  - Multiple args: `'([1,2], [3,4])'` (tuple format)
- `expected`: String representation of expected output
- Test runner handles numpy array conversion automatically

## Pyodide Integration Notes

- Pyodide loads asynchronously on first use
- Loading state shown in UI while initializing
- NumPy is pre-loaded; other packages can be added via `pyodide.loadPackage()`
- Stdout/stderr captured and displayed in console
- Code execution has no timeout (could be added for safety)

## Styling Guidelines

- Uses Tailwind CSS with custom color palette
- Dark theme by default (`dark-*` colors)
- Primary accent: green (`primary-*` colors)
- Responsive design with sidebar navigation

## Common Tasks

### Fix a bug in Python execution
Edit `src/hooks/usePyodide.ts`

### Modify problem layout
Edit `src/pages/ProblemPage.tsx` and components in `src/components/ProblemView/`

### Update progress tracking logic
Edit `src/context/ProgressContext.tsx`

### Add new test cases to existing problem
Edit the appropriate file in `src/data/problems/`

## Testing

- Unit tests in `src/__tests__/`
- Run with `npm test`
- Tests cover: ProgressContext, problems data validation
- Uses Vitest with jsdom environment
