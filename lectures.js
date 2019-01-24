
const express = require('express');

const router = express.Router();

const util = require('util');
const fs = require('fs');

const jsdom = require('jsdom');

const {
  JSDOM,
} = jsdom;
const {
  document,
} = (new JSDOM()).window;

const readFileAsync = util.promisify(fs.readFile);

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

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


const filepath = 'lectures.json';

async function list(req, res) {
  console.log('--- page> index');
  const dataRaw = await readFileAsync(filepath);
  const data = JSON.parse(dataRaw.toString('utf8')).lectures;

  const wrapper = renderLectures(data);

  // `title` verður aðgengilegt sem breyta í template
  res.render('index', {
    heading__title: 'Forsíða',
    heading__category: 'Vefforritun',
    heading__class: 'heading heading--main',
    page_type: 'index',
    lectures: wrapper.outerHTML,
  });
}

function createHeader(data) {
  const category = el('span', data.category);
  category.classList.add('heading__category');
  const headingElement = el('h2', data.title);
  headingElement.classList.add('heading__title');
  const headingWrapper = el('div', category, headingElement);
  headingWrapper.classList.add('heading');

  if (data.image) {
    headingWrapper.style.backgroundImage = `url(${data.image})`;
  }

  return headingWrapper;
}

function item(type, ...data) {
  const content = el('div', ...data);
  content.classList.add('item__content');

  const wrapper = el('div', content);
  wrapper.classList.add('item', `item--${type}`);

  return wrapper;
}

function text(data) {
  const split = data.split('\n');

  const texts = split.map((t) => {
    const p = el('p', t);
    p.classList.add('item__text');
    return p;
  });

  return item('text', ...texts);
}

function quote(data, attribute) {
  const quoteText = el('p', data);
  quoteText.classList.add('item__quote');

  const quoteAttribute = el('p', attribute);
  quoteAttribute.classList.add('item__attribute');

  const blockquote = el('blockquote', quoteText, quoteAttribute);

  return item('blockquote', blockquote);
}

function heading(data) {
  const element = el('h3', data);
  element.classList.add('item__heading');

  return item('heading', element);
}

function listI(data) {
  const items = data.map((i) => {
    const li = el('li', i);
    li.classList.add('item__li');
    return li;
  });

  const ul = el('ul', ...items);
  ul.classList.add('item__ul');

  return item('list', ul);
}

function code(data) {
  const element = el('pre', data);
  element.classList.add('item__code');

  return item('code', element);
}

function youtube(url) {
  const iframe = el('iframe');
  iframe.classList.add('item__iframe');
  iframe.setAttribute('src', url);
  iframe.setAttribute('frameborder', 0);
  iframe.setAttribute('allowfullscreen', true);

  return item('youtube', iframe);
}

function image(data, caption) {
  const imageElement = el('img');
  imageElement.classList.add('image__img');
  imageElement.setAttribute('alt', caption);
  imageElement.setAttribute('src', data);

  const imageAttribution = el('p', caption);
  imageAttribution.classList.add('item__caption');

  const blockquote = el('div', imageElement, imageAttribution);

  return item('image', blockquote);
}


function createContent(content) {
  const col = el('div');
  col.classList.add('lecture__col');
  const row = el('div', col);
  row.classList.add('lecture__row');
  const wrapper = el('div', row);
  wrapper.classList.add('lecture__content');

  content.forEach((i) => {
    let item;
    switch (i.type) {
      case 'youtube':
        item = youtube(i.data);
        break;
      case 'text':
        item = text(i.data);
        break;
      case 'list':
        item = list(i.data);
        break;
      case 'heading':
        item = heading(i.data);
        break;
      case 'code':
        item = code(i.data);
        break;
      case 'quote':
        item = quote(i.data, i.attribute);
        break;
      case 'image':
        item = image(i.data, i.caption);
        break;
      default:
        item = el('div', i.type);
    }

    col.appendChild(item);
  });

  return wrapper;
}

async function lecture(req, res, next) {
  const {
    slug,
  } = req.params;

  if (slug === 'favicon.ico') {
    next();
    return;
  }
  console.log(`--- page> fyrirlestur: slug = ${slug}`);

  const dataRaw = await readFileAsync(filepath);
  const data = JSON.parse(dataRaw.toString('utf8')).lectures;

  const found = data.find(i => i.slug === slug);

  if (!found) {
    // throw new Error('Fyrirlestur fannst ekki');
    next();
    return;
  }

  const header = createHeader(data);
  const content = createContent(data.content);
  //const footer = createFooter(data.slug, false);

  res.render('lecture', {
    gen_header: header.outerHTML,
    heading__title: found.title,
    heading__category: found.category,
    heading__class: 'heading',
    backgroundImage: found.image,
  });
}


router.get('/', catchErrors(list));
router.get('/:slug', catchErrors(lecture));

module.exports = router;
