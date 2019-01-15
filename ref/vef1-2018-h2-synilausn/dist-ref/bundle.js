(function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function empty(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
  function el(name) {
    var element = document.createElement(name);

    for (var _len = arguments.length, children = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      children[_key - 1] = arguments[_key];
    }

    if (Array.isArray(children)) {
      for (var _i = 0; _i < children.length; _i++) {
        var child = children[_i];

        /* eslint-disable-line */
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else if (child) {
          element.appendChild(child);
        }
      }
    }

    return element;
  }

  var LOCALSTORAGE_KEY = 'saved_lectures';
  function loadSavedLectures() {
    var savedJson = localStorage.getItem(LOCALSTORAGE_KEY);
    var saved = JSON.parse(savedJson) || [];
    return saved;
  }
  function saveLecture(slug) {
    var saved = loadSavedLectures();
    var index = saved.indexOf(slug);

    if (index >= 0) {
      saved.splice(index, 1);
    } else {
      saved.push(slug);
    }

    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(saved));
  }

  var List =
  /*#__PURE__*/
  function () {
    function List() {
      _classCallCheck(this, List);

      this.container = document.querySelector('.list');
      this.filters = document.querySelectorAll('.filters__filter');
      this.url = 'lectures.json';
    }

    _createClass(List, [{
      key: "setContent",
      value: function setContent() {
        var _this = this;

        empty(this.container);

        for (var _len = arguments.length, content = new Array(_len), _key = 0; _key < _len; _key++) {
          content[_key] = arguments[_key];
        }

        content.forEach(function (item) {
          var contentToShow = typeof item === 'string' ? document.createTextNode(item) : item;

          _this.container.appendChild(contentToShow);
        });
      }
    }, {
      key: "setError",
      value: function setError(error) {
        var errorElement = el('div', error);
        errorElement.classList.add('list__error');
        this.setContent(errorElement);
      }
    }, {
      key: "loadLectures",
      value: function loadLectures() {
        return fetch(this.url).then(function (res) {
          if (!res.ok) {
            throw new Error('Gat ekki sótt fyrirlestra');
          }

          return res.json();
        });
      }
    }, {
      key: "filterLectures",
      value: function filterLectures(data) {
        var activeFilters = Array.from(this.filters).filter(function (i) {
          return i.classList.contains('filters__filter--active');
        }).map(function (i) {
          return i.dataset.category;
        });
        return data.filter(function (i) {
          return activeFilters.length === 0 || activeFilters.indexOf(i.category) >= 0;
        });
      }
    }, {
      key: "addSavedLectures",
      value: function addSavedLectures(data) {
        var saved = loadSavedLectures();
        return data.map(function (i) {
          i.finished = saved.indexOf(i.slug) >= 0;
          /* eslint-disable-line */

          return i;
        });
      }
    }, {
      key: "renderItem",
      value: function renderItem(data) {
        var image = el('div');
        image.classList.add('listItem__image');

        if (data.thumbnail) {
          var img = el('img');
          img.setAttribute('src', data.thumbnail);
          img.setAttribute('alt', '');
          image.appendChild(img);
        } else {
          image.classList.add('listItem__image--empty');
        }

        var category = el('span', data.category);
        category.classList.add('listItem__category');
        var heading = el('h2', data.title);
        heading.classList.add('listItem__title');
        var textElements = el('div', category, heading);
        textElements.classList.add('listItem__texts');
        var text = el('div', textElements);
        text.classList.add('listItem__bottom');

        if (data.finished) {
          var finished = el('div', '✓');
          finished.classList.add('listItem__finished');
          text.appendChild(finished);
        }

        var item = el('a', image, text);
        item.classList.add('listItem');
        item.setAttribute('href', "fyrirlestur.html?slug=".concat(data.slug));
        return item;
      }
    }, {
      key: "renderLectures",
      value: function renderLectures(data) {
        var _this2 = this;

        var items = data.map(function (item) {
          var col = el('div', _this2.renderItem(item));
          col.classList.add('list__col');
          return col;
        });
        var row = el.apply(void 0, ['div'].concat(_toConsumableArray(items)));
        row.classList.add('list__row');
        this.setContent(row);
      }
    }, {
      key: "toggleFilter",
      value: function toggleFilter(e) {
        var _this3 = this;

        var target = e.target;
        target.classList.toggle('filters__filter--active'); // todo refactor

        this.loadLectures().then(function (data) {
          return _this3.addSavedLectures(data.lectures);
        }).then(function (data) {
          return _this3.filterLectures(data);
        }).then(function (data) {
          return _this3.renderLectures(data);
        }).catch(function (error) {
          console.error(error);

          _this3.setError(error.message);
        });
      }
    }, {
      key: "setupFilters",
      value: function setupFilters() {
        var _this4 = this;

        this.filters.forEach(function (filter) {
          filter.addEventListener('click', _this4.toggleFilter.bind(_this4));
        });
      }
    }, {
      key: "load",
      value: function load() {
        var _this5 = this;

        this.loadLectures().then(function (data) {
          return _this5.addSavedLectures(data.lectures);
        }).then(function (data) {
          return _this5.filterLectures(data);
        }).then(function (data) {
          return _this5.renderLectures(data);
        }).catch(function (error) {
          console.error(error);

          _this5.setError(error.message);
        });
        this.setupFilters();
      }
    }]);

    return List;
  }();

  function item(type) {
    for (var _len = arguments.length, data = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      data[_key - 1] = arguments[_key];
    }

    var content = el.apply(void 0, ['div'].concat(data));
    content.classList.add('item__content');
    var wrapper = el('div', content);
    wrapper.classList.add('item', "item--".concat(type));
    return wrapper;
  }

  function text(data) {
    var split = data.split('\n');
    var texts = split.map(function (t) {
      var p = el('p', t);
      p.classList.add('item__text');
      return p;
    });
    return item.apply(void 0, ['text'].concat(_toConsumableArray(texts)));
  }
  function quote(data, attribute) {
    var quoteText = el('p', data);
    quoteText.classList.add('item__quote');
    var quoteAttribute = el('p', attribute);
    quoteAttribute.classList.add('item__attribute');
    var blockquote = el('blockquote', quoteText, quoteAttribute);
    return item('blockquote', blockquote);
  }
  function heading(data) {
    var element = el('h3', data);
    element.classList.add('item__heading');
    return item('heading', element);
  }
  function list(data) {
    var items = data.map(function (i) {
      var li = el('li', i);
      li.classList.add('item__li');
      return li;
    });
    var ul = el.apply(void 0, ['ul'].concat(_toConsumableArray(items)));
    ul.classList.add('item__ul');
    return item('list', ul);
  }
  function code(data) {
    var element = el('pre', data);
    element.classList.add('item__code');
    return item('code', element);
  }
  function youtube(url) {
    var iframe = el('iframe');
    iframe.classList.add('item__iframe');
    iframe.setAttribute('src', url);
    iframe.setAttribute('frameborder', 0);
    iframe.setAttribute('allowfullscreen', true);
    return item('youtube', iframe);
  }
  function image(data, caption) {
    var imageElement = el('img');
    imageElement.classList.add('image__img');
    imageElement.setAttribute('alt', caption);
    imageElement.setAttribute('src', data);
    var imageAttribution = el('p', caption);
    imageAttribution.classList.add('item__caption');
    var blockquote = el('div', imageElement, imageAttribution);
    return item('image', blockquote);
  }

  var Lecture =
  /*#__PURE__*/
  function () {
    function Lecture() {
      _classCallCheck(this, Lecture);

      this.container = document.querySelector('.lecture');
      this.url = 'lectures.json';
    }

    _createClass(Lecture, [{
      key: "loadLecture",
      value: function loadLecture(slug) {
        return fetch(this.url).then(function (res) {
          if (!res.ok) {
            throw new Error('Gat ekki sótt fyrirlestra');
          }

          return res.json();
        }).then(function (data) {
          var found = data.lectures.find(function (i) {
            return i.slug === slug;
          });

          if (!found) {
            throw new Error('Fyrirlestur fannst ekki');
          }

          return found;
        });
      }
    }, {
      key: "setContent",
      value: function setContent() {
        var _this = this;

        empty(this.container);

        for (var _len = arguments.length, content = new Array(_len), _key = 0; _key < _len; _key++) {
          content[_key] = arguments[_key];
        }

        content.forEach(function (item) {
          var contentToShow = typeof item === 'string' ? document.createTextNode(item) : item;

          _this.container.appendChild(contentToShow);
        });
      }
    }, {
      key: "setError",
      value: function setError(error) {
        var header = this.createHeader({
          category: 'Villa',
          title: error
        });
        var footer = this.createFooter();
        this.setContent(header, footer);
      }
    }, {
      key: "createHeader",
      value: function createHeader(data) {
        var category = el('span', data.category);
        category.classList.add('heading__category');
        var headingElement = el('h2', data.title);
        headingElement.classList.add('heading__title');
        var headingWrapper = el('div', category, headingElement);
        headingWrapper.classList.add('heading');

        if (data.image) {
          headingWrapper.style.backgroundImage = "url(".concat(data.image, ")");
        }

        return headingWrapper;
      }
    }, {
      key: "createContent",
      value: function createContent(content) {
        var col = el('div');
        col.classList.add('lecture__col');
        var row = el('div', col);
        row.classList.add('lecture__row');
        var wrapper = el('div', row);
        wrapper.classList.add('lecture__content');
        content.forEach(function (i) {
          var item;

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
    }, {
      key: "markFinished",
      value: function markFinished(slug, e) {
        var target = e.target;
        var isFinished = target.classList.contains('lecture__finish--finished');

        if (isFinished) {
          target.textContent = 'Klára fyrirlestur';
        } else {
          target.textContent = '✓ Fyrirlestur kláraður';
        }

        target.classList.toggle('lecture__finish--finished');
        saveLecture(slug, !isFinished);
      }
    }, {
      key: "createFooter",
      value: function createFooter(slug, finished) {
        var finish = el('button', finished ? '✓ Fyrirlestur kláraður' : 'Klára fyrirlestur');
        finish.classList.add('lecture__finish');

        if (finished) {
          finish.classList.add('lecture__finish--finished');
        }

        finish.addEventListener('click', this.markFinished.bind(this, slug));
        var back = el('a', 'Til baka');
        back.classList.add('lecture__back');
        back.setAttribute('href', '/');
        var footer = el('footer', finish, back);
        footer.classList.add('lecture__footer');
        return footer;
      }
    }, {
      key: "renderLecture",
      value: function renderLecture(data) {
        var header = this.createHeader(data);
        var content = this.createContent(data.content);
        var footer = this.createFooter(data.slug, this.checkFinished(data.slug));
        this.setContent(header, content, footer);
      }
    }, {
      key: "checkFinished",
      value: function checkFinished(slug) {
        var saved = loadSavedLectures();
        return saved.indexOf(slug) >= 0;
      }
    }, {
      key: "load",
      value: function load() {
        var _this2 = this;

        var qs = new URLSearchParams(window.location.search);
        var slug = qs.get('slug');

        if (!slug || slug === '') {
          this.setError('Engin fyrirlestur skilgreindur');
          return;
        }

        this.loadLecture(slug).then(function (data) {
          return _this2.renderLecture(data);
        }).catch(function (error) {
          console.error(error);

          _this2.setError(error.message);
        });
      }
    }]);

    return Lecture;
  }();

  document.addEventListener('DOMContentLoaded', function () {
    var page = document.querySelector('body');
    var isLecturePage = page.classList.contains('lecture-page');

    if (isLecturePage) {
      var lecture = new Lecture();
      lecture.load();
    } else {
      var list = new List();
      list.load();
    }
  });

}());
//# sourceMappingURL=bundle.js.map
