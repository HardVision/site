let contadorAlertas = 0;
let linkAlertas = document.getElementById("link-alertas") || document.querySelector('a[href="alertas.html"]');
let badge = document.getElementById("badgeAlertas");

// Obtém o ID da empresa da sessão (você pode precisar ajustar conforme sua implementação)
function obterIdEmpresa() {
    // Exemplo: você pode pegar do sessionStorage, localStorage ou de uma variável global
    let idEmpresa = sessionStorage.getItem('idEmpresa') || localStorage.getItem('idEmpresa') || 1;
    return idEmpresa;
}

// Seleciona um option do select pelo value ou pelo texto exibido
function setSelectByValueOrText(selectElement, valor) {
    if (!selectElement) return;
    for (let i = 0; i < selectElement.options.length; i++) {
        const opt = selectElement.options[i];
        if (opt.value === valor || opt.text === valor) {
            selectElement.selectedIndex = i;
            return;
        }
    }
}

// Carrega as métricas do banco de dados
function carregarMetricas() {
    let idEmpresa = obterIdEmpresa();
    
    fetch(`/metricas/listar/${idEmpresa}`)
        .then(response => {
            if (response.status === 204) {
                console.log("Nenhuma métrica encontrada no banco");
                return null;
            }
            if (!response.ok) {
                console.log("Nenhuma métrica encontrada");
                return null;
            }
            return response.json();
        })
        .then(metricas => {
            if (metricas && metricas.length > 0) {
                adicionarMetricasNaTabela(metricas);
            }
        })
        .catch(erro => {
            console.log("Carregamento de métricas do banco: ", erro.message);
        });
}

// Preenche a tabela com as métricas
function preencherTabela(metricas) {
    const tbody = document.querySelector("#tabelaMetricas tbody");
    
    // Limpa as linhas existentes (mantém apenas a estrutura)
    tbody.innerHTML = '';
    
    metricas.forEach(metrica => {
        const linha = document.createElement('tr');
        linha.dataset.id = metrica.idMetrica;
        // Mostrar somente o componente na primeira coluna
        const componenteSomente = (metrica.nome || '').toString().split(' - ')[0];

        linha.innerHTML = `
            <td>${componenteSomente}</td>
            <td>${metrica.min}</td>
            <td>${metrica.max}</td>
            <td>${metrica.medida || '-'}</td>
            <td><img src="../assets/editar_branco.png" alt="Editar" class="atualizar" onclick="abrirPopupEdicao(${metrica.idMetrica})"></td>
            <td><img src="../assets/lixeira.png" alt="Deletar" class="deletar" onclick="abrirModalConfirmacao(${metrica.idMetrica}, '${metrica.nome}')"></td>
        `;
        
        tbody.appendChild(linha);
    });
    
    // Reinicia os ouvintes de eventos após preencher a tabela
    inicializarFiltro();
}

// Adiciona métricas novas na tabela existente (sem remover as antigas)
function adicionarMetricasNaTabela(metricas) {
    const tbody = document.querySelector("#tabelaMetricas tbody");
    
    metricas.forEach(metrica => {
        // Verifica se a métrica já existe na tabela
        let jaExiste = Array.from(tbody.rows).some(row => {
            return row.dataset.id === metrica.idMetrica.toString();
        });
        
        if (!jaExiste) {
            const linha = document.createElement('tr');
            linha.dataset.id = metrica.idMetrica;
            // Mostrar somente o componente (parte antes de ' - ')
            const componenteSomente = (metrica.nome || '').toString().split(' - ')[0];

            linha.innerHTML = `
                <td>${componenteSomente}</td>
                <td>${metrica.min}</td>
                <td>${metrica.max}</td>
                <td>${metrica.medida || '-'}</td>
                <td><img src="../assets/editar_branco.png" alt="Editar" class="atualizar" onclick="abrirPopupEdicao(${metrica.idMetrica})"></td>
                <td><img src="../assets/lixeira.png" alt="Deletar" class="deletar" onclick="abrirModalConfirmacao(${metrica.idMetrica}, '${metrica.nome}')"></td>
            `;

            // Insere no topo da tabela para que apareça no alto
            tbody.insertBefore(linha, tbody.firstChild);
        }
    });
    
    // Reinicia os ouvintes de eventos
    inicializarFiltro();
}

