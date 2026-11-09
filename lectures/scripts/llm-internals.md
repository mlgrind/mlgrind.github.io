---
section: llm-internals
title: LLM Internals
target_minutes: 4.5
chapters:
  - { t: 0, title: "The modern decoder block" }
  - { t: 45, title: "SwiGLU" }
  - { t: 95, title: "Online softmax" }
  - { t: 150, title: "Mixture of experts" }
  - { t: 195, title: "Perplexity" }
paragraph_chapters: [0, 0, 1, 2, 3, 4, outro]
---
Welcome to LLM Internals. You already know the transformer block. This lecture is about what changes when that block becomes a production language model.

Text is split into tokens, each token is looked up in an embedding table, and the result flows through a stack of decoder blocks. Each block does two things, each wrapped in a residual connection: causal attention, then a feed-forward network. Both read a normalized copy of their input, which is called pre-norm. Modern models normalize with RMSNorm. It skips the mean subtraction of layer norm and simply divides each vector by its root mean square, then multiplies by a learned weight. It is cheaper and works just as well. After the last block, one more norm and the language model head produce logits over the vocabulary.

The feed-forward network changed too. The original transformer used a ReLU between two matrices. LLaMA and its relatives use SwiGLU, a gated version with three matrices. The input is projected twice. One copy passes through SiLU, which is z times the sigmoid of z, a smooth cousin of ReLU that lets a little negative signal through. That copy acts as a gate, multiplying the other, linear copy element by element, so the network learns which features to let through. A third matrix projects back down. Because there are three matrices instead of two, the hidden size is shrunk to about eight thirds of the model dimension, which keeps the parameter count of a ReLU network four times as wide. That's the SwiGLU Feed-Forward Block.

Attention has a memory problem. For a long sequence, the matrix of scores between every query and every key is too big for the fast memory on a GPU, and moving it to and from slow memory dominates the runtime. FlashAttention never builds that matrix. It walks over the keys in blocks and keeps three running quantities per query: the largest score seen so far, the softmax denominator, and an unnormalized output. The trick is the online softmax. When a new block brings a bigger maximum, the running sum is rescaled by the exponential of the old max minus the new max, as if it had used the new max all along. Divide at the end, and the result is exactly the ordinary softmax. It saves memory traffic, not arithmetic. You'll implement it in Online Softmax.

How do you add parameters without adding compute? A mixture of experts replaces one feed-forward network with many smaller experts and a router. The router scores every expert for each token, keeps the top k, and renormalizes those k scores with a softmax to get the gates. The token runs through only its chosen experts, and their outputs are summed, weighted by the gates. Left alone, the router tends to collapse onto a few favourite experts. The load-balancing loss multiplies, for each expert, the fraction of routing slots it receives by its average router probability, sums over experts, and scales by the number of experts. It equals one when routing is perfectly even. That's Mixture-of-Experts Routing.

Finally, how do we measure a language model? At every position, take the log softmax of the logits and read off the log probability of the true next token. Its negative is that token's loss. Average over the real tokens, skipping padding with a mask, and you have the cross-entropy that training minimizes. Exponentiate it to get perplexity, the effective number of tokens the model is choosing between. A model guessing uniformly over V tokens has perplexity exactly V, and a perfect model has perplexity one. Perplexity is only comparable between models that share a tokenizer. That's Token Cross-Entropy and Perplexity.

Pre-norm blocks, gated feed-forwards, streaming attention, sparse experts, and one number to grade them all. Start with the SwiGLU Feed-Forward Block below.
