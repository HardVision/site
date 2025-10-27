// === CHECKBOXES ===
const cbCPU = document.getElementById('cb_cpu');
const cbRAM = document.getElementById('cb_ram');
const cbRede = document.getElementById('cb_rede');
const cbDisco = document.getElementById('cb_disco');
const cbNucleos = document.getElementById('cb_nucleos');

const secCPU = document.getElementById('sec-cpu');
const secRAM = document.getElementById('sec-ram');
const secRede = document.getElementById('sec-rede');
const secDisco = document.getElementById('sec-disco');
const secNucleos = document.getElementById('sec-nucleos');

function atualizarLayout() {
  secCPU.style.display = cbCPU.checked ? '' : 'none';
  secRAM.style.display = cbRAM.checked ? '' : 'none';
  secRede.style.display = cbRede.checked ? '' : 'none';
  secDisco.style.display = cbDisco.checked ? '' : 'none';
  secNucleos.style.display = cbNucleos.checked ? '' : 'none';
}
cbCPU.onchange = cbRAM.onchange = cbRede.onchange = cbDisco.onchange = cbNucleos.onchange = atualizarLayout;

// === MENU MÁQUINAS ===
const caixaMaquinas = document.getElementById('maquinas');
const btnMaquinas = document.getElementById('btn-maquinas');
const listaMaquinas = document.getElementById('menu-maquinas');
btnMaquinas.textContent = 'Máquina 1';
btnMaquinas.addEventListener('click', (e) => {
  e.stopPropagation();
  caixaMaquinas.classList.toggle('show');
  btnMaquinas.setAttribute('aria-expanded', caixaMaquinas.classList.contains('show'));
});
document.addEventListener('click', () => {
  caixaMaquinas.classList.remove('show');
  btnMaquinas.setAttribute('aria-expanded', 'false');
});
listaMaquinas.querySelectorAll('button').forEach((b) => {
  b.addEventListener('click', () => {
    btnMaquinas.textContent = b.textContent;
    caixaMaquinas.classList.remove('show');
  });
});

// === POPUP + BADGE ALERTAS ===
let contadorAlertas = 0;
const badge = document.getElementById('badgeAlertas');
const linkAlertas = document.getElementById('link-alertas');

function criarPopup(msg, tipo) {
  contadorAlertas++;
  badge.textContent = String(contadorAlertas);
  badge.hidden = false;

  const pop = document.createElement('div');
  pop.className = 'popup-alerta';
  pop.style.background =
    tipo === 'crítico' ? '#ef4444' :
    tipo === 'médio'   ? '#f97316' :
                         '#facc15';
  pop.textContent = msg;
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 3500);
}

// === AUXILIARES ===
function corNucleos(n) {
  return n.map((v) => (v >= 75 ? '#ef4444' : '#9ca3af'));
}
function estatAmostra(arr) {
  const n = arr.length;
  const media = arr.reduce((a,b)=>a+b,0)/n;
  const variancia = arr.reduce((a,b)=>a+(b-media)**2,0)/(n-1 || 1);
  return { std: Math.sqrt(variancia), variance: variancia };
}

// === DADOS MOCK DINÂMICOS ===
let tempo = 0;
const maxPontos = 60;
let labels     = Array.from({ length: maxPontos }, (_, i) => `${i}s`);
let cpuData    = Array(maxPontos).fill(50);
let ramData    = Array(maxPontos).fill(60);
let redeEnv    = Array(maxPontos).fill(100);
let redeRec    = Array(maxPontos).fill(90);
let discoEmUso = 70;
let nucleos    = Array(8).fill(40);

// === GRÁFICOS ===
const grafCPU = new Chart(document.getElementById('graficoCPU'), {
  type: 'line',
  data: { labels, datasets: [{
    label: 'CPU', data: cpuData, borderColor: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.15)', fill: true, pointRadius: 0
  }]},
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { display: false }},
    scales: { x: { ticks: { display: false }}, y: { beginAtZero: true, max: 100 } }
  }
});

const grafRAM = new Chart(document.getElementById('graficoRAM'), {
  type: 'line',
  data: { labels, datasets: [{
    label: 'RAM', data: ramData, borderColor: '#3b82f6',
    backgroundColor: 'rgba(59,130,246,0.15)', fill: true, pointRadius: 0
  }]},
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { display: false }},
    scales: { x: { ticks: { display: false }}, y: { beginAtZero: true, max: 100 } }
  }
});

