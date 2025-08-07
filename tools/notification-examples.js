/**
 * 슬랙 알림 시스템 사용 예제
 * 다양한 상황에서의 알림 전송 예제들
 */

// 알림 시스템 로드 (Node.js 환경)
const SlackNotificationSystem = require('./slack-notification-system.js');
const notifier = new SlackNotificationSystem();

/**
 * 예제 1: 작업 완료 알림
 */
async function exampleTaskCompletion() {
    console.log('\\n📝 예제 1: 작업 완료 알림');
    
    // 성공 케이스
    await notifier.sendTaskCompletionNotification({
        taskName: '웹사이트 배포',
        description: 'GitHub Pages에 성공적으로 배포되었습니다.',
        status: 'success',
        details: {
            deploymentUrl: 'https://turtlelee-teacher.github.io/Project_SCM_Site/',
            commitHash: 'abc123f',
            deployTime: '2분 30초'
        }
    });

    // 경고 케이스
    await notifier.sendTaskCompletionNotification({
        taskName: 'Notion 데이터 동기화',
        description: '데이터 동기화는 완료되었으나 일부 필드가 누락되었습니다.',
        status: 'warning',
        details: {
            syncedRecords: 5,
            missingFields: ['description', 'category'],
            recommendedAction: '수동 확인 필요'
        }
    });

    // 에러 케이스
    await notifier.sendTaskCompletionNotification({
        taskName: 'API 연결 테스트',
        description: 'API 키 인증에 실패했습니다.',
        status: 'error',
        details: {
            errorCode: 401,
            endpoint: '/api/notion/courses',
            suggestedFix: 'API 키 확인 필요'
        }
    });
}

/**
 * 예제 2: 승인 요청 알림
 */
async function exampleApprovalRequest() {
    console.log('\\n🔐 예제 2: 승인 요청 알림');
    
    // 일반 승인 요청
    await notifier.sendApprovalRequestNotification({
        requestType: '데이터베이스 스키마 변경',
        description: '새로운 강의 카테고리 필드를 추가하려고 합니다.',
        urgency: 'medium',
        context: {
            proposedChanges: ['category 필드 타입 변경', '인덱스 추가'],
            impactAssessment: '기존 데이터 마이그레이션 필요',
            estimatedDowntime: '5분'
        }
    });

    // 긴급 승인 요청
    await notifier.sendApprovalRequestNotification({
        requestType: '보안 패치 적용',
        description: '중요한 보안 취약점이 발견되어 즉시 패치가 필요합니다.',
        urgency: 'critical',
        context: {
            vulnerabilityType: 'SQL Injection',
            cveNumber: 'CVE-2023-12345',
            affectedSystems: ['웹사이트', 'API 서버'],
            patchAvailable: true
        }
    });
}

/**
 * 예제 3: 에러 알림
 */
async function exampleErrorAlert() {
    console.log('\\n🚨 예제 3: 에러 알림');
    
    // 시스템 에러
    await notifier.sendErrorNotification({
        errorType: '데이터베이스 연결 실패',
        message: 'SQLite 데이터베이스 파일에 접근할 수 없습니다.',
        severity: 'high',
        context: {
            filePath: './database/scm_expert.db',
            permissions: '읽기 전용',
            lastSuccessfulConnection: '2025-07-23 14:30:00',
            errorCode: 'SQLITE_CANTOPEN'
        }
    });

    // 비즈니스 로직 에러
    await notifier.sendErrorNotification({
        errorType: 'Notion API 할당량 초과',
        message: 'API 요청 한도를 초과하여 일시적으로 서비스가 제한됩니다.',
        severity: 'medium',
        context: {
            currentUsage: '950/1000',
            resetTime: '2025-07-24 00:00:00 UTC',
            affectedFeatures: ['강의 일정 동기화', '수강신청 알림']
        }
    });
}

/**
 * 예제 4: 진행 상황 업데이트
 */
async function exampleProgressUpdate() {
    console.log('\\n📈 예제 4: 진행 상황 업데이트');
    
    // 장시간 작업의 진행 상황
    const progressSteps = [
        { percentage: 20, step: '강의 데이터 수집 중', time: '4분 남음' },
        { percentage: 50, step: '데이터 검증 및 정제', time: '2분 30초 남음' },
        { percentage: 80, step: '웹사이트 업데이트 준비', time: '1분 남음' },
        { percentage: 100, step: '배포 완료', time: '완료됨' }
    ];

    for (const progress of progressSteps) {
        await notifier.sendProgressUpdateNotification({
            taskName: '월간 강의 일정 업데이트',
            percentage: progress.percentage,
            currentStep: progress.step,
            estimatedTime: progress.time
        });
        
        // 실제 작업 시뮬레이션을 위한 지연
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

/**
 * 예제 5: 특별한 상황들
 */
async function exampleSpecialCases() {
    console.log('\\n⭐ 예제 5: 특별한 상황들');
    
    // 새로운 수강신청
    await notifier.sendTaskCompletionNotification({
        taskName: '신규 수강신청 접수',
        description: 'SCM 기초 완성 강의에 새로운 수강신청이 접수되었습니다.',
        status: 'success',
        details: {
            courseName: 'SCM 기초 완성 강의',
            studentName: '홍길동',
            email: 'hong@example.com',
            phoneNumber: '010-1234-5678',
            registrationTime: new Date().toISOString()
        }
    });

    // 시스템 유지보수 알림
    await notifier.sendApprovalRequestNotification({
        requestType: '정기 시스템 유지보수',
        description: '매월 정기 백업 및 시스템 점검을 실시하려고 합니다.',
        urgency: 'low',
        context: {
            scheduledTime: '2025-07-30 02:00 AM',
            estimatedDuration: '30분',
            affectedServices: ['웹사이트', '수강신청 시스템'],
            backupLocation: 'AWS S3 버킷'
        }
    });

    // 성능 모니터링 알림
    await notifier.sendErrorNotification({
        errorType: '응답 시간 지연',
        message: '웹사이트 응답 시간이 평균보다 50% 느려졌습니다.',
        severity: 'medium',
        context: {
            averageResponseTime: '2.3초',
            currentResponseTime: '3.5초',
            affectedPages: ['/scm-basic.html', '/career-consulting.html'],
            possibleCauses: ['높은 트래픽', 'Notion API 지연', '이미지 로딩 느림']
        }
    });
}

/**
 * 모든 예제 실행
 */
async function runAllExamples() {
    console.log('🚀 슬랙 알림 시스템 예제 실행 시작');
    console.log('=' .repeat(60));

    try {
        await exampleTaskCompletion();
        await new Promise(resolve => setTimeout(resolve, 1000));

        await exampleApprovalRequest();
        await new Promise(resolve => setTimeout(resolve, 1000));

        await exampleErrorAlert();
        await new Promise(resolve => setTimeout(resolve, 1000));

        await exampleProgressUpdate();
        await new Promise(resolve => setTimeout(resolve, 1000));

        await exampleSpecialCases();

        console.log('\\n✅ 모든 예제 실행 완료!');
        console.log('=' .repeat(60));

        // 큐 상태 확인
        const queueStatus = notifier.getQueueStatus();
        console.log('\\n📊 알림 큐 상태:');
        console.log(JSON.stringify(queueStatus, null, 2));

    } catch (error) {
        console.error('❌ 예제 실행 중 오류 발생:', error);
    }
}

// 실행
if (require.main === module) {
    runAllExamples();
}

module.exports = {
    exampleTaskCompletion,
    exampleApprovalRequest,
    exampleErrorAlert,
    exampleProgressUpdate,
    exampleSpecialCases,
    runAllExamples
};