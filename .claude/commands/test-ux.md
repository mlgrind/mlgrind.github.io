# Test UX - ML Coding Lab

Perform a comprehensive UX test of the ML Coding Lab website running at http://localhost:5173/ml-coding-lab/. Use the Chrome browser automation tools to interact with the site like a real user would.

**Before starting**: Verify the dev server is running on port 5173. If not, start it with `npm run dev` in the background and wait for it to be ready.

## Test Plan

Run through the following test cases in order. For each test, take a screenshot to verify the result and report PASS/FAIL.

### 1. Homepage Load
- Navigate to http://localhost:5173/ml-coding-lab/
- Verify the page title is "ML Coding Lab"
- Verify the hero text "Learn ML By Building" is visible
- Verify the Overall Progress bar is displayed
- Verify section cards are rendered (at least 10 sections)
- Verify the sidebar shows "LEARNING SECTIONS" with numbered items

### 2. Header Navigation
- Verify "ML Coding Lab" logo/title links to home
- Verify "Scratchpad" button is present
- Verify "Cheat Sheet" button is present
- Verify "Feedback" button is present
- Verify "Overall Progress" indicator is shown with percentage

### 3. Section Page
- Click on any section card (e.g., "NumPy Fundamentals")
- Verify the section title and description are displayed
- Verify the Introduction section renders with markdown formatting (headings, code blocks, bullet lists)
- Verify the Problems list shows problem cards with:
  - Problem number
  - Title
  - Difficulty badge (easy/medium/hard)
  - Test case count
  - Arrow indicator

### 4. Problem Page - Layout
- Click on a problem from the list
- Verify the split-pane layout:
  - Left: Problem description with title, difficulty badge, description, examples, function signature
  - Right top: Monaco code editor with starter code
  - Right bottom: Console with Tests/Output tabs
- Verify "Python ready" indicator (green dot) appears
- Verify "Run Tests" button is visible
- Verify breadcrumb navigation is shown (Section name / Problem name)

### 5. Code Editor
- Click into the Monaco editor
- Verify you can select all text (Cmd+A) and type new code
- Verify syntax highlighting works (keywords like `import`, `def` should be colored)
- Verify "Maximize" and "Reset" buttons are present

### 6. Python Execution - Passing Tests
- For the current problem, paste/type the correct solution (look at the problem and write a valid solution, or use the solution from hints)
- Click "Run Tests"
- Wait for execution (2-3 seconds)
- Verify:
  - Test Results show with green checkmarks
  - "X/X passed" indicator appears
  - Progress updates in sidebar and header
  - "Next Problem" button appears after all tests pass

### 7. Python Execution - Failing Tests
- Navigate to a different problem
- Click "Run Tests" with the starter code (which should fail)
- Verify:
  - Test Results show with red X marks for failures
  - Error messages or "Expected vs Got" output is shown
  - No "Next Problem" button appears

### 8. Hints & Solution
- On any problem page, scroll down in the left panel
- Verify "Hints" section shows "Show Hint (0/N)"
- Click "Show Hint" - verify first hint appears
- Click again to reveal more hints
- Verify "Solution" section says "Reveal all hints first to unlock the solution"
- Reveal all hints, then verify "Reveal Solution" button appears
- Click "Reveal Solution" and verify solution code is shown

### 9. Test Cases Tab
- Click the "Tests (N)" tab in the console
- Verify test cases are displayed with:
  - Test description
  - Input values
  - Expected output
- Verify hidden tests show "+ N hidden test (not editable)"
- Verify visible test cases are editable (click into input/expected fields)

### 10. Scratchpad
- Click "Scratchpad" in the header
- Verify the Python Scratchpad page loads with:
  - Full-width Monaco editor
  - "Run Code", "Reset", "Clear Output" buttons
  - "Code is auto-saved" indicator
  - Output panel
- Type or modify code in the editor
- Click "Run Code" and verify output appears
- Verify NumPy is available (e.g., `import numpy as np; print(np.array([1,2,3]))`)

### 11. Progress Persistence
- Solve a problem (if not already done)
- Navigate to the homepage
- Verify the section's progress bar updated
- Verify overall progress percentage updated
- Reload the page (navigate away and back)
- Verify progress is still persisted (localStorage)

### 12. Footer & Legal Pages
- Scroll to the bottom of the homepage
- Verify footer shows:
  - Copyright with current year
  - "Terms of Service" link
  - "Privacy Policy" link
  - "GitHub" link
  - License text
- Click "Terms of Service" - verify the page loads with legal content
- Navigate back and click "Privacy Policy" - verify it loads

### 13. Responsive Elements
- Verify no horizontal scrolling on any page
- Verify code blocks in problem descriptions wrap properly
- Verify the sidebar doesn't overflow

### 14. Cheat Sheet
- Click "Cheat Sheet" in the header
- Verify the ML Interview Cheat Sheet page loads (may open in new tab)
- Verify it contains reference material organized in sections
- Verify "Print / Save as PDF" button is present

## Reporting

After completing all tests, provide a summary table:

```
| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 1 | Homepage Load | PASS/FAIL | ... |
| 2 | Header Navigation | PASS/FAIL | ... |
...
```

Also note any:
- Visual issues (misalignment, overflow, clipping)
- Functional bugs (broken interactions, wrong behavior)
- Performance concerns (slow loading, lag)
- UX improvements that could be made