const grafRede = new Chart(document.getElementById('graficoEDGE'), {
  type: 'line',
  data: { labels, datasets: [
    { label: 'Bytes Enviados',  data: redeEnv, borderColor: '#7C3AED', backgroundColor:'rgba(124,58,237,0.25)', fill:true, pointRadius:0 },
    { label: 'Bytes Recebidos', data: redeRec, borderColor: '#06B6D4', backgroundColor:'rgba(6,182,212,0.25)', fill:true, pointRadius:0 }
  ]},
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { display: false }},
    scales: { x: { ticks: { display: false }}, y: { beginAtZero: true, max: 250 } }
  }
});

const grafDisco = new Chart(document.getElementById('graficoDisco'), {
  type: 'pie',
  data: {
    labels: ['Disponível', 'Em uso'],
    datasets: [{
      data: [100 - discoEmUso, discoEmUso],
      backgroundColor: ['#22c55e', '#facc15'],
      borderColor: '#1e293b',
      borderWidth: 2
    }]
  },
  options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' }} }
});

const grafNucleos = new Chart(document.getElementById('graficoNucleos'), {
  type: 'bar',
  data: {
    labels: ['Núcleo 0','Núcleo 1','Núcleo 2','Núcleo 3','Núcleo 4','Núcleo 5','Núcleo 6','Núcleo 7'],
    datasets: [{ data: nucleos, backgroundColor: corNucleos(nucleos) }]
  },
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { display: false }},
    scales: { x: { ticks: { display: false }}, y: { beginAtZero: true, max: 100 } }
  }
});

// === KPIs ===
function atualizarKPIs() {
  document.getElementById('kpi_cpu').textContent   = Math.round(cpuData.at(-1)) + '%';
  document.getElementById('kpi_ram').textContent   = Math.round(ramData.at(-1)) + '%';
  document.getElementById('kpi_disco').textContent = discoEmUso + '%';
  document.getElementById('kpi_env').textContent   = '152 MB';
  document.getElementById('kpi_rec').textContent   = '198 MB';
}

// === ESTATÍSTICAS ===
function atualizarEstatisticas() {
  const statsData = [
    ['CPU',            estatAmostra(cpuData)],
    ['CPU por Núcleo', estatAmostra(nucleos)],
    ['RAM',            estatAmostra(ramData)],
    ['Rede',           estatAmostra(redeEnv)],
    ['Disco',          estatAmostra([discoEmUso, discoEmUso])] // 2 pontos para não zerar desvio
  ];
  const tbody = document.querySelector('#tabela-stats tbody');
  let html = '';
  for (const [nome, s] of statsData) {
    html += `<tr>
      <td style="text-align:left">${nome}</td>
      <td>${s.std.toFixed(2)}</td>
      <td>${s.variance.toFixed(2)}</td>
    </tr>`;
  }
  tbody.innerHTML = html;
}

// === LOOP (2s) ===
setInterval(() => {
  tempo++;
  labels.push(`${tempo}s`);
  if (labels.length > maxPontos) labels.shift();

  const novaCPU = Math.min(100, Math.max(0, cpuData.at(-1) + (Math.random()*30 - 15)));
  const novaRAM = Math.min(100, Math.max(0, ramData.at(-1) + (Math.random()*20 - 10)));
  const novaEnv = Math.min(250, Math.max(0, redeEnv.at(-1) + (Math.random()*50 - 25)));
  const novaRec = Math.min(250, Math.max(0, redeRec.at(-1) + (Math.random()*40 - 20)));

  cpuData.push(novaCPU);
  ramData.push(novaRAM);
  redeEnv.push(novaEnv);
  redeRec.push(novaRec);
  nucleos = nucleos.map(() => Math.random()*100);

  if (cpuData.length > maxPontos) cpuData.shift();
  if (ramData.length > maxPontos) ramData.shift();
  if (redeEnv.length > maxPontos) redeEnv.shift();
  if (redeRec.length > maxPontos) redeRec.shift();

  grafCPU.update();
  grafRAM.update();
  grafRede.update();
  grafNucleos.data.datasets[0].data = nucleos;
  grafNucleos.data.datasets[0].backgroundColor = corNucleos(nucleos);
  grafNucleos.update();

  atualizarKPIs();
  atualizarEstatisticas();

  if (novaCPU > 75) criarPopup('⚠️ CPU acima de 75%', 'crítico');
  if (novaRAM > 75) criarPopup('⚠️ RAM acima de 75%', 'médio');
}, 2000);

// === DISCO (10s) ===
setInterval(() => {
  discoEmUso = Math.floor(Math.random()*20 + 65);
  grafDisco.data.datasets[0].data = [100 - discoEmUso, discoEmUso];
  grafDisco.update();
  if (discoEmUso > 90) criarPopup('⚠️ Disco acima de 90%', 'alto');
  atualizarKPIs();
  atualizarEstatisticas();
}, 10000);

// Inicializa
atualizarLayout();
atualizarKPIs();
atualizarEstatisticas();
