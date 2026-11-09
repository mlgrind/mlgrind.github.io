---
section: supervised-learning
title: Supervised Learning
target_minutes: 4.5
chapters:
  - { t: 0, title: "Linear regression and gradient descent" }
  - { t: 70, title: "Logistic regression" }
  - { t: 120, title: "Hinge loss and SVMs" }
  - { t: 155, title: "Trees, bagging and boosting" }
  - { t: 200, title: "Neighbours and Naive Bayes" }
paragraph_chapters: [0, 0, 1, 2, 3, 4, outro]
caption_replace: { "log-sum-exp": "logsumexp" }
---
Welcome to Supervised Learning. You are given examples with the right answers attached, like house sizes with their prices, and the job is to learn a function that predicts the answer for examples you haven't seen yet. In this section you'll build the classic algorithms from scratch.

The simplest is linear regression: predict y as w times x, plus b. We measure how wrong the line is with the mean squared error, then improve it with gradient descent. Picture standing on a foggy hillside. You can't see the valley, but you can feel which way is downhill, so you take a small step that way and repeat. Here the gradient for w is two over n, times the sum of each error times x, and for b it's the same without the x. Every step nudges the line toward the data. That's Linear Regression with Gradient Descent. In Ridge and Lasso you'll add a penalty on the weights: ridge shrinks them all smoothly, while lasso pushes some of them to exactly zero.

For yes or no questions we want probabilities. Logistic regression computes the same weighted sum, then passes it through the sigmoid, one over one plus e to the minus z, which squashes any number into the range zero to one. A score of zero maps to exactly one half, and that is where the decision boundary sits. Training minimizes binary cross-entropy, the negative log of the probability given to the true label, averaged over the samples. Being confident and wrong is punished hard. Conveniently, the gradient is just X transposed times the prediction errors, divided by m. You'll build this in three steps: Sigmoid Function, Binary Cross-Entropy Loss, and Logistic Regression with Gradient Descent.

Support vector machines ask for more than the right side of the line. With labels of plus or minus one, the hinge loss is the maximum of zero and one minus the label times the score. A point on the correct side with a margin of at least one costs nothing. A point inside the margin, or on the wrong side, costs more the further it strays. So only the points near the boundary, the support vectors, shape the answer. An L2 penalty on the weights keeps them small, which makes the margin wide. That's Hinge Loss, then Linear SVM.

Decision trees take a different path: a sequence of yes or no questions. At each node we try every feature and threshold, and keep the split that leaves the children purest, measured by Gini impurity: one minus the sum of the squared class proportions. A pure node scores zero, and a fifty-fifty node scores one half. A single deep tree overfits, so we combine many. Bagging trains trees on bootstrap samples and takes a majority vote. Boosting adds small trees one at a time, each one fit to the residuals the model still gets wrong. You'll find these in Gini Impurity, Decision Tree Classifier with Bagging, and Gradient Boosting with Stumps.

Two more ideas round out the toolkit. K-nearest neighbours doesn't train at all: to classify a point, find the k closest training points and take a majority vote. Gaussian Naive Bayes models each feature as a bell curve per class, assumes the features are independent given the class, and applies Bayes' rule. Multiplying hundreds of small densities underflows to zero, so we add log densities instead and normalize with log-sum-exp. Both are waiting for you, in the k-Nearest Neighbours Classifier and Gaussian Naive Bayes problems.

That's twelve problems built from a few shared ideas: a model, a loss, and a way to fit it. Start with the Sigmoid Function below.
