// 급식 통계 화면: 평균 칼로리, 자주 나온 메뉴 TOP 5, 영양소 비율 도넛
let statsDate = new Date();

function changeStatsMonth(delta) {
    statsDate = new Date(statsDate.getFullYear(), statsDate.getMonth() + delta, 1);
    updateStatsScreen();
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// 월 데이터 → 통계 계산 (순수 함수: 테스트하기 쉽게 분리)
function computeStats(byDate) {
    const days = Object.keys(byDate);
    const counts = {};
    let calSum = 0, calN = 0;
    const nut = { carb: 0, protein: 0, fat: 0 };
    let nutN = 0;

    days.forEach(d => {
        Object.values(byDate[d]).forEach(row => {
            // 메뉴 빈도 (같은 날 중복 집계 방지 위해 끼니별 1회씩)
            new Set(menuNamesOf(row)).forEach(n => { counts[n] = (counts[n] || 0) + 1; });
            const cal = parseCalories(row.CAL_INFO);
            if (cal) { calSum += cal; calN++; }
            const n = parseNutrients(row.NTR_INFO);
            if (n.carb != null && n.protein != null && n.fat != null) {
                nut.carb += n.carb; nut.protein += n.protein; nut.fat += n.fat; nutN++;
            }
        });
    });

    const top = Object.entries(counts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'))
        .slice(0, 5);

    return {
        dayCount: days.length,
        avgCal: calN ? calSum / calN : null,
        top,
        nutrients: nutN ? nut : null
    };
}

// 탄·단·지 열량 비율 (4/4/9 kcal) 도넛 SVG
function donutSvg(nut) {
    const kc = { carb: nut.carb * 4, protein: nut.protein * 4, fat: nut.fat * 9 };
    const total = kc.carb + kc.protein + kc.fat;
    const parts = [
        { key: 'carb', label: '탄수화물', color: '#f4a261' },
        { key: 'protein', label: '단백질', color: '#e76f51' },
        { key: 'fat', label: '지방', color: '#2a9d8f' }
    ];
    const r = 40, c = 2 * Math.PI * r;
    let offset = 0;
    const arcs = parts.map(p => {
        const frac = kc[p.key] / total;
        const len = frac * c;
        const svg = `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${p.color}" stroke-width="20"
            stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 60 60)"/>`;
        offset += len;
        return svg;
    }).join('');
    const legend = parts.map(p =>
        `<li><span class="dot" style="background:${p.color}"></span>${p.label} <b>${Math.round(kc[p.key] / total * 100)}%</b></li>`
    ).join('');
    return `<div class="donut-wrap">
        <svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="영양소 열량 비율">${arcs}</svg>
        <ul class="donut-legend">${legend}</ul></div>`;
}

async function updateStatsScreen() {
    const y = statsDate.getFullYear(), m = statsDate.getMonth();
    document.getElementById('statsMonth').textContent = `${y}.${String(m + 1).padStart(2, '0')}`;
    const body = document.getElementById('statsBody');
    body.innerHTML = '<div class="loading">통계를 계산하는 중...</div>';

    const byDate = await fetchMonthMeals(y, m);
    const s = computeStats(byDate);
    if (s.dayCount === 0) {
        body.innerHTML = '<div class="stats-card"><div class="meal-item">이 달의 급식 데이터가 없습니다</div></div>';
        return;
    }

    const max = s.top.length ? s.top[0][1] : 1;
    const topHtml = s.top.map(([name, n], i) =>
        `<li><span class="rank">${i + 1}</span><span class="top-name">${escapeHtml(name)}</span>
        <span class="bar"><i style="width:${Math.max(8, n / max * 100)}%"></i></span><span class="top-n">${n}회</span></li>`
    ).join('');

    body.innerHTML = `
        <div class="stats-card">
            <h3>🔥 평균 칼로리</h3>
            <div class="big-number">${s.avgCal ? Math.round(s.avgCal) : '-'}<small> Kcal / 끼</small></div>
            <div class="stats-sub">급식이 나온 ${s.dayCount}일 기준</div>
        </div>
        <div class="stats-card">
            <h3>🏆 자주 나온 메뉴 TOP 5</h3>
            <ol class="top-list">${topHtml}</ol>
        </div>
        <div class="stats-card">
            <h3>🥗 영양소 비율</h3>
            ${s.nutrients ? donutSvg(s.nutrients) : '<div class="meal-item">영양 정보가 없습니다</div>'}
        </div>`;
}
