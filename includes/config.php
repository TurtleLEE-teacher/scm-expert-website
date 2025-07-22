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
            'NOTION_API_KEY' => 'secret_KaJcAIvtrwcPsFxvLXVNzzYDZ34zJb3cRLVb55K4U2f',
            'NOTION_DATABASE_ID' => 'your_database_id_here',
            'NOTION_INQUIRIES_DB_ID' => '23787a19-32c4-81c5-9df9-eb0bed62f1a8',
            'NOTION_STUDENTS_DB_ID' => '23787a19-32c4-8129-9a6e-d7ed01c9424f',
            'NOTION_COURSES_DB_ID' => '23787a1932c481bba2c1d5f33256cc37',
            'DB_TYPE' => 'notion',
            'DB_PATH' => 'database/scm_expert.db',
            'ENVIRONMENT' => 'development',
            'DEBUG_MODE' => 'false',
            'SESSION_SECRET' => 'default_session_secret_' . uniqid(),
            'ENCRYPTION_KEY' => 'default_encryption_key_' . uniqid()
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
        
        $apiKey = $this->get('NOTION_API_KEY');
        if (!$apiKey || $apiKey === 'your_notion_api_key_here') {
            $errors[] = 'NOTION_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.';
        }
        
        $databaseId = $this->get('NOTION_DATABASE_ID');
        if (!$databaseId || $databaseId === 'your_database_id_here') {
            $errors[] = 'NOTION_DATABASE_ID가 설정되지 않았습니다. .env 파일을 확인하세요.';
        }
        
        return $errors;
    }
    
    /**
     * 데이터베이스 설정 반환
     */
    public function getDatabaseConfig() {
        return [
            'type' => $this->get('DB_TYPE'),
            'path' => $this->get('DB_PATH'),
            'sqlite_path' => __DIR__ . '/../' . $this->get('DB_PATH')
        ];
    }
    
    /**
     * Notion API 설정 반환
     */
    public function getNotionConfig() {
        return [
            'api_key' => $this->get('NOTION_API_KEY'),
            'database_id' => $this->get('NOTION_DATABASE_ID')
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

// 레거시 호환성을 위한 상수 정의 (점진적 마이그레이션)
if (!defined('NOTION_API_KEY')) {
    define('NOTION_API_KEY', config('NOTION_API_KEY'));
}
if (!defined('NOTION_DATABASE_ID')) {
    define('NOTION_DATABASE_ID', config('NOTION_DATABASE_ID'));
}
if (!defined('INQUIRIES_DB_ID')) {
    define('INQUIRIES_DB_ID', config('NOTION_INQUIRIES_DB_ID'));
}
if (!defined('STUDENTS_DB_ID')) {
    define('STUDENTS_DB_ID', config('NOTION_STUDENTS_DB_ID'));
}
if (!defined('COURSES_DB_ID')) {
    define('COURSES_DB_ID', config('NOTION_COURSES_DB_ID'));
}
if (!defined('DB_PATH')) {
    define('DB_PATH', config('DB_PATH'));
}