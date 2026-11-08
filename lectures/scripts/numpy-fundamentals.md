---
section: numpy-fundamentals
title: Thinking in Arrays
replica: default
target_minutes: 3
chapters:
  - { t: 0, title: "Why arrays?" }
  - { t: 37, title: "Creating arrays" }
  - { t: 74, title: "Indexing and masks" }
  - { t: 106, title: "Broadcasting" }
  - { t: 145, title: "Aggregations and reshaping" }
---
Welcome to NumPy Fundamentals. Almost every piece of machine learning code you will ever read, from a tiny linear regression to a giant transformer, is really just a sequence of operations on arrays of numbers. NumPy is the library that makes those operations fast and expressive. The big shift in this section is learning to think about whole arrays at once, instead of looping over one number at a time. Picture the difference between painting a wall with a roller and painting it with a toothbrush.

Let's start with creating arrays. You can build one from a Python list, but more often you will ask NumPy for an array of a given shape filled with zeros, filled with ones, counting up through a range, or forming an identity matrix. In the Array Creation Methods problem, you will practice each of these and check the shapes you get back. Shape is the single most important property of an array, so get in the habit of asking what shape you expect before you run anything.

Next comes indexing. Basic slicing lets you grab a row, a column, or a rectangular block. Advanced indexing goes further: you can pass a list of positions to pick out specific rows, or pass a true or false mask to keep only the elements that meet a condition, like every value greater than zero. Think of a mask as a stencil laid over your data. You will put this to work in Advanced Indexing.

Then we reach broadcasting, the feature that surprises people most. When you combine two arrays of different shapes, NumPy lines their shapes up from the right. Wherever one array has a size of one, or is missing that dimension entirely, it is quietly stretched to match the other. So adding a row of four values to a three by four matrix adds that row to every one of the three rows. It is like stamping the same pattern down each line of a page. Broadcasting Operations will make this feel natural.

Finally, aggregations and reshaping. Functions like sum, mean, standard deviation and arg max can work over the whole array or along a single axis. Choosing the axis means choosing which dimension collapses: sum over rows and you are left with one number per column. Reshape rearranges the same numbers into a new grid without changing them, and transpose swaps the axes, turning rows into columns. You will practice these in Aggregation Functions and in Reshape and Transpose.

These five skills come back in every section that follows. Start with Array Creation Methods below.
