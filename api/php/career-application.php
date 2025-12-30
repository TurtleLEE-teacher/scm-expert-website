<?php
/**
 * 커리어 컨설팅 서비스 신청 처리 - Notion API 연동 + 파일 업로드
 * 보안 강화 버전
 */

require_once __DIR__ . '/../includes/security.php';
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/notion-api.php';

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

// Rate Limiting 체크 (분당 5회)
if (!Security::checkRateLimit(5, 60)) {
    Security::errorResponse('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429);
}

try {
    // 입력 데이터 검증 (multipart/form-data 처리)
    $input = $_POST;

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
    if (empty($input['privacy_required']) || ($input['privacy_required'] !== 'true' && $input['privacy_required'] !== '1')) {
        throw new Exception('개인정보 수집·이용 동의가 필요합니다.');
    }

    // 입금자명 검증
    $depositorResult = Security::validateName($input['depositor_name'] ?? '');
    if (!$depositorResult['valid']) {
        throw new Exception('입금자명: ' . $depositorResult['error']);
    }
    
    // 컨설팅 타입 검증
    $consultingTypes = [
        'resume' => '이력서 컨설팅',
        'interview' => '면접 컨설팅',
        'comprehensive' => '종합 패키지'
    ];
    
    if (!isset($consultingTypes[$input['consulting_type']])) {
        throw new Exception('유효하지 않은 컨설팅 유형입니다.');
    }
    
    // 가격 정보
    $priceInfo = [
        'resume' => ['price' => 150000, 'duration' => '작업일 3일'],
        'interview' => ['price' => 250000, 'duration' => '2회 코칭'],
        'comprehensive' => ['price' => 350000, 'duration' => '총 4회 세션']
    ];
    
    $selectedPrice = $priceInfo[$input['consulting_type']];
    
    // 파일 업로드 처리
    $uploadedFileInfo = null;
    if (isset($_FILES['resume_file']) && $_FILES['resume_file']['error'] === UPLOAD_ERR_OK) {
        $uploadedFileInfo = handleFileUpload($_FILES['resume_file']);
        if (isset($uploadedFileInfo['error'])) {
            throw new Exception($uploadedFileInfo['error']);
        }
    }
    
    // Notion API 준비
    $config = Config::getInstance();
    $notionApiKey = $config->get('NOTION_API_KEY');
    $inquiriesDbId = $config->get('NOTION_INQUIRIES_DB_ID'); // 컨설팅은 문의 DB를 사용
    
    if (!$notionApiKey || $notionApiKey === 'your_notion_api_key_here') {
        throw new Exception('Notion API 키가 설정되지 않았습니다.');
    }
    
    if (!$inquiriesDbId) {
        throw new Exception('문의 데이터베이스 ID가 설정되지 않았습니다.');
    }
    
    $notionApi = new NotionAPI($notionApiKey);
    
    // 회사명 검증 (선택 필드)
    $companyResult = Security::validateCompany($input['current_company'] ?? '');

    // Notion에 저장할 데이터 준비 (검증된 값 사용)
    $notionData = [
        '이름' => $nameResult['value'],
        '이메일' => $emailResult['value'],
        '전화번호' => $phoneResult['value'],
        '회사명' => $companyResult['value'],
        '문의유형' => '커리어 컨설팅',
        '상태' => '새 문의',
        '우선순위' => '보통',
        '문의내용' => formatConsultingDetails($input, $consultingTypes[$input['consulting_type']], $selectedPrice, $uploadedFileInfo, $depositorResult['value']),
        'IP주소' => Security::getClientIp()
    ];
    
    // Notion에 페이지 생성
    $result = $notionApi->createPage($inquiriesDbId, $notionData);
    
    if (isset($result['error'])) {
        throw new Exception('신청서 저장에 실패했습니다: ' . $result['error']);
    }
    
    // 성공 응답
    $response = [
        'success' => true,
        'message' => '🎉 커리어 컨설팅 신청이 성공적으로 접수되었습니다!\n\n📧 24시간 내에 결제 안내 및 일정 조율 이메일을 발송해드립니다.\n💼 결제 완료 후 담당 컨설턴트가 직접 연락드립니다.',
        'application_id' => $result['id'] ?? null,
        'consulting_info' => [
            'type' => $consultingTypes[$input['consulting_type']],
            'price' => number_format($selectedPrice['price']) . '원',
            'duration' => $selectedPrice['duration']
        ],
        'file_uploaded' => $uploadedFileInfo ? true : false
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
    // 성공 로그
    $successLog = [
        'timestamp' => date('Y-m-d H:i:s'),
        'type' => 'CAREER_APPLICATION_SUCCESS',
        'application_id' => $result['id'] ?? null,
        'consulting_type' => $consultingTypes[$input['consulting_type']],
        'price' => $selectedPrice['price'],
        'file_uploaded' => $uploadedFileInfo ? true : false,
        'ip' => Security::getClientIp()
    ];
    error_log(json_encode($successLog, JSON_UNESCAPED_UNICODE), 3, dirname(__DIR__) . '/logs/career_application.log');
    
    // 관리자 알림 이메일 발송 (선택사항)
    sendAdminNotification($input, $consultingTypes[$input['consulting_type']], $selectedPrice, $uploadedFileInfo);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    
    // 상세 에러 로그
    $logData = [
        'timestamp' => date('Y-m-d H:i:s'),
        'type' => 'CAREER_APPLICATION_ERROR',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'ip' => Security::getClientIp(),
        'user_agent' => Security::sanitizeText($_SERVER['HTTP_USER_AGENT'] ?? '', 500),
        'post_data' => array_filter($_POST, function($key) {
            return !in_array($key, ['resume_file']);
        }, ARRAY_FILTER_USE_KEY),
        'files_uploaded' => !empty($_FILES['resume_file']) ? $_FILES['resume_file']['name'] ?? 'unnamed' : 'none'
    ];
    
    error_log(json_encode($logData, JSON_UNESCAPED_UNICODE), 3, dirname(__DIR__) . '/logs/career_application.log');
}

/**
 * 파일 업로드 처리
 */
function handleFileUpload($file) {
    $maxSize = 10 * 1024 * 1024; // 10MB
    $allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    $allowedExtensions = ['pdf', 'doc', 'docx'];
    
    // 업로드 에러 검사
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['error' => '파일 업로드 중 오류가 발생했습니다.'];
    }
    
    // 파일 크기 검사
    if ($file['size'] > $maxSize || $file['size'] == 0) {
        return ['error' => '파일 크기는 1KB ~ 10MB 사이여야 합니다.'];
    }
    
    // 파일명 검증 (보안)
    $originalName = basename($file['name']);
    if (empty($originalName) || strlen($originalName) > 255) {
        return ['error' => '유효하지 않은 파일명입니다.'];
    }
    
    // 파일 확장자 검사
    $fileExtension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    if (!in_array($fileExtension, $allowedExtensions)) {
        return ['error' => 'PDF, DOC, DOCX 파일만 업로드 가능합니다.'];
    }
    
    // MIME 타입 검사 (더 엄격한 검증)
    $fileType = $file['type'];
    if (!in_array($fileType, $allowedTypes)) {
        return ['error' => '허용되지 않는 파일 형식입니다.'];
    }
    
    // 파일 내용 검증 (매직 바이트 체크)
    $tmpFile = $file['tmp_name'];
    if (!is_uploaded_file($tmpFile)) {
        return ['error' => '유효하지 않은 업로드 파일입니다.'];
    }
    
    $fileHeader = file_get_contents($tmpFile, false, null, 0, 8);
    $isPdf = (strpos($fileHeader, '%PDF') === 0);
    $isDoc = (strpos($fileHeader, "\xD0\xCF\x11\xE0") === 0 || strpos($fileHeader, "PK") === 0);
    
    if (!$isPdf && !$isDoc) {
        return ['error' => '파일이 손상되었거나 유효하지 않습니다.'];
    }
    
    // 업로드 디렉토리 생성
    $uploadDir = dirname(__DIR__) . '/uploads/resumes/';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            return ['error' => '업로드 디렉토리 생성에 실패했습니다.'];
        }
    }
    
    // 안전한 파일명 생성 (보안 강화)
    $safeFileName = date('Y-m-d_H-i-s') . '_' . uniqid() . '_' . bin2hex(random_bytes(8)) . '.' . $fileExtension;
    $filePath = $uploadDir . $safeFileName;
    
    // 파일명 중복 방지
    $counter = 1;
    while (file_exists($filePath)) {
        $safeFileName = date('Y-m-d_H-i-s') . '_' . uniqid() . '_' . bin2hex(random_bytes(8)) . '_' . $counter . '.' . $fileExtension;
        $filePath = $uploadDir . $safeFileName;
        $counter++;
        
        if ($counter > 100) {
            return ['error' => '파일명 생성에 실패했습니다.'];
        }
    }
    
    // 파일 이동
    if (!move_uploaded_file($file['tmp_name'], $filePath)) {
        return ['error' => '파일 업로드에 실패했습니다.'];
    }
    
    // 파일 권한 설정
    chmod($filePath, 0644);
    
    return [
        'original_name' => $originalName,
        'safe_name' => $safeFileName,
        'file_path' => $filePath,
        'file_url' => '/uploads/resumes/' . $safeFileName,
        'size' => $file['size'],
        'type' => $fileType
    ];
}

