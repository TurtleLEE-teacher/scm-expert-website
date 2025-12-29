<?php
/**
 * 상담 신청 폼 처리 - Notion 통합
 * Notion DB: 23787a1932c481c59df9eb0bed62f1a8
 */

// CORS 헤더 설정
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// OPTIONS 요청 처리
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

// 환경변수 로드
require_once __DIR__ . '/../includes/config.php';

// Notion API 설정
$NOTION_API_KEY = config('NOTION_API_KEY');
$CONSULTATION_DB_ID = '23787a1932c481c59df9eb0bed62f1a8';

try {
    // 입력 데이터 받기
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        throw new Exception('유효하지 않은 요청입니다.');
    }

    // 필수 필드 검증
    $name = trim($input['name'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $email = trim($input['email'] ?? '');
    $currentStatus = trim($input['current_status'] ?? '');
    $preferredTime = trim($input['preferred_time'] ?? '');

    if (empty($name)) {
        throw new Exception('이름을 입력해주세요.');
    }
    if (empty($phone)) {
        throw new Exception('연락처를 입력해주세요.');
    }
    if (empty($email)) {
        throw new Exception('이메일을 입력해주세요.');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('올바른 이메일 형식을 입력해주세요.');
    }
    if (empty($currentStatus)) {
        throw new Exception('현재 상황을 선택해주세요.');
    }
    if (empty($preferredTime)) {
        throw new Exception('희망 시작 시기를 선택해주세요.');
    }

    // 선택 필드
    $goal = trim($input['goal'] ?? '');

    // 전화번호 정규화
    $phone = preg_replace('/[^0-9]/', '', $phone);
    if (strlen($phone) === 11) {
        $phone = substr($phone, 0, 3) . '-' . substr($phone, 3, 4) . '-' . substr($phone, 7, 4);
    } elseif (strlen($phone) === 10) {
        $phone = substr($phone, 0, 3) . '-' . substr($phone, 3, 3) . '-' . substr($phone, 6, 4);
    }

    // Notion 페이지 생성 데이터
    $notionData = [
        'parent' => [
            'database_id' => $CONSULTATION_DB_ID
        ],
        'properties' => [
            '이름' => [
                'title' => [
                    [
                        'text' => [
                            'content' => $name
                        ]
                    ]
                ]
            ],
            '연락처' => [
                'phone_number' => $phone
            ],
            '이메일' => [
                'email' => $email
            ],
            '현재상황' => [
                'select' => [
                    'name' => $currentStatus
                ]
            ],
            '희망시기' => [
                'select' => [
                    'name' => $preferredTime
                ]
            ],
            '상담내용' => [
                'rich_text' => [
                    [
                        'text' => [
                            'content' => $goal ?: '(미입력)'
                        ]
                    ]
                ]
            ],
            '상태' => [
                'select' => [
                    'name' => '신규'
                ]
            ],
            '신청일' => [
                'date' => [
                    'start' => date('Y-m-d')
                ]
            ]
        ]
    ];

    // Notion API 호출
    $ch = curl_init('https://api.notion.com/v1/pages');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($notionData),
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $NOTION_API_KEY,
            'Notion-Version: 2022-06-28',
            'Content-Type: application/json'
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        throw new Exception('서버 연결 오류: ' . $curlError);
    }

    $result = json_decode($response, true);

    if ($httpCode >= 400) {
        // Notion API 에러 로깅
        error_log('Notion API Error: ' . $response);
        throw new Exception('데이터 저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }

    // 성공 응답
    echo json_encode([
        'success' => true,
        'message' => '상담 신청이 완료되었습니다.',
        'page_id' => $result['id'] ?? null
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);

    error_log('Consultation form error: ' . $e->getMessage());
}
?>
