---
section: generative-models
title: Generative Models
target_minutes: 4.5
caption_replace: { "x t": "x_t" }
chapters:
  - { t: 0, title: "KL divergence" }
  - { t: 45, title: "Variational autoencoders" }
  - { t: 110, title: "VQ-VAE" }
  - { t: 140, title: "Diffusion" }
  - { t: 205, title: "Guidance and flow matching" }
paragraph_chapters: [0, 0, 1, 2, 3, 4, outro]
---
Welcome to Generative Models. A generative model learns a distribution, so it can draw new samples that look like the training data.

To train one, we need a way to say how different two distributions are, and the workhorse is the KL divergence. The KL divergence of P from Q is the expected extra surprise when you describe samples from P using Q. For two Gaussians it has a closed form: the log of sigma q over sigma p, plus the variance of P plus the squared gap between the means, all over twice the variance of Q, minus one half. It is never negative, it is zero only when the two distributions match, and it is not symmetric: swapping P and Q gives a different number. That's KL Divergence.

A variational autoencoder compresses each input into a distribution rather than a single point. The encoder outputs a mean and a log variance for every latent dimension; we sample a latent code and decode it back into an input. But you can't backpropagate through a random draw. The reparameterization trick moves the randomness outside: draw epsilon from a standard normal, then set z to mu plus sigma times epsilon. Now z is a plain function of mu and sigma, and gradients flow through both. The loss has two terms. Reconstruction error asks the output to match the input. The KL term, minus one half times the sum of one plus the log variance, minus mu squared, minus the variance, pulls each code toward a standard normal, so that sampling from that prior later gives sensible outputs. You'll build both parts in VAE Reparameterization Trick and VAE Loss Function.

A VQ-VAE makes the latent space discrete instead. It keeps a codebook of learned vectors. Each encoder output is replaced by its nearest codebook entry, measured by squared distance, so an image becomes a grid of integer codes, the kind of tokens a transformer can model. Picking the nearest entry has no gradient, so training copies the gradient straight through from the quantized vector to the encoder output, and two extra losses pull the codebook and the encoder toward each other. That's VQ-VAE Vector Quantization.

Diffusion models take another route: destroy data with noise, then learn to undo it. A noise schedule sets a small beta for every step, rising linearly from beta start to beta end. Alpha is one minus beta, and alpha bar, the running product of the alphas, says how much of the original signal survives. Thanks to that product, we can jump straight to any step: x t equals the square root of alpha bar times the clean data, plus the square root of one minus alpha bar times fresh Gaussian noise. By the last step, almost nothing of the data remains. A network learns to predict the noise, and one reverse step of DDPM subtracts a scaled copy of that prediction, divides by the square root of alpha, and adds a little fresh noise, except at the final step. That covers the Diffusion Noise Schedule, the Diffusion Forward Process and the DDPM Reverse Sampling Step.

To follow a prompt more closely, classifier-free guidance runs the network twice, with and without the condition, and extrapolates: the unconditional prediction plus w times the difference. A guidance scale of one is plain conditioning, and larger values trade diversity for fidelity. Flow matching simplifies things further. Draw noise and a data point, mix them along a straight line at a random time t, and train a network to predict the constant velocity, data minus noise. Sampling integrates that velocity with a few Euler steps, and if the paths are truly straight, a single step lands on the data. Those are Classifier-Free Guidance and Flow Matching.

Measure distributions, compress them, then noise and denoise. Start with KL Divergence below.
