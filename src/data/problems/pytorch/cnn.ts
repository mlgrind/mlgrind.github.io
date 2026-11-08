import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../cnn.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const cnnPyTorch: Record<string, LanguageVariant> = {
  'conv2d-forward': {
    note: "Implement with slicing and tensor ops. Don't use F.conv2d, nn.Conv2d or unfold. A hidden test compares your output with F.conv2d.",
    starterCode: `import torch

def conv2d(image, kernel):
    """
    Apply 2D convolution (cross-correlation, no padding, stride 1) to an image.

    Args:
        image: Input image tensor (H, W)
        kernel: Convolution kernel tensor (kH, kW)

    Returns:
        output: Convolved image tensor (H-kH+1, W-kW+1)
    """
    # Your code here
    pass
`,
    solution: `import torch

def conv2d(image, kernel):
    H, W = image.shape
    kH, kW = kernel.shape
    out_H, out_W = H - kH + 1, W - kW + 1

    # Slide the image under each kernel tap and accumulate:
    # out[i, j] = sum_{a, b} image[i + a, j + b] * kernel[a, b]
    output = torch.zeros(out_H, out_W)
    for a in range(kH):
        for b in range(kW):
            output = output + kernel[a, b] * image[a:a + out_H, b:b + out_W]
    return output
`,
    testCases: [
      {
        id: '1',
        description: 'Identity kernel',
        input: 'conv2d(torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0], [7.0, 8.0, 9.0]]), torch.tensor([[0.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 0.0]])).tolist()',
        expected: '[[5.0]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Edge detection',
        input: 'conv2d(torch.tensor([[0.0, 0.0, 0.0, 0.0], [0.0, 1.0, 1.0, 0.0], [0.0, 1.0, 1.0, 0.0], [0.0, 0.0, 0.0, 0.0]]), torch.tensor([[-1.0, -1.0, -1.0], [-1.0, 8.0, -1.0], [-1.0, -1.0, -1.0]])).tolist()',
        expected: '[[5.0, 5.0], [5.0, 5.0]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Non-square kernel output shape',
        input: 'tuple(conv2d(torch.randn(6, 5), torch.randn(2, 3)).shape)',
        expected: '(5, 3)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Matches F.conv2d on random input',
        input: `(lambda: (
            img := torch.randn(7, 6),
            k := torch.randn(3, 2),
            bool(torch.allclose(conv2d(img, k), torch.nn.functional.conv2d(img[None, None], k[None, None])[0, 0], atol=1e-5))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Output size is (H-kH+1, W-kW+1)',
      'Nested loops over output positions work: (image[i:i+kH, j:j+kW] * kernel).sum()',
      'Faster: loop over the kH*kW kernel taps and add kernel[a, b] * image[a:a+out_H, b:b+out_W]',
    ],
  },

  'max-pool': {
    note: "Implement with reshape/slicing and max. Don't use F.max_pool2d or nn.MaxPool2d.",
    starterCode: `import torch

def max_pool2d(image, pool_size=2):
    """
    Apply 2D max pooling (window = stride = pool_size).

    Args:
        image: Input image tensor (H, W)
        pool_size: Size of pooling window

    Returns:
        output: Pooled image tensor (H//pool_size, W//pool_size)
    """
    # Your code here
    pass
`,
    solution: `import torch

def max_pool2d(image, pool_size=2):
    H, W = image.shape
    p = pool_size
    out_H, out_W = H // p, W // p

    # Crop to a multiple of p, split each axis into (blocks, p), take the max per block
    x = image[:out_H * p, :out_W * p].reshape(out_H, p, out_W, p)
    return x.max(dim=3)[0].max(dim=1)[0]
`,
    testCases: [
      {
        id: '1',
        description: '4x4 to 2x2',
        input: 'max_pool2d(torch.tensor([[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0], [9.0, 10.0, 11.0, 12.0], [13.0, 14.0, 15.0, 16.0]])).tolist()',
        expected: '[[6.0, 8.0], [14.0, 16.0]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'With negative values',
        input: 'max_pool2d(-torch.arange(1, 17).float().reshape(4, 4)).tolist()',
        expected: '[[-1.0, -3.0], [-9.0, -11.0]]',
        hidden: true,
      },
      {
        id: '3',
        description: 'Odd size drops the last row/column',
        input: 'max_pool2d(torch.arange(25).float().reshape(5, 5)).tolist()',
        expected: '[[6.0, 8.0], [16.0, 18.0]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Matches F.max_pool2d with pool_size=3',
        input: `(lambda: (
            img := torch.randn(9, 7),
            bool(torch.allclose(max_pool2d(img, 3), torch.nn.functional.max_pool2d(img[None, None], 3)[0, 0]))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Output size is (H // pool_size, W // pool_size)',
      'Loop version: output[i, j] = image[i*p:(i+1)*p, j*p:(j+1)*p].max()',
      'Vectorized: reshape to (out_H, p, out_W, p) and take .max(dim=...) twice',
    ],
  },

  'flatten-layer': {
    note: 'Use view/reshape. nn.Flatten would do it for you; write the reshape yourself.',
    starterCode: `import torch

def flatten(X):
    """
    Flatten feature maps to vectors.

    Args:
        X: Input tensor (batch, height, width, channels)

    Returns:
        output: Flattened tensor (batch, height*width*channels)
    """
    # Your code here
    pass
`,
    solution: `import torch

def flatten(X):
    batch_size = X.shape[0]
    return X.reshape(batch_size, -1)
`,
    testCases: [
      {
        id: '1',
        description: 'Correct output shape',
        input: 'flatten(torch.randn(2, 4, 4, 3)).shape',
        expected: '(2, 48)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Row-major order is kept',
        input: 'flatten(torch.arange(12).reshape(2, 3, 2, 1)).tolist()',
        expected: '[[0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Values preserved',
        input: 'bool(torch.equal(flatten(torch.arange(24).reshape(1, 2, 3, 4)), torch.arange(24).reshape(1, 24)))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Batch size is X.shape[0]',
      'X.reshape(batch_size, -1) infers the remaining size',
      'X.view(X.size(0), -1) also works on contiguous tensors',
    ],
  },

  'conv-output-size': {
    note: 'Plain integer arithmetic. A hidden test compares your formula with the shape F.conv2d actually produces.',
    starterCode: `import torch

def conv_output_size(input_size, kernel_size, padding=0, stride=1):
    """
    Calculate output size of a convolution layer.

    Args:
        input_size: Input dimension (height or width)
        kernel_size: Kernel dimension
        padding: Zero-padding
        stride: Stride

    Returns:
        output_size: Output dimension (int)
    """
    # Your code here
    pass
`,
    solution: `import torch

def conv_output_size(input_size, kernel_size, padding=0, stride=1):
    return (input_size - kernel_size + 2 * padding) // stride + 1
`,
    testCases: [
      {
        id: '1',
        description: 'Same padding',
        input: 'conv_output_size(32, 3, 1, 1)',
        expected: '32',
        hidden: false,
      },
      {
        id: '2',
        description: 'No padding, stride 2',
        input: 'conv_output_size(32, 3, 0, 2)',
        expected: '15',
        hidden: false,
      },
      {
        id: '3',
        description: 'Large kernel',
        input: 'conv_output_size(224, 7, 3, 2)',
        expected: '112',
        hidden: true,
      },
      {
        id: '4',
        description: 'Agrees with the shape F.conv2d produces',
        input: 'conv_output_size(11, 4, 2, 3) == torch.nn.functional.conv2d(torch.zeros(1, 1, 11, 11), torch.zeros(1, 1, 4, 4), padding=2, stride=3).shape[-1]',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Apply the formula: (input - kernel + 2*padding) / stride + 1',
      'Use integer division (//) for the result',
    ],
  },

  'conv2d-advanced': {
    note: "Implement with tensor ops (F.pad for the padding is fine). Don't use F.conv2d, nn.Conv2d or unfold. Hidden tests compare against F.conv2d.",
    starterCode: `import torch
import torch.nn.functional as F

def conv2d_advanced(input, kernel, padding=0, stride=1, groups=1):
    """
    Advanced 2D convolution with padding, stride, and groups.

    Args:
        input: Input tensor (batch, in_channels, H, W)
        kernel: Convolution kernels (out_channels, in_channels//groups, kH, kW)
        padding: Zero-padding added to input (default: 0)
        stride: Stride of the convolution (default: 1)
        groups: Number of groups for grouped convolution (default: 1)

    Returns:
        output: Convolved tensor (batch, out_channels, H_out, W_out)
    """
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def conv2d_advanced(input, kernel, padding=0, stride=1, groups=1):
    if padding > 0:
        input = F.pad(input, (padding, padding, padding, padding))

    B, C_in, H, W = input.shape
    C_out, C_g, kH, kW = kernel.shape
    G = groups
    O_g = C_out // G
    H_out = (H - kH) // stride + 1
    W_out = (W - kW) // stride + 1

    # Split channels into groups: input (B, G, C_g, H, W), kernel (G, O_g, C_g, kH, kW)
    x = input.reshape(B, G, C_g, H, W)
    k = kernel.reshape(G, O_g, C_g, kH, kW)

    out = torch.zeros(B, G, O_g, H_out, W_out)
    for a in range(kH):
        for b in range(kW):
            # Input pixels seen by kernel tap (a, b) at every output position
            patch = x[:, :, :, a:a + stride * (H_out - 1) + 1:stride, b:b + stride * (W_out - 1) + 1:stride]
            out = out + torch.einsum('bgchw,goc->bgohw', patch, k[:, :, :, a, b])

    return out.reshape(B, C_out, H_out, W_out)
`,
    testCases: [
      {
        id: '1',
        description: 'Basic convolution with padding and stride',
        input: 'conv2d_advanced(torch.ones(1, 1, 5, 5), torch.ones(1, 1, 3, 3), 1, 2, 1).shape',
        expected: '(1, 1, 3, 3)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Padding and stride values (hand-computed)',
        input: 'conv2d_advanced(torch.ones(1, 1, 3, 3), torch.ones(1, 1, 2, 2), 1, 2, 1).tolist()',
        expected: '[[[[1.0, 2.0], [2.0, 4.0]]]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Grouped convolution (groups=2) shape',
        input: 'conv2d_advanced(torch.arange(32).reshape(1, 2, 4, 4).float(), torch.ones(4, 1, 2, 2), 0, 1, 2).shape',
        expected: '(1, 4, 3, 3)',
        hidden: false,
      },
      {
        id: '4',
        description: 'Depthwise convolution (groups=in_channels)',
        input: 'conv2d_advanced(torch.ones(2, 3, 4, 4), torch.ones(3, 1, 2, 2), 0, 1, 3).shape',
        expected: '(2, 3, 3, 3)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Verify correct output values with groups',
        input: 'bool(torch.allclose(conv2d_advanced(torch.ones(1, 2, 3, 3), torch.ones(2, 1, 2, 2), 0, 1, 2), torch.full((1, 2, 2, 2), 4.0)))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Matches F.conv2d (padding=1, stride=2, groups=2) on random input',
        input: `(lambda: (
            x := torch.randn(2, 4, 7, 6),
            k := torch.randn(6, 2, 3, 2),
            bool(torch.allclose(conv2d_advanced(x, k, 1, 2, 2), torch.nn.functional.conv2d(x, k, padding=1, stride=2, groups=2), atol=1e-4))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Pad with F.pad(input, (p, p, p, p)): it pads the last two dims',
      'H_out = (H_padded - kH) // stride + 1',
      'For groups: reshape input to (B, G, C_in//G, H, W) and kernel to (G, C_out//G, C_in//G, kH, kW)',
      'Loop over kernel taps (a, b): take the strided slice x[..., a::stride, b::stride] (cropped to H_out, W_out) and contract channels with einsum',
    ],
  },
  // Ported with the new problems from the ML Coding Lab fork.
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
  // Tracks for existing problems that had no PyTorch track yet.
  'iou-bounding-box': {
    note: "Implement with tensor ops. torchvision.ops.box_iou isn't available in the browser.",
    starterCode: `import torch

def iou(box_a, box_b):
    """
    Calculate Intersection over Union of two bounding boxes.

    Args:
        box_a: Tensor [x1, y1, x2, y2], first bounding box
        box_b: Tensor [x1, y1, x2, y2], second bounding box

    Returns:
        IoU score as a Python float, rounded to 4 decimal places
    """
    # Your code here
    pass
`,
    solution: `import torch

def iou(box_a, box_b):
    # Intersection rectangle: max of the top-left corners, min of the bottom-right corners
    top_left = torch.maximum(box_a[:2], box_b[:2])
    bottom_right = torch.minimum(box_a[2:], box_b[2:])
    wh = (bottom_right - top_left).clamp(min=0)
    intersection = wh[0] * wh[1]

    area_a = (box_a[2] - box_a[0]) * (box_a[3] - box_a[1])
    area_b = (box_b[2] - box_b[0]) * (box_b[3] - box_b[1])
    union = area_a + area_b - intersection

    if union.item() == 0:
        return 0.0
    return round((intersection / union).item(), 4)
`,
    testCases: [
      {
        id: '1',
        description: 'Partial overlap',
        input: 'iou(torch.tensor([0.0, 0.0, 2.0, 2.0]), torch.tensor([1.0, 1.0, 3.0, 3.0]))',
        expected: '0.1429',
        hidden: false,
      },
      {
        id: '2',
        description: 'No overlap',
        input: 'iou(torch.tensor([0.0, 0.0, 1.0, 1.0]), torch.tensor([2.0, 2.0, 3.0, 3.0]))',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '3',
        description: 'One box inside another',
        input: 'iou(torch.tensor([0.0, 0.0, 4.0, 4.0]), torch.tensor([1.0, 1.0, 3.0, 3.0]))',
        expected: '0.25',
        hidden: true,
      },
      {
        id: '4',
        description: 'Identical boxes',
        input: 'iou(torch.tensor([0.0, 0.0, 5.0, 5.0]), torch.tensor([0.0, 0.0, 5.0, 5.0]))',
        expected: '1.0',
        hidden: true,
      },
      {
        id: '5',
        description: 'Non-square boxes overlapping on one side',
        input: 'iou(torch.tensor([1.0, 1.0, 5.0, 4.0]), torch.tensor([2.0, 0.0, 6.0, 3.0]))',
        expected: '0.3333',
        hidden: true,
      },
    ],
    hints: [
      'Intersection corners: torch.maximum of the top-left corners (box[:2]) and torch.minimum of the bottom-right corners (box[2:])',
      'Clamp the intersection width and height at 0 with .clamp(min=0) so disjoint boxes give 0',
      'Union = area_a + area_b - intersection; return round((intersection / union).item(), 4)',
    ],
  },

  nms: {
    note: "Implement the suppression loop yourself. torchvision.ops.nms isn't available in the browser.",
    starterCode: `import torch

def nms(boxes, scores, iou_threshold=0.5):
    """
    Apply Non-Maximum Suppression.

    Args:
        boxes: Tensor (N, 4) of [x1, y1, x2, y2] bounding boxes
        scores: Tensor (N,) of confidence scores for each box
        iou_threshold: IoU threshold for suppression (default: 0.5)

    Returns:
        List of indices (Python ints) of kept boxes, sorted by decreasing score
    """
    # Your code here
    pass
`,
    solution: `import torch

def nms(boxes, scores, iou_threshold=0.5):
    x1, y1, x2, y2 = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
    areas = (x2 - x1) * (y2 - y1)
    order = torch.argsort(scores, descending=True)
    keep = []

    while order.numel() > 0:
        i = order[0]
        keep.append(int(i))
        rest = order[1:]

        # IoU of the picked box against every remaining box, vectorized
        w = (torch.minimum(x2[rest], x2[i]) - torch.maximum(x1[rest], x1[i])).clamp(min=0)
        h = (torch.minimum(y2[rest], y2[i]) - torch.maximum(y1[rest], y1[i])).clamp(min=0)
        inter = w * h
        union = areas[i] + areas[rest] - inter
        ious = torch.where(union > 0, inter / union, torch.zeros_like(inter))

        # Keep only the boxes that don't overlap the picked one too much
        order = rest[ious <= iou_threshold]

    return keep
`,
    testCases: [
      {
        id: '1',
        description: 'Suppress one overlapping box',
        input: 'nms(torch.tensor([[0.0, 0.0, 4.0, 4.0], [1.0, 1.0, 4.0, 4.0], [6.0, 6.0, 8.0, 8.0]]), torch.tensor([0.9, 0.75, 0.8]), 0.5)',
        expected: '[0, 2]',
        hidden: false,
      },
      {
        id: '2',
        description: 'No overlap: keep all, ordered by score',
        input: 'nms(torch.tensor([[0.0, 0.0, 1.0, 1.0], [3.0, 3.0, 4.0, 4.0], [6.0, 6.0, 7.0, 7.0]]), torch.tensor([0.5, 0.9, 0.7]), 0.5)',
        expected: '[1, 2, 0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Two clusters',
        input: 'nms(torch.tensor([[0.0, 0.0, 4.0, 4.0], [1.0, 1.0, 4.0, 4.0], [10.0, 10.0, 14.0, 14.0], [11.0, 11.0, 14.0, 14.0]]), torch.tensor([0.9, 0.85, 0.8, 0.7]), 0.5)',
        expected: '[0, 2]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Identical boxes: keep only the best',
        input: 'nms(torch.tensor([[0.0, 0.0, 4.0, 4.0], [0.0, 0.0, 4.0, 4.0], [0.0, 0.0, 4.0, 4.0]]), torch.tensor([0.6, 0.9, 0.7]), 0.5)',
        expected: '[1]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Higher threshold keeps a box with IoU 0.5625',
        input: 'nms(torch.tensor([[0.0, 0.0, 4.0, 4.0], [1.0, 1.0, 4.0, 4.0], [2.0, 0.0, 6.0, 4.0]]), torch.tensor([0.9, 0.8, 0.7]), 0.6)',
        expected: '[0, 1, 2]',
        hidden: true,
      },
      {
        id: '6',
        description: 'IoU exactly at the threshold is kept (only IoU > threshold is suppressed)',
        input: 'nms(torch.tensor([[0.0, 0.0, 2.0, 2.0], [0.0, 0.0, 2.0, 1.0]]), torch.tensor([0.9, 0.8]), 0.5)',
        expected: '[0, 1]',
        hidden: true,
      },
    ],
    hints: [
      'order = torch.argsort(scores, descending=True) gives the visiting order',
      'Pick order[0], then compute its IoU with all of order[1:] at once using torch.maximum / torch.minimum and .clamp(min=0)',
      'Filter with a boolean mask: order = rest[ious <= iou_threshold]; convert kept indices with int(i)',
    ],
  },

  'focal-loss': {
    note: "Implement the formula with tensor ops. Don't use torchvision.ops.sigmoid_focal_loss (it takes logits, not probabilities, and isn't available in the browser).",
    starterCode: `import torch

def focal_loss(predictions, targets, alpha=0.25, gamma=2.0):
    """
    Compute focal loss for binary classification.

    Args:
        predictions: Tensor of predicted probabilities in [0, 1]
        targets: Tensor of ground truth labels (0s and 1s)
        alpha: Balancing factor (default: 0.25)
        gamma: Focusing parameter (default: 2.0)

    Returns:
        Mean focal loss as a Python float, rounded to 4 decimal places
    """
    # Your code here
    pass
`,
    solution: `import torch

def focal_loss(predictions, targets, alpha=0.25, gamma=2.0):
    p = predictions.float().clamp(1e-7, 1 - 1e-7)
    t = targets.float()

    # Probability and weight of the true class
    p_t = torch.where(t == 1, p, 1 - p)
    alpha_t = alpha * t + (1 - alpha) * (1 - t)

    loss = -alpha_t * (1 - p_t) ** gamma * torch.log(p_t)
    return round(loss.mean().item(), 4)
`,
    testCases: [
      {
        id: '1',
        description: 'Easy examples are down-weighted',
        input: 'focal_loss(torch.tensor([0.9, 0.1]), torch.tensor([1, 0]), 0.25, 2.0)',
        expected: '0.0005',
        hidden: false,
      },
      {
        id: '2',
        description: 'Moderate predictions',
        input: 'focal_loss(torch.tensor([0.6, 0.4]), torch.tensor([1, 0]), 0.25, 2.0)',
        expected: '0.0409',
        hidden: false,
      },
      {
        id: '3',
        description: 'gamma=0 reduces to alpha-weighted cross-entropy',
        input: 'focal_loss(torch.tensor([0.9, 0.1]), torch.tensor([1, 0]), 0.25, 0.0)',
        expected: '0.0527',
        hidden: true,
      },
      {
        id: '4',
        description: 'Hard (wrong) examples dominate',
        input: 'focal_loss(torch.tensor([0.1, 0.9]), torch.tensor([1, 0]), 0.25, 2.0)',
        expected: '0.9325',
        hidden: true,
      },
      {
        id: '5',
        description: 'Default alpha and gamma on four examples',
        input: 'focal_loss(torch.tensor([0.7, 0.2, 0.55, 0.95]), torch.tensor([1, 0, 0, 1]))',
        expected: '0.049',
        hidden: true,
      },
    ],
    hints: [
      'p_t = torch.where(targets == 1, p, 1 - p)',
      'alpha_t = alpha * t + (1 - alpha) * (1 - t)',
      'Clamp p to [1e-7, 1 - 1e-7] before torch.log; return round(loss.mean().item(), 4)',
    ],
  },

  'smooth-l1-loss': {
    note: "Implement with torch.where. Don't use F.smooth_l1_loss or F.huber_loss.",
    starterCode: `import torch

def smooth_l1_loss(predictions, targets, beta=1.0):
    """
    Compute Smooth L1 (Huber) Loss.

    Args:
        predictions: Tensor of predicted values
        targets: Tensor of target values
        beta: Threshold for quadratic-to-linear transition (default: 1.0)

    Returns:
        Mean smooth L1 loss as a Python float, rounded to 4 decimal places
    """
    # Your code here
    pass
`,
    solution: `import torch

def smooth_l1_loss(predictions, targets, beta=1.0):
    diff = predictions.float() - targets.float()
    abs_diff = diff.abs()

    # Quadratic inside |x| < beta, linear outside
    loss = torch.where(abs_diff < beta, 0.5 * diff ** 2 / beta, abs_diff - 0.5 * beta)
    return round(loss.mean().item(), 4)
`,
    testCases: [
      {
        id: '1',
        description: 'Small errors (quadratic region)',
        input: 'smooth_l1_loss(torch.tensor([0.2, -0.3]), torch.tensor([0.0, 0.0]), 1.0)',
        expected: '0.0325',
        hidden: false,
      },
      {
        id: '2',
        description: 'Large errors (linear region)',
        input: 'smooth_l1_loss(torch.tensor([3.0, -2.0]), torch.tensor([0.0, 0.0]), 1.0)',
        expected: '2.0',
        hidden: false,
      },
      {
        id: '3',
        description: 'Mixed small and large errors',
        input: 'smooth_l1_loss(torch.tensor([0.5, 1.5, -2.0]), torch.tensor([0.0, 0.0, 0.0]), 1.0)',
        expected: '0.875',
        hidden: true,
      },
      {
        id: '4',
        description: 'Custom beta',
        input: 'smooth_l1_loss(torch.tensor([0.3, 2.0]), torch.tensor([0.0, 0.0]), 0.5)',
        expected: '0.92',
        hidden: true,
      },
      {
        id: '5',
        description: 'Non-zero targets, 2D input, default beta',
        input: 'smooth_l1_loss(torch.tensor([[1.0, 2.5], [-0.5, 4.0]]), torch.tensor([[0.5, 0.5], [0.0, 3.2]]))',
        expected: '0.5175',
        hidden: true,
      },
    ],
    hints: [
      'x = predictions - targets, then x.abs()',
      'torch.where(abs_x < beta, 0.5 * x ** 2 / beta, abs_x - 0.5 * beta)',
      'Return round(loss.mean().item(), 4)',
    ],
  },

  'seg-metrics': {
    starterCode: `import torch

def segmentation_metrics(prediction, target):
    """
    Compute segmentation evaluation metrics.

    Args:
        prediction: Binary predicted mask (2D tensor of 0s and 1s)
        target: Binary ground truth mask (2D tensor of 0s and 1s)

    Returns:
        Dictionary with 'iou', 'pixel_accuracy', 'dice' (Python floats rounded to 4 dp)
    """
    # Your code here
    pass
`,
    solution: `import torch

def segmentation_metrics(prediction, target):
    pred = prediction.float()
    targ = target.float()

    intersection = (pred * targ).sum()
    total = pred.sum() + targ.sum()
    union = total - intersection

    iou_val = (intersection / union).item() if union > 0 else 0.0
    pixel_acc = (pred == targ).float().mean().item()
    dice = (2 * intersection / total).item() if total > 0 else 0.0

    return {
        'iou': round(iou_val, 4),
        'pixel_accuracy': round(pixel_acc, 4),
        'dice': round(dice, 4),
    }
`,
    testCases: [
      {
        id: '1',
        description: 'Partial overlap',
        input: 'segmentation_metrics(torch.tensor([[1, 1], [0, 0]]), torch.tensor([[1, 0], [0, 1]]))',
        expected: '{"iou": 0.3333, "pixel_accuracy": 0.5, "dice": 0.5}',
        hidden: false,
      },
      {
        id: '2',
        description: 'Perfect prediction',
        input: 'segmentation_metrics(torch.tensor([[1, 0], [0, 1]]), torch.tensor([[1, 0], [0, 1]]))',
        expected: '{"iou": 1.0, "pixel_accuracy": 1.0, "dice": 1.0}',
        hidden: false,
      },
      {
        id: '3',
        description: 'Dice on a 2x3 mask',
        input: "segmentation_metrics(torch.tensor([[1, 1, 0], [0, 0, 0]]), torch.tensor([[0, 1, 1], [0, 0, 0]]))['dice']",
        expected: '0.5',
        hidden: true,
      },
      {
        id: '4',
        description: 'Disjoint masks have IoU 0',
        input: "segmentation_metrics(torch.tensor([[1, 1], [0, 0]]), torch.tensor([[0, 0], [1, 1]]))['iou']",
        expected: '0.0',
        hidden: true,
      },
      {
        id: '5',
        description: 'All metrics on a 3x3 mask',
        input: 'segmentation_metrics(torch.tensor([[1, 1, 0], [1, 1, 0], [0, 0, 0]]), torch.tensor([[1, 1, 1], [1, 0, 0], [0, 0, 0]]))',
        expected: '{"iou": 0.6, "pixel_accuracy": 0.7778, "dice": 0.75}',
        hidden: true,
      },
    ],
    hints: [
      'Cast masks with .float(); intersection = (pred * targ).sum()',
      'Union = pred.sum() + targ.sum() - intersection',
      'Pixel accuracy: (pred == targ).float().mean(); use .item() to get Python floats before rounding',
    ],
  },
};
