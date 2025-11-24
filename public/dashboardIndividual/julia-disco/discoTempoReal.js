const pieData = [28.6, 71.4];
const pieLabels = ["Espaço disponível", "Espaço utilizado"];

const barData = [8, 12, 16, 19];
const barLabels = ["Aplicação 1", "Aplicação 2", "Aplicação 3", "Aplicação 4"];

const lineData = [18, 27, 25, 28, 30];
const lineLabels = ["Julho", "Agosto", "Setembro", "Outubro", "Novembro"];
const lineLimitSuperior = 35;
const lineLimitInferior = 10;

/**
 * Cria e renderiza o gráfico de pizza. Retorna a instância do chart.
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
 * Cria e renderiza o gráfico de barras. Retorna a instância do chart.
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
      max: 20,
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
 * Cria e renderiza o gráfico de linha. Retorna a instância do chart.
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
        name: "Uso Atual",
        data: lineData,
        color: "#5B6B8D",
      },
      {
        name: "Limite Superior",
        data: Array(lineLabels.length).fill(lineLimitSuperior),
        color: "#E74C3C",
      },
      {
        name: "Limite Inferior",
        data: Array(lineLabels.length).fill(lineLimitInferior),
        color: "#E74C3C",
      },
    ],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      dashArray: [0, 5, 5],
      width: [4, 2, 2],
    },
    xaxis: {
      categories: lineLabels,
      labels: {
        style: {
          colors: "#ffffff",
        },
      },
    },
    yaxis: {
      min: 0,
      max: 40,
      tickAmount: 4,
      labels: {
        style: {
          colors: "#ffffff",
        },
      },
      title: {
        text: "Uso (GB)",
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

function buscarDadosTempoReal(macAddress) {
  fetch(`/tempo-real/${macAddress}`, {
    method: "GET",
  }).then(function (resposta) {

      resposta.json().then((dados) => {
        console.log("Dados da máquina:", dados);
        atualizarCharts(dados);
      });

    })
    .catch(function (erro) {
      console.log(`#ERRO: ${erro}`);
    });
}

function atualizarCharts(dados) {
    const novoPieData = [
        dados.uso.porcentagem_usada,
        dados.uso.porcentagem_livre
    ];

    window.pieChart.updateSeries(novoPieData);

    const novoBarLabels = dados.processos.map(p => nome);
    const novoBarData = dados.processos.map(p => total_mb);

    window.barChart.updateOptions({   
        xaxis: { categories: novoBarLabels }
    });

    window.barChart.updateSeries([ { data: novoBarData } ]); 

}

// Função de inicialização que cria todos os charts.
// Chama `initCharts()` a partir do HTML 
// quando o DOM já estiver carregado.
function initCharts() {
  // mantém as instâncias disponíveis globalmente para futuras atualizações
  window.pieChart = createPieChart();
  window.barChart = createBarChart();
  window.lineChart = createLineChart();
}

window.onload = function () {
    initCharts(); 
};
