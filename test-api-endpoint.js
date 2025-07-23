/**
 * API 엔드포인트 직접 테스트
 */

const https = require('https');

const NOTION_API_KEY = 'secret_KaJcAIvtrwcPsFxvLXVNzzYDZ34zJb3cRLVb55K4U2f';
const COURSES_DB_ID = '23787a19-32c4-81bb-a2c1-d5f33256cc37';
const NOTION_API_VERSION = '2022-06-28';

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

// 텍스트 속성 추출
function extractText(property) {
    if (!property) return '';
    
    if (property.type === 'title' && property.title && property.title.length > 0) {
        return property.title[0].text.content || '';
    }
    
    if (property.type === 'rich_text' && property.rich_text && property.rich_text.length > 0) {
        return property.rich_text[0].text.content || '';
    }
    
    return '';
}

// 선택 속성 추출
function extractSelect(property) {
    if (!property || property.type !== 'select') return '';
    return property.select ? property.select.name : '';
}

// 날짜 속성 추출
function extractDate(property) {
    if (!property || property.type !== 'date') return null;
    return property.date ? property.date.start : null;
}

// 숫자 속성 추출
function extractNumber(property) {
    if (!property || property.type !== 'number') return 0;
    return property.number || 0;
}

// 메인 테스트 함수
async function testAPI() {
    console.log('🚀 API 엔드포인트 테스트 시작...\n');
    
    try {
        // 강의 데이터베이스 조회
        const queryData = {
            page_size: 50,
            sorts: [
                {
                    property: '개강일',
                    direction: 'ascending'
                }
            ]
        };
        
        console.log('📊 노션 강의 데이터베이스 조회 중...');
        console.log('🔗 Database ID:', COURSES_DB_ID);
        const response = await callNotionAPI(`/v1/databases/${COURSES_DB_ID}/query`, 'POST', queryData);
        
        console.log(`✅ 총 ${response.results.length}개의 강의 발견\n`);
        
        // 각 강의 정보 출력
        response.results.forEach((course, index) => {
            const properties = course.properties;
            
            const title = extractText(properties['강의명']);
            const category = extractSelect(properties['카테고리']);
            const status = extractSelect(properties['상태']);
            const startDate = extractDate(properties['개강일']);
            const endDate = extractDate(properties['종료일']);
            const maxStudents = extractNumber(properties['최대인원']);
            const currentStudents = extractNumber(properties['현재등록인원']);
            const price = extractNumber(properties['가격']);
            const discountPrice = extractNumber(properties['할인가격']);
            
            console.log(`📚 강의 ${index + 1}:`);
            console.log(`   제목: ${title}`);
            console.log(`   카테고리: ${category}`);
            console.log(`   상태: ${status}`);
            console.log(`   개강일: ${startDate}`); // 🎯 이것이 2월 3일인지 확인!
            console.log(`   종료일: ${endDate}`);
            console.log(`   정원: ${currentStudents}/${maxStudents}명`);
            console.log(`   가격: ${price}원 ${discountPrice ? `(할인가: ${discountPrice}원)` : ''}`);
            console.log(`   생성일: ${new Date(course.created_time).toLocaleString('ko-KR')}`);
            console.log('');
        });
        
        // 웹사이트 형식으로 데이터 변환 테스트
        console.log('🔄 웹사이트 형식으로 데이터 변환 중...\n');
        
        const scheduleData = response.results.map(course => {
            const properties = course.properties;
            
            const title = extractText(properties['강의명']);
            const status = extractSelect(properties['상태']);
            const startDate = extractDate(properties['개강일']);
            const endDate = extractDate(properties['종료일']);
            const currentStudents = extractNumber(properties['현재등록인원']);
            const maxStudents = extractNumber(properties['최대인원']);
            
            return {
                id: course.id,
                title: title || 'SCM 기초 완성 강의',
                status: status || '모집중',
                startDate: startDate,
                endDate: endDate,
                currentStudents: currentStudents || 0,
                maxStudents: maxStudents || 20,
                isActive: ['모집중', '진행중'].includes(status)
            };
        });
        
        console.log('📅 웹사이트 달력 형식 데이터:');
        scheduleData.forEach((course, index) => {
            console.log(`   ${index + 1}. ${course.title}`);
            console.log(`      📅 개강일: ${course.startDate}`); // 🎯 여기서 2월 3일 확인!
            console.log(`      📅 종료일: ${course.endDate}`);
            console.log(`      📊 상태: ${course.status}`);
            console.log(`      👥 등록: ${course.currentStudents}/${course.maxStudents}명`);
            console.log('');
        });
        
        // 2월 3일 데이터가 있는지 특별히 확인
        const feb3Course = scheduleData.find(course => 
            course.startDate && course.startDate.includes('2025-02-03')
        );
        
        if (feb3Course) {
            console.log('🎉 2월 3일 개강 강의 발견!');
            console.log('   제목:', feb3Course.title);
            console.log('   개강일:', feb3Course.startDate);
            console.log('   상태:', feb3Course.status);
        } else {
            console.log('❌ 2월 3일 개강 강의를 찾을 수 없습니다');
            console.log('💡 발견된 개강일들:');
            scheduleData.forEach(course => {
                if (course.startDate) {
                    console.log(`     - ${course.startDate}`);
                }
            });
        }
        
    } catch (error) {
        console.error('❌ API 테스트 실패:', error);
    }
}

// 테스트 실행
if (require.main === module) {
    testAPI();
}