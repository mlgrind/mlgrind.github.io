---
section: data-preprocessing
title: Data Preprocessing
target_minutes: 4
chapters:
  - { t: 0, title: "Feature scaling" }
  - { t: 62, title: "Missing values" }
  - { t: 100, title: "One-hot encoding" }
  - { t: 136, title: "Stratified splits" }
  - { t: 172, title: "Leakage-safe preprocessing" }
paragraph_chapters: [0, 0, 1, 2, 3, 4, outro]
caption_replace: { "is nan": "isnan", "nan mean": "nanmean" }
---
Welcome to Data Preprocessing. Models learn from numbers, and real data rarely arrives as clean, comparable numbers. Some values are missing, features are measured in wildly different units, and categories come as words. Garbage in, garbage out: preprocessing is how we turn raw columns into something a model can actually learn from.

Start with scale. Imagine one feature is age, measured in tens of years, and another is income, measured in tens of thousands of dollars. Plot them on the same scale and age disappears completely. Any method that measures distances or takes gradient steps will be dominated by income, simply because its numbers are bigger. Min-max normalization fixes this. Subtract the minimum and divide by the range, the maximum minus the minimum. The smallest value becomes zero, the largest becomes one, and everything else keeps its relative position in between. That's the Normalize Features problem. A close cousin is standardization: subtract the mean and divide by the standard deviation, so every feature ends up with mean zero and a spread of one.

Next, missing values. In NumPy a gap is usually stored as NaN, which stands for not a number, and it poisons arithmetic: add anything to NaN and you get NaN. So first find the gaps with is nan, which returns a true or false mask. Then decide what to do. You could drop those entries, but that throws away good data. A simple alternative is to fill each gap with the mean of the values you did observe, which nan mean computes by skipping the gaps. In Handle Missing Data you'll build exactly this, on a copy, so the original array is left untouched.

Categories need a different treatment. Suppose a column holds colors, coded as zero for red, one for green and two for blue. Feed those integers straight into a linear model and it will believe that blue is twice green, and that green sits halfway between red and blue. One-hot encoding removes that false ordering. Each label becomes a vector with one slot per class: a one in its own slot and zeros everywhere else. A neat trick is to take the identity matrix and pick out its rows using the labels as indices. That's the One-Hot Encoding problem.

Before training, we split the data: a training set to fit on, a validation set to tune on, and a test set we look at only once, at the very end. A purely random split can go wrong when one class is rare. With only six examples of a class, an unlucky shuffle can leave none of them in the test set. A stratified split shuffles and splits each class separately, rounding its share half up, so every split keeps roughly the class proportions of the whole dataset. You'll implement this in Stratified Train, Validation and Test Split.

The last idea catches out even experienced engineers: data leakage. If you compute fill values, means and standard deviations on the whole dataset before splitting, the test rows quietly shape the training data, and your offline score looks better than it will ever be in production. The fix is a simple rule. Fit every statistic on the training split only, then apply those same numbers to both splits. It's like setting the exam before anyone has seen the answers. In Leakage-Safe Imputation and Scaling, you'll fill gaps with training medians, then standardize with the training mean and population standard deviation.

Clean inputs make every model in the rest of this course work better. Start with Normalize Features below.
