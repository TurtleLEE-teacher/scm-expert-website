# 🚀 SCM Expert 신청 시스템 배포 가이드

## 📋 시스템 개요

SCM Expert 웹사이트에 완전한 신청 시스템이 구축되었습니다:
- **SCM 부트캠프 신청 폼**: `scm-application.html`
- **커리어 컨설팅 신청 폼**: `career-application.html` (파일 업로드 포함)
- **Notion API 자동 연동**: 모든 신청이 Notion DB에 자동 저장
- **계좌이체 전용 결제**: 카드/할부 없음
- **완전한 보안 시스템**: 파일 업로드 보안, CORS, XSS 방지

## 🔧 배포 전 필수 설정

### 1. Notion API 키 설정
```bash
# .env 파일 생성 (.env.example 파일을 복사)
cp .env.example .env
```

`.env` 파일에 실제 Notion API 키를 설정:
```env
NOTION_API_KEY=secret_your_actual_notion_api_key_here
NOTION_INQUIRIES_DB_ID=23787a19-32c4-81c5-9df9-eb0bed62f1a8
NOTION_STUDENTS_DB_ID=23787a19-32c4-8129-9a6e-d7ed01c9424f
```

### 2. 디렉토리 권한 설정
```bash
# 업로드 디렉토리 권한
chmod 755 uploads/
chmod 755 uploads/resumes/

# 로그 디렉토리 권한
chmod 755 logs/
chmod 644 logs/.htaccess

# API 디렉토리 권한
chmod 644 api/.htaccess
```

### 3. 이메일 설정 (선택사항)
PHP의 `mail()` 함수가 작동하지 않는 경우, SMTP 설정이 필요할 수 있습니다.

## 🌐 웹서버 설정

### Apache 설정
```apache
<VirtualHost *:80>
    DocumentRoot /path/to/scm-expert
    ServerName yourdomain.com
    
    # .htaccess 사용 허용
    <Directory "/path/to/scm-expert">
        AllowOverride All
        Options -Indexes
        Require all granted
    </Directory>
    
    # PHP 설정
    php_admin_value upload_max_filesize 10M
    php_admin_value post_max_size 12M
    php_admin_value max_execution_time 60
</VirtualHost>
```

### Nginx 설정
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/scm-expert;
    index index.html;

    # 파일 업로드 크기 제한
    client_max_body_size 10M;

    # PHP 처리
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    # 보안 설정
    location ~ /\.(env|log|htaccess) {
        deny all;
    }

    location ~ ^/(uploads|logs)/ {
        location ~ \.(pdf|doc|docx)$ {
            allow all;
        }
        deny all;
    }
}
```

## 📊 모니터링 및 로그

### 로그 파일 위치
- **성공 로그**: `logs/scm_application.log`, `logs/career_application.log`
- **에러 로그**: `logs/scm_application.log`, `logs/career_application.log`
- **업로드 파일**: `uploads/resumes/`

### 로그 모니터링 명령어
```bash
# 실시간 로그 모니터링
tail -f logs/scm_application.log logs/career_application.log

# 성공적인 신청 건수 확인
grep "SUCCESS" logs/*.log | wc -l

# 에러 확인
grep "ERROR" logs/*.log
```

## 🔒 보안 체크리스트

- ✅ .htaccess 파일들이 모든 디렉토리에 설정됨
- ✅ 업로드 파일 타입 제한 (PDF, DOC, DOCX만)
- ✅ 파일 크기 제한 (10MB)
- ✅ 매직 바이트 검증으로 파일 내용 검사
- ✅ CORS 헤더 보안 설정
- ✅ XSS 방지 헤더 설정
- ✅ 로그 디렉토리 외부 접근 차단
- ✅ 환경변수(.env) 파일 보호

## 📱 사용자 여정

1. **웹사이트 방문** → `index.html`, `career-consulting.html`, `scm-basic.html`
2. **"신청하기" 클릭** → 새 탭에서 신청 폼 열림
3. **정보 입력** → 자동 유효성 검사, 가격 표시
4. **폼 제출** → JavaScript로 API 호출
5. **서버 처리** → 유효성 검사, Notion 저장
6. **이메일 발송** → 관리자에게 자동 알림
7. **사용자 알림** → 성공 메시지 + 24시간 내 연락 안내

## 🚨 문제 해결

### 일반적인 문제들

**Q: 신청 폼에서 "Notion API 키가 설정되지 않았습니다" 에러**
A: `.env` 파일에 실제 Notion API 키를 설정하세요.

**Q: 파일 업로드가 안 됨**
A: PHP 설정에서 `upload_max_filesize`와 `post_max_size`를 확인하세요.

**Q: 이메일이 발송되지 않음**
A: 서버의 `mail()` 함수 설정을 확인하거나 SMTP 설정을 추가하세요.

**Q: CORS 에러 발생**
A: `api/.htaccess` 파일의 CORS 설정을 실제 도메인으로 변경하세요.

## 🎯 성능 최적화

### 권장 사항
1. **CDN 사용**: CSS, JS 파일을 CDN으로 서빙
2. **이미지 압축**: 포트폴리오 이미지들을 WebP로 변환
3. **캐싱 설정**: `.htaccess`의 캐시 설정 활용
4. **로그 로테이션**: 정기적으로 로그 파일 백업 및 정리

### 모니터링 도구
```bash
# 디스크 사용량 모니터링
du -sh uploads/ logs/

# 접근 로그 분석
grep "application.php" access.log | wc -l
```

## ✅ 배포 완료 체크리스트

- [ ] .env 파일에 실제 Notion API 키 설정
- [ ] 디렉토리 권한 설정 완료
- [ ] 웹서버 설정 적용
- [ ] PHP 업로드 설정 확인
- [ ] 테스트 신청으로 전체 프로세스 검증
- [ ] 이메일 발송 테스트
- [ ] 로그 파일 생성 확인
- [ ] 보안 설정 점검 완료

🎉 **배포 완료!** 이제 SCM Expert 신청 시스템이 완전히 운영 가능합니다.