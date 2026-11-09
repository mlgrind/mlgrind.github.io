---
section: post-training
title: Post-training and Efficiency
target_minutes: 4
caption_replace: { "int eight": "int8", "Int eight": "Int8", "int thirty-two": "int32", "k three": "k3", "one twenty-seven": "127" }
chapters:
  - { t: 0, title: "From base model to assistant" }
  - { t: 38, title: "Group-relative advantages" }
  - { t: 90, title: "The GRPO objective" }
  - { t: 142, title: "Int8 absmax quantization" }
  - { t: 182, title: "Per-channel scales and int8 matmul" }
paragraph_chapters: [0, 1, 2, 3, 4, outro]
---
Welcome to Post-training and Efficiency. A pretrained language model is a brilliant autocomplete: it continues text, but it doesn't reliably follow instructions or get answers right. Post-training closes that gap. Supervised fine-tuning on example conversations teaches the format. Then preference learning, with a reward model and PPO, or with DPO, nudges the model toward answers people prefer. You practiced those pieces in Reinforcement Learning. This section adds two more: GRPO, the method behind many recent reasoning models, and int eight quantization, which makes the finished model cheap to run.

PPO for language models needs a value network, a critic as big as the policy itself, just to estimate a baseline. GRPO throws the critic away. For each prompt it samples a group of responses, say eight attempts at the same math problem, and scores each one. With a verifiable reward, a checker simply gives one for a correct answer and zero for a wrong one. The baseline is the group's own mean. Each response's advantage is its reward minus the group mean, divided by the group's population standard deviation plus a tiny epsilon. It's grading on a curve: correct answers in a mostly wrong group get a big push up, and wrong answers get pushed down. And if every response gets the same reward, every advantage is zero, so that prompt teaches nothing.

That advantage is shared by every token in its response. For each token, GRPO forms the familiar ratio of new to old probability and takes PPO's clipped surrogate. Then it subtracts beta times an estimate of the KL divergence from the frozen reference model. GRPO uses the k three estimator. Take the log ratio, the reference log-probability minus the policy's. The estimate is e to the log ratio, minus the log ratio, minus one. Unlike a plain difference of log-probabilities, it is never negative. Finally, average over each response's real tokens, using the mask to skip padding, then average over all the responses. That is the objective to maximize, and the loss is its negative. You'll build it in GRPO: Group-Relative Advantages and Objective.

Once a model is trained, serving it is mostly a memory problem. A seven billion parameter model in float32 needs twenty-eight gigabytes just for its weights. Int eight quantization stores each weight in one byte instead of four. The absmax recipe is short. Divide the largest absolute weight by one twenty-seven to get the scale. Divide every weight by the scale, round to the nearest integer, and store the result as int eight. To use a weight, multiply it back by the scale. The largest weight lands exactly on one twenty-seven, and no weight is ever off by more than half a scale step.

One scale for a whole matrix has a weakness. A single outlier stretches the scale, and every small weight gets squeezed into a handful of integer levels. The fix is one scale per output row, called per-channel quantization, so each row uses its own range. To multiply in int eight, quantize each row of the activations too, multiply the integers, accumulating in int thirty-two so nothing overflows, then rescale by both scales. You'll compare the two schemes and build this in Int eight Weight Quantization.

Two problems, one goal: a model that is useful and cheap. Start with GRPO below.
