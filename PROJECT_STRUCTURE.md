# SCM Expert Website - 정리된 프로젝트 구조

## 📁 디렉토리 구조

```
Project_SCM_Site/
├── 📄 index.html                    # 메인 페이지
├── 📄 career-consulting.html        # 커리어 컨설팅 페이지  
├── 📄 scm-basic.html               # SCM 기초 강의 페이지
├── 📄 CLAUDE.md                    # Claude Code 지침서
├── 📄 README.md                    # 프로젝트 설명서
├── 📄 .env.example                 # 환경변수 템플릿
│
├── 📁 api/                         # API 엔드포인트
│   ├── contact-form.php           # 문의 폼 처리 (Notion 연동)
│   ├── get-notion-schedule.php    # 강의 일정 API (캐싱 지원)
│   ├── notion-config.php          # Notion API 설정
│   └── test-notion-api.php        # API 테스트 페이지
│
├── 📁 includes/                    # PHP 클래스 및 설정
│   ├── config.php                 # 환경변수 기반 설정 관리
│   ├── notion-api.php             # Notion API 래퍼 클래스
│   ├── notion-integration.php     # Notion 통합 로직
│   ├── notion-migration.php       # 데이터 마이그레이션 도구
│   ├── notion.php                 # Notion 헬퍼 클래스 (SQLite 제거됨)
│   └── email.php                  # 이메일 발송 기능
│
├── 📁 css/
│   └── optimized.css              # 통합 스타일시트
│
├── 📁 js/
│   └── enhanced.js                # 메인 JavaScript (성능 최적화됨)
│
├── 📁 data/
│   └── schedule.json              # 강의 일정 데이터 (Notion 동기화)
│
├── 📁 images/                     # 이미지 자산
│   ├── portfolio/                 # 포트폴리오 이미지들
│   └── ...                       # 기타 이미지들
│
├── 📁 docs/                       # 문서화
│   ├── notion-setup-guide.md     # Notion 설정 가이드
│   └── test-notion.php           # Notion 연동 테스트
│
└── 📁 tools/                      # 개발 도구들
    ├── 📁 tests/                  # 테스트 스크립트들
    │   ├── test-*.js             # 각종 테스트 파일들
    │   └── check-*.js            # 상태 확인 스크립트들
    ├── create-*.js               # 데이터베이스 생성 스크립트들
    ├── slack-*.js                # Slack 통합 스크립트들
    └── *.md                      # 설정 가이드들
```

## 🔧 주요 개선 사항

### ✅ 완료된 작업

1. **SQLite 제거**
   - `includes/database.php` 삭제
   - `includes/notion.php`에서 이중 저장 로직 제거
   - Notion 전용 아키텍처로 전환

2. **API 최적화**
   - `api/get-notion-schedule.php`에 5분 캐싱 추가
   - Notion API 장애 시 폴백 메커니즘 구현
   - 성능 헤더 및 에러 처리 개선

3. **보안 강화**
   - 하드코딩된 API 키를 환경변수로 변경
   - `.env.example` 파일 업데이트
   - 여러 파일에 분산된 중복 키 정리

4. **파일 구조 정리**
   - 테스트 파일들을 `tools/tests/`로 이동
   - 개발 도구들을 `tools/`로 이동
   - 불필요한 임시 파일들 제거

## 💡 현재 데이터 플로우

### 문의 폼
```
사용자 입력 → JavaScript 검증 → api/contact-form.php → Notion 문의 DB
```

### 강의 스케줄
```
Notion 강의 DB → api/get-notion-schedule.php (캐싱) → scm-basic.html 동적 렌더링
```

## 🚀 다음 단계 (Tally 연동 후)

사용자가 Tally 폼을 생성하고 Notion 연동을 완료하면:
1. 기존 HTML 폼을 Tally 임베드로 교체
2. PHP 폼 처리 로직 제거 가능
3. 완전한 정적 사이트로 전환 (GitHub Pages 호스팅 가능)

## 📋 환경 설정

1. `.env.example`을 `.env`로 복사
2. 실제 Notion API 키 입력
3. 필요 시 Slack 토큰 설정

프로젝트가 깔끔하게 정리되어 유지보수가 훨씬 쉬워졌습니다! 🎉