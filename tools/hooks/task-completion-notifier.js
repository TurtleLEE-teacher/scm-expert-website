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
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                // Claude Code에서 전달된 이벤트 데이터 읽기
                const input = await this.readStdin();
                
                // 빈 입력 처리
                if (!input || input.trim() === '') {
                    console.log('빈 입력 감지 - 기본 알림 전송');
                    await this.sendDefaultNotification();
                    return;
                }
                
                let eventData;
                try {
                    eventData = JSON.parse(input);
                } catch (parseError) {
                    console.log('JSON 파싱 실패 - 원본 입력 사용:', input.substring(0, 100));
                    eventData = { 
                        tool_name: 'Unknown',
                        raw_input: input,
                        parsing_error: parseError.message
                    };
                }
                
                // 도구 사용 패턴에 따라 알림 유형 결정
                const notificationType = this.determineNotificationType(eventData);
                
                if (notificationType) {
                    await this.sendNotification(notificationType, eventData);
                } else {
                    await this.sendDefaultNotification(eventData);
                }
                
                return; // 성공 시 종료
                
            } catch (error) {
                retryCount++;
                console.error(`훅 처리 중 오류 (시도 ${retryCount}/${maxRetries}):`, error.message);
                
                if (retryCount >= maxRetries) {
                    // 최종 실패 시에도 슬랙으로 알림
                    await this.notifier.sendErrorNotification({
                        errorType: 'Claude Code Hook 최종 실패',
                        message: `${maxRetries}회 재시도 후 실패: ${error.message}`,
                        severity: 'high',
                        context: {
                            hookScript: __filename,
                            timestamp: new Date().toISOString(),
                            retryCount: retryCount
                        }
                    });
                    return;
                }
                
                // 재시도 전 잠깐 대기
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
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
                        project: 'SCM Labs Website'
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
                        project: 'SCM Labs Website'
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
                        project: 'SCM Labs Website'
                    }
                });
                break;
        }
    }

    async sendDefaultNotification(eventData = null) {
        await this.notifier.sendTaskCompletionNotification({
            taskName: 'Claude Code 작업 수행됨',
            description: eventData?.raw_input ? 
                `원본 데이터: ${eventData.raw_input.substring(0, 100)}...` :
                'Claude Code에서 작업이 수행되었습니다.',
            status: 'success',
            details: {
                timestamp: new Date().toISOString(),
                project: 'SCM Labs Website',
                note: '기본 알림 (상세 정보 파싱 실패)'
            }
        });
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
            let timeout;
            process.stdin.setEncoding('utf8');
            
            // 타임아웃 설정 (10초로 증가)
            timeout = setTimeout(() => {
                reject(new Error('입력 대기 시간 초과'));
            }, 10000);
            
            process.stdin.on('data', (chunk) => {
                data += chunk;
            });
            
            process.stdin.on('end', () => {
                clearTimeout(timeout);
                resolve(data.trim());
            });
            
            process.stdin.on('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });
            
            // 즉시 입력 종료 처리 (빈 입력 대응)
            process.nextTick(() => {
                if (!process.stdin.isTTY) {
                    process.stdin.end();
                }
            });
        });
    }
}

// 실행
if (require.main === module) {
    const notifier = new ClaudeHookNotifier();
    notifier.processHookEvent();
}

module.exports = ClaudeHookNotifier;