import { Problem } from '../../types';

export const pytorchBasicsProblems: Problem[] = [
  {
    id: 'tensor-creation',
    title: 'Tensor Creation',
    section: 'pytorch-basics',
    difficulty: 'easy',
    description: `
## Tensor Creation

**What you'll build:** \`create_tensors()\`, which returns a dictionary of eight tensors made with the standard creation functions.

### Background
Every model starts from tensors: weights from random normals, biases from zeros, position indices from \`arange\`, masks from \`eye\` or \`full\`. PyTorch's creation API mirrors NumPy's almost one to one, with two differences worth memorising:
- **Sizes**: PyTorch takes them as separate arguments (\`torch.zeros(3, 4)\`), NumPy as a tuple (\`np.zeros((3, 4))\`). Both accept a tuple.
- **Default dtypes**: PyTorch makes floats \`float32\` and integers \`int64\`; NumPy makes floats \`float64\`. Mixing the two is a classic source of dtype errors.

### API Reference
| Key | PyTorch | NumPy |
|-----|---------|-------|
| \`'from_list'\` | \`torch.tensor([1, 2, 3, 4], dtype=torch.float32)\` | \`np.array([1, 2, 3, 4], dtype=np.float32)\` |
| \`'zeros'\` | \`torch.zeros(3, 4)\` | \`np.zeros((3, 4))\` |
| \`'ones'\` | \`torch.ones(2, 3)\` | \`np.ones((2, 3))\` |
| \`'randn'\` | \`torch.randn(2, 3)\` | \`np.random.randn(2, 3)\` |
| \`'arange'\` | \`torch.arange(10)\` | \`np.arange(10)\` |
| \`'linspace'\` | \`torch.linspace(0, 1, 5)\` | \`np.linspace(0, 1, 5)\` |
| \`'eye'\` | \`torch.eye(4)\` | \`np.eye(4)\` |
| \`'full'\` | \`torch.full((2, 3), 7.0)\` | \`np.full((2, 3), 7.0)\` |

### Expected Return Format
Return a dictionary with these keys:
- \`'from_list'\`: the values \`[1, 2, 3, 4]\` with dtype **float32**, shape \`(4,)\`
- \`'zeros'\`: zeros, shape \`(3, 4)\`
- \`'ones'\`: ones, shape \`(2, 3)\`
- \`'randn'\`: standard-normal samples, shape \`(2, 3)\`
- \`'arange'\`: the integers \`0, 1, ..., 9\`, shape \`(10,)\`
- \`'linspace'\`: 5 evenly spaced values from 0 to 1 inclusive: \`[0.0, 0.25, 0.5, 0.75, 1.0]\`
- \`'eye'\`: the 4x4 identity matrix
- \`'full'\`: shape \`(2, 3)\`, every entry \`7.0\`

### Conventions
- The starter code seeds the generator with 42 (\`torch.manual_seed(42)\` or \`np.random.seed(42)\`). Keep that line, so \`'randn'\` is reproducible: two calls to \`create_tensors()\` must return the same values.
- Only \`'from_list'\` needs an explicit dtype; the others use the library defaults.

### Constraints
Use the creation functions in the table; no Python loops.

### Follow-up
- \`torch.tensor(arr)\` copies its input, while \`torch.from_numpy(arr)\` shares memory with the NumPy array. When does that matter?
- Why does \`torch.arange(0, 1, 0.1)\` sometimes give a surprising number of elements, and why is \`linspace\` safer for float ranges?
    `,
    examples: [
      {
        input: 'r = create_tensors(); r["linspace"]',
        output: 'array([0.  , 0.25, 0.5 , 0.75, 1.  ])',
        explanation: 'linspace includes both endpoints, so 5 points are spaced 0.25 apart.',
      },
      {
        input: 'r["from_list"].dtype, r["zeros"].shape, r["arange"][-1]',
        output: '(dtype(\'float32\'), (3, 4), 9)',
        explanation: 'from_list asks for float32 explicitly; arange stops before 10.',
      },
    ],
    starterCode: `import numpy as np

def create_tensors() -> dict:
    """
    Create tensors with the standard creation functions.

    Returns:
        dict with keys 'from_list' (float32 [1, 2, 3, 4]), 'zeros' (3, 4),
        'ones' (2, 3), 'randn' (2, 3), 'arange' (0..9), 'linspace'
        (5 values from 0 to 1), 'eye' (4x4 identity) and 'full' ((2, 3) of 7.0)
    """
    np.random.seed(42)  # keep: makes 'randn' reproducible

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
      {
        id: '3',
        description: 'from_list is float32 with the right values',
        input: '(lambda t: (str(t.dtype), t.tolist()))(create_tensors()["from_list"])',
        expected: "('float32', [1.0, 2.0, 3.0, 4.0])",
        hidden: true,
      },
      {
        id: '4',
        description: 'full, linspace and arange values',
        input: '(lambda r: (r["full"].tolist(), r["linspace"].tolist(), r["arange"].tolist()))(create_tensors())',
        expected: '([[7.0, 7.0, 7.0], [7.0, 7.0, 7.0]], [0.0, 0.25, 0.5, 0.75, 1.0], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])',
        hidden: true,
      },
      {
        id: '5',
        description: 'randn is the first draw after seeding with 42; eye is the identity',
        input: 'bool(np.allclose(create_tensors()["randn"], np.random.RandomState(42).randn(2, 3)) and np.array_equal(create_tensors()["eye"], np.eye(4)))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'zeros and ones contain the right values',
        input: '(lambda r: (float(r["zeros"].sum()), float(r["ones"].sum()), r["ones"].shape))(create_tensors())',
        expected: '(0.0, 6.0, (2, 3))',
        hidden: true,
      },
    ],
    hints: [
      'Each key maps to one creation function; the table in the description names them all.',
      'Sizes: np.zeros((3, 4)) takes a tuple, np.random.randn(2, 3) takes separate integers.',
      'np.array([1, 2, 3, 4], dtype=np.float32) sets the dtype; np.linspace(0, 1, 5) includes both endpoints; np.full((2, 3), 7.0) fills with one value.',
      'Keep np.random.seed(42) before np.random.randn, otherwise "randn" changes on every call.',
    ],
    solution: `import numpy as np

def create_tensors() -> dict:
    """
    Create tensors with the standard creation functions.

    Returns:
        dict of the eight named arrays described in the problem
    """
    np.random.seed(42)  # reproducible 'randn'

    return {
        'from_list': np.array([1, 2, 3, 4], dtype=np.float32),
        'zeros': np.zeros((3, 4)),
        'ones': np.ones((2, 3)),
        'randn': np.random.randn(2, 3),      # standard normal
        'arange': np.arange(10),             # 0..9, end excluded
        'linspace': np.linspace(0, 1, 5),    # both endpoints included
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
## Tensor Operations

**What you'll build:** \`tensor_ops(x, y)\`, which applies the everyday arithmetic, reduction and shape operations to two \`(2, 3)\` tensors and returns the results in a dictionary.

### Background
Most model code is a handful of operations: element-wise arithmetic, reductions over a dimension (\`sum\`, \`mean\`, \`max\`) and reshapes. PyTorch and NumPy share almost all of it; the differences that bite are the keyword names and defaults:

| Concept | PyTorch | NumPy |
|---------|---------|-------|
| Reduce over a dimension | \`x.sum(dim=0)\` | \`x.sum(axis=0)\` |
| Keep the reduced dimension | \`keepdim=True\` | \`keepdims=True\` |
| Standard deviation | \`x.std()\` is **unbiased** (divides by n-1) | \`x.std()\` divides by n |
| Add a size-1 dimension | \`x.unsqueeze(0)\` | \`np.expand_dims(x, 0)\` or \`x[None]\` |
| Reshape | \`x.view(3, 2)\` / \`x.reshape(3, 2)\` | \`x.reshape(3, 2)\` |

### Inputs
- \`x\`, \`y\`: tensors of shape \`(2, 3)\`. \`y\` has no zeros.

### Expected Return Format
Return a dictionary with these keys:
- **Arithmetic** (shape \`(2, 3)\`): \`'add'\` = x + y, \`'sub'\` = x - y, \`'mul'\` = x * y (element-wise), \`'div'\` = x / (y + 1e-8), \`'pow'\` = x ** 2
- **Reductions**:
  - \`'sum_all'\`: sum of every element (scalar)
  - \`'sum_axis0'\`: sum over dim 0 (down the rows), shape \`(3,)\`
  - \`'sum_axis1'\`: sum over dim 1 (along each row), shape \`(2,)\`
  - \`'mean'\`: mean of every element (scalar)
  - \`'std'\`: **population** standard deviation of every element (divide by n, not n - 1)
  - \`'max'\`: largest element (scalar)
  - \`'argmax'\`: index of the largest element in the **flattened** tensor (an integer from 0 to 5)
- **Shape ops**:
  - \`'reshape'\`: x as shape \`(3, 2)\`, keeping row-major order
  - \`'flatten'\`: x as shape \`(6,)\`
  - \`'unsqueeze'\`: x with a new leading dimension, shape \`(1, 2, 3)\`
  - \`'squeeze'\`: the unsqueezed tensor with that dimension removed again, shape \`(2, 3)\`
  - \`'transpose'\`: x transposed, shape \`(3, 2)\`

### Edge Cases and Conventions
- The \`1e-8\` in \`'div'\` guards against division by zero; with the tests' inputs it changes nothing visible.
- \`'std'\` must use the population formula: \`sqrt(mean((x - mean(x)) ** 2))\`. In PyTorch pass \`unbiased=False\` (or \`correction=0\`).

### Constraints
Use built-in tensor operations; no Python loops.

### Follow-up
- \`view\` fails on a non-contiguous tensor (for example after \`.T\`) while \`reshape\` copies when it must. Why?
- What does \`x.sum(dim=0, keepdim=True)\` return, and why is it handy for broadcasting?
    `,
    examples: [
      {
        input: 'r = tensor_ops(np.array([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]), np.array([[1.0, 1.0, 1.0], [2.0, 2.0, 2.0]]))\nr["add"], r["sum_axis0"], r["sum_axis1"]',
        output: '(array([[2., 3., 4.], [6., 7., 8.]]), array([5., 7., 9.]), array([ 6., 15.]))',
        explanation: 'Dim 0 sums down the columns (3 values); dim 1 sums along each row (2 values).',
      },
      {
        input: 'round(float(r["std"]), 4), int(r["argmax"]), r["reshape"].tolist()',
        output: '(1.7078, 5, [[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]])',
        explanation: 'Population std of 1..6 is sqrt(35/12); the max (6.0) sits at flat index 5; reshape keeps row-major order.',
      },
    ],
    starterCode: `import numpy as np

def tensor_ops(x: np.ndarray, y: np.ndarray) -> dict:
    """
    Perform common tensor operations.

    Args:
        x: First tensor (2, 3)
        y: Second tensor (2, 3), no zeros

    Returns:
        dict with arithmetic keys 'add', 'sub', 'mul', 'div', 'pow';
        reductions 'sum_all', 'sum_axis0', 'sum_axis1', 'mean', 'std'
        (population), 'max', 'argmax' (flat index); and shape ops
        'reshape' (3, 2), 'flatten' (6,), 'unsqueeze' (1, 2, 3),
        'squeeze' (2, 3), 'transpose' (3, 2)
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
      {
        id: '3',
        description: 'Reductions along dims, population std and flat argmax',
        input: '(lambda r: (r["sum_axis0"].tolist(), r["sum_axis1"].tolist(), round(float(r["std"]), 4), int(r["argmax"]), float(r["sum_all"]), float(r["max"])))(tensor_ops(np.array([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]), np.array([[1.0, 1.0, 1.0], [2.0, 2.0, 2.0]])))',
        expected: '([5.0, 7.0, 9.0], [6.0, 15.0], 1.7078, 5, 21.0, 6.0)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Shape operations',
        input: '(lambda r: (r["reshape"].shape, r["flatten"].shape, r["unsqueeze"].shape, r["squeeze"].shape, r["transpose"].shape))(tensor_ops(np.ones((2, 3)), np.ones((2, 3))))',
        expected: '((3, 2), (6,), (1, 2, 3), (2, 3), (3, 2))',
        hidden: true,
      },
      {
        id: '5',
        description: 'Arithmetic and reshape values',
        input: '(lambda r: (r["reshape"].tolist(), np.round(r["div"], 4).tolist(), r["sub"].tolist(), r["mul"].tolist(), r["pow"].tolist()))(tensor_ops(np.array([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]), np.array([[1.0, 1.0, 1.0], [2.0, 2.0, 2.0]])))',
        expected: '([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]], [[1.0, 2.0, 3.0], [2.0, 2.5, 3.0]], [[0.0, 1.0, 2.0], [2.0, 3.0, 4.0]], [[1.0, 2.0, 3.0], [8.0, 10.0, 12.0]], [[1.0, 4.0, 9.0], [16.0, 25.0, 36.0]])',
        hidden: true,
      },
      {
        id: '6',
        description: 'Transpose and flatten keep the right element order',
        input: '(lambda r: (r["transpose"].tolist(), r["flatten"].tolist()))(tensor_ops(np.array([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]), np.ones((2, 3))))',
        expected: '([[1.0, 4.0], [2.0, 5.0], [3.0, 6.0]], [1.0, 2.0, 3.0, 4.0, 5.0, 6.0])',
        hidden: true,
      },
    ],
    hints: [
      'Group the keys: arithmetic is element-wise, reductions collapse dimensions, shape ops only rearrange the same six numbers.',
      'Arithmetic operators (+, -, *, /, **) work element-wise on same-shaped arrays; reductions are methods: x.sum(), x.mean(), x.std(), x.max(), x.argmax().',
      'Reduce one dimension with x.sum(axis=0) or x.sum(axis=1); add a leading dimension with np.expand_dims(x, 0) and remove it with np.squeeze(..., axis=0).',
      'np.std divides by n (population std), which is what "std" asks for. In PyTorch, x.std() divides by n - 1 unless you pass unbiased=False.',
    ],
    solution: `import numpy as np

def tensor_ops(x: np.ndarray, y: np.ndarray) -> dict:
    """
    Perform common tensor operations; see the description for every key.
    """
    unsqueezed = np.expand_dims(x, axis=0)   # (1, 2, 3)
    return {
        # Arithmetic (element-wise)
        'add': x + y,
        'sub': x - y,
        'mul': x * y,
        'div': x / (y + 1e-8),               # epsilon guards against division by zero
        'pow': x ** 2,

        # Reductions
        'sum_all': x.sum(),
        'sum_axis0': x.sum(axis=0),          # (3,)
        'sum_axis1': x.sum(axis=1),          # (2,)
        'mean': x.mean(),
        'std': x.std(),                      # population std (ddof=0)
        'max': x.max(),
        'argmax': x.argmax(),                # index into the flattened array

        # Shape ops
        'reshape': x.reshape(3, 2),
        'flatten': x.flatten(),
        'unsqueeze': unsqueezed,
        'squeeze': np.squeeze(unsqueezed, axis=0),  # back to (2, 3)
        'transpose': x.T,
    }
`,
  },
  {
    id: 'autograd-concepts',
    title: 'Autograd Basics',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Autograd Basics

**What you'll build:** two gradient computations: the derivative of a scalar polynomial, and the backward pass of a linear layer \`Y = X @ W + b\`.

### Background
Autograd records every operation of the forward pass in a graph, then walks it backwards applying the chain rule. In PyTorch you mark inputs with \`requires_grad=True\`, call \`.backward()\` and read \`.grad\`:

\`\`\`python
x = torch.tensor(2.0, requires_grad=True)
y = x ** 2 + 3 * x + 1
y.backward()
x.grad  # tensor(7.) because dy/dx = 2x + 3
\`\`\`

The **PyTorch track** uses autograd exactly like this. The **NumPy track** writes the same gradients by hand, which is what \`backward()\` computes under the hood and a favourite interview question.

### Formulas
**1. Scalar function.** For \`y = x² + 3x + 1\`: \`dy/dx = 2x + 3\`.

**2. Linear layer.** Forward: \`Y = X @ W + b\` with

| Symbol | Meaning | Shape |
|--------|---------|-------|
| \`X\` | input batch | \`(batch, in_features)\` |
| \`W\` | weights | \`(in_features, out_features)\` |
| \`b\` | bias, broadcast over the batch | \`(out_features,)\` |
| \`G\` = \`grad_output\` | upstream gradient dL/dY | \`(batch, out_features)\` |

Backward, given \`G\`:
\`\`\`text
dL/dW = X.T @ G          shape (in_features, out_features)
dL/db = G.sum(axis=0)    shape (out_features,)   (b was broadcast over the batch)
dL/dX = G @ W.T          shape (batch, in_features)
\`\`\`
A quick check that never fails: every gradient has the same shape as the tensor it belongs to, and there is only one way to multiply the available matrices to get that shape.

### Expected Return Format
- \`compute_gradients(x)\` returns \`{'y': float, 'grad': float}\`: the forward value and dy/dx.
- \`linear_layer_gradients(X, W, b, grad_output)\` returns a dict with \`'grad_W'\`, \`'grad_b'\` and \`'grad_X'\`, shaped like \`W\`, \`b\` and \`X\`.

### Constraints
- NumPy track: compute the gradients analytically with the formulas above.
- PyTorch track: let autograd do it (\`requires_grad=True\`, then \`.backward()\`; for the non-scalar \`Y\`, call \`Y.backward(grad_output)\`).

### Follow-up
- Why does \`Y.backward()\` without an argument fail when \`Y\` is not a scalar?
- What is \`dL/dX\` used for, if \`X\` is the input data and is never updated?
    `,
    examples: [
      {
        input: 'compute_gradients(2.0)',
        output: "{'y': 11.0, 'grad': 7.0}",
        explanation: 'y = 4 + 6 + 1 = 11 and dy/dx = 2*2 + 3 = 7.',
      },
      {
        input: 'X = [[1, 2], [3, 4]], W = [[1, 0, -1], [2, 1, 0]], b = [0, 0, 0], grad_output = ones((2, 3))',
        output: "{'grad_W': [[4, 4, 4], [6, 6, 6]], 'grad_b': [2, 2, 2], 'grad_X': [[0, 3], [0, 3]]}",
        explanation: 'X.T @ G sums the columns of X; G summed over the batch is 2 per output; G @ W.T sums each row of W.',
      },
    ],
    starterCode: `import numpy as np

def compute_gradients(x: float) -> dict:
    """
    Compute the forward value and derivative of y = x^2 + 3x + 1.

    Args:
        x: Input value

    Returns:
        dict with 'y' (forward result) and 'grad' (dy/dx), both floats
    """
    # Your code here
    pass


def linear_layer_gradients(X: np.ndarray, W: np.ndarray, b: np.ndarray,
                           grad_output: np.ndarray) -> dict:
    """
    Compute the gradients of a linear layer Y = X @ W + b.

    Args:
        X: Input (batch, in_features)
        W: Weights (in_features, out_features)
        b: Bias (out_features,)
        grad_output: Upstream gradient dL/dY (batch, out_features)

    Returns:
        dict with 'grad_W' (in_features, out_features), 'grad_b'
        (out_features,) and 'grad_X' (batch, in_features)
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
      {
        id: '3',
        description: 'Linear layer: grad_W = X.T @ grad_output',
        input: 'linear_layer_gradients(np.array([[1.0, 2.0], [3.0, 4.0]]), np.array([[1.0, 0.0, -1.0], [2.0, 1.0, 0.0]]), np.zeros(3), np.ones((2, 3)))["grad_W"].tolist()',
        expected: '[[4.0, 4.0, 4.0], [6.0, 6.0, 6.0]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Gradient at another point (the minimum)',
        input: '(lambda r: (r["y"], r["grad"]))(compute_gradients(-1.5))',
        expected: '(-1.25, 0.0)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Linear layer: grad_b and grad_X',
        input: '(lambda r: (r["grad_b"].tolist(), r["grad_X"].tolist()))(linear_layer_gradients(np.array([[1.0, 2.0], [3.0, 4.0]]), np.array([[1.0, 0.0, -1.0], [2.0, 1.0, 0.0]]), np.zeros(3), np.ones((2, 3))))',
        expected: '([2.0, 2.0, 2.0], [[0.0, 3.0], [0.0, 3.0]])',
        hidden: true,
      },
      {
        id: '6',
        description: 'Gradients match finite differences of L = sum(Y * G)',
        input: `(lambda: (
    X := np.random.randn(4, 3), W := np.random.randn(3, 2), b := np.random.randn(2), G := np.random.randn(4, 2),
    L := lambda X, W, b: float(np.sum((X @ W + b) * G)),
    r := linear_layer_gradients(X, W, b, G),
    h := 1e-6,
    E := lambda shape, i: np.eye(int(np.prod(shape)))[i].reshape(shape) * h,
    num_W := np.array([(L(X, W + E(W.shape, i), b) - L(X, W - E(W.shape, i), b)) / (2 * h) for i in range(W.size)]).reshape(W.shape),
    num_X := np.array([(L(X + E(X.shape, i), W, b) - L(X - E(X.shape, i), W, b)) / (2 * h) for i in range(X.size)]).reshape(X.shape),
    num_b := np.array([(L(X, W, b + E(b.shape, i)) - L(X, W, b - E(b.shape, i))) / (2 * h) for i in range(b.size)]),
    (r["grad_W"].shape, r["grad_X"].shape, r["grad_b"].shape,
     bool(np.allclose(r["grad_W"], num_W, atol=1e-4) and np.allclose(r["grad_X"], num_X, atol=1e-4) and np.allclose(r["grad_b"], num_b, atol=1e-4)))
)[-1])()`,
        expected: '((3, 2), (4, 3), (2,), True)',
        hidden: true,
      },
    ],
    hints: [
      'Each function has two parts: compute the forward value, then the derivative. For the polynomial, differentiate term by term.',
      'For the linear layer, write down the shape every gradient must have (it equals the shape of W, b or X) and find the product of X, W and grad_output that produces it.',
      'grad_W = X.T @ grad_output, grad_X = grad_output @ W.T, grad_b = grad_output.sum(axis=0).',
      'b was broadcast over the batch in the forward pass, so its gradient must be summed over the batch (axis=0), not averaged and not left as (batch, out_features).',
    ],
    solution: `import numpy as np

def compute_gradients(x: float) -> dict:
    """
    Returns {'y': x^2 + 3x + 1, 'grad': dy/dx = 2x + 3}.
    """
    y = x ** 2 + 3 * x + 1   # forward
    grad = 2 * x + 3         # backward (analytical derivative)
    return {'y': float(y), 'grad': float(grad)}


def linear_layer_gradients(X: np.ndarray, W: np.ndarray, b: np.ndarray,
                           grad_output: np.ndarray) -> dict:
    """
    Backward pass of Y = X @ W + b given grad_output = dL/dY.

    Returns:
        dict with 'grad_W' (like W), 'grad_b' (like b) and 'grad_X' (like X)
    """
    grad_W = X.T @ grad_output          # (in, batch) @ (batch, out) -> (in, out)
    grad_b = grad_output.sum(axis=0)    # b was broadcast over the batch: sum it back
    grad_X = grad_output @ W.T          # (batch, out) @ (out, in) -> (batch, in)
    return {'grad_W': grad_W, 'grad_b': grad_b, 'grad_X': grad_X}

# Complexity: O(batch * in * out) time, the same as the forward pass.
`,
  },
  {
    id: 'nn-modules',
    title: 'Neural Network Modules',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Neural Network Modules

**What you'll build:** the three building blocks every PyTorch model is made of (a \`Linear\` layer, a \`ReLU\` activation and a \`Sequential\` container) and a \`create_mlp\` factory that chains them into a 2-layer MLP.

### Background
In PyTorch every layer is an \`nn.Module\`: it owns its parameters, defines \`forward(x)\`, and can contain other modules. Calling \`model(x)\` runs \`forward\`, and \`model.parameters()\` walks the whole tree to find every trainable tensor, which is what the optimizer receives. Writing these classes yourself shows there is no magic: a model is a tree of objects with weights and a forward method.

### Specification
- **\`Linear(in_features, out_features)\`** computes \`Y = X @ W + b\`.
  - \`self.W\`: shape \`(in_features, out_features)\`, initialised to \`randn * 0.01\` (small random values break the symmetry between units).
  - \`self.b\`: shape \`(out_features,)\`, initialised to zeros.
  - \`forward(x)\`: \`x\` of shape \`(batch, in_features)\` returns \`(batch, out_features)\`.
- **\`ReLU\`**: \`forward(x)\` returns \`max(0, x)\` element-wise, same shape.
- **\`Sequential(*layers)\`**: \`forward(x)\` passes \`x\` through the layers in order and returns the last output.
- **\`create_mlp(input_dim, hidden_dim, output_dim)\`** returns \`Sequential(Linear(input_dim, hidden_dim), ReLU(), Linear(hidden_dim, output_dim))\`.

A 2-layer MLP has \`input_dim*hidden_dim + hidden_dim + hidden_dim*output_dim + output_dim\` parameters: 325 for \`(10, 20, 5)\`.

### Track Differences
| | PyTorch track | NumPy track |
|---|---|---|
| Base class | subclass \`nn.Module\`, call \`super().__init__()\` | plain Python classes |
| Parameters | wrap \`W\` and \`b\` in \`nn.Parameter\`; \`parameters()\` is inherited | \`Linear.parameters()\` returns \`[self.W, self.b]\` |
| Calling | \`layer(x)\` (runs \`forward\`) | \`layer.forward(x)\` |

### Constraints
Write the layers yourself: don't wrap \`nn.Linear\`, \`nn.ReLU\` or \`nn.Sequential\`.

### Follow-up
- Why must \`W\` not be initialised to all zeros?
- Why does PyTorch store \`nn.Linear.weight\` as \`(out_features, in_features)\` and compute \`x @ W.T\`?
    `,
    examples: [
      {
        input: 'create_mlp(10, 20, 5).forward(np.random.randn(4, 10)).shape',
        output: '(4, 5)',
        explanation: '(4, 10) -> Linear -> (4, 20) -> ReLU -> (4, 20) -> Linear -> (4, 5).',
      },
      {
        input: 'ReLU().forward(np.array([-2.0, 0.0, 1.5]))',
        output: 'array([0. , 0. , 1.5])',
        explanation: 'Negative values are clipped to zero; positive values pass through.',
      },
    ],
    starterCode: `import numpy as np

class Linear:
    """Linear layer: Y = X @ W + b"""

    def __init__(self, in_features: int, out_features: int):
        # Create self.W (in_features, out_features) with np.random.randn(...) * 0.01
        # and self.b (out_features,) with zeros
        # Your code here
        pass

    def forward(self, x: np.ndarray) -> np.ndarray:
        """x: (batch, in_features) -> (batch, out_features)"""
        # Your code here
        pass

    def parameters(self):
        """Return the list [W, b]."""
        # Your code here
        pass


class ReLU:
    """ReLU activation: max(0, x)"""

    def forward(self, x: np.ndarray) -> np.ndarray:
        # Your code here
        pass


class Sequential:
    """Container that applies its layers in order"""

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
      {
        id: '3',
        description: 'ReLU values',
        input: 'ReLU().forward(np.array([-2.0, 0.0, 1.5])).tolist()',
        expected: '[0.0, 0.0, 1.5]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Parameter count of the MLP (10*20 + 20 + 20*5 + 5)',
        input: 'sum(p.size for layer in create_mlp(10, 20, 5).layers if hasattr(layer, "parameters") for p in layer.parameters())',
        expected: '325',
        hidden: true,
      },
      {
        id: '5',
        description: 'Linear computes x @ W + b, with zero bias and small weights at init',
        input: `(lambda: (
    layer := Linear(200, 50),
    x := np.random.randn(4, 200),
    (layer.W.shape, layer.b.shape, bool(np.allclose(layer.forward(x), x @ layer.W + layer.b)),
     bool(np.all(layer.b == 0)), bool(0.005 < layer.W.std() < 0.02))
)[-1])()`,
        expected: '((200, 50), (50,), True, True, True)',
        hidden: true,
      },
      {
        id: '6',
        description: 'MLP output equals the hand-chained layers',
        input: `(lambda: (
    model := create_mlp(3, 4, 2),
    l1 := model.layers[0], l2 := model.layers[2],
    x := np.random.randn(5, 3),
    (len(model.layers), bool(np.allclose(model.forward(x), np.maximum(0, x @ l1.W + l1.b) @ l2.W + l2.b)))
)[-1])()`,
        expected: '(3, True)',
        hidden: true,
      },
    ],
    hints: [
      'Each class has one job: Linear stores W and b and applies them, ReLU clips negatives, Sequential just loops.',
      'Linear.__init__: self.W = np.random.randn(in_features, out_features) * 0.01 and self.b = np.zeros(out_features). forward returns x @ self.W + self.b.',
      'ReLU: np.maximum(0, x). Sequential.forward: for layer in self.layers: x = layer.forward(x), then return x.',
      'create_mlp must return the Sequential object (not its output), with a ReLU between the two Linear layers.',
    ],
    solution: `import numpy as np

class Linear:
    """Linear layer: Y = X @ W + b"""

    def __init__(self, in_features: int, out_features: int):
        # Small random weights break symmetry; zero bias is the usual default
        self.W = np.random.randn(in_features, out_features) * 0.01
        self.b = np.zeros(out_features)

    def forward(self, x: np.ndarray) -> np.ndarray:
        return x @ self.W + self.b          # (batch, in) @ (in, out) + (out,)

    def parameters(self):
        return [self.W, self.b]


class ReLU:
    """ReLU activation: max(0, x)"""

    def forward(self, x: np.ndarray) -> np.ndarray:
        return np.maximum(0, x)


class Sequential:
    """Container that applies its layers in order"""

    def __init__(self, *layers):
        self.layers = layers

    def forward(self, x: np.ndarray) -> np.ndarray:
        for layer in self.layers:
            x = layer.forward(x)
        return x


def create_mlp(input_dim: int, hidden_dim: int, output_dim: int):
    """Create a 2-layer MLP: Linear -> ReLU -> Linear"""
    return Sequential(
        Linear(input_dim, hidden_dim),
        ReLU(),
        Linear(hidden_dim, output_dim),
    )
`,
  },
  {
    id: 'loss-functions',
    title: 'Loss Functions',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Loss Functions

**What you'll build:** a numerically stable \`softmax\` and the three losses you will use most: cross-entropy (multi-class classification), mean squared error (regression) and binary cross-entropy (binary classification).

### Background
The loss turns predictions into the single number that \`backward()\` differentiates. Picking the right one, and feeding it the right input (logits or probabilities, class indices or one-hot), is a constant source of silent bugs and a common interview topic.

### Formulas
For logits \`z\` of shape \`(batch, num_classes)\`:

**Softmax** (over the last dimension, shifted by the row max for stability):
\`\`\`text
softmax(z)[k] = exp(z[k] - max(z)) / sum_j exp(z[j] - max(z))
\`\`\`

**Cross-entropy** with integer class labels \`t\` of shape \`(batch,)\`, averaged over the batch:
\`\`\`text
CE = -(1 / batch) * sum_i log softmax(z_i)[t_i]
log softmax(z)[k] = z[k] - max(z) - log(sum_j exp(z[j] - max(z)))
\`\`\`

**Mean squared error** for predictions and targets of the same shape:
\`\`\`text
MSE = mean((y_pred - y_true) ** 2)
\`\`\`

**Binary cross-entropy** for probabilities \`p\` in (0, 1) and labels \`y\` in {0, 1}:
\`\`\`text
BCE = -mean(y * log(p) + (1 - y) * log(1 - p))
\`\`\`

### Inputs
- \`softmax(x)\`: array of any shape; normalise over the last axis.
- \`cross_entropy_loss(logits, targets)\`: \`logits\` \`(batch, num_classes)\` raw scores, \`targets\` \`(batch,)\` integers in \`[0, num_classes)\`.
- \`mse_loss(y_pred, y_true)\`: same-shaped float arrays.
- \`binary_cross_entropy(y_pred, y_true)\`: \`y_pred\` probabilities, \`y_true\` 0/1 labels, same shape.

### Expected Return Format
- \`softmax\` returns an array of the input's shape whose last axis sums to 1.
- The three losses return a Python \`float\` (mean over all elements or samples).

### Edge Cases and Conventions
- Compute the cross-entropy through **log-softmax**, not \`log(softmax(...))\`: it stays exact even when one logit dominates (logits \`[[1000, 0]]\` with target 1 give a loss of exactly 1000).
- In the NumPy BCE, clip \`p\` to \`[1e-15, 1 - 1e-15]\` before taking logs so a prediction of exactly 0 or 1 doesn't produce \`inf\`.

### Constraints
- **PyTorch track:** use the built-ins \`F.softmax\`, \`F.cross_entropy\`, \`F.mse_loss\` and \`F.binary_cross_entropy\`, and learn what each expects.
- **NumPy track:** implement each formula from scratch, vectorised.

### Follow-up
- Why does PyTorch's \`F.cross_entropy\` take raw logits instead of probabilities?
- Why is \`BCEWithLogitsLoss\` preferred over \`sigmoid\` followed by \`BCELoss\`?
    `,
    examples: [
      {
        input: 'cross_entropy_loss(np.array([[2.0, 1.0, 0.1]]), np.array([0]))',
        output: '0.4170',
        explanation: 'softmax gives p = [0.659, 0.2424, 0.0986]; -log(0.659) = 0.4170.',
      },
      {
        input: 'mse_loss(np.array([1.0, 2.0, 3.0]), np.array([1.0, 2.0, 4.0]))',
        output: '0.3333',
        explanation: 'Only the last prediction is off, by 1: (0 + 0 + 1) / 3.',
      },
      {
        input: 'binary_cross_entropy(np.array([0.9, 0.1, 0.8]), np.array([1.0, 0.0, 1.0]))',
        output: '0.1446',
        explanation: '-(log 0.9 + log 0.9 + log 0.8) / 3: confident, correct predictions give a small loss.',
      },
    ],
    starterCode: `import numpy as np

def softmax(x: np.ndarray) -> np.ndarray:
    """Numerically stable softmax over the last axis (same shape as x)."""
    # Your code here
    pass


def cross_entropy_loss(logits: np.ndarray, targets: np.ndarray) -> float:
    """
    Cross-entropy loss for classification, averaged over the batch.

    Args:
        logits: Raw scores (batch, num_classes)
        targets: Integer class labels (batch,)

    Returns:
        Scalar loss (float)
    """
    # Your code here
    pass


def mse_loss(y_pred: np.ndarray, y_true: np.ndarray) -> float:
    """Mean squared error (float)."""
    # Your code here
    pass


def binary_cross_entropy(y_pred: np.ndarray, y_true: np.ndarray) -> float:
    """
    Binary cross-entropy on probabilities (float).
    Clip y_pred to [1e-15, 1 - 1e-15] before taking logs.
    """
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
      {
        id: '3',
        description: 'Softmax values, rows normalised separately',
        input: 'bool(np.allclose(softmax(np.array([[1.0, 2.0, 3.0], [0.0, 0.0, 0.0]])), np.array([[0.090031, 0.244728, 0.665241], [1 / 3, 1 / 3, 1 / 3]]), atol=1e-5))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Cross-entropy averaged over a batch',
        input: 'round(cross_entropy_loss(np.array([[1.0, 2.0, 3.0], [1.0, 2.0, 3.0]]), np.array([2, 0])), 4)',
        expected: '1.4076',
        hidden: true,
      },
      {
        id: '5',
        description: 'Binary cross-entropy',
        input: 'round(binary_cross_entropy(np.array([0.9, 0.1, 0.8]), np.array([1.0, 0.0, 1.0])), 4)',
        expected: '0.1446',
        hidden: true,
      },
      {
        id: '6',
        description: 'Stable for huge logits: softmax has no NaN and cross-entropy is exact',
        input: '(lambda: (bool(np.all(np.isfinite(softmax(np.array([1000.0, 1001.0, 1002.0]))))), round(cross_entropy_loss(np.array([[1000.0, 0.0]]), np.array([1])), 4)))()',
        expected: '(True, 1000.0)',
        hidden: true,
      },
    ],
    hints: [
      'Write softmax first and reuse it: cross-entropy only needs the log-probability of the correct class for each sample.',
      'Pick the correct-class entries with fancy indexing: log_probs[np.arange(batch), targets], then average and negate.',
      'Stable softmax: subtract x.max(axis=-1, keepdims=True) before np.exp. Log-softmax: shifted - np.log(np.exp(shifted).sum(axis=-1, keepdims=True)).',
      'np.log(softmax(x)) underflows to log(0) = -inf when one logit dominates; use log-softmax. For BCE, np.clip the probabilities before np.log.',
    ],
    solution: `import numpy as np

def softmax(x: np.ndarray) -> np.ndarray:
    """Numerically stable softmax over the last axis."""
    exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))   # shift: exp() can't overflow
    return exp_x / np.sum(exp_x, axis=-1, keepdims=True)


def cross_entropy_loss(logits: np.ndarray, targets: np.ndarray) -> float:
    """Mean of -log softmax(logits)[target] over the batch."""
    shifted = logits - np.max(logits, axis=-1, keepdims=True)
    # log-softmax, computed without ever taking log of a tiny probability
    log_probs = shifted - np.log(np.sum(np.exp(shifted), axis=-1, keepdims=True))
    correct = log_probs[np.arange(len(targets)), targets]   # (batch,)
    return float(-np.mean(correct))


def mse_loss(y_pred: np.ndarray, y_true: np.ndarray) -> float:
    return float(np.mean((y_pred - y_true) ** 2))


def binary_cross_entropy(y_pred: np.ndarray, y_true: np.ndarray) -> float:
    p = np.clip(y_pred, 1e-15, 1 - 1e-15)                    # avoid log(0)
    return float(-np.mean(y_true * np.log(p) + (1 - y_true) * np.log(1 - p)))

# Complexity: O(batch * num_classes) time for cross-entropy, O(n) for MSE and BCE.
`,
  },
  {
    id: 'gelu-activation',
    title: 'GELU Activation',
    section: 'pytorch-basics',
    difficulty: 'easy',
    description: `
## GELU Activation

**What you'll build:** \`gelu(x)\`, the Gaussian Error Linear Unit with the tanh approximation, applied element-wise.

### Background
GELU is the activation in the feed-forward blocks of BERT, GPT-2 and most transformers since. Where ReLU gates its input with a hard step (\`x * [x > 0]\`), GELU gates it softly with the probability that a standard normal variable is below \`x\`: \`GELU(x) = x * Φ(x)\`. Small negative inputs leak through slightly, and the function is smooth everywhere, which tends to help optimisation in deep networks.

### Formula
The exact form uses the normal CDF \`Φ\`. GPT-2 and the original BERT code use this tanh approximation, which is what you implement:
\`\`\`text
GELU(x) ≈ 0.5 * x * (1 + tanh( sqrt(2/π) * (x + 0.044715 * x³) ))
\`\`\`
with \`sqrt(2/π) ≈ 0.79788\`.

### Key Properties
| Property | ReLU | GELU |
|----------|------|------|
| Value at 0 | 0 | 0 |
| Negative inputs | exactly 0 | small negative outputs (minimum ≈ -0.17 near x = -0.75) |
| Large positive x | x | approaches x |
| Large negative x | 0 | approaches 0 from below |
| Smooth at 0 | no | yes |

### Inputs
- \`x\`: float array of any shape.

### Expected Return Format
An array of the same shape as \`x\`, with GELU applied element-wise.

### Constraints
- Use the tanh approximation above (the tests expect its values to 4 decimals).
- **PyTorch track:** build it from tensor ops (\`torch.tanh\`); don't call \`F.gelu\` or \`nn.GELU\`.

### Follow-up
- What is \`F.gelu(x)\` without \`approximate='tanh'\`, and how far apart are the two versions?
- How does SiLU / Swish (\`x * sigmoid(x)\`, next problem) compare?
    `,
    examples: [
      {
        input: 'gelu(np.array([-1.0, 0.0, 1.0]))',
        output: 'array([-0.1588,  0.    ,  0.8412])',
        explanation: 'GELU(0) = 0; GELU(1) ≈ 0.8412 is a bit below 1; GELU(-1) is slightly negative, unlike ReLU.',
      },
      {
        input: 'gelu(np.array([-3.0, 3.0]))',
        output: 'array([-0.0036,  2.9964])',
        explanation: 'Far from 0, GELU behaves like ReLU: about 0 for large negatives and about x for large positives.',
      },
    ],
    starterCode: `import numpy as np

def gelu(x: np.ndarray) -> np.ndarray:
    """
    Compute the GELU activation function (tanh approximation).

    Args:
        x: Input array of any shape

    Returns:
        GELU applied element-wise, same shape as input
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
        description: 'Values far from zero and at -0.5',
        input: 'np.round(gelu(np.array([-3.0, -0.5, 3.0])), 4).tolist()',
        expected: '[-0.0036, -0.1543, 2.9964]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Element-wise on a 2D array',
        input: 'bool(np.allclose(gelu(np.array([[-1.0, 0.0], [1.0, 2.0]])), np.array([[-0.158808, 0.0], [0.841192, 1.954598]]), atol=1e-5))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'GELU multiplies x by a smooth "gate" between 0 and 1; the tanh expression builds that gate.',
      'Compute the inner term first: inner = sqrt(2/π) * (x + 0.044715 * x**3), then 0.5 * x * (1 + tanh(inner)).',
      'np.sqrt(2 / np.pi) ≈ 0.7979 and np.tanh both work element-wise on arrays of any shape.',
      'The cube applies to x only (0.044715 * x**3), not to the whole bracket, and the leading factor is 0.5 * x, not 0.5.',
    ],
    solution: `import numpy as np

def gelu(x: np.ndarray) -> np.ndarray:
    """GELU with the tanh approximation, element-wise."""
    c = np.sqrt(2.0 / np.pi)                               # ≈ 0.7979
    return 0.5 * x * (1.0 + np.tanh(c * (x + 0.044715 * x ** 3)))
`,
  },
  {
    id: 'leaky-relu-swish',
    title: 'LeakyReLU & Swish',
    section: 'pytorch-basics',
    difficulty: 'easy',
    description: `
## LeakyReLU & Swish

**What you'll build:** two activations that fix ReLU's main weakness: \`leaky_relu(x, alpha)\` and \`swish(x, beta)\`, both element-wise.

### Background
A ReLU unit whose input is negative for every example outputs 0 and gets a gradient of exactly 0, so it can never recover: the **dying ReLU** problem. LeakyReLU keeps a small slope for negative inputs; Swish (called **SiLU** in PyTorch when \`beta = 1\`) replaces the hard gate with a smooth sigmoid gate. SiLU is the activation inside the SwiGLU feed-forward blocks of LLaMA-style models.

### Formulas
\`\`\`text
LeakyReLU(x) = x           if x > 0
               alpha * x   otherwise          (alpha = 0.01 by default)

Swish(x)     = x * sigmoid(beta * x) = x / (1 + exp(-beta * x))      (beta = 1 by default)
\`\`\`

### Comparison
| Property | ReLU | LeakyReLU | Swish |
|----------|------|-----------|-------|
| Gradient for x < 0 | 0 (can die) | alpha | non-zero |
| Smooth | no | no | yes |
| Negative outputs | never | yes, \`alpha * x\` | yes, small (minimum ≈ -0.278 near x = -1.28 for beta = 1) |
| Monotonic | yes | yes | no |

### Inputs
- \`x\`: float array of any shape.
- \`alpha\`: slope for non-positive inputs (float, default 0.01).
- \`beta\`: sharpness of the Swish gate (float, default 1.0). As \`beta\` grows, Swish approaches ReLU.

### Expected Return Format
Each function returns an array of the same shape as \`x\`.

### Constraints
- Vectorised element-wise ops; no Python loops.
- **PyTorch track:** use \`torch.where\` and \`torch.sigmoid\`; don't call \`F.leaky_relu\`, \`F.silu\`, \`nn.LeakyReLU\` or \`nn.SiLU\`.

### Follow-up
- Why is \`x * sigmoid(x)\` non-monotonic, and does that matter?
- PReLU learns \`alpha\` per channel. How would you add it as an \`nn.Parameter\`?
    `,
    examples: [
      {
        input: 'leaky_relu(np.array([-2.0, -1.0, 0.0, 1.0, 2.0]))',
        output: 'array([-0.02, -0.01,  0.  ,  1.  ,  2.  ])',
        explanation: 'Negative values are scaled by alpha = 0.01; positive values pass through unchanged.',
      },
      {
        input: 'swish(np.array([-1.0, 0.0, 1.0, 2.0]))',
        output: 'array([-0.2689,  0.    ,  0.7311,  1.7616])',
        explanation: 'swish(1) = 1 * sigmoid(1) = 0.7311; swish(-1) is a small negative value.',
      },
    ],
    starterCode: `import numpy as np

def leaky_relu(x: np.ndarray, alpha: float = 0.01) -> np.ndarray:
    """
    Compute LeakyReLU activation.

    Args:
        x: Input array of any shape
        alpha: Slope for non-positive values (default 0.01)

    Returns:
        LeakyReLU applied element-wise, same shape as x
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
        Swish applied element-wise, same shape as x
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
        description: 'Swish of 1.0',
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
      {
        id: '7',
        description: 'Swish with beta=2 and negative inputs',
        input: '(lambda: (np.round(swish(np.array([-1.0, 0.0, 2.0]), 2.0), 4).tolist(), np.round(swish(np.array([-1.0, -3.0])), 4).tolist()))()',
        expected: '([-0.1192, 0.0, 1.964], [-0.2689, -0.1423])',
        hidden: true,
      },
    ],
    hints: [
      'Both are element-wise: decide what happens to one number, then express it with array operations.',
      'LeakyReLU is a two-way choice per element, which is exactly what np.where(condition, a, b) does.',
      'np.where(x > 0, x, alpha * x) for LeakyReLU; sigmoid(z) = 1 / (1 + np.exp(-z)), so swish = x * sigmoid(beta * x).',
      'beta multiplies the input of the sigmoid, not the output: x * sigmoid(beta * x), not beta * x * sigmoid(x).',
    ],
    solution: `import numpy as np

def leaky_relu(x: np.ndarray, alpha: float = 0.01) -> np.ndarray:
    """x where x > 0, alpha * x elsewhere."""
    return np.where(x > 0, x, alpha * x)


def swish(x: np.ndarray, beta: float = 1.0) -> np.ndarray:
    """x * sigmoid(beta * x); beta = 1 is SiLU."""
    return x / (1.0 + np.exp(-beta * x))
`,
  },
  {
    id: 'softmax-temperature',
    title: 'Softmax with Temperature',
    section: 'pytorch-basics',
    difficulty: 'easy',
    description: `
## Softmax with Temperature

**What you'll build:** \`softmax_temperature(logits, temperature)\`, a numerically stable softmax over the last dimension with temperature scaling.

### Background
Dividing the logits by a temperature \`T\` before the softmax controls how peaked the distribution is. Language models sample with \`T < 1\` for focused text and \`T > 1\` for more diverse text; knowledge distillation softens a teacher's predictions with \`T > 1\` so the student also learns from the wrong-but-plausible classes.

### Formula
For logits \`z\` (softmax over the last dimension):
\`\`\`text
s = z / T
softmax(s)[k] = exp(s[k] - max(s)) / sum_j exp(s[j] - max(s))
\`\`\`
Subtracting \`max(s)\` changes nothing mathematically (it cancels in the ratio) but keeps \`exp\` from overflowing: \`exp(1000)\` is \`inf\` in float64.

### Temperature Effects
| Temperature | Effect |
|-------------|--------|
| \`T = 1\` | standard softmax |
| \`T < 1\` | sharper, more confident |
| \`T → 0\` | approaches one-hot at the argmax |
| \`T > 1\` | softer, closer to uniform |
| \`T → ∞\` | approaches uniform |

The **ranking** of the classes never changes, only how much mass the top classes get.

### Inputs
- \`logits\`: float array of any shape; normalise over the last axis.
- \`temperature\`: positive float (default 1.0).

### Expected Return Format
An array of the same shape as \`logits\`, with non-negative entries that sum to 1 along the last axis.

### Constraints
- Must stay finite for large logits (e.g. \`[1000, 1001, 1002]\`).
- **PyTorch track:** build it from tensor ops (\`max\`, \`torch.exp\`, \`sum\`); don't call \`F.softmax\` or \`torch.softmax\`.

### Follow-up
- Top-k and nucleus (top-p) sampling are applied after temperature. Sketch how.
- In distillation the soft-target loss is multiplied by \`T²\`. Why?
    `,
    examples: [
      {
        input: 'softmax_temperature(np.array([2.0, 1.0, 0.1]), temperature=1.0)',
        output: 'array([0.659 , 0.2424, 0.0986])',
        explanation: 'Standard softmax.',
      },
      {
        input: 'softmax_temperature(np.array([2.0, 1.0, 0.1]), temperature=0.5)',
        output: 'array([0.8638, 0.1169, 0.0193])',
        explanation: 'Halving T doubles the gaps between logits, so the top class takes more of the mass.',
      },
      {
        input: 'softmax_temperature(np.array([2.0, 1.0, 0.1]), temperature=2.0)',
        output: 'array([0.5017, 0.3043, 0.194 ])',
        explanation: 'A higher temperature flattens the distribution, keeping the same order.',
      },
    ],
    starterCode: `import numpy as np

def softmax_temperature(logits: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    """
    Compute softmax with temperature scaling.

    Args:
        logits: Input logits (any shape, softmax along the last axis)
        temperature: Positive temperature (default 1.0)

    Returns:
        Probabilities with the shape of logits, summing to 1 along the last axis
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
      {
        id: '7',
        description: 'Numerically stable for huge logits, with T=0.5',
        input: 'np.round(softmax_temperature(np.array([1000.0, 1001.0, 1002.0]), 0.5), 4).tolist()',
        expected: '[0.0159, 0.1173, 0.8668]',
        hidden: true,
      },
      {
        id: '8',
        description: 'Temperature 0.5 and 2.0 values on a batch',
        input: 'np.round(softmax_temperature(np.array([[2.0, 1.0, 0.1], [0.0, 0.0, 3.0]]), 2.0), 4).tolist()',
        expected: '[[0.5017, 0.3043, 0.194], [0.1543, 0.1543, 0.6914]]',
        hidden: true,
      },
    ],
    hints: [
      'Temperature is just a rescaling of the logits; after that it is an ordinary softmax.',
      'Three steps: scaled = logits / temperature, shift by the row max, then exp and normalise by the row sum.',
      'np.max(scaled, axis=-1, keepdims=True) and np.sum(..., axis=-1, keepdims=True) keep the reduced axis so the subtraction and division broadcast.',
      'Divide by T before subtracting the max (or after, both work), but never skip the max shift: np.exp(1000.0) overflows to inf and the result becomes nan.',
    ],
    solution: `import numpy as np

def softmax_temperature(logits: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    """Softmax of logits / temperature over the last axis."""
    scaled = logits / temperature
    # Shifting by the row max leaves the result unchanged but prevents overflow
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

**What you'll build:** \`rmsnorm(x, gamma, eps)\`, which rescales each feature vector by its root mean square and applies a learnable per-feature gain.

### Background
RMSNorm (Zhang & Sennrich, 2019) is LayerNorm without the mean subtraction and without the bias. It is used in LLaMA, Mistral, Gemma and most recent LLMs: it is cheaper (one reduction instead of two) and works as well in practice, because the re-scaling, not the re-centring, is what stabilises training.

### Formula
For each vector \`x\` along the last dimension (size \`d\`):
\`\`\`text
rms(x) = sqrt( mean(x²) + eps ) = sqrt( (1/d) * sum_i x_i² + eps )
RMSNorm(x) = x / rms(x) * gamma
\`\`\`
\`eps\` goes **inside** the square root, as in PyTorch's \`nn.RMSNorm\`.

### Comparison with LayerNorm
| Property | LayerNorm | RMSNorm |
|----------|-----------|---------|
| Subtracts the mean | yes | no |
| Divides by | standard deviation | root mean square |
| Learnable scale (gamma) | yes | yes |
| Learnable shift (beta) | yes | no |
| Output mean is 0 | yes | not in general |

### Inputs
- \`x\`: float array of shape \`(..., d)\` (any number of leading dimensions).
- \`gamma\`: float array of shape \`(d,)\`.
- \`eps\`: small positive float (default \`1e-6\`).

### Expected Return Format
An array of the same shape as \`x\`.

### Edge Cases and Conventions
- Normalise over the **last** axis only; every leading index is an independent vector.
- An all-zero vector stays all zero (the \`eps\` prevents division by zero).

### Constraints
- Vectorised; no loops over rows.
- **PyTorch track:** use tensor ops; don't call \`F.rms_norm\` or \`nn.RMSNorm\`.

### Follow-up
- Why can models get away with dropping the mean subtraction?
- Where does the norm sit in a pre-norm transformer block, and why did pre-norm replace post-norm?
    `,
    examples: [
      {
        input: 'rmsnorm(np.array([[1.0, 2.0, 3.0]]), np.array([1.0, 1.0, 1.0]))',
        output: 'array([[0.4629, 0.9258, 1.3887]])',
        explanation: 'rms = sqrt((1 + 4 + 9) / 3) = sqrt(14/3) ≈ 2.1602, and each entry is divided by it.',
      },
      {
        input: 'rmsnorm(np.array([[3.0, 4.0], [1.0, 1.0]]), np.ones(2))',
        output: 'array([[0.8485, 1.1314], [1.    , 1.    ]])',
        explanation: 'Each row uses its own rms (sqrt(12.5) and 1); there is no centring, so the outputs keep their sign and offset.',
      },
    ],
    starterCode: `import numpy as np

def rmsnorm(x: np.ndarray, gamma: np.ndarray, eps: float = 1e-6) -> np.ndarray:
    """
    Apply RMS Normalization over the last axis.

    Args:
        x: Input array of shape (..., features)
        gamma: Learnable scale of shape (features,)
        eps: Small constant added inside the square root

    Returns:
        Normalized array, same shape as x
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
        description: 'Each row normalized separately',
        input: 'np.round(rmsnorm(np.array([[3.0, 4.0], [1.0, 1.0]]), np.ones(2)), 4).tolist()',
        expected: '[[0.8485, 1.1314], [1.0, 1.0]]',
        hidden: true,
      },
      {
        id: '6',
        description: '3D input, per-feature gamma and a large eps',
        input: `(lambda: (
    x := np.random.randn(2, 3, 4), g := np.array([0.5, -1.0, 2.0, 1.5]),
    ref := lambda x, eps: x / np.sqrt((x ** 2).mean(axis=-1, keepdims=True) + eps) * g,
    (rmsnorm(x, g).shape, bool(np.allclose(rmsnorm(x, g), ref(x, 1e-6), atol=1e-6)), bool(np.allclose(rmsnorm(0.1 * x, g, 0.5), ref(0.1 * x, 0.5), atol=1e-6)))
)[-1])()`,
        expected: '((2, 3, 4), True, True)',
        hidden: true,
      },
    ],
    hints: [
      'Each row (vector along the last axis) is divided by one number, its root mean square; gamma is applied afterwards.',
      'Compute rms with shape (..., 1) so that x / rms broadcasts over the last axis, then multiply by gamma, which broadcasts over the leading axes.',
      'rms = np.sqrt(np.mean(x ** 2, axis=-1, keepdims=True) + eps); return x / rms * gamma.',
      'Don\'t subtract the mean (that would be LayerNorm), and put eps inside the square root, not after it.',
    ],
    solution: `import numpy as np

def rmsnorm(x: np.ndarray, gamma: np.ndarray, eps: float = 1e-6) -> np.ndarray:
    """x / sqrt(mean(x^2, last axis) + eps) * gamma."""
    # keepdims=True gives shape (..., 1), which broadcasts against x
    rms = np.sqrt(np.mean(x ** 2, axis=-1, keepdims=True) + eps)
    return x / rms * gamma

# Complexity: O(n) time for n elements, O(n / d) extra memory for the rms values.
`,
  },
  {
    id: 'group-norm',
    title: 'Group Normalization',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Group Normalization

**What you'll build:** \`group_norm(x, num_groups, gamma, beta, eps)\` for 2D input \`(N, C)\`: split the channels into groups, normalise within each group of each sample, then scale and shift per channel.

### Background
BatchNorm's statistics come from the batch, so it degrades when batches are small (detection, segmentation, large models on few GPUs). Group Normalization (Wu & He, 2018) computes its statistics **per sample** over groups of channels, so it behaves identically for any batch size and in train and eval mode. It is the default in diffusion U-Nets.

### Algorithm
With \`G = num_groups\` dividing \`C\`, and \`C // G\` channels per group:
1. Reshape \`x\` from \`(N, C)\` to \`(N, G, C // G)\`, so each group of consecutive channels sits on its own row.
2. Compute the mean and the **population** variance (divide by the group size) over the last axis.
3. Normalise: \`x_hat = (x - mean) / sqrt(var + eps)\`.
4. Reshape back to \`(N, C)\`.
5. Scale and shift per channel: \`out = gamma * x_hat + beta\`.

### Special Cases
| Setting | Equivalent to |
|---------|---------------|
| \`G = 1\` | LayerNorm over the channels |
| \`G = C\` | InstanceNorm (with a single value per channel, every output is 0, then \`beta\`) |

### Inputs
- \`x\`: float array \`(N, C)\`.
- \`num_groups\`: integer that divides \`C\`.
- \`gamma\`, \`beta\`: float arrays \`(C,)\`.
- \`eps\`: small positive float (default \`1e-5\`).

### Expected Return Format
An array of shape \`(N, C)\`.

### Edge Cases and Conventions
- Groups are **consecutive** channels: with \`C = 4, G = 2\` the groups are channels \`{0, 1}\` and \`{2, 3}\`.
- The real layer works on \`(N, C, *spatial)\` and also pools over the spatial positions; here the input is \`(N, C)\` to keep the reshape simple.

### Constraints
- Vectorised with a reshape; no loops over groups.
- **PyTorch track:** don't call \`F.group_norm\` or \`nn.GroupNorm\`.

### Follow-up
- Extend it to \`(N, C, H, W)\`. Which axes do you reduce over?
- Why is GroupNorm usually paired with weight standardisation in small-batch detection models?
    `,
    examples: [
      {
        input: 'group_norm(np.array([[1.0, 2.0, 3.0, 5.0]]), 2, np.ones(4), np.zeros(4))',
        output: 'array([[-1.,  1., -1.,  1.]])',
        explanation: 'Group {1, 2}: mean 1.5, std 0.5. Group {3, 5}: mean 4, std 1. Each normalises to [-1, 1].',
      },
      {
        input: 'group_norm(np.array([[1.0, 2.0, 3.0, 5.0]]), 2, np.full(4, 2.0), np.ones(4))',
        output: 'array([[-1.,  3., -1.,  3.]])',
        explanation: 'gamma = 2 and beta = 1 map -1 to -1 and 1 to 3.',
      },
    ],
    starterCode: `import numpy as np

def group_norm(x: np.ndarray, num_groups: int, gamma: np.ndarray, beta: np.ndarray, eps: float = 1e-5) -> np.ndarray:
    """
    Apply Group Normalization to (N, C) input.

    Args:
        x: Input array of shape (N, C)
        num_groups: Number of groups of consecutive channels (divides C)
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
        description: 'With groups=C every group has one value, so the output is 0',
        input: '(lambda: (x := np.array([[1.0, 2.0, 3.0, 4.0]]), out := group_norm(x, 4, np.ones(4), np.zeros(4)), bool(np.allclose(out, np.zeros((1, 4)), atol=1e-3)))[-1])()',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Two groups of two channels, known values',
        input: 'np.round(group_norm(np.array([[1.0, 2.0, 3.0, 5.0]]), 2, np.ones(4), np.zeros(4)), 4).tolist()',
        expected: '[[-1.0, 1.0, -1.0, 1.0]]',
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
        description: 'Gamma and beta scale and shift per channel',
        input: 'np.round(group_norm(np.array([[1.0, 2.0, 3.0, 5.0]]), 2, np.array([2.0, 2.0, 1.0, 3.0]), np.array([1.0, 1.0, 0.0, -1.0])), 4).tolist()',
        expected: '[[-1.0, 3.0, -1.0, 2.0]]',
        hidden: true,
      },
      {
        id: '6',
        description: 'One group equals LayerNorm over the channels (population variance)',
        input: '(lambda: (x := np.random.randn(3, 6), ref := (x - x.mean(1, keepdims=True)) / np.sqrt(x.var(1, keepdims=True) + 1e-5), bool(np.allclose(group_norm(x, 1, np.ones(6), np.zeros(6)), ref, atol=1e-6)))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'Samples are normalized independently',
        input: 'np.round(group_norm(np.array([[1.0, 2.0, 3.0, 4.0, 5.0, 6.0], [0.0, 0.0, 6.0, 1.0, 1.0, 1.0]]), 2, np.ones(6), np.zeros(6)), 4).tolist()',
        expected: '[[-1.2247, 0.0, 1.2247, -1.2247, 0.0, 1.2247], [-0.7071, -0.7071, 1.4142, 0.0, 0.0, 0.0]]',
        hidden: true,
      },
    ],
    hints: [
      'Reshape so that each group of each sample becomes one row; then it is a plain "normalise each row" problem.',
      'x.reshape(N, num_groups, C // num_groups), reduce over axis=2 with keepdims=True, normalise, then reshape back to (N, C).',
      'np.mean(xg, axis=2, keepdims=True) and np.var(xg, axis=2, keepdims=True); x_hat = (xg - mean) / np.sqrt(var + eps).',
      'Apply gamma and beta after reshaping back to (N, C): they are per channel, not per group. np.var already uses the population variance (ddof=0), which is what normalisation layers use.',
    ],
    solution: `import numpy as np

def group_norm(x: np.ndarray, num_groups: int, gamma: np.ndarray, beta: np.ndarray, eps: float = 1e-5) -> np.ndarray:
    """Normalise each group of consecutive channels per sample, then scale and shift per channel."""
    N, C = x.shape
    xg = x.reshape(N, num_groups, C // num_groups)       # one row per (sample, group)
    mean = xg.mean(axis=2, keepdims=True)
    var = xg.var(axis=2, keepdims=True)                  # population variance
    x_hat = ((xg - mean) / np.sqrt(var + eps)).reshape(N, C)
    return gamma * x_hat + beta                          # per-channel affine
`,
  },
  {
    id: 'adam-optimizer',
    title: 'Adam Optimizer',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Adam Optimizer

**What you'll build:** \`adam_step(...)\`, one update of the Adam optimizer, returning the new parameters and moment estimates.

### Background
Adam (Kingma & Ba, 2015) combines **momentum** (a running mean of the gradients, \`m\`) with **RMSProp** (a running mean of the squared gradients, \`v\`). Dividing by \`sqrt(v)\` gives every parameter its own step size, so parameters with small, consistent gradients still move. It is the default optimizer for transformers, usually in its AdamW variant.

### Algorithm
At step \`t\` (starting at 1), element-wise:
1. First moment: \`m = beta1 * m + (1 - beta1) * g\`
2. Second moment: \`v = beta2 * v + (1 - beta2) * g²\`
3. Bias correction: \`m_hat = m / (1 - beta1^t)\`, \`v_hat = v / (1 - beta2^t)\`
4. Update: \`params = params - lr * m_hat / (sqrt(v_hat) + eps)\`

**Why bias correction?** \`m\` and \`v\` start at 0, so early on they are biased towards 0. At \`t = 1\`, \`m = 0.1 g\` but \`m_hat = g\`, and \`v_hat = g²\`, so the first step is \`lr * g / |g|\`: every parameter moves by about \`lr\`, whatever the gradient's scale.

### Default Hyperparameters
| Parameter | Default | Purpose |
|-----------|---------|---------|
| \`lr\` | 0.001 | step size |
| \`beta1\` | 0.9 | decay of the gradient average |
| \`beta2\` | 0.999 | decay of the squared-gradient average |
| \`eps\` | 1e-8 | avoids division by zero |

### Inputs
- \`params\`, \`grads\`, \`m\`, \`v\`: float arrays of the same shape.
- \`t\`: the current step, an integer starting at 1.

### Expected Return Format
Return a dictionary with these keys, each the same shape as \`params\`:
- \`'params'\`: updated parameters
- \`'m'\`: updated first moment (**before** bias correction)
- \`'v'\`: updated second moment (**before** bias correction)

### Constraints
- Don't modify the inputs in place; return new arrays.
- **PyTorch track:** use tensor ops; don't use \`torch.optim.Adam\` (the hidden tests compare your trajectory against it).

### Follow-up
- AdamW applies weight decay as \`params -= lr * wd * params\`, outside the adaptive step. Why is that better than adding \`wd * params\` to the gradient?
- Adam keeps two extra tensors per parameter. How much memory is that for a 7B-parameter model in fp32?
    `,
    examples: [
      {
        input: 'adam_step(np.array([1.0, 2.0]), np.array([0.5, -0.3]), np.zeros(2), np.zeros(2), t=1)',
        output: "{'params': array([0.999, 2.001]), 'm': array([ 0.05, -0.03]), 'v': array([0.00025, 0.00009])}",
        explanation: 'At t = 1 bias correction makes m_hat / sqrt(v_hat) = sign(g), so each parameter moves by lr = 0.001 against its gradient.',
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
        dict with 'params' (updated), 'm' and 'v' (updated moments,
        before bias correction), all the shape of params
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
        description: 'First step moves each parameter by lr against its gradient',
        input: 'np.round(adam_step(np.array([1.0, 2.0]), np.array([0.5, -0.3]), np.zeros(2), np.zeros(2), 1)["params"], 6).tolist()',
        expected: '[0.999, 2.001]',
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
        description: 'Two steps with custom betas',
        input: `(lambda: (
    r1 := adam_step(np.array([5.0, -1.0]), np.array([1.0, 2.0]), np.zeros(2), np.zeros(2), 1, lr=0.01, beta1=0.8, beta2=0.99),
    r2 := adam_step(r1["params"], np.array([-0.5, 2.0]), r1["m"], r1["v"], 2, lr=0.01, beta1=0.8, beta2=0.99),
    (np.round(r2["params"], 6).tolist(), np.round(r2["m"], 6).tolist(), np.round(r2["v"], 6).tolist())
)[-1])()`,
        expected: '([4.987889, -1.02], [0.06, 0.72], [0.0124, 0.0796])',
        hidden: true,
      },
      {
        id: '7',
        description: 'Bias correction: the first step size is lr regardless of gradient scale',
        input: 'np.round(adam_step(np.zeros(2), np.array([300.0, -0.005]), np.zeros(2), np.zeros(2), 1)["params"], 6).tolist()',
        expected: '[-0.001, 0.001]',
        hidden: true,
      },
    ],
    hints: [
      'Adam keeps two running averages per parameter: one of the gradient (direction) and one of its square (scale).',
      'Update m and v first, then form the bias-corrected copies m_hat and v_hat, then take the step. Return m and v without the correction.',
      'm = beta1 * m + (1 - beta1) * grads; v = beta2 * v + (1 - beta2) * grads ** 2; m_hat = m / (1 - beta1 ** t); params - lr * m_hat / (np.sqrt(v_hat) + eps).',
      'Add eps after the square root, not inside it, and use t (starting at 1) in the exponent; t = 0 would divide by zero.',
    ],
    solution: `import numpy as np

def adam_step(params, grads, m, v, t, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
    """One Adam update; returns {'params', 'm', 'v'}."""
    m = beta1 * m + (1 - beta1) * grads              # running mean of gradients
    v = beta2 * v + (1 - beta2) * grads ** 2         # running mean of squared gradients
    m_hat = m / (1 - beta1 ** t)                     # undo the bias towards the zero init
    v_hat = v / (1 - beta2 ** t)
    params = params - lr * m_hat / (np.sqrt(v_hat) + eps)
    return {'params': params, 'm': m, 'v': v}

# Complexity: O(n) time per step; O(2n) extra memory for m and v.
`,
  },
  {
    id: 'sgd-momentum',
    title: 'SGD with Momentum',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## SGD with Momentum

**What you'll build:** \`sgd_momentum_step(...)\`, one update of stochastic gradient descent with momentum, in PyTorch's formulation.

### Background
Plain gradient descent zig-zags across narrow valleys and crawls along flat directions. Momentum keeps a **velocity**: a decaying sum of past gradients. Components that agree from step to step add up and accelerate, components that flip sign cancel out. With \`momentum = 0.9\`, a constant gradient eventually produces steps 10 times larger than plain SGD (\`1 / (1 - 0.9)\`).

### Algorithm
Element-wise, at each step:
1. Velocity: \`v = momentum * v + g\`
2. Update: \`params = params - lr * v\`

This is exactly what \`torch.optim.SGD(params, lr, momentum)\` does (it calls \`v\` the \`momentum_buffer\`). Some textbooks write the equivalent form \`v = momentum * v - lr * g; params = params + v\`; it matches only while \`lr\` is constant, and the tests use PyTorch's form.

### Comparison
| Optimizer | Update rule |
|-----------|-------------|
| Vanilla SGD | \`p = p - lr * g\` |
| SGD + momentum | \`v = μ * v + g;  p = p - lr * v\` |

### Inputs
- \`params\`, \`grads\`, \`velocity\`: float arrays of the same shape (velocity starts at zeros).
- \`lr\`: learning rate (default 0.01); \`momentum\`: coefficient μ in [0, 1) (default 0.9).

### Expected Return Format
Return a dictionary with these keys, each the same shape as \`params\`:
- \`'params'\`: updated parameters
- \`'velocity'\`: updated velocity

### Constraints
- Return new arrays rather than modifying the inputs in place.
- **PyTorch track:** use tensor ops; don't use \`torch.optim.SGD\` (the hidden tests compare against it).

### Follow-up
- Nesterov momentum evaluates the gradient at the look-ahead point. How does PyTorch's \`nesterov=True\` change the update?
- Why does a large momentum often need a smaller learning rate?
    `,
    examples: [
      {
        input: 'sgd_momentum_step(np.array([1.0]), np.array([1.0]), np.zeros(1), lr=0.1, momentum=0.9)',
        output: "{'params': array([0.9]), 'velocity': array([1.])}",
        explanation: 'From zero velocity, the first step is plain SGD: v = g = 1, p = 1 - 0.1 * 1.',
      },
      {
        input: 'second step with the same gradient, velocity=[1.0]',
        output: "{'params': array([0.71]), 'velocity': array([1.9])}",
        explanation: 'v = 0.9 * 1 + 1 = 1.9, so the step grows to 0.19: momentum accelerates along a consistent gradient.',
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
        dict with 'params' and 'velocity' (updated, same shape as params)
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
        description: 'Velocity accumulates over two steps',
        input: '(lambda: (r1 := sgd_momentum_step(np.array([1.0]), np.array([1.0]), np.zeros(1), lr=0.1, momentum=0.9), r2 := sgd_momentum_step(r1["params"], np.array([1.0]), r1["velocity"], lr=0.1, momentum=0.9), (round(float(r1["velocity"][0]), 4), round(float(r2["velocity"][0]), 4), round(float(r2["params"][0]), 4)))[-1])()',
        expected: '(1.0, 1.9, 0.71)',
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
        input: 'np.round(sgd_momentum_step(np.array([5.0, 3.0]), np.array([1.0, -1.0]), np.zeros(2), lr=0.1, momentum=0.9)["params"], 4).tolist()',
        expected: '[4.9, 3.1]',
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
        input: '(lambda: (result := sgd_momentum_step(np.array([0.0]), np.array([1.0]), np.array([2.0]), lr=0.01, momentum=0.9), (round(float(result["velocity"][0]), 4), round(float(result["params"][0]), 4)))[-1])()',
        expected: '(2.8, -0.028)',
        hidden: true,
      },
      {
        id: '7',
        description: 'Five steps with changing gradients',
        input: `(lambda: (
    state := {"params": np.array([1.0, -2.0]), "velocity": np.zeros(2)},
    [state.update(sgd_momentum_step(state["params"], g, state["velocity"], lr=0.05, momentum=0.8))
     for g in [np.array([1.0, -1.0]), np.array([0.5, 2.0]), np.array([-1.0, 0.0]), np.array([0.0, 1.0]), np.array([2.0, -0.5])]],
    (np.round(state["params"], 6).tolist(), np.round(state["velocity"], 6).tolist())
)[-1])()`,
        expected: '([0.78012, -2.19212], [2.0256, 0.9144])',
        hidden: true,
      },
    ],
    hints: [
      'The velocity is a decaying memory of past gradients; the parameters then move along the velocity instead of the raw gradient.',
      'Two lines: update the velocity first, then use the new velocity to update the parameters.',
      'velocity = momentum * velocity + grads; params = params - lr * velocity.',
      'Use the updated velocity in the parameter step, and don\'t multiply the gradient by (1 - momentum): PyTorch\'s SGD adds the raw gradient.',
    ],
    solution: `import numpy as np

def sgd_momentum_step(params, grads, velocity, lr=0.01, momentum=0.9):
    """One SGD-with-momentum update (PyTorch convention)."""
    velocity = momentum * velocity + grads   # decaying sum of past gradients
    params = params - lr * velocity          # step along the velocity
    return {'params': params, 'velocity': velocity}

# Complexity: O(n) time per step; O(n) extra memory for the velocity.
`,
  },
  {
    id: 'lr-scheduling',
    title: 'Learning Rate Scheduling',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Learning Rate Scheduling

**What you'll build:** \`lr_schedule(step, warmup_steps, total_steps, base_lr, min_lr)\`, the learning rate at a given step under **linear warmup followed by cosine decay**.

### Background
A fixed learning rate is rarely best. Early in training, Adam's second-moment estimates are noisy and large updates can destabilise the model, so the rate is **warmed up** from 0. Later, smaller steps let the model settle into a minimum, so the rate is **decayed**. Warmup + cosine decay is the standard schedule for transformers (GPT-3, LLaMA, ViT).

### Formula
\`\`\`text
if step < warmup_steps:                       # linear warmup, 0 -> base_lr
    lr = base_lr * step / warmup_steps
else:                                         # cosine decay, base_lr -> min_lr
    progress = (step - warmup_steps) / (total_steps - warmup_steps)    # 0 -> 1
    lr = min_lr + 0.5 * (base_lr - min_lr) * (1 + cos(π * progress))
\`\`\`
At \`progress = 0\` the cosine term is 1 (\`lr = base_lr\`), at \`0.5\` it is 0 (half way between the two), at \`1\` it is -1 (\`lr = min_lr\`).

### Inputs
- \`step\`: integer in \`[0, total_steps]\`.
- \`warmup_steps\`: integer in \`[0, total_steps)\`; 0 means no warmup.
- \`total_steps\`: integer, the step at which the schedule reaches \`min_lr\`.
- \`base_lr\`: peak rate (default \`1e-3\`); \`min_lr\`: final rate (default \`1e-6\`).

### Expected Return Format
A Python \`float\`.

### Edge Cases and Conventions
- \`step == warmup_steps\` belongs to the decay branch and returns exactly \`base_lr\`, so the two pieces join continuously.
- \`step == 0\` returns \`0.0\` when there is warmup.

### Constraints
- **PyTorch track:** return a plain float (use \`math.cos\`). The function plugs into \`torch.optim.lr_scheduler.LambdaLR\`, which the hidden tests use.

### Follow-up
- With \`warmup_steps = 0\` this equals PyTorch's \`CosineAnnealingLR\`. Check it.
- What does "warmup-stable-decay" (WSD) change, and why do some LLM runs prefer it?
    `,
    examples: [
      {
        input: '[lr_schedule(s, warmup_steps=100, total_steps=1000) for s in (0, 50, 100)]',
        output: '[0.0, 0.0005, 0.001]',
        explanation: 'Linear warmup: half way through warmup the rate is half of base_lr.',
      },
      {
        input: '[lr_schedule(s, 100, 1000) for s in (550, 1000)]',
        output: '[0.0005005, 1e-06]',
        explanation: 'Step 550 is half way through the decay, so lr = (base_lr + min_lr) / 2; the last step reaches min_lr.',
      },
    ],
    starterCode: `import numpy as np

def lr_schedule(step, warmup_steps, total_steps, base_lr=0.001, min_lr=1e-6):
    """
    Learning rate with linear warmup and cosine decay.

    Args:
        step: Current training step (0 <= step <= total_steps)
        warmup_steps: Number of warmup steps (0 for none)
        total_steps: Step at which the rate reaches min_lr
        base_lr: Peak learning rate (default 0.001)
        min_lr: Final learning rate (default 1e-6)

    Returns:
        Learning rate (float) for the given step
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'LR at step 0 is 0',
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
        description: 'Warmup midpoint and decay midpoint',
        input: '(lambda: (round(lr_schedule(50, 100, 1000, 0.001, 1e-6), 8), round(lr_schedule(550, 100, 1000, 0.001, 1e-6), 8)))()',
        expected: '(0.0005, 0.0005005)',
        hidden: true,
      },
      {
        id: '7',
        description: 'Quarter points of the decay, custom rates, and no warmup',
        input: '(lambda: (round(lr_schedule(325, 100, 1000, 0.001, 1e-6), 8), round(lr_schedule(30, 10, 50, 0.01, 1e-4), 8), round(lr_schedule(0, 0, 20), 8), round(lr_schedule(5, 0, 20), 8)))()',
        expected: '(0.0008537, 0.00505, 0.001, 0.0008537)',
        hidden: true,
      },
    ],
    hints: [
      'The schedule has two pieces; decide which one applies with a single comparison against warmup_steps.',
      'Warmup is a straight line from 0 to base_lr. Decay first maps the step to progress in [0, 1], then applies the cosine.',
      'lr = min_lr + 0.5 * (base_lr - min_lr) * (1 + np.cos(np.pi * progress)), with progress = (step - warmup_steps) / (total_steps - warmup_steps).',
      'Measure progress from the end of warmup, not from step 0, or the schedule jumps at the boundary and never reaches min_lr at total_steps.',
    ],
    solution: `import numpy as np

def lr_schedule(step, warmup_steps, total_steps, base_lr=0.001, min_lr=1e-6):
    """Linear warmup to base_lr, then cosine decay to min_lr."""
    if step < warmup_steps:
        return base_lr * step / warmup_steps                         # 0 -> base_lr
    progress = (step - warmup_steps) / (total_steps - warmup_steps)  # 0 -> 1
    return float(min_lr + 0.5 * (base_lr - min_lr) * (1 + np.cos(np.pi * progress)))
`,
  },
  {
    id: 'gradient-accumulation',
    title: 'Gradient Accumulation',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Gradient Accumulation

**What you'll build:** \`gradient_accumulation(micro_batches_grads, accumulation_steps)\`, which combines the gradients of several micro-batches into the gradient of one large batch.

### Background
When a batch of 512 does not fit in GPU memory, you can run 8 micro-batches of 64, add up their gradients, and take **one** optimizer step. If each micro-batch loss is a mean over its samples, the mean of the micro-batch gradients equals the gradient of the full 512-sample batch, so training behaves as if the large batch fit.

In PyTorch this falls out of a design choice: \`loss.backward()\` **adds** into \`.grad\` instead of overwriting it (which is also why every loop calls \`optimizer.zero_grad()\`):
\`\`\`python
optimizer.zero_grad()
for i, (xb, yb) in enumerate(micro_batches):
    loss = loss_fn(model(xb), yb) / accumulation_steps   # scale so the sum is a mean
    loss.backward()                                      # adds into p.grad
optimizer.step()
\`\`\`

### Formula
For gradients \`g_1, ..., g_K\` with \`K = accumulation_steps\`:
\`\`\`text
effective_grad = (1 / K) * (g_1 + g_2 + ... + g_K)
\`\`\`

### Inputs
- \`micro_batches_grads\`: list of gradient arrays, all with the same shape (any shape).
- \`accumulation_steps\`: integer \`K\`, with \`1 <= K <= len(micro_batches_grads)\`.

### Expected Return Format
An array with the same shape as each gradient: the mean of the **first** \`K\` gradients.

### Edge Cases and Conventions
- Gradients after the first \`K\` belong to the next optimizer step and are ignored.
- With \`K = 1\` the result is the first gradient itself.

### Constraints
- **PyTorch track:** the reference solution lets \`backward()\` do the accumulation; a \`torch.stack(...).mean(dim=0)\` one-liner also passes.

### Follow-up
- Accumulation matches a large batch exactly for a mean loss. Which layer breaks that equivalence? (Hint: it normalises with batch statistics.)
- How should the learning rate change if you raise the effective batch size 8 times?
    `,
    examples: [
      {
        input: 'gradient_accumulation([np.array([1.0, 2.0]), np.array([3.0, 4.0])], 2)',
        output: 'array([2., 3.])',
        explanation: 'The mean of [1, 2] and [3, 4].',
      },
      {
        input: 'gradient_accumulation([np.array([1.0, 0.0]), np.array([3.0, 2.0]), np.array([100.0, 100.0])], 2)',
        output: 'array([2., 1.])',
        explanation: 'Only the first accumulation_steps = 2 gradients count; the third belongs to the next step.',
      },
    ],
    starterCode: `import numpy as np

def gradient_accumulation(micro_batches_grads, accumulation_steps):
    """
    Average the gradients of the first accumulation_steps micro-batches.

    Args:
        micro_batches_grads: List of gradient arrays (all the same shape)
        accumulation_steps: Number of micro-batches to accumulate (K)

    Returns:
        Mean of the first K gradients, same shape as each gradient
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
      {
        id: '5',
        description: 'Only the first accumulation_steps micro-batches count',
        input: 'gradient_accumulation([np.array([1.0, 0.0]), np.array([3.0, 2.0]), np.array([100.0, 100.0])], 2).tolist()',
        expected: '[2.0, 1.0]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Mean of micro-batch MSE gradients equals the full-batch gradient',
        input: `(lambda: (
    X := np.random.randn(8, 3), y := np.random.randn(8), w := np.random.randn(3),
    grad := lambda Xb, yb: 2 / len(yb) * Xb.T @ (Xb @ w - yb),
    micro := [grad(X[i:i + 2], y[i:i + 2]) for i in range(0, 8, 2)],
    bool(np.allclose(gradient_accumulation(micro, 4), grad(X, y)))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'The result is an average: sum the gradients you are told to use, then divide by how many there are.',
      'Use only micro_batches_grads[:accumulation_steps]; anything after that belongs to the next optimizer step.',
      'np.sum(micro_batches_grads[:accumulation_steps], axis=0) / accumulation_steps, or accumulate into np.zeros_like(micro_batches_grads[0]) in a loop.',
      'Don\'t accumulate into the first gradient array in place (acc = grads[0]; acc += ...): that silently modifies the caller\'s data.',
    ],
    solution: `import numpy as np

def gradient_accumulation(micro_batches_grads, accumulation_steps):
    """Mean of the first accumulation_steps gradients."""
    accumulated = np.zeros_like(micro_batches_grads[0], dtype=float)  # fresh buffer, inputs untouched
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

**What you'll build:** \`instance_norm(x, gamma, beta, eps)\` for images \`(N, C, H, W)\`: normalise every channel of every sample over its spatial positions, then scale and shift per channel.

### Background
Instance Normalization (Ulyanov et al., 2016) was introduced for style transfer: the mean and variance of a feature map carry much of an image's "style" (contrast, colour cast), so removing them per image and per channel makes the network's output independent of the input's contrast. It is GroupNorm with one channel per group and is common in GANs and image-to-image models.

### Formula
For each sample \`n\` and channel \`c\`, over the \`H * W\` positions:
\`\`\`text
mean[n, c] = mean over (h, w) of x[n, c, h, w]
var[n, c]  = mean over (h, w) of (x[n, c, h, w] - mean[n, c])²       (population variance)
out[n, c, h, w] = gamma[c] * (x[n, c, h, w] - mean[n, c]) / sqrt(var[n, c] + eps) + beta[c]
\`\`\`

### Which Axes Does Each Norm Reduce Over?
| Norm | Statistics over | One mean per |
|------|-----------------|--------------|
| BatchNorm | \`(N, H, W)\` | channel |
| LayerNorm | \`(C, H, W)\` | sample |
| InstanceNorm | \`(H, W)\` | (sample, channel) |
| GroupNorm | \`(C/G, H, W)\` | (sample, group) |

### Inputs
- \`x\`: float array \`(N, C, H, W)\`.
- \`gamma\`, \`beta\`: float arrays \`(C,)\`.
- \`eps\`: small positive float (default \`1e-5\`).

### Expected Return Format
An array of shape \`(N, C, H, W)\`. With \`gamma = 1, beta = 0\`, every \`out[n, c]\` has mean 0 and variance close to 1.

### Constraints
- Vectorised; no loops over samples or channels.
- **PyTorch track:** don't call \`F.instance_norm\` or \`nn.InstanceNorm2d\`.

### Follow-up
- Why does InstanceNorm hurt classification even though it helps style transfer?
- PyTorch's \`nn.InstanceNorm2d\` has \`affine=False\` by default. What does that change?
    `,
    examples: [
      {
        input: 'instance_norm(np.array([[[[1.0, 2.0], [3.0, 4.0]]]]), np.ones(1), np.zeros(1))',
        output: 'array([[[[-1.3416, -0.4472], [ 0.4472,  1.3416]]]])',
        explanation: 'One 2x2 map: mean 2.5, population variance 1.25, so (x - 2.5) / sqrt(1.25).',
      },
      {
        input: 'instance_norm(np.random.randn(2, 3, 4, 4), np.ones(3), np.array([1.0, 2.0, 3.0])).mean(axis=(2, 3))',
        output: 'array([[1., 2., 3.], [1., 2., 3.]])',
        explanation: 'Each (sample, channel) map is centred exactly, so its mean becomes beta[c].',
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
        description: 'Per-sample, per-channel mean near zero',
        input: `(lambda: (
    x := np.random.randn(2, 3, 8, 8) * 3 + 1,
    out := instance_norm(x, np.ones(3), np.zeros(3)),
    bool(np.allclose(out.mean(axis=(2, 3)), 0, atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Known values on a single 2x2 map',
        input: 'np.round(instance_norm(np.array([[[[1.0, 2.0], [3.0, 4.0]]]]), np.ones(1), np.zeros(1)), 4).tolist()',
        expected: '[[[[-1.3416, -0.4472], [0.4472, 1.3416]]]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Per-channel (population) variance near 1',
        input: `(lambda: (
    x := np.random.randn(2, 3, 8, 8) * 2,
    out := instance_norm(x, np.ones(3), np.zeros(3)),
    bool(np.allclose(out.var(axis=(2, 3)), 1, atol=1e-3))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Beta shifts each channel mean exactly',
        input: `(lambda: (
    x := np.random.randn(2, 3, 4, 4),
    out := instance_norm(x, np.ones(3), np.array([1.0, 2.0, 3.0])),
    np.round(out.mean(axis=(2, 3)), 4).tolist()
)[-1])()`,
        expected: '[[1.0, 2.0, 3.0], [1.0, 2.0, 3.0]]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Matches a per-(sample, channel) reference with random gamma and beta',
        input: `(lambda: (
    x := np.random.randn(2, 3, 5, 5), g := np.random.randn(3), b := np.random.randn(3),
    ref := np.stack([np.stack([g[c] * (x[n, c] - x[n, c].mean()) / np.sqrt(x[n, c].var() + 1e-5) + b[c] for c in range(3)]) for n in range(2)]),
    bool(np.allclose(instance_norm(x, g, b), ref, atol=1e-6))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Every (sample, channel) pair is an independent H x W image that gets its own mean and variance.',
      'Reduce over the spatial axes only, keeping them as size-1 axes so the statistics broadcast back over the image.',
      'mean = x.mean(axis=(2, 3), keepdims=True), var = x.var(axis=(2, 3), keepdims=True); reshape gamma and beta to (1, C, 1, 1).',
      'gamma and beta have shape (C,); multiplying them directly with a (N, C, H, W) array broadcasts against W, not C. Reshape them first.',
    ],
    solution: `import numpy as np

def instance_norm(x, gamma, beta, eps=1e-5):
    """Normalise each (sample, channel) map over H and W, then scale and shift per channel."""
    mean = x.mean(axis=(2, 3), keepdims=True)          # (N, C, 1, 1)
    var = x.var(axis=(2, 3), keepdims=True)            # population variance
    x_hat = (x - mean) / np.sqrt(var + eps)
    C = x.shape[1]
    return gamma.reshape(1, C, 1, 1) * x_hat + beta.reshape(1, C, 1, 1)
`,
  },
  {
    id: 'vit-patch-embeddings',
    title: 'ViT Patch Embeddings',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## ViT Patch Embeddings

**What you'll build:** \`patch_embed(...)\`, the input layer of a Vision Transformer: cut an image into square patches, flatten and project each one to a token, prepend a learnable CLS token and add positional embeddings.

### Background
A transformer consumes a sequence of vectors. ViT (Dosovitskiy et al., 2020) turns an image into one by treating each \`P x P\` patch as a "word": a 224x224 image with \`P = 16\` becomes 196 tokens. The extra CLS token gathers information from all patches through attention, and its final state feeds the classifier. Positional embeddings tell the model where each patch came from, since attention itself ignores order.

### Algorithm
For an image \`(C, H, W)\` with \`H\` and \`W\` divisible by \`P\`:
1. Split it into \`num_patches = (H / P) * (W / P)\` patches of shape \`(C, P, P)\`, ordered **row-major**: left to right along the top row of patches, then the next row.
2. Flatten each patch in \`(C, P, P)\` order (channel first, then row, then column) to a vector of length \`C * P * P\`.
3. Project: \`tokens = patches @ W_proj\`, shape \`(num_patches, embed_dim)\`.
4. Prepend the CLS token: \`[cls_token; tokens]\`, shape \`(num_patches + 1, embed_dim)\`.
5. Add the positional embeddings: \`+ pos_embed\`.

Steps 1 to 3 are exactly a \`Conv2d(C, embed_dim, kernel_size=P, stride=P)\`, which is how real ViT code implements them.

### Inputs
- \`image\`: float array \`(C, H, W)\`.
- \`patch_size\`: \`P\`, which divides \`H\` and \`W\`.
- \`embed_dim\`: \`D\`, the token size (equal to \`W_proj.shape[1]\`).
- \`W_proj\`: \`(C * P * P, D)\`; \`cls_token\`: \`(D,)\`; \`pos_embed\`: \`(num_patches + 1, D)\`.

### Expected Return Format
An array of shape \`(num_patches + 1, D)\`. Row 0 is \`cls_token + pos_embed[0]\`; row \`1 + i * (W / P) + j\` comes from the patch in patch-row \`i\`, patch-column \`j\`.

### Constraints
- Vectorise the patch extraction with \`reshape\` and \`transpose\` (loops over patches are acceptable in NumPy, but slow).
- **PyTorch track:** use \`reshape\`/\`permute\` (or \`Tensor.unfold\`); don't use \`nn.Conv2d\`.

### Follow-up
- How many tokens does a 224x224 image give with \`P = 14\`, and how does attention cost scale with \`P\`?
- How do you use a model trained at 224x224 on 384x384 images, given \`pos_embed\` has a fixed length?
    `,
    examples: [
      {
        input: 'image (3, 8, 8), patch_size=4, embed_dim=16, W_proj (48, 16), cls_token (16,), pos_embed (5, 16)',
        output: 'shape (5, 16)',
        explanation: '8 / 4 = 2 patches per side, 2 * 2 = 4 patches, plus the CLS token.',
      },
      {
        input: 'patch_embed(np.zeros((1, 4, 4)), 2, 3, np.ones((4, 3)), np.array([1.0, 2.0, 3.0]), np.full((5, 3), 0.5))',
        output: 'array([[1.5, 2.5, 3.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5]])',
        explanation: 'A blank image projects to zero tokens, so only the CLS token (row 0) and the positions remain.',
      },
    ],
    starterCode: `import numpy as np

def patch_embed(image, patch_size, embed_dim, W_proj, cls_token, pos_embed):
    """
    Create ViT patch embeddings.

    Args:
        image: Input image (C, H, W)
        patch_size: Size P of each square patch (divides H and W)
        embed_dim: Dimension D of the embeddings
        W_proj: Projection matrix (C*P*P, D)
        cls_token: CLS token embedding (D,)
        pos_embed: Positional embeddings (num_patches+1, D)

    Returns:
        Embeddings (num_patches + 1, D): CLS first, then patches in row-major order
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
        description: 'CLS token comes first; a blank image only adds positions',
        input: 'patch_embed(np.zeros((1, 4, 4)), 2, 3, np.ones((4, 3)), np.array([1.0, 2.0, 3.0]), np.full((5, 3), 0.5)).tolist()',
        expected: '[[1.5, 2.5, 3.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Patches are taken in row-major order and flattened in (C, P, P) order',
        input: `(lambda: (
    img := np.random.randn(2, 4, 4),
    W := np.random.randn(8, 5),
    out := patch_embed(img, 2, 5, W, np.zeros(5), np.zeros((5, 5))),
    bool(np.allclose(out[1], img[:, 0:2, 0:2].reshape(-1) @ W)
         and np.allclose(out[2], img[:, 0:2, 2:4].reshape(-1) @ W)
         and np.allclose(out[3], img[:, 2:4, 0:2].reshape(-1) @ W)
         and np.allclose(out[4], img[:, 2:4, 2:4].reshape(-1) @ W))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Full computation on a rectangular image (2 x 3 patches)',
        input: `(lambda: (
    img := np.random.randn(3, 4, 6), W := np.random.randn(12, 7), cls := np.random.randn(7), pos := np.random.randn(7, 7),
    ref := np.vstack([cls] + [img[:, i:i + 2, j:j + 2].reshape(-1) @ W for i in (0, 2) for j in (0, 2, 4)]) + pos,
    bool(np.allclose(patch_embed(img, 2, 7, W, cls, pos), ref))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
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
      'Think of the image as a grid of (H/P) x (W/P) patches; you need one flattened (C, P, P) vector per grid cell, in reading order.',
      'Split each spatial axis into (patch index, offset inside the patch): image.reshape(C, H//P, P, W//P, P). Then move both patch indices to the front.',
      'transpose(1, 3, 0, 2, 4) gives (H/P, W/P, C, P, P); reshape(-1, C*P*P) flattens it; then tokens = patches @ W_proj and np.vstack([cls_token[None], tokens]) + pos_embed.',
      'A plain image.reshape(-1, C*P*P) does not extract patches: it slices along memory order and mixes rows of different patches. Keep the channel axis first inside each flattened patch.',
    ],
    solution: `import numpy as np

def patch_embed(image, patch_size, embed_dim, W_proj, cls_token, pos_embed):
    """Patchify, project, prepend CLS, add positions -> (num_patches + 1, D)."""
    C, H, W = image.shape
    P = patch_size
    patches = (image.reshape(C, H // P, P, W // P, P)    # split each spatial axis into (patch, offset)
                    .transpose(1, 3, 0, 2, 4)           # (rows, cols, C, P, P): row-major patch order
                    .reshape(-1, C * P * P))            # one flattened (C, P, P) patch per row
    tokens = patches @ W_proj                           # (num_patches, D)
    tokens = np.vstack([cls_token[None, :], tokens])    # CLS token first
    return tokens + pos_embed

# Complexity: O(num_patches * C * P^2 * D) time, the cost of the projection.
`,
  },
  {
    id: 'cross-attention',
    title: 'Cross-Attention',
    section: 'pytorch-basics',
    difficulty: 'hard',
    description: `
## Cross-Attention

**What you'll build:** \`cross_attention(Q, K, V)\`: scaled dot-product attention where the queries come from one sequence and the keys and values from another, possibly of a different length.

### Background
In **self**-attention, \`Q\`, \`K\` and \`V\` are all projections of the same sequence. In **cross**-attention the queries come from one sequence (the decoder's tokens, or an image's latent pixels) and the keys and values from another (the encoder's output, or a text prompt). It is how a translation decoder looks at the source sentence and how Stable Diffusion conditions an image on text.

### Formula
\`\`\`text
scores  = Q @ K.T / sqrt(d_k)          (seq_q, seq_kv)
weights = softmax(scores, axis=-1)     each row sums to 1: query i's distribution over the keys
output  = weights @ V                  (seq_q, d_v)
\`\`\`
Dividing by \`sqrt(d_k)\` keeps the scores' variance around 1 for random unit-variance inputs; without it, large \`d_k\` pushes the softmax into a near one-hot regime with vanishing gradients.

### Inputs
| Name | Shape | Meaning |
|------|-------|---------|
| \`Q\` | \`(seq_q, d_k)\` | queries |
| \`K\` | \`(seq_kv, d_k)\` | keys (same feature size as Q) |
| \`V\` | \`(seq_kv, d_v)\` | values (same length as K) |

### Expected Return Format
An array of shape \`(seq_q, d_v)\`: one output per query, a weighted average of the rows of \`V\`.

### Edge Cases and Conventions
- No mask and no batch or head dimensions.
- Use a numerically stable softmax (subtract the row max).
- If all keys are identical, every query attends uniformly and gets the mean of \`V\`.

### Constraints
- Vectorised matrix products; no loops over queries.
- **PyTorch track:** \`F.softmax\` is fine; don't call \`F.scaled_dot_product_attention\` or \`nn.MultiheadAttention\`.

### Follow-up
- What is the time and memory complexity in \`seq_q\` and \`seq_kv\`?
- In an encoder-decoder transformer, which cross-attention tensors can be cached across decoding steps?
    `,
    examples: [
      {
        input: 'cross_attention(np.array([[2.0, 0.0]]), np.array([[1.0, 0.0], [0.0, 1.0]]), np.array([[1.0, 0.0], [0.0, 1.0]]))',
        output: 'array([[0.8044, 0.1956]])',
        explanation: 'Scores are [2, 0] / sqrt(2) = [1.414, 0]; their softmax [0.8044, 0.1956] weights the rows of V.',
      },
      {
        input: 'Q (4, 8), K (6, 8), V (6, 16)',
        output: 'shape (4, 16)',
        explanation: 'One output per query (4), with the value size (16); the 6 keys are averaged away.',
      },
    ],
    starterCode: `import numpy as np

def cross_attention(Q, K, V):
    """
    Scaled dot-product cross-attention.

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
        description: 'Identical keys give every query the mean of V',
        input: 'np.round(cross_attention(np.random.randn(2, 4), np.ones((3, 4)), np.array([[1.0, 0.0], [3.0, 2.0], [5.0, 4.0]])), 4).tolist()',
        expected: '[[3.0, 2.0], [3.0, 2.0]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Single query: known weights (scaled by sqrt(d_k))',
        input: 'np.round(cross_attention(np.array([[2.0, 0.0]]), np.array([[1.0, 0.0], [0.0, 1.0]]), np.array([[1.0, 0.0], [0.0, 1.0]])), 4).tolist()',
        expected: '[[0.8044, 0.1956]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Matches a reference implementation on random inputs',
        input: `(lambda: (
    Q := np.random.randn(4, 16), K := np.random.randn(6, 16), V := np.random.randn(6, 32),
    s := Q @ K.T / 4.0, w := np.exp(s - s.max(axis=1, keepdims=True)), w := w / w.sum(axis=1, keepdims=True),
    bool(np.allclose(cross_attention(Q, K, V), w @ V))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Stable for large scores',
        input: 'np.round(cross_attention(np.array([[100.0, 0.0]]), np.array([[10.0, 0.0], [9.99, 0.0]]), np.array([[1.0], [0.0]])), 4).tolist()',
        expected: '[[0.6698]]',
        hidden: true,
      },
    ],
    hints: [
      'Each query asks "which keys match me?"; the answer is a probability distribution over the keys, used to average the values.',
      'Three steps: similarity scores (seq_q, seq_kv), a softmax over the key axis, then a weighted sum of V.',
      'scores = Q @ K.T / np.sqrt(d_k); subtract scores.max(axis=-1, keepdims=True), exponentiate, divide by the row sums; return weights @ V.',
      'Normalise over the keys (axis=-1), not the queries, and scale by sqrt(d_k) with d_k = Q.shape[-1], not by d_k itself.',
    ],
    solution: `import numpy as np

def cross_attention(Q, K, V):
    """softmax(Q K^T / sqrt(d_k)) V for queries and keys from different sequences."""
    d_k = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)                              # (seq_q, seq_kv)
    weights = np.exp(scores - scores.max(axis=-1, keepdims=True))
    weights = weights / weights.sum(axis=-1, keepdims=True)      # softmax over the keys
    return weights @ V                                           # (seq_q, d_v)

# Complexity: O(seq_q * seq_kv * (d_k + d_v)) time, O(seq_q * seq_kv) memory for the weights.
`,
  },
  {
    id: 'depthwise-separable-conv',
    title: 'Depthwise Separable Convolution',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Depthwise Separable Convolution

**What you'll build:** the two halves of a depthwise separable convolution: \`depthwise_conv\` (each channel filtered by its own kernel) and \`pointwise_conv\` (a 1x1 convolution that mixes channels).

### Background
A standard convolution filters space and mixes channels in one step. MobileNet and Xception factor it into two cheaper steps: a **depthwise** convolution that filters each channel spatially on its own, then a **pointwise** 1x1 convolution that mixes the channels at each pixel. For a \`K x K\` kernel the parameter count drops from \`C_in * C_out * K²\` to \`C_in * K² + C_in * C_out\`: for \`C_in = C_out = 256, K = 3\`, from 589,824 to 67,840, about 8.7 times fewer.

### Formulas
"Valid" convolution (no padding), stride 1, computed as a cross-correlation (the kernel is **not** flipped, as in every deep learning library):
\`\`\`text
depthwise:  out[c, i, j] = sum_{u, v} x[c, i + u, j + v] * kernel[c, u, v]
            output shape (C, H - kH + 1, W - kW + 1)

pointwise:  out[o, i, j] = sum_c kernel[o, c, 0, 0] * x[c, i, j]
            output shape (C_out, H, W)
\`\`\`

### Inputs
- \`depthwise_conv(x, kernel)\`: \`x\` \`(C, H, W)\`, \`kernel\` \`(C, kH, kW)\` (one filter per channel).
- \`pointwise_conv(x, kernel)\`: \`x\` \`(C_in, H, W)\`, \`kernel\` \`(C_out, C_in, 1, 1)\` (the layout of a PyTorch \`Conv2d\` weight).

### Expected Return Format
- \`depthwise_conv\` returns \`(C, H - kH + 1, W - kW + 1)\`.
- \`pointwise_conv\` returns \`(C_out, H, W)\`.

### Constraints
- No batch dimension, no padding, no bias, stride 1.
- Loops over output positions are acceptable; a vectorised version uses \`np.lib.stride_tricks.sliding_window_view\` and \`np.einsum\`.
- **PyTorch track:** don't use \`F.conv2d\` or \`nn.Conv2d\` (in PyTorch, depthwise is \`Conv2d(C, C, k, groups=C)\`).

### Follow-up
- Compute the multiply-adds of both versions for a 56x56x128 input and a 3x3 kernel with 128 output channels.
- Why do MobileNetV2 blocks put the depthwise convolution between two pointwise ones (an inverted residual)?
    `,
    examples: [
      {
        input: 'depthwise_conv(np.ones((1, 3, 3)), np.ones((1, 2, 2)))',
        output: 'array([[[4., 4.], [4., 4.]]])',
        explanation: 'Each 2x2 window of ones sums to 4; a 3x3 input gives a (3 - 2 + 1) = 2x2 output.',
      },
      {
        input: 'pointwise_conv(np.array([[[1.0]], [[2.0]]]), np.array([[[[1.0]], [[1.0]]], [[[2.0]], [[-1.0]]]]))',
        output: 'array([[[3.]], [[0.]]])',
        explanation: 'At the single pixel, output channel 0 is 1*1 + 1*2 = 3 and output channel 1 is 2*1 - 1*2 = 0.',
      },
    ],
    starterCode: `import numpy as np

def depthwise_conv(x, kernel):
    """
    Depthwise convolution (valid, stride 1, no kernel flip).

    Args:
        x: Input (C, H, W)
        kernel: One filter per channel (C, kH, kW)

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
        description: 'Depthwise known values',
        input: 'depthwise_conv(np.ones((1, 3, 3)), np.ones((1, 2, 2))).tolist()',
        expected: '[[[4.0, 4.0], [4.0, 4.0]]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Depthwise preserves channels',
        input: 'depthwise_conv(np.random.randn(8, 5, 5), np.random.randn(8, 3, 3)).shape[0]',
        expected: '8',
        hidden: true,
      },
      {
        id: '5',
        description: 'Depthwise on a ramp image (cross-correlation, no kernel flip)',
        input: 'depthwise_conv(np.arange(16.0).reshape(1, 4, 4), np.array([[[1.0, 0.0], [0.0, -2.0]]])).tolist()',
        expected: '[[[-10.0, -11.0, -12.0], [-14.0, -15.0, -16.0], [-18.0, -19.0, -20.0]]]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Each channel only uses its own filter; non-square kernel',
        input: `(lambda: (
    x := np.random.randn(2, 5, 4), k := np.random.randn(2, 3, 2),
    ref := np.array([[[np.sum(x[c, i:i + 3, j:j + 2] * k[c]) for j in range(3)] for i in range(3)] for c in range(2)]),
    bool(np.allclose(depthwise_conv(x, k), ref))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'Pointwise known values and random reference',
        input: `(lambda: (
    small := pointwise_conv(np.array([[[1.0]], [[2.0]]]), np.array([[[[1.0]], [[1.0]]], [[[2.0]], [[-1.0]]]])).tolist(),
    x := np.random.randn(3, 4, 5), k := np.random.randn(6, 3, 1, 1),
    (small, bool(np.allclose(pointwise_conv(x, k), np.tensordot(k[:, :, 0, 0], x, axes=1))))
)[-1])()`,
        expected: '([[[3.0]], [[0.0]]], True)',
        hidden: true,
      },
    ],
    hints: [
      'Depthwise: C independent 2D convolutions, one per channel, each with its own kernel. Pointwise: at every pixel, a matrix-vector product over channels.',
      'Output size of a valid convolution is H - kH + 1 by W - kW + 1. For each output position, the result is the sum of the window times the kernel.',
      'Loop version: out[c, i, j] = np.sum(x[c, i:i+kH, j:j+kW] * kernel[c]). Vectorised: windows = np.lib.stride_tricks.sliding_window_view(x, (kH, kW), axis=(1, 2)), then np.einsum("chwij,cij->chw", windows, kernel). Pointwise: np.einsum("oc,chw->ohw", kernel[:, :, 0, 0], x).',
      'Don\'t flip the kernel (that would be a mathematical convolution, not what conv layers compute), and don\'t sum across channels in the depthwise step.',
    ],
    solution: `import numpy as np

def depthwise_conv(x, kernel):
    """Per-channel valid cross-correlation -> (C, H-kH+1, W-kW+1)."""
    C, kH, kW = kernel.shape
    # (C, out_H, out_W, kH, kW): every kH x kW window of every channel, as a view
    windows = np.lib.stride_tricks.sliding_window_view(x, (kH, kW), axis=(1, 2))
    # Each channel meets only its own filter: no sum over c
    return np.einsum('chwij,cij->chw', windows, kernel)

def pointwise_conv(x, kernel):
    """1x1 convolution: a linear map over channels at every pixel -> (C_out, H, W)."""
    return np.einsum('oc,chw->ohw', kernel[:, :, 0, 0], x)

# Complexity: depthwise O(C * H_out * W_out * kH * kW), pointwise O(C_out * C_in * H * W).
`,
  },
  {
    id: 'label-smoothing',
    title: 'Label Smoothing',
    section: 'pytorch-basics',
    difficulty: 'medium',
    description: `
## Label Smoothing

**What you'll build:** \`label_smoothing_loss(logits, targets, num_classes, smoothing)\`, cross-entropy against softened targets, averaged over the batch.

### Background
With one-hot targets, cross-entropy keeps rewarding the model for pushing the correct logit further above the others, which leads to over-confident, poorly calibrated predictions. Label smoothing (Szegedy et al., 2016) moves a fraction \`eps\` of the target mass onto all classes uniformly, so the optimum is a finite logit gap. It is standard in image classification and machine translation, and built into PyTorch as \`F.cross_entropy(..., label_smoothing=eps)\`.

### Formula
For \`K = num_classes\` and smoothing \`eps\`:
\`\`\`text
smooth = (1 - eps) * one_hot(target) + eps / K           # shape (batch, K), each row sums to 1
loss_i = -sum_k smooth[i, k] * log_softmax(logits_i)[k]
loss   = mean over the batch of loss_i
\`\`\`
The correct class gets \`1 - eps + eps / K\`, every other class \`eps / K\` (this matches PyTorch's definition). With \`eps = 0\` it is ordinary cross-entropy.

### Inputs
- \`logits\`: float array \`(batch, K)\` of raw scores.
- \`targets\`: integer array \`(batch,)\` with values in \`[0, K)\`.
- \`num_classes\`: \`K\`.
- \`smoothing\`: \`eps\` in \`[0, 1)\` (default 0.1).

### Expected Return Format
A Python \`float\`.

### Edge Cases and Conventions
- Compute \`log_softmax\` stably (subtract the row max) instead of taking \`log\` of a softmax.
- Smoothing **raises** the loss of a confident correct prediction, because the target now also wants some mass on the wrong classes.

### Constraints
- Vectorised over the batch.
- **PyTorch track:** \`F.log_softmax\` and \`F.one_hot\` are fine; don't use the \`label_smoothing\` argument of \`F.cross_entropy\` or \`nn.CrossEntropyLoss\`.

### Follow-up
- Show that the loss can be rewritten as \`(1 - eps) * CE + eps * mean_k(-log p_k)\`. What is the second term?
- Why can label smoothing hurt knowledge distillation from the smoothed model?
    `,
    examples: [
      {
        input: 'label_smoothing_loss(np.array([[2.0, 1.0, 0.1]]), np.array([0]), 3, 0.1)',
        output: '0.5137',
        explanation: 'Targets become [0.9333, 0.0333, 0.0333]; the extra weight on the low-probability classes raises the loss from 0.4170.',
      },
      {
        input: 'label_smoothing_loss(np.array([[2.0, 1.0, 0.1]]), np.array([0]), 3, 0.0)',
        output: '0.4170',
        explanation: 'With smoothing = 0 it is plain cross-entropy, -log(0.659).',
      },
    ],
    starterCode: `import numpy as np

def label_smoothing_loss(logits, targets, num_classes, smoothing=0.1):
    """
    Cross-entropy loss with label smoothing, averaged over the batch.

    Args:
        logits: Raw scores (batch, num_classes)
        targets: Integer labels (batch,)
        num_classes: Total number of classes K
        smoothing: Epsilon, the target mass spread uniformly over the K classes

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
        description: 'Smoothed loss value',
        input: 'round(label_smoothing_loss(np.array([[2.0, 1.0, 0.1]]), np.array([0]), 3, 0.1), 4)',
        expected: '0.5137',
        hidden: false,
      },
      {
        id: '4',
        description: 'Returns float',
        input: "type(label_smoothing_loss(np.array([[1.0, 2.0]]), np.array([0]), 2, 0.1)).__name__",
        expected: 'float',
        hidden: true,
      },
      {
        id: '5',
        description: 'Batch of two samples',
        input: 'round(label_smoothing_loss(np.array([[2.0, 1.0], [1.0, 2.0]]), np.array([0, 1]), 2, 0.1), 4)',
        expected: '0.3633',
        hidden: true,
      },
      {
        id: '6',
        description: 'Random batch with smoothing 0.2 matches the formula',
        input: `(lambda: (
    z := np.random.randn(5, 4), t := np.array([0, 3, 1, 2, 3]),
    lp := z - z.max(1, keepdims=True), lp := lp - np.log(np.exp(lp).sum(1, keepdims=True)),
    ref := float(np.mean(-(0.8 * lp[np.arange(5), t] + 0.05 * lp.sum(1)))),
    bool(abs(label_smoothing_loss(z, t, 4, 0.2) - ref) < 1e-9)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'Stable for huge logits',
        input: 'round(label_smoothing_loss(np.array([[1000.0, 0.0]]), np.array([0]), 2, 0.1), 4)',
        expected: '50.0',
        hidden: true,
      },
    ],
    hints: [
      'This is ordinary cross-entropy, except the target row is a soft distribution instead of a one-hot vector.',
      'Build the one-hot matrix (batch, K), mix it with the uniform distribution, then take the dot product of each target row with the log-probabilities.',
      'log_probs = shifted - np.log(np.exp(shifted).sum(-1, keepdims=True)) with shifted = logits - logits.max(-1, keepdims=True); smooth = (1 - eps) * one_hot + eps / K; loss = -(smooth * log_probs).sum(-1).mean().',
      'Add eps / K to every class, including the correct one (that is the PyTorch convention), and return float(...) so the result is a Python float.',
    ],
    solution: `import numpy as np

def label_smoothing_loss(logits, targets, num_classes, smoothing=0.1):
    """Mean cross-entropy against (1 - eps) * one_hot + eps / K targets."""
    shifted = logits - np.max(logits, axis=-1, keepdims=True)
    log_probs = shifted - np.log(np.sum(np.exp(shifted), axis=-1, keepdims=True))  # stable log-softmax
    one_hot = np.zeros_like(log_probs)
    one_hot[np.arange(len(targets)), targets] = 1.0
    smooth = (1 - smoothing) * one_hot + smoothing / num_classes                # rows sum to 1
    loss = -np.sum(smooth * log_probs, axis=-1)                                  # (batch,)
    return float(np.mean(loss))
`,
  },
  {
    id: 'lora-adapter',
    title: 'LoRA Adapter',
    section: 'pytorch-basics',
    difficulty: 'hard',
    description: `
## LoRA Adapter

**What you'll build:** \`lora_forward(x, W, A, B, alpha, r)\`, the forward pass of a linear layer with a frozen weight \`W\` plus a trainable low-rank update \`A @ B\`.

### Background
Fine-tuning every weight of a large model is expensive in memory: Adam stores two extra tensors per parameter. LoRA (Hu et al., 2021) freezes the pretrained \`W\` and learns a low-rank correction \`ΔW = (alpha / r) * A @ B\` with a small rank \`r\`. For a 4096x4096 layer and \`r = 8\` that is \`2 * 4096 * 8 = 65,536\` trainable parameters instead of 16,777,216, about 99.6% fewer. After training, \`ΔW\` can be merged into \`W\`, so inference costs nothing extra.

### Formula
\`\`\`text
output = x @ W + (alpha / r) * (x @ A) @ B
\`\`\`
| Symbol | Shape | Role |
|--------|-------|------|
| \`x\` | \`(batch, in_features)\` | input |
| \`W\` | \`(in_features, out_features)\` | frozen pretrained weight |
| \`A\` | \`(in_features, r)\` | down-projection (trainable, random init) |
| \`B\` | \`(r, out_features)\` | up-projection (trainable, **zero** init, so training starts exactly at the pretrained model) |
| \`alpha / r\` | scalar | scaling, so changing \`r\` doesn't require retuning the learning rate |

### Expected Return Format
An array of shape \`(batch, out_features)\`.

### Edge Cases and Conventions
- Compute \`(x @ A) @ B\`, not \`x @ (A @ B)\`: the result is the same, but the first costs \`O(batch * r * (in + out))\` while forming \`A @ B\` costs \`O(in * out * r)\` and a full-size matrix.
- \`alpha = 0\` gives the base output \`x @ W\`.

### Constraints
- Plain matrix products; no loops.
- **PyTorch track:** the hidden tests check that, with \`W\` frozen, autograd gives gradients to \`A\` and \`B\` only.

### Follow-up
- Which weight matrices of a transformer do people usually adapt with LoRA, and why?
- QLoRA stores \`W\` in 4 bits. Which parts still need full precision?
    `,
    examples: [
      {
        input: 'lora_forward(np.array([[1.0, 2.0]]), np.eye(2), np.array([[1.0], [1.0]]), np.array([[1.0, 0.0]]), alpha=2, r=1)',
        output: 'array([[7., 2.]])',
        explanation: 'Base x @ W = [1, 2]. Low-rank path: x @ A = [3], times B = [3, 0], times alpha / r = 2 gives [6, 0]. Sum: [7, 2].',
      },
      {
        input: 'x (2, 768), W (768, 768), A (768, 8), B (8, 768), alpha=16, r=8',
        output: 'shape (2, 768)',
        explanation: 'Same output shape as the frozen layer; only 12,288 of the parameters are trainable.',
      },
    ],
    starterCode: `import numpy as np

def lora_forward(x, W, A, B, alpha, r):
    """
    LoRA forward pass: x @ W + (alpha / r) * (x @ A) @ B.

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
        description: 'Known values: base + (alpha / r) * x @ A @ B',
        input: 'lora_forward(np.array([[1.0, 2.0]]), np.eye(2), np.array([[1.0], [1.0]]), np.array([[1.0, 0.0]]), 2, 1).tolist()',
        expected: '[[7.0, 2.0]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Equals a forward pass with the merged weight W + (alpha / r) * A @ B',
        input: `(lambda: (
    x := np.random.randn(3, 6), W := np.random.randn(6, 5), A := np.random.randn(6, 2), B := np.random.randn(2, 5),
    bool(np.allclose(lora_forward(x, W, A, B, 4, 2), x @ (W + 2.0 * A @ B)))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Zero-initialised B leaves the pretrained output unchanged',
        input: `(lambda: (
    x := np.random.randn(4, 6), W := np.random.randn(6, 3),
    bool(np.allclose(lora_forward(x, W, np.random.randn(6, 2), np.zeros((2, 3)), 16, 2), x @ W))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Different input/output dims and the alpha / r scaling',
        input: `(lambda: (
    x := np.random.randn(3, 64), W := np.random.randn(64, 32), A := np.random.randn(64, 4), B := np.random.randn(4, 32),
    out := lora_forward(x, W, A, B, 8, 4),
    (out.shape, bool(np.allclose(out - x @ W, 2.0 * x @ A @ B)))
)[-1])()`,
        expected: '((3, 32), True)',
        hidden: true,
      },
    ],
    hints: [
      'The output is the frozen layer\'s output plus a small correction that goes through a narrow bottleneck of width r.',
      'Compute the base path x @ W and the low-rank path separately, scale the low-rank path, and add them.',
      'lora = (alpha / r) * ((x @ A) @ B); return x @ W + lora.',
      'Multiply x @ A first: forming A @ B builds a full (in_features, out_features) matrix and throws away LoRA\'s savings. And scale by alpha / r, not alpha alone.',
    ],
    solution: `import numpy as np

def lora_forward(x, W, A, B, alpha, r):
    """Frozen base path plus the scaled low-rank update."""
    base = x @ W                              # frozen pretrained path
    update = (x @ A) @ B * (alpha / r)        # never forms the (in, out) matrix A @ B
    return base + update

# Complexity: O(batch * in * out) for the base, O(batch * r * (in + out)) for the adapter.
`,
  },
  {
    id: 'gradient-checkpointing',
    title: 'Gradient Checkpointing',
    section: 'pytorch-basics',
    difficulty: 'hard',
    description: `
## Gradient Checkpointing

**What you'll build:** the two halves of activation checkpointing: a forward pass that keeps only selected activations, and a recompute function that rebuilds any activation from the nearest saved one.

### Background
Backpropagation needs the activations of the forward pass, so memory grows linearly with depth: \`O(n)\` for \`n\` layers. Checkpointing stores only some of them and recomputes the rest during the backward pass. With \`sqrt(n)\` evenly spaced checkpoints, memory falls to \`O(sqrt(n))\` at the cost of roughly one extra forward pass. It is how large transformers fit long sequences on a GPU (\`torch.utils.checkpoint\`).

### Conventions
- \`layers\` is a list of callables; activation \`i\` is the **output** of \`layers[i]\`.
- The input \`x\` is always saved, under the key \`-1\`.
- \`checkpoint_indices\` lists which layer outputs to keep.

### Algorithm
**\`checkpoint_forward(layers, x, checkpoint_indices)\`**
1. \`saved = {-1: copy of x}\`.
2. Run the layers in order. After layer \`i\`, if \`i\` is in \`checkpoint_indices\`, store a copy of its output under key \`i\`.
3. Return \`(final_output, saved)\`.

**\`checkpoint_recompute(layers, saved_activations, checkpoint_indices, layer_idx)\`**
1. Find the nearest saved key **strictly below** \`layer_idx\`: \`start = max(k for k in saved if k < layer_idx)\` (\`-1\` always qualifies).
2. Starting from \`saved[start]\`, run \`layers[start + 1], ..., layers[layer_idx]\`.
3. Return the result, the output of layer \`layer_idx\`.

### Inputs
- \`layers\`: list of functions mapping an array to an array.
- \`x\`: input array; \`checkpoint_indices\`: list of layer indices (may be empty).
- \`layer_idx\`: index of the activation to rebuild, \`0 <= layer_idx < len(layers)\`.

### Expected Return Format
- \`checkpoint_forward\` returns a tuple \`(output, saved)\`: the final activation and a dict \`{index: activation}\` containing exactly \`-1\` and the checkpoint indices.
- \`checkpoint_recompute\` returns the activation of layer \`layer_idx\`.

### Edge Cases and Conventions
- Store **copies**, so later in-place changes can't corrupt the checkpoints.
- Recompute runs only the layers after the nearest checkpoint, never the whole network.

### Constraints
- **PyTorch track:** \`torch.utils.checkpoint\` isn't available in the browser; run the forward under \`torch.no_grad()\` (no graph, so no stored intermediates) and recompute with autograd enabled.

### Follow-up
- Why is \`sqrt(n)\` the best number of evenly spaced checkpoints?
- Which layers are cheapest to recompute and most expensive to store in a transformer block?
    `,
    examples: [
      {
        input: 'layers = [x*2, x+1, x*3, x-1], checkpoint_forward(layers, np.array([1.0]), [1, 3])',
        output: '(array([8.]), {-1: array([1.]), 1: array([3.]), 3: array([8.])})',
        explanation: 'Activations are 2, 3, 9, 8; only the input and the outputs of layers 1 and 3 are kept.',
      },
      {
        input: 'checkpoint_recompute(layers, saved, [1, 3], 2)',
        output: 'array([9.])',
        explanation: 'The nearest saved activation below 2 is index 1 (value 3); only layer 2 (x*3) is re-run.',
      },
    ],
    starterCode: `import numpy as np

def checkpoint_forward(layers, x, checkpoint_indices):
    """
    Forward pass that saves only the input and the checkpoint activations.

    Args:
        layers: List of layer functions
        x: Input array
        checkpoint_indices: Indices of the layers whose outputs to save

    Returns:
        (output, saved): the final output and a dict index -> activation
        (key -1 holds the input)
    """
    # Your code here
    pass

def checkpoint_recompute(layers, saved_activations, checkpoint_indices, layer_idx):
    """
    Recompute the output of layer layer_idx from the nearest saved activation below it.

    Args:
        layers: List of layer functions
        saved_activations: Dict index -> activation from checkpoint_forward
        checkpoint_indices: Indices that were saved
        layer_idx: Layer whose output to rebuild

    Returns:
        Activation (output) of layer layer_idx
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
      {
        id: '5',
        description: 'Saved values and recompute from the input when no checkpoint precedes',
        input: `(lambda: (
    layers := [lambda x: x * 2, lambda x: x + 1, lambda x: x * 3, lambda x: x - 1],
    res := checkpoint_forward(layers, np.array([1.0]), [1, 3]),
    (res[0].tolist(), {k: v.tolist() for k, v in sorted(res[1].items())}, checkpoint_recompute(layers, res[1], [1, 3], 0).tolist(), checkpoint_recompute(layers, res[1], [1, 3], 2).tolist())
)[-1])()`,
        expected: '([8.0], {-1: [1.0], 1: [3.0], 3: [8.0]}, [2.0], [9.0])',
        hidden: true,
      },
      {
        id: '6',
        description: 'Recompute only runs the layers after the nearest checkpoint',
        input: `(lambda: (
    calls := [],
    layers := [(lambda i: (lambda t: (calls.append(i), t + i)[-1]))(i) for i in range(6)],
    result := checkpoint_forward(layers, np.zeros(1), [1, 3]),
    calls.clear(),
    out := checkpoint_recompute(layers, result[1], [1, 3], 5),
    (calls, out.tolist())
)[-1])()`,
        expected: '([4, 5], [15.0])',
        hidden: true,
      },
    ],
    hints: [
      'The forward pass is an ordinary loop over the layers that also fills a dict; recompute is the same loop started part way through.',
      'Save the input under -1 before the loop, then after each layer check whether its index is in checkpoint_indices.',
      'Recompute: start = max(k for k in saved_activations if k < layer_idx); act = saved_activations[start]; for i in range(start + 1, layer_idx + 1): act = layers[i](act).',
      'Activation i is the output of layers[i], so the loop must include layer_idx itself (range(..., layer_idx + 1)). Store copies (x.copy()) so the checkpoints can\'t be changed later.',
    ],
    solution: `import numpy as np

def checkpoint_forward(layers, x, checkpoint_indices):
    """Run all layers, keeping only the input (key -1) and the checkpoint outputs."""
    checkpoints = set(checkpoint_indices)
    saved = {-1: x.copy()}
    activation = x
    for i, layer in enumerate(layers):
        activation = layer(activation)
        if i in checkpoints:
            saved[i] = activation.copy()      # everything else is discarded
    return activation, saved

def checkpoint_recompute(layers, saved_activations, checkpoint_indices, layer_idx):
    """Rebuild the output of layers[layer_idx] from the nearest saved activation below it."""
    start = max(k for k in saved_activations if k < layer_idx)   # -1 always qualifies
    activation = saved_activations[start].copy()
    for i in range(start + 1, layer_idx + 1):                     # re-run only this segment
        activation = layers[i](activation)
    return activation

# Memory: O(len(checkpoint_indices)) activations; recompute runs at most the gap between checkpoints.
`,
  },
  {
    id: 'training-loop',
    title: 'The Training Loop',
    section: 'pytorch-basics',
    difficulty: 'easy',
    description: `
## The Training Loop

**What you'll build:** \`train_linear_model(X, y, lr, epochs)\`, which fits a linear model with full-batch gradient descent and records the loss at every epoch.

### Background
Every PyTorch model, from linear regression to an LLM, is trained by the same five-line loop:

\`\`\`python
for epoch in range(epochs):
    optimizer.zero_grad()          # 1. clear the gradients from the last step
    pred = model(X)                # 2. forward pass
    loss = loss_fn(pred, y)        # 3. compute the loss
    loss.backward()                # 4. backprop: fill p.grad for every parameter
    optimizer.step()               # 5. update the parameters
\`\`\`

Forgetting \`zero_grad()\` is the classic bug: \`.grad\` **accumulates**, so every step would use the sum of all past gradients.

### Formula
Fit \`y_hat = X @ w + b\` with **full-batch gradient descent** on the mean squared error, with \`N\` samples:

\`\`\`text
L     = mean((X @ w + b - y) ** 2)
dL/dw = (2 / N) * X.T @ (X @ w + b - y)
dL/db = (2 / N) * sum(X @ w + b - y)
w     = w - lr * dL/dw
b     = b - lr * dL/db
\`\`\`

### Inputs
- \`X\`: float array \`(N, d)\`; \`y\`: float array \`(N,)\`.
- \`lr\`: learning rate (default 0.1); \`epochs\`: number of gradient steps (default 100).

### Edge Cases and Conventions
- Start from **zeros**: \`w = 0\` (shape \`(d,)\`), \`b = 0\`.
- Each epoch, compute the loss with the **current** parameters, append it to the history, then take one step. So \`losses[0]\` is the loss of the all-zero model, \`mean(y ** 2)\`.

### Constraints
- **NumPy track:** write the gradients by hand (what \`loss.backward()\` does for you in PyTorch).
- **PyTorch track:** use \`nn.Linear\`, \`nn.MSELoss\` and \`torch.optim.SGD\`, and let \`loss.backward()\` compute the gradients.

### Expected Return Format
Return a dictionary with these keys:
- \`'losses'\`: list of \`epochs\` Python floats, the loss **before** each update
- \`'w'\`: learned weights, shape \`(d,)\`
- \`'b'\`: learned bias, a Python float

### Follow-up
- Switch to minibatches (next problem). Why does the loss curve become noisy, and why is that often fine?
- Where would \`model.train()\` / \`model.eval()\` and \`torch.no_grad()\` go in a loop with a validation set?
    `,
    examples: [
      {
        input: 'train_linear_model(np.array([[1.0], [2.0], [3.0]]), np.array([2.0, 4.0, 6.5]), lr=0.05, epochs=4)',
        output: "{'losses': [20.75, 4.2638, 0.9907, 0.3383], 'w': array([1.716]), 'b': 0.6924}",
        explanation: 'losses[0] = mean(y ** 2) = 20.75 is the loss of the all-zero model; each step lowers it.',
      },
      {
        input: 'X = np.random.randn(64, 2); y = X @ [2, -3] + 0.5; train_linear_model(X, y, lr=0.1, epochs=200)',
        output: "{'losses': [..., ~0.0], 'w': array([ 2., -3.]), 'b': 0.5}",
        explanation: 'On noise-free data the parameters converge to the true ones (rounded to 3 decimals).',
      },
    ],
    starterCode: `import numpy as np

def train_linear_model(X, y, lr=0.1, epochs=100) -> dict:
    """
    Fit y ~ X @ w + b with full-batch gradient descent on the MSE.

    Args:
        X: Inputs of shape (N, d)
        y: Targets of shape (N,)
        lr: Learning rate
        epochs: Number of gradient steps

    Returns:
        dict with 'losses' (list of floats, loss before each step),
        'w' (array of shape (d,)) and 'b' (float)
    """
    w = np.zeros(X.shape[1])
    b = 0.0
    losses = []
    # Your code here: forward, loss, gradients, update
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'History length, first loss, strictly decreasing',
        input: "(lambda: (X := np.random.randn(32, 2), y := X @ np.array([2.0, -3.0]) + 0.5, r := train_linear_model(X, y, lr=0.1, epochs=50), len(r['losses']), bool(np.isclose(r['losses'][0], np.mean(y ** 2))), all(a > b for a, b in zip(r['losses'], r['losses'][1:])))[-3:])()",
        expected: '(50, True, True)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Converges to the true parameters',
        input: "(lambda: (X := np.random.randn(64, 2), y := X @ np.array([2.0, -3.0]) + 0.5, r := train_linear_model(X, y, lr=0.1, epochs=200), np.round(r['w'], 3).tolist(), round(float(r['b']), 3), bool(r['losses'][-1] < 1e-6))[-3:])()",
        expected: '([2.0, -3.0], 0.5, True)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Exact loss history and parameters on a tiny dataset',
        input: "(lambda: (r := train_linear_model(np.array([[1.0], [2.0], [3.0]]), np.array([2.0, 4.0, 6.5]), lr=0.05, epochs=4), [round(l, 4) for l in r['losses']], np.round(r['w'], 4).tolist(), round(float(r['b']), 4))[1:])()",
        expected: '([20.75, 4.2638, 0.9907, 0.3383], [1.716], 0.6924)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Noisy data: converges to the least-squares solution',
        input: `(lambda: (
    X := np.random.randn(100, 3), y := X @ np.array([1.0, -2.0, 0.5]) - 1.0 + 0.3 * np.random.randn(100),
    r := train_linear_model(X, y, lr=0.1, epochs=300),
    A := np.hstack([X, np.ones((100, 1))]),
    sol := np.linalg.lstsq(A, y, rcond=None)[0],
    bool(np.allclose(r['w'], sol[:3], atol=1e-4)),
    bool(abs(r['b'] - sol[3]) < 1e-4),
    bool(abs(r['losses'][-1] - np.mean((A @ sol - y) ** 2)) < 1e-6)
)[-3:])()`,
        expected: '(True, True, True)',
        hidden: true,
      },
    ],
    hints: [
      'Every epoch does the same three things: forward pass and loss, gradients, parameter update. Record the loss before the update.',
      'Inside the loop: residual = X @ w + b - y and loss = np.mean(residual ** 2); append float(loss) to the history before updating the parameters.',
      'Gradients: grad_w = 2 / N * X.T @ residual and grad_b = 2 / N * residual.sum(); then w -= lr * grad_w, b -= lr * grad_b.',
      'Use the mean (divide by N), not the sum: with a sum the effective learning rate grows with the dataset size and lr = 0.1 diverges.',
    ],
    solution: `import numpy as np

def train_linear_model(X, y, lr=0.1, epochs=100) -> dict:
    """
    Fit y ~ X @ w + b with full-batch gradient descent on the MSE.
    """
    n = X.shape[0]
    w = np.zeros(X.shape[1])
    b = 0.0
    losses = []
    for _ in range(epochs):
        # forward + loss
        residual = X @ w + b - y
        losses.append(float(np.mean(residual ** 2)))
        # backward (by hand)
        grad_w = 2 / n * X.T @ residual
        grad_b = 2 / n * residual.sum()
        # step
        w = w - lr * grad_w
        b = b - lr * grad_b
    return {'losses': losses, 'w': w, 'b': float(b)}
`,
  },
  {
    id: 'dataloader-batching',
    title: 'Minibatches: Dataset & DataLoader',
    section: 'pytorch-basics',
    difficulty: 'easy',
    description: `
## Minibatches: Dataset & DataLoader

**What you'll build:** \`make_batches(X, y, batch_size, shuffle, drop_last, seed)\`, which returns every minibatch of one epoch, like iterating a PyTorch \`DataLoader\`.

### Background
Training on the whole dataset at every step is slow, and training on it in a fixed order biases each epoch. A **data loader** shuffles the sample indices once per epoch and cuts them into minibatches. In PyTorch this is

\`\`\`python
loader = DataLoader(TensorDataset(X, y), batch_size=32, shuffle=True, drop_last=False,
                    generator=torch.Generator().manual_seed(0))
for xb, yb in loader:
    ...
\`\`\`

### Algorithm
Return all minibatches of one epoch as a list:

1. Build an index order: \`np.arange(N)\` if \`shuffle=False\`, otherwise **exactly** \`np.random.default_rng(seed).permutation(N)\`.
2. Cut the order into consecutive chunks of \`batch_size\`. The last chunk can be smaller.
3. If \`drop_last=True\`, drop the last chunk when it has fewer than \`batch_size\` samples.
4. For each chunk \`idx\`, emit the pair \`(X[idx], y[idx])\`, so rows of \`X\` stay paired with their labels.

Shuffling with a seeded generator keeps the run reproducible: the same seed gives the same batches.

| N | batch_size | drop_last | number of batches | last batch size |
|---|---|---|---|---|
| 10 | 4 | False | 3 | 2 |
| 10 | 4 | True | 2 | 4 |
| 12 | 4 | either | 3 | 4 |

### Inputs
- \`X\`: array \`(N, ...)\`; \`y\`: array \`(N,)\`.
- \`batch_size\`: positive integer; \`shuffle\`, \`drop_last\`: booleans; \`seed\`: integer.

### Expected Return Format
A **list** of tuples \`(X_batch, y_batch)\` with shapes \`(B, ...)\` and \`(B,)\`, where \`B = batch_size\` except possibly for the last batch.

### Constraints
- **NumPy track:** the shuffled order must be exactly \`np.random.default_rng(seed).permutation(N)\` (a hidden test checks it).
- **PyTorch track:** use \`TensorDataset\` and \`DataLoader\` with \`generator=torch.Generator().manual_seed(seed)\`. The order then comes from torch's RNG, so the tests check coverage, pairing and determinism instead of an exact order.

### Follow-up
- Why shuffle every epoch instead of once? What goes wrong if the data is sorted by label and you never shuffle?
- What do \`num_workers\` and \`pin_memory\` do in a real \`DataLoader\`?
    `,
    examples: [
      {
        input: 'X = np.arange(20).reshape(10, 2), y = np.arange(10), batch_size=4, shuffle=False',
        output: '[(X[0:4], [0, 1, 2, 3]), (X[4:8], [4, 5, 6, 7]), (X[8:10], [8, 9])]',
        explanation: 'Three batches; the last one holds the 2 leftover samples',
      },
      {
        input: 'same, drop_last=True',
        output: '[(X[0:4], [0, 1, 2, 3]), (X[4:8], [4, 5, 6, 7])]',
        explanation: 'The incomplete last batch is dropped',
      },
    ],
    starterCode: `import numpy as np

def make_batches(X, y, batch_size, shuffle=True, drop_last=False, seed=0) -> list:
    """
    Split (X, y) into minibatches for one epoch.

    Args:
        X: Inputs of shape (N, ...)
        y: Labels of shape (N,)
        batch_size: Samples per batch
        shuffle: Shuffle with np.random.default_rng(seed).permutation(N)
        drop_last: Drop the final batch if it is smaller than batch_size
        seed: Seed for the shuffle

    Returns:
        List of (X_batch, y_batch) tuples
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'No shuffle: consecutive batches, smaller last batch',
        input: '(lambda: [yb.tolist() for _, yb in make_batches(np.arange(20).reshape(10, 2), np.arange(10), 4, shuffle=False)])()',
        expected: '[[0, 1, 2, 3], [4, 5, 6, 7], [8, 9]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'drop_last=True: batch shapes',
        input: '(lambda: [xb.shape for xb, _ in make_batches(np.zeros((10, 3)), np.arange(10), 4, shuffle=True, drop_last=True)])()',
        expected: '[[4, 3], [4, 3]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Shuffled order is exactly default_rng(seed).permutation(N)',
        input: '(lambda: (bs := make_batches(np.arange(22).reshape(11, 2), np.arange(11), 3, seed=7), np.concatenate([yb for _, yb in bs]).tolist() == np.random.default_rng(7).permutation(11).tolist(), [len(yb) for _, yb in bs])[1:])()',
        expected: '(True, [3, 3, 3, 2])',
        hidden: true,
      },
      {
        id: '4',
        description: 'Each sample exactly once, rows stay paired with labels',
        input: '(lambda: (X := np.arange(26).reshape(13, 2), bs := make_batches(X, np.arange(13), 5, seed=3), sorted(np.concatenate([yb for _, yb in bs]).tolist()) == list(range(13)), all(bool((xb[:, 0] == 2 * yb).all()) for xb, yb in bs))[-2:])()',
        expected: '(True, True)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Same seed gives the same batches, a different seed does not',
        input: '(lambda: (X := np.random.randn(16, 2), y := np.arange(16), a := [yb.tolist() for _, yb in make_batches(X, y, 4, seed=1)], b := [yb.tolist() for _, yb in make_batches(X, y, 4, seed=1)], c := [yb.tolist() for _, yb in make_batches(X, y, 4, seed=2)], a == b, a != c)[-2:])()',
        expected: '(True, True)',
        hidden: true,
      },
    ],
    hints: [
      'Work with an array of indices: decide the order once, then slice it into consecutive chunks.',
      'order = np.random.default_rng(seed).permutation(N) if shuffle else np.arange(N); then loop start = 0, batch_size, 2 * batch_size, ... and take idx = order[start:start + batch_size].',
      'With drop_last, skip idx when len(idx) < batch_size. Index both arrays with the same idx: (X[idx], y[idx]).',
      'Shuffle the indices, never X and y separately: two independent shuffles break the pairing between samples and labels.',
    ],
    solution: `import numpy as np

def make_batches(X, y, batch_size, shuffle=True, drop_last=False, seed=0) -> list:
    """
    Split (X, y) into minibatches for one epoch.
    """
    n = len(X)
    order = np.random.default_rng(seed).permutation(n) if shuffle else np.arange(n)
    batches = []
    for start in range(0, n, batch_size):
        idx = order[start:start + batch_size]
        if drop_last and len(idx) < batch_size:
            break
        batches.append((X[idx], y[idx]))
    return batches
`,
  },
];
