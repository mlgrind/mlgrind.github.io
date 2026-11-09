---
section: unsupervised-learning
title: Unsupervised Learning
target_minutes: 4
chapters:
  - { t: 0, title: "K-means" }
  - { t: 55, title: "Seeding and convergence" }
  - { t: 95, title: "Principal component analysis" }
  - { t: 140, title: "Gaussian mixtures and EM" }
  - { t: 185, title: "DBSCAN" }
paragraph_chapters: [0, 0, 1, 2, 3, 4, outro]
caption_replace: { "k-means plus plus": "k-means++", "log-sum-exp": "logsumexp" }
---
Welcome to Unsupervised Learning. This time there are no labels, just a cloud of data, and the goal is to discover its structure: which points belong together, and which directions really matter.

The workhorse of clustering is k-means. Pick k centroids, then repeat two steps. First, assign every point to its nearest centroid, using Euclidean distance. Second, move each centroid to the mean of the points assigned to it. Think of k food trucks in a park: every visitor walks to the nearest truck, then each truck drives to the middle of its crowd, and the crowds shift again. Each round can only lower the inertia, the total squared distance from points to their centroids, so the loop settles down. You'll write the assignment step in K-Means: Assign to Nearest Centroid.

Where the centroids start matters a lot. A bad start can put two centroids inside one cluster and leave another cluster with none. K-means plus plus fixes this by spreading them out: the first centroid is a random point, and each next one is drawn with probability proportional to its squared distance from the nearest centroid chosen so far. Then we iterate until the labels stop changing or the centroids barely move, and if a cluster ever ends up empty, we move it onto the point farthest from its centroid. That's K-Means from Scratch.

Clustering groups the rows of our data. Principal component analysis looks at the columns instead, and finds the directions along which the data varies most. First, center the data by subtracting each feature's mean. Then compute the covariance matrix and its eigenvectors. The eigenvector with the largest eigenvalue is the first principal component, the long axis of the cloud, and its eigenvalue is the variance along it. Like choosing the angle for a photo of a sculpture, projecting onto the top components keeps as much of the shape as possible in fewer dimensions. Centering comes first, and it's the PCA: Center Data problem.

K-means makes hard choices: every point belongs to exactly one cluster. A Gaussian mixture is softer. It models the data as a weighted sum of bell curves, and fits them with expectation maximization. The E-step gives every point a responsibility for every component, the probability that the component generated it, computed in log space with log-sum-exp so faraway points don't underflow. The M-step re-estimates each component's weight, mean and variance from those soft counts. Each round never lowers the log-likelihood. You'll build both steps in Gaussian Mixture Model.

Finally, DBSCAN finds clusters as dense regions, with no k to choose. Two settings define density: a radius, eps, and a count, min samples. A core point has at least min samples points within eps, counting itself. Clusters grow outward from core points, border points join them without spreading them further, and anything left over is labelled noise. That lets DBSCAN trace clusters of any shape, like crescents, and flag outliers for free. That's the DBSCAN Clustering problem.

Groups, directions, densities: that's the toolkit for unlabeled data. Start with K-Means: Assign to Nearest Centroid below.
