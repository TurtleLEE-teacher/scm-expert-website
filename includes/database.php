<?php
/**
 * 데이터베이스 설정 및 연결 클래스
 */

class DatabaseConfig {
    private static $instance = null;
    private $pdo;
    
    private function __construct() {
        $dbPath = __DIR__ . '/../database/scm_expert.db';
        
        try {
            $this->pdo = new PDO("sqlite:{$dbPath}");
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
            // WAL 모드로 설정 (동시성 향상)
            $this->pdo->exec('PRAGMA journal_mode = WAL;');
            $this->pdo->exec('PRAGMA synchronous = NORMAL;');
            $this->pdo->exec('PRAGMA cache_size = 1000;');
            $this->pdo->exec('PRAGMA temp_store = MEMORY;');
            
        } catch (PDOException $e) {
            // 로그 파일에 오류 기록
            $logFile = __DIR__ . '/../logs/error.log';
            $timestamp = date('Y-m-d H:i:s');
            $errorMessage = "[{$timestamp}] DATABASE ERROR: " . $e->getMessage() . PHP_EOL;
            file_put_contents($logFile, $errorMessage, FILE_APPEND | LOCK_EX);
            
            throw new Exception("데이터베이스 연결 실패");
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->pdo;
    }
    
    // 연결 복제 방지
    private function __clone() {}
    private function __wakeup() {}
}

/**
 * 데이터베이스 헬퍼 클래스
 */
class DatabaseHelper {
    private $db;
    
    public function __construct() {
        $this->db = DatabaseConfig::getInstance()->getConnection();
    }
    
    /**
     * 문의 저장
     */
    public function saveInquiry($data) {
        $sql = "
            INSERT INTO inquiries 
            (name, email, phone, company, inquiry_type, course_title, message, ip_address, user_agent) 
            VALUES 
            (:name, :email, :phone, :company, :inquiry_type, :course_title, :message, :ip_address, :user_agent)
        ";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':name' => $data['name'],
            ':email' => $data['email'],
            ':phone' => $data['phone'],
            ':company' => $data['company'] ?? null,
            ':inquiry_type' => $data['inquiry_type'],
            ':course_title' => $data['course_title'] ?? null,
            ':message' => $data['message'],
            ':ip_address' => $data['ip_address'] ?? null,
            ':user_agent' => $data['user_agent'] ?? null
        ]);
    }
    
    /**
     * 문의 목록 조회
     */
    public function getInquiries($limit = 50, $offset = 0, $status = null) {
        $sql = "SELECT * FROM inquiries";
        $params = [];
        
        if ($status) {
            $sql .= " WHERE status = :status";
            $params[':status'] = $status;
        }
        
        $sql .= " ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
        
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    /**
     * 문의 상세 조회
     */
    public function getInquiry($id) {
        $sql = "SELECT * FROM inquiries WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch();
    }
    
    /**
     * 문의 상태 업데이트
     */
    public function updateInquiryStatus($id, $status) {
        $sql = "UPDATE inquiries SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':id' => $id,
            ':status' => $status
        ]);
    }
    
    /**
     * 시스템 로그 저장
     */
    public function saveLog($type, $message, $ipAddress = null, $userAgent = null) {
        $sql = "
            INSERT INTO system_logs 
            (log_type, message, ip_address, user_agent) 
            VALUES 
            (:log_type, :message, :ip_address, :user_agent)
        ";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':log_type' => $type,
            ':message' => $message,
            ':ip_address' => $ipAddress,
            ':user_agent' => $userAgent
        ]);
    }
    
    /**
     * 통계 정보 조회
     */
    public function getStatistics() {
        $stats = [];
        
        // 총 문의 수
        $stmt = $this->db->query("SELECT COUNT(*) as total FROM inquiries");
        $stats['total_inquiries'] = $stmt->fetchColumn();
        
        // 새로운 문의 수
        $stmt = $this->db->query("SELECT COUNT(*) as new FROM inquiries WHERE status = 'new'");
        $stats['new_inquiries'] = $stmt->fetchColumn();
        
        // 오늘 문의 수
        $stmt = $this->db->query("SELECT COUNT(*) as today FROM inquiries WHERE DATE(created_at) = DATE('now')");
        $stats['today_inquiries'] = $stmt->fetchColumn();
        
        // 이번 주 문의 수
        $stmt = $this->db->query("SELECT COUNT(*) as week FROM inquiries WHERE created_at >= date('now', 'weekday 0', '-7 days')");
        $stats['week_inquiries'] = $stmt->fetchColumn();
        
        return $stats;
    }
}
?>