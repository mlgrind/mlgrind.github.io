---
section: representation-learning
title: Representation Learning and Retrieval
target_minutes: 4
caption_replace: { "k one": "k1", "zero point zero seven": "0.07", "BM25 plus Embedding": "BM25 + Embedding", "tau": "τ" }
chapters:
  - { t: 0, title: "Embeddings and cosine similarity" }
  - { t: 48, title: "Contrastive learning" }
  - { t: 110, title: "Vector search" }
  - { t: 150, title: "Hybrid retrieval for RAG" }
paragraph_chapters: [0, 0, 1, 2, 3, outro]
---
Welcome to Representation Learning and Retrieval. A good representation turns each input, a sentence, an image or a product, into a vector called an embedding. The space is arranged so that geometry carries meaning: similar things land close together, and unrelated things land far apart. Once you have that, search, clustering and retrieval for language models all come down to comparing vectors.

The standard comparison is cosine similarity: the dot product of two vectors divided by the product of their lengths. It measures the angle between them and ignores how long they are, so it ranges from minus one to one. In practice we normalize every embedding to unit length first, and then cosine similarity is just a dot product.

How do we train such a space without labels? Contrastive learning learns from pairs. CLIP trains an image encoder and a text encoder on images and their captions. Take a batch of N pairs and compare every image with every caption: an N by N grid of cosine similarities, divided by a temperature tau. The matching pairs sit on the diagonal. For each image, a softmax across its row should pick out its own caption from N candidates, which is a cross-entropy with the diagonal as the label. Do the same down the columns, so each caption picks its image, and average the two directions. Every other item in the batch serves as a free negative, which is why bigger batches help. A small temperature sharpens the softmax, and CLIP learns it, starting at zero point zero seven. That's the CLIP Contrastive Loss problem.

With a trained encoder, retrieval is geometry. Embed your documents once and store them. When a query arrives, embed it, normalize it, and score it against every document with a single matrix multiply. Then sort the scores in descending order and keep the top k, breaking exact ties in favour of the lower index so results are reproducible. This brute-force search is exact. Vector databases replace it with approximate nearest neighbour indexes, built from graphs or clusters, that skip most documents and trade a little recall for a lot of speed. You'll build the exact version in Cosine Top-k Embedding Search.

Retrieval-augmented generation puts retrieved passages into a language model's prompt, so the answer can only be as good as what was retrieved. Dense embeddings find paraphrases that share no words, but they can blur rare exact terms, such as names or error codes. Lexical search catches those. BM25 scores a document by summing, over the query terms, an inverse document frequency that rewards rare terms, times a term-frequency factor that saturates: the tenth mention of a word adds far less than the first. The constant k one controls that saturation, and b normalizes for document length, so long documents don't win just by being long. A common recipe uses BM25 to pick a few candidates, then reranks them by mixing each BM25 score, divided by the best candidate's score, with the embedding cosine. That's RAG Retrieval: BM25 plus Embedding Rerank.

Good vectors, a contrastive loss to learn them, and fast ways to search them. Start with the CLIP Contrastive Loss below.
