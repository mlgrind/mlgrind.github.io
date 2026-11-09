"""NumPy-backed PyTorch shim for the browser (Pyodide).

Real PyTorch has no WebAssembly build, so learners' PyTorch code runs against
this single-file re-implementation of a subset of the torch API. Call
``install()`` once; afterwards ``import torch``, ``import torch.nn as nn``,
``import torch.nn.functional as F``, ``from torch import nn, optim`` and
``from torch.distributions import Categorical`` all resolve to the shim.

Design
------
* ``Tensor`` wraps a ``np.ndarray`` (``_data``). Floats default to float32 and
  integers to int64, with torch's type-promotion rules (python scalars do not
  upcast tensors, int / int gives float, ...).
* Autograd is dynamic-graph, reverse mode, built like torch's engine: every
  differentiable op creates a ``Node`` holding its parent nodes and a backward
  closure that maps the output gradient (an ndarray) to one gradient per
  input. Leaves that require grad own an ``AccumulateGrad`` node.
  ``backward()`` topologically sorts the nodes reachable from the root and
  propagates; gradients are sum-reduced back to each input's shape, so
  broadcasting is handled in one place. In-place ops (``x[mask] = 0``,
  ``add_``...) rebase the tensor onto a new node, so earlier uses still see
  the old value's node.
* Randomness uses NumPy's global RNG: ``torch.manual_seed(s)`` calls
  ``np.random.seed(s)``. Random values therefore differ from real torch, but
  ``np.random.seed(0); torch.randn(3)`` equals ``np.random.randn(3)`` (as
  float32), which keeps the NumPy and PyTorch tracks' expected values aligned.
* ``_build()`` returns the torch module tree without registering it, which the
  tests use to compare the shim against real torch in one process.

Limitations
-----------
CPU only (``.to('cuda')`` fails), no complex/sparse/bfloat16 dtypes, no
higher-order gradients (``create_graph=True``), no in-place view semantics
while grad is being recorded (in-place ops copy then), no saving/loading, no
JIT/compile, no RNN layers. Unsupported names raise
``NotImplementedError("torch shim: <name> is not supported in the browser")``.
"""
import builtins
import collections
import copy as _copy
import functools
import itertools
import math
import numbers
import sys
import types

import numpy as np

__version__ = '2.3.0+shim'

_bmax, _bmin, _bsum, _babs, _bround, _ball, _bany = (
    builtins.max, builtins.min, builtins.sum, builtins.abs, builtins.round, builtins.all, builtins.any)


class ShimUnsupported(NotImplementedError, AttributeError):
    """Raised for torch APIs the shim does not implement.

    It is also an AttributeError so ``hasattr()`` and ``from torch import x``
    behave sensibly."""


def _unsupported(name, why=None):
    msg = f"torch shim: {name} is not supported in the browser"
    if why:
        msg += f" ({why})"
    return ShimUnsupported(msg)


_TORCH = {}  # name -> object exported on the torch module


def _export(*names):
    def deco(obj):
        for n in (names or (obj.__name__,)):
            _TORCH[n] = obj
        return obj
    return deco


# =============================================================================
# dtypes, Size, device
# =============================================================================

class dtype:
    def __init__(self, name, np_type, kind):
        self._name = name
        self._np = np.dtype(np_type)
        self.is_floating_point = kind == 'f'
        self.is_complex = False
        self.is_signed = kind in ('f', 'i')
        self.itemsize = self._np.itemsize

    def __repr__(self):
        return 'torch.' + self._name

    def __reduce__(self):
        return (_dtype_by_name, (self._name,))


float32 = dtype('float32', np.float32, 'f')
float64 = dtype('float64', np.float64, 'f')
float16 = dtype('float16', np.float16, 'f')
int64 = dtype('int64', np.int64, 'i')
int32 = dtype('int32', np.int32, 'i')
int16 = dtype('int16', np.int16, 'i')
int8 = dtype('int8', np.int8, 'i')
uint8 = dtype('uint8', np.uint8, 'u')
bool_ = dtype('bool', np.bool_, 'b')
_ALL_DTYPES = [float32, float64, float16, int64, int32, int16, int8, uint8, bool_]
_NP2DT = {d._np: d for d in _ALL_DTYPES}


def _dtype_by_name(name):
    return {d._name: d for d in _ALL_DTYPES}[name]


_DEFAULT = {'float': np.dtype(np.float32)}


def _default_float():
    return _DEFAULT['float']


def _to_np_dtype(d):
    """Accept torch dtype / numpy dtype / python type and return a numpy dtype."""
    if d is None:
        return None
    if isinstance(d, dtype):
        return d._np
    if d is float:
        return np.dtype(np.float64)
    if d is int:
        return np.dtype(np.int64)
    if d is bool:
        return np.dtype(np.bool_)
    if isinstance(d, str):
        d = d.replace('torch.', '')
        named = {x._name: x._np for x in _ALL_DTYPES}
        named.update({'float': np.dtype(np.float32), 'double': np.dtype(np.float64), 'long': np.dtype(np.int64),
                      'int': np.dtype(np.int32), 'half': np.dtype(np.float16)})
        if d in named:
            return named[d]
    try:
        nd = np.dtype(d)
    except TypeError:
        raise TypeError(f"torch shim: unsupported dtype {d!r}")
    if nd.kind == 'c':
        raise _unsupported('complex dtypes')
    return nd


def _to_torch_dtype(npd):
    npd = np.dtype(npd)
    if npd in _NP2DT:
        return _NP2DT[npd]
    if npd.kind == 'f':
        return float64
    if npd.kind in 'iu':
        return int64
    if npd.kind == 'b':
        return bool_
    raise _unsupported(f'dtype {npd}')


def _is_float(npd):
    return np.dtype(npd).kind == 'f'


def _cat(npd):
    k = np.dtype(npd).kind
    return 2 if k == 'f' else (1 if k in 'iu' else 0)


class Size(tuple):
    def __new__(cls, it=()):
        return super().__new__(cls, (int(s) for s in it))

    def __repr__(self):
        return f"torch.Size([{', '.join(str(s) for s in self)}])"

    __str__ = __repr__

    def numel(self):
        n = 1
        for s in self:
            n *= s
        return n

    def __getitem__(self, i):
        r = tuple.__getitem__(self, i)
        return Size(r) if isinstance(i, slice) else r

    def __add__(self, other):
        return Size(tuple(self) + tuple(other))

    def __radd__(self, other):
        return Size(tuple(other) + tuple(self))


class device:
    def __init__(self, type='cpu', index=None):
        if isinstance(type, device):
            type = type.type
        type = str(type)
        if ':' in type:
            type, index = type.split(':')
            index = int(index)
        if type not in ('cpu', 'meta'):
            raise _unsupported(f"device '{type}'", 'only CPU is available; torch.cuda.is_available() is False')
        self.type = type
        self.index = index

    def __repr__(self):
        return f"device(type='{self.type}')"

    def __str__(self):
        return self.type

    def __eq__(self, other):
        if isinstance(other, str):
            other = device(other)
        return isinstance(other, device) and other.type == self.type

    def __hash__(self):
        return hash(self.type)


_CPU = device('cpu')


# =============================================================================
# Grad mode
# =============================================================================

_GRAD = [True]


class _GradMode:
    _mode = None

    def __new__(cls, *args, **kwargs):
        # Bare decorator use: @torch.no_grad (no parentheses).
        if cls is not set_grad_enabled and len(args) == 1 and callable(args[0]) and not kwargs:
            return cls()(args[0])
        return super().__new__(cls)

    def __init__(self, *args, **kwargs):
        pass

    def __enter__(self):
        self._prev = _GRAD[0]
        _GRAD[0] = self._mode
        return self

    def __exit__(self, *exc):
        _GRAD[0] = self._prev
        return False

    def __call__(self, fn):
        mode = self._mode

        @functools.wraps(fn)
        def wrapper(*a, **k):
            prev = _GRAD[0]
            _GRAD[0] = mode
            try:
                return fn(*a, **k)
            finally:
                _GRAD[0] = prev
        return wrapper


@_export()
class no_grad(_GradMode):
    _mode = False


@_export()
class enable_grad(_GradMode):
    _mode = True


@_export()
class inference_mode(_GradMode):
    _mode = False

    def __init__(self, mode=True):
        self._mode = not mode


@_export()
class set_grad_enabled(_GradMode):
    def __init__(self, mode):
        self._mode = bool(mode)
        self._prev = _GRAD[0]
        _GRAD[0] = self._mode  # also works as a plain function call

    def __enter__(self):
        return self


@_export()
def is_grad_enabled():
    return _GRAD[0]


# =============================================================================
# Autograd engine
# =============================================================================

class _Handle:
    def __init__(self, lst, item):
        self._lst, self._item = lst, item

    def remove(self):
        if self._item in self._lst:
            self._lst.remove(self._item)


class Node:
    """One recorded operation. ``fn(grad_out) -> tuple(grad per parent)``."""

    def __init__(self, name, parents, fn, shapes, dtypes):
        self._name = name
        self.parents = parents
        self.fn = fn
        self.shapes = shapes
        self.dtypes = dtypes
        self.retained = None  # tensor whose .grad should be populated (retain_grad)
        self.hooks = []
        self.metadata = {}

    def name(self):
        return self._name

    @property
    def next_functions(self):
        return tuple((p, 0) for p in self.parents)

    def register_hook(self, fn):
        self.hooks.append(fn)
        return _Handle(self.hooks, fn)

    def __repr__(self):
        return f"<{self._name} object at {hex(id(self))}>"


class AccumulateGrad(Node):
    def __init__(self, variable):
        super().__init__('AccumulateGrad', (), None, (), ())
        self.variable = variable


def _unbroadcast(g, shape):
    """Sum-reduce gradient ``g`` to ``shape`` (inverse of broadcasting)."""
    g = np.asarray(g)
    shape = tuple(shape)
    if g.shape == shape:
        return g
    if g.ndim > len(shape):
        g = g.sum(axis=tuple(range(g.ndim - len(shape))))
    if g.ndim == len(shape):
        axes = tuple(i for i, s in enumerate(shape) if s == 1 and g.shape[i] != 1)
        if axes:
            g = g.sum(axis=axes, keepdims=True)
    if g.shape != shape:
        if g.size == int(np.prod(shape)):
            g = g.reshape(shape)
        else:
            g = np.broadcast_to(g, shape)
    return g


def _topo(roots):
    order, seen = [], set()
    stack = [(r, False) for r in roots]
    while stack:
        node, done = stack.pop()
        if done:
            order.append(node)
            continue
        if id(node) in seen:
            continue
        seen.add(id(node))
        stack.append((node, True))
        for p in node.parents:
            if p is not None and id(p) not in seen:
                stack.append((p, False))
    return order[::-1]


def _apply_hooks(node, g):
    for h in node.hooks:
        r = h(Tensor._wrap(g))
        if r is not None:
            g = r._data if isinstance(r, Tensor) else np.asarray(r)
    return g


def _run_backward(roots, root_grads, capture=None):
    """Propagate gradients. With ``capture`` (list of nodes) return their
    gradients instead of accumulating into leaves' ``.grad``."""
    grads = {}
    for r, g in zip(roots, root_grads):
        grads[id(r)] = grads[id(r)] + g if id(r) in grads else g
    captured = {}
    cap_ids = {id(n) for n in capture} if capture is not None else None
    for node in _topo(roots):
        g = grads.pop(id(node), None)
        if g is None:
            continue
        if node.hooks:
            g = _apply_hooks(node, g)
        if cap_ids is not None and id(node) in cap_ids:
            captured[id(node)] = captured[id(node)] + g if id(node) in captured else g
        if node.retained is not None and capture is None:
            t = node.retained
            if t.grad is None:
                t.grad = Tensor._wrap(np.array(g, dtype=t._data.dtype))
            else:
                t.grad._data = np.asarray(t.grad._data + g)
        if isinstance(node, AccumulateGrad):
            if capture is None:
                v = node.variable
                gg = np.array(_unbroadcast(g, v._data.shape), dtype=v._data.dtype)
                if v.grad is None:
                    v.grad = Tensor._wrap(gg)
                else:
                    v.grad._data = np.asarray(v.grad._data + gg)
            continue
        with np.errstate(all='ignore'):
            pgrads = node.fn(g)
        if not isinstance(pgrads, (tuple, list)):
            pgrads = (pgrads,)
        for p, pg, shp, dt in zip(node.parents, pgrads, node.shapes, node.dtypes):
            if p is None or pg is None:
                continue
            pg = _unbroadcast(pg, shp)
            if pg.dtype != dt:
                pg = pg.astype(dt)
            k = id(p)
            grads[k] = grads[k] + pg if k in grads else pg
    return captured


def _result(data, parents, backward, name):
    """Wrap an op result, recording a graph node when grad is needed."""
    out = Tensor._wrap(np.asarray(data))
    if backward is not None and _GRAD[0]:
        if _bany(p is not None and p._requires_grad for p in parents):
            nodes = tuple(p._grad_node() if (p is not None and p._requires_grad) else None for p in parents)
            shapes = tuple(p._data.shape if p is not None else () for p in parents)
            dts = tuple(p._data.dtype if p is not None else None for p in parents)
            out._node = Node(name, nodes, backward, shapes, dts)
            out._requires_grad = True
    return out


# =============================================================================
# Type promotion and operand coercion
# =============================================================================

def _is_scalar(x):
    return isinstance(x, (numbers.Number, np.generic)) and not isinstance(x, np.ndarray)


def _scalar_dtype(x):
    if isinstance(x, (bool, np.bool_)):
        return np.dtype(np.bool_)
    if isinstance(x, (numbers.Integral, np.integer)):
        return np.dtype(np.int64)
    if isinstance(x, (complex, np.complexfloating)):
        raise _unsupported('complex numbers')
    return _default_float()


def _promote(*items):
    """torch result_type: dimensioned tensors > 0-d tensors > python scalars,
    within the highest category (bool < int < float)."""
    entries = []
    for x in items:
        if x is None:
            continue
        if isinstance(x, Tensor):
            entries.append((_cat(x._data.dtype), 2 if x._data.ndim else 1, x._data.dtype))
        elif isinstance(x, np.ndarray):
            entries.append((_cat(x.dtype), 2 if x.ndim else 1, x.dtype))
        else:
            sd = _scalar_dtype(x)
            entries.append((_cat(sd), 0, sd))
    top = _bmax(e[0] for e in entries)
    cands = [e for e in entries if e[0] == top]
    prio = _bmax(e[1] for e in cands)
    dts = [e[2] for e in cands if e[1] == prio]
    if prio == 0:
        return dts[0]
    r = dts[0]
    for d in dts[1:]:
        r = np.promote_types(r, d)
    return r


def _arr(x, dt=None):
    """Operand -> ndarray (optionally cast)."""
    if isinstance(x, Tensor):
        a = x._data
    elif isinstance(x, np.ndarray):
        a = x
    else:
        a = np.asarray(x, dtype=dt if dt is not None else _scalar_dtype(x) if _is_scalar(x) else None)
    if dt is not None and a.dtype != dt:
        a = a.astype(dt)
    return a


def _tens(x):
    """Coerce to a Tensor (python scalars become 0-d tensors)."""
    if isinstance(x, Tensor):
        return x
    return tensor(x)


def _tparent(x):
    return x if isinstance(x, Tensor) else None


def _floatify(x):
    """Tensor whose dtype is floating (ints promote to the default float)."""
    x = _tens(x)
    if _is_float(x._data.dtype):
        return x
    return x.to(_to_torch_dtype(_default_float()))


def _dims(dim, ndim):
    if dim is None:
        return None
    if isinstance(dim, (list, tuple, Size)):
        if len(dim) == 0:
            return None
        ds = dim
    else:
        ds = (dim,)
    out = []
    for d in ds:
        d = int(d)
        n = _bmax(ndim, 1)
        if not -n <= d < n:
            raise IndexError(f"Dimension out of range (expected to be in range of [{-n}, {n - 1}], but got {d})")
        out.append(d % n if ndim else 0)
    return tuple(sorted(set(out)))


def _dim1(dim, ndim):
    return _dims(dim, ndim)[0]


def _expand_grad(g, shape, axes, keepdim):
    g = np.asarray(g)
    if axes is not None and not keepdim and len(shape):
        g = np.expand_dims(g, axes)
    return np.broadcast_to(g, shape)


def _size_args(args):
    if len(args) == 1 and isinstance(args[0], (tuple, list, Size)):
        args = tuple(args[0])
    return tuple(int(a) for a in args)


def _check_inplace_leaf(t):
    if _GRAD[0] and t._requires_grad and t.is_leaf:
        raise RuntimeError("a leaf Variable that requires grad is being used in an in-place operation.")


def _as_index(idx):
    """Convert tensors inside an index expression to numpy."""
    if isinstance(idx, Tensor):
        a = idx._data
        if a.dtype == np.bool_:
            return a
        if a.dtype.kind not in 'iu':
            raise IndexError("tensors used as indices must be long, int, byte or bool tensors")
        if a.ndim == 0:
            return int(a)
        return a
    if isinstance(idx, tuple):
        return tuple(_as_index(i) for i in idx)
    if isinstance(idx, list):
        if _bany(isinstance(i, (Tensor, list, tuple, np.ndarray)) for i in idx):
            return np.array([_as_index(i) for i in idx])
        return np.array(idx) if len(idx) else np.array(idx, dtype=np.int64)
    return idx


def _is_advanced(idx):
    items = idx if isinstance(idx, tuple) else (idx,)
    return _bany(isinstance(i, (np.ndarray, list)) for i in items)


def _int_index(idx, shape):
    """Turn boolean arrays into integer arrays so np.add.at can use the index."""
    items = idx if isinstance(idx, tuple) else (idx,)
    out = []
    for i in items:
        if isinstance(i, np.ndarray) and i.dtype == np.bool_:
            out.extend(np.nonzero(i))
        else:
            out.append(i)
    return tuple(out)


# =============================================================================
# Tensor
# =============================================================================

class Tensor:
    __array_priority__ = 1000

    def __init__(self, *args, dtype=None, device=None, requires_grad=False):
        if len(args) == 1 and not isinstance(args[0], (numbers.Integral,)):
            data = _arr_from_data(args[0], _to_np_dtype(dtype) or _default_float())
        else:
            data = np.zeros(_size_args(args), dtype=_to_np_dtype(dtype) or _default_float())
        self._init(data)
        if requires_grad:
            self.requires_grad_(True)

    def _init(self, data):
        self._data = np.asarray(data)
        self._requires_grad = False
        self._node = None
        self.grad = None

    @classmethod
    def _wrap(cls, data):
        t = object.__new__(Tensor)
        t._init(np.asarray(data))
        return t

    def _grad_node(self):
        if self._node is None:
            self._node = AccumulateGrad(self)
        return self._node

    # --- attributes -----------------------------------------------------------
    def __getattr__(self, name):
        if name.startswith('_'):
            raise AttributeError(name)
        raise _unsupported(f'Tensor.{name}')

    @property
    def shape(self):
        return Size(self._data.shape)

    def size(self, dim=None):
        if dim is None:
            return Size(self._data.shape)
        return self._data.shape[_dim1(dim, self._data.ndim)]

    def dim(self):
        return self._data.ndim

    ndimension = dim

    @property
    def ndim(self):
        return self._data.ndim

    def numel(self):
        return int(self._data.size)

    nelement = numel

    def element_size(self):
        return self._data.itemsize

    @property
    def dtype(self):
        return _to_torch_dtype(self._data.dtype)

    @property
    def device(self):
        return _CPU

    @property
    def is_cuda(self):
        return False

    def get_device(self):
        return -1

    @property
    def layout(self):
        return 'torch.strided'

    def is_floating_point(self):
        return _is_float(self._data.dtype)

    def is_complex(self):
        return False

    def is_contiguous(self, memory_format=None):
        return True

    @property
    def requires_grad(self):
        return self._requires_grad

    @requires_grad.setter
    def requires_grad(self, flag):
        self.requires_grad_(flag)

    def requires_grad_(self, requires_grad=True):
        if not self.is_leaf:
            if not requires_grad:
                raise RuntimeError("you can only change requires_grad flags of leaf variables. If you want to use "
                                   "a computed variable in a subgraph that doesn't require differentiation use "
                                   "var_no_grad = var.detach().")
            return self
        if requires_grad and not _is_float(self._data.dtype):
            raise RuntimeError("only Tensors of floating point dtype can require gradients")
        self._requires_grad = bool(requires_grad)
        if not requires_grad:
            self._node = None
        return self

    @property
    def is_leaf(self):
        return self._node is None or isinstance(self._node, AccumulateGrad)

    @property
    def grad_fn(self):
        return None if self.is_leaf else self._node

    def retain_grad(self):
        if not self._requires_grad:
            raise RuntimeError("can't retain_grad on Tensor that has requires_grad=False")
        if not self.is_leaf:
            self._node.retained = self
        return None

    @property
    def retains_grad(self):
        return (not self.is_leaf) and self._node.retained is self

    def register_hook(self, hook):
        if not self._requires_grad:
            raise RuntimeError("cannot register a hook on a tensor that doesn't require gradient")
        return self._grad_node().register_hook(hook)

    @property
    def data(self):
        return Tensor._wrap(self._data)

    @data.setter
    def data(self, value):
        self._data = _arr(value)

    @property
    def T(self):
        return self.permute(*range(self._data.ndim - 1, -1, -1))

    @property
    def mT(self):
        return self.transpose(-2, -1)

    @property
    def H(self):
        return self.T

    @property
    def mH(self):
        return self.mT

    @property
    def is_sparse(self):
        return False

    @property
    def names(self):
        return (None,) * self._data.ndim

    # --- conversion -------------------------------------------------------------
    def item(self):
        if self._data.size != 1:
            raise RuntimeError(f"a Tensor with {self._data.size} elements cannot be converted to Scalar")
        return self._data.reshape(()).item()

    def tolist(self):
        return self._data.tolist()

    def numpy(self, force=False):
        if self._requires_grad and not force:
            raise RuntimeError("Can't call numpy() on Tensor that requires grad. Use tensor.detach().numpy() instead.")
        return self._data

    def __array__(self, dtype=None, copy=None):
        a = self._data
        return a.astype(dtype) if dtype is not None else a

    def detach(self):
        return Tensor._wrap(self._data)

    def detach_(self):
        self._node = None
        self._requires_grad = False
        return self

    def clone(self, memory_format=None):
        return _result(self._data.copy(), (self,), lambda g: (g,), 'CloneBackward0')

    def contiguous(self, memory_format=None):
        return self

    def cpu(self):
        return self

    def cuda(self, *a, **k):
        raise _unsupported('CUDA', 'torch.cuda.is_available() is False')

    def pin_memory(self):
        return self

    def share_memory_(self):
        return self

    def to(self, *args, **kwargs):
        dt = kwargs.get('dtype')
        copy = kwargs.get('copy', False)
        for a in list(args) + [kwargs.get('device')]:
            if a is None:
                continue
            if isinstance(a, Tensor):
                dt = a.dtype
            elif isinstance(a, dtype) or a in (float, int, bool):
                dt = a
            elif isinstance(a, (str, device)):
                device(a)  # raises for cuda etc.
            elif isinstance(a, bool):
                pass
        if dt is None:
            return self.clone() if copy else self
        npd = _to_np_dtype(dt)
        if npd == self._data.dtype and not copy:
            return self
        src_float = _is_float(self._data.dtype)
        if _is_float(npd) and src_float:
            back = lambda g: (g,)
        else:
            back = None
        return _result(self._data.astype(npd), (self,), back, 'ToCopyBackward0')

    def type(self, dtype=None, **kw):
        if dtype is None:
            return {np.float32: 'torch.FloatTensor', np.float64: 'torch.DoubleTensor', np.int64: 'torch.LongTensor',
                    np.int32: 'torch.IntTensor', np.bool_: 'torch.BoolTensor', np.uint8: 'torch.ByteTensor'
                    }.get(self._data.dtype.type, 'torch.Tensor')
        if isinstance(dtype, str):
            dtype = {'torch.FloatTensor': float32, 'torch.DoubleTensor': float64, 'torch.LongTensor': int64,
                     'torch.IntTensor': int32, 'torch.BoolTensor': bool_}.get(dtype, dtype)
        return self.to(dtype)

    def type_as(self, other):
        return self.to(other.dtype)

    def float(self):
        return self.to(float32)

    def double(self):
        return self.to(float64)

    def half(self):
        return self.to(float16)

    def long(self):
        return self.to(int64)

    def int(self):
        return self.to(int32)

    def short(self):
        return self.to(int16)

    def char(self):
        return self.to(int8)

    def byte(self):
        return self.to(uint8)

    def bool(self):
        return self.to(bool_)

    def new_tensor(self, data, dtype=None, requires_grad=False, **kw):
        return tensor(data, dtype=dtype or self.dtype, requires_grad=requires_grad)

    def new_zeros(self, *size, dtype=None, requires_grad=False, **kw):
        return zeros(*size, dtype=dtype or self.dtype, requires_grad=requires_grad)

    def new_ones(self, *size, dtype=None, requires_grad=False, **kw):
        return ones(*size, dtype=dtype or self.dtype, requires_grad=requires_grad)

    def new_empty(self, *size, dtype=None, requires_grad=False, **kw):
        return zeros(*size, dtype=dtype or self.dtype, requires_grad=requires_grad)

    def new_full(self, size, fill_value, dtype=None, requires_grad=False, **kw):
        return full(size, fill_value, dtype=dtype or self.dtype, requires_grad=requires_grad)

    # --- python protocol ---------------------------------------------------------
    def __len__(self):
        if self._data.ndim == 0:
            raise TypeError("len() of a 0-d tensor")
        return self._data.shape[0]

    def __iter__(self):
        if self._data.ndim == 0:
            raise TypeError("iteration over a 0-d tensor")
        return (self[i] for i in range(self._data.shape[0]))

    def __bool__(self):
        if self._data.size != 1:
            raise RuntimeError(f"Boolean value of Tensor with more than one value is ambiguous")
        return bool(self._data.reshape(()))

    def __float__(self):
        return float(self.item())

    def __int__(self):
        return int(self.item())

    def __index__(self):
        if self._data.dtype.kind not in 'iub' or self._data.size != 1:
            raise TypeError("only integer tensors of a single element can be converted to an index")
        return int(self.item())

    def __complex__(self):
        return complex(self.item())

    def __hash__(self):
        return id(self)

    def __contains__(self, item):
        return bool((self == item).any())

    def __format__(self, spec):
        if self._data.size == 1 and spec:
            return format(self.item(), spec)
        return format(repr(self), spec)

    def __repr__(self):
        a = self._data
        kw = dict(separator=', ', prefix='tensor(')
        if a.dtype.kind == 'f':
            finite = a[np.isfinite(a)]
            integral = finite.size == 0 or bool(np.all(finite == np.round(finite)))
            big = finite.size and (np.abs(finite).max() >= 1e8 or (np.abs(finite[finite != 0]).min(initial=1) < 1e-4))
            if big:
                kw['formatter'] = {'float_kind': lambda v: f'{v:.4e}'}
            with np.printoptions(precision=4, floatmode='maxprec' if integral else 'fixed', suppress=not big):
                body = np.array2string(a, **kw)
        else:
            body = np.array2string(a, **kw)
        extra = ''
        if a.dtype not in (np.dtype(np.int64), _default_float(), np.dtype(np.bool_)) or (a.size == 0):
            extra += f', dtype={self.dtype}'
        if self.grad_fn is not None:
            extra += f', grad_fn=<{self.grad_fn.name()}>'
        elif self._requires_grad:
            extra += ', requires_grad=True'
        if a.size == 0:
            body = '[]'
        return f'tensor({body}{extra})'

    __str__ = __repr__

    def __deepcopy__(self, memo):
        if not self.is_leaf:
            raise RuntimeError("Only Tensors created explicitly by the user (graph leaves) support the deepcopy protocol at the moment.")
        new = object.__new__(type(self))
        new.__dict__.update({k: v for k, v in self.__dict__.items() if k not in ('_data', '_node', 'grad')})
        new._data = self._data.copy()
        new._node = None
        new.grad = _copy.deepcopy(self.grad, memo) if self.grad is not None else None
        memo[id(self)] = new
        return new

    def __reduce_ex__(self, proto):
        return (_rebuild_tensor, (type(self), self._data.copy(), self._requires_grad))

    # --- autograd ---------------------------------------------------------------
    def backward(self, gradient=None, retain_graph=None, create_graph=False, inputs=None):
        if create_graph:
            raise _unsupported('create_graph=True (higher-order gradients)')
        if not self._requires_grad:
            raise RuntimeError("element 0 of tensors does not require grad and does not have a grad_fn")
        if gradient is None:
            if self._data.size != 1:
                raise RuntimeError("grad can be implicitly created only for scalar outputs")
            g = np.ones_like(self._data)
        else:
            g = np.broadcast_to(_arr(gradient, self._data.dtype), self._data.shape)
        if inputs is not None:
            inputs = [inputs] if isinstance(inputs, Tensor) else list(inputs)
            caps = _run_backward([self._grad_node()], [g], capture=[t._grad_node() for t in inputs])
            for t in inputs:
                gg = caps.get(id(t._grad_node()))
                if gg is not None:
                    gg = np.array(_unbroadcast(gg, t._data.shape), dtype=t._data.dtype)
                    if t.grad is None:
                        t.grad = Tensor._wrap(gg)
                    else:
                        t.grad._data = np.asarray(t.grad._data + gg)
            return
        _run_backward([self._grad_node()], [g])

    # --- in-place machinery ----------------------------------------------------
    def _snapshot(self):
        s = Tensor._wrap(self._data)
        s._requires_grad = self._requires_grad
        s._node = self._grad_node() if self._requires_grad else None
        return s

    def _inplace(self, compute):
        """Apply ``compute(src) -> Tensor`` in place."""
        if _GRAD[0]:
            _check_inplace_leaf(self)
            src = self._snapshot()
            res = compute(src)
            if res._requires_grad:
                data = res._data
                if data.shape != self._data.shape:
                    data = np.broadcast_to(data, self._data.shape)
                    res = res.expand(self._data.shape)
                if data.dtype != self._data.dtype:
                    res = res.to(self.dtype)
                self._data = np.array(res._data, copy=True)
                self._node = res._node
                self._requires_grad = True
                return self
        else:
            res = compute(self)
        r = res._data
        if r.dtype != self._data.dtype and _cat(r.dtype) > _cat(self._data.dtype):
            raise RuntimeError(f"result type {_to_torch_dtype(r.dtype)} can't be cast to the desired output type "
                               f"{self.dtype}")
        if not isinstance(self._data, np.ndarray) or not self._data.flags.writeable:
            self._data = np.array(self._data)
        self._data[...] = r
        return self

    def __setitem__(self, idx, value):
        index = _as_index(idx)
        val_t = value if isinstance(value, Tensor) else None
        vdata = _arr(value, self._data.dtype)

        def compute(src):
            out = src._data.copy()
            out[index] = vdata

            def back(g):
                gs = g.copy()
                gs[index] = 0
                return gs, g[index]
            return _result(out, (src, val_t), back, 'CopySlices')
        return self._inplace(compute)

    def __getitem__(self, idx):
        index = _as_index(idx)
        out = self._data[index]
        shape = self._data.shape
        adv = _is_advanced(index)

        def back(g):
            gz = np.zeros(shape, dtype=g.dtype)
            if adv:
                np.add.at(gz, _int_index(index, shape), g)
            else:
                gz[index] = g
            return (gz,)
        if not adv and isinstance(out, np.ndarray):
            pass  # basic indexing -> numpy view, like torch
        else:
            out = np.array(out)
        return _result(out, (self,), back, 'IndexBackward0' if adv else 'SliceBackward0')


def _rebuild_tensor(cls, data, requires_grad):
    t = Tensor._wrap(data)
    if cls is not Tensor:
        t.__class__ = cls
    t._requires_grad = requires_grad
    return t


def _arr_from_data(data, dt=None):
    """Python data / ndarray / tensors -> ndarray with torch dtype inference."""
    if isinstance(data, Tensor):
        a = data._data.copy()
        return a.astype(dt) if dt is not None else a
    if isinstance(data, np.ndarray):
        a = np.array(data, copy=True)
        if dt is None:
            if a.dtype.kind == 'c':
                raise _unsupported('complex dtypes')
            if a.dtype not in _NP2DT:
                a = a.astype(_to_torch_dtype(a.dtype)._np)
        return a.astype(dt) if dt is not None else a
    if isinstance(data, (list, tuple)):
        data = _untensor(data)
    a = np.array(data)
    if a.dtype == object:
        raise TypeError("torch shim: could not convert data to a tensor (ragged nested sequence?)")
    if dt is not None:
        return a.astype(dt)
    if isinstance(data, np.generic):
        return a.astype(_to_torch_dtype(a.dtype)._np)
    k = a.dtype.kind
    if k == 'f':
        return a.astype(_default_float())
    if k in 'iu':
        return a.astype(np.int64)
    if k == 'b':
        return a
    if k == 'c':
        raise _unsupported('complex dtypes')
    if a.size == 0:
        return a.astype(_default_float())
    raise TypeError(f"torch shim: can't convert {type(data).__name__} to a tensor")


def _untensor(x):
    if isinstance(x, Tensor):
        return x._data
    if isinstance(x, (list, tuple)):
        return [_untensor(i) for i in x]
    return x


# =============================================================================
# Tensor creation
# =============================================================================

def _finish(arr, requires_grad=False):
    t = Tensor._wrap(arr)
    if requires_grad:
        t.requires_grad_(True)
    return t


@_export()
def tensor(data, dtype=None, device=None, requires_grad=False, pin_memory=False):
    if device is not None:
        globals()['device'](device)
    return _finish(_arr_from_data(data, _to_np_dtype(dtype)), requires_grad)


@_export()
def as_tensor(data, dtype=None, device=None):
    if isinstance(data, Tensor):
        return data if dtype is None else data.to(dtype)
    if isinstance(data, np.ndarray) and (dtype is None or _to_np_dtype(dtype) == data.dtype) and data.dtype in _NP2DT:
        return Tensor._wrap(data)
    return tensor(data, dtype=dtype)


@_export()
def from_numpy(arr):
    if not isinstance(arr, np.ndarray):
        raise TypeError(f"expected np.ndarray (got {type(arr).__name__})")
    if arr.dtype not in _NP2DT:
        raise TypeError(f"can't convert np.ndarray of type {arr.dtype}")
    return Tensor._wrap(arr)


def _creation_dtype(dtype):
    return _to_np_dtype(dtype) or _default_float()


@_export()
def zeros(*size, dtype=None, device=None, requires_grad=False, out=None, layout=None, pin_memory=False):
    return _finish(np.zeros(_size_args(size), dtype=_creation_dtype(dtype)), requires_grad)


@_export()
def ones(*size, dtype=None, device=None, requires_grad=False, out=None, layout=None, pin_memory=False):
    return _finish(np.ones(_size_args(size), dtype=_creation_dtype(dtype)), requires_grad)


@_export()
def empty(*size, dtype=None, device=None, requires_grad=False, out=None, layout=None, pin_memory=False,
          memory_format=None):
    return zeros(*size, dtype=dtype, requires_grad=requires_grad)


@_export()
def full(size, fill_value, dtype=None, device=None, requires_grad=False, out=None, layout=None):
    if isinstance(fill_value, Tensor):
        fill_value = fill_value.item()
    npd = _to_np_dtype(dtype) or _scalar_dtype(fill_value)
    return _finish(np.full(_size_args((size,)) if not isinstance(size, int) else (size,), fill_value, dtype=npd),
                   requires_grad)


def _like_dtype(x, dtype):
    return _to_np_dtype(dtype) or _tens(x)._data.dtype


@_export()
def zeros_like(x, dtype=None, device=None, requires_grad=False, memory_format=None, layout=None):
    return _finish(np.zeros(_tens(x)._data.shape, dtype=_like_dtype(x, dtype)), requires_grad)


@_export()
def ones_like(x, dtype=None, device=None, requires_grad=False, memory_format=None, layout=None):
    return _finish(np.ones(_tens(x)._data.shape, dtype=_like_dtype(x, dtype)), requires_grad)


@_export()
def empty_like(x, dtype=None, device=None, requires_grad=False, memory_format=None, layout=None):
    return zeros_like(x, dtype=dtype, requires_grad=requires_grad)


@_export()
def full_like(x, fill_value, dtype=None, device=None, requires_grad=False, memory_format=None, layout=None):
    return _finish(np.full(_tens(x)._data.shape, fill_value, dtype=_like_dtype(x, dtype)), requires_grad)


@_export()
def rand_like(x, dtype=None, device=None, requires_grad=False, memory_format=None):
    return rand(*_tens(x).shape, dtype=dtype or _tens(x).dtype, requires_grad=requires_grad)


@_export()
def randn_like(x, dtype=None, device=None, requires_grad=False, memory_format=None):
    return randn(*_tens(x).shape, dtype=dtype or _tens(x).dtype, requires_grad=requires_grad)


@_export()
def randint_like(x, low=0, high=None, dtype=None, device=None, requires_grad=False):
    if high is None:
        low, high = 0, low
    return randint(low, high, _tens(x).shape, dtype=dtype or _tens(x).dtype)


