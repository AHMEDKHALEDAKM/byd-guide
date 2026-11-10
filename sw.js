// Keeps the guide working with no signal in the showroom.
const CACHE = 'byd-guide-bd78e2267e';
const SHELL = ["./","./index.html","./manifest.webmanifest","./favicon.svg","./icon-192.png","./icon-512.png","./apple-touch-icon.png","./cars/atto2.jpg","./cars/atto8.jpg","./cars/dolphinsurf.jpg","./cars/m9.jpg","./cars/sealion5.jpg","./cars/sealion6dmi.jpg","./cars/sealion6dmiawd.jpg","./cars/sealion6ev.jpg","./cars/shark6.jpg","./cars/ti7.jpg"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE && n !== 'byd-fonts').map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (/fonts.(googleapis|gstatic).com$/.test(url.hostname)) {
    e.respondWith(caches.open('byd-fonts').then(c => c.match(e.request).then(r => r || fetch(e.request).then(res => { c.put(e.request, res.clone()); return res; }))));
    return;
  }
  if (url.origin !== location.origin) return;
  // Page: newest from the network when there is signal, saved copy when not. Photos and icons: saved copy first.
  if (e.request.mode === 'navigate') {
    const isCustomer = url.pathname.includes('/c/');
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(isCustomer ? e.request : './index.html', copy)); return r; }).catch(() => isCustomer ? caches.match(e.request, {ignoreSearch:true}) : caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })));
});
