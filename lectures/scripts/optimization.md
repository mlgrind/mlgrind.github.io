---
section: optimization
title: Optimization and Training
target_minutes: 4
caption_replace: { "six times ten to the minus eight": "6 × 10⁻⁸" }
chapters:
  - { t: 0, title: "From SGD to momentum" }
  - { t: 50, title: "Adam" }
  - { t: 95, title: "Learning-rate schedules" }
  - { t: 125, title: "Gradient clipping" }
  - { t: 170, title: "Mixed precision and loss scaling" }
paragraph_chapters: [0, 0, 1, 2, 3, 4, outro]
---
Welcome to Optimization and Training. A model is only as good as the procedure that fits it. Every training step ends the same way: the backward pass hands you a gradient, and an optimizer turns that gradient into an update for the weights. This lecture is about that update: which direction it points, how big it is, and the tricks that keep long training runs from blowing up.

The simplest optimizer is stochastic gradient descent: subtract the learning rate times the gradient. Now picture a long, narrow valley. The gradient points mostly across the valley, not along it, so plain gradient descent bounces from wall to wall and crawls toward the bottom. Momentum fixes this by keeping a velocity, a decaying sum of past gradients. Like a heavy ball rolling downhill, it builds up speed in directions that stay consistent, while the side to side wobbles cancel out.

Adam goes one step further. It keeps two running averages for every parameter: the mean of the gradients, which is momentum, and the mean of the squared gradients, which tracks how large that parameter's gradients usually are. The step is the first average divided by the square root of the second. Parameters with huge gradients take smaller steps, and parameters with tiny gradients take larger ones, so every direction moves at a similar pace. Both averages start at zero, so early on they are biased toward zero. Bias correction divides each one by one minus beta to the power t, a factor that fades away as training goes on. AdamW also shrinks the weights directly, outside the adaptive step, and it is the default for transformers.

The learning rate is the most important hyperparameter, and it rarely stays constant. A typical schedule starts with a linear warmup from zero, because in the first steps the weights are random and Adam's statistics are still noisy. Then it decays, often along a cosine curve, down to a small floor, so the model can settle into a minimum instead of bouncing around it. You practice momentum, Adam and schedules in the PyTorch Basics section.

Even with a good schedule, one bad batch can produce a gradient many times larger than usual, and a single step can throw the weights far away. You see it as a spike in the loss curve. Gradient clipping by global norm caps the size of that step. Treat the gradients of every parameter as one long vector and measure its length: square every element, add them all up, and take the square root. If that norm is above a maximum, often one, multiply every gradient by the maximum divided by the norm. Every gradient keeps its direction, and only the overall length shrinks. That's the Gradient Clipping by Global Norm problem.

Finally, mixed precision. Training in sixteen bit floats halves the memory and speeds up the math, but the range is narrow. Anything smaller than about six times ten to the minus eight rounds to zero, and many gradients are that small. So we multiply the loss by a large scale before the backward pass. Every gradient grows by the same factor, lifts out of the underflow zone, and is divided back down before the optimizer step. But if the scale is too large, some gradient overflows to infinity. Dynamic loss scaling adapts. When a step overflows, skip the update and halve the scale. After a run of clean steps, double it again. The scale hovers just below the point of overflow. You will simulate this in Dynamic Loss Scaling.

Get these two tricks right and long runs stay stable. Start with Gradient Clipping by Global Norm below.
