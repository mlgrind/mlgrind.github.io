import { Problem } from '../../types';

export const optimizationProblems: Problem[] = [
  {
    id: 'gradient-clipping',
    title: 'Gradient Clipping by Global Norm',
    section: 'optimization',
    difficulty: 'easy',
    description: `
## Gradient Clipping by Global Norm

### What you'll build
\`clip_grad_norm(grads, max_norm)\`: treat the gradients of *all* parameters as one long vector, compute its L2 norm, and if it exceeds \`max_norm\`, rescale every gradient by the same factor. This is what \`torch.nn.utils.clip_grad_norm_\` does.

### Background
A single bad batch can produce a huge gradient that throws the weights far away: a *loss spike*, sometimes followed by NaNs. Clipping caps the size of the step. Clipping by the **global** norm (rather than per tensor or per element) keeps the update's direction and the relative sizes of all gradients; only the step length changes. Most LLM training runs clip with \`max_norm=1.0\`.

### Formula
\`\`\`text
total_norm = sqrt( sum_i sum(g_i ** 2) )        # over every array and every element
clip_coef  = max_norm / (total_norm + eps)       # eps = 1e-6, as in PyTorch
if clip_coef < 1:
    g_i = g_i * clip_coef                        # same factor for every array
\`\`\`
- \`g_i\`: the gradient array of parameter \`i\` (any shape)
- \`max_norm\`: the largest allowed global norm
- \`eps\`: guards against division by zero when every gradient is 0

### Inputs
- \`grads\`: list of NumPy float arrays of any shapes
- \`max_norm\`: positive float
- \`eps\`: small float, default \`1e-6\`

### Expected return format
Return a tuple \`(clipped_grads, total_norm)\`:
- \`clipped_grads\`: a **list** of new arrays with the same shapes as \`grads\` (don't modify the inputs)
- \`total_norm\`: the global norm **before** clipping, as a Python float

### Edge cases and conventions
- Gradients whose global norm is at most \`max_norm\` come back unchanged (copies).
- After clipping, the global norm equals \`max_norm\` (up to the tiny \`eps\`).
- All-zero gradients: \`total_norm = 0.0\` and nothing changes.

### Constraints
NumPy only; one pass over the arrays (no per-element Python loops).

### Follow-up
- Where does clipping go in a mixed-precision loop? (After \`scaler.unscale_(optimizer)\`, before \`scaler.step\`.)
- How does clipping by value (\`clip_grad_value_\`) differ, and why does it change the update direction?
    `,
    examples: [
      {
        input: 'clip_grad_norm([np.array([3.0, 4.0])], max_norm=1.0)',
        output: '([array([0.6, 0.8])], 5.0)',
        explanation: 'The norm is sqrt(9 + 16) = 5 > 1, so every gradient is scaled by 1/5 (more precisely 1/(5 + 1e-6)).',
      },
      {
        input: 'clip_grad_norm([np.array([1.0, 2.0]), np.array([2.0])], max_norm=5.0)',
        output: '([array([1., 2.]), array([2.])], 3.0)',
        explanation: 'The global norm sqrt(1 + 4 + 4) = 3 is below 5, so the gradients come back unchanged.',
      },
    ],
    starterCode: `import numpy as np

def clip_grad_norm(grads: list, max_norm: float, eps: float = 1e-6):
    """
    Clip a list of gradient arrays by their global L2 norm.

    Args:
        grads: List of gradient arrays (any shapes)
        max_norm: Maximum allowed global norm
        eps: Small constant added to the norm (PyTorch uses 1e-6)

    Returns:
        (clipped_grads, total_norm): list of arrays, and the norm before clipping
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Single gradient above the threshold',
        input: '(lambda: (out := clip_grad_norm([np.array([3.0, 4.0])], 1.0), [np.round(g, 4).tolist() for g in out[0]], round(float(out[1]), 4))[1:])()',
        expected: '([[0.6, 0.8]], 5.0)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Below the threshold: unchanged',
        input: '(lambda: (out := clip_grad_norm([np.array([1.0, 2.0]), np.array([2.0])], 5.0), [g.tolist() for g in out[0]], round(float(out[1]), 4))[1:])()',
        expected: '([[1.0, 2.0], [2.0]], 3.0)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Global (not per-array) norm across a matrix and a vector',
        input: '(lambda: (out := clip_grad_norm([np.array([[1.0, 2.0], [2.0, 4.0]]), np.array([4.0, 0.0])], 2.0), [np.round(g, 6).tolist() for g in out[0]], round(float(out[1]), 6))[1:])()',
        expected: '([[[0.312347, 0.624695], [0.624695, 1.24939]], [1.24939, 0.0]], 6.403124)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Clipped norm equals max_norm; inputs untouched',
        input: `(lambda: (
    gs := [np.random.randn(3, 4) * 5, np.random.randn(7), np.random.randn(2, 2, 2)],
    before := [g.copy() for g in gs],
    out := clip_grad_norm(gs, 0.5),
    round(float(np.sqrt(sum((c ** 2).sum() for c in out[0]))), 5),
    all(np.array_equal(a, b) for a, b in zip(gs, before)),
    round(float(out[1]), 4)
)[-3:])()`,
        expected: '(0.5, True, 21.0449)',
        hidden: true,
      },
      {
        id: '5',
        description: 'All-zero gradients: norm 0 and nothing changes',
        input: '(lambda: (out := clip_grad_norm([np.zeros(3), np.zeros((2, 2))], 1.0), [g.tolist() for g in out[0]], float(out[1]))[1:])()',
        expected: '([[0.0, 0.0, 0.0], [[0.0, 0.0], [0.0, 0.0]]], 0.0)',
        hidden: true,
      },
    ],
    hints: [
      'Think of all the gradients as one long vector: its norm needs the squares of every element of every array.',
      'Two steps: compute one global norm, then one scale factor that you apply to every array (only if it is below 1).',
      'total_norm = float(np.sqrt(sum(np.sum(g ** 2) for g in grads))); clip_coef = max_norm / (total_norm + eps); return [g * clip_coef for g in grads] when clip_coef < 1.',
      "Pitfalls: clipping each array by its own norm (that is not the global norm), scaling gradients up when the norm is small, modifying the inputs in place, or returning the norm after clipping.",
    ],
    solution: `import numpy as np

def clip_grad_norm(grads: list, max_norm: float, eps: float = 1e-6):
    """
    Clip a list of gradient arrays by their global L2 norm.

    Returns:
        (clipped_grads, total_norm): list of new arrays, and the norm before clipping
    """
    # One norm over every element of every array
    total_norm = float(np.sqrt(sum(np.sum(g ** 2) for g in grads)))
    clip_coef = max_norm / (total_norm + eps)
    if clip_coef < 1:
        clipped = [g * clip_coef for g in grads]   # same factor keeps the direction
    else:
        clipped = [g.copy() for g in grads]        # never scale up
    return clipped, total_norm

# Time O(P) and extra space O(P) for P gradient elements in total.
`,
  },
  {
    id: 'loss-scaling',
    title: 'Dynamic Loss Scaling (Mixed Precision)',
    section: 'optimization',
    difficulty: 'easy',
    description: `
## Dynamic Loss Scaling for Mixed Precision

### What you'll build
\`dynamic_loss_scale(overflows, ...)\`: simulate how \`torch.amp.GradScaler\` adapts its loss scale over a training run, given which steps produced inf/NaN gradients.

### Background
In fp16 the smallest normal number is about \`6e-5\` and anything below about \`6e-8\` rounds to 0, so many small gradients **underflow** to zero. The fix is to multiply the loss by a large **scale** \`S\` before \`backward()\`: every gradient is then \`S\` times larger and fits in fp16, and the gradients are divided by \`S\` again before the optimizer step. If \`S\` is too large, some gradient overflows to inf/NaN instead. **Dynamic** loss scaling keeps \`S\` as large as possible without overflowing: it backs off right after an overflow and grows again after a run of clean steps. (bf16 has fp32's exponent range, which is why bf16 training usually needs no loss scaling.)

### Algorithm
\`\`\`text
S = init_scale; good_steps = 0
for i, overflow in enumerate(overflows):
    record S as the scale used at step i
    if overflow:                         # some gradient was inf/NaN
        skip the optimizer step (record i)
        S = S * backoff_factor           # e.g. halve
        good_steps = 0
    else:                                # optimizer step applied
        good_steps += 1
        if good_steps == growth_interval:
            S = S * growth_factor        # e.g. double
            good_steps = 0
\`\`\`
PyTorch's defaults are \`init_scale=65536\`, \`growth_factor=2\`, \`backoff_factor=0.5\` and \`growth_interval=2000\`.

### Inputs
- \`overflows\`: list of bools; \`overflows[i]\` is \`True\` if step \`i\`'s gradients contained inf/NaN (may be empty)
- \`init_scale\`, \`growth_factor\`, \`backoff_factor\`: floats
- \`growth_interval\`: positive int, the number of consecutive good steps before growing

### Expected Return Format
Return a dictionary with these keys:
- \`'scales'\`: list of floats, the scale **used** at each step (before that step's update), same length as \`overflows\`
- \`'skipped'\`: list of the indices of the steps whose optimizer update was skipped, in increasing order
- \`'final_scale'\`: float, the scale after the last step (\`init_scale\` for an empty run)

### Edge cases and conventions
- An overflow resets the good-step counter, so growth needs \`growth_interval\` clean steps **in a row**.
- After growing, the counter restarts from 0.
- Return floats for the scales even when \`init_scale\` is passed as an int.

### Constraints
Plain Python; one pass over \`overflows\`.

### Follow-up
- Why is skipping the step (rather than clipping the inf gradients) the right response to an overflow?
- If the scale keeps shrinking towards 0 during training, what does that tell you about the model?
    `,
    examples: [
      {
        input: 'dynamic_loss_scale([False, True, False, False, False], init_scale=8.0, growth_interval=2)',
        output: "{'scales': [8.0, 8.0, 4.0, 4.0, 8.0], 'skipped': [1], 'final_scale': 8.0}",
        explanation: 'Step 1 overflows (8 -> 4, counter reset); steps 2 and 3 are two good steps in a row (4 -> 8 after step 3).',
      },
      {
        input: 'dynamic_loss_scale([True, True, True], init_scale=1024.0)',
        output: "{'scales': [1024.0, 512.0, 256.0], 'skipped': [0, 1, 2], 'final_scale': 128.0}",
        explanation: 'Every step overflows, so every update is skipped and the scale halves each time.',
      },
    ],
    starterCode: `def dynamic_loss_scale(overflows, init_scale=65536.0, growth_factor=2.0,
                       backoff_factor=0.5, growth_interval=2000) -> dict:
    """
    Simulate GradScaler's dynamic loss scale over a sequence of steps.

    Args:
        overflows: List of bools, True if that step's gradients had inf/nan
        init_scale: Starting scale
        growth_factor: Multiplier after growth_interval good steps in a row
        backoff_factor: Multiplier after an overflow
        growth_interval: Number of consecutive good steps before growing

    Returns:
        dict with 'scales' (scale used at each step), 'skipped' (indices of
        skipped steps) and 'final_scale'
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'One overflow, then growth after 2 good steps',
        input: "(lambda: (r := dynamic_loss_scale([False, True, False, False, False], init_scale=8.0, growth_interval=2), r['scales'], r['skipped'], r['final_scale'])[1:])()",
        expected: '([8.0, 8.0, 4.0, 4.0, 8.0], [1], 8.0)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Consecutive overflows halve the scale each time',
        input: "(lambda: (r := dynamic_loss_scale([True, True, True], init_scale=1024.0), r['scales'], r['skipped'], r['final_scale'])[1:])()",
        expected: '([1024.0, 512.0, 256.0], [0, 1, 2], 128.0)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Overflow resets the good-step counter',
        input: "(lambda: (r := dynamic_loss_scale([False, False, True, False, False, False, False, False, False, True, False], init_scale=16.0, growth_interval=3), r['scales'], r['skipped'], r['final_scale'])[1:])()",
        expected: '([16.0, 16.0, 16.0, 8.0, 8.0, 8.0, 16.0, 16.0, 16.0, 32.0, 16.0], [2, 9], 16.0)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Custom factors over a long run',
        input: "(lambda: (r := dynamic_loss_scale([i % 7 == 6 for i in range(30)], init_scale=100.0, growth_factor=3.0, backoff_factor=0.25, growth_interval=4), r['scales'][-5:], r['skipped'], r['final_scale'])[1:])()",
        expected: '([126.5625, 126.5625, 126.5625, 31.640625, 31.640625], [6, 13, 20, 27], 31.640625)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Empty run and growth_interval = 1',
        input: "(lambda: (e := dynamic_loss_scale([], init_scale=4), g := dynamic_loss_scale([False, False, True, False], init_scale=1.0, growth_interval=1), (e['scales'], e['skipped'], e['final_scale']), (g['scales'], g['skipped'], g['final_scale']))[2:])()",
        expected: '(([], [], 4.0), ([1.0, 2.0, 4.0, 2.0], [2], 4.0))',
        hidden: true,
      },
    ],
    hints: [
      'This is a small state machine: what do you need to remember between steps?',
      'Two pieces of state: the current scale and a counter of consecutive good steps. Append the current scale to scales before you update it for the step.',
      'On overflow: record the index, multiply by backoff_factor and reset the counter. Otherwise increment the counter, and when it reaches growth_interval multiply by growth_factor and reset it.',
      'Pitfalls: recording the scale after the update, forgetting to reset the counter on overflow (growth needs clean steps in a row) or after growing.',
    ],
    solution: `def dynamic_loss_scale(overflows, init_scale=65536.0, growth_factor=2.0,
                       backoff_factor=0.5, growth_interval=2000) -> dict:
    """
    Simulate GradScaler's dynamic loss scale over a sequence of steps.
    """
    scale = float(init_scale)
    good_steps = 0                       # consecutive steps without overflow
    scales, skipped = [], []
    for i, overflow in enumerate(overflows):
        scales.append(scale)             # the scale this step's loss was multiplied by
        if overflow:
            skipped.append(i)            # optimizer.step() is skipped
            scale *= backoff_factor
            good_steps = 0
        else:
            good_steps += 1
            if good_steps == growth_interval:
                scale *= growth_factor
                good_steps = 0
    return {'scales': scales, 'skipped': skipped, 'final_scale': scale}

# Time O(n) for n steps, space O(n) for the outputs.
`,
  },
];
