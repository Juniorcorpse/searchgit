(() => {
  const { getElement }        = window.GitHubSearchDOM;
  const resultsContent        = getElement("#results-content");
  const resultsCard           = getElement("#results-card");
  const pagination            = getElement("#pagination");
  const previousPageButton    = getElement("#previous-page");
  const nextPageButton        = getElement("#next-page");
  const pageIndicator         = getElement("#page-indicator");
  const profileAvatar         = getElement("#profile-avatar");
  const profileAvatarFallback = getElement("#profile-avatar-fallback");
  const profileName           = getElement("#profile-name");
  const profileUsername       = getElement("#profile-username");
  const profileLink           = getElement("#profile-link");
  const profileStatus         = getElement("#profile-status");
  const profileFollowers      = getElement("#profile-followers");
  const profileFollowing      = getElement("#profile-following");
  const profileRepositories   = getElement("#profile-repositories");
  const profilePullRequests   = getElement("#profile-pull-requests");
  const profileCommits        = getElement("#profile-commits");

  // Esconde os controles quando não há páginas navegáveis.
  function hidePagination() {
    pagination.hidden = true;
  }

  // Usa valores compactos na tela e mantém o número completo no atributo title.
  function formatCount(count) {
    return new Intl.NumberFormat("pt-BR", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(count);
  }

  // Aplica o mesmo formato a cada contador do perfil.
  function setProfileCount(element, count) {
    element.textContent = formatCount(count);
    element.title = count.toLocaleString("pt-BR");
  }

  // Preenche o cabeçalho com os dados do perfil e suas contagens públicas.
  function showProfile({ profile, pullRequests, commits }) {
    profileAvatar.src = profile.avatar_url;
    profileAvatar.alt = `Foto de ${profile.login}`;
    profileAvatar.hidden = false;
    profileAvatarFallback.hidden = true;
    profileName.textContent = `~ ${profile.name}$`;
    profileUsername.textContent = ` ${profile.login}`;
    profileLink.href = profile.html_url;
    profileLink.textContent = `github.com/${profile.login} ↗`;

    setProfileCount(profileFollowers, profile.followers);
    setProfileCount(profileFollowing, profile.following);
    setProfileCount(profileRepositories, profile.public_repos);
    setProfileCount(profilePullRequests, pullRequests);
    setProfileCount(profileCommits, commits);

    profileStatus.hidden = true;
    profileStatus.classList.remove("is-error");
  }

  // Informa a falha sem apresentar contagens como se tivessem sido carregadas.
  function showProfileError() {
    profileStatus.textContent = "Não foi possível carregar as informações do GitHub.";
    profileStatus.classList.add("is-error");
    profileStatus.hidden = false;
  }

  // Cria mensagens de estado com nós de texto para não interpretar dados como HTML.
  function createStateMessage(icon, title, description, state = "info") {
    const message = document.createElement("div");
    message.className = `state-message state-${state}`;

    const iconElement = document.createElement("span");
    iconElement.className = "state-icon";
    iconElement.setAttribute("aria-hidden", "true");
    iconElement.textContent = icon;

    const copy = document.createElement("div");
    copy.className = "state-copy";

    const heading = document.createElement("h2");
    heading.textContent = title;

    const details = document.createElement("p");
    details.textContent = description;

    copy.append(heading, details);
    message.append(iconElement, copy);

    return message;
  }

  // Centraliza a atualização do conteúdo e do estado acessível de carregamento.
  function displayContent(content) {
    resultsContent.replaceChildren(content);
    resultsCard.setAttribute("aria-busy", "false");
  }

  // Mostra a instrução inicial e garante que a paginação fique oculta.
  function showInitialState() {
    hidePagination();
    displayContent(
      createStateMessage(
        "⌕",
        "Sua próxima descoberta começa aqui",
        "Digite um assunto ou tecnologia para explorar repositórios no GitHub.",
      ),
    );
  }

  // Substitui resultados e paginação pelo indicador enquanto a API responde.
  function showLoadingState() {
    hidePagination();
    const message = document.createElement("div");
    message.className = "state-message";

    const spinner = document.createElement("span");
    spinner.className = "state-icon";
    spinner.setAttribute("aria-hidden", "true");

    const indicator = document.createElement("span");
    indicator.className = "loading-indicator";
    spinner.append(indicator);

    const copy = document.createElement("div");
    copy.className = "state-copy";

    const heading = document.createElement("h2");
    heading.textContent = "Buscando repositórios";

    const details = document.createElement("p");
    details.textContent = "Estamos consultando o GitHub. Só um instante...";

    copy.append(heading, details);
    message.append(spinner, copy);

    displayContent(message);
    resultsCard.setAttribute("aria-busy", "true");
  }

  // Explica que a busca terminou corretamente, mas não encontrou repositórios.
  function showEmptyState(query) {
    hidePagination();
    displayContent(
      createStateMessage(
        "⌕",
        "Nenhum repositório encontrado",
        `Não encontramos resultados para “${query}”. Tente outro termo de busca.`,
      ),
    );
  }

  // Apresenta um erro amigável quando a busca não pode ser concluída.
  function showErrorState() {
    hidePagination();
    displayContent(
      createStateMessage(
        "!",
        "Não foi possível fazer a busca",
        "O GitHub não respondeu como esperado. Verifique sua conexão e tente novamente.",
        "error",
      ),
    );
  }

  // Monta um card usando textContent para exibir os dados sem interpretar HTML.
  function createRepositoryCard(repository) {
    const card = document.createElement("article");
    card.className = "repository";

    const avatar = document.createElement("img");
    avatar.className = "repository-avatar";
    avatar.src = repository.owner.avatar_url;
    avatar.alt = `Foto de ${repository.owner.login}`;
    avatar.loading = "lazy";

    const main = document.createElement("div");
    main.className = "repository-main";

    const author = document.createElement("span");
    author.className = "repository-author";
    author.textContent = repository.owner.login;

    const name = document.createElement("h3");
    name.className = "repository-name";
    name.textContent = repository.name;

    const description = document.createElement("p");
    description.className = "repository-description";
    description.textContent = repository.description || "Sem descrição disponível.";

    const metadata = document.createElement("div");
    metadata.className = "repository-meta";

    const stars = document.createElement("span");
    stars.textContent = `★ ${repository.stargazers_count.toLocaleString("pt-BR")}`;
    metadata.append(stars);

    if (repository.language) {
      const language = document.createElement("span");
      language.textContent = `◉ ${repository.language}`;
      metadata.append(language);
    }

    main.append(author, name, description, metadata);

    const link = document.createElement("a");
    link.className = "repository-link";
    link.href = repository.html_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Abrir ${repository.full_name} no GitHub`);
    link.textContent = "Ver repositório ↗";

    card.append(avatar, main, link);
    return card;
  }

  // Renderiza os cards e ativa anterior/próxima somente dentro dos limites.
  function showRepositories(repositories, currentPage, totalPages) {
    const fragment = document.createDocumentFragment();

    const heading = document.createElement("div");
    heading.className = "results-heading";

    const title = document.createElement("h2");
    title.textContent = "Repositórios em destaque";

    const count = document.createElement("span");
    count.className = "results-count";
    count.textContent = `${repositories.length} ${repositories.length === 1 ? "resultado" : "resultados"}`;

    heading.append(title, count);

    const list = document.createElement("div");
    list.className = "repository-list";
    repositories.forEach((repository) => {
      list.append(createRepositoryCard(repository));
    });

    fragment.append(heading, list);
    displayContent(fragment);

    pagination.hidden = totalPages <= 1;
    previousPageButton.disabled = currentPage <= 1;
    nextPageButton.disabled = currentPage >= totalPages;
    pageIndicator.textContent = `Página ${currentPage} de ${totalPages}`;
  }

  window.GitHubSearchUI = {
    showEmptyState,
    showErrorState,
    showInitialState,
    showLoadingState,
    showProfile,
    showProfileError,
    showRepositories,
  };
})();
