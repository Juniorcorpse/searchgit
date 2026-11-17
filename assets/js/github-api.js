(() => {
  const API_BASE_URL = "https://api.github.com";
  const API_URL = `${API_BASE_URL}/search/repositories`;
  const SEARCH_URL = `${API_BASE_URL}/search`;
  const RESULTS_PER_PAGE = 10;
  const MAX_RESULTS_PAGES = 100;
  const REQUEST_HEADERS = {
    Accept: "application/vnd.github+json",
  };

  // Centraliza a chamada HTTP e impede o processamento de respostas não exitosas.
  async function requestJson(url) {
    const response = await fetch(url, { headers: REQUEST_HEADERS });

    if (!response.ok) {
      throw new Error(`GitHub API request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Busca uma página de resultados e calcula o total navegável dentro do limite da API.
  async function searchRepositories(query, page = 1) {
    const searchParams = new URLSearchParams({
      q: query,
      sort: "stars",
      per_page: String(RESULTS_PER_PAGE),
      page: String(page),
    });
    const data = await requestJson(`${API_URL}?${searchParams.toString()}`);

    if (!Array.isArray(data.items) || !Number.isFinite(data.total_count)) {
      throw new Error("GitHub API returned an unexpected response");
    }

    return {
      items: data.items,
      totalPages: Math.min(
        Math.ceil(data.total_count / RESULTS_PER_PAGE),
        MAX_RESULTS_PAGES,
      ),
    };
  }

  // Solicita apenas um item; total_count fornece a contagem sem baixar toda a lista.
  async function searchCount(endpoint, query) {
    const searchParams = new URLSearchParams({
      q: query,
      per_page: "1",
    });
    const data = await requestJson(`${SEARCH_URL}/${endpoint}?${searchParams.toString()}`);

    if (!Number.isFinite(data.total_count)) {
      throw new Error("GitHub API returned an unexpected search count");
    }

    return data.total_count;
  }

  // Carrega perfil, pull requests e commits em paralelo para montar o resumo do cabeçalho.
  async function loadGitHubProfile(username) {
    const encodedUsername = encodeURIComponent(username);

    /* Promise.all([...]) inicia as três operações ao mesmo tempo
    e espera que todas terminem. Quando terminam, os resultados
    são colocados nas variáveis na mesma ordem: profile, pullRequests,
    commits. O await pausa essa função até as três concluírem.
    Se qualquer uma falhar, Promise.all rejeita e o erro é
    tratado por quem chamou loadGitHubProfile. */
    const [profile, pullRequests, commits] = await Promise.all([
      //1. requestJson(...) obtém os dados do perfil (profile).
      requestJson(`${API_BASE_URL}/users/${encodedUsername}`),
      /*
      2. searchCount("issues", ...) conta os pull requests
      criados pelo usuário (pullRequests). is:pr filtra apenas pull requests.
      */
      searchCount("issues", `is:pr author:${username}`),
      /** searchCount("commits", ...) conta os commits
       * atribuídos ao usuário (commits).*/
      searchCount("commits", `author:${username}`),
    ]);

    if (
      !profile.login ||
      !profile.avatar_url ||
      !profile.html_url ||
      !Number.isFinite(profile.followers) ||
      !Number.isFinite(profile.following) ||
      !Number.isFinite(profile.public_repos)
    ) {
      throw new Error("GitHub API returned an incomplete user profile");
    }

    return { profile, pullRequests, commits };
  }
/**
 * Disponibiliza essas duas funções para outros arquivos
 * JavaScript. Por exemplo, app.js pode acessar
 * window.GitHubSearchApi.searchRepositories(...). */
  window.GitHubSearchApi = { loadGitHubProfile, searchRepositories };
})();
