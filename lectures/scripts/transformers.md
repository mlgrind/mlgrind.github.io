---
section: transformers
title: Attention and Transformers
target_minutes: 4
caption_replace: { "d k": "d_k" }
chapters:
  - { t: 0, title: "Queries, keys and values" }
  - { t: 72, title: "Why we scale" }
  - { t: 118, title: "Multi-head attention" }
  - { t: 156, title: "Positional encoding" }
  - { t: 198, title: "Layer norm and the causal mask" }
---
Welcome to Attention and Transformers. Take the sentence "the trophy didn't fit in the suitcase because it was too big." To work out what "it" means, you need to look back at other words and decide which ones matter. That is exactly what attention does. Every token gets to look at every other token and pull in the information it finds most relevant.

Here is how it works. Each token is turned into three vectors: a query, a key and a value. Think of a library. The query is the question you walk in with, each key is the label on a book's spine, and each value is what's inside the book. To answer your query, you compare it against every key using a dot product, which gives a score for how well they match. A softmax turns those scores into weights that are positive and add up to one. The output is then a weighted average of the values. You will build this in Scaled Dot-Product Attention.

So why the word scaled? Before the softmax, we divide every score by the square root of d k, the length of the key vectors. If the entries of the queries and keys are roughly unit-sized and independent, their dot product has a variance that grows in proportion to d k. With big vectors the scores get large, and softmax becomes nearly one-hot: one weight close to one, the rest close to zero. In that saturated regime the gradients almost vanish and training stalls. Dividing by the square root of d k brings the variance back to about one and keeps the softmax in a healthy range.

One attention pattern is rarely enough. A word might need to track its grammatical subject and, at the same time, a nearby adjective. Multi-head attention runs several attention operations side by side. The model dimension is split across the heads, each head gets its own learned projections for queries, keys and values, and each attends independently. The head outputs are concatenated and passed through one final projection back to the model dimension. It's like asking a panel of specialists rather than one generalist. That's the Multi-Head Attention problem.

There's a catch. Attention, on its own, has no sense of order. Shuffle the tokens and each one gets the same output, just in the shuffled order. To fix this we add a positional encoding to each token's embedding. The original transformer uses sine and cosine waves at many frequencies: even dimensions get a sine, odd dimensions get a cosine, and the wavelength grows steadily across the dimensions. Like the hands of a clock turning at different speeds, together they give every position a unique fingerprint, and nearby positions look similar. You'll compute this in Sinusoidal Positional Encoding.

Two more pieces keep deep transformers stable and honest. Layer Normalization takes each token on its own, subtracts the mean of its features, and divides by the square root of their variance plus a small epsilon. Then a learned scale, gamma, and shift, beta, are applied. Unlike batch norm, it doesn't depend on the batch, which suits variable-length sequences. And when a model generates text one token at a time, a position must not peek at the future. The Causal Attention Mask is a square matrix with zeros on and below the diagonal and negative infinity above it. Add it to the scores before the softmax, and every future position gets a weight of exactly zero.

Put these five pieces together and you have the core of a transformer. Start with Scaled Dot-Product Attention below.
