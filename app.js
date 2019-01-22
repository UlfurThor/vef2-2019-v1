/*
Keyrt með:
node 09.template-ejs.js

Keyrir upp vef með express sem notar ejs template fyrir síður á / og /about
*/
const express = require('express');
const path = require('path');

const app = express();

// Þetta verður aðgengilegt gegnum `local.bar` í template
app.locals.foo = bar => `foo ${bar}!`;

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
  console.log('--- page> index');
  // `title` verður aðgengilegt sem breyta í template
  res.render('index', {
    title: 'Forsíða',
  });
});

app.get('/fyrirlestur', (req, res) => {
  if (req.query.slug !== undefined) {
    console.log(`--- page> fyrirlestur ?= ${req.query.slug}`);
  } else {
    console.log('--- page> fyrirlestur');
  }
  const staff = ['Jón', 'Gunna'];
  const extra = '<p><strong>Þessi síða er í vinnslu</strong></p>';

  // Getum sent eins mikið og við viljum af gögnum til template gegnum hlut
  res.render('about', {
    title: 'Um',
    staff,
    extra,
  });
});


const hostname = '127.0.0.1';
const port = 3000;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
