<?php
// 로그 기록 함수
function writeLog($message) {
    $logFile = '../logs/access.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[{$timestamp}] {$message}" . PHP_EOL;
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
}

// 에러 로그 기록 함수
function writeErrorLog($message) {
    $logFile = '../logs/error.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[{$timestamp}] ERROR: {$message}" . PHP_EOL;
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
}

// 페이지 접근 로그
writeLog("문의 페이지 접근 - IP: " . $_SERVER['REMOTE_ADDR']);

session_start();

// 데이터베이스 연결
require_once 'includes/database.php';
require_once 'includes/email.php';

// 폼 제출 처리
$formSubmitted = false;
$submitMessage = '';
$submitSuccess = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    writeLog("문의 폼 제출 시도 - IP: " . $_SERVER['REMOTE_ADDR']);
    
    try {
        // 폼 데이터 수집
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $phone = trim($_POST['phone'] ?? '');
        $company = trim($_POST['company'] ?? '');
        $inquiryType = $_POST['inquiry_type'] ?? '';
        $courseTitle = $_POST['course_title'] ?? '';
        $message = trim($_POST['message'] ?? '');
        
        // 기본 유효성 검사
        $errors = [];
        
        if (empty($name)) {
            $errors[] = '이름을 입력해주세요.';
        }
        
        if (empty($email)) {
            $errors[] = '이메일을 입력해주세요.';
        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = '올바른 이메일 형식을 입력해주세요.';
        }
        
        if (empty($phone)) {
            $errors[] = '전화번호를 입력해주세요.';
        }
        
        if (empty($message)) {
            $errors[] = '문의 내용을 입력해주세요.';
        }
        
        if (empty($errors)) {
            try {
                // 데이터베이스에 문의 저장
                $dbHelper = new DatabaseHelper();
                
                $inquiryData = [
                    'name' => $name,
                    'email' => $email,
                    'phone' => $phone,
                    'company' => $company,
                    'inquiry_type' => $inquiryType,
                    'course_title' => $courseTitle,
                    'message' => $message,
                    'ip_address' => $_SERVER['REMOTE_ADDR'],
                    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
                ];
                
                $saved = $dbHelper->saveInquiry($inquiryData);
                
                if ($saved) {
                    // 시스템 로그도 데이터베이스에 저장
                    $dbHelper->saveLog(
                        'inquiry_submitted',
                        "새로운 문의 접수 - 이름: {$name}, 이메일: {$email}, 유형: {$inquiryType}",
                        $_SERVER['REMOTE_ADDR'],
                        $_SERVER['HTTP_USER_AGENT'] ?? ''
                    );
                    
                    // 이메일 발송 시도
                    try {
                        $emailService = new EmailService();
                        
                        // 고객에게 확인 이메일 발송
                        $emailService->sendInquiryConfirmation($inquiryData);
                        
                        // 관리자에게 알림 이메일 발송
                        $emailService->sendAdminNotification($inquiryData);
                        
                        writeLog("이메일 발송 완료 - 수신자: {$email}");
                        
                    } catch (Exception $emailError) {
                        writeErrorLog("이메일 발송 오류: " . $emailError->getMessage());
                        // 이메일 발송 실패해도 문의 접수는 성공으로 처리
                    }
                    
                    writeLog("문의 폼 제출 완료 (DB) - 이름: {$name}, 이메일: {$email}, 유형: {$inquiryType}");
                    
                    $submitSuccess = true;
                    $submitMessage = '문의가 성공적으로 접수되었습니다. 확인 이메일을 발송해 드렸으며, 빠른 시간 내에 답변 드리겠습니다.';
                    
                    // 폼 데이터 초기화
                    $name = $email = $phone = $company = $message = '';
                    $inquiryType = $courseTitle = '';
                } else {
                    throw new Exception('데이터베이스 저장 실패');
                }
                
            } catch (Exception $e) {
                writeErrorLog("데이터베이스 저장 오류: " . $e->getMessage());
                
                // 데이터베이스 실패 시 기존 방식으로 백업 저장
                $inquiryData = [
                    'timestamp' => date('Y-m-d H:i:s'),
                    'name' => $name,
                    'email' => $email,
                    'phone' => $phone,
                    'company' => $company,
                    'inquiry_type' => $inquiryType,
                    'course_title' => $courseTitle,
                    'message' => $message,
                    'ip' => $_SERVER['REMOTE_ADDR'],
                    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
                    'db_error' => $e->getMessage()
                ];
                
                $inquiryJson = json_encode($inquiryData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . ",\n";
                file_put_contents('../logs/inquiries.log', $inquiryJson, FILE_APPEND | LOCK_EX);
                
                writeLog("문의 폼 제출 완료 (백업) - 이름: {$name}, 이메일: {$email}, 유형: {$inquiryType}");
                
                $submitSuccess = true;
                $submitMessage = '문의가 접수되었습니다. 빠른 시간 내에 연락드리겠습니다.';
                
                // 폼 데이터 초기화
                $name = $email = $phone = $company = $message = '';
                $inquiryType = $courseTitle = '';
            }
            
        } else {
            writeErrorLog("문의 폼 유효성 검사 실패: " . implode(', ', $errors));
            $submitMessage = implode('<br>', $errors);
        }
        
        $formSubmitted = true;
        
    } catch (Exception $e) {
        writeErrorLog("문의 폼 처리 중 오류: " . $e->getMessage());
        $formSubmitted = true;
        $submitMessage = '문의 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
}

// URL 파라미터에서 문의 유형 확인
$preselectedType = $_GET['type'] ?? '';
$preselectedCourseId = $_GET['course_id'] ?? '';
$preselectedCourseTitle = $_GET['course_title'] ?? '';
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>문의 - SCM 전문가 양성</title>
    <meta name="description" content="SCM 강의 및 컨설팅에 대한 문의를 남겨주세요. 전문 상담을 통해 최적의 솔루션을 제공해드립니다.">
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
                    <li><a href="consulting.php">컨설팅</a></li>
                    <li><a href="contact.php" class="active">문의</a></li>
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
            <h1>Contact Us</h1>
            <p>전문 상담을 통해 최적의 SCM 솔루션을 제공해드립니다</p>
        </div>
    </section>

    <!-- 연락처 정보 -->
    <section class="contact-info">
        <div class="container">
            <div class="contact-grid">
                <div class="contact-item">
                    <div class="contact-icon">✉️</div>
                    <h3>이메일 문의</h3>
                    <p>ahfifa88@gmail.com</p>
                    <span>24시간 접수 가능</span>
                </div>
                <div class="contact-item">
                    <div class="contact-icon">🎯</div>
                    <h3>전문 컨설팅</h3>
                    <p>글로벌 컨설팅펌 현직</p>
                    <span>SCM 및 커리어 전문</span>
                </div>
                <div class="contact-item">
                    <div class="contact-icon">🚀</div>
                    <h3>온라인 상담</h3>
                    <p>이메일로 상담 신청</p>
                    <span>빠른 답변 보장</span>
                </div>
                <div class="contact-item">
                    <div class="contact-icon">💼</div>
                    <h3>맞춤형 솔루션</h3>
                    <p>개인/기업 맞춤 상담</p>
                    <span>전문가 1:1 컨설팅</span>
                </div>
            </div>
        </div>
    </section>

    <!-- 문의 폼 -->
    <section class="contact-form-section">
        <div class="container">
            <div class="form-container">
                <div class="form-header">
                    <h2>온라인 문의</h2>
                    <p>아래 양식을 작성해주시면 빠른 시간 내에 연락드리겠습니다.</p>
                </div>

                <?php if ($formSubmitted): ?>
                <div class="form-message <?= $submitSuccess ? 'success' : 'error' ?>">
                    <?= $submitMessage ?>
                </div>
                <?php endif; ?>

                <form method="POST" class="contact-form" id="contactForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="name">이름 *</label>
                            <input type="text" id="name" name="name" required 
                                   value="<?= htmlspecialchars($name ?? '') ?>">
                        </div>
                        <div class="form-group">
                            <label for="email">이메일 *</label>
                            <input type="email" id="email" name="email" required 
                                   value="<?= htmlspecialchars($email ?? '') ?>">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="phone">전화번호 *</label>
                            <input type="tel" id="phone" name="phone" required 
                                   value="<?= htmlspecialchars($phone ?? '') ?>">
                        </div>
                        <div class="form-group">
                            <label for="company">회사명</label>
                            <input type="text" id="company" name="company" 
                                   value="<?= htmlspecialchars($company ?? '') ?>">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="inquiry_type">문의 유형 *</label>
                        <select id="inquiry_type" name="inquiry_type" required>
                            <option value="">선택해주세요</option>
                            <option value="course" <?= ($preselectedType === 'course' || ($inquiryType ?? '') === 'course') ? 'selected' : '' ?>>강의 문의</option>
                            <option value="consulting" <?= ($preselectedType === 'consulting' || ($inquiryType ?? '') === 'consulting') ? 'selected' : '' ?>>컨설팅 문의</option>
                            <option value="partnership" <?= ($inquiryType ?? '') === 'partnership' ? 'selected' : '' ?>>파트너십 문의</option>
                            <option value="other" <?= ($inquiryType ?? '') === 'other' ? 'selected' : '' ?>>기타 문의</option>
                        </select>
                    </div>

                    <?php if ($preselectedCourseTitle): ?>
                    <div class="form-group" id="course-info">
                        <label>관심 강의</label>
                        <input type="hidden" name="course_title" value="<?= htmlspecialchars($preselectedCourseTitle) ?>">
                        <div class="selected-course">
                            <?= htmlspecialchars($preselectedCourseTitle) ?>
                        </div>
                    </div>
                    <?php endif; ?>

                    <div class="form-group">
                        <label for="message">문의 내용 *</label>
                        <textarea id="message" name="message" rows="6" required 
                                  placeholder="문의하실 내용을 상세히 작성해주세요."><?= htmlspecialchars($message ?? '') ?></textarea>
                    </div>

                    <div class="form-group consent">
                        <label class="checkbox-label">
                            <input type="checkbox" id="privacy_consent" required>
                            <span class="checkbox-custom"></span>
                            개인정보 수집 및 이용에 동의합니다. 
                            <a href="#" onclick="showPrivacyPolicy(); return false;">정책 보기</a>
                        </label>
                    </div>

                    <div class="form-submit">
                        <button type="submit" class="btn btn-primary" id="submitBtn">
                            문의 보내기
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </section>

    <!-- FAQ 섹션 -->
    <section class="faq-section">
        <div class="container">
            <h2 class="section-title">자주 묻는 질문</h2>
            <div class="faq-list">
                <div class="faq-item">
                    <div class="faq-question">
                        <h4>강의는 온라인과 오프라인 중 어떤 방식으로 진행되나요?</h4>
                        <span class="faq-toggle">+</span>
                    </div>
                    <div class="faq-answer">
                        <p>기본적으로 블렌디드 러닝 방식을 채택하고 있습니다. 이론 학습은 온라인으로, 실습과 토론은 오프라인으로 진행하여 학습 효과를 극대화합니다. 상황에 따라 완전 온라인 또는 오프라인 진행도 가능합니다.</p>
                    </div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">
                        <h4>컨설팅 비용은 어떻게 책정되나요?</h4>
                        <span class="faq-toggle">+</span>
                    </div>
                    <div class="faq-answer">
                        <p>컨설팅 비용은 프로젝트의 규모, 기간, 복잡도에 따라 달라집니다. 초기 상담을 통해 기업의 상황을 파악한 후 맞춤형 견적을 제공해드립니다. 무료 초기 상담을 통해 정확한 견적을 받아보세요.</p>
                    </div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">
                        <h4>수료 후 지속적인 지원이 가능한가요?</h4>
                        <span class="faq-toggle">+</span>
                    </div>
                    <div class="faq-answer">
                        <p>네, 가능합니다. 수료생들을 위한 정기 네트워킹 모임, 추가 상담 서비스, 최신 정보 제공 등 지속적인 지원을 제공하고 있습니다. 또한 심화 과정이나 개별 코칭도 제공합니다.</p>
                    </div>
                </div>

                <div class="faq-item">
                    <div class="faq-question">
                        <h4>기업 단체 교육도 가능한가요?</h4>
                        <span class="faq-toggle">+</span>
                    </div>
                    <div class="faq-answer">
                        <p>물론입니다. 기업의 특성과 교육 목표에 맞는 맞춤형 교육 프로그램을 제공합니다. 교육 장소, 시간, 커리큘럼 모두 기업의 요구사항에 따라 조정 가능합니다.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA 섹션 -->
    <section class="cta">
        <div class="container">
            <div class="cta-content">
                <h2>지금 바로 시작하세요!</h2>
                <p>전문가와의 상담을 통해 최적의 SCM 솔루션을 찾아보세요</p>
                <div class="cta-buttons">
                    <a href="mailto:ahfifa88@gmail.com" class="btn btn-primary">이메일 당장 문의</a>
                    <a href="#contactForm" class="btn btn-secondary">온라인 문의</a>
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
    <script>
        // 페이지 로드 시 로그
        document.addEventListener('DOMContentLoaded', function() {
            console.log('문의 페이지 로드 완료');
            
            // FAQ 토글 기능
            initFAQ();
            
            // 폼 유효성 검사
            initFormValidation();
            
            console.log('문의 페이지 초기화 완료');
        });

        // FAQ 토글 기능
        function initFAQ() {
            console.log('FAQ 초기화');
            
            const faqItems = document.querySelectorAll('.faq-item');
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question');
                const answer = item.querySelector('.faq-answer');
                const toggle = item.querySelector('.faq-toggle');
                
                question.addEventListener('click', function() {
                    console.log('FAQ 질문 클릭:', this.querySelector('h4').textContent);
                    
                    const isOpen = item.classList.contains('open');
                    
                    // 모든 FAQ 닫기
                    faqItems.forEach(otherItem => {
                        otherItem.classList.remove('open');
                        otherItem.querySelector('.faq-toggle').textContent = '+';
                    });
                    
                    // 클릭한 FAQ 토글
                    if (!isOpen) {
                        item.classList.add('open');
                        toggle.textContent = '-';
                    }
                });
            });
        }

        // 폼 유효성 검사
        function initFormValidation() {
            console.log('폼 유효성 검사 초기화');
            
            const form = document.getElementById('contactForm');
            const submitBtn = document.getElementById('submitBtn');
            
            if (form) {
                form.addEventListener('submit', function(e) {
                    console.log('문의 폼 제출 시도');
                    
                    const name = document.getElementById('name').value.trim();
                    const email = document.getElementById('email').value.trim();
                    const phone = document.getElementById('phone').value.trim();
                    const inquiryType = document.getElementById('inquiry_type').value;
                    const message = document.getElementById('message').value.trim();
                    const consent = document.getElementById('privacy_consent').checked;
                    
                    // 유효성 검사
                    if (!name || !email || !phone || !inquiryType || !message || !consent) {
                        e.preventDefault();
                        SCMExpert.Utils.showAlert('모든 필수 항목을 입력해주세요.', 'warning');
                        return false;
                    }
                    
                    if (!SCMExpert.Utils.validateEmail(email)) {
                        e.preventDefault();
                        SCMExpert.Utils.showAlert('올바른 이메일 형식을 입력해주세요.', 'warning');
                        return false;
                    }
                    
                    // 제출 버튼 비활성화
                    SCMExpert.Utils.showLoading(submitBtn);
                    
                    console.log('폼 유효성 검사 통과, 제출 진행');
                });
            }
        }

        // 개인정보 처리방침 보기
        function showPrivacyPolicy() {
            console.log('개인정보 처리방침 보기 클릭');
            
            const policyText = `
개인정보 수집 및 이용 동의

1. 수집하는 개인정보 항목
   - 이름, 이메일, 전화번호, 회사명, 문의내용

2. 개인정보 수집 및 이용 목적
   - 문의사항 답변 및 상담 서비스 제공
   - 교육 및 컨설팅 서비스 안내

3. 개인정보 보유 및 이용 기간
   - 문의 목적 달성 후 3년간 보관

4. 개인정보 처리 거부 권리
   - 개인정보 수집에 동의하지 않을 권리가 있으나, 
     이 경우 문의 서비스 이용이 제한될 수 있습니다.
            `;
            
            alert(policyText);
        }

        // 폼 제출 결과 처리
        <?php if ($formSubmitted): ?>
        document.addEventListener('DOMContentLoaded', function() {
            const message = '<?= str_replace(["\n", "\r"], "", addslashes($submitMessage)) ?>';
            const isSuccess = <?= $submitSuccess ? 'true' : 'false' ?>;
            
            SCMExpert.Utils.showAlert(message, isSuccess ? 'success' : 'error');
            
            if (isSuccess) {
                // 성공 시 폼 리셋
                document.getElementById('contactForm').reset();
            }
        });
        <?php endif; ?>
    </script>
</body>
</html>