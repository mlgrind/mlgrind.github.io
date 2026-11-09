import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../cnn.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const cnnPyTorch: Record<string, LanguageVariant> = {
  'conv2d-forward': {
    note: `Implement with slicing and tensor ops. Don't use F.conv2d, nn.Conv2d or unfold. Like them, compute cross-correlation (no kernel flip); a hidden test compares your output with F.conv2d.`,
    starterCode: `import torch

def conv2d(image, kernel):
    """
    Apply a 2D convolution (cross-correlation, no padding, stride 1).

    Args:
        image: Float tensor, shape (H, W)
        kernel: Float tensor, shape (kH, kW)

    Returns:
        output: Float tensor of shape (H - kH + 1, W - kW + 1)
    """
    # Your code here
    pass
`,
    solution: `import torch

def conv2d(image, kernel):
    """
    Apply a 2D convolution (cross-correlation, no padding, stride 1).

    Args:
        image: Float tensor, shape (H, W)
        kernel: Float tensor, shape (kH, kW)

    Returns:
        output: Float tensor of shape (H - kH + 1, W - kW + 1)
    """
    H, W = image.shape
    kH, kW = kernel.shape
    H_out, W_out = H - kH + 1, W - kW + 1

    # Loop over kernel taps: tap (a, b) multiplies image[i + a, j + b] for every (i, j)
    output = torch.zeros(H_out, W_out)
    for a in range(kH):
        for b in range(kW):
            output = output + kernel[a, b] * image[a:a + H_out, b:b + W_out]
    return output

# Time O(H_out * W_out * kH * kW), extra space O(H_out * W_out).
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
      {
        id: '5',
        description: 'Float values and an asymmetric kernel',
        input: 'conv2d(torch.tensor([[0.5, 1.5, -1.0], [2.0, 0.25, 1.0], [-0.5, 3.0, 2.0]]), torch.tensor([[1.0, -0.5], [0.5, 2.0]])).tolist()',
        expected: '[[1.25, 4.125], [7.625, 5.25]]',
        hidden: true,
      },
    ],
    hints: [
      'Every output pixel is the dot product of the kernel with the patch under it. How many positions fit along each axis?',
      'Allocate torch.zeros(H - kH + 1, W - kW + 1) and fill it, either per output position or per kernel tap.',
      'Per position: (image[i:i+kH, j:j+kW] * kernel).sum(). Per tap (faster): output += kernel[a, b] * image[a:a+H_out, b:b+W_out].',
      "Don't flip the kernel: F.conv2d is cross-correlation. Index the image as image[row, col], i.e. (H, W).",
    ],
  },

  'max-pool': {
    note: "Implement with reshape/slicing and max. Don't use F.max_pool2d or nn.MaxPool2d (a hidden test compares with F.max_pool2d).",
    starterCode: `import torch

def max_pool2d(image, pool_size=2):
    """
    Apply 2D max pooling with window = stride = pool_size.

    Args:
        image: Tensor, shape (H, W)
        pool_size: Window size and stride p (default 2)

    Returns:
        output: Tensor of shape (H // p, W // p); leftover rows/columns are dropped
    """
    # Your code here
    pass
`,
    solution: `import torch

def max_pool2d(image, pool_size=2):
    """
    Apply 2D max pooling with window = stride = pool_size.

    Args:
        image: Tensor, shape (H, W)
        pool_size: Window size and stride p (default 2)

    Returns:
        output: Tensor of shape (H // p, W // p); leftover rows/columns are dropped
    """
    H, W = image.shape
    p = pool_size
    H_out, W_out = H // p, W // p

    # Crop to whole windows, split each axis into (window, offset), max over the offsets
    x = image[:H_out * p, :W_out * p].reshape(H_out, p, W_out, p)
    return x.max(dim=3)[0].max(dim=1)[0]

# Time O(H * W), extra space O(H_out * W_out).
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
      {
        id: '5',
        description: 'Maximum is not always in the same corner',
        input: 'max_pool2d(torch.tensor([[1.0, 3.0, 2.0, 0.0], [4.0, 2.0, 1.0, 5.0], [0.0, 1.0, 7.0, 2.0], [3.0, 2.0, 4.0, 6.0]])).tolist()',
        expected: '[[4.0, 5.0], [3.0, 7.0]]',
        hidden: false,
      },
    ],
    hints: [
      'Each output depends only on its own non-overlapping p x p window. How many whole windows fit per axis?',
      'Crop to (H // p * p, W // p * p), then reduce each window to its max.',
      'image[:H_out*p, :W_out*p].reshape(H_out, p, W_out, p), then .max(dim=3)[0].max(dim=1)[0] (in real PyTorch, .amax(dim=(1, 3)) does both at once).',
      'tensor.max(dim=...) returns a (values, indices) pair: take [0] or .values. Without dim it returns a single scalar.',
    ],
  },

  'flatten-layer': {
    note: 'Use reshape. nn.Flatten / torch.flatten(X, 1) would do it for you; write the reshape yourself. The input is NHWC (batch, height, width, channels).',
    starterCode: `import torch

def flatten(X):
    """
    Flatten NHWC feature maps to vectors.

    Args:
        X: Tensor, shape (batch, height, width, channels)

    Returns:
        output: Tensor of shape (batch, height * width * channels), row-major order
    """
    # Your code here
    pass
`,
    solution: `import torch

def flatten(X):
    """
    Flatten NHWC feature maps to vectors.

    Args:
        X: Tensor, shape (batch, height, width, channels)

    Returns:
        output: Tensor of shape (batch, height * width * channels), row-major order
    """
    # reshape (not view) also works on non-contiguous tensors, e.g. after a permute
    return X.reshape(X.shape[0], -1)
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
      {
        id: '4',
        description: 'Non-contiguous input (NCHW permuted to NHWC)',
        input: 'flatten(torch.arange(24).reshape(2, 3, 2, 2).permute(0, 2, 3, 1)).tolist()',
        expected: '[[0, 4, 8, 1, 5, 9, 2, 6, 10, 3, 7, 11], [12, 16, 20, 13, 17, 21, 14, 18, 22, 15, 19, 23]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Single sample stays 2D',
        input: 'flatten(torch.randn(1, 3, 3, 2)).shape',
        expected: '(1, 18)',
        hidden: true,
      },
    ],
    hints: [
      'Only the batch axis survives; height, width and channels merge into one feature axis.',
      'Read the batch size from X.shape[0] and reshape to (batch_size, -1).',
      'X.reshape(X.shape[0], -1); -1 infers H * W * C.',
      'X.view(...) raises on a permuted (non-contiguous) tensor in real PyTorch; reshape copies when it has to. X.flatten() alone would also merge the batch axis.',
    ],
  },

  'conv-output-size': {
    note: 'Plain integer arithmetic (return a Python int). A hidden test compares your formula with the shape F.conv2d actually produces.',
    starterCode: `import torch

def conv_output_size(input_size, kernel_size, padding=0, stride=1):
    """
    Calculate the output size of a convolution (or pooling) layer.

    Args:
        input_size: Input height or width
        kernel_size: Kernel height or width
        padding: Zero-padding added to each side
        stride: Step between kernel positions

    Returns:
        output_size: Output height or width (int)
    """
    # Your code here
    pass
`,
    solution: `import torch

def conv_output_size(input_size, kernel_size, padding=0, stride=1):
    """
    Calculate the output size of a convolution (or pooling) layer.

    Args:
        input_size: Input height or width
        kernel_size: Kernel height or width
        padding: Zero-padding added to each side
        stride: Step between kernel positions

    Returns:
        output_size: Output height or width (int)
    """
    # Number of valid start positions in the padded input, stepping by stride
    return (input_size + 2 * padding - kernel_size) // stride + 1
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
      {
        id: '5',
        description: 'Floor matters with padding and stride 3',
        input: 'conv_output_size(10, 3, 1, 3)',
        expected: '4',
        hidden: true,
      },
    ],
    hints: [
      'Count the positions the kernel can take: it starts at the left edge of the padded input and moves by stride.',
      'The padded input has size input_size + 2 * padding; the last valid start index is that minus kernel_size.',
      'output = (input_size + 2 * padding - kernel_size) // stride + 1',
      'Use // so the result is an int; / gives a float such as 15.5.',
    ],
  },

  'conv2d-advanced': {
    note: `Implement with tensor ops (F.pad for the padding and torch.einsum are fine). Don't use F.conv2d, nn.Conv2d or unfold. Layout is NCHW with weights (C_out, C_in // groups, kH, kW), exactly like F.conv2d; hidden tests compare against it.`,
    starterCode: `import torch
import torch.nn.functional as F

def conv2d_advanced(input, kernel, padding=0, stride=1, groups=1):
    """
    2D convolution (cross-correlation) with padding, stride and groups, NCHW layout.

    Args:
        input: Tensor, shape (N, C_in, H, W)
        kernel: Tensor, shape (C_out, C_in // groups, kH, kW)
        padding: Zeros added to each side of H and W (default 0)
        stride: Step between kernel positions (default 1)
        groups: Number of channel groups (default 1)

    Returns:
        output: Tensor, shape (N, C_out, H_out, W_out) with
                H_out = (H + 2*padding - kH) // stride + 1 (same for W)
    """
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def conv2d_advanced(input, kernel, padding=0, stride=1, groups=1):
    """
    2D convolution (cross-correlation) with padding, stride and groups, NCHW layout.

    Args:
        input: Tensor, shape (N, C_in, H, W)
        kernel: Tensor, shape (C_out, C_in // groups, kH, kW)
        padding: Zeros added to each side of H and W (default 0)
        stride: Step between kernel positions (default 1)
        groups: Number of channel groups (default 1)

    Returns:
        output: Tensor, shape (N, C_out, H_out, W_out) with
                H_out = (H + 2*padding - kH) // stride + 1 (same for W)
    """
    if padding > 0:
        input = F.pad(input, (padding, padding, padding, padding))  # pads W, then H

    N, C_in, H, W = input.shape
    C_out, C_g, kH, kW = kernel.shape
    G, s = groups, stride
    O_g = C_out // G
    H_out = (H - kH) // s + 1
    W_out = (W - kW) // s + 1

    # Split channels into groups: x (N, G, C_g, H, W), k (G, O_g, C_g, kH, kW)
    x = input.reshape(N, G, C_g, H, W)
    k = kernel.reshape(G, O_g, C_g, kH, kW)

    out = torch.zeros(N, G, O_g, H_out, W_out)
    for a in range(kH):
        for b in range(kW):
            # Input pixels seen by kernel tap (a, b) at every output position
            patch = x[:, :, :, a:a + s * (H_out - 1) + 1:s, b:b + s * (W_out - 1) + 1:s]
            out = out + torch.einsum('ngchw,goc->ngohw', patch, k[:, :, :, a, b])

    return out.reshape(N, C_out, H_out, W_out)
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
      {
        id: '7',
        description: 'Each group only sees its own channels (kernel 1 = ones, kernel 2 = twos)',
        input: 'conv2d_advanced(torch.arange(32).float().reshape(1, 2, 4, 4), torch.stack([torch.ones(1, 2, 2), 2 * torch.ones(1, 2, 2)]), 0, 2, 2).tolist()',
        expected: '[[[[10.0, 18.0], [42.0, 50.0]], [[148.0, 164.0], [212.0, 228.0]]]]',
        hidden: true,
      },
    ],
    hints: [
      'Three layers: pad, compute the output size from the padded input, then treat each group as an ordinary multi-channel convolution.',
      'Reshape input to (N, G, C_in//G, H, W) and kernel to (G, C_out//G, C_in//G, kH, kW) so all groups are handled at once.',
      `F.pad(input, (p, p, p, p)) pads the last two dims. For tap (a, b) take x[..., a:a + s*(H_out-1) + 1:s, b:b + s*(W_out-1) + 1:s] and contract channels with torch.einsum('ngchw,goc->ngohw', patch, k[..., a, b]).`,
      'Common bugs: H_out from the unpadded size, a group seeing all input channels, or mixing up the (C_out, C_in // groups, kH, kW) weight layout.',
    ],
  },

  'iou-bounding-box': {
    note: "Implement with tensor ops. torchvision.ops.box_iou isn't available in the browser (it also uses the xyxy format).",
    starterCode: `import torch

def iou(box_a, box_b):
    """
    Intersection over Union of two boxes in xyxy format.

    Args:
        box_a: Tensor [x1, y1, x2, y2], top-left (x1, y1) and bottom-right (x2, y2)
        box_b: Tensor [x1, y1, x2, y2]

    Returns:
        IoU as a Python float in [0, 1], rounded to 4 decimal places
        (0.0 when the union is 0)
    """
    # Your code here
    pass
`,
    solution: `import torch

def iou(box_a, box_b):
    """
    Intersection over Union of two boxes in xyxy format.

    Args:
        box_a: Tensor [x1, y1, x2, y2], top-left (x1, y1) and bottom-right (x2, y2)
        box_b: Tensor [x1, y1, x2, y2]

    Returns:
        IoU as a Python float in [0, 1], rounded to 4 decimal places
        (0.0 when the union is 0)
    """
    # Intersection rectangle: max of the top-left corners, min of the bottom-right corners
    top_left = torch.maximum(box_a[:2], box_b[:2])
    bottom_right = torch.minimum(box_a[2:], box_b[2:])
    wh = (bottom_right - top_left).clamp(min=0)   # clamp width and height separately
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
      {
        id: '6',
        description: 'Boxes that only touch along an edge',
        input: 'iou(torch.tensor([0.0, 0.0, 2.0, 2.0]), torch.tensor([2.0, 0.0, 4.0, 2.0]))',
        expected: '0.0',
        hidden: true,
      },
      {
        id: '7',
        description: 'Disjoint in x but overlapping in y (clamp each side)',
        input: 'iou(torch.tensor([0.0, 0.0, 1.0, 3.0]), torch.tensor([2.0, 1.0, 4.0, 2.0]))',
        expected: '0.0',
        hidden: true,
      },
    ],
    hints: [
      'The intersection of two axis-aligned boxes is another box (possibly empty). Which corners define it?',
      'Compute the intersection box, both areas, then union = area_a + area_b - intersection.',
      'top_left = torch.maximum(box_a[:2], box_b[:2]); bottom_right = torch.minimum(box_a[2:], box_b[2:]); wh = (bottom_right - top_left).clamp(min=0).',
      'Clamp before multiplying width by height, guard union == 0, and return round((intersection / union).item(), 4) as a Python float.',
    ],
  },

  nms: {
    note: "Implement the suppression loop yourself. torchvision.ops.nms isn't available in the browser (it uses the same xyxy boxes and IoU > threshold rule).",
    starterCode: `import torch

def nms(boxes, scores, iou_threshold=0.5):
    """
    Greedy Non-Maximum Suppression (class-agnostic).

    Args:
        boxes: Tensor (N, 4) of boxes in xyxy format [x1, y1, x2, y2]
        scores: Tensor (N,) confidence score per box
        iou_threshold: suppress boxes with IoU > iou_threshold (default 0.5)

    Returns:
        List of kept indices (Python ints), in decreasing score order
    """
    # Your code here
    pass
`,
    solution: `import torch

def nms(boxes, scores, iou_threshold=0.5):
    """
    Greedy Non-Maximum Suppression (class-agnostic).

    Args:
        boxes: Tensor (N, 4) of boxes in xyxy format [x1, y1, x2, y2]
        scores: Tensor (N,) confidence score per box
        iou_threshold: suppress boxes with IoU > iou_threshold (default 0.5)

    Returns:
        List of kept indices (Python ints), in decreasing score order
    """
    x1, y1, x2, y2 = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
    areas = (x2 - x1) * (y2 - y1)
    order = torch.argsort(scores, descending=True)
    keep = []

    while order.numel() > 0:
        i = order[0]
        keep.append(int(i))
        rest = order[1:]

        # IoU of the kept box against every remaining box, vectorised
        w = (torch.minimum(x2[rest], x2[i]) - torch.maximum(x1[rest], x1[i])).clamp(min=0)
        h = (torch.minimum(y2[rest], y2[i]) - torch.maximum(y1[rest], y1[i])).clamp(min=0)
        inter = w * h
        union = areas[i] + areas[rest] - inter
        ious = torch.where(union > 0, inter / union, torch.zeros_like(inter))

        # Only IoU > threshold is suppressed
        order = rest[ious <= iou_threshold]

    return keep

# Time O(N log N + N * K) for K kept boxes (O(N^2) worst case); space O(N).
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
      {
        id: '7',
        description: 'Suppression is checked against each kept box, not only the first',
        input: 'nms(torch.tensor([[0.0, 0.0, 4.0, 4.0], [3.0, 0.0, 7.0, 4.0], [4.0, 0.0, 8.0, 4.0]]), torch.tensor([0.9, 0.8, 0.7]), 0.5)',
        expected: '[0, 1]',
        hidden: true,
      },
      {
        id: '8',
        description: 'Empty input',
        input: 'nms(torch.zeros(0, 4), torch.zeros(0), 0.5)',
        expected: '[]',
        hidden: true,
      },
    ],
    hints: [
      'Greedy: the highest-scoring box is always kept. What happens to the boxes that overlap it?',
      'Sort once, then loop: take the first index, compute its IoU with all remaining boxes, keep only the low-overlap ones.',
      'order = torch.argsort(scores, descending=True); IoU with torch.maximum / torch.minimum and .clamp(min=0); filter with order = rest[ious <= iou_threshold].',
      'Use <= so a box exactly at the threshold survives, and convert kept indices with int(i) so the result is a list of Python ints.',
    ],
  },

  'focal-loss': {
    note: `Implement the formula with tensor ops. Don't use torchvision.ops.sigmoid_focal_loss: it takes logits rather than probabilities and isn't available in the browser.`,
    starterCode: `import torch

def focal_loss(predictions, targets, alpha=0.25, gamma=2.0):
    """
    Mean binary focal loss.

    Args:
        predictions: Tensor of probabilities of class 1, shape (n,), values in [0, 1]
        targets: Tensor of labels 0 or 1, shape (n,)
        alpha: Weight of the positive class (negatives get 1 - alpha), default 0.25
        gamma: Focusing parameter, default 2.0

    Returns:
        Mean focal loss as a Python float, rounded to 4 decimal places
        (clamp p to [1e-7, 1 - 1e-7] before the log)
    """
    # Your code here
    pass
`,
    solution: `import torch

def focal_loss(predictions, targets, alpha=0.25, gamma=2.0):
    """
    Mean binary focal loss.

    Args:
        predictions: Tensor of probabilities of class 1, shape (n,), values in [0, 1]
        targets: Tensor of labels 0 or 1, shape (n,)
        alpha: Weight of the positive class (negatives get 1 - alpha), default 0.25
        gamma: Focusing parameter, default 2.0

    Returns:
        Mean focal loss as a Python float, rounded to 4 decimal places
        (clamp p to [1e-7, 1 - 1e-7] before the log)
    """
    p = predictions.float().clamp(1e-7, 1 - 1e-7)   # avoid log(0)
    t = targets.float()

    p_t = torch.where(t == 1, p, 1 - p)             # probability of the true class
    alpha_t = alpha * t + (1 - alpha) * (1 - t)     # alpha weights positives

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
      {
        id: '6',
        description: 'p of exactly 0 or 1 gives a finite loss (clamping)',
        input: 'bool(np.isfinite(focal_loss(torch.tensor([1.0, 0.0]), torch.tensor([0, 1]))))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Start from binary cross-entropy -log(p_t). Which factor shrinks the loss when p_t is close to 1?',
      'Build p_t and alpha_t elementwise from the targets, compute the per-example loss, then average.',
      'p_t = torch.where(t == 1, p, 1 - p); alpha_t = alpha * t + (1 - alpha) * (1 - t); loss = -alpha_t * (1 - p_t) ** gamma * torch.log(p_t).',
      'Cast integer targets with .float(), clamp p before torch.log, and return round(loss.mean().item(), 4).',
    ],
  },

  'smooth-l1-loss': {
    note: "Implement with torch.where. Don't use F.smooth_l1_loss or F.huber_loss (note that F.huber_loss with delta = beta equals beta times this loss).",
    starterCode: `import torch

def smooth_l1_loss(predictions, targets, beta=1.0):
    """
    Mean Smooth L1 loss.

    Args:
        predictions: Tensor of predicted values, any shape
        targets: Tensor of target values, same shape
        beta: Quadratic-to-linear transition point, > 0 (default 1.0)

    Returns:
        Mean loss over all elements as a Python float, rounded to 4 decimal places
    """
    # Your code here
    pass
`,
    solution: `import torch

def smooth_l1_loss(predictions, targets, beta=1.0):
    """
    Mean Smooth L1 loss.

    Args:
        predictions: Tensor of predicted values, any shape
        targets: Tensor of target values, same shape
        beta: Quadratic-to-linear transition point, > 0 (default 1.0)

    Returns:
        Mean loss over all elements as a Python float, rounded to 4 decimal places
    """
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
      'Each element is treated independently, and the formula switches at |x| = beta.',
      'Compute x = predictions - targets once, choose the branch per element, then average.',
      'torch.where(x.abs() < beta, 0.5 * x ** 2 / beta, x.abs() - 0.5 * beta)',
      'Keep the / beta in the quadratic branch (Smooth L1, not Huber), average over all elements and return round(loss.mean().item(), 4).',
    ],
  },

  'seg-metrics': {
    note: "Implement with tensor ops (sum, ==, mean). Return plain Python floats via .item(), with the keys 'iou', 'pixel_accuracy' and 'dice'.",
    starterCode: `import torch

def segmentation_metrics(prediction, target):
    """
    Binary segmentation metrics.

    Args:
        prediction: Tensor mask, shape (H, W), values 0 or 1
        target: Tensor mask, shape (H, W), values 0 or 1

    Returns:
        dict with Python floats rounded to 4 decimals:
            'iou': foreground IoU (0.0 if both masks are empty)
            'pixel_accuracy': fraction of matching pixels
            'dice': Dice coefficient (0.0 if both masks are empty)
    """
    # Your code here
    pass
`,
    solution: `import torch

def segmentation_metrics(prediction, target):
    """
    Binary segmentation metrics.

    Args:
        prediction: Tensor mask, shape (H, W), values 0 or 1
        target: Tensor mask, shape (H, W), values 0 or 1

    Returns:
        dict with Python floats rounded to 4 decimals:
            'iou': foreground IoU (0.0 if both masks are empty)
            'pixel_accuracy': fraction of matching pixels
            'dice': Dice coefficient (0.0 if both masks are empty)
    """
    pred = prediction.float()
    targ = target.float()

    intersection = (pred * targ).sum()     # pixels that are 1 in both
    total = pred.sum() + targ.sum()        # |P| + |T|
    union = total - intersection

    iou_val = (intersection / union).item() if union.item() > 0 else 0.0
    dice = (2 * intersection / total).item() if total.item() > 0 else 0.0
    pixel_acc = (pred == targ).float().mean().item()

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
      {
        id: '6',
        description: 'Both masks empty: IoU and Dice 0.0, pixel accuracy 1.0',
        input: 'segmentation_metrics(torch.zeros(2, 3), torch.zeros(2, 3))',
        expected: '{"iou": 0.0, "pixel_accuracy": 1.0, "dice": 0.0}',
        hidden: true,
      },
    ],
    hints: [
      'All three metrics come from a few counts: the overlap, the size of each mask and the number of agreeing pixels.',
      'Compute intersection, |P| and |T| once, derive the union, then each metric; guard the zero denominators.',
      'Cast with .float(); intersection = (pred * targ).sum(); union = pred.sum() + targ.sum() - intersection; pixel accuracy = (pred == targ).float().mean().',
      'Convert with .item() before rounding so the dict holds Python floats, and handle the both-empty case (0 / 0).',
    ],
  },

  'resnet-block': {
    note: 'The helpers use F.conv2d and a hand-written training-mode BatchNorm; the point is the residual wiring. (nn.Conv2d without bias and nn.BatchNorm2d in train mode would compute the same thing.) Layout is NCHW.',
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

# Cost is dominated by the two 3x3 convs: about 9 * C_out * (C_in + C_out) * H_out * W_out MACs per image.
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
      {
        id: '7',
        description: 'Output is non-negative and not just ReLU(x)',
        input: '(lambda x: (lambda out: bool(out.min().item() >= 0 and bool((out == 0).any()) and not bool(torch.allclose(out, torch.relu(x)))))(residual_block(x, init_block_params(4, 4, 1), 1)))(torch.randn(2, 4, 5, 5))',
        expected: 'True',
        hidden: false,
      },
    ],
    hints: [
      'Two branches meet at an addition: the main path learns F(x), the shortcut carries x (resized when the shape changes).',
      'Main path: F.relu(batch_norm2d(conv2d(x, conv1_w, stride, 1), bn1_gamma, bn1_beta)), then batch_norm2d(conv2d(..., conv2_w, 1, 1), bn2_gamma, bn2_beta).',
      'Projection when stride != 1 or C_in != C_out: batch_norm2d(conv2d(x, proj_w, stride=stride), proj_gamma, proj_beta). Finish with F.relu(main + shortcut).',
      'Common bugs: a ReLU after BN2 (before the addition), skipping the projection BatchNorm, or padding the 1x1 projection.',
    ],
  },
};
