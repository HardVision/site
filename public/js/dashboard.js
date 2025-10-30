const cbCPU = document.getElementById('cb_cpu');
const cbRAM = document.getElementById('cb_ram');
const cbRede = document.getElementById('cb_rede');
const cbDisco = document.getElementById('cb_disco');
const cbNucleos = document.getElementById('cb_nucleos');
const cbEstatistica = document.getElementById('cb_estatistica'); 

const secCPU = document.getElementById('sec-cpu');
const secRAM = document.getElementById('sec-ram');
const secRede = document.getElementById('sec-rede');
const secDisco = document.getElementById('sec-disco');
const secNucleos = document.getElementById('sec-nucleos');
const secEstatisticas = document.getElementById('sec-stats'); 

function atualizarLayout(){
  secCPU.style.display = cbCPU.checked ? '' : 'none';
  secRAM.style.display = cbRAM.checked ? '' : 'none';
  secRede.style.display = cbRede.checked ? '' : 'none';
  secDisco.style.display = cbDisco.checked ? '' : 'none';
  secNucleos.style.display = cbNucleos.checked ? '' : 'none';
  secEstatisticas.style.display = cbEstatistica.checked ? '' : 'none'; 
}
cbCPU.onchange = cbRAM.onchange = cbRede.onchange = cbDisco.onchange = cbNucleos.onchange = cbEstatistica.onchange = atualizarLayout;

/* ===== MÁQUINAS ===== */
const caixaMaquinas = document.getElementById('maquinas');
const btnMaquinas = document.getElementById('btn-maquinas');
const listaMaquinas = document.getElementById('menu-maquinas');

let maquinaAtual = 1;
btnMaquinas.textContent = 'Máquina 1';

btnMaquinas.addEventListener('click', (e)=>{ 
  e.stopPropagation(); 
  caixaMaquinas.classList.toggle('show'); 
});
document.addEventListener('click', ()=>caixaMaquinas.classList.remove('show'));

// Maquinas
if (listaMaquinas) {
  const itens = listaMaquinas.querySelectorAll('button');
  for (let i = 0; i < itens.length; i++) {
    itens[i].addEventListener('click', () => {
      maquinaAtual = Number(itens[i].getAttribute('data-target') || (i + 1));
      btnMaquinas.textContent = `Máquina ${maquinaAtual}`;
      caixaMaquinas.classList.remove('show');

      // 🔄 Reinicia dados simulados ao trocar de máquina
      tempo = 0;
      cpuData = Array(maxPontos).fill(Math.floor(Math.random() * 40 + 40));
      ramData = Array(maxPontos).fill(Math.floor(Math.random() * 40 + 40));
      redeEnv = Array(maxPontos).fill(Math.floor(Math.random() * 100 + 100));
      redeRec = Array(maxPontos).fill(Math.floor(Math.random() * 100 + 100));
      discoEmUso = Math.floor(Math.random() * 30 + 60);
      discoHist = Array(12).fill(discoEmUso);
      nucleos = Array(8).fill(Math.floor(Math.random() * 60 + 20));

      grafCPU.data.datasets[0].data = cpuData;
      grafRAM.data.datasets[0].data = ramData;
      grafRede.data.datasets[0].data = redeEnv;
      grafRede.data.datasets[1].data = redeRec;
      grafDisco.data.datasets[0].data = [100 - discoEmUso, discoEmUso];
      grafNucleos.data.datasets[0].data = nucleos;
      grafNucleos.data.datasets[0].backgroundColor = nucleos.map(corN);

      grafCPU.update();
      grafRAM.update();
      grafRede.update();
      grafDisco.update();
      grafNucleos.update();

      atualizarKPIs();
      atualizarEstatisticas();
    });
  }
}


/* ===== POPUP + BADGE + STORE ===== */
let contadorAlertas = 0;

let linkAlertas = document.getElementById('link-alertas') 
  || document.querySelector('a[href="alertas.html"]');

// cria o badge se não existir no HTML
let badge = document.getElementById('badgeAlertas');
if (!badge && linkAlertas) {
  badge = document.createElement('span');
  badge.id = 'badgeAlertas';
  badge.className = 'badge';
  badge.hidden = true;                 // começa escondido
  linkAlertas.style.position = 'relative';
  linkAlertas.appendChild(badge);
}

function getStore(){ try{return JSON.parse(localStorage.getItem('hv_alerts'))||[]}catch{return[]} }
function setStore(arr){ localStorage.setItem('hv_alerts', JSON.stringify(arr.slice(-500))) }
function registrarAlerta({tipo,nivel,texto}){
  const lista = getStore();
  lista.push({ tipo, nivel, texto, maquina: maquinaAtual, ts: Date.now() });
  setStore(lista);
}

