const selectMaquina = document.getElementById("select-maquinas");
const kpiUso = document.getElementById("kpiUso");
const kpiNucleosCriticos = document.getElementById("kpiNucleosCriticos");
const kpiProc = document.getElementById("kpiProc");

let contadorAlertas = 0;
let linkAlertas = document.getElementById("link-alertas") || document.querySelector('a[href="alertas.html"]');
let badge = document.getElementById("badgeAlertas");

let chartCPU, chartNucleos;

let maquinaAtual = Number(sessionStorage.ID_MAQUINA) || 1;

async function renderSlctMaquinas() {
  const resposta = await fetch(`/dashboard/select-maquina/${sessionStorage.EMPRESA}`);
  const maquinas = await resposta.json();
  console.log("Máquinas da empresa: ", maquinas)
    let cont = 0;
    const select = document.getElementById("select-maquinas");
    if (!select) return;

    
    select.innerHTML = "";
    maquinas.forEach((maquina) => {
        cont++;
        select.innerHTML += `\n            <option value="${maquina.idMaquina}">Máquina ${cont}</option>`;
    });

    // Seleciona a máquina atual se existir, senão escolhe a primeira
    if (select.querySelector(`option[value="${maquinaAtual}"]`)) {
        select.value = String(maquinaAtual);
    } else if (select.options.length > 0) {
        maquinaAtual = Number(select.options[0].value) || 1;
        select.value = String(maquinaAtual);
        sessionStorage.ID_MAQUINA = maquinaAtual;
    }

    // Atualiza ao mudar
    select.addEventListener("change", () => {
        maquinaAtual = Number(select.value) || 1;
        sessionStorage.ID_MAQUINA = maquinaAtual;
        atualizar();
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
                    return "rgba(148, 163, 184, 0.3)";
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
            duration: 300
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
    const select = document.getElementById("select-maquinas")
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

    const select = document.getElementById("select-maquinas")
    fetch(`/dashboard/cpu/processos/${select.value}`)
        .then(res => res.json())
        .then(lista => {
            let tbody = document.getElementById("tbodyPID");
            tbody.innerHTML = "";

            if (!lista || lista.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #94a3b8;">Nenhum processo encontrado</td></tr>';
                return;
            }   

            const processosAtivos = lista
                .filter(p => parseFloat(p.usoCPU) > 0)
                .sort((a, b) => parseFloat(b.usoCPU) - parseFloat(a.usoCPU))
                .slice(0, 20);

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


// ===== MENU DE VISÕES =====
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

if (btnVisoes) btnVisoes.textContent = "CPU";

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

const caixaMaquinas = document.getElementById("maquinas");
const btnMaquinas = document.getElementById("btn-maquinas");
const listaMaquinas = document.getElementById("menu-maquinas");



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
  const select = document.getElementById("select-maquinas");
  console.log(badge)

  console.log(sessionStorage.EMPRESA)

  try {
    const resp = await fetch(
      `/dashboard/alertas-card/${sessionStorage.EMPRESA}`
    );

    console.log(resp)
    if (resp.ok) {
      const dados = await resp.json();
      console.log(dados.length)
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

// Inicialização
criarGraficos();
renderSlctMaquinas();
atualizarBadge();

// Atualização automática a cada 2 segundos
setInterval(() => {
    atualizarBadge();
    atualizar()
}, 2000);

