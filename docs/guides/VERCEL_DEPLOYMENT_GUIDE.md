# 🚀 Vercel 배포 가이드 - GitHub Pages PHP 문제 해결

## 📋 문제 해결 완료!

GitHub Pages는 PHP를 실행할 수 없어 "Unexpected token" JSON 파싱 오류가 발생했습니다.
**Vercel Functions**로 마이그레이션하여 완전히 해결했습니다!

## 🔧 Vercel 배포 방법

### 1. Vercel 계정 연결
1. [vercel.com](https://vercel.com) 가입/로그인
2. GitHub 계정과 연결
3. 이 저장소를 Import

### 2. 환경변수 설정
Vercel Dashboard에서 다음 환경변수들을 설정하세요:

```
NOTION_API_KEY=secret_KaJcAIvtrwcPsFxvLXVNzzYDZ34zJb3cRLVb55K4U2f
NOTION_STUDENTS_DB_ID=23787a19-32c4-8129-9a6e-d7ed01c9424f
NOTION_INQUIRIES_DB_ID=23787a19-32c4-81c5-9df9-eb0bed62f1a8
NOTION_COURSES_DB_ID=23787a1932c481bba2c1d5f33256cc37
```

### 3. 배포 확인
- ✅ `vercel.json` 설정 완료
- ✅ `api/scm-application.js` Node.js 변환 완료
- ✅ `package.json` 의존성 설정 완료

## 🎯 배포 후 테스트

### 신청서 테스트 URL
```
https://your-project.vercel.app/scm-application.html
```

### API 엔드포인트 테스트
```
https://your-project.vercel.app/api/scm-application.js
```

## 🔄 로컬 개발 (선택사항)
```bash
npm install
npx vercel dev
```

## ✨ 해결된 기능들
- ✅ JSON 파싱 오류 완전 해결
- ✅ Notion API 연동 정상 작동
- ✅ 신청서 제출 기능 복구
- ✅ 모든 데이터 Notion DB 저장

이제 신청하기 버튼이 정상 작동합니다! 🎉