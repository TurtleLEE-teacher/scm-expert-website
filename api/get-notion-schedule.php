<?php
// ?�러 ?�시 ?�정 (?�버깅용)
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// ?�정 ?�일 로드
$config_file = __DIR__ . '/notion-config.php';
if (!file_exists($config_file)) {
    die(json_encode(['success' => false, 'error' => 'Config file not found: ' . $config_file]));
}
require_once $config_file;

// ?�션 API ?�정
$notion_api_key = defined('NOTION_API_KEY') ? NOTION_API_KEY : null;
$database_id = '90504dff75564d87869867326c6a5743';

// API ???�인
if (!$notion_api_key || $notion_api_key === 'secret_KaJcAIvtrwcPsFxvLXVNzzYDZ34zJb3cRLVb55K4U2f') {
    die(json_encode(['success' => false, 'error' => 'Notion API key not configured']));
}

// ?�션 API ?�출 ?�수
function getNotionData($database_id, $api_key) {
    $url = "https://api.notion.com/v1/databases/{$database_id}/query";
    
    $headers = [
        'Authorization: Bearer ' . $api_key,
        'Content-Type: application/json',
        'Notion-Version: 2022-06-28'
    ];
    
    // ?�버�? ?�청 ?�보 로그
    error_log("Notion API URL: " . $url);
    error_log("API Key (first 10 chars): " . substr($api_key, 0, 10) . "...");
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([]));
    
    // SSL 검�?(개발 ?�경?�서�?
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        return ['error' => 'CURL Error: ' . $error];
    }
    
    if ($http_code !== 200) {
        return ['error' => 'HTTP Error: ' . $http_code, 'response' => $response];
    }
    
    return json_decode($response, true);
}

// ?�이???�맷???�수
function formatNotionData($notion_response) {
    if (isset($notion_response['error'])) {
        return $notion_response;
    }
    
    $formatted_data = [];
    
    if (isset($notion_response['results'])) {
        foreach ($notion_response['results'] as $item) {
            $properties = $item['properties'];
            
            // ?�짜 추출
            $date = null;
            if (isset($properties['캠프 ?�짜']['date']['start'])) {
                $date = $properties['캠프 ?�짜']['date']['start'];
            }
            
            // ?�름 추출
            $name = '';
            if (isset($properties['?�름']['title'][0]['plain_text'])) {
                $name = $properties['?�름']['title'][0]['plain_text'];
            }
            
            // ?�그 추출
            $tags = [];
            if (isset($properties['?�그']['multi_select'])) {
                foreach ($properties['?�그']['multi_select'] as $tag) {
                    $tags[] = $tag['name'];
                }
            }
            
            // ?�태 추출
            $status = '';
            if (isset($properties['진행 ?�태']['formula']['string'])) {
                $status = $properties['진행 ?�태']['formula']['string'];
            }
            
            // 기수 ?�단 (?�짜 기반)
            $batch = '';
            if ($date) {
                $month = date('n', strtotime($date));
                if ($month == 5) $batch = '3�?;
                elseif ($month == 8) $batch = '4�?;
                elseif ($month == 9) $batch = '5�?;
            }
            
            $formatted_data[] = [
                'name' => $name,
                'date' => $date,
                'tags' => $tags,
                'status' => $status,
                'batch' => $batch
            ];
        }
    }
    
    // ?�짜???�렬
    usort($formatted_data, function($a, $b) {
        return strtotime($a['date']) - strtotime($b['date']);
    });
    
    return $formatted_data;
}

