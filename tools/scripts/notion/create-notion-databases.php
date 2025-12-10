<?php
/**
 * Notion 데이터베이스 생성 스크립트
 * SCM 웹사이트용 3개 데이터베이스를 Notion에 생성합니다.
 */

require_once 'includes/notion-migration.php';

// Notion API 설정
require_once 'includes/config.php';
$notion_api_key = config('NOTION_API_KEY');
$parent_page_id = null; // 메인 페이지 ID (수동으로 입력 필요)

echo "🚀 SCM 웹사이트 Notion 데이터베이스 생성을 시작합니다...\n\n";

$migration = new NotionMigration();

// 1. 문의사항 데이터베이스 생성
echo "📋 1단계: 문의사항 데이터베이스 생성\n";
$inquiries_structure = $migration->getInquiriesStructure();

$inquiries_data = [
    'parent' => [
        'type' => 'page_id',
        'page_id' => $parent_page_id ?? 'new_page'
    ],
    'title' => [
        [
            'type' => 'text',
            'text' => [
                'content' => $inquiries_structure['title']
            ]
        ]
    ],
    'properties' => []
];

// 속성 변환
foreach ($inquiries_structure['properties'] as $name => $config) {
    $property = ['type' => $config['type']];
    
    if ($config['type'] === 'select' && isset($config['options'])) {
        $property['select'] = [
            'options' => $config['options']
        ];
    }
    
    $inquiries_data['properties'][$name] = $property;
}

echo "구조 정의 완료: " . count($inquiries_structure['properties']) . "개 속성\n";

// 2. 수강생 데이터베이스 생성
echo "\n👥 2단계: 수강생 관리 데이터베이스 생성\n";
$students_structure = $migration->getStudentsStructure();

$students_data = [
    'parent' => [
        'type' => 'page_id',
        'page_id' => $parent_page_id ?? 'new_page'
    ],
    'title' => [
        [
            'type' => 'text',
            'text' => [
                'content' => $students_structure['title']
            ]
        ]
    ],
    'properties' => []
];

foreach ($students_structure['properties'] as $name => $config) {
    $property = ['type' => $config['type']];
    
    if ($config['type'] === 'select' && isset($config['options'])) {
        $property['select'] = [
            'options' => $config['options']
        ];
    } elseif ($config['type'] === 'number' && isset($config['format'])) {
        $property['number'] = [
            'format' => $config['format']
        ];
    }
    
    $students_data['properties'][$name] = $property;
}

echo "구조 정의 완료: " . count($students_structure['properties']) . "개 속성\n";

// 3. 강의 데이터베이스 생성
echo "\n📚 3단계: 강의 관리 데이터베이스 생성\n";
$courses_structure = $migration->getCoursesStructure();

$courses_data = [
    'parent' => [
        'type' => 'page_id',
        'page_id' => $parent_page_id ?? 'new_page'
    ],
    'title' => [
        [
            'type' => 'text',
            'text' => [
                'content' => $courses_structure['title']
            ]
        ]
    ],
    'properties' => []
];

foreach ($courses_structure['properties'] as $name => $config) {
    $property = ['type' => $config['type']];
    
    if ($config['type'] === 'select' && isset($config['options'])) {
        $property['select'] = [
            'options' => $config['options']
        ];
    } elseif ($config['type'] === 'number' && isset($config['format'])) {
        $property['number'] = [
            'format' => $config['format']
        ];
    }
    
    $courses_data['properties'][$name] = $property;
}

echo "구조 정의 완료: " . count($courses_structure['properties']) . "개 속성\n";

echo "\n" . str_repeat("=", 70) . "\n";
echo "✅ 모든 데이터베이스 구조가 준비되었습니다!\n\n";

echo "📌 다음 단계로 진행:\n";
echo "1. Notion에서 'SCM 웹사이트 관리' 페이지 생성\n";
echo "2. 각 데이터베이스를 페이지 내에서 생성\n";
echo "3. 생성된 데이터베이스 ID를 config.php에 설정\n\n";

// JSON 형태로 구조 출력 (Notion API 호출용)
echo "🔧 Notion API 생성 데이터:\n";
echo "========================\n";
echo "\n## 문의사항 데이터베이스:\n";
echo json_encode($inquiries_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

echo "\n\n## 수강생 데이터베이스:\n";
echo json_encode($students_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

echo "\n\n## 강의 데이터베이스:\n";
echo json_encode($courses_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

?>