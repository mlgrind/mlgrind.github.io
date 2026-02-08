# ML Interview Prep

A LeetCode-style web application for machine learning interview preparation with browser-based Python execution.

**Live Demo:** https://mlgrind.github.io/

![ML Interview Prep](https://img.shields.io/badge/Python-In_Browser-blue) ![React](https://img.shields.io/badge/React-18-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6)

## Features

- **Browser-Based Python Execution** - Run Python code with NumPy directly in your browser using Pyodide (WebAssembly). No backend or setup required.

- **Interactive Code Editor** - Monaco Editor (VS Code's editor) with Python syntax highlighting, auto-completion, and dark theme.

- **6 Learning Sections** covering ML fundamentals:
  1. Python Basics for ML (NumPy operations)
  2. Data Preprocessing (normalization, encoding, missing data)
  3. Supervised Learning (linear regression, logistic regression, decision trees)
  4. Unsupervised Learning (K-means, PCA)
  5. Deep Learning Basics (perceptron, neural networks, backpropagation)
  6. Model Evaluation (metrics, cross-validation)

- **15+ Hands-On Problems** with:
  - Detailed problem descriptions
  - Interactive examples
  - Progressive hint system
  - Hidden test cases to prevent hardcoding
  - Full solutions (revealed after hints)

- **Progress Tracking** - Your progress is saved locally. Pick up where you left off.

- **Instant Feedback** - Run tests and see results immediately with pass/fail indicators.

## Getting Started

### Online

Visit https://mlgrind.github.io/ - no installation needed!

### Local Development

```bash
# Clone the repository
git clone https://github.com/mlgrind/mlgrind.github.io.git
cd ml-coding-lab

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Code Editor:** Monaco Editor
- **Python Runtime:** Pyodide (CPython compiled to WebAssembly)
- **Testing:** Vitest + React Testing Library

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |
| `npm run deploy` | Deploy to GitHub Pages |

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── Layout/       # Header, Sidebar, Layout
│   ├── CodeEditor/   # Monaco editor wrapper
│   ├── Console/      # Output display
│   ├── ProblemView/  # Problem description, examples, hints
│   └── TestRunner/   # Test results display
├── context/          # React Context for state management
├── data/             # Section and problem definitions
├── hooks/            # Custom hooks (usePyodide, useProgress)
├── pages/            # Page components
└── types/            # TypeScript interfaces
```

## Contributing

Contributions are welcome! Here's how you can help:

1. **Add new problems** - Create problems in `src/data/problems/`
2. **Add new sections** - Extend the curriculum in `src/data/sections.ts`
3. **Improve UI/UX** - Enhance the interface in `src/components/`
4. **Fix bugs** - Check issues and submit PRs

## License

MIT License - feel free to use this for your own learning or projects!

---

Built with React, TypeScript, and Pyodide. Practice ML coding directly in your browser!