// Atualiza uma linha existente na tabela (sem recarregar do servidor)
function atualizarLinhaTabela(idMetrica, metrica) {
    const tbody = document.querySelector('#tabelaMetricas tbody');
    const row = Array.from(tbody.rows).find(r => r.dataset.id === idMetrica.toString());
    if (!row) return false;
    // Mostrar somente o componente (parte antes de ' - ')
    row.cells[0].textContent = (metrica.nome || '').toString().split(' - ')[0];
    row.cells[1].textContent = metrica.min;
    row.cells[2].textContent = metrica.max;
    row.cells[3].textContent = metrica.medida || '-';
    return true;
}

// Remove uma linha da tabela pelo id
function removerLinhaTabela(idMetrica) {
    const tbody = document.querySelector('#tabelaMetricas tbody');
    const row = Array.from(tbody.rows).find(r => r.dataset.id === idMetrica.toString());
    if (row) row.remove();
}

// Abre o popup para criar uma nova métrica
function abrirPopup() {
    document.getElementById("popup").style.display = "flex";
    // Limpa o formulário e reseta o modo
    document.getElementById("formPopup").reset();
    modoEdicao = false;
    idMetricaEdicao = null;
    document.querySelector('.cabecalho-popup').textContent = 'Criando Nova Métrica';
    document.querySelector('.criar').textContent = 'Criar Métrica';
    // Habilita o select de componente para criação
    const selectComponente = document.querySelector('select[name="componente"]');
    if (selectComponente) selectComponente.disabled = false;
}

function fecharPopup() {
    document.getElementById("popup").style.display = "none";
    const selectComponente = document.querySelector('select[name="componente"]');
    if (selectComponente) selectComponente.disabled = false;
}

// Abre o modal para editar uma métrica (apenas min/max)
function abrirPopupEdicao(idMetrica) {
    console.log('Abrindo popup de edição para idMetrica:', idMetrica);
    fetch(`/metricas/obter/${idMetrica}`)
        .then(response => {
            console.log('Status da resposta:', response.status);
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('Resposta de erro:', text);
                    throw new Error(`Erro ${response.status}: ${text}`);
                });
            }
            return response.text().then(text => {
                console.log('Texto da resposta:', text);
                try {
                    return JSON.parse(text);
                } catch(e) {
                    console.error('Erro ao parsear JSON:', e);
                    throw new Error('Resposta não é JSON válido: ' + text);
                }
            });
        })
        .then(metrica => {
            console.log('Métrica carregada:', metrica);
            
            // Extrai o componente do nome completo
            let partes = metrica.nome.split(' - ');
            let componente = partes[0];
            let tipoMetrica = metrica.medida;
            
            // Preenche os campos do modal de edição
            document.querySelector('input[name="componenteEdicao"]').value = componente;
            document.querySelector('input[name="tipoMetricaEdicao"]').value = tipoMetrica;
            document.querySelector('input[name="minEdicao"]').value = metrica.min;
            document.querySelector('input[name="maxEdicao"]').value = metrica.max;
            
            // Guarda o ID da métrica para uso no submit
            document.getElementById("formEdicao").dataset.idMetrica = idMetrica;
            
            // Abre o modal de edição
            document.getElementById("popupEdicao").style.display = "flex";
        })
        .catch(erro => {
            console.error("Erro ao obter métrica:", erro);
            console.error("Stack:", erro.stack);
            alert("Erro ao carregar dados da métrica: " + erro.message);
        });
}

function fecharPopupEdicao() {
    document.getElementById("popupEdicao").style.display = "none";
}

var modoEdicao = false;
var idMetricaEdicao = null;
var componenteOriginalEdicao = null;

