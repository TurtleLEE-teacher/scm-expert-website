/**
 * 로컬에서 Notion 데이터를 가져와 schedule.json 생성
 * GitHub Actions와 동일한 로직 사용
 */

const fs = require('fs');
const { readFileSync } = require('fs');

// 설정 파일에서 API 키 읽기
let NOTION_API_KEY;
const NOTION_COHORT_DB_ID = '23787a1932c481bba2c1d5f33256cc37';
const NOTION_LECTURE_DB_ID = '6f892938f4884cd0ba09b858e500e025';
const NOTION_REVIEWS_DB_ID = '243951127368492d906a3d36861aacd2';

try {
    const configContent = readFileSync('./includes/config.php', 'utf8');
    const apiKeyMatch = configContent.match(/'NOTION_API_KEY'\s*=>\s*'([^']+)'/);

    if (apiKeyMatch) {
        NOTION_API_KEY = apiKeyMatch[1];
    }
} catch (error) {
    console.error('❌ config.php 파일을 읽을 수 없습니다:', error.message);
    process.exit(1);
}

if (!NOTION_API_KEY) {
    console.error('❌ Notion API 키가 설정되지 않았습니다.');
    process.exit(1);
}

async function fetchNotionDB(dbId, label, pageSize = 50) {
    console.log(`🔍 ${label} 데이터 가져오는 중...`);
    const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page_size: pageSize })
    });
    if (!response.ok) throw new Error(`${label} HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    console.log(`✅ ${label}: ${data.results.length}개 레코드`);
    return data;
}

async function generateScheduleJSON() {
    try {
        // 1. Cohort Management 가져오기
        const cohortData = await fetchNotionDB(NOTION_COHORT_DB_ID, 'Cohort Management');

        // 2. Lecture Management 가져오기 + 스키마 발견
        const lectureData = await fetchNotionDB(NOTION_LECTURE_DB_ID, 'Lecture Management', 100);

        // Lecture Management 스키마 출력
        if (lectureData.results.length > 0) {
            console.log('\n📋 Lecture Management 스키마:');
            const props = lectureData.results[0].properties;
            Object.keys(props).forEach(key => {
                console.log(`  - ${key} (${props[key].type})`);
            });
            lectureData.results.forEach((record, idx) => {
                const p = record.properties;
                console.log(`\n📄 Lecture #${idx + 1}:`);
                Object.keys(p).forEach(key => {
                    const prop = p[key];
                    let value = '(empty)';
                    if (prop.type === 'title' && prop.title?.[0]) value = prop.title[0].text?.content || '';
                    else if (prop.type === 'rich_text' && prop.rich_text?.[0]) value = prop.rich_text[0].text?.content || '';
                    else if (prop.type === 'number' && prop.number !== null) value = prop.number;
                    else if (prop.type === 'select' && prop.select) value = prop.select.name;
                    else if (prop.type === 'date' && prop.date) value = prop.date.start;
                    else if (prop.type === 'relation' && prop.relation?.length > 0) value = prop.relation.map(r => r.id).join(', ');
                    else if (prop.type === 'rollup' && prop.rollup) value = JSON.stringify(prop.rollup);
                    else if (prop.type === 'checkbox') value = prop.checkbox;
                    console.log(`  ${key}: ${value}`);
                });
            });
        }

        // 3. Cohort 데이터 변환 (기존 로직 유지)
        const calendarData = [];

        cohortData.results.forEach((course, index) => {
            const props = course.properties;
            const title = props.기수명?.title?.[0]?.text?.content || `강의 ${index + 1}`;
            const category = props.강의종류?.select?.name || 'SCM 기초';
            const status = props.상태?.select?.name || '준비중';
            const description = props.비고?.rich_text?.[0]?.text?.content || '';
            const price = props.수강료?.number || 0;
            const maxStudents = props.최대인원?.number || 20;
            const currentStudents = props.현재등록인원?.number || 0;

            let batch = props.기수?.number;
            if (!batch) {
                const batchMatch = title.match(/(\d+)기/);
                batch = batchMatch ? parseInt(batchMatch[1]) : (index + 1);
            }

            if (course.archived || course.in_trash) return;

            const courseInfo = { id: course.id, title, category, status, description, price, maxStudents, currentStudents, batch };

            const lecture1 = props['강의(1)']?.date?.start;
            const lecture2 = props['강의(2)']?.date?.start;
            const lecture3 = props['강의(3)']?.date?.start;
            const assignment1 = props['과제세션(1)']?.date?.start;
            const assignment2 = props['과제세션(2)']?.date?.start;

            if (lecture1) calendarData.push({ name: title, date: lecture1, type: 'lecture', week: 1, label: '1주차 강의', hasAssignment: true, status, batch, maxStudents, currentStudents, notionData: courseInfo });
            if (assignment1) calendarData.push({ name: title, date: assignment1, type: 'assignment', week: 2, label: '2주차 피드백', hasAssignment: true, status, batch, maxStudents, currentStudents, notionData: courseInfo });
            if (lecture2) calendarData.push({ name: title, date: lecture2, type: 'lecture', week: 3, label: '3주차 강의', hasAssignment: true, status, batch, maxStudents, currentStudents, notionData: courseInfo });
            if (assignment2) calendarData.push({ name: title, date: assignment2, type: 'assignment', week: 4, label: '4주차 피드백', hasAssignment: true, status, batch, maxStudents, currentStudents, notionData: courseInfo });
            if (lecture3) calendarData.push({ name: title, date: lecture3, type: 'lecture', week: 5, label: '5주차 최종발표', hasAssignment: false, status, batch, maxStudents, currentStudents, notionData: courseInfo });

            console.log(`📚 ${index + 1}. ${title} (${batch}기, ${status})`);
        });

        // 4. TODO: Lecture Management 데이터 병합 (스키마 확인 후 구현)
        console.log('\n⚠️  Lecture Management 스키마를 위에서 확인하세요.');
        console.log('⚠️  필드 매핑 확인 후 변환 로직을 업데이트하세요.\n');

        calendarData.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (!fs.existsSync('data')) fs.mkdirSync('data');

        const output = {
            success: true,
            data: calendarData,
            lastUpdated: new Date().toISOString(),
            totalSessions: calendarData.length
        };

        fs.writeFileSync('data/schedule.json', JSON.stringify(output, null, 2));
        console.log(`✅ ${calendarData.length}개 세션 데이터가 data/schedule.json에 저장되었습니다.`);

        return output;

    } catch (error) {
        console.error('❌ 스케줄 생성 실패:', error.message);
        process.exit(1);
    }
}

