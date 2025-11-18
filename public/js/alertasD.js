// alertasD.js — versão corrigida e otimizada

// ============================
// Configurações
// ============================
const MAX_ITEMS = 30;            // limite de cards renderizados (evita inflar o DOM)
const REFRESH_THROTTLE = 12000;  // ms entre execuções forçadas do refresh automático
const DEBOUNCE_INPUT_MS = 250;   // ms debounce para campo de busca

// ============================
// Utilidades de armazenamento
// ============================
function getStore() {
  try {
    const s = sessionStorage.getItem('hv_alerts');
    if (s) return JSON.parse(s) || [];
  } catch { }
  try {
    return JSON.parse(localStorage.getItem('hv_alerts')) || [];
  } catch {
    return [];
  }
}

// ============================
// Helpers
// ============================
function safeText(s) {
  // garante string e remove valores nulos
  return (s === null || s === undefined) ? '' : String(s);
}

function normalizeString(s) {
  return (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function formatDateTs(ts) {
  const dt = new Date(ts);
  const hh = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dia = dt.toLocaleDateString();
  return { dia, hh };
}

function mapNivelClass(nivel) {
  // mapeia para classes CSS existentes (critico, alto, medio, abaixo)
  if (!nivel) return '';
  const nl = nivel.toString().toLowerCase();
  if (nl.includes('crít') || nl.includes('crit')) return 'critico';
  if (nl.includes('preocup') || nl.includes('alto')) return 'alto';
  if (nl.includes('abaix') || nl.includes('baixo')) return 'abaixo';
  return 'medio';
}

// ============================
// Elementos da página (checados)
// ============================
const painel = document.getElementById('painel-alertas');
const listaEl = document.getElementById('lista');
const contadorEl = document.getElementById('contador');

const caixaMaquinas = document.getElementById('maquinas');
const btnMaquinas = document.getElementById('btn-maquinas');
const listaMaquinas = document.getElementById('menu-maquinas');

const selectPeriodo = document.getElementById('periodo');
const inputBusca = document.getElementById('busca');
const btnLimpar = document.getElementById('btn-limpar');

// ============================
// Estado dos filtros
// ============================
let maquinaFiltro = 1;
let periodoFiltro = selectPeriodo ? selectPeriodo.value : '30d';
let termoFiltro = '';

// safety: se elemento não existir, ignora interações
if (!listaEl || !contadorEl) {
  console.error('Elementos principais não encontrados: #lista ou #contador');
}

// ============================
// Renderização da lista (otimizada)
// ============================
let lastRenderHash = '';
let lastRefreshAt = 0;

function renderizarAlertas(op = {}) {
  const maquina = ('maquina' in op) ? op.maquina : maquinaFiltro;
  const periodo = ('periodo' in op) ? op.periodo : periodoFiltro;
  const termo = ('termo' in op) ? op.termo : termoFiltro;

  if (!listaEl || !contadorEl) return;

  // cálculo de janela de tempo
  const agora = Date.now();
  const ranges = { '24h': 24 * 3600 * 1000, '7d': 7 * 24 * 3600 * 1000, '30d': 30 * 24 * 3600 * 1000, 'all': Number.MAX_SAFE_INTEGER };
  const janela = ranges[periodo] || ranges['30d'];

  const q = normalizeString(termo);

  // filtra e ordena
  const all = getStore();
  const filtrado = all
    .filter(a => (!maquina || maquina === 'all' ? true : Number(a.maquina) === Number(maquina)))
    .filter(a => (agora - (Number(a.ts) || 0)) <= janela)
    .filter(a => {
      if (!q) return true;
      return normalizeString(a.texto).includes(q) ||
        normalizeString(a.tipo).includes(q) ||
        normalizeString(a.nivel).includes(q);
    })
    .sort((a, b) => (Number(b.ts) || 0) - (Number(a.ts) || 0));

  // cria hash simples para evitar renders idênticos consecutivos (economia)
  const currentHash = `${filtrado.length}:${filtrado[0] ? (filtrado[0].ts || '') : ''}`;
  if (currentHash === lastRenderHash) {
    // nada mudou visivelmente
    return;
  }
  lastRenderHash = currentHash;

  // contador
  contadorEl.textContent = `${filtrado.length} alertas`;

  // construindo fragmento (evita múltiplas inserções no DOM)
  const frag = document.createDocumentFragment();

  // limita
  const dados = filtrado.slice(0, MAX_ITEMS);

  for (let i = 0; i < dados.length; i++) {
    const a = dados[i];

    // criar card por DOM API (sem innerHTML com dados do servidor)
    const card = document.createElement('div');
    card.className = 'alerta';

    // head
    const head = document.createElement('div');
    head.className = 'head';

    const tipoEl = document.createElement('div');
    tipoEl.className = 'tipo';
    tipoEl.textContent = safeText(a.tipo);

    const nivelLabel = document.createElement('div');
    nivelLabel.className = 'nivel-label';
    nivelLabel.textContent = 'Nível';

    const nivelValue = document.createElement('div');
    const nivelClass = mapNivelClass(a.nivel);
    nivelValue.className = `nivel-value ${nivelClass}`;
    nivelValue.textContent = safeText(a.nivel);

    head.appendChild(tipoEl);
    head.appendChild(nivelLabel);
    head.appendChild(nivelValue);

    // maquina
    const maquinaEl = document.createElement('div');
    maquinaEl.className = 'maquina';
    maquinaEl.textContent = `Máquina ${safeText(a.maquina)}`;

    // texto (usa textContent para evitar HTML e overflow inesperado)
    let textoVisivel = safeText(a.texto);

    // simplificações nas strings (as mesmas do seu código)
    textoVisivel = textoVisivel.replace(/^CPU\s*\([^)]*\)\s*:\s*/i, 'CPU: ');
    textoVisivel = textoVisivel.replace(/^Mem[óo]ria\s*\([^)]*\)\s*:\s*/i, 'Memória: ');
    textoVisivel = textoVisivel.replace(/^Disco\s*\([^)]*\)\s*:\s*/i, 'Disco: ');
    textoVisivel = textoVisivel.replace(/^Rede\s*\([^)]*\)\s*:\s*/i, 'Rede: ');

    const textoEl = document.createElement('div');
    textoEl.className = 'texto';
    // limitando visualização para evitar um cartão enorme (mostra até 800 chars por cartão,
    // mantendo overflow controlado pelo CSS)
    const MAX_CHAR_PREVIEW = 2000; // grande o suficiente, mas evitar extremos
    textoEl.textContent = textoVisivel.length > MAX_CHAR_PREVIEW
      ? textoVisivel.slice(0, MAX_CHAR_PREVIEW) + '…'
      : textoVisivel;

    // info (data/hora)
    const info = document.createElement('div');
    info.className = 'info';
    const spanData = document.createElement('span');
    spanData.className = 'data';
    const { dia, hh } = formatDateTs(a.ts);
    spanData.textContent = `${dia}, ${hh}`;
    info.appendChild(spanData);

    // montar card
    card.appendChild(head);
    card.appendChild(maquinaEl);
    card.appendChild(textoEl);
    card.appendChild(info);

    frag.appendChild(card);
  }

  // se vazio
  if (dados.length === 0) {
    const vazio = document.createElement('div');
    vazio.className = 'alerta';
    const txt = document.createElement('div');
    txt.className = 'texto';
    txt.textContent = 'Sem alertas no período/termo selecionado.';
    vazio.appendChild(txt);
    frag.appendChild(vazio);
  } else if (filtrado.length > MAX_ITEMS) {
    // aviso discreto: há mais alertas, não renderizados
    const aviso = document.createElement('div');
    aviso.className = 'alerta';
    const txt = document.createElement('div');
    txt.className = 'texto';
    txt.textContent = `Mostrando ${MAX_ITEMS} de ${filtrado.length} alertas. Use filtros para refinar.`;
    aviso.appendChild(txt);
    frag.appendChild(aviso);
  }

  // substitui o conteúdo da lista de forma performática
  listaEl.innerHTML = '';
  listaEl.appendChild(frag);
}

