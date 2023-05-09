import {
  readBlockConfig,
  fetchPlaceholders,
} from '../../scripts/lib-franklin.js';

export function buildArticleCard(article, type = 'article') {
  const {
    title, description, path,
  } = article;

  const card = document.createElement('a');
  card.className = `${type}-card`;
  card.href = path;

  card.innerHTML = `<div class="${type}-card-body">
      <h3>${title}</h3>
      <p class="${type}-card-description">${description}</p>
    </div>`;
  return card;
}

export async function fetchBlogArticleIndex() {
  const pageSize = 501;
  window.blogIndex = window.blogIndex || {
    data: [],
    byPath: {},
    offset: 0,
    complete: false,
  };
  if (window.blogIndex.complete) return (window.blogIndex);
  const index = window.blogIndex;
  const resp = await fetch(`/query-index.json?limit=${pageSize}&offset=${index.offset}`);
  const json = await resp.json();
  const complete = (json.limit + json.offset) === json.total;
  json.data.forEach((post) => {
    index.data.push(post);
    index.byPath[post.path.split('.')[0]] = post;
  });
  index.complete = complete;
  index.offset = json.offset + pageSize;
  return (index);
}

async function filterArticles(config, feed, limit, offset) {
  /* filter posts by tags */
  let { tags } = config;
  if (tags) {
    tags = tags.split(',');
    tags.forEach((t) => t.toLowerCase().trim());
  }

  while ((feed.data.length < limit + offset) && (!feed.complete)) {
    // eslint-disable-next-line no-await-in-loop
    const index = await fetchBlogArticleIndex();
    const indexChunk = index.data.slice(feed.cursor);

    const feedChunk = indexChunk.filter((article) => {
      if (article.tags) {
        const articleTags = JSON.parse(article.tags).map((x) => x.toLowerCase().trim());
        return articleTags.some((tag) => tags.indexOf(tag) > -1);
      }
      return false;
    });
    feed.cursor = index.data.length;
    feed.complete = index.complete;
    feed.data = [...feed.data, ...feedChunk];
  }
}

async function decorateArticleFeed(
  articleFeedEl,
  config,
  offset = 0,
  feed = { data: [], complete: false, cursor: 0 },
) {
  let articleCards = articleFeedEl.querySelector('.article-cards');
  if (!articleCards) {
    articleCards = document.createElement('div');
    articleCards.className = 'article-cards';
    articleFeedEl.appendChild(articleCards);
  }
  // display spinner
  const emptyDiv = document.createElement('div');
  emptyDiv.classList.add('article-cards-empty');
  const spinner = document.createElement('div');
  spinner.classList.add('spinner');
  emptyDiv.append(spinner);
  articleCards.append(emptyDiv);
  const placeholders = fetchPlaceholders();
  const limit = 12;
  const pageEnd = offset + limit;
  await filterArticles(config, feed, limit, offset);
  const articles = feed.data;
  if (articles.length) {
    // results were found
    emptyDiv.remove();
  } else if (config.selectedProducts || config.selectedIndustries) {
    // no user filtered results were found
    spinner.remove();
    const noMatches = document.createElement('p');
    noMatches.innerHTML = `<strong>${placeholders['no-matches']}</strong>`;
    const userHelp = document.createElement('p');
    userHelp.classList.add('article-cards-empty-filtered');
    userHelp.textContent = placeholders['user-help'];
    emptyDiv.append(noMatches, userHelp);
  } else {
    // no results were found
    spinner.remove();
    const noResults = document.createElement('p');
    noResults.innerHTML = `<strong>${placeholders['no-results']}</strong>`;
    emptyDiv.append(noResults);
  }
  const max = pageEnd > articles.length ? articles.length : pageEnd;
  for (let i = offset; i < max; i += 1) {
    const article = articles[i];
    const card = buildArticleCard(article);
    articleCards.append(card);
  }

  articleFeedEl.classList.add('appear');
  return articles.length;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  block.innerHTML = '';
  await decorateArticleFeed(block, config);
}
