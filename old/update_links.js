const fs = require('fs');

// index.html 파일 읽기
const htmlContent = fs.readFileSync('index.html', 'utf8');

// 라인별로 분할
const lines = htmlContent.split('\r\n'); // Windows CRLF 고려

console.log('총 라인 수:', lines.length);

// 수정할 라인들 찾기 및 교체
let buttonCount = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 수강 문의 버튼 찾기
    if (line.includes('수강 문의') && line.includes('button') && line.includes('course-btn')) {
        buttonCount++;
        console.log(`버튼 ${buttonCount} 발견: 라인 ${i + 1}`);
        
        // 이전 30라인에서 강의 종류 확인
        let courseType = '알 수 없음';
        for (let j = Math.max(0, i - 30); j < i; j++) {
            if (lines[j].includes('초급반')) {
                courseType = '초급반';
                break;
            } else if (lines[j].includes('심화반')) {
                courseType = '심화반';
                break;
            }
        }
        
        console.log(`→ 강의 종류: ${courseType}`);
        
        if (courseType === '초급반') {
            lines[i] = '                        <a href="https://comento.kr/edu/learn/SCM/ERP-G20" target="_blank" class="btn btn-primary course-btn" style="width: 100%; display: block; text-align: center; text-decoration: none; color: white; padding: 15px;">수강 문의</a>';
            console.log('✅ 초급반 버튼을 코멘토 링크로 교체');
        } else if (courseType === '심화반') {
            lines[i] = '                        <a href="https://minsssul.notion.site/SCM-1af87a1932c480ebbe74ea5c9f64325c?source=copy_link" target="_blank" class="btn btn-primary course-btn" style="width: 100%; display: block; text-align: center; text-decoration: none; color: white; padding: 15px;">수강 문의</a>';
            console.log('✅ 심화반 버튼을 노션 링크로 교체');
        }
    }
}

// 수정된 내용을 파일에 저장
const updatedContent = lines.join('\r\n');
fs.writeFileSync('index_updated.html', updatedContent, 'utf8');

console.log('\n✅ index_updated.html 파일이 생성되었습니다!');
console.log('초급반 링크: https://comento.kr/edu/learn/SCM/ERP-G20');
console.log('심화반 링크: https://minsssul.notion.site/SCM-1af87a1932c480ebbe74ea5c9f64325c?source=copy_link');
