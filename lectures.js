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


const filepath = 'lectures.json';

async function list(req, res) {
  /* todo útfæra */

  const dataRaw = await readFileAsync(filepath);
  const data = JSON.parse(dataRaw.toString('utf8')).lectures;

  const wrapper = document.createElement('div');

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
    lectures: sluglist,
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
