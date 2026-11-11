// 테마 관리: auto / light / dark / mint / sunset
const THEMES = [
    { id: 'auto', label: '자동', emoji: '🌓' },
    { id: 'light', label: '라벤더', emoji: '💜' },
    { id: 'dark', label: '다크', emoji: '🌙' },
    { id: 'mint', label: '민트', emoji: '🌿' },
    { id: 'sunset', label: '노을', emoji: '🌇' }
];
const THEME_COLORS = { light: '#e8d5e0', dark: '#1e1b26', mint: '#d4ebe0', sunset: '#f6dcc8' };

function resolveTheme(id) {
    if (id === 'auto') {
        const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return dark ? 'dark' : 'light';
    }
    return THEME_COLORS[id] ? id : 'light';
}

function applyTheme(id) {
    const theme = resolveTheme(id);
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[theme]);
}

function setTheme(id) {
    store.set('theme', id);
    applyTheme(id);
    renderThemePicker();
}

function renderThemePicker() {
    const el = document.getElementById('themePicker');
    if (!el) return;
    const cur = store.get('theme', 'auto');
    el.innerHTML = THEMES.map(t =>
        `<button class="theme-chip${t.id === cur ? ' selected' : ''}" onclick="setTheme('${t.id}')">${t.emoji} ${t.label}</button>`
    ).join('');
}

// 깜빡임 방지를 위해 가능한 한 빨리 적용
applyTheme(store.get('theme', 'auto'));
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (store.get('theme', 'auto') === 'auto') applyTheme('auto');
    });
}
