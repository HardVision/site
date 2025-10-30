var next = false;

document.addEventListener("DOMContentLoaded", () => {
  const proximo = document.getElementById("proximoBtn");
  const first = document.getElementById("first-form");
  const last = document.getElementById("last-form");

  // esconde o segundo form inicialmente
  last.style.display = "none";

  // alternar entre forms manualmente
  proximo.onclick = function () {
    if (!next) {
      // vai para o segundo
      first.style.display = "none";
      last.style.display = "flex";
      next = true;
      proximo.innerHTML = "Anterior";
    } else {
      // volta para o primeiro
      last.style.display = "none";
      first.style.display = "flex";
      next = false;
      proximo.innerHTML = "Próximo";
    }
  };

  function verificarPreenchimento() {
    const nome = document.getElementById("nomeIpt").value.trim();
    const cpfVar = cpfIpt.value.replaceAll(".", "");
    const telVar = telIpt.value.replaceAll(" ", "");

    if (nome && cpfVar.length === 11  && telVar.length === 13 && !next) {
      first.style.display = "none";
      last.style.display = "flex";
      next = true;
      proximo.innerHTML = "Anterior";
    }
  }

  document
    .querySelectorAll("#first-form input")
    .forEach((input) => input.addEventListener("input", verificarPreenchimento));
});


function validarSessao() {
    var email = sessionStorage.EMAIL_USUARIO;
    var nome = sessionStorage.NOME_USUARIO;

    var b_usuario = document.getElementById("b_usuario");

    if (email != null && nome != null) {
        b_usuario.innerHTML = nome;
    } else {
        window.location = "../login.html";
    }
}

function limparSessao() {
    sessionStorage.clear();
    window.location = "../login.html";
}

// carregamento (loading)
function aguardar() {
    var divAguardar = document.getElementById("div_aguardar");
    divAguardar.style.display = "flex";
}

function finalizarAguardar(texto) {
    var divAguardar = document.getElementById("div_aguardar");
    divAguardar.style.display = "none";

    var divErrosLogin = document.getElementById("div_erros_login");
    if (texto) {
        divErrosLogin.style.display = "flex";
        divErrosLogin.innerHTML = texto;
    }
}