function configurarFormulario() {
    const formPopup = document.getElementById("formPopup");
    const formEdicao = document.getElementById("formEdicao");
    const botoCreate = document.querySelector('.criar');
    
    if (!formPopup) return;
    
    formPopup.onsubmit = function(e) {
        e.preventDefault();
        
        const componente = document.querySelector('select[name="componente"]').value;
        // só aceitar estes componentes
        const componentesPermitidos = ['CPU', 'RAM', 'Disco', 'Rede'];
        if (!componentesPermitidos.includes(componente)) {
            alert('Componente inválido. Escolha uma das opções: CPU, RAM, Disco, Rede.');
            return;
        }
        const metricaMinima = document.querySelector('input[name="metricaMinima"]').value;
        const metricaMaxima = document.querySelector('input[name="metricaMaxima"]').value;
        const unidadeSelect = document.querySelector('select[name="unidade"]');
        const unidade = unidadeSelect ? unidadeSelect.value : '';
        
        if (!componente || !metricaMinima || !metricaMaxima || !unidade) {
            alert("Por favor, preencha todos os campos");
            return;
        }
        
        let idEmpresa = obterIdEmpresa();
        
        // Monta apenas o nome com o componente
        const nome = componente;

        const dados = {
            idEmpresa: idEmpresa,
            nome: nome,
            medida: unidade,
            min: parseFloat(metricaMinima),
            max: parseFloat(metricaMaxima)
        };
        
        if (modoEdicao) {
            // modo edição
            // ao atualizar, garantir que o componente permaneça o original
            const componenteParaNome = componenteOriginalEdicao || componente;
            const nomeAtualizado = `${componenteParaNome} - ${tipoMetricaLabel}`;

            const dadosAtualizacao = {
                idEmpresa: idEmpresa,
                nome: nomeAtualizado,
                medida: tipoMetricaLabel,
                min: parseFloat(metricaMinima),
                max: parseFloat(metricaMaxima)
            };

            console.log('Enviando PUT para /metricas/atualizar/' + idMetricaEdicao + ' com payload:', dadosAtualizacao);
            fetch(`/metricas/atualizar/${idMetricaEdicao}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosAtualizacao)
            })
            .then(response => {
                console.log("Status da resposta:", response.status);
                if (!response.ok) {
                    return response.text().then(text => {
                        console.error('Resposta de erro do servidor:', text);
                        throw new Error(`Erro ${response.status}: ${text}`);
                    });
                }
                return response.text().then(text => {
                    try {
                        return JSON.parse(text);
                    } catch(e) {
                        return { sucesso: true, mensagem: text };
                    }
                });
            })
            .then(resultado => {
                console.log("Resultado:", resultado);
                alert("Métrica atualizada com sucesso!");

                // Atualiza a linha na tabela sem recarregar (preservando o formato legível)
                const metricaAtualizada = {
                    nome: dadosAtualizacao.nome,
                    medida: dadosAtualizacao.medida,
                    min: dadosAtualizacao.min,
                    max: dadosAtualizacao.max
                };
                atualizarLinhaTabela(idMetricaEdicao, metricaAtualizada);

                modoEdicao = false;
                idMetricaEdicao = null;
                componenteOriginalEdicao = null;
                document.querySelector('.cabecalho-popup').textContent = 'Criando Nova Métrica';
                botoCreate.textContent = 'Criar Métrica';
                fecharPopup();
            })
            .catch(erro => {
                console.error("Erro ao atualizar métrica:", erro);
                alert("Erro ao atualizar métrica: " + erro.message);
            });
        } else {
            // Modo criação
            console.log("Enviando POST para /metricas/criar com dados:", JSON.stringify(dados));
            
            fetch('/metricas/criar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dados)
            })
            .then(response => {
                console.log("Status da resposta:", response.status);
                console.log("Response object:", response);
                
                if (response.status === 201 || response.status === 200) {
                    // Sucesso
                    return response.text().then(text => {
                        console.log("Texto da resposta:", text);
                        try {
                            return JSON.parse(text);
                        } catch(e) {
                            return { sucesso: true, mensagem: "Métrica criada com sucesso" };
                        }
                    });
                } else if (response.status === 400) {
                    return response.json().then(data => {
                        throw new Error(`Validação falhou: ${data.erro}`);
                    });
                } else if (response.status === 500) {
                    return response.json().then(data => {
                        throw new Error(`Erro no servidor: ${data.erro || data}`);
                    });
                } else {
                    throw new Error(`Erro desconhecido: Status ${response.status}`);
                }
            })
            .then(resultado => {
                console.log("Métrica criada com sucesso. Resultado:", resultado);

                // Tenta pegar o insertId retornado pelo servidor
                let insertId = undefined;
                if (resultado && resultado.resultado && resultado.resultado.insertId) insertId = resultado.resultado.insertId;
                else if (resultado && resultado.insertId) insertId = resultado.insertId;

                if (insertId) {
                    const nova = {
                        idMetrica: insertId,
                        nome: dados.nome,
                        medida: dados.medida,
                        min: dados.min,
                        max: dados.max
                    };
                    // Adiciona imediatamente na tabela sem recarregar tudo
                    adicionarMetricasNaTabela([nova]);
                } else {
                    // fallback: recarrega do servidor caso não receba insertId
                    carregarMetricas();
                }

                document.getElementById("formPopup").reset();
                fecharPopup();
            })
            .catch(erro => {
                console.error("Erro ao criar métrica:", erro);
                console.error("Stack:", erro.stack);
                alert("Erro ao criar métrica: " + erro.message);
            });
        }
    };

    // Handler para o formulário de edição (apenas min/max)
    if (formEdicao) {
        formEdicao.onsubmit = function(e) {
            e.preventDefault();
            
            const idMetrica = parseInt(formEdicao.dataset.idMetrica);
            const minEdicao = parseFloat(document.querySelector('input[name="minEdicao"]').value);
            const maxEdicao = parseFloat(document.querySelector('input[name="maxEdicao"]').value);
            
            if (!minEdicao && minEdicao !== 0 || !maxEdicao && maxEdicao !== 0) {
                alert("Por favor, preencha os campos de Mínimo e Máximo");
                return;
            }
            
            if (minEdicao >= maxEdicao) {
                alert("O valor mínimo deve ser menor que o máximo");
                return;
            }
            
            // Busca a métrica original para preservar nome e medida
            fetch(`/metricas/obter/${idMetrica}`)
                .then(response => response.json())
                .then(metricaOriginal => {
                    const dadosAtualizacao = {
                        idEmpresa: obterIdEmpresa(),
                        nome: metricaOriginal.nome,
                        medida: metricaOriginal.medida,
                        min: minEdicao,
                        max: maxEdicao
                    };

                    console.log('Enviando PUT para /metricas/atualizar/' + idMetrica + ' com payload:', dadosAtualizacao);
                    fetch(`/metricas/atualizar/${idMetrica}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(dadosAtualizacao)
                    })
                    .then(response => {
                        console.log("Status da resposta:", response.status);
                        if (!response.ok) {
                            return response.text().then(text => {
                                console.error('Resposta de erro do servidor:', text);
                                throw new Error(`Erro ${response.status}: ${text}`);
                            });
                        }
                        return response.text().then(text => {
                            try {
                                return JSON.parse(text);
                            } catch(e) {
                                return { sucesso: true, mensagem: text };
                            }
                        });
                    })
                    .then(resultado => {
                        console.log("Métrica atualizada com sucesso. Resultado:", resultado);
                        alert("Métrica atualizada com sucesso!");

                        // Atualiza a linha na tabela
                        const metricaAtualizada = {
                            nome: metricaOriginal.nome,
                            medida: metricaOriginal.medida,
                            min: minEdicao,
                            max: maxEdicao
                        };
                        atualizarLinhaTabela(idMetrica, metricaAtualizada);

                        // Limpa e fecha o modal
                        formEdicao.reset();
                        fecharPopupEdicao();
                    })
                    .catch(erro => {
                        console.error("Erro ao atualizar métrica:", erro);
                        alert("Erro ao atualizar métrica: " + erro.message);
                    });
                })
                .catch(erro => {
                    console.error("Erro ao obter métrica original:", erro);
                    alert("Erro ao carregar dados da métrica: " + erro.message);
                });
        };
    }
}

