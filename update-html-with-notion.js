/**
 * HTML 파일에 노션 데이터 직접 임베드
 */

const fs = require('fs');
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

// 속성 추출 함수들
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

function extractSelect(property) {
    if (!property || property.type !== 'select') return '';
    return property.select ? property.select.name : '';
}

function extractDate(property) {
    if (!property || property.type !== 'date') return null;
    return property.date ? property.date.start : null;
}

function extractNumber(property) {
    if (!property || property.type !== 'number') return 0;
    return property.number || 0;
}

// 웹사이트 형식으로 데이터 변환
function convertToWebsiteFormat(course) {
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
    
    // 기존 HTML 형식에 맞춰 변환
    const month = startDate ? new Date(startDate).getMonth() + 1 : 2;
    const batchName = month === 2 ? "1분기" : month >= 5 && month <= 6 ? "3기" : month >= 8 && month <= 9 ? "4기" : "5기";
    
    // 5주 커리큘럼 생성
    const weeklySchedule = [];
    if (startDate) {
        const start = new Date(startDate);
        for (let week = 1; week <= 5; week++) {
            const weekDate = new Date(start);
            weekDate.setDate(start.getDate() + (week - 1) * 7);
            
            const weekData = {
                name: `${week}주차`,
                date: weekDate.toISOString().split('T')[0],
                tags: getWeeklyTags(week),
                status: status === '완료' ? "✅종료" : status === '진행중' ? "🔄진행중" : "모집중",
                batch: batchName
            };
            weeklySchedule.push(weekData);
        }
    }
    
    return weeklySchedule;
}

function getWeeklyTags(week) {
    const tags = {
        1: ["1주차: SCM(ERP) Overview", "과제: SCM 프로세스 도식화"],
        2: ["2주차: SCM 이슈 분석", "과제: 재고 분석"],
        3: ["3주차: SCP", "과제: MRP 계산"],
        4: ["4주차: SCM-재무 Integration", "과제: OTD 개선안"],
        5: ["5주차: 최종 발표", "최종 프로젝트 발표"]
    };
    return tags[week] || [`${week}주차`];
}

// HTML 파일 업데이트
async function updateHTMLWithNotionData() {
    console.log('🚀 HTML 파일에 노션 데이터 임베드 시작...\n');
    
    try {
        // 노션에서 데이터 가져오기
        console.log('📊 노션 데이터 가져오는 중...');
        const queryData = {
            page_size: 50,
            sorts: [{ property: '개강일', direction: 'ascending' }]
        };
        
        const response = await callNotionAPI(`/v1/databases/${COURSES_DB_ID}/query`, 'POST', queryData);
        console.log(`✅ ${response.results.length}개의 강의 발견`);
        
        // 웹사이트 형식으로 변환
        let allScheduleData = [];
        response.results.forEach(course => {
            const weeklyData = convertToWebsiteFormat(course);
            allScheduleData = allScheduleData.concat(weeklyData);
        });
        
        console.log(`📅 총 ${allScheduleData.length}개의 주차 데이터 생성`);
        
        // HTML 파일 읽기
        const htmlPath = 'C:/Users/ahfif/SuperClaude/Project_SCM_Site/scm-basic.html';
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // 기존 notionData 배열을 새 데이터로 교체
        const newNotionDataString = JSON.stringify(allScheduleData, null, 12);
        
        // 패턴 찾기: // 오류 시 기본 데이터 사용 부분
        const pattern = /(\/\/ 오류 시 기본 데이터 사용\s*notionData = \[)([\s\S]*?)(\s*\];)/;
        
        if (pattern.test(htmlContent)) {
            htmlContent = htmlContent.replace(pattern, `$1\n${newNotionDataString}\n                    $3`);
            console.log('✅ HTML 파일에서 기본 데이터 교체 완료');
        } else {
            console.log('❌ 교체할 패턴을 찾을 수 없습니다');
            return;
        }
        
        // 파일 저장
        fs.writeFileSync(htmlPath, htmlContent);
        console.log('💾 HTML 파일 저장 완료');
        
        // 결과 확인
        console.log('\n📋 업데이트된 데이터 미리보기:');
        allScheduleData.slice(0, 3).forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.name} - ${item.date} (${item.batch})`);
        });
        
        console.log('\n🎉 HTML 파일 업데이트 완료!');
        console.log('   이제 scm-basic.html을 브라우저에서 열어보세요.');
        console.log('   2월 3일 데이터가 달력에 표시될 것입니다!');
        
    } catch (error) {
        console.error('❌ 오류 발생:', error);
    }
}

// 실행
if (require.main === module) {
    updateHTMLWithNotionData();
}