@_export()
def eye(n, m=None, dtype=None, device=None, requires_grad=False, out=None):
    return _finish(np.eye(int(n), int(m) if m is not None else None, dtype=_creation_dtype(dtype)), requires_grad)


@_export()
def arange(start, end=None, step=1, dtype=None, device=None, requires_grad=False, out=None, layout=None):
    if end is None:
        start, end = 0, start
    vals = [v.item() if isinstance(v, Tensor) else v for v in (start, end, step)]
    if dtype is None:
        is_f = _bany(isinstance(v, (float, np.floating)) for v in vals)
        npd = _default_float() if is_f else np.dtype(np.int64)
    else:
        npd = _to_np_dtype(dtype)
    n = int(math.ceil((vals[1] - vals[0]) / vals[2]))
    arr = (vals[0] + np.arange(_bmax(n, 0), dtype=np.float64) * vals[2])
    if npd.kind in 'iu':
        arr = np.round(arr)
    return _finish(arr.astype(npd), requires_grad)


@_export()
def range_(start, end, step=1, dtype=None, **kw):
    return arange(start, end + step / 2, step, dtype=dtype or float32)


@_export()
def linspace(start, end, steps, dtype=None, device=None, requires_grad=False, out=None):
    s, e = [v.item() if isinstance(v, Tensor) else v for v in (start, end)]
    return _finish(np.linspace(s, e, int(steps)).astype(_creation_dtype(dtype)), requires_grad)


@_export()
def logspace(start, end, steps, base=10.0, dtype=None, device=None, requires_grad=False):
    return _finish((base ** np.linspace(start, end, int(steps))).astype(_creation_dtype(dtype)), requires_grad)


class Generator:
    def __init__(self, device='cpu'):
        self._seed = 0

    def manual_seed(self, seed):
        self._seed = int(seed)
        np.random.seed(int(seed) % (2 ** 32))
        return self

    def seed(self):
        return self._seed

    def initial_seed(self):
        return self._seed

    def get_state(self):
        return get_rng_state()

    def set_state(self, s):
        set_rng_state(s)


_export('Generator')(Generator)
default_generator = Generator()
_TORCH['default_generator'] = default_generator


@_export()
def manual_seed(seed):
    return default_generator.manual_seed(seed)


@_export()
def seed():
    s = int(np.random.randint(0, 2 ** 31 - 1))
    np.random.seed(s)
    return s


@_export()
def initial_seed():
    return default_generator._seed


@_export()
def get_rng_state():
    return np.random.get_state()


@_export()
def set_rng_state(state):
    np.random.set_state(state)


@_export()
def rand(*size, dtype=None, device=None, requires_grad=False, generator=None, out=None):
    return _finish(np.asarray(np.random.random_sample(_size_args(size))).astype(_creation_dtype(dtype)),
                   requires_grad)


@_export()
def randn(*size, dtype=None, device=None, requires_grad=False, generator=None, out=None):
    return _finish(np.asarray(np.random.standard_normal(_size_args(size))).astype(_creation_dtype(dtype)),
                   requires_grad)


@_export()
def randint(low, high=None, size=None, dtype=None, device=None, requires_grad=False, generator=None):
    if size is None:  # randint(high, size)
        low, high, size = 0, low, high
    return _finish(np.asarray(np.random.randint(int(low), int(high), size=_size_args((size,)))).astype(
        _to_np_dtype(dtype) or np.int64), requires_grad)


@_export()
def randperm(n, dtype=None, device=None, requires_grad=False, generator=None):
    return _finish(np.random.permutation(int(n)).astype(_to_np_dtype(dtype) or np.int64), requires_grad)


@_export()
def normal(mean=0.0, std=1.0, size=None, generator=None, dtype=None, requires_grad=False, out=None):
    if isinstance(mean, Tensor) or isinstance(std, Tensor):
        m, s = _arr(mean), _arr(std)
        shape = np.broadcast(m, s).shape
        npd = _promote(mean, std)
        return Tensor._wrap((m + s * np.random.standard_normal(shape)).astype(npd))
    return _finish((mean + std * np.asarray(np.random.standard_normal(_size_args((size,))))).astype(
        _creation_dtype(dtype)), requires_grad)


@_export()
def bernoulli(input, p=None, generator=None):
    x = _tens(input)
    probs = x._data if p is None else np.full(x._data.shape, p)
    return Tensor._wrap((np.random.random_sample(x._data.shape) < probs).astype(x._data.dtype))


@_export()
def multinomial(input, num_samples, replacement=False, generator=None):
    p = _tens(input)._data.astype(np.float64)
    rows = p.reshape(-1, p.shape[-1])
    out = []
    for r in rows:
        if r.sum() <= 0:
            raise RuntimeError("invalid multinomial distribution (sum of probabilities <= 0)")
        if not replacement and num_samples > np.count_nonzero(r):
            raise RuntimeError("cannot sample n_sample > prob_dist.size(-1) samples without replacement")
        out.append(np.random.choice(len(r), size=num_samples, replace=replacement, p=r / r.sum()))
    res = np.array(out, dtype=np.int64)
    return Tensor._wrap(res.reshape(p.shape[:-1] + (num_samples,)))


@_export()
def poisson(input, generator=None):
    x = _tens(input)
    return Tensor._wrap(np.random.poisson(x._data).astype(x._data.dtype))


@_export()
def tril_indices(row, col, offset=0, dtype=None, device=None):
    return Tensor._wrap(np.array(np.tril_indices(row, offset, col), dtype=np.int64))


@_export()
def triu_indices(row, col, offset=0, dtype=None, device=None):
    return Tensor._wrap(np.array(np.triu_indices(row, offset, col), dtype=np.int64))


# =============================================================================
# Elementwise math
# =============================================================================

def _binary(a, b, f, bwd, name, float_out=False):
    dt = _promote(a, b)
    if float_out and not _is_float(dt):
        dt = _default_float()
    A, B = _arr(a, dt), _arr(b, dt)
    with np.errstate(all='ignore'):
        out = np.asarray(f(A, B))
    back = None
    if bwd is not None and _is_float(dt):
        back = lambda g: bwd(g, A, B, out)
    return _result(out, (_tparent(a), _tparent(b)), back, name)


def _compare(a, b, f):
    dt = _promote(a, b)
    with np.errstate(all='ignore'):
        return Tensor._wrap(np.asarray(f(_arr(a, dt), _arr(b, dt))))


@_export()
def add(input, other, alpha=1, out=None):
    if alpha != 1:
        other = mul(other, alpha)
    return _binary(input, other, np.add, lambda g, A, B, o: (g, g), 'AddBackward0')


@_export('sub', 'subtract')
def sub(input, other, alpha=1, out=None):
    if alpha != 1:
        other = mul(other, alpha)
    return _binary(input, other, np.subtract, lambda g, A, B, o: (g, -g), 'SubBackward0')


@_export('mul', 'multiply')
def mul(input, other, out=None):
    return _binary(input, other, np.multiply, lambda g, A, B, o: (g * B, g * A), 'MulBackward0')


@_export('div', 'divide', 'true_divide')
def div(input, other, rounding_mode=None, out=None):
    if rounding_mode == 'floor':
        return floor_divide(input, other)
    if rounding_mode == 'trunc':
        r = _binary(input, other, np.divide, None, 'DivBackward0', float_out=True)
        r = Tensor._wrap(np.trunc(r._data))
        dt = _promote(input, other)
        return r if _is_float(dt) else r.to(_to_torch_dtype(dt))
    return _binary(input, other, np.divide, lambda g, A, B, o: (g / B, -g * A / (B * B)), 'DivBackward0',
                   float_out=True)


@_export()
def floor_divide(input, other):
    return _binary(input, other, np.floor_divide, None, 'FloorDivideBackward0')


@_export()
def remainder(input, other):
    return _binary(input, other, np.mod, lambda g, A, B, o: (g, -g * np.floor(A / B)), 'RemainderBackward0')


@_export()
def fmod(input, other):
    return _binary(input, other, np.fmod, lambda g, A, B, o: (g, -g * np.trunc(A / B)), 'FmodBackward0')


def _pow_back(g, A, B, out):
    ga = np.where(B == 0, 0, g * B * np.power(A, B - 1))
    gb = g * out * np.log(np.where(A > 0, A, np.nan))
    gb = np.where((A == 0) & (B >= 0), 0, gb)
    return ga, gb


@_export('pow', 'float_power')
def pow(input, exponent):
    return _binary(input, exponent, np.power, _pow_back, 'PowBackward0')


def _maxmin_back(g, A, B, out, is_max):
    gt = (A > B) if is_max else (A < B)
    eq = A == B
    return g * (gt + 0.5 * eq), g * ((~gt & ~eq) + 0.5 * eq)


@_export()
def maximum(input, other):
    return _binary(input, other, np.maximum, lambda g, A, B, o: _maxmin_back(g, A, B, o, True), 'MaximumBackward0')


@_export()
def minimum(input, other):
    return _binary(input, other, np.minimum, lambda g, A, B, o: _maxmin_back(g, A, B, o, False), 'MinimumBackward0')


_TORCH['fmax'] = maximum
_TORCH['fmin'] = minimum


@_export('atan2', 'arctan2')
def atan2(input, other):
    def back(g, A, B, o):
        d = A * A + B * B
        return g * B / d, -g * A / d
    return _binary(input, other, np.arctan2, back, 'Atan2Backward0', float_out=True)


@_export()
def logaddexp(input, other):
    def back(g, A, B, o):
        return g * np.exp(A - o), g * np.exp(B - o)
    return _binary(input, other, np.logaddexp, back, 'LogaddexpBackward0', float_out=True)


@_export()
def xlogy(input, other):
    def f(A, B):
        return np.where(A == 0, 0, A * np.log(B))

    def back(g, A, B, o):
        return g * np.where(A == 0, 0, np.log(B)), g * np.where(A == 0, 0, A / B)
    return _binary(input, other, f, back, 'XlogyBackward0', float_out=True)


@_export()
def hypot(input, other):
    return sqrt(input * input + other * other)


@_export()
def eq(input, other):
    return _compare(input, other, np.equal)


@_export()
def ne(input, other):
    return _compare(input, other, np.not_equal)


_TORCH['not_equal'] = ne


@_export('lt', 'less')
def lt(input, other):
    return _compare(input, other, np.less)


@_export('le', 'less_equal')
def le(input, other):
    return _compare(input, other, np.less_equal)


@_export('gt', 'greater')
def gt(input, other):
    return _compare(input, other, np.greater)


@_export('ge', 'greater_equal')
def ge(input, other):
    return _compare(input, other, np.greater_equal)


@_export()
def logical_and(input, other):
    return Tensor._wrap(np.logical_and(_arr(input), _arr(other)))


@_export()
def logical_or(input, other):
    return Tensor._wrap(np.logical_or(_arr(input), _arr(other)))


@_export()
def logical_xor(input, other):
    return Tensor._wrap(np.logical_xor(_arr(input), _arr(other)))


@_export()
def logical_not(input):
    return Tensor._wrap(np.logical_not(_arr(input)))


def _bitwise(f):
    def op(input, other):
        dt = _promote(input, other)
        if _is_float(dt):
            raise RuntimeError("bitwise ops are only supported for integer and boolean tensors")
        return Tensor._wrap(f(_arr(input, dt), _arr(other, dt)))
    return op


bitwise_and = _export('bitwise_and')(_bitwise(np.bitwise_and))
bitwise_or = _export('bitwise_or')(_bitwise(np.bitwise_or))
bitwise_xor = _export('bitwise_xor')(_bitwise(np.bitwise_xor))


@_export()
def bitwise_not(input):
    x = _tens(input)
    return Tensor._wrap(np.invert(x._data))


def _unary(x, f, dfn, name, float_only=True):
    x = _floatify(x) if float_only else _tens(x)
    A = x._data
    with np.errstate(all='ignore'):
        out = np.asarray(f(A))
    if out.dtype != A.dtype and _is_float(A.dtype):
        out = out.astype(A.dtype)
    back = None
    if dfn is not None and _is_float(A.dtype):
        back = lambda g: (dfn(g, A, out),)
    return _result(out, (x,), back, name)


_erf_vec = np.vectorize(math.erf, otypes=[np.float64])


def _erf_np(a):
    return _erf_vec(a).astype(a.dtype) if a.size else a.copy()


_UNARY = {
    # name: (numpy fn, grad fn(g, x, out), float_only)
    'exp': (np.exp, lambda g, x, o: g * o, True),
    'exp2': (np.exp2, lambda g, x, o: g * o * np.log(2.0), True),
    'expm1': (np.expm1, lambda g, x, o: g * (o + 1), True),
    'log': (np.log, lambda g, x, o: g / x, True),
    'log2': (np.log2, lambda g, x, o: g / (x * np.log(2.0)), True),
    'log10': (np.log10, lambda g, x, o: g / (x * np.log(10.0)), True),
    'log1p': (np.log1p, lambda g, x, o: g / (1 + x), True),
    'sqrt': (np.sqrt, lambda g, x, o: g * 0.5 / o, True),
    'rsqrt': (lambda a: 1 / np.sqrt(a), lambda g, x, o: -0.5 * g * o ** 3, True),
    'sin': (np.sin, lambda g, x, o: g * np.cos(x), True),
    'cos': (np.cos, lambda g, x, o: -g * np.sin(x), True),
    'tan': (np.tan, lambda g, x, o: g * (1 + o * o), True),
    'asin': (np.arcsin, lambda g, x, o: g / np.sqrt(1 - x * x), True),
    'acos': (np.arccos, lambda g, x, o: -g / np.sqrt(1 - x * x), True),
    'atan': (np.arctan, lambda g, x, o: g / (1 + x * x), True),
    'sinh': (np.sinh, lambda g, x, o: g * np.cosh(x), True),
    'cosh': (np.cosh, lambda g, x, o: g * np.sinh(x), True),
    'tanh': (np.tanh, lambda g, x, o: g * (1 - o * o), True),
    'asinh': (np.arcsinh, lambda g, x, o: g / np.sqrt(x * x + 1), True),
    'acosh': (np.arccosh, lambda g, x, o: g / np.sqrt(x * x - 1), True),
    'atanh': (np.arctanh, lambda g, x, o: g / (1 - x * x), True),
    'sigmoid': (lambda a: np.where(a >= 0, 1 / (1 + np.exp(-np.abs(a))), np.exp(-np.abs(a)) / (1 + np.exp(-np.abs(a)))),
                lambda g, x, o: g * o * (1 - o), True),
    'erf': (_erf_np, lambda g, x, o: g * (2 / math.sqrt(math.pi)) * np.exp(-x * x), True),
    'erfc': (lambda a: 1 - _erf_np(a), lambda g, x, o: -g * (2 / math.sqrt(math.pi)) * np.exp(-x * x), True),
    'reciprocal': (lambda a: 1 / a, lambda g, x, o: -g * o * o, True),
    'square': (np.square, lambda g, x, o: 2 * g * x, False),
    'neg': (np.negative, lambda g, x, o: -g, False),
    'abs': (np.abs, lambda g, x, o: g * np.sign(x), False),
    'sign': (np.sign, lambda g, x, o: np.zeros_like(g), False),
    'sgn': (np.sign, lambda g, x, o: np.zeros_like(g), False),
    'floor': (np.floor, lambda g, x, o: np.zeros_like(g), False),
    'ceil': (np.ceil, lambda g, x, o: np.zeros_like(g), False),
    'trunc': (np.trunc, lambda g, x, o: np.zeros_like(g), False),
    'fix': (np.trunc, lambda g, x, o: np.zeros_like(g), False),
    'frac': (lambda a: a - np.trunc(a), lambda g, x, o: g, True),
    'relu': (lambda a: np.maximum(a, 0).astype(a.dtype), lambda g, x, o: g * (x > 0), False),
    'logit': (lambda a: np.log(a / (1 - a)), lambda g, x, o: g / (x * (1 - x)), True),
    'i0': (np.i0, None, True),
    'deg2rad': (np.deg2rad, lambda g, x, o: g * (np.pi / 180), True),
    'rad2deg': (np.rad2deg, lambda g, x, o: g * (180 / np.pi), True),
}


def _make_unary(name, f, d, fo):
    def op(input, out=None):
        return _unary(input, f, d, name.capitalize() + 'Backward0', float_only=fo)
    op.__name__ = name
    return op


for _n, (_f, _d, _fo) in _UNARY.items():
    _TORCH[_n] = _make_unary(_n, _f, _d, _fo)
for _alias, _n in [('arcsin', 'asin'), ('arccos', 'acos'), ('arctan', 'atan'), ('arcsinh', 'asinh'),
                   ('arccosh', 'acosh'), ('arctanh', 'atanh'), ('negative', 'neg'), ('absolute', 'abs')]:
    _TORCH[_alias] = _TORCH[_n]

exp = _TORCH['exp']
log = _TORCH['log']
sqrt = _TORCH['sqrt']
tanh = _TORCH['tanh']
sigmoid = _TORCH['sigmoid']
relu = _TORCH['relu']
abs_ = _TORCH['abs']
neg = _TORCH['neg']
log1p = _TORCH['log1p']
erf = _TORCH['erf']


@_export()
def round(input, decimals=0):
    return _unary(input, lambda a: np.round(a, decimals), lambda g, x, o: np.zeros_like(g), 'RoundBackward0',
                  float_only=False)


@_export('clamp', 'clip')
def clamp(input, min=None, max=None):
    x = _tens(input)
    if isinstance(min, Tensor) or isinstance(max, Tensor):
        out = x
        if min is not None:
            out = maximum(out, min)
        if max is not None:
            out = minimum(out, max)
        return out
    if min is None and max is None:
        raise RuntimeError("torch.clamp: At least one of 'min' or 'max' must not be None")
    dt = _promote(x, *(v for v in (min, max) if v is not None))
    A = x._data.astype(dt) if dt != x._data.dtype else x._data
    lo = -np.inf if min is None else min
    hi = np.inf if max is None else max
    out = np.clip(A, lo, hi).astype(dt)

    def back(g):
        return (g * ((A >= lo) & (A <= hi)),)
    return _result(out, (x,), back if _is_float(dt) else None, 'ClampBackward1')


@_export()
def clamp_min(input, min):
    return clamp(input, min=min)


@_export()
def clamp_max(input, max):
    return clamp(input, max=max)


@_export()
def lerp(input, end, weight):
    return input + weight * (end - input)


@_export()
def addcmul(input, tensor1, tensor2, value=1):
    return input + value * tensor1 * tensor2


@_export()
def addcdiv(input, tensor1, tensor2, value=1):
    return input + value * tensor1 / tensor2


@_export()
def nan_to_num(input, nan=0.0, posinf=None, neginf=None):
    x = _tens(input)
    out = np.nan_to_num(x._data, nan=nan, posinf=posinf, neginf=neginf)
    return _result(out, (x,), lambda g: (g * np.isfinite(x._data),), 'NanToNumBackward0')


@_export()
def isnan(input):
    return Tensor._wrap(np.isnan(_arr(input)))


@_export()
def isinf(input):
    return Tensor._wrap(np.isinf(_arr(input)))


@_export()
def isfinite(input):
    return Tensor._wrap(np.isfinite(_arr(input)))


@_export()
def isposinf(input):
    return Tensor._wrap(np.isposinf(_arr(input)))


@_export()
def isneginf(input):
    return Tensor._wrap(np.isneginf(_arr(input)))


@_export()
def isclose(input, other, rtol=1e-05, atol=1e-08, equal_nan=False):
    dt = _promote(input, other)
    return Tensor._wrap(np.isclose(_arr(input, dt), _arr(other, dt), rtol=rtol, atol=atol, equal_nan=equal_nan))


@_export()
def allclose(input, other, rtol=1e-05, atol=1e-08, equal_nan=False):
    dt = _promote(input, other)
    return bool(np.allclose(_arr(input, dt), _arr(other, dt), rtol=rtol, atol=atol, equal_nan=equal_nan))


@_export()
def equal(input, other):
    a, b = _arr(input), _arr(other)
    return a.shape == b.shape and bool(np.array_equal(a, b))


# =============================================================================
# Reductions
# =============================================================================

ReturnTypes = {}


def _rtype(name, fields=('values', 'indices')):
    if name not in ReturnTypes:
        ReturnTypes[name] = collections.namedtuple(name, fields)
    return ReturnTypes[name]


@_export()
def sum(input, dim=None, keepdim=False, dtype=None):
    x = _tens(input)
    A = x._data
    if dtype is not None:
        A = A.astype(_to_np_dtype(dtype))
    elif A.dtype.kind in 'biu':
        A = A.astype(np.int64)
    axes = _dims(dim, A.ndim) if A.ndim else None
    out = A.sum(axis=axes, keepdims=keepdim)
    shape = A.shape
    return _result(out, (x,), lambda g: (_expand_grad(g, shape, axes, keepdim),), 'SumBackward0')


@_export()
def nansum(input, dim=None, keepdim=False, dtype=None):
    x = _tens(input)
    return sum(where(isnan(x), 0.0, x), dim, keepdim, dtype)


def _need_float(x, name):
    if not _is_float(x._data.dtype):
        raise RuntimeError(f"{name}(): could not infer output dtype. Input dtype must be either a floating point "
                           f"or complex dtype. Got: {x.dtype._name.capitalize()}")


@_export()
def mean(input, dim=None, keepdim=False, dtype=None):
    x = _tens(input)
    if dtype is not None:
        x = x.to(dtype)
    _need_float(x, 'mean')
    A = x._data
    axes = _dims(dim, A.ndim) if A.ndim else None
    out = np.asarray(A.mean(axis=axes, keepdims=keepdim), dtype=A.dtype)
    n = A.size / _bmax(out.size, 1) if A.size else 1
    shape = A.shape
    return _result(out, (x,), lambda g: (_expand_grad(g / n, shape, axes, keepdim),), 'MeanBackward0')


@_export()
def nanmean(input, dim=None, keepdim=False):
    x = _tens(input)
    mask = ~isnan(x)
    return sum(where(mask, x, 0.0), dim, keepdim) / sum(mask, dim, keepdim)


def _correction(unbiased, correction):
    if correction is not None:
        return float(correction)
    if unbiased is None:
        return 1.0
    return 1.0 if unbiased else 0.0


@_export()
def var(input, dim=None, unbiased=None, keepdim=False, *, correction=None):
    x = _tens(input)
    if isinstance(dim, builtins.bool):  # var(x, False)
        unbiased, dim = dim, None
    _need_float(x, 'var')
    c = _correction(unbiased, correction)
    A = x._data
    axes = _dims(dim, A.ndim) if A.ndim else None
    m = A.mean(axis=axes, keepdims=True)
    d = A - m
    n = A.size / _bmax(np.asarray(A.sum(axis=axes, keepdims=False)).size, 1)
    denom = _bmax(n - c, 0)
    with np.errstate(all='ignore'):
        out = np.asarray((d * d).sum(axis=axes, keepdims=keepdim) / denom, dtype=A.dtype)
    shape = A.shape
    return _result(out, (x,), lambda g: (_expand_grad(g, shape, axes, keepdim) * 2 * d / denom,), 'VarBackward0')


@_export()
def std(input, dim=None, unbiased=None, keepdim=False, *, correction=None):
    return sqrt(var(input, dim, unbiased, keepdim, correction=correction))


@_export()
def var_mean(input, dim=None, unbiased=None, keepdim=False, *, correction=None):
    return var(input, dim, unbiased, keepdim, correction=correction), mean(input, dim, keepdim)


@_export()
def std_mean(input, dim=None, unbiased=None, keepdim=False, *, correction=None):
    return std(input, dim, unbiased, keepdim, correction=correction), mean(input, dim, keepdim)


@_export()
def prod(input, dim=None, keepdim=False, dtype=None):
    x = _tens(input)
    A = x._data
    if dtype is not None:
        A = A.astype(_to_np_dtype(dtype))
    elif A.dtype.kind in 'biu':
        A = A.astype(np.int64)
    if dim is None:
        out = np.asarray(A.prod())
        ax = None
    else:
        ax = _dim1(dim, A.ndim) if A.ndim else None
        out = np.asarray(A.prod(axis=ax, keepdims=keepdim))

    def back(g):
        a = A.reshape(-1) if ax is None else A
        axis = 0 if ax is None else ax
        ones_shape = list(a.shape)
        ones_shape[axis] = 1
        one = np.ones(ones_shape, dtype=a.dtype)
        left = np.cumprod(np.concatenate([one, a], axis=axis), axis=axis)
        left = np.take(left, range(a.shape[axis]), axis=axis)
        rev = np.flip(a, axis)
        right = np.cumprod(np.concatenate([one, rev], axis=axis), axis=axis)
        right = np.flip(np.take(right, range(a.shape[axis]), axis=axis), axis)
        others = (left * right).reshape(A.shape)
        gg = _expand_grad(g, A.shape, None if ax is None else (ax,), keepdim or ax is None)
        return (gg * others,)
    return _result(out, (x,), back if _is_float(A.dtype) else None, 'ProdBackward0')


def _reduce_ext(x, dim, keepdim, is_max):
    x = _tens(x)
    A = x._data
    if dim is None:
        out = np.asarray(A.max() if is_max else A.min())

        def back(g):
            mask = (A == out)
            return (g * mask / mask.sum(),)
        return _result(out, (x,), back, 'MaxBackward1' if is_max else 'MinBackward1')
    d = _dim1(dim, A.ndim) if A.ndim else None
    if d is None:
        return _rtype('max' if is_max else 'min')(x.clone(), zeros((), dtype=int64))
    idx = (np.argmax if is_max else np.argmin)(A, axis=d)
    idx_k = np.expand_dims(idx, d)
    vals = np.take_along_axis(A, idx_k, axis=d)
    if not keepdim:
        vals = np.squeeze(vals, d)

    def back(g):
        gz = np.zeros(A.shape, dtype=g.dtype)
        gk = g if keepdim else np.expand_dims(g, d)
        np.put_along_axis(gz, idx_k, gk, axis=d)
        return (gz,)
    v = _result(vals, (x,), back, 'MaxBackward0' if is_max else 'MinBackward0')
    i = Tensor._wrap((idx_k if keepdim else idx).astype(np.int64))
    return _rtype('max' if is_max else 'min')(v, i)


@_export()
def max(input, dim=None, keepdim=False, *, out=None):
    if isinstance(dim, Tensor):
        return maximum(input, dim)
    return _reduce_ext(input, dim, keepdim, True)


@_export()
def min(input, dim=None, keepdim=False, *, out=None):
    if isinstance(dim, Tensor):
        return minimum(input, dim)
    return _reduce_ext(input, dim, keepdim, False)


def _amaxmin(input, dim, keepdim, is_max):
    x = _tens(input)
    A = x._data
    axes = _dims(dim, A.ndim) if A.ndim else None
    f = np.max if is_max else np.min
    out = np.asarray(f(A, axis=axes, keepdims=keepdim))

    def back(g):
        ok = np.asarray(f(A, axis=axes, keepdims=True))
        mask = (A == ok)
        cnt = mask.sum(axis=axes, keepdims=True)
        return (_expand_grad(g, A.shape, axes, keepdim) * mask / cnt,)
    return _result(out, (x,), back, 'AmaxBackward0' if is_max else 'AminBackward0')


@_export()
def amax(input, dim=(), keepdim=False):
    return _amaxmin(input, dim if dim != () else None, keepdim, True)


@_export()
def amin(input, dim=(), keepdim=False):
    return _amaxmin(input, dim if dim != () else None, keepdim, False)


@_export()
def argmax(input, dim=None, keepdim=False):
    A = _arr(input)
    if dim is None:
        r = np.asarray(np.argmax(A))
        return Tensor._wrap(r.reshape((1,) * A.ndim) if keepdim else r)
    d = _dim1(dim, A.ndim) if A.ndim else None
    if d is None:
        return zeros((), dtype=int64)
    return Tensor._wrap(np.argmax(A, axis=d, keepdims=keepdim).astype(np.int64))


@_export()
def argmin(input, dim=None, keepdim=False):
    A = _arr(input)
    if dim is None:
        r = np.asarray(np.argmin(A))
        return Tensor._wrap(r.reshape((1,) * A.ndim) if keepdim else r)
    d = _dim1(dim, A.ndim) if A.ndim else None
    if d is None:
        return zeros((), dtype=int64)
    return Tensor._wrap(np.argmin(A, axis=d, keepdims=keepdim).astype(np.int64))


@_export()
def all(input, dim=None, keepdim=False):
    A = _arr(input)
    axes = _dims(dim, A.ndim) if A.ndim else None
    return Tensor._wrap(np.asarray(np.all(A, axis=axes, keepdims=keepdim)))


@_export()
def any(input, dim=None, keepdim=False):
    A = _arr(input)
    axes = _dims(dim, A.ndim) if A.ndim else None
    return Tensor._wrap(np.asarray(np.any(A, axis=axes, keepdims=keepdim)))


@_export()
def count_nonzero(input, dim=None):
    A = _arr(input)
    axes = _dims(dim, A.ndim) if A.ndim else None
    return Tensor._wrap(np.asarray(np.count_nonzero(A, axis=axes), dtype=np.int64))


@_export()
def cumsum(input, dim, dtype=None):
    x = _tens(input)
    A = x._data
    if dtype is not None:
        A = A.astype(_to_np_dtype(dtype))
    elif A.dtype.kind in 'biu':
        A = A.astype(np.int64)
    d = _dim1(dim, A.ndim) if A.ndim else None
    if d is None:
        return x.clone()
    out = np.cumsum(A, axis=d)
    return _result(out, (x,), lambda g: (np.flip(np.cumsum(np.flip(g, d), axis=d), d),), 'CumsumBackward0')


@_export()
def cumprod(input, dim, dtype=None):
    x = _tens(input)
    A = x._data if dtype is None else x._data.astype(_to_np_dtype(dtype))
    d = _dim1(dim, A.ndim) if A.ndim else None
    if d is None:
        return x.clone()
    out = np.cumprod(A, axis=d)

    def back(g):
        r = np.flip(np.cumsum(np.flip(g * out, d), axis=d), d)
        return (r / A,)
    return _result(out, (x,), back, 'CumprodBackward0')


@_export()
def cummax(input, dim):
    x = _tens(input)
    A = x._data
    d = _dim1(dim, A.ndim)
    vals = np.maximum.accumulate(A, axis=d)
    n = A.shape[d]
    ar = np.arange(n).reshape([-1 if i == d else 1 for i in range(A.ndim)])
    idx = np.maximum.accumulate(np.where(A == vals, ar, 0), axis=d)
    return _rtype('cummax')(gather(x, d, Tensor._wrap(idx.astype(np.int64))), Tensor._wrap(idx.astype(np.int64)))


@_export()
def logsumexp(input, dim=None, keepdim=False):
    x = _floatify(input)
    A = x._data
    axes = _dims(dim, A.ndim) if A.ndim else None
    m = np.max(A, axis=axes, keepdims=True)
    m = np.where(np.isfinite(m), m, 0)
    with np.errstate(all='ignore'):
        outk = np.log(np.sum(np.exp(A - m), axis=axes, keepdims=True)) + m
    out = outk if keepdim else (np.squeeze(outk, axes) if axes is not None else outk.reshape(()))

    def back(g):
        return (_expand_grad(g, A.shape, axes, keepdim) * np.exp(A - outk),)
    return _result(np.asarray(out, dtype=A.dtype), (x,), back, 'LogsumexpBackward0')


def _softmax_np(A, d):
    m = np.max(A, axis=d, keepdims=True)
    e = np.exp(A - np.where(np.isfinite(m), m, 0))
    return e / e.sum(axis=d, keepdims=True)


@_export()
def softmax(input, dim=None, dtype=None):
    x = _floatify(input if dtype is None else _tens(input).to(dtype))
    d = _softmax_dim(x, dim)
    with np.errstate(all='ignore'):
        s = _softmax_np(x._data, d)
    return _result(s, (x,), lambda g: (s * (g - (g * s).sum(axis=d, keepdims=True)),), 'SoftmaxBackward0')


@_export()
def log_softmax(input, dim=None, dtype=None):
    x = _floatify(input if dtype is None else _tens(input).to(dtype))
    d = _softmax_dim(x, dim)
    A = x._data
    m = np.max(A, axis=d, keepdims=True)
    m = np.where(np.isfinite(m), m, 0)
    with np.errstate(all='ignore'):
        out = A - m - np.log(np.exp(A - m).sum(axis=d, keepdims=True))
    return _result(out, (x,), lambda g: (g - np.exp(out) * g.sum(axis=d, keepdims=True),), 'LogSoftmaxBackward0')


def _softmax_dim(x, dim):
    nd = x._data.ndim
    if dim is None:
        dim = 0 if nd in (0, 1, 3) else 1
    return _dim1(dim, nd) if nd else 0


@_export()
def norm(input, p='fro', dim=None, keepdim=False, dtype=None):
    x = _floatify(input)
    if p is None or p == 'fro':
        p = 2
    if p == 'nuc':
        return linalg_matrix_norm(x, 'nuc', dim if dim is not None else (-2, -1), keepdim)
    A = x._data
    axes = _dims(dim, A.ndim) if A.ndim else None
    if p == 2:
        out = np.sqrt(np.sum(A * A, axis=axes, keepdims=keepdim))
        outk = np.sqrt(np.sum(A * A, axis=axes, keepdims=True))

        def back(g):
            with np.errstate(all='ignore'):
                r = np.where(outk == 0, 0, A / outk)
            return (_expand_grad(g, A.shape, axes, keepdim) * r,)
        return _result(np.asarray(out, dtype=A.dtype), (x,), back, 'NormBackward1')
    if p == float('inf'):
        return amax(x.abs(), dim=dim, keepdim=keepdim)
    if p == float('-inf'):
        return amin(x.abs(), dim=dim, keepdim=keepdim)
    if p == 0:
        return (x != 0).to(x.dtype).sum(dim=dim, keepdim=keepdim)
    if p == 1:
        return x.abs().sum(dim=dim, keepdim=keepdim)
    return (x.abs() ** p).sum(dim=dim, keepdim=keepdim) ** (1.0 / p)


@_export()
def dist(input, other, p=2):
    return norm(input - other, p)


@_export()
def median(input, dim=None, keepdim=False):
    x = _tens(input)
    if dim is None:
        flat = x.reshape(-1)
        s = np.argsort(flat._data, kind='stable')
        k = (flat._data.size - 1) // 2
        return flat[int(s[k])]
    d = _dim1(dim, x.ndim)
    s = np.argsort(x._data, axis=d, kind='stable')
    k = (x._data.shape[d] - 1) // 2
    idx = np.take(s, [k], axis=d)
    vals = gather(x, d, Tensor._wrap(idx))
    if not keepdim:
        vals, idx = vals.squeeze(d), np.squeeze(idx, d)
    return _rtype('median')(vals, Tensor._wrap(idx.astype(np.int64)))


@_export()
def mode(input, dim=-1, keepdim=False):
    A = _arr(input)
    d = _dim1(dim, A.ndim)
    moved = np.moveaxis(A, d, -1)
    flat = moved.reshape(-1, moved.shape[-1])
    vals, idxs = [], []
    for row in flat:
        u, c = np.unique(row, return_counts=True)
        v = u[np.argmax(c)]
        vals.append(v)
        idxs.append(np.nonzero(row == v)[0][-1])
    vals = np.array(vals, dtype=A.dtype).reshape(moved.shape[:-1])
    idxs = np.array(idxs, dtype=np.int64).reshape(moved.shape[:-1])
    if keepdim:
        vals, idxs = np.expand_dims(vals, d), np.expand_dims(idxs, d)
    return _rtype('mode')(Tensor._wrap(vals), Tensor._wrap(idxs))


@_export()
def quantile(input, q, dim=None, keepdim=False, interpolation='linear'):
    x = _floatify(input)
    qa = _arr(q, np.float64)
    out = np.quantile(x._data, qa, axis=dim, keepdims=keepdim, method=interpolation)
    return Tensor._wrap(np.asarray(out, dtype=x._data.dtype))


@_export()
def sort(input, dim=-1, descending=False, stable=False):
    x = _tens(input)
    A = x._data
    if A.ndim == 0:
        return _rtype('sort')(x.clone(), zeros((), dtype=int64))
    d = _dim1(dim, A.ndim)
    key = A
    if descending:
        key = ~A if A.dtype == np.bool_ else -A.astype(np.float64) if A.dtype.kind == 'u' else -A
    idx = np.argsort(key, axis=d, kind='stable').astype(np.int64)
    it = Tensor._wrap(idx)
    return _rtype('sort')(gather(x, d, it), it)


@_export()
def argsort(input, dim=-1, descending=False, stable=False):
    return sort(input, dim, descending)[1]


@_export()
def msort(input):
    return sort(input, 0)[0]


@_export()
def topk(input, k, dim=-1, largest=True, sorted=True):
    x = _tens(input)
    d = _dim1(dim, x.ndim) if x.ndim else 0
    v, i = sort(x, d, descending=largest)
    i = i.narrow(d, 0, k) if x.ndim else i
    return _rtype('topk')(gather(x, d, i) if x.ndim else v, i)


@_export()
def kthvalue(input, k, dim=-1, keepdim=False):
    x = _tens(input)
    d = _dim1(dim, x.ndim)
    v, i = sort(x, d)
    i = i.narrow(d, k - 1, 1)
    vals = gather(x, d, i)
    if not keepdim:
        vals, i = vals.squeeze(d), i.squeeze(d)
    return _rtype('kthvalue')(vals, i)


