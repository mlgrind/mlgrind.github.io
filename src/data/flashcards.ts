import { FlashCard } from '../types';

// Each card's id keys the learner's saved review schedule (localStorage
// 'ml-grind-flashcard-progress'), so never rename or reuse an id. Questions
// render as plain text; answers render as Markdown (react-markdown, no GFM
// tables or LaTeX), so write math inline in code spans with Unicode symbols.
export const flashCards: FlashCard[] = [
  // numpy-fundamentals
  {
    id: 'fc-numpy-broadcasting',
    sectionId: 'numpy-fundamentals',
    question: "What are NumPy's broadcasting rules, and does (3, 4) + (3,) work?",
    answer: `Compare shapes from the **right**, one dimension at a time:

1. Pad the shorter shape with 1s on the left.
2. Two sizes are compatible if they are equal or one of them is 1; a size-1 axis is stretched (no copy is made).
3. Otherwise NumPy raises an error.

\`(3, 4) + (4,)\` → \`(1, 4)\` → \`(3, 4)\` works. \`(3, 4) + (3,)\` fails (4 vs 3); reshape to \`b[:, None]\`, shape \`(3, 1)\`, to add per row.

**Pitfall:** size-1 axes never raise errors, so a misplaced axis gives a wrong answer silently: \`(n,) + (n, 1)\` becomes \`(n, n)\`.`,
    tags: ['numpy', 'broadcasting'],
  },
  {
    id: 'fc-numpy-axis-keepdims',
    sectionId: 'numpy-fundamentals',
    question: "What does axis=0 mean in x.sum(axis=0), and why does keepdims=True matter?",
    answer: `\`axis=k\` is the dimension that gets **collapsed**. For \`x\` of shape \`(N, D)\`:

- \`x.sum(axis=0)\` → \`(D,)\`: one value per feature, summed over samples.
- \`x.sum(axis=1)\` → \`(N,)\`: one value per row.

\`keepdims=True\` keeps the reduced axis with size 1, e.g. \`(N, 1)\`, so the result broadcasts back against \`x\`:

\`x - x.max(axis=1, keepdims=True)\` subtracts each row's max.

**Pitfall:** without keepdims, \`(N, D) - (N,)\` raises an error, or, when N == D, silently subtracts per column instead of per row.`,
    tags: ['numpy', 'reductions'],
  },
  {
    id: 'fc-numpy-reshape-transpose',
    sectionId: 'numpy-fundamentals',
    question: "How do reshape and transpose differ, and why is x.reshape(4, 3) not the same as x.T for a (3, 4) array?",
    answer: `- \`reshape\` keeps the elements in row-major (C) order and re-cuts that sequence into a new shape.
- \`transpose\` / \`.T\` permutes the **axes**: element \`[i, j]\` moves to \`[j, i]\`. It returns a view with swapped strides.

For \`x = np.arange(12).reshape(3, 4)\`: \`x.reshape(4, 3)[0]\` is \`[0, 1, 2]\`, but \`x.T[0]\` is \`[0, 4, 8]\`.

**Pitfall:** splitting attention heads. \`(B, T, d_model)\` → \`reshape(B, T, h, d_k)\` → \`transpose(0, 2, 1, 3)\` gives \`(B, h, T, d_k)\`. Reshaping straight to \`(B, h, T, d_k)\` scrambles tokens across heads.`,
    tags: ['numpy', 'shapes'],
  },
  {
    id: 'fc-numpy-view-copy',
    sectionId: 'numpy-fundamentals',
    question: "When does NumPy indexing return a view, and when a copy?",
    answer: `- **Basic indexing** (integers, slices, \`None\`, \`...\`), e.g. \`a[1:5]\`, \`a[:, 2]\`: a **view**. Writing to it changes \`a\`.
- **Advanced indexing** (integer arrays or boolean masks), e.g. \`a[[0, 2]]\`, \`a[a > 0]\`: a **copy**.

Exception: *assigning* through advanced indexing, \`a[a > 0] = 0\`, does write into \`a\`.

Check with \`np.shares_memory(a, b)\`; call \`.copy()\` when you need an independent array.

**Pitfall:** \`b = a[mask]; b[:] = 0\` leaves \`a\` unchanged.`,
    tags: ['numpy', 'memory'],
  },
  {
    id: 'fc-numpy-dtype-pitfalls',
    sectionId: 'numpy-fundamentals',
    question: "Name two NumPy dtype pitfalls that silently corrupt results.",
    answer: `1. **Floats assigned into an integer array are truncated.** \`a = np.array([1, 2, 3]); a[0] = 0.7\` leaves \`a[0] == 0\`. Create float arrays explicitly (\`dtype=float\`, or \`np.zeros(n)\`, which is float64).
2. **Integer overflow wraps around without an error:** \`np.array([200], dtype=np.uint8) + 100\` gives \`[44]\`. Image arrays (uint8) are the usual victim: convert to float before arithmetic.

Related: compare float results with \`np.allclose\`, not \`==\`, and remember float32 has only ~7 significant digits.`,
    tags: ['numpy', 'dtypes'],
  },
  // python-basics
  {
    id: 'fc-python-vectorization',
    sectionId: 'python-basics',
    question: "Why is vectorized NumPy code much faster than a Python loop?",
    answer: `A Python loop pays interpreter overhead on **every element**: bytecode dispatch, a boxed Python object per number, dynamic type checks. A NumPy call pays it **once**, then runs a compiled C loop over a contiguous buffer of one dtype, which is cache-friendly and can use SIMD instructions. Matrix products go to an optimized, multithreaded BLAS.

Typical speedup: 10–100× for elementwise work, much more for \`@\` versus a triple loop.

**Pitfall:** \`np.vectorize\` and \`np.apply_along_axis\` are still Python loops underneath. Rewrite with broadcasting instead.`,
    tags: ['python', 'performance'],
  },
  {
    id: 'fc-python-matmul',
    sectionId: 'python-basics',
    question: "What shapes does A @ B accept, and how is it different from A * B?",
    answer: `- \`(m, k) @ (k, n)\` → \`(m, n)\`: inner dimensions must match. \`C[i, j] = Σ_k A[i, k] · B[k, j]\`, costing \`m·k·n\` multiply-adds.
- Batched: leading dimensions broadcast. \`(b, m, k) @ (b, k, n)\` → \`(b, m, n)\`, and \`(b, m, k) @ (k, n)\` → \`(b, m, n)\`.
- 1-D operands: \`(k,) @ (k,)\` is a scalar (dot product); \`(m, k) @ (k,)\` → \`(m,)\`.

\`A * B\` is **elementwise** multiplication (with broadcasting), never a matrix product.`,
    tags: ['linear-algebra', 'numpy'],
  },
  {
    id: 'fc-python-rank1-arrays',
    sectionId: 'python-basics',
    question: "What is the difference between arrays of shape (n,), (n, 1) and (1, n)?",
    answer: `- \`(n,)\`: a 1-D array, neither a row nor a column; \`.T\` does nothing to it.
- \`(n, 1)\`: a column vector. \`(1, n)\`: a row vector.

For \`v\` of shape \`(n,)\`, \`v @ v\` is a scalar. For a column \`c\` of shape \`(n, 1)\`, \`c @ c.T\` is \`(n, n)\` and \`c.T @ c\` is \`(1, 1)\`.

**Pitfall:** mixing them in a loss. \`y_pred\` of shape \`(n, 1)\` minus \`y\` of shape \`(n,)\` broadcasts to \`(n, n)\`, and \`.mean()\` returns a plausible but wrong number. Use \`y_pred.ravel()\` or \`y[:, None]\`, and assert shapes.`,
    tags: ['numpy', 'shapes'],
  },
  // einsum
  {
    id: 'fc-einsum-rules',
    sectionId: 'einsum',
    question: "How do you read an einsum string, and which indices get summed?",
    answer: `Each operand gets one letter per axis; the letters after \`->\` name the output axes.

- An index **missing from the output is summed over**, whether or not it repeats: \`'ij->i'\` sums over j.
- An index kept in the output and shared by several inputs is multiplied elementwise (a batch axis).

\`'ik,kj->ij'\`: k appears in both inputs but not in the output, so it is contracted: matrix multiplication.

**Pitfall:** without \`->\` (implicit mode), the output is the non-repeated indices in **alphabetical** order, so \`np.einsum('ji', A)\` is a transpose. Always write the \`->\`.`,
    tags: ['einsum', 'notation'],
  },
  {
    id: 'fc-einsum-patterns',
    sectionId: 'einsum',
    question: "Give the einsum strings for trace, diagonal, transpose, outer product, row sums and batched matmul.",
    answer: `- Trace: \`'ii->'\`
- Diagonal: \`'ii->i'\`
- Transpose: \`'ij->ji'\`
- Dot product: \`'i,i->'\`
- Outer product: \`'i,j->ij'\`
- Row sums: \`'ij->i'\`; column sums: \`'ij->j'\`
- Matrix multiply: \`'ik,kj->ij'\`
- Batched matmul: \`'bij,bjk->bik'\`
- Bilinear form xᵀAy: \`'i,ij,j->'\``,
    tags: ['einsum', 'patterns'],
  },
  {
    id: 'fc-einsum-attention',
    sectionId: 'einsum',
    question: "Write the einsums for multi-head attention scores and for applying the attention weights to V.",
    answer: `Letters: b batch, h heads, q / k query and key positions, d head dimension.

- Scores: \`np.einsum('bhqd,bhkd->bhqk', Q, K) / np.sqrt(d_k)\` → \`(batch, heads, q_len, k_len)\`. d is contracted, so each score is a dot product q·k. Same as \`Q @ K.swapaxes(-1, -2)\`.
- Output: \`np.einsum('bhqk,bhkd->bhqd', P, V)\` → \`(batch, heads, q_len, d_k)\`. k is contracted, so each query gets a weighted sum of value vectors.`,
    tags: ['einsum', 'attention'],
  },
  {
    id: 'fc-einsum-vs-matmul',
    sectionId: 'einsum',
    question: "When would you use einsum instead of @, and what can go wrong with its performance?",
    answer: `Einsum states the contraction explicitly and replaces chains of \`transpose\` / \`reshape\`, which helps with multi-axis contractions such as attention, or merging heads into the output projection with \`'bthd,hdm->btm'\`.

Performance: NumPy's \`einsum\` defaults to \`optimize=False\`, contracting operands left to right with its own loops, often without BLAS. With 3+ operands the contraction order can change the cost by orders of magnitude: pass \`optimize=True\` (inspect with \`np.einsum_path\`). \`torch.einsum\` maps to batched matmuls.

**Pitfall:** an accidental output index (e.g. \`'ij,jk->ijk'\`) silently builds a huge intermediate instead of contracting.`,
    tags: ['einsum', 'performance'],
  },
  // pytorch-basics
  {
    id: 'fc-pytorch-autograd',
    sectionId: 'pytorch-basics',
    question: "How does PyTorch autograd compute gradients, and why do gradients accumulate?",
    answer: `During the forward pass, every operation on a tensor with \`requires_grad=True\` records a node (its \`grad_fn\`) in a dynamic graph and saves what it needs for backward. \`loss.backward()\` walks the graph in reverse, applying each node's vector-Jacobian product (the chain rule), then frees the graph.

Gradients are **added** into each leaf's \`.grad\`, so a parameter used twice, or several micro-batches, sum their contributions.

**Pitfalls:** forgetting \`optimizer.zero_grad()\` every step, so old gradients pile up; calling \`backward()\` twice on one graph needs \`retain_graph=True\`.`,
    tags: ['pytorch', 'autograd'],
  },
  {
    id: 'fc-pytorch-training-loop',
    sectionId: 'pytorch-basics',
    question: "Write a PyTorch training step in the correct order.",
    answer: `After \`model.train()\`, for each batch \`(x, y)\`:

1. \`optimizer.zero_grad()\`: clear the previous step's gradients.
2. \`logits = model(x)\`: forward pass.
3. \`loss = loss_fn(logits, y)\`
4. \`loss.backward()\`: fill every parameter's \`.grad\`.
5. \`optimizer.step()\`: update the parameters.
6. \`scheduler.step()\`: advance a per-step schedule, always after \`optimizer.step()\`.

Log \`loss.item()\`, not \`loss\`: keeping the tensor keeps its graph alive.`,
    tags: ['pytorch', 'training'],
  },
  {
    id: 'fc-pytorch-train-eval',
    sectionId: 'pytorch-basics',
    question: "What do model.eval() and torch.no_grad() each do, and why do you usually need both at inference?",
    answer: `- \`model.eval()\` changes **layer behavior**: Dropout becomes the identity and BatchNorm uses its running mean/variance instead of batch statistics. It does not touch autograd.
- \`torch.no_grad()\` (or \`torch.inference_mode()\`) stops **graph recording**: less memory, faster, no gradients.

They are independent, so inference needs both.

**Pitfalls:** evaluating without \`eval()\` gives noisy, batch-dependent predictions; forgetting \`model.train()\` afterwards silently disables dropout for the rest of training.`,
    tags: ['pytorch', 'inference'],
  },
  {
    id: 'fc-pytorch-loss',
    sectionId: 'pytorch-basics',
    question: "When do you use CrossEntropyLoss vs BCEWithLogitsLoss, and what inputs does each expect?",
    answer: `- **CrossEntropyLoss**: exactly one of C classes. Input: raw logits \`(N, C)\`. Target: class indices \`(N,)\` (int64) or class probabilities \`(N, C)\`. Computes log-softmax + negative log-likelihood.
- **BCEWithLogitsLoss**: binary or multi-label (an independent yes/no per class). Input: logits \`(N,)\` or \`(N, C)\`. Target: floats in [0, 1], same shape. Computes sigmoid + binary cross-entropy.

Both take **logits** and use the log-sum-exp trick internally for numerical stability.

**Pitfall:** applying \`softmax\` before \`CrossEntropyLoss\` (a double softmax). It still runs, but trains badly.`,
    tags: ['pytorch', 'loss'],
  },
  {
    id: 'fc-pytorch-view-reshape',
    sectionId: 'pytorch-basics',
    question: "What is the difference between view and reshape in PyTorch, and when does view fail?",
    answer: `\`view\` reinterprets the same storage with new strides and never copies, so it needs a compatible memory layout. After \`transpose\` / \`permute\` a tensor is usually non-contiguous, and \`view\` raises an error.

\`reshape\` returns a view when possible and silently copies otherwise. Merging attention heads explicitly: \`x.transpose(1, 2).contiguous().view(B, T, d_model)\`.

**Pitfall:** since \`reshape\` may or may not copy, never rely on writes to its result reaching the original tensor.`,
    tags: ['pytorch', 'shapes'],
  },
  {
    id: 'fc-pytorch-detach',
    sectionId: 'pytorch-basics',
    question: "What do .detach(), .item() and .numpy() do, and when do you need them?",
    answer: `- \`.detach()\`: same data, cut out of the graph, so no gradient flows through it. Used for fixed targets (TD targets, EMA teachers) and logging.
- \`.item()\`: a one-element tensor → Python number (forces a GPU sync).
- \`.numpy()\`: shares memory with a CPU tensor; it errors on tensors that require grad, hence \`t.detach().cpu().numpy()\`.

**Pitfall:** \`total_loss += loss\` instead of \`loss.item()\` keeps every step's graph alive and leaks memory.`,
    tags: ['pytorch', 'autograd'],
  },
  {
    id: 'fc-pytorch-gelu-silu',
    sectionId: 'pytorch-basics',
    question: "Define GELU and SiLU (Swish). Why do transformers use them instead of ReLU?",
    answer: `- **GELU**: \`x · Φ(x)\`, where Φ is the standard normal CDF. Tanh approximation: \`0.5·x·(1 + tanh(√(2/π)·(x + 0.044715·x³)))\`.
- **SiLU / Swish**: \`x · σ(x)\`.
- **LeakyReLU**: \`x\` if \`x > 0\`, else \`α·x\` (α ≈ 0.01).

GELU and SiLU are smooth, slightly non-monotonic (a small dip below 0), and pass some gradient for negative inputs, so units don't die. They train better in transformers: GELU in BERT and GPT-2, SiLU inside SwiGLU in LLaMA.

**Pitfall:** \`nn.GELU()\` is the exact erf version; \`approximate='tanh'\` matches GPT-2.`,
    tags: ['pytorch', 'activation'],
  },
  {
    id: 'fc-pytorch-norm-family',
    sectionId: 'pytorch-basics',
    question: "BatchNorm, LayerNorm, InstanceNorm, GroupNorm: which axes does each normalize over for an (N, C, H, W) tensor?",
    answer: `Each subtracts a mean, divides by a standard deviation, then applies learnable γ, β:

- **BatchNorm**: over \`(N, H, W)\`, per channel. Depends on the batch; uses running statistics at eval time.
- **LayerNorm**: over \`(C, H, W)\`, per sample. In transformers: over \`d_model\`, per token.
- **InstanceNorm**: over \`(H, W)\`, per sample and channel (style transfer).
- **GroupNorm**: over \`(H, W)\` and the channels of each of G groups, per sample. G = 1 → LayerNorm; G = C → InstanceNorm.

Only BatchNorm mixes samples. The others work with batch size 1 and behave identically in training and inference, which is why GroupNorm is used when batches are tiny.`,
    tags: ['pytorch', 'normalization'],
  },
  {
    id: 'fc-pytorch-label-smoothing',
    sectionId: 'pytorch-basics',
    question: "What is label smoothing, what are the smoothed targets, and why does it help?",
    answer: `Replace the one-hot target with \`y = (1 − ε) · one_hot + ε / K\` for K classes, then use cross-entropy as usual. ε = 0.1, K = 10: the true class gets 0.91, every other class 0.01.

Plain cross-entropy keeps decreasing as the logit gap grows, so it pushes the model toward over-confidence. Smoothing gives a finite optimal gap, which improves calibration and often accuracy (the original Transformer used ε = 0.1).

In PyTorch: \`nn.CrossEntropyLoss(label_smoothing=0.1)\`.

**Pitfall:** padding positions must stay out of the loss entirely (\`ignore_index\`), smoothing included.`,
    tags: ['pytorch', 'regularization'],
  },
  {
    id: 'fc-pytorch-cross-attention',
    sectionId: 'pytorch-basics',
    question: "How does cross-attention differ from self-attention, and what are the shapes?",
    answer: `Queries come from one sequence; keys and values from another (the "memory"):

- \`Q = x @ W_q\` → \`(B, T_q, d_model)\`
- \`K = mem @ W_k\`, \`V = mem @ W_v\` → \`(B, T_kv, d_model)\`

Per head, the scores are \`(B, h, T_q, T_kv)\`, and the output has the **query's** length: \`(B, T_q, d_model)\`.

Uses: the decoder attending to the encoder output in translation; image latents attending to text embeddings in text-to-image diffusion. Over the memory you need a padding mask, never a causal mask.`,
    tags: ['pytorch', 'attention'],
  },
  {
    id: 'fc-pytorch-dataloader',
    sectionId: 'pytorch-basics',
    question: "What do shuffle, batch_size and drop_last do in a DataLoader, and what are common bugs?",
    answer: `- \`shuffle=True\` draws a new permutation every epoch, so each minibatch gradient is an unbiased estimate of the full gradient. Training only.
- \`batch_size\` = samples per step; there are \`ceil(N / batch_size)\` steps per epoch.
- \`drop_last=True\` drops the final, smaller batch (useful with BatchNorm, since \`BatchNorm1d\` errors on a batch of one in training mode).

Common bugs: shuffling features and labels with *different* permutations; shuffling the validation set and then comparing predictions to labels in file order; averaging per-batch mean losses when the last batch is smaller.`,
    tags: ['pytorch', 'data'],
  },
  // data-preprocessing
  {
    id: 'fc-preprocess-normalize',
    sectionId: 'data-preprocessing',
    question: "Min-max normalization vs standardization: what are the formulas, when do you use each, and what is the leakage pitfall?",
    answer: `- **Min-max**: \`(x − min) / (max − min)\` → [0, 1]. For bounded inputs such as pixels. A single outlier squashes everything else into a narrow band.
- **Standardization (z-score)**: \`(x − μ) / σ\` → mean 0, std 1. The default for gradient descent, regularized linear models, SVMs, k-NN and PCA. It does not assume Gaussian data.

Neither is robust to outliers: use median/IQR scaling, clipping or a log transform. Tree models don't need scaling.

**Pitfall:** compute min/max/μ/σ on the **training split only** and reuse them for validation and test. Guard constant columns (σ = 0).`,
    tags: ['preprocessing', 'scaling'],
  },
  {
    id: 'fc-preprocess-onehot',
    sectionId: 'data-preprocessing',
    question: "Why one-hot encode categorical features instead of label encoding them, and when is one-hot a bad idea?",
    answer: `Label encoding (cat = 0, dog = 1, bird = 2) invents an order and distances that linear, distance-based and neural models will use. One-hot gives each category its own independent column.

When to do something else:

- **High cardinality** (user IDs, zip codes): use embeddings, hashing, or target encoding computed out-of-fold.
- **Unregularized linear regression with an intercept**: drop one column, because the one-hot columns sum to 1 (the dummy-variable trap).
- **Unseen categories at test time**: map them to an "unknown" column.

Tree ensembles often do fine with integer codes or native categorical support.`,
    tags: ['preprocessing', 'encoding'],
  },
  {
    id: 'fc-preprocess-leakage',
    sectionId: 'data-preprocessing',
    question: "What is data leakage? Give three common ways it gets into a pipeline.",
    answer: `Leakage: during training the model gets information it won't have at prediction time, so validation scores are inflated and production performance disappoints.

1. **Preprocessing fit on all the data** (scaler, imputer, PCA, feature selection) before splitting. Fit it on the training folds only, e.g. with a Pipeline inside cross-validation.
2. **Target leakage**: features derived from the label or from the future (e.g. "account closure date" when predicting churn).
3. **Split leakage**: random splits of time series, or the same user, patient or near-duplicate in both train and test. Use time-based or grouped splits.

Red flag: a validation score that looks too good to be true.`,
    tags: ['preprocessing', 'leakage'],
  },
  {
    id: 'fc-preprocess-missing',
    sectionId: 'data-preprocessing',
    question: "What are the main strategies for handling missing values?",
    answer: `- **Drop** rows or columns: only when few values are missing at random, or a column is mostly empty.
- **Simple imputation**: mean (sensitive to outliers), median (robust), most-frequent or an explicit "missing" category for categoricals.
- **Model-based**: k-NN or iterative (regression) imputation.
- **Add an is-missing indicator**: missingness itself is often informative.

Fit imputation statistics on the training split only. XGBoost and LightGBM handle NaN natively by learning which branch missing values take.

**Pitfall:** \`np.mean\` returns NaN if any value is NaN; use \`np.nanmean\`.`,
    tags: ['preprocessing', 'missing-data'],
  },
  {
    id: 'fc-preprocess-stratified',
    sectionId: 'data-preprocessing',
    question: "What is a stratified split, and when do you need one?",
    answer: `A split that preserves each class's proportion in every subset: split each class's indices separately with the same fraction, then combine and shuffle.

Needed for **imbalanced or small** datasets. With 1,000 samples and 2% positives, a random 200-sample test set expects 4 positives, but has a ~9% chance of getting at most 1, so metrics on it are mostly noise. A cross-validation fold may get none at all, leaving recall or AUC undefined.

Use \`StratifiedKFold\` for CV. With grouped or temporal data, group or time splits take priority, since leakage is the bigger problem.`,
    tags: ['preprocessing', 'splitting'],
  },
  // supervised-learning
  {
    id: 'fc-supervised-bias-variance',
    sectionId: 'supervised-learning',
    question: "Explain the bias-variance decomposition. How does model complexity affect each term?",
    answer: `For squared error, averaged over possible training sets:

\`E[(y − ŷ)²] = Bias² + Variance + σ²\` (σ² = irreducible noise)

- **Bias**: error of the average model. Too simple → underfits (high train *and* test error).
- **Variance**: how much ŷ changes with the training sample. Too flexible → overfits (low train, high test error).

More complexity lowers bias and raises variance. Regularization, bagging and more data reduce variance; richer features and models reduce bias. (Very large networks can show "double descent": test error falls again past the point where they interpolate the data.)`,
    tags: ['ml-theory', 'tradeoffs'],
  },
  {
    id: 'fc-supervised-normal-equation',
    sectionId: 'supervised-learning',
    question: "What is the closed-form solution of linear regression, and when should you use gradient descent instead?",
    answer: `Minimizing \`‖Xw − y‖²\` gives the normal equations \`XᵀX w = Xᵀy\`, so \`w = (XᵀX)⁻¹ Xᵀy\`. Add a column of ones to X for the bias.

Cost: \`O(N·D²)\` to form XᵀX plus \`O(D³)\` to solve. Use \`np.linalg.solve\` or \`np.linalg.lstsq\` (QR/SVD based, also handles rank-deficient X); never form the inverse explicitly.

Prefer gradient descent when D is very large, when the data doesn't fit in memory (mini-batch SGD), or when the loss has no closed form (logistic regression, L1).`,
    tags: ['regression', 'linear-algebra'],
  },
  {
    id: 'fc-supervised-gd-convergence',
    sectionId: 'supervised-learning',
    question: "What determines whether gradient descent converges, and how do you spot a bad learning rate?",
    answer: `The learning rate relative to the curvature. On a quadratic whose Hessian has largest eigenvalue L, gradient descent converges iff \`lr < 2/L\` (\`lr = 1/L\` is the safe choice). Speed depends on the condition number L/μ: long, narrow valleys make it zig-zag.

From the loss curve:

- Too high: loss oscillates, climbs, or becomes NaN.
- Too low: smooth but painfully slow decrease.

Fixes: feature scaling (better conditioning), momentum or Adam, learning-rate schedules. In deep networks, saddle points and plateaus are a bigger problem than bad local minima.`,
    tags: ['optimization', 'gradient-descent'],
  },
  {
    id: 'fc-supervised-logistic',
    sectionId: 'supervised-learning',
    question: "Why does logistic regression use the sigmoid, and what is the gradient of its loss?",
    answer: `Model the log-odds as linear: \`log(p / (1 − p)) = w·x + b\`. Solving for p gives \`p = σ(z) = 1 / (1 + e^(−z))\`, a smooth map to (0, 1) that can be read as a probability. A hard threshold has zero gradient almost everywhere.

With binary cross-entropy the gradient is simple:

\`∂L/∂z = p − y\`, so \`∂L/∂w = Xᵀ(p − y) / N\` and \`∂L/∂b = mean(p − y)\`.

Also \`σ'(z) = σ(z)(1 − σ(z))\`. Cross-entropy with a sigmoid is convex in w; mean squared error with a sigmoid is not.`,
    tags: ['classification', 'sigmoid'],
  },
  {
    id: 'fc-supervised-bce-stable',
    sectionId: 'supervised-learning',
    question: "How do you compute binary cross-entropy without log(0) or overflow?",
    answer: `\`BCE = −[y·log p + (1 − y)·log(1 − p)]\`, averaged over samples.

- From probabilities: clip p to \`[ε, 1 − ε]\` (e.g. ε = 1e-7) before the log.
- From logits z (better): \`BCE = max(z, 0) − z·y + log(1 + e^(−|z|))\`, which never exponentiates a large positive number. This is what \`BCEWithLogitsLoss\` does.

**Pitfall:** \`np.log(1 / (1 + np.exp(-z)))\` returns \`-inf\` for z = −800: \`exp(800)\` overflows, the sigmoid becomes 0, and log(0) = −∞.`,
    tags: ['classification', 'numerical-stability'],
  },
  {
    id: 'fc-supervised-l1-l2',
    sectionId: 'supervised-learning',
    question: "L1 vs L2 regularization: what does each do to the weights, and why does L1 produce sparsity?",
    answer: `- **L2 (ridge)**: add \`λ‖w‖²\`. Its gradient \`2λw\` shrinks weights in proportion to their size, so they get small but rarely exactly 0. Closed form \`w = (XᵀX + λI)⁻¹ Xᵀy\`, which also fixes collinear, ill-conditioned XᵀX.
- **L1 (lasso)**: add \`λ‖w‖₁\`. Its pull \`λ·sign(w)\` has constant size, so small weights are driven exactly to 0: built-in feature selection. Geometrically, the L1 ball has corners on the axes.

Lasso has no closed form; coordinate descent uses soft-thresholding \`sign(z)·max(|z| − λ, 0)\`.

**Pitfall:** standardize features first, and don't penalize the bias.`,
    tags: ['regularization', 'regression'],
  },
  {
    id: 'fc-supervised-decision-tree',
    sectionId: 'supervised-learning',
    question: "How does a decision tree choose a split? Define Gini impurity, entropy and information gain.",
    answer: `For class proportions p_k in a node:

- Gini: \`1 − Σ p_k²\` (0 = pure; at most 0.5 for two classes).
- Entropy: \`−Σ p_k log₂ p_k\` (at most 1 bit for two classes).

Try every feature and threshold (midpoints between sorted unique values) and pick the split with the largest gain: \`impurity(parent) − Σ (n_child / n) · impurity(child)\`. The weighting matters, otherwise a tiny pure child wins by itself.

Regression trees use variance (MSE). Trees overfit easily: limit depth and leaf size, prune, or use an ensemble.`,
    tags: ['trees', 'classification'],
  },
  {
    id: 'fc-supervised-bagging-boosting',
    sectionId: 'supervised-learning',
    question: "Bagging vs boosting: how do they differ, and which error does each reduce?",
    answer: `- **Bagging** (Random Forest): train many deep trees **in parallel** on bootstrap samples (a random forest also samples a feature subset at every split), then average or vote. Reduces **variance**; adding trees doesn't overfit. Out-of-bag samples give a free validation estimate.
- **Boosting** (AdaBoost, gradient boosting, XGBoost, LightGBM): train shallow trees **sequentially**, each fixing the current ensemble's errors. Reduces **bias** (and variance), but can overfit with too many rounds: tune the learning rate and stop early.

On tabular data, a tuned gradient-boosting model is usually the strongest baseline.`,
    tags: ['ensembles', 'trees'],
  },
  {
    id: 'fc-supervised-gradient-boosting',
    sectionId: 'supervised-learning',
    question: "How does gradient boosting work, and why do the trees fit residuals?",
    answer: `Start from a constant prediction F₀ (e.g. the mean of y). For m = 1..M:

1. Pseudo-residuals: the negative gradient of the loss with respect to the current predictions, \`r_i = −∂L/∂F(x_i)\`.
2. Fit a small regression tree h_m to r.
3. Update \`F_m = F_{m−1} + η · h_m\` with shrinkage η ≈ 0.05–0.3.

For \`L = ½(y − F)²\` the negative gradient is exactly the residual \`y − F\`, hence "fitting residuals". For log-loss on logits it is \`y − p\`. Gradient boosting is gradient descent in function space.`,
    tags: ['ensembles', 'boosting'],
  },
  {
    id: 'fc-supervised-svm',
    sectionId: 'supervised-learning',
    question: "What does a linear SVM optimize, and what is the hinge loss?",
    answer: `It finds the maximum-margin hyperplane. Soft-margin primal, with labels y ∈ {−1, +1}:

\`min ½‖w‖² + C · Σ max(0, 1 − y_i (w·x_i + b))\`

The **hinge loss** \`max(0, 1 − y·f(x))\` is zero for points beyond the margin, so only points on or inside it (the support vectors) shape the solution. Large C → fewer violations, less regularization; small C → wider margin.

Train with subgradient descent (subgradient \`−y_i x_i\` for violators), or solve the dual, which also enables kernels.

**Pitfall:** labels must be ±1, not 0/1.`,
    tags: ['svm', 'classification'],
  },
  {
    id: 'fc-supervised-knn',
    sectionId: 'supervised-learning',
    question: "How does k-NN classify, and what are its main pitfalls?",
    answer: `Store the training set. For a query, find the k nearest points (usually Euclidean) and take a majority or distance-weighted vote. No training; brute-force prediction costs \`O(N·D)\` per query.

- **k**: small k → low bias, high variance (k = 1 memorizes noise); large k → smoother boundary. Choose by cross-validation; odd k avoids binary ties.
- **Scale features**, or the feature with the largest units dominates the distance.
- **Curse of dimensionality**: in high dimensions distances concentrate, and "nearest" stops meaning much.

Vectorize distances with \`‖a − b‖² = ‖a‖² − 2a·b + ‖b‖²\`.`,
    tags: ['knn', 'classification'],
  },
  {
    id: 'fc-supervised-naive-bayes',
    sectionId: 'supervised-learning',
    question: "What is the naive assumption in Naive Bayes, and how do you implement Gaussian Naive Bayes safely?",
    answer: `Bayes' rule: \`P(y | x) ∝ P(y) · P(x | y)\`. The naive assumption: features are conditionally independent given the class, so \`P(x | y) = Π_j P(x_j | y)\`.

Gaussian NB: per class, estimate the prior and each feature's mean and variance, then predict

\`argmax_y [ log P(y) + Σ_j log N(x_j; μ_yj, σ²_yj) ]\`

Work in **log space** (a product of many small densities underflows) and add a small variance floor (e.g. \`var + 1e-9\`) so a constant feature doesn't divide by zero.

The independence assumption is rarely true; the argmax is often still right, but the probabilities are poorly calibrated.`,
    tags: ['bayes', 'classification'],
  },
  // unsupervised-learning
  {
    id: 'fc-unsupervised-kmeans-algo',
    sectionId: 'unsupervised-learning',
    question: "State Lloyd's algorithm for k-means. Why does it always converge, and what is k-means++?",
    answer: `Objective (inertia): \`J = Σ_i ‖x_i − μ_c(i)‖²\`. Repeat until the assignments stop changing:

1. **Assign** each point to its nearest centroid.
2. **Update** each centroid to the mean of its points.

Neither step can increase J (the mean minimizes the sum of squared distances), and there are finitely many assignments, so it converges, but only to a **local** minimum.

**k-means++**: pick the first centroid uniformly at random, then each next one with probability ∝ D(x)², the squared distance to the nearest centroid chosen so far. This spreads the centroids out.

**Pitfall:** an empty cluster. Re-seed it instead of dividing by zero.`,
    tags: ['clustering', 'kmeans'],
  },
  {
    id: 'fc-unsupervised-kmeans-limitations',
    sectionId: 'unsupervised-learning',
    question: "What are the main limitations of k-means?",
    answer: `1. **K must be chosen** in advance (elbow on inertia, silhouette score).
2. **Roughly spherical, similar-size clusters**: points go to the nearest centroid, so the boundaries are straight lines (Voronoi cells). It fails on rings, moons and elongated clusters.
3. **Local optima**: results depend on initialization. Use k-means++ and several restarts, and keep the lowest inertia.
4. **Outliers** drag centroids, because the mean isn't robust (k-medoids is).
5. **Scale-sensitive**: standardize features first.

Alternatives: GMMs (soft, elliptical clusters), DBSCAN (arbitrary shapes, explicit noise).`,
    tags: ['clustering', 'limitations'],
  },
  {
    id: 'fc-unsupervised-pca',
    sectionId: 'unsupervised-learning',
    question: "What does PCA compute, and how do you implement it?",
    answer: `The orthogonal directions of maximum variance. Projecting onto the top k of them minimizes the squared reconstruction error.

1. Center: \`Xc = X − X.mean(axis=0)\` (also standardize if features have different units).
2. Covariance: \`C = Xcᵀ Xc / (n − 1)\`, shape \`(D, D)\`.
3. Eigendecompose with \`np.linalg.eigh\` (C is symmetric) and sort eigenvalues in descending order.
4. Eigenvectors are the components; \`λ_i / Σ λ\` is the explained-variance ratio. Project: \`Z = Xc @ V[:, :k]\`.

Equivalently, SVD \`Xc = U S Vᵀ\`: components are the rows of Vᵀ and \`λ = S² / (n − 1)\`; more numerically stable.

**Pitfalls:** forgetting to center; eigenvector signs are arbitrary.`,
    tags: ['dimensionality-reduction', 'pca'],
  },
  {
    id: 'fc-unsupervised-gmm',
    sectionId: 'unsupervised-learning',
    question: "How does a Gaussian mixture model fit with EM, and how does it relate to k-means?",
    answer: `Model: \`p(x) = Σ_k π_k · N(x; μ_k, Σ_k)\`. EM alternates:

- **E-step**: responsibilities \`γ_ik = π_k N(x_i; μ_k, Σ_k) / Σ_j π_j N(x_i; μ_j, Σ_j)\`.
- **M-step**: with \`N_k = Σ_i γ_ik\`, set \`π_k = N_k / N\`, \`μ_k = Σ_i γ_ik x_i / N_k\`, and Σ_k to the responsibility-weighted covariance.

The log-likelihood never decreases; EM converges to a local optimum. K-means is the limit with shared spherical covariances σ²I as σ → 0 (hard assignments).

**Pitfalls:** compute responsibilities in log space (log-sum-exp), and add εI to each Σ_k so a component that collapses onto one point doesn't send the likelihood to infinity.`,
    tags: ['clustering', 'em'],
  },
  {
    id: 'fc-unsupervised-dbscan',
    sectionId: 'unsupervised-learning',
    question: "How does DBSCAN cluster, and what are its parameters?",
    answer: `Parameters: a radius \`eps\` and \`min_samples\`.

- **Core point**: has at least min_samples points within eps (itself included, in scikit-learn).
- **Border point**: not core, but within eps of a core point.
- **Noise**: neither; labeled −1.

A cluster is everything density-reachable from a core point: grow it through neighboring core points and attach their border points.

Pros: no K to choose, arbitrary shapes, explicit outliers. Cons: a single global density, so clusters of different densities break it; eps is hard to set in high dimensions (use a k-distance plot). Scale features first.`,
    tags: ['clustering', 'density'],
  },
  // model-evaluation
  {
    id: 'fc-eval-precision-recall',
    sectionId: 'model-evaluation',
    question: "Define precision, recall and F1. When do you favor precision, and when recall?",
    answer: `- \`Precision = TP / (TP + FP)\`: of the predicted positives, how many are right.
- \`Recall = TP / (TP + FN)\`: of the actual positives, how many were found.
- \`F1 = 2PR / (P + R)\`: harmonic mean, dominated by the smaller of the two.

Favor **precision** when false positives are costly: spam filtering (losing real mail), actions taken automatically. Favor **recall** when misses are costly: cancer screening, flagging fraud for human review.

You move along the trade-off by changing the decision **threshold**. Define the 0/0 case explicitly (e.g. precision = 0 when nothing is predicted positive).`,
    tags: ['metrics', 'classification'],
  },
  {
    id: 'fc-eval-confusion-matrix',
    sectionId: 'model-evaluation',
    question: "How is a confusion matrix laid out, and what is the difference between macro and micro averaging?",
    answer: `\`C[i, j]\` counts samples whose **true** class is i and predicted class is j (scikit-learn: rows true, columns predicted). Build it with \`np.add.at(C, (y_true, y_pred), 1)\`.

Per class k: \`TP = C[k, k]\`, \`FP = column k sum − TP\`, \`FN = row k sum − TP\`.

- **Macro**: compute the metric per class, then take the unweighted mean. Every class counts equally, which exposes poor minority classes.
- **Micro**: pool TP, FP and FN over all classes first. For single-label multiclass problems, micro precision = micro recall = micro F1 = accuracy.
- **Weighted**: macro, weighted by each class's support.`,
    tags: ['metrics', 'classification'],
  },
  {
    id: 'fc-eval-roc-auc',
    sectionId: 'model-evaluation',
    question: "What does ROC-AUC measure, and what is its probabilistic interpretation?",
    answer: `The ROC curve plots TPR (recall) against FPR = \`FP / (FP + TN)\` as the threshold sweeps from high to low; AUC is the area under it.

**AUC = P(a random positive scores higher than a random negative)**, with ties counting ½. 0.5 = random ranking, 1.0 = perfect. It depends only on the ranking, so it is threshold-free and unchanged by any monotonic transform of the scores.

From ranks (Mann–Whitney U): \`AUC = (sum of positives' ranks − n₊(n₊ + 1)/2) / (n₊ · n₋)\`.

**Pitfall:** with heavy imbalance, FPR stays tiny even with many false positives, so ROC-AUC looks great. Also check PR-AUC (average precision).`,
    tags: ['metrics', 'roc'],
  },
  {
    id: 'fc-eval-imbalanced',
    sectionId: 'model-evaluation',
    question: "Your fraud model has 99.5% accuracy. Why might that be meaningless, and what should you report instead?",
    answer: `If 0.5% of transactions are fraudulent, predicting "not fraud" for everything scores 99.5% and catches nothing.

Report instead:

- Precision, recall and F1 for the positive class at a chosen threshold.
- PR-AUC (average precision): its random baseline is the positive rate (0.005), not 0.5.
- The confusion matrix.

Pick the threshold from business costs (e.g. the highest recall with precision ≥ 90%), not 0.5. Training-side fixes include class weights, resampling and focal loss, but never resample the test set.`,
    tags: ['metrics', 'imbalance'],
  },
  {
    id: 'fc-eval-crossval',
    sectionId: 'model-evaluation',
    question: "Why use k-fold cross-validation instead of a single train/test split, and how do you avoid leakage through it?",
    answer: `A single split gives a noisy estimate that depends on which samples landed in the test set. K-fold (K = 5 or 10): split into K folds, train on K − 1, evaluate on the held-out fold, rotate, and report mean ± std. Every sample is evaluated exactly once.

Doing it right:

- Fit preprocessing **inside** each fold (a Pipeline).
- Stratified folds for imbalanced classes; grouped folds when samples share a user or patient; forward-chaining splits for time series.
- Picking hyperparameters by CV score makes that score optimistic: keep a final test set, or use nested CV.`,
    tags: ['evaluation', 'cross-validation'],
  },
  {
    id: 'fc-eval-calibration',
    sectionId: 'model-evaluation',
    question: "What does it mean for a classifier to be calibrated, and how is ECE computed?",
    answer: `Calibrated: of all predictions made with confidence 0.8, about 80% are correct. Accuracy and AUC don't measure this.

**Expected Calibration Error**: sort predictions into M confidence bins (often 10 or 15 equal-width bins), then

\`ECE = Σ_m (|B_m| / n) · |acc(B_m) − conf(B_m)|\`

the support-weighted gap between accuracy and average confidence per bin. A reliability diagram plots the same thing.

Modern deep nets tend to be **over-confident**. Fix after training with **temperature scaling** (divide logits by a T fitted on validation data; accuracy is unchanged), Platt scaling or isotonic regression.`,
    tags: ['metrics', 'calibration'],
  },
  // deep-learning
  {
    id: 'fc-dl-perceptron',
    sectionId: 'deep-learning',
    question: "What is the perceptron update rule, and why can't a single perceptron learn XOR?",
    answer: `Prediction: \`ŷ = 1 if w·x + b > 0 else 0\`. For each sample: \`w ← w + lr·(y − ŷ)·x\` and \`b ← b + lr·(y − ŷ)\`, which changes nothing when the prediction is right.

The perceptron convergence theorem: if the data is **linearly separable**, it stops after finitely many mistakes; otherwise it never settles.

XOR's positives (0, 1), (1, 0) and negatives (0, 0), (1, 1) can't be separated by a single line. One hidden layer fixes it: OR and NAND units combined by an AND unit.`,
    tags: ['perceptron', 'linear-models'],
  },
  {
    id: 'fc-dl-why-nonlinearity',
    sectionId: 'deep-learning',
    question: "Why does a neural network need non-linear activations between layers?",
    answer: `Without them, the layers collapse into one: \`W2(W1x + b1) + b2 = (W2W1)x + (W2b1 + b2)\`, a single linear map however deep the network is. It could only learn linear decision boundaries (no XOR).

With a non-linearity, one hidden layer is a universal approximator: with enough units it can approximate any continuous function on a bounded domain. Depth lets many functions be represented with far fewer parameters.

**Pitfall:** no ReLU on the output layer. The last layer emits raw logits (or unbounded regression values) and the loss applies the softmax or sigmoid.`,
    tags: ['activation', 'theory'],
  },
  {
    id: 'fc-dl-relu-advantages',
    sectionId: 'deep-learning',
    question: "Why did ReLU become the default activation, and what is the dying-ReLU problem?",
    answer: `\`ReLU(x) = max(0, x)\`: derivative 1 for x > 0, 0 for x < 0.

- **No saturation for positive inputs**, so gradients don't shrink layer after layer as with sigmoid (whose derivative is at most 0.25).
- **Cheap**: a comparison, no exponentials.
- **Sparse**: negative pre-activations output exactly 0.

**Dying ReLU**: if a unit's pre-activation is negative for every input (after a large update, or a very negative bias), its gradient is always 0 and it never recovers. Mitigations: He initialization, a smaller learning rate, LeakyReLU, or GELU / SiLU (the transformer defaults).`,
    tags: ['activation', 'deep-learning'],
  },
  {
    id: 'fc-dl-backprop',
    sectionId: 'deep-learning',
    question: "Explain backpropagation in one sentence, and why it is efficient.",
    answer: `Backpropagation is reverse-mode automatic differentiation: it applies the chain rule from the loss back to every parameter, reusing the gradient that flows in from the layer above.

Each layer needs only the upstream gradient \`∂L/∂out\` and its own local derivatives: \`∂L/∂in = ∂L/∂out · ∂out/∂in\`, and \`∂L/∂W\` the same way. Every intermediate gradient is computed once and shared (dynamic programming), so a backward pass costs about 2× the forward pass, however many parameters there are.

The price is memory: forward activations must be kept for the backward pass.`,
    tags: ['backpropagation', 'chain-rule'],
  },
  // neural-networks
  {
    id: 'fc-nn-stable-softmax',
    sectionId: 'neural-networks',
    question: "How do you compute softmax and log-softmax without overflow?",
    answer: `Softmax doesn't change if you subtract a constant from every logit, so subtract the max:

\`p = exp(z − max(z)) / Σ exp(z − max(z))\`, along the class axis with \`keepdims=True\`.

The largest exponent is now e⁰ = 1, so nothing overflows, and the denominator is at least 1.

Log-softmax with log-sum-exp: \`log p_i = z_i − m − log Σ_j exp(z_j − m)\`, where \`m = max(z)\`.

**Pitfall:** \`np.exp(1000)\` is already \`inf\`, and \`np.log(softmax(z))\` gives \`-inf\` once a probability underflows to 0. Compute log-softmax directly.`,
    tags: ['softmax', 'numerical-stability'],
  },
  {
    id: 'fc-nn-softmax-ce-grad',
    sectionId: 'neural-networks',
    question: "What is the gradient of softmax followed by cross-entropy with respect to the logits?",
    answer: `For logits z, \`p = softmax(z)\` and one-hot target y:

\`L = −Σ_k y_k log p_k\`, and \`∂L/∂z = p − y\`.

For a batch of N with a mean loss: \`dZ = (P − Y) / N\`, shape \`(N, C)\`. With integer labels: \`dZ = P.copy(); dZ[np.arange(N), y] -= 1; dZ /= N\`.

Intuition: every class is pushed down by its predicted probability, and the true class is pushed up by 1. Sigmoid with binary cross-entropy has the same form, which is why these pairs are always fused.

**Pitfall:** forgetting the 1/N when the loss is a mean; a gradient check is then off by a factor of N.`,
    tags: ['backpropagation', 'loss'],
  },
  {
    id: 'fc-nn-vanishing-gradient',
    sectionId: 'neural-networks',
    question: "What causes vanishing and exploding gradients, and how do you fix them?",
    answer: `Backprop multiplies one Jacobian per layer (or per time step in an RNN). If their typical scale is below 1, gradients shrink exponentially toward the early layers (vanishing); above 1, they blow up (exploding).

Causes: saturating activations (sigmoid's derivative is at most 0.25), badly scaled initialization, very deep stacks or long sequences.

Fixes:

- ReLU-family activations with He or Xavier initialization.
- **Residual connections**: an identity path for the gradient.
- Normalization layers (BatchNorm, LayerNorm).
- Gated cells (LSTM, GRU) for sequences.
- **Gradient clipping** for exploding gradients.`,
    tags: ['training', 'gradients'],
  },
  {
    id: 'fc-nn-weight-init',
    sectionId: 'neural-networks',
    question: "Why can't you initialize all weights to zero, and what do Xavier and He initialization use?",
    answer: `If every unit in a layer starts with the same weights, they compute the same output, receive the same gradient and stay identical forever: symmetry is never broken. (With all-zero weights in a ReLU MLP, the hidden gradients are exactly 0.) Biases can start at zero.

Choose the variance so activations and gradients keep a stable scale through the layers:

- **Xavier / Glorot** (tanh, sigmoid): \`Var(W) = 2 / (n_in + n_out)\`; the uniform version is \`U(±√(6 / (n_in + n_out)))\`.
- **He / Kaiming** (ReLU): \`Var(W) = 2 / n_in\`. The 2 compensates for ReLU zeroing half its inputs.

Too large → activations explode or saturate; too small → they shrink toward 0 with depth.`,
    tags: ['initialization', 'training'],
  },
  {
    id: 'fc-nn-batchnorm',
    sectionId: 'neural-networks',
    question: "How does batch normalization work at training time and at inference time?",
    answer: `Per feature (per channel in a CNN), over the batch:

\`x̂ = (x − μ_B) / √(σ²_B + ε)\`, then \`y = γ·x̂ + β\`, with batch mean μ_B, batch variance σ²_B and learnable γ, β.

Training also updates running averages: \`running = (1 − m)·running + m·batch_stat\` (PyTorch m = 0.1). **Inference** uses the running statistics, so the output no longer depends on the rest of the batch.

It allows larger learning rates and reduces sensitivity to initialization. The original "internal covariate shift" explanation is disputed; later work credits a smoother loss landscape. Batch noise also regularizes a little.

**Pitfalls:** tiny batches give noisy statistics; forgetting \`model.eval()\`.`,
    tags: ['normalization', 'training'],
  },
  {
    id: 'fc-nn-dropout',
    sectionId: 'neural-networks',
    question: "How does inverted dropout work, and what changes at inference time?",
    answer: `Training: zero each activation with probability p and scale the survivors by \`1/(1 − p)\`:

\`mask = (rng.random(x.shape) >= p) / (1 − p)\`, then \`out = x * mask\`.

The scaling keeps \`E[out] = x\`, so at inference dropout is simply the identity, with no rescaling. Backward: \`dx = dout * mask\`, reusing the same mask.

Why it works: units can't rely on specific partners (less co-adaptation), and the network behaves like an average of many thinned sub-networks.

**Pitfalls:** in PyTorch, p is the **drop** probability (\`nn.Dropout(p=0.1)\`), while some older code uses the keep probability; forgetting \`model.eval()\` keeps dropping at test time.`,
    tags: ['regularization', 'dropout'],
  },
  {
    id: 'fc-nn-masked-loss',
    sectionId: 'neural-networks',
    question: "How do you average a token-level loss correctly when the batch contains padding?",
    answer: `Compute the per-token loss of shape \`(B, T)\`, multiply by a mask (1 for real tokens, 0 for padding), and divide by the **number of real tokens**:

\`loss = (token_loss * mask).sum() / mask.sum()\`

Not \`.mean()\`, which divides by B·T, so padding dilutes the loss and its scale depends on how much padding the batch has. In PyTorch: \`F.cross_entropy(logits.view(-1, V), targets.view(-1), ignore_index=pad_id)\`.

**Pitfalls:** mask padding out of label smoothing and accuracy too, and guard against \`mask.sum() == 0\`.`,
    tags: ['loss', 'sequences'],
  },
  // optimization
  {
    id: 'fc-opt-momentum',
    sectionId: 'optimization',
    question: "How does SGD with momentum work, and why does it help?",
    answer: `Keep a velocity, an exponentially decaying sum of past gradients:

\`v = μ·v + g\`, then \`θ -= lr · v\` (PyTorch's form, μ ≈ 0.9).

Where gradients agree, steps grow up to \`1/(1 − μ)\` times (10× for μ = 0.9); where they flip sign, as across a narrow ravine, they cancel and the oscillation is damped.

**Nesterov**: use the look-ahead gradient; in PyTorch's form, \`θ -= lr · (g + μ·v)\` after updating v.

**Pitfall:** the EMA convention \`v = μ·v + (1 − μ)·g\` gives steps \`1/(1 − μ)\` times smaller for the same lr. Know which one you are matching.`,
    tags: ['optimization', 'sgd'],
  },
  {
    id: 'fc-opt-adam',
    sectionId: 'optimization',
    question: "Write the Adam update, including bias correction. Why is bias correction needed?",
    answer: `At step t = 1, 2, … with gradient g:

- \`m = β1·m + (1 − β1)·g\`
- \`v = β2·v + (1 − β2)·g²\`
- \`m̂ = m / (1 − β1^t)\`, \`v̂ = v / (1 − β2^t)\`
- \`θ -= lr · m̂ / (√v̂ + ε)\`

Defaults: β1 = 0.9, β2 = 0.999, ε = 1e-8. m and v start at 0, so early estimates are biased toward 0, and v much more so than m. Without correction the first step would be about 3.2× lr (\`0.1 / √0.001\`); with it, the first step is exactly lr in size.

Each parameter moves about lr per step, whatever its gradient scale. Memory: two extra tensors per parameter.`,
    tags: ['optimization', 'adam'],
  },
  {
    id: 'fc-opt-adamw',
    sectionId: 'optimization',
    question: "What is the difference between Adam with L2 regularization and AdamW?",
    answer: `- **Adam + L2**: adds \`λθ\` to the gradient. That term then goes through Adam's per-parameter division by \`√v̂\`, so weights with large gradients are barely regularized; the decay strength is uneven.
- **AdamW** (decoupled): decays the weights directly, outside the adaptive step: \`θ -= lr · (m̂ / (√v̂ + ε) + λθ)\`.

For plain SGD the two are equivalent (up to rescaling λ); for Adam they are not. AdamW is the default for transformers (λ ≈ 0.01–0.1), usually **excluding** biases and normalization weights from decay.`,
    tags: ['optimization', 'regularization'],
  },
  {
    id: 'fc-opt-lr-schedule',
    sectionId: 'optimization',
    question: "Why do transformer runs use warmup followed by cosine decay? Write the schedule.",
    answer: `For step t, warmup length W and total steps T:

- Warmup, t < W: \`lr = max_lr · t / W\`
- Cosine decay: \`lr = min_lr + ½(max_lr − min_lr)(1 + cos(π·(t − W)/(T − W)))\`

**Warmup**: at the start the weights are random and Adam's second-moment estimates are noisy, so full-size steps can diverge (post-norm transformers especially).

**Decay**: large steps explore; small steps at the end settle into a minimum and lower the noise floor of SGD.

**Pitfalls:** off-by-one at the boundaries, and calling \`scheduler.step()\` once per epoch for a schedule defined per step.`,
    tags: ['optimization', 'learning-rate'],
  },
  {
    id: 'fc-opt-grad-clipping',
    sectionId: 'optimization',
    question: "How does gradient clipping by global norm work, and why clip globally rather than per tensor?",
    answer: `Compute one norm over **all** parameter gradients, \`total = √(Σ_p ‖g_p‖²)\`. If \`total > max_norm\`, multiply every gradient by \`max_norm / (total + 1e-6)\`.

Example: g1 = [3, 4], g2 = [12], max_norm = 1. total = 13, so g1 → [0.231, 0.308] and g2 → [0.923].

Global clipping caps the update's length but keeps its **direction**; clipping each tensor separately changes the direction. Typical max_norm = 1.0 for transformers, applied after \`backward()\` and, in mixed precision, after unscaling.

It tames exploding gradients and loss spikes; it does nothing for vanishing gradients.`,
    tags: ['optimization', 'stability'],
  },
  {
    id: 'fc-opt-mixed-precision',
    sectionId: 'optimization',
    question: "fp16 vs bf16 in mixed-precision training: why does fp16 need loss scaling while bf16 usually doesn't?",
    answer: `- **fp16**: 5 exponent bits, 10 mantissa bits. Max ≈ 65,504, and values below ≈ 6e-8 flush to 0, so small gradients underflow.
- **bf16**: 8 exponent bits (the same range as fp32) and 7 mantissa bits: less precise, but it rarely underflows or overflows.

**Dynamic loss scaling** (fp16): multiply the loss by S (e.g. 2¹⁶) so the gradients are representable, and unscale before clipping and stepping. If any gradient is inf/NaN, skip the step and halve S; after N clean steps (e.g. 2,000), double it.

Either way, keep fp32 master weights and optimizer state, and run reductions such as softmax and norms in fp32.`,
    tags: ['optimization', 'mixed-precision'],
  },
  {
    id: 'fc-opt-grad-accumulation',
    sectionId: 'optimization',
    question: "How does gradient accumulation simulate a larger batch, and what are its pitfalls?",
    answer: `Run k micro-batches, calling \`backward()\` on each, and step once:

- every micro-batch: \`(loss_fn(model(x), y) / k).backward()\`
- every k-th micro-batch: \`optimizer.step()\`, then \`optimizer.zero_grad()\`

Gradients add up in \`.grad\`, so the effective batch is \`k × micro_batch\` for the memory of one micro-batch.

**Pitfalls:**

- Forgetting \`/ k\`: the gradient, and so the effective lr, is k× too large.
- BatchNorm still only sees one micro-batch.
- Per-step schedulers must count optimizer steps, not micro-batches.`,
    tags: ['optimization', 'memory'],
  },
  {
    id: 'fc-opt-memory',
    sectionId: 'optimization',
    question: "Roughly how much GPU memory does training a 7B-parameter model with Adam in mixed precision need, before activations?",
    answer: `About **16 bytes per parameter** with the standard recipe:

- bf16 weights: 2 B
- bf16 gradients: 2 B
- fp32 master weights: 4 B
- Adam m and v in fp32: 4 + 4 B

7B × 16 B ≈ **112 GB** plus activations, more than one 80 GB GPU. Hence ZeRO / FSDP (sharding optimizer state, gradients and weights across GPUs), activation checkpointing, and LoRA or 8-bit optimizers for fine-tuning.

Inference needs only the weights, 7B × 2 B = 14 GB in bf16, plus the KV cache.`,
    tags: ['optimization', 'memory'],
  },
  {
    id: 'fc-opt-checkpointing',
    sectionId: 'optimization',
    question: "What does gradient (activation) checkpointing trade, and how does it work?",
    answer: `It trades compute for memory. Normally every layer's activations are kept for the backward pass. With checkpointing, only some are stored (e.g. each block's input); during backward, each segment's forward pass is **re-run** to recover the activations it needs.

Cost: about one extra forward pass, roughly 30% more compute per training step (backward ≈ 2× forward). Saving: activation memory drops from O(n) to about O(√n) for n layers checkpointed in √n segments.

**Pitfall:** recomputation must reproduce the original forward exactly; dropout needs the same RNG state (PyTorch saves and restores it by default).`,
    tags: ['optimization', 'memory'],
  },
  // cnn
  {
    id: 'fc-cnn-why-convolutions',
    sectionId: 'cnn',
    question: "Why use convolutions instead of fully-connected layers for images?",
    answer: `- **Local connectivity**: each output looks at a small neighborhood, matching the local structure of images.
- **Weight sharing**: the same kernel slides over every position, so the parameter count doesn't grow with image size.
- **Translation equivariance**: shifting the input shifts the feature map (pooling adds some invariance).
- **Hierarchy**: stacked layers grow the receptive field, from edges to textures to parts to objects.

Numbers: a 224×224×3 input fully connected to 1,000 units needs 150.5M weights. A conv layer with 64 filters of size 3×3×3 needs 1,728 weights (+64 biases).`,
    tags: ['cnn', 'architecture'],
  },
  {
    id: 'fc-cnn-output-size',
    sectionId: 'cnn',
    question: "What is the output size of a convolution or pooling layer, and how many parameters does a conv layer have?",
    answer: `\`out = floor((W − K + 2P) / S) + 1\`

W = input size, K = kernel size, P = padding per side, S = stride. With dilation D, replace K by \`D·(K − 1) + 1\`.

- "Same" size (S = 1, odd K): \`P = (K − 1) / 2\`.
- No padding, S = 1: \`W − K + 1\`.
- ResNet stem: W = 224, K = 7, S = 2, P = 3 → floor(223 / 2) + 1 = 112.

Output channels = number of filters. Parameters: \`K·K·C_in·C_out + C_out\` (biases).`,
    tags: ['cnn', 'dimensions'],
  },
  {
    id: 'fc-cnn-receptive-field',
    sectionId: 'cnn',
    question: "What is a receptive field, and why do VGG-style networks stack 3×3 convolutions?",
    answer: `The receptive field is the input region that can influence one output unit. Each stride-1 layer adds \`K − 1\`; in general a layer adds \`(K − 1) × (product of all earlier strides)\`.

Two stacked 3×3 convs see 5×5; three see 7×7. Versus one 7×7 conv with C channels in and out: \`3 · 9C² = 27C²\` weights instead of \`49C²\`, plus two extra non-linearities. Same receptive field, fewer parameters, more expressive.

Strides, pooling and dilation grow the receptive field fastest. The *effective* receptive field is smaller than the theoretical one, because central pixels dominate.`,
    tags: ['cnn', 'architecture'],
  },
  {
    id: 'fc-cnn-pooling',
    sectionId: 'cnn',
    question: "How does max pooling work in the forward and backward pass?",
    answer: `Forward: slide a K×K window with stride S (usually 2×2, stride 2) over each channel separately and output the max. No parameters; a 2×2 / stride-2 pool halves H and W.

Backward: each window's upstream gradient goes **only to the position of its max**; every other position gets 0. Save the argmax (or a mask) in the forward pass, and accumulate with \`+=\` when windows overlap.

Average pooling spreads the gradient evenly instead (\`dout / K²\`). Global average pooling, \`(N, C, H, W)\` → \`(N, C)\`, replaced large fully-connected heads in modern CNNs.

**Pitfall:** with ties, route the gradient to one position, not to every tied one.`,
    tags: ['cnn', 'pooling'],
  },
  {
    id: 'fc-cnn-1x1-depthwise',
    sectionId: 'cnn',
    question: "What do 1×1 convolutions and depthwise-separable convolutions do, and how many parameters do they save?",
    answer: `A **1×1 conv** mixes channels at each pixel: a per-pixel linear layer from C_in to C_out. Used for bottlenecks (ResNet) and cheap channel projections.

**Depthwise separable** (MobileNet) = a depthwise K×K conv (one filter per input channel, \`groups=C_in\`) followed by a pointwise 1×1 conv.

Parameters: \`K²·C_in + C_in·C_out\` instead of \`K²·C_in·C_out\`.

Example, 3×3 with 256 → 256 channels: 2,304 + 65,536 = 67,840 vs 589,824, about 8.7× fewer (ratio ≈ \`1/C_out + 1/K²\`). Multiply-adds shrink by the same factor.`,
    tags: ['cnn', 'efficiency'],
  },
  {
    id: 'fc-cnn-resnet-block',
    sectionId: 'cnn',
    question: "What is in a ResNet basic block, and what happens when x and F(x) have different shapes?",
    answer: `Basic block: \`conv3×3 → BN → ReLU → conv3×3 → BN\`, then \`out = ReLU(F(x) + shortcut(x))\`.

The shortcut is the identity when the shapes match. When the block downsamples (stride 2) or changes the channel count, it uses a **projection**: a 1×1 conv with the same stride, plus BN, so both branches are \`(N, C_out, H/2, W/2)\`.

The bottleneck block (ResNet-50 and deeper) uses 1×1 reduce → 3×3 → 1×1 expand (×4), which is cheaper for wide layers.

Tip: initializing each block's last BN γ to 0 makes every block start as the identity, which stabilizes very deep ResNets.`,
    tags: ['cnn', 'architecture'],
  },
  {
    id: 'fc-cnn-iou',
    sectionId: 'cnn',
    question: "Define IoU. How is it used in object detection?",
    answer: `\`IoU = area(A ∩ B) / area(A ∪ B)\`, where \`area(A ∪ B) = area(A) + area(B) − area(A ∩ B)\`. Ranges from 0 to 1 and is scale-invariant.

For corner boxes (x1, y1, x2, y2), the intersection width is \`max(0, min(x2a, x2b) − max(x1a, x1b))\`, and the same for the height.

- **Evaluation**: a detection is a true positive if its IoU ≥ a threshold (0.5 for PASCAL VOC; COCO mAP averages thresholds 0.5, 0.55, …, 0.95).
- **NMS**: drops boxes that overlap a higher-scoring box too much.
- **Training**: matches anchors or predictions to ground truth; IoU-based losses (GIoU).

**Pitfall:** without \`max(0, ·)\`, two disjoint boxes get a positive "intersection" (negative × negative).`,
    tags: ['detection', 'metrics'],
  },
  {
    id: 'fc-cnn-nms',
    sectionId: 'cnn',
    question: "Describe non-maximum suppression (NMS).",
    answer: `NMS removes duplicate detections of the same object:

1. Sort boxes by score, highest first (optionally drop those below a score threshold).
2. Keep the highest-scoring box.
3. Remove every remaining box whose IoU with it exceeds a threshold (e.g. 0.5).
4. Repeat with the boxes that are left.

Run it per class, so a dog box doesn't suppress an overlapping person box. Worst case O(n²).

**Pitfalls:** a threshold too low merges distinct nearby objects (crowds); too high leaves duplicates. Soft-NMS decays scores instead of deleting boxes; DETR-style detectors avoid NMS altogether.`,
    tags: ['detection', 'nms'],
  },
  {
    id: 'fc-cnn-focal-loss',
    sectionId: 'cnn',
    question: "What problem does focal loss solve, and what is its formula?",
    answer: `In dense detection, almost all anchors are easy background; their many small losses swamp the few hard positives.

\`FL = −α_t · (1 − p_t)^γ · log(p_t)\`

p_t is the predicted probability of the true class; α_t = α for positives and 1 − α for negatives (RetinaNet: γ = 2, α = 0.25).

The factor \`(1 − p_t)^γ\` down-weights well-classified examples: at p_t = 0.9 it is 0.01 (100× less than cross-entropy), at p_t = 0.1 it is 0.81. γ = 0 gives α-weighted cross-entropy.

**Pitfall:** compute log(p_t) from logits, stably.`,
    tags: ['detection', 'loss'],
  },
  {
    id: 'fc-cnn-smooth-l1',
    sectionId: 'cnn',
    question: "Why is Smooth L1 (Huber) loss used for bounding-box regression?",
    answer: `With x = prediction − target and threshold β:

\`L(x) = 0.5·x² / β\` if \`|x| < β\`, otherwise \`|x| − 0.5·β\`.

- Near zero it is quadratic: smooth, with a gradient that shrinks with the error, so it converges precisely.
- For large errors it is linear: the gradient magnitude is capped at 1, so outliers and early bad predictions can't blow up training as they do with L2.

The two pieces meet with equal value and slope at |x| = β. Huber loss with δ is β × Smooth L1 with β = δ: same shape, different scale.`,
    tags: ['detection', 'loss'],
  },
  {
    id: 'fc-cnn-seg-metrics',
    sectionId: 'cnn',
    question: "How are IoU (Jaccard) and Dice computed for segmentation masks, and how are they related?",
    answer: `For a predicted mask A and ground truth B, per class:

- IoU = \`|A ∩ B| / |A ∪ B|\` = TP / (TP + FP + FN)
- Dice = \`2|A ∩ B| / (|A| + |B|)\` = 2TP / (2TP + FP + FN)

\`Dice = 2·IoU / (1 + IoU)\`, so Dice ≥ IoU (IoU 0.5 ↔ Dice 0.667) and both rank models the same way. mIoU averages IoU over classes.

Pixel accuracy is dominated by the background; soft Dice loss (\`1 − Dice\` on probabilities) copes with heavy foreground/background imbalance.

**Pitfall:** define the case where both masks are empty explicitly (usually a score of 1).`,
    tags: ['segmentation', 'metrics'],
  },
  // sequence-models
  {
    id: 'fc-seq-rnn-bptt',
    sectionId: 'sequence-models',
    question: "How does a vanilla RNN work, and why does it struggle with long-range dependencies?",
    answer: `\`h_t = tanh(x_t W_xh + h_{t−1} W_hh + b)\`, with the same weights at every step. Shapes: x_t \`(B, D)\`, h_t \`(B, H)\`.

Backprop through time unrolls the sequence. The gradient from step t back to step k is a product of t − k Jacobians, each \`diag(1 − h_i²) · W_hhᵀ\`. Its size scales roughly like the largest singular value of W_hh (times tanh' ≤ 1) to the power t − k: it vanishes or explodes exponentially.

Fixes: gradient clipping (exploding), gated cells or attention (vanishing), truncated BPTT for long sequences.`,
    tags: ['rnn', 'gradients'],
  },
  {
    id: 'fc-seq-lstm',
    sectionId: 'sequence-models',
    question: "What are the LSTM gates and equations, and why does the cell state help gradients flow?",
    answer: `From \`[h_{t−1}, x_t]\`, compute four pre-activations with one matmul to 4H outputs, then:

- forget \`f = σ(·)\`, input \`i = σ(·)\`, output \`o = σ(·)\`, candidate \`g = tanh(·)\`
- \`c_t = f ⊙ c_{t−1} + i ⊙ g\`
- \`h_t = o ⊙ tanh(c_t)\`

The cell state is updated **additively**: \`∂c_t/∂c_{t−1} = f\`, elementwise, not a repeated matrix product. While the forget gate stays near 1, gradients survive across many steps.

Parameters: \`4·H·(D + H + 1)\` (one bias per gate). Common trick: initialize the forget-gate bias to 1.`,
    tags: ['rnn', 'lstm'],
  },
  {
    id: 'fc-seq-gru',
    sectionId: 'sequence-models',
    question: "How does a GRU differ from an LSTM?",
    answer: `A GRU merges the cell and hidden state and uses two gates:

- update \`z = σ(x_t W_z + h_{t−1} U_z + b_z)\`, reset \`r = σ(x_t W_r + h_{t−1} U_r + b_r)\`
- candidate \`h̃ = tanh(x_t W_h + (r ⊙ h_{t−1}) U_h + b_h)\`
- \`h_t = (1 − z) ⊙ h_{t−1} + z ⊙ h̃\`

Three weight blocks instead of four: about 25% fewer parameters and faster, with similar accuracy on many tasks. Interpolating between h_{t−1} and h̃ plays the role of the LSTM's additive cell path.

**Pitfall:** conventions differ. PyTorch swaps the roles of z and 1 − z and applies r after the hidden matmul, so match the reference exactly.`,
    tags: ['rnn', 'gru'],
  },
  {
    id: 'fc-seq-rnn-vs-transformer',
    sectionId: 'sequence-models',
    question: "RNNs vs transformers for sequence modeling: what are the trade-offs?",
    answer: `- **Parallelism**: an RNN is sequential in time (step t needs h_{t−1}); a transformer processes every position at once in training.
- **Path length**: information between distant tokens passes through O(n) steps in an RNN and O(1) in self-attention, so long-range dependencies are easier to learn.
- **Cost**: attention is O(n²·d) time and O(n²) memory per layer; an RNN is O(n·d²).
- **Inference**: an RNN carries a fixed-size state; a transformer needs a KV cache that grows with the context.

This trade-off motivates linear attention and state-space models (e.g. Mamba): parallel training, constant-size state when decoding.`,
    tags: ['rnn', 'transformers'],
  },
  // transformers
  {
    id: 'fc-transformer-scaling',
    sectionId: 'transformers',
    question: "Why are attention scores divided by √d_k?",
    answer: `If the components of q and k are independent with mean 0 and variance 1, then \`q·k = Σ_{i=1..d_k} q_i k_i\` has mean 0 and variance d_k. With d_k = 64, the scores have a standard deviation of 8.

Large scores push softmax toward one-hot, where its gradients are nearly zero, and training stalls. Dividing by √d_k restores unit variance whatever the head size:

\`Attention(Q, K, V) = softmax(QKᵀ / √d_k) V\`

**Pitfall:** scale by the **per-head** dimension \`d_k = d_model / h\`, not by d_model.`,
    tags: ['attention', 'transformers'],
  },
  {
    id: 'fc-transformer-multihead',
    sectionId: 'transformers',
    question: "Why use multi-head attention instead of one head with the same total dimension?",
    answer: `A single head computes one softmax per query, so each output is one weighted average: it can't attend sharply to two different positions for two different reasons. With h heads of size \`d_k = d_model / h\`, each head projects into its own subspace with its own attention pattern; the head outputs are concatenated and mixed by W_O.

Shapes: \`(B, T, d_model)\` → split → \`(B, h, T, d_k)\` → attention → merge → \`(B, T, d_model)\`.

The cost and the parameters (\`4·d_model²\` for W_Q, W_K, W_V, W_O) match a single full-width head. Heads do specialize (previous-token heads, induction heads), and many can be pruned after training.`,
    tags: ['attention', 'multi-head'],
  },
  {
    id: 'fc-transformer-causal-mask',
    sectionId: 'transformers',
    question: "How is causal masking implemented, and where in the computation must the mask be applied?",
    answer: `Position i may attend only to positions j ≤ i. Set the scores above the diagonal to −∞ **before** the softmax:

- \`mask = np.triu(np.ones((T, T), dtype=bool), k=1)\`
- \`scores = np.where(mask, -np.inf, scores)\`

Softmax then gives future tokens exactly 0 weight, and each row still sums to 1.

**Pitfalls:**

- Masking *after* the softmax (zeroing probabilities) breaks the normalization.
- With padding masks too, a fully masked row becomes NaN under −∞; use a large finite negative value (e.g. −1e9 or the dtype's minimum).
- Decoding one token at a time with a KV cache needs no causal mask.`,
    tags: ['attention', 'masking'],
  },
  {
    id: 'fc-transformer-layernorm',
    sectionId: 'transformers',
    question: "Write the LayerNorm formula as used in a transformer. Which axis does it normalize, and why not BatchNorm?",
    answer: `For each token vector x of size d_model (the last axis):

\`μ = mean(x)\`, \`σ² = mean((x − μ)²)\`, \`y = γ ⊙ (x − μ) / √(σ² + ε) + β\`

γ and β have shape \`(d_model,)\`, ε ≈ 1e-5. Input and output are \`(batch, seq_len, d_model)\`; statistics use \`axis=-1, keepdims=True\`.

Unlike BatchNorm, it never looks at other samples or positions: it works with batch size 1, variable lengths and padding, and behaves identically in training and inference.

**Pitfall:** using the unbiased variance (ddof = 1), or normalizing over the batch or sequence axis.`,
    tags: ['transformers', 'normalization'],
  },
  {
    id: 'fc-transformer-prenorm',
    sectionId: 'transformers',
    question: "Pre-norm vs post-norm transformer blocks: what is the difference, and which do modern LLMs use?",
    answer: `- **Post-norm** (original 2017 Transformer): \`x = LN(x + Sublayer(x))\`.
- **Pre-norm** (GPT-2 onward, LLaMA): \`x = x + Sublayer(LN(x))\`, plus a final norm before the output head.

In pre-norm, the residual stream is an unobstructed identity path from input to output, so gradients reach early layers intact: deep stacks train stably and are less sensitive to warmup and learning rate. Post-norm can reach slightly better quality when it trains, but needs careful warmup and tends to diverge as depth grows.

Modern LLMs use pre-norm with **RMSNorm**.`,
    tags: ['transformers', 'architecture'],
  },
  {
    id: 'fc-transformer-positional',
    sectionId: 'transformers',
    question: "Why do transformers need positional information, and how do sinusoidal encodings work?",
    answer: `Without positions, self-attention is **permutation-equivariant**: shuffling the input tokens just shuffles the outputs, so "dog bites man" and "man bites dog" get the same set of token representations.

Sinusoidal encoding, added to the embeddings, for dimension pairs i = 0 … d/2 − 1:

\`PE(pos, 2i) = sin(pos / 10000^(2i/d))\`, \`PE(pos, 2i+1) = cos(pos / 10000^(2i/d))\`

Wavelengths range from 2π to 10000·2π. For a fixed offset k, PE(pos + k) is a rotation (a linear function) of PE(pos), which makes relative positions easy to pick up.

BERT and GPT-2 learned absolute position embeddings instead; modern LLMs use **RoPE**.`,
    tags: ['transformers', 'positional-encoding'],
  },
  {
    id: 'fc-transformer-rope',
    sectionId: 'transformers',
    question: "How does RoPE (rotary position embedding) work, and why is it popular?",
    answer: `After projecting Q and K (per head), rotate each pair of dimensions by an angle \`pos · θ_i\`, with \`θ_i = 10000^(−2i/d_k)\`:

- \`x'_{2i} = x_{2i} cos(pos·θ_i) − x_{2i+1} sin(pos·θ_i)\`
- \`x'_{2i+1} = x_{2i} sin(pos·θ_i) + x_{2i+1} cos(pos·θ_i)\`

Rotations compose, so \`q_m · k_n\` depends only on the content and the **relative** offset m − n. No parameters, V is untouched, and it fits KV caching: each new key is rotated once by its position.

**Pitfall:** some implementations (GPT-NeoX, Hugging Face LLaMA) pair dimension i with i + d/2 ("rotate half") instead of adjacent dimensions. Pretrained weights are tied to their convention.`,
    tags: ['transformers', 'positional-encoding'],
  },
  {
    id: 'fc-transformer-gqa',
    sectionId: 'transformers',
    question: "What are multi-query and grouped-query attention, and what do they save?",
    answer: `Standard multi-head attention has h query heads and h key/value heads. **GQA** uses g < h KV heads, each shared by a group of \`h / g\` query heads; K and V are repeated along the head axis before attention. **MQA** is the case g = 1.

The KV cache shrinks by \`h / g\`. Llama 2 70B: 64 query heads and 8 KV heads, so an 8× smaller cache and far less memory traffic per decoded token (decoding is memory-bandwidth-bound). Quality stays close to full multi-head attention; MQA loses more.

**Pitfall:** query head j must use KV head \`j // (h / g)\`, so repeat with \`np.repeat\` along the head axis, not \`np.tile\`.`,
    tags: ['attention', 'inference'],
  },
  {
    id: 'fc-transformer-complexity',
    sectionId: 'transformers',
    question: "What is the cost of self-attention, and where does a transformer's compute actually go?",
    answer: `Per layer, for sequence length n and width d:

- Attention scores and the weighted sum: O(n²·d) time, plus an n×n score matrix per head in memory.
- Q/K/V/O projections and the MLP: O(n·d²) time.

Per token, the projections and MLP cost about 24·d² FLOPs and attention about 4·n·d, so attention dominates only once n exceeds about 6·d (≈ 4.6K tokens for d = 768).

Parameters per block ≈ \`12·d²\`: 4d² for attention and 8d² for an MLP with \`d_ff = 4d\` (biases and norms ignored). GPT-2 small: 12 × 12 × 768² ≈ 85M, plus 38.6M of token embeddings ≈ 124M.`,
    tags: ['transformers', 'complexity'],
  },
  {
    id: 'fc-transformer-sliding-window',
    sectionId: 'transformers',
    question: "How does sliding-window attention work, and how far can information travel?",
    answer: `Each query at position i attends only to keys in \`[i − W + 1, i]\`. The cost drops from O(n²) to O(n·W), and the KV cache becomes a rolling buffer of size W.

Information still travels further than W: through L stacked layers, a token can be influenced by tokens up to about \`L × W\` positions back (Mistral 7B: W = 4,096 and 32 layers, about 131K tokens in theory).

It is often mixed with full-attention layers or global tokens (Longformer; Gemma 2 alternates local and global layers).

**Pitfall:** off-by-one in the window. With W = 3, position 5 sees positions 3, 4 and 5.`,
    tags: ['attention', 'efficiency'],
  },
  {
    id: 'fc-transformer-bpe',
    sectionId: 'transformers',
    question: "How does byte-pair encoding (BPE) tokenization work?",
    answer: `**Training**: start from characters (or raw bytes, in byte-level BPE as in GPT-2), count adjacent symbol pairs over the corpus, merge the most frequent pair into a new token, and repeat until the vocabulary reaches its target size (tens to hundreds of thousands). The ordered merge list *is* the tokenizer.

**Encoding**: split the text into base symbols, then repeatedly apply the applicable merge with the **lowest rank** (learned earliest), not the most frequent pair in this text.

Byte-level BPE never produces unknown tokens. Consequences interviewers ask about: digits and words split unpredictably, which hurts arithmetic and spelling; a leading space is usually part of the token (" the" ≠ "the").`,
    tags: ['transformers', 'tokenization'],
  },
  {
    id: 'fc-transformer-attention-backward',
    sectionId: 'transformers',
    question: "What is the backward pass of attention, including the softmax?",
    answer: `Forward: \`S = QKᵀ / √d_k\`, \`P = softmax(S)\` per row, \`O = PV\`. Given dO:

- \`dV = Pᵀ dO\`, \`dP = dO Vᵀ\`
- Softmax, per row: \`dS = P ⊙ (dP − rowsum(dP ⊙ P))\`
- \`dQ = dS K / √d_k\`, \`dK = dSᵀ Q / √d_k\`

The rowsum term comes from the softmax Jacobian \`diag(p) − ppᵀ\`. FlashAttention recomputes P block by block in the backward pass instead of storing the n×n matrix, and gets the rowsum term as \`rowsum(dO ⊙ O)\`, which is equal.`,
    tags: ['attention', 'backpropagation'],
  },
  // llm-generation
  {
    id: 'fc-llm-temperature',
    sectionId: 'llm-generation',
    question: "How does temperature change the sampling distribution? What happens as T → 0 and for large T?",
    answer: `\`p = softmax(logits / T)\`

- **T → 0**: the gaps between logits are magnified and p becomes one-hot on the argmax, i.e. greedy decoding. Implement T = 0 as argmax rather than dividing by zero.
- **T = 1**: the model's own distribution.
- **T > 1**: gaps shrink; as T → ∞, p approaches uniform. More diverse, more mistakes.

Example: logits [2, 1, 0.1] give p ≈ [0.66, 0.24, 0.10] at T = 1, and [0.86, 0.12, 0.02] at T = 0.5.

Temperature never changes the ranking of tokens. It is usually applied before top-k / top-p filtering.`,
    tags: ['llm', 'sampling'],
  },
  {
    id: 'fc-llm-topk-topp',
    sectionId: 'llm-generation',
    question: "Compare top-k and top-p (nucleus) sampling.",
    answer: `- **Top-k**: keep the k most likely tokens, renormalize, sample. The count is fixed whatever the distribution looks like: when it is peaked, junk tokens get in; when it is flat, reasonable tokens are cut.
- **Top-p**: sort descending and keep the smallest prefix whose cumulative probability ≥ p (always at least one token), renormalize, sample. Adaptive: few tokens when the model is confident, many when it is unsure. p = 0.9–0.95 is common.

They are often combined: temperature, then top-k, then top-p.

**Pitfalls:** include the token that crosses p; handle ties at the k-th value; renormalize after filtering.`,
    tags: ['llm', 'sampling'],
  },
  {
    id: 'fc-llm-repetition-penalty',
    sectionId: 'llm-generation',
    question: "How does the CTRL-style repetition penalty change the logits, and why are positive and negative logits treated differently?",
    answer: `For every **distinct** token already generated, with penalty > 1:

- logit > 0: \`logit / penalty\`
- logit ≤ 0: \`logit × penalty\`

Both branches lower the logit. Dividing a negative logit would move it toward 0, i.e. **raise** it: the classic bug.

OpenAI-style frequency and presence penalties instead subtract \`α·count + β·[count > 0]\` from the logit. Penalties that are too strong hurt text that has to repeat, such as code and names.`,
    tags: ['llm', 'sampling'],
  },
  {
    id: 'fc-llm-kv-cache',
    sectionId: 'llm-generation',
    question: "What is a KV cache, what does it save, and how big does it get?",
    answer: `With causal attention, past tokens' keys and values never change, so store them per layer. Each step computes Q, K, V for the new token only, appends K and V to the cache, and attends with one query over all cached keys.

For the token at position t: without a cache you rerun the whole prefix, O(t·d²) for projections and MLP plus O(t²·d) for attention; with it, O(d²) + O(t·d). Attention over the cache is still linear in t: the cache removes recomputation, not attention.

Size: \`2 × layers × kv_heads × head_dim × seq_len × batch × bytes\`. Llama 2 7B (32 layers, 32 KV heads, head_dim 128, fp16): 0.5 MiB per token, 2 GiB for 4,096 tokens. GQA, cache quantization and paged attention reduce it.`,
    tags: ['llm', 'inference'],
  },
  {
    id: 'fc-llm-beam-search',
    sectionId: 'llm-generation',
    question: "How does beam search work, and why does it need length normalization?",
    answer: `Keep the B best partial sequences by total log-probability. At each step, extend every beam with every possible next token, score \`score + log p(token)\`, and keep the top B overall; sequences that emit EOS move to a finished list.

Log-probabilities are negative, so the sum favors shorter sequences. Rank finished hypotheses by \`score / length^α\` (α ≈ 0.6–1.0).

Good for translation and summarization; for open-ended chat it produces bland, repetitive text, so sampling is preferred. B = 1 is greedy decoding.

**Pitfall:** add log-probabilities; multiplying probabilities underflows.`,
    tags: ['llm', 'decoding'],
  },
  {
    id: 'fc-llm-speculative',
    sectionId: 'llm-generation',
    question: "How does speculative decoding speed up generation without changing the output distribution?",
    answer: `A small draft model proposes k tokens; the large target model scores all k in **one** forward pass. Accept each draft token x with probability \`min(1, p(x) / q(x))\` (p = target, q = draft). At the first rejection, sample a replacement from \`max(0, p − q)\`, renormalized, and stop. If all k are accepted, sample one bonus token from p.

This rejection scheme makes every emitted token distributed exactly according to p.

The speedup (often 2–3×) comes from decoding being memory-bandwidth-bound: checking k tokens costs about as much as generating one. It grows with the draft model's acceptance rate.`,
    tags: ['llm', 'inference'],
  },
  // llm-internals
  {
    id: 'fc-llmi-rmsnorm',
    sectionId: 'llm-internals',
    question: "How does RMSNorm differ from LayerNorm, and why do LLMs use it?",
    answer: `\`RMSNorm(x) = x / √(mean(x²) + ε) ⊙ w\`, over the last axis (d_model).

Compared with LayerNorm: no mean subtraction and no bias β; it rescales but doesn't re-center. One fewer reduction, slightly faster, and empirically just as good. Used by LLaMA, Mistral, Gemma and T5.

w has shape \`(d_model,)\` and is usually initialized to ones.

**Pitfalls:** it is **not** LayerNorm with β = 0, because there is no centering; ε goes inside the square root; compute it in fp32 when activations are bf16.`,
    tags: ['llm', 'normalization'],
  },
  {
    id: 'fc-llmi-swiglu',
    sectionId: 'llm-internals',
    question: "What is a SwiGLU feed-forward block, and why is d_ff about (8/3)·d_model?",
    answer: `\`FFN(x) = (SiLU(x W_gate) ⊙ (x W_up)) W_down\`, with \`SiLU(z) = z·σ(z)\`. W_gate and W_up are \`(d_model, d_ff)\`; W_down is \`(d_ff, d_model)\`.

It is a gated linear unit: one branch decides, element by element, how much of the other passes through. It gives better quality per parameter than ReLU or GELU MLPs (Shazeer, 2020) and is used by LLaMA, Mistral and PaLM.

It has **three** matrices instead of two. To match the \`8·d_model²\` parameters of a \`4·d_model\` MLP, set \`3·d_model·d_ff = 8·d_model²\`, so \`d_ff = (8/3)·d_model\`, rounded to a hardware-friendly multiple (LLaMA-7B: 4,096 → 11,008).`,
    tags: ['llm', 'architecture'],
  },
  {
    id: 'fc-llmi-online-softmax',
    sectionId: 'llm-internals',
    question: "What is the online softmax trick, and how does FlashAttention use it?",
    answer: `Process the scores in blocks, keeping a running max m, a normalizer l and an unnormalized output acc. For each new block S_b with values V_b:

- \`m' = max(m, rowmax(S_b))\`
- \`l = l · e^(m − m') + rowsum(e^(S_b − m'))\`
- \`acc = acc · e^(m − m') + e^(S_b − m') V_b\`

At the end, \`output = acc / l\`: exactly softmax(S)V, without ever materializing the full row.

FlashAttention tiles Q, K and V into fast on-chip memory and applies this per query row: **exact** attention, O(n) extra memory instead of O(n²), and far less memory traffic, hence 2–4× faster with the same FLOPs.

**Pitfall:** rescale \`acc\`, not just \`l\`, whenever the max changes.`,
    tags: ['llm', 'attention'],
  },
  {
    id: 'fc-llmi-moe',
    sectionId: 'llm-internals',
    question: "How does mixture-of-experts routing work, and why is a load-balancing loss needed?",
    answer: `A router (a linear layer) gives each token logits over E expert MLPs. Keep the top k (1 or 2), softmax over those for the gates, and output \`Σ_j gate_j · expert_j(x)\`. Only k experts run per token: total parameters grow with E, compute per token with k.

Mixtral 8×7B: 8 experts, top-2, about 47B total and 13B active parameters per token.

Without an auxiliary loss the router collapses onto a few experts. Switch Transformer's loss: \`aux = E · Σ_e f_e · P_e\`, with f_e the fraction of tokens sent to expert e and P_e its mean router probability; it is minimized by uniform routing. A capacity factor caps tokens per expert, and overflow tokens skip the layer through the residual.`,
    tags: ['llm', 'moe'],
  },
  {
    id: 'fc-llmi-perplexity',
    sectionId: 'llm-internals',
    question: "How is perplexity computed, and what are its pitfalls?",
    answer: `\`PPL = exp(mean NLL) = exp(−(1/N) Σ_t log p(x_t | x_<t))\`, over the N real (non-padding) predicted tokens.

It is the effective number of equally likely choices per token: a uniform model over V tokens has PPL = V, a perfect model has 1.

**Pitfalls:**

- Average the log-probabilities first, then exponentiate; don't average per-token perplexities.
- Mask padding, and shift targets by one (predict token t + 1 from tokens ≤ t).
- Perplexities are **not comparable across tokenizers**; compare bits per byte instead.`,
    tags: ['llm', 'evaluation'],
  },
  {
    id: 'fc-llmi-flops',
    sectionId: 'llm-internals',
    question: "Roughly how many FLOPs does it take to train and to run a transformer language model with N parameters?",
    answer: `- **Training**: ≈ \`6·N·D\` FLOPs for D training tokens: 2·N·D for the forward pass (one multiply-add per parameter per token) and 4·N·D for the backward pass.
- **Inference**: ≈ \`2·N\` FLOPs per generated token, plus attention over the context.

Example: 7B parameters on 2T tokens ≈ 6 × 7e9 × 2e12 ≈ 8.4e22 FLOPs.

Chinchilla scaling: compute-optimal training uses about **20 tokens per parameter**, scaling N and D together. Many recent models train far beyond that, because serving cost depends only on N.`,
    tags: ['llm', 'scaling'],
  },
  // representation-learning
  {
    id: 'fc-rep-infonce',
    sectionId: 'representation-learning',
    question: "Write the CLIP (InfoNCE) loss. What roles do the batch size and the temperature play?",
    answer: `L2-normalize the image and text embeddings, I and T of shape \`(N, D)\`. \`logits = I Tᵀ / τ\`, shape \`(N, N)\`, with matching pairs on the diagonal:

\`loss = ½ · [CE(logits, arange(N)) + CE(logitsᵀ, arange(N))]\`

Each image must pick its caption out of N, and each caption its image.

- **Batch**: the other N − 1 items are the negatives, so larger batches give more and harder negatives (CLIP used 32K).
- **Temperature τ**: cosine similarities differ by at most 2, so τ stretches them into useful logit gaps. CLIP learns τ, starting at 0.07.

**Pitfalls:** forgetting to normalize; using only one direction.`,
    tags: ['contrastive', 'embeddings'],
  },
  {
    id: 'fc-rep-embedding-search',
    sectionId: 'representation-learning',
    question: "How do you run embedding similarity search efficiently and correctly?",
    answer: `L2-normalize every vector once; cosine similarity is then a dot product, and a batch of queries is one matmul: \`S = Q @ Dᵀ\`, shape \`(n_queries, n_docs)\`.

Top-k without a full sort: \`idx = np.argpartition(-S, k, axis=1)[:, :k]\`, then sort just those k. Brute force costs \`O(N·D)\` per query, fine up to millions of vectors on a GPU.

Beyond that, approximate nearest-neighbor indexes (HNSW graphs, IVF with product quantization as in FAISS) trade a little recall for orders of magnitude in speed.

**Pitfall:** zero vectors divide by zero; normalize with \`max(norm, 1e-12)\`.`,
    tags: ['retrieval', 'embeddings'],
  },
  {
    id: 'fc-rep-bi-cross-encoder',
    sectionId: 'representation-learning',
    question: "Bi-encoder vs cross-encoder: why do retrieval systems retrieve with one and rerank with the other?",
    answer: `- **Bi-encoder**: query and document are encoded separately and scored by a dot product. Documents are embedded offline and indexed, so searching millions is fast, but query and document tokens never interact, which limits accuracy.
- **Cross-encoder**: the concatenated query and document go through one transformer that outputs a relevance score. Full token-level attention makes it much more accurate, but it costs one forward pass per pair: far too slow for a whole corpus.

Two-stage pipeline: retrieve the top ~100 with a bi-encoder (or BM25, or both), rerank them with a cross-encoder, return the top 10. Measure recall@k for the first stage and nDCG or MRR for the final ranking.`,
    tags: ['retrieval', 'reranking'],
  },
  {
    id: 'fc-rep-bm25',
    sectionId: 'representation-learning',
    question: "How does BM25 score a document, and when does lexical search beat dense retrieval?",
    answer: `For each query term t: \`IDF(t) · f(t,d)·(k1 + 1) / (f(t,d) + k1·(1 − b + b·|d|/avgdl))\`, summed over the terms.

- IDF rewards rare terms.
- k1 (≈ 1.2–2) saturates term frequency: the 10th occurrence adds little.
- b (≈ 0.75) normalizes by document length relative to the average length avgdl.

Lexical search wins on exact matches an embedding model hasn't learned: product codes, names, rare jargon, out-of-domain text. Hybrid systems combine both, e.g. with reciprocal rank fusion. Don't simply add raw scores, which live on different scales.`,
    tags: ['retrieval', 'lexical'],
  },
  // generative-models
  {
    id: 'fc-gen-kl-divergence',
    sectionId: 'generative-models',
    question: "What is KL divergence, and what is the closed-form KL term in a VAE?",
    answer: `\`KL(P ‖ Q) = E_{x~P}[log P(x) − log Q(x)]\`: the expected extra nats paid for coding samples from P with a code built for Q. Always ≥ 0, equal to 0 iff P = Q, and **not symmetric**.

VAE term for q = N(μ, σ²) per latent dimension against the prior N(0, 1):

\`KL = −½ Σ_j (1 + log σ_j² − μ_j² − σ_j²)\`, summed over latent dimensions, averaged over the batch.

Forward KL(P ‖ Q) is mass-covering; reverse KL(Q ‖ P) is mode-seeking.

**Pitfall:** in discrete KL, terms with P(x) = 0 contribute 0, but Q(x) = 0 where P(x) > 0 makes the KL infinite.`,
    tags: ['vae', 'information-theory'],
  },
  {
    id: 'fc-gen-reparameterization',
    sectionId: 'generative-models',
    question: "What is the reparameterization trick in VAEs, and why is it needed?",
    answer: `The encoder outputs μ and log σ² for q(z | x). Sampling \`z ~ N(μ, σ²)\` directly isn't differentiable with respect to μ and σ, so no gradient would reach the encoder.

Write the sample as a deterministic function of the parameters plus parameter-free noise:

\`ε ~ N(0, I)\`, \`σ = exp(0.5 · log σ²)\`, \`z = μ + σ ⊙ ε\`

Now \`∂z/∂μ = 1\` and \`∂z/∂σ = ε\`, and all the randomness is in ε. Predicting log σ² keeps σ positive and the optimization stable.`,
    tags: ['vae', 'training'],
  },
  {
    id: 'fc-gen-vae-loss',
    sectionId: 'generative-models',
    question: "What is the VAE training objective, and what happens when its two terms are weighted differently?",
    answer: `Minimize the negative ELBO:

\`L = E_{q(z|x)}[−log p(x | z)] + KL(q(z | x) ‖ p(z))\`

- Reconstruction: MSE for a Gaussian decoder, BCE for binary pixels, summed over pixels.
- KL: the closed-form Gaussian term, summed over latent dimensions.

β-VAE weights the KL by β. β > 1 gives more disentangled but blurrier results; too little KL leaves an autoencoder whose latent space has holes; too much (or a very powerful decoder) causes **posterior collapse**: KL → 0 and z is ignored. Warming β up from 0 helps.

**Pitfall:** a per-pixel *mean* reconstruction with a *summed* KL silently sets a huge β.`,
    tags: ['vae', 'loss'],
  },
  {
    id: 'fc-gen-vqvae',
    sectionId: 'generative-models',
    question: "How does VQ-VAE quantize its latents, and how do gradients get through the non-differentiable lookup?",
    answer: `For each encoder output z_e, take the nearest codebook vector: \`k = argmin_j ‖z_e − e_j‖²\`, \`z_q = e_k\`.

Gradients use the **straight-through estimator**: \`z_q = z_e + stopgrad(z_q − z_e)\`. The forward pass uses z_q; the backward pass copies the decoder's gradient straight to z_e.

Loss = reconstruction + \`‖stopgrad(z_e) − e_k‖²\` (codebook loss, moves the codes) + \`β · ‖z_e − stopgrad(e_k)‖²\` (commitment loss, β ≈ 0.25).

**Pitfall:** codebook collapse, where only a few codes get used; fixes are EMA codebook updates and re-initializing dead codes. Compute distances as \`‖z‖² − 2z·e + ‖e‖²\`.`,
    tags: ['vqvae', 'generative'],
  },
  {
    id: 'fc-gen-diffusion',
    sectionId: 'generative-models',
    question: "Explain the forward and reverse processes of a DDPM, and its training loss.",
    answer: `**Forward (fixed)**: add Gaussian noise over T steps with a schedule β_t. With \`α_t = 1 − β_t\` and \`ᾱ_t = Π_{s≤t} α_s\`, any step is reachable in closed form:

\`x_t = √ᾱ_t · x_0 + √(1 − ᾱ_t) · ε\`, \`ε ~ N(0, I)\`

At t = T, ᾱ_T ≈ 0 and x_T is nearly pure noise.

**Training**: sample x_0, t and ε; minimize \`‖ε − ε_θ(x_t, t)‖²\`.

**Reverse (learned)**: start from x_T ~ N(0, I) and step back with \`x_{t−1} = (x_t − β_t / √(1 − ᾱ_t) · ε_θ) / √α_t + σ_t · z\`, adding no noise at the final step.`,
    tags: ['diffusion', 'generative'],
  },
  {
    id: 'fc-gen-noise-schedule',
    sectionId: 'generative-models',
    question: "What does a diffusion noise schedule control, and why was the cosine schedule introduced?",
    answer: `The schedule β_1 … β_T sets how fast the signal is destroyed. What matters is ᾱ_t, the fraction of signal left (signal-to-noise ratio \`ᾱ_t / (1 − ᾱ_t)\`).

- **Linear** (DDPM): β from 1e-4 to 0.02 over T = 1000. ᾱ_t falls fast, so the last part of the chain is almost pure noise, wasted steps for small images.
- **Cosine** (Nichol & Dhariwal): \`ᾱ_t = f(t) / f(0)\` with \`f(t) = cos²(((t/T + s) / (1 + s)) · π/2)\`, s = 0.008, and β_t clipped at 0.999. Information is destroyed more evenly.

**Pitfalls:** mixing 0- and 1-indexed t; using β_t where ᾱ_t is needed.`,
    tags: ['diffusion', 'schedules'],
  },
  {
    id: 'fc-gen-cfg',
    sectionId: 'generative-models',
    question: "How does classifier-free guidance work?",
    answer: `Train one model with the condition c randomly dropped (e.g. replaced by a null token 10% of the time), so it learns both ε(x_t, c) and ε(x_t, ∅).

When sampling, run both and extrapolate:

\`ε̂ = ε_u + w · (ε_c − ε_u)\`

w = 0 is unconditional, w = 1 plain conditional, and w > 1 follows the prompt more closely at the expense of diversity (Stable Diffusion defaults to 7.5; too high gives oversaturated images).

Cost: two forward passes per step, usually batched together. Unlike classifier guidance, no separate classifier is needed.`,
    tags: ['diffusion', 'guidance'],
  },
  {
    id: 'fc-gen-flow-matching',
    sectionId: 'generative-models',
    question: "What does a flow-matching (rectified flow) model learn, and how do you sample from it?",
    answer: `Training: draw noise x_0 ~ N(0, I), a data point x_1 and t ~ U(0, 1). Interpolate along a straight line, \`x_t = (1 − t)·x_0 + t·x_1\`; the target velocity is \`x_1 − x_0\`. Minimize \`‖v_θ(x_t, t) − (x_1 − x_0)‖²\`.

Sampling: integrate the ODE \`dx/dt = v_θ(x, t)\` from t = 0 (noise) to t = 1 (data), e.g. with Euler steps \`x ← x + Δt · v_θ(x, t)\`.

Straighter paths need fewer sampling steps than diffusion. Used by Stable Diffusion 3 and Flux.

**Pitfalls:** some papers put noise at t = 1; reshape t to \`(B, 1, …, 1)\` so it broadcasts.`,
    tags: ['flow-matching', 'generative'],
  },
  // reinforcement-learning
  {
    id: 'fc-rl-discounted-return',
    sectionId: 'reinforcement-learning',
    question: "How do you compute the discounted returns of an episode efficiently?",
    answer: `\`G_t = r_t + γ·r_{t+1} + γ²·r_{t+2} + … = r_t + γ·G_{t+1}\`

Compute it in one backward pass, O(T): start with \`G = 0\`, and for t = T−1 down to 0 set \`G = rewards[t] + gamma * G\` and store it as \`returns[t]\`.

Example: rewards [1, 1, 1, 1], γ = 0.9 → G₀ = 1 + 0.9 + 0.81 + 0.729 = 3.439.

γ < 1 keeps infinite sums finite and sets an effective horizon of about 1/(1 − γ). **Pitfalls:** the first reward is discounted by γ⁰; reset G at episode boundaries when trajectories are concatenated.`,
    tags: ['rl', 'returns'],
  },
  {
    id: 'fc-rl-epsilon-greedy',
    sectionId: 'reinforcement-learning',
    question: "What is ε-greedy exploration, and what are its implementation details?",
    answer: `With probability ε take a uniformly random action, otherwise the greedy one, \`argmax_a Q(s, a)\`. The greedy action's total probability is \`1 − ε + ε/|A|\`; every other action gets \`ε/|A|\`.

Usually ε is annealed from 1.0 to about 0.05 over training: explore early, exploit later. Break argmax ties randomly, or a freshly initialized Q-table always picks action 0.

It explores blindly. Alternatives: softmax (Boltzmann) exploration, UCB (optimism under uncertainty), and entropy bonuses in policy-gradient methods.`,
    tags: ['rl', 'exploration'],
  },
  {
    id: 'fc-rl-onpolicy-offpolicy',
    sectionId: 'reinforcement-learning',
    question: "What is the difference between on-policy and off-policy learning? Give examples.",
    answer: `- **On-policy**: learns about the policy that collects the data. SARSA's target uses the action actually taken next, \`r + γ·Q(s', a')\`, so it learns the value of its own ε-greedy policy. REINFORCE and PPO are on-policy too: data must come from the current (or a very recent) policy.
- **Off-policy**: learns a target policy from data produced by another behavior policy. Q-learning's target \`r + γ·max_a' Q(s', a')\` evaluates the greedy policy whatever action was taken, so it can learn from a replay buffer (DQN).

Off-policy reuses data and is more sample-efficient, but less stable. Classic example: on the cliff-walking task, SARSA learns the safer path, Q-learning the optimal edge path.`,
    tags: ['rl', 'algorithms'],
  },
  {
    id: 'fc-rl-bellman',
    sectionId: 'reinforcement-learning',
    question: "State the Bellman optimality equation for Q and the Q-learning update.",
    answer: `\`Q*(s, a) = E_{s'}[ r + γ · max_{a'} Q*(s', a') ]\`

The value of taking a in s and acting optimally afterwards: the immediate reward plus the discounted value of the best next action. Q* is the fixed point of this backup, which is a γ-contraction, so repeating it converges.

Q-learning applies it to samples:

\`Q(s, a) ← Q(s, a) + α · (r + γ · max_{a'} Q(s', a') − Q(s, a))\`

Example: Q = 1, r = 5, Q(s', ·) = [3, 4], γ = 0.9, α = 0.5 → target 8.6, new Q = 4.8.

**Pitfall:** if s' is terminal, the target is just r.`,
    tags: ['rl', 'theory'],
  },
  {
    id: 'fc-rl-td0',
    sectionId: 'reinforcement-learning',
    question: "What is TD(0) learning, and how does it compare with Monte Carlo?",
    answer: `Update V after every step toward a bootstrapped target:

\`δ = r + γ·V(s') − V(s)\` (the TD error), then \`V(s) ← V(s) + α·δ\`.

- **Monte Carlo** waits for the actual return G_t: unbiased, high variance, needs complete episodes.
- **TD(0)** uses one real reward plus its own estimate: biased by the current V, much lower variance, and learns online, even in tasks that never end.

n-step returns and TD(λ) / GAE interpolate between the two.

**Pitfall:** V(s') = 0 at a terminal state.`,
    tags: ['rl', 'td-learning'],
  },
  {
    id: 'fc-rl-value-iteration',
    sectionId: 'reinforcement-learning',
    question: "What is value iteration, and when does it stop?",
    answer: `Dynamic programming with a known model P(s' | s, a) and rewards R(s, a). Apply the Bellman optimality backup to every state:

\`V_{k+1}(s) = max_a [ R(s, a) + γ · Σ_{s'} P(s' | s, a) · V_k(s') ]\`

Stop when \`max_s |V_{k+1}(s) − V_k(s)| < θ\`. The backup is a γ-contraction, so it converges to V* from any start. The policy is the greedy argmax of the same expression.

Vectorized, with P of shape \`(S, A, S)\` and R of shape \`(S, A)\`: \`Q = R + γ · P @ V\`, then \`V = Q.max(axis=1)\`.

**Pitfall:** synchronous updates must use the old V for every state.`,
    tags: ['rl', 'dynamic-programming'],
  },
  {
    id: 'fc-rl-nstep',
    sectionId: 'reinforcement-learning',
    question: "What is the n-step return, and why use it?",
    answer: `\`G_t^(n) = r_t + γ·r_{t+1} + … + γ^(n−1)·r_{t+n−1} + γ^n·V(s_{t+n})\`

Use n real rewards, then bootstrap. n = 1 is TD(0); n reaching the end of the episode is Monte Carlo. Larger n spreads reward information faster and depends less on a poor V, at the cost of more variance. Rainbow DQN uses n = 3.

**Pitfall:** if the episode ends within the n steps, truncate the sum and drop the bootstrap term.`,
    tags: ['rl', 'returns'],
  },
  {
    id: 'fc-rl-reinforce',
    sectionId: 'reinforcement-learning',
    question: "State the REINFORCE policy gradient. Why subtract a baseline?",
    answer: `\`∇_θ J = E[ Σ_t ∇_θ log π_θ(a_t | s_t) · G_t ]\`: raise the log-probability of each action in proportion to the return that followed it. As a loss: \`loss = −(logp * G).mean()\`.

Subtracting a baseline b(s), usually a learned V(s), keeps the gradient **unbiased** (because \`E[∇ log π · b(s)] = 0\`) and cuts its variance a lot. With b = V, \`G_t − V(s_t)\` estimates the advantage: actor-critic.

For a softmax policy with logits z: \`∇_z log π(a) = onehot(a) − π\`.

**Pitfall:** G must not carry gradients (detach it).`,
    tags: ['rl', 'policy-gradient'],
  },
  {
    id: 'fc-rl-gae',
    sectionId: 'reinforcement-learning',
    question: "How is Generalized Advantage Estimation (GAE) computed, and what does λ trade off?",
    answer: `TD errors: \`δ_t = r_t + γ·V(s_{t+1})·(1 − done_t) − V(s_t)\`.

Advantages, computed backwards: \`A_t = δ_t + γλ·(1 − done_t)·A_{t+1}\`, i.e. \`A_t = Σ_l (γλ)^l · δ_{t+l}\`. Value targets: \`A_t + V(s_t)\`.

- λ = 0: \`A_t = δ_t\`, one-step TD. Low variance, biased by V.
- λ = 1: the Monte Carlo return minus V. Unbiased, high variance.
- λ ≈ 0.95 (with γ = 0.99) is the usual compromise.

**Pitfalls:** values need length T + 1 (the bootstrap value of the last next state); reset at done; episodes cut by a time limit should still bootstrap.`,
    tags: ['rl', 'policy-gradient'],
  },
  {
    id: 'fc-rl-ppo',
    sectionId: 'reinforcement-learning',
    question: "What is PPO's clipped objective, and why does the clipping work?",
    answer: `With ratio \`r_t = π_θ(a_t | s_t) / π_old(a_t | s_t)\` and advantage A_t, maximize

\`L = E_t[ min(r_t·A_t, clip(r_t, 1 − ε, 1 + ε)·A_t) ]\`, ε ≈ 0.2 (the loss is −L).

The min is a pessimistic bound: once the ratio moves past 1 ± ε in the helpful direction (above 1 + ε for A > 0, below 1 − ε for A < 0), the gradient is zero. Several epochs of minibatch updates on one batch therefore can't move the policy far from the one that collected it: a simple first-order stand-in for TRPO's trust region.

The full loss usually adds a value loss and an entropy bonus. PPO was the RL step of InstructGPT / ChatGPT.

**Pitfall:** compute the ratio as \`exp(logp_new − logp_old)\`, with logp_old detached.`,
    tags: ['rl', 'policy-gradient'],
  },
  {
    id: 'fc-rl-reward-model',
    sectionId: 'reinforcement-learning',
    question: "How is an RLHF reward model trained from preference pairs?",
    answer: `Labelers pick the better of two responses to the same prompt. Bradley–Terry models the preference as

\`P(chosen ≻ rejected) = σ(r_θ(x, y_c) − r_θ(x, y_r))\`

and training minimizes \`−log σ(r_c − r_r)\`, averaged over pairs. The reward model is usually the SFT model with a scalar head on the final token.

Only reward **differences** are learned: adding a constant changes nothing, so rewards are often normalized afterwards.

**Pitfall:** compute \`−log σ(Δ)\` stably as \`np.logaddexp(0, −Δ)\` (softplus(−Δ)); \`log(sigmoid(Δ))\` underflows for very negative Δ.`,
    tags: ['rl', 'rlhf'],
  },
  {
    id: 'fc-rl-kl-penalty',
    sectionId: 'reinforcement-learning',
    question: "Why does RLHF add a KL penalty to the reward, and how is it estimated per token?",
    answer: `Optimized hard against an imperfect reward model, the policy finds outputs that score high without being good (reward hacking) and drifts away from fluent language. The penalty keeps it close to the reference (SFT) model:

\`objective = r(x, y) − β · KL(π_θ ‖ π_ref)\`

Per sampled token, \`kl_t = log π_θ(y_t) − log π_ref(y_t)\` (k1): unbiased, but a single term can be negative. The k3 estimator \`exp(−kl_t) + kl_t − 1\` is also unbiased and never negative (GRPO uses it).

Typical β ≈ 0.01–0.1; some setups adapt β to hit a target KL.`,
    tags: ['rl', 'rlhf'],
  },
  {
    id: 'fc-rl-dpo',
    sectionId: 'reinforcement-learning',
    question: "What is DPO's loss, and how does it avoid both the reward model and RL?",
    answer: `With a frozen reference model π_ref (the SFT model), a chosen response y_w and a rejected one y_l:

- \`Δ_w = log π_θ(y_w | x) − log π_ref(y_w | x)\`, and Δ_l the same way
- \`loss = −log σ(β · (Δ_w − Δ_l))\`

Why it works: the optimal policy of the KL-regularized RLHF objective satisfies \`r(x, y) = β·log(π*(y|x) / π_ref(y|x)) + β·log Z(x)\`. Substituting into Bradley–Terry cancels Z, leaving a supervised loss on log-ratios: no reward model, no sampling.

At initialization (π_θ = π_ref) the loss is log 2 ≈ 0.693. β ≈ 0.1–0.5 controls how far π_θ may move.

**Pitfall:** log-probabilities are **sums** over response tokens, with prompt and padding masked out.`,
    tags: ['rl', 'rlhf'],
  },
  // post-training
  {
    id: 'fc-post-pipeline',
    sectionId: 'post-training',
    question: "Outline the modern LLM post-training pipeline. What does each stage do?",
    answer: `1. **Pretraining**: next-token prediction on trillions of tokens gives a base model that continues text.
2. **SFT** (instruction tuning): cross-entropy on curated prompt–response pairs, with the loss **only on the response tokens**. Teaches format and instruction following.
3. **Preference optimization**: RLHF (reward model + PPO with a KL penalty) or offline DPO on chosen/rejected pairs, for helpfulness, harmlessness and style.
4. **RL with verifiable rewards**: e.g. GRPO on math and code with automatic checkers, for reasoning.

Efficiency tools along the way: LoRA / QLoRA for cheaper fine-tuning; quantization and distillation for cheaper serving.`,
    tags: ['llm', 'post-training'],
  },
  {
    id: 'fc-post-grpo',
    sectionId: 'post-training',
    question: "How does GRPO compute advantages, and why doesn't it need a value network?",
    answer: `For each prompt, sample a group of G responses and score them, often with a verifier (1 if the final answer is correct). Each response's advantage is its reward normalized within the group:

\`A_i = (r_i − mean(r)) / (std(r) + ε)\`, with the population std; every token of response i gets A_i.

The group mean is the baseline, replacing PPO's learned critic, a model as large as the policy. The loss is PPO's clipped surrogate with these advantages, minus \`β · KL\` (k3 estimator) to the reference model.

Example: rewards [1, 0, 0, 0] → advantages [1.73, −0.58, −0.58, −0.58].

**Pitfall:** a group with identical rewards has zero advantage and gives no signal; ε prevents a 0/0.`,
    tags: ['rl', 'post-training'],
  },
  {
    id: 'fc-post-lora',
    sectionId: 'post-training',
    question: "How does LoRA fine-tune a large model, and why is B initialized to zero?",
    answer: `Freeze W, shape \`(d_in, d_out)\`, and learn a low-rank update:

\`out = x W + (α / r) · (x A) B\`, with A \`(d_in, r)\`, B \`(r, d_out)\` and r ≪ d (e.g. 8–64).

B starts at 0, so training starts exactly from the pretrained model; A is random, so B still gets non-zero gradients. Only A and B need gradients and Adam state: with d = 4,096 and r = 8, that is 65,536 instead of 16.8M parameters per matrix (256× fewer). After training, merge \`W + (α/r)·A B\` for zero inference overhead.

**Pitfall:** compute \`(x A) B\`, not \`x (A B)\`, which builds a full d_in × d_out matrix.`,
    tags: ['fine-tuning', 'efficiency'],
  },
  {
    id: 'fc-post-int8',
    sectionId: 'post-training',
    question: "How does symmetric int8 (absmax) quantization work, and why use per-channel scales?",
    answer: `Per row (output channel): \`scale = max|w| / 127\`, \`q = clip(round(w / scale), −127, 127)\` stored as int8; dequantize with \`ŵ = q · scale\`. The rounding error per weight is at most scale / 2.

Example: row [0.7, −1.2, 0.3] → scale ≈ 0.00945, q = [74, −127, 32].

**Per-channel vs per-tensor**: everything sharing a scale is limited by its largest value. With one scale for the whole tensor, a row of small weights such as [0.01, −0.02] rounds to almost all zeros; per-row scales preserve it. LLM activations have extreme outlier channels, which motivated LLM.int8() and SmoothQuant.

4× smaller than fp32. **Pitfalls:** guard all-zero rows; accumulate int8 products in int32.`,
    tags: ['quantization', 'efficiency'],
  },
  // e2e-implementations
  {
    id: 'fc-e2e-mlp-backprop',
    sectionId: 'e2e-implementations',
    question: "Write the backward pass of a 2-layer MLP with ReLU and softmax cross-entropy, with shapes.",
    answer: `Forward, rows are samples: \`Z1 = X W1 + b1\`, \`A1 = ReLU(Z1)\`, \`Z2 = A1 W2 + b2\`, \`P = softmax(Z2)\`, L = mean cross-entropy. X is \`(N, D)\`, hidden size M, C classes.

Backward:

- \`dZ2 = (P − Y) / N\`: \`(N, C)\`
- \`dW2 = A1ᵀ dZ2\`: \`(M, C)\`; \`db2 = dZ2.sum(axis=0)\`
- \`dA1 = dZ2 W2ᵀ\`: \`(N, M)\`
- \`dZ1 = dA1 ⊙ (Z1 > 0)\`
- \`dW1 = Xᵀ dZ1\`: \`(D, M)\`; \`db1 = dZ1.sum(axis=0)\`

Sanity check: every gradient has its parameter's shape. Verify with a finite-difference gradient check.`,
    tags: ['backpropagation', 'mlp'],
  },
  {
    id: 'fc-e2e-transformer-components',
    sectionId: 'e2e-implementations',
    question: "List the components of a transformer block in order. How do modern pre-norm blocks differ from the original post-norm ones?",
    answer: `Modern pre-norm decoder block (GPT-2, LLaMA) on x of shape \`(B, T, d_model)\`:

1. \`h = x + Attention(Norm(x))\`: multi-head self-attention, causal in a decoder, with RoPE on Q and K in LLaMA.
2. \`out = h + FFN(Norm(h))\`: a per-token MLP with \`d_ff = 4·d_model\` (GELU) or a SwiGLU.

A final Norm comes before the LM head. Norm is LayerNorm (GPT-2) or RMSNorm (LLaMA).

Original post-norm encoder: \`h = LN(x + MHA(x))\`, then \`out = LN(h + FFN(h))\`. The original decoder adds cross-attention to the encoder output between self-attention and the FFN.

Attention mixes information across tokens; the FFN transforms each token separately.`,
    tags: ['transformer', 'architecture'],
  },
  {
    id: 'fc-e2e-residual',
    sectionId: 'e2e-implementations',
    question: "Why are residual connections critical in deep networks?",
    answer: `A residual block outputs \`y = x + F(x)\`.

1. **Gradient highway**: \`∂y/∂x = I + ∂F/∂x\`, so the gradient reaches early layers through the identity term even when F's Jacobian is small.
2. **Easy identity**: a block only learns a correction; F ≈ 0 leaves the input unchanged, so adding layers shouldn't hurt.
3. **Depth**: in the ResNet paper, a plain 56-layer network had *higher training error* than a 20-layer one (the degradation problem); residual networks trained well at 152 layers, and over 1,000 on CIFAR-10.

Used in ResNets, transformers (around every sublayer) and U-Nets. DenseNet concatenates features instead of adding them.`,
    tags: ['architecture', 'deep-learning'],
  },
  {
    id: 'fc-e2e-mini-gpt',
    sectionId: 'e2e-implementations',
    question: "How is a GPT-style model trained on next-token prediction? Give the shapes and the target shift.",
    answer: `Token ids \`(B, T + 1)\`: inputs \`x = ids[:, :-1]\`, targets \`y = ids[:, 1:]\`, both \`(B, T)\`.

Token embedding + position → \`(B, T, d_model)\` → N causal blocks → final norm → logits \`(B, T, V)\`, often computed as \`h @ W_embᵀ\` (weight tying shares the embedding matrix with the output layer).

Loss: cross-entropy over all B·T positions. Thanks to the causal mask, one forward pass trains T next-token predictions in parallel.

Generation: feed the prompt, sample from the **last** position's logits, append, repeat (with a KV cache).

**Pitfalls:** no shift → the model learns to copy its input; no causal mask → it peeks at the answer, training loss collapses toward 0 and generation is garbage.`,
    tags: ['transformer', 'llm'],
  },
  {
    id: 'fc-e2e-vit',
    sectionId: 'e2e-implementations',
    question: "How does a Vision Transformer turn an image into tokens and classify it?",
    answer: `Cut a \`(C, H, W)\` image into non-overlapping P×P patches: \`N = (H/P)·(W/P)\` patches, each flattened to \`P²·C\` values and linearly projected to d_model (equivalently, a Conv2d with kernel = stride = P).

ViT-B/16 on 224×224: 14 × 14 = 196 patches of 16·16·3 = 768 values.

Prepend a learnable **[CLS]** token → \`(B, N + 1, d_model)\`, add learned position embeddings, run a standard non-causal transformer encoder, and classify from the final [CLS] vector (or the mean of the patch tokens).

ViTs have weaker built-in assumptions than CNNs, so they need large-scale pretraining or strong augmentation (DeiT).`,
    tags: ['vision', 'transformer'],
  },
  {
    id: 'fc-e2e-debugging',
    sectionId: 'e2e-implementations',
    question: "Your transformer's training loss won't go down. What do you check first?",
    answer: `1. **Overfit one small batch.** If the loss can't get near 0, it's a bug, not a hyperparameter.
2. **Initial loss ≈ ln(V)** for V classes or tokens (ln 50,257 ≈ 10.8). Much higher means bad initialization or wrongly scaled logits.
3. **Shapes and axes**: softmax over the right axis, √d_k per head, heads split with reshape *and* transpose, targets shifted by one.
4. **Masks**: causal mask applied before the softmax; padding excluded from the loss.
5. **Training loop**: \`zero_grad\` every step, \`model.train()\`, a sane learning rate; check the gradient norm for zeros or NaNs.
6. **Data**: labels aligned with inputs; nothing leaked.`,
    tags: ['debugging', 'training'],
  },
];

export function getFlashCardsBySection(sectionId: string): FlashCard[] {
  return flashCards.filter(card => card.sectionId === sectionId);
}
