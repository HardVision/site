// ===== CHECKBOXES / LAYOUT =====
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

function atualizarLayout(){
  secCPU.style.display = cbCPU.checked ? '' : 'none';
  secRAM.style.display = cbRAM.checked ? '' : 'none';
  secRede.style.display = cbRede.checked ? '' : 'none';
  secDisco.style.display = cbDisco.checked ? '' : 'none';
  secNucleos.style.display = cbNucleos.checked ? '' : 'none';
}
cbCPU.onchange = cbRAM.onchange = cbRede.onchange = cbDisco.onchange = cbNucleos.onchange = atualizarLayout;

/* ===== MÁQUINAS ===== */
const caixaMaquinas = document.getElementById('maquinas');
const btnMaquinas = document.getElementById('btn-maquinas');
const listaMaquinas = document.getElementById('menu-maquinas');

let maquinaAtual = 1;
btnMaquinas.textContent = 'Máquina 1';

btnMaquinas.addEventListener('click', (e)=>{e.stopPropagation();caixaMaquinas.classList.toggle('show')});
document.addEventListener('click', ()=>caixaMaquinas.classList.remove('show'));
if (listaMaquinas){
  const itens = listaMaquinas.querySelectorAll('button');
  for (let i=0;i<itens.length;i++){
    itens[i].addEventListener('click', ()=>{
      maquinaAtual = Number(itens[i].getAttribute('data-target') || (i+1));
      btnMaquinas.textContent = `Máquina ${maquinaAtual}`;
      caixaMaquinas.classList.remove('show');
    });
  }
}

/* ===== POPUP + BADGE + STORE ===== */
let contadorAlertas = 0;
const badge = document.getElementById('badgeAlertas');
const linkAlertas = document.getElementById('link-alertas');

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

  pop.addEventListener('click', ()=>{ if (linkAlertas) linkAlertas.click(); else window.location.href='alertas.html'; });

  document.body.appendChild(pop);
  setTimeout(()=>pop.remove(), 3500);

  const nivelTxt = severidade==='crítico'?'Crítico':(severidade==='médio'?'Alto':'Médio');
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
let tempo=0;
const maxPontos=60;
let labels=Array.from({length:maxPontos},(_,i)=>`${i}s`);
let cpuData=Array(maxPontos).fill(50);
let ramData=Array(maxPontos).fill(60);
let redeEnv=Array(maxPontos).fill(100);
let redeRec=Array(maxPontos).fill(90);
let discoEmUso=70;
let nucleos=Array(8).fill(40);

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


/* ---- separação visual ---- */
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


/* ---- separação visual ---- */
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
    plugins: { legend: { display: false } },
    scales: { x: { ticks: { display: false } }, y: { beginAtZero: true, max: 250 } }
  }
});


/* ---- separação visual ---- */
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
    plugins: {
      legend: { display: false } // ✅ legenda desativada
    }
  }
});

/* ---- separação visual ---- */
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

  // >>> KPI de Rede dinâmico (usa último ponto dos datasets)
  document.getElementById('kpi_env').textContent = formatMbps(redeEnv[redeEnv.length-1]);
  document.getElementById('kpi_rec').textContent = formatMbps(redeRec[redeRec.length-1]);
}

function atualizarEstatisticas(){
  const stats = [
    ['CPU',            estatAmostra(cpuData)],
    ['CPU por Núcleo', estatAmostra(nucleos)],
    ['RAM',            estatAmostra(ramData)],
    ['Rede',           estatAmostra(redeEnv)],
    ['Disco',          estatAmostra([discoEmUso,discoEmUso])]
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

  if (novaCPU>75) criarPopup('CPU acima de 75%', 'crítico', 'CPU');
  if (novaRAM>75) criarPopup('RAM acima de 75%', 'médio', 'RAM');
  if (novaEnv>200 || novaRec>200) criarPopup('Pico de rede (> 200 Mbps)', 'médio', 'Rede');
  if (novaEnv<5 && novaRec<5) criarPopup('Rede instável (quase zero)', 'crítico', 'Rede');
}, 2000);

/* ===== DISCO 10s ===== */
setInterval(()=>{
  discoEmUso = Math.floor(Math.random()*20 + 65);
  grafDisco.data.datasets[0].data=[100-discoEmUso,discoEmUso];
  grafDisco.update();

  if (discoEmUso>90) criarPopup('Disco acima de 90%', 'médio', 'Disco');

  atualizarKPIs();
  atualizarEstatisticas();
}, 10000);

/* ===== INIT ===== */
atualizarLayout();
atualizarKPIs();
atualizarEstatisticas();
