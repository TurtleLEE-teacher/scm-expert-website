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
    <title>SCM 전문가 양성 - 글로벌 컨설팅펌 현직 컨설턴트</title>
    <meta name="description" content="글로벌 컨설팅펌 현직 컨설턴트가 제공하는 SCM 전문 강의와 커리어 컨설팅 서비스">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/modern-style.css">
    <link rel="stylesheet" href="css/bento-grid.css">
    <link rel="stylesheet" href="css/animations.css">
    <link rel="stylesheet" href="css/responsive.css">
    <!-- Apple 스타일 폰트 -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
    </style>
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
                    <span class="tagline">by Global Consulting Firm</span>
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

    <!-- 메인 히어로 섹션 with Bento Grid -->
    <section class="hero-bento">
        <div class="container">
            <div class="bento-grid">
                <!-- Hero Box -->
                <div class="bento-box bento-hero bento-span-4 bento-row-2 scroll-reveal">
                    <div class="bento-pattern"></div>
                    <h1 class="bento-title gradient-text">SCM 전문가와 함께하는<br>진짜 성장의 시작</h1>
                    <p class="bento-description">
                        글로벌 컨설팅펌 현직 컨설턴트가 전하는<br>
                        실무 중심 SCM 교육과 커리어 컨설팅
                    </p>
                    <div class="hero-buttons">
                        <a href="courses.php" class="bento-link">강의 시작하기</a>
                        <a href="register.php" class="btn btn-modern btn-secondary ripple">수강 신청</a>
                    </div>
                </div>

                <!-- Stats Box 1 -->
                <div class="bento-box bento-stats bento-span-2 fade-in-scale">
                    <div class="bento-stat-number">10+</div>
                    <div class="bento-stat-label">년간 컨설팅 경험</div>
                </div>

                <!-- Feature Box 1 - SCM 강연 -->
                <div class="bento-box bento-feature bento-span-2 slide-in-right">
                    <div class="bento-icon">📊</div>
                    <h3 class="bento-title">SCM 전문 강연</h3>
                    <p class="bento-description">공급망관리 트렌드와 SAP ERP SCM모듈 실무 강연</p>
                    <a href="courses.php" class="bento-link">자세히 보기</a>
                </div>

                <!-- Feature Box 2 - 컨설팅 도구 -->
                <div class="bento-box bento-feature bento-span-3 slide-in-left">
                    <div class="bento-icon">🚀</div>
                    <h3 class="bento-title">타이탄의 도구</h3>
                    <p class="bento-description">글로벌 빅4 컨설팅펌에서 사용하는 검증된 방법론으로 생산성 극대화</p>
                    <a href="consulting.php" class="bento-link">도구 살펴보기</a>
                </div>

                <!-- Stats Box 2 -->
                <div class="bento-box bento-stats bento-span-2 fade-in-scale">
                    <div class="bento-stat-number">500+</div>
                    <div class="bento-stat-label">수강생 커리어 성장</div>
                </div>

                <!-- Image Box -->
                <div class="bento-box bento-image bento-span-2 bento-row-2">
                    <img src="images/scm-consulting.jpg" alt="SCM 컨설팅" onerror="this.style.display='none'">
                    <div class="bento-image-overlay">
                        <h3 class="bento-title">실무 중심 교육</h3>
                        <p>현장에서 바로 활용 가능한 실전 노하우</p>
                    </div>
                    <div class="bento-pattern"></div>
                </div>

                <!-- Testimonial Box -->
                <div class="bento-box bento-testimonial bento-span-4 slide-in-bottom">
                    <p class="bento-quote">"연봉 3,000만원에서 1억원까지, 올바른 전략과 도구로 커리어를 혁신하세요"</p>
                    <div class="bento-author">
                        <div class="bento-author-avatar">M</div>
                        <div class="bento-author-info">
                            <div class="bento-author-name">mlee463</div>
                            <div class="bento-author-role">글로벌 컨설팅펌 현직 컨설턴트</div>
                        </div>
                    </div>
                </div>

                <!-- Feature Box 3 - 커리어 컨설팅 -->
                <div class="bento-box bento-feature bento-span-2 fade-in">
                    <div class="bento-icon">💼</div>
                    <h3 class="bento-title">커리어 컨설팅</h3>
                    <p class="bento-description">이력서, 자소서, 면접 전략으로 논리적 구조화</p>
                    <a href="contact.php" class="bento-link">상담 신청</a>
                </div>

                <!-- CTA Box -->
                <div class="bento-box bento-cta bento-span-2 scale-pulse">
                    <h3 class="bento-title">준비되셨나요?</h3>
                    <p class="bento-description">지금 시작하면 3개월 후가 달라집니다</p>
                    <a href="register.php" class="bento-cta-button">무료 상담 신청</a>
                </div>
            </div>
        </div>
    </section>

    <!-- 강의 과정 Bento Grid -->
    <section class="courses-bento">
        <div class="container">
            <h2 class="section-title text-center">맞춤형 교육 프로그램</h2>
            <div class="bento-grid">
                <!-- SCM 기초 과정 -->
                <div class="bento-box bento-span-3 course-bento">
                    <div class="course-level">입문</div>
                    <h3 class="bento-title">SCM 기초 완성</h3>
                    <p class="bento-description">공급망관리의 핵심 개념부터 실무 적용까지 체계적으로 학습합니다.</p>
                    <div class="course-details">
                        <span>📅 4주 과정</span>
                        <span>💰 350,000원</span>
                    </div>
                    <a href="courses.php#basic" class="bento-link">커리큘럼 보기</a>
                </div>

                <!-- SCM 실무 과정 -->
                <div class="bento-box bento-span-3 course-bento">
                    <div class="course-level level-advanced">실무</div>
                    <h3 class="bento-title">SCM 실무 마스터</h3>
                    <p class="bento-description">현장에서 바로 활용 가능한 고급 SCM 실무 노하우를 전수합니다.</p>
                    <div class="course-details">
                        <span>📅 6주 과정</span>
                        <span>💰 580,000원</span>
                    </div>
                    <a href="courses.php#advanced" class="bento-link">커리큘럼 보기</a>
                </div>

                <!-- SAP 특화 과정 -->
                <div class="bento-box bento-span-2 course-bento special">
                    <div class="course-level level-special">특화</div>
                    <h3 class="bento-title">SAP ERP SCM</h3>
                    <p class="bento-description">구매, 생산, 영업 기반 SAP 모듈 전문가 과정</p>
                    <a href="courses.php#sap" class="bento-link">자세히 보기</a>
                </div>

                <!-- 컨설팅 도구 과정 -->
                <div class="bento-box bento-span-2 course-bento special">
                    <div class="course-level level-special">특별</div>
                    <h3 class="bento-title">컨설팅 도구 마스터</h3>
                    <p class="bento-description">글로벌 컨설팅펌의 검증된 도구 활용법</p>
                    <a href="consulting.php" class="bento-link">자세히 보기</a>
                </div>

                <!-- 1:1 코칭 -->
                <div class="bento-box bento-span-2 course-bento premium">
                    <div class="course-level level-premium">프리미엄</div>
                    <h3 class="bento-title">1:1 커리어 코칭</h3>
                    <p class="bento-description">맞춤형 커리어 전략 수립</p>
                    <a href="contact.php" class="bento-link">상담 예약</a>
                </div>
            </div>
        </div>
    </section>

    <!-- 왜 선택해야 하는가 Bento Grid -->
    <section class="why-choose-bento">
        <div class="container">
            <h2 class="section-title text-center">왜 SCM EXPERT인가?</h2>
            <div class="bento-grid">
                <!-- 실무 경험 -->
                <div class="bento-box bento-span-2 feature-bento">
                    <div class="feature-icon">🌍</div>
                    <h3 class="bento-title">글로벌 컨설팅펌 현직</h3>
                    <p class="bento-description">다양한 산업군의 대기업 프로젝트 경험</p>
                </div>

                <!-- 검증된 강연 -->
                <div class="bento-box bento-span-2 feature-bento">
                    <div class="feature-icon">🎯</div>
                    <h3 class="bento-title">검증된 강연 경력</h3>
                    <p class="bento-description">SCM, SAP, 컨설팅 도구 다수 강연</p>
                </div>

                <!-- 실전 노하우 -->
                <div class="bento-box bento-span-2 feature-bento">
                    <div class="feature-icon">💡</div>
                    <h3 class="bento-title">실전 중심 커리큘럼</h3>
                    <p class="bento-description">이론이 아닌 현장 활용 중심</p>
                </div>

                <!-- 성공 사례 -->
                <div class="bento-box bento-span-3 success-story">
                    <h3 class="bento-title">500+ 수강생 성공 스토리</h3>
                    <div class="success-metrics">
                        <div class="metric">
                            <span class="metric-value">87%</span>
                            <span class="metric-label">연봉 상승</span>
                        </div>
                        <div class="metric">
                            <span class="metric-value">92%</span>
                            <span class="metric-label">직무 만족도</span>
                        </div>
                        <div class="metric">
                            <span class="metric-value">95%</span>
                            <span class="metric-label">추천 의향</span>
                        </div>
                    </div>
                </div>

                <!-- 네트워킹 -->
                <div class="bento-box bento-span-3 network-bento">
                    <div class="feature-icon">🤝</div>
                    <h3 class="bento-title">전문가 네트워크</h3>
                    <p class="bento-description">수강생 간 지속적인 교류와 성장 기회 제공</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA 섹션 -->
    <section class="final-cta">
        <div class="container">
            <div class="cta-bento-box">
                <h2 class="cta-title gradient-text">당신의 SCM 커리어,<br>지금 시작하세요</h2>
                <p class="cta-description">
                    글로벌 컨설팅펌 현직 컨설턴트와 함께<br>
                    체계적이고 실용적인 성장의 길을 걸어보세요
                </p>
                <div class="cta-buttons">
                    <a href="register.php" class="btn btn-primary btn-large">수강 신청하기</a>
                    <a href="contact.php" class="btn btn-secondary btn-large">무료 상담 받기</a>
                </div>
            </div>
        </div>
    </section>

    <!-- 푸터 -->
    <footer class="footer modern-footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>SCM EXPERT</h3>
                    <p>글로벌 컨설팅펌 현직 컨설턴트가<br>제공하는 프리미엄 SCM 교육</p>
                    <div class="footer-social">
                        <a href="mailto:ahfifa88@gmail.com" class="social-link">✉️</a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>프로그램</h4>
                    <ul>
                        <li><a href="courses.php">SCM 강의</a></li>
                        <li><a href="consulting.php">컨설팅 도구</a></li>
                        <li><a href="contact.php">커리어 컨설팅</a></li>
                        <li><a href="register.php">수강 신청</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>리소스</h4>
                    <ul>
                        <li><a href="about.php">강사 소개</a></li>
                        <li><a href="courses.php#reviews">수강 후기</a></li>
                        <li><a href="contact.php#faq">자주 묻는 질문</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>문의하기</h4>
                    <p>이메일: ahfifa88@gmail.com</p>
                    <p>상담 예약: <a href="contact.php">문의 페이지</a></p>
                    <div class="newsletter">
                        <p>최신 강의 소식을 받아보세요</p>
                        <a href="register.php" class="btn btn-sm btn-primary">뉴스레터 구독</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 SCM EXPERT. All rights reserved. | Designed with 💜 by mlee463</p>
            </div>
        </div>
    </footer>

    <!-- 스크롤 진행률 표시기 -->
    <div class="scroll-progress"></div>

    <!-- Theme Toggle -->
    <div class="theme-toggle" onclick="toggleTheme()">
        <span class="theme-icon">🌙</span>
    </div>

    <!-- JavaScript -->
    <script src="js/main.js"></script>
    <script>
        // Bento Grid 애니메이션
        document.addEventListener('DOMContentLoaded', function() {
            const bentoBoxes = document.querySelectorAll('.bento-box');
            
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        entry.target.style.animationDelay = Math.random() * 0.3 + 's';
                    }
                });
            }, observerOptions);
            
            bentoBoxes.forEach(box => {
                observer.observe(box);
            });
            
            // 스크롤 진행률 표시
            window.addEventListener('scroll', () => {
                const scrollProgress = document.querySelector('.scroll-progress');
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrolled = (window.scrollY / scrollHeight) * 100;
                scrollProgress.style.width = scrolled + '%';
            });
        });
        
        // 테마 토글
        function toggleTheme() {
            const body = document.body;
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            const icon = document.querySelector('.theme-icon');
            icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
        
        // 저장된 테마 적용
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'dark') {
            document.querySelector('.theme-icon').textContent = '☀️';
        }
    </script>
    
    <style>
        /* Additional Bento Grid Styles */
        .hero-bento {
            padding: 120px 0 80px;
            background: #f8fafc;
            position: relative;
            overflow: hidden;
        }
        
        .hero-bento::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at 30% 50%, rgba(102, 126, 234, 0.08) 0%, transparent 50%);
            animation: float 20s ease-in-out infinite;
        }
        
        .courses-bento, .why-choose-bento {
            padding: 80px 0;
            background: white;
        }
        
        .course-bento {
            position: relative;
            padding: 40px;
        }
        
        .course-level {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            background: #e0e7ff;
            color: #4338ca;
            margin-bottom: 16px;
        }
        
        .course-level.level-advanced {
            background: #fce7f3;
            color: #be185d;
        }
        
        .course-level.level-special {
            background: #ddd6fe;
            color: #6d28d9;
        }
        
        .course-level.level-premium {
            background: #fed7aa;
            color: #c2410c;
        }
        
        .course-details {
            display: flex;
            gap: 24px;
            margin: 20px 0;
            font-size: 16px;
            color: #64748b;
        }
        
        .success-metrics {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            margin-top: 24px;
        }
        
        .metric {
            text-align: center;
        }
        
        .metric-value {
            display: block;
            font-size: 36px;
            font-weight: 800;
            color: #667eea;
            margin-bottom: 8px;
        }
        
        .metric-label {
            font-size: 14px;
            color: #64748b;
        }
        
        .final-cta {
            padding: 100px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            position: relative;
            overflow: hidden;
        }
        
        .cta-bento-box {
            text-align: center;
            color: white;
            position: relative;
            z-index: 1;
        }
        
        .cta-title {
            font-size: 48px;
            font-weight: 800;
            margin-bottom: 24px;
            line-height: 1.2;
        }
        
        .cta-description {
            font-size: 20px;
            margin-bottom: 40px;
            opacity: 0.95;
        }
        
        .cta-buttons {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn-large {
            padding: 18px 40px;
            font-size: 18px;
        }
        
        .scroll-progress {
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            z-index: 9999;
            transition: width 0.3s ease;
        }
        
        .text-center {
            text-align: center;
        }
        
        .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .bento-hero .bento-title {
                font-size: 32px;
            }
            
            .cta-title {
                font-size: 32px;
            }
            
            .success-metrics {
                grid-template-columns: 1fr;
            }
        }
    </style>
</body>
</html>