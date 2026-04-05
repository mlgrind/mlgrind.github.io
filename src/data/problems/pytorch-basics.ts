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
        expected: '0.417',
        hidden: false,
      },
      {
        id: '2',
        description: 'MSE computation',
        input: 'mse_loss(np.array([1.0, 2.0, 3.0]), np.array([1.0, 2.0, 4.0]))',
        expected: '0.333333',
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
  {
    id: 'gelu-activation',
    title: 'GELU Activation',
    section: 'pytorch-basics',
    difficulty: 'easy',
    description: `
## GELU Activation

The **Gaussian Error Linear Unit (GELU)** is the activation function used in modern transformers like BERT and GPT.

### Formula (Approximation)
\`\`\`
GELU(x) = 0.5 * x * (1 + tanh(sqrt(2/π) * (x + 0.044715 * x³)))
\`\`\`

### Key Properties
- Smooth, non-monotonic function
- Unlike ReLU, GELU allows small negative values (not hard zero)
- GELU(0) = 0
- Approaches x for large positive x
- Approaches 0 for large negative x

### Comparison with ReLU
| Property | ReLU | GELU |
|----------|------|------|
| Smoothness | Not smooth at 0 | Smooth everywhere |
| Negative values | Hard zero | Small negative values allowed |
| Gradient at 0 | Undefined | Well-defined |

### Task
Implement the GELU activation function using the tanh approximation.
    `,
    examples: [
      {
        input: 'gelu(np.array([0.0]))',
        output: '[0.0]',
        explanation: 'GELU(0) = 0',
      },
      {
        input: 'gelu(np.array([1.0]))',
        output: '[≈0.8412]',
        explanation: 'GELU(1) ≈ 0.8412',
      },
    ],
    starterCode: `import numpy as np

def gelu(x: np.ndarray) -> np.ndarray:
    """
    Compute the GELU activation function (tanh approximation).

    Args:
        x: Input array of any shape

    Returns:
        GELU activation applied element-wise, same shape as input
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'GELU of zero is zero',
        input: 'round(float(gelu(np.array([0.0]))[0]), 4)',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'GELU of 1.0',
        input: 'round(float(gelu(np.array([1.0]))[0]), 4)',
        expected: '0.8412',
        hidden: false,
      },
      {
        id: '3',
        description: 'GELU of -1.0 (small negative output)',
        input: 'round(float(gelu(np.array([-1.0]))[0]), 4)',
        expected: '-0.1588',
        hidden: false,
      },
      {
        id: '4',
        description: 'Shape preservation',
        input: 'gelu(np.random.randn(3, 4)).shape',
        expected: '(3, 4)',
        hidden: false,
      },
      {
        id: '5',
        description: 'GELU allows small negative values unlike ReLU',
        input: 'bool(gelu(np.array([-0.5]))[0] < 0)',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'GELU array computation',
        input: 'bool(np.allclose(gelu(np.array([-1.0, 0.0, 1.0])), np.array([-0.1588, 0.0, 0.8412]), atol=1e-4))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'The constant sqrt(2/π) ≈ 0.7979',
      'Use np.tanh for the hyperbolic tangent',
      'All operations are element-wise, so they work on arrays of any shape',
      'The formula is: 0.5 * x * (1 + tanh(sqrt(2/π) * (x + 0.044715 * x³)))',
    ],
    solution: `import numpy as np

def gelu(x: np.ndarray) -> np.ndarray:
    return 0.5 * x * (1 + np.tanh(np.sqrt(2 / np.pi) * (x + 0.044715 * x ** 3)))
`,
  },
  {
    id: 'leaky-relu-swish',
    title: 'LeakyReLU & Swish',
    section: 'pytorch-basics',
    difficulty: 'easy',
    description: `
## LeakyReLU & Swish Activations

Two popular activation functions that address the "dying ReLU" problem.

### LeakyReLU
\`\`\`
LeakyReLU(x) = x       if x > 0
               α * x   if x ≤ 0
\`\`\`
Where α is a small positive constant (default 0.01).

### Swish
\`\`\`
Swish(x) = x * sigmoid(β * x) = x / (1 + exp(-β * x))
\`\`\`
Where β controls the shape (default 1.0). Swish is smooth and non-monotonic.

### Key Differences
| Property | ReLU | LeakyReLU | Swish |
|----------|------|-----------|-------|
| Dead neurons | Yes | No | No |
| Smooth | No | No | Yes |
| Negative output | Never | Yes (scaled) | Yes (small) |

### Task
Implement both LeakyReLU and Swish activation functions.
    `,
    examples: [
      {
        input: 'leaky_relu(np.array([-2.0, -1.0, 0.0, 1.0, 2.0]))',
        output: '[-0.02, -0.01, 0.0, 1.0, 2.0]',
        explanation: 'Negative values scaled by alpha=0.01',
      },
      {
        input: 'swish(np.array([0.0]))',
        output: '[0.0]',
        explanation: 'Swish(0) = 0 * sigmoid(0) = 0 * 0.5 = 0',
      },
    ],
    starterCode: `import numpy as np

def leaky_relu(x: np.ndarray, alpha: float = 0.01) -> np.ndarray:
    """
    Compute LeakyReLU activation.

    Args:
        x: Input array of any shape
        alpha: Slope for negative values (default 0.01)

    Returns:
        LeakyReLU applied element-wise
    """
    # Your code here
    pass


def swish(x: np.ndarray, beta: float = 1.0) -> np.ndarray:
    """
    Compute Swish activation: x * sigmoid(beta * x).

    Args:
        x: Input array of any shape
        beta: Scaling parameter (default 1.0)

    Returns:
        Swish applied element-wise
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'LeakyReLU positive values unchanged',
        input: 'bool(np.allclose(leaky_relu(np.array([1.0, 2.0, 3.0])), np.array([1.0, 2.0, 3.0])))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'LeakyReLU negative values scaled by alpha',
        input: 'bool(np.allclose(leaky_relu(np.array([-1.0, -2.0]), 0.01), np.array([-0.01, -0.02])))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Swish of zero is zero',
        input: 'round(float(swish(np.array([0.0]))[0]), 4)',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '4',
        description: 'Swish is smooth (positive input)',
        input: 'round(float(swish(np.array([1.0]))[0]), 4)',
        expected: '0.7311',
        hidden: false,
      },
      {
        id: '5',
        description: 'LeakyReLU with custom alpha',
        input: 'bool(np.allclose(leaky_relu(np.array([-1.0, -2.0]), 0.1), np.array([-0.1, -0.2])))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Shape preservation for both functions',
        input: 'bool(leaky_relu(np.random.randn(3, 4)).shape == (3, 4) and swish(np.random.randn(3, 4)).shape == (3, 4))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'LeakyReLU can be implemented with np.where(x > 0, x, alpha * x)',
      'Sigmoid function: 1 / (1 + np.exp(-x))',
      'Swish is simply x * sigmoid(beta * x)',
      'All operations should be element-wise',
    ],
    solution: `import numpy as np

def leaky_relu(x: np.ndarray, alpha: float = 0.01) -> np.ndarray:
    return np.where(x > 0, x, alpha * x)

def swish(x: np.ndarray, beta: float = 1.0) -> np.ndarray:
    return x * (1 / (1 + np.exp(-beta * x)))
`,
  },
  {
    id: 'softmax-temperature',
    title: 'Softmax with Temperature',
    section: 'pytorch-basics',
    difficulty: 'easy',
    description: `
## Softmax with Temperature

Temperature scaling controls the "sharpness" of the softmax distribution. It's widely used in language model sampling and knowledge distillation.

### Formula
\`\`\`
softmax(x / T)
\`\`\`
where T is the temperature parameter.

### Temperature Effects
| Temperature | Effect |
|-------------|--------|
| T = 1.0 | Standard softmax |
| T → 0 | Approaches argmax (one-hot) |
| T → ∞ | Approaches uniform distribution |
| T < 1.0 | Sharper/more confident |
| T > 1.0 | Softer/more uniform |

### Numerical Stability
Subtract the max before exponentiating:
\`\`\`python
exp(x - max(x)) / sum(exp(x - max(x)))
\`\`\`

### Task
Implement softmax with temperature scaling and numerical stability.
    `,
    examples: [
      {
        input: 'softmax_temperature(np.array([2.0, 1.0, 0.1]), temperature=1.0)',
        output: '[0.659, 0.242, 0.099]',
        explanation: 'Standard softmax at T=1.0',
      },
    ],
    starterCode: `import numpy as np

def softmax_temperature(logits: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    """
    Compute softmax with temperature scaling.

    Args:
        logits: Input logits array (any shape, softmax along last axis)
        temperature: Temperature parameter (default 1.0)

    Returns:
        Probability distribution (sums to 1 along last axis)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output sums to 1',
        input: 'bool(np.allclose(np.sum(softmax_temperature(np.array([2.0, 1.0, 0.1]))), 1.0))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Standard softmax at T=1',
        input: 'bool(np.allclose(softmax_temperature(np.array([2.0, 1.0, 0.1]), 1.0), np.array([0.6590, 0.2424, 0.0986]), atol=1e-3))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Low temperature approaches one-hot',
        input: 'bool(np.argmax(softmax_temperature(np.array([2.0, 1.0, 0.1]), 0.01)) == 0 and softmax_temperature(np.array([2.0, 1.0, 0.1]), 0.01)[0] > 0.99)',
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'High temperature approaches uniform',
        input: 'bool(np.allclose(softmax_temperature(np.array([2.0, 1.0, 0.1]), 100.0), np.array([1/3, 1/3, 1/3]), atol=0.01))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '5',
        description: 'Shape preservation for 2D input',
        input: 'softmax_temperature(np.random.randn(3, 5), 1.0).shape',
        expected: '(3, 5)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Each row sums to 1 for 2D input',
        input: 'bool(np.allclose(np.sum(softmax_temperature(np.array([[1.0, 2.0], [3.0, 4.0]]), 1.0), axis=-1), np.array([1.0, 1.0])))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'First divide logits by temperature: scaled = logits / T',
      'For numerical stability, subtract the max: scaled - max(scaled)',
      'Then apply standard softmax: exp(x) / sum(exp(x))',
      'Use axis=-1 and keepdims=True for multi-dimensional support',
    ],
    solution: `import numpy as np

def softmax_temperature(logits: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    scaled = logits / temperature
    exp_x = np.exp(scaled - np.max(scaled, axis=-1, keepdims=True))
    return exp_x / np.sum(exp_x, axis=-1, keepdims=True)
`,
  },
  {
    id: 'rmsnorm',
    title: 'RMS Normalization',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## RMS Normalization

**RMSNorm** is a simplification of Layer Normalization used in models like LLaMA and Gemma. It normalizes by the root mean square of activations, without centering (no mean subtraction).

### Formula
\`\`\`
RMSNorm(x) = x / sqrt(mean(x², axis=-1) + ε) * γ
\`\`\`

### Comparison with Layer Norm
| Property | LayerNorm | RMSNorm |
|----------|-----------|---------|
| Mean subtraction | Yes | No |
| Variance normalization | Yes | Yes (via RMS) |
| Learnable scale (γ) | Yes | Yes |
| Learnable shift (β) | Yes | No |
| Speed | Slower | Faster |

### Task
Implement RMS Normalization.
    `,
    examples: [
      {
        input: 'rmsnorm(np.array([[1.0, 2.0, 3.0]]), np.array([1.0, 1.0, 1.0]))',
        output: '[[0.4629, 0.9258, 1.3887]]',
        explanation: 'Normalized by RMS = sqrt(mean([1,4,9])) = sqrt(14/3)',
      },
    ],
    starterCode: `import numpy as np

def rmsnorm(x: np.ndarray, gamma: np.ndarray, eps: float = 1e-6) -> np.ndarray:
    """
    Apply RMS Normalization.

    Args:
        x: Input array of shape (..., features)
        gamma: Learnable scale parameter of shape (features,)
        eps: Small constant for numerical stability

    Returns:
        Normalized array, same shape as input
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape matches input',
        input: 'rmsnorm(np.random.randn(2, 4), np.ones(4)).shape',
        expected: '(2, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Known values with gamma=1',
        input: 'bool(np.allclose(rmsnorm(np.array([[1.0, 2.0, 3.0]]), np.ones(3)), np.array([[0.4629, 0.9258, 1.3887]]), atol=1e-3))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Gamma scaling effect',
        input: 'bool(np.allclose(rmsnorm(np.array([[1.0, 2.0, 3.0]]), np.array([2.0, 2.0, 2.0])), 2.0 * rmsnorm(np.array([[1.0, 2.0, 3.0]]), np.ones(3)), atol=1e-6))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Different from LayerNorm (no mean subtraction)',
        input: '(lambda: (x := np.array([[1.0, 2.0, 3.0]]), g := np.ones(3), rms_out := rmsnorm(x, g), bool(not np.allclose(rms_out.mean(axis=-1), 0.0, atol=1e-3)))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Batch processing (multiple rows)',
        input: 'bool(np.allclose(rmsnorm(np.array([[3.0, 4.0], [1.0, 1.0]]), np.ones(2))[1], np.array([1.0, 1.0]), atol=1e-3))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'RMS = sqrt(mean(x², axis=-1, keepdims=True) + eps)',
      'No mean subtraction — that is the key difference from LayerNorm',
      'Use keepdims=True so the division broadcasts correctly',
      'Final result: (x / RMS) * gamma',
    ],
    solution: `import numpy as np

def rmsnorm(x: np.ndarray, gamma: np.ndarray, eps: float = 1e-6) -> np.ndarray:
    rms = np.sqrt(np.mean(x ** 2, axis=-1, keepdims=True) + eps)
    return (x / rms) * gamma
`,
  },
  {
    id: 'group-norm',
    title: 'Group Normalization',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Group Normalization

**Group Normalization** divides channels into groups and normalizes within each group. It's independent of batch size, making it useful for small batches.

### Algorithm
1. Reshape input from (N, C) to (N, G, C//G) where G is num_groups
2. Compute mean and variance within each group (axis=2)
3. Normalize: (x - mean) / sqrt(var + eps)
4. Reshape back to (N, C)
5. Apply learnable scale (γ) and shift (β)

### Special Cases
| Setting | Equivalent To |
|---------|---------------|
| G = C | Instance Normalization |
| G = 1 | Layer Normalization |

### Task
Implement Group Normalization for 2D input (N, C).
    `,
    examples: [
      {
        input: 'group_norm(x, num_groups=2, gamma, beta) where x is (2, 4)',
        output: 'Normalized output of shape (2, 4)',
        explanation: 'Channels divided into 2 groups of 2, normalized within each group',
      },
    ],
    starterCode: `import numpy as np

def group_norm(x: np.ndarray, num_groups: int, gamma: np.ndarray, beta: np.ndarray, eps: float = 1e-5) -> np.ndarray:
    """
    Apply Group Normalization.

    Args:
        x: Input array of shape (N, C)
        num_groups: Number of groups to divide channels into
        gamma: Scale parameter of shape (C,)
        beta: Shift parameter of shape (C,)
        eps: Small constant for numerical stability

    Returns:
        Normalized array of shape (N, C)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape matches input',
        input: 'group_norm(np.random.randn(2, 4), 2, np.ones(4), np.zeros(4)).shape',
        expected: '(2, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'With groups=C acts like instance norm (each channel normalized)',
        input: '(lambda: (x := np.array([[1.0, 2.0, 3.0, 4.0]]), out := group_norm(x, 4, np.ones(4), np.zeros(4)), bool(np.allclose(out, np.zeros((1, 4)), atol=1e-3)))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Gamma and beta effect',
        input: '(lambda: (x := np.array([[1.0, 2.0, 3.0, 4.0]]), out := group_norm(x, 2, 2.0 * np.ones(4), np.ones(4)), bool(out.shape == (1, 4) and not np.allclose(out, np.zeros((1, 4)))))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Normalized within groups (mean ~0 before scale/shift)',
        input: '(lambda: (x := np.random.randn(4, 8), out := group_norm(x, 2, np.ones(8), np.zeros(8)), grouped := out.reshape(4, 2, 4), bool(np.allclose(grouped.mean(axis=2), 0.0, atol=1e-5)))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Batch processing with multiple samples',
        input: '(lambda: (x := np.array([[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0]]), out := group_norm(x, 2, np.ones(4), np.zeros(4)), bool(out.shape == (2, 4)))[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Reshape x from (N, C) to (N, num_groups, C // num_groups)',
      'Compute mean and var along axis=2 with keepdims=True',
      'Normalize: (x_grouped - mean) / sqrt(var + eps)',
      'Reshape back to (N, C) before applying gamma and beta',
    ],
    solution: `import numpy as np

def group_norm(x: np.ndarray, num_groups: int, gamma: np.ndarray, beta: np.ndarray, eps: float = 1e-5) -> np.ndarray:
    N, C = x.shape
    x_grouped = x.reshape(N, num_groups, C // num_groups)
    mean = np.mean(x_grouped, axis=2, keepdims=True)
    var = np.var(x_grouped, axis=2, keepdims=True)
    x_norm = (x_grouped - mean) / np.sqrt(var + eps)
    x_norm = x_norm.reshape(N, C)
    return gamma * x_norm + beta
`,
  },
  {
    id: 'adam-optimizer',
    title: 'Adam Optimizer',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Adam Optimizer

**Adam** (Adaptive Moment Estimation) combines momentum and RMSProp. It's the most widely used optimizer in deep learning.

### Algorithm
At each step t:
1. Update biased first moment: \`m = β₁ * m + (1 - β₁) * grads\`
2. Update biased second moment: \`v = β₂ * v + (1 - β₂) * grads²\`
3. Bias correction: \`m̂ = m / (1 - β₁ᵗ)\`, \`v̂ = v / (1 - β₂ᵗ)\`
4. Update params: \`params = params - lr * m̂ / (√v̂ + ε)\`

### Default Hyperparameters
| Parameter | Default | Purpose |
|-----------|---------|---------|
| lr | 0.001 | Learning rate |
| β₁ | 0.9 | First moment decay |
| β₂ | 0.999 | Second moment decay |
| ε | 1e-8 | Numerical stability |

### Task
Implement one step of the Adam optimizer.

### Expected Return Format
Return a dictionary with keys:
- \`'params'\`: Updated parameters
- \`'m'\`: Updated first moment estimate
- \`'v'\`: Updated second moment estimate
    `,
    examples: [
      {
        input: 'adam_step(params, grads, m, v, t=1)',
        output: "{'params': updated, 'm': first_moment, 'v': second_moment}",
        explanation: 'One step of Adam optimizer',
      },
    ],
    starterCode: `import numpy as np

def adam_step(params, grads, m, v, t, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
    """
    Perform one step of the Adam optimizer.

    Args:
        params: Current parameters (np.ndarray)
        grads: Current gradients (np.ndarray, same shape as params)
        m: First moment estimate (np.ndarray, same shape as params)
        v: Second moment estimate (np.ndarray, same shape as params)
        t: Current timestep (int, starting from 1)
        lr: Learning rate
        beta1: First moment decay rate
        beta2: Second moment decay rate
        eps: Small constant for numerical stability

    Returns:
        Dictionary with 'params', 'm', 'v'
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Params move in correct direction (negative gradient)',
        input: '(lambda: (result := adam_step(np.array([1.0, 2.0]), np.array([0.5, -0.3]), np.zeros(2), np.zeros(2), 1), bool(result["params"][0] < 1.0 and result["params"][1] > 2.0))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'First moment update',
        input: '(lambda: (result := adam_step(np.array([1.0]), np.array([1.0]), np.zeros(1), np.zeros(1), 1), round(float(result["m"][0]), 4))[-1])()',
        expected: '0.1',
        hidden: false,
      },
      {
        id: '3',
        description: 'Second moment update',
        input: '(lambda: (result := adam_step(np.array([1.0]), np.array([1.0]), np.zeros(1), np.zeros(1), 1), round(float(result["v"][0]), 4))[-1])()',
        expected: '0.001',
        hidden: false,
      },
      {
        id: '4',
        description: 'Bias correction at t=1',
        input: '(lambda: (result := adam_step(np.array([0.0]), np.array([1.0]), np.zeros(1), np.zeros(1), 1), bool(result["params"][0] < 0.0))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '5',
        description: 'Output shapes preserved',
        input: '(lambda: (result := adam_step(np.zeros((3, 4)), np.ones((3, 4)), np.zeros((3, 4)), np.zeros((3, 4)), 1), bool(result["params"].shape == (3, 4) and result["m"].shape == (3, 4) and result["v"].shape == (3, 4)))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Multiple steps converge toward minimum',
        input: '(lambda: (p := np.array([5.0]), g := np.array([1.0]), m := np.zeros(1), v := np.zeros(1), r1 := adam_step(p, g, m, v, 1), r2 := adam_step(r1["params"], g, r1["m"], r1["v"], 2), bool(r2["params"][0] < r1["params"][0]))[-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'First moment: m = beta1 * m + (1 - beta1) * grads',
      'Second moment: v = beta2 * v + (1 - beta2) * grads ** 2',
      'Bias correction divides by (1 - beta^t)',
      'Final update: params - lr * m_hat / (sqrt(v_hat) + eps)',
    ],
    solution: `import numpy as np

def adam_step(params, grads, m, v, t, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
    m = beta1 * m + (1 - beta1) * grads
    v = beta2 * v + (1 - beta2) * grads ** 2
    m_hat = m / (1 - beta1 ** t)
    v_hat = v / (1 - beta2 ** t)
    params = params - lr * m_hat / (np.sqrt(v_hat) + eps)
    return {'params': params, 'm': m, 'v': v}
`,
  },
  {
    id: 'sgd-momentum',
    title: 'SGD with Momentum',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## SGD with Momentum

**Momentum** accelerates SGD by accumulating a velocity vector in the direction of persistent gradients.

### Algorithm
At each step:
1. Update velocity: \`v = momentum * v + grads\`
2. Update params: \`params = params - lr * v\`

### Intuition
- Without momentum: gradient descent oscillates in narrow valleys
- With momentum: the velocity accumulates, smoothing oscillations and accelerating convergence

### Comparison
| Optimizer | Update Rule |
|-----------|-------------|
| Vanilla SGD | \`p = p - lr * g\` |
| SGD + Momentum | \`v = μv + g; p = p - lr * v\` |

### Task
Implement one step of SGD with momentum.

### Expected Return Format
Return a dictionary with keys:
- \`'params'\`: Updated parameters
- \`'velocity'\`: Updated velocity
    `,
    examples: [
      {
        input: 'sgd_momentum_step(params, grads, velocity, lr=0.01, momentum=0.9)',
        output: "{'params': updated, 'velocity': updated}",
        explanation: 'One step of SGD with momentum',
      },
    ],
    starterCode: `import numpy as np

def sgd_momentum_step(params, grads, velocity, lr=0.01, momentum=0.9):
    """
    Perform one step of SGD with momentum.

    Args:
        params: Current parameters (np.ndarray)
        grads: Current gradients (np.ndarray, same shape as params)
        velocity: Current velocity (np.ndarray, same shape as params)
        lr: Learning rate
        momentum: Momentum coefficient

    Returns:
        Dictionary with 'params' and 'velocity'
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Without momentum (momentum=0) is standard SGD',
        input: '(lambda: (result := sgd_momentum_step(np.array([1.0]), np.array([2.0]), np.zeros(1), lr=0.1, momentum=0.0), round(float(result["params"][0]), 4))[-1])()',
        expected: '0.8',
        hidden: false,
      },
      {
        id: '2',
        description: 'Velocity accumulates with momentum',
        input: '(lambda: (r1 := sgd_momentum_step(np.array([1.0]), np.array([1.0]), np.zeros(1), lr=0.1, momentum=0.9), r2 := sgd_momentum_step(r1["params"], np.array([1.0]), r1["velocity"], lr=0.1, momentum=0.9), bool(abs(float(r2["velocity"][0])) > abs(float(r1["velocity"][0]))))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Correct velocity update',
        input: '(lambda: (result := sgd_momentum_step(np.array([0.0]), np.array([1.0]), np.zeros(1), lr=0.01, momentum=0.9), round(float(result["velocity"][0]), 4))[-1])()',
        expected: '1.0',
        hidden: false,
      },
      {
        id: '4',
        description: 'Params move opposite to gradient direction',
        input: '(lambda: (result := sgd_momentum_step(np.array([5.0, 3.0]), np.array([1.0, -1.0]), np.zeros(2), lr=0.1, momentum=0.9), bool(result["params"][0] < 5.0 and result["params"][1] > 3.0))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '5',
        description: 'Shape preservation',
        input: '(lambda: (result := sgd_momentum_step(np.zeros((3, 4)), np.ones((3, 4)), np.zeros((3, 4)), lr=0.01, momentum=0.9), bool(result["params"].shape == (3, 4) and result["velocity"].shape == (3, 4)))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Velocity with existing momentum',
        input: '(lambda: (result := sgd_momentum_step(np.array([0.0]), np.array([1.0]), np.array([2.0]), lr=0.01, momentum=0.9), round(float(result["velocity"][0]), 4))[-1])()',
        expected: '2.8',
        hidden: true,
      },
    ],
    hints: [
      'Velocity update: v = momentum * v + grads',
      'Parameter update: params = params - lr * v',
      'When momentum=0, this reduces to vanilla SGD: params = params - lr * grads',
      'The velocity accumulates gradient information over time',
    ],
    solution: `import numpy as np

def sgd_momentum_step(params, grads, velocity, lr=0.01, momentum=0.9):
    velocity = momentum * velocity + grads
    params = params - lr * velocity
    return {'params': params, 'velocity': velocity}
`,
  },
  {
    id: 'lr-scheduling',
    title: 'Learning Rate Scheduling',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Learning Rate Scheduling

A **learning rate schedule** adjusts the learning rate during training. The warmup + cosine decay schedule is standard in modern training (GPT, LLaMA, etc.).

### Warmup + Cosine Decay
1. **Warmup phase** (step < warmup_steps): Linear increase from 0 to base_lr
2. **Decay phase** (step ≥ warmup_steps): Cosine decay from base_lr to min_lr

### Formulas
**Warmup**:
\`\`\`
lr = base_lr * step / warmup_steps
\`\`\`

**Cosine Decay**:
\`\`\`
progress = (step - warmup_steps) / (total_steps - warmup_steps)
lr = min_lr + 0.5 * (base_lr - min_lr) * (1 + cos(π * progress))
\`\`\`

### Task
Implement a learning rate schedule with linear warmup and cosine decay.
    `,
    examples: [
      {
        input: 'lr_schedule(step=0, warmup_steps=100, total_steps=1000)',
        output: '0.0',
        explanation: 'At step 0, warmup starts from 0',
      },
      {
        input: 'lr_schedule(step=100, warmup_steps=100, total_steps=1000)',
        output: '0.001',
        explanation: 'At end of warmup, lr = base_lr',
      },
    ],
    starterCode: `import numpy as np

def lr_schedule(step, warmup_steps, total_steps, base_lr=0.001, min_lr=1e-6):
    """
    Compute learning rate with linear warmup and cosine decay.

    Args:
        step: Current training step
        warmup_steps: Number of warmup steps
        total_steps: Total number of training steps
        base_lr: Peak learning rate (default 0.001)
        min_lr: Minimum learning rate (default 1e-6)

    Returns:
        Learning rate (float) for the given step
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'LR at step 0 is approximately 0',
        input: 'round(lr_schedule(0, 100, 1000, 0.001, 1e-6), 6)',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'LR at warmup_steps equals base_lr',
        input: 'round(lr_schedule(100, 100, 1000, 0.001, 1e-6), 6)',
        expected: '0.001',
        hidden: false,
      },
      {
        id: '3',
        description: 'LR at total_steps equals min_lr',
        input: 'round(lr_schedule(1000, 100, 1000, 0.001, 1e-6), 6)',
        expected: '1e-06',
        hidden: false,
      },
      {
        id: '4',
        description: 'LR increases during warmup',
        input: 'bool(lr_schedule(50, 100, 1000, 0.001) < lr_schedule(75, 100, 1000, 0.001))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '5',
        description: 'LR decreases during decay',
        input: 'bool(lr_schedule(200, 100, 1000, 0.001) > lr_schedule(500, 100, 1000, 0.001))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Midpoint of warmup is half of base_lr',
        input: 'round(lr_schedule(50, 100, 1000, 0.001, 1e-6), 6)',
        expected: '0.0005',
        hidden: true,
      },
    ],
    hints: [
      'During warmup (step < warmup_steps): lr = base_lr * step / warmup_steps',
      'During decay: compute progress = (step - warmup_steps) / (total_steps - warmup_steps)',
      'Cosine decay: min_lr + 0.5 * (base_lr - min_lr) * (1 + cos(π * progress))',
      'Use np.cos and np.pi for the cosine computation',
    ],
    solution: `import numpy as np

def lr_schedule(step, warmup_steps, total_steps, base_lr=0.001, min_lr=1e-6):
    if step < warmup_steps:
        return base_lr * step / warmup_steps
    else:
        progress = (step - warmup_steps) / (total_steps - warmup_steps)
        return min_lr + 0.5 * (base_lr - min_lr) * (1 + np.cos(np.pi * progress))
`,
  },
  {
    id: 'gradient-accumulation',
    title: 'Gradient Accumulation',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Gradient Accumulation

Simulate gradient accumulation — train with large effective batch sizes when GPU memory is limited.

### How It Works
\`\`\`
effective_grad = (1/N) * sum(grad_i for i in range(N))
\`\`\`

### Task
Given a list of gradient arrays (one per micro-batch), return the averaged gradient.
    `,
    examples: [
      {
        input: 'grads = [np.array([1,2]), np.array([3,4])], steps = 2',
        output: '[2.0, 3.0]',
        explanation: 'Average of [1,2] and [3,4]',
      },
    ],
    starterCode: `import numpy as np

def gradient_accumulation(micro_batches_grads, accumulation_steps):
    """
    Accumulate and average gradients from micro-batches.

    Args:
        micro_batches_grads: List of gradient arrays
        accumulation_steps: Number of micro-batches to accumulate

    Returns:
        Averaged gradient array
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Two micro-batches averaged',
        input: 'gradient_accumulation([np.array([1.0, 2.0]), np.array([3.0, 4.0])], 2).tolist()',
        expected: '[2.0, 3.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Single micro-batch returns itself',
        input: 'gradient_accumulation([np.array([5.0, 6.0])], 1).tolist()',
        expected: '[5.0, 6.0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Four micro-batches',
        input: 'gradient_accumulation([np.array([1.0]), np.array([2.0]), np.array([3.0]), np.array([4.0])], 4).tolist()',
        expected: '[2.5]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Shape preserved with 2D gradients',
        input: 'gradient_accumulation([np.ones((3, 4)), np.ones((3, 4))], 2).shape',
        expected: '(3, 4)',
        hidden: true,
      },
    ],
    hints: [
      'Initialize an accumulator with np.zeros_like',
      'Sum all gradient arrays, then divide by accumulation_steps',
    ],
    solution: `import numpy as np

def gradient_accumulation(micro_batches_grads, accumulation_steps):
    accumulated = np.zeros_like(micro_batches_grads[0])
    for grad in micro_batches_grads[:accumulation_steps]:
        accumulated += grad
    return accumulated / accumulation_steps
`,
  },
  {
    id: 'instance-norm',
    title: 'Instance Normalization',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Instance Normalization

Normalize per-sample per-channel over spatial dims (H, W). Used in style transfer and GANs.

### Formula
\`\`\`
x_norm[n, c] = (x[n, c] - mean) / sqrt(var + eps)
out[n, c] = gamma[c] * x_norm[n, c] + beta[c]
\`\`\`
    `,
    examples: [
      {
        input: 'x shape (2, 3, 4, 4), gamma (3,), beta (3,)',
        output: 'Normalized output shape (2, 3, 4, 4)',
        explanation: 'Each sample-channel pair normalized independently',
      },
    ],
    starterCode: `import numpy as np

def instance_norm(x, gamma, beta, eps=1e-5):
    """
    Instance normalization for 4D input.

    Args:
        x: Input (N, C, H, W)
        gamma: Scale parameter (C,)
        beta: Shift parameter (C,)
        eps: Numerical stability constant

    Returns:
        Normalized output (N, C, H, W)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape preserved',
        input: 'instance_norm(np.random.randn(2, 3, 4, 4), np.ones(3), np.zeros(3)).shape',
        expected: '(2, 3, 4, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Per-channel mean near zero',
        input: `(lambda: (
    x := np.random.randn(2, 3, 8, 8),
    out := instance_norm(x, np.ones(3), np.zeros(3)),
    bool(np.allclose(out.mean(axis=(2, 3)), 0, atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Per-channel variance near 1',
        input: `(lambda: (
    x := np.random.randn(2, 3, 8, 8),
    out := instance_norm(x, np.ones(3), np.zeros(3)),
    bool(np.allclose(out.var(axis=(2, 3)), 1, atol=0.15))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Beta shifts output mean',
        input: `(lambda: (
    x := np.random.randn(2, 3, 4, 4),
    out := instance_norm(x, np.ones(3), np.array([1.0, 2.0, 3.0])),
    bool(np.allclose(out.mean(axis=(2, 3)), np.array([[1, 2, 3], [1, 2, 3]]), atol=0.15))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Compute mean and variance over spatial dims (axis 2 and 3)',
      'Use keepdims=True for broadcasting',
      'Reshape gamma and beta to (1, C, 1, 1)',
    ],
    solution: `import numpy as np

def instance_norm(x, gamma, beta, eps=1e-5):
    N, C, H, W = x.shape
    mean = np.mean(x, axis=(2, 3), keepdims=True)
    var = np.var(x, axis=(2, 3), keepdims=True)
    x_norm = (x - mean) / np.sqrt(var + eps)
    gamma = gamma.reshape(1, C, 1, 1)
    beta = beta.reshape(1, C, 1, 1)
    return gamma * x_norm + beta
`,
  },
  {
    id: 'vit-patch-embeddings',
    title: 'ViT Patch Embeddings',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Vision Transformer (ViT) Patch Embeddings

Convert an image into patch embeddings: split into patches, flatten, project, prepend CLS token, add positional embeddings.

### Output Shape
(num_patches + 1, embed_dim) where num_patches = (H/P) * (W/P)
    `,
    examples: [
      {
        input: 'image (3, 8, 8), patch_size=4, embed_dim=16',
        output: 'Shape: (5, 16) -- 4 patches + 1 CLS token',
        explanation: '8/4 = 2 per side, 2*2=4 patches + CLS',
      },
    ],
    starterCode: `import numpy as np

def patch_embed(image, patch_size, embed_dim, W_proj, cls_token, pos_embed):
    """
    Create ViT patch embeddings.

    Args:
        image: Input image (C, H, W)
        patch_size: Size of each square patch
        embed_dim: Dimension of embeddings
        W_proj: Projection matrix (C*patch_size*patch_size, embed_dim)
        cls_token: CLS token embedding (embed_dim,)
        pos_embed: Positional embeddings (num_patches+1, embed_dim)

    Returns:
        Embeddings (num_patches + 1, embed_dim)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape correct',
        input: `(lambda: (
    np.random.seed(42),
    img := np.random.randn(3, 8, 8),
    W := np.random.randn(3*4*4, 16),
    cls := np.random.randn(16),
    pos := np.random.randn(5, 16),
    patch_embed(img, 4, 16, W, cls, pos).shape
)[-1])()`,
        expected: '(5, 16)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Correct patch count for 16x16 image',
        input: `(lambda: (
    np.random.seed(42),
    img := np.random.randn(3, 16, 16),
    n := (16//4) * (16//4),
    W := np.random.randn(48, 32),
    cls := np.random.randn(32),
    pos := np.random.randn(n + 1, 32),
    patch_embed(img, 4, 32, W, cls, pos).shape[0]
)[-1])()`,
        expected: '17',
        hidden: false,
      },
      {
        id: '3',
        description: 'Output is finite',
        input: `(lambda: (
    np.random.seed(42),
    img := np.random.randn(3, 8, 8),
    W := np.random.randn(48, 16),
    cls := np.random.randn(16),
    pos := np.random.randn(5, 16),
    bool(np.all(np.isfinite(patch_embed(img, 4, 16, W, cls, pos))))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Embedding dimension correct',
        input: `(lambda: (
    np.random.seed(42),
    img := np.random.randn(3, 8, 8),
    W := np.random.randn(48, 64),
    cls := np.random.randn(64),
    pos := np.random.randn(5, 64),
    patch_embed(img, 4, 64, W, cls, pos).shape[1]
)[-1])()`,
        expected: '64',
        hidden: true,
      },
    ],
    hints: [
      'Extract patches with nested loops over (H/P) and (W/P)',
      'Flatten each patch and project: patch.flatten() @ W_proj',
      'Use np.vstack to prepend the CLS token',
    ],
    solution: `import numpy as np

def patch_embed(image, patch_size, embed_dim, W_proj, cls_token, pos_embed):
    C, H, W_img = image.shape
    nph = H // patch_size
    npw = W_img // patch_size
    patches = []
    for i in range(nph):
        for j in range(npw):
            patch = image[:, i*patch_size:(i+1)*patch_size, j*patch_size:(j+1)*patch_size]
            patches.append(patch.flatten())
    patches = np.array(patches)
    embeddings = patches @ W_proj
    embeddings = np.vstack([cls_token.reshape(1, -1), embeddings])
    return embeddings + pos_embed
`,
  },
  {
    id: 'cross-attention',
    title: 'Cross-Attention',
    section: 'pytorch-basics',
    difficulty: 'hard',
    description: `
## Cross-Attention

Q from one sequence, K/V from another (different lengths). Used in transformer decoders and Stable Diffusion.

### Formula
\`\`\`
scores = (Q @ K.T) / sqrt(d_k)
weights = softmax(scores)
output = weights @ V
\`\`\`
    `,
    examples: [
      {
        input: 'Q (4, 8), K (6, 8), V (6, 16)',
        output: 'Shape (4, 16)',
        explanation: 'Output seq_len matches Q, feature dim matches V',
      },
    ],
    starterCode: `import numpy as np

def cross_attention(Q, K, V):
    """
    Cross-attention mechanism.

    Args:
        Q: Queries (seq_len_q, d_k)
        K: Keys (seq_len_kv, d_k)
        V: Values (seq_len_kv, d_v)

    Returns:
        output: (seq_len_q, d_v)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape matches (seq_q, d_v)',
        input: 'cross_attention(np.random.randn(4, 8), np.random.randn(6, 8), np.random.randn(6, 16)).shape',
        expected: '(4, 16)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Different Q and KV lengths',
        input: 'cross_attention(np.random.randn(3, 8), np.random.randn(10, 8), np.random.randn(10, 8)).shape',
        expected: '(3, 8)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Output is finite',
        input: 'bool(np.all(np.isfinite(cross_attention(np.random.randn(4, 16), np.random.randn(6, 16), np.random.randn(6, 32)))))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Single query',
        input: 'cross_attention(np.random.randn(1, 8), np.random.randn(5, 8), np.random.randn(5, 4)).shape',
        expected: '(1, 4)',
        hidden: true,
      },
    ],
    hints: [
      'Compute scores: Q @ K.T / sqrt(d_k)',
      'Apply softmax along the last axis',
      'Multiply attention weights by V',
    ],
    solution: `import numpy as np

def cross_attention(Q, K, V):
    d_k = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)
    weights = np.exp(scores - np.max(scores, axis=-1, keepdims=True))
    weights = weights / np.sum(weights, axis=-1, keepdims=True)
    return weights @ V
`,
  },
  {
    id: 'depthwise-separable-conv',
    title: 'Depthwise Separable Convolution',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Depthwise Separable Convolution

Used in MobileNet. Two steps:
1. **Depthwise**: Each channel convolved independently
2. **Pointwise**: 1x1 convolution to mix channels

Parameter savings: C_in*K*K + C_in*C_out vs C_in*C_out*K*K
    `,
    examples: [
      {
        input: 'x (3, 8, 8), dw_kernel (3, 3, 3)',
        output: 'depthwise: (3, 6, 6)',
        explanation: 'Each channel convolved with its own 3x3 filter',
      },
    ],
    starterCode: `import numpy as np

def depthwise_conv(x, kernel):
    """
    Depthwise convolution.

    Args:
        x: Input (C, H, W)
        kernel: Filters (C, kH, kW)

    Returns:
        Output (C, H-kH+1, W-kW+1)
    """
    # Your code here
    pass

def pointwise_conv(x, kernel):
    """
    Pointwise (1x1) convolution.

    Args:
        x: Input (C_in, H, W)
        kernel: Filters (C_out, C_in, 1, 1)

    Returns:
        Output (C_out, H, W)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Depthwise output shape',
        input: 'depthwise_conv(np.random.randn(3, 8, 8), np.random.randn(3, 3, 3)).shape',
        expected: '(3, 6, 6)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Pointwise output shape',
        input: 'pointwise_conv(np.random.randn(3, 6, 6), np.random.randn(16, 3, 1, 1)).shape',
        expected: '(16, 6, 6)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Depthwise preserves channels',
        input: 'depthwise_conv(np.random.randn(8, 5, 5), np.random.randn(8, 3, 3)).shape[0]',
        expected: '8',
        hidden: true,
      },
      {
        id: '4',
        description: 'Depthwise known values',
        input: `(lambda: (
    x := np.ones((1, 3, 3)),
    k := np.ones((1, 2, 2)),
    round(float(depthwise_conv(x, k)[0, 0, 0]), 1)
)[-1])()`,
        expected: '4.0',
        hidden: true,
      },
    ],
    hints: [
      'Depthwise: loop over channels, each gets its own filter',
      'For each position, sum(input_patch * kernel)',
      'Pointwise: linear combination of channels at each spatial position',
    ],
    solution: `import numpy as np

def depthwise_conv(x, kernel):
    C, H, W = x.shape
    _, kH, kW = kernel.shape
    out_H = H - kH + 1
    out_W = W - kW + 1
    output = np.zeros((C, out_H, out_W))
    for c in range(C):
        for i in range(out_H):
            for j in range(out_W):
                output[c, i, j] = np.sum(x[c, i:i+kH, j:j+kW] * kernel[c])
    return output

def pointwise_conv(x, kernel):
    C_out = kernel.shape[0]
    C, H, W = x.shape
    output = np.zeros((C_out, H, W))
    for co in range(C_out):
        for c in range(C):
            output[co] += x[c] * kernel[co, c, 0, 0]
    return output
`,
  },
  {
    id: 'label-smoothing',
    title: 'Label Smoothing',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Label Smoothing

Cross-entropy with softened targets to prevent overconfidence.

### Formula
\`\`\`
smooth = (1 - eps) * one_hot + eps / num_classes
loss = -mean(sum(smooth * log(softmax(logits))))
\`\`\`
    `,
    examples: [
      {
        input: 'logits [[2, 1, 0.1]], targets [0], smoothing 0.1',
        output: 'Loss slightly higher than standard CE',
        explanation: 'Smoothed labels prevent overconfident predictions',
      },
    ],
    starterCode: `import numpy as np

def label_smoothing_loss(logits, targets, num_classes, smoothing=0.1):
    """
    Cross-entropy loss with label smoothing.

    Args:
        logits: Raw scores (batch, num_classes)
        targets: Integer labels (batch,)
        num_classes: Total classes
        smoothing: Epsilon

    Returns:
        Scalar loss (float)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Smoothing=0 equals standard CE',
        input: `(lambda: (
    logits := np.array([[2.0, 1.0, 0.1]]),
    targets := np.array([0]),
    loss_s := label_smoothing_loss(logits, targets, 3, 0.0),
    exp_x := np.exp(logits - np.max(logits)),
    probs := exp_x / np.sum(exp_x),
    loss_std := float(-np.log(probs[0, 0])),
    bool(abs(loss_s - loss_std) < 0.001)
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Smoothing increases loss',
        input: `(lambda: (
    logits := np.array([[5.0, 0.0, 0.0]]),
    targets := np.array([0]),
    l0 := label_smoothing_loss(logits, targets, 3, 0.0),
    l1 := label_smoothing_loss(logits, targets, 3, 0.1),
    bool(l1 > l0)
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Returns float',
        input: "type(label_smoothing_loss(np.array([[1.0, 2.0]]), np.array([0]), 2, 0.1)).__name__",
        expected: 'float',
        hidden: true,
      },
      {
        id: '4',
        description: 'Batch of multiple samples',
        input: `(lambda: (
    loss := label_smoothing_loss(np.array([[2.0, 1.0], [1.0, 2.0]]), np.array([0, 1]), 2, 0.1),
    bool(loss > 0)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Compute softmax (subtract max for stability)',
      'Smooth: (1-eps)*one_hot + eps/num_classes',
      'CE: -sum(smooth * log(probs))',
    ],
    solution: `import numpy as np

def label_smoothing_loss(logits, targets, num_classes, smoothing=0.1):
    exp_x = np.exp(logits - np.max(logits, axis=-1, keepdims=True))
    probs = exp_x / np.sum(exp_x, axis=-1, keepdims=True)
    probs = np.clip(probs, 1e-15, 1 - 1e-15)
    one_hot = np.zeros_like(logits)
    one_hot[np.arange(len(targets)), targets] = 1.0
    smooth_targets = (1 - smoothing) * one_hot + smoothing / num_classes
    loss = -np.sum(smooth_targets * np.log(probs), axis=-1)
    return float(np.mean(loss))
`,
  },
  {
    id: 'lora-adapter',
    title: 'LoRA Adapter',
    section: 'pytorch-basics',
    difficulty: 'hard',
    description: `
## LoRA (Low-Rank Adaptation)

Parameter-efficient fine-tuning: learn A (d_in, r) and B (r, d_out) instead of updating full W.

### Forward
\`\`\`
output = x @ W + (alpha / r) * x @ A @ B
\`\`\`

For d=4096, r=8: 99.6% fewer trainable parameters!
    `,
    examples: [
      {
        input: 'x (2, 768), W (768, 768), A (768, 8), B (8, 768)',
        output: 'Shape (2, 768)',
        explanation: 'Base output + scaled low-rank adaptation',
      },
    ],
    starterCode: `import numpy as np

def lora_forward(x, W, A, B, alpha, r):
    """
    LoRA forward pass.

    Args:
        x: Input (batch, in_features)
        W: Frozen weights (in_features, out_features)
        A: Down-projection (in_features, r)
        B: Up-projection (r, out_features)
        alpha: Scaling factor
        r: Rank

    Returns:
        Output (batch, out_features)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape correct',
        input: 'lora_forward(np.random.randn(2, 16), np.random.randn(16, 16), np.random.randn(16, 4), np.random.randn(4, 16), 8, 4).shape',
        expected: '(2, 16)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Alpha=0 gives base output',
        input: `(lambda: (
    np.random.seed(42),
    x := np.random.randn(2, 8),
    W := np.random.randn(8, 8),
    A := np.random.randn(8, 2),
    B := np.random.randn(2, 8),
    bool(np.allclose(x @ W, lora_forward(x, W, A, B, 0, 2)))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'LoRA modifies output when alpha > 0',
        input: `(lambda: (
    np.random.seed(42),
    x := np.random.randn(2, 8),
    W := np.random.randn(8, 8),
    A := np.random.randn(8, 2),
    B := np.random.randn(2, 8),
    bool(not np.allclose(x @ W, lora_forward(x, W, A, B, 4, 2)))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Different input/output dims',
        input: 'lora_forward(np.random.randn(3, 64), np.random.randn(64, 32), np.random.randn(64, 4), np.random.randn(4, 32), 8, 4).shape',
        expected: '(3, 32)',
        hidden: true,
      },
    ],
    hints: [
      'Base: x @ W',
      'LoRA: (alpha / r) * x @ A @ B',
      'Return base + lora',
    ],
    solution: `import numpy as np

def lora_forward(x, W, A, B, alpha, r):
    base_output = x @ W
    lora_output = (alpha / r) * (x @ A @ B)
    return base_output + lora_output
`,
  },
  {
    id: 'gradient-checkpointing',
    title: 'Gradient Checkpointing',
    section: 'pytorch-basics',
    difficulty: 'hard',
    description: `
## Gradient Checkpointing

Trade compute for memory: only save activations at checkpoint layers, recompute the rest during backward pass.

### Memory: O(sqrt(n)) instead of O(n)

### Task
1. Forward pass saving only checkpoint activations
2. Recompute any activation from nearest prior checkpoint
    `,
    examples: [
      {
        input: '4 layers, checkpoints at [1, 3]',
        output: '3 activations saved (input + 2 checkpoints)',
        explanation: 'Layers 0 and 2 recomputed when needed',
      },
    ],
    starterCode: `import numpy as np

def checkpoint_forward(layers, x, checkpoint_indices):
    """
    Forward pass with selective activation saving.

    Args:
        layers: List of layer functions
        x: Input array
        checkpoint_indices: Layer indices to save

    Returns:
        output: Final output
        saved: Dict mapping index -> activation (-1 for input)
    """
    # Your code here
    pass

def checkpoint_recompute(layers, saved_activations, checkpoint_indices, layer_idx):
    """
    Recompute activation at layer_idx from nearest prior checkpoint.

    Args:
        layers: List of layer functions
        saved_activations: Dict of saved activations
        checkpoint_indices: Saved indices
        layer_idx: Target layer

    Returns:
        Activation at layer_idx
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output matches regular forward',
        input: `(lambda: (
    layers := [lambda x: x * 2, lambda x: x + 1, lambda x: x * 3],
    x := np.array([1.0]),
    regular := np.array([1.0]),
    [regular := l(regular) for l in layers],
    result := checkpoint_forward(layers, x, [1]),
    bool(np.allclose(result[0], regular))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Only checkpoint activations saved',
        input: `(lambda: (
    layers := [lambda x: x * 2, lambda x: x + 1, lambda x: x * 3, lambda x: x - 1],
    x := np.array([1.0]),
    result := checkpoint_forward(layers, x, [1, 3]),
    sorted(result[1].keys()) == [-1, 1, 3]
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Recompute gives correct activation',
        input: `(lambda: (
    layers := [lambda x: x * 2, lambda x: x + 1, lambda x: x * 3],
    x := np.array([1.0]),
    result := checkpoint_forward(layers, x, [0]),
    recomputed := checkpoint_recompute(layers, result[1], [0], 1),
    bool(np.allclose(recomputed, np.array([3.0])))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Input always saved as index -1',
        input: `(lambda: (
    layers := [lambda x: x + 1],
    x := np.array([5.0]),
    result := checkpoint_forward(layers, x, []),
    bool(-1 in result[1])
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Always save input at index -1',
      'Iterate layers, save activation only at checkpoint indices',
      'Recompute: find nearest checkpoint before target, run forward from there',
    ],
    solution: `import numpy as np

def checkpoint_forward(layers, x, checkpoint_indices):
    saved = {}
    saved[-1] = x.copy()
    activation = x
    for i, layer in enumerate(layers):
        activation = layer(activation)
        if i in checkpoint_indices:
            saved[i] = activation.copy()
    return activation, saved

def checkpoint_recompute(layers, saved_activations, checkpoint_indices, layer_idx):
    checkpoints = sorted([k for k in saved_activations.keys() if k < layer_idx])
    start_checkpoint = checkpoints[-1]
    activation = saved_activations[start_checkpoint].copy()
    for i in range(start_checkpoint + 1, layer_idx + 1):
        activation = layers[i](activation)
    return activation
`,
  },
];
