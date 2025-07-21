<?php
// 로그 기록 함수
function writeLog($message) {
    $logFile = '../logs/access.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[{$timestamp}] {$message}" . PHP_EOL;
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
}

// 페이지 접근 로그
writeLog("강의 페이지 접근 - IP: " . $_SERVER['REMOTE_ADDR']);

session_start();

// 강의 데이터 (실제로는 데이터베이스에서 가져올 예정)
$courses = [
    [
        'id' => 1,
        'title' => 'SCM 기초 완성 과정',
        'subtitle' => '공급망관리 입문자를 위한 필수 과정',
        'duration' => '4주 (주 2회, 총 8회)',
        'level' => '초급',
        'price' => '350,000원',
        'description' => 'SCM의 기본 개념부터 실무 적용까지 체계적으로 학습하는 입문 과정입니다.',
        'features' => [
            'SCM 기본 개념 및 용어 정리',
            '공급망 전략 수립 방법론',
            '재고관리 기초 이론과 실무',
            '물류 프로세스 이해',
            '실제 사례 연구 및 토론'
        ]
    ],
    [
        'id' => 2,
        'title' => 'SCM 실무 마스터 과정',
        'subtitle' => '현직자를 위한 고급 실무 과정',
        'duration' => '6주 (주 2회, 총 12회)',
        'level' => '중급',
        'price' => '580,000원',
        'description' => '현장에서 바로 활용할 수 있는 고급 SCM 실무 노하우를 학습합니다.',
        'features' => [
            '고급 재고 최적화 기법',
            '공급업체 관리 전략',
            '수요 예측 모델링',
            'SCM KPI 설계 및 관리',
            '디지털 SCM 도구 활용'
        ]
    ],
    [
        'id' => 3,
        'title' => 'SCM 리더십 과정',
        'subtitle' => '관리자를 위한 전략적 SCM',
        'duration' => '4주 (주 1회, 총 4회)',
        'level' => '고급',
        'price' => '450,000원',
        'description' => 'SCM 부서의 관리자와 임원을 위한 전략적 사고와 리더십 과정입니다.',
        'features' => [
            'SCM 전략 기획 및 실행',
            '조직 관리 및 팀 빌딩',
            '경영진 보고 및 의사소통',
            '글로벌 SCM 트렌드',
            '디지털 트랜스포메이션'
        ]
    ]
];
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>강의 - SCM 전문가 양성</title>
    <meta name="description" content="SCM 분야 전문가가 제공하는 단계별 맞춤 강의 과정을 소개합니다.">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/responsive.css">
