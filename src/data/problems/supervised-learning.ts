import { Problem } from '../../types';

export const supervisedLearningProblems: Problem[] = [
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
        input: 'bool(np.allclose(sigmoid(np.array([-1, 0, 1])), [0.268941, 0.5, 0.731059], atol=1e-5))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Large values',
        input: 'bool(np.allclose(sigmoid(np.array([-10, 10])), [4.5e-05, 0.999955], atol=1e-5))',
        expected: 'True',
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
    id: 'binary-cross-entropy',
    title: 'Binary Cross-Entropy Loss',
    section: 'supervised-learning',
    difficulty: 'easy',
    description: `
## Binary Cross-Entropy Loss

Implement the binary cross-entropy (log loss) function.

### Formula
\`\`\`
BCE = -1/m * sum(y * log(p) + (1-y) * log(1-p))
\`\`\`

Where:
- y: True labels (0 or 1)
- p: Predicted probabilities
- m: Number of samples

### Numerical Stability
Clip predictions to avoid log(0):
\`\`\`python
p = np.clip(p, 1e-15, 1 - 1e-15)
\`\`\`
    `,
    examples: [
      {
        input: 'y = [1, 0, 1], p = [0.9, 0.1, 0.8]',
        output: '0.1446',
        explanation: 'Low loss for confident correct predictions',
      },
    ],
    starterCode: `import numpy as np

def binary_cross_entropy(y_true, y_pred):
    """
    Compute binary cross-entropy loss.

    Args:
        y_true: True labels (0 or 1)
        y_pred: Predicted probabilities

    Returns:
        loss: Scalar BCE loss
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Perfect predictions',
        input: '([1, 0, 1, 0], [1.0, 0.0, 1.0, 0.0])',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'Typical case',
        input: '([1, 0, 1], [0.9, 0.1, 0.8])',
        expected: '0.1446',
        hidden: false,
      },
    ],
    hints: [
      'Clip predictions for numerical stability',
      'Apply the formula element-wise',
      'Take the mean over all samples',
    ],
    solution: `import numpy as np

def binary_cross_entropy(y_true, y_pred):
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    # Clip for numerical stability
    y_pred = np.clip(y_pred, 1e-15, 1 - 1e-15)

    # BCE formula
    loss = -np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))

    return round(loss, 4)
`,
  },
  {
    id: 'hinge-loss',
    title: 'Hinge Loss',
    section: 'supervised-learning',
    difficulty: 'easy',
    description: `
## Hinge Loss

Implement the hinge loss function used in Support Vector Machines (SVMs).

### Formula
\`\`\`
L = (1/n) * sum(max(0, 1 - y * s))
\`\`\`

Where:
- **y**: True labels in {-1, +1}
- **s**: Raw model scores (not probabilities)
- **n**: Number of samples

### Properties
- Loss is **0** when the prediction has the correct sign AND confidence margin >= 1
- Loss increases linearly when the prediction is wrong or within the margin
- Unlike cross-entropy, hinge loss encourages a "margin" of separation between classes

### Function Signature
\`\`\`python
def hinge_loss(y_true: np.ndarray, scores: np.ndarray) -> float:
\`\`\`

Returns the mean hinge loss rounded to 4 decimal places.
    `,
    examples: [
      {
        input: 'y_true = [1, -1, 1], scores = [0.5, -0.8, 1.5]',
        output: '0.2333',
        explanation: 'Margins: [0.5, 0.2, -0.5] → losses: [0.5, 0.2, 0.0] → mean = 0.2333',
      },
      {
        input: 'y_true = [1, -1], scores = [2.0, -3.0]',
        output: '0.0',
        explanation: 'Both predictions correct with margin >= 1, so zero loss',
      },
    ],
    starterCode: `import numpy as np

def hinge_loss(y_true, scores):
    """
    Compute the mean hinge loss.

    Args:
        y_true: True labels in {-1, +1}, shape (n,)
        scores: Raw model scores, shape (n,)

    Returns:
        Mean hinge loss (float, rounded to 4 decimals)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Perfect predictions with large margin',
        input: '([1, -1], [2.0, -3.0])',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'Partial margin violations',
        input: '([1, -1, 1], [0.5, -0.8, 1.5])',
        expected: '0.2333',
        hidden: false,
      },
      {
        id: '3',
        description: 'All misclassified',
        input: '([1, 1], [-1.0, -2.0])',
        expected: '2.5',
        hidden: false,
      },
      {
        id: '4',
        description: 'On the decision boundary (margin = 1)',
        input: '([1, -1], [1.0, -1.0])',
        expected: '0.0',
        hidden: true,
      },
    ],
    hints: [
      'Compute element-wise margins: y_true * scores',
      'Apply max(0, 1 - margin) using np.maximum',
      'Return the mean of the losses, rounded to 4 decimals',
    ],
    solution: `import numpy as np

