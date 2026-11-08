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
};
