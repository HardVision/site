
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
  agora.setMinutes(agora.getMinutes() + 2)
  const dia = String(agora.getDate()).padStart(2, '0');
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const ano = agora.getFullYear();
  const hora = String(agora.getHours()).padStart(2, '0');
  const minuto = String(agora.getMinutes()).padStart(2, '0');
  const segundo = String(agora.getSeconds()).padStart(2, '0');
  return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
}

function gerarToken(tamanho = 5) {
  return Math.random().toString(36).substring(2, 2 + tamanho).toUpperCase();
}

async function enviarToken() {
  const token = gerarToken();
  const data = obterDataAtual();
  const email = await sessionStorage.getItem("emailRecuperacao");

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

async function atualizarToken() {
  const token = gerarToken();
  const data = obterDataAtual();
  const email = await sessionStorage.getItem("emailRecuperacao");

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


