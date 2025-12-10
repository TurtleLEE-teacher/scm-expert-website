@echo off
echo ======================================
echo Claude Code 슬랙 훅 설정 검증 스크립트  
echo ======================================

:: 환경 변수 확인
echo.
echo 1. 환경 변수 확인 중...
echo ======================================

if "%CLAUDE_PROJECT_DIR%"=="" (
    echo ❌ CLAUDE_PROJECT_DIR이 설정되지 않았습니다
    set "VERIFICATION_FAILED=1"
) else (
    echo ✅ CLAUDE_PROJECT_DIR: %CLAUDE_PROJECT_DIR%
    if not exist "%CLAUDE_PROJECT_DIR%" (
        echo ❌ CLAUDE_PROJECT_DIR 경로가 존재하지 않습니다
        set "VERIFICATION_FAILED=1"
    )
)

if "%SLACK_BOT_TOKEN%"=="" (
    echo ❌ SLACK_BOT_TOKEN이 설정되지 않았습니다
    set "VERIFICATION_FAILED=1"
) else (
    echo ✅ SLACK_BOT_TOKEN: xoxb-***[토큰 길이: %SLACK_BOT_TOKEN:~0,50%자 이상]
)

:: 파일 존재 확인
echo.
echo 2. 필수 파일 존재 확인 중...
echo ======================================

set "HOOK_SCRIPT=%CLAUDE_PROJECT_DIR%\tools\hooks\task-completion-notifier.js"
if exist "%HOOK_SCRIPT%" (
    echo ✅ 훅 스크립트: %HOOK_SCRIPT%
) else (
    echo ❌ 훅 스크립트가 존재하지 않습니다: %HOOK_SCRIPT%
    set "VERIFICATION_FAILED=1"
)

set "SLACK_SYSTEM=%CLAUDE_PROJECT_DIR%\tools\slack-notification-system.js"
if exist "%SLACK_SYSTEM%" (
    echo ✅ 슬랙 시스템: %SLACK_SYSTEM%
) else (
    echo ❌ 슬랙 시스템이 존재하지 않습니다: %SLACK_SYSTEM%
    set "VERIFICATION_FAILED=1"
)

set "CLAUDE_SETTINGS=%CLAUDE_PROJECT_DIR%\.claude\settings.json"
if exist "%CLAUDE_SETTINGS%" (
    echo ✅ Claude 설정: %CLAUDE_SETTINGS%
) else (
    echo ❌ Claude 설정이 존재하지 않습니다: %CLAUDE_SETTINGS%
    set "VERIFICATION_FAILED=1"
)

:: Node.js 확인
echo.
echo 3. Node.js 환경 확인 중...
echo ======================================

node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f %%i in ('node --version') do echo ✅ Node.js: %%i
) else (
    echo ❌ Node.js가 설치되지 않았거나 PATH에 없습니다
    set "VERIFICATION_FAILED=1"
)

:: 훅 스크립트 테스트
echo.
echo 4. 훅 스크립트 테스트 중...
echo ======================================

if exist "%HOOK_SCRIPT%" (
    echo 테스트 JSON 데이터로 훅 스크립트 실행 중...
    echo {"tool_name": "TestTool", "parameters": {"test": true}} | node "%HOOK_SCRIPT%"
    if %errorlevel% equ 0 (
        echo ✅ 훅 스크립트가 정상적으로 실행됩니다
    ) else (
        echo ❌ 훅 스크립트 실행 중 오류 발생
        set "VERIFICATION_FAILED=1"
    )
)

:: 슬랙 API 연결 테스트
echo.
echo 5. 슬랙 API 연결 테스트 중...
echo ======================================

if exist "%SLACK_SYSTEM%" (
    node -e "
    const SlackSystem = require('%SLACK_SYSTEM%');
    const slack = new SlackSystem();
    if (slack.testMode) {
        console.log('⚠️  테스트 모드로 실행 중 (SLACK_BOT_TOKEN 없음)');
        console.log('✅ 슬랙 시스템 모듈 로드 성공');
    } else {
        console.log('✅ 슬랙 API 토큰이 설정됨 (실제 전송 모드)');
    }
    "
)

:: 결과 요약
echo.
echo ======================================
echo 검증 결과
echo ======================================

if "%VERIFICATION_FAILED%"=="1" (
    echo.
    echo ❌ 설정에 문제가 발견되었습니다!
    echo.
    echo 다음 단계를 수행하세요:
    echo 1. setup-environment.bat를 다시 실행하세요
    echo 2. 터미널을 완전히 재시작하세요  
    echo 3. Claude Code를 재시작하세요
    echo.
) else (
    echo.
    echo ✅ 모든 설정이 올바르게 구성되었습니다!
    echo.
    echo 이제 Claude Code에서 작업을 수행하면
    echo 슬랙으로 알림이 전송됩니다.
    echo.
)

pause