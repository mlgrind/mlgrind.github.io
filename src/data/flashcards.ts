import { FlashCard } from '../types';

export const flashCards: FlashCard[] = [
  // NumPy Fundamentals
  {
    id: 'fc-numpy-broadcasting',
    sectionId: 'numpy-fundamentals',
    question: 'What are the three rules of NumPy broadcasting?',
    answer: '1. If arrays differ in ndim, the shape of the smaller array is padded with 1s on the left.\n2. Arrays with size 1 along a dimension act as if they had the size of the largest array in that dimension.\n3. If sizes disagree along any dimension and neither is 1, an error is raised.\n\nExample: (3,4) + (4,) broadcasts because (4,) becomes (1,4) then (3,4).',
    tags: ['numpy', 'broadcasting'],
  },
  {
    id: 'fc-numpy-reshape-transpose',
    sectionId: 'numpy-fundamentals',
    question: 'What is the difference between reshape() and transpose()? Can reshape replicate a transpose?',
    answer: 'reshape() changes the shape without changing data order in memory - elements are read in row-major (C) order and placed into the new shape.\n\ntranspose() reorders the axes, changing how elements are accessed. For a (3,4) array, .T gives (4,3) where rows become columns.\n\nreshape(4,3) on a (3,4) array does NOT produce the same result as .T - the elements would be in the wrong positions.',
    tags: ['numpy', 'shapes'],
  },
  {
    id: 'fc-numpy-view-copy',
    sectionId: 'numpy-fundamentals',
    question: 'When does NumPy slicing return a view vs a copy?',
    answer: 'Basic slicing (arr[1:5], arr[:, 2]) returns a **view** - modifications affect the original.\n\nAdvanced indexing (arr[[0,2,4]], arr[arr > 0]) returns a **copy** - modifications do NOT affect the original.\n\nUse .copy() to explicitly create a copy when needed.',
    tags: ['numpy', 'memory'],
  },

  // Python Basics for ML
  {
    id: 'fc-python-vectorization',
    sectionId: 'python-basics',
    question: 'Why is vectorized NumPy code faster than Python loops for ML?',
    answer: 'NumPy operations execute in compiled C/Fortran code, avoiding Python\'s interpreter overhead per element. Key advantages:\n\n1. **No type checking** per element (all elements same dtype)\n2. **Contiguous memory** layout enables CPU cache efficiency\n3. **SIMD instructions** process multiple elements simultaneously\n4. **No GIL contention** for pure NumPy operations\n\nTypically 10-100x faster than equivalent Python loops.',
    tags: ['python', 'performance'],
  },
  {
    id: 'fc-python-matmul',
    sectionId: 'python-basics',
    question: 'What are the requirements for matrix multiplication of A @ B?',
    answer: 'For A with shape (m, k) and B with shape (k, n):\n- The inner dimensions must match (k == k)\n- Result has shape (m, n)\n- Each element result[i,j] = sum(A[i,:] * B[:,j])\n\nFor batched: (b, m, k) @ (b, k, n) -> (b, m, n)',
    tags: ['linear-algebra'],
  },

  // Einstein Summation
  {
    id: 'fc-einsum-rules',
    sectionId: 'einsum',
    question: 'How do you read an einsum expression? What determines which dimensions are summed?',
    answer: 'In `np.einsum("subscripts", operands)`:\n\n- **Repeated indices** on the input side that don\'t appear in the output are **summed over** (contracted)\n- Indices that appear in the output are **kept**\n\nExample: `"ik,kj->ij"` = matrix multiply. k appears in both inputs but not output, so it\'s summed. i and j appear in output, so they\'re kept.',
    tags: ['einsum', 'notation'],
  },
  {
    id: 'fc-einsum-attention',
    sectionId: 'einsum',
    question: 'Write the einsum expression for computing attention scores (Q @ K^T) in multi-head attention.',
    answer: '`np.einsum("bhqd,bhkd->bhqk", Q, K)`\n\nDimensions:\n- b = batch, h = heads, q = query positions, k = key positions, d = head dimension\n- d is summed over (dot product)\n- Result: (batch, heads, query_len, key_len) attention score matrix',
    tags: ['einsum', 'attention'],
  },

  // PyTorch Basics
  {
    id: 'fc-pytorch-autograd',
    sectionId: 'pytorch-basics',
    question: 'How does PyTorch autograd work? What is the computational graph?',
    answer: 'PyTorch builds a **dynamic computational graph** during the forward pass:\n\n1. Each tensor with `requires_grad=True` tracks operations\n2. Operations create nodes in a DAG (directed acyclic graph)\n3. `backward()` traverses the graph in reverse, applying the chain rule\n4. Gradients accumulate in `.grad` attributes\n\nThe graph is rebuilt each forward pass (unlike TensorFlow 1.x static graphs), enabling dynamic control flow.',
    tags: ['pytorch', 'autograd'],
  },
  {
    id: 'fc-pytorch-loss',
    sectionId: 'pytorch-basics',
    question: 'When should you use CrossEntropyLoss vs BCEWithLogitsLoss in PyTorch?',
    answer: '**CrossEntropyLoss**: Multi-class classification (C >= 2 classes)\n- Input: raw logits (N, C), targets as class indices (N,)\n- Applies log_softmax + NLLLoss internally\n\n**BCEWithLogitsLoss**: Binary or multi-label classification\n- Input: raw logits (N,) or (N, C), targets as floats 0/1\n- Applies sigmoid + BCE internally\n\nBoth accept raw logits (not probabilities) for numerical stability.',
    tags: ['pytorch', 'loss'],
  },

  // Data Preprocessing
  {
    id: 'fc-preprocess-normalize',
    sectionId: 'data-preprocessing',
    question: 'What is the difference between normalization and standardization? When do you use each?',
    answer: '**Normalization (min-max)**: Scales to [0, 1]\n- Formula: (x - min) / (max - min)\n- Use when: features have bounded ranges, neural networks with sigmoid/tanh\n\n**Standardization (z-score)**: Scales to mean=0, std=1\n- Formula: (x - mean) / std\n- Use when: features are Gaussian-like, algorithms assume centered data (PCA, SVM, linear regression)\n\nStandardization is more robust to outliers.',
    tags: ['preprocessing', 'scaling'],
  },
  {
    id: 'fc-preprocess-onehot',
    sectionId: 'data-preprocessing',
    question: 'Why is one-hot encoding preferred over label encoding for most ML models?',
    answer: 'Label encoding (cat=0, dog=1, bird=2) implies an **ordinal relationship**: bird > dog > cat. This misleads distance-based and linear models.\n\nOne-hot encoding creates binary columns, treating categories as **independent** dimensions with no ordering.\n\n**Exception**: Tree-based models (Random Forest, XGBoost) can handle label encoding because they only use threshold splits, not distances.',
    tags: ['preprocessing', 'encoding'],
  },

  // Supervised Learning
  {
    id: 'fc-supervised-bias-variance',
    sectionId: 'supervised-learning',
    question: 'Explain the bias-variance tradeoff. How does model complexity relate to it?',
    answer: '**Bias**: Error from wrong assumptions (underfitting). High bias = model too simple.\n**Variance**: Error from sensitivity to training data (overfitting). High variance = model too complex.\n\n**Total Error = Bias^2 + Variance + Irreducible Noise**\n\nAs complexity increases: bias decreases, variance increases. The optimal model minimizes their sum.\n\nRegularization (L1/L2) adds bias to reduce variance.',
    tags: ['ml-theory', 'tradeoffs'],
  },
  {
    id: 'fc-supervised-gd-convergence',
    sectionId: 'supervised-learning',
    question: 'What determines whether gradient descent converges? What can go wrong?',
    answer: '**Learning rate** is the key factor:\n- Too large: overshoots, diverges (loss oscillates or explodes)\n- Too small: converges very slowly, may get stuck in local minima\n- Just right: steady decrease in loss\n\n**Other issues**:\n- Saddle points (gradients near zero but not a minimum)\n- Vanishing gradients in deep networks\n- Non-convex loss landscapes have multiple local minima\n\n**Solutions**: Learning rate schedules, momentum, Adam optimizer.',
    tags: ['optimization', 'gradient-descent'],
  },
  {
    id: 'fc-supervised-logistic',
    sectionId: 'supervised-learning',
    question: 'Why do we use the sigmoid function in logistic regression? Why not just threshold the linear output?',
    answer: 'The sigmoid function sigma(z) = 1/(1+e^{-z}) provides:\n\n1. **Differentiable**: Enables gradient-based optimization (hard threshold has no gradient)\n2. **Probabilistic output**: Maps any real number to (0, 1)\n3. **Natural fit**: Arises from modeling log-odds as a linear function: log(p/(1-p)) = wx + b\n\nThe gradient is: sigma\'(z) = sigma(z) * (1 - sigma(z)), which is simple and efficient to compute.',
    tags: ['classification', 'sigmoid'],
  },

  // Unsupervised Learning
  {
    id: 'fc-unsupervised-kmeans-limitations',
    sectionId: 'unsupervised-learning',
    question: 'What are the main limitations of K-Means clustering?',
    answer: '1. **Must choose K** in advance (use elbow method or silhouette score)\n2. **Assumes spherical clusters** of similar size\n3. **Sensitive to initialization** (use K-Means++ for better init)\n4. **Sensitive to outliers** (consider K-Medoids instead)\n5. **Only finds convex clusters** (can\'t handle non-convex shapes like DBSCAN can)\n6. **Converges to local optima** (run multiple times with different seeds)',
    tags: ['clustering', 'limitations'],
  },
  {
    id: 'fc-unsupervised-pca',
    sectionId: 'unsupervised-learning',
    question: 'What does PCA actually compute? Why do we use eigenvectors of the covariance matrix?',
    answer: 'PCA finds the directions of **maximum variance** in the data.\n\nSteps:\n1. Center data (subtract mean)\n2. Compute covariance matrix C = X^T X / (n-1)\n3. Eigendecomposition: C = V * diag(lambda) * V^T\n4. Eigenvectors = principal component directions\n5. Eigenvalues = variance explained along each direction\n\nProjecting onto top-k eigenvectors gives the best k-dimensional approximation (minimizes reconstruction error).',
    tags: ['dimensionality-reduction', 'pca'],
  },

  // Model Evaluation
  {
    id: 'fc-eval-precision-recall',
    sectionId: 'model-evaluation',
    question: 'When should you optimize for precision vs recall? Give real-world examples.',
    answer: '**Optimize Precision** (minimize false positives):\n- Spam detection: Don\'t want legitimate emails in spam\n- Content recommendation: Bad recommendations lose trust\n\n**Optimize Recall** (minimize false negatives):\n- Cancer screening: Don\'t want to miss a diagnosis\n- Fraud detection: Missing fraud is costly\n\n**F1 Score**: Harmonic mean when both matter equally. F1 = 2 * (P * R) / (P + R)\n\nUse **PR curve** (not ROC) when classes are heavily imbalanced.',
    tags: ['metrics', 'classification'],
  },
  {
    id: 'fc-eval-crossval',
    sectionId: 'model-evaluation',
    question: 'Why use K-fold cross-validation instead of a single train/test split?',
    answer: 'A single split is **unreliable** because results depend on which data ends up in test set.\n\nK-fold CV:\n1. Split data into K folds\n2. Train on K-1, test on 1 (rotate K times)\n3. Average metrics across folds\n\n**Benefits**: Every sample is used for both training and testing, gives variance estimate of performance, more reliable than single split.\n\n**Stratified K-fold**: Maintains class distribution in each fold (important for imbalanced data).',
    tags: ['evaluation', 'cross-validation'],
  },

  // Deep Learning Basics
  {
    id: 'fc-dl-relu-advantages',
    sectionId: 'deep-learning',
    question: 'Why is ReLU the most popular activation function? What problem does it solve?',
    answer: 'ReLU(x) = max(0, x) advantages:\n\n1. **No vanishing gradient**: Gradient is 1 for positive inputs (vs sigmoid/tanh which saturate)\n2. **Sparse activation**: ~50% of neurons output zero, improving efficiency\n3. **Fast computation**: Simple threshold, no exponentials\n\n**Problem**: "Dying ReLU" - neurons with negative inputs always output 0, gradient is always 0, never recover.\n\n**Variants**: LeakyReLU (small slope for negatives), GELU (smooth, used in transformers), SiLU/Swish (x * sigmoid(x)).',
    tags: ['activation', 'deep-learning'],
  },
  {
    id: 'fc-dl-backprop',
    sectionId: 'deep-learning',
    question: 'Explain backpropagation in one sentence. Then explain why the chain rule makes it work.',
    answer: 'Backpropagation computes the gradient of the loss with respect to every weight by repeatedly applying the **chain rule** from output to input.\n\nFor a network y = f(g(h(x))):\n- dL/dw_h = dL/dy * dy/dg * dg/dh * dh/dw_h\n\nEach layer only needs: (1) the gradient from the layer above, and (2) its own local gradient. This makes it efficient - we compute gradients in one backward pass, reusing intermediate results (dynamic programming).',
    tags: ['backpropagation', 'chain-rule'],
  },

  // Neural Networks
  {
    id: 'fc-nn-vanishing-gradient',
    sectionId: 'neural-networks',
    question: 'What causes vanishing gradients and how do you fix it?',
    answer: 'Gradients shrink exponentially as they propagate through many layers because they are multiplied at each step.\n\n**Causes**:\n- Sigmoid/tanh saturate (gradient near 0 for large/small inputs)\n- Poor weight initialization\n\n**Solutions**:\n1. **ReLU activation** (gradient = 1 for positive inputs)\n2. **Residual connections** (skip connections add gradient highways)\n3. **Batch normalization** (keeps activations in a good range)\n4. **Proper initialization** (He for ReLU, Xavier for sigmoid/tanh)\n5. **LSTM/GRU** for recurrent networks (gating mechanisms)',
    tags: ['training', 'gradients'],
  },
  {
    id: 'fc-nn-batchnorm',
    sectionId: 'neural-networks',
    question: 'How does batch normalization work? Why does it help training?',
    answer: 'For each mini-batch, BatchNorm normalizes activations:\n\n1. Compute batch mean: mu = mean(x)\n2. Compute batch variance: var = var(x)\n3. Normalize: x_hat = (x - mu) / sqrt(var + eps)\n4. Scale and shift: y = gamma * x_hat + beta\n\ngamma and beta are **learnable** parameters.\n\n**Benefits**: Reduces internal covariate shift, allows higher learning rates, acts as mild regularizer.\n\n**At inference**: Uses running mean/variance (not batch statistics).',
    tags: ['normalization', 'training'],
  },
  {
    id: 'fc-nn-weight-init',
    sectionId: 'neural-networks',
    question: 'Why can\'t you initialize all weights to zero? What initialization should you use?',
    answer: 'Zero initialization causes **symmetry breaking failure**: all neurons compute the same gradient, learn the same features forever.\n\n**Xavier/Glorot init** (for sigmoid/tanh):\n- W ~ N(0, 2/(n_in + n_out))\n- Keeps variance stable through layers\n\n**He/Kaiming init** (for ReLU):\n- W ~ N(0, 2/n_in)\n- Accounts for ReLU zeroing half the outputs\n\nKey insight: variance of activations should remain ~1 through all layers.',
    tags: ['initialization', 'training'],
  },

  // CNNs & Computer Vision
  {
    id: 'fc-cnn-why-convolutions',
    sectionId: 'cnn',
    question: 'Why use convolutions instead of fully-connected layers for images?',
    answer: '1. **Parameter sharing**: Same kernel applied everywhere (a 3x3 kernel has 9 params vs millions in FC)\n2. **Translation equivariance**: Detecting a feature anywhere in the image\n3. **Local connectivity**: Each output depends on a small local region\n4. **Hierarchical features**: Early layers detect edges, later layers detect complex shapes\n\nA 224x224x3 image has 150K inputs. FC to 1000 neurons = 150M params. Conv with 64 3x3 filters = only 1,728 params.',
    tags: ['cnn', 'architecture'],
  },
  {
    id: 'fc-cnn-output-size',
    sectionId: 'cnn',
    question: 'What is the formula for the output size of a convolution layer?',
    answer: 'Output size = floor((W - K + 2P) / S) + 1\n\nWhere:\n- W = input size\n- K = kernel size\n- P = padding\n- S = stride\n\n**Common configs**:\n- "same" padding: P = (K-1)/2 with S=1 keeps size unchanged\n- No padding, S=1: output = W - K + 1\n- S=2: roughly halves spatial dimensions',
    tags: ['cnn', 'dimensions'],
  },
  {
    id: 'fc-cnn-iou',
    sectionId: 'cnn',
    question: 'What is IoU and why is it the standard metric for object detection?',
    answer: 'IoU (Intersection over Union) = Area of Overlap / Area of Union\n\nRange: 0 (no overlap) to 1 (perfect match)\n\nUsed as:\n1. **Evaluation metric**: mAP uses IoU threshold (typically 0.5 or 0.5:0.95)\n2. **NMS filtering**: Suppress detections with IoU > threshold to the best box\n3. **Training**: Match predicted boxes to ground truth\n\nIoU is preferred over simple distance because it is **scale-invariant** and captures both position and size agreement.',
    tags: ['detection', 'metrics'],
  },

  // Transformers
  {
    id: 'fc-transformer-scaling',
    sectionId: 'transformers',
    question: 'Why do we scale attention scores by 1/sqrt(d_k)?',
    answer: 'Without scaling, the dot products Q @ K^T grow in magnitude with d_k (each dot product sums d_k terms).\n\nLarge dot products push softmax into saturated regions where gradients are near zero, making training unstable.\n\nScaling by 1/sqrt(d_k) keeps the variance of the dot products at ~1 regardless of dimension, ensuring softmax produces well-behaved gradients.\n\nMathematically: if q_i, k_i ~ N(0,1), then q.k has variance d_k. Dividing by sqrt(d_k) gives variance 1.',
    tags: ['attention', 'transformers'],
  },
  {
    id: 'fc-transformer-positional',
    sectionId: 'transformers',
    question: 'Why do transformers need positional encoding? What happens without it?',
    answer: 'Self-attention is **permutation-equivariant**: swapping input positions gives the same swapped output. Without positional info, "the cat sat on the mat" and "mat the on sat cat the" produce identical representations.\n\nSinusoidal encoding uses sin/cos at different frequencies:\n- PE(pos, 2i) = sin(pos / 10000^(2i/d))\n- PE(pos, 2i+1) = cos(pos / 10000^(2i/d))\n\nThis allows the model to attend to relative positions because PE(pos+k) can be expressed as a linear function of PE(pos).',
    tags: ['transformers', 'positional-encoding'],
  },
  {
    id: 'fc-transformer-multihead',
    sectionId: 'transformers',
    question: 'Why use multi-head attention instead of a single attention head with the same total dimension?',
    answer: 'Multiple heads allow the model to attend to different aspects **simultaneously**:\n- Head 1: syntactic relationships\n- Head 2: semantic similarity\n- Head 3: positional patterns\n\nWith h heads and model dim d_model:\n- Each head has d_k = d_model / h\n- Same total parameters as single-head\n- But each head learns a different attention pattern in its own subspace\n\nEmpirically, multi-head consistently outperforms single-head attention.',
    tags: ['attention', 'multi-head'],
  },

  // LLM Generation & Decoding
  {
    id: 'fc-llm-temperature',
    sectionId: 'llm-generation',
    question: 'How does temperature affect LLM output? What happens at T=0 vs T=2?',
    answer: 'Temperature scales logits before softmax: probs = softmax(logits / T)\n\n**T -> 0**: Distribution becomes one-hot (greedy decoding). Always picks the most likely token. Deterministic but repetitive.\n\n**T = 1**: Original model distribution.\n\n**T = 2**: Flattened distribution. More random, creative, but potentially incoherent.\n\nMathematically, dividing by small T amplifies differences between logits; dividing by large T shrinks them toward uniform.',
    tags: ['llm', 'sampling'],
  },
  {
    id: 'fc-llm-kv-cache',
    sectionId: 'llm-generation',
    question: 'What is a KV cache and why is it essential for efficient LLM inference?',
    answer: 'In autoregressive generation, each new token attends to ALL previous tokens.\n\n**Without cache**: Recompute K, V for all previous tokens at each step. Cost: O(n^2) total for n tokens.\n\n**With cache**: Store K, V from previous steps. Only compute Q, K, V for the new token, then concatenate K, V with cache.\n\nPer-step cost drops from O(n * d) to O(d). Total generation cost: O(n * d) instead of O(n^2 * d).\n\n**Tradeoff**: Memory grows linearly with sequence length (need to store K, V for each layer and head).',
    tags: ['llm', 'inference', 'optimization'],
  },
  {
    id: 'fc-llm-topk-topp',
    sectionId: 'llm-generation',
    question: 'Compare top-k and top-p (nucleus) sampling. When is one better than the other?',
    answer: '**Top-k**: Keep only the k highest-probability tokens, redistribute probability among them.\n- Fixed number of candidates regardless of distribution shape\n- May include low-prob tokens when distribution is peaked, or exclude good tokens when flat\n\n**Top-p (nucleus)**: Keep smallest set of tokens whose cumulative probability >= p.\n- Adaptive: fewer tokens when confident, more when uncertain\n- p=0.9 is a common default\n\nTop-p is generally preferred because it adapts to the distribution. They can also be combined (apply both filters).',
    tags: ['llm', 'sampling'],
  },

  // Generative Models
  {
    id: 'fc-gen-reparameterization',
    sectionId: 'generative-models',
    question: 'What is the reparameterization trick in VAEs? Why is it necessary?',
    answer: 'The encoder outputs mu and sigma, and we sample z ~ N(mu, sigma^2). But **sampling is not differentiable** - we can\'t backpropagate through a random sample.\n\n**Reparameterization trick**: Instead of sampling z directly:\n1. Sample eps ~ N(0, 1)\n2. Compute z = mu + sigma * eps\n\nNow z is a **deterministic function** of mu, sigma, and eps. Gradients flow through mu and sigma while randomness comes from eps (which has no parameters to update).',
    tags: ['vae', 'training'],
  },
  {
    id: 'fc-gen-kl-divergence',
    sectionId: 'generative-models',
    question: 'What is KL divergence? Why is it used in VAE loss?',
    answer: 'KL(P || Q) = E_P[log(P/Q)] measures how much P differs from Q.\n\nProperties:\n- Always >= 0 (equals 0 iff P = Q)\n- **Not symmetric**: KL(P||Q) != KL(Q||P)\n\nIn VAEs, KL(q(z|x) || p(z)) regularizes the encoder:\n- q(z|x) = encoder output (learned posterior)\n- p(z) = N(0, I) (prior)\n- Forces the latent space to be structured and continuous\n- Without it, the encoder could learn arbitrary encodings that don\'t generalize\n\nFor Gaussians: KL = 0.5 * sum(sigma^2 + mu^2 - 1 - log(sigma^2))',
    tags: ['vae', 'information-theory'],
  },
  {
    id: 'fc-gen-diffusion',
    sectionId: 'generative-models',
    question: 'How do diffusion models generate images? Explain the forward and reverse process.',
    answer: '**Forward process** (fixed, not learned):\n- Gradually add Gaussian noise over T steps\n- x_t = sqrt(alpha_bar_t) * x_0 + sqrt(1 - alpha_bar_t) * eps\n- At t=T, x_T is pure noise\n\n**Reverse process** (learned):\n- Train a neural network to predict the noise eps added at each step\n- Starting from x_T ~ N(0, I), iteratively denoise\n- Each step removes a small amount of noise\n\n**Training**: Minimize MSE between predicted and actual noise: L = ||eps - eps_theta(x_t, t)||^2',
    tags: ['diffusion', 'generative'],
  },

  // Reinforcement Learning
  {
    id: 'fc-rl-onpolicy-offpolicy',
    sectionId: 'reinforcement-learning',
    question: 'What is the difference between on-policy and off-policy learning? Give examples.',
    answer: '**On-policy**: Learns about the policy it is currently following.\n- SARSA: Updates Q(s,a) using the action actually taken by current policy\n- Must collect new data after each policy update\n\n**Off-policy**: Learns about a different (target) policy from the one generating data.\n- Q-Learning: Updates Q(s,a) using max over next actions (greedy), regardless of what action was taken\n- Can reuse old experience (replay buffer)\n\n**Key tradeoff**: Off-policy is more sample-efficient but can be less stable.',
    tags: ['rl', 'algorithms'],
  },
  {
    id: 'fc-rl-bellman',
    sectionId: 'reinforcement-learning',
    question: 'State the Bellman equation for Q-values. Why is it important?',
    answer: 'Q*(s, a) = E[r + gamma * max_a\' Q*(s\', a\')]\n\nThe optimal Q-value of taking action a in state s equals:\n- Immediate reward r, plus\n- Discounted optimal value of the next state (gamma * max Q)\n\n**Why important**:\n1. Foundation for Q-learning (iterative approximation)\n2. Defines optimality recursively\n3. Enables dynamic programming solutions\n4. Q-learning update: Q(s,a) <- Q(s,a) + alpha * (r + gamma * max Q(s\',a\') - Q(s,a))',
    tags: ['rl', 'theory'],
  },
  {
    id: 'fc-rl-ppo',
    sectionId: 'reinforcement-learning',
    question: 'What is PPO and why is it the most widely used RL algorithm today?',
    answer: 'PPO (Proximal Policy Optimization) clips the policy ratio to prevent large updates:\n\nL = min(r_t * A_t, clip(r_t, 1-eps, 1+eps) * A_t)\n\nwhere r_t = pi_new(a|s) / pi_old(a|s)\n\n**Why popular**:\n1. Simple to implement (vs TRPO\'s complex constraints)\n2. Stable training (clipping prevents catastrophic updates)\n3. Works well across tasks (games, robotics, LLM fine-tuning via RLHF)\n4. Good sample efficiency with multiple epochs per batch\n\nUsed by OpenAI for RLHF in ChatGPT.',
    tags: ['rl', 'policy-gradient'],
  },

  // E2E Implementations
  {
    id: 'fc-e2e-mlp-backprop',
    sectionId: 'e2e-implementations',
    question: 'Walk through the backward pass of a 2-layer MLP. What gradients do you compute?',
    answer: 'For y = W2 * relu(W1 * x + b1) + b2:\n\n**Output layer**:\n- dL/dz2 = predicted - target (for MSE/cross-entropy)\n- dL/dW2 = h1^T @ dz2\n- dL/db2 = sum(dz2)\n\n**Hidden layer**:\n- dL/dh1 = dz2 @ W2^T\n- dL/dz1 = dh1 * (z1 > 0) [ReLU derivative]\n- dL/dW1 = x^T @ dz1\n- dL/db1 = sum(dz1)\n\nUpdate: W -= lr * dW, b -= lr * db',
    tags: ['backpropagation', 'mlp'],
  },
  {
    id: 'fc-e2e-transformer-components',
    sectionId: 'e2e-implementations',
    question: 'List all components of a Transformer encoder block in order. What does each do?',
    answer: '1. **Multi-Head Self-Attention**: Each token attends to all others\n2. **Add & Norm**: Residual connection + Layer Normalization\n3. **Feed-Forward Network**: Two linear layers with ReLU/GELU: FFN(x) = W2 * relu(W1 * x + b1) + b2\n4. **Add & Norm**: Another residual + LayerNorm\n\nFull block: x -> MHA(x) + x -> LN -> FFN -> + residual -> LN\n\nThe decoder adds **cross-attention** (attends to encoder output) and **causal masking** (prevents attending to future tokens).',
    tags: ['transformer', 'architecture'],
  },
  {
    id: 'fc-e2e-residual',
    sectionId: 'e2e-implementations',
    question: 'Why are residual connections critical in deep networks?',
    answer: 'Residual connections (skip connections) add the input to the output: y = F(x) + x\n\n**Benefits**:\n1. **Gradient highway**: Gradients flow directly through the skip path, preventing vanishing gradients\n2. **Identity mapping**: Easy for the network to learn identity (just set F(x) = 0)\n3. **Enables depth**: ResNets trained 152+ layers successfully; without residuals, performance degrades past ~20 layers\n\nUsed everywhere: ResNet, Transformers, U-Net, DenseNet.',
    tags: ['architecture', 'deep-learning'],
  },
];

export function getFlashCardsBySection(sectionId: string): FlashCard[] {
  return flashCards.filter(card => card.sectionId === sectionId);
}
