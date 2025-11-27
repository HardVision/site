// Obtém o ID da empresa da sessão (você pode precisar ajustar conforme sua implementação)
function obterIdEmpresa() {
    // Exemplo: você pode pegar do sessionStorage, localStorage ou de uma variável global
    let idEmpresa = sessionStorage.getItem('idEmpresa') || localStorage.getItem('idEmpresa') || 1;
    return idEmpresa;
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
        // Mostrar somente o componente (parte antes de ' - '), preservando o nome completo no banco
        const componenteSomente = (metrica.nome || '').toString().split(' - ')[0];
        
        linha.innerHTML = `
            <td>${componenteSomente}</td>
            <td>${metrica.medida}</td>
            <td>${metrica.min}</td>
            <td>${metrica.max}</td>
            <td>${metrica.unidade || '-'}</td>
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
                <td>${metrica.medida}</td>
                <td>${metrica.min}</td>
                <td>${metrica.max}</td>
                <td>${metrica.unidade || '-'}</td>
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
    row.cells[1].textContent = metrica.medida;
    row.cells[2].textContent = metrica.min;
    row.cells[3].textContent = metrica.max;
    row.cells[4].textContent = metrica.unidade || '-';
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

// Fecha o popup
function fecharPopup() {
    document.getElementById("popup").style.display = "none";
    // Reabilita o select de componente quando fechar (modo criação ou após edição)
    const selectComponente = document.querySelector('select[name="componente"]');
    if (selectComponente) selectComponente.disabled = false;
}

// Abre o popup para editar uma métrica
function abrirPopupEdicao(idMetrica) {
    fetch(`/metricas/obter/${idMetrica}`)
        .then(response => {
            if (!response.ok) throw new Error("Erro ao obter métrica");
            return response.json();
        })
        .then(metrica => {
            // Preenche o formulário com os dados da métrica
            // Extrai o componente do nome da métrica (ex: "CPU - Uso total da CPU" -> "CPU")
            let partes = metrica.nome.split(' - ');
            let componente = partes[0];
            // Guarda o componente original e mostra no select (desabilitado)
            componenteOriginalEdicao = componente;
            const selectComponente = document.querySelector('select[name="componente"]');
            if (selectComponente) {
                selectComponente.value = componente;
                selectComponente.disabled = true; // não permitir mudar o componente na edição
            }
            document.querySelector('input[name="metricaMinima"]').value = metrica.min;
            document.querySelector('select[name="tipoMetrica"]').value = metrica.medida;
            document.querySelector('input[name="metricaMaxima"]').value = metrica.max;
            document.querySelector('select[name="unidade"]').value = metrica.unidade || '%';
            
            // Define o modo de edição
            modoEdicao = true;
            idMetricaEdicao = idMetrica;
            
            // Muda o título e a ação do popup
            document.querySelector('.cabecalho-popup').textContent = 'Editando Métrica';
            document.querySelector('.criar').textContent = 'Salvar Alterações';
            
            abrirPopup();
        })
        .catch(erro => {
            console.error("Erro ao obter métrica:", erro);
            alert("Erro ao carregar dados da métrica");
        });
}

// Submissão do formulário para criar métrica
var modoEdicao = false;
var idMetricaEdicao = null;
// Guarda o componente original quando estiver em modo edição
var componenteOriginalEdicao = null;

function configurarFormulario() {
    const formPopup = document.getElementById("formPopup");
    const botoCreate = document.querySelector('.criar');
    
    if (!formPopup) return;
    
    formPopup.onsubmit = function(e) {
        e.preventDefault();
        
        const componente = document.querySelector('select[name="componente"]').value;
        // Validação explícita: só aceitar estes componentes
        const componentesPermitidos = ['CPU', 'RAM', 'Disco', 'Rede'];
        if (!componentesPermitidos.includes(componente)) {
            alert('Componente inválido. Escolha uma das opções: CPU, RAM, Disco, Rede.');
            return;
        }
        const metricaMinima = document.querySelector('input[name="metricaMinima"]').value;
        const tipoMetrica = document.querySelector('select[name="tipoMetrica"]').value;
        const metricaMaxima = document.querySelector('input[name="metricaMaxima"]').value;
        const unidade = document.querySelector('select[name="unidade"]').value;
        
        if (!componente || !metricaMinima || !tipoMetrica || !metricaMaxima || !unidade) {
            alert("Por favor, preencha todos os campos");
            return;
        }
        
        let idEmpresa = obterIdEmpresa();
        
        // Cria um nome baseado no componente e tipo de métrica
        const nome = `${componente} - ${tipoMetrica}`;
        
        const dados = {
            idEmpresa: idEmpresa,
            nome: nome,
            medida: tipoMetrica,
            min: parseFloat(metricaMinima),
            max: parseFloat(metricaMaxima),
            unidade: unidade
        };
        
        if (modoEdicao) {
            // Modo edição
            // Ao atualizar, garantir que o componente permaneça o original
            const componenteParaNome = componenteOriginalEdicao || componente;
            const nomeAtualizado = `${componenteParaNome} - ${tipoMetrica}`;

            const dadosAtualizacao = {
                idEmpresa: idEmpresa,
                nome: nomeAtualizado,
                medida: tipoMetrica,
                min: parseFloat(metricaMinima),
                max: parseFloat(metricaMaxima),
                unidade: unidade
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

                // Atualiza a linha na tabela sem recarregar
                const metricaAtualizada = {
                    nome: dadosAtualizacao.nome,
                    medida: dadosAtualizacao.medida,
                    min: dadosAtualizacao.min,
                    max: dadosAtualizacao.max,
                    unidade: dadosAtualizacao.unidade
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
                        max: dados.max,
                        unidade: dados.unidade
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
}

// Adiciona eventos de clique às imagens das linhas estáticas
function adicionarEventosAosImagensEstataticas() {
    const tbody = document.querySelector("#tabelaMetricas tbody");
    
    // Linhas sem data-id são estáticas
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

// Carrega as métricas quando a página inicia
document.addEventListener('DOMContentLoaded', function() {
    configurarFormulario();
    adicionarEventosAosImagensEstataticas();
    carregarMetricas();
});

// Abre o modal de confirmação de exclusão
function abrirModalConfirmacao(idMetrica, nomeMetrica) {
    const modal = document.getElementById("modalConfirmacao");
    
    // Preenche o texto do modal
    document.querySelector('.corpo-modal-confirmacao p').textContent = 
        `Você deseja realmente deletar a métrica "${nomeMetrica}"?`;
    
    // Define a ação do botão "Sim"
    document.querySelector('.btn-sim-deletar').onclick = () => deletarMetrica(idMetrica);
    
    modal.style.display = "flex";
}

// Fecha o modal de confirmação
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
        alert("Métrica deletada com sucesso!");
        fecharModalConfirmacao();
        // Remove a linha localmente sem recarregar tudo
        removerLinhaTabela(idMetrica);
    })
    .catch(erro => {
        console.error("Erro ao deletar métrica:", erro);
        alert("Erro ao deletar métrica: " + erro.message);
    });
}

// Reinicializa o filtro de pesquisa
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
            
            for (let j = 0; j < tds.length - 2; j++) { // Exclui as últimas 2 colunas (editar/deletar)
                if (norm(tds[j].textContent).indexOf(q) !== -1) { 
                    show = true; 
                    break; 
                }
            }
            
            rows[i].style.display = show ? "" : "none";
        }
    });
}

// Fecha o modal ao clicar fora dele
window.onclick = function(event) {
    const modal = document.getElementById("modalConfirmacao");
    const popup = document.getElementById("popup");
    
    if (event.target == modal) {
        fecharModalConfirmacao();
    }
    
    if (event.target == popup) {
        fecharPopup();
    }
}
