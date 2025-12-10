<?php
/**
 * Notion 강의 일정 API 엔드포인트
 * scm-basic.html의 달력과 연동하여 동적 스케줄 제공
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: public, max-age=300'); // 5분 캐시

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../includes/config.php';

class NotionScheduleAPI {
    private $apiKey;
    private $courseDbId;
    private $apiVersion = '2022-06-28';
    private $cacheFile;
    
    public function __construct() {
        $config = Config::getInstance();
        $this->apiKey = $_ENV['NOTION_API_KEY'] ?? $config->get('NOTION_API_KEY');
        $this->courseDbId = COURSES_DB_ID;
        $this->cacheFile = __DIR__ . '/../data/schedule-cache.json';
    }
    
    /**
     * Notion API 호출
     */
    private function callNotionAPI($endpoint, $method = 'GET', $data = null) {
        $url = 'https://api.notion.com/v1' . $endpoint;
        
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Notion-Version: ' . $this->apiVersion,
            'Content-Type: application/json'
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            throw new Exception('cURL 오류: ' . $error);
        }
        
        $result = json_decode($response, true);
        
        if ($httpCode >= 400) {
            throw new Exception('Notion API 오류: ' . ($result['message'] ?? 'Unknown error'));
        }
        
        return $result;
    }
    
    /**
     * 캐시된 데이터 확인
     */
    private function getCachedData() {
        if (!file_exists($this->cacheFile)) {
            return null;
        }
        
        $cacheTime = filemtime($this->cacheFile);
        $cacheExpiry = 300; // 5분
        
        if (time() - $cacheTime < $cacheExpiry) {
            $cached = json_decode(file_get_contents($this->cacheFile), true);
            if ($cached && isset($cached['data'])) {
                return $cached;
            }
        }
        
        return null;
    }
    
    /**
     * 데이터 캐시 저장
     */
    private function cacheData($data) {
        $dir = dirname($this->cacheFile);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        file_put_contents($this->cacheFile, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    }

    /**
     * 강의 일정 조회 및 포맷팅
     */
    public function getScheduleData() {
        // 캐시된 데이터 확인
        $cached = $this->getCachedData();
        if ($cached) {
            return $cached;
        }
        
        try {
            // Notion 강의 데이터베이스에서 모든 강의 조회 (필터 제거)
            $queryData = [
                'page_size' => 50,
                'sorts' => [
                    [
                        'property' => '개강일',
                        'direction' => 'ascending'
                    ]
                ]
            ];
            
            $response = $this->callNotionAPI('/databases/' . $this->courseDbId . '/query', 'POST', $queryData);
            
            $scheduleData = [];
            
            foreach ($response['results'] as $course) {
                $properties = $course['properties'];
                
                // 속성 추출
                $title = $this->extractText($properties['강의명'] ?? null);
                $category = $this->extractSelect($properties['카테고리'] ?? null);
                $status = $this->extractSelect($properties['상태'] ?? null);
                $startDate = $this->extractDate($properties['개강일'] ?? null);
                $endDate = $this->extractDate($properties['종료일'] ?? null);
                $maxStudents = $this->extractNumber($properties['최대인원'] ?? null);
                $currentStudents = $this->extractNumber($properties['현재등록인원'] ?? null);
                $price = $this->extractNumber($properties['가격'] ?? null);
                $discountPrice = $this->extractNumber($properties['할인가격'] ?? null);
                $description = $this->extractText($properties['강의설명'] ?? null);
                $duration = $this->extractText($properties['강의시간'] ?? null);
                
                // 스케줄 데이터 구조화
                $courseData = [
                    'id' => $course['id'],
                    'title' => $title ?: 'SCM 기초 완성 강의',
                    'category' => $category ?: 'SCM 기초',
                    'status' => $status ?: '준비중',
                    'startDate' => $startDate,
                    'endDate' => $endDate,
                    'price' => $price ?: 450000,
                    'discountPrice' => $discountPrice,
                    'maxStudents' => $maxStudents ?: 20,
                    'currentStudents' => $currentStudents ?: 0,
                    'description' => $description ?: '',
                    'duration' => $duration ?: '총 20시간',
                    'enrollmentStatus' => $this->getEnrollmentStatus($status, $currentStudents, $maxStudents),
                    'daysUntilStart' => $this->getDaysUntilStart($startDate),
                    'progress' => $this->getProgress($startDate, $endDate, $status),
                    'isActive' => in_array($status ?: '준비중', ['모집중', '진행중', '준비중'])
                ];
                
                $scheduleData[] = $courseData;
            }
            
            $result = [
                'success' => true,
                'data' => $scheduleData,
                'lastUpdated' => date('Y-m-d H:i:s'),
                'totalCourses' => count($scheduleData),
                'cached' => false
            ];
            
            // 성공한 경우 캐시 저장
            $this->cacheData($result);
            
            return $result;
            
        } catch (Exception $e) {
            // Notion API 실패 시 기존 캐시나 정적 파일 사용
            $fallbackData = $this->getFallbackData();
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'data' => $fallbackData,
                'fallback' => true,
                'message' => '캐시된 데이터를 사용합니다.'
            ];
        }
    }
    
    /**
     * Notion API 실패 시 폴백 데이터 제공
     */
    private function getFallbackData() {
        // 1. 캐시 파일 확인 (만료되었더라도 사용)
        if (file_exists($this->cacheFile)) {
            $cached = json_decode(file_get_contents($this->cacheFile), true);
            if ($cached && isset($cached['data'])) {
                return $cached['data'];
            }
        }
        
        // 2. 정적 스케줄 파일 확인
        $staticFile = __DIR__ . '/../data/schedule.json';
        if (file_exists($staticFile)) {
            $static = json_decode(file_get_contents($staticFile), true);
            if ($static && isset($static['data'])) {
                return $static['data'];
            }
        }
        
        // 3. 기본 데이터 반환
        return [];
    }
    }
    
    /**
     * 텍스트 속성 추출
     */
    private function extractText($property) {
        if (!$property) return '';
        
        if ($property['type'] === 'title' && !empty($property['title'])) {
            return $property['title'][0]['text']['content'] ?? '';
        }
        
        if ($property['type'] === 'rich_text' && !empty($property['rich_text'])) {
            return $property['rich_text'][0]['text']['content'] ?? '';
        }
        
        return '';
    }
    
    /**
     * 선택 속성 추출
     */
    private function extractSelect($property) {
        if (!$property || $property['type'] !== 'select') return '';
        return $property['select']['name'] ?? '';
    }
    
    /**
     * 날짜 속성 추출
     */
    private function extractDate($property) {
        if (!$property || $property['type'] !== 'date') return null;
        return $property['date']['start'] ?? null;
    }
    
    /**
     * 숫자 속성 추출
     */
    private function extractNumber($property) {
        if (!$property || $property['type'] !== 'number') return 0;
        return $property['number'] ?? 0;
    }
    
    /**
     * 모집 상태 계산
     */
    private function getEnrollmentStatus($status, $current, $max) {
        if ($status === '완료') return 'completed';
        if ($status === '진행중') return 'ongoing';
        if ($current >= $max) return 'full';
        if ($current / $max >= 0.8) return 'almost_full';
        return 'available';
    }
    
    /**
     * 개강까지 남은 일수 계산
     */
    private function getDaysUntilStart($startDate) {
        if (!$startDate) return null;
        
        $start = new DateTime($startDate);
        $now = new DateTime();
        $diff = $now->diff($start);
        
        return $start > $now ? $diff->days : -$diff->days;
    }
    
    /**
     * 강의 진행률 계산
     */
    private function getProgress($startDate, $endDate, $status) {
        if (!$startDate || !$endDate) return 0;
        
        $start = new DateTime($startDate);
        $end = new DateTime($endDate);
        $now = new DateTime();
        
        if ($status === '완료') return 100;
        if ($now < $start) return 0;
        if ($now > $end) return 100;
        
        $total = $start->diff($end)->days;
        $elapsed = $start->diff($now)->days;
        
        return $total > 0 ? min(100, round(($elapsed / $total) * 100)) : 0;
    }
}

// API 실행
try {
    $api = new NotionScheduleAPI();
    $result = $api->getScheduleData();
    
    // JSON 응답 출력
    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'data' => []
    ], JSON_UNESCAPED_UNICODE);
}
?>