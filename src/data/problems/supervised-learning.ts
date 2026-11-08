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
      {
        id: '4',
        description: 'Symmetry property',
        input: 'bool(np.allclose(sigmoid(np.array([2.0])) + sigmoid(np.array([-2.0])), [1.0]))',
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
      {
        id: '3',
        description: 'All wrong predictions',
        input: '([1, 1, 0], [0.1, 0.1, 0.9])',
        expected: '2.3026',
        hidden: true,
      },
      {
        id: '4',
        description: 'Uniform predictions (0.5)',
        input: '([1, 0], [0.5, 0.5])',
        expected: '0.6931',
        hidden: true,
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
      {
        id: '4',
        description: 'Three classes equally split',
        input: 'round(gini_impurity(np.array([0, 1, 2])), 4)',
        expected: '0.6667',
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
      {
        id: '4',
        description: 'Negative slope',
        input: '([1, 2, 3, 4], [8, 6, 4, 2], 0.1, 1000)',
        expected: '(-2.0, 10.0)',
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

    return np.round(w, 4), round(float(b), 4)
`,
    testCases: [
      {
        id: '1',
        description: 'Simple separable data',
        input: '(lambda r: bool(np.allclose(r[0], [6.0141, 6.0141], atol=1e-3) and np.isclose(r[1], -9.1984, atol=1e-3)))(logistic_regression(np.array([[0, 0], [0, 1], [1, 0], [1, 1]]), np.array([0, 0, 0, 1]), 0.5, 1000))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Weight vector shape',
        input: 'logistic_regression(np.array([[0, 0], [0, 1], [1, 0], [1, 1]]), np.array([0, 0, 0, 1]), 0.5, 1000)[0].shape',
        expected: '(2,)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Classifies correctly after training',
        input: `(lambda: (
    X := np.array([[0, 0], [0, 1], [1, 0], [1, 1]]),
    y := np.array([0, 0, 0, 1]),
    r := logistic_regression(X, y, 0.5, 1000),
    preds := (1 / (1 + np.exp(-(X @ r[0] + r[1])))) > 0.5,
    bool(np.array_equal(preds.astype(int), y))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Bias is scalar',
        input: 'bool(np.ndim(logistic_regression(np.array([[1, 0], [0, 1]]), np.array([0, 1]), 0.1, 100)[1]) == 0)',
        expected: 'True',
        hidden: true,
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

    return np.round(w, 4), round(float(b), 4)
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

    return np.round(w, 4), round(float(b), 4)
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

    return np.round(w, 4), round(float(b), 4)
`,
  },
  {
    id: 'knn-classifier',
    title: 'k-Nearest Neighbours Classifier',
    section: 'supervised-learning',
    difficulty: 'medium',
    description: `
## k-Nearest Neighbours (k-NN) Classifier

k-NN has no training step: to classify a query point, find the \`k\` training points closest to it and take a **majority vote** of their labels.

Implement \`knn_predict(X_train, y_train, X_test, k)\`.

### Algorithm
For every query \`x\` in \`X_test\`:
1. Compute the **Euclidean distance** to every training point:
\`\`\`
d(x, x_i) = sqrt( sum_j (x_j - x_ij)^2 )
\`\`\`
2. Take the \`k\` nearest training points. If several training points are at the **same distance**, the one with the **smaller training index** comes first (a *stable* sort: \`np.argsort(d, kind='stable')\`).
3. Count the labels of those \`k\` neighbours and predict the most common one.
4. **Vote ties**: if two or more classes share the top count, predict the **smallest class label** among them.

### Vectorizing the distances
All pairwise squared distances at once, via broadcasting:
\`\`\`python
diff = X_test[:, None, :] - X_train[None, :, :]   # (m, n, d)
D = np.sqrt((diff ** 2).sum(axis=-1))             # (m, n)
\`\`\`

### Expected Return Format
- Returns an int array of shape \`(m,)\`: the predicted label of each test point.
- Labels are non-negative integers (so \`np.bincount\` works for the vote).

### Notes
- \`k = 1\` is the nearest-neighbour rule; with \`k = n_train\` every query gets the overall majority class.
- Features on different scales dominate the distance, so in practice you standardize first.
    `,
    examples: [
      {
        input: 'X_train = [[0,0],[1,0],[0,1],[5,5],[6,5]], y_train = [0,0,0,1,1], X_test = [[0.5,0.5],[5.5,5]], k=3',
        output: '[0, 1]',
        explanation: 'The first query has three class-0 neighbours. The second has neighbours (5,5), (6,5) (class 1) and then (1,0) (class 0): 2 votes to 1 for class 1.',
      },
      {
        input: 'X_train = [[0],[2]], y_train = [1, 0], X_test = [[1]], k=2',
        output: '[0]',
        explanation: 'One vote each: the tie goes to the smaller label, 0.',
      },
    ],
    starterCode: `import numpy as np

def knn_predict(X_train, y_train, X_test, k=3):
    """
    k-nearest neighbours classification with Euclidean distance.

    Args:
        X_train: Training features, shape (n, d)
        y_train: Non-negative integer labels, shape (n,)
        X_test: Query points, shape (m, d)
        k: Number of neighbours

    Returns:
        Predicted labels, int array of shape (m,)
        (distance ties -> smaller training index first;
         vote ties -> smallest label)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Two well-separated clusters',
        input: 'knn_predict(np.array([[0, 0], [1, 0], [0, 1], [5, 5], [6, 5]]), np.array([0, 0, 0, 1, 1]), np.array([[0.5, 0.5], [5.5, 5]]), 3).tolist()',
        expected: '[0, 1]',
        hidden: false,
      },
      {
        id: '2',
        description: 'k=1 returns the label of the nearest point',
        input: 'knn_predict(np.array([[0.0], [3.0], [10.0]]), np.array([2, 0, 1]), np.array([[1.0], [2.0], [7.0], [100.0]]), 1).tolist()',
        expected: '[2, 0, 1, 1]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Vote tie goes to the smallest label',
        input: 'knn_predict(np.array([[0], [2]]), np.array([1, 0]), np.array([[1]]), 2).tolist()',
        expected: '[0]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Distance tie: the smaller training index is taken first',
        input: 'knn_predict(np.array([[-1.0], [1.0], [3.0]]), np.array([2, 1, 1]), np.array([[0.0]]), 1).tolist()',
        expected: '[2]',
        hidden: true,
      },
      {
        id: '5',
        description: 'k = n_train predicts the overall majority',
        input: 'knn_predict(np.array([[0, 0], [9, 9], [9, 8], [8, 9]]), np.array([0, 1, 1, 1]), np.array([[0, 0], [0.1, 0.1]]), 4).tolist()',
        expected: '[1, 1]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Matches a brute-force reference on random 3-class data',
        input: `(lambda: (
    Xtr := np.random.randn(40, 3),
    ytr := np.random.randint(0, 3, 40),
    Xte := np.random.randn(15, 3),
    ref := [int(np.argmax(np.bincount(ytr[np.argsort(np.linalg.norm(Xtr - q, axis=1), kind="stable")[:5]], minlength=3))) for q in Xte],
    knn_predict(Xtr, ytr, Xte, 5).tolist() == ref
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'Predictions on a 3-class problem with k=5',
        input: `(lambda: (
    Xtr := np.random.randn(30, 2),
    ytr := (Xtr[:, 0] > 0).astype(int) + (Xtr[:, 1] > 0.5).astype(int),
    knn_predict(Xtr, ytr, np.array([[1.0, 1.0], [-1.0, -1.0], [1.0, -1.0], [0.0, 0.4]]), 5).tolist()
)[-1])()`,
        expected: '[2, 0, 1, 0]',
        hidden: true,
      },
    ],
    hints: [
      'Broadcast X_test[:, None, :] - X_train[None, :, :] to get an (m, n, d) array of differences, then sum squares over the last axis.',
      'np.argsort(D, axis=1, kind=\'stable\')[:, :k] gives each query\'s k nearest training indices with distance ties broken by index.',
      'np.bincount(y_train[idx], minlength=n_classes) counts the votes, and np.argmax returns the first (smallest) label among the tied maxima.',
    ],
    solution: `import numpy as np

def knn_predict(X_train, y_train, X_test, k=3):
    X_train = np.asarray(X_train, dtype=float)
    X_test = np.asarray(X_test, dtype=float)
    y_train = np.asarray(y_train)
    n_classes = int(y_train.max()) + 1

    # Pairwise Euclidean distances, (m, n)
    diff = X_test[:, None, :] - X_train[None, :, :]
    D = np.sqrt((diff ** 2).sum(axis=-1))

    # Stable sort: equal distances keep training order
    nearest = np.argsort(D, axis=1, kind='stable')[:, :k]   # (m, k)

    preds = np.empty(len(X_test), dtype=np.int64)
    for i, idx in enumerate(nearest):
        votes = np.bincount(y_train[idx], minlength=n_classes)
        preds[i] = np.argmax(votes)   # argmax returns the first (smallest) label on ties
    return preds
`,
  },
  {
    id: 'naive-bayes',
    title: 'Gaussian Naive Bayes',
    section: 'supervised-learning',
    difficulty: 'medium',
    description: `
## Gaussian Naive Bayes

Naive Bayes applies Bayes' rule with the "naive" assumption that features are **independent given the class**. In the Gaussian variant each feature follows a normal distribution per class.

Implement two functions:
- \`gaussian_nb_fit(X, y, var_smoothing=1e-9)\`: estimate the parameters
- \`gaussian_nb_predict_proba(model, X)\`: class probabilities for new points

### Fit
For each class \`c\` (in ascending order, \`np.unique(y)\`):
\`\`\`
prior[c]   = n_c / n
mean[c, j] = mean of feature j over the samples of class c
var[c, j]  = variance (ddof=0) of feature j over class c  +  epsilon
epsilon    = var_smoothing * max_j Var(X[:, j])     # over ALL samples
\`\`\`
\`epsilon\` keeps variances away from zero (a constant feature within a class would otherwise give a division by zero). This is exactly scikit-learn's \`GaussianNB(var_smoothing=...)\`.

### Predict (in log space)
The joint log-likelihood of sample \`x\` and class \`c\`:
\`\`\`
jll[c] = log prior[c] - 0.5 * sum_j log(2*pi*var[c, j])
                      - 0.5 * sum_j (x_j - mean[c, j])^2 / var[c, j]
\`\`\`
Normalize with **logsumexp** to get the posterior:
\`\`\`
log P(c | x) = jll[c] - logsumexp_c'(jll[c'])
logsumexp(a) = max(a) + log(sum(exp(a - max(a))))
\`\`\`
Never multiply raw densities: with many features (or a point far from every class) they underflow to \`0\` and you get \`0/0 = nan\`.

### Expected Return Format
\`gaussian_nb_fit\` returns a dictionary with these keys:
- \`'classes'\`: sorted unique labels, shape \`(C,)\`
- \`'priors'\`: class priors, shape \`(C,)\`
- \`'means'\`: per-class feature means, shape \`(C, d)\`
- \`'vars'\`: per-class feature variances **including** epsilon, shape \`(C, d)\`

\`gaussian_nb_predict_proba\` returns an array of shape \`(m, C)\` whose rows sum to 1, with columns in the order of \`model['classes']\`.
    `,
    examples: [
      {
        input: 'X = [[1.0], [2.0], [3.0], [6.0], [7.0], [8.0]], y = [0, 0, 0, 1, 1, 1]',
        output: 'priors [0.5, 0.5], means [[2.0], [7.0]], vars ≈ [[0.6667], [0.6667]]',
        explanation: 'Each class has 3 points with variance 2/3; epsilon = 1e-9 * Var(X) is negligible here.',
      },
      {
        input: 'gaussian_nb_predict_proba(model, np.array([[4.5]]))',
        output: '[[0.5, 0.5]]',
        explanation: '4.5 is equidistant from both means and the classes have equal priors and variances.',
      },
    ],
    starterCode: `import numpy as np

def gaussian_nb_fit(X, y, var_smoothing=1e-9):
    """
    Fit Gaussian Naive Bayes.

    Args:
        X: Features, shape (n, d)
        y: Class labels, shape (n,)
        var_smoothing: Fraction of the largest feature variance added to all variances

    Returns:
        dict with 'classes' (C,), 'priors' (C,), 'means' (C, d), 'vars' (C, d)
    """
    # Your code here
    pass


def gaussian_nb_predict_proba(model, X):
    """
    Posterior class probabilities, computed in log space.

    Args:
        model: dict returned by gaussian_nb_fit
        X: Features, shape (m, d)

    Returns:
        Probabilities, shape (m, C); rows sum to 1
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Priors and means',
        input: '(lambda m: (m["priors"].tolist(), m["means"].tolist()))(gaussian_nb_fit(np.array([[1.0], [2.0], [3.0], [6.0], [7.0], [8.0]]), np.array([0, 0, 0, 1, 1, 1])))',
        expected: '([0.5, 0.5], [[2.0], [7.0]])',
        hidden: false,
      },
      {
        id: '2',
        description: 'Midpoint between symmetric classes is 50/50',
        input: 'np.round(gaussian_nb_predict_proba(gaussian_nb_fit(np.array([[1.0], [2.0], [3.0], [6.0], [7.0], [8.0]]), np.array([0, 0, 0, 1, 1, 1])), np.array([[4.5]])), 6).tolist()',
        expected: '[[0.5, 0.5]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Rows sum to 1, shape (m, C)',
        input: '(lambda X, y: (lambda P: (P.shape, bool(np.allclose(P.sum(1), 1))))(gaussian_nb_predict_proba(gaussian_nb_fit(X, y), X)))(np.random.randn(20, 3), np.arange(20) % 4)',
        expected: '((20, 4), True)',
        hidden: false,
      },
      {
        id: '4',
        description: 'var_smoothing adds epsilon = s * max feature variance',
        input: 'np.round(gaussian_nb_fit(np.array([[0.0, 1.0], [0.0, 3.0], [2.0, 5.0], [2.0, 9.0]]), np.array([0, 0, 1, 1]), var_smoothing=0.1)["vars"], 6).tolist()',
        expected: '[[0.875, 1.875], [0.875, 4.875]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Posteriors match scikit-learn GaussianNB',
        input: 'np.round(gaussian_nb_predict_proba(gaussian_nb_fit(np.array([[1.0, 2.0], [2.0, 3.0], [3.0, 3.0], [2.0, 1.0], [4.0, 5.0], [5.0, 4.0], [6.0, 6.0], [4.0, 3.0], [7.0, 2.0], [6.0, 1.0], [8.0, 3.0], [5.0, 2.0]]), np.array([0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2])), np.array([[3.0, 3.0], [5.0, 3.5], [6.0, 2.0], [4.0, 4.0]])), 6).tolist()',
        expected: '[[0.891447, 0.101141, 0.007411], [9.1e-05, 0.927174, 0.072735], [0.0, 0.024231, 0.975769], [0.005153, 0.991937, 0.002909]]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Log-space: far-away points still give valid probabilities',
        input: '(lambda P: (bool(np.all(np.isfinite(P))), np.round(P, 6).tolist()))(gaussian_nb_predict_proba(gaussian_nb_fit(np.array([[0.0], [1.0], [10.0], [11.0]]), np.array([0, 0, 1, 1])), np.array([[-500.0], [600.0]])))',
        expected: '(True, [[1.0, 0.0], [0.0, 1.0]])',
        hidden: true,
      },
      {
        id: '7',
        description: 'Unequal priors shift the posterior',
        input: 'np.round(gaussian_nb_predict_proba(gaussian_nb_fit(np.array([[0.0], [2.0], [0.5], [1.5], [3.0], [5.0]]), np.array([0, 0, 0, 0, 1, 1])), np.array([[2.5]])), 6).tolist()',
        expected: '[[0.562951, 0.437049]]',
        hidden: true,
      },
    ],
    hints: [
      'Loop over np.unique(y): boolean-mask X[y == c] and take .mean(axis=0) and .var(axis=0) (ddof=0).',
      'epsilon = var_smoothing * np.var(X, axis=0).max() is computed once over all samples and added to every class variance.',
      'Build the (m, C) joint log-likelihood with broadcasting: X[:, None, :] - means[None, :, :].',
      'Subtract the row max before exponentiating: P = exp(jll - logsumexp(jll)).',
    ],
    solution: `import numpy as np

def gaussian_nb_fit(X, y, var_smoothing=1e-9):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y)
    classes = np.unique(y)
    epsilon = var_smoothing * np.var(X, axis=0).max()

    priors = np.array([np.mean(y == c) for c in classes])
    means = np.array([X[y == c].mean(axis=0) for c in classes])
    variances = np.array([X[y == c].var(axis=0) for c in classes]) + epsilon
    return {'classes': classes, 'priors': priors, 'means': means, 'vars': variances}


def gaussian_nb_predict_proba(model, X):
    X = np.asarray(X, dtype=float)
    means, variances = model['means'], model['vars']           # (C, d)

    # Joint log-likelihood, (m, C)
    log_norm = -0.5 * np.sum(np.log(2 * np.pi * variances), axis=1)          # (C,)
    sq = ((X[:, None, :] - means[None, :, :]) ** 2 / variances[None]).sum(-1)  # (m, C)
    jll = np.log(model['priors']) + log_norm - 0.5 * sq

    # Normalize with logsumexp
    m = jll.max(axis=1, keepdims=True)
    log_z = m + np.log(np.exp(jll - m).sum(axis=1, keepdims=True))
    return np.exp(jll - log_z)
`,
  },
  {
    id: 'ridge-lasso',
    title: 'Ridge & Lasso Regression',
    section: 'supervised-learning',
    difficulty: 'hard',
    description: `
## Ridge and Lasso Regression

Both add a penalty on the weights to least squares. **Ridge** (L2) shrinks all weights smoothly and has a closed form. **Lasso** (L1) has no closed form, but it sets some weights to **exactly zero**, which makes it a feature selector.

### The intercept is not penalised
Penalising \`b\` would make the fit depend on where the origin of \`y\` is. Instead, **centre** the data, fit without an intercept, then recover it:
\`\`\`
x_mean = X.mean(axis=0),  y_mean = y.mean()
Xc = X - x_mean,          yc = y - y_mean
... fit w on (Xc, yc) ...
b = y_mean - x_mean @ w
\`\`\`
This is what scikit-learn's \`Ridge\` and \`Lasso\` do with \`fit_intercept=True\`.

### 1. Ridge: \`ridge_fit(X, y, lam)\`
Minimizes \`||yc - Xc w||^2 + lam * ||w||^2\`, whose solution is
\`\`\`
w = (Xc^T Xc + lam * I)^(-1) Xc^T yc
\`\`\`
Use \`np.linalg.solve(A, b)\` rather than forming the inverse. Matches \`sklearn.linear_model.Ridge(alpha=lam)\`.

### 2. Lasso: \`lasso_fit(X, y, lam, n_sweeps=100)\`
Minimizes (scikit-learn's scaling, so \`lam\` means the same as \`Lasso(alpha=lam)\`):
\`\`\`
(1 / (2n)) * ||yc - Xc w||^2 + lam * ||w||_1
\`\`\`
by **cyclic coordinate descent**: start from \`w = 0\`; each sweep updates \`j = 0, 1, ..., d-1\` in order, each using the latest values of the others:
\`\`\`
r     = yc - Xc @ w                       # current residual
rho_j = (1/n) * Xc[:, j] @ (r + Xc[:, j] * w_j)
z_j   = (1/n) * Xc[:, j] @ Xc[:, j]
w_j   = soft_threshold(rho_j, lam) / z_j  # (w_j = 0 if z_j == 0)

soft_threshold(a, lam) = sign(a) * max(|a| - lam, 0)
\`\`\`
Run exactly \`n_sweeps\` full sweeps. Whenever \`|rho_j| <= lam\` the weight is set to **exactly 0**. If \`lam >= max_j |Xc[:, j] @ yc| / n\`, every weight is zero.

### Expected Return Format
Both functions return a tuple \`(w, b)\`:
- \`w\`: weight array of shape \`(d,)\`
- \`b\`: intercept, a Python float
    `,
    examples: [
      {
        input: 'X = [[1], [2], [3], [4]], y = [3, 5, 7, 9], lam = 0',
        output: 'ridge_fit -> (array([2.]), 1.0)',
        explanation: 'With no penalty, ridge is ordinary least squares: y = 2x + 1.',
      },
      {
        input: 'Same data, lam = 5',
        output: 'ridge_fit -> (array([1.0]), 3.5)',
        explanation: 'Xc^T Xc = 5 and Xc^T yc = 10, so w = 10 / (5 + 5) = 1; b = 6 - 2.5 * 1 = 3.5.',
      },
      {
        input: 'X = np.random.randn(40, 5), y = 3*X[:, 0] - 2*X[:, 1] + 0.1*noise + 4, lasso_fit(X, y, 0.3)',
        output: 'w ≈ [2.74, -1.68, 0.0, 0.0, 0.0], b ≈ 3.94',
        explanation: 'The three noise features get exactly zero weight; the true weights (3, -2) are shrunk towards zero by the L1 penalty.',
      },
    ],
    starterCode: `import numpy as np

def ridge_fit(X, y, lam):
    """
    Ridge regression in closed form (intercept not penalised).

    Args:
        X: Features, shape (n, d)
        y: Targets, shape (n,)
        lam: L2 penalty strength

    Returns:
        (w, b): weights of shape (d,) and float intercept
    """
    # Your code here
    pass


def lasso_fit(X, y, lam, n_sweeps=100):
    """
    Lasso regression by cyclic coordinate descent with soft-thresholding.
    Objective: (1/(2n)) * ||y - Xw - b||^2 + lam * ||w||_1

    Args:
        X: Features, shape (n, d)
        y: Targets, shape (n,)
        lam: L1 penalty strength
        n_sweeps: Number of full passes over the coordinates

    Returns:
        (w, b): weights of shape (d,) and float intercept
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Ridge with lam=0 is least squares',
        input: '(lambda wb: (np.round(wb[0], 6).tolist(), round(wb[1], 6)))(ridge_fit(np.array([[1.0], [2.0], [3.0], [4.0]]), np.array([3.0, 5.0, 7.0, 9.0]), 0.0))',
        expected: '([2.0], 1.0)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Ridge shrinks the slope; intercept is not penalised',
        input: '(lambda wb: (np.round(wb[0], 6).tolist(), round(wb[1], 6)))(ridge_fit(np.array([[1.0], [2.0], [3.0], [4.0]]), np.array([3.0, 5.0, 7.0, 9.0]), 5.0))',
        expected: '([1.0], 3.5)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Lasso zeroes the noise features exactly',
        input: `(lambda: (
    X := np.random.randn(40, 5),
    y := 3 * X[:, 0] - 2 * X[:, 1] + 0.1 * np.random.randn(40) + 4,
    w := lasso_fit(X, y, 0.3)[0],
    (int((w == 0).sum()), bool(np.all(w[2:] == 0)))
)[-1])()`,
        expected: '(3, True)',
        hidden: false,
      },
      {
        id: '4',
        description: 'Ridge matches scikit-learn Ridge(alpha=2)',
        input: '(lambda wb: (np.round(wb[0], 6).tolist(), round(wb[1], 6)))(ridge_fit(np.array([[1.0, 0.5, 2.0], [2.0, -1.0, 0.0], [0.0, 1.0, 1.0], [3.0, 2.0, -1.0], [1.5, 0.0, 0.5], [2.5, 1.5, 1.0]]), np.array([4.0, 1.0, 3.0, 5.0, 2.5, 6.0]), 2.0))',
        expected: '([0.501562, 1.054956, 0.469557], 1.770184)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Lasso matches scikit-learn Lasso(alpha=0.1) after convergence',
        input: '(lambda wb: (np.round(wb[0], 4).tolist(), round(wb[1], 4)))(lasso_fit(np.array([[1.0, 0.5, 2.0], [2.0, -1.0, 0.0], [0.0, 1.0, 1.0], [3.0, 2.0, -1.0], [1.5, 0.0, 0.5], [2.5, 1.5, 1.0]]), np.array([4.0, 1.0, 3.0, 5.0, 2.5, 6.0]), 0.1, 500))',
        expected: '([0.6142, 1.3094, 0.6529], 1.3058)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Large lam gives all-zero weights and b = mean(y)',
        input: '(lambda wb: (bool(np.all(wb[0] == 0)), round(wb[1], 6)))(lasso_fit(np.array([[1.0, 0.5], [2.0, -1.0], [0.0, 1.0], [3.0, 2.0]]), np.array([4.0, 1.0, 3.0, 6.0]), 10.0))',
        expected: '(True, 3.5)',
        hidden: true,
      },
      {
        id: '7',
        description: 'Lasso weights after 3 sweeps (in-order coordinate updates)',
        input: '(lambda wb: np.round(wb[0], 6).tolist())(lasso_fit(np.array([[1.0, 2.0], [2.0, 1.0], [3.0, 4.0], [4.0, 3.0]]), np.array([1.0, 2.0, 2.0, 4.0]), 0.05, 3))',
        expected: '[1.003616, -0.26217]',
        hidden: true,
      },
    ],
    hints: [
      'Centre X and y first, fit w on the centred data, then b = y_mean - x_mean @ w.',
      'Ridge: np.linalg.solve(Xc.T @ Xc + lam * np.eye(d), Xc.T @ yc).',
      'Lasso: for each j, rho_j = Xc[:, j] @ (r + Xc[:, j] * w[j]) / n is the correlation of feature j with the residual that ignores feature j.',
      'Keep the residual up to date after every coordinate: r -= Xc[:, j] * (w_new - w_old). soft_threshold returns exactly 0 when |rho| <= lam.',
    ],
    solution: `import numpy as np

def ridge_fit(X, y, lam):
    X, y = np.asarray(X, dtype=float), np.asarray(y, dtype=float)
    x_mean, y_mean = X.mean(axis=0), y.mean()
    Xc, yc = X - x_mean, y - y_mean

    d = X.shape[1]
    w = np.linalg.solve(Xc.T @ Xc + lam * np.eye(d), Xc.T @ yc)
    b = float(y_mean - x_mean @ w)
    return w, b


def soft_threshold(a, lam):
    return np.sign(a) * max(abs(a) - lam, 0.0)


def lasso_fit(X, y, lam, n_sweeps=100):
    X, y = np.asarray(X, dtype=float), np.asarray(y, dtype=float)
    n, d = X.shape
    x_mean, y_mean = X.mean(axis=0), y.mean()
    Xc, yc = X - x_mean, y - y_mean

    w = np.zeros(d)
    z = (Xc ** 2).sum(axis=0) / n          # (1/n) ||x_j||^2
    r = yc.copy()                          # residual yc - Xc @ w
    for _ in range(n_sweeps):
        for j in range(d):
            if z[j] == 0:
                continue
            rho = Xc[:, j] @ (r + Xc[:, j] * w[j]) / n
            w_new = soft_threshold(rho, lam) / z[j]
            r -= Xc[:, j] * (w_new - w[j])   # keep the residual in sync
            w[j] = w_new

    b = float(y_mean - x_mean @ w)
    return w, b
`,
  },
  {
    id: 'gradient-boosting',
    title: 'Gradient Boosting with Stumps',
    section: 'supervised-learning',
    difficulty: 'hard',
    description: `
## Gradient Boosting for Regression (Decision Stumps)

Gradient boosting builds a strong model as a sum of weak ones. Each new weak learner is fit to the **negative gradient** of the loss at the current predictions. For squared loss \`L = 0.5 * (y - F)^2\` the negative gradient is simply the **residual** \`y - F\`.

Implement two functions.

### 1. \`fit_stump(X, r)\`: best depth-1 tree
A stump splits on one feature \`j\` at a threshold \`t\`: samples with \`X[:, j] <= t\` go **left**, the others go **right**, and each side predicts the **mean** of \`r\` on that side.

Search **exhaustively**:
- For each feature \`j = 0 .. d-1\`, take the sorted unique values \`u\` of \`X[:, j]\`; the candidate thresholds are the **midpoints** \`(u[:-1] + u[1:]) / 2\` (a feature with a single unique value has none).
- Pick the split with the smallest sum of squared errors
\`\`\`
SSE = sum_left (r - mean_left)^2 + sum_right (r - mean_right)^2
\`\`\`
- **Ties**: keep the first one found, scanning features in order and thresholds in ascending order (i.e. only replace the best on a strictly smaller SSE).
- If there is no candidate at all, return \`(0, inf, mean(r), mean(r))\`.

Returns \`(feature, threshold, left_value, right_value)\`.

### 2. \`gradient_boosting(X, y, n_rounds, learning_rate)\`
\`\`\`
F_0 = mean(y)                          # constant initial prediction
for m = 1 .. n_rounds:
    r   = y - F_{m-1}                   # residuals = negative gradient
    h_m = fit_stump(X, r)
    F_m = F_{m-1} + learning_rate * h_m(X)
    loss_m = mean((y - F_m)^2)          # training MSE after round m
\`\`\`
Because each stump's leaf values are the least-squares fit to the residuals, the training loss is **non-increasing** for \`0 < learning_rate <= 1\`.

### Expected Return Format
\`gradient_boosting\` returns a dictionary with these keys:
- \`'f0'\`: the initial constant prediction (float)
- \`'stumps'\`: list of \`n_rounds\` tuples \`(feature, threshold, left_value, right_value)\`
- \`'predictions'\`: final training predictions \`F_M\`, shape \`(n,)\`
- \`'losses'\`: list of \`n_rounds\` floats, the training MSE after each round
    `,
    examples: [
      {
        input: 'fit_stump(np.array([[1], [2], [3], [4], [5], [6]]), np.array([-2., -2., -2., 2., 2., 2.]))',
        output: '(0, 3.5, -2.0, 2.0)',
        explanation: 'Splitting between 3 and 4 separates the residuals perfectly (SSE = 0).',
      },
      {
        input: 'gradient_boosting(X, y=[1, 1, 1, 5, 5, 5], n_rounds=3, learning_rate=0.5)',
        output: 'f0 = 3.0, losses = [1.0, 0.25, 0.0625]',
        explanation: 'Each round removes half of the remaining residual: MSE 4 -> 1 -> 0.25 -> 0.0625.',
      },
    ],
    starterCode: `import numpy as np

def fit_stump(X, r):
    """
    Exhaustively find the best depth-1 regression tree for targets r.

    Args:
        X: Features, shape (n, d)
        r: Targets (residuals), shape (n,)

    Returns:
        (feature, threshold, left_value, right_value)
        Left side is X[:, feature] <= threshold.
    """
    # Your code here
    pass


def gradient_boosting(X, y, n_rounds=10, learning_rate=0.1):
    """
    Gradient boosting with decision stumps on squared loss.

    Args:
        X: Features, shape (n, d)
        y: Targets, shape (n,)
        n_rounds: Number of boosting rounds
        learning_rate: Shrinkage applied to every stump

    Returns:
        dict with 'f0', 'stumps', 'predictions' (n,), 'losses' (list of n_rounds floats)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Stump separates a step perfectly',
        input: 'fit_stump(np.array([[1], [2], [3], [4], [5], [6]]), np.array([-2.0, -2.0, -2.0, 2.0, 2.0, 2.0]))',
        expected: '(0, 3.5, -2.0, 2.0)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Loss halves each round on a step function',
        input: '(lambda m: (m["f0"], [round(v, 6) for v in m["losses"]]))(gradient_boosting(np.array([[1], [2], [3], [4], [5], [6]]), np.array([1.0, 1.0, 1.0, 5.0, 5.0, 5.0]), 3, 0.5))',
        expected: '(3.0, [1.0, 0.25, 0.0625])',
        hidden: false,
      },
      {
        id: '3',
        description: 'Training loss is non-increasing',
        input: `(lambda: (
    X := np.random.rand(30, 2),
    y := np.sin(4 * X[:, 0]) + X[:, 1] ** 2 + 0.1 * np.random.randn(30),
    L := gradient_boosting(X, y, 15, 0.3)["losses"],
    bool(len(L) == 15 and all(b <= a + 1e-12 for a, b in zip(L, L[1:])) and L[-1] < np.var(y))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Stump picks the better feature and midpoint',
        input: 'fit_stump(np.array([[1.0, 5.0], [2.0, 1.0], [3.0, 4.0], [4.0, 2.0]]), np.array([1.0, -1.0, 1.0, -1.0]))',
        expected: '(1, 3.0, -1.0, 1.0)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Tie: the first feature / smallest threshold wins',
        input: 'fit_stump(np.array([[0.0, 0.0], [1.0, 1.0], [2.0, 2.0], [3.0, 3.0]]), np.array([0.0, 0.0, 4.0, 4.0]))',
        expected: '(0, 1.5, 0.0, 4.0)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Predictions and losses on a 2-feature problem',
        input: '(lambda m: (np.round(m["predictions"], 6).tolist(), [round(v, 6) for v in m["losses"]]))(gradient_boosting(np.array([[1.0, 3.0], [2.0, 1.0], [3.0, 2.0], [4.0, 5.0], [5.0, 4.0]]), np.array([1.0, 3.0, 2.0, 6.0, 4.0]), 4, 0.5))',
        expected: '([1.583789, 2.435352, 2.435352, 5.610156, 3.935352], [1.34, 0.663125, 0.315049, 0.201065])',
        hidden: true,
      },
      {
        id: '7',
        description: 'Stumps chosen on random data',
        input: `(lambda: (
    X := np.round(np.random.rand(12, 3), 2),
    y := 2 * X[:, 1] - X[:, 2] + 0.05 * np.random.randn(12),
    [(s[0], round(s[1], 6)) for s in gradient_boosting(X, y, 4, 0.5)["stumps"]]
)[-1])()`,
        expected: '[[1, 0.49], [1, 0.22], [2, 0.275], [1, 0.22]]',
        hidden: true,
      },
    ],
    hints: [
      'For a fixed feature, the candidate thresholds are the midpoints between consecutive sorted unique values: (u[:-1] + u[1:]) / 2.',
      'You can score all thresholds of a feature at once: with a boolean (T, n) mask "left", SSE = sum(r^2) - s_l^2 / n_l - s_r^2 / n_r, where s and n are the sums and counts of each side.',
      'Only replace the current best when the SSE is strictly smaller; np.argmin already returns the first minimum within a feature.',
      'In the boosting loop: residuals = y - F, fit a stump to them, then F += learning_rate * stump prediction; record np.mean((y - F) ** 2).',
    ],
    solution: `import numpy as np

def fit_stump(X, r):
    X, r = np.asarray(X, dtype=float), np.asarray(r, dtype=float)
    best = (0, np.inf, r.mean(), r.mean())
    best_sse = np.inf
    total_sq = np.sum(r ** 2)

    for j in range(X.shape[1]):
        u = np.unique(X[:, j])
        thresholds = (u[:-1] + u[1:]) / 2                    # (T,)
        if len(thresholds) == 0:
            continue
        left = X[None, :, j] <= thresholds[:, None]          # (T, n)
        n_l = left.sum(axis=1)
        n_r = len(r) - n_l
        s_l = (left * r).sum(axis=1)
        s_r = r.sum() - s_l
        # SSE = sum r^2 - n_l * mean_l^2 - n_r * mean_r^2
        sse = total_sq - s_l ** 2 / n_l - s_r ** 2 / n_r
        k = int(np.argmin(sse))                              # first minimum
        if sse[k] < best_sse:
            best_sse = sse[k]
            best = (j, float(thresholds[k]), float(s_l[k] / n_l[k]), float(s_r[k] / n_r[k]))
    return best


def stump_predict(stump, X):
    j, t, left, right = stump
    return np.where(X[:, j] <= t, left, right)


def gradient_boosting(X, y, n_rounds=10, learning_rate=0.1):
    X, y = np.asarray(X, dtype=float), np.asarray(y, dtype=float)
    f0 = float(y.mean())
    F = np.full(len(y), f0)
    stumps, losses = [], []

    for _ in range(n_rounds):
        residuals = y - F                       # negative gradient of 0.5 * (y - F)^2
        stump = fit_stump(X, residuals)
        F = F + learning_rate * stump_predict(stump, X)
        stumps.append(stump)
        losses.append(float(np.mean((y - F) ** 2)))

    return {'f0': f0, 'stumps': stumps, 'predictions': F, 'losses': losses}
`,
  },
];
