// PyTorch tracks staged from the ML Coding Lab fork (src/data/problems/pytorch/cnn.ts),
// copied verbatim and keyed by problem id. Not imported anywhere yet: see README.md.
export const cnnPyTorchPending: Record<string, unknown> = {
  'resnet-block': {
    note: 'The helpers use F.conv2d and a hand-written training-mode BatchNorm; the point is the residual wiring. (nn.Conv2d / nn.BatchNorm2d in train mode would compute the same thing.)',
    starterCode: `import math
import torch
import torch.nn.functional as F

def conv2d(x, w, stride=1, padding=0):
    """Convolution, no bias. x: (N, C_in, H, W), w: (C_out, C_in, k, k)."""
    return F.conv2d(x, w, stride=stride, padding=padding)


def batch_norm2d(x, gamma, beta, eps=1e-5):
    """Training-mode BatchNorm2d: normalize each channel with batch statistics over (N, H, W)."""
    mu = x.mean(dim=(0, 2, 3), keepdim=True)
    var = x.var(dim=(0, 2, 3), unbiased=False, keepdim=True)
    return gamma.view(1, -1, 1, 1) * (x - mu) / torch.sqrt(var + eps) + beta.view(1, -1, 1, 1)


def init_block_params(c_in, c_out, stride=1):
    """Deterministic parameters for a basic block (proj_* only if a projection is needed)."""
    def weight(shape, phase):
        fan_in = shape[1] * shape[2] * shape[3]
        n = shape[0] * fan_in
        return torch.sin(torch.arange(n, dtype=torch.float64) * 1.3 + phase).float().reshape(shape) / math.sqrt(fan_in)

    def affine(c, phase):
        a = torch.arange(c, dtype=torch.float64) + phase
        return (1 + 0.1 * torch.cos(a)).float(), (0.05 * torch.sin(a)).float()

    p = {'conv1_w': weight((c_out, c_in, 3, 3), 0.0), 'conv2_w': weight((c_out, c_out, 3, 3), 1.0)}
    p['bn1_gamma'], p['bn1_beta'] = affine(c_out, 0.0)
    p['bn2_gamma'], p['bn2_beta'] = affine(c_out, 2.0)
    if stride != 1 or c_in != c_out:
        p['proj_w'] = weight((c_out, c_in, 1, 1), 2.0)
        p['proj_gamma'], p['proj_beta'] = affine(c_out, 4.0)
    return p


def residual_block(x, params, stride=1):
    """
    Basic residual block (training-mode BatchNorm).

    main     = BN2(conv2(ReLU(BN1(conv1(x)))))      conv1: 3x3, stride, pad 1; conv2: 3x3, pad 1
    shortcut = x                                   if stride == 1 and C_in == C_out
             = BN_proj(conv1x1(x, stride))         otherwise
    out      = ReLU(main + shortcut)

    Args:
        x: Float tensor, shape (N, C_in, H, W)
        params: dict from init_block_params(C_in, C_out, stride)
        stride: Stride of conv1 (and of the projection)

    Returns:
        Tensor of shape (N, C_out, H_out, W_out) with H_out = (H - 1) // stride + 1
    """
    # Your code here
    pass
`,
    solution: `import math
import torch
import torch.nn.functional as F

def conv2d(x, w, stride=1, padding=0):
    """Convolution, no bias. x: (N, C_in, H, W), w: (C_out, C_in, k, k)."""
    return F.conv2d(x, w, stride=stride, padding=padding)


def batch_norm2d(x, gamma, beta, eps=1e-5):
    """Training-mode BatchNorm2d: normalize each channel with batch statistics over (N, H, W)."""
    mu = x.mean(dim=(0, 2, 3), keepdim=True)
    var = x.var(dim=(0, 2, 3), unbiased=False, keepdim=True)
    return gamma.view(1, -1, 1, 1) * (x - mu) / torch.sqrt(var + eps) + beta.view(1, -1, 1, 1)


def init_block_params(c_in, c_out, stride=1):
    """Deterministic parameters for a basic block (proj_* only if a projection is needed)."""
    def weight(shape, phase):
        fan_in = shape[1] * shape[2] * shape[3]
        n = shape[0] * fan_in
        return torch.sin(torch.arange(n, dtype=torch.float64) * 1.3 + phase).float().reshape(shape) / math.sqrt(fan_in)

    def affine(c, phase):
        a = torch.arange(c, dtype=torch.float64) + phase
        return (1 + 0.1 * torch.cos(a)).float(), (0.05 * torch.sin(a)).float()

    p = {'conv1_w': weight((c_out, c_in, 3, 3), 0.0), 'conv2_w': weight((c_out, c_out, 3, 3), 1.0)}
    p['bn1_gamma'], p['bn1_beta'] = affine(c_out, 0.0)
    p['bn2_gamma'], p['bn2_beta'] = affine(c_out, 2.0)
    if stride != 1 or c_in != c_out:
        p['proj_w'] = weight((c_out, c_in, 1, 1), 2.0)
        p['proj_gamma'], p['proj_beta'] = affine(c_out, 4.0)
    return p


def residual_block(x, params, stride=1):
    """
    Basic residual block (training-mode BatchNorm).

    main     = BN2(conv2(ReLU(BN1(conv1(x)))))      conv1: 3x3, stride, pad 1; conv2: 3x3, pad 1
    shortcut = x                                   if stride == 1 and C_in == C_out
             = BN_proj(conv1x1(x, stride))         otherwise
    out      = ReLU(main + shortcut)

    Args:
        x: Float tensor, shape (N, C_in, H, W)
        params: dict from init_block_params(C_in, C_out, stride)
        stride: Stride of conv1 (and of the projection)

    Returns:
        Tensor of shape (N, C_out, H_out, W_out) with H_out = (H - 1) // stride + 1
    """
    p = params
    c_in, c_out = x.shape[1], p['conv1_w'].shape[0]

    out = F.relu(batch_norm2d(conv2d(x, p['conv1_w'], stride=stride, padding=1), p['bn1_gamma'], p['bn1_beta']))
    out = batch_norm2d(conv2d(out, p['conv2_w'], stride=1, padding=1), p['bn2_gamma'], p['bn2_beta'])

    if stride != 1 or c_in != c_out:
        shortcut = batch_norm2d(conv2d(x, p['proj_w'], stride=stride), p['proj_gamma'], p['proj_beta'])
    else:
        shortcut = x

    return F.relu(out + shortcut)
`,
    testCases: [
      {
        id: '1',
        description: 'Identity block keeps the shape',
        input: 'tuple(residual_block(torch.randn(2, 4, 6, 6), init_block_params(4, 4, 1), 1).shape)',
        expected: '(2, 4, 6, 6)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Projection block with stride 2',
        input: 'tuple(residual_block(torch.randn(2, 3, 6, 6), init_block_params(3, 8, 2), 2).shape)',
        expected: '(2, 8, 3, 3)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Zeroed convs: identity block reduces to ReLU(x + bn2_beta)',
        input: `(lambda: (
    x := torch.randn(2, 4, 5, 5),
    p := {**init_block_params(4, 4, 1), 'conv1_w': torch.zeros(4, 4, 3, 3), 'conv2_w': torch.zeros(4, 4, 3, 3)},
    bool(torch.allclose(residual_block(x, p, 1), torch.relu(x + p['bn2_beta'].view(1, -1, 1, 1)), atol=1e-6))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Zeroed convs: projection shortcut gives ReLU(bn2_beta + proj_beta)',
        input: `(lambda: (
    p := {**init_block_params(3, 6, 2), 'conv1_w': torch.zeros(6, 3, 3, 3), 'conv2_w': torch.zeros(6, 6, 3, 3), 'proj_w': torch.zeros(6, 3, 1, 1)},
    out := residual_block(torch.randn(2, 3, 4, 4), p, 2),
    bool(tuple(out.shape) == (2, 6, 2, 2) and torch.allclose(out, torch.relu(p['bn2_beta'] + p['proj_beta']).view(1, -1, 1, 1).expand(2, 6, 2, 2), atol=1e-6))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Identity block values',
        input: '(lambda out: bool(abs(out.sum().item() - 81.522768) < 1e-2 and torch.allclose(out[1, 2, 1], torch.tensor([0.56619, 0.948997, 1.222886, 0.0, 0.0]), atol=1e-4)))(residual_block(torch.cos(torch.arange(2 * 4 * 5 * 5, dtype=torch.float64) * 0.37).float().reshape(2, 4, 5, 5), init_block_params(4, 4, 1), 1))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Projection block values',
        input: '(lambda out: bool(abs(out.sum().item() - 84.736848) < 1e-2 and torch.allclose(out[0, :, 1, 2], torch.tensor([0.604783, 1.240603, 0.0, 1.525096, 0.0, 0.0, 0.598873, 0.0]), atol=1e-4)))(residual_block(torch.cos(torch.arange(2 * 3 * 6 * 6, dtype=torch.float64) * 0.37).float().reshape(2, 3, 6, 6), init_block_params(3, 8, 2), 2))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Main path: F.relu(batch_norm2d(conv2d(x, conv1_w, stride, 1), ...)), then conv2d(..., conv2_w, 1, 1) and batch_norm2d.',
      'Projection when stride != 1 or C_in != C_out: batch_norm2d(conv2d(x, proj_w, stride=stride), proj_gamma, proj_beta).',
      'F.relu(main + shortcut): the ReLU comes after the addition.',
    ],
  },
};
