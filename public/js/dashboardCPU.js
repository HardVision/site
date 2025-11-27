const selectMaquina = document.getElementById("select-maquinas");
const kpiUso = document.getElementById("kpiUso");
const kpiNucleosCriticos = document.getElementById("kpiNucleosCriticos");
const kpiProc = document.getElementById("kpiProc");

let chartCPU, chartNucleos;
let maquinaAtual = null;

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
    select.innerHTML = ""; // Limpa o select antes de popular

    maquinas.forEach(function(maquina) {
      cont++;
      select.innerHTML += `<option value="${maquina.idMaquina}">Máquina ${cont}</option>`;
    });

    // Define a primeira máquina como padrão
    if (maquinas.length > 0) {
      maquinaAtual = maquinas[0].idMaquina;
      select.value = maquinaAtual;
      atualizar();
    }
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
                    if (value > 0) return "rgba(59, 130, 246, 0.75)";
                    return "rgba(148, 163, 184, 0.3)"; // Cor para valores zerados
                },
                borderColor: function(context) {
                    const value = context.parsed.y;
                    if (value >= 80) return "#dc2626";
                    if (value >= 60) return "#ea580c";
                    if (value > 0) return "#2563eb";
                    return "#64748b";
                },
                borderWidth: 2,
                barThickness: 'flex',
                maxBarThickness: 60
            },
            {
                label: "Alerta (60%)",
                type: "line",
                data: Array(8).fill(60),
                borderColor: "#f59e0b",
                borderWidth: 2,
                borderDash: [6, 4],
                pointRadius: 0,
                fill: false,
                order: 0
            },
            {
                label: "Crítico (80%)",
                type: "line",
                data: Array(8).fill(80),
                borderColor: "#ef4444",
                borderWidth: 2,
                borderDash: [6, 4],
                pointRadius: 0,
                fill: false,
                order: 0
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 300 // Animação mais rápida
        },
        plugins: { 
            legend: { 
                display: true,
                position: 'top',
                labels: {
                    color: '#e5e7eb',
                    font: {
                        size: 12
                    },
                    filter: function(item) {
                        // Mostrar apenas "Uso (%)" na legenda
                        return item.text === "Uso (%)";
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `Uso: ${context.parsed.y.toFixed(1)}%`;
                    }
                }
            }
        },
        scales: { 
            y: { 
                beginAtZero: true, 
                max: 100,
                ticks: {
                    color: '#9ca3af',
                    callback: function(value) {
                        return value + '%';
                    }
                },
                grid: {
                    color: '#334155',
                    drawBorder: false
                }
            },
            x: {
                ticks: {    
                    color: '#9ca3af'
                },
                grid: {
                    display: false
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

    maquinaAtual = select.value;
    console.log("Capturas da máquina ID", maquinaAtual);
    
    fetch(`/dashboard/cpu/kpis/${maquinaAtual}`, {
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

        return fetch(`/dashboard/cpu/uso/${maquinaAtual}`, { method: "GET" });
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

        return fetch(`/dashboard/cpu/nucleos/${maquinaAtual}`, { method: "GET" });
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
// Atualizar a função atualizarProcessos no dashboardCPU.js

function atualizarProcessos() {
    if (!maquinaAtual) {
        console.log("Nenhuma máquina selecionada");
        return;
    }

    fetch(`/dashboard/cpu/processos/${maquinaAtual}`)
        .then(res => res.json())
        .then(lista => {
            let tbody = document.getElementById("tbodyPID");
            tbody.innerHTML = "";

            if (!lista || lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #94a3b8;">Nenhum processo encontrado</td></tr>';
                return;
            }

            // Ordenar por CPU decrescente e filtrar zeros no frontend também
            const processosAtivos = lista
                .filter(p => parseFloat(p.usoCPU) > 0)
                .sort((a, b) => parseFloat(b.usoCPU) - parseFloat(a.usoCPU))
                .slice(0, 20); // Mostrar apenas top 20

            // Se não houver processos ativos, mostrar os primeiros 10
            const processosExibir = processosAtivos.length > 0 
                ? processosAtivos 
                : lista.slice(0, 10);

            processosExibir.forEach(p => {
                const cpuValue = parseFloat(p.usoCPU) || 0;
                const corCpu = cpuValue >= 80 ? '#ef4444' : 
                              cpuValue >= 60 ? '#f59e0b' : 
                              '#94a3b8';
                
                tbody.innerHTML += `
                    <tr>
                        <td>${p.pid}</td>
                        <td>${p.nome}</td>
                        <td style="color: ${corCpu}; font-weight: bold;">${cpuValue.toFixed(2)}%</td>
                    </tr>
                `;
            });

            // Adicionar mensagem se todos forem zeros
            if (processosAtivos.length === 0) {
                tbody.innerHTML += `
                    <tr>
                        <td colspan="3" style="text-align: center; color: #9ca3af; padding-top: 10px;">
                            <em>Nenhum processo com uso significativo de CPU</em>
                        </td>
                    </tr>
                `;
            }
        })
        .catch(e => {
            console.log("Erro ao atualizar processos:", e);
            let tbody = document.getElementById("tbodyPID");
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #ef4444;">Erro ao carregar processos</td></tr>';
        });
}

// Inicialização
criarGraficos();
renderSlctMaquinas();

// Atualização automática a cada 2 segundos
setInterval(() => {
    if (maquinaAtual) {
        atualizar();
    }
}, 2000);

// Event listener para mudança de máquina
if (selectMaquina) {
    selectMaquina.addEventListener("change", function() {
        maquinaAtual = this.value;
        console.log("Máquina alterada para:", maquinaAtual);
        atualizar();
    });
}