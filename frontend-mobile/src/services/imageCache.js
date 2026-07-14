const memoryCache = new Set();

export function isCached(url) {
  return memoryCache.has(url);
}

export function getCachedSrc(url) {
  return url; // browser handles the actual caching
}

export function preloadAndCache(url) {
  if (!url || memoryCache.has(url)) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      memoryCache.add(url);
      resolve();
    };

    img.onerror = () => {
      resolve(); // don't block UI if image fails
    };

    img.src = url;
  });
}