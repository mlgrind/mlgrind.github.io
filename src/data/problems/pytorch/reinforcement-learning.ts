import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../reinforcement-learning.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const reinforcementLearningPyTorch: Record<string, LanguageVariant> = {
  'rl-discounted-return': {
    note: 'Vectorize with torch.arange (no Python loop needed). Inputs are tensors; return a Python float rounded to 3 decimals.',
    starterCode: `import torch

def discounted_return(rewards: torch.Tensor, gamma: float) -> float:
    """
    Calculate the discounted return G_0.

    Args:
        rewards: (T,) tensor of rewards [r_0, r_1, ..., r_{T-1}]
        gamma: discount factor in [0, 1]

    Returns:
        G_0 = sum_k gamma**k * r_k as a Python float, rounded to 3 decimals
    """
    rewards = rewards.double()
    # Your code here
    pass
`,
    solution: `import torch

def discounted_return(rewards: torch.Tensor, gamma: float) -> float:
    rewards = rewards.double()
    T = rewards.shape[0]

    # Discount weights [gamma^0, gamma^1, ..., gamma^(T-1)]
    discounts = gamma ** torch.arange(T, dtype=torch.float64)

    G = (rewards * discounts).sum()
    return round(G.item(), 3)

# Time O(T), space O(T)
`,
    testCases: [
      {
        id: '1',
        description: 'Constant rewards',
        input: 'discounted_return(torch.tensor([1.0, 1.0, 1.0, 1.0]), 0.9)',
        expected: '3.439',
        hidden: false,
      },
      {
        id: '2',
        description: 'Delayed reward',
        input: 'discounted_return(torch.tensor([0.0, 0.0, 0.0, 10.0]), 0.5)',
        expected: '1.25',
        hidden: false,
      },
      {
        id: '3',
        description: 'No discount (gamma = 1) is the plain sum',
        input: 'discounted_return(torch.tensor([1.0, 2.0, 3.0, 4.0]), 1.0)',
        expected: '10.0',
        hidden: false,
      },
      {
        id: '4',
        description: 'gamma = 0 keeps only the immediate reward',
        input: 'discounted_return(torch.tensor([5.0, 10.0, 15.0]), 0.0)',
        expected: '5.0',
        hidden: true,
      },
      {
        id: '5',
        description: 'Mixed-sign rewards',
        input: 'discounted_return(torch.tensor([1.0, -2.0, 3.0, -4.0, 5.0]), 0.8)',
        expected: '1.32',
        hidden: true,
      },
    ],
    hints: [
      'Each reward is weighted by gamma raised to how many steps in the future it arrives.',
      'Build one weight per timestep, multiply element-wise with the rewards, and sum.',
      'gamma ** torch.arange(T, dtype=torch.float64) gives [γ⁰, γ¹, ...]; then (rewards * discounts).sum().item().',
      'The first reward has exponent 0, and return a Python float (use .item()), rounded to 3 decimals.',
    ],
  },

  'rl-epsilon-greedy': {
    note: 'Use torch.argmax for the greedy action and return a Python int (not a 0-d tensor).',
    starterCode: `import torch

def epsilon_greedy(q_values: torch.Tensor, epsilon: float,
                   random_value: float) -> int:
    """
    Select an action with the epsilon-greedy policy.

    Args:
        q_values: (n_actions,) tensor of Q-values
        epsilon: exploration probability in [0, 1]
        random_value: pre-drawn uniform number in [0, 1), for deterministic tests

    Returns:
        Selected action index (Python int)
    """
    n_actions = q_values.shape[0]

    # Your code here
    pass
`,
    solution: `import torch

def epsilon_greedy(q_values: torch.Tensor, epsilon: float,
                   random_value: float) -> int:
    n_actions = q_values.shape[0]

    if random_value < epsilon:
        # Explore: map the uniform draw to an action index
        return int(random_value * n_actions)
    # Exploit: greedy action
    return int(torch.argmax(q_values).item())
`,
    testCases: [
      {
        id: '1',
        description: 'Exploit (greedy)',
        input: 'epsilon_greedy(torch.tensor([1.0, 3.0, 2.0]), 0.1, 0.5)',
        expected: '1',
        hidden: false,
      },
      {
        id: '2',
        description: 'Explore',
        input: 'epsilon_greedy(torch.tensor([1.0, 3.0, 2.0]), 0.9, 0.5)',
        expected: '1',
        hidden: false,
      },
      {
        id: '3',
        description: 'Always exploit (epsilon = 0)',
        input: 'epsilon_greedy(torch.tensor([5.0, 2.0, 8.0, 1.0]), 0.0, 0.99)',
        expected: '2',
        hidden: false,
      },
      {
        id: '4',
        description: 'Explore with a low random value',
        input: 'epsilon_greedy(torch.tensor([1.0, 2.0, 3.0, 4.0]), 0.5, 0.2)',
        expected: '0',
        hidden: true,
      },
      {
        id: '5',
        description: 'Explore picks floor(random_value * n_actions)',
        input: 'epsilon_greedy(torch.tensor([9.0, 0.0, 0.0, 0.0, 0.0]), 1.0, 0.75)',
        expected: '3',
        hidden: true,
      },
      {
        id: '6',
        description: 'random_value == epsilon exploits',
        input: 'epsilon_greedy(torch.tensor([2.0, 5.0, 1.0]), 0.4, 0.4)',
        expected: '1',
        hidden: true,
      },
    ],
    hints: [
      'There are only two branches: explore or exploit. What decides which one runs?',
      'Compare random_value with epsilon first, then compute the action for that branch.',
      'Explore: int(random_value * n_actions). Exploit: int(torch.argmax(q_values).item()).',
      'Return a plain int, not a tensor, and use a strict < so random_value == epsilon exploits.',
    ],
  },

  'rl-bellman-value': {
    note: "Gather V(s') with tensor indexing (next_values[next_states]) and take the probability-weighted sum. Return a Python float rounded to 2 decimals.",
    starterCode: `import torch

def bellman_value(transitions: list, gamma: float,
                  next_values: torch.Tensor) -> float:
    """
    Compute V(s) with the Bellman expectation equation.

    Args:
        transitions: list of (probability, reward, next_state_index) tuples
        gamma: discount factor
        next_values: (n_states,) tensor of current estimates V(s')

    Returns:
        V(s) = sum_i p_i * (r_i + gamma * V[s'_i]) as a Python float, rounded to 2 decimals
    """
    next_values = next_values.double()
    # Your code here
    pass
`,
    solution: `import torch

def bellman_value(transitions: list, gamma: float,
                  next_values: torch.Tensor) -> float:
    next_values = next_values.double()

    probs = torch.tensor([float(p) for p, _, _ in transitions], dtype=torch.float64)
    rewards = torch.tensor([float(r) for _, r, _ in transitions], dtype=torch.float64)
    next_states = torch.tensor([s for _, _, s in transitions])

    # V(s) = sum_i p_i * (r_i + gamma * V(s'_i))
    value = (probs * (rewards + gamma * next_values[next_states])).sum()
    return round(value.item(), 2)
`,
    testCases: [
      {
        id: '1',
        description: 'Two transitions',
        input: 'bellman_value([(0.5, 1, 0), (0.5, 2, 1)], 0.9, torch.tensor([5.0, 10.0]))',
        expected: '8.25',
        hidden: false,
      },
      {
        id: '2',
        description: 'Deterministic transition',
        input: 'bellman_value([(1.0, 5, 0)], 0.9, torch.tensor([10.0]))',
        expected: '14.0',
        hidden: false,
      },
      {
        id: '3',
        description: 'Three outcomes',
        input: 'bellman_value([(0.2, 0, 0), (0.5, 1, 1), (0.3, 2, 2)], 0.9, torch.tensor([0.0, 5.0, 10.0]))',
        expected: '6.05',
        hidden: true,
      },
      {
        id: '4',
        description: 'Repeated next state with different rewards',
        input: 'bellman_value([(0.25, 4, 1), (0.75, -1, 1)], 0.5, torch.tensor([100.0, 2.0]))',
        expected: '1.25',
        hidden: true,
      },
      {
        id: '5',
        description: 'gamma = 0 gives the expected immediate reward',
        input: 'bellman_value([(0.5, 3, 0), (0.5, 7, 1)], 0.0, torch.tensor([100.0, 200.0]))',
        expected: '5.0',
        hidden: true,
      },
    ],
    hints: [
      'V(s) is an expectation: a probability-weighted average over the possible outcomes.',
      'Turn the list of tuples into three tensors: probabilities, rewards and next-state indices.',
      'next_values[next_states] gathers V(s\') for every outcome; then (probs * (rewards + gamma * v_next)).sum().item().',
      'Discount only V(s\'), not the reward, and keep the index tensor an integer dtype so it can index.',
    ],
  },

  'rl-q-learning-update': {
    note: "Index the Q-table tensor directly. Don't modify the input: work on Q.clone(). Return the updated tensor; tests compare with a tolerance, so rounding is optional here.",
    starterCode: `import torch

def q_learning_update(Q: torch.Tensor, state: int, action: int,
                      reward: float, next_state: int,
                      alpha: float, gamma: float) -> torch.Tensor:
    """
    Perform one Q-learning update.

    Args:
        Q: (n_states, n_actions) Q-table tensor
        state: current state index s
        action: action taken a
        reward: reward received r
        next_state: next state index s'
        alpha: learning rate
        gamma: discount factor

    Returns:
        Updated (n_states, n_actions) Q-table (a new tensor; the input is unchanged)
    """
    Q = Q.clone().float()
    # Your code here
    pass
`,
    solution: `import torch

def q_learning_update(Q: torch.Tensor, state: int, action: int,
                      reward: float, next_state: int,
                      alpha: float, gamma: float) -> torch.Tensor:
    Q = Q.clone().float()  # never mutate the caller's table

    # Bellman optimality target: bootstrap from the best next action (off-policy)
    td_target = reward + gamma * Q[next_state].max()
    td_error = td_target - Q[state, action]
    Q[state, action] += alpha * td_error
    return Q
`,
    testCases: [
      {
        id: '1',
        description: 'Simple update',
        input: 'bool(torch.allclose(q_learning_update(torch.zeros(2, 2), 0, 1, 1.0, 1, 0.1, 0.9), torch.tensor([[0.0, 0.1], [0.0, 0.0]])))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'With existing values: Q[0, 0] = 1 + 0.5 * (5 + 0.9 * 4 - 1)',
        input: 'round(q_learning_update(torch.tensor([[1.0, 2.0], [3.0, 4.0]]), 0, 0, 5.0, 1, 0.5, 0.9)[0, 0].item(), 4)',
        expected: '4.8',
        hidden: false,
      },
      {
        id: '3',
        description: 'Only Q[state, action] changes',
        input: 'bool(torch.allclose(q_learning_update(torch.tensor([[1.0, 2.0], [3.0, 4.0]]), 0, 0, 5.0, 1, 0.5, 0.9), torch.tensor([[4.8, 2.0], [3.0, 4.0]])))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Terminal transition modelled with gamma = 0',
        input: 'bool(torch.allclose(q_learning_update(torch.zeros(2, 2), 0, 0, 10.0, 1, 1.0, 0.0), torch.tensor([[10.0, 0.0], [0.0, 0.0]])))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Input Q-table is not modified',
        input: '(lambda: (Q := torch.zeros(2, 2), _ := q_learning_update(Q, 0, 1, 1.0, 1, 0.1, 0.9), Q.tolist())[-1])()',
        expected: '[[0.0, 0.0], [0.0, 0.0]]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Max over a next row of negative values',
        input: 'round(q_learning_update(torch.tensor([[0.0, 0.0], [-1.0, -3.0]]), 0, 0, 2.0, 1, 0.5, 1.0)[0, 0].item(), 4)',
        expected: '0.5',
        hidden: true,
      },
    ],
    hints: [
      'The update nudges one table entry toward a better estimate of its value. What is that better estimate?',
      'Compute the target from the reward and the best next-state value, then the TD error, then the step.',
      'Q[next_state].max() is the best next value; Q[state, action] += alpha * (reward + gamma * best - Q[state, action]).',
      'Clone first so the caller\'s tensor is untouched, and take the max over Q[next_state] (that row only).',
    ],
  },

  'rl-sarsa-update': {
    note: 'Like Q-learning, but bootstrap from Q[next_state, next_action]. Work on Q.clone() and return the updated tensor; rounding is optional (tests use a tolerance).',
    starterCode: `import torch

def sarsa_update(Q: torch.Tensor, state: int, action: int, reward: float,
                 next_state: int, next_action: int,
                 alpha: float, gamma: float) -> torch.Tensor:
    """
    Perform one SARSA update.

    Args:
        Q: (n_states, n_actions) Q-table tensor
        state: current state s
        action: action taken a
        reward: reward received r
        next_state: next state s'
        next_action: next action a' (the one that will actually be taken)
        alpha: learning rate
        gamma: discount factor

    Returns:
        Updated (n_states, n_actions) Q-table (a new tensor; the input is unchanged)
    """
    Q = Q.clone().float()
    # Your code here
    pass
`,
    solution: `import torch

def sarsa_update(Q: torch.Tensor, state: int, action: int, reward: float,
                 next_state: int, next_action: int,
                 alpha: float, gamma: float) -> torch.Tensor:
    Q = Q.clone().float()

    # On-policy target: bootstrap from the action actually taken next
    td_target = reward + gamma * Q[next_state, next_action]
    td_error = td_target - Q[state, action]
    Q[state, action] += alpha * td_error
    return Q
`,
    testCases: [
      {
        id: '1',
        description: 'Basic SARSA update',
        input: 'round(sarsa_update(torch.tensor([[1.0, 2.0], [3.0, 4.0]]), 0, 0, 5.0, 1, 0, 0.5, 0.9)[0, 0].item(), 4)',
        expected: '4.35',
        hidden: false,
      },
      {
        id: '2',
        description: 'Different next action',
        input: 'bool(torch.allclose(sarsa_update(torch.tensor([[1.0, 2.0], [3.0, 4.0]]), 0, 0, 5.0, 1, 1, 0.5, 0.9), torch.tensor([[4.8, 2.0], [3.0, 4.0]])))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'From zero',
        input: 'bool(torch.allclose(sarsa_update(torch.zeros(2, 2), 0, 1, 1.0, 1, 0, 0.1, 0.9), torch.tensor([[0.0, 0.1], [0.0, 0.0]])))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Uses Q(s\', a\'), not the max',
        input: 'round(sarsa_update(torch.tensor([[0.0, 0.0], [10.0, -10.0]]), 0, 1, 0.0, 1, 1, 1.0, 1.0)[0, 1].item(), 4)',
        expected: '-10.0',
        hidden: true,
      },
    ],
    hints: [
      'This is Q-learning with one change: which next-state value do you bootstrap from?',
      'Read Q at (next_state, next_action), build the target, then take a step of size alpha toward it.',
      'Q[state, action] += alpha * (reward + gamma * Q[next_state, next_action] - Q[state, action]) on a clone.',
      'Don\'t call .max() on the next row (that is Q-learning).',
    ],
  },

  'rl-td0-prediction': {
    note: 'Index the value tensor directly. Work on V.clone() and return the updated tensor; rounding is optional (tests use a tolerance).',
    starterCode: `import torch

def td0_update(V: torch.Tensor, state: int, reward: float,
               next_state: int, alpha: float, gamma: float,
               done: bool = False) -> torch.Tensor:
    """
    Perform one TD(0) value update.

    Args:
        V: (n_states,) tensor of value estimates
        state: current state s
        reward: reward received r
        next_state: next state s'
        alpha: learning rate
        gamma: discount factor
        done: True if next_state is terminal (its value counts as 0)

    Returns:
        Updated (n_states,) values (a new tensor)
    """
    V = V.clone().float()
    # Your code here
    pass
`,
    solution: `import torch

def td0_update(V: torch.Tensor, state: int, reward: float,
               next_state: int, alpha: float, gamma: float,
               done: bool = False) -> torch.Tensor:
    V = V.clone().float()

    # A terminal next state contributes no future value
    next_value = 0.0 if done else V[next_state]
    td_error = reward + gamma * next_value - V[state]
    V[state] += alpha * td_error
    return V
`,
    testCases: [
      {
        id: '1',
        description: 'Non-terminal transition',
        input: 'bool(torch.allclose(td0_update(torch.zeros(3), 0, 1.0, 1, 0.1, 0.9, False), torch.tensor([0.1, 0.0, 0.0])))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Terminal transition',
        input: 'td0_update(torch.zeros(3), 0, 10.0, 1, 0.5, 0.9, True).tolist()',
        expected: '[5.0, 0.0, 0.0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'With existing values',
        input: 'round(td0_update(torch.tensor([5.0, 10.0, 15.0]), 1, 2.0, 2, 0.1, 0.9, False)[1].item(), 4)',
        expected: '10.55',
        hidden: true,
      },
      {
        id: '4',
        description: 'done=True ignores the stored V(s\')',
        input: 'round(td0_update(torch.tensor([0.0, 100.0]), 0, 1.0, 1, 1.0, 0.9, True)[0].item(), 4)',
        expected: '1.0',
        hidden: true,
      },
    ],
    hints: [
      'TD(0) compares what you predicted for s with a one-step look-ahead estimate of it.',
      'Decide the next-state value first (0 when done), then form the target, the TD error, and the step.',
      'next_v = 0.0 if done else V[next_state]; V[state] += alpha * (reward + gamma * next_v - V[state]).',
      'When done is True, don\'t read V[next_state] at all; and clone V so the input is unchanged.',
    ],
  },

  'rl-value-iteration': {
    note: 'Compute each action value with tensor ops and take the max with torch.stack(...).max(). Read the old V, write a new tensor; rounding is optional (tests use a tolerance).',
    starterCode: `import torch

def value_iteration_step(V: torch.Tensor, transitions: dict,
                         gamma: float) -> torch.Tensor:
    """
    Perform one synchronous sweep of value iteration.

    Args:
        V: (n_states,) tensor of current values
        transitions: transitions[s][a] = [(prob, reward, next_state), ...]
        gamma: discount factor

    Returns:
        (n_states,) tensor of new values, V_new[s] = max_a Q(s, a)
        (states without transitions are terminal and get 0)
    """
    V = V.float()
    n_states = V.shape[0]
    V_new = torch.zeros(n_states)

    # Your code here
    pass
`,
    solution: `import torch

def value_iteration_step(V: torch.Tensor, transitions: dict,
                         gamma: float) -> torch.Tensor:
    V = V.float()
    n_states = V.shape[0]
    V_new = torch.zeros(n_states)  # terminal states stay 0

    for s in range(n_states):
        if s not in transitions:
            continue

        q_values = []
        for outcomes in transitions[s].values():
            probs = torch.tensor([float(p) for p, _, _ in outcomes])
            rewards = torch.tensor([float(r) for _, r, _ in outcomes])
            next_states = torch.tensor([s2 for _, _, s2 in outcomes])
            # Q(s, a) always reads the OLD values V (synchronous sweep)
            q_values.append((probs * (rewards + gamma * V[next_states])).sum())

        # Bellman optimality: V(s) = max_a Q(s, a)
        V_new[s] = torch.stack(q_values).max()

    return V_new
`,
    testCases: [
      {
        id: '1',
        description: 'Simple 2-state MDP',
        input: `value_iteration_step(torch.tensor([0.0, 0.0]), {0: {0: [(1.0, 1.0, 0)], 1: [(1.0, 5.0, 1)]}, 1: {0: [(1.0, 2.0, 0)], 1: [(1.0, 0.0, 1)]}}, 0.9).tolist()`,
        expected: '[5.0, 2.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'With existing values',
        input: `bool(torch.allclose(value_iteration_step(torch.tensor([5.0, 2.0]), {0: {0: [(1.0, 1.0, 0)], 1: [(1.0, 5.0, 1)]}, 1: {0: [(1.0, 2.0, 0)], 1: [(1.0, 0.0, 1)]}}, 0.9), torch.tensor([6.8, 6.5])))`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Stochastic transitions',
        input: `bool(torch.allclose(value_iteration_step(torch.tensor([1.0, 2.0, 0.0]), {0: {0: [(0.5, 1.0, 1), (0.5, 0.0, 2)], 1: [(1.0, 0.5, 0)]}, 1: {0: [(0.2, 3.0, 0), (0.8, 0.0, 1)]}, 2: {0: [(1.0, 0.0, 2)]}}, 0.5), torch.tensor([1.0, 1.5, 0.0])))`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Terminal state (no transitions) gets 0; backups read the old V',
        input: `bool(torch.allclose(value_iteration_step(torch.tensor([0.2, 2.0, 7.0]), {0: {0: [(0.8, 1.0, 1), (0.2, 0.0, 0)], 1: [(1.0, 0.0, 2)]}, 1: {0: [(1.0, 2.0, 0)]}}, 0.9), torch.tensor([6.3, 2.18, 0.0]), atol=1e-4))`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Value iteration is the Bellman expectation backup with a max over actions on top.',
      'For each state with transitions: one expected value per action, then keep the largest. Other states stay 0.',
      'Per action: (probs * (rewards + gamma * V[next_states])).sum(); per state: torch.stack(q_values).max().',
      'Read only from the old V and write only into V_new; writing into V mixes old and new values within one sweep.',
    ],
  },

  'rl-policy-gradient': {
    note: "Let autograd compute the gradient: build sum_t G_t * log π(a_t|s_t) with F.log_softmax and call .backward() on a copy of theta that requires grad. Don't modify the input theta. (Deriving one_hot(a) - π by hand also works.)",
    starterCode: `import torch
import torch.nn.functional as F

def reinforce_gradient(theta: torch.Tensor, episode: list,
                       gamma: float) -> torch.Tensor:
    """
    Compute the REINFORCE policy gradient for a tabular softmax policy.

    Args:
        theta: (n_states, n_actions) policy logits
        episode: list of (state, action, reward) tuples
        gamma: discount factor

    Returns:
        (n_states, n_actions) gradient of sum_t G_t * log pi(a_t|s_t) w.r.t. theta
    """
    theta = theta.detach().clone().float().requires_grad_(True)

    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def reinforce_gradient(theta: torch.Tensor, episode: list,
                       gamma: float) -> torch.Tensor:
    theta = theta.detach().clone().float().requires_grad_(True)

    T = len(episode)
    if T == 0:
        return torch.zeros_like(theta)

    states = torch.tensor([s for s, _, _ in episode])
    actions = torch.tensor([a for _, a, _ in episode])

    # Returns G_t, computed backwards (constants: no gradient flows through them)
    returns = torch.zeros(T)
    G = 0.0
    for t in range(T - 1, -1, -1):
        G = episode[t][2] + gamma * G
        returns[t] = G

    # log pi(a_t | s_t) for the actions actually taken
    log_probs = F.log_softmax(theta[states], dim=-1)
    chosen = log_probs[torch.arange(T), actions]

    # grad of sum_t G_t log pi(a_t|s_t) = sum_t G_t (one_hot(a_t) - pi(.|s_t))
    objective = (returns * chosen).sum()
    objective.backward()
    return theta.grad

# Time O(T * n_actions)
`,
    testCases: [
      {
        id: '1',
        description: 'Simple episode',
        input: 'bool(torch.allclose(reinforce_gradient(torch.zeros(2, 2), [(0, 1, 1.0), (1, 0, 1.0)], 0.9), torch.tensor([[-0.95, 0.95], [0.5, -0.5]]), atol=0.01))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Single step episode',
        input: 'bool(torch.allclose(reinforce_gradient(torch.zeros(2, 2), [(0, 0, 5.0)], 0.9), torch.tensor([[2.5, -2.5], [0.0, 0.0]]), atol=0.01))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Non-uniform policy: G * (one_hot(a) - softmax(theta[s]))',
        input: 'bool(torch.allclose(reinforce_gradient(torch.tensor([[0.5, -0.5], [1.0, 0.0]]), [(0, 0, 2.0)], 0.9), torch.tensor([[0.5379, -0.5379], [0.0, 0.0]]), atol=1e-3))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Repeated state accumulates and the input is not modified',
        input: `(lambda: (
            theta := torch.tensor([[0.0, 1.0, -1.0]]),
            g := reinforce_gradient(theta, [(0, 2, 1.0), (0, 1, 0.0), (0, 0, 2.0)], 0.5),
            p := torch.softmax(theta[0], dim=0),
            ref := 1.5 * (torch.tensor([0.0, 0.0, 1.0]) - p) + 1.0 * (torch.tensor([0.0, 1.0, 0.0]) - p) + 2.0 * (torch.tensor([1.0, 0.0, 0.0]) - p),
            bool(torch.allclose(g[0], ref, atol=1e-4) and theta.grad is None and theta.tolist() == [[0.0, 1.0, -1.0]])
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Empty episode returns a zero gradient of theta\'s shape',
        input: 'reinforce_gradient(torch.zeros(3, 2), [], 0.9).tolist()',
        expected: '[[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]]',
        hidden: true,
      },
    ],
    hints: [
      'Policy gradient = the gradient of Σ_t G_t · log π(a_t|s_t), with the returns G_t treated as constants.',
      'Compute the returns backwards in a plain loop, gather the log-probs of the taken actions, form the weighted sum, and backprop.',
      'F.log_softmax(theta[states], dim=-1)[torch.arange(T), actions] gives log π(a_t|s_t); then (returns * chosen).sum().backward() and return theta.grad.',
      'Work on theta.detach().clone().requires_grad_(True) so the caller\'s tensor gets no .grad, and return zeros for an empty episode (there is nothing to backprop).',
    ],
  },

  'rl-advantage-estimation': {
    note: 'Compute all TD errors with slicing, then one backward loop for the recursion. Return the advantages as a tensor; rounding is optional (tests use a tolerance).',
    starterCode: `import torch

def compute_gae(rewards: torch.Tensor, values: torch.Tensor,
                gamma: float, lam: float) -> torch.Tensor:
    """
    Compute Generalized Advantage Estimation.

    Args:
        rewards: (T,) rewards r_0 ... r_{T-1}
        values: (T+1,) values V(s_0) ... V(s_T); the last entry is the
                bootstrap value (0 if the episode terminated)
        gamma: discount factor
        lam: GAE lambda

    Returns:
        (T,) tensor of advantages A_0 ... A_{T-1}
    """
    rewards = rewards.float()
    values = values.float()
    T = rewards.shape[0]
    advantages = torch.zeros(T)

    # Your code here
    pass
`,
    solution: `import torch

def compute_gae(rewards: torch.Tensor, values: torch.Tensor,
                gamma: float, lam: float) -> torch.Tensor:
    rewards = rewards.float()
    values = values.float()
    T = rewards.shape[0]
    advantages = torch.zeros(T)

    # All TD errors at once: delta_t = r_t + gamma * V(s_{t+1}) - V(s_t)
    deltas = rewards + gamma * values[1:] - values[:-1]

    gae = 0.0  # A_T = 0
    for t in range(T - 1, -1, -1):
        # A_t = delta_t + gamma * lambda * A_{t+1}
        gae = deltas[t] + gamma * lam * gae
        advantages[t] = gae

    return advantages

# Time O(T)
`,
    testCases: [
      {
        id: '1',
        description: 'Zero values baseline',
        input: 'bool(torch.allclose(compute_gae(torch.tensor([1.0, 1.0, 1.0]), torch.zeros(4), 0.99, 0.95), torch.tensor([2.8250, 1.9405, 1.0]), atol=1e-3))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'With value estimates',
        input: 'bool(torch.allclose(compute_gae(torch.tensor([1.0, 2.0, 3.0]), torch.tensor([1.0, 2.0, 3.0, 0.0]), 0.9, 0.9), torch.tensor([3.987, 2.7, 0.0]), atol=1e-3))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Single step',
        input: 'bool(torch.allclose(compute_gae(torch.tensor([5.0]), torch.tensor([1.0, 0.0]), 0.99, 0.95), torch.tensor([4.0]), atol=1e-4))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'lambda = 1: advantages + values = discounted returns',
        input: `(lambda: (
            r := torch.tensor([1.0, -1.0, 2.0, 0.5]), v := torch.tensor([0.3, -0.2, 0.7, 1.1, 0.0]),
            ret := torch.tensor([1.0 - 0.9 + 0.81 * 2.0 + 0.729 * 0.5, -1.0 + 0.9 * 2.0 + 0.81 * 0.5, 2.0 + 0.9 * 0.5, 0.5]),
            bool(torch.allclose(compute_gae(r, v, 0.9, 1.0) + v[:-1], ret, atol=1e-4))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Truncated trajectory bootstraps from the last value',
        input: 'bool(torch.allclose(compute_gae(torch.tensor([0.0, 0.0, 1.0]), torch.tensor([0.5, 0.5, 0.5, 2.0]), 0.9, 0.8), torch.tensor([1.10632, 1.606, 2.3]), atol=1e-4))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'An advantage is a discounted sum of future TD errors, and sums of the future are easiest to build from the end.',
      'All TD errors can be computed at once with slicing; only the recursion needs a loop.',
      'deltas = rewards + gamma * values[1:] - values[:-1]; then backwards gae = deltas[t] + gamma * lam * gae; advantages[t] = gae.',
      'values has T+1 entries: values[1:] are the next-state values (the last is the bootstrap value). Start the recursion with gae = 0.',
    ],
  },

  'rl-ppo-clip': {
    note: 'Use torch.clamp and torch.minimum. Return the objective as a Python float rounded to 2 decimals.',
    starterCode: `import torch

def ppo_clip_objective(old_probs: torch.Tensor, new_probs: torch.Tensor,
                       advantages: torch.Tensor, epsilon: float) -> float:
    """
    Compute the PPO clipped surrogate objective.

    Args:
        old_probs: (N,) pi_old(a|s) of the taken actions
        new_probs: (N,) pi_theta(a|s) of the taken actions
        advantages: (N,) advantage estimates A_t
        epsilon: clipping parameter (e.g. 0.2)

    Returns:
        mean_t min(ratio_t * A_t, clip(ratio_t, 1-eps, 1+eps) * A_t)
        as a Python float (to maximize), rounded to 2 decimals
    """
    old_probs = old_probs.double()
    new_probs = new_probs.double()
    advantages = advantages.double()

    # Your code here
    pass
`,
    solution: `import torch

def ppo_clip_objective(old_probs: torch.Tensor, new_probs: torch.Tensor,
                       advantages: torch.Tensor, epsilon: float) -> float:
    old_probs = old_probs.double()
    new_probs = new_probs.double()
    advantages = advantages.double()

    ratios = new_probs / (old_probs + 1e-8)
    clipped_ratios = torch.clamp(ratios, 1 - epsilon, 1 + epsilon)

    # Pessimistic bound: element-wise min of the unclipped and clipped surrogates
    objective = torch.minimum(ratios * advantages, clipped_ratios * advantages).mean()
    return round(objective.item(), 2)
`,
    testCases: [
      {
        id: '1',
        description: 'No change in policy: objective is the mean advantage',
        input: 'ppo_clip_objective(torch.tensor([0.5, 0.5]), torch.tensor([0.5, 0.5]), torch.tensor([1.0, -1.0]), 0.2)',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'Positive advantage, ratio > 1 + epsilon is clipped',
        input: 'ppo_clip_objective(torch.tensor([0.5]), torch.tensor([0.7]), torch.tensor([1.0]), 0.2)',
        expected: '1.2',
        hidden: false,
      },
      {
        id: '3',
        description: 'Negative advantage, ratio > 1 keeps the unclipped term',
        input: 'ppo_clip_objective(torch.tensor([0.5]), torch.tensor([0.7]), torch.tensor([-1.0]), 0.2)',
        expected: '-1.4',
        hidden: false,
      },
      {
        id: '4',
        description: 'Clipping in action',
        input: 'ppo_clip_objective(torch.tensor([0.3]), torch.tensor([0.6]), torch.tensor([2.0]), 0.2)',
        expected: '2.4',
        hidden: true,
      },
      {
        id: '5',
        description: 'Negative advantage, ratio < 1 is clipped at 1 - epsilon',
        input: 'ppo_clip_objective(torch.tensor([0.5, 0.4]), torch.tensor([0.2, 0.4]), torch.tensor([-2.0, 1.0]), 0.2)',
        expected: '-0.3',
        hidden: true,
      },
      {
        id: '6',
        description: 'Positive advantage, ratio < 1 - epsilon is not clipped',
        input: 'ppo_clip_objective(torch.tensor([0.5]), torch.tensor([0.2]), torch.tensor([1.0]), 0.2)',
        expected: '0.4',
        hidden: true,
      },
    ],
    hints: [
      'The objective is an importance-weighted advantage, made pessimistic so that large policy changes are never rewarded.',
      'Compute the ratio, a clipped copy of it, both surrogate terms, then the element-wise minimum and the mean.',
      'ratios = new_probs / (old_probs + 1e-8); clipped = torch.clamp(ratios, 1 - epsilon, 1 + epsilon); torch.minimum(ratios * A, clipped * A).mean().item().',
      'Take the min of the two products, not min(ratio, clipped) times A: with a negative advantage those differ.',
    ],
  },

  'rl-n-step-return': {
    note: 'Slice the rewards and use torch.arange for the discounts. Inputs are tensors; return a Python float rounded to 2 decimals.',
    starterCode: `import torch

def n_step_return(rewards: torch.Tensor, values: torch.Tensor,
                  t: int, n: int, gamma: float) -> float:
    """
    Compute the n-step return from timestep t.

    Args:
        rewards: (T,) rewards [r_0, ..., r_{T-1}]
        values: (T+1,) values [V(s_0), ..., V(s_T)]
        t: starting timestep
        n: number of steps
        gamma: discount factor

    Returns:
        G_t^(n) as a Python float, rounded to 2 decimals (no bootstrap if the
        episode ends before t + n)
    """
    rewards = rewards.double()
    values = values.double()
    T = rewards.shape[0]

    # Your code here
    pass
`,
    solution: `import torch

def n_step_return(rewards: torch.Tensor, values: torch.Tensor,
                  t: int, n: int, gamma: float) -> float:
    rewards = rewards.double()
    values = values.double()
    T = rewards.shape[0]

    # Real rewards r_t ... r_{t+n-1}, truncated at the end of the episode
    end = min(t + n, T)
    discounts = gamma ** torch.arange(end - t, dtype=torch.float64)
    G = (discounts * rewards[t:end]).sum().item()

    # Bootstrap from V(s_{t+n}) only if that state exists
    if t + n < values.shape[0]:
        G += (gamma ** n) * values[t + n].item()

    return round(G, 2)

# Time O(n)
`,
    testCases: [
      {
        id: '1',
        description: '2-step return',
        input: 'n_step_return(torch.tensor([1.0, 2.0, 3.0, 4.0]), torch.tensor([0.0, 0.0, 0.0, 0.0, 10.0]), 0, 2, 0.9)',
        expected: '2.8',
        hidden: false,
      },
      {
        id: '2',
        description: '3-step return with bootstrap',
        input: 'n_step_return(torch.tensor([1.0, 1.0, 1.0, 1.0]), torch.tensor([0.0, 0.0, 0.0, 5.0, 0.0]), 0, 3, 0.9)',
        expected: '6.36',
        hidden: false,
      },
      {
        id: '3',
        description: '1-step (TD) return',
        input: 'n_step_return(torch.tensor([5.0, 2.0, 3.0]), torch.tensor([1.0, 10.0, 5.0, 0.0]), 0, 1, 0.9)',
        expected: '14.0',
        hidden: true,
      },
      {
        id: '4',
        description: 'Starting mid-episode, n past the end',
        input: 'n_step_return(torch.tensor([1.0, 2.0, 3.0]), torch.tensor([0.0, 0.0, 0.0, 0.0]), 1, 5, 0.5)',
        expected: '3.5',
        hidden: true,
      },
      {
        id: '5',
        description: 'Mid-episode with bootstrap (t + n = T)',
        input: 'n_step_return(torch.tensor([1.0, 2.0, 3.0, 4.0]), torch.tensor([0.0, 1.0, 2.0, 3.0, 10.0]), 2, 2, 0.9)',
        expected: '14.7',
        hidden: true,
      },
    ],
    hints: [
      'Count real rewards for up to n steps, then let the critic estimate everything after.',
      'Slice rewards[t:end] with end = min(t + n, T), weight them, then decide whether a bootstrap value exists.',
      '(gamma ** torch.arange(end - t, dtype=torch.float64) * rewards[t:end]).sum(); add gamma**n * values[t + n] if t + n < len(values).',
      'The bootstrap is discounted by gamma**n, not gamma**(n-1), and is skipped when the episode ends before step t + n.',
    ],
  },

  'rl-reward-modeling': {
    note: "Use F.logsigmoid for a stable log σ. Don't use F.binary_cross_entropy_with_logits (it computes exactly this loss with target 1); a hidden test uses it as the reference.",
    starterCode: `import torch
import torch.nn.functional as F

def reward_model_loss(r_chosen: torch.Tensor, r_rejected: torch.Tensor) -> float:
    """
    Compute the Bradley-Terry reward model loss.

    Args:
        r_chosen: (N,) scores of the preferred responses
        r_rejected: (N,) scores of the rejected responses

    Returns:
        mean of -log sigmoid(r_chosen - r_rejected) as a Python float,
        rounded to 3 decimals
    """
    r_chosen = r_chosen.double()
    r_rejected = r_rejected.double()

    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def reward_model_loss(r_chosen: torch.Tensor, r_rejected: torch.Tensor) -> float:
    r_chosen = r_chosen.double()
    r_rejected = r_rejected.double()

    # P(chosen > rejected) = sigmoid(margin); logsigmoid is stable for large |margin|
    margins = r_chosen - r_rejected
    loss = -F.logsigmoid(margins).mean()
    return round(loss.item(), 3)
`,
    testCases: [
      {
        id: '1',
        description: 'Clear preference',
        input: 'reward_model_loss(torch.tensor([2.0, 1.5]), torch.tensor([1.0, 0.5]))',
        expected: '0.313',
        hidden: false,
      },
      {
        id: '2',
        description: 'Equal scores',
        input: 'reward_model_loss(torch.tensor([0.0]), torch.tensor([0.0]))',
        expected: '0.693',
        hidden: false,
      },
      {
        id: '3',
        description: 'Large margin',
        input: 'reward_model_loss(torch.tensor([5.0, 4.0, 3.0]), torch.tensor([0.0, 0.0, 0.0]))',
        expected: '0.024',
        hidden: true,
      },
      {
        id: '4',
        description: 'Matches BCE-with-logits against target 1',
        input: `(lambda: (
            c := torch.randn(8), r := torch.randn(8),
            bool(abs(reward_model_loss(c, r) - torch.nn.functional.binary_cross_entropy_with_logits(c - r, torch.ones(8)).item()) < 1e-3)
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Badly wrong ranking: exact loss, not capped by an eps',
        input: 'reward_model_loss(torch.tensor([-50.0]), torch.tensor([50.0]))',
        expected: '100.0',
        hidden: true,
      },
    ],
    hints: [
      'The model turns a score difference into a probability that the human picked the chosen response; the loss is that probability\'s negative log.',
      'Compute the margins r_chosen - r_rejected, map them to log-probabilities, and average the negatives.',
      'loss = -F.logsigmoid(r_chosen - r_rejected).mean(); return round(loss.item(), 3).',
      'torch.log(torch.sigmoid(x)) underflows to -inf for very negative x, and an eps inside the log caps the loss; F.logsigmoid avoids both.',
    ],
  },

  'rl-dpo-loss': {
    note: 'Pure tensor arithmetic; use F.logsigmoid for a stable log σ. Return a Python float rounded to 3 decimals.',
    starterCode: `import torch
import torch.nn.functional as F

def dpo_loss(logp_chosen: torch.Tensor, logp_rejected: torch.Tensor,
             ref_logp_chosen: torch.Tensor, ref_logp_rejected: torch.Tensor,
             beta: float) -> float:
    """
    Compute the Direct Preference Optimization (DPO) loss.

    Args:
        logp_chosen: (N,) log pi_theta(y_w|x), sequence log-probs
        logp_rejected: (N,) log pi_theta(y_l|x)
        ref_logp_chosen: (N,) log pi_ref(y_w|x)
        ref_logp_rejected: (N,) log pi_ref(y_l|x)
        beta: KL-strength / temperature parameter

    Returns:
        mean of -log sigmoid(beta * (delta_chosen - delta_rejected)) as a
        Python float, rounded to 3 decimals
    """
    logp_chosen = logp_chosen.double()
    logp_rejected = logp_rejected.double()
    ref_logp_chosen = ref_logp_chosen.double()
    ref_logp_rejected = ref_logp_rejected.double()

    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def dpo_loss(logp_chosen: torch.Tensor, logp_rejected: torch.Tensor,
             ref_logp_chosen: torch.Tensor, ref_logp_rejected: torch.Tensor,
             beta: float) -> float:
    logp_chosen = logp_chosen.double()
    logp_rejected = logp_rejected.double()
    ref_logp_chosen = ref_logp_chosen.double()
    ref_logp_rejected = ref_logp_rejected.double()

    # Implicit rewards (up to beta): log-ratios of policy vs reference
    chosen_logratios = logp_chosen - ref_logp_chosen
    rejected_logratios = logp_rejected - ref_logp_rejected

    logits = beta * (chosen_logratios - rejected_logratios)
    loss = -F.logsigmoid(logits).mean()
    return round(loss.item(), 3)
`,
    testCases: [
      {
        id: '1',
        description: 'Policy prefers chosen',
        input: 'dpo_loss(torch.tensor([-1.0]), torch.tensor([-2.0]), torch.tensor([-1.5]), torch.tensor([-1.5]), 0.1)',
        expected: '0.644',
        hidden: false,
      },
      {
        id: '2',
        description: 'Policy equals reference: loss is log 2',
        input: 'dpo_loss(torch.tensor([-1.0, -1.0]), torch.tensor([-1.0, -1.0]), torch.tensor([-1.0, -1.0]), torch.tensor([-1.0, -1.0]), 0.5)',
        expected: '0.693',
        hidden: false,
      },
      {
        id: '3',
        description: 'Strong preference signal',
        input: 'dpo_loss(torch.tensor([0.0]), torch.tensor([-5.0]), torch.tensor([-2.0]), torch.tensor([-3.0]), 0.1)',
        expected: '0.513',
        hidden: true,
      },
      {
        id: '4',
        description: 'Policy prefers the rejected response: loss above log 2',
        input: 'dpo_loss(torch.tensor([-3.0, -2.0]), torch.tensor([-1.0, -1.0]), torch.tensor([-2.0, -2.0]), torch.tensor([-2.0, -2.0]), 0.5)',
        expected: '1.144',
        hidden: true,
      },
      {
        id: '5',
        description: 'Large negative logit: exact loss (stable log-sigmoid)',
        input: 'dpo_loss(torch.tensor([-400.0]), torch.tensor([-10.0]), torch.tensor([-20.0]), torch.tensor([-20.0]), 1.0)',
        expected: '390.0',
        hidden: true,
      },
    ],
    hints: [
      'DPO is the reward-model loss where each response\'s "reward" is β times how much more likely the policy makes it than the reference.',
      'Compute the two log-ratios (policy minus reference), their difference, scale by beta, then apply -log σ and average.',
      'logits = beta * ((logp_chosen - ref_logp_chosen) - (logp_rejected - ref_logp_rejected)); loss = -F.logsigmoid(logits).mean().',
      'Mind the signs inside each log-ratio, and prefer F.logsigmoid over torch.log(torch.sigmoid(...)), which returns -inf for very negative logits.',
    ],
  },

  'rl-kl-penalty': {
    note: 'One line of tensor arithmetic. Keep the sign of the estimate (no abs or clamp). Return a Python float rounded to 2 decimals.',
    starterCode: `import torch

def kl_penalty(logp_policy: torch.Tensor, logp_reference: torch.Tensor,
               beta: float) -> float:
    """
    Compute the sampled KL penalty for RLHF.

    Args:
        logp_policy: (T,) log-probs of the sampled tokens under pi_theta
        logp_reference: (T,) log-probs of the same tokens under pi_ref
        beta: KL penalty coefficient

    Returns:
        beta * mean(logp_policy - logp_reference) as a Python float,
        rounded to 2 decimals
    """
    logp_policy = logp_policy.double()
    logp_reference = logp_reference.double()

    # Your code here
    pass
`,
    solution: `import torch

def kl_penalty(logp_policy: torch.Tensor, logp_reference: torch.Tensor,
               beta: float) -> float:
    logp_policy = logp_policy.double()
    logp_reference = logp_reference.double()

    # Per-token log-ratio: unbiased KL estimate for tokens sampled from pi_theta
    mean_kl = (logp_policy - logp_reference).mean()
    return round((beta * mean_kl).item(), 2)
`,
    testCases: [
      {
        id: '1',
        description: 'Positive divergence',
        input: 'kl_penalty(torch.tensor([-1.0, -2.0]), torch.tensor([-1.5, -2.5]), 0.1)',
        expected: '0.05',
        hidden: false,
      },
      {
        id: '2',
        description: 'No divergence',
        input: 'kl_penalty(torch.tensor([-1.0, -1.0]), torch.tensor([-1.0, -1.0]), 0.1)',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '3',
        description: 'Higher beta',
        input: 'kl_penalty(torch.tensor([-0.5, -1.0, -1.5]), torch.tensor([-1.0, -1.5, -2.0]), 0.5)',
        expected: '0.25',
        hidden: true,
      },
      {
        id: '4',
        description: 'Mean over tokens of mixed-sign log-ratios',
        input: 'kl_penalty(torch.tensor([-1.0, -3.0, -0.5, -2.0]), torch.tensor([-2.0, -2.0, -1.5, -2.6]), 1.0)',
        expected: '0.4',
        hidden: true,
      },
      {
        id: '5',
        description: 'Policy less likely than reference gives a negative estimate',
        input: 'kl_penalty(torch.tensor([-2.0, -3.0]), torch.tensor([-1.0, -1.0]), 1.0)',
        expected: '-1.5',
        hidden: true,
      },
    ],
    hints: [
      'KL(π_θ ‖ π_ref) is the expected log-ratio under π_θ, and your tokens are already samples from π_θ.',
      'Compute the per-token log-ratio, average it, and scale by beta.',
      'round((beta * (logp_policy - logp_reference).mean()).item(), 2).',
      'Keep the order policy minus reference, and don\'t take abs or clamp at 0: a negative sampled estimate is expected.',
    ],
  },

  'rl-ppo-llm-objective': {
    note: "Use torch.exp, torch.clamp and torch.minimum. The KL is folded into the advantage, so don't subtract it from the objective again. Return a dict of Python floats rounded to 2 decimals.",
    starterCode: `import torch

def ppo_rlhf_objective(old_logp: torch.Tensor, new_logp: torch.Tensor,
                       ref_logp: torch.Tensor, rewards: torch.Tensor,
                       epsilon: float, beta: float) -> dict:
    """
    Compute the PPO-RLHF objective with the KL penalty folded into the advantage.

    Args:
        old_logp: (N,) log-probs under the policy that sampled the data
        new_logp: (N,) log-probs under the current policy
        ref_logp: (N,) log-probs under the frozen reference model
        rewards: (N,) reward-model scores
        epsilon: PPO clipping parameter
        beta: KL penalty coefficient

    Returns:
        dict of Python floats rounded to 2 decimals:
            'objective':   clipped surrogate with A = rewards - beta * (new_logp - ref_logp)
            'policy_loss': the same clipped-surrogate value
            'kl_penalty':  beta * mean(new_logp - ref_logp), for monitoring
    """
    old_logp = old_logp.double()
    new_logp = new_logp.double()
    ref_logp = ref_logp.double()
    rewards = rewards.double()

    # Your code here
    pass
`,
    solution: `import torch

def ppo_rlhf_objective(old_logp: torch.Tensor, new_logp: torch.Tensor,
                       ref_logp: torch.Tensor, rewards: torch.Tensor,
                       epsilon: float, beta: float) -> dict:
    old_logp = old_logp.double()
    new_logp = new_logp.double()
    ref_logp = ref_logp.double()
    rewards = rewards.double()

    # Probability ratio pi_theta / pi_old from log-probs
    ratio = torch.exp(new_logp - old_logp)

    # Sampled per-token KL to the reference, folded into the advantage
    kl = new_logp - ref_logp
    advantage = rewards - beta * kl

    clipped_ratio = torch.clamp(ratio, 1 - epsilon, 1 + epsilon)
    policy_term = torch.minimum(ratio * advantage, clipped_ratio * advantage).mean()

    # The KL is already inside the advantage, so it is not subtracted again
    objective = policy_term

    return {
        'objective': round(objective.item(), 2),
        'policy_loss': round(policy_term.item(), 2),
        'kl_penalty': round((beta * kl.mean()).item(), 2),  # monitoring only
    }
`,
    testCases: [
      {
        id: '1',
        description: 'Positive reward, small update (clipped ratio)',
        input: `(lambda r: (round(r['objective'], 2), round(r['policy_loss'], 2), round(r['kl_penalty'], 2)))(ppo_rlhf_objective(torch.tensor([-2.0]), torch.tensor([-1.8]), torch.tensor([-2.0]), torch.tensor([1.0]), 0.2, 0.1))`,
        expected: '(1.18, 1.18, 0.02)',
        hidden: false,
      },
      {
        id: '2',
        description: 'No policy change',
        input: `(lambda r: bool(abs(r['objective'] - 1.0) < 0.01 and abs(r['kl_penalty']) < 0.01))(ppo_rlhf_objective(torch.tensor([-1.0]), torch.tensor([-1.0]), torch.tensor([-1.0]), torch.tensor([1.0]), 0.2, 0.1))`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Clipped ratio and KL penalty values (KL counted once)',
        input: `(lambda r: (r['objective'], r['policy_loss'], r['kl_penalty']))(ppo_rlhf_objective(torch.tensor([-2.0, -1.0]), torch.tensor([-1.0, -1.0]), torch.tensor([-1.5, -2.0]), torch.tensor([2.0, 1.0]), 0.2, 0.2))`,
        expected: '(1.54, 1.54, 0.15)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Result has exactly the required keys',
        input: `sorted(ppo_rlhf_objective(torch.tensor([-1.0]), torch.tensor([-1.0]), torch.tensor([-1.0]), torch.tensor([1.0]), 0.2, 0.1).keys())`,
        expected: "['kl_penalty', 'objective', 'policy_loss']",
        hidden: true,
      },
    ],
    hints: [
      'This is PPO\'s clipped surrogate where the advantage is the reward minus a per-token KL charge.',
      'Compute the ratio from log-probs, the KL to the reference, the shaped advantage, then the clipped surrogate and its mean.',
      'ratio = torch.exp(new_logp - old_logp); A = rewards - beta * (new_logp - ref_logp); torch.minimum(ratio * A, torch.clamp(ratio, 1 - epsilon, 1 + epsilon) * A).mean().',
      'Don\'t subtract beta * kl.mean() from the objective again: it is already inside A. Report it as kl_penalty only.',
    ],
  },
};
