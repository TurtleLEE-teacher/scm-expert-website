/**
 * API 키 모니터링 및 로깅 시스템
 * 정기적으로 API 상태를 확인하고 문제를 감지
 */

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const startTime = Date.now();
  
  try {
    const monitoringResult = {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
      monitoringType: req.query.type || 'full',
      results: {},
      summary: {},
      alerts: [],
      performance: {
        startTime: startTime,
        endTime: 0,
        duration: 0
      }
    };

    // 모니터링 타입에 따른 검사 수행
    switch (monitoringResult.monitoringType) {
      case 'quick':
        monitoringResult.results = await performQuickCheck();
        break;
      case 'deep':
        monitoringResult.results = await performDeepCheck();
        break;
      case 'api-key':
        monitoringResult.results = await performApiKeyCheck();
        break;
      default:
        monitoringResult.results = await performFullCheck();
    }

    // 결과 요약 생성
    monitoringResult.summary = generateSummary(monitoringResult.results);
    
    // 알림 조건 확인
    monitoringResult.alerts = checkAlertConditions(monitoringResult.results);
    
    // 성능 정보 완성
    monitoringResult.performance.endTime = Date.now();
    monitoringResult.performance.duration = monitoringResult.performance.endTime - startTime;
    
    // 로그 기록
    await logMonitoringResult(monitoringResult);
    
    // 응답 상태 코드 결정
    const statusCode = determineStatusCode(monitoringResult.summary);
    
    res.status(statusCode).json(monitoringResult);
    
  } catch (error) {
    const errorResult = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      performance: {
        duration: Date.now() - startTime
      }
    };
    
    await logError(errorResult);
    res.status(500).json(errorResult);
  }
}

// 빠른 검사 (기본적인 환경변수만 확인)
async function performQuickCheck() {
  const results = {
    environment: checkEnvironmentVariables(),
    timestamp: new Date().toISOString()
  };
  
  return results;
}

// 상세 검사 (모든 API 호출 포함)
async function performDeepCheck() {
  const results = {
    environment: checkEnvironmentVariables(),
    notionApi: await testNotionApiConnection(),
    databases: await testAllDatabases(),
    systemHealth: getSystemHealth(),
    timestamp: new Date().toISOString()
  };
  
  return results;
}

// API 키 전용 검사
async function performApiKeyCheck() {
  const apiKey = process.env.NOTION_API_KEY;
  
  const results = {
    apiKeyPresent: !!apiKey,
    apiKeyFormat: analyzeApiKeyFormat(apiKey),
    apiKeyValidity: await testApiKeyValidity(apiKey),
    timestamp: new Date().toISOString()
  };
  
  return results;
}

// 전체 검사
async function performFullCheck() {
  const deepResults = await performDeepCheck();
  
  // 추가 검사 항목들
  deepResults.monitoring = {
    lastCheck: new Date().toISOString(),
    checkFrequency: '5분마다',
    alertThresholds: getAlertThresholds()
  };
  
  return deepResults;
}

// 환경변수 확인
function checkEnvironmentVariables() {
  const requiredVars = {
    NOTION_API_KEY: process.env.NOTION_API_KEY,
    NOTION_STUDENTS_DB_ID: process.env.NOTION_STUDENTS_DB_ID,
    NOTION_INQUIRIES_DB_ID: process.env.NOTION_INQUIRIES_DB_ID,
    NOTION_COURSES_DB_ID: process.env.NOTION_COURSES_DB_ID
  };
  
  const analysis = {};
  
  Object.entries(requiredVars).forEach(([key, value]) => {
    analysis[key] = {
      present: !!value,
      length: value ? value.length : 0,
      valid: validateEnvironmentVariable(key, value)
    };
  });
  
  return {
    variables: analysis,
    allPresent: Object.values(analysis).every(v => v.present),
    allValid: Object.values(analysis).every(v => v.valid)
  };
}

// API 키 형식 분석
function analyzeApiKeyFormat(apiKey) {
  if (!apiKey) {
    return {
      valid: false,
      issues: ['API 키가 제공되지 않음']
    };
  }
  
  const issues = [];
  
  if (!apiKey.startsWith('secret_')) {
    issues.push('API 키가 "secret_"로 시작하지 않음');
  }
  
  if (apiKey.length < 40) {
    issues.push('API 키 길이가 너무 짧음');
  }
  
  if (/\s/.test(apiKey)) {
    issues.push('API 키에 공백 문자 포함');
  }
  
  return {
    valid: issues.length === 0,
    length: apiKey.length,
    startsWithSecret: apiKey.startsWith('secret_'),
    hasWhitespace: /\s/.test(apiKey),
    issues: issues.length > 0 ? issues : null
  };
}

