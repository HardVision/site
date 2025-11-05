
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


