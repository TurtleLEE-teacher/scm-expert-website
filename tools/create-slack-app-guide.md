# 🚀 슬랙 앱 생성 및 설정 가이드

## 현재 상황
- ✅ 슬랙 OAuth 연결 성공 (사용자: ahfifa, 워크스페이스: PI)
- ❌ 메시지 전송 권한 부족 (`missing_scope` 오류)

## 해결 방법: 슬랙 앱 생성

### 1단계: 슬랙 앱 생성
1. https://api.slack.com/apps 방문
2. "Create New App" 클릭
3. "From scratch" 선택
4. 앱 이름: "Claude Code Assistant"
5. 워크스페이스: "PI" 선택

### 2단계: 필요한 권한(Scopes) 추가
**OAuth & Permissions** 섹션에서 다음 스코프 추가:

#### Bot Token Scopes (필수)
- `chat:write` - 메시지 전송
- `chat:write.public` - 공개 채널에 메시지 전송
- `channels:read` - 채널 목록 조회
- `groups:read` - 프라이빗 채널 목록 조회
- `im:read` - DM 채널 조회
- `mpim:read` - 그룹 DM 조회

#### User Token Scopes (선택사항)
- `identify` - 사용자 정보 조회

### 3단계: 앱 설치
1. "Install to Workspace" 클릭
2. 권한 승인
3. **Bot User OAuth Token** 복사 (xoxb-로 시작)

### 4단계: 토큰 업데이트
새로운 Bot Token을 사용하여 다시 테스트:

```javascript
// 새로운 Bot Token 사용 (xoxb-로 시작)
const token = 'xoxb-YOUR-NEW-BOT-TOKEN';
```

## 현재 토큰 분석
- **현재 토큰**: `xoxe.xoxp-` (Extended OAuth Token)
- **문제**: 제한된 권한, 메시지 전송 불가
- **해결책**: Bot Token (`xoxb-`) 사용

## 빠른 테스트 방법
Bot Token을 받으면 다음 명령어로 즉시 테스트 가능:

```bash
node -e "
const notifier = require('./slack-official-api.js');
const slack = new notifier('YOUR-NEW-BOT-TOKEN');
// 자동으로 환영 메시지 전송됨
"
```

## 추가 설정 (선택사항)

### 이벤트 구독 (향후 확장용)
- Request URL: 웹훅 엔드포인트 설정 가능
- 실시간 슬랙 이벤트 수신 가능

### 슬래시 명령어 (향후 확장용)
- `/claude-status` - 현재 작업 상태 조회
- `/claude-notify` - 수동 알림 발송

## 완료 후 예상 결과
```
🚀 공식 슬랙 API 연결 초기화 중...
✅ 슬랙 연결 성공! 사용자: ahfifa
📍 워크스페이스: PI
📋 채널 3개 로드됨
🎯 알림 채널 후보: general
📤 슬랙 메시지 전송 성공! (채널: general)
```

## 다음 단계
1. 슬랙 앱 생성 및 Bot Token 획득
2. 새 토큰으로 테스트
3. Claude 워크플로우에 완전 통합
4. 자동 알림 시스템 활성화

---
*이 가이드를 따라하면 5분 내에 완전한 슬랙 알림 시스템을 구축할 수 있습니다!*