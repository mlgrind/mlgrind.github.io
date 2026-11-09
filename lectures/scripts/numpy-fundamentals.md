---
section: numpy-fundamentals
title: Thinking in Arrays
replica: default
target_minutes: 3.5
chapters:
  - { t: 0, title: "Why arrays?" }
  - { t: 37, title: "Creating arrays" }
  - { t: 74, title: "Indexing and slicing" }
  - { t: 118, title: "Broadcasting" }
  - { t: 165, title: "Aggregations and reshaping" }
---
Welcome to NumPy Fundamentals. Almost every piece of machine learning code you will ever read, from a tiny linear regression to a giant transformer, is really just a sequence of operations on arrays of numbers. NumPy is the library that makes those operations fast and expressive. The big shift in this section is learning to think about whole arrays at once, instead of looping over one number at a time. Picture the difference between painting a wall with a roller and painting it with a toothbrush.

Let's start with creating arrays. You can build one from a Python list, but more often you will ask NumPy for an array of a given shape. Zeros gives you a grid filled with zeros, and ones a grid filled with ones. A range counts up from zero, stopping just before the end you give it. Linspace spreads a fixed number of points evenly between two endpoints, both included. And eye builds an identity matrix, with ones on the diagonal. In the Array Creation Methods problem, you will practice each of these and check the shapes you get back. Shape is the single most important property of an array, so get in the habit of asking what shape you expect before you run anything.

Next comes indexing. Take the numbers zero to nineteen arranged as four rows of five. A single index picks out a row. A colon followed by an index picks out a column. Two slices cut out a rectangular block, like rows one to two and columns two to four, and remember that a slice stops just before its end. Fancy indexing goes further: pass lists of positions and you can pick any cells you like, such as the main diagonal. And a step of minus one walks backwards, which reverses the order of the rows. You will put all of this to work in Advanced Indexing.

Then we reach broadcasting, the feature that surprises people most. When you combine two arrays of different shapes, NumPy lines their shapes up from the right. Wherever one array has a size of one, or is missing that dimension entirely, it is quietly stretched to match the other. So adding a bias of four values to a three by four matrix adds that row to every one of the three rows. It is like stamping the same pattern down each line of a page. The same rule works sideways. To center each row, compute the row means with keep dims, so they come back as a column of shape three by one, and subtract. Each mean is stretched across its own row. Broadcasting Operations will make this feel natural.

Finally, aggregations and reshaping. Functions like sum, mean, standard deviation and arg max can work over the whole array or along a single axis. Choosing the axis means choosing which dimension collapses. Sum with axis zero and the rows collapse, leaving one total per column. Sum with axis one and you get one total per row. Arg max returns a flat position, and unravel index turns it back into a row and a column. Reshape pours the same numbers, in the same order, into a new grid, and transpose swaps the axes, turning rows into columns. You will practice these in Aggregation Functions and in Reshape and Transpose.

These five skills come back in every section that follows. Start with Array Creation Methods below.
