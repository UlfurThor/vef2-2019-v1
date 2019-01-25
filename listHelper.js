const jsdom = require('jsdom');

const {
  JSDOM,
} = jsdom;
const {
  document,
} = (new JSDOM()).window;

function el(name, ...children) {
  const element = document.createElement(name);

  if (Array.isArray(children)) {
    for (let child of children) { /* eslint-disable-line */
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child) {
        element.appendChild(child);
      }
    }
  }

  return element;
}


function renderItem(data) {
  const image = el('div');
  image.classList.add('listItem__image');

  if (data.thumbnail) {
    const img = el('img');
    img.setAttribute('src', data.thumbnail);
    img.setAttribute('alt', '');
    image.appendChild(img);
  } else {
    image.classList.add('listItem__image--empty');
  }

  const category = el('span', data.category);
  category.classList.add('listItem__category');

  const heading = el('h2', data.title);
  heading.classList.add('listItem__title');

  const textElements = el('div', category, heading);
  textElements.classList.add('listItem__texts');

  const text = el('div', textElements);
  text.classList.add('listItem__bottom');

  if (data.finished) {
    const finished = el('div', '✓');
    finished.classList.add('listItem__finished');
    text.appendChild(finished);
  }

  const item = el('a', image, text);
  item.classList.add('listItem');
  item.setAttribute('href', `${data.slug}`);

  return item;
}

function renderLectures(data) {
  const items = data.map((item) => {
    const col = el('div', renderItem(item));
    col.classList.add('list__col');
    return col;
  });

  const row = el('div', ...items);
  row.classList.add('list__row');
  return row;
}

module.exports = function (data) {
  return renderLectures(data);
};
