# 🤖 CLAUDECODE 봇 설정 가이드

## 🎯 봇 정보
- **봇 이름**: CLAUDECODE
- **워크스페이스**: PI
- **앱 ID**: A0971SCETEF
- **타입**: Modern
- **상태**: 생성 완료 ✅

## 📋 Bot Token 설정 단계

### 1단계: 필요한 권한 추가
슬랙 앱 설정에서 다음 권한을 추가하세요:

**OAuth & Permissions → Scopes → Bot Token Scopes**:
- `chat:write` - 메시지 전송
- `chat:write.public` - 공개 채널에 메시지 전송  
- `channels:read` - 채널 목록 조회
- `groups:read` - 프라이빗 채널 목록 조회
- `im:read` - DM 채널 조회
- `mpim:read` - 그룹 DM 조회

### 2단계: 워크스페이스에 설치
1. "Install to Workspace" 클릭
2. 권한 승인
3. 설치 완료

### 3단계: Bot Token 복사
**OAuth & Permissions → Bot User OAuth Token**에서 토큰 복사
- 형식: `xoxb-XXXXXXXXX-XXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXX`

### 4단계: 즉시 테스트
Bot Token을 받으면 아래 명령어로 즉시 테스트:

```bash
node -e "
const OfficialSlackNotifier = require('./slack-official-api.js');
const slack = new OfficialSlackNotifier('YOUR_BOT_TOKEN_HERE');
"
```

## 🚀 예상 결과

Bot Token 설정 후:
```
🔗 공식 슬랙 API 연결 초기화 중...
✅ 슬랙 연결 성공! 사용자: CLAUDECODE
📍 워크스페이스: PI
📋 채널 X개 로드됨
🎯 알림 채널 후보: general
📤 슬랙 메시지 전송 성공! (채널: general)
```

## ⚡ 빠른 실행

Bot Token 받으면 이 명령어 하나로 즉시 실제 알림 시작:

```javascript
const { claudeWebhookIntegration } = require('./claude-integration-webhook.js');

// Bot Token으로 업그레이드
claudeWebhookIntegration.notifier = new (require('./slack-official-api.js'))('YOUR_BOT_TOKEN');

// 즉시 테스트 알림
await claudeWebhookIntegration.completeTask({
    description: '🎉 CLAUDECODE 봇 연결 성공!',
    status: 'success'
});
```

## 🎯 완료 후 가능한 것들

- ✅ 작업 완료 시 슬랙으로 즉시 알림
- ✅ 승인 요청 시 슬랙으로 즉시 알림
- ✅ 에러 발생 시 슬랙으로 즉시 알림
- ✅ 실시간 진행상황 슬랙 업데이트
- ✅ 모든 Claude 워크플로우 자동 추적

---

**🎊 Bot Token만 받으면 완전한 슬랙 알림 시스템 즉시 가동!**