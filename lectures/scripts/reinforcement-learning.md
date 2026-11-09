---
section: reinforcement-learning
title: Reinforcement Learning
target_minutes: 4.5
caption_replace: { "TD zero": "TD(0)" }
chapters:
  - { t: 0, title: "Returns and the Bellman equation" }
  - { t: 62, title: "Learning from experience" }
  - { t: 120, title: "Policy gradients" }
  - { t: 172, title: "PPO's clipped objective" }
  - { t: 207, title: "RL from human feedback" }
paragraph_chapters: [0, 0, 1, 2, 3, 4, outro]
---
Welcome to Reinforcement Learning. An agent sees a state, picks an action, and the environment hands back a reward and a new state. Nobody tells the agent the right answer. It has to discover, by trial and error, which actions pay off in the long run. That long run is the discounted return: the reward now, plus gamma times the next reward, plus gamma squared times the one after, and so on. With gamma at 0.9, a reward ten steps away is worth only about a third of the same reward today. You'll compute this in Discounted Return.

The value of a state is the return you expect from there. The Bellman equation says it in one line: a state's value is the expected immediate reward plus gamma times the value of wherever you land next. Value iteration turns that into an algorithm. Sweep over every state, take the action with the best reward plus discounted next value, and repeat. Value spreads backward from the goal like ripples in a pond. That's Bellman Expectation and Value Iteration Step.

Usually we don't know the environment's probabilities, so we learn from samples instead. After one step, the target is the reward plus gamma times the value of the next state. The gap between that target and our current estimate is the TD error, and we move the estimate a fraction alpha of the way. That's TD zero. Q-learning does the same for action values, but its target uses the best action in the next state, so it learns the greedy policy whatever it actually does. SARSA uses the action the agent really takes next, which makes it on-policy and more cautious. Both need exploration, and epsilon-greedy is the simplest: with probability epsilon act randomly, otherwise take the highest Q-value. N-step returns sit in between, adding n real rewards before bootstrapping.

Policy gradient methods skip the values and learn the policy directly. With a softmax policy, the gradient of the log-probability of the chosen action is a one-hot vector for that action, minus the vector of probabilities. REINFORCE scales that by the return that followed, so actions that led to high returns become more likely. Returns are noisy, though, so we subtract a baseline, the state's value, leaving the advantage: how much better this action was than usual. Generalized Advantage Estimation adds up TD errors from later steps, each weighted by gamma times lambda to the power of its distance. Lambda of zero is low variance but biased, and lambda of one gives the full Monte Carlo return.

One oversized step can wreck a good policy, and a bad policy then collects bad data. Proximal Policy Optimization puts a leash on each update. For every action it takes the ratio of the new probability to the old one. The objective is that ratio times the advantage, but with the ratio also clipped between one minus epsilon and one plus epsilon, and we keep the smaller of the two terms. So with epsilon at 0.2, there is nothing to gain by pushing a good action more than twenty percent higher, or a bad one more than twenty percent lower. That's PPO Clipped Objective.

The same tools fine-tune language models from human feedback. First, a reward model learns from pairs of responses where a person picked a winner. Under the Bradley-Terry model, the chance the chosen response wins is the sigmoid of the reward difference, and the loss is the negative log of that chance. Then PPO optimizes the language model against this reward. To stop it gaming the reward model with strange text, each response pays a penalty of beta times its KL divergence from a frozen reference model, the difference in log-probabilities. In the PPO-RLHF Objective the advantage is the reward minus that penalty. Direct Preference Optimization skips the reward model entirely. It scores each response by how much more likely the policy makes it than the reference does, and applies the same sigmoid loss to beta times the chosen score minus the rejected score.

From one-step returns to RLHF, that's fifteen problems. Start with Discounted Return below.
