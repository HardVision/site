// Referências do DOM
const nomeUsuario = document.getElementById("nome_usuario");
const cargoUsuario = document.getElementById("cargo_usuario");
const dropdownContent = document.querySelector(".dropdown-content");
const btnMaquina = document.querySelector(".dropdown-btn");

// KPIs
const cardUsado = document.querySelectorAll(".card-value")[0]; 
const cardLivre = document.querySelectorAll(".card-value")[1];
const cardIOPS = document.querySelectorAll(".card-value")[2];

// Gráficos
let chartPie, chartBar, chartLine;
let idMaquinaAtual = sessionStorage.ID_MAQUINA;
const idEmpresa = sessionStorage.EMPRESA;

// =================== LÓGICA DO MENU MÁQUINAS (O QUE FALTA) ===================

// 1. Abrir/Fechar o menu ao clicar no botão
if (btnMaquina && dropdownContent) {
    btnMaquina.addEventListener("click", (e) => {
        e.stopPropagation(); // Impede que o clique feche imediatamente
        dropdownContent.classList.toggle("show"); // Adiciona/Tira a classe do CSS
    });
}

// 2. Fechar o menu se clicar fora dele
window.onclick = function(event) {
    // Fecha menu de máquinas
    if (!event.target.matches('.dropdown-btn') && !event.target.closest('.dropdown-btn')) {
        if (dropdownContent && dropdownContent.classList.contains('show')) {
            dropdownContent.classList.remove('show');
        }
    }

    // Fecha menu de visões (se estiver aberto também)
    if (!event.target.matches('.botao-maquinas')) {
        const menuVisoes = document.getElementById("visoes");
        if (menuVisoes && menuVisoes.classList.contains('show')) {
            menuVisoes.classList.remove('show');
        }
    }
}

// =================== FIM DO TRECHO FALTANTE ===================

// window.onload = ... (o resto do seu código continua igual)

// =================== INICIALIZAÇÃO ===================
window.onload = async () => {
  validarSessao();
  
  // Inicializa gráficos vazios para renderizar a estrutura
  inicializarGraficos();
  
  // Carrega lista de máquinas e dados
  await carregarMaquinas();
  
  // Loop de atualização
  setInterval(() => {
    if(idMaquinaAtual) atualizarDados();
  }, 5000);
};

function validarSessao() {
  if (sessionStorage.NOME) {
    nomeUsuario.innerHTML = sessionStorage.NOME;
    cargoUsuario.innerHTML = sessionStorage.PERMISSAO || "Usuário";
  } else {
    // window.location = "../login.html";
  }
}

// =================== MÁQUINAS ===================
async function carregarMaquinas() {
  try {
    // Atenção à rota definida no dashboardDisco.js (ex: /dashboard/disco/maquinas/...)
    const resp = await fetch(`/dashboard/disco/maquinas/${idEmpresa}`);
    
    if (resp.ok) {
      const maquinas = await resp.json();
      dropdownContent.innerHTML = "";

      maquinas.forEach((m, index) => {
        const link = document.createElement("a");
        link.href = "#";
        link.innerText = `Máquina ${index + 1} (MAC: ${m.macAddress})`;
        
        link.onclick = (e) => {
          e.preventDefault();
          mudarMaquina(m.idMaquina, `Máquina ${index + 1}`);
        };
        dropdownContent.appendChild(link);
      });

      // Seleciona a primeira se não tiver no session
      if (!idMaquinaAtual && maquinas.length > 0) {
        mudarMaquina(maquinas[0].idMaquina, "Máquina 1");
      } else if (idMaquinaAtual) {
        // Tenta achar o nome da maquina atual
        const atual = maquinas.find(m => m.idMaquina == idMaquinaAtual);
        if(atual) btnMaquina.innerHTML = `<b>Máquina Selecionada</b>`;
        atualizarDados();
      }
    }
  } catch (e) {
    console.error("Erro ao listar máquinas", e);
  }
}

function mudarMaquina(id, nome) {
  idMaquinaAtual = id;
  sessionStorage.ID_MAQUINA = id;
  btnMaquina.innerHTML = `<b>${nome}</b>`;
  atualizarDados();
}

