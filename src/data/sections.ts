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
