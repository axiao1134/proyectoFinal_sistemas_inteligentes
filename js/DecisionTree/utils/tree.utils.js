export const createSvgCanvas = (containerId, width, height, margin) => {
  return d3.select(containerId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
};

export const clearSvg = svg => {
  svg.selectAll("*").remove();
};

export const renderLinks = (svg, links) => {
  svg.selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));
};

export const renderNodes = (svg, nodes) => {
  const node = svg.selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
    .attr("transform", d => `translate(${d.y},${d.x})`);

  node.append("circle").attr("r", 10);

  node.append("text")
    .attr("dy", ".35em")
    .attr("x", d => d.children ? -13 : 13)
    .style("text-anchor", d => d.children ? "end" : "start")
    .text(d => d.data.name);

  return node;
};

export const attachHoverEffects = (svg, node) => {
  node.on("mouseover", function(d) {
    svg.selectAll('.node, .link').style('opacity', 0.2);

    d.ancestors().forEach(ancestor => {
      svg.selectAll(".node")
        .filter(n => n === ancestor)
        .style('opacity', 1)
        .select('circle').style('stroke-width', '4px');
    });

    svg.selectAll(".link")
      .filter(l => d.ancestors().includes(l.target))
      .style('opacity', 1)
      .style('stroke-width', '3px');
  });

  node.on("mouseout", function() {
    svg.selectAll(".node, .link").style('opacity', 1);
    svg.selectAll(".node circle").style('stroke-width', '2px');
  });
};
