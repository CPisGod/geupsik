// 의견함 관련 함수들
// GitHub 리포지토리 정보 (본인의 정보로 수정하세요!)
const GITHUB_USERNAME = 'cpisgod';  // 여기에 본인의 GitHub 사용자명 입력
const GITHUB_REPO = 'cpisgod.github.io';  // 여기에 리포지토리 이름 입력

// 의견 제출
function submitFeedback() {
    const feedbackText = document.getElementById('feedbackText').value.trim();
    
    if (!feedbackText) {
        alert('의견을 작성해주세요.');
        return;
    }
    
    // GitHub Issues 생성 페이지로 이동
    const issueTitle = encodeURIComponent('급식 의견');
    const issueBody = encodeURIComponent(
        `## 제출 내용\n\n${feedbackText}\n\n---\n제출 시간: ${new Date().toLocaleString('ko-KR')}`
    );
    
    const githubUrl = `https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}/issues/new?title=${issueTitle}&body=${issueBody}`;
    
    // 새 창으로 GitHub Issues 페이지 열기
    window.open(githubUrl, '_blank');
    
    // 입력창 초기화
    document.getElementById('feedbackText').value = '';
    
    alert('GitHub Issues 페이지가 열립니다.\n의견을 확인하고 "Submit new issue" 버튼을 눌러주세요!');
}

// 관리자 의견 보기 (admin.html 페이지로 이동)
function viewFeedbacks() {
    const password = document.getElementById('adminPassword').value;
    const ADMIN_PASSWORD = 'admin';
    
    if (password !== ADMIN_PASSWORD) {
        alert('비밀번호가 올바르지 않습니다.');
        return;
    }
    
    // admin.html 페이지로 이동
    window.location.href = 'admin.html';
}

// 특정 의견 삭제 (GitHub에서 직접 삭제)
function deleteFeedback(id) {
    alert('GitHub Issues 페이지에서 직접 삭제할 수 있습니다.');
}

// 모든 의견 삭제 (GitHub에서 직접 삭제)
function clearAllFeedbacks() {
    alert('GitHub Issues 페이지에서 각 의견을 직접 닫거나 삭제할 수 있습니다.');
}

