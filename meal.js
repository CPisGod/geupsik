// 급식화면 관련 변수
let currentDate = new Date();
let selectedDate = new Date();

// 캐시 관련 상수
const CACHE_KEY = 'meal_data_cache';
const CACHE_VERSION_KEY = 'meal_cache_version';
const CACHE_WEEK_KEY = 'meal_cache_week';

// 현재 주의 월요일 00:00:00 구하기
function getThisWeekMonday() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // 일요일이면 -6, 아니면 월요일로
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

// 날짜가 현재 주에 속하는지 확인
function isDateInCurrentWeek(date) {
    const monday = getThisWeekMonday();
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return date >= monday && date <= sunday;
}

// 캐시에서 데이터 가져오기
function getCachedData(date) {
    try {
        const cachedWeek = localStorage.getItem(CACHE_WEEK_KEY);
        const currentWeek = getThisWeekMonday().getTime().toString();
        
        // 주가 바뀌었으면 캐시 무효화
        if (cachedWeek !== currentWeek) {
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(CACHE_WEEK_KEY);
            return null;
        }
        
        const cache = localStorage.getItem(CACHE_KEY);
        if (!cache) return null;
        
        const cacheData = JSON.parse(cache);
        const dateKey = formatDateForAPI(date);
        
        return cacheData[dateKey] || null;
    } catch (error) {
        console.error('캐시 읽기 오류:', error);
        return null;
    }
}

// 캐시에 데이터 저장
function setCachedData(date, data) {
    try {
        const cache = localStorage.getItem(CACHE_KEY);
        const cacheData = cache ? JSON.parse(cache) : {};
        const dateKey = formatDateForAPI(date);
        
        cacheData[dateKey] = data;
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        
        // 현재 주 정보 저장
        const currentWeek = getThisWeekMonday().getTime().toString();
        localStorage.setItem(CACHE_WEEK_KEY, currentWeek);
    } catch (error) {
        console.error('캐시 저장 오류:', error);
    }
}

// 일주일치 데이터 미리 로드
async function preloadWeekData() {
    const monday = getThisWeekMonday();
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        
        // 이미 캐시에 있으면 스킵
        if (getCachedData(date)) continue;
        
        // API에서 데이터 가져오기
        const data = await fetchMealDataFromAPI(date);
        if (data) {
            setCachedData(date, data);
        }
        
        // API 부하 방지를 위한 딜레이
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

// API에서 급식 데이터 가져오기 (실제 API 호출)
async function fetchMealDataFromAPI(date) {
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

// 급식 데이터 가져오기 (캐시 우선)
async function fetchMealData(date) {
    // 현재 주에 속하면 캐시 확인
    if (isDateInCurrentWeek(date)) {
        const cached = getCachedData(date);
        if (cached) {
            console.log('캐시에서 데이터 로드:', formatDateForAPI(date));
            return cached;
        }
    }
    
    // 캐시에 없거나 범위 밖이면 API 호출
    console.log('API에서 데이터 로드:', formatDateForAPI(date));
    const data = await fetchMealDataFromAPI(date);
    
    // 현재 주 데이터면 캐시에 저장
    if (data && isDateInCurrentWeek(date)) {
        setCachedData(date, data);
    }
    
    return data;
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
                    html += `<div class="meal-item">
                        <span class="menu-name">${item.name}</span>`;
                    if (item.allergy) {
                        html += ` <span class="allergy-info">(${item.allergy})</span>`;
                    }
                    html += `</div>`;
                });
                
                // 칼로리 정보 표시 (숫자가 있을 때만)
                if (calories) {
                    html += `<div class="calorie-info">🔥 칼로리: ${calories} Kcal</div>`;
                }
                
                container.innerHTML = html;
            }
        });
    }
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
    const mealData = await fetchMealData(currentDate);
    displayMealInfo(mealData);
}

// 페이지 로드 시 일주일치 데이터 미리 로드
window.addEventListener('load', () => {
    // 백그라운드에서 일주일치 데이터 로드
    setTimeout(() => {
        preloadWeekData().then(() => {
            console.log('일주일치 급식 데이터 캐싱 완료');
        });
    }, 1000); // 1초 후에 백그라운드에서 실행
});

