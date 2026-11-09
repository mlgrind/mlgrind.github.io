---
section: einsum
title: Einstein Summation
target_minutes: 4
caption_replace:
  "b q h d, b k h d arrow b h q k": "bqhd,bkhd→bhqk"
  "b h q k, b k h d arrow b q h d": "bhqk,bkhd→bqhd"
  "b q d, b k d arrow b q k": "bqd,bkd→bqk"
  "b q k, b k v arrow b q v": "bqk,bkv→bqv"
  "i j, i j arrow i j": "ij,ij→ij"
  "i k, k j arrow i j": "ik,kj→ij"
  "i, j arrow i j": "i,j→ij"
  "i j arrow j i": "ij→ji"
  "i j arrow i": "ij→i"
  "i j arrow j": "ij→j"
  "i i arrow i": "ii→i"
  "b q h d": "bqhd"
  "dot T": ".T"
  "d k": "d_k"
paragraph_chapters: [0, 0, 1, 2, 3, 4, outro]
chapters:
  - { t: 0, title: "The one rule" }
  - { t: 60, title: "Products and contractions" }
  - { t: 115, title: "Batches and attention" }
  - { t: 165, title: "Multi-head attention" }
  - { t: 210, title: "Einsum versus the classics" }
---
Welcome to Einstein Summation, usually called einsum. It is a tiny language for describing array operations, and once it clicks, a whole zoo of functions collapses into one. You give every axis a letter, write the letters of the inputs, then an arrow, then the letters you want to keep. And there is only one rule: any letter that disappears after the arrow is summed over.

Take a three by four matrix and call its axes i and j. Writing i j arrow i keeps the rows and sums away j, so you get one total per row. Writing i j arrow j gives one total per column instead. Drop both letters and you sum everything into a single number. Simply reordering the letters, i j arrow j i, gives the transpose. And repeating a letter, i i arrow i, walks along the diagonal, because the row and column index must be equal. These five patterns are the Einsum Fundamentals problem.

Things get powerful with two inputs. When a letter appears in both inputs, their entries are multiplied along that axis. If the letter then disappears, the products are added up. That is called a contraction. Matrix multiplication is i k, k j arrow i j: the shared letter k is multiplied and summed away, leaving i and j. Think of k as the handshake between the two matrices. Keep every letter, i j, i j arrow i j, and you get the element-wise product. Drop them all and you get the sum of all products. Two vectors with different letters, i, j arrow i j, give the outer product, every entry times every entry. You will write all of these in Matrix Operations with Einsum.

Deep learning code is full of batches, and einsum handles them for free. Add a letter b to every input and to the output, and the operation simply runs once per batch element. Attention scores become b q d, b k d arrow b q k. Each query is compared with each key along the feature letter d, which then disappears. Notice that you never had to transpose the keys: the letters say exactly which axes meet. Scale by the square root of d k, take a softmax over k, and then b q k, b k v arrow b q v forms the weighted sum of the values. That is Batch Operations with Einsum.

Multi-head attention adds one more letter. Reshape the model dimension into h heads of size d k, so a query tensor has the letters b q h d. Then b q h d, b k h d arrow b h q k gives a separate score matrix for every head, all in a single call. A second einsum, b h q k, b k h d arrow b q h d, mixes the values and puts the heads back next to their features, so one reshape returns the model dimension. Because the output letters can come in any order, the transposes simply vanish. You will build this in Advanced Einsum Patterns.

Every einsum has a classic twin. Sum with an axis, the at sign, dot T, and the sum of an element-wise product are all einsums in disguise. In Einsum versus Traditional Operations you will compute both versions and check that they agree to floating point precision.

One rule, a handful of letters, and every operation in a transformer. Start with Einsum Fundamentals below.
