<?php
/**
 * 고객 만족도 조사 제출 처리 - Notion API 연동
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); // 운영 시에는 실제 도메인으로 변경
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// CORS 프리플라이트 요청 처리
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// POST 요청만 허용
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => '허용되지 않은 메소드'], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once '../includes/config.php';
require_once '../includes/notion-api.php';

try {
    // 입력 데이터 검증
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    
    $requiredFields = ['name', 'email', 'service_used', 'overall_satisfaction', 'instructor_satisfaction', 'content_satisfaction', 'recommendation'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            throw new Exception("필수 필드가 누락되었습니다: $field");
        }
    }
    
    // 이메일 유효성 검사
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('유효하지 않은 이메일 주소입니다.');
    }
    
    // 서비스 유형 검증
    $serviceTypes = [
        'scm_course' => 'SCM 기초강의',
        'career_consulting' => '커리어 컨설팅',
        'both' => '둘 다 이용'
    ];
    
    if (!isset($serviceTypes[$input['service_used']])) {
        throw new Exception('유효하지 않은 서비스 유형입니다.');
    }
    
    // 만족도 값 검증
    $satisfactionValues = ['매우불만족', '불만족', '보통', '만족', '매우만족'];
    $recommendationValues = ['매우비추천', '비추천', '보통', '추천', '매우추천'];
    
    if (!in_array($input['overall_satisfaction'], $satisfactionValues)) {
        throw new Exception('유효하지 않은 전체 만족도 값입니다.');
    }
    
    if (!in_array($input['instructor_satisfaction'], $satisfactionValues)) {
        throw new Exception('유효하지 않은 강사 만족도 값입니다.');
    }
    
    if (!in_array($input['content_satisfaction'], $satisfactionValues)) {
        throw new Exception('유효하지 않은 내용 만족도 값입니다.');
    }
    
    if (!in_array($input['recommendation'], $recommendationValues)) {
        throw new Exception('유효하지 않은 추천 의향 값입니다.');
    }
    
    // Notion API 준비
    $config = Config::getInstance();
    $notionApiKey = $config->get('NOTION_API_KEY');
    $surveyDbId = $config->get('NOTION_SURVEY_DB_ID'); // 새 설문조사 DB ID
    
    if (!$notionApiKey || $notionApiKey === 'your_notion_api_key_here') {
        throw new Exception('Notion API 키가 설정되지 않았습니다.');
    }
    
    if (!$surveyDbId) {
        throw new Exception('설문조사 데이터베이스 ID가 설정되지 않았습니다. SURVEY_DB_STRUCTURE.md를 참고하여 DB를 생성하고 config.php를 업데이트해주세요.');
    }
    
    $notionApi = new NotionAPI($notionApiKey);
    
    // Notion에 저장할 데이터 준비
    $notionData = [
        '이름' => trim($input['name']),
        '이메일' => trim($input['email']),
        '전화번호' => trim($input['phone'] ?? ''),
        '참여서비스' => $serviceTypes[$input['service_used']],
        '전체만족도' => $input['overall_satisfaction'],
        '강사만족도' => $input['instructor_satisfaction'],
        '내용만족도' => $input['content_satisfaction'],
        '추천의향' => $input['recommendation'],
        '개선사항' => trim($input['improvements'] ?? ''),
        '추가의견' => trim($input['additional_comments'] ?? ''),
        'IP주소' => $_SERVER['REMOTE_ADDR'] ?? ''
    ];
    
    // Notion에 페이지 생성
    $result = $notionApi->createPage($surveyDbId, $notionData);
    
    if (isset($result['error'])) {
        throw new Exception('설문조사 저장에 실패했습니다: ' . $result['error']);
    }
    
    // 성공 응답
    $response = [
        'success' => true,
        'message' => '🎉 소중한 의견을 주셔서 감사합니다!\n\n더 나은 서비스로 보답하겠습니다.',
        'survey_id' => $result['id'] ?? null
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
    // 성공 로그
    $successLog = [
        'timestamp' => date('Y-m-d H:i:s'),
        'type' => 'SURVEY_SUBMISSION_SUCCESS',
        'survey_id' => $result['id'] ?? null,
        'service_used' => $serviceTypes[$input['service_used']],
        'overall_satisfaction' => $input['overall_satisfaction'],
        'recommendation' => $input['recommendation'],
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ];
    error_log(json_encode($successLog, JSON_UNESCAPED_UNICODE), 3, dirname(__DIR__) . '/logs/survey.log');
    
    // 관리자 알림 이메일 발송 (선택사항)
    sendAdminNotification($input, $serviceTypes[$input['service_used']]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    
    // 상세 에러 로그
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'type' => 'SURVEY_SUBMISSION_ERROR',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        'post_data' => json_encode($input ?? [], JSON_UNESCAPED_UNICODE)
    ];
    
    error_log(json_encode($logData, JSON_UNESCAPED_UNICODE), 3, dirname(__DIR__) . '/logs/survey.log');
}

/**
 * 관리자 알림 이메일 발송
 */
function sendAdminNotification($data, $serviceName) {
    $to = 'contact@scmexpert.com';
    $subject = '[SCM Expert] 새로운 고객 만족도 조사: ' . $serviceName;
    
    $message = "새로운 고객 만족도 조사가 접수되었습니다.\n\n";
    $message .= "=== 응답자 정보 ===\n";
    $message .= "이름: " . $data['name'] . "\n";
    $message .= "이메일: " . $data['email'] . "\n";
    $message .= "전화번호: " . ($data['phone'] ?? '미입력') . "\n";
    $message .= "이용 서비스: " . $serviceName . "\n\n";
    
    $message .= "=== 만족도 평가 ===\n";
    $message .= "전체 만족도: " . $data['overall_satisfaction'] . "\n";
    $message .= "강사 만족도: " . $data['instructor_satisfaction'] . "\n";
    $message .= "내용 만족도: " . $data['content_satisfaction'] . "\n";
    $message .= "추천 의향: " . $data['recommendation'] . "\n\n";
    
    if (!empty($data['improvements'])) {
        $message .= "=== 개선사항 ===\n";
        $message .= $data['improvements'] . "\n\n";
    }
    
    if (!empty($data['additional_comments'])) {
        $message .= "=== 추가의견 ===\n";
        $message .= $data['additional_comments'] . "\n\n";
    }
    
    $message .= "=== 기타 정보 ===\n";
    $message .= "작성일시: " . date('Y-m-d H:i:s') . "\n";
    $message .= "IP주소: " . ($_SERVER['REMOTE_ADDR'] ?? 'N/A') . "\n\n";
    
    $message .= "📊 더 많은 고객 피드백을 통해 서비스 품질을 개선해나가겠습니다.\n";
    
    $headers = "From: noreply@scmexpert.com\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    @mail($to, $subject, $message, $headers);
}
?>