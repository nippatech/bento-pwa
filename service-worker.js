// お弁当PWA サービスワーカー（アプリシェルのみキャッシュ。データは常にオンライン取得）
var CACHE = 'bento-shell-v2';
var SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var url = e.request.url;
  // GAS APIへのリクエストはキャッシュしない（常に最新をネットワークから）
  if (url.indexOf('script.google.com') >= 0 || url.indexOf('googleusercontent.com') >= 0) return;
  // アプリシェルはキャッシュ優先（オフラインでも起動できる）
  e.respondWith(caches.match(e.request).then(function (r) { return r || fetch(e.request); }));
});
