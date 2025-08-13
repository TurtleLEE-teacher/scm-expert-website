/**
 * 종합적인 시스템 헬스체크 엔드포인트
 * Notion API 연결, 환경변수, 배포 상태를 모두 확인
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

  const startTime = Date.now();
  
  try {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      status: 'checking',
      system: await checkSystemHealth(),
      environment: await checkEnvironmentHealth(),
      notion: await checkNotionHealth(),
      performance: {
        responseTime: 0,
        checks: {
          system: 0,
          environment: 0,
          notion: 0
        }
      }
    };

    // 전체 상태 판정
    const allChecks = [
      healthCheck.system.status,
      healthCheck.environment.status, 
      healthCheck.notion.status
    ];
    
    if (allChecks.every(status => status === 'healthy')) {
      healthCheck.status = 'healthy';
    } else if (allChecks.some(status => status === 'healthy')) {
      healthCheck.status = 'degraded';
    } else {
      healthCheck.status = 'unhealthy';
    }

    // 응답 시간 계산
    healthCheck.performance.responseTime = Date.now() - startTime;
    
    // 상태에 따른 HTTP 코드 설정
    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 207 : 503;
    
    res.status(statusCode).json(healthCheck);
    
  } catch (error) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error.message,
      performance: {
        responseTime: Date.now() - startTime
      }
    });
  }
}

// 시스템 상태 확인
async function checkSystemHealth() {
  const systemStart = Date.now();
  
  try {
    const systemInfo = {
      vercel: !!process.env.VERCEL,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
      region: process.env.VERCEL_REGION || 'unknown',
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };

    return {
      status: 'healthy',
      responseTime: Date.now() - systemStart,
      details: systemInfo
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - systemStart,
      error: error.message
    };
  }
}

// 환경변수 상태 확인
async function checkEnvironmentHealth() {
  const envStart = Date.now();
  
  try {
    const requiredVars = [
      'NOTION_API_KEY',
      'NOTION_STUDENTS_DB_ID',
      'NOTION_INQUIRIES_DB_ID',
      'NOTION_COURSES_DB_ID'
    ];

    const envStatus = {};
    let healthyCount = 0;
    
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      const isPresent = !!value;
      const isValid = isPresent && validateEnvVar(varName, value);
      
      envStatus[varName] = {
        present: isPresent,
        valid: isValid,
        length: isPresent ? value.length : 0
      };
      
      if (isValid) healthyCount++;
    });

    const status = healthyCount === requiredVars.length ? 'healthy' :
                   healthyCount > 0 ? 'degraded' : 'unhealthy';

    return {
      status,
      responseTime: Date.now() - envStart,
      details: {
        requiredVariables: requiredVars.length,
        configuredVariables: healthyCount,
        variables: envStatus
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - envStart,
      error: error.message
    };
  }
}

// Notion API 상태 확인
async function checkNotionHealth() {
  const notionStart = Date.now();
  
  try {
    const apiKey = process.env.NOTION_API_KEY;
    
    if (!apiKey) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - notionStart,
        error: 'NOTION_API_KEY가 설정되지 않음'
      };
    }

    // Notion API 연결 테스트
    const userResponse = await fetch('https://api.notion.com/v1/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28'
      }
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.text();
      return {
        status: 'unhealthy',
        responseTime: Date.now() - notionStart,
        error: `API 키 무효: ${userResponse.status} - ${errorData}`
      };
    }

    const userData = await userResponse.json();
    
    // 데이터베이스 접근 테스트
    const dbTests = await testDatabaseAccess(apiKey);
    
    return {
      status: dbTests.allAccessible ? 'healthy' : 'degraded',
      responseTime: Date.now() - notionStart,
      details: {
        user: {
          name: userData.name || userData.bot?.name,
          type: userData.type
        },
        databases: dbTests.results,
        summary: {
          accessible: dbTests.accessibleCount,
          total: dbTests.totalCount
        }
      }
    };
    
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - notionStart,
      error: error.message
    };
  }
}

// 환경변수 유효성 검증
function validateEnvVar(varName, value) {
  if (varName === 'NOTION_API_KEY') {
    return value.startsWith('secret_') && value.length >= 40 && !/\s/.test(value);
  }
  
  if (varName.includes('_DB_ID')) {
    // UUID 형식 검증
    const uuidPattern = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    return uuidPattern.test(value.replace(/-/g, ''));
  }
  
  return true;
}

// 데이터베이스 접근 테스트
async function testDatabaseAccess(apiKey) {
  const databases = {
    students: process.env.NOTION_STUDENTS_DB_ID,
    inquiries: process.env.NOTION_INQUIRIES_DB_ID,
    courses: process.env.NOTION_COURSES_DB_ID
  };

  const results = {};
  let accessibleCount = 0;
  
  for (const [name, dbId] of Object.entries(databases)) {
    if (!dbId) {
      results[name] = { accessible: false, error: 'DB ID가 설정되지 않음' };
      continue;
    }

    try {
      const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({ page_size: 1 })
      });

      if (response.ok) {
        results[name] = { accessible: true };
        accessibleCount++;
      } else {
        const errorData = await response.text();
        results[name] = { 
          accessible: false, 
          error: `${response.status} - ${errorData}` 
        };
      }
    } catch (error) {
      results[name] = { 
        accessible: false, 
        error: error.message 
      };
    }
  }

  return {
    results,
    accessibleCount,
    totalCount: Object.keys(databases).length,
    allAccessible: accessibleCount === Object.keys(databases).length
  };
}