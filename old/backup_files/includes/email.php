<?php
/**
 * 이메일 발송 설정 및 헬퍼 클래스
 */

class EmailConfig {
    // 이메일 설정 (실제 환경에서는 환경변수나 별도 설정 파일에서 관리)
    const SMTP_HOST = 'smtp.gmail.com';
    const SMTP_PORT = 587;
    const SMTP_USERNAME = 'ahfifa88@gmail.com';
    const SMTP_PASSWORD = ''; // 실제 비밀번호나 앱 비밀번호 필요
    const FROM_EMAIL = 'ahfifa88@gmail.com';
    const FROM_NAME = 'SCM Expert';
    const ADMIN_EMAIL = 'ahfifa88@gmail.com';
    
    // 개발/테스트 모드 (true시 실제 이메일 발송 안함)
    const DEVELOPMENT_MODE = true;
}

class EmailService {
    private $config;
    private $logFile;
    
    public function __construct() {
        $this->logFile = __DIR__ . '/../logs/email.log';
        
        // 로그 디렉토리가 없으면 생성
        $logDir = dirname($this->logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }
    
    /**
     * 이메일 로그 기록
     */
    private function logEmail($type, $to, $subject, $status, $error = null) {
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = [
            'timestamp' => $timestamp,
            'type' => $type,
            'to' => $to,
            'subject' => $subject,
            'status' => $status,
            'error' => $error
        ];
        
        $logMessage = json_encode($logEntry, JSON_UNESCAPED_UNICODE) . PHP_EOL;
        file_put_contents($this->logFile, $logMessage, FILE_APPEND | LOCK_EX);
    }
    
    /**
     * 문의 접수 확인 이메일 발송 (고객에게)
     */
    public function sendInquiryConfirmation($customerData) {
        $to = $customerData['email'];
        $name = $customerData['name'];
        $inquiryType = $customerData['inquiry_type'];
        
        $subject = '[SCM Expert] 문의가 접수되었습니다';
        
        $html = $this->getInquiryConfirmationTemplate($customerData);
        $text = $this->getInquiryConfirmationTextTemplate($customerData);
        
        return $this->sendEmail($to, $subject, $html, $text, 'inquiry_confirmation');
    }
    
    /**
     * 관리자 알림 이메일 발송
     */
    public function sendAdminNotification($inquiryData) {
        $to = EmailConfig::ADMIN_EMAIL;
        $subject = '[SCM Expert] 새로운 문의가 접수되었습니다';
        
        $html = $this->getAdminNotificationTemplate($inquiryData);
        $text = $this->getAdminNotificationTextTemplate($inquiryData);
        
        return $this->sendEmail($to, $subject, $html, $text, 'admin_notification');
    }
    
    /**
     * 이메일 발송 (기본 함수)
     */
    private function sendEmail($to, $subject, $htmlBody, $textBody, $type) {
        if (EmailConfig::DEVELOPMENT_MODE) {
            // 개발 모드에서는 실제 발송하지 않고 로그만 기록
            $this->logEmail($type, $to, $subject, 'DEVELOPMENT_MODE');
            return true;
        }
        
        // 이메일 헤더 설정
        $headers = [];
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-Type: text/html; charset=UTF-8';
        $headers[] = 'From: ' . EmailConfig::FROM_NAME . ' <' . EmailConfig::FROM_EMAIL . '>';
        $headers[] = 'Reply-To: ' . EmailConfig::FROM_EMAIL;
        $headers[] = 'X-Mailer: PHP/' . phpversion();
        
        $headerString = implode("\r\n", $headers);
        
        try {
            // PHP mail() 함수 사용 (실제 환경에서는 SMTP 설정 필요)
            $sent = mail($to, $subject, $htmlBody, $headerString);
            
            if ($sent) {
                $this->logEmail($type, $to, $subject, 'SUCCESS');
                return true;
            } else {
                $this->logEmail($type, $to, $subject, 'FAILED', 'mail() function returned false');
                return false;
            }
        } catch (Exception $e) {
            $this->logEmail($type, $to, $subject, 'ERROR', $e->getMessage());
            return false;
        }
    }
    
    /**
     * 고객 문의 접수 확인 HTML 템플릿
     */
    private function getInquiryConfirmationTemplate($data) {
        $name = htmlspecialchars($data['name']);
        $inquiryType = htmlspecialchars($data['inquiry_type']);
        $message = htmlspecialchars($data['message']);
        
        return "
        <!DOCTYPE html>
        <html lang='ko'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>문의 접수 확인</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
                .content { padding: 30px 20px; background: #f8f9fa; }
                .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
                .highlight { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .contact-info { background: white; padding: 20px; border-radius: 5px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>SCM Expert</h1>
                    <p>문의 접수 확인</p>
                </div>
                <div class='content'>
                    <h2>안녕하세요, {$name}님!</h2>
                    <p>SCM Expert에 문의해 주셔서 감사합니다.</p>
                    <p>귀하의 문의가 성공적으로 접수되었습니다.</p>
                    
                    <div class='highlight'>
                        <h3>접수된 문의 내용</h3>
                        <p><strong>문의 유형:</strong> {$inquiryType}</p>
                        <p><strong>문의 내용:</strong></p>
                        <p>{$message}</p>
                    </div>
                    
                    <div class='contact-info'>
                        <h3>처리 안내</h3>
                        <p>• 영업일 기준 24시간 내에 답변 드리겠습니다.</p>
                        <p>• 급한 문의사항은 이메일로 직접 연락 부탁드립니다.</p>
                        <p>• 추가 문의: ahfifa88@gmail.com</p>
                    </div>
                </div>
                <div class='footer'>
                    <p>&copy; 2025 SCM Expert. All rights reserved.</p>
                    <p>글로벌 컨설팅펌 현직 컨설턴트의 전문 SCM 교육 및 컨설팅</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
    
    /**
     * 고객 문의 접수 확인 텍스트 템플릿
     */
    private function getInquiryConfirmationTextTemplate($data) {
        $name = $data['name'];
        $inquiryType = $data['inquiry_type'];
        $message = $data['message'];
        
        return "
SCM Expert 문의 접수 확인

안녕하세요, {$name}님!

SCM Expert에 문의해 주셔서 감사합니다.
귀하의 문의가 성공적으로 접수되었습니다.

=== 접수된 문의 내용 ===
문의 유형: {$inquiryType}
문의 내용: {$message}

=== 처리 안내 ===
• 영업일 기준 24시간 내에 답변 드리겠습니다.
• 급한 문의사항은 이메일로 직접 연락 부탁드립니다.
• 추가 문의: ahfifa88@gmail.com

감사합니다.

SCM Expert
글로벌 컨설팅펌 현직 컨설턴트의 전문 SCM 교육 및 컨설팅
        ";
    }
    
    /**
     * 관리자 알림 HTML 템플릿
     */
    private function getAdminNotificationTemplate($data) {
        $name = htmlspecialchars($data['name']);
        $email = htmlspecialchars($data['email']);
        $phone = htmlspecialchars($data['phone']);
        $company = htmlspecialchars($data['company'] ?? '미기입');
        $inquiryType = htmlspecialchars($data['inquiry_type']);
        $courseTitle = htmlspecialchars($data['course_title'] ?? '해당없음');
        $message = htmlspecialchars($data['message']);
        $ipAddress = htmlspecialchars($data['ip_address'] ?? '');
        
        return "
        <!DOCTYPE html>
        <html lang='ko'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>새로운 문의 접수</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
                .content { padding: 30px 20px; background: #f8f9fa; }
                .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .info-table th, .info-table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                .info-table th { background: #e9ecef; font-weight: bold; }
                .message-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .urgent { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🚨 새로운 문의 접수</h1>
                    <p>SCM Expert 관리자 알림</p>
                </div>
                <div class='content'>
                    <div class='urgent'>
                        <strong>새로운 문의가 접수되었습니다. 빠른 확인 및 답변 부탁드립니다.</strong>
                    </div>
                    
                    <table class='info-table'>
                        <tr><th>이름</th><td>{$name}</td></tr>
                        <tr><th>이메일</th><td>{$email}</td></tr>
                        <tr><th>전화번호</th><td>{$phone}</td></tr>
                        <tr><th>회사명</th><td>{$company}</td></tr>
                        <tr><th>문의 유형</th><td>{$inquiryType}</td></tr>
                        <tr><th>관심 강의</th><td>{$courseTitle}</td></tr>
                        <tr><th>IP 주소</th><td>{$ipAddress}</td></tr>
                        <tr><th>접수 시간</th><td>" . date('Y-m-d H:i:s') . "</td></tr>
                    </table>
                    
                    <div class='message-box'>
                        <h3>문의 내용</h3>
                        <p>{$message}</p>
                    </div>
                    
                    <p><strong>관리자 페이지에서 더 자세한 정보를 확인하세요:</strong></p>
                    <p><a href='http://localhost/admin.php'>관리자 페이지 바로가기</a></p>
                </div>
            </div>
        </body>
        </html>
        ";
    }
    
    /**
     * 관리자 알림 텍스트 템플릿
     */
    private function getAdminNotificationTextTemplate($data) {
        $name = $data['name'];
        $email = $data['email'];
        $phone = $data['phone'];
        $company = $data['company'] ?? '미기입';
        $inquiryType = $data['inquiry_type'];
        $courseTitle = $data['course_title'] ?? '해당없음';
        $message = $data['message'];
        $ipAddress = $data['ip_address'] ?? '';
        
        return "
🚨 SCM Expert 새로운 문의 접수 알림

새로운 문의가 접수되었습니다. 빠른 확인 및 답변 부탁드립니다.

=== 문의자 정보 ===
이름: {$name}
이메일: {$email}
전화번호: {$phone}
회사명: {$company}
문의 유형: {$inquiryType}
관심 강의: {$courseTitle}
IP 주소: {$ipAddress}
접수 시간: " . date('Y-m-d H:i:s') . "

=== 문의 내용 ===
{$message}

관리자 페이지: http://localhost/admin.php

SCM Expert 자동 알림 시스템
        ";
    }
}
?>