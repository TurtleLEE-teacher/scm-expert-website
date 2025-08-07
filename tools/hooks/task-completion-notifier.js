#!/usr/bin/env node
/**
 * Claude Code 훅에서 호출되는 태스크 완료 알림 스크립트
 * 표준입력으로 Claude Code 이벤트 데이터를 받아 슬랙으로 알림 발송
 */

const SlackNotificationSystem = require('../slack-notification-system.js');

class ClaudeHookNotifier {
    constructor() {
        this.notifier = new SlackNotificationSystem();
        this.taskPatterns = {
            file_changes: /Edit|Write|MultiEdit/,
            bash_commands: /Bash/,
            todo_updates: /TodoWrite/
        };
    }

    async processHookEvent() {
        try {
            // Claude Code에서 전달된 이벤트 데이터 읽기
            const input = await this.readStdin();
            const eventData = JSON.parse(input);
            
            // 도구 사용 패턴에 따라 알림 유형 결정
            const notificationType = this.determineNotificationType(eventData);
            
            if (notificationType) {
                await this.sendNotification(notificationType, eventData);
            }
            
        } catch (error) {
            console.error('훅 처리 중 오류:', error.message);
            
            // 오류 발생 시에도 슬랙으로 알림
            await this.notifier.sendErrorNotification({
                errorType: 'Claude Code Hook 오류',
                message: error.message,
                severity: 'medium',
                context: {
                    hookScript: __filename,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }

    determineNotificationType(eventData) {
        const toolName = eventData?.tool_name || '';
        
        if (this.taskPatterns.todo_updates.test(toolName)) {
            return 'todo_update';
        } else if (this.taskPatterns.file_changes.test(toolName)) {
            return 'file_change';
        } else if (this.taskPatterns.bash_commands.test(toolName)) {
            return 'command_completion';
        }
        
        return null;
    }

    async sendNotification(type, eventData) {
        const taskName = this.extractTaskName(eventData);
        const timestamp = new Date().toISOString();
        
        switch (type) {
            case 'todo_update':
                await this.notifier.sendTaskCompletionNotification({
                    taskName: `TODO 업데이트: ${taskName}`,
                    description: 'Claude Code에서 작업 상태가 업데이트되었습니다.',
                    status: 'success',
                    details: {
                        timestamp,
                        toolUsed: eventData.tool_name,
                        project: 'SCM Expert Website'
                    }
                });
                break;
                
            case 'file_change':
                await this.notifier.sendTaskCompletionNotification({
                    taskName: `파일 수정: ${taskName}`,
                    description: 'Claude Code에서 파일이 수정되었습니다.',
                    status: 'success',
                    details: {
                        timestamp,
                        toolUsed: eventData.tool_name,
                        project: 'SCM Expert Website'
                    }
                });
                break;
                
            case 'command_completion':
                await this.notifier.sendTaskCompletionNotification({
                    taskName: `명령어 실행: ${taskName}`,
                    description: 'Claude Code에서 명령어가 실행되었습니다.',
                    status: 'success',
                    details: {
                        timestamp,
                        toolUsed: eventData.tool_name,
                        project: 'SCM Expert Website'
                    }
                });
                break;
        }
    }

    extractTaskName(eventData) {
        // 이벤트 데이터에서 의미있는 작업명 추출
        if (eventData.tool_name === 'TodoWrite') {
            return 'Task List Update';
        } else if (eventData.parameters?.file_path) {
            const fileName = eventData.parameters.file_path.split(/[/\\]/).pop();
            return fileName;
        } else if (eventData.parameters?.command) {
            return eventData.parameters.command.substring(0, 50) + '...';
        }
        
        return eventData.tool_name || 'Unknown Task';
    }

    async readStdin() {
        return new Promise((resolve, reject) => {
            let data = '';
            process.stdin.setEncoding('utf8');
            
            process.stdin.on('data', (chunk) => {
                data += chunk;
            });
            
            process.stdin.on('end', () => {
                resolve(data);
            });
            
            process.stdin.on('error', reject);
            
            // 타임아웃 설정 (5초)
            setTimeout(() => {
                reject(new Error('입력 대기 시간 초과'));
            }, 5000);
        });
    }
}

// 실행
if (require.main === module) {
    const notifier = new ClaudeHookNotifier();
    notifier.processHookEvent();
}

module.exports = ClaudeHookNotifier;