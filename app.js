/*
Keyrt með:
node 09.template-ejs.js

Keyrir upp vef með express sem notar ejs template fyrir síður á / og /about
*/
const express = require('express');
const path = require('path');
const lect = require('./lectures');

const app = express();

// Þetta verður aðgengilegt gegnum `local.bar` í template
app.locals.foo = bar => `foo ${bar}!`;

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'ejs');

app.use('/', lect);


function notFoundHandler(req, res) {
  res.status(404).send('404 Not Found');
}

function errorHandler(err, req, res) {
  console.error(err);
  res.status(500).send('Villa!');
}

app.use(notFoundHandler);
app.use(errorHandler);

const hostname = '127.0.0.1';
const port = 3000;

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
