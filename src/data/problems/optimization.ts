import { Problem } from '../../types';

export const optimizationProblems: Problem[] = [
  {
    id: 'gradient-clipping',
    title: 'Gradient Clipping by Global Norm',
    section: 'optimization',
    difficulty: 'easy',
    description: `
## Gradient Clipping by Global Norm

A single bad batch can produce a huge gradient that throws the weights far away: a *loss spike*. Gradient clipping caps the size of the step. Clipping by **global norm** treats the gradients of *all* parameters as one long vector and rescales them together when their combined L2 norm is too large. Every gradient keeps its direction, and their relative sizes are preserved.

This is what \`torch.nn.utils.clip_grad_norm_\` does, and most LLM training runs use it with \`max_norm=1.0\`.

### Formula
\`\`\`
total_norm = sqrt( sum_i  sum(g_i ** 2) )          # over every array, every element
clip_coef  = max_norm / (total_norm + eps)          # eps = 1e-6, as in PyTorch
if clip_coef < 1:
    g_i = g_i * clip_coef                           # for every array
\`\`\`

Gradients whose norm is already below \`max_norm\` are left unchanged.

### Function Signature
\`\`\`python
def clip_grad_norm(grads: list, max_norm: float, eps: float = 1e-6):
\`\`\`

### Return Format
Return a tuple \`(clipped_grads, total_norm)\`:
- \`clipped_grads\`: a **list** of arrays with the same shapes as \`grads\` (new arrays; don't modify the inputs)
- \`total_norm\`: the global norm **before** clipping, as a float
    `,
    examples: [
      {
        input: 'grads=[np.array([3.0, 4.0])], max_norm=1.0',
        output: '([array([0.6, 0.8])], 5.0)',
        explanation: 'The norm is 5, so every gradient is scaled by 1/5',
      },
      {
        input: 'grads=[np.array([1.0, 2.0]), np.array([2.0])], max_norm=5.0',
        output: '([array([1., 2.]), array([2.])], 3.0)',
        explanation: 'The global norm sqrt(1 + 4 + 4) = 3 is below 5, so nothing changes',
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
        input: `(np.random.seed(0), (lambda: (
    gs := [np.random.randn(3, 4) * 5, np.random.randn(7), np.random.randn(2, 2, 2)],
    before := [g.copy() for g in gs],
    out := clip_grad_norm(gs, 0.5),
    round(float(np.sqrt(sum((c ** 2).sum() for c in out[0]))), 5),
    all(np.array_equal(a, b) for a, b in zip(gs, before)),
    round(float(out[1]), 4)
)[-3:])())[-1]`,
        expected: '(0.5, True, 21.0449)',
        hidden: true,
      },
    ],
    hints: [
      'Sum the squares of every element of every array, then take one square root: that is the global norm.',
      'clip_coef = max_norm / (total_norm + eps). Only rescale when clip_coef < 1.',
      'Return new arrays, e.g. [g * coef for g in grads].',
    ],
    solution: `import numpy as np

def clip_grad_norm(grads: list, max_norm: float, eps: float = 1e-6):
    """
    Clip a list of gradient arrays by their global L2 norm.
    """
    total_norm = float(np.sqrt(sum(np.sum(g ** 2) for g in grads)))
    clip_coef = max_norm / (total_norm + eps)
    if clip_coef < 1:
        clipped = [g * clip_coef for g in grads]
    else:
        clipped = [g.copy() for g in grads]
    return clipped, total_norm
`,
  },
  {
    id: 'loss-scaling',
    title: 'Dynamic Loss Scaling (Mixed Precision)',
    section: 'optimization',
    difficulty: 'easy',
    description: `
## Dynamic Loss Scaling for Mixed Precision

In fp16, the smallest normal number is about \`6e-5\`, and anything below about \`6e-8\` rounds to 0. Many gradients are smaller than that and would **underflow** to zero. The fix is to multiply the loss by a large **scale** \`S\` before \`backward()\`. Every gradient is then \`S\` times larger and fits in fp16. Before the optimizer step the gradients are divided by \`S\` again.

If \`S\` is too large, some gradient overflows to \`inf\`/\`nan\`. **Dynamic** loss scaling (\`torch.amp.GradScaler\`) adapts \`S\` as training goes:

\`\`\`
for each step:
    use the current scale S for this step's loss
    if the gradients overflowed:
        skip the optimizer step
        S = S * backoff_factor          # e.g. halve
        good_steps = 0
    else:
        apply the optimizer step
        good_steps += 1
        if good_steps == growth_interval:
            S = S * growth_factor       # e.g. double
            good_steps = 0
\`\`\`

So the scale stays as high as possible without overflowing: it drops right after an overflow and creeps back up after \`growth_interval\` clean steps in a row. PyTorch's defaults are \`init_scale=65536\`, \`growth_factor=2\`, \`backoff_factor=0.5\` and \`growth_interval=2000\`.

### Function Signature
\`\`\`python
def dynamic_loss_scale(overflows, init_scale=65536.0, growth_factor=2.0,
                       backoff_factor=0.5, growth_interval=2000) -> dict:
\`\`\`
\`overflows\` is a list of booleans: \`overflows[i]\` is \`True\` if step \`i\`'s gradients contained inf/nan.

### Expected Return Format
Return a dictionary with these keys:
- \`'scales'\`: list of floats, the scale **used** at each step (before that step's update), same length as \`overflows\`
- \`'skipped'\`: list of the indices of the steps whose optimizer update was skipped
- \`'final_scale'\`: float, the scale after the last step
    `,
    examples: [
      {
        input: 'overflows=[False, True, False, False, False], init_scale=8.0, growth_interval=2',
        output: "{'scales': [8.0, 8.0, 4.0, 4.0, 8.0], 'skipped': [1], 'final_scale': 8.0}",
        explanation: 'Step 1 overflows (8 -> 4, counter reset); steps 2 and 3 are two good steps in a row (4 -> 8)',
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
    ],
    hints: [
      'Keep two pieces of state: the current scale and a counter of consecutive good steps.',
      'Append the current scale to scales before you update it for the step.',
      'On overflow: record the index, multiply by backoff_factor and reset the counter. Otherwise increment the counter and grow when it reaches growth_interval (then reset it).',
    ],
    solution: `def dynamic_loss_scale(overflows, init_scale=65536.0, growth_factor=2.0,
                       backoff_factor=0.5, growth_interval=2000) -> dict:
    """
    Simulate GradScaler's dynamic loss scale over a sequence of steps.
    """
    scale = float(init_scale)
    good_steps = 0
    scales, skipped = [], []
    for i, overflow in enumerate(overflows):
        scales.append(scale)
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
`,
  },
];
