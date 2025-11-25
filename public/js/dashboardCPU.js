const selectMaquina = document.getElementById("selectMaquina");
const kpiUso = document.getElementById("kpiUso");
const kpiNucleosCriticos = document.getElementById("kpiNucleosCriticos");
const kpiProc = document.getElementById("kpiProc");

let chartCPU, chartNucleos;

function criarGraficos() {
    // CPU TOTAL (linha) - Histórico de 60 pontos
    chartCPU = new Chart(document.getElementById("graficoCpu"), {
        type: "line",
        data: {
            labels: Array(60).fill(""),
            datasets: [
                {
                    label: "Uso (%)",
                    data: Array(60).fill(0), // Inicializa com zeros
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

    // CPU POR NÚCLEO (barras)
    chartNucleos = new Chart(document.getElementById("chartNucleos"), {
        type: "bar",
        data: {
            labels: ["Núcleo 1", "Núcleo 2", "Núcleo 3", 
                     "Núcleo 4", "Núcleo 5", "Núcleo 6", "Núcleo 7"],//"Núcleo 0", 
            datasets: [
                {
                    label: "Uso (%)",
                    data: [0, 0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: function(context) {
                        const value = context.parsed.y;
                        if (value >= 80) return "#ef4444"; // Vermelho
                        if (value >= 60) return "#f59e0b"; // Amarelo
                        return "rgba(59, 130, 246, 0.65)"; // Azul
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

async function atualizar() {
    const idMaquina = selectMaquina?.value || 1;
    
    try {
        // 1. Buscar KPIs
        const kpis = await fetch(`/dashboard/cpu/kpis/${idMaquina}`)
            .then(r => {
                if (!r.ok) throw new Error('Erro ao buscar KPIs');
                return r.json();
            });
        
        // Atualizar KPIs na tela
        kpiUso.textContent = `${Math.round(kpis.uso_atual || 0)}%`;
        kpiNucleosCriticos.textContent = kpis.nucleos_acima_80 || 0;
        kpiProc.textContent = kpis.processos_ativos || 0;

        // 2. Histórico CPU (gráfico de linha)
        const usoCPU = await fetch(`/dashboard/cpu/uso/${idMaquina}`)
            .then(r => {
                if (!r.ok) throw new Error('Erro ao buscar histórico CPU');
                return r.json();
            });
        
        if (usoCPU.historico && Array.isArray(usoCPU.historico)) {
            // Pega os últimos 60 pontos
            const dados = usoCPU.historico.slice(-60);
            
            // Preenche com zeros se tiver menos de 60 pontos
            while (dados.length < 60) {
                dados.unshift(0);
            }
            
            chartCPU.data.datasets[0].data = dados;
            chartCPU.update('none'); // 'none' evita animação
        }

        // 3. Núcleos (gráfico de barras)
        const nucleos = await fetch(`/dashboard/cpu/nucleos/${idMaquina}`)
            .then(r => {
                if (!r.ok) throw new Error('Erro ao buscar núcleos');
                return r.json();
            });
        
        if (Array.isArray(nucleos)) {
            // Espera array de objetos: [{ valor: 45 }, { valor: 67 }, ...]
            const valores = nucleos.map(n => n.valor || 0);
            
            // Garante 8 núcleos (preenche com 0 se necessário)
            while (valores.length < 8) {
                valores.push(0);
            }
            
            chartNucleos.data.datasets[0].data = valores.slice(0, 8);
            chartNucleos.update('none');
        }

    } catch (erro) {
        console.error("Erro ao atualizar dashboard CPU:", erro);
        
        // Opcional: Mostrar mensagem de erro na tela
        // kpiUso.textContent = "Erro";
        // kpiNucleosCriticos.textContent = "Erro";
        // kpiProc.textContent = "Erro";
    }
}

// Popula o select de máquinas dinamicamente
async function carregarMaquinas() {
    try {
        const empresaId = sessionStorage.getItem("EMPRESA");
        if (!empresaId) {
            console.warn("ID da empresa não encontrado no sessionStorage");
            return;
        }

        const maquinas = await fetch(`/dashboard/select-maquina/${empresaId}`)
            .then(r => r.json());
        
        if (Array.isArray(maquinas) && maquinas.length > 0) {
            selectMaquina.innerHTML = ""; // Limpa opções padrão
            
            maquinas.forEach((maquina, index) => {
                const option = document.createElement("option");
                option.value = maquina.idMaquina;
                option.textContent = `Máquina ${index + 1}`;
                selectMaquina.appendChild(option);
            });
            
            // Após carregar, chama atualizar
            atualizar();
        }
    } catch (erro) {
        console.error("Erro ao carregar máquinas:", erro);
    }
}

// Inicialização
criarGraficos();
carregarMaquinas();

// Atualização automática a cada 3 segundos
setInterval(atualizar, 3000);

// Atualiza ao trocar máquina
if (selectMaquina) {
    selectMaquina.addEventListener("change", atualizar);
}