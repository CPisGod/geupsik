// 오늘의 급식을 메신저로 보내는 봇 (Node 18+, 외부 패키지 없음)
// 환경변수:
//   NEIS_KEY, NEIS_OFFICE, NEIS_SCHOOL   (생략 시 앱과 같은 학교/키)
//   DISCORD_WEBHOOK_URL                  디스코드 웹훅
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID 텔레그램 봇
//   KAKAO_REST_API_KEY, KAKAO_REFRESH_TOKEN  카카오톡 "나에게 보내기"
//   DATE=YYYYMMDD (테스트용), DRY_RUN=1 (전송 없이 출력만)
const env = process.env;
const KEY = env.NEIS_KEY || 'e4cb6775010b4c58b15ffe9dc61ca903';
const OFFICE = env.NEIS_OFFICE || 'N10';
const SCHOOL = env.NEIS_SCHOOL || '8140038';
const NAMES = { 1: '조식', 2: '중식', 3: '석식' };

function todayKST() {
    return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
}

async function fetchMeals(ymd) {
    const params = new URLSearchParams({
        KEY, Type: 'json', pIndex: '1', pSize: '10',
        ATPT_OFCDC_SC_CODE: OFFICE, SD_SCHUL_CODE: SCHOOL, MLSV_YMD: ymd
    });
    const res = await fetch(`https://open.neis.go.kr/hub/mealServiceDietInfo?${params}`);
    if (!res.ok) throw new Error(`NEIS HTTP ${res.status}`);
    const json = await res.json();
    const info = json.mealServiceDietInfo;
    return info && info[1] && info[1].row ? info[1].row : [];
}

export function buildMessage(ymd, rows) {
    const date = `${ymd.slice(0, 4)}.${ymd.slice(4, 6)}.${ymd.slice(6)}`;
    const lines = [`🍚 ${date} 오늘의 급식`];
    [...rows].sort((a, b) => a.MMEAL_SC_CODE - b.MMEAL_SC_CODE).forEach(r => {
        const cal = (r.CAL_INFO || '').match(/[\d.]+/);
        lines.push('', `[${NAMES[r.MMEAL_SC_CODE] || '급식'}]${cal ? ` ${cal[0]}Kcal` : ''}`);
        r.DDISH_NM.split('<br/>').map(s => s.replace(/\([^)]*\)/g, '').trim()).filter(Boolean)
            .forEach(n => lines.push(`· ${n}`));
    });
    return lines.join('\n');
}

async function post(url, body, headers = { 'Content-Type': 'application/json' }) {
    const res = await fetch(url, { method: 'POST', headers, body });
    if (!res.ok) throw new Error(`${new URL(url).hostname} HTTP ${res.status}: ${await res.text()}`);
    return res;
}

const senders = {
    discord: () => env.DISCORD_WEBHOOK_URL && (msg =>
        post(env.DISCORD_WEBHOOK_URL, JSON.stringify({ content: msg }))),
    telegram: () => env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID && (msg =>
        post(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
            JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: msg }))),
    kakao: () => env.KAKAO_REST_API_KEY && env.KAKAO_REFRESH_TOKEN && (async msg => {
        const tokenRes = await post('https://kauth.kakao.com/oauth/token',
            new URLSearchParams({ grant_type: 'refresh_token', client_id: env.KAKAO_REST_API_KEY, refresh_token: env.KAKAO_REFRESH_TOKEN }),
            { 'Content-Type': 'application/x-www-form-urlencoded' });
        const { access_token } = await tokenRes.json();
        const template = { object_type: 'text', text: msg.slice(0, 200), link: { web_url: env.APP_URL || 'https://kakao.com', mobile_web_url: env.APP_URL || 'https://kakao.com' } };
        await post('https://kapi.kakao.com/v2/api/talk/memo/default/send',
            new URLSearchParams({ template_object: JSON.stringify(template) }),
            { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Bearer ${access_token}` });
    })
};

async function main() {
    const ymd = env.DATE || todayKST();
    const rows = await fetchMeals(ymd);
    if (!rows.length) { console.log(`${ymd}: 급식 정보가 없어 전송하지 않습니다 (주말/방학/휴일).`); return; }
    const msg = buildMessage(ymd, rows);
    console.log(msg);
    if (env.DRY_RUN) { console.log('\n(DRY_RUN: 전송하지 않음)'); return; }

    const active = Object.entries(senders).map(([n, f]) => [n, f()]).filter(([, s]) => s);
    if (!active.length) throw new Error('전송 대상이 없습니다. DISCORD_WEBHOOK_URL / TELEGRAM_* / KAKAO_* 중 하나를 설정하세요.');
    let failed = 0;
    for (const [name, send] of active) {
        try { await send(msg); console.log(`✅ ${name} 전송 완료`); }
        catch (e) { failed++; console.error(`❌ ${name} 전송 실패:`, e.message); }
    }
    if (failed) process.exitCode = 1;
}

import { fileURLToPath } from 'node:url';
if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch(e => { console.error(e); process.exit(1); });
