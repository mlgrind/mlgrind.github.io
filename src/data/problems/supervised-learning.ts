import { Problem } from '../../types';

export const supervisedLearningProblems: Problem[] = [
  {
    id: 'linear-regression-gd',
    title: 'Linear Regression with Gradient Descent',
    section: 'supervised-learning',
    difficulty: 'medium',
    description: `
## Linear Regression with Gradient Descent

Implement simple linear regression using gradient descent optimization.

### Model
\`\`\`
y = w * x + b
\`\`\`

### Gradient Descent Updates
\`\`\`
w = w - learning_rate * dw
b = b - learning_rate * db
\`\`\`

Where:
- dw = (2/n) * sum((y_pred - y) * x)
- db = (2/n) * sum(y_pred - y)

### Function Signature
\`\`\`python
def linear_regression(X: np.ndarray, y: np.ndarray,
                      learning_rate: float, iterations: int) -> tuple:
\`\`\`

Returns (w, b) - the learned weight and bias.
    `,
    examples: [
      {
        input: 'X = [1, 2, 3, 4], y = [2, 4, 6, 8], lr = 0.1, iters = 1000',
        output: 'w ≈ 2.0, b ≈ 0.0',
        explanation: 'The true relationship is y = 2x, so w should be close to 2',
      },
    ],
    starterCode: `import numpy as np

def linear_regression(X: np.ndarray, y: np.ndarray,
                      learning_rate: float = 0.01,
                      iterations: int = 1000) -> tuple:
    """
    Train a simple linear regression model using gradient descent.

    Args:
        X: Input features (1D array)
        y: Target values (1D array)
        learning_rate: Step size for gradient descent
        iterations: Number of training iterations

    Returns:
        Tuple of (weight, bias)
    """
    # Initialize parameters
    w = 0.0
    b = 0.0
    n = len(X)

    # Your gradient descent implementation here
    pass

    return (round(w, 2), round(b, 2))
`,
    testCases: [
      {
        id: '1',
        description: 'Perfect linear relationship',
        input: '([1, 2, 3, 4], [2, 4, 6, 8], 0.1, 1000)',
        expected: '(2.0, 0.0)',
        hidden: false,
      },
      {
        id: '2',
        description: 'With intercept',
        input: '([1, 2, 3, 4], [3, 5, 7, 9], 0.1, 1000)',
        expected: '(2.0, 1.0)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Different slope',
        input: '([0, 1, 2, 3], [1, 4, 7, 10], 0.1, 1000)',
        expected: '(3.0, 1.0)',
        hidden: true,
      },
    ],
    hints: [
      'First compute predictions: y_pred = w * X + b',
      'Then compute gradients: dw = (2/n) * sum((y_pred - y) * X)',
      'Update weights: w = w - learning_rate * dw',
    ],
    solution: `import numpy as np

def linear_regression(X: np.ndarray, y: np.ndarray,
                      learning_rate: float = 0.01,
                      iterations: int = 1000) -> tuple:
    """
    Train a simple linear regression model using gradient descent.
    """
    w = 0.0
    b = 0.0
    n = len(X)

    for _ in range(iterations):
        # Forward pass
        y_pred = w * X + b

        # Compute gradients
        dw = (2/n) * np.sum((y_pred - y) * X)
        db = (2/n) * np.sum(y_pred - y)

        # Update parameters
        w = w - learning_rate * dw
        b = b - learning_rate * db

    return (round(w, 2), round(b, 2))
`,
  },
  {
    id: 'logistic-regression',
    title: 'Sigmoid Function',
    section: 'supervised-learning',
    difficulty: 'easy',
    description: `
## Sigmoid Function

Implement the sigmoid activation function used in logistic regression.

### Formula
\`\`\`
sigmoid(x) = 1 / (1 + exp(-x))
\`\`\`

### Properties
- Output is always between 0 and 1
- sigmoid(0) = 0.5
- Monotonically increasing

### Function Signature
\`\`\`python
def sigmoid(x: np.ndarray) -> np.ndarray:
\`\`\`
    `,
    examples: [
      {
        input: 'np.array([0, 1, -1])',
        output: '[0.5, 0.731059, 0.268941]',
        explanation: 'sigmoid(0)=0.5, sigmoid(1)≈0.73, sigmoid(-1)≈0.27',
      },
    ],
    starterCode: `import numpy as np

def sigmoid(x: np.ndarray) -> np.ndarray:
    """
    Compute the sigmoid activation function.

    Args:
        x: Input array of any shape

    Returns:
        Array of same shape with sigmoid applied element-wise
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Zero input',
        input: '[0]',
        expected: '[0.5]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Positive and negative',
        input: '[-1, 0, 1]',
        expected: '[0.268941, 0.5, 0.731059]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Large values',
        input: '[-10, 10]',
        expected: '[0.000045, 0.999955]',
        hidden: true,
      },
    ],
    hints: [
      'Use np.exp() for the exponential function.',
      'The formula is 1 / (1 + exp(-x))',
    ],
    solution: `import numpy as np

def sigmoid(x: np.ndarray) -> np.ndarray:
    """
    Compute the sigmoid activation function.
    """
    return 1 / (1 + np.exp(-x))
`,
  },
  {
    id: 'decision-tree-split',
    title: 'Gini Impurity',
    section: 'supervised-learning',
    difficulty: 'medium',
    description: `
## Gini Impurity

Calculate the Gini impurity for a set of labels. This metric is used in decision trees to determine the best split.

### Formula
\`\`\`
Gini = 1 - sum(p_i^2)
\`\`\`

Where p_i is the proportion of class i in the set.

### Properties
- Gini = 0 means pure (all same class)
- Gini = 0.5 means maximum impurity (for binary classification with equal split)

### Function Signature
\`\`\`python
def gini_impurity(labels: np.ndarray) -> float:
\`\`\`
    `,
    examples: [
      {
        input: 'np.array([0, 0, 0, 0])',
        output: '0.0',
        explanation: 'All same class, pure node',
      },
      {
        input: 'np.array([0, 0, 1, 1])',
        output: '0.5',
        explanation: 'Equal split, maximum impurity for binary',
      },
    ],
    starterCode: `import numpy as np

def gini_impurity(labels: np.ndarray) -> float:
    """
    Calculate Gini impurity for a set of labels.

    Args:
        labels: Array of class labels (integers)

    Returns:
        Gini impurity value between 0 and 1
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Pure node',
        input: '[0, 0, 0, 0]',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'Maximum impurity',
        input: '[0, 0, 1, 1]',
        expected: '0.5',
        hidden: false,
      },
      {
        id: '3',
        description: 'Unequal split',
        input: '[0, 0, 0, 1]',
        expected: '0.375',
        hidden: true,
      },
    ],
    hints: [
      'Count the occurrences of each class.',
      'Calculate the proportion (probability) of each class.',
      'Gini = 1 - sum of squared probabilities.',
    ],
    solution: `import numpy as np

def gini_impurity(labels: np.ndarray) -> float:
    """
    Calculate Gini impurity for a set of labels.
    """
    if len(labels) == 0:
        return 0.0

    # Count occurrences of each class
    _, counts = np.unique(labels, return_counts=True)

    # Calculate probabilities
    probabilities = counts / len(labels)

    # Gini = 1 - sum(p^2)
    return 1 - np.sum(probabilities ** 2)
`,
  },
];
