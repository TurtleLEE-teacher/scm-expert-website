/**
 * Claude Code와 슬랙 웹훅 알림 시스템 통합
 * 웹훅 기반으로 작업 완료 및 승인 요청 시 자동 알림 발송
 */

const SlackWebhookNotifier = require('./slack-webhook-notifier.js');

class ClaudeSlackWebhookIntegration {
    constructor(webhookUrl = null) {
        this.notifier = new SlackWebhookNotifier(webhookUrl);
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
        console.log('🔗 Claude-Slack 웹훅 통합 시스템 초기화 중...');
        
        // 잠시 대기 (notifier 초기화 완료)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 시스템 시작 알림
        await this.notifier.sendTaskCompletionNotification({
            taskName: 'Claude-Slack 웹훅 통합 시스템 시작',
            description: '웹훅 기반 자동 알림 시스템이 활성화되었습니다.',
            status: 'success',
            details: {
                알림시스템: '웹훅 기반',
                지원기능: ['작업 완료 알림', '승인 요청 알림', '에러 알림', '진행 상황 업데이트'],
                모드: this.notifier.fallbackMode ? '시뮬레이션' : '실제 웹훅',
                timestamp: new Date().toISOString()
            }
        });

        console.log('✅ Claude-Slack 웹훅 통합 완료');
    }

    // 웹훅 URL 설정
    setWebhookUrl(webhookUrl) {
        this.notifier.setWebhookUrl(webhookUrl);
        console.log('🔗 웹훅 URL이 설정되어 실제 슬랙 알림이 가능합니다!');
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

        // 시작 알림도 비활성화 (진행상황 알림 줄이기)
        // if (this.autoNotifyEnabled && taskInfo.notifyStart) {
        //     await this.notifier.sendProgressUpdateNotification({
        //         taskName: taskInfo.name,
        //         percentage: 0,
        //         currentStep: '작업 시작',
        //         estimatedTime: taskInfo.estimatedDuration || '시간 미정'
        //     });
        // }

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
                    소요시간: durationText,
                    시작시간: task.startTime.toLocaleString('ko-KR'),
                    완료시간: completedTask.endTime.toLocaleString('ko-KR'),
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
     * 에러 발생 시 호출 (알림 비활성화)
     */
    async reportError(errorInfo) {
        // 에러 알림 비활성화 - 너무 자주 발생할 수 있음
        // await this.notifier.sendErrorNotification(errorInfo);

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
     * 진행 상황 알림 필터링 (비활성화)
     */
    shouldNotifyProgress(percentage) {
        // 진행상황 알림 비활성화 - 너무 많은 알림 방지
        return false;
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
            webhookConfigured: !this.notifier.fallbackMode,
            systemStatus: this.notifier.getStatus()
        };
    }
}

// 실제 사용 예제
class WebhookWorkflowExamples {
    constructor(webhookUrl = null) {
        this.integration = new ClaudeSlackWebhookIntegration(webhookUrl);
    }

    /**
     * 실제 작업 시뮬레이션
     */
    async simulateRealWork() {
        console.log('\n🌟 실제 Claude 작업 시뮬레이션');
        console.log('=' .repeat(50));
        
        // 잠시 대기 (통합 시스템 초기화)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 1. 웹사이트 업데이트 작업
        await this.integration.startTask({
            name: '웹사이트 Notion 데이터 동기화',
            description: '강의 일정 자동 업데이트',
            estimatedDuration: '2분',
            notifyStart: true
        });

        await this.integration.updateProgress({
            percentage: 25,
            currentStep: 'Notion API 연결',
            estimatedTime: '1분 30초 남음'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        await this.integration.updateProgress({
            percentage: 50,
            currentStep: '데이터 파싱 및 검증',
            estimatedTime: '1분 남음'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        await this.integration.updateProgress({
            percentage: 75,
            currentStep: 'HTML 파일 업데이트',
            estimatedTime: '30초 남음'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        await this.integration.completeTask({
            description: 'Notion 데이터가 성공적으로 동기화되었습니다.',
            status: 'success',
            details: {
                업데이트된강의: 5,
                동기화시간: '1분 45초',
                마지막동기화: new Date().toLocaleString('ko-KR')
            }
        });

        await new Promise(resolve => setTimeout(resolve, 1500));

        // 2. 승인 요청
        await this.integration.requestApproval({
            requestType: '새로운 기능 배포',
            description: '슬랙 웹훅 알림 시스템을 실제 워크플로우에 적용하려고 합니다.',
            urgency: 'medium',
            context: {
                기능설명: '작업 완료/승인 요청/에러 발생 시 슬랙 알림',
                테스트상태: '완료',
                예상영향: '개발 효율성 향상',
                배포시간: '5분 이내'
            }
        });

        console.log('\n✨ 시뮬레이션 완료! 실제 워크플로우에서 이런 식으로 알림이 발송됩니다.');
    }

    /**
     * 웹훅 URL 설정 데모
     */
    async demonstrateWebhookSetup() {
        console.log('\n🔧 웹훅 URL 설정 데모');
        console.log('현재 상태:', this.integration.notifier.fallbackMode ? '시뮬레이션 모드' : '웹훅 연결됨');
        
        console.log('\n📋 웹훅 URL 받는 방법:');
        console.log('1. https://api.slack.com/apps 방문');
        console.log('2. "Create New App" → "From scratch"');
        console.log('3. 앱 이름: "Claude Code Assistant"');
        console.log('4. "Incoming Webhooks" 활성화');
        console.log('5. "Add New Webhook to Workspace"');
        console.log('6. 알림받을 채널 선택');
        console.log('7. 생성된 웹훅 URL 복사');
        console.log('');
        console.log('예시 웹훅 URL:');
        console.log('https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX');
        console.log('');
        console.log('✅ 웹훅 URL을 받으면:');
        console.log('integration.setWebhookUrl("웹훅URL") 로 설정하면 즉시 실제 슬랙 알림 시작!');
    }
}

// 전역 인스턴스 생성
const claudeWebhookIntegration = new ClaudeSlackWebhookIntegration();

// 실행
if (require.main === module) {
    const examples = new WebhookWorkflowExamples();
    examples.simulateRealWork();
}

module.exports = {
    ClaudeSlackWebhookIntegration,
    WebhookWorkflowExamples,
    claudeWebhookIntegration
};