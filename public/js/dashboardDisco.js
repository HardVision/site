let macAddress;
let intervaloAtualizacao = null;

const pieData = [28.6, 71.4];
const pieLabels = ["Espaço disponível", "Espaço utilizado"];

const barData = [8, 12, 16, 19];
const barLabels = ["Aplicação 1", "Aplicação 2", "Aplicação 3", "Aplicação 4"];

let historicoLeitura = [];
let historicoEscrita = [];
let historicoLabels = [];
const maxPontosHistorico = 30;

let contadorAlertas = 0;
let linkAlertas = document.getElementById("link-alertas") || document.querySelector('a[href="alertas.html"]');
let badge = document.getElementById("badgeAlertas");


/**
 * Cria e renderiza o gráfico de pizza
 */
function createPieChart() {
  const pieOptions = {
    chart: {
      type: "pie",
      height: 200,
      foreColor: "#ffffff",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    series: pieData,
    labels: pieLabels,
    colors: ["#2ECC71", "#3498DB"],
    legend: {
      position: "right",
      labels: {
        colors: "#ffffff",
        useSeriesColors: false,
      },
      formatter: function (val, opts) {
        const percent = opts.w.globals.series[opts.seriesIndex];
        return `${val}: ${percent.toFixed(1)}%`;
      },
      itemMargin: {
        vertical: 5,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    dataLabels: {
      enabled: false,
    },
  };

  const chart = new ApexCharts(document.querySelector("#pieChart"), pieOptions);
  chart.render();
  return chart;
}

/**
 * Cria e renderiza o gráfico de barras
 */
function createBarChart() {
  const barOptions = {
    chart: {
      type: "bar",
      height: 200,
      foreColor: "#ffffff",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    series: [
      {
        name: "Consumo (Unidades)",
        data: barData,
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 4,
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: barLabels,
      labels: {
        style: {
          colors: "#ffffff",
        },
      },
    },
    yaxis: {
      title: {
        text: "Consumo",
      },
      labels: {
        style: {
          colors: "#ffffff",
        },
      },
      min: 0,
      tickAmount: 4,
    },
    fill: {
      opacity: 1,
      colors: ["#FFB3BA"],
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " Unidades";
        },
      },
    },
    grid: {
      borderColor: "rgba(255, 255, 255, 0.1)",
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    legend: {
      show: false,
    },
  };

  const chart = new ApexCharts(document.querySelector("#barChart"), barOptions);
  chart.render();
  return chart;
}

/**
 * Cria e renderiza o gráfico de linha
 */
function createLineChart() {
  const lineOptions = {
    chart: {
      type: "line",
      height: 250,
      foreColor: "#ffffff",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    series: [
      {
        name: "Leitura (MB/s)",
        data: historicoLeitura,
        color: "#3498DB",
      },
      {
        name: "Escrita (MB/s)",
        data: historicoEscrita,
        color: "#E74C3C",
      },
    ],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: [3, 3],
    },
    xaxis: {
      categories: historicoLabels,
      labels: {
        show: false,
        style: {
          colors: "#ffffff",
        },
      },
    },
    yaxis: {
      min: 0,
      labels: {
        style: {
          colors: "#ffffff",
        },
        formatter: function(val) {
          return val.toFixed(2);
        }
      },
      title: {
        text: "Taxa (MB/s)",
        style: {
          color: "#ffffff",
        },
      },
    },
    grid: {
      borderColor: "rgba(255, 255, 255, 0.1)",
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    markers: {
      size: [4, 0, 0],
      colors: ["#5B6B8D", "transparent", "transparent"],
      strokeColors: "transparent",
      hover: {
        size: 6,
      },
    },
    legend: {
      labels: {
        colors: "#ffffff",
      },
      markers: {
        width: 10,
        height: 10,
        radius: 12,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    tooltip: {
      enabled: true,
    },
  };

  const chart = new ApexCharts(document.querySelector("#lineChart"), lineOptions);
  chart.render();
  return chart;
}

function buscarMaquinasSalvas() {
  var fkEmpresa = 1;
  fetch(`/dashboard/select-maquina/${fkEmpresa}`, {
    method: "GET",
  })
    .then(function (resposta) {
      resposta.json().then((maquinas) => {
        console.log("Máquinas encontradas:", maquinas);
        popularDropdownMaquinas(maquinas);
      });
    })
    .catch(function (erro) {
      console.log(`#ERRO ao buscar máquinas: ${erro}`);
    });
}

function popularDropdownMaquinas(maquinas) {
  console.log(maquinas);
  const dropdownMaquinas = document.querySelector('.dropdown .dropdown-content');
  const btnMaquinas = document.querySelector('.dropdown .dropdown-btn');
  
  console.log('Populando dropdown com máquinas:', maquinas);
  
  if (!dropdownMaquinas) {
    console.error('Dropdown não encontrado no DOM!');
    return;
  }
  
  dropdownMaquinas.innerHTML = '';
  
  maquinas.forEach((maquina, index) => {
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = `Máquina ${index + 1}`;
    link.setAttribute('data-mac-address', maquina.macAddress || maquina.macAdress);
    dropdownMaquinas.appendChild(link);
  });
  
  if (maquinas.length > 0) {
    btnMaquinas.textContent = 'Máquina 1';
    macAddress = (maquinas[0].macAddress || maquinas[0].macAdress).toLowerCase();
    console.log('MAC Address inicial:', macAddress);
    iniciarAtualizacaoAutomatica(macAddress);
  }
  
  aplicarEventListenersDropdown();
}

function buscarDadosTempoReal(mac) {
  if (!mac) {
    console.error('MAC Address não definido!');
    return;
  }

  fetch(`/discoTempoReal/tempo-real/${mac}`, {
    method: "GET",
  })
    .then(function (resposta) {
      if (resposta.status === 404) {
        console.log('Aguardando dados do Python...');
        return;
      }
      return resposta.json();
    })
    .then(function (dados) {
      if (dados) {
        console.log("Dados da máquina:", dados);
        atualizarCharts(dados);
      }
    })
    .catch(function (erro) {
      console.log(`#ERRO: ${erro}`);
    });
}

function iniciarAtualizacaoAutomatica(mac) {
  if (intervaloAtualizacao) {
    clearInterval(intervaloAtualizacao);
  }

  console.log('Iniciando atualização automática para MAC:', mac);
  
  buscarDadosTempoReal(mac);
  
  intervaloAtualizacao = setInterval(() => {
    buscarDadosTempoReal(mac);
  }, 1000);
}

function atualizarCharts(dados) {
  console.log('Atualizando charts com dados:', dados);
  
  const novoPieData = [
    dados.uso.porcentagem_livre,
    dados.uso.porcentagem_usada
  ];
  window.pieChart.updateSeries(novoPieData);

  const novoBarLabels = dados.processos.map((p) => p.nome);
  const novoBarData = dados.processos.map((p) => p.total_mb);

  window.barChart.updateOptions({
    xaxis: { categories: novoBarLabels },
  });
  window.barChart.updateSeries([{ data: novoBarData }]);

  const agora = new Date();
  const tempo = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  historicoLeitura.push(dados.velocidade.leitura_mb_s);
  historicoEscrita.push(dados.velocidade.escrita_mb_s);
  historicoLabels.push(tempo);
  
  if (historicoLeitura.length > maxPontosHistorico) {
    historicoLeitura.shift();
    historicoEscrita.shift();
    historicoLabels.shift();
  }
  
  window.lineChart.updateOptions({
    xaxis: { categories: historicoLabels }
  });
  window.lineChart.updateSeries([
    { name: "Leitura (MB/s)", data: historicoLeitura },
    { name: "Escrita (MB/s)", data: historicoEscrita }
  ]);

  const cardUsado = document.querySelector('.info-cards .card:nth-child(1) .card-value');
  const cardDisponivel = document.querySelector('.info-cards .card:nth-child(2) .card-value');
  const cardIOPS = document.querySelector('.info-cards .card:nth-child(3) .card-value');
  
  if (cardUsado) cardUsado.textContent = `${dados.uso.usado_gb}GB`;
  if (cardDisponivel) cardDisponivel.textContent = `${dados.uso.livre_gb}GB`;
  if (cardIOPS) {
    const totalMBs = dados.velocidade.leitura_mb_s + dados.velocidade.escrita_mb_s;
    cardIOPS.textContent = `${totalMBs.toFixed(2)} MB/s`;
  }
}

function aplicarEventListenersDropdown() {
  document.querySelectorAll(".dropdown-content a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const dropdown = this.closest(".dropdown");
      const btn = dropdown.querySelector(".dropdown-btn");
      btn.textContent = this.textContent;
      dropdown.classList.remove("active");

      const mac = this.getAttribute("data-mac-address");

      if (mac) {
        macAddress = mac;
        console.log("Máquina selecionada - MAC Address:", macAddress);
        iniciarAtualizacaoAutomatica(macAddress);
      }
    });
  });
}

function inicializarDropdowns() {
  const dropdownBtns = document.querySelectorAll(".dropdown-btn");
  dropdownBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const dropdown = this.parentElement;
      dropdown.classList.toggle("active");
    });
  });

  document.addEventListener("click", function () {
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
      dropdown.classList.remove("active");
    });
  });
}

