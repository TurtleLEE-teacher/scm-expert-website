<?php
/**
 * 사이트 설정 파일
 * 노션 API 및 기타 설정 정보
 */

// 노션 API 설정
// 실제 사용 시 아래 값들을 실제 API 키와 데이터베이스 ID로 변경하세요
define('NOTION_API_KEY', 'your_notion_api_key_here');
define('NOTION_DATABASE_ID', 'your_notion_database_id_here');

// 사이트 기본 설정
define('SITE_NAME', 'SCM 전문가 - 강의 및 컨설팅');
define('SITE_EMAIL', 'ahfifa88@gmail.com');
define('SITE_URL', 'http://localhost');

// 이메일 설정 (추후 구현)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your_email@gmail.com');
define('SMTP_PASSWORD', 'your_app_password');

// 디버그 모드
define('DEBUG_MODE', true);

// 로그 설정
define('ENABLE_LOGGING', true);
define('LOG_LEVEL', 'INFO'); // DEBUG, INFO, WARNING, ERROR

// 보안 설정
define('SESSION_TIMEOUT', 3600); // 1시간
define('MAX_LOGIN_ATTEMPTS', 5);

/**
 * 노션 설정 도우미 함수
 */
function getNotionConfig() {
    return [
        'api_key' => NOTION_API_KEY,
        'database_id' => NOTION_DATABASE_ID
    ];
}

/**
 * 설정 유효성 검사
 */
function validateConfig() {
    $errors = [];
    
    if (NOTION_API_KEY === 'your_notion_api_key_here') {
        $errors[] = 'NOTION_API_KEY가 설정되지 않았습니다.';
    }
    
    if (NOTION_DATABASE_ID === 'your_notion_database_id_here') {
        $errors[] = 'NOTION_DATABASE_ID가 설정되지 않았습니다.';
    }
    
    return $errors;
}

/**
 * 환경별 설정 로드
 */
function loadEnvironmentConfig() {
    $environment = $_SERVER['SERVER_NAME'] ?? 'localhost';
    
    switch ($environment) {
        case 'localhost':
            // 로컬 개발 환경
            error_reporting(E_ALL);
            ini_set('display_errors', 1);
            break;
            
        default:
            // 프로덕션 환경
            error_reporting(0);
            ini_set('display_errors', 0);
            break;
    }
}

// 환경 설정 자동 로드
loadEnvironmentConfig();
?>