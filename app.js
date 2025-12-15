// 공통 유틸리티 함수들

// 날짜를 YYYYMMDD 형식으로 변환
function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// 날짜를 YYYY.MM.DD 형식으로 변환
function formatDateForDisplay(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

// 화면 전환 함수들

// 모든 화면 숨기기
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
}

// 플로팅 버튼 활성화 상태 업데이트
function updateFloatingButtons(activeIndex) {
    document.querySelectorAll('.floating-button').forEach((button, index) => {
        if (index === activeIndex) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

// 오늘의 급식 화면 표시
function showTodayMeal() {
    hideAllScreens();
    updateFloatingButtons(0);
    document.getElementById('mealScreen').style.display = 'block';
    currentDate = new Date();
    updateMealScreen();
}

// 달력 화면 표시
function showCalendarScreen() {
    hideAllScreens();
    updateFloatingButtons(1);
    document.getElementById('homeScreen').style.display = 'block';
    updateHomeScreen();
}

// 의견함 화면 표시
function showFeedbackScreen() {
    hideAllScreens();
    updateFloatingButtons(2);
    document.getElementById('feedbackScreen').style.display = 'block';
    // 의견함으로 전환 시 비밀번호 입력창과 목록 초기화
    document.getElementById('adminPassword').value = '';
    document.getElementById('feedbackList').style.display = 'none';
}

// 홈 화면 표시 (달력 화면)
function showHomeScreen() {
    showCalendarScreen();
}

// 급식 화면 표시 (특정 날짜)
function showMealScreen(date) {
    selectedDate = new Date(date);
    hideAllScreens();
    updateFloatingButtons(0);
    document.getElementById('mealScreen').style.display = 'block';
    currentDate = new Date(selectedDate);
    updateMealScreen();
}

// 캘린더 (급식) 화면 표시
function showCalendar() {
    // 이 함수는 더 이상 사용하지 않지만 호환성을 위해 유지
    updateHomeScreen();
}

// 초기 로드 - 오늘의 급식을 먼저 표시
window.addEventListener('load', () => {
    showTodayMeal();
});
