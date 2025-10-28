  const botaoEditar = document.getElementById("editarPerfilBtn");
  let editando = false;

  botaoEditar.addEventListener("click", () => {
    const colunasEditaveis = document.querySelectorAll(".painel-column[data-editable='true']");

    if (!editando) {
      // Modo de edição
      colunasEditaveis.forEach(coluna => {
        const h3 = coluna.querySelector(".valor");
        const valorAtual = h3.textContent;
        const input = document.createElement("input");
        input.type = "text";
        input.value = valorAtual;
        coluna.replaceChild(input, h3);
      });

      botaoEditar.textContent = "Salvar alterações";
      editando = true;
    } else {
      // Modo de salvar
      colunasEditaveis.forEach(coluna => {
        const input = coluna.querySelector("input");
        const novoValor = input.value.trim() || "—";
        const h3 = document.createElement("h3");
        h3.classList.add("valor");
        h3.textContent = novoValor;
        coluna.replaceChild(h3, input);
      });

      botaoEditar.textContent = "Alterar perfil";
      editando = false;
    }
  });

  document.getElementById("altSenhaBtn").onclick = function () {
    location.href = "../atualizadaSenha.html"
  }