// Adiciona clique nas imagens das linhas estáticas
function adicionarEventosAosImagensEstataticas() {
    const tbody = document.querySelector("#tabelaMetricas tbody");
    
    // metricas data-id são estáticas
    tbody.querySelectorAll('tr:not([data-id])').forEach(linha => {
        const imagemEditar = linha.querySelector('.atualizar');
        const imagemDeletar = linha.querySelector('.deletar');
        
        if (imagemEditar) {
            imagemEditar.style.cursor = 'pointer';
            imagemEditar.onclick = function(e) {
                e.stopPropagation();
                alert("Esta é uma métrica padrão. Para editar, use o banco de dados.");
            };
        }
        
        if (imagemDeletar) {
            imagemDeletar.style.cursor = 'pointer';
            imagemDeletar.onclick = function(e) {
                e.stopPropagation();
                alert("Esta é uma métrica padrão. Para deletar, use o banco de dados.");
            };
        }
    });
}
    //aqui carrega tudo quando a pagina for carregada
document.addEventListener('DOMContentLoaded', function() {
    configurarFormulario();
    adicionarEventosAosImagensEstataticas();
    carregarMetricas();
});

function abrirModalConfirmacao(idMetrica, nomeMetrica) {
    const modal = document.getElementById("modalConfirmacao");
    
    document.querySelector('.corpo-modal-confirmacao p').textContent = 
        `Você deseja realmente deletar a métrica "${nomeMetrica}"?`;
    
    document.querySelector('.btn-sim-deletar').onclick = () => deletarMetrica(idMetrica);
    
    modal.style.display = "flex";
}

