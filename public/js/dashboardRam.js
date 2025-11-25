document.addEventListener('DOMContentLoaded', () => {

  const TOTAL_RAM = 16; 
  let maquinaAtual = 1; 

  const maxPontos = 15;
  let labels = Array(maxPontos).fill('');
  let dataRam = Array(maxPontos).fill(0);

  
  const chartFontColor = '#E2E8F0';
  const chartGridColor = 'rgba(148, 163, 184, 0.2)';
  
  const ctxUsoAtual = document.getElementById('grafico-uso-atual').getContext('2d');
  
  const graficoRam = new Chart(ctxUsoAtual, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Uso de RAM (%)',
        data: dataRam,
        borderColor: '#211daaff',
        backgroundColor: 'rgba(227, 229, 232, 0.27)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointBackgroundColor: '#ffffffff',
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500 }, 
      scales: {
        x: {
          grid: { color: chartGridColor, drawBorder: false },
          ticks: { display: false } // Oculta labels X para limpar o visual
        },
        y: {
          grid: { color: chartGridColor, drawBorder: false },
          ticks: { color: chartFontColor, callback: (value) => value + '%' },
          beginAtZero: true,
          max: 100
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: (context) => ` Uso: ${context.raw}%` }
        }
      }
    }
  });

  
  function updateProgressBar(percentage) {
    const progressBar = document.getElementById('progressBar');
    const progressValue = document.getElementById('progressValue');
    
    if(!progressBar || !progressValue) return;

    progressBar.style.width = `${percentage}%`;
    progressValue.textContent = `${percentage}%`;

    progressBar.classList.remove('verde', 'amarelo', 'vermelho');

    if (percentage <= 69) {
      progressBar.classList.add('verde');
    } else if (percentage <= 85) {
      progressBar.classList.add('amarelo');
    } else {
      progressBar.classList.add('vermelho');
    }
  }

  function updateKPIs(currentUsagePercent) {
    const kpiRamDisponivel = document.getElementById('kpi-ram-disponivel');
    
    if (kpiRamDisponivel) {
        const ramUsadaGB = (TOTAL_RAM * (currentUsagePercent / 100));
        const ramLivreGB = TOTAL_RAM - ramUsadaGB;
        kpiRamDisponivel.textContent = `${ramLivreGB.toFixed(1)} GB`;
    }
  }

  async function fetchKPIs(maquinaId) {
    try {
      const respMedia = await fetch(`/dashboard/kpi-ram-media/${maquinaId}`);
      if (respMedia && respMedia.ok) {
        const media = await respMedia.json();
        const elMedia = document.getElementById('kpi-uso-medio');
        if (elMedia) {
          elMedia.textContent = `${media.mediaGB ?? '--'} GB`;
        }
      }

      const respTop = await fetch(`/dashboard/kpi-top-app/${maquinaId}`);
      if (respTop && respTop.ok) {
        const top = await respTop.json();
        const elTop = document.getElementById('kpi-app-maior-uso');
        if (elTop) {
          const nome = top.nome || '—';
          const uso = top.usoGb !== undefined ? `${top.usoGb} GB` : (top.usoMb !== undefined ? `${(top.usoMb/1024).toFixed(1)} GB` : '--');
          elTop.textContent = `${nome} (${uso})`;
        }
      }
    } catch (err) {
      console.error('Erro ao buscar KPIs:', err);
    }
  }

 
  async function buscarDadosRam() {
      const select = document.getElementById("select-maquinas");
    try {
      const response = await fetch(`/dashboard/ram-tempo-real/${select.value}`);
      
      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const dados = await response.json();
      const valorAtual = dados.valor || 0;
      const horaAtual = dados.momento ? new Date(dados.momento).toLocaleTimeString() : '';

    
      labels.shift();
      dataRam.shift();

      labels.push(horaAtual);
      dataRam.push(valorAtual);

      graficoRam.update();

      updateProgressBar(valorAtual);

      updateKPIs(valorAtual);
      fetchKPIs(select.value)

    } catch (error) {
      console.error("Falha ao obter dados de RAM:", error);
    }
  }

 
  const btnMaquinas = document.getElementById('btn-maquinas');
  const listaMaquinas = document.getElementById('menu-maquinas');
  const caixaMaquinas = document.querySelector('.menu-maquinas'); 

  async function renderSlctMaquinas() {
  const resposta = await fetch(`/dashboard/select-maquina/${sessionStorage.EMPRESA}`);
  const maquinas = await resposta.json();
  console.log("Máquinas da empresa: ", maquinas)
  cont = 0;

  maquinas.forEach(maquina => {
    const select = document.getElementById("select-maquinas")

    cont++;
    select.innerHTML += `
            <option value="${maquina.idMaquina}">Máquina ${cont}</option>
        `;

  });

}

  if (btnMaquinas && listaMaquinas) {
    btnMaquinas.addEventListener('click', (e) => {
        e.stopPropagation();
        listaMaquinas.style.display = listaMaquinas.style.display === 'block' ? 'none' : 'block';
    });

    const botoes = listaMaquinas.querySelectorAll('button');
    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            maquinaAtual = btn.getAttribute('data-target');
            btnMaquinas.textContent = btn.textContent;
            listaMaquinas.style.display = 'none';
            
            dataRam.fill(0);
            graficoRam.update();
            const select = document.getElementById("select-maquinas");
        fetchKPIs(select.value);
        });
    });

    document.addEventListener('click', () => {
        listaMaquinas.style.display = 'none';
    });
  }

  renderSlctMaquinas();
  buscarDadosRam();

  const select = document.getElementById("select-maquinas");
  fetchKPIs(select.value);

  setInterval(buscarDadosRam, 2000);

});


// function irParaVisao() {
//     const selectElement = document.getElementById('selectVisao');
//     const caminhoRelativo = '../';

//     const nomeArquivo = selectElement.value;

//     if (nomeArquivo === "dashboardRam.html") {
//         return;
//     }

//     window.location.href = caminhoRelativo + 'dashboard/' + nomeArquivo;
// }