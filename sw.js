// 급식 앱 서비스워커: 앱 셸 캐시 + 급식 API 네트워크 우선(오프라인 시 캐시) + 즐겨찾기 백그라운드 알림
const VERSION = 'v1';
const SHELL_CACHE = `geupsik-shell-${VERSION}`;
const API_CACHE = 'geupsik-api';
const SHELL = [
    './', 'index.html', 'styles.css', 'manifest.json',
    'app.js', 'data.js', 'theme.js', 'home.js', 'meal.js', 'stats.js', 'settings.js', 'feedback.js',
    'icon-192.png', 'icon-512.png', 'icon.png'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(SHELL_CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k.startsWith('geupsik-shell-') && k !== SHELL_CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);

    // 급식 API: 네트워크 우선, 실패하면 마지막으로 받은 응답
    if (url.hostname === 'open.neis.go.kr') {
        e.respondWith(
            fetch(req).then(res => {
                if (res.ok) { const copy = res.clone(); caches.open(API_CACHE).then(c => c.put(req, copy)); }
                return res;
            }).catch(() => caches.match(req, { cacheName: API_CACHE }).then(r => r || Response.error()))
        );
        return;
    }

    // 같은 출처 정적 파일: 캐시 우선 + 백그라운드 갱신 (stale-while-revalidate)
    if (url.origin === self.location.origin) {
        e.respondWith(
            caches.match(req).then(cached => {
                const network = fetch(req).then(res => {
                    if (res.ok) { const copy = res.clone(); caches.open(SHELL_CACHE).then(c => c.put(req, copy)); }
                    return res;
                }).catch(() => cached);
                return cached || network;
            })
        );
    }
});

// 알림 클릭 → 앱 열기
self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(self.clients.matchAll({ type: 'window' }).then(list => {
        if (list.length) return list[0].focus();
        return self.clients.openWindow('./');
    }));
});

// 설치된 PWA(크롬 계열)에서 앱을 열지 않아도 주기적으로 즐겨찾기 메뉴 확인
self.addEventListener('periodicsync', e => {
    if (e.tag === 'fav-check') e.waitUntil(checkFavoritesInBackground());
});

async function checkFavoritesInBackground() {
    const prefsRes = await (await caches.open('geupsik-prefs')).match('prefs.json');
    if (!prefsRes) return;
    const { favorites = [], notifyOn } = await prefsRes.json();
    if (!notifyOn || !favorites.length) return;

    const d = new Date(Date.now() + 9 * 3600 * 1000); // KST 기준 오늘
    const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
    const params = new URLSearchParams({
        KEY: 'e4cb6775010b4c58b15ffe9dc61ca903', Type: 'json', pIndex: '1', pSize: '100',
        ATPT_OFCDC_SC_CODE: 'N10', SD_SCHUL_CODE: '8140038', MLSV_YMD: ymd
    });
    const json = await (await fetch(`https://open.neis.go.kr/hub/mealServiceDietInfo?${params}`)).json();
    const rows = (json.mealServiceDietInfo && json.mealServiceDietInfo[1] && json.mealServiceDietInfo[1].row) || [];
    const hits = new Set();
    rows.forEach(r => (r.DDISH_NM || '').split('<br/>').forEach(item => {
        const name = item.replace(/\([^)]*\)/g, '').trim();
        if (favorites.includes(name)) hits.add(name);
    }));
    if (!hits.size) return;

    const notified = await caches.open('geupsik-prefs');
    if (await notified.match(`notified-${ymd}`)) return; // 하루 한 번만
    await notified.put(`notified-${ymd}`, new Response('1'));
    await self.registration.showNotification('⭐ 좋아하는 메뉴 등장', {
        body: `오늘 급식에 ${[...hits].join(', ')} 나와요! 🎉`,
        icon: 'icon-192.png', badge: 'icon-192.png', tag: 'fav-meal'
    });
}
