# 후기 시스템 사용 가이드

## 📋 시스템 개요

새로운 후기 시스템이 구축되어 실제 수강생 후기를 사이트에 자연스럽게 통합할 수 있습니다.

### 🏗️ 구조
- **데이터:** `data/testimonials.json` - 모든 후기 저장
- **관리:** `includes/testimonials.php` - PHP 후기 관리 클래스  
- **렌더링:** `js/testimonials.js` - 동적 JavaScript 렌더링
- **통합:** 두 HTML 페이지에 후기 자동 로딩 설정

## 📝 새로운 후기 추가 방법

### 1단계: 후기 데이터 준비
후기 파일들을 다음 형식으로 정리:
```
testimonials/
├── scm-course/          # SCM 강의 후기들
│   ├── 후기1.txt
│   ├── 후기2.txt
│   └── ...
└── career-consulting/   # 커리어 컨설팅 후기들
    ├── 후기1.txt
    ├── 후기2.txt
    └── ...
```

### 2단계: JSON 데이터 업데이트
`data/testimonials.json` 파일에 새로운 후기 추가:

```json
{
  "id": "unique_id",
  "category": "scm_course" 또는 "career_consulting", 
  "name": "작성자명 (익명화)",
  "title": "직책 또는 성과",
  "company": "회사명 (선택사항)",
  "content": "후기 내용 전문",
  "achievement": "주요 성과",
  "date": "2024-12",
  "featured": true,
  "rating": 5
}
```

### 3단계: 자동 적용
- 파일 저장 시 자동으로 사이트에 반영
- 별도 빌드나 배포 과정 불필요

## 🎯 카테고리별 표시 위치

### SCM 강의 후기 (`scm_course`)
- **위치:** `scm-basic.html` 페이지
- **섹션:** "수강생들의 생생한 후기"
- **초기 표시:** 3개 후기
- **더보기:** 3개씩 추가 로딩

### 커리어 컨설팅 후기 (`career_consulting`)  
- **위치:** `career-consulting.html` 페이지
- **섹션:** "실제 수강생 후기"
- **초기 표시:** 3개 후기
- **더보기:** 3개씩 추가 로딩

## ⚡ 주요 기능

### 동적 로딩
- JSON 파일에서 자동으로 후기 로드
- 카테고리별 필터링
- 날짜순 정렬 (최신순)

### 인터랙티브 UI
- 더보기 버튼으로 점진적 로딩
- 호버 애니메이션 효과
- 모바일 반응형 디자인

### 성과 강조
- 별점 시스템 (⭐⭐⭐⭐⭐)
- 성과 배지 (`achievement` 필드)
- 회사명 표시

## 📊 통계 기능
```javascript
// JavaScript로 후기 통계 조회
const stats = getTestimonialStats();
console.log('총 후기 수:', stats.total);
console.log('평균 별점:', stats.averageRating);
console.log('카테고리별:', stats.byCategory);
```

## 🔧 관리 도구

### PHP 클래스 사용
```php
// 후기 관리 인스턴스 생성
$testimonials = new TestimonialManager();

// 카테고리별 후기 조회
$scmReviews = $testimonials->getTestimonialsByCategory('scm_course', true, 5);

// HTML 렌더링
echo $testimonials->renderTestimonialSection('scm_course', '후기', 6);
```

## 📁 파일 업로드 가이드

후기 파일들을 준비하셨으면:
1. `testimonials/` 폴더 생성
2. 카테고리별 하위 폴더 생성  
3. 후기 파일들 업로드
4. 제가 JSON 변환 작업 진행

**준비가 되시면 후기 파일들을 업로드해 주세요!** 🚀