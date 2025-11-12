
async function enviar() {
  const nome = nomeIpt.value.trim()
  const email = fromIpt.value.trim()
  const contato = contatoIpt.value.trim()
  const msg = msgIpt.value.trim()

  fetch("/email/enviar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nomeServer: nome,
      emailServer: email,
      contatoServer: contato,
      msgServer: msg
    }),
  })

}

function obterDataAtual() {
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() + 2); // adiciona 2 minutos

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  const hora = String(agora.getHours()).padStart(2, '0');
  const minuto = String(agora.getMinutes()).padStart(2, '0');
  const segundo = String(agora.getSeconds()).padStart(2, '0');

  // formato compatível com DATETIME no MySQL
  return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`;
}


function gerarToken(tamanho = 5) {
  return Math.random().toString(36).substring(2, 2 + tamanho).toUpperCase();
}

function enviarToken() {
  const token = gerarToken();
  const data = obterDataAtual();
  const email = localStorage.getItem("emailRecuperacao");
  console.log(email)

  console.log("Token: " + token)
  console.log("Data atual: " + data)

  fetch("/email/enviar-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tokenServer: token,
      dataServer: data,
      emailServer: email
    }),
  })

}

function atualizarToken() {
  const token = gerarToken();
  const data = obterDataAtual();
  const email = localStorage.getItem("emailRecuperacao");

  console.log("Token: " + token)
  console.log("Data atual: " + data)

  fetch("/email/atualizar-token", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tokenServer: token,
      dataServer: data,
      emailServer: email
    }),
  })

}

async function verificarToken() {
  const token = document.getElementById("tokenInput").value.trim();

  if (!token) {
    mostrarAlerta("Por favor, insira o token.", "erro");
    return;
  }

  try {
    // Corrige a URL (sem dois-pontos ":")
    const res = await fetch(`/email/verificar-token/${token}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    // Pega o corpo da resposta
    const data = await res.json();

    if (res.ok && data) {
      console.log("🔹 Resposta do servidor:", data);

      mostrarAlerta("Token verificado com sucesso!", "sucesso");
      localStorage.setItem("tokenVerificado", "true");

      setTimeout(() => {
        tokenDiv.style.display = "none";
        senhaDiv.style.display = "flex";
      }, 2000);
    } else {
      console.warn("❌ Token inválido:", data);
      mostrarAlerta("Token inválido ou expirado.", "erro");
    }
  } catch (erro) {
    console.error("Erro de conexão:", erro);
    mostrarAlerta("Token inválido", "erro");
  }
}
