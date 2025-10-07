var next = false;

document.addEventListener("DOMContentLoaded", () => {
    const proximo = document.getElementById("proximoBtn");
    const first = document.getElementById("first-form");
    const last = document.getElementById("last-form");
    proximo.onclick = function () {
        if (!next) {
            first.style.display = "none";
            last.style.display = "flex";
            next = true;
            proximo.innerHTML = "Anterior"
        }
        else {
            last.style.display = "none";
            first.style.display = "flex";
            next = false;
            proximo.innerHTML = "Proximo"
        };
    }
});


document.getElementById("cadastro").onclick = function () {
    location.href = "cadastro.html";
};

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

