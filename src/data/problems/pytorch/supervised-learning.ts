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
  // Ported with the new problems from the ML Coding Lab fork.
  'knn-classifier': {
    note: 'Use torch.cdist or broadcasting for the distances, torch.argsort(..., stable=True) for the neighbour order and torch.bincount for the vote.',
    starterCode: `import torch

def knn_predict(X_train, y_train, X_test, k=3):
    """
    k-nearest neighbours classification with Euclidean distance.

    Args:
        X_train: Float tensor of training features, shape (n, d)
        y_train: int64 tensor of non-negative labels, shape (n,)
        X_test: Float tensor of query points, shape (m, d)
        k: Number of neighbours

    Returns:
        int64 tensor of predicted labels, shape (m,)
        (distance ties -> smaller training index first;
         vote ties -> smallest label)
    """
    # Your code here
    pass
`,
    solution: `import torch

def knn_predict(X_train, y_train, X_test, k=3):
    X_train, X_test = X_train.float(), X_test.float()
    n_classes = int(y_train.max()) + 1

    # Pairwise Euclidean distances, (m, n)
    D = ((X_test.unsqueeze(1) - X_train.unsqueeze(0)) ** 2).sum(dim=-1).sqrt()

    # Stable sort: equal distances keep training order
    nearest = torch.argsort(D, dim=1, stable=True)[:, :k]    # (m, k)

    preds = []
    for idx in nearest:
        votes = torch.bincount(y_train[idx], minlength=n_classes)
        preds.append(int(torch.argmax(votes)))   # first (smallest) label on ties
    return torch.tensor(preds, dtype=torch.int64)
`,
    testCases: [
      {
        id: '1',
        description: 'Two well-separated clusters',
        input: 'knn_predict(torch.tensor([[0.0, 0.0], [1.0, 0.0], [0.0, 1.0], [5.0, 5.0], [6.0, 5.0]]), torch.tensor([0, 0, 0, 1, 1]), torch.tensor([[0.5, 0.5], [5.5, 5.0]]), 3).tolist()',
        expected: '[0, 1]',
        hidden: false,
      },
      {
        id: '2',
        description: 'k=1 returns the label of the nearest point',
        input: 'knn_predict(torch.tensor([[0.0], [3.0], [10.0]]), torch.tensor([2, 0, 1]), torch.tensor([[1.0], [2.0], [7.0], [100.0]]), 1).tolist()',
        expected: '[2, 0, 1, 1]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Vote tie goes to the smallest label',
        input: 'knn_predict(torch.tensor([[0.0], [2.0]]), torch.tensor([1, 0]), torch.tensor([[1.0]]), 2).tolist()',
        expected: '[0]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Distance tie: the smaller training index is taken first',
        input: 'knn_predict(torch.tensor([[-1.0], [1.0], [3.0]]), torch.tensor([2, 1, 1]), torch.tensor([[0.0]]), 1).tolist()',
        expected: '[2]',
        hidden: true,
      },
      {
        id: '5',
        description: 'k = n_train predicts the overall majority',
        input: 'knn_predict(torch.tensor([[0.0, 0.0], [9.0, 9.0], [9.0, 8.0], [8.0, 9.0]]), torch.tensor([0, 1, 1, 1]), torch.tensor([[0.0, 0.0], [0.1, 0.1]]), 4).tolist()',
        expected: '[1, 1]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Matches a brute-force reference on random 3-class data',
        input: `(lambda: (
    Xtr := torch.randn(40, 3),
    ytr := torch.randint(0, 3, (40,)),
    Xte := torch.randn(15, 3),
    ref := [int(torch.bincount(ytr[torch.argsort((Xtr - q).norm(dim=1), stable=True)[:5]], minlength=3).argmax()) for q in Xte],
    knn_predict(Xtr, ytr, Xte, 5).tolist() == ref
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      '(X_test.unsqueeze(1) - X_train.unsqueeze(0)) has shape (m, n, d); square, sum over dim=-1, sqrt.',
      'torch.argsort(D, dim=1, stable=True)[:, :k] keeps training order for equal distances.',
      'torch.bincount(labels, minlength=n_classes).argmax() picks the smallest label among tied counts.',
    ],
  },
  'naive-bayes': {
    note: 'Compute in log space and normalize with torch.logsumexp (or F.log_softmax). Return tensors.',
    starterCode: `import math
import torch

def gaussian_nb_fit(X, y, var_smoothing=1e-9):
    """
    Fit Gaussian Naive Bayes.

    Args:
        X: Float tensor of features, shape (n, d)
        y: int64 tensor of class labels, shape (n,)
        var_smoothing: Fraction of the largest feature variance added to all variances

    Returns:
        dict of tensors: 'classes' (C,), 'priors' (C,), 'means' (C, d), 'vars' (C, d)
    """
    # Your code here
    pass


def gaussian_nb_predict_proba(model, X):
    """
    Posterior class probabilities, computed in log space.

    Args:
        model: dict returned by gaussian_nb_fit
        X: Float tensor of features, shape (m, d)

    Returns:
        Tensor of probabilities, shape (m, C); rows sum to 1
    """
    # Your code here
    pass
`,
    solution: `import math
import torch

def gaussian_nb_fit(X, y, var_smoothing=1e-9):
    X = X.float()
    classes = torch.unique(y)
    epsilon = var_smoothing * X.var(dim=0, unbiased=False).max()

    priors = torch.stack([(y == c).float().mean() for c in classes])
    means = torch.stack([X[y == c].mean(dim=0) for c in classes])
    variances = torch.stack([X[y == c].var(dim=0, unbiased=False) for c in classes]) + epsilon
    return {'classes': classes, 'priors': priors, 'means': means, 'vars': variances}


def gaussian_nb_predict_proba(model, X):
    X = X.float()
    means, variances = model['means'], model['vars']           # (C, d)

    log_norm = -0.5 * torch.log(2 * math.pi * variances).sum(dim=1)                   # (C,)
    sq = ((X.unsqueeze(1) - means.unsqueeze(0)) ** 2 / variances.unsqueeze(0)).sum(-1)  # (m, C)
    jll = torch.log(model['priors']) + log_norm - 0.5 * sq

    return torch.exp(jll - torch.logsumexp(jll, dim=1, keepdim=True))
`,
    testCases: [
      {
        id: '1',
        description: 'Priors and means',
        input: '(lambda m: (np.round(m["priors"].numpy(), 6).tolist(), np.round(m["means"].numpy(), 6).tolist()))(gaussian_nb_fit(torch.tensor([[1.0], [2.0], [3.0], [6.0], [7.0], [8.0]]), torch.tensor([0, 0, 0, 1, 1, 1])))',
        expected: '([0.5, 0.5], [[2.0], [7.0]])',
        hidden: false,
      },
      {
        id: '2',
        description: 'Midpoint between symmetric classes is 50/50',
        input: 'bool(torch.allclose(gaussian_nb_predict_proba(gaussian_nb_fit(torch.tensor([[1.0], [2.0], [3.0], [6.0], [7.0], [8.0]]), torch.tensor([0, 0, 0, 1, 1, 1])), torch.tensor([[4.5]])), torch.tensor([[0.5, 0.5]]), atol=1e-5))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Rows sum to 1, shape (m, C)',
        input: '(lambda X, y: (lambda P: (tuple(P.shape), bool(torch.allclose(P.sum(1), torch.ones(20), atol=1e-5))))(gaussian_nb_predict_proba(gaussian_nb_fit(X, y), X)))(torch.randn(20, 3), torch.arange(20) % 4)',
        expected: '((20, 4), True)',
        hidden: false,
      },
      {
        id: '4',
        description: 'var_smoothing adds epsilon = s * max feature variance',
        input: 'bool(torch.allclose(gaussian_nb_fit(torch.tensor([[0.0, 1.0], [0.0, 3.0], [2.0, 5.0], [2.0, 9.0]]), torch.tensor([0, 0, 1, 1]), var_smoothing=0.1)["vars"], torch.tensor([[0.875, 1.875], [0.875, 4.875]]), atol=1e-5))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Posteriors match scikit-learn GaussianNB',
        input: 'bool(torch.allclose(gaussian_nb_predict_proba(gaussian_nb_fit(torch.tensor([[1.0, 2.0], [2.0, 3.0], [3.0, 3.0], [2.0, 1.0], [4.0, 5.0], [5.0, 4.0], [6.0, 6.0], [4.0, 3.0], [7.0, 2.0], [6.0, 1.0], [8.0, 3.0], [5.0, 2.0]]), torch.tensor([0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2])), torch.tensor([[3.0, 3.0], [5.0, 3.5], [6.0, 2.0], [4.0, 4.0]])), torch.tensor([[0.891447, 0.101141, 0.007411], [9.1e-05, 0.927174, 0.072735], [0.0, 0.024231, 0.975769], [0.005153, 0.991937, 0.002909]]), atol=1e-4))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Log-space: far-away points still give valid probabilities',
        input: '(lambda P: bool(torch.isfinite(P).all() and torch.allclose(P, torch.tensor([[1.0, 0.0], [0.0, 1.0]]), atol=1e-6)))(gaussian_nb_predict_proba(gaussian_nb_fit(torch.tensor([[0.0], [1.0], [10.0], [11.0]]), torch.tensor([0, 0, 1, 1])), torch.tensor([[-500.0], [600.0]])))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'X[y == c].mean(dim=0) and X[y == c].var(dim=0, unbiased=False) per class; torch.stack the results.',
      'epsilon = var_smoothing * X.var(dim=0, unbiased=False).max()',
      'jll - torch.logsumexp(jll, dim=1, keepdim=True) is the log posterior.',
    ],
  },
  'ridge-lasso': {
    note: 'Ridge: torch.linalg.solve. Lasso: loop over coordinates with tensor ops; torch.sign(a) * torch.clamp(a.abs() - lam, min=0) is the soft-threshold.',
    starterCode: `import torch

def ridge_fit(X, y, lam):
    """
    Ridge regression in closed form (intercept not penalised).

    Args:
        X: Float tensor of features, shape (n, d)
        y: Float tensor of targets, shape (n,)
        lam: L2 penalty strength

    Returns:
        (w, b): weight tensor of shape (d,) and float intercept
    """
    # Your code here
    pass


def lasso_fit(X, y, lam, n_sweeps=100):
    """
    Lasso regression by cyclic coordinate descent with soft-thresholding.
    Objective: (1/(2n)) * ||y - Xw - b||^2 + lam * ||w||_1

    Args:
        X: Float tensor of features, shape (n, d)
        y: Float tensor of targets, shape (n,)
        lam: L1 penalty strength
        n_sweeps: Number of full passes over the coordinates

    Returns:
        (w, b): weight tensor of shape (d,) and float intercept
    """
    # Your code here
    pass
`,
    solution: `import torch

def ridge_fit(X, y, lam):
    x_mean, y_mean = X.mean(dim=0), y.mean()
    Xc, yc = X - x_mean, y - y_mean

    d = X.shape[1]
    w = torch.linalg.solve(Xc.T @ Xc + lam * torch.eye(d), Xc.T @ yc)
    b = (y_mean - x_mean @ w).item()
    return w, b


def soft_threshold(a, lam):
    return torch.sign(a) * torch.clamp(a.abs() - lam, min=0.0)


def lasso_fit(X, y, lam, n_sweeps=100):
    n, d = X.shape
    x_mean, y_mean = X.mean(dim=0), y.mean()
    Xc, yc = X - x_mean, y - y_mean

    w = torch.zeros(d)
    z = (Xc ** 2).sum(dim=0) / n
    r = yc.clone()
    for _ in range(n_sweeps):
        for j in range(d):
            if z[j] == 0:
                continue
            xj = Xc[:, j]
            rho = xj @ (r + xj * w[j]) / n
            w_new = soft_threshold(rho, lam) / z[j]
            r = r - xj * (w_new - w[j])
            w[j] = w_new

    b = (y_mean - x_mean @ w).item()
    return w, b
`,
    testCases: [
      {
        id: '1',
        description: 'Ridge with lam=0 is least squares',
        input: '(lambda wb: bool(torch.allclose(wb[0], torch.tensor([2.0]), atol=1e-4) and abs(wb[1] - 1.0) < 1e-4))(ridge_fit(torch.tensor([[1.0], [2.0], [3.0], [4.0]]), torch.tensor([3.0, 5.0, 7.0, 9.0]), 0.0))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Ridge shrinks the slope; intercept is not penalised',
        input: '(lambda wb: bool(torch.allclose(wb[0], torch.tensor([1.0]), atol=1e-4) and abs(wb[1] - 3.5) < 1e-4))(ridge_fit(torch.tensor([[1.0], [2.0], [3.0], [4.0]]), torch.tensor([3.0, 5.0, 7.0, 9.0]), 5.0))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Lasso zeroes the noise features exactly',
        input: `(lambda: (
    X := torch.randn(40, 5),
    y := 3 * X[:, 0] - 2 * X[:, 1] + 0.1 * torch.randn(40) + 4,
    w := lasso_fit(X, y, 0.3)[0],
    (int((w == 0).sum()), bool((w[2:] == 0).all()), bool((w[:2].abs() > 1).all()))
)[-1])()`,
        expected: '(3, True, True)',
        hidden: false,
      },
      {
        id: '4',
        description: 'Ridge matches scikit-learn Ridge(alpha=2)',
        input: '(lambda wb: bool(torch.allclose(wb[0], torch.tensor([0.501562, 1.054956, 0.469557]), atol=1e-4) and abs(wb[1] - 1.770184) < 1e-4))(ridge_fit(torch.tensor([[1.0, 0.5, 2.0], [2.0, -1.0, 0.0], [0.0, 1.0, 1.0], [3.0, 2.0, -1.0], [1.5, 0.0, 0.5], [2.5, 1.5, 1.0]]), torch.tensor([4.0, 1.0, 3.0, 5.0, 2.5, 6.0]), 2.0))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Lasso matches scikit-learn Lasso(alpha=0.1) after convergence',
        input: '(lambda wb: bool(torch.allclose(wb[0], torch.tensor([0.614221, 1.30941, 0.65289]), atol=1e-3) and abs(wb[1] - 1.30584) < 1e-3))(lasso_fit(torch.tensor([[1.0, 0.5, 2.0], [2.0, -1.0, 0.0], [0.0, 1.0, 1.0], [3.0, 2.0, -1.0], [1.5, 0.0, 0.5], [2.5, 1.5, 1.0]]), torch.tensor([4.0, 1.0, 3.0, 5.0, 2.5, 6.0]), 0.1, 500))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Large lam gives all-zero weights and b = mean(y)',
        input: '(lambda wb: (bool((wb[0] == 0).all()), round(wb[1], 5)))(lasso_fit(torch.tensor([[1.0, 0.5], [2.0, -1.0], [0.0, 1.0], [3.0, 2.0]]), torch.tensor([4.0, 1.0, 3.0, 6.0]), 10.0))',
        expected: '(True, 3.5)',
        hidden: true,
      },
      {
        id: '7',
        description: 'Lasso weights after 3 sweeps (in-order coordinate updates)',
        input: 'bool(torch.allclose(lasso_fit(torch.tensor([[1.0, 2.0], [2.0, 1.0], [3.0, 4.0], [4.0, 3.0]]), torch.tensor([1.0, 2.0, 2.0, 4.0]), 0.05, 3)[0], torch.tensor([1.003616, -0.26217]), atol=1e-5))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Centre with X.mean(dim=0) and y.mean(); b = (y_mean - x_mean @ w).item().',
      'torch.linalg.solve(Xc.T @ Xc + lam * torch.eye(d), Xc.T @ yc)',
      'In the lasso loop, update the residual r = r - Xc[:, j] * (w_new - w[j]) before writing w[j] = w_new.',
    ],
  },
  'gradient-boosting': {
    note: 'Same algorithm with tensor ops; thresholds and leaf values are returned as Python floats, predictions as a tensor.',
    starterCode: `import torch

def fit_stump(X, r):
    """
    Exhaustively find the best depth-1 regression tree for targets r.

    Args:
        X: Float tensor of features, shape (n, d)
        r: Float tensor of targets (residuals), shape (n,)

    Returns:
        (feature, threshold, left_value, right_value) as Python int/floats.
        Left side is X[:, feature] <= threshold.
    """
    # Your code here
    pass


def gradient_boosting(X, y, n_rounds=10, learning_rate=0.1):
    """
    Gradient boosting with decision stumps on squared loss.

    Args:
        X: Float tensor of features, shape (n, d)
        y: Float tensor of targets, shape (n,)
        n_rounds: Number of boosting rounds
        learning_rate: Shrinkage applied to every stump

    Returns:
        dict with 'f0' (float), 'stumps' (list of tuples),
        'predictions' (tensor (n,)), 'losses' (list of n_rounds floats)
    """
    # Your code here
    pass
`,
    solution: `import torch

def fit_stump(X, r):
    X, r = X.float(), r.float()
    mean_r = r.mean().item()
    best, best_sse = (0, float('inf'), mean_r, mean_r), float('inf')
    total_sq = (r ** 2).sum()

    for j in range(X.shape[1]):
        u = torch.unique(X[:, j])
        thresholds = (u[:-1] + u[1:]) / 2                     # (T,)
        if len(thresholds) == 0:
            continue
        left = (X[:, j].unsqueeze(0) <= thresholds.unsqueeze(1)).float()   # (T, n)
        n_l = left.sum(dim=1)
        n_r = len(r) - n_l
        s_l = (left * r).sum(dim=1)
        s_r = r.sum() - s_l
        sse = total_sq - s_l ** 2 / n_l - s_r ** 2 / n_r
        k = int(torch.argmin(sse))
        if sse[k].item() < best_sse:
            best_sse = sse[k].item()
            best = (j, thresholds[k].item(), (s_l[k] / n_l[k]).item(), (s_r[k] / n_r[k]).item())
    return best


def stump_predict(stump, X):
    j, t, left, right = stump
    return torch.where(X[:, j] <= t, torch.tensor(left), torch.tensor(right))


def gradient_boosting(X, y, n_rounds=10, learning_rate=0.1):
    X, y = X.float(), y.float()
    f0 = y.mean().item()
    F = torch.full((len(y),), f0)
    stumps, losses = [], []

    for _ in range(n_rounds):
        residuals = y - F
        stump = fit_stump(X, residuals)
        F = F + learning_rate * stump_predict(stump, X)
        stumps.append(stump)
        losses.append(((y - F) ** 2).mean().item())

    return {'f0': f0, 'stumps': stumps, 'predictions': F, 'losses': losses}
`,
    testCases: [
      {
        id: '1',
        description: 'Stump separates a step perfectly',
        input: 'fit_stump(torch.tensor([[1.0], [2.0], [3.0], [4.0], [5.0], [6.0]]), torch.tensor([-2.0, -2.0, -2.0, 2.0, 2.0, 2.0]))',
        expected: '(0, 3.5, -2.0, 2.0)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Loss halves each round on a step function',
        input: '(lambda m: (m["f0"], [round(v, 5) for v in m["losses"]]))(gradient_boosting(torch.tensor([[1.0], [2.0], [3.0], [4.0], [5.0], [6.0]]), torch.tensor([1.0, 1.0, 1.0, 5.0, 5.0, 5.0]), 3, 0.5))',
        expected: '(3.0, [1.0, 0.25, 0.0625])',
        hidden: false,
      },
      {
        id: '3',
        description: 'Training loss is non-increasing',
        input: `(lambda: (
    X := torch.rand(30, 2),
    y := torch.sin(4 * X[:, 0]) + X[:, 1] ** 2 + 0.1 * torch.randn(30),
    L := gradient_boosting(X, y, 15, 0.3)["losses"],
    bool(len(L) == 15 and all(b <= a + 1e-6 for a, b in zip(L, L[1:])) and L[-1] < y.var(unbiased=False).item())
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Stump picks the better feature and midpoint',
        input: 'fit_stump(torch.tensor([[1.0, 5.0], [2.0, 1.0], [3.0, 4.0], [4.0, 2.0]]), torch.tensor([1.0, -1.0, 1.0, -1.0]))',
        expected: '(1, 3.0, -1.0, 1.0)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Tie: the first feature / smallest threshold wins',
        input: 'fit_stump(torch.tensor([[0.0, 0.0], [1.0, 1.0], [2.0, 2.0], [3.0, 3.0]]), torch.tensor([0.0, 0.0, 4.0, 4.0]))',
        expected: '(0, 1.5, 0.0, 4.0)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Predictions and losses on a 2-feature problem',
        input: '(lambda m: bool(torch.allclose(m["predictions"], torch.tensor([1.583789, 2.435352, 2.435352, 5.610156, 3.935352]), atol=1e-4) and np.allclose(m["losses"], [1.3400000000000003, 0.6631250000000002, 0.31504882812500024, 0.20106521606445332], atol=1e-4)))(gradient_boosting(torch.tensor([[1.0, 3.0], [2.0, 1.0], [3.0, 2.0], [4.0, 5.0], [5.0, 4.0]]), torch.tensor([1.0, 3.0, 2.0, 6.0, 4.0]), 4, 0.5))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'torch.unique(X[:, j]) is sorted; midpoints are (u[:-1] + u[1:]) / 2.',
      'Score all thresholds at once with a (T, n) mask: X[:, j].unsqueeze(0) <= thresholds.unsqueeze(1).',
      'torch.where(X[:, j] <= t, left, right) evaluates a stump.',
    ],
  },
  'decision-tree-bagging': {
    note: "A tree is plain Python control flow over tensors: use torch.unique, torch.bincount and boolean masks. Bootstrap indices come from np.random.default_rng(seed) in both tracks, so the trees match the NumPy track. Don't use sklearn.",
    starterCode: `import numpy as np
import torch

def build_tree(X, y, max_depth=None, min_samples_split=2):
    """
    Grow a classification tree with Gini splits.

    Args:
        X: Features, float tensor (n_samples, n_features)
        y: Non-negative integer labels, int64 tensor (n_samples,)
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
    """Return the predicted class for each row of X, as an int64 tensor (n_samples,)."""
    # Your code here
    pass

def bagging_predict(X_train, y_train, X_test, n_estimators=10, max_depth=None,
                    min_samples_split=2, seed=0):
    """
    Bagging: trees on bootstrap samples (np.random.default_rng(seed)), majority vote.

    Returns:
        Predicted classes for X_test, int64 tensor (n_test,)
    """
    # Your code here
    pass
`,
    solution: `import numpy as np
import torch

def _gini(y):
    # Python floats from the class counts (float64, like the NumPy track)
    n = len(y)
    return 1.0 - sum((c / n) ** 2 for c in torch.bincount(y).tolist())

def _best_split(X, y):
    n, n_features = X.shape
    best_imp, best_f, best_t = _gini(y), None, None
    for f in range(n_features):
        values = torch.unique(X[:, f])  # sorted
        for t in ((values[:-1] + values[1:]) / 2).tolist():
            left = X[:, f] <= t
            n_left = int(left.sum().item())
            imp = (n_left * _gini(y[left]) + (n - n_left) * _gini(y[~left])) / n
            if imp < best_imp - 1e-12:
                best_imp, best_f, best_t = imp, f, t
    return best_f, best_t

def build_tree(X, y, max_depth=None, min_samples_split=2):
    X = X.float()
    y = y.long()

    def grow(idx, depth):
        ys = y[idx]
        leaf = {'leaf': True, 'value': int(torch.bincount(ys).argmax().item())}
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

    return grow(torch.arange(len(y)), 0)

def predict_tree(tree, X):
    out = []
    for x in X.float().tolist():
        node = tree
        while not node['leaf']:
            node = node['left'] if x[node['feature']] <= node['threshold'] else node['right']
        out.append(node['value'])
    return torch.tensor(out, dtype=torch.long)

def bagging_predict(X_train, y_train, X_test, n_estimators=10, max_depth=None,
                    min_samples_split=2, seed=0):
    rng = np.random.default_rng(seed)
    n = len(y_train)
    votes = []
    for _ in range(n_estimators):
        idx = torch.from_numpy(rng.integers(0, n, size=n))
        tree = build_tree(X_train[idx], y_train[idx], max_depth, min_samples_split)
        votes.append(predict_tree(tree, X_test))
    votes = torch.stack(votes)  # (n_estimators, n_test)
    n_classes = int(y_train.max().item()) + 1
    return torch.tensor([int(torch.bincount(votes[:, j], minlength=n_classes).argmax().item())
                         for j in range(votes.shape[1])], dtype=torch.long)
`,
    testCases: [
      {
        id: '1',
        description: 'Fully grown tree fits the training data',
        input: 'predict_tree(build_tree(torch.tensor([[2.0, 3.0], [1.0, 1.0], [3.0, 1.0], [6.0, 5.0], [7.0, 7.0], [8.0, 6.0], [4.0, 4.0], [5.0, 2.0]]), torch.tensor([0, 0, 0, 1, 1, 1, 0, 1])), torch.tensor([[2.0, 3.0], [1.0, 1.0], [3.0, 1.0], [6.0, 5.0], [7.0, 7.0], [8.0, 6.0], [4.0, 4.0], [5.0, 2.0]])).tolist()',
        expected: '[0, 0, 0, 1, 1, 1, 0, 1]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Root split (feature, threshold)',
        input: '(lambda: (r := build_tree(torch.tensor([[2.0, 3.0], [1.0, 1.0], [3.0, 1.0], [6.0, 5.0], [7.0, 7.0], [8.0, 6.0], [4.0, 4.0], [5.0, 2.0]]), torch.tensor([0, 0, 0, 1, 1, 1, 0, 1])), (r["feature"], r["threshold"]))[-1])()',
        expected: '(0, 4.5)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Predictions on new points',
        input: 'predict_tree(build_tree(torch.tensor([[2.0, 3.0], [1.0, 1.0], [3.0, 1.0], [6.0, 5.0], [7.0, 7.0], [8.0, 6.0], [4.0, 4.0], [5.0, 2.0]]), torch.tensor([0, 0, 0, 1, 1, 1, 0, 1])), torch.tensor([[0.0, 0.0], [4.5, 1.0], [4.5, 6.0], [9.0, 9.0]])).tolist()',
        expected: '[0, 0, 0, 1]',
        hidden: false,
      },
      {
        id: '4',
        description: 'XOR-like data: stump vs full tree',
        input: '(lambda: (predict_tree(build_tree(torch.tensor([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0], [0.0, 2.0], [2.0, 0.0], [2.0, 2.0]]), torch.tensor([0, 1, 1, 0, 1, 1, 0]), max_depth=1), torch.tensor([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0], [0.0, 2.0], [2.0, 0.0], [2.0, 2.0]])).tolist(), predict_tree(build_tree(torch.tensor([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0], [0.0, 2.0], [2.0, 0.0], [2.0, 2.0]]), torch.tensor([0, 1, 1, 0, 1, 1, 0])), torch.tensor([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0], [0.0, 2.0], [2.0, 0.0], [2.0, 2.0]])).tolist()))()',
        expected: '([1, 1, 0, 0, 1, 0, 0], [0, 1, 1, 0, 1, 1, 0])',
        hidden: true,
      },
      {
        id: '5',
        description: 'Equal impurity ties go to feature 0',
        input: '(lambda: (r := build_tree(torch.tensor([[1.0, 1.0], [2.0, 2.0], [3.0, 3.0], [4.0, 4.0]]), torch.tensor([0, 0, 1, 1])), (r["feature"], r["threshold"]))[-1])()',
        expected: '(0, 2.5)',
        hidden: true,
      },
      {
        id: '6',
        description: 'max_depth=0 is a majority leaf (ties to the smaller label)',
        input: 'build_tree(torch.tensor([[1.0, 1.0], [2.0, 2.0], [3.0, 3.0], [4.0, 4.0]]), torch.tensor([0, 0, 1, 1]), max_depth=0)',
        expected: "{'leaf': True, 'value': 0}",
        hidden: true,
      },
      {
        id: '7',
        description: 'min_samples_split stops splitting',
        input: 'predict_tree(build_tree(torch.tensor([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0], [0.0, 2.0], [2.0, 0.0], [2.0, 2.0]]), torch.tensor([0, 1, 1, 0, 1, 1, 0]), min_samples_split=8), torch.tensor([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0], [0.0, 2.0], [2.0, 0.0], [2.0, 2.0]])).tolist()',
        expected: '[1, 1, 1, 1, 1, 1, 1]',
        hidden: true,
      },
      {
        id: '8',
        description: 'Depth-2 tree structure',
        input: 'build_tree(torch.tensor([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0], [0.0, 2.0], [2.0, 0.0], [2.0, 2.0]]), torch.tensor([0, 1, 1, 0, 1, 1, 0]), max_depth=2)',
        expected: "{'leaf': False, 'feature': 0, 'threshold': 0.5, 'left': {'leaf': False, 'feature': 1, 'threshold': 0.5, 'left': {'leaf': True, 'value': 0}, 'right': {'leaf': True, 'value': 1}}, 'right': {'leaf': False, 'feature': 1, 'threshold': 0.5, 'left': {'leaf': True, 'value': 1}, 'right': {'leaf': True, 'value': 0}}}",
        hidden: true,
      },
      {
        id: '9',
        description: 'Bagging predictions on noisy data',
        input: '(lambda: (D := (lambda: (X := np.round(np.random.randn(40, 2) * 2, 1), y := ((X[:, 0] + X[:, 1] + np.random.randn(40)) > 0).astype(int), Xq := np.round(np.random.randn(12, 2) * 2, 1), (X, y, Xq))[-1])(), bagging_predict(torch.from_numpy(D[0]).float(), torch.from_numpy(D[1]), torch.from_numpy(D[2]).float(), n_estimators=7, max_depth=3, seed=0).tolist())[-1])()',
        expected: '[0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1]',
        hidden: true,
      },
      {
        id: '10',
        description: 'One bagged tree = a tree on the bootstrap sample',
        input: '(lambda: (D := (lambda: (X := np.round(np.random.randn(40, 2) * 2, 1), y := ((X[:, 0] + X[:, 1] + np.random.randn(40)) > 0).astype(int), Xq := np.round(np.random.randn(12, 2) * 2, 1), (X, y, Xq))[-1])(), X := torch.from_numpy(D[0]).float(), y := torch.from_numpy(D[1]), Xq := torch.from_numpy(D[2]).float(), idx := torch.from_numpy(np.random.default_rng(3).integers(0, 40, size=40)), bagging_predict(X, y, Xq, n_estimators=1, seed=3).tolist() == predict_tree(build_tree(X[idx], y[idx]), Xq).tolist())[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
  },
};