/**
 * 관리자 알림 이메일 발송
 */
function sendAdminNotification($data, $consultingType, $priceInfo, $fileInfo) {
    $to = 'contact@scmexpert.com';
    $subject = '[SCM Labs] 새로운 컨설팅 신청: ' . $consultingType;
    
    $message = "새로운 커리어 컨설팅 신청이 접수되었습니다.\n\n";
    $message .= "=== 신청자 정보 ===\n";
    $message .= "이름: " . $data['name'] . "\n";
    $message .= "이메일: " . $data['email'] . "\n";
    $message .= "전화번호: " . $data['phone'] . "\n";
    $message .= "현재 회사: " . ($data['current_company'] ?? '미입력') . "\n";
    $message .= "현재 직책: " . ($data['current_position'] ?? '미입력') . "\n\n";
    
    $message .= "=== 컨설팅 정보 ===\n";
    $message .= "컨설팅 유형: " . $consultingType . "\n";
    $message .= "컨설팅 비용: " . number_format($priceInfo['price']) . "원\n";
    $message .= "진행 기간: " . $priceInfo['duration'] . "\n";
    $message .= "현재 상황: " . ($data['current_status'] ?? '미입력') . "\n";
    $message .= "목표 기업: " . ($data['target_company'] ?? '미입력') . "\n";
    $message .= "경력 년수: " . ($data['experience_years'] ?? '미입력') . "\n";
    $message .= "추가 요청사항: " . ($data['additional_requests'] ?? '미입력') . "\n\n";
    
    if ($fileInfo) {
        $message .= "=== 첨부 파일 ===\n";
        $message .= "파일명: " . $fileInfo['original_name'] . "\n";
        $message .= "파일 크기: " . round($fileInfo['size'] / 1024, 2) . "KB\n";
        $message .= "파일 경로: " . $fileInfo['file_path'] . "\n\n";
    }
    
    $message .= "=== 결제 정보 ===\n";
    $message .= "입금자명: " . $data['depositor_name'] . "\n\n";
    
    $message .= "=== 기타 정보 ===\n";
    $message .= "마케팅 수신동의: " . (($data['marketing_optional'] === 'true' || $data['marketing_optional'] === '1') ? '동의' : '거부') . "\n";
    $message .= "신청일시: " . date('Y-m-d H:i:s') . "\n";
    $message .= "IP주소: " . ($_SERVER['REMOTE_ADDR'] ?? 'N/A') . "\n\n";
    
    $message .= "📞 빠른 시일 내에 신청자에게 연락하여 결제 안내 및 일정 조율을 진행해주세요.\n";
    
    $headers = "From: noreply@scmexpert.com\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    @mail($to, $subject, $message, $headers);
}

