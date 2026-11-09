import { Problem } from '../../types';

export const supervisedLearningProblems: Problem[] = [
  {
    id: 'logistic-regression',
    title: 'Sigmoid for Logistic Regression',
    section: 'supervised-learning',
    difficulty: 'easy',
    description: `
## Sigmoid for Logistic Regression

Implement the **sigmoid** (logistic) function, the piece that turns a linear score into a probability in logistic regression.

### Background
Logistic regression computes a real-valued score \`z = x · w + b\` (the *logit*) and squashes it into \`(0, 1)\` with the sigmoid, so the output can be read as \`P(y = 1 | x)\`. The sigmoid is also the inverse of the log-odds: if \`p = sigmoid(z)\` then \`z = log(p / (1 - p))\`. You will reuse it in **Logistic Regression with Gradient Descent** later in this section.

### Formula
\`\`\`text
sigmoid(z) = 1 / (1 + exp(-z))
\`\`\`
Useful properties:
- \`sigmoid(0) = 0.5\`, and the output is strictly between 0 and 1 for finite \`z\`
- Symmetry: \`sigmoid(-z) = 1 - sigmoid(z)\`
- Derivative: \`sigmoid'(z) = sigmoid(z) * (1 - sigmoid(z))\` (at most 0.25, at \`z = 0\`)

### Inputs
- \`x\`: a NumPy array of any shape (ints or floats)

### Expected Return Format
A float NumPy array with the **same shape** as \`x\`, with the sigmoid applied element-wise.

### Edge Cases and Conventions
- For very negative inputs, \`exp(-z)\` overflows to \`inf\` (NumPy warns, and the result is still 0). A **numerically stable** version uses \`1 / (1 + exp(-z))\` for \`z >= 0\` and the equivalent \`exp(z) / (1 + exp(z))\` for \`z < 0\`, so \`exp\` only ever sees non-positive numbers.
- Tests compare with a tolerance of about \`1e-5\`.

### Constraints
- NumPy only, vectorised (no Python loop over elements).

### Follow-up
- Why is \`sigmoid(z)\` used for binary classification while softmax is used for \`K > 2\` classes? Show that a 2-class softmax reduces to a sigmoid of the logit difference.
    `,
    examples: [
      {
        input: 'sigmoid(np.array([0, 1, -1]))',
        output: 'array([0.5, 0.731059, 0.268941])',
        explanation: 'sigmoid(0) = 0.5, and sigmoid(-1) = 1 - sigmoid(1) by symmetry.',
      },
      {
        input: 'sigmoid(np.array([[2.0, -3.0]]))',
        output: 'array([[0.880797, 0.047426]])',
        explanation: 'The shape (1, 2) is preserved; large |z| pushes the output towards 0 or 1.',
      },
    ],
    starterCode: `import numpy as np

def sigmoid(x: np.ndarray) -> np.ndarray:
    """
    Compute the sigmoid activation function element-wise.

    Args:
        x: Input array of any shape

    Returns:
        Float array of the same shape, with 1 / (1 + exp(-x)) applied element-wise
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
      {
        id: '5',
        description: '2D input keeps its shape and values',
        input: 'np.round(sigmoid(np.array([[2.0, -3.0], [0.5, 0.0]])), 6).tolist()',
        expected: '[[0.880797, 0.047426], [0.622459, 0.5]]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Extreme inputs saturate to 0 and 1 (no nan)',
        input: 'sigmoid(np.array([-1000.0, 1000.0])).tolist()',
        expected: '[0.0, 1.0]',
        hidden: true,
      },
    ],
    hints: [
      'The sigmoid maps any real number to (0, 1); think about what happens at z = 0, z -> +inf and z -> -inf.',
      'Apply the formula to the whole array at once: NumPy operations are element-wise and preserve the shape.',
      'np.exp(-x) is the only non-trivial piece: 1 / (1 + np.exp(-x)).',
      'np.exp overflows for very negative x. For a stable version, use a boolean mask: 1 / (1 + exp(-x)) where x >= 0 and exp(x) / (1 + exp(x)) elsewhere.',
    ],
    solution: `import numpy as np

def sigmoid(x: np.ndarray) -> np.ndarray:
    """
    Numerically stable sigmoid, applied element-wise.

    Returns:
        Float array of the same shape as x
    """
    x = np.asarray(x, dtype=float)
    out = np.empty_like(x)
    pos = x >= 0
    # For x >= 0, exp(-x) <= 1 cannot overflow
    out[pos] = 1.0 / (1.0 + np.exp(-x[pos]))
    # For x < 0, rewrite as exp(x) / (1 + exp(x)) so exp only sees negative numbers
    ex = np.exp(x[~pos])
    out[~pos] = ex / (1.0 + ex)
    return out

# Time O(N), extra space O(N) for N elements
`,
  },
  {
    id: 'binary-cross-entropy',
    title: 'Binary Cross-Entropy Loss',
    section: 'supervised-learning',
    difficulty: 'easy',
    description: `
## Binary Cross-Entropy Loss

Implement the mean **binary cross-entropy** (log loss) between 0/1 labels and predicted probabilities.

### Background
BCE is the negative log-likelihood of Bernoulli labels, so minimising it is maximum-likelihood training of a binary classifier (logistic regression, the output head of a binary neural net). It punishes confident mistakes hard: predicting 0.01 for a true positive costs \`-log(0.01) ≈ 4.6\`, while 0.9 costs only 0.105.

### Formula
\`\`\`text
p_i   = clip(y_pred_i, eps, 1 - eps),   eps = 1e-15
BCE   = -(1/m) * sum_i [ y_i * log(p_i) + (1 - y_i) * log(1 - p_i) ]
\`\`\`
- \`y_i\` in {0, 1}: the true label of sample \`i\`
- \`y_pred_i\` in [0, 1]: the predicted probability that \`y_i = 1\`
- \`m\`: the number of samples

### Inputs
- \`y_true\`: array of shape \`(m,)\` with 0/1 labels (ints or floats)
- \`y_pred\`: array of shape \`(m,)\` with probabilities in \`[0, 1]\`

### Expected Return Format
A Python float: the mean loss **rounded to 4 decimals**.

### Edge Cases and Conventions
- **Clip first**: \`log(0)\` is \`-inf\`, so clip \`y_pred\` to \`[1e-15, 1 - 1e-15]\` before taking logs. With clipping, perfect predictions give a loss that rounds to \`0.0\`, and a prediction of exactly the wrong value costs about \`34.54\` instead of \`inf\`.
- Average over samples (mean, not sum).

### Constraints
- NumPy only, vectorised.

### Follow-up
- When you have logits \`z\` rather than probabilities, why is \`max(z, 0) - z*y + log(1 + exp(-|z|))\` preferred over \`BCE(y, sigmoid(z))\`?
    `,
    examples: [
      {
        input: 'binary_cross_entropy([1, 0, 1], [0.9, 0.1, 0.8])',
        output: '0.1446',
        explanation: 'Per-sample losses are -log(0.9), -log(0.9), -log(0.8) = 0.1054, 0.1054, 0.2231; their mean is 0.1446.',
      },
      {
        input: 'binary_cross_entropy([1, 0], [0.5, 0.5])',
        output: '0.6931',
        explanation: 'An uninformative 0.5 prediction costs log(2) per sample.',
      },
    ],
    starterCode: `import numpy as np

def binary_cross_entropy(y_true, y_pred):
    """
    Compute the mean binary cross-entropy loss.

    Args:
        y_true: True labels (0 or 1), shape (m,)
        y_pred: Predicted probabilities in [0, 1], shape (m,)

    Returns:
        loss: Mean BCE as a Python float, rounded to 4 decimals
              (clip y_pred to [1e-15, 1 - 1e-15] before the logs)
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
      {
        id: '5',
        description: 'Mixed confidence',
        input: '([1, 1, 0, 0], [0.7, 0.5, 0.2, 0.4])',
        expected: '0.4459',
        hidden: true,
      },
      {
        id: '6',
        description: 'Clipping keeps a certain-but-wrong prediction finite',
        input: '([1, 0], [0.0, 1.0])',
        expected: '34.5392',
        hidden: true,
      },
    ],
    hints: [
      'Each sample contributes -log of the probability the model gave to the true class: -log(p) if y = 1, -log(1 - p) if y = 0.',
      'Convert both inputs to float arrays, clip the predictions, compute the per-sample terms, then average.',
      'np.clip(y_pred, 1e-15, 1 - 1e-15), then -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p)).',
      'Forgetting to clip turns a 0 or 1 prediction into log(0) = -inf (and 0 * -inf = nan). Remember to round the final mean to 4 decimals.',
    ],
    solution: `import numpy as np

def binary_cross_entropy(y_true, y_pred):
    """
    Mean binary cross-entropy, rounded to 4 decimals.
    """
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)

    # Clip so log never sees exactly 0
    p = np.clip(y_pred, 1e-15, 1 - 1e-15)

    loss = -np.mean(y_true * np.log(p) + (1 - y_true) * np.log(1 - p))
    return round(float(loss), 4)

# Time O(m), space O(m)
`,
  },
  {
    id: 'hinge-loss',
    title: 'Hinge Loss',
    section: 'supervised-learning',
    difficulty: 'easy',
    description: `
## Hinge Loss

Implement the mean **hinge loss**, the loss behind Support Vector Machines (SVMs).

### Background
A linear SVM scores a sample with \`s = x · w + b\` and predicts \`sign(s)\`. The hinge loss asks for more than the right sign: it wants a **margin** \`y * s >= 1\`. Samples beyond the margin cost nothing (that is why only the *support vectors* near the boundary shape the solution); samples inside the margin or on the wrong side pay linearly. You will minimise this loss in **Linear SVM with Subgradient Descent**.

### Formula
\`\`\`text
L = (1/n) * sum_i max(0, 1 - y_i * s_i)
\`\`\`
- \`y_i\` in {-1, +1}: the true label (note: **not** 0/1)
- \`s_i\`: the raw score (a real number, not a probability)
- \`y_i * s_i\`: the functional margin; positive means correctly classified
- \`n\`: the number of samples

### Inputs
- \`y_true\`: array of shape \`(n,)\` with values in {-1, +1}
- \`scores\`: float array of shape \`(n,)\`

### Expected Return Format
A Python float: the mean hinge loss **rounded to 4 decimals**.

### Edge Cases and Conventions
- A margin of **exactly 1** costs 0 (\`max(0, 0) = 0\`).
- A correct but unconfident prediction (\`0 < y*s < 1\`) still has a positive loss.

### Constraints
- NumPy only, vectorised.

### Follow-up
- Compare the hinge loss with the logistic loss \`log(1 + exp(-y*s))\` as functions of the margin. Which one ever reaches exactly 0, and what does that imply for sparsity of the solution?
    `,
    examples: [
      {
        input: 'hinge_loss([1, -1, 1], [0.5, -0.8, 1.5])',
        output: '0.2333',
        explanation: 'Margins [0.5, 0.8, 1.5] give losses [0.5, 0.2, 0.0]; the mean is 0.7 / 3 = 0.2333.',
      },
      {
        input: 'hinge_loss([1, -1], [2.0, -3.0])',
        output: '0.0',
        explanation: 'Both margins (2 and 3) are at least 1, so both losses are 0.',
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
        Mean hinge loss as a Python float, rounded to 4 decimals
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
      {
        id: '5',
        description: 'Mix of inside-margin, wrong-side and safe samples',
        input: '([1, -1, 1, -1], [0.3, 0.2, -0.5, -1.5])',
        expected: '0.85',
        hidden: true,
      },
    ],
    hints: [
      'The loss only cares about the margin y * s: how far on the correct side of the boundary each sample is.',
      'Compute all margins at once, turn each into a loss, then average.',
      'np.maximum(0, 1 - y_true * scores) is the element-wise hinge; np.mean averages it.',
      'Labels must be +1/-1, not 0/1 (a 0 label would make every margin 0). Use np.maximum (element-wise), not np.max (a reduction), and round to 4 decimals.',
    ],
    solution: `import numpy as np

def hinge_loss(y_true, scores):
    """
    Mean hinge loss, rounded to 4 decimals.
    """
    y_true = np.asarray(y_true, dtype=float)
    scores = np.asarray(scores, dtype=float)

    # max(0, 1 - margin) per sample
    losses = np.maximum(0.0, 1.0 - y_true * scores)
    return round(float(np.mean(losses)), 4)

# Time O(n), space O(n)
`,
  },
  {
    id: 'decision-tree-split',
    title: 'Gini Impurity for Decision-Tree Splits',
    section: 'supervised-learning',
    difficulty: 'medium',
    description: `
## Gini Impurity for Decision-Tree Splits

Compute the **Gini impurity** of a set of class labels, the score a classification tree uses to judge how "mixed" a node is.

### Background
A decision tree grows by picking, at each node, the split that makes the children as pure as possible. Gini impurity is the probability that two labels drawn at random (with replacement) from the node disagree. It is the default criterion of scikit-learn's \`DecisionTreeClassifier\`, and you will use it to grow full trees in **Decision Tree Classifier with Bagging**.

### Formula
\`\`\`text
Gini(S) = 1 - sum_c p_c^2,     p_c = (number of labels equal to c) / |S|
\`\`\`
The sum runs over the classes that appear in \`S\`. For a split into \`L\` and \`R\`, a tree scores the weighted average \`(|L| * Gini(L) + |R| * Gini(R)) / |S|\` and picks the split with the lowest value.

| Labels | Proportions | Gini |
|--------|-------------|------|
| \`[0, 0, 0, 0]\` | 1.0 | 0.0 (pure) |
| \`[0, 0, 0, 1]\` | 0.75, 0.25 | 0.375 |
| \`[0, 0, 1, 1]\` | 0.5, 0.5 | 0.5 (max for 2 classes) |
| \`[0, 1, 2]\` | 1/3 each | 0.6667 |

With \`K\` classes the maximum is \`1 - 1/K\`, so Gini is always in \`[0, 1)\`.

### Inputs
- \`labels\`: 1D array of class labels (non-negative integers), shape \`(n,)\`. Labels need not be contiguous (\`[3, 7, 7]\` is fine).

### Expected Return Format
A float (Python or NumPy scalar), not rounded.

### Edge Cases and Conventions
- An **empty** array has impurity \`0.0\`.
- Only the proportions matter, not the label values themselves.

### Constraints
- NumPy only; no sklearn.

### Follow-up
- Entropy \`-sum p_c log2 p_c\` is the other common criterion. Why do Gini and entropy usually pick the same split, and why is Gini slightly cheaper?
    `,
    examples: [
      {
        input: 'gini_impurity(np.array([0, 0, 0, 0]))',
        output: '0.0',
        explanation: 'All labels are the same class: a pure node.',
      },
      {
        input: 'gini_impurity(np.array([0, 0, 0, 1]))',
        output: '0.375',
        explanation: '1 - (0.75^2 + 0.25^2) = 1 - 0.625 = 0.375.',
      },
      {
        input: 'gini_impurity(np.array([3, 3, 7, 7, 7]))',
        output: '0.48',
        explanation: 'Label values do not matter, only proportions: 1 - (0.4^2 + 0.6^2) = 0.48.',
      },
    ],
    starterCode: `import numpy as np

def gini_impurity(labels: np.ndarray) -> float:
    """
    Calculate the Gini impurity of a set of labels.

    Args:
        labels: 1D array of class labels (non-negative integers), shape (n,)

    Returns:
        Gini impurity 1 - sum_c p_c^2, in [0, 1) (0.0 for an empty array)
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
      {
        id: '5',
        description: 'Non-contiguous labels',
        input: 'round(gini_impurity(np.array([3, 3, 7, 7, 7])), 6)',
        expected: '0.48',
        hidden: true,
      },
      {
        id: '6',
        description: 'Three unbalanced classes',
        input: 'round(gini_impurity(np.array([0, 0, 1, 1, 1, 2])), 6)',
        expected: '0.611111',
        hidden: true,
      },
    ],
    hints: [
      'Gini only depends on the fraction of samples in each class, not on the label values or their order.',
      'Count how many times each class appears, divide by the number of samples, then combine the proportions.',
      'np.unique(labels, return_counts=True) gives the counts; Gini = 1 - np.sum((counts / n) ** 2).',
      'Guard against an empty array (division by zero). np.bincount also counts, but it adds zero counts for missing labels, which is harmless here.',
    ],
    solution: `import numpy as np

def gini_impurity(labels: np.ndarray) -> float:
    """
    Gini impurity 1 - sum_c p_c^2 (0.0 for an empty array).
    """
    labels = np.asarray(labels)
    if labels.size == 0:
        return 0.0

    # Class proportions
    _, counts = np.unique(labels, return_counts=True)
    p = counts / labels.size

    return float(1.0 - np.sum(p ** 2))

# Time O(n log n) for np.unique (O(n) with np.bincount), space O(K)
`,
  },
  {
    id: 'linear-regression-gd',
    title: 'Linear Regression with Gradient Descent',
    section: 'supervised-learning',
    difficulty: 'medium',
    description: `
## Linear Regression with Gradient Descent

Fit a one-feature linear model \`y ≈ w * x + b\` by running **batch gradient descent** on the mean squared error.

### Background
Linear regression has a closed-form solution, but gradient descent is how almost every other model (and every neural network) is trained. Implementing it on the simplest model shows the full loop: predict, measure the loss, compute gradients, step.

### Formula
Loss (mean squared error over the \`n\` samples):
\`\`\`text
J(w, b) = (1/n) * sum_i (y_pred_i - y_i)^2,     y_pred_i = w * x_i + b
\`\`\`
Gradients:
\`\`\`text
dJ/dw = (2/n) * sum_i (y_pred_i - y_i) * x_i
dJ/db = (2/n) * sum_i (y_pred_i - y_i)
\`\`\`
Algorithm:
1. Start from \`w = 0\`, \`b = 0\`.
2. Repeat \`iterations\` times: compute \`y_pred\` with the **current** \`w, b\`, compute both gradients, then update **both** parameters simultaneously: \`w -= learning_rate * dJ/dw\`, \`b -= learning_rate * dJ/db\`.
3. Return the final \`(w, b)\`.

### Inputs
- \`X\`: 1D float array of inputs, shape \`(n,)\`
- \`y\`: 1D float array of targets, shape \`(n,)\`
- \`learning_rate\`: step size (float, e.g. 0.01 to 0.1)
- \`iterations\`: number of full-batch updates (int)

### Expected Return Format
A tuple \`(w, b)\` with both values **rounded to 2 decimals**.

### Edge Cases and Conventions
- Use the exact update order above: the tests include a 10-iteration run, which checks the update rule itself, not just the optimum it converges to.
- Too large a learning rate makes the iterates diverge; the tests use stable values.

### Constraints
- NumPy only; no \`np.polyfit\` or closed-form least squares. Vectorise each step over the samples (one Python loop over iterations is expected).

### Follow-up
- Derive the closed form \`w = cov(x, y) / var(x)\`, \`b = mean(y) - w * mean(x)\`, and explain when gradient descent is still preferable.
- Why does standardising \`x\` let you use a larger learning rate?
    `,
    examples: [
      {
        input: 'linear_regression(np.array([1, 2, 3, 4]), np.array([2, 4, 6, 8]), 0.1, 1000)',
        output: '(2.0, 0.0)',
        explanation: 'The data lie exactly on y = 2x, and 1000 steps are enough to converge.',
      },
      {
        input: 'linear_regression(np.array([1, 2, 3, 4]), np.array([2, 4, 6, 8]), 0.01, 1)',
        output: '(0.3, 0.1)',
        explanation: 'One step from (0, 0): dJ/dw = (2/4) * (-60) = -30 and dJ/db = (2/4) * (-20) = -10, so w = 0.3 and b = 0.1.',
      },
    ],
    starterCode: `import numpy as np

def linear_regression(X: np.ndarray, y: np.ndarray,
                      learning_rate: float = 0.01,
                      iterations: int = 1000) -> tuple:
    """
    Train y = w * x + b with batch gradient descent on the MSE.

    Args:
        X: Input features, 1D array of shape (n,)
        y: Target values, 1D array of shape (n,)
        learning_rate: Step size for gradient descent
        iterations: Number of full-batch updates

    Returns:
        Tuple (w, b), each rounded to 2 decimals
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
      {
        id: '5',
        description: 'Few iterations (checks the update rule, not just the optimum)',
        input: '([1, 2, 3, 4], [2, 4, 6, 8], 0.01, 10)',
        expected: '(1.51, 0.49)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Noisy data converges to the least-squares fit',
        input: '([0, 1, 2, 3, 4], [1.1, 2.9, 5.2, 7.1, 8.8], 0.05, 2000)',
        expected: '(1.96, 1.1)',
        hidden: true,
      },
    ],
    hints: [
      'Each iteration is the same three steps: predict with the current parameters, measure how wrong you are, nudge both parameters downhill.',
      'Inside a loop over iterations: y_pred = w * X + b, error = y_pred - y, then the two gradients, then the two updates.',
      'dw = (2 / n) * np.sum(error * X) and db = (2 / n) * np.sum(error); then w -= learning_rate * dw and b -= learning_rate * db.',
      'Compute both gradients before updating either parameter; updating w first and then using the new w for db is a different (wrong) algorithm.',
    ],
    solution: `import numpy as np

def linear_regression(X: np.ndarray, y: np.ndarray,
                      learning_rate: float = 0.01,
                      iterations: int = 1000) -> tuple:
    """
    Batch gradient descent on the MSE. Returns (w, b) rounded to 2 decimals.
    """
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    w, b = 0.0, 0.0
    n = len(X)

    for _ in range(iterations):
        error = (w * X + b) - y          # y_pred - y, shape (n,)

        # Gradients of (1/n) * sum(error^2)
        dw = (2 / n) * np.sum(error * X)
        db = (2 / n) * np.sum(error)

        # Simultaneous update
        w -= learning_rate * dw
        b -= learning_rate * db

    return (round(float(w), 2), round(float(b), 2))

# Time O(iterations * n), space O(n)
`,
  },
  {
    id: 'logistic-regression-full',
    title: 'Logistic Regression with Gradient Descent',
    section: 'supervised-learning',
    difficulty: 'medium',
    description: `
## Logistic Regression with Gradient Descent

Train a binary **logistic regression** classifier from scratch: a linear score, a sigmoid, and batch gradient descent on the mean binary cross-entropy.

### Background
Logistic regression is the baseline classifier in industry (click-through prediction, fraud scoring) and the "one-neuron network" of deep learning. It combines the two earlier problems in this section: **Sigmoid for Logistic Regression** and **Binary Cross-Entropy Loss**. The neat fact interviewers ask about: the gradient of BCE through a sigmoid simplifies to \`(prediction - label) * input\`, exactly the same form as linear regression.

### Formula
For \`X\` of shape \`(m, n)\`, \`w\` of shape \`(n,)\` and a scalar \`b\`:
\`\`\`text
z      = X @ w + b                      # logits, shape (m,)
y_pred = sigmoid(z) = 1 / (1 + exp(-z)) # probabilities, shape (m,)
L      = -(1/m) * sum_i [ y_i log(y_pred_i) + (1 - y_i) log(1 - y_pred_i) ]

dL/dw  = (1/m) * X.T @ (y_pred - y)     # shape (n,)
dL/db  = (1/m) * sum_i (y_pred_i - y_i) # scalar
\`\`\`
Algorithm:
1. Start from \`w = zeros(n)\`, \`b = 0\`.
2. Repeat \`iterations\` times: forward pass, both gradients, then \`w -= learning_rate * dw\` and \`b -= learning_rate * db\`.

### Inputs
- \`X\`: features, array of shape \`(m, n)\` (ints or floats)
- \`y\`: binary labels in {0, 1}, shape \`(m,)\`
- \`learning_rate\`: step size (float)
- \`iterations\`: number of full-batch updates (int)

A \`sigmoid(z)\` helper is already provided in the starter code.

### Expected Return Format
A tuple \`(w, b)\`:
- \`w\`: NumPy array of shape \`(n,)\`, rounded to 4 decimals (\`np.round(w, 4)\`)
- \`b\`: Python float, rounded to 4 decimals

### Edge Cases and Conventions
- There is **no regularisation**, so on linearly separable data (like the AND gate in the tests) the weights keep growing the longer you train; the tests fix the iteration count so the result is deterministic.
- You do not need to compute the loss itself to train; only its gradient.

### Constraints
- NumPy only, vectorised over samples; no sklearn. (This matches \`sklearn.linear_model.LogisticRegression(penalty=None)\` only in the limit of convergence; sklearn adds an L2 penalty by default.)

### Follow-up
- Derive \`dL/dz = y_pred - y\` from the chain rule.
- Add L2 regularisation \`(lam/2) * ||w||^2\`: how do the gradients change, and why is \`b\` usually not penalised?
    `,
    examples: [
      {
        input: 'logistic_regression(np.array([[0, 0], [0, 1], [1, 0], [1, 1]]), np.array([0, 0, 0, 1]), 0.5, 1000)',
        output: '(array([6.0141, 6.0141]), -9.1984)',
        explanation: 'The AND gate: only (1, 1) gets a positive logit (6.01 + 6.01 - 9.20 > 0).',
      },
      {
        input: 'Same data, iterations=1',
        output: '(array([0., 0.]), -0.125)',
        explanation: 'At w = 0, b = 0 every prediction is 0.5, so y_pred - y = [0.5, 0.5, 0.5, -0.5]: dw = 0 and db = 0.25, giving b = -0.5 * 0.25.',
      },
    ],
    starterCode: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def logistic_regression(X, y, learning_rate=0.1, iterations=1000):
    """
    Train logistic regression with batch gradient descent on the mean BCE.

    Args:
        X: Features, shape (m, n)
        y: Binary labels in {0, 1}, shape (m,)
        learning_rate: Step size
        iterations: Number of full-batch updates

    Returns:
        w: Learned weights, shape (n,), rounded to 4 decimals
        b: Learned bias (Python float), rounded to 4 decimals
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
        description: 'Simple separable data (AND)',
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
      {
        id: '5',
        description: 'OR data: learned weights and bias',
        input: '(lambda r: (r[0].tolist(), r[1]))(logistic_regression(np.array([[0, 0], [0, 1], [1, 0], [1, 1]]), np.array([0, 1, 1, 1]), 0.5, 1000))',
        expected: '([7.2375, 7.2375], -3.1461)',
        hidden: true,
      },
      {
        id: '6',
        description: 'One step from zero (checks the gradient formula)',
        input: '(lambda r: (r[0].tolist(), r[1]))(logistic_regression(np.array([[0, 0], [0, 1], [1, 0], [1, 1]]), np.array([0, 0, 0, 1]), 0.5, 1))',
        expected: '([0.0, 0.0], -0.125)',
        hidden: true,
      },
    ],
    hints: [
      'This is linear regression with a sigmoid on top: the loop structure (predict, gradient, update) is identical.',
      'Forward: z = X @ w + b and y_pred = sigmoid(z). The error vector y_pred - y has shape (m,).',
      'dw = X.T @ (y_pred - y) / m and db = np.mean(y_pred - y); then w -= learning_rate * dw and b -= learning_rate * db.',
      'Do not differentiate through the sigmoid separately: the BCE and sigmoid derivatives cancel to y_pred - y. Use X.T @ error (shape (n,)), not X @ error.',
    ],
    solution: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def logistic_regression(X, y, learning_rate=0.1, iterations=1000):
    """
    Batch gradient descent on the mean BCE.
    Returns (w rounded to 4 decimals, b as a float rounded to 4 decimals).
    """
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    m, n = X.shape
    w = np.zeros(n)
    b = 0.0

    for _ in range(iterations):
        y_pred = sigmoid(X @ w + b)      # (m,)
        error = y_pred - y               # dL/dz for BCE + sigmoid

        dw = X.T @ error / m             # (n,)
        db = np.mean(error)

        w -= learning_rate * dw
        b -= learning_rate * db

    return np.round(w, 4), round(float(b), 4)

# Time O(iterations * m * n), space O(m + n)
`,
  },
  {
    id: 'linear-svm',
    title: 'Linear SVM with Subgradient Descent',
    section: 'supervised-learning',
    difficulty: 'medium',
    description: `
## Linear SVM with Subgradient Descent

Train a **linear Support Vector Machine** by full-batch (sub)gradient descent on the L2-regularised hinge loss.

### Background
An SVM looks for the hyperplane \`x · w + b = 0\` with the widest margin between the classes. The soft-margin version trades margin width (small \`||w||\`) against hinge-loss violations. The hinge \`max(0, 1 - margin)\` has a kink at margin 1, so we use a **subgradient**: the gradient of whichever piece is active. Uses the loss from **Hinge Loss**.

### Objective
\`\`\`text
J(w, b) = (lam/2) * ||w||^2 + (1/m) * sum_i max(0, 1 - y_i * (X_i · w + b))
\`\`\`
- \`X_i\`: row \`i\` of \`X\`, shape \`(n,)\`; \`w\`: shape \`(n,)\`; \`b\`: scalar
- \`y_i\` in {-1, +1}
- \`lam\` (\`lambda_param\`): regularisation strength. The bias is **not** regularised.

### Subgradient
Let \`V = { i : y_i * (X_i · w + b) < 1 }\` be the samples that violate the margin (**strictly** less than 1; a margin of exactly 1 counts as satisfied). Then
\`\`\`text
dJ/dw = lam * w - (1/m) * sum_{i in V} y_i * X_i
dJ/db =         - (1/m) * sum_{i in V} y_i
\`\`\`
The regularisation term \`lam * w\` appears **once**, whatever the samples do; samples outside \`V\` contribute nothing to the hinge part.

### Algorithm
1. Start from \`w = zeros(n)\`, \`b = 0\`.
2. Repeat \`iterations\` times: compute all margins with the current \`w, b\`, find \`V\`, compute both subgradients, then \`w -= learning_rate * dJ/dw\` and \`b -= learning_rate * dJ/db\`.

### Inputs
- \`X\`: features, shape \`(m, n)\`
- \`y\`: labels in {-1, +1}, shape \`(m,)\`
- \`learning_rate\`, \`lambda_param\`: floats; \`iterations\`: int

### Expected Return Format
A tuple \`(w, b)\`:
- \`w\`: NumPy array of shape \`(n,)\`, rounded to 4 decimals
- \`b\`: Python float, rounded to 4 decimals

Predict with \`np.sign(X @ w + b)\`.

### Constraints
- NumPy only, vectorised over samples (a boolean mask for \`V\`); no sklearn.
- This objective is the one minimised by \`sklearn.linear_model.SGDClassifier(loss='hinge', penalty='l2', alpha=lam)\`, but sklearn uses stochastic updates and a learning-rate schedule, so its numbers differ. \`LinearSVC\` uses \`C\` (roughly \`1 / (lam * m)\`) and the squared hinge by default.

### Follow-up
- Why does the solution depend only on the support vectors?
- How would you swap the linear score for a kernel, and why is that natural in the dual but not in this primal formulation?
    `,
    examples: [
      {
        input: 'linear_svm(np.array([[2, 1], [3, 2], [-2, -1], [-3, -2]]), np.array([1, 1, -1, -1]), 0.01, 0.01, 1000)',
        output: '(array([0.4009, 0.2231]), 0.0)',
        explanation: 'The data are symmetric around the origin, so b stays 0; sign(X @ w) classifies all four points correctly.',
      },
      {
        input: 'Same data, learning_rate=0.1, iterations=1',
        output: '(array([0.25, 0.15]), 0.0)',
        explanation: 'At w = 0 every margin is 0 < 1, so all samples are in V: dw = -(1/4) * sum(y_i X_i) = -[2.5, 1.5], db = 0.',
      },
    ],
    starterCode: `import numpy as np

def linear_svm(X, y, learning_rate=0.01, lambda_param=0.01, iterations=1000):
    """
    Train a linear SVM by subgradient descent on
    (lambda_param / 2) * ||w||^2 + mean(max(0, 1 - y * (X @ w + b))).

    Args:
        X: Features, shape (m, n)
        y: Labels in {-1, +1}, shape (m,)
        learning_rate: Step size
        lambda_param: L2 regularization strength (bias not regularized)
        iterations: Number of full-batch updates

    Returns:
        w: Learned weights, shape (n,), rounded to 4 decimals
        b: Learned bias (Python float), rounded to 4 decimals
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
      {
        id: '4',
        description: 'Learned weights and bias on asymmetric data',
        input: '(lambda r: (r[0].tolist(), r[1]))(linear_svm(np.array([[2.0, 0.5], [1.0, 1.5], [-1.0, -0.5], [-0.5, -2.0]]), np.array([1.0, 1.0, -1.0, -1.0]), 0.05, 0.1, 200))',
        expected: '([0.5321, 0.4822], -0.2375)',
        hidden: true,
      },
      {
        id: '5',
        description: 'One step from zero (every sample violates the margin)',
        input: '(lambda r: (r[0].tolist(), r[1]))(linear_svm(np.array([[2, 1], [3, 2], [-2, -1], [-3, -2]]), np.array([1, 1, -1, -1]), 0.1, 0.01, 1))',
        expected: '([0.25, 0.15], 0.0)',
        hidden: true,
      },
    ],
    hints: [
      'Only samples that violate the margin (y * score < 1) push on w and b; the regulariser always pulls w towards 0.',
      'Each iteration: margins = y * (X @ w + b), mask = margins < 1, then the two subgradients from the masked rows.',
      'dw = lambda_param * w - X[mask].T @ y[mask] / m and db = -np.sum(y[mask]) / m.',
      'Add lambda_param * w once, not once per sample, and divide the hinge part by m (all samples), not by the number of violators. Use a strict < 1.',
    ],
    solution: `import numpy as np

def linear_svm(X, y, learning_rate=0.01, lambda_param=0.01, iterations=1000):
    """
    Subgradient descent on the L2-regularised hinge loss.
    Returns (w rounded to 4 decimals, b as a float rounded to 4 decimals).
    """
    X = np.asarray(X, dtype=float)
    y = np.asarray(y, dtype=float)
    m, n = X.shape
    w = np.zeros(n)
    b = 0.0

    for _ in range(iterations):
        margins = y * (X @ w + b)        # (m,)
        violators = margins < 1          # samples with an active hinge

        dw = lambda_param * w - X[violators].T @ y[violators] / m
        db = -np.sum(y[violators]) / m

        w -= learning_rate * dw
        b -= learning_rate * db

    return np.round(w, 4), round(float(b), 4)

# Time O(iterations * m * n), space O(m + n)
`,
  },
  {
    id: 'knn-classifier',
    title: 'k-Nearest Neighbours Classifier',
    section: 'supervised-learning',
    difficulty: 'medium',
    description: `
## k-Nearest Neighbours Classifier

Implement \`knn_predict(X_train, y_train, X_test, k)\`: classify each query point by a **majority vote** of its \`k\` nearest training points under Euclidean distance.

### Background
k-NN is the canonical *lazy* learner: "training" is just storing the data, and all the work happens at prediction time. It is a strong baseline, the core of retrieval and recommendation systems (with approximate nearest-neighbour indexes), and a favourite interview question because it tests vectorised distance computation and careful tie-breaking.

### Algorithm
For every query \`x\` in \`X_test\`:
1. Compute the Euclidean distance to every training point:
\`\`\`text
d(x, x_i) = sqrt( sum_j (x_j - x_ij)^2 )
\`\`\`
2. Take the \`k\` nearest training points. If several are at the **same distance**, the one with the **smaller training index** comes first (a *stable* sort: \`np.argsort(d, kind='stable')\`).
3. Count the labels of those \`k\` neighbours and predict the most common one.
4. **Vote ties**: if two or more classes share the top count, predict the **smallest label** among them.

All pairwise distances at once, via broadcasting:
\`\`\`python
diff = X_test[:, None, :] - X_train[None, :, :]   # (m, n, d)
D = np.sqrt((diff ** 2).sum(axis=-1))             # (m, n)
\`\`\`

### Inputs
- \`X_train\`: float array \`(n, d)\`
- \`y_train\`: non-negative integer labels \`(n,)\` (so \`np.bincount\` works for the vote)
- \`X_test\`: float array \`(m, d)\`
- \`k\`: int with \`1 <= k <= n\`

### Expected Return Format
An integer NumPy array of shape \`(m,)\`: the predicted label of each query.

### Edge Cases and Conventions
- \`k = 1\` is the nearest-neighbour rule; \`k = n\` gives every query the overall majority class.
- scikit-learn's \`KNeighborsClassifier(n_neighbors=k)\` (uniform weights) also resolves vote ties to the smallest label. For distance ties its docs say the result depends on the order of the training data; here the order is pinned down by the stable sort.
- Features on different scales dominate the distance, so in practice you standardise first (not needed for the tests).

### Constraints
- NumPy only; no sklearn or scipy. Compute the distance matrix without Python loops; a loop over queries for the vote is fine.

### Follow-up
- The \`(m, n, d)\` difference tensor can be huge. Rewrite the squared distances as \`||a||^2 - 2 a·b + ||b||^2\` to need only \`(m, n)\` memory. What numerical issue appears, and how do you guard against it?
- How do KD-trees or approximate indexes (HNSW, IVF) cut the \`O(m n d)\` query cost?
    `,
    examples: [
      {
        input: 'knn_predict(np.array([[0, 0], [1, 0], [0, 1], [5, 5], [6, 5]]), np.array([0, 0, 0, 1, 1]), np.array([[0.5, 0.5], [5.5, 5]]), k=3)',
        output: 'array([0, 1])',
        explanation: 'The first query has three class-0 neighbours. The second has (5,5) and (6,5) (class 1) and then (1,0) (class 0): 2 votes to 1 for class 1.',
      },
      {
        input: 'knn_predict(np.array([[0], [2]]), np.array([1, 0]), np.array([[1]]), k=2)',
        output: 'array([0])',
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
        k: Number of neighbours (1 <= k <= n)

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
      'Split the problem in two: a distance matrix between every query and every training point, then a vote per query.',
      'Broadcast X_test[:, None, :] - X_train[None, :, :] to get an (m, n, d) array of differences, then sum squares over the last axis (the sqrt does not change the order, but keep it for clarity).',
      "np.argsort(D, axis=1, kind='stable')[:, :k] gives each query's k nearest indices; np.bincount(y_train[idx], minlength=n_classes) counts the votes and np.argmax picks the first (smallest) label among tied maxima.",
      "The default np.argsort (quicksort) is not stable, so equal distances can come out in any order. Also pass minlength so every vote vector has the same length.",
    ],
    solution: `import numpy as np

def knn_predict(X_train, y_train, X_test, k=3):
    """
    k-NN with Euclidean distance. Returns an int array of shape (m,).
    """
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

# Time O(m * n * d + m * n log n), space O(m * n * d) for the broadcast difference
`,
  },
  {
    id: 'naive-bayes',
    title: 'Gaussian Naive Bayes',
    section: 'supervised-learning',
    difficulty: 'medium',
    description: `
## Gaussian Naive Bayes

Implement \`gaussian_nb_fit\` and \`gaussian_nb_predict_proba\`: fit one Gaussian per class and feature, then turn new points into class probabilities with Bayes' rule, computed in **log space**.

### Background
Naive Bayes assumes the features are **independent given the class**, so the class-conditional density factorises into one 1D density per feature. The assumption is rarely true, yet the classifier is fast, needs little data and is a classic text and tabular baseline. The interview content is in the numerics: multiplying many small densities underflows, so everything happens in log space with a logsumexp.

### Fit
For each class \`c\` in ascending order (\`np.unique(y)\`), with \`n_c\` samples of class \`c\` out of \`n\`:
\`\`\`text
prior[c]   = n_c / n
mean[c, j] = mean of feature j over the samples of class c
var[c, j]  = variance (ddof=0) of feature j over class c  +  epsilon
epsilon    = var_smoothing * max_j Var(X[:, j])     # computed once, over ALL samples
\`\`\`
\`epsilon\` keeps variances away from zero (a feature that is constant within a class would otherwise divide by zero). These are exactly the conventions of scikit-learn's \`GaussianNB(var_smoothing=1e-9)\`: \`priors\` = \`class_prior_\`, \`means\` = \`theta_\`, \`vars\` = \`var_\`.

### Predict
The joint log-likelihood of sample \`x\` (shape \`(d,)\`) and class \`c\`:
\`\`\`text
jll[c] = log prior[c] - 0.5 * sum_j log(2*pi*var[c, j])
                      - 0.5 * sum_j (x_j - mean[c, j])^2 / var[c, j]
\`\`\`
Normalise with **logsumexp** to get the posterior:
\`\`\`text
log P(c | x) = jll[c] - logsumexp_c'(jll[c'])
logsumexp(a) = max(a) + log(sum(exp(a - max(a))))
\`\`\`

### Inputs
- \`X\`: float array \`(n, d)\` for fitting, \`(m, d)\` for prediction
- \`y\`: class labels \`(n,)\`
- \`var_smoothing\`: float, default \`1e-9\`

### Expected Return Format
\`gaussian_nb_fit\` returns a dictionary with these keys:
- \`'classes'\`: sorted unique labels, shape \`(C,)\`
- \`'priors'\`: class priors, shape \`(C,)\`
- \`'means'\`: per-class feature means, shape \`(C, d)\`
- \`'vars'\`: per-class feature variances **including** epsilon, shape \`(C, d)\`

\`gaussian_nb_predict_proba\` returns an array of shape \`(m, C)\` whose rows sum to 1, with columns in the order of \`model['classes']\`.

### Edge Cases and Conventions
- Use the population variance (\`ddof=0\`), as sklearn does.
- Never multiply raw densities: with many features, or a point far from every class, they underflow to \`0\` and you get \`0/0 = nan\`. In log space a point at \`x = -500\` still gets a clean \`[1.0, 0.0]\`.

### Constraints
- NumPy only; no sklearn or scipy. Vectorise prediction over samples and classes with broadcasting.

### Follow-up
- Where does the "naive" assumption hurt most (duplicated or strongly correlated features)?
- How do multinomial and Bernoulli Naive Bayes differ, and why do they need Laplace smoothing instead of \`var_smoothing\`?
    `,
    examples: [
      {
        input: 'gaussian_nb_fit(np.array([[1.0], [2.0], [3.0], [6.0], [7.0], [8.0]]), np.array([0, 0, 0, 1, 1, 1]))',
        output: "priors [0.5, 0.5], means [[2.0], [7.0]], vars ≈ [[0.6667], [0.6667]]",
        explanation: 'Each class has 3 points with variance 2/3; epsilon = 1e-9 * Var(X) is negligible here.',
      },
      {
        input: 'gaussian_nb_predict_proba(model, np.array([[4.5]]))',
        output: 'array([[0.5, 0.5]])',
        explanation: '4.5 is equidistant from both means, and the classes have equal priors and variances.',
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
        dict with 'classes' (C,), 'priors' (C,), 'means' (C, d),
        'vars' (C, d) (ddof=0 variances plus epsilon)
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
        Probabilities, shape (m, C), columns in the order of model['classes'];
        rows sum to 1
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
      'Fitting is just counting and averaging per class; prediction is Bayes rule: log prior + sum of per-feature log densities, then normalise.',
      'Loop over np.unique(y): mask X[y == c] and take .mean(axis=0) and .var(axis=0) (ddof=0). epsilon = var_smoothing * np.var(X, axis=0).max() is computed once over all samples.',
      'Build the (m, C) joint log-likelihood with broadcasting: (X[:, None, :] - means[None, :, :]) ** 2 / vars[None] summed over the last axis.',
      'Subtract the row max before exponentiating (logsumexp); exponentiating jll directly underflows to 0 for far-away points and gives nan.',
    ],
    solution: `import numpy as np

def gaussian_nb_fit(X, y, var_smoothing=1e-9):
    """
    Returns {'classes', 'priors', 'means', 'vars'} like sklearn's GaussianNB.
    """
    X = np.asarray(X, dtype=float)
    y = np.asarray(y)
    classes = np.unique(y)
    epsilon = var_smoothing * np.var(X, axis=0).max()   # over all samples

    priors = np.array([np.mean(y == c) for c in classes])
    means = np.array([X[y == c].mean(axis=0) for c in classes])
    variances = np.array([X[y == c].var(axis=0) for c in classes]) + epsilon
    return {'classes': classes, 'priors': priors, 'means': means, 'vars': variances}


def gaussian_nb_predict_proba(model, X):
    """
    Posterior probabilities, shape (m, C), via logsumexp.
    """
    X = np.asarray(X, dtype=float)
    means, variances = model['means'], model['vars']           # (C, d)

    # Joint log-likelihood, (m, C)
    log_norm = -0.5 * np.sum(np.log(2 * np.pi * variances), axis=1)          # (C,)
    sq = ((X[:, None, :] - means[None, :, :]) ** 2 / variances[None]).sum(-1)  # (m, C)
    jll = np.log(model['priors']) + log_norm - 0.5 * sq

    # Normalize with logsumexp (subtract the row max first)
    mx = jll.max(axis=1, keepdims=True)
    log_z = mx + np.log(np.exp(jll - mx).sum(axis=1, keepdims=True))
    return np.exp(jll - log_z)

# Fit O(n * d), predict O(m * C * d) time and space
`,
  },
  {
    id: 'ridge-lasso',
    title: 'Ridge & Lasso Regression',
    section: 'supervised-learning',
    difficulty: 'hard',
    description: `
## Ridge & Lasso Regression

Implement \`ridge_fit\` (closed form) and \`lasso_fit\` (cyclic coordinate descent), both with an **unpenalised intercept**, matching scikit-learn's \`Ridge\` and \`Lasso\`.

### Background
Both add a penalty on the weights to least squares to fight overfitting and collinearity. **Ridge** (L2) shrinks all weights smoothly and has a closed form. **Lasso** (L1) has no closed form, but it sets some weights to **exactly zero**, so it doubles as feature selection. "Why does L1 give sparsity and L2 not?" is a standard interview question.

### The intercept is not penalised
Penalising \`b\` would make the fit depend on where the origin of \`y\` is. Instead, **centre** the data, fit without an intercept, then recover it:
\`\`\`text
x_mean = X.mean(axis=0)    (d,)       y_mean = y.mean()
Xc = X - x_mean            (n, d)     yc = y - y_mean    (n,)
... fit w on (Xc, yc) ...
b = y_mean - x_mean @ w
\`\`\`
This is what scikit-learn does with \`fit_intercept=True\`.

### 1. Ridge: \`ridge_fit(X, y, lam)\`
Minimises \`||yc - Xc w||^2 + lam * ||w||^2\` (sklearn \`Ridge(alpha=lam)\`; note: **no** \`1/n\` factor). Setting the gradient to zero gives
\`\`\`text
w = (Xc^T Xc + lam * I_d)^(-1) Xc^T yc
\`\`\`
Solve the linear system with \`np.linalg.solve\` instead of forming the inverse.

### 2. Lasso: \`lasso_fit(X, y, lam, n_sweeps=100)\`
Minimises (sklearn \`Lasso(alpha=lam)\` scaling, **with** a \`1/(2n)\` factor):
\`\`\`text
(1 / (2n)) * ||yc - Xc w||^2 + lam * ||w||_1
\`\`\`
by **cyclic coordinate descent**:
1. Start from \`w = 0\`.
2. Each sweep updates \`j = 0, 1, ..., d-1\` **in order**, each update using the latest values of all other weights:
\`\`\`text
r     = yc - Xc @ w                         # current residual, (n,)
rho_j = (1/n) * Xc[:, j] @ (r + Xc[:, j] * w_j)   # fit of feature j to the residual without it
z_j   = (1/n) * Xc[:, j] @ Xc[:, j]
w_j   = soft_threshold(rho_j, lam) / z_j    # leave w_j = 0 if z_j == 0 (constant feature)

soft_threshold(a, lam) = sign(a) * max(|a| - lam, 0)
\`\`\`
3. Run exactly \`n_sweeps\` full sweeps (no early stopping).

### Inputs
- \`X\`: float array \`(n, d)\`; \`y\`: float array \`(n,)\`
- \`lam\`: penalty strength \`>= 0\`; \`n_sweeps\`: int

### Expected Return Format
Both functions return a tuple \`(w, b)\`:
- \`w\`: NumPy weight array of shape \`(d,)\`
- \`b\`: intercept as a Python float

### Edge Cases and Conventions
- With \`lam = 0\`, ridge is ordinary least squares.
- Whenever \`|rho_j| <= lam\`, lasso sets \`w_j\` to **exactly** 0. If \`lam >= max_j |Xc[:, j] @ yc| / n\`, every weight is zero and \`b = mean(y)\`.
- The two \`lam\`s are on different scales (ridge has no \`1/n\`), exactly like sklearn's \`alpha\`.

### Constraints
- NumPy only; no sklearn. Keep the residual up to date incrementally inside the lasso loop rather than recomputing \`Xc @ w\`.

### Follow-up
- Sketch the L1 and L2 constraint regions and explain geometrically why L1 hits corners (zeros).
- Elastic net mixes both penalties: how does the coordinate update change?
    `,
    examples: [
      {
        input: 'ridge_fit(np.array([[1.0], [2.0], [3.0], [4.0]]), np.array([3.0, 5.0, 7.0, 9.0]), 0.0)',
        output: '(array([2.]), 1.0)',
        explanation: 'With no penalty, ridge is ordinary least squares: y = 2x + 1.',
      },
      {
        input: 'Same data, lam = 5',
        output: '(array([1.]), 3.5)',
        explanation: 'Xc^T Xc = 5 and Xc^T yc = 10, so w = 10 / (5 + 5) = 1; b = 6 - 2.5 * 1 = 3.5.',
      },
      {
        input: 'X = np.random.randn(40, 5), y = 3*X[:, 0] - 2*X[:, 1] + 0.1*noise + 4, lasso_fit(X, y, 0.3)',
        output: 'w ≈ [2.7375, -1.6758, 0.0, 0.0, 0.0], b ≈ 3.9411',
        explanation: 'The three noise features get exactly zero weight; the true weights (3, -2) are shrunk towards zero by the L1 penalty (same as sklearn Lasso(alpha=0.3)).',
      },
    ],
    starterCode: `import numpy as np

def ridge_fit(X, y, lam):
    """
    Ridge regression in closed form (intercept not penalised).
    Objective: ||yc - Xc w||^2 + lam * ||w||^2 on centred data.

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
      {
        id: '8',
        description: 'One-feature lasso is a soft-thresholded least-squares slope',
        input: '(lambda wb: (np.round(wb[0], 6).tolist(), round(wb[1], 6)))(lasso_fit(np.array([[1.0], [2.0], [3.0], [4.0]]), np.array([3.0, 5.0, 7.0, 9.0]), 0.5))',
        expected: '([1.6], 2.0)',
        hidden: true,
      },
    ],
    hints: [
      'Both problems become intercept-free after centring: fit w on Xc = X - x_mean and yc = y - y_mean, then b = y_mean - x_mean @ w.',
      'Ridge is one linear solve. Lasso optimises one weight at a time: with the others fixed, the 1D problem has a closed-form soft-threshold solution.',
      'Ridge: np.linalg.solve(Xc.T @ Xc + lam * np.eye(d), Xc.T @ yc). Lasso: rho_j = Xc[:, j] @ (r + Xc[:, j] * w[j]) / n, w_j = sign(rho_j) * max(|rho_j| - lam, 0) / z_j.',
      'After changing w[j], update the residual (r -= Xc[:, j] * (w_new - w_old)) before moving on; a stale residual turns cyclic coordinate descent into a different algorithm.',
    ],
    solution: `import numpy as np

def ridge_fit(X, y, lam):
    """
    Closed-form ridge on centred data. Returns (w of shape (d,), float b).
    """
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
    """
    Cyclic coordinate descent on (1/(2n))||yc - Xc w||^2 + lam ||w||_1.
    Returns (w of shape (d,), float b).
    """
    X, y = np.asarray(X, dtype=float), np.asarray(y, dtype=float)
    n, d = X.shape
    x_mean, y_mean = X.mean(axis=0), y.mean()
    Xc, yc = X - x_mean, y - y_mean

    w = np.zeros(d)
    z = (Xc ** 2).sum(axis=0) / n          # (1/n) ||x_j||^2
    r = yc.copy()                          # residual yc - Xc @ w
    for _ in range(n_sweeps):
        for j in range(d):
            if z[j] == 0:                  # constant feature: keep w_j = 0
                continue
            rho = Xc[:, j] @ (r + Xc[:, j] * w[j]) / n
            w_new = soft_threshold(rho, lam) / z[j]
            r -= Xc[:, j] * (w_new - w[j])   # keep the residual in sync
            w[j] = w_new

    b = float(y_mean - x_mean @ w)
    return w, b

# Ridge: O(n d^2 + d^3). Lasso: O(n_sweeps * n * d) time, O(n d) space.
`,
  },
  {
    id: 'gradient-boosting',
    title: 'Gradient Boosting with Stumps',
    section: 'supervised-learning',
    difficulty: 'hard',
    description: `
## Gradient Boosting with Stumps

Implement \`fit_stump\` (the best depth-1 regression tree) and \`gradient_boosting\` (a squared-loss booster that adds one shrunken stump per round).

### Background
Gradient boosting builds a strong model as a sum of weak ones: each new learner is fit to the **negative gradient** of the loss at the current predictions. For the squared loss \`L = 0.5 * (y - F)^2\` the negative gradient is simply the **residual** \`y - F\`. Boosted trees (XGBoost, LightGBM, sklearn's \`HistGradientBoosting\`) are still the go-to models for tabular data.

### 1. \`fit_stump(X, r)\`: best depth-1 tree
A stump splits on one feature \`j\` at a threshold \`t\`: samples with \`X[:, j] <= t\` go **left**, the others go **right**, and each side predicts the **mean** of \`r\` on that side.

Search exhaustively:
1. For each feature \`j = 0 .. d-1\`, take the sorted unique values \`u\` of \`X[:, j]\`. The candidate thresholds are the **midpoints** \`(u[:-1] + u[1:]) / 2\` (a feature with a single unique value has none).
2. Score each candidate by the sum of squared errors
\`\`\`text
SSE = sum_left (r - mean_left)^2 + sum_right (r - mean_right)^2
\`\`\`
3. Keep the smallest SSE. **Ties**: keep the first one found, scanning features in order and thresholds in ascending order (replace the best only on a strictly smaller SSE).
4. If there is no candidate at all, return \`(0, inf, mean(r), mean(r))\`.

### 2. \`gradient_boosting(X, y, n_rounds, learning_rate)\`
\`\`\`text
F_0 = mean(y)                          # constant initial prediction, shape (n,)
for m = 1 .. n_rounds:
    r   = y - F_{m-1}                   # residuals = negative gradient
    h_m = fit_stump(X, r)
    F_m = F_{m-1} + learning_rate * h_m(X)
    loss_m = mean((y - F_m)^2)          # training MSE after round m
\`\`\`
This matches \`sklearn.ensemble.GradientBoostingRegressor(loss='squared_error', max_depth=1, n_estimators=n_rounds, learning_rate=learning_rate)\`, whose \`train_score_\` is our \`'losses'\` (sklearn breaks exact ties between features at random, so tie cases may differ).

### Inputs
- \`X\`: float array \`(n, d)\`; \`y\` and \`r\`: float arrays \`(n,)\`
- \`n_rounds\`: int; \`learning_rate\`: float in \`(0, 1]\`

### Expected Return Format
\`fit_stump\` returns a tuple \`(feature, threshold, left_value, right_value)\`: an int and three floats.

\`gradient_boosting\` returns a dictionary with these keys:
- \`'f0'\`: the initial constant prediction (float)
- \`'stumps'\`: list of \`n_rounds\` tuples \`(feature, threshold, left_value, right_value)\`
- \`'predictions'\`: final training predictions \`F_M\`, shape \`(n,)\`
- \`'losses'\`: list of \`n_rounds\` floats, the training MSE after each round

### Edge Cases and Conventions
- Because each stump's leaf values are the least-squares fit to the residuals, the training loss is **non-increasing** for \`0 < learning_rate <= 1\`.
- A sample exactly on a threshold goes left (\`<=\`).

### Constraints
- NumPy only; no sklearn. Scoring all thresholds of one feature at once (with a \`(T, n)\` mask) is encouraged.

### Follow-up
- For log loss (classification), what are the residuals, and why do leaf values need a Newton step instead of a plain mean?
- Why does a smaller learning rate with more rounds usually generalise better?
    `,
    examples: [
      {
        input: 'fit_stump(np.array([[1], [2], [3], [4], [5], [6]]), np.array([-2., -2., -2., 2., 2., 2.]))',
        output: '(0, 3.5, -2.0, 2.0)',
        explanation: 'Splitting between 3 and 4 separates the residuals perfectly (SSE = 0).',
      },
      {
        input: 'gradient_boosting(np.array([[1], [2], [3], [4], [5], [6]]), np.array([1., 1., 1., 5., 5., 5.]), n_rounds=3, learning_rate=0.5)',
        output: "{'f0': 3.0, 'losses': [1.0, 0.25, 0.0625], ...}",
        explanation: 'Residuals start at ±2 (MSE 4); each round removes half of what is left: MSE 1, then 0.25, then 0.0625.',
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
        Left side is X[:, feature] <= threshold; ties keep the first
        (feature, threshold) found; no candidate -> (0, inf, mean(r), mean(r)).
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
        dict with 'f0' (float), 'stumps' (list of tuples),
        'predictions' (n,), 'losses' (list of n_rounds floats)
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
        description: 'Predictions and losses match sklearn GradientBoostingRegressor(max_depth=1)',
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
        expected: '[(1, 0.49), (1, 0.22), (2, 0.275), (1, 0.22)]',
        hidden: true,
      },
      {
        id: '8',
        description: 'Constant features: no candidate split',
        input: '(lambda s: (s[0], s[1] == float("inf"), s[2], s[3]))(fit_stump(np.array([[2.0, 7.0], [2.0, 7.0], [2.0, 7.0]]), np.array([1.0, 2.0, 6.0])))',
        expected: '(0, True, 3.0, 3.0)',
        hidden: true,
      },
    ],
    hints: [
      'Boosting is a loop of "fit a tiny tree to what the model still gets wrong, add a fraction of it". Get fit_stump right first; the loop is five lines.',
      'For one feature, the candidate thresholds are the midpoints between consecutive sorted unique values: u = np.unique(X[:, j]); (u[:-1] + u[1:]) / 2.',
      'Score all thresholds of a feature at once: with a boolean (T, n) mask left, SSE = sum(r^2) - s_l^2 / n_l - s_r^2 / n_r, where s and n are the sums and counts of each side. np.argmin returns the first minimum.',
      'Replace the best only on a strictly smaller SSE (so ties keep the earlier feature). In the loop, fit to residuals y - F (not to y), and scale every stump by learning_rate.',
    ],
    solution: `import numpy as np

def fit_stump(X, r):
    """
    Best depth-1 regression tree. Returns (feature, threshold, left_value, right_value).
    """
    X, r = np.asarray(X, dtype=float), np.asarray(r, dtype=float)
    best = (0, np.inf, float(r.mean()), float(r.mean()))
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
        if sse[k] < best_sse:                                # strict: ties keep earlier
            best_sse = sse[k]
            best = (j, float(thresholds[k]), float(s_l[k] / n_l[k]), float(s_r[k] / n_r[k]))
    return best


def stump_predict(stump, X):
    j, t, left, right = stump
    return np.where(X[:, j] <= t, left, right)


def gradient_boosting(X, y, n_rounds=10, learning_rate=0.1):
    """
    Squared-loss gradient boosting with stumps.
    Returns {'f0', 'stumps', 'predictions', 'losses'}.
    """
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

# fit_stump: O(d * n^2) with the (T, n) mask (O(d * n log n) with sorted prefix sums).
# Boosting: n_rounds times that.
`,
  },
  {
    id: 'decision-tree-bagging',
    title: 'Decision Tree Classifier with Bagging',
    section: 'supervised-learning',
    difficulty: 'hard',
    description: `
## Decision Tree Classifier with Bagging

Grow a full classification tree with recursive **Gini** splits (\`build_tree\`, \`predict_tree\`), then combine trees trained on **bootstrap samples** by **majority vote** (\`bagging_predict\`).

### Background
A single deep tree has low bias but high variance: small changes in the data change the tree. **Bagging** (bootstrap aggregating) averages many such trees to cut the variance; random forests add per-split feature subsampling on top. This problem uses the impurity from **Gini Impurity for Decision-Tree Splits**.

### Gini impurity
\`\`\`text
gini(S)          = 1 - sum_c p_c^2            # p_c = fraction of S with class c
split impurity   = (n_L * gini(L) + n_R * gini(R)) / n
\`\`\`

### Growing the tree (\`build_tree\`)
At a node holding samples \`S\` at depth \`depth\` (the root has depth 0):
1. The node is a **leaf** if \`max_depth\` is not None and \`depth >= max_depth\`, or \`len(S) < min_samples_split\`, or \`S\` is pure.
2. Otherwise search every feature \`f\` (in increasing order) and every threshold \`t\` (in increasing order), where the thresholds are the **midpoints between consecutive distinct sorted values** of feature \`f\` within \`S\`. A sample goes **left if \`x[f] <= t\`**, right otherwise.
3. Start with \`best = gini(S)\`. A candidate replaces the current best only if its split impurity is **lower by more than 1e-12**. So ties keep the earlier candidate (smaller feature index, then smaller threshold), and a split is made only if it strictly reduces impurity.
4. If no candidate qualified, the node is a leaf; otherwise recurse on both sides with \`depth + 1\`.

A leaf predicts the **majority class** of its samples; ties go to the smallest class label.

### Tree format
- Leaf: \`{'leaf': True, 'value': c}\` with \`c\` a Python int
- Internal node: \`{'leaf': False, 'feature': f, 'threshold': t, 'left': subtree, 'right': subtree}\` with \`f\` an int and \`t\` a float

### Bagging (\`bagging_predict\`)
1. Create \`rng = np.random.default_rng(seed)\` once.
2. For each of the \`n_estimators\` trees, in order: draw \`idx = rng.integers(0, n, size=n)\` (sampling with replacement), fit \`build_tree(X_train[idx], y_train[idx], max_depth, min_samples_split)\`, and predict \`X_test\`.
3. Each test sample gets the class with the most votes (**hard voting**); ties go to the smallest label.

### Inputs
- \`X\`, \`X_train\`, \`X_test\`: float arrays \`(n_samples, n_features)\`
- \`y\`, \`y_train\`: non-negative integer labels \`(n_samples,)\`
- \`max_depth\`: int or None; \`min_samples_split\`: int (default 2); \`n_estimators\`, \`seed\`: ints

### Expected Return Format
- \`build_tree(X, y, max_depth=None, min_samples_split=2)\`: the root node dict (format above)
- \`predict_tree(tree, X)\`: int array \`(n_samples,)\`
- \`bagging_predict(X_train, y_train, X_test, n_estimators=10, max_depth=None, min_samples_split=2, seed=0)\`: int array \`(n_test,)\`

### Conventions vs scikit-learn
- Same as \`DecisionTreeClassifier(criterion='gini')\`: midpoint thresholds, \`<=\` goes left, \`max_depth\` and \`min_samples_split\` mean the same. sklearn shuffles the features at each node, so it breaks exact ties at random (fixed by \`random_state\`); here ties are deterministic.
- \`BaggingClassifier\` averages the trees' predicted **probabilities** (soft voting) when it can; here you use hard majority voting.

### Constraints
- NumPy only; no sklearn.

### Follow-up
- What does a random forest change (\`max_features\`), and why does decorrelating the trees help more than adding trees?
- About 63.2% of the distinct samples land in each bootstrap sample. How can the remaining "out-of-bag" samples estimate test error for free?
`,
    examples: [
      {
        input: 'build_tree(np.array([[2.0, 3.0], [1.0, 1.0], [3.0, 1.0], [6.0, 5.0], [7.0, 7.0], [8.0, 6.0], [4.0, 4.0], [5.0, 2.0]]), np.array([0, 0, 0, 1, 1, 1, 0, 1]), max_depth=1)',
        output: "{'leaf': False, 'feature': 0, 'threshold': 4.5, 'left': {'leaf': True, 'value': 0}, 'right': {'leaf': True, 'value': 1}}",
        explanation: 'x0 <= 4.5 separates the classes perfectly, so its split impurity is 0.',
      },
      {
        input: 'predict_tree(tree, np.array([[0.0, 0.0], [4.5, 1.0], [4.5, 6.0], [9.0, 9.0]]))  # tree: same data, no max_depth',
        output: 'array([0, 0, 0, 1])',
        explanation: '(4.5, 6) has x0 equal to the threshold 4.5, so it goes left (x[f] <= t).',
      },
    ],
    starterCode: `import numpy as np

def build_tree(X, y, max_depth=None, min_samples_split=2):
    """
    Grow a classification tree with Gini splits.

    Args:
        X: Features, array (n_samples, n_features)
        y: Non-negative integer labels, array (n_samples,)
        max_depth: Maximum depth (root = depth 0), or None for no limit
        min_samples_split: Nodes with fewer samples become leaves

    Returns:
        Root node: {'leaf': True, 'value': c} or
        {'leaf': False, 'feature': f, 'threshold': t, 'left': ..., 'right': ...}
        (c and f Python ints, t a Python float)
    """
    # Your code here
    pass

def predict_tree(tree, X):
    """Return the predicted class for each row of X, as an int array (n_samples,)."""
    # Your code here
    pass

def bagging_predict(X_train, y_train, X_test, n_estimators=10, max_depth=None,
                    min_samples_split=2, seed=0):
    """
    Bagging: trees on bootstrap samples drawn with rng = np.random.default_rng(seed)
    (idx = rng.integers(0, n, size=n) per tree), combined by majority vote.

    Returns:
        Predicted classes for X_test, int array (n_test,) (vote ties -> smallest label)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Fully grown tree fits the training data',
        input: 'predict_tree(build_tree(np.array([[2.0, 3.0], [1.0, 1.0], [3.0, 1.0], [6.0, 5.0], [7.0, 7.0], [8.0, 6.0], [4.0, 4.0], [5.0, 2.0]]), np.array([0, 0, 0, 1, 1, 1, 0, 1])), np.array([[2.0, 3.0], [1.0, 1.0], [3.0, 1.0], [6.0, 5.0], [7.0, 7.0], [8.0, 6.0], [4.0, 4.0], [5.0, 2.0]])).tolist()',
        expected: '[0, 0, 0, 1, 1, 1, 0, 1]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Root split (feature, threshold)',
        input: '(lambda: (r := build_tree(np.array([[2.0, 3.0], [1.0, 1.0], [3.0, 1.0], [6.0, 5.0], [7.0, 7.0], [8.0, 6.0], [4.0, 4.0], [5.0, 2.0]]), np.array([0, 0, 0, 1, 1, 1, 0, 1])), (r["feature"], r["threshold"]))[-1])()',
        expected: '(0, 4.5)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Predictions on new points',
        input: 'predict_tree(build_tree(np.array([[2.0, 3.0], [1.0, 1.0], [3.0, 1.0], [6.0, 5.0], [7.0, 7.0], [8.0, 6.0], [4.0, 4.0], [5.0, 2.0]]), np.array([0, 0, 0, 1, 1, 1, 0, 1])), np.array([[0.0, 0.0], [4.5, 1.0], [4.5, 6.0], [9.0, 9.0]])).tolist()',
        expected: '[0, 0, 0, 1]',
        hidden: false,
      },
      {
        id: '4',
        description: 'XOR-like data: stump vs full tree',
        input: '(lambda: (predict_tree(build_tree(np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0], [0.0, 2.0], [2.0, 0.0], [2.0, 2.0]]), np.array([0, 1, 1, 0, 1, 1, 0]), max_depth=1), np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0], [0.0, 2.0], [2.0, 0.0], [2.0, 2.0]])).tolist(), predict_tree(build_tree(np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0], [0.0, 2.0], [2.0, 0.0], [2.0, 2.0]]), np.array([0, 1, 1, 0, 1, 1, 0])), np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0], [0.0, 2.0], [2.0, 0.0], [2.0, 2.0]])).tolist()))()',
        expected: '([1, 1, 0, 0, 1, 0, 0], [0, 1, 1, 0, 1, 1, 0])',
        hidden: true,
      },
      {
        id: '5',
        description: 'Equal impurity ties go to feature 0',
        input: '(lambda: (r := build_tree(np.array([[1.0, 1.0], [2.0, 2.0], [3.0, 3.0], [4.0, 4.0]]), np.array([0, 0, 1, 1])), (r["feature"], r["threshold"]))[-1])()',
        expected: '(0, 2.5)',
        hidden: true,
      },
      {
        id: '6',
        description: 'max_depth=0 is a majority leaf (ties to the smaller label)',
        input: 'build_tree(np.array([[1.0, 1.0], [2.0, 2.0], [3.0, 3.0], [4.0, 4.0]]), np.array([0, 0, 1, 1]), max_depth=0)',
        expected: "{'leaf': True, 'value': 0}",
        hidden: true,
      },
      {
        id: '7',
        description: 'min_samples_split stops splitting',
        input: 'predict_tree(build_tree(np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0], [0.0, 2.0], [2.0, 0.0], [2.0, 2.0]]), np.array([0, 1, 1, 0, 1, 1, 0]), min_samples_split=8), np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0], [0.0, 2.0], [2.0, 0.0], [2.0, 2.0]])).tolist()',
        expected: '[1, 1, 1, 1, 1, 1, 1]',
        hidden: true,
      },
      {
        id: '8',
        description: 'Depth-2 tree structure',
        input: 'build_tree(np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0], [0.0, 2.0], [2.0, 0.0], [2.0, 2.0]]), np.array([0, 1, 1, 0, 1, 1, 0]), max_depth=2)',
        expected: "{'leaf': False, 'feature': 0, 'threshold': 0.5, 'left': {'leaf': False, 'feature': 1, 'threshold': 0.5, 'left': {'leaf': True, 'value': 0}, 'right': {'leaf': True, 'value': 1}}, 'right': {'leaf': False, 'feature': 1, 'threshold': 0.5, 'left': {'leaf': True, 'value': 1}, 'right': {'leaf': True, 'value': 0}}}",
        hidden: true,
      },
      {
        id: '9',
        description: 'Bagging predictions on noisy data',
        input: '(lambda: (D := (lambda: (X := np.round(np.random.randn(40, 2) * 2, 1), y := ((X[:, 0] + X[:, 1] + np.random.randn(40)) > 0).astype(int), Xq := np.round(np.random.randn(12, 2) * 2, 1), (X, y, Xq))[-1])(), bagging_predict(D[0], D[1], D[2], n_estimators=7, max_depth=3, seed=0).tolist())[-1])()',
        expected: '[0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1]',
        hidden: true,
      },
      {
        id: '10',
        description: 'One bagged tree = a tree on the bootstrap sample',
        input: '(lambda: (D := (lambda: (X := np.round(np.random.randn(40, 2) * 2, 1), y := ((X[:, 0] + X[:, 1] + np.random.randn(40)) > 0).astype(int), Xq := np.round(np.random.randn(12, 2) * 2, 1), (X, y, Xq))[-1])(), idx := np.random.default_rng(3).integers(0, 40, size=40), bagging_predict(D[0], D[1], D[2], n_estimators=1, seed=3).tolist() == predict_tree(build_tree(D[0][idx], D[1][idx]), D[2]).tolist())[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Think recursively: a node either stops (leaf with the majority class) or picks the single best split and asks the same question of each half.',
      'Write a helper that scans every (feature, threshold) pair and keeps the best with `if imp < best - 1e-12`; starting best at the node\'s own Gini enforces "strictly reduces impurity". Thresholds: v = np.unique(X[:, f]); (v[:-1] + v[1:]) / 2.',
      '`np.bincount(y).argmax()` gives the majority class with ties broken towards the smallest label; the same idiom per column does the bagging vote.',
      'Create the generator once, outside the loop over trees (re-seeding per tree gives identical bootstrap samples). Cast feature and label to Python int and threshold to float so the tree prints as expected.',
    ],
    solution: `import numpy as np

def _gini(y):
    p = np.bincount(y) / len(y)
    return 1.0 - np.sum(p ** 2)

def _best_split(X, y):
    """Return (feature, threshold) of the best impurity-reducing split, or (None, None)."""
    n, n_features = X.shape
    best_imp, best_f, best_t = _gini(y), None, None
    for f in range(n_features):
        values = np.unique(X[:, f])                 # sorted distinct values
        for t in (values[:-1] + values[1:]) / 2:    # midpoints, ascending
            left = X[:, f] <= t
            imp = (left.sum() * _gini(y[left]) + (~left).sum() * _gini(y[~left])) / n
            if imp < best_imp - 1e-12:              # strict improvement; ties keep earlier
                best_imp, best_f, best_t = imp, f, t
    return best_f, best_t

def build_tree(X, y, max_depth=None, min_samples_split=2):
    X = np.asarray(X, dtype=float)
    y = np.asarray(y).astype(int)

    def grow(idx, depth):
        ys = y[idx]
        leaf = {'leaf': True, 'value': int(np.bincount(ys).argmax())}
        too_deep = max_depth is not None and depth >= max_depth
        if too_deep or len(idx) < min_samples_split or _gini(ys) == 0:
            return leaf
        f, t = _best_split(X[idx], ys)
        if f is None:
            return leaf
        go_left = X[idx, f] <= t
        return {'leaf': False, 'feature': int(f), 'threshold': float(t),
                'left': grow(idx[go_left], depth + 1),
                'right': grow(idx[~go_left], depth + 1)}

    return grow(np.arange(len(y)), 0)

def predict_tree(tree, X):
    X = np.asarray(X, dtype=float)
    out = []
    for x in X:
        node = tree
        while not node['leaf']:
            node = node['left'] if x[node['feature']] <= node['threshold'] else node['right']
        out.append(node['value'])
    return np.array(out, dtype=int)

def bagging_predict(X_train, y_train, X_test, n_estimators=10, max_depth=None,
                    min_samples_split=2, seed=0):
    X_train = np.asarray(X_train, dtype=float)
    y_train = np.asarray(y_train).astype(int)
    rng = np.random.default_rng(seed)               # one generator for all trees
    n = len(y_train)
    votes = []
    for _ in range(n_estimators):
        idx = rng.integers(0, n, size=n)            # bootstrap sample
        tree = build_tree(X_train[idx], y_train[idx], max_depth, min_samples_split)
        votes.append(predict_tree(tree, X_test))
    votes = np.array(votes)  # (n_estimators, n_test)
    n_classes = int(y_train.max()) + 1
    return np.array([np.bincount(votes[:, j], minlength=n_classes).argmax()
                     for j in range(votes.shape[1])], dtype=int)

# One split search costs O(d * n^2) here (O(d * n log n) with sorting and prefix counts);
# a tree is O(depth) levels of that, and bagging multiplies by n_estimators.
`,
  },
];
