/**
 * 간단한 Notion 데이터베이스 생성 스크립트
 * 사용자가 메인 페이지를 먼저 생성한 후 페이지 ID를 입력하면 실행
 */

const https = require('https');

const NOTION_API_KEY = process.env.NOTION_API_KEY || 'your_notion_api_key_here';
const NOTION_API_VERSION = '2022-06-28';

// 명령행 인자에서 페이지 ID 받기
const parentPageId = process.argv[2];

if (!parentPageId) {
    console.log('🚨 사용법: node create-databases-simple.js <페이지_ID>');
    console.log('');
    console.log('📌 먼저 다음 단계를 완료하세요:');
    console.log('1. Notion에서 새 페이지 생성');
    console.log('2. 페이지 제목: "SCM 웹사이트 관리"');
    console.log('3. 페이지 URL에서 ID 복사 (32자리 영숫자)');
    console.log('4. 이 스크립트를 다시 실행: node create-databases-simple.js <페이지_ID>');
    process.exit(1);
}

console.log(`📋 메인 페이지 ID: ${parentPageId}`);
console.log('🚀 데이터베이스 생성을 시작합니다...\n');

// Notion API 호출 함수
function callNotionAPI(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.notion.com',
            port: 443,
            path: endpoint,
            method: method,
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': NOTION_API_VERSION,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(result);
                    } else {
                        reject({ status: res.statusCode, error: result });
                    }
                } catch (e) {
                    reject({ status: res.statusCode, error: body });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// 문의사항 데이터베이스 생성
async function createInquiriesDatabase(parentId) {
    console.log('📋 문의사항 데이터베이스 생성 중...');
    
    const databaseData = {
        parent: { type: 'page_id', page_id: parentId },
        title: [
            {
                type: 'text',
                text: { content: '문의사항 관리' }
            }
        ],
        properties: {
            '이름': { type: 'title', title: {} },
            '이메일': { type: 'email', email: {} },
            '전화번호': { type: 'phone_number', phone_number: {} },
            '회사명': { type: 'rich_text', rich_text: {} },
            '문의유형': {
                type: 'select',
                select: {
                    options: [
                        { name: 'SCM 기초 강의', color: 'blue' },
                        { name: '커리어 컨설팅', color: 'green' },
                        { name: '일반 문의', color: 'gray' },
                        { name: '기타', color: 'yellow' }
                    ]
                }
            },
            '문의내용': { type: 'rich_text', rich_text: {} },
            '상태': {
                type: 'select',
                select: {
                    options: [
                        { name: '새 문의', color: 'yellow' },
                        { name: '처리중', color: 'blue' },
                        { name: '답변완료', color: 'green' },
                        { name: '보류', color: 'red' }
                    ]
                }
            },
            '접수일': { type: 'created_time', created_time: {} },
            '최종수정일': { type: 'last_edited_time', last_edited_time: {} },
            'IP주소': { type: 'rich_text', rich_text: {} },
            '답변내용': { type: 'rich_text', rich_text: {} },
            '우선순위': {
                type: 'select',
                select: {
                    options: [
                        { name: '높음', color: 'red' },
                        { name: '보통', color: 'yellow' },
                        { name: '낮음', color: 'green' }
                    ]
                }
            }
        }
    };

    try {
        const result = await callNotionAPI('/v1/databases', 'POST', databaseData);
        console.log('✅ 문의사항 데이터베이스 생성 완료');
        console.log(`   ID: ${result.id}`);
        console.log(`   URL: ${result.url}`);
        return result.id;
    } catch (error) {
        console.error('❌ 문의사항 데이터베이스 생성 실패:', error);
        throw error;
    }
}

// 수강생 관리 데이터베이스 생성
async function createStudentsDatabase(parentId) {
    console.log('\n👥 수강생 관리 데이터베이스 생성 중...');
    
    const databaseData = {
        parent: { type: 'page_id', page_id: parentId },
        title: [
            {
                type: 'text',
                text: { content: '수강생 관리' }
            }
        ],
        properties: {
            '이름': { type: 'title', title: {} },
            '이메일': { type: 'email', email: {} },
            '전화번호': { type: 'phone_number', phone_number: {} },
            '회사명': { type: 'rich_text', rich_text: {} },
            '직책': { type: 'rich_text', rich_text: {} },
            '등록일': { type: 'date', date: {} },
            '결제상태': {
                type: 'select',
                select: {
                    options: [
                        { name: '결제대기', color: 'yellow' },
                        { name: '결제완료', color: 'green' },
                        { name: '환불', color: 'red' },
                        { name: '부분환불', color: 'orange' }
                    ]
                }
            },
            '결제금액': { 
                type: 'number', 
                number: { format: 'won' }
            },
            '수강강의': { type: 'rich_text', rich_text: {} },
            '진도율': { 
                type: 'number', 
                number: { format: 'percent' }
            },
            '수료여부': { type: 'checkbox', checkbox: {} },
            '만족도': {
                type: 'select',
                select: {
                    options: [
                        { name: '매우만족', color: 'green' },
                        { name: '만족', color: 'blue' },
                        { name: '보통', color: 'yellow' },
                        { name: '불만족', color: 'red' }
                    ]
                }
            },
            '특이사항': { type: 'rich_text', rich_text: {} },
            '최종접속일': { type: 'date', date: {} }
        }
    };

    try {
        const result = await callNotionAPI('/v1/databases', 'POST', databaseData);
        console.log('✅ 수강생 관리 데이터베이스 생성 완료');
        console.log(`   ID: ${result.id}`);
        console.log(`   URL: ${result.url}`);
        return result.id;
    } catch (error) {
        console.error('❌ 수강생 관리 데이터베이스 생성 실패:', error);
        throw error;
    }
}

// 강의 관리 데이터베이스 생성
async function createCoursesDatabase(parentId) {
    console.log('\n📚 강의 관리 데이터베이스 생성 중...');
    
    const databaseData = {
        parent: { type: 'page_id', page_id: parentId },
        title: [
            {
                type: 'text',
                text: { content: '강의 관리' }
            }
        ],
        properties: {
            '강의명': { type: 'title', title: {} },
            '카테고리': {
                type: 'select',
                select: {
                    options: [
                        { name: 'SCM 기초', color: 'blue' },
                        { name: 'SAP ERP', color: 'green' },
                        { name: '컨설팅 도구', color: 'purple' },
                        { name: '커리어 개발', color: 'orange' },
                        { name: '실무 프로젝트', color: 'red' }
                    ]
                }
            },
            '난이도': {
                type: 'select',
                select: {
                    options: [
                        { name: '초급', color: 'green' },
                        { name: '중급', color: 'yellow' },
                        { name: '고급', color: 'red' },
                        { name: '전문가', color: 'purple' }
                    ]
                }
            },
            '가격': { 
                type: 'number', 
                number: { format: 'won' }
            },
            '할인가격': { 
                type: 'number', 
                number: { format: 'won' }
            },
            '강의시간': { type: 'rich_text', rich_text: {} },
            '강의설명': { type: 'rich_text', rich_text: {} },
            '상태': {
                type: 'select',
                select: {
                    options: [
                        { name: '준비중', color: 'yellow' },
                        { name: '모집중', color: 'green' },
                        { name: '진행중', color: 'blue' },
                        { name: '종료', color: 'gray' },
                        { name: '일시중단', color: 'red' }
                    ]
                }
            },
            '개강일': { type: 'date', date: {} },
            '종료일': { type: 'date', date: {} },
            '최대인원': { type: 'number', number: {} },
            '현재등록인원': { type: 'number', number: {} },
            '강의자료URL': { type: 'url', url: {} },
            'Zoom링크': { type: 'url', url: {} },
            '커리큘럼': { type: 'rich_text', rich_text: {} },
            '선수조건': { type: 'rich_text', rich_text: {} },
            '수료혜택': { type: 'rich_text', rich_text: {} }
        }
    };

    try {
        const result = await callNotionAPI('/v1/databases', 'POST', databaseData);
        console.log('✅ 강의 관리 데이터베이스 생성 완료');
        console.log(`   ID: ${result.id}`);
        console.log(`   URL: ${result.url}`);
        return result.id;
    } catch (error) {
        console.error('❌ 강의 관리 데이터베이스 생성 실패:', error);
        throw error;
    }
}

// 메인 실행 함수
async function createAllDatabases() {
    try {
        const inquiriesId = await createInquiriesDatabase(parentPageId);
        const studentsId = await createStudentsDatabase(parentPageId);
        const coursesId = await createCoursesDatabase(parentPageId);
        
        console.log('\n' + '='.repeat(70));
        console.log('🎉 모든 데이터베이스 생성이 완료되었습니다!');
        console.log('='.repeat(70));
        
        console.log('\n📋 생성된 데이터베이스 ID (config.php에 설정하세요):');
        console.log(`NOTION_INQUIRIES_DB_ID="${inquiriesId}"`);
        console.log(`NOTION_STUDENTS_DB_ID="${studentsId}"`);
        console.log(`NOTION_COURSES_DB_ID="${coursesId}"`);
        
        console.log('\n📌 다음 단계:');
        console.log('1. includes/config.php 파일의 기본값을 위 ID들로 교체');
        console.log('2. 웹사이트에서 문의 폼 테스트 진행');
        console.log('3. Notion에서 실시간 데이터 동기화 확인');
        
        return {
            inquiriesId,
            studentsId,
            coursesId
        };
        
    } catch (error) {
        console.error('❌ 데이터베이스 생성 중 오류 발생:', error);
        process.exit(1);
    }
}

// 스크립트 실행
createAllDatabases();