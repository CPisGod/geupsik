// 홈화면 관련 변수
let currentCalendarDate = new Date(); // 캘린더에서 현재 보고 있는 월

// 홈 화면 업데이트
function updateHomeScreen() {
    const today = new Date();
    document.getElementById('homeDate').textContent = formatDateForDisplay(today);
    currentCalendarDate = new Date(today); // 현재 월로 초기화
    generateCalendar(currentCalendarDate);
}

// 달 변경
function changeMonth(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    generateCalendar(currentCalendarDate);
}

// 캘린더 생성
function generateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    
    document.getElementById('calendarMonth').textContent = monthNames[month];
    document.getElementById('calendarYear').textContent = `${year}.${String(month + 1).padStart(2, '0')}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    for (let i = 0; i < 42; i++) {
        const currentDay = new Date(startDate);
        currentDay.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (currentDay.getMonth() !== month) {
            dayElement.className += ' empty';
            // 빈 칸은 아무 내용도 표시하지 않음
        } else {
            dayElement.textContent = currentDay.getDate();
            
            // 요일별 색상
            if (currentDay.getDay() === 0) {
                dayElement.className += ' sunday';
            } else if (currentDay.getDay() === 6) {
                dayElement.className += ' saturday';
            }
            
            // 오늘 날짜 표시
            if (currentDay.toDateString() === today.toDateString()) {
                dayElement.className += ' today';
            }
            
            // 클릭 이벤트
            dayElement.addEventListener('click', () => {
                showMealScreen(currentDay);
            });
        }
        
        calendarGrid.appendChild(dayElement);
    }
}
