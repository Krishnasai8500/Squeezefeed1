const memoryCache = new Set();

export function isCached(url) {
  return memoryCache.has(url);
}

export function getCachedSrc(url) {
  return url; // browser handles the actual caching
}

export function preloadAndCache(url) {
  if (!url || memoryCache.has(url)) return;

  const img = new Image();
  img.onload = () => memoryCache.add(url);
  img.onerror = () => {};
  img.src = url;
}
