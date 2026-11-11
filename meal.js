// 급식화면 관련 변수
let currentDate = new Date();
let selectedDate = new Date();
let lastMealData = null; // 공유 기능에서 사용

// 급식 데이터 가져오기
async function fetchMealData(date) {
    const formattedDate = formatDateForAPI(date);
    const baseUrl = 'https://open.neis.go.kr/hub/mealServiceDietInfo';
    
    let allMealData = [];
    
    // 조식(1), 중식(2), 석식(3) 각각 가져오기
    const mealTypes = ['1', '2', '3'];
    
    for (const mealType of mealTypes) {
        const params = new URLSearchParams({
            Type: 'json',
            pIndex: 'e4cb6775010b4c58b15ffe9dc61ca903',
            pSize: '5',
            ATPT_OFCDC_SC_CODE: 'N10',
            SD_SCHUL_CODE: '8140038',
            MMEAL_SC_CODE: mealType,
            MLSV_YMD: formattedDate
        });
        
        try {
            const response = await fetch(`${baseUrl}?${params}`);
            const data = await response.json();
            
            if (data.mealServiceDietInfo && data.mealServiceDietInfo[1] && data.mealServiceDietInfo[1].row) {
                allMealData = allMealData.concat(data.mealServiceDietInfo[1].row);
            }
        } catch (error) {
            console.error(`${mealType}식 데이터를 가져오는데 실패했습니다:`, error);
        }
    }
    
    return allMealData.length > 0 ? allMealData : null;
}

// 알러지 정보 추출 (숫자만)
function extractAllergy(menuString) {
    const allergyMatch = menuString.match(/\(([^)]+)\)/);
    if (!allergyMatch) return '';
    
    const content = allergyMatch[1];
    // 숫자와 점(.)만 추출
    const numbers = content.match(/[\d.]+/g);
    
    return numbers ? numbers.join('.') : '';
}

// 급식 메뉴 파싱 (알레르기 정보는 별도로 표시)
function parseMenuWithAllergy(menuString) {
    if (!menuString) return [];
    
    return menuString
        .split('<br/>')
        .map(item => {
            const cleanItem = item.replace(/\([^)]*\)/g, '').trim();
            const allergy = extractAllergy(item);
            return {
                name: cleanItem,
                allergy: allergy
            };
        })
        .filter(item => item.name.length > 0);
}

// 칼로리 정보 추출 (숫자만)
function extractCalories(calInfo) {
    if (!calInfo) return null;
    
    // 숫자 부분만 추출
    const numbers = calInfo.match(/[\d.]+/);
    return numbers ? numbers[0] : null;
}

// 급식 정보 표시
function displayMealInfo(mealData) {
    const mealTypes = ['1', '2', '3'];
    
    // 모든 식사 타입을 초기화
    mealTypes.forEach(mealType => {
        const container = document.querySelector(`[data-meal-type="${mealType}"] .meal-content`);
        if (container) {
            container.innerHTML = '<div class="meal-item">급식 정보가 없습니다</div>';
        }
    });
    
    if (mealData && mealData.length > 0) {
        mealData.forEach(meal => {
            const mealTypeCode = meal.MMEAL_SC_CODE;
            const menuItems = parseMenuWithAllergy(meal.DDISH_NM);
            const calories = extractCalories(meal.CAL_INFO);
            const container = document.querySelector(`[data-meal-type="${mealTypeCode}"] .meal-content`);
            
            if (container && menuItems.length > 0) {
                let html = '';
                
                // 메뉴 항목들 표시
                menuItems.forEach(item => {
                    const fav = isFavorite(item.name);
                    html += `<div class="meal-item${fav ? ' is-fav' : ''}">
                        <button class="fav-star" title="즐겨찾기" aria-pressed="${fav}" data-name="${encodeURIComponent(item.name)}">${fav ? '⭐' : '☆'}</button>
                        <span class="menu-name">${escapeHtml(item.name)}</span>`;
                    if (item.allergy) {
                        html += ` <span class="allergy-info">(${escapeHtml(item.allergy)})</span>`;
                    }
                    html += `</div>`;
                });
                
                // 칼로리 정보 표시 (숫자가 있을 때만)
                if (calories) {
                    html += `<div class="calorie-info">🔥 칼로리: ${calories} Kcal</div>`;
                }
                
                container.innerHTML = html;
                container.querySelectorAll('.fav-star').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const on = toggleFavorite(decodeURIComponent(btn.dataset.name));
                        btn.textContent = on ? '⭐' : '☆';
                        btn.setAttribute('aria-pressed', on);
                        btn.closest('.meal-item').classList.toggle('is-fav', on);
                    });
                });
            }
        });
    }
}

// 오늘의 급식을 공유용 텍스트로 만들기
function buildShareText(date, mealData) {
    const lines = [`🍚 ${formatDateForDisplay(date)} 급식`];
    ['1', '2', '3'].forEach(code => {
        const row = (mealData || []).find(m => m.MMEAL_SC_CODE === code);
        if (!row) return;
        const cal = extractCalories(row.CAL_INFO);
        lines.push('', `[${MEAL_NAMES[code]}]${cal ? ` ${cal}Kcal` : ''}`);
        menuNamesOf(row).forEach(n => lines.push(`· ${n}`));
    });
    return lines.join('\n');
}

async function shareMeal() {
    if (!lastMealData) { showToast('공유할 급식 정보가 없어요'); return; }
    const text = buildShareText(currentDate, lastMealData);
    try {
        if (navigator.share) {
            await navigator.share({ title: '오늘의 급식', text });
            return;
        }
        await navigator.clipboard.writeText(text);
        showToast('📋 급식 정보를 복사했어요. 붙여넣어 공유하세요!');
    } catch (e) {
        if (e && e.name === 'AbortError') return; // 사용자가 공유 취소
        // 클립보드 접근 불가 시 마지막 수단
        window.prompt('아래 내용을 복사해서 공유하세요', text);
    }
}

function showToast(msg) {
    let el = document.getElementById('toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'toast';
        document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove('show'), 2500);
}

// 날짜 변경
function changeDate(days) {
    currentDate.setDate(currentDate.getDate() + days);
    updateMealScreen();
}

// 급식 화면 업데이트
async function updateMealScreen() {
    // 날짜 표시 업데이트
    document.getElementById('mealDate').textContent = formatDateForDisplay(currentDate);
    
    // 로딩 표시
    document.querySelectorAll('.meal-content').forEach(container => {
        container.innerHTML = '<div class="loading">불러오는 중...</div>';
    });
    
    // 급식 데이터 가져오기 및 표시
    const requested = currentDate.getTime();
    const mealData = await fetchMealData(currentDate);
    if (requested !== currentDate.getTime()) return; // 빠르게 날짜를 넘긴 경우 이전 응답 무시
    lastMealData = mealData;
    displayMealInfo(mealData);
}

