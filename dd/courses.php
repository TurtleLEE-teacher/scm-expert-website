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

// 강의 데이터 - 새로운 SCM(ERP) 과정 구성
$courses = [
    [
        'id' => 1,
        'title' => 'SCM(ERP) 초급반',
        'subtitle' => '기업 업무 프로세스 전체 그림 이해 + SCM 4대 Function 실무 체험',
        'duration' => '5주 (3회 강의 + 4회 업무 체험)',
        'level' => '초급',
        'price' => '문의',
        'description' => '"전체적인 그림이 안 보여서 답답해요" 라는 고민을 해결하는 코멘토 직무부트캠프 수준의 기초 과정입니다. SCM 중심 교육으로 SAP는 프로세스 이해를 위한 보조 도구로 활용합니다.',
        'target' => 'SCM 초보자, 취업 준비생, 직무 선택 고민자',
        'features' => [
            '1주차: SCM 직무 개요 및 Planning Function (계획파트)',
            '2주차: Purchasing Function (구매파트) + SAP MM 기본',
            '3주차: Logistics Execution Function (물류운영파트) + SAP WM/LE',
            '4주차: Customer Service Function (고객서비스파트) + SAP SD',
            '5주차: SCM 4개 Function 통합 및 커리어 패스 설계'
        ],
        'special' => '기업 업무 프로세스 전체 그림부터 시작하여 직무별 특성 분석 및 개인 적합도 평가까지'
    ],
    [
        'id' => 2,
        'title' => 'SCM(ERP) 심화반',
        'subtitle' => '실제 기업에서 운영되는 복잡하고 심화된 SCM 프로세스 마스터',
        'duration' => '8주 (심화 SCM 프로세스 + 실무 프로젝트)',
        'level' => '심화',
        'price' => '문의',
        'description' => '유상사급, 무상사급, 법인간거래, 외주공정생산 등 실제 기업의 복잡한 프로세스를 마스터합니다. SCM 고급 프로세스 중심으로 SAP는 프로세스 구현 도구로 활용합니다.',
        'target' => '초급반 수료자, SCM 경험자, 복잡한 프로세스 이해 필요자',
        'features' => [
            '1-2주차: 고급 SCM 프로세스 - 유상사급, 무상사급, 법인간거래',
            '3-4주차: 외주공정생산, 위탁가공, Subcontracting 프로세스',
            '5-6주차: 산업군별 특화 프로세스 (JIT, 칸반, Lot관리, VMI, 3PL)',
            '7-8주차: 통합 프로젝트 및 프로세스 최적화 방안',
            '실제 프로젝트 경험 기반 복잡한 비즈니스 룰 및 예외 처리'
        ],
        'special' => '글로벌 컨설팅펌 현직자의 실제 프로젝트 경험을 바탕으로 한 산업별 특화 프로세스'
    ]
];
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SCM(ERP) 강의 - 초급반/심화반</title>
    <meta name="description" content="글로벌 컨설팅펌 현직자가 제공하는 SCM(ERP) 초급반/심화반 과정. 기업 전체 그림부터 복잡한 실무 프로세스까지.">
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
            <h1>SCM(ERP) 강의 과정</h1>
            <p>글로벌 컨설팅펌 현직자와 함께하는 실무 중심 SCM 교육</p>
        </div>
    </section>

    <!-- 강의 소개 -->
    <section class="course-intro">
        <div class="container">
            <div class="intro-grid">
                <div class="intro-text">
                    <h2>이런 고민을 해결해 드립니다</h2>
                    <blockquote style="font-style: italic; color: #666; margin: 20px 0; padding-left: 20px; border-left: 4px solid #007bff;">
                        "전체적인 그림이 안 보여서 답답해요..."<br>
                        "구매, 생산관리, SCM 같은 직무가 있는지는 알겠는데 실제로 뭘까요?"<br>
                        "인턴경험도 없어서 무슨 직무를 선택해야 할 지 모르겠어요.."<br>
                        "SAP를 잘 아는 사람을 우대한다고 하는데,, SAP가 뭔지 알 기회가 없어요"
                    </blockquote>
                    
                    <ul class="benefits-list">
                        <li>기업 업무 프로세스 전체 그림 이해</li>
                        <li>SCM 4대 Function 실무 체험</li>
                        <li>SAP를 통한 실제 프로세스 학습</li>
                        <li>직무별 특성 분석 및 적합도 평가</li>
                        <li>글로벌 컨설팅펌 현직자의 실무 노하우</li>
                    </ul>
                </div>
                <div class="intro-stats">
                    <div class="stat-box">
                        <div class="stat-icon">📊</div>
                        <h3>초급반</h3>
                        <p>5주 과정<br>기초부터 체계적으로</p>
                    </div>
                    <div class="stat-box">
                        <div class="stat-icon">⚡</div>
                        <h3>심화반</h3>
                        <p>8주 과정<br>복잡한 실무 프로세스</p>
                    </div>
                    <div class="stat-box">
                        <div class="stat-icon">🎯</div>
                        <h3>실무 중심</h3>
                        <p>코멘토 수준<br>+ 전문가 노하우</p>
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
                            <div class="info-item">
                                <span class="info-label">대상:</span>
                                <span class="info-value"><?= $course['target'] ?></span>
                            </div>
                        </div>
                        
                        <div class="course-special" style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 15px 0; font-size: 14px; color: #495057;">
                            <strong>특징:</strong> <?= $course['special'] ?>
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
                    <h3>코멘토 수준 체계적 교육</h3>
                    <p>3회 강의 + 4회 업무 체험으로 이론과 실무를 균형 있게 학습</p>
                </div>
                <div class="method-item">
                    <div class="method-icon">🎯</div>
                    <h3>SCM 중심 + SAP 보조</h3>
                    <p>SCM 프로세스를 중심으로 하고, SAP는 이해를 돕는 보조 도구로 활용</p>
                </div>
                <div class="method-item">
                    <div class="method-icon">👥</div>
                    <h3>글로벌 컨설팅펌 노하우</h3>
                    <p>현직 컨설턴트의 실제 프로젝트 경험을 바탕으로 한 실무 중심 교육</p>
                </div>
                <div class="method-item">
                    <div class="method-icon">🔄</div>
                    <h3>소규모 그룹 컨설팅 옵션</h3>
                    <p>캠프 수강 후 소규모 그룹 컨설팅 옵션으로 커리어 컨설팅까지</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA 섹션 -->
    <section class="cta">
        <div class="container">
            <div class="cta-content">
                <h2>지금 시작하세요!</h2>
                <p>"SAP가 뭔지 모르겠다"는 고민에서 "실무 전문가"가 되어보세요</p>
                <div class="cta-buttons">
                    <a href="contact.php" class="btn btn-primary">수강 상담</a>
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