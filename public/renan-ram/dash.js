document.addEventListener('DOMContentLoaded', () => {

  const TOTAL_RAM = 16;
  
  const mockUsoAtualLabels = ['-14s', '-13s', '-12s', '-11s', '-10s', '-9s', '-8s', '-7s', '-6s', '-5s', '-4s', '-3s', '-2s', '-1s', 'Agora'];
  const mockUsoAtualData = [60, 62, 61, 65, 64, 66, 68, 70, 69, 71, 73, 72, 75, 74, 76];

  
  let mockCurrentRamUsage = 76;

  
  const mockProgressaoDataParaMedia = [9.8, 10.1, 11.0, 10.5, 12.0, 11.8, 12.2]; 
  const media = mockProgressaoDataParaMedia.reduce((a, b) => a + b, 0) / mockProgressaoDataParaMedia.length;
  document.getElementById('kpi-uso-medio').textContent = `${media.toFixed(1)} GB`;


  document.getElementById('kpi-app-maior-uso').textContent = 'Chrome (2.8 GB)';

  const ramDisponivel = TOTAL_RAM - (TOTAL_RAM * (mockCurrentRamUsage / 100));
  document.getElementById('kpi-ram-disponivel').textContent = `${ramDisponivel.toFixed(1)} GB`;


  const chartGridColor = 'rgba(148, 163, 184, 0.2)';
  const chartFontColor = '#E2E8F0'; 
  const chartTooltipBg = '#0F172A'; 
  const chartBorderColor = '#334155'; 

  Chart.defaults.font.color = chartFontColor;
  Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: chartTooltipBg,
        titleColor: chartFontColor,
        bodyColor: chartFontColor,
        borderColor: chartBorderColor,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: {
          color: chartGridColor,
          drawBorder: false,
        },
        ticks: {
          color: chartFontColor,
        }
      },
      y: {
        grid: {
          color: chartGridColor,
          drawBorder: false,
        },
        ticks: {
          color: chartFontColor,
        },
        beginAtZero: true
      }
    }
  };
  
  const ctxUsoAtual = document.getElementById('grafico-uso-atual').getContext('2d');
  new Chart(ctxUsoAtual, {
    type: 'line',
    data: {
      labels: mockUsoAtualLabels,
      datasets: [{
        label: 'Uso de RAM (%)',
        data: mockUsoAtualData,
        borderColor: '#211daaff', 
        backgroundColor: 'rgba(227, 229, 232, 0.27)', 
        fill: true,
        tension: 0.3, 
        borderWidth: 2,
        pointBackgroundColor: '#ffffffff',
        pointRadius: 3,
        pointHoverRadius: 5
      }]
    },
    options: {
      ...chartOptions, 
      scales: {
        ...chartOptions.scales,
        y: { 
          ...chartOptions.scales.y,
          suggestedMin: 0,
          suggestedMax: 100, 
          ticks: {
            ...chartOptions.scales.y.ticks,
            callback: function(value) {
              return value + '%'; 
            }
          }
        }
      },
      plugins: {
        ...chartOptions.plugins,
        legend: { 
          position: 'top',
          align: 'end', 
          labels: {
            boxWidth: 12,
            padding: 15
          }
        }
      }
    }
  });


  const progressBar = document.getElementById('progressBar');
  const progressValue = document.getElementById('progressValue');

  function updateProgressBar(percentage) {
    progressBar.style.width = `${percentage}%`;
    progressValue.textContent = `${percentage}%`;

    progressBar.classList.remove('verde', 'amarelo', 'vermelho');

    if (percentage <= 69) {
      progressBar.classList.add('verde');
    } else if (percentage <= 79) {
      progressBar.classList.add('amarelo');
    } else {
      progressBar.classList.add('vermelho');
    }
  }

  updateProgressBar(mockCurrentRamUsage);


});