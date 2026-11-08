import { Section } from '../types';

export const sections: Section[] = [
  // ==========================================
  // PART 1: FOUNDATIONS
  // ==========================================
  {
    id: 'numpy-fundamentals',
    title: 'NumPy Fundamentals',
    description: 'Master NumPy array operations essential for ML development.',
    icon: '🔢',
    introduction: `
# NumPy Fundamentals

NumPy is the backbone of scientific computing in Python. Every ML library builds on it.

## Key Concepts

### Array Creation
- \`np.array()\`: Create from lists
- \`np.zeros()\`, \`np.ones()\`: Initialize with values
- \`np.arange()\`, \`np.linspace()\`: Numeric ranges
- \`np.eye()\`: Identity matrix

### Indexing & Slicing
- Basic: \`arr[0]\`, \`arr[1:5]\`
- Advanced: \`arr[[0, 2, 4]]\`, \`arr[arr > 0]\`
- Multi-dimensional: \`arr[1, :]\`, \`arr[:, 2:4]\`

### Broadcasting
Arrays of different shapes can be combined:
- (3, 4) + (4,) → broadcasts to (3, 4)
- (3, 1) * (1, 4) → broadcasts to (3, 4)

### Aggregations
- \`sum()\`, \`mean()\`, \`std()\` - with axis parameter
- \`argmax()\`, \`argmin()\` - find indices

### Shape Manipulation
- \`reshape()\`: Change dimensions
- \`transpose()\`, \`.T\`: Swap axes
- \`flatten()\`, \`ravel()\`: To 1D

Master these operations to write efficient ML code!
    `,
    problems: ['numpy-array-creation', 'numpy-indexing', 'numpy-broadcasting', 'numpy-aggregations', 'numpy-reshape-transpose'],
  },
  {
    id: 'python-basics',
    title: 'Python Basics for ML',
    description: 'Master NumPy arrays and essential Python operations for machine learning.',
    icon: '🐍',
    introduction: `
# Python Basics for Machine Learning

NumPy is the foundation of nearly all machine learning in Python. Before diving into complex algorithms, you need to master array operations.

## Key Concepts

### NumPy Arrays
- **Creation**: \`np.array()\`, \`np.zeros()\`, \`np.ones()\`, \`np.arange()\`
- **Shape manipulation**: \`reshape()\`, \`flatten()\`, \`transpose()\`
- **Indexing**: Slicing, boolean indexing, fancy indexing

### Essential Operations
- **Element-wise**: Addition, multiplication, mathematical functions
- **Aggregations**: \`sum()\`, \`mean()\`, \`std()\`, \`min()\`, \`max()\`
- **Broadcasting**: Automatic expansion of arrays for operations

### Why It Matters
Every ML algorithm processes data as arrays. Understanding these operations lets you:
- Prepare data efficiently
- Debug model issues
- Optimize performance

Let's practice with hands-on problems!
    `,
    problems: ['numpy-array-sum', 'numpy-matrix-multiply', 'numpy-broadcast-add'],
  },
  {
    id: 'einsum',
    title: 'Einstein Summation (Einsum)',
    description: 'Master einsum for elegant tensor operations.',
    icon: '∑',
    introduction: `
# Einstein Summation (Einsum)

Einsum is a powerful notation for expressing tensor operations concisely.

## Why Einsum?
- Express complex operations in one line
- Often faster than chained operations
- Essential for attention mechanisms

## Syntax
\`\`\`python
np.einsum('subscripts', operands)
\`\`\`

## Common Patterns

### Basic Operations
\`\`\`
'ij->'      Sum all elements
'ij->i'     Sum along axis 1 (row sums)
'ij->j'     Sum along axis 0 (column sums)
'ij->ji'    Transpose
'ii->i'     Extract diagonal
'ii->'      Trace (sum of diagonal)
\`\`\`

### Matrix Operations
\`\`\`
'ik,kj->ij'   Matrix multiplication (A @ B)
'ij,ij->ij'   Element-wise product (A * B)
'ij,ij->'     Frobenius inner product
'i,j->ij'     Outer product
'i,i->'       Dot product
\`\`\`

### Batch Operations
\`\`\`
'bij,bjk->bik'   Batch matrix multiply
'bqd,bkd->bqk'   Attention scores (Q @ K.T)
'bhqk,bhkd->bhqd' Multi-head attention output
\`\`\`

## Key Insight
Letters that appear on both sides are kept.
Letters that disappear are summed over (contracted).

Master einsum to write clean, efficient deep learning code!
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
    description: 'Build the Transformer from scratch: attention (multi-head, grouped-query, sliding-window), positional encodings, LayerNorm, tokenizers and the attention backward pass.',
    icon: '🤖',
    introduction: `
# Transformer Architecture

## Why it matters
Every modern LLM (GPT, LLaMA, Mistral, Qwen) is a stack of the same Transformer block, and so are vision transformers and speech models. "Implement attention" is the single most common ML coding interview question, usually followed by "now make it multi-head", "now make it causal" and "how would you make it faster?".

## The pipeline, end to end
This section builds every stage of a decoder-only LLM except decoding, which has its own section:

\`\`\`text
text ──tokenize──> ids (batch, seq_len)                     BPE / longest match
     ──embed────> x   (batch, seq_len, d_model)             lookup table (+ positions)
     ──N blocks─> x = x + Attn(Norm(x))                      causal multi-head attention, RoPE
                  x = x + FFN(Norm(x))                       MLP (SwiGLU in LLaMA)
     ──LM head──> logits (batch, seq_len, vocab)            final norm, x @ W_vocab
     ──decode───> next token, append, repeat                LLM Generation & Decoding
\`\`\`

Training feeds the whole sequence at once and uses the causal mask so position \`t\` only sees tokens \`0..t\`; generation runs the same network one token at a time.

## Core ideas

**Attention** is a soft lookup: each query scores every key, a softmax turns the scores into weights, and the output is the weighted mix of the values.

| Piece | Formula | Shape |
|-------|---------|-------|
| Scores | \`S = Q K^T / sqrt(d_k)\` | \`(seq_len, seq_len)\` |
| Causal mask | \`S[i, j] = -inf\` for \`j > i\` | same |
| Weights | \`A = softmax(S, axis=-1)\` | rows sum to 1 |
| Output | \`A V\` | \`(seq_len, d_v)\` |
| Multi-head | split \`d_model\` into \`H\` heads of \`d_k = d_model / H\`, attend per head, concatenate | \`(seq_len, d_model)\` |

The \`sqrt(d_k)\` keeps the scores at unit variance so the softmax doesn't saturate.

**Positions.** Attention ignores order, so position must be injected: sinusoidal or learned vectors **added** to the embeddings (original Transformer, GPT-2), or **RoPE**, which rotates \`q\` and \`k\` so that \`q · k\` depends only on the relative offset (LLaMA and most current LLMs).

**Normalization and residuals.** Each sub-layer is wrapped as \`x + f(Norm(x))\` (pre-norm). LayerNorm normalizes each token's features: \`gamma * (x - mean) / sqrt(var + eps) + beta\`.

**Efficient attention variants.** Grouped-query attention shares K/V heads across query heads to shrink the KV cache; sliding-window attention limits each token to the last \`W\` positions, so cost drops from \`O(n^2)\` to \`O(n · W)\`.

## Worked micro-example
Two tokens with \`Q = K = [[1, 0], [0, 1]]\`, \`V = [[1, 2], [3, 4]]\`, \`d_k = 2\`:

\`\`\`text
S = Q K^T / sqrt(2) = [[0.7071, 0     ], [0,      0.7071]]
A = softmax(S)      = [[0.6698, 0.3302], [0.3302, 0.6698]]
out = A V           = [[1.6605, 2.6605], [2.3395, 3.3395]]
\`\`\`

Each token leans toward its own value. With a causal mask, row 0 would become \`[1, 0]\` and its output exactly \`[1, 2]\`.

## Common pitfalls
- **Unstable softmax**: subtract the row max before \`exp\`, or large scores overflow to \`inf\` and give NaN.
- **Head reshapes**: go \`(seq_len, d_model) -> (seq_len, H, d_k) -> (H, seq_len, d_k)\`; reshaping straight to \`(H, seq_len, d_k)\` mixes tokens across heads.
- **Wrong scale**: per-head attention divides by \`sqrt(d_k)\`, not \`sqrt(d_model)\`.
- **Mask off-by-one**: the diagonal must stay visible (\`np.triu(..., k=1)\`); a fully masked row gives NaN.
- **Biased vs unbiased variance** in LayerNorm (use the biased one, as PyTorch does).
- **Layouts**: interleaved RoPE pairs vs Hugging Face's \`rotate_half\`; \`np.repeat\` vs \`np.tile\` when sharing KV heads. Both give plausible-looking but wrong numbers.

## Interview angle
- Why scale by \`sqrt(d_k)\`? Why LayerNorm rather than BatchNorm?
- Complexity: attention is \`O(n^2 · d)\` time and \`O(n^2)\` memory per head; the MLP is \`O(n · d^2)\`. Which dominates at 128k context?
- Parameter count of one block: about \`4 d^2\` (attention) + \`8 d^2\` (a \`4d\`-wide MLP) = \`12 d^2\`.
- How do RoPE and GQA reduce the cost of serving long contexts? Derive the backward pass of attention.

## Problems in this section
1. **Scaled Dot-Product Attention**: the core \`softmax(QK^T / sqrt(d_k)) V\`, returning output and weights.
2. **Multi-Head Attention**: split into heads, attend in parallel, merge back.
3. **Sinusoidal Positional Encoding**: the original fixed position table.
4. **Layer Normalization**: per-token normalization with \`gamma\` and \`beta\`.
5. **Causal Attention Mask**: the \`-inf\` upper triangle that makes a model autoregressive.
6. **BPE Tokenization**: learn merge rules, the first stage of the pipeline.
7. **Rotary Positional Embeddings (RoPE)**: relative positions by rotating \`q\` and \`k\`.
8. **Grouped Query Attention (GQA)**: share K/V heads to shrink the KV cache.
9. **Sliding Window Attention**: a banded causal mask for long contexts.
10. **Attention Backward Pass**: \`dQ\`, \`dK\`, \`dV\` by hand, checked against finite differences.
11. **Greedy Longest-Match Tokenizer**: encode text with a fixed vocabulary (WordPiece style).

**Where this leads.** **LLM Generation & Decoding** turns logits into text and adds the KV cache; **LLM Internals** swaps in RMSNorm + SwiGLU, FlashAttention's online softmax, mixture-of-experts and perplexity; **Representation Learning & Retrieval** uses the embeddings for search and RAG. The capstones assemble everything: **E2E: Transformer Encoder** (one encoder block), **Mini GPT** (a full decoder-only LM with training and generation) and **Transformer Bug Hunt** (find the four bugs in a broken mini-GPT).
    `,
    problems: ['scaled-dot-product-attention', 'multi-head-attention', 'positional-encoding', 'layer-norm', 'causal-mask', 'bpe-tokenization', 'rope-embeddings', 'grouped-query-attention', 'sliding-window-attention', 'attention-backward', 'longest-match-tokenizer'],
  },
  {
    id: 'llm-generation',
    title: 'LLM Generation & Decoding',
    description: 'Turn logits into text: temperature, top-k and nucleus sampling, repetition penalty, the KV cache, beam search and speculative decoding.',
    icon: '💬',
    introduction: `
# LLM Generation & Decoding

## Why it matters
A trained LLM only outputs a distribution over the next token. Everything users see (how creative, repetitive or fast the model is) is decided by the decoding loop around it. Interviews for LLM roles routinely ask you to implement sampling, explain the KV cache, and reason about why decoding is memory-bound.

## Where decoding sits in the pipeline
The **Transformer Architecture** section builds the model up to the logits. This section is the loop that turns logits into text:

\`\`\`text
prompt ──tokenize──> ids (1, T)
       ──prefill───> run all T tokens in parallel, fill the KV cache, logits for the last position
loop:  logits (vocab,) ──repetition penalty──> ──/ temperature──> ──top-k / top-p filter──>
       probs ──sample (or argmax, or beam search)──> next id
       ──decode step──> run ONE new token, reading the KV cache; append k, v
until EOS or max_new_tokens
\`\`\`

Prefill is compute-bound (big matrix multiplies over the prompt). Each decode step processes a single token but must read every weight and the whole KV cache, so it is **memory-bandwidth-bound**. KV caching, grouped-query attention and speculative decoding all attack that cost.

## Core ideas

**From logits to a choice.** With logits \`z\` of shape \`(vocab_size,)\`:

| Step | Formula | Effect |
|------|---------|--------|
| Repetition penalty | \`z_t / penalty\` if \`z_t > 0\` else \`z_t * penalty\`, for generated \`t\` | discourages loops |
| Temperature | \`p = softmax(z / T)\` | \`T < 1\` sharper, \`T > 1\` flatter, ranking unchanged |
| Top-k | keep the \`k\` largest logits | fixed-size candidate set |
| Top-p (nucleus) | keep the smallest prefix with cumulative probability \`>= p\` | adaptive candidate set |
| Greedy / beam | \`argmax\`, or keep the \`B\` best partial sequences | deterministic, used for "one right answer" tasks |

**KV cache.** Keys and values of past tokens never change under causal attention, so each step projects only the new token and attends over the cached \`K, V\`. Cache size: \`2 · n_layers · n_kv_heads · d_head · seq_len\` values per sequence.

**Speculative decoding.** A small draft model proposes \`K\` tokens; the target model scores all of them in one pass; token \`i\` is accepted with probability \`min(1, p_target / p_draft)\`, and the first rejection ends the draft. With residual resampling, the output follows the target distribution exactly.

## Worked micro-example
Logits \`z = [2.0, 1.0, 0.1]\`:

\`\`\`text
T = 1.0 : softmax(z)      = [0.659,  0.2424, 0.0986]
T = 0.5 : softmax(z / .5) = [0.8638, 0.1169, 0.0193]     sharper
T = 2.0 : softmax(z / 2)  = [0.5017, 0.3043, 0.194 ]     flatter
top-k, k = 2 (T = 1)      = [0.7311, 0.2689, 0.0   ]     softmax of [2, 1]
top-p, p = 0.8 (T = 1)    : cumulative [0.659, 0.9014, 1.0] reaches 0.8 at token 1
                          = [0.7311, 0.2689, 0.0   ]     same two tokens here
\`\`\`

## Common pitfalls
- **Overflow**: subtract the max before \`exp\`, especially after dividing by a small temperature.
- **Top-p off-by-one**: include the token that crosses \`p\`, or a confident distribution keeps nothing.
- **Order of operations**: temperature before top-k/top-p; filter logits with \`-inf\`, then softmax (or renormalize after zeroing).
- **Repetition penalty sign**: dividing a negative logit makes the token *more* likely; and each distinct token is penalized once.
- **Beam search underflow**: add log-probabilities; never multiply raw probabilities over long sequences.
- **Reproducibility**: seed once, then draw random numbers in a fixed order (the sampling problems here seed inside the function).

## Interview angle
- Compare greedy, beam search, top-k, top-p. When would you use each?
- Why is decoding memory-bound, and how do KV caching, GQA, quantization and batching help? Estimate the KV cache of a 7B model at 4k tokens.
- Walk through speculative decoding and argue why it preserves the target distribution; what acceptance rate makes it worthwhile?
- Complexity per generated token: \`O(t · d)\` attention with a cache vs \`O(t^2 · d)\` without.

## Problems in this section
1. **Temperature Scaling**: \`softmax(logits / T)\`, stably.
2. **Top-k Sampling**: keep the \`k\` best tokens, renormalize, sample.
3. **Nucleus (Top-p) Sampling**: keep the smallest prefix with mass \`>= p\`.
4. **Repetition Penalty**: the CTRL / Hugging Face penalty on already-generated tokens.
5. **KV Cache for Efficient Generation**: one cached decoding step of attention.
6. **Beam Search Decoding**: keep the \`B\` best hypotheses, with EOS handling.
7. **Speculative Decoding**: the draft-then-verify acceptance loop.

**Related problems.** The logits come from the decoder built in **Transformer Architecture** (causal mask, GQA, RoPE) and measured by **Token Cross-Entropy and Perplexity** in **LLM Internals**, where **Online Softmax** shows how attention itself is made memory-efficient. **Mini GPT** (E2E Implementations) uses greedy generation with context cropping; try swapping in your top-p sampler. **Transformer Bug Hunt** checks the causal masking that makes cached decoding valid.
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
    description: 'How production LLMs are built and measured: RMSNorm + SwiGLU blocks, FlashAttention\'s online softmax, mixture-of-experts routing and perplexity.',
    icon: '🧩',
    introduction: `
# LLM Internals

## Why it matters
You know how a Transformer block works. This section is about what changes when that block becomes a **production LLM**: the exact layers modern models use, how attention is made to fit long contexts, how sparse models scale, and how a language model is measured. LLM engineering interviews probe exactly these details, usually as "why" questions after you've written the code.

## How an LLM works, end to end
Each stage has a problem somewhere on this site:

\`\`\`text
text -> tokenizer -> ids (B, T)                       BPE, longest match       (Transformer Architecture)
     -> embedding lookup -> h (B, T, d_model)
     -> N x decoder block:
          h = h + Attention(RMSNorm(h))               causal, RoPE, GQA        (Transformer Architecture)
                                                      computed with the online softmax (this section)
          h = h + FFN(RMSNorm(h))                     SwiGLU MLP or a mixture of experts (this section)
     -> final RMSNorm -> LM head -> logits (B, T, vocab)
     -> training: next-token cross-entropy / perplexity (this section)
     -> inference: KV cache + sampling, one token at a time (LLM Generation & Decoding)
\`\`\`

Training runs the whole sequence at once and is compute-bound. Inference runs one token at a time, so **memory bandwidth** and **cache size** dominate, not FLOPs.

## Core ideas

| Technique | Problem it solves | Axis |
|-----------|-------------------|------|
| SwiGLU FFN + RMSNorm | Better quality per parameter than a ReLU MLP; cheaper normalization than LayerNorm | Quality |
| Online softmax (FlashAttention) | The \`(T, T)\` score matrix doesn't fit in fast memory for long sequences | Memory traffic |
| Mixture of experts | More parameters without more compute per token | Compute |
| Cross-entropy / perplexity | One number to train on and to compare models with | Evaluation |

**SwiGLU and RMSNorm** (LLaMA):

\`\`\`text
rms_norm(x) = x / sqrt(mean(x^2) + eps) * w
ffn(x)      = (silu(x W_gate) * (x W_up)) W_down,     silu(z) = z * sigmoid(z)
\`\`\`

**Online softmax**: stream over key blocks with a running max \`m\`, normalizer \`l\` and output \`acc\`:

\`\`\`text
m' = max(m, rowmax(S_b))
l  = l * exp(m - m') + rowsum(exp(S_b - m'))
acc = acc * exp(m - m') + exp(S_b - m') @ V_b          output = acc / l
\`\`\`

**MoE routing** (top-k gates, Switch Transformer load-balancing loss):

\`\`\`text
gates    = softmax(top-k router logits)
y        = sum_j gates_j * expert_{i_j}(x)
aux_loss = E * sum_e f_e * P_e      (f_e: fraction of routing slots, P_e: mean router probability)
\`\`\`

**Perplexity**:

\`\`\`text
mean_nll   = -(1 / N) * sum_t log p(x_t | x_<t)        padding masked out
perplexity = exp(mean_nll)                             uniform over V tokens -> V
\`\`\`

## Worked micro-example
Online softmax of \`x = [0, 1, 5, 2, 9]\` with blocks of 2:

\`\`\`text
block [0, 1]: m = 1, l = e^-1 + e^0                   = 1.3679
block [5, 2]: m = 5, l = 1.3679 * e^-4 + e^0 + e^-3   = 1.0748   (old sum rescaled by e^(1-5))
block [9]   : m = 9, l = 1.0748 * e^-4 + e^0          = 1.0197
softmax(x)  = exp(x - 9) / 1.0197 = [0.0001, 0.0003, 0.018, 0.0009, 0.9807]
\`\`\`

The same numbers come out of a two-pass softmax; the online version never needed the global max up front. FlashAttention does this for every query row, with \`acc\` carrying the weighted values.

## Common pitfalls
- **RMSNorm is not LayerNorm**: no mean subtraction and no bias; the residual adds the un-normalized input.
- **Online softmax**: forgetting to rescale \`acc\` (not just \`l\`) when the max changes, or dividing by \`l\` inside the loop.
- **MoE**: computing \`f\` from gates instead of routing counts, using the renormalized top-k gates for \`P\`, or running every expert on every token.
- **Perplexity**: dividing by the number of positions instead of the number of real tokens; comparing perplexities across different tokenizers.
- **Overflow** everywhere: log-softmax and attention need the max subtracted.

## Interview angle
- Why does SwiGLU use \`d_ff ≈ (8/3) d_model\` instead of \`4 d_model\`?
- Why is FlashAttention exact, and what does it save? (Memory traffic and \`O(T^2)\` memory, not FLOPs.)
- What goes wrong in an MoE without the auxiliary loss (expert collapse)? How do capacity factors drop tokens? Total vs active parameters of Mixtral 8x7B (about 47B vs 13B).
- Why must perplexity exclude padding, and why is it only comparable between models with the same tokenizer?

## Problems in this section
1. **SwiGLU Feed-Forward Block (LLaMA MLP)**: RMSNorm, the gated MLP and the residual.
2. **Online Softmax (the FlashAttention Trick)**: streaming softmax and block-wise exact attention.
3. **Mixture-of-Experts Routing**: top-k routing, dispatch/combine and the load-balancing loss.
4. **Token Cross-Entropy and Perplexity**: the LM loss with a padding mask.

**Related problems.** The attention half of the LLaMA block (RoPE, GQA, causal mask) is in **Transformer Architecture**, along with **Attention Backward Pass**, whose \`rowsum(dP * P)\` term FlashAttention's backward pass also needs. Decoding and the KV cache are in **LLM Generation & Decoding**. **Masked Cross-Entropy with Label Smoothing** (Neural Networks) is a close cousin of the perplexity problem. Then assemble a full model in **Mini GPT**, debug one in **Transformer Bug Hunt**, and compare with the post-norm encoder in **E2E: Transformer Encoder** (all in E2E Implementations).
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
