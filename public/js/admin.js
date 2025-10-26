let listaEmpresasCadastradas = [];

const fecharPopUp = document.getElementById('fecharPopUp');
const abrirAtualizar = document.getElementsByClassName("atualizar")
const abrirDeletar = document.getElementsByClassName("deletar")
var idEmpresa;
const campoSelect = document.getElementById("campoSelect");
const updateStep1 = document.getElementById("updateStep1");
const updateStep2 = document.getElementById("updateStep2");
const campoSelecionadoLabel = document.getElementById("campoSelecionadoLabel");
const fecharPopUpUpdate = document.getElementById("fecharPopUpUpdate");

function openUpdatePopup() {
  popupOverlayUpdate.style.display = "flex";
  updateStep1.style.display = "flex";
  updateStep2.style.display = "none";
  campoSelect.value = "";
}

fecharPopUpUpdate.addEventListener("click", () => {
  popupOverlayUpdate.style.display = "none";
});

function proximoPassoUpdate() {
  const campo = campoSelect.value;
  if (!campo) {
    alert("Selecione um campo para atualizar!");
    return;
  }

  campoSelecionadoLabel.textContent = `Novo valor para "${campo}"`;
  updateStep1.style.display = "none";
  updateStep2.style.display = "flex";
}

function confirmarUpdate() {
  const novoValor = document.getElementById("novoValor").value.trim();
  const campo = campoSelect.value;

  if (!novoValor) {
    alert("Por favor, insira o novo valor.");
    return;
  }

  console.log(`Atualizando campo "${campo}" com valor: "${novoValor}"`);
  popupOverlayUpdate.style.display = "none";
}


// Quando clicar na imagem, fecha o popup
fecharPopUp.addEventListener('click', () => {
  popupOverlay.style.display = 'none';
});

function openPopUp() {
  popupOverlay.style.display = 'flex';
}

function fecharDelete() {
  popupOverlayDelete.style.display = 'none';
}

function showEmpresas() {
  listaEmpresasCadastradas.forEach((empresa) => {
    console.log(empresa)
    tableBody.innerHTML += `<tr data-id="${empresa.idEmpresa}">
                            <td>${empresa.idEmpresa}</td>
                            <td>${empresa.razaoSocial}</td>
                            <td>${empresa.nomeFantasia}</td>
                            <td>${empresa.cnpj}</td>
                            <td>CEP: ${empresa.cep}<br>${empresa.rua}, ${empresa.numero}</td>
                            <td>${empresa.token}</td>
                            <td><img src="assets/atualizar.png" alt="" class="atualizar"></td>
                            <td><img src="assets/lixeira.png" alt="" class="deletar"></td>
                        </tr>`
  });

  for (let btn of abrirAtualizar) {
  btn.addEventListener('click', (u) => {
    const linha = u.target.closest("tr");
    idEmpresa = linha.dataset.id;
    console.log("Atualizar empresa ID:", idEmpresa);
    popupOverlayUpdate.style.display = 'flex';
  });
}


  for (let i = 0; i < abrirDeletar.length; i++) {
  const btn = abrirDeletar[i];
  btn.addEventListener("click", (e) => {
    const linha = e.target.closest("tr");
    idEmpresa = linha.dataset.id;
    console.log("Deletar empresa ID:", idEmpresa);
    popupOverlayDelete.style.display = 'flex'
  });
}
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

function atualizar(){
   const campo = campoSelect.value;
   const valor = novoValor.value;
   var tabela;

   if(campo === "uf" || campo === "cep" || campo === "cidade" || campo === "logradouro" 
    || campo === "rua" || campo === "numero"  || campo === "complemento" ){
      tabela = "endereco";
    }
    else {
      tabela = "empresa"
    }

   fetch(`/empresas/editar/${idEmpresa}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                valorServer: valor,
                campoServer: campo,
                tabelaServer: tabela
            })
        }).then(function (resposta) {

            if (resposta.ok) {
                window.alert("Empresa atualizada com sucesso!");
                // window.location = "/dashboard/mural.html"
            } else if (resposta.status == 404) {
                window.alert("Deu 404!");
            } else {
                throw ("Houve um erro ao tentar atualizar o valor! Código da resposta: " + resposta.status);
            }
        }).catch(function (resposta) {
            console.log(`#ERRO: ${resposta}`);
        });

}

function deletar(){
   console.log("Criar função de apagar post escolhido - ID " + idEmpresa);
        fetch(`/empresas/deletar/${idEmpresa}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (resposta) {

            if (resposta.ok) {
                window.alert("Empresa deletada com sucesso");
            } else if (resposta.status == 404) {
                window.alert("Deu 404!");
            } else {
                throw ("Houve um erro ao tentar realizar a postagem! Código da resposta: " + resposta.status);
            }
        }).catch(function (resposta) {
            console.log(`#ERRO: ${resposta}`);
        });
}
