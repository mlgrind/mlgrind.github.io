---
section: llm-generation
title: LLM Generation and Decoding
target_minutes: 4.5
chapters:
  - { t: 0, title: "Logits and temperature" }
  - { t: 50, title: "Top-k, top-p and repetition" }
  - { t: 110, title: "The KV cache" }
  - { t: 150, title: "Beam search" }
  - { t: 195, title: "Speculative decoding" }
paragraph_chapters: [0, 0, 1, 1, 2, 3, 4, outro]
---
Welcome to LLM Generation and Decoding. A language model never writes a sentence directly. At every step it produces one raw score, called a logit, for every token in its vocabulary. A decoding strategy turns those scores into a single next token, which is appended to the text, and the whole loop repeats.

The simplest control is temperature. Before the softmax, we divide every logit by a temperature T. Below one, the gaps between logits grow and the distribution sharpens toward the top token; as T approaches zero, sampling becomes greedy argmax. Above one, the gaps shrink and the distribution flattens toward uniform. Think of it as a contrast knob for the model's confidence. That's the Temperature Scaling problem.

Even at a sensible temperature, the long tail of unlikely tokens adds up, and one bad sample can derail a sentence. Top-k sampling keeps only the k most likely tokens, sets every other probability to zero, and renormalizes so the survivors add up to one. The weakness is that k is fixed. When the model is confident, k still lets in junk, and when it is unsure, k can cut off good options. Nucleus, or top-p, sampling adapts instead. Sort the probabilities, take a running sum, and keep the smallest set whose total reaches p, including the token that crosses the line. A confident prediction keeps one or two tokens; a flat one keeps many.

Models also love to loop. The Repetition Penalty looks at every token already generated. A positive logit is divided by the penalty, and a negative logit is multiplied by it, so either way that token becomes less likely.

Generation is slow because it is sequential. Each new token attends to every previous token, and a naive implementation recomputes the keys and values of the whole prefix at every step. But those keys and values never change. The KV cache stores them. At each step we project only the new token into a query, a key and a value, append the new key and value to the cache, and let that single query attend over everything cached. The work per step drops from redoing the entire prefix to computing one new row, paid for with memory that grows with the sequence. You'll build this in KV Cache for Efficient Generation.

Sampling gives variety, but sometimes we want the single most likely sequence, as in translation. Greedy decoding takes the best token at each step, yet a strong first word can lead into a weak continuation. Beam search keeps several candidates alive. At every step it expands each beam by every possible next token, scores each candidate by the sum of its log probabilities, and keeps only the top beam width. Log probabilities add where raw probabilities would multiply and underflow. Since every token adds a negative number, longer sequences are penalized, so scores are often divided by the length raised to a power alpha. That's Beam Search Decoding.

The last trick speeds up a big model without changing what it says. A small draft model quickly proposes several tokens. The large target model then scores all of them in one parallel forward pass. Each draft token is accepted with probability equal to the minimum of one and the target probability divided by the draft probability. At the first rejection, we discard the rest and resample that position from the leftover distribution: target minus draft, clipped at zero and renormalized. Remarkably, the accepted tokens follow the target model's distribution exactly. It is not an approximation, just a faster way to draw the same samples. That's Speculative Decoding.

Logits in, one token out, and a handful of ways to shape what happens in between. Start with Temperature Scaling below.
