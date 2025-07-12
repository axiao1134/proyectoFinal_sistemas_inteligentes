import { clearExistingAgents } from "./utils/agent.utils.js";
import { cellClass } from "./utils/cell.utils.js";

export const drawMaze = (container, layout) => {
  container.innerHTML = '';
  container.style.gridTemplateColumns = `repeat(${layout[0].length}, 3fr)`;

  for (let row = 0; row < layout.length; row++) {
    for (let col = 0; col < layout[row].length; col++) {
      const cellType = layout[row][col];

      const cell = document.createElement('div');
      cell.className = 'maze-cell ' + cellClass(cellType);
      cell.id = `cell-${row}-${col}`;

      container.appendChild(cell);
    }
  }
}

export const updateAgent = (agentPos) => {
  clearExistingAgents();

  const agent = document.createElement('div');
  agent.className = 'agent';

  const cellId = `cell-${agentPos.row}-${agentPos.col}`;
  const targetCell = document.getElementById(cellId);

  if (targetCell) {
    targetCell.appendChild(agent);
  }
}
