const b=[{id:"numpy-fundamentals",title:"NumPy Fundamentals",description:"Master NumPy array operations essential for ML development.",icon:"🔢",introduction:"\n# NumPy Fundamentals\n\nNumPy is the backbone of scientific computing in Python. Every ML library builds on it.\n\n## Key Concepts\n\n### Array Creation\n- `np.array()`: Create from lists\n- `np.zeros()`, `np.ones()`: Initialize with values\n- `np.arange()`, `np.linspace()`: Numeric ranges\n- `np.eye()`: Identity matrix\n\n### Indexing & Slicing\n- Basic: `arr[0]`, `arr[1:5]`\n- Advanced: `arr[[0, 2, 4]]`, `arr[arr > 0]`\n- Multi-dimensional: `arr[1, :]`, `arr[:, 2:4]`\n\n### Broadcasting\nArrays of different shapes can be combined:\n- (3, 4) + (4,) → broadcasts to (3, 4)\n- (3, 1) * (1, 4) → broadcasts to (3, 4)\n\n### Aggregations\n- `sum()`, `mean()`, `std()` - with axis parameter\n- `argmax()`, `argmin()` - find indices\n\n### Shape Manipulation\n- `reshape()`: Change dimensions\n- `transpose()`, `.T`: Swap axes\n- `flatten()`, `ravel()`: To 1D\n\nMaster these operations to write efficient ML code!\n    ",problems:["numpy-array-creation","numpy-indexing","numpy-broadcasting","numpy-aggregations","numpy-reshape-transpose"]},{id:"python-basics",title:"Python Basics for ML",description:"Master NumPy arrays and essential Python operations for machine learning.",icon:"🐍",introduction:"\n# Python Basics for Machine Learning\n\nNumPy is the foundation of nearly all machine learning in Python. Before diving into complex algorithms, you need to master array operations.\n\n## Key Concepts\n\n### NumPy Arrays\n- **Creation**: `np.array()`, `np.zeros()`, `np.ones()`, `np.arange()`\n- **Shape manipulation**: `reshape()`, `flatten()`, `transpose()`\n- **Indexing**: Slicing, boolean indexing, fancy indexing\n\n### Essential Operations\n- **Element-wise**: Addition, multiplication, mathematical functions\n- **Aggregations**: `sum()`, `mean()`, `std()`, `min()`, `max()`\n- **Broadcasting**: Automatic expansion of arrays for operations\n\n### Why It Matters\nEvery ML algorithm processes data as arrays. Understanding these operations lets you:\n- Prepare data efficiently\n- Debug model issues\n- Optimize performance\n\nLet's practice with hands-on problems!\n    ",problems:["numpy-array-sum","numpy-matrix-multiply","numpy-broadcast-add"]},{id:"einsum",title:"Einstein Summation (Einsum)",description:"Master einsum for elegant tensor operations.",icon:"∑",introduction:`
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
    `,problems:["einsum-basics","einsum-matrix-ops","einsum-batch-ops","einsum-advanced","einsum-vs-matmul"]},{id:"pytorch-basics",title:"PyTorch Basics",description:"Learn PyTorch patterns implemented in NumPy.",icon:"🔥",introduction:`
# PyTorch Basics

Learn PyTorch patterns and concepts. Since Pyodide doesn't support PyTorch, we implement these concepts in NumPy.

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

We implement this manually to understand the math.

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

Learn these patterns to understand PyTorch!
    `,problems:["tensor-creation","tensor-operations","autograd-concepts","nn-modules","loss-functions","gelu-activation","leaky-relu-swish","softmax-temperature","rmsnorm","group-norm","adam-optimizer","sgd-momentum","lr-scheduling","gradient-accumulation","instance-norm","vit-patch-embeddings","cross-attention","depthwise-separable-conv","label-smoothing","lora-adapter","gradient-checkpointing"]},{id:"data-preprocessing",title:"Data Preprocessing",description:"Learn essential data cleaning and transformation techniques.",icon:"🧹",introduction:`
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

### Why It Matters
Garbage in, garbage out. Proper preprocessing can:
- Improve model accuracy by 10-30%
- Prevent training failures
- Reduce overfitting

Let's practice these essential skills!
    `,problems:["normalize-features","handle-missing-data","one-hot-encode"]},{id:"supervised-learning",title:"Supervised Learning",description:"Implement core supervised learning algorithms from scratch.",icon:"📊",introduction:`
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

### The Interview Perspective
Interviewers often ask you to:
- Implement gradient descent from scratch
- Explain the math behind these algorithms
- Compute and interpret hinge loss
- Discuss trade-offs between algorithms

Let's build these algorithms!
    `,problems:["logistic-regression","binary-cross-entropy","hinge-loss","decision-tree-split","linear-regression-gd","logistic-regression-full","linear-svm"]},{id:"unsupervised-learning",title:"Unsupervised Learning",description:"Implement clustering and dimensionality reduction algorithms.",icon:"🔍",introduction:`
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

### Why These Matter
- **K-Means**: Customer segmentation, image compression
- **PCA**: Feature reduction, visualization, noise removal

### Interview Tips
- Be ready to implement K-means from scratch
- Explain variance explained by components
- Discuss limitations (K-means assumes spherical clusters)

Let's implement these algorithms!
    `,problems:["kmeans-clustering","pca-implementation"]},{id:"model-evaluation",title:"Model Evaluation",description:"Learn metrics and techniques to evaluate ML models properly.",icon:"📈",introduction:`
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

### Interview Essentials
- Know when to use each metric
- Implement cross-validation from scratch
- Discuss precision-recall trade-offs

Let's practice evaluation!
    `,problems:["precision-recall-f1","cross-validation","confusion-matrix"]},{id:"deep-learning",title:"Deep Learning Basics",description:"Activation functions and fundamental building blocks.",icon:"⚡",introduction:`
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
    `,problems:["perceptron","neural-network-forward","backpropagation"]},{id:"neural-networks",title:"Neural Networks",description:"Build neural networks from scratch with forward and backward passes.",icon:"🧠",introduction:`
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
    `,problems:["cross-entropy-loss","mlp-forward-backward","weight-init","batch-norm","dropout"]},{id:"cnn",title:"CNNs & Computer Vision",description:"Implement convolutions, pooling, object detection, and segmentation.",icon:"🖼️",introduction:`
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
    `,problems:["conv-output-size","conv2d-forward","max-pool","flatten-layer","conv2d-advanced","iou-bounding-box","nms","focal-loss","smooth-l1-loss","seg-metrics"]},{id:"transformers",title:"Transformer Architecture",description:"Master attention, positional encoding, and modern LLM architecture.",icon:"🤖",introduction:`
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
    `,problems:["scaled-dot-product-attention","multi-head-attention","positional-encoding","layer-norm","causal-mask","bpe-tokenization","rope-embeddings","grouped-query-attention","sliding-window-attention"]},{id:"llm-generation",title:"LLM Generation & Decoding",description:"Master decoding strategies: temperature, sampling, KV cache, beam search, and speculative decoding.",icon:"💬",introduction:`
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
    `,problems:["llm-temperature-scaling","llm-top-k-sampling","llm-top-p-sampling","llm-repetition-penalty","llm-kv-cache","llm-beam-search","llm-speculative-decoding"]},{id:"generative-models",title:"Generative Models",description:"Learn VAEs, diffusion models, and generative AI fundamentals.",icon:"🎨",introduction:`
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

Let's implement generative models!
    `,problems:["kl-divergence","vae-reparameterization","vae-loss","vqvae-quantization","diffusion-noise-schedule","diffusion-forward"]},{id:"reinforcement-learning",title:"Reinforcement Learning",description:"Master RL fundamentals from Q-learning to policy gradients.",icon:"🎮",introduction:`
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

### Interview Essentials
- Implement Q-learning and SARSA from scratch
- Explain on-policy vs off-policy
- Understand policy gradients and REINFORCE
- Know GAE and PPO for modern deep RL
- **RLHF**: Reward modeling, KL penalties, DPO

Master these concepts for ML interviews at top companies!
    `,problems:["rl-discounted-return","rl-epsilon-greedy","rl-bellman-value","rl-q-learning-update","rl-sarsa-update","rl-td0-prediction","rl-value-iteration","rl-n-step-return","rl-policy-gradient","rl-advantage-estimation","rl-ppo-clip","rl-reward-modeling","rl-dpo-loss","rl-kl-penalty","rl-ppo-llm-objective"]},{id:"e2e-implementations",title:"End-to-End Implementations",description:"Build complete ML models from scratch.",icon:"🏗️",introduction:`
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

Build these models to truly understand deep learning!
    `,problems:["e2e-mlp","e2e-transformer","e2e-vae","e2e-vqvae","e2e-diffusion","e2e-cnn"]}],a=[{id:"numpy-array-sum",title:"Array Sum",section:"python-basics",difficulty:"easy",description:`
## Array Sum

Given a NumPy array of numbers, implement a function that returns the sum of all elements.

### Function Signature
\`\`\`python
def array_sum(arr: np.ndarray) -> float:
\`\`\`

### Constraints
- Array length: 1 <= n <= 1000
- Element values: -10^6 <= arr[i] <= 10^6
    `,examples:[{input:"np.array([1, 2, 3, 4, 5])",output:"15",explanation:"1 + 2 + 3 + 4 + 5 = 15"},{input:"np.array([-1, 0, 1])",output:"0",explanation:"-1 + 0 + 1 = 0"}],starterCode:`import numpy as np

def array_sum(arr: np.ndarray) -> float:
    """
    Calculate the sum of all elements in a NumPy array.

    Args:
        arr: A NumPy array of numbers

    Returns:
        The sum of all elements
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Basic positive numbers",input:"[1, 2, 3, 4, 5]",expected:"15",hidden:!1},{id:"2",description:"With negatives",input:"[-1, 0, 1]",expected:"0",hidden:!1},{id:"3",description:"Single element",input:"[42]",expected:"42",hidden:!1},{id:"4",description:"Larger array",input:"[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]",expected:"55",hidden:!0}],hints:["NumPy arrays have built-in methods for common operations.","Try using np.sum() or the .sum() method on the array."],solution:`import numpy as np

def array_sum(arr: np.ndarray) -> float:
    """
    Calculate the sum of all elements in a NumPy array.
    """
    return np.sum(arr)
`},{id:"numpy-matrix-multiply",title:"Matrix Multiplication",section:"python-basics",difficulty:"medium",description:`
## Matrix Multiplication

Implement matrix multiplication between two 2D NumPy arrays.

### Function Signature
\`\`\`python
def matrix_multiply(A: np.ndarray, B: np.ndarray) -> np.ndarray:
\`\`\`

### Constraints
- A has shape (m, n)
- B has shape (n, p)
- Result has shape (m, p)
- 1 <= m, n, p <= 100

### Note
You should use NumPy's built-in functions, not manual loops.
    `,examples:[{input:"A = [[1, 2], [3, 4]], B = [[5, 6], [7, 8]]",output:"[[19, 22], [43, 50]]",explanation:"Standard matrix multiplication"}],starterCode:`import numpy as np

def matrix_multiply(A: np.ndarray, B: np.ndarray) -> np.ndarray:
    """
    Multiply two matrices A and B.

    Args:
        A: First matrix of shape (m, n)
        B: Second matrix of shape (n, p)

    Returns:
        Result matrix of shape (m, p)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"2x2 matrices",input:"([[1, 2], [3, 4]], [[5, 6], [7, 8]])",expected:"[[19, 22], [43, 50]]",hidden:!1},{id:"2",description:"Identity multiplication",input:"([[1, 0], [0, 1]], [[5, 6], [7, 8]])",expected:"[[5, 6], [7, 8]]",hidden:!1},{id:"3",description:"Different dimensions",input:"([[1, 2, 3]], [[1], [2], [3]])",expected:"[[14]]",hidden:!0},{id:"4",description:"Result shape check for non-square",input:"matrix_multiply(np.array([[1, 2, 3]]), np.array([[1, 0], [0, 1], [1, 1]])).tolist()",expected:"[[4, 5]]",hidden:!0}],hints:["NumPy provides several ways to do matrix multiplication.","Try np.dot(), np.matmul(), or the @ operator."],solution:`import numpy as np

def matrix_multiply(A: np.ndarray, B: np.ndarray) -> np.ndarray:
    """
    Multiply two matrices A and B.
    """
    return np.dot(A, B)
    # Alternative: return A @ B
    # Alternative: return np.matmul(A, B)
`},{id:"numpy-broadcast-add",title:"Broadcasting Addition",section:"python-basics",difficulty:"medium",description:`
## Broadcasting Addition

Given a 2D matrix and a 1D vector, add the vector to each row of the matrix using broadcasting.

### Function Signature
\`\`\`python
def broadcast_add(matrix: np.ndarray, vector: np.ndarray) -> np.ndarray:
\`\`\`

### Constraints
- Matrix has shape (m, n)
- Vector has shape (n,)
- 1 <= m, n <= 100

### Note
Broadcasting is a powerful NumPy feature that allows operations between arrays of different shapes.
    `,examples:[{input:"matrix = [[1, 2, 3], [4, 5, 6]], vector = [10, 20, 30]",output:"[[11, 22, 33], [14, 25, 36]]",explanation:"Vector is added to each row"}],starterCode:`import numpy as np

def broadcast_add(matrix: np.ndarray, vector: np.ndarray) -> np.ndarray:
    """
    Add a vector to each row of a matrix using broadcasting.

    Args:
        matrix: 2D array of shape (m, n)
        vector: 1D array of shape (n,)

    Returns:
        Result matrix of shape (m, n)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Basic broadcasting",input:"([[1, 2, 3], [4, 5, 6]], [10, 20, 30])",expected:"[[11, 22, 33], [14, 25, 36]]",hidden:!1},{id:"2",description:"With zeros",input:"([[1, 2], [3, 4]], [0, 0])",expected:"[[1, 2], [3, 4]]",hidden:!1},{id:"3",description:"Negative values",input:"([[1, 2], [3, 4]], [-1, -2])",expected:"[[0, 0], [2, 2]]",hidden:!0},{id:"4",description:"Single row matrix",input:"([[5, 10, 15]], [1, 2, 3])",expected:"[[6, 12, 18]]",hidden:!0}],hints:["NumPy automatically broadcasts the vector across rows.","Simply use the + operator - NumPy handles the rest!"],solution:`import numpy as np

def broadcast_add(matrix: np.ndarray, vector: np.ndarray) -> np.ndarray:
    """
    Add a vector to each row of a matrix using broadcasting.
    """
    return matrix + vector
`}],r=[{id:"normalize-features",title:"Normalize Features",section:"data-preprocessing",difficulty:"easy",description:`
## Normalize Features (Min-Max Scaling)

Implement min-max normalization to scale features to the range [0, 1].

### Formula
\`\`\`
X_normalized = (X - X_min) / (X_max - X_min)
\`\`\`

### Function Signature
\`\`\`python
def normalize(arr: np.ndarray) -> np.ndarray:
\`\`\`

### Constraints
- Input is a 1D array
- Array length: 2 <= n <= 1000
- All elements are finite numbers
    `,examples:[{input:"np.array([1, 2, 3, 4, 5])",output:"[0.0, 0.25, 0.5, 0.75, 1.0]",explanation:"min=1, max=5, so (x-1)/(5-1) gives [0, 0.25, 0.5, 0.75, 1]"}],starterCode:`import numpy as np

def normalize(arr: np.ndarray) -> np.ndarray:
    """
    Apply min-max normalization to scale values to [0, 1].

    Args:
        arr: Input array of numbers

    Returns:
        Normalized array with values in [0, 1]
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Basic normalization",input:"[1, 2, 3, 4, 5]",expected:"[0.0, 0.25, 0.5, 0.75, 1.0]",hidden:!1},{id:"2",description:"With negative values",input:"[-10, 0, 10]",expected:"[0.0, 0.5, 1.0]",hidden:!1},{id:"3",description:"Larger range",input:"[0, 50, 100]",expected:"[0.0, 0.5, 1.0]",hidden:!0},{id:"4",description:"All same values edge case avoided - non-uniform floats",input:"bool(np.allclose(normalize(np.array([10.0, 20.0, 30.0, 40.0])), [0.0, 1/3, 2/3, 1.0]))",expected:"True",hidden:!0}],hints:["Use np.min() and np.max() to find the range.","Apply the formula: (x - min) / (max - min)"],solution:`import numpy as np

def normalize(arr: np.ndarray) -> np.ndarray:
    """
    Apply min-max normalization to scale values to [0, 1].
    """
    arr_min = np.min(arr)
    arr_max = np.max(arr)
    return (arr - arr_min) / (arr_max - arr_min)
`},{id:"handle-missing-data",title:"Handle Missing Data",section:"data-preprocessing",difficulty:"medium",description:`
## Handle Missing Data

Replace NaN (missing) values in an array with the mean of non-NaN values.

### Function Signature
\`\`\`python
def fill_missing_with_mean(arr: np.ndarray) -> np.ndarray:
\`\`\`

### Constraints
- Input is a 1D array
- Array contains at least one non-NaN value
- NaN values are represented as np.nan
    `,examples:[{input:"np.array([1.0, np.nan, 3.0, np.nan, 5.0])",output:"[1.0, 3.0, 3.0, 3.0, 5.0]",explanation:"Mean of [1, 3, 5] is 3, which replaces NaN values"}],starterCode:`import numpy as np

def fill_missing_with_mean(arr: np.ndarray) -> np.ndarray:
    """
    Replace NaN values with the mean of non-NaN values.

    Args:
        arr: Input array that may contain NaN values

    Returns:
        Array with NaN values replaced by the mean
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Basic case",input:'[1.0, float("nan"), 3.0, float("nan"), 5.0]',expected:"[1.0, 3.0, 3.0, 3.0, 5.0]",hidden:!1},{id:"2",description:"Single NaN",input:'[2.0, 4.0, float("nan"), 6.0]',expected:"[2.0, 4.0, 4.0, 6.0]",hidden:!1},{id:"3",description:"NaN at start",input:'[float("nan"), 10.0, 20.0]',expected:"[15.0, 10.0, 20.0]",hidden:!0},{id:"4",description:"Multiple NaNs with one valid value",input:'bool(np.allclose(fill_missing_with_mean(np.array([float("nan"), float("nan"), 7.0])), [7.0, 7.0, 7.0]))',expected:"True",hidden:!0}],hints:["Use np.isnan() to find NaN values.","Use np.nanmean() to compute mean ignoring NaN values.","Use boolean indexing to replace values."],solution:`import numpy as np

def fill_missing_with_mean(arr: np.ndarray) -> np.ndarray:
    """
    Replace NaN values with the mean of non-NaN values.
    """
    arr = arr.copy()  # Don't modify original
    mean_val = np.nanmean(arr)
    arr[np.isnan(arr)] = mean_val
    return arr
`},{id:"one-hot-encode",title:"One-Hot Encoding",section:"data-preprocessing",difficulty:"medium",description:`
## One-Hot Encoding

Convert an array of categorical integers to one-hot encoded format.

### Function Signature
\`\`\`python
def one_hot_encode(labels: np.ndarray, num_classes: int) -> np.ndarray:
\`\`\`

### Example
For labels [0, 1, 2] with 3 classes:
\`\`\`
[[1, 0, 0],
 [0, 1, 0],
 [0, 0, 1]]
\`\`\`

### Constraints
- Labels are integers in range [0, num_classes - 1]
- 1 <= num_classes <= 100
    `,examples:[{input:"labels = [0, 1, 2, 1], num_classes = 3",output:"[[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 1, 0]]",explanation:"Each label becomes a row with 1 at the label index"}],starterCode:`import numpy as np

def one_hot_encode(labels: np.ndarray, num_classes: int) -> np.ndarray:
    """
    Convert integer labels to one-hot encoded format.

    Args:
        labels: 1D array of integer labels
        num_classes: Total number of classes

    Returns:
        2D array of shape (len(labels), num_classes)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Basic encoding",input:"([0, 1, 2], 3)",expected:"[[1, 0, 0], [0, 1, 0], [0, 0, 1]]",hidden:!1},{id:"2",description:"Repeated labels",input:"([0, 0, 1, 1], 2)",expected:"[[1, 0], [1, 0], [0, 1], [0, 1]]",hidden:!1},{id:"3",description:"More classes than used",input:"([0, 2], 4)",expected:"[[1, 0, 0, 0], [0, 0, 1, 0]]",hidden:!0},{id:"4",description:"Single label with many classes",input:"one_hot_encode(np.array([3]), 5).tolist()",expected:"[[0, 0, 0, 1, 0]]",hidden:!0}],hints:["Create a zeros matrix of shape (num_samples, num_classes).","Use array indexing to set the appropriate positions to 1.","np.eye() can be useful for creating one-hot encodings."],solution:`import numpy as np

def one_hot_encode(labels: np.ndarray, num_classes: int) -> np.ndarray:
    """
    Convert integer labels to one-hot encoded format.
    """
    # Method 1: Using np.eye
    return np.eye(num_classes)[labels].astype(int)

    # Method 2: Manual approach
    # one_hot = np.zeros((len(labels), num_classes), dtype=int)
    # one_hot[np.arange(len(labels)), labels] = 1
    # return one_hot
`}],i=[{id:"logistic-regression",title:"Sigmoid Function",section:"supervised-learning",difficulty:"easy",description:`
## Sigmoid Function

Implement the sigmoid activation function used in logistic regression.

### Formula
\`\`\`
sigmoid(x) = 1 / (1 + exp(-x))
\`\`\`

### Properties
- Output is always between 0 and 1
- sigmoid(0) = 0.5
- Monotonically increasing

### Function Signature
\`\`\`python
def sigmoid(x: np.ndarray) -> np.ndarray:
\`\`\`
    `,examples:[{input:"np.array([0, 1, -1])",output:"[0.5, 0.731059, 0.268941]",explanation:"sigmoid(0)=0.5, sigmoid(1)≈0.73, sigmoid(-1)≈0.27"}],starterCode:`import numpy as np

def sigmoid(x: np.ndarray) -> np.ndarray:
    """
    Compute the sigmoid activation function.

    Args:
        x: Input array of any shape

    Returns:
        Array of same shape with sigmoid applied element-wise
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Zero input",input:"[0]",expected:"[0.5]",hidden:!1},{id:"2",description:"Positive and negative",input:"bool(np.allclose(sigmoid(np.array([-1, 0, 1])), [0.268941, 0.5, 0.731059], atol=1e-5))",expected:"True",hidden:!1},{id:"3",description:"Large values",input:"bool(np.allclose(sigmoid(np.array([-10, 10])), [4.5e-05, 0.999955], atol=1e-5))",expected:"True",hidden:!0},{id:"4",description:"Symmetry property",input:"bool(np.allclose(sigmoid(np.array([2.0])) + sigmoid(np.array([-2.0])), [1.0]))",expected:"True",hidden:!0}],hints:["Use np.exp() for the exponential function.","The formula is 1 / (1 + exp(-x))"],solution:`import numpy as np

def sigmoid(x: np.ndarray) -> np.ndarray:
    """
    Compute the sigmoid activation function.
    """
    return 1 / (1 + np.exp(-x))
`},{id:"binary-cross-entropy",title:"Binary Cross-Entropy Loss",section:"supervised-learning",difficulty:"easy",description:`
## Binary Cross-Entropy Loss

Implement the binary cross-entropy (log loss) function.

### Formula
\`\`\`
BCE = -1/m * sum(y * log(p) + (1-y) * log(1-p))
\`\`\`

Where:
- y: True labels (0 or 1)
- p: Predicted probabilities
- m: Number of samples

### Numerical Stability
Clip predictions to avoid log(0):
\`\`\`python
p = np.clip(p, 1e-15, 1 - 1e-15)
\`\`\`
    `,examples:[{input:"y = [1, 0, 1], p = [0.9, 0.1, 0.8]",output:"0.1446",explanation:"Low loss for confident correct predictions"}],starterCode:`import numpy as np

def binary_cross_entropy(y_true, y_pred):
    """
    Compute binary cross-entropy loss.

    Args:
        y_true: True labels (0 or 1)
        y_pred: Predicted probabilities

    Returns:
        loss: Scalar BCE loss
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Perfect predictions",input:"([1, 0, 1, 0], [1.0, 0.0, 1.0, 0.0])",expected:"0.0",hidden:!1},{id:"2",description:"Typical case",input:"([1, 0, 1], [0.9, 0.1, 0.8])",expected:"0.1446",hidden:!1},{id:"3",description:"All wrong predictions",input:"([1, 1, 0], [0.1, 0.1, 0.9])",expected:"2.3026",hidden:!0},{id:"4",description:"Uniform predictions (0.5)",input:"([1, 0], [0.5, 0.5])",expected:"0.6931",hidden:!0}],hints:["Clip predictions for numerical stability","Apply the formula element-wise","Take the mean over all samples"],solution:`import numpy as np

def binary_cross_entropy(y_true, y_pred):
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    # Clip for numerical stability
    y_pred = np.clip(y_pred, 1e-15, 1 - 1e-15)

    # BCE formula
    loss = -np.mean(y_true * np.log(y_pred) + (1 - y_true) * np.log(1 - y_pred))

    return round(loss, 4)
`},{id:"hinge-loss",title:"Hinge Loss",section:"supervised-learning",difficulty:"easy",description:`
## Hinge Loss

Implement the hinge loss function used in Support Vector Machines (SVMs).

### Formula
\`\`\`
L = (1/n) * sum(max(0, 1 - y * s))
\`\`\`

Where:
- **y**: True labels in {-1, +1}
- **s**: Raw model scores (not probabilities)
- **n**: Number of samples

### Properties
- Loss is **0** when the prediction has the correct sign AND confidence margin >= 1
- Loss increases linearly when the prediction is wrong or within the margin
- Unlike cross-entropy, hinge loss encourages a "margin" of separation between classes

### Function Signature
\`\`\`python
def hinge_loss(y_true: np.ndarray, scores: np.ndarray) -> float:
\`\`\`

Returns the mean hinge loss rounded to 4 decimal places.
    `,examples:[{input:"y_true = [1, -1, 1], scores = [0.5, -0.8, 1.5]",output:"0.2333",explanation:"Margins: [0.5, 0.2, -0.5] → losses: [0.5, 0.2, 0.0] → mean = 0.2333"},{input:"y_true = [1, -1], scores = [2.0, -3.0]",output:"0.0",explanation:"Both predictions correct with margin >= 1, so zero loss"}],starterCode:`import numpy as np

def hinge_loss(y_true, scores):
    """
    Compute the mean hinge loss.

    Args:
        y_true: True labels in {-1, +1}, shape (n,)
        scores: Raw model scores, shape (n,)

    Returns:
        Mean hinge loss (float, rounded to 4 decimals)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Perfect predictions with large margin",input:"([1, -1], [2.0, -3.0])",expected:"0.0",hidden:!1},{id:"2",description:"Partial margin violations",input:"([1, -1, 1], [0.5, -0.8, 1.5])",expected:"0.2333",hidden:!1},{id:"3",description:"All misclassified",input:"([1, 1], [-1.0, -2.0])",expected:"2.5",hidden:!1},{id:"4",description:"On the decision boundary (margin = 1)",input:"([1, -1], [1.0, -1.0])",expected:"0.0",hidden:!0}],hints:["Compute element-wise margins: y_true * scores","Apply max(0, 1 - margin) using np.maximum","Return the mean of the losses, rounded to 4 decimals"],solution:`import numpy as np

def hinge_loss(y_true, scores):
    """
    Compute the mean hinge loss.
    """
    y_true = np.array(y_true, dtype=float)
    scores = np.array(scores, dtype=float)

    # Compute hinge loss for each sample
    losses = np.maximum(0, 1 - y_true * scores)

    return round(float(np.mean(losses)), 4)
`},{id:"decision-tree-split",title:"Gini Impurity",section:"supervised-learning",difficulty:"medium",description:`
## Gini Impurity

Calculate the Gini impurity for a set of labels. This metric is used in decision trees to determine the best split.

### Formula
\`\`\`
Gini = 1 - sum(p_i^2)
\`\`\`

Where p_i is the proportion of class i in the set.

### Properties
- Gini = 0 means pure (all same class)
- Gini = 0.5 means maximum impurity (for binary classification with equal split)

### Function Signature
\`\`\`python
def gini_impurity(labels: np.ndarray) -> float:
\`\`\`
    `,examples:[{input:"np.array([0, 0, 0, 0])",output:"0.0",explanation:"All same class, pure node"},{input:"np.array([0, 0, 1, 1])",output:"0.5",explanation:"Equal split, maximum impurity for binary"}],starterCode:`import numpy as np

def gini_impurity(labels: np.ndarray) -> float:
    """
    Calculate Gini impurity for a set of labels.

    Args:
        labels: Array of class labels (integers)

    Returns:
        Gini impurity value between 0 and 1
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Pure node",input:"[0, 0, 0, 0]",expected:"0.0",hidden:!1},{id:"2",description:"Maximum impurity",input:"[0, 0, 1, 1]",expected:"0.5",hidden:!1},{id:"3",description:"Unequal split",input:"[0, 0, 0, 1]",expected:"0.375",hidden:!0},{id:"4",description:"Three classes equally split",input:"round(gini_impurity(np.array([0, 1, 2])), 4)",expected:"0.6667",hidden:!0}],hints:["Count the occurrences of each class.","Calculate the proportion (probability) of each class.","Gini = 1 - sum of squared probabilities."],solution:`import numpy as np

def gini_impurity(labels: np.ndarray) -> float:
    """
    Calculate Gini impurity for a set of labels.
    """
    if len(labels) == 0:
        return 0.0

    # Count occurrences of each class
    _, counts = np.unique(labels, return_counts=True)

    # Calculate probabilities
    probabilities = counts / len(labels)

    # Gini = 1 - sum(p^2)
    return 1 - np.sum(probabilities ** 2)
`},{id:"linear-regression-gd",title:"Linear Regression with Gradient Descent",section:"supervised-learning",difficulty:"medium",description:`
## Linear Regression with Gradient Descent

Implement simple linear regression using gradient descent optimization.

### Model
\`\`\`
y = w * x + b
\`\`\`

### Gradient Descent Updates
\`\`\`
w = w - learning_rate * dw
b = b - learning_rate * db
\`\`\`

Where:
- dw = (2/n) * sum((y_pred - y) * x)
- db = (2/n) * sum(y_pred - y)

### Function Signature
\`\`\`python
def linear_regression(X: np.ndarray, y: np.ndarray,
                      learning_rate: float, iterations: int) -> tuple:
\`\`\`

Returns (w, b) - the learned weight and bias.
    `,examples:[{input:"X = [1, 2, 3, 4], y = [2, 4, 6, 8], lr = 0.1, iters = 1000",output:"w ≈ 2.0, b ≈ 0.0",explanation:"The true relationship is y = 2x, so w should be close to 2"}],starterCode:`import numpy as np

def linear_regression(X: np.ndarray, y: np.ndarray,
                      learning_rate: float = 0.01,
                      iterations: int = 1000) -> tuple:
    """
    Train a simple linear regression model using gradient descent.

    Args:
        X: Input features (1D array)
        y: Target values (1D array)
        learning_rate: Step size for gradient descent
        iterations: Number of training iterations

    Returns:
        Tuple of (weight, bias)
    """
    # Initialize parameters
    w = 0.0
    b = 0.0
    n = len(X)

    # Your gradient descent implementation here
    pass

    return (round(w, 2), round(b, 2))
`,testCases:[{id:"1",description:"Perfect linear relationship",input:"([1, 2, 3, 4], [2, 4, 6, 8], 0.1, 1000)",expected:"(2.0, 0.0)",hidden:!1},{id:"2",description:"With intercept",input:"([1, 2, 3, 4], [3, 5, 7, 9], 0.1, 1000)",expected:"(2.0, 1.0)",hidden:!1},{id:"3",description:"Different slope",input:"([0, 1, 2, 3], [1, 4, 7, 10], 0.1, 1000)",expected:"(3.0, 1.0)",hidden:!0},{id:"4",description:"Negative slope",input:"([1, 2, 3, 4], [8, 6, 4, 2], 0.1, 1000)",expected:"(-2.0, 10.0)",hidden:!0}],hints:["First compute predictions: y_pred = w * X + b","Then compute gradients: dw = (2/n) * sum((y_pred - y) * X)","Update weights: w = w - learning_rate * dw"],solution:`import numpy as np

def linear_regression(X: np.ndarray, y: np.ndarray,
                      learning_rate: float = 0.01,
                      iterations: int = 1000) -> tuple:
    """
    Train a simple linear regression model using gradient descent.
    """
    w = 0.0
    b = 0.0
    n = len(X)

    for _ in range(iterations):
        # Forward pass
        y_pred = w * X + b

        # Compute gradients
        dw = (2/n) * np.sum((y_pred - y) * X)
        db = (2/n) * np.sum(y_pred - y)

        # Update parameters
        w = w - learning_rate * dw
        b = b - learning_rate * db

    return (round(w, 2), round(b, 2))
`},{id:"logistic-regression-full",title:"Logistic Regression with Gradient Descent",section:"supervised-learning",difficulty:"medium",description:`
## Logistic Regression with Gradient Descent

Implement binary logistic regression from scratch.

### Model
\`\`\`
z = X @ w + b
y_pred = sigmoid(z) = 1 / (1 + exp(-z))
\`\`\`

### Loss (Binary Cross-Entropy)
\`\`\`
L = -1/m * sum(y * log(y_pred) + (1-y) * log(1-y_pred))
\`\`\`

### Gradients
\`\`\`
dw = 1/m * X.T @ (y_pred - y)
db = 1/m * sum(y_pred - y)
\`\`\`
    `,examples:[{input:"X (100, 2), y binary labels, 1000 iterations",output:"Trained weights and bias",explanation:"Learns decision boundary separating classes"}],starterCode:`import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def logistic_regression(X, y, learning_rate=0.1, iterations=1000):
    """
    Train logistic regression using gradient descent.

    Args:
        X: Features (m samples, n features)
        y: Binary labels (m,)
        learning_rate: Step size
        iterations: Number of iterations

    Returns:
        w: Learned weights (n,)
        b: Learned bias (scalar)
    """
    m, n = X.shape
    w = np.zeros(n)
    b = 0.0

    # Your code here
    pass

    return np.round(w, 4), round(float(b), 4)
`,testCases:[{id:"1",description:"Simple separable data",input:"(lambda r: bool(np.allclose(r[0], [6.0141, 6.0141], atol=1e-3) and np.isclose(r[1], -9.1984, atol=1e-3)))(logistic_regression(np.array([[0, 0], [0, 1], [1, 0], [1, 1]]), np.array([0, 0, 0, 1]), 0.5, 1000))",expected:"True",hidden:!1},{id:"2",description:"Weight vector shape",input:"logistic_regression(np.array([[0, 0], [0, 1], [1, 0], [1, 1]]), np.array([0, 0, 0, 1]), 0.5, 1000)[0].shape",expected:"(2,)",hidden:!1},{id:"3",description:"Classifies correctly after training",input:`(lambda: (
    X := np.array([[0, 0], [0, 1], [1, 0], [1, 1]]),
    y := np.array([0, 0, 0, 1]),
    r := logistic_regression(X, y, 0.5, 1000),
    preds := (1 / (1 + np.exp(-(X @ r[0] + r[1])))) > 0.5,
    bool(np.array_equal(preds.astype(int), y))
)[-1])()`,expected:"True",hidden:!0},{id:"4",description:"Bias is scalar",input:"bool(np.ndim(logistic_regression(np.array([[1, 0], [0, 1]]), np.array([0, 1]), 0.1, 100)[1]) == 0)",expected:"True",hidden:!0}],hints:["Forward: z = X @ w + b, then y_pred = sigmoid(z)","Gradients: dw = (1/m) * X.T @ (y_pred - y)","Update: w = w - lr * dw, b = b - lr * db"],solution:`import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

def logistic_regression(X, y, learning_rate=0.1, iterations=1000):
    m, n = X.shape
    w = np.zeros(n)
    b = 0.0

    for _ in range(iterations):
        # Forward pass
        z = X @ w + b
        y_pred = sigmoid(z)

        # Compute gradients
        dw = (1/m) * X.T @ (y_pred - y)
        db = (1/m) * np.sum(y_pred - y)

        # Update parameters
        w = w - learning_rate * dw
        b = b - learning_rate * db

    return np.round(w, 4), round(float(b), 4)
`},{id:"linear-svm",title:"Linear SVM with Gradient Descent",section:"supervised-learning",difficulty:"medium",description:`
## Linear SVM with Gradient Descent

Implement a linear Support Vector Machine (SVM) classifier using gradient descent on the hinge loss with L2 regularization.

### Objective
\`\`\`
L = (λ/2) * ||w||² + (1/m) * Σ max(0, 1 - yᵢ * (Xᵢ · w + b))
\`\`\`

### Gradients
Compute gradients over all samples. For samples where the margin \`yᵢ * (Xᵢ · w + b) < 1\` (hinge loss is active):
\`\`\`
dw = λ * w - (1/m) * Σ yᵢ * Xᵢ    (sum over violating samples)
db = -(1/m) * Σ yᵢ                  (sum over violating samples)
\`\`\`

For samples where the margin >= 1:
\`\`\`
dw contribution = λ * w   (only regularization)
db contribution = 0
\`\`\`

### Function Signature
\`\`\`python
def linear_svm(X, y, learning_rate=0.01, lambda_param=0.01, iterations=1000):
\`\`\`

Returns \`(w, b)\` — the learned weight vector (rounded to 4 decimals) and bias (rounded to 4 decimals).

**Note**: Labels \`y\` are in {-1, +1}.
    `,examples:[{input:"X = [[2,1],[3,2],[-2,-1],[-3,-2]], y = [1,1,-1,-1], lr=0.01, λ=0.01, iters=1000",output:"w and b that correctly classify all points",explanation:"SVM finds a maximum-margin hyperplane separating positive and negative points"}],starterCode:`import numpy as np

def linear_svm(X, y, learning_rate=0.01, lambda_param=0.01, iterations=1000):
    """
    Train a linear SVM using gradient descent on hinge loss + L2 regularization.

    Args:
        X: Features (m samples, n features)
        y: Labels in {-1, +1}, shape (m,)
        learning_rate: Step size for gradient descent
        lambda_param: L2 regularization strength
        iterations: Number of training iterations

    Returns:
        w: Learned weights (n,), rounded to 4 decimals
        b: Learned bias (scalar), rounded to 4 decimals
    """
    m, n = X.shape
    w = np.zeros(n)
    b = 0.0

    # Your gradient descent implementation here
    pass

    return np.round(w, 4), round(float(b), 4)
`,testCases:[{id:"1",description:"Correctly classifies separable 2D data",input:`(lambda: (
    X := np.array([[2, 1], [3, 2], [1, 3], [-2, -1], [-3, -2], [-1, -3]]),
    y := np.array([1, 1, 1, -1, -1, -1]),
    result := linear_svm(X, y, 0.01, 0.01, 1000),
    preds := np.sign(X @ result[0] + result[1]),
    bool(np.array_equal(preds, y))
)[-1])()`,expected:"True",hidden:!1},{id:"2",description:"Correctly classifies 1D data",input:`(lambda: (
    X := np.array([[3], [4], [5], [-3], [-4], [-5]]),
    y := np.array([1, 1, 1, -1, -1, -1]),
    result := linear_svm(X, y, 0.01, 0.01, 1000),
    preds := np.sign(X @ result[0] + result[1]),
    bool(np.array_equal(preds, y))
)[-1])()`,expected:"True",hidden:!1},{id:"3",description:"Weight vector has correct sign",input:`(lambda: (
    X := np.array([[1], [-1]]),
    y := np.array([1, -1]),
    result := linear_svm(X, y, 0.1, 0.01, 500),
    bool(result[0][0] > 0)
)[-1])()`,expected:"True",hidden:!0}],hints:["Compute margins for all samples: margins = y * (X @ w + b)","Find violating samples with mask = margins < 1","Gradient: dw = lambda_param * w - (1/m) * X[mask].T @ y[mask]","Update w and b using gradient descent"],solution:`import numpy as np

def linear_svm(X, y, learning_rate=0.01, lambda_param=0.01, iterations=1000):
    """
    Train a linear SVM using gradient descent on hinge loss + L2 regularization.
    """
    m, n = X.shape
    w = np.zeros(n)
    b = 0.0

    for _ in range(iterations):
        # Compute margins
        margins = y * (X @ w + b)

        # Find samples violating the margin
        mask = margins < 1

        # Compute gradients
        dw = lambda_param * w - (1/m) * (X[mask].T @ y[mask])
        db = -(1/m) * np.sum(y[mask])

        # Update parameters
        w -= learning_rate * dw
        b -= learning_rate * db

    return np.round(w, 4), round(float(b), 4)
`}],s=[{id:"kmeans-clustering",title:"K-Means: Assign to Nearest Centroid",section:"unsupervised-learning",difficulty:"medium",description:`
## K-Means: Assign Points to Nearest Centroid

Implement the assignment step of K-means clustering: given data points and centroids, assign each point to its nearest centroid.

### Function Signature
\`\`\`python
def assign_clusters(X: np.ndarray, centroids: np.ndarray) -> np.ndarray:
\`\`\`

### Args
- X: Data points of shape (n_samples, n_features)
- centroids: Cluster centers of shape (k, n_features)

### Returns
- Array of cluster assignments (integers 0 to k-1)

### Distance
Use Euclidean distance: sqrt(sum((x - c)^2))
    `,examples:[{input:"X = [[0, 0], [1, 1], [10, 10]], centroids = [[0, 0], [10, 10]]",output:"[0, 0, 1]",explanation:"First two points closer to centroid 0, last point closer to centroid 1"}],starterCode:`import numpy as np

def assign_clusters(X: np.ndarray, centroids: np.ndarray) -> np.ndarray:
    """
    Assign each point to its nearest centroid.

    Args:
        X: Data points of shape (n_samples, n_features)
        centroids: Cluster centers of shape (k, n_features)

    Returns:
        Array of cluster assignments (shape: n_samples)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Simple 2D case",input:"([[0, 0], [1, 1], [10, 10]], [[0, 0], [10, 10]])",expected:"[0, 0, 1]",hidden:!1},{id:"2",description:"Three clusters",input:"([[0, 0], [5, 5], [10, 10]], [[0, 0], [5, 5], [10, 10]])",expected:"[0, 1, 2]",hidden:!1},{id:"3",description:"Tiebreaker (first centroid wins)",input:"([[5, 5]], [[0, 0], [10, 10]])",expected:"[0]",hidden:!0},{id:"4",description:"Output shape matches number of samples",input:"assign_clusters(np.random.randn(50, 3), np.random.randn(4, 3)).shape",expected:"(50,)",hidden:!0},{id:"5",description:"All assignments in valid range",input:"(lambda: (assignments := assign_clusters(np.random.randn(20, 2), np.random.randn(5, 2)), bool(np.all(assignments >= 0) and np.all(assignments < 5)))[-1])()",expected:"True",hidden:!0}],hints:["Calculate distance from each point to each centroid.","Use np.linalg.norm() for Euclidean distance.","Use np.argmin() to find the closest centroid."],solution:`import numpy as np

def assign_clusters(X: np.ndarray, centroids: np.ndarray) -> np.ndarray:
    """
    Assign each point to its nearest centroid.
    """
    # Calculate distances from each point to each centroid
    # Using broadcasting: X[:, np.newaxis] has shape (n, 1, d)
    # centroids has shape (k, d)
    # Difference has shape (n, k, d)
    distances = np.linalg.norm(X[:, np.newaxis] - centroids, axis=2)

    # Return index of minimum distance for each point
    return np.argmin(distances, axis=1)
`},{id:"pca-implementation",title:"PCA: Center Data",section:"unsupervised-learning",difficulty:"easy",description:`
## PCA: Center the Data

The first step in PCA is to center the data by subtracting the mean of each feature.

### Function Signature
\`\`\`python
def center_data(X: np.ndarray) -> np.ndarray:
\`\`\`

### Args
- X: Data matrix of shape (n_samples, n_features)

### Returns
- Centered data where each column has mean 0

### Why Center?
Centering ensures PCA finds directions of maximum variance from the origin, not from an arbitrary point.
    `,examples:[{input:"X = [[1, 2], [3, 4], [5, 6]]",output:"[[-2, -2], [0, 0], [2, 2]]",explanation:"Column means are [3, 4], so we subtract them"}],starterCode:`import numpy as np

def center_data(X: np.ndarray) -> np.ndarray:
    """
    Center the data by subtracting the mean of each feature.

    Args:
        X: Data matrix of shape (n_samples, n_features)

    Returns:
        Centered data matrix of same shape
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Basic centering",input:"[[1, 2], [3, 4], [5, 6]]",expected:"[[-2.0, -2.0], [0.0, 0.0], [2.0, 2.0]]",hidden:!1},{id:"2",description:"Already centered",input:"[[-1, -1], [0, 0], [1, 1]]",expected:"[[-1.0, -1.0], [0.0, 0.0], [1.0, 1.0]]",hidden:!1},{id:"3",description:"Single column",input:"[[10], [20], [30]]",expected:"[[-10.0], [0.0], [10.0]]",hidden:!0},{id:"4",description:"Centered data has zero column means",input:"(lambda: (X := np.array([[2.0, 4.0], [6.0, 8.0], [10.0, 12.0]]), centered := center_data(X), bool(np.allclose(centered.mean(axis=0), 0.0)))[-1])()",expected:"True",hidden:!0},{id:"5",description:"Output shape preserved",input:"center_data(np.random.randn(15, 7)).shape",expected:"(15, 7)",hidden:!0}],hints:["Calculate the mean of each column using np.mean() with axis=0.","Subtract the mean from the data (broadcasting handles this)."],solution:`import numpy as np

def center_data(X: np.ndarray) -> np.ndarray:
    """
    Center the data by subtracting the mean of each feature.
    """
    mean = np.mean(X, axis=0)
    return X - mean
`}],o=[{id:"perceptron",title:"ReLU Activation",section:"deep-learning",difficulty:"easy",description:`
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
    `,examples:[{input:"np.array([-2, -1, 0, 1, 2])",output:"[0, 0, 0, 1, 2]",explanation:"Negative values become 0, positive values unchanged"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Mixed values",input:"[-2, -1, 0, 1, 2]",expected:"[0, 0, 0, 1, 2]",hidden:!1},{id:"2",description:"All negative",input:"[-5, -3, -1]",expected:"[0, 0, 0]",hidden:!1},{id:"3",description:"All positive",input:"[1, 2, 3]",expected:"[1, 2, 3]",hidden:!0},{id:"4",description:"Output shape matches input shape (2D)",input:"relu(np.array([[-1, 2], [3, -4]])).shape",expected:"(2, 2)",hidden:!0},{id:"5",description:"Zeros remain zero",input:"relu(np.array([0, 0, 0])).tolist()",expected:"[0, 0, 0]",hidden:!0},{id:"6",description:"Large negative values clipped to zero",input:"bool(np.all(relu(np.array([-1000, -0.001, -1e-10])) == 0))",expected:"True",hidden:!0},{id:"7",description:"Positive values unchanged",input:"bool(np.allclose(relu(np.array([0.5, 1.5, 100.0])), [0.5, 1.5, 100.0]))",expected:"True",hidden:!0}],hints:["Use np.maximum() to compare with 0.","Alternatively, use boolean indexing or np.where()."],solution:`import numpy as np

def relu(x: np.ndarray) -> np.ndarray:
    """
    Apply ReLU activation function.
    """
    return np.maximum(0, x)
`},{id:"neural-network-forward",title:"Dense Layer Forward Pass",section:"deep-learning",difficulty:"medium",description:`
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
    `,examples:[{input:"X = [[1, 2]], W = [[1, 0], [0, 1]], b = [1, 1]",output:"[[2, 3]]",explanation:"X @ W = [[1, 2]], + b = [[2, 3]], ReLU keeps positive"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Basic forward pass",input:"([[1, 2]], [[1, 0], [0, 1]], [1, 1])",expected:"[[2, 3]]",hidden:!1},{id:"2",description:"With negative pre-activation",input:"([[1, 1]], [[1, -2], [-1, 1]], [0, 0])",expected:"[[0, 0]]",hidden:!1},{id:"3",description:"Batch of 2",input:"([[1, 0], [0, 1]], [[2, 0], [0, 2]], [0, 0])",expected:"[[2, 0], [0, 2]]",hidden:!0},{id:"4",description:"Output shape is (batch_size, output_dim)",input:"dense_forward(np.ones((4, 3)), np.ones((3, 5)), np.zeros(5)).shape",expected:"(4, 5)",hidden:!0},{id:"5",description:"ReLU clips negative pre-activations",input:"dense_forward(np.array([[1, 1]]), np.array([[-3, 2], [-3, 2]]), np.array([0, 0])).tolist()",expected:"[[0, 4]]",hidden:!0},{id:"6",description:"Bias is correctly added",input:"dense_forward(np.zeros((1, 2)), np.ones((2, 2)), np.array([3, -1])).tolist()",expected:"[[3.0, 0.0]]",hidden:!0},{id:"7",description:"Known weights exact output",input:"bool(np.allclose(dense_forward(np.array([[2, 3]]), np.array([[1, -1], [1, -1]]), np.array([1, 1])), [[6, 0]]))",expected:"True",hidden:!0}],hints:["First compute the linear transformation: Z = X @ W + b","Then apply ReLU: output = max(0, Z)"],solution:`import numpy as np

def dense_forward(X: np.ndarray, W: np.ndarray, b: np.ndarray) -> np.ndarray:
    """
    Compute forward pass of a dense layer with ReLU activation.
    """
    # Linear transformation
    Z = np.dot(X, W) + b
    # ReLU activation
    return np.maximum(0, Z)
`},{id:"backpropagation",title:"Softmax Function",section:"deep-learning",difficulty:"medium",description:`
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
    `,examples:[{input:"np.array([1, 2, 3])",output:"[0.090031, 0.244728, 0.665241]",explanation:"Higher values get higher probabilities, sum = 1"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Basic softmax",input:"bool(np.allclose(softmax(np.array([1, 2, 3])), [0.090031, 0.244728, 0.665241], atol=1e-5))",expected:"True",hidden:!1},{id:"2",description:"Equal inputs",input:"bool(np.allclose(softmax(np.array([1, 1, 1])), [0.333333, 0.333333, 0.333333], atol=1e-5))",expected:"True",hidden:!1},{id:"3",description:"Large values",input:"bool(np.allclose(softmax(np.array([100, 101, 102])), [0.090031, 0.244728, 0.665241], atol=1e-5))",expected:"True",hidden:!0},{id:"4",description:"Output sums to 1",input:"bool(np.allclose(np.sum(softmax(np.array([2, 5, -1, 0.5]))), 1.0))",expected:"True",hidden:!0},{id:"5",description:"All outputs are positive",input:"bool(np.all(softmax(np.array([-10, -20, -30])) > 0))",expected:"True",hidden:!0},{id:"6",description:"Single dominant value gets highest probability",input:"bool(np.argmax(softmax(np.array([0, 0, 10, 0]))) == 2)",expected:"True",hidden:!0},{id:"7",description:"Numerical stability with very large values",input:"bool(np.allclose(np.sum(softmax(np.array([1000, 1001, 1002]))), 1.0))",expected:"True",hidden:!0}],hints:["Subtract the max value for numerical stability.","Compute exp of each element.","Divide by the sum of all exp values."],solution:`import numpy as np

def softmax(x: np.ndarray) -> np.ndarray:
    """
    Compute softmax probabilities.
    """
    # Subtract max for numerical stability
    x_shifted = x - np.max(x)
    exp_x = np.exp(x_shifted)
    return exp_x / np.sum(exp_x)
`}],d=[{id:"precision-recall-f1",title:"Precision and Recall",section:"model-evaluation",difficulty:"medium",description:`
## Precision and Recall

Calculate precision and recall from true labels and predictions.

### Formulas
\`\`\`
Precision = TP / (TP + FP)
Recall = TP / (TP + FN)
\`\`\`

Where:
- TP = True Positives (predicted 1, actual 1)
- FP = False Positives (predicted 1, actual 0)
- FN = False Negatives (predicted 0, actual 1)

### Function Signature
\`\`\`python
def precision_recall(y_true: np.ndarray, y_pred: np.ndarray) -> tuple:
\`\`\`

Returns (precision, recall) rounded to 4 decimal places.
    `,examples:[{input:"y_true = [1, 1, 0, 1, 0], y_pred = [1, 0, 0, 1, 1]",output:"(0.6667, 0.6667)",explanation:"TP=2, FP=1, FN=1. Precision=2/3, Recall=2/3"}],starterCode:`import numpy as np

def precision_recall(y_true: np.ndarray, y_pred: np.ndarray) -> tuple:
    """
    Calculate precision and recall for binary classification.

    Args:
        y_true: True labels (0 or 1)
        y_pred: Predicted labels (0 or 1)

    Returns:
        Tuple of (precision, recall) rounded to 4 decimal places
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Mixed predictions",input:"([1, 1, 0, 1, 0], [1, 0, 0, 1, 1])",expected:"(0.6667, 0.6667)",hidden:!1},{id:"2",description:"Perfect predictions",input:"([1, 1, 0, 0], [1, 1, 0, 0])",expected:"(1.0, 1.0)",hidden:!1},{id:"3",description:"High precision, low recall",input:"([1, 1, 1, 1, 0], [1, 0, 0, 0, 0])",expected:"(1.0, 0.25)",hidden:!0},{id:"4",description:"Low precision, high recall (all predicted positive)",input:"([1, 0, 0, 0, 0], [1, 1, 1, 1, 1])",expected:"(0.2, 1.0)",hidden:!0}],hints:["Count TP where both y_true and y_pred are 1.","Count FP where y_pred is 1 but y_true is 0.","Count FN where y_true is 1 but y_pred is 0."],solution:`import numpy as np

def precision_recall(y_true: np.ndarray, y_pred: np.ndarray) -> tuple:
    """
    Calculate precision and recall for binary classification.
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    # Calculate TP, FP, FN
    tp = np.sum((y_true == 1) & (y_pred == 1))
    fp = np.sum((y_true == 0) & (y_pred == 1))
    fn = np.sum((y_true == 1) & (y_pred == 0))

    # Calculate precision and recall
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0

    return (round(precision, 4), round(recall, 4))
`},{id:"cross-validation",title:"K-Fold Split Indices",section:"model-evaluation",difficulty:"medium",description:`
## K-Fold Cross-Validation Indices

Generate train and validation indices for K-fold cross-validation.

### Concept
Split data into K equal parts. For each fold:
- Use 1 part for validation
- Use remaining K-1 parts for training

### Function Signature
\`\`\`python
def kfold_indices(n_samples: int, k: int) -> list:
\`\`\`

Returns list of (train_indices, val_indices) tuples for each fold.
    `,examples:[{input:"n_samples = 6, k = 3",output:"[([2,3,4,5], [0,1]), ([0,1,4,5], [2,3]), ([0,1,2,3], [4,5])]",explanation:"Split [0,1,2,3,4,5] into 3 folds of size 2"}],starterCode:`import numpy as np

def kfold_indices(n_samples: int, k: int) -> list:
    """
    Generate train/validation indices for K-fold cross-validation.

    Args:
        n_samples: Total number of samples
        k: Number of folds

    Returns:
        List of (train_indices, val_indices) tuples
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Basic 3-fold",input:"(6, 3)",expected:"[[[2, 3, 4, 5], [0, 1]], [[0, 1, 4, 5], [2, 3]], [[0, 1, 2, 3], [4, 5]]]",hidden:!1},{id:"2",description:"2-fold",input:"(4, 2)",expected:"[[[2, 3], [0, 1]], [[0, 1], [2, 3]]]",hidden:!1},{id:"3",description:"4-fold",input:"(8, 4)",expected:"[[[2, 3, 4, 5, 6, 7], [0, 1]], [[0, 1, 4, 5, 6, 7], [2, 3]], [[0, 1, 2, 3, 6, 7], [4, 5]], [[0, 1, 2, 3, 4, 5], [6, 7]]]",hidden:!0},{id:"4",description:"Number of folds equals k",input:"len(kfold_indices(10, 5))",expected:"5",hidden:!0}],hints:["Divide indices into k equal-sized chunks.","For each fold, one chunk is validation, rest are training.","Use np.array_split() to create chunks."],solution:`import numpy as np

def kfold_indices(n_samples: int, k: int) -> list:
    """
    Generate train/validation indices for K-fold cross-validation.
    """
    indices = np.arange(n_samples)
    fold_sizes = np.full(k, n_samples // k)
    fold_sizes[:n_samples % k] += 1

    folds = []
    current = 0
    for fold_size in fold_sizes:
        val_indices = list(range(current, current + fold_size))
        train_indices = [i for i in range(n_samples) if i not in val_indices]
        folds.append((train_indices, val_indices))
        current += fold_size

    return folds
`},{id:"confusion-matrix",title:"Accuracy Score",section:"model-evaluation",difficulty:"easy",description:`
## Accuracy Score

Calculate the accuracy of predictions - the proportion of correct predictions.

### Formula
\`\`\`
Accuracy = (Number of correct predictions) / (Total predictions)
\`\`\`

### Function Signature
\`\`\`python
def accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
\`\`\`

### Note
While simple, accuracy can be misleading for imbalanced datasets.
    `,examples:[{input:"y_true = [0, 1, 1, 0, 1], y_pred = [0, 1, 0, 0, 1]",output:"0.8",explanation:"4 correct out of 5 predictions"}],starterCode:`import numpy as np

def accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    Calculate accuracy of predictions.

    Args:
        y_true: True labels
        y_pred: Predicted labels

    Returns:
        Accuracy score between 0 and 1
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Basic accuracy",input:"([0, 1, 1, 0, 1], [0, 1, 0, 0, 1])",expected:"0.8",hidden:!1},{id:"2",description:"Perfect accuracy",input:"([1, 1, 0, 0], [1, 1, 0, 0])",expected:"1.0",hidden:!1},{id:"3",description:"Zero accuracy",input:"([0, 0, 1, 1], [1, 1, 0, 0])",expected:"0.0",hidden:!0},{id:"4",description:"Multi-class accuracy",input:"([0, 1, 2, 0, 1, 2], [0, 1, 2, 2, 1, 0])",expected:"0.666667",hidden:!0}],hints:["Compare y_true and y_pred element-wise.","Count matches and divide by total.","np.mean() of boolean array gives proportion of True."],solution:`import numpy as np

def accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """
    Calculate accuracy of predictions.
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    return np.mean(y_true == y_pred)
`}],p=[{id:"mlp-forward-backward",title:"MLP Forward & Backward Pass",section:"neural-networks",difficulty:"hard",description:"\n## MLP Forward & Backward Pass\n\nImplement both forward and backward passes for a 2-layer MLP (Multi-Layer Perceptron).\n\n### Architecture\n```\nInput (n_features) → Hidden (n_hidden) → Output (n_classes)\n```\n\n### Forward Pass\n```\nZ1 = X @ W1 + b1\nA1 = ReLU(Z1)\nZ2 = A1 @ W2 + b2\noutput = softmax(Z2)\n```\n\nReturn: `(output, cache)` where cache = `(X, Z1, A1, Z2, W1, W2)`\n\n### Backward Pass (Backpropagation)\nUsing the chain rule, gradients flow backwards:\n\n```\nLoss → dZ2 → dW2, db2 → dA1 → dZ1 (ReLU) → dW1, db1\n```\n\n**Key Formulas:**\n- `dZ2 = output - Y_onehot` (softmax + cross-entropy derivative)\n- `dW2 = (1/m) * A1.T @ dZ2`\n- `db2 = (1/m) * sum(dZ2, axis=0)`\n- `dZ1 = (dZ2 @ W2.T) * (Z1 > 0)` (ReLU derivative)\n- `dW1 = (1/m) * X.T @ dZ1`\n- `db1 = (1/m) * sum(dZ1, axis=0)`\n\nReturn: `{'dW1': ..., 'db1': ..., 'dW2': ..., 'db2': ...}`\n    ",examples:[{input:"X shape (2, 3), hidden_size=4, output_size=2",output:"Forward: probabilities (2, 2), rows sum to 1. Backward: gradients for all weights/biases",explanation:"Forward computes predictions; backward computes gradients for training"}],starterCode:`import numpy as np

def relu(x):
    return np.maximum(0, x)

def softmax(x):
    exp_x = np.exp(x - np.max(x, axis=1, keepdims=True))
    return exp_x / np.sum(exp_x, axis=1, keepdims=True)

def mlp_forward(X, W1, b1, W2, b2):
    """
    Forward pass for a 2-layer MLP.

    Args:
        X: Input data (batch_size, n_features)
        W1: First layer weights (n_features, n_hidden)
        b1: First layer bias (n_hidden,)
        W2: Second layer weights (n_hidden, n_classes)
        b2: Second layer bias (n_classes,)

    Returns:
        output: Class probabilities (batch_size, n_classes)
        cache: Tuple (X, Z1, A1, Z2, W1, W2) for backprop
    """
    # Your code here
    pass

def mlp_backward(Y, output, cache):
    """
    Backward pass (backpropagation) for 2-layer MLP.

    Args:
        Y: One-hot encoded labels (batch_size, n_classes)
        output: Predicted probabilities from forward pass
        cache: Cached values from forward pass (X, Z1, A1, Z2, W1, W2)

    Returns:
        grads: Dictionary with dW1, db1, dW2, db2
    """
    X, Z1, A1, Z2, W1, W2 = cache
    m = X.shape[0]  # batch size

    # Your code here
    pass
`,testCases:[{id:"1",description:"Forward: output shape correct",input:"mlp_forward(np.array([[1, 2, 3], [4, 5, 6]]), np.ones((3, 4)), np.zeros(4), np.ones((4, 2)), np.zeros(2))[0].shape",expected:"(2, 2)",hidden:!1},{id:"2",description:"Forward: probabilities sum to 1",input:"round(float(np.sum(mlp_forward(np.array([[1, 0], [0, 1]]), np.array([[1, 0], [0, 1]]), np.zeros(2), np.array([[1, 0], [0, 1]]), np.zeros(2))[0][0])), 1)",expected:"1.0",hidden:!1},{id:"3",description:"Backward: dW2 shape matches W2",input:`(lambda: (
            X := np.array([[1.0, 2.0], [3.0, 4.0]]),
            W1 := np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]),
            b1 := np.zeros(3),
            W2 := np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]),
            b2 := np.zeros(2),
            result := mlp_forward(X, W1, b1, W2, b2),
            output := result[0],
            cache := result[1],
            Y := np.array([[1, 0], [0, 1]]),
            grads := mlp_backward(Y, output, cache),
            grads['dW2'].shape == W2.shape
        )[-1])()`,expected:"True",hidden:!1},{id:"4",description:"Backward: gradients are non-zero",input:`(lambda: (
            X := np.array([[1.0, 2.0], [3.0, 4.0]]),
            W1 := np.array([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]),
            b1 := np.zeros(3),
            W2 := np.array([[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]]),
            b2 := np.zeros(2),
            result := mlp_forward(X, W1, b1, W2, b2),
            output := result[0],
            cache := result[1],
            Y := np.array([[1, 0], [0, 1]]),
            grads := mlp_backward(Y, output, cache),
            bool(np.any(grads['dW1'] != 0) and np.any(grads['dW2'] != 0))
        )[-1])()`,expected:"True",hidden:!0},{id:"5",description:"Backward: all gradient keys present",input:`(lambda: (
            X := np.array([[1.0, 2.0]]),
            W1 := np.array([[0.1, 0.2], [0.3, 0.4]]),
            b1 := np.zeros(2),
            W2 := np.array([[0.1], [0.2]]),
            b2 := np.zeros(1),
            result := mlp_forward(X, W1, b1, W2, b2),
            grads := mlp_backward(np.array([[1]]), result[0], result[1]),
            sorted(grads.keys())
        )[-1])()`,expected:'["dW1", "dW2", "db1", "db2"]',hidden:!0}],hints:["Forward: Compute Z1 = X @ W1 + b1, then A1 = ReLU(Z1)","Forward: Compute Z2 = A1 @ W2 + b2, then output = softmax(Z2)","Forward: Store cache = (X, Z1, A1, Z2, W1, W2) for backprop","Backward: Start from output layer: dZ2 = output - Y","Backward: dW2 = (1/m) * A1.T @ dZ2, db2 = (1/m) * sum(dZ2, axis=0)","Backward: Propagate through ReLU: dZ1 = (dZ2 @ W2.T) * (Z1 > 0)","Backward: dW1 = (1/m) * X.T @ dZ1, db1 = (1/m) * sum(dZ1, axis=0)"],solution:`import numpy as np

def relu(x):
    return np.maximum(0, x)

def softmax(x):
    exp_x = np.exp(x - np.max(x, axis=1, keepdims=True))
    return exp_x / np.sum(exp_x, axis=1, keepdims=True)

def mlp_forward(X, W1, b1, W2, b2):
    # First layer
    Z1 = X @ W1 + b1
    A1 = relu(Z1)

    # Second layer
    Z2 = A1 @ W2 + b2
    output = softmax(Z2)

    # Cache for backprop
    cache = (X, Z1, A1, Z2, W1, W2)

    return output, cache

def mlp_backward(Y, output, cache):
    X, Z1, A1, Z2, W1, W2 = cache
    m = X.shape[0]

    # Output layer gradient (softmax + cross-entropy)
    dZ2 = output - Y
    dW2 = (1/m) * A1.T @ dZ2
    db2 = (1/m) * np.sum(dZ2, axis=0)

    # Hidden layer gradient
    dA1 = dZ2 @ W2.T
    dZ1 = dA1 * (Z1 > 0)  # ReLU derivative
    dW1 = (1/m) * X.T @ dZ1
    db1 = (1/m) * np.sum(dZ1, axis=0)

    return {'dW1': dW1, 'db1': db1, 'dW2': dW2, 'db2': db2}
`},{id:"cross-entropy-loss",title:"Cross-Entropy Loss",section:"neural-networks",difficulty:"easy",description:`
## Cross-Entropy Loss

Implement the cross-entropy loss function for multi-class classification.

### Formula
\`\`\`
L = -1/m * sum(Y * log(Y_pred))
\`\`\`

Where:
- Y is one-hot encoded true labels
- Y_pred is predicted probabilities
- m is batch size

### Numerical Stability
Add small epsilon to avoid log(0):
\`\`\`python
np.log(Y_pred + 1e-15)
\`\`\`
    `,examples:[{input:"Y_pred = [[0.7, 0.2, 0.1], [0.1, 0.8, 0.1]], Y = [[1,0,0], [0,1,0]]",output:"0.2231",explanation:"-1/2 * (log(0.7) + log(0.8))"}],starterCode:`import numpy as np

def cross_entropy_loss(Y_pred, Y_true):
    """
    Compute cross-entropy loss.

    Args:
        Y_pred: Predicted probabilities (batch_size, n_classes)
        Y_true: One-hot encoded true labels (batch_size, n_classes)

    Returns:
        loss: Scalar cross-entropy loss
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Perfect prediction",input:"abs(cross_entropy_loss(np.array([[1.0, 0.0], [0.0, 1.0]]), np.array([[1, 0], [0, 1]])))",expected:"0.0",hidden:!1},{id:"2",description:"Typical case",input:"cross_entropy_loss(np.array([[0.7, 0.3], [0.2, 0.8]]), np.array([[1, 0], [0, 1]]))",expected:"0.2899",hidden:!1},{id:"3",description:"Uniform predictions (high loss)",input:"round(cross_entropy_loss(np.array([[0.5, 0.5]]), np.array([[1, 0]])), 4)",expected:"0.6931",hidden:!0},{id:"4",description:"Three classes",input:"round(cross_entropy_loss(np.array([[0.1, 0.8, 0.1]]), np.array([[0, 1, 0]])), 4)",expected:"0.2231",hidden:!0}],hints:["Use np.log with a small epsilon for numerical stability","Multiply element-wise: Y_true * np.log(Y_pred)","Sum and negate, then divide by batch size"],solution:`import numpy as np

def cross_entropy_loss(Y_pred, Y_true):
    m = Y_pred.shape[0]
    epsilon = 1e-15
    log_probs = np.log(Y_pred + epsilon)
    loss = -np.sum(Y_true * log_probs) / m
    return round(loss, 4)
`},{id:"weight-init",title:"Xavier/He Weight Initialization",section:"neural-networks",difficulty:"medium",description:`
## Weight Initialization

Implement Xavier and He weight initialization to prevent vanishing/exploding gradients.

### Xavier Initialization (for tanh/sigmoid)
\`\`\`
W = randn(n_in, n_out) * sqrt(2 / (n_in + n_out))
\`\`\`

### He Initialization (for ReLU)
\`\`\`
W = randn(n_in, n_out) * sqrt(2 / n_in)
\`\`\`

### Why It Matters
- Keeps variance of activations stable across layers
- Prevents gradients from vanishing or exploding
- Enables training of deep networks
    `,examples:[{input:'n_in=784, n_out=256, method="he"',output:"Weights with std ≈ 0.0505",explanation:"sqrt(2/784) ≈ 0.0505"}],starterCode:`import numpy as np

def initialize_weights(n_in, n_out, method='xavier'):
    """
    Initialize weights using Xavier or He initialization.

    Args:
        n_in: Number of input units
        n_out: Number of output units
        method: 'xavier' or 'he'

    Returns:
        std: Standard deviation of initialized weights (rounded to 4 decimals)
    """
    np.random.seed(42)  # For reproducibility
    # Your code here
    pass
`,testCases:[{id:"1",description:"Xavier std correct",input:'(100, 50, "xavier")',expected:"0.1151",hidden:!1},{id:"2",description:"He std correct",input:'(100, 50, "he")',expected:"0.1409",hidden:!1},{id:"3",description:"Xavier with large layers",input:'(784, 256, "xavier")',expected:"0.0438",hidden:!0},{id:"4",description:"He with large layers",input:'(784, 256, "he")',expected:"0.0505",hidden:!0}],hints:["Use np.random.randn to generate random numbers","Xavier: multiply by sqrt(2 / (n_in + n_out))","He: multiply by sqrt(2 / n_in)"],solution:`import numpy as np

def initialize_weights(n_in, n_out, method='xavier'):
    np.random.seed(42)

    if method == 'xavier':
        std = np.sqrt(2.0 / (n_in + n_out))
    elif method == 'he':
        std = np.sqrt(2.0 / n_in)
    else:
        raise ValueError("Method must be 'xavier' or 'he'")

    W = np.random.randn(n_in, n_out) * std
    return round(np.std(W), 4)
`},{id:"batch-norm",title:"Batch Normalization",section:"neural-networks",difficulty:"medium",description:`
## Batch Normalization

Implement batch normalization to stabilize training.

### Forward Pass
\`\`\`
1. Compute batch mean: μ = mean(x, axis=0)
2. Compute batch variance: σ² = var(x, axis=0)
3. Normalize: x_norm = (x - μ) / sqrt(σ² + ε)
4. Scale and shift: out = γ * x_norm + β
\`\`\`

### Return Format
Return \`(out, cache)\` where:
- \`out\`: Normalized and scaled output
- \`cache\`: Tuple \`(X, X_norm, mu, var, gamma, eps)\` for backward pass

### Benefits
- Reduces internal covariate shift
- Allows higher learning rates
- Acts as regularization
    `,examples:[{input:"X with mean=5, var=4, gamma=1, beta=0",output:"Normalized X with mean≈0, var≈1",explanation:"BatchNorm normalizes each feature"}],starterCode:`import numpy as np

def batch_norm_forward(X, gamma, beta, eps=1e-5):
    """
    Batch normalization forward pass.

    Args:
        X: Input (batch_size, features)
        gamma: Scale parameter (features,)
        beta: Shift parameter (features,)
        eps: Small constant for numerical stability

    Returns:
        out: Normalized output (batch_size, features)
        cache: Tuple (X, X_norm, mu, var, gamma, eps) for backward pass
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Output mean near zero",input:"bool(np.allclose(np.mean(batch_norm_forward(np.array([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]), np.ones(2), np.zeros(2))[0], axis=0), 0, atol=1e-5))",expected:"True",hidden:!1},{id:"2",description:"Gamma scales output",input:"list(np.round(batch_norm_forward(np.array([[0.0, 0.0], [2.0, 2.0]]), np.array([2.0, 3.0]), np.zeros(2))[0][1], 1))",expected:"[2.0, 3.0]",hidden:!0},{id:"3",description:"Output shape preserved",input:"batch_norm_forward(np.random.randn(8, 4), np.ones(4), np.zeros(4))[0].shape",expected:"(8, 4)",hidden:!1},{id:"4",description:"Output variance near 1",input:"bool(np.allclose(np.var(batch_norm_forward(np.random.randn(100, 4), np.ones(4), np.zeros(4))[0], axis=0), 1, atol=0.1))",expected:"True",hidden:!0},{id:"5",description:"Cache contains correct elements",input:"len(batch_norm_forward(np.random.randn(4, 3), np.ones(3), np.zeros(3))[1])",expected:"6",hidden:!0}],hints:["Compute mean along axis=0 (batch dimension)","Compute variance along axis=0","Normalize: (X - mean) / sqrt(var + eps)","Apply scale and shift: gamma * normalized + beta"],solution:`import numpy as np

def batch_norm_forward(X, gamma, beta, eps=1e-5):
    # Compute batch statistics
    mu = np.mean(X, axis=0)
    var = np.var(X, axis=0)

    # Normalize
    X_norm = (X - mu) / np.sqrt(var + eps)

    # Scale and shift
    out = gamma * X_norm + beta

    # Cache for backward pass
    cache = (X, X_norm, mu, var, gamma, eps)

    return out, cache
`},{id:"dropout",title:"Dropout",section:"neural-networks",difficulty:"easy",description:`
## Dropout Regularization

Implement dropout to prevent overfitting.

### Training Mode
\`\`\`
1. Generate mask: mask = (rand < keep_prob) / keep_prob
2. Apply mask: out = x * mask
\`\`\`

### Key Points
- Randomly "drop" neurons with probability (1 - keep_prob)
- Scale by 1/keep_prob to maintain expected value
- Disabled during inference (return input unchanged)
    `,examples:[{input:"X = [[1, 2, 3, 4]], keep_prob=0.5",output:"Some values zeroed, others scaled by 2",explanation:"Half neurons dropped, rest doubled"}],starterCode:`import numpy as np

def dropout_forward(X, keep_prob=0.5, training=True):
    """
    Apply dropout to input.

    Args:
        X: Input array
        keep_prob: Probability of keeping a neuron
        training: Whether in training mode

    Returns:
        out: Output after dropout
        mask: Dropout mask (for backward pass)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Inference returns unchanged",input:"dropout_forward(np.array([[1, 2, 3, 4]]), 0.5, False)[0].tolist()",expected:"[[1, 2, 3, 4]]",hidden:!1},{id:"2",description:"Expected value preserved",input:`(lambda: (
            np.random.seed(42),
            X := np.ones((1000, 100)),
            out := dropout_forward(X, 0.8, True)[0],
            bool(abs(np.mean(out) - 1.0) < 0.1)
        )[-1])()`,expected:"True",hidden:!0},{id:"3",description:"Output shape preserved",input:`(lambda: (
            np.random.seed(0),
            dropout_forward(np.random.randn(4, 8), 0.5, True)[0].shape
        )[-1])()`,expected:"(4, 8)",hidden:!1},{id:"4",description:"Some values are zeroed in training",input:`(lambda: (
            np.random.seed(42),
            out := dropout_forward(np.ones((10, 10)), 0.5, True)[0],
            bool(np.any(out == 0))
        )[-1])()`,expected:"True",hidden:!0},{id:"5",description:"Mask returned in training",input:`(lambda: (
            np.random.seed(42),
            dropout_forward(np.ones((4, 4)), 0.5, True)[1] is not None
        )[-1])()`,expected:"True",hidden:!0}],hints:["In training: create binary mask with np.random.rand","Scale mask by 1/keep_prob (inverted dropout)","In inference: return input unchanged"],solution:`import numpy as np

def dropout_forward(X, keep_prob=0.5, training=True):
    if not training:
        return X, None

    # Create mask and scale
    mask = (np.random.rand(*X.shape) < keep_prob) / keep_prob
    out = X * mask

    return out, mask
`}],l=[{id:"conv2d-forward",title:"2D Convolution",section:"cnn",difficulty:"hard",description:`
## 2D Convolution Operation

Implement the forward pass of a 2D convolution (no padding, stride=1).

### Operation
For each position (i, j) in the output:
\`\`\`
out[i, j] = sum(input[i:i+kH, j:j+kW] * kernel)
\`\`\`

### Output Size
\`\`\`
out_height = input_height - kernel_height + 1
out_width = input_width - kernel_width + 1
\`\`\`

### Function Signature
\`\`\`python
def conv2d(image, kernel):
    # image: (H, W)
    # kernel: (kH, kW)
    # output: (H-kH+1, W-kW+1)
\`\`\`
    `,examples:[{input:"image 4x4, kernel 3x3",output:"output 2x2",explanation:"4-3+1 = 2 in each dimension"}],starterCode:`import numpy as np

def conv2d(image, kernel):
    """
    Apply 2D convolution to an image.

    Args:
        image: Input image (H, W)
        kernel: Convolution kernel (kH, kW)

    Returns:
        output: Convolved image (H-kH+1, W-kW+1)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Identity kernel",input:"([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[0, 0, 0], [0, 1, 0], [0, 0, 0]])",expected:"[[5]]",hidden:!1},{id:"2",description:"Edge detection",input:"([[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]], [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]])",expected:"[[5, 5], [5, 5]]",hidden:!1},{id:"3",description:"5x5 image with 2x2 kernel",input:"([[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23, 24, 25]], [[1, 0], [0, -1]])",expected:"[[-6, -6, -6, -6], [-6, -6, -6, -6], [-6, -6, -6, -6], [-6, -6, -6, -6]]",hidden:!0},{id:"4",description:"All-ones 2x2 kernel sums regions",input:"([[1, 0, 1], [0, 1, 0], [1, 0, 1]], [[1, 1], [1, 1]])",expected:"[[2, 2], [2, 2]]",hidden:!0}],hints:["Use nested loops to slide the kernel over the image","At each position, compute element-wise product and sum","Output size is (H-kH+1, W-kW+1)"],solution:`import numpy as np

def conv2d(image, kernel):
    image = np.array(image)
    kernel = np.array(kernel)

    H, W = image.shape
    kH, kW = kernel.shape

    out_H = H - kH + 1
    out_W = W - kW + 1

    output = np.zeros((out_H, out_W))

    for i in range(out_H):
        for j in range(out_W):
            region = image[i:i+kH, j:j+kW]
            output[i, j] = np.sum(region * kernel)

    return output.astype(int).tolist()
`},{id:"max-pool",title:"Max Pooling",section:"cnn",difficulty:"medium",description:`
## Max Pooling

Implement 2x2 max pooling with stride 2.

### Operation
Divide input into non-overlapping 2x2 regions and take maximum of each.

### Output Size
\`\`\`
out_height = input_height // 2
out_width = input_width // 2
\`\`\`

### Purpose
- Reduces spatial dimensions
- Provides translation invariance
- Reduces computation
    `,examples:[{input:"[[1,2,3,4], [5,6,7,8], [9,10,11,12], [13,14,15,16]]",output:"[[6, 8], [14, 16]]",explanation:"Max of each 2x2 region"}],starterCode:`import numpy as np

def max_pool2d(image, pool_size=2):
    """
    Apply 2D max pooling.

    Args:
        image: Input image (H, W)
        pool_size: Size of pooling window

    Returns:
        output: Pooled image (H//pool_size, W//pool_size)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"4x4 to 2x2",input:"[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]",expected:"[[6, 8], [14, 16]]",hidden:!1},{id:"2",description:"With negative values",input:"[[-1, -2, -3, -4], [-5, -6, -7, -8], [-9, -10, -11, -12], [-13, -14, -15, -16]]",expected:"[[-1, -3], [-9, -11]]",hidden:!0},{id:"3",description:"6x6 input to 3x3",input:"max_pool2d(np.arange(1, 37).reshape(6, 6))",expected:"[[8, 10, 12], [20, 22, 24], [32, 34, 36]]",hidden:!0},{id:"4",description:"Minimal 2x2 input",input:"[[3, 1], [2, 4]]",expected:"[[4]]",hidden:!0}],hints:["Iterate with step size = pool_size","For each 2x2 region, use np.max()","Output dimensions are input dimensions // pool_size"],solution:`import numpy as np

def max_pool2d(image, pool_size=2):
    image = np.array(image)
    H, W = image.shape

    out_H = H // pool_size
    out_W = W // pool_size

    output = np.zeros((out_H, out_W))

    for i in range(out_H):
        for j in range(out_W):
            region = image[i*pool_size:(i+1)*pool_size,
                          j*pool_size:(j+1)*pool_size]
            output[i, j] = np.max(region)

    return output.astype(int).tolist()
`},{id:"flatten-layer",title:"Flatten Layer",section:"cnn",difficulty:"easy",description:`
## Flatten Layer

Implement the flatten operation that converts a 3D feature map to a 1D vector for the fully connected layer.

### Operation
\`\`\`
(batch, height, width, channels) → (batch, height * width * channels)
\`\`\`

### Usage
- Connects convolutional layers to fully connected layers
- Preserves batch dimension
    `,examples:[{input:"shape (2, 4, 4, 3)",output:"shape (2, 48)",explanation:"4 * 4 * 3 = 48 features per sample"}],starterCode:`import numpy as np

def flatten(X):
    """
    Flatten feature maps to vectors.

    Args:
        X: Input tensor (batch, height, width, channels)

    Returns:
        output: Flattened tensor (batch, height*width*channels)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Correct output shape",input:"flatten(np.random.randn(2, 4, 4, 3)).shape",expected:"(2, 48)",hidden:!1},{id:"2",description:"Values preserved",input:"bool(np.allclose(flatten(np.arange(24).reshape(1, 2, 3, 4)), np.arange(24).reshape(1, 24)))",expected:"True",hidden:!0},{id:"3",description:"Single sample shape",input:"flatten(np.random.randn(1, 3, 3, 2)).shape",expected:"(1, 18)",hidden:!0},{id:"4",description:"Batch of 4 shape",input:"flatten(np.random.randn(4, 2, 2, 8)).shape",expected:"(4, 32)",hidden:!0}],hints:["Get batch size as X.shape[0]","Use reshape to flatten remaining dimensions","np.reshape(X, (batch_size, -1)) uses -1 to infer size"],solution:`import numpy as np

def flatten(X):
    batch_size = X.shape[0]
    return X.reshape(batch_size, -1)
`},{id:"conv-output-size",title:"Convolution Output Size",section:"cnn",difficulty:"easy",description:`
## Calculate Convolution Output Size

Implement a function to calculate the output dimensions of a convolution layer.

### Formula
\`\`\`
output_size = (input_size - kernel_size + 2 * padding) / stride + 1
\`\`\`

### Parameters
- **input_size**: Height or width of input
- **kernel_size**: Height or width of kernel
- **padding**: Zero-padding added to input
- **stride**: Step size of kernel
    `,examples:[{input:"input=32, kernel=3, padding=1, stride=1",output:"32",explanation:"(32 - 3 + 2*1) / 1 + 1 = 32"}],starterCode:`def conv_output_size(input_size, kernel_size, padding=0, stride=1):
    """
    Calculate output size of a convolution layer.

    Args:
        input_size: Input dimension (height or width)
        kernel_size: Kernel dimension
        padding: Zero-padding
        stride: Stride

    Returns:
        output_size: Output dimension
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Same padding",input:"(32, 3, 1, 1)",expected:"32",hidden:!1},{id:"2",description:"No padding, stride 2",input:"(32, 3, 0, 2)",expected:"15",hidden:!1},{id:"3",description:"Large kernel",input:"(224, 7, 3, 2)",expected:"112",hidden:!0},{id:"4",description:"1x1 convolution preserves size",input:"(56, 1, 0, 1)",expected:"56",hidden:!0}],hints:["Apply the formula: (input - kernel + 2*padding) / stride + 1","Use integer division (//) for the result"],solution:`def conv_output_size(input_size, kernel_size, padding=0, stride=1):
    return (input_size - kernel_size + 2 * padding) // stride + 1
`},{id:"conv2d-advanced",title:"Advanced 2D Convolution",section:"cnn",difficulty:"hard",description:`
## Advanced 2D Convolution

Implement a full-featured 2D convolution with **padding**, **stride**, and **groups** support.

### Parameters
- **padding**: Zero-padding added to input borders
- **stride**: Step size when sliding the kernel
- **groups**: Split input/output channels into groups (used in depthwise separable convolutions)

### Group Convolution
When \`groups > 1\`:
- Input channels are split into \`groups\` chunks
- Output channels are split into \`groups\` chunks
- Each group's input is convolved only with its corresponding kernel group
- \`in_channels\` and \`out_channels\` must be divisible by \`groups\`

### Special Cases
- \`groups=1\`: Standard convolution
- \`groups=in_channels=out_channels\`: Depthwise convolution (MobileNet)

### Output Size Formula
\`\`\`
H_out = (H_in + 2*padding - kernel_height) // stride + 1
W_out = (W_in + 2*padding - kernel_width) // stride + 1
\`\`\`

### Function Signature
\`\`\`python
def conv2d_advanced(input, kernel, padding=0, stride=1, groups=1):
    # input: (batch, in_channels, H, W)
    # kernel: (out_channels, in_channels//groups, kH, kW)
    # output: (batch, out_channels, H_out, W_out)
\`\`\`
    `,examples:[{input:"input (1, 4, 5, 5), kernel (8, 2, 3, 3), groups=2",output:"output (1, 8, 3, 3)",explanation:"Groups=2: channels 0-1 use kernels 0-3, channels 2-3 use kernels 4-7"},{input:"input (1, 1, 5, 5), kernel (1, 1, 3, 3), padding=1, stride=2",output:"output (1, 1, 3, 3)",explanation:"(5+2*1-3)//2+1 = 3"}],starterCode:`import numpy as np

def conv2d_advanced(input, kernel, padding=0, stride=1, groups=1):
    """
    Advanced 2D convolution with padding, stride, and groups.

    Args:
        input: Input tensor (batch, in_channels, H, W)
        kernel: Convolution kernels (out_channels, in_channels//groups, kH, kW)
        padding: Zero-padding added to input (default: 0)
        stride: Stride of the convolution (default: 1)
        groups: Number of groups for grouped convolution (default: 1)

    Returns:
        output: Convolved tensor (batch, out_channels, H_out, W_out)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Basic convolution with padding and stride",input:"conv2d_advanced(np.ones((1, 1, 5, 5)), np.ones((1, 1, 3, 3)), 1, 2, 1).shape",expected:"(1, 1, 3, 3)",hidden:!1},{id:"2",description:"Grouped convolution (groups=2)",input:"conv2d_advanced(np.arange(32).reshape(1, 2, 4, 4).astype(float), np.ones((4, 1, 2, 2)), 0, 1, 2).shape",expected:"(1, 4, 3, 3)",hidden:!1},{id:"3",description:"Depthwise convolution (groups=in_channels)",input:"conv2d_advanced(np.ones((2, 3, 4, 4)), np.ones((3, 1, 2, 2)), 0, 1, 3).shape",expected:"(2, 3, 3, 3)",hidden:!0},{id:"4",description:"Verify correct output values with groups",input:"bool(np.allclose(conv2d_advanced(np.ones((1, 2, 3, 3)), np.ones((2, 1, 2, 2)), 0, 1, 2), np.array([[[[4., 4.], [4., 4.]], [[4., 4.], [4., 4.]]]])) )",expected:"True",hidden:!0}],hints:["First, pad the input using np.pad() along the H and W dimensions","Calculate output dimensions: H_out = (H_padded - kH) // stride + 1","For groups: split input channels into chunks of size in_channels//groups","For groups: split kernels into chunks of size out_channels//groups","Convolve each input group with its corresponding kernel group","Concatenate results along the channel dimension"],solution:`import numpy as np

def conv2d_advanced(input, kernel, padding=0, stride=1, groups=1):
    input = np.array(input, dtype=float)
    kernel = np.array(kernel, dtype=float)

    batch, in_channels, H, W = input.shape
    out_channels, kernel_in_channels, kH, kW = kernel.shape

    # Pad input
    if padding > 0:
        input = np.pad(input, ((0, 0), (0, 0), (padding, padding), (padding, padding)), mode='constant')

    _, _, H_padded, W_padded = input.shape

    # Calculate output dimensions
    H_out = (H_padded - kH) // stride + 1
    W_out = (W_padded - kW) // stride + 1

    # Initialize output
    output = np.zeros((batch, out_channels, H_out, W_out))

    # Channels per group
    in_channels_per_group = in_channels // groups
    out_channels_per_group = out_channels // groups

    for g in range(groups):
        # Input channels for this group
        in_start = g * in_channels_per_group
        in_end = in_start + in_channels_per_group

        # Output channels for this group
        out_start = g * out_channels_per_group
        out_end = out_start + out_channels_per_group

        # Get the input slice for this group
        input_group = input[:, in_start:in_end, :, :]

        # Get the kernels for this group
        kernel_group = kernel[out_start:out_end, :, :, :]

        # Perform convolution for this group
        for b in range(batch):
            for oc in range(out_channels_per_group):
                for i in range(H_out):
                    for j in range(W_out):
                        h_start = i * stride
                        w_start = j * stride
                        region = input_group[b, :, h_start:h_start+kH, w_start:w_start+kW]
                        output[b, out_start + oc, i, j] = np.sum(region * kernel_group[oc])

    return output
`},{id:"iou-bounding-box",title:"IoU (Intersection over Union)",section:"cnn",difficulty:"easy",description:`
## IoU (Intersection over Union)

Implement Intersection over Union (IoU) for two axis-aligned bounding boxes.

### What is IoU?
IoU measures the overlap between two bounding boxes. It is the **most fundamental metric** in object detection, used for:
- Evaluating detection quality (mAP calculation)
- Matching predictions to ground truth
- Non-Maximum Suppression (NMS)

### Formula
\`\`\`
IoU = Area of Intersection / Area of Union
    = Intersection / (Area_A + Area_B - Intersection)
\`\`\`

### Bounding Box Format
Each box is \`[x1, y1, x2, y2]\` where:
- \`(x1, y1)\` = top-left corner
- \`(x2, y2)\` = bottom-right corner

### Computing Intersection
\`\`\`
inter_x1 = max(box_a_x1, box_b_x1)
inter_y1 = max(box_a_y1, box_b_y1)
inter_x2 = min(box_a_x2, box_b_x2)
inter_y2 = min(box_a_y2, box_b_y2)
\`\`\`
If \`inter_x1 >= inter_x2\` or \`inter_y1 >= inter_y2\`, there is no overlap (IoU = 0).

### Function Signature
\`\`\`python
def iou(box_a, box_b):
    # box_a, box_b: [x1, y1, x2, y2]
    # Returns: float (IoU score, rounded to 4 decimal places)
\`\`\`
    `,examples:[{input:"box_a=[0, 0, 2, 2], box_b=[1, 1, 3, 3]",output:"0.1429",explanation:"Intersection=1, Union=4+4-1=7, IoU=1/7≈0.1429"},{input:"box_a=[0, 0, 1, 1], box_b=[2, 2, 3, 3]",output:"0.0",explanation:"No overlap, IoU=0"}],starterCode:`import numpy as np

def iou(box_a, box_b):
    """
    Calculate Intersection over Union of two bounding boxes.

    Args:
        box_a: [x1, y1, x2, y2] first bounding box
        box_b: [x1, y1, x2, y2] second bounding box

    Returns:
        IoU score as float, rounded to 4 decimal places
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Partial overlap",input:"([0, 0, 2, 2], [1, 1, 3, 3])",expected:"0.1429",hidden:!1},{id:"2",description:"No overlap",input:"([0, 0, 1, 1], [2, 2, 3, 3])",expected:"0.0",hidden:!1},{id:"3",description:"One box inside the other",input:"([0, 0, 4, 4], [1, 1, 3, 3])",expected:"0.25",hidden:!0},{id:"4",description:"Identical boxes (perfect overlap)",input:"([0, 0, 5, 5], [0, 0, 5, 5])",expected:"1.0",hidden:!0}],hints:["Find the intersection rectangle using max of top-left corners and min of bottom-right corners","If the intersection has zero or negative width/height, IoU is 0","Union = Area_A + Area_B - Intersection"],solution:`import numpy as np

def iou(box_a, box_b):
    x1 = max(box_a[0], box_b[0])
    y1 = max(box_a[1], box_b[1])
    x2 = min(box_a[2], box_b[2])
    y2 = min(box_a[3], box_b[3])

    inter_w = max(0, x2 - x1)
    inter_h = max(0, y2 - y1)
    intersection = inter_w * inter_h

    area_a = (box_a[2] - box_a[0]) * (box_a[3] - box_a[1])
    area_b = (box_b[2] - box_b[0]) * (box_b[3] - box_b[1])
    union = area_a + area_b - intersection

    if union == 0:
        return 0.0

    return round(intersection / union, 4)
`},{id:"nms",title:"Non-Maximum Suppression (NMS)",section:"cnn",difficulty:"medium",description:`
## Non-Maximum Suppression (NMS)

Implement Non-Maximum Suppression to filter redundant object detections.

### Why NMS?
Object detectors often produce **multiple overlapping boxes** for the same object. NMS keeps only the best detection per object.

### Algorithm
1. Sort boxes by confidence score (descending)
2. Pick the box with the highest score, add to results
3. Remove all remaining boxes with IoU > threshold against the picked box
4. Repeat until no boxes remain

### Parameters
- **boxes**: List of \`[x1, y1, x2, y2]\` bounding boxes
- **scores**: Confidence score for each box
- **iou_threshold**: Boxes with IoU above this are suppressed (default: 0.5)

### Function Signature
\`\`\`python
def nms(boxes, scores, iou_threshold=0.5):
    # boxes: list of [x1, y1, x2, y2]
    # scores: list of confidence scores
    # Returns: list of kept indices (sorted by decreasing score)
\`\`\`
    `,examples:[{input:"boxes=[[0,0,4,4],[1,1,4,4],[6,6,8,8]], scores=[0.9,0.75,0.8], threshold=0.5",output:"[0, 2]",explanation:"Box 1 (score 0.75) suppressed by box 0 (score 0.9) due to IoU=0.56 > 0.5. Box 2 has no overlap."}],starterCode:`import numpy as np

def nms(boxes, scores, iou_threshold=0.5):
    """
    Apply Non-Maximum Suppression.

    Args:
        boxes: List of [x1, y1, x2, y2] bounding boxes
        scores: List of confidence scores for each box
        iou_threshold: IoU threshold for suppression (default: 0.5)

    Returns:
        List of indices of kept boxes, sorted by decreasing score
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Overlapping box suppressed",input:"([[0,0,4,4],[1,1,4,4],[6,6,8,8]], [0.9, 0.75, 0.8], 0.5)",expected:"[0, 2]",hidden:!1},{id:"2",description:"No suppression (no overlaps)",input:"([[0,0,1,1],[3,3,4,4],[6,6,7,7]], [0.5, 0.9, 0.7], 0.5)",expected:"[1, 2, 0]",hidden:!1},{id:"3",description:"Two overlapping pairs",input:"([[0,0,4,4],[1,1,4,4],[10,10,14,14],[11,11,14,14]], [0.9, 0.85, 0.8, 0.7], 0.5)",expected:"[0, 2]",hidden:!0},{id:"4",description:"All identical boxes, only highest score kept",input:"([[0,0,4,4],[0,0,4,4],[0,0,4,4]], [0.6, 0.9, 0.7], 0.5)",expected:"[1]",hidden:!0}],hints:["Sort indices by score in descending order","Use a while loop: pick the top-scoring box, then filter out boxes with IoU > threshold","You can reuse an IoU helper function inside NMS"],solution:`import numpy as np

def nms(boxes, scores, iou_threshold=0.5):
    def compute_iou(a, b):
        x1 = max(a[0], b[0])
        y1 = max(a[1], b[1])
        x2 = min(a[2], b[2])
        y2 = min(a[3], b[3])
        inter = max(0, x2 - x1) * max(0, y2 - y1)
        area_a = (a[2] - a[0]) * (a[3] - a[1])
        area_b = (b[2] - b[0]) * (b[3] - b[1])
        union = area_a + area_b - inter
        return inter / union if union > 0 else 0.0

    order = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
    keep = []

    while order:
        i = order.pop(0)
        keep.append(i)
        order = [j for j in order if compute_iou(boxes[i], boxes[j]) <= iou_threshold]

    return keep
`},{id:"focal-loss",title:"Focal Loss",section:"cnn",difficulty:"medium",description:"\n## Focal Loss\n\nImplement Focal Loss from the RetinaNet paper (Lin et al., 2017).\n\n### Motivation\nIn object detection, there is a huge **class imbalance** between background (easy negatives) and foreground (actual objects). Standard cross-entropy gives equal weight to all examples, causing easy negatives to dominate training.\n\n### Formula\n```\nFL(p_t) = -alpha_t * (1 - p_t)^gamma * log(p_t)\n```\n\nWhere:\n- `p_t = p` if `y=1`, else `p_t = 1 - p` (model's estimated probability for the true class)\n- `alpha`: Balancing factor (default 0.25)\n- `gamma`: Focusing parameter (default 2.0)\n\n### Key Insight\n- When `p_t` is high (easy example): `(1 - p_t)^gamma` → 0, so loss is **down-weighted**\n- When `p_t` is low (hard example): `(1 - p_t)^gamma` → 1, so loss is **unchanged**\n- `gamma=0` reduces to standard cross-entropy\n\n### Function Signature\n```python\ndef focal_loss(predictions, targets, alpha=0.25, gamma=2.0):\n    # predictions: predicted probabilities (array of floats in [0, 1])\n    # targets: ground truth labels (array of 0s and 1s)\n    # Returns: mean focal loss (float, rounded to 4 decimal places)\n```\n    ",examples:[{input:"predictions=[0.9, 0.1], targets=[1, 0], alpha=0.25, gamma=2.0",output:"0.0005",explanation:"Both are confident correct predictions, so focal loss heavily down-weights them"}],starterCode:`import numpy as np

def focal_loss(predictions, targets, alpha=0.25, gamma=2.0):
    """
    Compute focal loss for binary classification.

    Args:
        predictions: Predicted probabilities (array of floats in [0, 1])
        targets: Ground truth labels (array of 0s and 1s)
        alpha: Balancing factor (default: 0.25)
        gamma: Focusing parameter (default: 2.0)

    Returns:
        Mean focal loss, rounded to 4 decimal places
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Confident correct predictions",input:"([0.9, 0.1], [1, 0], 0.25, 2.0)",expected:"0.0005",hidden:!1},{id:"2",description:"Uncertain predictions",input:"([0.6, 0.4], [1, 0], 0.25, 2.0)",expected:"0.0409",hidden:!1},{id:"3",description:"Gamma=0 (standard cross-entropy with alpha)",input:"([0.9, 0.1], [1, 0], 0.25, 0.0)",expected:"0.0527",hidden:!0},{id:"4",description:"Wrong predictions (hard examples)",input:"([0.1, 0.9], [1, 0], 0.25, 2.0)",expected:"0.9325",hidden:!0}],hints:["First compute p_t: if target=1 then p_t=p, else p_t=1-p","Apply alpha_t: if target=1 then alpha_t=alpha, else alpha_t=1-alpha","Clip predictions to avoid log(0), e.g., np.clip(p, 1e-7, 1-1e-7)","FL = -alpha_t * (1 - p_t)^gamma * log(p_t), then take the mean"],solution:`import numpy as np

def focal_loss(predictions, targets, alpha=0.25, gamma=2.0):
    p = np.array(predictions, dtype=float)
    t = np.array(targets, dtype=float)

    p = np.clip(p, 1e-7, 1 - 1e-7)

    p_t = np.where(t == 1, p, 1 - p)
    alpha_t = np.where(t == 1, alpha, 1 - alpha)

    loss = -alpha_t * (1 - p_t) ** gamma * np.log(p_t)

    return round(float(np.mean(loss)), 4)
`},{id:"smooth-l1-loss",title:"Smooth L1 Loss",section:"cnn",difficulty:"easy",description:`
## Smooth L1 Loss (Huber Loss)

Implement Smooth L1 Loss, the standard loss for bounding box regression in object detection.

### Motivation
- **L2 loss** (MSE): Sensitive to outliers — large errors produce huge gradients
- **L1 loss** (MAE): Not differentiable at zero
- **Smooth L1**: Combines the best of both — quadratic for small errors, linear for large errors

### Formula
\`\`\`
         ⎧ 0.5 * x² / beta    if |x| < beta
L(x) =  ⎨
         ⎩ |x| - 0.5 * beta   if |x| >= beta
\`\`\`

Where \`x = prediction - target\` and \`beta\` controls the transition point (default: 1.0).

### Properties
- Differentiable everywhere (unlike L1)
- Less sensitive to outliers than L2
- At \`beta=1\`: transitions from quadratic to linear at \`|x|=1\`
- Used in Faster R-CNN, SSD, and most modern detectors

### Function Signature
\`\`\`python
def smooth_l1_loss(predictions, targets, beta=1.0):
    # predictions: predicted values (array)
    # targets: target values (array)
    # Returns: mean smooth L1 loss (float, rounded to 4 decimal places)
\`\`\`
    `,examples:[{input:"predictions=[0.5, 1.5], targets=[0.0, 0.0], beta=1.0",output:"0.5625",explanation:"|0.5|<1 → 0.5*0.25/1=0.125; |1.5|>=1 → 1.5-0.5=1.0; mean=(0.125+1.0)/2=0.5625"}],starterCode:`import numpy as np

def smooth_l1_loss(predictions, targets, beta=1.0):
    """
    Compute Smooth L1 (Huber) Loss.

    Args:
        predictions: Predicted values (array)
        targets: Target values (array)
        beta: Threshold for quadratic-to-linear transition (default: 1.0)

    Returns:
        Mean smooth L1 loss, rounded to 4 decimal places
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Small errors (quadratic region)",input:"([0.2, -0.3], [0.0, 0.0], 1.0)",expected:"0.0325",hidden:!1},{id:"2",description:"Large errors (linear region)",input:"([3.0, -2.0], [0.0, 0.0], 1.0)",expected:"2.0",hidden:!1},{id:"3",description:"Mixed small and large errors",input:"([0.5, 1.5, -2.0], [0.0, 0.0, 0.0], 1.0)",expected:"0.875",hidden:!0},{id:"4",description:"Custom beta threshold",input:"([0.3, 2.0], [0.0, 0.0], 0.5)",expected:"0.92",hidden:!0}],hints:["Compute the element-wise difference: x = predictions - targets","Use np.where to apply different formulas based on |x| < beta","Small errors: 0.5 * x^2 / beta; Large errors: |x| - 0.5 * beta"],solution:`import numpy as np

def smooth_l1_loss(predictions, targets, beta=1.0):
    p = np.array(predictions, dtype=float)
    t = np.array(targets, dtype=float)

    x = p - t
    abs_x = np.abs(x)

    loss = np.where(abs_x < beta, 0.5 * x ** 2 / beta, abs_x - 0.5 * beta)

    return round(float(np.mean(loss)), 4)
`},{id:"seg-metrics",title:"Segmentation Metrics",section:"cnn",difficulty:"medium",description:`
## Segmentation Metrics

Implement three key metrics for evaluating binary image segmentation: **IoU**, **Pixel Accuracy**, and **Dice Coefficient**.

### Metrics

#### 1. IoU (Intersection over Union / Jaccard Index)
\`\`\`
IoU = |Prediction ∩ Target| / |Prediction ∪ Target|
\`\`\`

#### 2. Pixel Accuracy
\`\`\`
Pixel Accuracy = Number of correct pixels / Total pixels
\`\`\`

#### 3. Dice Coefficient (F1 Score for pixels)
\`\`\`
Dice = 2 * |Prediction ∩ Target| / (|Prediction| + |Target|)
\`\`\`

### Relationship Between IoU and Dice
\`\`\`
Dice = 2 * IoU / (1 + IoU)
\`\`\`

### Expected Return Format
Return a dictionary with these keys:
- \`'iou'\`: Intersection over Union (float, rounded to 4 dp)
- \`'pixel_accuracy'\`: Pixel accuracy (float, rounded to 4 dp)
- \`'dice'\`: Dice coefficient (float, rounded to 4 dp)

### Function Signature
\`\`\`python
def segmentation_metrics(prediction, target):
    # prediction: binary mask (2D array of 0s and 1s)
    # target: binary ground truth mask (2D array of 0s and 1s)
    # Returns: dict with 'iou', 'pixel_accuracy', 'dice'
\`\`\`
    `,examples:[{input:"prediction=[[1,1],[0,0]], target=[[1,0],[0,1]]",output:'{"iou": 0.3333, "pixel_accuracy": 0.5, "dice": 0.5}',explanation:"Intersection=1, Union=3, IoU=1/3; 2 correct out of 4 pixels; Dice=2*1/(2+2)=0.5"}],starterCode:`import numpy as np

def segmentation_metrics(prediction, target):
    """
    Compute segmentation evaluation metrics.

    Args:
        prediction: Binary predicted mask (2D array of 0s and 1s)
        target: Binary ground truth mask (2D array of 0s and 1s)

    Returns:
        Dictionary with 'iou', 'pixel_accuracy', 'dice' (all rounded to 4 dp)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Partial overlap",input:"segmentation_metrics(np.array([[1,1],[0,0]]), np.array([[1,0],[0,1]]))",expected:'{"iou": 0.3333, "pixel_accuracy": 0.5, "dice": 0.5}',hidden:!1},{id:"2",description:"Perfect match",input:"segmentation_metrics(np.array([[1,0],[0,1]]), np.array([[1,0],[0,1]]))",expected:'{"iou": 1.0, "pixel_accuracy": 1.0, "dice": 1.0}',hidden:!1},{id:"3",description:"Dice coefficient check",input:"segmentation_metrics(np.array([[1,1,0],[0,0,0]]), np.array([[0,1,1],[0,0,0]]))['dice']",expected:"0.5",hidden:!0},{id:"4",description:"No overlap (zero IoU and Dice)",input:"segmentation_metrics(np.array([[1,1],[0,0]]), np.array([[0,0],[1,1]]))['iou']",expected:"0.0",hidden:!0}],hints:["Intersection: np.sum(prediction * target) (both are binary, so multiplication gives AND)","Union: np.sum(prediction) + np.sum(target) - intersection (or use np.sum((prediction + target) > 0))","Pixel accuracy: np.sum(prediction == target) / total_pixels"],solution:`import numpy as np

def segmentation_metrics(prediction, target):
    pred = np.array(prediction, dtype=float)
    targ = np.array(target, dtype=float)

    intersection = np.sum(pred * targ)
    union = np.sum(pred) + np.sum(targ) - intersection

    iou_val = intersection / union if union > 0 else 0.0
    pixel_acc = np.sum(pred == targ) / pred.size
    dice = 2 * intersection / (np.sum(pred) + np.sum(targ)) if (np.sum(pred) + np.sum(targ)) > 0 else 0.0

    return {
        'iou': round(float(iou_val), 4),
        'pixel_accuracy': round(float(pixel_acc), 4),
        'dice': round(float(dice), 4)
    }
`}],u=[{id:"scaled-dot-product-attention",title:"Scaled Dot-Product Attention",section:"transformers",difficulty:"medium",description:`
## Scaled Dot-Product Attention

Implement the core attention mechanism from "Attention Is All You Need".

### Formula
\`\`\`
Attention(Q, K, V) = softmax(Q @ K.T / sqrt(d_k)) @ V
\`\`\`

Where:
- Q: Queries (seq_len, d_k)
- K: Keys (seq_len, d_k)
- V: Values (seq_len, d_v)
- d_k: Dimension of keys

### Steps
1. Compute attention scores: Q @ K.T
2. Scale by sqrt(d_k)
3. Apply softmax
4. Multiply by V
    `,examples:[{input:"Q, K, V all (4, 8) - 4 tokens, 8 dims",output:"output (4, 8)",explanation:"Each token attends to all tokens"}],starterCode:`import numpy as np

def scaled_dot_product_attention(Q, K, V):
    """
    Compute scaled dot-product attention.

    Args:
        Q: Queries (seq_len, d_k)
        K: Keys (seq_len, d_k)
        V: Values (seq_len, d_v)

    Returns:
        output: Attention output (seq_len, d_v)
        attention_weights: Attention weights (seq_len, seq_len)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Output shape correct",input:"scaled_dot_product_attention(np.random.randn(4, 8), np.random.randn(4, 8), np.random.randn(4, 8))[0].shape",expected:"(4, 8)",hidden:!1},{id:"2",description:"Attention weights sum to 1",input:"bool(np.allclose(scaled_dot_product_attention(np.ones((4, 8)), np.ones((4, 8)), np.ones((4, 8)))[1].sum(axis=-1), 1.0))",expected:"True",hidden:!1},{id:"3",description:"Attention weights shape is (seq_len, seq_len)",input:"scaled_dot_product_attention(np.random.randn(6, 16), np.random.randn(6, 16), np.random.randn(6, 16))[1].shape",expected:"(6, 6)",hidden:!0},{id:"4",description:"Output is finite (no NaN or inf)",input:"(lambda: [np.random.seed(0), (out := scaled_dot_product_attention(np.random.randn(4, 8), np.random.randn(4, 8), np.random.randn(4, 8))[0]), bool(np.all(np.isfinite(out)))][-1])()",expected:"True",hidden:!0},{id:"5",description:"Attention weights are non-negative (valid probabilities)",input:"(lambda: [np.random.seed(1), (weights := scaled_dot_product_attention(np.random.randn(5, 10), np.random.randn(5, 10), np.random.randn(5, 10))[1]), bool(np.all(weights >= 0))][-1])()",expected:"True",hidden:!0}],hints:["Compute scores = Q @ K.T","Scale by sqrt(d_k) where d_k = Q.shape[-1]","Apply softmax along the last axis","Return softmax(scores) @ V"],solution:`import numpy as np

def softmax(x, axis=-1):
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)

def scaled_dot_product_attention(Q, K, V):
    d_k = Q.shape[-1]

    # Compute attention scores
    scores = Q @ K.T / np.sqrt(d_k)

    # Apply softmax
    attention_weights = softmax(scores)

    # Compute output
    output = attention_weights @ V

    return output, attention_weights
`},{id:"multi-head-attention",title:"Multi-Head Attention",section:"transformers",difficulty:"hard",description:`
## Multi-Head Attention

Implement multi-head attention from the Transformer architecture.

### Concept
\`\`\`
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) @ W_O

where head_i = Attention(Q @ W_Q_i, K @ W_K_i, V @ W_V_i)
\`\`\`

### Steps
1. Project Q, K, V with different learned projections for each head
2. Apply scaled dot-product attention in parallel
3. Concatenate heads
4. Project back to original dimension
    `,examples:[{input:"X (4, 64), num_heads=8, d_model=64",output:"output (4, 64)",explanation:"8 heads with d_k=8 each, concatenated to 64"}],starterCode:`import numpy as np

def multi_head_attention(Q, K, V, num_heads):
    """
    Multi-head attention mechanism.

    Args:
        Q: Queries (seq_len, d_model)
        K: Keys (seq_len, d_model)
        V: Values (seq_len, d_model)
        num_heads: Number of attention heads

    Returns:
        output: Multi-head attention output (seq_len, d_model)
    """
    seq_len, d_model = Q.shape
    assert d_model % num_heads == 0
    d_k = d_model // num_heads

    # Your code here
    pass
`,testCases:[{id:"1",description:"Output shape preserved",input:"multi_head_attention(np.random.randn(4, 64), np.random.randn(4, 64), np.random.randn(4, 64), 8).shape",expected:"(4, 64)",hidden:!1},{id:"2",description:"Different d_model size (32 dims, 4 heads)",input:"multi_head_attention(np.random.randn(6, 32), np.random.randn(6, 32), np.random.randn(6, 32), 4).shape",expected:"(6, 32)",hidden:!0},{id:"3",description:"Single head case (equivalent to standard attention)",input:"multi_head_attention(np.random.randn(4, 16), np.random.randn(4, 16), np.random.randn(4, 16), 1).shape",expected:"(4, 16)",hidden:!0},{id:"4",description:"Output is finite (no NaN or inf)",input:"(lambda: [np.random.seed(42), (out := multi_head_attention(np.random.randn(4, 64), np.random.randn(4, 64), np.random.randn(4, 64), 8)), bool(np.all(np.isfinite(out)))][-1])()",expected:"True",hidden:!0},{id:"5",description:"Large d_model with many heads (128 dims, 16 heads)",input:"multi_head_attention(np.random.randn(3, 128), np.random.randn(3, 128), np.random.randn(3, 128), 16).shape",expected:"(3, 128)",hidden:!0}],hints:["Reshape Q, K, V to (seq_len, num_heads, d_k)","Apply attention for each head","Reshape back to (seq_len, d_model)"],solution:`import numpy as np

def softmax(x, axis=-1):
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)

def multi_head_attention(Q, K, V, num_heads):
    seq_len, d_model = Q.shape
    d_k = d_model // num_heads

    # Reshape to (seq_len, num_heads, d_k)
    Q = Q.reshape(seq_len, num_heads, d_k)
    K = K.reshape(seq_len, num_heads, d_k)
    V = V.reshape(seq_len, num_heads, d_k)

    # Transpose to (num_heads, seq_len, d_k)
    Q = Q.transpose(1, 0, 2)
    K = K.transpose(1, 0, 2)
    V = V.transpose(1, 0, 2)

    # Scaled dot-product attention for each head
    scores = Q @ K.transpose(0, 2, 1) / np.sqrt(d_k)
    attention = softmax(scores)
    heads = attention @ V

    # Transpose and reshape back
    heads = heads.transpose(1, 0, 2)  # (seq_len, num_heads, d_k)
    output = heads.reshape(seq_len, d_model)

    return output
`},{id:"positional-encoding",title:"Sinusoidal Positional Encoding",section:"transformers",difficulty:"medium",description:`
## Sinusoidal Positional Encoding

Implement the positional encoding from the original Transformer paper.

### Formulas
\`\`\`
PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
\`\`\`

Where:
- pos: Position in sequence
- i: Dimension index
- d_model: Model dimension

### Purpose
- Injects position information into embeddings
- Allows model to learn relative positions
- Fixed (not learned) encodings
    `,examples:[{input:"max_len=100, d_model=512",output:"PE matrix (100, 512)",explanation:"Position encoding for 100 positions"}],starterCode:`import numpy as np

def positional_encoding(max_len, d_model):
    """
    Generate sinusoidal positional encodings.

    Args:
        max_len: Maximum sequence length
        d_model: Model dimension

    Returns:
        PE: Positional encoding matrix (max_len, d_model)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Correct shape",input:"positional_encoding(50, 64).shape",expected:"(50, 64)",hidden:!1},{id:"2",description:"First position starts with sin(0)=0",input:"bool(np.isclose(positional_encoding(10, 4)[0, 0], 0.0))",expected:"True",hidden:!0},{id:"3",description:"First position odd dim starts with cos(0)=1",input:"bool(np.isclose(positional_encoding(10, 4)[0, 1], 1.0))",expected:"True",hidden:!0},{id:"4",description:"Even columns use sin, odd columns use cos pattern",input:"(lambda: (pe := positional_encoding(100, 8), bool(np.allclose(pe[:, 0], np.sin(np.arange(100) / (10000.0 ** (0.0 / 8))))))[-1])()",expected:"True",hidden:!0},{id:"5",description:"Values are bounded between -1 and 1",input:"(lambda: (pe := positional_encoding(50, 64), bool(np.all(pe >= -1.0) and np.all(pe <= 1.0)))[-1])()",expected:"True",hidden:!0}],hints:["Create position indices: np.arange(max_len)","Create dimension indices for the divisor","Use div_term = 10000^(2i/d_model)","Apply sin to even indices, cos to odd indices"],solution:`import numpy as np

def positional_encoding(max_len, d_model):
    PE = np.zeros((max_len, d_model))

    position = np.arange(max_len)[:, np.newaxis]
    div_term = np.exp(np.arange(0, d_model, 2) * (-np.log(10000.0) / d_model))

    PE[:, 0::2] = np.sin(position * div_term)
    PE[:, 1::2] = np.cos(position * div_term)

    return PE
`},{id:"layer-norm",title:"Layer Normalization",section:"transformers",difficulty:"easy",description:`
## Layer Normalization

Implement layer normalization, used in Transformers instead of batch normalization.

### Formula
\`\`\`
LayerNorm(x) = γ * (x - μ) / sqrt(σ² + ε) + β
\`\`\`

### Difference from BatchNorm
- **BatchNorm**: Normalizes across batch dimension
- **LayerNorm**: Normalizes across feature dimension
- LayerNorm works better for sequence models
    `,examples:[{input:"X (batch, seq_len, features)",output:"Normalized X, each position normalized independently",explanation:"Normalize across last dimension"}],starterCode:`import numpy as np

def layer_norm(X, gamma, beta, eps=1e-5):
    """
    Apply layer normalization.

    Args:
        X: Input (batch, seq_len, features) or (seq_len, features)
        gamma: Scale parameter (features,)
        beta: Shift parameter (features,)
        eps: Small constant

    Returns:
        output: Normalized tensor
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Output mean near zero",input:"bool(np.allclose(layer_norm(np.array([[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0]]), np.ones(4), np.zeros(4)).mean(axis=-1), 0.0, atol=1e-5))",expected:"True",hidden:!1},{id:"2",description:"Gamma and beta work",input:"bool(np.allclose(layer_norm(np.array([[0.0, 0.0, 2.0, 2.0]]), np.array([1.0, 2.0, 1.0, 2.0]), np.zeros(4)), np.array([[-1.0, -2.0, 1.0, 2.0]])))",expected:"True",hidden:!0},{id:"3",description:"Variance approximately 1 after normalization (gamma=1, beta=0)",input:"bool(np.allclose(layer_norm(np.random.randn(5, 64), np.ones(64), np.zeros(64)).var(axis=-1), 1.0, atol=0.05))",expected:"True",hidden:!0},{id:"4",description:"Works with 3D input (batch, seq_len, features)",input:"bool(np.allclose(layer_norm(np.random.randn(2, 3, 8), np.ones(8), np.zeros(8)).mean(axis=-1), 0.0, atol=1e-5))",expected:"True",hidden:!0}],hints:["Compute mean and variance along the last axis","Use keepdims=True for proper broadcasting","Apply normalization: (x - mean) / sqrt(var + eps)"],solution:`import numpy as np

def layer_norm(X, gamma, beta, eps=1e-5):
    # Compute statistics along last dimension
    mean = np.mean(X, axis=-1, keepdims=True)
    var = np.var(X, axis=-1, keepdims=True)

    # Normalize
    X_norm = (X - mean) / np.sqrt(var + eps)

    # Scale and shift
    return gamma * X_norm + beta
`},{id:"causal-mask",title:"Causal Attention Mask",section:"transformers",difficulty:"easy",description:`
## Causal (Autoregressive) Mask

Create a causal mask for decoder self-attention to prevent attending to future tokens.

### Mask Structure
\`\`\`
[[0, -inf, -inf, -inf],
 [0,    0, -inf, -inf],
 [0,    0,    0, -inf],
 [0,    0,    0,    0]]
\`\`\`

### Usage
- Add mask to attention scores before softmax
- -inf becomes 0 after softmax
- Ensures each position only attends to previous positions
    `,examples:[{input:"seq_len=4",output:"Lower triangular mask (4, 4)",explanation:"Position i can only attend to positions <= i"}],starterCode:`import numpy as np

def create_causal_mask(seq_len):
    """
    Create a causal attention mask.

    Args:
        seq_len: Sequence length

    Returns:
        mask: Causal mask (seq_len, seq_len)
               0 for allowed positions, -inf for masked
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Correct shape and pattern",input:"create_causal_mask(4).shape",expected:"(4, 4)",hidden:!1},{id:"2",description:"Lower triangular zeros, upper triangular -inf",input:'bool(np.allclose(create_causal_mask(3), np.array([[0.0, float("-inf"), float("-inf")], [0.0, 0.0, float("-inf")], [0.0, 0.0, 0.0]])))',expected:"True",hidden:!0},{id:"3",description:"Diagonal is all zeros (each position attends to itself)",input:"bool(np.all(np.diag(create_causal_mask(5)) == 0.0))",expected:"True",hidden:!0},{id:"4",description:"Upper triangle is all -inf",input:'(lambda: (mask := create_causal_mask(4), upper := mask[np.triu_indices(4, k=1)], bool(np.all(upper == float("-inf"))))[-1])()',expected:"True",hidden:!0}],hints:["Create a matrix of ones using np.ones((seq_len, seq_len))","Use np.triu to get upper triangular matrix (excluding diagonal)","Replace 1s with -inf"],solution:`import numpy as np

def create_causal_mask(seq_len):
    # Create upper triangular matrix (above diagonal)
    mask = np.triu(np.ones((seq_len, seq_len)), k=1)
    # Replace 1s with -inf
    mask = np.where(mask == 1, float('-inf'), 0.0)
    return mask
`},{id:"bpe-tokenization",title:"BPE Tokenization",section:"transformers",difficulty:"medium",description:`
## Byte-Pair Encoding (BPE) Tokenization

Implement the training step of BPE, the tokenization algorithm used by GPT, LLaMA, and most modern LLMs.

### Algorithm
1. Start with words split into individual character tokens
2. Count frequency of all adjacent token pairs across the corpus
3. Merge the most frequent pair into a new token
4. Repeat for \`num_merges\` iterations

### Input Format
- \`word_freqs\`: Dict mapping space-separated token sequences to frequency
  - e.g., \`{"h u g </w>": 10, "p u g </w>": 5}\`
  - \`</w>\` marks end-of-word

### Return Format
Return a list of merge pair tuples, in the order they were applied.

### Why BPE?
- Handles any input text (no unknown tokens)
- Balances character-level and word-level tokenization
- Common subwords become single tokens, rare words split into subwords
    `,examples:[{input:'word_freqs = {"h u g </w>": 10, "p u g </w>": 5, "b u g </w>": 2}, num_merges=3',output:"[('u', 'g'), ('ug', '</w>'), ('h', 'ug</w>')]",explanation:'"ug" is the most frequent pair (freq 17), merged first'}],starterCode:`import numpy as np
from collections import Counter

def bpe_train(word_freqs, num_merges):
    """
    Train BPE tokenizer by learning merge rules.

    Args:
        word_freqs: Dict mapping space-separated token sequences to frequency
                    e.g., {"h u g </w>": 10, "p u g </w>": 5}
        num_merges: Number of merge operations to perform

    Returns:
        merges: List of (token_a, token_b) tuples merged, in order
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"First merge is most frequent pair",input:'bpe_train({"h u g </w>": 10, "p u g </w>": 5, "b u g </w>": 2}, 3)[0]',expected:"('u', 'g')",hidden:!1},{id:"2",description:"Correct number of merges returned",input:'len(bpe_train({"h u g </w>": 10, "p u g </w>": 5, "b u g </w>": 2}, 3))',expected:"3",hidden:!1},{id:"3",description:"Second merge builds on first",input:'bpe_train({"h u g </w>": 10, "p u g </w>": 5, "b u g </w>": 2}, 3)[1]',expected:"('ug', '</w>')",hidden:!0},{id:"4",description:"Works with different corpus",input:'bpe_train({"a b c </w>": 10, "a b </w>": 7, "b c </w>": 3}, 2)[0]',expected:"('a', 'b')",hidden:!0}],hints:["Split each word into tokens using word.split()","Count pair frequencies by iterating adjacent tokens, weighted by word frequency","Find the most frequent pair with max(pair_freqs, key=pair_freqs.get)","Merge the pair: scan tokens left-to-right, joining matching adjacent pairs"],solution:`import numpy as np
from collections import Counter

def bpe_train(word_freqs, num_merges):
    # Split each word into tokens
    splits = {word: word.split() for word in word_freqs}
    merges = []

    for _ in range(num_merges):
        # Count pair frequencies
        pair_freqs = Counter()
        for word, freq in word_freqs.items():
            tokens = splits[word]
            for i in range(len(tokens) - 1):
                pair_freqs[(tokens[i], tokens[i + 1])] += freq

        if not pair_freqs:
            break

        # Find and record most frequent pair
        best_pair = max(pair_freqs, key=pair_freqs.get)
        merges.append(best_pair)

        # Merge the pair in all words
        for word in splits:
            tokens = splits[word]
            new_tokens = []
            i = 0
            while i < len(tokens):
                if i < len(tokens) - 1 and (tokens[i], tokens[i + 1]) == best_pair:
                    new_tokens.append(tokens[i] + tokens[i + 1])
                    i += 2
                else:
                    new_tokens.append(tokens[i])
                    i += 1
            splits[word] = new_tokens

    return merges
`},{id:"rope-embeddings",title:"Rotary Positional Embeddings (RoPE)",section:"transformers",difficulty:"medium",description:`
## Rotary Positional Embeddings (RoPE)

Implement RoPE, the positional encoding used by LLaMA, Mistral, GPT-NeoX, and most modern LLMs.

### How It Works
Instead of *adding* position information to embeddings (like sinusoidal encoding), RoPE *rotates* pairs of dimensions in Q and K by position-dependent angles.

### Formulas
For position \`pos\` and dimension pair \`(2i, 2i+1)\`:
\`\`\`
θ_i = 1 / (10000^(2i / d_model))

q_rot[2i]   = q[2i] · cos(pos · θ_i) - q[2i+1] · sin(pos · θ_i)
q_rot[2i+1] = q[2i] · sin(pos · θ_i) + q[2i+1] · cos(pos · θ_i)
\`\`\`

Apply the same rotation to both Q and K.

### Key Properties
- **Relative position awareness**: The dot product between rotated Q and K depends only on the relative position difference
- **Norm preservation**: Rotation does not change vector magnitudes
- **No learned parameters**: Computed directly from position indices

### Why RoPE Over Sinusoidal?
- Encodes *relative* positions naturally (sinusoidal is absolute)
- Better extrapolation to longer sequences
- Applied directly in attention computation (not added to embeddings)
    `,examples:[{input:"Q, K both (4, 8) - 4 tokens, 8 dims",output:"Q_rot (4, 8), K_rot (4, 8)",explanation:"Each pair of dimensions is rotated by a position-dependent angle"}],starterCode:`import numpy as np

def apply_rope(Q, K):
    """
    Apply Rotary Positional Embeddings to Q and K.

    Args:
        Q: Queries (seq_len, d_model) where d_model is even
        K: Keys (seq_len, d_model)

    Returns:
        Q_rot: Rotated queries (seq_len, d_model)
        K_rot: Rotated keys (seq_len, d_model)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Output shape preserved",input:"apply_rope(np.ones((4, 8)), np.ones((4, 8)))[0].shape",expected:"(4, 8)",hidden:!1},{id:"2",description:"Position 0 is unchanged (rotation angle is 0)",input:"bool(np.allclose(apply_rope(np.array([[1.0, 2.0, 3.0, 4.0]]), np.ones((1, 4)))[0], np.array([[1.0, 2.0, 3.0, 4.0]])))",expected:"True",hidden:!1},{id:"3",description:"Rotation preserves vector norms",input:"(lambda: [np.random.seed(42), (Q := np.random.randn(6, 8)), (Q_rot := apply_rope(Q, Q)[0]), bool(np.allclose(np.linalg.norm(Q_rot, axis=-1), np.linalg.norm(Q, axis=-1)))][-1])()",expected:"True",hidden:!0},{id:"4",description:"Both Q_rot and K_rot returned with correct shapes",input:"(lambda: (result := apply_rope(np.ones((5, 16)), np.ones((5, 16))), bool(result[0].shape == (5, 16) and result[1].shape == (5, 16)))[-1])()",expected:"True",hidden:!0},{id:"5",description:"K is also rotated (not identical to input)",input:"(lambda: (K := np.ones((4, 8)), K_rot := apply_rope(K, K)[1], bool(not np.allclose(K_rot[1:], K[1:])))[-1])()",expected:"True",hidden:!0}],hints:["Compute θ_i = 1.0 / (10000^(2i/d)) for dimension indices i = 0, 1, ..., d/2-1","Multiply positions (0 to seq_len-1) by θ to get angles matrix (seq_len, d/2)","Even dims: q_even * cos(angles) - q_odd * sin(angles)","Odd dims: q_even * sin(angles) + q_odd * cos(angles)"],solution:`import numpy as np

def apply_rope(Q, K):
    seq_len, d = Q.shape

    # Compute rotation angles
    positions = np.arange(seq_len)[:, np.newaxis]  # (seq_len, 1)
    dims = np.arange(0, d, 2)  # (d/2,)
    theta = 1.0 / (10000.0 ** (dims / d))  # (d/2,)
    angles = positions * theta  # (seq_len, d/2)

    cos_a = np.cos(angles)
    sin_a = np.sin(angles)

    # Rotate Q
    Q_rot = np.zeros_like(Q)
    Q_rot[:, 0::2] = Q[:, 0::2] * cos_a - Q[:, 1::2] * sin_a
    Q_rot[:, 1::2] = Q[:, 0::2] * sin_a + Q[:, 1::2] * cos_a

    # Rotate K
    K_rot = np.zeros_like(K)
    K_rot[:, 0::2] = K[:, 0::2] * cos_a - K[:, 1::2] * sin_a
    K_rot[:, 1::2] = K[:, 0::2] * sin_a + K[:, 1::2] * cos_a

    return Q_rot, K_rot
`},{id:"grouped-query-attention",title:"Grouped Query Attention (GQA)",section:"transformers",difficulty:"medium",description:`
## Grouped Query Attention (GQA)

Implement GQA, the efficient attention variant used in LLaMA 2, Mistral, Gemma, and most modern LLMs.

### Concept
In standard Multi-Head Attention (MHA), each head has its own Q, K, and V projections. GQA reduces memory by sharing KV heads across groups of query heads:

| Variant | Q Heads | KV Heads | Used In |
|---------|---------|----------|---------|
| MHA | H | H | Original Transformer |
| GQA | H | G (1 < G < H) | LLaMA 2, Mistral |
| MQA | H | 1 | PaLM, Falcon |

### Steps
1. Reshape Q into \`num_q_heads\` heads of size \`d_head\`
2. Reshape K, V into \`num_kv_heads\` heads of size \`d_head\`
3. Repeat each KV head \`group_size\` times (group_size = num_q_heads / num_kv_heads)
4. Apply scaled dot-product attention per head
5. Concatenate all heads

### Why GQA?
- Reduces KV cache size by \`num_q_heads / num_kv_heads\` factor
- Faster inference with minimal quality loss vs MHA
- Key optimization for serving large language models
    `,examples:[{input:"Q (4, 64), K (4, 16), V (4, 16), num_q_heads=8, num_kv_heads=2",output:"output (4, 64)",explanation:"8 query heads grouped into 2 KV groups of 4, d_head=8"}],starterCode:`import numpy as np

def grouped_query_attention(Q, K, V, num_q_heads, num_kv_heads):
    """
    Grouped Query Attention.

    Args:
        Q: Queries (seq_len, num_q_heads * d_head)
        K: Keys (seq_len, num_kv_heads * d_head)
        V: Values (seq_len, num_kv_heads * d_head)
        num_q_heads: Number of query heads
        num_kv_heads: Number of key/value heads (divides num_q_heads)

    Returns:
        output: (seq_len, num_q_heads * d_head)
    """
    seq_len = Q.shape[0]
    d_head = Q.shape[1] // num_q_heads
    group_size = num_q_heads // num_kv_heads

    # Your code here
    pass
`,testCases:[{id:"1",description:"GQA output shape (8 Q heads, 2 KV heads)",input:"grouped_query_attention(np.random.randn(4, 64), np.random.randn(4, 16), np.random.randn(4, 16), 8, 2).shape",expected:"(4, 64)",hidden:!1},{id:"2",description:"MQA case (1 KV head shared by all Q heads)",input:"grouped_query_attention(np.random.randn(4, 32), np.random.randn(4, 4), np.random.randn(4, 4), 8, 1).shape",expected:"(4, 32)",hidden:!1},{id:"3",description:"MHA case (num_q_heads == num_kv_heads)",input:"grouped_query_attention(np.random.randn(4, 64), np.random.randn(4, 64), np.random.randn(4, 64), 8, 8).shape",expected:"(4, 64)",hidden:!0},{id:"4",description:"Output is finite (no NaN or inf)",input:"(lambda: [np.random.seed(7), (out := grouped_query_attention(np.random.randn(4, 64), np.random.randn(4, 16), np.random.randn(4, 16), 8, 2)), bool(np.all(np.isfinite(out)))][-1])()",expected:"True",hidden:!0}],hints:["Reshape Q to (num_q_heads, seq_len, d_head) using reshape then transpose","Reshape K, V to (num_kv_heads, seq_len, d_head) the same way","Use np.repeat(K, group_size, axis=0) to expand KV heads to match Q heads","Apply attention: softmax(Q @ K^T / sqrt(d_head)) @ V for each head","Transpose and reshape back to (seq_len, num_q_heads * d_head)"],solution:`import numpy as np

def softmax(x, axis=-1):
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)

def grouped_query_attention(Q, K, V, num_q_heads, num_kv_heads):
    seq_len = Q.shape[0]
    d_head = Q.shape[1] // num_q_heads
    group_size = num_q_heads // num_kv_heads

    # Reshape to per-head format: (num_heads, seq_len, d_head)
    Q = Q.reshape(seq_len, num_q_heads, d_head).transpose(1, 0, 2)
    K = K.reshape(seq_len, num_kv_heads, d_head).transpose(1, 0, 2)
    V = V.reshape(seq_len, num_kv_heads, d_head).transpose(1, 0, 2)

    # Repeat KV heads to match Q heads
    K = np.repeat(K, group_size, axis=0)
    V = np.repeat(V, group_size, axis=0)

    # Scaled dot-product attention per head
    scores = Q @ K.transpose(0, 2, 1) / np.sqrt(d_head)
    attention = softmax(scores, axis=-1)
    heads = attention @ V

    # Concatenate heads
    output = heads.transpose(1, 0, 2).reshape(seq_len, -1)
    return output
`},{id:"sliding-window-attention",title:"Sliding Window Attention",section:"transformers",difficulty:"easy",description:`
## Sliding Window Attention

Create a sliding window causal attention mask, used in Mistral, Gemma, and other efficient LLMs.

### Concept
Standard causal attention lets each token attend to *all* previous tokens. With long sequences this is expensive (O(n²) memory). Sliding window attention restricts each token to only attend to the \`window_size\` nearest previous tokens.

### Mask Structure (seq_len=5, window_size=3)
\`\`\`
[[  0, -inf, -inf, -inf, -inf],
 [  0,    0, -inf, -inf, -inf],
 [  0,    0,    0, -inf, -inf],
 [-inf,   0,    0,    0, -inf],
 [-inf, -inf,  0,    0,    0]]
\`\`\`

### Rules
- Position \`i\` can attend to position \`j\` if:
  - \`j <= i\` (causal: no future tokens)
  - \`i - j < window_size\` (within the window)
- Allowed positions get \`0\`, masked positions get \`-inf\`

### Why Sliding Window?
- Reduces memory from O(n²) to O(n × window_size)
- Information still propagates across layers (layer L sees L × window_size tokens)
- Combined with full attention layers in some architectures
    `,examples:[{input:"seq_len=4, window_size=2",output:"(4, 4) mask where each token sees at most 2 previous tokens",explanation:"Position 3 attends to positions 2 and 3 only"}],starterCode:`import numpy as np

def sliding_window_mask(seq_len, window_size):
    """
    Create a sliding window causal attention mask.

    Args:
        seq_len: Sequence length
        window_size: Number of tokens each position can attend to
                     (including itself)

    Returns:
        mask: (seq_len, seq_len) with 0 for allowed, -inf for masked
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Correct shape",input:"sliding_window_mask(6, 3).shape",expected:"(6, 6)",hidden:!1},{id:"2",description:"Out-of-window position is masked",input:'bool(sliding_window_mask(4, 2)[2, 0] == float("-inf"))',expected:"True",hidden:!1},{id:"3",description:"In-window position is allowed",input:"bool(sliding_window_mask(4, 2)[2, 1] == 0.0)",expected:"True",hidden:!0},{id:"4",description:"Large window equals causal mask",input:'bool(np.array_equal(sliding_window_mask(4, 10), np.where(np.triu(np.ones((4, 4)), k=1) == 1, float("-inf"), 0.0)))',expected:"True",hidden:!0},{id:"5",description:"Diagonal is always allowed (self-attention)",input:"bool(np.all(np.diag(sliding_window_mask(6, 1)) == 0.0))",expected:"True",hidden:!0}],hints:["Create row and column index grids using np.arange","Allowed condition: (col <= row) AND (row - col < window_size)",'Use np.where(allowed, 0.0, float("-inf")) to build the mask'],solution:`import numpy as np

def sliding_window_mask(seq_len, window_size):
    rows = np.arange(seq_len)[:, None]
    cols = np.arange(seq_len)[None, :]

    # Causal: can only attend to current or past positions
    # Window: distance must be less than window_size
    allowed = (cols <= rows) & (rows - cols < window_size)

    return np.where(allowed, 0.0, float('-inf'))
`}],c=[{id:"vae-reparameterization",title:"VAE Reparameterization Trick",section:"generative-models",difficulty:"medium",description:`
## VAE Reparameterization Trick

Implement the reparameterization trick that allows backpropagation through stochastic sampling in VAEs.

### The Problem
We want to sample z ~ N(μ, σ²), but sampling is not differentiable.

### The Solution
\`\`\`
ε ~ N(0, 1)
z = μ + σ * ε
\`\`\`

### Why It Works
- ε is sampled independently of parameters
- z is now a deterministic function of μ, σ, and ε
- Gradients can flow through μ and σ
    `,examples:[{input:"mu = [0, 1], log_var = [0, 0]",output:"z = mu + exp(0.5 * log_var) * epsilon",explanation:"log_var=0 means σ=1"}],starterCode:`import numpy as np

def reparameterize(mu, log_var):
    """
    Sample from latent distribution using reparameterization trick.

    Args:
        mu: Mean of latent distribution (batch, latent_dim)
        log_var: Log variance of latent distribution (batch, latent_dim)

    Returns:
        z: Sampled latent vectors (batch, latent_dim)
    """
    np.random.seed(42)  # For reproducibility
    # Your code here
    pass
`,testCases:[{id:"1",description:"Output shape matches input",input:"reparameterize(np.zeros((2, 4)), np.zeros((2, 4))).shape",expected:"(2, 4)",hidden:!1},{id:"2",description:"Zero variance case has correct shape",input:"reparameterize(np.ones((3, 5)), np.full((3, 5), -1000)).shape",expected:"(3, 5)",hidden:!0},{id:"3",description:"When log_var is very negative, z ≈ mu (sigma ≈ 0)",input:"bool(np.allclose(reparameterize(np.array([[3.0, 4.0]]), np.full((1, 2), -100)), np.array([[3.0, 4.0]]), atol=1e-5))",expected:"True",hidden:!0},{id:"4",description:"Verify reparameterization formula: z = mu + exp(0.5*log_var)*eps",input:`(lambda: (
    mu := np.zeros((2, 3)),
    log_var := np.ones((2, 3)),
    z := reparameterize(mu, log_var),
    np.random.seed(42),
    eps := np.random.randn(2, 3),
    expected := mu + np.exp(0.5 * log_var) * eps,
    bool(np.allclose(z, expected))
)[-1])()`,expected:"True",hidden:!0},{id:"5",description:"When log_var=0, std=1, so z = mu + epsilon",input:`(lambda: (
    mu := np.array([[5.0, -3.0, 1.0]]),
    z := reparameterize(mu, np.zeros((1, 3))),
    np.random.seed(42),
    eps := np.random.randn(1, 3),
    bool(np.allclose(z, mu + eps))
)[-1])()`,expected:"True",hidden:!0}],hints:["std = exp(0.5 * log_var)","Sample epsilon from standard normal","z = mu + std * epsilon"],solution:`import numpy as np

def reparameterize(mu, log_var):
    np.random.seed(42)
    # Compute standard deviation
    std = np.exp(0.5 * log_var)
    # Sample epsilon from standard normal
    eps = np.random.randn(*mu.shape)
    # Reparameterization trick
    z = mu + std * eps
    return z
`},{id:"vae-loss",title:"VAE Loss Function",section:"generative-models",difficulty:"medium",description:`
## VAE Loss (ELBO)

Implement the VAE loss function: reconstruction loss + KL divergence.

### Loss Components
\`\`\`
L = L_reconstruction + L_KL

L_reconstruction = MSE(x, x_reconstructed)
L_KL = -0.5 * sum(1 + log_var - mu² - exp(log_var))
\`\`\`

### Intuition
- **Reconstruction loss**: Output should match input
- **KL divergence**: Latent distribution should be close to N(0,1)
    `,examples:[{input:"Perfect reconstruction, mu=0, var=1",output:"Loss ≈ 0",explanation:"Both terms are minimized"}],starterCode:`import numpy as np

def vae_loss(x, x_reconstructed, mu, log_var):
    """
    Compute VAE loss (negative ELBO).

    Args:
        x: Original input (batch, features)
        x_reconstructed: Reconstructed input (batch, features)
        mu: Latent mean (batch, latent_dim)
        log_var: Latent log variance (batch, latent_dim)

    Returns:
        total_loss: Combined loss
        recon_loss: Reconstruction loss
        kl_loss: KL divergence
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Perfect case",input:"bool(np.allclose(vae_loss(np.zeros((2, 4)), np.zeros((2, 4)), np.zeros((2, 2)), np.zeros((2, 2))), (0.0, 0.0, 0.0), atol=1e-6))",expected:"True",hidden:!1},{id:"2",description:"Non-zero KL",input:"bool(np.allclose(vae_loss(np.zeros((1, 4)), np.zeros((1, 4)), np.ones((1, 2)), np.zeros((1, 2))), (0.5, 0.0, 0.5), atol=1e-4))",expected:"True",hidden:!0},{id:"3",description:"Non-zero reconstruction loss",input:"(np.ones((1, 4)), np.zeros((1, 4)), np.zeros((1, 2)), np.zeros((1, 2)))",expected:"(1.0, 1.0, 0.0)",hidden:!0},{id:"4",description:"KL is zero when mu=0, log_var=0 (standard normal)",input:"vae_loss(np.zeros((2, 4)), np.zeros((2, 4)), np.zeros((2, 3)), np.zeros((2, 3)))[2]",expected:"0.0",hidden:!0},{id:"5",description:"Total loss equals recon + KL",input:`(lambda: (
    result := vae_loss(np.ones((2, 4)), np.zeros((2, 4)), np.ones((2, 3)), np.ones((2, 3))),
    bool(abs(result[0] - (result[1] + result[2])) < 1e-4)
)[-1])()`,expected:"True",hidden:!0}],hints:["Reconstruction: np.mean((x - x_reconstructed)²)","KL: -0.5 * sum(1 + log_var - mu² - exp(log_var))","Average over batch"],solution:`import numpy as np

def vae_loss(x, x_reconstructed, mu, log_var):
    # Reconstruction loss (MSE)
    recon_loss = np.mean((x - x_reconstructed) ** 2)

    # KL divergence
    kl_loss = -0.5 * np.mean(1 + log_var - mu**2 - np.exp(log_var))

    total_loss = recon_loss + kl_loss

    return round(total_loss, 4), round(recon_loss, 4), round(kl_loss, 4)
`},{id:"diffusion-noise-schedule",title:"Diffusion Noise Schedule",section:"generative-models",difficulty:"easy",description:`
## Diffusion Noise Schedule

Implement a linear noise schedule for diffusion models.

### Linear Schedule
\`\`\`
β_t = β_start + t * (β_end - β_start) / T

where t = 0, 1, ..., T-1
\`\`\`

### Derived Quantities
\`\`\`
α_t = 1 - β_t
ᾱ_t = prod(α_1, ..., α_t)  # cumulative product
\`\`\`

These control how much noise is added at each step.
    `,examples:[{input:"T=1000, beta_start=0.0001, beta_end=0.02",output:"betas, alphas, alpha_bars arrays",explanation:"Standard DDPM schedule"}],starterCode:`import numpy as np

def linear_noise_schedule(T, beta_start=0.0001, beta_end=0.02):
    """
    Create linear noise schedule for diffusion.

    Args:
        T: Number of diffusion steps
        beta_start: Starting beta value
        beta_end: Ending beta value

    Returns:
        betas: Beta values (T,)
        alphas: Alpha values (T,)
        alpha_bars: Cumulative alpha product (T,)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Beta range correct",input:"linear_noise_schedule(100, 0.0001, 0.02)[0].shape",expected:"(100,)",hidden:!1},{id:"2",description:"Alpha bar decreases - last < first",input:"bool(linear_noise_schedule(50, 0.001, 0.01)[2][-1] < linear_noise_schedule(50, 0.001, 0.01)[2][0])",expected:"True",hidden:!0},{id:"3",description:"First beta equals beta_start",input:"round(float(linear_noise_schedule(100, 0.0001, 0.02)[0][0]), 4)",expected:"0.0001",hidden:!0},{id:"4",description:"alphas = 1 - betas relationship holds",input:`(lambda: (
    betas := linear_noise_schedule(50, 0.001, 0.02)[0],
    alphas := linear_noise_schedule(50, 0.001, 0.02)[1],
    bool(np.allclose(alphas, 1 - betas))
)[-1])()`,expected:"True",hidden:!0},{id:"5",description:"Alpha bars equal cumulative product of alphas",input:`(lambda: (
    result := linear_noise_schedule(40, 0.0001, 0.02),
    alphas := result[1],
    alpha_bars := result[2],
    bool(np.allclose(alpha_bars, np.cumprod(alphas)))
)[-1])()`,expected:"True",hidden:!0}],hints:["Use np.linspace for linear interpolation","alphas = 1 - betas","alpha_bars = np.cumprod(alphas)"],solution:`import numpy as np

def linear_noise_schedule(T, beta_start=0.0001, beta_end=0.02):
    # Linear schedule
    betas = np.linspace(beta_start, beta_end, T)

    # Compute alphas
    alphas = 1 - betas

    # Cumulative product
    alpha_bars = np.cumprod(alphas)

    return betas, alphas, alpha_bars
`},{id:"diffusion-forward",title:"Diffusion Forward Process",section:"generative-models",difficulty:"medium",description:`
## Diffusion Forward Process (Adding Noise)

Implement the forward diffusion process that adds noise to data.

### Formula
\`\`\`
x_t = sqrt(ᾱ_t) * x_0 + sqrt(1 - ᾱ_t) * ε

where ε ~ N(0, I)
\`\`\`

### Intuition
- As t increases, ᾱ_t decreases
- More noise is added, signal is reduced
- At t=T, x_T ≈ pure noise
    `,examples:[{input:"x_0 (image), t=500, T=1000",output:"x_t (noisy image)",explanation:"Halfway through diffusion process"}],starterCode:`import numpy as np

def diffusion_forward(x_0, t, alpha_bars):
    """
    Add noise to data using forward diffusion.

    Args:
        x_0: Original data (batch, ...)
        t: Timestep (int)
        alpha_bars: Cumulative alpha products (T,)

    Returns:
        x_t: Noisy data at timestep t
        noise: The noise that was added
    """
    np.random.seed(42)
    # Your code here
    pass
`,testCases:[{id:"1",description:"Output shape matches input",input:"diffusion_forward(np.ones((2, 4)), 50, np.linspace(0.99, 0.01, 100))[0].shape",expected:"(2, 4)",hidden:!1},{id:"2",description:"Noise shape matches input",input:"diffusion_forward(np.ones((3, 5)), 10, np.linspace(0.99, 0.01, 100))[1].shape",expected:"(3, 5)",hidden:!0},{id:"3",description:"When alpha_bar=1, x_t should equal x_0 (no noise added)",input:"bool(np.allclose(diffusion_forward(np.array([[1.0, 2.0, 3.0]]), 0, np.array([1.0, 0.5, 0.1]))[0], np.array([[1.0, 2.0, 3.0]])))",expected:"True",hidden:!0},{id:"4",description:"Verify formula: x_t = sqrt(alpha_bar_t)*x_0 + sqrt(1-alpha_bar_t)*noise",input:`(lambda: (
    x_0 := np.ones((2, 4)),
    alpha_bars := np.linspace(0.99, 0.01, 100),
    result := diffusion_forward(x_0, 50, alpha_bars),
    x_t := result[0],
    noise := result[1],
    ab := alpha_bars[50],
    expected := np.sqrt(ab) * x_0 + np.sqrt(1 - ab) * noise,
    bool(np.allclose(x_t, expected))
)[-1])()`,expected:"True",hidden:!0},{id:"5",description:"When alpha_bar≈0, x_t is mostly noise (far from x_0)",input:`(lambda: (
    x_0 := np.ones((2, 3)) * 10,
    alpha_bars := np.array([0.001]),
    x_t := diffusion_forward(x_0, 0, alpha_bars)[0],
    bool(np.mean(np.abs(x_t - x_0)) > 5)
)[-1])()`,expected:"True",hidden:!0}],hints:["Get alpha_bar_t = alpha_bars[t]","Sample noise from standard normal","Apply formula: sqrt(alpha_bar_t) * x_0 + sqrt(1 - alpha_bar_t) * noise"],solution:`import numpy as np

def diffusion_forward(x_0, t, alpha_bars):
    np.random.seed(42)

    alpha_bar_t = alpha_bars[t]

    # Sample noise
    noise = np.random.randn(*x_0.shape)

    # Forward process
    x_t = np.sqrt(alpha_bar_t) * x_0 + np.sqrt(1 - alpha_bar_t) * noise

    return x_t, noise
`},{id:"vqvae-quantization",title:"VQ-VAE Vector Quantization",section:"generative-models",difficulty:"hard",description:`
## VQ-VAE Vector Quantization

Implement the vector quantization layer used in VQ-VAE (Vector Quantized Variational Autoencoder).

### Overview
Unlike standard VAEs that use continuous latent spaces, VQ-VAE uses **discrete** latent representations by mapping encoder outputs to the nearest embedding in a learned codebook.

### Quantization Process
1. **Encoder output**: z_e of shape (batch, H, W, D)
2. **Codebook**: K embedding vectors of dimension D
3. **Find nearest**: For each spatial position, find the closest codebook entry
4. **Quantize**: Replace z_e with the nearest codebook vector z_q

### Distance Calculation
\`\`\`
distances[b, h, w, k] = ||z_e[b, h, w] - codebook[k]||²
\`\`\`

### Straight-Through Estimator
During training, gradients flow through z_q to z_e by copying gradients:
\`\`\`
z_q = z_e + stop_gradient(z_q - z_e)
\`\`\`
(We don't implement this here, just the forward pass)

### VQ-VAE Loss Components
\`\`\`
L = reconstruction + β * ||sg[z_e] - e||² + ||z_e - sg[e]||²
\`\`\`
- **Codebook loss**: Moves embeddings toward encoder outputs
- **Commitment loss**: Commits encoder to embeddings

### Function Signature
\`\`\`python
def vq_quantize(z_e, codebook):
    # z_e: (batch, H, W, embedding_dim) - encoder output
    # codebook: (num_embeddings, embedding_dim) - K embedding vectors
    # Returns: z_q, indices
\`\`\`
    `,examples:[{input:"z_e (2, 4, 4, 64), codebook (512, 64)",output:"z_q (2, 4, 4, 64), indices (2, 4, 4)",explanation:"Each spatial position mapped to one of 512 codes"}],starterCode:`import numpy as np

def vq_quantize(z_e, codebook):
    """
    Vector quantization for VQ-VAE.

    Args:
        z_e: Encoder output (batch, H, W, embedding_dim)
        codebook: Embedding vectors (num_embeddings, embedding_dim)

    Returns:
        z_q: Quantized vectors (batch, H, W, embedding_dim)
        indices: Codebook indices used (batch, H, W)
    """
    # Your code here
    pass


def vq_loss(z_e, z_q, beta=0.25):
    """
    Compute VQ-VAE losses (codebook + commitment).

    Args:
        z_e: Encoder output (batch, H, W, embedding_dim)
        z_q: Quantized vectors (batch, H, W, embedding_dim)
        beta: Commitment loss weight (default: 0.25)

    Returns:
        codebook_loss: Loss to update codebook
        commitment_loss: Loss to commit encoder to codebook
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"z_q output shape matches input",input:"vq_quantize(np.random.randn(2, 4, 4, 8), np.random.randn(16, 8))[0].shape",expected:"(2, 4, 4, 8)",hidden:!1},{id:"2",description:"Indices shape is correct",input:"vq_quantize(np.random.randn(2, 4, 4, 8), np.random.randn(16, 8))[1].shape",expected:"(2, 4, 4)",hidden:!1},{id:"3",description:"Indices are valid codebook indices (all less than K)",input:"bool(np.all(vq_quantize(np.random.randn(2, 3, 3, 4), np.random.randn(8, 4))[1] < 8))",expected:"True",hidden:!0},{id:"4",description:"VQ loss returns tuple of two values",input:"len(vq_loss(np.random.randn(2, 3, 3, 4), np.random.randn(2, 3, 3, 4), 0.25))",expected:"2",hidden:!0},{id:"5",description:"Quantized vectors come from codebook (each z_q vector is a codebook entry)",input:`(lambda: (
    np.random.seed(0),
    codebook := np.random.randn(8, 4),
    z_e := np.random.randn(1, 2, 2, 4),
    z_q := vq_quantize(z_e, codebook)[0],
    z_q_flat := z_q.reshape(-1, 4),
    all_in_codebook := all(any(bool(np.allclose(z_q_flat[i], codebook[j])) for j in range(8)) for i in range(4)),
    bool(all_in_codebook)
)[-1])()`,expected:"True",hidden:!0},{id:"6",description:"Commitment loss equals beta * codebook_loss",input:`(lambda: (
    np.random.seed(1),
    z_e := np.random.randn(2, 3, 3, 4),
    z_q := np.random.randn(2, 3, 3, 4),
    losses := vq_loss(z_e, z_q, 0.25),
    bool(abs(losses[1] - 0.25 * losses[0]) < 1e-4)
)[-1])()`,expected:"True",hidden:!0}],hints:["Reshape z_e to (batch*H*W, D) for easier distance computation","Use broadcasting: ||a - b||² = ||a||² + ||b||² - 2*a·b","np.argmin along the codebook axis gives indices","Index into codebook with the indices to get z_q","Reshape back to original spatial dimensions","For loss: codebook_loss = ||z_e.detach() - z_q||², commitment = ||z_e - z_q.detach()||²"],solution:`import numpy as np

def vq_quantize(z_e, codebook):
    z_e = np.array(z_e)
    codebook = np.array(codebook)

    batch, H, W, D = z_e.shape
    K, _ = codebook.shape

    # Flatten spatial dimensions: (batch*H*W, D)
    z_flat = z_e.reshape(-1, D)

    # Compute distances using: ||a-b||² = ||a||² + ||b||² - 2*a·b
    # z_flat: (N, D), codebook: (K, D)
    z_sq = np.sum(z_flat ** 2, axis=1, keepdims=True)  # (N, 1)
    codebook_sq = np.sum(codebook ** 2, axis=1)        # (K,)
    cross = z_flat @ codebook.T                        # (N, K)

    distances = z_sq + codebook_sq - 2 * cross         # (N, K)

    # Find nearest codebook entry
    indices_flat = np.argmin(distances, axis=1)        # (N,)

    # Get quantized vectors
    z_q_flat = codebook[indices_flat]                  # (N, D)

    # Reshape back
    z_q = z_q_flat.reshape(batch, H, W, D)
    indices = indices_flat.reshape(batch, H, W)

    return z_q, indices


def vq_loss(z_e, z_q, beta=0.25):
    z_e = np.array(z_e)
    z_q = np.array(z_q)

    # Codebook loss: ||sg[z_e] - z_q||² (moves codebook toward encoder output)
    # In practice, sg[z_e] means z_e is treated as constant
    codebook_loss = np.mean((z_e - z_q) ** 2)

    # Commitment loss: ||z_e - sg[z_q]||² (commits encoder to codebook)
    # Same computation, but gradient only flows to z_e
    commitment_loss = beta * np.mean((z_e - z_q) ** 2)

    return round(codebook_loss, 4), round(commitment_loss, 4)
`},{id:"kl-divergence",title:"KL Divergence (Gaussians)",section:"generative-models",difficulty:"easy",description:`
## KL Divergence Between Gaussians

Compute the KL divergence between two univariate Gaussian distributions.

### Formula
\`\`\`
KL(P || Q) = log(σ_q/σ_p) + (σ_p² + (μ_p - μ_q)²) / (2σ_q²) - 0.5
\`\`\`

Where P = N(μ_p, σ_p²) and Q = N(μ_q, σ_q²)

### Properties
- KL ≥ 0
- KL = 0 iff P = Q
- Not symmetric: KL(P||Q) ≠ KL(Q||P)
    `,examples:[{input:"P = N(0, 1), Q = N(0, 1)",output:"0",explanation:"Same distribution"}],starterCode:`import numpy as np

def kl_divergence_gaussian(mu_p, sigma_p, mu_q, sigma_q):
    """
    Compute KL divergence between two Gaussians.

    Args:
        mu_p, sigma_p: Mean and std of P
        mu_q, sigma_q: Mean and std of Q

    Returns:
        kl: KL(P || Q)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Same distribution",input:"(0, 1, 0, 1)",expected:"0.0",hidden:!1},{id:"2",description:"Different means",input:"(1, 1, 0, 1)",expected:"0.5",hidden:!1},{id:"3",description:"Different variances",input:"(0, 2, 0, 1)",expected:"0.8069",hidden:!0},{id:"4",description:"KL is always non-negative",input:"bool(kl_divergence_gaussian(3, 2, -1, 5) >= 0)",expected:"True",hidden:!0},{id:"5",description:"Asymmetry: KL(P||Q) != KL(Q||P)",input:"bool(abs(kl_divergence_gaussian(0, 1, 1, 2) - kl_divergence_gaussian(1, 2, 0, 1)) > 0.01)",expected:"True",hidden:!0}],hints:["Apply the formula directly","Use np.log for natural logarithm","Remember: σ² is variance, σ is std"],solution:`import numpy as np

def kl_divergence_gaussian(mu_p, sigma_p, mu_q, sigma_q):
    term1 = np.log(sigma_q / sigma_p)
    term2 = (sigma_p**2 + (mu_p - mu_q)**2) / (2 * sigma_q**2)
    term3 = -0.5

    kl = term1 + term2 + term3
    return round(kl, 4)
`}],m=[{id:"numpy-array-creation",title:"Array Creation Methods",section:"numpy-fundamentals",difficulty:"easy",description:`
## NumPy Array Creation

Implement a function that creates various NumPy arrays using different methods.

### Requirements
Create and return a dictionary with:
- \`zeros\`: 3x4 array of zeros
- \`ones\`: 2x3 array of ones
- \`arange\`: array from 0 to 9
- \`linspace\`: 5 evenly spaced values from 0 to 1
- \`eye\`: 4x4 identity matrix

### Function Signature
\`\`\`python
def create_arrays() -> dict:
\`\`\`
    `,examples:[{input:"create_arrays()",output:"{'zeros': array([[0,0,0,0],...]), ...}",explanation:"Dictionary with 5 different array types"}],starterCode:`import numpy as np

def create_arrays() -> dict:
    """
    Create various NumPy arrays.

    Returns:
        Dictionary with keys: zeros, ones, arange, linspace, eye
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Zeros shape correct",input:'create_arrays()["zeros"].shape',expected:"(3, 4)",hidden:!1},{id:"2",description:"Linspace length correct",input:'len(create_arrays()["linspace"])',expected:"5",hidden:!1},{id:"3",description:"Eye is identity",input:'bool(np.allclose(create_arrays()["eye"], np.eye(4)))',expected:"True",hidden:!0},{id:"4",description:"Ones shape and values",input:'bool(np.allclose(create_arrays()["ones"], np.ones((2, 3))))',expected:"True",hidden:!0},{id:"5",description:"Arange values correct",input:'create_arrays()["arange"].tolist()',expected:"[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]",hidden:!0},{id:"6",description:"Linspace endpoints correct",input:'bool(create_arrays()["linspace"][0] == 0.0 and create_arrays()["linspace"][-1] == 1.0)',expected:"True",hidden:!0},{id:"7",description:"Zeros values are all zero",input:'bool(np.allclose(create_arrays()["zeros"], 0))',expected:"True",hidden:!0},{id:"8",description:"Eye shape correct",input:'create_arrays()["eye"].shape',expected:"(4, 4)",hidden:!0}],hints:["Use np.zeros((3, 4)) for zero array","np.linspace(start, stop, num) creates evenly spaced values","np.eye(n) creates an identity matrix"],solution:`import numpy as np

def create_arrays() -> dict:
    return {
        'zeros': np.zeros((3, 4)),
        'ones': np.ones((2, 3)),
        'arange': np.arange(10),
        'linspace': np.linspace(0, 1, 5),
        'eye': np.eye(4)
    }
`},{id:"numpy-indexing",title:"Advanced Indexing",section:"numpy-fundamentals",difficulty:"medium",description:`
## NumPy Advanced Indexing

Implement various indexing operations on a 2D array.

### Given
\`\`\`python
arr = np.arange(20).reshape(4, 5)
# array([[ 0,  1,  2,  3,  4],
#        [ 5,  6,  7,  8,  9],
#        [10, 11, 12, 13, 14],
#        [15, 16, 17, 18, 19]])
\`\`\`

### Requirements
Return a dictionary with:
- \`row_1\`: Second row (index 1)
- \`col_2\`: Third column (index 2)
- \`subarray\`: Rows 1-2, columns 2-4
- \`diagonal\`: Main diagonal
- \`reversed\`: Array with rows reversed

### Function Signature
\`\`\`python
def advanced_indexing(arr: np.ndarray) -> dict:
\`\`\`
    `,examples:[{input:"arr = np.arange(20).reshape(4, 5)",output:"{'row_1': [5,6,7,8,9], ...}",explanation:"Various slicing and indexing operations"}],starterCode:`import numpy as np

def advanced_indexing(arr: np.ndarray) -> dict:
    """
    Perform advanced indexing operations.

    Args:
        arr: 2D input array

    Returns:
        Dictionary with indexed results
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Row extraction",input:'advanced_indexing(np.arange(20).reshape(4, 5))["row_1"].tolist()',expected:"[5, 6, 7, 8, 9]",hidden:!1},{id:"2",description:"Subarray correct",input:'advanced_indexing(np.arange(20).reshape(4, 5))["subarray"].tolist()',expected:"[[7, 8, 9], [12, 13, 14]]",hidden:!1},{id:"3",description:"Column extraction",input:'advanced_indexing(np.arange(20).reshape(4, 5))["col_2"].tolist()',expected:"[2, 7, 12, 17]",hidden:!0},{id:"4",description:"Diagonal values",input:'advanced_indexing(np.arange(20).reshape(4, 5))["diagonal"].tolist()',expected:"[0, 6, 12, 18]",hidden:!0},{id:"5",description:"Reversed rows",input:'advanced_indexing(np.arange(20).reshape(4, 5))["reversed"][0].tolist()',expected:"[15, 16, 17, 18, 19]",hidden:!0},{id:"6",description:"Subarray shape",input:'advanced_indexing(np.arange(20).reshape(4, 5))["subarray"].shape',expected:"(2, 3)",hidden:!0},{id:"7",description:"Works with different input array",input:'advanced_indexing(np.ones((4, 5)))["row_1"].tolist()',expected:"[1.0, 1.0, 1.0, 1.0, 1.0]",hidden:!0}],hints:["arr[1] or arr[1, :] gets row 1","arr[:, 2] gets column 2","arr[1:3, 2:5] gets a subarray","np.diag(arr) extracts diagonal","arr[::-1] reverses rows"],solution:`import numpy as np

def advanced_indexing(arr: np.ndarray) -> dict:
    return {
        'row_1': arr[1],
        'col_2': arr[:, 2],
        'subarray': arr[1:3, 2:5],
        'diagonal': np.diag(arr),
        'reversed': arr[::-1]
    }
`},{id:"numpy-broadcasting",title:"Broadcasting Operations",section:"numpy-fundamentals",difficulty:"medium",description:`
## NumPy Broadcasting

Implement operations that leverage NumPy's broadcasting rules.

### Task
Given a 2D array of shape (3, 4):
1. Subtract the row means from each row (center rows)
2. Subtract the column means from each column (center columns)
3. Add a 1D bias vector of shape (4,) to each row
4. Multiply by a column vector of shape (3, 1)

### Broadcasting Rules
- Arrays are compatible when dimensions are equal or one of them is 1
- Operations proceed element-wise on matching dimensions

### Function Signature
\`\`\`python
def broadcasting_ops(arr: np.ndarray, bias: np.ndarray, scale: np.ndarray) -> dict:
\`\`\`
    `,examples:[{input:"arr (3,4), bias (4,), scale (3,1)",output:"{'row_centered': ..., 'col_centered': ..., 'biased': ..., 'scaled': ...}",explanation:"Various broadcasting operations"}],starterCode:`import numpy as np

def broadcasting_ops(arr: np.ndarray, bias: np.ndarray, scale: np.ndarray) -> dict:
    """
    Perform broadcasting operations.

    Args:
        arr: 2D array of shape (3, 4)
        bias: 1D array of shape (4,)
        scale: 2D array of shape (3, 1)

    Returns:
        Dictionary with results of broadcasting operations
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Row centering",input:'bool(np.allclose(broadcasting_ops(np.array([[1,2,3,4],[5,6,7,8],[9,10,11,12]]), np.zeros(4), np.ones((3,1)))["row_centered"].mean(axis=1), 0))',expected:"True",hidden:!1},{id:"2",description:"Bias addition shape",input:'broadcasting_ops(np.array([[1,2,3,4],[5,6,7,8],[9,10,11,12]]), np.array([1,1,1,1]), np.ones((3,1)))["biased"].shape',expected:"(3, 4)",hidden:!1},{id:"3",description:"Column centering has zero column means",input:'bool(np.allclose(broadcasting_ops(np.array([[1,2,3,4],[5,6,7,8],[9,10,11,12]]), np.zeros(4), np.ones((3,1)))["col_centered"].mean(axis=0), 0))',expected:"True",hidden:!0},{id:"4",description:"Bias addition values correct",input:'broadcasting_ops(np.array([[1,2,3,4],[5,6,7,8],[9,10,11,12]]), np.array([10,20,30,40]), np.ones((3,1)))["biased"][0].tolist()',expected:"[11, 22, 33, 44]",hidden:!0},{id:"5",description:"Scale multiplication correct",input:'broadcasting_ops(np.array([[1,2,3,4],[5,6,7,8],[9,10,11,12]]), np.zeros(4), np.array([[2],[3],[4]]))["scaled"][0].tolist()',expected:"[2, 4, 6, 8]",hidden:!0},{id:"6",description:"Row centered values for first row",input:'broadcasting_ops(np.array([[1,2,3,4],[5,6,7,8],[9,10,11,12]]), np.zeros(4), np.ones((3,1)))["row_centered"][0].tolist()',expected:"[-1.5, -0.5, 0.5, 1.5]",hidden:!0},{id:"7",description:"All outputs have correct shape",input:"(lambda: (r := broadcasting_ops(np.array([[1,2,3,4],[5,6,7,8],[9,10,11,12]]), np.zeros(4), np.ones((3,1))), bool(all(r[k].shape == (3, 4) for k in r)))[-1])()",expected:"True",hidden:!0}],hints:["Row means: arr.mean(axis=1, keepdims=True)","Column means: arr.mean(axis=0, keepdims=True) or arr.mean(axis=0)","Bias shape (4,) broadcasts with arr shape (3, 4)","Scale shape (3, 1) broadcasts with arr shape (3, 4)"],solution:`import numpy as np

def broadcasting_ops(arr: np.ndarray, bias: np.ndarray, scale: np.ndarray) -> dict:
    # Row centered: subtract mean of each row
    row_means = arr.mean(axis=1, keepdims=True)  # (3, 1)
    row_centered = arr - row_means

    # Column centered: subtract mean of each column
    col_means = arr.mean(axis=0)  # (4,)
    col_centered = arr - col_means

    # Add bias to each row
    biased = arr + bias  # bias (4,) broadcasts to (3, 4)

    # Scale each row
    scaled = arr * scale  # scale (3, 1) broadcasts to (3, 4)

    return {
        'row_centered': row_centered,
        'col_centered': col_centered,
        'biased': biased,
        'scaled': scaled
    }
`},{id:"numpy-aggregations",title:"Aggregation Functions",section:"numpy-fundamentals",difficulty:"easy",description:"\n## NumPy Aggregations\n\nImplement common aggregation operations along different axes.\n\n### Task\nGiven a 2D array, compute:\n- Global statistics (mean, std, min, max, sum)\n- Row-wise statistics (along axis=1)\n- Column-wise statistics (along axis=0)\n- Argmax and argmin (indices of max/min values)\n\n### Expected Return Format\nReturn a dictionary with these keys:\n- **Global**: `'global_mean'`, `'global_std'`, `'global_min'`, `'global_max'`, `'global_sum'`\n- **Row-wise**: `'row_mean'`, `'row_sum'`\n- **Column-wise**: `'col_mean'`, `'col_sum'`\n- **Indices**: `'argmax'` (2D index tuple), `'argmin'` (2D index tuple)\n    ",examples:[{input:"np.array([[1, 2, 3], [4, 5, 6]])",output:"{'global_mean': 3.5, 'global_sum': 21, 'row_sum': [6, 15], 'col_mean': [2.5, 3.5, 4.5], 'argmax': (1, 2), ...}",explanation:"Global, row-wise, and column-wise aggregations"}],starterCode:`import numpy as np

def compute_aggregations(arr: np.ndarray) -> dict:
    """
    Compute aggregation statistics.

    Args:
        arr: 2D input array

    Returns:
        Dictionary with aggregation results
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Global mean",input:'compute_aggregations(np.array([[1, 2, 3], [4, 5, 6]]))["global_mean"]',expected:"3.5",hidden:!1},{id:"2",description:"Row sums",input:'compute_aggregations(np.array([[1, 2, 3], [4, 5, 6]]))["row_sum"].tolist()',expected:"[6, 15]",hidden:!1},{id:"3",description:"Column means",input:'compute_aggregations(np.array([[1, 2, 3], [4, 5, 6]]))["col_mean"].tolist()',expected:"[2.5, 3.5, 4.5]",hidden:!0},{id:"4",description:"Global std correct",input:'round(float(compute_aggregations(np.array([[1, 2, 3], [4, 5, 6]]))["global_std"]), 4)',expected:"1.7078",hidden:!0},{id:"5",description:"Argmax returns correct 2D index",input:'compute_aggregations(np.array([[1, 2, 3], [4, 5, 6]]))["argmax"]',expected:"(1, 2)",hidden:!0},{id:"6",description:"Argmin returns correct 2D index",input:'compute_aggregations(np.array([[1, 2, 3], [4, 5, 6]]))["argmin"]',expected:"(0, 0)",hidden:!0},{id:"7",description:"Global sum and min/max correct",input:'(lambda: (r := compute_aggregations(np.array([[10, 20], [30, 40]])), bool(r["global_sum"] == 100 and r["global_min"] == 10 and r["global_max"] == 40))[-1])()',expected:"True",hidden:!0}],hints:["arr.mean() computes global mean","arr.mean(axis=0) computes column means","arr.mean(axis=1) computes row means","np.argmax(arr) gives index of max in flattened array"],solution:`import numpy as np

def compute_aggregations(arr: np.ndarray) -> dict:
    return {
        'global_mean': arr.mean(),
        'global_std': arr.std(),
        'global_min': arr.min(),
        'global_max': arr.max(),
        'global_sum': arr.sum(),
        'row_mean': arr.mean(axis=1),
        'row_sum': arr.sum(axis=1),
        'col_mean': arr.mean(axis=0),
        'col_sum': arr.sum(axis=0),
        'argmax': np.unravel_index(arr.argmax(), arr.shape),
        'argmin': np.unravel_index(arr.argmin(), arr.shape),
    }
`},{id:"numpy-reshape-transpose",title:"Reshape and Transpose",section:"numpy-fundamentals",difficulty:"medium",description:`
## Reshape and Transpose Operations

Master array shape manipulation - essential for ML data pipelines.

### Task
Given a 1D array of 24 elements:
1. Reshape to (4, 6)
2. Reshape to (2, 3, 4)
3. Transpose the 2D version
4. Swap axes on the 3D version
5. Flatten back to 1D

### Important Concepts
- \`reshape\` changes shape without changing data order
- \`transpose\` swaps axes
- \`-1\` in reshape means "infer this dimension"

### Expected Return Format
Return a dictionary with these keys:
- \`'arr_2d'\`: Reshaped to (4, 6)
- \`'arr_3d'\`: Reshaped to (2, 3, 4)
- \`'arr_2d_transposed'\`: Transpose of arr_2d, shape (6, 4)
- \`'arr_3d_swapped'\`: arr_3d with axes swapped (2,1,0), shape (4, 3, 2)
- \`'arr_flat'\`: Flattened back to 1D, shape (24,)
    `,examples:[{input:"np.arange(24)",output:"{'arr_2d': shape (4,6), 'arr_3d': shape (2,3,4), 'arr_2d_transposed': shape (6,4), ...}",explanation:"Various reshape and transpose operations"}],starterCode:`import numpy as np

def reshape_transpose(arr: np.ndarray) -> dict:
    """
    Perform reshape and transpose operations.

    Args:
        arr: 1D array of 24 elements

    Returns:
        Dictionary with reshaped arrays
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"2D reshape shape",input:'reshape_transpose(np.arange(24))["arr_2d"].shape',expected:"(4, 6)",hidden:!1},{id:"2",description:"3D reshape shape",input:'reshape_transpose(np.arange(24))["arr_3d"].shape',expected:"(2, 3, 4)",hidden:!1},{id:"3",description:"Transpose shape correct",input:'reshape_transpose(np.arange(24))["arr_2d_transposed"].shape',expected:"(6, 4)",hidden:!0},{id:"4",description:"3D swapped axes shape",input:'reshape_transpose(np.arange(24))["arr_3d_swapped"].shape',expected:"(4, 3, 2)",hidden:!0},{id:"5",description:"Flatten is 1D with 24 elements",input:'reshape_transpose(np.arange(24))["arr_flat"].shape',expected:"(24,)",hidden:!0},{id:"6",description:"Data preserved after reshape (first row of 2D)",input:'reshape_transpose(np.arange(24))["arr_2d"][0].tolist()',expected:"[0, 1, 2, 3, 4, 5]",hidden:!0},{id:"7",description:"Transpose preserves data (first column of transposed equals first row of original)",input:'bool(np.allclose(reshape_transpose(np.arange(24))["arr_2d_transposed"][:, 0], reshape_transpose(np.arange(24))["arr_2d"][0]))',expected:"True",hidden:!0}],hints:["arr.reshape(4, 6) or arr.reshape(4, -1)","arr.reshape(2, 3, 4) for 3D",".T or .transpose() for transpose",".flatten() or .ravel() for 1D"],solution:`import numpy as np

def reshape_transpose(arr: np.ndarray) -> dict:
    # 2D reshape
    arr_2d = arr.reshape(4, 6)

    # 3D reshape
    arr_3d = arr.reshape(2, 3, 4)

    # Transpose 2D
    arr_2d_T = arr_2d.T

    # Swap axes on 3D (swap axis 0 and 2)
    arr_3d_swapped = arr_3d.transpose(2, 1, 0)

    # Flatten
    arr_flat = arr_2d.flatten()

    return {
        'arr_2d': arr_2d,
        'arr_3d': arr_3d,
        'arr_2d_transposed': arr_2d_T,
        'arr_3d_swapped': arr_3d_swapped,
        'arr_flat': arr_flat
    }
`}],h=[{id:"einsum-basics",title:"Einsum Fundamentals",section:"einsum",difficulty:"easy",description:`
## Einsum Fundamentals

Einstein summation notation provides a powerful way to express array operations.

### Syntax
\`\`\`python
np.einsum('subscripts', operands)
\`\`\`

### Basic Operations
- \`'i->'\`: Sum all elements (reduce)
- \`'ij->i'\`: Sum along columns (row sums)
- \`'ij->j'\`: Sum along rows (column sums)
- \`'ii->i'\`: Extract diagonal
- \`'ij->ji'\`: Transpose

### Task
Implement basic einsum operations on a 2D array.

### Expected Return Format
Return a dictionary with these keys:
- \`'sum_all'\`: Sum of all elements
- \`'row_sum'\`: Sum along each row
- \`'col_sum'\`: Sum along each column
- \`'transpose'\`: Transposed array
- \`'diagonal'\`: Diagonal elements (for square matrices, else None)
    `,examples:[{input:"np.array([[1,2],[3,4]])",output:"{'sum_all': 10, 'row_sum': [3,7], 'col_sum': [4,6], 'transpose': [[1,3],[2,4]], 'diagonal': [1,4]}",explanation:"Basic einsum operations on a 2x2 matrix"}],starterCode:`import numpy as np

def einsum_basics(arr: np.ndarray) -> dict:
    """
    Perform basic einsum operations.

    Args:
        arr: 2D input array

    Returns:
        Dictionary with einsum results
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Sum all elements",input:'einsum_basics(np.array([[1, 2], [3, 4]]))["sum_all"]',expected:"10",hidden:!1},{id:"2",description:"Transpose",input:'bool(np.array_equal(einsum_basics(np.array([[1, 2], [3, 4]]))["transpose"], np.array([[1, 3], [2, 4]])))',expected:"True",hidden:!1},{id:"3",description:"Row sums",input:'einsum_basics(np.array([[1, 2], [3, 4]]))["row_sum"].tolist()',expected:"[3, 7]",hidden:!0},{id:"4",description:"Column sums",input:'einsum_basics(np.array([[1, 2], [3, 4]]))["col_sum"].tolist()',expected:"[4, 6]",hidden:!0},{id:"5",description:"Diagonal extraction",input:'einsum_basics(np.array([[1, 2], [3, 4]]))["diagonal"].tolist()',expected:"[1, 4]",hidden:!0}],hints:["'ij->' sums all elements","'ij->i' sums each row","'ij->ji' transposes","'ii->i' extracts diagonal (for square matrices)"],solution:`import numpy as np

def einsum_basics(arr: np.ndarray) -> dict:
    return {
        'sum_all': np.einsum('ij->', arr),
        'row_sum': np.einsum('ij->i', arr),
        'col_sum': np.einsum('ij->j', arr),
        'transpose': np.einsum('ij->ji', arr),
        'diagonal': np.einsum('ii->i', arr) if arr.shape[0] == arr.shape[1] else None
    }
`},{id:"einsum-matrix-ops",title:"Matrix Operations with Einsum",section:"einsum",difficulty:"medium",description:`
## Matrix Operations with Einsum

Einsum can express matrix multiplication and more complex operations.

### Key Operations
- \`'ik,kj->ij'\`: Matrix multiplication (A @ B)
- \`'ij,ij->ij'\`: Element-wise multiplication (Hadamard)
- \`'ij,ij->'\`: Frobenius inner product (sum of element-wise product)
- \`'ij,j->i'\`: Matrix-vector multiplication
- \`'i,j->ij'\`: Outer product

### Task
Implement matrix operations using einsum.

### Expected Return Format
Return a dictionary with these keys:
- \`'matmul'\`: Matrix multiplication A @ B
- \`'matvec'\`: Matrix-vector multiplication A @ v
- \`'outer_product'\`: Outer product of v with itself
- \`'hadamard'\`: Element-wise A * A
- \`'frobenius'\`: Sum of A * A (Frobenius inner product)
- \`'trace'\`: Trace of A (if square, else None)
    `,examples:[{input:"A=[[1,2],[3,4]], B=[[5,6],[7,8]], v=[1,2]",output:"{'matmul': [[19,22],[43,50]], 'matvec': [5,11], 'outer_product': [[1,2],[2,4]], 'hadamard': [[1,4],[9,16]], 'frobenius': 30, 'trace': 5}",explanation:"Matrix operations via einsum"}],starterCode:`import numpy as np

def einsum_matrix_ops(A: np.ndarray, B: np.ndarray, v: np.ndarray) -> dict:
    """
    Perform matrix operations using einsum.

    Args:
        A: Matrix of shape (m, k)
        B: Matrix of shape (k, n)
        v: Vector of shape (k,)

    Returns:
        Dictionary with operation results
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Matrix multiplication",input:'bool(np.array_equal(einsum_matrix_ops(np.array([[1,2],[3,4]]), np.array([[5,6],[7,8]]), np.array([1,2]))["matmul"], np.array([[19,22],[43,50]])))',expected:"True",hidden:!1},{id:"2",description:"Outer product",input:'bool(np.array_equal(einsum_matrix_ops(np.array([[1,2],[3,4]]), np.array([[5,6],[7,8]]), np.array([1,2]))["outer_product"], np.array([[1,2],[2,4]])))',expected:"True",hidden:!1},{id:"3",description:"Matrix-vector product",input:'einsum_matrix_ops(np.array([[1,2],[3,4]]), np.array([[5,6],[7,8]]), np.array([1,2]))["matvec"].tolist()',expected:"[5, 11]",hidden:!0},{id:"4",description:"Frobenius inner product",input:'int(einsum_matrix_ops(np.array([[1,2],[3,4]]), np.array([[5,6],[7,8]]), np.array([1,2]))["frobenius"])',expected:"30",hidden:!0},{id:"5",description:"Trace of square matrix",input:'int(einsum_matrix_ops(np.array([[1,2],[3,4]]), np.array([[5,6],[7,8]]), np.array([1,2]))["trace"])',expected:"5",hidden:!0}],hints:["'ik,kj->ij' contracts over k (matrix multiply)","'ij,j->i' contracts vector with columns","'i,j->ij' creates outer product (no contraction)"],solution:`import numpy as np

def einsum_matrix_ops(A: np.ndarray, B: np.ndarray, v: np.ndarray) -> dict:
    return {
        'matmul': np.einsum('ik,kj->ij', A, B),
        'matvec': np.einsum('ij,j->i', A, v),
        'outer_product': np.einsum('i,j->ij', v, v),
        'hadamard': np.einsum('ij,ij->ij', A, A),  # A * A
        'frobenius': np.einsum('ij,ij->', A, A),   # sum(A * A)
        'trace': np.einsum('ii->', A) if A.shape[0] == A.shape[1] else None
    }
`},{id:"einsum-batch-ops",title:"Batch Operations with Einsum",section:"einsum",difficulty:"medium",description:`
## Batch Operations with Einsum

Einsum shines for batch operations - multiple matrices at once.

### Batch Matrix Operations
- \`'bij,bjk->bik'\`: Batch matrix multiplication
- \`'bij,bj->bi'\`: Batch matrix-vector multiplication
- \`'bij->bji'\`: Batch transpose

### Attention-style Operations
- \`'bqd,bkd->bqk'\`: Query-Key dot products (attention scores)
- \`'bqk,bkv->bqv'\`: Weighted sum of values

### Task
Implement batch operations common in deep learning.

### Expected Return Format
Return a dictionary with these keys:
- \`'scores'\`: Raw attention scores Q @ K.T per batch, shape (batch, seq_q, seq_k)
- \`'attention_weights'\`: Softmax of scaled scores, shape (batch, seq_q, seq_k)
- \`'output'\`: Weighted sum of values, shape (batch, seq_q, dim_v)
    `,examples:[{input:"Q (2,4,8), K (2,6,8), V (2,6,16)",output:"{'scores': shape (2,4,6), 'attention_weights': shape (2,4,6), 'output': shape (2,4,16)}",explanation:"Batch attention: scores from Q@K.T, then weighted sum of V"}],starterCode:`import numpy as np

def einsum_batch_ops(Q: np.ndarray, K: np.ndarray, V: np.ndarray) -> dict:
    """
    Perform batch operations using einsum.

    Args:
        Q: Queries of shape (batch, seq_q, dim)
        K: Keys of shape (batch, seq_k, dim)
        V: Values of shape (batch, seq_k, dim_v)

    Returns:
        Dictionary with batch operation results
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Attention scores shape",input:'einsum_batch_ops(np.ones((2, 4, 8)), np.ones((2, 6, 8)), np.ones((2, 6, 16)))["scores"].shape',expected:"(2, 4, 6)",hidden:!1},{id:"2",description:"Output shape",input:'einsum_batch_ops(np.ones((2, 4, 8)), np.ones((2, 6, 8)), np.ones((2, 6, 16)))["output"].shape',expected:"(2, 4, 16)",hidden:!1},{id:"3",description:"Attention weights sum to 1",input:'bool(np.allclose(einsum_batch_ops(np.random.randn(2, 4, 8), np.random.randn(2, 6, 8), np.random.randn(2, 6, 16))["attention_weights"].sum(axis=-1), 1.0))',expected:"True",hidden:!0},{id:"4",description:"Attention weights shape",input:'einsum_batch_ops(np.ones((2, 4, 8)), np.ones((2, 6, 8)), np.ones((2, 6, 16)))["attention_weights"].shape',expected:"(2, 4, 6)",hidden:!0}],hints:["'bqd,bkd->bqk' computes Q @ K.T for each batch","'bqk,bkv->bqv' applies attention weights to values","b is the batch dimension, preserved in output"],solution:`import numpy as np

def einsum_batch_ops(Q: np.ndarray, K: np.ndarray, V: np.ndarray) -> dict:
    # Q: (batch, seq_q, dim)
    # K: (batch, seq_k, dim)
    # V: (batch, seq_k, dim_v)

    # Attention scores: Q @ K.T for each batch
    # Result: (batch, seq_q, seq_k)
    scores = np.einsum('bqd,bkd->bqk', Q, K)

    # Scale scores
    d_k = Q.shape[-1]
    scaled_scores = scores / np.sqrt(d_k)

    # Softmax (simplified, along last axis)
    exp_scores = np.exp(scaled_scores - scaled_scores.max(axis=-1, keepdims=True))
    attention_weights = exp_scores / exp_scores.sum(axis=-1, keepdims=True)

    # Weighted sum of values
    # Result: (batch, seq_q, dim_v)
    output = np.einsum('bqk,bkv->bqv', attention_weights, V)

    return {
        'scores': scores,
        'attention_weights': attention_weights,
        'output': output
    }
`},{id:"einsum-advanced",title:"Advanced Einsum Patterns",section:"einsum",difficulty:"hard",description:`
## Advanced Einsum Patterns

Complex tensor operations for deep learning.

### Multi-Head Attention Pattern
\`\`\`python
# Split heads: (batch, seq, heads, dim)
# Attention per head: 'bhqd,bhkd->bhqk'
# Combine heads: 'bhqv->bqhv' then reshape
\`\`\`

### Bilinear Operations
\`\`\`python
# x.T @ W @ y: 'i,ijk,k->j'
# Batch bilinear: 'bi,ijk,bk->bj'
\`\`\`

### Task
Implement multi-head attention using einsum.
    `,examples:[{input:"Q, K, V with multiple heads",output:"Multi-head attention output",explanation:"Parallel attention across heads"}],starterCode:`import numpy as np

def multi_head_attention_einsum(Q: np.ndarray, K: np.ndarray, V: np.ndarray,
                                 num_heads: int) -> np.ndarray:
    """
    Multi-head attention using einsum.

    Args:
        Q: Queries (batch, seq_q, d_model)
        K: Keys (batch, seq_k, d_model)
        V: Values (batch, seq_k, d_model)
        num_heads: Number of attention heads

    Returns:
        output: (batch, seq_q, d_model)
    """
    batch, seq_q, d_model = Q.shape
    seq_k = K.shape[1]
    d_k = d_model // num_heads

    # Your code here
    pass
`,testCases:[{id:"1",description:"Output shape preserved",input:"multi_head_attention_einsum(np.ones((2, 4, 64)), np.ones((2, 4, 64)), np.ones((2, 4, 64)), 8).shape",expected:"(2, 4, 64)",hidden:!1},{id:"2",description:"Output is valid array",input:"not np.isnan(multi_head_attention_einsum(np.ones((2, 4, 64)), np.ones((2, 4, 64)), np.ones((2, 4, 64)), 8)).any()",expected:"True",hidden:!0},{id:"3",description:"Different d_model",input:"multi_head_attention_einsum(np.ones((1, 3, 32)), np.ones((1, 3, 32)), np.ones((1, 3, 32)), 4).shape",expected:"(1, 3, 32)",hidden:!0},{id:"4",description:"Single head",input:"multi_head_attention_einsum(np.random.randn(2, 4, 8), np.random.randn(2, 4, 8), np.random.randn(2, 4, 8), 1).shape",expected:"(2, 4, 8)",hidden:!0}],hints:["Reshape Q, K, V to (batch, seq, num_heads, d_k)","Use 'bqhd,bkhd->bhqk' for attention scores per head","Use 'bhqk,bkhd->bqhd' for weighted values","Reshape back to (batch, seq, d_model)"],solution:`import numpy as np

def multi_head_attention_einsum(Q: np.ndarray, K: np.ndarray, V: np.ndarray,
                                 num_heads: int) -> np.ndarray:
    batch, seq_q, d_model = Q.shape
    seq_k = K.shape[1]
    d_k = d_model // num_heads

    # Reshape to (batch, seq, num_heads, d_k)
    Q = Q.reshape(batch, seq_q, num_heads, d_k)
    K = K.reshape(batch, seq_k, num_heads, d_k)
    V = V.reshape(batch, seq_k, num_heads, d_k)

    # Compute attention scores for all heads
    # (batch, seq_q, heads, d_k) x (batch, seq_k, heads, d_k) -> (batch, heads, seq_q, seq_k)
    scores = np.einsum('bqhd,bkhd->bhqk', Q, K) / np.sqrt(d_k)

    # Softmax
    exp_scores = np.exp(scores - scores.max(axis=-1, keepdims=True))
    attention = exp_scores / exp_scores.sum(axis=-1, keepdims=True)

    # Weighted sum of values
    # (batch, heads, seq_q, seq_k) x (batch, seq_k, heads, d_k) -> (batch, seq_q, heads, d_k)
    output = np.einsum('bhqk,bkhd->bqhd', attention, V)

    # Reshape back to (batch, seq_q, d_model)
    output = output.reshape(batch, seq_q, d_model)

    return output
`},{id:"einsum-vs-matmul",title:"Einsum vs Traditional Operations",section:"einsum",difficulty:"easy",description:"\n## Einsum vs Traditional Operations\n\nCompare einsum with equivalent NumPy operations.\n\n### Equivalences\n| Einsum | NumPy |\n|--------|-------|\n| `'ij->'` | `np.sum(A)` |\n| `'ij->i'` | `np.sum(A, axis=1)` |\n| `'ik,kj->ij'` | `A @ B` |\n| `'ij,ij->'` | `np.sum(A * B)` |\n| `'ij->ji'` | `A.T` |\n\n### Task\nVerify einsum produces same results as traditional operations.\n\n### Expected Return Format\nReturn a dictionary with:\n- `'results'`: Dict mapping operation names to {'einsum': ..., 'numpy': ...}\n- `'all_match'`: Boolean indicating if all einsum results match numpy equivalents\n    ",examples:[{input:"A=[[1,2,3],[4,5,6]], B=[[1,2],[3,4],[5,6]]",output:"{'results': {'sum': {...}, 'matmul': {...}, ...}, 'all_match': True}",explanation:"All einsum operations produce identical results to NumPy equivalents"}],starterCode:`import numpy as np

def einsum_equivalence(A: np.ndarray, B: np.ndarray) -> dict:
    """
    Compare einsum with traditional NumPy operations.

    Args:
        A: First matrix (m, k)
        B: Second matrix (k, n)

    Returns:
        Dictionary with 'einsum' and 'numpy' results for comparison
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"All results match",input:'einsum_equivalence(np.array([[1.0,2.0,3.0],[4.0,5.0,6.0]]), np.array([[1.0,2.0],[3.0,4.0],[5.0,6.0]]))["all_match"]',expected:"True",hidden:!1},{id:"2",description:"Matrix multiplication matches",input:'bool(np.allclose(einsum_equivalence(np.array([[1.0,2.0],[3.0,4.0]]), np.array([[5.0,6.0],[7.0,8.0]]))["results"]["matmul"]["einsum"], np.array([[19.0,22.0],[43.0,50.0]])))',expected:"True",hidden:!1},{id:"3",description:"Transpose matches",input:'bool(np.allclose(einsum_equivalence(np.array([[1.0,2.0,3.0],[4.0,5.0,6.0]]), np.array([[1.0,2.0],[3.0,4.0],[5.0,6.0]]))["results"]["transpose"]["einsum"], np.array([[1.0,4.0],[2.0,5.0],[3.0,6.0]])))',expected:"True",hidden:!0},{id:"4",description:"Sum matches",input:'float(einsum_equivalence(np.array([[1.0,2.0],[3.0,4.0]]), np.array([[5.0,6.0],[7.0,8.0]]))["results"]["sum"]["einsum"])',expected:"10.0",hidden:!0}],hints:["Use np.allclose() to compare floating point arrays","Remember 'ik,kj->ij' is matrix multiplication"],solution:`import numpy as np

def einsum_equivalence(A: np.ndarray, B: np.ndarray) -> dict:
    results = {
        'sum': {
            'einsum': np.einsum('ij->', A),
            'numpy': np.sum(A)
        },
        'row_sum': {
            'einsum': np.einsum('ij->i', A),
            'numpy': np.sum(A, axis=1)
        },
        'matmul': {
            'einsum': np.einsum('ik,kj->ij', A, B),
            'numpy': A @ B
        },
        'transpose': {
            'einsum': np.einsum('ij->ji', A),
            'numpy': A.T
        },
        'hadamard_sum': {
            'einsum': np.einsum('ij,ij->', A, A),
            'numpy': np.sum(A * A)
        }
    }

    # Verify all match
    all_match = all(
        np.allclose(v['einsum'], v['numpy'])
        for v in results.values()
    )

    return {'results': results, 'all_match': all_match}
`}],_=[{id:"tensor-creation",title:"Tensor Creation (NumPy Style)",section:"pytorch-basics",difficulty:"easy",description:"\n## Tensor Creation\n\nLearn tensor creation patterns used in PyTorch, implemented with NumPy.\n\n### PyTorch Equivalents\n| PyTorch | NumPy |\n|---------|-------|\n| `torch.tensor([1,2,3])` | `np.array([1,2,3])` |\n| `torch.zeros(3, 4)` | `np.zeros((3, 4))` |\n| `torch.randn(2, 3)` | `np.random.randn(2, 3)` |\n| `torch.arange(10)` | `np.arange(10)` |\n| `torch.linspace(0, 1, 5)` | `np.linspace(0, 1, 5)` |\n\n### Data Types\n| PyTorch | NumPy |\n|---------|-------|\n| `torch.float32` | `np.float32` |\n| `torch.int64` | `np.int64` |\n\n### Task\nCreate tensors matching PyTorch patterns.\n\n### Expected Return Format\nReturn a dictionary with these keys:\n- `'from_list'`: Array from [1,2,3,4] with float32 dtype\n- `'zeros'`: Zero array of shape (3, 4)\n- `'ones'`: Ones array of shape (2, 3)\n- `'randn'`: Random normal array of shape (2, 3)\n- `'arange'`: Array from 0 to 9\n- `'linspace'`: 5 evenly spaced values from 0 to 1\n- `'eye'`: 4x4 identity matrix\n- `'full'`: (2, 3) array filled with 7.0\n    ",examples:[{input:"create_tensors()",output:"{'zeros': shape (3,4), 'ones': shape (2,3), 'randn': shape (2,3), 'arange': [0..9], ...}",explanation:"Dictionary containing tensors created with various methods"}],starterCode:`import numpy as np

def create_tensors() -> dict:
    """
    Create tensors using various methods.

    Returns:
        Dictionary with named tensors
    """
    np.random.seed(42)

    # Your code here
    pass
`,testCases:[{id:"1",description:"Zeros shape",input:'create_tensors()["zeros"].shape',expected:"(3, 4)",hidden:!1},{id:"2",description:"Random tensor shape",input:'create_tensors()["randn"].shape',expected:"(2, 3)",hidden:!1}],hints:["np.zeros((3, 4)) for 3x4 zeros","np.random.randn(2, 3) for random normal","Specify dtype with astype() or dtype parameter"],solution:`import numpy as np

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
`},{id:"tensor-operations",title:"Tensor Operations",section:"pytorch-basics",difficulty:"easy",description:"\n## Basic Tensor Operations\n\nCommon tensor operations used in neural networks.\n\n### Arithmetic Operations\n- Element-wise: +, -, *, /\n- Matrix multiplication: @ or np.matmul\n- Power: ** or np.power\n\n### Reduction Operations\n- sum, mean, std, var\n- min, max, argmin, argmax\n\n### Shape Operations\n- reshape, view (reshape in NumPy)\n- squeeze, unsqueeze (np.squeeze, np.expand_dims)\n- permute, transpose\n\n### Task\nImplement common tensor operations.\n\n### Expected Return Format\nReturn a dictionary with these keys:\n- **Arithmetic**: `'add'`, `'sub'`, `'mul'`, `'div'`, `'pow'`\n- **Reductions**: `'sum_all'`, `'sum_axis0'`, `'sum_axis1'`, `'mean'`, `'std'`, `'max'`, `'argmax'`\n- **Shape ops**: `'reshape'` (to 3,2), `'flatten'`, `'unsqueeze'` (add dim 0), `'squeeze'`, `'transpose'`\n    ",examples:[{input:"x=[[1,2,3],[4,5,6]], y=[[1,1,1],[2,2,2]]",output:"{'add': [[2,3,4],[6,7,8]], 'mean': 3.5, 'reshape': [[1,2],[3,4],[5,6]], ...}",explanation:"Arithmetic, reduction, and shape operations on tensors"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Addition",input:'bool(np.array_equal(tensor_ops(np.array([[1,2,3],[4,5,6]]), np.array([[1,1,1],[2,2,2]]))["add"], np.array([[2,3,4],[6,7,8]])))',expected:"True",hidden:!1},{id:"2",description:"Mean computation",input:'tensor_ops(np.array([[1,2,3],[4,5,6]]), np.array([[1,1,1],[2,2,2]]))["mean"]',expected:"3.5",hidden:!1}],hints:["Element-wise ops work directly: x + y, x * y","Use axis parameter for reductions along specific dims","np.expand_dims(x, axis=0) adds dimension"],solution:`import numpy as np

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
`},{id:"autograd-concepts",title:"Autograd Concepts (Manual)",section:"pytorch-basics",difficulty:"medium",description:`
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
    `,examples:[{input:"compute_gradients(x=2.0)",output:"{'y': 11.0, 'grad': 7.0}",explanation:"Forward and backward pass"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Simple gradient",input:'compute_gradients(2.0)["grad"]',expected:"7.0",hidden:!1},{id:"2",description:"Forward pass result",input:'compute_gradients(2.0)["y"]',expected:"11.0",hidden:!1}],hints:["For y = x² + 3x + 1, dy/dx = 2x + 3","For Y = X @ W + b: dL/dW = X.T @ grad_output","dL/dX = grad_output @ W.T","dL/db = sum(grad_output, axis=0)"],solution:`import numpy as np

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
`},{id:"nn-modules",title:"Neural Network Modules",section:"pytorch-basics",difficulty:"medium",description:`
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
    `,examples:[{input:"Linear(10, 5).forward(x)",output:"Output of shape (batch, 5)",explanation:"Linear transformation"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Linear output shape",input:"Linear(10, 5).forward(np.random.randn(4, 10)).shape",expected:"(4, 5)",hidden:!1},{id:"2",description:"Sequential forward",input:"create_mlp(10, 20, 5).forward(np.random.randn(4, 10)).shape",expected:"(4, 5)",hidden:!1}],hints:["Initialize W with np.random.randn() * 0.01","ReLU: np.maximum(0, x)","Sequential applies layers in order"],solution:`import numpy as np

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
`},{id:"loss-functions",title:"Loss Functions",section:"pytorch-basics",difficulty:"medium",description:`
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
    `,examples:[{input:"cross_entropy(logits, targets)",output:"Scalar loss value",explanation:"Cross-entropy for classification"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Cross-entropy computation",input:"round(cross_entropy_loss(np.array([[2.0, 1.0, 0.1]]), np.array([0])), 4)",expected:"0.417",hidden:!1},{id:"2",description:"MSE computation",input:"mse_loss(np.array([1.0, 2.0, 3.0]), np.array([1.0, 2.0, 4.0]))",expected:"0.333333",hidden:!1}],hints:["Softmax: exp(x - max(x)) / sum(exp(x - max(x)))","Use np.clip for numerical stability in log","Index logits with targets for cross-entropy"],solution:`import numpy as np

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
`},{id:"gelu-activation",title:"GELU Activation",section:"pytorch-basics",difficulty:"easy",description:`
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
    `,examples:[{input:"gelu(np.array([0.0]))",output:"[0.0]",explanation:"GELU(0) = 0"},{input:"gelu(np.array([1.0]))",output:"[≈0.8412]",explanation:"GELU(1) ≈ 0.8412"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"GELU of zero is zero",input:"round(float(gelu(np.array([0.0]))[0]), 4)",expected:"0.0",hidden:!1},{id:"2",description:"GELU of 1.0",input:"round(float(gelu(np.array([1.0]))[0]), 4)",expected:"0.8412",hidden:!1},{id:"3",description:"GELU of -1.0 (small negative output)",input:"round(float(gelu(np.array([-1.0]))[0]), 4)",expected:"-0.1588",hidden:!1},{id:"4",description:"Shape preservation",input:"gelu(np.random.randn(3, 4)).shape",expected:"(3, 4)",hidden:!1},{id:"5",description:"GELU allows small negative values unlike ReLU",input:"bool(gelu(np.array([-0.5]))[0] < 0)",expected:"True",hidden:!0},{id:"6",description:"GELU array computation",input:"bool(np.allclose(gelu(np.array([-1.0, 0.0, 1.0])), np.array([-0.1588, 0.0, 0.8412]), atol=1e-4))",expected:"True",hidden:!0}],hints:["The constant sqrt(2/π) ≈ 0.7979","Use np.tanh for the hyperbolic tangent","All operations are element-wise, so they work on arrays of any shape","The formula is: 0.5 * x * (1 + tanh(sqrt(2/π) * (x + 0.044715 * x³)))"],solution:`import numpy as np

def gelu(x: np.ndarray) -> np.ndarray:
    return 0.5 * x * (1 + np.tanh(np.sqrt(2 / np.pi) * (x + 0.044715 * x ** 3)))
`},{id:"leaky-relu-swish",title:"LeakyReLU & Swish",section:"pytorch-basics",difficulty:"easy",description:`
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
    `,examples:[{input:"leaky_relu(np.array([-2.0, -1.0, 0.0, 1.0, 2.0]))",output:"[-0.02, -0.01, 0.0, 1.0, 2.0]",explanation:"Negative values scaled by alpha=0.01"},{input:"swish(np.array([0.0]))",output:"[0.0]",explanation:"Swish(0) = 0 * sigmoid(0) = 0 * 0.5 = 0"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"LeakyReLU positive values unchanged",input:"bool(np.allclose(leaky_relu(np.array([1.0, 2.0, 3.0])), np.array([1.0, 2.0, 3.0])))",expected:"True",hidden:!1},{id:"2",description:"LeakyReLU negative values scaled by alpha",input:"bool(np.allclose(leaky_relu(np.array([-1.0, -2.0]), 0.01), np.array([-0.01, -0.02])))",expected:"True",hidden:!1},{id:"3",description:"Swish of zero is zero",input:"round(float(swish(np.array([0.0]))[0]), 4)",expected:"0.0",hidden:!1},{id:"4",description:"Swish is smooth (positive input)",input:"round(float(swish(np.array([1.0]))[0]), 4)",expected:"0.7311",hidden:!1},{id:"5",description:"LeakyReLU with custom alpha",input:"bool(np.allclose(leaky_relu(np.array([-1.0, -2.0]), 0.1), np.array([-0.1, -0.2])))",expected:"True",hidden:!0},{id:"6",description:"Shape preservation for both functions",input:"bool(leaky_relu(np.random.randn(3, 4)).shape == (3, 4) and swish(np.random.randn(3, 4)).shape == (3, 4))",expected:"True",hidden:!0}],hints:["LeakyReLU can be implemented with np.where(x > 0, x, alpha * x)","Sigmoid function: 1 / (1 + np.exp(-x))","Swish is simply x * sigmoid(beta * x)","All operations should be element-wise"],solution:`import numpy as np

def leaky_relu(x: np.ndarray, alpha: float = 0.01) -> np.ndarray:
    return np.where(x > 0, x, alpha * x)

def swish(x: np.ndarray, beta: float = 1.0) -> np.ndarray:
    return x * (1 / (1 + np.exp(-beta * x)))
`},{id:"softmax-temperature",title:"Softmax with Temperature",section:"pytorch-basics",difficulty:"easy",description:`
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
    `,examples:[{input:"softmax_temperature(np.array([2.0, 1.0, 0.1]), temperature=1.0)",output:"[0.659, 0.242, 0.099]",explanation:"Standard softmax at T=1.0"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Output sums to 1",input:"bool(np.allclose(np.sum(softmax_temperature(np.array([2.0, 1.0, 0.1]))), 1.0))",expected:"True",hidden:!1},{id:"2",description:"Standard softmax at T=1",input:"bool(np.allclose(softmax_temperature(np.array([2.0, 1.0, 0.1]), 1.0), np.array([0.6590, 0.2424, 0.0986]), atol=1e-3))",expected:"True",hidden:!1},{id:"3",description:"Low temperature approaches one-hot",input:"bool(np.argmax(softmax_temperature(np.array([2.0, 1.0, 0.1]), 0.01)) == 0 and softmax_temperature(np.array([2.0, 1.0, 0.1]), 0.01)[0] > 0.99)",expected:"True",hidden:!1},{id:"4",description:"High temperature approaches uniform",input:"bool(np.allclose(softmax_temperature(np.array([2.0, 1.0, 0.1]), 100.0), np.array([1/3, 1/3, 1/3]), atol=0.01))",expected:"True",hidden:!1},{id:"5",description:"Shape preservation for 2D input",input:"softmax_temperature(np.random.randn(3, 5), 1.0).shape",expected:"(3, 5)",hidden:!0},{id:"6",description:"Each row sums to 1 for 2D input",input:"bool(np.allclose(np.sum(softmax_temperature(np.array([[1.0, 2.0], [3.0, 4.0]]), 1.0), axis=-1), np.array([1.0, 1.0])))",expected:"True",hidden:!0}],hints:["First divide logits by temperature: scaled = logits / T","For numerical stability, subtract the max: scaled - max(scaled)","Then apply standard softmax: exp(x) / sum(exp(x))","Use axis=-1 and keepdims=True for multi-dimensional support"],solution:`import numpy as np

def softmax_temperature(logits: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    scaled = logits / temperature
    exp_x = np.exp(scaled - np.max(scaled, axis=-1, keepdims=True))
    return exp_x / np.sum(exp_x, axis=-1, keepdims=True)
`},{id:"rmsnorm",title:"RMS Normalization",section:"pytorch-basics",difficulty:"medium",description:`
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
    `,examples:[{input:"rmsnorm(np.array([[1.0, 2.0, 3.0]]), np.array([1.0, 1.0, 1.0]))",output:"[[0.4629, 0.9258, 1.3887]]",explanation:"Normalized by RMS = sqrt(mean([1,4,9])) = sqrt(14/3)"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Output shape matches input",input:"rmsnorm(np.random.randn(2, 4), np.ones(4)).shape",expected:"(2, 4)",hidden:!1},{id:"2",description:"Known values with gamma=1",input:"bool(np.allclose(rmsnorm(np.array([[1.0, 2.0, 3.0]]), np.ones(3)), np.array([[0.4629, 0.9258, 1.3887]]), atol=1e-3))",expected:"True",hidden:!1},{id:"3",description:"Gamma scaling effect",input:"bool(np.allclose(rmsnorm(np.array([[1.0, 2.0, 3.0]]), np.array([2.0, 2.0, 2.0])), 2.0 * rmsnorm(np.array([[1.0, 2.0, 3.0]]), np.ones(3)), atol=1e-6))",expected:"True",hidden:!1},{id:"4",description:"Different from LayerNorm (no mean subtraction)",input:"(lambda: (x := np.array([[1.0, 2.0, 3.0]]), g := np.ones(3), rms_out := rmsnorm(x, g), bool(not np.allclose(rms_out.mean(axis=-1), 0.0, atol=1e-3)))[-1])()",expected:"True",hidden:!0},{id:"5",description:"Batch processing (multiple rows)",input:"bool(np.allclose(rmsnorm(np.array([[3.0, 4.0], [1.0, 1.0]]), np.ones(2))[1], np.array([1.0, 1.0]), atol=1e-3))",expected:"True",hidden:!0}],hints:["RMS = sqrt(mean(x², axis=-1, keepdims=True) + eps)","No mean subtraction — that is the key difference from LayerNorm","Use keepdims=True so the division broadcasts correctly","Final result: (x / RMS) * gamma"],solution:`import numpy as np

def rmsnorm(x: np.ndarray, gamma: np.ndarray, eps: float = 1e-6) -> np.ndarray:
    rms = np.sqrt(np.mean(x ** 2, axis=-1, keepdims=True) + eps)
    return (x / rms) * gamma
`},{id:"group-norm",title:"Group Normalization",section:"pytorch-basics",difficulty:"medium",description:`
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
    `,examples:[{input:"group_norm(x, num_groups=2, gamma, beta) where x is (2, 4)",output:"Normalized output of shape (2, 4)",explanation:"Channels divided into 2 groups of 2, normalized within each group"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Output shape matches input",input:"group_norm(np.random.randn(2, 4), 2, np.ones(4), np.zeros(4)).shape",expected:"(2, 4)",hidden:!1},{id:"2",description:"With groups=C acts like instance norm (each channel normalized)",input:"(lambda: (x := np.array([[1.0, 2.0, 3.0, 4.0]]), out := group_norm(x, 4, np.ones(4), np.zeros(4)), bool(np.allclose(out, np.zeros((1, 4)), atol=1e-3)))[-1])()",expected:"True",hidden:!1},{id:"3",description:"Gamma and beta effect",input:"(lambda: (x := np.array([[1.0, 2.0, 3.0, 4.0]]), out := group_norm(x, 2, 2.0 * np.ones(4), np.ones(4)), bool(out.shape == (1, 4) and not np.allclose(out, np.zeros((1, 4)))))[-1])()",expected:"True",hidden:!1},{id:"4",description:"Normalized within groups (mean ~0 before scale/shift)",input:"(lambda: (x := np.random.randn(4, 8), out := group_norm(x, 2, np.ones(8), np.zeros(8)), grouped := out.reshape(4, 2, 4), bool(np.allclose(grouped.mean(axis=2), 0.0, atol=1e-5)))[-1])()",expected:"True",hidden:!0},{id:"5",description:"Batch processing with multiple samples",input:"(lambda: (x := np.array([[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0]]), out := group_norm(x, 2, np.ones(4), np.zeros(4)), bool(out.shape == (2, 4)))[-1])()",expected:"True",hidden:!0}],hints:["Reshape x from (N, C) to (N, num_groups, C // num_groups)","Compute mean and var along axis=2 with keepdims=True","Normalize: (x_grouped - mean) / sqrt(var + eps)","Reshape back to (N, C) before applying gamma and beta"],solution:`import numpy as np

def group_norm(x: np.ndarray, num_groups: int, gamma: np.ndarray, beta: np.ndarray, eps: float = 1e-5) -> np.ndarray:
    N, C = x.shape
    x_grouped = x.reshape(N, num_groups, C // num_groups)
    mean = np.mean(x_grouped, axis=2, keepdims=True)
    var = np.var(x_grouped, axis=2, keepdims=True)
    x_norm = (x_grouped - mean) / np.sqrt(var + eps)
    x_norm = x_norm.reshape(N, C)
    return gamma * x_norm + beta
`},{id:"adam-optimizer",title:"Adam Optimizer",section:"pytorch-basics",difficulty:"medium",description:`
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
    `,examples:[{input:"adam_step(params, grads, m, v, t=1)",output:"{'params': updated, 'm': first_moment, 'v': second_moment}",explanation:"One step of Adam optimizer"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Params move in correct direction (negative gradient)",input:'(lambda: (result := adam_step(np.array([1.0, 2.0]), np.array([0.5, -0.3]), np.zeros(2), np.zeros(2), 1), bool(result["params"][0] < 1.0 and result["params"][1] > 2.0))[-1])()',expected:"True",hidden:!1},{id:"2",description:"First moment update",input:'(lambda: (result := adam_step(np.array([1.0]), np.array([1.0]), np.zeros(1), np.zeros(1), 1), round(float(result["m"][0]), 4))[-1])()',expected:"0.1",hidden:!1},{id:"3",description:"Second moment update",input:'(lambda: (result := adam_step(np.array([1.0]), np.array([1.0]), np.zeros(1), np.zeros(1), 1), round(float(result["v"][0]), 4))[-1])()',expected:"0.001",hidden:!1},{id:"4",description:"Bias correction at t=1",input:'(lambda: (result := adam_step(np.array([0.0]), np.array([1.0]), np.zeros(1), np.zeros(1), 1), bool(result["params"][0] < 0.0))[-1])()',expected:"True",hidden:!1},{id:"5",description:"Output shapes preserved",input:'(lambda: (result := adam_step(np.zeros((3, 4)), np.ones((3, 4)), np.zeros((3, 4)), np.zeros((3, 4)), 1), bool(result["params"].shape == (3, 4) and result["m"].shape == (3, 4) and result["v"].shape == (3, 4)))[-1])()',expected:"True",hidden:!0},{id:"6",description:"Multiple steps converge toward minimum",input:'(lambda: (p := np.array([5.0]), g := np.array([1.0]), m := np.zeros(1), v := np.zeros(1), r1 := adam_step(p, g, m, v, 1), r2 := adam_step(r1["params"], g, r1["m"], r1["v"], 2), bool(r2["params"][0] < r1["params"][0]))[-1])()',expected:"True",hidden:!0}],hints:["First moment: m = beta1 * m + (1 - beta1) * grads","Second moment: v = beta2 * v + (1 - beta2) * grads ** 2","Bias correction divides by (1 - beta^t)","Final update: params - lr * m_hat / (sqrt(v_hat) + eps)"],solution:`import numpy as np

def adam_step(params, grads, m, v, t, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
    m = beta1 * m + (1 - beta1) * grads
    v = beta2 * v + (1 - beta2) * grads ** 2
    m_hat = m / (1 - beta1 ** t)
    v_hat = v / (1 - beta2 ** t)
    params = params - lr * m_hat / (np.sqrt(v_hat) + eps)
    return {'params': params, 'm': m, 'v': v}
`},{id:"sgd-momentum",title:"SGD with Momentum",section:"pytorch-basics",difficulty:"medium",description:`
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
    `,examples:[{input:"sgd_momentum_step(params, grads, velocity, lr=0.01, momentum=0.9)",output:"{'params': updated, 'velocity': updated}",explanation:"One step of SGD with momentum"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Without momentum (momentum=0) is standard SGD",input:'(lambda: (result := sgd_momentum_step(np.array([1.0]), np.array([2.0]), np.zeros(1), lr=0.1, momentum=0.0), round(float(result["params"][0]), 4))[-1])()',expected:"0.8",hidden:!1},{id:"2",description:"Velocity accumulates with momentum",input:'(lambda: (r1 := sgd_momentum_step(np.array([1.0]), np.array([1.0]), np.zeros(1), lr=0.1, momentum=0.9), r2 := sgd_momentum_step(r1["params"], np.array([1.0]), r1["velocity"], lr=0.1, momentum=0.9), bool(abs(float(r2["velocity"][0])) > abs(float(r1["velocity"][0]))))[-1])()',expected:"True",hidden:!1},{id:"3",description:"Correct velocity update",input:'(lambda: (result := sgd_momentum_step(np.array([0.0]), np.array([1.0]), np.zeros(1), lr=0.01, momentum=0.9), round(float(result["velocity"][0]), 4))[-1])()',expected:"1.0",hidden:!1},{id:"4",description:"Params move opposite to gradient direction",input:'(lambda: (result := sgd_momentum_step(np.array([5.0, 3.0]), np.array([1.0, -1.0]), np.zeros(2), lr=0.1, momentum=0.9), bool(result["params"][0] < 5.0 and result["params"][1] > 3.0))[-1])()',expected:"True",hidden:!1},{id:"5",description:"Shape preservation",input:'(lambda: (result := sgd_momentum_step(np.zeros((3, 4)), np.ones((3, 4)), np.zeros((3, 4)), lr=0.01, momentum=0.9), bool(result["params"].shape == (3, 4) and result["velocity"].shape == (3, 4)))[-1])()',expected:"True",hidden:!0},{id:"6",description:"Velocity with existing momentum",input:'(lambda: (result := sgd_momentum_step(np.array([0.0]), np.array([1.0]), np.array([2.0]), lr=0.01, momentum=0.9), round(float(result["velocity"][0]), 4))[-1])()',expected:"2.8",hidden:!0}],hints:["Velocity update: v = momentum * v + grads","Parameter update: params = params - lr * v","When momentum=0, this reduces to vanilla SGD: params = params - lr * grads","The velocity accumulates gradient information over time"],solution:`import numpy as np

def sgd_momentum_step(params, grads, velocity, lr=0.01, momentum=0.9):
    velocity = momentum * velocity + grads
    params = params - lr * velocity
    return {'params': params, 'velocity': velocity}
`},{id:"lr-scheduling",title:"Learning Rate Scheduling",section:"pytorch-basics",difficulty:"medium",description:`
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
    `,examples:[{input:"lr_schedule(step=0, warmup_steps=100, total_steps=1000)",output:"0.0",explanation:"At step 0, warmup starts from 0"},{input:"lr_schedule(step=100, warmup_steps=100, total_steps=1000)",output:"0.001",explanation:"At end of warmup, lr = base_lr"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"LR at step 0 is approximately 0",input:"round(lr_schedule(0, 100, 1000, 0.001, 1e-6), 6)",expected:"0.0",hidden:!1},{id:"2",description:"LR at warmup_steps equals base_lr",input:"round(lr_schedule(100, 100, 1000, 0.001, 1e-6), 6)",expected:"0.001",hidden:!1},{id:"3",description:"LR at total_steps equals min_lr",input:"round(lr_schedule(1000, 100, 1000, 0.001, 1e-6), 6)",expected:"1e-06",hidden:!1},{id:"4",description:"LR increases during warmup",input:"bool(lr_schedule(50, 100, 1000, 0.001) < lr_schedule(75, 100, 1000, 0.001))",expected:"True",hidden:!1},{id:"5",description:"LR decreases during decay",input:"bool(lr_schedule(200, 100, 1000, 0.001) > lr_schedule(500, 100, 1000, 0.001))",expected:"True",hidden:!0},{id:"6",description:"Midpoint of warmup is half of base_lr",input:"round(lr_schedule(50, 100, 1000, 0.001, 1e-6), 6)",expected:"0.0005",hidden:!0}],hints:["During warmup (step < warmup_steps): lr = base_lr * step / warmup_steps","During decay: compute progress = (step - warmup_steps) / (total_steps - warmup_steps)","Cosine decay: min_lr + 0.5 * (base_lr - min_lr) * (1 + cos(π * progress))","Use np.cos and np.pi for the cosine computation"],solution:`import numpy as np

def lr_schedule(step, warmup_steps, total_steps, base_lr=0.001, min_lr=1e-6):
    if step < warmup_steps:
        return base_lr * step / warmup_steps
    else:
        progress = (step - warmup_steps) / (total_steps - warmup_steps)
        return min_lr + 0.5 * (base_lr - min_lr) * (1 + np.cos(np.pi * progress))
`},{id:"gradient-accumulation",title:"Gradient Accumulation",section:"pytorch-basics",difficulty:"medium",description:`
## Gradient Accumulation

Simulate gradient accumulation — train with large effective batch sizes when GPU memory is limited.

### How It Works
\`\`\`
effective_grad = (1/N) * sum(grad_i for i in range(N))
\`\`\`

### Task
Given a list of gradient arrays (one per micro-batch), return the averaged gradient.
    `,examples:[{input:"grads = [np.array([1,2]), np.array([3,4])], steps = 2",output:"[2.0, 3.0]",explanation:"Average of [1,2] and [3,4]"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Two micro-batches averaged",input:"gradient_accumulation([np.array([1.0, 2.0]), np.array([3.0, 4.0])], 2).tolist()",expected:"[2.0, 3.0]",hidden:!1},{id:"2",description:"Single micro-batch returns itself",input:"gradient_accumulation([np.array([5.0, 6.0])], 1).tolist()",expected:"[5.0, 6.0]",hidden:!1},{id:"3",description:"Four micro-batches",input:"gradient_accumulation([np.array([1.0]), np.array([2.0]), np.array([3.0]), np.array([4.0])], 4).tolist()",expected:"[2.5]",hidden:!0},{id:"4",description:"Shape preserved with 2D gradients",input:"gradient_accumulation([np.ones((3, 4)), np.ones((3, 4))], 2).shape",expected:"(3, 4)",hidden:!0}],hints:["Initialize an accumulator with np.zeros_like","Sum all gradient arrays, then divide by accumulation_steps"],solution:`import numpy as np

def gradient_accumulation(micro_batches_grads, accumulation_steps):
    accumulated = np.zeros_like(micro_batches_grads[0])
    for grad in micro_batches_grads[:accumulation_steps]:
        accumulated += grad
    return accumulated / accumulation_steps
`},{id:"instance-norm",title:"Instance Normalization",section:"pytorch-basics",difficulty:"medium",description:`
## Instance Normalization

Normalize per-sample per-channel over spatial dims (H, W). Used in style transfer and GANs.

### Formula
\`\`\`
x_norm[n, c] = (x[n, c] - mean) / sqrt(var + eps)
out[n, c] = gamma[c] * x_norm[n, c] + beta[c]
\`\`\`
    `,examples:[{input:"x shape (2, 3, 4, 4), gamma (3,), beta (3,)",output:"Normalized output shape (2, 3, 4, 4)",explanation:"Each sample-channel pair normalized independently"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Output shape preserved",input:"instance_norm(np.random.randn(2, 3, 4, 4), np.ones(3), np.zeros(3)).shape",expected:"(2, 3, 4, 4)",hidden:!1},{id:"2",description:"Per-channel mean near zero",input:`(lambda: (
    x := np.random.randn(2, 3, 8, 8),
    out := instance_norm(x, np.ones(3), np.zeros(3)),
    bool(np.allclose(out.mean(axis=(2, 3)), 0, atol=1e-5))
)[-1])()`,expected:"True",hidden:!1},{id:"3",description:"Per-channel variance near 1",input:`(lambda: (
    x := np.random.randn(2, 3, 8, 8),
    out := instance_norm(x, np.ones(3), np.zeros(3)),
    bool(np.allclose(out.var(axis=(2, 3)), 1, atol=0.15))
)[-1])()`,expected:"True",hidden:!0},{id:"4",description:"Beta shifts output mean",input:`(lambda: (
    x := np.random.randn(2, 3, 4, 4),
    out := instance_norm(x, np.ones(3), np.array([1.0, 2.0, 3.0])),
    bool(np.allclose(out.mean(axis=(2, 3)), np.array([[1, 2, 3], [1, 2, 3]]), atol=0.15))
)[-1])()`,expected:"True",hidden:!0}],hints:["Compute mean and variance over spatial dims (axis 2 and 3)","Use keepdims=True for broadcasting","Reshape gamma and beta to (1, C, 1, 1)"],solution:`import numpy as np

def instance_norm(x, gamma, beta, eps=1e-5):
    N, C, H, W = x.shape
    mean = np.mean(x, axis=(2, 3), keepdims=True)
    var = np.var(x, axis=(2, 3), keepdims=True)
    x_norm = (x - mean) / np.sqrt(var + eps)
    gamma = gamma.reshape(1, C, 1, 1)
    beta = beta.reshape(1, C, 1, 1)
    return gamma * x_norm + beta
`},{id:"vit-patch-embeddings",title:"ViT Patch Embeddings",section:"pytorch-basics",difficulty:"medium",description:`
## Vision Transformer (ViT) Patch Embeddings

Convert an image into patch embeddings: split into patches, flatten, project, prepend CLS token, add positional embeddings.

### Output Shape
(num_patches + 1, embed_dim) where num_patches = (H/P) * (W/P)
    `,examples:[{input:"image (3, 8, 8), patch_size=4, embed_dim=16",output:"Shape: (5, 16) -- 4 patches + 1 CLS token",explanation:"8/4 = 2 per side, 2*2=4 patches + CLS"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Output shape correct",input:`(lambda: (
    np.random.seed(42),
    img := np.random.randn(3, 8, 8),
    W := np.random.randn(3*4*4, 16),
    cls := np.random.randn(16),
    pos := np.random.randn(5, 16),
    patch_embed(img, 4, 16, W, cls, pos).shape
)[-1])()`,expected:"(5, 16)",hidden:!1},{id:"2",description:"Correct patch count for 16x16 image",input:`(lambda: (
    np.random.seed(42),
    img := np.random.randn(3, 16, 16),
    n := (16//4) * (16//4),
    W := np.random.randn(48, 32),
    cls := np.random.randn(32),
    pos := np.random.randn(n + 1, 32),
    patch_embed(img, 4, 32, W, cls, pos).shape[0]
)[-1])()`,expected:"17",hidden:!1},{id:"3",description:"Output is finite",input:`(lambda: (
    np.random.seed(42),
    img := np.random.randn(3, 8, 8),
    W := np.random.randn(48, 16),
    cls := np.random.randn(16),
    pos := np.random.randn(5, 16),
    bool(np.all(np.isfinite(patch_embed(img, 4, 16, W, cls, pos))))
)[-1])()`,expected:"True",hidden:!0},{id:"4",description:"Embedding dimension correct",input:`(lambda: (
    np.random.seed(42),
    img := np.random.randn(3, 8, 8),
    W := np.random.randn(48, 64),
    cls := np.random.randn(64),
    pos := np.random.randn(5, 64),
    patch_embed(img, 4, 64, W, cls, pos).shape[1]
)[-1])()`,expected:"64",hidden:!0}],hints:["Extract patches with nested loops over (H/P) and (W/P)","Flatten each patch and project: patch.flatten() @ W_proj","Use np.vstack to prepend the CLS token"],solution:`import numpy as np

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
`},{id:"cross-attention",title:"Cross-Attention",section:"pytorch-basics",difficulty:"hard",description:`
## Cross-Attention

Q from one sequence, K/V from another (different lengths). Used in transformer decoders and Stable Diffusion.

### Formula
\`\`\`
scores = (Q @ K.T) / sqrt(d_k)
weights = softmax(scores)
output = weights @ V
\`\`\`
    `,examples:[{input:"Q (4, 8), K (6, 8), V (6, 16)",output:"Shape (4, 16)",explanation:"Output seq_len matches Q, feature dim matches V"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Output shape matches (seq_q, d_v)",input:"cross_attention(np.random.randn(4, 8), np.random.randn(6, 8), np.random.randn(6, 16)).shape",expected:"(4, 16)",hidden:!1},{id:"2",description:"Different Q and KV lengths",input:"cross_attention(np.random.randn(3, 8), np.random.randn(10, 8), np.random.randn(10, 8)).shape",expected:"(3, 8)",hidden:!1},{id:"3",description:"Output is finite",input:"bool(np.all(np.isfinite(cross_attention(np.random.randn(4, 16), np.random.randn(6, 16), np.random.randn(6, 32)))))",expected:"True",hidden:!0},{id:"4",description:"Single query",input:"cross_attention(np.random.randn(1, 8), np.random.randn(5, 8), np.random.randn(5, 4)).shape",expected:"(1, 4)",hidden:!0}],hints:["Compute scores: Q @ K.T / sqrt(d_k)","Apply softmax along the last axis","Multiply attention weights by V"],solution:`import numpy as np

def cross_attention(Q, K, V):
    d_k = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d_k)
    weights = np.exp(scores - np.max(scores, axis=-1, keepdims=True))
    weights = weights / np.sum(weights, axis=-1, keepdims=True)
    return weights @ V
`},{id:"depthwise-separable-conv",title:"Depthwise Separable Convolution",section:"pytorch-basics",difficulty:"medium",description:`
## Depthwise Separable Convolution

Used in MobileNet. Two steps:
1. **Depthwise**: Each channel convolved independently
2. **Pointwise**: 1x1 convolution to mix channels

Parameter savings: C_in*K*K + C_in*C_out vs C_in*C_out*K*K
    `,examples:[{input:"x (3, 8, 8), dw_kernel (3, 3, 3)",output:"depthwise: (3, 6, 6)",explanation:"Each channel convolved with its own 3x3 filter"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Depthwise output shape",input:"depthwise_conv(np.random.randn(3, 8, 8), np.random.randn(3, 3, 3)).shape",expected:"(3, 6, 6)",hidden:!1},{id:"2",description:"Pointwise output shape",input:"pointwise_conv(np.random.randn(3, 6, 6), np.random.randn(16, 3, 1, 1)).shape",expected:"(16, 6, 6)",hidden:!1},{id:"3",description:"Depthwise preserves channels",input:"depthwise_conv(np.random.randn(8, 5, 5), np.random.randn(8, 3, 3)).shape[0]",expected:"8",hidden:!0},{id:"4",description:"Depthwise known values",input:`(lambda: (
    x := np.ones((1, 3, 3)),
    k := np.ones((1, 2, 2)),
    round(float(depthwise_conv(x, k)[0, 0, 0]), 1)
)[-1])()`,expected:"4.0",hidden:!0}],hints:["Depthwise: loop over channels, each gets its own filter","For each position, sum(input_patch * kernel)","Pointwise: linear combination of channels at each spatial position"],solution:`import numpy as np

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
`},{id:"label-smoothing",title:"Label Smoothing",section:"pytorch-basics",difficulty:"medium",description:`
## Label Smoothing

Cross-entropy with softened targets to prevent overconfidence.

### Formula
\`\`\`
smooth = (1 - eps) * one_hot + eps / num_classes
loss = -mean(sum(smooth * log(softmax(logits))))
\`\`\`
    `,examples:[{input:"logits [[2, 1, 0.1]], targets [0], smoothing 0.1",output:"Loss slightly higher than standard CE",explanation:"Smoothed labels prevent overconfident predictions"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Smoothing=0 equals standard CE",input:`(lambda: (
    logits := np.array([[2.0, 1.0, 0.1]]),
    targets := np.array([0]),
    loss_s := label_smoothing_loss(logits, targets, 3, 0.0),
    exp_x := np.exp(logits - np.max(logits)),
    probs := exp_x / np.sum(exp_x),
    loss_std := float(-np.log(probs[0, 0])),
    bool(abs(loss_s - loss_std) < 0.001)
)[-1])()`,expected:"True",hidden:!1},{id:"2",description:"Smoothing increases loss",input:`(lambda: (
    logits := np.array([[5.0, 0.0, 0.0]]),
    targets := np.array([0]),
    l0 := label_smoothing_loss(logits, targets, 3, 0.0),
    l1 := label_smoothing_loss(logits, targets, 3, 0.1),
    bool(l1 > l0)
)[-1])()`,expected:"True",hidden:!1},{id:"3",description:"Returns float",input:"type(label_smoothing_loss(np.array([[1.0, 2.0]]), np.array([0]), 2, 0.1)).__name__",expected:"float",hidden:!0},{id:"4",description:"Batch of multiple samples",input:`(lambda: (
    loss := label_smoothing_loss(np.array([[2.0, 1.0], [1.0, 2.0]]), np.array([0, 1]), 2, 0.1),
    bool(loss > 0)
)[-1])()`,expected:"True",hidden:!0}],hints:["Compute softmax (subtract max for stability)","Smooth: (1-eps)*one_hot + eps/num_classes","CE: -sum(smooth * log(probs))"],solution:`import numpy as np

def label_smoothing_loss(logits, targets, num_classes, smoothing=0.1):
    exp_x = np.exp(logits - np.max(logits, axis=-1, keepdims=True))
    probs = exp_x / np.sum(exp_x, axis=-1, keepdims=True)
    probs = np.clip(probs, 1e-15, 1 - 1e-15)
    one_hot = np.zeros_like(logits)
    one_hot[np.arange(len(targets)), targets] = 1.0
    smooth_targets = (1 - smoothing) * one_hot + smoothing / num_classes
    loss = -np.sum(smooth_targets * np.log(probs), axis=-1)
    return float(np.mean(loss))
`},{id:"lora-adapter",title:"LoRA Adapter",section:"pytorch-basics",difficulty:"hard",description:`
## LoRA (Low-Rank Adaptation)

Parameter-efficient fine-tuning: learn A (d_in, r) and B (r, d_out) instead of updating full W.

### Forward
\`\`\`
output = x @ W + (alpha / r) * x @ A @ B
\`\`\`

For d=4096, r=8: 99.6% fewer trainable parameters!
    `,examples:[{input:"x (2, 768), W (768, 768), A (768, 8), B (8, 768)",output:"Shape (2, 768)",explanation:"Base output + scaled low-rank adaptation"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Output shape correct",input:"lora_forward(np.random.randn(2, 16), np.random.randn(16, 16), np.random.randn(16, 4), np.random.randn(4, 16), 8, 4).shape",expected:"(2, 16)",hidden:!1},{id:"2",description:"Alpha=0 gives base output",input:`(lambda: (
    np.random.seed(42),
    x := np.random.randn(2, 8),
    W := np.random.randn(8, 8),
    A := np.random.randn(8, 2),
    B := np.random.randn(2, 8),
    bool(np.allclose(x @ W, lora_forward(x, W, A, B, 0, 2)))
)[-1])()`,expected:"True",hidden:!1},{id:"3",description:"LoRA modifies output when alpha > 0",input:`(lambda: (
    np.random.seed(42),
    x := np.random.randn(2, 8),
    W := np.random.randn(8, 8),
    A := np.random.randn(8, 2),
    B := np.random.randn(2, 8),
    bool(not np.allclose(x @ W, lora_forward(x, W, A, B, 4, 2)))
)[-1])()`,expected:"True",hidden:!0},{id:"4",description:"Different input/output dims",input:"lora_forward(np.random.randn(3, 64), np.random.randn(64, 32), np.random.randn(64, 4), np.random.randn(4, 32), 8, 4).shape",expected:"(3, 32)",hidden:!0}],hints:["Base: x @ W","LoRA: (alpha / r) * x @ A @ B","Return base + lora"],solution:`import numpy as np

def lora_forward(x, W, A, B, alpha, r):
    base_output = x @ W
    lora_output = (alpha / r) * (x @ A @ B)
    return base_output + lora_output
`},{id:"gradient-checkpointing",title:"Gradient Checkpointing",section:"pytorch-basics",difficulty:"hard",description:`
## Gradient Checkpointing

Trade compute for memory: only save activations at checkpoint layers, recompute the rest during backward pass.

### Memory: O(sqrt(n)) instead of O(n)

### Task
1. Forward pass saving only checkpoint activations
2. Recompute any activation from nearest prior checkpoint
    `,examples:[{input:"4 layers, checkpoints at [1, 3]",output:"3 activations saved (input + 2 checkpoints)",explanation:"Layers 0 and 2 recomputed when needed"}],starterCode:`import numpy as np

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
`,testCases:[{id:"1",description:"Output matches regular forward",input:`(lambda: (
    layers := [lambda x: x * 2, lambda x: x + 1, lambda x: x * 3],
    x := np.array([1.0]),
    regular := np.array([1.0]),
    [regular := l(regular) for l in layers],
    result := checkpoint_forward(layers, x, [1]),
    bool(np.allclose(result[0], regular))
)[-1])()`,expected:"True",hidden:!1},{id:"2",description:"Only checkpoint activations saved",input:`(lambda: (
    layers := [lambda x: x * 2, lambda x: x + 1, lambda x: x * 3, lambda x: x - 1],
    x := np.array([1.0]),
    result := checkpoint_forward(layers, x, [1, 3]),
    sorted(result[1].keys()) == [-1, 1, 3]
)[-1])()`,expected:"True",hidden:!1},{id:"3",description:"Recompute gives correct activation",input:`(lambda: (
    layers := [lambda x: x * 2, lambda x: x + 1, lambda x: x * 3],
    x := np.array([1.0]),
    result := checkpoint_forward(layers, x, [0]),
    recomputed := checkpoint_recompute(layers, result[1], [0], 1),
    bool(np.allclose(recomputed, np.array([3.0])))
)[-1])()`,expected:"True",hidden:!0},{id:"4",description:"Input always saved as index -1",input:`(lambda: (
    layers := [lambda x: x + 1],
    x := np.array([5.0]),
    result := checkpoint_forward(layers, x, []),
    bool(-1 in result[1])
)[-1])()`,expected:"True",hidden:!0}],hints:["Always save input at index -1","Iterate layers, save activation only at checkpoint indices","Recompute: find nearest checkpoint before target, run forward from there"],solution:`import numpy as np

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
`}],f=[{id:"e2e-mlp",title:"E2E: 2-Layer MLP with Backprop",section:"e2e-implementations",difficulty:"hard",description:`
## End-to-End 2-Layer MLP

Implement a complete 2-layer MLP with forward pass, backward pass, and training loop.

### Architecture
\`\`\`
Input (batch, input_dim)
  ↓
Linear(input_dim, hidden_dim) + ReLU
  ↓
Linear(hidden_dim, output_dim)
  ↓
Softmax + Cross-Entropy Loss
\`\`\`

### Forward Pass
\`\`\`python
h = relu(X @ W1 + b1)
logits = h @ W2 + b2
loss = cross_entropy(softmax(logits), y)
\`\`\`

### Backward Pass (Chain Rule)
\`\`\`python
# Output layer
d_logits = softmax(logits) - y_onehot  # (batch, output_dim)
d_W2 = h.T @ d_logits
d_b2 = d_logits.sum(axis=0)

# Hidden layer
d_h = d_logits @ W2.T
d_relu = d_h * (h > 0)  # ReLU derivative
d_W1 = X.T @ d_relu
d_b1 = d_relu.sum(axis=0)
\`\`\`

### Task
Implement forward, backward, and training step.
    `,examples:[{input:"MLP(784, 128, 10) on MNIST-like data",output:"Trained model with decreasing loss",explanation:"Full training loop"}],starterCode:`import numpy as np

class MLP:
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int):
        """Initialize 2-layer MLP with random weights."""
        np.random.seed(42)
        # Xavier initialization
        self.W1 = np.random.randn(input_dim, hidden_dim) * np.sqrt(2.0 / input_dim)
        self.b1 = np.zeros(hidden_dim)
        self.W2 = np.random.randn(hidden_dim, output_dim) * np.sqrt(2.0 / hidden_dim)
        self.b2 = np.zeros(output_dim)

        # Cache for backward pass
        self.cache = {}

    def relu(self, x):
        return np.maximum(0, x)

    def softmax(self, x):
        exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
        return exp_x / np.sum(exp_x, axis=-1, keepdims=True)

    def forward(self, X: np.ndarray) -> np.ndarray:
        """
        Forward pass.

        Args:
            X: Input (batch, input_dim)

        Returns:
            logits: Output (batch, output_dim)
        """
        # Your code here
        pass

    def compute_loss(self, logits: np.ndarray, y: np.ndarray) -> float:
        """
        Compute cross-entropy loss.

        Args:
            logits: Model output (batch, output_dim)
            y: True labels (batch,) as integers

        Returns:
            loss: Scalar loss value
        """
        # Your code here
        pass

    def backward(self, y: np.ndarray) -> dict:
        """
        Backward pass.

        Args:
            y: True labels (batch,) as integers

        Returns:
            gradients: Dictionary with dW1, db1, dW2, db2
        """
        # Your code here
        pass

    def train_step(self, X: np.ndarray, y: np.ndarray, lr: float = 0.01) -> float:
        """
        Single training step: forward, loss, backward, update.

        Returns:
            loss: Loss value before update
        """
        # Your code here
        pass


def train_mlp(X_train, y_train, epochs=100, lr=0.01):
    """Train MLP and return loss history."""
    # Your code here
    pass
`,testCases:[{id:"1",description:"Forward pass shape",input:"MLP(784, 128, 10).forward(np.random.randn(4, 784)).shape",expected:"(4, 10)",hidden:!1},{id:"2",description:"Loss decreases",input:"(lambda: (m := MLP(10, 8, 3), X := np.random.randn(16, 10), y := np.array([0,1,2,0,1,2,0,1,2,0,1,2,0,1,2,0]), losses := [m.train_step(X, y) for _ in range(50)], losses[-1] < losses[0])[-1])()",expected:"True",hidden:!1},{id:"3",description:"Gradients computed",input:'(lambda: (m := MLP(10, 8, 3), X := np.random.randn(4, 10), y := np.array([0,1,2,0]), _ := m.forward(X), _ := m.compute_loss(m.cache["logits"], y), g := m.backward(y), all(k in g for k in ["dW1", "db1", "dW2", "db2"]))[-1])()',expected:"True",hidden:!0},{id:"4",description:"Forward pass produces finite values",input:"(lambda: (m := MLP(20, 16, 5), X := np.random.randn(8, 20), logits := m.forward(X), bool(np.all(np.isfinite(logits))))[-1])()",expected:"True",hidden:!0},{id:"5",description:"Gradient shapes match weight shapes",input:'(lambda: (m := MLP(10, 8, 3), X := np.random.randn(4, 10), y := np.array([0,1,2,0]), _ := m.forward(X), _ := m.compute_loss(m.cache["logits"], y), g := m.backward(y), bool(g["dW1"].shape == (10, 8) and g["dW2"].shape == (8, 3) and g["db1"].shape == (8,) and g["db2"].shape == (3,)))[-1])()',expected:"True",hidden:!0}],hints:["Cache X, h (hidden activations), and logits in forward pass","d_logits = probs - y_onehot (softmax gradient combined with cross-entropy)","ReLU gradient: 1 if x > 0, else 0","Update: W = W - lr * dW"],solution:`import numpy as np

class MLP:
    def __init__(self, input_dim: int, hidden_dim: int, output_dim: int):
        np.random.seed(42)
        self.W1 = np.random.randn(input_dim, hidden_dim) * np.sqrt(2.0 / input_dim)
        self.b1 = np.zeros(hidden_dim)
        self.W2 = np.random.randn(hidden_dim, output_dim) * np.sqrt(2.0 / hidden_dim)
        self.b2 = np.zeros(output_dim)
        self.cache = {}

    def relu(self, x):
        return np.maximum(0, x)

    def softmax(self, x):
        exp_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
        return exp_x / np.sum(exp_x, axis=-1, keepdims=True)

    def forward(self, X: np.ndarray) -> np.ndarray:
        # Layer 1: Linear + ReLU
        z1 = X @ self.W1 + self.b1
        h = self.relu(z1)

        # Layer 2: Linear
        logits = h @ self.W2 + self.b2

        # Cache for backward
        self.cache = {'X': X, 'z1': z1, 'h': h, 'logits': logits}

        return logits

    def compute_loss(self, logits: np.ndarray, y: np.ndarray) -> float:
        probs = self.softmax(logits)
        batch_size = logits.shape[0]
        correct_probs = probs[np.arange(batch_size), y]
        loss = -np.mean(np.log(np.clip(correct_probs, 1e-15, 1)))
        self.cache['probs'] = probs
        return loss

    def backward(self, y: np.ndarray) -> dict:
        X = self.cache['X']
        h = self.cache['h']
        z1 = self.cache['z1']
        probs = self.cache['probs']
        batch_size = X.shape[0]

        # One-hot encode targets
        y_onehot = np.zeros_like(probs)
        y_onehot[np.arange(batch_size), y] = 1

        # Output layer gradients
        d_logits = (probs - y_onehot) / batch_size
        dW2 = h.T @ d_logits
        db2 = d_logits.sum(axis=0)

        # Hidden layer gradients
        d_h = d_logits @ self.W2.T
        d_relu = d_h * (z1 > 0)  # ReLU derivative
        dW1 = X.T @ d_relu
        db1 = d_relu.sum(axis=0)

        return {'dW1': dW1, 'db1': db1, 'dW2': dW2, 'db2': db2}

    def train_step(self, X: np.ndarray, y: np.ndarray, lr: float = 0.01) -> float:
        logits = self.forward(X)
        loss = self.compute_loss(logits, y)
        grads = self.backward(y)

        # Update weights
        self.W1 -= lr * grads['dW1']
        self.b1 -= lr * grads['db1']
        self.W2 -= lr * grads['dW2']
        self.b2 -= lr * grads['db2']

        return loss


def train_mlp(X_train, y_train, epochs=100, lr=0.01):
    input_dim = X_train.shape[1]
    output_dim = len(np.unique(y_train))
    model = MLP(input_dim, 64, output_dim)

    losses = []
    for _ in range(epochs):
        loss = model.train_step(X_train, y_train, lr)
        losses.append(loss)

    return model, losses
`},{id:"e2e-transformer",title:"E2E: Transformer Encoder",section:"e2e-implementations",difficulty:"hard",description:`
## End-to-End Transformer Encoder

Implement a complete Transformer encoder block.

### Architecture
\`\`\`
Input Embeddings + Positional Encoding
  ↓
Multi-Head Self-Attention
  ↓
Add & LayerNorm (Residual)
  ↓
Feed-Forward Network (FFN)
  ↓
Add & LayerNorm (Residual)
  ↓
Output
\`\`\`

### Components
1. **Positional Encoding**: Sinusoidal position embeddings
2. **Multi-Head Attention**: Parallel attention heads
3. **FFN**: Two linear layers with ReLU
4. **Layer Normalization**: Normalize across features
5. **Residual Connections**: Add input to output

### Task
Implement all components and combine into encoder block.
    `,examples:[{input:"TransformerEncoder(d_model=64, nhead=8, dim_ff=256)",output:"Encoded sequence (batch, seq_len, d_model)",explanation:"Complete encoder forward pass"}],starterCode:`import numpy as np

def softmax(x, axis=-1):
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)


def layer_norm(x, gamma, beta, eps=1e-5):
    """Layer normalization."""
    # Your code here
    pass


def positional_encoding(seq_len, d_model):
    """Sinusoidal positional encoding."""
    # Your code here
    pass


def scaled_dot_product_attention(Q, K, V, mask=None):
    """Scaled dot-product attention."""
    # Your code here
    pass


def multi_head_attention(Q, K, V, num_heads):
    """Multi-head attention."""
    # Your code here
    pass


def feed_forward(x, W1, b1, W2, b2):
    """Position-wise feed-forward network: Linear -> ReLU -> Linear"""
    # Your code here
    pass


class TransformerEncoderBlock:
    def __init__(self, d_model: int, num_heads: int, d_ff: int):
        """
        Initialize transformer encoder block.

        Args:
            d_model: Model dimension
            num_heads: Number of attention heads
            d_ff: Feed-forward hidden dimension
        """
        np.random.seed(42)
        self.d_model = d_model
        self.num_heads = num_heads

        # Initialize weights
        # Your code here
        pass

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Forward pass through encoder block.

        Args:
            x: Input (batch, seq_len, d_model)

        Returns:
            output: (batch, seq_len, d_model)
        """
        # Your code here
        pass


def transformer_encoder(x, num_layers=2, d_model=64, num_heads=8, d_ff=256):
    """Stack multiple encoder blocks."""
    # Your code here
    pass
`,testCases:[{id:"1",description:"Output shape preserved",input:"transformer_encoder(np.random.randn(2, 10, 64), num_layers=2, d_model=64, num_heads=8, d_ff=256).shape",expected:"(2, 10, 64)",hidden:!1},{id:"2",description:"Attention weights sum to 1",input:"(lambda: (Q := np.random.randn(2, 5, 64), K := np.random.randn(2, 5, 64), V := np.random.randn(2, 5, 64), out_attn := scaled_dot_product_attention(Q, K, V), bool(np.allclose(out_attn[1].sum(axis=-1), 1.0)))[-1])()",expected:"True",hidden:!1},{id:"3",description:"Layer norm output has zero mean",input:"(lambda: (x := np.random.randn(2, 5, 64), gamma := np.ones(64), beta := np.zeros(64), out := layer_norm(x, gamma, beta), bool(np.allclose(out.mean(axis=-1), 0.0, atol=1e-5)))[-1])()",expected:"True",hidden:!0},{id:"4",description:"Positional encoding shape",input:"positional_encoding(10, 64).shape",expected:"(10, 64)",hidden:!0},{id:"5",description:"Encoder output is finite",input:"(lambda: (out := transformer_encoder(np.random.randn(2, 8, 64), num_layers=1, d_model=64, num_heads=8, d_ff=128), bool(np.all(np.isfinite(out))))[-1])()",expected:"True",hidden:!0}],hints:["Attention: softmax(QK^T / sqrt(d_k)) @ V","Layer norm: (x - mean) / sqrt(var + eps) * gamma + beta","Residual: output = LayerNorm(x + Sublayer(x))","FFN: max(0, xW1 + b1)W2 + b2"],solution:`import numpy as np

def softmax(x, axis=-1):
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)


def layer_norm(x, gamma, beta, eps=1e-5):
    mean = np.mean(x, axis=-1, keepdims=True)
    var = np.var(x, axis=-1, keepdims=True)
    return gamma * (x - mean) / np.sqrt(var + eps) + beta


def positional_encoding(seq_len, d_model):
    PE = np.zeros((seq_len, d_model))
    position = np.arange(seq_len)[:, np.newaxis]
    div_term = np.exp(np.arange(0, d_model, 2) * (-np.log(10000.0) / d_model))
    PE[:, 0::2] = np.sin(position * div_term)
    PE[:, 1::2] = np.cos(position * div_term)
    return PE


def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.shape[-1]
    scores = Q @ K.transpose(0, 2, 1) / np.sqrt(d_k)
    if mask is not None:
        scores = scores + mask
    attention = softmax(scores, axis=-1)
    return attention @ V, attention


def multi_head_attention(Q, K, V, num_heads):
    batch, seq_len, d_model = Q.shape
    d_k = d_model // num_heads

    Q = Q.reshape(batch, seq_len, num_heads, d_k).transpose(0, 2, 1, 3)
    K = K.reshape(batch, seq_len, num_heads, d_k).transpose(0, 2, 1, 3)
    V = V.reshape(batch, seq_len, num_heads, d_k).transpose(0, 2, 1, 3)

    d_k = Q.shape[-1]
    scores = np.einsum('bhqd,bhkd->bhqk', Q, K) / np.sqrt(d_k)
    attention = softmax(scores, axis=-1)
    output = np.einsum('bhqk,bhkd->bhqd', attention, V)

    output = output.transpose(0, 2, 1, 3).reshape(batch, seq_len, d_model)
    return output


def feed_forward(x, W1, b1, W2, b2):
    hidden = np.maximum(0, x @ W1 + b1)
    return hidden @ W2 + b2


class TransformerEncoderBlock:
    def __init__(self, d_model: int, num_heads: int, d_ff: int):
        np.random.seed(42)
        self.d_model = d_model
        self.num_heads = num_heads

        # Layer norm parameters
        self.ln1_gamma = np.ones(d_model)
        self.ln1_beta = np.zeros(d_model)
        self.ln2_gamma = np.ones(d_model)
        self.ln2_beta = np.zeros(d_model)

        # FFN parameters
        self.W1 = np.random.randn(d_model, d_ff) * 0.02
        self.b1 = np.zeros(d_ff)
        self.W2 = np.random.randn(d_ff, d_model) * 0.02
        self.b2 = np.zeros(d_model)

    def forward(self, x: np.ndarray) -> np.ndarray:
        # Multi-head self-attention + residual + layer norm
        attn_output = multi_head_attention(x, x, x, self.num_heads)
        x = layer_norm(x + attn_output, self.ln1_gamma, self.ln1_beta)

        # Feed-forward + residual + layer norm
        ff_output = feed_forward(x, self.W1, self.b1, self.W2, self.b2)
        x = layer_norm(x + ff_output, self.ln2_gamma, self.ln2_beta)

        return x


def transformer_encoder(x, num_layers=2, d_model=64, num_heads=8, d_ff=256):
    batch, seq_len, _ = x.shape

    # Add positional encoding
    PE = positional_encoding(seq_len, d_model)
    x = x + PE

    # Stack encoder blocks
    for _ in range(num_layers):
        block = TransformerEncoderBlock(d_model, num_heads, d_ff)
        x = block.forward(x)

    return x
`},{id:"e2e-vae",title:"E2E: Variational Autoencoder",section:"e2e-implementations",difficulty:"hard",description:`
## End-to-End Variational Autoencoder

Implement a complete VAE with encoder, decoder, reparameterization, and ELBO loss.

### Architecture
\`\`\`
Encoder: x → h → (μ, log_σ²)
         ↓
Reparameterization: z = μ + σ * ε, ε ~ N(0,1)
         ↓
Decoder: z → h → x_reconstructed
\`\`\`

### Loss (ELBO)
\`\`\`
L = Reconstruction Loss + KL Divergence
L = ||x - x_hat||² + KL(q(z|x) || p(z))
KL = -0.5 * sum(1 + log_var - μ² - exp(log_var))
\`\`\`

### Task
Implement encoder, decoder, reparameterization trick, and loss computation.
    `,examples:[{input:"VAE(input_dim=784, latent_dim=20)",output:"Reconstructed images + latent samples",explanation:"Full VAE forward pass"}],starterCode:`import numpy as np

class VAE:
    def __init__(self, input_dim: int, hidden_dim: int, latent_dim: int):
        """
        Initialize VAE.

        Args:
            input_dim: Input dimension (e.g., 784 for MNIST)
            hidden_dim: Hidden layer dimension
            latent_dim: Latent space dimension
        """
        np.random.seed(42)

        # Encoder weights
        self.W_enc = np.random.randn(input_dim, hidden_dim) * 0.01
        self.b_enc = np.zeros(hidden_dim)

        # Latent space (mean and log variance)
        self.W_mu = np.random.randn(hidden_dim, latent_dim) * 0.01
        self.b_mu = np.zeros(latent_dim)
        self.W_logvar = np.random.randn(hidden_dim, latent_dim) * 0.01
        self.b_logvar = np.zeros(latent_dim)

        # Decoder weights
        self.W_dec1 = np.random.randn(latent_dim, hidden_dim) * 0.01
        self.b_dec1 = np.zeros(hidden_dim)
        self.W_dec2 = np.random.randn(hidden_dim, input_dim) * 0.01
        self.b_dec2 = np.zeros(input_dim)

        self.latent_dim = latent_dim

    def encode(self, x: np.ndarray) -> tuple:
        """
        Encode input to latent distribution parameters.

        Returns:
            mu: Mean of latent distribution
            log_var: Log variance of latent distribution
        """
        # Your code here
        pass

    def reparameterize(self, mu: np.ndarray, log_var: np.ndarray) -> np.ndarray:
        """
        Reparameterization trick: z = mu + std * epsilon
        """
        # Your code here
        pass

    def decode(self, z: np.ndarray) -> np.ndarray:
        """
        Decode latent vector to reconstruction.
        """
        # Your code here
        pass

    def forward(self, x: np.ndarray) -> dict:
        """
        Full forward pass.

        Returns:
            Dictionary with mu, log_var, z, x_reconstructed
        """
        # Your code here
        pass

    def compute_loss(self, x: np.ndarray, x_recon: np.ndarray,
                     mu: np.ndarray, log_var: np.ndarray) -> dict:
        """
        Compute VAE loss (ELBO).

        Returns:
            Dictionary with total_loss, recon_loss, kl_loss
        """
        # Your code here
        pass

    def sample(self, num_samples: int) -> np.ndarray:
        """
        Generate samples by decoding random latent vectors.
        """
        # Your code here
        pass
`,testCases:[{id:"1",description:"Reconstruction shape",input:'VAE(784, 256, 20).forward(np.random.randn(4, 784))["x_recon"].shape',expected:"(4, 784)",hidden:!1},{id:"2",description:"KL divergence non-negative",input:'(lambda: (vae := VAE(784, 256, 20), x := np.random.randn(4, 784), out := vae.forward(x), loss := vae.compute_loss(x, out["x_recon"], out["mu"], out["log_var"]), bool(loss["kl_loss"] >= 0))[-1])()',expected:"True",hidden:!1},{id:"3",description:"Latent space shape",input:'VAE(784, 256, 20).forward(np.random.randn(4, 784))["z"].shape',expected:"(4, 20)",hidden:!0},{id:"4",description:"Sample shape matches input dim",input:"VAE(784, 256, 20).sample(3).shape",expected:"(3, 784)",hidden:!0},{id:"5",description:"Total loss equals recon + KL",input:'(lambda: (vae := VAE(784, 256, 20), x := np.random.randn(4, 784), out := vae.forward(x), loss := vae.compute_loss(x, out["x_recon"], out["mu"], out["log_var"]), bool(np.allclose(loss["total_loss"], loss["recon_loss"] + loss["kl_loss"])))[-1])()',expected:"True",hidden:!0}],hints:["Encoder: h = relu(x @ W + b), then mu = h @ W_mu, logvar = h @ W_logvar","Reparameterize: std = exp(0.5 * log_var), z = mu + std * epsilon","KL = -0.5 * mean(1 + log_var - mu² - exp(log_var))","Reconstruction loss: MSE or BCE"],solution:`import numpy as np

class VAE:
    def __init__(self, input_dim: int, hidden_dim: int, latent_dim: int):
        np.random.seed(42)

        self.W_enc = np.random.randn(input_dim, hidden_dim) * 0.01
        self.b_enc = np.zeros(hidden_dim)
        self.W_mu = np.random.randn(hidden_dim, latent_dim) * 0.01
        self.b_mu = np.zeros(latent_dim)
        self.W_logvar = np.random.randn(hidden_dim, latent_dim) * 0.01
        self.b_logvar = np.zeros(latent_dim)
        self.W_dec1 = np.random.randn(latent_dim, hidden_dim) * 0.01
        self.b_dec1 = np.zeros(hidden_dim)
        self.W_dec2 = np.random.randn(hidden_dim, input_dim) * 0.01
        self.b_dec2 = np.zeros(input_dim)
        self.latent_dim = latent_dim

    def encode(self, x: np.ndarray) -> tuple:
        h = np.maximum(0, x @ self.W_enc + self.b_enc)
        mu = h @ self.W_mu + self.b_mu
        log_var = h @ self.W_logvar + self.b_logvar
        return mu, log_var

    def reparameterize(self, mu: np.ndarray, log_var: np.ndarray) -> np.ndarray:
        std = np.exp(0.5 * log_var)
        eps = np.random.randn(*mu.shape)
        return mu + std * eps

    def decode(self, z: np.ndarray) -> np.ndarray:
        h = np.maximum(0, z @ self.W_dec1 + self.b_dec1)
        x_recon = 1 / (1 + np.exp(-(h @ self.W_dec2 + self.b_dec2)))  # Sigmoid
        return x_recon

    def forward(self, x: np.ndarray) -> dict:
        mu, log_var = self.encode(x)
        z = self.reparameterize(mu, log_var)
        x_recon = self.decode(z)
        return {'mu': mu, 'log_var': log_var, 'z': z, 'x_recon': x_recon}

    def compute_loss(self, x: np.ndarray, x_recon: np.ndarray,
                     mu: np.ndarray, log_var: np.ndarray) -> dict:
        # Reconstruction loss (MSE)
        recon_loss = np.mean((x - x_recon) ** 2)

        # KL divergence
        kl_loss = -0.5 * np.mean(1 + log_var - mu**2 - np.exp(log_var))

        total_loss = recon_loss + kl_loss

        return {'total_loss': total_loss, 'recon_loss': recon_loss, 'kl_loss': kl_loss}

    def sample(self, num_samples: int) -> np.ndarray:
        z = np.random.randn(num_samples, self.latent_dim)
        return self.decode(z)
`},{id:"e2e-vqvae",title:"E2E: Vector Quantized VAE",section:"e2e-implementations",difficulty:"hard",description:`
## End-to-End VQ-VAE

Implement a complete VQ-VAE (Vector Quantized Variational Autoencoder) with encoder, vector quantization, and decoder.

### Architecture
\`\`\`
Encoder: x → z_e (continuous latents)
           ↓
Vector Quantization: z_e → z_q (discrete latents from codebook)
           ↓
Decoder: z_q → x_reconstructed
\`\`\`

### Key Difference from VAE
- VAE: Continuous latent space with KL regularization
- VQ-VAE: Discrete latent space using learned codebook

### Vector Quantization
1. Encoder outputs continuous vectors z_e
2. Find nearest codebook entry for each spatial position
3. Replace z_e with quantized z_q from codebook
4. Use straight-through estimator for gradients

### Loss Function
\`\`\`
L = L_reconstruction + L_codebook + β * L_commitment

L_reconstruction = ||x - x_hat||²
L_codebook = ||sg[z_e] - e||²  (moves codebook toward encoder output)
L_commitment = ||z_e - sg[e]||²  (commits encoder to codebook)
\`\`\`
Where sg[] is stop-gradient.

### Codebook EMA Update (Alternative)
Instead of gradient updates, codebook can be updated with exponential moving average:
\`\`\`
N_i = γ * N_i + (1 - γ) * n_i     (count of assignments)
m_i = γ * m_i + (1 - γ) * sum(z_e assigned to i)
e_i = m_i / N_i
\`\`\`

### Task
Implement encoder, vector quantization layer, decoder, and all loss components.
    `,examples:[{input:"VQVAE(input_dim=784, num_embeddings=512, embedding_dim=64)",output:"Reconstructed images + discrete codes",explanation:"Full VQ-VAE forward pass"}],starterCode:`import numpy as np

class VectorQuantizer:
    def __init__(self, num_embeddings: int, embedding_dim: int):
        """
        Vector Quantization layer.

        Args:
            num_embeddings: Size of codebook (K)
            embedding_dim: Dimension of each embedding
        """
        np.random.seed(42)
        # Initialize codebook with small random values
        self.embedding = np.random.randn(num_embeddings, embedding_dim) * 0.1
        self.num_embeddings = num_embeddings
        self.embedding_dim = embedding_dim

    def quantize(self, z_e: np.ndarray) -> tuple:
        """
        Quantize encoder output to nearest codebook entries.

        Args:
            z_e: Encoder output (batch, height, width, embedding_dim)

        Returns:
            z_q: Quantized vectors (same shape as z_e)
            indices: Codebook indices (batch, height, width)
            distances: Distances to nearest embeddings
        """
        # Your code here
        pass

    def compute_loss(self, z_e: np.ndarray, z_q: np.ndarray, beta: float = 0.25) -> dict:
        """
        Compute VQ losses.

        Args:
            z_e: Encoder output
            z_q: Quantized vectors
            beta: Commitment loss weight

        Returns:
            Dictionary with codebook_loss and commitment_loss
        """
        # Your code here
        pass


class VQVAE:
    def __init__(self, input_channels: int, hidden_dim: int,
                 num_embeddings: int, embedding_dim: int):
        """
        Initialize VQ-VAE.

        Args:
            input_channels: Number of input channels
            hidden_dim: Hidden layer dimension
            num_embeddings: Codebook size
            embedding_dim: Embedding dimension
        """
        np.random.seed(42)

        # Encoder: conv layers to get spatial feature maps
        self.enc_conv1_w = np.random.randn(hidden_dim, input_channels, 4, 4) * 0.1
        self.enc_conv1_b = np.zeros(hidden_dim)
        self.enc_conv2_w = np.random.randn(embedding_dim, hidden_dim, 4, 4) * 0.1
        self.enc_conv2_b = np.zeros(embedding_dim)

        # Vector Quantizer
        self.vq = VectorQuantizer(num_embeddings, embedding_dim)

        # Decoder: transposed conv to reconstruct
        self.dec_conv1_w = np.random.randn(hidden_dim, embedding_dim, 4, 4) * 0.1
        self.dec_conv1_b = np.zeros(hidden_dim)
        self.dec_conv2_w = np.random.randn(input_channels, hidden_dim, 4, 4) * 0.1
        self.dec_conv2_b = np.zeros(input_channels)

        self.embedding_dim = embedding_dim

    def encode(self, x: np.ndarray) -> np.ndarray:
        """
        Encode input to continuous latent representation.

        Args:
            x: Input (batch, channels, height, width)

        Returns:
            z_e: Encoder output (batch, height', width', embedding_dim)
        """
        # Your code here (simplified: use strided conv or just reshape for demo)
        pass

    def decode(self, z_q: np.ndarray) -> np.ndarray:
        """
        Decode quantized latents to reconstruction.

        Args:
            z_q: Quantized vectors (batch, height, width, embedding_dim)

        Returns:
            x_recon: Reconstructed input
        """
        # Your code here
        pass

    def forward(self, x: np.ndarray) -> dict:
        """
        Full forward pass.

        Returns:
            Dictionary with z_e, z_q, indices, x_recon
        """
        # Your code here
        pass

    def compute_loss(self, x: np.ndarray, x_recon: np.ndarray,
                     z_e: np.ndarray, z_q: np.ndarray, beta: float = 0.25) -> dict:
        """
        Compute total VQ-VAE loss.

        Returns:
            Dictionary with total_loss, recon_loss, vq_loss, commitment_loss
        """
        # Your code here
        pass

    def get_codebook_usage(self, indices: np.ndarray) -> np.ndarray:
        """
        Compute codebook usage statistics.

        Returns:
            usage: Count of each codebook entry used
        """
        # Your code here
        pass
`,testCases:[{id:"1",description:"Quantization shape",input:"(lambda: (vq := VectorQuantizer(512, 64), z_e := np.random.randn(2, 4, 4, 64), out := vq.quantize(z_e), bool(out[0].shape == z_e.shape))[-1])()",expected:"True",hidden:!1},{id:"2",description:"Indices valid range",input:"(lambda: (vq := VectorQuantizer(512, 64), z_e := np.random.randn(2, 4, 4, 64), out := vq.quantize(z_e), bool(np.all(out[1] >= 0) and np.all(out[1] < 512)))[-1])()",expected:"True",hidden:!1},{id:"3",description:"Quantized from codebook",input:"(lambda: (vq := VectorQuantizer(512, 64), z_e := np.random.randn(2, 4, 4, 64), out := vq.quantize(z_e), bool(np.allclose(out[0][0, 0, 0], vq.embedding[out[1][0, 0, 0]])))[-1])()",expected:"True",hidden:!0},{id:"4",description:"Loss values correct",input:'(lambda: (vq := VectorQuantizer(512, 64), z_e := np.random.randn(2, 4, 4, 64), out := vq.quantize(z_e), losses := vq.compute_loss(z_e, out[0]), bool(losses["codebook_loss"] >= 0 and losses["commitment_loss"] >= 0))[-1])()',expected:"True",hidden:!0}],hints:["For quantization: flatten spatial dims, compute distances, find argmin","Distance: ||z - e||² = ||z||² + ||e||² - 2*z·e","Straight-through: z_q = z_e + stop_grad(z_q - z_e)","Codebook loss uses z_e detached, commitment uses z_q detached","For simplified encoder/decoder, use reshape operations"],solution:`import numpy as np

class VectorQuantizer:
    def __init__(self, num_embeddings: int, embedding_dim: int):
        np.random.seed(42)
        self.embedding = np.random.randn(num_embeddings, embedding_dim) * 0.1
        self.num_embeddings = num_embeddings
        self.embedding_dim = embedding_dim

    def quantize(self, z_e: np.ndarray) -> tuple:
        # z_e: (batch, H, W, D)
        batch, H, W, D = z_e.shape

        # Flatten spatial dimensions
        z_flat = z_e.reshape(-1, D)  # (N, D) where N = batch * H * W

        # Compute distances: ||z - e||² = ||z||² + ||e||² - 2*z·e
        z_sq = np.sum(z_flat ** 2, axis=1, keepdims=True)  # (N, 1)
        e_sq = np.sum(self.embedding ** 2, axis=1)          # (K,)
        cross = z_flat @ self.embedding.T                    # (N, K)
        distances = z_sq + e_sq - 2 * cross                  # (N, K)

        # Find nearest embedding
        indices_flat = np.argmin(distances, axis=1)          # (N,)

        # Get quantized vectors
        z_q_flat = self.embedding[indices_flat]              # (N, D)

        # Reshape back
        z_q = z_q_flat.reshape(batch, H, W, D)
        indices = indices_flat.reshape(batch, H, W)
        min_distances = np.min(distances, axis=1).reshape(batch, H, W)

        return z_q, indices, min_distances

    def compute_loss(self, z_e: np.ndarray, z_q: np.ndarray, beta: float = 0.25) -> dict:
        # Codebook loss: ||sg[z_e] - z_q||²
        # In practice, this updates the codebook to move toward encoder output
        codebook_loss = np.mean((z_e - z_q) ** 2)

        # Commitment loss: ||z_e - sg[z_q]||²
        # This commits the encoder output to stay close to codebook
        commitment_loss = beta * np.mean((z_e - z_q) ** 2)

        return {
            'codebook_loss': codebook_loss,
            'commitment_loss': commitment_loss
        }


class VQVAE:
    def __init__(self, input_channels: int, hidden_dim: int,
                 num_embeddings: int, embedding_dim: int):
        np.random.seed(42)

        self.input_channels = input_channels
        self.hidden_dim = hidden_dim
        self.embedding_dim = embedding_dim

        # Simplified: use linear projection instead of conv for demo
        # Encoder projects input to embedding space
        self.enc_w1 = np.random.randn(input_channels * 16, hidden_dim) * 0.1
        self.enc_b1 = np.zeros(hidden_dim)
        self.enc_w2 = np.random.randn(hidden_dim, embedding_dim) * 0.1
        self.enc_b2 = np.zeros(embedding_dim)

        # Vector Quantizer
        self.vq = VectorQuantizer(num_embeddings, embedding_dim)

        # Decoder projects back
        self.dec_w1 = np.random.randn(embedding_dim, hidden_dim) * 0.1
        self.dec_b1 = np.zeros(hidden_dim)
        self.dec_w2 = np.random.randn(hidden_dim, input_channels * 16) * 0.1
        self.dec_b2 = np.zeros(input_channels * 16)

    def encode(self, x: np.ndarray) -> np.ndarray:
        # x: (batch, channels, H, W) - assume H=W=4 for simplicity
        batch = x.shape[0]

        # Flatten spatial dimensions
        x_flat = x.reshape(batch, -1)  # (batch, channels * H * W)

        # Encode
        h = np.maximum(0, x_flat @ self.enc_w1 + self.enc_b1)  # ReLU
        z_e = x_flat @ self.enc_w1[:, :self.embedding_dim] + self.enc_b1[:self.embedding_dim]

        # Reshape to spatial format (batch, 2, 2, embedding_dim)
        z_e = z_e.reshape(batch, 1, 1, self.embedding_dim)

        return z_e

    def decode(self, z_q: np.ndarray) -> np.ndarray:
        batch = z_q.shape[0]

        # Flatten
        z_flat = z_q.reshape(batch, -1)  # (batch, embedding_dim)

        # Decode
        h = np.maximum(0, z_flat @ self.dec_w1 + self.dec_b1)  # ReLU
        x_recon = h @ self.dec_w2 + self.dec_b2

        # Reshape to image format
        x_recon = x_recon.reshape(batch, self.input_channels, 4, 4)

        return x_recon

    def forward(self, x: np.ndarray) -> dict:
        # Encode
        z_e = self.encode(x)

        # Quantize
        z_q, indices, distances = self.vq.quantize(z_e)

        # Straight-through estimator: gradient flows through z_q to z_e
        # z_q_st = z_e + (z_q - z_e).detach()
        # For forward pass, we just use z_q

        # Decode
        x_recon = self.decode(z_q)

        return {
            'z_e': z_e,
            'z_q': z_q,
            'indices': indices,
            'x_recon': x_recon
        }

    def compute_loss(self, x: np.ndarray, x_recon: np.ndarray,
                     z_e: np.ndarray, z_q: np.ndarray, beta: float = 0.25) -> dict:
        # Reconstruction loss
        recon_loss = np.mean((x - x_recon) ** 2)

        # VQ losses
        vq_losses = self.vq.compute_loss(z_e, z_q, beta)

        # Total loss
        total_loss = recon_loss + vq_losses['codebook_loss'] + vq_losses['commitment_loss']

        return {
            'total_loss': total_loss,
            'recon_loss': recon_loss,
            'codebook_loss': vq_losses['codebook_loss'],
            'commitment_loss': vq_losses['commitment_loss']
        }

    def get_codebook_usage(self, indices: np.ndarray) -> np.ndarray:
        usage = np.bincount(indices.flatten(), minlength=self.vq.num_embeddings)
        return usage
`},{id:"e2e-diffusion",title:"E2E: Diffusion Model",section:"e2e-implementations",difficulty:"hard",description:`
## End-to-End Diffusion Model

Implement core components of a diffusion model (DDPM-style).

### Forward Process (Adding Noise)
\`\`\`
x_t = sqrt(α_bar_t) * x_0 + sqrt(1 - α_bar_t) * ε
\`\`\`

### Noise Schedule
\`\`\`
β_t: Linear from β_start to β_end
α_t = 1 - β_t
α_bar_t = cumulative product of α_t
\`\`\`

### Training Objective
\`\`\`
L = ||ε - ε_θ(x_t, t)||²
\`\`\`

Model learns to predict the noise added at timestep t.

### Reverse Process (Sampling)
\`\`\`
x_{t-1} = (1/sqrt(α_t)) * (x_t - (β_t/sqrt(1-α_bar_t)) * ε_θ(x_t, t)) + σ_t * z
\`\`\`

### Task
Implement noise schedule, forward process, and reverse sampling.
    `,examples:[{input:"DiffusionModel(T=1000)",output:"Denoised samples",explanation:"Forward and reverse diffusion"}],starterCode:`import numpy as np

class DiffusionModel:
    def __init__(self, T: int = 1000, beta_start: float = 0.0001, beta_end: float = 0.02):
        """
        Initialize diffusion model.

        Args:
            T: Number of diffusion timesteps
            beta_start: Starting noise level
            beta_end: Ending noise level
        """
        self.T = T

        # Compute noise schedule
        # Your code here
        pass

    def get_noise_schedule(self) -> dict:
        """Return computed noise schedule parameters."""
        # Your code here
        pass

    def forward_diffusion(self, x_0: np.ndarray, t: int) -> tuple:
        """
        Add noise to data at timestep t.

        Args:
            x_0: Original data (batch, ...)
            t: Timestep

        Returns:
            x_t: Noisy data
            noise: The noise that was added
        """
        np.random.seed(42)
        # Your code here
        pass

    def reverse_step(self, x_t: np.ndarray, t: int, predicted_noise: np.ndarray) -> np.ndarray:
        """
        Single reverse diffusion step.

        Args:
            x_t: Noisy data at timestep t
            t: Current timestep
            predicted_noise: Noise predicted by model

        Returns:
            x_{t-1}: Less noisy data
        """
        # Your code here
        pass

    def compute_loss(self, true_noise: np.ndarray, predicted_noise: np.ndarray) -> float:
        """Compute MSE loss between true and predicted noise."""
        # Your code here
        pass

    def sample(self, shape: tuple, noise_predictor) -> np.ndarray:
        """
        Generate samples using reverse diffusion.

        Args:
            shape: Shape of samples to generate
            noise_predictor: Function that predicts noise given (x_t, t)

        Returns:
            Generated samples
        """
        # Your code here
        pass
`,testCases:[{id:"1",description:"Alpha bar decreases",input:'(lambda: (dm := DiffusionModel(1000), sched := dm.get_noise_schedule(), bool(sched["alpha_bars"][-1] < sched["alpha_bars"][0]))[-1])()',expected:"True",hidden:!1},{id:"2",description:"Forward noise shape",input:"(lambda: (dm := DiffusionModel(1000), x_0 := np.random.randn(4, 32), out := dm.forward_diffusion(x_0, 500), bool(out[0].shape == x_0.shape))[-1])()",expected:"True",hidden:!1},{id:"3",description:"Noise schedule length matches T",input:'(lambda: (dm := DiffusionModel(500), sched := dm.get_noise_schedule(), len(sched["betas"]) == 500 and len(sched["alpha_bars"]) == 500)[-1])()',expected:"True",hidden:!0},{id:"4",description:"MSE loss is zero for identical noise",input:"(lambda: (dm := DiffusionModel(100), noise := np.random.randn(4, 16), round(dm.compute_loss(noise, noise), 6))[-1])()",expected:"0.0",hidden:!0},{id:"5",description:"Forward diffusion at t=0 is close to original",input:"(lambda: (dm := DiffusionModel(1000), x_0 := np.ones((2, 8)), out := dm.forward_diffusion(x_0, 0), bool(np.allclose(out[0], x_0, atol=0.5)))[-1])()",expected:"True",hidden:!0}],hints:["betas = np.linspace(beta_start, beta_end, T)","alpha_bars = np.cumprod(1 - betas)","x_t = sqrt(alpha_bar) * x_0 + sqrt(1 - alpha_bar) * noise","Reverse: use mean and add small noise (except at t=0)"],solution:`import numpy as np

class DiffusionModel:
    def __init__(self, T: int = 1000, beta_start: float = 0.0001, beta_end: float = 0.02):
        self.T = T

        # Linear noise schedule
        self.betas = np.linspace(beta_start, beta_end, T)
        self.alphas = 1 - self.betas
        self.alpha_bars = np.cumprod(self.alphas)

        # For reverse process
        self.sqrt_alpha_bars = np.sqrt(self.alpha_bars)
        self.sqrt_one_minus_alpha_bars = np.sqrt(1 - self.alpha_bars)
        self.sqrt_alphas = np.sqrt(self.alphas)

    def get_noise_schedule(self) -> dict:
        return {
            'betas': self.betas,
            'alphas': self.alphas,
            'alpha_bars': self.alpha_bars
        }

    def forward_diffusion(self, x_0: np.ndarray, t: int) -> tuple:
        np.random.seed(42)
        noise = np.random.randn(*x_0.shape)

        sqrt_alpha_bar = self.sqrt_alpha_bars[t]
        sqrt_one_minus_alpha_bar = self.sqrt_one_minus_alpha_bars[t]

        x_t = sqrt_alpha_bar * x_0 + sqrt_one_minus_alpha_bar * noise

        return x_t, noise

    def reverse_step(self, x_t: np.ndarray, t: int, predicted_noise: np.ndarray) -> np.ndarray:
        alpha = self.alphas[t]
        alpha_bar = self.alpha_bars[t]
        beta = self.betas[t]

        # Mean of reverse distribution
        coef1 = 1 / np.sqrt(alpha)
        coef2 = beta / np.sqrt(1 - alpha_bar)
        mean = coef1 * (x_t - coef2 * predicted_noise)

        if t > 0:
            # Add noise (except at final step)
            sigma = np.sqrt(beta)
            noise = np.random.randn(*x_t.shape)
            x_prev = mean + sigma * noise
        else:
            x_prev = mean

        return x_prev

    def compute_loss(self, true_noise: np.ndarray, predicted_noise: np.ndarray) -> float:
        return np.mean((true_noise - predicted_noise) ** 2)

    def sample(self, shape: tuple, noise_predictor) -> np.ndarray:
        # Start from pure noise
        x = np.random.randn(*shape)

        # Reverse diffusion
        for t in reversed(range(self.T)):
            predicted_noise = noise_predictor(x, t)
            x = self.reverse_step(x, t, predicted_noise)

        return x
`},{id:"e2e-cnn",title:"E2E: Convolutional Neural Network",section:"e2e-implementations",difficulty:"hard",description:`
## End-to-End CNN

Implement a complete CNN for image classification.

### Architecture
\`\`\`
Input (batch, channels, height, width)
  ↓
Conv2D(in_channels, 32, kernel=3) + ReLU
  ↓
MaxPool2D(2x2)
  ↓
Conv2D(32, 64, kernel=3) + ReLU
  ↓
MaxPool2D(2x2)
  ↓
Flatten
  ↓
Linear(flattened_size, 128) + ReLU
  ↓
Linear(128, num_classes)
  ↓
Softmax
\`\`\`

### Components
- 2D Convolution (no padding for simplicity)
- Max Pooling
- Flatten
- Fully Connected layers

### Task
Implement conv2d, maxpool, and combine into CNN.
    `,examples:[{input:"CNN on 28x28 grayscale images",output:"Class probabilities",explanation:"Full CNN forward pass"}],starterCode:`import numpy as np

def conv2d(x: np.ndarray, kernel: np.ndarray, bias: np.ndarray) -> np.ndarray:
    """
    2D convolution (no padding, stride=1).

    Args:
        x: Input (batch, in_channels, height, width)
        kernel: Weights (out_channels, in_channels, kH, kW)
        bias: Bias (out_channels,)

    Returns:
        output: (batch, out_channels, out_height, out_width)
    """
    # Your code here
    pass


def maxpool2d(x: np.ndarray, pool_size: int = 2) -> np.ndarray:
    """
    2D max pooling.

    Args:
        x: Input (batch, channels, height, width)
        pool_size: Size of pooling window

    Returns:
        output: Pooled tensor
    """
    # Your code here
    pass


def flatten(x: np.ndarray) -> np.ndarray:
    """Flatten all dimensions except batch."""
    # Your code here
    pass


class CNN:
    def __init__(self, input_shape: tuple, num_classes: int):
        """
        Initialize CNN.

        Args:
            input_shape: (channels, height, width)
            num_classes: Number of output classes
        """
        np.random.seed(42)
        in_channels, H, W = input_shape

        # Conv layer 1: in_channels -> 32
        self.conv1_w = np.random.randn(32, in_channels, 3, 3) * 0.1
        self.conv1_b = np.zeros(32)

        # Conv layer 2: 32 -> 64
        self.conv2_w = np.random.randn(64, 32, 3, 3) * 0.1
        self.conv2_b = np.zeros(64)

        # Calculate flattened size after convolutions and pooling
        # Your code to compute this
        pass

        # Fully connected layers
        # Your code here
        pass

    def forward(self, x: np.ndarray) -> np.ndarray:
        """
        Forward pass through CNN.

        Args:
            x: Input images (batch, channels, height, width)

        Returns:
            logits: (batch, num_classes)
        """
        # Your code here
        pass


def test_cnn():
    """Test CNN with sample data."""
    # Your code here
    pass
`,testCases:[{id:"1",description:"Conv output shape",input:"conv2d(np.random.randn(2, 1, 8, 8), np.random.randn(32, 1, 3, 3), np.zeros(32)).shape",expected:"(2, 32, 6, 6)",hidden:!1},{id:"2",description:"Pool output shape",input:"maxpool2d(np.random.randn(2, 32, 8, 8), pool_size=2).shape",expected:"(2, 32, 4, 4)",hidden:!1},{id:"3",description:"Flatten preserves batch dimension",input:"flatten(np.random.randn(4, 64, 3, 3)).shape",expected:"(4, 576)",hidden:!0},{id:"4",description:"Full CNN forward pass shape",input:"CNN(input_shape=(1, 28, 28), num_classes=10).forward(np.random.randn(2, 1, 28, 28)).shape",expected:"(2, 10)",hidden:!0}],hints:["Conv output size: (input - kernel + 1) for stride=1, no padding","Pool output size: input // pool_size","Use nested loops for convolution (or np.lib.stride_tricks)","Flatten: x.reshape(batch_size, -1)"],solution:`import numpy as np

def conv2d(x: np.ndarray, kernel: np.ndarray, bias: np.ndarray) -> np.ndarray:
    batch, in_ch, H, W = x.shape
    out_ch, _, kH, kW = kernel.shape
    out_H = H - kH + 1
    out_W = W - kW + 1

    output = np.zeros((batch, out_ch, out_H, out_W))

    for b in range(batch):
        for oc in range(out_ch):
            for i in range(out_H):
                for j in range(out_W):
                    receptive_field = x[b, :, i:i+kH, j:j+kW]
                    output[b, oc, i, j] = np.sum(receptive_field * kernel[oc]) + bias[oc]

    return output


def maxpool2d(x: np.ndarray, pool_size: int = 2) -> np.ndarray:
    batch, channels, H, W = x.shape
    out_H = H // pool_size
    out_W = W // pool_size

    output = np.zeros((batch, channels, out_H, out_W))

    for i in range(out_H):
        for j in range(out_W):
            h_start = i * pool_size
            w_start = j * pool_size
            output[:, :, i, j] = np.max(
                x[:, :, h_start:h_start+pool_size, w_start:w_start+pool_size],
                axis=(2, 3)
            )

    return output


def flatten(x: np.ndarray) -> np.ndarray:
    return x.reshape(x.shape[0], -1)


class CNN:
    def __init__(self, input_shape: tuple, num_classes: int):
        np.random.seed(42)
        in_channels, H, W = input_shape

        # Conv layers
        self.conv1_w = np.random.randn(32, in_channels, 3, 3) * 0.1
        self.conv1_b = np.zeros(32)
        self.conv2_w = np.random.randn(64, 32, 3, 3) * 0.1
        self.conv2_b = np.zeros(64)

        # Calculate size after convolutions and pooling
        # After conv1 (3x3): H-2, W-2
        # After pool1 (2x2): (H-2)//2, (W-2)//2
        # After conv2 (3x3): (H-2)//2 - 2, (W-2)//2 - 2
        # After pool2 (2x2): ((H-2)//2 - 2)//2, ((W-2)//2 - 2)//2
        h1 = (H - 2) // 2
        w1 = (W - 2) // 2
        h2 = (h1 - 2) // 2
        w2 = (w1 - 2) // 2
        flat_size = 64 * h2 * w2

        # FC layers
        self.fc1_w = np.random.randn(flat_size, 128) * 0.1
        self.fc1_b = np.zeros(128)
        self.fc2_w = np.random.randn(128, num_classes) * 0.1
        self.fc2_b = np.zeros(num_classes)

    def forward(self, x: np.ndarray) -> np.ndarray:
        # Conv block 1
        x = conv2d(x, self.conv1_w, self.conv1_b)
        x = np.maximum(0, x)  # ReLU
        x = maxpool2d(x)

        # Conv block 2
        x = conv2d(x, self.conv2_w, self.conv2_b)
        x = np.maximum(0, x)  # ReLU
        x = maxpool2d(x)

        # Flatten
        x = flatten(x)

        # FC layers
        x = np.maximum(0, x @ self.fc1_w + self.fc1_b)  # ReLU
        x = x @ self.fc2_w + self.fc2_b  # Logits

        return x


def test_cnn():
    # Test with MNIST-like data
    cnn = CNN(input_shape=(1, 28, 28), num_classes=10)
    x = np.random.randn(4, 1, 28, 28)
    logits = cnn.forward(x)
    print(f"Input shape: {x.shape}")
    print(f"Output shape: {logits.shape}")
    return logits.shape == (4, 10)
`}],g=[{id:"rl-discounted-return",title:"Discounted Return",section:"reinforcement-learning",difficulty:"easy",description:`
## Discounted Return (Cumulative Reward)

Calculate the discounted return (cumulative reward) from a sequence of rewards.

### Formula
\`\`\`
G_t = r_t + γ * r_{t+1} + γ² * r_{t+2} + ... + γ^(T-t) * r_T
    = Σ_{k=0}^{T-t} γ^k * r_{t+k}
\`\`\`

Where:
- \`r_t\`: Reward at timestep t
- \`γ\` (gamma): Discount factor (0 ≤ γ ≤ 1)
- \`T\`: Final timestep

### Why Discount?
- Future rewards are uncertain
- Prefer immediate rewards
- γ = 0: Only care about immediate reward
- γ = 1: All rewards equally important
- Typical values: 0.9 to 0.99

### Function Signature
\`\`\`python
def discounted_return(rewards: np.ndarray, gamma: float) -> float:
\`\`\`

Returns the total discounted return from timestep 0.
    `,examples:[{input:"rewards = [1, 1, 1, 1], gamma = 0.9",output:"3.439",explanation:"1 + 0.9*1 + 0.81*1 + 0.729*1 = 3.439"},{input:"rewards = [0, 0, 0, 10], gamma = 0.5",output:"1.25",explanation:"0 + 0 + 0 + 0.125*10 = 1.25"}],starterCode:`import numpy as np

def discounted_return(rewards: np.ndarray, gamma: float) -> float:
    """
    Calculate the discounted cumulative return.

    Args:
        rewards: Array of rewards [r_0, r_1, ..., r_T]
        gamma: Discount factor (0 <= gamma <= 1)

    Returns:
        Total discounted return G_0
    """
    rewards = np.array(rewards)
    # Your code here
    pass
`,testCases:[{id:"1",description:"Constant rewards",input:"([1, 1, 1, 1], 0.9)",expected:"3.439",hidden:!1},{id:"2",description:"Delayed reward",input:"([0, 0, 0, 10], 0.5)",expected:"1.25",hidden:!1},{id:"3",description:"No discount",input:"([1, 2, 3, 4], 1.0)",expected:"10.0",hidden:!1},{id:"4",description:"Only immediate",input:"([5, 10, 15], 0.0)",expected:"5.0",hidden:!0}],hints:["Create an array of discount factors: [γ⁰, γ¹, γ², ...]","Use np.arange to create exponents, then gamma ** exponents","Multiply rewards by discount factors and sum"],solution:`import numpy as np

def discounted_return(rewards: np.ndarray, gamma: float) -> float:
    """
    Calculate the discounted cumulative return.
    """
    rewards = np.array(rewards)
    T = len(rewards)

    # Create discount factors: [gamma^0, gamma^1, gamma^2, ...]
    discounts = gamma ** np.arange(T)

    # Compute discounted return
    G = np.sum(rewards * discounts)

    return round(G, 3)
`},{id:"rl-epsilon-greedy",title:"Epsilon-Greedy Policy",section:"reinforcement-learning",difficulty:"easy",description:`
## Epsilon-Greedy Policy

Implement the epsilon-greedy action selection policy, which balances exploration and exploitation.

### Algorithm
\`\`\`
With probability ε: choose random action (explore)
With probability 1-ε: choose action with highest Q-value (exploit)
\`\`\`

### Why Epsilon-Greedy?
- **Exploration**: Try new actions to discover better strategies
- **Exploitation**: Use known good actions to maximize reward
- ε typically decays over time (start exploring, then exploit)

### Function Signature
\`\`\`python
def epsilon_greedy(q_values: np.ndarray, epsilon: float,
                   random_value: float) -> int:
\`\`\`

**Note**: We pass \`random_value\` (a number between 0-1) instead of generating it,
so tests are deterministic. In practice, you'd use \`np.random.random()\`.

### Expected Return
- If \`random_value < epsilon\`: return \`random_action\` (passed as floor of random_value * n_actions for testing)
- Else: return \`argmax(q_values)\`
    `,examples:[{input:"q_values = [1.0, 3.0, 2.0], epsilon = 0.1, random_value = 0.5",output:"1",explanation:"0.5 >= 0.1, so exploit: argmax([1,3,2]) = 1"},{input:"q_values = [1.0, 3.0, 2.0], epsilon = 0.9, random_value = 0.5",output:"1",explanation:"0.5 < 0.9, so explore: floor(0.5 * 3) = 1"}],starterCode:`import numpy as np

def epsilon_greedy(q_values: np.ndarray, epsilon: float,
                   random_value: float) -> int:
    """
    Select action using epsilon-greedy policy.

    Args:
        q_values: Q-values for each action [Q(a_0), Q(a_1), ...]
        epsilon: Exploration probability (0 <= epsilon <= 1)
        random_value: Pre-generated random number for deterministic testing

    Returns:
        Selected action index
    """
    q_values = np.array(q_values)
    n_actions = len(q_values)

    # Your code here
    # If random_value < epsilon: explore (return floor(random_value * n_actions))
    # Else: exploit (return argmax of q_values)
    pass
`,testCases:[{id:"1",description:"Exploit (greedy)",input:"([1.0, 3.0, 2.0], 0.1, 0.5)",expected:"1",hidden:!1},{id:"2",description:"Explore",input:"([1.0, 3.0, 2.0], 0.9, 0.5)",expected:"1",hidden:!1},{id:"3",description:"Always exploit (epsilon=0)",input:"([5.0, 2.0, 8.0, 1.0], 0.0, 0.99)",expected:"2",hidden:!1},{id:"4",description:"Explore with low random",input:"([1.0, 2.0, 3.0, 4.0], 0.5, 0.2)",expected:"0",hidden:!0}],hints:["Compare random_value to epsilon to decide explore vs exploit","For exploration, compute floor(random_value * n_actions)","For exploitation, use np.argmax(q_values)"],solution:`import numpy as np

def epsilon_greedy(q_values: np.ndarray, epsilon: float,
                   random_value: float) -> int:
    """
    Select action using epsilon-greedy policy.
    """
    q_values = np.array(q_values)
    n_actions = len(q_values)

    if random_value < epsilon:
        # Explore: random action
        return int(random_value * n_actions)
    else:
        # Exploit: greedy action
        return int(np.argmax(q_values))
`},{id:"rl-bellman-value",title:"Bellman Expectation (State Value)",section:"reinforcement-learning",difficulty:"easy",description:`
## Bellman Expectation Equation for State Value

Compute the value of a state given transition probabilities, rewards, and next-state values.

### Bellman Expectation Equation
\`\`\`
V(s) = Σ_a π(a|s) * Σ_{s'} P(s'|s,a) * [R(s,a,s') + γ * V(s')]
\`\`\`

For a fixed policy, this simplifies to:
\`\`\`
V(s) = Σ_{s'} P(s'|s) * [R(s,s') + γ * V(s')]
\`\`\`

### What It Means
The value of state s equals the expected:
- Immediate reward R
- Plus discounted value of next state V(s')

### Function Signature
\`\`\`python
def bellman_value(transitions: list, gamma: float,
                  next_values: np.ndarray) -> float:
\`\`\`

Where each transition is \`(probability, reward, next_state_index)\`.
    `,examples:[{input:"transitions=[(0.5, 1, 0), (0.5, 2, 1)], gamma=0.9, V=[5, 10]",output:"8.25",explanation:"0.5*(1 + 0.9*5) + 0.5*(2 + 0.9*10) = 0.5*5.5 + 0.5*11 = 8.25"}],starterCode:`import numpy as np

def bellman_value(transitions: list, gamma: float,
                  next_values: np.ndarray) -> float:
    """
    Compute state value using Bellman expectation equation.

    Args:
        transitions: List of (probability, reward, next_state_index) tuples
        gamma: Discount factor
        next_values: Array of values V(s') for each state

    Returns:
        Value V(s) for the current state
    """
    next_values = np.array(next_values)
    # Your code here
    pass
`,testCases:[{id:"1",description:"Two transitions",input:"bellman_value([(0.5, 1, 0), (0.5, 2, 1)], 0.9, [5, 10])",expected:"8.25",hidden:!1},{id:"2",description:"Deterministic transition",input:"bellman_value([(1.0, 5, 0)], 0.9, [10])",expected:"14.0",hidden:!1},{id:"3",description:"Three outcomes",input:"bellman_value([(0.2, 0, 0), (0.5, 1, 1), (0.3, 2, 2)], 0.9, [0, 5, 10])",expected:"6.05",hidden:!0},{id:"4",description:"No discount (gamma=0)",input:"bellman_value([(0.5, 3, 0), (0.5, 7, 1)], 0.0, [100, 200])",expected:"5.0",hidden:!0}],hints:["Loop through each transition (p, r, s_next)","For each: add p * (r + gamma * V[s_next]) to the total","This is the expected value over all possible transitions"],solution:`import numpy as np

def bellman_value(transitions: list, gamma: float,
                  next_values: np.ndarray) -> float:
    """
    Compute state value using Bellman expectation equation.
    """
    next_values = np.array(next_values)

    value = 0.0
    for prob, reward, next_state in transitions:
        # V(s) = Σ P(s'|s) * [R + γ * V(s')]
        value += prob * (reward + gamma * next_values[next_state])

    return round(value, 2)
`},{id:"rl-q-learning-update",title:"Q-Learning Update",section:"reinforcement-learning",difficulty:"medium",description:`
## Q-Learning Update Rule

Implement the Q-learning update rule, the core of this model-free RL algorithm.

### Q-Learning Update
\`\`\`
Q(s, a) ← Q(s, a) + α * [r + γ * max_a' Q(s', a') - Q(s, a)]
\`\`\`

Where:
- \`α\`: Learning rate
- \`r\`: Reward received
- \`γ\`: Discount factor
- \`s'\`: Next state
- \`max_a' Q(s', a')\`: Best Q-value in next state

### Key Properties
- **Off-policy**: Updates use max Q-value, not the action actually taken
- **Model-free**: Doesn't need environment dynamics
- **Converges**: To optimal Q* under certain conditions

### Function Signature
\`\`\`python
def q_learning_update(Q: np.ndarray, state: int, action: int,
                      reward: float, next_state: int,
                      alpha: float, gamma: float) -> np.ndarray:
\`\`\`

Returns the updated Q-table.
    `,examples:[{input:"Q=[[0,0],[0,0]], s=0, a=1, r=1, s'=1, α=0.1, γ=0.9",output:"Q[0,1] = 0.1",explanation:"Q[0,1] += 0.1 * (1 + 0.9*0 - 0) = 0.1"}],starterCode:`import numpy as np

def q_learning_update(Q: np.ndarray, state: int, action: int,
                      reward: float, next_state: int,
                      alpha: float, gamma: float) -> np.ndarray:
    """
    Perform one Q-learning update.

    Args:
        Q: Q-table of shape (n_states, n_actions)
        state: Current state index
        action: Action taken
        reward: Reward received
        next_state: Next state index
        alpha: Learning rate
        gamma: Discount factor

    Returns:
        Updated Q-table
    """
    Q = np.array(Q, dtype=float)
    # Your code here
    pass
`,testCases:[{id:"1",description:"Simple update",input:"([[0, 0], [0, 0]], 0, 1, 1.0, 1, 0.1, 0.9)",expected:"[[0.0, 0.1], [0.0, 0.0]]",hidden:!1},{id:"2",description:"With existing values",input:"([[1, 2], [3, 4]], 0, 0, 5.0, 1, 0.5, 0.9)",expected:"[[4.8, 2.0], [3.0, 4.0]]",hidden:!1},{id:"3",description:"Terminal state (no future)",input:"([[0, 0], [0, 0]], 0, 0, 10.0, 1, 1.0, 0.0)",expected:"[[10.0, 0.0], [0.0, 0.0]]",hidden:!0},{id:"4",description:"Small learning rate with large Q values",input:"([[10, 20], [30, 40]], 1, 1, 0.0, 0, 0.1, 0.9)",expected:"[[10.0, 20.0], [30.0, 37.8]]",hidden:!0}],hints:["Find the maximum Q-value in the next state: np.max(Q[next_state])","Compute TD target: reward + gamma * max_next_Q","Compute TD error: target - Q[state, action]","Update: Q[state, action] += alpha * td_error"],solution:`import numpy as np

def q_learning_update(Q: np.ndarray, state: int, action: int,
                      reward: float, next_state: int,
                      alpha: float, gamma: float) -> np.ndarray:
    """
    Perform one Q-learning update.
    """
    Q = np.array(Q, dtype=float)

    # Best Q-value in next state
    max_next_Q = np.max(Q[next_state])

    # TD target (Bellman optimality target)
    td_target = reward + gamma * max_next_Q

    # TD error
    td_error = td_target - Q[state, action]

    # Update Q-value
    Q[state, action] += alpha * td_error

    return np.round(Q, 1).tolist()
`},{id:"rl-sarsa-update",title:"SARSA Update",section:"reinforcement-learning",difficulty:"medium",description:`
## SARSA Update Rule

Implement SARSA (State-Action-Reward-State-Action), an on-policy TD control algorithm.

### SARSA Update
\`\`\`
Q(s, a) ← Q(s, a) + α * [r + γ * Q(s', a') - Q(s, a)]
\`\`\`

### SARSA vs Q-Learning
| Aspect | SARSA | Q-Learning |
|--------|-------|------------|
| Policy | On-policy | Off-policy |
| Next Q | Q(s', a') actual | max_a' Q(s', a') |
| Safety | More conservative | Can be risky |

### On-Policy Meaning
SARSA uses the **actual next action** a' that will be taken (following the current policy),
while Q-learning uses the **best possible** next action.

### Function Signature
\`\`\`python
def sarsa_update(Q: np.ndarray, state: int, action: int, reward: float,
                 next_state: int, next_action: int,
                 alpha: float, gamma: float) -> np.ndarray:
\`\`\`
    `,examples:[{input:"Q=[[1,2],[3,4]], s=0, a=0, r=5, s'=1, a'=0, α=0.5, γ=0.9",output:"Q[0,0] = 4.35",explanation:"Q[0,0] += 0.5*(5 + 0.9*3 - 1) = 0.5*6.7 = 3.35, so 1+3.35=4.35"}],starterCode:`import numpy as np

def sarsa_update(Q: np.ndarray, state: int, action: int, reward: float,
                 next_state: int, next_action: int,
                 alpha: float, gamma: float) -> np.ndarray:
    """
    Perform one SARSA update.

    Args:
        Q: Q-table of shape (n_states, n_actions)
        state: Current state s
        action: Action taken a
        reward: Reward received r
        next_state: Next state s'
        next_action: Next action a' (will be taken)
        alpha: Learning rate
        gamma: Discount factor

    Returns:
        Updated Q-table
    """
    Q = np.array(Q, dtype=float)
    # Your code here
    pass
`,testCases:[{id:"1",description:"Basic SARSA update",input:"([[1, 2], [3, 4]], 0, 0, 5.0, 1, 0, 0.5, 0.9)",expected:"[[4.35, 2.0], [3.0, 4.0]]",hidden:!1},{id:"2",description:"Different next action",input:"([[1, 2], [3, 4]], 0, 0, 5.0, 1, 1, 0.5, 0.9)",expected:"[[4.8, 2.0], [3.0, 4.0]]",hidden:!1},{id:"3",description:"From zero",input:"([[0, 0], [0, 0]], 0, 1, 1.0, 1, 0, 0.1, 0.9)",expected:"[[0.0, 0.1], [0.0, 0.0]]",hidden:!0},{id:"4",description:"SARSA uses actual next action not max",input:"([[0, 0], [5, 10]], 0, 0, 1.0, 1, 0, 0.5, 0.9)",expected:"[[2.75, 0.0], [5.0, 10.0]]",hidden:!0}],hints:["The key difference from Q-learning: use Q[next_state, next_action] not max","TD target: reward + gamma * Q[next_state, next_action]","TD error: target - Q[state, action]","Update: Q[state, action] += alpha * td_error"],solution:`import numpy as np

def sarsa_update(Q: np.ndarray, state: int, action: int, reward: float,
                 next_state: int, next_action: int,
                 alpha: float, gamma: float) -> np.ndarray:
    """
    Perform one SARSA update.
    """
    Q = np.array(Q, dtype=float)

    # SARSA uses actual next action, not max
    next_Q = Q[next_state, next_action]

    # TD target
    td_target = reward + gamma * next_Q

    # TD error
    td_error = td_target - Q[state, action]

    # Update Q-value
    Q[state, action] += alpha * td_error

    return np.round(Q, 2).tolist()
`},{id:"rl-td0-prediction",title:"TD(0) Value Prediction",section:"reinforcement-learning",difficulty:"medium",description:`
## TD(0) Value Prediction

Implement TD(0), the simplest temporal difference learning algorithm for value estimation.

### TD(0) Update
\`\`\`
V(s) ← V(s) + α * [r + γ * V(s') - V(s)]
\`\`\`

### Key Concepts
- **TD Error (δ)**: \`r + γ * V(s') - V(s)\`
- **Bootstrap**: Uses estimated V(s') rather than waiting for episode end
- **Online**: Updates after each step, not at episode end

### TD vs Monte Carlo
| Aspect | TD(0) | Monte Carlo |
|--------|-------|-------------|
| Update | Every step | End of episode |
| Bias | Some bias | Unbiased |
| Variance | Low variance | High variance |
| Bootstrap | Yes | No |

### Function Signature
\`\`\`python
def td0_update(V: np.ndarray, state: int, reward: float,
               next_state: int, alpha: float, gamma: float,
               done: bool = False) -> np.ndarray:
\`\`\`

If \`done=True\`, the next state is terminal (V(s')=0).
    `,examples:[{input:"V=[0,0,0], s=0, r=1, s'=1, α=0.1, γ=0.9, done=False",output:"V=[0.1, 0, 0]",explanation:"V[0] += 0.1 * (1 + 0.9*0 - 0) = 0.1"}],starterCode:`import numpy as np

def td0_update(V: np.ndarray, state: int, reward: float,
               next_state: int, alpha: float, gamma: float,
               done: bool = False) -> np.ndarray:
    """
    Perform one TD(0) value update.

    Args:
        V: Value function array V(s) for each state
        state: Current state s
        reward: Reward received r
        next_state: Next state s'
        alpha: Learning rate
        gamma: Discount factor
        done: Whether next_state is terminal

    Returns:
        Updated value function
    """
    V = np.array(V, dtype=float)
    # Your code here
    pass
`,testCases:[{id:"1",description:"Non-terminal transition",input:"([0, 0, 0], 0, 1.0, 1, 0.1, 0.9, False)",expected:"[0.1, 0.0, 0.0]",hidden:!1},{id:"2",description:"Terminal state",input:"([0, 0, 0], 0, 10.0, 1, 0.5, 0.9, True)",expected:"[5.0, 0.0, 0.0]",hidden:!1},{id:"3",description:"With existing values",input:"([5, 10, 15], 1, 2.0, 2, 0.1, 0.9, False)",expected:"[5.0, 10.55, 15.0]",hidden:!0},{id:"4",description:"Terminal vs non-terminal difference",input:`(lambda: (
    v1 := td0_update([0.0, 10.0], 0, 1.0, 1, 0.5, 0.9, False),
    v2 := td0_update([0.0, 10.0], 0, 1.0, 1, 0.5, 0.9, True),
    bool(v1[0] > v2[0])
)[-1])()`,expected:"True",hidden:!0}],hints:["If done=True, the next state value is 0 (terminal)","TD target: reward + gamma * V[next_state] (or just reward if done)","TD error: target - V[state]","Update: V[state] += alpha * td_error"],solution:`import numpy as np

def td0_update(V: np.ndarray, state: int, reward: float,
               next_state: int, alpha: float, gamma: float,
               done: bool = False) -> np.ndarray:
    """
    Perform one TD(0) value update.
    """
    V = np.array(V, dtype=float)

    # Next state value (0 if terminal)
    next_value = 0.0 if done else V[next_state]

    # TD target
    td_target = reward + gamma * next_value

    # TD error
    td_error = td_target - V[state]

    # Update value
    V[state] += alpha * td_error

    return np.round(V, 2).tolist()
`},{id:"rl-value-iteration",title:"Value Iteration Step",section:"reinforcement-learning",difficulty:"medium",description:`
## Value Iteration

Implement one step of the value iteration algorithm for solving MDPs.

### Bellman Optimality Update
\`\`\`
V(s) = max_a Σ_{s'} P(s'|s,a) * [R(s,a,s') + γ * V(s')]
\`\`\`

For each state, we find the action that maximizes expected value.

### Algorithm
1. For each state s:
   - For each action a, compute Q(s,a)
   - V(s) = max over all Q(s,a)
2. Repeat until convergence

### Function Signature
\`\`\`python
def value_iteration_step(V: np.ndarray, transitions: dict,
                         gamma: float) -> np.ndarray:
\`\`\`

Where \`transitions[s][a]\` is a list of \`(prob, reward, next_state)\` tuples.
    `,examples:[{input:"V=[0,0], transitions for 2-state MDP, gamma=0.9",output:"Updated V with optimal values",explanation:"Each state updated to max expected value over actions"}],starterCode:`import numpy as np

def value_iteration_step(V: np.ndarray, transitions: dict,
                         gamma: float) -> np.ndarray:
    """
    Perform one step of value iteration.

    Args:
        V: Current value function V(s) for each state
        transitions: Dict where transitions[s][a] = [(prob, reward, next_state), ...]
        gamma: Discount factor

    Returns:
        Updated value function
    """
    V = np.array(V, dtype=float)
    n_states = len(V)
    V_new = np.zeros(n_states)

    # Your code here
    pass
`,testCases:[{id:"1",description:"Simple 2-state MDP",input:"([0.0, 0.0], {0: {0: [(1.0, 1.0, 0)], 1: [(1.0, 5.0, 1)]}, 1: {0: [(1.0, 2.0, 0)], 1: [(1.0, 0.0, 1)]}}, 0.9)",expected:"[5.0, 2.0]",hidden:!1},{id:"2",description:"With existing values",input:"([5.0, 2.0], {0: {0: [(1.0, 1.0, 0)], 1: [(1.0, 5.0, 1)]}, 1: {0: [(1.0, 2.0, 0)], 1: [(1.0, 0.0, 1)]}}, 0.9)",expected:"[6.8, 6.5]",hidden:!1},{id:"3",description:"Single state single action",input:"([0.0], {0: {0: [(1.0, 3.0, 0)]}}, 0.9)",expected:"[3.0]",hidden:!0},{id:"4",description:"No discount (gamma=0)",input:"([10.0, 20.0], {0: {0: [(1.0, 1.0, 0)], 1: [(1.0, 5.0, 1)]}, 1: {0: [(1.0, 2.0, 0)], 1: [(1.0, 0.0, 1)]}}, 0.0)",expected:"[5.0, 2.0]",hidden:!0}],hints:["For each state, compute the value of each action","Action value: sum over transitions of prob * (reward + gamma * V[next])","State value: max over all action values","Use the new values, not the old ones being updated"],solution:`import numpy as np

def value_iteration_step(V: np.ndarray, transitions: dict,
                         gamma: float) -> np.ndarray:
    """
    Perform one step of value iteration.
    """
    V = np.array(V, dtype=float)
    n_states = len(V)
    V_new = np.zeros(n_states)

    for s in range(n_states):
        if s not in transitions:
            continue

        # Compute Q-value for each action
        q_values = []
        for a in transitions[s]:
            q_sa = 0.0
            for prob, reward, next_state in transitions[s][a]:
                q_sa += prob * (reward + gamma * V[next_state])
            q_values.append(q_sa)

        # V(s) = max Q(s, a)
        V_new[s] = max(q_values) if q_values else 0.0

    return np.round(V_new, 1).tolist()
`},{id:"rl-policy-gradient",title:"REINFORCE Policy Gradient",section:"reinforcement-learning",difficulty:"hard",description:`
## REINFORCE (Monte Carlo Policy Gradient)

Implement the REINFORCE algorithm for computing policy gradient updates.

### Policy Gradient Theorem
\`\`\`
∇J(θ) = E[Σ_t ∇log π(a_t|s_t; θ) * G_t]
\`\`\`

### REINFORCE Algorithm
1. Collect episode: (s_0, a_0, r_1, s_1, a_1, r_2, ...)
2. For each timestep t:
   - Compute return G_t (discounted sum of future rewards)
   - Compute gradient: ∇log π(a_t|s_t) * G_t
3. Update policy parameters

### Softmax Policy
\`\`\`
π(a|s) = exp(θ[s,a]) / Σ_a' exp(θ[s,a'])
\`\`\`

### Gradient of Log-Softmax
\`\`\`
∇_θ log π(a|s) = one_hot(a) - π(·|s)
\`\`\`
(1 for action taken, minus probability of each action)

### Function Signature
\`\`\`python
def reinforce_gradient(theta: np.ndarray, episode: list,
                       gamma: float) -> np.ndarray:
\`\`\`

Episode is list of (state, action, reward) tuples.

### Expected Return Format
Returns gradient array of same shape as theta (n_states, n_actions).
    `,examples:[{input:"theta (3x2), episode=[(0,1,1), (1,0,2)], gamma=0.9",output:"Gradient array (3x2)",explanation:"Gradient computed from policy gradient theorem"}],starterCode:`import numpy as np

def softmax(x):
    """Compute softmax probabilities."""
    exp_x = np.exp(x - np.max(x))
    return exp_x / np.sum(exp_x)

def reinforce_gradient(theta: np.ndarray, episode: list,
                       gamma: float) -> np.ndarray:
    """
    Compute REINFORCE policy gradient.

    Args:
        theta: Policy parameters (n_states, n_actions)
        episode: List of (state, action, reward) tuples
        gamma: Discount factor

    Returns:
        Gradient of same shape as theta
    """
    theta = np.array(theta, dtype=float)
    n_states, n_actions = theta.shape
    gradient = np.zeros_like(theta)

    # Your code here
    # 1. Compute returns G_t for each timestep
    # 2. For each (s, a, r), compute gradient contribution
    # 3. Gradient = (one_hot(a) - softmax(theta[s])) * G_t
    pass
`,testCases:[{id:"1",description:"Simple episode",input:"bool(np.allclose(reinforce_gradient(np.zeros((2, 2)), [(0, 1, 1.0), (1, 0, 1.0)], 0.9), [[-0.95, 0.95], [0.5, -0.5]], atol=0.01))",expected:"True",hidden:!1},{id:"2",description:"Single step episode",input:"bool(np.allclose(reinforce_gradient(np.zeros((2, 2)), [(0, 0, 5.0)], 0.9), [[2.5, -2.5], [0.0, 0.0]], atol=0.01))",expected:"True",hidden:!1},{id:"3",description:"Empty episode returns zero gradient",input:"bool(np.allclose(reinforce_gradient(np.zeros((3, 2)), [], 0.9), np.zeros((3, 2))))",expected:"True",hidden:!0},{id:"4",description:"Gradient shape matches theta shape",input:"reinforce_gradient(np.ones((4, 3)), [(0, 1, 2.0), (2, 0, 1.0)], 0.95).shape",expected:"(4, 3)",hidden:!0}],hints:["First compute all returns: G_t = r_t + γ*r_{t+1} + γ²*r_{t+2} + ...","For softmax policy: gradient = one_hot(action) - π(·|state)","Multiply gradient by return G_t and accumulate","Use backward iteration to compute returns efficiently"],solution:`import numpy as np

def softmax(x):
    """Compute softmax probabilities."""
    exp_x = np.exp(x - np.max(x))
    return exp_x / np.sum(exp_x)

def reinforce_gradient(theta: np.ndarray, episode: list,
                       gamma: float) -> np.ndarray:
    """
    Compute REINFORCE policy gradient.
    """
    theta = np.array(theta, dtype=float)
    n_states, n_actions = theta.shape
    gradient = np.zeros_like(theta)

    T = len(episode)
    if T == 0:
        return gradient

    # Compute returns for each timestep (backward)
    returns = np.zeros(T)
    G = 0
    for t in range(T - 1, -1, -1):
        _, _, reward = episode[t]
        G = reward + gamma * G
        returns[t] = G

    # Compute gradient
    for t in range(T):
        state, action, _ = episode[t]
        G_t = returns[t]

        # Policy probabilities for this state
        probs = softmax(theta[state])

        # Gradient of log π(a|s) = one_hot(a) - π(·|s)
        grad_log_pi = -probs.copy()
        grad_log_pi[action] += 1.0

        # Accumulate: ∇log π(a|s) * G_t
        gradient[state] += grad_log_pi * G_t

    return np.round(gradient, 2)
`},{id:"rl-advantage-estimation",title:"Advantage Estimation (GAE)",section:"reinforcement-learning",difficulty:"hard",description:`
## Generalized Advantage Estimation (GAE)

Implement GAE, a crucial technique used in PPO and other policy gradient methods.

### Why Advantage?
The advantage function measures how much better an action is compared to average:
\`\`\`
A(s, a) = Q(s, a) - V(s)
\`\`\`

### GAE Formula
\`\`\`
Â_t = Σ_{l=0}^{T-t} (γλ)^l * δ_{t+l}
\`\`\`

Where δ_t is the TD error:
\`\`\`
δ_t = r_t + γ * V(s_{t+1}) - V(s_t)
\`\`\`

### Lambda (λ) Trade-off
- λ = 0: Uses only one-step TD (low variance, high bias)
- λ = 1: Uses full Monte Carlo return (high variance, low bias)
- Typical: λ = 0.95

### Function Signature
\`\`\`python
def compute_gae(rewards: np.ndarray, values: np.ndarray,
                gamma: float, lam: float) -> np.ndarray:
\`\`\`

Where values has length T+1 (includes V(s_T+1), use 0 if terminal).
    `,examples:[{input:"rewards=[1,1,1], values=[0,0,0,0], gamma=0.99, lambda=0.95",output:"advantages=[2.9, 1.95, 1.0]",explanation:"GAE combines TD errors with exponential decay"}],starterCode:`import numpy as np

def compute_gae(rewards: np.ndarray, values: np.ndarray,
                gamma: float, lam: float) -> np.ndarray:
    """
    Compute Generalized Advantage Estimation.

    Args:
        rewards: Rewards r_0, r_1, ..., r_{T-1} (length T)
        values: Values V(s_0), V(s_1), ..., V(s_T) (length T+1)
                Last value is V(s_T) or 0 if terminal
        gamma: Discount factor
        lam: GAE lambda parameter

    Returns:
        Advantages Â_0, Â_1, ..., Â_{T-1} (length T)
    """
    rewards = np.array(rewards, dtype=float)
    values = np.array(values, dtype=float)
    T = len(rewards)
    advantages = np.zeros(T)

    # Your code here
    pass
`,testCases:[{id:"1",description:"Zero values baseline",input:"bool(np.allclose(compute_gae([1, 1, 1], [0, 0, 0, 0], 0.99, 0.95), [2.9, 1.95, 1.0], atol=0.1))",expected:"True",hidden:!1},{id:"2",description:"With value estimates",input:"bool(np.allclose(compute_gae([1, 2, 3], [1, 2, 3, 0], 0.9, 0.9), [3.99, 2.7, 0.0], atol=0.1))",expected:"True",hidden:!1},{id:"3",description:"Single step",input:"bool(np.allclose(compute_gae([5], [1, 0], 0.99, 0.95), [4.0], atol=0.01))",expected:"True",hidden:!0},{id:"4",description:"Lambda=0 gives one-step TD errors",input:`(lambda: (
    adv := compute_gae([1, 2, 3], [0, 0, 0, 0], 0.9, 0.0),
    bool(np.allclose(adv, [1.0, 2.0, 3.0], atol=0.01))
)[-1])()`,expected:"True",hidden:!0}],hints:["Compute TD errors first: δ_t = r_t + γ*V(s_{t+1}) - V(s_t)","Work backwards from the last timestep","GAE formula: Â_t = δ_t + γλ*Â_{t+1}","At the last timestep: Â_{T-1} = δ_{T-1}"],solution:`import numpy as np

def compute_gae(rewards: np.ndarray, values: np.ndarray,
                gamma: float, lam: float) -> np.ndarray:
    """
    Compute Generalized Advantage Estimation.
    """
    rewards = np.array(rewards, dtype=float)
    values = np.array(values, dtype=float)
    T = len(rewards)
    advantages = np.zeros(T)

    # Compute advantages backwards
    gae = 0.0
    for t in range(T - 1, -1, -1):
        # TD error: δ_t = r_t + γ*V(s_{t+1}) - V(s_t)
        delta = rewards[t] + gamma * values[t + 1] - values[t]

        # GAE: Â_t = δ_t + γλ*Â_{t+1}
        gae = delta + gamma * lam * gae
        advantages[t] = gae

    return np.round(advantages, 2)
`},{id:"rl-ppo-clip",title:"PPO Clipped Objective",section:"reinforcement-learning",difficulty:"hard",description:`
## PPO Clipped Objective

Implement the clipped surrogate objective used in Proximal Policy Optimization (PPO).

### PPO Objective
\`\`\`
L^{CLIP}(θ) = E[min(r_t(θ) * A_t, clip(r_t(θ), 1-ε, 1+ε) * A_t)]
\`\`\`

Where:
- r_t(θ) = π_θ(a|s) / π_θ_old(a|s) is the probability ratio
- A_t is the advantage estimate
- ε is the clipping parameter (typically 0.2)

### Why Clipping?
- Prevents too large policy updates
- Keeps new policy "close" to old policy
- More stable training than vanilla policy gradient

### Key Insight
- If A > 0 (good action): clip ratio to ≤ 1+ε
- If A < 0 (bad action): clip ratio to ≥ 1-ε

### Function Signature
\`\`\`python
def ppo_clip_objective(old_probs: np.ndarray, new_probs: np.ndarray,
                       advantages: np.ndarray, epsilon: float) -> float:
\`\`\`
    `,examples:[{input:"old_probs=[0.5], new_probs=[0.6], advantages=[1.0], epsilon=0.2",output:"1.0",explanation:"Ratio=1.2, clipped to 1.2, advantage positive: min(1.2, 1.2)*1=1.2, but capped at 1.0 example"}],starterCode:`import numpy as np

def ppo_clip_objective(old_probs: np.ndarray, new_probs: np.ndarray,
                       advantages: np.ndarray, epsilon: float) -> float:
    """
    Compute PPO clipped surrogate objective.

    Args:
        old_probs: π_old(a|s) probabilities for taken actions
        new_probs: π_new(a|s) probabilities for taken actions
        advantages: Advantage estimates A_t
        epsilon: Clipping parameter (e.g., 0.2)

    Returns:
        PPO clipped objective (scalar, should be maximized)
    """
    old_probs = np.array(old_probs, dtype=float)
    new_probs = np.array(new_probs, dtype=float)
    advantages = np.array(advantages, dtype=float)

    # Your code here
    pass
`,testCases:[{id:"1",description:"No clipping needed",input:"([0.5, 0.5], [0.5, 0.5], [1.0, -1.0], 0.2)",expected:"0.0",hidden:!1},{id:"2",description:"Positive advantage, ratio > 1",input:"([0.5], [0.7], [1.0], 0.2)",expected:"1.2",hidden:!1},{id:"3",description:"Negative advantage, ratio > 1",input:"([0.5], [0.7], [-1.0], 0.2)",expected:"-1.4",hidden:!1},{id:"4",description:"Clipping in action",input:"([0.3], [0.6], [2.0], 0.2)",expected:"2.4",hidden:!0}],hints:["Compute probability ratios: r = new_probs / old_probs","Compute clipped ratios: clip(r, 1-epsilon, 1+epsilon)","Unclipped term: r * advantages","Clipped term: clipped_r * advantages","Take element-wise minimum, then mean"],solution:`import numpy as np

def ppo_clip_objective(old_probs: np.ndarray, new_probs: np.ndarray,
                       advantages: np.ndarray, epsilon: float) -> float:
    """
    Compute PPO clipped surrogate objective.
    """
    old_probs = np.array(old_probs, dtype=float)
    new_probs = np.array(new_probs, dtype=float)
    advantages = np.array(advantages, dtype=float)

    # Probability ratios
    ratios = new_probs / (old_probs + 1e-8)

    # Clipped ratios
    clipped_ratios = np.clip(ratios, 1 - epsilon, 1 + epsilon)

    # Surrogate objectives
    surr1 = ratios * advantages
    surr2 = clipped_ratios * advantages

    # PPO objective: min of clipped and unclipped
    objective = np.mean(np.minimum(surr1, surr2))

    return round(objective, 2)
`},{id:"rl-n-step-return",title:"N-Step Return",section:"reinforcement-learning",difficulty:"medium",description:`
## N-Step Return

Implement n-step returns, which interpolate between TD(0) and Monte Carlo.

### N-Step Return Formula
\`\`\`
G_t^{(n)} = r_t + γ*r_{t+1} + ... + γ^{n-1}*r_{t+n-1} + γ^n * V(s_{t+n})
\`\`\`

### Trade-offs
| n | Method | Bias | Variance |
|---|--------|------|----------|
| 1 | TD(0) | High | Low |
| n | n-step | Medium | Medium |
| ∞ | MC | None | High |

### Function Signature
\`\`\`python
def n_step_return(rewards: np.ndarray, values: np.ndarray,
                  t: int, n: int, gamma: float) -> float:
\`\`\`

Compute n-step return starting from timestep t.
    `,examples:[{input:"rewards=[1,2,3,4], values=[0,0,0,0,10], t=0, n=2, gamma=0.9",output:"2.8",explanation:"G_0^(2) = 1 + 0.9*2 + 0.81*0 = 2.8"}],starterCode:`import numpy as np

def n_step_return(rewards: np.ndarray, values: np.ndarray,
                  t: int, n: int, gamma: float) -> float:
    """
    Compute n-step return from timestep t.

    Args:
        rewards: All rewards [r_0, r_1, ..., r_{T-1}]
        values: All values [V(s_0), ..., V(s_T)]
        t: Starting timestep
        n: Number of steps
        gamma: Discount factor

    Returns:
        N-step return G_t^(n)
    """
    rewards = np.array(rewards, dtype=float)
    values = np.array(values, dtype=float)
    T = len(rewards)

    # Your code here
    pass
`,testCases:[{id:"1",description:"2-step return",input:"([1, 2, 3, 4], [0, 0, 0, 0, 10], 0, 2, 0.9)",expected:"2.8",hidden:!1},{id:"2",description:"3-step return with bootstrap",input:"([1, 1, 1, 1], [0, 0, 0, 5, 0], 0, 3, 0.9)",expected:"6.36",hidden:!1},{id:"3",description:"1-step (TD) return",input:"([5, 2, 3], [1, 10, 5, 0], 0, 1, 0.9)",expected:"14.0",hidden:!0},{id:"4",description:"N larger than remaining steps",input:"([1, 1], [0, 0, 0], 0, 10, 0.9)",expected:"1.9",hidden:!0}],hints:["Sum discounted rewards from t to min(t+n-1, T-1)","Bootstrap with V(s_{t+n}) if t+n <= T","Handle boundary: if t+n > T, just sum remaining rewards","Discounts: γ^0, γ^1, ..., γ^{n-1} for rewards, γ^n for value"],solution:`import numpy as np

def n_step_return(rewards: np.ndarray, values: np.ndarray,
                  t: int, n: int, gamma: float) -> float:
    """
    Compute n-step return from timestep t.
    """
    rewards = np.array(rewards, dtype=float)
    values = np.array(values, dtype=float)
    T = len(rewards)

    G = 0.0

    # Sum discounted rewards
    for k in range(n):
        if t + k < T:
            G += (gamma ** k) * rewards[t + k]

    # Bootstrap with value if we haven't reached terminal
    if t + n < len(values):
        G += (gamma ** n) * values[t + n]

    return round(G, 2)
`},{id:"rl-reward-modeling",title:"RLHF Reward Model Loss",section:"reinforcement-learning",difficulty:"hard",description:`
## RLHF Reward Model Loss

Implement the Bradley-Terry preference model loss used to train reward models in RLHF.

### Background
In RLHF (Reinforcement Learning from Human Feedback), we first train a reward model
on human preference data, then use it to fine-tune an LLM.

### Bradley-Terry Model
Given a pair of responses (y_w, y_l) where y_w is preferred (winner):
\`\`\`
P(y_w > y_l) = σ(r(y_w) - r(y_l))
\`\`\`

Where σ is the sigmoid function and r(y) is the reward model output.

### Loss Function
\`\`\`
L = -E[log σ(r(y_w) - r(y_l))]
\`\`\`

We want to maximize the probability that the reward model correctly ranks preferences.

### Function Signature
\`\`\`python
def reward_model_loss(r_chosen: np.ndarray, r_rejected: np.ndarray) -> float:
\`\`\`

Where r_chosen and r_rejected are reward scores for preferred and rejected responses.
    `,examples:[{input:"r_chosen = [2.0, 1.5], r_rejected = [1.0, 0.5]",output:"0.313",explanation:"Low loss when chosen has higher reward than rejected"},{input:"r_chosen = [0.0], r_rejected = [0.0]",output:"0.693",explanation:"Equal rewards = 50% probability = -log(0.5) = 0.693"}],starterCode:`import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def reward_model_loss(r_chosen: np.ndarray, r_rejected: np.ndarray) -> float:
    """
    Compute RLHF reward model loss (Bradley-Terry).

    Args:
        r_chosen: Reward scores for preferred/chosen responses
        r_rejected: Reward scores for rejected responses

    Returns:
        Average negative log-likelihood loss
    """
    r_chosen = np.array(r_chosen, dtype=float)
    r_rejected = np.array(r_rejected, dtype=float)

    # Your code here
    # Loss = -E[log σ(r_chosen - r_rejected)]
    pass
`,testCases:[{id:"1",description:"Clear preference",input:"([2.0, 1.5], [1.0, 0.5])",expected:"0.313",hidden:!1},{id:"2",description:"Equal scores",input:"([0.0], [0.0])",expected:"0.693",hidden:!1},{id:"3",description:"Large margin",input:"([5.0, 4.0, 3.0], [0.0, 0.0, 0.0])",expected:"0.024",hidden:!0},{id:"4",description:"Inverted preferences yield high loss",input:`(lambda: (
    loss_correct := reward_model_loss([3.0], [0.0]),
    loss_wrong := reward_model_loss([0.0], [3.0]),
    bool(loss_wrong > loss_correct)
)[-1])()`,expected:"True",hidden:!0}],hints:["Compute the difference: r_chosen - r_rejected","Apply sigmoid to get probability","Take log of probability","Return negative mean (loss to minimize)"],solution:`import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def reward_model_loss(r_chosen: np.ndarray, r_rejected: np.ndarray) -> float:
    """
    Compute RLHF reward model loss (Bradley-Terry).
    """
    r_chosen = np.array(r_chosen, dtype=float)
    r_rejected = np.array(r_rejected, dtype=float)

    # Probability of correctly ranking: σ(r_chosen - r_rejected)
    logits = r_chosen - r_rejected
    probs = sigmoid(logits)

    # Negative log-likelihood
    loss = -np.mean(np.log(probs + 1e-10))

    return round(loss, 3)
`},{id:"rl-dpo-loss",title:"Direct Preference Optimization (DPO)",section:"reinforcement-learning",difficulty:"hard",description:`
## Direct Preference Optimization (DPO) Loss

Implement the DPO loss function, a simpler alternative to RLHF that doesn't require a separate reward model.

### Background
DPO directly optimizes the LLM policy using preference data, bypassing the reward modeling step.

### DPO Loss
\`\`\`
L_DPO = -E[log σ(β * (log π_θ(y_w|x) - log π_ref(y_w|x)
                    - log π_θ(y_l|x) + log π_ref(y_l|x)))]
\`\`\`

Simplified:
\`\`\`
L_DPO = -E[log σ(β * (Δ_w - Δ_l))]
\`\`\`
Where Δ = log π_θ(y|x) - log π_ref(y|x) (log-ratio of policy to reference)

### Parameters
- β: Temperature parameter (typically 0.1 to 0.5)
- π_θ: Policy being trained
- π_ref: Reference policy (frozen)
- y_w: Preferred (winner) response
- y_l: Rejected (loser) response

### Function Signature
\`\`\`python
def dpo_loss(logp_chosen: np.ndarray, logp_rejected: np.ndarray,
             ref_logp_chosen: np.ndarray, ref_logp_rejected: np.ndarray,
             beta: float) -> float:
\`\`\`
    `,examples:[{input:"logp_chosen=[-1], logp_rejected=[-2], ref_logp_chosen=[-1.5], ref_logp_rejected=[-1.5], beta=0.1",output:"0.643",explanation:"Policy prefers chosen over reference"}],starterCode:`import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def dpo_loss(logp_chosen: np.ndarray, logp_rejected: np.ndarray,
             ref_logp_chosen: np.ndarray, ref_logp_rejected: np.ndarray,
             beta: float) -> float:
    """
    Compute Direct Preference Optimization (DPO) loss.

    Args:
        logp_chosen: Log prob of chosen response under policy π_θ
        logp_rejected: Log prob of rejected response under policy π_θ
        ref_logp_chosen: Log prob of chosen under reference π_ref
        ref_logp_rejected: Log prob of rejected under reference π_ref
        beta: Temperature parameter

    Returns:
        DPO loss
    """
    logp_chosen = np.array(logp_chosen, dtype=float)
    logp_rejected = np.array(logp_rejected, dtype=float)
    ref_logp_chosen = np.array(ref_logp_chosen, dtype=float)
    ref_logp_rejected = np.array(ref_logp_rejected, dtype=float)

    # Your code here
    pass
`,testCases:[{id:"1",description:"Policy prefers chosen",input:"([-1.0], [-2.0], [-1.5], [-1.5], 0.1)",expected:"0.644",hidden:!1},{id:"2",description:"Equal preferences",input:"([-1.0, -1.0], [-1.0, -1.0], [-1.0, -1.0], [-1.0, -1.0], 0.5)",expected:"0.693",hidden:!1},{id:"3",description:"Strong preference signal",input:"([0.0], [-5.0], [-2.0], [-3.0], 0.1)",expected:"0.513",hidden:!0},{id:"4",description:"Higher beta amplifies preference signal",input:`(lambda: (
    loss_low := dpo_loss([-1.0], [-2.0], [-1.5], [-1.5], 0.1),
    loss_high := dpo_loss([-1.0], [-2.0], [-1.5], [-1.5], 1.0),
    bool(loss_high < loss_low)
)[-1])()`,expected:"True",hidden:!0}],hints:["Compute log-ratios: Δ_w = logp_chosen - ref_logp_chosen","Compute log-ratios: Δ_l = logp_rejected - ref_logp_rejected","DPO logits: β * (Δ_w - Δ_l)","Loss: -mean(log(sigmoid(logits)))"],solution:`import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def dpo_loss(logp_chosen: np.ndarray, logp_rejected: np.ndarray,
             ref_logp_chosen: np.ndarray, ref_logp_rejected: np.ndarray,
             beta: float) -> float:
    """
    Compute Direct Preference Optimization (DPO) loss.
    """
    logp_chosen = np.array(logp_chosen, dtype=float)
    logp_rejected = np.array(logp_rejected, dtype=float)
    ref_logp_chosen = np.array(ref_logp_chosen, dtype=float)
    ref_logp_rejected = np.array(ref_logp_rejected, dtype=float)

    # Log-ratios (policy vs reference)
    chosen_logratios = logp_chosen - ref_logp_chosen
    rejected_logratios = logp_rejected - ref_logp_rejected

    # DPO logits
    logits = beta * (chosen_logratios - rejected_logratios)

    # Negative log-sigmoid loss
    loss = -np.mean(np.log(sigmoid(logits) + 1e-10))

    return round(loss, 3)
`},{id:"rl-kl-penalty",title:"KL Divergence Penalty (RLHF)",section:"reinforcement-learning",difficulty:"medium",description:`
## KL Divergence Penalty for RLHF

Compute the KL divergence penalty used in RLHF to keep the policy close to the reference model.

### Background
During RLHF fine-tuning, we add a KL penalty to prevent the policy from diverging
too far from the original pretrained model:

\`\`\`
reward_total = reward - β * KL(π_θ || π_ref)
\`\`\`

### KL Divergence (per token)
\`\`\`
KL = E[log π_θ(a|s) - log π_ref(a|s)]
   = E[log(π_θ/π_ref)]
\`\`\`

For a sequence, we typically compute the average KL per token.

### Why KL Penalty?
- Prevents reward hacking
- Maintains model coherence
- Avoids mode collapse
- Keeps outputs in distribution

### Function Signature
\`\`\`python
def kl_penalty(logp_policy: np.ndarray, logp_reference: np.ndarray,
               beta: float) -> float:
\`\`\`

Returns: KL divergence multiplied by β
    `,examples:[{input:"logp_policy = [-1, -2], logp_reference = [-1.5, -2.5], beta = 0.1",output:"0.05",explanation:"KL = mean([0.5, 0.5]) = 0.5, penalty = 0.1 * 0.5 = 0.05"}],starterCode:`import numpy as np

def kl_penalty(logp_policy: np.ndarray, logp_reference: np.ndarray,
               beta: float) -> float:
    """
    Compute KL divergence penalty for RLHF.

    Args:
        logp_policy: Log probs from current policy π_θ
        logp_reference: Log probs from reference policy π_ref
        beta: KL penalty coefficient

    Returns:
        KL penalty = β * mean(KL divergence)
    """
    logp_policy = np.array(logp_policy, dtype=float)
    logp_reference = np.array(logp_reference, dtype=float)

    # Your code here
    pass
`,testCases:[{id:"1",description:"Positive divergence",input:"([-1.0, -2.0], [-1.5, -2.5], 0.1)",expected:"0.05",hidden:!1},{id:"2",description:"No divergence",input:"([-1.0, -1.0], [-1.0, -1.0], 0.1)",expected:"0.0",hidden:!1},{id:"3",description:"Higher beta",input:"([-0.5, -1.0, -1.5], [-1.0, -1.5, -2.0], 0.5)",expected:"0.25",hidden:!0},{id:"4",description:"Policy less likely than reference gives negative KL approx",input:"([-2.0, -3.0], [-1.0, -1.0], 1.0)",expected:"-1.5",hidden:!0}],hints:["KL divergence per token: log(π_θ) - log(π_ref)","Take the mean over all tokens","Multiply by β to get the penalty","KL should be non-negative (though approximation may give small negatives)"],solution:`import numpy as np

def kl_penalty(logp_policy: np.ndarray, logp_reference: np.ndarray,
               beta: float) -> float:
    """
    Compute KL divergence penalty for RLHF.
    """
    logp_policy = np.array(logp_policy, dtype=float)
    logp_reference = np.array(logp_reference, dtype=float)

    # KL divergence: log(π_θ/π_ref) = log(π_θ) - log(π_ref)
    kl_div = logp_policy - logp_reference

    # Mean KL (per token)
    mean_kl = np.mean(kl_div)

    # KL penalty
    penalty = beta * mean_kl

    return round(penalty, 2)
`},{id:"rl-ppo-llm-objective",title:"PPO-RLHF Objective",section:"reinforcement-learning",difficulty:"hard",description:`
## PPO Objective for LLM Fine-tuning (RLHF)

Implement the full PPO-RLHF objective that combines the clipped surrogate, reward, and KL penalty.

### RLHF PPO Objective
\`\`\`
L = E[min(r_t * Â_t, clip(r_t, 1-ε, 1+ε) * Â_t) - β * KL]
\`\`\`

Where:
- r_t = π_θ(a|s) / π_old(a|s) is the probability ratio
- Â_t is the advantage (reward - baseline, typically from reward model)
- ε is the PPO clipping parameter (0.2)
- β is the KL penalty coefficient
- KL = log π_θ - log π_ref

### RLHF Advantage
In RLHF, the advantage is often simplified to:
\`\`\`
Â = R(x, y) - β * KL(π_θ || π_ref)
\`\`\`

### Function Signature
\`\`\`python
def ppo_rlhf_objective(old_logp: np.ndarray, new_logp: np.ndarray,
                       ref_logp: np.ndarray, rewards: np.ndarray,
                       epsilon: float, beta: float) -> dict:
\`\`\`

### Expected Return Format
Return a dictionary with:
- \`'objective'\`: The PPO-RLHF objective value
- \`'policy_loss'\`: Clipped policy loss component
- \`'kl_penalty'\`: KL penalty component
    `,examples:[{input:"old_logp=[-2], new_logp=[-1.8], ref_logp=[-2], rewards=[1.0], ε=0.2, β=0.1",output:"{'objective': ..., 'policy_loss': ..., 'kl_penalty': ...}",explanation:"Combined objective with reward and KL penalty"}],starterCode:`import numpy as np

def ppo_rlhf_objective(old_logp: np.ndarray, new_logp: np.ndarray,
                       ref_logp: np.ndarray, rewards: np.ndarray,
                       epsilon: float, beta: float) -> dict:
    """
    Compute PPO-RLHF objective for LLM fine-tuning.

    Args:
        old_logp: Log probs from old policy (before update)
        new_logp: Log probs from current policy
        ref_logp: Log probs from reference (pretrained) model
        rewards: Rewards from reward model
        epsilon: PPO clipping parameter
        beta: KL penalty coefficient

    Returns:
        Dictionary with 'objective', 'policy_loss', 'kl_penalty'
    """
    old_logp = np.array(old_logp, dtype=float)
    new_logp = np.array(new_logp, dtype=float)
    ref_logp = np.array(ref_logp, dtype=float)
    rewards = np.array(rewards, dtype=float)

    # Your code here
    pass
`,testCases:[{id:"1",description:"Positive reward, small update",input:"(lambda r: bool(abs(r['objective'] - 1.18) < 0.1 and abs(r['kl_penalty'] - 0.02) < 0.01))(ppo_rlhf_objective([-2.0], [-1.8], [-2.0], [1.0], 0.2, 0.1))",expected:"True",hidden:!1},{id:"2",description:"No policy change",input:"(lambda r: bool(abs(r['objective'] - 1.0) < 0.01 and abs(r['kl_penalty']) < 0.01))(ppo_rlhf_objective([-1.0], [-1.0], [-1.0], [1.0], 0.2, 0.1))",expected:"True",hidden:!1},{id:"3",description:"Result contains all required keys",input:`(lambda: (
    r := ppo_rlhf_objective([-1.0], [-1.0], [-1.0], [1.0], 0.2, 0.1),
    bool('objective' in r and 'policy_loss' in r and 'kl_penalty' in r)
)[-1])()`,expected:"True",hidden:!0},{id:"4",description:"Negative reward scenario",input:"(lambda r: bool(r['objective'] < 0))(ppo_rlhf_objective([-1.0], [-1.0], [-1.0], [-2.0], 0.2, 0.1))",expected:"True",hidden:!0}],hints:["Compute ratio: exp(new_logp - old_logp)","Compute KL: new_logp - ref_logp","Compute advantage: rewards - beta * KL","Apply PPO clipping to ratio * advantage","Final objective: clipped_objective - beta * KL"],solution:`import numpy as np

def ppo_rlhf_objective(old_logp: np.ndarray, new_logp: np.ndarray,
                       ref_logp: np.ndarray, rewards: np.ndarray,
                       epsilon: float, beta: float) -> dict:
    """
    Compute PPO-RLHF objective for LLM fine-tuning.
    """
    old_logp = np.array(old_logp, dtype=float)
    new_logp = np.array(new_logp, dtype=float)
    ref_logp = np.array(ref_logp, dtype=float)
    rewards = np.array(rewards, dtype=float)

    # Probability ratio
    ratio = np.exp(new_logp - old_logp)

    # KL divergence from reference
    kl = new_logp - ref_logp

    # KL penalty
    kl_penalty = beta * np.mean(kl)

    # Advantage: reward minus KL penalty
    advantage = rewards - beta * kl

    # Clipped ratio
    clipped_ratio = np.clip(ratio, 1 - epsilon, 1 + epsilon)

    # PPO surrogate objectives
    surr1 = ratio * advantage
    surr2 = clipped_ratio * advantage

    # Policy loss (take minimum for conservative update)
    policy_loss = np.mean(np.minimum(surr1, surr2))

    # Final objective (maximize policy_loss, minimize kl_penalty)
    objective = policy_loss

    return {
        'objective': round(float(objective), 2),
        'policy_loss': round(float(policy_loss), 2),
        'kl_penalty': round(float(kl_penalty), 2),
    }
`}],y=[{id:"llm-temperature-scaling",title:"Temperature Scaling",section:"llm-generation",difficulty:"easy",description:`
## Temperature Scaling

Implement temperature scaling for LLM logits to control the randomness of generated text.

### How It Works
Before converting logits to probabilities via softmax, divide by a temperature parameter T:

\`\`\`
scaled_logits = logits / T
probs = softmax(scaled_logits)
\`\`\`

### Temperature Effects

| Temperature | Effect |
|-------------|--------|
| T < 1 | Sharper distribution (more confident, less random) |
| T = 1 | Original distribution (unchanged) |
| T > 1 | Flatter distribution (more random, more creative) |

### Softmax Reminder
\`\`\`
softmax(x_i) = exp(x_i) / sum(exp(x_j))
\`\`\`

For numerical stability, subtract the max before exponentiating:
\`\`\`
softmax(x_i) = exp(x_i - max(x)) / sum(exp(x_j - max(x)))
\`\`\`

### Interview Insight
Temperature scaling is the simplest decoding control. Interviewers expect you to know that T→0 approaches greedy decoding (argmax) and T→∞ approaches uniform sampling.
    `,examples:[{input:"logits = [2.0, 1.0, 0.1], temperature = 0.5",output:"[0.8360, 0.1142, 0.0498]",explanation:"Low temperature makes the highest logit dominate"},{input:"logits = [2.0, 1.0, 0.1], temperature = 2.0",output:"[0.4566, 0.2784, 0.2650]",explanation:"High temperature flattens the distribution"}],starterCode:`import numpy as np

def temperature_scaling(logits, temperature=1.0):
    """
    Apply temperature scaling to logits and return probabilities.

    Args:
        logits: Raw logits from the model (vocab_size,)
        temperature: Temperature parameter (T > 0)

    Returns:
        probs: Probability distribution over vocabulary (vocab_size,)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Temperature=1 gives standard softmax",input:`(lambda: (
    logits := np.array([2.0, 1.0, 0.1]),
    probs := temperature_scaling(logits, 1.0),
    bool(np.allclose(probs, np.exp(logits - np.max(logits)) / np.sum(np.exp(logits - np.max(logits))), atol=1e-4))
)[-1])()`,expected:"True",hidden:!1},{id:"2",description:"Low temperature sharpens distribution",input:`(lambda: (
    logits := np.array([2.0, 1.0, 0.1]),
    probs_low := temperature_scaling(logits, 0.5),
    probs_high := temperature_scaling(logits, 2.0),
    bool(np.max(probs_low) > np.max(probs_high))
)[-1])()`,expected:"True",hidden:!1},{id:"3",description:"Probabilities sum to 1",input:"bool(np.allclose(np.sum(temperature_scaling(np.array([1.0, 2.0, 3.0, 4.0]), 0.7)), 1.0))",expected:"True",hidden:!1},{id:"4",description:"Very low temperature approaches argmax",input:`(lambda: (
    probs := temperature_scaling(np.array([3.0, 1.0, 0.5]), 0.01),
    bool(probs[0] > 0.99)
)[-1])()`,expected:"True",hidden:!0}],hints:["Divide logits by temperature before applying softmax","For numerical stability, subtract the max of scaled logits before exp()","softmax(x) = exp(x - max(x)) / sum(exp(x - max(x)))"],solution:`import numpy as np

def temperature_scaling(logits, temperature=1.0):
    logits = np.array(logits, dtype=np.float64)
    # Scale logits by temperature
    scaled = logits / temperature
    # Numerically stable softmax
    shifted = scaled - np.max(scaled)
    exp_vals = np.exp(shifted)
    probs = exp_vals / np.sum(exp_vals)
    return probs
`},{id:"llm-top-k-sampling",title:"Top-k Sampling",section:"llm-generation",difficulty:"easy",description:`
## Top-k Sampling

Implement top-k sampling, which restricts token selection to the k most likely tokens.

### Algorithm
1. Compute probabilities from logits (via softmax)
2. Find the top-k tokens by probability
3. Zero out all other tokens
4. Re-normalize the remaining probabilities
5. Sample from the filtered distribution

### Why Top-k?
- Prevents sampling extremely unlikely tokens
- Reduces incoherent or nonsensical outputs
- Simple to implement and widely used (GPT-2 used k=40)

### Limitation
Fixed k doesn't adapt to the shape of the distribution:
- For a confident prediction (one token has 90% probability), k=50 still allows 49 unlikely tokens
- For a flat distribution, k=50 might cut off reasonable options

This motivates **nucleus (top-p) sampling**.

### Function Signature
\`\`\`python
def top_k_sampling(logits, k, temperature=1.0):
    # Returns: sampled_token_index, filtered_probs
\`\`\`
    `,examples:[{input:"logits = [5.0, 3.0, 2.0, 1.0, 0.1], k = 3",output:"Only top 3 tokens have non-zero probability",explanation:"Tokens at indices 0, 1, 2 are kept; indices 3, 4 are zeroed"}],starterCode:`import numpy as np

def top_k_sampling(logits, k, temperature=1.0):
    """
    Sample from the top-k most likely tokens.

    Args:
        logits: Raw logits (vocab_size,)
        k: Number of top tokens to keep
        temperature: Temperature for scaling (applied before filtering)

    Returns:
        token: Sampled token index (int)
        filtered_probs: Probability distribution after filtering (vocab_size,)
    """
    np.random.seed(42)
    # Your code here
    pass
`,testCases:[{id:"1",description:"Only k tokens have non-zero probability",input:`(lambda: (
    result := top_k_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), 3),
    bool(np.sum(result[1] > 0) == 3)
)[-1])()`,expected:"True",hidden:!1},{id:"2",description:"Filtered probs sum to 1",input:`(lambda: (
    result := top_k_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), 3),
    bool(np.allclose(np.sum(result[1]), 1.0))
)[-1])()`,expected:"True",hidden:!1},{id:"3",description:"Sampled token is within top-k",input:`(lambda: (
    logits := np.array([5.0, 3.0, 2.0, 1.0, 0.1]),
    top_k_indices := np.argsort(logits)[-3:],
    result := top_k_sampling(logits, 3),
    bool(result[0] in top_k_indices)
)[-1])()`,expected:"True",hidden:!1},{id:"4",description:"k=1 always picks the top token",input:`(lambda: (
    result := top_k_sampling(np.array([1.0, 5.0, 2.0, 0.5]), 1),
    bool(result[0] == 1)
)[-1])()`,expected:"True",hidden:!0}],hints:["Apply temperature scaling first: scaled_logits = logits / temperature","Use np.argsort or np.argpartition to find top-k indices","Set non-top-k logits to -inf (or a very large negative number) before softmax","Re-normalize by dividing by the sum of remaining probabilities","Use np.random.choice with the filtered probabilities to sample"],solution:`import numpy as np

def top_k_sampling(logits, k, temperature=1.0):
    np.random.seed(42)
    logits = np.array(logits, dtype=np.float64)

    # Apply temperature
    scaled = logits / temperature

    # Find top-k indices
    top_k_idx = np.argsort(scaled)[-k:]

    # Mask non-top-k to -inf
    filtered_logits = np.full_like(scaled, -np.inf)
    filtered_logits[top_k_idx] = scaled[top_k_idx]

    # Softmax over filtered logits
    shifted = filtered_logits - np.max(filtered_logits)
    exp_vals = np.exp(shifted)
    probs = exp_vals / np.sum(exp_vals)

    # Sample
    token = np.random.choice(len(probs), p=probs)
    return int(token), probs
`},{id:"llm-top-p-sampling",title:"Nucleus (Top-p) Sampling",section:"llm-generation",difficulty:"medium",description:`
## Nucleus (Top-p) Sampling

Implement nucleus sampling (also called top-p sampling), which dynamically selects the smallest set of tokens whose cumulative probability exceeds a threshold p.

### Algorithm
1. Compute probabilities from logits (with temperature)
2. Sort tokens by probability (descending)
3. Compute cumulative sum of sorted probabilities
4. Find the cutoff: smallest set where cumulative probability >= p
5. Zero out tokens below the cutoff
6. Re-normalize and sample

### Why Top-p?
Unlike top-k (fixed number of tokens), top-p **adapts** to the distribution:
- Confident prediction (one token at 95%): only 1-2 tokens kept
- Uncertain prediction (flat distribution): many tokens kept

### Common Values
- GPT-3/4: p = 0.9 or 0.95
- Creative writing: p = 0.95
- Factual tasks: p = 0.7

### Function Signature
\`\`\`python
def top_p_sampling(logits, p, temperature=1.0):
    # Returns: sampled_token_index, filtered_probs
\`\`\`
    `,examples:[{input:"probs = [0.5, 0.3, 0.1, 0.05, 0.05], p = 0.8",output:"Tokens with probs [0.5, 0.3] kept (cumsum = 0.8)",explanation:"Only 2 tokens needed to reach the 80% threshold"}],starterCode:`import numpy as np

def top_p_sampling(logits, p, temperature=1.0):
    """
    Nucleus (top-p) sampling from logits.

    Args:
        logits: Raw logits (vocab_size,)
        p: Cumulative probability threshold (0 < p <= 1)
        temperature: Temperature for scaling

    Returns:
        token: Sampled token index (int)
        filtered_probs: Probability distribution after filtering (vocab_size,)
    """
    np.random.seed(42)
    # Your code here
    pass
`,testCases:[{id:"1",description:"Filtered probs sum to 1",input:`(lambda: (
    result := top_p_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), 0.9),
    bool(np.allclose(np.sum(result[1]), 1.0))
)[-1])()`,expected:"True",hidden:!1},{id:"2",description:"p=1.0 keeps all tokens",input:`(lambda: (
    result := top_p_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), 1.0),
    bool(np.sum(result[1] > 0) == 5)
)[-1])()`,expected:"True",hidden:!1},{id:"3",description:"Small p keeps fewer tokens",input:`(lambda: (
    result_small := top_p_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), 0.5),
    result_large := top_p_sampling(np.array([5.0, 3.0, 2.0, 1.0, 0.1]), 0.95),
    bool(np.sum(result_small[1] > 0) <= np.sum(result_large[1] > 0))
)[-1])()`,expected:"True",hidden:!1},{id:"4",description:"Dominant token with very small p",input:`(lambda: (
    logits := np.array([10.0, 1.0, 0.5, 0.1]),
    result := top_p_sampling(logits, 0.5),
    bool(np.sum(result[1] > 0) <= 2)
)[-1])()`,expected:"True",hidden:!0}],hints:["First compute softmax probabilities (with temperature)","Sort probabilities in descending order, keeping track of original indices","Compute cumulative sum of sorted probabilities","The cutoff is where cumsum first exceeds p — include that token too","Zero out all tokens not in the nucleus set, then re-normalize"],solution:`import numpy as np

def top_p_sampling(logits, p, temperature=1.0):
    np.random.seed(42)
    logits = np.array(logits, dtype=np.float64)

    # Apply temperature and compute softmax
    scaled = logits / temperature
    shifted = scaled - np.max(scaled)
    exp_vals = np.exp(shifted)
    probs = exp_vals / np.sum(exp_vals)

    # Sort descending
    sorted_idx = np.argsort(probs)[::-1]
    sorted_probs = probs[sorted_idx]

    # Cumulative sum
    cumsum = np.cumsum(sorted_probs)

    # Find cutoff: include tokens until cumsum >= p
    cutoff_idx = np.searchsorted(cumsum, p)
    # Include the token that crosses the threshold
    nucleus_indices = sorted_idx[:cutoff_idx + 1]

    # Filter
    filtered_probs = np.zeros_like(probs)
    filtered_probs[nucleus_indices] = probs[nucleus_indices]

    # Re-normalize
    filtered_probs = filtered_probs / np.sum(filtered_probs)

    # Sample
    token = np.random.choice(len(filtered_probs), p=filtered_probs)
    return int(token), filtered_probs
`},{id:"llm-repetition-penalty",title:"Repetition Penalty",section:"llm-generation",difficulty:"easy",description:`
## Repetition Penalty

Implement repetition penalty to discourage the model from generating repeated tokens.

### Algorithm (from Keskar et al., CTRL paper)
For each token that has already been generated:
- If the logit is **positive**, divide by the penalty factor
- If the logit is **negative**, multiply by the penalty factor

\`\`\`
for token_id in generated_tokens:
    if logits[token_id] > 0:
        logits[token_id] = logits[token_id] / penalty
    else:
        logits[token_id] = logits[token_id] * penalty
\`\`\`

### Why This Formula?
- Dividing positive logits makes repeated tokens less likely
- Multiplying negative logits makes them even more negative (also less likely)
- Both operations push repeated tokens toward lower probability

### Common Values
- penalty = 1.0: No effect
- penalty = 1.2: Mild repetition reduction
- penalty = 1.5: Strong repetition reduction
- penalty > 2.0: Can cause incoherent text

### Function Signature
\`\`\`python
def apply_repetition_penalty(logits, generated_tokens, penalty=1.2):
    # Returns: penalized_logits
\`\`\`
    `,examples:[{input:"logits = [2.0, -1.0, 3.0, 0.5], generated = [0, 1], penalty = 1.5",output:"[1.333, -1.5, 3.0, 0.5]",explanation:"Token 0 (positive): 2.0/1.5=1.333; Token 1 (negative): -1.0*1.5=-1.5"}],starterCode:`import numpy as np

def apply_repetition_penalty(logits, generated_tokens, penalty=1.2):
    """
    Apply repetition penalty to logits for previously generated tokens.

    Args:
        logits: Raw logits (vocab_size,)
        generated_tokens: List of previously generated token indices
        penalty: Repetition penalty factor (>= 1.0)

    Returns:
        penalized_logits: Logits with penalty applied (vocab_size,)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Positive logits are divided by penalty",input:`(lambda: (
    result := apply_repetition_penalty(np.array([2.0, 1.0, 3.0]), [0], 1.5),
    bool(np.allclose(result[0], 2.0 / 1.5))
)[-1])()`,expected:"True",hidden:!1},{id:"2",description:"Negative logits are multiplied by penalty",input:`(lambda: (
    result := apply_repetition_penalty(np.array([2.0, -1.0, 3.0]), [1], 1.5),
    bool(np.allclose(result[1], -1.0 * 1.5))
)[-1])()`,expected:"True",hidden:!1},{id:"3",description:"Non-generated tokens unchanged",input:`(lambda: (
    result := apply_repetition_penalty(np.array([2.0, -1.0, 3.0]), [0], 1.5),
    bool(np.allclose(result[1], -1.0) and np.allclose(result[2], 3.0))
)[-1])()`,expected:"True",hidden:!1},{id:"4",description:"Penalty=1.0 has no effect",input:`(lambda: (
    logits := np.array([2.0, -1.0, 3.0, 0.5]),
    result := apply_repetition_penalty(logits, [0, 1, 2], 1.0),
    bool(np.allclose(result, logits))
)[-1])()`,expected:"True",hidden:!0}],hints:["Make a copy of logits to avoid modifying the input","Loop over each token in generated_tokens","Check if the logit at that index is positive or negative","Positive: divide by penalty; Negative: multiply by penalty"],solution:`import numpy as np

def apply_repetition_penalty(logits, generated_tokens, penalty=1.2):
    logits = np.array(logits, dtype=np.float64).copy()

    for token_id in generated_tokens:
        if logits[token_id] > 0:
            logits[token_id] = logits[token_id] / penalty
        else:
            logits[token_id] = logits[token_id] * penalty

    return logits
`},{id:"llm-kv-cache",title:"KV Cache for Efficient Generation",section:"llm-generation",difficulty:"medium",description:`
## KV Cache for Efficient Generation

Implement KV (Key-Value) caching to make autoregressive generation efficient.

### The Problem
In autoregressive generation, at each step we compute:
\`\`\`
Attention(Q, K, V) = softmax(Q @ K.T / sqrt(d_k)) @ V
\`\`\`

Without caching, we recompute K and V for ALL previous tokens at every step. For a sequence of length n, this is O(n²) per token.

### The Solution: KV Cache
Cache the K and V projections from previous steps:
1. **First token**: Compute K, V for the prompt. Cache them.
2. **Each new token**: Compute K_new, V_new for only the new token. Append to cache.
3. **Attention**: Use Q_new (just the new token) with the full cached K, V.

### Implementation
\`\`\`
# Step t: generating token t
K_new = x_t @ W_K          # (1, d_k) - only new token
V_new = x_t @ W_V          # (1, d_v) - only new token
K_cache = concat(K_cache, K_new)  # (t, d_k)
V_cache = concat(V_cache, V_new)  # (t, d_v)

Q_t = x_t @ W_Q            # (1, d_k) - only new token
output = attention(Q_t, K_cache, V_cache)  # attend to all
\`\`\`

### Speedup
- Without cache: O(n²d) total for n tokens
- With cache: O(nd) total for n tokens

### Function Signature
\`\`\`python
def kv_cache_attention(x_new, W_Q, W_K, W_V, k_cache, v_cache):
    # Returns: output, updated_k_cache, updated_v_cache
\`\`\`
    `,examples:[{input:"x_new (1, d_model), cache has 5 previous tokens",output:"output (1, d_v), caches now have 6 entries each",explanation:"New K,V appended; attention computed over all 6 tokens"}],starterCode:`import numpy as np

def kv_cache_attention(x_new, W_Q, W_K, W_V, k_cache=None, v_cache=None):
    """
    Compute attention with KV caching for efficient autoregressive generation.

    Args:
        x_new: New token embedding (1, d_model)
        W_Q: Query weight matrix (d_model, d_k)
        W_K: Key weight matrix (d_model, d_k)
        W_V: Value weight matrix (d_model, d_v)
        k_cache: Cached keys from previous steps (seq_len, d_k) or None
        v_cache: Cached values from previous steps (seq_len, d_v) or None

    Returns:
        output: Attention output for new token (1, d_v)
        k_cache: Updated key cache (seq_len+1, d_k)
        v_cache: Updated value cache (seq_len+1, d_v)
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Output shape is correct",input:`(lambda: (
    d_model := 8,
    d_k := 4,
    d_v := 4,
    x := np.random.randn(1, d_model),
    W_Q := np.random.randn(d_model, d_k) * 0.1,
    W_K := np.random.randn(d_model, d_k) * 0.1,
    W_V := np.random.randn(d_model, d_v) * 0.1,
    result := kv_cache_attention(x, W_Q, W_K, W_V),
    result[0].shape
)[-1])()`,expected:"(1, 4)",hidden:!1},{id:"2",description:"Cache grows by 1 each step",input:`(lambda: (
    d := 4,
    x := np.random.randn(1, d),
    W := np.random.randn(d, d) * 0.1,
    r1 := kv_cache_attention(x, W, W, W),
    r2 := kv_cache_attention(x, W, W, W, r1[1], r1[2]),
    r3 := kv_cache_attention(x, W, W, W, r2[1], r2[2]),
    r3[1].shape[0]
)[-1])()`,expected:"3",hidden:!1},{id:"3",description:"First step creates cache of length 1",input:`(lambda: (
    d := 4,
    x := np.random.randn(1, d),
    W := np.random.randn(d, d) * 0.1,
    result := kv_cache_attention(x, W, W, W),
    result[1].shape[0]
)[-1])()`,expected:"1",hidden:!1},{id:"4",description:"Attention output changes with more context",input:`(lambda: (
    np.random.seed(0),
    d := 4,
    x1 := np.random.randn(1, d),
    x2 := np.random.randn(1, d),
    W := np.random.randn(d, d) * 0.1,
    r1 := kv_cache_attention(x1, W, W, W),
    r2 := kv_cache_attention(x2, W, W, W, r1[1], r1[2]),
    bool(not np.allclose(r1[0], r2[0]))
)[-1])()`,expected:"True",hidden:!0}],hints:["Compute Q, K, V projections for the new token: Q_new = x_new @ W_Q","If cache is None, initialize K_cache and V_cache as the new K, V","Otherwise concatenate: K_cache = np.concatenate([k_cache, K_new], axis=0)","Compute attention: scores = Q_new @ K_cache.T / sqrt(d_k)","Apply softmax to scores, then output = softmax_scores @ V_cache"],solution:`import numpy as np

def kv_cache_attention(x_new, W_Q, W_K, W_V, k_cache=None, v_cache=None):
    # Project new token
    Q_new = x_new @ W_Q  # (1, d_k)
    K_new = x_new @ W_K  # (1, d_k)
    V_new = x_new @ W_V  # (1, d_v)

    # Update cache
    if k_cache is None:
        k_cache = K_new
        v_cache = V_new
    else:
        k_cache = np.concatenate([k_cache, K_new], axis=0)
        v_cache = np.concatenate([v_cache, V_new], axis=0)

    # Compute attention
    d_k = Q_new.shape[-1]
    scores = Q_new @ k_cache.T / np.sqrt(d_k)  # (1, seq_len)

    # Softmax
    scores = scores - np.max(scores, axis=-1, keepdims=True)
    attn_weights = np.exp(scores) / np.sum(np.exp(scores), axis=-1, keepdims=True)

    # Weighted sum of values
    output = attn_weights @ v_cache  # (1, d_v)

    return output, k_cache, v_cache
`},{id:"llm-beam-search",title:"Beam Search Decoding",section:"llm-generation",difficulty:"medium",description:`
## Beam Search Decoding

Implement beam search, which maintains multiple candidate sequences to find higher-probability outputs.

### Algorithm
1. Start with \`beam_width\` copies of the initial sequence
2. At each step, for each beam:
   - Get log-probabilities for next token
   - Consider top-k expansions
3. Keep only the \`beam_width\` sequences with highest total log-probability
4. Stop when all beams have generated the EOS token or hit max length

### Scoring
Use **log probabilities** (not raw probabilities) to avoid underflow:
\`\`\`
score(sequence) = sum of log P(token_i | tokens_<i)
\`\`\`

### Length Normalization
Beam search favors shorter sequences. Normalize by length:
\`\`\`
normalized_score = score / length^alpha
\`\`\`
where alpha is typically 0.6-0.7.

### Simplified Version
For this problem, implement a simplified beam search using a pre-computed log-probability matrix (no actual model). At each step, expand each beam with all possible next tokens, score them, and keep the top \`beam_width\`.

### Function Signature
\`\`\`python
def beam_search(log_probs, beam_width, max_length, eos_token=None):
    # log_probs: (max_length, vocab_size) - pre-computed log probs per step
    # Returns: best_sequence, best_score
\`\`\`
    `,examples:[{input:"log_probs (3 steps, 4 tokens), beam_width=2",output:"best sequence of length 3 with highest total log-prob",explanation:"Explores 2 paths at each step, returns the best one"}],starterCode:`import numpy as np

def beam_search(log_probs, beam_width, max_length=None, eos_token=None):
    """
    Beam search decoding over pre-computed log probabilities.

    Args:
        log_probs: Log probability matrix (num_steps, vocab_size).
                   log_probs[t] gives log probs for step t.
        beam_width: Number of beams to maintain
        max_length: Maximum sequence length (defaults to num_steps)
        eos_token: End-of-sequence token ID (optional)

    Returns:
        best_sequence: List of token indices for the best beam
        best_score: Total log-probability of the best sequence
    """
    # Your code here
    pass
`,testCases:[{id:"1",description:"Greedy path found with beam_width=1",input:`(lambda: (
    log_probs := np.log(np.array([[0.6, 0.3, 0.1], [0.2, 0.7, 0.1], [0.1, 0.3, 0.6]])),
    result := beam_search(log_probs, 1),
    result[0]
)[-1])()`,expected:"[0, 1, 2]",hidden:!1},{id:"2",description:"Beam search score is log-probability sum",input:`(lambda: (
    log_probs := np.log(np.array([[0.6, 0.3, 0.1], [0.2, 0.7, 0.1], [0.1, 0.3, 0.6]])),
    result := beam_search(log_probs, 1),
    round(result[1], 4)
)[-1])()`,expected:"-1.3783",hidden:!1},{id:"3",description:"Wider beam can find better path",input:`(lambda: (
    log_probs := np.log(np.array([[0.4, 0.35, 0.25], [0.1, 0.1, 0.8], [0.9, 0.05, 0.05]])),
    r1 := beam_search(log_probs, 1),
    r2 := beam_search(log_probs, 3),
    bool(r2[1] >= r1[1] - 1e-10)
)[-1])()`,expected:"True",hidden:!0},{id:"4",description:"Sequence length matches steps",input:`(lambda: (
    log_probs := np.log(np.array([[0.5, 0.5], [0.3, 0.7], [0.8, 0.2], [0.4, 0.6]])),
    result := beam_search(log_probs, 2),
    len(result[0])
)[-1])()`,expected:"4",hidden:!1}],hints:["Maintain a list of (sequence, score) tuples for each beam","At each step, expand all beams with all possible next tokens","Score = previous score + log_probs[step][token]","Sort all candidates by score and keep top beam_width","After all steps, return the beam with the highest score"],solution:`import numpy as np

def beam_search(log_probs, beam_width, max_length=None, eos_token=None):
    log_probs = np.array(log_probs, dtype=np.float64)
    num_steps, vocab_size = log_probs.shape
    if max_length is None:
        max_length = num_steps

    # Initialize beams: (sequence, score)
    beams = [([], 0.0)]

    for step in range(min(max_length, num_steps)):
        all_candidates = []

        for seq, score in beams:
            # If this beam ended with EOS, carry it forward
            if eos_token is not None and len(seq) > 0 and seq[-1] == eos_token:
                all_candidates.append((seq, score))
                continue

            # Expand with all possible next tokens
            for token in range(vocab_size):
                new_seq = seq + [token]
                new_score = score + log_probs[step][token]
                all_candidates.append((new_seq, new_score))

        # Keep top beam_width candidates
        all_candidates.sort(key=lambda x: x[1], reverse=True)
        beams = all_candidates[:beam_width]

    # Return best beam
    best_seq, best_score = beams[0]
    return best_seq, round(best_score, 4)
`},{id:"llm-speculative-decoding",title:"Speculative Decoding",section:"llm-generation",difficulty:"hard",description:`
## Speculative Decoding

Implement the core verification step of speculative decoding, a technique that speeds up LLM inference by using a small "draft" model to propose tokens and a large "target" model to verify them.

### Overview
1. **Draft model** (small, fast): Generates K candidate tokens quickly
2. **Target model** (large, slow): Verifies all K tokens in **one forward pass**
3. **Accept/Reject**: Each draft token is accepted with probability min(1, p_target/p_draft)

### Verification Algorithm
For each draft token i = 0, 1, ..., K-1:
\`\`\`
r = uniform(0, 1)
if r < min(1, p_target[i] / p_draft[i]):
    accept token i
else:
    reject token i and all subsequent tokens
    resample from adjusted distribution: max(0, p_target - p_draft)
    break
\`\`\`

If all K tokens accepted, sample one more token from the target model's distribution for position K.

### Why It Works
- Draft model generates tokens cheaply (e.g., 10x faster)
- Target model verifies K tokens at once (parallel, not sequential)
- Accepted tokens are **exactly** distributed as if sampled from the target model
- Expected speedup: ~2-3x for well-matched draft/target pairs

### Function Signature
\`\`\`python
def speculative_decode(draft_probs, target_probs, draft_tokens):
    # Returns: accepted_tokens, num_accepted
\`\`\`

### Important
The output distribution is mathematically guaranteed to match the target model exactly. This is not an approximation.
    `,examples:[{input:"draft_probs=[0.8, 0.7], target_probs=[0.9, 0.3], draft_tokens=[5, 12]",output:"Token 5 likely accepted (0.9/0.8>1), Token 12 may be rejected (0.3/0.7<1)",explanation:"Higher target prob → more likely to accept"}],starterCode:`import numpy as np

def speculative_decode(draft_probs, target_probs, draft_tokens, target_dist_next=None):
    """
    Verify draft tokens using speculative decoding.

    Args:
        draft_probs: Probability the draft model assigned to each drafted token.
                     List of K floats.
        target_probs: Probability the target model assigns to each drafted token.
                      List of K floats.
        draft_tokens: The K token IDs proposed by the draft model.
                      List of K ints.
        target_dist_next: Full target distribution for position after last draft token.
                          Array of shape (vocab_size,) or None.

    Returns:
        accepted_tokens: List of accepted token IDs
        num_accepted: Number of accepted tokens (0 to K)
    """
    np.random.seed(42)
    # Your code here
    pass
`,testCases:[{id:"1",description:"All tokens accepted when target_prob >= draft_prob",input:`(lambda: (
    np.random.seed(0),
    result := speculative_decode([0.3, 0.3, 0.3], [0.9, 0.9, 0.9], [1, 2, 3]),
    bool(result[1] == 3)
)[-1])()`,expected:"True",hidden:!1},{id:"2",description:"Accepted tokens are prefix of draft tokens",input:`(lambda: (
    np.random.seed(42),
    result := speculative_decode([0.5, 0.5, 0.5], [0.6, 0.6, 0.6], [10, 20, 30]),
    bool(result[0] == [10, 20, 30][:result[1]])
)[-1])()`,expected:"True",hidden:!1},{id:"3",description:"Returns between 0 and K accepted tokens",input:`(lambda: (
    np.random.seed(42),
    result := speculative_decode([0.8, 0.8, 0.8], [0.2, 0.2, 0.2], [1, 2, 3]),
    bool(0 <= result[1] <= 3)
)[-1])()`,expected:"True",hidden:!1},{id:"4",description:"Deterministic acceptance when target prob much higher",input:`(lambda: (
    results := [speculative_decode([0.01], [0.99], [42])[1] for _ in range(10)],
    bool(all(r == 1 for r in results))
)[-1])()`,expected:"True",hidden:!0}],hints:["For each draft token, compute acceptance probability: min(1, target_prob / draft_prob)","Draw a uniform random number r. Accept if r < acceptance_probability","On first rejection, stop — do not check subsequent tokens","Return the prefix of draft_tokens up to the last accepted token","The acceptance criterion guarantees the output matches the target distribution"],solution:`import numpy as np

def speculative_decode(draft_probs, target_probs, draft_tokens, target_dist_next=None):
    np.random.seed(42)
    K = len(draft_tokens)
    accepted_tokens = []

    for i in range(K):
        # Acceptance probability
        if draft_probs[i] == 0:
            accept_prob = 1.0 if target_probs[i] == 0 else 1.0
        else:
            accept_prob = min(1.0, target_probs[i] / draft_probs[i])

        # Draw random number
        r = np.random.uniform()

        if r < accept_prob:
            accepted_tokens.append(draft_tokens[i])
        else:
            # Reject this and all subsequent tokens
            break

    return accepted_tokens, len(accepted_tokens)
`}],n=[...a,...r,...i,...s,...o,...d,...p,...l,...u,...c,...m,...h,..._,...f,...g,...y];function x(e){return n.find(t=>t.id===e)}function v(e){return n.filter(t=>t.section===e)}export{v as a,x as g,b as s};
