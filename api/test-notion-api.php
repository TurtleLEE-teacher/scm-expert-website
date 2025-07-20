<?php
// 에러 표시 설정
error_reporting(E_ALL);
ini_set('display_errors', 1);

// HTML 헤더
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>노션 API 연결 테스트</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        .test-section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
        .success { color: green; }
        .error { color: red; }
        .info { color: blue; }
        pre { background: #333; color: #fff; padding: 10px; border-radius: 5px; overflow-x: auto; }
        code { background: #e9e9e9; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>노션 API 연결 테스트</h1>
        
        <?php
        // 1. 설정 파일 확인
        echo '<div class="test-section">';
        echo '<h2>1. 설정 파일 확인</h2>';
        
        $config_file = __DIR__ . '/notion-config.php';
        if (file_exists($config_file)) {
            echo '<p class="success">✓ notion-config.php 파일이 존재합니다.</p>';
            require_once $config_file;
            
            if (defined('NOTION_API_KEY')) {
                $api_key = NOTION_API_KEY;
                if ($api_key && $api_key !== 'YOUR_NOTION_API_KEY_HERE') {
                    echo '<p class="success">✓ API 키가 설정되었습니다.</p>';
                    echo '<p class="info">API 키 시작 부분: <code>' . substr($api_key, 0, 15) . '...</code></p>';
                } else {
                    echo '<p class="error">✗ API 키가 설정되지 않았습니다.</p>';
                }
            } else {
                echo '<p class="error">✗ NOTION_API_KEY가 정의되지 않았습니다.</p>';
            }
        } else {
            echo '<p class="error">✗ notion-config.php 파일을 찾을 수 없습니다.</p>';
        }
        echo '</div>';
        
        // 2. CURL 확인
        echo '<div class="test-section">';
        echo '<h2>2. CURL 지원 확인</h2>';
        if (function_exists('curl_init')) {
            echo '<p class="success">✓ CURL이 활성화되어 있습니다.</p>';
        } else {
            echo '<p class="error">✗ CURL이 비활성화되어 있습니다. PHP 설정을 확인하세요.</p>';
        }
        echo '</div>';
        
        // 3. 노션 API 테스트
        if (isset($api_key) && $api_key && $api_key !== 'YOUR_NOTION_API_KEY_HERE') {
            echo '<div class="test-section">';
            echo '<h2>3. 노션 API 연결 테스트</h2>';
            
            $database_id = '90504dff75564d87869867326c6a5743';
            $url = "https://api.notion.com/v1/databases/{$database_id}/query";
            
            echo '<p class="info">요청 URL: <code>' . $url . '</code></p>';
            
            $headers = [
                'Authorization: Bearer ' . $api_key,
                'Content-Type: application/json',
                'Notion-Version: 2022-06-28'
            ];
            
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([]));
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);
            
            echo '<p class="info">HTTP 응답 코드: <code>' . $http_code . '</code></p>';
            
            if ($error) {
                echo '<p class="error">✗ CURL 에러: ' . $error . '</p>';
            } else {
                if ($http_code === 200) {
                    echo '<p class="success">✓ 노션 API 연결 성공!</p>';
                    
                    $data = json_decode($response, true);
                    if (isset($data['results'])) {
                        echo '<p class="success">✓ 데이터베이스에서 ' . count($data['results']) . '개의 항목을 가져왔습니다.</p>';
                        
                        echo '<h3>첫 번째 항목 예시:</h3>';
                        if (count($data['results']) > 0) {
                            $first_item = $data['results'][0];
                            echo '<pre>' . json_encode($first_item['properties'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . '</pre>';
                        }
                    }
                } else {
                    echo '<p class="error">✗ HTTP 에러 ' . $http_code . '</p>';
                    $error_data = json_decode($response, true);
                    echo '<h3>에러 응답:</h3>';
                    echo '<pre>' . json_encode($error_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . '</pre>';
                    
                    // 일반적인 에러 해결 방법
                    if ($http_code === 401) {
                        echo '<p class="error">인증 실패: API 키를 확인하세요.</p>';
                    } elseif ($http_code === 404) {
                        echo '<p class="error">데이터베이스를 찾을 수 없습니다. 다음을 확인하세요:</p>';
                        echo '<ul>';
                        echo '<li>데이터베이스 ID가 정확한지 확인</li>';
                        echo '<li>노션에서 Integration을 데이터베이스에 초대했는지 확인</li>';
                        echo '</ul>';
                    }
                }
            }
            echo '</div>';
        }
        
        // 4. 해결 방법
        echo '<div class="test-section">';
        echo '<h2>문제 해결 방법</h2>';
        echo '<ol>';
        echo '<li><strong>노션 Integration 생성:</strong>';
        echo '<ul>';
        echo '<li><a href="https://www.notion.so/my-integrations" target="_blank">https://www.notion.so/my-integrations</a> 접속</li>';
        echo '<li>"New integration" 클릭</li>';
        echo '<li>이름 입력 후 생성</li>';
        echo '<li>Internal Integration Token 복사</li>';
        echo '</ul></li>';
        
        echo '<li><strong>API 키 설정:</strong>';
        echo '<ul>';
        echo '<li><code>api/notion-config.php</code> 파일 열기</li>';
        echo '<li><code>YOUR_NOTION_API_KEY_HERE</code>를 실제 토큰으로 교체</li>';
        echo '</ul></li>';
        
        echo '<li><strong>데이터베이스 공유:</strong>';
        echo '<ul>';
        echo '<li>노션에서 데이터베이스 페이지 열기</li>';
        echo '<li>우측 상단 "Share" 클릭</li>';
        echo '<li>Integration 이름 검색하여 초대</li>';
        echo '</ul></li>';
        echo '</ol>';
        echo '</div>';
        ?>
    </div>
</body>
</html>
