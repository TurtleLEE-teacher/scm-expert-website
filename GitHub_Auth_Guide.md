# 🔐 GitHub 인증 설정 가이드

## 방법 1: GitHub Desktop (가장 간단)

1. **GitHub Desktop 설치**
   - 다운로드: https://desktop.github.com/
   - TurtleLEE-teacher 계정으로 로그인

2. **프로젝트 추가**
   - "Add an Existing Repository from your Hard Drive" 
   - 폴더 선택: `C:\Users\ahfif\SuperClaude\Project_SCM_Site`

3. **저장소 퍼블리시**
   - "Publish repository" 버튼 클릭
   - 저장소 이름: `scm-expert-website`
   - Public으로 설정

## 방법 2: Personal Access Token

### 1단계: Token 생성
1. GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" 클릭
3. 권한 선택:
   - ✅ repo (전체)
   - ✅ workflow
   - ✅ write:packages
4. "Generate token" 클릭 → **토큰 복사 (한 번만 표시됨!)**

### 2단계: Git 설정
```bash
# Git에서 사용자명 설정
git config --global user.name "TurtleLEE-teacher"
git config --global user.email "your_email@example.com"

# 토큰으로 인증 (토큰을 비밀번호로 입력)
git push -u origin main
# Username: TurtleLEE-teacher
# Password: [생성한_토큰_입력]
```

## 방법 3: SSH 키 사용

### 1단계: SSH 키 생성
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

### 2단계: GitHub에 SSH 키 등록
1. GitHub → Settings → SSH and GPG keys
2. "New SSH key" 클릭
3. 공개 키 내용 붙여넣기 (~/.ssh/id_ed25519.pub)

### 3단계: SSH URL로 변경
```bash
git remote set-url origin git@github.com:TurtleLEE-teacher/scm-expert-website.git
git push -u origin main
```

---

## 🚀 성공 확인

인증이 완료되면 다음 URL에서 프로젝트를 확인할 수 있습니다:
**https://github.com/TurtleLEE-teacher/scm-expert-website**

## 📞 추가 도움

인증 문제가 계속되면:
1. GitHub 고객지원 문의
2. GitHub 문서 참조: https://docs.github.com/en/authentication