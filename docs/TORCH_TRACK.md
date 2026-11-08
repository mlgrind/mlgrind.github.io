# PyTorch track

Every problem can be solved in **NumPy** (the original track) or in
**PyTorch**. The learner picks one with the NumPy | PyTorch toggle on the
problem page; the choice is remembered in localStorage (`ml-lab-language`).
Until the learner picks one, a problem opens in its section's
`defaultLanguage` (`src/data/sections.ts`), which is NumPy everywhere except
**PyTorch Basics**: that section opens in PyTorch, unless the learner already
has NumPy code (or a NumPy solve) saved for the problem. The default is not
stored as a choice, so other sections keep opening in NumPy.

Real PyTorch has no WebAssembly build, so it can't run in Pyodide. The browser
runs a **NumPy-backed shim** that registers itself as `torch` and implements
the subset of the API below, including reverse-mode autograd.

## Files

| What | Where |
|---|---|
| Shim (one file, NumPy only) | `public/py/torch_shim.py`. `install()` registers `torch`, `torch.nn`, `torch.nn.functional`, `torch.nn.init`, `torch.optim`, `torch.distributions`, `torch.utils.data` and more in `sys.modules` |
| Shim unit tests | `scripts/test_torch_shim.py` (compares against real torch when it's importable, otherwise against finite differences and hand-computed values; also runs inside Pyodide in `npm run test:runtime`) |
| PyTorch tracks | `src/data/problems/pytorch/<section>.ts`, one file per section, each exporting `Record<problemId, LanguageVariant>`; `pytorch/index.ts` merges them and `src/data/problems/index.ts` attaches each one as `Problem.pytorch` |
| Harness | `testProgram(code, tests, functionName, 'pytorch')` in `src/lib/pythonProgram.ts`, the same harness as the NumPy track |
| Loading in the browser | `public/python-worker.js` fetches and installs the shim the first time a PyTorch run arrives, so NumPy-only visitors never download it |
| Checks | `npm test` (`src/__tests__/solutions.test.ts`): every PyTorch solution passes its tests under the shim, no starter code passes, tests call the function. `npm run test:runtime`: the same solutions and the shim's unit tests in real Pyodide |
| Real-torch check | `npx tsx scripts/check-torch-tracks.ts --torch real --python /path/to/python-with-torch` runs the PyTorch solutions through the production harness with real PyTorch |

`LanguageVariant` (see `src/types/index.ts`): `{ starterCode, solution, testCases, hints?, examples?, note? }`.
`hints` and `examples` fall back to the problem's own (write `examples` with
`torch.tensor(...)` inputs so the Examples tab matches the track); `note` is shown above the editor
after a fixed line saying the track runs on an in-browser NumPy-backed subset.

Progress stores PyTorch code under `codes.pytorch` (NumPy code stays under
`code`) and the tracks a problem was solved in under `solvedIn`; see
`src/lib/mergeProgress.ts` for how they merge with cloud progress.

## Rules for PyTorch tracks

1. **Same problem, same function name, same semantics** as the NumPy track.
   The problem description is shared, so don't change what is asked. If the
   NumPy track returns a Python float, the torch track returns a Python float
   too, so most `expected` strings stay identical. Tensors returned by test
   expressions are converted automatically: a tensor becomes a NumPy value
   (`.detach().numpy()`), a 0-d tensor becomes a scalar, and `torch.Size`
   becomes a tuple.
2. **Tests must be expression-based**: every `input` explicitly calls the
   function (or the class), e.g.
   `softmax(torch.tensor([1.0, 2.0, 3.0])).shape`. The bare argument form
   `'[1, 2, 3]'` is NumPy-only (the test suite enforces this). `torch` and `np`
   are available in test expressions.
3. **Expected values are Python literals**, compared like the NumPy track:
   `ast.literal_eval` of `expected`, then a tolerant comparison (floats within
   `rel_tol=1e-5, abs_tol=1e-6`, bools must be bools). Write
   `[[False, True]]`, not JSON's `[[false, true]]`. Values that aren't
   literals (e.g. a dtype) fall back to comparing `str(actual)`.
4. **Inputs are tensors**: build them with `torch.tensor(...)`,
   `torch.randn(...)` etc. Randomness is seeded before the submission and
   before each test (`np.random.seed(0)`, `random.seed(0)`,
   `torch.manual_seed(0)`).
