---
section: deep-learning
title: Deep Learning Basics
target_minutes: 4
chapters:
  - { t: 0, title: "Neurons and nonlinearity" }
  - { t: 62, title: "Activation functions" }
  - { t: 120, title: "The dense layer" }
  - { t: 170, title: "Softmax" }
paragraph_chapters: [0, 0, 1, 1, 2, 3, 3, outro]
first_problem: { id: perceptron, title: ReLU Activation }
---
Welcome to Deep Learning Basics. Every neural network, however large, is built from one small unit: the neuron. A neuron takes its inputs, multiplies each one by a weight, adds them up, adds a bias, and then passes the result through an activation function. The weights and the bias are what the network learns.

Why bother with the activation? Because without it, depth buys you nothing. A linear layer followed by another linear layer is still just one linear layer: the two weight matrices multiply into a single matrix. Stack a hundred of them and you can still only draw straight lines. Look at these two rings of points. A purely linear model gets barely better than a coin flip. Put a nonlinearity between the layers, and a small network can bend its boundary into a closed curve that wraps around the inner ring.

The most common activation today is ReLU, the rectified linear unit. It is almost embarrassingly simple: keep positive values, and replace negative values with zero. In other words, the maximum of zero and x. The sigmoid squashes any number into the range zero to one, which makes it a natural fit for a binary probability. Tanh is its zero-centered cousin, with outputs between minus one and one.

The shapes matter because of gradients. The slope of the sigmoid is never more than a quarter, and far from zero it is almost flat. Backpropagation multiplies these slopes layer after layer, so through ten sigmoid layers the signal can shrink by a factor of a million. This is the vanishing gradient problem. ReLU's slope is exactly one for every positive input, so gradients pass through unchanged. Its weakness is that a neuron stuck in the negative region gets no gradient at all. You'll implement it in the ReLU Activation problem.

Now let's process a whole batch at once. Put the inputs in a matrix X, one row per example. A dense layer, also called fully connected, multiplies X by a weight matrix W, whose shape is input features by output features, and adds a bias vector b. NumPy broadcasting adds the same bias to every row. Every output is connected to every input, which is where the name comes from. Then the activation is applied element by element. That is the whole forward pass: ReLU of X times W plus b. You'll build it in Dense Layer Forward Pass.

For the final layer of a classifier we need probabilities. Softmax takes a vector of raw scores, called logits, exponentiates each one so everything is positive, and divides by the sum so the results add up to one. Bigger logits get bigger probabilities, but nobody gets exactly zero.

There's one practical trap. The exponential overflows quickly: e to the power of a thousand is infinity in floating point, and infinity divided by infinity is not a number. The fix is to subtract the largest logit before exponentiating. Shifting every logit by the same amount doesn't change the softmax at all, and now the biggest exponent is e to the zero, which is one. As a rule of thumb, use ReLU in hidden layers, a sigmoid for a single yes or no output, and softmax when choosing among many classes. You'll write a stable version in the Softmax Function problem.

These three pieces are the foundation of every network that follows. Start with ReLU Activation below.
