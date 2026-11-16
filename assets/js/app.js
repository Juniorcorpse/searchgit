(() => {
  /* Esse trecho usa desestruturação de objetos para copiar funções de namespaces
   globais para constantes locais ao app.js, evitando repetir referências longas. */

   //getElement vem de window.GitHubSearchDOM, criado em dom.js, e busca elementos do HTML.
  const { getElement } = window.GitHubSearchDOM;

  //loadGitHubProfile e searchRepositories vêm de github-api.js, que consulta a API do GitHub.
  const { loadGitHubProfile, searchRepositories } = window.GitHubSearchApi;

  //As funções show... vêm de ui.js, que atualiza a interface.
  const {
    showEmptyState,
    showErrorState,
    showInitialState,
    showLoadingState,
    showProfile,
    showProfileError,
    showRepositories,
  } = window.GitHubSearchUI;

  const GITHUB_USERNAME = "Juniorcorpse";
  const searchForm = getElement("#search-form");
  const searchInput = getElement("#search-input");
  const searchButton = getElement('#search-form button[type="submit"]');
  const previousPageButton = getElement("#previous-page");
  const nextPageButton = getElement("#next-page");
  const initialQuery = new URLSearchParams(window.location.search).get("query");
  let activeQuery = "";
  let currentPage = 1;
  let totalPages = 1;
  let isLoading = false;

  if (initialQuery) {
    searchInput.value = initialQuery;
  }

  // O perfil é independente da busca para que cada área possa tratar seus próprios erros.
  loadGitHubProfile(GITHUB_USERNAME)
    .then(showProfile)
    .catch((error) => {
      console.error("Falha ao carregar o perfil do GitHub:", error);
      showProfileError();
    });

  showInitialState();
  searchForm.addEventListener("submit", handleSearch);
  previousPageButton.addEventListener("click", () => loadPage(activeQuery, currentPage - 1));
  nextPageButton.addEventListener("click", () => loadPage(activeQuery, currentPage + 1));
  searchInput.addEventListener("input", () => {
    searchInput.setCustomValidity("");
  });

  // Valida o termo e sempre reinicia uma nova consulta pela primeira página.
  async function handleSearch(event) {
    event.preventDefault();

    const query = searchInput.value.trim();

    if (!query) {
      searchInput.setCustomValidity("Digite um termo para pesquisar.");
      searchInput.reportValidity();
      searchInput.focus();
      return;
    }

    searchInput.setCustomValidity("");
    activeQuery = query;
    currentPage = 1;
    await loadPage(activeQuery, currentPage);
  }

  // Evita requisições concorrentes e só atualiza a paginação após resposta válida.
  async function loadPage(query, page) {
    if (isLoading || !query || page < 1 || page > totalPages) {
      return;
    }

    isLoading = true;
    searchButton.disabled = true;
    searchInput.disabled = true;
    showLoadingState();

    try {
      const { items, totalPages: resultPages } = await searchRepositories(query, page);

      if (items.length === 0) {
        showEmptyState(query);
        return;
      }

      currentPage = page;
      totalPages = resultPages;
      showRepositories(items, currentPage, totalPages);
    } catch (error) {
      console.error("Falha ao buscar repositórios do GitHub:", error);
      showErrorState();
    } finally {
      searchButton.disabled = false;
      searchInput.disabled = false;
      isLoading = false;
    }
  }
})();
