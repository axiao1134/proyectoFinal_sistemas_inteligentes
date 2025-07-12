import { mazeLayout, ACTIONS, findStart, getNextPosition, getReward } from './maze.js';
import { drawMaze, updateAgent } from './draw.js';
import { createQTable, chooseAction } from './utils/q.utils.js';

let agentPosition;
let qTable = {};
let episode = 0;
let steps = 0;
let alpha = 0.9;
let gamma = 0.6;
let epsilon = 0.2;
let simulationInterval;
let episodeDisplay;
let stepDisplay;
let rewardDisplay;

export const initializeQLearning = () => {
  const mazeContainer = document.getElementById('maze-container');
  drawMaze(mazeContainer, mazeLayout);

  qTable = createQTable(mazeLayout);
  agentPosition = findStart(mazeLayout);
  updateAgent(agentPosition);

  document.getElementById('start-pause-btn').addEventListener('click', toggleSimulation);
  document.getElementById('reset-rl-btn').addEventListener('click', resetSimulation);

  episodeDisplay = document.getElementById('episode-count');
  stepDisplay = document.getElementById('step-count');
  rewardDisplay = document.getElementById('reward-display');

  episodeDisplay.textContent = episode;
  stepDisplay.textContent = steps;
  rewardDisplay.textContent = 0;
}

const simulationStep = () => {
  const stateKey = `${agentPosition.row}-${agentPosition.col}`;
  const action = chooseAction(stateKey, qTable, epsilon);
  const nextPosition = getNextPosition(agentPosition, action, mazeLayout);
  const nextKey = `${nextPosition.row}-${nextPosition.col}`;
  const reward = getReward(nextPosition, mazeLayout);

  const actionIndex = ACTIONS.indexOf(action);
  const maxNextQ = Math.max(...qTable[nextKey]);
  const currentQ = qTable[stateKey][actionIndex];

  qTable[stateKey][actionIndex] = currentQ + alpha * (reward + gamma * maxNextQ - currentQ);

  agentPosition = nextPosition;
  updateAgent(agentPosition);
  steps++;

  stepDisplay.textContent = steps;
  rewardDisplay.textContent = reward;

  const cellValue = mazeLayout[agentPosition.row][agentPosition.col];
  if (cellValue === 'G') {
    console.log(`✅ Episodio ${episode} terminado en ${steps} pasos`);
    episode++;
    episodeDisplay.textContent = episode;
    steps = 0;
    stepDisplay.textContent = steps;
    agentPosition = findStart(mazeLayout);
    updateAgent(agentPosition);
  }
}

const toggleSimulation = () => {
  const btn = document.getElementById('start-pause-btn');

  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    btn.textContent = 'Reanudar';
  } else {
    simulationInterval = setInterval(simulationStep, 400);
    steps = 0;
    btn.textContent = 'Pausar';
  }
}

const resetSimulation = () => {
  clearInterval(simulationInterval);
  simulationInterval = null;

  qTable = createQTable(mazeLayout);
  agentPosition = findStart(mazeLayout);
  updateAgent(agentPosition);

  episode = 0;
  steps = 0;

  document.getElementById('start-pause-btn').textContent = 'Iniciar Entrenamiento';
}
