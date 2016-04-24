var CACHE_NAME = 'shri-2016-task3-1';

var urlsToCache = [
  '/',
  '/css/index.css',
  '/js/index.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
    console.log(event);
    const requestURL = new URL(event.request.url);

    if (/^\/api\/v1/.test(requestURL.pathname)
        && (event.request.method !== 'GET' && event.request.method !== 'HEAD')) {
        return event.respondWith(fetch(event.request));
    }

    if (/^\/api\/v1/.test(requestURL.pathname)) {
        // return event.respondWith(
            // Тут выполнится то, что загрузится раньше
            // Работает параллельно
            // А нам надо последовательно
            // Promise.race([
                // fetchAndPutToCache(event.request),
                // getFromCache(event.request)
            // ])
        // );
        return event.respondWith(fetchAndPutToCache(event.request));
        // Это не совсем одно и то же
    }
    return event.respondWith(
        getFromCache(event.request).catch(fetchAndPutToCache(event.request))
    );
});

// Функция принимает в качестве аргумента URL запроса.
// Но выше на 36 строке мы её оставляем без всего.
function fetchAndPutToCache(request) {
    return fetch(request).then((response) => {
        const responseToCache = response.clone();
        return caches.open(CACHE_NAME)
            .then((cache) => {
                cache.put(request, responseToCache);
            })
            .then(() => response);
    })
    // .catch(() => caches.match(request));
    // В случае ошибки это слабенько и без промисов
    .catch(() => getFromCache(request));
    // А вот это уже лучше
}

function getFromCache(request) {
    return caches.match(request)
        .then((response) => {
            if (response) {
                return response;
            }
            return Promise.reject();
        });
}
