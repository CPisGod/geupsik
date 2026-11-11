// 설정 화면: 테마, 즐겨찾기 메뉴, 알림
function renderFavoritesList() {
    const el = document.getElementById('favList');
    if (!el) return;
    const favs = getFavorites();
    el.innerHTML = favs.length
        ? favs.map(f => `<span class="fav-chip">⭐ ${escapeHtml(f)}<button aria-label="삭제" data-fav="${encodeURIComponent(f)}">✕</button></span>`).join('')
        : '<div class="stats-sub">아직 없어요. 급식 화면에서 메뉴 옆 ☆를 눌러 추가하거나 아래에 직접 입력하세요.</div>';
    el.querySelectorAll('button[data-fav]').forEach(b => {
        b.addEventListener('click', () => { toggleFavorite(decodeURIComponent(b.dataset.fav)); renderFavoritesList(); });
    });
}

function addFavoriteFromInput() {
    const input = document.getElementById('favInput');
    const name = input.value.trim();
    if (!name) return;
    if (!isFavorite(name)) toggleFavorite(name);
    input.value = '';
    renderFavoritesList();
}

function updateNotifyStatus() {
    const el = document.getElementById('notifyStatus');
    const btn = document.getElementById('notifyBtn');
    if (!el || !btn) return;
    if (!('Notification' in window)) {
        el.textContent = '이 브라우저는 알림을 지원하지 않아요. (iPhone은 홈 화면에 설치 후 사용 가능)';
        btn.disabled = true; return;
    }
    const on = store.get('notifyOn', false) && Notification.permission === 'granted';
    btn.textContent = on ? '🔕 알림 끄기' : '🔔 알림 켜기';
    el.textContent = Notification.permission === 'denied'
        ? '브라우저 설정에서 알림이 차단되어 있어요.'
        : on ? '앱을 열 때 오늘·내일 즐겨찾기 메뉴가 있으면 알려줘요.' : '꺼져 있어요.';
}

async function toggleNotify() {
    if (store.get('notifyOn', false)) {
        store.set('notifyOn', false);
        syncPrefsToSW();
    } else {
        const perm = await Notification.requestPermission();
        store.set('notifyOn', perm === 'granted');
        syncPrefsToSW();
        if (perm === 'granted') { await checkFavoriteAlerts(true); registerPeriodicSync(); }
    }
    updateNotifyStatus();
}

// 오늘/내일 급식에 즐겨찾기 메뉴가 있는지 확인하고 알림 (하루 1회씩만)
async function checkFavoriteAlerts(force) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (!store.get('notifyOn', false)) return;
    const favs = getFavorites();
    if (!favs.length) return;

    const today = new Date();
    const notified = store.get('notified', {});
    const lines = [];
    for (const [offset, label] of [[0, '오늘'], [1, '내일']]) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
        const key = formatDateForAPI(d);
        if (notified[key] && !force) continue;
        const byDate = await fetchMonthMeals(d.getFullYear(), d.getMonth());
        const hits = new Set();
        Object.values(byDate[key] || {}).forEach(row => favoritesIn(menuNamesOf(row)).forEach(n => hits.add(n)));
        if (hits.size) { lines.push(`${label} 급식에 ${[...hits].join(', ')} 나와요! 🎉`); notified[key] = true; }
    }
    if (!lines.length) return;
    // 오래된 기록 정리
    Object.keys(notified).forEach(k => { if (k < formatDateForAPI(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3))) delete notified[k]; });
    store.set('notified', notified);

    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
    const opts = { body: lines.join('\n'), icon: 'icon-192.png', badge: 'icon-192.png', tag: 'fav-meal' };
    if (reg) reg.showNotification('⭐ 좋아하는 메뉴 등장', opts);
    else new Notification('⭐ 좋아하는 메뉴 등장', opts);
}

// 설치된 PWA(크롬 계열)에서는 앱을 열지 않아도 주기적으로 확인 (지원 시)
async function registerPeriodicSync() {
    try {
        const reg = await navigator.serviceWorker.ready;
        if (reg.periodicSync) await reg.periodicSync.register('fav-check', { minInterval: 12 * 60 * 60 * 1000 });
    } catch (e) { /* 미지원/권한 없음 */ }
}

function updateSettingsScreen() {
    renderThemePicker();
    renderFavoritesList();
    updateNotifyStatus();
    const input = document.getElementById('favInput');
    if (input && !input.dataset.bound) {
        input.dataset.bound = '1';
        input.addEventListener('keydown', e => { if (e.key === 'Enter') addFavoriteFromInput(); });
    }
}