// =================== GRÁFICOS (ApexCharts) ===================
function inicializarGraficos() {
  // 1. Pizza (Donut)
  const optPie = {
    series: [0, 0],
    chart: { type: 'donut', height: 250, background: 'transparent' },
    labels: ['Livre', 'Usado'],
    colors: ['#10b981', '#ef4444'],
    legend: { position: 'bottom', labels: { colors: '#fff' } },
    stroke: { show: false },
    dataLabels: { enabled: false }
  };
  chartPie = new ApexCharts(document.querySelector("#pieChart"), optPie);
  chartPie.render();

  // 2. Barras (Processos)
  const optBar = {
    series: [{ data: [] }],
    chart: { type: 'bar', height: 250, toolbar: { show: false }, background: 'transparent' },
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    xaxis: { categories: [], labels: { style: { colors: '#fff' } } },
    yaxis: { labels: { style: { colors: '#fff' } } },
    colors: ['#3b82f6'],
    grid: { borderColor: '#444' },
    dataLabels: { enabled: false }
  };
  chartBar = new ApexCharts(document.querySelector("#barChart"), optBar);
  chartBar.render();

  // 3. Linha (Histórico)
  const optLine = {
    series: [{ name: "Uso (%)", data: [] }],
    chart: { type: 'area', height: 300, toolbar: { show: false }, background: 'transparent' },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#8b5cf6'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1 } },
    xaxis: { categories: [], labels: { style: { colors: '#fff' } } },
    yaxis: { max: 100, labels: { style: { colors: '#fff' } } },
    grid: { borderColor: '#444' },
    dataLabels: { enabled: false }
  };
  chartLine = new ApexCharts(document.querySelector("#lineChart"), optLine);
  chartLine.render();
}

// =================== DADOS ===================
function atualizarDados() {
  fetchKpis();
  fetchHistorico();
  fetchProcessos();
}

async function fetchKpis() {
  try {
    const res = await fetch(`/dashboard/disco/kpi/${idMaquinaAtual}`);
    if(res.status === 204) return;
    
    const data = await res.json();
    
    // Atualiza textos
    cardUsado.innerText = `${data.usado} GB`;
    cardLivre.innerText = `${data.livre} GB`;
    
    // Simulação simples de IOPS baseado na % de uso para demo
    // (Ou você pode somar discoLido+discoRecebido dos processos se quiser exatidão)
    cardIOPS.innerText = `${Math.floor(data.porcentagem * 8.5)} IOPS`;

    // Cores
    cardUsado.className = `card-value ${data.porcentagem > 85 ? 'critical' : 'healthy'}`;

    // Atualiza Pizza
    chartPie.updateSeries([parseFloat(data.livre), parseFloat(data.usado)]);

  } catch(e) { console.error(e); }
}

async function fetchHistorico() {
  try {
    const res = await fetch(`/dashboard/disco/historico/${idMaquinaAtual}`);
    if(res.ok) {
      const data = await res.json();
      chartLine.updateOptions({ xaxis: { categories: data.map(d => d.momento) } });
      chartLine.updateSeries([{ data: data.map(d => d.valor) }]);
    }
  } catch(e) { console.error(e); }
}

async function fetchProcessos() {
  try {
    const res = await fetch(`/dashboard/disco/processos/${idMaquinaAtual}`);
    if(res.ok) {
      const data = await res.json();
      chartBar.updateOptions({ xaxis: { categories: data.map(d => d.nome) } });
      chartBar.updateSeries([{ data: data.map(d => d.usoDisco) }]);
    }
  } catch(e) { console.error(e); }
}

// Menu Dropdown e Navegação
const btnVisoes = document.getElementById("btn-visoes");
if (btnVisoes) {
  btnVisoes.addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("visoes").classList.toggle("show");
  });
  
  document.querySelectorAll("#menu-visoes button").forEach(btn => {
    btn.addEventListener("click", () => {
      const rota = {
        geral: "dashboard.html",
        rede: "dashboardRede.html",
        disco: "dashboardDisco.html",
        ram: "dashboardRam.html",
        cpu: "dashboardCpu.html"
      }[btn.dataset.view];
      if(rota) window.location.href = rota;
    });
  });
}

