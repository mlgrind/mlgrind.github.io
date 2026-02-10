import { Problem } from '../../types';

export const cnnProblems: Problem[] = [
  {
    id: 'conv2d-forward',
    title: '2D Convolution',
    section: 'cnn',
    difficulty: 'hard',
    description: `
## 2D Convolution Operation

Implement the forward pass of a 2D convolution (no padding, stride=1).

### Operation
For each position (i, j) in the output:
\`\`\`
out[i, j] = sum(input[i:i+kH, j:j+kW] * kernel)
\`\`\`

### Output Size
\`\`\`
out_height = input_height - kernel_height + 1
out_width = input_width - kernel_width + 1
\`\`\`

### Function Signature
\`\`\`python
def conv2d(image, kernel):
    # image: (H, W)
    # kernel: (kH, kW)
    # output: (H-kH+1, W-kW+1)
\`\`\`
    `,
    examples: [
      {
        input: 'image 4x4, kernel 3x3',
        output: 'output 2x2',
        explanation: '4-3+1 = 2 in each dimension',
      },
    ],
    starterCode: `import numpy as np

def conv2d(image, kernel):
    """
    Apply 2D convolution to an image.

    Args:
        image: Input image (H, W)
        kernel: Convolution kernel (kH, kW)

    Returns:
        output: Convolved image (H-kH+1, W-kW+1)
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
    ],
    hints: [
      'Use nested loops to slide the kernel over the image',
      'At each position, compute element-wise product and sum',
      'Output size is (H-kH+1, W-kW+1)',
    ],
    solution: `import numpy as np

def conv2d(image, kernel):
    image = np.array(image)
    kernel = np.array(kernel)

    H, W = image.shape
    kH, kW = kernel.shape

    out_H = H - kH + 1
    out_W = W - kW + 1

    output = np.zeros((out_H, out_W))

    for i in range(out_H):
        for j in range(out_W):
            region = image[i:i+kH, j:j+kW]
            output[i, j] = np.sum(region * kernel)

    return output.astype(int).tolist()
`,
  },
  {
    id: 'max-pool',
    title: 'Max Pooling',
    section: 'cnn',
    difficulty: 'medium',
    description: `
## Max Pooling

Implement 2x2 max pooling with stride 2.

### Operation
Divide input into non-overlapping 2x2 regions and take maximum of each.

### Output Size
\`\`\`
out_height = input_height // 2
out_width = input_width // 2
\`\`\`

### Purpose
- Reduces spatial dimensions
- Provides translation invariance
- Reduces computation
    `,
    examples: [
      {
        input: '[[1,2,3,4], [5,6,7,8], [9,10,11,12], [13,14,15,16]]',
        output: '[[6, 8], [14, 16]]',
        explanation: 'Max of each 2x2 region',
      },
    ],
    starterCode: `import numpy as np

def max_pool2d(image, pool_size=2):
    """
    Apply 2D max pooling.

    Args:
        image: Input image (H, W)
        pool_size: Size of pooling window

    Returns:
        output: Pooled image (H//pool_size, W//pool_size)
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
    ],
    hints: [
      'Iterate with step size = pool_size',
      'For each 2x2 region, use np.max()',
      'Output dimensions are input dimensions // pool_size',
    ],
    solution: `import numpy as np

def max_pool2d(image, pool_size=2):
    image = np.array(image)
    H, W = image.shape

    out_H = H // pool_size
    out_W = W // pool_size

    output = np.zeros((out_H, out_W))

    for i in range(out_H):
        for j in range(out_W):
            region = image[i*pool_size:(i+1)*pool_size,
                          j*pool_size:(j+1)*pool_size]
            output[i, j] = np.max(region)

    return output.astype(int).tolist()
`,
  },
  {
    id: 'flatten-layer',
    title: 'Flatten Layer',
    section: 'cnn',
    difficulty: 'easy',
    description: `
## Flatten Layer

Implement the flatten operation that converts a 3D feature map to a 1D vector for the fully connected layer.

### Operation
\`\`\`
(batch, height, width, channels) → (batch, height * width * channels)
\`\`\`

### Usage
- Connects convolutional layers to fully connected layers
- Preserves batch dimension
    `,
    examples: [
      {
        input: 'shape (2, 4, 4, 3)',
        output: 'shape (2, 48)',
        explanation: '4 * 4 * 3 = 48 features per sample',
      },
    ],
    starterCode: `import numpy as np

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
    ],
    hints: [
      'Get batch size as X.shape[0]',
      'Use reshape to flatten remaining dimensions',
      'np.reshape(X, (batch_size, -1)) uses -1 to infer size',
    ],
    solution: `import numpy as np

def flatten(X):
    batch_size = X.shape[0]
    return X.reshape(batch_size, -1)
`,
  },
  {
    id: 'conv-output-size',
    title: 'Convolution Output Size',
    section: 'cnn',
    difficulty: 'easy',
    description: `
## Calculate Convolution Output Size

Implement a function to calculate the output dimensions of a convolution layer.

### Formula
\`\`\`
output_size = (input_size - kernel_size + 2 * padding) / stride + 1
\`\`\`

### Parameters
- **input_size**: Height or width of input
- **kernel_size**: Height or width of kernel
- **padding**: Zero-padding added to input
- **stride**: Step size of kernel
    `,
    examples: [
      {
        input: 'input=32, kernel=3, padding=1, stride=1',
        output: '32',
        explanation: '(32 - 3 + 2*1) / 1 + 1 = 32',
      },
    ],
    starterCode: `def conv_output_size(input_size, kernel_size, padding=0, stride=1):
    """
    Calculate output size of a convolution layer.

    Args:
        input_size: Input dimension (height or width)
        kernel_size: Kernel dimension
        padding: Zero-padding
        stride: Stride

    Returns:
        output_size: Output dimension
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
    ],
    hints: [
      'Apply the formula: (input - kernel + 2*padding) / stride + 1',
      'Use integer division (//) for the result',
    ],
    solution: `def conv_output_size(input_size, kernel_size, padding=0, stride=1):
    return (input_size - kernel_size + 2 * padding) // stride + 1
`,
  },
  {
    id: 'conv2d-advanced',
    title: 'Advanced 2D Convolution',
    section: 'cnn',
    difficulty: 'hard',
    description: `
## Advanced 2D Convolution

Implement a full-featured 2D convolution with **padding**, **stride**, and **groups** support.

### Parameters
- **padding**: Zero-padding added to input borders
- **stride**: Step size when sliding the kernel
- **groups**: Split input/output channels into groups (used in depthwise separable convolutions)

### Group Convolution
When \`groups > 1\`:
- Input channels are split into \`groups\` chunks
- Output channels are split into \`groups\` chunks
- Each group's input is convolved only with its corresponding kernel group
- \`in_channels\` and \`out_channels\` must be divisible by \`groups\`

### Special Cases
- \`groups=1\`: Standard convolution
- \`groups=in_channels=out_channels\`: Depthwise convolution (MobileNet)

### Output Size Formula
\`\`\`
H_out = (H_in + 2*padding - kernel_height) // stride + 1
W_out = (W_in + 2*padding - kernel_width) // stride + 1
\`\`\`

### Function Signature
\`\`\`python
def conv2d_advanced(input, kernel, padding=0, stride=1, groups=1):
    # input: (batch, in_channels, H, W)
    # kernel: (out_channels, in_channels//groups, kH, kW)
    # output: (batch, out_channels, H_out, W_out)
\`\`\`
    `,
    examples: [
      {
        input: 'input (1, 4, 5, 5), kernel (8, 2, 3, 3), groups=2',
        output: 'output (1, 8, 3, 3)',
        explanation: 'Groups=2: channels 0-1 use kernels 0-3, channels 2-3 use kernels 4-7',
      },
      {
        input: 'input (1, 1, 5, 5), kernel (1, 1, 3, 3), padding=1, stride=2',
        output: 'output (1, 1, 3, 3)',
        explanation: '(5+2*1-3)//2+1 = 3',
      },
    ],
    starterCode: `import numpy as np

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
    ],
    hints: [
      'First, pad the input using np.pad() along the H and W dimensions',
      'Calculate output dimensions: H_out = (H_padded - kH) // stride + 1',
      'For groups: split input channels into chunks of size in_channels//groups',
      'For groups: split kernels into chunks of size out_channels//groups',
      'Convolve each input group with its corresponding kernel group',
      'Concatenate results along the channel dimension',
    ],
    solution: `import numpy as np

def conv2d_advanced(input, kernel, padding=0, stride=1, groups=1):
    input = np.array(input, dtype=float)
    kernel = np.array(kernel, dtype=float)

    batch, in_channels, H, W = input.shape
    out_channels, kernel_in_channels, kH, kW = kernel.shape

    # Pad input
    if padding > 0:
        input = np.pad(input, ((0, 0), (0, 0), (padding, padding), (padding, padding)), mode='constant')

    _, _, H_padded, W_padded = input.shape

    # Calculate output dimensions
    H_out = (H_padded - kH) // stride + 1
    W_out = (W_padded - kW) // stride + 1

    # Initialize output
    output = np.zeros((batch, out_channels, H_out, W_out))

    # Channels per group
    in_channels_per_group = in_channels // groups
    out_channels_per_group = out_channels // groups

    for g in range(groups):
        # Input channels for this group
        in_start = g * in_channels_per_group
        in_end = in_start + in_channels_per_group

        # Output channels for this group
        out_start = g * out_channels_per_group
        out_end = out_start + out_channels_per_group

        # Get the input slice for this group
        input_group = input[:, in_start:in_end, :, :]

        # Get the kernels for this group
        kernel_group = kernel[out_start:out_end, :, :, :]

        # Perform convolution for this group
        for b in range(batch):
            for oc in range(out_channels_per_group):
                for i in range(H_out):
                    for j in range(W_out):
                        h_start = i * stride
                        w_start = j * stride
                        region = input_group[b, :, h_start:h_start+kH, w_start:w_start+kW]
                        output[b, out_start + oc, i, j] = np.sum(region * kernel_group[oc])

    return output
`,
  },
  {
    id: 'iou-bounding-box',
    title: 'IoU (Intersection over Union)',
    section: 'cnn',
    difficulty: 'easy',
    description: `
## IoU (Intersection over Union)

Implement Intersection over Union (IoU) for two axis-aligned bounding boxes.

### What is IoU?
IoU measures the overlap between two bounding boxes. It is the **most fundamental metric** in object detection, used for:
- Evaluating detection quality (mAP calculation)
- Matching predictions to ground truth
- Non-Maximum Suppression (NMS)

### Formula
\`\`\`
IoU = Area of Intersection / Area of Union
    = Intersection / (Area_A + Area_B - Intersection)
\`\`\`

### Bounding Box Format
Each box is \`[x1, y1, x2, y2]\` where:
- \`(x1, y1)\` = top-left corner
- \`(x2, y2)\` = bottom-right corner

### Computing Intersection
\`\`\`
inter_x1 = max(box_a_x1, box_b_x1)
inter_y1 = max(box_a_y1, box_b_y1)
inter_x2 = min(box_a_x2, box_b_x2)
inter_y2 = min(box_a_y2, box_b_y2)
\`\`\`
If \`inter_x1 >= inter_x2\` or \`inter_y1 >= inter_y2\`, there is no overlap (IoU = 0).

### Function Signature
\`\`\`python
def iou(box_a, box_b):
    # box_a, box_b: [x1, y1, x2, y2]
    # Returns: float (IoU score, rounded to 4 decimal places)
\`\`\`
    `,
    examples: [
      {
        input: 'box_a=[0, 0, 2, 2], box_b=[1, 1, 3, 3]',
        output: '0.1429',
        explanation: 'Intersection=1, Union=4+4-1=7, IoU=1/7≈0.1429',
      },
      {
        input: 'box_a=[0, 0, 1, 1], box_b=[2, 2, 3, 3]',
        output: '0.0',
        explanation: 'No overlap, IoU=0',
      },
    ],
    starterCode: `import numpy as np

def iou(box_a, box_b):
    """
    Calculate Intersection over Union of two bounding boxes.

    Args:
        box_a: [x1, y1, x2, y2] first bounding box
        box_b: [x1, y1, x2, y2] second bounding box

    Returns:
        IoU score as float, rounded to 4 decimal places
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
    ],
    hints: [
      'Find the intersection rectangle using max of top-left corners and min of bottom-right corners',
      'If the intersection has zero or negative width/height, IoU is 0',
      'Union = Area_A + Area_B - Intersection',
    ],
    solution: `import numpy as np

def iou(box_a, box_b):
    x1 = max(box_a[0], box_b[0])
    y1 = max(box_a[1], box_b[1])
    x2 = min(box_a[2], box_b[2])
    y2 = min(box_a[3], box_b[3])

    inter_w = max(0, x2 - x1)
    inter_h = max(0, y2 - y1)
    intersection = inter_w * inter_h

    area_a = (box_a[2] - box_a[0]) * (box_a[3] - box_a[1])
    area_b = (box_b[2] - box_b[0]) * (box_b[3] - box_b[1])
    union = area_a + area_b - intersection

    if union == 0:
        return 0.0

    return round(intersection / union, 4)
`,
  },
  {
    id: 'nms',
    title: 'Non-Maximum Suppression (NMS)',
    section: 'cnn',
    difficulty: 'medium',
    description: `
## Non-Maximum Suppression (NMS)

Implement Non-Maximum Suppression to filter redundant object detections.

### Why NMS?
Object detectors often produce **multiple overlapping boxes** for the same object. NMS keeps only the best detection per object.

### Algorithm
1. Sort boxes by confidence score (descending)
2. Pick the box with the highest score, add to results
3. Remove all remaining boxes with IoU > threshold against the picked box
4. Repeat until no boxes remain

### Parameters
- **boxes**: List of \`[x1, y1, x2, y2]\` bounding boxes
- **scores**: Confidence score for each box
- **iou_threshold**: Boxes with IoU above this are suppressed (default: 0.5)

### Function Signature
\`\`\`python
def nms(boxes, scores, iou_threshold=0.5):
    # boxes: list of [x1, y1, x2, y2]
    # scores: list of confidence scores
    # Returns: list of kept indices (sorted by decreasing score)
\`\`\`
    `,
    examples: [
      {
        input: 'boxes=[[0,0,4,4],[1,1,4,4],[6,6,8,8]], scores=[0.9,0.75,0.8], threshold=0.5',
        output: '[0, 2]',
        explanation: 'Box 1 (score 0.75) suppressed by box 0 (score 0.9) due to IoU=0.56 > 0.5. Box 2 has no overlap.',
      },
    ],
    starterCode: `import numpy as np

def nms(boxes, scores, iou_threshold=0.5):
    """
    Apply Non-Maximum Suppression.

    Args:
        boxes: List of [x1, y1, x2, y2] bounding boxes
        scores: List of confidence scores for each box
        iou_threshold: IoU threshold for suppression (default: 0.5)

    Returns:
        List of indices of kept boxes, sorted by decreasing score
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
    ],
    hints: [
      'Sort indices by score in descending order',
      'Use a while loop: pick the top-scoring box, then filter out boxes with IoU > threshold',
      'You can reuse an IoU helper function inside NMS',
    ],
    solution: `import numpy as np

def nms(boxes, scores, iou_threshold=0.5):
    def compute_iou(a, b):
        x1 = max(a[0], b[0])
        y1 = max(a[1], b[1])
        x2 = min(a[2], b[2])
        y2 = min(a[3], b[3])
        inter = max(0, x2 - x1) * max(0, y2 - y1)
        area_a = (a[2] - a[0]) * (a[3] - a[1])
        area_b = (b[2] - b[0]) * (b[3] - b[1])
        union = area_a + area_b - inter
        return inter / union if union > 0 else 0.0

    order = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
    keep = []

    while order:
        i = order.pop(0)
        keep.append(i)
        order = [j for j in order if compute_iou(boxes[i], boxes[j]) <= iou_threshold]

    return keep
`,
  },
  {
    id: 'focal-loss',
    title: 'Focal Loss',
    section: 'cnn',
    difficulty: 'medium',
    description: `
## Focal Loss

Implement Focal Loss from the RetinaNet paper (Lin et al., 2017).

### Motivation
In object detection, there is a huge **class imbalance** between background (easy negatives) and foreground (actual objects). Standard cross-entropy gives equal weight to all examples, causing easy negatives to dominate training.

### Formula
\`\`\`
FL(p_t) = -alpha_t * (1 - p_t)^gamma * log(p_t)
\`\`\`

Where:
- \`p_t = p\` if \`y=1\`, else \`p_t = 1 - p\` (model's estimated probability for the true class)
- \`alpha\`: Balancing factor (default 0.25)
- \`gamma\`: Focusing parameter (default 2.0)

### Key Insight
- When \`p_t\` is high (easy example): \`(1 - p_t)^gamma\` → 0, so loss is **down-weighted**
- When \`p_t\` is low (hard example): \`(1 - p_t)^gamma\` → 1, so loss is **unchanged**
- \`gamma=0\` reduces to standard cross-entropy

### Function Signature
\`\`\`python
def focal_loss(predictions, targets, alpha=0.25, gamma=2.0):
    # predictions: predicted probabilities (array of floats in [0, 1])
    # targets: ground truth labels (array of 0s and 1s)
    # Returns: mean focal loss (float, rounded to 4 decimal places)
\`\`\`
    `,
    examples: [
      {
        input: 'predictions=[0.9, 0.1], targets=[1, 0], alpha=0.25, gamma=2.0',
        output: '0.0005',
        explanation: 'Both are confident correct predictions, so focal loss heavily down-weights them',
      },
    ],
    starterCode: `import numpy as np

def focal_loss(predictions, targets, alpha=0.25, gamma=2.0):
    """
    Compute focal loss for binary classification.

    Args:
        predictions: Predicted probabilities (array of floats in [0, 1])
        targets: Ground truth labels (array of 0s and 1s)
        alpha: Balancing factor (default: 0.25)
        gamma: Focusing parameter (default: 2.0)

    Returns:
        Mean focal loss, rounded to 4 decimal places
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
    ],
    hints: [
      'First compute p_t: if target=1 then p_t=p, else p_t=1-p',
      'Apply alpha_t: if target=1 then alpha_t=alpha, else alpha_t=1-alpha',
      'Clip predictions to avoid log(0), e.g., np.clip(p, 1e-7, 1-1e-7)',
      'FL = -alpha_t * (1 - p_t)^gamma * log(p_t), then take the mean',
    ],
    solution: `import numpy as np

def focal_loss(predictions, targets, alpha=0.25, gamma=2.0):
    p = np.array(predictions, dtype=float)
    t = np.array(targets, dtype=float)

    p = np.clip(p, 1e-7, 1 - 1e-7)

    p_t = np.where(t == 1, p, 1 - p)
    alpha_t = np.where(t == 1, alpha, 1 - alpha)

    loss = -alpha_t * (1 - p_t) ** gamma * np.log(p_t)

    return round(float(np.mean(loss)), 4)
`,
  },
  {
    id: 'smooth-l1-loss',
    title: 'Smooth L1 Loss',
    section: 'cnn',
    difficulty: 'easy',
    description: `
## Smooth L1 Loss (Huber Loss)

Implement Smooth L1 Loss, the standard loss for bounding box regression in object detection.

### Motivation
- **L2 loss** (MSE): Sensitive to outliers — large errors produce huge gradients
- **L1 loss** (MAE): Not differentiable at zero
- **Smooth L1**: Combines the best of both — quadratic for small errors, linear for large errors

### Formula
\`\`\`
         ⎧ 0.5 * x² / beta    if |x| < beta
L(x) =  ⎨
         ⎩ |x| - 0.5 * beta   if |x| >= beta
\`\`\`

Where \`x = prediction - target\` and \`beta\` controls the transition point (default: 1.0).

### Properties
- Differentiable everywhere (unlike L1)
- Less sensitive to outliers than L2
- At \`beta=1\`: transitions from quadratic to linear at \`|x|=1\`
- Used in Faster R-CNN, SSD, and most modern detectors

### Function Signature
\`\`\`python
def smooth_l1_loss(predictions, targets, beta=1.0):
    # predictions: predicted values (array)
    # targets: target values (array)
    # Returns: mean smooth L1 loss (float, rounded to 4 decimal places)
\`\`\`
    `,
    examples: [
      {
        input: 'predictions=[0.5, 1.5], targets=[0.0, 0.0], beta=1.0',
        output: '0.5625',
        explanation: '|0.5|<1 → 0.5*0.25/1=0.125; |1.5|>=1 → 1.5-0.5=1.0; mean=(0.125+1.0)/2=0.5625',
      },
    ],
    starterCode: `import numpy as np

def smooth_l1_loss(predictions, targets, beta=1.0):
    """
    Compute Smooth L1 (Huber) Loss.

    Args:
        predictions: Predicted values (array)
        targets: Target values (array)
        beta: Threshold for quadratic-to-linear transition (default: 1.0)

    Returns:
        Mean smooth L1 loss, rounded to 4 decimal places
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
    ],
    hints: [
      'Compute the element-wise difference: x = predictions - targets',
      'Use np.where to apply different formulas based on |x| < beta',
      'Small errors: 0.5 * x^2 / beta; Large errors: |x| - 0.5 * beta',
    ],
    solution: `import numpy as np

def smooth_l1_loss(predictions, targets, beta=1.0):
    p = np.array(predictions, dtype=float)
    t = np.array(targets, dtype=float)

    x = p - t
    abs_x = np.abs(x)

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

Implement three key metrics for evaluating binary image segmentation: **IoU**, **Pixel Accuracy**, and **Dice Coefficient**.

### Metrics

#### 1. IoU (Intersection over Union / Jaccard Index)
\`\`\`
IoU = |Prediction ∩ Target| / |Prediction ∪ Target|
\`\`\`

#### 2. Pixel Accuracy
\`\`\`
Pixel Accuracy = Number of correct pixels / Total pixels
\`\`\`

#### 3. Dice Coefficient (F1 Score for pixels)
\`\`\`
Dice = 2 * |Prediction ∩ Target| / (|Prediction| + |Target|)
\`\`\`

### Relationship Between IoU and Dice
\`\`\`
Dice = 2 * IoU / (1 + IoU)
\`\`\`

### Expected Return Format
Return a dictionary with these keys:
- \`'iou'\`: Intersection over Union (float, rounded to 4 dp)
- \`'pixel_accuracy'\`: Pixel accuracy (float, rounded to 4 dp)
- \`'dice'\`: Dice coefficient (float, rounded to 4 dp)

### Function Signature
\`\`\`python
def segmentation_metrics(prediction, target):
    # prediction: binary mask (2D array of 0s and 1s)
    # target: binary ground truth mask (2D array of 0s and 1s)
    # Returns: dict with 'iou', 'pixel_accuracy', 'dice'
\`\`\`
    `,
    examples: [
      {
        input: 'prediction=[[1,1],[0,0]], target=[[1,0],[0,1]]',
        output: "{'iou': 0.3333, 'pixel_accuracy': 0.5, 'dice': 0.5}",
        explanation: 'Intersection=1, Union=3, IoU=1/3; 2 correct out of 4 pixels; Dice=2*1/(2+2)=0.5',
      },
    ],
    starterCode: `import numpy as np

def segmentation_metrics(prediction, target):
    """
    Compute segmentation evaluation metrics.

    Args:
        prediction: Binary predicted mask (2D array of 0s and 1s)
        target: Binary ground truth mask (2D array of 0s and 1s)

    Returns:
        Dictionary with 'iou', 'pixel_accuracy', 'dice' (all rounded to 4 dp)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Partial overlap',
        input: 'segmentation_metrics(np.array([[1,1],[0,0]]), np.array([[1,0],[0,1]]))',
        expected: "{'iou': 0.3333, 'pixel_accuracy': 0.5, 'dice': 0.5}",
        hidden: false,
      },
      {
        id: '2',
        description: 'Perfect match',
        input: 'segmentation_metrics(np.array([[1,0],[0,1]]), np.array([[1,0],[0,1]]))',
        expected: "{'iou': 1.0, 'pixel_accuracy': 1.0, 'dice': 1.0}",
        hidden: false,
      },
      {
        id: '3',
        description: 'Dice coefficient check',
        input: "segmentation_metrics(np.array([[1,1,0],[0,0,0]]), np.array([[0,1,1],[0,0,0]]))['dice']",
        expected: '0.5',
        hidden: true,
      },
    ],
    hints: [
      'Intersection: np.sum(prediction * target) (both are binary, so multiplication gives AND)',
      'Union: np.sum(prediction) + np.sum(target) - intersection (or use np.sum((prediction + target) > 0))',
      'Pixel accuracy: np.sum(prediction == target) / total_pixels',
    ],
    solution: `import numpy as np

def segmentation_metrics(prediction, target):
    pred = np.array(prediction, dtype=float)
    targ = np.array(target, dtype=float)

    intersection = np.sum(pred * targ)
    union = np.sum(pred) + np.sum(targ) - intersection

    iou_val = intersection / union if union > 0 else 0.0
    pixel_acc = np.sum(pred == targ) / pred.size
    dice = 2 * intersection / (np.sum(pred) + np.sum(targ)) if (np.sum(pred) + np.sum(targ)) > 0 else 0.0

    return {
        'iou': round(float(iou_val), 4),
        'pixel_accuracy': round(float(pixel_acc), 4),
        'dice': round(float(dice), 4)
    }
`,
  },
];
