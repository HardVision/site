// alertasD.js — versão atualizada

// ============================
// Utilidades de armazenamento
// ============================
function getStore() {
  // tenta primeiro sessionStorage (caso páginas sejam abertas por caminhos/portas diferentes)
  try {
    const s = sessionStorage.getItem('hv_alerts');
    if (s) return JSON.parse(s) || [];
  } catch {}
  // fallback para localStorage
  try {
    return JSON.parse(localStorage.getItem('hv_alerts')) || [];
  } catch {
    return [];
  }
}

// ============================
// Elementos da página
// ============================
const painel      = document.getElementById('painel-alertas');
const listaEl     = document.getElementById('lista');
const contadorEl  = document.getElementById('contador');

const caixaMaquinas = document.getElementById('maquinas');
const btnMaquinas   = document.getElementById('btn-maquinas');
const listaMaquinas = document.getElementById('menu-maquinas');

const selectPeriodo = document.getElementById('periodo');
const inputBusca    = document.getElementById('busca');
const searchBtn     = document.querySelector('.search-btn');

// ============================
// Estado dos filtros
// ============================
let maquinaFiltro = 1;
let periodoFiltro = selectPeriodo ? selectPeriodo.value : '30d';
let termoFiltro   = '';

// ============================
// Renderização da lista
// ============================
function renderizarAlertas(op) {
  const { maquina, periodo, termo } = op;

  listaEl.innerHTML = '';

  const agora   = Date.now();
  const ranges  = { '24h': 24*3600*1000, '7d': 7*24*3600*1000, '30d': 30*24*3600*1000, 'all': Number.MAX_SAFE_INTEGER };
  const janela  = ranges[periodo] || ranges['30d'];

  const norm = s => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const q    = norm(termo);

const dados = getStore()
  .filter(a => (!maquina || a.maquina === maquina))
  .filter(a => (agora - a.ts) <= janela)
  .filter(a => !q || norm(a.texto).includes(q) || norm(a.tipo).includes(q) || norm(a.nivel).includes(q))
  .sort((a,b) => b.ts - a.ts)
  .slice(0, 100); 


  contadorEl.textContent = `${dados.length} alertas`;

  for (let i = 0; i < dados.length; i++) {
    const a   = dados[i];
    const card = document.createElement('div');
    card.className = 'alerta';

    const nivelClass = a.nivel === 'Crítico' ? '' : a.nivel === 'Alto' ? 'alto' : 'medio';
    const dt   = new Date(a.ts);
    const hh   = dt.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    const dia  = dt.toLocaleDateString();

    let textoVisivel = a.texto || "";

// CPU
textoVisivel = textoVisivel.replace(/^CPU\s*\([^)]*\)\s*:\s*/i, 'CPU: ');

// Memória (aceita "Memória" e "Memoria")
textoVisivel = textoVisivel.replace(/^Mem[óo]ria\s*\([^)]*\)\s*:\s*/i, 'Memória: ');

// Disco
textoVisivel = textoVisivel.replace(/^Disco\s*\([^)]*\)\s*:\s*/i, 'Disco: ');

// Rede
textoVisivel = textoVisivel.replace(/^Rede\s*\([^)]*\)\s*:\s*/i, 'Rede: ');

// Fallback (caso já venha sem parênteses, mantém)
card.innerHTML = `
  <div class="head">
    <div class="tipo">${a.tipo}</div>
    <div class="nivel-label">Nível</div>
    <div class="nivel-value ${nivelClass}">${a.nivel}</div>
  </div>

  <div class="maquina">Máquina ${a.maquina}</div>
  <div class="texto">${textoVisivel}</div>

  <div class="info">
    <span class="data">${dia}, ${hh}</span>
  </div>
`;
    listaEl.appendChild(card);
  }

  if (!dados.length) {
    const vazio = document.createElement('div');
    vazio.className = 'alerta';
    vazio.innerHTML = `<div class="texto">Sem alertas no período/termo selecionado.</div>`;
    listaEl.appendChild(vazio);
  }
}

// alertasD.js
const btnLimpar = document.getElementById('btn-limpar');
if (btnLimpar) {
  btnLimpar.addEventListener('click', () => {
    // 1) limpa o campo de busca e o estado do filtro
    if (inputBusca) inputBusca.value = '';
    termoFiltro = '';

    // 2) apaga os alertas persistidos (ambos, para cobrir cenários de origem)
    try { sessionStorage.removeItem('hv_alerts'); } catch {}
    try { localStorage.removeItem('hv_alerts'); } catch {}

    // 3) re-renderiza usando o mesmo fluxo da busca
    aplicarBusca();
  });
}



// ============================
// Handlers de UI (máquina, período, busca)
// ============================
if (btnMaquinas) {
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

function aplicarBusca() {
  termoFiltro = inputBusca ? (inputBusca.value || '') : '';
  renderizarAlertas({ maquina: maquinaFiltro, periodo: periodoFiltro, termo: termoFiltro });
}

// remove a dependência do Enter — filtra automaticamente
if (inputBusca) {
  inputBusca.addEventListener('input', aplicarBusca);
  // pode manter o Enter também, não atrapalha:
  inputBusca.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') aplicarBusca(); });
}

// ============================
// Auto-refresh (sincroniza com monitoramento)
// ============================
function refreshSeVisivel() {
  if (document.visibilityState === 'visible') {
    renderizarAlertas({ maquina: maquinaFiltro, periodo: periodoFiltro, termo: termoFiltro });
  }
}
document.addEventListener('visibilitychange', refreshSeVisivel);
// atualiza periodicamente também (ex.: novos alertas chegando)
setInterval(refreshSeVisivel, 5000);

// Atualiza quando localStorage mudar em outra aba/janela
window.addEventListener('storage', (e) => {
  if (e.key === 'hv_alerts') {
    refreshSeVisivel();
  }
});

// ============================
// Inicialização
// ============================
renderizarAlertas({ maquina: maquinaFiltro, periodo: periodoFiltro, termo: termoFiltro });
