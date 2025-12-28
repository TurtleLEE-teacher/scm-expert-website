/**
 * Notion 후기 데이터베이스 테스트
 * GitHub Actions 실행 전 Notion DB 상태 확인
 */

const REVIEWS_DB_ID = '243951127368492d906a3d36861aacd2';
const NOTION_API_KEY = process.env.NOTION_API_KEY;

if (!NOTION_API_KEY) {
    console.log('⚠️  NOTION_API_KEY 환경변수가 설정되지 않았습니다.');
    console.log('');
    console.log('GitHub Actions에서 자동으로 실행됩니다.');
    console.log('수동 확인이 필요하면:');
    console.log('  NOTION_API_KEY=your_key node test-notion-reviews.js');
    console.log('');
    process.exit(0);
}

async function testNotionReviews() {
    console.log('🔍 Notion 후기 데이터베이스 확인 중...\n');

    try {
        const response = await fetch(`https://api.notion.com/v1/databases/${REVIEWS_DB_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ page_size: 100 })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ API 오류:', error.message);
            process.exit(1);
        }

        const data = await response.json();
        console.log(`📊 총 ${data.results.length}개 후기 발견\n`);

        // 카테고리 및 평점 분석
        const categories = {};
        const ratings = {};
        const samples = { consulting: [], bootcamp: [], lowRating: [] };

        data.results.forEach((review, index) => {
            if (review.archived || review.in_trash) return;

            const props = review.properties;

            // 첫 3개 후기의 모든 속성 출력
            if (index < 3) {
                console.log(`\n📋 후기 #${index + 1} 샘플:`);
                Object.keys(props).forEach(key => {
                    const prop = props[key];
                    let value = '(empty)';
                    if (prop.type === 'title' && prop.title?.[0]) {
                        value = prop.title[0].plain_text;
                    } else if (prop.type === 'rich_text' && prop.rich_text?.[0]) {
                        value = prop.rich_text[0].plain_text;
                    } else if (prop.type === 'number') {
                        value = prop.number;
                    } else if (prop.type === 'select' && prop.select) {
                        value = prop.select.name;
                    }
                    console.log(`  - ${key} (${prop.type}): ${value}`);
                });
            }

            // 카테고리 추출 (workflow와 동일한 로직)
            let category = 'bootcamp';
            const categoryFields = ['서비스 종류', '서비스종류', '프로그램', '카테고리', 'category', 'Category', '유형', '종류', '타입', 'Type', '서비스', 'Service'];
            for (const field of categoryFields) {
                if (props[field]?.select?.name) {
                    const catName = props[field].select.name.toLowerCase();
                    if (catName.includes('컨설팅') || catName.includes('consulting') || catName.includes('1:1') || catName.includes('1대1') || catName.includes('커리어') || catName.includes('career')) {
                        category = 'consulting';
                    } else if (catName.includes('부트') || catName.includes('bootcamp') || catName.includes('boot') || catName.includes('scm') || catName.includes('직무')) {
                        category = 'bootcamp';
                    }
                    break;
                }
            }

            // 별점 추출 (workflow와 동일한 로직)
            let rating = 5;
            const ratingFields = ['별점', 'rating', 'Rating', '평점', '점수', 'Score', 'Stars', '만족도'];
            for (const field of ratingFields) {
                if (props[field]?.number) {
                    rating = props[field].number;
                    break;
                }
                if (props[field]?.select?.name) {
                    rating = parseInt(props[field].select.name) || 5;
                    break;
                }
            }

            // 통계 수집
            categories[category] = (categories[category] || 0) + 1;
            ratings[rating] = (ratings[rating] || 0) + 1;

            // 샘플 수집
            if (category === 'consulting' && samples.consulting.length < 3) {
                samples.consulting.push({ index: index + 1, rating });
            }
            if (rating < 5 && samples.lowRating.length < 3) {
                samples.lowRating.push({ index: index + 1, category, rating });
            }
        });

        // 결과 출력
        console.log('\n\n📈 분석 결과:\n');
        console.log('카테고리 분포:');
        Object.entries(categories).forEach(([cat, count]) => {
            console.log(`  - ${cat}: ${count}개`);
        });

        console.log('\n평점 분포:');
        Object.entries(ratings).sort((a, b) => a[0] - b[0]).forEach(([rating, count]) => {
            console.log(`  - ${rating}점: ${count}개`);
        });

        console.log('\n\n🎯 핵심 확인 사항:\n');

        if (categories.consulting > 0) {
            console.log(`✅ 1대1컨설팅 후기 ${categories.consulting}개 발견!`);
            console.log(`   샘플: ${samples.consulting.map(s => `#${s.index} (${s.rating}점)`).join(', ')}`);
        } else {
            console.log('❌ 1대1컨설팅 후기 없음');
            console.log('   → Notion DB의 "서비스 종류" 또는 "카테고리" 필드 확인 필요');
        }

        const lowRatings = Object.entries(ratings).filter(([r]) => parseInt(r) < 5);
        if (lowRatings.length > 0) {
            const totalLow = lowRatings.reduce((sum, [, count]) => sum + count, 0);
            console.log(`\n✅ 4점 이하 후기 ${totalLow}개 발견!`);
            console.log(`   샘플: ${samples.lowRating.map(s => `#${s.index} (${s.rating}점, ${s.category})`).join(', ')}`);
        } else {
            console.log('\n❌ 4점 이하 후기 없음');
            console.log('   → Notion DB의 "별점" 또는 "평점" 필드 확인 필요');
        }

        console.log('\n\n💡 다음 단계:');
        if (categories.consulting > 0 || lowRatings.length > 0) {
            console.log('1. GitHub Actions "Update Notion Data" 워크플로우 실행');
            console.log('2. 로그에서 데이터 추출 확인');
            console.log('3. data/reviews.json 자동 업데이트 확인');
        } else {
            console.log('1. Notion DB에서 필드명 확인');
            console.log('2. "서비스 종류" 또는 "별점" 필드 추가/수정');
            console.log('3. 테스트 데이터 입력 후 다시 확인');
        }

    } catch (error) {
        console.error('❌ 오류:', error.message);
        process.exit(1);
    }
}

testNotionReviews();
