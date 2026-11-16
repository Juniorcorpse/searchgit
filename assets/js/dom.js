(() => {
  // Falha cedo com um erro claro se um seletor obrigatório não existir no HTML.
  function getElement(selector) {
    const element = document.querySelector(selector);

    if (!element) {
      throw new Error(`Elemento não encontrado para o seletor: ${selector}`);
    }

    return element;
  }

  window.GitHubSearchDOM = { getElement };
})();