// ============================
// Limpar (botão) — já existente
// ============================
if (btnLimpar) {
  btnLimpar.addEventListener('click', () => {
    if (inputBusca) inputBusca.value = '';
    termoFiltro = '';
    try { sessionStorage.removeItem('hv_alerts'); } catch { }
    try { localStorage.removeItem('hv_alerts'); } catch { }
    renderizarAlertas({ maquina: maquinaFiltro, periodo: periodoFiltro, termo: termoFiltro });
  });
}

// ============================
// Handlers de UI (máquina, período, busca)
// ============================
if (btnMaquinas && caixaMaquinas) {
  btnMaquinas.addEventListener('click', (e) => {
    e.stopPropagation();
    caixaMaquinas.classList.toggle('show');
  });

  document.addEventListener('click', () => caixaMaquinas.classList.remove('show'));

  if (listaMaquinas) {
    const itens = listaMaquinas.querySelectorAll('button');
    for (let i = 0; i < itens.length; i++) {
      itens[i].addEventListener('click', () => {
        maquinaFiltro = Number(itens[i].getAttribute('data-target') || (i + 1));
        btnMaquinas.textContent = `Máquina ${maquinaFiltro}`;
        caixaMaquinas.classList.remove('show');
        renderizarAlertas({ maquina: maquinaFiltro, periodo: periodoFiltro, termo: termoFiltro });
      });
    }
  }
}

