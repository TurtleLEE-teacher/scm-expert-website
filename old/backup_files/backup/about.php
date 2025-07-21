<?php
// 로그 기록 함수
function writeLog($message) {
    $logFile = '../logs/access.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[{$timestamp}] {$message}" . PHP_EOL;
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
}

// 페이지 접근 로그
writeLog("소개 페이지 접근 - IP: " . $_SERVER['REMOTE_ADDR']);

session_start();
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>소개 - SCM 전문가 양성</title>
    <meta name="description" content="글로벌 컨설팅펌 현직 컨설턴트가 제공하는 실무 중심 SCM 교육과 컨설팅 서비스를 소개합니다.">
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
                    <li><a href="about.php" class="active">소개</a></li>
                    <li><a href="courses.php">강의</a></li>
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
            <h1>SCM EXPERT 소개</h1>
            <p>글로벌 컨설팅펌 현직 컨설턴트의 실무 경험을 바탕으로 한 전문적인 SCM 교육</p>
        </div>
    </section>

    <!-- 강사 소개 -->
    <section class="instructor-intro">
        <div class="container">
            <div class="intro-content">
                <div class="intro-image">
                    <div class="placeholder-image">
                        <span>👨‍💼</span>
                    </div>
                </div>
                <div class="intro-text">
                    <h2>mlee463</h2>
                    <h3>글로벌 컨설팅펌 현직 컨설턴트</h3>
                    
                    <div class="career-summary">
                        <h4>전문가 소개</h4>
                        <ul>
                            <li>🏢 글로벌 컨설팅펌 일원으로 다양한 산업군 기업 컨설팅</li>
                            <li>💡 IT와 생산성을 좋아하는 현직 컨설턴트</li>
                            <li>🎯 올바른 Strategy를 잡을 수 있도록 지원</li>
                            <li>⌛ 타이탄의 도구로 Time을 줄일 수 있도록 지원</li>
                            <li>🚀 동반 성장하여 Value를 높일 수 있도록 지원</li>
                        </ul>
                    </div>
                    
                    <div class="expertise">
                        <h4>실제 강연 경험</h4>
                        <div class="expertise-tags">
                            <span class="tag">SCM 공급망관리 트렌드</span>
                            <span class="tag">SAP ERP SCM모듈</span>
                            <span class="tag">글로벌 컨설팅 도구</span>
                            <span class="tag">커리어 컨설팅</span>
                            <span class="tag">이력서/자소서/면접</span>
                            <span class="tag">논리적 구조화</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 우리의 철학 -->
    <section class="philosophy">
        <div class="container">
            <h2 class="section-title">컨설팅 철학</h2>
            <div class="philosophy-grid">
                <div class="philosophy-item">
                    <div class="philosophy-icon">🎯</div>
                    <h3>올바른 Strategy</h3>
                    <p>올바른 전략을 잡을 수 있도록 도움드립니다. 글로벌 컨설팅펌에서 사용하는 실제 방법론과 도구를 통해 올바른 방향을 제시합니다.</p>
                </div>
                <div class="philosophy-item">
                    <div class="philosophy-icon">⌛</div>
                    <h3>타이탄의 도구로 Time 단축</h3>
                    <p>시간을 줄일 수 있도록 도움드립니다. 효율적인 업무 방법과 생산성 도구를 통해 더 많은 성과를 더 빠르게 달성할 수 있도록 지원합니다.</p>
                </div>
                <div class="philosophy-item">
                    <div class="philosophy-icon">🚀</div>
                    <h3>동반 성장으로 Value 생성</h3>
                    <p>동반 성장하여 가치를 높일 수 있도록 도움드립니다. 단순한 지식 전달이 아닌, 함께 성장하며 지속적인 가치 창출을 목표로 합니다.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- 주요 강연 경험 -->
    <section class="achievements">
        <div class="container">
            <h2 class="section-title">실제 강연 경험</h2>
            <div class="lecture-experience">
                <div class="lecture-item">
                    <h4>🎯 SCM 공급망관리 트렌드</h4>
                    <p>"직무역량 강화 강연: SCM – 공급망관리 트렌드 및 직무 분석을 통한 커리어 강화"</p>
                </div>
                <div class="lecture-item">
                    <h4>💼 SAP ERP SCM모듈</h4>
                    <p>"직무역량 강화 강연: SAP ERP – SCM모듈 (구매,생산,영업) base의 커리어 역량 강화"</p>
                </div>
                <div class="lecture-item">
                    <h4>🚀 글로벌 컨설팅 도구</h4>
                    <p>"글로벌 빅4 컨설팅펌 컨설턴트가 쓰는 타이탄의 도구 : 연봉 3,000만원에서 1억원까지 🚀"</p>
                </div>
                <div class="lecture-item">
                    <h4>📄 커리어 컨설팅</h4>
                    <p>"이력서/자소서/면접 컨설팅: 논리적 구조 및 개인 경험 분해를 통한 기업 및 직무 alignment"</p>
                </div>
            </div>
        </div>
    </section>

    <!-- 검증된 커리어 성장 스토리 섹션 -->
    <section class="career-achievement" style="background: #f8f9fa; padding: 60px 0;">
        <div class="container">
            <h2 class="section-title">검증된 커리어 성장 스토리</h2>
            <div class="achievement-showcase" style="max-width: 900px; margin: 0 auto;">
                
                <div class="achievement-content" style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <div class="growth-visual" style="display: flex; justify-content: space-around; align-items: center; margin-bottom: 40px; flex-wrap: wrap; gap: 30px;">
                        
                        <!-- 2015년 시작 -->
                        <div class="start-point" style="text-align: center;">
                            <img src="images/portfolio/2015년연봉.png" alt="2015년 연봉" style="max-width: 120px; height: auto; margin-bottom: 10px;">
                            <h4 style="color: #2d3748; margin: 10px 0;">시작점</h4>
                            <p style="font-size: 24px; font-weight: 700; color: #4a5568; margin: 0;">2,983만원</p>
                            <p style="color: #718096; margin: 5px 0 0 0;">2015년</p>
                        </div>
                        
                        <!-- 성장 화살표 -->
                        <div class="growth-arrow" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                            <span style="font-size: 48px; color: #667eea; margin: 0 20px;">→</span>
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; border-radius: 20px; margin-top: 10px;">
                                <span style="font-size: 24px; font-weight: 700;">344% 성장</span>
                            </div>
                        </div>
                        
                        <!-- 2024년 현재 -->
                        <div class="current-point" style="text-align: center;">
                            <img src="images/portfolio/2024년연봉.png" alt="2024년 연봉" style="max-width: 120px; height: auto; margin-bottom: 10px;">
                            <h4 style="color: #667eea; margin: 10px 0;">현재</h4>
                            <p style="font-size: 24px; font-weight: 700; color: #667eea; margin: 0;">1억 3,259만원</p>
                            <p style="color: #718096; margin: 5px 0 0 0;">2024년</p>
                        </div>
                    </div>
                    
                    <div class="achievement-details" style="border-top: 2px solid #e2e8f0; padding-top: 30px;">
                        <h3 style="text-align: center; color: #2d3748; margin-bottom: 20px;">9년간의 커리어 성장 여정</h3>
                        
                        <div class="growth-factors" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
                            <div style="text-align: center; padding: 20px; background: #f7fafc; border-radius: 10px;">
                                <span style="font-size: 32px; margin-bottom: 10px; display: block;">💡</span>
                                <h4 style="color: #2d3748; margin: 0 0 10px 0;">전략적 사고</h4>
                                <p style="color: #4a5568; margin: 0; font-size: 14px;">글로벌 컨설팅 방법론 적용</p>
                            </div>
                            <div style="text-align: center; padding: 20px; background: #f7fafc; border-radius: 10px;">
                                <span style="font-size: 32px; margin-bottom: 10px; display: block;">⚡</span>
                                <h4 style="color: #2d3748; margin: 0 0 10px 0;">실행력</h4>
                                <p style="color: #4a5568; margin: 0; font-size: 14px;">빠른 학습과 적용</p>
                            </div>
                            <div style="text-align: center; padding: 20px; background: #f7fafc; border-radius: 10px;">
                                <span style="font-size: 32px; margin-bottom: 10px; display: block;">🤝</span>
                                <h4 style="color: #2d3748; margin: 0 0 10px 0;">네트워킹</h4>
                                <p style="color: #4a5568; margin: 0; font-size: 14px;">지속적인 관계 구축</p>
                            </div>
                        </div>
                        
                        <div class="achievement-message" style="text-align: center; background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 25px; border-radius: 15px;">
                            <p style="font-size: 18px; color: #2d3748; margin: 0; line-height: 1.8;">
                                실제로 경험하고 검증된 <strong style="color: #667eea;">커리어 성장 전략</strong>을<br>
                                강의와 컨설팅을 통해 <strong style="color: #667eea;">체계적으로 전수</strong>합니다
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- 이선생 캐릭터와 함께하는 메시지 -->
                <div style="margin-top: 40px; text-align: center;">
                    <img src="images/portfolio/이선생.png" alt="이선생" style="max-width: 150px; height: auto; margin-bottom: 20px;">
                    <p style="font-size: 16px; color: #4a5568; font-style: italic;">
                        "함께 성장하며 여러분의 커리어 목표를 달성해보세요!"<br>
                        - 이선생과 함께하는 SCM EXPERT
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- 핵심 역량 -->
    <section class="certifications">
        <div class="container">
            <h2 class="section-title">핵심 역량</h2>
            <div class="cert-grid">
                <div class="cert-item">
                    <h4>🎯 Strategy</h4>
                    <p>올바른 전략 수립 및 논리적 구조화</p>
                </div>
                <div class="cert-item">
                    <h4>⌛ Time Management</h4>
                    <p>생산성 향상 및 효율적 업무 방법</p>
                </div>
                <div class="cert-item">
                    <h4>🚀 Value Creation</h4>
                    <p>동반 성장 및 지속적 가치 창출</p>
                </div>
                <div class="cert-item">
                    <h4>💼 IT & Productivity</h4>
                    <p>IT 도구 활용 및 생산성 최적화</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA 섹션 -->
    <section class="cta">
        <div class="container">
            <div class="cta-content">
                <h2>함께 성장해나가요!</h2>
                <p>SCM 전문가와 함께하는 여정을 시작하세요</p>
                <a href="contact.php" class="btn btn-primary">상담 신청하기</a>
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