/**
 * 커리어 컨설팅 세부 정보 포맷팅
 */
function formatConsultingDetails($input, $consultingType, $priceInfo, $fileInfo, $validatedDepositor = '') {
    $details = [];

    // 기본 컨설팅 정보
    $details[] = "=== 컨설팅 정보 ===";
    $details[] = "유형: " . $consultingType;
    $details[] = "비용: " . number_format($priceInfo['price']) . "원";
    $details[] = "기간: " . $priceInfo['duration'];
    $details[] = "";

    // 신청자 상세 정보
    $details[] = "=== 신청자 정보 ===";
    if (!empty($input['current_company'])) {
        $details[] = "현재 회사: " . Security::sanitizeText($input['current_company'], 100);
    }
    if (!empty($input['current_position'])) {
        $details[] = "현재 직책: " . Security::sanitizeText($input['current_position'], 50);
    }

    // 현재 상황
    if (!empty($input['current_status'])) {
        $statusLabels = [
            'employed' => '재직중',
            'job_seeking' => '구직중',
            'preparing_transition' => '이직 준비중'
        ];
        $details[] = "현재 상황: " . ($statusLabels[$input['current_status']] ?? Security::sanitizeText($input['current_status'], 50));
    }

    // 목표 및 경력
    if (!empty($input['target_company'])) {
        $details[] = "목표 업계/기업: " . Security::sanitizeText($input['target_company'], 200);
    }
    if (!empty($input['experience_years'])) {
        $experienceLabels = [
            'entry' => '신입 (1년 미만)',
            'junior' => '주니어 (1-3년)',
            'mid' => '미드 (3-5년)',
            'senior' => '시니어 (5년 이상)'
        ];
        $details[] = "경력 년수: " . ($experienceLabels[$input['experience_years']] ?? Security::sanitizeText($input['experience_years'], 50));
    }

    $details[] = "";

    // 추가 요청사항
    if (!empty($input['additional_requests'])) {
        $details[] = "=== 추가 요청사항 ===";
        $details[] = Security::sanitizeText($input['additional_requests'], 1000);
        $details[] = "";
    }

    // 파일 업로드 정보
    if ($fileInfo) {
        $details[] = "=== 첨부 파일 ===";
        $details[] = "파일명: " . $fileInfo['original_name'];
        $details[] = "크기: " . round($fileInfo['size'] / 1024, 2) . "KB";
        $details[] = "경로: " . $fileInfo['file_path'];
        $details[] = "";
    }

    // 결제 정보
    $details[] = "=== 결제 정보 ===";
    $details[] = "입금자명: " . ($validatedDepositor ?: Security::sanitizeText($input['depositor_name'] ?? '', 50));

    // 추가 정보
    $marketingConsent = (!empty($input['marketing_optional']) && ($input['marketing_optional'] === 'true' || $input['marketing_optional'] === '1')) ? '동의' : '거부';
    $details[] = "마케팅 수신: " . $marketingConsent;
    $details[] = "신청일시: " . date('Y-m-d H:i:s');

    return implode("\n", $details);
}
?>