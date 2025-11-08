var next = false;

document.addEventListener("DOMContentLoaded", () => {
  const btnTroca = document.getElementById("proximoBtn"); 
  const btnCadastrar = document.getElementById("cadastrar");
  const first = document.getElementById("first-form");
  const last = document.getElementById("last-form");
  
  let next = false;              // controla se está na segunda parte
  let jaFoiPraSegunda = false;   


  if (last) last.style.display = "none";
  if (btnTroca) btnTroca.style.display = "none";

  
  if (btnTroca && first && last) {
    btnTroca.onclick = function () {
      if (!next && jaFoiPraSegunda) {
        first.style.display = "none";
        last.style.display = "flex";
        next = true;
      } 
      else if (next) {
        last.style.display = "none";
        first.style.display = "flex";
        next = false;
        btnTroca.innerHTML = "Voltar";
      }
    };
  }

  function verificarPreenchimento() {
    const nome   = document.getElementById("nomeIpt")?.value.trim() || "";
    const cpfVar = (document.getElementById("cpfIpt")?.value || "").replaceAll(".", "");
    const telVar = (document.getElementById("telIpt")?.value || "").replace(/\D/g, "");
    const email  = document.getElementById("emailIpt")?.value.trim() || "";
     const emailOk = /@gmail\.com$/i.test(email);

    if (nome && cpfVar.length === 11 && telVar.length === 13 && emailOk && !next && !jaFoiPraSegunda && first && last) {

      first.style.display = "none";
      last.style.display = "flex";
      next = true;
      jaFoiPraSegunda = true;

   
      btnTroca.innerHTML = "Voltar";
      btnTroca.style.display = "inline-block";
      btnCadastrar.style.margin = "0";
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

