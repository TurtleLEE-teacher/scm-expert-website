# 🚀 슬랙 MCP 서버 설정 가이드

슬랙 MCP 서버가 성공적으로 설치되었습니다! 이제 실제 슬랙 토큰을 설정하여 알림 기능을 활성화할 수 있습니다.

## 📋 현재 상태

✅ **슬랙 MCP 서버 설치 완료**
- 위치: `C:\Users\ahfif\.claude.json`
- 서버명: `slack-mcp-server`
- 상태: 더미 토큰으로 대기 중

## 🔑 토큰 설정 방법 (2가지 옵션)

### 옵션 1: 브라우저 토큰 (권장) 🌟

**장점**: 더 강력한 기능, 모든 채널/DM 접근 가능
**단점**: 브라우저에서 토큰 추출 필요

#### 1단계: 브라우저에서 슬랙 로그인
1. 크롬/엣지 등 브라우저에서 https://slack.com 로그인
2. 워크스페이스 접속

#### 2단계: 개발자 도구로 토큰 추출
1. `F12` 키를 눌러 개발자 도구 열기
2. `Console` 탭 클릭
3. 다음 코드 복사 후 실행:

```javascript
JSON.parse(localStorage.localConfig_v2).teams[document.location.pathname.match(/^\/client\/([A-Z0-9]+)/)[1]].token
```

4. 결과로 나오는 `xoxc-...` 토큰 복사
5. Application 탭 → Cookies → 도메인 선택 → `d` 쿠키값 복사 (`xoxd-...`)

#### 3단계: 토큰 적용
```bash
# 다음 명령어로 토큰 업데이트
claude mcp remove slack-mcp-server
claude mcp add slack-mcp-server -s user \
  -e SLACK_MCP_XOXC_TOKEN=실제xoxc토큰여기 \
  -e SLACK_MCP_XOXD_TOKEN=실제xoxd토큰여기 \
  -- npx -y slack-mcp-server@latest --transport stdio
```

### 옵션 2: 공식 OAuth 토큰

**장점**: 더 안전하고 공식적인 방법
**단점**: 슬랙 앱 생성 필요, 제한된 권한

#### 1단계: 슬랙 앱 생성
1. https://api.slack.com/apps 접속
2. "Create New App" → "From scratch" 선택
3. 앱 이름 입력, 워크스페이스 선택

#### 2단계: 권한 설정
OAuth & Permissions 페이지에서 다음 스코프 추가:
- `channels:history`
- `channels:read`
- `groups:history`
- `groups:read`
- `im:history`
- `im:read`
- `mpim:history`
- `mpim:read`
- `users:read`
- `chat:write`

#### 3단계: 토큰 적용
```bash
claude mcp remove slack-mcp-server
claude mcp add slack-mcp-server -s user \
  -e SLACK_MCP_XOXP_TOKEN=실제xoxp토큰여기 \
  -- npx -y slack-mcp-server@latest --transport stdio
```

## 🔧 설정 완료 후 테스트

### 1. 서버 상태 확인
```bash
claude mcp list
```

### 2. 디버그 모드 테스트
```bash
timeout 30 claude --debug
```

### 3. MCP 명령어 테스트
디버그 모드에서:
```
/mcp
```

## 🚨 알림 기능 구현 계획

토큰 설정 완료 후 다음 기능을 구현할 예정입니다:

1. **작업 완료 알림**: 주요 작업 완료 시 자동 슬랙 메시지
2. **승인 요청 알림**: 사용자 확인이 필요한 경우 슬랙 알림
3. **에러 알림**: 중요한 오류 발생 시 즉시 알림
4. **진행 상황 업데이트**: 장시간 작업의 중간 진행 보고

## 💡 사용자 액션 필요

다음 중 하나를 선택해주세요:

1. **"옵션 1로 진행"** - 브라우저 토큰 방식 (더 강력함)
2. **"옵션 2로 진행"** - 공식 OAuth 방식 (더 안전함)
3. **"나중에 설정"** - 현재는 더미 토큰 유지

선택해주시면 해당 방법에 대한 상세 가이드를 제공하겠습니다! 🎯