const caixaVisoes = document.getElementById("visoes");
const btnVisoes = document.getElementById("btn-visoes");
const listaVisoes = document.getElementById("menu-visoes");

const mapaVisoes = {
  geral: "dashboard.html",
  rede: "dashboardRede.html",
  disco: "dashboardDisco.html",
  ram: "dashboardRam.html",
  cpu: "dashboardCpu.html",
};



historicoLabels = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

historicoLeitura =  [1.2, 2.1, 2.8, 3.1, 3.6, 4.2, 4.8, 5.1, 5.4, 5.8, 6.0, 5.9];
historicoEscrita = [0.9, 1.4, 1.7, 2.0, 2.3, 2.6, 2.9, 3.2, 3.4, 3.7, 3.9, 4.1];


function initCharts() {
  window.pieChart = createPieChart();
  window.barChart = createBarChart();
  window.lineChart = createLineChart();
}

// Setup de eventos do menu de visões 
if (btnVisoes && caixaVisoes && listaVisoes) {
  btnVisoes.addEventListener("click", (e) => {
    e.stopPropagation();
    caixaVisoes.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    caixaVisoes.classList.remove("show");
  });

  const itensVisao = listaVisoes.querySelectorAll("button");
  itensVisao.forEach((btn) => {
    btn.addEventListener("click", () => {
      const qual = btn.dataset.view;
      if (mapaVisoes[qual]) {
        btnVisoes.textContent = btn.textContent.charAt(0).toUpperCase() + btn.textContent.slice(1);
        window.location.href = mapaVisoes[qual];
      }
      caixaVisoes.classList.remove("show");
    });
  });
}

if (!badge && linkAlertas) {
  badge = document.createElement("span");
  badge.id = "badgeAlertas";
  badge.className = "badge";
  badge.hidden = true;
  linkAlertas.style.position = "relative"; // garante alinhamento
  linkAlertas.appendChild(badge);
}

// Atualiza o badge consultando backend periodicamente
async function atualizarBadge() {

  try {
    const resp = await fetch(`/dashboard/alertas-card/${sessionStorage.EMPRESA}`);
    if (resp.ok) {
      const dados = await resp.json();
      if (badge) {
        badge.textContent = dados.length;
        badge.hidden = dados.length === 0;
      }
    }
  } catch (e) {
    console.log("#ERRO badge:", e);
  }
}

   function iniciarPainel() {
        let nomeUsuario = document.getElementById("nome_usuario");
        nomeUsuario.innerHTML = sessionStorage.NOME;
        
        let cargoUsuario = document.getElementById("cargo_usuario");
        cargoUsuario.innerHTML = sessionStorage.PERMISSAO;
    }

iniciarPainel();

atualizarBadge()
window.onload = function () {
  atualizarBadge();
  initCharts();
  inicializarDropdowns();
  buscarMaquinasSalvas();
};
