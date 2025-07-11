import { treeData } from './data.tree.js';
import {
  createSvgCanvas,
  clearSvg,
  renderLinks,
  renderNodes,
  attachHoverEffects
} from './utils/tree.utils.js';

export const drawTree = (svg, root, layout, depth) => {
  clearSvg(svg);

  const nodes = root.descendants().filter(d => d.depth < depth);
  const links = root.links().filter(l => l.source.depth < depth - 1);

  layout(root);
  renderLinks(svg, links);

  const node = renderNodes(svg, nodes);
  attachHoverEffects(svg, node);
};

export const renderDecisionTree = (containerId, sliderId) => {
  const margin = { top: 40, right: 90, bottom: 50, left: 90 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = createSvgCanvas(containerId, width, height, margin);
  const root = d3.hierarchy(treeData, d => d.children);
  const treeLayout = d3.tree().size([height, width]);
  const maxDepth = root.height + 1;

  const slider = d3.select(sliderId);
  slider.attr("max", maxDepth).property("value", maxDepth);
  slider.on("input", function() {
    drawTree(svg, root, treeLayout, +this.value);
  });

  drawTree(svg, root, treeLayout, maxDepth);
};
