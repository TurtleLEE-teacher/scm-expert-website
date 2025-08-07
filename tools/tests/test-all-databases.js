/**
 * 모든 Notion 데이터베이스 테스트 스크립트
 */

const https = require('https');

const NOTION_API_KEY = process.env.NOTION_API_KEY || 'your_notion_api_key_here';
const NOTION_API_VERSION = '2022-06-28';

const DATABASE_IDS = {
    inquiries: '23787a19-32c4-81c5-9df9-eb0bed62f1a8',
    students: '23787a19-32c4-8129-9a6e-d7ed01c9424f',
    courses: '23787a19-32c4-81bb-a2c1-d5f33256cc37'
};

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

// 수강생 데이터 추가
async function addTestStudent() {
    console.log('\n👥 테스트 수강생 데이터 추가 중...');
    
    const studentData = {
        parent: { database_id: DATABASE_IDS.students },
        properties: {
            '이름': {
                title: [{ text: { content: '김민수' } }]
            },
            '이메일': {
                email: 'minsu.kim@test-company.com'
            },
            '전화번호': {
                phone_number: '010-9876-5432'
            },
            '회사명': {
                rich_text: [{ text: { content: '테스트 글로벌 제조업체' } }]
            },
            '직책': {
                rich_text: [{ text: { content: '구매팀 과장' } }]
            },
            '등록일': {
                date: { start: '2025-01-15' }
            },
            '결제상태': {
                select: { name: '결제완료' }
            },
            '결제금액': {
                number: 450000
            },
            '수강강의': {
                rich_text: [{ text: { content: 'SCM 기초 완성 강의' } }]
            },
            '진도율': {
                number: 75
            },
            '수료여부': {
                checkbox: false
            },
            '만족도': {
                select: { name: '매우만족' }
            },
            '특이사항': {
                rich_text: [{ text: { content: '실무 경험이 풍부하여 강의 내용을 빠르게 이해함. 추가 고급 과정 추천 예정.' } }]
            },
            '최종접속일': {
                date: { start: '2025-01-20' }
            }
        }
    };
    
    try {
        const result = await callNotionAPI('/v1/pages', 'POST', studentData);
        console.log('✅ 테스트 수강생 추가 성공!');
        console.log(`👤 생성된 학생 ID: ${result.id}`);
        return result;
    } catch (error) {
        console.error('❌ 테스트 수강생 추가 실패:', error);
        throw error;
    }
}

// 강의 데이터 추가
async function addTestCourse() {
    console.log('\n📚 테스트 강의 데이터 추가 중...');
    
    const courseData = {
        parent: { database_id: DATABASE_IDS.courses },
        properties: {
            '강의명': {
                title: [{ text: { content: 'SCM 기초 완성 강의 - 2025년 1분기' } }]
            },
            '카테고리': {
                select: { name: 'SCM 기초' }
            },
            '난이도': {
                select: { name: '초급' }
            },
            '가격': {
                number: 450000
            },
            '할인가격': {
                number: 350000
            },
            '강의시간': {
                rich_text: [{ text: { content: '총 20시간 (주 2회, 5주 과정)' } }]
            },
            '강의설명': {
                rich_text: [{ text: { content: '글로벌 컨설팅펌 현직 컨설턴트가 직접 가르치는 SCM 실무 기초 강의입니다. 실제 프로젝트 경험을 바탕으로 한 사례 중심 교육으로 진행됩니다.' } }]
            },
            '상태': {
                select: { name: '모집중' }
            },
            '개강일': {
                date: { start: '2025-02-03' }
            },
            '종료일': {
                date: { start: '2025-03-03' }
            },
            '최대인원': {
                number: 20
            },
            '현재등록인원': {
                number: 12
            },
            '강의자료URL': {
                url: 'https://scm-expert.com/materials/basic-course'
            },
            'Zoom링크': {
                url: 'https://zoom.us/j/123456789'
            },
            '커리큘럼': {
                rich_text: [{ text: { content: '1주차: SCM 개념과 중요성\n2주차: 공급망 설계 및 최적화\n3주차: 조달 및 구매 관리\n4주차: 재고 관리 및 물류\n5주차: 성과 측정 및 개선' } }]
            },
            '선수조건': {
                rich_text: [{ text: { content: '특별한 선수조건 없음. 제조업, 유통업 종사자 우대' } }]
            },
            '수료혜택': {
                rich_text: [{ text: { content: 'SCM 기초 수료증 발급, 개별 커리어 컨설팅 1회 제공' } }]
            }
        }
    };
    
    try {
        const result = await callNotionAPI('/v1/pages', 'POST', courseData);
        console.log('✅ 테스트 강의 추가 성공!');
        console.log(`📚 생성된 강의 ID: ${result.id}`);
        return result;
    } catch (error) {
        console.error('❌ 테스트 강의 추가 실패:', error);
        throw error;
    }
}

// 모든 데이터베이스 내용 확인
async function checkAllDatabases() {
    console.log('\n📊 모든 데이터베이스 내용 확인 중...\n');
    
    const databases = [
        { name: '문의사항 관리', id: DATABASE_IDS.inquiries, icon: '📋' },
        { name: '수강생 관리', id: DATABASE_IDS.students, icon: '👥' },
        { name: '강의 관리', id: DATABASE_IDS.courses, icon: '📚' }
    ];
    
    for (const db of databases) {
        try {
            console.log(`${db.icon} ${db.name} 확인 중...`);
            const result = await callNotionAPI(`/v1/databases/${db.id}/query`, 'POST', {
                page_size: 5
            });
            
            console.log(`   ✅ 총 ${result.results.length}개의 레코드`);
            
            if (result.results.length > 0) {
                result.results.forEach((item, index) => {
                    const title = Object.values(item.properties).find(prop => prop.type === 'title');
                    const titleText = title?.title?.[0]?.text?.content || '(제목 없음)';
                    const createdTime = new Date(item.created_time).toLocaleString('ko-KR');
                    console.log(`   ${index + 1}. ${titleText} (${createdTime})`);
                });
            }
            console.log(`   🔗 https://www.notion.so/${db.id.replace(/-/g, '')}\n`);
            
        } catch (error) {
            console.error(`   ❌ ${db.name} 조회 실패:`, error.error?.message || error.message);
        }
    }
}

// 메인 실행
async function main() {
    try {
        console.log('🚀 모든 Notion 데이터베이스 테스트를 시작합니다...\n');
        
        // 1. 현재 상태 확인
        await checkAllDatabases();
        
        // 2. 테스트 데이터 추가
        await addTestStudent();
        await addTestCourse();
        
        // 3. 최종 확인
        console.log('\n' + '='.repeat(70));
        console.log('🎉 테스트 데이터 추가 완료! 최종 확인 중...');
        console.log('='.repeat(70));
        await checkAllDatabases();
        
        console.log('✅ 모든 데이터베이스 테스트가 성공적으로 완료되었습니다!');
        console.log('\n📌 다음 단계:');
        console.log('1. Notion에서 각 데이터베이스를 직접 확인해보세요');
        console.log('2. 웹사이트 문의 폼 연동 상태를 점검해보세요');
        console.log('3. 실제 운영 환경에서의 데이터 흐름을 모니터링하세요');
        
    } catch (error) {
        console.error('❌ 오류 발생:', error);
        process.exit(1);
    }
}

// 스크립트 실행
if (require.main === module) {
    main();
}