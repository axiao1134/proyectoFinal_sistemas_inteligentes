import { renderDecisionTree } from './DecisionTree/render.tree.js';
import { initializeQLearning } from './ReinforcementLearning/q.learning.js';

document.addEventListener('DOMContentLoaded', () => {
  renderDecisionTree('#tree-visualization', '#depth-slider');
  initializeQLearning();
});
