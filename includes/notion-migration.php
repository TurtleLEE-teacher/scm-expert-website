<?php
/**
 * Notion 마이그레이션 도구
 * SQL 데이터베이스에서 Notion으로 마이그레이션
 */

require_once 'config.php';

class NotionMigration {
    private $config;
    
    public function __construct() {
        $this->config = include 'config.php';
    }
    
    /**
     * Notion 데이터베이스 구조 생성 (Notion MCP 사용)
     */
    public function createDatabaseStructure() {
        echo "🚀 Notion 데이터베이스 구조 생성 시작...\n\n";
        
        // MCP를 통해 Notion 데이터베이스 생성
        echo "ℹ️  Notion MCP를 사용하여 데이터베이스를 생성합니다.\n";
        echo "📋 생성할 데이터베이스:\n";
        echo "   1. 문의사항 데이터베이스\n";
        echo "   2. 수강생 관리 데이터베이스\n";
        echo "   3. 강의 관리 데이터베이스\n\n";
        
        return [
            'inquiries_structure' => $this->getInquiriesStructure(),
            'students_structure' => $this->getStudentsStructure(),
            'courses_structure' => $this->getCoursesStructure()
        ];
    }
    
    /**
     * 문의사항 데이터베이스 구조
     */
    public function getInquiriesStructure() {
        return [
            'title' => 'SCM 웹사이트 문의사항',
            'properties' => [
                '이름' => [
                    'type' => 'title'
                ],
                '이메일' => [
                    'type' => 'email'
                ],
                '전화번호' => [
                    'type' => 'phone_number'
                ],
                '회사명' => [
                    'type' => 'rich_text'
                ],
                '문의유형' => [
                    'type' => 'select',
                    'options' => [
                        ['name' => 'SCM 기초 강의', 'color' => 'blue'],
                        ['name' => '커리어 컨설팅', 'color' => 'green'],
                        ['name' => '일반 문의', 'color' => 'gray'],
                        ['name' => '기타', 'color' => 'yellow']
                    ]
                ],
                '문의내용' => [
                    'type' => 'rich_text'
                ],
                '상태' => [
                    'type' => 'select',
                    'options' => [
                        ['name' => '새 문의', 'color' => 'yellow'],
                        ['name' => '처리중', 'color' => 'blue'],
                        ['name' => '답변완료', 'color' => 'green'],
                        ['name' => '보류', 'color' => 'red']
                    ]
                ],
                '접수일' => [
                    'type' => 'created_time'
                ],
                '최종수정일' => [
                    'type' => 'last_edited_time'
                ],
                'IP주소' => [
                    'type' => 'rich_text'
                ],
                '답변내용' => [
                    'type' => 'rich_text'
                ],
                '우선순위' => [
                    'type' => 'select',
                    'options' => [
                        ['name' => '높음', 'color' => 'red'],
                        ['name' => '보통', 'color' => 'yellow'],
                        ['name' => '낮음', 'color' => 'green']
                    ]
                ]
            ]
        ];
    }
    
    /**
     * 수강생 데이터베이스 구조
     */
    public function getStudentsStructure() {
        return [
            'title' => 'SCM 수강생 관리',
            'properties' => [
                '이름' => [
                    'type' => 'title'
                ],
                '이메일' => [
                    'type' => 'email'
                ],
                '전화번호' => [
                    'type' => 'phone_number'
                ],
                '회사명' => [
                    'type' => 'rich_text'
                ],
                '직책' => [
                    'type' => 'rich_text'
                ],
                '등록일' => [
                    'type' => 'date'
                ],
                '결제상태' => [
                    'type' => 'select',
                    'options' => [
                        ['name' => '결제대기', 'color' => 'yellow'],
                        ['name' => '결제완료', 'color' => 'green'],
                        ['name' => '환불', 'color' => 'red'],
                        ['name' => '부분환불', 'color' => 'orange']
                    ]
                ],
                '결제금액' => [
                    'type' => 'number',
                    'format' => 'won'
                ],
                '수강강의' => [
                    'type' => 'rich_text'
                ],
                '진도율' => [
                    'type' => 'number',
                    'format' => 'percent'
                ],
                '수료여부' => [
                    'type' => 'checkbox'
                ],
                '만족도' => [
                    'type' => 'select',
                    'options' => [
                        ['name' => '매우만족', 'color' => 'green'],
                        ['name' => '만족', 'color' => 'blue'],
                        ['name' => '보통', 'color' => 'yellow'],
                        ['name' => '불만족', 'color' => 'red']
                    ]
                ],
                '특이사항' => [
                    'type' => 'rich_text'
                ],
                '최종접속일' => [
                    'type' => 'date'
                ]
            ]
        ];
    }
    
