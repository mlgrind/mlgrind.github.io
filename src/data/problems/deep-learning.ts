import { Problem } from '../../types';

export const deepLearningProblems: Problem[] = [
  {
    id: 'perceptron',
    title: 'ReLU Activation',
    section: 'deep-learning',
    difficulty: 'easy',
    description: `
## ReLU Activation Function

Implement the Rectified Linear Unit (ReLU) activation function, one of the most popular activation functions in deep learning.

### Formula
\`\`\`
ReLU(x) = max(0, x)
\`\`\`

### Properties
- Output is x if x > 0, else 0
- Helps with vanishing gradient problem
- Computationally efficient

### Function Signature
\`\`\`python
def relu(x: np.ndarray) -> np.ndarray:
\`\`\`
    `,
    examples: [
      {
        input: 'np.array([-2, -1, 0, 1, 2])',
        output: '[0, 0, 0, 1, 2]',
        explanation: 'Negative values become 0, positive values unchanged',
      },
    ],
    starterCode: `import numpy as np

def relu(x: np.ndarray) -> np.ndarray:
    """
    Apply ReLU activation function.

    Args:
        x: Input array of any shape

    Returns:
        Array with ReLU applied element-wise
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Mixed values',
        input: '[-2, -1, 0, 1, 2]',
        expected: '[0, 0, 0, 1, 2]',
        hidden: false,
      },
      {
        id: '2',
        description: 'All negative',
        input: '[-5, -3, -1]',
        expected: '[0, 0, 0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'All positive',
        input: '[1, 2, 3]',
        expected: '[1, 2, 3]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Output shape matches input shape (2D)',
        input: 'relu(np.array([[-1, 2], [3, -4]])).shape',
        expected: '(2, 2)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Zeros remain zero',
        input: 'relu(np.array([0, 0, 0])).tolist()',
        expected: '[0, 0, 0]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Large negative values clipped to zero',
        input: 'bool(np.all(relu(np.array([-1000, -0.001, -1e-10])) == 0))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'Positive values unchanged',
        input: 'bool(np.allclose(relu(np.array([0.5, 1.5, 100.0])), [0.5, 1.5, 100.0]))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Use np.maximum() to compare with 0.',
      'Alternatively, use boolean indexing or np.where().',
    ],
    solution: `import numpy as np

def relu(x: np.ndarray) -> np.ndarray:
    """
    Apply ReLU activation function.
    """
    return np.maximum(0, x)
`,
  },
  {
    id: 'neural-network-forward',
    title: 'Dense Layer Forward Pass',
    section: 'deep-learning',
    difficulty: 'medium',
    description: `
## Dense Layer Forward Pass

Implement the forward pass of a fully-connected (dense) neural network layer.

### Formula
\`\`\`
output = activation(X @ W + b)
\`\`\`

Where:
- X: Input of shape (batch_size, input_dim)
- W: Weights of shape (input_dim, output_dim)
- b: Bias of shape (output_dim,)

### Function Signature
\`\`\`python
def dense_forward(X: np.ndarray, W: np.ndarray, b: np.ndarray) -> np.ndarray:
\`\`\`

Use ReLU as the activation function.
    `,
    examples: [
      {
        input: 'X = [[1, 2]], W = [[1, 0], [0, 1]], b = [1, 1]',
        output: '[[2, 3]]',
        explanation: 'X @ W = [[1, 2]], + b = [[2, 3]], ReLU keeps positive',
      },
    ],
    starterCode: `import numpy as np

def dense_forward(X: np.ndarray, W: np.ndarray, b: np.ndarray) -> np.ndarray:
    """
    Compute forward pass of a dense layer with ReLU activation.

    Args:
        X: Input of shape (batch_size, input_dim)
        W: Weights of shape (input_dim, output_dim)
        b: Bias of shape (output_dim,)

    Returns:
        Output of shape (batch_size, output_dim)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Basic forward pass',
        input: '([[1, 2]], [[1, 0], [0, 1]], [1, 1])',
        expected: '[[2, 3]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'With negative pre-activation',
        input: '([[1, 1]], [[1, -2], [-1, 1]], [0, 0])',
        expected: '[[0, 0]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Batch of 2',
        input: '([[1, 0], [0, 1]], [[2, 0], [0, 2]], [0, 0])',
        expected: '[[2, 0], [0, 2]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Output shape is (batch_size, output_dim)',
        input: 'dense_forward(np.ones((4, 3)), np.ones((3, 5)), np.zeros(5)).shape',
        expected: '(4, 5)',
        hidden: true,
      },
      {
        id: '5',
        description: 'ReLU clips negative pre-activations',
        input: 'dense_forward(np.array([[1, 1]]), np.array([[-3, 2], [-3, 2]]), np.array([0, 0])).tolist()',
        expected: '[[0, 4]]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Bias is correctly added',
        input: 'dense_forward(np.zeros((1, 2)), np.ones((2, 2)), np.array([3, -1])).tolist()',
        expected: '[[3.0, 0.0]]',
        hidden: true,
      },
      {
        id: '7',
        description: 'Known weights exact output',
        input: 'bool(np.allclose(dense_forward(np.array([[2, 3]]), np.array([[1, -1], [1, -1]]), np.array([1, 1])), [[6, 0]]))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'First compute the linear transformation: Z = X @ W + b',
      'Then apply ReLU: output = max(0, Z)',
    ],
    solution: `import numpy as np

def dense_forward(X: np.ndarray, W: np.ndarray, b: np.ndarray) -> np.ndarray:
    """
    Compute forward pass of a dense layer with ReLU activation.
    """
    # Linear transformation
    Z = np.dot(X, W) + b
    # ReLU activation
    return np.maximum(0, Z)
`,
  },
  {
    id: 'backpropagation',
    title: 'Softmax Function',
    section: 'deep-learning',
    difficulty: 'medium',
    description: `
## Softmax Function

Implement the softmax function, used to convert raw scores to probabilities in multi-class classification.

### Formula
\`\`\`
softmax(x)_i = exp(x_i) / sum(exp(x_j))
\`\`\`

### Properties
- Output sums to 1
- All outputs are positive
- Larger inputs get larger probabilities

### Function Signature
\`\`\`python
def softmax(x: np.ndarray) -> np.ndarray:
\`\`\`

**Note**: For numerical stability, subtract max(x) before computing exp.
    `,
    examples: [
      {
        input: 'np.array([1, 2, 3])',
        output: '[0.090031, 0.244728, 0.665241]',
        explanation: 'Higher values get higher probabilities, sum = 1',
      },
    ],
    starterCode: `import numpy as np

def softmax(x: np.ndarray) -> np.ndarray:
    """
    Compute softmax probabilities.

    Args:
        x: Input array (1D)

    Returns:
        Array of same shape with softmax probabilities
    """
    # Your code here
    # Hint: subtract max for numerical stability
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Basic softmax',
        input: 'bool(np.allclose(softmax(np.array([1, 2, 3])), [0.090031, 0.244728, 0.665241], atol=1e-5))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Equal inputs',
        input: 'bool(np.allclose(softmax(np.array([1, 1, 1])), [0.333333, 0.333333, 0.333333], atol=1e-5))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Large values',
        input: 'bool(np.allclose(softmax(np.array([100, 101, 102])), [0.090031, 0.244728, 0.665241], atol=1e-5))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Output sums to 1',
        input: 'bool(np.allclose(np.sum(softmax(np.array([2, 5, -1, 0.5]))), 1.0))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'All outputs are positive',
        input: 'bool(np.all(softmax(np.array([-10, -20, -30])) > 0))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Single dominant value gets highest probability',
        input: 'bool(np.argmax(softmax(np.array([0, 0, 10, 0]))) == 2)',
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'Numerical stability with very large values',
        input: 'bool(np.allclose(np.sum(softmax(np.array([1000, 1001, 1002]))), 1.0))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Subtract the max value for numerical stability.',
      'Compute exp of each element.',
      'Divide by the sum of all exp values.',
    ],
    solution: `import numpy as np

def softmax(x: np.ndarray) -> np.ndarray:
    """
    Compute softmax probabilities.
    """
    # Subtract max for numerical stability
    x_shifted = x - np.max(x)
    exp_x = np.exp(x_shifted)
    return exp_x / np.sum(exp_x)
`,
  },
];