if (selectPeriodo) {
  selectPeriodo.addEventListener('change', () => {
    periodoFiltro = selectPeriodo.value;
    renderizarAlertas({ maquina: maquinaFiltro, periodo: periodoFiltro, termo: termoFiltro });
  });
}

// debounce para busca (reduz re-renders)
let buscaTimeout = null;
if (inputBusca) {
  inputBusca.addEventListener('input', () => {
    clearTimeout(buscaTimeout);
    buscaTimeout = setTimeout(() => {
      termoFiltro = inputBusca.value || '';
      renderizarAlertas({ maquina: maquinaFiltro, periodo: periodoFiltro, termo: termoFiltro });
    }, DEBOUNCE_INPUT_MS);
  });
  inputBusca.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(buscaTimeout);
      termoFiltro = inputBusca.value || '';
      renderizarAlertas({ maquina: maquinaFiltro, periodo: periodoFiltro, termo: termoFiltro });
    }
  });
}

// ============================
// Auto-refresh (sincroniza com monitoramento) - throttled
// ============================
function refreshSeVisivel() {
  const now = Date.now();
  if (document.visibilityState === 'visible' && (now - lastRefreshAt) > REFRESH_THROTTLE) {
    lastRefreshAt = now;
    renderizarAlertas({ maquina: maquinaFiltro, periodo: periodoFiltro, termo: termoFiltro });
  }
}
document.addEventListener('visibilitychange', refreshSeVisivel);
const autoRefreshId = setInterval(refreshSeVisivel, REFRESH_THROTTLE);

// Atualiza quando localStorage mudar em outra aba/janela
window.addEventListener('storage', (e) => {
  if (e.key === 'hv_alerts') {
    renderizarAlertas({ maquina: maquinaFiltro, periodo: periodoFiltro, termo: termoFiltro });
  }
});

// ============================
// Inicialização
// ============================
renderizarAlertas({ maquina: maquinaFiltro, periodo: periodoFiltro, termo: termoFiltro });

// export (opcional) para depuração
window._hv_alerts_render = renderizarAlertas;

