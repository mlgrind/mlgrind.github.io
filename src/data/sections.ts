import { Section } from '../types';

export const sections: Section[] = [
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

### Why It Matters
Garbage in, garbage out. Proper preprocessing can:
- Improve model accuracy by 10-30%
- Prevent training failures
- Reduce overfitting

Let's practice these essential skills!
    `,
    problems: ['normalize-features', 'handle-missing-data', 'one-hot-encode'],
  },
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

### Decision Trees
- **Concept**: Recursive binary splits based on features
- **Splitting criteria**: Gini impurity, Information gain
- **Advantages**: Interpretable, handles non-linear relationships

### The Interview Perspective
Interviewers often ask you to:
- Implement gradient descent from scratch
- Explain the math behind these algorithms
- Discuss trade-offs between algorithms

Let's build these algorithms!
    `,
    problems: ['linear-regression-gd', 'logistic-regression', 'decision-tree-split'],
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

### Why These Matter
- **K-Means**: Customer segmentation, image compression
- **PCA**: Feature reduction, visualization, noise removal

### Interview Tips
- Be ready to implement K-means from scratch
- Explain variance explained by components
- Discuss limitations (K-means assumes spherical clusters)

Let's implement these algorithms!
    `,
    problems: ['kmeans-clustering', 'pca-implementation'],
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning Basics',
    description: 'Build neural networks from scratch to understand the fundamentals.',
    icon: '🧠',
    introduction: `
# Deep Learning Basics

Neural networks are the foundation of modern AI. Understanding how they work from scratch is essential.

## Key Concepts

### Perceptron
- **Structure**: Single layer of weights + bias
- **Activation**: Step function for binary output
- **Learning**: Update weights based on errors

### Multi-Layer Networks
- **Forward propagation**: Input → Hidden → Output
- **Activation functions**: ReLU, Sigmoid, Tanh
- **Why layers**: Learn hierarchical features

### Backpropagation
- **Chain rule**: Compute gradients layer by layer
- **Weight updates**: gradient descent on all parameters
- **Key insight**: Errors propagate backwards

### Common Interview Questions
- Implement forward pass for a 2-layer network
- Derive backpropagation equations
- Explain vanishing/exploding gradients

Let's build neural networks from scratch!
    `,
    problems: ['perceptron', 'neural-network-forward', 'backpropagation'],
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

### Interview Essentials
- Know when to use each metric
- Implement cross-validation from scratch
- Discuss precision-recall trade-offs

Let's practice evaluation!
    `,
    problems: ['precision-recall-f1', 'cross-validation', 'confusion-matrix'],
  },
];
