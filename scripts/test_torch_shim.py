"""Unit tests for the NumPy-backed torch shim (public/py/torch_shim.py).

Usage:
    python3 scripts/test_torch_shim.py [-v] [-k substring]

How it works
------------
The shim is loaded under its own name with ``torch_shim._build()``, which
returns the shim's ``torch`` module tree *without* registering it in
``sys.modules``. So real PyTorch (if importable) and the shim can live in the
same process: every case below is a function ``fn(lib, *tensors)`` that is run
once with ``lib = shim`` and once with ``lib = real torch``.

* Real torch available: forward values AND gradients (of inputs, and of module
  parameters) are compared against real torch. Gradients are taken of
  ``sum(out * R)`` for a fixed random projection ``R``. Optimizer steps are
  compared trajectory-by-trajectory.
* Real torch absent: gradients are checked against central finite differences
  (computed in float64 through the shim itself), optimizers against small
  NumPy reference implementations, and the behaviour checks against
  hand-written expected values.

Exits non-zero if any check fails and prints a summary either way.
"""
import math
import os
import sys
import traceback
import zlib

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'public', 'py'))
sys.dont_write_bytecode = True  # keep __pycache__ out of public/ (and so out of dist/)
import torch_shim  # noqa: E402

S = torch_shim._build()
try:
    import torch as T  # real torch, if installed
    if getattr(T, '_is_torch_shim', False):
        T = None
except ImportError:
    T = None

VERBOSE = '-v' in sys.argv
FILTER = sys.argv[sys.argv.index('-k') + 1] if '-k' in sys.argv else None
RESULTS = {'pass': 0, 'fail': 0, 'skip': 0}
FAILURES = []


def _rng(name):
    return np.random.RandomState(zlib.crc32(name.encode()) & 0xFFFFFFFF)


def report(name, ok, detail=''):
    if ok:
        RESULTS['pass'] += 1
        if VERBOSE:
            print(f'  ok   {name}')
    else:
        RESULTS['fail'] += 1
        FAILURES.append(f'{name}: {detail}')
        print(f'  FAIL {name}: {detail}')


def selected(name):
    return FILTER is None or FILTER in name


# ----------------------------------------------------------------------------
# input specs
# ----------------------------------------------------------------------------

class Spec:
    def __init__(self, make, grad=True):
        self.make, self.grad = make, grad


def R(*shape):
    """Standard normal float input (differentiable)."""
    return Spec(lambda r: r.randn(*shape))


def P(*shape):
    """Positive float input (differentiable)."""
    return Spec(lambda r: np.abs(r.randn(*shape)) + 0.5)


def U(*shape):
    """Float input in (0.1, 0.9) (differentiable)."""
    return Spec(lambda r: r.uniform(0.1, 0.9, shape))


def I(hi, *shape):
    """Integer input in [0, hi) (not differentiable)."""
    return Spec(lambda r: r.randint(0, hi, shape).astype(np.int64), grad=False)


def B(*shape):
    """Boolean input (not differentiable)."""
    return Spec(lambda r: r.rand(*shape) > 0.5, grad=False)


def C(arr, grad=False):
    """Constant input."""
    a = np.asarray(arr)
    return Spec(lambda r: a.copy(), grad=grad and a.dtype.kind == 'f')


def make_inputs(name, specs):
    r = _rng(name)
    return [s.make(r) for s in specs]


# ----------------------------------------------------------------------------
# evaluation helpers
# ----------------------------------------------------------------------------

def to_tensor(lib, a, grad, float_dtype):
    if a.dtype.kind == 'f':
        t = lib.tensor(a.astype(float_dtype))
        if grad:
            t.requires_grad_(True)
        return t
    return lib.tensor(a)


def flatten_out(out):
    if isinstance(out, (tuple, list)):
        res = []
        for o in out:
            res.extend(flatten_out(o))
        return res
    return [out]


def as_np(x):
    if hasattr(x, 'detach') and hasattr(x, 'numpy'):
        return np.asarray(x.detach().numpy())
    return np.asarray(x)


def projections(name, outs):
    r = _rng(name + '#proj')
    return [np.asarray(r.randn(*as_np(o).shape)) if hasattr(o, 'requires_grad') else None for o in outs]


def evaluate(lib, fn, arrays, specs, float_dtype=np.float32, grad=True, name='', module=None):
    ts = [to_tensor(lib, a, grad and s.grad, float_dtype) for a, s in zip(arrays, specs)]
    out = fn(lib, *ts) if module is None else fn(lib, module, *ts)
    outs = flatten_out(out)
    vals = [as_np(o) for o in outs]
    grads = None
    if grad:
        projs = projections(name, outs)
        loss = None
        for o, pr in zip(outs, projs):
            if pr is not None and getattr(o, 'requires_grad', False) and o.is_floating_point():
                term = (o * lib.tensor(pr.astype(as_np(o).dtype))).sum()
                loss = term if loss is None else loss + term
        if loss is not None:
            loss.backward()
        grads = [as_np(t.grad) if (s.grad and t.grad is not None) else None for t, s in zip(ts, specs)]
        if module is not None:
            grads += [as_np(p.grad) if p.grad is not None else None for _, p in module.named_parameters()]
    return vals, grads


def scalar_loss(lib, fn, arrays, specs, name, module=None):
    ts = [to_tensor(lib, a, False, np.float64) for a, s in zip(arrays, specs)]
    with lib.no_grad():
        out = fn(lib, *ts) if module is None else fn(lib, module, *ts)
    outs = flatten_out(out)
    projs = projections(name, outs)
    total = 0.0
    for o, pr in zip(outs, projs):
        if pr is not None and o.is_floating_point():
            total += float((as_np(o).astype(np.float64) * pr).sum())
    return total


def finite_diff(fn, arrays, specs, name, module=None, eps=1e-6):
    grads = []
    for i, (a, s) in enumerate(zip(arrays, specs)):
        if not s.grad:
            grads.append(None)
            continue
        g = np.zeros(a.shape)
        flat = a.reshape(-1)
        for j in range(flat.size):
            orig = flat[j]
            flat[j] = orig + eps
            fp = scalar_loss(S, fn, arrays, specs, name, module)
            flat[j] = orig - eps
            fm = scalar_loss(S, fn, arrays, specs, name, module)
            flat[j] = orig
            g.reshape(-1)[j] = (fp - fm) / (2 * eps)
        grads.append(g)
    if module is not None:
        for _, p in module.named_parameters():
            g = np.zeros(p.shape)
            flat = p.data.numpy().reshape(-1)
            for j in range(flat.size):
                orig = flat[j]
                flat[j] = orig + eps
                fp = scalar_loss(S, fn, arrays, specs, name, module)
                flat[j] = orig - eps
                fm = scalar_loss(S, fn, arrays, specs, name, module)
                flat[j] = orig
                g.reshape(-1)[j] = (fp - fm) / (2 * eps)
            grads.append(g)
    return grads


def close(a, b, atol, rtol):
    a, b = np.asarray(a), np.asarray(b)
    if a.shape != b.shape:
        return False, f'shape {a.shape} vs {b.shape}'
    if a.dtype.kind in 'biu' or b.dtype.kind in 'biu':
        if a.dtype.kind == 'f' or b.dtype.kind == 'f':
            return False, f'dtype kind {a.dtype} vs {b.dtype}'
        return (bool(np.array_equal(a, b)), f'{a.tolist()} vs {b.tolist()}') if not np.array_equal(a, b) else (True, '')
    if not np.allclose(a.astype(np.float64), b.astype(np.float64), atol=atol, rtol=rtol, equal_nan=True):
        d = np.nanmax(np.abs(a.astype(np.float64) - b.astype(np.float64))) if a.size else 0
        return False, f'max abs diff {d:.3g}'
    return True, ''


def check(name, fn, *specs, grad=True, atol=1e-5, rtol=1e-4, gatol=1e-4, grtol=1e-3, expected=None,
          module_ctor=None, train=True, fd=True):
    """Run fn(lib, *tensors) through the shim and compare against real torch / finite differences."""
    if not selected(name):
        return
    try:
        arrays = make_inputs(name, specs)
        module_s = module_r = None
        if module_ctor is not None:
            module_s = build_module(S, module_ctor, name, train)
            if T is not None:
                module_r = build_module(T, module_ctor, name, train)
        vals_s, grads_s = evaluate(S, fn, [a.copy() for a in arrays], specs, grad=grad, name=name, module=module_s)
        if expected is not None:
            exp = flatten_out(expected)
            for k, (v, e) in enumerate(zip(vals_s, exp)):
                ok, d = close(v, np.asarray(e), atol, rtol)
                report(f'{name} [expected out{k}]', ok, d)
        if T is not None:
            vals_r, grads_r = evaluate(T, fn, [a.copy() for a in arrays], specs, grad=grad, name=name,
                                       module=module_r)
            if len(vals_s) != len(vals_r):
                report(name, False, f'{len(vals_s)} outputs vs {len(vals_r)} in torch')
                return
            for k, (a, b) in enumerate(zip(vals_s, vals_r)):
                ok, d = close(a, b, atol, rtol)
                if ok and np.asarray(b).dtype != np.asarray(a).dtype:
                    ok, d = False, f'dtype {np.asarray(a).dtype} vs torch {np.asarray(b).dtype}'
                report(f'{name} [out{k} vs torch]', ok, d)
            if grad:
                for k, (a, b) in enumerate(zip(grads_s, grads_r)):
                    if a is None and b is None:
                        continue
                    if a is None or b is None:
                        report(f'{name} [grad{k} vs torch]', False, f'shim {a is None}, torch {b is None}')
                        continue
                    ok, d = close(a, b, gatol, grtol)
                    report(f'{name} [grad{k} vs torch]', ok, d)
        elif grad and fd:
            S.set_default_dtype(S.float64)
            try:
                fd_check(name, fn, arrays, specs, module_s)
            finally:
                S.set_default_dtype(S.float32)
        else:
            report(f'{name} [ran]', True)
    except Exception as e:  # noqa: BLE001
        report(name, False, f'{type(e).__name__}: {e}\n{traceback.format_exc() if VERBOSE else ""}')


def fd_check(name, fn, arrays, specs, module_s):
    """Compare shim gradients (float64) with central finite differences."""
    if module_s is not None:
        module_s.double()
        for p in module_s.parameters():
            p.grad = None
    _, grads64 = evaluate(S, fn, [a.copy() for a in arrays], specs, np.float64, True, name, module_s)
    num = finite_diff(fn, [a.astype(np.float64) if a.dtype.kind == 'f' else a for a in arrays], specs,
                      name, module_s)
    for k, (a, b) in enumerate(zip(grads64, num)):
        if b is None:
            continue
        if a is None:
            a = np.zeros_like(b)
        ok, d = close(a, b, 1e-5, 1e-4)
        report(f'{name} [grad{k} vs finite diff]', ok, d)


def build_module(lib, ctor, name, train):
    m = ctor(lib)
    r = _rng(name + '#params')
    sd = m.state_dict()
    new = {}
    for k, v in sd.items():
        a = as_np(v)
        if a.dtype.kind == 'f' and 'running_var' not in k:
            new[k] = lib.tensor((r.randn(*a.shape) * 0.5).astype(a.dtype))
        elif 'running_var' in k:
            new[k] = lib.tensor((np.abs(r.randn(*a.shape)) + 0.5).astype(a.dtype))
        else:
            new[k] = v
    m.load_state_dict(new)
    m.train(train)
    return m


def behaviour(name, fn, expected=None):
    """Compare a python-level result (dtype names, shapes, bools, errors) against torch or expected."""
    if not selected(name):
        return
    def run(lib):
        try:
            return ('ok', normalize(fn(lib)))
        except Exception as e:  # noqa: BLE001
            return ('error', type(e).__name__ if not isinstance(e, NotImplementedError) else 'NotImplementedError')
    got = run(S)
    if T is not None:
        want = run(T)
        report(f'{name} [vs torch]', got == want, f'shim {got} vs torch {want}')
    elif expected is not None:
        want = expected if (isinstance(expected, tuple) and len(expected) == 2 and expected[0] in ('ok', 'error')) \
            else ('ok', expected)
        if want[0] == 'ok':
            want = ('ok', normalize(want[1]))
        report(f'{name} [expected]', got == want, f'shim {got} vs expected {want}')
    else:
        report(f'{name} [ran]', got[0] == 'ok', str(got))


def _tup(x):
    return tuple(_tup(i) for i in x) if isinstance(x, list) else x


def normalize(v):
    if hasattr(v, 'detach') and hasattr(v, 'numpy'):
        a = as_np(v)
        return ('tensor', str(v.dtype), tuple(a.shape), _tup(np.round(a.astype(np.float64), 4).tolist()
                if a.dtype.kind == 'f' else a.tolist()))
    if isinstance(v, (tuple, list)):
        return tuple(normalize(x) for x in v)
    if type(v).__name__ == 'Size':
        return tuple(v)
    if isinstance(v, float):
        return round(v, 4)
    if hasattr(v, 'is_floating_point') and hasattr(v, 'itemsize'):  # dtype
        return str(v)
    return v


