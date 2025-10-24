  let listaEmpresasCadastradas = [];
  
  function listar() {
    fetch("/empresas/listar", {
      method: "GET",
    })
      .then(function (resposta) {
        resposta.json().then((empresas) => {
          empresas.forEach((empresa) => {
            listaEmpresasCadastradas.push(empresa);

            console.log("listaEmpresasCadastradas")
            console.log(listaEmpresasCadastradas[0].codigo_ativacao)
          });
        });
      })
      .catch(function (resposta) {
        console.log(`#ERRO: ${resposta}`);
      });
  }

