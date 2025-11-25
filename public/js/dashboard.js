let tempo = 0;
const maxPontos = 60;
let labels = Array.from({ length: maxPontos }, (_, i) => `${i}s`);

let cpuData = Array(maxPontos).fill(0);
let ramData = Array(maxPontos).fill(0);
let redeEnv = Array(maxPontos).fill(0);
let redeRec = Array(maxPontos).fill(0);
let discoEmUso = 0;
let discoHist = Array(12).fill(0);
let nucleos = Array(8).fill(0);
let redeThp = Array(maxPontos).fill(0);
let redeEnvMB = Array(maxPontos).fill(0);
let redeRecMB = Array(maxPontos).fill(0);

function mediaUltimos10(arr) {
  const slice = arr.slice(-10);
  const soma = slice.reduce((a, b) => a + b, 0);
  return soma / slice.length || 0;
}

const cbCPU = document.getElementById("cb_cpu");
const cbRAM = document.getElementById("cb_ram");
const cbRede = document.getElementById("cb_rede");
const cbDisco = document.getElementById("cb_disco");
const cbNucleos = document.getElementById("cb_nucleos");
const cbEstatistica = document.getElementById("cb_estatistica");
const secCPU = document.getElementById("sec-cpu");
const secRAM = document.getElementById("sec-ram");
const secRede = document.getElementById("sec-rede");
const secDisco = document.getElementById("sec-disco");
const secNucleos = document.getElementById("sec-nucleos");
const secEstatisticas = document.getElementById("sec-stats");

function atualizarLayout() {
  secCPU.style.display = cbCPU.checked ? "" : "none";
  secRAM.style.display = cbRAM.checked ? "" : "none";
  secRede.style.display = cbRede.checked ? "" : "none";
  secDisco.style.display = cbDisco.checked ? "" : "none";
  secNucleos.style.display = cbNucleos.checked ? "" : "none";
  secEstatisticas.style.display = cbEstatistica.checked ? "" : "none";
}

cbCPU.onchange = atualizarLayout;
cbRAM.onchange = atualizarLayout;
cbRede.onchange = atualizarLayout;
cbDisco.onchange = atualizarLayout;
cbNucleos.onchange = atualizarLayout;
cbEstatistica.onchange = atualizarLayout;

const caixaMaquinas = document.getElementById("maquinas");
const listaMaquinas = document.getElementById("menu-maquinas");



const caixaVisoes = document.getElementById("visoes");
const btnVisoes = document.getElementById("btn-visoes");
const listaVisoes = document.getElementById("menu-visoes");

const mapaVisoes = {
  geral: "dashboard.html",
  rede: "dashboardRede.html",
  disco: "dashboardDisco.html",
  ram: "dashboardRam.html",
  cpu: "cpuComp.html",
  auditoria: "dashboardAuditoria.html"
};

if (btnVisoes) btnVisoes.textContent = "Geral";

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
        btnVisoes.textContent = btn.textContent;
        window.location.href = mapaVisoes[qual];
      }
      caixaVisoes.classList.remove("show");
    });
  });
}

function atualizarRede(dados) {
  if (!dados) return;
  redeThp.push(dados.velocidadeMbps ?? 0);
  redeThp.shift();
  grafRede.update();
}

function atualizarCpuNucleo(dados) {
  if (!dados || !dados.lista) return;
  grafCpuNucleo.data.datasets[0].data = dados.lista;
  grafCpuNucleo.update();
}

let contadorAlertas = 0;
let linkAlertas = document.getElementById("link-alertas") || document.querySelector('a[href="alertas.html"]');
let badge = document.getElementById("badgeAlertas");

if (!badge && linkAlertas) {
  badge = document.createElement("span");
  badge.id = "badgeAlertas";
  badge.className = "badge";
  badge.hidden = true;
  linkAlertas.style.position = "relative";
  linkAlertas.appendChild(badge);
}

function getStore() {
  try {
    return JSON.parse(localStorage.getItem("hv_alerts")) || [];
  } catch {
    return [];
  }
}

function setStore(arr) {
  localStorage.setItem("hv_alerts", JSON.stringify(arr.slice(-500)));
}


function criarPopup(msg, severidade, tipoCategoria) {
  contadorAlertas++;
  if (badge) {
    badge.textContent = String(contadorAlertas);
    badge.hidden = false;
  }

  const pop = document.createElement("div");
  pop.className = "popup-alerta";
  pop.style.background = severidade === "crítico" ? "#ef4444" : severidade === "médio" ? "#f97316" : "#facc15";
  pop.innerHTML = `<span class="ico">⚠️</span><span>${msg}</span>`;

  if (msg.toLowerCase().includes("rede")) pop.classList.add("alerta-rede");
  else if (msg.toLowerCase().includes("cpu")) pop.classList.add("alerta-cpu");
  else if (msg.toLowerCase().includes("memória")) pop.classList.add("alerta-memoria");
  else if (msg.toLowerCase().includes("disco")) pop.classList.add("alerta-disco");

  pop.addEventListener("click", () => {
    if (linkAlertas) linkAlertas.click();
    else window.location.href = "alertas.html";
  });

  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 3500);

  const nivelTxt = severidade === "crítico" ? "Crítico" : severidade === "médio" ? "Preocupante" : "Abaixo";

  registrarAlerta({
    tipo: tipoCategoria || "Geral",
    nivel: nivelTxt,
    texto: msg,
  });
}

