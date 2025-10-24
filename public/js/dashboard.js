// checkboxes
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

// menu máquinas
var caixaMaquinas = document.getElementById('maquinas');
var btnMaquinas = document.getElementById('btn-maquinas');
var listaMaquinas = document.getElementById('menu-maquinas');
btnMaquinas.textContent = 'Máquina 1';
btnMaquinas.addEventListener('click', function (e) {
  e.stopPropagation();
  caixaMaquinas.classList.toggle('show');
  btnMaquinas.setAttribute('aria-expanded', caixaMaquinas.classList.contains('show'));
});
document.addEventListener('click', function () {
  caixaMaquinas.classList.remove('show');
  btnMaquinas.setAttribute('aria-expanded', 'false');
});
var itens = listaMaquinas.querySelectorAll('button');
for (var i = 0; i < itens.length; i++) {
  itens[i].addEventListener('click', function () {
    btnMaquinas.textContent = this.textContent;
    caixaMaquinas.classList.remove('show');
  });
}

// KPIs
document.getElementById('kpi_cpu').innerHTML = '58%';
document.getElementById('kpi_ram').innerHTML = '63%';
document.getElementById('kpi_disco').innerHTML = '76%';
document.getElementById('kpi_env').innerHTML = '152 MB';
document.getElementById('kpi_rec').innerHTML = '198 MB';

// dados
var serieCPU = [42, 55, 67, 59, 66, 58];
var serieRAM = [52, 57, 61, 64, 66, 63];
var redeEnv = [120, 132, 145, 160, 148, 162];
var discoEmUso = 76;
var discoLivre = 100 - discoEmUso;
var discoDonut = [discoLivre, discoEmUso];
var nucleos = [35, 78, 42, 55, 37, 82, 45, 76];

// helper
function estatAmostra(arr) {
  var n = arr.length;
  var soma = 0;
  for (var i = 0; i < n; i++) soma += arr[i];
  var media = soma / n;
  var somaVar = 0;
  for (var j = 0; j < n; j++) somaVar += Math.pow(arr[j] - media, 2);
  var variancia = somaVar / (n - 1);
  return { std: Math.sqrt(variancia), variance: variancia };
}

// gráficos (padrão simples da doc do Chart.js)
new Chart(document.getElementById("graficoCPU"), {
  type: "line",
  data: { labels: ["10s","20s","30s","40s","50s","60s"],
    datasets: [{ label:"CPU", data: serieCPU, borderColor:"#22c55e", backgroundColor:"rgba(34,197,94,0.15)", borderWidth:2, fill:true }]
  },
  options:{ maintainAspectRatio:false, scales:{ y:{ beginAtZero:true } } }
});

new Chart(document.getElementById("graficoRAM"), {
  type: "line",
  data: { labels:["10s","20s","30s","40s","50s","60s"],
    datasets:[{ label:"RAM", data: serieRAM, borderColor:"#3b82f6", backgroundColor:"rgba(59,130,246,0.15)", borderWidth:2, fill:true }]
  },
  options:{ maintainAspectRatio:false, scales:{ y:{ beginAtZero:true } } }
});

new Chart(document.getElementById("graficoEDGE"), {
  type:"line",
  data:{ labels:["0","10","20","30","40","50"],
    datasets:[
      { label:"Bytes Enviados", data: redeEnv, borderColor:"#7c3aed", backgroundColor:"rgba(124,58,237,0.2)", fill:true },
      { label:"Bytes Recebidos", data:[100,118,126,140,135,150], borderColor:"#06b6d4", backgroundColor:"rgba(34,99,197,0.15)", fill:true }
    ]
  },
  options:{ maintainAspectRatio:false, scales:{ y:{ beginAtZero:true } } }
});

new Chart(document.getElementById("graficoDisco"), {
  type: "pie",
  data: { labels: ["Disponível", "Em uso"],
    datasets: [{ label: "Uso de Disco (%)", data: discoDonut, backgroundColor: ["#22c55e", "#facc15"], borderColor: "#1e293b", borderWidth: 2 }]
  },
  options: { maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { color: "#fff" } } } }
});

// cores dos núcleos (cinza < 75, vermelho >= 75) sem .map()
var coreColors = [];
for (var k = 0; k < nucleos.length; k++) {
  coreColors.push(nucleos[k] >= 75 ? "#ef4444" : "#9ca3af");
}
new Chart(document.getElementById("graficoNucleos"), {
  type:"bar",
  data:{ labels:["Núcleo 0","Núcleo 1","Núcleo 2","Núcleo 3","Núcleo 4","Núcleo 5","Núcleo 6","Núcleo 7"],
    datasets:[{ label:"Uso (%)", data:nucleos, backgroundColor: coreColors, borderColor: coreColors, borderWidth:1 }]
  },
  options:{ maintainAspectRatio:false, scales:{ y:{ beginAtZero:true, max:100 } } }
});

// tabela: linhas com for (sem .map)
var statsData = [
  ["CPU", estatAmostra(serieCPU)],
  ["RAM", estatAmostra(serieRAM)],
  ["Rede – Env (Mbps)", estatAmostra(redeEnv)],
  ["Disco – (Disponível/Em uso) (%)", estatAmostra(discoDonut)],
  ["CPU por Núcleo (%)", estatAmostra(nucleos)]
];

var tbody = document.querySelector('#tabela-stats tbody');
var htmlLinhas = "";
for (var r = 0; r < statsData.length; r++) {
  var nome = statsData[r][0];
  var s = statsData[r][1];
  htmlLinhas += '<tr><td>' + nome + '</td><td>' + s.std.toFixed(2) + '</td><td>' + s.variance.toFixed(2) + '</td></tr>';
}
tbody.innerHTML = htmlLinhas;

// aplica visibilidade inicial
atualizarLayout();
