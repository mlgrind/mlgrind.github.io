import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Console from '../components/Console/Console';
import { TestCase } from '../types';

// Mock scrollIntoView which doesn't exist in jsdom
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

// Helper to create test cases
const createTestCase = (
  id: string,
  input: string,
  expected: string,
  hidden = false,
  description = `Test ${id}`
): TestCase => ({
  id,
  description,
  input,
  expected,
  hidden,
});

describe('Console Component', () => {
  describe('Test Case Formatting', () => {
    it('should display visible test cases in editable format', () => {
      const testCases = [
        createTestCase('1', 'func([1,2,3])', '6', false, 'Basic sum'),
        createTestCase('2', 'func([4,5,6])', '15', false, 'Another sum'),
      ];

      render(
        <Console
          output={[]}
          testCases={testCases}
          problemId="test-problem"
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(
        '# Test 1: Basic sum\n' +
        'input: func([1,2,3])\n' +
        'expected: 6\n\n' +
        '# Test 2: Another sum\n' +
        'input: func([4,5,6])\n' +
        'expected: 15'
      );
    });

    it('should handle values with colons in input/expected', () => {
      const testCases = [
        createTestCase('1', "func({'key': 'value'})", "{'result': 42}", false, 'Dict test'),
      ];

      render(
        <Console
          output={[]}
          testCases={testCases}
          problemId="test-problem"
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(
        "# Test 1: Dict test\n" +
        "input: func({'key': 'value'})\n" +
        "expected: {'result': 42}"
      );
    });

    it('should not show hidden test cases in textarea', () => {
      const testCases = [
        createTestCase('1', 'func([1,2,3])', '6', false, 'Visible test'),
        createTestCase('2', 'func([4,5,6])', '15', true, 'Hidden test'),
      ];

      render(
        <Console
          output={[]}
          testCases={testCases}
          problemId="test-problem"
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(
        '# Test 1: Visible test\n' +
        'input: func([1,2,3])\n' +
        'expected: 6'
      );
      // Should show hidden test indicator
      expect(screen.getByText(/\+ 1 hidden test/)).toBeInTheDocument();
    });
  });

  describe('Test Case Parsing', () => {
    it('should parse edited test cases and call onTestCasesChange', () => {
      const onTestCasesChange = vi.fn();
      const testCases = [
        createTestCase('1', 'func([1,2,3])', '6', false, 'Basic sum'),
      ];

      render(
        <Console
          output={[]}
          testCases={testCases}
          onTestCasesChange={onTestCasesChange}
          problemId="test-problem"
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, {
        target: {
          value:
            '# Test 1: Modified test\n' +
            'input: func([7,8,9])\n' +
            'expected: 24',
        },
      });

      expect(onTestCasesChange).toHaveBeenCalledWith([
        {
          id: '1',
          description: 'Modified test',
          input: 'func([7,8,9])',
          expected: '24',
          hidden: false,
        },
      ]);
    });

    it('should preserve hidden tests when parsing', () => {
      const onTestCasesChange = vi.fn();
      const testCases = [
        createTestCase('1', 'func([1,2,3])', '6', false, 'Visible'),
        createTestCase('2', 'func([4,5,6])', '15', true, 'Hidden'),
      ];

      render(
        <Console
          output={[]}
          testCases={testCases}
          onTestCasesChange={onTestCasesChange}
          problemId="test-problem"
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, {
        target: {
          value:
            '# Test 1: Modified visible\n' +
            'input: func([7,8,9])\n' +
            'expected: 24',
        },
      });

      expect(onTestCasesChange).toHaveBeenCalledWith([
        {
          id: '1',
          description: 'Modified visible',
          input: 'func([7,8,9])',
          expected: '24',
          hidden: false,
        },
        // Hidden test should be preserved
        testCases[1],
      ]);
    });

    it('should filter out incomplete test cases (missing input or expected)', () => {
      const onTestCasesChange = vi.fn();
      const testCases = [
        createTestCase('1', 'func([1,2,3])', '6', false, 'Complete'),
      ];

      render(
        <Console
          output={[]}
          testCases={testCases}
          onTestCasesChange={onTestCasesChange}
          problemId="test-problem"
        />
      );

      const textarea = screen.getByRole('textbox');
      // Missing expected value
      fireEvent.change(textarea, {
        target: {
          value:
            '# Test 1: Incomplete\n' +
            'input: func([1,2,3])',
        },
      });

      expect(onTestCasesChange).toHaveBeenCalledWith([]);
    });

    it('should return only hidden tests when text is empty', () => {
      const onTestCasesChange = vi.fn();
      const testCases = [
        createTestCase('1', 'func([1,2,3])', '6', false, 'Visible'),
        createTestCase('2', 'func([4,5,6])', '15', true, 'Hidden'),
      ];

      render(
        <Console
          output={[]}
          testCases={testCases}
          onTestCasesChange={onTestCasesChange}
          problemId="test-problem"
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '' } });

      expect(onTestCasesChange).toHaveBeenCalledWith([testCases[1]]);
    });

    it('should handle multiple test blocks separated by blank lines', () => {
      const onTestCasesChange = vi.fn();
      const testCases = [createTestCase('1', 'func([1])', '1', false)];

      render(
        <Console
          output={[]}
          testCases={testCases}
          onTestCasesChange={onTestCasesChange}
          problemId="test-problem"
        />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, {
        target: {
          value:
            '# Test 1: First\n' +
            'input: func([1])\n' +
            'expected: 1\n\n\n' + // Multiple blank lines
            '# Test 2: Second\n' +
            'input: func([2])\n' +
            'expected: 2',
        },
      });

      expect(onTestCasesChange).toHaveBeenCalledWith([
        { id: '1', description: 'First', input: 'func([1])', expected: '1', hidden: false },
        { id: '2', description: 'Second', input: 'func([2])', expected: '2', hidden: false },
      ]);
    });
  });

  describe('Problem Navigation', () => {
    it('should reset text when problemId changes', () => {
      const testCases1 = [createTestCase('1', 'func1([1])', '1', false, 'Problem 1 test')];
      const testCases2 = [createTestCase('1', 'func2([2])', '2', false, 'Problem 2 test')];

      const { rerender } = render(
        <Console
          output={[]}
          testCases={testCases1}
          problemId="problem-1"
        />
      );

      let textarea = screen.getByRole('textbox');
      expect(textarea.textContent || (textarea as HTMLTextAreaElement).value).toContain('func1([1])');

      // Simulate editing
      fireEvent.change(textarea, {
        target: { value: 'user edited content' },
      });
      expect((textarea as HTMLTextAreaElement).value).toBe('user edited content');

      // Change to different problem
      rerender(
        <Console
          output={[]}
          testCases={testCases2}
          problemId="problem-2"
        />
      );

      textarea = screen.getByRole('textbox');
      expect((textarea as HTMLTextAreaElement).value).toContain('func2([2])');
      expect((textarea as HTMLTextAreaElement).value).not.toBe('user edited content');
    });

    it('should preserve user edits when problemId stays the same', () => {
      const testCases = [createTestCase('1', 'func([1])', '1', false)];

      const { rerender } = render(
        <Console
          output={[]}
          testCases={testCases}
          problemId="problem-1"
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

      // Edit the text with valid test case format to keep Tests tab visible
      const editedValue = '# Test 1: Edited\ninput: func([99])\nexpected: 99';
      fireEvent.change(textarea, {
        target: { value: editedValue },
      });

      // Re-render with same problemId (simulating parent state update)
      rerender(
        <Console
          output={[]}
          testCases={testCases}
          problemId="problem-1"
        />
      );

      // User's edit should be preserved (same problemId, no reset)
      expect(screen.getByRole('textbox')).toHaveValue(editedValue);
    });
  });

  describe('Reset Button', () => {
    it('should reset text when resetKey changes', () => {
      const testCases = [createTestCase('1', 'func([1])', '1', false, 'Original')];

      const { rerender } = render(
        <Console
          output={[]}
          testCases={testCases}
          problemId="problem-1"
          resetKey={0}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const originalValue = textarea.value;

      fireEvent.change(textarea, {
        target: { value: 'user edited content' },
      });
      expect(textarea.value).toBe('user edited content');

      // Simulate reset button click (resetKey increments)
      rerender(
        <Console
          output={[]}
          testCases={testCases}
          problemId="problem-1"
          resetKey={1}
        />
      );

      // Should be reset to original formatted value
      expect(screen.getByRole('textbox')).toHaveValue(originalValue);
    });
  });

  describe('Tab Visibility', () => {
    it('should hide Tests tab when all tests are hidden', () => {
      const testCases = [
        createTestCase('1', 'func([1])', '1', true, 'Hidden 1'),
        createTestCase('2', 'func([2])', '2', true, 'Hidden 2'),
      ];

      render(
        <Console
          output={[]}
          testCases={testCases}
          problemId="test-problem"
        />
      );

      expect(screen.queryByRole('button', { name: /Tests/ })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Output/ })).toBeInTheDocument();
    });

    it('should count hidden tests in the Tests tab so it agrees with Results (n/total)', () => {
      const testCases = [
        createTestCase('1', 'func([1])', '1', false, 'Visible'),
        createTestCase('2', 'func([2])', '2', true, 'Hidden'),
      ];

      render(
        <Console
          output={[]}
          testCases={testCases}
          problemId="test-problem"
        />
      );

      expect(screen.getByRole('button', { name: /Tests \(2\)/ })).toBeInTheDocument();
    });

    it('should hide Tests tab when no testCases provided', () => {
      render(<Console output={[]} />);

      expect(screen.queryByRole('button', { name: /Tests/ })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Output/ })).toBeInTheDocument();
    });
  });

  describe('Tab Auto-Switch', () => {
    it('should switch to Output tab when output is received', async () => {
      const testCases = [createTestCase('1', 'func([1])', '1', false)];

      const { rerender } = render(
        <Console
          output={[]}
          testCases={testCases}
          problemId="test-problem"
        />
      );

      // Initially on Tests tab - textarea should be visible
      expect(screen.getByRole('textbox')).toBeInTheDocument();

      // Add output
      rerender(
        <Console
          output={['Test 1 PASSED']}
          testCases={testCases}
          problemId="test-problem"
        />
      );

      // Should switch to output and show the output
      await waitFor(() => {
        expect(screen.getByText(/Test 1 PASSED/)).toBeInTheDocument();
      });
      // Textarea should not be visible when on Output tab
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('should reset to Tests tab when problem changes', async () => {
      const testCases1 = [createTestCase('1', 'func1([1])', '1', false)];
      const testCases2 = [createTestCase('1', 'func2([2])', '2', false)];

      const { rerender } = render(
        <Console
          output={['Some output']}
          testCases={testCases1}
          problemId="problem-1"
        />
      );

      // Output tab should be active due to output
      await waitFor(() => {
        expect(screen.getByText(/Some output/)).toBeInTheDocument();
      });

      // Navigate to new problem
      rerender(
        <Console
          output={[]}
          testCases={testCases2}
          problemId="problem-2"
        />
      );

      // Should be on Tests tab now
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator when isLoading is true', () => {
      render(
        <Console
          output={[]}
          isLoading={true}
          problemId="test-problem"
        />
      );

      expect(screen.getByText('Running...')).toBeInTheDocument();
    });
  });


  describe('Results Tab', () => {
    it('should show Results tab when testResults are provided', () => {
      const testResults = [
        { id: '1', passed: true, description: 'Test 1', expected: '6', actual: '6', hidden: false },
        { id: '2', passed: false, description: 'Test 2', expected: '15', actual: '10', hidden: false },
      ];

      render(
        <Console
          output={[]}
          testResults={testResults}
          problemId="test-problem"
        />
      );

      expect(screen.getByRole('button', { name: /Results \(1\/2\)/ })).toBeInTheDocument();
    });

    it('should not show Results tab when no testResults', () => {
      render(<Console output={[]} problemId="test-problem" />);

      expect(screen.queryByRole('button', { name: /Results/ })).not.toBeInTheDocument();
    });

    it('should auto-switch to Results tab when testResults arrive', () => {
      const testCases = [createTestCase('1', 'func([1])', '1', false)];
      const testResults = [
        { id: '1', passed: true, description: 'Test 1', expected: '1', actual: '1', hidden: false },
      ];

      const { rerender } = render(
        <Console
          output={[]}
          testCases={testCases}
          problemId="test-problem"
        />
      );

      // Initially on Tests tab
      expect(screen.getByRole('textbox')).toBeInTheDocument();

      // Add test results
      rerender(
        <Console
          output={[]}
          testCases={testCases}
          testResults={testResults}
          problemId="test-problem"
        />
      );

      // Should show Results tab content
      expect(screen.getByText('Test Results')).toBeInTheDocument();
      expect(screen.getByText('1/1 passed')).toBeInTheDocument();
    });
  });

  describe('Output Display', () => {
    it('should show placeholder when no output', () => {
      render(<Console output={[]} />);

      expect(screen.getByText(/Output will appear here/)).toBeInTheDocument();
    });

    it('should style PASSED tests in green', async () => {
      render(<Console output={['Test 1 PASSED']} />);

      await waitFor(() => {
        // Find the div with text-green-400 class that contains the passed text
        const greenDiv = document.querySelector('div.text-green-400');
        expect(greenDiv).toBeInTheDocument();
        expect(greenDiv?.textContent).toContain('Test 1 PASSED');
      });
    });

    it('should style FAILED tests in red', async () => {
      render(<Console output={['Test 1 FAILED']} />);

      await waitFor(() => {
        // Find the div with text-red-400 class that contains the failed text
        const redDiv = document.querySelector('div.text-red-400');
        expect(redDiv).toBeInTheDocument();
        expect(redDiv?.textContent).toContain('Test 1 FAILED');
      });
    });

    it('should style error messages in red', async () => {
      render(<Console output={['[Error] Something went wrong']} />);

      await waitFor(() => {
        // Find the div with text-red-400 class that contains the error text
        const redDiv = document.querySelector('div.text-red-400');
        expect(redDiv).toBeInTheDocument();
        expect(redDiv?.textContent).toContain('Something went wrong');
      });
    });
  });
});
