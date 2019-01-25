import { el } from './helpers';

function item(type, ...data) {
  const content = el('div', ...data);
  content.classList.add('item__content');

  const wrapper = el('div', content);
  wrapper.classList.add('item', `item--${type}`);

  return wrapper;
}

export function text(data) {
  const split = data.split('\n');

  const texts = split.map((t) => {
    const p = el('p', t);
    p.classList.add('item__text');
    return p;
  });

  return item('text', ...texts);
}

export function quote(data, attribute) {
  const quoteText = el('p', data);
  quoteText.classList.add('item__quote');

  const quoteAttribute = el('p', attribute);
  quoteAttribute.classList.add('item__attribute');

  const blockquote = el('blockquote', quoteText, quoteAttribute);

  return item('blockquote', blockquote);
}

export function heading(data) {
  const element = el('h3', data);
  element.classList.add('item__heading');

  return item('heading', element);
}

export function list(data) {
  const items = data.map((i) => {
    const li = el('li', i);
    li.classList.add('item__li');
    return li;
  });

  const ul = el('ul', ...items);
  ul.classList.add('item__ul');

  return item('list', ul);
}

export function code(data) {
  const element = el('pre', data);
  element.classList.add('item__code');

  return item('code', element);
}

export function youtube(url) {
  const iframe = el('iframe');
  iframe.classList.add('item__iframe');
  iframe.setAttribute('src', url);
  iframe.setAttribute('frameborder', 0);
  iframe.setAttribute('allowfullscreen', true);

  return item('youtube', iframe);
}

export function image(data, caption) {
  const imageElement = el('img');
  imageElement.classList.add('image__img');
  imageElement.setAttribute('alt', caption);
  imageElement.setAttribute('src', data);

  const imageAttribution = el('p', caption);
  imageAttribution.classList.add('item__caption');

  const blockquote = el('div', imageElement, imageAttribution);

  return item('image', blockquote);
}
