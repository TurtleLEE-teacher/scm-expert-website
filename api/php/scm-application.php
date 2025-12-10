<?php
/**
 * SCM 부트캠프 수강 신청 처리 - Notion API 연동
 * 보안 강화 버전
 */

// 에러를 JSON으로 출력하기 위한 설정
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

// Rate Limiting 체크 (분당 5회 - 신청서는 더 엄격하게)
if (!Security::checkRateLimit(5, 60)) {
    Security::errorResponse('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429);
}

try {
    require_once __DIR__ . '/../includes/config.php';
    require_once __DIR__ . '/../includes/notion-api.php';
} catch (Exception $e) {
    error_log("SCM Application include error: " . $e->getMessage());
    Security::errorResponse('서버 설정 오류가 발생했습니다.', 500);
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

    // 전화번호 검증
    $phoneResult = Security::validatePhone($input['phone'] ?? '');
    if (!$phoneResult['valid']) {
        throw new Exception($phoneResult['error']);
    }

    // 개인정보 동의 확인
    if (empty($input['privacy_required']) || $input['privacy_required'] === 'false') {
        throw new Exception('개인정보 수집·이용 동의가 필요합니다.');
    }

    // 입금자명 검증
    $depositorResult = Security::validateName($input['depositor_name'] ?? '');
    if (!$depositorResult['valid']) {
        throw new Exception('입금자명: ' . $depositorResult['error']);
    }
    
    // 과정 타입 검증
    $courseTypes = [
        'beginner' => 'SCM 초급반 (5주)',
        'advanced' => 'SCM 심화반 (8주)'
    ];
    
    if (!isset($courseTypes[$input['course_type']])) {
        throw new Exception('유효하지 않은 과정입니다.');
    }
    
    // 가격 정보
    $priceInfo = [
        'beginner' => ['price' => 299000, 'duration' => '5주'],
        'advanced' => ['price' => 499000, 'duration' => '8주']
    ];
    
    $selectedPrice = $priceInfo[$input['course_type']];
    
    // Notion API 준비
    $config = Config::getInstance();
    $notionApiKey = $config->get('NOTION_API_KEY');
    $studentsDbId = $config->get('NOTION_STUDENTS_DB_ID');
    
    if (!$notionApiKey || $notionApiKey === 'your_notion_api_key_here') {
        throw new Exception('Notion API 키가 설정되지 않았습니다.');
    }
    
    if (!$studentsDbId) {
        throw new Exception('학생 데이터베이스 ID가 설정되지 않았습니다.');
    }
    
    $notionApi = new NotionAPI($notionApiKey);
    
    // 회사명/직책 검증 (선택 필드)
    $companyResult = Security::validateCompany($input['company'] ?? '');
    $position = Security::sanitizeText($input['position'] ?? '', 50);

    // Notion에 저장할 데이터 준비 (검증된 값 사용)
    $notionData = [
        '이름' => $nameResult['value'],
        '이메일' => $emailResult['value'],
        '전화번호' => $phoneResult['value'],
        '회사명' => $companyResult['value'],
        '직책' => $position,
        '수강강의' => $courseTypes[$input['course_type']] . ' (' . $selectedPrice['duration'] . ')',
        '결제금액' => (int)$selectedPrice['price'],
        '등록일' => date('Y-m-d'),
        '결제상태' => '결제대기',
        '특이사항' => formatStudentDetails($input, $selectedPrice, $nameResult['value'], $depositorResult['value'])
    ];
    
    // Notion에 페이지 생성
    $result = $notionApi->createPage($studentsDbId, $notionData);
    
    if (isset($result['error'])) {
        throw new Exception('신청서 저장에 실패했습니다: ' . $result['error']);
    }
    
    // 성공 응답
    $response = [
        'success' => true,
        'message' => '🎉 SCM 부트캠프 수강 신청이 성공적으로 접수되었습니다!\n\n📧 24시간 내에 결제 안내 이메일을 발송해드립니다.\n💡 결제 완료 후 강의 자료 및 일정을 안내해드립니다.',
        'application_id' => $result['id'] ?? null,
        'course_info' => [
            'name' => $courseTypes[$input['course_type']],
            'price' => number_format($selectedPrice['price']) . '원',
            'duration' => $selectedPrice['duration']
        ]
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
    // 성공 로그
    $successLog = [
        'timestamp' => date('Y-m-d H:i:s'),
        'type' => 'SCM_APPLICATION_SUCCESS',
        'application_id' => $result['id'] ?? null,
        'course' => $courseTypes[$input['course_type']],
        'price' => $selectedPrice['price'],
        'ip' => Security::getClientIp()
    ];
    error_log(json_encode($successLog, JSON_UNESCAPED_UNICODE), 3, dirname(__DIR__) . '/logs/scm_application.log');
    
    // 관리자 알림 이메일 발송 (선택사항)
    sendAdminNotification($input, $courseTypes[$input['course_type']], $selectedPrice);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    
    // 상세 에러 로그
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'type' => 'SCM_APPLICATION_ERROR',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'ip' => Security::getClientIp(),
        'user_agent' => Security::sanitizeText($_SERVER['HTTP_USER_AGENT'] ?? '', 500),
        'post_data' => json_encode($_POST, JSON_UNESCAPED_UNICODE)
    ];
    
    error_log(json_encode($logData, JSON_UNESCAPED_UNICODE), 3, dirname(__DIR__) . '/logs/scm_application.log');
}

/**
 * 관리자 알림 이메일 발송
 */
function sendAdminNotification($data, $courseName, $priceInfo) {
    $to = 'contact@scmexpert.com';
    $subject = '[SCM Expert] 새로운 수강 신청: ' . $courseName;
    
    $message = "새로운 SCM 부트캠프 수강 신청이 접수되었습니다.\n\n";
    $message .= "=== 신청자 정보 ===\n";
    $message .= "이름: " . $data['name'] . "\n";
    $message .= "이메일: " . $data['email'] . "\n";
    $message .= "전화번호: " . $data['phone'] . "\n";
    $message .= "회사: " . ($data['company'] ?? '미입력') . "\n";
    $message .= "직책: " . ($data['position'] ?? '미입력') . "\n\n";
    
    $message .= "=== 수강 정보 ===\n";
    $message .= "과정명: " . $courseName . "\n";
    $message .= "수강료: " . number_format($priceInfo['price']) . "원\n";
    $message .= "진행기간: " . $priceInfo['duration'] . "\n";
    $message .= "경력수준: " . ($data['experience_level'] ?? '미입력') . "\n";
    $message .= "학습목표: " . ($data['learning_goals'] ?? '미입력') . "\n\n";
    
    $message .= "=== 결제 정보 ===\n";
    $message .= "입금자명: " . $data['depositor_name'] . "\n\n";
    
    $message .= "=== 기타 정보 ===\n";
    $message .= "마케팅 수신동의: " . ($data['marketing_optional'] ? '동의' : '거부') . "\n";
    $message .= "신청일시: " . date('Y-m-d H:i:s') . "\n";
    $message .= "IP주소: " . ($_SERVER['REMOTE_ADDR'] ?? 'N/A') . "\n\n";
    
    $message .= "📞 빠른 시일 내에 신청자에게 연락하여 결제 안내를 진행해주세요.\n";
    
    $headers = "From: noreply@scmexpert.com\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    @mail($to, $subject, $message, $headers);
}

/**
 * 학생 상세 정보 포맷팅
 */
function formatStudentDetails($input, $priceInfo, $validatedName = '', $validatedDepositor = '') {
    $details = [];

    if (!empty($input['experience_level'])) {
        $experienceLevels = [
            'entry' => '신입 (1년 미만)',
            'junior' => '주니어 (1-3년)',
            'mid' => '미드 (3-5년)',
            'senior' => '시니어 (5년 이상)'
        ];
        $details[] = "경력수준: " . ($experienceLevels[$input['experience_level']] ?? Security::sanitizeText($input['experience_level'], 50));
    }

    if (!empty($input['learning_goals'])) {
        $details[] = "학습목표: " . Security::sanitizeText($input['learning_goals'], 500);
    }

    // 검증된 이름과 입금자명 비교
    if (!empty($validatedDepositor) && $validatedDepositor !== $validatedName) {
        $details[] = "입금자명: " . $validatedDepositor;
    }

    $marketingConsent = !empty($input['marketing_optional']) && ($input['marketing_optional'] === true || $input['marketing_optional'] === 'true' || $input['marketing_optional'] === '1') ? '동의' : '거부';
    $details[] = "마케팅 수신: " . $marketingConsent;

    $details[] = "신청일시: " . date('Y-m-d H:i:s');
    $details[] = "IP: " . Security::getClientIp();

    return implode(' | ', $details);
}
?>