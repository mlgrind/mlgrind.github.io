# PyTorch tracks (pending)

PyTorch solution tracks for the 31 problems ported from the ML Coding Lab fork
(commits 98f0d1a and 75630a7). Each file holds one section's tracks, copied
verbatim from the fork's `src/data/problems/pytorch/<section>.ts` and keyed by
problem id. Each track has the fork's `LanguageVariant` shape (`starterCode`,
`solution`, `testCases`, optional `hints` and `note`).

**Nothing imports these files.** They are typed `Record<string, unknown>` so
they compile without the `Problem.pytorch` field and do not affect the app,
the build or the tests. They will be attached to their problems once the
PyTorch-track branch (torch shim, `Problem.pytorch`, language toggle) is merged.
They were written for the fork's torch shim and harness (seeded RNG per test),
so check them with that runner when they are wired in.
