---
section: pytorch-basics
title: PyTorch Basics
target_minutes: 4.5
paragraph_chapters: [0, 0, 1, 1, 2, 3, 4, outro]
caption_replace: { "torch dot tensor": "torch.tensor", "x dot grad": "x.grad", "zero grad": "zero_grad", "drop last": "drop_last", "X transpose": "Xᵀ" }
chapters:
  - { t: 0, title: "Tensors" }
  - { t: 50, title: "Autograd" }
  - { t: 110, title: "Modules and losses" }
  - { t: 160, title: "The training loop" }
  - { t: 210, title: "Minibatches" }
---
Welcome to PyTorch Basics. If you know NumPy, you already know most of PyTorch. A tensor is an array with two extra powers: it can live on a GPU, and it can remember how it was computed, so gradients come for free. Problems in this section open in a PyTorch track that runs right in your browser, and a toggle lets you build the same ideas from scratch in NumPy.

Creating tensors looks just like NumPy: torch dot tensor, zeros, ones, arange and randn. One difference matters: PyTorch defaults to thirty-two bit floats, which is what GPUs like. Operations carry over too, with a few new names. Reductions take dim instead of axis. View reshapes without copying. And unsqueeze adds an axis of size one, while squeeze removes it, which is how you turn a single example into a batch of one. You will practice these in Tensor Creation and Tensor Operations.

Now the real magic: autograd. Take y equals x squared plus three x plus one, at x equals two. As you compute the forward pass, PyTorch quietly records each operation in a graph, like leaving breadcrumbs. Calling backward walks the breadcrumbs in reverse, multiplying local derivatives with the chain rule. The square contributes two x, which is four, the linear term contributes three, and x dot grad comes out as seven.

The same chain rule gives the gradients of a linear layer, Y equals X times W plus b. Given the gradient flowing back into Y, the gradient for W is X transpose times that gradient, and the gradient for b is that gradient summed over the batch. In Autograd Concepts you will compute these by hand, which is exactly what backward does for you.

Models are built from modules. A module owns its parameters and defines a forward method. A Linear module multiplies by a weight matrix and adds a bias, and a ReLU module zeroes out the negatives. Stack them and you have a network. To train it you need a loss, one number that says how wrong you are. Mean squared error averages the squared differences, for regression. Cross-entropy takes a softmax of the logits and then the negative log of the probability given to the true class. Subtract the largest logit first, so the exponentials never overflow. You will build these in Neural Network Modules and Loss Functions, and the activations in GELU Activation and LeakyReLU and Swish.

Everything comes together in the training loop, five lines you will write again and again. Zero the gradients. Run the forward pass. Compute the loss. Call backward to fill in the gradients. And step the optimizer to update the parameters. Repeat, and the loss falls. The classic bug is forgetting zero grad. Gradients accumulate, so every step would push with the sum of all past gradients, and training overshoots and wobbles. The Training Loop problem fits a linear model this way, recording the loss before every update.

Real datasets are too big for one step, so we use minibatches. A data loader shuffles the sample indices once per epoch, using a seeded generator so runs are reproducible, and cuts them into chunks of the batch size. Rows of X stay paired with their labels, and with drop last, a final short batch is discarded. You will write this in Minibatches: Dataset and DataLoader. The rest of the section builds on these pieces, from RMS normalization to Adam, learning rate schedules and LoRA adapters.

Tensors, gradients, modules, losses and the loop: that is PyTorch. Start with Tensor Creation below.
