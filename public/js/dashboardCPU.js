
const selectMaquina = document.getElementById("selectMaquina");

const kpiUso = document.getElementById("kpiUso");
const kpiFreq = document.getElementById("kpiFreq");
const kpiProc = document.getElementById("kpiProc");

let chartCPU, chartFreq, chartNucleos;


// 1. CRIAR GRÁFICOS (SEM DADOS)

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

  //  Frequência da CPU (linha)
  /*chartFreq = new Chart(document.getElementById("graficoFreq"), {
    type: "line",
    data: {
      labels: Array(20).fill(""),
      datasets: [
        { label: "Frequência (GHz)", data: [], borderColor: "#3b82f6", borderWidth: 3, tension: 0.35, pointRadius: 0 }
      ]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: false }, x: { display: false } }
    }
  });*/

  //  Núcleos (colunas)
  chartNucleos = new Chart(document.getElementById("graficoNucleos"), {
    type: "bar",
    data: {
      labels: [],   // vamos preencher com N1, N2, N3...
      datasets: [
        {
          label: "Uso por núcleo (%)",
          data: [],
          backgroundColor: "#60a5fa",
          borderRadius: 6
        },
        {
          label: "Ideal",
          type: "line",
          data: [],
          borderColor: "#fbbf24",
          borderWidth: 2,
          borderDash: [6],
          fill: false,
          pointRadius: 0
        },
        {
          label: "Max",
          type: "line",
          data: [],
          borderColor: "#ef4444",
          borderWidth: 2,
          borderDash: [6],
          fill: false,
          pointRadius: 0
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

// CHAMAndo O BACKEND

// Uso total da CPU + histórico
async function fetchUsoCPU(idMaquina) {
  const res = await fetch(`/dashboard/cpu/uso/${idMaquina}`);
  return res.json();
}

// Frequência atual + histórico
async function fetchFrequencia(idMaquina) {
  const res = await fetch(`/dashboard/cpu/frequencia/${idMaquina}`);
  return res.json();
}

// Uso por núcleo
async function fetchNucleos(idMaquina) {
  const res = await fetch(`/dashboard/cpu/nucleos/${idMaquina}`);
  return res.json();
}


// 3. ATUALIZAR KPIs
function atualizarKPIs(dadosUso, dadosFreq) {
  kpiUso.textContent = dadosUso.usoAtual + "%";
  kpiFreq.textContent = dadosFreq.frequenciaAtual + " GHz";
  kpiProc.textContent = dadosUso.processos || "-";
}



// 4. ATUALIZAR OS GRÁFICOS
function atualizarGraficoUso(dados) {
  chartCPU.data.datasets[0].data = dados.historico;
  chartCPU.update();
}
/*
function atualizarGraficoFreq(dados) {
  chartFreq.data.datasets[0].data = dados.historico;
  chartFreq.update();
}*/

function atualizarGraficoNucleos(lista) {

  const labels = lista.map((_, i) => `N${i + 1}`);
  const valores = lista.map(n => n.uso);

  chartNucleos.data.labels = labels;
  chartNucleos.data.datasets[0].data = valores;

  // linhas de limites e minimos / máximas
  chartNucleos.data.datasets[1].data = Array(lista.length).fill(65);
  chartNucleos.data.datasets[2].data = Array(lista.length).fill(80);

  chartNucleos.update();
}



// 5. LOOP PRINCIPAL (ATUALIZAÇÃO AUTOMÁTICA)
async function atualizar() {

  const idMaquina = selectMaquina.value;

  if (!idMaquina) return;

  try {
    const [usoCPU, frequencia, nucleos] = await Promise.all([
      fetchUsoCPU(idMaquina),
      fetchFrequencia(idMaquina),
      fetchNucleos(idMaquina)
    ]);

    // PEGAR APENAS O MAIS RECENTE DE CADA NÚCLEOo
 
    const ultimo = {};

    nucleos.forEach(linha => {
      if (!ultimo[linha.nucleo]) {
        // como o backend já manda ordenado por dtHora DESC,
        // a primeira ocorrência é sempre a mais recente!!!!!!  
        ultimo[linha.nucleo] = linha;
      }
    });

    //  para os gráficos
    const nucleosFiltrados = Object.values(ultimo);

    // ATUALIZAÇÕES
    atualizarKPIs(usoCPU, frequencia);
    atualizarGraficoUso(usoCPU);
    /*atualizarGraficoFreq(frequencia);*/

    atualizarGraficoNucleos(nucleosFiltrados);

  } catch (erro) {
    console.error("Erro ao atualizar dashboard:", erro);
  }
}


criarGraficos();
setInterval(atualizar, 3000);
//selectMaquina.addEventListener("change", atualizar);??atualiza opção de maquina
