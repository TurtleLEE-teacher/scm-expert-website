# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

SCM(Supply Chain Management) 전문가 양성을 위한 강의 및 컨설팅 웹사이트입니다. 글로벌 컨설팅펌 현직 컨설턴트가 제공하는 전문 교육 서비스를 위한 반응형 웹사이트입니다.

## 기술 스택

### Frontend
- **HTML5**: 시맨틱 마크업
- **CSS3**: 반응형 디자인, 다크 테마, 애니메이션 및 트랜지션
- **JavaScript**: Vanilla JS, 동적 인터랙션, Notion API 연동
- **Bootstrap**: 일부 컴포넌트 활용

### 주요 페이지 (실제 사용 중)
| 파일 | 설명 | 비고 |
|------|------|------|
| `index.html` | 메인 랜딩 페이지 | 서비스 소개, 강사 프로필 |
| `basic-package.html` | **기본 패키지 (프로그램)** | 수요 기반 대기 등록 기능 포함 |
| `career-consulting.html` | 커리어 컨설팅 서비스 | 이력서/면접 컨설팅 |
| `career-application.html` | 커리어 컨설팅 신청 폼 | |
| `survey-form.html` | 설문조사 폼 | |
| `privacy-policy.html` | 개인정보처리방침 | |

### 레거시 파일 (사용 안 함)
| 파일 | 설명 |
|------|------|
| `scm-basic.html` | 구버전 SCM 강의 페이지 (basic-package.html로 대체됨) |
| `scm-application.html` | 구버전 수강 신청 폼 |

### Backend
- **PHP 7.4+**: 서버사이드 로직, SQLite 데이터베이스 사용 (MySQL에서 SQLite로 변경됨)
- **Notion API**: 외부 데이터 연동, 강의 일정 관리

## 개발 환경 설정

### 로컬 서버 실행
```bash
# PHP 내장 서버 사용 (권장)
php -S localhost:8000

# 또는 Apache/Nginx 웹서버 사용
# 프로젝트를 웹서버 root 디렉토리에 배치
```

### 데이터베이스 설정
- **타입**: SQLite
- **파일 위치**: `database/scm_expert.db`
- **연결 클래스**: `includes/database.php`의 `DatabaseConfig` 클래스 사용

### Notion API 설정
1. `dd/config.php` 파일에서 API 키 설정:
   ```php
   define('NOTION_API_KEY', 'your_actual_api_key');
   define('NOTION_DATABASE_ID', 'your_database_id');
   ```
2. Notion API 연동 테스트: 해당 테스트 페이지 접속

## 핵심 아키텍처

### 데이터베이스 레이어
- **DatabaseConfig**: 싱글톤 패턴을 사용한 SQLite 연결 관리
- **DatabaseHelper**: 문의사항, 로그, 통계 관리를 위한 헬퍼 클래스
- WAL 모드 설정으로 동시성 향상

### Notion API 레이어
- **NotionAPI 클래스** (`includes/notion-api.php`): 
  - 완전한 CRUD 작업 지원
  - 속성 자동 포맷팅 및 파싱
  - 로깅 시스템 내장
  - 데이터베이스 스키마 자동 생성

### Notion 데이터베이스 구조
| DB ID | 용도 | 설명 |
|-------|------|------|
| `NOTION_INQUIRIES_DB_ID` | 문의사항 | 일반 문의 저장 |
| `NOTION_STUDENTS_DB_ID` | 수강생 관리 | 확정된 수강생 정보 |
| `NOTION_COURSES_DB_ID` | 강의 일정 | 기수별 강의 스케줄 |
| `NOTION_SURVEY_DB_ID` | 설문조사 | 수강생 설문 응답 |
| `NOTION_CRM_DB_ID` | **CRM (수요관리)** | 수요 기반 대기 등록 |

## 주요 기능

### 수요 기반 기수 개설 시스템
기존 "기수 확정 → 신청" 방식에서 "수요 충족 → 기수 개설" 방식으로 변경되었습니다.

**운영 방식:**
- 강의 시간: 매주 토요일 20:00-22:00 (5주)
- 정원: 최소 3명 / 최대 6명
- 신청 기간: 개강 4주 전 ~ 2주 전
- 개강 확정: 마감 시점에 3명 이상이면 확정

**데이터 흐름:**
```
웹사이트 폼 (basic-package.html)
    ↓ POST /api/php/scm-demand.php
    ↓ Notion API
CRM 데이터베이스 → 관리자가 확인 후 기수 개설
```

**CRM 필드 구조:**
- 이름, 이메일, 전화번호 (필수)
- 소속구분: 직장인/학생/취업준비생/기타
- 회사명, 직책 (직장인)
- 전공, 학년 (학생)
- 대기 (월): 희망 시작 월
- 특이사항
- 문의일, 상태 (내부 관리용)

### Notion 연동
- 강의 일정 자동 동기화
- 수강생 관리 시스템
- 문의사항 자동 저장

### 반응형 디자인
- 모바일/태블릿/데스크톱 최적화
- 다크 테마 적용
- CSS 애니메이션 및 인터랙션

### 관리 시스템
- 문의사항 상태 관리
- 시스템 로그 기록
- 통계 정보 제공

## 개발 시 주의사항

### 파일 구조
- `dd/` 디렉토리: PHP 백엔드 파일 및 개발 중인 페이지들
- `includes/`: 공통 PHP 클래스 및 유틸리티
- `js/`: 다양한 JavaScript 파일들 (main.js가 메인, 백업 버전들 존재)
- `images/portfolio/`: 포트폴리오 관련 이미지

### 코딩 규칙
- HTML: 시맨틱 마크업 사용
- PHP: PSR 표준 준수, Prepared Statements 사용
- JavaScript: ES6+ 문법, Vanilla JS 사용
- SQLite: WAL 모드, 트랜잭션 사용

### 보안 고려사항
- API 키는 별도 설정 파일로 관리
- SQL 인젝션 방지를 위한 Prepared Statements
- XSS 방지를 위한 입력값 검증
- 로그 파일을 통한 모니터링

### 테스트
- Notion API 연동 테스트 기능 제공
- 반응형 디자인 테스트 필수
- 크로스 브라우저 호환성 확인

## 배포 및 백업

### 백업 정책
- `dd/` 디렉토리에 백업 파일들 보관
- 주요 변경사항 발생 시 백업 생성
- Git을 통한 버전 관리 권장

### 로그 관리
- 로그 위치: `logs/` 디렉토리
- Notion API 로그: `logs/notion.log`
- 데이터베이스 에러: `logs/error.log`

## 자주 사용하는 명령어

### 개발 서버 실행
```bash
php -S localhost:8000
```

### 데이터베이스 초기화
SQLite 파일이 없는 경우 `DatabaseConfig` 클래스가 자동으로 생성합니다.

### Notion API 테스트
브라우저에서 해당 테스트 페이지에 접속하여 연동 상태를 확인할 수 있습니다.