async function renderGraficos() {
  document.addEventListener("DOMContentLoaded", async function () {

    // ==============================
    // 1. Buscar dados da API (linha)
    // ==============================
    const resposta = await fetch(`/dashboard/alertas-linha/${sessionStorage.EMPRESA}`);
    const dados = await resposta.json();

    const respostaBarra = await fetch(`/dashboard/alertas-barra/${sessionStorage.EMPRESA}`);
    const dadosBarra = await respostaBarra.json();
    const dadosOrdenado = dadosBarra.sort((a, b) => Number(b.totalAlertas) - Number(a.totalAlertas));
    console.log(dadosOrdenado[0])

    kpiComp.innerHTML = dadosOrdenado[0].tipoComponente;
    const totalCriticos = dados
      .filter(item => item.estado === "Crítico")
      .reduce((acumulador, item) => acumulador + Number(item.total_alertas), 0);

    kpiCrit.innerHTML = totalCriticos;
    const totalAlertas = dados
      .reduce((acc, item) => acc + Number(item.total_alertas), 0);

    // Cálculo da taxa (%)
    const taxaCriticos = totalAlertas > 0
      ? ((totalCriticos / totalAlertas) * 100).toFixed(1)
      : 0;

    // Exibir na KPI
    kpiTaxaCrit.innerHTML = `${taxaCriticos}%`;




    console.log("Dados linha recebidos:", dados);

    // --- Transformar dados do formato:
    // { dia_mes, estado, total_alertas }
    // em arrays separados para cada categoria

    const diasUnicos = [...new Set(dados.map(item => item.dia_mes))];

    const criticos = diasUnicos.map(dia => {
      const item = dados.find(x => x.dia_mes === dia && x.estado === "Crítico");
      return item ? Number(item.total_alertas) : 0;
    });

    const preocupantes = diasUnicos.map(dia => {
      const item = dados.find(x => x.dia_mes === dia && x.estado === "Preocupante");
      return item ? Number(item.total_alertas) : 0;
    });

    // Limitar aos últimos 7 dias
    const labelsLimitados = diasUnicos.slice(-7);
    const criticosLimitados = criticos.slice(-7);
    const preocupantesLimitados = preocupantes.slice(-7);

    // ==============================
    // 2. Criar datasets do gráfico
    // ==============================
    const dataLinha = {
      labels: labelsLimitados,
      datasets: [
        {
          label: "Crítico",
          data: criticosLimitados,
          fill: false,
          tension: 0.3,
          borderWidth: 2,
          borderColor: "red"
        },
        {
          label: "Preocupante",
          data: preocupantesLimitados,
          fill: false,
          tension: 0.3,
          borderWidth: 2,
          borderColor: "orange"
        }
      ]
    };

    // ==============================
    // 3. Configurações do gráfico
    // (mantido tudo que você pediu)
    // ==============================
    const configLinha = {
      type: 'line',
      data: dataLinha,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { bottom: 20 }
        },
        plugins: {
          legend: { labels: { font: { size: 11 } } }
        },
        scales: {
          x: {
            ticks: {
              font: { size: 11 },
              maxRotation: 30,
              minRotation: 30
            }
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { size: 11 } }
          }
        }
      }
    };

    // ==============================
    // 4. Renderizar gráfico de linha
    // ==============================
    const ctxLinha = document.getElementById("graficoLinha").getContext("2d");
    new Chart(ctxLinha, configLinha);



    // ========================================================
    // 5. GRÁFICO DE BARRAS — usando dados reais do backend
    // ========================================================

    // Ordenar tipos fixos para manter padrão visual
    const ordemTipos = ["CPU", "RAM", "Disco", "Rede"];

    // Montar os labels conforme dados recebidos
    const labelsBarra = ordemTipos;

    // Criar array de dados preenchidos na ordem certa
    const valoresBarra = ordemTipos.map(tipo => {
      const item = dadosBarra.find(x => x.tipoComponente === tipo);
      return item ? Number(item.totalAlertas) : 0;
    });

    console.log("Valores para gráfico de barra:", valoresBarra);

    // Construir gráfico
    const dataBar = {
      labels: labelsBarra,
      datasets: [{
        label: 'Quantidade de Alertas',
        data: valoresBarra,
        borderWidth: 1
      }]
    };

    const configBar = {
      type: 'bar',
      data: dataBar,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { bottom: 20 }
        },
        plugins: {
          legend: { labels: { font: { size: 11 } } }
        },
        scales: {
          x: {
            ticks: {
              font: { size: 11 },
              maxRotation: 30,
              minRotation: 30
            }
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { size: 11 } }
          }
        }
      }
    };

    const ctxBar = document.getElementById("graficoBarra").getContext("2d");
    new Chart(ctxBar, configBar);

  });
}


renderGraficos();