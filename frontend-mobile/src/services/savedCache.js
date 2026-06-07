// src/services/savedCache.js
// Persists saved article IDs in sessionStorage so
// navigating away and back doesn't reset save state.

const KEY = "savedArticleIds";

export function getSavedCache() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setSavedCache(map) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(map));
  } catch {}
}

export function markSaved(articleId) {
  const map = getSavedCache();
  map[articleId] = true;
  setSavedCache(map);
}

export function markUnsaved(articleId) {
  const map = getSavedCache();
  delete map[articleId];
  setSavedCache(map);
}

export function isSaved(articleId) {
  return !!getSavedCache()[articleId];
}

export function clearSavedCache() {
  sessionStorage.removeItem(KEY);
}