5. **Wrap booleans with `bool(...)`**, as in the NumPy track:
   `bool(torch.allclose(out, expected, atol=1e-4))`.
6. **Keep the hidden/visible split**: each track has at least 1 visible and at
   least 1 hidden test. Check values, not just shapes: compare against an
   inline reference or a hand-computed constant.
7. **Idiomatic torch, inside the supported API**: the solution should look
   like what you'd write in real PyTorch, e.g. `F.softmax(x, dim=-1)`,
   `nn.Linear`, `loss.backward()`. For "implement X from scratch" problems
   (attention, layer norm, batch norm, conv2d, cross-entropy...), the solution
   implements it with tensor ops and does **not** call the built-in
   (`F.scaled_dot_product_attention`, `F.layer_norm`, `nn.Conv2d`...). Say so
   in `note`, e.g. `"Implement with tensor ops; don't use F.layer_norm."`
8. **Starter code** imports what's needed (`import torch`,
   `import torch.nn as nn`, `import torch.nn.functional as F`) and has the
   same signature and docstring as the NumPy track, adapted to tensors. It
   must not pass the tests.
9. **NumPy-specific sections** (NumPy Fundamentals, Python Basics, Einsum) map
   to the torch equivalents: `torch.zeros/arange/linspace/eye`, tensor
   indexing, `torch.einsum`, `dim=` instead of `axis=`, `.view/.permute`.
10. Use only the API listed below. Check the solution against real PyTorch
    too (`scripts/check-torch-tracks.ts --torch real`), so the track teaches
    code that works outside the browser.

## Supported API (target surface for the shim)

**Tensor creation:** `tensor, as_tensor, from_numpy, zeros, ones, full, empty, eye, arange, linspace, rand, randn, randint, randperm, normal, zeros_like, ones_like, full_like, rand_like, randn_like, manual_seed`

**dtypes:** `float32 (default float), float64, int64 (default int), int32, bool, long, float`; `.float() .long() .int() .bool() .double() .to(dtype)`; `.dtype`

**Tensor attributes and methods:** `shape, size(dim=None), dim(), ndim, numel(), T, mT, item(), tolist(), numpy(), detach(), clone(), requires_grad, requires_grad_(), grad, grad_fn, is_leaf, backward(gradient=None), zero_() / fill_() / copy_() / normal_() / uniform_() (in-place, under no_grad), contiguous(), to(device_or_dtype) (no-op for 'cpu'), cpu(), device`

**Shape operations:** `view, reshape, flatten(start_dim, end_dim), unflatten, squeeze(dim), unsqueeze, permute, transpose, t, expand, expand_as, repeat, chunk, split, cat, stack, gather, scatter (non-autograd ok), index_select, masked_fill, where, tril, triu, flip, roll, narrow`, plus basic, advanced and boolean indexing and setitem (`x[mask] = 0`)

**Math (elementwise, broadcasting):** `+ - * / // % ** @`, unary `-`, `abs, exp, log, log1p, sqrt, rsqrt, sin, cos, tanh, sigmoid, relu, clamp(min,max), clip, sign, floor, ceil, round, maximum, minimum, pow, reciprocal, lerp`, and comparisons `== != < <= > >=` returning bool tensors, plus `logical_and/or/not, isnan, isinf, isclose, allclose, equal`

**Reductions** (with `dim` as int or tuple, and `keepdim`): `sum, mean, var(unbiased=/correction=), std, max (returns values,indices with dim), min, argmax, argmin, prod, cumsum, logsumexp, norm(p, dim), all, any, topk, sort, argsort, unique, bincount, count_nonzero`

**Linear algebra:** `matmul, mm, bmm, einsum, outer, dot, linalg.norm, linalg.inv, linalg.svd, linalg.eigh, diag, trace`

**Autograd:** `backward`, `torch.no_grad()` (context manager and decorator), `torch.enable_grad`, `torch.autograd.grad(outputs, inputs)`, and `retain_grad()`. Gradients are correct for every differentiable op above, including broadcasting reductions, indexing and `masked_fill`.

