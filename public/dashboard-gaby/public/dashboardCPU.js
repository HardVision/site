// =============================
// MOCK API — dados simulados
// =============================
const selectMaquina = document.getElementById("selectMaquina");
const kpiUso = document.getElementById("kpiUso");
const kpiFreq = document.getElementById("kpiFreq");
const kpiProc = document.getElementById("kpiProc");
const tbodyPID = document.getElementById("tbodyPID");

let chartCPU, chartFreq, chartNucleos;

function criarGraficos() {
  const ctxCpu = document.getElementById("graficoCpu").getContext("2d");
  const ctxFreq = document.getElementById("graficoFreq").getContext("2d");
  const ctxNuc = document.getElementById("graficoNucleos").getContext("2d");

  chartCPU = new Chart(ctxCpu, {
    type: "line",
    data: {
      labels: Array(10).fill(""),
      datasets: [
        { label: "Uso (%)", data: [], borderColor: "#38bdf8", borderWidth: 3, tension: 0.35, pointRadius: 0 },
        { label: "Min", data: Array(10).fill(20), borderColor: "#10b981", borderDash:[6], borderWidth:1.5, pointRadius:0 },
        { label: "Ideal", data: Array(10).fill(60), borderColor: "#fbbf24", borderDash:[6], borderWidth:1.5, pointRadius:0 },
        { label: "Max", data: Array(10).fill(80), borderColor: "#ef4444", borderDash:[6], borderWidth:1.5, pointRadius:0 }
      ]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero:true, max:100 }, x:{ display:false } }
    }
  });

  chartFreq = new Chart(ctxFreq, {
    type: "line",
    data: {
      labels: Array(10).fill(""),
      datasets: [
        { label: "Frequência", data: [], borderColor: "#3b82f6", borderWidth: 3, tension: 0.35, pointRadius: 0 },
        { label: "Min", data: Array(10).fill(2.0), borderColor: "#10b981", borderDash:[6], borderWidth:1.5, pointRadius:0 },
        { label: "Ideal", data: Array(10).fill(3.0), borderColor: "#fbbf24", borderDash:[6], borderWidth:1.5, pointRadius:0 },
        { label: "Max", data: Array(10).fill(4.0), borderColor: "#ef4444", borderDash:[6], borderWidth:1.5, pointRadius:0 }
      ]
    },
    options: { maintainAspectRatio: false, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:false, max:5 }, x:{ display:false } } }
  });

  chartNucleos = new Chart(ctxNuc, {
    type: "bar",
    data: {
      labels: ["N1","N2","N3","N4","N5","N6","N7","N8"],
      datasets:[
        { label:"Uso por núcleo", data:[], backgroundColor:"#60a5fa", borderRadius:6 },
        { label:"Ideal", type:"line", data:Array(8).fill(65), borderColor:"#fbbf24", borderWidth:2, borderDash:[6], fill:false, pointRadius:0 },
        { label:"Max", type:"line", data:Array(8).fill(80), borderColor:"#ef4444", borderWidth:2, borderDash:[6], fill:false, pointRadius:0 }
      ]
    },
    options: { maintainAspectRatio:false, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, max:100 }, x:{ ticks:{ display:false } } } }
  });
}

async function fetchCPU() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        usoAtual: (40 + Math.random()*40).toFixed(1),
        frequencia: (2.8 + Math.random()*1.2).toFixed(2),
        processos: Math.floor(100 + Math.random()*120),
        historicoUso: Array.from({ length: 10 }, () => (20 + Math.random()*70).toFixed(1)),
        historicoFreq: Array.from({ length: 10 }, () => (2.5 + Math.random()).toFixed(2)),
        nucleos: Array.from({ length: 8 }, () => (30 + Math.random()*60).toFixed(1)),
        tabela: Array.from({ length: 6 }, (_,i)=>({ pid:1000+i, nome:`Processo_${i+1}`, uso:(Math.random()*25).toFixed(1) }))
      });
    }, 300);
  });
}

function atualizarKPIs(dados){
  kpiUso.textContent = dados.usoAtual+"%";
  kpiFreq.textContent = dados.frequencia;
  kpiProc.textContent = dados.processos;
}

function atualizarGraficos(dados){
  chartCPU.data.datasets[0].data = dados.historicoUso;
  chartCPU.update();
  chartFreq.data.datasets[0].data = dados.historicoFreq;
  chartFreq.update();
  chartNucleos.data.datasets[0].data = dados.nucleos;
  chartNucleos.update();
}

function atualizarTabela(dados){
  tbodyPID.innerHTML = "";
  dados.tabela.forEach(p=>{
    tbodyPID.innerHTML += `<tr><td>${p.pid}</td><td>${p.nome}</td><td>${p.uso}%</td></tr>`;
  });
}

async function atualizar(){
  const dados = await fetchCPU();
  atualizarKPIs(dados);
  atualizarGraficos(dados);
  atualizarTabela(dados);
}

criarGraficos();
atualizar();
setInterval(atualizar, 2000);

