<?php
/**
 * 디버그용 간단한 테스트 API
 * JSON 응답이 제대로 작동하는지 확인
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// CORS 프리플라이트 요청 처리
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 에러를 JSON으로 출력하기 위한 설정
ini_set('display_errors', 0);
error_reporting(0);

$debugInfo = [];

try {
    $debugInfo['step1'] = 'PHP 실행 시작';
    
    // 1. 기본 정보 확인
    $debugInfo['php_version'] = phpversion();
    $debugInfo['current_dir'] = __DIR__;
    $debugInfo['parent_dir'] = dirname(__DIR__);
    
    // 2. 파일 존재 여부 확인
    $configFile = __DIR__ . '/../includes/config.php';
    $notionFile = __DIR__ . '/../includes/notion-api.php';
    $envFile = __DIR__ . '/../.env';
    
    $debugInfo['files_check'] = [
        'config.php' => file_exists($configFile) ? 'EXISTS' : 'MISSING',
        'notion-api.php' => file_exists($notionFile) ? 'EXISTS' : 'MISSING',
        '.env' => file_exists($envFile) ? 'EXISTS' : 'MISSING'
    ];
    
    $debugInfo['step2'] = 'Include 파일 로드 시작';
    
    // 3. Include 파일 로드 테스트
    if (file_exists($configFile)) {
        require_once $configFile;
        $debugInfo['config_loaded'] = 'OK';
    } else {
        throw new Exception('config.php 파일이 없습니다');
    }
    
    if (file_exists($notionFile)) {
        require_once $notionFile;
        $debugInfo['notion_api_loaded'] = 'OK';
    } else {
        throw new Exception('notion-api.php 파일이 없습니다');
    }
    
    $debugInfo['step3'] = 'Config 클래스 테스트';
    
    // 4. Config 클래스 테스트
    if (class_exists('Config')) {
        $config = Config::getInstance();
        $debugInfo['config_class'] = 'OK';
        
        $notionApiKey = $config->get('NOTION_API_KEY');
        $debugInfo['api_key_check'] = $notionApiKey ? 
            (strlen($notionApiKey) > 20 ? 'VALID_LENGTH' : 'TOO_SHORT') : 'MISSING';
        $debugInfo['api_key_length'] = strlen($notionApiKey ?? '');
        
        $studentsDbId = $config->get('NOTION_STUDENTS_DB_ID');
        $debugInfo['students_db_id'] = $studentsDbId ? 'SET' : 'MISSING';
        
    } else {
        throw new Exception('Config 클래스가 정의되지 않았습니다');
    }
    
    $debugInfo['step4'] = 'NotionAPI 클래스 테스트';
    
    // 5. NotionAPI 클래스 테스트
    if (class_exists('NotionAPI')) {
        $debugInfo['notion_api_class'] = 'OK';
        
        if ($notionApiKey && $notionApiKey !== 'your_notion_api_key_here') {
            $notionApi = new NotionAPI($notionApiKey);
            $debugInfo['notion_api_instance'] = 'OK';
        } else {
            $debugInfo['notion_api_instance'] = 'SKIPPED - NO API KEY';
        }
    } else {
        throw new Exception('NotionAPI 클래스가 정의되지 않았습니다');
    }
    
    $debugInfo['step5'] = '모든 테스트 완료';
    
    // 성공 응답
    echo json_encode([
        'success' => true,
        'message' => '✅ 모든 시스템이 정상 작동합니다!',
        'debug_info' => $debugInfo,
        'recommendation' => 'API가 정상 작동할 것으로 예상됩니다.'
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    // 에러 응답
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug_info' => $debugInfo,
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'recommendation' => '위의 debug_info를 확인하여 문제를 해결하세요.'
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
?>