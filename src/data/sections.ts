import { Section } from '../types';

export const sections: Section[] = [
  // ==========================================
  // PART 1: FOUNDATIONS
  // ==========================================
  {
    id: 'numpy-fundamentals',
    title: 'NumPy Fundamentals',
    description: 'Create, index, broadcast, reduce and reshape NumPy arrays: the operations every ML codebase is built on.',
    icon: '🔢',
    introduction: `
# NumPy Fundamentals

## Why it matters
Every ML system speaks arrays. A batch of images is a \`(batch, height, width, channels)\` array, a linear layer's weights are a \`(d_in, d_out)\` matrix, and PyTorch tensors copy NumPy's API almost name for name. Interviewers use NumPy questions to check that you think in whole arrays instead of Python loops, and most "the model trains but the numbers are wrong" bugs turn out to be shape or axis mistakes.

## Core ideas

### An array is a buffer plus a shape
An \`ndarray\` is one flat block of memory plus metadata: a \`dtype\` (\`float64\`, \`int64\`, ...), a \`shape\` and \`strides\` (how many bytes to jump per axis). Many operations only rewrite the metadata, so they are O(1) and return a **view** that shares memory with the original:

| Operation | Returns | Cost |
|-----------|---------|------|
| Basic slice \`a[1:3, ::2]\` | view | O(1) |
| \`reshape\` (contiguous input), \`.T\`, \`transpose\` | view | O(1) |
| Fancy index \`a[[0, 2]]\`, boolean mask \`a[a > 0]\` | copy | O(k) |
| \`flatten()\`, arithmetic, reductions | new array | O(n) |

### Creation
\`np.zeros(shape)\`, \`np.ones(shape)\` and \`np.eye(n)\` take sizes; \`np.arange(stop)\` (half-open, excludes \`stop\`) and \`np.linspace(start, stop, num)\` (closed, includes \`stop\`) take ranges.

### Axes and reductions
\`arr.sum(axis=k)\` removes axis \`k\`. For a \`(n_rows, n_cols)\` array, \`axis=0\` gives one value per column and \`axis=1\` one value per row. \`keepdims=True\` keeps the reduced axis with size 1, which is what you want when you subtract the result back from the array.

### Broadcasting
Two shapes are compatible when, compared **from the right**, each pair of dimensions is equal or one of them is 1 (missing leading dimensions count as 1). Size-1 dimensions are stretched without copying:

| Left | Right | Result |
|------|-------|--------|
| \`(batch, d)\` | \`(d,)\` | \`(batch, d)\`: a bias added to every row |
| \`(batch, d)\` | \`(batch, 1)\` | \`(batch, d)\`: a per-row scale |
| \`(n, 1)\` | \`(1, m)\` | \`(n, m)\`: an outer operation |
| \`(3, 4)\` | \`(3,)\` | error: 4 and 3 don't match |

### Reshape versus transpose
Arrays are stored in row-major (C) order, so the last axis changes fastest. \`reshape\` keeps that order and regroups it: entry \`[i, j]\` of a \`(4, 6)\` reshape is element \`6*i + j\` of the vector. \`transpose\` keeps the data and reorders the axes: \`a.T[j, i] = a[i, j]\`. Both can produce a \`(6, 4)\` array from a \`(4, 6)\` one, with different values.

## Worked example: standardising features
Standardisation turns each column into mean 0 and standard deviation 1, using one reduction and one broadcast:

\`\`\`python
X = np.array([[1., 10.],
              [2., 20.],
              [3., 30.]])          # (n_samples=3, n_features=2)
mu = X.mean(axis=0)                # [ 2., 20.]        shape (2,)
sigma = X.std(axis=0)              # [0.8165, 8.165]   shape (2,), population std
Z = (X - mu) / sigma               # (3, 2) - (2,) broadcasts over rows
# Z = [[-1.2247, -1.2247],
#      [ 0.    ,  0.    ],
#      [ 1.2247,  1.2247]]
\`\`\`

Both columns end up identical because the second column is just 10 times the first: standardisation removes scale.

## Common pitfalls
- **\`(n,)\` versus \`(n, 1)\`**: a 1D array lines up with the *last* axis. \`X - X.mean(axis=1)\` fails for non-square \`X\` and, worse, silently subtracts along the wrong axis when \`X\` is square. Use \`keepdims=True\`.
- **Views alias memory**: \`b = a[0]; b[:] = 0\` zeroes a row of \`a\`. Call \`.copy()\` when you need independence.
- **Integer dtypes truncate**: assigning \`0.7\` into an \`int64\` array stores \`0\`. Create float arrays when you'll store floats.
- **\`ddof\`**: \`np.std\` divides by \`N\` (\`ddof=0\`); \`torch.std\` and pandas divide by \`N - 1\` by default.
- **Float equality**: compare with \`np.allclose\`, never \`==\`.
- **Accidental huge broadcasts**: \`(n, 1, d) - (1, m, d)\` builds an \`(n, m, d)\` array. That's fine for pairwise distances on small data, and an out-of-memory error at scale.

## Interview angle
- "Vectorise this loop" is the classic opener: replace per-element Python with one array expression, then explain why it's faster (no interpreter overhead per element, contiguous memory, SIMD).
- Expect "what shape comes out?" questions about broadcasting, \`axis=\` and \`keepdims\`, and be ready to state the broadcasting rule from memory.
- Complexity: elementwise ops and reductions are O(n); reshape, transpose and slicing are O(1) views; fancy indexing copies.
- Follow-ups: views versus copies, contiguity (why PyTorch's \`.view\` fails after a transpose), and the memory cost of broadcasting.

## Problems in this section
1. **Array Creation Methods**: build zeros, ones, \`arange\`, \`linspace\` and identity arrays and learn which take shapes and which take ranges.
2. **Indexing and Slicing**: extract rows, columns, sub-blocks, the diagonal and reversed rows, with half-open slices.
3. **Broadcasting Operations**: centre rows and columns, add a bias and scale rows without loops.
4. **Aggregation Functions**: global, per-row and per-column statistics plus a 2D \`argmax\`/\`argmin\`.
5. **Reshape and Transpose**: regroup a vector into 2D and 3D arrays, permute axes and flatten back.

Next: **Python Basics for ML** for quick vectorisation warm-ups, **Einstein Summation** for a single notation covering all of these operations, and **Normalize Features** in Data Preprocessing, which reuses the standardisation above.
    `,
    problems: ['numpy-array-creation', 'numpy-indexing', 'numpy-broadcasting', 'numpy-aggregations', 'numpy-reshape-transpose'],
  },
  {
    id: 'python-basics',
    title: 'Python Basics for ML',
    description: 'Warm up with vectorised NumPy: sum an array, multiply matrices and broadcast a vector across rows.',
    icon: '🐍',
    introduction: `
# Python Basics for ML

## Why it matters
ML code runs on arrays, and the single biggest habit to build is **vectorisation**: expressing a computation as one operation on whole arrays instead of a Python loop over elements. Summing a million floats with a Python loop takes about a hundred times longer than \`arr.sum()\`. Every forward pass, loss and gradient you write later is built from the three operations in this section: reductions, matrix multiplication and broadcasting.

## Core ideas

### Vectorise, don't loop
A Python loop pays interpreter overhead for every element. A NumPy call runs one compiled loop over contiguous memory, often with SIMD instructions. Rule of thumb: if you are writing \`for i in range(len(arr))\`, there is almost always an array expression that does the same thing.

### Reductions
A reduction collapses values into fewer values: \`arr.sum()\`, \`arr.mean()\`, \`arr.max()\`. With no \`axis\` it reduces everything to a scalar; \`axis=0\` reduces down the rows (one result per column) and \`axis=1\` across the columns (one result per row).

### Matrix multiplication
For \`A\` of shape \`(m, n)\` and \`B\` of shape \`(n, p)\`:

\`\`\`text
C[i, j] = sum over k of A[i, k] * B[k, j]        C has shape (m, p)
\`\`\`

The inner dimensions (\`n\`) must match and disappear. It costs \`m * n * p\` multiply-adds. Three spellings:

| Call | 2D inputs | Batched 3D inputs |
|------|-----------|-------------------|
| \`A @ B\` / \`np.matmul(A, B)\` | matrix product | batched product, \`(b, m, n) @ (b, n, p) -> (b, m, p)\` |
| \`np.dot(A, B)\` | matrix product | a different contraction: \`(2, 3, 4)\` dot \`(2, 4, 5)\` gives \`(2, 3, 2, 5)\` |
| \`A * B\` | **elementwise** product, not matmul | elementwise |

Prefer \`@\`: it reads like the maths and does the right thing for batches.

### Broadcasting
When shapes differ, NumPy compares them from the right; dimensions must be equal or 1, and size-1 (or missing) dimensions are stretched. That is how a bias vector of shape \`(n,)\` is added to every row of an \`(m, n)\` matrix without copying it \`m\` times.

## Worked example: a linear layer by hand
A linear layer computes \`y = x @ W + b\`. With a batch of 2 samples, 2 input features and 2 outputs:

\`\`\`python
x = np.array([[1, 2],
              [3, 4]])           # (batch=2, d_in=2)
W = np.array([[5, 6],
              [7, 8]])           # (d_in=2, d_out=2)
b = np.array([10, 20])           # (d_out,)

x @ W        # [[19, 22], [43, 50]]   e.g. 19 = 1*5 + 2*7
x @ W + b    # [[29, 42], [53, 70]]   b broadcasts over the batch
(x @ W).sum()  # 134                  a reduction to one number
\`\`\`

All three operations of this section show up in one line of a neural network.

## Common pitfalls
- **\`*\` is not matrix multiplication**: \`A * B\` multiplies elementwise (and broadcasts), so it can silently "work" with the wrong meaning.
- **Shape mismatches**: \`(2, 3) @ (2, 3)\` raises a \`ValueError\` (3 vs 2 in the inner dimension). Transpose the operand you meant: \`A @ B.T\`.
- **1D vectors are neither rows nor columns**: \`v @ A\` treats \`v\` as a row and \`A @ v\` as a column, and both return 1D. Reshape to \`(n, 1)\` when you need an explicit column.
- **Integer overflow**: small integer dtypes wrap around (two \`int8\` values of 100 add up to -56). Use float arrays for numeric work.
- **Floats aren't exact**: \`0.1 + 0.2 == 0.3\` is \`False\`. Compare floats with a tolerance (\`np.isclose\`, \`np.allclose\`).

## Interview angle
- "Implement matrix multiply" usually means: state the shape rule, write \`A @ B\`, then possibly the triple loop, and give its O(m·n·p) cost.
- Follow-ups: why is the vectorised version faster; what's the difference between \`np.dot\`, \`np.matmul\` and \`*\`; how would you multiply a batch of matrices; what happens with mismatched shapes.
- Be ready to say how broadcasting adds a bias to a batch, and what shape the result has.

## Problems in this section
1. **Array Sum**: reduce an array to a single number with \`np.sum\`.
2. **Matrix Multiplication**: multiply \`(m, n)\` by \`(n, p)\` with \`@\`, and check the shape rule.
3. **Broadcasting Addition**: add a vector to every row of a matrix with one \`+\`.

For deeper practice, see **NumPy Fundamentals** (indexing, axes, reshape) and **Einstein Summation**, which writes matrix products as index expressions like \`'ik,kj->ij'\`.
    `,
    problems: ['numpy-array-sum', 'numpy-matrix-multiply', 'numpy-broadcast-add'],
  },
  {
    id: 'einsum',
    title: 'Einstein Summation (Einsum)',
    description: 'Write sums, matrix products and batched multi-head attention as einsum index strings.',
    icon: '∑',
    introduction: `
# Einstein Summation (Einsum)

## Why it matters
Einsum describes a tensor operation by **naming its axes**: \`'bqd,bkd->bqk'\` says "for every batch \`b\`, query \`q\` and key \`k\`, sum over \`d\`", which is exactly attention's score computation. Research code for transformers, mixture-of-experts layers and bilinear models uses einsum because the subscripts document the shapes. In interviews it's a fast way to show you understand which axes are kept, broadcast or contracted, and the same strings work in \`np.einsum\` and \`torch.einsum\`.

## Core ideas

### The rules
In \`np.einsum('<inputs>-><output>', *operands)\`, each operand gets one letter per axis.
1. A letter that appears in the **output** is kept, in the order written after \`->\`.
2. A letter that appears in the inputs but **not** in the output is summed over (contracted).
3. A letter shared by several operands pairs those axes up; their sizes must match.
4. A letter repeated **within one operand** (\`'ii'\`) walks its diagonal.

Mentally, einsum is a nested loop over every distinct letter that multiplies the matching entries and accumulates them into the output slot:

\`\`\`python
# C = np.einsum('ik,kj->ij', A, B)
for i in range(m):
    for j in range(n):
        for k in range(K):             # k is missing from the output: summed
            C[i, j] += A[i, k] * B[k, j]
\`\`\`

The cost of a two-operand einsum is the product of the sizes of all distinct letters: \`m * K * n\` here.

### Common patterns
| Subscripts | Meaning | Equivalent |
|------------|---------|------------|
| \`'ij->'\` | sum of all entries | \`A.sum()\` |
| \`'ij->i'\` / \`'ij->j'\` | row sums / column sums | \`A.sum(axis=1)\` / \`A.sum(axis=0)\` |
| \`'ij->ji'\` | transpose | \`A.T\` |
| \`'ii->i'\` / \`'ii->'\` | diagonal / trace | \`np.diag(A)\` / \`np.trace(A)\` |
| \`'i,i->'\` | dot product | \`u @ v\` |
| \`'i,j->ij'\` | outer product | \`np.outer(u, v)\` |
| \`'ij,j->i'\` | matrix-vector | \`A @ v\` |
| \`'ik,kj->ij'\` | matrix multiply | \`A @ B\` |
| \`'ij,ij->ij'\` / \`'ij,ij->'\` | Hadamard product / Frobenius inner product | \`A * B\` / \`(A * B).sum()\` |
| \`'bij,bjk->bik'\` | batched matmul | \`A @ B\` on 3D arrays |
| \`'bqd,bkd->bqk'\` | attention scores, \`(batch, seq_q, d) x (batch, seq_k, d)\` | \`Q @ K.transpose(0, 2, 1)\` |
| \`'bhqk,bhkd->bhqd'\` | multi-head weighted sum of values | \`A @ V\` on 4D arrays |

## Worked example
\`\`\`python
A = np.array([[1, 2],
              [3, 4]])
B = np.array([[5, 6],
              [7, 8]])
np.einsum('ik,kj->ij', A, B)   # [[19, 22], [43, 50]]   C[0, 0] = 1*5 + 2*7 = 19
np.einsum('ii->', A)           # 5                      1 + 4
np.einsum('ij,ij->', A, A)     # 30                     1 + 4 + 9 + 16

Q = np.array([[[1., 0.], [0., 1.]]])               # (batch=1, seq_q=2, d=2)
K = np.array([[[1., 1.], [2., 0.], [0., 3.]]])     # (batch=1, seq_k=3, d=2)
np.einsum('bqd,bkd->bqk', Q, K)                    # (1, 2, 3)
# [[[1., 2., 0.],      query 0 picks feature 0 of each key
#   [1., 0., 3.]]]     query 1 picks feature 1 of each key
\`\`\`

Divide those scores by \`sqrt(d) = 1.414\` and softmax each row, and query 0's attention weights over the three keys are \`[0.284, 0.576, 0.140]\`.

## Common pitfalls
- **A dropped letter is summed, silently**: \`'bij,bjk->ik'\` sums over the batch as well as \`j\`. Check that every axis you want to keep appears after \`->\`.
- **Output order matters**: \`'ij->ji'\` transposes; \`'bqk'\` versus \`'bkq'\` gives scores of a different layout.
- **Implicit mode surprises**: without \`->\`, the output letters are sorted alphabetically, so \`np.einsum('ji', A)\` returns \`A.T\`. Always write the arrow.
- **Repeated letters need equal sizes**: \`'ii->i'\` on a \`(2, 3)\` array raises an error; check for squareness first.
- **Integer inputs stay integer**: einsum of int arrays returns ints. Convert to float before dividing by \`sqrt(d)\` or taking a softmax.
- **Many operands can be slow**: \`np.einsum\` doesn't optimise the contraction order by default; pass \`optimize=True\` for three or more operands.

## Interview angle
- "Write attention with einsum" is common: name the axes, write \`'bqd,bkd->bqk'\` and \`'bqk,bkd->bqd'\`, and state the cost, \`O(batch * seq_q * seq_k * d)\`.
- Expect to translate between einsum and \`@\`/\`transpose\`/\`sum\` in both directions, and to explain which letters are contracted.
- Follow-ups: multi-head attention without explicit transposes (\`'bqhd,bkhd->bhqk'\`), a bilinear form \`x^T W y\` as \`'bi,ij,bj->b'\`, and when einsum is slower than a hand-written \`@\`.

## Problems in this section
1. **Einsum Fundamentals**: sums, transpose and diagonal of one matrix.
2. **Matrix Operations with Einsum**: matmul, matrix-vector, outer, Hadamard, Frobenius and trace.
3. **Batch Operations with Einsum**: batched attention scores, softmax weights and the weighted sum of values.
4. **Multi-Head Attention with Einsum**: split heads, attend per head and merge, without transposes.
5. **Einsum vs Traditional Operations**: check each einsum against its NumPy equivalent.

The attention problems lead straight into **Scaled Dot-Product Attention** and **Multi-Head Attention** in the Transformers section.
    `,
    problems: ['einsum-basics', 'einsum-matrix-ops', 'einsum-batch-ops', 'einsum-advanced', 'einsum-vs-matmul'],
  },
  {
    id: 'pytorch-basics',
    title: 'PyTorch Basics',
    description: 'Tensors, autograd, modules, losses, optimizers and the training loop, plus the norms, activations and adapters of modern models: in idiomatic PyTorch or from scratch in NumPy.',
    icon: '🔥',
    defaultLanguage: 'pytorch',
    introduction: `
# PyTorch Basics

Problems in this section open in the **PyTorch** track, which runs on an in-browser, NumPy-backed subset of the torch API (real PyTorch has no WebAssembly build). Switch to **NumPy** with the toggle to build the same ideas from scratch: same function names, same tests.

## Why It Matters

PyTorch is the default framework for research and most production deep learning, and "implement X in PyTorch" is a standard ML interview format. Interviewers expect you to move fluently between tensor shapes, autograd and \`nn.Module\`, and to know what the built-ins (\`F.cross_entropy\`, \`torch.optim.Adam\`, \`nn.LayerNorm\`) compute under the hood, because that is where silent bugs live.

## Core Ideas

### Tensors
A tensor is an n-dimensional array with a \`dtype\`, a \`shape\` and (optionally) a gradient. The API mirrors NumPy almost one to one:

| Task | PyTorch | NumPy |
|------|---------|-------|
| Create | \`torch.tensor(data)\`, \`torch.zeros(3, 4)\`, \`torch.randn(2, 3)\` | \`np.array(data)\`, \`np.zeros((3, 4))\`, \`np.random.randn(2, 3)\` |
| Reduce | \`x.sum(dim=1, keepdim=True)\` | \`x.sum(axis=1, keepdims=True)\` |
| Reshape | \`x.view(2, -1)\`, \`x.permute(0, 2, 1)\`, \`x.unsqueeze(0)\` | \`x.reshape(2, -1)\`, \`x.transpose(0, 2, 1)\`, \`x[None]\` |
| Default float | \`float32\` | \`float64\` |
| \`x.std()\` | unbiased (divides by n - 1) | population (divides by n) |

Shapes in this section follow the usual conventions: \`(batch, features)\` for MLPs, \`(N, C, H, W)\` for images, \`(seq_len, d_model)\` for token sequences.

### Autograd
Every operation on a tensor with \`requires_grad=True\` is recorded in a graph. \`loss.backward()\` walks it in reverse with the chain rule and **adds** each gradient into \`.grad\`:

\`\`\`python
x = torch.tensor(2.0, requires_grad=True)
y = x ** 2 + 3 * x + 1
y.backward()
x.grad  # tensor(7.) = 2x + 3
\`\`\`

For a linear layer \`Y = X @ W + b\` with upstream gradient \`G = dL/dY\`: \`dL/dW = X.T @ G\`, \`dL/db = G.sum(0)\`, \`dL/dX = G @ W.T\`. Every gradient has the shape of its tensor.

### Modules, Losses and Optimizers
An \`nn.Module\` owns \`nn.Parameter\`s and sub-modules and defines \`forward\`; \`model.parameters()\` collects every trainable tensor for the optimizer. Losses expect specific inputs (\`F.cross_entropy\` wants raw logits and integer classes). Optimizers (\`SGD\` with momentum, \`Adam\`) turn gradients into updates, and schedulers change the learning rate over time.

### The Training Loop

\`\`\`python
for xb, yb in loader:              # minibatches from a DataLoader
    optimizer.zero_grad()          # 1. clear old gradients
    loss = loss_fn(model(xb), yb)  # 2-3. forward pass and loss
    loss.backward()                # 4. gradients into p.grad
    optimizer.step()               # 5. update the parameters
\`\`\`

## Worked Micro-Example

Fit \`y_hat = w * x + b\` to \`X = [[1], [2], [3]]\`, \`y = [2, 4, 6.5]\`, starting from \`w = b = 0\` with \`lr = 0.05\`:

| Quantity | Value |
|----------|-------|
| loss = mean((Xw + b - y)²) | (4 + 16 + 42.25) / 3 = 20.75 |
| dL/dw = (2/3) * X.T @ residual | (2/3) * (-2 - 8 - 19.5) = -19.667 |
| dL/db = (2/3) * sum(residual) | (2/3) * (-12.5) = -8.333 |
| after one step | w = 0.9833, b = 0.4167 |
| new loss | 4.2638 |

\`loss.backward()\` and \`optimizer.step()\` compute exactly this for \`nn.Linear(1, 1)\`; **The Training Loop** tests these numbers.

## Common Pitfalls

- **Forgetting \`optimizer.zero_grad()\`**: gradients accumulate across steps.
- **Shape broadcasting surprises**: \`nn.Linear\` returns \`(N, 1)\`; comparing it to targets of shape \`(N,)\` broadcasts the loss to \`(N, N)\`.
- **Unstable softmax**: always subtract the row max, or use \`log_softmax\` / \`F.cross_entropy\` instead of \`log(softmax(x))\`.
- **Wrong variance**: normalisation layers use the population variance (\`unbiased=False\`).
- **dtype mismatches**: \`torch.tensor([1, 2])\` is \`int64\`; NumPy arrays come in as \`float64\`.
- **Non-reproducible shuffles**: seed a \`torch.Generator\` for the \`DataLoader\`.

## Interview Angle

Expect to write a layer, loss or optimizer step from scratch and then compare it with the built-in. Typical follow-ups: why \`F.cross_entropy\` takes logits; what Adam's bias correction does at step 1; BatchNorm vs LayerNorm vs GroupNorm vs RMSNorm (which axes each reduces over); how gradient accumulation and checkpointing trade compute for memory; how many parameters LoRA trains. Know the costs: a linear layer is \`O(batch * in * out)\`, attention is \`O(seq_q * seq_kv * d)\` in time and \`O(seq_q * seq_kv)\` in memory.

## Problems in This Section

1. **Tensor Creation**: build tensors with \`tensor\`, \`zeros\`, \`randn\`, \`arange\`, \`linspace\`, \`eye\` and \`full\`.
2. **Tensor Operations**: arithmetic, reductions over a dimension and reshapes.
3. **Autograd Basics**: gradients of a polynomial and of a linear layer.
4. **Neural Network Modules**: \`Linear\`, \`ReLU\`, \`Sequential\` and a 2-layer MLP.
5. **Loss Functions**: softmax, cross-entropy, MSE and binary cross-entropy.
6. **GELU Activation**: the transformer activation, tanh approximation.
7. **LeakyReLU & Swish**: activations that avoid dead units.
8. **Softmax with Temperature**: sharpen or flatten a distribution, stably.
9. **RMS Normalization**: the LLaMA-style norm without mean subtraction.
10. **Group Normalization**: batch-size-independent normalisation over channel groups.
11. **Adam Optimizer**: one Adam step with bias correction.
12. **SGD with Momentum**: PyTorch's momentum update.
13. **Learning Rate Scheduling**: linear warmup plus cosine decay.
14. **Gradient Accumulation**: large effective batches from micro-batches.
15. **Instance Normalization**: per-image, per-channel normalisation.
16. **ViT Patch Embeddings**: turn an image into a token sequence.
17. **Cross-Attention**: queries from one sequence, keys and values from another.
18. **Depthwise Separable Convolution**: MobileNet's cheap convolution.
19. **Label Smoothing**: cross-entropy with softened targets.
20. **LoRA Adapter**: low-rank fine-tuning of a frozen layer.
21. **Gradient Checkpointing**: save some activations, recompute the rest.
22. **The Training Loop**: the five-step loop on a linear model.
23. **Minibatches: Dataset & DataLoader**: shuffled, seeded minibatches.

Related sections: **Neural Networks** (backprop, batch norm), **Optimization & Training**, **Transformer Architecture** (multi-head attention) and **End-to-End Implementations**.
    `,
    problems: ['tensor-creation', 'tensor-operations', 'autograd-concepts', 'nn-modules', 'loss-functions', 'gelu-activation', 'leaky-relu-swish', 'softmax-temperature', 'rmsnorm', 'group-norm', 'adam-optimizer', 'sgd-momentum', 'lr-scheduling', 'gradient-accumulation', 'instance-norm', 'vit-patch-embeddings', 'cross-attention', 'depthwise-separable-conv', 'label-smoothing', 'lora-adapter', 'gradient-checkpointing', 'training-loop', 'dataloader-batching'],
  },

  // ==========================================
  // PART 2: DATA HANDLING
  // ==========================================
  {
    id: 'data-preprocessing',
    title: 'Data Preprocessing',
    description: 'Scale, impute, encode and split data without leaking the test set into training.',
    icon: '🧹',
    introduction: `
# Data Preprocessing

## Why it matters

Every production model sits behind a preprocessing pipeline: missing values are filled, features are scaled, categories are encoded and the data is split before any training happens. Bugs here are silent. The model still trains, but it learns from leaked or distorted data, and the offline score stops predicting what happens in production. Interviewers like this topic because it separates people who have shipped models from people who have only called \`fit\`.

## Core ideas

Throughout, \`X\` has shape \`(n_samples, n_features)\`; statistics such as a mean or a median are computed **per column** (\`axis=0\`).

### Feature scaling

Distance-based models (k-NN, k-means, SVMs) and gradient descent are sensitive to the scale of each feature: a feature measured in thousands dominates one measured in fractions.

| Method | Formula | Result | Sensitive to outliers? |
|--------|---------|--------|------------------------|
| Min-max | \`(x - min) / (max - min)\` | values in \`[0, 1]\` | Very: one extreme value sets the range |
| Standardisation (z-score) | \`(x - mean) / std\` | mean 0, std 1 | Less, but the mean and std still move |

Tree-based models (decision trees, random forests, gradient boosting) only compare a feature with thresholds, so they don't need scaling.

### Missing values

Detect with \`np.isnan\`. Simple strategies are dropping rows, or filling (imputing) with the column **mean** (fine for symmetric data) or **median** (robust to outliers and skew). Adding a "was missing" indicator column often helps, because missingness itself can carry signal.

### Categorical features

**One-hot encoding** turns a category \`c\` out of \`K\` into a length-\`K\` vector with a single 1 at index \`c\`, so the model doesn't read an order into the labels. **Label encoding** (category to integer) is fine for trees but implies a false order for linear models.

### Splitting the data

Fit on **train**, tune hyperparameters on **validation**, and report on **test** once. A **stratified** split splits each class separately, so a rare class keeps its proportion in every split instead of disappearing from the test set by chance.

### The golden rule: fit on train only

Every statistic (min, max, mean, std, median, the category list) is **learned** from the training split and then **applied** unchanged to validation and test. Computing it on the full dataset leaks test information into training.

## Worked micro-example

One feature with an outlier: \`x = [2, 4, 6, 8, 100]\`.

\`\`\`text
min-max:  (x - 2) / 98       -> [0.000, 0.020, 0.041, 0.061, 1.000]
z-score:  mean = 24, std = 38.05
          (x - 24) / 38.05   -> [-0.578, -0.526, -0.473, -0.420, 1.997]
\`\`\`

Min-max squashes the four normal values into \`[0, 0.06]\` because the outlier sets the range. Now leakage: with train \`[1, 2, 3, NaN]\` the median fill is \`2.0\`; if you (wrongly) include a test value of \`100\` before imputing, the fill becomes \`2.5\`, so the test set has changed the training data.

## Common pitfalls

- **Train/test leakage**: scaling, imputing or selecting features on the whole dataset before splitting.
- **Division by zero**: a constant column has \`max - min = 0\` and \`std = 0\`. Decide on a convention (scikit-learn leaves such a column at 0).
- **\`np.mean\` on NaNs** returns \`nan\`; use \`np.nanmean\` / \`np.nanmedian\` or a mask.
- **Modifying inputs in place**: \`arr[mask] = v\` changes the caller's array; copy first.
- **Banker's rounding**: Python's \`round(2.5) == 2\`, which matters when you turn fractions into counts.
- **Population vs sample std**: NumPy's \`std\` uses \`ddof=0\`, which is also what \`StandardScaler\` uses.

## Interview angle

- "Why must the scaler be fit on train only?" and "How would you catch leakage?" (a validation score that is too good to be true, or a feature that is only available after the label).
- "Mean or median imputation?" (median for skewed data; mention indicator features).
- "When does one-hot encoding break down?" (high cardinality: use hashing, target encoding with out-of-fold statistics, or embeddings).
- "Why stratify?" (rare classes and stable metric estimates). All of these transforms are \`O(n * d)\`.

## Problems in this section

1. **Normalize Features**: min-max scale a 1-D array to \`[0, 1]\`, with a convention for constant input.
2. **Handle Missing Data**: replace NaNs with the mean of the observed values without touching the input.
3. **One-Hot Encoding**: turn integer labels into a \`(n, num_classes)\` indicator matrix.
4. **Stratified Train/Val/Test Split**: reproducible per-class splitting with an explicit rounding rule.
5. **Leakage-Safe Imputation and Scaling**: fit the imputer and scaler on train only, then transform both splits.

Related: the cross-validation and evaluation problems in **Model Evaluation**, and the distance-based models in **Supervised Learning** and **Unsupervised Learning**, which depend on well-scaled features.
    `,
    problems: ['normalize-features', 'handle-missing-data', 'one-hot-encode', 'stratified-split', 'leakage-safe-imputation'],
  },

  // ==========================================
  // PART 3: CLASSICAL MACHINE LEARNING
  // ==========================================
  {
    id: 'supervised-learning',
    title: 'Supervised Learning',
    description: 'Implement core supervised learning algorithms from scratch.',
    icon: '📊',
    introduction: `
# Supervised Learning

Supervised learning is when you train a model on labeled data to make predictions.

## Key Concepts

### Linear Regression
- **Goal**: Predict continuous values
- **Formula**: y = wx + b
- **Training**: Minimize mean squared error (MSE)
- **Gradient descent**: Update weights iteratively

### Logistic Regression
- **Goal**: Binary classification
- **Sigmoid function**: Maps outputs to [0, 1] probabilities
- **Loss**: Binary cross-entropy
- **Decision boundary**: Linear separation of classes

### Decision Trees
- **Concept**: Recursive binary splits based on features
- **Splitting criteria**: Gini impurity, Information gain
- **Advantages**: Interpretable, handles non-linear relationships

### Support Vector Machines (SVMs)
- **Goal**: Find the maximum-margin hyperplane
- **Hinge loss**: max(0, 1 - y * score) — penalizes misclassified and low-margin samples
- **Regularization**: L2 penalty on weights to maximize margin
- **Key insight**: Only "support vectors" (points near the boundary) affect the decision boundary

### Beyond Linear Models
- **k-Nearest Neighbours**: no training; predict by majority vote of the k closest points
- **Gaussian Naive Bayes**: Bayes' rule with per-class Gaussians, computed in log space with logsumexp
- **Ridge & Lasso**: L2 shrinks weights smoothly (closed form); L1 sets some exactly to zero (coordinate descent)
- **Gradient Boosting**: add weak learners (stumps) one at a time, each fit to the residuals of the current model

### The Interview Perspective
Interviewers often ask you to:
- Implement gradient descent from scratch
- Explain the math behind these algorithms
- Compute and interpret hinge loss
- Discuss trade-offs between algorithms

Let's build these algorithms!
    `,
    problems: ['logistic-regression', 'binary-cross-entropy', 'hinge-loss', 'decision-tree-split', 'linear-regression-gd', 'logistic-regression-full', 'linear-svm', 'knn-classifier', 'naive-bayes', 'ridge-lasso', 'gradient-boosting', 'decision-tree-bagging'],
  },
  {
    id: 'unsupervised-learning',
    title: 'Unsupervised Learning',
    description: 'Build k-means, PCA centring, Gaussian mixtures with EM and DBSCAN from scratch.',
    icon: '🔍',
    introduction: `
# Unsupervised Learning

## Why it matters

Most data has no labels. Unsupervised methods find structure anyway: customer segments, compressed representations, anomalies, or the initial clusters a labelling team starts from. k-means and PCA are among the most frequently asked "implement it from scratch" interview questions, and the ideas behind them (alternating optimisation, EM, eigen-decompositions) come back in deep learning.

## Core ideas

Data is a matrix \`X\` of shape \`(n_samples, n_features)\`; \`k\` (or \`K\`) is the number of clusters or components.

### k-means (Lloyd's algorithm)

Minimise the **inertia** (within-cluster sum of squares) by alternating two steps that each can only lower it:

\`\`\`text
assign:  label_i = argmin_j ||x_i - c_j||^2
update:  c_j     = mean of the points with label j
inertia = sum_i ||x_i - c_{label_i}||^2
\`\`\`

It converges to a local minimum, so initialisation matters: **k-means++** picks each new centroid with probability proportional to its squared distance from the centroids chosen so far. Distances for all pairs come from broadcasting \`X[:, None, :] - C[None, :, :]\`, shape \`(n, k, d)\`.

### PCA

Find orthogonal directions of maximum variance. **Centre** the data first, then take the eigenvectors of the covariance matrix (or the SVD of the centred data):

\`\`\`text
Xc  = X - X.mean(axis=0)               # (n, d)
Cov = Xc.T @ Xc / (n - 1)              # (d, d)
Cov = V diag(lambda) V^T               # eigenvalues sorted descending
Z   = Xc @ V[:, :k]                    # (n, k) projection
explained variance ratio = lambda_i / sum(lambda)
\`\`\`

Without centring, the first "component" points at the mean of the data instead of the direction of greatest spread.

### Gaussian mixtures and EM

A soft version of k-means: each point gets a **responsibility** for each component. The E-step computes responsibilities (in log space, with logsumexp); the M-step re-fits weights, means and variances from them. The log-likelihood never decreases.

### DBSCAN

Density-based: a **core point** has at least \`min_samples\` points (itself included) within \`eps\`. Clusters grow from core points; points not reachable from any core point are **noise** (\`-1\`). No \`k\` to choose, and clusters can have any shape.

| Method | Cluster shape | Needs \`k\`? | Soft? | Handles noise? |
|--------|---------------|------------|-------|----------------|
| k-means | spherical, similar size | yes | no | no |
| GMM | ellipsoidal | yes | yes | partly (low likelihood) |
| DBSCAN | arbitrary | no (\`eps\`, \`min_samples\`) | no | yes |

## Worked micro-example

k-means on 1-D points \`[1, 2, 3, 10, 11, 12]\` with initial centroids \`[1, 2]\`:

\`\`\`text
iter 1  assign: 1 -> c0;  2, 3, 10, 11, 12 -> c1     update: c = [1.0, 7.6]
iter 2  assign: 1, 2, 3 -> c0;  10, 11, 12 -> c1      update: c = [2.0, 11.0]
iter 3  labels unchanged -> stop.  inertia = (1 + 0 + 1) + (1 + 0 + 1) = 4
\`\`\`

PCA on \`X = [[1, 2], [2, 1], [3, 4], [4, 3]]\`: the mean is \`[2.5, 2.5]\`, the covariance is \`[[1.667, 1], [1, 1.667]]\`, with eigenvalues \`2.667\` and \`0.667\`. The first component \`[1, 1] / sqrt(2)\` explains \`2.667 / 3.333 = 80%\` of the variance.

## Common pitfalls

- **Unscaled features**: every method here uses distances or variances, so a feature in large units dominates. Standardise first.
- **Forgetting to centre** before PCA, or centring the test set with its own mean instead of the training mean.
- **Empty clusters** in k-means: a centroid that wins no points has no mean; you need a rule (re-seed it on a far point).
- **Underflow in EM**: products of Gaussian densities hit \`0.0\`; work with log-densities and logsumexp.
- **Ties**: \`argmin\` returns the first minimum, so state the tie-breaking rule and keep it.
- **Memory**: the \`(n, k, d)\` broadcast is fine for small data; for large \`n\` use \`||x||^2 - 2 x.c + ||c||^2\`.

## Interview angle

- Implement k-means in 15 minutes, vectorised; each iteration costs \`O(n * k * d)\`.
- "How do you choose \`k\`?" (elbow on inertia, silhouette score, BIC for GMMs) and "Why can k-means fail?" (non-spherical clusters, different densities, outliers, bad initialisation).
- PCA: eigen-decomposition vs SVD (SVD is more stable and avoids forming \`X^T X\`), the cost \`O(n d^2 + d^3)\`, and what "explained variance" means.
- k-means as a special case of EM with hard assignments and equal spherical variances.
- DBSCAN: how to choose \`eps\` (the k-distance plot) and why it struggles with clusters of different densities.

## Problems in this section

1. **K-Means: Assign to Nearest Centroid**: the vectorised assignment step.
2. **PCA Step 1: Center the Data**: subtract the column means, the first step of PCA.
3. **Gaussian Mixture Model (EM)**: a log-space E-step and the full EM loop for a 1-D mixture.
4. **DBSCAN Clustering**: core points, border points and noise, matching scikit-learn's labels.
5. **K-Means from Scratch**: k-means++ seeding, Lloyd iterations, a convergence test and empty-cluster handling.

Related: **Data Preprocessing** (scale features before clustering), and the k-NN classifier in **Supervised Learning**, which uses the same distance computations.
    `,
    problems: ['kmeans-clustering', 'pca-implementation', 'gmm-em', 'dbscan', 'kmeans-full'],
  },
  {
    id: 'model-evaluation',
    title: 'Model Evaluation',
    description: 'Compute classification metrics, k-fold splits, ROC/AUC, PR curves and calibration error, with the edge cases done right.',
    icon: '📈',
    introduction: `
# Model Evaluation

## Why it matters

A model is only as good as the number you use to judge it. Choosing the wrong metric (accuracy on a 1%-positive fraud dataset), the wrong threshold, or a leaky validation scheme ships models that look great offline and fail in production. Interviewers probe this constantly: "Which metric would you use, and why?" is part of almost every ML system design round.

## Core ideas

### The confusion matrix

For binary labels (positive = 1), every prediction falls into one cell:

| | Predicted 1 | Predicted 0 |
|---|---|---|
| **Actual 1** | TP (true positive) | FN (false negative) |
| **Actual 0** | FP (false positive) | TN (true negative) |

\`\`\`text
accuracy  = (TP + TN) / n               # the diagonal over the total
precision = TP / (TP + FP)              # of the predicted positives, how many are right?
recall    = TP / (TP + FN)              # of the actual positives, how many did we find? (= TPR)
F1        = 2 * P * R / (P + R) = 2TP / (2TP + FP + FN)
FPR       = FP / (FP + TN)
\`\`\`

### Thresholds, ROC and PR curves

Most classifiers output a score; a threshold \`t\` turns it into a label (\`score >= t\`). Sweeping \`t\` over every distinct score traces:

- the **ROC curve** (FPR on x, TPR on y). Its area, **AUC**, is the probability that a random positive scores higher than a random negative (ties count one half). It ignores the class balance.
- the **precision-recall curve**, which focuses on the positive class and is more informative when positives are rare.

### Calibration

A model is calibrated if its 0.8-confidence predictions are right 80% of the time. **Expected calibration error (ECE)** bins predictions by confidence and averages \`|accuracy - confidence|\`, weighted by bin size. A model can rank perfectly (AUC 1) and still be badly calibrated.

### Cross-validation

A single split gives a noisy estimate. **K-fold** cross-validation splits the data into \`k\` folds, trains on \`k - 1\` and validates on the remaining one, rotating so that every sample is validated exactly once, and averages the \`k\` scores. Use stratified folds for imbalanced classes and grouped folds when rows from one user or session are correlated.

## Worked micro-example

Ten samples with 4 positives; the model predicts 5 positives, 3 of them correct: \`TP = 3, FN = 1, FP = 2, TN = 4\`.

\`\`\`text
accuracy  = (3 + 4) / 10        = 0.70
precision = 3 / (3 + 2)         = 0.60
recall    = 3 / (3 + 1)         = 0.75
F1        = 6 / (6 + 2 + 1)     = 0.6667
\`\`\`

Ranking: with labels \`[0, 0, 1, 1]\` and scores \`[0.1, 0.4, 0.35, 0.8]\` there are \`2 x 2 = 4\` positive/negative pairs. Three are ordered correctly (\`0.8 > 0.1\`, \`0.8 > 0.4\`, \`0.35 > 0.1\`) and one is not (\`0.35 < 0.4\`), so AUC = \`3 / 4 = 0.75\`.

## Common pitfalls

- **Accuracy on imbalanced data**: always predicting the majority class gets 99% when positives are 1%.
- **Zero division**: precision is undefined with no predicted positives and recall with no actual positives; pick a convention (scikit-learn's \`zero_division\` parameter defaults to returning 0 with a warning) and state it.
- **Ties in scores**: tied scores must cross a threshold together; sorting and breaking ties by index changes the AUC.
- **Tuning the threshold on the test set**: choose it on validation data, then report on test.
- **Leakage across folds**: preprocessing fitted before splitting, or the same user in train and validation folds.
- **Threshold-dependent vs ranking metrics**: F1 changes with the threshold, AUC doesn't.

## Interview angle

- "Precision or recall?" Depends on the costs: spam filtering favours precision, cancer screening favours recall. Know F-beta.
- "ROC-AUC or PR-AUC for a 0.1%-positive problem?" PR-AUC: ROC-AUC can look excellent while precision is tiny.
- "Explain AUC to a product manager", and why it is equivalent to the Mann-Whitney U statistic. Sorting makes it \`O(n log n)\`.
- "How do you pick the operating threshold?" (maximise F1 or expected value on validation data, or meet a precision/recall constraint).
- "Your model says 90% confident: can you trust that?" (calibration, temperature scaling, Platt scaling).

## Problems in this section

1. **Precision and Recall**: count TP, FP and FN, the building blocks of F1, with a zero-division convention.
2. **K-Fold Cross-Validation Indices**: generate contiguous train/validation index folds like \`KFold(shuffle=False)\`.
3. **Accuracy from the Confusion Matrix**: the fraction of correct predictions, binary or multi-class.
4. **ROC Curve & AUC (with Ties)**: the full ROC curve over distinct thresholds and the trapezoidal AUC, matching \`roc_auc_score\`.
5. **Expected Calibration Error**: equal-width confidence bins with a precise edge convention.
6. **Precision-Recall Curve and Best-F1 Threshold**: precision, recall and F1 at every threshold, and the best operating point.

Related: the stratified split and leakage-safe preprocessing in **Data Preprocessing**, and the classifiers in **Supervised Learning** whose scores these metrics evaluate.
    `,
    problems: ['precision-recall-f1', 'cross-validation', 'confusion-matrix', 'roc-auc', 'calibration-ece', 'pr-curve-thresholds'],
  },

  // ==========================================
  // PART 4: DEEP LEARNING
  // ==========================================
  {
    id: 'deep-learning',
    title: 'Deep Learning Basics',
    description: 'ReLU, a batched dense layer and numerically stable softmax: the three pieces every neural network is built from.',
    icon: '⚡',
    introduction: `
# Deep Learning Basics

A neural network is a stack of simple pieces: an **affine map** (\`x @ W + b\`), a **non-linearity** (ReLU), and at the end a **softmax** that turns scores into probabilities. This section builds those three pieces. Every later section (MLPs, CNNs, transformers) reuses them, and interviewers expect you to write them correctly from memory, including the numerically stable softmax.

## Core Ideas

### 1. The dense (fully-connected) layer
Each output unit takes a weighted sum of all inputs plus a bias. For a batch, it is one matrix product:

\`\`\`text
Z = X @ W + b        X: (batch, in_dim)   W: (in_dim, out_dim)   b: (out_dim,)   Z: (batch, out_dim)
\`\`\`

The bias broadcasts over the batch. The layer has \`in_dim * out_dim + out_dim\` parameters and costs \`batch * in_dim * out_dim\` multiply-adds. (PyTorch's \`nn.Linear\` stores the transpose, \`weight: (out_dim, in_dim)\`, and computes \`X @ weight.T + bias\`.)

### 2. Non-linearities
Two linear layers in a row are still one linear map (\`(X @ W1) @ W2 = X @ (W1 @ W2)\`), so depth needs a non-linearity between them.

| Activation | Formula | Range | Typical use |
|------------|---------|-------|-------------|
| ReLU | \`max(0, x)\` | \`[0, inf)\` | Hidden layers (default) |
| Sigmoid | \`1 / (1 + exp(-x))\` | \`(0, 1)\` | Binary output, gates in LSTMs |
| Tanh | \`(e^x - e^-x) / (e^x + e^-x)\` | \`(-1, 1)\` | RNN hidden states |
| Softmax | \`exp(x_i) / sum_j exp(x_j)\` | probabilities summing to 1 | Multi-class output |

ReLU's gradient is exactly 1 for positive inputs, so it does not shrink gradients the way sigmoid (max slope 0.25) and tanh do when they saturate.

### 3. Softmax and its stable form
Softmax is invariant to adding a constant to every score: \`softmax(x - c) = softmax(x)\`. Taking \`c = max(x)\` makes the largest exponent \`exp(0) = 1\`, so nothing overflows:

\`\`\`python
def softmax(x):
    e = np.exp(x - np.max(x))
    return e / e.sum()
\`\`\`

## Worked Micro-Example

One input \`x = [1, 2]\`, a hidden layer with 3 ReLU units, and 2 output classes:

\`\`\`text
W1 = [[1, -1, 0.5],      b1 = [0, -1, 0.5]
      [1, 0.5, -1]]
z  = x @ W1 + b1 = [3, -1, -1]
h  = relu(z)     = [3, 0, 0]          # two units are inactive for this input

W2 = [[1, -1], [0, 2], [0.5, 0.5]],  b2 = [0, 0]
logits = h @ W2 + b2 = [3, -3]
p = softmax(logits)  = [0.9975, 0.0025]
\`\`\`

If the true class is 0, the cross-entropy loss is \`-log(0.9975) = 0.0025\`.

## Common Pitfalls

- **Overflow in softmax**: \`np.exp(1000)\` is \`inf\` and \`inf / inf\` is \`nan\`. Always subtract the max first.
- **Wrong reduction**: \`np.max(x)\` reduces an array to a scalar; \`np.maximum(0, x)\` compares element-wise. Mixing them up is a classic ReLU and softmax bug.
- **Shape and layout**: \`X @ W\` needs \`W\` as \`(in_dim, out_dim)\`; \`nn.Linear\` uses the transpose. A bias of shape \`(out_dim,)\` broadcasts over rows; one of shape \`(batch,)\` does not.
- **Batched softmax**: for a \`(batch, classes)\` array, reduce with \`axis=-1, keepdims=True\`, otherwise you normalise across the whole batch.
- **In-place edits**: \`x[x < 0] = 0\` changes the caller's array (and breaks autograd in PyTorch).

## Interview Angle

- "Why do we need non-linear activations?" Without them the network is one linear map.
- "Implement softmax." The follow-up is always "what if the inputs are large?" (the max-shift), then "what is its Jacobian?" (\`diag(p) - p pᵀ\`) and "what is the gradient of softmax + cross-entropy?" (\`p - y\`).
- "ReLU vs sigmoid vs tanh?" Saturation and vanishing gradients, dying ReLUs, zero-centred outputs.
- Count the parameters and FLOPs of a dense layer.

## Problems in This Section

1. **ReLU Activation**: element-wise \`max(0, x)\` for arrays of any shape.
2. **Dense Layer Forward Pass (ReLU)**: \`relu(X @ W + b)\` for a whole batch.
3. **Numerically Stable Softmax**: probabilities from logits without overflow.

Next, **Neural Networks** chains these into a full MLP with a hand-written backward pass, cross-entropy, initialization, batch norm and dropout. Leaky ReLU, GELU and temperature softmax are in **PyTorch Basics**.
    `,
    problems: ['perceptron', 'neural-network-forward', 'backpropagation'],
  },
  {
    id: 'neural-networks',
    title: 'Neural Networks',
    description: 'Train an MLP from scratch: cross-entropy, a hand-written backward pass, Xavier/He init, batch norm, dropout and a masked, label-smoothed LM loss.',
    icon: '🧠',
    introduction: `
# Neural Networks

This section turns the building blocks from Deep Learning Basics into a network you can **train**: a loss to minimise, a hand-written backward pass, and the three techniques that make deep networks train reliably (initialization, batch normalization, dropout). "Implement the forward and backward pass of an MLP in NumPy" is one of the most common ML coding interview questions, and every framework bug you will debug later is easier once you have written backprop yourself.

## Core Ideas

### The training loop in one picture

\`\`\`text
forward:   X -> Z1 = X @ W1 + b1 -> A1 = relu(Z1) -> Z2 = A1 @ W2 + b2 -> p = softmax(Z2) -> L
backward:  dW1, db1 <- dZ1 = dA1 * (Z1 > 0) <- dA1 = dZ2 @ W2.T <- dZ2 = (p - Y) / m <- L
update:    W -= lr * dW        (for every parameter)
\`\`\`

Shapes: \`X (m, n_features)\`, \`W1 (n_features, n_hidden)\`, \`W2 (n_hidden, n_classes)\`, \`Y\` one-hot \`(m, n_classes)\`. Every gradient has the same shape as its parameter.

### Cross-entropy and the \`p - y\` gradient
For one-hot labels, cross-entropy is the negative log-probability of the correct class, averaged over the batch: \`L = -(1/m) * sum(Y * log(p))\`. Combined with softmax, the gradient with respect to the logits collapses to \`(p - Y) / m\`, which is why frameworks fuse them (\`nn.CrossEntropyLoss\` takes logits). For token-level LM losses you also mask padding and often smooth the labels: \`q = (1 - eps) * onehot + eps / V\`.

### Backprop is the chain rule with matrix shapes
For \`Z = A @ W + b\`: \`dW = A.T @ dZ\`, \`db = dZ.sum(axis=0)\`, \`dA = dZ @ W.T\`. For an element-wise activation: \`dZ = dA * f'(Z)\`, with \`relu'(Z) = (Z > 0)\`. That is all an MLP needs.

### Making deep networks trainable

| Technique | Formula | What it fixes |
|-----------|---------|---------------|
| Xavier init | \`W ~ N(0, 2 / (n_in + n_out))\` | Keeps activation variance stable with tanh/sigmoid |
| He init | \`W ~ N(0, 2 / n_in)\` | Same for ReLU, which zeroes half its inputs |
| BatchNorm | \`gamma * (x - mu_B) / sqrt(var_B + eps) + beta\` | Unstable activation scales; allows larger learning rates |
| Dropout | \`x * mask / keep_prob\`, \`mask ~ Bernoulli(keep_prob)\` | Overfitting (co-adapted units) |

## Worked Micro-Example

Logits \`z = [2.0, 1.0, 0.1]\` for one example whose true class is 0:

\`\`\`text
p    = softmax(z)       = [0.659, 0.2424, 0.0986]
L    = -log(p[0])       = 0.417
dL/dz = p - y           = [-0.341, 0.2424, 0.0986]    # push the true logit up, the others down
with label smoothing eps = 0.1:
L    = 0.9 * 0.417 + 0.1 * mean(-log p) = 0.5137
\`\`\`

The gradient entries sum to 0: raising every logit by the same amount changes nothing (softmax is shift-invariant).

## Common Pitfalls

- **Unstable losses**: \`log(softmax(z))\` can give \`-inf\`; work from logits with \`logsumexp\`, or add a small eps when the input really is probabilities.
- **Forgetting \`1/m\`**: gradients of a mean loss are divided by the batch size; mixing sum and mean silently changes the effective learning rate.
- **Transposes**: \`dA1 = dZ2 @ W2.T\`, not \`dZ2 @ W2\`. Check every gradient shape against its parameter.
- **BatchNorm**: use the biased variance in training, put \`eps\` inside the square root, reduce over the batch axis (\`axis=0\`), and remember train vs eval mode (batch statistics vs running averages).
- **Dropout**: \`keep_prob\` is not the drop probability \`p\` that \`nn.Dropout(p)\` takes; inverted dropout scales at train time so inference is the identity.
- **Padding in sequence losses**: average over real tokens only, and never index with \`ignore_index = -100\`.

## Interview Angle

- Derive \`dL/dz = p - y\` for softmax + cross-entropy, then write the full MLP backward pass. Follow-up: verify it with a finite-difference gradient check.
- "Why not initialise all weights to zero?" Every unit in a layer gets the same gradient, so symmetry is never broken. "Why He for ReLU?"
- BatchNorm: what changes at inference, why it interacts badly with small batches, and how LayerNorm differs.
- Dropout: why scale by \`1/keep_prob\`, and what the backward pass is (\`dX = dout * mask\`).
- Complexity: a forward or backward pass of a dense layer costs \`O(m * n_in * n_out)\`; backprop costs about twice the forward pass.

## Problems in This Section

1. **Cross-Entropy Loss**: the mean classification loss from probabilities and one-hot labels.
2. **MLP Forward & Backward Pass**: a 2-layer ReLU/softmax network with hand-derived gradients.
3. **Xavier/He Weight Initialization**: sample weights at the right scale and measure their std.
4. **Batch Normalization**: the training-mode forward pass with its cache.
5. **Dropout**: inverted dropout with its mask, plus inference mode.
6. **Masked Cross-Entropy with Label Smoothing**: the token-level LM loss, matching \`F.cross_entropy\`.

Related: Layer Norm and RMSNorm are in **Transformers** and **PyTorch Basics**; optimizers, gradient clipping and loss scaling are in **Optimization & Training**; the full train-from-scratch MLP is in **E2E Implementations**.
    `,
    problems: ['cross-entropy-loss', 'mlp-forward-backward', 'weight-init', 'batch-norm', 'dropout', 'masked-label-smoothing-ce'],
  },
  {
    id: 'optimization',
    title: 'Optimization & Training',
    description: 'Gradient clipping by global norm and mixed-precision dynamic loss scaling: the tricks that keep long training runs stable.',
    icon: '⚙️',
    introduction: `
# Optimization & Training

A model is only as good as the procedure that fits it. This section covers what happens between \`loss.backward()\` and the next forward pass: how the update is computed, how large it is, and the tricks that stop long training runs from diverging. Most "my model won't train" bugs are optimization bugs, and interviews regularly ask you to write Adam from memory or explain why a run produced NaNs.

## Core Ideas

### From SGD to Adam
Every optimizer turns a gradient \`g\` into an update for the parameters \`θ\`:

| Optimizer | Update | Idea |
|-----------|--------|------|
| **SGD** | \`θ -= lr * g\` | Step down the current gradient |
| **Momentum** | \`v = μv + g;  θ -= lr * v\` | Average gradients over time: speed up along consistent directions, damp oscillations |
| **Nesterov** | \`θ -= lr * (g + μv)\` | Look ahead along the velocity before stepping |
| **RMSprop** | \`s = ρs + (1-ρ)g²;  θ -= lr * g / (√s + ε)\` | Per-parameter step size from recent gradient scale |
| **Adam** | \`m = β1·m + (1-β1)g;  s = β2·s + (1-β2)g²;  θ -= lr * m̂ / (√ŝ + ε)\` | Momentum + RMSprop, with bias correction \`m̂ = m / (1 - β1^t)\`, \`ŝ = s / (1 - β2^t)\` |
| **AdamW** | Adam + decoupled weight decay \`θ *= 1 - lr·λ\` | Default for transformers; L2 added to the loss inside Adam is *not* the same thing |

You implement SGD with momentum, Adam and learning-rate schedules in **PyTorch Basics** (SGD with Momentum, Adam Optimizer, Learning Rate Scheduling).

### Learning-rate schedules
The learning rate is the most important hyperparameter, and it rarely stays constant:

\`\`\`text
warmup (linear 0 -> max_lr)  ->  decay (cosine / linear / step)  ->  floor (min_lr)
\`\`\`

Warmup protects the first steps, when Adam's statistics are noisy and the weights are random. Decay lets the model settle into a minimum.

### Keeping training stable

| Problem | Symptom | Fix |
|---------|---------|-----|
| Exploding gradients | Loss spikes, NaNs | **Gradient clipping** by global norm (\`clip_grad_norm_\`, usually \`max_norm=1.0\`) |
| Batch doesn't fit in memory | OOM errors | **Gradient accumulation**: sum the gradients of k micro-batches (each loss / k) before stepping (practised in PyTorch Basics) |
| fp16 gradients underflow to 0 | Training stalls in mixed precision | **Dynamic loss scaling**: multiply the loss by S, back off S on overflow, grow it after N clean steps |

\`\`\`python
# A typical mixed-precision training step with accumulation
with torch.autocast('cuda', dtype=torch.float16):
    loss = model(x, y) / accum_steps
scaler.scale(loss).backward()
if (step + 1) % accum_steps == 0:
    scaler.unscale_(optimizer)                                # true gradients again
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)   # clip the unscaled grads
    scaler.step(optimizer)                                    # skipped if any grad is inf/NaN
    scaler.update()                                           # adjust the loss scale
    optimizer.zero_grad()
    scheduler.step()
\`\`\`

## Worked Micro-Example

**Global-norm clipping.** Two parameters have gradients \`g1 = [3, 4]\` and \`g2 = [12]\`, and \`max_norm = 1\`:

\`\`\`text
total_norm = sqrt(3² + 4² + 12²) = sqrt(169) = 13
clip_coef  = 1 / 13 = 0.0769
g1 -> [0.2308, 0.3077],  g2 -> [0.9231]       # new global norm = 1, direction unchanged
\`\`\`

Clipping each tensor separately would instead give \`[0.6, 0.8]\` and \`[1.0]\`: a different direction.

**Adam's first step.** With \`g = 0.5\`, \`β1 = 0.9\`, \`β2 = 0.999\`: \`m = 0.05\`, \`s = 0.00025\`, and after bias correction \`m̂ = 0.5\`, \`ŝ = 0.25\`, so the step is \`lr * 0.5 / 0.5 = lr\`. Adam's early steps have size about \`lr\` whatever the gradient's scale; without bias correction the first step would be \`lr * 0.05 / sqrt(0.00025) ≈ 3.16 * lr\`, because the second-moment estimate starts much closer to 0 than the first.

## Common Pitfalls

- **Clipping the scaled gradients** in mixed precision: unscale first, otherwise \`max_norm\` is compared with \`S\` times the real norm.
- **Per-tensor instead of global clipping**: it changes the update direction; \`clip_grad_norm_\` uses one norm over all parameters.
- **Gradient accumulation without \`1/k\`**: the effective learning rate becomes k times larger.
- **L2 penalty vs weight decay in Adam**: adding \`λ‖θ‖²\` to the loss gets rescaled by Adam's denominator; AdamW decays the weights directly.
- **No warmup** with Adam on transformers: early updates are large and noisy and can diverge.
- **A loss scale that keeps shrinking**: the overflows are real (a numerical bug or a too-high learning rate), not a scaling problem.

## Interview Angle

- Write Adam from memory, including bias correction; explain why the first steps are about \`lr\` in size and what happens without it.
- "Why does AdamW decouple weight decay?" and "What does warmup protect against?"
- "Your loss goes to NaN after 10k steps. What do you check?" Learning rate, clipping, fp16 overflow and loss scale, bad data, log of 0, division by a zero norm.
- Memory: Adam stores two extra tensors per parameter (\`m\` and \`s\`), so optimizer state is 2x the model size in fp32.
- Clipping costs one pass over all gradients, \`O(P)\` time for \`P\` parameters.

## Problems in This Section

1. **Gradient Clipping by Global Norm**: rescale all gradients together when their combined norm is too large, like \`clip_grad_norm_\`.
2. **Dynamic Loss Scaling (Mixed Precision)**: simulate \`GradScaler\`'s backoff and growth of the loss scale and the skipped steps.

Related: the optimizers and schedules themselves (SGD with Momentum, Adam Optimizer, Learning Rate Scheduling, Gradient Accumulation) are in **PyTorch Basics**; a full training loop is in **PyTorch Basics** (Training Loop) and **E2E Implementations**.
    `,
    problems: ['gradient-clipping', 'loss-scaling'],
  },
  {
    id: 'cnn',
    title: 'CNNs & Computer Vision',
    description: 'Build CNN layers (convolution, pooling, flatten, a ResNet block) and the detection toolkit: IoU, NMS, focal and smooth L1 losses, and segmentation metrics.',
    icon: '🖼️',
    introduction: `
# Convolutional Neural Networks (CNNs)

## Why It Matters

Convolutions are how neural networks see. Image classifiers, object detectors (Faster R-CNN, RetinaNet, YOLO), segmentation models (U-Net, Mask R-CNN) and the image encoders of diffusion models and vision-language models are built from the same few pieces. Interviews test them directly: compute an output shape in your head, write a convolution with loops, implement IoU and NMS without bugs, explain why ResNet trains.

## Core Ideas

### Convolution = a small dense layer slid over the image
A conv layer applies the **same** small weight tensor (the kernel) at every spatial position. That gives two inductive biases: **locality** (each output looks at a \`k x k\` patch) and **weight sharing** (a cat ear detector works anywhere in the image). Deep learning "convolution" is really **cross-correlation**: the kernel is not flipped.

\`\`\`text
out[n, o, i, j] = b[o] + sum over c, a, b' of  x[n, c, i*s + a, j*s + b'] * w[o, c, a, b']
\`\`\`

### Shape conventions (get these right first)

| Name | Layout | Used by |
|------|--------|---------|
| **NCHW** | \`(batch, channels, height, width)\` | PyTorch (\`nn.Conv2d\`), and the conv problems here |
| **NHWC** | \`(batch, height, width, channels)\` | TensorFlow/Keras, image files; used in **Flatten Layer** |
| Conv weight | \`(C_out, C_in // groups, kH, kW)\` | PyTorch and **Advanced 2D Convolution** |
| Single image | \`(H, W)\` | **2D Convolution** and **Max Pooling** (one channel, no batch) |

Box formats in detection differ too: the problems here use **\`xyxy\`** = \`[x1, y1, x2, y2]\` (top-left and bottom-right corners, \`x2 > x1\`, \`y2 > y1\`). COCO stores **\`xywh\`** = \`[x, y, width, height]\` and YOLO uses **\`cxcywh\`** (centre plus size), so convert before computing IoU.

### Output size, parameters and compute

\`\`\`text
H_out = floor((H + 2*padding - kH) / stride) + 1
params = C_out * (C_in // groups) * kH * kW  (+ C_out biases)
MACs   = params_without_bias * H_out * W_out  (per image)
\`\`\`

| Building block | What it does |
|----------------|--------------|
| Padding \`p = (k-1)/2\`, stride 1 | "same" convolution: keeps \`H, W\` |
| Stride 2 conv or 2x2 max pool | halves the resolution |
| Grouped conv (\`groups = G\`) | \`G\` independent convs on channel slices, \`1/G\` of the params |
| Depthwise conv (\`groups = C_in = C_out\`) + 1x1 conv | MobileNet's depthwise separable conv |
| Flatten + linear | turn the final feature map into class logits |
| Residual block | \`out = ReLU(F(x) + shortcut(x))\`, makes 100+ layers trainable |

### Detection and segmentation
A detector outputs many scored boxes: **IoU** measures overlap, **NMS** removes duplicates, **focal loss** stops easy background anchors from swamping the classifier, and **smooth L1** regresses box offsets robustly. Segmentation predicts a class per pixel, scored with mask **IoU** and **Dice**.

## Worked Micro-Example

Cross-correlate a \`3 x 3\` image with a \`2 x 2\` kernel (no padding, stride 1, so the output is \`(3 - 2) + 1 = 2\` per side):

\`\`\`text
image = [[1, 2, 0],      kernel = [[1,  0],
         [0, 1, 3],                [0, -1]]
         [2, 1, 0]]

out[0, 0] = 1*1 + 2*0 + 0*0 + 1*(-1) =  0
out[0, 1] = 2*1 + 0*0 + 1*0 + 3*(-1) = -1
out[1, 0] = 0*1 + 1*0 + 2*0 + 1*(-1) = -1
out[1, 1] = 1*1 + 3*0 + 1*0 + 0*(-1) =  1
\`\`\`

Shapes through the ResNet stem: a \`224 x 224\` image, conv 7x7 stride 2 padding 3 gives \`(224 + 6 - 7) // 2 + 1 = 112\`, then max pool 3x3 stride 2 padding 1 gives \`(112 + 2 - 3) // 2 + 1 = 56\`. A 3x3 conv from 64 to 128 channels at \`56 x 56\` has \`3*3*64*128 = 73,728\` weights and costs about \`73,728 * 56 * 56 ≈ 231M\` multiply-adds per image.

IoU of \`xyxy\` boxes \`[0, 0, 4, 4]\` and \`[2, 0, 6, 4]\`: the intersection is \`2 x 4 = 8\`, the union is \`16 + 16 - 8 = 24\`, so IoU \`= 1/3\`.

## Common Pitfalls

- **Layout mix-ups**: NCHW vs NHWC, \`(H, W)\` vs \`(W, H)\`, \`xyxy\` vs \`xywh\`. Write the shape next to every line.
- **Flipping the kernel**: frameworks compute cross-correlation; flipping gives a different answer for asymmetric kernels.
- **Truncating floats**: \`astype(int)\` on a convolution output silently corrupts non-integer results.
- **Output size**: use floor division; forgetting the \`+ 1\` or the \`2 * padding\` is the classic off-by-one.
- **IoU**: clamp the intersection width and height at 0, or disjoint boxes get a positive "overlap". Guard a zero-area union.
- **NMS**: suppress with \`IoU > threshold\` against the box you just kept, not against the original top box only.
- **Losses**: clip probabilities before \`log\`; in focal loss, \`alpha\` weights the **positive** class.
- **Residual blocks**: the final ReLU comes **after** the addition; the shortcut needs a projection whenever the shape changes.

## Interview Angle

- "What is the output shape and parameter count of this layer?" Answer in seconds with the formulas above.
- "Write conv2d with loops, then vectorise it" (loop over kernel taps, or im2col + one matmul).
- "Why do two 3x3 convs beat one 5x5?" (same 5x5 receptive field, \`18 C^2\` vs \`25 C^2\` weights, an extra non-linearity.) "What does a 1x1 conv do?"
- "Implement IoU and NMS." Follow-ups: batched IoU as an \`(N, M)\` matrix, soft-NMS, class-aware NMS, \`O(N^2)\` cost.
- "Why focal loss, and what do \`alpha\` and \`gamma\` do?" "Why smooth L1 rather than L2 for boxes?"
- "Why does ResNet work?" Identity paths keep gradients flowing; a block can fall back to the identity by pushing \`F\` to 0.

## Problems in This Section

1. **Convolution Output Size**: the \`floor((H + 2p - k) / s) + 1\` formula.
2. **2D Convolution**: a single-channel \`(H, W)\` cross-correlation, no padding, stride 1.
3. **Max Pooling**: non-overlapping \`k x k\` max pooling on an \`(H, W)\` map.
4. **Flatten Layer**: \`(N, H, W, C)\` (NHWC) feature maps to \`(N, H*W*C)\` vectors.
5. **Advanced 2D Convolution**: NCHW batches with padding, stride and groups (depthwise conv).
6. **IoU (Intersection over Union)**: overlap of two \`xyxy\` boxes.
7. **Non-Maximum Suppression (NMS)**: greedy duplicate removal for detections.
8. **Focal Loss**: RetinaNet's loss for extreme class imbalance.
9. **Smooth L1 Loss**: the box regression loss of Fast/Faster R-CNN.
10. **Segmentation Metrics**: IoU, pixel accuracy and Dice for binary masks.
11. **ResNet Basic Block**: conv-BN-ReLU-conv-BN plus an identity or projection shortcut.

Related: **Batch Normalization** (Neural Networks), **Precision and Recall** (Model Evaluation, the basis of detection mAP) and **E2E: Convolutional Neural Network** (End-to-End Implementations).
    `,
    problems: ['conv-output-size', 'conv2d-forward', 'max-pool', 'flatten-layer', 'conv2d-advanced', 'iou-bounding-box', 'nms', 'focal-loss', 'smooth-l1-loss', 'seg-metrics', 'resnet-block'],
  },
  {
    id: 'sequence-models',
    title: 'Sequence Models',
    description: 'Unroll a vanilla RNN with hand-written BPTT, then build single steps of PyTorch-compatible LSTM and GRU cells.',
    icon: '🔁',
    introduction: `
# Sequence Models

## Why It Matters

Text, audio, time series and user sessions are all **sequences**: order matters and length varies. Before transformers, recurrent networks (RNN, LSTM, GRU) were the standard way to model them, and they still power streaming speech recognition, on-device keyboards and many forecasting systems. State-space models (Mamba, RWKV) bring the same recurrent idea back to LLMs, and interviewers still ask you to write an LSTM step or explain vanishing gradients.

## Core Ideas

### The recurrence
An RNN reads one element at a time and updates a fixed-size **hidden state** that summarizes the past, reusing the **same weights at every step**:

\`\`\`text
h_t = tanh(x_t @ W_xh + h_{t-1} @ W_hh + b)        x_t: (N, D),  h_t: (N, H)
\`\`\`

All problems here are **batch first**: a batch of sequences is \`X\` of shape \`(N, T, D)\` = \`(batch, seq_len, features)\` and the stacked hidden states are \`(N, T, H)\`.

### Backpropagation through time (BPTT)
Training unrolls the loop and backpropagates through every step. The gradient reaching \`h_1\` from \`h_T\` is a product of \`T - 1\` Jacobians:

\`\`\`text
dh_T/dh_1 = prod over t = T..2 of  diag(1 - h_t^2) @ W_hh.T
\`\`\`

If the largest singular value of \`W_hh\` (times the tanh slope, at most 1) is below 1 the product **vanishes**; above 1 it can **explode**. Gradient clipping fixes explosions but not vanishing, so plain RNNs struggle beyond a few dozen steps.

### Gated cells
Gates are sigmoids in \`[0, 1]\` that decide, per dimension, how much information flows.

| Cell | State | Gates | Update |
|------|-------|-------|--------|
| **RNN** | \`h\` | none | \`h = tanh(x W_xh + h W_hh + b)\` |
| **LSTM** | \`h\`, \`c\` | input \`i\`, forget \`f\`, output \`o\` (+ candidate \`g\`) | \`c = f*c_prev + i*g\`, \`h = o*tanh(c)\` |
| **GRU** | \`h\` | reset \`r\`, update \`z\` (+ candidate \`n\`) | \`h = (1-z)*n + z*h_prev\` |

The LSTM's cell state is updated **additively**: when \`f ≈ 1\`, \`dc_t/dc_{t-1} ≈ 1\` and gradients travel hundreds of steps. That is why the forget-gate bias is often initialized to 1.

### Conventions used in this section (memorize them)

| | Vanilla RNN problem | LSTM (\`nn.LSTMCell\`) | GRU (\`nn.GRUCell\`) |
|---|---|---|---|
| Weight layout | \`x @ W_xh\`, \`W_xh: (D, H)\`, \`W_hh: (H, H)\` | \`x @ W_ih.T\`, \`W_ih: (4H, D)\`, \`W_hh: (4H, H)\` | \`x @ W_ih.T\`, \`W_ih: (3H, D)\`, \`W_hh: (3H, H)\` |
| Biases | one \`b: (H,)\` | \`b_ih\`, \`b_hh: (4H,)\` | \`b_ih\`, \`b_hh: (3H,)\` |
| Gate order (row blocks of \`H\`) | none | **\`i, f, g, o\`** | **\`r, z, n\`** |
| Parameters | \`DH + H^2 + H\` | \`4(HD + H^2 + 2H)\` | \`3(HD + H^2 + 2H)\` |

Note the layout switch: the RNN problem uses \`(in, out)\` weights, the LSTM and GRU problems use PyTorch's \`(out, in)\` weights, hence the \`.T\`. TensorFlow/Keras orders LSTM gates \`i, f, c, o\` too, but stores kernels as \`(D, 4H)\`.

## Worked Micro-Example

**RNN**, scalar (\`D = H = 1\`), \`W_xh = 0.5\`, \`W_hh = 1\`, \`b = 0\`, \`h_0 = 0\`, input \`x_t = 1\` for 3 steps:

\`\`\`text
h_1 = tanh(0.5)            = 0.4621
h_2 = tanh(0.5 + 0.4621)   = 0.7452
h_3 = tanh(0.5 + 0.7452)   = 0.8469
\`\`\`

**LSTM**, one step with \`H = 1\`, \`c_prev = 1\` and gate pre-activations \`(i, f, g, o) = (0, 2, 1, 0)\`:

\`\`\`text
i = sigmoid(0) = 0.5,  f = sigmoid(2) = 0.8808,  g = tanh(1) = 0.7616,  o = 0.5
c = 0.8808 * 1 + 0.5 * 0.7616 = 1.2616
h = 0.5 * tanh(1.2616)       = 0.4258
\`\`\`

**Vanishing in numbers**: a per-step gradient factor of 0.5 over 20 steps leaves \`0.5^20 ≈ 9.5e-7\` of the signal; a factor of 1.1 over 50 steps blows it up to about 117.

## Common Pitfalls

- **Gate order**: splitting an LSTM's \`4H\` block as \`i, f, o, g\` (or a GRU's as \`z, r, n\`) runs without errors and gives wrong numbers. PyTorch is \`i, f, g, o\` and \`r, z, n\`.
- **Weight orientation**: \`x @ W\` vs \`x @ W.T\`. Check the shape table before multiplying.
- **GRU reset gate**: PyTorch applies \`r\` *after* the hidden matmul, to \`h_prev @ W_hn.T + b_hn\`; the original paper applies it to \`h_prev\` first. The numbers differ.
- **GRU update gate**: in PyTorch \`z = 1\` **keeps** \`h_prev\`; some papers swap \`z\` and \`1 - z\`.
- **BPTT**: weights are shared, so their gradients **accumulate** over time; the gradient into \`h_t\` has a direct part and a part from \`h_{t+1}\`.
- **Batch vs time axis**: \`nn.RNN\` defaults to \`(T, N, D)\` unless \`batch_first=True\`. These problems are batch first.

## Interview Angle

- "Write an LSTM cell from scratch." Then: "count its parameters", "why does the cell state help gradients?", "why initialize the forget bias to 1?"
- "Explain vanishing and exploding gradients in RNNs and the fixes": gating, clipping, orthogonal init, shorter truncated BPTT windows.
- "LSTM vs GRU?" GRU has 3 weight blocks instead of 4 (25% fewer parameters) and no separate cell state; quality is usually similar.
- "RNN vs Transformer?" RNN training is sequential in \`T\` but inference costs \`O(1)\` per token; attention trains in parallel but costs \`O(T)\` per token with a KV cache and \`O(T^2)\` for the full sequence.

## Problems in This Section

1. **Vanilla RNN: Forward & BPTT**: unroll \`h_t = tanh(x_t W_xh + h_{t-1} W_hh + b)\` over \`(N, T, D)\` inputs and backpropagate through time by hand.
2. **LSTM Cell**: one step of \`nn.LSTMCell\` with gate order \`i, f, g, o\`.
3. **GRU Cell**: one step of \`nn.GRUCell\` with gate order \`r, z, n\` and PyTorch's reset-gate placement.

Related: **Gradient Clipping by Global Norm** (Optimization & Training) for exploding gradients, and **Scaled Dot-Product Attention** (Transformer Architecture), which replaced recurrence in most language models.
    `,
    problems: ['rnn-forward', 'lstm-cell', 'gru-cell'],
  },
  {
    id: 'transformers',
    title: 'Transformer Architecture',
    description: 'Master attention, positional encoding, and modern LLM architecture.',
    icon: '🤖',
    introduction: `
# Attention and Transformers

Transformers have revolutionized NLP and are now used in vision, speech, and more.

## Key Concepts

### Self-Attention
- **Query, Key, Value**: Three projections of input
- **Attention scores**: Q @ K.T / sqrt(d_k)
- **Output**: Weighted sum of values

### Scaled Dot-Product Attention
\`\`\`
Attention(Q, K, V) = softmax(Q @ K.T / sqrt(d_k)) @ V
\`\`\`

### Multi-Head Attention
- **Multiple heads**: Parallel attention with different projections
- **Concatenate**: Combine all head outputs
- **Project**: Linear transformation back to model dimension

### Transformer Components
- **Positional Encoding**: Inject position information
- **Layer Normalization**: Normalize across features
- **Feed-Forward Network**: MLP after attention
- **Residual Connections**: Add input to output

### Causal Masking
- **Purpose**: Prevent attending to future tokens
- **Implementation**: Add -inf to upper triangle before softmax

### Modern LLM Architecture
- **BPE Tokenization**: Subword tokenization used by GPT, LLaMA, and most LLMs
- **Rotary Positional Embeddings (RoPE)**: Encodes relative positions via rotation, replacing sinusoidal
- **Grouped Query Attention (GQA)**: Shares KV heads across query head groups for efficient inference
- **Sliding Window Attention**: Local attention pattern for efficient long-context processing

### Interview Essentials
- Implement scaled dot-product attention
- Explain why we scale by sqrt(d_k)
- Multi-head attention benefits
- Positional encoding purpose
- BPE tokenization algorithm
- RoPE vs sinusoidal positional encoding
- GQA/MQA for efficient inference

Let's build transformers from scratch!
    `,
    problems: ['scaled-dot-product-attention', 'multi-head-attention', 'positional-encoding', 'layer-norm', 'causal-mask', 'bpe-tokenization', 'rope-embeddings', 'grouped-query-attention', 'sliding-window-attention', 'attention-backward', 'longest-match-tokenizer'],
  },
  {
    id: 'llm-generation',
    title: 'LLM Generation & Decoding',
    description: 'Master decoding strategies: temperature, sampling, KV cache, beam search, and speculative decoding.',
    icon: '💬',
    introduction: `
# LLM Generation & Decoding

Understanding how LLMs generate text is critical for ML interviews and production deployment. This section covers the decoding pipeline from raw logits to output tokens.

## The Autoregressive Pipeline

LLMs generate text one token at a time:
\`\`\`
logits = model(input_tokens)        # Raw scores for each vocab token
probs = softmax(logits / temperature)  # Convert to probabilities
next_token = sample(probs)          # Pick a token
\`\`\`

## Key Concepts

### Temperature Scaling
Controls randomness by scaling logits before softmax:
\`\`\`
scaled_logits = logits / T
\`\`\`
- T < 1: More deterministic (sharper distribution)
- T > 1: More random (flatter distribution)
- T → 0: Greedy decoding (always pick most likely)

### Sampling Strategies

| Strategy | How It Works | When to Use |
|----------|-------------|-------------|
| **Top-k** | Keep only the k most likely tokens | Simple, predictable filtering |
| **Top-p (Nucleus)** | Keep smallest set with cumulative prob ≥ p | Adaptive, works across distributions |
| **Repetition Penalty** | Reduce probability of already-generated tokens | Prevent loops and repetition |

### KV Cache
The key optimization for efficient autoregressive generation:
- Cache Key and Value projections from previous tokens
- Only compute Q, K, V for the **new** token at each step
- Reduces per-token cost from O(n²) to O(n)

### Beam Search
Maintain multiple candidate sequences:
\`\`\`
score(sequence) = sum(log P(token_i))
\`\`\`
- Explores multiple paths simultaneously
- Finds higher-probability sequences than greedy decoding
- Used in translation, summarization, and structured output

### Speculative Decoding
Use a small "draft" model to propose tokens, verified by the large model:
1. Draft model generates K tokens quickly
2. Target model verifies all K in one forward pass
3. Accept with probability min(1, p_target / p_draft)
- Mathematically guarantees target model distribution
- 2-3x speedup in practice

## Interview Essentials
- Explain temperature scaling and its effect on output diversity
- Compare top-k vs top-p sampling trade-offs
- Describe how KV cache reduces inference cost
- Implement beam search with length normalization
- Explain why speculative decoding preserves the target distribution

Let's implement these essential LLM techniques!
    `,
    problems: [
      'llm-temperature-scaling',
      'llm-top-k-sampling',
      'llm-top-p-sampling',
      'llm-repetition-penalty',
      'llm-kv-cache',
      'llm-beam-search',
      'llm-speculative-decoding',
    ],
  },
  {
    id: 'llm-internals',
    title: 'LLM Internals',
    description: 'SwiGLU blocks, online softmax (FlashAttention), mixture-of-experts routing and perplexity: how modern LLMs are built and measured.',
    icon: '🧩',
    introduction: `
# LLM Internals

You know how a Transformer block works. This section is about what changes when that block becomes a **production LLM**: the exact layers modern models use, how attention is made to fit long contexts, how sparse models scale, and how we measure a language model at all. These are the details LLM engineering interviews probe.

Some pieces of the pipeline below have their own problems elsewhere: BPE tokenization, RoPE and grouped-query attention in **Transformer Architecture**, and temperature, top-k/top-p sampling, the KV cache and speculative decoding in **LLM Generation & Decoding**. This section covers the rest.

## How an LLM generates text, end to end

\`\`\`
text -> tokenizer -> token ids (B, T)
     -> embedding lookup                         (B, T, d_model)
     -> N x decoder block:
            h = h + Attention(RMSNorm(h))        causal, multi-head, positions via RoPE
            h = h + FFN(RMSNorm(h))              SwiGLU MLP, or a mixture of experts
     -> final RMSNorm -> LM head                 logits (B, T, vocab)
     -> pick next token (greedy / sampling), append it, repeat
\`\`\`

Training runs the whole sequence at once and minimizes next-token cross-entropy. Inference runs one token at a time, so **memory bandwidth** and **cache size** dominate, not FLOPs.

## What each technique solves

| Technique | Problem it solves | Axis | Problem here |
|-----------|-------------------|------|--------------|
| SwiGLU FFN + RMSNorm | Better quality per parameter than a ReLU MLP; cheaper normalization than LayerNorm | Quality | SwiGLU Feed-Forward Block |
| Online softmax (FlashAttention) | The \`(T, T)\` score matrix doesn't fit in fast memory for long sequences | Memory + speed | Online Softmax |
| Mixture of experts | More parameters without more compute per token | Speed (compute) | Mixture-of-Experts Routing |
| Cross-entropy / perplexity | One number to train on and to compare models with | Quality (evaluation) | Token Cross-Entropy and Perplexity |

## Key formulas

**SwiGLU and RMSNorm** (LLaMA):
\`\`\`
rms_norm(x) = x / sqrt(mean(x^2) + eps) * w
ffn(x)      = (silu(x W_gate) * (x W_up)) W_down,   silu(z) = z * sigmoid(z)
\`\`\`

**Online softmax**: stream over key blocks, keeping a running max \`m\`, normalizer \`l\` and output \`acc\`:
\`\`\`
m' = max(m, rowmax(S_b))
l  = l * exp(m - m') + rowsum(exp(S_b - m'))
acc = acc * exp(m - m') + exp(S_b - m') @ V_b
output = acc / l
\`\`\`

**MoE routing** (top-k gates, Switch Transformer load-balancing loss):
\`\`\`
gates = softmax(top-k router logits)
y = sum_j gates_j * expert_{i_j}(x)
aux_loss = E * sum_e f_e * P_e      (f_e: fraction of routing slots, P_e: mean router prob)
\`\`\`

**Perplexity**:
\`\`\`
mean_nll   = -(1 / N) * sum_t log p(x_t | x_<t)      (padding masked out)
perplexity = exp(mean_nll)                           (uniform over V tokens -> V)
\`\`\`

## Interview essentials
- Why SwiGLU uses \`d_ff ≈ (8/3) d_model\` instead of \`4 d_model\`
- Why FlashAttention is exact (not an approximation) and what it saves: memory traffic, not FLOPs
- What goes wrong in an MoE without the auxiliary loss (expert collapse) and how capacity factors drop tokens
- Why perplexity must exclude padding, and why it's only comparable between models with the same tokenizer

Then put it all together in the capstone **Mini GPT** problem (E2E Implementations).
    `,
    problems: ['rmsnorm-swiglu', 'online-softmax', 'moe-routing', 'perplexity'],
  },
  {
    id: 'representation-learning',
    title: 'Representation Learning & Retrieval',
    description: 'Contrastive learning, embedding search and retrieval for RAG.',
    icon: '🧭',
    introduction: `
# Representation Learning & Retrieval

A good representation maps inputs to vectors (**embeddings**) where geometry carries meaning: similar things are close and unrelated things are far apart. Once you have that, search, clustering, deduplication and retrieval for LLMs come down to comparing vectors.

## Embeddings and cosine similarity
Most embedding models are compared with **cosine similarity**, the dot product of L2-normalised vectors:
\`\`\`
cos(a, b) = a · b / (||a|| ||b||)        in [-1, 1]
\`\`\`
After normalisation, scoring a query against N documents is a single matrix multiply.

## Contrastive learning
Instead of labels, contrastive methods learn from **pairs**: pull matching pairs together and push everything else apart. CLIP trains an image encoder and a text encoder on (image, caption) pairs with the **InfoNCE** loss: in a batch of N pairs, each image must pick its caption out of N candidates (a softmax over cosine similarities divided by a temperature τ), and vice versa.

| Idea | Role |
|------|------|
| Positives | The matching pair (diagonal of the similarity matrix) |
| Negatives | Every other item in the batch, so bigger batches give more negatives |
| Temperature τ | Sharpens or softens the softmax; CLIP learns it |
| Symmetric loss | Average of image→text and text→image cross-entropy |

## Vector search
Exact search scores every document and keeps the top-k. Vector databases use **approximate nearest neighbour** indexes (HNSW graphs, IVF clustering, product quantization) to search millions of vectors in milliseconds, trading a little recall for speed.

## Retrieval-augmented generation (RAG)
RAG answers a question by retrieving relevant passages and putting them in the LLM's prompt:
1. **Retrieve** candidates: lexical (BM25, exact term matches) and/or dense (embedding similarity)
2. **Rerank** the candidates with a stronger signal (a cross-encoder, or a fusion of scores)
3. **Generate** with the top passages as context

Lexical search finds rare exact terms (names, error codes) that embeddings blur; dense search finds paraphrases that share no words. Hybrid retrieval combines both.

## Interview Topics
- Why normalise embeddings, and what the temperature does in InfoNCE
- Why in-batch negatives make large batches important for CLIP
- BM25's term-frequency saturation (k1) and length normalisation (b)
- Exact vs approximate nearest-neighbour search
- How the retrieval stage limits a RAG system's answer quality
    `,
    problems: ['infonce-loss', 'embedding-search', 'retrieve-and-rerank'],
  },
  {
    id: 'generative-models',
    title: 'Generative Models',
    description: 'Learn VAEs, diffusion models, and generative AI fundamentals.',
    icon: '🎨',
    introduction: `
# Generative Models

Generative models learn to create new data similar to the training distribution.

## Key Concepts

### Variational Autoencoders (VAEs)
- **Encoder**: Maps input to latent distribution (μ, σ)
- **Decoder**: Reconstructs input from latent sample
- **Reparameterization trick**: Enable backprop through sampling
- **Loss**: Reconstruction + KL divergence

### VAE Loss (ELBO)
\`\`\`
L = Reconstruction Loss + KL Divergence
L = ||x - x_reconstructed||² + KL(q(z|x) || p(z))
\`\`\`

### Diffusion Models
- **Forward process**: Gradually add noise to data
- **Reverse process**: Learn to denoise
- **Noise schedule**: β_t controls noise at each step

### Key Formulas
\`\`\`
x_t = sqrt(α_bar_t) * x_0 + sqrt(1 - α_bar_t) * ε
\`\`\`

### KL Divergence
- Measures difference between distributions
- KL(P || Q) ≥ 0, equals 0 iff P = Q
- Not symmetric

### Interview Topics
- Explain reparameterization trick
- VAE loss components
- Diffusion forward/reverse process
- Compare GANs vs VAEs vs Diffusion

### Sampling, Guidance and Flow Matching
- **DDPM sampling** runs the reverse process: start from noise and repeatedly subtract the predicted noise, adding a little fresh noise (σ_t² = β_t) until the last step
- **Classifier-free guidance** combines conditional and unconditional predictions, \`ε = ε_u + w·(ε_c − ε_u)\`, so a guidance scale w > 1 trades diversity for prompt fidelity
- **Flow matching / rectified flow** regresses a velocity field onto straight paths \`x_t = (1 − t)·x0 + t·x1\` with target \`x1 − x0\`, then samples by integrating the ODE with a few Euler steps

Let's implement generative models!
    `,
    problems: ['kl-divergence', 'vae-reparameterization', 'vae-loss', 'vqvae-quantization', 'diffusion-noise-schedule', 'diffusion-forward', 'ddpm-sampling-step', 'classifier-free-guidance', 'flow-matching'],
  },

  // ==========================================
  // PART 5: REINFORCEMENT LEARNING
  // ==========================================
  {
    id: 'reinforcement-learning',
    title: 'Reinforcement Learning',
    description: 'Master RL fundamentals from Q-learning to policy gradients.',
    icon: '🎮',
    introduction: `
# Reinforcement Learning

Reinforcement learning (RL) trains agents to make decisions by learning from rewards and punishments through trial and error.

## Key Concepts

### The RL Framework
- **Agent**: The learner/decision-maker
- **Environment**: What the agent interacts with
- **State (s)**: Current situation
- **Action (a)**: What the agent can do
- **Reward (r)**: Feedback signal
- **Policy (π)**: Strategy for choosing actions

### Value Functions
- **State Value V(s)**: Expected return starting from state s
- **Action Value Q(s,a)**: Expected return taking action a in state s

### Bellman Equations
\`\`\`python
V(s) = E[r + γ * V(s')]
Q(s,a) = E[r + γ * max_a' Q(s',a')]
\`\`\`

### Key Algorithms

| Algorithm | Type | Policy |
|-----------|------|--------|
| Q-Learning | Value-based | Off-policy |
| SARSA | Value-based | On-policy |
| REINFORCE | Policy-based | On-policy |
| Actor-Critic | Hybrid | On-policy |
| PPO | Policy-based | On-policy |

### Exploration vs Exploitation
- **Exploration**: Try new actions to discover better strategies
- **Exploitation**: Use known good actions to maximize reward
- **ε-greedy**: Simple balance (random with probability ε)

### RL for LLMs (RLHF)
- **Reward Modeling**: Learn preferences from human feedback
- **PPO for LLMs**: Fine-tune with KL constraints
- **DPO**: Direct preference optimization without reward model
- **GRPO**: Group-relative advantages without a critic (see Post-training & Efficiency)

### Interview Essentials
- Implement Q-learning and SARSA from scratch
- Explain on-policy vs off-policy
- Understand policy gradients and REINFORCE
- Know GAE and PPO for modern deep RL
- **RLHF**: Reward modeling, KL penalties, DPO

Master these concepts for ML interviews at top companies!
    `,
    problems: [
      'rl-discounted-return',
      'rl-epsilon-greedy',
      'rl-bellman-value',
      'rl-q-learning-update',
      'rl-sarsa-update',
      'rl-td0-prediction',
      'rl-value-iteration',
      'rl-n-step-return',
      'rl-policy-gradient',
      'rl-advantage-estimation',
      'rl-ppo-clip',
      'rl-reward-modeling',
      'rl-dpo-loss',
      'rl-kl-penalty',
      'rl-ppo-llm-objective',
    ],
  },

  {
    id: 'post-training',
    title: 'Post-training & Efficiency',
    description: 'GRPO for verifiable rewards and int8 quantization: turning a base model into a useful, cheap one.',
    icon: '🎯',
    introduction: `
# Post-training & Efficiency

A pretrained language model predicts text. Post-training turns it into an assistant that follows instructions and reflects human preferences, and efficiency techniques make it affordable to train and serve.

## Preference learning
| Method | Idea | Loss |
|--------|------|------|
| Reward model | Learn a scalar score from pairwise human preferences (Bradley–Terry) | \`-log σ(r_chosen - r_rejected)\` |
| PPO-RLHF | Maximize reward with a KL penalty that keeps the policy near the reference model | clipped surrogate with \`A = r - β·KL\` |
| DPO | Skip the reward model: optimize preferences directly through log-probability ratios | \`-log σ(β·(Δ_chosen - Δ_rejected))\` |
| GRPO | Drop PPO's value network: sample a group of responses per prompt and use each reward relative to the group as the advantage | clipped surrogate with \`A = (r - mean) / std\` and a k3 KL term |

## Why the KL penalty?
Without it, the policy drifts toward outputs that fool the reward model ("reward hacking") and forgets how to write fluent text. The KL term measures how far the policy has moved from the frozen reference model.

## GRPO and verifiable rewards
GRPO (DeepSeekMath) is popular for reasoning models trained on **verifiable** rewards: a math answer checker or unit tests give 1 for correct and 0 for wrong. With G samples per prompt, the group mean is the baseline, so no critic has to be trained, and a prompt where every sample gets the same reward contributes no gradient.

## Efficiency
Fine-tuning and serving large models is dominated by memory. Low-rank adapters (LoRA) train a tiny fraction of the weights, and quantization stores weights in fewer bits.

| Technique | Idea | Saves |
|-----------|------|-------|
| Int8 absmax quantization | \`scale = max(abs(w)) / 127\`, store \`round(w / scale)\` as int8; one scale per output channel limits the damage from outliers | 4× weight memory vs float32, faster int8 matmuls |

## Problems in This Section

- **GRPO: Group-Relative Advantages & Objective**
- **Int8 Weight Quantization (absmax)**

The reward-model loss, KL penalty, PPO-RLHF objective and DPO are practiced in **Reinforcement Learning**, and the LoRA adapter in **PyTorch Basics**.
    `,
    problems: ['grpo-advantages', 'int8-quantization'],
  },

  // ==========================================
  // PART 6: CAPSTONE - END-TO-END IMPLEMENTATIONS
  // ==========================================
  {
    id: 'e2e-implementations',
    title: 'End-to-End Implementations',
    description: 'Build complete ML models from scratch.',
    icon: '🏗️',
    introduction: `
# End-to-End Implementations

Put everything together to build complete models from scratch.

## Why Build From Scratch?

1. **Deep Understanding**: Know every component
2. **Interview Preparation**: Common coding questions
3. **Debugging Skills**: Understand what can go wrong
4. **Framework Independence**: Adapt to any library

## Models Covered

### 2-Layer MLP with Backprop
Complete neural network with:
- Forward pass through hidden layer
- Backpropagation of gradients
- Weight updates via gradient descent

### Transformer Encoder
Full encoder block with:
- Multi-head self-attention
- Positional encoding
- Layer normalization
- Feed-forward network
- Residual connections

### Variational Autoencoder (VAE)
Generative model with:
- Encoder → latent distribution
- Reparameterization trick
- Decoder → reconstruction
- ELBO loss (reconstruction + KL)

### Diffusion Model
DDPM-style diffusion with:
- Noise schedule (β, α, ᾱ)
- Forward diffusion process
- Reverse denoising process
- Training objective

### Convolutional Neural Network
Image classifier with:
- Conv2D layers
- Max pooling
- Flatten + FC layers
- Full forward pass

### Mini GPT
Character-level decoder-only Transformer with:
- Token + position embeddings
- Causal self-attention blocks
- Next-token cross-entropy loss and training
- Greedy generation

### Tiny Vision Transformer
Image classifier with:
- Patch embeddings + [CLS] token
- Position embeddings
- A pre-norm encoder block
- Classification from the CLS token

Build these models to truly understand deep learning!
    `,
    problems: ['e2e-mlp', 'e2e-transformer', 'e2e-vae', 'e2e-vqvae', 'e2e-diffusion', 'e2e-cnn', 'e2e-mini-gpt', 'e2e-vit-classifier', 'transformer-bug-hunt'],
  },
];