</head>
<body>
    <!-- 헤더 -->
    <header class="header">
        <nav class="navbar">
            <div class="container">
                <div class="nav-brand">
                    <h1>SCM EXPERT</h1>
                    <span class="tagline">Supply Chain Management</span>
                </div>
                <ul class="nav-menu">
                    <li><a href="index.php">홈</a></li>
                    <li><a href="about.php">소개</a></li>
                    <li><a href="courses.php" class="active">강의</a></li>
                    <li><a href="consulting.php">컨설팅</a></li>
                    <li><a href="contact.php">문의</a></li>
                </ul>
                <div class="nav-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>
    </header>

    <!-- 페이지 헤더 -->
    <section class="page-header">
        <div class="container">
            <h1>SCM 전문 강의</h1>
            <p>단계별 맞춤 교육으로 SCM 전문가로 성장하세요</p>
        </div>
    </section>

    <!-- 강의 소개 -->
    <section class="course-intro">
        <div class="container">
            <div class="intro-grid">
                <div class="intro-text">
                    <h2>왜 SCM 교육이 필요한가요?</h2>
                    <p>현대 비즈니스 환경에서 공급망관리(SCM)는 기업 경쟁력의 핵심입니다. 체계적인 SCM 교육을 통해 다음과 같은 역량을 키울 수 있습니다:</p>
                    
                    <ul class="benefits-list">
                        <li>비용 절감 및 효율성 향상</li>
                        <li>리스크 관리 능력 강화</li>
                        <li>고객 서비스 수준 개선</li>
                        <li>데이터 기반 의사결정</li>
                        <li>전략적 파트너십 구축</li>
                    </ul>
                </div>
                <div class="intro-stats">
                    <div class="stat-box">
                        <div class="stat-icon">📊</div>
                        <h3>평균 20%</h3>
                        <p>재고 비용 절감</p>
                    </div>
                    <div class="stat-box">
                        <div class="stat-icon">⚡</div>
                        <h3>30% 단축</h3>
                        <p>리드타임 개선</p>
                    </div>
                    <div class="stat-box">
                        <div class="stat-icon">🎯</div>
                        <h3>95% 이상</h3>
                        <p>서비스 수준 달성</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 강의 목록 -->
    <section class="courses-list">
        <div class="container">
            <h2 class="section-title">강의 과정</h2>
            <div class="courses-grid">
                <?php foreach ($courses as $course): ?>
                <div class="course-card">
                    <div class="course-header">
                        <div class="course-level level-<?= strtolower($course['level']) ?>">
                            <?= $course['level'] ?>
                        </div>
                        <div class="course-price"><?= $course['price'] ?></div>
                    </div>
                    
                    <div class="course-content">
                        <h3 class="course-title"><?= $course['title'] ?></h3>
                        <p class="course-subtitle"><?= $course['subtitle'] ?></p>
                        <p class="course-description"><?= $course['description'] ?></p>
                        
                        <div class="course-info">
                            <div class="info-item">
                                <span class="info-label">기간:</span>
                                <span class="info-value"><?= $course['duration'] ?></span>
                            </div>
                        </div>
                        
                        <div class="course-features">
                            <h4>주요 내용</h4>
                            <ul>
                                <?php foreach ($course['features'] as $feature): ?>
                                <li><?= $feature ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="course-footer">
                        <button class="btn btn-primary course-btn" 
                                onclick="inquireCourse(<?= $course['id'] ?>, '<?= $course['title'] ?>')">
                            수강 문의
                        </button>
                        <button class="btn btn-secondary course-btn"
                                onclick="viewCourseDetail(<?= $course['id'] ?>)">
                            자세히 보기
                        </button>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>

    <!-- 학습 방식 -->
    <section class="learning-method">
        <div class="container">
            <h2 class="section-title">학습 방식</h2>
            <div class="method-grid">
                <div class="method-item">
                    <div class="method-icon">💻</div>
                    <h3>온라인 + 오프라인</h3>
                    <p>이론 학습은 온라인으로, 실습과 토론은 오프라인으로 진행하는 블렌디드 러닝</p>
                </div>
                <div class="method-item">
                    <div class="method-icon">👥</div>
                    <h3>소그룹 교육</h3>
                    <p>최대 12명의 소그룹으로 진행하여 개별 맞춤 피드백 제공</p>
                </div>
                <div class="method-item">
                    <div class="method-icon">📚</div>
                    <h3>실습 중심</h3>
                    <p>실제 기업 사례를 활용한 프로젝트 기반 학습</p>
                </div>
                <div class="method-item">
                    <div class="method-icon">🏆</div>
                    <h3>수료증 발급</h3>
                    <p>과정 완료 시 SCM EXPERT 공식 수료증 발급</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA 섹션 -->
    <section class="cta">
        <div class="container">
            <div class="cta-content">
                <h2>지금 시작하세요!</h2>
                <p>전문적인 SCM 교육으로 커리어를 한 단계 업그레이드하세요</p>
                <div class="cta-buttons">
                    <a href="contact.php" class="btn btn-primary">수강 상담</a>
                    <a href="tel:02-1234-5678" class="btn btn-secondary">전화 문의</a>
                </div>
            </div>
        </div>
    </section>

    <!-- 푸터 -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>SCM EXPERT</h3>
                    <p>공급망관리 전문 교육 및 컨설팅</p>
                </div>
                <div class="footer-section">
                    <h4>서비스</h4>
                    <ul>
                        <li><a href="courses.php">강의</a></li>
                        <li><a href="consulting.php">컨설팅</a></li>
                        <li><a href="contact.php">문의</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>연락처</h4>
                    <p>이메일: info@scmexpert.com</p>
                    <p>전화: 02-1234-5678</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 SCM EXPERT. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- JavaScript -->
    <script src="js/main.js"></script>
    <script>
        // 강의 문의 함수
        function inquireCourse(courseId, courseTitle) {
            console.log('강의 문의 클릭:', courseId, courseTitle);
            
            // 문의 페이지로 이동하면서 강의 정보 전달
            const params = new URLSearchParams({
                type: 'course',
                course_id: courseId,
                course_title: courseTitle
            });
            
            window.location.href = `contact.php?${params.toString()}`;
        }
        
        // 강의 상세 보기 함수
        function viewCourseDetail(courseId) {
            console.log('강의 상세 보기 클릭:', courseId);
            
            // 향후 강의 상세 페이지 구현 예정
            SCMExpert.Utils.showAlert('강의 상세 페이지는 준비 중입니다. 문의해 주세요!', 'info');
        }
        
        // 페이지 로드 시 로그
        document.addEventListener('DOMContentLoaded', function() {
            console.log('강의 페이지 로드 완료');
        });
    </script>
</body>
</html>