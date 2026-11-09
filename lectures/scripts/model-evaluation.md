---
section: model-evaluation
title: Model Evaluation
target_minutes: 4
chapters:
  - { t: 0, title: "Accuracy and the confusion matrix" }
  - { t: 70, title: "Thresholds and the PR curve" }
  - { t: 112, title: "ROC and AUC" }
  - { t: 160, title: "Calibration" }
  - { t: 196, title: "K-fold cross-validation" }
paragraph_chapters: [0, 0, 1, 2, 3, 4, outro]
first_problem: { id: precision-recall-f1, title: Precision and Recall }
---
Welcome to Model Evaluation. Building a model is only half the job. The other half is knowing whether it actually works. Imagine a screening test for a rare disease, where only five people in a hundred are sick. A lazy model that says "healthy" to everyone is right ninety-five percent of the time. Its accuracy looks great, and it is useless. Accuracy is simply the fraction of predictions that are correct, and you'll compute it in Accuracy Score, but on imbalanced data it hides exactly the mistakes you care about.

So we sort every prediction into four boxes, called the confusion matrix. True positives are sick people we flagged. False positives are healthy people we flagged. False negatives are sick people we missed, and true negatives are everyone else. Precision asks: of everyone we flagged, how many were really sick? That's true positives divided by true positives plus false positives. Recall asks: of everyone who was sick, how many did we find? That's true positives divided by true positives plus false negatives. The lazy model has a recall of zero. You'll build both in Precision and Recall.

Most classifiers don't output a label. They output a score, and you choose a threshold: everything scoring at or above it is called positive. Lower the threshold and you catch more positives, so recall climbs, but more false alarms slip in, so precision usually falls. Sweep the threshold over every distinct score, from high to low, and you trace the precision-recall curve. To pick one point, use the F1 score, the harmonic mean of precision and recall. The harmonic mean punishes imbalance, so a model with perfect recall and poor precision still gets a low F1. Finding the threshold with the best F1 is the Precision-Recall Curve problem.

The ROC curve sweeps the same thresholds but plots something else: the true positive rate, which is recall, against the false positive rate, the fraction of negatives we wrongly flag. It starts at zero, zero, where nothing is flagged, and ends at one, one, where everything is. The area under it, the AUC, has a lovely meaning. It is the probability that a randomly chosen positive scores higher than a randomly chosen negative. A random guesser gets one half, and a perfect ranker gets one. Watch out for ties. Samples that share a score cross the threshold together, so the curve takes one diagonal step, and in the probability view a tie counts as one half. That's the ROC Curve and AUC problem.

Ranking well is not the same as being honest about confidence. A model is calibrated if, among all the predictions it makes with eighty percent confidence, about eighty percent turn out to be correct. Modern neural networks are often overconfident. To measure this, group the predictions into equal-width confidence bins, and in each bin compare the average confidence with the actual accuracy. The expected calibration error is the average gap, weighted by how many predictions fall in each bin. Zero means perfectly calibrated. You'll compute it in Expected Calibration Error.

Finally, every one of these numbers is only as trustworthy as the data you measure it on. A single train and test split can be lucky or unlucky. K-fold cross-validation cuts the data into k nearly equal folds. Each fold takes one turn as the validation set while the other k minus one folds train the model, and you average the k scores. When the samples don't divide evenly, the first few folds get one extra sample. Every point is validated exactly once, which gives a much steadier estimate. You'll generate these splits in K-Fold Split Indices.

Metrics are how you tell a model that works from one that only looks good. Start with Precision and Recall below.
