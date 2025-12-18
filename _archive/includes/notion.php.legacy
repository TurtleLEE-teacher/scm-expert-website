<?php
/**
 * Notion API 연동 클래스
 * 노션 데이터베이스를 활용한 고객관리 시스템
 */

class NotionAPI {
    private $apiKey;
    private $databaseId;
    private $baseUrl = 'https://api.notion.com/v1';
    private $version = '2022-06-28';
    
    public function __construct($apiKey = null, $databaseId = null) {
        $this->apiKey = $apiKey ?: $this->getConfigValue('NOTION_API_KEY');
        $this->databaseId = $databaseId ?: $this->getConfigValue('NOTION_DATABASE_ID');
        
        if (!$this->apiKey || !$this->databaseId) {
            $this->logError('Notion API 설정이 필요합니다. config.php 파일을 확인하세요.');
        }
    }
    
    /**
     * 설정 값 가져오기
     */
    private function getConfigValue($key) {
        $configFile = __DIR__ . '/../config.php';
        if (file_exists($configFile)) {
            include $configFile;
            return defined($key) ? constant($key) : null;
        }
        return null;
    }
    
    /**
     * HTTP 요청 수행
     */
    private function makeRequest($endpoint, $method = 'GET', $data = null) {
        $url = $this->baseUrl . $endpoint;
        
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Notion-Version: ' . $this->version,
            'Content-Type: application/json'
        ];
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false
        ]);
        
        if ($data && in_array($method, ['POST', 'PATCH'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            $this->logError("cURL 오류: {$error}");
            return false;
        }
        
        $decodedResponse = json_decode($response, true);
        
        if ($httpCode >= 400) {
            $this->logError("Notion API 오류 ({$httpCode}): " . json_encode($decodedResponse));
            return false;
        }
        
        return $decodedResponse;
    }
    
    /**
     * 수강생 정보를 노션 데이터베이스에 추가
     */
    public function addStudent($studentData) {
        $endpoint = '/pages';
        
        $properties = [
            'Name' => [
                'title' => [
                    [
                        'text' => [
                            'content' => $studentData['name']
                        ]
                    ]
                ]
            ],
            'Email' => [
                'email' => $studentData['email']
            ],
            'Phone' => [
                'phone_number' => $studentData['phone'] ?? ''
            ],
            'Company' => [
                'rich_text' => [
                    [
                        'text' => [
                            'content' => $studentData['company'] ?? ''
                        ]
                    ]
                ]
            ],
            'Course' => [
                'select' => [
                    'name' => $studentData['course'] ?? 'SCM 기초'
                ]
            ],
            'Inquiry Type' => [
                'select' => [
                    'name' => $studentData['inquiry_type'] ?? '강의 문의'
                ]
            ],
            'Status' => [
                'select' => [
                    'name' => '신규'
                ]
            ],
            'Message' => [
                'rich_text' => [
                    [
                        'text' => [
                            'content' => $studentData['message'] ?? ''
                        ]
                    ]
                ]
            ],
            'Registration Date' => [
                'date' => [
                    'start' => date('Y-m-d')
                ]
            ]
        ];
        
        $data = [
            'parent' => [
                'database_id' => $this->databaseId
            ],
            'properties' => $properties
        ];
        
        $response = $this->makeRequest($endpoint, 'POST', $data);
        
        if ($response) {
            $this->logSuccess("수강생 등록 성공: {$studentData['name']} ({$studentData['email']})");
            return $response['id'];
        }
        
        return false;
    }
    
    /**
     * 노션 데이터베이스에서 수강생 목록 조회
     */
    public function getStudents($pageSize = 100) {
        $endpoint = "/databases/{$this->databaseId}/query";
        
        $data = [
            'page_size' => $pageSize,
            'sorts' => [
                [
                    'property' => 'Registration Date',
                    'direction' => 'descending'
                ]
            ]
        ];
        
        $response = $this->makeRequest($endpoint, 'POST', $data);
        
        if ($response && isset($response['results'])) {
            return $this->parseStudents($response['results']);
        }
        
        return [];
    }
    
    /**
     * 노션 응답 데이터 파싱
     */
    private function parseStudents($results) {
        $students = [];
        
        foreach ($results as $page) {
            $props = $page['properties'];
            
            $students[] = [
                'id' => $page['id'],
                'name' => $this->getPropertyValue($props['Name'] ?? [], 'title'),
                'email' => $this->getPropertyValue($props['Email'] ?? [], 'email'),
                'phone' => $this->getPropertyValue($props['Phone'] ?? [], 'phone_number'),
                'company' => $this->getPropertyValue($props['Company'] ?? [], 'rich_text'),
                'course' => $this->getPropertyValue($props['Course'] ?? [], 'select'),
                'inquiry_type' => $this->getPropertyValue($props['Inquiry Type'] ?? [], 'select'),
                'status' => $this->getPropertyValue($props['Status'] ?? [], 'select'),
                'message' => $this->getPropertyValue($props['Message'] ?? [], 'rich_text'),
                'registration_date' => $this->getPropertyValue($props['Registration Date'] ?? [], 'date'),
                'created_time' => $page['created_time'],
                'last_edited_time' => $page['last_edited_time']
            ];
        }
        
        return $students;
    }
    
    /**
     * 속성 값 추출
     */
    private function getPropertyValue($property, $type) {
        switch ($type) {
            case 'title':
                return isset($property['title'][0]['text']['content']) ? $property['title'][0]['text']['content'] : '';
            case 'rich_text':
                return isset($property['rich_text'][0]['text']['content']) ? $property['rich_text'][0]['text']['content'] : '';
            case 'email':
                return $property['email'] ?? '';
            case 'phone_number':
                return $property['phone_number'] ?? '';
            case 'select':
                return isset($property['select']['name']) ? $property['select']['name'] : '';
            case 'date':
                return isset($property['date']['start']) ? $property['date']['start'] : '';
            default:
                return '';
        }
    }
    
    /**
     * 수강생 상태 업데이트
     */
    public function updateStudentStatus($pageId, $status) {
        $endpoint = "/pages/{$pageId}";
        
        $data = [
            'properties' => [
                'Status' => [
                    'select' => [
                        'name' => $status
                    ]
                ]
            ]
        ];
        
        $response = $this->makeRequest($endpoint, 'PATCH', $data);
        
        if ($response) {
            $this->logSuccess("수강생 상태 업데이트 성공: {$pageId} -> {$status}");
            return true;
        }
        
        return false;
    }
    
    /**
     * 연결 테스트
     */
    public function testConnection() {
        $endpoint = "/databases/{$this->databaseId}";
        $response = $this->makeRequest($endpoint);
        
        if ($response) {
            $this->logSuccess("Notion API 연결 성공: " . ($response['title'][0]['text']['content'] ?? 'Database'));
            return true;
        }
        
        return false;
    }
    
    /**
     * 성공 로그
     */
    private function logSuccess($message) {
        $this->writeLog('SUCCESS', $message);
    }
    
    /**
     * 오류 로그
     */
    private function logError($message) {
        $this->writeLog('ERROR', $message);
    }
    
    /**
     * 로그 작성
     */
    private function writeLog($level, $message) {
        $logFile = __DIR__ . '/../logs/notion.log';
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[{$timestamp}] [{$level}] {$message}" . PHP_EOL;
        file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
    }
}

/**
 * 노션 연동 헬퍼 클래스
 */
class NotionHelper {
    private $notion;
    
    public function __construct() {
        $this->notion = new NotionAPI();
    }
    
    /**
     * Notion에 수강생 데이터 저장
     */
    public function saveStudentData($data) {
        try {
            $notionId = $this->notion->addStudent($data);
            return [
                'success' => true,
                'notion_id' => $notionId,
                'errors' => []
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'notion_id' => null,
                'errors' => ["Notion 저장 실패: " . $e->getMessage()]
            ];
        }
    }
    
    /**
     * 통합 수강생 목록 조회
     */
    public function getAllStudents() {
        $students = [];
        
        // 노션에서 조회 시도
        try {
            $notionStudents = $this->notion->getStudents();
            if ($notionStudents) {
                $students['notion'] = $notionStudents;
            }
        } catch (Exception $e) {
            $students['notion_error'] = $e->getMessage();
        }
        
        // SQLite에서 백업 조회
        try {
            $sqliteStudents = $this->database->getInquiries();
            if ($sqliteStudents) {
                $students['sqlite'] = $sqliteStudents;
            }
        } catch (Exception $e) {
            $students['sqlite_error'] = $e->getMessage();
        }
        
        return $students;
    }
}
?>