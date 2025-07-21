<?php
// Enhanced index.php with modern design and Notion integration
require_once 'config-enhanced.php';

// 로그 기록
logActivity("메인 페이지 접근 - IP: " . $_SERVER['REMOTE_ADDR']);

// 노션에서 최신 강의 정보 가져오기 (옵션)
$featuredCourses = [];
$testimonials = [];

try {
    $notion = getNotionClient();
    // 노션 연동이 설정된 경우 데이터 가져오기
    if (NOTION_API_KEY !== 'your_notion_api_key_here') {
        // 인기 강의 가져오기
        $coursesResponse = $notion->queryDatabase(NOTION_COURSES_DB, 
            ['property' => 'Status', 'select' => ['equals' => '모집중']], 
            [['property' => 'Enrolled', 'direction' => 'descending']], 
            3
        );
        if (!isset($coursesResponse['error'])) {
            $featuredCourses = $notion->parseResponse($coursesResponse);
        }
    }
} catch (Exception $e) {
    logActivity("노션 연동 오류: " . $e->getMessage(), 'ERROR');
}
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo SITE_NAME; ?> - 글로벌 컨설팅펌 현직 컨설턴트의 SCM 전문 교육</title>
    <meta name="description" content="<?php echo SITE_DESCRIPTION; ?>">
    
    <!-- Modern Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- CSS Files -->
    <link rel="stylesheet" href="css/modern-style.css">
    <link rel="stylesheet" href="css/responsive.css">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="images/favicon.ico">
