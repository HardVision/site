

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

async function renderizarAlertas() {
    const resposta = await fetch(`/dashboard/alertas-card/${sessionStorage.EMPRESA}`);
    const alertas = await resposta.json();

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

    // Atualiza contador total
    document.getElementById("contador").innerText = `${alertas.length} alertas`;
}


// ============================
// Inicialização
// ============================

// export (opcional) para depuração
window._hv_alerts_render = renderizarAlertas;

async function renderGraficos() {
  document.addEventListener("DOMContentLoaded", async function () {

    // ==============================
    // 1. Buscar dados da API (linha)
    // ==============================
    const resposta = await fetch(`/dashboard/alertas-linha/${sessionStorage.EMPRESA}`);
    const dados = await resposta.json();

    const respostaBarra = await fetch(`/dashboard/alertas-barra/${sessionStorage.EMPRESA}`);
    const dadosBarra = await respostaBarra.json();
    const dadosOrdenado = dadosBarra.sort((a, b) => Number(b.totalAlertas) - Number(a.totalAlertas));
    console.log(dadosOrdenado[0])

    kpiComp.innerHTML = dadosOrdenado[0].tipoComponente;
    const totalCriticos = dados
      .filter(item => item.estado === "Crítico")
      .reduce((acumulador, item) => acumulador + Number(item.total_alertas), 0);

    kpiCrit.innerHTML = totalCriticos;
    const totalAlertas = dados
      .reduce((acc, item) => acc + Number(item.total_alertas), 0);

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
    new Chart(ctxLinha, configLinha);



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
    new Chart(ctxBar, configBar);

  });
}


renderGraficos(); renderizarAlertas();