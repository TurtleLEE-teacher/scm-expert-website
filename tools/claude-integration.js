/**
 * Claude Code와 슬랙 알림 시스템 통합
 * 실제 작업 완료 및 승인 요청 시 자동 알림 발송
 */

const SlackNotificationSystem = require('./slack-notification-system.js');

class ClaudeSlackIntegration {
    constructor() {
        this.notifier = new SlackNotificationSystem();
        this.workflowState = {
            currentTask: null,
            startTime: null,
            completedTasks: [],
            pendingApprovals: []
        };
        this.autoNotifyEnabled = true;
        this.init();
    }

    async init() {
        console.log('🔗 Claude-Slack 통합 시스템 초기화 중...');
        
        // 시스템 시작 알림
        await this.notifier.sendTaskCompletionNotification({
            taskName: 'Claude-Slack 통합 시스템 시작',
            description: '자동 알림 시스템이 활성화되었습니다.',
            status: 'success',
            details: {
                timestamp: new Date().toISOString(),
                features: ['작업 완료 알림', '승인 요청 알림', '에러 알림', '진행 상황 업데이트']
            }
        });

        console.log('✅ Claude-Slack 통합 완료');
    }

    /**
     * 작업 시작 시 호출
     */
    async startTask(taskInfo) {
        this.workflowState.currentTask = {
            ...taskInfo,
            startTime: new Date(),
            status: 'in_progress'
        };

        if (this.autoNotifyEnabled && taskInfo.notifyStart) {
            await this.notifier.sendProgressUpdateNotification({
                taskName: taskInfo.name,
                percentage: 0,
                currentStep: '작업 시작',
                estimatedTime: taskInfo.estimatedDuration || '시간 미정'
            });
        }

        console.log(`🚀 작업 시작: ${taskInfo.name}`);
    }

    /**
     * 작업 완료 시 호출
     */
    async completeTask(completionInfo = {}) {
        if (!this.workflowState.currentTask) {
            console.warn('현재 진행 중인 작업이 없습니다.');
            return;
        }

        const task = this.workflowState.currentTask;
        const duration = new Date() - task.startTime;
        const durationText = this.formatDuration(duration);

        const completedTask = {
            ...task,
            ...completionInfo,
            endTime: new Date(),
            duration: durationText,
            status: completionInfo.status || 'success'
        };

        this.workflowState.completedTasks.push(completedTask);
        this.workflowState.currentTask = null;

        // 자동 알림 발송
        if (this.autoNotifyEnabled) {
            await this.notifier.sendTaskCompletionNotification({
                taskName: completedTask.name,
                description: completionInfo.description || `작업이 ${durationText} 만에 완료되었습니다.`,
                status: completedTask.status,
                details: {
                    duration: durationText,
                    startTime: task.startTime.toISOString(),
                    endTime: completedTask.endTime.toISOString(),
                    ...completionInfo.details
                }
            });
        }

        console.log(`✅ 작업 완료: ${completedTask.name} (${durationText})`);
        return completedTask;
    }

    /**
     * 승인 요청 시 호출
     */
    async requestApproval(approvalInfo) {
        const approval = {
            id: Date.now().toString(),
            timestamp: new Date(),
            ...approvalInfo
        };

        this.workflowState.pendingApprovals.push(approval);

        // 승인 요청 알림 발송
        await this.notifier.sendApprovalRequestNotification(approvalInfo);

        console.log(`🔐 승인 요청: ${approvalInfo.requestType}`);
        return approval;
    }

    /**
     * 에러 발생 시 호출
     */
    async reportError(errorInfo) {
        // 에러 알림 발송
        await this.notifier.sendErrorNotification(errorInfo);

        // 현재 작업을 에러 상태로 변경
        if (this.workflowState.currentTask) {
            this.workflowState.currentTask.status = 'error';
            this.workflowState.currentTask.error = errorInfo;
        }

        console.error(`❌ 에러 발생: ${errorInfo.errorType}`);
    }

    /**
     * 진행 상황 업데이트
     */
    async updateProgress(progressInfo) {
        if (!this.workflowState.currentTask) {
            console.warn('현재 진행 중인 작업이 없습니다.');
            return;
        }

        // 진행 상황 알림 발송 (25%, 50%, 75% 등 주요 단계에서만)
        if (this.autoNotifyEnabled && this.shouldNotifyProgress(progressInfo.percentage)) {
            await this.notifier.sendProgressUpdateNotification({
                taskName: this.workflowState.currentTask.name,
                ...progressInfo
            });
        }

        console.log(`📊 진행 상황: ${progressInfo.percentage}% - ${progressInfo.currentStep}`);
    }

    /**
     * 진행 상황 알림 필터링
     */
    shouldNotifyProgress(percentage) {
        const notifyAt = [25, 50, 75, 90];
        return notifyAt.includes(percentage);
    }

