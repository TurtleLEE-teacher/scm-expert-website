<?php
/**
 * 환경변수 기반 설정 파일
 * 보안을 위해 .env 파일에서 설정값을 로드합니다.
 */

class Config {
    private static $instance = null;
    private $config = [];
    
    private function __construct() {
        $this->loadEnvironmentConfig();
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function loadEnvironmentConfig() {
        // .env 파일 로드
        $envFile = __DIR__ . '/../.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '#') === 0) continue; // 주석 건너뛰기
                list($key, $value) = explode('=', $line, 2);
                $this->config[trim($key)] = trim($value);
            }
        }
        
        // 기본값 설정
        $this->setDefaults();
    }
    
    private function setDefaults() {
        $defaults = [
            'NOTION_API_KEY' => $_ENV['NOTION_API_KEY'] ?? 'your_notion_api_key_here',
            'NOTION_INQUIRIES_DB_ID' => '23787a19-32c4-81c5-9df9-eb0bed62f1a8',
            'NOTION_STUDENTS_DB_ID' => '23787a19-32c4-8129-9a6e-d7ed01c9424f',
            'NOTION_COURSES_DB_ID' => '23787a1932c481bba2c1d5f33256cc37',
            'NOTION_SURVEY_DB_ID' => '24987a19-32c4-81d3-815f-ee4f23b306b7', // 설문조사 DB ID - 자동 생성 완료
            'NOTION_CRM_DB_ID' => '13b7677074f041018d4c7573e1e958d4', // CRM(수요관리) DB ID
            'ENVIRONMENT' => 'production',
            'DEBUG_MODE' => 'false'
        ];
        
        foreach ($defaults as $key => $value) {
            if (!isset($this->config[$key])) {
                $this->config[$key] = $value;
            }
        }
    }
    
    public function get($key, $default = null) {
        return $this->config[$key] ?? $default;
    }
    
    public function has($key) {
        return isset($this->config[$key]);
    }
    
    public function isProduction() {
        return $this->get('ENVIRONMENT') === 'production';
    }
    
    public function isDebugMode() {
        return $this->get('DEBUG_MODE') === 'true';
    }
    
    /**
     * Notion API 설정 검증
     */
    public function validateNotionConfig() {
        $errors = [];
        
        $inquiriesDbId = $this->get('NOTION_INQUIRIES_DB_ID');
        if (!$inquiriesDbId) {
            $errors[] = 'NOTION_INQUIRIES_DB_ID가 설정되지 않았습니다.';
        }
        
        $studentsDbId = $this->get('NOTION_STUDENTS_DB_ID');
        if (!$studentsDbId) {
            $errors[] = 'NOTION_STUDENTS_DB_ID가 설정되지 않았습니다.';
        }
        
        $coursesDbId = $this->get('NOTION_COURSES_DB_ID');
        if (!$coursesDbId) {
            $errors[] = 'NOTION_COURSES_DB_ID가 설정되지 않았습니다.';
        }
        
        return $errors;
    }
    
    /**
     * 데이터베이스 설정 반환 (Notion 전용)
     */
    public function getDatabaseConfig() {
        return [
            'type' => 'notion',
            'inquiries_db_id' => $this->get('NOTION_INQUIRIES_DB_ID'),
            'students_db_id' => $this->get('NOTION_STUDENTS_DB_ID'),
            'courses_db_id' => $this->get('NOTION_COURSES_DB_ID')
        ];
    }
    
    /**
     * Notion API 설정 반환
     */
    public function getNotionConfig() {
        return [
            'inquiries_db_id' => $this->get('NOTION_INQUIRIES_DB_ID'),
            'students_db_id' => $this->get('NOTION_STUDENTS_DB_ID'),
            'courses_db_id' => $this->get('NOTION_COURSES_DB_ID')
        ];
    }
}

// 전역 함수로 쉽게 접근
function config($key = null, $default = null) {
    $config = Config::getInstance();
    if ($key === null) {
        return $config;
    }
    return $config->get($key, $default);
}

// Notion 데이터베이스 ID 상수 정의
if (!defined('INQUIRIES_DB_ID')) {
    define('INQUIRIES_DB_ID', config('NOTION_INQUIRIES_DB_ID'));
}
if (!defined('STUDENTS_DB_ID')) {
    define('STUDENTS_DB_ID', config('NOTION_STUDENTS_DB_ID'));
}
if (!defined('COURSES_DB_ID')) {
    define('COURSES_DB_ID', config('NOTION_COURSES_DB_ID'));
}