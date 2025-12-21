# GitHub Issues 의견함 사용 가이드

## 📌 설정 방법

### 1단계: GitHub 리포지토리 설정

1. **GitHub 웹사이트 접속**
   - https://github.com 로그인

2. **본인의 리포지토리로 이동**
   - 예: `https://github.com/cpisgod/cpisgod.github.io`

3. **Issues 기능 활성화 확인**
   - 상단 탭에서 **"Issues"** 탭이 보이는지 확인
   - 안 보이면:
     - **Settings** 클릭
     - **Features** 섹션 찾기
     - **"Issues"** 체크박스 활성화 ✅

### 2단계: 코드 수정

**feedback.js 파일 수정:**

파일 상단의 다음 부분을 본인의 정보로 수정하세요:

```javascript
// GitHub 리포지토리 정보 (본인의 정보로 수정하세요!)
const GITHUB_USERNAME = 'cpisgod';  // ← 여기에 본인의 GitHub 사용자명
const GITHUB_REPO = 'cpisgod.github.io';  // ← 여기에 리포지토리 이름
```

**예시:**
- GitHub 주소가 `https://github.com/john/my-meal-app` 이라면
  - `GITHUB_USERNAME = 'john'`
  - `GITHUB_REPO = 'my-meal-app'`

### 3단계: 파일 업로드

수정된 파일들을 GitHub 리포지토리에 업로드:
- `feedback.js`
- `index.html`
- `styles.css`

## 🎯 사용 방법

### 일반 사용자 (의견 제출)

1. **의견함 탭 클릭** (💬 버튼)
2. **의견 작성** (텍스트 입력)
3. **"GitHub Issues로 제출" 버튼 클릭**
4. **새 창이 열림** → GitHub Issues 생성 페이지
5. **GitHub 로그인** (안 되어 있다면)
6. **내용 확인** 후 **"Submit new issue"** 버튼 클릭
7. **완료!** 의견이 제출됩니다

### 관리자 (의견 확인)

1. **의견함 탭 클릭** (💬 버튼)
2. **관리자 전용 섹션**에서 비밀번호 입력: `admin`
3. **"GitHub에서 의견 보기" 버튼 클릭**
4. **새 창이 열림** → GitHub Issues 목록 페이지
5. **모든 의견 확인** 가능
6. **개별 의견 클릭**하여 자세히 보기
7. **댓글 달기, 닫기, 삭제** 가능

## 📋 GitHub Issues 관리

### 의견 확인하기
- GitHub 리포지토리 → **Issues** 탭
- 제목이 "급식 의견"인 이슈들이 모든 의견

### 의견 응답하기
- 이슈 클릭 → 댓글 작성 → **Comment** 버튼

### 의견 완료 처리
- 이슈 하단 → **Close issue** 버튼
- 완료된 의견은 "Closed" 상태로 표시

### 의견 삭제하기
- 이슈 클릭 → 우측 하단 **Delete issue** (빨간색 영역)
- ⚠️ 삭제는 되돌릴 수 없습니다

### 라벨 추가하기
이슈를 분류하기 위해 라벨 사용 가능:
- 우측 **Labels** → 라벨 선택
- 예: `건의사항`, `버그`, `칭찬`, `기타`

## ✅ 장점

1. **영구 저장**: 브라우저 데이터 삭제해도 의견 유지
2. **알림 기능**: 새 의견 등록 시 이메일 알림 받을 수 있음
3. **댓글 기능**: 의견에 대해 답변 가능
4. **검색 기능**: 키워드로 의견 검색 가능
5. **무료**: GitHub Issues 완전 무료

## ⚠️ 주의사항

1. **리포지토리 공개**: Issues를 사용하려면 리포지토리가 Public이어야 합니다
2. **GitHub 계정 필요**: 의견 제출자가 GitHub 계정이 필요합니다
3. **공개 의견**: 모든 의견이 공개됩니다 (누구나 볼 수 있음)

## 🔒 비공개 의견이 필요하다면?

GitHub Issues는 공개되므로, 비공개 의견이 필요하면:
1. **Private 리포지토리** 사용 (협업자만 볼 수 있음)
2. **Google Forms** 연동 (완전 비공개)
3. **Firebase** 사용 (별도 데이터베이스)

## 💡 팁

### 이메일 알림 받기
1. GitHub 리포지토리 → **Watch** 버튼 클릭
2. **Custom** → **Issues** 체크
3. 새 의견이 등록되면 이메일로 알림 받음

### 이슈 템플릿 만들기
의견 양식을 통일하려면:
1. 리포지토리에 `.github/ISSUE_TEMPLATE/feedback.md` 파일 생성
2. 템플릿 작성
3. 사용자가 의견 제출 시 자동으로 양식 제공

### 모바일에서도 사용 가능
- GitHub 모바일 앱 설치
- 앱에서도 의견 확인 및 답변 가능

## 🆘 문제 해결

**Q: Issues 탭이 안 보여요**
A: Settings → Features → Issues 체크박스 활성화

**Q: "Submit new issue" 버튼이 안 눌려요**
A: GitHub 로그인 필요 (계정이 없으면 가입 필요)

**Q: 의견이 제출되지 않아요**
A: feedback.js의 GITHUB_USERNAME과 GITHUB_REPO가 정확한지 확인

**Q: 관리자 비밀번호를 바꾸고 싶어요**
A: feedback.js 파일에서 `const ADMIN_PASSWORD = 'admin';` 부분을 원하는 비밀번호로 변경

## 📞 추가 도움

GitHub Issues 사용법:
- https://docs.github.com/ko/issues

문의사항이 있으면 GitHub Issues로 질문해주세요! 😊
