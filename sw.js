/**
 * Service Worker for SCM Labs Website
 * 오프라인 지원 및 캐싱 전략
 */

const CACHE_NAME = 'scm-expert-v1';
const STATIC_CACHE = 'scm-expert-static-v1';
const DYNAMIC_CACHE = 'scm-expert-dynamic-v1';

// 정적 리소스 (항상 캐시)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/scm-basic.html',
    '/career-consulting.html',
    '/privacy-policy.html',
    '/css/design-system.css',
    '/js/enhanced.js',
    '/js/mobile-enhancements.js',
    '/js/testimonials.js',
    '/images/favicon.ico'
];

// 설치 이벤트 - 정적 리소스 캐싱
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// 활성화 이벤트 - 오래된 캐시 정리
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                    .map((name) => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch 이벤트 - 캐시 우선 전략
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // API 요청은 네트워크 우선
    if (url.pathname.startsWith('/api-php/')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // HTML 페이지는 네트워크 우선, 실패 시 캐시
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // 정적 리소스는 캐시 우선
    event.respondWith(cacheFirst(request));
});

// 캐시 우선 전략
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // 오프라인 폴백
        return new Response('오프라인 상태입니다.', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// 네트워크 우선 전략
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // HTML 요청에 대한 오프라인 페이지
        if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html');
        }

        return new Response('오프라인 상태입니다.', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}
