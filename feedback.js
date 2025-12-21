// 의견함 관련 함수들 - Google Forms 사용

// ⚠️ 중요: Google Forms URL을 본인의 것으로 변경하세요!
// Google Forms 만드는 방법: Google_Forms_설정가이드.md 참고
const GOOGLE_FORM_URL = 'https://forms.gle/YOUR_FORM_ID';  // ← 여기를 본인의 Google Forms URL로 변경!

// 의견 제출 - Google Forms 페이지로 이동
function submitFeedback() {
    const feedbackText = document.getElementById('feedbackText').value.trim();
    
    if (!feedbackText) {
        alert('의견을 작성해주세요.');
        return;
    }
    
    // Google Forms URL 확인
    if (GOOGLE_FORM_URL === 'https://forms.gle/YOUR_FORM_ID') {
        alert('⚠️ Google Forms URL이 설정되지 않았습니다.\n\nfeedback.js 파일에서 GOOGLE_FORM_URL을 본인의 Google Forms 링크로 변경해주세요.\n\n자세한 방법은 Google_Forms_설정가이드.md를 참고하세요.');
        return;
    }
    
    // Google Forms 페이지 열기
    window.open(GOOGLE_FORM_URL, '_blank');
    
    // 안내 메시지
    alert('Google Forms 페이지가 열립니다.\n\n열린 페이지에서 의견을 입력하고 제출해주세요! 😊');
    
    // 입력창 초기화
    document.getElementById('feedbackText').value = '';
}

// 관리자 의견 보기 - Google Sheets 안내
function viewFeedbacks() {
    const password = document.getElementById('adminPassword').value;
    const ADMIN_PASSWORD = 'admin';
    
    if (password !== ADMIN_PASSWORD) {
        alert('비밀번호가 올바르지 않습니다.');
        return;
    }
    
    alert('✅ 인증되었습니다!\n\n의견 확인 방법:\n\n1. https://sheets.google.com 접속\n2. "급식 의견함 응답" 스프레드시트 열기\n3. 모든 의견 확인 가능\n\n💡 팁: Google Forms에서 요약 통계도 확인할 수 있습니다.');
    
    // Google Sheets 홈으로 이동
    window.open('https://sheets.google.com', '_blank');
}

// 특정 의견 삭제 안내
function deleteFeedback(id) {
    alert('Google Sheets에서 해당 행을 직접 삭제할 수 있습니다.');
}

// 모든 의견 삭제 안내
function clearAllFeedbacks() {
    alert('Google Sheets에서 모든 행을 선택하여 삭제할 수 있습니다.');
}

