---
section: neural-networks
title: Neural Networks
target_minutes: 4.5
chapters:
  - { t: 0, title: "Cross-entropy loss" }
  - { t: 64, title: "Backpropagation" }
  - { t: 122, title: "Weight initialization" }
  - { t: 172, title: "Batch normalization" }
  - { t: 210, title: "Dropout" }
paragraph_chapters: [0, 0, 1, 2, 3, 4, outro]
first_problem: { id: cross-entropy-loss, title: Cross-Entropy Loss }
---
Welcome to Neural Networks. To train a network we first need a single number that says how wrong it is. For classification that number is the cross-entropy loss. The network outputs a probability for every class, and the loss is minus the log of the probability it gave to the correct class, averaged over the batch. If the model is ninety percent sure of the right answer, the loss is small. If it gives the right answer one percent, the loss is large, and it keeps growing as that probability heads toward zero. We add a tiny epsilon inside the log so a zero probability never produces infinity. You'll write this in Cross-Entropy Loss.

Language models add two refinements. Batches are padded to a common length, so padded tokens are masked out and the loss is averaged over the real tokens only. And label smoothing keeps a small share of the target, epsilon, spread evenly over every class, so the model is never pushed to be infinitely confident. That's the Masked Cross-Entropy with Label Smoothing problem.

Now, how does the loss teach the weights? Backpropagation is the chain rule, applied from the output backwards. In a two-layer network the forward pass computes a hidden layer, Z one equals X times W one plus b one, applies ReLU, then computes the output scores and a softmax. Going back, softmax and cross-entropy combine into a beautifully simple gradient: the predicted probabilities minus the one-hot labels. From there, the gradient of W two is the hidden activations transposed times that error, divided by the batch size. The error is sent back through W two transposed, and the ReLU lets it through only where its input was positive. Every gradient can be checked numerically by nudging one weight and watching the loss. You'll implement both passes in MLP Forward and Backward Pass.

Before any of this can work, the starting weights must be the right size. Each layer multiplies the signal by its weights. Too small, and the activations shrink layer after layer until they vanish. Too large, and they explode. Xavier initialization scales random weights by the square root of two over fan in plus fan out, which suits tanh and sigmoid. He initialization uses the square root of two over fan in. The extra factor of two makes up for ReLU zeroing out about half of its inputs. That's the Xavier and He Weight Initialization problem.

Even with good initialization, the distribution of each layer's inputs drifts as training changes the weights before it. Batch normalization fixes the scale directly. For each feature it computes the mean and variance across the batch, subtracts the mean and divides by the square root of the variance plus epsilon. Then a learned scale, gamma, and shift, beta, let the network choose the best range. You'll build the forward pass in Batch Normalization.

Finally, big networks love to memorize. Dropout fights this by randomly switching off neurons during training. Each one is kept with probability keep prob, and the survivors are divided by keep prob, so the expected value of every activation stays the same. Because no neuron can rely on any particular partner, the network learns redundant, robust features. At inference time dropout is turned off and the input passes through unchanged. You'll code it in Dropout.

Put these together and you can train a real network from scratch. Start with Cross-Entropy Loss below.
