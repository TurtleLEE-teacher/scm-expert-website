<?php
/**
 * Notion 통합 클래스
 * 기존 SQL 코드를 Notion MCP로 대체
 */

class NotionIntegration {
    private $config;
    private $inquiriesDbId;
    private $studentsDbId;
    private $coursesDbId;
    
    public function __construct() {
        $this->config = include 'config.php';
        
        // Notion 데이터베이스 ID 설정 (Notion에서 생성 후 설정)
        $this->inquiriesDbId = $this->config['notion_inquiries_db_id'] ?? null;
        $this->studentsDbId = $this->config['notion_students_db_id'] ?? null;
        $this->coursesDbId = $this->config['notion_courses_db_id'] ?? null;
    }
    
    /**
     * 문의사항 저장 (SQL의 saveInquiry 대체)
     */
    public function saveInquiry($data) {
        if (!$this->inquiriesDbId) {
            throw new Exception('문의사항 데이터베이스 ID가 설정되지 않았습니다.');
        }
        
        // Notion MCP를 통해 페이지 생성
        // 실제 구현에서는 Notion MCP 호출이 필요
        return $this->createNotionPage($this->inquiriesDbId, [
            '이름' => $data['name'],
            '이메일' => $data['email'],
            '전화번호' => $data['phone'] ?? '',
            '회사명' => $data['company'] ?? '',
            '문의유형' => $this->mapInquiryType($data['inquiry_type']),
            '문의내용' => $data['message'],
            '상태' => '새 문의',
            'IP주소' => $data['ip_address'] ?? '',
            '우선순위' => '보통'
        ]);
    }
    
    /**
     * 수강생 등록 (새로운 기능)
     */
    public function registerStudent($data) {
        if (!$this->studentsDbId) {
            throw new Exception('수강생 데이터베이스 ID가 설정되지 않았습니다.');
        }
        
        return $this->createNotionPage($this->studentsDbId, [
            '이름' => $data['name'],
            '이메일' => $data['email'],
            '전화번호' => $data['phone'] ?? '',
            '회사명' => $data['company'] ?? '',
            '직책' => $data['position'] ?? '',
            '수강강의' => $data['course_name'],
            '등록일' => date('Y-m-d'),
            '결제상태' => $data['payment_status'] ?? '결제대기',
            '결제금액' => $data['amount'] ?? 0,
            '진도율' => 0,
            '수료여부' => false
        ]);
    }
    
    /**
     * 강의 생성/수정 (새로운 기능)
     */
    public function manageCourse($data, $courseId = null) {
        if (!$this->coursesDbId) {
            throw new Exception('강의 데이터베이스 ID가 설정되지 않았습니다.');
        }
        
        $courseData = [
            '강의명' => $data['name'],
            '카테고리' => $data['category'],
            '난이도' => $data['level'],
            '가격' => $data['price'],
            '할인가격' => $data['discount_price'] ?? null,
            '강의시간' => $data['duration'],
            '강의설명' => $data['description'],
            '상태' => $data['status'] ?? '준비중',
            '개강일' => $data['start_date'] ?? null,
            '종료일' => $data['end_date'] ?? null,
            '최대인원' => $data['max_students'] ?? 20,
            '현재등록인원' => 0,
            '강의자료URL' => $data['materials_url'] ?? '',
            'Zoom링크' => $data['zoom_url'] ?? '',
            '커리큘럼' => $data['curriculum'] ?? '',
            '선수조건' => $data['prerequisites'] ?? '',
            '수료혜택' => $data['benefits'] ?? ''
        ];
        
        if ($courseId) {
            return $this->updateNotionPage($courseId, $courseData);
        } else {
            return $this->createNotionPage($this->coursesDbId, $courseData);
        }
    }
    
    /**
     * 문의사항 조회 (SQL의 getInquiries 대체)
     */
    public function getInquiries($limit = 50, $status = null) {
        if (!$this->inquiriesDbId) {
            return [];
        }
        
        $filter = [];
        if ($status) {
            $filter = [
                'property' => '상태',
                'select' => [
                    'equals' => $status
                ]
            ];
        }
        
        return $this->queryNotionDatabase($this->inquiriesDbId, $filter, [], $limit);
    }
    
    /**
     * 수강생 목록 조회
     */
    public function getStudents($courseFilter = null, $limit = 50) {
        if (!$this->studentsDbId) {
            return [];
        }
        
        $filter = [];
        if ($courseFilter) {
            $filter = [
                'property' => '수강강의',
                'rich_text' => [
                    'contains' => $courseFilter
                ]
            ];
        }
        
        return $this->queryNotionDatabase($this->studentsDbId, $filter, [], $limit);
    }
    
