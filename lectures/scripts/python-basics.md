---
section: python-basics
title: Python Basics for ML
target_minutes: 3.5
chapters:
  - { t: 0, title: "Lists versus arrays" }
  - { t: 50, title: "Summing an array" }
  - { t: 95, title: "Matrix multiplication" }
  - { t: 165, title: "Broadcasting addition" }
---
Welcome to Python Basics for Machine Learning. Python lists are flexible, but they were never designed for arithmetic. Each item in a list is a separate Python object, scattered around memory, and the plus sign on two lists glues them end to end. A NumPy array is one solid block of numbers of the same type, and the plus sign adds them element by element. That single difference is why every machine learning library is built on arrays.

Let's start with the simplest question you can ask an array: what do all of its numbers add up to? In plain Python you would write a loop that keeps a running total, visiting one element at a time. NumPy's sum does the same arithmetic in fast compiled code, in a single call. Watch the running total climb and dip as each value arrives, negative numbers included. The final value is the same either way, but on a million elements the NumPy version is typically dozens of times faster. That is the Array Sum problem, and it is the pattern behind every loss you will compute later: many numbers reduced to one.

Next, matrix multiplication, the workhorse of machine learning. Here is an intuition. Each row of the first matrix is a shopping list, saying how many of each item one shopper wants. Each column of the second matrix is a price list from one store. Multiply a row by a column entry by entry, add up the products, and you get one number: what that shopper would pay at that store. That is a dot product. Do it for every row and every column and you fill the whole result. For this to work, the length of each row must match the length of each column. So a matrix of shape m by n times a matrix of shape n by p gives a result of shape m by p. In NumPy you write this with the at sign. Be careful: a single star multiplies element by element instead, which is a completely different operation. You will implement this in Matrix Multiplication.

Finally, broadcasting addition. Suppose each store also charges a delivery fee, one number per store. We want to add that vector of fees to every row of the bill matrix. You could loop over the rows, but NumPy lets you simply write the matrix plus the vector. The vector has the same length as each row, so NumPy stretches it down the rows for you, without copying any data. This exact move appears in every neural network layer: multiply the inputs by a weight matrix, then add a bias vector to every row. You will write it in Broadcasting Addition.

Three small problems, three ideas you will use everywhere: reduce, multiply and broadcast. Start with Array Sum below.
