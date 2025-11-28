document.addEventListener('DOMContentLoaded', function () {
  (async function () {
    try {
      try {
        const id = sessionStorage.ID;
        if (id) {
          const resp = await fetch(`/perfil/buscarInfo/${id}`);
          if (resp.ok) {
            const json = await resp.json();
            if (Array.isArray(json) && json[0]) {
              const info = json[0];
              if (info.nome) {
                sessionStorage.NOME = info.nome;
                const elNome = document.querySelector('.nome-usuario');
                if (elNome) elNome.textContent = info.nome;
              }
              if (info.permissao) {
                sessionStorage.PERMISSAO = info.permissao;
                sessionStorage.PERM = info.permissao;
                const elCargo = document.querySelector('.cargo-usuario');
                if (elCargo) elCargo.textContent = info.permissao;
              }
            }
          }
        }
      } catch (e) {
        console.debug('[membro] falha ao buscar info do perfil:', e);
      }

      const rawPerm = String(sessionStorage.PERMISSAO || sessionStorage.PERM || '');
      const perm = rawPerm.trim();
      function hasRole(role) {
        return String(rawPerm).toLowerCase().indexOf(String(role).toLowerCase()) !== -1;
      }

      const auditSelectors = [
        'a[href$="dashboardAuditoria.html"]',
        'a[href*="/dashboard/dashboardAuditoria.html"]'
      ];
      const auditLinks = Array.from(document.querySelectorAll(auditSelectors.join(',')));

      const adminDashboardSelectors = [
        'a[href*="/dashboard/"]',
        'a[href$="dashboard.html"]',
        'a[href*="/dashboard/dashboard.html"]'
      ];
      const adminDashboardLinks = Array.from(document.querySelectorAll(adminDashboardSelectors.join(',')));

      const memberSelectors = [
        'a[href$="dashboardMembro.html"]',
        'a[href*="/dashboard_membro/dashboardMembro.html"]'
      ];
      const memberLinks = Array.from(document.querySelectorAll(memberSelectors.join(',')));

      function setDisplay(list, value) {
        list.forEach(el => { if (el && el.style) el.style.display = value; });
      }

      function removeNodes(list) {
        list.forEach(el => {
          try {
            if (el && el.parentNode) el.parentNode.removeChild(el);
          } catch (e) {
            try { if (el && el.remove) el.remove(); } catch (__) {}
          }
        });
      }

      console.debug('membro.js: rawPerm=', rawPerm, 'perm=', perm, 'found auditLinks=', auditLinks.length, 'adminDashLinks=', adminDashboardLinks.length, 'memberLinks=', memberLinks.length);

      if (hasRole('admin') || perm === 'Admin') {
        setDisplay(auditLinks, '');
        setDisplay(adminDashboardLinks, '');
        removeNodes(memberLinks);

      } else if (hasRole('membro') || hasRole('member') || perm === 'Membro' || perm === 'Member') {
        removeNodes(auditLinks);
        removeNodes(adminDashboardLinks);

        if (memberLinks.length === 0) {
          const nav = document.querySelector('.nav-lateral');
          if (nav) {
            const a = document.createElement('a');
            a.href = '../dashboard_membro/dashboardMembro.html';
            a.className = 'nav-item';
            const i = document.createElement('i');
            i.className = 'fa-solid fa-chart-simple';
            a.appendChild(i);
            a.appendChild(document.createTextNode(' Monitoramento (membro)'));
            nav.appendChild(a);
          }
        } else {
          setDisplay(memberLinks, '');
        }

      } else {
        removeNodes(auditLinks);
        removeNodes(adminDashboardLinks);
        if (memberLinks.length === 0) {
          const nav = document.querySelector('.nav-lateral');
          if (nav) {
            const a = document.createElement('a');
            a.href = '../dashboard_membro/dashboardMembro.html';
            a.className = 'nav-item';
            const i = document.createElement('i');
            i.className = 'fa-solid fa-chart-simple';
            a.appendChild(i);
            a.appendChild(document.createTextNode(' Monitoramento (membro)'));
            nav.appendChild(a);
          }
        } else {
          setDisplay(memberLinks, '');
        }
      }

    } catch (e) {
      console.debug('Erro ao aplicar regras de acesso:', e);
    }
  })();
});
