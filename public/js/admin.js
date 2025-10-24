  let listaEmpresasCadastradas = [];

  function showEmpresas(){
    listaEmpresasCadastradas.forEach((empresa) => {
        console.log(empresa)
        tableBody.innerHTML += `<tr>
                            <td>${empresa.idEmpresa}</td>
                            <td>${empresa.razaoSocial}</td>
                            <td>${empresa.nomeFantasia}</td>
                            <td>${empresa.cnpj}</td>
                            <td>${empresa.email}</td>
                            <td>${empresa.telefone}</td>
                            <td>CEP: ${empresa.cep}<br>${empresa.rua}, ${empresa.numero}</td>
                            <td>${empresa.token}</td>
                            <td><img src="assets/atualizar.png" alt=""></td>
                            <td><img src="assets/lixeira.png" alt=""></td>
                        </tr>`
    });
}

  function listar() {
    fetch("/empresas/listar", {
      method: "GET",
    })
      .then(function (resposta) {
        resposta.json().then((empresas) => {
          empresas.forEach((empresa) => {
            listaEmpresasCadastradas.push(empresa);
          });
        }).then(function (mostrar) {
            showEmpresas()
        });
      })
      .catch(function (resposta) {
        console.log(`#ERRO: ${resposta}`);
      });
  }


