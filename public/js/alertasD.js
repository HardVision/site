// =============================
// MOCKS DE ALERTAS POR MÁQUINA
// =============================
const alertasMock = {
  1: [
    { tipo: "CPU", nivel: "Crítico", texto: "Pico acima de 95% por 3 min.", hora: "10:42" },
    { tipo: "RAM", nivel: "Alto", texto: "Consumo sustentado > 80% por 15 min.", hora: "09:18" },
    { tipo: "Disco", nivel: "Crítico", texto: "Uso do disco atingiu 95%.", hora: "01:03" }
  ],
  2: [
    { tipo: "CPU", nivel: "Médio", texto: "Atividade oscilando em torno de 70% por 10 min.", hora: "11:55" },
    { tipo: "Rede", nivel: "Alto", texto: "Tráfego elevado na interface principal.", hora: "11:12" },
    { tipo: "RAM", nivel: "Crítico", texto: "Memória acima de 90% há 20 min.", hora: "10:02" },
    { tipo: "Disco", nivel: "Médio", texto: "Espaço livre abaixo de 35%.", hora: "09:40" }
  ],
  3: [
    { tipo: "Disco", nivel: "Médio", texto: "Espaço livre abaixo de 30%.", hora: "09:30" },
    { tipo: "CPU", nivel: "Alto", texto: "Processamento intenso detectado.", hora: "08:50" },
    { tipo: "Rede", nivel: "Crítico", texto: "Perda de pacotes acima do limite tolerado.", hora: "07:41" },
    { tipo: "RAM", nivel: "Médio", texto: "Uso constante acima de 70% por 30 min.", hora: "07:10" }
  ]
};

// =============================
// RENDERIZAÇÃO DOS ALERTAS
// =============================
function renderizarAlertas(idMaquina) {
  const painel = document.querySelector('.painel');
  painel.innerHTML = ''; // limpa o painel

  const alertas = alertasMock[idMaquina];
  const contador = document.createElement('h3');
  contador.classList.add('contador-alertas');
  contador.textContent = ` ${alertas.length} alertas ativos`;
  painel.appendChild(contador);

  alertas.forEach(alerta => {
    const card = document.createElement('div');
    card.classList.add('alerta');

    // Define cor conforme nível
    let corNivel = '';
    if (alerta.nivel === 'Crítico') corNivel = '#ef4444';
    else if (alerta.nivel === 'Alto') corNivel = '#dc2626';
    else if (alerta.nivel === 'Médio') corNivel = '#f97316';

    // Estrutura do card
    card.innerHTML = `
      <div class="head">
        <div class="tipo">${alerta.tipo}</div>
        <div class="nivel-label">Nível</div>
        <div class="nivel-value" style="background:${corNivel};">${alerta.nivel}</div>
      </div>
      <div class="texto">${alerta.texto}</div>
      <div class="info">
        <span class="data">Hoje, ${alerta.hora}</span>
      </div>
    `;

    painel.appendChild(card);
  });
}

// =============================
// MENU DE MÁQUINAS
// =============================
const caixaMaquinas = document.getElementById('maquinas');
const btnMaquinas = document.getElementById('btn-maquinas');
const listaMaquinas = document.getElementById('menu-maquinas');

// alternar menu
btnMaquinas.addEventListener('click', e => {
  e.stopPropagation();
  caixaMaquinas.classList.toggle('show');
});

document.addEventListener('click', () => {
  caixaMaquinas.classList.remove('show');
});

// troca de máquina
listaMaquinas.querySelectorAll('button').forEach(botao => {
  botao.addEventListener('click', () => {
    const id = botao.getAttribute('data-target');
    btnMaquinas.textContent = `Máquina ${id}`;
    renderizarAlertas(id);
    caixaMaquinas.classList.remove('show');
  });
});

// =============================
// INICIALIZAÇÃO PADRÃO
// =============================
renderizarAlertas(1);
