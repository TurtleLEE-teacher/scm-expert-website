/**
 * 상담 신청 처리 - Vercel Functions
 * Notion DB: 23787a1932c481c59df9eb0bed62f1a8
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

    if (!input.current_status) {
      throw new Error('현재 상황을 선택해주세요.');
    }

    if (!input.preferred_time) {
      throw new Error('희망 시작 시기를 선택해주세요.');
    }

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new Error('유효하지 않은 이메일 주소입니다.');
    }

    // 현재 상황 검증
    const validStatuses = ['재직자', '이직준비', '취업준비', '기타'];
    if (!validStatuses.includes(input.current_status)) {
      throw new Error('유효하지 않은 현재 상황입니다.');
    }

    // 희망 시기 검증
    const validTimes = ['빠른시일', '1개월내', '2개월내', '상담후결정'];
    if (!validTimes.includes(input.preferred_time)) {
      throw new Error('유효하지 않은 희망 시기입니다.');
    }

    // Notion API 키 확인
    const notionApiKey = process.env.NOTION_API_KEY;
    const consultationDbId = process.env.NOTION_INQUIRY_DB_ID || '23787a1932c481c59df9eb0bed62f1a8';

    if (!notionApiKey || notionApiKey === 'your_notion_api_key_here') {
      console.error('Missing NOTION_API_KEY');
      throw new Error('시스템 설정 오류 (API). 관리자에게 문의해주세요.');
    }

    // 전화번호 정규화
    let phone = input.phone.trim().replace(/[^0-9]/g, '');
    if (phone.length === 11) {
      phone = phone.slice(0, 3) + '-' + phone.slice(3, 7) + '-' + phone.slice(7, 11);
    } else if (phone.length === 10) {
      phone = phone.slice(0, 3) + '-' + phone.slice(3, 6) + '-' + phone.slice(6, 10);
    }

    // Notion에 저장할 데이터 준비
    const notionData = {
      parent: { database_id: consultationDbId },
      properties: {
        '이름': {
          title: [{ text: { content: input.name.trim() } }]
        },
        '이메일': {
          email: input.email.trim()
        },
        '연락처': {
          phone_number: phone
        },
        '현재상황': {
          select: { name: input.current_status }
        },
        '희망시기': {
          select: { name: input.preferred_time }
        },
        '상담내용': {
          rich_text: [{ text: { content: input.goal || '' } }]
        },
        '신청일': {
          date: { start: new Date().toISOString().split('T')[0] }
        },
        '상태': {
          select: { name: '신규' }
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

      let errorMessage = '등록 실패';
      try {
        const errorJson = JSON.parse(errorData);
        errorMessage = errorJson.message || errorData;
      } catch (e) {
        errorMessage = errorData || `서버 오류 (${notionResponse.status})`;
      }

      throw new Error(errorMessage);
    }

    const result = await notionResponse.json();

    // 성공 응답
    res.status(200).json({
      success: true,
      message: '상담 신청이 완료되었습니다.',
      page_id: result.id
    });

  } catch (error) {
    console.error('Consultation form error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}
