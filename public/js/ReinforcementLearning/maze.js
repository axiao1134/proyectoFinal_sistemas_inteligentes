import { DELTAS } from "./utils/maze.utils.js"

export const mazeLayout = [
  ['S', 'P', 'P', 'P', 'W'],
  ['P', 'P', 'W', 'P', 'W'],
  ['P', 'P', 'W', 'P', 'P'],
  ['P', 'W', 'P', 'W', 'G'],
  ['P', 'P', 'P', 'P', 'P']
];

export const ACTIONS = ['up', 'down', 'left', 'right'];

export const findStart = (layout) => {
  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < layout[0].length; c++) {
      if (layout[r][c] === 'S') return { row: r, col: c };
    }
  }
  return null;
}

export const getNextPosition = (position, action, layout) => {
  const [deltaRow, deltaCol] = DELTAS[action];

  const nextRow = position.row + deltaRow;
  const nextCol = position.col + deltaCol;

  const isOutOfBounds =
    nextRow < 0 || nextRow >= layout.length ||
    nextCol < 0 || nextCol >= layout[0].length;

  if (isOutOfBounds) {
    return position;
  }

  const isWall = layout[nextRow][nextCol] === 'W';
  if (isWall) {
    return position;
  }

  return { row: nextRow, col: nextCol };
}

export const getReward = (pos, layout) => {
  return layout[pos.row][pos.col] === 'G' ? 100 : -1;
}
