# Buscador de repositórios do GitHub

Aplicação web simples para pesquisar repositórios públicos do GitHub por palavra-chave. O cabeçalho também mostra o perfil de `Juniorcorpse` e suas estatísticas públicas. Os resultados são ordenados por estrelas, paginados em grupos de 10 e mostram o autor, descrição, linguagem principal, quantidade de estrelas e link para o repositório.

## Como executar

Abra `index.html` diretamente no navegador ou sirva a pasta por um servidor HTTP local. Por exemplo, com Python instalado:

```bash
python -m http.server 8000
```

Se usar o servidor, acesse `http://localhost:8000`. Os scripts são carregados sem ES modules para permitir a abertura via `file://`. A busca requer conexão com a internet para acessar a API do GitHub.

## Estrutura

- `index.html`: estrutura da página e formulário de busca.
- `assets/css/style.css`: estilos e layout responsivo.
- `assets/js/dom.js`: helper compartilhado para localizar elementos obrigatórios da página.
- `assets/js/app.js`: eventos do formulário e fluxo da busca.
- `assets/js/github-api.js`: comunicação com a API do GitHub.
- `assets/js/ui.js`: estados da interface e renderização dos resultados.

## Busca

A aplicação pesquisa somente quando o formulário é enviado por Enter ou pelo botão **Buscar**. Os controles **Anterior** e **Próxima** permitem navegar pelas páginas de 10 repositórios, ordenadas por estrelas, usando a API pública:

`https://api.github.com/search/repositories?q={PALAVRA-CHAVE}&sort=stars&per_page=10&page={PÁGINA}`


## Aplicação online

[🚀 **Acesse o Buscador de repositórios**](https://juniorcorpse.github.io/searchgit/)
