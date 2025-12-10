<?php
/**
 * Notion 데이터베이스 자동 생성 도구
 * Notion MCP를 통해 실제 데이터베이스를 생성합니다.
 */

require_once '../includes/notion-migration.php';

class NotionDatabaseCreator {
    private $migration;
    
    public function __construct() {
        $this->migration = new NotionMigration();
    }
    
    /**
     * 실제 Notion 데이터베이스 생성 실행
     */
    public function createAllDatabases() {
        echo "🚀 SCM 웹사이트용 Notion 데이터베이스 생성을 시작합니다...\n\n";
        
        // 1. 문의사항 데이터베이스 생성
        echo "📋 1단계: 문의사항 데이터베이스 생성 중...\n";
        $inquiriesStructure = $this->migration->getInquiriesStructure();
        $this->printDatabaseStructure('문의사항', $inquiriesStructure);
        
        // 2. 수강생 데이터베이스 생성
        echo "\n👥 2단계: 수강생 관리 데이터베이스 생성 중...\n";
        $studentsStructure = $this->migration->getStudentsStructure();
        $this->printDatabaseStructure('수강생', $studentsStructure);
        
        // 3. 강의 데이터베이스 생성
        echo "\n📚 3단계: 강의 관리 데이터베이스 생성 중...\n";
        $coursesStructure = $this->migration->getCoursesStructure();
        $this->printDatabaseStructure('강의', $coursesStructure);
        
        echo "\n" . str_repeat("=", 70) . "\n";
        echo "✅ 모든 데이터베이스 구조 정의가 완료되었습니다!\n\n";
        
        echo "📌 다음 단계:\n";
        echo "1. Claude Code에서 Notion MCP를 사용하여 실제 데이터베이스를 생성\n";
        echo "2. 생성된 데이터베이스 ID를 config.php에 설정\n";
        echo "3. 웹 폼 테스트로 연동 확인\n\n";
        
        return [
            'inquiries' => $inquiriesStructure,
            'students' => $studentsStructure,
            'courses' => $coursesStructure
        ];
    }
    
    /**
     * 데이터베이스 구조 출력
     */
    private function printDatabaseStructure($name, $structure) {
        echo "📊 {$structure['title']}\n";
        echo str_repeat("-", 50) . "\n";
        
        foreach ($structure['properties'] as $propName => $config) {
            $type = $config['type'];
            $extra = '';
            
            if ($type === 'select' && isset($config['options'])) {
                $options = array_map(function($opt) { return $opt['name']; }, $config['options']);
                $extra = ' (' . implode(', ', array_slice($options, 0, 3)) . 
                        (count($options) > 3 ? '...' : '') . ')';
            }
            
            echo "  • {$propName}: {$type}{$extra}\n";
        }
        echo "\n";
    }
    
    /**
     * Notion MCP 명령어 생성
     */
    public function generateNotionCommands($structures) {
        echo "🔧 Notion MCP 명령어 생성 중...\n\n";
        
        $commands = [];
        
        foreach ($structures as $type => $structure) {
            $commands[] = $this->generateCreateDatabaseCommand($type, $structure);
        }
        
        echo "📝 생성된 명령어들:\n";
        foreach ($commands as $i => $cmd) {
            echo "\n" . ($i + 1) . ". " . $cmd . "\n";
        }
        
        return $commands;
    }
    
    /**
     * 데이터베이스 생성 명령어 생성
     */
    private function generateCreateDatabaseCommand($type, $structure) {
        return "notion_create_database('{$structure['title']}', properties)";
    }
}

// CLI 실행
if (php_sapi_name() === 'cli') {
    $creator = new NotionDatabaseCreator();
    $structures = $creator->createAllDatabases();
    $creator->generateNotionCommands($structures);
} else {
    echo "이 스크립트는 CLI에서만 실행할 수 있습니다.";
}
?>