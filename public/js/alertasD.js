

// ============================
// Elementos da página (checados)
// ============================
const painel = document.getElementById('painel-alertas');
const listaEl = document.getElementById('lista');
const contadorEl = document.getElementById('contador');

const caixaMaquinas = document.getElementById('maquinas');
const btnMaquinas = document.getElementById('btn-maquinas');
const listaMaquinas = document.getElementById('menu-maquinas');

const selectPeriodo = document.getElementById('periodo');
const inputBusca = document.getElementById('busca');
const btnLimpar = document.getElementById('btn-limpar');
var graficoLinha = null;
var graficoBarra = null;


// ============================
// Estado dos filtros
// ============================
let maquinaFiltro = 1;
let periodoFiltro = selectPeriodo ? selectPeriodo.value : '30d';
let termoFiltro = '';

// safety: se elemento não existir, ignora interações
if (!listaEl || !contadorEl) {
  console.error('Elementos principais não encontrados: #lista ou #contador');
}

// ============================
// Renderização da lista (otimizada)
// ============================
let lastRenderHash = '';
let lastRefreshAt = 0;

async function renderSlctMaquinas() {
  const resposta = await fetch(`/dashboard/select-maquina/${sessionStorage.EMPRESA}`);
  const maquinas = await resposta.json();
  console.log("Máquinas da empresa: ", maquinas)
  cont = 0;

  maquinas.forEach(maquina => {
    const select = document.getElementById("select-maquinas")

    cont++;
    select.innerHTML += `
            <option value="${maquina.idMaquina}">Máquina ${cont}</option>
        `;

  });

}

async function renderizarAlertas() {
  const select = document.getElementById("select-maquinas");

  let resposta;

  if (select.value !== "") {
    resposta = await fetch(`/dashboard/alertas-card/${sessionStorage.EMPRESA}?maquina=${select.value}`);
  }
  else {
    resposta = await fetch(`/dashboard/alertas-card/${sessionStorage.EMPRESA}`);
  }

  var alertas = [];
  try {
    alertas = await resposta.json();

    const lista = document.getElementById("lista");
    lista.innerHTML = ""; // limpa antes de renderizar

    alertas.forEach(alerta => {
      const card = document.createElement("div");
      card.classList.add("alerta");

      // Classe do nível
      let classeNivel = "nivel-value";
      if (alerta.estado === "Preocupante") classeNivel += " alto";
      else if (alerta.estado === "Crítico") classeNivel += " medio";

      card.innerHTML = `
            <div class="head">
                <div class="tipo">${alerta.tipoComponente}</div>

                <div class="nivel-value ${alerta.estado === "Crítico" ? "" : "alto"}">
                    ${alerta.estado.toUpperCase()}
                </div>
            </div>

            <div class="texto">
                ${alerta.descricao}
            </div>

            <div class="maquina">
                Máquina ${alerta.idMaquina}: ${alerta.macAddress}
            </div>

            <div class="info">
                <div class="data">${alerta.dtHora}</div>
            </div>
        `;

      lista.appendChild(card);
    });
  } catch (e) {
    const card = document.createElement("div");
    card.innerHTML = "";
     lista.innerHTML = "";
  }

  // Atualiza contador total
  document.getElementById("contador").innerText = `${alertas.length} alertas`;
}

