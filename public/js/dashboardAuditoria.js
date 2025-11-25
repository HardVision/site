document.addEventListener('DOMContentLoaded', async function () {

  async function buscarLoginsPorHora() {
    try {
      const resposta = await fetch("/auditoria/hora/hoje");
      if (!resposta.ok) {
        return new Array(24).fill(0);
      }
      const dados = await resposta.json();

      const horas = Array.from({ length: 24 }, (_, i) => i);
      const valores = new Array(24).fill(0);

      dados.forEach(linha => {
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
        return { labels: [], valores: [] };
      }
      const dados = await resposta.json();

      const labels = dados.map(d => d.data);
      const valores = dados.map(d => d.total);

      return { labels, valores };
    } catch (erro) {
      return { labels: [], valores: [] };
    }
  }

  async function buscarEventosPorTipo() {
    try {
      const resposta = await fetch("/auditoria/tipo");
      if (!resposta.ok) {
        return { labels: [], valores: [] };
      }
      const dados = await resposta.json();

      const eventosBrutos = dados.map(d => ({
        tipo: d.tipo || d.tipoAcao,
        total: d.total
      }));

      const eventosAgrupados = {};
      const tiposFalha = ['login_falha', 'falha_login', 'erro_login'];
      
      eventosBrutos.forEach(evento => {
        const tipo = evento.tipo;
        
        if (tiposFalha.includes(tipo)) {
          if (!eventosAgrupados['Falha de login']) {
            eventosAgrupados['Falha de login'] = 0;
          }
          eventosAgrupados['Falha de login'] += evento.total;
        } else {
          if (!eventosAgrupados[tipo]) {
            eventosAgrupados[tipo] = 0;
          }
          eventosAgrupados[tipo] += evento.total;
        }
      });

      const labels = Object.keys(eventosAgrupados);
      const valores = labels.map(label => eventosAgrupados[label]);

      return { labels, valores };
    } catch (erro) {
      return { labels: [], valores: [] };
    }
  }

  async function buscarKPIs() {
    try {
      const resposta = await fetch("/auditoria/kpis");
      if (!resposta.ok) {
        return { totalUsuarios: 0, tentativasLogin: 0, falhasLogin: 0, porTipo: {} };
      }
      const dados = await resposta.json();
      return dados;
    } catch (erro) {
      return { totalUsuarios: 0, tentativasLogin: 0, falhasLogin: 0, porTipo: {} };
    }
  }

  const rotulosHoras = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const dadosLogins = await buscarLoginsPorHora();

  const canvasLogins = document.getElementById('grafico-logins');
  if (canvasLogins) {
    const contextoLogins = canvasLogins.getContext('2d');

    if (window.graficoLogins) window.graficoLogins.destroy();

    window.graficoLogins = new Chart(contextoLogins, {
      type: 'line',
      data: {
        labels: rotulosHoras,
        datasets: [{
          label: 'Logins',
          data: dadosLogins,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#e5e7eb',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Hora do Dia',
              color: '#9ca3af',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            ticks: {
              color: '#9ca3af',
              maxRotation: 45,
              minRotation: 0
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.1)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Quantidade de Logins',
              color: '#9ca3af',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            ticks: {
              color: '#9ca3af',
              beginAtZero: true,
              stepSize: 1
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.1)'
            }
          }
        }
      }
    });
  }

  async function atualizarKPIs() {
    const kpis = await buscarKPIs();

    const elUsuarios = document.getElementById('kpi_users');
    if (elUsuarios) {
      elUsuarios.textContent = kpis.totalUsuarios || 0;
    }

    const elTentativas = document.getElementById('kpi_login_attempts');
    if (elTentativas) {
      elTentativas.textContent = kpis.tentativasLogin || 0;
    }

    const elFalhas = document.getElementById('kpi_failed_logins');
    if (elFalhas) {
      elFalhas.textContent = kpis.falhasLogin || 0;
    }
  }

  await atualizarKPIs();

  const semana = await buscarTentativasSemana();
  
  const labelsFormatadas = semana.labels.map(data => {
    if (data) {
      const dataObj = new Date(data);
      const dia = String(dataObj.getDate()).padStart(2, '0');
      const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
      return `${dia}/${mes}`;
    }
    return data;
  });

  const canvasTentativas = document.getElementById('grafico-tentativas');
  if (canvasTentativas) {
    const contextoTentativas = canvasTentativas.getContext('2d');

    if (window.graficoTentativasSemana) window.graficoTentativasSemana.destroy();

    window.graficoTentativasSemana = new Chart(contextoTentativas, {
      type: 'bar',
      data: {
        labels: labelsFormatadas,
        datasets: [{
          label: "Tentativas",
          data: semana.valores,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#e5e7eb',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Data',
              color: '#9ca3af',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            ticks: {
              color: '#9ca3af',
              maxRotation: 45,
              minRotation: 0
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.1)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Quantidade de Tentativas',
              color: '#9ca3af',
              font: {
                size: 12,
                weight: 'bold'
              }
            },
            ticks: {
              color: '#9ca3af',
              beginAtZero: true,
              stepSize: 1
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.1)'
            }
          }
        }
      }
    });
  }

  const eventos = await buscarEventosPorTipo();

  const traducoes = {
    'login_sucesso': 'Login sucesso',
    'Falha de login': 'Falha de login',
    'tentativa_login': 'Tentativa de login',
    'login': 'Login',
    'criacao_metrica': 'Criação de métrica',
    'criacao_incidente': 'Criação de incidente',
    'criacao_maquina': 'Criação de máquina',
    'alteracao_perfil': 'Alteração de perfil',
    'cadastro_usuario': 'Cadastro de usuário',
    'logoff_exclusao_usuario': 'Logoff/Exclusão de usuário'
  };

  const labelsTraduzidas = eventos.labels.map(label => {
    return traducoes[label] || label;
  });

  const cores = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(249, 115, 22, 0.8)',
    'rgba(234, 179, 8, 0.8)',
    'rgba(168, 85, 247, 0.8)',
    'rgba(6, 182, 212, 0.8)',
    'rgba(107, 114, 128, 0.8)'
  ];

  const canvasEventos = document.getElementById('grafico-eventos');
  if (canvasEventos) {
    const contextoEventos = canvasEventos.getContext('2d');

    if (window.graficoAcoes) window.graficoAcoes.destroy();

    window.graficoAcoes = new Chart(contextoEventos, {
      type: 'pie',
      data: {
        labels: labelsTraduzidas,
        datasets: [{
          data: eventos.valores,
          backgroundColor: cores.slice(0, eventos.valores.length),
          borderColor: '#1f2937',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              color: '#e5e7eb',
              font: {
                size: 12
              },
              padding: 15,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#4b5563',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  setInterval(async () => {
    await atualizarKPIs();
    
    const novosDadosLogins = await buscarLoginsPorHora();
    if (window.graficoLogins) {
      window.graficoLogins.data.datasets[0].data = novosDadosLogins;
      window.graficoLogins.update('none');
    }
    
    const novaSemana = await buscarTentativasSemana();
    if (window.graficoTentativasSemana && novaSemana.labels.length > 0) {
      const labelsFormatadas = novaSemana.labels.map(data => {
        if (data) {
          const dataObj = new Date(data);
          const dia = String(dataObj.getDate()).padStart(2, '0');
          const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
          return `${dia}/${mes}`;
        }
        return data;
      });
      window.graficoTentativasSemana.data.labels = labelsFormatadas;
      window.graficoTentativasSemana.data.datasets[0].data = novaSemana.valores;
      window.graficoTentativasSemana.update('none');
    }
    
    const novosEventos = await buscarEventosPorTipo();
    if (window.graficoAcoes && novosEventos.labels.length > 0) {
      const traducoes = {
        'login_sucesso': 'Login sucesso',
        'Falha de login': 'Falha de login',
        'tentativa_login': 'Tentativa de login',
        'login': 'Login',
        'criacao_metrica': 'Criação de métrica',
        'criacao_incidente': 'Criação de incidente',
        'criacao_maquina': 'Criação de máquina',
        'alteracao_perfil': 'Alteração de perfil',
        'cadastro_usuario': 'Cadastro de usuário',
        'logoff_exclusao_usuario': 'Logoff/Exclusão de usuário'
      };
      const labelsTraduzidas = novosEventos.labels.map(label => {
        return traducoes[label] || label;
      });
      window.graficoAcoes.data.labels = labelsTraduzidas;
      window.graficoAcoes.data.datasets[0].data = novosEventos.valores;
      window.graficoAcoes.update('none');
    }
  }, 30000);

  const btnAtualizar = document.querySelector('.relatorio');
  if (btnAtualizar) {
    btnAtualizar.addEventListener('click', async () => {
      await atualizarKPIs();
      
      const novosDadosLogins = await buscarLoginsPorHora();
      if (window.graficoLogins) {
        window.graficoLogins.data.datasets[0].data = novosDadosLogins;
        window.graficoLogins.update();
      }
      
      const novaSemana = await buscarTentativasSemana();
      if (window.graficoTentativasSemana && novaSemana.labels.length > 0) {
        const labelsFormatadas = novaSemana.labels.map(data => {
          if (data) {
            const dataObj = new Date(data);
            const dia = String(dataObj.getDate()).padStart(2, '0');
            const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
            return `${dia}/${mes}`;
          }
          return data;
        });
        window.graficoTentativasSemana.data.labels = labelsFormatadas;
        window.graficoTentativasSemana.data.datasets[0].data = novaSemana.valores;
        window.graficoTentativasSemana.update();
      }
      
      const novosEventos = await buscarEventosPorTipo();
      if (window.graficoAcoes && novosEventos.labels.length > 0) {
        const traducoes = {
          'login_sucesso': 'Login sucesso',
          'Falha de login': 'Falha de login',
          'tentativa_login': 'Tentativa de login',
          'login': 'Login',
          'criacao_metrica': 'Criação de métrica',
          'criacao_incidente': 'Criação de incidente',
          'criacao_maquina': 'Criação de máquina',
          'alteracao_perfil': 'Alteração de perfil',
          'cadastro_usuario': 'Cadastro de usuário',
          'logoff_exclusao_usuario': 'Logoff/Exclusão de usuário'
        };
        const labelsTraduzidas = novosEventos.labels.map(label => {
          return traducoes[label] || label;
        });
        window.graficoAcoes.data.labels = labelsTraduzidas;
        window.graficoAcoes.data.datasets[0].data = novosEventos.valores;
        window.graficoAcoes.update();
      }
    });
  }
});
