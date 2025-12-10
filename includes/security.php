<?php
/**
 * 보안 헬퍼 함수 모음
 * CORS, CSRF, 입력 검증, Rate Limiting
 */

class Security {

    // 허용된 도메인 목록
    private static $allowedOrigins = [
        'https://scmexpert.com',
        'https://www.scmexpert.com',
        'https://scm-expert-website.vercel.app',
        'http://localhost:8000',
        'http://localhost:3000',
        'http://127.0.0.1:8000'
    ];

    /**
     * 안전한 CORS 헤더 설정
     * 허용된 도메인만 Access-Control-Allow-Origin 허용
     */
    public static function setCorsHeaders() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        // 개발 환경에서는 localhost 허용
        $isLocalhost = strpos($origin, 'localhost') !== false || strpos($origin, '127.0.0.1') !== false;

        if (in_array($origin, self::$allowedOrigins) || $isLocalhost) {
            header('Access-Control-Allow-Origin: ' . $origin);
        } else {
            // 기본 도메인 설정 (운영 환경)
            header('Access-Control-Allow-Origin: https://scmexpert.com');
        }

        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');
    }

    /**
     * 보안 헤더 설정
     */
    public static function setSecurityHeaders() {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Content-Security-Policy: default-src \'self\'');
    }

    /**
     * CSRF 토큰 생성
     */
    public static function generateCsrfToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }

        return $_SESSION['csrf_token'];
    }

    /**
     * CSRF 토큰 검증
     */
    public static function validateCsrfToken($token) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (empty($_SESSION['csrf_token']) || empty($token)) {
            return false;
        }

        return hash_equals($_SESSION['csrf_token'], $token);
    }

    /**
     * Rate Limiting (IP 기반, 파일 저장)
     * @param int $maxRequests 최대 요청 수
     * @param int $timeWindow 시간 윈도우(초)
     * @return bool 요청 허용 여부
     */
    public static function checkRateLimit($maxRequests = 10, $timeWindow = 60) {
        $ip = self::getClientIp();
        $rateLimitDir = dirname(__DIR__) . '/logs/rate_limit/';

        if (!is_dir($rateLimitDir)) {
            @mkdir($rateLimitDir, 0755, true);
        }

        $rateLimitFile = $rateLimitDir . md5($ip) . '.json';
        $currentTime = time();

        $data = ['requests' => [], 'blocked_until' => 0];

        if (file_exists($rateLimitFile)) {
            $data = json_decode(file_get_contents($rateLimitFile), true) ?: $data;
        }

        // 차단 상태 확인
        if ($data['blocked_until'] > $currentTime) {
            return false;
        }

        // 오래된 요청 제거
        $data['requests'] = array_filter($data['requests'], function($time) use ($currentTime, $timeWindow) {
            return ($currentTime - $time) < $timeWindow;
        });

        // 요청 수 확인
        if (count($data['requests']) >= $maxRequests) {
            // 1분 차단
            $data['blocked_until'] = $currentTime + 60;
            file_put_contents($rateLimitFile, json_encode($data));
            return false;
        }

        // 새 요청 기록
        $data['requests'][] = $currentTime;
        file_put_contents($rateLimitFile, json_encode($data));

        return true;
    }

    /**
     * 클라이언트 IP 주소 획득
     */
    public static function getClientIp() {
        $headers = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_X_FORWARDED_FOR',      // 프록시
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR'
        ];

        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ip = $_SERVER[$header];
                // 여러 IP가 있을 경우 첫 번째 IP 사용
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return '0.0.0.0';
    }

    /**
     * 이름 검증 (한글, 영문, 공백만 허용)
     */
    public static function validateName($name) {
        $name = trim($name);

        if (empty($name)) {
            return ['valid' => false, 'error' => '이름을 입력해주세요.'];
        }

        if (mb_strlen($name) < 2 || mb_strlen($name) > 50) {
            return ['valid' => false, 'error' => '이름은 2~50자 사이여야 합니다.'];
        }

        // 한글, 영문, 공백만 허용
        if (!preg_match('/^[가-힣a-zA-Z\s]+$/u', $name)) {
            return ['valid' => false, 'error' => '이름은 한글 또는 영문만 입력 가능합니다.'];
        }

        return ['valid' => true, 'value' => $name];
    }

    /**
     * 전화번호 검증 (한국 전화번호 형식)
     */
    public static function validatePhone($phone) {
        $phone = trim($phone);

        if (empty($phone)) {
            return ['valid' => false, 'error' => '전화번호를 입력해주세요.'];
        }

        // 숫자와 하이픈만 남기기
        $cleanPhone = preg_replace('/[^0-9\-]/', '', $phone);

        // 한국 전화번호 패턴 (010-1234-5678, 02-123-4567 등)
        $patterns = [
            '/^01[016789]-?\d{3,4}-?\d{4}$/',  // 휴대폰
            '/^0\d{1,2}-?\d{3,4}-?\d{4}$/'     // 일반 전화
        ];

        $isValid = false;
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $cleanPhone)) {
                $isValid = true;
                break;
            }
        }

        if (!$isValid) {
            return ['valid' => false, 'error' => '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)'];
        }

        return ['valid' => true, 'value' => $cleanPhone];
    }

    /**
     * 이메일 검증
     */
    public static function validateEmail($email) {
        $email = trim($email);

        if (empty($email)) {
            return ['valid' => false, 'error' => '이메일을 입력해주세요.'];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['valid' => false, 'error' => '올바른 이메일 형식이 아닙니다.'];
        }

        // 추가 검증: 도메인에 MX 레코드가 있는지 확인 (선택적)
        $domain = substr(strrchr($email, "@"), 1);
        if (!checkdnsrr($domain, "MX") && !checkdnsrr($domain, "A")) {
            return ['valid' => false, 'error' => '유효하지 않은 이메일 도메인입니다.'];
        }

        return ['valid' => true, 'value' => strtolower($email)];
    }

    /**
     * 텍스트 입력 살균 (XSS 방지)
     */
    public static function sanitizeText($text, $maxLength = 1000) {
        if (empty($text)) {
            return '';
        }

        // HTML 태그 제거 및 특수문자 이스케이프
        $text = strip_tags($text);
        $text = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');

        // 길이 제한
        if (mb_strlen($text) > $maxLength) {
            $text = mb_substr($text, 0, $maxLength);
        }

        return trim($text);
    }

    /**
     * 회사명 검증
     */
    public static function validateCompany($company) {
        $company = trim($company);

        if (empty($company)) {
            return ['valid' => true, 'value' => '']; // 선택 필드
        }

        if (mb_strlen($company) > 100) {
            return ['valid' => false, 'error' => '회사명은 100자 이내로 입력해주세요.'];
        }

        return ['valid' => true, 'value' => self::sanitizeText($company, 100)];
    }

    /**
     * API 응답 표준화
     */
    public static function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * 에러 응답
     */
    public static function errorResponse($message, $statusCode = 400) {
        self::jsonResponse(['success' => false, 'error' => $message], $statusCode);
    }

    /**
     * 성공 응답
     */
    public static function successResponse($data, $message = '성공') {
        self::jsonResponse(array_merge(['success' => true, 'message' => $message], $data));
    }
}
