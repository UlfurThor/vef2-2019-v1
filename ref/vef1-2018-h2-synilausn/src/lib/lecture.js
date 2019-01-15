import { el, empty } from './helpers';
import { saveLecture, loadSavedLectures } from './storage';
import {
  youtube, text, quote, list, code, heading, image,
} from './item';

export default class Lecture {
  constructor() {
    this.container = document.querySelector('.lecture');
    this.url = 'lectures.json';
  }

  loadLecture(slug) {
    return fetch(this.url)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Gat ekki sótt fyrirlestra');
        }
        return res.json();
      })
      .then((data) => {
        const found = data.lectures.find(i => i.slug === slug);

        if (!found) {
          throw new Error('Fyrirlestur fannst ekki');
        }

        return found;
      });
  }

  setContent(...content) {
    empty(this.container);

    content.forEach((item) => {
      const contentToShow = typeof item === 'string'
        ? document.createTextNode(item) : item;

      this.container.appendChild(contentToShow);
    });
  }

  setError(error) {
    const header = this.createHeader({ category: 'Villa', title: error });
    const footer = this.createFooter();
    this.setContent(header, footer);
  }

  createHeader(data) {
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

  createContent(content) {
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

  markFinished(slug, e) {
    const { target } = e;

    const isFinished = target.classList.contains('lecture__finish--finished');

    if (isFinished) {
      target.textContent = 'Klára fyrirlestur';
    } else {
      target.textContent = '✓ Fyrirlestur kláraður';
    }

    target.classList.toggle('lecture__finish--finished');

    saveLecture(slug, !isFinished);
  }

  createFooter(slug, finished) {
    const finish = el('button', finished ? '✓ Fyrirlestur kláraður' : 'Klára fyrirlestur');
    finish.classList.add('lecture__finish');

    if (finished) {
      finish.classList.add('lecture__finish--finished');
    }

    finish.addEventListener('click', this.markFinished.bind(this, slug));

    const back = el('a', 'Til baka');
    back.classList.add('lecture__back');
    back.setAttribute('href', '/');

    const footer = el('footer', finish, back);
    footer.classList.add('lecture__footer');

    return footer;
  }

  renderLecture(data) {
    const header = this.createHeader(data);
    const content = this.createContent(data.content);
    const footer = this.createFooter(data.slug, this.checkFinished(data.slug));

    this.setContent(header, content, footer);
  }

  checkFinished(slug) {
    const saved = loadSavedLectures();

    return saved.indexOf(slug) >= 0;
  }

  load() {
    const qs = new URLSearchParams(window.location.search);
    const slug = qs.get('slug');

    if (!slug || slug === '') {
      this.setError('Engin fyrirlestur skilgreindur');
      return;
    }

    this.loadLecture(slug)
      .then(data => this.renderLecture(data))
      .catch((error) => {
        console.error(error);
        this.setError(error.message);
      });
  }
}
