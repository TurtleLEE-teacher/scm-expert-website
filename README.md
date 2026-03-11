# SCM Labs - SCM 커리어 부트캠프

> 글로벌 Big 4 컨설팅펌 현직 컨설턴트가 제공하는 SCM 직무 트레이닝 + 커리어 컨설팅

**[https://turtlelee-teacher.github.io/scm-expert-website](https://turtlelee-teacher.github.io/scm-expert-website)**

## 서비스

| 페이지 | 설명 |
|--------|------|
| [`index.html`](index.html) | 메인 랜딩 페이지 |
| [`basic-package.html`](basic-package.html) | SCM 커리어 부트캠프 (5주 트레이닝 + 1:1 컨설팅) |
| [`career-consulting.html`](career-consulting.html) | 커리어 컨설팅 (자소서/면접/포트폴리오) |
| [`career-application.html`](career-application.html) | 커리어 컨설팅 신청 폼 |
| [`survey-form.html`](survey-form.html) | 수강생 설문조사 |
| [`privacy-policy.html`](privacy-policy.html) | 개인정보처리방침 |

## 기술 스택

- **Frontend**: HTML5, CSS3 (design-system.css), Vanilla JS (ES6+)
- **Backend**: PHP 7.4+, SQLite, Notion API
- **폰트**: Pretendard
- **배포**: GitHub Pages

## 로컬 실행

```bash
git clone https://github.com/TurtleLEE-teacher/scm-expert-website.git
cd scm-expert-website
php -S localhost:8000
```

## 프로젝트 구조

```
scm-expert-website/
├── index.html                 # 메인 랜딩
├── basic-package.html         # 부트캠프 (메인 상품)
├── career-consulting.html     # 커리어 컨설팅
├── career-application.html    # 컨설팅 신청 폼
├── survey-form.html           # 설문조사
├── privacy-policy.html        # 개인정보처리방침
├── css/
│   └── design-system.css      # 디자인 시스템 (공통 스타일)
├── js/
│   ├── reviews.js             # Notion 후기 동적 로드
│   └── enhanced.js            # 인터랙션
├── images/
│   └── portfolio/             # 강의 현장 사진, 실무 화면 등
├── api/                       # Vercel Serverless Functions
│   ├── scm-demand.js          # 수강 대기 등록 API
│   └── ...
├── includes/                  # PHP 백엔드 클래스
│   ├── notion-api.php         # Notion API 연동
│   └── database.php           # SQLite 연결
├── data/
│   └── schedule.json          # 강의 일정 데이터
└── CLAUDE.md                  # Claude Code 프로젝트 지침
```

## 레거시 파일 (미사용)

- `scm-basic.html` → `basic-package.html`로 대체됨
- `scm-application.html` → 구버전 수강 신청 폼
- `debug-*.html`, `test-*.html` → 개발용 테스트 페이지
