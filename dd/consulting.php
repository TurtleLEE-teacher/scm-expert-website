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
    <title>컨설팅 - SCM 커리어 컨설팅</title>
    <meta name="description" content="글로벌 컨설팅펌 현직자의 1:1 맞춤형 커리어 컨설팅과 소규모 그룹 컨설팅 서비스">
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
            <h1>SCM 커리어 컨설팅</h1>
            <p>글로벌 컨설팅펌 현직자가 제공하는 맞춤형 커리어 컨설팅 서비스</p>
        </div>
    </section>

    <!-- 컨설팅 개요 -->
    <section class="consulting-overview">
        <div class="container">
            <div class="overview-content">
                <div class="overview-text">
                    <h2>왜 SCM 커리어 컨설팅이 필요한가요?</h2>
                    <p>SCM 분야의 취업과 커리어 발전을 위해서는 전문가의 맞춤형 조언이 필요합니다. 
                    글로벌 컨설팅펌 현직자의 경험을 바탕으로 다음과 같은 성과를 달성할 수 있습니다:</p>
                    
                    <div class="benefits-cards">
                        <div class="benefit-card">
                            <div class="benefit-icon">🎯</div>
                            <h4>논리적 구조화</h4>
                            <p>이력서/자소서의 논리적 구조 및 개인 경험 분해로 차별화된 서류 완성</p>
                        </div>
                        <div class="benefit-card">
                            <div class="benefit-icon">💼</div>
                            <h4>맞춤형 전략</h4>
                            <p>SCM/구매/생산관리 직무별 핵심 역량 강화 전략 수립</p>
                        </div>
                        <div class="benefit-card">
                            <div class="benefit-icon">🚀</div>
                            <h4>실전 대비</h4>
                            <p>산업군별 특화된 피드백과 실전 중심의 모의면접 진행</p>
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
            
            <!-- 소규모 그룹 컨설팅 -->
            <div class="consulting-type">
                <h3 class="type-title">소규모 그룹 컨설팅 <span class="badge">SCM 캐프 수강생 전용</span></h3>
                <div class="group-consulting-card">
                    <div class="consulting-header">
                        <div class="consulting-icon">👥</div>
                        <h4>캐프 수강 후 더 깊은 커리어 컨설팅</h4>
                    </div>
                    <div class="consulting-content">
                        <p>수강생들을 위한 특별한 소규모 그룹 컨설팅 옵션입니다. 동료들과 함께 네트워킹하며 맞춤형 피드백을 받을 수 있습니다.</p>
                        <ul class="consulting-features">
                            <li>✓ 3명 이상 그룹 컨설팅 (미달시 1:1 진행)</li>
                            <li>✓ 수강 내용 기반 맞춤형 피드백</li>
                            <li>✓ 이력서/자소서 기반 맞춤형 면접 질문 도출</li>
                            <li>✓ 동료와의 네트워킹 및 정보 공유</li>
                            <li>✓ 1회 60분 그룹 컨설팅</li>
                        </ul>
                        <div class="consulting-info">
                            <div class="price-box">
                                <span class="price">₩100,000</span>
                                <span class="duration">(수강 신청시 옵션 추가)</span>
                            </div>
                            <button class="btn btn-primary"
                                    onclick="inquireConsulting('group')">
                                수강 신청시 추가
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 단독 컨설팅 패키지 -->
            <div class="consulting-type">
                <h3 class="type-title">단독 컨설팅 패키지 <span class="badge-alt">코스 미수강자 대상</span></h3>
                <div class="services-grid">
                    <div class="service-item">
                        <div class="service-header">
                            <div class="service-icon">🏆</div>
                            <h3>STANDARD</h3>
                            <div class="service-badge">1:1 컨설팅</div>
                        </div>
                        <div class="service-content">
                            <p>이력서 검토와 커리어 방향성 수립을 위한 기본 패키지</p>
                            <ul class="service-features">
                                <li>✓ 이력서/자소서 검토 및 피드백</li>
                                <li>✓ 커리어 방향성 수립</li>
                                <li>✓ SCM 직무 적합도 분석</li>
                                <li>✓ 1:1 맞춤형 피드백</li>
                                <li>✓ 1회 60분 세션</li>
                            </ul>
                            <div class="service-info">
                                <div class="price-highlight">₩150,000</div>
                                <button class="btn btn-secondary"
                                        onclick="inquireConsulting('standard')">
                                    상담 신청
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="service-item featured">
                        <div class="service-header">
                            <div class="service-icon">✨</div>
                            <h3>DELUXE</h3>
                            <div class="service-badge">BEST CHOICE</div>
                        </div>
                        <div class="service-content">
                            <p>STANDARD + 2차 피드백과 모의면접을 포함한 특별 패키지</p>
                            <ul class="service-features">
                                <li>✓ STANDARD 패키지 전체 포함</li>
                                <li>✓ 2차 피드백 제공</li>
                                <li>✓ 1:1 모의면접 진행</li>
                                <li>✓ 산업군별 특화 전략</li>
                                <li>✓ 2회 각 60분 세션</li>
                            </ul>
                            <div class="service-info">
                                <div class="price-highlight">₩200,000</div>
                                <button class="btn btn-primary"
                                        onclick="inquireConsulting('deluxe')">
                                    상담 신청
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="service-item">
                        <div class="service-header">
                            <div class="service-icon">💎</div>
                            <h3>PREMIUM</h3>
                            <div class="service-badge">FULL PACKAGE</div>
                        </div>
                        <div class="service-content">
                            <p>DELUXE + 3차 피드백과 추가 모의면접을 포함한 풀 패키지</p>
                            <ul class="service-features">
                                <li>✓ DELUXE 패키지 전체 포함</li>
                                <li>✓ 3차 피드백 제공</li>
                                <li>✓ 추가 모의면접 진행</li>
                                <li>✓ 실전 컴펙스 타겟 훈련</li>
                                <li>✓ 3회 각 60분 세션</li>
                            </ul>
                            <div class="service-info">
                                <div class="price-highlight">₩250,000</div>
                                <button class="btn btn-secondary"
                                        onclick="inquireConsulting('premium')">
                                    상담 신청
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 커리어 컨설팅 프로세스 -->
    <section class="consulting-process">
        <div class="container">
            <h2 class="section-title">커리어 컨설팅 프로세스</h2>
            <div class="process-timeline">
                <div class="process-step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>현황 분석</h4>
                        <p>이력서와 경력사항을 분석하여 현재 위치를 파악합니다.</p>
                    </div>
                </div>
                <div class="process-step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>목표 설정</h4>
                        <p>커리어 목표와 희망 직무를 명확히 정의합니다.</p>
                    </div>
                </div>
                <div class="process-step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>전략 수립</h4>
                        <p>맞춤형 커리어 전략과 실행 계획을 수립합니다.</p>
                    </div>
                </div>
                <div class="process-step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h4>실전 대비</h4>
                        <p>이력서 작성, 자소서 구성, 면접 준비를 진행합니다.</p>
                    </div>
                </div>
                <div class="process-step">
                    <div class="step-number">5</div>
                    <div class="step-content">
                        <h4>지속 지원</h4>
                        <p>취업 후에도 커리어 발전을 위한 조언을 제공합니다.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- 성공 사례 -->
    <section class="success-cases">
        <div class="container">
            <h2 class="section-title">컨설팅 성공 사례</h2>
            <div class="cases-grid">
                <div class="case-item">
                    <div class="case-header">
                        <h4>대기업 SCM 직무 전환</h4>
                        <span class="case-type">커리어 전환</span>
                    </div>
                    <div class="case-content">
                        <p>제조업 생산관리에서 SCM 컨설턴트로 성공적 전환</p>
                        <div class="case-results">
                            <div class="result-item">
                                <span class="result-value">3개월</span>
                                <span class="result-label">전직 성공</span>
                            </div>
                            <div class="result-item">
                                <span class="result-value">35%</span>
                                <span class="result-label">연봉 상승</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="case-item">
                    <div class="case-header">
                        <h4>글로벌 기업 취업</h4>
                        <span class="case-type">신입 취업</span>
                    </div>
                    <div class="case-content">
                        <p>SCM 무경험에서 글로벌 기업 SCM 직무 합격</p>
                        <div class="case-results">
                            <div class="result-item">
                                <span class="result-value">5개</span>
                                <span class="result-label">최종 합격</span>
                            </div>
                            <div class="result-item">
                                <span class="result-value">100%</span>
                                <span class="result-label">서류 통과율</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="case-item">
                    <div class="case-header">
                        <h4>컨설팅펌 이직</h4>
                        <span class="case-type">경력 이직</span>
                    </div>
                    <div class="case-content">
                        <p>대기업 SCM에서 글로벌 컨설팅펌 컨설턴트로 이직</p>
                        <div class="case-results">
                            <div class="result-item">
                                <span class="result-value">빅4</span>
                                <span class="result-label">컨설팅펌 합격</span>
                            </div>
                            <div class="result-item">
                                <span class="result-value">50%</span>
                                <span class="result-label">연봉 상승</span>
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
                    <a href="mailto:ahfifa88@gmail.com" class="btn btn-secondary">이메일 문의</a>
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
                    <p>이메일: ahfifa88@gmail.com</p>
                    <p>글로벌 컨설팅펌 현직 컨설턴트</p>
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