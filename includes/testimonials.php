<?php
/**
 * 수강생 후기 관리 클래스
 * JSON 파일 기반 후기 데이터 관리 및 렌더링
 */

class TestimonialManager {
    private $dataFile;
    private $testimonials;
    
    public function __construct($dataFile = null) {
        $this->dataFile = $dataFile ?: __DIR__ . '/../data/testimonials.json';
        $this->loadTestimonials();
    }
    
    /**
     * 후기 데이터 로드
     */
    private function loadTestimonials() {
        if (!file_exists($this->dataFile)) {
            $this->testimonials = [];
            return;
        }
        
        $jsonData = file_get_contents($this->dataFile);
        $data = json_decode($jsonData, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("후기 JSON 파싱 오류: " . json_last_error_msg());
            $this->testimonials = [];
            return;
        }
        
        $this->testimonials = $data['testimonials'] ?? [];
    }
    
    /**
     * 카테고리별 후기 조회
     * @param string $category 'scm_course' 또는 'career_consulting'
     * @param bool $featuredOnly 추천 후기만 조회
     * @param int $limit 조회 개수 제한
     */
    public function getTestimonialsByCategory($category, $featuredOnly = false, $limit = null) {
        $filtered = array_filter($this->testimonials, function($testimonial) use ($category, $featuredOnly) {
            $categoryMatch = $testimonial['category'] === $category;
            $featuredMatch = !$featuredOnly || ($testimonial['featured'] ?? false);
            return $categoryMatch && $featuredMatch;
        });
        
        // 날짜순으로 정렬 (최신순)
        usort($filtered, function($a, $b) {
            return strcmp($b['date'], $a['date']);
        });
        
        if ($limit) {
            $filtered = array_slice($filtered, 0, $limit);
        }
        
        return $filtered;
    }
    
    /**
     * 모든 후기 조회
     */
    public function getAllTestimonials($limit = null) {
        $sorted = $this->testimonials;
        
        // 날짜순으로 정렬 (최신순)
        usort($sorted, function($a, $b) {
            return strcmp($b['date'], $a['date']);
        });
        
        if ($limit) {
            $sorted = array_slice($sorted, 0, $limit);
        }
        
        return $sorted;
    }
    
    /**
     * HTML 카드 형태로 후기 렌더링
     */
    public function renderTestimonialCard($testimonial) {
        $rating = $testimonial['rating'] ?? 5;
        $stars = str_repeat('⭐', $rating);
        $achievement = $testimonial['achievement'] ?? '';
        $company = $testimonial['company'] ?? '';
        
        $companyText = $company ? " - {$company}" : '';
        $achievementBadge = $achievement ? "<span style='background: #667eea; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8rem; margin-left: 10px;'>{$achievement}</span>" : '';
        
        return "
        <div class='testimonial-card card' data-category='{$testimonial['category']}' data-date='{$testimonial['date']}'>
            <div class='testimonial-header'>
                <div class='testimonial-rating'>{$stars}</div>
                <div class='testimonial-date'>{$this->formatDate($testimonial['date'])}</div>
            </div>
            <div class='testimonial-content'>
                <p class='testimonial-text'>{$testimonial['content']}</p>
            </div>
            <div class='testimonial-author'>
                <strong>{$testimonial['name']}님</strong>
                <span class='testimonial-title'>{$testimonial['title']}{$companyText}</span>
                {$achievementBadge}
            </div>
        </div>";
    }
    
    /**
     * 카테고리별 후기 섹션 전체 렌더링
     */
    public function renderTestimonialSection($category, $title = '후기', $limit = 6) {
        $testimonials = $this->getTestimonialsByCategory($category, false, $limit);
        
        if (empty($testimonials)) {
            return "<div class='no-testimonials'>아직 후기가 없습니다.</div>";
        }
        
        $html = "<div class='testimonials-container' data-category='{$category}'>";
        $html .= "<div class='testimonials-grid'>";
        
        foreach ($testimonials as $testimonial) {
            $html .= $this->renderTestimonialCard($testimonial);
        }
        
        $html .= "</div>";
        
        // 더보기 버튼 (후기가 limit보다 많은 경우)
        $totalCount = count($this->getTestimonialsByCategory($category));
        if ($totalCount > $limit) {
            $remaining = $totalCount - $limit;
            $html .= "<div class='testimonials-load-more'>
                        <button class='btn btn-secondary load-more-btn' data-category='{$category}'>
                            더 많은 후기 보기 (+{$remaining}개)
                        </button>
                      </div>";
        }
        
        $html .= "</div>";
        
        return $html;
    }
    
    /**
     * 날짜 포맷팅
     */
    private function formatDate($dateStr) {
        $date = DateTime::createFromFormat('Y-m', $dateStr);
        if ($date) {
            return $date->format('Y년 m월');
        }
        return $dateStr;
    }
    
    /**
     * 새 후기 추가 (파일 기반)
     */
    public function addTestimonial($testimonialData) {
        $testimonialData['id'] = uniqid();
        $testimonialData['date'] = $testimonialData['date'] ?? date('Y-m');
        
        $this->testimonials[] = $testimonialData;
        return $this->saveTestimonials();
    }
    
    /**
     * 후기 데이터 저장
     */
    private function saveTestimonials() {
        $data = [
            'testimonials' => $this->testimonials,
            'last_updated' => date('c')
        ];
        
        $jsonData = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        if (!is_dir(dirname($this->dataFile))) {
            mkdir(dirname($this->dataFile), 0755, true);
        }
        
        return file_put_contents($this->dataFile, $jsonData) !== false;
    }
    
    /**
     * 후기 통계 정보
     */
    public function getStatistics() {
        $stats = [
            'total' => count($this->testimonials),
            'by_category' => [],
            'average_rating' => 0,
            'latest_date' => null
        ];
        
        $totalRating = 0;
        $ratingCount = 0;
        
        foreach ($this->testimonials as $testimonial) {
            $category = $testimonial['category'];
            $stats['by_category'][$category] = ($stats['by_category'][$category] ?? 0) + 1;
            
            if (isset($testimonial['rating'])) {
                $totalRating += $testimonial['rating'];
                $ratingCount++;
            }
            
            if (!$stats['latest_date'] || $testimonial['date'] > $stats['latest_date']) {
                $stats['latest_date'] = $testimonial['date'];
            }
        }
        
        if ($ratingCount > 0) {
            $stats['average_rating'] = round($totalRating / $ratingCount, 1);
        }
        
        return $stats;
    }
}
?>