// 메인 ?�행
try {
    // ?�제 ?�션 ?�이??가?�오�?    if ($notion_api_key && $notion_api_key !== 'secret_KaJcAIvtrwcPsFxvLXVNzzYDZ34zJb3cRLVb55K4U2f') {
        // ?�제 ?�션 API ?�출
        $notion_response = getNotionData($database_id, $notion_api_key);
        
        // ?�러 체크
        if (isset($notion_response['error'])) {
            // ?�세???�러 ?�보 반환
            echo json_encode([
                'success' => false, 
                'error' => $notion_response['error'],
                'details' => isset($notion_response['response']) ? json_decode($notion_response['response'], true) : null,
                'database_id' => $database_id
            ]);
            exit;
        }
        
        $formatted_data = formatNotionData($notion_response);
        echo json_encode(['success' => true, 'data' => $formatted_data, 'source' => 'notion']);
    } else {
        // ?��? ?�이??반환 (?�스?�용)
        $dummy_data = [
            // 3�?- ?�료
            [
                'name' => '1주차',
                'date' => '2025-05-06',
                'tags' => ['1주차: SCM(ERP) Overview', '과제: SCM ?�로?�스 ?�식'],
                'status' => '?�종�?,
                'batch' => '3�?
            ],
            [
                'name' => '2주차',
                'date' => '2025-05-16',
                'tags' => ['2주차: SCM ?�슈 분석', '과제: SCM ?�슈 분석 ?�출'],
                'status' => '?�종�?,
                'batch' => '3�?
            ],
            [
                'name' => '3주차',
                'date' => '2025-05-23',
                'tags' => ['3주차: 발표 �?SCP', '과제: ?�동 ?�익계산??],
                'status' => '?�종�?,
                'batch' => '3�?
            ],
            [
                'name' => '4주차',
                'date' => '2025-05-30',
                'tags' => ['4주차: SCM PI', '과제: SCM PI 보고??],
                'status' => '?�종�?,
                'batch' => '3�?
            ],
            [
                'name' => '5주차',
                'date' => '2025-06-06',
                'tags' => ['5주차: 발표 �?SCE'],
                'status' => '?�종�?,
                'batch' => '3�?
            ],
            // 4�?- 모집�?            [
                'name' => '1주차',
                'date' => '2025-08-01',
                'tags' => ['1주차: SCM(ERP) Overview', '과제: SCM ?�로?�스 ?�식??],
                'status' => '모집�?,
                'batch' => '4�?
            ],
            [
                'name' => '2주차',
                'date' => '2025-08-08',
                'tags' => ['2주차: SCM ?�슈 분석', '과제: ?�고 분석'],
                'status' => '모집�?,
                'batch' => '4�?
            ],
            [
                'name' => '3주차',
                'date' => '2025-08-15',
                'tags' => ['3주차: SCP', '과제: MRP 계산'],
                'status' => '모집�?,
                'batch' => '4�?
            ],
            [
                'name' => '4주차',
                'date' => '2025-08-22',
                'tags' => ['4주차: SCM-?�무 Integration', '과제: OTD 개선??],
                'status' => '모집�?,
                'batch' => '4�?
            ],
            [
                'name' => '5주차',
                'date' => '2025-08-29',
                'tags' => ['5주차: 최종 발표', '최종 ?�로?�트 발표'],
                'status' => '모집�?,
                'batch' => '4�?
            ],
            // 5�?- ?�정
            [
                'name' => '1주차',
                'date' => '2025-09-05',
                'tags' => ['1주차: SCM(ERP) Overview', '과제: SCM ?�로?�스 ?�식??],
                'status' => '?�정',
                'batch' => '5�?
            ],
            [
                'name' => '2주차',
                'date' => '2025-09-12',
                'tags' => ['2주차: SCM ?�슈 분석', '과제: ?�고 분석'],
                'status' => '?�정',
                'batch' => '5�?
            ],
            [
                'name' => '3주차',
                'date' => '2025-09-19',
                'tags' => ['3주차: SCP', '과제: MRP 계산'],
                'status' => '?�정',
                'batch' => '5�?
            ],
            [
                'name' => '4주차',
                'date' => '2025-09-26',
                'tags' => ['4주차: SCM-?�무 Integration', '과제: OTD 개선??],
                'status' => '?�정',
                'batch' => '5�?
            ],
            [
                'name' => '5주차',
                'date' => '2025-10-10',
                'tags' => ['5주차: 최종 발표', '최종 ?�로?�트 발표'],
                'status' => '?�정',
                'batch' => '5�?
            ]
        ];
        echo json_encode(['success' => true, 'data' => $dummy_data]);
    } else {
        // ?�제 ?�션 API ?�출
        $notion_response = getNotionData($database_id, $notion_api_key);
        $formatted_data = formatNotionData($notion_response);
        echo json_encode(['success' => true, 'data' => $formatted_data]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
