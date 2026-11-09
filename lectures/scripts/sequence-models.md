---
section: sequence-models
title: Sequence Models
target_minutes: 4
chapters:
  - { t: 0, title: "The recurrent idea" }
  - { t: 45, title: "Backpropagation through time" }
  - { t: 95, title: "The LSTM cell" }
  - { t: 150, title: "The GRU cell" }
  - { t: 195, title: "Recurrence vs attention" }
paragraph_chapters: [0, 1, 2, 3, 4, outro]
---
Welcome to Sequence Models. Text, audio, time series and user sessions are all sequences: the order matters, and the length varies. A recurrent neural network reads a sequence one element at a time, the way you read a book while keeping a running summary in your head. That summary is the hidden state. At every step the network mixes the new input with the previous hidden state, using the same two weight matrices each time, adds a bias, and squashes the result with tanh. Because the weights are shared, one small network handles sequences of any length. You will build this in the Vanilla RNN problem.

To train it, we unroll the loop over time and backpropagate through every step. This is called backpropagation through time. Walking backwards, the gradient that reaches each hidden state has two parts: the direct gradient from the loss at that step, and the gradient flowing back from the next step. Each step back multiplies the gradient by the tanh derivative and by the transpose of the hidden to hidden weights. Like a photocopy of a photocopy, repeating that multiplication fifty times either fades the signal toward zero or blows it up. If the largest singular value of the recurrent weights is below one, gradients vanish. Above one, they can explode. Clipping tames the explosions, but nothing in a plain RNN fixes the vanishing.

The LSTM fixes it with a second state, the cell state, which runs alongside the hidden state like a conveyor belt. Three sigmoid gates, each between zero and one, control it. The forget gate decides how much of the old cell to keep, the input gate how much new candidate content to write, and the output gate how much of the cell to expose as the new hidden state. The key line is additive: the new cell is the forget gate times the old cell, plus the input gate times the candidate. When the forget gate is near one, the gradient flows back through the cell almost unchanged, for hundreds of steps. In PyTorch the four blocks are stacked in the order input, forget, candidate, output. That's the LSTM Cell problem.

The GRU is a lighter cousin. It merges the cell and the hidden state into one vector and uses two gates. The reset gate decides how much of the previous state feeds the candidate, and the update gate blends the two: the new state is one minus z times the candidate, plus z times the previous state. So a z of one simply copies the old state forward. PyTorch applies the reset gate after the matrix product, bias included, and stacks the blocks as reset, update, new. With three blocks instead of four, a GRU has three quarters of an LSTM's parameters. You'll build it in the GRU Cell problem.

Transformers replaced recurrence for most tasks, because attention trains in parallel over every position and reaches any earlier token directly. But recurrence keeps one big advantage: generating each new token costs the same small, fixed amount of memory, however long the sequence gets, while a transformer's key value cache keeps growing. That's why modern state space models bring the recurrent idea back.

Master these three cells and the rest of sequence modelling falls into place. Start with the Vanilla RNN problem below.
