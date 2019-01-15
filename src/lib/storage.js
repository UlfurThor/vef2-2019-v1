const LOCALSTORAGE_KEY = 'saved_lectures';

export function loadSavedLectures() {
  const savedJson = localStorage.getItem(LOCALSTORAGE_KEY);
  const saved = JSON.parse(savedJson) || [];

  return saved;
}

export function saveLecture(slug) {
  const saved = loadSavedLectures();

  const index = saved.indexOf(slug);

  if (index >= 0) {
    saved.splice(index, 1);
  } else {
    saved.push(slug);
  }

  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(saved));
}