function fecharModalConfirmacao() {
    document.getElementById("modalConfirmacao").style.display = "none";
}

// Deleta a métrica
function deletarMetrica(idMetrica) {
    fetch(`/metricas/deletar/${idMetrica}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log("Status da resposta:", response.status);
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Erro ${response.status}: ${text}`);
            });
        }
        return response.text().then(text => {
            try {
                return JSON.parse(text);
            } catch(e) {
                return { sucesso: true, mensagem: text };
            }
        });
    })
    .then(resultado => {
        console.log("Resultado:", resultado);
        fecharModalConfirmacao();
        removerLinhaTabela(idMetrica);
    })
    .catch(erro => {
        console.error("Erro ao deletar métrica:", erro);
        alert("Erro ao deletar métrica: " + erro.message);
    });
}

function inicializarFiltro() {
    const filtro = document.getElementById("filtro");
    const tbody = document.querySelector("#tabelaMetricas tbody");
    
    if (!filtro || !tbody) return;

    function norm(s) { 
        return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
    }
    
    filtro.addEventListener("input", function () {
        const q = norm(filtro.value);
        const rows = tbody.rows;
        
        for (let i = 0; i < rows.length; i++) {
            const tds = rows[i].cells;
            let show = false;
            
            for (let j = 0; j < tds.length - 2; j++) {
                if (norm(tds[j].textContent).indexOf(q) !== -1) { 
                    show = true; 
                    break; 
                }
            }
            
            rows[i].style.display = show ? "" : "none";
        }
    });
}

window.onclick = function(event) {
    const modal = document.getElementById("modalConfirmacao");
    const popup = document.getElementById("popup");
    const popupEdicao = document.getElementById("popupEdicao");
    
    if (event.target == modal) {
        fecharModalConfirmacao();
    }
    
    if (event.target == popup) {
        fecharPopup();
    }
    
    if (event.target == popupEdicao) {
        fecharPopupEdicao();
    }
}

if (!badge && linkAlertas) {
  badge = document.createElement("span");
  badge.id = "badgeAlertas";
  badge.className = "badge";
  badge.hidden = true;
  linkAlertas.style.position = "relative"; // garante alinhamento
  linkAlertas.appendChild(badge);
}

// Atualiza o badge consultando backend periodicamente
async function atualizarBadge() {
  const select = document.getElementById("select-maquinas");
  try {
    const resp = await fetch(`/dashboard/alertas-card/${sessionStorage.EMPRESA}`);
    if (resp.ok) {
      const dados = await resp.json();
      if (badge) {
        badge.textContent = dados.length;
        badge.hidden = dados.length === 0;
      }
    }
  } catch (e) {
    console.log("#ERRO badge:", e);
  }
}

 function iniciarPainel() {
        let nomeUsuario = document.getElementById("nome_usuario");
        nomeUsuario.innerHTML = sessionStorage.NOME;
        
        let cargoUsuario = document.getElementById("cargo_usuario");
        cargoUsuario.innerHTML = sessionStorage.PERMISSAO;
    }

iniciarPainel();

atualizarBadge()
setInterval(atualizarBadge, 2000)
