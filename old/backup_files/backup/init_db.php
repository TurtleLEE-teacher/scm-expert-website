<?php
/**
 * SCM Expert 데이터베이스 초기화 스크립트
 * SQLite 데이터베이스 생성 및 테이블 구조 설정
 */

// 데이터베이스 파일 경로
$dbPath = '../database/scm_expert.db';

// database 디렉토리가 없으면 생성
$dbDir = dirname($dbPath);
if (!is_dir($dbDir)) {
    mkdir($dbDir, 0755, true);
    echo "데이터베이스 디렉토리 생성: {$dbDir}\n";
}

try {
    // SQLite 데이터베이스 연결
    $pdo = new PDO("sqlite:{$dbPath}");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "SQLite 데이터베이스 연결 성공: {$dbPath}\n";
    
    // 문의(inquiries) 테이블 생성
    $createInquiriesTable = "
        CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            company TEXT,
            inquiry_type TEXT NOT NULL,
            course_title TEXT,
            message TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            status TEXT DEFAULT 'new',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ";
    
    $pdo->exec($createInquiriesTable);
    echo "문의(inquiries) 테이블 생성 완료\n";
    
    // 관리자(admins) 테이블 생성 (향후 관리자 페이지용)
    $createAdminsTable = "
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            last_login DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ";
    
    $pdo->exec($createAdminsTable);
    echo "관리자(admins) 테이블 생성 완료\n";
    
    // 기본 관리자 계정 생성 (비밀번호: admin123)
    $defaultAdminCheck = $pdo->query("SELECT COUNT(*) FROM admins")->fetchColumn();
    if ($defaultAdminCheck == 0) {
        $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $insertAdmin = "
            INSERT INTO admins (username, password, email, role) 
            VALUES ('admin', :password, 'ahfifa88@gmail.com', 'super_admin')
        ";
        $stmt = $pdo->prepare($insertAdmin);
        $stmt->bindParam(':password', $adminPassword);
        $stmt->execute();
        echo "기본 관리자 계정 생성 완료 (아이디: admin, 비밀번호: admin123)\n";
    }
    
    // 강의 예약(course_reservations) 테이블 생성 (향후 확장용)
    $createReservationsTable = "
        CREATE TABLE IF NOT EXISTS course_reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inquiry_id INTEGER,
            course_type TEXT NOT NULL,
            preferred_start_date DATE,
            participants_count INTEGER DEFAULT 1,
            special_requirements TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (inquiry_id) REFERENCES inquiries(id)
        )
    ";
    
    $pdo->exec($createReservationsTable);
    echo "강의 예약(course_reservations) 테이블 생성 완료\n";
    
    // 시스템 로그(system_logs) 테이블 생성
    $createLogsTable = "
        CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            log_type TEXT NOT NULL,
            message TEXT NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ";
    
    $pdo->exec($createLogsTable);
    echo "시스템 로그(system_logs) 테이블 생성 완료\n";
    
    // 인덱스 생성 (성능 최적화)
    $indexes = [
        "CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email)",
        "CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status)",
        "CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at)",
        "CREATE INDEX IF NOT EXISTS idx_logs_type ON system_logs(log_type)",
        "CREATE INDEX IF NOT EXISTS idx_logs_created ON system_logs(created_at)"
    ];
    
    foreach ($indexes as $indexSql) {
        $pdo->exec($indexSql);
    }
    echo "데이터베이스 인덱스 생성 완료\n";
    
    echo "\n=== 데이터베이스 초기화 완료 ===\n";
    echo "데이터베이스 파일: {$dbPath}\n";
    echo "관리자 계정: admin / admin123\n";
    echo "이메일: ahfifa88@gmail.com\n";
    
} catch (PDOException $e) {
    echo "데이터베이스 오류: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "일반 오류: " . $e->getMessage() . "\n";
    exit(1);
}
?>