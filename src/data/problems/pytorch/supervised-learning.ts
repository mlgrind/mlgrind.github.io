import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../supervised-learning.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const supervisedLearningPyTorch: Record<string, LanguageVariant> = {
  'logistic-regression': {
    note: "Implement it with torch.exp; don't call torch.sigmoid or F.sigmoid.",
    starterCode: `import torch

def sigmoid(x: torch.Tensor) -> torch.Tensor:
    """
    Compute the sigmoid activation function.

    Args:
        x: Float tensor of any shape

    Returns:
        Tensor of same shape with sigmoid applied element-wise
    """
    # Your code here
    pass
`,
    solution: `import torch

def sigmoid(x: torch.Tensor) -> torch.Tensor:
    """
    Compute the sigmoid activation function.
    """
    return 1 / (1 + torch.exp(-x))
`,
    testCases: [
      {
        id: '1',
        description: 'Zero input',
        input: 'sigmoid(torch.tensor([0.0]))',
        expected: '[0.5]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Positive and negative',
        input: 'bool(torch.allclose(sigmoid(torch.tensor([-1.0, 0.0, 1.0])), torch.tensor([0.268941, 0.5, 0.731059]), atol=1e-5))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Large values',
        input: 'bool(torch.allclose(sigmoid(torch.tensor([-10.0, 10.0])), torch.tensor([4.5e-05, 0.999955]), atol=1e-5))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Matches torch.sigmoid on a 2D input',
        input: '(lambda x: bool(torch.allclose(sigmoid(x), torch.sigmoid(x), atol=1e-6)))(torch.randn(3, 4))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Use torch.exp() for the exponential function.',
      'The formula is 1 / (1 + exp(-x)); it broadcasts over any shape.',
    ],
  },

  'binary-cross-entropy': {
    note: 'Implement the formula with tensor ops (F.binary_cross_entropy is the built-in). In float32, 1 - 1e-15 rounds to 1.0, so clamp with eps = 1e-7.',
    starterCode: `import torch

def binary_cross_entropy(y_true, y_pred):
    """
    Compute binary cross-entropy loss.

    Args:
        y_true: True labels (0 or 1), tensor
        y_pred: Predicted probabilities, tensor

    Returns:
        loss: Scalar BCE loss (Python float rounded to 4 decimals)
    """
    # Your code here
    pass
`,
    solution: `import torch

def binary_cross_entropy(y_true, y_pred):
    y_true = y_true.float()
    eps = 1e-7  # 1e-15 is below float32 resolution near 1.0

    # Clamp for numerical stability
    y_pred = torch.clamp(y_pred, eps, 1 - eps)

    # BCE formula
    loss = -torch.mean(y_true * torch.log(y_pred) + (1 - y_true) * torch.log(1 - y_pred))

    return round(loss.item(), 4)
`,
    testCases: [
      {
        id: '1',
        description: 'Perfect predictions',
        input: 'binary_cross_entropy(torch.tensor([1.0, 0.0, 1.0, 0.0]), torch.tensor([1.0, 0.0, 1.0, 0.0]))',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'Typical case',
        input: 'binary_cross_entropy(torch.tensor([1.0, 0.0, 1.0]), torch.tensor([0.9, 0.1, 0.8]))',
        expected: '0.1446',
        hidden: false,
      },
      {
        id: '3',
        description: 'Less confident predictions',
        input: 'binary_cross_entropy(torch.tensor([1.0, 1.0, 0.0]), torch.tensor([0.7, 0.5, 0.2]))',
        expected: '0.4243',
        hidden: true,
      },
      {
        id: '4',
        description: 'Integer labels',
        input: 'binary_cross_entropy(torch.tensor([0, 1]), torch.tensor([0.25, 0.75]))',
        expected: '0.2877',
        hidden: true,
      },
    ],
    hints: [
      'Clamp predictions with torch.clamp(y_pred, eps, 1 - eps)',
      'Apply the formula element-wise with torch.log',
      'Take the mean, then .item() and round to 4 decimals',
    ],
  },

  'hinge-loss': {
    note: 'Use tensor ops: torch.clamp(..., min=0) is max(0, ...).',
    starterCode: `import torch

def hinge_loss(y_true, scores):
    """
    Compute the mean hinge loss.

    Args:
        y_true: True labels in {-1, +1}, tensor of shape (n,)
        scores: Raw model scores, tensor of shape (n,)

    Returns:
        Mean hinge loss (float, rounded to 4 decimals)
    """
    # Your code here
    pass
`,
    solution: `import torch

def hinge_loss(y_true, scores):
    """
    Compute the mean hinge loss.
    """
    # max(0, 1 - y * s) for every sample
    losses = torch.clamp(1 - y_true * scores, min=0)

    return round(losses.mean().item(), 4)
`,
    testCases: [
      {
        id: '1',
        description: 'Perfect predictions with large margin',
        input: 'hinge_loss(torch.tensor([1.0, -1.0]), torch.tensor([2.0, -3.0]))',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'Partial margin violations',
        input: 'hinge_loss(torch.tensor([1.0, -1.0, 1.0]), torch.tensor([0.5, -0.8, 1.5]))',
        expected: '0.2333',
        hidden: false,
      },
      {
        id: '3',
        description: 'All misclassified',
        input: 'hinge_loss(torch.tensor([1.0, 1.0]), torch.tensor([-1.0, -2.0]))',
        expected: '2.5',
        hidden: false,
      },
      {
        id: '4',
        description: 'On the decision boundary (margin = 1)',
        input: 'hinge_loss(torch.tensor([1.0, -1.0]), torch.tensor([1.0, -1.0]))',
        expected: '0.0',
        hidden: true,
      },
      {
        id: '5',
        description: 'Integer labels',
        input: 'hinge_loss(torch.tensor([1, -1, -1, 1]), torch.tensor([0.25, 0.5, -2.0, 3.0]))',
        expected: '0.5625',
        hidden: true,
      },
    ],
    hints: [
      'Compute element-wise margins: y_true * scores',
      'Apply max(0, 1 - margin) using torch.clamp(..., min=0)',
      'Return the mean of the losses with .item(), rounded to 4 decimals',
    ],
  },

  'decision-tree-split': {
    note: 'torch.bincount counts each integer label in one call (classes that never appear count 0 and add nothing to the sum).',
    starterCode: `import torch

def gini_impurity(labels: torch.Tensor) -> float:
    """
    Calculate Gini impurity for a set of labels.

    Args:
        labels: 1D int64 tensor of class labels (non-negative integers)

    Returns:
        Gini impurity value between 0 and 1 (Python float)
    """
    # Your code here
    pass
`,
    solution: `import torch

def gini_impurity(labels: torch.Tensor) -> float:
    """
    Calculate Gini impurity for a set of labels.
    """
    if labels.numel() == 0:
        return 0.0

    # Count occurrences of each class
    counts = torch.bincount(labels)

    # Class probabilities
    probabilities = counts.float() / labels.numel()

    # Gini = 1 - sum(p^2)
    return (1 - (probabilities ** 2).sum()).item()
`,
    testCases: [
      {
        id: '1',
        description: 'Pure node',
        input: 'gini_impurity(torch.tensor([0, 0, 0, 0]))',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'Maximum impurity',
        input: 'gini_impurity(torch.tensor([0, 0, 1, 1]))',
        expected: '0.5',
        hidden: false,
      },
      {
        id: '3',
        description: 'Unequal split',
        input: 'gini_impurity(torch.tensor([0, 0, 0, 1]))',
        expected: '0.375',
        hidden: true,
      },
      {
        id: '4',
        description: 'Three classes',
        input: 'gini_impurity(torch.tensor([2, 0, 1, 2]))',
        expected: '0.625',
        hidden: true,
      },
    ],
    hints: [
      'torch.bincount(labels) counts each class.',
      'Divide by labels.numel() to get proportions (convert to float first).',
      'Gini = 1 - sum of squared probabilities; return it with .item().',
    ],
  },

  'linear-regression-gd': {
    note: 'Let autograd compute dw and db: build the MSE loss, call loss.backward(), update under torch.no_grad(), then zero the gradients.',
    starterCode: `import torch

def linear_regression(X: torch.Tensor, y: torch.Tensor,
                      learning_rate: float = 0.01,
                      iterations: int = 1000) -> tuple:
    """
    Train a simple linear regression model using gradient descent.

    Args:
        X: Input features (1D float tensor)
        y: Target values (1D float tensor)
        learning_rate: Step size for gradient descent
        iterations: Number of training iterations

    Returns:
        Tuple of (weight, bias) as Python floats rounded to 2 decimals
    """
    # Initialize parameters (autograd tracks them)
    w = torch.tensor(0.0, requires_grad=True)
    b = torch.tensor(0.0, requires_grad=True)

    # Your gradient descent implementation here
    pass

    return (round(w.item(), 2), round(b.item(), 2))
`,
    solution: `import torch

def linear_regression(X: torch.Tensor, y: torch.Tensor,
                      learning_rate: float = 0.01,
                      iterations: int = 1000) -> tuple:
    """
    Train a simple linear regression model using gradient descent.
    """
    w = torch.tensor(0.0, requires_grad=True)
    b = torch.tensor(0.0, requires_grad=True)

    for _ in range(iterations):
        # Forward pass and MSE loss
        y_pred = w * X + b
        loss = ((y_pred - y) ** 2).mean()

        # Backward pass: w.grad = (2/n) * sum((y_pred - y) * X), b.grad = (2/n) * sum(y_pred - y)
        loss.backward()

        # Update parameters without recording the update in the graph
        with torch.no_grad():
            w -= learning_rate * w.grad
            b -= learning_rate * b.grad
            w.grad.zero_()
            b.grad.zero_()

    return (round(w.item(), 2), round(b.item(), 2))
`,
    testCases: [
      {
        id: '1',
        description: 'Perfect linear relationship',
        input: 'linear_regression(torch.tensor([1.0, 2.0, 3.0, 4.0]), torch.tensor([2.0, 4.0, 6.0, 8.0]), 0.1, 1000)',
        expected: '(2.0, 0.0)',
        hidden: false,
      },
      {
        id: '2',
        description: 'With intercept',
        input: 'linear_regression(torch.tensor([1.0, 2.0, 3.0, 4.0]), torch.tensor([3.0, 5.0, 7.0, 9.0]), 0.1, 1000)',
        expected: '(2.0, 1.0)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Different slope',
        input: 'linear_regression(torch.tensor([0.0, 1.0, 2.0, 3.0]), torch.tensor([1.0, 4.0, 7.0, 10.0]), 0.1, 1000)',
        expected: '(3.0, 1.0)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Noisy data converges to the least-squares fit',
        input: 'linear_regression(torch.tensor([0.0, 1.0, 2.0, 3.0, 4.0]), torch.tensor([1.1, 2.9, 5.2, 7.1, 8.8]), 0.05, 2000)',
        expected: '(1.96, 1.1)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Few iterations (checks the update rule, not just the optimum)',
        input: 'linear_regression(torch.tensor([1.0, 2.0, 3.0, 4.0]), torch.tensor([2.0, 4.0, 6.0, 8.0]), 0.01, 10)',
        expected: '(1.51, 0.49)',
        hidden: true,
      },
    ],
    hints: [
      'Forward: y_pred = w * X + b, loss = ((y_pred - y) ** 2).mean()',
      'loss.backward() fills w.grad and b.grad',
      'Inside torch.no_grad(): w -= learning_rate * w.grad, then w.grad.zero_() (gradients accumulate otherwise)',
    ],
  },

  'logistic-regression-full': {
    note: 'Let autograd compute the gradients of the mean BCE loss (F.binary_cross_entropy_with_logits is fine for the loss); update under torch.no_grad().',
    starterCode: `import torch
import torch.nn.functional as F

def logistic_regression(X, y, learning_rate=0.1, iterations=1000):
    """
    Train logistic regression using gradient descent.

    Args:
        X: Float features (m samples, n features)
        y: Binary float labels (m,)
        learning_rate: Step size
        iterations: Number of iterations

    Returns:
        w: Learned weights (n,), rounded to 4 decimals
        b: Learned bias (Python float), rounded to 4 decimals
    """
    m, n = X.shape
    w = torch.zeros(n, requires_grad=True)
    b = torch.tensor(0.0, requires_grad=True)

    # Your code here
    pass

    return torch.round(w.detach(), decimals=4), round(b.item(), 4)
`,
    solution: `import torch
import torch.nn.functional as F

def logistic_regression(X, y, learning_rate=0.1, iterations=1000):
    m, n = X.shape
    w = torch.zeros(n, requires_grad=True)
    b = torch.tensor(0.0, requires_grad=True)

    for _ in range(iterations):
        # Forward pass: logits, then mean binary cross-entropy
        z = X @ w + b
        loss = F.binary_cross_entropy_with_logits(z, y)

        # Backward: w.grad = (1/m) X^T (sigmoid(z) - y), b.grad = mean(sigmoid(z) - y)
        loss.backward()

        # Update parameters
        with torch.no_grad():
            w -= learning_rate * w.grad
            b -= learning_rate * b.grad
            w.grad.zero_()
            b.grad.zero_()

    return torch.round(w.detach(), decimals=4), round(b.item(), 4)
`,
    testCases: [
      {
        id: '1',
        description: 'Simple separable data (AND)',
        input: '(lambda r: bool(torch.allclose(r[0], torch.tensor([6.0141, 6.0141]), atol=1e-3) and abs(r[1] - (-9.1984)) < 1e-3))(logistic_regression(torch.tensor([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]]), torch.tensor([0.0, 0.0, 0.0, 1.0]), 0.5, 1000))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'OR data',
        input: '(lambda r: bool(torch.allclose(r[0], torch.tensor([7.2375, 7.2375]), atol=1e-3) and abs(r[1] - (-3.1461)) < 1e-3))(logistic_regression(torch.tensor([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]]), torch.tensor([0.0, 1.0, 1.0, 1.0]), 0.5, 1000))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '3',
        description: 'Two clusters, fewer iterations',
        input: '(lambda r: bool(torch.allclose(r[0], torch.tensor([0.988, 0.0689]), atol=1e-3) and abs(r[1] - (-4.2202)) < 1e-3))(logistic_regression(torch.tensor([[1.0, 2.0], [2.0, 1.0], [3.0, 3.0], [6.0, 5.0], [7.0, 8.0], [8.0, 6.0]]), torch.tensor([0.0, 0.0, 0.0, 1.0, 1.0, 1.0]), 0.1, 500))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Forward: z = X @ w + b; loss = F.binary_cross_entropy_with_logits(z, y) (mean over samples)',
      'loss.backward() gives exactly dw = (1/m) X^T (y_pred - y) and db = mean(y_pred - y)',
      'Update inside torch.no_grad(), then zero w.grad and b.grad',
    ],
  },

  'linear-svm': {
    note: 'Write the objective (λ/2)·||w||² + mean(relu(1 - margins)) and let autograd differentiate it. torch.relu has gradient 0 at the hinge (margin exactly 1), matching the strict margin < 1 rule.',
    starterCode: `import torch

def linear_svm(X, y, learning_rate=0.01, lambda_param=0.01, iterations=1000):
    """
    Train a linear SVM using gradient descent on hinge loss + L2 regularization.

    Args:
        X: Float features (m samples, n features)
        y: Float labels in {-1, +1}, shape (m,)
        learning_rate: Step size for gradient descent
        lambda_param: L2 regularization strength
        iterations: Number of training iterations

    Returns:
        w: Learned weights (n,), rounded to 4 decimals
        b: Learned bias (Python float), rounded to 4 decimals
    """
    m, n = X.shape
    w = torch.zeros(n, requires_grad=True)
    b = torch.tensor(0.0, requires_grad=True)

    # Your gradient descent implementation here
    pass

    return torch.round(w.detach(), decimals=4), round(b.item(), 4)
`,
    solution: `import torch

def linear_svm(X, y, learning_rate=0.01, lambda_param=0.01, iterations=1000):
    """
    Train a linear SVM using gradient descent on hinge loss + L2 regularization.
    """
    m, n = X.shape
    w = torch.zeros(n, requires_grad=True)
    b = torch.tensor(0.0, requires_grad=True)

    for _ in range(iterations):
        # Margins and objective
        margins = y * (X @ w + b)
        loss = lambda_param / 2 * (w ** 2).sum() + torch.relu(1 - margins).mean()

        # Autograd: only samples with margin < 1 contribute to the hinge gradient
        loss.backward()

        with torch.no_grad():
            w -= learning_rate * w.grad
            b -= learning_rate * b.grad
            w.grad.zero_()
            b.grad.zero_()

    return torch.round(w.detach(), decimals=4), round(b.item(), 4)
`,
    testCases: [
      {
        id: '1',
        description: 'Correctly classifies separable 2D data',
        input: `(lambda: (
    X := torch.tensor([[2.0, 1.0], [3.0, 2.0], [1.0, 3.0], [-2.0, -1.0], [-3.0, -2.0], [-1.0, -3.0]]),
    y := torch.tensor([1.0, 1.0, 1.0, -1.0, -1.0, -1.0]),
    result := linear_svm(X, y, 0.01, 0.01, 1000),
    preds := torch.sign(X @ result[0] + result[1]),
    bool(torch.equal(preds, y))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Correctly classifies 1D data',
        input: `(lambda: (
    X := torch.tensor([[3.0], [4.0], [5.0], [-3.0], [-4.0], [-5.0]]),
    y := torch.tensor([1.0, 1.0, 1.0, -1.0, -1.0, -1.0]),
    result := linear_svm(X, y, 0.01, 0.01, 1000),
    preds := torch.sign(X @ result[0] + result[1]),
    bool(torch.equal(preds, y))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Weight vector has correct sign',
        input: `(lambda: (
    X := torch.tensor([[1.0], [-1.0]]),
    y := torch.tensor([1.0, -1.0]),
    result := linear_svm(X, y, 0.1, 0.01, 500),
    bool(result[0][0] > 0)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Learned weights and bias match gradient descent',
        input: `(lambda: (
    X := torch.tensor([[2.0, 0.5], [1.0, 1.5], [-1.0, -0.5], [-0.5, -2.0]]),
    y := torch.tensor([1.0, 1.0, -1.0, -1.0]),
    result := linear_svm(X, y, 0.05, 0.1, 200),
    bool(torch.allclose(result[0], torch.tensor([0.5321, 0.4822]), atol=1e-3) and abs(result[1] - (-0.2375)) < 1e-3)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'margins = y * (X @ w + b)',
      'loss = lambda_param / 2 * (w ** 2).sum() + torch.relu(1 - margins).mean()',
      'loss.backward(), then update w and b inside torch.no_grad() and zero their gradients',
    ],
  },
};
