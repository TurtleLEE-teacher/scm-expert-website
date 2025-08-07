<?php
/**
 * Notion API 설정
 * 환경변수 기반으로 변경됨 - .env 파일을 사용하세요
 */

require_once __DIR__ . '/../includes/config.php';

define('NOTION_API_KEY', config('NOTION_API_KEY'));
define('NOTION_VERSION', '2022-06-28');

// 노션 통합(Integration) 생성 방법:
// 1. https://www.notion.so/my-integrations 접속
// 2. "New integration" 클릭
// 3. 이름 입력 (예: "SCM 교육 일정")
// 4. 생성 후 "Internal Integration Token" 복사
// 5. 위의 YOUR_NOTION_API_KEY_HERE를 실제 토큰으로 교체

// 데이터베이스 공유 방법:
// 1. 노션에서 데이터베이스 페이지 열기
// 2. 우측 상단 "Share" 클릭
// 3. "Invite" 검색창에서 생성한 Integration 이름 검색
// 4. 선택하여 초대

?>
