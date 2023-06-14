import {
  readBlockConfig,
  fetchPlaceholders,
  createOptimizedPicture,
} from '../../scripts/lib-franklin.js';

const categoryLocation = {
  docs: '/docs',
  'form-template': '/templates/formblock',
};

export function buildArticleCard(article, type = 'article') {
  const {
    title, description, path, image,
  } = article;

  const card = document.createElement('a');
  card.setAttribute('target', '_blank');
  card.className = `${type}-card`;
  card.href = path;
  let picture;
  if (image.match(/default-meta-image\.png/)) {
    picture = document.createRange().createContextualFragment('<div class="default-image"></div>');
  } else {
    picture = createOptimizedPicture(image, title, false, [{ width: '400' }]);
  }
  const div = document.createRange().createContextualFragment(`<div class="${type}-card-body">
      <h3>${title.split('|')[0]}</h3>
      <p class="${type}-card-description">${description}</p>
    </div>`);
  card.append(picture, div);
  return card;
}

export async function fetchBlogArticleIndex(category) {
  const pageSize = 501;
  window.blogIndex = window.blogIndex || {
    data: [],
    byPath: {},
    offset: 0,
    complete: false,
  };
  const location = categoryLocation?.[category] || '/docs';
  if (window.blogIndex.complete) return (window.blogIndex);
  const index = window.blogIndex;
  const resp = await fetch(`  ${location}/query-index.json?limit=${pageSize}&offset=${index.offset}`);
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
  const category = config.category?.toLowerCase()?.trim();

  while ((feed.data.length < limit + offset) && (!feed.complete)) {
    // eslint-disable-next-line no-await-in-loop
    const index = await fetchBlogArticleIndex(category);
    const indexChunk = index.data.slice(feed.cursor);

    const feedChunk = indexChunk.filter((article) => {
      if (article.title && article.category) {
        const articleCategory = article.category.toLowerCase().trim();
        return articleCategory === category;
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
