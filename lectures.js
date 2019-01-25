const express = require('express');

const router = express.Router();

const util = require('util');
const fs = require('fs');

const listHelper = require('./listHelper');
const lectureHelper = require('./lectureHelper');


const readFileAsync = util.promisify(fs.readFile);

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}


const filepath = 'lectures.json';

async function list(req, res) {
  console.log('--- page> index');
  const dataRaw = await readFileAsync(filepath);
  const data = JSON.parse(dataRaw.toString('utf8')).lectures;

  const wrapper = listHelper(data);

  // `title` verður aðgengilegt sem breyta í template
  res.render('index', {
    heading__title: 'Forsíða',
    heading__category: 'Vefforritun',
    heading__class: 'heading heading--main',
    page_type: 'index',
    lectures: wrapper.outerHTML,
  });
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

  const generatedContent = lectureHelper(found.content);

  res.render('lecture', {
    heading__title: found.title,
    heading__category: found.category,
    heading__class: 'heading',
    backgroundImage: found.image,
    content: generatedContent[0].outerHTML,
    footer: generatedContent[1].outerHTML,

  });
}


router.get('/', catchErrors(list));
router.get('/:slug', catchErrors(lecture));

module.exports = router;