    /**
     * 강의 데이터베이스 구조
     */
    public function getCoursesStructure() {
        return [
            'title' => 'SCM 강의 관리',
            'properties' => [
                '강의명' => [
                    'type' => 'title'
                ],
                '카테고리' => [
                    'type' => 'select',
                    'options' => [
                        ['name' => 'SCM 기초', 'color' => 'blue'],
                        ['name' => 'SAP ERP', 'color' => 'green'],
                        ['name' => '컨설팅 도구', 'color' => 'purple'],
                        ['name' => '커리어 개발', 'color' => 'orange'],
                        ['name' => '실무 프로젝트', 'color' => 'red']
                    ]
                ],
                '난이도' => [
                    'type' => 'select',
                    'options' => [
                        ['name' => '초급', 'color' => 'green'],
                        ['name' => '중급', 'color' => 'yellow'],
                        ['name' => '고급', 'color' => 'red'],
                        ['name' => '전문가', 'color' => 'purple']
                    ]
                ],
                '가격' => [
                    'type' => 'number',
                    'format' => 'won'
                ],
                '할인가격' => [
                    'type' => 'number',
                    'format' => 'won'
                ],
                '강의시간' => [
                    'type' => 'rich_text'
                ],
                '강의설명' => [
                    'type' => 'rich_text'
                ],
                '상태' => [
                    'type' => 'select',
                    'options' => [
                        ['name' => '준비중', 'color' => 'yellow'],
                        ['name' => '모집중', 'color' => 'green'],
                        ['name' => '진행중', 'color' => 'blue'],
                        ['name' => '종료', 'color' => 'gray'],
                        ['name' => '일시중단', 'color' => 'red']
                    ]
                ],
                '개강일' => [
                    'type' => 'date'
                ],
                '종료일' => [
                    'type' => 'date'
                ],
                '최대인원' => [
                    'type' => 'number'
                ],
                '현재등록인원' => [
                    'type' => 'number'
                ],
                '강의자료URL' => [
                    'type' => 'url'
                ],
                'Zoom링크' => [
                    'type' => 'url'
                ],
                '커리큘럼' => [
                    'type' => 'rich_text'
                ],
                '선수조건' => [
                    'type' => 'rich_text'
                ],
                '수료혜택' => [
                    'type' => 'rich_text'
                ]
            ]
        ];
    }
    
    /**
     * 설정 파일에 데이터베이스 ID 저장
     */
    public function saveDbId($type, $id) {
        $configPath = __DIR__ . '/config.php';
        $config = include $configPath;
        $config['notion_' . $type . '_db_id'] = $id;
        
        $configContent = "<?php\nreturn " . var_export($config, true) . ";\n?>";
        file_put_contents($configPath, $configContent);
        
        echo "✅ {$type} 데이터베이스 ID 저장: {$id}\n";
    }
}

// CLI에서 실행 시
if (php_sapi_name() === 'cli') {
    $migration = new NotionMigration();
    $structure = $migration->createDatabaseStructure();
    
    echo "📋 데이터베이스 구조 정의 완료!\n\n";
    echo "다음 단계: Claude Code에서 Notion MCP를 사용하여 실제 데이터베이스를 생성하세요.\n";
    
    // 구조 출력
    foreach ($structure as $type => $data) {
        echo "\n" . str_repeat("=", 50) . "\n";
        echo "📊 " . $data['title'] . "\n";
        echo str_repeat("=", 50) . "\n";
        
        foreach ($data['properties'] as $prop => $config) {
            echo "• {$prop}: {$config['type']}\n";
        }
    }
}
?>