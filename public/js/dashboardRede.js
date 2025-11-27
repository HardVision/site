const maxPontos = 60;
let labels = Array.from({ length: maxPontos }, (_, i) => `${i}s`);

let velocidadeArr = Array(maxPontos).fill(0);
let trafegoEnv   = Array(maxPontos).fill(0);
let trafegoRec   = Array(maxPontos).fill(0);
let pacotesEnv   = Array(maxPontos).fill(0);
let pacotesRec   = Array(maxPontos).fill(0);

let ultimoPacotesEnv = 0;
let ultimoPacotesRec = 0;
let ultimoMbEnv = 0;
let ultimoMbRec = 0;
let primeiraLeitura = true;

let maquinaAtual = Number(sessionStorage.ID_MAQUINA || 1);

function shift(arr, value) {
  arr.shift();
  arr.push(Number(value) || 0);
}

function resetarArrays() {
  velocidadeArr.fill(0);
  trafegoEnv.fill(0);
  trafegoRec.fill(0);
  pacotesEnv.fill(0);
  pacotesRec.fill(0);
  grafTroughtput.update();
  grafTrafego.update();
  grafPacotes.update();
}

const grafTroughtput = new Chart(document.getElementById("grafico-velocidade"), {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "Velocidade",
        data: velocidadeArr,
        borderColor: '#FFFFFFFF',
        backgroundColor: '#545f915d',
        fill: true,
        pointRadius: 0,
        tension: 0.3
      },
      {
        label: "Crítico",
        data: Array(maxPontos).fill(200),
        borderColor: "#ef4444",
        borderDash: [6, 6],
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: "Preocupante",
        data: Array(maxPontos).fill(120),
        borderColor: "#f97316",
        borderDash: [6, 6],
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  },
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { display: false }, grid: { color: "#37415155" } },
      y: { beginAtZero: true, grid: { color: "#37415155" } }
    }
  }
});

const grafTrafego = new Chart(document.getElementById("grafico-trafego"), {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "MB Enviados",
        data: trafegoEnv,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,.18)",
        fill: true,
        pointRadius: 0,
        tension: 0.3
      },
      {
        label: "MB Recebidos",
        data: trafegoRec,
        borderColor: "#8856de",
        backgroundColor: "rgba(136,86,222,.18)",
        fill: true,
        pointRadius: 0,
        tension: 0.3
      },
      {
        label: "Crítico",
        data: Array(maxPontos).fill(200),
        borderColor: "#ef4444",
        borderDash: [6, 6],
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: "Preocupante",
        data: Array(maxPontos).fill(120),
        borderColor: "#f97316",
        borderDash: [6, 6],
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  },
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          filter: (item) => item.text !== "Crítico" && item.text !== "Preocupante"
        }
      }
    },
    scales: {
      x: { ticks: { display: false }, grid: { color: "#37415155" } },
      y: { beginAtZero: true, grid: { color: "#37415155" } }
    }
  }
});

const grafPacotes = new Chart(document.getElementById("grafico-pacotes"), {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "Pacotes Enviados",
        data: pacotesEnv,
        borderColor: "#0f6259ff",
        backgroundColor: "rgba(7,152,138,.18)",
        fill: true,
        pointRadius: 0,
        tension: 0.3
      },
      {
        label: "Pacotes Recebidos",
        data: pacotesRec,
        borderColor: "#d06e9f",
        backgroundColor: "rgba(208,110,159,.18)",
        fill: true,
        pointRadius: 0,
        tension: 0.3
      },
      {
        label: "Crítico",
        data: Array(maxPontos).fill(200),
        borderColor: "#ef4444",
        borderDash: [6, 6],
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: "Preocupante",
        data: Array(maxPontos).fill(120),
        borderColor: "#f97316",
        borderDash: [6, 6],
        pointRadius: 0,
        borderWidth: 2
      }
    ]
  },
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          filter: (item) => item.text !== "Crítico" && item.text !== "Preocupante"
        }
      }
    },
    scales: {
      x: { ticks: { display: false }, grid: { color: "#37415155" } },
      y: { beginAtZero: true, grid: { color: "#37415155" } }
    }
  }
});

