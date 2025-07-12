document.addEventListener('DOMContentLoaded', function() {
    // --- 1. ELEMENTOS DEL DOM ---
    const mazeContainer = document.getElementById('maze-container');
    const chartContainer = document.getElementById('rl-chart-container');
    const episodeSpan = document.getElementById('episode-count');
    const stepSpan = document.getElementById('step-count');
    const rewardSpan = document.getElementById('reward-display');
    const startPauseBtn = document.getElementById('start-pause-btn');
    const resetBtn = document.getElementById('reset-rl-btn');
    const speedSlider = document.getElementById('speed-slider');
    const alphaSlider = document.getElementById('alpha-slider'), alphaValueSpan = document.getElementById('alpha-value');
    const gammaSlider = document.getElementById('gamma-slider'), gammaValueSpan = document.getElementById('gamma-value');
    const epsilonSlider = document.getElementById('epsilon-slider'), epsilonValueSpan = document.getElementById('epsilon-value');

    // --- 2. CONFIGURACIÓN ---
    const mazeLayout = [ ['S','P','P','P','W'], ['P','P','W','P','W'], ['P','P','W','P','P'], ['P','W','P','W','G'], ['P','P','P','P','P'] ];
    const gridSize = mazeLayout.length;
    const ACTIONS = ['up', 'down', 'left', 'right'];
    
    let ALPHA, GAMMA, EPSILON;
    let qTable, episode, steps, agentPos, episodeHistory, chart, x, y, line, simulationInterval;

    // --- 3. LÓGICA DE Q-LEARNING ---
    function gameStep() {
        const stateKey = `${agentPos.row}-${agentPos.col}`;
        const action = chooseAction(stateKey);
        const nextPos = getNextState(agentPos, action);
        const reward = getReward(nextPos);
        const nextStateKey = `${nextPos.row}-${nextPos.col}`;
        
        const actionIndex = ACTIONS.indexOf(action);
        const oldQValue = qTable[stateKey][actionIndex];
        const maxNextQ = Math.max(...qTable[nextStateKey]);
        qTable[stateKey][actionIndex] = oldQValue + ALPHA * (reward + GAMMA * maxNextQ - oldQValue);
        
        agentPos = nextPos;
        steps++;
        updateUI(reward);
        visualizeAll();

        if (mazeLayout[agentPos.row][agentPos.col] === 'G') {
            episodeHistory.push({ episode: episode, steps: steps });
            updateChart();
            startNewEpisode();
        }
    }

    // --- 4. FUNCIONES AUXILIARES Y DE VISUALIZACIÓN ---
    function findChar(char) { for (let r=0;r<gridSize;r++) for(let c=0;c<gridSize;c++) if(mazeLayout[r][c]===char) return {row:r,col:c}; }
    function getNextState(pos, action) { let {row,col}=pos; if(action==='up')row--;else if(action==='down')row++;else if(action==='left')col--;else if(action==='right')col++; if(row<0||row>=gridSize||col<0||col>=gridSize||mazeLayout[row][col]==='W')return pos; return {row,col}; }
    function getReward(pos) { return mazeLayout[pos.row][pos.col]==='G'?100:-1; }
    function chooseAction(stateKey) { if(Math.random()<EPSILON){return ACTIONS[Math.floor(Math.random()*4)];} const qValues=qTable[stateKey];const maxQ=Math.max(...qValues);const bestActions=ACTIONS.filter((_,i)=>qValues[i]===maxQ); return bestActions[Math.floor(Math.random()*bestActions.length)];}
    function drawMaze() { mazeContainer.innerHTML='';mazeContainer.style.gridTemplateColumns=`repeat(${gridSize},1fr)`;mazeLayout.forEach((row,r)=>row.forEach((cellType,c)=>{const cell=document.createElement('div');cell.className=`maze-cell ${{S:'start',G:'goal',W:'wall',P:'path'}[cellType]}`;cell.id=`cell-${r}-${c}`;mazeContainer.appendChild(cell);}));updateAgentVisual(findChar('S'));}
    function updateAgentVisual() { document.querySelectorAll('.agent').forEach(a=>a.remove());const agent=document.createElement('div');agent.className='agent';document.getElementById(`cell-${agentPos.row}-${agentPos.col}`).appendChild(agent); }
    function visualizePolicyAndValues() { let maxQOverall=-Infinity;for(const state in qTable)maxQOverall=Math.max(maxQOverall,...qTable[state]);maxQOverall=Math.max(1,maxQOverall);for(let r=0;r<gridSize;r++)for(let c=0;c<gridSize;c++){const cell=document.getElementById(`cell-${r}-${c}`);let heatmap=cell.querySelector('.value-heatmap');if(!heatmap){heatmap=document.createElement('div');heatmap.className='value-heatmap';cell.appendChild(heatmap);}let arrow=cell.querySelector('.q-arrow');if(arrow)arrow.remove();if(mazeLayout[r][c]==='W'||mazeLayout[r][c]==='G'){heatmap.style.backgroundColor='transparent';continue;}const stateKey=`${r}-${c}`;const qValues=qTable[stateKey];const maxQ=Math.max(...qValues);if(maxQ>0){heatmap.style.backgroundColor=`rgba(40,167,69,${maxQ/maxQOverall})`;const bestAction=ACTIONS[qValues.indexOf(maxQ)];arrow=document.createElement('div');arrow.className=`q-arrow ${bestAction}`;cell.appendChild(arrow);}else{heatmap.style.backgroundColor='transparent';}}}
    function setupChart() {const margin={top:30,right:30,bottom:40,left:50},width=chartContainer.clientWidth-margin.left-margin.right,height=350-margin.top-margin.bottom;if(width<=0||height<=0)return;chartContainer.innerHTML='';const svg=d3.select("#rl-chart-container").append("svg").attr("width",width+margin.left+margin.right).attr("height",height+margin.top+margin.bottom).append("g").attr("transform",`translate(${margin.left},${margin.top})`);x=d3.scaleLinear().range([0,width]);y=d3.scaleLinear().range([height,0]);svg.append("g").attr("class","x-axis").attr("transform",`translate(0,${height})`);svg.append("g").attr("class","y-axis");line=d3.line().x(d=>x(d.episode)).y(d=>y(d.steps));svg.append("path").attr("class","chart-line");svg.append("text").attr("transform",`translate(${width/2},${height+margin.bottom-5})`).style("text-anchor","middle").text("Episodios");svg.append("text").attr("transform","rotate(-90)").attr("y",0-margin.left+15).attr("x",0-(height/2)).style("text-anchor","middle").text("Pasos por Episodio");svg.append("text").attr("x",width/2).attr("y",0-(margin.top/2)).attr("class","chart-title").text("Eficiencia del Agente");chart=svg;}
    function updateChart() {if(!chart||episodeHistory.length===0)return;x.domain([0,Math.max(10,episode)]);y.domain([0,d3.max(episodeHistory,d=>d.steps)]);chart.select(".x-axis").transition().duration(200).call(d3.axisBottom(x));chart.select(".y-axis").transition().duration(200).call(d3.axisLeft(y));chart.select(".chart-line").datum(episodeHistory).transition().duration(200).attr("d",line);}
    function visualizeAll() { updateAgentVisual(); visualizePolicyAndValues(); }

    // --- 5. CONTROL DE LA SIMULACIÓN ---
    function startNewEpisode() { episode++; steps = 0; agentPos = findChar('S'); }
    function updateUI(reward) { episodeSpan.textContent=episode; stepSpan.textContent=steps; if(reward){rewardSpan.textContent=reward;rewardSpan.className=reward>0?'positive':'negative';}}
    function toggleButtons(disabled) { [startPauseBtn, resetBtn, alphaSlider, gammaSlider, epsilonSlider].forEach(b=>b.disabled=disabled); }
    function toggleSimulation() { if(simulationInterval){ clearInterval(simulationInterval); simulationInterval=null; startPauseBtn.textContent='Reanudar'; startPauseBtn.classList.remove('pause'); toggleButtons(false); } else { startPauseBtn.textContent='Pausar'; startPauseBtn.classList.add('pause'); toggleButtons(true); startPauseBtn.disabled=false; simulationInterval=setInterval(gameStep, 600-speedSlider.value); } }
    function adjustSpeed() { if(simulationInterval){ clearInterval(simulationInterval); simulationInterval=setInterval(gameStep, 600-speedSlider.value); } }
    function initialize() { if(simulationInterval)clearInterval(simulationInterval); simulationInterval=null; episode=1; steps=0; episodeHistory=[]; qTable={}; for(let r=0;r<gridSize;r++)for(let c=0;c<gridSize;c++)qTable[`${r}-${c}`]=[0,0,0,0]; agentPos=findChar('S'); drawMaze(); if(chartContainer.clientWidth>0)setupChart();updateChart(); updateUI(); visualizePolicyAndValues(); startPauseBtn.textContent='Iniciar Entrenamiento'; startPauseBtn.classList.remove('pause'); toggleButtons(false); }
    function updateHyperparameters() { ALPHA=+alphaSlider.value; GAMMA=+gammaSlider.value; EPSILON=+epsilonSlider.value; alphaValueSpan.textContent=ALPHA.toFixed(1); gammaValueSpan.textContent=GAMMA.toFixed(1); epsilonValueSpan.textContent=EPSILON.toFixed(1); }
    
    // --- 6. INICIALIZACIÓN Y EVENTOS ---
    startPauseBtn.onclick = toggleSimulation;
    resetBtn.onclick = initialize;
    speedSlider.oninput = adjustSpeed;
    [alphaSlider, gammaSlider, epsilonSlider].forEach(s => s.oninput = updateHyperparameters);
    
    initialize();
});