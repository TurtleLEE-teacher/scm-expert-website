<?php
session_start();

// 간단한 인증 (실제 환경에서는 더 강력한 인증 필요)
$isAuthenticated = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

// 로그인 처리
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // 간단한 하드코딩된 인증 (실제로는 데이터베이스 확인)
    if ($username === 'admin' && $password === 'admin123') {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        header('Location: admin.php');
        exit;
    } else {
        $loginError = '아이디 또는 비밀번호가 잘못되었습니다.';
    }
}

// 로그아웃 처리
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: admin.php');
    exit;
}

// 데이터베이스 초기화 처리
if ($isAuthenticated && isset($_POST['init_db'])) {
    try {
        include 'init_db.php';
        $dbInitialized = true;
    } catch (Exception $e) {
        $dbInitError = $e->getMessage();
    }
}

// 인증된 경우 문의 데이터 및 이메일 로그 로드
if ($isAuthenticated) {
    try {
        require_once 'includes/database.php';
        require_once 'includes/notion.php';
        
        // SQLite 데이터 로드
        $dbHelper = new DatabaseHelper();
        $inquiries = $dbHelper->getInquiries(20); // 최근 20개 문의
        $stats = $dbHelper->getStatistics();
        
        // 노션 데이터 로드
        $notionHelper = new NotionHelper();
        $allStudents = $notionHelper->getAllStudents();
        $notionStudents = $allStudents['notion'] ?? [];
        $notionError = $allStudents['notion_error'] ?? null;
        
        // 노션 연결 테스트
        $notion = new NotionAPI();
        $notionConnected = $notion->testConnection();
        
        // 이메일 로그 읽기
        $emailLogFile = 'logs/email.log';
        $emailLogs = [];
        if (file_exists($emailLogFile)) {
            $logLines = file($emailLogFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $emailLogs = array_slice(array_reverse($logLines), 0, 20); // 최근 20개
            $emailLogs = array_map('json_decode', $emailLogs);
        }
        
        // 노션 로그 읽기
        $notionLogFile = 'logs/notion.log';
        $notionLogs = [];
        if (file_exists($notionLogFile)) {
            $logLines = file($notionLogFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $notionLogs = array_slice(array_reverse($logLines), 0, 10); // 최근 10개
        }
        
    } catch (Exception $e) {
        $dbError = $e->getMessage();
        $inquiries = [];
        $stats = [];
        $emailLogs = [];
        $notionStudents = [];
        $notionLogs = [];
        $notionError = $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>관리자 페이지 - SCM Expert</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            background: #f8f9fa;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header h1 {
            font-size: 24px;
        }
        
        .logout-btn {
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
        }
        
        .logout-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        
        .content {
            padding: 30px;
        }
        
        .login-form {
            max-width: 400px;
            margin: 50px auto;
            padding: 30px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .login-form h2 {
            text-align: center;
            margin-bottom: 30px;
            color: #333;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #555;
            font-weight: 500;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .btn {
            width: 100%;
            padding: 12px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .btn:hover {
            background: #5a67d8;
        }
        
        .btn-secondary {
            background: #6c757d;
            margin-top: 10px;
        }
        
        .btn-secondary:hover {
            background: #5a6268;
        }
        
        .error {
            color: #dc3545;
            margin-top: 10px;
            text-align: center;
        }
        
        .success {
            color: #28a745;
            margin-top: 10px;
            text-align: center;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            border-left: 4px solid #667eea;
        }
        
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #666;
            font-size: 14px;
        }
        
        .inquiries-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        .inquiries-table th,
        .inquiries-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .inquiries-table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #555;
        }
        
        .inquiries-table tr:hover {
            background: #f8f9fa;
        }
        
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .status-new {
            background: #ffeaa7;
            color: #2d3436;
        }
        
        .status-processed {
            background: #a7f3d0;
            color: #065f46;
        }
        
        .message-preview {
            max-width: 200px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section h2 {
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
    </style>
</head>
<body>
    <?php if (!$isAuthenticated): ?>
        <!-- 로그인 폼 -->
        <div class="login-form">
            <h2>SCM Expert 관리자</h2>
            <form method="POST">
                <div class="form-group">
                    <label for="username">아이디</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">비밀번호</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" name="login" class="btn">로그인</button>
                
                <?php if (isset($loginError)): ?>
                    <div class="error"><?= htmlspecialchars($loginError) ?></div>
                <?php endif; ?>
            </form>
            
            <form method="POST" style="margin-top: 20px;">
                <button type="submit" name="init_db" class="btn btn-secondary">데이터베이스 초기화</button>
                <?php if (isset($dbInitialized)): ?>
                    <div class="success">데이터베이스가 성공적으로 초기화되었습니다!</div>
                <?php elseif (isset($dbInitError)): ?>
                    <div class="error">데이터베이스 초기화 실패: <?= htmlspecialchars($dbInitError) ?></div>
                <?php endif; ?>
            </form>
            
            <div style="margin-top: 20px; text-align: center; color: #666; font-size: 14px;">
                기본 계정: admin / admin123
            </div>
        </div>
    <?php else: ?>
        <!-- 관리자 대시보드 -->
        <div class="container">
            <div class="header">
                <h1>SCM Expert 관리자 대시보드</h1>
                <a href="?logout=1" class="logout-btn">로그아웃</a>
            </div>
            <div class="content">
                <?php if (isset($dbError)): ?>
                    <div class="error" style="padding: 20px; background: #f8d7da; border-radius: 5px; margin-bottom: 20px;">
                        데이터베이스 연결 오류: <?= htmlspecialchars($dbError) ?>
                        <br><br>
                        <form method="POST" style="display: inline;">
                            <button type="submit" name="init_db" class="btn" style="width: auto; padding: 8px 16px;">데이터베이스 초기화</button>
                        </form>
                    </div>
                <?php endif; ?>
                
                <?php if (isset($dbInitialized)): ?>
                    <div class="success" style="padding: 20px; background: #d4edda; border-radius: 5px; margin-bottom: 20px;">
                        데이터베이스가 성공적으로 초기화되었습니다! 페이지를 새로고침하세요.
                    </div>
                <?php endif; ?>
                
                <?php if (!empty($stats)): ?>
                <div class="section">
                    <h2>통계</h2>
                    <div class="stats">
                        <div class="stat-card">
                            <div class="stat-number"><?= $stats['total_inquiries'] ?? 0 ?></div>
                            <div class="stat-label">총 문의 (SQLite)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number"><?= count($notionStudents) ?></div>
                            <div class="stat-label">수강생 (Notion)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number"><?= $stats['today_inquiries'] ?? 0 ?></div>
                            <div class="stat-label">오늘 문의</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number"><?= $notionConnected ? '연결됨' : '오류' ?></div>
                            <div class="stat-label">Notion API</div>
                        </div>
                    </div>
                </div>
                <?php endif; ?>
                
                <!-- 노션 수강생 목록 -->
                <div class="section">
                    <h2>노션 수강생 목록</h2>
                    <?php if ($notionError): ?>
                        <div class="error" style="padding: 15px; background: #f8d7da; border-radius: 5px; margin-bottom: 20px;">
                            노션 연결 오류: <?= htmlspecialchars($notionError) ?>
                            <br><small>config.php에서 NOTION_API_KEY와 NOTION_DATABASE_ID를 확인하세요.</small>
                        </div>
                    <?php endif; ?>
                    
                    <?php if (!empty($notionStudents)): ?>
                        <table class="inquiries-table">
                            <thead>
                                <tr>
                                    <th>이름</th>
                                    <th>이메일</th>
                                    <th>전화번호</th>
                                    <th>회사</th>
                                    <th>과정</th>
                                    <th>상태</th>
                                    <th>등록일</th>
                                    <th>메시지</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($notionStudents as $student): ?>
                                <tr>
                                    <td><?= htmlspecialchars($student['name']) ?></td>
                                    <td><?= htmlspecialchars($student['email']) ?></td>
                                    <td><?= htmlspecialchars($student['phone']) ?></td>
                                    <td><?= htmlspecialchars($student['company']) ?></td>
                                    <td><?= htmlspecialchars($student['course']) ?></td>
                                    <td>
                                        <span class="status-badge <?= $student['status'] === '신규' ? 'status-new' : 'status-processed' ?>">
                                            <?= htmlspecialchars($student['status']) ?>
                                        </span>
                                    </td>
                                    <td><?= htmlspecialchars($student['registration_date']) ?></td>
                                    <td class="message-preview" title="<?= htmlspecialchars($student['message']) ?>">
                                        <?= htmlspecialchars(substr($student['message'], 0, 50)) ?>...
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php else: ?>
                        <p style="text-align: center; color: #666; padding: 40px;">
                            <?= $notionError ? '노션 연결을 확인하세요.' : '아직 등록된 수강생이 없습니다.' ?>
                        </p>
                    <?php endif; ?>
                </div>
                
                <!-- 노션 로그 -->
                <?php if (!empty($notionLogs)): ?>
                <div class="section">
                    <h2>노션 연동 로그</h2>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 14px; max-height: 300px; overflow-y: auto;">
                        <?php foreach ($notionLogs as $log): ?>
                            <div style="margin-bottom: 5px; <?= strpos($log, '[ERROR]') !== false ? 'color: #dc3545;' : (strpos($log, '[SUCCESS]') !== false ? 'color: #28a745;' : '') ?>">
                                <?= htmlspecialchars($log) ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
                <?php endif; ?>
                
                <div class="section">
                    <h2>이메일 로그</h2>
                    <?php if (!empty($emailLogs)): ?>
                        <table class="inquiries-table">
                            <thead>
                                <tr>
                                    <th>시간</th>
                                    <th>유형</th>
                                    <th>수신자</th>
                                    <th>제목</th>
                                    <th>상태</th>
                                    <th>오류</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($emailLogs as $log): ?>
                                    <?php if ($log): ?>
                                <tr>
                                    <td><?= htmlspecialchars($log->timestamp ?? '') ?></td>
                                    <td><?= htmlspecialchars($log->type ?? '') ?></td>
                                    <td><?= htmlspecialchars($log->to ?? '') ?></td>
                                    <td class="message-preview" title="<?= htmlspecialchars($log->subject ?? '') ?>">
                                        <?= htmlspecialchars(substr($log->subject ?? '', 0, 30)) ?>...
                                    </td>
                                    <td>
                                        <span class="status-badge <?= ($log->status === 'SUCCESS' || $log->status === 'DEVELOPMENT_MODE') ? 'status-processed' : 'status-new' ?>">
                                            <?= htmlspecialchars($log->status ?? '') ?>
                                        </span>
                                    </td>
                                    <td>
                                        <?= $log->error ? htmlspecialchars(substr($log->error, 0, 50)) . '...' : '-' ?>
                                    </td>
                                </tr>
                                    <?php endif; ?>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php else: ?>
                        <p style="text-align: center; color: #666; padding: 40px;">
                            아직 이메일 로그가 없습니다.
                        </p>
                    <?php endif; ?>
                </div>
                
                <div class="section">
                    <h2>최근 문의 (SQLite 백업)</h2>
                    <?php if (!empty($inquiries)): ?>
                        <table class="inquiries-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>이름</th>
                                    <th>이메일</th>
                                    <th>전화번호</th>
                                    <th>문의유형</th>
                                    <th>메시지</th>
                                    <th>상태</th>
                                    <th>날짜</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($inquiries as $inquiry): ?>
                                <tr>
                                    <td><?= htmlspecialchars($inquiry['id']) ?></td>
                                    <td><?= htmlspecialchars($inquiry['name']) ?></td>
                                    <td><?= htmlspecialchars($inquiry['email']) ?></td>
                                    <td><?= htmlspecialchars($inquiry['phone']) ?></td>
                                    <td><?= htmlspecialchars($inquiry['inquiry_type']) ?></td>
                                    <td class="message-preview" title="<?= htmlspecialchars($inquiry['message']) ?>">
                                        <?= htmlspecialchars(substr($inquiry['message'], 0, 50)) ?>...
                                    </td>
                                    <td>
                                        <span class="status-badge status-<?= $inquiry['status'] ?>">
                                            <?= $inquiry['status'] === 'new' ? '새 문의' : '처리됨' ?>
                                        </span>
                                    </td>
                                    <td><?= date('Y-m-d H:i', strtotime($inquiry['created_at'])) ?></td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    <?php else: ?>
                        <p style="text-align: center; color: #666; padding: 40px;">
                            아직 접수된 문의가 없습니다.
                        </p>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    <?php endif; ?>
</body>
</html>