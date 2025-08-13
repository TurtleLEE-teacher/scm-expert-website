/**
 * Notion API 연결 테스트 엔드포인트
 */

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: '허용되지 않은 메소드' });
    return;
  }

  try {
    const notionApiKey = process.env.NOTION_API_KEY;
    const studentsDbId = process.env.NOTION_STUDENTS_DB_ID;

    if (!notionApiKey) {
      throw new Error('NOTION_API_KEY가 설정되지 않았습니다.');
    }

    // 1. 사용자 정보 확인
    const userResponse = await fetch('https://api.notion.com/v1/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${notionApiKey}`,
        'Notion-Version': '2022-06-28'
      }
    });

    let userResult = {};
    if (userResponse.ok) {
      userResult = await userResponse.json();
    } else {
      const errorText = await userResponse.text();
      userResult = { error: `${userResponse.status} - ${errorText}` };
    }

    // 2. 데이터베이스 쿼리 테스트 (만약 사용자 정보가 성공적이라면)
    let dbResult = {};
    if (userResponse.ok && studentsDbId) {
      const dbResponse = await fetch(`https://api.notion.com/v1/databases/${studentsDbId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notionApiKey}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({ page_size: 1 })
      });

      if (dbResponse.ok) {
        dbResult = await dbResponse.json();
      } else {
        const errorText = await dbResponse.text();
        dbResult = { error: `${dbResponse.status} - ${errorText}` };
      }
    }

    const testResults = {
      timestamp: new Date().toISOString(),
      apiKeyTest: userResult,
      databaseTest: dbResult,
      configInfo: {
        hasApiKey: !!notionApiKey,
        hasStudentsDbId: !!studentsDbId,
        studentsDbId: studentsDbId
      }
    };

    res.status(200).json(testResults);

  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}