**nn:** `Module` (with `__call__`, `forward`, `parameters()`, `named_parameters()`, `children()`, `modules()`, `state_dict()`, `load_state_dict()`, `zero_grad()`, `train()`, `eval()`, `training`, auto-registration of `Parameter` and submodules, `register_buffer`), `Parameter`, `Sequential`, `ModuleList`, `ModuleDict`, `Linear`, `Bilinear`, `Embedding`, `Conv1d`, `Conv2d`, `MaxPool2d`, `AvgPool2d`, `AdaptiveAvgPool2d`, `Flatten`, `Dropout`, `BatchNorm1d`, `BatchNorm2d`, `LayerNorm`, `ReLU`, `LeakyReLU`, `GELU`, `SiLU`, `Sigmoid`, `Tanh`, `Softmax`, `Identity`, `MSELoss`, `L1Loss`, `CrossEntropyLoss` (class indices, `label_smoothing`), `NLLLoss`, `BCELoss`, `BCEWithLogitsLoss`, `MultiheadAttention` (batch_first)

**nn.functional:** `relu, leaky_relu, gelu, silu, sigmoid, tanh, softmax, log_softmax, dropout, linear, cross_entropy, nll_loss, mse_loss, l1_loss, binary_cross_entropy, binary_cross_entropy_with_logits, kl_div, one_hot, pad, conv1d, conv2d, max_pool2d, avg_pool2d, layer_norm, batch_norm, normalize, cosine_similarity, embedding, scaled_dot_product_attention (is_causal, attn_mask)`

**nn.init:** `zeros_, ones_, constant_, normal_, uniform_, xavier_uniform_, xavier_normal_, kaiming_uniform_, kaiming_normal_, calculate_gain`

**optim:** `SGD(lr, momentum, weight_decay, nesterov)`, `Adam(lr, betas, eps, weight_decay)`, `AdamW`, `RMSprop`, with `zero_grad()`, `step()`, `param_groups`, and `optim.lr_scheduler` (`StepLR`, `CosineAnnealingLR` and the other common schedulers)

**distributions:** `Categorical(probs=|logits=)` with `.sample() .log_prob() .entropy()`, and `Normal(loc, scale)` with `.sample() .rsample() .log_prob() .entropy()`

**Beyond the list:** `utils.data` (`Dataset`, `TensorDataset`, `DataLoader`), more layers (`RMSNorm`, `GroupNorm`, `ConvTranspose`, `TransformerEncoderLayer`), extra distributions with `kl_divergence`, `autograd.Function` and more `linalg`.

**Numerics:** float32 by default like torch (stored as `np.float32`), so values match real torch to about 1e-6. Integer tensors are int64. Division of ints gives float (true division). Error messages mimic torch where cheap (shape mismatch in matmul, for example).

## Shim status

`scripts/test_torch_shim.py` compares the shim with real PyTorch: 1057 checks
of forward values and gradients, plus optimizer trajectories, LR schedules
and dtypes. Without torch it falls back to 621 finite-difference and
hand-computed checks; inside Pyodide (wasm32, NumPy 1.26) 620 of them run
(the subprocess-based `install()` check is skipped). Run it with an
interpreter that has torch to get the comparison:

```bash
python3 scripts/test_torch_shim.py
```

**wasm32:** NumPy's `intp` is int32 in Pyodide, so index arrays passed to
`np.take`, `np.repeat` or `np.bincount` must be cast to `np.intp` (int64
tensor data fails NumPy's 'safe' cast there, although CPython runs pass).
The Pyodide run in `npm run test:runtime` catches regressions.

**Not supported** (each raises `NotImplementedError("torch shim: ... is not supported in the browser")`):
- CUDA, `torch.compile`, JIT and `save`/`load`
- complex and sparse dtypes
- higher-order gradients (`create_graph=True`)
- RNN, LSTM and GRU, the Transformer decoder and Conv3d
- gradients through the SVD, QR and Cholesky factors

**Deliberate differences from torch:**
- A second `backward()` works without `retain_graph`.
- With autograd on, in-place ops copy the array, so views don't share memory then (they do under `no_grad`).
- It doesn't track in-place versions, so it never raises torch's "modified by an inplace operation" error.
- `ndarray + tensor` works.

**Randomness:** `torch.manual_seed` seeds NumPy's global RNG, so seeded shim
randomness matches NumPy's, not real torch's. Tests that depend on random
values must check properties, not exact numbers.