@_export()
def unique(input, sorted=True, return_inverse=False, return_counts=False, dim=None):
    A = _arr(input)
    res = np.unique(A, return_inverse=return_inverse, return_counts=return_counts, axis=dim)
    if not isinstance(res, tuple):
        return Tensor._wrap(res)
    out = [Tensor._wrap(res[0])]
    k = 1
    if return_inverse:
        out.append(Tensor._wrap(res[k].reshape(A.shape if dim is None else -1).astype(np.int64)))
        k += 1
    if return_counts:
        out.append(Tensor._wrap(res[k].astype(np.int64)))
    return tuple(out)


@_export()
def unique_consecutive(input, return_inverse=False, return_counts=False, dim=None):
    A = _arr(input).reshape(-1)
    if A.size == 0:
        return Tensor._wrap(A)
    keep = np.concatenate([[True], A[1:] != A[:-1]])
    out = [Tensor._wrap(A[keep])]
    if return_inverse:
        out.append(Tensor._wrap(np.cumsum(keep) - 1))
    if return_counts:
        starts = np.nonzero(keep)[0]
        out.append(Tensor._wrap(np.diff(np.append(starts, A.size)).astype(np.int64)))
    return out[0] if len(out) == 1 else tuple(out)


@_export()
def bincount(input, weights=None, minlength=0):
    A = _arr(input)
    w = None if weights is None else _arr(weights)
    # np.bincount casts 'safe' to intp, which is int32 on wasm32 (Pyodide).
    r = np.bincount(A.astype(np.intp), weights=w, minlength=minlength)
    return Tensor._wrap(r.astype(np.int64) if w is None else r.astype(w.dtype if _is_float(w.dtype) else np.float64))


@_export()
def histc(input, bins=100, min=0, max=0):
    A = _arr(input)
    lo, hi = (min, max) if (min != 0 or max != 0) else (A.min(), A.max())
    h, _ = np.histogram(A, bins=bins, range=(lo, hi))
    return Tensor._wrap(h.astype(A.dtype))


@_export()
def searchsorted(sorted_sequence, values, right=False, side=None, out_int32=False):
    s = _arr(sorted_sequence)
    v = _arr(values)
    side = side or ('right' if right else 'left')
    if s.ndim == 1:
        r = np.searchsorted(s, v, side=side)
    else:
        r = np.stack([np.searchsorted(a, b, side=side) for a, b in zip(s.reshape(-1, s.shape[-1]),
                                                                          v.reshape(-1, v.shape[-1]))]).reshape(v.shape)
    return Tensor._wrap(np.asarray(r, dtype=np.int32 if out_int32 else np.int64))


@_export()
def bucketize(input, boundaries, right=False, out_int32=False):
    return searchsorted(boundaries, input, right=right, out_int32=out_int32)


@_export()
def diff(input, n=1, dim=-1):
    x = _tens(input)
    d = _dim1(dim, x.ndim)
    for _ in range(n):
        L = x.shape[d]
        x = x.narrow(d, 1, L - 1) - x.narrow(d, 0, L - 1)
    return x


# =============================================================================
# Shape operations
# =============================================================================

@_export()
def reshape(input, *shape):
    x = _tens(input)
    shape = _size_args(shape)
    A = x._data
    try:
        out = A.reshape(shape)
    except ValueError:
        raise RuntimeError(f"shape '[{', '.join(str(s) for s in shape)}]' is invalid for input of size {A.size}")
    return _result(out, (x,), lambda g: (g.reshape(A.shape),), 'ViewBackward0')


@_export()
def permute(input, *dims):
    x = _tens(input)
    dims = _size_args(dims)
    nd = x._data.ndim
    if len(dims) != nd:
        raise RuntimeError(f"permute(sparse_coo): number of dimensions in the tensor input does not match the length "
                           f"of the desired ordering of dimensions i.e. input.dim() = {nd} is not equal to "
                           f"len(dims) = {len(dims)}")
    dims = tuple(d % nd for d in dims) if nd else ()
    inv = tuple(np.argsort(dims))
    return _result(np.transpose(x._data, dims), (x,), lambda g: (np.transpose(g, inv),), 'PermuteBackward0')


@_export('transpose', 'swapaxes', 'swapdims')
def transpose(input, dim0, dim1):
    x = _tens(input)
    nd = x._data.ndim
    if nd == 0:
        return x
    d0, d1 = _dim1(dim0, nd), _dim1(dim1, nd)
    return _result(np.swapaxes(x._data, d0, d1), (x,), lambda g: (np.swapaxes(g, d0, d1),), 'TransposeBackward0')


@_export()
def t(input):
    x = _tens(input)
    if x._data.ndim > 2:
        raise RuntimeError(f"t() expects a tensor with <= 2 dimensions, but self is {x._data.ndim}D")
    return transpose(x, 0, 1) if x._data.ndim == 2 else x


@_export()
def adjoint(input):
    return transpose(input, -2, -1)


@_export('movedim', 'moveaxis')
def movedim(input, source, destination):
    x = _tens(input)
    out = np.moveaxis(x._data, source, destination)
    return _result(out, (x,), lambda g: (np.moveaxis(g, destination, source),), 'MovedimBackward0')


@_export()
def squeeze(input, dim=None):
    x = _tens(input)
    A = x._data
    if dim is None:
        axes = tuple(i for i, s in enumerate(A.shape) if s == 1)
    else:
        axes = tuple(d for d in (_dims(dim, A.ndim) or ()) if A.ndim and A.shape[d] == 1)
    return reshape(x, tuple(s for i, s in enumerate(A.shape) if i not in axes))


@_export()
def unsqueeze(input, dim):
    x = _tens(input)
    nd = x._data.ndim
    if not -nd - 1 <= dim <= nd:
        raise IndexError(f"Dimension out of range (expected to be in range of [{-nd - 1}, {nd}], but got {dim})")
    d = dim % (nd + 1)
    shape = list(x._data.shape)
    shape.insert(d, 1)
    return reshape(x, shape)


@_export()
def flatten(input, start_dim=0, end_dim=-1):
    x = _tens(input)
    shp = x._data.shape
    if len(shp) == 0:
        return reshape(x, (1,))
    s, e = start_dim % len(shp), end_dim % len(shp)
    if s > e:
        raise RuntimeError("flatten() has invalid args: start_dim cannot come after end_dim")
    new = shp[:s] + (int(np.prod(shp[s:e + 1])),) + shp[e + 1:]
    return reshape(x, new)


@_export()
def unflatten(input, dim, sizes):
    x = _tens(input)
    shp = list(x._data.shape)
    d = _dim1(dim, len(shp))
    sizes = list(sizes)
    if -1 in sizes:
        known = int(np.prod([s for s in sizes if s != -1]))
        sizes[sizes.index(-1)] = shp[d] // known
    return reshape(x, shp[:d] + sizes + shp[d + 1:])


@_export()
def ravel(input):
    return reshape(input, (-1,))


def _expand(input, *sizes):
    x = _tens(input)
    sizes = _size_args(sizes)
    A = x._data
    nd_new = len(sizes)
    if nd_new < A.ndim:
        raise RuntimeError("expand: the number of sizes provided must be greater or equal to the number of "
                           "dimensions in the tensor")
    full = (1,) * (nd_new - A.ndim) + A.shape
    target = tuple(f if s == -1 else s for s, f in zip(sizes, full))
    for f, s in zip(full, target):
        if f != 1 and f != s:
            raise RuntimeError(f"The expanded size of the tensor ({s}) must match the existing size ({f}) at "
                               f"non-singleton dimension. Target sizes: {list(sizes)}. Tensor sizes: {list(A.shape)}")
    return _result(np.broadcast_to(A, target), (x,), lambda g: (g,), 'ExpandBackward0')


@_export()
def broadcast_to(input, size):
    return _expand(input, *size)


@_export()
def broadcast_tensors(*tensors):
    shape = np.broadcast_shapes(*[_tens(t)._data.shape for t in tensors])
    return tuple(_expand(t, *shape) for t in tensors)


@_export()
def broadcast_shapes(*shapes):
    return Size(np.broadcast_shapes(*[tuple(s) if not isinstance(s, int) else (s,) for s in shapes]))


def _repeat(input, *sizes):
    x = _tens(input)
    sizes = _size_args(sizes)
    A = x._data
    if len(sizes) < A.ndim:
        raise RuntimeError("Number of dimensions of repeat dims can not be smaller than number of dimensions of tensor")
    A2 = A.reshape((1,) * (len(sizes) - A.ndim) + A.shape)
    out = np.tile(A2, sizes)

    def back(g):
        inter = []
        for r, s in zip(sizes, A2.shape):
            inter += [r, s]
        gg = g.reshape(inter).sum(axis=tuple(range(0, 2 * len(sizes), 2)))
        return (gg.reshape(A.shape),)
    return _result(out, (x,), back, 'RepeatBackward0')


@_export('cat', 'concat', 'concatenate')
def cat(tensors, dim=0, out=None):
    ts = [_tens(t) for t in tensors]
    ts_ne = [t for t in ts if not (t._data.ndim == 1 and t._data.shape[0] == 0)] or ts[:1]
    if not ts_ne:
        raise RuntimeError("torch.cat(): expected a non-empty list of Tensors")
    nd = ts_ne[0]._data.ndim
    if nd == 0:
        raise RuntimeError("zero-dimensional tensor (at position 0) cannot be concatenated")
    d = _dim1(dim, nd)
    dt = _promote(*ts_ne)
    arrs = [t._data.astype(dt, copy=False) for t in ts_ne]
    try:
        out = np.concatenate(arrs, axis=d)
    except ValueError:
        raise RuntimeError(f"Sizes of tensors must match except in dimension {d}. Got shapes "
                           f"{[list(a.shape) for a in arrs]}")
    sizes = np.cumsum([a.shape[d] for a in arrs])[:-1]
    return _result(out, tuple(ts_ne), lambda g: tuple(np.split(g, sizes, axis=d)), 'CatBackward0')


@_export()
def stack(tensors, dim=0, out=None):
    ts = [_tens(t) for t in tensors]
    if not ts:
        raise RuntimeError("stack expects a non-empty TensorList")
    shp = ts[0]._data.shape
    for t in ts:
        if t._data.shape != shp:
            raise RuntimeError(f"stack expects each tensor to be equal size, but got {list(shp)} at entry 0 and "
                               f"{list(t._data.shape)} at entry {ts.index(t)}")
    nd = len(shp) + 1
    d = dim % nd
    return cat([unsqueeze(t, d) for t in ts], d)


@_export()
def hstack(tensors):
    ts = [_tens(t) for t in tensors]
    return cat(ts, 0 if ts[0].ndim == 1 else 1)


@_export('vstack', 'row_stack')
def vstack(tensors):
    return cat([atleast_2d(t) for t in tensors], 0)


@_export()
def dstack(tensors):
    return cat([t.reshape(1, -1, 1) if t.ndim == 1 else (t.unsqueeze(-1) if t.ndim == 2 else t) for t in
                (_tens(x) for x in tensors)], 2)


@_export()
def column_stack(tensors):
    return cat([t.reshape(-1, 1) if t.ndim <= 1 else t for t in (_tens(x) for x in tensors)], 1)


@_export()
def atleast_1d(t):
    t = _tens(t)
    return t.reshape(1) if t.ndim == 0 else t


@_export()
def atleast_2d(t):
    t = _tens(t)
    return t.reshape(1, -1) if t.ndim < 2 else t


@_export()
def narrow(input, dim, start, length):
    x = _tens(input)
    d = _dim1(dim, x._data.ndim)
    start = int(start)
    if start < 0:
        start += x._data.shape[d]
    idx = [slice(None)] * x._data.ndim
    idx[d] = slice(start, start + int(length))
    return x[tuple(idx)]


@_export()
def select(input, dim, index):
    x = _tens(input)
    d = _dim1(dim, x._data.ndim)
    idx = [slice(None)] * x._data.ndim
    idx[d] = int(index)
    return x[tuple(idx)]