</head>
<body>
    <!-- Theme Toggle Button -->
    <div class="theme-toggle" onclick="toggleTheme()">
        <span id="theme-icon">🌙</span>
    </div>
    
    <!-- Modern Header with Glassmorphism -->
    <header class="header">
        <nav class="navbar">
            <div class="container">
                <div class="nav-brand">
                    <h1><?php echo SITE_NAME; ?></h1>
                    <span class="tagline">Supply Chain Excellence</span>
                </div>
                <ul class="nav-menu">
                    <li><a href="index.php" class="active">홈</a></li>
                    <li><a href="about.php">소개</a></li>
                    <li><a href="courses.php">강의</a></li>
                    <li><a href="consulting.php">컨설팅</a></li>
                    <li><a href="register.php">수강신청</a></li>
                    <li><a href="contact.php">문의</a></li>
                </ul>
                <div class="nav-toggle" onclick="toggleMenu()">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>
    </header>

    <!-- Enhanced Hero Section -->
    <section class="hero">
        <div class="container">
            <div class="hero-content page-transition">
                <h1 class="hero-title">
                    <span class="gradient-text">SCM 전문가와</span><br>
                    함께 성장하세요
                </h1>
                <p class="hero-subtitle">
                    글로벌 컨설팅펌 현직 컨설턴트의 실무 경험으로<br>
                    <strong>올바른 Strategy</strong>를 잡고, <strong>Time</strong>을 줄이며, <strong>Value</strong>를 높여보세요
                </p>
                <div class="hero-buttons">
                    <a href="courses.php" class="btn btn-primary">
                        <span>강의 둘러보기</span>
                    </a>
                    <a href="register.php" class="btn btn-primary">
                        <span>수강 신청</span>
                    </a>
                    <a href="consulting.php" class="btn btn-secondary">
                        <span>컨설팅 문의</span>
                    </a>
                </div>
                <div class="hero-stats">
                    <div class="stat-item">
                        <span class="stat-number">500+</span>
                        <span class="stat-label">수강생</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">98%</span>
                        <span class="stat-label">만족도</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">50+</span>
                        <span class="stat-label">기업 컨설팅</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Enhanced Services Section -->
    <section class="services">
        <div class="container">
            <h2 class="section-title fade-in">전문 서비스</h2>
            <p class="section-subtitle fade-in">현업 경험을 바탕으로 한 실무 중심 교육</p>
            
            <div class="services-grid">
                <div class="service-card fade-in">
                    <div class="service-icon">🎯</div>
                    <h3>SCM 전문 강연</h3>
                    <p>SCM 공급망관리 트렌드와 SAP ERP SCM모듈에 대한 실무 중심 강연을 제공합니다.</p>
                    <ul class="service-features">
                        <li>✓ 실제 프로젝트 사례 분석</li>
                        <li>✓ 글로벌 기업 베스트 프랙티스</li>
                        <li>✓ 실습 위주의 교육</li>
                    </ul>
                    <a href="courses.php" class="service-link">자세히 보기 →</a>
                </div>
                
                <div class="service-card fade-in">
                    <div class="service-icon">🚀</div>
                    <h3>컨설팅 도구</h3>
                    <p>글로벌 빅4 컨설팅펌에서 사용하는 타이탄의 도구를 통해 생산성을 높여보세요.</p>
                    <ul class="service-features">
                        <li>✓ 전략 프레임워크</li>
                        <li>✓ 데이터 분석 템플릿</li>
                        <li>✓ 프로젝트 관리 도구</li>
                    </ul>
                    <a href="consulting.php" class="service-link">자세히 보기 →</a>
                </div>
                
                <div class="service-card fade-in">
                    <div class="service-icon">💼</div>
                    <h3>커리어 컨설팅</h3>
                    <p>이력서, 자소서, 면접 컨설팅을 통해 논리적 구조화로 커리어 발전을 도와드립니다.</p>
                    <ul class="service-features">
                        <li>✓ 1:1 맞춤형 컨설팅</li>
                        <li>✓ 실전 면접 코칭</li>
                        <li>✓ 커리어 로드맵 설계</li>
                    </ul>
                    <a href="contact.php" class="service-link">문의하기 →</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Featured Courses Section (Notion Integration) -->
    <?php if (!empty($featuredCourses)): ?>
    <section class="featured-courses">
        <div class="container">
            <h2 class="section-title fade-in">인기 강의</h2>
            <div class="courses-grid">
                <?php foreach ($featuredCourses as $course): ?>
                <div class="course-card fade-in">
                    <div class="course-header">
                        <h3><?php echo htmlspecialchars($course['Name']); ?></h3>
                        <span class="course-level"><?php echo htmlspecialchars($course['Level']); ?></span>
                    </div>
                    <div class="course-content">
                        <p><?php echo htmlspecialchars($course['Description']); ?></p>
                        <div class="course-info">
                            <span>📅 <?php echo htmlspecialchars($course['Duration']); ?></span>
                            <span>💰 <?php echo number_format($course['Price']); ?>원</span>
                        </div>
                    </div>
                    <div class="course-footer">
                        <a href="register.php?course=<?php echo urlencode($course['Name']); ?>" class="btn btn-primary">수강신청</a>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>
    </section>
    <?php endif; ?>

    <!-- Why Choose Us Section -->
    <section class="why-us">
        <div class="container">
            <h2 class="section-title fade-in">왜 SCM EXPERT를 선택해야 할까요?</h2>
            <div class="features-grid">
                <div class="feature fade-in">
                    <h4>🌍 글로벌 컨설팅펌 현직</h4>
                    <p>글로벌 컨설팅펌 일원으로 다양한 산업군의 기업과 개인을 도움</p>
                </div>
                <div class="feature fade-in">
                    <h4>🎤 실제 강연 경험</h4>
                    <p>SCM, SAP ERP, 컨설팅 도구, 커리어 컨설팅 등 다양한 분야의 실제 강연 경험</p>
                </div>
                <div class="feature fade-in">
                    <h4>🎯 올바른 Strategy</h4>
                    <p>올바른 전략을 잡을 수 있도록 논리적 구조화와 체계적 접근을 제공</p>
                </div>
                <div class="feature fade-in">
                    <h4>🤝 동반 성장</h4>
                    <p>단순한 지식 전달이 아닌 함께 성장하여 지속적인 가치 창출을 목표로 함</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials">
        <div class="container">
            <h2 class="section-title fade-in">수강생 후기</h2>
            <div class="testimonials-grid">
                <div class="testimonial-card glass-card fade-in">
                    <div class="testimonial-content">
                        <p>"실무에서 바로 적용할 수 있는 내용들로 구성되어 있어 정말 유익했습니다. 특히 SAP 모듈에 대한 이해도가 크게 향상되었습니다."</p>
                    </div>
                    <div class="testimonial-author">
                        <strong>김OO</strong> | 대기업 SCM 담당자
                    </div>
                </div>
                <div class="testimonial-card glass-card fade-in">
                    <div class="testimonial-content">
                        <p>"컨설팅 도구 강의를 통해 업무 효율성이 크게 개선되었습니다. 강사님의 실제 경험을 바탕으로 한 조언이 특히 도움이 되었습니다."</p>
                    </div>
                    <div class="testimonial-author">
                        <strong>이OO</strong> | 스타트업 대표
                    </div>
                </div>
                <div class="testimonial-card glass-card fade-in">
                    <div class="testimonial-content">
                        <p>"커리어 컨설팅을 통해 원하던 회사에 합격할 수 있었습니다. 논리적인 사고와 구조화된 답변법이 큰 도움이 되었습니다."</p>
                    </div>
                    <div class="testimonial-author">
                        <strong>박OO</strong> | 컨설팅펌 입사
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Enhanced CTA Section -->
    <section class="cta">
        <div class="container">
            <div class="cta-content">
                <h2 class="fade-in">지금 시작하세요!</h2>
                <p class="fade-in">SCM 전문가로의 여정을 함께 시작해보세요</p>
                <div class="cta-buttons fade-in">
                    <a href="contact.php" class="btn btn-primary">무료 상담 신청</a>
                    <a href="courses.php" class="btn btn-secondary">강의 살펴보기</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Modern Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3><?php echo SITE_NAME; ?></h3>
                    <p>공급망관리 전문 교육 및 컨설팅</p>
                    <div class="social-links">
                        <a href="#" aria-label="LinkedIn">💼</a>
                        <a href="#" aria-label="YouTube">📺</a>
                        <a href="mailto:<?php echo ADMIN_EMAIL; ?>" aria-label="Email">✉️</a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>서비스</h4>
                    <ul>
                        <li><a href="courses.php">강의</a></li>
                        <li><a href="consulting.php">컨설팅</a></li>
                        <li><a href="register.php">수강신청</a></li>
                        <li><a href="contact.php">문의</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>정보</h4>
                    <ul>
                        <li><a href="about.php">강사소개</a></li>
                        <li><a href="#">이용약관</a></li>
                        <li><a href="#">개인정보처리방침</a></li>
                        <li><a href="#">FAQ</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>연락처</h4>
                    <p>이메일: <?php echo ADMIN_EMAIL; ?></p>
                    <p>전화: 문의는 이메일로 부탁드립니다</p>
                    <p>운영시간: 평일 09:00 - 18:00</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 <?php echo SITE_NAME; ?>. All rights reserved. | Powered by Notion Integration</p>
            </div>
        </div>
    </footer>

    <!-- Enhanced JavaScript -->
    <script>
    // 테마 토글
    function toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const icon = document.getElementById('theme-icon');
        icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        
        console.log('테마 변경:', newTheme);
    }

    // 저장된 테마 적용
    document.addEventListener('DOMContentLoaded', function() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        document.getElementById('theme-icon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    });

    // 모바일 메뉴 토글
    function toggleMenu() {
        const navMenu = document.querySelector('.nav-menu');
        navMenu.classList.toggle('active');
        console.log('메뉴 토글');
    }

    // 스크롤 애니메이션
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // 부드러운 스크롤
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 페이지 로드 완료 로그
    window.addEventListener('load', function() {
        console.log('페이지 로드 완료');
        console.log('노션 연동 상태:', <?php echo NOTION_API_KEY !== 'your_notion_api_key_here' ? 'true' : 'false'; ?>);
    });
    </script>
</body>
</html>