    /**
     * 강의 목록 조회
     */
    public function getCourses($category = null, $status = null) {
        if (!$this->coursesDbId) {
            return [];
        }
        
        $filters = [];
        
        if ($category) {
            $filters[] = [
                'property' => '카테고리',
                'select' => [
                    'equals' => $category
                ]
            ];
        }
        
        if ($status) {
            $filters[] = [
                'property' => '상태',
                'select' => [
                    'equals' => $status
                ]
            ];
        }
        
        $filter = count($filters) > 1 ? ['and' => $filters] : ($filters[0] ?? []);
        
        return $this->queryNotionDatabase($this->coursesDbId, $filter);
    }
    
    /**
     * 통계 정보 조회 (SQL의 getStatistics 대체)
     */
    public function getStatistics() {
        $stats = [];
        
        // 총 문의 수
        $inquiries = $this->queryNotionDatabase($this->inquiriesDbId, [], [], 1000);
        $stats['total_inquiries'] = is_array($inquiries) ? count($inquiries) : 0;
        
        // 새로운 문의 수
        $newInquiries = $this->getInquiries(1000, '새 문의');
        $stats['new_inquiries'] = is_array($newInquiries) ? count($newInquiries) : 0;
        
        // 총 수강생 수
        $students = $this->queryNotionDatabase($this->studentsDbId, [], [], 1000);
        $stats['total_students'] = is_array($students) ? count($students) : 0;
        
        // 활성 강의 수
        $activeCourses = $this->getCourses(null, '모집중');
        $stats['active_courses'] = is_array($activeCourses) ? count($activeCourses) : 0;
        
        return $stats;
    }
    
    /**
     * 문의 유형 매핑
     */
    private function mapInquiryType($type) {
        $mapping = [
            'scm-course' => 'SCM 기초 강의',
            'career-consulting' => '커리어 컨설팅',
            'other' => '일반 문의'
        ];
        
        return $mapping[$type] ?? '기타';
    }
    
    /**
     * Notion MCP를 통한 페이지 생성 (실제 구현 시 MCP 호출)
     */
    private function createNotionPage($databaseId, $properties) {
        // 실제 구현에서는 Notion MCP 호출
        // 현재는 시뮬레이션
        
        $logData = [
            'action' => 'create_page',
            'database_id' => $databaseId,
            'properties' => $properties,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        $this->log('Notion MCP 페이지 생성 요청', $logData);
        
        // 시뮬레이션된 성공 응답
        return [
            'success' => true,
            'page_id' => 'simulated_' . uniqid(),
            'database_id' => $databaseId
        ];
    }
    
    /**
     * Notion MCP를 통한 페이지 업데이트
     */
    private function updateNotionPage($pageId, $properties) {
        $logData = [
            'action' => 'update_page',
            'page_id' => $pageId,
            'properties' => $properties,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        $this->log('Notion MCP 페이지 업데이트 요청', $logData);
        
        return [
            'success' => true,
            'page_id' => $pageId
        ];
    }
    
    /**
     * Notion MCP를 통한 데이터베이스 쿼리
     */
    private function queryNotionDatabase($databaseId, $filter = [], $sorts = [], $limit = 100) {
        $logData = [
            'action' => 'query_database',
            'database_id' => $databaseId,
            'filter' => $filter,
            'limit' => $limit,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        $this->log('Notion MCP 데이터베이스 쿼리 요청', $logData);
        
        // 시뮬레이션된 응답
        return [
            'results' => [],
            'has_more' => false,
            'next_cursor' => null
        ];
    }
    
    /**
     * 로그 기록
     */
    private function log($message, $data = null) {
        $logFile = dirname(__DIR__) . '/logs/notion-integration.log';
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'message' => $message,
            'data' => $data
        ];
        
        $dir = dirname($logFile);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
        
        file_put_contents($logFile, json_encode($logEntry, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
    }
    
    /**
     * 데이터베이스 ID 설정
     */
    public function setDatabaseIds($inquiriesId, $studentsId, $coursesId) {
        $this->inquiriesDbId = $inquiriesId;
        $this->studentsDbId = $studentsId;
        $this->coursesDbId = $coursesId;
        
        // config.php에 저장
        $configPath = __DIR__ . '/config.php';
        $config = include $configPath;
        $config['notion_inquiries_db_id'] = $inquiriesId;
        $config['notion_students_db_id'] = $studentsId;
        $config['notion_courses_db_id'] = $coursesId;
        
        $configContent = "<?php\nreturn " . var_export($config, true) . ";\n?>";
        file_put_contents($configPath, $configContent);
        
        $this->log('데이터베이스 ID 설정 완료', [
            'inquiries_db_id' => $inquiriesId,
            'students_db_id' => $studentsId,
            'courses_db_id' => $coursesId
        ]);
    }
}
?>