function atualizar() {
  fetch(`/rede/tempo-real/${maquinaAtual}`, {
    method: "GET"
  })
  .then(function(resposta) {
    if (resposta.ok) {
      return resposta.json();
    }
  })
  .then(function(dados) {
    if (!dados) return;

    shift(velocidadeArr, dados.velocidadeMbps);
    shift(trafegoEnv, dados.mbEnviados);
    shift(trafegoRec, dados.mbRecebidos);
    shift(pacotesEnv, dados.pacotesEnviados);
    shift(pacotesRec, dados.pacotesRecebidos);

    grafTroughtput.update();
    grafTrafego.update();
    grafPacotes.update();

    document.getElementById("kpi_thp").textContent = `${dados.velocidadeMbps} Mbps`;
    document.getElementById("kpi_env").textContent = `${dados.mbEnviados} MB`;
    document.getElementById("kpi_rec").textContent = `${dados.mbRecebidos} MB`;
    document.getElementById("kpi_pac_env").textContent = dados.pacotesEnviados;
    document.getElementById("kpi_pac_rec").textContent = dados.pacotesRecebidos;
  })
  .catch(function(erro) {
    console.log(`#ERRO: ${erro}`);
  });
}

setInterval(atualizar, 2000);

const cbVel  = document.getElementById("cb_velocidade");
const cbTraf = document.getElementById("cb_trafego");
const cbPac  = document.getElementById("cb_pacotes");

function atualizarLayoutRede() {
  document.getElementById("painel-velocidade").style.display = cbVel.checked ? "" : "none";
  document.getElementById("painel-trafego").style.display = cbTraf.checked ? "" : "none";
  document.getElementById("painel-pacotes").style.display = cbPac.checked ? "" : "none";
}

cbVel.onclick = atualizarLayoutRede;
cbTraf.onclick = atualizarLayoutRede;
cbPac.onclick = atualizarLayoutRede;

atualizarLayoutRede();

const caixaMaquinas = document.getElementById("maquinas");
const btnMaquinas = document.getElementById("btn-maquinas");
const listaMaquinas = document.getElementById("menu-maquinas");

if (btnMaquinas) {
  btnMaquinas.textContent = `Máquina ${maquinaAtual}`;
}

if (btnMaquinas && caixaMaquinas && listaMaquinas) {
  btnMaquinas.addEventListener("click", (e) => {
    e.stopPropagation();
    caixaMaquinas.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    caixaMaquinas.classList.remove("show");
  });

  const itens = listaMaquinas.querySelectorAll("button");
  itens.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const alvo = btn.dataset.target || String(index + 1);
      maquinaAtual = Number(alvo);
      sessionStorage.ID_MAQUINA = maquinaAtual;
      btnMaquinas.textContent = `Máquina ${maquinaAtual}`;
      caixaMaquinas.classList.remove("show");
      resetarArrays();
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

if (btnVisoes) btnVisoes.textContent = "Rede";

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
// ===== POPUP DE INFORMAÇÃO KPI REDE =====
const infoIcons = document.querySelectorAll('.info-icon');

infoIcons.forEach(icon => {
  icon.addEventListener('click', e => {
    e.stopPropagation();
    const popupId = icon.getAttribute('data-info');
    const popup = document.getElementById(popupId);

    // Fecha todos os outros popups
    document.querySelectorAll('.info-popup').forEach(p => p.classList.remove('show'));

    // Alterna o popup clicado
    popup.classList.toggle('show');
  });
});

// Fecha popups ao clicar fora
document.addEventListener('click', e => {
  if (!e.target.classList.contains('info-icon') &&
      !e.target.classList.contains('info-popup')) {
    document.querySelectorAll('.info-popup').forEach(p => p.classList.remove('show'));
  }
});

