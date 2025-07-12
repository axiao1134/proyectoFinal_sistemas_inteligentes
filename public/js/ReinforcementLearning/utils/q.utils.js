import { ACTIONS } from './maze.utils.js';

export const createQTable = (layout) => {
  const table = {};
  for (let row = 0; row < layout.length; row++) {
    for (let col = 0; col < layout[0].length; col++) {
      table[`${row}-${col}`] = [0, 0, 0, 0];
    }
  }
  return table;
}

export const chooseAction = (stateKey, qTable, epsilon) => {
  if (Math.random() < epsilon) {
    const randomIndex = Math.floor(Math.random() * ACTIONS.length);
    return ACTIONS[randomIndex];
  }

  const qValues = qTable[stateKey];
  const maxQ = Math.max(...qValues);
  const bestActions = ACTIONS.filter((_, i) => qValues[i] === maxQ);

  const randomBestIndex = Math.floor(Math.random() * bestActions.length);
  return bestActions[randomBestIndex];
}
