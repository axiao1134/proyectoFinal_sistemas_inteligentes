// =============================================================
// Visualización interactiva de un árbol de decisión utilizando D3.js.
// Permite explorar el árbol con un slider de profundidad y resalta
// ancestros y conexiones al pasar el mouse.
// Ejemplo basado en el dataset clásico "Play Tennis".
// =============================================================

document.addEventListener('DOMContentLoaded', function() {

     // =============================================================
    // 1️ DEFINICIÓN DE DATOS DEL ÁRBOL DE DECISIÓN
    // =============================================================
    // Estructura jerárquica en JSON que representa el árbol:
    // - Nodo raíz: "Pronóstico?"
    // - Hijos: "Soleado", "Nublado", "Lluvioso"
    // - Subniveles con atributos como "Humedad?", "Viento?" y decisiones "SÍ JUGAR", "NO JUGAR".
    // =============================================================
    const treeData = {
        name: "Pronóstico?",
        children: [
            {
                name: "Soleado",
                children: [
                    {
                        name: "Humedad?",
                        children: [
                            { name: "Alta", children: [{ name: "NO JUGAR" }] },
                            { name: "Normal", children: [{ name: "SÍ JUGAR" }] }
                        ]
                    }
                ]
            },
            { 
                name: "Nublado", 
                children: [{ name: "SÍ JUGAR" }] 
            },
            {
                name: "Lluvioso",
                children: [
                    {
                        name: "Viento?",
                        children: [
                            { name: "Fuerte", children: [{ name: "NO JUGAR" }] },
                            { name: "Débil", children: [{ name: "SÍ JUGAR" }] }
                        ]
                    }
                ]
            }
        ]
    };

      // =============================================================
    // 2 CONFIGURACIÓN DEL SVG PARA LA VISUALIZACIÓN
    // =============================================================
    // - Se crea un SVG responsivo con márgenes.
    // - Se define el área de dibujo.
    // - Se inicializa la estructura de árbol D3 (`d3.tree()`) y la jerarquía.
    // =============================================================
    const margin = { top: 40, right: 90, bottom: 50, left: 90 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#tree-visualization").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const treemap = d3.tree().size([height, width]);
    const root = d3.hierarchy(treeData, d => d.children);

     // =============================================================
    // 3️ update(depth)
    // =============================================================
    // Función principal de renderizado del árbol:
    // - Limpia el SVG antes de cada render.
    // - Filtra nodos según la profundidad elegida (slider).
    // - Construye nodos e links del árbol.
    // - Añade interactividad de resaltado de ancestros al hacer hover.
    // - Coloca círculos y etiquetas en cada nodo.
    // =============================================================
    function update(depth) {
        svg.selectAll("*").remove();

        const nodesData = root.descendants().filter(d => d.depth < depth);

        const filteredRoot = d3.stratify()
            .id(d => d.data.name)
            .parentId(d => d.parent ? d.parent.data.name : null)
            (nodesData);
        
        const treeNodes = treemap(filteredRoot);

        const link = svg.selectAll(".link")
            .data(treeNodes.links())
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));

        const node = svg.selectAll(".node")
            .data(treeNodes.descendants())
            .enter().append("g")
            .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
            .attr("transform", d => `translate(${d.y},${d.x})`);

        node.append("circle").attr("r", 10);
        
        node.append("text")
            .attr("dy", ".35em")
            .attr("x", d => d.children ? -13 : 13)
            .style("text-anchor", d => d.children ? "end" : "start")
            .text(d => d.id); 

        node.on('mouseover', function(event, d) {
            svg.selectAll('.node, .link').style('opacity', 0.2);
            d.ancestors().forEach(ancestor => {
                svg.selectAll(".node").filter(n => n.id === ancestor.id).style('opacity', 1).select('circle').style('stroke-width', '5px');
            });
            svg.selectAll(".link").filter(l => d.ancestors().includes(l.target)).style('opacity', 1).style('stroke-width', '4px');
        });

        node.on('mouseout', function() {
            svg.selectAll('.node, .link').style('opacity', 1);
            svg.selectAll('.node circle').style('stroke-width', '3px');
        });
    }

    // =============================================================
    // 4️ CONFIGURACIÓN DEL SLIDER DE PROFUNDIDAD
    // =============================================================
    // Permite al usuario controlar cuántos niveles del árbol visualizar:
    // - Obtiene el elemento slider por su ID.
    // - Al cambiar su valor, se actualiza la visualización.
    // =============================================================
    const slider = d3.select("#depth-slider");
    slider.on("input", function() {
        update(+this.value); 
    });

     // =============================================================
    // DIBUJO INICIAL
    // =============================================================
    // Calcula la profundidad máxima del árbol y la configura en el slider.
    // Realiza el render inicial mostrando el árbol completo.
    // =============================================================
    const maxDepth = root.height + 1;
    slider.attr("max", maxDepth).property("value", maxDepth);
    update(maxDepth);
});