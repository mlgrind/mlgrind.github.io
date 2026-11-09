---
section: cnn
title: CNNs and Computer Vision
target_minutes: 4.5
caption_replace: { "p t": "p_t" }
chapters:
  - { t: 0, title: "Sliding a filter" }
  - { t: 62, title: "Padding, stride and channels" }
  - { t: 112, title: "Pooling, flatten and residual blocks" }
  - { t: 160, title: "Boxes: IoU, NMS and Smooth L1" }
  - { t: 210, title: "Focal loss and segmentation" }
paragraph_chapters: [0, 1, 2, 3, 4, outro]
---
Welcome to CNNs and Computer Vision. An image is a grid of numbers, and the patterns that matter, like an edge or a corner, are small and can show up anywhere. A convolutional layer uses both facts. It slides a small grid of weights, called a kernel, across the image. At each position it multiplies the kernel with the patch underneath, element by element, and adds everything up into a single output number. Think of a flashlight sweeping over a page, with the same lens checking every spot for the same pattern. Because the weights are shared across positions, a three by three kernel has just nine weights, however big the image is. Strictly speaking, this is cross-correlation, because the kernel isn't flipped, and it's what every deep learning library computes. You'll write it with two loops in the 2D Convolution problem.

With no padding and a stride of one, a kernel of size k shrinks the output by k minus one. Padding adds a border of zeros so the kernel can sit on the edges, and the stride is how far the kernel jumps between positions. The output size is the input size, minus the kernel size, plus twice the padding, divided by the stride and rounded down, plus one. So a 32 pixel input with a five by five kernel, a padding of two and a stride of two gives 16. Real layers also have channels: every output channel has its own kernel that spans all the input channels. Groups split the channels into independent blocks, and with one group per channel you get the depthwise convolution used in MobileNet. That's Convolution Output Size and Advanced 2D Convolution.

Max pooling shrinks a feature map by keeping only the largest value in each two by two window, moving with a stride of two. It halves the height and the width, and a small shift of the input barely changes the result. After a few rounds of convolution and pooling, Flatten turns each example's feature map into one long vector for the fully connected layers, keeping the batch dimension. Very deep stacks used to train worse than shallow ones, until ResNet added skip connections. A residual block computes convolution, batch norm, ReLU, convolution and batch norm, then adds its input back before the final ReLU. If the identity is the best it can do, the block only has to push its weights toward zero. You'll build Max Pooling, Flatten Layer and the ResNet Basic Block.

Now for detection: finding objects and drawing boxes around them. To compare two boxes we use Intersection over Union: the area where they overlap, divided by the area they cover together. Identical boxes score one, and boxes that don't touch score zero. A detector fires many overlapping boxes for the same object, so Non-Maximum Suppression cleans them up. Sort the boxes by confidence, keep the best one, delete every remaining box whose IoU with it is above a threshold such as one half, and repeat. To train the box coordinates, detectors use the Smooth L1 loss: quadratic for small errors and linear for large ones, so one wild prediction can't dominate the gradient.

Detectors also face extreme class imbalance, with thousands of easy background boxes for every real object. Focal loss multiplies the cross-entropy by one minus p t, raised to the power gamma, where p t is the probability the model gives the true class. Confident, easy examples are scaled almost to zero, so training focuses on the hard ones. Finally, segmentation labels every pixel. Pixel accuracy counts the pixels you got right, but a small object can hide behind a sea of background. IoU and the Dice coefficient look only at the object. Dice is twice the overlap divided by the total size of both masks, and it always equals two IoU over one plus IoU. These are the Focal Loss and Segmentation Metrics problems.

That's the core toolkit of computer vision, from a single filter to a full detection pipeline. Start with Convolution Output Size below.