function clamp(v, a, b) {
  return Math.min(b, Math.max(a, v));
}

function estatAmostra(arr) {
  const n = arr.length || 1;
  let soma = 0;
  for (let i = 0; i < n; i++) soma += arr[i];
  const media = soma / n;
  let varAcum = 0;
  for (let i = 0; i < n; i++) varAcum += (arr[i] - media) * (arr[i] - media);
  const variance = varAcum / (n - 1 || 1);
  return { std: Math.sqrt(variance), variance };
}

function corN(v) {
  return v >= 75 ? "#ef4444" : "#9ca3af";
}

const grafCPU = new Chart(document.getElementById("graficoCPU"), {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "CPU",
        data: cpuData,
        borderColor: "#FFFFFFFF",
        backgroundColor: "#545f915d",
        fill: true,
        pointRadius: 0,
      },
      {
        label: "Alerta (65%)",
        data: Array(maxPontos).fill(65),
        borderColor: "#f97316",
        borderWidth: 2,
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0,
      },
      {
        label: "Crítico (85%)",
        data: Array(maxPontos).fill(85),
        borderColor: "#ef4444",
        borderWidth: 2,
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0,
      },
    ],
  },
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { display: false } },
      y: { beginAtZero: true, max: 100 },
    },
  },
});

const grafRAM = new Chart(document.getElementById("graficoRAM"), {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "RAM",
        data: ramData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,.15)",
        fill: true,
        pointRadius: 0,
      },
      {
        label: "Alerta (65%)",
        data: Array(maxPontos).fill(65),
        borderColor: "#f97316",
        borderWidth: 2,
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0,
      },
      {
        label: "Crítico (85%)",
        data: Array(maxPontos).fill(85),
        borderColor: "#ef4444",
        borderWidth: 2,
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0,
      },
    ],
  },
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { display: false } },
      y: { beginAtZero: true, max: 100 },
    },
  },
});

const grafRede = new Chart(document.getElementById("graficoRede"), {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "Throughput (Mbps)",
        data: redeThp,
        borderColor: "#8856de",
        backgroundColor: "rgba(136,86,222,0.15)",
        fill: true,
        borderWidth: 2,
        pointRadius: 0,
      },
      {
        label: "--- crítico ---",
        data: Array(maxPontos).fill(125),
        borderColor: "#ef4444",
        borderWidth: 2,
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0,
      },
      {
        label: "--- preocupante ---",
        data: Array(maxPontos).fill(90),
        borderColor: "#f97316",
        borderWidth: 2,
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0,
      },
    ],
  },
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        labels: {
          filter: (item) => item.text === "Throughput (Mbps)",
        },
      },
    },
    scales: {
      x: {
        ticks: { display: false },
        grid: { color: "#37415155", display: true },
      },
      y: {
        beginAtZero: true,
        max: 250,
        grid: { color: "#37415155", display: true },
      },
    },
  },
});

const grafDisco = new Chart(document.getElementById("graficoDisco"), {
  type: "doughnut",
  data: {
    labels: ["Disponível", "Em uso"],
    datasets: [
      {
        data: [100 - discoEmUso, discoEmUso],
        backgroundColor: ["#c4c4c405", "#07988a"],
        borderColor: "#1e293b",
        borderWidth: 2,
        cutout: "60%",
      },
    ],
  },
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  },
});

const grafNucleos = new Chart(document.getElementById("graficoNucleos"), {
  type: "bar",
  data: {
    labels: [
      "Núcleo 0",
      "Núcleo 1",
      "Núcleo 2",
      "Núcleo 3",
      "Núcleo 4",
      "Núcleo 5",
      "Núcleo 6",
      "Núcleo 7",
    ],
    datasets: [
      {
        label: "Uso dos Núcleos",
        data: nucleos,
        backgroundColor: "#9ca3af",
      },
      {
        label: "Preocupante (65%)",
        type: "line",
        data: new Array(nucleos.length).fill(65),
        borderColor: "#f97316",
        borderWidth: 2,
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0,
      },
      {
        label: "Crítico (85%)",
        type: "line",
        data: new Array(nucleos.length).fill(85),
        borderColor: "#ef4444",
        borderWidth: 2,
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0,
      },
    ],
  },
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { display: false } },
      y: { beginAtZero: true, max: 100 },
    },
  },
});

