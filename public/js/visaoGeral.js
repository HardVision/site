

const btnNovaPostagem = document.getElementById('btnNovaPostagem');
        const popupOverlay = document.getElementById('popupOverlay');
        const btnCancelar = document.getElementById('btnCancelar');
        const btnSalvar = document.getElementById('btnSalvar');
        const painelMensagens = document.getElementById('painelMensagens');

        // abre o popup
        btnNovaPostagem.addEventListener('click', () => {
            popupOverlay.style.display = 'flex';
        });

        // fecha o popup
        btnCancelar.addEventListener('click', () => {
            popupOverlay.style.display = 'none';
        });

        // salva nova postagem
        btnSalvar.addEventListener('click', () => {
            const autor = document.getElementById('autorInput').value;
            const titulo = document.getElementById('tituloInput').value;
            const descricao = document.getElementById('descricaoInput').value;

            if (!autor || !titulo || !descricao) {
                alert("Por favor, preencha todos os campos.");
                return;
            }

            // const data = new Date();
            // const dataFormatada = data.toLocaleString("pt-BR");

            // const novaMensagem = document.createElement('div');
            // novaMensagem.classList.add('mensagem');
            // novaMensagem.innerHTML = `
            //     <p><span class="label">Autor:</span> ${autor}</p>
            //     <p><span class="label">Título:</span> ${titulo}</p>
            //     <p><span class="label">Data da postagem:</span> ${dataFormatada}</p>
            //     <p><span class="label">Descrição:</span> ${descricao}</p>
            //     <div class="acoes">
            //         <button class="botao editar">Editar</button>
            //         <button class="botao deletar">Deletar</button>
            //     </div>
            // `;
            // painelMensagens.prepend(novaMensagem);

            popupOverlay.style.display = 'none';

            document.getElementById('autorInput').value = '';
            document.getElementById('tituloInput').value = '';
            document.getElementById('descricaoInput').value = '';
        });


