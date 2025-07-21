<?php
/**
 * Enhanced Configuration File for Notion Integration
 * 
 * 이 파일은 노션 API 연동을 위한 설정을 포함합니다.
 * 실제 사용 시 아래 값들을 실제 API 키와 데이터베이스 ID로 변경해주세요.
 */

// 노션 API 설정
define('NOTION_API_KEY', 'your_notion_api_key_here'); // 노션 Integration API 키
define('NOTION_VERSION', '2022-06-28'); // 노션 API 버전

// 노션 데이터베이스 ID
define('NOTION_COURSES_DB', 'your_courses_database_id'); // 강의 데이터베이스 ID
define('NOTION_STUDENTS_DB', 'your_students_database_id'); // 수강생 데이터베이스 ID
define('NOTION_INQUIRIES_DB', 'your_inquiries_database_id'); // 문의사항 데이터베이스 ID
define('NOTION_CONSULTING_DB', 'your_consulting_database_id'); // 컨설팅 데이터베이스 ID

// 사이트 설정
define('SITE_NAME', 'SCM EXPERT');
define('SITE_DESCRIPTION', 'Supply Chain Management 전문 교육 및 컨설팅');
define('SITE_URL', 'http://localhost/mysite');
define('ADMIN_EMAIL', 'ahfifa88@gmail.com');

// 이메일 설정 (SMTP)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your_email@gmail.com');
define('SMTP_PASSWORD', 'your_app_password');
define('SMTP_ENCRYPTION', 'tls');

// 로그 설정
define('LOG_DIR', dirname(__DIR__) . '/logs');
define('LOG_LEVEL', 'DEBUG'); // DEBUG, INFO, WARNING, ERROR

// 시간대 설정
date_default_timezone_set('Asia/Seoul');

// 에러 리포팅 설정
if (defined('DEVELOPMENT_MODE') && DEVELOPMENT_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(E_ERROR | E_WARNING | E_PARSE);
    ini_set('display_errors', 0);
}

// 세션 설정
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// 보안 헤더 설정
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// 데이터베이스 연결 함수 (백업용 SQLite)
function getBackupDB() {
    static $db = null;
    if ($db === null) {
        try {
            $dbPath = dirname(__DIR__) . '/database/scm_expert_backup.db';
            $dbDir = dirname($dbPath);
            if (!is_dir($dbDir)) {
                mkdir($dbDir, 0777, true);
            }
            $db = new PDO('sqlite:' . $dbPath);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            return null;
        }
    }
    return $db;
}

// 노션 API 클라이언트 생성 함수
function getNotionClient() {
    require_once __DIR__ . '/includes/notion-api.php';
    return new NotionAPI(NOTION_API_KEY);
}

// 유틸리티 함수들
function logActivity($message, $type = 'INFO') {
    $logFile = LOG_DIR . '/activity.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] [$type] $message" . PHP_EOL;
    
    if (!is_dir(LOG_DIR)) {
        mkdir(LOG_DIR, 0777, true);
    }
    
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
}

function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validatePhone($phone) {
    // 한국 전화번호 형식 검증
    $phone = preg_replace('/[^0-9]/', '', $phone);
    return preg_match('/^(01[0-9]{8,9}|0[2-9][0-9]{7,8})$/', $phone);
}

// CSRF 토큰 생성 및 검증
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// 알림 메시지 설정
function setAlert($message, $type = 'info') {
    $_SESSION['alert'] = [
        'message' => $message,
        'type' => $type
    ];
}

function getAlert() {
    if (isset($_SESSION['alert'])) {
        $alert = $_SESSION['alert'];
        unset($_SESSION['alert']);
        return $alert;
    }
    return null;
}

// 페이지네이션 헬퍼
function getPaginationData($totalItems, $currentPage = 1, $itemsPerPage = 10) {
    $totalPages = ceil($totalItems / $itemsPerPage);
    $currentPage = max(1, min($currentPage, $totalPages));
    $offset = ($currentPage - 1) * $itemsPerPage;
    
    return [
        'total_items' => $totalItems,
        'items_per_page' => $itemsPerPage,
        'current_page' => $currentPage,
        'total_pages' => $totalPages,
        'offset' => $offset,
        'has_prev' => $currentPage > 1,
        'has_next' => $currentPage < $totalPages,
        'prev_page' => $currentPage - 1,
        'next_page' => $currentPage + 1
    ];
}

// 파일 업로드 헬퍼
function handleFileUpload($file, $allowedTypes = ['pdf', 'doc', 'docx'], $maxSize = 5242880) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'error' => '파일 업로드 실패'];
    }
    
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedTypes)) {
        return ['success' => false, 'error' => '허용되지 않은 파일 형식'];
    }
    
    if ($file['size'] > $maxSize) {
        return ['success' => false, 'error' => '파일 크기가 너무 큽니다'];
    }
    
    $uploadDir = dirname(__DIR__) . '/uploads';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $filename = uniqid() . '_' . basename($file['name']);
    $filepath = $uploadDir . '/' . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        return ['success' => true, 'filename' => $filename, 'filepath' => $filepath];
    }
    
    return ['success' => false, 'error' => '파일 저장 실패'];
}

// 강의 카테고리
$COURSE_CATEGORIES = [
    'scm_basic' => 'SCM 기초 과정',
    'sap_erp' => 'SAP ERP 실무',
    'consulting_tools' => '컨설팅 도구 마스터',
    'career_consulting' => '커리어 컨설팅'
];

// 강의 레벨
$COURSE_LEVELS = [
    'beginner' => '초급',
    'intermediate' => '중급',
    'advanced' => '고급'
];

// 문의 타입
$INQUIRY_TYPES = [
    'course' => '강의문의',
    'consulting' => '컨설팅문의',
    'general' => '일반문의'
];

// 상태 정의
$STATUS_TYPES = [
    'pending' => '대기중',
    'processing' => '처리중',
    'completed' => '완료',
    'cancelled' => '취소'
];
?>