function criarPopup(msg, severidade, tipoCategoria){
  contadorAlertas++;
  if (badge){ badge.textContent = String(contadorAlertas); badge.hidden = false; }

  const pop = document.createElement('div');
  pop.className = 'popup-alerta';
  pop.style.background = severidade==='crítico' ? '#ef4444' : severidade==='médio' ? '#f97316' : '#facc15';
  pop.innerHTML = `<span class="ico">⚠️</span><span>${msg}</span>`;

  // 🔹 Ajuste condicional de posição para popups longos (ex: Rede)
  if (msg.toLowerCase().includes('rede')) {
    pop.classList.add('alerta-rede');
  } else if (msg.toLowerCase().includes('cpu')) {
    pop.classList.add('alerta-cpu');
  } else if (msg.toLowerCase().includes('memória')) {
    pop.classList.add('alerta-memoria');
  } else if (msg.toLowerCase().includes('disco')) {
    pop.classList.add('alerta-disco');
  }

  pop.addEventListener('click', ()=>{ 
    if (linkAlertas) linkAlertas.click(); 
    else window.location.href='alertas.html'; 
  });

  document.body.appendChild(pop);
  setTimeout(()=>pop.remove(), 3500);

  const nivelTxt =
    severidade === 'crítico'
      ? 'Crítico'
      : severidade === 'médio'
      ? 'Preocupante'
      : 'Abaixo';

  registrarAlerta({ tipo: tipoCategoria||'Geral', nivel: nivelTxt, texto: msg });
}


/* ===== AUXILIARES ===== */
function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
function estatAmostra(arr){
  const n = arr.length||1;
  let soma=0; for(let i=0;i<n;i++) soma+=arr[i];
  const media=soma/n;
  let varAcum=0; for(let i=0;i<n;i++) varAcum+=(arr[i]-media)*(arr[i]-media);
  const variance = varAcum/(n-1||1);
  return {std: Math.sqrt(variance), variance};
}
function corN(v){ return v>=75 ? '#ef4444' : '#9ca3af' }

/* ===== DADOS MOCK ===== */
let tempo = 0;
const maxPontos = 60;
let labels = Array.from({ length: maxPontos }, (_, i) => `${i}s`);
let cpuData = Array(maxPontos).fill(60);
let ramData = Array(maxPontos).fill(55);
let redeEnv = Array(maxPontos).fill(180);
let redeRec = Array(maxPontos).fill(170);

// >>> Disco: valor atual + HISTÓRICO (para stats)
let discoEmUso = 78;
const DISCO_MAX_PONTOS = 60;
let discoHist = Array(12).fill(discoEmUso);

let nucleos = Array(8).fill(55);


/* ===== GRÁFICOS ===== */
const grafCPU = new Chart(document.getElementById('graficoCPU'), {
  type: 'line',
  data: {
    labels,
    datasets: [{
      label: 'CPU',
      data: cpuData,
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34,197,94,.15)',
      fill: true,
      pointRadius: 0
    }]
  },
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { ticks: { display: false } }, y: { beginAtZero: true, max: 100 } }
  }
});

const grafRAM = new Chart(document.getElementById('graficoRAM'), {
  type: 'line',
  data: {
    labels,
    datasets: [{
      label: 'RAM',
      data: ramData,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,.15)',
      fill: true,
      pointRadius: 0
    }]
  },
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { ticks: { display: false } }, y: { beginAtZero: true, max: 100 } }
  }
});

const grafRede = new Chart(document.getElementById('graficoEDGE'), {
  type: 'line',
  data: {
    labels,
    datasets: [
      {
        label: 'Envio',
        data: redeEnv,
        borderColor: '#7C3AED',
        backgroundColor: 'rgba(124,58,237,.25)',
        fill: true,
        pointRadius: 0
      },
      {
        label: 'Recebimento',
        data: redeRec,
        borderColor: '#06B6D4',
        backgroundColor: 'rgba(6,182,212,.25)',
        fill: true,
        pointRadius: 0
      }
    ]
  },
  options: {
    maintainAspectRatio: false,
    // plugins: { legend: { display: false } },
    scales: { x: { ticks: { display: false } }, y: { beginAtZero: true, max: 250 } }
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
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  }
});

const grafNucleos = new Chart(document.getElementById('graficoNucleos'), {
  type: 'bar',
  data: {
    labels: ['Núcleo 0', 'Núcleo 1', 'Núcleo 2', 'Núcleo 3', 'Núcleo 4', 'Núcleo 5', 'Núcleo 6', 'Núcleo 7'],
    datasets: [{
      data: nucleos,
      backgroundColor: nucleos.map(corN)
    }]
  },
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { ticks: { display: false } }, y: { beginAtZero: true, max: 100 } }
  }
});

/* ===== KPIs / ESTATÍSTICAS ===== */
function formatMbps(v){ return `${Math.round(v)} Mbps`; }

function atualizarKPIs(){
  document.getElementById('kpi_cpu').textContent = Math.round(cpuData[cpuData.length-1])+'%';
  document.getElementById('kpi_ram').textContent = Math.round(ramData[ramData.length-1])+'%';
  document.getElementById('kpi_disco').textContent = discoEmUso+'%';

  document.getElementById('kpi_env').textContent = formatMbps(redeEnv[redeEnv.length-1]);
  document.getElementById('kpi_rec').textContent = formatMbps(redeRec[redeRec.length-1]);
}

