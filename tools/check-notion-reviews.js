/**
 * Notion 후기 데이터베이스 스키마 확인 스크립트
 *
 * 사용법:
 * NOTION_API_KEY=your_key node tools/check-notion-reviews.js
 */

const REVIEWS_DB_ID = '243951127368492d906a3d36861aacd2';

async function checkDatabase() {
    const apiKey = process.env.NOTION_API_KEY;

    if (!apiKey) {
        console.error('❌ NOTION_API_KEY 환경변수가 필요합니다.');
        console.log('사용법: NOTION_API_KEY=your_key node tools/check-notion-reviews.js');
        process.exit(1);
    }

    console.log('🔍 Notion 후기 데이터베이스 조회 중...\n');

    try {
        // 데이터베이스 스키마 조회
        const schemaRes = await fetch(`https://api.notion.com/v1/databases/${REVIEWS_DB_ID}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Notion-Version': '2022-06-28'
            }
        });

        if (!schemaRes.ok) {
            const error = await schemaRes.json();
            console.error('❌ 데이터베이스 조회 실패:', error.message);
            process.exit(1);
        }

        const schema = await schemaRes.json();
        console.log('📊 데이터베이스 이름:', schema.title?.[0]?.text?.content || 'N/A');
        console.log('\n📋 속성 목록:');
        console.log('─'.repeat(50));

        Object.entries(schema.properties).forEach(([name, prop]) => {
            console.log(`  ${name} (${prop.type})`);
        });

        // 데이터 조회
        console.log('\n\n🔍 데이터 샘플 조회 중...\n');

        const dataRes = await fetch(`https://api.notion.com/v1/databases/${REVIEWS_DB_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ page_size: 3 })
        });

        if (!dataRes.ok) {
            const error = await dataRes.json();
            console.error('❌ 데이터 조회 실패:', error.message);
            process.exit(1);
        }

        const data = await dataRes.json();
        console.log(`📊 총 ${data.results?.length || 0}개 항목 샘플\n`);

        data.results?.forEach((item, idx) => {
            console.log(`─ 항목 ${idx + 1} ─`);
            Object.entries(item.properties).forEach(([name, prop]) => {
                let value = '(empty)';

                if (prop.type === 'title' && prop.title?.[0]) {
                    value = prop.title[0].text?.content || prop.title[0].plain_text;
                } else if (prop.type === 'rich_text' && prop.rich_text?.[0]) {
                    value = prop.rich_text[0].text?.content || prop.rich_text[0].plain_text;
                    if (value && value.length > 50) value = value.substring(0, 50) + '...';
                } else if (prop.type === 'number') {
                    value = prop.number;
                } else if (prop.type === 'select' && prop.select) {
                    value = prop.select.name;
                } else if (prop.type === 'date' && prop.date) {
                    value = prop.date.start;
                }

                console.log(`  ${name}: ${value}`);
            });
            console.log('');
        });

    } catch (e) {
        console.error('❌ 오류:', e.message);
        process.exit(1);
    }
}

checkDatabase();
