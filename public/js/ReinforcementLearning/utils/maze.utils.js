export const mazeLayout = [
  ['S', 'P', 'P', 'P', 'W'],
  ['P', 'P', 'W', 'P', 'W'],
  ['P', 'P', 'W', 'P', 'P'],
  ['P', 'W', 'P', 'W', 'G'],
  ['P', 'P', 'P', 'P', 'P']
];

export const ACTIONS = ['up', 'down', 'left', 'right'];

export const DELTAS = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};
