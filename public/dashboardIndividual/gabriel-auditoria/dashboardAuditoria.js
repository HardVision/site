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
    window.graficoTentativasSemana = new Chart(contextoTentativas, { type: 'line', data: { labels: diasSemana, datasets: [{ label: 'Tentativas de login (diárias)', data: tentativasSemana, borderColor: '#0ea5a4', backgroundColor: 'rgba(14,165,164,0.08)', fill: true, tension: 0.3, pointRadius: 3, pointBackgroundColor: '#fff' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } } });
  }

  const rotulosAcoes = ['Cadastros', 'Falhas de login', 'Criação de métricas', 'Criação de postagem', 'Alterações no perfil', 'Logoffs'];
  const dadosAcoes = [15, 34, 6, 9, 8, 20];
  const canvasEventos = document.getElementById('grafico-eventos');
  if (canvasEventos) {
    const contextoEventos = canvasEventos.getContext('2d');
    if (window.graficoAcoes) window.graficoAcoes.destroy();

    const cores = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#a78bfa', '#60a5fa'];

    window.graficoAcoes = new Chart(contextoEventos, {
      type: 'pie',
      data: {
        labels: rotulosAcoes,
        datasets: [{ data: dadosAcoes, backgroundColor: cores, hoverOffset: 6 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' },
          tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.formattedValue}` } }
        }
      }
    });
  }

  const rotulosCriticos = ['CPU', 'RAM', 'Disco', 'Rede'];
  const dadosCriticos = [8, 5, 3, 6];
  const canvasAlertas = document.getElementById('grafico-alertas');
  if (canvasAlertas) {
    const contextoAlertas = canvasAlertas.getContext('2d');
    if (window.graficoAlertas) window.graficoAlertas.destroy();
    window.graficoAlertas = new Chart(contextoAlertas, {
      type: 'doughnut',
      data: { labels: rotulosCriticos, datasets: [{ data: dadosCriticos, backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'], hoverOffset: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' }, tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.formattedValue}` } } } }
    });
  }

  const elAlertasKPI = document.getElementById('kpi_critical_events'); if (elAlertasKPI) elAlertasKPI.textContent = dadosCriticos.reduce((s, v) => s + v, 0);

  const rotulosUptime = diasSemana;
  const dadosUptime = [99.9, 100, 99.8, 99.7, 100, 99.95, 99.9];
  const canvasUptime = document.getElementById('grafico-uptime');
  if (canvasUptime) {
    const contextoUptime = canvasUptime.getContext('2d');
    if (window.graficoUptime) window.graficoUptime.destroy();
    window.graficoUptime = new Chart(contextoUptime, {
      type: 'line',
      data: {
        labels: rotulosUptime,
        datasets: [{
          label: 'Uptime (%)',
          data: dadosUptime,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.08)',
          fill: true,
          tension: 0.25,
          pointRadius: 4,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#10b981'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.formattedValue}%` } } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: false, suggestedMin: 95, suggestedMax: 100, ticks: { callback: (v) => v + '%' } }
        }
      }
    });
  }

  const elKpiUptime = document.getElementById('kpi_uptime');
  if (elKpiUptime) {
    const media = (dadosUptime.reduce((s, v) => s + v, 0) / dadosUptime.length).toFixed(2);
    elKpiUptime.textContent = `${media}%`;
  }

});
