<?php
require_once 'config.php';
require_once 'includes/database.php';
require_once 'includes/notion.php';

// 폼 제출 처리
$message = '';
$messageType = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 로깅을 위한 정보 수집
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    $timestamp = date('Y-m-d H:i:s');
    
    // 폼 데이터 수집 및 검증
    $formData = [
        'name' => trim($_POST['name'] ?? ''),
        'email' => trim($_POST['email'] ?? ''),
        'phone' => trim($_POST['phone'] ?? ''),
        'company' => trim($_POST['company'] ?? ''),
        'course' => $_POST['course'] ?? '',
        'experience_level' => $_POST['experience_level'] ?? '',
        'goals' => trim($_POST['goals'] ?? ''),
        'motivation' => trim($_POST['motivation'] ?? ''),
        'preferred_schedule' => $_POST['preferred_schedule'] ?? '',
        'budget_range' => $_POST['budget_range'] ?? '',
        'how_found' => $_POST['how_found'] ?? '',
        'additional_info' => trim($_POST['additional_info'] ?? ''),
        'inquiry_type' => '수강신청',
        'ip_address' => $ipAddress,
        'user_agent' => $userAgent
    ];
    
    // 필수 필드 검증
    $requiredFields = ['name', 'email', 'phone', 'course'];
    $errors = [];
    
    foreach ($requiredFields as $field) {
        if (empty($formData[$field])) {
            $errors[] = ucfirst($field) . ' 필드는 필수입니다.';
        }
    }
    
    // 이메일 형식 검증
    if (!empty($formData['email']) && !filter_var($formData['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = '올바른 이메일 형식을 입력해주세요.';
    }
    
    if (empty($errors)) {
        // 노션 및 SQLite에 데이터 저장
        $notionHelper = new NotionHelper();
        
        // 메시지 구성
        $formData['message'] = "
=== 수강 신청 정보 ===
• 선택 과정: {$formData['course']}
• 경험 수준: {$formData['experience_level']}
• 학습 목표: {$formData['goals']}
• 수강 동기: {$formData['motivation']}
• 선호 일정: {$formData['preferred_schedule']}
• 예산 범위: {$formData['budget_range']}
• 알게 된 경로: {$formData['how_found']}
• 추가 정보: {$formData['additional_info']}
        ";
        
        try {
            $saveResults = $notionHelper->saveStudentData($formData);
            
            if ($saveResults['notion'] || $saveResults['sqlite']) {
                $message = '수강 신청이 성공적으로 접수되었습니다! 빠른 시일 내에 연락드리겠습니다.';
                $messageType = 'success';
                
                // 성공 로그
                $logMessage = "[{$timestamp}] 수강신청 접수: {$formData['name']} ({$formData['email']}) - {$formData['course']}";
                file_put_contents(__DIR__ . '/logs/registrations.log', $logMessage . PHP_EOL, FILE_APPEND | LOCK_EX);
                
            } else {
                $message = '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                $messageType = 'error';
            }
            
            // 오류가 있다면 로그에 기록
            if (!empty($saveResults['errors'])) {
                $errorLog = "[{$timestamp}] 수강신청 오류: " . implode(', ', $saveResults['errors']);
                file_put_contents(__DIR__ . '/logs/error.log', $errorLog . PHP_EOL, FILE_APPEND | LOCK_EX);
            }
            
        } catch (Exception $e) {
            $message = '시스템 오류가 발생했습니다. 관리자에게 문의해주세요.';
            $messageType = 'error';
            
            // 예외 로그
            $errorLog = "[{$timestamp}] 수강신청 예외: " . $e->getMessage();
            file_put_contents(__DIR__ . '/logs/error.log', $errorLog . PHP_EOL, FILE_APPEND | LOCK_EX);
        }
        
    } else {
        $message = '입력 오류: ' . implode(', ', $errors);
        $messageType = 'error';
    }
}
?>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>수강 신청 - SCM 전문가</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        .registration-container {
            max-width: 800px;
            margin: 2rem auto;
            padding: 2rem;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .form-section {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #007bff;
        }
        
        .form-section h3 {
            margin-bottom: 1rem;
            color: #2c3e50;
            font-size: 1.2rem;
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
        }
        
        .form-group {
            margin-bottom: 1rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #2c3e50;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
            box-sizing: border-box;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }
        
        .form-group textarea {
            min-height: 100px;
            resize: vertical;
        }
        
        .required {
            color: #dc3545;
        }
        
        .submit-btn {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            width: 100%;
            margin-top: 1rem;
        }
        
        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,123,255,0.3);
        }
        
        .message {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            font-weight: 500;
        }
        
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .course-info {
            background: #e3f2fd;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            color: #1565c0;
        }
        
        @media (max-width: 768px) {
            .registration-container {
                margin: 1rem;
                padding: 1rem;
            }
            
            .form-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <!-- 네비게이션 -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="nav-brand">
                <a href="index.php">SCM 전문가</a>
            </div>
            
            <div class="nav-menu">
                <a href="index.php" class="nav-link">홈</a>
                <a href="about.php" class="nav-link">소개</a>
                <a href="courses.php" class="nav-link">강의</a>
                <a href="consulting.php" class="nav-link">컨설팅</a>
                <a href="register.php" class="nav-link active">수강신청</a>
                <a href="contact.php" class="nav-link">문의</a>
            </div>
            
            <div class="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </nav>

    <!-- 메인 콘텐츠 -->
    <main class="main-content">
        <div class="registration-container">
            <div class="section-header text-center">
                <h1>🎓 SCM 강의 수강 신청</h1>
                <p>전문 SCM 교육과정에 참여하여 커리어를 한 단계 업그레이드하세요</p>
            </div>

            <?php if ($message): ?>
            <div class="message <?= $messageType ?>">
                <?= htmlspecialchars($message) ?>
            </div>
            <?php endif; ?>

            <form method="POST" id="registrationForm">
                <!-- 기본 정보 섹션 -->
                <div class="form-section">
                    <h3>📋 기본 정보</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="name">성명 <span class="required">*</span></label>
                            <input type="text" id="name" name="name" required 
                                   value="<?= htmlspecialchars($_POST['name'] ?? '') ?>">
                        </div>
                        <div class="form-group">
                            <label for="email">이메일 <span class="required">*</span></label>
                            <input type="email" id="email" name="email" required 
                                   value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">
                        </div>
                        <div class="form-group">
                            <label for="phone">연락처 <span class="required">*</span></label>
                            <input type="tel" id="phone" name="phone" required 
                                   value="<?= htmlspecialchars($_POST['phone'] ?? '') ?>">
                        </div>
                        <div class="form-group">
                            <label for="company">소속 회사/기관</label>
                            <input type="text" id="company" name="company" 
                                   value="<?= htmlspecialchars($_POST['company'] ?? '') ?>">
                        </div>
                    </div>
                </div>

                <!-- 수강 과정 선택 -->
                <div class="form-section">
                    <h3>📚 수강 과정 선택</h3>
                    <div class="form-group">
                        <label for="course">희망 과정 <span class="required">*</span></label>
                        <select id="course" name="course" required onchange="showCourseInfo()">
                            <option value="">과정을 선택해주세요</option>
                            <option value="SCM 기초과정" <?= ($_POST['course'] ?? '') === 'SCM 기초과정' ? 'selected' : '' ?>>
                                SCM 기초과정 (4주, 100만원)
                            </option>
                            <option value="SAP ERP 실무과정" <?= ($_POST['course'] ?? '') === 'SAP ERP 실무과정' ? 'selected' : '' ?>>
                                SAP ERP 실무과정 (6주, 150만원)
                            </option>
                            <option value="SCM 전문가과정" <?= ($_POST['course'] ?? '') === 'SCM 전문가과정' ? 'selected' : '' ?>>
                                SCM 전문가과정 (8주, 200만원)
                            </option>
                        </select>
                    </div>
                    <div id="courseInfo" class="course-info" style="display: none;"></div>
                    
                    <div class="form-group">
                        <label for="experience_level">SCM 관련 경험 수준</label>
                        <select id="experience_level" name="experience_level">
                            <option value="">선택해주세요</option>
                            <option value="초급" <?= ($_POST['experience_level'] ?? '') === '초급' ? 'selected' : '' ?>>초급 (경험 없음)</option>
                            <option value="중급" <?= ($_POST['experience_level'] ?? '') === '중급' ? 'selected' : '' ?>>중급 (1-3년)</option>
                            <option value="고급" <?= ($_POST['experience_level'] ?? '') === '고급' ? 'selected' : '' ?>>고급 (3년 이상)</option>
                        </select>
                    </div>
                </div>

                <!-- 학습 목표 및 동기 -->
                <div class="form-section">
                    <h3>🎯 학습 목표 및 동기</h3>
                    <div class="form-group">
                        <label for="goals">학습 목표</label>
                        <textarea id="goals" name="goals" placeholder="이 과정을 통해 달성하고 싶은 목표를 구체적으로 작성해주세요"><?= htmlspecialchars($_POST['goals'] ?? '') ?></textarea>
                    </div>
                    <div class="form-group">
                        <label for="motivation">수강 동기</label>
                        <textarea id="motivation" name="motivation" placeholder="왜 이 과정을 수강하려고 하시나요?"><?= htmlspecialchars($_POST['motivation'] ?? '') ?></textarea>
                    </div>
                </div>

                <!-- 수강 조건 -->
                <div class="form-section">
                    <h3>⏰ 수강 조건</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="preferred_schedule">선호 수강 시간대</label>
                            <select id="preferred_schedule" name="preferred_schedule">
                                <option value="">선택해주세요</option>
                                <option value="평일 오전" <?= ($_POST['preferred_schedule'] ?? '') === '평일 오전' ? 'selected' : '' ?>>평일 오전 (09:00-12:00)</option>
                                <option value="평일 오후" <?= ($_POST['preferred_schedule'] ?? '') === '평일 오후' ? 'selected' : '' ?>>평일 오후 (14:00-17:00)</option>
                                <option value="평일 저녁" <?= ($_POST['preferred_schedule'] ?? '') === '평일 저녁' ? 'selected' : '' ?>>평일 저녁 (19:00-22:00)</option>
                                <option value="주말" <?= ($_POST['preferred_schedule'] ?? '') === '주말' ? 'selected' : '' ?>>주말</option>
                                <option value="협의" <?= ($_POST['preferred_schedule'] ?? '') === '협의' ? 'selected' : '' ?>>협의 가능</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="budget_range">예산 범위</label>
                            <select id="budget_range" name="budget_range">
                                <option value="">선택해주세요</option>
                                <option value="100만원 미만" <?= ($_POST['budget_range'] ?? '') === '100만원 미만' ? 'selected' : '' ?>>100만원 미만</option>
                                <option value="100-150만원" <?= ($_POST['budget_range'] ?? '') === '100-150만원' ? 'selected' : '' ?>>100-150만원</option>
                                <option value="150-200만원" <?= ($_POST['budget_range'] ?? '') === '150-200만원' ? 'selected' : '' ?>>150-200만원</option>
                                <option value="200만원 이상" <?= ($_POST['budget_range'] ?? '') === '200만원 이상' ? 'selected' : '' ?>>200만원 이상</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- 추가 정보 -->
                <div class="form-section">
                    <h3>ℹ️ 추가 정보</h3>
                    <div class="form-group">
                        <label for="how_found">저희를 어떻게 알게 되셨나요?</label>
                        <select id="how_found" name="how_found">
                            <option value="">선택해주세요</option>
                            <option value="검색엔진" <?= ($_POST['how_found'] ?? '') === '검색엔진' ? 'selected' : '' ?>>검색엔진</option>
                            <option value="지인 추천" <?= ($_POST['how_found'] ?? '') === '지인 추천' ? 'selected' : '' ?>>지인 추천</option>
                            <option value="SNS" <?= ($_POST['how_found'] ?? '') === 'SNS' ? 'selected' : '' ?>>SNS</option>
                            <option value="온라인 강의 플랫폼" <?= ($_POST['how_found'] ?? '') === '온라인 강의 플랫폼' ? 'selected' : '' ?>>온라인 강의 플랫폼</option>
                            <option value="기타" <?= ($_POST['how_found'] ?? '') === '기타' ? 'selected' : '' ?>>기타</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="additional_info">추가 문의사항이나 특별한 요청사항</label>
                        <textarea id="additional_info" name="additional_info" placeholder="기타 궁금한 점이나 특별한 요청사항이 있으시면 자유롭게 작성해주세요"><?= htmlspecialchars($_POST['additional_info'] ?? '') ?></textarea>
                    </div>
                </div>

                <button type="submit" class="submit-btn">
                    🚀 수강 신청하기
                </button>
            </form>
        </div>
    </main>

    <!-- 푸터 -->
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3>SCM 전문가</h3>
                <p>글로벌 컨설팅 경험을 바탕으로 한 실무 중심의 SCM 교육</p>
            </div>
            <div class="footer-section">
                <h4>연락처</h4>
                <p>📧 ahfifa88@gmail.com</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 SCM 전문가. All rights reserved.</p>
        </div>
    </footer>

    <script src="js/main.js"></script>
    <script>
        console.log('수강신청 페이지 로드 완료');
        
        // 과정 정보 표시
        function showCourseInfo() {
            const courseSelect = document.getElementById('course');
            const courseInfo = document.getElementById('courseInfo');
            
            console.log('과정 선택 변경:', courseSelect.value);
            
            const courseDetails = {
                'SCM 기초과정': '• 기간: 4주 (주 2회, 총 8회)\n• 가격: 100만원\n• 내용: SCM 기초 개념, 공급망 설계, 기초 분석 도구',
                'SAP ERP 실무과정': '• 기간: 6주 (주 2회, 총 12회)\n• 가격: 150만원\n• 내용: SAP MM/PP/SD 모듈, 실무 시뮬레이션, 인증 준비',
                'SCM 전문가과정': '• 기간: 8주 (주 2회, 총 16회)\n• 가격: 200만원\n• 내용: 고급 SCM 전략, 디지털 트랜스포메이션, 컨설팅 방법론'
            };
            
            if (courseSelect.value && courseDetails[courseSelect.value]) {
                courseInfo.innerHTML = courseDetails[courseSelect.value].replace(/\n/g, '<br>');
                courseInfo.style.display = 'block';
            } else {
                courseInfo.style.display = 'none';
            }
        }
        
        // 폼 제출 시 로딩 상태
        document.getElementById('registrationForm').addEventListener('submit', function(e) {
            console.log('수강신청 폼 제출 시작');
            const submitBtn = document.querySelector('.submit-btn');
            submitBtn.textContent = '처리 중...';
            submitBtn.disabled = true;
        });
        
        // 폼 입력 시 콘솔 로그
        document.querySelectorAll('input, select, textarea').forEach(element => {
            element.addEventListener('change', function() {
                console.log(`필드 변경: ${this.name} = ${this.value}`);
            });
        });
        
        // 페이지 로드 시 기존 선택 값이 있다면 과정 정보 표시
        window.addEventListener('load', function() {
            showCourseInfo();
        });
    </script>
</body>
</html>