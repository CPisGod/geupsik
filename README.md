# 급식 정보 앱

학교 급식 메뉴 / 달력 / 통계 / 의견함을 제공하는 정적 웹앱입니다. `index.html`을 정적 호스팅(GitHub Pages 등)에 올리면 됩니다.

## 기능
- 🍚 일별 급식 (조식·중식·석식), 알러지 번호 표시, 📤 공유하기
- 📅 달력 (즐겨찾기 메뉴가 나오는 날 ⭐ 표시)
- 📊 월별 통계: 평균 칼로리, 자주 나온 메뉴 TOP 5, 영양소 비율 도넛
- ⚙️ 설정: 테마(자동/라벤더/다크/민트/노을), 좋아하는 메뉴, 알림
- 📲 PWA: 홈 화면 설치, 오프라인 열람 (https 또는 localhost에서만 동작)

## 즐겨찾기 알림
브라우저 알림 권한을 허용하면 **앱을 열 때** 오늘·내일 급식에 즐겨찾기 메뉴가 있으면 알려줍니다.
설치된 PWA(Chrome/Edge 계열)는 주기적 백그라운드 확인도 시도합니다. 서버 푸시가 아니므로 앱을 전혀 열지 않는 환경(iOS 등)에서는 정시 알림을 보장하지 않습니다.
정시 알림이 필요하면 아래 급식 봇을 사용하세요.

## 급식 봇 (매일 아침 자동 전송)
`.github/workflows/daily-meal.yml`이 평일 07:30(KST)에 `bot/send-meal.mjs`를 실행합니다.
저장소 **Settings → Secrets and variables → Actions**에 아래 중 원하는 것을 등록하세요.

| 대상 | Secrets |
|---|---|
| 디스코드 | `DISCORD_WEBHOOK_URL` |
| 텔레그램 | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` |
| 카카오톡 (나에게 보내기) | `KAKAO_REST_API_KEY`, `KAKAO_REFRESH_TOKEN` |

카카오톡은 개인 "나에게 보내기"만 지원합니다. 여러 명에게 보내려면 카카오톡 채널(비즈니스) 연동이 필요하므로, 단체 공유는 디스코드/텔레그램을 권장합니다.

로컬 테스트: `DRY_RUN=1 DATE=20261111 node bot/send-meal.mjs`
