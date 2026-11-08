import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../reinforcement-learning.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const reinforcementLearningPyTorch: Record<string, LanguageVariant> = {
  'rl-discounted-return': {
    note: 'Vectorize with torch.arange: no Python loop needed. Inputs are tensors; return a Python float.',
    starterCode: `import torch

def discounted_return(rewards: torch.Tensor, gamma: float) -> float:
    """
    Calculate the discounted cumulative return.

    Args:
        rewards: Tensor of rewards [r_0, r_1, ..., r_T]
        gamma: Discount factor (0 <= gamma <= 1)

    Returns:
        Total discounted return G_0 as a Python float (rounded to 3 decimals)
    """
    rewards = rewards.double()
    # Your code here
    pass
`,
    solution: `import torch

def discounted_return(rewards: torch.Tensor, gamma: float) -> float:
    rewards = rewards.double()
    T = rewards.shape[0]

    # Discount factors: [gamma^0, gamma^1, gamma^2, ...]
    discounts = gamma ** torch.arange(T, dtype=torch.float64)

    G = (rewards * discounts).sum()
    return round(G.item(), 3)
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
        description: 'No discount',
        input: 'discounted_return(torch.tensor([1.0, 2.0, 3.0, 4.0]), 1.0)',
        expected: '10.0',
        hidden: false,
      },
      {
        id: '4',
        description: 'Only immediate',
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
      'gamma ** torch.arange(T, dtype=torch.float64) gives [γ⁰, γ¹, γ², ...]',
      'Multiply element-wise with rewards and .sum()',
      'Return round(G.item(), 3)',
    ],
  },

  'rl-epsilon-greedy': {
    note: 'Use torch.argmax for the greedy action and return a Python int.',
    starterCode: `import torch

def epsilon_greedy(q_values: torch.Tensor, epsilon: float,
                   random_value: float) -> int:
    """
    Select action using epsilon-greedy policy.

    Args:
        q_values: Q-values for each action [Q(a_0), Q(a_1), ...] (tensor)
        epsilon: Exploration probability (0 <= epsilon <= 1)
        random_value: Pre-generated random number for deterministic testing

    Returns:
        Selected action index (Python int)
    """
    n_actions = q_values.shape[0]

    # Your code here
    # If random_value < epsilon: explore (return floor(random_value * n_actions))
    # Else: exploit (return argmax of q_values)
    pass
`,
    solution: `import torch

def epsilon_greedy(q_values: torch.Tensor, epsilon: float,
                   random_value: float) -> int:
    n_actions = q_values.shape[0]

    if random_value < epsilon:
        # Explore: random action
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
        description: 'Always exploit (epsilon=0)',
        input: 'epsilon_greedy(torch.tensor([5.0, 2.0, 8.0, 1.0]), 0.0, 0.99)',
        expected: '2',
        hidden: false,
      },
      {
        id: '4',
        description: 'Explore with low random',
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
    ],
    hints: [
      'Compare random_value to epsilon to decide explore vs exploit',
      'For exploration, compute int(random_value * n_actions)',
      'For exploitation, use int(torch.argmax(q_values))',
    ],
  },

  'rl-bellman-value': {
    note: 'Gather V(s\') with tensor indexing and take the probability-weighted sum. Return a Python float.',
    starterCode: `import torch

def bellman_value(transitions: list, gamma: float,
                  next_values: torch.Tensor) -> float:
    """
    Compute state value using Bellman expectation equation.

    Args:
        transitions: List of (probability, reward, next_state_index) tuples
        gamma: Discount factor
        next_values: Tensor of values V(s') for each state

    Returns:
        Value V(s) for the current state (Python float, rounded to 2 decimals)
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

    # V(s) = sum_s' P(s'|s) * [R + gamma * V(s')]
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
        description: 'Repeated next state',
        input: 'bellman_value([(0.25, 4, 1), (0.75, -1, 1)], 0.5, torch.tensor([100.0, 2.0]))',
        expected: '1.25',
        hidden: true,
      },
    ],
    hints: [
      'Build tensors of probabilities, rewards and next-state indices from the transitions',
      'next_values[next_states] gathers V(s\') for every transition',
      'Return round((probs * (rewards + gamma * v_next)).sum().item(), 2)',
    ],
  },

  'rl-q-learning-update': {
    note: "Index the Q-table tensor directly. Don't modify the input: work on Q.clone(). Return the updated Q-table tensor.",
    starterCode: `import torch

def q_learning_update(Q: torch.Tensor, state: int, action: int,
                      reward: float, next_state: int,
                      alpha: float, gamma: float) -> torch.Tensor:
    """
    Perform one Q-learning update.

    Args:
        Q: Q-table tensor of shape (n_states, n_actions)
        state: Current state index
        action: Action taken
        reward: Reward received
        next_state: Next state index
        alpha: Learning rate
        gamma: Discount factor

    Returns:
        Updated Q-table (new tensor; the input is left unchanged)
    """
    Q = Q.clone().float()
    # Your code here
    pass
`,
    solution: `import torch

def q_learning_update(Q: torch.Tensor, state: int, action: int,
                      reward: float, next_state: int,
                      alpha: float, gamma: float) -> torch.Tensor:
    Q = Q.clone().float()

    # Bellman optimality target uses the best next action
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
        description: 'Terminal state (no future)',
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
    ],
    hints: [
      'Best next value: Q[next_state].max()',
      'TD target: reward + gamma * max_next_Q; TD error: target - Q[state, action]',
      'Update: Q[state, action] += alpha * td_error (on a clone)',
    ],
  },

  'rl-sarsa-update': {
    note: 'Like Q-learning, but bootstrap from Q[next_state, next_action]. Work on Q.clone() and return the updated tensor.',
    starterCode: `import torch

def sarsa_update(Q: torch.Tensor, state: int, action: int, reward: float,
                 next_state: int, next_action: int,
                 alpha: float, gamma: float) -> torch.Tensor:
    """
    Perform one SARSA update.

    Args:
        Q: Q-table tensor of shape (n_states, n_actions)
        state: Current state s
        action: Action taken a
        reward: Reward received r
        next_state: Next state s'
        next_action: Next action a' (will be taken)
        alpha: Learning rate
        gamma: Discount factor

    Returns:
        Updated Q-table (new tensor; the input is left unchanged)
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

    # SARSA bootstraps from the action actually taken next (on-policy)
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
      'The key difference from Q-learning: use Q[next_state, next_action] not the max',
      'TD target: reward + gamma * Q[next_state, next_action]',
      'Update: Q[state, action] += alpha * (target - Q[state, action])',
    ],
  },

  'rl-td0-prediction': {
    note: 'Index the value tensor directly. Work on V.clone() and return the updated tensor.',
    starterCode: `import torch

def td0_update(V: torch.Tensor, state: int, reward: float,
               next_state: int, alpha: float, gamma: float,
               done: bool = False) -> torch.Tensor:
    """
    Perform one TD(0) value update.

    Args:
        V: Value function tensor V(s) for each state
        state: Current state s
        reward: Reward received r
        next_state: Next state s'
        alpha: Learning rate
        gamma: Discount factor
        done: Whether next_state is terminal

    Returns:
        Updated value function (new tensor)
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

    # Terminal next state has value 0
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
        description: 'Terminal state',
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
        description: 'done=True ignores V(s\')',
        input: 'round(td0_update(torch.tensor([0.0, 100.0]), 0, 1.0, 1, 1.0, 0.9, True)[0].item(), 4)',
        expected: '1.0',
        hidden: true,
      },
    ],
    hints: [
      'If done=True, the next state value is 0 (terminal)',
      'TD error: reward + gamma * V[next_state] - V[state]',
      'Update: V[state] += alpha * td_error (on a clone)',
    ],
  },

  'rl-value-iteration': {
    note: 'Compute each action value with tensor ops and take the max with torch.stack(...).max(). Return the new value tensor.',
    starterCode: `import torch

def value_iteration_step(V: torch.Tensor, transitions: dict,
                         gamma: float) -> torch.Tensor:
    """
    Perform one step of value iteration.

    Args:
        V: Current value function tensor V(s) for each state
        transitions: Dict where transitions[s][a] = [(prob, reward, next_state), ...]
        gamma: Discount factor

    Returns:
        Updated value function (tensor)
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
    V_new = torch.zeros(n_states)

    for s in range(n_states):
        if s not in transitions:
            continue

        q_values = []
        for outcomes in transitions[s].values():
            probs = torch.tensor([float(p) for p, _, _ in outcomes])
            rewards = torch.tensor([float(r) for _, r, _ in outcomes])
            next_states = torch.tensor([s2 for _, _, s2 in outcomes])
            q_values.append((probs * (rewards + gamma * V[next_states])).sum())

        # Bellman optimality: V(s) = max_a Q(s, a)
        if q_values:
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
    ],
    hints: [
      'For each state, compute Q(s, a) = sum over outcomes of prob * (reward + gamma * V[next])',
      'Take the max over actions: torch.stack(q_values).max()',
      'Read from the old V, write into V_new',
    ],
  },

  'rl-policy-gradient': {
    note: 'Let autograd compute the gradient: build the REINFORCE objective sum_t G_t * log π(a_t|s_t) with F.log_softmax and call .backward() on a copy of theta that requires grad. (Deriving one_hot(a) - π by hand also works.)',
    starterCode: `import torch
import torch.nn.functional as F

def reinforce_gradient(theta: torch.Tensor, episode: list,
                       gamma: float) -> torch.Tensor:
    """
    Compute REINFORCE policy gradient for a tabular softmax policy.

    Args:
        theta: Policy parameters (n_states, n_actions)
        episode: List of (state, action, reward) tuples
        gamma: Discount factor

    Returns:
        Gradient of sum_t G_t * log π(a_t|s_t) w.r.t. theta, same shape as theta
    """
    theta = theta.detach().clone().float().requires_grad_(True)

    # Your code here
    # 1. Compute returns G_t for each timestep
    # 2. Objective = sum_t G_t * log softmax(theta[s_t])[a_t]
    # 3. objective.backward() and return theta.grad
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

    # Returns G_t, computed backwards
    returns = torch.zeros(T)
    G = 0.0
    for t in range(T - 1, -1, -1):
        G = episode[t][2] + gamma * G
        returns[t] = G

    # log π(a_t | s_t) for the actions actually taken
    log_probs = F.log_softmax(theta[states], dim=-1)
    chosen = log_probs[torch.arange(T), actions]

    # ∇ sum_t G_t log π(a_t|s_t) = sum_t G_t (one_hot(a_t) - π(.|s_t))
    objective = (returns * chosen).sum()
    objective.backward()
    return theta.grad
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
    ],
    hints: [
      'Compute returns backwards: G_t = r_t + gamma * G_{t+1}',
      'F.log_softmax(theta[states], dim=-1)[torch.arange(T), actions] gives log π(a_t|s_t)',
      'objective = (returns * log_probs).sum(); objective.backward(); return theta.grad',
      'By hand instead: theta.grad[s] += G_t * (one_hot(a) - softmax(theta[s]))',
    ],
  },

  'rl-advantage-estimation': {
    note: 'A backward loop over timesteps with tensor indexing. Return the advantages as a tensor.',
    starterCode: `import torch

def compute_gae(rewards: torch.Tensor, values: torch.Tensor,
                gamma: float, lam: float) -> torch.Tensor:
    """
    Compute Generalized Advantage Estimation.

    Args:
        rewards: Rewards r_0, r_1, ..., r_{T-1} (length T)
        values: Values V(s_0), V(s_1), ..., V(s_T) (length T+1)
                Last value is V(s_T) or 0 if terminal
        gamma: Discount factor
        lam: GAE lambda parameter

    Returns:
        Advantages Â_0, Â_1, ..., Â_{T-1} (tensor of length T)
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

    gae = 0.0
    for t in range(T - 1, -1, -1):
        # TD error: δ_t = r_t + γ V(s_{t+1}) - V(s_t)
        delta = rewards[t] + gamma * values[t + 1] - values[t]
        # Â_t = δ_t + γλ Â_{t+1}
        gae = delta + gamma * lam * gae
        advantages[t] = gae

    return advantages
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
    ],
    hints: [
      'TD errors: δ_t = r_t + γ*V(s_{t+1}) - V(s_t)',
      'Work backwards from the last timestep: Â_t = δ_t + γλ*Â_{t+1}',
      'Store each Â_t with advantages[t] = gae',
    ],
  },

  'rl-ppo-clip': {
    note: 'Use torch.clamp and torch.minimum. Return the objective as a Python float.',
    starterCode: `import torch

def ppo_clip_objective(old_probs: torch.Tensor, new_probs: torch.Tensor,
                       advantages: torch.Tensor, epsilon: float) -> float:
    """
    Compute PPO clipped surrogate objective.

    Args:
        old_probs: π_old(a|s) probabilities for taken actions
        new_probs: π_new(a|s) probabilities for taken actions
        advantages: Advantage estimates A_t
        epsilon: Clipping parameter (e.g., 0.2)

    Returns:
        PPO clipped objective (Python float rounded to 2 decimals, should be maximized)
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

    # Pessimistic (minimum) of the unclipped and clipped surrogates
    objective = torch.minimum(ratios * advantages, clipped_ratios * advantages).mean()
    return round(objective.item(), 2)
`,
    testCases: [
      {
        id: '1',
        description: 'No clipping needed',
        input: 'ppo_clip_objective(torch.tensor([0.5, 0.5]), torch.tensor([0.5, 0.5]), torch.tensor([1.0, -1.0]), 0.2)',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'Positive advantage, ratio > 1',
        input: 'ppo_clip_objective(torch.tensor([0.5]), torch.tensor([0.7]), torch.tensor([1.0]), 0.2)',
        expected: '1.2',
        hidden: false,
      },
      {
        id: '3',
        description: 'Negative advantage, ratio > 1',
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
    ],
    hints: [
      'ratios = new_probs / old_probs',
      'clipped = torch.clamp(ratios, 1 - epsilon, 1 + epsilon)',
      'objective = torch.minimum(ratios * A, clipped * A).mean()',
    ],
  },

  'rl-n-step-return': {
    note: 'Inputs are tensors; return a Python float.',
    starterCode: `import torch

def n_step_return(rewards: torch.Tensor, values: torch.Tensor,
                  t: int, n: int, gamma: float) -> float:
    """
    Compute n-step return from timestep t.

    Args:
        rewards: All rewards [r_0, r_1, ..., r_{T-1}]
        values: All values [V(s_0), ..., V(s_T)]
        t: Starting timestep
        n: Number of steps
        gamma: Discount factor

    Returns:
        N-step return G_t^(n) (Python float rounded to 2 decimals)
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

    # Discounted rewards r_t ... r_{t+n-1} (truncated at the end of the episode)
    end = min(t + n, T)
    discounts = gamma ** torch.arange(end - t, dtype=torch.float64)
    G = (discounts * rewards[t:end]).sum().item()

    # Bootstrap from V(s_{t+n}) if it exists
    if t + n < values.shape[0]:
        G += (gamma ** n) * values[t + n].item()

    return round(G, 2)
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
    ],
    hints: [
      'Sum gamma**k * rewards[t + k] for k < n while t + k < T',
      'Bootstrap with gamma**n * values[t + n] if t + n < len(values)',
      'Return round(G, 2) as a Python float',
    ],
  },

  'rl-reward-modeling': {
    note: "Use torch.sigmoid and torch.log. Don't use F.binary_cross_entropy_with_logits (it computes exactly this loss when the target is 1); a hidden test uses it as the reference.",
    starterCode: `import torch

def reward_model_loss(r_chosen: torch.Tensor, r_rejected: torch.Tensor) -> float:
    """
    Compute RLHF reward model loss (Bradley-Terry).

    Args:
        r_chosen: Reward scores for preferred/chosen responses
        r_rejected: Reward scores for rejected responses

    Returns:
        Average negative log-likelihood loss (Python float rounded to 3 decimals)
    """
    r_chosen = r_chosen.double()
    r_rejected = r_rejected.double()

    # Your code here
    # Loss = -E[log σ(r_chosen - r_rejected)]
    pass
`,
    solution: `import torch

def reward_model_loss(r_chosen: torch.Tensor, r_rejected: torch.Tensor) -> float:
    r_chosen = r_chosen.double()
    r_rejected = r_rejected.double()

    # P(chosen > rejected) = σ(r_chosen - r_rejected)
    logits = r_chosen - r_rejected
    loss = -torch.log(torch.sigmoid(logits)).mean()
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
    ],
    hints: [
      'Compute the difference: r_chosen - r_rejected',
      'torch.sigmoid gives the preference probability',
      'Loss: -torch.log(probs).mean()',
    ],
  },

  'rl-dpo-loss': {
    note: 'Pure tensor arithmetic with torch.sigmoid and torch.log. Return a Python float.',
    starterCode: `import torch

def dpo_loss(logp_chosen: torch.Tensor, logp_rejected: torch.Tensor,
             ref_logp_chosen: torch.Tensor, ref_logp_rejected: torch.Tensor,
             beta: float) -> float:
    """
    Compute Direct Preference Optimization (DPO) loss.

    Args:
        logp_chosen: Log prob of chosen response under policy π_θ
        logp_rejected: Log prob of rejected response under policy π_θ
        ref_logp_chosen: Log prob of chosen under reference π_ref
        ref_logp_rejected: Log prob of rejected under reference π_ref
        beta: Temperature parameter

    Returns:
        DPO loss (Python float rounded to 3 decimals)
    """
    logp_chosen = logp_chosen.double()
    logp_rejected = logp_rejected.double()
    ref_logp_chosen = ref_logp_chosen.double()
    ref_logp_rejected = ref_logp_rejected.double()

    # Your code here
    pass
`,
    solution: `import torch

def dpo_loss(logp_chosen: torch.Tensor, logp_rejected: torch.Tensor,
             ref_logp_chosen: torch.Tensor, ref_logp_rejected: torch.Tensor,
             beta: float) -> float:
    logp_chosen = logp_chosen.double()
    logp_rejected = logp_rejected.double()
    ref_logp_chosen = ref_logp_chosen.double()
    ref_logp_rejected = ref_logp_rejected.double()

    # Log-ratios of policy vs reference
    chosen_logratios = logp_chosen - ref_logp_chosen
    rejected_logratios = logp_rejected - ref_logp_rejected

    logits = beta * (chosen_logratios - rejected_logratios)
    loss = -torch.log(torch.sigmoid(logits)).mean()
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
        description: 'Equal preferences',
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
    ],
    hints: [
      'Δ_w = logp_chosen - ref_logp_chosen, Δ_l = logp_rejected - ref_logp_rejected',
      'logits = beta * (Δ_w - Δ_l)',
      'Loss: -torch.log(torch.sigmoid(logits)).mean()',
    ],
  },

  'rl-kl-penalty': {
    note: 'One line of tensor arithmetic. Return a Python float.',
    starterCode: `import torch

def kl_penalty(logp_policy: torch.Tensor, logp_reference: torch.Tensor,
               beta: float) -> float:
    """
    Compute KL divergence penalty for RLHF.

    Args:
        logp_policy: Log probs from current policy π_θ
        logp_reference: Log probs from reference policy π_ref
        beta: KL penalty coefficient

    Returns:
        KL penalty = β * mean(KL divergence) (Python float rounded to 2 decimals)
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

    # Per-token KL estimate: log π_θ - log π_ref
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
        description: 'Mean over tokens of mixed-sign differences',
        input: 'kl_penalty(torch.tensor([-1.0, -3.0, -0.5, -2.0]), torch.tensor([-2.0, -2.0, -1.5, -2.6]), 1.0)',
        expected: '0.4',
        hidden: true,
      },
    ],
    hints: [
      'Per-token KL: logp_policy - logp_reference',
      'Take the mean over tokens and multiply by beta',
      'Return round(penalty.item(), 2)',
    ],
  },

  'rl-ppo-llm-objective': {
    note: 'Use torch.exp, torch.clamp and torch.minimum. Return a dict of Python floats.',
    starterCode: `import torch

def ppo_rlhf_objective(old_logp: torch.Tensor, new_logp: torch.Tensor,
                       ref_logp: torch.Tensor, rewards: torch.Tensor,
                       epsilon: float, beta: float) -> dict:
    """
    Compute PPO-RLHF objective for LLM fine-tuning.

    Args:
        old_logp: Log probs from old policy (before update)
        new_logp: Log probs from current policy
        ref_logp: Log probs from reference (pretrained) model
        rewards: Rewards from reward model
        epsilon: PPO clipping parameter
        beta: KL penalty coefficient

    Returns:
        Dictionary with 'objective', 'policy_loss', 'kl_penalty' (Python floats rounded to 2 decimals)
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

    # Probability ratio π_θ / π_old from log probs
    ratio = torch.exp(new_logp - old_logp)

    # KL from the reference model, and the penalty
    kl = new_logp - ref_logp
    kl_penalty = beta * kl.mean()

    # RLHF advantage: reward minus per-token KL penalty
    advantage = rewards - beta * kl

    clipped_ratio = torch.clamp(ratio, 1 - epsilon, 1 + epsilon)
    policy_loss = torch.minimum(ratio * advantage, clipped_ratio * advantage).mean()

    objective = policy_loss

    return {
        'objective': round(objective.item(), 2),
        'policy_loss': round(policy_loss.item(), 2),
        'kl_penalty': round(kl_penalty.item(), 2),
    }
`,
    testCases: [
      {
        id: '1',
        description: 'Positive reward, small update',
        input: `(lambda r: bool(abs(r['objective'] - 1.18) < 0.1 and abs(r['kl_penalty'] - 0.02) < 0.01))(ppo_rlhf_objective(torch.tensor([-2.0]), torch.tensor([-1.8]), torch.tensor([-2.0]), torch.tensor([1.0]), 0.2, 0.1))`,
        expected: 'True',
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
        description: 'Clipped ratio and KL penalty values',
        input: `(lambda r: (r['policy_loss'], r['kl_penalty']))(ppo_rlhf_objective(torch.tensor([-2.0, -1.0]), torch.tensor([-1.0, -1.0]), torch.tensor([-1.5, -2.0]), torch.tensor([2.0, 1.0]), 0.2, 0.2))`,
        expected: '(1.54, 0.15)',
        hidden: true,
      },
    ],
    hints: [
      'ratio = torch.exp(new_logp - old_logp)',
      'kl = new_logp - ref_logp; kl_penalty = beta * kl.mean()',
      'advantage = rewards - beta * kl',
      'policy_loss = torch.minimum(ratio * A, torch.clamp(ratio, 1 - eps, 1 + eps) * A).mean()',
    ],
  },
};
