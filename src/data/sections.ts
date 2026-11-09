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
    description: 'From returns and Bellman backups through Q-learning, policy gradients, GAE and PPO to the reward-model, KL and DPO losses used to align LLMs.',
    icon: '🎮',
    introduction: `
# Reinforcement Learning

## Why it matters
Reinforcement learning (RL) trains an agent by trial and error to maximize reward instead of imitating labels. It powers game-playing agents, robotics, recommendation and, most visibly today, the post-training of LLMs (RLHF, DPO, GRPO). Interviews test both layers: the tabular basics (Bellman equations, Q-learning vs SARSA) and the policy-gradient machinery behind PPO and RLHF.

## Core ideas
An agent in state \`s\` picks action \`a\` from its policy \`π(a|s)\`, receives reward \`r\` and lands in \`s'\`. It wants to maximize the **discounted return**:

\`\`\`text
G_t = r_t + γ·r_{t+1} + γ²·r_{t+2} + ...  =  r_t + γ·G_{t+1}        (0 ≤ γ ≤ 1)
\`\`\`

**Value functions** predict that return: \`V(s)\` from a state, \`Q(s, a)\` after taking \`a\`. They satisfy the Bellman equations:

\`\`\`text
V(s)    = E[ r + γ·V(s') ]                      expectation: evaluate a policy
Q*(s,a) = E[ r + γ·max_a' Q*(s', a') ]          optimality: find the best policy
\`\`\`

Most algorithms solve these equations, exactly or from samples:

| Family | Learns | Update target | Examples |
|---|---|---|---|
| Dynamic programming | V with a known model | full expectation over s' | value iteration |
| TD, value-based | V or Q from samples | r + γ·(estimate at s') | TD(0), SARSA, Q-learning, DQN |
| Policy gradient | the policy π_θ directly | return or advantage × ∇ log π | REINFORCE, PPO |
| Actor-critic | π_θ and a critic V | advantage A = Q - V, e.g. from GAE | A2C, PPO with GAE |

Key distinctions:
- **On-policy vs off-policy.** SARSA bootstraps from the next action it actually takes (on-policy). Q-learning bootstraps from the greedy action whatever it does next (off-policy).
- **Bias vs variance.** Monte Carlo returns are unbiased but noisy. TD targets use the critic's estimate: biased, but low variance. n-step returns and GAE's λ interpolate between the two.
- **Exploration.** ε-greedy acts randomly with probability ε so that better actions can still be found.
- **Policy gradient.** \`∇J = E[ A_t · ∇ log π(a_t|s_t) ]\`. PPO clips the ratio \`π_θ / π_old\` to \`[1-ε, 1+ε]\` so that several gradient steps on one batch stay safe.

## RL for language models
For an LLM, the state is the prompt plus the tokens so far, an action is the next token, and the reward usually comes once per response.
- **Reward model:** learn a scalar score from human preference pairs with the Bradley–Terry loss \`-log σ(r_chosen - r_rejected)\`.
- **KL penalty:** keep π_θ close to the frozen reference model, \`reward - β·KL(π_θ ‖ π_ref)\`, so it doesn't reward-hack.
- **PPO-RLHF:** the clipped surrogate, with the KL folded into the reward.
- **DPO:** skip the reward model and the RL loop: \`-log σ(β·(Δ_chosen - Δ_rejected))\` on policy-vs-reference log-ratios.

## Worked micro-example
Discounted return of rewards \`[1, 1, 1, 1]\` with γ = 0.9:

\`\`\`text
G_0 = 1 + 0.9 + 0.81 + 0.729 = 3.439
\`\`\`

One Q-learning step with \`Q(s, a) = 1\`, \`r = 5\`, \`Q(s', ·) = [3, 4]\`, γ = 0.9, α = 0.5:

\`\`\`text
target  = 5 + 0.9 · max(3, 4) = 8.6
δ       = 8.6 - 1 = 7.6
Q(s, a) = 1 + 0.5 · 7.6 = 4.8
\`\`\`

SARSA with next action \`a' = 0\` uses \`Q(s', 0) = 3\` instead: target 7.7, new value 4.35.

## Common pitfalls
- **Terminal states:** a terminal next state has value 0, so don't bootstrap through \`done\`. A truncated (time-limit) episode is different: it still bootstraps from \`V(s_T)\`.
- **Off-by-one in returns:** the first reward has discount γ⁰; \`values\` for GAE has length T + 1.
- **In-place updates:** a synchronous value-iteration sweep reads the old V only. Copy Q-tables instead of mutating the caller's array.
- **Wrong sign:** policy gradients and PPO objectives are maximized; the training loss is their negative.
- **Unstable log-sigmoid:** \`log(sigmoid(x))\` underflows and \`log(p + 1e-10)\` caps the loss. Use \`-logaddexp(0, -x)\` (NumPy) or \`F.logsigmoid\` (PyTorch).
- **Double-counting KL:** in PPO-RLHF, put the KL either in the reward or in the loss, never both.

## Interview angle
Expect to derive the Q-learning and SARSA updates, explain why Q-learning overestimates (the max of noisy estimates; Double DQN fixes it) and contrast on- and off-policy learning. For policy gradients: derive \`∇ log π\` for a softmax, say why a baseline reduces variance without adding bias, and walk through how PPO's min and clip behave for positive and negative advantages. For RLHF: why the KL penalty is there, how DPO's implicit reward \`β·log(π_θ/π_ref)\` arises, and what changes in GRPO. Complexity: a value-iteration sweep is O(|S|²·|A|); a TD update is O(1) and GAE is O(T) per trajectory.

## Problems in this section
1. **Discounted Return**: vectorized G_0 with a discount vector.
2. **Epsilon-Greedy Policy**: explore or exploit, with deterministic tie-breaking.
3. **Bellman Expectation (State Value)**: a one-state expected backup.
4. **Q-Learning Update**: off-policy TD control with a max over next actions.
5. **SARSA Update**: on-policy TD control with the action actually taken.
6. **TD(0) Value Prediction**: bootstrapped value learning with terminal handling.
7. **Value Iteration Step**: a synchronous Bellman optimality sweep over a known MDP.
8. **N-Step Return**: n real rewards plus a bootstrap, with truncation.
9. **REINFORCE Policy Gradient**: the Monte Carlo policy gradient for a softmax policy.
10. **Advantage Estimation (GAE)**: the backward GAE(γ, λ) recursion.
11. **PPO Clipped Objective**: the clipped surrogate.
12. **RLHF Reward Model Loss**: the Bradley–Terry pairwise loss, computed stably.
13. **Direct Preference Optimization (DPO)**: preference learning without a reward model.
14. **KL Divergence Penalty (RLHF)**: the sampled k1 KL estimate.
15. **PPO-RLHF Objective**: the clipped surrogate with a KL-shaped reward.

Next, **Post-training & Efficiency** builds GRPO (PPO without a critic, with a k3 KL term) and int8 quantization. Softmax and cross-entropy, which policy gradients rely on, are practiced in **Neural Networks**.
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
    description: 'GRPO with group-relative advantages and a k3 KL penalty, plus int8 absmax quantization: making a base model useful and cheap to serve.',
    icon: '🎯',
    introduction: `
