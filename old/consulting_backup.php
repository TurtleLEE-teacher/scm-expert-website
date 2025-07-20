<?php
// 로그 기록 함수
function writeLog($message) {
    $logFile = '../logs/access.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[{$timestamp}] {$message}" . PHP_EOL;
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
}

// 페이지 접근 로그
writeLog("컨설팅 페이지 접근 - IP: " . $_SERVER['REMOTE_ADDR']);

session_start();
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>컨설팅 - SCM 전문가 양성</title>
    <meta name="description" content="기업 맞춤형 SCM 컨설팅 서비스로 공급망 최적화와 성과 향상을 실현하세요.">
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
                    <li><a href="courses.php">강의</a></li>
                    <li><a href="consulting.php" class="active">컨설팅</a></li>
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
            <h1>SCM 컨설팅 서비스</h1>
            <p>기업 맞춤형 솔루션으로 공급망 혁신을 이끌어갑니다</p>
        </div>
    </section>

    <!-- 컨설팅 개요 -->
    <section class="consulting-overview">
        <div class="container">
            <div class="overview-content">
                <div class="overview-text">
                    <h2>왜 SCM 컨설팅이 필요한가요?</h2>
                    <p>급변하는 비즈니스 환경에서 효율적인 공급망 관리는 기업의 핵심 경쟁력입니다. 
                    전문적인 SCM 컨설팅을 통해 다음과 같은 성과를 달성할 수 있습니다:</p>
                    
                    <div class="benefits-cards">
                        <div class="benefit-card">
                            <div class="benefit-icon">💰</div>
                            <h4>비용 절감</h4>
                            <p>재고 최적화와 프로세스 개선을 통한 운영비용 20-30% 절감</p>
                        </div>
                        <div class="benefit-card">
                            <div class="benefit-icon">⚡</div>
                            <h4>효율성 향상</h4>
                            <p>리드타임 단축과 서비스 수준 향상으로 고객 만족도 증대</p>
                        </div>
                        <div class="benefit-card">
                            <div class="benefit-icon">🛡️</div>
                            <h4>리스크 관리</h4>
                            <p>공급망 리스크 식별 및 대응 체계 구축으로 안정성 확보</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 컨설팅 서비스 -->
    <section class="consulting-services">
        <div class="container">
            <h2 class="section-title">컨설팅 서비스</h2>
            <div class="services-grid">
                <div class="service-item">
                    <div class="service-header">
                        <div class="service-icon">📋</div>
                        <h3>SCM 진단 및 전략 수립</h3>
                    </div>
                    <div class="service-content">
                        <p>현재 공급망 상태를 정확히 진단하고 최적화 방안을 제시합니다.</p>
                        <ul class="service-features">
                            <li>현황 분석 및 문제점 도출</li>
                            <li>벤치마킹 및 개선 기회 식별</li>
                            <li>SCM 전략 로드맵 수립</li>
                            <li>KPI 설계 및 목표 설정</li>
                        </ul>
                        <div class="service-info">
                            <span class="duration">기간: 4-6주</span>
                            <span class="price">가격: 협의</span>
                        </div>
                    </div>
                </div>

                <div class="service-item">
                    <div class="service-header">
                        <div class="service-icon">📦</div>
                        <h3>재고 최적화 컨설팅</h3>
                    </div>
                    <div class="service-content">
                        <p>과도한 재고는 줄이고 서비스 수준은 높이는 재고 최적화를 실현합니다.</p>
                        <ul class="service-features">
                            <li>수요 예측 모델 구축</li>
                            <li>안전재고 및 발주점 최적화</li>
                            <li>ABC 분석 및 재고 관리 정책</li>
                            <li>재고 회전율 개선 방안</li>
                        </ul>
                        <div class="service-info">
                            <span class="duration">기간: 6-8주</span>
                            <span class="price">가격: 협의</span>
                        </div>
                    </div>
                </div>

                <div class="service-item">
                    <div class="service-header">
                        <div class="service-icon">🚛</div>
                        <h3>물류 네트워크 설계</h3>
                    </div>
                    <div class="service-content">
                        <p>최적의 물류 네트워크 구축으로 비용 절감과 서비스 향상을 동시에 달성합니다.</p>
                        <ul class="service-features">
                            <li>물류 네트워크 현황 분석</li>
                            <li>최적 거점 위치 선정</li>
                            <li>운송 경로 최적화</li>
                            <li>물류비 절감 방안 도출</li>
                        </ul>
                        <div class="service-info">
                            <span class="duration">기간: 8-12주</span>
                            <span class="price">가격: 협의</span>
                        </div>
                    </div>
                </div>

                <div class="service-item">
                    <div class="service-header">
                        <div class="service-icon">🤝</div>
                        <h3>공급업체 관리 체계</h3>
                    </div>
                    <div class="service-content">
                        <p>효과적인 공급업체 관리를 통해 품질 향상과 리스크 감소를 실현합니다.</p>
                        <ul class="service-features">
                            <li>공급업체 평가 및 선정 기준</li>
                            <li>공급업체 성과 관리 시스템</li>
                            <li>파트너십 및 협업 체계</li>
                            <li>공급 리스크 관리 방안</li>
                        </ul>
                        <div class="service-info">
                            <span class="duration">기간: 6-10주</span>
                            <span class="price">가격: 협의</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 컨설팅 프로세스 -->
    <section class="consulting-process">
        <div class="container">
            <h2 class="section-title">컨설팅 프로세스</h2>
            <div class="process-timeline">
                <div class="process-step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>초기 상담</h4>
                        <p>기업의 현황과 니즈를 파악하고 컨설팅 방향을 설정합니다.</p>
                    </div>
                </div>
                <div class="process-step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>현황 진단</h4>
                        <p>현재 SCM 시스템과 프로세스를 정밀 분석합니다.</p>
                    </div>
                </div>
                <div class="process-step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>솔루션 설계</h4>
                        <p>분석 결과를 바탕으로 맞춤형 개선 방안을 제시합니다.</p>
                    </div>
                </div>
                <div class="process-step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h4>실행 지원</h4>
                        <p>개선 방안의 구체적인 실행을 단계별로 지원합니다.</p>
                    </div>
                </div>
                <div class="process-step">
                    <div class="step-number">5</div>
                    <div class="step-content">
                        <h4>성과 측정</h4>
                        <p>개선 효과를 측정하고 지속적인 모니터링을 제공합니다.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 성공 사례 -->
    <section class="success-cases">
        <div class="container">
            <h2 class="section-title">성공 사례</h2>
            <div class="cases-grid">
                <div class="case-item">
                    <div class="case-header">
                        <h4>제조업 A사</h4>
                        <span class="case-type">재고 최적화</span>
                    </div>
                    <div class="case-content">
                        <p>수요 예측 정확도 향상과 재고 정책 개선을 통해</p>
                        <div class="case-results">
                            <div class="result-item">
                                <span class="result-value">25%</span>
                                <span class="result-label">재고 비용 절감</span>
                            </div>
                            <div class="result-item">
                                <span class="result-value">98%</span>
                                <span class="result-label">서비스 수준 달성</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="case-item">
                    <div class="case-header">
                        <h4>유통업 B사</h4>
                        <span class="case-type">물류 최적화</span>
                    </div>
                    <div class="case-content">
                        <p>물류 네트워크 재설계와 운송 최적화를 통해</p>
                        <div class="case-results">
                            <div class="result-item">
                                <span class="result-value">30%</span>
                                <span class="result-label">물류비 절감</span>
                            </div>
                            <div class="result-item">
                                <span class="result-value">40%</span>
                                <span class="result-label">배송시간 단축</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="case-item">
                    <div class="case-header">
                        <h4>전자업 C사</h4>
                        <span class="case-type">공급망 통합</span>
                    </div>
                    <div class="case-content">
                        <p>공급업체 관리 체계 구축과 협업 프로세스 개선을 통해</p>
                        <div class="case-results">
                            <div class="result-item">
                                <span class="result-value">50%</span>
                                <span class="result-label">리드타임 단축</span>
                            </div>
                            <div class="result-item">
                                <span class="result-value">15%</span>
                                <span class="result-label">구매비용 절감</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA 섹션 -->
    <section class="cta">
        <div class="container">
            <div class="cta-content">
                <h2>지금 시작하세요!</h2>
                <p>전문 컨설턴트와 함께 귀하의 공급망을 혁신해보세요</p>
                <div class="cta-buttons">
                    <a href="contact.php?type=consulting" class="btn btn-primary">무료 상담 신청</a>
                    <a href="tel:02-1234-5678" class="btn btn-secondary">전화 상담</a>
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
        // 페이지 로드 시 로그
        document.addEventListener('DOMContentLoaded', function() {
            console.log('컨설팅 페이지 로드 완료');
            
            // 서비스 카드 호버 효과
            const serviceItems = document.querySelectorAll('.service-item');
            serviceItems.forEach(item => {
                item.addEventListener('mouseenter', function() {
                    console.log('서비스 카드 호버:', this.querySelector('h3').textContent);
                });
            });
            
            // 성공 사례 카드 클릭 이벤트
            const caseItems = document.querySelectorAll('.case-item');
            caseItems.forEach(item => {
                item.addEventListener('click', function() {
                    const companyName = this.querySelector('h4').textContent;
                    console.log('성공 사례 클릭:', companyName);
                    SCMExpert.Utils.showAlert(`${companyName}의 성공 사례에 관심을 보여주셔서 감사합니다!`, 'info');
                });
            });
        });
    </script>
</body>
</html>