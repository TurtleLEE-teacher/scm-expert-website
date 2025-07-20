<?php
// 간단한 노션 API 테스트
$api_key = 'secret_KaJcAIvtrwcPsFxvLXVNzzYDZ34zJb3cRLVb55K4U2f';
$database_id = '90504dff75564d87869867326c6a5743';

echo "노션 API 테스트 시작...\n\n";

// 1. 데이터베이스 정보 가져오기
$url = "https://api.notion.com/v1/databases/{$database_id}";
$headers = [
    'Authorization: Bearer ' . $api_key,
    'Notion-Version: 2022-06-28'
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "1. 데이터베이스 조회 결과:\n";
echo "   HTTP 코드: $http_code\n";

if ($http_code === 200) {
    echo "   ✓ 성공!\n";
    $data = json_decode($response, true);
    echo "   데이터베이스 제목: " . ($data['title'][0]['plain_text'] ?? '제목 없음') . "\n";
} else {
    echo "   ✗ 실패\n";
    $error = json_decode($response, true);
    echo "   에러: " . json_encode($error, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
}

echo "\n2. 데이터베이스 쿼리 테스트:\n";

// 2. 데이터베이스 쿼리
$url = "https://api.notion.com/v1/databases/{$database_id}/query";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge($headers, ['Content-Type: application/json']));
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([]));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "   HTTP 코드: $http_code\n";

if ($http_code === 200) {
    echo "   ✓ 성공!\n";
    $data = json_decode($response, true);
    echo "   항목 수: " . count($data['results']) . "\n";
    
    if (count($data['results']) > 0) {
        echo "\n   첫 번째 항목:\n";
        $first = $data['results'][0];
        echo "   - ID: " . $first['id'] . "\n";
        if (isset($first['properties']['이름']['title'][0]['plain_text'])) {
            echo "   - 이름: " . $first['properties']['이름']['title'][0]['plain_text'] . "\n";
        }
        if (isset($first['properties']['캠프 날짜']['date']['start'])) {
            echo "   - 날짜: " . $first['properties']['캠프 날짜']['date']['start'] . "\n";
        }
    }
} else {
    echo "   ✗ 실패\n";
    $error = json_decode($response, true);
    echo "   에러: " . json_encode($error, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
}

echo "\n\n해결 방법:\n";
echo "1. 노션에서 Integration 생성: https://www.notion.so/my-integrations\n";
echo "2. 데이터베이스 페이지에서 Share > Integration 초대\n";
echo "3. API 키가 올바른지 확인\n";
?>