function atualizarEstatisticas(){
  const stats = [
    ['CPU',            estatAmostra(cpuData)],
    ['CPU por Núcleo', estatAmostra(nucleos)],
    ['RAM',            estatAmostra(ramData)],
    ['Rede',           estatAmostra(redeEnv)],
    ['Disco',          estatAmostra(discoHist)]
  ];
  const tbody = document.getElementById('tabela-stats');
  if (!tbody) return;
  let html='';
  for (let i=0;i<stats.length;i++){
    const [n,s]=stats[i];
    html += `<tr><td style="text-align:left">${n}</td><td>${s.std.toFixed(2)}</td><td>${s.variance.toFixed(2)}</td></tr>`;
  }
  tbody.innerHTML = html;
}

/* ===== UPTIME (DD:HH:MM:SS) ===== */
const uptimeEl = document.getElementById('kpi_uptime');
// começa com 14 dias e 00:00:00
let uptimeSeg = 14*22*3500;
function two(n){return n<10?`0${n}`:`${n}`;}
function renderUptime(){
  const dias = Math.floor(uptimeSeg / (24*3600));
  const resto = uptimeSeg % (24*3600);
  const horas = Math.floor(resto / 3600);
  const min = Math.floor((resto % 3600) / 60);
  const seg = resto % 60;
  uptimeEl.textContent = `${two(dias)}:${two(horas)}:${two(min)}:${two(seg)} dias`;
}
setInterval(()=>{ uptimeSeg++; renderUptime(); }, 1000);
renderUptime();

/* ===== LOOP 2s ===== */
setInterval(()=>{
  tempo++;
  labels.push(`${tempo}s`); if(labels.length>maxPontos) labels.shift();

  const novaCPU = clamp(cpuData[cpuData.length-1] + (Math.random()*30-15), 0, 100);
  const novaRAM = clamp(ramData[ramData.length-1] + (Math.random()*20-10), 0, 100);
  const novaEnv = clamp(redeEnv[redeEnv.length-1] + (Math.random()*50-25), 0, 250);
  const novaRec = clamp(redeRec[redeRec.length-1] + (Math.random()*40-20), 0, 250);

  cpuData.push(novaCPU); if(cpuData.length>maxPontos) cpuData.shift();
  ramData.push(novaRAM); if(ramData.length>maxPontos) ramData.shift();
  redeEnv.push(novaEnv); if(redeEnv.length>maxPontos) redeEnv.shift();
  redeRec.push(novaRec); if(redeRec.length>maxPontos) redeRec.shift();

  grafCPU.update(); grafRAM.update(); grafRede.update();

  const coresBG=[];
  for(let i=0;i<nucleos.length;i++){
    const v=nucleos[i];
    const delta=(Math.random()*2)-1;
    const reversion=(50-v)*0.04;
    let novo=v+delta+reversion;
    if(novo<0)novo=0; else if(novo>100)novo=100;
    nucleos[i]=novo;
    coresBG.push(corN(novo));
  }
  grafNucleos.data.datasets[0].data=nucleos;
  grafNucleos.data.datasets[0].backgroundColor=coresBG;
  grafNucleos.update();

  atualizarKPIs();
  atualizarEstatisticas();

  // Alertas

// CPU
if (novaCPU > 85) {
  criarPopup('CPU: Utilização acima de 85%', 'crítico', 'CPU');
} else if (novaCPU > 65) {
  criarPopup('CPU: Utilização acima de 65%', 'médio', 'CPU');
} else if (novaCPU < 5) {
  criarPopup('CPU: Utilização abaixo de 5%', 'baixo', 'CPU');
}

// MEMÓRIA
if (novaRAM > 85) {
  criarPopup('Memória: Utilização acima de 85%', 'crítico', 'Memória');
} else if (novaRAM > 65) {
  criarPopup('Memória: Utilização acima de 65%', 'médio', 'Memória');
}

// DISCO
const livre = 100 - discoEmUso;
if (livre <= 10) {
  criarPopup('Disco: apenas 10% de espaço livre', 'crítico', 'Disco');
} else if (livre <= 20) {
  criarPopup('Disco: apenas 20% de espaço livre', 'médio', 'Disco');
}

// REDE
if (novaEnv < 125 || novaRec < 125 || quedaAbrupta(novaEnv, prevEnv) || quedaAbrupta(novaRec, prevRec)) {
  criarPopup('Rede: abaixo 50% da capacidade máxima', 'crítico', 'Rede');
}



}, 2000);

/* ===== DISCO 10s ===== */
setInterval(()=>{
  discoEmUso = Math.floor(Math.random()*20 + 65);

  // atualiza o pie
  grafDisco.data.datasets[0].data=[100-discoEmUso,discoEmUso];
  grafDisco.update();

  // >>> atualiza histórico do Disco e limita tamanho
  discoHist.push(discoEmUso);
  if (discoHist.length > DISCO_MAX_PONTOS) discoHist.shift();

  if (discoEmUso>90) criarPopup('Disco acima de 90%', 'médio', 'Disco');

  atualizarKPIs();
  atualizarEstatisticas();
}, 10000);

/* ===== INIT ===== */
atualizarLayout();
atualizarKPIs();
atualizarEstatisticas();
