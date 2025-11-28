
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


let maquinaFiltro = 1;
let periodoFiltro = selectPeriodo ? selectPeriodo.value : '30d';
let termoFiltro = '';

// safety: se elemento não existir, ignora interações
if (!listaEl || !contadorEl) {
  console.error('Elementos principais não encontrados: #lista ou #contador');
}

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

async function renderizarKpis() {
  const select = document.getElementById("select-maquinas");

  let resposta;

  if (select.value !== "") {
    resposta = await fetch(`/dashboard/alertas-kpi/${sessionStorage.EMPRESA}?maquina=${select.value}`);
  } else {
    resposta = await fetch(`/dashboard/alertas-kpi/${sessionStorage.EMPRESA}`);
  }

  if (!resposta.ok) {
    console.error("Erro ao buscar KPIs");
    return;
  }

  const dados = await resposta.json();
  console.log(dados)

  document.getElementById("kpiTaxaCrit").innerHTML = dados.taxaCriticosPercent;
  document.getElementById("kpiTotal").innerHTML = dados.totalAlertas;
  document.getElementById("kpiMeida").innerHTML = Math.round(dados.mediaPorDia);
  document.getElementById("kpiComp").innerHTML = dados.componenteMaisAlertas || "—";
  document.getElementById("kpiPeriodoMaiorRisco").innerHTML = `${dados.periodoMaiorRisco}hrs` || "—";
  document.getElementById("kpiPrevisaoCriticos").innerHTML = `${Math.round(dados.previsao)}` || "—";
  document.getElementById("kpiProbabilidadeCriticos").innerHTML = `${Number(dados.probCriticoGeral * 100).toFixed(2)}%` || "—";

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

  const diasUnicos = [...new Set(dados.map(item => item.dia_mes))];

  // Quantidade de dias distintos
  const qtdDias = diasUnicos.length;





  console.log("Dados linha recebidos:", dados);

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


  const ctxLinha = document.getElementById("graficoLinha").getContext("2d");
  if (graficoLinha) {
    console.log("Atualizando valor dos gráficos de linha")
    graficoLinha.data = dataLinha;
    graficoLinha.update();
  } else {
    graficoLinha = new Chart(ctxLinha, configLinha);
  }



  const ordemTipos = ["CPU", "RAM", "Disco", "Rede"];


  const labelsBarra = ordemTipos;

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

function capitalize(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

async function renderStatsProb() {
  const select = document.getElementById("select-maquinas");

  let respostaMarkov;
  let respostaProb;

  try {
    if (select.value !== "") {
      respostaMarkov = await fetch(`/dashboard/alertas-markov/${sessionStorage.EMPRESA}?maquina=${select.value}`);
      respostaProb = await fetch(`/dashboard/alertas-prob/${sessionStorage.EMPRESA}?maquina=${select.value}`);
    } else {
      respostaMarkov = await fetch(`/dashboard/alertas-markov/${sessionStorage.EMPRESA}`);
      respostaProb = await fetch(`/dashboard/alertas-prob/${sessionStorage.EMPRESA}`);
    }

    if (!respostaMarkov.ok) throw new Error('Erro ao buscar dados Markov');
    if (!respostaProb.ok) throw new Error('Erro ao buscar dados Probabilidades');

    const markov = await respostaMarkov.json();
    const prob = await respostaProb.json();

    console.log("Dados Markov: ", markov);
    console.log("Dados Probabilidades: ", prob);

    const container = document.getElementById("statsProb");
    container.innerHTML = "";

    // --- Probabilidade por Componente ---
    const tituloComp = document.createElement("h4");
    tituloComp.innerHTML = "Probabilidade de Alerta por Componente <i class=\"fa-solid fa-circle-info info-icon\" data-info=\"info-probComp\"></i>"
    container.appendChild(tituloComp);

    const tabelaComp = document.createElement("table");
    tabelaComp.classList.add("tabela-prob-comp");

    const theadComp = document.createElement("thead");
    theadComp.innerHTML = `<tr><th>Componente</th><th>Probabilidade</th></tr>`;
    tabelaComp.appendChild(theadComp);

    const tbodyComp = document.createElement("tbody");

    const probs = prob;
    if (!probs || Object.keys(probs).length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="2">Nenhuma probabilidade disponível</td>`;
      tbodyComp.appendChild(tr);
    } else {
      for (const [comp, probComp] of Object.entries(probs)) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${capitalize(String(comp))}</td><td>${(probComp * 100).toFixed(2)}%</td>`;
        tbodyComp.appendChild(tr);
      }
    }

    tabelaComp.appendChild(tbodyComp);
    container.appendChild(tabelaComp);

    // --- Matriz de Markov ---
    const tituloMarkov = document.createElement("h4");
    tituloMarkov.innerHTML = "Matriz de Transição (Cadeia de Markov) <i class=\"fa-solid fa-circle-info info-icon\" data-info=\"info-markov\"></i>";
    container.appendChild(tituloMarkov);

    const tabelaMarkov = document.createElement("table");
    tabelaMarkov.classList.add("tabela-markov");

    const theadMarkov = document.createElement("thead");
    theadMarkov.innerHTML = `<tr><th>De \\ Para</th><th>Preocupante</th><th>Crítico</th></tr>`;
    tabelaMarkov.appendChild(theadMarkov);

    const tbodyMarkov = document.createElement("tbody");

    const estados = ["Preocupante", "Crítico"];

    [markov.matrizPreocupante, markov.matrizCritico].forEach((linha, i) => {
      let rowHtml = `<tr><td>${estados[i]}</td>`;
      if (linha && Array.isArray(linha)) {
        linha.forEach(prob => {
          rowHtml += `<td>${(prob * 100).toFixed(2)}%</td>`;
        });
      } else {
        rowHtml += `<td>0.00%</td><td>0.00%</td>`;
      }
      rowHtml += "</tr>";
      tbodyMarkov.innerHTML += rowHtml;
    });

    tabelaMarkov.appendChild(tbodyMarkov);
    container.appendChild(tabelaMarkov);

  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    const container = document.getElementById("statsProb");
  }
}


 function iniciarPainel() {
        let nomeUsuario = document.getElementById("nome_usuario");
        nomeUsuario.innerHTML = sessionStorage.NOME;
        
        let cargoUsuario = document.getElementById("cargo_usuario");
        cargoUsuario.innerHTML = sessionStorage.PERMISSAO;
    }

iniciarPainel();
renderGraficos();
renderizarAlertas();
renderSlctMaquinas();
renderStatsProb();
renderizarKpis();

const descricoes = {
  "info-taxa": "Taxa de alertas críticos: mostra a proporção de alertas graves em relação ao total.",
  "info-total": "Total de alertas: quantidade de alertas registrados no período.",
  "info-media": "Média de alertas por dia: indica a frequência média de alertas.",
  "info-componente": "Componente com mais alertas: identifica qual parte da máquina gerou mais alertas.",
  "info-previsao": "Previsão de alertas para amanhã: estimativa baseada em padrões históricos e cálculos.",
  "info-probabilidade": "Probabilidade de ocorrência de alertas críticos: chance de novos alertas graves acontecerem.",
  "info-periodo": "Período com maior risco: intervalo de tempo em que os alertas são mais frequentes.",
  "info-probComp": "Probabilidade de alerta por componente: Tabela que mostra o cálculo das probabilidades de ocorrer um alerta para cada um dos componentes.",
  "info-markov": "Matriz de transição (Cadeia de Markov): Probabilidade de uma categoria de alerta mudar ou continuar da mesma forma."
};

// Referências ao modal
const modal = document.getElementById("modalInfo");
const modalText = document.getElementById("modalText");
const closeModal = document.getElementById("closeModal");

closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

// Fechar ao clicar no fundo escuro
modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
});

// Delegação de eventos para capturar clicks em .info-icon
document.addEventListener("click", (event) => {
    const icon = event.target.closest(".info-icon");
    if (!icon) return;

    const infoKey = icon.getAttribute("data-info");
    const mensagem = descricoes[infoKey] || "Sem descrição disponível.";

    // Preenche o modal e exibe
    modalText.textContent = mensagem;
    modal.style.display = "flex"; 
});







setInterval(() => {
  console.log("Renderizando os gráficos novamente")
  renderGraficos();
  renderizarAlertas();
  renderizarKpis();
  renderStatsProb();
}, 2000); 