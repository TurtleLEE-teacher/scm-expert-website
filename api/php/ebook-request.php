<?php
/**
 * 전자책 신청 처리 - Notion CRM 연동
 * 상호성 마케팅을 위한 전자책 다운로드 신청 API
 */

ini_set('display_errors', 0);
error_reporting(0);

require_once __DIR__ . '/../includes/security.php';

// 보안 헤더 설정
Security::setCorsHeaders();
Security::setSecurityHeaders();
header('Content-Type: application/json; charset=utf-8');

// CORS 프리플라이트 요청 처리
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// POST 요청만 허용
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Security::errorResponse('허용되지 않은 메소드', 405);
}

// Rate Limiting 체크
if (!Security::checkRateLimit(5, 60)) {
    Security::errorResponse('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429);
}

try {
    require_once __DIR__ . '/../includes/config.php';
    require_once __DIR__ . '/../includes/notion-api.php';
} catch (Exception $e) {
    error_log("Ebook request include error: " . $e->getMessage());
    Security::errorResponse('서버 설정 오류가 발생했습니다.', 500);
}

try {
    // 입력 데이터 검증
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    // 이름 검증 (필수)
    $nameResult = Security::validateName($input['name'] ?? '');
    if (!$nameResult['valid']) {
        throw new Exception($nameResult['error']);
    }

    // 이메일 검증 (필수)
    $emailResult = Security::validateEmail($input['email'] ?? '');
    if (!$emailResult['valid']) {
        throw new Exception($emailResult['error']);
    }

    // 소속구분 검증 (필수)
    $affiliationTypes = ['직장인', '학생', '취업준비생', '기타'];
    $affiliation = $input['affiliation'] ?? '';
    if (!in_array($affiliation, $affiliationTypes)) {
        throw new Exception('소속구분을 선택해주세요.');
    }

    // 개인정보 동의 확인
    if (empty($input['privacy_agreed']) || $input['privacy_agreed'] === 'false') {
        throw new Exception('개인정보 수집·이용 동의가 필요합니다.');
    }

    // Notion API 준비
    $config = Config::getInstance();
    $notionApiKey = $config->get('NOTION_API_KEY');
    $crmDbId = $config->get('NOTION_CRM_DB_ID');

    if (!$notionApiKey || $notionApiKey === 'your_notion_api_key_here') {
        throw new Exception('Notion API 키가 설정되지 않았습니다.');
    }

    if (!$crmDbId) {
        throw new Exception('CRM 데이터베이스 ID가 설정되지 않았습니다.');
    }

    $notionApi = new NotionAPI($notionApiKey);

    // Notion에 저장할 데이터 준비
    $notionData = [
        '이름' => $nameResult['value'],
        '이메일' => $emailResult['value'],
        '소속구분' => $affiliation,
        '문의일' => date('Y-m-d'),
        '상태' => '전자책신청',
        '특이사항' => '전자책 다운로드 신청'
    ];

    // Notion에 페이지 생성
    $result = $notionApi->createPage($crmDbId, $notionData);

    if (isset($result['error'])) {
        throw new Exception('등록에 실패했습니다: ' . $result['error']);
    }

    // 성공 응답
    $response = [
        'success' => true,
        'message' => '전자책 신청이 완료되었습니다. 이메일로 다운로드 링크를 보내드립니다.',
        'registration_id' => $result['id'] ?? null
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE);

    // 성공 로그
    $successLog = [
        'timestamp' => date('Y-m-d H:i:s'),
        'type' => 'EBOOK_REQUEST_SUCCESS',
        'registration_id' => $result['id'] ?? null,
        'affiliation' => $affiliation,
        'ip' => Security::getClientIp()
    ];
    error_log(json_encode($successLog, JSON_UNESCAPED_UNICODE) . "\n", 3, dirname(__DIR__) . '/logs/ebook_request.log');

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);

    // 에러 로그
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'type' => 'EBOOK_REQUEST_ERROR',
        'error' => $e->getMessage(),
        'ip' => Security::getClientIp()
    ];
    error_log(json_encode($logData, JSON_UNESCAPED_UNICODE) . "\n", 3, dirname(__DIR__) . '/logs/ebook_request.log');
}
?>
