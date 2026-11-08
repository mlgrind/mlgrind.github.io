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
    description: 'Learn PyTorch patterns in PyTorch, or implement them from scratch in NumPy.',
    icon: '🔥',
    defaultLanguage: 'pytorch',
    introduction: `
# PyTorch Basics

Learn PyTorch patterns and concepts. Problems in this section open in the **PyTorch** track, which runs on an in-browser, NumPy-backed subset of the torch API (real PyTorch has no WebAssembly build). Switch to **NumPy** with the toggle to implement the same ideas from scratch.

## Tensor Operations

### Creation
\`\`\`python
# PyTorch           # NumPy equivalent
torch.tensor()      np.array()
torch.zeros()       np.zeros()
torch.randn()       np.random.randn()
\`\`\`

### Operations
\`\`\`python
# PyTorch           # NumPy equivalent
x + y               x + y
x @ y               x @ y
x.sum(dim=1)        x.sum(axis=1)
x.view(2, -1)       x.reshape(2, -1)
\`\`\`

## Autograd Concepts

PyTorch tracks operations for automatic differentiation:
\`\`\`python
x = torch.tensor([2.0], requires_grad=True)
y = x ** 2
y.backward()  # dy/dx = 2x = 4
\`\`\`

In the NumPy track you implement this by hand to understand the math.

## Module Pattern
\`\`\`python
class Linear(nn.Module):
    def __init__(self, in_features, out_features):
        self.weight = Parameter(...)
        self.bias = Parameter(...)

    def forward(self, x):
        return x @ self.weight + self.bias
\`\`\`

## Loss Functions
- CrossEntropyLoss: Classification
- MSELoss: Regression
- BCELoss: Binary classification

## The Training Loop & Minibatches
Everything comes together in the loop: zero the gradients, forward pass, loss, backward pass, optimizer step, repeated over minibatches. A \`DataLoader\` shuffles the sample indices once per epoch (from a seeded generator, so runs are reproducible) and cuts them into batches. Forgetting \`zero_grad()\` makes gradients accumulate across steps, and it is the most common bug in hand-written loops.

Learn these patterns to understand PyTorch!
    `,
    problems: ['tensor-creation', 'tensor-operations', 'autograd-concepts', 'nn-modules', 'loss-functions', 'gelu-activation', 'leaky-relu-swish', 'softmax-temperature', 'rmsnorm', 'group-norm', 'adam-optimizer', 'sgd-momentum', 'lr-scheduling', 'gradient-accumulation', 'instance-norm', 'vit-patch-embeddings', 'cross-attention', 'depthwise-separable-conv', 'label-smoothing', 'lora-adapter', 'gradient-checkpointing', 'training-loop', 'dataloader-batching'],
  },

  // ==========================================
  // PART 2: DATA HANDLING
  // ==========================================
  {
    id: 'data-preprocessing',
    title: 'Data Preprocessing',
    description: 'Learn essential data cleaning and transformation techniques.',
    icon: '🧹',
    introduction: `
# Data Preprocessing

Real-world data is messy. Before training any model, you need to clean and transform your data.

## Key Concepts

### Handling Missing Data
- **Detection**: \`np.isnan()\`, \`pd.isnull()\`
- **Strategies**: Remove, fill with mean/median/mode, interpolate

### Feature Scaling
- **Normalization**: Scale to [0, 1] range using min-max scaling
- **Standardization**: Transform to zero mean, unit variance (z-score)
- **When to use**: Most algorithms need scaled features

### Encoding Categorical Data
- **One-Hot Encoding**: Convert categories to binary vectors
- **Label Encoding**: Map categories to integers
- **When to use**: Tree-based models handle label encoding; others need one-hot

### Splitting the Data
- **Train / validation / test**: fit on train, tune on validation, report on test once
- **Stratified split**: split each class separately so every split keeps the class proportions, which matters for rare classes

### Why It Matters
Garbage in, garbage out. Proper preprocessing can:
- Improve model accuracy by 10-30%
- Prevent training failures
- Reduce overfitting

Let's practice these essential skills!
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
    description: 'Implement clustering and dimensionality reduction algorithms.',
    icon: '🔍',
    introduction: `
# Unsupervised Learning

Unsupervised learning finds patterns in unlabeled data.

## Key Concepts

### K-Means Clustering
- **Goal**: Group data into K clusters
- **Algorithm**:
  1. Initialize K centroids randomly
  2. Assign points to nearest centroid
  3. Update centroids as cluster means
  4. Repeat until convergence

### Principal Component Analysis (PCA)
- **Goal**: Reduce dimensionality while preserving variance
- **Steps**:
  1. Center the data (subtract mean)
  2. Compute covariance matrix
  3. Find eigenvectors/eigenvalues
  4. Project onto top components

### Gaussian Mixtures & EM
- **Soft clustering**: each point gets a responsibility for every component
- **EM**: E-step computes responsibilities (in log space), M-step re-fits weights, means and variances
- **Guarantee**: the log-likelihood never decreases

### DBSCAN
- **Density-based**: clusters are dense regions; sparse points are labelled noise
- **Core points** have at least min_samples neighbours within eps; only they grow clusters
- **No K to choose**, and clusters can have any shape

### Why These Matter
- **K-Means**: Customer segmentation, image compression
- **PCA**: Feature reduction, visualization, noise removal
- **GMM / DBSCAN**: Density estimation, anomaly detection, non-spherical clusters

### Interview Tips
- Be ready to implement K-means from scratch
- Explain variance explained by components
- Discuss limitations (K-means assumes spherical clusters)

Let's implement these algorithms!
    `,
    problems: ['kmeans-clustering', 'pca-implementation', 'gmm-em', 'dbscan', 'kmeans-full'],
  },
  {
    id: 'model-evaluation',
    title: 'Model Evaluation',
    description: 'Learn metrics and techniques to evaluate ML models properly.',
    icon: '📈',
    introduction: `
# Model Evaluation

Building a model is only half the job. You need to evaluate it properly.

## Key Concepts

### Classification Metrics
- **Accuracy**: Correct / Total (can be misleading!)
- **Precision**: TP / (TP + FP) - "Of positive predictions, how many correct?"
- **Recall**: TP / (TP + FN) - "Of actual positives, how many found?"
- **F1 Score**: Harmonic mean of precision and recall

### Regression Metrics
- **MSE**: Mean Squared Error
- **RMSE**: Root MSE (same units as target)
- **MAE**: Mean Absolute Error (robust to outliers)
- **R²**: Proportion of variance explained

### Cross-Validation
- **Why**: Single train/test split is unreliable
- **K-Fold**: Split data into K parts, rotate test set
- **Stratified**: Maintain class distribution in folds

### Ranking & Calibration
- **ROC curve**: TPR vs FPR over every score threshold; tied scores form one diagonal step
- **AUC**: probability a random positive outscores a random negative (ties count half)
- **Calibration**: do 80%-confidence predictions come true 80% of the time? **ECE** averages the gap over confidence bins

### Interview Essentials
- Know when to use each metric
- Implement cross-validation from scratch
- Discuss precision-recall trade-offs

Let's practice evaluation!
    `,
    problems: ['precision-recall-f1', 'cross-validation', 'confusion-matrix', 'roc-auc', 'calibration-ece', 'pr-curve-thresholds'],
  },

  // ==========================================
  // PART 4: DEEP LEARNING
  // ==========================================
  {
    id: 'deep-learning',
    title: 'Deep Learning Basics',
    description: 'Activation functions and fundamental building blocks.',
    icon: '⚡',
    introduction: `
# Deep Learning Basics

Core building blocks that appear in every neural network.

## Key Concepts

### Activation Functions
- **ReLU**: max(0, x) - Most common, avoids vanishing gradient
- **Sigmoid**: 1/(1+e^-x) - Output in [0,1], used for binary classification
- **Softmax**: Converts logits to probabilities that sum to 1
- **Tanh**: Output in [-1, 1], zero-centered

### When to Use Each
- **Hidden layers**: ReLU (or variants like LeakyReLU)
- **Binary output**: Sigmoid
- **Multi-class output**: Softmax
- **RNNs**: Tanh (historically)

### Dense Layers
- **Forward pass**: output = activation(W @ x + b)
- **Parameters**: Weights W and biases b
- **Computation**: Matrix multiplication + bias + activation

Let's implement these fundamentals!
    `,
    problems: ['perceptron', 'neural-network-forward', 'backpropagation'],
  },
  {
    id: 'neural-networks',
    title: 'Neural Networks',
    description: 'Build neural networks from scratch with forward and backward passes.',
    icon: '🧠',
    introduction: `
# Neural Networks

Neural networks are the foundation of deep learning. Understanding the math behind them is essential for ML interviews.

## Key Concepts

### Multi-Layer Perceptron (MLP)
- **Architecture**: Input → Hidden layers → Output
- **Forward pass**: Compute activations layer by layer
- **Activation functions**: ReLU, Sigmoid, Tanh, Softmax

### Backpropagation
- **Chain rule**: Compute gradients layer by layer
- **Weight updates**: Gradient descent on all parameters
- **Key insight**: Errors propagate backwards through the network

### Training Techniques
- **Weight Initialization**: Xavier, He initialization
- **Batch Normalization**: Normalize activations for stable training
- **Dropout**: Randomly drop neurons to prevent overfitting

### Loss Functions
- **Cross-entropy**: For classification
- **MSE**: For regression

### Common Interview Topics
- Implement forward/backward pass from scratch
- Explain vanishing/exploding gradients
- Discuss initialization strategies
- Implement regularization techniques

Let's build neural networks from scratch!
    `,
    problems: ['cross-entropy-loss', 'mlp-forward-backward', 'weight-init', 'batch-norm', 'dropout', 'masked-label-smoothing-ce'],
  },
  {
    id: 'optimization',
    title: 'Optimization & Training',
    description: 'Gradient clipping, mixed-precision loss scaling and the tricks that keep long training runs stable.',
    icon: '⚙️',
    introduction: `
# Optimization & Training

A model is only as good as the procedure that fits it. This section covers what happens between \`loss.backward()\` and the next forward pass: how the update is computed, how large it is, and the tricks that stop long training runs from diverging.

## From SGD to Adam

Every optimizer turns a gradient \`g\` into an update for the parameters \`θ\`:

| Optimizer | Update | Idea |
|-----------|--------|------|
| **SGD** | \`θ -= lr * g\` | Step down the current gradient |
| **Momentum** | \`v = μv + g;  θ -= lr * v\` | Average gradients over time: speed up along consistent directions, damp oscillations |
| **Nesterov** | \`θ -= lr * (g + μv)\` | Look ahead along the velocity before stepping |
| **RMSprop** | \`s = ρs + (1-ρ)g²;  θ -= lr * g / √s\` | Per-parameter step size from recent gradient scale |
| **Adam** | momentum on \`g\` + RMSprop on \`g²\` + bias correction | Default for most deep learning |
| **AdamW** | Adam + decoupled weight decay \`θ *= 1 - lr·λ\` | Default for transformers; L2 inside Adam is *not* the same thing |

You implement SGD with momentum, Adam and learning-rate schedules in **PyTorch Basics** (SGD with Momentum, Adam Optimizer, Learning Rate Scheduling).

## Learning-Rate Schedules

The learning rate is the single most important hyperparameter, and it rarely stays constant:

\`\`\`
warmup (linear 0 -> max)  ->  decay (cosine / linear / step)  ->  floor (min_lr)
\`\`\`

Warmup protects the first steps, when Adam's statistics are noisy and the weights are random. Decay lets the model settle into a minimum.

## Keeping Training Stable

| Problem | Symptom | Fix |
|---------|---------|-----|
| Exploding gradients | Loss spikes, NaNs | **Gradient clipping** by global norm (\`clip_grad_norm_\`, usually \`max_norm=1.0\`) |
| Batch doesn't fit in memory | OOM errors | **Gradient accumulation**: sum the gradients of k micro-batches (each loss / k) before stepping (practiced in PyTorch Basics) |
| fp16 gradients underflow to 0 | Training stalls in mixed precision | **Dynamic loss scaling**: multiply the loss by S, halve S on overflow, grow it after N clean steps |

\`\`\`python
# A typical modern training step
with torch.autocast('cuda', dtype=torch.float16):
    loss = model(x, y) / accum_steps
scaler.scale(loss).backward()
if (step + 1) % accum_steps == 0:
    scaler.unscale_(optimizer)
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    scaler.step(optimizer)          # skipped if the gradients overflowed
    scaler.update()                 # adjust the loss scale
    optimizer.zero_grad()
    scheduler.step()
\`\`\`

## Why It Matters

- **Interviews** regularly ask you to write Adam from memory, explain bias correction, or explain why AdamW decouples weight decay.
- **In practice**, most "my model won't train" bugs are optimization bugs: a missing warmup, no clipping, a forgotten \`1/k\` in accumulation, or a loss scale stuck at 0.

## Problems in This Section

- **Gradient Clipping by Global Norm**: rescale all gradients together when their combined norm is too large
- **Dynamic Loss Scaling**: simulate \`GradScaler\`'s scale updates for mixed-precision training

Let's implement the stability tricks of a training step!
    `,
    problems: ['gradient-clipping', 'loss-scaling'],
  },
  {
    id: 'cnn',
    title: 'CNNs & Computer Vision',
    description: 'Implement convolutions, pooling, object detection, and segmentation.',
    icon: '🖼️',
    introduction: `
# Convolutional Neural Networks (CNNs)

CNNs are the backbone of computer vision. They learn hierarchical features from images.

## Key Concepts

### Convolution Operation
- **Kernel/Filter**: Small matrix that slides over input
- **Feature maps**: Output of applying filters
- **Parameters**: Stride, padding, kernel size

### Pooling Layers
- **Max pooling**: Take maximum in each region
- **Average pooling**: Take average in each region
- **Purpose**: Reduce spatial dimensions, add translation invariance

### CNN Architecture Components
1. **Convolutional layers**: Extract features
2. **Pooling layers**: Reduce dimensions
3. **Flatten**: Convert 2D to 1D
4. **Fully connected**: Classification

### Output Size Formula
\`\`\`
output = (input - kernel + 2*padding) / stride + 1
\`\`\`

### Classic Architectures
- **LeNet**: First successful CNN
- **AlexNet**: Deep CNNs for ImageNet
- **VGG**: Very deep, small kernels
- **ResNet**: Skip connections

### Residual Blocks
A ResNet basic block computes \`ReLU(F(x) + shortcut(x))\` with \`F = conv-BN-ReLU-conv-BN\`. The shortcut is the identity, or a strided 1x1 conv + BN when the channels or resolution change. If the identity is optimal, the block only has to drive \`F\` to zero, which is what makes 100+ layer networks trainable.

### Object Detection
- **IoU (Intersection over Union)**: Measures overlap between predicted and ground truth boxes
- **Non-Maximum Suppression (NMS)**: Filters redundant detections by keeping only the highest-scoring box per object
- **Focal Loss**: Addresses class imbalance by down-weighting easy examples (RetinaNet)
- **Smooth L1 Loss**: Bounding box regression loss — less sensitive to outliers than L2

### Image Segmentation
- **Pixel-level classification**: Assign a label to every pixel
- **Evaluation metrics**: IoU (Jaccard), Dice Coefficient, Pixel Accuracy
- **Key architectures**: U-Net, FCN, Mask R-CNN

Let's implement CNN operations and detection/segmentation fundamentals!
    `,
    problems: ['conv-output-size', 'conv2d-forward', 'max-pool', 'flatten-layer', 'conv2d-advanced', 'iou-bounding-box', 'nms', 'focal-loss', 'smooth-l1-loss', 'seg-metrics', 'resnet-block'],
  },
  {
    id: 'sequence-models',
    title: 'Sequence Models',
    description: 'RNNs, LSTMs and GRUs: modelling sequences before (and alongside) attention.',
    icon: '🔁',
    introduction: `
# Sequence Models

Text, audio, time series and user sessions are all **sequences**: the order matters, and the length varies. Before transformers, recurrent networks were the standard way to model them. They still show up in streaming and on-device models, and modern state-space models (Mamba, RWKV) bring back the same recurrent idea.

## The Recurrent Idea

An RNN reads one element at a time and updates a fixed-size **hidden state** that summarizes the past, reusing the same weights at every step:

\`\`\`
h_t = tanh(x_t @ W_xh + h_{t-1} @ W_hh + b)
\`\`\`

Training unrolls the loop over time and backpropagates through every step: **backpropagation through time (BPTT)**. The gradient reaching step 1 from step T is a product of T Jacobians:

\`\`\`
dh_T/dh_1 = prod_t  diag(1 - h_t^2) @ W_hh.T
\`\`\`

If the largest singular value of \`W_hh\` is below 1, this product **vanishes**; above 1, it can **explode**. Plain RNNs therefore struggle to learn dependencies longer than a few dozen steps (clipping helps with exploding gradients, but not with vanishing ones).

## Gated Cells

Gates are sigmoids in \`[0, 1]\` that decide, per dimension, how much information flows.

| Cell | State | Gates | Key equation |
|------|-------|-------|--------------|
| **RNN** | \`h\` | none | \`h = tanh(W x + U h)\` |
| **LSTM** | \`h\`, \`c\` | input \`i\`, forget \`f\`, output \`o\` (+ candidate \`g\`) | \`c = f*c + i*g\`, \`h = o*tanh(c)\` |
| **GRU** | \`h\` | reset \`r\`, update \`z\` | \`h = (1-z)*n + z*h_prev\` |

The LSTM's cell state is updated **additively**: when \`f ≈ 1\`, \`dc_t/dc_{t-1} ≈ 1\` and gradients can travel hundreds of steps. That is why the forget-gate bias is often initialized to 1.

## PyTorch Conventions (worth memorizing)

| | LSTM (\`nn.LSTMCell\`) | GRU (\`nn.GRUCell\`) |
|---|---|---|
| Gate order in \`weight_ih\` / \`weight_hh\` | \`i, f, g, o\` | \`r, z, n\` |
| Weight shapes | \`(4H, D)\`, \`(4H, H)\` | \`(3H, D)\`, \`(3H, H)\` |
| Parameters (with both biases) | \`4(HD + H² + 2H)\` | \`3(HD + H² + 2H)\` |

## RNNs vs Transformers

| | RNN / LSTM | Transformer |
|---|---|---|
| Training | Sequential over time (slow) | Parallel over positions |
| Inference per token | O(1) memory and compute | O(T) with a KV cache |
| Long-range dependencies | Hard (bounded state) | Direct attention to any position |

## Why It Matters

- **Interviews** ask you to write an LSTM step, explain vanishing gradients and how gating fixes them, or count the parameters of a GRU.
- **In practice**, understanding recurrence makes state-space models, streaming ASR and RNN-style inference tricks easy to follow.

Let's build these cells from scratch!
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
