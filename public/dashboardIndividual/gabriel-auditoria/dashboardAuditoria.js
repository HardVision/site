document.addEventListener('DOMContentLoaded', function () {
  const rotulosHoras = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const dadosLogins = [2,1,0,0,0,1,3,8,20,35,48,55,60,58,50,42,30,22,18,12,8,6,4,3];

  const tituloLogin = document.querySelector('#sec-logins .titulo-grafico');
  if (tituloLogin) tituloLogin.textContent = 'Logins no dia (por hora)';

  const canvasLogins = document.getElementById('grafico-logins');
  if (canvasLogins) {
    const contextoLogins = canvasLogins.getContext('2d');
    if (window.graficoLogins) window.graficoLogins.destroy();
    window.graficoLogins = new Chart(contextoLogins, {
      type: 'line',
      data: { labels: rotulosHoras, datasets: [{ label: 'Logins', data: dadosLogins, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.12)', fill: true, tension: 0.25, pointRadius: 3, pointBackgroundColor: '#fff', pointBorderColor: '#3b82f6' }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
        scales: { x: { display: true, title: { display: true, text: 'Hora do dia' }, grid: { display: false } }, y: { display: true, beginAtZero: true, title: { display: true, text: 'Número de logins' }, ticks: { precision: 0 } } }
      }
    });
  }

  const totalLoginsHoje = dadosLogins.reduce((s, v) => s + v, 0);
  const elTentativas = document.getElementById('kpi_login_attempts'); if (elTentativas) elTentativas.textContent = totalLoginsHoje;
  const elFalhas = document.getElementById('kpi_failed_logins'); if (elFalhas) elFalhas.textContent = Math.floor(totalLoginsHoje * 0.12);
  const elUsuarios = document.getElementById('kpi_users'); if (elUsuarios) elUsuarios.textContent = '1.245';
  const elAlertasCriticos = document.getElementById('kpi_critical_events'); if (elAlertasCriticos) elAlertasCriticos.textContent = 7;
  const elUptime = document.getElementById('kpi_uptime'); if (elUptime) elUptime.textContent = '12 dias';

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const tentativasSemana = [120, 95, 110, 140, 160, 190, 175];
  const canvasTentativas = document.getElementById('grafico-tentativas');
  if (canvasTentativas) {
    const contextoTentativas = canvasTentativas.getContext('2d');
    if (window.graficoTentativasSemana) window.graficoTentativasSemana.destroy();
    window.graficoTentativasSemana = new Chart(contextoTentativas, {
      type: 'line',
      data: {
        labels: diasSemana,
        datasets: [{ label: 'Tentativas de login (diárias)', data: tentativasSemana, borderColor: '#0ea5a4', backgroundColor: 'rgba(14,165,164,0.08)', fill: true, tension: 0.3, pointRadius: 3, pointBackgroundColor: '#fff' }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: true, grid: { display: false }, title: { display: true, text: 'Dia da semana' } },
          y: { beginAtZero: true, title: { display: true, text: 'Número de tentativas' }, ticks: { precision: 0 } }
        }
      }
    });
  }

  const rotulosAcoes = ['Cadastros', 'Falhas de login', 'Criação de métricas', 'Criação de postagem', 'Alterações no perfil', 'Logoffs'];
  const dadosAcoes = [15, 34, 6, 9, 8, 20];
  const canvasEventos = document.getElementById('grafico-eventos');
  if (canvasEventos) {
    const contextoEventos = canvasEventos.getContext('2d');
    if (window.graficoAcoes) window.graficoAcoes.destroy();

    const cores = ['#3b82f6', '#6366f1', '#a78bfa', '#60a5fa', '#f472b6', '#64748b'];

    window.graficoAcoes = new Chart(contextoEventos, {
      type: 'pie',
      plugins: (typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : []),
      data: {
        labels: rotulosAcoes,
        datasets: [{ data: dadosAcoes, backgroundColor: cores, hoverOffset: 6 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.formattedValue}` } },
          datalabels: {
            color: '#ffffff',
            formatter: (value, ctx) => {
              const data = ctx.chart.data.datasets[0].data;
              const sum = data.reduce((s, v) => s + v, 0);
              if (!sum) return '';
              const pct = (value / sum * 100);
              return pct < 1 ? '<1%' : `${Math.round(pct)}%`;
            },
            font: { weight: '700', size: 12 },
            anchor: 'center',
            align: 'center',
            clamp: true
          }
        }
      }
    });
  }

  setTimeout(() => {
    [window.graficoLogins, window.graficoTentativasSemana, window.graficoAcoes].forEach(c => { try { if (c && c.resize) c.resize(); } catch (e) {} });
  }, 80);
});
