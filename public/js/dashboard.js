// === Checkboxes e seções ===
var cbCPU = document.getElementById('cb_cpu');
var cbRAM = document.getElementById('cb_ram');
var cbRede = document.getElementById('cb_rede');
var cbDisco = document.getElementById('cb_disco');

// Marcar todas por padrão
cbCPU.checked = true;
cbRAM.checked = true;
cbRede.checked = true;
cbDisco.checked = true;

var secCPU = document.getElementById('sec-cpu');
var secRAM = document.getElementById('sec-ram');
var secRede = document.getElementById('sec-rede');
var secDisco = document.getElementById('sec-disco');

function atualizarLayout() {
  secCPU.style.display = cbCPU.checked ? '' : 'none';
  secRAM.style.display = cbRAM.checked ? '' : 'none';
  secRede.style.display = cbRede.checked ? '' : 'none';
  secDisco.style.display = cbDisco.checked ? '' : 'none';
}
cbCPU.onchange = atualizarLayout;
cbRAM.onchange = atualizarLayout;
cbRede.onchange = atualizarLayout;
cbDisco.onchange = atualizarLayout;

// === KPIs mockados ===
document.getElementById('kpi_cpu').innerHTML = '58%';
document.getElementById('kpi_ram').innerHTML = '63%';
document.getElementById('kpi_disco').innerHTML = '76%';

// === GRÁFICO CPU ===
var ctxCPU = document.getElementById("graficoCPU");
new Chart(ctxCPU, {
  type: "line",
  data: {
    labels: ["10s","20s","30s","40s","50s","60s"],
    datasets: [{
      label:"CPU",
      data:[42,55,67,59,66,58],
      borderColor:"#3b82f6",
      borderWidth:2,
      fill:true,
      backgroundColor:"rgba(59,130,246,0.15)"
    }]
  },
  options:{
    maintainAspectRatio:false,
    scales:{ y:{ beginAtZero:true } }
  }
});

// === GRÁFICO RAM ===
var ctxRAM = document.getElementById("graficoRAM");
new Chart(ctxRAM, {
  type: "line",
  data: {
    labels:["10s","20s","30s","40s","50s","60s"],
    datasets:[{
      label:"RAM",
      data:[52,57,61,64,66,63],
      borderColor:"#22c55e",
      borderWidth:2,
      fill:true,
      backgroundColor:"rgba(34,197,94,0.15)"
    }]
  },
  options:{
    maintainAspectRatio:false,
    scales:{ y:{ beginAtZero:true } }
  }
});

// === GRÁFICO EDGE ===
var ctxEDGE = document.getElementById("graficoEDGE");
new Chart(ctxEDGE, {
  type:"line",
  data:{
    labels:["0","10","20","30","40","50"],
    datasets:[{
      label:"Throughput EDGE (Mbps)",
      data:[110,125,132,148,142,158],
      borderColor:"#38bdf8",
      borderWidth:2,
      fill:true,
      backgroundColor:"rgba(56,189,248,0.15)"
    }]
  },
  options:{
    maintainAspectRatio:false,
    scales:{ y:{ beginAtZero:true } }
  }
});

// === GRÁFICO DE DISCO (PIE COM ROTAÇÃO SUAVE) ===
var ctxDisco = document.getElementById("graficoDisco");
let angulo = 0;
const discoChart = new Chart(ctxDisco, {
  type: "pie",
  data: {
    labels: ["Sistema", "Logs", "Backup"],
    datasets: [{
      label: "Uso de Disco (%)",
      data: [48, 28, 24],
      backgroundColor: ["#f87171", "#facc15", "#22c55e"],
      borderColor: "#1e293b",
      borderWidth: 2
    }]
  },
  options: {
    maintainAspectRatio: false,
    rotation: angulo,
    animation: { duration: 0 },
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#fff", font: { size: 12 } }
      }
    }
  }
});

// rotação contínua leve
setInterval(() => {
  angulo += 0.01;
  discoChart.options.rotation = angulo;
  discoChart.update();
}, 50);

// Recalibra Chart.js ao redimensionar
window.addEventListener('resize', () => {
  Chart.helpers.each(Chart.instances, function(instance) {
    instance.resize();
  });
});

atualizarLayout();