def hinge_loss(y_true, scores):
    """
    Compute the mean hinge loss.
    """
    y_true = np.array(y_true, dtype=float)
    scores = np.array(scores, dtype=float)

    # Compute hinge loss for each sample
    losses = np.maximum(0, 1 - y_true * scores)

    return round(float(np.mean(losses)), 4)
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
    id: 'logistic-regression-full',
    title: 'Logistic Regression with Gradient Descent',
    section: 'supervised-learning',
    difficulty: 'medium',
    description: `
## Logistic Regression with Gradient Descent

Implement binary logistic regression from scratch.

### Model
\`\`\`
z = X @ w + b
y_pred = sigmoid(z) = 1 / (1 + exp(-z))
\`\`\`

### Loss (Binary Cross-Entropy)
\`\`\`
L = -1/m * sum(y * log(y_pred) + (1-y) * log(1-y_pred))
\`\`\`

### Gradients
\`\`\`
dw = 1/m * X.T @ (y_pred - y)
db = 1/m * sum(y_pred - y)
\`\`\`
    `,
    examples: [
      {
        input: 'X (100, 2), y binary labels, 1000 iterations',
        output: 'Trained weights and bias',
        explanation: 'Learns decision boundary separating classes',
      },
    ],
    starterCode: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def logistic_regression(X, y, learning_rate=0.1, iterations=1000):
    """
    Train logistic regression using gradient descent.

    Args:
        X: Features (m samples, n features)
        y: Binary labels (m,)
        learning_rate: Step size
        iterations: Number of iterations

    Returns:
        w: Learned weights (n,)
        b: Learned bias (scalar)
    """
    m, n = X.shape
    w = np.zeros(n)
    b = 0.0

    # Your code here
    pass

    return np.round(w, 4), round(b, 4)
