<?php
/**
 * Enhanced Notion API Integration
 * Handles all Notion database operations
 */

class NotionAPI {
    private $apiKey;
    private $apiUrl = 'https://api.notion.com/v1';
    private $version = '2022-06-28';
    private $logFile;
    
    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
        $this->logFile = dirname(__DIR__) . '/logs/notion.log';
    }
    
    /**
     * Log Notion API activities
     */
    private function log($message, $type = 'INFO') {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] [$type] $message" . PHP_EOL;
        
        $dir = dirname($this->logFile);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
        
        file_put_contents($this->logFile, $logMessage, FILE_APPEND | LOCK_EX);
    }
    
    /**
     * Make API request to Notion
     */
    private function request($endpoint, $method = 'GET', $data = null) {
        $url = $this->apiUrl . $endpoint;
        
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json',
            'Notion-Version: ' . $this->version
        ];
        
        $options = [
            'http' => [
                'header' => implode("\r\n", $headers),
                'method' => $method,
                'ignore_errors' => true
            ]
        ];
        
        if ($data && in_array($method, ['POST', 'PATCH'])) {
            $options['http']['content'] = json_encode($data);
        }
        
        $context = stream_context_create($options);
        $result = @file_get_contents($url, false, $context);
        
        if ($result === false) {
            $error = error_get_last();
            $this->log("API request failed: " . $error['message'], 'ERROR');
            return ['error' => $error['message']];
        }
        
        $response = json_decode($result, true);
        
        // Log the request
        $this->log("$method $endpoint - Status: " . ($response['object'] ?? 'error'));
        
        return $response;
    }
    
    /**
     * Create a page in Notion database
     */
    public function createPage($databaseId, $properties) {
        $data = [
            'parent' => ['database_id' => $databaseId],
            'properties' => $this->formatProperties($properties)
        ];
        
        return $this->request('/pages', 'POST', $data);
    }
    
    /**
     * Query a Notion database
     */
    public function queryDatabase($databaseId, $filters = [], $sorts = [], $limit = 100) {
        $data = [
            'page_size' => $limit
        ];
        
        if (!empty($filters)) {
            $data['filter'] = $filters;
        }
        
        if (!empty($sorts)) {
            $data['sorts'] = $sorts;
        }
        
        return $this->request("/databases/$databaseId/query", 'POST', $data);
    }
    
    /**
     * Get a specific page
     */
    public function getPage($pageId) {
        return $this->request("/pages/$pageId");
    }
    
    /**
     * Update a page
     */
    public function updatePage($pageId, $properties) {
        $data = [
            'properties' => $this->formatProperties($properties)
        ];
        
        return $this->request("/pages/$pageId", 'PATCH', $data);
    }
    
    /**
     * Archive (delete) a page
     */
    public function archivePage($pageId) {
        $data = ['archived' => true];
        return $this->request("/pages/$pageId", 'PATCH', $data);
    }
    
    /**
     * Get database schema
     */
    public function getDatabase($databaseId) {
        return $this->request("/databases/$databaseId");
    }
    
    /**
     * Format properties for Notion API
     */
    private function formatProperties($properties) {
        $formatted = [];
        
        foreach ($properties as $key => $value) {
            if (is_string($value)) {
                // Handle different property types
                if (in_array($key, ['Name', 'Title', '이름', '제목'])) {
                    $formatted[$key] = [
                        'title' => [
                            ['text' => ['content' => $value]]
                        ]
                    ];
                } elseif (in_array($key, ['Email', '이메일'])) {
                    $formatted[$key] = [
                        'email' => $value
                    ];
                } elseif (in_array($key, ['Phone', '전화번호'])) {
                    $formatted[$key] = [
                        'phone_number' => $value
                    ];
                } elseif (in_array($key, ['URL', '링크'])) {
                    $formatted[$key] = [
                        'url' => $value
                    ];
                } elseif (in_array($key, ['Date', '날짜', 'Registration Date'])) {
                    $formatted[$key] = [
                        'date' => ['start' => date('Y-m-d', strtotime($value))]
                    ];
                } elseif (in_array($key, ['Status', '상태', 'Course', 'Inquiry Type'])) {
                    $formatted[$key] = [
                        'select' => ['name' => $value]
                    ];
                } elseif (in_array($key, ['Price', '가격', 'Amount'])) {
                    $formatted[$key] = [
                        'number' => floatval($value)
                    ];
                } elseif (in_array($key, ['Checkbox', '체크박스', 'Confirmed'])) {
                    $formatted[$key] = [
                        'checkbox' => (bool)$value
                    ];
                } else {
                    // Default to rich text
                    $formatted[$key] = [
                        'rich_text' => [
                            ['text' => ['content' => $value]]
                        ]
                    ];
                }
            } elseif (is_array($value)) {
                // Handle multi-select
                if (isset($value[0]) && is_string($value[0])) {
                    $formatted[$key] = [
                        'multi_select' => array_map(function($item) {
                            return ['name' => $item];
                        }, $value)
                    ];
                }
            } elseif (is_bool($value)) {
                $formatted[$key] = ['checkbox' => $value];
            } elseif (is_numeric($value)) {
                $formatted[$key] = ['number' => floatval($value)];
            }
        }
        
        return $formatted;
    }
    
    /**
     * Parse Notion response to simple array
     */
    public function parseResponse($response) {
        if (isset($response['error'])) {
            return $response;
        }
        
        if (isset($response['results'])) {
            // Database query response
            return array_map([$this, 'parsePage'], $response['results']);
        } elseif (isset($response['properties'])) {
            // Single page response
            return $this->parsePage($response);
        }
        
        return $response;
    }
    
    /**
     * Parse a single page object
     */
    private function parsePage($page) {
        $parsed = [
            'id' => $page['id'],
            'created_time' => $page['created_time'],
            'last_edited_time' => $page['last_edited_time'],
            'archived' => $page['archived'] ?? false
        ];
        
        // Parse properties
        foreach ($page['properties'] as $key => $property) {
            $parsed[$key] = $this->parseProperty($property);
        }
        
        return $parsed;
    }
    
    /**
     * Parse a property value
     */
    private function parseProperty($property) {
        switch ($property['type']) {
            case 'title':
                return $property['title'][0]['text']['content'] ?? '';
            case 'rich_text':
                return $property['rich_text'][0]['text']['content'] ?? '';
            case 'number':
                return $property['number'] ?? 0;
            case 'select':
                return $property['select']['name'] ?? '';
            case 'multi_select':
                return array_map(function($item) {
                    return $item['name'];
                }, $property['multi_select']);
            case 'date':
                return $property['date']['start'] ?? '';
            case 'checkbox':
                return $property['checkbox'] ?? false;
            case 'email':
                return $property['email'] ?? '';
            case 'phone_number':
                return $property['phone_number'] ?? '';
            case 'url':
                return $property['url'] ?? '';
            case 'created_time':
                return $property['created_time'] ?? '';
            case 'last_edited_time':
                return $property['last_edited_time'] ?? '';
            default:
                return null;
        }
    }
    
    /**
     * Create database structure for courses
     */
    public function createCoursesDatabase($parentPageId) {
        $data = [
            'parent' => ['page_id' => $parentPageId],
            'title' => [
                ['text' => ['content' => 'SCM 강의 데이터베이스']]
            ],
            'properties' => [
                'Name' => ['title' => new stdClass()],
                'Category' => [
                    'select' => [
                        'options' => [
                            ['name' => 'SCM 기초', 'color' => 'blue'],
                            ['name' => 'SAP ERP', 'color' => 'green'],
                            ['name' => '컨설팅 도구', 'color' => 'purple'],
                            ['name' => '커리어 컨설팅', 'color' => 'orange']
                        ]
                    ]
                ],
                'Level' => [
                    'select' => [
                        'options' => [
                            ['name' => '초급', 'color' => 'green'],
                            ['name' => '중급', 'color' => 'yellow'],
                            ['name' => '고급', 'color' => 'red']
                        ]
                    ]
                ],
                'Price' => ['number' => ['format' => 'won']],
                'Duration' => ['rich_text' => new stdClass()],
                'Description' => ['rich_text' => new stdClass()],
                'Status' => [
                    'select' => [
                        'options' => [
                            ['name' => '모집중', 'color' => 'green'],
                            ['name' => '진행중', 'color' => 'blue'],
                            ['name' => '종료', 'color' => 'gray']
                        ]
                    ]
                ],
                'Start Date' => ['date' => new stdClass()],
                'Max Students' => ['number' => ['format' => 'number']],
                'Enrolled' => ['number' => ['format' => 'number']]
            ]
        ];
        
        return $this->request('/databases', 'POST', $data);
    }
    
    /**
     * Create database structure for inquiries
     */
    public function createInquiriesDatabase($parentPageId) {
        $data = [
            'parent' => ['page_id' => $parentPageId],
            'title' => [
                ['text' => ['content' => '문의사항 데이터베이스']]
            ],
            'properties' => [
                'Name' => ['title' => new stdClass()],
                'Email' => ['email' => new stdClass()],
                'Phone' => ['phone_number' => new stdClass()],
                'Company' => ['rich_text' => new stdClass()],
                'Inquiry Type' => [
                    'select' => [
                        'options' => [
                            ['name' => '강의문의', 'color' => 'blue'],
                            ['name' => '컨설팅문의', 'color' => 'green'],
                            ['name' => '일반문의', 'color' => 'gray']
                        ]
                    ]
                ],
                'Message' => ['rich_text' => new stdClass()],
                'Status' => [
                    'select' => [
                        'options' => [
                            ['name' => '대기중', 'color' => 'yellow'],
                            ['name' => '처리중', 'color' => 'blue'],
                            ['name' => '완료', 'color' => 'green']
                        ]
                    ]
                ],
                'Created Date' => ['date' => new stdClass()],
                'Notes' => ['rich_text' => new stdClass()]
            ]
        ];
        
        return $this->request('/databases', 'POST', $data);
    }
    
    /**
     * Create database structure for students
     */
    public function createStudentsDatabase($parentPageId) {
        $data = [
            'parent' => ['page_id' => $parentPageId],
            'title' => [
                ['text' => ['content' => '수강생 데이터베이스']]
            ],
            'properties' => [
                'Name' => ['title' => new stdClass()],
                'Email' => ['email' => new stdClass()],
                'Phone' => ['phone_number' => new stdClass()],
                'Company' => ['rich_text' => new stdClass()],
                'Course' => [
                    'select' => [
                        'options' => [
                            ['name' => 'SCM 기초 과정', 'color' => 'blue'],
                            ['name' => 'SAP ERP 실무', 'color' => 'green'],
                            ['name' => '컨설팅 도구 마스터', 'color' => 'purple']
                        ]
                    ]
                ],
                'Registration Date' => ['date' => new stdClass()],
                'Payment Status' => [
                    'select' => [
                        'options' => [
                            ['name' => '대기', 'color' => 'yellow'],
                            ['name' => '완료', 'color' => 'green'],
                            ['name' => '취소', 'color' => 'red']
                        ]
                    ]
                ],
                'Notes' => ['rich_text' => new stdClass()],
                'Attendance' => ['number' => ['format' => 'percent']],
                'Completed' => ['checkbox' => new stdClass()]
            ]
        ];
        
        return $this->request('/databases', 'POST', $data);
    }
}
?>