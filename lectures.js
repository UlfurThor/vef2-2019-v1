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

async function lecture(req, res, next) {
  const {
    slug,
  } = req.params;
  console.log(`--- page> fyrirlestur: slug = ${slug}`);

  if (slug === 'favicon.ico') {
    return;
  }

  const dataRaw = await readFileAsync(filepath);
  const data = JSON.parse(dataRaw.toString('utf8')).lectures;

  const found = data.find(i => i.slug === slug);

  if (!found) {
    throw new Error('Fyrirlestur fannst ekki');
  }

  const header = createHeader(data);
  console.log(header.outerHTML);
  //const content = createContent(data.content);
  //const footer = createFooter(data.slug, false);

  const staff = ['Jón', 'Gunna'];
  const extra = '<p><strong>Þessi síða er í vinnslu</strong></p>';


  // Getum sent eins mikið og við viljum af gögnum til template gegnum hlut
  console.log(found.image);
  res.render('lecture', {
    gen_header: header.outerHTML,
    heading__title: found.title,
    heading__category: found.category,
    heading__class: 'heading',
    backgroundImage: found.image,
    title: req.params.slug,
    staff,
    extra,
    header_type: '',
  });
}


router.get('/', catchErrors(list));
router.get('/:slug', catchErrors(lecture));

module.exports = router;
