/**
 * 향상된 환경변수 및 Vercel 배포 상태 진단 엔드포인트
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
    // 환경변수 진단
    const envVars = {
      NOTION_API_KEY: process.env.NOTION_API_KEY,
      NOTION_STUDENTS_DB_ID: process.env.NOTION_STUDENTS_DB_ID,
      NOTION_INQUIRIES_DB_ID: process.env.NOTION_INQUIRIES_DB_ID,
      NOTION_COURSES_DB_ID: process.env.NOTION_COURSES_DB_ID,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      NODE_ENV: process.env.NODE_ENV
    };

    // API 키 품질 검사
    const apiKeyAnalysis = analyzeApiKey(envVars.NOTION_API_KEY);
    
    // 데이터베이스 ID 형식 검증
    const dbIdValidation = {
      students: validateDatabaseId(envVars.NOTION_STUDENTS_DB_ID),
      inquiries: validateDatabaseId(envVars.NOTION_INQUIRIES_DB_ID),
      courses: validateDatabaseId(envVars.NOTION_COURSES_DB_ID)
    };

    // 배포 환경 정보
    const deploymentInfo = {
      isVercel: !!envVars.VERCEL,
      environment: envVars.VERCEL_ENV || envVars.NODE_ENV || 'unknown',
      region: process.env.VERCEL_REGION || 'unknown',
      url: process.env.VERCEL_URL || 'unknown',
      timestamp: new Date().toISOString()
    };

    // 전체 진단 결과
    const diagnostics = {
      status: 'success',
      timestamp: new Date().toISOString(),
      deployment: deploymentInfo,
      environment: {
        hasNotionApiKey: !!envVars.NOTION_API_KEY,
        notionApiKeyPrefix: envVars.NOTION_API_KEY ? envVars.NOTION_API_KEY.substring(0, 10) + '...' : 'undefined',
        apiKeyAnalysis,
        hasStudentsDbId: !!envVars.NOTION_STUDENTS_DB_ID,
        studentsDbId: envVars.NOTION_STUDENTS_DB_ID || 'undefined',
        hasInquiriesDbId: !!envVars.NOTION_INQUIRIES_DB_ID,
        inquiriesDbId: envVars.NOTION_INQUIRIES_DB_ID || 'undefined',
        hasCoursesDbId: !!envVars.NOTION_COURSES_DB_ID,
        coursesDbId: envVars.NOTION_COURSES_DB_ID || 'undefined',
        databaseValidation: dbIdValidation
      },
      recommendations: generateRecommendations(envVars, apiKeyAnalysis, dbIdValidation),
      nextSteps: [
        '1. API 키가 유효한지 /api/notion-test 엔드포인트로 확인',
        '2. 문제 발견 시 Notion 통합 설정 재확인',
        '3. 환경변수 업데이트 후 재배포 필요시 실행'
      ]
    };
    
    res.status(200).json(diagnostics);
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// API 키 품질 분석 함수
function analyzeApiKey(apiKey) {
  if (!apiKey) {
    return {
      present: false,
      valid: false,
      issues: ['API 키가 설정되지 않음']
    };
  }

  const issues = [];
  
  // 기본 형식 검증
  if (!apiKey.startsWith('secret_')) {
    issues.push('API 키가 "secret_"로 시작하지 않음');
  }
  
  // 길이 검증
  if (apiKey.length < 40) {
    issues.push('API 키가 너무 짧음 (일반적으로 50자 이상)');
  }
  
  // 특수문자나 공백 검증
  if (apiKey.includes(' ') || apiKey.includes('\n') || apiKey.includes('\t')) {
    issues.push('API 키에 공백 문자가 포함됨');
  }

  return {
    present: true,
    length: apiKey.length,
    startsWithSecret: apiKey.startsWith('secret_'),
    hasWhitespace: /\s/.test(apiKey),
    valid: issues.length === 0,
    issues: issues.length > 0 ? issues : null
  };
}

// 데이터베이스 ID 검증 함수
function validateDatabaseId(dbId) {
  if (!dbId) {
    return {
      present: false,
      valid: false,
      format: 'missing'
    };
  }

  // UUID 형식 검증 (하이픈 포함/불포함 모두 허용)
  const uuidPattern = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
  const isValidFormat = uuidPattern.test(dbId.replace(/-/g, ''));

  return {
    present: true,
    length: dbId.length,
    format: isValidFormat ? 'valid-uuid' : 'invalid-format',
    valid: isValidFormat
  };
}

// 추천사항 생성 함수
function generateRecommendations(envVars, apiKeyAnalysis, dbValidation) {
  const recommendations = [];

  if (!apiKeyAnalysis.present) {
    recommendations.push('Vercel 환경변수에 NOTION_API_KEY를 설정하세요');
  } else if (!apiKeyAnalysis.valid) {
    recommendations.push('API 키 형식을 확인하고 올바른 Notion API 키를 설정하세요');
    if (apiKeyAnalysis.issues) {
      recommendations.push(...apiKeyAnalysis.issues.map(issue => `- ${issue}`));
    }
  }

  Object.entries(dbValidation).forEach(([dbName, validation]) => {
    if (!validation.present) {
      recommendations.push(`NOTION_${dbName.toUpperCase()}_DB_ID 환경변수를 설정하세요`);
    } else if (!validation.valid) {
      recommendations.push(`${dbName} 데이터베이스 ID 형식이 올바르지 않습니다`);
    }
  });

  if (recommendations.length === 0) {
    recommendations.push('모든 환경변수가 올바르게 설정되었습니다');
    recommendations.push('/api/notion-test 엔드포인트로 실제 연결을 테스트하세요');
  }

  return recommendations;
}