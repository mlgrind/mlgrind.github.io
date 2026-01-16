import { Problem } from '../../types';

export const pytorchBasicsProblems: Problem[] = [
  {
    id: 'tensor-creation',
    title: 'Tensor Creation (NumPy Style)',
    section: 'pytorch-basics',
    difficulty: 'easy',
    description: `
## Tensor Creation

Learn tensor creation patterns used in PyTorch, implemented with NumPy.

### PyTorch Equivalents
| PyTorch | NumPy |
|---------|-------|
| \`torch.tensor([1,2,3])\` | \`np.array([1,2,3])\` |
| \`torch.zeros(3, 4)\` | \`np.zeros((3, 4))\` |
| \`torch.randn(2, 3)\` | \`np.random.randn(2, 3)\` |
| \`torch.arange(10)\` | \`np.arange(10)\` |
| \`torch.linspace(0, 1, 5)\` | \`np.linspace(0, 1, 5)\` |

### Data Types
| PyTorch | NumPy |
|---------|-------|
| \`torch.float32\` | \`np.float32\` |
| \`torch.int64\` | \`np.int64\` |

### Task
Create tensors matching PyTorch patterns.

### Expected Return Format
Return a dictionary with these keys:
- \`'from_list'\`: Array from [1,2,3,4] with float32 dtype
- \`'zeros'\`: Zero array of shape (3, 4)
- \`'ones'\`: Ones array of shape (2, 3)
- \`'randn'\`: Random normal array of shape (2, 3)
- \`'arange'\`: Array from 0 to 9
- \`'linspace'\`: 5 evenly spaced values from 0 to 1
- \`'eye'\`: 4x4 identity matrix
- \`'full'\`: (2, 3) array filled with 7.0
    `,
    examples: [
      {
        input: 'create_tensors()',
        output: "{'zeros': shape (3,4), 'ones': shape (2,3), 'randn': shape (2,3), 'arange': [0..9], ...}",
        explanation: 'Dictionary containing tensors created with various methods',
      },
    ],
    starterCode: `import numpy as np

def create_tensors() -> dict:
    """
    Create tensors using various methods.

    Returns:
        Dictionary with named tensors
    """
    np.random.seed(42)

    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Zeros shape',
        input: 'create_tensors()["zeros"].shape',
        expected: '(3, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Random tensor shape',
        input: 'create_tensors()["randn"].shape',
        expected: '(2, 3)',
        hidden: false,
      },
    ],
    hints: [
      'np.zeros((3, 4)) for 3x4 zeros',
      'np.random.randn(2, 3) for random normal',
      'Specify dtype with astype() or dtype parameter',
    ],
    solution: `import numpy as np

def create_tensors() -> dict:
    np.random.seed(42)

    return {
        'from_list': np.array([1, 2, 3, 4], dtype=np.float32),
        'zeros': np.zeros((3, 4)),
        'ones': np.ones((2, 3)),
        'randn': np.random.randn(2, 3),
        'arange': np.arange(10),
        'linspace': np.linspace(0, 1, 5),
        'eye': np.eye(4),
        'full': np.full((2, 3), 7.0),
    }
`,
  },
  {
    id: 'tensor-operations',
    title: 'Tensor Operations',
    section: 'pytorch-basics',
    difficulty: 'easy',
    description: `
## Basic Tensor Operations

Common tensor operations used in neural networks.

### Arithmetic Operations
- Element-wise: +, -, *, /
- Matrix multiplication: @ or np.matmul
- Power: ** or np.power

### Reduction Operations
- sum, mean, std, var
- min, max, argmin, argmax

### Shape Operations
- reshape, view (reshape in NumPy)
- squeeze, unsqueeze (np.squeeze, np.expand_dims)
- permute, transpose

### Task
Implement common tensor operations.

### Expected Return Format
Return a dictionary with these keys:
- **Arithmetic**: \`'add'\`, \`'sub'\`, \`'mul'\`, \`'div'\`, \`'pow'\`
- **Reductions**: \`'sum_all'\`, \`'sum_axis0'\`, \`'sum_axis1'\`, \`'mean'\`, \`'std'\`, \`'max'\`, \`'argmax'\`
- **Shape ops**: \`'reshape'\` (to 3,2), \`'flatten'\`, \`'unsqueeze'\` (add dim 0), \`'squeeze'\`, \`'transpose'\`
    `,
    examples: [
      {
        input: 'x=[[1,2,3],[4,5,6]], y=[[1,1,1],[2,2,2]]',
        output: "{'add': [[2,3,4],[6,7,8]], 'mean': 3.5, 'reshape': [[1,2],[3,4],[5,6]], ...}",
        explanation: 'Arithmetic, reduction, and shape operations on tensors',
      },
    ],
    starterCode: `import numpy as np

def tensor_ops(x: np.ndarray, y: np.ndarray) -> dict:
    """
    Perform common tensor operations.

    Args:
        x: First tensor (2, 3)
        y: Second tensor (2, 3)

    Returns:
        Dictionary with operation results
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Addition',
        input: 'bool(np.array_equal(tensor_ops(np.array([[1,2,3],[4,5,6]]), np.array([[1,1,1],[2,2,2]]))["add"], np.array([[2,3,4],[6,7,8]])))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Mean computation',
        input: 'tensor_ops(np.array([[1,2,3],[4,5,6]]), np.array([[1,1,1],[2,2,2]]))["mean"]',
        expected: '3.5',
        hidden: false,
      },
    ],
    hints: [
      'Element-wise ops work directly: x + y, x * y',
      'Use axis parameter for reductions along specific dims',
      'np.expand_dims(x, axis=0) adds dimension',
    ],
    solution: `import numpy as np

def tensor_ops(x: np.ndarray, y: np.ndarray) -> dict:
    return {
        # Arithmetic
        'add': x + y,
        'sub': x - y,
        'mul': x * y,
        'div': x / (y + 1e-8),
        'pow': x ** 2,

        # Reductions
        'sum_all': x.sum(),
        'sum_axis0': x.sum(axis=0),
        'sum_axis1': x.sum(axis=1),
        'mean': x.mean(),
        'std': x.std(),
        'max': x.max(),
        'argmax': x.argmax(),

        # Shape ops
        'reshape': x.reshape(3, 2),
        'flatten': x.flatten(),
        'unsqueeze': np.expand_dims(x, axis=0),  # (1, 2, 3)
        'squeeze': np.squeeze(np.expand_dims(x, 0)),
        'transpose': x.T,
    }
`,
  },
  {
    id: 'autograd-concepts',
    title: 'Autograd Concepts (Manual)',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Autograd Concepts

Understand automatic differentiation by implementing it manually.

### PyTorch Autograd
\`\`\`python
x = torch.tensor([2.0], requires_grad=True)
y = x ** 2 + 3 * x + 1
y.backward()
print(x.grad)  # dy/dx = 2x + 3 = 7
\`\`\`

### Manual Gradient Computation
For y = x² + 3x + 1:
- dy/dx = 2x + 3

### Task
Implement forward pass and gradient computation for simple functions.
    `,
    examples: [
      {
        input: 'compute_gradients(x=2.0)',
        output: "{'y': 11.0, 'grad': 7.0}",
        explanation: 'Forward and backward pass',
      },
    ],
    starterCode: `import numpy as np

def compute_gradients(x: float) -> dict:
    """
    Compute forward and backward pass for y = x^2 + 3x + 1.

    Args:
        x: Input value

    Returns:
        Dictionary with 'y' (forward result) and 'grad' (dy/dx)
    """
    # Your code here
    pass


def linear_layer_gradients(X: np.ndarray, W: np.ndarray, b: np.ndarray,
                           grad_output: np.ndarray) -> dict:
    """
    Compute gradients for a linear layer: Y = X @ W + b

    Args:
        X: Input (batch, in_features)
        W: Weights (in_features, out_features)
        b: Bias (out_features,)
        grad_output: Gradient from next layer (batch, out_features)

    Returns:
        Dictionary with gradients for X, W, and b
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Simple gradient',
        input: 'compute_gradients(2.0)["grad"]',
        expected: '7.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'Forward pass result',
        input: 'compute_gradients(2.0)["y"]',
        expected: '11.0',
        hidden: false,
      },
    ],
    hints: [
      'For y = x² + 3x + 1, dy/dx = 2x + 3',
      'For Y = X @ W + b: dL/dW = X.T @ grad_output',
      'dL/dX = grad_output @ W.T',
      'dL/db = sum(grad_output, axis=0)',
    ],
    solution: `import numpy as np

def compute_gradients(x: float) -> dict:
    # Forward pass
    y = x ** 2 + 3 * x + 1

    # Backward pass (analytical gradient)
    grad = 2 * x + 3

    return {'y': y, 'grad': grad}


def linear_layer_gradients(X: np.ndarray, W: np.ndarray, b: np.ndarray,
                           grad_output: np.ndarray) -> dict:
    # Forward: Y = X @ W + b

    # Backward:
    # dL/dW = X.T @ grad_output
    grad_W = X.T @ grad_output

    # dL/db = sum of grad_output over batch
    grad_b = grad_output.sum(axis=0)

    # dL/dX = grad_output @ W.T
    grad_X = grad_output @ W.T

    return {
        'grad_W': grad_W,
        'grad_b': grad_b,
        'grad_X': grad_X
    }
`,
  },
  {
    id: 'nn-modules',
    title: 'Neural Network Modules',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Neural Network Modules

Implement PyTorch-style nn.Module patterns in NumPy.

### Module Pattern
\`\`\`python
class Linear:
    def __init__(self, in_features, out_features):
        self.W = np.random.randn(in_features, out_features) * 0.01
        self.b = np.zeros(out_features)

    def forward(self, x):
        return x @ self.W + self.b

    def parameters(self):
        return [self.W, self.b]
\`\`\`

### Task
Implement Linear and ReLU modules with forward method.
    `,
    examples: [
      {
        input: 'Linear(10, 5).forward(x)',
        output: 'Output of shape (batch, 5)',
        explanation: 'Linear transformation',
      },
    ],
    starterCode: `import numpy as np

class Linear:
    """Linear layer: Y = X @ W + b"""

    def __init__(self, in_features: int, out_features: int):
        # Initialize weights with small random values
        # Your code here
        pass

    def forward(self, x: np.ndarray) -> np.ndarray:
        # Your code here
        pass

    def parameters(self):
        # Return list of parameters
        pass


class ReLU:
    """ReLU activation: max(0, x)"""

    def forward(self, x: np.ndarray) -> np.ndarray:
        # Your code here
        pass


class Sequential:
    """Container for sequential layers"""

    def __init__(self, *layers):
        self.layers = layers

    def forward(self, x: np.ndarray) -> np.ndarray:
        # Your code here
        pass


def create_mlp(input_dim: int, hidden_dim: int, output_dim: int):
    """Create a 2-layer MLP: Linear -> ReLU -> Linear"""
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Linear output shape',
        input: 'Linear(10, 5).forward(np.random.randn(4, 10)).shape',
        expected: '(4, 5)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Sequential forward',
        input: 'create_mlp(10, 20, 5).forward(np.random.randn(4, 10)).shape',
        expected: '(4, 5)',
        hidden: false,
      },
    ],
    hints: [
      'Initialize W with np.random.randn() * 0.01',
      'ReLU: np.maximum(0, x)',
      'Sequential applies layers in order',
    ],
    solution: `import numpy as np

class Linear:
    def __init__(self, in_features: int, out_features: int):
        self.W = np.random.randn(in_features, out_features) * 0.01
        self.b = np.zeros(out_features)

    def forward(self, x: np.ndarray) -> np.ndarray:
        return x @ self.W + self.b

    def parameters(self):
        return [self.W, self.b]


class ReLU:
    def forward(self, x: np.ndarray) -> np.ndarray:
        return np.maximum(0, x)


class Sequential:
    def __init__(self, *layers):
        self.layers = layers

    def forward(self, x: np.ndarray) -> np.ndarray:
        for layer in self.layers:
            x = layer.forward(x)
        return x


def create_mlp(input_dim: int, hidden_dim: int, output_dim: int):
    return Sequential(
        Linear(input_dim, hidden_dim),
        ReLU(),
        Linear(hidden_dim, output_dim)
    )
`,
  },
  {
    id: 'loss-functions',
    title: 'Loss Functions',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Common Loss Functions

Implement loss functions used in deep learning.

### Cross-Entropy Loss
\`\`\`
L = -sum(y * log(softmax(logits)))
\`\`\`

### MSE Loss
\`\`\`
L = mean((y_pred - y_true)²)
\`\`\`

### Binary Cross-Entropy
\`\`\`
L = -mean(y * log(p) + (1-y) * log(1-p))
\`\`\`

### Task
Implement these loss functions with numerical stability.
    `,
    examples: [
      {
        input: 'cross_entropy(logits, targets)',
        output: 'Scalar loss value',
        explanation: 'Cross-entropy for classification',
      },
    ],
    starterCode: `import numpy as np

def softmax(x: np.ndarray) -> np.ndarray:
    """Numerically stable softmax."""
    # Your code here
    pass


def cross_entropy_loss(logits: np.ndarray, targets: np.ndarray) -> float:
    """
    Cross-entropy loss for classification.

    Args:
        logits: Raw scores (batch, num_classes)
        targets: Integer class labels (batch,)

    Returns:
        Scalar loss
    """
    # Your code here
    pass


def mse_loss(y_pred: np.ndarray, y_true: np.ndarray) -> float:
    """Mean squared error loss."""
    # Your code here
    pass


def binary_cross_entropy(y_pred: np.ndarray, y_true: np.ndarray) -> float:
    """Binary cross-entropy with numerical stability."""
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Cross-entropy computation',
        input: 'round(cross_entropy_loss(np.array([[2.0, 1.0, 0.1]]), np.array([0])), 4)',
        expected: '0.4170',
        hidden: false,
      },
      {
        id: '2',
        description: 'MSE computation',
        input: 'mse_loss(np.array([1.0, 2.0, 3.0]), np.array([1.0, 2.0, 4.0]))',
        expected: '0.3333333333333333',
        hidden: false,
      },
    ],
    hints: [
      'Softmax: exp(x - max(x)) / sum(exp(x - max(x)))',
      'Use np.clip for numerical stability in log',
      'Index logits with targets for cross-entropy',
    ],
    solution: `import numpy as np

def softmax(x: np.ndarray) -> np.ndarray:
    exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
    return exp_x / np.sum(exp_x, axis=-1, keepdims=True)


def cross_entropy_loss(logits: np.ndarray, targets: np.ndarray) -> float:
    batch_size = logits.shape[0]
    probs = softmax(logits)

    # Clip for numerical stability
    probs = np.clip(probs, 1e-15, 1 - 1e-15)

    # Select probability of correct class for each sample
    correct_probs = probs[np.arange(batch_size), targets]

    # Negative log likelihood
    loss = -np.mean(np.log(correct_probs))
    return loss


def mse_loss(y_pred: np.ndarray, y_true: np.ndarray) -> float:
    return np.mean((y_pred - y_true) ** 2)


def binary_cross_entropy(y_pred: np.ndarray, y_true: np.ndarray) -> float:
    y_pred = np.clip(y_pred, 1e-15, 1 - 1e-15)
    return -np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))
`,
  },
];
