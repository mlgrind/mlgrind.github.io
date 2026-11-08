// PyTorch tracks staged from the ML Coding Lab fork (src/data/problems/pytorch/data-preprocessing.ts),
// copied verbatim and keyed by problem id. Not imported anywhere yet: see README.md.
export const dataPreprocessingPyTorchPending: Record<string, unknown> = {
  'stratified-split': {
    note: 'Seeded RNG streams differ between this shim and real PyTorch, so the tests check counts, coverage and reproducibility rather than exact indices. Use torch.manual_seed(seed) + torch.randperm.',
    starterCode: `import torch

def stratified_split(y, val_frac=0.15, test_frac=0.15, seed=0):
    """
    Stratified train/val/test split.

    Args:
        y: int64 tensor of class labels, shape (n,)
        val_frac: Fraction of each class to put in the validation set
        test_frac: Fraction of each class to put in the test set
        seed: Seed (call torch.manual_seed(seed) once, before the class loop)

    Returns:
        dict with sorted int64 index tensors 'train', 'val', 'test'
    """
    # Your code here
    pass
`,
    solution: `import math
import torch

def stratified_split(y, val_frac=0.15, test_frac=0.15, seed=0):
    torch.manual_seed(seed)
    train, val, test = [], [], []

    for c in torch.unique(y):                   # sorted ascending
        idx_c = torch.nonzero(y == c).flatten()
        perm = idx_c[torch.randperm(len(idx_c))]
        n_c = len(idx_c)

        # Round half up, per class
        n_test = min(math.floor(n_c * test_frac + 0.5), n_c)
        n_val = min(math.floor(n_c * val_frac + 0.5), n_c - n_test)

        test.append(perm[:n_test])
        val.append(perm[n_test:n_test + n_val])
        train.append(perm[n_test + n_val:])

    def merge(parts):
        return torch.sort(torch.cat(parts)).values.long()

    return {'train': merge(train), 'val': merge(val), 'test': merge(test)}
`,
    testCases: [
      {
        id: '1',
        description: 'Split sizes for a 10/5 dataset',
        input: '(lambda s: (len(s["train"]), len(s["val"]), len(s["test"])))(stratified_split(torch.tensor([0]*10 + [1]*5), 0.2, 0.2, 0))',
        expected: '(9, 3, 3)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Splits are disjoint and cover every index',
        input: '(lambda y, s: bool(torch.equal(torch.sort(torch.cat([s["train"], s["val"], s["test"]])).values, torch.arange(len(y)))))(torch.tensor([2, 0, 1, 1, 0, 2, 2, 0, 1, 0, 0, 2]), stratified_split(torch.tensor([2, 0, 1, 1, 0, 2, 2, 0, 1, 0, 0, 2]), 0.25, 0.25, 3))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Each split keeps the class proportions',
        input: '(lambda y: (lambda s: [torch.bincount(y[s[k]], minlength=2).tolist() for k in ("train", "val", "test")])(stratified_split(y, 0.2, 0.2, 1)))(torch.tensor([0]*20 + [1]*5))',
        expected: '[[12, 3], [4, 1], [4, 1]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Round half up per class (1.5 -> 2, 0.5 -> 1)',
        input: '(lambda y: (lambda s: [torch.bincount(y[s[k]], minlength=2).tolist() for k in ("train", "val", "test")])(stratified_split(y, 0.1, 0.3, 0)))(torch.tensor([0, 0, 0, 0, 0, 1, 1]))',
        expected: '[[2, 1], [1, 0], [2, 1]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Sorted int64 indices, reproducible with the same seed',
        input: '(lambda y: (lambda a, b: bool(all(torch.equal(a[k], b[k]) and a[k].dtype == torch.int64 and bool((a[k][1:] > a[k][:-1]).all()) for k in a)))(stratified_split(y, 0.2, 0.2, 7), stratified_split(y, 0.2, 0.2, 7)))(torch.arange(30) % 3)',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Fractions that overflow a tiny class are clipped',
        input: '(lambda s: (len(s["train"]), len(s["val"]), len(s["test"])))(stratified_split(torch.tensor([0, 1, 1, 1]), 0.5, 0.6, 0))',
        expected: '(0, 1, 3)',
        hidden: true,
      },
    ],
    hints: [
      'torch.unique(y) is sorted; torch.nonzero(y == c).flatten() gives the indices of class c.',
      'Shuffle with idx_c[torch.randperm(len(idx_c))] after a single torch.manual_seed(seed).',
      'Round half up with math.floor(v + 0.5) and finish with torch.sort(torch.cat(parts)).values.',
    ],
  },
};
