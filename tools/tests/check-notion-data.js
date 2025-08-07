/**
 * Notion 데이터베이스 내용 확인 스크립트
 */

const https = require('https');

const NOTION_API_KEY = process.env.NOTION_API_KEY || 'your_notion_api_key_here';
const NOTION_API_VERSION = '2022-06-28';
const INQUIRIES_DB_ID = '23787a19-32c4-81c5-9df9-eb0bed62f1a8';

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

// 데이터베이스 내용 조회
async function checkInquiriesDatabase() {
    console.log('📋 문의사항 데이터베이스 내용 확인 중...\n');
    
    try {
        const result = await callNotionAPI(`/v1/databases/${INQUIRIES_DB_ID}/query`, 'POST', {
            page_size: 10
        });
        
        console.log(`✅ 데이터베이스 조회 성공!`);
        console.log(`📊 총 ${result.results.length}개의 문의사항이 있습니다.\n`);
        
        if (result.results.length > 0) {
            console.log('📝 최근 문의사항들:');
            console.log('='.repeat(60));
            
            result.results.forEach((item, index) => {
                const properties = item.properties;
                const name = properties['이름']?.title?.[0]?.text?.content || '(이름 없음)';
                const email = properties['이메일']?.email || '(이메일 없음)';
                const inquiryType = properties['문의유형']?.select?.name || '(유형 없음)';
                const status = properties['상태']?.select?.name || '새 문의';
                const createdTime = new Date(item.created_time).toLocaleString('ko-KR');
                const message = properties['문의내용']?.rich_text?.[0]?.text?.content || '(내용 없음)';
                
                console.log(`\n${index + 1}. 📋 문의사항 ID: ${item.id}`);
                console.log(`   👤 이름: ${name}`);
                console.log(`   📧 이메일: ${email}`);
                console.log(`   📋 문의유형: ${inquiryType}`);
                console.log(`   🔄 상태: ${status}`);
                console.log(`   ⏰ 접수일: ${createdTime}`);
                console.log(`   💬 내용: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);
            });
        } else {
            console.log('❌ 데이터베이스가 비어있습니다.');
            console.log('💡 웹사이트 문의 폼이 Notion과 제대로 연결되지 않았을 수 있습니다.');
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('🔗 데이터베이스 직접 확인: https://www.notion.so/23787a1932c481c59df9eb0bed62f1a8');
        
        return result;
        
    } catch (error) {
        console.error('❌ 데이터베이스 조회 실패:', error);
        throw error;
    }
}

// 테스트 데이터 추가
async function addTestInquiry() {
    console.log('\n🧪 테스트 문의사항 추가 중...');
    
    const testData = {
        parent: { database_id: INQUIRIES_DB_ID },
        properties: {
            '이름': {
                title: [{ text: { content: 'Playwright 테스트 사용자' } }]
            },
            '이메일': {
                email: 'playwright.test@scm-expert.com'
            },
            '회사명': {
                rich_text: [{ text: { content: 'Playwright 테스트 회사' } }]
            },
            '문의유형': {
                select: { name: 'SCM 기초 강의' }
            },
            '문의내용': {
                rich_text: [{ 
                    text: { 
                        content: 'Playwright 자동화 테스트를 통해 추가된 문의사항입니다. Notion API 연동이 정상적으로 작동하는지 확인하기 위한 테스트 데이터입니다.' 
                    } 
                }]
            },
            '상태': {
                select: { name: '새 문의' }
            },
            '우선순위': {
                select: { name: '보통' }
            },
            'IP주소': {
                rich_text: [{ text: { content: '127.0.0.1' } }]
            }
        }
    };
    
    try {
        const result = await callNotionAPI('/v1/pages', 'POST', testData);
        console.log('✅ 테스트 문의사항 추가 성공!');
        console.log(`📋 생성된 페이지 ID: ${result.id}`);
        return result;
    } catch (error) {
        console.error('❌ 테스트 문의사항 추가 실패:', error);
        throw error;
    }
}

// 메인 실행
async function main() {
    try {
        console.log('🚀 Notion 데이터베이스 연동 상태 확인을 시작합니다...\n');
        
        // 1. 현재 데이터베이스 내용 확인
        await checkInquiriesDatabase();
        
        // 2. 테스트 데이터 추가
        await addTestInquiry();
        
        // 3. 다시 확인
        console.log('\n📋 테스트 데이터 추가 후 재확인...');
        await checkInquiriesDatabase();
        
    } catch (error) {
        console.error('❌ 오류 발생:', error);
        process.exit(1);
    }
}

// 스크립트 실행
if (require.main === module) {
    main();
}