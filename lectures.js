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
  // this.setContent(row);
}


const filepath = 'lectures.json';

async function list(req, res) {
  /* todo útfæra */

  const dataRaw = await readFileAsync(filepath);
  const data = JSON.parse(dataRaw.toString('utf8')).lectures;

  const wrapper = renderLectures(data);
  /*
    // jsdom útfærir DOM staðal
    wrapper.classList.add('reciepe');
    wrapper.dataset.foo = 'bar';

    const ul = document.createElement('ol');

    console.log('asdasd');
    data.forEach((lect) => {
      console.log(lect.slug);
      const li = document.createElement('li');
      li.appendChild(document.createTextNode(lect.slug));
      ul.appendChild(li);
    });

    wrapper.appendChild(ul);
  */
  const sluglist = data.map((lect) => {
    return lect.slug;
  });

  console.log(wrapper);

  console.log('--- page> index');
  // `title` verður aðgengilegt sem breyta í template
  res.render('index', {
    title: 'Forsíða',
    header_type: 'heading--main',
    page_type: 'index',
    lectures: wrapper.outerHTML,
  });
}

async function lecture(req, res, next) {
  /* todo útfæra */
  console.log(`--- page> fyrirlestur: slug = ${req.params.slug}`);

  const staff = ['Jón', 'Gunna'];
  const extra = '<p><strong>Þessi síða er í vinnslu</strong></p>';

  // Getum sent eins mikið og við viljum af gögnum til template gegnum hlut
  res.render('about', {
    title: req.params.slug,
    staff,
    extra,
    header_type: '',
  });
}


router.get('/', catchErrors(list));
router.get('/:slug', catchErrors(lecture));

module.exports = router;