# ============================================================================
# Cases
# ============================================================================

def creation_and_dtype():
    print('creation / dtypes / attributes')
    behaviour('tensor float default', lambda L: L.tensor([1.0, 2.0]).dtype, 'torch.float32')
    behaviour('tensor int default', lambda L: L.tensor([1, 2]).dtype, 'torch.int64')
    behaviour('tensor bool', lambda L: L.tensor([True, False]).dtype, 'torch.bool')
    behaviour('tensor from float64 ndarray', lambda L: L.tensor(np.array([1.0])).dtype, 'torch.float64')
    behaviour('from_numpy keeps dtype', lambda L: L.from_numpy(np.array([1, 2], dtype=np.int32)).dtype,
              'torch.int32')
    behaviour('int / int is float', lambda L: (L.tensor([1, 2]) / L.tensor([2, 2])), ('ok', ('tensor', 'torch.float32', (2,), [0.5, 1.0])))
    behaviour('int // int', lambda L: (L.tensor([7, -7]) // 2), ('ok', ('tensor', 'torch.int64', (2,), [3, -4])))
    behaviour('int tensor * python float', lambda L: (L.tensor([1, 2]) * 1.5).dtype, 'torch.float32')
    behaviour('float32 * python float keeps f32', lambda L: (L.ones(2) * 2.5).dtype, 'torch.float32')
    behaviour('f32 + f64 tensor -> f64', lambda L: (L.ones(2) + L.ones(2, dtype=L.float64)).dtype, 'torch.float64')
    behaviour('f32 + 0-d f64 -> f32', lambda L: (L.ones(2) + L.tensor(1.0, dtype=L.float64)).dtype, 'torch.float32')
    behaviour('int + 0-d float -> float', lambda L: (L.tensor([1]) + L.tensor(1.0)).dtype, 'torch.float32')
    behaviour('bool + bool', lambda L: (L.tensor([True]) + L.tensor([True])).dtype, 'torch.bool')
    behaviour('bool sum is int64', lambda L: L.tensor([True, True]).sum(), ('ok', ('tensor', 'torch.int64', (), 2)))
    behaviour('comparison is bool', lambda L: (L.ones(2) > 0).dtype, 'torch.bool')
    behaviour('zeros shape tuple', lambda L: L.zeros((2, 3)).shape, (2, 3))
    behaviour('zeros varargs', lambda L: L.zeros(2, 3).shape, (2, 3))
    behaviour('ones dtype', lambda L: L.ones(2, dtype=L.long).dtype, 'torch.int64')
    behaviour('full int', lambda L: L.full((2,), 3).dtype, 'torch.int64')
    behaviour('full float', lambda L: L.full((2,), 3.0), ('ok', ('tensor', 'torch.float32', (2,), [3.0, 3.0])))
    behaviour('eye', lambda L: L.eye(2, 3), ('ok', ('tensor', 'torch.float32', (2, 3), [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0]])))
    behaviour('arange int', lambda L: L.arange(5), ('ok', ('tensor', 'torch.int64', (5,), [0, 1, 2, 3, 4])))
    behaviour('arange float', lambda L: L.arange(0, 1, 0.25), ('ok', ('tensor', 'torch.float32', (4,), [0.0, 0.25, 0.5, 0.75])))
    behaviour('arange start end', lambda L: L.arange(2, 6), ('ok', ('tensor', 'torch.int64', (4,), [2, 3, 4, 5])))
    behaviour('linspace', lambda L: L.linspace(0, 1, 5), ('ok', ('tensor', 'torch.float32', (5,), [0.0, 0.25, 0.5, 0.75, 1.0])))
    behaviour('zeros_like dtype', lambda L: L.zeros_like(L.tensor([1, 2])).dtype, 'torch.int64')
    behaviour('full_like', lambda L: L.full_like(L.ones(2), 7.0), ('ok', ('tensor', 'torch.float32', (2,), [7.0, 7.0])))
    behaviour('randn shape', lambda L: L.randn(2, 3).shape, (2, 3))
    behaviour('rand range', lambda L: bool(((L.rand(100) >= 0) & (L.rand(100) < 1)).all()), True)
    behaviour('randint shape dtype', lambda L: (L.randint(0, 5, (3, 2)).shape, L.randint(5, (3,)).dtype),
              ((3, 2), 'torch.int64'))
    behaviour('randperm sorted', lambda L: L.randperm(6).sort().values.tolist(), [0, 1, 2, 3, 4, 5])
    behaviour('normal shape', lambda L: L.normal(0.0, 1.0, size=(4,)).shape, (4,))
    behaviour('randn_like', lambda L: L.randn_like(L.zeros(2, 2)).shape, (2, 2))
    behaviour('manual_seed reproducible', lambda L: (L.manual_seed(3), L.randn(3))[1].tolist() ==
              (L.manual_seed(3), L.randn(3))[1].tolist(), True)
    behaviour('.float() .long() .int() .bool() .double()',
              lambda L: [str(L.tensor([1.7]).__getattribute__(m)().dtype) for m in
                         ('float', 'long', 'int', 'bool', 'double')],
              ['torch.float32', 'torch.int64', 'torch.int32', 'torch.bool', 'torch.float64'])
    behaviour('.long() truncates', lambda L: L.tensor([1.7, -1.7]).long().tolist(), [1, -1])
    behaviour('.to(dtype)', lambda L: L.tensor([1]).to(L.float32).dtype, 'torch.float32')
    behaviour(".to('cpu')", lambda L: str(L.ones(1).to('cpu').device), 'cpu')
    behaviour('size/dim/numel/ndim', lambda L: (L.ones(2, 3).size(), L.ones(2, 3).size(1), L.ones(2, 3).size(-1),
                                                L.ones(2, 3).dim(), L.ones(2, 3).numel(), L.ones(2, 3).ndim),
              ((2, 3), 3, 3, 2, 6, 2))
    behaviour('Size repr', lambda L: repr(L.ones(2, 3).shape), 'torch.Size([2, 3])')
    behaviour('T and mT', lambda L: (L.ones(2, 3).T.shape, L.ones(4, 2, 3).mT.shape), ((3, 2), (4, 3, 2)))
    behaviour('item / tolist', lambda L: (L.tensor([[2.5]]).item(), L.tensor([[1, 2]]).tolist()), (2.5, [[1, 2]]))
    behaviour('item error', lambda L: L.ones(2).item(), ('error', 'RuntimeError'))
    behaviour('numpy() on requires_grad errors', lambda L: L.ones(2, requires_grad=True).numpy(),
              ('error', 'RuntimeError'))
    behaviour('detach().numpy()', lambda L: L.ones(2, requires_grad=True).detach().numpy().tolist(), [1.0, 1.0])
    behaviour('is_leaf / grad_fn', lambda L: (lambda x: (x.is_leaf, x.grad_fn is None, (x * 2).is_leaf,
                                                         (x * 2).grad_fn is not None))(L.ones(2, requires_grad=True)),
              (True, True, False, True))
    behaviour('requires_grad int errors', lambda L: L.tensor([1]).requires_grad_(), ('error', 'RuntimeError'))
    behaviour('clone is non-leaf', lambda L: L.ones(2, requires_grad=True).clone().is_leaf, False)
    behaviour('bool() ambiguous', lambda L: bool(L.ones(2)), ('error', 'RuntimeError'))
    behaviour('f-string format', lambda L: f'{L.tensor(0.123456):.3f}', '0.123')
    behaviour('len and iter', lambda L: (len(L.ones(3, 2)), [t.shape for t in L.ones(3, 2)][0]), (3, (2,)))
    behaviour('int(), float()', lambda L: (int(L.tensor(3)), float(L.tensor(2.5))), (3, 2.5))
    behaviour('isinstance Tensor', lambda L: isinstance(L.ones(1), L.Tensor), True)
    behaviour('Parameter is Tensor', lambda L: isinstance(L.nn.Parameter(L.ones(1)), L.Tensor), True)
    behaviour('dtype equality', lambda L: (L.float == L.float32, L.long == L.int64, L.double == L.float64),
              (True, True, True))
    behaviour('get_default_dtype', lambda L: L.get_default_dtype(), 'torch.float32')
    behaviour('cuda unavailable', lambda L: L.cuda.is_available(), False)
    behaviour('allclose returns bool', lambda L: L.allclose(L.ones(2), L.ones(2) + 1e-9), True)
    behaviour('equal', lambda L: (L.equal(L.ones(2), L.ones(2)), L.equal(L.ones(2), L.ones(3))), (True, False))
    behaviour('isclose', lambda L: L.isclose(L.tensor([1.0, 2.0]), L.tensor([1.0, 2.1])).tolist(), [True, False])
    behaviour('isnan isinf', lambda L: (L.isnan(L.tensor([float('nan'), 1.0])).tolist(),
                                        L.isinf(L.tensor([float('inf'), 1.0])).tolist()), ([True, False], [True, False]))
    behaviour('matmul shape error', lambda L: L.ones(2, 3) @ L.ones(4, 5), ('error', 'RuntimeError'))
    behaviour('view invalid', lambda L: L.ones(6).view(4, 2), ('error', 'RuntimeError'))
    behaviour('finfo eps', lambda L: L.finfo(L.float32).eps, round(float(np.finfo(np.float32).eps), 4))
    behaviour('tensor repr', lambda L: repr(L.tensor([1.0, 2.5])), 'tensor([1.0000, 2.5000])')
    behaviour('tensor repr int', lambda L: repr(L.tensor([1, 2])), 'tensor([1, 2])')
    behaviour('tensor repr grad', lambda L: repr(L.tensor([1.0], requires_grad=True)),
              'tensor([1.], requires_grad=True)')
    behaviour('empty shape', lambda L: L.empty(3, 2).shape, (3, 2))
    behaviour('tensor of tensors', lambda L: L.tensor([L.tensor(1.0).item(), 2.0]).tolist(), [1.0, 2.0])
    behaviour('stack of 0-d', lambda L: L.stack([L.tensor(1.0), L.tensor(2.0)]).tolist(), [1.0, 2.0])
    behaviour('index with tensor scalar', lambda L: L.arange(5)[L.tensor(2)].item(), 2)
    behaviour('range(tensor)', lambda L: list(range(L.tensor(3))), [0, 1, 2])
    behaviour('no_grad', lambda L: (lambda x: [(x * 2).requires_grad for _ in [0] if L.no_grad().__enter__() or True]
                                    )(L.ones(1, requires_grad=True)) if False else None, None)
    behaviour('no_grad context', lambda L: _ng(L), (False, True, True))
    behaviour('no_grad decorator', lambda L: L.no_grad()(lambda x: (x * 2).requires_grad)(L.ones(1, requires_grad=True)),
              False)
    behaviour('set_grad_enabled', lambda L: _sge(L), False)
    behaviour('enable_grad inside no_grad', lambda L: _eg(L), True)


def _ng(L):
    x = L.ones(1, requires_grad=True)
    with L.no_grad():
        a = (x * 2).requires_grad
    return a, (x * 2).requires_grad, L.is_grad_enabled()


def _sge(L):
    x = L.ones(1, requires_grad=True)
    with L.set_grad_enabled(False):
        return (x * 2).requires_grad


def _eg(L):
    x = L.ones(1, requires_grad=True)
    with L.no_grad():
        with L.enable_grad():
            return (x * 2).requires_grad


def math_ops():
    print('elementwise math')
    for name, fn, spec in [
        ('add', lambda L, a, b: a + b, (R(3, 4), R(4))),
        ('add alpha', lambda L, a, b: L.add(a, b, alpha=2), (R(3, 4), R(3, 1))),
        ('sub broadcast', lambda L, a, b: a - b, (R(2, 3, 4), R(3, 1))),
        ('rsub scalar', lambda L, a: 2.0 - a, (R(3),)),
        ('mul', lambda L, a, b: a * b, (R(3, 4), R(1, 4))),
        ('div', lambda L, a, b: a / b, (R(3, 4), P(4))),
        ('rdiv', lambda L, a: 1.0 / a, (P(3),)),
        ('pow scalar', lambda L, a: a ** 3, (R(5),)),
        ('pow tensor', lambda L, a, b: a ** b, (P(4), R(4))),
        ('rpow', lambda L, a: 2.0 ** a, (R(4),)),
        ('neg', lambda L, a: -a, (R(4),)),
        ('abs', lambda L, a: a.abs(), (R(6),)),
        ('exp', lambda L, a: L.exp(a), (R(5),)),
        ('log', lambda L, a: a.log(), (P(5),)),
        ('log1p', lambda L, a: L.log1p(a), (P(5),)),
        ('log2 log10', lambda L, a: (L.log2(a), L.log10(a)), (P(4),)),
        ('expm1', lambda L, a: L.expm1(a), (R(4),)),
        ('sqrt', lambda L, a: a.sqrt(), (P(5),)),
        ('rsqrt', lambda L, a: L.rsqrt(a), (P(5),)),
        ('sin cos tan', lambda L, a: (L.sin(a), L.cos(a), L.tan(a)), (R(4),)),
        ('asin acos atan', lambda L, a: (L.asin(a), L.acos(a), L.atan(a)), (U(4),)),
        ('sinh cosh', lambda L, a: (L.sinh(a), L.cosh(a)), (R(4),)),
        ('tanh', lambda L, a: L.tanh(a), (R(5),)),
        ('sigmoid', lambda L, a: L.sigmoid(a * 5), (R(5),)),
        ('relu', lambda L, a: L.relu(a), (R(8),)),
        ('erf', lambda L, a: L.erf(a), (R(6),)),
        ('reciprocal', lambda L, a: a.reciprocal(), (P(4),)),
        ('square', lambda L, a: L.square(a), (R(4),)),
        ('clamp', lambda L, a: a.clamp(-0.5, 0.5), (R(10),)),
        ('clamp min only', lambda L, a: L.clamp(a, min=0.1), (R(10),)),
        ('clip', lambda L, a: L.clip(a, max=0.2), (R(10),)),
        ('clamp tensor bounds', lambda L, a, lo: L.clamp(a, min=lo), (R(6), R(6))),
        ('maximum', lambda L, a, b: L.maximum(a, b), (R(6), R(6))),
        ('minimum', lambda L, a, b: L.minimum(a, b), (R(2, 3), R(3))),
        ('max binary', lambda L, a, b: L.max(a, b), (R(5), R(5))),
        ('lerp', lambda L, a, b: L.lerp(a, b, 0.3), (R(4), R(4))),
        ('where', lambda L, c, a, b: L.where(c, a, b), (B(3, 4), R(3, 4), R(4))),
        ('where scalar', lambda L, c, a: L.where(c, a, 0.0), (B(5), R(5))),
        ('sign floor ceil round', lambda L, a: (L.sign(a), L.floor(a * 3), L.ceil(a * 3), L.round(a * 3)), (R(5),)),
        ('remainder', lambda L, a: a % 0.7, (R(5),)),
        ('atan2', lambda L, a, b: L.atan2(a, b), (R(4), R(4))),
        ('logaddexp', lambda L, a, b: L.logaddexp(a, b), (R(4), R(4))),
        ('xlogy', lambda L, a, b: L.xlogy(a, b), (P(4), P(4))),
        ('addcmul addcdiv', lambda L, a, b, c: (L.addcmul(a, b, c, value=0.5), L.addcdiv(a, b, c, value=2)),
         (R(3), R(3), P(3))),
        ('comparisons', lambda L, a, b: (a < b, a <= b, a > b, a >= b, a == b, a != b), (R(5), R(5))),
        ('logical ops', lambda L, a, b: (L.logical_and(a, b), L.logical_or(a, b), L.logical_not(a), a & b, a | b,
                                         ~a, a ^ b), (B(5), B(5))),
        ('int arithmetic', lambda L, a, b: (a + b, a * b, a - b, a // (b + 1), a % (b + 1)), (I(10, 5), I(10, 5))),
        ('chain', lambda L, a, b: ((a * b).sigmoid() + a.exp() / (1 + b * b)).tanh(), (R(3, 3), R(3, 3))),
        ('nan_to_num', lambda L, a: L.nan_to_num(a), (R(4),)),
    ]:
        check(name, fn, *spec)


def reduction_ops():
    print('reductions')
    for name, fn, spec in [
        ('sum all', lambda L, a: a.sum(), (R(3, 4),)),
        ('sum dim', lambda L, a: a.sum(1), (R(3, 4),)),
        ('sum dim keepdim', lambda L, a: a.sum(dim=0, keepdim=True), (R(3, 4),)),
        ('sum tuple dim', lambda L, a: a.sum((0, 2)), (R(2, 3, 4),)),
        ('sum negative dim', lambda L, a: L.sum(a, -1), (R(2, 3, 4),)),
        ('mean', lambda L, a: (a.mean(), a.mean(-1), a.mean((0, 1), keepdim=True)), (R(2, 3, 4),)),
        ('var', lambda L, a: (a.var(), a.var(0), a.var(1, unbiased=False), a.var(1, keepdim=True)), (R(4, 5),)),
        ('var correction', lambda L, a: a.var(dim=1, correction=0), (R(4, 5),)),
        ('std', lambda L, a: (a.std(), a.std(0), a.std(dim=1, unbiased=False)), (R(4, 5),)),
        ('prod', lambda L, a: (a.prod(), a.prod(1), a.prod(0, keepdim=True)), (R(3, 4),)),
        ('max dim', lambda L, a: a.max(dim=1), (R(4, 5),)),
        ('max dim keepdim', lambda L, a: L.max(a, 0, keepdim=True), (R(4, 5),)),
        ('max all', lambda L, a: a.max(), (R(4, 5),)),
        ('min dim', lambda L, a: a.min(-1), (R(4, 5),)),
        ('amax amin', lambda L, a: (L.amax(a, 1), L.amin(a, (0, 1))), (R(3, 4),)),
        ('argmax argmin', lambda L, a: (a.argmax(), a.argmax(1), a.argmin(0), a.argmax(1, keepdim=True)),
         (R(3, 4),)),
        ('cumsum', lambda L, a: (a.cumsum(1), L.cumsum(a, 0)), (R(3, 4),)),
        ('cumprod', lambda L, a: L.cumprod(a, 1), (P(2, 4),)),
        ('logsumexp', lambda L, a: (L.logsumexp(a, 1), a.logsumexp(0, keepdim=True)), (R(3, 4),)),
        ('softmax', lambda L, a: (L.softmax(a, -1), a.softmax(0)), (R(3, 4),)),
        ('log_softmax', lambda L, a: L.log_softmax(a, 1), (R(3, 4),)),
        ('norm', lambda L, a: (a.norm(), a.norm(dim=1), L.norm(a, p=1, dim=0), a.norm(p=3, dim=1, keepdim=True)),
         (R(3, 4),)),
        ('norm inf', lambda L, a: a.norm(p=float('inf'), dim=1), (R(3, 4),)),
        ('all any', lambda L, a: (a.all(), a.any(), a.all(1), a.any(0)), (B(3, 4),)),
        ('count_nonzero', lambda L, a: (L.count_nonzero(a), L.count_nonzero(a, dim=0)), (I(2, 3, 4),)),
        ('topk', lambda L, a: L.topk(a, 2, dim=1), (R(3, 5),)),
        ('topk smallest', lambda L, a: a.topk(2, largest=False), (R(3, 5),)),
        ('sort', lambda L, a: L.sort(a, dim=1), (R(3, 5),)),
        ('sort descending', lambda L, a: a.sort(descending=True), (R(3, 5),)),
        ('argsort', lambda L, a: L.argsort(a, dim=0), (R(4, 3),)),
        ('median', lambda L, a: (a.median(), a.median(1)), (R(3, 5),)),
        ('unique', lambda L, a: L.unique(a, return_counts=True), (I(4, 10),)),
        ('unique inverse', lambda L, a: L.unique(a, return_inverse=True), (I(4, 10),)),
        ('bincount', lambda L, a: L.bincount(a, minlength=6), (I(5, 10),)),
        ('mean of int raises', None, None),
    ]:
        if fn is None:
            behaviour(name, lambda L: _raises(lambda: L.tensor([1, 2]).mean(), (RuntimeError, NotImplementedError)),
                      True)
            continue
        check(name, fn, *spec)


def shape_ops():
    print('shape ops / indexing')
    for name, fn, spec in [
        ('view', lambda L, a: a.view(4, 3), (R(3, 4),)),
        ('view -1', lambda L, a: a.view(-1, 2), (R(3, 4),)),
        ('reshape', lambda L, a: L.reshape(a, (2, 6)), (R(3, 4),)),
        ('flatten', lambda L, a: (a.flatten(), a.flatten(1), L.flatten(a, 0, 1)), (R(2, 3, 4),)),
        ('unflatten', lambda L, a: a.unflatten(1, (3, 4)), (R(2, 12),)),
        ('squeeze', lambda L, a: (a.squeeze(), a.squeeze(1), a.squeeze(0)), (R(3, 1, 4),)),
        ('unsqueeze', lambda L, a: (a.unsqueeze(0), a.unsqueeze(-1), L.unsqueeze(a, 1)), (R(3, 4),)),
        ('permute', lambda L, a: a.permute(2, 0, 1), (R(2, 3, 4),)),
        ('transpose', lambda L, a: (a.transpose(0, 2), L.transpose(a, -1, -2)), (R(2, 3, 4),)),
        ('t', lambda L, a: a.t(), (R(3, 4),)),
        ('expand', lambda L, a: a.expand(3, 4), (R(1, 4),)),
        ('expand -1 new dims', lambda L, a: a.expand(2, -1, 4), (R(3, 1),)),
        ('expand_as', lambda L, a, b: a.expand_as(b), (R(3, 1), R(3, 5))),
        ('repeat', lambda L, a: a.repeat(2, 3), (R(2, 3),)),
        ('repeat more dims', lambda L, a: a.repeat(2, 1, 2), (R(2, 3),)),
        ('repeat_interleave', lambda L, a: (a.repeat_interleave(2, dim=0), L.repeat_interleave(a, 3)), (R(2, 3),)),
        ('cat', lambda L, a, b: (L.cat([a, b], 0), L.cat((a, a), dim=1)), (R(2, 3), R(4, 3))),
        ('stack', lambda L, a, b: (L.stack([a, b]), L.stack([a, b], dim=-1)), (R(2, 3), R(2, 3))),
        ('chunk', lambda L, a: a.chunk(3, dim=1), (R(2, 7),)),
        ('split int', lambda L, a: L.split(a, 2, dim=0), (R(5, 2),)),
        ('split sizes', lambda L, a: a.split([1, 3, 1]), (R(5, 2),)),
        ('unbind', lambda L, a: L.unbind(a, 1), (R(2, 3),)),
        ('narrow', lambda L, a: a.narrow(1, 1, 2), (R(3, 4),)),
        ('index basic', lambda L, a: (a[0], a[:, 1], a[1:, ::2], a[..., -1], a[None, 0]), (R(3, 4),)),
        ('index advanced', lambda L, a: (a[[0, 2]], a[[0, 1], [1, 3]], a[L.tensor([2, 0, 2])]), (R(3, 4),)),
        ('index bool mask', lambda L, a, m: a[m], (R(3, 4), B(3, 4))),
        ('index row mask', lambda L, a: a[a[:, 0] > 0], (R(5, 3),)),
        ('index mixed', lambda L, a: a[1:, [0, 2]], (R(3, 4),)),
        ('gather', lambda L, a, i: L.gather(a, 1, i), (R(3, 4), I(4, 3, 2))),
        ('gather dim0', lambda L, a, i: a.gather(0, i), (R(3, 4), I(3, 2, 4))),
        ('scatter', lambda L, a, i, s: a.scatter(1, i, s), (R(3, 4), C([[0, 1], [2, 3], [1, 0]]), R(3, 2))),
        ('scatter_add', lambda L, a, i, s: a.scatter_add(0, i, s), (R(3, 4), I(3, 2, 4), R(2, 4))),
        ('index_select', lambda L, a: (L.index_select(a, 0, L.tensor([2, 0, 2])), a.index_select(1, L.tensor([1]))),
         (R(3, 4),)),
        ('masked_fill', lambda L, a, m: a.masked_fill(m, -1.0), (R(3, 4), B(3, 4))),
        ('masked_fill broadcast', lambda L, a, m: L.masked_fill(a, m, float('-inf')).softmax(-1), (R(3, 4), C([[False, False, True, True]]))),
        ('masked_select', lambda L, a, m: L.masked_select(a, m), (R(3, 4), B(3, 4))),
        ('tril triu', lambda L, a: (L.tril(a), a.triu(1), L.tril(a, -1)), (R(4, 4),)),
        ('flip', lambda L, a: (L.flip(a, [0]), a.flip((0, 1))), (R(3, 4),)),
        ('roll', lambda L, a: (L.roll(a, 1, 0), a.roll((1, -1), (0, 1)), L.roll(a, 2)), (R(3, 4),)),
        ('movedim', lambda L, a: L.movedim(a, 0, -1), (R(2, 3, 4),)),
        ('diag', lambda L, a, v: (L.diag(a), L.diag(v), L.diag(a, 1)), (R(3, 3), R(3))),
        ('diagonal', lambda L, a: L.diagonal(a, 0, 1, 2), (R(2, 3, 3),)),
        ('trace', lambda L, a: L.trace(a), (R(3, 3),)),
        ('nonzero', lambda L, a: (L.nonzero(a), a.nonzero(as_tuple=True)), (I(2, 3, 4),)),
        ('where 1-arg', lambda L, a: L.where(a), (B(3, 4),)),
        ('unfold', lambda L, a: a.unfold(1, 3, 2), (R(2, 7),)),
        ('meshgrid', lambda L, a, b: L.meshgrid(a, b, indexing='ij'), (R(3), R(2))),
        ('meshgrid xy', lambda L, a, b: L.meshgrid(a, b, indexing='xy'), (R(3), R(2))),
        ('contiguous clone', lambda L, a: (a.t().contiguous(), a.clone()), (R(3, 4),)),
        ('view_as reshape_as', lambda L, a, b: (a.view_as(b), a.reshape_as(b)), (R(3, 4), R(6, 2))),
        ('broadcast_to', lambda L, a: L.broadcast_to(a, (2, 3, 4)), (R(3, 1),)),
        ('take_along_dim', lambda L, a, i: L.take_along_dim(a, i, dim=1), (R(3, 4), I(4, 3, 1))),
        ('dot through iteration', lambda L, a: L.stack([r.sum() for r in a]), (R(3, 4),)),
    ]:
        check(name, fn, *spec)
    print('setitem / in-place')
    for name, fn, spec in [
        ('setitem mask zero', lambda L, a, m: _setitem(L, a, m), (R(3, 4), B(3, 4))),
        ('setitem slice from tensor', lambda L, a, b: _setitem2(L, a, b), (R(3, 4), R(4))),
        ('inplace add_ on non-leaf', lambda L, a, b: _iadd(L, a, b), (R(3, 4), R(3, 4))),
        ('inplace mul_ / clamp_', lambda L, a: _imul(L, a), (R(3, 4),)),
        ('+= accumulate', lambda L, a: _acc(L, a), (R(3),)),
        ('setitem then reuse old', lambda L, a: _old(L, a), (R(4),)),
    ]:
        check(name, fn, *spec)
    behaviour('leaf in-place errors', lambda L: L.ones(2, requires_grad=True).add_(1), ('error', 'RuntimeError'))
    behaviour('in-place under no_grad', lambda L: _ng_inplace(L), [0.9, 0.9])
    behaviour('zero_ fill_ copy_', lambda L: (L.ones(2).zero_().tolist(), L.zeros(2).fill_(3).tolist(),
                                            L.zeros(2).copy_(L.tensor([1.0, 2.0])).tolist()),
              ([0.0, 0.0], [3.0, 3.0], [1.0, 2.0]))
    behaviour('int += float errors', lambda L: _int_iadd(L), ('error', 'RuntimeError'))
    behaviour('detach shares storage', lambda L: _detach_share(L), 5.0)
    behaviour('view shares storage under no_grad', lambda L: _view_share(L), 7.0)


def _setitem(L, a, m):
    b = a * 2
    b[m] = 0
    return b


def _setitem2(L, a, b):
    c = a.clone()
    c[1] = b * 3
    c[:, 0] = 1.0
    return c * a


def _iadd(L, a, b):
    c = a * 1
    c.add_(b)
    c.mul_(b)
    return c


def _imul(L, a):
    c = a * 1.5
    c.mul_(2).clamp_(max=3.0)
    return c


def _acc(L, a):
    total = L.zeros(3)
    for k in range(3):
        total += a * (k + 1)
    return total


def _old(L, a):
    b = a * 2
    c = b * 3          # uses b before the in-place change
    b[0] = 10.0
    return c + b


def _ng_inplace(L):
    w = L.ones(2, requires_grad=True)
    with L.no_grad():
        w -= 0.1 * L.ones(2)
    return [round(v, 4) for v in w.tolist()]


def _int_iadd(L):
    x = L.tensor([1, 2])
    x += 0.5
    return x


def _detach_share(L):
    a = L.zeros(2)
    a.detach()[0] = 5.0
    return a[0].item()


def _view_share(L):
    a = L.zeros(2, 3)
    v = a.view(6)
    v[0] = 7.0
    return a[0, 0].item()


def linalg_ops():
    print('linear algebra / einsum')
    for name, fn, spec in [
        ('matmul 2d', lambda L, a, b: a @ b, (R(3, 4), R(4, 2))),
        ('matmul batched broadcast', lambda L, a, b: L.matmul(a, b), (R(2, 3, 4), R(4, 5))),
        ('matmul batch bcast both', lambda L, a, b: a @ b, (R(2, 1, 3, 4), R(3, 4, 2))),
        ('matmul vec', lambda L, a, v: (a @ v, v @ a.t()), (R(3, 4), R(4))),
        ('matmul 1d 1d', lambda L, a, b: a @ b, (R(4), R(4))),
        ('mm bmm mv dot', lambda L, a, b, c, v: (L.mm(a, b), L.bmm(c, c.transpose(1, 2)), L.mv(a, v), L.dot(v, v)),
         (R(3, 4), R(4, 2), R(2, 3, 4), R(4))),
        ('outer', lambda L, a, b: L.outer(a, b), (R(3), R(4))),
        ('einsum matmul', lambda L, a, b: L.einsum('ij,jk->ik', a, b), (R(3, 4), R(4, 2))),
        ('einsum batch', lambda L, a, b: L.einsum('bij,bjk->bik', a, b), (R(2, 3, 4), R(2, 4, 5))),
        ('einsum trace', lambda L, a: L.einsum('ii->', a), (R(3, 3),)),
        ('einsum diag', lambda L, a: L.einsum('ii->i', a), (R(3, 3),)),
        ('einsum sum', lambda L, a: L.einsum('ij->', a), (R(3, 3),)),
        ('einsum transpose', lambda L, a: L.einsum('ij->ji', a), (R(3, 4),)),
        ('einsum implicit', lambda L, a, b: L.einsum('ij,jk', a, b), (R(3, 4), R(4, 2))),
        ('einsum outer', lambda L, a, b: L.einsum('i,j->ij', a, b), (R(3), R(4))),
        ('einsum ellipsis', lambda L, a, b: L.einsum('...ij,...jk->...ik', a, b), (R(2, 3, 4), R(2, 4, 5))),
        ('einsum attention', lambda L, q, k: L.einsum('bhqd,bhkd->bhqk', q, k), (R(2, 2, 3, 4), R(2, 2, 5, 4))),
        ('einsum 3 operands', lambda L, a, b, c: L.einsum('ij,jk,kl->il', a, b, c), (R(2, 3), R(3, 4), R(4, 2))),
        ('einsum list operands', lambda L, a, b: L.einsum('i,i->', [a, b]), (R(4), R(4))),
        ('einsum unique letter', lambda L, a, b: L.einsum('ij,k->i', a, b), (R(2, 3), R(4))),
        ('tensordot', lambda L, a, b: L.tensordot(a, b, dims=([1], [0])), (R(3, 4), R(4, 2))),
        ('linalg.norm', lambda L, a: (L.linalg.norm(a), L.linalg.norm(a, dim=1), L.linalg.vector_norm(a, ord=1)),
         (R(3, 4),)),
        ('linalg.inv', lambda L, a: L.linalg.inv(a + 3 * L.eye(3)), (R(3, 3),)),
        ('linalg.det', lambda L, a: L.linalg.det(a + 2 * L.eye(3)), (R(3, 3),)),
        ('linalg.solve', lambda L, a, b: L.linalg.solve(a + 3 * L.eye(3), b), (R(3, 3), R(3, 2))),
        ('linalg.svdvals', lambda L, a: L.linalg.svdvals(a), (R(4, 3),)),
        ('linalg.eigh values', lambda L, a: L.linalg.eigh(a + a.t())[0], (R(3, 3),)),
        ('cdist', lambda L, a, b: L.cdist(a, b), (R(3, 4), R(5, 4))),
        ('cross', lambda L, a, b: L.cross(a, b, dim=1), (R(2, 3), R(2, 3))),
    ]:
        check(name, fn, *spec)
    behaviour('linalg.svd reconstruct', lambda L: _svd(L), True)
    behaviour('linalg.eigh reconstruct', lambda L: _eigh(L), True)
    behaviour('linalg.qr reconstruct', lambda L: _qr(L), True)


def _svd(L):
    a = L.tensor(_rng('svd').randn(4, 3).astype(np.float32))
    U, Sv, Vh = L.linalg.svd(a, full_matrices=False)
    return bool(L.allclose(U @ L.diag(Sv) @ Vh, a, atol=1e-5))


def _eigh(L):
    a = L.tensor(_rng('eigh').randn(3, 3).astype(np.float32))
    a = a + a.T
    w, V = L.linalg.eigh(a)
    return bool(L.allclose(V @ L.diag(w) @ V.T, a, atol=1e-4))


def _qr(L):
    a = L.tensor(_rng('qr').randn(4, 3).astype(np.float32))
    Q, Rm = L.linalg.qr(a)
    return bool(L.allclose(Q @ Rm, a, atol=1e-5))


def autograd_features():
    print('autograd features')
    behaviour('grad accumulates', lambda L: _accum(L), [3.0, 3.0])
    behaviour('retain_grad', lambda L: _retain(L), [2.0, 2.0])
    behaviour('backward non-scalar needs gradient', lambda L: (L.ones(2, requires_grad=True) * 2).backward(),
              ('error', 'RuntimeError'))
    behaviour('backward with gradient arg', lambda L: _bwd_grad(L), [2.0, 4.0])
    behaviour('backward on no-grad tensor errors', lambda L: L.ones(1).sum().backward(), ('error', 'RuntimeError'))
    behaviour('autograd.grad', lambda L: _ag_grad(L), [[4.0, 6.0], None])
    behaviour('autograd.grad unused raises', lambda L: _ag_unused(L), ('error', 'RuntimeError'))
    behaviour('detach stops grad', lambda L: _detach_stop(L), [1.0])
    behaviour('register_hook', lambda L: _hook(L), [20.0])
    behaviour('custom Function', lambda L: _custom_fn(L), [6.0, 6.0])
    behaviour('shared subexpression', lambda L: _shared(L), [14.0])
    behaviour('grad of broadcast leaf', lambda L: _bcast_leaf(L), (1, 3))
    behaviour('requires_grad_ propagates', lambda L: (L.ones(2).requires_grad_() * 3).requires_grad, True)
    behaviour('zero_grad via grad=None', lambda L: _zero_grad(L), None)
    behaviour('0-d leaf grad survives repeated backward + zero_ (regression)', lambda L: _scalar_leaf_loop(L),
              ((0.7916,), True))
    behaviour('grad_fn name', lambda L: type(L.ones(1, requires_grad=True).mul(2).grad_fn).__name__ != '', True)


def _accum(L):
    x = L.ones(2, requires_grad=True)
    (x * 1).sum().backward()
    (x * 2).sum().backward()
    return x.grad.tolist()


def _retain(L):
    x = L.ones(2, requires_grad=True)
    y = x * 3
    y.retain_grad()
    (y * 2).sum().backward()
    return y.grad.tolist()


def _bwd_grad(L):
    x = L.ones(2, requires_grad=True)
    (x * 2).backward(L.tensor([1.0, 2.0]))
    return x.grad.tolist()


def _ag_grad(L):
    x = L.tensor([2.0, 3.0], requires_grad=True)
    z = L.tensor([1.0], requires_grad=True)
    g = L.autograd.grad((x * x).sum(), [x, z], allow_unused=True)
    return [g[0].tolist(), g[1]]


def _ag_unused(L):
    x = L.tensor([2.0], requires_grad=True)
    z = L.tensor([1.0], requires_grad=True)
    return L.autograd.grad((x * 2).sum(), [x, z])


def _detach_stop(L):
    x = L.tensor([3.0], requires_grad=True)
    (x * x.detach()).sum().backward()
    return [x.grad.item() / 3.0]


def _hook(L):
    x = L.tensor([1.0], requires_grad=True)
    x.register_hook(lambda g: g * 10)
    (x * 2).sum().backward()
    return x.grad.tolist()


def _custom_fn(L):
    class Cube(L.autograd.Function):
        @staticmethod
        def forward(ctx, x):
            ctx.save_for_backward(x)
            return x ** 3

        @staticmethod
        def backward(ctx, g):
            (x,) = ctx.saved_tensors
            return 3 * x ** 2 * g
    x = L.tensor([1.0, 1.0], requires_grad=True)
    (Cube.apply(x) * 2).sum().backward()
    return x.grad.tolist()


def _shared(L):
    x = L.tensor([2.0], requires_grad=True)
    y = x * x
    z = y * 3 + y      # dz/dx = 4 * 2x = 16? -> (3+1)*2x = 16
    w = z - x * 2      # 16 - 2 = 14
    w.sum().backward()
    return x.grad.tolist()


def _bcast_leaf(L):
    b = L.zeros(1, 3, requires_grad=True)
    (L.ones(4, 3) + b).sum().backward()
    return tuple(b.grad.shape)


def _scalar_leaf_loop(L):
    # Regression: accumulating into a 0-d leaf's .grad produced a NumPy scalar, so b.grad.zero_() failed.
    w = L.tensor([1.0, 2.0], requires_grad=True)
    b = L.tensor(0.0, requires_grad=True)
    x = L.tensor([[1.0, 2.0], [3.0, 4.0]])
    y = L.tensor([1.0, 0.0])
    for _ in range(3):
        loss = ((x @ w + b - y) ** 2).mean()
        loss.backward(retain_graph=True)
        loss.backward()  # second backward accumulates into the existing 0-d grad
        with L.no_grad():
            w -= 0.001 * w.grad
            b -= 0.001 * b.grad
        w.grad.zero_()
        b.grad.zero_()
    return [round(float(w[0].detach()), 4)], float(b.grad) == 0.0


def _zero_grad(L):
    x = L.ones(1, requires_grad=True)
    (x * 2).sum().backward()
    x.grad = None
    return x.grad


def functional_ops():
    print('nn.functional')
    for name, fn, spec in [
        ('F.relu', lambda L, a: L.nn.functional.relu(a), (R(6),)),
        ('F.leaky_relu', lambda L, a: L.nn.functional.leaky_relu(a, 0.2), (R(6),)),
        ('F.gelu', lambda L, a: L.nn.functional.gelu(a), (R(6),)),
        ('F.gelu tanh', lambda L, a: L.nn.functional.gelu(a, approximate='tanh'), (R(6),)),
        ('F.silu', lambda L, a: L.nn.functional.silu(a), (R(6),)),
        ('F.elu selu', lambda L, a: (L.nn.functional.elu(a), L.nn.functional.selu(a)), (R(6),)),
        ('F.softplus', lambda L, a: L.nn.functional.softplus(a * 3), (R(6),)),
        ('F.mish hardswish', lambda L, a: (L.nn.functional.mish(a), L.nn.functional.hardswish(a * 3)), (R(6),)),
        ('F.logsigmoid', lambda L, a: L.nn.functional.logsigmoid(a), (R(6),)),
        ('F.sigmoid tanh', lambda L, a: (L.nn.functional.sigmoid(a), L.nn.functional.tanh(a)), (R(6),)),
        ('F.softmax', lambda L, a: L.nn.functional.softmax(a, dim=-1), (R(2, 5),)),
        ('F.log_softmax', lambda L, a: L.nn.functional.log_softmax(a, dim=1), (R(2, 5),)),
        ('F.glu', lambda L, a: L.nn.functional.glu(a, -1), (R(2, 6),)),
        ('F.linear', lambda L, x, w, b: L.nn.functional.linear(x, w, b), (R(3, 4), R(5, 4), R(5))),
        ('F.linear no bias', lambda L, x, w: L.nn.functional.linear(x, w), (R(2, 3, 4), R(5, 4))),
        ('F.mse_loss', lambda L, a, b: (L.nn.functional.mse_loss(a, b), L.nn.functional.mse_loss(a, b, reduction='sum'),
                                        L.nn.functional.mse_loss(a, b, reduction='none')), (R(3, 4), R(3, 4))),
        ('F.l1_loss', lambda L, a, b: L.nn.functional.l1_loss(a, b), (R(3, 4), R(3, 4))),
        ('F.smooth_l1 huber', lambda L, a, b: (L.nn.functional.smooth_l1_loss(a, b, beta=0.5),
                                               L.nn.functional.huber_loss(a, b, delta=0.7)), (R(3, 4), R(3, 4))),
        ('F.cross_entropy', lambda L, x, t: L.nn.functional.cross_entropy(x, t), (R(4, 5), I(5, 4))),
        ('F.cross_entropy sum/none', lambda L, x, t: (L.nn.functional.cross_entropy(x, t, reduction='sum'),
                                                      L.nn.functional.cross_entropy(x, t, reduction='none')),
         (R(4, 5), I(5, 4))),
        ('F.cross_entropy weight', lambda L, x, t, w: L.nn.functional.cross_entropy(x, t, weight=w),
         (R(4, 5), I(5, 4), C(np.array([1.0, 2.0, 0.5, 1.0, 3.0], dtype=np.float32)))),
        ('F.cross_entropy ignore_index', lambda L, x: L.nn.functional.cross_entropy(x, L.tensor([1, -100, 3, 0])),
         (R(4, 5),)),
        ('F.cross_entropy label_smoothing', lambda L, x, t: L.nn.functional.cross_entropy(x, t, label_smoothing=0.1),
         (R(4, 5), I(5, 4))),
        ('F.cross_entropy smoothing+weight', lambda L, x, t, w: L.nn.functional.cross_entropy(
            x, t, weight=w, label_smoothing=0.2),
         (R(4, 5), I(5, 4), C(np.array([1.0, 2.0, 0.5, 1.0, 3.0], dtype=np.float32)))),
        ('F.cross_entropy probs target', lambda L, x, p: L.nn.functional.cross_entropy(x, p.softmax(-1)),
         (R(4, 5), C(np.random.RandomState(1).randn(4, 5).astype(np.float32)))),
        ('F.cross_entropy spatial', lambda L, x, t: L.nn.functional.cross_entropy(x, t), (R(2, 3, 4), I(3, 2, 4))),
        ('F.cross_entropy 1d', lambda L, x: L.nn.functional.cross_entropy(x, L.tensor(2)), (R(5),)),
        ('F.nll_loss', lambda L, x, t: L.nn.functional.nll_loss(L.log_softmax(x, 1), t), (R(4, 5), I(5, 4))),
        ('F.binary_cross_entropy', lambda L, p, t: L.nn.functional.binary_cross_entropy(p, t),
         (U(6), C(np.array([0, 1, 1, 0, 1, 0], dtype=np.float32)))),
        ('F.bce weight', lambda L, p, t: L.nn.functional.binary_cross_entropy(p, t, weight=L.tensor([1., 2, 1, 2, 1, 2])),
         (U(6), C(np.array([0, 1, 1, 0, 1, 0], dtype=np.float32)))),
        ('F.bce_with_logits', lambda L, x, t: L.nn.functional.binary_cross_entropy_with_logits(x, t),
         (R(6), C(np.array([0, 1, 1, 0, 1, 0], dtype=np.float32)))),
        ('F.bce_with_logits pos_weight', lambda L, x, t: L.nn.functional.binary_cross_entropy_with_logits(
            x, t, pos_weight=L.tensor([2.0, 0.5, 1.0])), (R(2, 3), C(np.array([[0, 1, 1], [1, 0, 1]], dtype=np.float32)))),
        ('F.kl_div', lambda L, a, b: (L.nn.functional.kl_div(a.log_softmax(-1), b.softmax(-1), reduction='batchmean'),
                                      L.nn.functional.kl_div(a.log_softmax(-1), b.log_softmax(-1), reduction='sum',
                                                             log_target=True)), (R(3, 4), R(3, 4))),
        ('F.cosine_similarity', lambda L, a, b: L.nn.functional.cosine_similarity(a, b, dim=1), (R(3, 4), R(3, 4))),
        ('F.cosine_similarity bcast', lambda L, a, b: L.nn.functional.cosine_similarity(a, b, dim=-1), (R(3, 4), R(4))),
        ('F.normalize', lambda L, a: L.nn.functional.normalize(a, dim=1), (R(3, 4),)),
        ('F.pairwise_distance', lambda L, a, b: L.nn.functional.pairwise_distance(a, b), (R(3, 4), R(3, 4))),
        ('F.one_hot', lambda L, t: L.nn.functional.one_hot(t, 5), (I(5, 6),)),
        ('F.one_hot inferred', lambda L, t: L.nn.functional.one_hot(t), (C(np.array([0, 2, 1])),)),
        ('F.embedding', lambda L, w: L.nn.functional.embedding(L.tensor([[0, 2], [2, 1]]), w), (R(4, 3),)),
        ('F.embedding padding_idx', lambda L, w: L.nn.functional.embedding(L.tensor([0, 2, 0]), w, padding_idx=0),
         (R(4, 3), 'nofd')),
        ('F.pad constant', lambda L, a: (L.nn.functional.pad(a, (1, 2)), L.nn.functional.pad(a, (1, 1, 2, 0), value=3.0)),
         (R(2, 3, 4),)),
        ('F.pad negative', lambda L, a: L.nn.functional.pad(a, (-1, 1)), (R(2, 4),)),
        ('F.pad reflect replicate 1d', lambda L, a: (L.nn.functional.pad(a, (2, 1), mode='reflect'),
                                                     L.nn.functional.pad(a, (1, 2), mode='replicate'),
                                                     L.nn.functional.pad(a, (1, 2), mode='circular')),
         (R(1, 2, 5),)),
        ('F.pad reflect replicate 2d', lambda L, a: (L.nn.functional.pad(a, (2, 1, 1, 2), mode='reflect'),
                                                     L.nn.functional.pad(a, (1, 2, 0, 1), mode='replicate'),
                                                     L.nn.functional.pad(a, (1, 1, 1, 1), mode='circular')),
         (R(1, 2, 4, 5),)),
        ('F.conv2d', lambda L, x, w, b: L.nn.functional.conv2d(x, w, b), (R(2, 3, 6, 5), R(4, 3, 3, 3), R(4))),
        ('F.conv2d stride pad', lambda L, x, w: L.nn.functional.conv2d(x, w, stride=2, padding=1), (R(2, 3, 7, 6), R(4, 3, 3, 3))),
        ('F.conv2d dilation', lambda L, x, w: L.nn.functional.conv2d(x, w, dilation=2, padding=(1, 2)),
         (R(1, 2, 7, 7), R(3, 2, 3, 2))),
        ('F.conv2d groups', lambda L, x, w: L.nn.functional.conv2d(x, w, groups=2), (R(2, 4, 5, 5), R(6, 2, 3, 3))),
        ('F.conv2d same', lambda L, x, w: L.nn.functional.conv2d(x, w, padding='same'), (R(1, 2, 5, 6), R(3, 2, 4, 3))),
        ('F.conv2d unbatched', lambda L, x, w: L.nn.functional.conv2d(x, w), (R(2, 5, 5), R(3, 2, 3, 3))),
        ('F.conv1d', lambda L, x, w, b: L.nn.functional.conv1d(x, w, b, stride=2, padding=1), (R(2, 3, 9), R(4, 3, 3), R(4))),
        ('F.conv_transpose2d', lambda L, x, w, b: L.nn.functional.conv_transpose2d(x, w, b, stride=2, padding=1,
                                                                                   output_padding=1),
         (R(2, 3, 4, 4), R(3, 2, 3, 3), R(2))),
        ('F.conv_transpose2d groups', lambda L, x, w: L.nn.functional.conv_transpose2d(x, w, groups=2, stride=2),
         (R(1, 4, 3, 3), R(4, 3, 2, 2))),
        ('F.conv_transpose1d', lambda L, x, w: L.nn.functional.conv_transpose1d(x, w, stride=3),
         (R(2, 3, 4), R(3, 2, 3))),
        ('F.max_pool2d', lambda L, x: L.nn.functional.max_pool2d(x, 2), (R(2, 3, 6, 6),)),
        ('F.max_pool2d stride pad', lambda L, x: L.nn.functional.max_pool2d(x, 3, stride=2, padding=1), (R(1, 2, 7, 6),)),
        ('F.max_pool2d ceil', lambda L, x: L.nn.functional.max_pool2d(x, 2, ceil_mode=True), (R(1, 2, 5, 5),)),
        ('F.max_pool2d indices', lambda L, x: L.nn.functional.max_pool2d(x, 2, return_indices=True), (R(1, 2, 4, 6),)),
        ('F.avg_pool2d', lambda L, x: L.nn.functional.avg_pool2d(x, 2), (R(2, 3, 6, 6),)),
        ('F.avg_pool2d pad', lambda L, x: (L.nn.functional.avg_pool2d(x, 3, stride=2, padding=1),
                                           L.nn.functional.avg_pool2d(x, 3, 2, 1, count_include_pad=False)),
         (R(1, 2, 7, 6),)),
        ('F.max_pool1d avg_pool1d', lambda L, x: (L.nn.functional.max_pool1d(x, 2), L.nn.functional.avg_pool1d(x, 3, 2)),
         (R(2, 3, 8),)),
        ('F.adaptive_avg_pool2d', lambda L, x: (L.nn.functional.adaptive_avg_pool2d(x, 1),
                                                L.nn.functional.adaptive_avg_pool2d(x, (3, 2))), (R(2, 3, 6, 5),)),
        ('F.adaptive_max_pool2d', lambda L, x: L.nn.functional.adaptive_max_pool2d(x, (2, 2)), (R(1, 2, 4, 6),)),
        ('F.unfold', lambda L, x: L.nn.functional.unfold(x, 3, padding=1, stride=2), (R(2, 3, 5, 6),)),
        ('F.fold', lambda L, x: L.nn.functional.fold(x, (4, 5), 2), (R(2, 12, 12),)),
        ('F.layer_norm', lambda L, x, w, b: L.nn.functional.layer_norm(x, (4,), w, b), (R(3, 4), R(4), R(4))),
        ('F.layer_norm 2d shape', lambda L, x: L.nn.functional.layer_norm(x, (3, 4)), (R(2, 3, 4),)),
        ('F.batch_norm train', lambda L, x, w, b: L.nn.functional.batch_norm(x, None, None, w, b, training=True),
         (R(5, 3), R(3), R(3))),
        ('F.batch_norm eval', lambda L, x, m, v: L.nn.functional.batch_norm(x, m, v, training=False),
         (R(4, 3, 2, 2), C(np.array([0.1, -0.2, 0.3], np.float32)), C(np.array([1.5, 0.5, 2.0], np.float32)))),
        ('F.group_norm', lambda L, x, w, b: L.nn.functional.group_norm(x, 2, w, b), (R(2, 4, 3, 3), R(4), R(4))),
        ('F.instance_norm', lambda L, x: L.nn.functional.instance_norm(x), (R(2, 3, 4, 4),)),
        ('F.sdpa', lambda L, q, k, v: L.nn.functional.scaled_dot_product_attention(q, k, v), (R(2, 3, 4), R(2, 5, 4), R(2, 5, 6))),
        ('F.sdpa causal', lambda L, q, k, v: L.nn.functional.scaled_dot_product_attention(q, k, v, is_causal=True),
         (R(2, 2, 4, 3), R(2, 2, 4, 3), R(2, 2, 4, 3))),
        ('F.sdpa bool mask', lambda L, q, k, v, m: L.nn.functional.scaled_dot_product_attention(q, k, v, attn_mask=m),
         (R(1, 3, 4), R(1, 3, 4), R(1, 3, 4), C(np.array([[True, False, True], [True, True, False], [False, True, True]])))),
        ('F.sdpa float mask scale', lambda L, q, k, v, m: L.nn.functional.scaled_dot_product_attention(
            q, k, v, attn_mask=m, scale=0.3), (R(1, 3, 4), R(1, 3, 4), R(1, 3, 4), R(3, 3))),
        ('F.interpolate nearest', lambda L, x: L.nn.functional.interpolate(x, scale_factor=2), (R(1, 2, 3, 3),)),
        ('F.interpolate bilinear', lambda L, x: (L.nn.functional.interpolate(x, size=(5, 4), mode='bilinear'),
                                                 L.nn.functional.interpolate(x, size=(5, 4), mode='bilinear',
                                                                             align_corners=True)), (R(1, 2, 3, 3),)),
        ('F.pixel_shuffle', lambda L, x: L.nn.functional.pixel_shuffle(x, 2), (R(1, 8, 2, 3),)),
    ]:
        nofd = spec[-1] == 'nofd' if spec and isinstance(spec[-1], str) else False
        if nofd:
            spec = spec[:-1]
        check(name, fn, *spec, atol=3e-5, fd=not nofd)
    behaviour('F.dropout eval identity', lambda L: L.nn.functional.dropout(L.ones(4), 0.5, training=False).tolist(),
              [1.0] * 4)
    behaviour('F.dropout scales', lambda L: sorted(set(L.nn.functional.dropout(L.ones(200), 0.5).tolist())),
              [0.0, 2.0])
    behaviour('F.cross_entropy float target shape error',
              lambda L: L.nn.functional.cross_entropy(L.randn(3, 4), L.tensor([1.0, 2.0, 0.0])),
              ('error', 'RuntimeError'))
    behaviour('F.bce shape mismatch', lambda L: L.nn.functional.binary_cross_entropy(L.rand(3, 1), L.rand(3)),
              ('error', 'ValueError'))
    behaviour('F.cross_entropy target out of range',
              lambda L: L.nn.functional.cross_entropy(L.randn(2, 3), L.tensor([0, 5])), ('error', 'IndexError'))


def modules():
    print('nn modules')
    nn_cases = [
        ('nn.Linear', lambda L: L.nn.Linear(4, 3), (R(5, 4),), True),
        ('nn.Linear no bias 3d', lambda L: L.nn.Linear(4, 3, bias=False), (R(2, 5, 4),), True),
        ('nn.Bilinear', lambda L: L.nn.Bilinear(3, 4, 2), (R(5, 3), R(5, 4)), True),
        ('nn.Sequential MLP', lambda L: L.nn.Sequential(L.nn.Linear(4, 8), L.nn.ReLU(), L.nn.Linear(8, 2)),
         (R(5, 4),), True),
        ('nn.Embedding', lambda L: L.nn.Embedding(6, 3), (I(6, 2, 4),), True),
        ('nn.Conv2d', lambda L: L.nn.Conv2d(3, 4, 3, padding=1), (R(2, 3, 5, 5),), True),
        ('nn.Conv2d stride groups', lambda L: L.nn.Conv2d(4, 6, (3, 2), stride=2, groups=2), (R(2, 4, 7, 6),), True),
        ('nn.Conv2d reflect', lambda L: L.nn.Conv2d(2, 3, 3, padding=1, padding_mode='reflect'), (R(1, 2, 5, 5),), True),
        ('nn.Conv1d', lambda L: L.nn.Conv1d(3, 2, 3, padding=1), (R(2, 3, 7),), True),
        ('nn.ConvTranspose2d', lambda L: L.nn.ConvTranspose2d(3, 2, 4, stride=2, padding=1), (R(1, 3, 3, 3),), True),
        ('nn.MaxPool2d', lambda L: L.nn.MaxPool2d(2, 2), (R(2, 3, 4, 4),), True),
        ('nn.AvgPool2d', lambda L: L.nn.AvgPool2d(2), (R(2, 3, 4, 4),), True),
        ('nn.AdaptiveAvgPool2d', lambda L: L.nn.AdaptiveAvgPool2d((1, 1)), (R(2, 3, 4, 4),), True),
        ('nn.Flatten', lambda L: L.nn.Flatten(), (R(2, 3, 4),), True),
        ('nn.Unflatten', lambda L: L.nn.Unflatten(1, (2, 3)), (R(4, 6),), True),
        ('nn.BatchNorm1d train', lambda L: L.nn.BatchNorm1d(3), (R(6, 3),), True),
        ('nn.BatchNorm1d eval', lambda L: L.nn.BatchNorm1d(3), (R(6, 3),), False),
        ('nn.BatchNorm2d train', lambda L: L.nn.BatchNorm2d(3), (R(2, 3, 4, 4),), True),
        ('nn.BatchNorm2d eval', lambda L: L.nn.BatchNorm2d(3), (R(2, 3, 4, 4),), False),
        ('nn.LayerNorm', lambda L: L.nn.LayerNorm(4), (R(3, 4),), True),
        ('nn.LayerNorm no affine', lambda L: L.nn.LayerNorm([2, 4], elementwise_affine=False), (R(3, 2, 4),), True),
        ('nn.GroupNorm', lambda L: L.nn.GroupNorm(2, 4), (R(2, 4, 3, 3),), True),
        ('nn.ReLU LeakyReLU', lambda L: L.nn.Sequential(L.nn.LeakyReLU(0.1), L.nn.ReLU()), (R(8),), True),
        ('nn.GELU SiLU', lambda L: L.nn.Sequential(L.nn.GELU(), L.nn.SiLU()), (R(8),), True),
        ('nn.Sigmoid Tanh', lambda L: L.nn.Sequential(L.nn.Sigmoid(), L.nn.Tanh()), (R(8),), True),
        ('nn.Softmax LogSoftmax', lambda L: L.nn.Sequential(L.nn.Softmax(dim=1), L.nn.LogSoftmax(dim=0)), (R(3, 4),), True),
        ('nn.ELU Softplus PReLU', lambda L: L.nn.Sequential(L.nn.ELU(), L.nn.Softplus(), L.nn.PReLU()), (R(8),), True),
        ('nn.Identity', lambda L: L.nn.Identity(), (R(3),), True),
        ('nn.Dropout eval', lambda L: L.nn.Dropout(0.5), (R(10),), False),
    ]
    for name, ctor, specs, train in nn_cases:
        call = (lambda L, m, *x: m(*x))
        check(name, call, *specs, module_ctor=ctor, train=train, atol=3e-5, gatol=3e-4)
    check('nn.Embedding padding', lambda L, m, i: m(i), C(np.array([[1, 2, 1, 0]])),
          module_ctor=lambda L: L.nn.Embedding(6, 3, padding_idx=1), fd=False)
    check('nn.MultiheadAttention batch_first', lambda L, m, x: m(x, x, x), R(2, 3, 8),
          module_ctor=lambda L: L.nn.MultiheadAttention(8, 2, batch_first=True), atol=3e-5, gatol=3e-4)
    check('nn.MultiheadAttention seq-first + masks',
          lambda L, m, q, k: m(q, k, k, key_padding_mask=L.tensor([[False, False, True, False], [False, True, False, False]]),
                               attn_mask=L.tensor([[False, True, False, False], [False, False, False, True], [False] * 4])),
          R(3, 2, 8), R(4, 2, 8), module_ctor=lambda L: L.nn.MultiheadAttention(8, 4), atol=3e-5, gatol=3e-4)
    check('nn.TransformerEncoderLayer', lambda L, m, x: m(x), R(2, 4, 8),
          module_ctor=lambda L: L.nn.TransformerEncoderLayer(8, 2, 16, dropout=0.0, batch_first=True),
          atol=5e-5, gatol=5e-4)
    loss_cases = [
        ('nn.MSELoss', lambda L: L.nn.MSELoss(), (R(3, 4), R(3, 4))),
        ('nn.L1Loss sum', lambda L: L.nn.L1Loss(reduction='sum'), (R(3, 4), R(3, 4))),
        ('nn.CrossEntropyLoss', lambda L: L.nn.CrossEntropyLoss(), (R(4, 5), I(5, 4))),
        ('nn.CrossEntropyLoss smoothing', lambda L: L.nn.CrossEntropyLoss(label_smoothing=0.1), (R(4, 5), I(5, 4))),
        ('nn.NLLLoss', lambda L: L.nn.NLLLoss(), (R(4, 5), I(5, 4))),
        ('nn.BCELoss', lambda L: L.nn.BCELoss(), (U(5), C(np.array([0, 1, 0, 1, 1], np.float32)))),
        ('nn.BCEWithLogitsLoss', lambda L: L.nn.BCEWithLogitsLoss(), (R(5), C(np.array([0, 1, 0, 1, 1], np.float32)))),
        ('nn.SmoothL1Loss', lambda L: L.nn.SmoothL1Loss(), (R(3, 4), R(3, 4))),
        ('nn.HuberLoss', lambda L: L.nn.HuberLoss(delta=0.5), (R(3, 4), R(3, 4))),
        ('nn.KLDivLoss', lambda L: L.nn.KLDivLoss(reduction='batchmean'), (R(3, 4), U(3, 4))),
    ]
    for name, ctor, specs in loss_cases:
        check(name, lambda L, m, *x: m(*x), *specs, module_ctor=ctor)

    behaviour('Module parameters / named_parameters', lambda L: _mod_params(L),
              (['scale', 'fc1.weight', 'fc1.bias', 'fc2.weight', 'fc2.bias'], 5))
    behaviour('Module register_buffer in state_dict', lambda L: _buffers(L), (['w', 'running', 'sub.weight'], ['running']))
    behaviour('state_dict round trip', lambda L: _sd_round(L), True)
    behaviour('load_state_dict strict error', lambda L: L.nn.Linear(2, 2).load_state_dict({'weight': L.zeros(2, 2)}),
              ('error', 'RuntimeError'))
    behaviour('train/eval flags', lambda L: _train_eval(L), (True, False, False, True))
    behaviour('ModuleList / ModuleDict', lambda L: _containers(L), (3, 10, ['a', 'b'], 2))
    behaviour('Sequential indexing', lambda L: _seq_index(L), ('Linear', 2, 'ReLU'))
    behaviour('zero_grad', lambda L: _mod_zero_grad(L), True)
    behaviour('children / modules count', lambda L: _children(L), (2, 4))
    behaviour('assign tensor to param errors', lambda L: _assign_param(L), ('error', 'TypeError'))
    behaviour('Linear init bound', lambda L: _linear_init(L), True)
    behaviour('BatchNorm running stats', lambda L: _bn_running(L), True)
    behaviour('Dropout train zeros', lambda L: _dropout_train(L), True)
    behaviour('Module repr', lambda L: repr(L.nn.Linear(2, 3)), 'Linear(in_features=2, out_features=3, bias=True)')
    behaviour('parameters shared dedupe', lambda L: _shared_params(L), 2)
    behaviour('apply init', lambda L: _apply_init(L), True)
    behaviour('module.double()', lambda L: str(L.nn.Linear(2, 2).double().weight.dtype), 'torch.float64')
    behaviour('MHA weights shape', lambda L: tuple(L.nn.MultiheadAttention(8, 2, batch_first=True)(
        L.randn(2, 3, 8), L.randn(2, 5, 8), L.randn(2, 5, 8))[1].shape), (2, 3, 5))


def _mod_params(L):
    class Net(L.nn.Module):
        def __init__(self):
            super().__init__()
            self.fc1 = L.nn.Linear(2, 3)
            self.fc2 = L.nn.Linear(3, 1)
            self.scale = L.nn.Parameter(L.ones(1))
            self.not_param = L.ones(2)

        def forward(self, x):
            return self.fc2(L.relu(self.fc1(x))) * self.scale
    n = Net()
    return [k for k, _ in n.named_parameters()], len(list(n.parameters()))


def _buffers(L):
    class M(L.nn.Module):
        def __init__(self):
            super().__init__()
            self.w = L.nn.Parameter(L.zeros(1))
            self.register_buffer('running', L.zeros(2))
            self.register_buffer('tmp', L.zeros(2), persistent=False)
            self.sub = L.nn.Linear(1, 1, bias=False)
    m = M()
    return list(m.state_dict().keys()), [k for k, _ in m.named_buffers()][:1]


def _sd_round(L):
    a = L.nn.Sequential(L.nn.Linear(3, 4), L.nn.BatchNorm1d(4))
    b = L.nn.Sequential(L.nn.Linear(3, 4), L.nn.BatchNorm1d(4))
    b.load_state_dict(a.state_dict())
    x = L.randn(5, 3)
    a.eval(), b.eval()
    return bool(L.allclose(a(x), b(x)))


def _train_eval(L):
    m = L.nn.Sequential(L.nn.Dropout(0.1))
    t1 = m[0].training
    m.eval()
    t2, t3 = m.training, m[0].training
    m.train()
    return t1, t2, t3, m[0].training


def _containers(L):
    ml = L.nn.ModuleList([L.nn.Linear(1, 1) for _ in range(3)])
    md = L.nn.ModuleDict({'a': L.nn.Linear(1, 1), 'b': L.nn.ReLU()})

    class M(L.nn.Module):
        def __init__(self):
            super().__init__()
            self.ml = ml
            self.md = md
    return len(ml), len(list(M().parameters())) + 2, list(md.keys()), len(list(md.values()))


def _seq_index(L):
    s = L.nn.Sequential(L.nn.Linear(2, 2), L.nn.ReLU(), L.nn.Linear(2, 2))
    return type(s[0]).__name__, len(s[:2]), type(s[-2]).__name__


def _mod_zero_grad(L):
    m = L.nn.Linear(2, 1)
    m(L.ones(1, 2)).sum().backward()
    had = m.weight.grad is not None
    m.zero_grad()
    return had and (m.weight.grad is None or float(m.weight.grad.abs().sum()) == 0.0)


def _children(L):
    m = L.nn.Sequential(L.nn.Linear(2, 2), L.nn.Sequential(L.nn.ReLU(), L.nn.Linear(2, 1)))
    return len(list(m.children())), len(list(m.modules())) - 1


def _assign_param(L):
    m = L.nn.Linear(2, 2)
    m.weight = L.zeros(2, 2)


def _linear_init(L):
    m = L.nn.Linear(100, 50)
    b = 1 / math.sqrt(100)
    return bool(m.weight.abs().max() <= b) and bool(m.bias.abs().max() <= b) and float(m.weight.detach().std()) > b / 3


def _bn_running(L):
    bn = L.nn.BatchNorm1d(2, momentum=0.5)
    x = L.tensor([[1.0, 2.0], [3.0, 6.0]])
    bn(x)
    return (L.allclose(bn.running_mean, L.tensor([1.0, 2.0])) and
            L.allclose(bn.running_var, L.tensor([0.5 + 0.5 * 2.0, 0.5 + 0.5 * 8.0])) and
            int(bn.num_batches_tracked) == 1)


def _dropout_train(L):
    d = L.nn.Dropout(0.5)
    y = d(L.ones(1000))
    frac = float((y == 0).float().mean())
    return 0.4 < frac < 0.6 and bool(((y == 0) | (y == 2)).all())


def _shared_params(L):
    lin = L.nn.Linear(2, 2)
    return len(list(L.nn.Sequential(lin, lin).parameters()))


def _apply_init(L):
    m = L.nn.Sequential(L.nn.Linear(3, 3), L.nn.Linear(3, 3))

    def init(mod):
        if isinstance(mod, L.nn.Linear):
            L.nn.init.zeros_(mod.weight)
            L.nn.init.constant_(mod.bias, 0.5)
    m.apply(init)
    return bool((m[1].weight == 0).all()) and bool((m[0].bias == 0.5).all())


def init_fns():
    print('nn.init')
    behaviour('calculate_gain', lambda L: [round(L.nn.init.calculate_gain(n), 4) for n in ('linear', 'relu', 'tanh', 'sigmoid')]
              + [round(L.nn.init.calculate_gain('leaky_relu', 0.2), 4)],
              [1, round(math.sqrt(2), 4), round(5 / 3, 4), 1, round(math.sqrt(2 / 1.04), 4)])
    behaviour('init zeros/ones/constant', lambda L: (L.nn.init.zeros_(L.empty(2)).tolist(), L.nn.init.ones_(L.empty(2)).tolist(),
                                                     L.nn.init.constant_(L.empty(2), 0.3).tolist()),
              ([0.0, 0.0], [1.0, 1.0], [round(float(np.float32(0.3)), 4)] * 2))
    behaviour('init stats xavier/kaiming', lambda L: _init_stats(L), [True] * 6)
    behaviour('init on Parameter keeps leaf', lambda L: _init_leaf(L), (True, True))
    behaviour('init eye_', lambda L: L.nn.init.eye_(L.empty(2, 3)).tolist(), [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0]])
    behaviour('init orthogonal_', lambda L: bool(L.allclose(_orth(L), L.eye(4), atol=1e-5)), True)


def _init_stats(L):
    n = 400
    w = L.empty(n, n)
    res = []
    L.nn.init.xavier_uniform_(w)
    b = math.sqrt(6 / (2 * n))
    res.append(float(w.abs().max()) <= b + 1e-6)
    res.append(abs(float(w.std()) - b / math.sqrt(3)) < 0.01 * b)
    L.nn.init.xavier_normal_(w)
    res.append(abs(float(w.std()) - math.sqrt(2 / (2 * n))) < 0.02 * math.sqrt(2 / (2 * n)))
    L.nn.init.kaiming_uniform_(w, nonlinearity='relu')
    kb = math.sqrt(2) * math.sqrt(3 / n)
    res.append(float(w.abs().max()) <= kb + 1e-6)
    L.nn.init.kaiming_normal_(w, mode='fan_out', nonlinearity='relu')
    res.append(abs(float(w.std()) - math.sqrt(2 / n)) < 0.02 * math.sqrt(2 / n))
    L.nn.init.normal_(w, mean=1.0, std=0.1)
    res.append(abs(float(w.mean()) - 1.0) < 0.01)
    return res


def _init_leaf(L):
    p = L.nn.Parameter(L.empty(3, 3))
    L.nn.init.xavier_uniform_(p)
    return p.is_leaf, p.requires_grad


def _orth(L):
    w = L.nn.init.orthogonal_(L.empty(4, 6))
    return w @ w.T


# ----------------------------------------------------------------------------
# optimizers
# ----------------------------------------------------------------------------

def _opt_loss(L, p, target):
    return ((p - target) ** 2).sum() + 0.1 * (p ** 3).sum()


def run_opt(L, ctor, steps=6, sched=None):
    r = _rng('opt')
    p0 = r.randn(4).astype(np.float32)
    target = L.tensor(r.randn(4).astype(np.float32))
    p = L.nn.Parameter(L.tensor(p0))
    q = L.nn.Parameter(L.tensor(p0[:2].copy()))
    opt = ctor(L, [p, q])
    s = sched(L, opt) if sched else None
    traj, lrs = [], []
    for _ in range(steps):
        opt.zero_grad()
        loss = _opt_loss(L, p, target) + (q * q).sum()
        loss.backward()
        opt.step()
        if s is not None:
            s.step()
            lrs.append(s.get_last_lr()[0])
        traj.append(np.concatenate([p.detach().numpy().copy(), q.detach().numpy().copy()]))
    return np.array(traj), lrs


def np_opt_reference(kind, cfg, steps=6):
    """NumPy re-implementation of the torch update rules (used without real torch)."""
    r = _rng('opt')
    p0 = r.randn(4).astype(np.float64)
    target = r.randn(4).astype(np.float64)
    params = [p0.copy(), p0[:2].copy()]
    state = [{} for _ in params]
    traj = []
    for t in range(1, steps + 1):
        grads = [2 * (params[0] - target) + 0.3 * params[0] ** 2, 2 * params[1]]
        for i, (x, g) in enumerate(zip(params, grads)):
            st = state[i]
            lr, wd = cfg.get('lr', 1e-3), cfg.get('weight_decay', 0)
            if kind == 'sgd':
                g = g + wd * x
                m = cfg.get('momentum', 0)
                if m:
                    st['b'] = g.copy() if 'b' not in st else m * st['b'] + g
                    g = g + m * st['b'] if cfg.get('nesterov') else st['b']
                x -= lr * g
            elif kind in ('adam', 'adamw'):
                b1, b2 = cfg.get('betas', (0.9, 0.999))
                eps = cfg.get('eps', 1e-8)
                if kind == 'adamw':
                    x *= 1 - lr * wd
                else:
                    g = g + wd * x
                st['m'] = (1 - b1) * g if 'm' not in st else b1 * st['m'] + (1 - b1) * g
                st['v'] = (1 - b2) * g * g if 'v' not in st else b2 * st['v'] + (1 - b2) * g * g
                mh, vh = st['m'] / (1 - b1 ** t), st['v'] / (1 - b2 ** t)
                x -= lr * mh / (np.sqrt(vh) + eps)
            elif kind == 'rmsprop':
                a, eps = cfg.get('alpha', 0.99), cfg.get('eps', 1e-8)
                st['s'] = (1 - a) * g * g if 's' not in st else a * st['s'] + (1 - a) * g * g
                avg = np.sqrt(st['s']) + eps
                m = cfg.get('momentum', 0)
                if m:
                    st['b'] = g / avg if 'b' not in st else m * st['b'] + g / avg
                    x -= lr * st['b']
                else:
                    x -= lr * g / avg
        traj.append(np.concatenate([params[0].copy(), params[1].copy()]))
    return np.array(traj)


def optimizers():
    print('optim')
    cases = [
        ('SGD', 'sgd', dict(lr=0.1)),
        ('SGD momentum', 'sgd', dict(lr=0.05, momentum=0.9)),
        ('SGD nesterov wd', 'sgd', dict(lr=0.05, momentum=0.9, nesterov=True, weight_decay=0.01)),
        ('Adam', 'adam', dict(lr=0.05)),
        ('Adam betas wd', 'adam', dict(lr=0.05, betas=(0.8, 0.99), weight_decay=0.1)),
        ('AdamW', 'adamw', dict(lr=0.05, weight_decay=0.1)),
        ('RMSprop', 'rmsprop', dict(lr=0.01)),
        ('RMSprop momentum', 'rmsprop', dict(lr=0.01, momentum=0.5)),
    ]
    ctor_map = {'sgd': 'SGD', 'adam': 'Adam', 'adamw': 'AdamW', 'rmsprop': 'RMSprop'}
    for name, kind, cfg in cases:
        if not selected('optim ' + name):
            continue
        try:
            ctor = lambda L, ps, kind=kind, cfg=cfg: getattr(L.optim, ctor_map[kind])(ps, **cfg)
            got, _ = run_opt(S, ctor)
            if T is not None:
                want, _ = run_opt(T, ctor)
                ok, d = close(got, want, 1e-5, 1e-4)
                report(f'optim {name} [vs torch]', ok, d)
            else:
                want = np_opt_reference(kind, cfg)
                ok, d = close(got, want, 1e-4, 1e-3)
                report(f'optim {name} [vs numpy reference]', ok, d)
        except Exception as e:  # noqa: BLE001
            report(f'optim {name}', False, f'{type(e).__name__}: {e}')
    behaviour('optim Adagrad / amsgrad / centered RMSprop run', lambda L: [
        float(run_opt(L, lambda L_, ps: L_.optim.Adagrad(ps, lr=0.1))[0][-1, 0]),
        float(run_opt(L, lambda L_, ps: L_.optim.Adam(ps, lr=0.05, amsgrad=True))[0][-1, 0]),
        float(run_opt(L, lambda L_, ps: L_.optim.RMSprop(ps, lr=0.01, centered=True))[0][-1, 0])], None)
    sched_cases = [
        ('StepLR', lambda L, o: L.optim.lr_scheduler.StepLR(o, step_size=2, gamma=0.5),
         [0.1, 0.05, 0.05, 0.025, 0.025, 0.0125]),
        ('CosineAnnealingLR', lambda L, o: L.optim.lr_scheduler.CosineAnnealingLR(o, T_max=4),
         [0.1 * (1 + math.cos(math.pi * e / 4)) / 2 for e in range(1, 7)]),
        ('ExponentialLR', lambda L, o: L.optim.lr_scheduler.ExponentialLR(o, 0.9), [0.1 * 0.9 ** e for e in range(1, 7)]),
        ('MultiStepLR', lambda L, o: L.optim.lr_scheduler.MultiStepLR(o, [2, 4], 0.1),
         [0.1, 0.01, 0.01, 0.001, 0.001, 0.001]),
        ('LambdaLR', lambda L, o: L.optim.lr_scheduler.LambdaLR(o, lambda e: 1 / (e + 1)),
         [0.1 / (e + 1) for e in range(1, 7)]),
        ('LinearLR', lambda L, o: L.optim.lr_scheduler.LinearLR(o, start_factor=0.5, total_iters=4),
         [0.1 * (0.5 + 0.5 * min(e, 4) / 4) for e in range(1, 7)]),
    ]
    for name, sched, exp in sched_cases:
        if not selected('sched ' + name):
            continue
        try:
            ctor = lambda L, ps: L.optim.SGD(ps, lr=0.1)
            got_t, got = run_opt(S, ctor, sched=sched)
            if T is not None:
                want_t, want = run_opt(T, ctor, sched=sched)
                ok, d = close(got, want, 1e-7, 1e-5)
                report(f'sched {name} lrs [vs torch]', ok, d)
                ok, d = close(got_t, want_t, 1e-5, 1e-4)
                report(f'sched {name} params [vs torch]', ok, d)
            else:
                ok, d = close(got, exp, 1e-7, 1e-5)
                report(f'sched {name} [expected]', ok, d)
        except Exception as e:  # noqa: BLE001
            report(f'sched {name}', False, f'{type(e).__name__}: {e}')
    behaviour('optimizer param_groups', lambda L: _param_groups(L), (2, 0.01, 0.1))
    behaviour('optimizer zero_grad', lambda L: _opt_zero(L), None)
    behaviour('clip_grad_norm_', lambda L: _clip(L), (5.0, 1.0))
    behaviour('training loop converges', lambda L: _train_loop(L), True)


def _param_groups(L):
    a, b = L.nn.Parameter(L.ones(1)), L.nn.Parameter(L.ones(1))
    opt = L.optim.SGD([{'params': [a]}, {'params': [b], 'lr': 0.1}], lr=0.01)
    return len(opt.param_groups), opt.param_groups[0]['lr'], opt.param_groups[1]['lr']


def _opt_zero(L):
    p = L.nn.Parameter(L.ones(2))
    opt = L.optim.Adam([p])
    (p * 2).sum().backward()
    opt.zero_grad()
    return p.grad


def _clip(L):
    p = L.nn.Parameter(L.zeros(2))
    p.grad = L.tensor([3.0, 4.0])
    n = L.nn.utils.clip_grad_norm_([p], 1.0)
    return round(float(n), 4), round(float(p.grad.norm()), 4)


def _train_loop(L):
    L.manual_seed(0)
    r = _rng('train')
    X = L.tensor(r.randn(64, 2).astype(np.float32))
    y = (X[:, 0] * X[:, 1] > 0).long()
    model = L.nn.Sequential(L.nn.Linear(2, 16), L.nn.Tanh(), L.nn.Linear(16, 2))
    opt = L.optim.Adam(model.parameters(), lr=0.05)
    for _ in range(150):
        opt.zero_grad()
        loss = L.nn.functional.cross_entropy(model(X), y)
        loss.backward()
        opt.step()
    acc = float((model(X).argmax(1) == y).float().mean())
    return acc > 0.9


# ----------------------------------------------------------------------------
# distributions
# ----------------------------------------------------------------------------

def distributions():
    print('distributions')
    for name, fn, spec in [
        ('Categorical(logits) log_prob entropy', lambda L, lg: (lambda d: (d.log_prob(L.tensor([0, 3, 1])), d.entropy(),
                                                                           d.probs))(
            L.distributions.Categorical(logits=lg)), (R(3, 4),)),
        ('Categorical(probs) log_prob', lambda L, p: (lambda d: (d.log_prob(L.tensor([1, 2])), d.entropy(), d.logits))(
            L.distributions.Categorical(probs=p)), (U(2, 3),)),
        ('Categorical log_prob broadcast', lambda L, lg: L.distributions.Categorical(logits=lg).log_prob(
            L.tensor([[0], [2]])), (R(3, 4),)),
        ('Normal log_prob entropy', lambda L, m, s, x: (lambda d: (d.log_prob(x), d.entropy(), d.mean, d.stddev,
                                                                   d.variance))(
            L.distributions.Normal(m, s)), (R(3), P(3), R(3))),
        ('Normal scalar params', lambda L, x: L.distributions.Normal(0.0, 2.0).log_prob(x), (R(4),)),
        ('Normal cdf', lambda L, m, s, x: L.distributions.Normal(m, s).cdf(x), (R(3), P(3), R(3))),
        ('Bernoulli log_prob entropy', lambda L, p: (lambda d: (d.log_prob(L.tensor([1.0, 0.0, 1.0])), d.entropy()))(
            L.distributions.Bernoulli(probs=p)), (U(3),)),
        ('Bernoulli logits', lambda L, lg: L.distributions.Bernoulli(logits=lg).log_prob(L.tensor([1.0, 0.0])),
         (R(2),)),
        ('kl Normal Normal', lambda L, m1, s1, m2, s2: L.distributions.kl_divergence(
            L.distributions.Normal(m1, s1), L.distributions.Normal(m2, s2)), (R(3), P(3), R(3), P(3))),
        ('kl Categorical', lambda L, a, b: L.distributions.kl_divergence(
            L.distributions.Categorical(logits=a), L.distributions.Categorical(logits=b)), (R(2, 4), R(2, 4))),
        ('Uniform log_prob', lambda L, x: L.distributions.Uniform(L.tensor(-2.0), L.tensor(3.0)).log_prob(x),
         (U(3),)),
    ]:
        check(name, fn, *spec, atol=3e-5)
    behaviour('Categorical sample shape/dtype', lambda L: (lambda s: (tuple(s.shape), str(s.dtype)))(
        L.distributions.Categorical(probs=L.ones(3, 4) / 4).sample()), ((3,), 'torch.int64'))
    behaviour('Categorical sample_shape', lambda L: tuple(L.distributions.Categorical(logits=L.zeros(4)).sample((5, 2)).shape),
              (5, 2))
    behaviour('Categorical sample frequencies', lambda L: _cat_freq(L), True)
    behaviour('Categorical needs exactly one', lambda L: L.distributions.Categorical(), ('error', 'ValueError'))
    behaviour('Normal sample no grad', lambda L: (lambda m: L.distributions.Normal(m, 1.0).sample((3,)).requires_grad)(
        L.zeros(2, requires_grad=True)), False)
    behaviour('Normal rsample grads', lambda L: _rsample(L), ([3.0, 3.0], True))
    behaviour('Normal sample stats', lambda L: _normal_stats(L), True)
    behaviour('Normal batch_shape', lambda L: tuple(L.distributions.Normal(L.zeros(3), L.ones(3)).batch_shape), (3,))
    behaviour('MultivariateNormal log_prob', lambda L: round(float(L.distributions.MultivariateNormal(
        L.zeros(2), L.eye(2)).log_prob(L.tensor([1.0, 0.0]))), 4), round(-math.log(2 * math.pi) - 0.5, 4))


def _cat_freq(L):
    L.manual_seed(0)
    s = L.distributions.Categorical(probs=L.tensor([0.1, 0.6, 0.3])).sample((4000,))
    f = L.bincount(s, minlength=3).float() / 4000
    return bool(L.allclose(f, L.tensor([0.1, 0.6, 0.3]), atol=0.03))


def _rsample(L):
    m = L.zeros(2, requires_grad=True)
    s = L.ones(2, requires_grad=True)
    x = L.distributions.Normal(m, s).rsample((3,))
    x.sum().backward()
    return m.grad.tolist(), s.grad is not None


def _normal_stats(L):
    L.manual_seed(0)
    x = L.distributions.Normal(L.tensor(2.0), L.tensor(0.5)).sample((5000,))
    return abs(float(x.mean()) - 2.0) < 0.05 and abs(float(x.std()) - 0.5) < 0.05


def misc():
    print('misc / utils / unsupported')
    behaviour('TensorDataset + DataLoader', lambda L: _loader(L), (3, (4, 2), (4,), (2, 2)))
    behaviour('DataLoader shuffle covers all', lambda L: _loader_shuffle(L), list(range(10)))
    behaviour('torch.save unsupported', lambda L: L.save({}, 'x.pt') if L is S else (_ for _ in ()).throw(
        NotImplementedError()), ('error', 'NotImplementedError'))
    if T is None:
        behaviour('shim: unknown attr NotImplementedError', lambda L: L.fft, ('error', 'NotImplementedError'))
        behaviour('shim: hasattr unsupported is False', lambda L: hasattr(L, 'fft'), False)
        behaviour('shim: Tensor.cuda unsupported', lambda L: L.ones(1).cuda(), ('error', 'NotImplementedError'))
        behaviour('shim: nn.LSTM unsupported', lambda L: L.nn.LSTM(2, 2), ('error', 'NotImplementedError'))
    else:
        report('shim: unknown attr NotImplementedError', _raises(lambda: S.fft, NotImplementedError))
        report('shim: hasattr unsupported is False', hasattr(S, 'fft') is False)
        report('shim: Tensor.cuda unsupported', _raises(lambda: S.ones(1).cuda(), NotImplementedError))
        report('shim: nn.LSTM unsupported', _raises(lambda: S.nn.LSTM(2, 2), NotImplementedError))
    behaviour('deepcopy module', lambda L: _deepcopy(L), True)
    behaviour('torch.no_grad bare decorator', lambda L: L.no_grad(lambda x: (x * 2).requires_grad)(
        L.ones(1, requires_grad=True)), False)
    install_checks()


def _raises(fn, exc):
    try:
        fn()
    except exc:
        return True
    except Exception:  # noqa: BLE001
        return False
    return False


def _loader(L):
    ds = L.utils.data.TensorDataset(L.randn(10, 2), L.arange(10))
    dl = L.utils.data.DataLoader(ds, batch_size=4)
    batches = list(dl)
    x, y = batches[0]
    return len(batches), tuple(x.shape), tuple(y.shape), tuple(batches[-1][0].shape)


def _loader_shuffle(L):
    ds = L.utils.data.TensorDataset(L.arange(10))
    return sorted(int(v) for (b,) in L.utils.data.DataLoader(ds, batch_size=3, shuffle=True) for v in b)


def _deepcopy(L):
    import copy
    m = L.nn.Linear(2, 2)
    c = copy.deepcopy(m)
    with L.no_grad():
        c.weight.add_(1.0)
    return not bool(L.allclose(c.weight, m.weight)) and c.weight.requires_grad


def install_checks():
    """install() registers modules, is idempotent and never shadows a real torch."""
    if not selected('install'):
        return
    if sys.platform == 'emscripten':  # Pyodide cannot start subprocesses
        RESULTS['skip'] += 1
        return
    import subprocess
    code = r'''
import sys
sys.path.insert(0, sys.argv[1])
import torch_shim
t1 = torch_shim.install()
t2 = torch_shim.install()
assert t1 is t2 and sys.modules['torch'] is t1
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch import nn as nn2, optim
from torch.distributions import Categorical
from torch.optim.lr_scheduler import StepLR
from torch.utils.data import DataLoader, TensorDataset
import torch.linalg, torch.autograd, torch.nn.init
assert nn is nn2 and F is torch.nn.functional and torch._is_torch_shim
try:
    import torch.fft
    raise SystemExit("import torch.fft should fail")
except NotImplementedError:
    pass
# A pre-existing (fake "real") torch must be left alone
for k in [k for k in sys.modules if k == 'torch' or k.startswith('torch.')]:
    del sys.modules[k]
import types
fake = types.ModuleType('torch')
sys.modules['torch'] = fake
assert torch_shim.install() is fake and sys.modules['torch'] is fake
print('OK')
'''
    r = subprocess.run([sys.executable, '-B', '-c', code, os.path.join(HERE, '..', 'public', 'py')],
                       capture_output=True, text=True)
    report('install() registration / idempotence / real-torch guard', r.returncode == 0 and 'OK' in r.stdout,
           (r.stdout + r.stderr)[-500:])


def main():
    mode = f'real torch {T.__version__}' if T is not None else 'finite differences + hand-computed values'
    print(f'torch shim tests: comparing against {mode}\n')
    for section in (creation_and_dtype, math_ops, reduction_ops, shape_ops, linalg_ops, autograd_features,
                    functional_ops, modules, init_fns, optimizers, distributions, misc):
        section()
    total = RESULTS['pass'] + RESULTS['fail']
    print(f"\nSummary ({mode}): {RESULTS['pass']}/{total} checks passed, {RESULTS['fail']} failed")
    if FAILURES:
        print('\nFailures:')
        for f in FAILURES:
            print('  - ' + f.splitlines()[0])
    sys.exit(1 if FAILURES else 0)


if __name__ == '__main__':
    main()
