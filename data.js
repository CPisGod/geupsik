// 공통 데이터 레이어: 월별 급식 조회 / 캐시 / 메뉴 이름 정규화 / 즐겨찾기 저장

const NEIS_BASE = 'https://open.neis.go.kr/hub/mealServiceDietInfo';
const NEIS_KEY = 'e4cb6775010b4c58b15ffe9dc61ca903';
const NEIS_OFFICE = 'N10';
const NEIS_SCHOOL = '8140038';
const MEAL_NAMES = { '1': '조식', '2': '중식', '3': '석식' };
const MONTH_CACHE_MS = 6 * 60 * 60 * 1000; // 6시간

// localStorage 안전 래퍼 (시크릿 모드 등에서 예외 방지)
const store = {
    get(key, fallback) {
        try {
            const v = localStorage.getItem(key);
            return v === null ? fallback : JSON.parse(v);
        } catch (e) { return fallback; }
    },
    set(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 무시 */ }
    }
};

// 메뉴 한 줄 → 이름만 (알레르기 번호 제거)
function cleanMenuName(raw) {
    return raw.replace(/\([^)]*\)/g, '').replace(/&amp;/g, '&').trim();
}

// 한 끼 row → 메뉴 이름 배열
function menuNamesOf(row) {
    if (!row || !row.DDISH_NM) return [];
    return row.DDISH_NM.split('<br/>').map(cleanMenuName).filter(Boolean);
}

// "631.2 Kcal" → 631.2
function parseCalories(calInfo) {
    const m = calInfo && String(calInfo).match(/[\d.]+/);
    return m ? parseFloat(m[0]) : null;
}

// "탄수화물(g) : 94.3<br/>단백질(g) : 24.4<br/>지방(g) : 17.2" → {carb, protein, fat}
function parseNutrients(ntrInfo) {
    const out = {};
    if (!ntrInfo) return out;
    ntrInfo.split('<br/>').forEach(line => {
        const m = line.match(/^\s*([^(:]+)\([^)]*\)\s*:\s*([\d.]+)/);
        if (!m) return;
        const name = m[1].trim(), val = parseFloat(m[2]);
        if (name === '탄수화물') out.carb = val;
        else if (name === '단백질') out.protein = val;
        else if (name === '지방') out.fat = val;
    });
    return out;
}

// 특정 월의 급식 전체 조회 → { 'YYYYMMDD': { '1': row, '2': row, '3': row } }
const _monthMemo = {};
async function fetchMonthMeals(year, month /* 0-based */) {
    const ym = `${year}${String(month + 1).padStart(2, '0')}`;
    if (_monthMemo[ym]) return _monthMemo[ym];

    const cacheKey = `meals-${ym}`;
    const cached = store.get(cacheKey, null);
    if (cached && Date.now() - cached.t < MONTH_CACHE_MS) {
        return (_monthMemo[ym] = cached.data);
    }

    const last = new Date(year, month + 1, 0).getDate();
    const results = await Promise.all(['1', '2', '3'].map(async type => {
        const params = new URLSearchParams({
            KEY: NEIS_KEY, Type: 'json', pIndex: '1', pSize: '100',
            ATPT_OFCDC_SC_CODE: NEIS_OFFICE, SD_SCHUL_CODE: NEIS_SCHOOL,
            MMEAL_SC_CODE: type,
            MLSV_FROM_YMD: `${ym}01`, MLSV_TO_YMD: `${ym}${String(last).padStart(2, '0')}`
        });
        try {
            const res = await fetch(`${NEIS_BASE}?${params}`);
            const json = await res.json();
            const info = json.mealServiceDietInfo;
            return info && info[1] && info[1].row ? info[1].row : [];
        } catch (e) {
            return null; // 네트워크 실패
        }
    }));

    const failed = results.some(r => r === null);
    const byDate = {};
    results.forEach(rows => (rows || []).forEach(row => {
        (byDate[row.MLSV_YMD] = byDate[row.MLSV_YMD] || {})[row.MMEAL_SC_CODE] = row;
    }));

    // 일부라도 실패하면 오래된 캐시를 대신 사용 (오프라인 대응)
    if (failed) {
        if (cached) return (_monthMemo[ym] = cached.data);
        return byDate; // 캐시하지 않음
    }
    _monthMemo[ym] = byDate;
    store.set(cacheKey, { t: Date.now(), data: byDate });
    return byDate;
}

// ── 즐겨찾기 메뉴 ──
function getFavorites() { return store.get('favorites', []); }
function isFavorite(name) { return getFavorites().includes(name); }
function toggleFavorite(name) {
    const favs = getFavorites();
    const i = favs.indexOf(name);
    if (i >= 0) favs.splice(i, 1); else favs.push(name);
    store.set('favorites', favs);
    syncPrefsToSW();
    return i < 0;
}
// 메뉴 이름 배열 중 즐겨찾기에 해당하는 것
function favoritesIn(names) {
    const favs = getFavorites();
    return names.filter(n => favs.includes(n));
}

// 서비스워커는 localStorage를 읽을 수 없으므로 Cache Storage에 사본을 둠
async function syncPrefsToSW() {
    try {
        if (!('caches' in window)) return;
        const cache = await caches.open('geupsik-prefs');
        await cache.put('prefs.json', new Response(JSON.stringify({
            favorites: getFavorites(),
            notifyOn: store.get('notifyOn', false)
        })));
    } catch (e) { /* 무시 */ }
}
