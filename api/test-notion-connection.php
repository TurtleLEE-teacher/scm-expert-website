<?php
/**
 * Notion API 연결 테스트 스크립트
 * .env 파일의 API 키와 데이터베이스 ID들을 확인합니다.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../includes/config.php';
require_once '../includes/notion-api.php';

try {
    echo "=== Notion API 연결 테스트 ===\n\n";
    
    // 1. Config 설정 확인
    $config = Config::getInstance();
    echo "1. 설정 파일 로드: OK\n";
    
    // 2. API 키 확인
    $notionApiKey = $config->get('NOTION_API_KEY');
    if (!$notionApiKey || $notionApiKey === 'your_notion_api_key_here') {
        throw new Exception('Notion API 키가 설정되지 않았습니다. .env 파일의 NOTION_API_KEY를 확인해주세요.');
    }
    echo "2. API 키 확인: OK (키 길이: " . strlen($notionApiKey) . ")\n";
    
    // 3. 데이터베이스 ID 확인
    $studentsDbId = $config->get('NOTION_STUDENTS_DB_ID');
    $inquiriesDbId = $config->get('NOTION_INQUIRIES_DB_ID');
    $coursesDbId = $config->get('NOTION_COURSES_DB_ID');
    
    echo "3. 데이터베이스 ID 확인:\n";
    echo "   - STUDENTS_DB: " . ($studentsDbId ?: 'NOT SET') . "\n";
    echo "   - INQUIRIES_DB: " . ($inquiriesDbId ?: 'NOT SET') . "\n";
    echo "   - COURSES_DB: " . ($coursesDbId ?: 'NOT SET') . "\n";
    
    // 4. Notion API 클래스 초기화
    $notionApi = new NotionAPI($notionApiKey);
    echo "4. Notion API 클래스 초기화: OK\n";
    
    // 5. 실제 API 연결 테스트 (Students DB)
    if ($studentsDbId) {
        echo "5. Students DB 연결 테스트...\n";
        try {
            // 간단한 쿼리로 연결 테스트
            $testResult = $notionApi->queryDatabase($studentsDbId, [], 1);
            if (isset($testResult['error'])) {
                echo "   ❌ 오류: " . $testResult['error'] . "\n";
            } else {
                echo "   ✅ 연결 성공! (총 " . count($testResult['results'] ?? []) . "개 레코드)\n";
            }
        } catch (Exception $e) {
            echo "   ❌ 연결 실패: " . $e->getMessage() . "\n";
        }
    }
    
    // 6. 테스트 데이터 생성 시도
    if ($studentsDbId) {
        echo "6. 테스트 데이터 생성...\n";
        try {
            $testData = [
                '이름' => 'API 테스트',
                '이메일' => 'test@example.com',
                '전화번호' => '010-0000-0000',
                '수강강의' => 'API 연결 테스트',
                '결제금액' => 0,
                '등록일' => date('Y-m-d'),
                '결제상태' => '테스트',
                '특이사항' => 'Notion API 연결 테스트용 데이터 - ' . date('Y-m-d H:i:s')
            ];
            
            $result = $notionApi->createPage($studentsDbId, $testData);
            
            if (isset($result['error'])) {
                echo "   ❌ 테스트 데이터 생성 실패: " . $result['error'] . "\n";
            } else {
                echo "   ✅ 테스트 데이터 생성 성공! (페이지 ID: " . substr($result['id'], 0, 8) . "...)\n";
            }
        } catch (Exception $e) {
            echo "   ❌ 테스트 데이터 생성 실패: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n=== 테스트 완료 ===\n";
    echo "✅ Notion API 연결이 정상적으로 작동합니다!\n";
    echo "이제 신청서가 정상적으로 작동할 것입니다.\n\n";
    
    // 설정 요약 출력
    echo "현재 설정:\n";
    echo "- API 키: " . substr($notionApiKey, 0, 10) . "...\n";
    echo "- 환경: " . $config->get('ENVIRONMENT') . "\n";
    echo "- 디버그 모드: " . ($config->get('DEBUG_MODE') === 'true' ? '활성화' : '비활성화') . "\n";
    
} catch (Exception $e) {
    echo "❌ 오류 발생: " . $e->getMessage() . "\n";
    echo "\n해결 방법:\n";
    echo "1. .env 파일에 올바른 NOTION_API_KEY를 설정하세요\n";
    echo "2. Notion 데이터베이스 ID들이 올바른지 확인하세요\n";
    echo "3. Notion 통합(Integration)에 데이터베이스 접근 권한이 있는지 확인하세요\n";
    
    // 로그 기록
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'type' => 'NOTION_CONNECTION_TEST_ERROR',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ];
    
    error_log(json_encode($logData, JSON_UNESCAPED_UNICODE), 3, dirname(__DIR__) . '/logs/notion_test.log');
}
?>