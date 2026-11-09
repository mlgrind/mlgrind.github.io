import { Problem } from '../../types';

export const reinforcementLearningProblems: Problem[] = [
  // ==========================================
  // FOUNDATIONS: RETURNS, POLICIES, BELLMAN
  // ==========================================
  {
    id: 'rl-discounted-return',
    title: 'Discounted Return',
    section: 'reinforcement-learning',
    difficulty: 'easy',
    description: `
## Discounted Return

### What you'll build
A function that turns a reward sequence into the discounted return G_0, the quantity every RL algorithm tries to maximize.

### Background
An agent should prefer reward now over the same reward later, both because the future is uncertain and because an infinite sum of rewards must stay finite. The discount factor γ does this: a reward k steps away is worth γ^k as much as one received now. With γ = 0 the agent is myopic; with γ close to 1 it plans far ahead (typical values: 0.9 to 0.999).

### Formula
For rewards r_0, r_1, ..., r_{T-1}:
\`\`\`text
G_0 = r_0 + γ·r_1 + γ²·r_2 + ... + γ^(T-1)·r_{T-1}
    = Σ_{k=0}^{T-1} γ^k · r_k
\`\`\`
Equivalently, backwards: G_t = r_t + γ·G_{t+1} with G_T = 0.

### Inputs
- \`rewards\`: 1-D array of length T (floats or ints, any sign)
- \`gamma\`: float in [0, 1]

### Expected return format
A Python float: G_0 **rounded to 3 decimals**.

### Edge cases and conventions
- \`gamma = 0\` returns r_0; \`gamma = 1\` returns the plain sum.
- An empty reward sequence has return 0.0.

### Constraints
NumPy only. Vectorize: build the discount vector [γ⁰, γ¹, ..., γ^(T-1)] instead of looping.

### Follow-up
- Return the whole vector [G_0, ..., G_{T-1}] in O(T) (hint: the backward recursion). REINFORCE needs exactly this.
- Why does γ < 1 guarantee a finite return for bounded rewards in an infinite-horizon task?
    `,
    examples: [
      {
        input: 'rewards = [1, 1, 1, 1], gamma = 0.9',
        output: '3.439',
        explanation: '1 + 0.9 + 0.81 + 0.729 = 3.439',
      },
      {
        input: 'rewards = [0, 0, 0, 10], gamma = 0.5',
        output: '1.25',
        explanation: 'Only the last reward counts: 0.5³ · 10 = 1.25',
      },
    ],
    starterCode: `import numpy as np

def discounted_return(rewards: np.ndarray, gamma: float) -> float:
    """
    Calculate the discounted return G_0.

    Args:
        rewards: (T,) rewards [r_0, r_1, ..., r_{T-1}]
        gamma: discount factor in [0, 1]

    Returns:
        G_0 = sum_k gamma**k * r_k as a float, rounded to 3 decimals
    """
    rewards = np.array(rewards)
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Constant rewards',
        input: '([1, 1, 1, 1], 0.9)',
        expected: '3.439',
        hidden: false,
      },
      {
        id: '2',
        description: 'Delayed reward',
        input: '([0, 0, 0, 10], 0.5)',
        expected: '1.25',
        hidden: false,
      },
      {
        id: '3',
        description: 'No discount (gamma = 1) is the plain sum',
        input: '([1, 2, 3, 4], 1.0)',
        expected: '10.0',
        hidden: false,
      },
      {
        id: '4',
        description: 'gamma = 0 keeps only the immediate reward',
        input: '([5, 10, 15], 0.0)',
        expected: '5.0',
        hidden: true,
      },
      {
        id: '5',
        description: 'Mixed-sign rewards',
        input: 'discounted_return([1.0, -2.0, 3.0, -4.0, 5.0], 0.8)',
        expected: '1.32',
        hidden: true,
      },
    ],
    hints: [
      'Each reward is weighted by gamma raised to how many steps in the future it arrives.',
      'Build one weight per timestep, multiply element-wise with the rewards, and sum.',
      'gamma ** np.arange(len(rewards)) gives [γ⁰, γ¹, γ², ...]; then np.sum(rewards * discounts).',
      'The first reward is not discounted (exponent 0, not 1), and remember to round to 3 decimals.',
    ],
    solution: `import numpy as np

def discounted_return(rewards: np.ndarray, gamma: float) -> float:
    """
    Calculate the discounted return G_0 (rounded to 3 decimals).
    """
    rewards = np.array(rewards, dtype=float)

    # Discount weights [gamma^0, gamma^1, ..., gamma^(T-1)]
    discounts = gamma ** np.arange(len(rewards))

    G = np.sum(rewards * discounts)
    return round(float(G), 3)

# Time O(T), space O(T)
`,
  },
  {
    id: 'rl-epsilon-greedy',
    title: 'Epsilon-Greedy Policy',
    section: 'reinforcement-learning',
    difficulty: 'easy',
    description: `
## Epsilon-Greedy Policy

### What you'll build
The ε-greedy action selector: usually take the action with the highest Q-value, but with probability ε take an exploratory action.

### Background
A purely greedy agent can lock onto the first action that looked good and never discover a better one. ε-greedy is the simplest fix for this **exploration vs exploitation** trade-off and is the default behaviour policy of tabular Q-learning and DQN. In practice ε is annealed, e.g. from 1.0 down to 0.05.

### Algorithm
The random draw \`u ~ Uniform[0, 1)\` is passed in as \`random_value\` so tests are deterministic.
1. If \`random_value < epsilon\`: **explore** and return action \`floor(random_value · n_actions)\`.
2. Otherwise: **exploit** and return \`argmax_a Q(a)\`.

### Inputs
- \`q_values\`: 1-D array of length n_actions
- \`epsilon\`: float in [0, 1]
- \`random_value\`: float in [0, 1)

### Expected return format
A Python \`int\`: the selected action index.

### Edge cases and conventions
- The comparison is strict: \`random_value == epsilon\` exploits. \`epsilon = 0\` always exploits; \`epsilon = 1\` always explores.
- Ties in the greedy step go to the **lowest index** (what \`np.argmax\` does).
- The explore rule \`floor(random_value · n_actions)\` is this problem's deterministic stand-in for "pick a uniformly random action".

### Constraints
NumPy only.

### Follow-up
- Real code draws a second random number for the exploratory action. Why does reusing \`random_value\` bias exploration toward low indices when ε is small?
- Compare with softmax (Boltzmann) exploration and UCB.
    `,
    examples: [
      {
        input: 'q_values = [1.0, 3.0, 2.0], epsilon = 0.1, random_value = 0.5',
        output: '1',
        explanation: '0.5 >= 0.1, so exploit: argmax([1, 3, 2]) = 1',
      },
      {
        input: 'q_values = [1.0, 2.0, 3.0, 4.0], epsilon = 0.5, random_value = 0.2',
        output: '0',
        explanation: '0.2 < 0.5, so explore: floor(0.2 · 4) = 0, even though action 3 is greedy',
      },
    ],
    starterCode: `import numpy as np

def epsilon_greedy(q_values: np.ndarray, epsilon: float,
                   random_value: float) -> int:
    """
    Select an action with the epsilon-greedy policy.

    Args:
        q_values: (n_actions,) Q-values [Q(a_0), Q(a_1), ...]
        epsilon: exploration probability in [0, 1]
        random_value: pre-drawn uniform number in [0, 1), for deterministic tests

    Returns:
        Selected action index (int)
    """
    q_values = np.array(q_values)
    n_actions = len(q_values)

    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Exploit (greedy)',
        input: '([1.0, 3.0, 2.0], 0.1, 0.5)',
        expected: '1',
        hidden: false,
      },
      {
        id: '2',
        description: 'Explore',
        input: '([1.0, 3.0, 2.0], 0.9, 0.5)',
        expected: '1',
        hidden: false,
      },
      {
        id: '3',
        description: 'Always exploit (epsilon = 0)',
        input: '([5.0, 2.0, 8.0, 1.0], 0.0, 0.99)',
        expected: '2',
        hidden: false,
      },
      {
        id: '4',
        description: 'Explore with a low random value',
        input: '([1.0, 2.0, 3.0, 4.0], 0.5, 0.2)',
        expected: '0',
        hidden: true,
      },
      {
        id: '5',
        description: 'Explore picks floor(random_value * n_actions)',
        input: 'epsilon_greedy([9.0, 0.0, 0.0, 0.0, 0.0], 1.0, 0.75)',
        expected: '3',
        hidden: true,
      },
      {
        id: '6',
        description: 'Greedy ties go to the lowest index; random_value == epsilon exploits',
        input: 'epsilon_greedy([2.0, 5.0, 5.0], 0.4, 0.4)',
        expected: '1',
        hidden: true,
      },
    ],
    hints: [
      'There are only two branches: explore or exploit. What decides which one runs?',
      'Compare random_value with epsilon first, then compute the action for that branch.',
      'Explore: int(random_value * n_actions). Exploit: int(np.argmax(q_values)).',
      'Return a plain Python int (np.argmax returns np.int64), and use a strict < so random_value == epsilon exploits.',
    ],
    solution: `import numpy as np

def epsilon_greedy(q_values: np.ndarray, epsilon: float,
                   random_value: float) -> int:
    """
    Select an action with the epsilon-greedy policy.
    """
    q_values = np.array(q_values)
    n_actions = len(q_values)

    if random_value < epsilon:
        # Explore: map the uniform draw to an action index
        return int(random_value * n_actions)

    # Exploit: greedy action (np.argmax breaks ties toward the lowest index)
    return int(np.argmax(q_values))
`,
  },
  {
    id: 'rl-bellman-value',
    title: 'Bellman Expectation (State Value)',
    section: 'reinforcement-learning',
    difficulty: 'easy',
    description: `
## Bellman Expectation (State Value)

### What you'll build
A one-state backup: compute V(s) from the possible transitions out of s and the current estimates of the next-state values.

### Background
The Bellman expectation equation says a state's value is the expected immediate reward plus the discounted value of where you land. It is the consistency condition behind policy evaluation, TD learning and every critic in actor-critic methods.

### Formula
For a policy π, the general form is
\`\`\`text
V(s) = Σ_a π(a|s) · Σ_{s'} P(s'|s,a) · [R(s,a,s') + γ·V(s')]
\`\`\`
Here the policy is already folded in, so you get a flat list of outcomes, each with its total probability p = π(a|s)·P(s'|s,a):
\`\`\`text
V(s) = Σ_i p_i · (r_i + γ · V[s'_i])
\`\`\`

### Inputs
- \`transitions\`: list of \`(probability, reward, next_state_index)\` tuples; probabilities sum to 1. The same next state may appear more than once (different rewards).
- \`gamma\`: discount factor in [0, 1]
- \`next_values\`: 1-D array, \`next_values[j]\` is the current estimate V(s_j)

### Expected return format
A Python float: V(s) **rounded to 2 decimals**.

### Edge cases and conventions
- \`gamma = 0\` gives the expected immediate reward.
- Only the states that appear in \`transitions\` matter; other entries of \`next_values\` are ignored.

### Constraints
NumPy only. A loop over transitions is fine; a vectorized version gathers \`next_values[next_states]\`.

### Follow-up
- Applying this backup to every state repeatedly is iterative policy evaluation. Why does it converge for γ < 1? (It is a γ-contraction.)
- Write the same equation in matrix form, V = R + γPV, and solve it in closed form.
    `,
    examples: [
      {
        input: 'transitions = [(0.5, 1, 0), (0.5, 2, 1)], gamma = 0.9, next_values = [5, 10]',
        output: '8.25',
        explanation: '0.5·(1 + 0.9·5) + 0.5·(2 + 0.9·10) = 2.75 + 5.5 = 8.25',
      },
      {
        input: 'transitions = [(1.0, 5, 0)], gamma = 0.9, next_values = [10]',
        output: '14.0',
        explanation: 'Deterministic: 5 + 0.9·10 = 14',
      },
    ],
    starterCode: `import numpy as np

def bellman_value(transitions: list, gamma: float,
                  next_values: np.ndarray) -> float:
    """
    Compute V(s) with the Bellman expectation equation.

    Args:
        transitions: list of (probability, reward, next_state_index) tuples
        gamma: discount factor
        next_values: (n_states,) current estimates V(s')

    Returns:
        V(s) = sum_i p_i * (r_i + gamma * V[s'_i]), rounded to 2 decimals
    """
    next_values = np.array(next_values)
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Two transitions',
        input: 'bellman_value([(0.5, 1, 0), (0.5, 2, 1)], 0.9, [5, 10])',
        expected: '8.25',
        hidden: false,
      },
      {
        id: '2',
        description: 'Deterministic transition',
        input: 'bellman_value([(1.0, 5, 0)], 0.9, [10])',
        expected: '14.0',
        hidden: false,
      },
      {
        id: '3',
        description: 'Three outcomes',
        input: 'bellman_value([(0.2, 0, 0), (0.5, 1, 1), (0.3, 2, 2)], 0.9, [0, 5, 10])',
        expected: '6.05',
        hidden: true,
      },
      {
        id: '4',
        description: 'gamma = 0 gives the expected immediate reward',
        input: 'bellman_value([(0.5, 3, 0), (0.5, 7, 1)], 0.0, [100, 200])',
        expected: '5.0',
        hidden: true,
      },
      {
        id: '5',
        description: 'Repeated next state with different rewards',
        input: 'bellman_value([(0.25, 4, 1), (0.75, -1, 1)], 0.5, [100.0, 2.0])',
        expected: '1.25',
        hidden: true,
      },
    ],
    hints: [
      'V(s) is an expectation: a probability-weighted average over the possible outcomes.',
      'For each outcome, its value is the reward plus the discounted value of the state it lands in.',
      'Loop "for p, r, s_next in transitions" and accumulate p * (r + gamma * next_values[s_next]); or gather with fancy indexing and np.sum.',
      'Discount only V(s\'), not the immediate reward, and round the final result (not each term) to 2 decimals.',
    ],
    solution: `import numpy as np

def bellman_value(transitions: list, gamma: float,
                  next_values: np.ndarray) -> float:
    """
    Compute V(s) with the Bellman expectation equation (rounded to 2 decimals).
    """
    next_values = np.array(next_values, dtype=float)

    probs = np.array([p for p, _, _ in transitions], dtype=float)
    rewards = np.array([r for _, r, _ in transitions], dtype=float)
    next_states = np.array([s for _, _, s in transitions], dtype=int)

    # V(s) = sum_i p_i * (r_i + gamma * V(s'_i))
    value = np.sum(probs * (rewards + gamma * next_values[next_states]))
    return round(float(value), 2)

# Time O(#transitions)
`,
  },

  // ==========================================
  // TABULAR CONTROL AND PREDICTION
  // ==========================================
  {
    id: 'rl-q-learning-update',
    title: 'Q-Learning Update',
    section: 'reinforcement-learning',
    difficulty: 'medium',
    description: `
## Q-Learning Update

### What you'll build
One step of tabular Q-learning: move Q(s, a) toward the Bellman optimality target after observing a transition (s, a, r, s').

### Background
Q-learning (Watkins, 1989) learns the optimal action values Q* without a model of the environment. It is **off-policy**: the target uses the best next action, max_a' Q(s', a'), whatever the behaviour policy (e.g. ε-greedy) will actually do next. DQN is this same update with a neural network in place of the table.

### Formula
\`\`\`text
target = r + γ · max_a' Q(s', a')
δ      = target - Q(s, a)              (TD error)
Q(s, a) ← Q(s, a) + α · δ
\`\`\`
- α: learning rate in (0, 1]
- γ: discount factor in [0, 1]
Only the entry Q[s, a] changes.

### Inputs
- \`Q\`: (n_states, n_actions) Q-table
- \`state\`, \`action\`, \`next_state\`: int indices
- \`reward\`: float
- \`alpha\`, \`gamma\`: floats

### Expected return format
The updated (n_states, n_actions) Q-table as a float array (a nested list also passes), **rounded to 1 decimal**. Don't modify the input in place; work on a copy.

### Edge cases and conventions
- This problem has no \`done\` flag. To model a terminal transition, pass \`gamma = 0\` (the target is then just r).
- The max is over the **next** state's row, including negative values: if every Q(s', ·) is negative, the max is negative.

### Constraints
NumPy only; no loops needed.

### Follow-up
- Why does the max make Q-learning overestimate values, and how does Double Q-learning fix it?
- What conditions on α and exploration guarantee convergence to Q*?
    `,
    examples: [
      {
        input: 'Q = [[0, 0], [0, 0]], s = 0, a = 1, r = 1, s\' = 1, α = 0.1, γ = 0.9',
        output: '[[0.0, 0.1], [0.0, 0.0]]',
        explanation: 'target = 1 + 0.9·0 = 1, so Q[0, 1] = 0 + 0.1·(1 - 0) = 0.1',
      },
      {
        input: 'Q = [[1, 2], [3, 4]], s = 0, a = 0, r = 5, s\' = 1, α = 0.5, γ = 0.9',
        output: '[[4.8, 2.0], [3.0, 4.0]]',
        explanation: 'target = 5 + 0.9·max(3, 4) = 8.6, so Q[0, 0] = 1 + 0.5·(8.6 - 1) = 4.8',
      },
    ],
    starterCode: `import numpy as np

def q_learning_update(Q: np.ndarray, state: int, action: int,
                      reward: float, next_state: int,
                      alpha: float, gamma: float) -> np.ndarray:
    """
    Perform one Q-learning update.

    Args:
        Q: (n_states, n_actions) Q-table
        state: current state index s
        action: action taken a
        reward: reward received r
        next_state: next state index s'
        alpha: learning rate
        gamma: discount factor

    Returns:
        Updated (n_states, n_actions) Q-table (a copy), rounded to 1 decimal
    """
    Q = np.array(Q, dtype=float)
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Simple update',
        input: '([[0, 0], [0, 0]], 0, 1, 1.0, 1, 0.1, 0.9)',
        expected: '[[0.0, 0.1], [0.0, 0.0]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'With existing values (bootstraps from max of next row)',
        input: '([[1, 2], [3, 4]], 0, 0, 5.0, 1, 0.5, 0.9)',
        expected: '[[4.8, 2.0], [3.0, 4.0]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Terminal transition modelled with gamma = 0',
        input: '([[0, 0], [0, 0]], 0, 0, 10.0, 1, 1.0, 0.0)',
        expected: '[[10.0, 0.0], [0.0, 0.0]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Small learning rate with large Q values',
        input: '([[10, 20], [30, 40]], 1, 1, 0.0, 0, 0.1, 0.9)',
        expected: '[[10.0, 20.0], [30.0, 37.8]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Max over a next row of negative values',
        input: 'np.round(np.array(q_learning_update([[0.0, 0.0], [-1.0, -3.0]], 0, 0, 2.0, 1, 0.5, 1.0), dtype=float), 4).tolist()',
        expected: '[[0.5, 0.0], [-1.0, -3.0]]',
        hidden: true,
      },
    ],
    hints: [
      'The update nudges one table entry toward a better estimate of its value. What is that better estimate?',
      'Compute the target from the reward and the best next-state value, then the TD error, then the step.',
      'max_next = np.max(Q[next_state]); td_error = reward + gamma * max_next - Q[state, action]; Q[state, action] += alpha * td_error.',
      'Take the max over the next state\'s row (Q[next_state]), not over the whole table or the current state, and round to 1 decimal at the end.',
    ],
    solution: `import numpy as np

def q_learning_update(Q: np.ndarray, state: int, action: int,
                      reward: float, next_state: int,
                      alpha: float, gamma: float) -> np.ndarray:
    """
    Perform one Q-learning update; returns a rounded copy of the table.
    """
    Q = np.array(Q, dtype=float)  # copy: the caller's table is unchanged

    # Bellman optimality target: bootstrap from the best next action (off-policy)
    td_target = reward + gamma * np.max(Q[next_state])
    td_error = td_target - Q[state, action]

    Q[state, action] += alpha * td_error
    return np.round(Q, 1)

# Time O(n_actions) for the max (plus O(n_states * n_actions) for the copy)
`,
  },
  {
    id: 'rl-sarsa-update',
    title: 'SARSA Update',
    section: 'reinforcement-learning',
    difficulty: 'medium',
    description: `
## SARSA Update

### What you'll build
One step of SARSA, the **on-policy** cousin of Q-learning, which bootstraps from the action the agent actually takes next.

### Background
SARSA is named after the tuple it learns from: (S, A, R, S', A'). Because it evaluates the policy it is following (exploration included), it learns safer behaviour when exploratory mistakes are costly. In the classic cliff-walking task, SARSA learns the path away from the cliff edge, while Q-learning learns the optimal edge path and falls off during ε-greedy exploration.

### Formula
\`\`\`text
target = r + γ · Q(s', a')        (a' = the next action actually taken)
δ      = target - Q(s, a)
Q(s, a) ← Q(s, a) + α · δ
\`\`\`

| | SARSA | Q-learning |
|---|---|---|
| Bootstrap value | Q(s', a') for the action taken | max over a' of Q(s', a') |
| Policy type | On-policy | Off-policy |
| Learns | Value of the behaviour policy | Value of the greedy policy |

### Inputs
- \`Q\`: (n_states, n_actions) Q-table
- \`state\`, \`action\`, \`next_state\`, \`next_action\`: int indices
- \`reward\`, \`alpha\`, \`gamma\`: floats

### Expected return format
The updated (n_states, n_actions) Q-table as a float array (a nested list also passes), **rounded to 2 decimals**. Work on a copy.

### Edge cases and conventions
- Only Q[state, action] changes.
- No \`done\` flag: a terminal transition is modelled with \`gamma = 0\`.

### Constraints
NumPy only.

### Follow-up
- Expected SARSA replaces Q(s', a') with Σ_a' π(a'|s')·Q(s', a'). Why does that lower variance?
- With ε → 0 over time, what do SARSA and Q-learning converge to?
    `,
    examples: [
      {
        input: 'Q = [[1, 2], [3, 4]], s = 0, a = 0, r = 5, s\' = 1, a\' = 0, α = 0.5, γ = 0.9',
        output: '[[4.35, 2.0], [3.0, 4.0]]',
        explanation: 'target = 5 + 0.9·Q[1, 0] = 7.7, so Q[0, 0] = 1 + 0.5·(7.7 - 1) = 4.35',
      },
      {
        input: 'Same, but a\' = 1',
        output: '[[4.8, 2.0], [3.0, 4.0]]',
        explanation: 'target = 5 + 0.9·Q[1, 1] = 8.6; it matches Q-learning only because a\' happens to be the greedy action',
      },
    ],
    starterCode: `import numpy as np

def sarsa_update(Q: np.ndarray, state: int, action: int, reward: float,
                 next_state: int, next_action: int,
                 alpha: float, gamma: float) -> np.ndarray:
    """
    Perform one SARSA update.

    Args:
        Q: (n_states, n_actions) Q-table
        state: current state s
        action: action taken a
        reward: reward received r
        next_state: next state s'
        next_action: next action a' (the one that will actually be taken)
        alpha: learning rate
        gamma: discount factor

    Returns:
        Updated (n_states, n_actions) Q-table (a copy), rounded to 2 decimals
    """
    Q = np.array(Q, dtype=float)
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Basic SARSA update',
        input: '([[1, 2], [3, 4]], 0, 0, 5.0, 1, 0, 0.5, 0.9)',
        expected: '[[4.35, 2.0], [3.0, 4.0]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Different next action',
        input: '([[1, 2], [3, 4]], 0, 0, 5.0, 1, 1, 0.5, 0.9)',
        expected: '[[4.8, 2.0], [3.0, 4.0]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'From zero',
        input: '([[0, 0], [0, 0]], 0, 1, 1.0, 1, 0, 0.1, 0.9)',
        expected: '[[0.0, 0.1], [0.0, 0.0]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'SARSA uses the actual next action, not the max',
        input: '([[0, 0], [5, 10]], 0, 0, 1.0, 1, 0, 0.5, 0.9)',
        expected: '[[2.75, 0.0], [5.0, 10.0]]',
        hidden: true,
      },
    ],
    hints: [
      'This is Q-learning with one change: which next-state value do you bootstrap from?',
      'Read Q at (next_state, next_action), build the target, then take a step of size alpha toward it.',
      'td_error = reward + gamma * Q[next_state, next_action] - Q[state, action]; Q[state, action] += alpha * td_error.',
      'Don\'t take np.max over the next row (that is Q-learning), and round to 2 decimals at the end.',
    ],
    solution: `import numpy as np

def sarsa_update(Q: np.ndarray, state: int, action: int, reward: float,
                 next_state: int, next_action: int,
                 alpha: float, gamma: float) -> np.ndarray:
    """
    Perform one SARSA update; returns a rounded copy of the table.
    """
    Q = np.array(Q, dtype=float)  # copy

    # On-policy target: bootstrap from the action actually taken next
    td_target = reward + gamma * Q[next_state, next_action]
    td_error = td_target - Q[state, action]

    Q[state, action] += alpha * td_error
    return np.round(Q, 2)
`,
  },
  {
    id: 'rl-td0-prediction',
    title: 'TD(0) Value Prediction',
    section: 'reinforcement-learning',
    difficulty: 'medium',
    description: `
## TD(0) Value Prediction

### What you'll build
The TD(0) update for state values: after one transition (s, r, s'), move V(s) toward the bootstrapped target r + γ·V(s').

### Background
Temporal-difference learning updates estimates from other estimates (**bootstrapping**), so it learns online after every step instead of waiting for the episode to end like Monte Carlo. The TD error δ is the learning signal in actor-critic methods and the building block of GAE.

### Formula
\`\`\`text
target = r + γ · V(s')       if s' is not terminal
target = r                   if done (a terminal state has value 0)
δ      = target - V(s)
V(s)  ← V(s) + α · δ
\`\`\`

| | TD(0) | Monte Carlo |
|---|---|---|
| Target | r + γ·V(s') | full return G_t |
| Update | every step | end of episode |
| Bias | biased (uses an estimate) | unbiased |
| Variance | low | high |

### Inputs
- \`V\`: 1-D array of state values, length n_states
- \`state\`, \`next_state\`: int indices
- \`reward\`, \`alpha\`, \`gamma\`: floats
- \`done\`: bool, True if \`next_state\` is terminal

### Expected return format
The updated value array (a list also passes), **rounded to 2 decimals**. Work on a copy; only V[state] changes.

### Edge cases and conventions
When \`done=True\`, ignore V[next_state] entirely, whatever value is stored there.

### Constraints
NumPy only.

### Follow-up
- On a fixed batch of data, TD(0) and Monte Carlo converge to different answers. Which one fits the maximum-likelihood Markov model?
- How does TD(λ) interpolate between TD(0) and Monte Carlo?
    `,
    examples: [
      {
        input: 'V = [0, 0, 0], s = 0, r = 1, s\' = 1, α = 0.1, γ = 0.9, done = False',
        output: '[0.1, 0.0, 0.0]',
        explanation: 'δ = 1 + 0.9·0 - 0 = 1, so V[0] = 0.1',
      },
      {
        input: 'V = [5, 10, 15], s = 1, r = 2, s\' = 2, α = 0.1, γ = 0.9, done = False',
        output: '[5.0, 10.55, 15.0]',
        explanation: 'δ = 2 + 0.9·15 - 10 = 5.5, so V[1] = 10 + 0.55 = 10.55',
      },
    ],
    starterCode: `import numpy as np

def td0_update(V: np.ndarray, state: int, reward: float,
               next_state: int, alpha: float, gamma: float,
               done: bool = False) -> np.ndarray:
    """
    Perform one TD(0) value update.

    Args:
        V: (n_states,) value estimates
        state: current state s
        reward: reward received r
        next_state: next state s'
        alpha: learning rate
        gamma: discount factor
        done: True if next_state is terminal (its value counts as 0)

    Returns:
        Updated (n_states,) values (a copy), rounded to 2 decimals
    """
    V = np.array(V, dtype=float)
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Non-terminal transition',
        input: '([0, 0, 0], 0, 1.0, 1, 0.1, 0.9, False)',
        expected: '[0.1, 0.0, 0.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Terminal transition',
        input: '([0, 0, 0], 0, 10.0, 1, 0.5, 0.9, True)',
        expected: '[5.0, 0.0, 0.0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'With existing values',
        input: '([5, 10, 15], 1, 2.0, 2, 0.1, 0.9, False)',
        expected: '[5.0, 10.55, 15.0]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Terminal vs non-terminal difference',
        input: `(lambda: (
    v1 := td0_update([0.0, 10.0], 0, 1.0, 1, 0.5, 0.9, False),
    v2 := td0_update([0.0, 10.0], 0, 1.0, 1, 0.5, 0.9, True),
    bool(v1[0] > v2[0])
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'done=True ignores the stored V(s\')',
        input: 'np.round(np.array(td0_update([0.0, 100.0], 0, 1.0, 1, 1.0, 0.9, True), dtype=float), 4).tolist()',
        expected: '[1.0, 100.0]',
        hidden: true,
      },
    ],
    hints: [
      'TD(0) compares what you predicted for s with a one-step look-ahead estimate of it.',
      'Decide the next-state value first (0 when done), then form the target, the TD error, and the step.',
      'next_v = 0.0 if done else V[next_state]; delta = reward + gamma * next_v - V[state]; V[state] += alpha * delta.',
      'When done is True, don\'t read V[next_state] at all: a terminal state has value 0 even if the array holds something else.',
    ],
    solution: `import numpy as np

def td0_update(V: np.ndarray, state: int, reward: float,
               next_state: int, alpha: float, gamma: float,
               done: bool = False) -> np.ndarray:
    """
    Perform one TD(0) value update; returns a rounded copy.
    """
    V = np.array(V, dtype=float)  # copy

    # A terminal next state contributes no future value
    next_value = 0.0 if done else V[next_state]

    td_error = reward + gamma * next_value - V[state]
    V[state] += alpha * td_error
    return np.round(V, 2)
`,
  },
  {
    id: 'rl-value-iteration',
    title: 'Value Iteration Step',
    section: 'reinforcement-learning',
    difficulty: 'medium',
    description: `
## Value Iteration Step

### What you'll build
One synchronous sweep of value iteration: back up every state with the Bellman **optimality** operator, using a known model of the MDP.

### Background
When transition probabilities and rewards are known, dynamic programming can compute optimal values directly. Value iteration applies the Bellman optimality backup to all states and repeats until V stops changing; the greedy policy with respect to the result is optimal. Q-learning is the sample-based, model-free version of this backup.

### Formula
For every state s:
\`\`\`text
Q(s, a)   = Σ_{(p, r, s')} p · (r + γ · V_old[s'])
V_new[s]  = max_a Q(s, a)
\`\`\`

### Algorithm (one sweep)
1. Start from \`V_new = zeros(n_states)\`.
2. For each state s that has an entry in \`transitions\`, compute Q(s, a) for each action a from **V_old** (the input), and set V_new[s] = max_a Q(s, a).
3. States with no entry in \`transitions\` are terminal: V_new[s] = 0.
4. Return V_new.

### Inputs
- \`V\`: 1-D array of current values, length n_states
- \`transitions\`: dict, \`transitions[s][a]\` = list of \`(prob, reward, next_state)\` tuples
- \`gamma\`: discount factor in [0, 1]

### Expected return format
The new value array (a list also passes), **rounded to 1 decimal**.

### Edge cases and conventions
- **Synchronous** update: every Q(s, a) reads the old V. Don't let V_new[0] leak into the backup of state 1 within the same sweep.
- A state missing from \`transitions\` gets 0.

### Constraints
NumPy only. Loops over states and actions are fine.

### Follow-up
- In-place (Gauss–Seidel) value iteration uses fresh values as soon as they exist. Does it still converge? Is it faster?
- Compare value iteration with policy iteration. Cost per sweep: O(|S|²·|A|).
    `,
    examples: [
      {
        input: 'V = [0, 0], transitions = {0: {0: [(1.0, 1.0, 0)], 1: [(1.0, 5.0, 1)]}, 1: {0: [(1.0, 2.0, 0)], 1: [(1.0, 0.0, 1)]}}, gamma = 0.9',
        output: '[5.0, 2.0]',
        explanation: 'With V = 0 only rewards count: V[0] = max(1, 5) = 5, V[1] = max(2, 0) = 2',
      },
      {
        input: 'Same MDP, V = [5, 2]',
        output: '[6.8, 6.5]',
        explanation: 'V[0] = max(1 + 0.9·5, 5 + 0.9·2) = max(5.5, 6.8); V[1] = max(2 + 0.9·5, 0 + 0.9·2) = max(6.5, 1.8)',
      },
    ],
    starterCode: `import numpy as np

def value_iteration_step(V: np.ndarray, transitions: dict,
                         gamma: float) -> np.ndarray:
    """
    Perform one synchronous sweep of value iteration.

    Args:
        V: (n_states,) current values
        transitions: transitions[s][a] = [(prob, reward, next_state), ...]
        gamma: discount factor

    Returns:
        (n_states,) new values, V_new[s] = max_a Q(s, a), rounded to 1 decimal
        (states without transitions are terminal and get 0)
    """
    V = np.array(V, dtype=float)
    n_states = len(V)
    V_new = np.zeros(n_states)

    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Simple 2-state MDP',
        input: `([0.0, 0.0], {0: {0: [(1.0, 1.0, 0)], 1: [(1.0, 5.0, 1)]}, 1: {0: [(1.0, 2.0, 0)], 1: [(1.0, 0.0, 1)]}}, 0.9)`,
        expected: '[5.0, 2.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'With existing values',
        input: `([5.0, 2.0], {0: {0: [(1.0, 1.0, 0)], 1: [(1.0, 5.0, 1)]}, 1: {0: [(1.0, 2.0, 0)], 1: [(1.0, 0.0, 1)]}}, 0.9)`,
        expected: '[6.8, 6.5]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Single state single action',
        input: `([0.0], {0: {0: [(1.0, 3.0, 0)]}}, 0.9)`,
        expected: '[3.0]',
        hidden: true,
      },
      {
        id: '4',
        description: 'No discount (gamma = 0)',
        input: `([10.0, 20.0], {0: {0: [(1.0, 1.0, 0)], 1: [(1.0, 5.0, 1)]}, 1: {0: [(1.0, 2.0, 0)], 1: [(1.0, 0.0, 1)]}}, 0.0)`,
        expected: '[5.0, 2.0]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Stochastic transitions',
        input: `value_iteration_step([1.0, 2.0, 0.0], {0: {0: [(0.5, 1.0, 1), (0.5, 0.0, 2)], 1: [(1.0, 0.5, 0)]}, 1: {0: [(0.2, 3.0, 0), (0.8, 0.0, 1)]}, 2: {0: [(1.0, 0.0, 2)]}}, 0.5)`,
        expected: '[1.0, 1.5, 0.0]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Terminal state (no transitions) gets 0; backups read the old V',
        input: `value_iteration_step([0.2, 2.0, 7.0], {0: {0: [(0.8, 1.0, 1), (0.2, 0.0, 0)], 1: [(1.0, 0.0, 2)]}, 1: {0: [(1.0, 2.0, 0)]}}, 0.9)`,
        expected: '[6.3, 2.2, 0.0]',
        hidden: true,
      },
    ],
    hints: [
      'Value iteration is the Bellman expectation backup with a max over actions on top.',
      'For each state: compute one expected value per action, then keep the largest. Skip states with no transitions (they stay 0).',
      'q = sum(p * (r + gamma * V[s2]) for p, r, s2 in transitions[s][a]); V_new[s] = max over a of q; return np.round(V_new, 1).',
      'Read only from the old V and write only into V_new; updating V in place mixes old and new values within one sweep.',
    ],
    solution: `import numpy as np

def value_iteration_step(V: np.ndarray, transitions: dict,
                         gamma: float) -> np.ndarray:
    """
    One synchronous Bellman optimality sweep (rounded to 1 decimal).
    """
    V = np.array(V, dtype=float)
    n_states = len(V)
    V_new = np.zeros(n_states)  # terminal states (no transitions) stay 0

    for s in range(n_states):
        if s not in transitions:
            continue

        # Q(s, a) for every action, always reading the OLD values V
        q_values = [
            sum(p * (r + gamma * V[s2]) for p, r, s2 in outcomes)
            for outcomes in transitions[s].values()
        ]
        V_new[s] = max(q_values)

    return np.round(V_new, 1)

# Time O(total number of (s, a, s') outcomes) per sweep
`,
  },

  // ==========================================
  // POLICY GRADIENTS AND PPO
  // ==========================================
  {
    id: 'rl-policy-gradient',
    title: 'REINFORCE Policy Gradient',
    section: 'reinforcement-learning',
    difficulty: 'hard',
    description: `
## REINFORCE Policy Gradient

### What you'll build
The REINFORCE (Monte Carlo policy gradient) estimate ∇_θ J for a tabular softmax policy, from one recorded episode.

### Background
Value-based methods learn Q and act greedily; policy-gradient methods adjust the policy's parameters directly in the direction that makes high-return actions more likely. REINFORCE (Williams, 1992) is the simplest such method and the ancestor of actor-critic, PPO and the RL used to fine-tune LLMs.

### Formula
Policy gradient theorem, estimated from one episode:
\`\`\`text
∇_θ J ≈ Σ_t G_t · ∇_θ log π(a_t | s_t)
G_t   = r_t + γ·r_{t+1} + γ²·r_{t+2} + ...      (return from step t to the end)
\`\`\`
Tabular softmax policy, with θ of shape (n_states, n_actions):
\`\`\`text
π(·|s) = softmax(θ[s])
∇_{θ[s]} log π(a|s) = one_hot(a) - π(·|s)       (zero for every other row)
\`\`\`

### Algorithm
1. Compute G_t for every step with one backward pass: G = r_t + γ·G.
2. For each step t with state s_t and action a_t: add G_t · (one_hot(a_t) - softmax(θ[s_t])) to row s_t of the gradient.
3. Return the accumulated gradient.

### Inputs
- \`theta\`: (n_states, n_actions) float array of logits
- \`episode\`: list of \`(state, action, reward)\` tuples, where reward is the reward received after taking that action
- \`gamma\`: discount factor

### Expected return format
A NumPy array with the same shape as \`theta\`, **rounded to 2 decimals**. It is the **ascent** direction (gradient of J, not of a loss): θ ← θ + lr · gradient improves the policy.

### Edge cases and conventions
- An empty episode gives an all-zero gradient.
- A state visited several times accumulates one contribution per visit; unvisited rows stay 0.
- Use the softmax with the max subtracted (the provided helper) for stability.

### Constraints
NumPy only. Compute probabilities from \`theta\` as given; don't update theta during the episode.

### Follow-up
- Subtracting a baseline b(s) from G_t keeps the estimate unbiased and lowers variance. Why is the bias still zero?
- Why does this estimator have high variance, and how do GAE and PPO address it?
    `,
    examples: [
      {
        input: 'theta = zeros((2, 2)), episode = [(0, 1, 1.0), (1, 0, 1.0)], gamma = 0.9',
        output: '[[-0.95, 0.95], [0.5, -0.5]]',
        explanation: 'G = [1.9, 1.0] and π = [0.5, 0.5]: row 0 gets 1.9·([0, 1] - 0.5), row 1 gets 1.0·([1, 0] - 0.5)',
      },
      {
        input: 'theta = zeros((2, 2)), episode = [(0, 0, 5.0)], gamma = 0.9',
        output: '[[2.5, -2.5], [0.0, 0.0]]',
        explanation: 'One step with G = 5: 5·([1, 0] - [0.5, 0.5]); state 1 was never visited',
      },
    ],
    starterCode: `import numpy as np

def softmax(x):
    """Compute softmax probabilities."""
    exp_x = np.exp(x - np.max(x))
    return exp_x / np.sum(exp_x)

def reinforce_gradient(theta: np.ndarray, episode: list,
                       gamma: float) -> np.ndarray:
    """
    Compute the REINFORCE policy gradient for a tabular softmax policy.

    Args:
        theta: (n_states, n_actions) policy logits
        episode: list of (state, action, reward) tuples
        gamma: discount factor

    Returns:
        (n_states, n_actions) gradient of sum_t G_t * log pi(a_t|s_t),
        rounded to 2 decimals
    """
    theta = np.array(theta, dtype=float)
    n_states, n_actions = theta.shape
    gradient = np.zeros_like(theta)

    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Simple episode',
        input: 'bool(np.allclose(reinforce_gradient(np.zeros((2, 2)), [(0, 1, 1.0), (1, 0, 1.0)], 0.9), [[-0.95, 0.95], [0.5, -0.5]], atol=0.01))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Single step episode',
        input: 'bool(np.allclose(reinforce_gradient(np.zeros((2, 2)), [(0, 0, 5.0)], 0.9), [[2.5, -2.5], [0.0, 0.0]], atol=0.01))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Empty episode returns zero gradient',
        input: 'bool(np.allclose(reinforce_gradient(np.zeros((3, 2)), [], 0.9), np.zeros((3, 2))))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Gradient shape matches theta shape',
        input: 'reinforce_gradient(np.ones((4, 3)), [(0, 1, 2.0), (2, 0, 1.0)], 0.95).shape',
        expected: '(4, 3)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Non-uniform policy: G * (one_hot(a) - softmax(theta[s]))',
        input: 'bool(np.allclose(reinforce_gradient(np.array([[0.5, -0.5], [1.0, 0.0]]), [(0, 0, 2.0)], 0.9), [[0.54, -0.54], [0.0, 0.0]], atol=0.01))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Repeated state accumulates one term per visit',
        input: 'bool(np.allclose(reinforce_gradient(np.array([[0.0, 1.0, -1.0]]), [(0, 2, 1.0), (0, 1, 0.0), (0, 0, 2.0)], 0.5), [[0.9, -1.99, 1.09]], atol=0.01))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Two ingredients per step: how good the rest of the episode was (G_t), and how to make the taken action more likely (∇ log π).',
      'First compute all returns with one backward pass, then loop forward over the steps and add each contribution to row s_t.',
      'G = r_t + gamma * G going backwards; grad_log_pi = -softmax(theta[s]); grad_log_pi[a] += 1; gradient[s] += G_t * grad_log_pi.',
      'Use the return from step t onward (not the whole-episode return for every step), use += so repeated states accumulate, and handle the empty episode.',
    ],
    solution: `import numpy as np

def softmax(x):
    """Compute softmax probabilities."""
    exp_x = np.exp(x - np.max(x))
    return exp_x / np.sum(exp_x)

def reinforce_gradient(theta: np.ndarray, episode: list,
                       gamma: float) -> np.ndarray:
    """
    REINFORCE gradient (ascent direction), rounded to 2 decimals.
    """
    theta = np.array(theta, dtype=float)
    gradient = np.zeros_like(theta)

    T = len(episode)
    if T == 0:
        return gradient

    # Returns G_t, computed backwards: G_t = r_t + gamma * G_{t+1}
    returns = np.zeros(T)
    G = 0.0
    for t in range(T - 1, -1, -1):
        G = episode[t][2] + gamma * G
        returns[t] = G

    for (state, action, _), G_t in zip(episode, returns):
        # grad of log softmax(theta[s])[a] w.r.t. theta[s] = one_hot(a) - pi(.|s)
        grad_log_pi = -softmax(theta[state])
        grad_log_pi[action] += 1.0
        gradient[state] += G_t * grad_log_pi  # += : revisited states accumulate

    return np.round(gradient, 2)

# Time O(T * n_actions)
`,
  },
  {
    id: 'rl-advantage-estimation',
    title: 'Advantage Estimation (GAE)',
    section: 'reinforcement-learning',
    difficulty: 'hard',
    description: `
## Generalized Advantage Estimation (GAE)

### What you'll build
GAE(γ, λ) advantages for one trajectory, computed with the standard backward recursion used in every PPO implementation.

### Background
The advantage A(s, a) = Q(s, a) - V(s) says how much better an action was than the policy's average. Policy gradients weighted by advantages instead of raw returns have far lower variance. GAE (Schulman et al., 2016) blends one-step TD errors with an exponential weight λ, trading bias (small λ, trusts the critic) against variance (large λ, trusts the sampled rewards).

### Formula
\`\`\`text
δ_t = r_t + γ · V(s_{t+1}) - V(s_t)                 (TD error)
Â_t = Σ_{l=0}^{T-1-t} (γλ)^l · δ_{t+l}
    = δ_t + γλ · Â_{t+1}        with Â_T = 0         (backward recursion)
\`\`\`
- λ = 0: Â_t = δ_t (one-step TD: low variance, biased)
- λ = 1: Â_t = G_t - V(s_t) (Monte Carlo return minus baseline: unbiased, high variance)
- Typical: γ = 0.99, λ = 0.95

### Inputs
- \`rewards\`: (T,) rewards r_0 ... r_{T-1}
- \`values\`: (T+1,) critic values V(s_0) ... V(s_T). The last entry is the bootstrap value of the state after the final step: pass 0 if the episode terminated there, or the critic's estimate if the trajectory was truncated.
- \`gamma\`, \`lam\`: floats in [0, 1]

### Expected return format
A NumPy array of shape (T,), **rounded to 2 decimals**.

### Edge cases and conventions
- T = 1 gives Â_0 = δ_0.
- Iterate from t = T-1 down to 0; Â_{T-1} = δ_{T-1}.

### Constraints
NumPy only. O(T) time: don't compute the double sum.

### Follow-up
- Implementations also return value targets: returns = advantages + values[:-1]. Why is that the TD(λ) return?
- With several episodes in one rollout buffer, how do you stop the recursion from leaking across an episode boundary? (Multiply by (1 - done_t).)
    `,
    examples: [
      {
        input: 'rewards = [1, 1, 1], values = [0, 0, 0, 0], gamma = 0.99, lam = 0.95',
        output: '[2.83, 1.94, 1.0]',
        explanation: 'All δ = 1; Â_2 = 1, Â_1 = 1 + 0.9405·1 = 1.9405, Â_0 = 1 + 0.9405·1.9405 = 2.825',
      },
      {
        input: 'rewards = [1, 2, 3], values = [1, 2, 3, 0], gamma = 0.9, lam = 0.9',
        output: '[3.99, 2.7, 0.0]',
        explanation: 'δ = [1 + 0.9·2 - 1, 2 + 0.9·3 - 2, 3 + 0 - 3] = [1.8, 2.7, 0]; Â_1 = 2.7 + 0.81·0 = 2.7, Â_0 = 1.8 + 0.81·2.7 = 3.987',
      },
    ],
    starterCode: `import numpy as np

def compute_gae(rewards: np.ndarray, values: np.ndarray,
                gamma: float, lam: float) -> np.ndarray:
    """
    Compute Generalized Advantage Estimation.

    Args:
        rewards: (T,) rewards r_0 ... r_{T-1}
        values: (T+1,) values V(s_0) ... V(s_T); the last entry is the
                bootstrap value (0 if the episode terminated)
        gamma: discount factor
        lam: GAE lambda

    Returns:
        (T,) advantages A_0 ... A_{T-1}, rounded to 2 decimals
    """
    rewards = np.array(rewards, dtype=float)
    values = np.array(values, dtype=float)
    T = len(rewards)
    advantages = np.zeros(T)

    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Zero values baseline',
        input: 'bool(np.allclose(compute_gae([1, 1, 1], [0, 0, 0, 0], 0.99, 0.95), [2.825, 1.9405, 1.0], atol=0.01))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'With value estimates',
        input: 'bool(np.allclose(compute_gae([1, 2, 3], [1, 2, 3, 0], 0.9, 0.9), [3.987, 2.7, 0.0], atol=0.01))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Single step',
        input: 'bool(np.allclose(compute_gae([5], [1, 0], 0.99, 0.95), [4.0], atol=0.01))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Lambda = 0 gives one-step TD errors',
        input: `(lambda: (
    adv := compute_gae([1, 2, 3], [0, 0, 0, 0], 0.9, 0.0),
    bool(np.allclose(adv, [1.0, 2.0, 3.0], atol=0.01))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Lambda = 1: advantages = discounted returns minus values',
        input: 'bool(np.allclose(compute_gae([1.0, -1.0, 2.0, 0.5], [0.3, -0.2, 0.7, 1.1, 0.0], 0.9, 1.0), [1.7845, 1.405, 1.75, -0.6], atol=0.01))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Truncated trajectory bootstraps from the last value',
        input: 'bool(np.allclose(compute_gae([0.0, 0.0, 1.0], [0.5, 0.5, 0.5, 2.0], 0.9, 0.8), [1.1063, 1.606, 2.3], atol=0.01))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'An advantage is a discounted sum of future TD errors, and sums of the future are easiest to build from the end.',
      'Compute δ_t for each step, then sweep backwards keeping a running advantage.',
      'delta = rewards[t] + gamma * values[t + 1] - values[t]; gae = delta + gamma * lam * gae; advantages[t] = gae.',
      'values has T+1 entries: use values[t + 1] for the next state (the last one is the bootstrap value), and reset gae = 0 before the loop.',
    ],
    solution: `import numpy as np

def compute_gae(rewards: np.ndarray, values: np.ndarray,
                gamma: float, lam: float) -> np.ndarray:
    """
    GAE(gamma, lambda) advantages, rounded to 2 decimals.
    """
    rewards = np.array(rewards, dtype=float)
    values = np.array(values, dtype=float)
    T = len(rewards)
    advantages = np.zeros(T)

    gae = 0.0  # A_T = 0
    for t in range(T - 1, -1, -1):
        # TD error; values[t + 1] is the bootstrap value at the last step
        delta = rewards[t] + gamma * values[t + 1] - values[t]
        # A_t = delta_t + gamma * lambda * A_{t+1}
        gae = delta + gamma * lam * gae
        advantages[t] = gae

    return np.round(advantages, 2)

# Time O(T), space O(T)
`,
  },
  {
    id: 'rl-ppo-clip',
    title: 'PPO Clipped Objective',
    section: 'reinforcement-learning',
    difficulty: 'hard',
    description: `
## PPO Clipped Objective

### What you'll build
The clipped surrogate objective L^CLIP of Proximal Policy Optimization for a batch of sampled actions.

### Background
After collecting a batch with the old policy π_old, PPO takes several gradient steps on it. Without a brake, those steps can push the new policy far from π_old, where the old samples no longer tell you anything. PPO clips the probability ratio so that moving it beyond [1 - ε, 1 + ε] earns no extra objective. It is the default on-policy deep RL algorithm and the optimizer in classic RLHF.

### Formula
\`\`\`text
ratio_t = π_θ(a_t|s_t) / π_old(a_t|s_t)
L^CLIP  = mean_t [ min( ratio_t · A_t,  clip(ratio_t, 1-ε, 1+ε) · A_t ) ]
\`\`\`
How the min behaves:
- A > 0 (good action): the objective grows with the ratio only up to 1 + ε.
- A < 0 (bad action): the objective stops improving once the ratio falls below 1 - ε.
- When the change makes things worse (for example ratio > 1 + ε with A < 0), the unclipped term is smaller, so the min keeps it: the objective stays pessimistic.

### Inputs
- \`old_probs\`, \`new_probs\`: (N,) probabilities of the **taken** actions under π_old and π_θ, in (0, 1]
- \`advantages\`: (N,) advantage estimates
- \`epsilon\`: clip range, typically 0.2

### Expected return format
A Python float: L^CLIP (to **maximize**; the training loss is its negative), **rounded to 2 decimals**.

### Edge cases and conventions
- Compute the ratio as \`new_probs / (old_probs + 1e-8)\`.
- Average with the plain mean over the N samples.

### Constraints
NumPy only, vectorized.

### Follow-up
- Real implementations work with log-probs: ratio = exp(logp_new - logp_old). Why?
- What does "clip fraction" measure, and what is the value-function and entropy part of the full PPO loss?
    `,
    examples: [
      {
        input: 'old_probs = [0.5], new_probs = [0.6], advantages = [1.0], epsilon = 0.2',
        output: '1.2',
        explanation: 'ratio = 1.2 is inside [0.8, 1.2]: min(1.2·1, 1.2·1) = 1.2',
      },
      {
        input: 'old_probs = [0.5], new_probs = [0.7], advantages = [-1.0], epsilon = 0.2',
        output: '-1.4',
        explanation: 'ratio = 1.4, A < 0: min(-1.4, 1.2·(-1) = -1.2) = -1.4, so the harmful change is not clipped away',
      },
      {
        input: 'old_probs = [0.5], new_probs = [0.2], advantages = [1.0], epsilon = 0.2',
        output: '0.4',
        explanation: 'ratio = 0.4 with A > 0: min(0.4, 0.8) = 0.4; clipping never hides a drop in a good action\'s probability',
      },
    ],
    starterCode: `import numpy as np

def ppo_clip_objective(old_probs: np.ndarray, new_probs: np.ndarray,
                       advantages: np.ndarray, epsilon: float) -> float:
    """
    Compute the PPO clipped surrogate objective.

    Args:
        old_probs: (N,) pi_old(a|s) of the taken actions
        new_probs: (N,) pi_theta(a|s) of the taken actions
        advantages: (N,) advantage estimates A_t
        epsilon: clipping parameter (e.g. 0.2)

    Returns:
        mean_t min(ratio_t * A_t, clip(ratio_t, 1-eps, 1+eps) * A_t)
        as a float (to maximize), rounded to 2 decimals
    """
    old_probs = np.array(old_probs, dtype=float)
    new_probs = np.array(new_probs, dtype=float)
    advantages = np.array(advantages, dtype=float)

    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'No change in policy: objective is the mean advantage',
        input: '([0.5, 0.5], [0.5, 0.5], [1.0, -1.0], 0.2)',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'Positive advantage, ratio > 1 + epsilon is clipped',
        input: '([0.5], [0.7], [1.0], 0.2)',
        expected: '1.2',
        hidden: false,
      },
      {
        id: '3',
        description: 'Negative advantage, ratio > 1 keeps the unclipped term',
        input: '([0.5], [0.7], [-1.0], 0.2)',
        expected: '-1.4',
        hidden: false,
      },
      {
        id: '4',
        description: 'Clipping in action',
        input: '([0.3], [0.6], [2.0], 0.2)',
        expected: '2.4',
        hidden: true,
      },
      {
        id: '5',
        description: 'Negative advantage, ratio < 1 is clipped at 1 - epsilon',
        input: 'ppo_clip_objective([0.5, 0.4], [0.2, 0.4], [-2.0, 1.0], 0.2)',
        expected: '-0.3',
        hidden: true,
      },
      {
        id: '6',
        description: 'Positive advantage, ratio < 1 - epsilon is not clipped',
        input: 'ppo_clip_objective([0.5], [0.2], [1.0], 0.2)',
        expected: '0.4',
        hidden: true,
      },
    ],
    hints: [
      'The objective is an importance-weighted advantage, made pessimistic so that large policy changes are never rewarded.',
      'Compute the ratio, a clipped copy of it, both surrogate terms, then the element-wise minimum and the mean.',
      'ratios = new_probs / (old_probs + 1e-8); clipped = np.clip(ratios, 1 - epsilon, 1 + epsilon); np.mean(np.minimum(ratios * A, clipped * A)).',
      'Take the min of the two products, not min(ratio, clipped) times A: with a negative advantage those differ.',
    ],
    solution: `import numpy as np

def ppo_clip_objective(old_probs: np.ndarray, new_probs: np.ndarray,
                       advantages: np.ndarray, epsilon: float) -> float:
    """
    PPO clipped surrogate objective (to maximize), rounded to 2 decimals.
    """
    old_probs = np.array(old_probs, dtype=float)
    new_probs = np.array(new_probs, dtype=float)
    advantages = np.array(advantages, dtype=float)

    ratios = new_probs / (old_probs + 1e-8)
    clipped_ratios = np.clip(ratios, 1 - epsilon, 1 + epsilon)

    # Pessimistic bound: element-wise min of the unclipped and clipped surrogates
    objective = np.mean(np.minimum(ratios * advantages, clipped_ratios * advantages))
    return round(float(objective), 2)
`,
  },
  {
    id: 'rl-n-step-return',
    title: 'N-Step Return',
    section: 'reinforcement-learning',
    difficulty: 'medium',
    description: `
## N-Step Return

### What you'll build
The n-step bootstrapped return G_t^(n): n real rewards, then the critic's estimate of the state reached.

### Background
TD(0) bootstraps after one step (low variance, biased by the critic); Monte Carlo waits for the end (unbiased, high variance). n-step returns sit in between and are used by A3C/A2C, Rainbow DQN and as the building block that GAE averages over.

### Formula
\`\`\`text
G_t^(n) = r_t + γ·r_{t+1} + ... + γ^(n-1)·r_{t+n-1} + γ^n · V(s_{t+n})
\`\`\`

| n | Method | Bias | Variance |
|---|---|---|---|
| 1 | TD(0) | highest | lowest |
| n | n-step | medium | medium |
| ∞ | Monte Carlo | none | highest |

### Inputs
- \`rewards\`: (T,) rewards r_0 ... r_{T-1}
- \`values\`: (T+1,) values V(s_0) ... V(s_T) (V(s_T) is 0 if the episode terminated)
- \`t\`: start step, 0 ≤ t < T
- \`n\`: number of steps, n ≥ 1
- \`gamma\`: discount factor

### Expected return format
A Python float: G_t^(n), **rounded to 2 decimals**.

### Edge cases and conventions
- **Truncation**: if t + n > T, the episode ends first. Sum only the rewards up to r_{T-1}, and add no bootstrap term.
- If t + n = T exactly, bootstrap with values[T] (0 for a terminated episode).
- In code: add γ^n · values[t + n] only when t + n < len(values).

### Constraints
NumPy only.

### Follow-up
- For which n does G_t^(n) become the Monte Carlo return?
- GAE is an exponentially weighted average of all n-step advantages. Write the weights.
    `,
    examples: [
      {
        input: 'rewards = [1, 2, 3, 4], values = [0, 0, 0, 0, 10], t = 0, n = 2, gamma = 0.9',
        output: '2.8',
        explanation: '1 + 0.9·2 + 0.81·V(s_2) = 1 + 1.8 + 0 = 2.8',
      },
      {
        input: 'rewards = [1, 1, 1, 1], values = [0, 0, 0, 5, 0], t = 0, n = 3, gamma = 0.9',
        output: '6.36',
        explanation: '1 + 0.9 + 0.81 + 0.729·5 = 2.71 + 3.645 = 6.355, rounded to 6.36',
      },
      {
        input: 'rewards = [1, 2, 3], values = [0, 0, 0, 0], t = 1, n = 5, gamma = 0.5',
        output: '3.5',
        explanation: 'Truncated: only r_1 and r_2 remain, 2 + 0.5·3 = 3.5, no bootstrap',
      },
    ],
    starterCode: `import numpy as np

def n_step_return(rewards: np.ndarray, values: np.ndarray,
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
        G_t^(n) as a float, rounded to 2 decimals (no bootstrap if the
        episode ends before t + n)
    """
    rewards = np.array(rewards, dtype=float)
    values = np.array(values, dtype=float)
    T = len(rewards)

    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: '2-step return',
        input: '([1, 2, 3, 4], [0, 0, 0, 0, 10], 0, 2, 0.9)',
        expected: '2.8',
        hidden: false,
      },
      {
        id: '2',
        description: '3-step return with bootstrap',
        input: '([1, 1, 1, 1], [0, 0, 0, 5, 0], 0, 3, 0.9)',
        expected: '6.36',
        hidden: false,
      },
      {
        id: '3',
        description: '1-step (TD) return',
        input: '([5, 2, 3], [1, 10, 5, 0], 0, 1, 0.9)',
        expected: '14.0',
        hidden: true,
      },
      {
        id: '4',
        description: 'n larger than the remaining steps',
        input: '([1, 1], [0, 0, 0], 0, 10, 0.9)',
        expected: '1.9',
        hidden: true,
      },
      {
        id: '5',
        description: 'Starting mid-episode, n past the end',
        input: 'n_step_return([1.0, 2.0, 3.0], [0.0, 0.0, 0.0, 0.0], 1, 5, 0.5)',
        expected: '3.5',
        hidden: true,
      },
      {
        id: '6',
        description: 'Mid-episode with bootstrap (t + n = T)',
        input: 'n_step_return([1.0, 2.0, 3.0, 4.0], [0.0, 1.0, 2.0, 3.0, 10.0], 2, 2, 0.9)',
        expected: '14.7',
        hidden: true,
      },
    ],
    hints: [
      'Count real rewards for up to n steps, then let the critic estimate everything after.',
      'Loop k = 0 .. n-1 over rewards[t + k] while it exists, then decide whether a bootstrap value is available.',
      'G += gamma**k * rewards[t + k] for t + k < T; then G += gamma**n * values[t + n] if t + n < len(values).',
      'The bootstrap is discounted by gamma**n (not gamma**(n-1)), and it is skipped when the episode ends before step t + n.',
    ],
    solution: `import numpy as np

def n_step_return(rewards: np.ndarray, values: np.ndarray,
                  t: int, n: int, gamma: float) -> float:
    """
    n-step bootstrapped return, rounded to 2 decimals.
    """
    rewards = np.array(rewards, dtype=float)
    values = np.array(values, dtype=float)
    T = len(rewards)

    # Real rewards r_t ... r_{t+n-1}, truncated at the end of the episode
    end = min(t + n, T)
    G = float(np.sum(gamma ** np.arange(end - t) * rewards[t:end]))

    # Bootstrap from V(s_{t+n}) only if that state exists
    if t + n < len(values):
        G += gamma ** n * values[t + n]

    return round(G, 2)

# Time O(n)
`,
  },

  // ==========================================
  // RL FOR LLMs: RLHF AND DPO
  // ==========================================
  {
    id: 'rl-reward-modeling',
    title: 'RLHF Reward Model Loss',
    section: 'reinforcement-learning',
    difficulty: 'hard',
    description: `
## RLHF Reward Model Loss

### What you'll build
The Bradley–Terry pairwise loss used to train the reward model in RLHF.

### Background
Humans find it much easier to say which of two responses is better than to give an absolute score. RLHF (InstructGPT, 2022) therefore collects pairs (y_chosen, y_rejected) for a prompt x and trains a reward model r(x, y), usually an LLM with a scalar head, so that chosen responses score higher. That reward model then supplies the reward for PPO (see **PPO-RLHF Objective**) or best-of-n sampling.

### Formula
Bradley–Terry model of a preference:
\`\`\`text
P(chosen ≻ rejected) = σ(r_chosen - r_rejected)
\`\`\`
Negative log-likelihood over N pairs:
\`\`\`text
L = -(1/N) · Σ_i log σ(r_chosen_i - r_rejected_i)
\`\`\`
Numerically stable form: log σ(x) = -log(1 + e^(-x)) = \`-np.logaddexp(0, -x)\`.

### Inputs
- \`r_chosen\`: (N,) reward-model scores of the preferred responses
- \`r_rejected\`: (N,) scores of the rejected responses (same order)

### Expected return format
A Python float: the mean loss, **rounded to 3 decimals**.

### Edge cases and conventions
- Equal scores give log 2 ≈ 0.693 per pair (a coin flip).
- Only the **difference** of scores matters: adding a constant to both leaves the loss unchanged.
- Must stay exact for large margins: for r_chosen - r_rejected = -100 the loss is 100.0. Don't add an eps inside the log (\`log(p + 1e-10)\` caps the loss near 23).

### Constraints
NumPy only. Don't call a library BCE.

### Follow-up
- This is binary cross-entropy with logits on the score difference and label 1. Why is the reward model only identified up to a constant shift?
- How would you use a margin, or more than two ranked responses (Plackett–Luce)?
    `,
    examples: [
      {
        input: 'r_chosen = [2.0, 1.5], r_rejected = [1.0, 0.5]',
        output: '0.313',
        explanation: 'Both margins are 1: -log σ(1) = 0.313',
      },
      {
        input: 'r_chosen = [0.0], r_rejected = [0.0]',
        output: '0.693',
        explanation: 'Equal rewards: -log 0.5 = log 2',
      },
    ],
    starterCode: `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def reward_model_loss(r_chosen: np.ndarray, r_rejected: np.ndarray) -> float:
    """
    Compute the Bradley-Terry reward model loss.

    Args:
        r_chosen: (N,) scores of the preferred responses
        r_rejected: (N,) scores of the rejected responses

    Returns:
        mean of -log sigmoid(r_chosen - r_rejected) as a float, rounded to 3 decimals
    """
    r_chosen = np.array(r_chosen, dtype=float)
    r_rejected = np.array(r_rejected, dtype=float)

    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Clear preference',
        input: '([2.0, 1.5], [1.0, 0.5])',
        expected: '0.313',
        hidden: false,
      },
      {
        id: '2',
        description: 'Equal scores',
        input: '([0.0], [0.0])',
        expected: '0.693',
        hidden: false,
      },
      {
        id: '3',
        description: 'Large margin',
        input: '([5.0, 4.0, 3.0], [0.0, 0.0, 0.0])',
        expected: '0.024',
        hidden: true,
      },
      {
        id: '4',
        description: 'Inverted preferences yield high loss',
        input: `(lambda: (
    loss_correct := reward_model_loss([3.0], [0.0]),
    loss_wrong := reward_model_loss([0.0], [3.0]),
    bool(loss_wrong > loss_correct)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Badly wrong ranking: exact loss, not capped by an eps',
        input: 'reward_model_loss([-50.0], [50.0])',
        expected: '100.0',
        hidden: true,
      },
    ],
    hints: [
      'The model turns a score difference into a probability that the human picked the chosen response; the loss is that probability\'s negative log.',
      'Compute the margins r_chosen - r_rejected, map them to log-probabilities, and average the negatives.',
      'log σ(x) = -np.logaddexp(0, -x), so loss = np.mean(np.logaddexp(0, -(r_chosen - r_rejected))).',
      'Avoid np.log(sigmoid(x) + 1e-10): the eps silently caps the loss for badly wrong pairs, and the naive sigmoid overflows for very negative x.',
    ],
    solution: `import numpy as np

def log_sigmoid(x):
    # log(1 / (1 + e^-x)) = -log(1 + e^-x), stable for large |x|
    return -np.logaddexp(0.0, -x)

def reward_model_loss(r_chosen: np.ndarray, r_rejected: np.ndarray) -> float:
    """
    Bradley-Terry negative log-likelihood, rounded to 3 decimals.
    """
    r_chosen = np.array(r_chosen, dtype=float)
    r_rejected = np.array(r_rejected, dtype=float)

    margins = r_chosen - r_rejected       # only differences matter
    loss = -np.mean(log_sigmoid(margins))
    return round(float(loss), 3)
`,
  },
  {
    id: 'rl-dpo-loss',
    title: 'Direct Preference Optimization (DPO)',
    section: 'reinforcement-learning',
    difficulty: 'hard',
    description: `
## Direct Preference Optimization (DPO)

### What you'll build
The DPO loss: train the policy directly on preference pairs, with no reward model and no RL loop.

### Background
RLHF maximizes reward with a KL penalty to a reference model. DPO (Rafailov et al., 2023) shows that the optimum of that problem satisfies r(x, y) = β·log(π_θ(y|x) / π_ref(y|x)) + const. Substituting this **implicit reward** into the Bradley–Terry loss (see **RLHF Reward Model Loss**) gives a plain classification loss on log-probabilities. It is simpler and more stable than PPO-RLHF, and widely used for open-weight chat models.

### Formula
For each pair, with sequence log-probs (the sum of the response's token log-probs):
\`\`\`text
Δ_chosen   = log π_θ(y_w|x) - log π_ref(y_w|x)
Δ_rejected = log π_θ(y_l|x) - log π_ref(y_l|x)
L_DPO      = -mean[ log σ( β · (Δ_chosen - Δ_rejected) ) ]
\`\`\`
- π_θ: policy being trained; π_ref: frozen reference (usually the SFT model)
- β: strength of the implicit KL constraint (typically 0.1 to 0.5); larger β keeps π_θ closer to π_ref

### Inputs
Four (N,) arrays of sequence log-probs (≤ 0): \`logp_chosen\`, \`logp_rejected\` under π_θ, and \`ref_logp_chosen\`, \`ref_logp_rejected\` under π_ref; and \`beta\` (float > 0).

### Expected return format
A Python float: the mean loss, **rounded to 3 decimals**.

### Edge cases and conventions
- At initialization π_θ = π_ref, so every Δ is 0 and the loss is log 2 ≈ 0.693.
- Use a stable log-sigmoid (\`-np.logaddexp(0, -z)\`); no eps inside the log.

### Constraints
NumPy only.

### Follow-up
- DPO can lower the likelihood of **both** responses as long as the rejected one drops faster. Why can that hurt, and what do variants such as IPO or adding an SFT term do?
- Which quantity would you log as "reward accuracy" during DPO training?
    `,
    examples: [
      {
        input: 'logp_chosen = [-1], logp_rejected = [-2], ref_logp_chosen = [-1.5], ref_logp_rejected = [-1.5], beta = 0.1',
        output: '0.644',
        explanation: 'Δ_chosen = 0.5, Δ_rejected = -0.5, so -log σ(0.1·1.0) = 0.644, just below log 2',
      },
      {
        input: 'logp_chosen = [-3, -2], logp_rejected = [-1, -1], ref logps all -2, beta = 0.5',
        output: '1.144',
        explanation: 'The policy prefers the rejected responses (z = -1 and -0.5), so the loss is above log 2',
      },
    ],
    starterCode: `import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def dpo_loss(logp_chosen: np.ndarray, logp_rejected: np.ndarray,
             ref_logp_chosen: np.ndarray, ref_logp_rejected: np.ndarray,
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
        mean of -log sigmoid(beta * (delta_chosen - delta_rejected)) as a float,
        rounded to 3 decimals
    """
    logp_chosen = np.array(logp_chosen, dtype=float)
    logp_rejected = np.array(logp_rejected, dtype=float)
    ref_logp_chosen = np.array(ref_logp_chosen, dtype=float)
    ref_logp_rejected = np.array(ref_logp_rejected, dtype=float)

    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Policy prefers chosen',
        input: '([-1.0], [-2.0], [-1.5], [-1.5], 0.1)',
        expected: '0.644',
        hidden: false,
      },
      {
        id: '2',
        description: 'Policy equals reference: loss is log 2',
        input: '([-1.0, -1.0], [-1.0, -1.0], [-1.0, -1.0], [-1.0, -1.0], 0.5)',
        expected: '0.693',
        hidden: false,
      },
      {
        id: '3',
        description: 'Strong preference signal',
        input: '([0.0], [-5.0], [-2.0], [-3.0], 0.1)',
        expected: '0.513',
        hidden: true,
      },
      {
        id: '4',
        description: 'Higher beta amplifies preference signal',
        input: `(lambda: (
    loss_low := dpo_loss([-1.0], [-2.0], [-1.5], [-1.5], 0.1),
    loss_high := dpo_loss([-1.0], [-2.0], [-1.5], [-1.5], 1.0),
    bool(loss_high < loss_low)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Policy prefers the rejected response: loss above log 2',
        input: 'dpo_loss([-3.0, -2.0], [-1.0, -1.0], [-2.0, -2.0], [-2.0, -2.0], 0.5)',
        expected: '1.144',
        hidden: true,
      },
      {
        id: '6',
        description: 'Large negative logit: exact loss (stable log-sigmoid)',
        input: 'dpo_loss([-400.0], [-10.0], [-20.0], [-20.0], 1.0)',
        expected: '390.0',
        hidden: true,
      },
    ],
    hints: [
      'DPO is the reward-model loss where each response\'s "reward" is β times how much more likely the policy makes it than the reference.',
      'Compute the two log-ratios (policy minus reference), their difference, scale by beta, then apply -log σ and average.',
      'z = beta * ((logp_chosen - ref_logp_chosen) - (logp_rejected - ref_logp_rejected)); loss = np.mean(np.logaddexp(0, -z)).',
      'Mind the signs: the reference log-probs are subtracted inside each log-ratio. And don\'t put an eps inside the log; it caps the loss.',
    ],
    solution: `import numpy as np

def log_sigmoid(x):
    # Stable log(sigmoid(x)) = -log(1 + e^-x)
    return -np.logaddexp(0.0, -x)

def dpo_loss(logp_chosen: np.ndarray, logp_rejected: np.ndarray,
             ref_logp_chosen: np.ndarray, ref_logp_rejected: np.ndarray,
             beta: float) -> float:
    """
    DPO loss, rounded to 3 decimals.
    """
    logp_chosen = np.array(logp_chosen, dtype=float)
    logp_rejected = np.array(logp_rejected, dtype=float)
    ref_logp_chosen = np.array(ref_logp_chosen, dtype=float)
    ref_logp_rejected = np.array(ref_logp_rejected, dtype=float)

    # Implicit rewards (up to the factor beta): log-ratios of policy vs reference
    chosen_logratios = logp_chosen - ref_logp_chosen
    rejected_logratios = logp_rejected - ref_logp_rejected

    logits = beta * (chosen_logratios - rejected_logratios)
    loss = -np.mean(log_sigmoid(logits))
    return round(float(loss), 3)
`,
  },
  {
    id: 'rl-kl-penalty',
    title: 'KL Divergence Penalty (RLHF)',
    section: 'reinforcement-learning',
    difficulty: 'medium',
    description: `
## KL Divergence Penalty (RLHF)

### What you'll build
The sampled KL penalty β·KL(π_θ ‖ π_ref) that RLHF uses to keep the fine-tuned policy close to the reference model.

### Background
A policy optimized against a learned reward model soon finds outputs that the reward model overrates ("reward hacking") and loses fluency. RLHF penalizes divergence from the frozen reference (SFT) model:
\`\`\`text
reward_total = reward - β · KL(π_θ ‖ π_ref)
\`\`\`
The exact KL needs the full vocabulary distribution at every position. In practice it is **estimated from the sampled tokens** using the log-probs you already have.

### Formula
For tokens y_t sampled from π_θ, the per-token estimate (often called k1) is the log-ratio:
\`\`\`text
kl_t    = log π_θ(y_t) - log π_ref(y_t)
penalty = β · mean_t(kl_t)
\`\`\`
Its average over samples from π_θ is the true KL, so it is unbiased. A single token's kl_t can be **negative**, and so can the mean over a few tokens. The k3 estimator, exp(-kl_t) + kl_t - 1, is never negative; GRPO uses it (see **GRPO** in Post-training & Efficiency).

### Inputs
- \`logp_policy\`: (T,) log-probs of the sampled tokens under π_θ
- \`logp_reference\`: (T,) log-probs of the same tokens under π_ref
- \`beta\`: KL coefficient (e.g. 0.01 to 0.2)

### Expected return format
A Python float: β · mean(logp_policy - logp_reference), **rounded to 2 decimals**. Keep the sign; don't clip negative estimates to 0.

### Edge cases and conventions
- Identical log-probs give 0.0.
- The mean is over all given tokens (no mask in this problem).

### Constraints
NumPy only.

### Follow-up
- InstructGPT-style PPO subtracts β·kl_t from the reward of every token, not once per sequence. How does that change the credit assignment?
- Adaptive KL control raises β when the measured KL exceeds a target. Sketch the update rule.
    `,
    examples: [
      {
        input: 'logp_policy = [-1, -2], logp_reference = [-1.5, -2.5], beta = 0.1',
        output: '0.05',
        explanation: 'kl_t = [0.5, 0.5], mean 0.5, penalty 0.1 · 0.5 = 0.05',
      },
      {
        input: 'logp_policy = [-2, -3], logp_reference = [-1, -1], beta = 1.0',
        output: '-1.5',
        explanation: 'These tokens are less likely under the policy, so the sampled estimate is negative: mean([-1, -2]) = -1.5',
      },
    ],
    starterCode: `import numpy as np

def kl_penalty(logp_policy: np.ndarray, logp_reference: np.ndarray,
               beta: float) -> float:
    """
    Compute the sampled KL penalty for RLHF.

    Args:
        logp_policy: (T,) log-probs of the sampled tokens under pi_theta
        logp_reference: (T,) log-probs of the same tokens under pi_ref
        beta: KL penalty coefficient

    Returns:
        beta * mean(logp_policy - logp_reference) as a float, rounded to 2 decimals
    """
    logp_policy = np.array(logp_policy, dtype=float)
    logp_reference = np.array(logp_reference, dtype=float)

    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Positive divergence',
        input: '([-1.0, -2.0], [-1.5, -2.5], 0.1)',
        expected: '0.05',
        hidden: false,
      },
      {
        id: '2',
        description: 'No divergence',
        input: '([-1.0, -1.0], [-1.0, -1.0], 0.1)',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '3',
        description: 'Higher beta',
        input: '([-0.5, -1.0, -1.5], [-1.0, -1.5, -2.0], 0.5)',
        expected: '0.25',
        hidden: true,
      },
      {
        id: '4',
        description: 'Policy less likely than reference gives a negative estimate',
        input: '([-2.0, -3.0], [-1.0, -1.0], 1.0)',
        expected: '-1.5',
        hidden: true,
      },
      {
        id: '5',
        description: 'Mean over tokens of mixed-sign log-ratios',
        input: 'kl_penalty([-1.0, -3.0, -0.5, -2.0], [-2.0, -2.0, -1.5, -2.6], 1.0)',
        expected: '0.4',
        hidden: true,
      },
    ],
    hints: [
      'KL(π_θ ‖ π_ref) is the expected log-ratio of the two distributions under π_θ, and your tokens are already samples from π_θ.',
      'Compute the per-token log-ratio, average it, and scale by beta.',
      'penalty = beta * np.mean(logp_policy - logp_reference); return round(float(penalty), 2).',
      'Keep the order policy minus reference, and don\'t take abs or clip at 0: a negative sampled estimate is expected.',
    ],
    solution: `import numpy as np

def kl_penalty(logp_policy: np.ndarray, logp_reference: np.ndarray,
               beta: float) -> float:
    """
    beta * sampled KL(pi_theta || pi_ref) (k1 estimator), rounded to 2 decimals.
    """
    logp_policy = np.array(logp_policy, dtype=float)
    logp_reference = np.array(logp_reference, dtype=float)

    # Per-token log-ratio: unbiased estimate of the KL for tokens sampled from pi_theta
    kl_per_token = logp_policy - logp_reference

    penalty = beta * np.mean(kl_per_token)
    return round(float(penalty), 2)
`,
  },
  {
    id: 'rl-ppo-llm-objective',
    title: 'PPO-RLHF Objective',
    section: 'reinforcement-learning',
    difficulty: 'hard',
    description: `
## PPO-RLHF Objective

### What you'll build
The PPO objective as used for RLHF: the clipped surrogate from **PPO Clipped Objective**, with the KL penalty from **KL Divergence Penalty** folded into the advantage.

### Background
Classic RLHF (InstructGPT) fine-tunes the policy with PPO to maximize the reward model's score while staying close to the reference model. There are two common ways to add the KL term:
1. **KL in the reward** (InstructGPT, this problem): shape the reward as r - β·KL, then run the ordinary clipped surrogate on it.
2. **KL as a separate loss term**: L = clipped surrogate - β·KL. GRPO does this with the k3 estimator (see **GRPO** in Post-training & Efficiency).

Pick one, not both: subtracting β·KL again after it is already in the advantage would count the penalty twice.

### Formula
Element-wise over N tokens (or responses), with log-probs as inputs:
\`\`\`text
ratio_i = exp(new_logp_i - old_logp_i)              π_θ / π_old
kl_i    = new_logp_i - ref_logp_i                   sampled KL to the reference (k1)
A_i     = rewards_i - β · kl_i                      KL-shaped reward, used as the advantage
J       = mean_i [ min( ratio_i · A_i, clip(ratio_i, 1-ε, 1+ε) · A_i ) ]
\`\`\`
Simplifications for this exercise: the shaped reward is used directly as the advantage (no value baseline or GAE), and kl uses the current policy's log-probs. Real implementations compute the shaped reward once at rollout time, from the sampling policy, and treat it as a constant.

### Inputs
Four (N,) float arrays: \`old_logp\` (policy that sampled the data), \`new_logp\` (current policy π_θ), \`ref_logp\` (frozen reference model) and \`rewards\` (reward-model scores); plus floats \`epsilon\` (clip range) and \`beta\` (KL coefficient).

### Expected return format
A dictionary of Python floats, each **rounded to 2 decimals**:
- \`'objective'\`: J, to **maximize** (the training loss is -J)
- \`'policy_loss'\`: the clipped-surrogate term. It equals \`'objective'\` here, because the KL is already inside the advantage. The name is kept for compatibility; in the separate-term variant it would be J before subtracting the penalty.
- \`'kl_penalty'\`: β · mean(kl_i), reported for monitoring only. It is **not** subtracted from J.

### Edge cases and conventions
- If new = old = ref, ratio = 1 and kl = 0, so J = mean(rewards) and the penalty is 0.
- The ratio uses exp of a log-prob difference (no eps needed).

### Constraints
NumPy only, vectorized.

### Follow-up
- Why does the KL-shaped reward let the critic and GAE handle the penalty, while the separate-term version cannot?
- Which statistics would you watch to catch reward hacking? (Mean KL, reward, response length.)
    `,
    examples: [
      {
        input: 'old_logp = [-2.0], new_logp = [-1.8], ref_logp = [-2.0], rewards = [1.0], epsilon = 0.2, beta = 0.1',
        output: "{'objective': 1.18, 'policy_loss': 1.18, 'kl_penalty': 0.02}",
        explanation: 'ratio = e^0.2 = 1.221 (clipped to 1.2), kl = 0.2, A = 1 - 0.02 = 0.98, J = 1.2 · 0.98 = 1.176',
      },
      {
        input: 'old_logp = new_logp = ref_logp = [-1.0], rewards = [1.0], epsilon = 0.2, beta = 0.1',
        output: "{'objective': 1.0, 'policy_loss': 1.0, 'kl_penalty': 0.0}",
        explanation: 'No policy change and no drift: J is just the mean reward',
      },
    ],
    starterCode: `import numpy as np

def ppo_rlhf_objective(old_logp: np.ndarray, new_logp: np.ndarray,
                       ref_logp: np.ndarray, rewards: np.ndarray,
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
        dict of floats rounded to 2 decimals:
            'objective':   clipped surrogate with A = rewards - beta * (new_logp - ref_logp)
            'policy_loss': the same clipped-surrogate value
            'kl_penalty':  beta * mean(new_logp - ref_logp), for monitoring
    """
    old_logp = np.array(old_logp, dtype=float)
    new_logp = np.array(new_logp, dtype=float)
    ref_logp = np.array(ref_logp, dtype=float)
    rewards = np.array(rewards, dtype=float)

    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Positive reward, small update (clipped ratio)',
        input: `(lambda r: (round(r['objective'], 2), round(r['policy_loss'], 2), round(r['kl_penalty'], 2)))(ppo_rlhf_objective([-2.0], [-1.8], [-2.0], [1.0], 0.2, 0.1))`,
        expected: '(1.18, 1.18, 0.02)',
        hidden: false,
      },
      {
        id: '2',
        description: 'No policy change',
        input: `(lambda r: bool(abs(r['objective'] - 1.0) < 0.01 and abs(r['kl_penalty']) < 0.01))(ppo_rlhf_objective([-1.0], [-1.0], [-1.0], [1.0], 0.2, 0.1))`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Result has exactly the required keys',
        input: `sorted(ppo_rlhf_objective([-1.0], [-1.0], [-1.0], [1.0], 0.2, 0.1).keys())`,
        expected: "['kl_penalty', 'objective', 'policy_loss']",
        hidden: true,
      },
      {
        id: '4',
        description: 'Negative reward scenario',
        input: `(lambda r: bool(r['objective'] < 0))(ppo_rlhf_objective([-1.0], [-1.0], [-1.0], [-2.0], 0.2, 0.1))`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Clipped ratio and KL penalty values (KL counted once)',
        input: `(lambda r: (round(r['objective'], 2), round(r['policy_loss'], 2), round(r['kl_penalty'], 2)))(ppo_rlhf_objective([-2.0, -1.0], [-1.0, -1.0], [-1.5, -2.0], [2.0, 1.0], 0.2, 0.2))`,
        expected: '(1.54, 1.54, 0.15)',
        hidden: true,
      },
    ],
    hints: [
      'This is PPO\'s clipped surrogate where the advantage is the reward minus a per-token KL charge.',
      'Compute the ratio from log-probs, the KL to the reference, the shaped advantage, then the clipped surrogate and its mean.',
      'ratio = np.exp(new_logp - old_logp); kl = new_logp - ref_logp; A = rewards - beta * kl; J = np.mean(np.minimum(ratio * A, np.clip(ratio, 1 - epsilon, 1 + epsilon) * A)).',
      'Don\'t subtract beta * mean(kl) from J again: it is already inside A. Report it as kl_penalty only.',
    ],
    solution: `import numpy as np

def ppo_rlhf_objective(old_logp: np.ndarray, new_logp: np.ndarray,
                       ref_logp: np.ndarray, rewards: np.ndarray,
                       epsilon: float, beta: float) -> dict:
    """
    PPO-RLHF objective with a KL-shaped reward (InstructGPT style).
    """
    old_logp = np.array(old_logp, dtype=float)
    new_logp = np.array(new_logp, dtype=float)
    ref_logp = np.array(ref_logp, dtype=float)
    rewards = np.array(rewards, dtype=float)

    # Probability ratio pi_theta / pi_old from log-probs
    ratio = np.exp(new_logp - old_logp)

    # Sampled per-token KL to the reference, folded into the reward/advantage
    kl = new_logp - ref_logp
    advantage = rewards - beta * kl

    # Clipped surrogate (pessimistic min), averaged over tokens
    clipped_ratio = np.clip(ratio, 1 - epsilon, 1 + epsilon)
    policy_term = np.mean(np.minimum(ratio * advantage, clipped_ratio * advantage))

    # The KL is already inside the advantage, so it is not subtracted again
    objective = policy_term

    return {
        'objective': round(float(objective), 2),
        'policy_loss': round(float(policy_term), 2),
        'kl_penalty': round(float(beta * np.mean(kl)), 2),  # monitoring only
    }
`,
  },
];
