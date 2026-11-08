import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../data-preprocessing.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const dataPreprocessingPyTorch: Record<string, LanguageVariant> = {
  'normalize-features': {
    note: 'Use tensor reductions (arr.min(), arr.max()) and broadcasting.',
    starterCode: `import torch

def normalize(arr: torch.Tensor) -> torch.Tensor:
    """
    Apply min-max normalization to scale values to [0, 1].

    Args:
        arr: Input tensor of numbers

    Returns:
        Normalized tensor with values in [0, 1]
    """
    # Your code here
    pass
`,
    solution: `import torch

def normalize(arr: torch.Tensor) -> torch.Tensor:
    """
    Apply min-max normalization to scale values to [0, 1].
    """
    arr_min = arr.min()
    arr_max = arr.max()
    return (arr - arr_min) / (arr_max - arr_min)
`,
    testCases: [
      {
        id: '1',
        description: 'Basic normalization',
        input: 'normalize(torch.tensor([1.0, 2.0, 3.0, 4.0, 5.0]))',
        expected: '[0.0, 0.25, 0.5, 0.75, 1.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'With negative values',
        input: 'normalize(torch.tensor([-10.0, 0.0, 10.0]))',
        expected: '[0.0, 0.5, 1.0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Larger range',
        input: 'normalize(torch.tensor([0.0, 50.0, 100.0]))',
        expected: '[0.0, 0.5, 1.0]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Unsorted input',
        input: 'normalize(torch.tensor([3.0, -1.0, 7.0, 1.0]))',
        expected: '[0.5, 0.0, 1.0, 0.25]',
        hidden: true,
      },
    ],
    hints: [
      'arr.min() and arr.max() return 0-d tensors that broadcast against arr.',
      'Apply the formula: (x - min) / (max - min)',
    ],
  },

  'handle-missing-data': {
    note: 'Use torch.isnan and boolean-mask indexing. Clone the input so it is not modified in place.',
    starterCode: `import torch

def fill_missing_with_mean(arr: torch.Tensor) -> torch.Tensor:
    """
    Replace NaN values with the mean of non-NaN values.

    Args:
        arr: Float tensor that may contain NaN values

    Returns:
        Tensor with NaN values replaced by the mean
    """
    # Your code here
    pass
`,
    solution: `import torch

def fill_missing_with_mean(arr: torch.Tensor) -> torch.Tensor:
    """
    Replace NaN values with the mean of non-NaN values.
    """
    mask = torch.isnan(arr)
    mean_val = arr[~mask].mean()
    out = arr.clone()  # don't modify the original
    out[mask] = mean_val
    return out
`,
    testCases: [
      {
        id: '1',
        description: 'Basic case',
        input: 'fill_missing_with_mean(torch.tensor([1.0, float("nan"), 3.0, float("nan"), 5.0]))',
        expected: '[1.0, 3.0, 3.0, 3.0, 5.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Single NaN',
        input: 'fill_missing_with_mean(torch.tensor([2.0, 4.0, float("nan"), 6.0]))',
        expected: '[2.0, 4.0, 4.0, 6.0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'NaN at start',
        input: 'fill_missing_with_mean(torch.tensor([float("nan"), 10.0, 20.0]))',
        expected: '[15.0, 10.0, 20.0]',
        hidden: true,
      },
      {
        id: '4',
        description: 'No NaN: unchanged',
        input: 'fill_missing_with_mean(torch.tensor([1.5, -2.0, 0.5]))',
        expected: '[1.5, -2.0, 0.5]',
        hidden: true,
      },
    ],
    hints: [
      'torch.isnan(arr) gives a boolean mask of the missing values.',
      'arr[~mask].mean() is the mean of the values that are present.',
      'out[mask] = value assigns through a boolean mask.',
    ],
  },

  'one-hot-encode': {
    note: 'F.one_hot is the built-in; indexing torch.eye(num_classes) with the labels also works. Return an integer tensor.',
    starterCode: `import torch
import torch.nn.functional as F

def one_hot_encode(labels: torch.Tensor, num_classes: int) -> torch.Tensor:
    """
    Convert integer labels to one-hot encoded format.

    Args:
        labels: 1D int64 tensor of labels
        num_classes: Total number of classes

    Returns:
        2D integer tensor of shape (len(labels), num_classes)
    """
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def one_hot_encode(labels: torch.Tensor, num_classes: int) -> torch.Tensor:
    """
    Convert integer labels to one-hot encoded format.
    """
    # Method 1: built-in
    return F.one_hot(labels, num_classes)

    # Method 2: index rows of the identity matrix
    # return torch.eye(num_classes)[labels].long()
`,
    testCases: [
      {
        id: '1',
        description: 'Basic encoding',
        input: 'one_hot_encode(torch.tensor([0, 1, 2]), 3)',
        expected: '[[1, 0, 0], [0, 1, 0], [0, 0, 1]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Repeated labels',
        input: 'one_hot_encode(torch.tensor([0, 0, 1, 1]), 2)',
        expected: '[[1, 0], [1, 0], [0, 1], [0, 1]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'More classes than used',
        input: 'one_hot_encode(torch.tensor([0, 2]), 4)',
        expected: '[[1, 0, 0, 0], [0, 0, 1, 0]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Each row sums to 1',
        input: 'one_hot_encode(torch.tensor([3, 1, 4, 1, 0]), 5).sum(dim=1).tolist()',
        expected: '[1, 1, 1, 1, 1]',
        hidden: true,
      },
    ],
    hints: [
      'F.one_hot(labels, num_classes) does it in one call.',
      'Or: torch.eye(num_classes)[labels] picks one identity row per label.',
      'Convert to integers with .long() if you build it from a float tensor.',
    ],
  },
};