# Post-training & Efficiency

## Why it matters
A pretrained language model predicts text. **Post-training** turns it into an assistant that follows instructions, reasons and reflects human preferences, and **efficiency** techniques make it affordable to fine-tune and serve. Labs ask about both: how GRPO and DPO differ from PPO-RLHF, and how quantization trades accuracy for memory.

## Core ideas: preference and reward optimization
| Method | Idea | Objective (maximize) or loss (minimize) | Practiced in |
|---|---|---|---|
| Reward model | Score responses, trained on human preference pairs (Bradley–Terry) | loss \`-log σ(r_chosen - r_rejected)\` | Reinforcement Learning |
| PPO-RLHF | Maximize reward with PPO; a KL term keeps π_θ near the reference model | clipped surrogate with \`A = r - β·KL\` | Reinforcement Learning |
| DPO | No reward model and no sampling: optimize preferences through log-ratios | loss \`-log σ(β·(Δ_chosen - Δ_rejected))\` | Reinforcement Learning |
| GRPO | PPO without a value network: the group of samples for a prompt is the baseline | clipped surrogate with \`A = (r - mean) / std\`, minus \`β·KL_k3\` | this section |

**Why a KL term?** Without it the policy drifts toward outputs that fool the reward model ("reward hacking") and forgets how to write fluent text. The KL is estimated from the sampled tokens' log-probs, with \`kl_t = log π_θ(y_t) - log π_ref(y_t)\`:

| Estimator | Per token | Unbiased | Always ≥ 0 | Used by |
|---|---|---|---|---|
| k1 | \`kl_t\` | yes | no | InstructGPT-style KL-shaped reward |
| k3 | \`exp(-kl_t) + kl_t - 1\` | yes | yes | GRPO |

**GRPO and verifiable rewards.** GRPO (DeepSeekMath, 2024) is popular for reasoning models trained on **verifiable** rewards: an answer checker or unit tests give 1 for correct and 0 for wrong. For each prompt, sample G responses. The group mean replaces the critic, and dividing by the group std puts the advantages on a common scale. A prompt where every sample gets the same reward has zero advantage everywhere, so it contributes no gradient.

## Core ideas: efficiency
Training and serving large models is dominated by memory. LoRA trains a small low-rank update instead of the full weights, and quantization stores weights in fewer bits.

| Technique | Idea | Saves |
|---|---|---|
| LoRA | \`W + (α/r)·A·B\` with rank r ≪ d; only A and B are trained | optimizer state and gradients for the frozen W |
| Int8 absmax quantization | \`scale = max abs(w) / 127\`, store \`round(w / scale)\` as int8, one scale per output row | 4× weight memory vs float32, fast int8 matmuls |

One scale per output channel (row) limits the damage from outliers. A single huge weight only coarsens its own row.

## Worked micro-example
**GRPO advantages.** Four samples for one prompt, verifier rewards \`[1, 0, 0, 1]\`: mean 0.5, population std 0.5, so the advantages are \`[+1, -1, -1, +1]\`. With rewards \`[1, 0, 0, 0]\` (std 0.433), the one correct answer gets \`+1.732\` and each wrong one \`-0.577\`. A rare success earns a larger push.

**Int8 absmax.** Row \`[0.7, -1.2, 0.3]\`:

\`\`\`text
scale = 1.2 / 127 = 0.009449
w_q   = round([0.7, -1.2, 0.3] / scale) = [74, -127, 32]
w_hat = w_q · scale = [0.6992, -1.2, 0.3024]      max error 0.0024 ≤ scale / 2
\`\`\`

Quantize \`[[0.01, -0.02, 0.013], [5.0, -3.0, 1.7]]\` with a **single** scale (5 / 127) and the first row becomes \`[0, -1, 0]\`: it is almost erased. Per-row scales keep it.

## Common pitfalls
- **GRPO std:** use the population std (\`ddof=0\`, PyTorch \`unbiased=False\`) and add eps, so identical rewards give 0 instead of NaN.
- **Masking:** average token terms over real tokens only. Padding must not dilute a response's mean.
- **KL counted twice:** in PPO-RLHF the KL goes either into the reward or into the loss, never both.
- **Sign conventions:** objectives J are maximized; report and minimize \`loss = -J\`.
- **Quantization:** clip to [-127, 127] and guard all-zero rows (\`max(absmax, 1e-8)\`). Accumulate int8 products in int32, or they overflow.

## Interview angle
- Why does GRPO not need a critic, and what does it cost? (G samples per prompt; variance from small groups.)
- What does the per-response 1/|o_i| normalization do to long vs short answers? (Dr. GRPO argues it biases length.)
- Compare DPO, which is offline, with PPO and GRPO, which are online and sample from the current policy.
- When does per-channel quantization beat per-tensor, and why do activation outliers (LLM.int8()) need special handling?
- Complexity: an int8 matmul costs the same O(n·d_in·d_out) as float, but moves 4× fewer weight bytes. On memory-bound decoding, that is where the speedup comes from.

## Problems in this section
1. **GRPO: Group-Relative Advantages & Objective**: group-normalized advantages, then the clipped, masked, k3-penalized GRPO objective.
2. **Int8 Weight Quantization (absmax)**: per-channel and per-tensor quantization, dequantization and an int8 matmul with int32 accumulation.

The reward-model loss, the KL penalty, the PPO-RLHF objective and DPO are practiced in **Reinforcement Learning** (start with **PPO Clipped Objective** and **KL Divergence Penalty (RLHF)**, which GRPO builds on). The LoRA adapter is in **PyTorch Basics**.
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
