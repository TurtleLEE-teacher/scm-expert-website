<?php
/**
 * 문의 폼 처리 - Notion 통합
 * 기존 SQL 대신 Notion MCP 사용
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

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

require_once '../includes/notion-integration.php';

try {
    // 입력 데이터 검증
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
    
    $requiredFields = ['name', 'email', 'service', 'message'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            throw new Exception("필수 필드가 누락되었습니다: $field");
        }
    }
    
    // 이메일 유효성 검사
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('유효하지 않은 이메일 주소입니다.');
    }
    
    // 데이터 준비
    $inquiryData = [
        'name' => trim($input['name']),
        'email' => trim($input['email']),
        'phone' => trim($input['phone'] ?? ''),
        'company' => trim($input['company'] ?? ''),
        'inquiry_type' => $input['service'],
        'message' => trim($input['message']),
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
    ];
    
    // Notion에 저장
    $notion = new NotionIntegration();
    $result = $notion->saveInquiry($inquiryData);
    
    if ($result['success']) {
        // 성공 응답
        echo json_encode([
            'success' => true,
            'message' => '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.',
            'inquiry_id' => $result['page_id']
        ], JSON_UNESCAPED_UNICODE);
        
        // 이메일 알림 (선택사항)
        sendNotificationEmail($inquiryData);
        
    } else {
        throw new Exception('문의 저장에 실패했습니다.');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    
    // 에러 로그
    error_log("Contact form error: " . $e->getMessage());
}

/**
 * 알림 이메일 발송 (선택사항)
 */
function sendNotificationEmail($data) {
    $to = 'contact@scmexpert.com'; // 관리자 이메일
    $subject = '[SCM Expert] 새로운 문의: ' . $data['inquiry_type'];
    
    $message = "새로운 문의가 접수되었습니다.\n\n";
    $message .= "이름: " . $data['name'] . "\n";
    $message .= "이메일: " . $data['email'] . "\n";
    $message .= "전화번호: " . $data['phone'] . "\n";
    $message .= "회사: " . $data['company'] . "\n";
    $message .= "문의유형: " . $data['inquiry_type'] . "\n";
    $message .= "문의내용:\n" . $data['message'] . "\n\n";
    $message .= "접수시간: " . date('Y-m-d H:i:s') . "\n";
    $message .= "IP주소: " . $data['ip_address'] . "\n";
    
    $headers = "From: noreply@scmexpert.com\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    mail($to, $subject, $message, $headers);
}
?>