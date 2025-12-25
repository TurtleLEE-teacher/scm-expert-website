/**
 * SCM 강의 수요 등록 처리 - Vercel Functions
 * 수요 기반 기수 개설을 위한 사전 신청 API
 */

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // CORS 프리플라이트 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    res.status(405).json({ error: '허용되지 않은 메소드' });
    return;
  }

  try {
    const input = req.body;

    // 필수 필드 검증
    if (!input.name || !input.name.trim()) {
      throw new Error('이름을 입력해주세요.');
    }

    if (!input.email || !input.email.trim()) {
      throw new Error('이메일을 입력해주세요.');
    }

    if (!input.phone || !input.phone.trim()) {
      throw new Error('연락처를 입력해주세요.');
    }

    if (!input.affiliation) {
      throw new Error('소속구분을 선택해주세요.');
    }

    if (!input.waiting_month) {
      throw new Error('희망 시작 월을 선택해주세요.');
    }

    if (!input.privacy_agreed) {
      throw new Error('개인정보 수집·이용 동의가 필요합니다.');
    }

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new Error('유효하지 않은 이메일 주소입니다.');
    }

    // 소속구분 검증
    const validAffiliations = ['직장인', '학생', '취업준비생', '기타'];
    if (!validAffiliations.includes(input.affiliation)) {
      throw new Error('유효하지 않은 소속구분입니다.');
    }

    // Notion API 키 확인
    const notionApiKey = process.env.NOTION_API_KEY;
    // 환경변수가 없으면 기본값 사용 (CRM DB ID는 민감정보가 아님)
    const crmDbId = process.env.NOTION_CRM_DB_ID || '13b7677074f041018d4c7573e1e958d4';

    if (!notionApiKey || notionApiKey === 'your_notion_api_key_here') {
      console.error('Missing NOTION_API_KEY');
      throw new Error('시스템 설정 오류 (API). 관리자에게 문의해주세요.');
    }

    // Notion에 저장할 데이터 준비 (Notion DB 필드 타입에 맞춤)
    const notionData = {
      parent: { database_id: crmDbId },
      properties: {
        // 제목 필드 (title 타입)
        '이름': {
          title: [{ text: { content: input.name.trim() } }]
        },
        // 이메일 필드 (email 타입)
        '이메일': {
          email: input.email.trim()
        },
        // 전화번호 필드 (phone_number 타입)
        '전화번호': {
          phone_number: input.phone.trim()
        },
        // 소속구분 필드 (select 타입)
        '소속구분': {
          select: { name: input.affiliation }
        },
        // 텍스트 필드들 (rich_text 타입)
        '회사명': {
          rich_text: [{ text: { content: input.company || '' } }]
        },
        '직책': {
          rich_text: [{ text: { content: input.position || '' } }]
        },
        '전공': {
          rich_text: [{ text: { content: input.major || '' } }]
        },
        '학년': {
          rich_text: [{ text: { content: input.grade || '' } }]
        },
        // 대기 월 필드 (select 타입)
        '대기 (월)': {
          select: { name: input.waiting_month }
        },
        '특이사항': {
          rich_text: [{ text: { content: input.notes || '' } }]
        },
        // 날짜 필드 (date 타입)
        '문의일': {
          date: { start: new Date().toISOString().split('T')[0] }
        },
        // 상태 필드 (select 타입)
        '상태': {
          select: { name: '대기중' }
        }
      }
    };

    // Notion API 호출
    const notionResponse = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionApiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(notionData)
    });

    if (!notionResponse.ok) {
      const errorData = await notionResponse.text();
      console.error('Notion API Error:', notionResponse.status, errorData);

      // 상세 에러 정보를 그대로 반환 (디버깅용)
      let errorMessage = '등록 실패';
      try {
        const errorJson = JSON.parse(errorData);
        // Notion 에러 메시지 전체를 표시
        errorMessage = errorJson.message || errorData;
      } catch (e) {
        errorMessage = errorData || `서버 오류 (${notionResponse.status})`;
      }

      throw new Error(errorMessage);
    }

    const result = await notionResponse.json();

    // 성공 응답
    const response = {
      success: true,
      message: '수강 대기 등록이 완료되었습니다.\n\n기수가 확정되면 안내드리겠습니다.',
      registration_id: result.id,
      waiting_month: input.waiting_month
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Demand registration error:', error);
    res.status(400).json({
      error: error.message
    });
  }
}
