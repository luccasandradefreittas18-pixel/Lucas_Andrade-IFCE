// public/js/main.js
// Interacoes do lado do cliente: menu mobile, confirmacao antes de excluir,
// envio do formulario de contato via fetch (sem recarregar a pagina),
// checkbox "mostrar senha", validacao das senhas e mascara de telefone.

document.addEventListener("DOMContentLoaded", () => {
  // --- Menu mobile ---
  const botaoMenu = document.getElementById("menu-alterna");
  const menu = document.getElementById("menu-principal");
  if (botaoMenu && menu) {
    botaoMenu.addEventListener("click", () => {
      const aberto = menu.classList.toggle("aberto");
      botaoMenu.setAttribute("aria-expanded", String(aberto));
    });
  }

  // --- Confirmacao antes de excluir (formularios com data-confirmar) ---
  document.querySelectorAll("form[data-confirmar]").forEach((form) => {
    form.addEventListener("submit", (evento) => {
      const mensagem = form.getAttribute("data-confirmar") || "Confirma a exclusao?";
      if (!window.confirm(mensagem)) {
        evento.preventDefault();
      }
    });
  });

  // --- Checkbox "Mostrar senha" (usa data-alvo para saber qual campo alternar) ---
  document.querySelectorAll('input[type="checkbox"][data-alvo]').forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const campo = document.getElementById(checkbox.getAttribute("data-alvo"));
      if (campo) campo.type = checkbox.checked ? "text" : "password";
    });
  });

  // --- Mascara de telefone: (00) 00000-0000 ---
  document.querySelectorAll('input[data-mascara="telefone"]').forEach((campo) => {
    campo.addEventListener("input", () => {
      const digitos = campo.value.replace(/\D/g, "").slice(0, 11);
      let formatado = digitos;
      if (digitos.length > 2) formatado = `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
      if (digitos.length > 7) {
        const corte = digitos.length > 10 ? 7 : 6;
        formatado = `(${digitos.slice(0, 2)}) ${digitos.slice(2, corte)}-${digitos.slice(corte)}`;
      }
      campo.value = formatado;
    });
  });

  // --- Cadastro de usuario: conferencia das senhas antes de enviar ---
  const formUsuario = document.getElementById("form-usuario");
  const senha = document.getElementById("senha");
  const confirmarSenha = document.getElementById("confirmarSenha");
  const aviso = document.getElementById("senha-aviso");

  if (formUsuario && senha && confirmarSenha && aviso) {
    const conferir = () => {
      if (!confirmarSenha.value) {
        aviso.textContent = "";
        return true;
      }
      const iguais = senha.value === confirmarSenha.value;
      aviso.textContent = iguais ? "Senhas conferem." : "As senhas nao coincidem.";
      aviso.classList.toggle("form-erro", !iguais);
      return iguais;
    };

    senha.addEventListener("input", conferir);
    confirmarSenha.addEventListener("input", conferir);

    formUsuario.addEventListener("submit", (evento) => {
      if (!conferir()) {
        evento.preventDefault();
        confirmarSenha.focus();
      }
    });
  }

  // --- Formulario de contato: envio dinamico via fetch ---
  const formContato = document.getElementById("form-contato");
  const respostaContato = document.getElementById("contato-resposta");
  if (formContato && respostaContato) {
    formContato.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      respostaContato.textContent = "Enviando...";
      respostaContato.classList.remove("form-erro");

      const dados = Object.fromEntries(new FormData(formContato).entries());

      try {
        const resposta = await fetch(formContato.action, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(dados)
        });
        const corpo = await resposta.json();

        if (!resposta.ok) {
          respostaContato.textContent = corpo.erro || "Nao foi possivel enviar sua mensagem.";
          respostaContato.classList.add("form-erro");
          return;
        }

        respostaContato.textContent = `Obrigado, ${corpo.nome}! Sua mensagem foi enviada.`;
        formContato.reset();
      } catch (erro) {
        respostaContato.textContent = "Falha de conexao. Tente novamente.";
        respostaContato.classList.add("form-erro");
      }
    });
  }
});