    /**
     * 시간 포맷팅
     */
    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}시간 ${minutes % 60}분`;
        } else if (minutes > 0) {
            return `${minutes}분 ${seconds % 60}초`;
        } else {
            return `${seconds}초`;
        }
    }

    /**
     * 워크플로우 상태 조회
     */
    getWorkflowState() {
        return {
            ...this.workflowState,
            autoNotifyEnabled: this.autoNotifyEnabled,
            notificationQueue: this.notifier.getQueueStatus()
        };
    }

    /**
     * 설정 업데이트
     */
    updateSettings(settings) {
        if (settings.autoNotifyEnabled !== undefined) {
            this.autoNotifyEnabled = settings.autoNotifyEnabled;
        }

        if (settings.notifierSettings) {
            this.notifier.updateSettings(settings.notifierSettings);
        }

        console.log('⚙️ 설정 업데이트:', settings);
    }

    /**
     * 수동 알림 발송
     */
    async sendManualNotification(type, info) {
        switch (type) {
            case 'task_completion':
                return await this.notifier.sendTaskCompletionNotification(info);
            case 'approval_request':
                return await this.notifier.sendApprovalRequestNotification(info);
            case 'error_alert':
                return await this.notifier.sendErrorNotification(info);
            case 'progress_update':
                return await this.notifier.sendProgressUpdateNotification(info);
            default:
                throw new Error(`지원하지 않는 알림 유형: ${type}`);
        }
    }
}

// 실제 사용 예제 함수들
class ClaudeWorkflowExamples {
    constructor() {
        this.integration = new ClaudeSlackIntegration();
    }

    /**
     * 웹사이트 배포 워크플로우 시뮬레이션
     */
    async simulateWebsiteDeployment() {
        console.log('\\n🌐 웹사이트 배포 워크플로우 시뮬레이션');
        
        // 1. 배포 작업 시작
        await this.integration.startTask({
            name: '웹사이트 배포',
            description: 'GitHub Pages에 최신 버전 배포',
            estimatedDuration: '3분',
            notifyStart: true
        });

        // 2. 진행 상황 업데이트
        await this.integration.updateProgress({
            percentage: 25,
            currentStep: 'Git 저장소 업데이트',
            estimatedTime: '2분 30초 남음'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        await this.integration.updateProgress({
            percentage: 50,
            currentStep: 'GitHub Actions 빌드',
            estimatedTime: '1분 30초 남음'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. 승인 요청 (예: 프로덕션 배포 전)
        await this.integration.requestApproval({
            requestType: '프로덕션 배포 승인',
            description: '테스트가 완료되어 프로덕션 환경에 배포할 준비가 되었습니다.',
            urgency: 'medium',
            context: {
                testResults: '모든 테스트 통과',
                changedFiles: 3,
                affectedFeatures: ['강의 일정 표시', '수강신청 폼']
            }
        });

        await this.integration.updateProgress({
            percentage: 75,
            currentStep: '프로덕션 배포 중',
            estimatedTime: '30초 남음'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // 4. 배포 완료
        await this.integration.completeTask({
            description: '웹사이트가 성공적으로 배포되었습니다.',
            status: 'success',
            details: {
                deploymentUrl: 'https://turtlelee-teacher.github.io/Project_SCM_Site/',
                commitHash: 'abc123f',
                filesChanged: 3,
                buildTime: '45초'
            }
        });
    }

    /**
     * 데이터베이스 동기화 오류 시나리오
     */
    async simulateDatabaseSyncError() {
        console.log('\\n💾 데이터베이스 동기화 오류 시나리오');

        await this.integration.startTask({
            name: 'Notion 데이터 동기화',
            description: '강의 일정 데이터 업데이트',
            estimatedDuration: '1분'
        });

        await this.integration.updateProgress({
            percentage: 30,
            currentStep: 'Notion API 연결',
            estimatedTime: '45초 남음'
        });

        // 에러 발생
        await this.integration.reportError({
            errorType: 'API 인증 실패',
            message: 'Notion API 토큰이 만료되어 데이터를 가져올 수 없습니다.',
            severity: 'high',
            context: {
                apiEndpoint: 'https://api.notion.com/v1/databases/query',
                errorCode: 401,
                lastSuccessfulSync: '2025-07-23 14:00:00',
                recommendedAction: 'API 토큰 갱신 필요'
            }
        });

        await this.integration.completeTask({
            description: 'API 인증 실패로 동기화가 중단되었습니다.',
            status: 'error'
        });
    }

    /**
     * 모든 시뮬레이션 실행
     */
    async runAllSimulations() {
        console.log('🎭 Claude 워크플로우 시뮬레이션 시작');
        console.log('=' .repeat(50));

        await this.simulateWebsiteDeployment();
        await new Promise(resolve => setTimeout(resolve, 2000));

        await this.simulateDatabaseSyncError();

        console.log('\\n✅ 모든 시뮬레이션 완료');
        
        // 최종 상태 출력
        const state = this.integration.getWorkflowState();
        console.log('\\n📊 최종 워크플로우 상태:');
        console.log(`완료된 작업: ${state.completedTasks.length}개`);
        console.log(`대기 중인 승인: ${state.pendingApprovals.length}개`);
        console.log(`알림 큐: ${state.notificationQueue.queueLength}개`);
    }
}

// 전역 인스턴스 생성
const claudeIntegration = new ClaudeSlackIntegration();

// 실행
if (require.main === module) {
    const examples = new ClaudeWorkflowExamples();
    examples.runAllSimulations();
}

module.exports = {
    ClaudeSlackIntegration,
    ClaudeWorkflowExamples,
    claudeIntegration
};