
const selectMaquina = document.getElementById("selectMaquina");

const kpiUso = document.getElementById("kpiUso");
/*const kpiFreq = document.getElementById("kpiFreq");*/
const kpiProc = document.getElementById("kpiProc");

let chartCPU, chartNucleos; //chartFreq,
const idMaquina = 1; // ou pegar dinamicamente do select
fetch(`/dashboard/cpu/nucleos/${idMaquina}`)
    .then(res => res.json())
    .then(dados => {
        // dados vem como array de objetos: [{nucleo:"CPU Núcleo 0", valor:23}, ...]
        atualizarGraficoNucleos(dados);
    })
    .catch(err => console.error("Erro ao buscar núcleos:", err));


// 1. CRIAR GRÁFICOS c/ 

function criarGraficos() {
  //  Uso da CPU (linha)
  chartCPU = new Chart(document.getElementById("graficoCpu"), {
    type: "line",
    data: {
      labels: Array(20).fill(""),
      datasets: [
        { label: "Uso (%)", data: [], borderColor: "#38bdf8", borderWidth: 3, tension: 0.35, pointRadius: 0 },
        { label: "Min", data: Array(20).fill(20), borderColor: "#10b981", borderDash: [6], borderWidth: 1.5, pointRadius: 0 },
        { label: "Ideal", data: Array(20).fill(60), borderColor: "#fbbf24", borderDash: [6], borderWidth: 1.5, pointRadius: 0 },
        { label: "Max", data: Array(20).fill(80), borderColor: "#ef4444", borderDash: [6], borderWidth: 1.5, pointRadius: 0 }
      ]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, max: 100 }, x: { display: false } }
    }
  });

  //  Núcleos (colunas)
  const ctx = document.getElementById("chartNucleos").getContext("2d");
  chartNucleos = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [], // preenchido dinamicamente
      datasets: [//serem preenchidos dinamicamente.
        {
          label: "Uso CPU por núcleo (%)",
          data: [],
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1
        },
        {
          label: "Ideal",
          type: "line",
          data: [], // será preenchido dinamicamente
          borderColor: "#fbbf24",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          tension: 0.35
        },
        {
          label: "Max",
          type: "line",
          data: [], // será preenchido dinamicamente
          borderColor: "#ef4444",
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          tension: 0.35
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, max: 100 } }
    }
  });
}
/*
selectMaquina.addEventListener("change", () => {
    // Limpa os gráficos antes de atualizar
    chartCPU.data.datasets[0].data = [];
    chartNucleos.data.labels = [];
    chartNucleos.data.datasets.forEach(ds => ds.data = []);
    chartCPU.update();
    chartNucleos.update();

    // Chama atualização para a nova máquina
    atualizar();
});*/// limpa os gráficos e atualiza os dados da nova máquina.


// CHAMAndo O BACKEND

// Uso total da CPU + histórico
async function fetchUsoCPU(idMaquina) {
  const res = await fetch(`/dashboard/cpu/uso/${idMaquina}`);
  return res.json();
}
/*
// Frequência atual + histórico
async function fetchFrequencia(idMaquina) {
  const res = await fetch(`/dashboard/cpu/frequencia/${idMaquina}`);
  return res.json();
}*/

// Uso por núcleo
async function fetchNucleos(idMaquina) {
  const res = await fetch(`/dashboard/cpu/nucleos/${idMaquina}`);
  return res.json();
}


// ATUALIZAR KPIs
function atualizarKPIs(dadosUso, nucleos) {
  // CPU total mais recente
  kpiUso.textContent = dadosUso.usoAtual + "%";

  // Processos atuais
  kpiProc.textContent = dadosUso.processos || "-";

  // Núcleos críticos — apenas últimos valores
  const nucleosCriticos = nucleos.filter(n => n.valor > 80).length;
  document.getElementById("kpiNucleosCriticos").textContent = nucleosCriticos;
}

// ATUALIZAR OS GRÁFICOS
function atualizarGraficoUso(dados) {
  chartCPU.data.datasets[0].data = dados.historico;
  chartCPU.update();
}
/*
function atualizarGraficoFreq(dados) {
  chartFreq.data.datasets[0].data = dados.historico;
  chartFreq.update();
}*/

function atualizarGraficoNucleos(dados) {
  const valores = dados.map(n => n.valor);   // últimos valores
  const labels = dados.map(n => n.nucleo);

  chartNucleos.data.labels = labels;
  chartNucleos.data.datasets[0].data = valores;
  chartNucleos.data.datasets[1].data = Array(labels.length).fill(65); // ideal
  chartNucleos.data.datasets[2].data = Array(labels.length).fill(80); // max

  chartNucleos.update();

  // KPI de núcleos críticos atualizado também aqui, se quiser
  const nucleosCriticos = valores.filter(v => v > 80).length;
  document.getElementById("kpiNucleosCriticos").textContent = nucleosCriticos;
}





//  LOOP PRINCIPAL (ATUALIZAÇÃO AUTOMÁTICA)
async function atualizar() {
  const idMaquina = selectMaquina.value || 1; // fallback para 1
  if (!idMaquina) return;

  try {
    const [usoCPU, nucleos] = await Promise.all([
      fetchUsoCPU(idMaquina),
      fetchNucleos(idMaquina)
    ]);

    // Filtra apenas os últimos valores de cada núcleo
    const nucleosRecentes = [];
    for (let i = 1; i <= 8; i++) {
        const nucleo = nucleos.find(n => n.nucleo === `CPU Núcleo ${i}`);
        nucleosRecentes.push({ nucleo: `CPU Núcleo ${i}`, valor: nucleo ? nucleo.uso : 0 });
    }

    // Atualiza KPIs e gráficos com os valores recentes
    atualizarKPIs(usoCPU, nucleosRecentes);
    atualizarGraficoUso(usoCPU);         
    atualizarGraficoNucleos(nucleosRecentes);

  } catch (erro) {
    console.error("Erro ao atualizar dashboard:", erro);
  }
}


criarGraficos();
setInterval(atualizar, 3000);
//selectMaquina.addEventListener("change", atualizar);??atualiza opção de maquina
