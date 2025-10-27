// ===== CHECKBOXES =====
var cbCPU = document.getElementById('cb_cpu');
var cbRAM = document.getElementById('cb_ram');
var cbRede = document.getElementById('cb_rede');
var cbDisco = document.getElementById('cb_disco');
var cbNucleos = document.getElementById('cb_nucleos');

var secCPU = document.getElementById('sec-cpu');
var secRAM = document.getElementById('sec-ram');
var secRede = document.getElementById('sec-rede');
var secDisco = document.getElementById('sec-disco');
var secNucleos = document.getElementById('sec-nucleos');

function atualizarLayout() {
  secCPU.style.display = cbCPU.checked ? '' : 'none';
  secRAM.style.display = cbRAM.checked ? '' : 'none';
  secRede.style.display = cbRede.checked ? '' : 'none';
  secDisco.style.display = cbDisco.checked ? '' : 'none';
  secNucleos.style.display = cbNucleos.checked ? '' : 'none';
}
cbCPU.onchange = cbRAM.onchange = cbRede.onchange = cbDisco.onchange = cbNucleos.onchange = atualizarLayout;

// ===== MENU MÁQUINAS =====
var caixaMaquinas = document.getElementById('maquinas');
var btnMaquinas = document.getElementById('btn-maquinas');
var listaMaquinas = document.getElementById('menu-maquinas');

btnMaquinas.textContent = 'Máquina 1';
btnMaquinas.addEventListener('click', function (e) {
  e.stopPropagation();
  caixaMaquinas.classList.toggle('show');                 // abre/fecha via classe
  btnMaquinas.setAttribute('aria-expanded', caixaMaquinas.classList.contains('show'));
});
document.addEventListener('click', function () {          // fecha ao clicar fora
  caixaMaquinas.classList.remove('show');
  btnMaquinas.setAttribute('aria-expanded', 'false');
});
var itens = listaMaquinas.querySelectorAll('button');
for (var i = 0; i < itens.length; i++) {
  itens[i].addEventListener('click', function () {
    btnMaquinas.textContent = this.textContent;
    caixaMaquinas.classList.remove('show');
    var id = (this.getAttribute('data-target') || this.textContent.replace(/\D+/g,'')).trim();
    renderMaquina(id);                                     // troca efetiva
  });
}

// ===== BADGE (se existir) =====
var badge = document.getElementById('badgeAlertas');
function aplicarBadge(n) {
  if (!badge) return;
  if (n > 0) { badge.hidden = false; badge.textContent = n > 99 ? '99+' : String(n); }
  else { badge.hidden = true; }
}

// ===== MOCK DIFERENTE POR MÁQUINA =====
var MOCK = {
  "1": { kpi:{cpu:58,ram:63,disco:76,env:152,rec:198,uptime:"14 dias"},
         serieCPU:[42,55,67,59,66,58], serieRAM:[52,57,61,64,66,63],
         redeEnv:[120,132,145,160,148,162], redeRec:[100,118,126,140,135,150],
         discoEmUso:76, nucleos:[35,78,42,55,37,82,45,76], novosAlertas:3 },
  "2": { kpi:{cpu:33,ram:41,disco:54,env:62,rec:40,uptime:"7 dias"},
         serieCPU:[22,26,35,31,29,33], serieRAM:[30,33,36,40,41,38],
         redeEnv:[25,30,28,41,39,36], redeRec:[18,20,23,29,31,28],
         discoEmUso:54, nucleos:[10,22,18,15,27,14,20,19], novosAlertas:1 },
  "3": { kpi:{cpu:79,ram:81,disco:88,env:210,rec:240,uptime:"3 dias"},
         serieCPU:[70,76,83,81,85,79], serieRAM:[62,70,75,80,84,81],
         redeEnv:[140,160,180,200,220,235], redeRec:[150,170,190,210,230,245],
         discoEmUso:88, nucleos:[66,92,84,73,97,69,90,88], novosAlertas:5 }
};

// ===== KPI ELEMENTS =====
var kpiCPU = document.getElementById('kpi_cpu');
var kpiRAM = document.getElementById('kpi_ram');
var kpiDisco = document.getElementById('kpi_disco');
var kpiEnv = document.getElementById('kpi_env');
var kpiRec = document.getElementById('kpi_rec');
var kpiUptime = document.getElementById('kpi_uptime');

// ===== HELPERS =====
function estatAmostra(arr) {
  var n = arr.length, soma = 0;
  for (var i = 0; i < n; i++) soma += arr[i];
  var media = soma / n, somaVar = 0;
  for (var j = 0; j < n; j++) somaVar += Math.pow(arr[j] - media, 2);
  var variancia = somaVar / (n - 1);
  return { std: Math.sqrt(variancia), variance: variancia };
}
function destroyChart(c){ if (c && typeof c.destroy === 'function') c.destroy(); }

// ===== CHARTS (cores do seu exemplo) =====
var cpuChart, ramChart, edgeChart, discoChart, nucChart;
var labels = ["10s","20s","30s","40s","50s","60s"];

