/* ============================================================
   BASE
============================================================ */

const maxPontos = 60;
let labels = Array.from({ length: maxPontos }, (_, i) => `${i}s`);

let velocidadeArr = Array(maxPontos).fill(0);
let trafegoEnv = Array(maxPontos).fill(0);
let trafegoRec = Array(maxPontos).fill(0);
let pacotesEnv = Array(maxPontos).fill(0);
let pacotesRec = Array(maxPontos).fill(0);

let maquinaAtual = sessionStorage.ID_MAQUINA || 1;


/* ============================================================
   FUNÇÃO SHIFT
============================================================ */
function shift(arr, value) {
  arr.shift();
  arr.push(Number(value) || 0);
}


/* ============================================================
   RESET AO TROCAR MÁQUINA
============================================================ */
function resetarArrays() {
  velocidadeArr.fill(0);
  trafegoEnv.fill(0);
  trafegoRec.fill(0);
  pacotesEnv.fill(0);
  pacotesRec.fill(0);

  grafVelocidade.update();
  grafTrafego.update();
  grafPacotes.update();
}


/* ============================================================
   GRÁFICOS — iguais ao dashboard geral
============================================================ */

/* ===== VELOCIDADE ===== */
const grafVelocidade = new Chart(document.getElementById("grafico-velocidade"), {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "Velocidade",
        data: velocidadeArr,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,.18)",
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
    plugins: { legend: { display: false }},
    scales: {
      x: { ticks: { display: false }, grid: { color: "#37415155" } },
      y: { beginAtZero: true, grid: { color: "#37415155" } }
    }
  }
});


/* ===== TRÁFEGO ===== */
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
      }
    ]
  },
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { display: true }},
    scales: {
      x: { ticks: { display: false }, grid: { color: "#37415155" }},
      y: { beginAtZero: true, grid: { color: "#37415155" }}
    }
  }
});


/* ===== PACOTES ===== */
const grafPacotes = new Chart(document.getElementById("grafico-pacotes"), {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "Pacotes Enviados",
        data: pacotesEnv,
        borderColor: "#07988a",
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
      }
    ]
  },
  options: {
    maintainAspectRatio: false,
    plugins: { legend: { display: true }},
    scales: {
      x: { ticks: { display: false }, grid: { color: "#37415155" }},
      y: { beginAtZero: true, grid: { color: "#37415155" }}
    }
  }
});


/* ============================================================
   ATUALIZAÇÃO REAL-TIME
============================================================ */

async function atualizar() {
  try {
    const resp = await fetch(`/rede/tempo-real/${maquinaAtual}`);
    if (!resp.ok) return;

    const d = await resp.json();

    shift(velocidadeArr, d.velocidadeMbps);
    shift(trafegoEnv, d.mbEnviados);
    shift(trafegoRec, d.mbRecebidos);
    shift(pacotesEnv, d.pacotesEnviados);
    shift(pacotesRec, d.pacotesRecebidos);

    grafVelocidade.update();
    grafTrafego.update();
    grafPacotes.update();

    document.getElementById("kpi-velocidade").textContent = `${d.velocidadeMbps} Mbps`;
    document.getElementById("kpi-enviado").textContent    = `${d.mbEnviados} MB`;
    document.getElementById("kpi-recebido").textContent   = `${d.mbRecebidos} MB`;
    document.getElementById("kpi-pacotes-env").textContent = d.pacotesEnviados;
    document.getElementById("kpi-pacotes-rec").textContent = d.pacotesRecebidos;

  } catch (err) {
    console.log("Erro rede:", err);
  }
}

setInterval(atualizar, 2000);


/* ============================================================
   CHECKBOXES
============================================================ */

const cbVel = document.getElementById("cb_velocidade");
const cbTraf = document.getElementById("cb_trafego");
const cbPac = document.getElementById("cb_pacotes");

function atualizarLayoutRede() {
  document.getElementById("painel-velocidade").style.display = cbVel.checked ? "" : "none";
  document.getElementById("painel-trafego").style.display    = cbTraf.checked ? "" : "none";
  document.getElementById("painel-pacotes").style.display    = cbPac.checked ? "" : "none";
}

cbVel.onclick  = atualizarLayoutRede;
cbTraf.onclick = atualizarLayoutRede;
cbPac.onclick  = atualizarLayoutRede;

atualizarLayoutRede();


/* ============================================================
   TROCA DE MÁQUINA
============================================================ */

document.querySelectorAll("#menu-maquinas button").forEach(btn => {
  btn.addEventListener("click", () => {
    maquinaAtual = btn.dataset.target;
    sessionStorage.ID_MAQUINA = maquinaAtual;
    document.getElementById("btn-maquinas").textContent = `Máquina ${maquinaAtual}`;
    resetarArrays();
  });
});