// API 키 유효성 테스트
async function testApiKeyValidity(apiKey) {
  if (!apiKey) {
    return {
      valid: false,
      error: 'API 키가 설정되지 않음'
    };
  }
  
  try {
    const response = await fetch('https://api.notion.com/v1/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      return {
        valid: true,
        user: {
          name: userData.name || userData.bot?.name,
          type: userData.type,
          id: userData.id
        }
      };
    } else {
      const errorData = await response.text();
      return {
        valid: false,
        error: `HTTP ${response.status}: ${errorData}`
      };
    }
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

// Notion API 연결 테스트
async function testNotionApiConnection() {
  const apiKey = process.env.NOTION_API_KEY;
  return await testApiKeyValidity(apiKey);
}

// 모든 데이터베이스 테스트
async function testAllDatabases() {
  const databases = {
    students: process.env.NOTION_STUDENTS_DB_ID,
    inquiries: process.env.NOTION_INQUIRIES_DB_ID,
    courses: process.env.NOTION_COURSES_DB_ID
  };
  
  const apiKey = process.env.NOTION_API_KEY;
  const results = {};
  
  if (!apiKey) {
    return {
      error: 'API 키가 설정되지 않음',
      testedDatabases: 0
    };
  }
  
  let successCount = 0;
  
  for (const [name, dbId] of Object.entries(databases)) {
    if (!dbId) {
      results[name] = {
        accessible: false,
        error: 'DB ID가 설정되지 않음'
      };
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
        successCount++;
      } else {
        const errorData = await response.text();
        results[name] = {
          accessible: false,
          error: `HTTP ${response.status}: ${errorData}`
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
    databases: results,
    summary: {
      total: Object.keys(databases).length,
      accessible: successCount,
      success_rate: successCount / Object.keys(databases).length
    }
  };
}

// 시스템 상태 확인
function getSystemHealth() {
  return {
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV || 'unknown',
    vercelRegion: process.env.VERCEL_REGION || 'unknown'
  };
}

// 환경변수 유효성 검증
function validateEnvironmentVariable(key, value) {
  if (!value) return false;
  
  if (key === 'NOTION_API_KEY') {
    return value.startsWith('secret_') && value.length >= 40 && !/\s/.test(value);
  }
  
  if (key.includes('_DB_ID')) {
    const uuidPattern = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
    return uuidPattern.test(value.replace(/-/g, ''));
  }
  
  return true;
}

// 결과 요약 생성
function generateSummary(results) {
  const summary = {
    overallStatus: 'unknown',
    issues: [],
    warnings: [],
    successfulChecks: 0,
    totalChecks: 0
  };
  
  // 환경변수 검사 결과
  if (results.environment) {
    summary.totalChecks++;
    if (results.environment.allValid) {
      summary.successfulChecks++;
    } else {
      summary.issues.push('환경변수 설정 문제');
    }
  }
  
  // Notion API 검사 결과
  if (results.notionApi) {
    summary.totalChecks++;
    if (results.notionApi.valid) {
      summary.successfulChecks++;
    } else {
      summary.issues.push(`Notion API 연결 실패: ${results.notionApi.error}`);
    }
  }
  
  // 데이터베이스 검사 결과
  if (results.databases && results.databases.summary) {
    summary.totalChecks++;
    if (results.databases.summary.success_rate === 1) {
      summary.successfulChecks++;
    } else if (results.databases.summary.success_rate > 0.5) {
      summary.warnings.push(`일부 데이터베이스 접근 불가 (${results.databases.summary.accessible}/${results.databases.summary.total})`);
    } else {
      summary.issues.push('대부분의 데이터베이스 접근 불가');
    }
  }
  
  // 전체 상태 결정
  if (summary.issues.length === 0) {
    summary.overallStatus = summary.warnings.length === 0 ? 'healthy' : 'warning';
  } else {
    summary.overallStatus = 'critical';
  }
  
  return summary;
}

// 알림 조건 확인
function checkAlertConditions(results) {
  const alerts = [];
  
  // API 키 만료 또는 무효화 감지
  if (results.notionApi && !results.notionApi.valid) {
    alerts.push({
      level: 'critical',
      type: 'api_key_invalid',
      message: 'Notion API 키가 무효합니다',
      details: results.notionApi.error,
      action: 'API 키를 재생성하고 환경변수를 업데이트하세요'
    });
  }
  
  // 데이터베이스 접근 문제
  if (results.databases && results.databases.summary && results.databases.summary.success_rate < 1) {
    alerts.push({
      level: 'warning',
      type: 'database_access',
      message: '일부 데이터베이스에 접근할 수 없습니다',
      details: `${results.databases.summary.accessible}/${results.databases.summary.total} 데이터베이스 접근 가능`,
      action: '데이터베이스 권한 설정을 확인하세요'
    });
  }
  
  // 환경변수 누락
  if (results.environment && !results.environment.allPresent) {
    alerts.push({
      level: 'critical',
      type: 'missing_env_vars',
      message: '필수 환경변수가 설정되지 않았습니다',
      action: 'Vercel 환경변수 설정을 확인하세요'
    });
  }
  
  return alerts;
}

// 알림 임계값 설정
function getAlertThresholds() {
  return {
    api_response_time: 5000, // 5초
    database_success_rate: 0.8, // 80%
    memory_usage_mb: 512 // 512MB
  };
}

// 상태 코드 결정
function determineStatusCode(summary) {
  switch (summary.overallStatus) {
    case 'healthy': return 200;
    case 'warning': return 207;
    case 'critical': return 503;
    default: return 500;
  }
}

// 요청 ID 생성
function generateRequestId() {
  return `monitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 모니터링 결과 로깅
async function logMonitoringResult(result) {
  // 실제 환경에서는 외부 로깅 서비스나 데이터베이스에 저장
  // 개발 환경에서는 콘솔에 출력
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API-MONITOR] ${result.timestamp}: ${result.summary.overallStatus}`);
    if (result.alerts.length > 0) {
      console.log(`[API-MONITOR] Alerts: ${result.alerts.length}`);
    }
  }
}

// 에러 로깅
async function logError(errorResult) {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[API-MONITOR-ERROR] ${errorResult.timestamp}: ${errorResult.error}`);
  }
}