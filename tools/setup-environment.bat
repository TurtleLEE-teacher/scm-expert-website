@echo off
echo ======================================
echo Claude Code 슬랙 훅 환경 설정 스크립트
echo ======================================

:: 현재 디렉토리를 CLAUDE_PROJECT_DIR로 설정
set "CLAUDE_PROJECT_DIR=%~dp0.."
echo Current directory: %CLAUDE_PROJECT_DIR%

:: 시스템 환경 변수로 CLAUDE_PROJECT_DIR 설정
setx CLAUDE_PROJECT_DIR "%CLAUDE_PROJECT_DIR%"
if %errorlevel% neq 0 (
    echo ERROR: CLAUDE_PROJECT_DIR 환경 변수 설정 실패
    pause
    exit /b 1
)
echo ✅ CLAUDE_PROJECT_DIR 설정 완료: %CLAUDE_PROJECT_DIR%

:: SLACK_BOT_TOKEN 설정 안내
echo.
echo ======================================
echo SLACK_BOT_TOKEN 설정이 필요합니다
echo ======================================
echo.
echo 1. Slack App에서 Bot User OAuth Token을 복사하세요
echo 2. 토큰은 xoxb-로 시작합니다
echo 3. 아래에 토큰을 입력하세요 (입력이 보이지 않습니다):
echo.

:: 안전한 토큰 입력
set /p "SLACK_TOKEN=토큰 입력: "
if "%SLACK_TOKEN%"=="" (
    echo ERROR: 토큰이 입력되지 않았습니다
    pause
    exit /b 1
)

:: 토큰 형식 검증
echo %SLACK_TOKEN% | findstr /r "^xoxb-" >nul
if %errorlevel% neq 0 (
    echo WARNING: 토큰이 xoxb-로 시작하지 않습니다. 계속하시겠습니까? (Y/N)
    set /p "CONTINUE="
    if /i not "%CONTINUE%"=="Y" exit /b 1
)

:: 시스템 환경 변수로 SLACK_BOT_TOKEN 설정
setx SLACK_BOT_TOKEN "%SLACK_TOKEN%"
if %errorlevel% neq 0 (
    echo ERROR: SLACK_BOT_TOKEN 환경 변수 설정 실패
    pause
    exit /b 1
)
echo ✅ SLACK_BOT_TOKEN 설정 완료

:: 환경 변수 적용을 위한 안내
echo.
echo ======================================
echo 설정 완료
echo ======================================
echo.
echo ⚠️ 중요: 환경 변수 적용을 위해 다음 중 하나를 수행하세요:
echo   1. 새로운 명령 프롬프트 창을 여세요
echo   2. 또는 컴퓨터를 재시작하세요
echo   3. 또는 현재 터미널을 완전히 종료했다가 다시 시작하세요
echo.
echo Claude Code를 재시작한 후 훅이 정상 작동할 것입니다.
echo.

:: 설정 검증 스크립트 실행 제안
echo 설정 검증을 위해 verification 스크립트를 실행하시겠습니까? (Y/N)
set /p "RUN_VERIFY="
if /i "%RUN_VERIFY%"=="Y" (
    call "%~dp0verify-setup.bat"
)

echo.
echo 설정이 완료되었습니다!
pause