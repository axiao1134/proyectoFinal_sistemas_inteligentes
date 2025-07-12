
// ====================
// Reinforcement Learning Maze Simulator
// Autor: (tu nombre aquí)
// Descripción general:
// Este script implementa un agente Q-Learning que aprende a recorrer un laberinto
// usando HTML, CSS, JavaScript y D3.js para visualizar el entrenamiento, la política
// aprendida y la evolución de pasos por episodio.
// ====================
document.addEventListener('DOMContentLoaded', function() {
     // ====================
    // SECCIÓN: Inicialización de referencias a elementos del DOM
    // ====================

    const mazeContainer = document.getElementById('maze-container');
    const chartContainer = document.getElementById('rl-chart-container');
    const episodeSpan = document.getElementById('episode-count');
    const stepSpan = document.getElementById('step-count');
    const rewardSpan = document.getElementById('reward-display');
    const startPauseBtn = document.getElementById('start-pause-btn');
    const resetBtn = document.getElementById('reset-rl-btn');
    const speedSlider = document.getElementById('speed-slider');

    const alphaSlider = document.getElementById('alpha-slider');
    const alphaValueSpan = document.getElementById('alpha-value');
    const gammaSlider = document.getElementById('gamma-slider');
    const gammaValueSpan = document.getElementById('gamma-value');
    const epsilonSlider = document.getElementById('epsilon-slider');
    const epsilonValueSpan = document.getElementById('epsilon-value');
      // ====================
    // SECCIÓN: Configuración del laberinto y variables RL
    // ====================

    const mazeLayout = [
        ['S','P','P','P','W'],
        ['P','P','W','P','W'],
        ['P','P','W','P','P'],
        ['P','W','P','W','G'],
        ['P','P','P','P','P']
    ];
    const gridSize = mazeLayout.length;
    const ACTIONS = ['up', 'down', 'left', 'right'];

    let ALPHA, GAMMA, EPSILON;
    let qTable, episode, steps, agentPos;
    let episodeHistory, simulationInterval;
    let chart, x, y, line;
    
    // ====================
    // gameStep()
    // Ejecuta un paso de Q-Learning:
    // - El agente elige una acción.
    // - Transiciona al siguiente estado según la acción.
    // - Calcula y actualiza el valor Q de la acción tomada.
    // - Actualiza la interfaz y visualización.
    // - Si alcanza la meta, reinicia episodio y actualiza la gráfica.
    // ====================

    function gameStep() {
        const stateKey = `${agentPos.row}-${agentPos.col}`;
        const action = chooseAction(stateKey);
        const nextPos = getNextState(agentPos, action);
        const reward = getReward(nextPos);
        const nextStateKey = `${nextPos.row}-${nextPos.col}`;

        const actionIndex = ACTIONS.indexOf(action);
        const oldQ = qTable[stateKey][actionIndex];
        const maxNextQ = Math.max(...qTable[nextStateKey]);

        qTable[stateKey][actionIndex] = oldQ + ALPHA * (reward + GAMMA * maxNextQ - oldQ);

        agentPos = nextPos;
        steps++;

        updateUI(reward);
        visualizeAll();

        if (mazeLayout[agentPos.row][agentPos.col] === 'G') {
            episodeHistory.push({ episode, steps });
            updateChart();
            startNewEpisode();
        }
    }

     // ====================
    // chooseAction(stateKey)
    // Devuelve una acción según la política epsilon-greedy:
    // - Con probabilidad EPSILON elige una acción aleatoria.
    // - De lo contrario, elige la acción con el valor Q más alto en el estado actual.
    // ====================
    function chooseAction(stateKey) {
        if (Math.random() < EPSILON) {
            return ACTIONS[Math.floor(Math.random() * 4)];
        }
        const qValues = qTable[stateKey];
        const maxQ = Math.max(...qValues);
        const bestActions = ACTIONS.filter((_, i) => qValues[i] === maxQ);
        return bestActions[Math.floor(Math.random() * bestActions.length)];
    }
  // ====================
    // getNextState(pos, action)
    // Calcula la siguiente posición del agente en el laberinto según la acción dada.
    // Si la acción lleva fuera de los límites o a una pared, el agente permanece en la posición actual.
    // ====================
    function getNextState(pos, action) {
        let { row, col } = pos;
        if (action === 'up') row--;
        if (action === 'down') row++;
        if (action === 'left') col--;
        if (action === 'right') col++;

        if (
            row < 0 || row >= gridSize ||
            col < 0 || col >= gridSize ||
            mazeLayout[row][col] === 'W'
        ) {
            return pos; // bloqueado o pared
        }
        return { row, col };
    }
// ====================
    // getReward(pos)
    // Retorna el reward según la posición:
    // +100 si es la meta (G), -1 en cualquier otro caso.
    // ====================
    function getReward(pos) {
        return mazeLayout[pos.row][pos.col] === 'G' ? 100 : -1;
    }
 // ====================
    // findChar(char)
    // Busca en el laberinto la posición de un carácter específico (S o G) y devuelve su posición.
    // ====================
    function findChar(char) {
        for (let r = 0; r < gridSize; r++)
            for (let c = 0; c < gridSize; c++)
                if (mazeLayout[r][c] === char)
                    return { row: r, col: c };
    }
     // ====================
    // drawMaze()
    // Dibuja visualmente el laberinto en el DOM, coloreando start, goal, wall y path.
    // Inicializa la visualización del agente en su posición inicial.
    // ====================

    function drawMaze() {
        mazeContainer.innerHTML = '';
        mazeContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

        mazeLayout.forEach((row, r) => row.forEach((cellType, c) => {
            const cell = document.createElement('div');
            cell.className = `maze-cell ${{
                S: 'start', G: 'goal', W: 'wall', P: 'path'
            }[cellType]}`;
            cell.id = `cell-${r}-${c}`;
            mazeContainer.appendChild(cell);
        }));

        updateAgentVisual(findChar('S'));
    }
    
    // ====================
    // updateAgentVisual()
    // Actualiza la posición visual del agente en el laberinto.
    // ====================

    function updateAgentVisual() {
        document.querySelectorAll('.agent').forEach(a => a.remove());
        const agent = document.createElement('div');
        agent.className = 'agent';
        document.getElementById(`cell-${agentPos.row}-${agentPos.col}`).appendChild(agent);
    }
    // ====================
    // visualizePolicyAndValues()
    // Muestra un heatmap y flechas en el laberinto indicando:
    // - Valor Q máximo de cada celda.
    // - Acción óptima (flecha) aprendida por el agente en cada celda.
    // ====================

    function visualizePolicyAndValues() {
        let maxQOverall = -Infinity;
        for (const state in qTable)
            maxQOverall = Math.max(maxQOverall, ...qTable[state]);

        maxQOverall = Math.max(1, maxQOverall);

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const cell = document.getElementById(`cell-${r}-${c}`);
                let heatmap = cell.querySelector('.value-heatmap');
                if (!heatmap) {
                    heatmap = document.createElement('div');
                    heatmap.className = 'value-heatmap';
                    cell.appendChild(heatmap);
                }

                let arrow = cell.querySelector('.q-arrow');
                if (arrow) arrow.remove();

                if (mazeLayout[r][c] === 'W' || mazeLayout[r][c] === 'G') {
                    heatmap.style.backgroundColor = 'transparent';
                    continue;
                }

                const stateKey = `${r}-${c}`;
                const qValues = qTable[stateKey];
                const maxQ = Math.max(...qValues);

                if (maxQ > 0) {
                    heatmap.style.backgroundColor = `rgba(40,167,69,${maxQ / maxQOverall})`;
                    const bestAction = ACTIONS[qValues.indexOf(maxQ)];
                    arrow = document.createElement('div');
                    arrow.className = `q-arrow ${bestAction}`;
                    cell.appendChild(arrow);
                } else {
                    heatmap.style.backgroundColor = 'transparent';
                }
            }
        }
    }
     // ====================
    // setupChart()
    // Inicializa un gráfico de líneas usando D3.js para visualizar:
    // - Episodios en el eje X.
    // - Cantidad de pasos por episodio en el eje Y.
    // ====================

    function setupChart() {
        const margin = { top: 30, right: 30, bottom: 40, left: 50 };
        const width = chartContainer.clientWidth - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;
        if (width <= 0 || height <= 0) return;

        chartContainer.innerHTML = '';
        const svg = d3.select("#rl-chart-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        x = d3.scaleLinear().range([0, width]);
        y = d3.scaleLinear().range([height, 0]);

        svg.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
        svg.append("g").attr("class", "y-axis");

        line = d3.line()
            .x(d => x(d.episode))
            .y(d => y(d.steps));

        svg.append("path").attr("class", "chart-line");

        svg.append("text")
            .attr("transform", `translate(${width / 2},${height + margin.bottom - 5})`)
            .style("text-anchor", "middle")
            .text("Episodios");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 15)
            .attr("x", 0 - (height / 2))
            .style("text-anchor", "middle")
            .text("Pasos por Episodio");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 0 - (margin.top / 2))
            .attr("class", "chart-title")
            .text("Eficiencia del Agente");

        chart = svg;
    }
    // ====================
    // updateChart()
    // Actualiza el gráfico con la historia de episodios y pasos completados por episodio.
    // ====================

    function updateChart() {
        if (!chart || episodeHistory.length === 0) return;
        x.domain([0, Math.max(10, episode)]);
        y.domain([0, d3.max(episodeHistory, d => d.steps)]);
        chart.select(".x-axis").transition().duration(200).call(d3.axisBottom(x));
        chart.select(".y-axis").transition().duration(200).call(d3.axisLeft(y));
        chart.select(".chart-line")
            .datum(episodeHistory)
            .transition()
            .duration(200)
            .attr("d", line);
    }
     // ====================
    // startNewEpisode()
    // Inicia un nuevo episodio reiniciando pasos y colocando al agente en la posición de inicio.
    // ====================


    function startNewEpisode() {
        episode++;
        steps = 0;
        agentPos = findChar('S');
    }
     // ====================
    // updateUI(reward)
    // Actualiza los contadores en la interfaz (episodio, pasos, último reward).
    // ====================

    function updateUI(reward) {
        episodeSpan.textContent = episode;
        stepSpan.textContent = steps;
        if (reward !== undefined) {
            rewardSpan.textContent = reward;
            rewardSpan.className = reward > 0 ? 'positive' : 'negative';
        }
    }
     // ====================
    // toggleButtons(disabled)
    // Activa o desactiva botones y sliders según el estado de la simulación.
    // ====================

    function toggleButtons(disabled) {
        [startPauseBtn, resetBtn, alphaSlider, gammaSlider, epsilonSlider].forEach(b => {
            b.disabled = disabled;
        });
    }
    // ====================
    // toggleSimulation()
    // Inicia o pausa la simulación del agente.
    // ====================

    function toggleSimulation() {
        if (simulationInterval) {
            clearInterval(simulationInterval);
            simulationInterval = null;
            startPauseBtn.textContent = 'Reanudar';
            startPauseBtn.classList.remove('pause');
            toggleButtons(false);
        } else {
            startPauseBtn.textContent = 'Pausar';
            startPauseBtn.classList.add('pause');
            toggleButtons(true);
            startPauseBtn.disabled = false;
            simulationInterval = setInterval(gameStep, 600 - speedSlider.value);
        }
    }
     // ====================
    // adjustSpeed()
    // Ajusta la velocidad de la simulación según el slider de velocidad.
    // ====================

    function adjustSpeed() {
        if (simulationInterval) {
            clearInterval(simulationInterval);
            simulationInterval = setInterval(gameStep, 600 - speedSlider.value);
        }
    }
    // ====================
    // updateHyperparameters()
    // Actualiza ALPHA, GAMMA y EPSILON desde los sliders y muestra sus valores.
    // ====================

    function updateHyperparameters() {
        ALPHA = +alphaSlider.value;
        GAMMA = +gammaSlider.value;
        EPSILON = +epsilonSlider.value;
        alphaValueSpan.textContent = ALPHA.toFixed(1);
        gammaValueSpan.textContent = GAMMA.toFixed(1);
        epsilonValueSpan.textContent = EPSILON.toFixed(1);
    }
    // ====================
    // initialize()
    // Inicializa o reinicia toda la simulación:
    // - Reinicia Q-Table.
    // - Reinicia episodios.
    // - Dibuja el laberinto.
    // - Configura la gráfica.
    // ====================

    function initialize() {
        if (simulationInterval) clearInterval(simulationInterval);
        simulationInterval = null;

        episode = 1;
        steps = 0;
        episodeHistory = [];
        qTable = {};

        for (let r = 0; r < gridSize; r++)
            for (let c = 0; c < gridSize; c++)
                qTable[`${r}-${c}`] = [0, 0, 0, 0];

        agentPos = findChar('S');
        drawMaze();
        if (chartContainer.clientWidth > 0) setupChart();
        updateChart();
        updateUI();
        visualizePolicyAndValues();

        startPauseBtn.textContent = 'Iniciar Entrenamiento';
        startPauseBtn.classList.remove('pause');
        toggleButtons(false);
    }
     // ====================
    // visualizeAll()
    // Actualiza visualmente la posición del agente y la política aprendida.
    // ====================

    function visualizeAll() {
        updateAgentVisual();
        visualizePolicyAndValues();
    }
     // ====================
    // EVENTOS
    // ====================


    startPauseBtn.onclick = toggleSimulation;
    resetBtn.onclick = initialize;
    speedSlider.oninput = adjustSpeed;
    [alphaSlider, gammaSlider, epsilonSlider].forEach(s => s.oninput = updateHyperparameters);

     // ====================
    // Inicialización al cargar la página
    // ====================
    initialize();
});
