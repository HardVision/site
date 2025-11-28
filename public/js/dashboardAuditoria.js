document.addEventListener("DOMContentLoaded", async function () {

let contadorAlertas = 0;
let linkAlertas = document.getElementById("link-alertas") || document.querySelector('a[href="alertas.html"]');
let badge = document.getElementById("badgeAlertas");

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

    
  try {
    const nomeLogado =
      sessionStorage.NOME ||
      sessionStorage.NOME_USUARIO ||
      sessionStorage.EMAIL ||
      "";
    const permissaoLogado =
      sessionStorage.PERMISSAO || sessionStorage.PERM || "";
    const elNomeSidebar = document.querySelector(".nome-usuario");
    const elCargoSidebar = document.querySelector(".cargo-usuario");
    if (elNomeSidebar && nomeLogado) elNomeSidebar.textContent = nomeLogado;
    if (elCargoSidebar && permissaoLogado)
      elCargoSidebar.textContent = permissaoLogado;
  } catch (e) {
    console.debug(
      "[auditoria] não foi possível preencher sidebar com sessão:",
      e
    );
  }



  async function buscarLoginsPorHora() {
    try {
      const resposta = await fetch("/auditoria/hora/hoje");
      if (!resposta.ok) {
        console.debug(
          "[auditoria] /auditoria/hora/hoje respondeu com status",
          resposta.status
        );
        return new Array(24).fill(0);
      }
      const dados = await resposta.json();
      console.debug("[auditoria] dados hora/hoje ->", dados);

      const horas = Array.from({ length: 24 }, (_, i) => i);
      const valores = new Array(24).fill(0);

      dados.forEach((linha) => {
        if (linha.hora !== null && linha.hora !== undefined) {
          valores[linha.hora] = linha.total;
        }
      });

      return valores;
    } catch (erro) {
      return new Array(24).fill(0);
    }
  }

  async function buscarTentativasSemana() {
    try {
      const resposta = await fetch("/auditoria/dia?days=7");
      if (!resposta.ok) {
        console.debug(
          "[auditoria] /auditoria/dia/logins?days=7 respondeu com",
          resposta.status
        );
        return { labels: [], valores: [] };
      }
      const dados = await resposta.json();
      console.debug("[auditoria] dados dia/logins ->", dados);

      const labels = dados.map((d) => d.data);
      const valores = dados.map((d) => d.total);

      return { labels, valores };
    } catch (erro) {
      return { labels: [], valores: [] };
    }
  }

  async function buscarEventosPorTipo() {
    try {
      const resposta = await fetch("/auditoria/tipo/ultimas24h");
      if (!resposta.ok) {
        console.debug(
          "[auditoria] /auditoria/tipo/ultimas24h respondeu com",
          resposta.status
        );
        return { labels: [], valores: [] };
      }
      const dados = await resposta.json();
      console.debug("[auditoria] dados tipo (ultimas24h) ->", dados);

      const eventosBrutos = dados.map((d) => ({
        tipo: d.tipo || d.tipoAcao,
        total: d.total,
      }));

      // agrupar tipos de falha em um único rótulo 'Falha de login'
      const eventosAgrupados = {};
      const tiposFalha = [
        "login_falha",
        "falha_login",
        "erro_login",
        "login_falha_email",
        "login_falha_senha",
      ];

      eventosBrutos.forEach((evento) => {
        const tipo = evento.tipo;
        if (tiposFalha.includes((tipo || "").toLowerCase())) {
          eventosAgrupados["Falha de login"] =
            (eventosAgrupados["Falha de login"] || 0) + (evento.total || 0);
        } else {
          eventosAgrupados[tipo] =
            (eventosAgrupados[tipo] || 0) + (evento.total || 0);
        }
      });

      const labels = Object.keys(eventosAgrupados);
      const valores = labels.map((label) => eventosAgrupados[label]);

      return { labels, valores };
    } catch (erro) {
      return { labels: [], valores: [] };
    }
  }

  async function buscarKPIs() {
    try {
      const resposta = await fetch("/auditoria/kpis");
      if (!resposta.ok) {
        console.debug(
          "[auditoria] /auditoria/kpis respondeu com",
          resposta.status
        );
        return {
          totalUsuarios: 0,
          loginsRealizados: 0,
          tentativasLogin: 0,
          falhasLogin: 0,
          porTipo: {},
          usuariosUnicos: 0,
          falhasPorCausa: {},
        };
      }
      const dados = await resposta.json();
      console.debug("[auditoria] dados kpis ->", dados);
      return dados;
    } catch (erro) {
      return {
        totalUsuarios: 0,
        loginsRealizados: 0,
        tentativasLogin: 0,
        falhasLogin: 0,
        porTipo: {},
        usuariosUnicos: 0,
        falhasPorCausa: {},
      };
    }
  }

  const rotulosHoras = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  let dadosLogins = await buscarLoginsPorHora();

  const canvasLogins = document.getElementById("grafico-logins");
  if (canvasLogins) {
    const contextoLogins = canvasLogins.getContext("2d");

    if (window.graficoLogins) window.graficoLogins.destroy();

    window.graficoLogins = new Chart(contextoLogins, {
      type: "line",
      data: {
        labels: rotulosHoras,
        datasets: [
          {
            label: "Logins",
            data: dadosLogins,
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "#e5e7eb",
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "rgb(59, 130, 246)",
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Hora do dia",
              color: "#9ca3af",
              font: {
                size: 12,
                weight: "bold",
              },
            },
            ticks: {
              color: "#9ca3af",
              maxRotation: 45,
              minRotation: 0,
            },
            grid: {
              color: "rgba(156, 163, 175, 0.1)",
            },
          },
          y: {
            title: {
              display: true,
              text: "Quantidade de Logins",
              color: "#9ca3af",
              font: {
                size: 12,
                weight: "bold",
              },
            },
            ticks: {
              color: "#9ca3af",
              beginAtZero: true,
              stepSize: 1,
            },
            grid: {
              color: "rgba(156, 163, 175, 0.1)",
            },
          },
        },
      },
    });
  }

if (!badge && linkAlertas) {
  badge = document.createElement("span");
  badge.id = "badgeAlertas";
  badge.className = "badge";
  badge.hidden = true;
  linkAlertas.style.position = "relative"; // garante alinhamento
  linkAlertas.appendChild(badge);
}

async function atualizarBadge() {
  console.log("estou no atualizarBadge()")
  try {
    const resp = await fetch(`/dashboard/alertas-card/${sessionStorage.EMPRESA}`);
    console.log(resp)
    if (resp.ok) {
      const dados = await resp.json();
    console.log(dados)
    console.log(badge)
      if (badge) {
        badge.textContent = dados.length;
        badge.hidden = dados.length === 0;
      }
    }
  } catch (e) {
    console.log("#ERRO badge:", e);
  }
}

atualizarBadge();
setInterval(atualizarBadge, 2000)

  async function atualizarKPIs() {
    const kpis = await buscarKPIs();

    const elUsuarios = document.getElementById("kpi_users");
    if (elUsuarios) {
      elUsuarios.textContent = kpis.totalUsuarios || 0;
    }

    const elTentativas = document.getElementById("kpi_login_attempts");
    if (elTentativas) {
      if (
        typeof kpis.loginsRealizados !== "undefined" &&
        kpis.loginsRealizados !== null
      ) {
        elTentativas.textContent = kpis.loginsRealizados || 0;
      } else {
        try {
          const total = Array.isArray(dadosLogins)
            ? dadosLogins.reduce((a, b) => a + (Number(b) || 0), 0)
            : 0;
          elTentativas.textContent = total || 0;
        } catch (e) {
          elTentativas.textContent = 0;
        }
      }
    }
    const elInfoBtn = document.getElementById("kpi_login_info_btn");
    const elInfoPopup = document.getElementById("kpi_info_popup");
    if (elInfoPopup) {
      const unico = kpis.usuariosUnicos || 0;
      const causas = kpis.falhasPorCausa || {};
      const senha = causas.senha_incorreta || 0;
      const email = causas.email_incorreto || 0;
      const outros = causas.outros || 0;

      elInfoPopup.innerHTML = `<div style="font-weight:700;margin-bottom:6px">Informações</div>
        <div style="font-size:13px;margin-bottom:6px">Usuários distintos (24h): <strong>${unico}</strong></div>
        <div style="font-size:13px">Falhas:</div>
        <div style="font-size:13px;margin-left:8px">Senha: <strong>${senha}</strong></div>
        <div style="font-size:13px;margin-left:8px">Email: <strong>${email}</strong></div>
        ${
          outros > 0
            ? `<div style="font-size:13px;margin-left:8px">Outros: <strong>${outros}</strong></div>`
            : ""
        }
      `;
    }

    if (elInfoBtn && elInfoPopup) {
      elInfoBtn.onclick = function (evt) {
        evt.stopPropagation();
        if (
          elInfoPopup.style.display === "none" ||
          !elInfoPopup.style.display
        ) {
          elInfoPopup.style.display = "block";
        } else {
          elInfoPopup.style.display = "none";
        }
      };

      document.addEventListener("click", function (e) {
        if (!elInfoPopup.contains(e.target) && e.target !== elInfoBtn) {
          elInfoPopup.style.display = "none";
        }
      });
    }

    const elFalhas = document.getElementById("kpi_failed_logins");
    if (elFalhas) {
      // preferir valor do backend; se 0, tentar mostrar soma do breakdown (email + senha + outros)
      const backendFalhas =
        typeof kpis.falhasLogin !== "undefined"
          ? Number(kpis.falhasLogin)
          : NaN;
      if (!isNaN(backendFalhas) && backendFalhas > 0) {
        elFalhas.textContent = backendFalhas;
      } else {
        const causas = kpis.falhasPorCausa || {};
        const totalPorCausa =
          (causas.senha_incorreta || 0) +
          (causas.email_incorreto || 0) +
          (causas.outros || 0);
        elFalhas.textContent = totalPorCausa || 0;
      }
    }

    const elBreakdown = document.getElementById("kpi_failed_breakdown");
    if (elBreakdown) {
      const causas = kpis.falhasPorCausa || {};
      const senha = causas.senha_incorreta || 0;
      const email = causas.email_incorreto || 0;
      elBreakdown.textContent =
        `Falhas: senha ${senha} • email ${email}` +
        (causas.outros && causas.outros > 0
          ? ` • outros ${causas.outros}`
          : "");
    }
  }

  await atualizarKPIs();

  const semana = await buscarTentativasSemana();

  const labelsFormatadas = semana.labels.map((data) => {
    if (data) {
      const dataObj = new Date(data);
      const dia = String(dataObj.getDate()).padStart(2, "0");
      const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
      return `${dia}/${mes}`;
    }
    return data;
  });

  const canvasTentativas = document.getElementById("grafico-tentativas");
  if (canvasTentativas) {
    const contextoTentativas = canvasTentativas.getContext("2d");

    if (window.graficoTentativasSemana)
      window.graficoTentativasSemana.destroy();

    window.graficoTentativasSemana = new Chart(contextoTentativas, {
      type: "bar",
      data: {
        labels: labelsFormatadas,
        datasets: [
          {
            label: "Logins efetuados",
            data: semana.valores,
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            borderColor: "rgb(59, 130, 246)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "#e5e7eb",
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "rgb(59, 130, 246)",
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Data",
              color: "#9ca3af",
              font: {
                size: 12,
                weight: "bold",
              },
            },
            ticks: {
              color: "#9ca3af",
              maxRotation: 45,
              minRotation: 0,
            },
            grid: {
              color: "rgba(156, 163, 175, 0.1)",
            },
          },
          y: {
            title: {
              display: true,
              text: "Quantidade de logins",
              color: "#9ca3af",
              font: {
                size: 12,
                weight: "bold",
              },
            },
            ticks: {
              color: "#9ca3af",
              beginAtZero: true,
              stepSize: 1,
            },
            grid: {
              color: "rgba(156, 163, 175, 0.1)",
            },
          },
        },
      },
    });
  }

  const eventos = await buscarEventosPorTipo();

  const traducoes = {
    login_sucesso: "Login sucesso",
    "Falha de login": "Falha de login",
    tentativa_login: "Tentativa de login",
    login: "Login",
    criacao_metrica: "Criação de métrica",
    criacao_incidente: "Criação de incidente",
    criacao_maquina: "Criação de máquina",
    alteracao_perfil: "Alteração de perfil",
    cadastro_usuario: "Cadastro de usuário",
    logoff_exclusao_usuario: "Logoff/Exclusão de usuário",
  };

  const labelsTraduzidas = eventos.labels.map((label) => {
    return traducoes[label] || label;
  });

  const cores = [
    "rgba(59, 130, 246, 0.85)", // azul
    "rgba(99, 102, 241, 0.85)", // indigo
    "rgba(139, 92, 246, 0.85)", // roxo
    "rgba(236, 72, 153, 0.85)", // rosa
    "rgba(14, 165, 233, 0.85)", // ciano/azul claro
    "rgba(99, 102, 241, 0.6)", // indigo claro
    "rgba(120, 113, 255, 0.6)", // lavanda
    "rgba(107, 114, 128, 0.85)", // cinza
  ];

  const canvasEventos = document.getElementById("grafico-eventos");
  if (canvasEventos) {
    const contextoEventos = canvasEventos.getContext("2d");

    if (window.graficoAcoes) window.graficoAcoes.destroy();

    window.graficoAcoes = new Chart(contextoEventos, {
      type: "pie",
      data: {
        labels: labelsTraduzidas,
        datasets: [
          {
            data: eventos.valores,
            backgroundColor: cores.slice(0, eventos.valores.length),
            borderColor: "#1f2937",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "right",
            labels: {
              color: "#e5e7eb",
              font: {
                size: 12,
              },
              padding: 15,
              usePointStyle: true,
            },
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "#4b5563",
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  setInterval(async () => {
    await atualizarKPIs();

    const novosDadosLogins = await buscarLoginsPorHora();
    if (window.graficoLogins) {
      window.graficoLogins.data.datasets[0].data = novosDadosLogins;
      dadosLogins = novosDadosLogins;
      window.graficoLogins.update("none");
    }

    const novaSemana = await buscarTentativasSemana();
    if (window.graficoTentativasSemana && novaSemana.labels.length > 0) {
      const labelsFormatadas = novaSemana.labels.map((data) => {
        if (data) {
          const dataObj = new Date(data);
          const dia = String(dataObj.getDate()).padStart(2, "0");
          const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
          return `${dia}/${mes}`;
        }
        return data;
      });
      window.graficoTentativasSemana.data.labels = labelsFormatadas;
      window.graficoTentativasSemana.data.datasets[0].data = novaSemana.valores;
      window.graficoTentativasSemana.update("none");
    }

    const novosEventos = await buscarEventosPorTipo();
    if (window.graficoAcoes && novosEventos.labels.length > 0) {
      const traducoes = {
        login_sucesso: "Login sucesso",
        "Falha de login": "Falha de login",
        tentativa_login: "Tentativa de login",
        login: "Login",
        criacao_metrica: "Criação de métrica",
        criacao_incidente: "Criação de incidente",
        criacao_maquina: "Criação de máquina",
        alteracao_perfil: "Alteração de perfil",
        cadastro_usuario: "Cadastro de usuário",
        logoff_exclusao_usuario: "Logoff/Exclusão de usuário",
      };
      const labelsTraduzidas = novosEventos.labels.map(
        (label) => traducoes[label] || label
      );
      window.graficoAcoes.data.labels = labelsTraduzidas;
      window.graficoAcoes.data.datasets[0].data = novosEventos.valores;
      window.graficoAcoes.update("none");
    }
  }, 30000);

  const btnAtualizar = document.querySelector(".relatorio");
  if (btnAtualizar) {
    btnAtualizar.addEventListener("click", async () => {
      await atualizarKPIs();

      const novosDadosLogins = await buscarLoginsPorHora();
      if (window.graficoLogins) {
        window.graficoLogins.data.datasets[0].data = novosDadosLogins;
        // atualizar variável para que a 2ª KPI reflita esses dados
        dadosLogins = novosDadosLogins;
        window.graficoLogins.update();
      }

      const novaSemana = await buscarTentativasSemana();
      if (window.graficoTentativasSemana && novaSemana.labels.length > 0) {
        const labelsFormatadas = novaSemana.labels.map((data) => {
          if (data) {
            const dataObj = new Date(data);
            const dia = String(dataObj.getDate()).padStart(2, "0");
            const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
            return `${dia}/${mes}`;
          }
          return data;
        });
        window.graficoTentativasSemana.data.labels = labelsFormatadas;
        window.graficoTentativasSemana.data.datasets[0].data =
          novaSemana.valores;
        window.graficoTentativasSemana.update();
      }

      const novosEventos = await buscarEventosPorTipo();
      if (window.graficoAcoes && novosEventos.labels.length > 0) {
        const traducoes = {
          login_sucesso: "Login sucesso",
          "Falha de login": "Falha de login",
          tentativa_login: "Tentativa de login",
          login: "Login",
          criacao_metrica: "Criação de métrica",
          criacao_incidente: "Criação de incidente",
          criacao_maquina: "Criação de máquina",
          alteracao_perfil: "Alteração de perfil",
          cadastro_usuario: "Cadastro de usuário",
          logoff_exclusao_usuario: "Logoff/Exclusão de usuário",
        };
        const labelsTraduzidas = novosEventos.labels.map((label) => {
          return traducoes[label] || label;
        });
        window.graficoAcoes.data.labels = labelsTraduzidas;
        window.graficoAcoes.data.datasets[0].data = novosEventos.valores;
        window.graficoAcoes.update();
      }
    });
  }

   function iniciarPainel() {
        let nomeUsuario = document.getElementById("nome_usuario");
        nomeUsuario.innerHTML = sessionStorage.NOME;
        
        let cargoUsuario = document.getElementById("cargo_usuario");
        cargoUsuario.innerHTML = sessionStorage.PERMISSAO;
    }

iniciarPainel();

});

