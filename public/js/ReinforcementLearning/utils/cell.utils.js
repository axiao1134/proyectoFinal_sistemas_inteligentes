export const cellClass = (cell) => {
  switch (cell) {
    case 'S': return 'start';
    case 'G': return 'goal';
    case 'W': return 'wall';
    case 'P': return 'path';
    default: return '';
  }
}
