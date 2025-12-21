# GitHub Actions 의견함 설정 가이드

## 📋 개요

사용자가 의견을 제출하면:
1. GitHub Issue가 자동 생성됨
2. GitHub Actions가 Issue 내용을 `feedbacks.json`에 자동 저장
3. Issue는 자동으로 닫힘
4. 관리자는 `admin.html` 페이지에서 모든 의견 확인

## 🚀 설정 방법

### 1단계: 파일 업로드

다음 파일들을 GitHub 리포지토리에 업로드하세요:

```
리포지토리/
├── .github/
│   └── workflows/
│       └── save-feedback.yml     ← GitHub Actions 워크플로우
├── index.html                     ← 메인 페이지
├── admin.html                     ← 관리자 페이지 (새로 추가!)
├── feedbacks.json                 ← 의견 저장 파일 (빈 배열로 시작)
├── feedback.js
├── meal.js
├── app.js
├── home.js
├── styles.css
└── icon.png
```

### 2단계: feedback.js 수정

파일 상단의 GitHub 정보를 본인의 정보로 수정:

```javascript
const GITHUB_USERNAME = 'cpisgod';  // ← 본인 GitHub 사용자명
const GITHUB_REPO = 'cpisgod.github.io';  // ← 본인 리포지토리 이름
```

### 3단계: GitHub Issues 활성화

1. 리포지토리 → **Settings**
2. **Features** 섹션
3. **Issues** 체크박스 ✅ 활성화

### 4단계: GitHub Actions 권한 설정

1. 리포지토리 → **Settings**
2. 왼쪽 메뉴 → **Actions** → **General**
3. **Workflow permissions** 섹션에서:
   - ✅ **"Read and write permissions"** 선택
   - ✅ **"Allow GitHub Actions to create and approve pull requests"** 체크
4. **Save** 버튼 클릭

**중요:** 이 설정을 하지 않으면 Actions가 파일을 수정할 수 없습니다!

### 5단계: 테스트

1. 웹사이트 접속
2. 의견함 탭(💬) 클릭
3. 의견 작성 후 제출
4. GitHub Issue 페이지로 이동 → 제출
5. 리포지토리에서 **Actions** 탭 확인
   - 워크플로우가 실행 중이거나 완료되었는지 확인
6. `feedbacks.json` 파일 확인
   - 의견이 추가되었는지 확인
7. `admin.html` 페이지 접속
   - 비밀번호: `admin`
   - 제출된 의견 확인

## 📁 파일 구조 설명

### `.github/workflows/save-feedback.yml`
- GitHub Actions 워크플로우 파일
- Issue가 생성될 때마다 자동 실행
- Issue 내용을 `feedbacks.json`에 저장

### `feedbacks.json`
- 모든 의견이 저장되는 파일
- JSON 배열 형식
- 구조:
```json
[
  {
    "id": 1,
    "title": "급식 의견",
    "content": "의견 내용...",
    "author": "GitHub사용자명",
    "created_at": "2024-12-15T10:30:00Z",
    "issue_url": "https://github.com/..."
  }
]
```

### `admin.html`
- 관리자 전용 페이지
- 비밀번호로 보호
- `feedbacks.json` 파일을 읽어서 표시

## 🎯 사용 방법

### 일반 사용자 (의견 제출)

1. 웹사이트 → 의견함(💬) 탭
2. 의견 작성
3. "GitHub Issues로 제출" 버튼 클릭
4. GitHub 로그인 (필요시)
5. "Submit new issue" 버튼 클릭
6. 완료! (자동으로 저장됨)

### 관리자 (의견 확인)

**방법 1: admin.html 페이지**
1. 브라우저에서 `https://사용자명.github.io/admin.html` 접속
2. 비밀번호 입력: `admin`
3. 로그인 → 모든 의견 확인

**방법 2: feedbacks.json 직접 확인**
1. GitHub 리포지토리 접속
2. `feedbacks.json` 파일 클릭
3. 모든 의견을 JSON 형식으로 확인

**방법 3: GitHub Issues**
1. 리포지토리 → Issues 탭
2. 닫힌 Issue들 확인 (Closed)

## 🔍 작동 확인

### Actions 실행 확인
1. 리포지토리 → **Actions** 탭
2. "Save Feedback to JSON" 워크플로우 확인
3. 녹색 체크 ✅ = 성공
4. 빨간 X ❌ = 실패 (클릭하여 오류 확인)

### 의견이 저장되지 않을 때

**원인 1: Workflow permissions 설정 안 함**
- Settings → Actions → General
- "Read and write permissions" 선택

**원인 2: Issues 비활성화**
- Settings → Features
- Issues 체크박스 활성화

**원인 3: 워크플로우 파일 경로 오류**
- 정확한 경로: `.github/workflows/save-feedback.yml`
- 폴더 이름 확인 (`.github`는 점으로 시작)

## 🔒 보안 설정

### 관리자 비밀번호 변경

**admin.html 파일 수정:**
```javascript
const ADMIN_PASSWORD = 'admin';  // ← 원하는 비밀번호로 변경
```

**feedback.js 파일 수정:**
```javascript
const ADMIN_PASSWORD = 'admin';  // ← 동일한 비밀번호로 변경
```

### Private 리포지토리

의견을 비공개로 하려면:
1. Settings → General
2. Danger Zone → Change visibility
3. Make private

⚠️ 주의: Private 리포지토리로 변경하면 GitHub Pages가 비활성화될 수 있습니다.
GitHub Pro 계정이 필요합니다.

## 💡 추가 기능

### 이메일 알림 받기

새 의견이 등록되면 이메일로 알림:
1. 리포지토리 → **Watch** 버튼
2. **Custom** → **Issues** 체크
3. 저장

### 의견에 댓글 달기

GitHub Issues에서 직접 댓글로 응답 가능

### 통계 확인

`feedbacks.json`을 분석하여:
- 총 의견 수
- 날짜별 의견 수
- 키워드 분석 등

## ❓ FAQ

**Q: 의견을 삭제하려면?**
A: `feedbacks.json` 파일을 직접 수정하거나, GitHub Issues에서 삭제

**Q: admin.html 페이지를 숨기고 싶어요**
A: robots.txt에 추가하거나, 다른 파일명으로 변경

**Q: 비밀번호를 잊었어요**
A: admin.html 또는 feedback.js 파일에서 확인 가능

**Q: GitHub Actions 사용료가 있나요?**
A: Public 리포지토리는 무료입니다

**Q: 의견이 실시간으로 업데이트되나요?**
A: admin.html 페이지를 새로고침하면 최신 의견 확인 가능

## 📞 문제 해결

문제가 발생하면:
1. Actions 탭에서 오류 로그 확인
2. feedbacks.json 파일 형식 확인
3. Workflow permissions 설정 확인
4. Issues 활성화 확인

도움이 필요하면 GitHub Issues로 문의하세요!

## ✅ 체크리스트

설정 완료 전 확인:
- [ ] `.github/workflows/save-feedback.yml` 업로드
- [ ] `feedbacks.json` 파일 생성 (빈 배열 `[]`)
- [ ] `admin.html` 업로드
- [ ] feedback.js에서 GitHub 정보 수정
- [ ] Settings → Features → Issues 활성화
- [ ] Settings → Actions → "Read and write permissions" 설정
- [ ] 테스트: 의견 제출 → Actions 실행 → feedbacks.json 확인
- [ ] admin.html 접속 → 비밀번호 입력 → 의견 확인

모두 완료되면 사용 준비 완료! 🎉
