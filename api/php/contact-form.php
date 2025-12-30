<?php
/**
 * 문의 폼 처리 - Notion 통합
 * 보안 강화 버전
 */

require_once __DIR__ . '/../includes/security.php';
require_once __DIR__ . '/../includes/notion-integration.php';

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

// Rate Limiting 체크 (분당 10회)
if (!Security::checkRateLimit(10, 60)) {
    Security::errorResponse('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429);
}

try {
    // 입력 데이터 검증
    $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

    // 이름 검증
    $nameResult = Security::validateName($input['name'] ?? '');
    if (!$nameResult['valid']) {
        throw new Exception($nameResult['error']);
    }

    // 이메일 검증
    $emailResult = Security::validateEmail($input['email'] ?? '');
    if (!$emailResult['valid']) {
        throw new Exception($emailResult['error']);
    }

    // 서비스 타입 검증
    $validServices = ['scm-basic', 'career-consulting', 'corporate', 'general'];
    if (empty($input['service']) || !in_array($input['service'], $validServices)) {
        throw new Exception('올바른 서비스 유형을 선택해주세요.');
    }

    // 메시지 검증
    if (empty($input['message']) || mb_strlen(trim($input['message'])) < 10) {
        throw new Exception('문의 내용을 10자 이상 입력해주세요.');
    }

    // 전화번호 검증 (선택 필드)
    $phone = '';
    if (!empty($input['phone'])) {
        $phoneResult = Security::validatePhone($input['phone']);
        if (!$phoneResult['valid']) {
            throw new Exception($phoneResult['error']);
        }
        $phone = $phoneResult['value'];
    }

    // 회사명 검증 (선택 필드)
    $companyResult = Security::validateCompany($input['company'] ?? '');
    if (!$companyResult['valid']) {
        throw new Exception($companyResult['error']);
    }

    // 데이터 준비 (살균 처리)
    $inquiryData = [
        'name' => $nameResult['value'],
        'email' => $emailResult['value'],
        'phone' => $phone,
        'company' => $companyResult['value'],
        'inquiry_type' => $input['service'],
        'message' => Security::sanitizeText($input['message'], 2000),
        'ip_address' => Security::getClientIp(),
        'user_agent' => Security::sanitizeText($_SERVER['HTTP_USER_AGENT'] ?? '', 500)
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
    $subject = '[SCM Labs] 새로운 문의: ' . $data['inquiry_type'];
    
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