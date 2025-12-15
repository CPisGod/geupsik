// 의견함 관련 함수들
const ADMIN_PASSWORD = 'admin';
const FEEDBACK_STORAGE_KEY = 'meal_feedbacks';

// 의견 제출
function submitFeedback() {
    const feedbackText = document.getElementById('feedbackText').value.trim();
    
    if (!feedbackText) {
        alert('의견을 작성해주세요.');
        return;
    }
    
    // 기존 의견 가져오기
    const feedbacks = getFeedbacks();
    
    // 새 의견 추가
    const newFeedback = {
        id: Date.now(),
        text: feedbackText,
        date: new Date().toLocaleString('ko-KR')
    };
    
    feedbacks.push(newFeedback);
    
    // localStorage에 저장
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbacks));
    
    // 입력창 초기화
    document.getElementById('feedbackText').value = '';
    
    alert('의견이 제출되었습니다. 감사합니다!');
}

// 저장된 의견 가져오기
function getFeedbacks() {
    const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// 관리자 의견 보기
function viewFeedbacks() {
    const password = document.getElementById('adminPassword').value;
    
    if (password !== ADMIN_PASSWORD) {
        alert('비밀번호가 올바르지 않습니다.');
        return;
    }
    
    const feedbacks = getFeedbacks();
    const feedbackList = document.getElementById('feedbackList');
    const feedbackItems = document.getElementById('feedbackItems');
    
    if (feedbacks.length === 0) {
        feedbackItems.innerHTML = '<div class="no-feedback">아직 제출된 의견이 없습니다.</div>';
    } else {
        let html = '';
        feedbacks.reverse().forEach(feedback => {
            html += `
                <div class="feedback-item">
                    <div class="feedback-date">${feedback.date}</div>
                    <div class="feedback-text">${feedback.text}</div>
                    <button class="delete-button" onclick="deleteFeedback(${feedback.id})">삭제</button>
                </div>
            `;
        });
        feedbackItems.innerHTML = html;
    }
    
    feedbackList.style.display = 'block';
}

// 특정 의견 삭제
function deleteFeedback(id) {
    if (!confirm('이 의견을 삭제하시겠습니까?')) {
        return;
    }
    
    let feedbacks = getFeedbacks();
    feedbacks = feedbacks.filter(f => f.id !== id);
    
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbacks));
    
    // 목록 새로고침
    viewFeedbacks();
}

// 모든 의견 삭제
function clearAllFeedbacks() {
    if (!confirm('모든 의견을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        return;
    }
    
    localStorage.removeItem(FEEDBACK_STORAGE_KEY);
    
    // 목록 새로고침
    viewFeedbacks();
}
