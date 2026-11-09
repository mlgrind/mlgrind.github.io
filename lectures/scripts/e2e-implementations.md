---
section: e2e-implementations
title: End-to-End Implementations
target_minutes: 4.5
caption_replace: { "mu": "μ", "sigma": "σ", "epsilon": "ε" }
chapters:
  - { t: 0, title: "From blocks to models" }
  - { t: 36, title: "MLP and CNN" }
  - { t: 100, title: "Transformers, three ways" }
  - { t: 168, title: "Generative models" }
  - { t: 232, title: "Making it work" }
paragraph_chapters: [0, 1, 2, 3, 4, outro]
---
Welcome to End-to-End Implementations, the capstone of ML Grind. Every earlier section handed you a building block: a linear layer, a softmax, backpropagation, attention, layer norm, a convolution, the reparameterization trick, a noise schedule. Here you snap those blocks together into nine complete models, like building furniture from parts you have already cut and sanded. Each capstone reuses blocks you know, so when something breaks, you know which section to look back at. Almost nothing in this section is brand new. What's new is wiring it all up, keeping every shape straight, and making the whole thing actually learn.

Start with the 2-Layer MLP. The forward pass is a matrix multiply, a ReLU, another matrix multiply, then softmax and cross-entropy. The backward pass runs the chain rule in reverse. The gradient at the logits is simply the softmax output minus the one-hot label. Multiply by the hidden activations to get the second layer's weight gradient, send it back through the second weight matrix, zero it wherever the ReLU was off, and repeat for the first layer. Train it on two interleaved spirals and you can watch the loss fall as the boundary bends to fit. The CNN capstone puts convolution and max pooling in front of the dense layers. A twenty-eight by twenty-eight image becomes twenty-six after a three by three convolution, thirteen after pooling, then eleven, then five. Flatten those sixty-four channels and you have sixteen hundred features for the dense layers.

The Transformer Encoder stacks the attention pieces you've built: positional encoding, multi-head self-attention, then a feed-forward network, each wrapped in a residual connection and a layer norm. Mini GPT turns that into a language model. It adds a causal mask, uses pre-norm blocks, and predicts the next character at every position. A handy sanity check: with small random weights, the first loss should be close to the log of the vocabulary size, because the model starts out guessing uniformly. The Tiny Vision Transformer feeds the same encoder with images. It cuts the image into patches, embeds each one, prepends a CLS token and adds position embeddings, which are its only sense of where each patch sits. A thirty-two by thirty-two image cut into eight by eight patches becomes sixteen tokens, or seventeen with the CLS token. Then the Transformer Bug Hunt hands you a broken mini GPT with four bugs to find, and two checks help: no position may attend to the future, and every attention row must sum to one.

Three capstones generate data. The VAE encodes an input into a mean and a log-variance, samples a latent with the reparameterization trick, z equals mu plus sigma times epsilon, and decodes it. Its loss adds a reconstruction error to the KL divergence from a standard normal. The VQ-VAE swaps that continuous latent for a codebook. Each encoder output snaps to its nearest code vector, a straight-through estimator copies gradients past the snap, and codebook and commitment losses keep the two close. The Diffusion Model learns to undo noise. A schedule of betas sets how much noise each step adds, and alpha bar, the running product of one minus beta, lets you jump straight to any step: scale the clean data by the square root of alpha bar, and add noise scaled by the square root of one minus alpha bar. The network learns to predict that noise, and sampling walks the chain backward.

When a capstone misbehaves, debug it like an engineer. Check every shape against what you expect. Check the initial loss against the log of the number of classes. A fresh ten-class classifier should start near two point three, and if it doesn't, something is wrong before training even begins. Check your gradients with finite differences: nudge one weight up and down by a tiny amount, and the change in the loss should match your analytic gradient to several decimal places. And make sure the model can overfit a handful of examples before you train it on more. Small checks catch the bugs that silent broadcasting hides.

Nine models, built from every block you've made. Start with the 2-Layer MLP below.
