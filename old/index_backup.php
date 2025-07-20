<?php
// 로그 기록 함수
function writeLog($message) {
    $logFile = '../logs/access.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[{$timestamp}] {$message}" . PHP_EOL;
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
}

// 페이지 접근 로그
writeLog("메인 페이지 접근 - IP: " . $_SERVER['REMOTE_ADDR']);

session_start();
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SCM 전문가 양성 - 강의 및 컨설팅</title>
    <meta name="description" content="글로벌 컨설팅펌 현직 컨설턴트가 제공하는 SCM 전문 강의와 커리어 컨설팅 서비스">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/modern-style.css">
    <link rel="stylesheet" href="css/bento-grid.css">
    <link rel="stylesheet" href="css/animations.css">
    <link rel="stylesheet" href="css/responsive.css">
</head>
<body>
    <!-- 프리로더 -->
    <div class="preloader">
        <div class="loader-modern"></div>
    </div>
    
    <!-- 헤더 -->
    <header class="header modern-header glass-effect">
        <nav class="navbar">
            <div class="container">
                <div class="nav-brand">
                    <h1>SCM EXPERT</h1>
                    <span class="tagline">Supply Chain Management</span>
                </div>
                <ul class="nav-menu">
                    <li><a href="index.php" class="active">홈</a></li>
                    <li><a href="about.php">소개</a></li>
                    <li><a href="courses.php">강의</a></li>
                    <li><a href="consulting.php">컨설팅</a></li>
                    <li><a href="register.php">수강신청</a></li>
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

    <!-- Bento Grid Hero Section -->
    <section class="bento-section" style="margin-top: 100px;">
        <div class="bento-container">
            <div class="bento-grid">
                <!-- Hero Card -->
                <div class="bento-card bento-hero full-width">
                    <h1 class="bento-title gradient-text">SCM 전문가와 함께 성장하세요</h1>
                    <p class="bento-subtitle">
                        글로벌 컨설팅펌 현직 컨설턴트의 실무 경험으로<br>
                        올바른 Strategy를 잡고, Time을 줄이며, Value를 높여보세요
                    </p>
                    <div class="hero-buttons">
                        <a href="courses.php" class="btn btn-modern btn-primary ripple">강의 둘러보기</a>
                        <a href="register.php" class="btn btn-modern btn-primary ripple">수강 신청</a>
                        <a href="consulting.php" class="btn btn-modern btn-secondary ripple">컨설팅 문의</a>
                    </div>
                </div>

                <!-- Stats Card -->
                <div class="bento-card bento-stats large">
                    <h3 class="bento-title" style="color: white;">검증된 실적</h3>
                    <div class="stat-grid">
                        <div class="stat-item">
                            <span class="stat-number">500+</span>
                            <span class="stat-label">수강생</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">50+</span>
                            <span class="stat-label">기업 컨설팅</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">95%</span>
                            <span class="stat-label">만족도</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">10년</span>
                            <span class="stat-label">현직 경력</span>
                        </div>
                    </div>
                </div>

                <!-- Service Cards -->
                <div class="bento-card bento-service">
                    <div class="bento-icon">🎯</div>
                    <h3 class="bento-title">SCM 전문 강연</h3>
                    <p class="bento-subtitle">SCM 공급망관리 트렌드와 SAP ERP SCM모듈 실무 중심 강연</p>
                    <a href="courses.php" class="service-link">자세히 보기 →</a>
                </div>

                <div class="bento-card bento-service">
                    <div class="bento-icon">🚀</div>
                    <h3 class="bento-title">컨설팅 도구</h3>
                    <p class="bento-subtitle">글로벌 빅4 컨설팅펌의 타이탄의 도구로 생산성 향상</p>
                    <a href="consulting.php" class="service-link">자세히 보기 →</a>
                </div>

                <!-- Feature Card -->
                <div class="bento-card bento-feature wide">
                    <span class="feature-badge">HOT</span>
                    <h3 class="bento-title">커리어 컨설팅</h3>  
                    <p class="bento-subtitle">이력서, 자소서, 면접 컨설팅을 통한 논리적 구조화로 커리어 발전 지원</p>
                    <div class="process-steps">
                        <div class="process-step">
                            <span class="step-number">1</span>
                            <span>현황 분석 및 목표 설정</span>
                        </div>
                        <div class="process-step">
                            <span class="step-number">2</span>
                            <span>맞춤형 전략 수립</span>
                        </div>
                        <div class="process-step">
                            <span class="step-number">3</span>
                            <span>실행 및 피드백</span>
                        </div>
                    </div>
                </div>

                <!-- Testimonial Card -->
                <div class="bento-card bento-testimonial">
                    <p class="testimonial-text">"실무에 바로 적용할 수 있는 인사이트를 얻었습니다. 체계적인 커리큘럼과 현직자의 생생한 경험담이 큰 도움이 되었습니다."</p>
                    <p class="testimonial-author">- 대기업 SCM 담당자</p>
                </div>

                <!-- CTA Card -->
                <div class="bento-card bento-cta">
                    <h3 class="bento-title" style="color: white;">지금 시작하세요!</h3>
                    <p class="bento-subtitle" style="color: rgba(255,255,255,0.9);">SCM 전문가로의 여정을 함께 시작해보세요</p>
                    <a href="contact.php" class="btn">무료 상담 신청</a>
                </div>

                <!-- Course Preview -->
                <div class="bento-card wide">
                    <h3 class="bento-title">인기 강의</h3>
                    <div class="course-preview">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <div>
                                <h4 style="margin: 0;">SCM 기초 완성 과정</h4>
                                <p style="color: #718096; margin: 0.25rem 0;">4주 완성 | 초급자 대상</p>
                            </div>
                            <span style="color: #667eea; font-weight: 700;">350,000원</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="margin: 0;">SCM 실무 마스터 과정</h4>
                                <p style="color: #718096; margin: 0.25rem 0;">6주 완성 | 중급자 대상</p>
                            </div>
                            <span style="color: #667eea; font-weight: 700;">580,000원</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Why Choose Us Section with Bento Style -->
    <section class="bento-section" style="background: #f8f9fa; padding: 80px 0;">
        <div class="bento-container">
            <h2 class="section-title">왜 SCM EXPERT를 선택해야 할까요?</h2>
            <div class="bento-grid">
                <div class="bento-card">
                    <div class="bento-icon">🌍</div>
                    <h4 class="bento-title">글로벌 컨설팅펌 현직</h4>
                    <p class="bento-subtitle">다양한 산업군의 기업과 개인을 돕는 실무 전문가</p>
                </div>
                <div class="bento-card">
                    <div class="bento-icon">📚</div>
                    <h4 class="bento-title">검증된 강연 경험</h4>
                    <p class="bento-subtitle">SCM, SAP ERP, 컨설팅 도구 등 다양한 분야 강연</p>
                </div>
                <div class="bento-card">
                    <div class="bento-icon">💡</div>
                    <h4 class="bento-title">올바른 Strategy</h4>
                    <p class="bento-subtitle">논리적 구조화와 체계적 접근으로 전략 수립</p>
                </div>
                <div class="bento-card">
                    <div class="bento-icon">🤝</div>
                    <h4 class="bento-title">동반 성장</h4>
                    <p class="bento-subtitle">지식 전달을 넘어 함께 성장하는 파트너십</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
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
                    <p>이메일: ahfifa88@gmail.com</p>
                    <p>전화: 문의는 이메일로 부탁드립니다</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 SCM EXPERT. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- JavaScript -->
    <script src="js/main.js"></script>
</body>
</html>