`,
    testCases: [
      {
        id: '1',
        description: 'Simple separable data',
        input: '(lambda r: bool(np.allclose(r[0], [6.0141, 6.0141], atol=1e-3) and np.isclose(r[1], -9.1984, atol=1e-3)))(logistic_regression(np.array([[0, 0], [0, 1], [1, 0], [1, 1]]), np.array([0, 0, 0, 1]), 0.5, 1000))',
        expected: 'True',
        hidden: false,
      },
    ],
    hints: [
      'Forward: z = X @ w + b, then y_pred = sigmoid(z)',
      'Gradients: dw = (1/m) * X.T @ (y_pred - y)',
      'Update: w = w - lr * dw, b = b - lr * db',
    ],
    solution: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def logistic_regression(X, y, learning_rate=0.1, iterations=1000):
    m, n = X.shape
    w = np.zeros(n)
    b = 0.0

    for _ in range(iterations):
        # Forward pass
        z = X @ w + b
        y_pred = sigmoid(z)

        # Compute gradients
        dw = (1/m) * X.T @ (y_pred - y)
        db = (1/m) * np.sum(y_pred - y)

        # Update parameters
        w = w - learning_rate * dw
        b = b - learning_rate * db

    return np.round(w, 4), round(b, 4)
`,
  },
  {
    id: 'linear-svm',
    title: 'Linear SVM with Gradient Descent',
    section: 'supervised-learning',
    difficulty: 'medium',
    description: `
## Linear SVM with Gradient Descent

Implement a linear Support Vector Machine (SVM) classifier using gradient descent on the hinge loss with L2 regularization.

### Objective
\`\`\`
L = (λ/2) * ||w||² + (1/m) * Σ max(0, 1 - yᵢ * (Xᵢ · w + b))
\`\`\`

### Gradients
Compute gradients over all samples. For samples where the margin \`yᵢ * (Xᵢ · w + b) < 1\` (hinge loss is active):
\`\`\`
dw = λ * w - (1/m) * Σ yᵢ * Xᵢ    (sum over violating samples)
db = -(1/m) * Σ yᵢ                  (sum over violating samples)
\`\`\`

For samples where the margin >= 1:
\`\`\`
dw contribution = λ * w   (only regularization)
db contribution = 0
\`\`\`

### Function Signature
\`\`\`python
def linear_svm(X, y, learning_rate=0.01, lambda_param=0.01, iterations=1000):
\`\`\`

Returns \`(w, b)\` — the learned weight vector (rounded to 4 decimals) and bias (rounded to 4 decimals).

**Note**: Labels \`y\` are in {-1, +1}.
    `,
    examples: [
      {
        input: 'X = [[2,1],[3,2],[-2,-1],[-3,-2]], y = [1,1,-1,-1], lr=0.01, λ=0.01, iters=1000',
        output: 'w and b that correctly classify all points',
        explanation: 'SVM finds a maximum-margin hyperplane separating positive and negative points',
      },
    ],
    starterCode: `import numpy as np

def linear_svm(X, y, learning_rate=0.01, lambda_param=0.01, iterations=1000):
    """
    Train a linear SVM using gradient descent on hinge loss + L2 regularization.

    Args:
        X: Features (m samples, n features)
        y: Labels in {-1, +1}, shape (m,)
        learning_rate: Step size for gradient descent
        lambda_param: L2 regularization strength
        iterations: Number of training iterations

    Returns:
        w: Learned weights (n,), rounded to 4 decimals
        b: Learned bias (scalar), rounded to 4 decimals
    """
    m, n = X.shape
    w = np.zeros(n)
    b = 0.0

    # Your gradient descent implementation here
    pass

    return np.round(w, 4), round(b, 4)
`,
    testCases: [
      {
        id: '1',
        description: 'Correctly classifies separable 2D data',
        input: `(lambda: (
    X := np.array([[2, 1], [3, 2], [1, 3], [-2, -1], [-3, -2], [-1, -3]]),
    y := np.array([1, 1, 1, -1, -1, -1]),
    result := linear_svm(X, y, 0.01, 0.01, 1000),
    preds := np.sign(X @ result[0] + result[1]),
    bool(np.array_equal(preds, y))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Correctly classifies 1D data',
        input: `(lambda: (
    X := np.array([[3], [4], [5], [-3], [-4], [-5]]),
    y := np.array([1, 1, 1, -1, -1, -1]),
    result := linear_svm(X, y, 0.01, 0.01, 1000),
    preds := np.sign(X @ result[0] + result[1]),
    bool(np.array_equal(preds, y))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Weight vector has correct sign',
        input: `(lambda: (
    X := np.array([[1], [-1]]),
    y := np.array([1, -1]),
    result := linear_svm(X, y, 0.1, 0.01, 500),
    bool(result[0][0] > 0)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Compute margins for all samples: margins = y * (X @ w + b)',
      'Find violating samples with mask = margins < 1',
      'Gradient: dw = lambda_param * w - (1/m) * X[mask].T @ y[mask]',
      'Update w and b using gradient descent',
    ],
    solution: `import numpy as np

def linear_svm(X, y, learning_rate=0.01, lambda_param=0.01, iterations=1000):
    """
    Train a linear SVM using gradient descent on hinge loss + L2 regularization.
    """
    m, n = X.shape
    w = np.zeros(n)
    b = 0.0

    for _ in range(iterations):
        # Compute margins
        margins = y * (X @ w + b)

        # Find samples violating the margin
        mask = margins < 1

        # Compute gradients
        dw = lambda_param * w - (1/m) * (X[mask].T @ y[mask])
        db = -(1/m) * np.sum(y[mask])

        # Update parameters
        w -= learning_rate * dw
        b -= learning_rate * db

    return np.round(w, 4), round(b, 4)
`,
  },
];
