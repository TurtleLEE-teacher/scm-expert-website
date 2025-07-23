/**
 * Notion API 직접 테스트 스크립트
 * 모든 강의 데이터를 가져와서 분석
 */

const { readFileSync } = require('fs');

// 환경변수나 설정 파일에서 API 키 읽기
let NOTION_API_KEY, NOTION_DATABASE_ID;

try {
    // config.php 파일에서 값 읽기 시도
    const configContent = readFileSync('./includes/config.php', 'utf8');
    const apiKeyMatch = configContent.match(/'NOTION_API_KEY'\s*=>\s*'([^']+)'/);
    const dbIdMatch = configContent.match(/'NOTION_COURSES_DB_ID'\s*=>\s*'([^']+)'/);
    
    if (apiKeyMatch && dbIdMatch) {
        NOTION_API_KEY = apiKeyMatch[1];
        NOTION_DATABASE_ID = dbIdMatch[1];
    }
} catch (error) {
    console.error('❌ config.php 파일을 읽을 수 없습니다:', error.message);
    process.exit(1);
}

if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    console.error('❌ Notion API 키 또는 데이터베이스 ID가 설정되지 않았습니다.');
    process.exit(1);
}

async function testNotionAPI() {
    try {
        console.log('🔍 Notion API 테스트 시작...');
        console.log(`📋 데이터베이스 ID: ${NOTION_DATABASE_ID}`);
        
        const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                page_size: 50,
                sorts: [
                    { property: '개강일', direction: 'ascending' }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log(`✅ 응답 성공! 총 ${data.results.length}개 항목 발견`);
        console.log('\n📊 각 강의 분석:');
        
        data.results.forEach((course, index) => {
            const props = course.properties;
            const title = props.강의명?.title?.[0]?.text?.content || `강의 ${index + 1}`;
            const status = props.상태?.select?.name || null;
            const startDate = props.개강일?.date?.start || null;
            const archived = course.archived;
            const inTrash = course.in_trash;
            
            console.log(`\n${index + 1}. ${title}`);
            console.log(`   📅 개강일: ${startDate || '설정 안됨'}`);
            console.log(`   📋 상태: ${status || 'null (빈 값)'}`);
            console.log(`   🗃️ Archived: ${archived}`);
            console.log(`   🗑️ In Trash: ${inTrash}`);
            console.log(`   💾 ID: ${course.id}`);
        });
        
        // 필터링 결과 시뮬레이션
        console.log('\n🔍 필터링 결과 시뮬레이션:');
        
        const filteredResults = data.results.filter(course => !course.archived && !course.in_trash);
        console.log(`📈 Archived/Trash 제외 후: ${filteredResults.length}개`);
        
        const withDateResults = filteredResults.filter(course => course.properties.개강일?.date?.start);
        console.log(`📅 개강일 있는 강의만: ${withDateResults.length}개`);
        
        return data;
        
    } catch (error) {
        console.error('❌ API 호출 실패:', error.message);
        process.exit(1);
    }
}

// 스크립트 실행
testNotionAPI();