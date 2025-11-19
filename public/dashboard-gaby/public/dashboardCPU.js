// =============================
// MOCK API — dados simulados
// =============================
function aplicarStatus(elemento, valor, ideal, maximo) {
    elemento.classList.remove("status-ok", "status-warning", "status-danger");

    if (valor <= ideal) {
        elemento.classList.add("status-ok");
    } else if (valor > ideal && valor <= maximo) {
        elemento.classList.add("status-warning");
    } else {
        elemento.classList.add("status-danger");
    }
}


async function fetchCPU(maquinaId) {

    // Simula requisicao real
    return new Promise(resolve => {
        setTimeout(() => {

            resolve({
                usoAtual: (40 + Math.random() * 40).toFixed(1),
                /*frequencia: (2.8 + Math.random() * 1.2).toFixed(2),*/
                processos: Math.floor(100 + Math.random() * 120),

                historicoUso: Array.from({ length: 10 }, () => (20 + Math.random() * 70).toFixed(1)),
              /*  historicoFreq: Array.from({ length: 10 }, () => (2.5 + Math.random()).toFixed(2)),*/
                nucleos: Array.from({ length: 8 }, () => (30 + Math.random() * 60).toFixed(1)),

                tabela: Array.from({ length: 6 }, (_, i) => ({
                    pid: 1000 + i,
                    nome: "Processo_" + (i + 1),
                    uso: (Math.random() * 25).toFixed(1)
                }))
            });

        }, 300);
    });
}

// =============================
// ELEMENTOS
// =============================
const kpiUso = document.getElementById("kpiUso");
/*const kpiFreq = document.getElementById("kpiFreq");*/
const kpiProc = document.getElementById("kpiProc");
const tbodyPID = document.getElementById("tbodyPID");

const selectMaquina = document.getElementById("selectMaquina");

// =============================
// GRÁFICOS
// =============================
var chartCPU, chartFreq, chartNucleos;
function criarGraficos() {
    const ctxCpu = document.getElementById("graficoCpu").getContext("2d");
    const ctxFreq = document.getElementById("graficoFreq").getContext("2d");
    const ctxNuc = document.getElementById("graficoNucleos").getContext("2d");

    // ================= CPU ==================
    chartCPU = new Chart(ctxCpu, {
        type: "line",
        data: {
            labels: Array(10).fill(""),
            datasets: [
                {
                    label: "Uso (%)",
                    data: [],
                    borderColor: "#38bdf8",
                    borderWidth: 3,
                    tension: 0.35,
                    pointRadius: 0
                },
                { label: "Min", data: Array(10).fill(20), borderColor: "#10b981", borderDash: [6], borderWidth: 1.5, pointRadius: 0 },
                { label: "Ideal", data: Array(10).fill(60), borderColor: "#fbbf24", borderDash: [6], borderWidth: 1.5, pointRadius: 0 },
                { label: "Max", data: Array(10).fill(80), borderColor: "#ef4444", borderDash: [6], borderWidth: 1.5, pointRadius: 0 },
            ]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true },
                x: { display: false }
            }
        }
    });

    // ================= FREQUÊNCIA ==================
    chartFreq = new Chart(ctxFreq, {
        type: "line",
        data: {
            labels: Array(10).fill(""),
            datasets: [
                {
                    label: "Frequência",
                    data: [],
                    borderColor: "#3b82f6",
                    borderWidth: 3,
                    tension: 0.35,
                    pointRadius: 0
                },
                { label: "Min", data: Array(10).fill(2.0), borderColor: "#10b981", borderDash: [6], borderWidth: 1.5, pointRadius: 0 },
                { label: "Ideal", data: Array(10).fill(3.0), borderColor: "#fbbf24", borderDash: [6], borderWidth: 1.5, pointRadius: 0 },
                { label: "Max", data: Array(10).fill(4.0), borderColor: "#ef4444", borderDash: [6], borderWidth: 1.5, pointRadius: 0 },
            ]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: false },
                x: { display: false }
            }
        }
    });

    // ================= NÚCLEOS ==================
    chartNucleos = new Chart(ctxNuc, {
        type: "bar",
        data: {
            labels: ["N1","N2","N3","N4","N5","N6","N7","N8"],
            datasets: [{
                label: "Uso por núcleo",
                data: [],
                backgroundColor: "#60a5fa",
                borderRadius: 6
            }]
        },
        options: {
            plugins: {
                legend: { display: false },
                annotation: {
                    annotations: {
                        minLine: { type: 'line', yMin: 20, yMax: 20, borderColor: "#10b981", borderDash: [6], borderWidth: 2 },
                        idealLine:{ type: 'line', yMin: 65, yMax: 65, borderColor: "#fbbf24", borderDash: [6], borderWidth: 2 },
                        maxLine:  { type: 'line', yMin: 80, yMax: 80, borderColor: "#ef4444", borderDash: [6], borderWidth: 2 }
                    }
                }
            },
            scales: { y: { beginAtZero: true } }
        }
    });
}



async function atualizar() {
    var dados = await fetchCPU(selectMaquina.value);

    // KPIs
    kpiUso.textContent = dados.usoAtual + "%";
    kpiFreq.textContent = dados.frequencia + " int";
    kpiProc.textContent = dados.processos;

aplicarStatus(
    kpiUso.parentElement,
    parseFloat(dados.usoAtual),
    60,  // ideal
    80   // máximo
);
/*
aplicarStatus(
    kpiFreq.parentElement,
    parseFloat(dados.frequencia),
    3.0, // ideal
    4.0  // máximo
);*/

aplicarStatus(
    kpiProc.parentElement,
    dados.processos,
    120, // ideal
    180  // máximo
);


    // ======== ATUALIZA GRÁFICO CPU ========
    chartCPU.data.datasets[0].data = dados.historicoUso;
    chartCPU.update();

    // ======== ATUALIZA GRÁFICO FREQ ========
    chartFreq.data.datasets[0].data = dados.historicoFreq;
    chartFreq.update();

    // ======== ATUALIZA NÚCLEOS ========
    chartNucleos.data.datasets[0].data = dados.nucleos;
    chartNucleos.update();

    // ======== ATUALIZA TABELA PID ========
    tbodyPID.innerHTML = "";
    dados.tabela.forEach(p => {
        tbodyPID.innerHTML += `
            <tr>
                <td>${p.pid}</td>
                <td>${p.nome}</td>
                <td>${p.uso}%</td>
            </tr>
        `;
    });
}


// Criar gráficos e carregar dados
criarGraficos();
atualizar();

// Atualizar ao trocar máquina
selectMaquina.addEventListener("change", atualizar);

// Atualização automática a cada 5s
setInterval(atualizar, 5000);
