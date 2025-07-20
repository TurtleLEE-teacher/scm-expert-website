<?php
// SQLite 지원 확인 스크립트
echo "PHP Version: " . phpversion() . "\n";
echo "SQLite 지원: " . (extension_loaded('sqlite3') ? 'YES' : 'NO') . "\n";
echo "PDO SQLite 지원: " . (extension_loaded('pdo_sqlite') ? 'YES' : 'NO') . "\n";

if (extension_loaded('sqlite3')) {
    echo "SQLite3 Version: " . SQLite3::version()['versionString'] . "\n";
}

// 간단한 테스트 데이터베이스 생성
try {
    $db = new PDO('sqlite::memory:');
    echo "SQLite 연결 테스트: SUCCESS\n";
} catch (Exception $e) {
    echo "SQLite 연결 테스트: FAILED - " . $e->getMessage() . "\n";
}
?>