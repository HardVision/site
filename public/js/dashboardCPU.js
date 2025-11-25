const selectMaquina = document.getElementById("select-maquinas");
const kpiUso = document.getElementById("kpiUso");
const kpiNucleosCriticos = document.getElementById("kpiNucleosCriticos");
const kpiProc = document.getElementById("kpiProc");

let chartCPU, chartNucleos;

function renderSlctMaquinas() {
  fetch(`/dashboard/select-maquina/${sessionStorage.EMPRESA}`, {
    method: "GET"
  })
  .then(function(resposta) {
    if (resposta.ok) {
      return resposta.json();
    }
  })
  .then(function(maquinas) {
    console.log("Máquinas da empresa: ", maquinas);
    let cont = 0;
    const select = document.getElementById("select-maquinas");

    maquinas.forEach(function(maquina) {
      cont++;
      select.innerHTML += `<option value="${maquina.idMaquina}">Máquina ${cont}</option>`;
    });

    atualizar();
  })
  .catch(function(erro) {
    console.log(`#ERRO: ${erro}`);
  });
}

function criarGraficos() {
    chartCPU = new Chart(document.getElementById("graficoCpu"), {
        type: "line",
        data: {
            labels: Array(60).fill(""),
            datasets: [
                {
                    label: "Uso (%)",
                    data: Array(60).fill(0),
                    borderColor: "#3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    borderWidth: 3,
                    pointRadius: 0,
                    tension: 0.35,
                    fill: true
                },
                {
                    label: "Alerta (60%)",
                    data: Array(60).fill(60),
                    borderColor: "#f59e0b",
                    borderWidth: 2,
                    borderDash: [6],
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: "Crítico (80%)",
                    data: Array(60).fill(80),
                    borderColor: "#ef4444",
                    borderWidth: 2,
                    borderDash: [6],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    display: true,
                    position: 'top'
                } 
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: { display: false }
            }
        }
    });

    chartNucleos = new Chart(document.getElementById("chartNucleos"), {
        type: "bar",
        data: {
            labels: ["Núcleo 1", "Núcleo 2", "Núcleo 3", "Núcleo 4", "Núcleo 5", "Núcleo 6", "Núcleo 7", "Núcleo 8"],
            datasets: [
                {
                    label: "Uso (%)",
                    data: [0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: function(context) {
                        const value = context.parsed.y;
                        if (value >= 80) return "#ef4444";
                        if (value >= 60) return "#f59e0b";
                        return "rgba(59, 130, 246, 0.65)";
                    },
                    borderColor: "#3b82f6",
                    borderWidth: 1
                },
                {
                    label: "Alerta (60%)",
                    type: "line",
                    data: Array(8).fill(60),
                    borderColor: "#f59e0b",
                    borderWidth: 2,
                    borderDash: [6],
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: "Crítico (80%)",
                    type: "line",
                    data: Array(8).fill(80),
                    borderColor: "#ef4444",
                    borderWidth: 2,
                    borderDash: [6],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    display: true,
                    position: 'top'
                } 
            },
            scales: { 
                y: { 
                    beginAtZero: true, 
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                } 
            }
        }
    });
}

function atualizar() {
    var select = document.getElementById("select-maquinas");
    if (!select || !select.value) {
        console.log("Select não encontrado ou sem valor");
        return;
    }

    console.log("Capturas da máquina ID", select.value);
    
    fetch(`/dashboard/cpu/kpis/${select.value}`, {
        method: "GET"
    })
    .then(function(resposta) {
        if (resposta.ok) {
            return resposta.json();
        }
        throw new Error('Erro ao buscar KPIs');
    })
    .then(function(kpis) {
        kpiUso.textContent = `${Math.round(kpis.uso_atual || 0)}%`;
        kpiNucleosCriticos.textContent = kpis.nucleos_acima_80 || 0;
        kpiProc.textContent = kpis.processos_ativos || 0;

        return fetch(`/dashboard/cpu/uso/${select.value}`, { method: "GET" });
    })
    .then(function(resposta) {
        if (resposta.ok) {
            return resposta.json();
        }
        throw new Error('Erro ao buscar histórico CPU');
    })
    .then(function(usoCPU) {
        if (usoCPU.historico && Array.isArray(usoCPU.historico)) {
            const dados = usoCPU.historico.slice(-60);
            while (dados.length < 60) {
                dados.unshift(0);
            }
            chartCPU.data.datasets[0].data = dados;
            chartCPU.update('none');
        }

        return fetch(`/dashboard/cpu/nucleos/${select.value}`, { method: "GET" });
    })
    .then(function(resposta) {
        if (resposta.ok) {
            return resposta.json();
        }
        throw new Error('Erro ao buscar núcleos');
    })
    .then(function(nucleos) {
        if (Array.isArray(nucleos)) {
            const valores = nucleos.map(n => n.valor || 0);
            while (valores.length < 8) {
                valores.push(0);
            }
            chartNucleos.data.datasets[0].data = valores.slice(0, 8);
            chartNucleos.update('none');
            atualizarProcessos();
        }
    })
    .catch(function(erro) {
        console.log(`#ERRO: ${erro}`);
    });
}

function atualizarProcessos() {
    var id = selectMaquina.value;

    fetch(`/dashboard/cpu/processos/${id}`)
    .then(res => res.json())
    .then(lista => {
        let tbody = document.getElementById("tbodyPID");
        tbody.innerHTML = "";

        lista.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.pid}</td>
                    <td>${p.nome}</td>
                    <td>${p.usoCPU}%</td>
                </tr>
            `;
        });
    })
    .catch(e => console.log("Erro ao atualizar processos:", e));
}


criarGraficos();
renderSlctMaquinas();
setInterval(atualizar, 2000);

if (selectMaquina) {
    selectMaquina.addEventListener("change", atualizar);
}