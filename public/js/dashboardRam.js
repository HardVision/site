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

/* ============================================================
   NOVO — SELETOR DE VISÃO
============================================================ */

const caixaVisoes = document.getElementById("visoes");
const btnVisoes = document.getElementById("btn-visoes");
const listaVisoes = document.getElementById("menu-visoes");

const mapaVisoes = {
  geral: "dashboard.html",
  rede: "dashboardRede.html",
  disco: "dashboardDisco.html",
  ram: "dashboardRam.html",
 cpu: "cpuComp.html",

};

// nome padrão
if (btnVisoes) btnVisoes.textContent = "Geral";

// mostrar / esconder
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
        window.location.href = mapaVisoes[qual]; // troca de dashboard
      }
      caixaVisoes.classList.remove("show");
    });
  });
}



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

 
  async function buscarDadosRam() {
    try {
      const response = await fetch(`/dashboard/ram-tempo-real/${maquinaAtual}`);
      
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

    } catch (error) {
      console.error("Falha ao obter dados de RAM:", error);
    }
  }

 
  const btnMaquinas = document.getElementById('btn-maquinas');
  const listaMaquinas = document.getElementById('menu-maquinas');
  const caixaMaquinas = document.querySelector('.menu-maquinas'); // Ajuste para o container se necessário

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
        });
    });

    document.addEventListener('click', () => {
        listaMaquinas.style.display = 'none';
    });
  }

  
  buscarDadosRam();

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