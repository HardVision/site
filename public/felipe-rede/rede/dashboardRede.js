
const maxPontos = 60;
let tempo = 0;
let labels = Array.from({ length: maxPontos }, (_, i) => `${i}s`);

let velocidade = Array(maxPontos).fill(0);
let mbEnv = Array(maxPontos).fill(0);
let mbRec = Array(maxPontos).fill(0);
let pctEnv = Array(maxPontos).fill(0);
let pctRec = Array(maxPontos).fill(0);

let maquinaAtual = 1;

async function getJSON(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } catch (e) {
    return null;
  }
}

  //  GRÁFICOS

/* ---- VELOCIDADE ---- */
const grafVelocidade = new Chart(document.getElementById("grafico-velocidade"), {
  type: 'line',
  data: {
    labels,
    datasets: [
      {
        label: "Velocidade (Mbps)",
        data: velocidade,
        borderColor: "#6b7280",
        backgroundColor: "rgba(107,114,128,0.25)",
        fill: true,
        pointRadius: 0
      },
      {
        label: "Preocupante (90 Mbps)",
        data: Array(maxPontos).fill(90),
        borderColor: "#f97316",
        borderDash: [6, 6],
        borderWidth: 2,
        fill: false,
        pointRadius: 0
      },
      {
        label: "Crítico (125 Mbps)",
        data: Array(maxPontos).fill(125),
        borderColor: "#ef4444",
        borderDash: [6, 6],
        borderWidth: 2,
        fill: false,
        pointRadius: 0
      }
    ]
  },
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { filter: (i) => i.text === "Velocidade (Mbps)" }
      }
    },
    scales: {
      x: { ticks: { display: false }, grid: { color: "#37415155" } },
      y: { beginAtZero: true, max: 250, grid: { color: "#37415155" } }
    }
  }
});

/* ---- TRÁFEGO ---- */
const grafTrafego = new Chart(document.getElementById("grafico-trafego"), {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "Enviado (MB)",
        data: mbEnv,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.25)",
        fill: true,
        pointRadius: 0
      },
      {
        label: "Recebido (MB)",
        data: mbRec,
        borderColor: "#8856de",
        backgroundColor: "rgba(136,86,222,0.25)",
        fill: true,
        pointRadius: 0
      },
      {
        label: "Preocupante",
        data: Array(maxPontos).fill(90),
        borderColor: "#f97316",
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0
      },
      {
        label: "Crítico",
        data: Array(maxPontos).fill(125),
        borderColor: "#ef4444",
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0
      }
    ]
  },
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { filter: (i) => i.text.includes("(MB)") }
      }
    },
    scales: {
      x: { ticks: { display: false }, grid: { color: "#37415155" } },
      y: { beginAtZero: true, max: 300, grid: { color: "#37415155" } }
    }
  }
});

/* ---- PACOTES ---- */
const grafPacotes = new Chart(document.getElementById("grafico-pacotes"), {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "Pacotes Enviados",
        data: pctEnv,
        borderColor: "#07988a",
        backgroundColor: "rgba(7,152,138,0.25)",
        fill: true,
        pointRadius: 0
      },
      {
        label: "Pacotes Recebidos",
        data: pctRec,
        borderColor: "#d06e9f",
        backgroundColor: "rgba(208,110,159,0.25)",
        fill: true,
        pointRadius: 0
      },
      {
        label: "Preocupante",
        data: Array(maxPontos).fill(90),
        borderColor: "#f97316",
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0
      },
      {
        label: "Crítico",
        data: Array(maxPontos).fill(125),
        borderColor: "#ef4444",
        borderDash: [6, 6],
        fill: false,
        pointRadius: 0
      }
    ]
  },
  options: {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { filter: (i) => i.text.includes("Pacotes") }
      }
    },
    scales: {
      x: { ticks: { display: false }, grid: { color: "#37415155" } },
      y: { beginAtZero: true, max: 300, grid: { color: "#37415155" } }
    }
  }
});


  //  CHECKBOXES 

const cbVel = document.getElementById("cb_velocidade");
const cbTraf = document.getElementById("cb_trafego");
const cbPac = document.getElementById("cb_pacotes");

const painelVel = document.getElementById("painel-velocidade");
const painelTraf = document.getElementById("painel-trafego");
const painelPac = document.getElementById("painel-pacotes");

function atualizarLayoutRede() {
  painelVel.style.display = cbVel.checked ? "" : "none";
  painelTraf.style.display = cbTraf.checked ? "" : "none";
  painelPac.style.display = cbPac.checked ? "" : "none";
}

cbVel.onchange =
cbTraf.onchange =
cbPac.onchange =
  atualizarLayoutRede;

atualizarLayoutRede();


  //  MENU DE MÁQUINAS 

const caixaMaquinas = document.getElementById("maquinas");
const btnMaquinas = document.getElementById("btn-maquinas");
const listaMaquinas = document.getElementById("menu-maquinas");

btnMaquinas.addEventListener("click", (e) => {
  e.stopPropagation();
  caixaMaquinas.classList.toggle("show");
});

document.addEventListener("click", () => caixaMaquinas.classList.remove("show"));

listaMaquinas.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", () => {
    maquinaAtual = Number(btn.dataset.target);
    btnMaquinas.textContent = `Máquina ${maquinaAtual}`;

    velocidade.fill(0);
    mbEnv.fill(0);
    mbRec.fill(0);
    pctEnv.fill(0);
    pctRec.fill(0);

    grafVelocidade.update();
    grafTrafego.update();
    grafPacotes.update();
  });
});

/* ========================
   LOOP DE ATUALIZAÇÃO
======================== */
async function atualizarRede() {
  const v = await getJSON(`/rede/tempo-real/${maquinaAtual}`);
  if (v && v.valor !== undefined) {
    velocidade.push(v.valor);
    if (velocidade.length > maxPontos) velocidade.shift();
  }

  const mb = await getJSON(`/rede/mb/${maquinaAtual}`);
  if (mb) {
    mbEnv.push(mb.env);
    mbRec.push(mb.rec);
    if (mbEnv.length > maxPontos) mbEnv.shift();
    if (mbRec.length > maxPontos) mbRec.shift();
  }

  const pac = await getJSON(`/rede/pacotes/${maquinaAtual}`);
  if (pac) {
    pctEnv.push(pac.env);
    pctRec.push(pac.rec);
    if (pctEnv.length > maxPontos) pctEnv.shift();
    if (pctRec.length > maxPontos) pctRec.shift();
  }

  grafVelocidade.update();
  grafTrafego.update();
  grafPacotes.update();
}

setInterval(atualizarRede, 2000);