// 후기 데이터 생성
async function generateReviewsJSON() {
    try {
        console.log('\n🔍 Notion 후기 데이터 가져오는 중...');

        const response = await fetch(`https://api.notion.com/v1/databases/${NOTION_REVIEWS_DB_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_API_KEY}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                page_size: 100
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const rawData = await response.json();
        console.log(`✅ ${rawData.results.length}개 후기 데이터 받음`);

        const reviews = [];

        rawData.results.forEach((review, index) => {
            if (review.archived || review.in_trash) return;

            const props = review.properties;

            // 첫 번째 항목에서 속성 목록 출력
            if (index === 0) {
                console.log('\n📋 후기 속성 목록:');
                Object.keys(props).forEach(key => {
                    console.log(`  - ${key} (${props[key].type})`);
                });
            }

            // 후기 내용 추출
            let content = '';
            const contentFields = ['후기내용', '후기', '내용', 'content', 'Content', 'Review'];
            for (const field of contentFields) {
                if (props[field]?.rich_text?.[0]?.text?.content) {
                    content = props[field].rich_text[0].text.content;
                    break;
                }
                if (props[field]?.title?.[0]?.text?.content) {
                    content = props[field].title[0].text.content;
                    break;
                }
            }

            // 별점 추출
            let rating = 5;
            const ratingFields = ['별점', 'rating', 'Rating', '평점'];
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

            // 작성자 추출 (익명작성자 필드 우선 사용)
            let author = '';
            const authorFields = ['익명작성자', '익명 작성자', '작성자', '이름', 'author', 'Author', 'Name'];
            for (const field of authorFields) {
                if (props[field]?.rich_text?.[0]?.text?.content) {
                    author = props[field].rich_text[0].text.content;
                    break;
                }
                if (props[field]?.title?.[0]?.text?.content) {
                    author = props[field].title[0].text.content;
                    break;
                }
            }

            // 날짜 추출
            let date = '';
            const dateFields = ['날짜', '작성일', 'date', 'Date', '등록일'];
            for (const field of dateFields) {
                if (props[field]?.date?.start) {
                    const d = new Date(props[field].date.start);
                    date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
                    break;
                }
            }

            // 생성일 fallback
            if (!date && review.created_time) {
                const d = new Date(review.created_time);
                date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
            }

            if (content) {
                reviews.push({
                    id: review.id,
                    content: content,
                    rating: rating,
                    author: author,
                    date: date
                });
                console.log(`✓ 후기: ${author} (${rating}점) - ${content.substring(0, 30)}...`);
            }
        });

        // 날짜 역순 정렬 (최신순)
        reviews.sort((a, b) => {
            if (!a.date) return 1;
            if (!b.date) return -1;
            return b.date.localeCompare(a.date);
        });

        const output = {
            success: true,
            data: reviews,
            lastUpdated: new Date().toISOString(),
            totalReviews: reviews.length
        };

        fs.writeFileSync('data/reviews.json', JSON.stringify(output, null, 2));
        console.log(`✅ ${reviews.length}개 후기 데이터가 data/reviews.json에 저장되었습니다.`);

        return output;

    } catch (error) {
        console.error('❌ 후기 생성 실패:', error.message);
        // 후기 생성 실패해도 스케줄은 유지
    }
}

// 스크립트 실행
async function main() {
    await generateScheduleJSON();
    await generateReviewsJSON();
}

main();