const CACHE = "billetera-v3";
const SCOPE = self.registration ? self.registration.scope : "/";
const ASSETS = [SCOPE, SCOPE + "index.html", SCOPE + "manifest.json", SCOPE + "icon-192.png", SCOPE + "icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

const isImmutableAsset = (url) => {
  // App icons, maneki assets, fonts (gstatic, googleapis font CSS)
  if (/\/(maneki|icon-)[^/]*\.(png|jpg|svg|webp)$/i.test(url.pathname)) return true;
  if (/\.(woff2?|ttf|otf)$/i.test(url.pathname)) return true;
  if (url.hostname === "fonts.gstatic.com") return true;
  return false;
};

const cacheFirst = async (req) => {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.status === 200) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
    }
    return res;
  } catch {
    return cached || Response.error();
  }
};

const networkFirst = async (req) => {
  try {
    const res = await fetch(req);
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
    return res;
  } catch {
    const cached = await caches.match(req);
    return cached || caches.match(SCOPE + "index.html");
  }
};

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  let url;
  try { url = new URL(e.request.url); } catch { return; }
  if (isImmutableAsset(url)) {
    e.respondWith(cacheFirst(e.request));
  } else {
    e.respondWith(networkFirst(e.request));
  }
});