function desenharCPU(serieCPU){
  destroyChart(cpuChart);
  cpuChart = new Chart(document.getElementById("graficoCPU"), {
    type: "line",
    data: { labels: labels,
      datasets: [{ label:"CPU", data:serieCPU, borderColor:"#22c55e",
        backgroundColor:"rgba(34,197,94,0.15)", borderWidth:2, fill:true }]
    },
    options:{ maintainAspectRatio:false, scales:{ y:{ beginAtZero:true } } }
  });
}
function desenharRAM(serieRAM){
  destroyChart(ramChart);
  ramChart = new Chart(document.getElementById("graficoRAM"), {
    type: "line",
    data: { labels: labels,
      datasets: [{ label:"RAM", data:serieRAM, borderColor:"#3b82f6",
        backgroundColor:"rgba(59,130,246,0.15)", borderWidth:2, fill:true }]
    },
    options:{ maintainAspectRatio:false, scales:{ y:{ beginAtZero:true } } }
  });
}
function desenharEDGE(env, rec){
  destroyChart(edgeChart);
  edgeChart = new Chart(document.getElementById("graficoEDGE"), {
    type: "line",
    data: { labels:["0","10","20","30","40","50"],
      datasets:[
        { label:"Bytes Enviados", data:env, borderColor:"#7c3aed", backgroundColor:"rgba(124,58,237,0.2)", fill:true },
        { label:"Bytes Recebidos", data:rec, borderColor:"#06b6d4", backgroundColor:"rgba(6,182,212,0.15)", fill:true }
      ]
    },
    options:{ maintainAspectRatio:false, scales:{ y:{ beginAtZero:true } } }
  });
}
function desenharDisco(discoEmUso){
  destroyChart(discoChart);
  var donut = [100 - discoEmUso, discoEmUso];
  discoChart = new Chart(document.getElementById("graficoDisco"), {
    type: "pie",
    data: { labels:["Disponível","Em uso"],
      datasets:[{ label:"Uso de Disco (%)", data:donut, backgroundColor:["#22c55e","#facc15"], borderColor:"#1e293b", borderWidth:2 }]
    },
    options:{ maintainAspectRatio:false, plugins:{ legend:{ position:"bottom", labels:{ color:"#fff" } } } }
  });
}
function desenharNucleos(nucleos){
  destroyChart(nucChart);
  var coreColors = [];
  for (var k=0; k<nucleos.length; k++) coreColors.push(nucleos[k] >= 75 ? "#ef4444" : "#9ca3af");
  nucChart = new Chart(document.getElementById("graficoNucleos"), {
    type:"bar",
    data:{ labels:["Núcleo 0","Núcleo 1","Núcleo 2","Núcleo 3","Núcleo 4","Núcleo 5","Núcleo 6","Núcleo 7"],
      datasets:[{ label:"Uso (%)", data:nucleos, backgroundColor:coreColors, borderColor:coreColors, borderWidth:1 }]
    },
    options:{ maintainAspectRatio:false, scales:{ y:{ beginAtZero:true, max:100 } } }
  });
}

// ===== TABELA =====
function preencherTabela(stats){
  var tbody = document.querySelector('#tabela-stats tbody'); if (!tbody) return;
  var html = '';
  for (var r=0; r<stats.length; r++){
    var s = stats[r][1];
    html += '<tr><td>' + stats[r][0] + '</td><td>' + s.std.toFixed(2) + '</td><td>' + s.variance.toFixed(2) + '</td></tr>';
  }
  tbody.innerHTML = html;
}

// ===== RENDER POR MÁQUINA =====
function renderMaquina(id){
  var d = MOCK[id] || MOCK["1"];

  // KPIs
  kpiCPU.innerHTML = d.kpi.cpu + '%';
  kpiRAM.innerHTML = d.kpi.ram + '%';
  kpiDisco.innerHTML = d.kpi.disco + '%';
  kpiEnv.innerHTML = d.kpi.env + ' MB';
  kpiRec.innerHTML = d.kpi.rec + ' MB';
  if (kpiUptime) kpiUptime.innerHTML = d.kpi.uptime || '';

  // Gráficos
  desenharCPU(d.serieCPU); desenharRAM(d.serieRAM); desenharEDGE(d.redeEnv, d.redeRec);
  desenharDisco(d.discoEmUso); desenharNucleos(d.nucleos);

  // Tabela
  preencherTabela([
    ["CPU", estatAmostra(d.serieCPU)],
    ["CPU por Núcleo", estatAmostra(d.nucleos)],
    ["RAM", estatAmostra(d.serieRAM)],
    ["Rede", estatAmostra(d.redeEnv)],
    ["Disco", estatAmostra([100 - d.discoEmUso, d.discoEmUso])]
  ]);

  // Badge
  aplicarBadge(d.novosAlertas || 0);
  try { localStorage.setItem('novosAlertas', String(d.novosAlertas || 0)); } catch(e){}
  try { localStorage.setItem('novosAlertas_maquina', String(id)); } catch(e){}
}

// ===== INICIAL =====
btnMaquinas.textContent = 'Máquina 1';
renderMaquina('1');
atualizarLayout();