function formatMbps(v) {
  return `${Math.round(v)} Mbps`;
}

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

function atualizarKPIs() {
  document.getElementById("kpi_cpu").textContent = Math.round(mediaUltimos10(cpuData)) + "%";
  document.getElementById("kpi_ram").textContent = Math.round(mediaUltimos10(ramData)) + "%";
  document.getElementById("kpi_disco").textContent = Math.round(mediaUltimos10(discoHist)) + "%";
  const ultimoThp = redeThp[redeThp.length - 1] || 0;
  document.getElementById("kpi_thp").textContent = Math.round(ultimoThp) + " Mbps";
}

function atualizarEstatisticas() {
  const stats = [
    ["CPU", estatAmostra(cpuData)],
    ["CPU por Núcleo", estatAmostra(nucleos)],
    ["RAM", estatAmostra(ramData)],
    ["Rede", estatAmostra(redeEnv)],
    ["Disco", estatAmostra(discoHist)],
  ];

  const tbody = document.getElementById("tabela-stats");
  if (!tbody) return;

  let html = "";
  for (let i = 0; i < stats.length; i++) {
    const [n, s] = stats[i];
    html += `<tr><td style="text-align:left">${n}</td><td>${s.std.toFixed(2)}</td><td>${s.variance.toFixed(2)}</td></tr>`;
  }

  tbody.innerHTML = html;
}

const uptimeEl = document.getElementById("kpi_uptime");
let uptimeSeg = 0;

function two(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function renderUptime() {
  const dias = Math.floor(uptimeSeg / (24 * 3600));
  const resto = uptimeSeg % (24 * 3600);
  const horas = Math.floor(resto / 3600);
  const min = Math.floor((resto % 3600) / 60);
  const seg = resto % 60;
  uptimeEl.textContent = `${two(dias)}:${two(horas)}:${two(min)}:${two(seg)} dias`;
}

setInterval(renderUptime, 1000);
renderUptime();

function atualizarDadosBackend() {
    const select = document.getElementById("select-maquinas")
  maquinaAtual = select.value
  fetch(`/dashboard/tempo-real/${maquinaAtual}`, {
    method: "GET"
  })
  .then(function(resposta) {
    if (resposta.ok) {
      return resposta.json();
    }
  })
  .then(function(dados) {
    if (!dados) return;

    const cpu = dados.cpu || 0;
    const ram = dados.ram || 0;
    const disco = dados.disco || 0;
    const discoHistorico = dados.discoHistorico || [];
    const nucleosBackend = dados.nucleos || [];

    if (dados.uptime !== undefined) {
      uptimeSeg = Number(dados.uptime) || 0;
      renderUptime();
    }

    cpuData.push(cpu);
    cpuData.shift();
    ramData.push(ram);
    ramData.shift();
    redeThp.push(dados.velocidadeMbps || 0);
    redeThp.shift();
    redeEnvMB.push(dados.envio || 0);
    redeEnvMB.shift();
    redeRecMB.push(dados.recebimento || 0);
    redeRecMB.shift();

    discoEmUso = disco;
    discoHist = discoHistorico.slice(0, 12);

    if (Array.isArray(nucleosBackend)) {
      for (let i = 0; i < 8; i++) {
        grafNucleos.data.datasets[0].data[i] = nucleosBackend[i] ?? 0;
      }
    }

    grafCPU.update();
    grafRAM.update();
    grafRede.update();
    grafNucleos.update();
    grafDisco.data.datasets[0].data = [100 - discoEmUso, discoEmUso];
    grafDisco.update();

    atualizarKPIs();
    atualizarEstatisticas();
    atualizarRede(dados);
  })
  .catch(function(erro) {
    console.log(`#ERRO: ${erro}`);
  });
}

async function gerarRelatorio() {
   const select = document.getElementById("select-maquinas")
  maquinaAtual = select.value

  const resposta = await fetch(`/dashboard/gerar-relatorio/${maquinaAtual}`);
  const dados = await resposta.json(); 

  if (!Array.isArray(dados) || dados.length === 0) {
    alert("Nenhum dado para exportar!");
    return;
  }

  // 1. Extrair cabeçalhos automaticamente
  const colunas = Object.keys(dados[0]);

  // 2. Montar o CSV
  const linhas = [];

  // cabeçalho
  linhas.push(colunas.join(";"));

  // dados
  for (const item of dados) {
    const linha = colunas
      .map(campo => (item[campo] !== null && item[campo] !== undefined ? item[campo] : ""))
      .join(";");
    linhas.push(linha);
  }

  const csvString = linhas.join("\n");

  // 3. Baixar arquivo no navegador
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `relatorio_maquina_0${maquinaAtual}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

setInterval(atualizarDadosBackend, 2000);

atualizarLayout();
atualizarKPIs();
renderSlctMaquinas();
atualizarEstatisticas();