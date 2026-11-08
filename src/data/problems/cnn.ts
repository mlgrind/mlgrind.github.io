import { Problem } from '../../types';

export const cnnProblems: Problem[] = [
  {
    id: 'conv2d-forward',
    title: '2D Convolution',
    section: 'cnn',
    difficulty: 'hard',
    description: `
## 2D Convolution

### What you'll build
The forward pass of a single-channel 2D convolution with **no padding** and **stride 1**: slide a small kernel over an image and take a weighted sum at every position.

### Background
This is the core operation of every CNN. A conv layer applies the same small kernel at every position, so it detects a pattern (an edge, a corner) wherever it appears. Deep learning frameworks actually compute **cross-correlation**: the kernel is **not flipped**. That is what \`nn.Conv2d\` / \`F.conv2d\` do, and what is asked here.

### Formula
For every output position \`(i, j)\`:
\`\`\`text
out[i, j] = sum over a in [0, kH), b in [0, kW) of  image[i + a, j + b] * kernel[a, b]
          = sum(image[i:i+kH, j:j+kW] * kernel)

H_out = H - kH + 1
W_out = W - kW + 1
\`\`\`

### Inputs
- \`image\`: 2D array of shape \`(H, W)\` (one channel, no batch axis; a nested list is also fine, convert with \`np.asarray\`). Values can be ints or floats.
- \`kernel\`: 2D array of shape \`(kH, kW)\` with \`kH <= H\` and \`kW <= W\`. Kernels can be non-square.

### Expected return format
A NumPy float array of shape \`(H - kH + 1, W - kW + 1)\`. Keep the exact values: don't round or cast to int.

### Edge cases and conventions
- No padding: the output is smaller than the input ("valid" convolution).
- Don't flip the kernel. For an asymmetric kernel, flipping changes the answer.
- A kernel the same size as the image gives a \`1 x 1\` output.

### Constraints
NumPy only; don't call \`scipy.signal.correlate2d\` or similar. Two nested loops over output positions are fine; looping over the \`kH * kW\` kernel taps instead is faster.

### Follow-up
- How would you add padding and stride? (See **Advanced 2D Convolution**.)
- How does **im2col** turn this into a single matrix multiply, and what does it cost in memory?
`,
    examples: [
      {
        input: 'image = [[1, 2, 3], [4, 5, 6], [7, 8, 9]], kernel = [[0, 0, 0], [0, 1, 0], [0, 0, 0]]',
        output: '[[5.]]',
        explanation: 'A 3x3 kernel on a 3x3 image gives one output; this "identity" kernel picks the centre pixel.',
      },
      {
        input: 'image = [[0.5, 1.5, -1.0], [2.0, 0.25, 1.0], [-0.5, 3.0, 2.0]], kernel = [[1.0, -0.5], [0.5, 2.0]]',
        output: '[[1.25, 4.125], [7.625, 5.25]]',
        explanation: 'out[0, 0] = 0.5*1 + 1.5*(-0.5) + 2.0*0.5 + 0.25*2 = 1.25; values stay floats.',
      },
    ],
    starterCode: `import numpy as np

def conv2d(image, kernel):
    """
    Apply a 2D convolution (cross-correlation, no padding, stride 1).

    Args:
        image: Input image, shape (H, W)
        kernel: Convolution kernel, shape (kH, kW)

    Returns:
        output: Float array of shape (H - kH + 1, W - kW + 1)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Identity kernel',
        input: '([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[0, 0, 0], [0, 1, 0], [0, 0, 0]])',
        expected: '[[5]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Edge detection',
        input: '([[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]], [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]])',
        expected: '[[5, 5], [5, 5]]',
        hidden: false,
      },
      {
        id: '3',
        description: '5x5 image with an asymmetric 2x2 kernel (no flipping)',
        input: '([[1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 17, 18, 19, 20], [21, 22, 23, 24, 25]], [[1, 0], [0, -1]])',
        expected: '[[-6, -6, -6, -6], [-6, -6, -6, -6], [-6, -6, -6, -6], [-6, -6, -6, -6]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'All-ones 2x2 kernel sums regions',
        input: '([[1, 0, 1], [0, 1, 0], [1, 0, 1]], [[1, 1], [1, 1]])',
        expected: '[[2, 2], [2, 2]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Float values are kept (no int cast)',
        input: '([[0.5, 1.5, -1.0], [2.0, 0.25, 1.0], [-0.5, 3.0, 2.0]], [[1.0, -0.5], [0.5, 2.0]])',
        expected: '[[1.25, 4.125], [7.625, 5.25]]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Non-square kernel output shape',
        input: 'np.shape(conv2d(np.random.randn(6, 5), np.random.randn(2, 3)))',
        expected: '(5, 3)',
        hidden: true,
      },
    ],
    hints: [
      'Every output pixel is a dot product between the kernel and the image patch under it. How many positions can the kernel occupy along each axis without falling off the image?',
      'Allocate an output of shape (H - kH + 1, W - kW + 1) and fill it position by position, or accumulate one kernel tap at a time.',
      'Loop version: out[i, j] = np.sum(image[i:i+kH, j:j+kW] * kernel). Tap version: out += kernel[a, b] * image[a:a+H_out, b:b+W_out] for every (a, b).',
      "Don't flip the kernel (that would be mathematical convolution), and don't cast the result to int: float inputs must give float outputs.",
    ],
    solution: `import numpy as np

def conv2d(image, kernel):
    """
    Apply a 2D convolution (cross-correlation, no padding, stride 1).

    Args:
        image: Input image, shape (H, W)
        kernel: Convolution kernel, shape (kH, kW)

    Returns:
        output: Float array of shape (H - kH + 1, W - kW + 1)
    """
    image = np.asarray(image, dtype=float)
    kernel = np.asarray(kernel, dtype=float)
    H, W = image.shape
    kH, kW = kernel.shape
    H_out, W_out = H - kH + 1, W - kW + 1

    # Loop over the kH*kW kernel taps instead of the H_out*W_out positions:
    # tap (a, b) multiplies image[i + a, j + b] for every output (i, j) at once.
    output = np.zeros((H_out, W_out))
    for a in range(kH):
        for b in range(kW):
            output += kernel[a, b] * image[a:a + H_out, b:b + W_out]
    return output

# Time O(H_out * W_out * kH * kW), extra space O(H_out * W_out).
`,
  },
  {
    id: 'max-pool',
    title: 'Max Pooling',
    section: 'cnn',
    difficulty: 'medium',
    description: `
## Max Pooling

### What you'll build
Non-overlapping 2D max pooling on a single-channel \`(H, W)\` feature map: split it into \`pool_size x pool_size\` windows (stride = window size) and keep the maximum of each.

### Background
Pooling shrinks feature maps, which cuts compute in later layers, grows the receptive field, and makes the network a little tolerant to small shifts (a feature that moves by one pixel inside a window gives the same max). Classic CNNs (LeNet, VGG, the ResNet stem) use 2x2 or 3x3 max pooling; many modern networks use strided convolutions instead.

### Formula
With \`p = pool_size\` (window size and stride):
\`\`\`text
out[i, j] = max(image[i*p:(i+1)*p, j*p:(j+1)*p])

H_out = H // p
W_out = W // p
\`\`\`

### Inputs
- \`image\`: 2D array of shape \`(H, W)\` (ints or floats; a nested list is fine).
- \`pool_size\`: positive int \`p\`, default \`2\`.

### Expected return format
A NumPy array of shape \`(H // p, W // p)\` holding the window maxima (same dtype as the input; float inputs stay floats).

### Edge cases and conventions
- If \`H\` or \`W\` is not a multiple of \`p\`, the leftover rows/columns at the bottom/right are **dropped** (floor), like \`F.max_pool2d\` with no padding and \`ceil_mode=False\`.
- Negative values: the max of \`[-1, -2]\` is \`-1\`; don't initialise the output with zeros and compare.

### Constraints
NumPy only. A double loop over windows is fine; the reshape trick is fully vectorised.

### Follow-up
- In the backward pass, which input receives the gradient of each output?
- How do average pooling and global average pooling differ, and why did global average pooling replace big fully connected heads?
`,
    examples: [
      {
        input: '[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]',
        output: '[[6, 8], [14, 16]]',
        explanation: 'The four 2x2 windows have maxima 6, 8, 14 and 16.',
      },
      {
        input: 'image = np.arange(30).reshape(5, 6) * 0.5, pool_size = 3',
        output: '[[7.0, 8.5]]',
        explanation: '5 // 3 = 1 row and 6 // 3 = 2 columns of windows; the last two rows are dropped.',
      },
    ],
    starterCode: `import numpy as np

def max_pool2d(image, pool_size=2):
    """
    Apply 2D max pooling with window = stride = pool_size.

    Args:
        image: Input feature map, shape (H, W)
        pool_size: Window size and stride p (default 2)

    Returns:
        output: Array of shape (H // p, W // p); leftover rows/columns are dropped
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: '4x4 to 2x2',
        input: '[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]',
        expected: '[[6, 8], [14, 16]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'With negative values',
        input: '[[-1, -2, -3, -4], [-5, -6, -7, -8], [-9, -10, -11, -12], [-13, -14, -15, -16]]',
        expected: '[[-1, -3], [-9, -11]]',
        hidden: true,
      },
      {
        id: '3',
        description: '6x6 input to 3x3',
        input: 'max_pool2d(np.arange(1, 37).reshape(6, 6))',
        expected: '[[8, 10, 12], [20, 22, 24], [32, 34, 36]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Minimal 2x2 input',
        input: '[[3, 1], [2, 4]]',
        expected: '[[4]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'pool_size=3 on a 5x6 float map (crop, keep floats)',
        input: 'max_pool2d(np.arange(30).reshape(5, 6) * 0.5, 3)',
        expected: '[[7.0, 8.5]]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Maximum is not always in the same corner',
        input: '[[1, 3, 2, 0], [4, 2, 1, 5], [0, 1, 7, 2], [3, 2, 4, 6]]',
        expected: '[[4, 5], [3, 7]]',
        hidden: false,
      },
    ],
    hints: [
      'Each output value only depends on its own p x p window, and the windows do not overlap. How many full windows fit along each axis?',
      'Crop the image to (H // p * p, W // p * p) first, then take the max of each window, either in a double loop or all at once.',
      'Loop: out[i, j] = image[i*p:(i+1)*p, j*p:(j+1)*p].max(). Vectorised: x.reshape(H_out, p, W_out, p).max(axis=(1, 3)).',
      "Don't initialise with zeros and compare (all-negative maps break), and don't cast to int (float maps lose their fractions).",
    ],
    solution: `import numpy as np

def max_pool2d(image, pool_size=2):
    """
    Apply 2D max pooling with window = stride = pool_size.

    Args:
        image: Input feature map, shape (H, W)
        pool_size: Window size and stride p (default 2)

    Returns:
        output: Array of shape (H // p, W // p); leftover rows/columns are dropped
    """
    image = np.asarray(image)
    p = pool_size
    H_out, W_out = image.shape[0] // p, image.shape[1] // p

    # Crop to whole windows, then split each axis into (window index, offset):
    # x[i, a, j, b] = image[i*p + a, j*p + b]. The max over (a, b) is the pooled value.
    x = image[:H_out * p, :W_out * p].reshape(H_out, p, W_out, p)
    return x.max(axis=(1, 3))

# Time O(H * W), extra space O(H_out * W_out) (the reshape is a view).
`,
  },
  {
    id: 'flatten-layer',
    title: 'Flatten Layer',
    section: 'cnn',
    difficulty: 'easy',
    description: `
## Flatten Layer

### What you'll build
The layer that turns a batch of feature maps into a batch of vectors so it can feed a fully connected (linear) layer.

### Background
A CNN ends with feature maps of shape \`(batch, height, width, channels)\`, but a linear classifier expects \`(batch, features)\`. Flattening keeps the batch axis and concatenates everything else. It has no parameters; it only changes the view of the data.

### Layout used here: NHWC
The input is **\`(N, H, W, C)\` = \`(batch, height, width, channels)\`**, the channels-last layout of TensorFlow/Keras. PyTorch's \`nn.Flatten\` usually sees NCHW \`(N, C, H, W)\` instead. Both flatten in row-major (C) order, so the element order of the output differs between layouts: weights trained on one layout don't transfer to the other without a permute.

### Formula
\`\`\`text
out[n, (h * W + w) * C + c] = X[n, h, w, c]        out shape: (N, H * W * C)
\`\`\`
That is exactly NumPy's default row-major reshape.

### Inputs
- \`X\`: NumPy array of shape \`(N, H, W, C)\`, any dtype. It may be non-contiguous (for example a transposed view).

### Expected return format
A NumPy array of shape \`(N, H * W * C)\` with the same values in row-major order and the same dtype.

### Edge cases and conventions
- \`N = 1\` must still return a 2D array \`(1, H*W*C)\`, not a 1D vector. Never flatten the batch axis.
- Use \`-1\` to let NumPy infer the feature size.

### Constraints
NumPy only, no loops needed.

### Follow-up
- Why do modern CNNs replace flatten + a huge linear layer with global average pooling?
- In PyTorch, why can \`x.view(N, -1)\` fail on a permuted tensor while \`x.reshape(N, -1)\` works?
`,
    examples: [
      {
        input: 'X.shape = (2, 4, 4, 3)',
        output: 'shape (2, 48)',
        explanation: '4 * 4 * 3 = 48 features per sample; the batch axis is kept.',
      },
      {
        input: 'X = np.arange(12).reshape(2, 3, 2, 1)',
        output: '[[0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11]]',
        explanation: 'Row-major order: each sample becomes one row of 3 * 2 * 1 = 6 values.',
      },
    ],
    starterCode: `import numpy as np

def flatten(X):
    """
    Flatten NHWC feature maps to vectors.

    Args:
        X: Input array, shape (batch, height, width, channels)

    Returns:
        output: Array of shape (batch, height * width * channels), row-major order
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Correct output shape',
        input: 'flatten(np.random.randn(2, 4, 4, 3)).shape',
        expected: '(2, 48)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Values preserved',
        input: 'bool(np.allclose(flatten(np.arange(24).reshape(1, 2, 3, 4)), np.arange(24).reshape(1, 24)))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '3',
        description: 'Single sample shape',
        input: 'flatten(np.random.randn(1, 3, 3, 2)).shape',
        expected: '(1, 18)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Batch of 4 shape',
        input: 'flatten(np.random.randn(4, 2, 2, 8)).shape',
        expected: '(4, 32)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Row-major order is kept',
        input: 'flatten(np.arange(12).reshape(2, 3, 2, 1)).tolist()',
        expected: '[[0, 1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11]]',
        hidden: false,
      },
      {
        id: '6',
        description: 'Non-contiguous input (NCHW transposed to NHWC)',
        input: 'flatten(np.arange(24).reshape(2, 3, 2, 2).transpose(0, 2, 3, 1)).tolist()',
        expected: '[[0, 4, 8, 1, 5, 9, 2, 6, 10, 3, 7, 11], [12, 16, 20, 13, 17, 21, 14, 18, 22, 15, 19, 23]]',
        hidden: true,
      },
    ],
    hints: [
      'Only the batch axis survives; every other axis is merged into one feature axis.',
      'Read the batch size from X.shape[0] and reshape to (batch_size, number_of_features).',
      'X.reshape(X.shape[0], -1): the -1 tells NumPy to infer H * W * C.',
      "Don't use X.flatten() or X.ravel() alone: they also merge the batch axis and return a 1D array.",
    ],
    solution: `import numpy as np

def flatten(X):
    """
    Flatten NHWC feature maps to vectors.

    Args:
        X: Input array, shape (batch, height, width, channels)

    Returns:
        output: Array of shape (batch, height * width * channels), row-major order
    """
    # Keep the batch axis, merge (H, W, C) in row-major order; -1 infers H * W * C.
    # reshape copies when X is non-contiguous, so transposed views work too.
    return X.reshape(X.shape[0], -1)

# O(1) for a contiguous input (a view); O(N * H * W * C) when a copy is needed.
`,
  },
  {
    id: 'conv-output-size',
    title: 'Convolution Output Size',
    section: 'cnn',
    difficulty: 'easy',
    description: `
## Convolution Output Size

### What you'll build
A function that returns the spatial output size (height or width) of a convolution or pooling layer.

### Background
Designing a CNN means tracking shapes through every layer: the linear layer after the last conv needs to know how many features arrive. Interviewers ask this constantly ("a 224x224 image goes through a 7x7 stride-2 conv with padding 3: what comes out?").

### Formula
\`\`\`text
output_size = floor((input_size + 2 * padding - kernel_size) / stride) + 1
\`\`\`
- \`input_size\`: height or width of the input, \`H\`
- \`kernel_size\`: kernel height or width, \`k\`
- \`padding\`: zeros added on **each** side, \`p\` (hence \`2p\`)
- \`stride\`: step between kernel positions, \`s\`

The \`+ 1\` counts the first kernel position; \`floor\` drops a last position that would hang off the edge. The same formula gives the output size of pooling layers.

### Inputs
Four non-negative Python ints with \`stride >= 1\` and \`kernel_size <= input_size + 2 * padding\`.

### Expected return format
A Python \`int\`.

### Edge cases and conventions
- Use integer floor division \`//\`, never \`/\` (that returns a float such as \`15.5\`).
- \`padding = (k - 1) // 2\` with \`stride = 1\` and odd \`k\` keeps the size ("same" convolution).
- A 1x1 convolution with stride 1 and no padding keeps the size.

### Constraints
Plain Python arithmetic.

### Follow-up
- With dilation \`d\`, the effective kernel size is \`d * (k - 1) + 1\`. Extend the formula.
- What is the output size of a transposed convolution with stride \`s\`?
`,
    examples: [
      {
        input: 'input_size=32, kernel_size=3, padding=1, stride=1',
        output: '32',
        explanation: '(32 + 2 - 3) // 1 + 1 = 32: "same" padding keeps the size.',
      },
      {
        input: 'input_size=32, kernel_size=3, padding=0, stride=2',
        output: '15',
        explanation: '(32 - 3) // 2 + 1 = 14 + 1 = 15: floor drops the half step.',
      },
      {
        input: 'input_size=224, kernel_size=7, padding=3, stride=2',
        output: '112',
        explanation: 'The ResNet stem: (224 + 6 - 7) // 2 + 1 = 112.',
      },
    ],
    starterCode: `def conv_output_size(input_size, kernel_size, padding=0, stride=1):
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
    testCases: [
      {
        id: '1',
        description: 'Same padding',
        input: '(32, 3, 1, 1)',
        expected: '32',
        hidden: false,
      },
      {
        id: '2',
        description: 'No padding, stride 2',
        input: '(32, 3, 0, 2)',
        expected: '15',
        hidden: false,
      },
      {
        id: '3',
        description: 'Large kernel',
        input: '(224, 7, 3, 2)',
        expected: '112',
        hidden: true,
      },
      {
        id: '4',
        description: '1x1 convolution preserves size',
        input: '(56, 1, 0, 1)',
        expected: '56',
        hidden: true,
      },
      {
        id: '5',
        description: 'Floor matters with padding and stride 3',
        input: '(10, 3, 1, 3)',
        expected: '4',
        hidden: true,
      },
      {
        id: '6',
        description: 'Returns an int, not a float',
        input: 'type(conv_output_size(32, 3, 0, 2)).__name__',
        expected: 'int',
        hidden: true,
      },
    ],
    hints: [
      'Count how many positions the kernel can occupy: it starts at the left edge of the padded input and moves by stride each time.',
      'The padded input has size input_size + 2 * padding. The last valid start index is that size minus kernel_size.',
      'output = (input_size + 2 * padding - kernel_size) // stride + 1',
      'Use // (floor division) so the result is an int; / gives a float and is wrong when the stride does not divide evenly.',
    ],
    solution: `def conv_output_size(input_size, kernel_size, padding=0, stride=1):
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
  },
  {
    id: 'conv2d-advanced',
    title: 'Advanced 2D Convolution',
    section: 'cnn',
    difficulty: 'hard',
    description: `
## Advanced 2D Convolution

### What you'll build
A batched, multi-channel 2D convolution with **padding**, **stride** and **groups**: the computation behind \`F.conv2d(input, weight, padding=..., stride=..., groups=...)\` (no bias).

### Background
Real conv layers mix many input channels into many output channels, downsample with a stride, and pad to control the output size. **Grouped convolution** splits the channels into independent groups: AlexNet used 2 groups to fit on two GPUs, ResNeXt uses 32, and with one group per channel you get the **depthwise convolution** of MobileNet and ConvNeXt, which costs \`1/C_in\` of a full conv.

### Layout (NCHW, as in PyTorch)
| Tensor | Shape |
|---|---|
| \`input\` | \`(N, C_in, H, W)\` = (batch, channels, height, width) |
| \`kernel\` | \`(C_out, C_in // groups, kH, kW)\` |
| returned output | \`(N, C_out, H_out, W_out)\` |

### Formula
With padding \`p\`, stride \`s\` and \`G = groups\`, let \`C_g = C_in // G\` and \`O_g = C_out // G\`. Output channel \`o\` belongs to group \`g = o // O_g\` and only sees input channels \`g*C_g ... (g+1)*C_g - 1\`:
\`\`\`text
x_pad = input zero-padded by p on each side of H and W
out[n, o, i, j] = sum over c in [0, C_g), a in [0, kH), b in [0, kW) of
                  x_pad[n, g*C_g + c, i*s + a, j*s + b] * kernel[o, c, a, b]

H_out = (H + 2p - kH) // s + 1
W_out = (W + 2p - kW) // s + 1
\`\`\`
This is cross-correlation (the kernel is not flipped), like every deep learning framework.

### Inputs
- \`input\`: float array \`(N, C_in, H, W)\`.
- \`kernel\`: float array \`(C_out, C_in // groups, kH, kW)\`; kernels may be non-square.
- \`padding\` (int, default 0), \`stride\` (int >= 1, default 1), \`groups\` (int >= 1, default 1). \`C_in\` and \`C_out\` are both divisible by \`groups\`.

### Expected return format
A float NumPy array of shape \`(N, C_out, H_out, W_out)\`.

### Special cases
- \`groups = 1\`: standard convolution (every output channel sees every input channel).
- \`groups = C_in = C_out\`: depthwise convolution (one kernel per channel).

### Constraints
NumPy only (\`np.pad\` and \`np.einsum\` are fine); no SciPy or deep learning libraries. Loops over the \`kH * kW\` kernel taps (and over groups) are fine; avoid looping over every output pixel if you can.

### Follow-up
- How many parameters and multiply-adds does this layer have? How does a depthwise separable conv (depthwise 3x3 + pointwise 1x1) compare with a full 3x3?
- How would you implement it with im2col and one batched matmul?
`,
    examples: [
      {
        input: 'input (1, 4, 5, 5), kernel (8, 2, 3, 3), padding=0, stride=1, groups=2',
        output: 'output shape (1, 8, 3, 3)',
        explanation: 'Input channels 0-1 feed output channels 0-3; input channels 2-3 feed output channels 4-7. (5 - 3) // 1 + 1 = 3.',
      },
      {
        input: 'input = np.ones((1, 1, 3, 3)), kernel = np.ones((1, 1, 2, 2)), padding=1, stride=2',
        output: '[[[[1., 2.], [2., 4.]]]]',
        explanation: 'The padded input is 5x5 with a ring of zeros; windows at (0, 0), (0, 2), (2, 0), (2, 2) cover 1, 2, 2 and 4 ones. (3 + 2 - 2) // 2 + 1 = 2.',
      },
    ],
    starterCode: `import numpy as np

def conv2d_advanced(input, kernel, padding=0, stride=1, groups=1):
    """
    2D convolution (cross-correlation) with padding, stride and groups, NCHW layout.

    Args:
        input: Input array, shape (N, C_in, H, W)
        kernel: Kernels, shape (C_out, C_in // groups, kH, kW)
        padding: Zeros added to each side of H and W (default 0)
        stride: Step between kernel positions (default 1)
        groups: Number of channel groups (default 1)

    Returns:
        output: Float array, shape (N, C_out, H_out, W_out) with
                H_out = (H + 2*padding - kH) // stride + 1 (same for W)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Basic convolution with padding and stride',
        input: 'conv2d_advanced(np.ones((1, 1, 5, 5)), np.ones((1, 1, 3, 3)), 1, 2, 1).shape',
        expected: '(1, 1, 3, 3)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Grouped convolution (groups=2)',
        input: 'conv2d_advanced(np.arange(32).reshape(1, 2, 4, 4).astype(float), np.ones((4, 1, 2, 2)), 0, 1, 2).shape',
        expected: '(1, 4, 3, 3)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Depthwise convolution (groups=in_channels)',
        input: 'conv2d_advanced(np.ones((2, 3, 4, 4)), np.ones((3, 1, 2, 2)), 0, 1, 3).shape',
        expected: '(2, 3, 3, 3)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Verify correct output values with groups',
        input: 'bool(np.allclose(conv2d_advanced(np.ones((1, 2, 3, 3)), np.ones((2, 1, 2, 2)), 0, 1, 2), np.array([[[[4., 4.], [4., 4.]], [[4., 4.], [4., 4.]]]])) )',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Padding and stride values (hand-computed)',
        input: 'np.asarray(conv2d_advanced(np.ones((1, 1, 3, 3)), np.ones((1, 1, 2, 2)), 1, 2, 1)).tolist()',
        expected: '[[[[1.0, 2.0], [2.0, 4.0]]]]',
        hidden: false,
      },
      {
        id: '6',
        description: 'Each group only sees its own channels (kernel 1 = ones, kernel 2 = twos)',
        input: 'np.asarray(conv2d_advanced(np.arange(32.0).reshape(1, 2, 4, 4), np.stack([np.ones((1, 2, 2)), 2 * np.ones((1, 2, 2))]), 0, 2, 2)).tolist()',
        expected: '[[[[10.0, 18.0], [42.0, 50.0]], [[148.0, 164.0], [212.0, 228.0]]]]',
        hidden: true,
      },
      {
        id: '7',
        description: 'Random input, padding=1, stride=2, groups=2, non-square kernel',
        input: '(lambda out: (np.shape(out), round(float(np.sum(out)), 4), np.round(out[1, 3], 4).tolist()))(conv2d_advanced(np.random.randn(2, 4, 7, 6), np.random.randn(6, 2, 3, 2), 1, 2, 2))',
        expected: '((2, 6, 4, 4), 108.8295, [[3.8396, -2.9263, -0.0052, 0.3085], [-1.7026, 0.3728, 1.6255, -1.3786], [1.399, -2.7098, -0.3674, -0.0548], [-0.216, 3.2202, 1.7804, -0.2579]])',
        hidden: true,
      },
    ],
    hints: [
      'Solve it in three layers: pad, compute the output size from the padded input, then handle each group as an ordinary multi-channel convolution.',
      'Group g uses input channels [g*C_g, (g+1)*C_g) and kernels [g*O_g, (g+1)*O_g). Reshaping input to (N, G, C_g, H, W) and kernel to (G, O_g, C_g, kH, kW) handles all groups at once.',
      `np.pad(x, ((0, 0), (0, 0), (p, p), (p, p))) pads only H and W. For kernel tap (a, b), the strided patch x[..., a:a + s*(H_out-1) + 1:s, b:b + s*(W_out-1) + 1:s] lines up with every output position; contract the channels with np.einsum('ngchw,goc->ngohw', patch, w[..., a, b]).`,
      'Common bugs: padding the batch or channel axes, computing H_out from the unpadded size, and letting a group see all input channels. Check against the groups test: kernel 2 must only ever multiply channel 1.',
    ],
    solution: `import numpy as np

def conv2d_advanced(input, kernel, padding=0, stride=1, groups=1):
    """
    2D convolution (cross-correlation) with padding, stride and groups, NCHW layout.

    Args:
        input: Input array, shape (N, C_in, H, W)
        kernel: Kernels, shape (C_out, C_in // groups, kH, kW)
        padding: Zeros added to each side of H and W (default 0)
        stride: Step between kernel positions (default 1)
        groups: Number of channel groups (default 1)

    Returns:
        output: Float array, shape (N, C_out, H_out, W_out) with
                H_out = (H + 2*padding - kH) // stride + 1 (same for W)
    """
    x = np.asarray(input, dtype=float)
    w = np.asarray(kernel, dtype=float)
    N, C_in, H, W = x.shape
    C_out, C_g, kH, kW = w.shape
    G, s = groups, stride
    O_g = C_out // G

    # Zero-pad H and W only
    x = np.pad(x, ((0, 0), (0, 0), (padding, padding), (padding, padding)))
    H_out = (H + 2 * padding - kH) // s + 1
    W_out = (W + 2 * padding - kW) // s + 1

    # Split channels into groups: x (N, G, C_g, H_p, W_p), w (G, O_g, C_g, kH, kW)
    x = x.reshape(N, G, C_g, x.shape[2], x.shape[3])
    w = w.reshape(G, O_g, C_g, kH, kW)

    out = np.zeros((N, G, O_g, H_out, W_out))
    for a in range(kH):
        for b in range(kW):
            # Input pixels that kernel tap (a, b) touches, for every output position
            patch = x[:, :, :, a:a + s * (H_out - 1) + 1:s, b:b + s * (W_out - 1) + 1:s]
            # Contract over the group's input channels c
            out += np.einsum('ngchw,goc->ngohw', patch, w[:, :, :, a, b])

    return out.reshape(N, C_out, H_out, W_out)

# Time O(N * C_out * C_g * kH * kW * H_out * W_out); extra space O(N * C_out * H_out * W_out).
`,
  },
  {
    id: 'iou-bounding-box',
    title: 'IoU (Intersection over Union)',
    section: 'cnn',
    difficulty: 'easy',
    description: `
## IoU (Intersection over Union)

### What you'll build
The Intersection over Union of two axis-aligned bounding boxes.

### Background
IoU is the basic overlap measure of object detection. It decides whether a prediction counts as a true positive (IoU >= 0.5 for PASCAL VOC, 0.5 to 0.95 for COCO mAP), which anchors are matched to ground truth during training, and which boxes NMS suppresses. It is scale invariant: two boxes overlapping by the same fraction score the same whatever their size.

### Box format: \`xyxy\`
Each box is **\`[x1, y1, x2, y2]\`**: \`(x1, y1)\` is the top-left corner and \`(x2, y2)\` the bottom-right corner, with \`x2 >= x1\` and \`y2 >= y1\` (image coordinates, \`y\` grows downward). Coordinates are continuous, so a box's area is \`(x2 - x1) * (y2 - y1)\`. Other formats exist: COCO stores \`xywh\` = \`[x, y, width, height]\` and YOLO stores \`cxcywh\` = \`[center_x, center_y, width, height]\`. Convert them to \`xyxy\` first.

### Formula
\`\`\`text
ix1 = max(a_x1, b_x1)     iy1 = max(a_y1, b_y1)      # intersection top-left
ix2 = min(a_x2, b_x2)     iy2 = min(a_y2, b_y2)      # intersection bottom-right
intersection = max(0, ix2 - ix1) * max(0, iy2 - iy1)
union        = area_a + area_b - intersection
IoU          = intersection / union                   # in [0, 1]
\`\`\`

### Inputs
- \`box_a\`, \`box_b\`: length-4 arrays or lists \`[x1, y1, x2, y2]\` of ints or floats.

### Expected return format
A Python \`float\` rounded to 4 decimal places.

### Edge cases and conventions
- Disjoint boxes, or boxes that only touch along an edge, have IoU \`0.0\`. Clamp the intersection width and height at 0 separately; a negative width times a negative height would otherwise look like a positive overlap.
- If the union is 0 (two zero-area boxes), return \`0.0\`.
- No \`+1\` pixel convention: areas use \`x2 - x1\`, not \`x2 - x1 + 1\`.

### Constraints
Plain Python or NumPy.

### Follow-up
- Vectorise it: compute an \`(N, M)\` IoU matrix between two sets of boxes with broadcasting.
- What do GIoU, DIoU and CIoU add, and why are they better regression losses than \`1 - IoU\`?
`,
    examples: [
      {
        input: 'box_a = [0, 0, 2, 2], box_b = [1, 1, 3, 3]',
        output: '0.1429',
        explanation: 'Intersection is the 1x1 square [1, 1, 2, 2]; union = 4 + 4 - 1 = 7; IoU = 1/7.',
      },
      {
        input: 'box_a = [0, 0, 4, 4], box_b = [2, 0, 6, 4]',
        output: '0.3333',
        explanation: 'Intersection is 2 x 4 = 8; union = 16 + 16 - 8 = 24.',
      },
      {
        input: 'box_a = [0, 0, 1, 1], box_b = [2, 2, 3, 3]',
        output: '0.0',
        explanation: 'No overlap: the clamped intersection width and height are 0.',
      },
    ],
    starterCode: `import numpy as np

def iou(box_a, box_b):
    """
    Intersection over Union of two boxes in xyxy format.

    Args:
        box_a: [x1, y1, x2, y2], top-left (x1, y1) and bottom-right (x2, y2)
        box_b: [x1, y1, x2, y2]

    Returns:
        IoU as a Python float in [0, 1], rounded to 4 decimal places
        (0.0 when the union is 0)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Partial overlap',
        input: '([0, 0, 2, 2], [1, 1, 3, 3])',
        expected: '0.1429',
        hidden: false,
      },
      {
        id: '2',
        description: 'No overlap',
        input: '([0, 0, 1, 1], [2, 2, 3, 3])',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '3',
        description: 'One box inside the other',
        input: '([0, 0, 4, 4], [1, 1, 3, 3])',
        expected: '0.25',
        hidden: true,
      },
      {
        id: '4',
        description: 'Identical boxes (perfect overlap)',
        input: '([0, 0, 5, 5], [0, 0, 5, 5])',
        expected: '1.0',
        hidden: true,
      },
      {
        id: '5',
        description: 'Non-square boxes overlapping on one side',
        input: '([1, 1, 5, 4], [2, 0, 6, 3])',
        expected: '0.3333',
        hidden: true,
      },
      {
        id: '6',
        description: 'Boxes that only touch along an edge',
        input: '([0, 0, 2, 2], [2, 0, 4, 2])',
        expected: '0.0',
        hidden: true,
      },
      {
        id: '7',
        description: 'Disjoint in x but overlapping in y (clamp each side)',
        input: '([0, 0, 1, 3], [2, 1, 4, 2])',
        expected: '0.0',
        hidden: true,
      },
    ],
    hints: [
      'The intersection of two axis-aligned rectangles is itself a rectangle (possibly empty). Which corners define it?',
      'Compute the intersection rectangle, then the two box areas, then union = area_a + area_b - intersection.',
      'Intersection corners: max of the top-left coordinates and min of the bottom-right coordinates. Width = max(0, ix2 - ix1), height = max(0, iy2 - iy1).',
      'Clamp width and height separately before multiplying, guard union == 0, and return round(float(iou), 4).',
    ],
    solution: `import numpy as np

def iou(box_a, box_b):
    """
    Intersection over Union of two boxes in xyxy format.

    Args:
        box_a: [x1, y1, x2, y2], top-left (x1, y1) and bottom-right (x2, y2)
        box_b: [x1, y1, x2, y2]

    Returns:
        IoU as a Python float in [0, 1], rounded to 4 decimal places
        (0.0 when the union is 0)
    """
    # Intersection rectangle: max of the top-left corners, min of the bottom-right corners
    ix1, iy1 = max(box_a[0], box_b[0]), max(box_a[1], box_b[1])
    ix2, iy2 = min(box_a[2], box_b[2]), min(box_a[3], box_b[3])

    # Clamp each side at 0, so disjoint boxes give an empty intersection
    intersection = max(0, ix2 - ix1) * max(0, iy2 - iy1)

    area_a = (box_a[2] - box_a[0]) * (box_a[3] - box_a[1])
    area_b = (box_b[2] - box_b[0]) * (box_b[3] - box_b[1])
    union = area_a + area_b - intersection

    if union == 0:
        return 0.0
    return round(float(intersection / union), 4)
`,
  },
  {
    id: 'nms',
    title: 'Non-Maximum Suppression (NMS)',
    section: 'cnn',
    difficulty: 'medium',
    description: `
## Non-Maximum Suppression (NMS)

### What you'll build
Greedy Non-Maximum Suppression: from a set of scored boxes, keep the best box for each object and drop the overlapping duplicates.

### Background
Detectors predict a box at every anchor or grid cell, so one object usually gets many near-identical boxes. NMS is the post-processing step (in Faster R-CNN, SSD, RetinaNet and YOLO up to v8) that keeps the highest-scoring box and removes boxes that overlap it too much.

### Algorithm
1. Sort the box indices by score, highest first.
2. Take the first remaining index \`i\` and append it to \`keep\`.
3. Remove every remaining box whose IoU with box \`i\` is **greater than** \`iou_threshold\`.
4. Repeat steps 2 and 3 until no boxes remain, then return \`keep\`.

IoU uses the \`xyxy\` convention of the **IoU** problem: \`intersection / (area_a + area_b - intersection)\`, with the intersection width and height clamped at 0.

### Inputs
- \`boxes\`: array or list of shape \`(N, 4)\`, each row \`[x1, y1, x2, y2]\` (top-left, bottom-right).
- \`scores\`: array or list of shape \`(N,)\`, one confidence per box.
- \`iou_threshold\`: float in \`[0, 1]\`, default \`0.5\`.

### Expected return format
A Python \`list\` of \`int\` indices into the original \`boxes\`, in the order they were kept (decreasing score).

### Edge cases and conventions
- A box with IoU **exactly equal** to the threshold is **kept**; only \`IoU > iou_threshold\` suppresses.
- Boxes are compared with the box just kept, not only with the overall top box.
- Empty input returns \`[]\`.
- Scores are distinct in the tests; with ties, a stable sort keeps the lower index first.
- This is class-agnostic NMS: all boxes compete with each other.

### Constraints
NumPy or plain Python; no \`torchvision.ops.nms\`. Vectorising the IoU of the kept box against all remaining boxes is a nice touch.

### Follow-up
- What is the worst-case time complexity, and how do you make NMS class-aware with one call (the coordinate-offset trick)?
- How does Soft-NMS differ (decay the scores instead of deleting boxes), and when does it help?
`,
    examples: [
      {
        input: 'boxes = [[0, 0, 4, 4], [1, 1, 4, 4], [6, 6, 8, 8]], scores = [0.9, 0.75, 0.8], iou_threshold = 0.5',
        output: '[0, 2]',
        explanation: 'Keep box 0 (0.9). Box 1 overlaps it with IoU 9/16 = 0.5625 > 0.5, so it is removed; box 2 does not overlap and is kept.',
      },
      {
        input: 'boxes = [[0, 0, 1, 1], [3, 3, 4, 4], [6, 6, 7, 7]], scores = [0.5, 0.9, 0.7]',
        output: '[1, 2, 0]',
        explanation: 'Nothing overlaps, so every box is kept, in decreasing score order.',
      },
    ],
    starterCode: `import numpy as np

def nms(boxes, scores, iou_threshold=0.5):
    """
    Greedy Non-Maximum Suppression (class-agnostic).

    Args:
        boxes: (N, 4) boxes in xyxy format [x1, y1, x2, y2]
        scores: (N,) confidence score per box
        iou_threshold: suppress boxes with IoU > iou_threshold (default 0.5)

    Returns:
        List of kept indices (ints), in decreasing score order
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Overlapping box suppressed',
        input: '([[0,0,4,4],[1,1,4,4],[6,6,8,8]], [0.9, 0.75, 0.8], 0.5)',
        expected: '[0, 2]',
        hidden: false,
      },
      {
        id: '2',
        description: 'No suppression (no overlaps)',
        input: '([[0,0,1,1],[3,3,4,4],[6,6,7,7]], [0.5, 0.9, 0.7], 0.5)',
        expected: '[1, 2, 0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Two overlapping pairs',
        input: '([[0,0,4,4],[1,1,4,4],[10,10,14,14],[11,11,14,14]], [0.9, 0.85, 0.8, 0.7], 0.5)',
        expected: '[0, 2]',
        hidden: true,
      },
      {
        id: '4',
        description: 'All identical boxes, only highest score kept',
        input: '([[0,0,4,4],[0,0,4,4],[0,0,4,4]], [0.6, 0.9, 0.7], 0.5)',
        expected: '[1]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Higher threshold keeps a box with IoU 0.5625',
        input: '([[0, 0, 4, 4], [1, 1, 4, 4], [2, 0, 6, 4]], [0.9, 0.8, 0.7], 0.6)',
        expected: '[0, 1, 2]',
        hidden: true,
      },
      {
        id: '6',
        description: 'IoU exactly at the threshold is kept (only IoU > threshold is suppressed)',
        input: '([[0, 0, 2, 2], [0, 0, 2, 1]], [0.9, 0.8], 0.5)',
        expected: '[0, 1]',
        hidden: true,
      },
      {
        id: '7',
        description: 'Suppression is checked against each kept box, not only the first',
        input: '([[0, 0, 4, 4], [3, 0, 7, 4], [4, 0, 8, 4]], [0.9, 0.8, 0.7], 0.5)',
        expected: '[0, 1]',
        hidden: true,
      },
      {
        id: '8',
        description: 'Empty input',
        input: 'nms(np.zeros((0, 4)), np.zeros(0), 0.5)',
        expected: '[]',
        hidden: true,
      },
    ],
    hints: [
      'Think greedily: the highest-scoring box is always kept. What should happen to the boxes that overlap it?',
      'Sort indices by descending score, then loop: pop the first index into keep, filter the rest by their IoU with it.',
      'order = list(np.argsort(-scores, kind="stable")) or sorted(range(n), key=lambda i: -scores[i]); then order = [j for j in order[1:] if iou(boxes[i], boxes[j]) <= iou_threshold].',
      'Use <= to keep boxes (IoU equal to the threshold survives), compare with the box you just kept, and return plain Python ints.',
    ],
    solution: `import numpy as np

def nms(boxes, scores, iou_threshold=0.5):
    """
    Greedy Non-Maximum Suppression (class-agnostic).

    Args:
        boxes: (N, 4) boxes in xyxy format [x1, y1, x2, y2]
        scores: (N,) confidence score per box
        iou_threshold: suppress boxes with IoU > iou_threshold (default 0.5)

    Returns:
        List of kept indices (ints), in decreasing score order
    """
    boxes = np.asarray(boxes, dtype=float).reshape(-1, 4)
    scores = np.asarray(scores, dtype=float)
    x1, y1, x2, y2 = boxes.T
    areas = (x2 - x1) * (y2 - y1)

    order = np.argsort(-scores, kind='stable')   # highest score first, ties by index
    keep = []
    while order.size > 0:
        i = order[0]
        keep.append(int(i))
        rest = order[1:]

        # IoU of the kept box with every remaining box, vectorised
        w = np.maximum(0, np.minimum(x2[i], x2[rest]) - np.maximum(x1[i], x1[rest]))
        h = np.maximum(0, np.minimum(y2[i], y2[rest]) - np.maximum(y1[i], y1[rest]))
        inter = w * h
        union = areas[i] + areas[rest] - inter
        ious = np.divide(inter, union, out=np.zeros_like(inter), where=union > 0)

        order = rest[ious <= iou_threshold]       # only IoU > threshold is suppressed
    return keep

# Time O(N log N + N * K) for K kept boxes (O(N^2) worst case); space O(N).
`,
  },
  {
    id: 'focal-loss',
    title: 'Focal Loss',
    section: 'cnn',
    difficulty: 'medium',
    description: `
## Focal Loss

### What you'll build
The binary focal loss of RetinaNet (Lin et al., 2017), averaged over all examples.

### Background
A one-stage detector scores ~100k anchors per image, and almost all of them are easy background. With plain cross-entropy, those easy negatives each contribute a small loss, but together they swamp the few hard, informative examples. Focal loss multiplies cross-entropy by \`(1 - p_t)^gamma\`, which shrinks the loss of examples the model already gets right, and adds a class weight \`alpha\`.

### Formula
For each example with predicted probability \`p\` (of class 1) and label \`y\` in \`{0, 1}\`:
\`\`\`text
p_t     = p          if y == 1,   1 - p      if y == 0      # probability of the true class
alpha_t = alpha      if y == 1,   1 - alpha  if y == 0      # alpha weights the POSITIVE class
FL      = -alpha_t * (1 - p_t)^gamma * log(p_t)
loss    = mean(FL) over all examples
\`\`\`
- \`gamma >= 0\` is the focusing parameter (default \`2.0\`). \`gamma = 0\` gives alpha-weighted binary cross-entropy.
- \`alpha\` in \`[0, 1]\` is the positive-class weight (default \`0.25\`, so positives get 0.25 and negatives 0.75, as in the paper).

| Example | p_t | (1 - p_t)^2 | Effect |
|---|---|---|---|
| easy, p_t = 0.9 | 0.9 | 0.01 | loss scaled down 100x |
| hard, p_t = 0.1 | 0.1 | 0.81 | loss almost unchanged |

### Inputs
- \`predictions\`: 1D array or list of **probabilities** in \`[0, 1]\` (already passed through a sigmoid, not logits).
- \`targets\`: 1D array or list of the same length with labels \`0\` or \`1\`.
- \`alpha\`: float, default \`0.25\`; \`gamma\`: float, default \`2.0\`.

### Expected return format
A Python \`float\`: the mean focal loss, rounded to 4 decimal places.

### Edge cases and conventions
- Clip \`p\` to \`[1e-7, 1 - 1e-7]\` before the log, so \`p = 0\` or \`p = 1\` gives a large but finite loss instead of \`inf\` or \`nan\`.
- The mean is over **all** examples. (RetinaNet itself sums and divides by the number of positive anchors; that is not asked here.)

### Constraints
NumPy only, vectorised (no Python loop over examples).

### Follow-up
- Why does the paper also initialise the final classification bias to \`-log((1 - pi) / pi)\` with \`pi = 0.01\`?
- Rewrite the loss in terms of logits so it is numerically stable for large \`|logit|\`.
`,
    examples: [
      {
        input: 'predictions = [0.9, 0.1], targets = [1, 0], alpha = 0.25, gamma = 2.0',
        output: '0.0005',
        explanation: 'Both are easy: p_t = 0.9, so each loss is scaled by 0.01. (0.25 * 0.01 * 0.1054 + 0.75 * 0.01 * 0.1054) / 2 = 0.0005.',
      },
      {
        input: 'predictions = [0.1, 0.9], targets = [1, 0], alpha = 0.25, gamma = 2.0',
        output: '0.9325',
        explanation: 'Both are wrong (p_t = 0.1), so the modulating factor is 0.81 and the loss stays large.',
      },
    ],
    starterCode: `import numpy as np

def focal_loss(predictions, targets, alpha=0.25, gamma=2.0):
    """
    Mean binary focal loss.

    Args:
        predictions: Probabilities of class 1, shape (n,), values in [0, 1]
        targets: Labels 0 or 1, shape (n,)
        alpha: Weight of the positive class (negatives get 1 - alpha), default 0.25
        gamma: Focusing parameter, default 2.0

    Returns:
        Mean focal loss as a Python float, rounded to 4 decimal places
        (clip p to [1e-7, 1 - 1e-7] before the log)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Confident correct predictions',
        input: '([0.9, 0.1], [1, 0], 0.25, 2.0)',
        expected: '0.0005',
        hidden: false,
      },
      {
        id: '2',
        description: 'Uncertain predictions',
        input: '([0.6, 0.4], [1, 0], 0.25, 2.0)',
        expected: '0.0409',
        hidden: false,
      },
      {
        id: '3',
        description: 'Gamma=0 (standard cross-entropy with alpha)',
        input: '([0.9, 0.1], [1, 0], 0.25, 0.0)',
        expected: '0.0527',
        hidden: true,
      },
      {
        id: '4',
        description: 'Wrong predictions (hard examples)',
        input: '([0.1, 0.9], [1, 0], 0.25, 2.0)',
        expected: '0.9325',
        hidden: true,
      },
      {
        id: '5',
        description: 'Default alpha and gamma on four examples',
        input: 'focal_loss([0.7, 0.2, 0.55, 0.95], [1, 0, 0, 1])',
        expected: '0.049',
        hidden: true,
      },
      {
        id: '6',
        description: 'p of exactly 0 or 1 gives a finite loss (clipping)',
        input: 'bool(np.isfinite(focal_loss([1.0, 0.0], [0, 1])))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Start from binary cross-entropy -log(p_t), where p_t is the probability the model gives to the correct class. What factor makes easy examples (p_t near 1) count less?',
      'Build p_t and alpha_t elementwise from the targets, compute the per-example loss, then average.',
      'np.where(t == 1, p, 1 - p) gives p_t and np.where(t == 1, alpha, 1 - alpha) gives alpha_t; FL = -alpha_t * (1 - p_t) ** gamma * np.log(p_t).',
      'Clip p with np.clip(p, 1e-7, 1 - 1e-7) before the log, remember that alpha belongs to the positive class, and return round(float(mean), 4).',
    ],
    solution: `import numpy as np

def focal_loss(predictions, targets, alpha=0.25, gamma=2.0):
    """
    Mean binary focal loss.

    Args:
        predictions: Probabilities of class 1, shape (n,), values in [0, 1]
        targets: Labels 0 or 1, shape (n,)
        alpha: Weight of the positive class (negatives get 1 - alpha), default 0.25
        gamma: Focusing parameter, default 2.0

    Returns:
        Mean focal loss as a Python float, rounded to 4 decimal places
        (clip p to [1e-7, 1 - 1e-7] before the log)
    """
    p = np.clip(np.asarray(predictions, dtype=float), 1e-7, 1 - 1e-7)  # avoid log(0)
    t = np.asarray(targets, dtype=float)

    p_t = np.where(t == 1, p, 1 - p)                 # probability of the true class
    alpha_t = np.where(t == 1, alpha, 1 - alpha)     # alpha weights positives

    loss = -alpha_t * (1 - p_t) ** gamma * np.log(p_t)
    return round(float(np.mean(loss)), 4)

# Time and space O(n).
`,
  },
  {
    id: 'smooth-l1-loss',
    title: 'Smooth L1 Loss',
    section: 'cnn',
    difficulty: 'easy',
    description: `
## Smooth L1 Loss

### What you'll build
The Smooth L1 loss used for bounding-box regression in Fast/Faster R-CNN and SSD, averaged over all elements.

### Background
Box regression targets can be far off early in training. **L2** (MSE) gives those outliers huge gradients; **L1** has constant-size gradients but a kink at 0 that makes fine convergence jittery. Smooth L1 is quadratic near zero and linear beyond \`beta\`, so it is smooth at the optimum and robust to outliers. Its gradient magnitude is \`|x| / beta\` inside the quadratic zone and capped at 1 outside.

### Formula
With \`x = prediction - target\` (elementwise) and threshold \`beta > 0\`:
\`\`\`text
L(x) = 0.5 * x^2 / beta      if |x| < beta
       |x| - 0.5 * beta      otherwise
loss = mean of L(x) over all elements
\`\`\`
The two pieces meet with equal value (\`0.5 * beta\`) and slope (\`1\`) at \`|x| = beta\`.

**Relation to Huber loss**: \`Huber_delta(x) = 0.5 x^2\` for \`|x| < delta\`, else \`delta * (|x| - 0.5 delta)\`. So \`SmoothL1_beta(x) = Huber_beta(x) / beta\`; the two are identical only when \`beta = 1\`. PyTorch has both (\`F.smooth_l1_loss\` and \`F.huber_loss\`).

### Inputs
- \`predictions\`, \`targets\`: arrays (or lists) of the same shape, any number of dimensions. In detection they are \`(num_boxes, 4)\` box offsets.
- \`beta\`: float \`> 0\`, default \`1.0\`.

### Expected return format
A Python \`float\`: the mean over every element, rounded to 4 decimal places.

### Edge cases and conventions
- \`|x| == beta\` falls in the linear branch (use \`<\` for the quadratic one); both give \`0.5 * beta\` there anyway.
- Average over all elements, not per box.

### Constraints
NumPy only, vectorised with \`np.where\`.

### Follow-up
- What happens as \`beta -> 0\` and as \`beta\` grows large?
- Why did later detectors move to IoU-based box losses (GIoU, DIoU)?
`,
    examples: [
      {
        input: 'predictions = [0.5, 1.5], targets = [0.0, 0.0], beta = 1.0',
        output: '0.5625',
        explanation: '|0.5| < 1: 0.5 * 0.25 = 0.125; |1.5| >= 1: 1.5 - 0.5 = 1.0; mean = 0.5625.',
      },
      {
        input: 'predictions = [0.3, 2.0], targets = [0.0, 0.0], beta = 0.5',
        output: '0.92',
        explanation: '0.5 * 0.09 / 0.5 = 0.09 and 2.0 - 0.25 = 1.75; mean = 0.92.',
      },
    ],
    starterCode: `import numpy as np

def smooth_l1_loss(predictions, targets, beta=1.0):
    """
    Mean Smooth L1 loss.

    Args:
        predictions: Predicted values, any shape
        targets: Target values, same shape as predictions
        beta: Quadratic-to-linear transition point, > 0 (default 1.0)

    Returns:
        Mean loss over all elements as a Python float, rounded to 4 decimal places
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Small errors (quadratic region)',
        input: '([0.2, -0.3], [0.0, 0.0], 1.0)',
        expected: '0.0325',
        hidden: false,
      },
      {
        id: '2',
        description: 'Large errors (linear region)',
        input: '([3.0, -2.0], [0.0, 0.0], 1.0)',
        expected: '2.0',
        hidden: false,
      },
      {
        id: '3',
        description: 'Mixed small and large errors',
        input: '([0.5, 1.5, -2.0], [0.0, 0.0, 0.0], 1.0)',
        expected: '0.875',
        hidden: true,
      },
      {
        id: '4',
        description: 'Custom beta threshold',
        input: '([0.3, 2.0], [0.0, 0.0], 0.5)',
        expected: '0.92',
        hidden: true,
      },
      {
        id: '5',
        description: 'Non-zero targets, 2D input, default beta',
        input: 'smooth_l1_loss(np.array([[1.0, 2.5], [-0.5, 4.0]]), np.array([[0.5, 0.5], [0.0, 3.2]]))',
        expected: '0.5175',
        hidden: true,
      },
    ],
    hints: [
      'The loss treats each element independently and switches formula at |x| = beta. Which formula applies to small errors?',
      'Compute x = predictions - targets once, then pick the quadratic or linear branch per element and average.',
      'np.where(np.abs(x) < beta, 0.5 * x ** 2 / beta, np.abs(x) - 0.5 * beta)',
      "Don't forget the division by beta in the quadratic branch (that is Smooth L1, not Huber), and average over every element.",
    ],
    solution: `import numpy as np

def smooth_l1_loss(predictions, targets, beta=1.0):
    """
    Mean Smooth L1 loss.

    Args:
        predictions: Predicted values, any shape
        targets: Target values, same shape as predictions
        beta: Quadratic-to-linear transition point, > 0 (default 1.0)

    Returns:
        Mean loss over all elements as a Python float, rounded to 4 decimal places
    """
    x = np.asarray(predictions, dtype=float) - np.asarray(targets, dtype=float)
    abs_x = np.abs(x)

    # Quadratic inside |x| < beta, linear outside; both equal 0.5 * beta at the boundary
    loss = np.where(abs_x < beta, 0.5 * x ** 2 / beta, abs_x - 0.5 * beta)
    return round(float(np.mean(loss)), 4)
`,
  },
  {
    id: 'seg-metrics',
    title: 'Segmentation Metrics',
    section: 'cnn',
    difficulty: 'medium',
    description: `
## Segmentation Metrics

### What you'll build
Three standard scores for a binary segmentation mask: **IoU** (Jaccard index), **pixel accuracy** and the **Dice coefficient**.

### Background
Segmentation models (U-Net, DeepLab, Mask R-CNN's mask head) predict a label for every pixel. Pixel accuracy is easy to read but misleading when the object is small: predicting "background everywhere" on an image that is 95% background scores 0.95. IoU and Dice only look at the foreground, so they are the metrics reported in papers and medical-imaging challenges. Dice also exists as a training loss (\`1 - soft Dice\`).

### Formula
Treat each mask as the set of pixels equal to 1. With \`TP = |P ∩ T|\` (both 1), \`|P|\` = number of predicted foreground pixels, \`|T|\` = number of target foreground pixels:
\`\`\`text
IoU            = |P ∩ T| / |P ∪ T|          = TP / (|P| + |T| - TP)
Dice           = 2 |P ∩ T| / (|P| + |T|)     = 2 TP / (2 TP + FP + FN)
Pixel accuracy = (number of pixels where prediction == target) / (total pixels)
\`\`\`
Dice is the F1 score over pixels, and the two overlap scores are linked by \`Dice = 2 IoU / (1 + IoU)\`, so Dice >= IoU.

### Inputs
- \`prediction\`, \`target\`: 2D arrays of the same shape \`(H, W)\` containing only \`0\` and \`1\` (any integer or float dtype).

### Expected return format
A dictionary with exactly these keys, each a Python \`float\` rounded to 4 decimal places:
- \`'iou'\`: foreground intersection over union
- \`'pixel_accuracy'\`: fraction of pixels that agree (foreground and background)
- \`'dice'\`: Dice coefficient

### Edge cases and conventions
- If both masks are empty (no foreground at all), the IoU and Dice denominators are 0: return \`0.0\` for \`'iou'\` and \`'dice'\` here. Pixel accuracy is then \`1.0\`. (Some libraries return 1.0 for an empty-vs-empty match; be explicit about which you use.)
- Disjoint masks give IoU and Dice of \`0.0\`.

### Constraints
NumPy only, vectorised (no loops over pixels).

### Follow-up
- How do you extend these to \`K\` classes (per-class IoU, then mean IoU)?
- Write a differentiable soft Dice loss on predicted probabilities.
`,
    examples: [
      {
        input: 'prediction = [[1, 1], [0, 0]], target = [[1, 0], [0, 1]]',
        output: "{'iou': 0.3333, 'pixel_accuracy': 0.5, 'dice': 0.5}",
        explanation: 'TP = 1, |P| = |T| = 2: IoU = 1 / (2 + 2 - 1) = 1/3; 2 of 4 pixels agree; Dice = 2 * 1 / 4 = 0.5.',
      },
      {
        input: 'prediction = [[1, 1, 0], [1, 1, 0], [0, 0, 0]], target = [[1, 1, 1], [1, 0, 0], [0, 0, 0]]',
        output: "{'iou': 0.6, 'pixel_accuracy': 0.7778, 'dice': 0.75}",
        explanation: 'TP = 3, |P| = |T| = 4: IoU = 3/5, Dice = 6/8, and 7 of 9 pixels agree.',
      },
    ],
    starterCode: `import numpy as np

def segmentation_metrics(prediction, target):
    """
    Binary segmentation metrics.

    Args:
        prediction: Predicted mask, shape (H, W), values 0 or 1
        target: Ground-truth mask, shape (H, W), values 0 or 1

    Returns:
        dict with Python floats rounded to 4 decimals:
            'iou': foreground IoU (0.0 if both masks are empty)
            'pixel_accuracy': fraction of matching pixels
            'dice': Dice coefficient (0.0 if both masks are empty)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Partial overlap',
        input: 'segmentation_metrics(np.array([[1,1],[0,0]]), np.array([[1,0],[0,1]]))',
        expected: '{"iou": 0.3333, "pixel_accuracy": 0.5, "dice": 0.5}',
        hidden: false,
      },
      {
        id: '2',
        description: 'Perfect match',
        input: 'segmentation_metrics(np.array([[1,0],[0,1]]), np.array([[1,0],[0,1]]))',
        expected: '{"iou": 1.0, "pixel_accuracy": 1.0, "dice": 1.0}',
        hidden: false,
      },
      {
        id: '3',
        description: 'Dice coefficient check',
        input: "segmentation_metrics(np.array([[1,1,0],[0,0,0]]), np.array([[0,1,1],[0,0,0]]))['dice']",
        expected: '0.5',
        hidden: true,
      },
      {
        id: '4',
        description: 'No overlap (zero IoU and Dice)',
        input: "segmentation_metrics(np.array([[1,1],[0,0]]), np.array([[0,0],[1,1]]))['iou']",
        expected: '0.0',
        hidden: true,
      },
      {
        id: '5',
        description: 'All metrics on a 3x3 mask',
        input: 'segmentation_metrics(np.array([[1, 1, 0], [1, 1, 0], [0, 0, 0]]), np.array([[1, 1, 1], [1, 0, 0], [0, 0, 0]]))',
        expected: '{"iou": 0.6, "pixel_accuracy": 0.7778, "dice": 0.75}',
        hidden: true,
      },
      {
        id: '6',
        description: 'Both masks empty: IoU and Dice 0.0, pixel accuracy 1.0',
        input: 'segmentation_metrics(np.zeros((2, 3)), np.zeros((2, 3)))',
        expected: '{"iou": 0.0, "pixel_accuracy": 1.0, "dice": 0.0}',
        hidden: true,
      },
    ],
    hints: [
      'All three metrics come from a few counts: the overlap, the size of each mask, and the number of agreeing pixels.',
      'Compute intersection, |P| and |T| once, derive the union, then each metric. Guard the zero denominators.',
      'With 0/1 masks, intersection = np.sum(pred * targ), union = pred.sum() + targ.sum() - intersection, pixel accuracy = np.mean(pred == targ).',
      'Return plain floats: round(float(x), 4). Watch the empty-mask case (division by zero) and make sure the dict keys are exactly iou, pixel_accuracy and dice.',
    ],
    solution: `import numpy as np

def segmentation_metrics(prediction, target):
    """
    Binary segmentation metrics.

    Args:
        prediction: Predicted mask, shape (H, W), values 0 or 1
        target: Ground-truth mask, shape (H, W), values 0 or 1

    Returns:
        dict with Python floats rounded to 4 decimals:
            'iou': foreground IoU (0.0 if both masks are empty)
            'pixel_accuracy': fraction of matching pixels
            'dice': Dice coefficient (0.0 if both masks are empty)
    """
    pred = np.asarray(prediction, dtype=float)
    targ = np.asarray(target, dtype=float)

    intersection = np.sum(pred * targ)        # pixels that are 1 in both (logical AND)
    total = pred.sum() + targ.sum()           # |P| + |T|
    union = total - intersection

    iou_val = intersection / union if union > 0 else 0.0
    dice = 2 * intersection / total if total > 0 else 0.0
    pixel_acc = np.mean(pred == targ)

    return {
        'iou': round(float(iou_val), 4),
        'pixel_accuracy': round(float(pixel_acc), 4),
        'dice': round(float(dice), 4),
    }
`,
  },
  {
    id: 'resnet-block',
    title: 'ResNet Basic Block',
    section: 'cnn',
    difficulty: 'medium',
    description: `
## ResNet Basic Block

### What you'll build
\`residual_block(x, params, stride=1)\`: the "basic block" of ResNet-18/34, with an identity or projection shortcut, in NCHW layout.

### Background
Very deep plain CNNs train *worse* than shallower ones: optimisation, not overfitting, is the problem. ResNet (He et al., 2015) adds a **skip connection**: each block learns a residual \`F(x)\` and outputs \`ReLU(F(x) + x)\`. If the identity is the best a block can do, it only has to push \`F\` to zero, and gradients flow straight through the additions. This made 100+ layer networks trainable, and the same residual idea is in every transformer.

\`\`\`text
x ──► conv3x3(stride) ─► BN ─► ReLU ─► conv3x3 ─► BN ──► (+) ─► ReLU ─► out
│                                                         ▲
└──────────────── shortcut: identity or 1x1 conv + BN ────┘
\`\`\`

### Algorithm
1. **Main path**: \`conv1\` 3x3, stride \`stride\`, padding 1, \`C_in -> C_out\`; then \`BN1\`; then ReLU.
2. \`conv2\` 3x3, stride 1, padding 1, \`C_out -> C_out\`; then \`BN2\` (**no** ReLU yet).
3. **Shortcut**: the identity \`x\` when \`stride == 1\` and \`C_in == C_out\`; otherwise a **projection**: 1x1 conv with stride \`stride\` (\`C_in -> C_out\`, no padding) followed by its own BatchNorm.
4. **Output**: \`out = ReLU(main + shortcut)\`. The ReLU comes **after** the addition.

The convs have no bias (BatchNorm's \`beta\` makes it redundant).

### Inputs
- \`x\`: float array \`(N, C_in, H, W)\` (NCHW).
- \`params\`: dict from \`init_block_params(C_in, C_out, stride)\` with
  - \`'conv1_w'\` \`(C_out, C_in, 3, 3)\`, \`'bn1_gamma'\`, \`'bn1_beta'\` \`(C_out,)\`
  - \`'conv2_w'\` \`(C_out, C_out, 3, 3)\`, \`'bn2_gamma'\`, \`'bn2_beta'\` \`(C_out,)\`
  - only for a projection: \`'proj_w'\` \`(C_out, C_in, 1, 1)\`, \`'proj_gamma'\`, \`'proj_beta'\` \`(C_out,)\`
- \`stride\`: \`1\` or \`2\`, the stride of \`conv1\` and of the projection.

### Provided helpers (already in the starter code)
- \`conv2d(x, w, stride, padding)\`: NCHW cross-correlation, \`w\` of shape \`(C_out, C_in, k, k)\`, no bias.
- \`batch_norm2d(x, gamma, beta)\`: **training-mode** BatchNorm: per-channel batch statistics over \`(N, H, W)\`, biased variance, \`eps = 1e-5\`, like \`nn.BatchNorm2d\` in \`.train()\` mode.
- \`init_block_params(c_in, c_out, stride)\`: deterministic parameters (adds \`proj_*\` only when a projection is needed).

### Expected return format
A float array of shape \`(N, C_out, H_out, W_out)\` with \`H_out = (H - 1) // stride + 1\` (that is \`(H + 2*1 - 3) // stride + 1\`), same for \`W\`. Every value is \`>= 0\`.

### Edge cases and conventions
- Decide identity vs projection from the shapes: \`C_out = params['conv1_w'].shape[0]\`.
- Both the main path and the shortcut must downsample by the same stride, or the addition fails.

### Constraints
Use the provided helpers; NumPy only.

### Follow-up
- How does the **bottleneck** block of ResNet-50 (1x1 reduce, 3x3, 1x1 expand) cut compute?
- What does the **pre-activation** ResNet (BN-ReLU-conv, no ReLU after the addition) change, and why does it help very deep nets?
- At inference BatchNorm uses running statistics. How would you fold it into the preceding conv?
`,
    examples: [
      {
        input: 'x: (2, 4, 6, 6), params = init_block_params(4, 4, 1), stride = 1',
        output: 'shape (2, 4, 6, 6)',
        explanation: 'Identity shortcut: the channels and spatial size are unchanged.',
      },
      {
        input: 'x: (2, 3, 6, 6), params = init_block_params(3, 8, 2), stride = 2',
        output: 'shape (2, 8, 3, 3)',
        explanation: 'Channels change and (6 - 1) // 2 + 1 = 3, so the shortcut is a strided 1x1 conv + BN.',
      },
      {
        input: 'params with conv1_w and conv2_w set to zeros, stride = 1',
        output: 'ReLU(x + bn2_beta)',
        explanation: 'A zero conv output normalises to 0, so BN2 returns bn2_beta and the block reduces to ReLU(shortcut + bn2_beta).',
      },
    ],
    starterCode: `import numpy as np

def conv2d(x, w, stride=1, padding=0):
    """Convolution (cross-correlation), no bias. x: (N, C_in, H, W), w: (C_out, C_in, k, k)."""
    N, C, H, W = x.shape
    k = w.shape[2]
    xp = np.pad(x, ((0, 0), (0, 0), (padding, padding), (padding, padding)))
    H_out = (H + 2 * padding - k) // stride + 1
    W_out = (W + 2 * padding - k) // stride + 1
    out = np.zeros((N, w.shape[0], H_out, W_out))
    for a in range(k):
        for b in range(k):
            patch = xp[:, :, a:a + stride * H_out:stride, b:b + stride * W_out:stride]
            out += np.einsum('nchw,oc->nohw', patch, w[:, :, a, b])
    return out


def batch_norm2d(x, gamma, beta, eps=1e-5):
    """Training-mode BatchNorm2d: normalize each channel with batch statistics over (N, H, W)."""
    mu = x.mean(axis=(0, 2, 3), keepdims=True)
    var = x.var(axis=(0, 2, 3), keepdims=True)
    return gamma[None, :, None, None] * (x - mu) / np.sqrt(var + eps) + beta[None, :, None, None]


def init_block_params(c_in, c_out, stride=1):
    """Deterministic parameters for a basic block (proj_* only if a projection is needed)."""
    def weight(shape, phase):
        fan_in = shape[1] * shape[2] * shape[3]
        return np.sin(np.arange(np.prod(shape)) * 1.3 + phase).reshape(shape) / np.sqrt(fan_in)

    def affine(c, phase):
        return 1 + 0.1 * np.cos(np.arange(c) + phase), 0.05 * np.sin(np.arange(c) + phase)

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
        x: Input, shape (N, C_in, H, W)
        params: dict from init_block_params(C_in, C_out, stride)
        stride: Stride of conv1 (and of the projection)

    Returns:
        Output, shape (N, C_out, H_out, W_out) with H_out = (H - 1) // stride + 1
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Identity block keeps the shape',
        input: 'residual_block(np.random.randn(2, 4, 6, 6), init_block_params(4, 4, 1), 1).shape',
        expected: '(2, 4, 6, 6)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Projection block with stride 2',
        input: 'residual_block(np.random.randn(2, 3, 6, 6), init_block_params(3, 8, 2), 2).shape',
        expected: '(2, 8, 3, 3)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Output is non-negative (ReLU after the addition)',
        input: '(lambda x: (lambda out: bool(out.min() >= 0 and (out == 0).any() and not np.allclose(out, np.maximum(x, 0))))(residual_block(x, init_block_params(4, 4, 1), 1)))(np.random.randn(2, 4, 5, 5))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Zeroed convs: identity block reduces to ReLU(x + bn2_beta)',
        input: `(lambda: (
    x := np.random.randn(2, 4, 5, 5),
    p := {**init_block_params(4, 4, 1), 'conv1_w': np.zeros((4, 4, 3, 3)), 'conv2_w': np.zeros((4, 4, 3, 3))},
    bool(np.allclose(residual_block(x, p, 1), np.maximum(x + p['bn2_beta'][None, :, None, None], 0)))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Zeroed convs: projection shortcut gives ReLU(bn2_beta + proj_beta)',
        input: `(lambda: (
    p := {**init_block_params(3, 6, 2), 'conv1_w': np.zeros((6, 3, 3, 3)), 'conv2_w': np.zeros((6, 6, 3, 3)), 'proj_w': np.zeros((6, 3, 1, 1))},
    out := residual_block(np.random.randn(2, 3, 4, 4), p, 2),
    bool(out.shape == (2, 6, 2, 2) and np.allclose(out, np.maximum(p['bn2_beta'] + p['proj_beta'], 0)[None, :, None, None]))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Identity block values',
        input: '(lambda out: (round(float(out.sum()), 4), np.round(out[1, 2, 1], 4).tolist()))(residual_block(np.cos(np.arange(2 * 4 * 5 * 5) * 0.37).reshape(2, 4, 5, 5), init_block_params(4, 4, 1), 1))',
        expected: '(81.5228, [0.5662, 0.949, 1.2229, 0.0, 0.0])',
        hidden: true,
      },
      {
        id: '7',
        description: 'Projection block values',
        input: '(lambda out: (round(float(out.sum()), 4), np.round(out[0, :, 1, 2], 4).tolist()))(residual_block(np.cos(np.arange(2 * 3 * 6 * 6) * 0.37).reshape(2, 3, 6, 6), init_block_params(3, 8, 2), 2))',
        expected: '(84.7368, [0.6048, 1.2406, 0.0, 1.5251, 0.0, 0.0, 0.5989, 0.0])',
        hidden: true,
      },
    ],
    hints: [
      'Write the block as two branches that meet at an addition: the main path learns F(x), the shortcut carries x (resized if needed).',
      'Main path: conv2d(x, conv1_w, stride, padding=1) -> batch_norm2d -> ReLU -> conv2d(..., conv2_w, 1, padding=1) -> batch_norm2d.',
      'Projection exactly when stride != 1 or C_in != C_out: batch_norm2d(conv2d(x, proj_w, stride=stride), proj_gamma, proj_beta). Then np.maximum(main + shortcut, 0).',
      'Common bugs: a ReLU after BN2 (before the addition), forgetting the shortcut BatchNorm, or using padding=1 on the 1x1 projection.',
    ],
    solution: `import numpy as np

def conv2d(x, w, stride=1, padding=0):
    """Convolution (cross-correlation), no bias. x: (N, C_in, H, W), w: (C_out, C_in, k, k)."""
    N, C, H, W = x.shape
    k = w.shape[2]
    xp = np.pad(x, ((0, 0), (0, 0), (padding, padding), (padding, padding)))
    H_out = (H + 2 * padding - k) // stride + 1
    W_out = (W + 2 * padding - k) // stride + 1
    out = np.zeros((N, w.shape[0], H_out, W_out))
    for a in range(k):
        for b in range(k):
            patch = xp[:, :, a:a + stride * H_out:stride, b:b + stride * W_out:stride]
            out += np.einsum('nchw,oc->nohw', patch, w[:, :, a, b])
    return out


def batch_norm2d(x, gamma, beta, eps=1e-5):
    """Training-mode BatchNorm2d: normalize each channel with batch statistics over (N, H, W)."""
    mu = x.mean(axis=(0, 2, 3), keepdims=True)
    var = x.var(axis=(0, 2, 3), keepdims=True)
    return gamma[None, :, None, None] * (x - mu) / np.sqrt(var + eps) + beta[None, :, None, None]


def init_block_params(c_in, c_out, stride=1):
    """Deterministic parameters for a basic block (proj_* only if a projection is needed)."""
    def weight(shape, phase):
        fan_in = shape[1] * shape[2] * shape[3]
        return np.sin(np.arange(np.prod(shape)) * 1.3 + phase).reshape(shape) / np.sqrt(fan_in)

    def affine(c, phase):
        return 1 + 0.1 * np.cos(np.arange(c) + phase), 0.05 * np.sin(np.arange(c) + phase)

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
        x: Input, shape (N, C_in, H, W)
        params: dict from init_block_params(C_in, C_out, stride)
        stride: Stride of conv1 (and of the projection)

    Returns:
        Output, shape (N, C_out, H_out, W_out) with H_out = (H - 1) // stride + 1
    """
    p = params
    c_in, c_out = x.shape[1], p['conv1_w'].shape[0]

    # Main path: conv-BN-ReLU-conv-BN
    out = conv2d(x, p['conv1_w'], stride=stride, padding=1)
    out = np.maximum(batch_norm2d(out, p['bn1_gamma'], p['bn1_beta']), 0)
    out = conv2d(out, p['conv2_w'], stride=1, padding=1)
    out = batch_norm2d(out, p['bn2_gamma'], p['bn2_beta'])

    # Shortcut: identity, or 1x1 projection when the shape changes
    if stride != 1 or c_in != c_out:
        shortcut = batch_norm2d(conv2d(x, p['proj_w'], stride=stride), p['proj_gamma'], p['proj_beta'])
    else:
        shortcut = x

    # Add, THEN ReLU
    return np.maximum(out + shortcut, 0)

# Cost is dominated by the two 3x3 convs: about 9 * C_out * (C_in + C_out) * H_out * W_out MACs per image.
`,
  },
];