@_export()
def chunk(input, chunks, dim=0):
    x = _tens(input)
    d = _dim1(dim, x._data.ndim)
    n = x._data.shape[d]
    size = -(-n // chunks) if n else 0
    if size == 0:
        return tuple(x for _ in range(1))
    return tuple(narrow(x, d, s, _bmin(size, n - s)) for s in range(0, n, size))


@_export()
def split(tensor, split_size_or_sections, dim=0):
    x = _tens(tensor)
    d = _dim1(dim, x._data.ndim)
    n = x._data.shape[d]
    if isinstance(split_size_or_sections, int):
        s = split_size_or_sections
        return tuple(narrow(x, d, i, _bmin(s, n - i)) for i in range(0, n, s))
    sizes = list(split_size_or_sections)
    if _bsum(sizes) != n:
        raise RuntimeError(f"split_with_sizes expects split_sizes to sum exactly to {n} (input tensor's size at "
                           f"dimension {d}), but got split_sizes={sizes}")
    out, start = [], 0
    for s in sizes:
        out.append(narrow(x, d, start, s))
        start += s
    return tuple(out)


@_export()
def tensor_split(input, indices_or_sections, dim=0):
    x = _tens(input)
    d = _dim1(dim, x.ndim)
    n = x.shape[d]
    if isinstance(indices_or_sections, int):
        k = indices_or_sections
        sizes = [n // k + (1 if i < n % k else 0) for i in range(k)]
        return split(x, sizes, d)
    bounds = [0] + list(indices_or_sections) + [n]
    return tuple(narrow(x, d, a, b - a) for a, b in zip(bounds[:-1], bounds[1:]))


@_export()
def unbind(input, dim=0):
    x = _tens(input)
    d = _dim1(dim, x._data.ndim)
    return tuple(select(x, d, i) for i in range(x._data.shape[d]))


def _along_index(idx, d):
    """Index arrays so that A[result] == take_along_axis-style gather along d."""
    grids = np.ogrid[tuple(slice(0, s) for s in idx.shape)]
    grids = list(grids)
    grids[d] = idx
    return tuple(grids)


@_export()
def gather(input, dim, index, sparse_grad=False):
    x = _tens(input)
    A = x._data
    idx = _arr(index)
    if idx.dtype.kind not in 'iu':
        raise RuntimeError("gather(): Expected dtype int64 for index")
    d = _dim1(dim, A.ndim) if A.ndim else 0
    if idx.ndim != A.ndim:
        raise RuntimeError("Index tensor must have the same number of dimensions as input tensor")
    ix = _along_index(idx, d) if A.ndim else ()
    out = A[ix] if A.ndim else A.copy()

    def back(g):
        gz = np.zeros(A.shape, dtype=g.dtype)
        np.add.at(gz, ix, g)
        return (gz,)
    return _result(np.asarray(out), (x,), back, 'GatherBackward0')


@_export()
def take_along_dim(input, indices, dim=None):
    if dim is None:
        return gather(_tens(input).reshape(-1), 0, _tens(indices).reshape(-1))
    x, i = _tens(input), _tens(indices)
    shape = list(np.broadcast_shapes(x.shape, i.shape))
    d = _dim1(dim, x.ndim)
    s_i = list(shape)
    s_i[d] = i.shape[d]
    s_x = list(shape)
    s_x[d] = x.shape[d]
    return gather(_expand(x, *s_x), d, Tensor._wrap(np.broadcast_to(i._data, s_i)))


@_export()
def take(input, index):
    return _tens(input).reshape(-1)[_tens(index)]


@_export()
def scatter(input, dim, index, src=None, value=None, reduce=None):
    x = _tens(input)
    A = x._data
    idx = _arr(index)
    d = _dim1(dim, A.ndim)
    ix = _along_index(idx, d)
    if src is None:
        src = value
    src_t = src if isinstance(src, Tensor) else None
    if isinstance(src, Tensor):
        S = src._data[tuple(slice(0, s) for s in idx.shape)].astype(A.dtype)
    else:
        S = np.full(idx.shape, src, dtype=A.dtype)
    out = A.copy()
    if reduce in ('add', 'sum'):
        np.add.at(out, ix, S)
    elif reduce in ('multiply', 'prod'):
        np.multiply.at(out, ix, S)
    else:
        out[ix] = S

    def back(g):
        gs = g.copy()
        if reduce is None:
            gs[ix] = 0
        gsrc = None
        if src_t is not None:
            gsrc = np.zeros(src_t._data.shape, dtype=g.dtype)
            gsrc[tuple(slice(0, s) for s in idx.shape)] = g[ix]
        return gs, gsrc
    return _result(out, (x, src_t), back if reduce in (None, 'add', 'sum') else None, 'ScatterBackward0')


@_export()
def scatter_add(input, dim, index, src):
    return scatter(input, dim, index, src, reduce='add')


@_export()
def scatter_reduce(input, dim, index, src, reduce, include_self=True):
    x = _tens(input)
    A = x._data
    idx = _arr(index)
    d = _dim1(dim, A.ndim)
    ix = _along_index(idx, d)
    S = _arr(src)[tuple(slice(0, s) for s in idx.shape)].astype(A.dtype)
    out = A.copy()
    if reduce == 'sum':
        if not include_self:
            out[ix] = 0
        np.add.at(out, ix, S)
    elif reduce == 'prod':
        if not include_self:
            out[ix] = 1
        np.multiply.at(out, ix, S)
    elif reduce in ('amax', 'amin'):
        if not include_self:
            out[ix] = -np.inf if reduce == 'amax' else np.inf
        (np.maximum if reduce == 'amax' else np.minimum).at(out, ix, S)
    elif reduce == 'mean':
        cnt = np.ones_like(A) if include_self else np.zeros_like(A)
        if not include_self:
            out[ix] = 0
        np.add.at(out, ix, S)
        np.add.at(cnt, ix, 1)
        out = out / np.maximum(cnt, 1)
        if A.dtype.kind in 'iu':
            out = np.floor(out)
        out = out.astype(A.dtype)
    else:
        raise RuntimeError(f"reduce argument must be either sum, prod, mean, amax or amin, got {reduce}")
    return Tensor._wrap(out)


@_export()
def index_select(input, dim, index):
    x = _tens(input)
    A = x._data
    # intp, not int64: np.take casts indices 'safe' to intp, int32 on wasm32 (Pyodide).
    idx = _arr(index).reshape(-1).astype(np.intp)
    d = _dim1(dim, A.ndim) if A.ndim else 0
    out = np.take(A, idx, axis=d) if A.ndim else A[idx]

    def back(g):
        gz = np.zeros(A.shape, dtype=g.dtype)
        np.add.at(np.moveaxis(gz, d, 0), idx, np.moveaxis(g, d, 0))
        return (gz,)
    return _result(out, (x,), back, 'IndexSelectBackward0')


@_export()
def index_add(input, dim, index, source, alpha=1):
    x = _tens(input)
    d = _dim1(dim, x.ndim)
    idx = _arr(index).reshape(-1).astype(np.intp)  # see index_select
    src = _tens(source) * alpha if alpha != 1 else _tens(source)
    A = x._data
    out = A.copy()
    np.add.at(np.moveaxis(out, d, 0), idx, np.moveaxis(src._data.astype(A.dtype), d, 0))

    def back(g):
        return g, np.take(g, idx, axis=d)
    return _result(out, (x, src), back, 'IndexAddBackward0')


@_export()
def index_fill(input, dim, index, value):
    x = _tens(input)
    d = _dim1(dim, x.ndim)
    idx = [slice(None)] * x.ndim
    idx[d] = _arr(index).reshape(-1)
    out = x.clone()
    with no_grad():
        pass
    out[tuple(idx)] = value
    return out


@_export()
def index_copy(input, dim, index, source):
    x = _tens(input)
    d = _dim1(dim, x.ndim)
    idx = [slice(None)] * x.ndim
    idx[d] = _arr(index).reshape(-1)
    out = x.clone()
    out[tuple(idx)] = source
    return out


@_export()
def masked_fill(input, mask, value):
    x = _tens(input)
    A = x._data
    M = _arr(mask).astype(bool)
    if isinstance(value, Tensor) and value._data.ndim != 0:
        raise RuntimeError("masked_fill_ only supports a 0-dimensional value tensor, but got tensor with "
                           f"{value._data.ndim} dimension(s).")
    V = _arr(value, A.dtype)
    out = np.where(M, V, A)
    if out.shape != A.shape:
        raise RuntimeError(f"masked_fill: mask of shape {list(M.shape)} is not broadcastable to {list(A.shape)}")
    vt = value if isinstance(value, Tensor) else None
    return _result(out, (x, vt), lambda g: (np.where(M, 0, g), np.where(M, g, 0).sum()), 'MaskedFillBackward0')


@_export()
def masked_select(input, mask):
    x = _tens(input)
    M = _arr(mask).astype(bool)
    shape = np.broadcast_shapes(x._data.shape, M.shape)
    return _expand(x, *shape)[np.broadcast_to(M, shape)]


@_export()
def masked_scatter(input, mask, source):
    x = _tens(input)
    M = np.broadcast_to(_arr(mask).astype(bool), x._data.shape)
    out = x.clone()
    out[M] = _tens(source).reshape(-1)[:int(M.sum())]
    return out


@_export()
def where(condition, input=None, other=None):
    C = _arr(condition).astype(bool)
    if input is None and other is None:
        return tuple(Tensor._wrap(i.astype(np.int64)) for i in np.nonzero(C))
    dt = _promote(input, other)
    A, B = _arr(input, dt), _arr(other, dt)
    out = np.where(C, A, B)
    back = lambda g: (np.where(C, g, 0), np.where(C, 0, g))
    return _result(out, (_tparent(input), _tparent(other)), back if _is_float(dt) else None, 'WhereBackward0')


@_export()
def nonzero(input, as_tuple=False):
    A = _arr(input)
    nz = np.nonzero(A)
    if as_tuple:
        return tuple(Tensor._wrap(i.astype(np.int64)) for i in nz)
    return Tensor._wrap(np.stack(nz, axis=1).astype(np.int64) if A.ndim else np.zeros((int(bool(A)), 0), np.int64))


@_export()
def argwhere(input):
    return nonzero(input)


@_export()
def tril(input, diagonal=0):
    x = _tens(input)
    return _result(np.tril(x._data, diagonal), (x,), lambda g: (np.tril(g, diagonal),), 'TrilBackward0')


@_export()
def triu(input, diagonal=0):
    x = _tens(input)
    return _result(np.triu(x._data, diagonal), (x,), lambda g: (np.triu(g, diagonal),), 'TriuBackward0')


@_export()
def flip(input, dims):
    x = _tens(input)
    if isinstance(dims, int):
        dims = (dims,)
    axes = _dims(tuple(dims), x._data.ndim)
    return _result(np.flip(x._data, axes), (x,), lambda g: (np.flip(g, axes),), 'FlipBackward0')


@_export()
def fliplr(input):
    return flip(input, (1,))


@_export()
def flipud(input):
    return flip(input, (0,))


@_export()
def roll(input, shifts, dims=None):
    x = _tens(input)
    if dims is None:
        flat = x.reshape(-1)
        out = np.roll(flat._data, shifts)
        r = _result(out, (flat,), lambda g: (np.roll(g, -np.asarray(shifts)),), 'RollBackward0')
        return r.reshape(x.shape)
    neg = tuple(-s for s in shifts) if isinstance(shifts, (tuple, list)) else -shifts
    return _result(np.roll(x._data, shifts, dims), (x,), lambda g: (np.roll(g, neg, dims),), 'RollBackward0')


@_export()
def rot90(input, k=1, dims=(0, 1)):
    x = _tens(input)
    return _result(np.rot90(x._data, k, dims), (x,), lambda g: (np.rot90(g, -k, dims),), 'Rot90Backward0')


@_export()
def repeat_interleave(input, repeats=None, dim=None, output_size=None):
    x = _tens(input)
    if repeats is None:  # repeat_interleave(repeats_tensor)
        r = x._data
        return Tensor._wrap(np.repeat(np.arange(len(r)), r.astype(np.intp)).astype(np.int64))
    if dim is None:
        x = x.reshape(-1)
        dim = 0
    d = _dim1(dim, x._data.ndim)
    rep = _arr(repeats).astype(np.intp) if isinstance(repeats, Tensor) else repeats  # see index_select
    idx = np.repeat(np.arange(x._data.shape[d]), rep)
    return index_select(x, d, Tensor._wrap(idx.astype(np.int64)))


def _unfold(input, dimension, size, step):
    x = _tens(input)
    A = x._data
    d = _dim1(dimension, A.ndim) if A.ndim else 0
    n = A.shape[d] if A.ndim else 1
    starts = np.arange(0, n - size + 1, step)
    index = starts[:, None] + np.arange(size)[None, :]
    taken = np.take(A, index, axis=d)  # shape: pre + (W, size) + post
    out = np.moveaxis(taken, d + 1, -1)

    def back(g):
        gz = np.zeros(A.shape, dtype=g.dtype)
        gt = np.moveaxis(g, -1, d + 1)  # pre + (W, size) + post
        gt = np.moveaxis(np.moveaxis(gt, d, 0), d + 1, 1)  # (W, size) + pre + post
        np.add.at(np.moveaxis(gz, d, 0), index, gt)
        return (gz,)
    return _result(out, (x,), back, 'UnfoldBackward0')


@_export()
def diag(input, diagonal=0):
    x = _tens(input)
    A = x._data
    if A.ndim == 1:
        out = np.diag(A, diagonal)
        return _result(out, (x,), lambda g: (np.diag(g, diagonal).copy(),), 'DiagBackward0')
    if A.ndim == 2:
        out = np.diag(A, diagonal).copy()
        return _result(out, (x,), lambda g: (_diag_place(g, A.shape, diagonal),), 'DiagBackward0')
    raise RuntimeError("diag(): Supports 1D or 2D tensors. Got %dD" % A.ndim)


def _diag_place(g, shape, k):
    gz = np.zeros(shape, dtype=g.dtype)
    n = len(g)
    r = np.arange(n) + (_bmax(-k, 0))
    c = np.arange(n) + (_bmax(k, 0))
    gz[r, c] = g
    return gz


@_export()
def diagonal(input, offset=0, dim1=0, dim2=1):
    x = _tens(input)
    A = x._data
    d1, d2 = _dim1(dim1, A.ndim), _dim1(dim2, A.ndim)
    out = np.diagonal(A, offset, d1, d2).copy()

    def back(g):
        gz = np.zeros(A.shape, dtype=g.dtype)
        gm = np.moveaxis(gz, (d1, d2), (-2, -1))
        n = g.shape[-1]
        r = np.arange(n) + _bmax(-offset, 0)
        c = np.arange(n) + _bmax(offset, 0)
        gm[..., r, c] = g
        return (gz,)
    return _result(out, (x,), back, 'DiagonalBackward0')


@_export()
def diag_embed(input, offset=0, dim1=-2, dim2=-1):
    x = _tens(input)
    n = x.shape[-1] + _babs(offset)
    eye_ = Tensor._wrap(np.eye(n, k=offset, dtype=x._data.dtype))
    padded = x
    if offset:
        idx = np.arange(x.shape[-1]) + _bmax(-offset, 0)
        out = zeros(*x.shape[:-1], n, n, dtype=x.dtype)
        r, c = idx, idx + offset
        out = out.clone()
        out[..., r, c] = x
        return out
    return padded.unsqueeze(-1) * eye_


@_export()
def trace(input):
    x = _tens(input)
    A = x._data
    return _result(np.asarray(np.trace(A)), (x,), lambda g: (g * np.eye(*A.shape, dtype=A.dtype),), 'TraceBackward0')


@_export()
def meshgrid(*tensors, indexing='ij'):
    if len(tensors) == 1 and isinstance(tensors[0], (list, tuple)):
        tensors = tensors[0]
    ts = [_tens(t) for t in tensors]
    n = len(ts)
    shape = [t.numel() for t in ts]
    if indexing == 'xy' and n >= 2:
        shape[0], shape[1] = shape[1], shape[0]
    out = []
    for i, t in enumerate(ts):
        view = [1] * n
        pos = i
        if indexing == 'xy' and n >= 2 and i < 2:
            pos = 1 - i
        view[pos] = -1
        out.append(_expand(t.reshape(view), *shape))
    return tuple(out)


@_export()
def cartesian_prod(*tensors):
    grids = meshgrid(*tensors, indexing='ij')
    return stack([g.reshape(-1) for g in grids], 1) if len(grids) > 1 else grids[0]


@_export()
def block_diag(*tensors):
    ts = [atleast_2d(t) for t in tensors]
    R = _bsum(t.shape[0] for t in ts)
    C = _bsum(t.shape[1] for t in ts)
    out = zeros(R, C, dtype=_to_torch_dtype(_promote(*ts)))
    r = c = 0
    for t in ts:
        out[r:r + t.shape[0], c:c + t.shape[1]] = t
        r += t.shape[0]
        c += t.shape[1]
    return out


# =============================================================================
# Linear algebra
# =============================================================================

@_export()
def matmul(input, other):
    a, b = _tens(input), _tens(other)
    if a._data.ndim == 0 or b._data.ndim == 0:
        raise RuntimeError("both arguments to matmul need to be at least 1D, but they are "
                           f"{a._data.ndim}D and {b._data.ndim}D")
    dt = _promote(a, b)
    A, B = a._data.astype(dt, copy=False), b._data.astype(dt, copy=False)
    A2 = A[None, :] if A.ndim == 1 else A
    B2 = B[:, None] if B.ndim == 1 else B
    if A2.shape[-1] != B2.shape[-2]:
        if A.ndim <= 2 and B.ndim <= 2:
            raise RuntimeError(f"mat1 and mat2 shapes cannot be multiplied ({A2.shape[0]}x{A2.shape[1]} and "
                               f"{B2.shape[0]}x{B2.shape[1]})")
        raise RuntimeError(f"Expected size for first two dimensions of batch2 tensor to match: shapes "
                           f"{list(A.shape)} and {list(B.shape)} cannot be multiplied")
    out2 = np.matmul(A2, B2)
    out = out2
    if A.ndim == 1:
        out = out[..., 0, :]
    if B.ndim == 1:
        out = out[..., 0]

    def back(g):
        g2 = g.reshape(out2.shape)
        ga = np.matmul(g2, np.swapaxes(B2, -1, -2))
        gb = np.matmul(np.swapaxes(A2, -1, -2), g2)
        ga = _unbroadcast(ga, A2.shape).reshape(A.shape)
        gb = _unbroadcast(gb, B2.shape).reshape(B.shape)
        return ga, gb
    return _result(out, (a, b), back if _is_float(dt) else None, 'MmBackward0')


@_export()
def mm(input, mat2):
    if _tens(input).ndim != 2 or _tens(mat2).ndim != 2:
        raise RuntimeError("mm: both arguments must be 2D matrices")
    return matmul(input, mat2)


@_export()
def bmm(input, mat2):
    a, b = _tens(input), _tens(mat2)
    if a.ndim != 3 or b.ndim != 3:
        raise RuntimeError("batch1 must be a 3D tensor")
    if a.shape[0] != b.shape[0]:
        raise RuntimeError("batch1 and batch2 must have same number of batches")
    return matmul(a, b)


@_export()
def mv(input, vec):
    return matmul(input, vec)


@_export()
def dot(input, other):
    a, b = _tens(input), _tens(other)
    if a.ndim != 1 or b.ndim != 1:
        raise RuntimeError(f"1D tensors expected, but got {a.ndim}D and {b.ndim}D tensors")
    if a.shape[0] != b.shape[0]:
        raise RuntimeError(f"inconsistent tensor size, expected tensor [{a.shape[0]}] and src [{b.shape[0]}] to have "
                           f"the same number of elements, but got {a.shape[0]} and {b.shape[0]} elements respectively")
    return matmul(a, b)


_TORCH['vdot'] = dot
_TORCH['inner'] = lambda a, b: (_tens(a) * _tens(b)).sum(-1) if _tens(a).ndim <= 1 else matmul(a, _tens(b).mT)


@_export('outer', 'ger')
def outer(input, vec2):
    return _tens(input).reshape(-1, 1) * _tens(vec2).reshape(1, -1)


@_export()
def addmm(input, mat1, mat2, beta=1, alpha=1):
    return beta * _tens(input) + alpha * matmul(mat1, mat2)


@_export()
def baddbmm(input, batch1, batch2, beta=1, alpha=1):
    return beta * _tens(input) + alpha * bmm(batch1, batch2)


@_export()
def kron(input, other):
    a, b = _tens(input), _tens(other)
    if a.ndim == 1:
        return outer(a, b).reshape(-1)
    m, n = a.shape
    p, q = b.shape
    return (a.reshape(m, 1, n, 1) * b.reshape(1, p, 1, q)).reshape(m * p, n * q)


@_export()
def cross(input, other, dim=None):
    a, b = _tens(input), _tens(other)
    d = -1 if dim is None else dim
    a0, a1, a2 = unbind(a, d)
    b0, b1, b2 = unbind(b, d)
    return stack([a1 * b2 - a2 * b1, a2 * b0 - a0 * b2, a0 * b1 - a1 * b0], d)


_LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'


def _parse_einsum(eq, ndims):
    eq = eq.replace(' ', '')
    if '->' in eq:
        lhs, rhs = eq.split('->')
    else:
        lhs, rhs = eq, None
    ins = lhs.split(',')
    if len(ins) != len(ndims):
        raise RuntimeError("einsum(): more operands were provided than specified in the equation"
                           if len(ndims) > len(ins) else "einsum(): fewer operands were provided than specified in the equation")
    used = set(c for c in eq if c.isalpha())
    free = [c for c in _LETTERS if c not in used]
    ell_n = 0
    for s, nd in zip(ins, ndims):
        if '...' in s:
            ell_n = _bmax(ell_n, nd - (len(s) - 3))
    ell = ''.join(free[:ell_n])
    new_ins = []
    for s, nd in zip(ins, ndims):
        if '...' in s:
            k = nd - (len(s) - 3)
            s = s.replace('...', ell[ell_n - k:] if k else '')
        if len(s) != nd:
            raise RuntimeError(f"einsum(): the number of subscripts in the equation ({len(s)}) does not match the "
                               f"number of dimensions ({nd}) for operand {len(new_ins)}")
        new_ins.append(s)
    if rhs is None:
        counts = collections.Counter(''.join(new_ins))
        rhs = ell + ''.join(sorted(c for c in counts if counts[c] == 1 and c not in ell))
    else:
        rhs = rhs.replace('...', ell)
    return new_ins, rhs


@_export()
def einsum(equation, *operands):
    if len(operands) == 1 and isinstance(operands[0], (list, tuple)):
        operands = operands[0]
    ts = [_tens(o) for o in operands]
    dt = _promote(*ts)
    arrs = [t._data.astype(dt, copy=False) for t in ts]
    ins, out_s = _parse_einsum(equation, [a.ndim for a in arrs])
    full = ','.join(ins) + '->' + out_s
    try:
        out = np.einsum(full, *arrs, optimize=len(arrs) > 2)
    except ValueError as e:
        raise RuntimeError(f"einsum(): {e}")
    sizes = {}
    for s, a in zip(ins, arrs):
        for c, n in zip(s, a.shape):
            if n != 1 or c not in sizes:
                sizes[c] = n

    def back(g):
        grads = []
        for i, (s, a) in enumerate(zip(ins, arrs)):
            if not ts[i]._requires_grad:
                grads.append(None)
                continue
            # Repeated letters in this operand (e.g. 'ii') become fresh letters tied with identity matrices.
            used = set(''.join(ins) + out_s)
            fresh = [c for c in _LETTERS if c not in used]
            target, extra_ops, extra_subs, seen = [], [], [], set()
            for c in s:
                if c in seen:
                    nc = fresh.pop(0)
                    extra_subs.append(c + nc)
                    extra_ops.append(np.eye(sizes[c], dtype=a.dtype))
                    target.append(nc)
                else:
                    seen.add(c)
                    target.append(c)
            other_subs = [out_s] + [ins[j] for j in range(len(ins)) if j != i] + extra_subs
            other_ops = [g] + [arrs[j] for j in range(len(ins)) if j != i] + extra_ops
            avail = set(''.join(other_subs))
            present = ''.join(c for c in target if c in avail)
            r = np.einsum(','.join(other_subs) + '->' + present, *other_ops, optimize=len(other_ops) > 2)
            # letters only in this operand: broadcast back
            shape_present = [sizes[c] if c in sizes else 1 for c in target]
            r_full = r.reshape([r.shape[present.index(c)] if c in present else 1 for c in target])
            r_full = np.broadcast_to(r_full, [a.shape[k] if target[k] not in present else r_full.shape[k]
                                              for k in range(len(target))])
            grads.append(r_full)
        return tuple(grads)
    return _result(np.asarray(out), tuple(ts), back if _is_float(dt) else None, 'EinsumBackward0')


@_export()
def tensordot(a, b, dims=2):
    a, b = _tens(a), _tens(b)
    if isinstance(dims, int):
        da = list(range(a.ndim - dims, a.ndim))
        db = list(range(dims))
    else:
        da, db = dims
        da = [da] if isinstance(da, int) else list(da)
        db = [db] if isinstance(db, int) else list(db)
    da = [d % a.ndim for d in da]
    db = [d % b.ndim for d in db]
    la = list(_LETTERS[:a.ndim])
    lb = list(_LETTERS[a.ndim:a.ndim + b.ndim])
    for x, y in zip(da, db):
        lb[y] = la[x]
    out = [la[i] for i in range(a.ndim) if i not in da] + [lb[i] for i in range(b.ndim) if i not in db]
    return einsum(''.join(la) + ',' + ''.join(lb) + '->' + ''.join(out), a, b)


@_export()
def chain_matmul(*matrices):
    out = matrices[0]
    for m in matrices[1:]:
        out = matmul(out, m)
    return out


@_export()
def cdist(x1, x2, p=2.0):
    diff_ = _tens(x1).unsqueeze(-2) - _tens(x2).unsqueeze(-3)
    if p == 2:
        return sqrt((diff_ * diff_).sum(-1))
    return norm(diff_, p, dim=-1)


@_export()
def cov(input, correction=1, fweights=None, aweights=None):
    x = _floatify(input)
    if x.ndim == 1:
        x = x.reshape(1, -1)
    xm = x - x.mean(1, keepdim=True)
    r = matmul(xm, xm.T) / (x.shape[1] - correction)
    return r.squeeze() if r.numel() == 1 else r


@_export()
def corrcoef(input):
    c = cov(input)
    if c.ndim == 0:
        return c / c
    d = sqrt(diagonal(c))
    return c / outer(d, d)


def _linalg_inv(A):
    a = _floatify(A)
    try:
        out = np.linalg.inv(a._data)
    except np.linalg.LinAlgError:
        raise RuntimeError("linalg.inv: The diagonal element 1 is zero, the inversion could not be completed because "
                           "the input matrix is singular.")

    def back(g):
        oT = np.swapaxes(out, -1, -2)
        return (-(oT @ g @ oT),)
    return _result(out.astype(a._data.dtype), (a,), back, 'LinalgInvExBackward0')


def _linalg_det(A):
    a = _floatify(A)
    d = np.linalg.det(a._data)

    def back(g):
        invT = np.swapaxes(np.linalg.inv(a._data), -1, -2)
        return (np.asarray(g * d)[..., None, None] * invT,)
    return _result(np.asarray(d, dtype=a._data.dtype), (a,), back, 'LinalgDetBackward0')


def _linalg_slogdet(A):
    a = _floatify(A)
    sign, la = np.linalg.slogdet(a._data)

    def back(g):
        invT = np.swapaxes(np.linalg.inv(a._data), -1, -2)
        return (np.asarray(g)[..., None, None] * invT,)
    return _rtype('slogdet', ('sign', 'logabsdet'))(
        Tensor._wrap(np.asarray(sign, dtype=a._data.dtype)),
        _result(np.asarray(la, dtype=a._data.dtype), (a,), back, 'LinalgSlogdetBackward0'))


def _linalg_solve(A, B, left=True):
    a, b = _floatify(A), _floatify(B)
    Ad, Bd = a._data, b._data
    vec = Bd.ndim == Ad.ndim - 1
    B2 = Bd[..., None] if vec else Bd
    X2 = np.linalg.solve(Ad, B2)
    X = X2[..., 0] if vec else X2

    def back(g):
        g2 = g[..., None] if vec else g
        gB = np.linalg.solve(np.swapaxes(Ad, -1, -2), g2)
        gA = -gB @ np.swapaxes(X2, -1, -2)
        return gA, (gB[..., 0] if vec else gB)
    return _result(X.astype(Ad.dtype), (a, b), back, 'LinalgSolveExBackward0')


def _no_backward(name):
    def back(g):
        raise _unsupported(f'backward of {name}')
    return back


def _linalg_svd(A, full_matrices=True):
    a = _floatify(A)
    U, S, Vh = np.linalg.svd(a._data, full_matrices=full_matrices)
    dt = a._data.dtype
    return _rtype('svd', ('U', 'S', 'Vh'))(
        _result(U.astype(dt), (a,), _no_backward('linalg.svd'), 'LinalgSvdBackward0'),
        _svdvals_t(a, S.astype(dt), U, Vh),
        _result(Vh.astype(dt), (a,), _no_backward('linalg.svd'), 'LinalgSvdBackward0'))


def _svdvals_t(a, S, U=None, Vh=None):
    if U is None:
        U, S0, Vh = np.linalg.svd(a._data, full_matrices=False)
    k = S.shape[-1]

    def back(g):
        return ((U[..., :, :k] * g[..., None, :]) @ Vh[..., :k, :],)
    return _result(S, (a,), back, 'LinalgSvdBackward0')


def _linalg_svdvals(A):
    a = _floatify(A)
    U, S, Vh = np.linalg.svd(a._data, full_matrices=False)
    return _svdvals_t(a, S.astype(a._data.dtype), U, Vh)


def _linalg_eigh(A, UPLO='L'):
    a = _floatify(A)
    w, V = np.linalg.eigh(a._data, UPLO=UPLO)
    dt = a._data.dtype
    store = {}

    def back_w(g):
        return ((V * g[..., None, :]) @ np.swapaxes(V, -1, -2),)

    def back_v(g):
        Ft = w[..., None, :] - w[..., :, None]
        with np.errstate(all='ignore'):
            F = np.where(Ft == 0, 0, 1 / Ft)
        inner = F * (np.swapaxes(V, -1, -2) @ g)
        return (V @ inner @ np.swapaxes(V, -1, -2),)
    return _rtype('eigh', ('eigenvalues', 'eigenvectors'))(
        _result(w.astype(dt), (a,), back_w, 'LinalgEighBackward0'),
        _result(V.astype(dt), (a,), back_v, 'LinalgEighBackward0'))


def _linalg_eigvalsh(A, UPLO='L'):
    return _linalg_eigh(A, UPLO)[0]


def _linalg_qr(A, mode='reduced'):
    a = _floatify(A)
    Q, R = np.linalg.qr(a._data, mode='complete' if mode == 'complete' else 'reduced')
    dt = a._data.dtype
    return _rtype('qr', ('Q', 'R'))(_result(Q.astype(dt), (a,), _no_backward('linalg.qr'), 'LinalgQrBackward0'),
                                     _result(R.astype(dt), (a,), _no_backward('linalg.qr'), 'LinalgQrBackward0'))


def _linalg_cholesky(A, upper=False):
    a = _floatify(A)
    L = np.linalg.cholesky(a._data)
    if upper:
        L = np.swapaxes(L, -1, -2)
    return _result(L.astype(a._data.dtype), (a,), _no_backward('linalg.cholesky'), 'LinalgCholeskyExBackward0')


def _linalg_pinv(A, rcond=None, hermitian=False, atol=None, rtol=None):
    a = _floatify(A)
    U, S, Vh = np.linalg.svd(a._data, full_matrices=False)
    tol = (rtol if rtol is not None else (rcond if rcond is not None else _bmax(a.shape[-2:]) * np.finfo(a._data.dtype).eps)) * S.max(-1, keepdims=True)
    Sinv = np.where(S > tol, 1 / np.where(S > tol, S, 1), 0)
    # differentiable through the composite expression when it is full rank
    if _bany(t._requires_grad for t in (a,)):
        at = a.mT
        m, n = a.shape[-2:]
        if m >= n:
            return matmul(_linalg_inv(matmul(at, a)), at)
        return matmul(at, _linalg_inv(matmul(a, at)))
    out = (np.swapaxes(Vh, -1, -2) * Sinv[..., None, :]) @ np.swapaxes(U, -1, -2)
    return Tensor._wrap(out.astype(a._data.dtype))


def _linalg_matrix_rank(A, tol=None, hermitian=False, atol=None, rtol=None):
    return Tensor._wrap(np.asarray(np.linalg.matrix_rank(_arr(A), tol=tol), dtype=np.int64))


def linalg_vector_norm(x, ord=2, dim=None, keepdim=False, dtype=None):
    x = _floatify(x)
    if dim is None:
        r = norm(x.reshape(-1), ord, 0)
        return r.reshape((1,) * x.ndim) if keepdim else r
    return norm(x, ord, dim, keepdim)


def linalg_matrix_norm(x, ord='fro', dim=(-2, -1), keepdim=False, dtype=None):
    x = _floatify(x)
    if ord == 'fro':
        return norm(x, 2, dim, keepdim)
    if ord == 'nuc':
        xm = movedim(x, dim, (-2, -1))
        r = _linalg_svdvals(xm).sum(-1)
        if keepdim:
            r = r.unsqueeze(-1).unsqueeze(-1)
        return r
    d0, d1 = dim
    if ord in (1, -1):
        r = x.abs().sum(d0, keepdim=True)
        r = (amax if ord == 1 else amin)(r, d1, keepdim=True)
    elif ord in (float('inf'), float('-inf')):
        r = x.abs().sum(d1, keepdim=True)
        r = (amax if ord > 0 else amin)(r, d0, keepdim=True)
    elif ord in (2, -2):
        s = _linalg_svdvals(movedim(x, dim, (-2, -1)))
        r = (amax if ord == 2 else amin)(s, -1)
        return r.unsqueeze(-1).unsqueeze(-1) if keepdim else r
    else:
        raise RuntimeError(f"linalg.matrix_norm: Order {ord} not supported.")
    return r if keepdim else r.squeeze(_bmax(d0 % x.ndim, d1 % x.ndim)).squeeze(_bmin(d0 % x.ndim, d1 % x.ndim))


def linalg_norm(x, ord=None, dim=None, keepdim=False, dtype=None):
    x = _floatify(x)
    if isinstance(dim, int):
        dim = (dim,)
    if ord is None:
        if dim is None:
            return linalg_vector_norm(x, 2, None, keepdim)
        return norm(x, 2, dim, keepdim)
    if dim is None:
        if x.ndim == 1:
            return linalg_vector_norm(x, ord, None, keepdim)
        if x.ndim == 2:
            return linalg_matrix_norm(x, ord, (-2, -1), keepdim)
        raise RuntimeError("linalg.norm: If dim is not specified but ord is, the input must be 1D or 2D.")
    if len(dim) == 1:
        return linalg_vector_norm(x, ord, dim, keepdim)
    return linalg_matrix_norm(x, ord, dim, keepdim)


_TORCH['det'] = _linalg_det
_TORCH['logdet'] = lambda A: log(_linalg_det(A))
_TORCH['slogdet'] = _linalg_slogdet
_TORCH['inverse'] = _linalg_inv
_TORCH['pinverse'] = _linalg_pinv
_TORCH['matrix_rank'] = _linalg_matrix_rank


@_export()
def svd(input, some=True, compute_uv=True):
    U, S, Vh = _linalg_svd(input, full_matrices=not some)
    return _rtype('svd', ('U', 'S', 'V'))(U, S, Vh.mT)


@_export()
def lu(*a, **k):
    raise _unsupported('torch.lu')


# =============================================================================
# Tensor methods and operators
# =============================================================================

_METHOD_NAMES = """
add sub subtract mul multiply div divide true_divide floor_divide remainder fmod pow float_power maximum minimum
fmax fmin atan2 arctan2 logaddexp xlogy hypot eq ne not_equal lt less le less_equal gt greater ge greater_equal
logical_and logical_or logical_xor logical_not bitwise_and bitwise_or bitwise_xor bitwise_not
round clamp clip clamp_min clamp_max lerp addcmul addcdiv nan_to_num isnan isinf isfinite isposinf isneginf
isclose allclose equal
sum nansum mean nanmean var std prod max min amax amin argmax argmin all any count_nonzero cumsum cumprod cummax
logsumexp softmax log_softmax norm dist median mode quantile sort argsort msort topk kthvalue unique
unique_consecutive bincount histc diff
reshape permute transpose swapaxes swapdims t adjoint movedim moveaxis squeeze unsqueeze flatten unflatten ravel
broadcast_to narrow select chunk split tensor_split unbind gather take_along_dim take scatter scatter_add
scatter_reduce index_select index_add index_fill index_copy masked_fill masked_select masked_scatter nonzero
argwhere tril triu flip fliplr flipud roll rot90 repeat_interleave diag diagonal diag_embed trace
matmul mm bmm mv dot vdot inner outer ger addmm baddbmm kron cross det logdet slogdet inverse pinverse
""".split()


def _make_method(fn):
    def method(self, *args, **kwargs):
        return fn(self, *args, **kwargs)
    method.__name__ = getattr(fn, '__name__', 'method')
    return method


for _n in _METHOD_NAMES + list(_UNARY):
    setattr(Tensor, _n, _make_method(_TORCH[_n]))


def _view(self, *shape):
    if len(shape) == 1 and isinstance(shape[0], dtype):
        return Tensor._wrap(self._data.view(shape[0]._np))
    return reshape(self, *shape)


def _where_method(self, condition, y):
    return where(condition, self, y)


def _apply_inplace(self, fn):
    raise _unsupported('Tensor.apply_')


Tensor.view = _view
Tensor.view_as = lambda self, other: reshape(self, other.shape)
Tensor.reshape_as = lambda self, other: reshape(self, other.shape)
Tensor.expand = _expand
Tensor.expand_as = lambda self, other: _expand(self, *other.shape)
Tensor.repeat = _repeat
Tensor.unfold = _unfold
Tensor.where = _where_method
Tensor.abs = _make_method(_TORCH['abs'])
Tensor.absolute = Tensor.abs
Tensor.negative = Tensor.neg
Tensor.arcsin, Tensor.arccos, Tensor.arctan = Tensor.asin, Tensor.acos, Tensor.atan
Tensor.sigmoid = _make_method(sigmoid)
Tensor.relu = _make_method(relu)
Tensor.square = _make_method(_TORCH['square'])
Tensor.det = _make_method(_linalg_det)
Tensor.inverse = _make_method(_linalg_inv)
Tensor.logit = _make_method(_TORCH['logit'])
Tensor.svd = lambda self, some=True, compute_uv=True: svd(self, some, compute_uv)
Tensor.cov = lambda self, **k: cov(self, **k)
Tensor.corrcoef = lambda self: corrcoef(self)
Tensor.cdist = lambda self, other, p=2.0: cdist(self, other, p)
Tensor.renorm = lambda self, *a, **k: (_ for _ in ()).throw(_unsupported('Tensor.renorm'))
Tensor.softplus = lambda self, beta=1.0, threshold=20.0: _F_softplus(self, beta, threshold)


def _binop_method(fn, reverse=False):
    def method(self, other):
        if other is None or isinstance(other, (str, dict, set)):
            return NotImplemented
        if isinstance(other, (list, tuple)):
            other = tensor(other)
        return fn(other, self) if reverse else fn(self, other)
    return method


def _cmp_method(fn):
    def method(self, other):
        if other is None or isinstance(other, (str, dict, set, type)):
            return NotImplemented
        if isinstance(other, (list, tuple)):
            other = tensor(other)
        return fn(self, other)
    return method


Tensor.__add__ = _binop_method(add)
Tensor.__radd__ = _binop_method(add, True)
Tensor.__sub__ = _binop_method(sub)
Tensor.__rsub__ = _binop_method(sub, True)
Tensor.__mul__ = _binop_method(mul)
Tensor.__rmul__ = _binop_method(mul, True)
Tensor.__truediv__ = _binop_method(div)
Tensor.__rtruediv__ = _binop_method(div, True)
Tensor.__floordiv__ = _binop_method(floor_divide)
Tensor.__rfloordiv__ = _binop_method(floor_divide, True)
Tensor.__mod__ = _binop_method(remainder)
Tensor.__rmod__ = _binop_method(remainder, True)
Tensor.__pow__ = _binop_method(pow)
Tensor.__rpow__ = _binop_method(pow, True)
Tensor.__matmul__ = _binop_method(matmul)
Tensor.__rmatmul__ = _binop_method(matmul, True)
Tensor.__eq__ = _cmp_method(eq)
Tensor.__ne__ = _cmp_method(ne)
Tensor.__lt__ = _cmp_method(lt)
Tensor.__le__ = _cmp_method(le)
Tensor.__gt__ = _cmp_method(gt)
Tensor.__ge__ = _cmp_method(ge)


def _logic(npf, name):
    def op(self, other):
        dt = _promote(self, other)
        if _is_float(dt):
            raise TypeError(f"unsupported operand type(s) for {name}: floating point tensors")
        return Tensor._wrap(npf(_arr(self, dt), _arr(other, dt)))
    return op


Tensor.__and__ = Tensor.__rand__ = _logic(np.bitwise_and, '&')
Tensor.__or__ = Tensor.__ror__ = _logic(np.bitwise_or, '|')
Tensor.__xor__ = Tensor.__rxor__ = _logic(np.bitwise_xor, '^')
Tensor.__invert__ = lambda self: Tensor._wrap(np.invert(self._data))
Tensor.__neg__ = lambda self: neg(self)
Tensor.__pos__ = lambda self: self
Tensor.__abs__ = lambda self: _TORCH['abs'](self)


def _iop(fn):
    def method(self, other):
        return self._inplace(lambda s: fn(s, other))
    return method


Tensor.__iadd__ = _iop(add)
Tensor.__isub__ = _iop(sub)
Tensor.__imul__ = _iop(mul)
Tensor.__itruediv__ = _iop(div)
Tensor.__ifloordiv__ = _iop(floor_divide)
Tensor.__imod__ = _iop(remainder)
Tensor.__ipow__ = _iop(pow)
Tensor.__iand__ = _iop(lambda a, b: Tensor.__and__(a, b))
Tensor.__ior__ = _iop(lambda a, b: Tensor.__or__(a, b))
Tensor.__imatmul__ = _iop(matmul)


def _make_inplace(fn):
    def method(self, *args, **kwargs):
        return self._inplace(lambda s: fn(s, *args, **kwargs))
    return method


for _n in """add sub mul div pow remainder fmod floor_divide clamp clip clamp_min clamp_max lerp addcmul addcdiv
            masked_fill index_fill index_add index_copy scatter scatter_add scatter_reduce masked_scatter
            round tril triu nan_to_num logical_not logical_and logical_or maximum minimum""".split():
    setattr(Tensor, _n + '_', _make_inplace(_TORCH[_n]))
for _n in list(_UNARY):
    setattr(Tensor, _n + '_', _make_inplace(_TORCH[_n]))
Tensor.subtract_ = Tensor.sub_
Tensor.multiply_ = Tensor.mul_
Tensor.divide_ = Tensor.div_
Tensor.true_divide_ = Tensor.div_


def _const_inplace(make):
    """In-place ops that overwrite values with constants or random numbers."""
    def method(self, *args, **kwargs):
        def compute(s):
            return Tensor._wrap(np.asarray(make(s._data, *args, **kwargs)).astype(s._data.dtype))
        return self._inplace(compute)
    return method


Tensor.zero_ = _const_inplace(lambda a: np.zeros_like(a))
Tensor.fill_ = _const_inplace(lambda a, v: np.full_like(a, v.item() if isinstance(v, Tensor) else v))
Tensor.normal_ = _const_inplace(lambda a, mean=0.0, std=1.0, generator=None:
                                mean + std * np.random.standard_normal(a.shape))
Tensor.uniform_ = _const_inplace(lambda a, from_=0.0, to=1.0, generator=None:
                                 from_ + (to - from_) * np.random.random_sample(a.shape))
Tensor.exponential_ = _const_inplace(lambda a, lambd=1.0, generator=None: np.random.exponential(1 / lambd, a.shape))
Tensor.bernoulli_ = _const_inplace(lambda a, p=0.5, generator=None:
                                   np.random.random_sample(a.shape) < (_arr(p) if isinstance(p, Tensor) else p))
Tensor.log_normal_ = _const_inplace(lambda a, mean=1.0, std=2.0, generator=None:
                                    np.random.lognormal(mean, std, a.shape))
Tensor.geometric_ = _const_inplace(lambda a, p, generator=None: np.random.geometric(p, a.shape))
Tensor.cauchy_ = _const_inplace(lambda a, median=0.0, sigma=1.0, generator=None:
                                median + sigma * np.random.standard_cauchy(a.shape))


def _random_(a, from_=0, to=None, generator=None):
    if to is None:
        from_, to = 0, (from_ if from_ else 2 ** 24)
    return np.random.randint(from_, to, a.shape)


Tensor.random_ = _const_inplace(_random_)


def _fill_diagonal(a, fill_value, wrap=False):
    out = a.copy()
    np.fill_diagonal(out, fill_value, wrap=wrap)
    return out


Tensor.fill_diagonal_ = _const_inplace(_fill_diagonal)


def _copy_(self, src, non_blocking=False):
    src = _tens(src)
    return self._inplace(lambda s: _expand(src.to(self.dtype), *self.shape))


Tensor.copy_ = _copy_


def _shape_inplace(fn):
    def method(self, *args, **kwargs):
        res = fn(self._snapshot() if (self._requires_grad and not self.is_leaf) else self.detach(), *args, **kwargs)
        self._data = res._data
        if res._requires_grad:
            self._node = res._node
        return self
    return method


Tensor.unsqueeze_ = _shape_inplace(unsqueeze)
Tensor.squeeze_ = _shape_inplace(squeeze)
Tensor.t_ = _shape_inplace(t)
Tensor.transpose_ = _shape_inplace(transpose)
Tensor.resize_ = _shape_inplace(lambda x, *s: Tensor._wrap(np.resize(x._data, _size_args(s))))
Tensor.resize_as_ = _shape_inplace(lambda x, o: Tensor._wrap(np.resize(x._data, o.shape)))
Tensor.as_strided = lambda self, *a, **k: (_ for _ in ()).throw(_unsupported('Tensor.as_strided'))


# torch-level function forms of methods that are not module functions yet
for _n in ['view', 'expand', 'repeat']:
    pass
_TORCH['expand_copy'] = _expand
_TORCH['clone'] = lambda x, memory_format=None: _tens(x).clone()
_TORCH['detach'] = lambda x: _tens(x).detach()
_TORCH['numel'] = lambda x: _tens(x).numel()
_TORCH['is_tensor'] = lambda x: isinstance(x, Tensor)
_TORCH['is_floating_point'] = lambda x: _tens(x).is_floating_point()
_TORCH['is_nonzero'] = lambda x: bool(_tens(x))
_TORCH['is_complex'] = lambda x: False
_TORCH['is_grad_enabled'] = is_grad_enabled
_TORCH['square'] = _TORCH['square']


# =============================================================================
# nn.functional
# =============================================================================

def _F_relu(input, inplace=False):
    return relu(input)


def _F_relu6(input, inplace=False):
    return clamp(input, 0.0, 6.0)


def _F_leaky_relu(input, negative_slope=0.01, inplace=False):
    x = _floatify(input)
    A = x._data
    out = np.where(A > 0, A, A * negative_slope).astype(A.dtype)
    return _result(out, (x,), lambda g: (g * np.where(A > 0, 1, negative_slope).astype(A.dtype),),
                   'LeakyReluBackward0')


def _F_elu(input, alpha=1.0, inplace=False):
    x = _floatify(input)
    A = x._data
    with np.errstate(over='ignore'):
        out = np.where(A > 0, A, alpha * np.expm1(np.minimum(A, 0))).astype(A.dtype)
    return _result(out, (x,), lambda g: (g * np.where(A > 0, 1, out + alpha),), 'EluBackward0')


_SELU_ALPHA = 1.6732632423543772848170429916717
_SELU_SCALE = 1.0507009873554804934193349852946


def _F_selu(input, inplace=False):
    return _SELU_SCALE * _F_elu(input, _SELU_ALPHA)


def _F_celu(input, alpha=1.0, inplace=False):
    return _F_elu(_tens(input) / alpha, 1.0) * alpha if alpha != 1.0 else _F_elu(input, 1.0)


def _F_gelu(input, approximate='none'):
    x = _floatify(input)
    if approximate == 'tanh':
        c = math.sqrt(2.0 / math.pi)
        return 0.5 * x * (1.0 + tanh(c * (x + 0.044715 * x * x * x)))
    A = x._data
    cdf = 0.5 * (1.0 + _erf_np(A / np.float32(math.sqrt(2.0)).astype(A.dtype)))
    out = (A * cdf).astype(A.dtype)
    pdf = np.exp(-0.5 * A * A) / math.sqrt(2 * math.pi)
    return _result(out, (x,), lambda g: (g * (cdf + A * pdf),), 'GeluBackward0')


def _F_silu(input, inplace=False):
    x = _floatify(input)
    A = x._data
    s = _UNARY['sigmoid'][0](A).astype(A.dtype)
    return _result(A * s, (x,), lambda g: (g * s * (1 + A * (1 - s)),), 'SiluBackward0')


def _F_softplus(input, beta=1.0, threshold=20.0):
    x = _floatify(input)
    A = x._data
    bx = A * beta
    with np.errstate(over='ignore'):
        out = np.where(bx > threshold, A, np.log1p(np.exp(np.minimum(bx, threshold))) / beta).astype(A.dtype)
    s = _UNARY['sigmoid'][0](bx)
    return _result(out, (x,), lambda g: (g * np.where(bx > threshold, 1, s),), 'SoftplusBackward0')


def _F_mish(input, inplace=False):
    return input * tanh(_F_softplus(input))


def _F_hardtanh(input, min_val=-1.0, max_val=1.0, inplace=False):
    return clamp(input, min_val, max_val)


def _F_hardsigmoid(input, inplace=False):
    return clamp(_tens(input) / 6.0 + 0.5, 0.0, 1.0)


def _F_hardswish(input, inplace=False):
    return input * _F_hardsigmoid(input)


def _F_logsigmoid(input):
    return -_F_softplus(-_tens(input))


def _F_softsign(input):
    x = _tens(input)
    return x / (1 + x.abs())


def _F_tanhshrink(input):
    return input - tanh(input)


def _F_threshold(input, threshold, value, inplace=False):
    x = _tens(input)
    return where(x > threshold, x, value)


def _F_glu(input, dim=-1):
    a, b = chunk(input, 2, dim)
    return a * sigmoid(b)


def _F_softmin(input, dim=None, dtype=None):
    return softmax(-_tens(input), dim, dtype)


def _F_prelu(input, weight):
    x = _tens(input)
    w = _tens(weight)
    if x.ndim >= 2 and w.numel() > 1:
        w = w.reshape([1, -1] + [1] * (x.ndim - 2))
    return where(x >= 0, x, w * x)


def _F_rrelu(input, lower=1. / 8, upper=1. / 3, training=False, inplace=False):
    if training:
        raise _unsupported('F.rrelu(training=True)')
    return _F_leaky_relu(input, (lower + upper) / 2)


def _F_gumbel_softmax(logits, tau=1.0, hard=False, eps=1e-10, dim=-1):
    lg = _tens(logits)
    u = np.random.random_sample(lg._data.shape)
    gumbels = Tensor._wrap(-np.log(-np.log(u + eps) + eps).astype(lg._data.dtype))
    y = softmax((lg + gumbels) / tau, dim)
    if hard:
        idx = y.argmax(dim, keepdim=True)
        y_hard = zeros_like(y).scatter(dim, idx, 1.0)
        return y_hard - y.detach() + y
    return y


def _F_dropout(input, p=0.5, training=True, inplace=False):
    if p < 0 or p > 1:
        raise ValueError(f"dropout probability has to be between 0 and 1, but got {p}")
    x = _tens(input)
    if not training or p == 0:
        return x
    if p == 1:
        return x * 0.0
    keep = (np.random.random_sample(x._data.shape) < (1 - p)).astype(x._data.dtype) / np.asarray(1 - p, x._data.dtype)
    return x * Tensor._wrap(keep)


def _F_dropout_nd(input, p=0.5, training=True, inplace=False):
    x = _tens(input)
    if not training or p == 0:
        return x
    shape = x._data.shape[:2] + (1,) * (x._data.ndim - 2)
    keep = (np.random.random_sample(shape) < (1 - p)).astype(x._data.dtype) / np.asarray(1 - p, x._data.dtype)
    return x * Tensor._wrap(keep)


def _F_alpha_dropout(input, p=0.5, training=False, inplace=False):
    if training and p > 0:
        raise _unsupported('F.alpha_dropout(training=True)')
    return input


def _F_linear(input, weight, bias=None):
    out = matmul(input, _tens(weight).t() if _tens(weight).ndim == 2 else weight)
    return out + bias if bias is not None else out


def _F_bilinear(input1, input2, weight, bias=None):
    out = einsum('...i,oij,...j->...o', input1, weight, input2)
    return out + bias if bias is not None else out


def _reduce(loss, reduction):
    if reduction == 'mean':
        return loss.mean()
    if reduction == 'sum':
        return loss.sum()
    if reduction == 'none':
        return loss
    raise ValueError(f"{reduction} is not a valid value for reduction")


def _legacy_reduction(size_average, reduce, reduction):
    if size_average is None and reduce is None:
        return reduction
    size_average = True if size_average is None else size_average
    reduce = True if reduce is None else reduce
    return 'none' if not reduce else ('mean' if size_average else 'sum')


def _F_mse_loss(input, target, size_average=None, reduce=None, reduction='mean', weight=None):
    reduction = _legacy_reduction(size_average, reduce, reduction)
    d = _tens(input) - _tens(target)
    return _reduce(d * d, reduction)


def _F_l1_loss(input, target, size_average=None, reduce=None, reduction='mean'):
    reduction = _legacy_reduction(size_average, reduce, reduction)
    return _reduce((_tens(input) - _tens(target)).abs(), reduction)


def _F_smooth_l1_loss(input, target, size_average=None, reduce=None, reduction='mean', beta=1.0):
    reduction = _legacy_reduction(size_average, reduce, reduction)
    d = (_tens(input) - _tens(target)).abs()
    if beta == 0:
        return _reduce(d, reduction)
    return _reduce(where(d < beta, 0.5 * d * d / beta, d - 0.5 * beta), reduction)


def _F_huber_loss(input, target, reduction='mean', delta=1.0, weight=None):
    d = (_tens(input) - _tens(target)).abs()
    return _reduce(where(d <= delta, 0.5 * d * d, delta * (d - 0.5 * delta)), reduction)


def _check_target_bounds(t, C, ignore_index):
    v = t[t != ignore_index]
    if v.size and (v.min() < 0 or v.max() >= C):
        bad = v[(v < 0) | (v >= C)][0]
        raise IndexError(f"Target {bad} is out of bounds.")


def _F_nll_loss(input, target, weight=None, size_average=None, ignore_index=-100, reduce=None, reduction='mean'):
    reduction = _legacy_reduction(size_average, reduce, reduction)
    x = _tens(input)
    tgt = _tens(target)
    if tgt._data.dtype.kind not in 'iu':
        raise RuntimeError(f"expected scalar type Long but found {tgt.dtype._name.capitalize()}")
    if x.ndim == 1:
        x = x.unsqueeze(0)
        tgt = tgt.reshape(1)
        squeeze_out = True
    else:
        squeeze_out = False
    if x.shape[0] != tgt.shape[0]:
        raise ValueError(f"Expected input batch_size ({x.shape[0]}) to match target batch_size ({tgt.shape[0]}).")
    C = x.shape[1]
    T = tgt._data
    _check_target_bounds(T, C, ignore_index)
    valid = T != ignore_index
    safe = np.where(valid, T, 0)
    xm = movedim(x, 1, -1) if x.ndim > 2 else x
    picked = gather(xm, -1, Tensor._wrap(safe[..., None])).squeeze(-1)
    w = _arr(weight)[safe] if weight is not None else np.ones(safe.shape, dtype=x._data.dtype)
    w = (w * valid).astype(x._data.dtype)
    loss = -picked * Tensor._wrap(w)
    if reduction == 'none':
        return loss.squeeze(0) if squeeze_out else loss
    if reduction == 'sum':
        return loss.sum()
    return loss.sum() / Tensor._wrap(np.asarray(w.sum(), dtype=x._data.dtype))


def _F_cross_entropy(input, target, weight=None, size_average=None, ignore_index=-100, reduce=None,
                     reduction='mean', label_smoothing=0.0):
    reduction = _legacy_reduction(size_average, reduce, reduction)
    x = _floatify(input)
    tgt = _tens(target)
    cdim = 1 if x.ndim >= 2 else 0
    C = x.shape[cdim]
    logp = log_softmax(x, cdim)
    wshape = [1] * x.ndim
    wshape[cdim] = C
    if _is_float(tgt._data.dtype):
        if tgt.shape != x.shape:
            raise RuntimeError(f"expected scalar type Long but found {tgt.dtype._name.capitalize()}")
        if label_smoothing > 0:
            tgt = tgt * (1 - label_smoothing) + label_smoothing / C
        term = logp * tgt
        if weight is not None:
            term = term * _tens(weight).reshape(wshape)
        loss = -term.sum(cdim)
        if reduction == 'mean':
            return loss.sum() / (loss.numel() if loss.numel() else 1)
        return _reduce(loss, reduction)
    nll = _F_nll_loss(logp, tgt, weight, None, ignore_index, None, reduction)
    if label_smoothing <= 0:
        return nll
    T = tgt._data
    valid = (T != ignore_index)
    sm_term = logp if weight is None else logp * _tens(weight).reshape(wshape)
    smooth = -sm_term.sum(cdim) * Tensor._wrap(valid.astype(x._data.dtype))
    if reduction == 'none':
        s = smooth
    elif reduction == 'sum':
        s = smooth.sum()
    else:
        if weight is not None:
            safe = np.where(valid, T, 0)
            denom = float((_arr(weight)[safe] * valid).sum())
        else:
            denom = float(valid.sum())
        s = smooth.sum() / denom
    return (1 - label_smoothing) * nll + (label_smoothing / C) * s


def _F_binary_cross_entropy(input, target, weight=None, size_average=None, reduce=None, reduction='mean'):
    reduction = _legacy_reduction(size_average, reduce, reduction)
    x = _tens(input)
    tgt = _tens(target)
    if tgt.shape != x.shape:
        raise ValueError(f"Using a target size ({tgt.shape}) that is different to the input size ({x.shape}) is "
                         "deprecated. Please ensure they have the same size.")
    X = x._data
    if X.size and (X.min() < 0 or X.max() > 1):
        raise RuntimeError("all elements of input should be between 0 and 1")
    T = tgt._data.astype(X.dtype)
    with np.errstate(divide='ignore'):
        lx = np.maximum(np.log(X), -100)
        l1x = np.maximum(np.log(1 - X), -100)
    out = -(T * lx + (1 - T) * l1x)

    def back(g):
        gx = g * (X - T) / np.maximum((1 - X) * X, 1e-12)
        gt = g * (l1x - lx)
        return gx, gt
    loss = _result(out.astype(X.dtype), (x, tgt), back, 'BinaryCrossEntropyBackward0')
    if weight is not None:
        loss = loss * weight
    return _reduce(loss, reduction)


def _F_binary_cross_entropy_with_logits(input, target, weight=None, size_average=None, reduce=None,
                                        reduction='mean', pos_weight=None):
    reduction = _legacy_reduction(size_average, reduce, reduction)
    x = _floatify(input)
    tgt = _tens(target)
    if tgt.shape != x.shape:
        raise ValueError(f"Target size ({tgt.shape}) must be the same as input size ({x.shape})")
    tgt = tgt.to(x.dtype)
    # log(1 + exp(-x)) computed stably. softplus switches to the identity above
    # the threshold, so it never overflows, and its gradient (-sigmoid(-x)) is
    # correct everywhere, including x == 0, where abs/clamp formulations give 0.
    sp = _F_softplus(-x, 1.0, 20.0)
    if pos_weight is None:
        loss = (1 - tgt) * x + sp
    else:
        lw = 1 + (_tens(pos_weight) - 1) * tgt
        loss = (1 - tgt) * x + lw * sp
    if weight is not None:
        loss = loss * weight
    return _reduce(loss, reduction)


def _F_kl_div(input, target, size_average=None, reduce=None, reduction='mean', log_target=False):
    reduction = _legacy_reduction(size_average, reduce, reduction)
    x, tg = _tens(input), _tens(target)
    if log_target:
        loss = exp(tg) * (tg - x)
    else:
        loss = xlogy(tg, tg) - tg * x
    if reduction == 'batchmean':
        return loss.sum() / (x.shape[0] if x.ndim else 1)
    return _reduce(loss, reduction)


def _F_poisson_nll_loss(input, target, log_input=True, full=False, size_average=None, eps=1e-8, reduce=None,
                        reduction='mean'):
    x, tg = _tens(input), _tens(target)
    loss = exp(x) - tg * x if log_input else x - tg * log(x + eps)
    if full:
        st = tg * log(tg) - tg + 0.5 * log(2 * math.pi * tg)
        loss = loss + where(tg > 1, st, 0.0)
    return _reduce(loss, reduction)


def _F_gaussian_nll_loss(input, target, var, full=False, eps=1e-6, reduction='mean'):
    v = clamp(_tens(var), min=eps)
    loss = 0.5 * (log(v) + (_tens(input) - target) ** 2 / v)
    if full:
        loss = loss + 0.5 * math.log(2 * math.pi)
    return _reduce(loss, reduction)


def _F_margin_ranking_loss(input1, input2, target, margin=0.0, reduction='mean', **k):
    return _reduce(relu(-_tens(target) * (_tens(input1) - input2) + margin), reduction)


def _F_hinge_embedding_loss(input, target, margin=1.0, reduction='mean', **k):
    x, y = _tens(input), _tens(target)
    return _reduce(where(y == 1, x, clamp(margin - x, min=0)), reduction)


def _F_cosine_embedding_loss(input1, input2, target, margin=0.0, reduction='mean', **k):
    cos = _F_cosine_similarity(input1, input2, dim=-1)
    y = _tens(target)
    return _reduce(where(y == 1, 1 - cos, clamp(cos - margin, min=0)), reduction)


def _F_soft_margin_loss(input, target, reduction='mean', **k):
    return _reduce(log1p(exp(-_tens(target) * input)), reduction)


def _F_multilabel_soft_margin_loss(input, target, weight=None, reduction='mean', **k):
    x, y = _tens(input), _tens(target)
    loss = -(y * _F_logsigmoid(x) + (1 - y) * _F_logsigmoid(-x))
    if weight is not None:
        loss = loss * weight
    return _reduce(loss.mean(-1), reduction)


def _F_triplet_margin_loss(anchor, positive, negative, margin=1.0, p=2, eps=1e-6, swap=False, reduction='mean',
                           **k):
    dp = _F_pairwise_distance(anchor, positive, p, eps)
    dn = _F_pairwise_distance(anchor, negative, p, eps)
    if swap:
        dn = minimum(dn, _F_pairwise_distance(positive, negative, p, eps))
    return _reduce(clamp(dp - dn + margin, min=0), reduction)


def _F_cosine_similarity(x1, x2, dim=1, eps=1e-8):
    a, b = broadcast_tensors(_floatify(x1), _floatify(x2))
    na = clamp(norm(a, 2, dim, keepdim=True), min=eps)
    nb = clamp(norm(b, 2, dim, keepdim=True), min=eps)
    return ((a / na) * (b / nb)).sum(dim)


def _F_pairwise_distance(x1, x2, p=2.0, eps=1e-6, keepdim=False):
    return norm(_tens(x1) - _tens(x2) + eps, p, -1, keepdim)


def _F_normalize(input, p=2.0, dim=1, eps=1e-12, out=None):
    x = _floatify(input)
    return x / clamp(norm(x, p, dim, keepdim=True), min=eps)


def _F_one_hot(tensor, num_classes=-1):
    t = _tens(tensor)
    if t._data.dtype.kind not in 'iu':
        raise RuntimeError("one_hot is only applicable to index tensor of type LongTensor.")
    T = t._data.astype(np.int64)
    if num_classes == -1:
        num_classes = int(T.max()) + 1 if T.size else 0
    if T.size and (T.min() < 0 or T.max() >= num_classes):
        raise RuntimeError("Class values must be smaller than num_classes.")
    return Tensor._wrap(np.eye(num_classes, dtype=np.int64)[T])


def _F_embedding(input, weight, padding_idx=None, max_norm=None, norm_type=2.0, scale_grad_by_freq=False,
                 sparse=False):
    w = _tens(weight)
    idx = _arr(input)
    if idx.dtype.kind not in 'iu':
        raise RuntimeError("Expected tensor for argument #1 'indices' to have one of the following scalar types: "
                           "Long, Int; but got torch.FloatTensor instead")
    if idx.size and (idx.min() < -w.shape[0] or idx.max() >= w.shape[0]):
        raise IndexError("index out of range in self")
    if max_norm is not None:
        with no_grad():
            rows = np.unique(idx)
            nrm = np.linalg.norm(w._data[rows], ord=norm_type, axis=1, keepdims=True)
            scale = np.where(nrm > max_norm, max_norm / (nrm + 1e-7), 1.0)
            w._data[rows] = w._data[rows] * scale
    W = w._data
    pad = None if padding_idx is None else (padding_idx % W.shape[0])

    def back(g):
        gw = np.zeros(W.shape, dtype=g.dtype)
        np.add.at(gw, idx, g)
        if pad is not None:
            gw[pad] = 0
        return (gw,)
    return _result(W[idx], (w,), back, 'EmbeddingBackward0')


def _pad_np_mode(mode):
    return {'reflect': 'reflect', 'replicate': 'edge', 'circular': 'wrap'}[mode]


def _F_pad(input, pad, mode='constant', value=None):
    x = _tens(input)
    pad = list(pad)
    if len(pad) % 2:
        raise RuntimeError("Padding length must be divisible by 2")
    nd = x.ndim
    pairs = [(0, 0)] * nd
    for i in range(len(pad) // 2):
        pairs[nd - 1 - i] = (int(pad[2 * i]), int(pad[2 * i + 1]))
    # negative padding crops first
    crop = tuple(slice(-l if l < 0 else None, (r if r < 0 else None)) for l, r in pairs)
    if _bany(l < 0 or r < 0 for l, r in pairs):
        x = x[crop]
    pairs = [(_bmax(l, 0), _bmax(r, 0)) for l, r in pairs]
    if mode == 'constant':
        A = x._data
        out = np.pad(A, pairs, mode='constant', constant_values=0 if value is None else value)
        sl = tuple(slice(l, l + s) for (l, r), s in zip(pairs, A.shape))
        return _result(out, (x,), lambda g: (g[sl],), 'ConstantPadNdBackward0')
    if mode not in ('reflect', 'replicate', 'circular'):
        raise _unsupported(f"F.pad(mode='{mode}')")
    out = x
    for d, (l, r) in enumerate(pairs):
        if l == 0 and r == 0:
            continue
        n = x.shape[d]
        idx = np.pad(np.arange(n), (l, r), mode=_pad_np_mode(mode))
        out = index_select(out, d, Tensor._wrap(idx.astype(np.int64)))
    return out


def _pair(v, n=2):
    if isinstance(v, (tuple, list)):
        return tuple(int(i) for i in v) if len(v) == n else tuple(int(v[0]) for _ in range(n))
    return (int(v),) * n


def _im2col(xp, KH, KW, OH, OW, s, d):
    N, C = xp.shape[:2]
    cols = np.empty((N, C, KH, KW, OH, OW), dtype=xp.dtype)
    for i in range(KH):
        hs = i * d[0]
        for j in range(KW):
            ws = j * d[1]
            cols[:, :, i, j] = xp[:, :, hs:hs + s[0] * (OH - 1) + 1:s[0], ws:ws + s[1] * (OW - 1) + 1:s[1]]
    return cols


def _col2im(cols, shape, s, d):
    N, C, KH, KW, OH, OW = cols.shape
    out = np.zeros(shape, dtype=cols.dtype)
    for i in range(KH):
        hs = i * d[0]
        for j in range(KW):
            ws = j * d[1]
            out[:, :, hs:hs + s[0] * (OH - 1) + 1:s[0], ws:ws + s[1] * (OW - 1) + 1:s[1]] += cols[:, :, i, j]
    return out


def _conv_padding(padding, k, d, s):
    if isinstance(padding, str):
        if padding == 'valid':
            return ((0, 0), (0, 0))
        if padding == 'same':
            if s != (1, 1):
                raise RuntimeError("padding='same' is not supported for strided convolutions")
            out = []
            for kk, dd in zip(k, d):
                total = dd * (kk - 1)
                out.append((total // 2, total - total // 2))
            return tuple(out)
        raise ValueError(f"Invalid padding string '{padding}'")
    p = _pair(padding)
    return ((p[0], p[0]), (p[1], p[1]))


def _F_conv2d(input, weight, bias=None, stride=1, padding=0, dilation=1, groups=1):
    x = _floatify(input)
    w = _tens(weight)
    unbatched = x.ndim == 3
    if unbatched:
        x = x.unsqueeze(0)
    if x.ndim != 4:
        raise RuntimeError(f"Expected 3D (unbatched) or 4D (batched) input to conv2d, but got input of size: "
                           f"{list(x.shape)}")
    X, W = x._data, w._data.astype(x._data.dtype, copy=False)
    N, C, H, Wd = X.shape
    O, Cg, KH, KW = W.shape
    if C != Cg * groups:
        raise RuntimeError(f"Given groups={groups}, weight of size {list(W.shape)}, expected input{list(X.shape)} to "
                           f"have {Cg * groups} channels, but got {C} channels instead")
    s, d = _pair(stride), _pair(dilation)
    (pt, pb), (pl, pr) = _conv_padding(padding, (KH, KW), d, s)
    xp = np.pad(X, ((0, 0), (0, 0), (pt, pb), (pl, pr))) if (pt or pb or pl or pr) else X
    Hp, Wp = xp.shape[2:]
    OH = (Hp - d[0] * (KH - 1) - 1) // s[0] + 1
    OW = (Wp - d[1] * (KW - 1) - 1) // s[1] + 1
    if OH <= 0 or OW <= 0:
        raise RuntimeError(f"Calculated padded input size per channel: ({Hp} x {Wp}). Kernel size: ({KH} x {KW}). "
                           "Kernel size can't be greater than actual input size")
    G = groups
    cols = _im2col(xp, KH, KW, OH, OW, s, d)
    cols_g = cols.reshape(N, G, Cg, KH, KW, OH, OW)
    w_g = W.reshape(G, O // G, Cg, KH, KW)
    out = np.einsum('ngcklyx,gockl->ngoyx', cols_g, w_g, optimize=True).reshape(N, O, OH, OW)

    def back(g):
        g_g = g.reshape(N, G, O // G, OH, OW)
        gw = np.einsum('ngoyx,ngcklyx->gockl', g_g, cols_g, optimize=True).reshape(W.shape)
        gcols = np.einsum('ngoyx,gockl->ngcklyx', g_g, w_g, optimize=True).reshape(cols.shape)
        gxp = _col2im(gcols, xp.shape, s, d)
        return gxp[:, :, pt:pt + H, pl:pl + Wd], gw
    res = _result(out.astype(X.dtype), (x, w), back, 'ConvolutionBackward0')
    if bias is not None:
        res = res + _tens(bias).reshape(1, -1, 1, 1)
    return res.squeeze(0) if unbatched else res


def _F_conv1d(input, weight, bias=None, stride=1, padding=0, dilation=1, groups=1):
    x = _tens(input)
    unbatched = x.ndim == 2
    if unbatched:
        x = x.unsqueeze(0)
    pad = padding if isinstance(padding, str) else (0, _pair(padding, 1)[0])
    out = _F_conv2d(x.unsqueeze(2), _tens(weight).unsqueeze(2), bias, (1, _pair(stride, 1)[0]), pad,
                    (1, _pair(dilation, 1)[0]), groups).squeeze(2)
    return out.squeeze(0) if unbatched else out


def _F_conv_transpose2d(input, weight, bias=None, stride=1, padding=0, output_padding=0, groups=1, dilation=1):
    x = _floatify(input)
    w = _tens(weight)
    unbatched = x.ndim == 3
    if unbatched:
        x = x.unsqueeze(0)
    X, Wt = x._data, w._data.astype(x._data.dtype, copy=False)
    N, Cin, H, Wd = X.shape
    _, Og, KH, KW = Wt.shape
    G = groups
    if Cin != Wt.shape[0]:
        raise RuntimeError(f"Given transposed=1, weight of size {list(Wt.shape)}, expected input{list(X.shape)} to "
                           f"have {Wt.shape[0]} channels, but got {Cin} channels instead")
    Ci = Cin // G
    Cout = Og * G
    s, p, op, d = _pair(stride), _pair(padding), _pair(output_padding), _pair(dilation)
    x_g = X.reshape(N, G, Ci, H, Wd)
    w_g = Wt.reshape(G, Ci, Og, KH, KW)
    cols = np.einsum('ngiyx,giokl->ngoklyx', x_g, w_g, optimize=True).reshape(N, Cout, KH, KW, H, Wd)
    Hf = (H - 1) * s[0] + d[0] * (KH - 1) + 1 + op[0]
    Wf = (Wd - 1) * s[1] + d[1] * (KW - 1) + 1 + op[1]
    full_ = _col2im(cols, (N, Cout, Hf, Wf), s, d)
    out = full_[:, :, p[0]:Hf - p[0], p[1]:Wf - p[1]]

    def back(g):
        gf = np.zeros((N, Cout, Hf, Wf), dtype=g.dtype)
        gf[:, :, p[0]:Hf - p[0], p[1]:Wf - p[1]] = g
        gcols = _im2col(gf, KH, KW, H, Wd, s, d).reshape(N, G, Og, KH, KW, H, Wd)
        gx = np.einsum('ngoklyx,giokl->ngiyx', gcols, w_g, optimize=True).reshape(X.shape)
        gw = np.einsum('ngoklyx,ngiyx->giokl', gcols, x_g, optimize=True).reshape(Wt.shape)
        return gx, gw
    res = _result(np.ascontiguousarray(out), (x, w), back, 'ConvolutionBackward0')
    if bias is not None:
        res = res + _tens(bias).reshape(1, -1, 1, 1)
    return res.squeeze(0) if unbatched else res


def _F_conv_transpose1d(input, weight, bias=None, stride=1, padding=0, output_padding=0, groups=1, dilation=1):
    x = _tens(input)
    unbatched = x.ndim == 2
    if unbatched:
        x = x.unsqueeze(0)
    o = lambda v: (0, _pair(v, 1)[0])
    out = _F_conv_transpose2d(x.unsqueeze(2), _tens(weight).unsqueeze(2), bias, (1, _pair(stride, 1)[0]),
                              o(padding), o(output_padding), groups, (1, _pair(dilation, 1)[0])).squeeze(2)
    return out.squeeze(0) if unbatched else out


def _pool_out(L, k, s, p, d, ceil_mode):
    num = L + 2 * p - d * (k - 1) - 1
    o = (-(-num // s) if ceil_mode else num // s) + 1
    if ceil_mode and (o - 1) * s >= L + p:
        o -= 1
    return o


def _pool_setup(input, kernel_size, stride, padding, dilation, ceil_mode, name):
    x = _floatify(input)
    unbatched = x.ndim == 3
    if unbatched:
        x = x.unsqueeze(0)
    if x.ndim != 4:
        raise RuntimeError(f"{name}: Expected 3D or 4D input, got {x.ndim}D")
    k = _pair(kernel_size)
    s = _pair(stride) if stride not in (None, [], ()) else k
    p, d = _pair(padding), _pair(dilation)
    for kk, pp in zip(k, p):
        if pp > kk // 2:
            raise RuntimeError(f"pad should be at most half of effective kernel size, but got pad={pp}, "
                               f"kernel_size={kk}")
    N, C, H, W = x._data.shape
    OH = _pool_out(H, k[0], s[0], p[0], d[0], ceil_mode)
    OW = _pool_out(W, k[1], s[1], p[1], d[1], ceil_mode)
    eh = _bmax(0, (OH - 1) * s[0] + d[0] * (k[0] - 1) + 1 - (H + 2 * p[0]))
    ew = _bmax(0, (OW - 1) * s[1] + d[1] * (k[1] - 1) + 1 - (W + 2 * p[1]))
    pads = ((0, 0), (0, 0), (p[0], p[0] + eh), (p[1], p[1] + ew))
    return x, unbatched, k, s, p, d, OH, OW, pads


def _F_max_pool2d(input, kernel_size, stride=None, padding=0, dilation=1, ceil_mode=False, return_indices=False):
    x, unbatched, k, s, p, d, OH, OW, pads = _pool_setup(input, kernel_size, stride, padding, dilation, ceil_mode,
                                                          'max_pool2d')
    X = x._data
    N, C, H, W = X.shape
    xp = np.pad(X, pads, constant_values=-np.inf)
    cols = _im2col(xp, k[0], k[1], OH, OW, s, d).reshape(N, C, k[0] * k[1], OH, OW)
    am = cols.argmax(axis=2)[:, :, None]
    out = np.take_along_axis(cols, am, 2)[:, :, 0]

    def back(g):
        gcols = np.zeros(cols.shape, dtype=g.dtype)
        np.put_along_axis(gcols, am, g[:, :, None], 2)
        gxp = _col2im(gcols.reshape(N, C, k[0], k[1], OH, OW), xp.shape, s, d)
        return (gxp[:, :, p[0]:p[0] + H, p[1]:p[1] + W],)
    res = _result(out, (x,), back, 'MaxPool2DWithIndicesBackward0')
    if unbatched:
        res = res.squeeze(0)
    if return_indices:
        a = am[:, :, 0]
        ki, kj = a // k[1], a % k[1]
        oh = np.arange(OH)[:, None]
        ow = np.arange(OW)[None, :]
        row = oh * s[0] + ki * d[0] - p[0]
        col = ow * s[1] + kj * d[1] - p[1]
        idx = Tensor._wrap((row * W + col).astype(np.int64))
        return res, (idx.squeeze(0) if unbatched else idx)
    return res


def _F_avg_pool2d(input, kernel_size, stride=None, padding=0, ceil_mode=False, count_include_pad=True,
                  divisor_override=None):
    x, unbatched, k, s, p, d, OH, OW, pads = _pool_setup(input, kernel_size, stride, padding, 1, ceil_mode,
                                                          'avg_pool2d')
    X = x._data
    N, C, H, W = X.shape
    xp = np.pad(X, pads)
    cols = _im2col(xp, k[0], k[1], OH, OW, s, d).reshape(N, C, k[0] * k[1], OH, OW)
    if divisor_override:
        div_ = np.full((OH, OW), float(divisor_override))
    else:
        mask = np.zeros((1, 1) + xp.shape[2:], dtype=X.dtype)
        if count_include_pad:
            mask[:, :, :H + 2 * p[0], :W + 2 * p[1]] = 1
        else:
            mask[:, :, p[0]:p[0] + H, p[1]:p[1] + W] = 1
        div_ = _im2col(mask, k[0], k[1], OH, OW, s, d).reshape(k[0] * k[1], OH, OW).sum(0)
    div_ = div_.astype(X.dtype)
    out = cols.sum(axis=2) / div_

    def back(g):
        gcols = np.broadcast_to((g / div_)[:, :, None], cols.shape)
        gxp = _col2im(np.ascontiguousarray(gcols).reshape(N, C, k[0], k[1], OH, OW), xp.shape, s, d)
        return (gxp[:, :, p[0]:p[0] + H, p[1]:p[1] + W],)
    res = _result(out.astype(X.dtype), (x,), back, 'AvgPool2DBackward0')
    return res.squeeze(0) if unbatched else res


def _F_lp_pool2d(input, norm_type, kernel_size, stride=None, ceil_mode=False):
    k = _pair(kernel_size)
    out = _F_avg_pool2d(_tens(input) ** norm_type, k, stride, 0, ceil_mode)
    return (sign(out) * relu(out.abs()) * (k[0] * k[1])) ** (1.0 / norm_type)


sign = _TORCH['sign']


def _to1d(fn2d, input, *args):
    x = _tens(input)
    out = fn2d(x.unsqueeze(-2), *args)
    if isinstance(out, tuple):
        return tuple(o.squeeze(-2) for o in out)
    return out.squeeze(-2)


def _F_max_pool1d(input, kernel_size, stride=None, padding=0, dilation=1, ceil_mode=False, return_indices=False):
    k1 = lambda v: (1, _pair(v, 1)[0])
    return _to1d(_F_max_pool2d, input, k1(kernel_size), k1(stride) if stride is not None else None,
                 (0, _pair(padding, 1)[0]), k1(dilation), ceil_mode, return_indices)


def _F_avg_pool1d(input, kernel_size, stride=None, padding=0, ceil_mode=False, count_include_pad=True):
    k1 = lambda v: (1, _pair(v, 1)[0])
    return _to1d(_F_avg_pool2d, input, k1(kernel_size), k1(stride) if stride is not None else None,
                 (0, _pair(padding, 1)[0]), ceil_mode, count_include_pad)


def _adaptive_bounds(L, O):
    return [((i * L) // O, -(-((i + 1) * L) // O)) for i in range(O)]


def _F_adaptive_pool2d(input, output_size, reduce_fn):
    x = _floatify(input)
    H, W = x.shape[-2:]
    osz = _pair(output_size) if not isinstance(output_size, (tuple, list)) else tuple(output_size)
    OH = H if osz[0] is None else osz[0]
    OW = W if osz[1] is None else osz[1]
    rows = []
    for hs, he in _adaptive_bounds(H, OH):
        cols = []
        for ws, we in _adaptive_bounds(W, OW):
            cols.append(reduce_fn(x[..., hs:he, ws:we], (-2, -1)))
        rows.append(stack(cols, -1))
    return stack(rows, -2)


def _F_adaptive_avg_pool2d(input, output_size):
    x = _floatify(input)
    H, W = x.shape[-2:]
    osz = _pair(output_size) if not isinstance(output_size, (tuple, list)) else tuple(output_size)
    OH = H if osz[0] is None else osz[0]
    OW = W if osz[1] is None else osz[1]
    if H % OH == 0 and W % OW == 0 and x.ndim in (3, 4):
        return _F_avg_pool2d(x, (H // OH, W // OW))
    return _F_adaptive_pool2d(x, (OH, OW), lambda t, d: t.mean(d))


def _F_adaptive_max_pool2d(input, output_size, return_indices=False):
    if return_indices:
        raise _unsupported('adaptive_max_pool2d(return_indices=True)')
    return _F_adaptive_pool2d(input, output_size, lambda t, d: amax(t, d))


def _F_adaptive_avg_pool1d(input, output_size):
    return _to1d(_F_adaptive_avg_pool2d, input, (1, _pair(output_size, 1)[0]))


def _F_adaptive_max_pool1d(input, output_size, return_indices=False):
    return _to1d(_F_adaptive_max_pool2d, input, (1, _pair(output_size, 1)[0]))


def _F_unfold(input, kernel_size, dilation=1, padding=0, stride=1):
    x = _floatify(input)
    unbatched = x.ndim == 3
    if unbatched:
        x = x.unsqueeze(0)
    X = x._data
    N, C, H, W = X.shape
    k, d, p, s = _pair(kernel_size), _pair(dilation), _pair(padding), _pair(stride)
    xp = np.pad(X, ((0, 0), (0, 0), (p[0], p[0]), (p[1], p[1])))
    OH = (xp.shape[2] - d[0] * (k[0] - 1) - 1) // s[0] + 1
    OW = (xp.shape[3] - d[1] * (k[1] - 1) - 1) // s[1] + 1
    cols = _im2col(xp, k[0], k[1], OH, OW, s, d)
    out = cols.reshape(N, C * k[0] * k[1], OH * OW)

    def back(g):
        gxp = _col2im(g.reshape(cols.shape), xp.shape, s, d)
        return (gxp[:, :, p[0]:p[0] + H, p[1]:p[1] + W],)
    res = _result(out, (x,), back, 'Im2ColBackward0')
    return res.squeeze(0) if unbatched else res


def _F_fold(input, output_size, kernel_size, dilation=1, padding=0, stride=1):
    x = _floatify(input)
    unbatched = x.ndim == 2
    if unbatched:
        x = x.unsqueeze(0)
    X = x._data
    k, d, p, s = _pair(kernel_size), _pair(dilation), _pair(padding), _pair(stride)
    H, W = _pair(output_size)
    N = X.shape[0]
    C = X.shape[1] // (k[0] * k[1])
    Hp, Wp = H + 2 * p[0], W + 2 * p[1]
    OH = (Hp - d[0] * (k[0] - 1) - 1) // s[0] + 1
    OW = (Wp - d[1] * (k[1] - 1) - 1) // s[1] + 1
    cols = X.reshape(N, C, k[0], k[1], OH, OW)
    full_ = _col2im(cols, (N, C, Hp, Wp), s, d)
    out = full_[:, :, p[0]:p[0] + H, p[1]:p[1] + W]

    def back(g):
        gp = np.pad(g, ((0, 0), (0, 0), (p[0], p[0]), (p[1], p[1])))
        return (_im2col(gp, k[0], k[1], OH, OW, s, d).reshape(X.shape),)
    res = _result(np.ascontiguousarray(out), (x,), back, 'Col2ImBackward0')
    return res.squeeze(0) if unbatched else res


def _F_layer_norm(input, normalized_shape, weight=None, bias=None, eps=1e-5):
    x = _floatify(input)
    if isinstance(normalized_shape, int):
        normalized_shape = (normalized_shape,)
    k = len(normalized_shape)
    if tuple(x.shape[-k:]) != tuple(normalized_shape):
        raise RuntimeError(f"Given normalized_shape={list(normalized_shape)}, expected input with shape "
                           f"[*, {', '.join(str(s) for s in normalized_shape)}], but got input of size{list(x.shape)}")
    dims = tuple(range(-k, 0))
    mu = x.mean(dims, keepdim=True)
    v = x.var(dims, unbiased=False, keepdim=True)
    out = (x - mu) * rsqrt_(v + eps)
    if weight is not None:
        out = out * weight
    if bias is not None:
        out = out + bias
    return out


rsqrt_ = _TORCH['rsqrt']


def _F_rms_norm(input, normalized_shape, weight=None, eps=None):
    x = _floatify(input)
    if isinstance(normalized_shape, int):
        normalized_shape = (normalized_shape,)
    dims = tuple(range(-len(normalized_shape), 0))
    e = eps if eps is not None else float(np.finfo(x._data.dtype).eps)
    out = x * rsqrt_((x * x).mean(dims, keepdim=True) + e)
    return out * weight if weight is not None else out


def _F_batch_norm(input, running_mean, running_var, weight=None, bias=None, training=False, momentum=0.1,
                  eps=1e-5):
    x = _floatify(input)
    dims = (0,) + tuple(range(2, x.ndim))
    shape = [1, -1] + [1] * (x.ndim - 2)
    if training:
        n = x.numel() / x.shape[1]
        if n <= 1:
            raise ValueError(f"Expected more than 1 value per channel when training, got input size {x.shape}")
        mu = x.mean(dims)
        v = x.var(dims, unbiased=False)
        if running_mean is not None:
            m = momentum if momentum is not None else 0.1
            with no_grad():
                running_mean._data[...] = (1 - m) * running_mean._data + m * mu._data
                running_var._data[...] = (1 - m) * running_var._data + m * v._data * n / (n - 1)
    else:
        if running_mean is None:
            mu, v = x.mean(dims), x.var(dims, unbiased=False)
        else:
            mu, v = _tens(running_mean), _tens(running_var)
    out = (x - mu.reshape(shape)) * rsqrt_(v.reshape(shape) + eps)
    if weight is not None:
        out = out * _tens(weight).reshape(shape)
    if bias is not None:
        out = out + _tens(bias).reshape(shape)
    return out


def _F_instance_norm(input, running_mean=None, running_var=None, weight=None, bias=None, use_input_stats=True,
                     momentum=0.1, eps=1e-5):
    x = _floatify(input)
    dims = tuple(range(2, x.ndim))
    shape = [1, -1] + [1] * (x.ndim - 2)
    out = (x - x.mean(dims, keepdim=True)) * rsqrt_(x.var(dims, unbiased=False, keepdim=True) + eps)
    if weight is not None:
        out = out * _tens(weight).reshape(shape)
    if bias is not None:
        out = out + _tens(bias).reshape(shape)
    return out


def _F_group_norm(input, num_groups, weight=None, bias=None, eps=1e-5):
    x = _floatify(input)
    N, C = x.shape[:2]
    if C % num_groups:
        raise RuntimeError(f"Expected number of channels in input to be divisible by num_groups, but got input of "
                           f"shape {list(x.shape)} and num_groups={num_groups}")
    xg = x.reshape(N, num_groups, -1)
    out = ((xg - xg.mean(-1, keepdim=True)) * rsqrt_(xg.var(-1, unbiased=False, keepdim=True) + eps)).reshape(x.shape)
    shape = [1, -1] + [1] * (x.ndim - 2)
    if weight is not None:
        out = out * _tens(weight).reshape(shape)
    if bias is not None:
        out = out + _tens(bias).reshape(shape)
    return out


def _F_local_response_norm(input, size, alpha=1e-4, beta=0.75, k=1.0):
    x = _floatify(input)
    sq = (x * x).unsqueeze(1)
    pad = [0, 0] * (x.ndim - 2) + [size // 2, (size - 1) // 2]
    sq = _F_pad(sq, pad)
    div_ = _F_avg_pool2d(sq.reshape(sq.shape[0], 1, sq.shape[2], -1), (size, 1), stride=1)
    div_ = div_.reshape(x.shape)
    return x / (k + alpha * div_) ** beta


def _F_scaled_dot_product_attention(query, key, value, attn_mask=None, dropout_p=0.0, is_causal=False, scale=None,
                                    enable_gqa=False):
    q, k, v = _floatify(query), _floatify(key), _floatify(value)
    L, S = q.shape[-2], k.shape[-2]
    sc = (1.0 / math.sqrt(q.shape[-1])) if scale is None else scale
    scores = matmul(q, k.transpose(-2, -1)) * sc
    if is_causal:
        causal = np.tril(np.ones((L, S), dtype=bool))
        scores = masked_fill(scores, Tensor._wrap(~causal), float('-inf'))
    if attn_mask is not None:
        m = _tens(attn_mask)
        if m._data.dtype == np.bool_:
            scores = masked_fill(scores, Tensor._wrap(~m._data), float('-inf'))
        else:
            scores = scores + m
    w = softmax(scores, -1)
    if dropout_p > 0:
        w = _F_dropout(w, dropout_p, True)
    return matmul(w, v)


def _interp_indices(n_in, n_out, mode, align_corners, scale=None):
    dst = np.arange(n_out, dtype=np.float64)
    if mode == 'nearest':
        sc = (1.0 / scale) if scale else n_in / n_out
        return np.minimum(np.floor(dst * sc).astype(np.int64), n_in - 1)
    if mode == 'nearest-exact':
        sc = (1.0 / scale) if scale else n_in / n_out
        return np.minimum(np.floor((dst + 0.5) * sc).astype(np.int64), n_in - 1)
    if align_corners:
        src = dst * ((n_in - 1) / (n_out - 1)) if n_out > 1 else np.zeros_like(dst)
    else:
        sc = (1.0 / scale) if scale else n_in / n_out
        src = np.maximum((dst + 0.5) * sc - 0.5, 0)
    i0 = np.minimum(np.floor(src).astype(np.int64), n_in - 1)
    i1 = np.minimum(i0 + 1, n_in - 1)
    lam = src - i0
    return i0, i1, lam


def _F_interpolate(input, size=None, scale_factor=None, mode='nearest', align_corners=None,
                   recompute_scale_factor=None, antialias=False):
    x = _floatify(input)
    nsp = x.ndim - 2
    if mode in ('bicubic', 'area', 'trilinear') and not (mode == 'trilinear' and nsp == 3):
        if mode == 'area':
            return _F_adaptive_avg_pool2d(x, size) if nsp == 2 else _F_adaptive_avg_pool1d(x, size)
        raise _unsupported(f"F.interpolate(mode='{mode}')")
    in_sz = x.shape[2:]
    if size is not None:
        out_sz = _pair(size, nsp) if not isinstance(size, (list, tuple)) else tuple(size)
        scales = [None] * nsp
    else:
        sf = scale_factor if isinstance(scale_factor, (list, tuple)) else [scale_factor] * nsp
        out_sz = tuple(int(math.floor(n * f)) for n, f in zip(in_sz, sf))
        scales = list(sf) if not recompute_scale_factor else [None] * nsp
    out = x
    for i in range(nsp):
        d = 2 + i
        if mode.startswith('nearest'):
            idx = _interp_indices(in_sz[i], out_sz[i], mode, align_corners, scales[i])
            out = index_select(out, d, Tensor._wrap(idx))
        else:
            i0, i1, lam = _interp_indices(in_sz[i], out_sz[i], 'linear', align_corners, scales[i])
            shape = [1] * out.ndim
            shape[d] = -1
            lam_t = Tensor._wrap(lam.astype(x._data.dtype).reshape(shape))
            out = index_select(out, d, Tensor._wrap(i0)) * (1 - lam_t) + index_select(out, d, Tensor._wrap(i1)) * lam_t
    return out


def _F_upsample(input, size=None, scale_factor=None, mode='nearest', align_corners=None):
    return _F_interpolate(input, size, scale_factor, mode, align_corners)


def _F_pixel_shuffle(input, upscale_factor):
    x = _tens(input)
    r = upscale_factor
    N, C, H, W = x.shape[-4:] if x.ndim == 4 else (1,) + tuple(x.shape)
    out = x.reshape(-1, C // (r * r), r, r, H, W).permute(0, 1, 4, 2, 5, 3).reshape(-1, C // (r * r), H * r, W * r)
    return out if x.ndim == 4 else out.squeeze(0)


def _F_pixel_unshuffle(input, downscale_factor):
    x = _tens(input)
    r = downscale_factor
    N, C, H, W = x.shape
    return x.reshape(N, C, H // r, r, W // r, r).permute(0, 1, 3, 5, 2, 4).reshape(N, C * r * r, H // r, W // r)


def _F_multi_head_attention_forward(*a, **k):
    raise _unsupported('F.multi_head_attention_forward', 'use nn.MultiheadAttention')


_FUNCTIONAL = {
    'relu': _F_relu, 'relu_': _F_relu, 'relu6': _F_relu6, 'leaky_relu': _F_leaky_relu, 'elu': _F_elu,
    'selu': _F_selu, 'celu': _F_celu, 'gelu': _F_gelu, 'silu': _F_silu, 'mish': _F_mish, 'softplus': _F_softplus,
    'hardtanh': _F_hardtanh, 'hardsigmoid': _F_hardsigmoid, 'hardswish': _F_hardswish, 'logsigmoid': _F_logsigmoid,
    'softsign': _F_softsign, 'tanhshrink': _F_tanhshrink, 'threshold': _F_threshold, 'glu': _F_glu,
    'softmin': _F_softmin, 'prelu': _F_prelu, 'rrelu': _F_rrelu, 'gumbel_softmax': _F_gumbel_softmax,
    'sigmoid': sigmoid, 'tanh': tanh, 'softmax': softmax, 'log_softmax': log_softmax,
    'dropout': _F_dropout, 'dropout1d': _F_dropout_nd, 'dropout2d': _F_dropout_nd, 'dropout3d': _F_dropout_nd,
    'alpha_dropout': _F_alpha_dropout, 'feature_alpha_dropout': _F_alpha_dropout,
    'linear': _F_linear, 'bilinear': _F_bilinear,
    'mse_loss': _F_mse_loss, 'l1_loss': _F_l1_loss, 'smooth_l1_loss': _F_smooth_l1_loss, 'huber_loss': _F_huber_loss,
    'cross_entropy': _F_cross_entropy, 'nll_loss': _F_nll_loss, 'binary_cross_entropy': _F_binary_cross_entropy,
    'binary_cross_entropy_with_logits': _F_binary_cross_entropy_with_logits, 'kl_div': _F_kl_div,
    'poisson_nll_loss': _F_poisson_nll_loss, 'gaussian_nll_loss': _F_gaussian_nll_loss,
    'margin_ranking_loss': _F_margin_ranking_loss, 'hinge_embedding_loss': _F_hinge_embedding_loss,
    'cosine_embedding_loss': _F_cosine_embedding_loss, 'soft_margin_loss': _F_soft_margin_loss,
    'multilabel_soft_margin_loss': _F_multilabel_soft_margin_loss, 'triplet_margin_loss': _F_triplet_margin_loss,
    'cosine_similarity': _F_cosine_similarity, 'pairwise_distance': _F_pairwise_distance,
    'normalize': _F_normalize, 'one_hot': _F_one_hot, 'embedding': _F_embedding, 'pad': _F_pad,
    'conv1d': _F_conv1d, 'conv2d': _F_conv2d, 'conv_transpose1d': _F_conv_transpose1d,
    'conv_transpose2d': _F_conv_transpose2d,
    'max_pool1d': _F_max_pool1d, 'max_pool2d': _F_max_pool2d, 'avg_pool1d': _F_avg_pool1d,
    'avg_pool2d': _F_avg_pool2d, 'lp_pool2d': _F_lp_pool2d,
    'adaptive_avg_pool1d': _F_adaptive_avg_pool1d, 'adaptive_avg_pool2d': _F_adaptive_avg_pool2d,
    'adaptive_max_pool1d': _F_adaptive_max_pool1d, 'adaptive_max_pool2d': _F_adaptive_max_pool2d,
    'unfold': _F_unfold, 'fold': _F_fold,
    'layer_norm': _F_layer_norm, 'rms_norm': _F_rms_norm, 'batch_norm': _F_batch_norm,
    'instance_norm': _F_instance_norm, 'group_norm': _F_group_norm, 'local_response_norm': _F_local_response_norm,
    'scaled_dot_product_attention': _F_scaled_dot_product_attention,
    'interpolate': _F_interpolate, 'upsample': _F_upsample, 'pixel_shuffle': _F_pixel_shuffle,
    'pixel_unshuffle': _F_pixel_unshuffle, 'multi_head_attention_forward': _F_multi_head_attention_forward,
}

for _n in ['conv1d', 'conv2d', 'conv_transpose1d', 'conv_transpose2d', 'max_pool1d', 'max_pool2d', 'avg_pool1d',
           'adaptive_avg_pool1d', 'layer_norm', 'batch_norm', 'group_norm', 'instance_norm', 'dropout', 'embedding',
           'selu', 'celu', 'threshold', 'cosine_similarity', 'pairwise_distance', 'pixel_shuffle',
           'pixel_unshuffle', 'prelu', 'rrelu', 'hardshrink' if False else 'glu', 'bilinear']:
    _TORCH.setdefault(_n, _FUNCTIONAL[_n])
_TORCH['dropout'] = lambda input, p=0.5, train=True: _F_dropout(input, p, train)
_TORCH['alpha_dropout'] = lambda input, p=0.5, train=True: _F_alpha_dropout(input, p, train)


# =============================================================================
# nn.init
# =============================================================================

def _calculate_fan_in_and_fan_out(tensor):
    if tensor.dim() < 2:
        raise ValueError("Fan in and fan out can not be computed for tensor with fewer than 2 dimensions")
    receptive = int(np.prod(tensor.shape[2:])) if tensor.dim() > 2 else 1
    return tensor.shape[1] * receptive, tensor.shape[0] * receptive


def calculate_gain(nonlinearity, param=None):
    linear = ['linear', 'conv1d', 'conv2d', 'conv3d', 'conv_transpose1d', 'conv_transpose2d', 'conv_transpose3d',
              'sigmoid']
    if nonlinearity in linear:
        return 1
    if nonlinearity == 'tanh':
        return 5.0 / 3
    if nonlinearity == 'relu':
        return math.sqrt(2.0)
    if nonlinearity == 'leaky_relu':
        slope = 0.01 if param is None else param
        return math.sqrt(2.0 / (1 + slope ** 2))
    if nonlinearity == 'selu':
        return 3.0 / 4
    raise ValueError(f"Unsupported nonlinearity {nonlinearity}")


def _init_fill(t, arr):
    with no_grad():
        if not t._data.flags.writeable:
            t._data = t._data.copy()
        t._data[...] = np.asarray(arr).astype(t._data.dtype)
    return t


def _fan(t, mode):
    fi, fo = _calculate_fan_in_and_fan_out(t)
    if mode not in ('fan_in', 'fan_out'):
        raise ValueError(f"Mode {mode} not supported, please use one of fan_in, fan_out")
    return fi if mode == 'fan_in' else fo


def _init_uniform_(tensor, a=0.0, b=1.0, generator=None):
    return _init_fill(tensor, a + (b - a) * np.random.random_sample(tensor._data.shape))


def _init_normal_(tensor, mean=0.0, std=1.0, generator=None):
    return _init_fill(tensor, mean + std * np.random.standard_normal(tensor._data.shape))


def _init_trunc_normal_(tensor, mean=0.0, std=1.0, a=-2.0, b=2.0, generator=None):
    out = mean + std * np.random.standard_normal(tensor._data.shape)
    bad = (out < a) | (out > b)
    while bad.any():
        out[bad] = mean + std * np.random.standard_normal(int(bad.sum()))
        bad = (out < a) | (out > b)
    return _init_fill(tensor, out)


def _init_constant_(tensor, val):
    return _init_fill(tensor, np.full(tensor._data.shape, val))


def _init_ones_(tensor):
    return _init_constant_(tensor, 1.0)


def _init_zeros_(tensor):
    return _init_constant_(tensor, 0.0)


def _init_eye_(tensor):
    if tensor.dim() != 2:
        raise ValueError("Only tensors with 2 dimensions are supported")
    return _init_fill(tensor, np.eye(*tensor.shape))


def _init_dirac_(tensor, groups=1):
    out = np.zeros(tensor._data.shape)
    O = tensor.shape[0] // groups
    mins = _bmin(O, tensor.shape[1])
    for g in range(groups):
        for d in range(mins):
            idx = (g * O + d, d) + tuple(s // 2 for s in tensor.shape[2:])
            out[idx] = 1
    return _init_fill(tensor, out)


def _init_xavier_uniform_(tensor, gain=1.0, generator=None):
    fi, fo = _calculate_fan_in_and_fan_out(tensor)
    a = gain * math.sqrt(6.0 / (fi + fo))
    return _init_uniform_(tensor, -a, a)


def _init_xavier_normal_(tensor, gain=1.0, generator=None):
    fi, fo = _calculate_fan_in_and_fan_out(tensor)
    return _init_normal_(tensor, 0.0, gain * math.sqrt(2.0 / (fi + fo)))


def _init_kaiming_uniform_(tensor, a=0, mode='fan_in', nonlinearity='leaky_relu', generator=None):
    std = calculate_gain(nonlinearity, a) / math.sqrt(_fan(tensor, mode))
    bound = math.sqrt(3.0) * std
    return _init_uniform_(tensor, -bound, bound)


def _init_kaiming_normal_(tensor, a=0, mode='fan_in', nonlinearity='leaky_relu', generator=None):
    std = calculate_gain(nonlinearity, a) / math.sqrt(_fan(tensor, mode))
    return _init_normal_(tensor, 0.0, std)


def _init_orthogonal_(tensor, gain=1, generator=None):
    rows = tensor.shape[0]
    cols = tensor.numel() // rows
    flat = np.random.standard_normal((rows, cols))
    if rows < cols:
        flat = flat.T
    q, r = np.linalg.qr(flat)
    q *= np.sign(np.diag(r))
    if rows < cols:
        q = q.T
    return _init_fill(tensor, gain * q.reshape(tensor._data.shape))


def _init_sparse_(tensor, sparsity, std=0.01, generator=None):
    rows, cols = tensor.shape
    out = np.random.standard_normal((rows, cols)) * std
    nz = int(math.ceil(sparsity * rows))
    for c in range(cols):
        out[np.random.permutation(rows)[:nz], c] = 0
    return _init_fill(tensor, out)


_INIT = {
    'calculate_gain': calculate_gain, '_calculate_fan_in_and_fan_out': _calculate_fan_in_and_fan_out,
    'uniform_': _init_uniform_, 'normal_': _init_normal_, 'trunc_normal_': _init_trunc_normal_,
    'constant_': _init_constant_, 'ones_': _init_ones_, 'zeros_': _init_zeros_, 'eye_': _init_eye_,
    'dirac_': _init_dirac_, 'xavier_uniform_': _init_xavier_uniform_, 'xavier_normal_': _init_xavier_normal_,
    'kaiming_uniform_': _init_kaiming_uniform_, 'kaiming_normal_': _init_kaiming_normal_,
    'orthogonal_': _init_orthogonal_, 'sparse_': _init_sparse_,
}
for _k in list(_INIT):
    if _k.endswith('_') and not _k.startswith('_'):
        _INIT[_k[:-1]] = _INIT[_k]  # deprecated aliases (nn.init.normal)


# =============================================================================
# nn.Module and containers
# =============================================================================

class Parameter(Tensor):
    def __init__(self, data=None, requires_grad=True):
        if data is None:
            data = np.zeros((0,), dtype=_default_float())
        arr = data._data if isinstance(data, Tensor) else _arr_from_data(data)
        if not arr.flags.writeable:
            arr = arr.copy()
        self._init(arr)
        if requires_grad:
            self.requires_grad_(True)

    def __repr__(self):
        return 'Parameter containing:\n' + Tensor.__repr__(self.detach()) + ''

    def __reduce_ex__(self, proto):
        return (_rebuild_tensor, (Parameter, self._data.copy(), self._requires_grad))


class Buffer(Tensor):
    def __init__(self, data, persistent=True):
        self._init(_arr(data))
        self.persistent = persistent


_IncompatibleKeys = collections.namedtuple('IncompatibleKeys', ['missing_keys', 'unexpected_keys'])


class Module:
    training = True
    dump_patches = False
    _version = 1

    def __init__(self, *args, **kwargs):
        object.__setattr__(self, '_parameters', collections.OrderedDict())
        object.__setattr__(self, '_buffers', collections.OrderedDict())
        object.__setattr__(self, '_non_persistent_buffers_set', set())
        object.__setattr__(self, '_modules', collections.OrderedDict())
        object.__setattr__(self, '_forward_hooks', collections.OrderedDict())
        object.__setattr__(self, '_forward_pre_hooks', collections.OrderedDict())
        object.__setattr__(self, 'training', True)

    def forward(self, *args, **kwargs):
        raise NotImplementedError(f'Module [{type(self).__name__}] is missing the required "forward" function')

    def __call__(self, *args, **kwargs):
        for hook in list(self.__dict__.get('_forward_pre_hooks', {}).values()):
            r = hook(self, args)
            if r is not None:
                args = r if isinstance(r, tuple) else (r,)
        out = self.forward(*args, **kwargs)
        for hook in list(self.__dict__.get('_forward_hooks', {}).values()):
            r = hook(self, args, out)
            if r is not None:
                out = r
        return out

    def register_forward_hook(self, hook, *a, **k):
        key = id(hook)
        self._forward_hooks[key] = hook
        return _DictHandle(self._forward_hooks, key)

    def register_forward_pre_hook(self, hook, *a, **k):
        key = id(hook)
        self._forward_pre_hooks[key] = hook
        return _DictHandle(self._forward_pre_hooks, key)

    def register_full_backward_hook(self, hook, *a, **k):
        raise _unsupported('Module.register_full_backward_hook')

    register_backward_hook = register_full_backward_hook

    def __setattr__(self, name, value):
        params = self.__dict__.get('_parameters')
        if isinstance(value, Parameter):
            if params is None:
                raise AttributeError("cannot assign parameters before Module.__init__() call")
            self._remove_name(name)
            params[name] = value
        elif params is not None and name in params:
            if value is not None:
                raise TypeError(f"cannot assign '{type(value).__name__}' as parameter '{name}' "
                                "(torch.nn.Parameter or None expected)")
            params[name] = None
        elif isinstance(value, Module):
            mods = self.__dict__.get('_modules')
            if mods is None:
                raise AttributeError("cannot assign module before Module.__init__() call")
            self._remove_name(name)
            mods[name] = value
        elif self.__dict__.get('_modules') is not None and name in self._modules:
            if value is not None:
                raise TypeError(f"cannot assign '{type(value).__name__}' as child module '{name}' "
                                "(torch.nn.Module or None expected)")
            self._modules[name] = None
        elif self.__dict__.get('_buffers') is not None and name in self._buffers:
            if value is not None and not isinstance(value, Tensor):
                raise TypeError(f"cannot assign '{type(value).__name__}' as buffer '{name}' "
                                "(torch.Tensor or None expected)")
            self._buffers[name] = value
        elif isinstance(value, Buffer):
            self.register_buffer(name, value, value.persistent)
        else:
            object.__setattr__(self, name, value)

    def _remove_name(self, name):
        for d in ('_parameters', '_modules', '_buffers'):
            dd = self.__dict__.get(d)
            if dd is not None and name in dd:
                del dd[name]
        self.__dict__.pop(name, None)

    def __getattr__(self, name):
        d = self.__dict__
        for k in ('_parameters', '_buffers', '_modules'):
            if k in d and name in d[k]:
                return d[k][name]
        raise AttributeError(f"'{type(self).__name__}' object has no attribute '{name}'")

    def __delattr__(self, name):
        for k in ('_parameters', '_buffers', '_modules'):
            if name in self.__dict__.get(k, {}):
                del self.__dict__[k][name]
                return
        object.__delattr__(self, name)

    def __dir__(self):
        return sorted(set(object.__dir__(self)) | set(self._parameters) | set(self._modules) | set(self._buffers))

    def register_parameter(self, name, param):
        if '_parameters' not in self.__dict__:
            raise AttributeError("cannot assign parameter before Module.__init__() call")
        if param is not None and not isinstance(param, Parameter):
            raise TypeError(f"cannot assign '{type(param).__name__}' object to parameter '{name}' "
                            "(torch.nn.Parameter or None required)")
        self._remove_name(name)
        self._parameters[name] = param

    def register_buffer(self, name, tensor, persistent=True):
        if '_buffers' not in self.__dict__:
            raise AttributeError("cannot assign buffer before Module.__init__() call")
        if tensor is not None and not isinstance(tensor, Tensor):
            raise TypeError(f"cannot assign '{type(tensor).__name__}' object to buffer '{name}' "
                            "(torch Tensor or None required)")
        self._remove_name(name)
        self._buffers[name] = tensor
        if persistent:
            self._non_persistent_buffers_set.discard(name)
        else:
            self._non_persistent_buffers_set.add(name)

    def add_module(self, name, module):
        if module is not None and not isinstance(module, Module):
            raise TypeError(f"{type(module).__name__} is not a Module subclass")
        self._remove_name(name)
        self._modules[name] = module

    register_module = add_module

    def get_submodule(self, target):
        mod = self
        for part in target.split('.') if target else []:
            mod = getattr(mod, part)
        return mod

    def get_parameter(self, target):
        mod, _, name = target.rpartition('.')
        return getattr(self.get_submodule(mod), name)

    # --- iteration ---
    def named_modules(self, memo=None, prefix='', remove_duplicate=True):
        if memo is None:
            memo = set()
        if remove_duplicate:
            if id(self) in memo:
                return
            memo.add(id(self))
        yield prefix, self
        for name, m in self._modules.items():
            if m is None:
                continue
            yield from m.named_modules(memo, prefix + ('.' if prefix else '') + name, remove_duplicate)

    def modules(self):
        for _, m in self.named_modules():
            yield m

    def named_children(self):
        seen = set()
        for name, m in self._modules.items():
            if m is not None and id(m) not in seen:
                seen.add(id(m))
                yield name, m

    def children(self):
        for _, m in self.named_children():
            yield m

    def _named_members(self, attr, prefix='', recurse=True, remove_duplicate=True):
        seen = set()
        mods = self.named_modules(prefix=prefix) if recurse else [(prefix, self)]
        for mp, m in mods:
            for k, v in getattr(m, attr).items():
                if v is None or (remove_duplicate and id(v) in seen):
                    continue
                if attr == '_buffers' and False:
                    continue
                seen.add(id(v))
                yield mp + ('.' if mp else '') + k, v

    def named_parameters(self, prefix='', recurse=True, remove_duplicate=True):
        return self._named_members('_parameters', prefix, recurse, remove_duplicate)

    def parameters(self, recurse=True):
        for _, p in self.named_parameters(recurse=recurse):
            yield p

    def named_buffers(self, prefix='', recurse=True, remove_duplicate=True):
        return self._named_members('_buffers', prefix, recurse, remove_duplicate)

    def buffers(self, recurse=True):
        for _, b in self.named_buffers(recurse=recurse):
            yield b

    # --- state ---
    def state_dict(self, *args, destination=None, prefix='', keep_vars=False):
        if destination is None:
            destination = collections.OrderedDict()
        for name, p in self._parameters.items():
            if p is not None:
                destination[prefix + name] = p if keep_vars else p.detach()
        for name, b in self._buffers.items():
            if b is not None and name not in self._non_persistent_buffers_set:
                destination[prefix + name] = b if keep_vars else b.detach()
        for name, m in self._modules.items():
            if m is not None:
                m.state_dict(destination=destination, prefix=prefix + name + '.', keep_vars=keep_vars)
        return destination

    def load_state_dict(self, state_dict, strict=True, assign=False):
        own = self.state_dict(keep_vars=True)
        missing = [k for k in own if k not in state_dict]
        unexpected = [k for k in state_dict if k not in own]
        errors = []
        for k, v in state_dict.items():
            if k not in own:
                continue
            tgt = own[k]
            src = _arr(v)
            if tuple(src.shape) != tuple(tgt._data.shape):
                errors.append(f'size mismatch for {k}: copying a param with shape {Size(src.shape)} from checkpoint, '
                              f'the shape in current model is {tgt.shape}.')
                continue
            with no_grad():
                if not tgt._data.flags.writeable:
                    tgt._data = tgt._data.copy()
                tgt._data[...] = src.astype(tgt._data.dtype)
        if strict and (missing or unexpected):
            if missing:
                errors.insert(0, 'Missing key(s) in state_dict: ' + ', '.join(f'"{k}"' for k in missing) + '.')
            if unexpected:
                errors.insert(0, 'Unexpected key(s) in state_dict: ' + ', '.join(f'"{k}"' for k in unexpected) + '.')
        if errors:
            raise RuntimeError(f'Error(s) in loading state_dict for {type(self).__name__}:\n\t' + '\n\t'.join(errors))
        return _IncompatibleKeys(missing, unexpected)

    # --- modes ---
    def train(self, mode=True):
        if not isinstance(mode, builtins.bool):
            raise ValueError("training mode is expected to be boolean")
        for m in self.modules():
            object.__setattr__(m, 'training', mode)
        return self

    def eval(self):
        return self.train(False)

    def requires_grad_(self, requires_grad=True):
        for p in self.parameters():
            p.requires_grad_(requires_grad)
        return self

    def zero_grad(self, set_to_none=True):
        for p in self.parameters():
            if p.grad is not None:
                if set_to_none:
                    p.grad = None
                else:
                    p.grad = zeros_like(p.grad)

    def apply(self, fn):
        for m in self.children():
            m.apply(fn)
        fn(self)
        return self

    def _apply_dtype(self, dt):
        npd = _to_np_dtype(dt)
        for m in self.modules():
            for d in (m._parameters, m._buffers):
                for k, v in d.items():
                    if v is not None and _is_float(v._data.dtype):
                        v._data = v._data.astype(npd)
                        if v.grad is not None:
                            v.grad._data = v.grad._data.astype(npd)
        return self

    def to(self, *args, **kwargs):
        for a in list(args) + list(kwargs.values()):
            if isinstance(a, dtype):
                self._apply_dtype(a)
            elif isinstance(a, Tensor):
                self._apply_dtype(a.dtype)
            elif isinstance(a, (str, device)):
                device(a)
        return self

    def float(self):
        return self._apply_dtype(float32)

    def double(self):
        return self._apply_dtype(float64)

    def half(self):
        return self._apply_dtype(float16)

    def cpu(self):
        return self

    def cuda(self, *a, **k):
        raise _unsupported('CUDA', 'torch.cuda.is_available() is False')

    def type(self, dst_type):
        return self._apply_dtype(dst_type)

    def share_memory(self):
        return self

    def compile(self, *a, **k):
        raise _unsupported('Module.compile')

    def extra_repr(self):
        return ''

    def _get_name(self):
        return type(self).__name__

    def __repr__(self):
        lines = []
        extra = self.extra_repr()
        if extra:
            lines = extra.split('\n')
        for name, m in self._modules.items():
            r = repr(m).replace('\n', '\n  ')
            lines.append(f'({name}): {r}')
        main = self._get_name() + '('
        if lines:
            if len(lines) == 1 and not self._modules:
                main += lines[0]
            else:
                main += '\n  ' + '\n  '.join(lines) + '\n'
        return main + ')'

    def __setstate__(self, state):
        self.__dict__.update(state)


class _DictHandle:
    def __init__(self, d, key):
        self._d, self._k = d, key

    def remove(self):
        self._d.pop(self._k, None)


class Sequential(Module):
    def __init__(self, *args):
        super().__init__()
        if len(args) == 1 and isinstance(args[0], collections.OrderedDict):
            for k, m in args[0].items():
                self.add_module(k, m)
        else:
            for i, m in enumerate(args):
                self.add_module(str(i), m)

    def forward(self, input):
        for m in self._modules.values():
            input = m(input)
        return input

    def __getitem__(self, idx):
        if isinstance(idx, slice):
            return Sequential(collections.OrderedDict(list(self._modules.items())[idx]))
        mods = list(self._modules.values())
        return mods[idx]

    def __setitem__(self, idx, module):
        key = list(self._modules.keys())[idx]
        self._modules[key] = module

    def __delitem__(self, idx):
        keys = list(self._modules.keys())
        for k in (keys[idx] if isinstance(idx, slice) else [keys[idx]]):
            del self._modules[k]

    def __len__(self):
        return len(self._modules)

    def __iter__(self):
        return iter(self._modules.values())

    def append(self, module):
        self.add_module(str(len(self)), module)
        return self

    def extend(self, modules):
        for m in modules:
            self.append(m)
        return self

    def insert(self, index, module):
        mods = list(self._modules.values())
        mods.insert(index, module)
        self._modules.clear()
        for i, m in enumerate(mods):
            self._modules[str(i)] = m
        return self


class ModuleList(Module):
    def __init__(self, modules=None):
        super().__init__()
        if modules is not None:
            self.extend(modules)

    def __getitem__(self, idx):
        if isinstance(idx, slice):
            return ModuleList(list(self._modules.values())[idx])
        return list(self._modules.values())[idx]

    def __setitem__(self, idx, module):
        key = list(self._modules.keys())[idx]
        self.add_module(key, module)

    def __delitem__(self, idx):
        mods = list(self._modules.values())
        del mods[idx]
        self._modules.clear()
        for i, m in enumerate(mods):
            self._modules[str(i)] = m

    def __len__(self):
        return len(self._modules)

    def __iter__(self):
        return iter(self._modules.values())

    def __iadd__(self, modules):
        return self.extend(modules)

    def append(self, module):
        self.add_module(str(len(self)), module)
        return self

    def extend(self, modules):
        for m in modules:
            self.append(m)
        return self

    def insert(self, index, module):
        mods = list(self._modules.values())
        mods.insert(index, module)
        self._modules.clear()
        for i, m in enumerate(mods):
            self._modules[str(i)] = m

    def forward(self, *a, **k):
        raise NotImplementedError("ModuleList has no forward(); iterate over it instead")


class ModuleDict(Module):
    def __init__(self, modules=None):
        super().__init__()
        if modules is not None:
            self.update(modules)

    def __getitem__(self, key):
        return self._modules[key]

    def __setitem__(self, key, module):
        self.add_module(key, module)

    def __delitem__(self, key):
        del self._modules[key]

    def __len__(self):
        return len(self._modules)

    def __iter__(self):
        return iter(self._modules)

    def __contains__(self, key):
        return key in self._modules

    def keys(self):
        return self._modules.keys()

    def items(self):
        return self._modules.items()

    def values(self):
        return self._modules.values()

    def pop(self, key):
        return self._modules.pop(key)

    def clear(self):
        self._modules.clear()

    def update(self, modules):
        items = modules.items() if hasattr(modules, 'items') else modules
        for k, m in items:
            self[k] = m


class ParameterList(Module):
    def __init__(self, values=None):
        super().__init__()
        for v in (values or []):
            self.append(v)

    def __getitem__(self, idx):
        vals = list(self._parameters.values())
        return vals[idx]

    def __setitem__(self, idx, p):
        self.register_parameter(str(idx), p if isinstance(p, Parameter) else Parameter(p))

    def __len__(self):
        return len(self._parameters)

    def __iter__(self):
        return iter(self._parameters.values())

    def append(self, p):
        self.register_parameter(str(len(self)), p if isinstance(p, Parameter) else Parameter(p))
        return self

    def extend(self, ps):
        for p in ps:
            self.append(p)
        return self


class ParameterDict(Module):
    def __init__(self, parameters=None):
        super().__init__()
        if parameters:
            for k, v in (parameters.items() if hasattr(parameters, 'items') else parameters):
                self[k] = v

    def __getitem__(self, k):
        return self._parameters[k]

    def __setitem__(self, k, p):
        self.register_parameter(k, p if isinstance(p, Parameter) else Parameter(p))

    def __len__(self):
        return len(self._parameters)

    def __iter__(self):
        return iter(self._parameters)

    def __contains__(self, k):
        return k in self._parameters

    def keys(self):
        return self._parameters.keys()

    def items(self):
        return self._parameters.items()

    def values(self):
        return self._parameters.values()


# =============================================================================
# nn layers
# =============================================================================

class Identity(Module):
    def __init__(self, *args, **kwargs):
        super().__init__()

    def forward(self, input):
        return input


def _f(fn):
    """Factory for stateless activation modules."""
    return fn


class Linear(Module):
    def __init__(self, in_features, out_features, bias=True, device=None, dtype=None):
        super().__init__()
        self.in_features, self.out_features = in_features, out_features
        npd = _to_np_dtype(dtype) or _default_float()
        self.weight = Parameter(np.empty((out_features, in_features), dtype=npd))
        self.bias = Parameter(np.empty((out_features,), dtype=npd)) if bias else None
        self.reset_parameters()

    def reset_parameters(self):
        _init_kaiming_uniform_(self.weight, a=math.sqrt(5))
        if self.bias is not None:
            fan_in = self.in_features
            bound = 1 / math.sqrt(fan_in) if fan_in > 0 else 0
            _init_uniform_(self.bias, -bound, bound)

    def forward(self, input):
        return _F_linear(input, self.weight, self.bias)

    def extra_repr(self):
        return f'in_features={self.in_features}, out_features={self.out_features}, bias={self.bias is not None}'


class LazyLinear(Module):
    def __init__(self, out_features, bias=True, device=None, dtype=None):
        super().__init__()
        raise _unsupported('nn.LazyLinear')


class Bilinear(Module):
    def __init__(self, in1_features, in2_features, out_features, bias=True, device=None, dtype=None):
        super().__init__()
        self.in1_features, self.in2_features, self.out_features = in1_features, in2_features, out_features
        self.weight = Parameter(np.empty((out_features, in1_features, in2_features), dtype=_default_float()))
        self.bias = Parameter(np.empty((out_features,), dtype=_default_float())) if bias else None
        bound = 1 / math.sqrt(in1_features)
        _init_uniform_(self.weight, -bound, bound)
        if self.bias is not None:
            _init_uniform_(self.bias, -bound, bound)

    def forward(self, input1, input2):
        return _F_bilinear(input1, input2, self.weight, self.bias)


class Embedding(Module):
    def __init__(self, num_embeddings, embedding_dim, padding_idx=None, max_norm=None, norm_type=2.0,
                 scale_grad_by_freq=False, sparse=False, _weight=None, _freeze=False, device=None, dtype=None):
        super().__init__()
        self.num_embeddings, self.embedding_dim = num_embeddings, embedding_dim
        if padding_idx is not None and padding_idx < 0:
            padding_idx += num_embeddings
        self.padding_idx, self.max_norm, self.norm_type = padding_idx, max_norm, norm_type
        if _weight is None:
            self.weight = Parameter(np.empty((num_embeddings, embedding_dim), dtype=_default_float()))
            _init_normal_(self.weight)
            if padding_idx is not None:
                with no_grad():
                    self.weight._data[padding_idx] = 0
        else:
            self.weight = Parameter(_weight, requires_grad=not _freeze)

    @classmethod
    def from_pretrained(cls, embeddings, freeze=True, padding_idx=None, max_norm=None, **k):
        rows, cols = embeddings.shape
        return cls(rows, cols, padding_idx, max_norm, _weight=embeddings, _freeze=freeze)

    def forward(self, input):
        return _F_embedding(input, self.weight, self.padding_idx, self.max_norm, self.norm_type)

    def extra_repr(self):
        s = f'{self.num_embeddings}, {self.embedding_dim}'
        return s + (f', padding_idx={self.padding_idx}' if self.padding_idx is not None else '')


class _ConvNd(Module):
    _n = 2
    _transposed = False

    def __init__(self, in_channels, out_channels, kernel_size, stride=1, padding=0, dilation=1, groups=1,
                 bias=True, padding_mode='zeros', device=None, dtype=None, output_padding=0):
        super().__init__()
        n = self._n
        if in_channels % groups:
            raise ValueError('in_channels must be divisible by groups')
        if out_channels % groups:
            raise ValueError('out_channels must be divisible by groups')
        self.in_channels, self.out_channels = in_channels, out_channels
        self.kernel_size = _pair(kernel_size, n)
        self.stride = _pair(stride, n)
        self.padding = padding if isinstance(padding, str) else _pair(padding, n)
        self.dilation = _pair(dilation, n)
        self.output_padding = _pair(output_padding, n)
        self.groups, self.padding_mode = groups, padding_mode
        if self._transposed:
            shape = (in_channels, out_channels // groups) + self.kernel_size
        else:
            shape = (out_channels, in_channels // groups) + self.kernel_size
        self.weight = Parameter(np.empty(shape, dtype=_default_float()))
        self.bias = Parameter(np.empty((out_channels,), dtype=_default_float())) if bias else None
        self.reset_parameters()

    def reset_parameters(self):
        _init_kaiming_uniform_(self.weight, a=math.sqrt(5))
        if self.bias is not None:
            fan_in, _ = _calculate_fan_in_and_fan_out(self.weight)
            if fan_in:
                bound = 1 / math.sqrt(fan_in)
                _init_uniform_(self.bias, -bound, bound)

    def _pre_pad(self, x):
        if self.padding_mode == 'zeros' or isinstance(self.padding, str) and self.padding == 'valid':
            return x, self.padding
        if isinstance(self.padding, str):
            raise _unsupported(f"padding='same' with padding_mode='{self.padding_mode}'")
        pads = []
        for p in reversed(self.padding):
            pads += [p, p]
        return _F_pad(x, pads, mode=self.padding_mode), 0

    def extra_repr(self):
        s = (f'{self.in_channels}, {self.out_channels}, kernel_size={self.kernel_size}, stride={self.stride}')
        if self.padding not in ((0,) * self._n, 0):
            s += f', padding={self.padding}'
        if self.dilation != (1,) * self._n:
            s += f', dilation={self.dilation}'
        if self.groups != 1:
            s += f', groups={self.groups}'
        if self.bias is None:
            s += ', bias=False'
        return s


class Conv2d(_ConvNd):
    _n = 2

    def forward(self, input):
        x, pad = self._pre_pad(input)
        return _F_conv2d(x, self.weight, self.bias, self.stride, pad, self.dilation, self.groups)


class Conv1d(_ConvNd):
    _n = 1

    def forward(self, input):
        x, pad = self._pre_pad(input)
        return _F_conv1d(x, self.weight, self.bias, self.stride, pad, self.dilation, self.groups)


class ConvTranspose2d(_ConvNd):
    _n = 2
    _transposed = True

    def __init__(self, in_channels, out_channels, kernel_size, stride=1, padding=0, output_padding=0, groups=1,
                 bias=True, dilation=1, padding_mode='zeros', device=None, dtype=None):
        super().__init__(in_channels, out_channels, kernel_size, stride, padding, dilation, groups, bias,
                         padding_mode, output_padding=output_padding)

    def forward(self, input, output_size=None):
        return _F_conv_transpose2d(input, self.weight, self.bias, self.stride, self.padding, self.output_padding,
                                   self.groups, self.dilation)


class ConvTranspose1d(ConvTranspose2d):
    _n = 1

    def forward(self, input, output_size=None):
        return _F_conv_transpose1d(input, self.weight, self.bias, self.stride, self.padding, self.output_padding,
                                   self.groups, self.dilation)


class MaxPool2d(Module):
    def __init__(self, kernel_size, stride=None, padding=0, dilation=1, return_indices=False, ceil_mode=False):
        super().__init__()
        self.kernel_size, self.stride = kernel_size, stride if stride is not None else kernel_size
        self.padding, self.dilation, self.return_indices, self.ceil_mode = padding, dilation, return_indices, ceil_mode

    def forward(self, input):
        return _F_max_pool2d(input, self.kernel_size, self.stride, self.padding, self.dilation, self.ceil_mode,
                             self.return_indices)

    def extra_repr(self):
        return (f'kernel_size={self.kernel_size}, stride={self.stride}, padding={self.padding}, '
                f'dilation={self.dilation}, ceil_mode={self.ceil_mode}')


class MaxPool1d(MaxPool2d):
    def forward(self, input):
        return _F_max_pool1d(input, self.kernel_size, self.stride, self.padding, self.dilation, self.ceil_mode,
                             self.return_indices)


class AvgPool2d(Module):
    def __init__(self, kernel_size, stride=None, padding=0, ceil_mode=False, count_include_pad=True,
                 divisor_override=None):
        super().__init__()
        self.kernel_size, self.stride = kernel_size, stride if stride is not None else kernel_size
        self.padding, self.ceil_mode, self.count_include_pad = padding, ceil_mode, count_include_pad
        self.divisor_override = divisor_override

    def forward(self, input):
        return _F_avg_pool2d(input, self.kernel_size, self.stride, self.padding, self.ceil_mode,
                             self.count_include_pad, self.divisor_override)

    def extra_repr(self):
        return f'kernel_size={self.kernel_size}, stride={self.stride}, padding={self.padding}'


class AvgPool1d(AvgPool2d):
    def forward(self, input):
        return _F_avg_pool1d(input, self.kernel_size, self.stride, self.padding, self.ceil_mode,
                             self.count_include_pad)


class AdaptiveAvgPool2d(Module):
    def __init__(self, output_size):
        super().__init__()
        self.output_size = output_size

    def forward(self, input):
        return _F_adaptive_avg_pool2d(input, self.output_size)

    def extra_repr(self):
        return f'output_size={self.output_size}'


class AdaptiveAvgPool1d(AdaptiveAvgPool2d):
    def forward(self, input):
        return _F_adaptive_avg_pool1d(input, self.output_size)


class AdaptiveMaxPool2d(AdaptiveAvgPool2d):
    def __init__(self, output_size, return_indices=False):
        super().__init__(output_size)

    def forward(self, input):
        return _F_adaptive_max_pool2d(input, self.output_size)


class AdaptiveMaxPool1d(AdaptiveMaxPool2d):
    def forward(self, input):
        return _F_adaptive_max_pool1d(input, self.output_size)


class Flatten(Module):
    def __init__(self, start_dim=1, end_dim=-1):
        super().__init__()
        self.start_dim, self.end_dim = start_dim, end_dim

    def forward(self, input):
        return flatten(input, self.start_dim, self.end_dim)

    def extra_repr(self):
        return f'start_dim={self.start_dim}, end_dim={self.end_dim}'


class Unflatten(Module):
    def __init__(self, dim, unflattened_size):
        super().__init__()
        self.dim, self.unflattened_size = dim, unflattened_size

    def forward(self, input):
        return unflatten(input, self.dim, self.unflattened_size)


class Dropout(Module):
    _fn = staticmethod(_F_dropout)

    def __init__(self, p=0.5, inplace=False):
        super().__init__()
        if p < 0 or p > 1:
            raise ValueError(f"dropout probability has to be between 0 and 1, but got {p}")
        self.p, self.inplace = p, inplace

    def forward(self, input):
        return type(self)._fn(input, self.p, self.training)

    def extra_repr(self):
        return f'p={self.p}, inplace={self.inplace}'


class Dropout1d(Dropout):
    _fn = staticmethod(_F_dropout_nd)


class Dropout2d(Dropout):
    _fn = staticmethod(_F_dropout_nd)


class Dropout3d(Dropout):
    _fn = staticmethod(_F_dropout_nd)


class AlphaDropout(Dropout):
    _fn = staticmethod(_F_alpha_dropout)


class _NormBase(Module):
    def __init__(self, num_features, eps=1e-5, momentum=0.1, affine=True, track_running_stats=True, device=None,
                 dtype=None):
        super().__init__()
        self.num_features, self.eps, self.momentum = num_features, eps, momentum
        self.affine, self.track_running_stats = affine, track_running_stats
        if affine:
            self.weight = Parameter(np.ones(num_features, dtype=_default_float()))
            self.bias = Parameter(np.zeros(num_features, dtype=_default_float()))
        else:
            self.weight = None
            self.bias = None
        if track_running_stats:
            self.register_buffer('running_mean', Tensor._wrap(np.zeros(num_features, dtype=_default_float())))
            self.register_buffer('running_var', Tensor._wrap(np.ones(num_features, dtype=_default_float())))
            self.register_buffer('num_batches_tracked', Tensor._wrap(np.asarray(0, dtype=np.int64)))
        else:
            self.running_mean = None
            self.running_var = None
            self.num_batches_tracked = None

    def reset_running_stats(self):
        if self.track_running_stats:
            self.running_mean._data[...] = 0
            self.running_var._data[...] = 1
            self.num_batches_tracked._data[...] = 0

    def reset_parameters(self):
        self.reset_running_stats()
        if self.affine:
            _init_ones_(self.weight)
            _init_zeros_(self.bias)

    def _check_input_dim(self, x):
        pass

    def forward(self, input):
        self._check_input_dim(input)
        momentum = self.momentum
        if self.training and self.track_running_stats:
            self.num_batches_tracked._data = np.asarray(self.num_batches_tracked._data + 1)
            if self.momentum is None:
                momentum = 1.0 / float(self.num_batches_tracked._data)
        use_batch = self.training or not self.track_running_stats
        return _F_batch_norm(input, self.running_mean if (not self.training or self.track_running_stats) else None,
                             self.running_var if (not self.training or self.track_running_stats) else None,
                             self.weight, self.bias, use_batch, momentum, self.eps)

    def extra_repr(self):
        return (f'{self.num_features}, eps={self.eps}, momentum={self.momentum}, affine={self.affine}, '
                f'track_running_stats={self.track_running_stats}')


class BatchNorm1d(_NormBase):
    def _check_input_dim(self, x):
        if x.dim() not in (2, 3):
            raise ValueError(f"expected 2D or 3D input (got {x.dim()}D input)")


class BatchNorm2d(_NormBase):
    def _check_input_dim(self, x):
        if x.dim() != 4:
            raise ValueError(f"expected 4D input (got {x.dim()}D input)")


class BatchNorm3d(_NormBase):
    def _check_input_dim(self, x):
        if x.dim() != 5:
            raise ValueError(f"expected 5D input (got {x.dim()}D input)")


class _InstanceNorm(_NormBase):
    def __init__(self, num_features, eps=1e-5, momentum=0.1, affine=False, track_running_stats=False, **k):
        super().__init__(num_features, eps, momentum, affine, track_running_stats)

    def forward(self, input):
        return _F_instance_norm(input, None, None, self.weight, self.bias, True, self.momentum, self.eps)


class InstanceNorm1d(_InstanceNorm):
    pass


class InstanceNorm2d(_InstanceNorm):
    pass


class LayerNorm(Module):
    def __init__(self, normalized_shape, eps=1e-5, elementwise_affine=True, bias=True, device=None, dtype=None):
        super().__init__()
        if isinstance(normalized_shape, int):
            normalized_shape = (normalized_shape,)
        self.normalized_shape = tuple(normalized_shape)
        self.eps, self.elementwise_affine = eps, elementwise_affine
        if elementwise_affine:
            self.weight = Parameter(np.ones(self.normalized_shape, dtype=_default_float()))
            self.bias = Parameter(np.zeros(self.normalized_shape, dtype=_default_float())) if bias else None
        else:
            self.weight = None
            self.bias = None

    def forward(self, input):
        return _F_layer_norm(input, self.normalized_shape, self.weight, self.bias, self.eps)

    def extra_repr(self):
        return f'{self.normalized_shape}, eps={self.eps}, elementwise_affine={self.elementwise_affine}'


class RMSNorm(Module):
    def __init__(self, normalized_shape, eps=None, elementwise_affine=True, device=None, dtype=None):
        super().__init__()
        if isinstance(normalized_shape, int):
            normalized_shape = (normalized_shape,)
        self.normalized_shape, self.eps = tuple(normalized_shape), eps
        self.weight = Parameter(np.ones(self.normalized_shape, dtype=_default_float())) if elementwise_affine else None

    def forward(self, input):
        return _F_rms_norm(input, self.normalized_shape, self.weight, self.eps)


class GroupNorm(Module):
    def __init__(self, num_groups, num_channels, eps=1e-5, affine=True, device=None, dtype=None):
        super().__init__()
        self.num_groups, self.num_channels, self.eps, self.affine = num_groups, num_channels, eps, affine
        self.weight = Parameter(np.ones(num_channels, dtype=_default_float())) if affine else None
        self.bias = Parameter(np.zeros(num_channels, dtype=_default_float())) if affine else None

    def forward(self, input):
        return _F_group_norm(input, self.num_groups, self.weight, self.bias, self.eps)


class LocalResponseNorm(Module):
    def __init__(self, size, alpha=1e-4, beta=0.75, k=1.0):
        super().__init__()
        self.size, self.alpha, self.beta, self.k = size, alpha, beta, k

    def forward(self, input):
        return _F_local_response_norm(input, self.size, self.alpha, self.beta, self.k)


def _simple_module(name, fn, params=(), defaults=()):
    """Build an activation/loss-free module class around a functional."""
    def __init__(self, *args, **kwargs):
        Module.__init__(self)
        vals = dict(zip(params, defaults))
        for k_, v_ in zip(params, args):
            vals[k_] = v_
        for k_, v_ in kwargs.items():
            vals[k_] = v_
        for k_, v_ in vals.items():
            object.__setattr__(self, k_, v_)

    def forward(self, input):
        return fn(input, *[getattr(self, p) for p in params if p != 'inplace'])

    def extra_repr(self):
        return ', '.join(f'{p}={getattr(self, p)}' for p in params if p != 'inplace')
    return type(name, (Module,), {'__init__': __init__, 'forward': forward, 'extra_repr': extra_repr})


ReLU = _simple_module('ReLU', lambda x: relu(x), ('inplace',), (False,))
ReLU6 = _simple_module('ReLU6', lambda x: _F_relu6(x), ('inplace',), (False,))
LeakyReLU = _simple_module('LeakyReLU', lambda x, s: _F_leaky_relu(x, s), ('negative_slope', 'inplace'), (0.01, False))
ELU = _simple_module('ELU', lambda x, a: _F_elu(x, a), ('alpha', 'inplace'), (1.0, False))
SELU = _simple_module('SELU', lambda x: _F_selu(x), ('inplace',), (False,))
CELU = _simple_module('CELU', lambda x, a: _F_celu(x, a), ('alpha', 'inplace'), (1.0, False))
GELU = _simple_module('GELU', lambda x, a: _F_gelu(x, a), ('approximate',), ('none',))
SiLU = _simple_module('SiLU', lambda x: _F_silu(x), ('inplace',), (False,))
Mish = _simple_module('Mish', lambda x: _F_mish(x), ('inplace',), (False,))
Sigmoid = _simple_module('Sigmoid', lambda x: sigmoid(x))
Tanh = _simple_module('Tanh', lambda x: tanh(x))
Softplus = _simple_module('Softplus', lambda x, b, t: _F_softplus(x, b, t), ('beta', 'threshold'), (1.0, 20.0))
Hardtanh = _simple_module('Hardtanh', lambda x, a, b: _F_hardtanh(x, a, b), ('min_val', 'max_val', 'inplace'),
                          (-1.0, 1.0, False))
Hardsigmoid = _simple_module('Hardsigmoid', lambda x: _F_hardsigmoid(x), ('inplace',), (False,))
Hardswish = _simple_module('Hardswish', lambda x: _F_hardswish(x), ('inplace',), (False,))
LogSigmoid = _simple_module('LogSigmoid', lambda x: _F_logsigmoid(x))
Softsign = _simple_module('Softsign', lambda x: _F_softsign(x))
Tanhshrink = _simple_module('Tanhshrink', lambda x: _F_tanhshrink(x))
Threshold = _simple_module('Threshold', lambda x, t, v: _F_threshold(x, t, v), ('threshold', 'value', 'inplace'),
                           (0.0, 0.0, False))
GLU = _simple_module('GLU', lambda x, d: _F_glu(x, d), ('dim',), (-1,))
Softmax = _simple_module('Softmax', lambda x, d: softmax(x, d), ('dim',), (None,))
LogSoftmax = _simple_module('LogSoftmax', lambda x, d: log_softmax(x, d), ('dim',), (None,))
Softmin = _simple_module('Softmin', lambda x, d: _F_softmin(x, d), ('dim',), (None,))
Upsample = _simple_module('Upsample', lambda x, s, f, m, a: _F_interpolate(x, s, f, m, a),
                          ('size', 'scale_factor', 'mode', 'align_corners'), (None, None, 'nearest', None))
PixelShuffle = _simple_module('PixelShuffle', lambda x, r: _F_pixel_shuffle(x, r), ('upscale_factor',))
PixelUnshuffle = _simple_module('PixelUnshuffle', lambda x, r: _F_pixel_unshuffle(x, r), ('downscale_factor',))


class Softmax2d(Module):
    def forward(self, input):
        return softmax(input, -3)


class PReLU(Module):
    def __init__(self, num_parameters=1, init=0.25, device=None, dtype=None):
        super().__init__()
        self.num_parameters = num_parameters
        self.weight = Parameter(np.full(num_parameters, init, dtype=_default_float()))

    def forward(self, input):
        return _F_prelu(input, self.weight)


class ZeroPad2d(Module):
    def __init__(self, padding):
        super().__init__()
        self.padding = _pair(padding, 4) if not isinstance(padding, (tuple, list)) else tuple(padding)

    def forward(self, input):
        return _F_pad(input, self.padding)


class ConstantPad2d(ZeroPad2d):
    def __init__(self, padding, value):
        super().__init__(padding)
        self.value = value

    def forward(self, input):
        return _F_pad(input, self.padding, value=self.value)


class ReflectionPad2d(ZeroPad2d):
    def forward(self, input):
        return _F_pad(input, self.padding, mode='reflect')


class ReplicationPad2d(ZeroPad2d):
    def forward(self, input):
        return _F_pad(input, self.padding, mode='replicate')


class CosineSimilarity(Module):
    def __init__(self, dim=1, eps=1e-8):
        super().__init__()
        self.dim, self.eps = dim, eps

    def forward(self, x1, x2):
        return _F_cosine_similarity(x1, x2, self.dim, self.eps)


class PairwiseDistance(Module):
    def __init__(self, p=2.0, eps=1e-6, keepdim=False):
        super().__init__()
        self.norm, self.eps, self.keepdim = p, eps, keepdim

    def forward(self, x1, x2):
        return _F_pairwise_distance(x1, x2, self.norm, self.eps, self.keepdim)


# --- losses ---

class _Loss(Module):
    def __init__(self, size_average=None, reduce=None, reduction='mean'):
        super().__init__()
        self.reduction = _legacy_reduction(size_average, reduce, reduction)


class MSELoss(_Loss):
    def forward(self, input, target):
        return _F_mse_loss(input, target, reduction=self.reduction)


class L1Loss(_Loss):
    def forward(self, input, target):
        return _F_l1_loss(input, target, reduction=self.reduction)


class SmoothL1Loss(_Loss):
    def __init__(self, size_average=None, reduce=None, reduction='mean', beta=1.0):
        super().__init__(size_average, reduce, reduction)
        self.beta = beta

    def forward(self, input, target):
        return _F_smooth_l1_loss(input, target, reduction=self.reduction, beta=self.beta)


class HuberLoss(_Loss):
    def __init__(self, reduction='mean', delta=1.0):
        super().__init__(reduction=reduction)
        self.delta = delta

    def forward(self, input, target):
        return _F_huber_loss(input, target, self.reduction, self.delta)


class CrossEntropyLoss(_Loss):
    def __init__(self, weight=None, size_average=None, ignore_index=-100, reduce=None, reduction='mean',
                 label_smoothing=0.0):
        super().__init__(size_average, reduce, reduction)
        self.register_buffer('weight', weight)
        self.ignore_index, self.label_smoothing = ignore_index, label_smoothing

    def forward(self, input, target):
        return _F_cross_entropy(input, target, self.weight, ignore_index=self.ignore_index,
                                reduction=self.reduction, label_smoothing=self.label_smoothing)


class NLLLoss(_Loss):
    def __init__(self, weight=None, size_average=None, ignore_index=-100, reduce=None, reduction='mean'):
        super().__init__(size_average, reduce, reduction)
        self.register_buffer('weight', weight)
        self.ignore_index = ignore_index

    def forward(self, input, target):
        return _F_nll_loss(input, target, self.weight, ignore_index=self.ignore_index, reduction=self.reduction)


class BCELoss(_Loss):
    def __init__(self, weight=None, size_average=None, reduce=None, reduction='mean'):
        super().__init__(size_average, reduce, reduction)
        self.register_buffer('weight', weight)

    def forward(self, input, target):
        return _F_binary_cross_entropy(input, target, self.weight, reduction=self.reduction)


class BCEWithLogitsLoss(_Loss):
    def __init__(self, weight=None, size_average=None, reduce=None, reduction='mean', pos_weight=None):
        super().__init__(size_average, reduce, reduction)
        self.register_buffer('weight', weight)
        self.register_buffer('pos_weight', pos_weight)

    def forward(self, input, target):
        return _F_binary_cross_entropy_with_logits(input, target, self.weight, reduction=self.reduction,
                                                   pos_weight=self.pos_weight)


class KLDivLoss(_Loss):
    def __init__(self, size_average=None, reduce=None, reduction='mean', log_target=False):
        super().__init__(size_average, reduce, reduction)
        self.log_target = log_target

    def forward(self, input, target):
        return _F_kl_div(input, target, reduction=self.reduction, log_target=self.log_target)


class GaussianNLLLoss(_Loss):
    def __init__(self, full=False, eps=1e-6, reduction='mean'):
        super().__init__(reduction=reduction)
        self.full, self.eps = full, eps

    def forward(self, input, target, var):
        return _F_gaussian_nll_loss(input, target, var, self.full, self.eps, self.reduction)


class PoissonNLLLoss(_Loss):
    def __init__(self, log_input=True, full=False, size_average=None, eps=1e-8, reduce=None, reduction='mean'):
        super().__init__(size_average, reduce, reduction)
        self.log_input, self.full, self.eps = log_input, full, eps

    def forward(self, input, target):
        return _F_poisson_nll_loss(input, target, self.log_input, self.full, eps=self.eps, reduction=self.reduction)


def _loss2(name, fn, extra=(), defaults=()):
    def __init__(self, *args, **kwargs):
        _Loss.__init__(self, reduction=kwargs.pop('reduction', 'mean'))
        vals = dict(zip(extra, defaults))
        vals.update(zip(extra, args))
        vals.update(kwargs)
        for k_, v_ in vals.items():
            object.__setattr__(self, k_, v_)

    def forward(self, *inputs):
        return fn(*inputs, **{k_: getattr(self, k_) for k_ in extra}, reduction=self.reduction)
    return type(name, (_Loss,), {'__init__': __init__, 'forward': forward})


MarginRankingLoss = _loss2('MarginRankingLoss', _F_margin_ranking_loss, ('margin',), (0.0,))
HingeEmbeddingLoss = _loss2('HingeEmbeddingLoss', _F_hinge_embedding_loss, ('margin',), (1.0,))
CosineEmbeddingLoss = _loss2('CosineEmbeddingLoss', _F_cosine_embedding_loss, ('margin',), (0.0,))
SoftMarginLoss = _loss2('SoftMarginLoss', _F_soft_margin_loss)
MultiLabelSoftMarginLoss = _loss2('MultiLabelSoftMarginLoss', _F_multilabel_soft_margin_loss, ('weight',), (None,))
TripletMarginLoss = _loss2('TripletMarginLoss', _F_triplet_margin_loss, ('margin', 'p', 'eps', 'swap'),
                           (1.0, 2, 1e-6, False))


# --- attention / transformer ---

class MultiheadAttention(Module):
    def __init__(self, embed_dim, num_heads, dropout=0.0, bias=True, add_bias_kv=False, add_zero_attn=False,
                 kdim=None, vdim=None, batch_first=False, device=None, dtype=None):
        super().__init__()
        if embed_dim % num_heads:
            raise AssertionError("embed_dim must be divisible by num_heads")
        if add_bias_kv or add_zero_attn:
            raise _unsupported('MultiheadAttention(add_bias_kv/add_zero_attn)')
        self.embed_dim, self.num_heads, self.dropout, self.batch_first = embed_dim, num_heads, dropout, batch_first
        self.head_dim = embed_dim // num_heads
        self.kdim = kdim if kdim is not None else embed_dim
        self.vdim = vdim if vdim is not None else embed_dim
        self._qkv_same_embed_dim = self.kdim == embed_dim and self.vdim == embed_dim
        f = _default_float()
        if self._qkv_same_embed_dim:
            self.in_proj_weight = Parameter(np.empty((3 * embed_dim, embed_dim), dtype=f))
            self.q_proj_weight = self.k_proj_weight = self.v_proj_weight = None
            _init_xavier_uniform_(self.in_proj_weight)
        else:
            self.q_proj_weight = Parameter(np.empty((embed_dim, embed_dim), dtype=f))
            self.k_proj_weight = Parameter(np.empty((embed_dim, self.kdim), dtype=f))
            self.v_proj_weight = Parameter(np.empty((embed_dim, self.vdim), dtype=f))
            self.register_parameter('in_proj_weight', None)
            for w in (self.q_proj_weight, self.k_proj_weight, self.v_proj_weight):
                _init_xavier_uniform_(w)
        if bias:
            self.in_proj_bias = Parameter(np.zeros(3 * embed_dim, dtype=f))
        else:
            self.register_parameter('in_proj_bias', None)
        self.out_proj = Linear(embed_dim, embed_dim, bias=bias)
        if bias:
            _init_zeros_(self.out_proj.bias)

    def forward(self, query, key, value, key_padding_mask=None, need_weights=True, attn_mask=None,
                average_attn_weights=True, is_causal=False):
        q, k, v = _tens(query), _tens(key), _tens(value)
        unbatched = q.ndim == 2
        if unbatched:
            q, k, v = q.unsqueeze(1), k.unsqueeze(1), v.unsqueeze(1)
            if key_padding_mask is not None:
                key_padding_mask = _tens(key_padding_mask).unsqueeze(0)
        elif self.batch_first:
            q, k, v = q.transpose(0, 1), k.transpose(0, 1), v.transpose(0, 1)
        L, N, E = q.shape
        S = k.shape[0]
        H, Dh = self.num_heads, self.head_dim
        E_ = self.embed_dim
        if self._qkv_same_embed_dim:
            wq, wk, wv = self.in_proj_weight[:E_], self.in_proj_weight[E_:2 * E_], self.in_proj_weight[2 * E_:]
        else:
            wq, wk, wv = self.q_proj_weight, self.k_proj_weight, self.v_proj_weight
        b = self.in_proj_bias
        bq, bk, bv = (b[:E_], b[E_:2 * E_], b[2 * E_:]) if b is not None else (None, None, None)
        Q = _F_linear(q, wq, bq)  # (L, N, E)
        K = _F_linear(k, wk, bk)
        V = _F_linear(v, wv, bv)
        Q = Q.reshape(L, N * H, Dh).transpose(0, 1)  # (N*H, L, Dh)
        K = K.reshape(S, N * H, Dh).transpose(0, 1)
        V = V.reshape(S, N * H, Dh).transpose(0, 1)
        scores = matmul(Q, K.transpose(-2, -1)) / math.sqrt(Dh)  # (N*H, L, S)
        if is_causal and attn_mask is None:
            attn_mask = Tensor._wrap(np.triu(np.ones((L, S), dtype=bool), 1))
        if attn_mask is not None:
            m = _tens(attn_mask)
            if m.ndim == 2:
                m = m.unsqueeze(0)
            if m._data.dtype == np.bool_:
                scores = masked_fill(scores, m, float('-inf'))
            else:
                scores = scores + m
        if key_padding_mask is not None:
            kpm = _tens(key_padding_mask)
            scores = scores.reshape(N, H, L, S)
            if kpm._data.dtype == np.bool_:
                scores = masked_fill(scores, kpm.reshape(N, 1, 1, S), float('-inf'))
            else:
                scores = scores + kpm.reshape(N, 1, 1, S)
            scores = scores.reshape(N * H, L, S)
        w = softmax(scores, -1)
        wd = _F_dropout(w, self.dropout, self.training) if self.dropout > 0 else w
        out = matmul(wd, V)  # (N*H, L, Dh)
        out = out.transpose(0, 1).reshape(L, N, E_)
        out = self.out_proj(out)
        if unbatched:
            out = out.squeeze(1)
        elif self.batch_first:
            out = out.transpose(0, 1)
        if not need_weights:
            return out, None
        w = w.reshape(N, H, L, S)
        if average_attn_weights:
            w = w.mean(1)
        if unbatched:
            w = w.squeeze(0)
        return out, w


def _activation_fn(act):
    if callable(act):
        return act
    return {'relu': relu, 'gelu': _F_gelu}[act]


class TransformerEncoderLayer(Module):
    def __init__(self, d_model, nhead, dim_feedforward=2048, dropout=0.1, activation='relu', layer_norm_eps=1e-5,
                 batch_first=False, norm_first=False, bias=True, device=None, dtype=None):
        super().__init__()
        self.self_attn = MultiheadAttention(d_model, nhead, dropout=dropout, bias=bias, batch_first=batch_first)
        self.linear1 = Linear(d_model, dim_feedforward, bias=bias)
        self.dropout = Dropout(dropout)
        self.linear2 = Linear(dim_feedforward, d_model, bias=bias)
        self.norm_first = norm_first
        self.norm1 = LayerNorm(d_model, eps=layer_norm_eps, bias=bias)
        self.norm2 = LayerNorm(d_model, eps=layer_norm_eps, bias=bias)
        self.dropout1 = Dropout(dropout)
        self.dropout2 = Dropout(dropout)
        self.activation = _activation_fn(activation)

    def _sa(self, x, mask, kpm, is_causal):
        return self.dropout1(self.self_attn(x, x, x, attn_mask=mask, key_padding_mask=kpm, need_weights=False,
                                            is_causal=is_causal)[0])

    def _ff(self, x):
        return self.dropout2(self.linear2(self.dropout(self.activation(self.linear1(x)))))

    def forward(self, src, src_mask=None, src_key_padding_mask=None, is_causal=False):
        x = src
        if self.norm_first:
            x = x + self._sa(self.norm1(x), src_mask, src_key_padding_mask, is_causal)
            x = x + self._ff(self.norm2(x))
        else:
            x = self.norm1(x + self._sa(x, src_mask, src_key_padding_mask, is_causal))
            x = self.norm2(x + self._ff(x))
        return x


class TransformerEncoder(Module):
    def __init__(self, encoder_layer, num_layers, norm=None, enable_nested_tensor=True, mask_check=True):
        super().__init__()
        self.layers = ModuleList([_copy.deepcopy(encoder_layer) for _ in range(num_layers)])
        self.num_layers = num_layers
        self.norm = norm

    def forward(self, src, mask=None, src_key_padding_mask=None, is_causal=None):
        x = src
        for layer in self.layers:
            x = layer(x, src_mask=mask, src_key_padding_mask=src_key_padding_mask, is_causal=bool(is_causal))
        return self.norm(x) if self.norm is not None else x


def _unsupported_module(name):
    def __init__(self, *a, **k):
        raise _unsupported(f'nn.{name}')
    return type(name, (Module,), {'__init__': __init__})


# --- nn.utils ---

def clip_grad_norm_(parameters, max_norm, norm_type=2.0, error_if_nonfinite=False, foreach=None):
    if isinstance(parameters, Tensor):
        parameters = [parameters]
    grads = [p.grad for p in parameters if p.grad is not None]
    if not grads:
        return tensor(0.0)
    norm_type = float(norm_type)
    if norm_type == float('inf'):
        total = _bmax(float(np.abs(g._data).max()) for g in grads)
    else:
        total = float(_bsum(float((np.abs(g._data.astype(np.float64)) ** norm_type).sum()) for g in grads)
                      ** (1.0 / norm_type))
    if error_if_nonfinite and not math.isfinite(total):
        raise RuntimeError(f"The total norm of order {norm_type} for gradients from `parameters` is non-finite")
    coef = max_norm / (total + 1e-6)
    if coef < 1:
        for g in grads:
            g._data = np.asarray(g._data * coef, dtype=g._data.dtype)
    return Tensor._wrap(np.asarray(total, dtype=grads[0]._data.dtype))


def clip_grad_value_(parameters, clip_value, foreach=None):
    if isinstance(parameters, Tensor):
        parameters = [parameters]
    for p in parameters:
        if p.grad is not None:
            p.grad._data = np.asarray(np.clip(p.grad._data, -clip_value, clip_value))


def parameters_to_vector(parameters):
    return cat([p.reshape(-1) for p in parameters])


def vector_to_parameters(vec, parameters):
    i = 0
    for p in parameters:
        n = p.numel()
        with no_grad():
            p._data[...] = vec._data[i:i + n].reshape(p._data.shape)
        i += n


# =============================================================================
# optim
# =============================================================================

class Optimizer:
    def __init__(self, params, defaults):
        self.defaults = defaults
        self.state = collections.defaultdict(dict)
        self.param_groups = []
        if isinstance(params, Tensor):
            raise TypeError("params argument given to the optimizer should be an iterable of Tensors or dicts, but "
                            "got torch.FloatTensor")
        params = list(params)
        if len(params) == 0:
            raise ValueError("optimizer got an empty parameter list")
        if not isinstance(params[0], dict):
            params = [{'params': params}]
        for g in params:
            self.add_param_group(g)

    def add_param_group(self, group):
        group = dict(group)
        ps = group['params']
        group['params'] = [ps] if isinstance(ps, Tensor) else list(ps)
        for p in group['params']:
            if not p.is_leaf:
                raise ValueError("can't optimize a non-leaf Tensor")
        for k, v in self.defaults.items():
            group.setdefault(k, v)
        self.param_groups.append(group)

    def zero_grad(self, set_to_none=True):
        for g in self.param_groups:
            for p in g['params']:
                if p.grad is not None:
                    if set_to_none:
                        p.grad = None
                    else:
                        p.grad._data = np.zeros_like(p.grad._data)

    def step(self, closure=None):
        loss = None
        if closure is not None:
            with enable_grad():
                loss = closure()
        with no_grad():
            for group in self.param_groups:
                for p in group['params']:
                    if p.grad is None:
                        continue
                    g = p.grad._data
                    if group.get('maximize'):
                        g = -g
                    upd = self._update(p, g.astype(p._data.dtype, copy=False), group, self.state[p])
                    if upd is not None:
                        if not p._data.flags.writeable:
                            p._data = p._data.copy()
                        np.subtract(p._data, upd, out=p._data, casting='unsafe')
        return loss

    def _update(self, p, g, group, state):
        raise NotImplementedError

    def state_dict(self):
        index = {}
        groups = []
        for g in self.param_groups:
            ng = {k: v for k, v in g.items() if k != 'params'}
            ng['params'] = []
            for p in g['params']:
                index.setdefault(id(p), len(index))
                ng['params'].append(index[id(p)])
            groups.append(ng)
        state = {}
        for g in self.param_groups:
            for p in g['params']:
                if p in self.state:
                    state[index[id(p)]] = {k: (v.copy() if isinstance(v, np.ndarray) else v)
                                           for k, v in self.state[p].items()}
        return {'state': state, 'param_groups': groups}

    def load_state_dict(self, state_dict):
        params = [p for g in self.param_groups for p in g['params']]
        for g, sg in zip(self.param_groups, state_dict['param_groups']):
            for k, v in sg.items():
                if k != 'params':
                    g[k] = v
        self.state = collections.defaultdict(dict)
        for i, s in state_dict['state'].items():
            self.state[params[int(i)]] = {k: (v.copy() if isinstance(v, np.ndarray) else v) for k, v in s.items()}

    def __repr__(self):
        s = type(self).__name__ + ' ('
        for i, g in enumerate(self.param_groups):
            s += f'\nParameter Group {i}'
            for k in sorted(g):
                if k != 'params':
                    s += f'\n    {k}: {g[k]}'
        return s + '\n)'


class SGD(Optimizer):
    def __init__(self, params, lr=1e-3, momentum=0, dampening=0, weight_decay=0, nesterov=False, *, maximize=False,
                 foreach=None, differentiable=False, fused=None):
        if lr < 0:
            raise ValueError(f"Invalid learning rate: {lr}")
        if nesterov and (momentum <= 0 or dampening != 0):
            raise ValueError("Nesterov momentum requires a momentum and zero dampening")
        super().__init__(params, dict(lr=lr, momentum=momentum, dampening=dampening, weight_decay=weight_decay,
                                      nesterov=nesterov, maximize=maximize))

    def _update(self, p, g, group, state):
        if group['weight_decay']:
            g = g + group['weight_decay'] * p._data
        mom = group['momentum']
        if mom:
            buf = state.get('momentum_buffer')
            if buf is None:
                buf = np.array(g, copy=True)
            else:
                buf = mom * buf + (1 - group['dampening']) * g
            state['momentum_buffer'] = buf.astype(p._data.dtype)
            g = g + mom * buf if group['nesterov'] else buf
        return group['lr'] * g


class Adam(Optimizer):
    _decoupled = False

    def __init__(self, params, lr=1e-3, betas=(0.9, 0.999), eps=1e-8, weight_decay=0, amsgrad=False, *,
                 maximize=False, foreach=None, capturable=False, differentiable=False, fused=None):
        if lr < 0:
            raise ValueError(f"Invalid learning rate: {lr}")
        super().__init__(params, dict(lr=lr, betas=tuple(betas), eps=eps, weight_decay=weight_decay,
                                      amsgrad=amsgrad, maximize=maximize))

    def _update(self, p, g, group, state):
        lr, (b1, b2), eps, wd = group['lr'], group['betas'], group['eps'], group['weight_decay']
        if wd:
            if self._decoupled:
                p._data *= np.asarray(1 - lr * wd, dtype=p._data.dtype)
            else:
                g = g + wd * p._data
        if not state:
            state['step'] = 0
            state['exp_avg'] = np.zeros_like(p._data)
            state['exp_avg_sq'] = np.zeros_like(p._data)
            if group['amsgrad']:
                state['max_exp_avg_sq'] = np.zeros_like(p._data)
        state['step'] += 1
        t = state['step']
        m = state['exp_avg'] = (b1 * state['exp_avg'] + (1 - b1) * g).astype(p._data.dtype)
        v = state['exp_avg_sq'] = (b2 * state['exp_avg_sq'] + (1 - b2) * g * g).astype(p._data.dtype)
        bc1 = 1 - b1 ** t
        bc2 = 1 - b2 ** t
        if group['amsgrad']:
            state['max_exp_avg_sq'] = np.maximum(state['max_exp_avg_sq'], v)
            v = state['max_exp_avg_sq']
        denom = np.sqrt(v) / math.sqrt(bc2) + eps
        return (lr / bc1) * m / denom


class AdamW(Adam):
    _decoupled = True

    def __init__(self, params, lr=1e-3, betas=(0.9, 0.999), eps=1e-8, weight_decay=1e-2, amsgrad=False, **kw):
        super().__init__(params, lr, betas, eps, weight_decay, amsgrad, maximize=kw.get('maximize', False))


class RMSprop(Optimizer):
    def __init__(self, params, lr=1e-2, alpha=0.99, eps=1e-8, weight_decay=0, momentum=0, centered=False,
                 capturable=False, foreach=None, maximize=False, differentiable=False):
        super().__init__(params, dict(lr=lr, alpha=alpha, eps=eps, weight_decay=weight_decay, momentum=momentum,
                                      centered=centered, maximize=maximize))

    def _update(self, p, g, group, state):
        if group['weight_decay']:
            g = g + group['weight_decay'] * p._data
        a = group['alpha']
        if not state:
            state['step'] = 0
            state['square_avg'] = np.zeros_like(p._data)
            if group['momentum'] > 0:
                state['momentum_buffer'] = np.zeros_like(p._data)
            if group['centered']:
                state['grad_avg'] = np.zeros_like(p._data)
        state['step'] += 1
        sq = state['square_avg'] = (a * state['square_avg'] + (1 - a) * g * g).astype(p._data.dtype)
        if group['centered']:
            ga = state['grad_avg'] = (a * state['grad_avg'] + (1 - a) * g).astype(p._data.dtype)
            avg = np.sqrt(sq - ga * ga) + group['eps']
        else:
            avg = np.sqrt(sq) + group['eps']
        if group['momentum'] > 0:
            buf = state['momentum_buffer'] = (group['momentum'] * state['momentum_buffer'] + g / avg).astype(
                p._data.dtype)
            return group['lr'] * buf
        return group['lr'] * g / avg


class Adagrad(Optimizer):
    def __init__(self, params, lr=1e-2, lr_decay=0, weight_decay=0, initial_accumulator_value=0, eps=1e-10,
                 foreach=None, *, maximize=False, differentiable=False, fused=None):
        super().__init__(params, dict(lr=lr, lr_decay=lr_decay, weight_decay=weight_decay, eps=eps,
                                      initial_accumulator_value=initial_accumulator_value, maximize=maximize))

    def _update(self, p, g, group, state):
        if not state:
            state['step'] = 0
            state['sum'] = np.full_like(p._data, group['initial_accumulator_value'])
        state['step'] += 1
        if group['weight_decay']:
            g = g + group['weight_decay'] * p._data
        clr = group['lr'] / (1 + (state['step'] - 1) * group['lr_decay'])
        state['sum'] = (state['sum'] + g * g).astype(p._data.dtype)
        return clr * g / (np.sqrt(state['sum']) + group['eps'])


class LRScheduler:
    def __init__(self, optimizer, last_epoch=-1, verbose='deprecated'):
        self.optimizer = optimizer
        if last_epoch == -1:
            for g in optimizer.param_groups:
                g.setdefault('initial_lr', g['lr'])
        self.base_lrs = [g['initial_lr'] for g in optimizer.param_groups]
        self.last_epoch = last_epoch
        self._step_count = 0
        self.step()

    def get_lr(self):
        return [self._lr_at(base, self.last_epoch, g) for base, g in zip(self.base_lrs, self.optimizer.param_groups)]

    def _lr_at(self, base, epoch, group):
        raise NotImplementedError

    def get_last_lr(self):
        return self._last_lr

    def step(self, epoch=None):
        self._step_count += 1
        self.last_epoch = self.last_epoch + 1 if epoch is None else epoch
        lrs = self.get_lr()
        for g, lr in zip(self.optimizer.param_groups, lrs):
            g['lr'] = lr
        self._last_lr = [g['lr'] for g in self.optimizer.param_groups]

    def state_dict(self):
        return {k: v for k, v in self.__dict__.items() if k != 'optimizer'}

    def load_state_dict(self, sd):
        self.__dict__.update(sd)


class StepLR(LRScheduler):
    def __init__(self, optimizer, step_size, gamma=0.1, last_epoch=-1, verbose='deprecated'):
        self.step_size, self.gamma = step_size, gamma
        super().__init__(optimizer, last_epoch)

    def _lr_at(self, base, e, g):
        return base * self.gamma ** (e // self.step_size)


class MultiStepLR(LRScheduler):
    def __init__(self, optimizer, milestones, gamma=0.1, last_epoch=-1, verbose='deprecated'):
        self.milestones, self.gamma = sorted(milestones), gamma
        super().__init__(optimizer, last_epoch)

    def _lr_at(self, base, e, g):
        return base * self.gamma ** _bsum(1 for m in self.milestones if m <= e)


class ExponentialLR(LRScheduler):
    def __init__(self, optimizer, gamma, last_epoch=-1, verbose='deprecated'):
        self.gamma = gamma
        super().__init__(optimizer, last_epoch)

    def _lr_at(self, base, e, g):
        return base * self.gamma ** e


class CosineAnnealingLR(LRScheduler):
    def __init__(self, optimizer, T_max, eta_min=0.0, last_epoch=-1, verbose='deprecated'):
        self.T_max, self.eta_min = T_max, eta_min
        super().__init__(optimizer, last_epoch)

    def _lr_at(self, base, e, g):
        return self.eta_min + (base - self.eta_min) * (1 + math.cos(math.pi * e / self.T_max)) / 2


class LambdaLR(LRScheduler):
    def __init__(self, optimizer, lr_lambda, last_epoch=-1, verbose='deprecated'):
        n = len(optimizer.param_groups)
        self.lr_lambdas = list(lr_lambda) if isinstance(lr_lambda, (list, tuple)) else [lr_lambda] * n
        super().__init__(optimizer, last_epoch)

    def get_lr(self):
        return [base * f(self.last_epoch) for base, f in zip(self.base_lrs, self.lr_lambdas)]


class MultiplicativeLR(LRScheduler):
    def __init__(self, optimizer, lr_lambda, last_epoch=-1, verbose='deprecated'):
        n = len(optimizer.param_groups)
        self.lr_lambdas = list(lr_lambda) if isinstance(lr_lambda, (list, tuple)) else [lr_lambda] * n
        super().__init__(optimizer, last_epoch)

    def get_lr(self):
        if self.last_epoch > 0:
            return [g['lr'] * f(self.last_epoch) for g, f in zip(self.optimizer.param_groups, self.lr_lambdas)]
        return [g['lr'] for g in self.optimizer.param_groups]


class LinearLR(LRScheduler):
    def __init__(self, optimizer, start_factor=1.0 / 3, end_factor=1.0, total_iters=5, last_epoch=-1,
                 verbose='deprecated'):
        self.start_factor, self.end_factor, self.total_iters = start_factor, end_factor, total_iters
        super().__init__(optimizer, last_epoch)

    def _lr_at(self, base, e, g):
        f = self.start_factor + (self.end_factor - self.start_factor) * _bmin(e, self.total_iters) / self.total_iters
        return base * f


class ConstantLR(LRScheduler):
    def __init__(self, optimizer, factor=1.0 / 3, total_iters=5, last_epoch=-1, verbose='deprecated'):
        self.factor, self.total_iters = factor, total_iters
        super().__init__(optimizer, last_epoch)

    def _lr_at(self, base, e, g):
        return base * (self.factor if e < self.total_iters else 1.0)


class ReduceLROnPlateau:
    def __init__(self, optimizer, mode='min', factor=0.1, patience=10, threshold=1e-4, threshold_mode='rel',
                 cooldown=0, min_lr=0, eps=1e-8, verbose='deprecated'):
        self.optimizer, self.mode, self.factor, self.patience = optimizer, mode, factor, patience
        self.threshold, self.threshold_mode, self.cooldown, self.eps = threshold, threshold_mode, cooldown, eps
        self.min_lrs = list(min_lr) if isinstance(min_lr, (list, tuple)) else [min_lr] * len(optimizer.param_groups)
        self.best = float('inf') if mode == 'min' else float('-inf')
        self.num_bad_epochs = 0
        self.cooldown_counter = 0
        self.last_epoch = 0
        self._last_lr = [g['lr'] for g in optimizer.param_groups]

    def _better(self, a):
        if self.mode == 'min':
            ref = self.best * (1 - self.threshold) if self.threshold_mode == 'rel' else self.best - self.threshold
            return a < ref
        ref = self.best * (1 + self.threshold) if self.threshold_mode == 'rel' else self.best + self.threshold
        return a > ref

    def step(self, metrics, epoch=None):
        cur = float(metrics)
        self.last_epoch += 1
        if self._better(cur):
            self.best = cur
            self.num_bad_epochs = 0
        else:
            self.num_bad_epochs += 1
        if self.cooldown_counter > 0:
            self.cooldown_counter -= 1
            self.num_bad_epochs = 0
        if self.num_bad_epochs > self.patience:
            for g, mn in zip(self.optimizer.param_groups, self.min_lrs):
                new = _bmax(g['lr'] * self.factor, mn)
                if g['lr'] - new > self.eps:
                    g['lr'] = new
            self.cooldown_counter = self.cooldown
            self.num_bad_epochs = 0
        self._last_lr = [g['lr'] for g in self.optimizer.param_groups]

    def get_last_lr(self):
        return self._last_lr


# =============================================================================
# distributions
# =============================================================================

class Distribution:
    has_rsample = False
    arg_constraints = {}
    support = None

    def __init__(self, batch_shape=Size(), event_shape=Size(), validate_args=None):
        self._batch_shape = Size(batch_shape)
        self._event_shape = Size(event_shape)

    @property
    def batch_shape(self):
        return self._batch_shape

    @property
    def event_shape(self):
        return self._event_shape

    def _extended_shape(self, sample_shape=Size()):
        return Size(tuple(sample_shape) + tuple(self._batch_shape) + tuple(self._event_shape))

    def sample(self, sample_shape=Size()):
        with no_grad():
            return self.rsample(sample_shape)

    def sample_n(self, n):
        return self.sample((n,))

    def rsample(self, sample_shape=Size()):
        raise NotImplementedError(f"{type(self).__name__} does not support rsample")

    @property
    def stddev(self):
        return self.variance.sqrt()

    def perplexity(self):
        return exp(self.entropy())

    def __repr__(self):
        return type(self).__name__ + '()'


def _shape_arg(sample_shape):
    if isinstance(sample_shape, int):
        return (sample_shape,)
    return tuple(sample_shape)


class Categorical(Distribution):
    def __init__(self, probs=None, logits=None, validate_args=None):
        if (probs is None) == (logits is None):
            raise ValueError("Either `probs` or `logits` must be specified, but not both.")
        if probs is not None:
            p = _floatify(probs)
            if p.ndim < 1:
                raise ValueError("`probs` parameter must be at least one-dimensional.")
            self.probs = p / p.sum(-1, keepdim=True)
            eps = float(np.finfo(self.probs._data.dtype).eps)
            self.logits = log(clamp(self.probs, eps, 1 - eps))
        else:
            lg = _floatify(logits)
            if lg.ndim < 1:
                raise ValueError("`logits` parameter must be at least one-dimensional.")
            self.logits = lg - logsumexp(lg, -1, keepdim=True)
            self.probs = softmax(lg, -1)
        self._param = self.probs if probs is not None else self.logits
        self._num_events = self.probs.shape[-1]
        super().__init__(self.probs.shape[:-1])

    @property
    def param_shape(self):
        return self._param.shape

    @property
    def mean(self):
        return full(self._extended_shape(), float('nan'))

    @property
    def mode(self):
        return self.probs.argmax(-1)

    @property
    def variance(self):
        return full(self._extended_shape(), float('nan'))

    def sample(self, sample_shape=Size()):
        ss = _shape_arg(sample_shape)
        P = self.probs._data.astype(np.float64)
        K = P.shape[-1]
        flat = P.reshape(-1, K)
        cdf = np.cumsum(flat, -1)
        cdf /= cdf[:, -1:]
        n = int(np.prod(ss)) if ss else 1
        u = np.random.random_sample((n, flat.shape[0], 1))
        idx = (u >= cdf[None]).sum(-1)
        idx = np.minimum(idx, K - 1)
        return Tensor._wrap(idx.reshape(ss + P.shape[:-1]).astype(np.int64))

    def log_prob(self, value):
        v = _tens(value).long().unsqueeze(-1)
        v, lp = broadcast_tensors(v, self.logits)
        v = v[..., :1]
        return gather(lp, -1, v).squeeze(-1)

    def entropy(self):
        min_real = float(np.finfo(self.logits._data.dtype).min)
        lg = clamp(self.logits, min=min_real)
        return -(lg * self.probs).sum(-1)

    def enumerate_support(self, expand=True):
        vals = arange(self._num_events).reshape((-1,) + (1,) * len(self._batch_shape))
        return _expand(vals, -1, *self._batch_shape) if expand else vals

    def __repr__(self):
        return f'Categorical(probs: {self.probs.shape})'


class OneHotCategorical(Categorical):
    def sample(self, sample_shape=Size()):
        idx = Categorical.sample(self, sample_shape)
        return _F_one_hot(idx, self._num_events).to(self.probs.dtype)

    def log_prob(self, value):
        return Categorical.log_prob(self, _tens(value).argmax(-1))


class Normal(Distribution):
    has_rsample = True

    def __init__(self, loc, scale, validate_args=None):
        loc_t = _floatify(loc) if isinstance(loc, Tensor) else None
        scale_t = _floatify(scale) if isinstance(scale, Tensor) else None
        if loc_t is None and scale_t is None:
            loc_t, scale_t = tensor(float(loc)), tensor(float(scale))
        elif loc_t is None:
            loc_t = full_like(scale_t, float(loc))
        elif scale_t is None:
            scale_t = full_like(loc_t, float(scale))
        self.loc, self.scale = broadcast_tensors(loc_t, scale_t)
        if validate_args and bool((self.scale <= 0).any()):
            raise ValueError("Expected parameter scale to be positive")
        super().__init__(self.loc.shape)

    @property
    def mean(self):
        return self.loc

    @property
    def mode(self):
        return self.loc

    @property
    def stddev(self):
        return self.scale

    @property
    def variance(self):
        return self.scale ** 2

    def rsample(self, sample_shape=Size()):
        shape = self._extended_shape(_shape_arg(sample_shape))
        eps = Tensor._wrap(np.random.standard_normal(shape).astype(self.loc._data.dtype))
        return self.loc + eps * self.scale

    def log_prob(self, value):
        v = _tens(value)
        var_ = self.scale ** 2
        return -((v - self.loc) ** 2) / (2 * var_) - log(self.scale) - math.log(math.sqrt(2 * math.pi))

    def entropy(self):
        return 0.5 + 0.5 * math.log(2 * math.pi) + log(self.scale)

    def cdf(self, value):
        return 0.5 * (1 + erf((_tens(value) - self.loc) * self.scale.reciprocal() / math.sqrt(2)))

    def icdf(self, value):
        raise _unsupported('Normal.icdf')

    def __repr__(self):
        return f'Normal(loc: {self.loc}, scale: {self.scale})'


class Bernoulli(Distribution):
    def __init__(self, probs=None, logits=None, validate_args=None):
        if (probs is None) == (logits is None):
            raise ValueError("Either `probs` or `logits` must be specified, but not both.")
        if probs is not None:
            self.probs = _floatify(probs)
            eps = float(np.finfo(self.probs._data.dtype).eps)
            ps = clamp(self.probs, eps, 1 - eps)
            self.logits = log(ps) - log1p(-ps)
        else:
            self.logits = _floatify(logits)
            self.probs = sigmoid(self.logits)
        super().__init__(self.probs.shape)

    @property
    def mean(self):
        return self.probs

    @property
    def variance(self):
        return self.probs * (1 - self.probs)

    def sample(self, sample_shape=Size()):
        shape = self._extended_shape(_shape_arg(sample_shape))
        P = np.broadcast_to(self.probs._data, shape)
        return Tensor._wrap((np.random.random_sample(shape) < P).astype(self.probs._data.dtype))

    def log_prob(self, value):
        lg, v = broadcast_tensors(self.logits, _tens(value).to(self.logits.dtype))
        return -_F_binary_cross_entropy_with_logits(lg, v, reduction='none')

    def entropy(self):
        return _F_binary_cross_entropy_with_logits(self.logits, self.probs, reduction='none')


class Uniform(Distribution):
    has_rsample = True

    def __init__(self, low, high, validate_args=None):
        self.low, self.high = broadcast_tensors(_floatify(low), _floatify(high))
        super().__init__(self.low.shape)

    @property
    def mean(self):
        return (self.low + self.high) / 2

    @property
    def variance(self):
        return (self.high - self.low) ** 2 / 12

    def rsample(self, sample_shape=Size()):
        shape = self._extended_shape(_shape_arg(sample_shape))
        u = Tensor._wrap(np.random.random_sample(shape).astype(self.low._data.dtype))
        return self.low + u * (self.high - self.low)

    def log_prob(self, value):
        v = _tens(value)
        inside = (v >= self.low) & (v < self.high)
        return where(inside, -log(self.high - self.low), float('-inf'))

    def entropy(self):
        return log(self.high - self.low)


class Exponential(Distribution):
    has_rsample = True

    def __init__(self, rate, validate_args=None):
        self.rate = _floatify(rate)
        super().__init__(self.rate.shape)

    @property
    def mean(self):
        return self.rate.reciprocal()

    @property
    def variance(self):
        return self.rate ** -2

    def rsample(self, sample_shape=Size()):
        shape = self._extended_shape(_shape_arg(sample_shape))
        e = Tensor._wrap(np.random.exponential(1.0, shape).astype(self.rate._data.dtype))
        return e / self.rate

    def log_prob(self, value):
        return log(self.rate) - self.rate * value

    def entropy(self):
        return 1.0 - log(self.rate)


class MultivariateNormal(Distribution):
    has_rsample = True

    def __init__(self, loc, covariance_matrix=None, precision_matrix=None, scale_tril=None, validate_args=None):
        self.loc = _floatify(loc)
        if covariance_matrix is not None:
            self.covariance_matrix = _floatify(covariance_matrix)
        elif scale_tril is not None:
            st = _floatify(scale_tril)
            self.covariance_matrix = matmul(st, st.mT)
        elif precision_matrix is not None:
            self.covariance_matrix = _linalg_inv(precision_matrix)
        else:
            raise ValueError("One of covariance_matrix or precision_matrix or scale_tril must be specified.")
        super().__init__(self.loc.shape[:-1], self.loc.shape[-1:])

    @property
    def mean(self):
        return self.loc

    @property
    def variance(self):
        return diagonal(self.covariance_matrix, 0, -2, -1)

    @property
    def scale_tril(self):
        return Tensor._wrap(np.linalg.cholesky(self.covariance_matrix._data))

    def rsample(self, sample_shape=Size()):
        shape = self._extended_shape(_shape_arg(sample_shape))
        L = self.scale_tril
        eps = Tensor._wrap(np.random.standard_normal(shape).astype(self.loc._data.dtype))
        return self.loc + matmul(L, eps.unsqueeze(-1)).squeeze(-1)

    def log_prob(self, value):
        k = self.loc.shape[-1]
        d = (_tens(value) - self.loc).unsqueeze(-1)
        m = matmul(matmul(d.mT, _linalg_inv(self.covariance_matrix)), d).squeeze(-1).squeeze(-1)
        return -0.5 * (k * math.log(2 * math.pi) + _linalg_slogdet(self.covariance_matrix)[1] + m)

    def entropy(self):
        k = self.loc.shape[-1]
        return 0.5 * (k * (1 + math.log(2 * math.pi)) + _linalg_slogdet(self.covariance_matrix)[1])


class Independent(Distribution):
    def __init__(self, base_distribution, reinterpreted_batch_ndims, validate_args=None):
        self.base_dist = base_distribution
        self.reinterpreted_batch_ndims = n = reinterpreted_batch_ndims
        bs = tuple(base_distribution.batch_shape)
        super().__init__(bs[:len(bs) - n], bs[len(bs) - n:] + tuple(base_distribution.event_shape))
        self.has_rsample = base_distribution.has_rsample

    def _sum_rightmost(self, x):
        n = self.reinterpreted_batch_ndims
        return x.sum(tuple(range(-n, 0))) if n else x

    @property
    def mean(self):
        return self.base_dist.mean

    @property
    def variance(self):
        return self.base_dist.variance

    def sample(self, sample_shape=Size()):
        return self.base_dist.sample(sample_shape)

    def rsample(self, sample_shape=Size()):
        return self.base_dist.rsample(sample_shape)

    def log_prob(self, value):
        return self._sum_rightmost(self.base_dist.log_prob(value))

    def entropy(self):
        return self._sum_rightmost(self.base_dist.entropy())


def kl_divergence(p, q):
    if isinstance(p, Normal) and isinstance(q, Normal):
        var_ratio = (p.scale / q.scale) ** 2
        t1 = ((p.loc - q.loc) / q.scale) ** 2
        return 0.5 * (var_ratio + t1 - 1 - log(var_ratio))
    if isinstance(p, Categorical) and isinstance(q, Categorical):
        t = p.probs * (p.logits - q.logits)
        t = where(p.probs == 0, 0.0, t)
        return t.sum(-1)
    if isinstance(p, Bernoulli) and isinstance(q, Bernoulli):
        t1 = p.probs * (_F_softplus(-q.logits) - _F_softplus(-p.logits))
        t2 = (1 - p.probs) * (_F_softplus(q.logits) - _F_softplus(p.logits))
        return t1 + t2
    if isinstance(p, Independent) and isinstance(q, Independent):
        return p._sum_rightmost(kl_divergence(p.base_dist, q.base_dist))
    raise NotImplementedError(f"torch shim: kl_divergence({type(p).__name__}, {type(q).__name__}) is not supported")


# =============================================================================
# utils.data
# =============================================================================

class Dataset:
    def __getitem__(self, index):
        raise NotImplementedError

    def __add__(self, other):
        return ConcatDataset([self, other])


class TensorDataset(Dataset):
    def __init__(self, *tensors):
        n = tensors[0].shape[0]
        if _bany(t.shape[0] != n for t in tensors):
            raise AssertionError("Size mismatch between tensors")
        self.tensors = tensors

    def __getitem__(self, index):
        return tuple(t[index] for t in self.tensors)

    def __len__(self):
        return self.tensors[0].shape[0]


class Subset(Dataset):
    def __init__(self, dataset, indices):
        self.dataset, self.indices = dataset, list(indices)

    def __getitem__(self, idx):
        return self.dataset[self.indices[idx]]

    def __len__(self):
        return len(self.indices)


class ConcatDataset(Dataset):
    def __init__(self, datasets):
        self.datasets = list(datasets)
        self.cumulative_sizes = list(itertools.accumulate(len(d) for d in self.datasets))

    def __len__(self):
        return self.cumulative_sizes[-1] if self.cumulative_sizes else 0

    def __getitem__(self, idx):
        if idx < 0:
            idx += len(self)
        for i, c in enumerate(self.cumulative_sizes):
            if idx < c:
                prev = self.cumulative_sizes[i - 1] if i else 0
                return self.datasets[i][idx - prev]
        raise IndexError(idx)


def random_split(dataset, lengths, generator=None):
    n = len(dataset)
    if _bsum(lengths) != n and _ball(0 <= l <= 1 for l in lengths):
        sizes = [int(math.floor(n * f)) for f in lengths]
        for i in range(n - _bsum(sizes)):
            sizes[i % len(sizes)] += 1
        lengths = sizes
    if _bsum(lengths) != n:
        raise ValueError("Sum of input lengths does not equal the length of the input dataset!")
    perm = np.random.permutation(n).tolist()
    out, start = [], 0
    for l in lengths:
        out.append(Subset(dataset, perm[start:start + l]))
        start += l
    return out


def default_collate(batch):
    first = batch[0]
    if isinstance(first, Tensor):
        return stack(batch)
    if isinstance(first, np.ndarray):
        return stack([tensor(b) for b in batch])
    if isinstance(first, (builtins.float, builtins.int, builtins.bool, np.generic)):
        return tensor(batch)
    if isinstance(first, str):
        return list(batch)
    if isinstance(first, dict):
        return {k: default_collate([b[k] for b in batch]) for k in first}
    if isinstance(first, (tuple, list)):
        return [default_collate(list(s)) for s in zip(*batch)] if isinstance(first, list) else \
            tuple(default_collate(list(s)) for s in zip(*batch))
    return batch


class DataLoader:
    def __init__(self, dataset, batch_size=1, shuffle=False, sampler=None, batch_sampler=None, num_workers=0,
                 collate_fn=None, pin_memory=False, drop_last=False, timeout=0, worker_init_fn=None,
                 generator=None, **kwargs):
        self.dataset, self.batch_size, self.shuffle, self.drop_last = dataset, batch_size, shuffle, drop_last
        self.collate_fn = collate_fn or default_collate
        self.sampler = sampler

    def __iter__(self):
        n = len(self.dataset)
        if self.sampler is not None:
            order = list(iter(self.sampler))
        else:
            order = np.random.permutation(n).tolist() if self.shuffle else list(range(n))
        bs = self.batch_size
        if bs is None:
            for i in order:
                yield self.dataset[i]
            return
        for s in range(0, len(order), bs):
            idx = order[s:s + bs]
            if self.drop_last and len(idx) < bs:
                return
            yield self.collate_fn([self.dataset[i] for i in idx])

    def __len__(self):
        n = len(self.dataset)
        if self.batch_size is None:
            return n
        return n // self.batch_size if self.drop_last else -(-n // self.batch_size)


# =============================================================================
# autograd
# =============================================================================

def autograd_grad(outputs, inputs, grad_outputs=None, retain_graph=None, create_graph=False, only_inputs=True,
                  allow_unused=None, is_grads_batched=False, materialize_grads=False):
    if create_graph:
        raise _unsupported('torch.autograd.grad(create_graph=True) (higher-order gradients)')
    outs = [outputs] if isinstance(outputs, Tensor) else list(outputs)
    single = isinstance(inputs, Tensor)
    ins = [inputs] if single else list(inputs)
    if grad_outputs is None:
        gos = [None] * len(outs)
    else:
        gos = [grad_outputs] if isinstance(grad_outputs, Tensor) else list(grad_outputs)
    roots, rgrads = [], []
    for o, go in zip(outs, gos):
        if not o._requires_grad:
            raise RuntimeError("element 0 of tensors does not require grad and does not have a grad_fn")
        if go is None:
            if o._data.size != 1:
                raise RuntimeError("grad can be implicitly created only for scalar outputs")
            go = np.ones_like(o._data)
        else:
            go = np.broadcast_to(_arr(go, o._data.dtype), o._data.shape)
        roots.append(o._grad_node())
        rgrads.append(go)
    for t in ins:
        if not t._requires_grad:
            raise RuntimeError("One of the differentiated Tensors does not require grad")
    nodes = [t._grad_node() for t in ins]
    caps = _run_backward(roots, rgrads, capture=nodes)
    res = []
    for t, n in zip(ins, nodes):
        g = caps.get(id(n))
        if g is None:
            if materialize_grads:
                res.append(zeros_like(t))
                continue
            if not allow_unused:
                raise RuntimeError("One of the differentiated Tensors appears to not have been used in the graph. "
                                   "Set allow_unused=True if this is the desired behavior.")
            res.append(None)
        else:
            res.append(Tensor._wrap(np.array(_unbroadcast(g, t._data.shape), dtype=t._data.dtype)))
    return tuple(res)


def autograd_backward(tensors, grad_tensors=None, retain_graph=None, create_graph=False, inputs=None):
    ts = [tensors] if isinstance(tensors, Tensor) else list(tensors)
    gs = [grad_tensors] if isinstance(grad_tensors, Tensor) else (list(grad_tensors) if grad_tensors else
                                                                   [None] * len(ts))
    roots, rg = [], []
    for t, g in zip(ts, gs):
        if g is None:
            if t._data.size != 1:
                raise RuntimeError("grad can be implicitly created only for scalar outputs")
            g = np.ones_like(t._data)
        roots.append(t._grad_node())
        rg.append(np.broadcast_to(_arr(g, t._data.dtype), t._data.shape))
    _run_backward(roots, rg)


class FunctionCtx:
    def __init__(self):
        self.saved_tensors = ()
        self.needs_input_grad = ()

    def save_for_backward(self, *tensors):
        self.saved_tensors = tensors

    def mark_non_differentiable(self, *args):
        pass

    def mark_dirty(self, *args):
        pass

    def set_materialize_grads(self, value):
        pass


class Function:
    """Custom autograd function: subclass with static forward(ctx, ...) and backward(ctx, *grads)."""

    @classmethod
    def apply(cls, *args):
        ctx = FunctionCtx()
        ctx.needs_input_grad = tuple(isinstance(a, Tensor) and a._requires_grad for a in args)
        with no_grad():
            out = cls.forward(ctx, *args)
        multi = isinstance(out, tuple)
        outs = out if multi else (out,)
        parents = tuple(a if isinstance(a, Tensor) else None for a in args)

        def make_back(k):
            def back(g):
                gs = [Tensor._wrap(np.zeros_like(_arr(o))) if isinstance(o, Tensor) else None for o in outs]
                gs[k] = Tensor._wrap(g)
                with no_grad():
                    r = cls.backward(ctx, *gs)
                r = r if isinstance(r, tuple) else (r,)
                return tuple(None if (i >= len(r) or r[i] is None or parents[i] is None) else _arr(r[i])
                             for i in range(len(parents)))
            return back
        results = tuple(_result(o._data, parents, make_back(k), cls.__name__ + 'Backward')
                        if isinstance(o, Tensor) else o for k, o in enumerate(outs))
        return results if multi else results[0]

    @staticmethod
    def forward(ctx, *args):
        raise NotImplementedError

    @staticmethod
    def backward(ctx, *grads):
        raise NotImplementedError


def Variable(data, requires_grad=False, volatile=False):
    t = _tens(data)
    if requires_grad:
        t.requires_grad_(True)
    return t


def _jacobian(func, inputs, create_graph=False, strict=False, vectorize=False):
    single = isinstance(inputs, Tensor)
    ins = [inputs] if single else list(inputs)
    ins = [i.detach().requires_grad_(True) for i in ins]
    out = func(*ins)
    rows = []
    flat = out.reshape(-1)
    for k in range(flat.numel()):
        gs = autograd_grad(flat[k], ins, allow_unused=True, materialize_grads=True)
        rows.append(gs)
    jac = [stack([r[j] for r in rows]).reshape(tuple(out.shape) + tuple(ins[j].shape)) for j in range(len(ins))]
    return jac[0] if single else tuple(jac)


# =============================================================================
# misc torch-level helpers
# =============================================================================

class finfo:
    def __init__(self, type=None):
        npd = _to_np_dtype(type) if type is not None else _default_float()
        fi = np.finfo(npd)
        self.eps, self.max, self.min, self.tiny = float(fi.eps), float(fi.max), float(fi.min), float(fi.tiny)
        self.smallest_normal = self.tiny
        self.bits, self.resolution, self.dtype = fi.bits, float(fi.resolution), str(npd)


class iinfo:
    def __init__(self, type):
        ii = np.iinfo(_to_np_dtype(type))
        self.max, self.min, self.bits, self.dtype = int(ii.max), int(ii.min), ii.bits, str(ii.dtype)


def get_default_dtype():
    return _to_torch_dtype(_default_float())


def set_default_dtype(d):
    npd = _to_np_dtype(d)
    if not _is_float(npd):
        raise TypeError("only floating-point types are supported as the default type")
    _DEFAULT['float'] = npd


def _typed_ctor(dt):
    def ctor(*args, **kwargs):
        if len(args) == 1 and not isinstance(args[0], numbers.Integral):
            return tensor(args[0], dtype=dt)
        return zeros(*args, dtype=dt)
    return ctor


def _assert_close(actual, expected, *, rtol=None, atol=None, equal_nan=False, check_dtype=True, msg=None, **kw):
    a, e = _tens(actual), _tens(expected)
    if a.shape != e.shape:
        raise AssertionError(f"The values for attribute 'shape' do not match: {a.shape} != {e.shape}.")
    if check_dtype and a.dtype != e.dtype:
        raise AssertionError(f"The values for attribute 'dtype' do not match: {a.dtype} != {e.dtype}.")
    if rtol is None or atol is None:
        f = a._data.dtype
        rtol, atol = ((1.3e-6, 1e-5) if f == np.float32 else (1e-7, 1e-7) if f == np.float64 else (0, 0))
    if not np.allclose(a._data.astype(np.float64), e._data.astype(np.float64), rtol=rtol, atol=atol,
                       equal_nan=equal_nan):
        diff_ = np.abs(a._data.astype(np.float64) - e._data.astype(np.float64))
        raise AssertionError(msg or f"Tensor-likes are not close!\n\nGreatest absolute difference: {diff_.max()}")


def _save(*a, **k):
    raise _unsupported('torch.save', 'saving files')


def _load(*a, **k):
    raise _unsupported('torch.load', 'loading files')


def _compile(model=None, *a, **k):
    raise _unsupported('torch.compile')


def _noop(*a, **k):
    return None


# =============================================================================
# Module assembly and install()
# =============================================================================

def _module(name, attrs, doc=None):
    m = types.ModuleType(name, doc)
    m.__dict__.update(attrs)
    short = name

    def __getattr__(attr):
        if attr.startswith('__'):
            raise AttributeError(f"module '{short}' has no attribute '{attr}'")
        raise _unsupported(f'{short}.{attr}')
    m.__getattr__ = __getattr__
    m.__path__ = []
    m._is_torch_shim = True
    return m


_NN_CLASSES = [
    Module, Sequential, ModuleList, ModuleDict, ParameterList, ParameterDict, Identity, Linear, Bilinear, Embedding,
    Conv1d, Conv2d, ConvTranspose1d, ConvTranspose2d, MaxPool1d, MaxPool2d, AvgPool1d, AvgPool2d,
    AdaptiveAvgPool1d, AdaptiveAvgPool2d, AdaptiveMaxPool1d, AdaptiveMaxPool2d, Flatten, Unflatten, Dropout,
    Dropout1d, Dropout2d, Dropout3d, AlphaDropout, BatchNorm1d, BatchNorm2d, BatchNorm3d, InstanceNorm1d,
    InstanceNorm2d, LayerNorm, RMSNorm, GroupNorm, LocalResponseNorm, ReLU, ReLU6, LeakyReLU, ELU, SELU, CELU,
    GELU, SiLU, Mish, Sigmoid, Tanh, Softplus, Hardtanh, Hardsigmoid, Hardswish, LogSigmoid, Softsign, Tanhshrink,
    Threshold, GLU, Softmax, LogSoftmax, Softmin, Softmax2d, PReLU, Upsample, PixelShuffle, PixelUnshuffle,
    ZeroPad2d, ConstantPad2d, ReflectionPad2d, ReplicationPad2d, CosineSimilarity, PairwiseDistance,
    MSELoss, L1Loss, SmoothL1Loss, HuberLoss, CrossEntropyLoss, NLLLoss, BCELoss, BCEWithLogitsLoss, KLDivLoss,
    GaussianNLLLoss, PoissonNLLLoss, MarginRankingLoss, HingeEmbeddingLoss, CosineEmbeddingLoss, SoftMarginLoss,
    MultiLabelSoftMarginLoss, TripletMarginLoss, MultiheadAttention, TransformerEncoderLayer, TransformerEncoder,
]


def _build():
    """Create the shim's module tree (``torch`` and its submodules) without
    registering anything in ``sys.modules``. Returns the ``torch`` module;
    ``torch._submodules`` maps dotted names to module objects."""
    T = dict(_TORCH)
    T.update({
        '__version__': __version__, 'Tensor': Tensor, 'Size': Size, 'dtype': dtype, 'device': device,
        'float32': float32, 'float': float32, 'float64': float64, 'double': float64, 'float16': float16,
        'half': float16, 'int64': int64, 'long': int64, 'int32': int32, 'int': int32, 'int16': int16,
        'short': int16, 'int8': int8, 'uint8': uint8, 'bool': bool_,
        'pi': math.pi, 'e': math.e, 'inf': math.inf, 'nan': math.nan, 'newaxis': None,
        'FloatTensor': _typed_ctor(float32), 'DoubleTensor': _typed_ctor(float64),
        'LongTensor': _typed_ctor(int64), 'IntTensor': _typed_ctor(int32), 'BoolTensor': _typed_ctor(bool_),
        'ByteTensor': _typed_ctor(uint8), 'HalfTensor': _typed_ctor(float16),
        'finfo': finfo, 'iinfo': iinfo, 'get_default_dtype': get_default_dtype,
        'set_default_dtype': set_default_dtype, 'set_printoptions': _noop, 'use_deterministic_algorithms': _noop,
        'are_deterministic_algorithms_enabled': lambda: True,
        'set_num_threads': _noop, 'get_num_threads': lambda: 1, 'set_float32_matmul_precision': _noop,
        'save': _save, 'load': _load, 'compile': _compile, 'range': range_,
        'abs': _TORCH['abs'], 'sum': sum, 'max': max, 'min': min, 'all': all, 'any': any, 'round': round,
        'pow': pow, 'ShimUnsupported': ShimUnsupported,
        'no_grad': no_grad, 'enable_grad': enable_grad, 'set_grad_enabled': set_grad_enabled,
        'inference_mode': inference_mode, 'is_grad_enabled': is_grad_enabled,
        'stft': None,
    })
    del T['stft']
    T.pop('range_', None)
    T.pop('Generator', None)
    T['Generator'] = Generator

    # --- nn ---
    nn_attrs = {c.__name__: c for c in _NN_CLASSES}
    nn_attrs['Parameter'] = Parameter
    nn_attrs['Buffer'] = Buffer
    for name in ['RNN', 'LSTM', 'GRU', 'RNNCell', 'LSTMCell', 'GRUCell', 'Transformer', 'TransformerDecoderLayer',
                 'TransformerDecoder', 'Conv3d', 'MaxPool3d', 'AvgPool3d', 'EmbeddingBag', 'DataParallel',
                 'LazyLinear', 'LazyConv2d', 'SyncBatchNorm', 'CTCLoss']:
        nn_attrs[name] = _unsupported_module(name)
    functional = _module('torch.nn.functional', dict(_FUNCTIONAL))
    init = _module('torch.nn.init', dict(_INIT))
    rnn_utils = _module('torch.nn.utils.rnn', {})
    nn_utils = _module('torch.nn.utils', {
        'clip_grad_norm_': clip_grad_norm_, 'clip_grad_norm': clip_grad_norm_, 'clip_grad_value_': clip_grad_value_,
        'parameters_to_vector': parameters_to_vector, 'vector_to_parameters': vector_to_parameters,
        'rnn': rnn_utils})
    parameter_mod = _module('torch.nn.parameter', {'Parameter': Parameter, 'Buffer': Buffer})
    modules_mod = _module('torch.nn.modules', dict(nn_attrs))
    nn_attrs.update({'functional': functional, 'init': init, 'utils': nn_utils, 'parameter': parameter_mod,
                     'modules': modules_mod})
    nn = _module('torch.nn', nn_attrs)

    # --- optim ---
    sched_classes = [LRScheduler, StepLR, MultiStepLR, ExponentialLR, CosineAnnealingLR, LambdaLR, MultiplicativeLR,
                     LinearLR, ConstantLR, ReduceLROnPlateau]
    lr_scheduler = _module('torch.optim.lr_scheduler', {c.__name__: c for c in sched_classes})
    lr_scheduler._LRScheduler = LRScheduler
    optim = _module('torch.optim', {'Optimizer': Optimizer, 'SGD': SGD, 'Adam': Adam, 'AdamW': AdamW,
                                    'RMSprop': RMSprop, 'Adagrad': Adagrad, 'lr_scheduler': lr_scheduler})

    # --- distributions ---
    dist_classes = [Distribution, Categorical, OneHotCategorical, Normal, Bernoulli, Uniform, Exponential,
                    MultivariateNormal, Independent]
    dist_attrs = {c.__name__: c for c in dist_classes}
    kl = _module('torch.distributions.kl', {'kl_divergence': kl_divergence})
    dist_attrs.update({'kl_divergence': kl_divergence, 'kl': kl})
    dist_sub = {}
    for modname, cls in [('categorical', Categorical), ('normal', Normal), ('bernoulli', Bernoulli),
                         ('uniform', Uniform), ('multivariate_normal', MultivariateNormal),
                         ('independent', Independent), ('distribution', Distribution),
                         ('exponential', Exponential), ('one_hot_categorical', OneHotCategorical)]:
        dist_sub[modname] = _module('torch.distributions.' + modname, {cls.__name__: cls})
        dist_attrs[modname] = dist_sub[modname]
    distributions = _module('torch.distributions', dist_attrs)

    # --- linalg ---
    linalg = _module('torch.linalg', {
        'norm': linalg_norm, 'vector_norm': linalg_vector_norm, 'matrix_norm': linalg_matrix_norm,
        'inv': _linalg_inv, 'det': _linalg_det, 'slogdet': _linalg_slogdet, 'solve': _linalg_solve,
        'svd': _linalg_svd, 'svdvals': _linalg_svdvals, 'eigh': _linalg_eigh, 'eigvalsh': _linalg_eigvalsh,
        'qr': _linalg_qr, 'cholesky': _linalg_cholesky, 'pinv': _linalg_pinv, 'matrix_rank': _linalg_matrix_rank,
        'matmul': matmul, 'cross': cross, 'diagonal': lambda A, offset=0, dim1=-2, dim2=-1:
            diagonal(A, offset, dim1, dim2), 'vecdot': lambda x, y, dim=-1: (_tens(x) * y).sum(dim),
        'multi_dot': lambda ts: chain_matmul(*ts), 'outer': outer,
    })

    # --- autograd ---
    functional_ag = _module('torch.autograd.functional', {'jacobian': _jacobian})
    autograd = _module('torch.autograd', {
        'grad': autograd_grad, 'backward': autograd_backward, 'Function': Function, 'Variable': Variable,
        'no_grad': no_grad, 'enable_grad': enable_grad, 'set_grad_enabled': set_grad_enabled,
        'functional': functional_ag, 'function': _module('torch.autograd.function',
                                                          {'Function': Function, 'FunctionCtx': FunctionCtx}),
    })

    # --- utils ---
    data = _module('torch.utils.data', {
        'Dataset': Dataset, 'TensorDataset': TensorDataset, 'DataLoader': DataLoader, 'Subset': Subset,
        'ConcatDataset': ConcatDataset, 'random_split': random_split, 'default_collate': default_collate})
    utils = _module('torch.utils', {'data': data})

    # --- misc submodules ---
    cuda = _module('torch.cuda', {'is_available': lambda: False, 'device_count': lambda: 0,
                                  'manual_seed': _noop, 'manual_seed_all': _noop, 'synchronize': _noop,
                                  'empty_cache': _noop, 'is_initialized': lambda: False})
    mps = _module('torch.backends.mps', {'is_available': lambda: False, 'is_built': lambda: False})
    cudnn = _module('torch.backends.cudnn', {'deterministic': False, 'benchmark': False, 'enabled': False,
                                             'is_available': lambda: False})
    backends = _module('torch.backends', {'mps': mps, 'cudnn': cudnn})
    special = _module('torch.special', {
        'expit': sigmoid, 'erf': erf, 'erfc': _TORCH['erfc'], 'logit': _TORCH['logit'], 'xlogy': xlogy,
        'softmax': softmax, 'log_softmax': log_softmax, 'logsumexp': logsumexp, 'exp2': _TORCH['exp2'],
        'expm1': _TORCH['expm1'], 'log1p': log1p, 'i0': _TORCH['i0']})
    testing = _module('torch.testing', {'assert_close': _assert_close, 'assert_allclose': _assert_close})
    random_mod = _module('torch.random', {'manual_seed': manual_seed, 'seed': seed, 'initial_seed': initial_seed,
                                          'get_rng_state': get_rng_state, 'set_rng_state': set_rng_state})
    return_types = _module('torch.return_types', dict(ReturnTypes))

    T.update({'nn': nn, 'optim': optim, 'distributions': distributions, 'linalg': linalg, 'autograd': autograd,
              'utils': utils, 'cuda': cuda, 'backends': backends, 'special': special, 'testing': testing,
              'random': random_mod, 'return_types': return_types})
    torch = _module('torch', T, __doc__)
    subs = {
        'torch': torch, 'torch.nn': nn, 'torch.nn.functional': functional, 'torch.nn.init': init,
        'torch.nn.utils': nn_utils, 'torch.nn.utils.rnn': rnn_utils, 'torch.nn.parameter': parameter_mod,
        'torch.nn.modules': modules_mod, 'torch.optim': optim, 'torch.optim.lr_scheduler': lr_scheduler,
        'torch.distributions': distributions, 'torch.distributions.kl': kl, 'torch.linalg': linalg,
        'torch.autograd': autograd, 'torch.autograd.functional': functional_ag,
        'torch.autograd.function': autograd.function, 'torch.utils': utils,
        'torch.utils.data': data, 'torch.cuda': cuda, 'torch.backends': backends, 'torch.backends.mps': mps,
        'torch.backends.cudnn': cudnn, 'torch.special': special, 'torch.testing': testing,
        'torch.random': random_mod, 'torch.return_types': return_types,
    }
    for k, m in dist_sub.items():
        subs['torch.distributions.' + k] = m
    torch._submodules = subs
    return torch


class _ShimFinder:
    """Meta-path finder: ``import torch.<something unsupported>`` fails with a clear message."""

    @staticmethod
    def find_spec(fullname, path=None, target=None):
        t = sys.modules.get('torch')
        if fullname.startswith('torch.') and getattr(t, '_is_torch_shim', False) and fullname not in sys.modules:
            raise _unsupported(f'module {fullname}')
        return None

    @staticmethod
    def invalidate_caches():
        pass


def install():
    """Register the shim as ``torch`` (idempotent). Leaves a real PyTorch alone."""
    existing = sys.modules.get('torch')
    if existing is not None:
        return existing
    torch = _build()
    for name, mod in torch._submodules.items():
        sys.modules[name] = mod
    if not _bany(isinstance(f, type) and f is _ShimFinder for f in sys.meta_path):
        sys.meta_path.append(_ShimFinder)
    return torch


def uninstall():
    """Remove the shim from ``sys.modules`` (used by tests)."""
    t = sys.modules.get('torch')
    if getattr(t, '_is_torch_shim', False):
        for name in list(sys.modules):
            if name == 'torch' or name.startswith('torch.'):
                del sys.modules[name]
    if _ShimFinder in sys.meta_path:
        sys.meta_path.remove(_ShimFinder)
