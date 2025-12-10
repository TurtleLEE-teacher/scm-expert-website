<?php
/**
 * Notion 연동 테스트 페이지
 * 문의사항 데이터베이스에 테스트 데이터를 추가하여 연동을 확인합니다.
 */

require_once 'includes/config.php';
require_once 'includes/notion-integration.php';

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notion 연동 테스트 - SCM 웹사이트</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f8f9fa;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .status {
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        .config-info {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .btn {
            background: #007bff;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 10px 5px;
        }
        .btn:hover {
            background: #0056b3;
        }
        .test-form {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .form-group {
            margin: 15px 0;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
        }
        .form-group input, .form-group select, .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        .notion-links {
            background: #e9ecef;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 SCM 웹사이트 Notion 연동 테스트</h1>
            <p>SQL 데이터베이스에서 Notion으로 성공적으로 마이그레이션되었습니다!</p>
        </div>

        <?php
        $config = Config::getInstance();
        
        // 설정 정보 표시
        echo '<div class="config-info">';
        echo '<h3>📋 현재 설정 정보</h3>';
        echo '<p><strong>DB 타입:</strong> ' . $config->get('DB_TYPE') . '</p>';
        echo '<p><strong>Notion API 키:</strong> ' . substr($config->get('NOTION_API_KEY'), 0, 15) . '...</p>';
        echo '<p><strong>문의사항 DB ID:</strong> ' . $config->get('NOTION_INQUIRIES_DB_ID') . '</p>';
        echo '<p><strong>수강생 DB ID:</strong> ' . $config->get('NOTION_STUDENTS_DB_ID') . '</p>';
        echo '<p><strong>강의 DB ID:</strong> ' . $config->get('NOTION_COURSES_DB_ID') . '</p>';
        echo '</div>';

        // Notion 데이터베이스 링크
        echo '<div class="notion-links">';
        echo '<h3>🔗 생성된 Notion 데이터베이스</h3>';
        echo '<p><a href="https://www.notion.so/' . str_replace('-', '', $config->get('NOTION_INQUIRIES_DB_ID')) . '" target="_blank" class="btn">📋 문의사항 관리 보기</a></p>';
        echo '<p><a href="https://www.notion.so/' . str_replace('-', '', $config->get('NOTION_STUDENTS_DB_ID')) . '" target="_blank" class="btn">👥 수강생 관리 보기</a></p>';
        echo '<p><a href="https://www.notion.so/' . str_replace('-', '', $config->get('NOTION_COURSES_DB_ID')) . '" target="_blank" class="btn">📚 강의 관리 보기</a></p>';
        echo '</div>';

        // 테스트 실행
        if ($_POST['action'] === 'test_inquiry') {
            echo '<div class="status info">';
            echo '<h3>🧪 테스트 문의사항 추가 중...</h3>';
            
            try {
                $integration = new NotionIntegration();
                
                $testData = [
                    'name' => $_POST['name'] ?: '테스트 사용자',
                    'email' => $_POST['email'] ?: 'test@scm-expert.com',
                    'phone' => $_POST['phone'] ?: '010-1234-5678',
                    'company' => $_POST['company'] ?: '테스트 회사',
                    'inquiry_type' => $_POST['inquiry_type'] ?: 'SCM 기초 강의',
                    'message' => $_POST['message'] ?: '이것은 Notion 연동 테스트 문의사항입니다.',
                    'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
                ];
                
                $result = $integration->saveInquiry($testData);
                
                if ($result) {
                    echo '<p>✅ <strong>성공!</strong> 테스트 문의사항이 Notion에 성공적으로 저장되었습니다.</p>';
                    echo '<p>📋 <a href="https://www.notion.so/' . str_replace('-', '', $config->get('NOTION_INQUIRIES_DB_ID')) . '" target="_blank">Notion에서 확인하기</a></p>';
                } else {
                    echo '<p>❌ <strong>실패:</strong> 문의사항 저장에 실패했습니다.</p>';
                }
                
            } catch (Exception $e) {
                echo '<p>❌ <strong>오류 발생:</strong> ' . htmlspecialchars($e->getMessage()) . '</p>';
            }
            
            echo '</div>';
        }
        ?>

        <!-- 테스트 폼 -->
        <div class="test-form">
            <h3>📝 테스트 문의사항 제출</h3>
            <form method="POST">
                <input type="hidden" name="action" value="test_inquiry">
                
                <div class="form-group">
                    <label for="name">이름:</label>
                    <input type="text" id="name" name="name" placeholder="홍길동" value="테스트 사용자">
                </div>
                
                <div class="form-group">
                    <label for="email">이메일:</label>
                    <input type="email" id="email" name="email" placeholder="test@example.com" value="test@scm-expert.com">
                </div>
                
                <div class="form-group">
                    <label for="phone">전화번호:</label>
                    <input type="tel" id="phone" name="phone" placeholder="010-1234-5678" value="010-1234-5678">
                </div>
                
                <div class="form-group">
                    <label for="company">회사명:</label>
                    <input type="text" id="company" name="company" placeholder="회사명" value="테스트 회사">
                </div>
                
                <div class="form-group">
                    <label for="inquiry_type">문의유형:</label>
                    <select id="inquiry_type" name="inquiry_type">
                        <option value="SCM 기초 강의">SCM 기초 강의</option>
                        <option value="커리어 컨설팅">커리어 컨설팅</option>
                        <option value="일반 문의">일반 문의</option>
                        <option value="기타">기타</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="message">문의내용:</label>
                    <textarea id="message" name="message" rows="4" placeholder="문의내용을 입력하세요">이것은 Notion 연동 테스트 문의사항입니다. SQL에서 Notion으로 성공적으로 마이그레이션되었는지 확인하는 테스트입니다.</textarea>
                </div>
                
                <button type="submit" class="btn">🚀 테스트 문의사항 제출</button>
            </form>
        </div>

        <div class="status success">
            <h3>🎉 마이그레이션 완료!</h3>
            <p>✅ <strong>메인 페이지:</strong> SCM 웹사이트 관리</p>
            <p>✅ <strong>문의사항 DB:</strong> 12개 속성으로 구성</p>
            <p>✅ <strong>수강생 관리 DB:</strong> 14개 속성으로 구성</p>
            <p>✅ <strong>강의 관리 DB:</strong> 17개 속성으로 구성</p>
            <p>✅ <strong>웹사이트 설정:</strong> config.php에 모든 ID 설정 완료</p>
        </div>

        <div class="status info">
            <h3>📌 다음 단계</h3>
            <p>1. 위의 테스트 폼으로 문의사항 제출 테스트</p>
            <p>2. Notion 데이터베이스에서 실시간 데이터 확인</p>
            <p>3. 실제 웹사이트 문의 폼에서 정상 작동 확인</p>
            <p>4. 수강생 등록 및 강의 관리 기능 테스트</p>
        </div>
    </div>
</body>
</html>