async function renderGraficos() {
  console.log("Gráfico de linha: ", graficoLinha)
  console.log("Gráfico de Barra: ", graficoBarra)

  const select = document.getElementById("select-maquinas");

  let resposta;
  let respostaBarra;

  if (select.value !== "") {
    resposta = await fetch(`/dashboard/alertas-linha/${sessionStorage.EMPRESA}?maquina=${select.value}`);
    respostaBarra = await fetch(`/dashboard/alertas-barra/${sessionStorage.EMPRESA}?maquina=${select.value}`);
  } else {
    resposta = await fetch(`/dashboard/alertas-linha/${sessionStorage.EMPRESA}`);
    respostaBarra = await fetch(`/dashboard/alertas-barra/${sessionStorage.EMPRESA}`);
  }


  let dados = [];
  let dadosBarra = [];

  try {
    const respostaJson = await resposta.text();
    dados = respostaJson ? JSON.parse(respostaJson) : [];
  } catch (e) {
    dados = [];
  }

  try {
    const respostaBarraJson = await respostaBarra.text();
    dadosBarra = respostaBarraJson ? JSON.parse(respostaBarraJson) : [];
  } catch (e) {
    dadosBarra = [];
  }

  const dadosOrdenado = dadosBarra.sort((a, b) => Number(b.totalAlertas) - Number(a.totalAlertas));
  console.log(dadosOrdenado[0])

  kpiComp.innerHTML = dadosOrdenado[0].tipoComponente;
  const totalCriticos = dados
    .filter(item => item.estado === "Crítico")
    .reduce((acumulador, item) => acumulador + Number(item.total_alertas), 0);


  const totalAlertas = dados
    .reduce((acc, item) => acc + Number(item.total_alertas), 0);
  kpiCrit.innerHTML = totalAlertas;

  // Cálculo da taxa (%)
  const taxaCriticos = totalAlertas > 0
    ? ((totalCriticos / totalAlertas) * 100).toFixed(1)
    : 0;

  // Exibir na KPI
  kpiTaxaCrit.innerHTML = `${taxaCriticos}%`;

  const diasUnicos = [...new Set(dados.map(item => item.dia_mes))];

  // Quantidade de dias distintos
  const qtdDias = diasUnicos.length;

  // Média de alertas por dia
  const mediaPorDia = qtdDias > 0
    ? (totalAlertas / qtdDias).toFixed(1)
    : 0;

  // Exibir na KPI
  kpiMeida.innerHTML = mediaPorDia;




  console.log("Dados linha recebidos:", dados);

  // --- Transformar dados do formato:
  // { dia_mes, estado, total_alertas }
  // em arrays separados para cada categoria


  const criticos = diasUnicos.map(dia => {
    const item = dados.find(x => x.dia_mes === dia && x.estado === "Crítico");
    return item ? Number(item.total_alertas) : 0;
  });

  const preocupantes = diasUnicos.map(dia => {
    const item = dados.find(x => x.dia_mes === dia && x.estado === "Preocupante");
    return item ? Number(item.total_alertas) : 0;
  });

  // Limitar aos últimos 7 dias
  const labelsLimitados = diasUnicos.slice(-7);
  const criticosLimitados = criticos.slice(-7);
  const preocupantesLimitados = preocupantes.slice(-7);

  // ==============================
  // 2. Criar datasets do gráfico
  // ==============================
  const dataLinha = {
    labels: labelsLimitados,
    datasets: [
      {
        label: "Crítico",
        data: criticosLimitados,
        fill: false,
        tension: 0.3,
        borderWidth: 2,
        borderColor: "red"
      },
      {
        label: "Preocupante",
        data: preocupantesLimitados,
        fill: false,
        tension: 0.3,
        borderWidth: 2,
        borderColor: "orange"
      }
    ]
  };

  // ==============================
  // 3. Configurações do gráfico
  // (mantido tudo que você pediu)
  // ==============================
  const configLinha = {
    type: 'line',
    data: dataLinha,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { bottom: 20 }
      },
      plugins: {
        legend: { labels: { font: { size: 11 } } }
      },
      scales: {
        x: {
          ticks: {
            font: { size: 11 },
            maxRotation: 30,
            minRotation: 30
          }
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, font: { size: 11 } }
        }
      }
    }
  };

  // ==============================
  // 4. Renderizar gráfico de linha
  // ==============================
  const ctxLinha = document.getElementById("graficoLinha").getContext("2d");
  if (graficoLinha) {
    console.log("Atualizando valor dos gráficos de linha")
    graficoLinha.data = dataLinha;
    graficoLinha.update();
  } else {
    graficoLinha = new Chart(ctxLinha, configLinha);
  }



  // ========================================================
  // 5. GRÁFICO DE BARRAS — usando dados reais do backend
  // ========================================================

  // Ordenar tipos fixos para manter padrão visual
  const ordemTipos = ["CPU", "RAM", "Disco", "Rede"];

  // Montar os labels conforme dados recebidos
  const labelsBarra = ordemTipos;

  // Criar array de dados preenchidos na ordem certa
  const valoresBarra = ordemTipos.map(tipo => {
    const item = dadosBarra.find(x => x.tipoComponente === tipo);
    return item ? Number(item.totalAlertas) : 0;
  });

  console.log("Valores para gráfico de barra:", valoresBarra);

  // Construir gráfico
  const dataBar = {
    labels: labelsBarra,
    datasets: [{
      label: 'Quantidade de Alertas',
      data: valoresBarra,
      borderWidth: 1
    }]
  };

  const configBar = {
    type: 'bar',
    data: dataBar,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { bottom: 20 }
      },
      plugins: {
        legend: { labels: { font: { size: 11 } } }
      },
      scales: {
        x: {
          ticks: {
            font: { size: 11 },
            maxRotation: 30,
            minRotation: 30
          }
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, font: { size: 11 } }
        }
      }
    }
  };

  const ctxBar = document.getElementById("graficoBarra").getContext("2d");
  if (graficoBarra) {
    console.log("Atualizando valor dos gráficos de barra")
    graficoBarra.data = dataBar;
    graficoBarra.update();
  } else {
    graficoBarra = new Chart(ctxBar, configBar);
  }

}

