
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
  // CPU TOTAL (%)
chartCPU = new Chart(document.getElementById("graficoCpu"), {
    type: "line",
    data: {
        labels: Array(20).fill(""),
        datasets: [
            {
                label: "Uso (%)",
                data: [],
                borderColor: "#3b82f6",
                borderWidth: 3,
                pointRadius: 0,
                tension: 0.35
            },
            {
                label: "Ideal",
                data: Array(20).fill(60),
                borderColor: "#f59e0b",
                borderWidth: 2,
                borderDash: [6],
                pointRadius: 0,
                tension: 0.35
            },
            {
                label: "Máximo",
                data: Array(20).fill(80),
                borderColor: "#ef4444",
                borderWidth: 2,
                borderDash: [6],
                pointRadius: 0,
                tension: 0.35
            }
        ]
    },
    options: {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { beginAtZero: true, max: 100 },
            x: { display: false }
        }
    }
});


  //  Núcleos (colunas)
  const ctx = document.getElementById("chartNucleos").getContext("2d");
  // CPU POR NÚCLEO
chartNucleos = new Chart(document.getElementById("chartNucleos"), {
    type: "bar",
    data: {
        labels: [],
        datasets: [
            {
                label: "Uso (%)",
                data: [],
                backgroundColor: "rgba(59, 130, 246, 0.65)",
                borderColor: "rgba(59, 130, 246, 1)",
                borderWidth: 1
            },
            {
                label: "Ideal",
                type: "line",
                data: [],
                borderColor: "#f59e0b",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.35
            },
            {
                label: "Máximo",
                type: "line",
                data: [],
                borderColor: "#ef4444",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.35
            }
        ]
    },
    options: {
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, max: 100 }
        }
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
function atualizarGraficoUso(dados) {//cpu
    chartCPU.data.datasets[0].data = dados.historico.slice(-20);
    chartCPU.update();
}

/*
function atualizarGraficoFreq(dados) {
  chartFreq.data.datasets[0].data = dados.historico;
  chartFreq.update();
}*/

function atualizarGraficoNucleos(dados) {
    const labels = dados.map(n => `${n.nucleo}`);//LEGENDA DO NUCLEO
    const valores = dados.map(n => n.valor);

    chartNucleos.data.labels = labels;

    // Uso por núcleo (barras)
    chartNucleos.data.datasets[0].label = "Uso (%)";
    chartNucleos.data.datasets[0].data = valores;
    chartNucleos.data.datasets[0].backgroundColor = "rgba(59, 130, 246, 0.65)";
    chartNucleos.data.datasets[0].borderColor = "rgba(59, 130, 246, 1)";

    // Linha Ideal (60%) — igual ao gráfico CPU
    chartNucleos.data.datasets[1].label = "Ideal (60%)";
    chartNucleos.data.datasets[1].data = Array(labels.length).fill(60);
    chartNucleos.data.datasets[1].borderColor = "#f59e0b";
    chartNucleos.data.datasets[1].borderWidth = 2;
    chartNucleos.data.datasets[1].borderDash = [6];
    chartNucleos.data.datasets[1].tension = 0.35;
    chartNucleos.data.datasets[1].pointRadius = 0;

    // Linha Máximo (80%) — igual ao gráfico CPU
    chartNucleos.data.datasets[2].label = "Máximo (80%)";
    chartNucleos.data.datasets[2].data = Array(labels.length).fill(80);
    chartNucleos.data.datasets[2].borderColor = "#ef4444";
    chartNucleos.data.datasets[2].borderWidth = 2;
    chartNucleos.data.datasets[2].borderDash = [6];
    chartNucleos.data.datasets[2].tension = 0.35;
    chartNucleos.data.datasets[2].pointRadius = 0;

    chartNucleos.update();
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
 const nucleosRecentes = nucleos.map(n => ({
    nucleo: n.nucleo,
    valor: n.valor ?? n.uso ?? 0
}));


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
