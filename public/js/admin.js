let listaEmpresasCadastradas = [];

const fecharPopUp = document.getElementById('fecharPopUp');

// Quando clicar na imagem, fecha o popup
fecharPopUp.addEventListener('click', () => {
  popupOverlay.style.display = 'none';
});

function openPopUp() {
  popupOverlay.style.display = 'flex';
}

function showEmpresas() {
  listaEmpresasCadastradas.forEach((empresa) => {
    console.log(empresa)
    tableBody.innerHTML += `<tr>
                            <td>${empresa.idEmpresa}</td>
                            <td>${empresa.razaoSocial}</td>
                            <td>${empresa.nomeFantasia}</td>
                            <td>${empresa.cnpj}</td>
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



function cadastrar() {
    const CEP = iptCEP.value.trim();
    const UF = iptUF.value.trim();
    const cidade = iptCidade.value.trim();
    const logradouro = iptLogradouro.value.trim();
    const numero = iptNumero.value.trim();
    const rua = iptRua.value.trim();
    const complemento = iptComplemento.value.trim();
    const token = iptToken.value.trim();
    const cnpj = iptCNPJ.value.trim();
    const razaoSocial = iptRazaoSocial.value.trim();
    const nomeFantasia = iptNomeFantasia.value.trim();

    console.log("=== Dados capturados ===");
    console.log("CEP:", CEP);
    console.log("UF:", UF);
    console.log("Cidade:", cidade);
    console.log("Logradouro:", logradouro);
    console.log("Número:", numero);
    console.log("Complemento:", complemento);
    console.log("Token:", token);
    console.log("CNPJ:", cnpj);
    console.log("Razão Social:", razaoSocial);
    console.log("Nome Fantasia:", nomeFantasia);

    // Verificação de campos vazios
    if (
        !CEP || !UF || !cidade || !logradouro || !numero || !complemento || !token || !rua || !cnpj ||
        !razaoSocial || !nomeFantasia
    ) {
        alert("Por favor, preencha todos os campos antes de cadastrar.");
        return;
    }

    // Envia os dados para o backend
    fetch("/empresas/cadastrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            cepServer: CEP,
            ufServer: UF,
            cidadeServer: cidade,
            logradouroServer: logradouro,
            ruaServer: rua,
            numeroServer: numero,
            complementoServer: complemento,
            tokenServer: token,
            cnpjServer: cnpj,
            razaoSocialServer: razaoSocial,
            nomeFantasiaServer: nomeFantasia
        }),
    })
        .then(function (resposta) {
            console.log("resposta: ", resposta);

            if (resposta.ok) {
                alert("Empresa cadastrada com sucesso!");
                // Limpa os campos após o envio bem-sucedido
                iptCEP.value = "";
                iptUF.value = "";
                iptCidade.value = "";
                iptLogradouro.value = "";
                iptNumero.value = "";
                iptBairro.value = "";
                iptComplemento.value = "";
                iptToken.value = "";
                iptCNPJ.value = "";
                iptRazaoSocial.value = "";
                iptNomeFantasia.value = "";
            } else {
                throw "Houve um erro ao tentar realizar o cadastro!";
            }
        })
        .catch(function (erro) {
            console.log(`#ERRO: ${erro}`);
            alert("Falha ao cadastrar empresa. Verifique o console para mais detalhes.");
        });

    return false;
}