const dadosAnalise = {
  probAlertasComponente: {
    "Rede": 0.45,
    "Energia": 0.25,
    "CPU": 0.15,
    "Disco": 0.15
  },
  matrizMarkov: [
    [0.7, 0.2, 0.1], // de Saudável para [Saudável, Preocupante, Crítico]
    [0.3, 0.5, 0.2], // de Preocupante para [...]
    [0.1, 0.4, 0.5]  // de Crítico para [...]
  ],
  estados: ["Saudável", "Preocupante", "Crítico"]
};


function renderStatsProb(dados) {
  const container = document.getElementById("statsProb");
  container.innerHTML = ""; // limpa conteúdo

  // --- Probabilidade de alerta por componente ---
  const tituloComp = document.createElement("h4");
  tituloComp.textContent = "Probabilidade de Alerta por Componente";
  container.appendChild(tituloComp);

  const tabelaComp = document.createElement("table");
  tabelaComp.classList.add("tabela-prob-comp");

  // Cabeçalho tabela
  const theadComp = document.createElement("thead");
  theadComp.innerHTML = `<tr><th>Componente</th><th>Probabilidade</th></tr>`;
  tabelaComp.appendChild(theadComp);

  // Corpo tabela
  const tbodyComp = document.createElement("tbody");
  for (const [comp, prob] of Object.entries(dados.probAlertasComponente)) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${comp}</td><td>${(prob * 100).toFixed(2)}%</td>`;
    tbodyComp.appendChild(tr);
  }
  tabelaComp.appendChild(tbodyComp);
  container.appendChild(tabelaComp);


  // --- Matriz de Markov ---
  const tituloMarkov = document.createElement("h4");
  tituloMarkov.textContent = "Matriz de Transição (Cadeia de Markov)";
  container.appendChild(tituloMarkov);

  const tabelaMarkov = document.createElement("table");
  tabelaMarkov.classList.add("tabela-markov");

  // Cabeçalho tabela Markov
  const theadMarkov = document.createElement("thead");
  let headerHtml = "<tr><th>De \\ Para</th>";
  dados.estados.forEach(estado => headerHtml += `<th>${estado}</th>`);
  headerHtml += "</tr>";
  theadMarkov.innerHTML = headerHtml;
  tabelaMarkov.appendChild(theadMarkov);

  // Corpo tabela Markov
  const tbodyMarkov = document.createElement("tbody");
  dados.matrizMarkov.forEach((linha, i) => {
    let rowHtml = `<tr><td>${dados.estados[i]}</td>`;
    linha.forEach(prob => {
      rowHtml += `<td>${(prob * 100).toFixed(2)}%</td>`;
    });
    rowHtml += "</tr>";
    tbodyMarkov.innerHTML += rowHtml;
  });
  tabelaMarkov.appendChild(tbodyMarkov);
  container.appendChild(tabelaMarkov);
}



// Renderiza pela primeira vez
renderGraficos();
renderizarAlertas();
renderSlctMaquinas();
renderStatsProb(dadosAnalise);
// Atualiza tudo a cada 2 segundos
setInterval(() => {
  console.log("Renderizando os gráficos novamente")
  renderGraficos();
  renderizarAlertas();
}, 2000);