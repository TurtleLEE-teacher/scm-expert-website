#!/usr/bin/env node

/**
 * 모든 프로젝트에서 작동하는 전역 슬랙 훅 설정 스크립트
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class GlobalHookSetup {
    constructor() {
        this.homeDir = os.homedir();
        this.globalClaudeDir = path.join(this.homeDir, '.claude');
        this.currentProjectDir = process.cwd();
    }

    log(level, message) {
        const symbols = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        console.log(`${symbols[level]} ${message}`);
    }

    async createGlobalSlackSystem() {
        this.log('info', '전역 슬랙 시스템 생성 중...');
        
        const globalSlackSystemPath = path.join(this.globalClaudeDir, 'slack-notification-system.js');
        const globalHookPath = path.join(this.globalClaudeDir, 'global-hook-notifier.js');
        
        // 글로벌 .claude 디렉토리 생성
        if (!fs.existsSync(this.globalClaudeDir)) {
            fs.mkdirSync(this.globalClaudeDir, { recursive: true });
        }

        // 슬랙 시스템 복사
        const slackSystemSource = fs.readFileSync(
            path.join(this.currentProjectDir, 'tools/slack-notification-system.js'), 'utf8'
        );
        fs.writeFileSync(globalSlackSystemPath, slackSystemSource);

        // 전역 훅 스크립트 생성
        const globalHookScript = `#!/usr/bin/env node
/**
 * 전역 Claude Code 슬랙 훅 - 모든 프로젝트에서 작동
 */

const path = require('path');
const SlackNotificationSystem = require('./slack-notification-system.js');

class GlobalClaudeHookNotifier {
    constructor() {
        this.notifier = new SlackNotificationSystem();
        this.currentProject = process.cwd();
    }

    async processHookEvent() {
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
            try {
                const input = await this.readStdin();
                
                if (!input || input.trim() === '') {
                    await this.sendDefaultNotification();
                    return;
                }
                
                let eventData;
                try {
                    eventData = JSON.parse(input);
                } catch (parseError) {
                    eventData = { 
                        tool_name: 'Unknown',
                        raw_input: input,
                        parsing_error: parseError.message
                    };
                }
                
                await this.sendNotification(eventData);
                return;
                
            } catch (error) {
                retryCount++;
                console.error(\`훅 처리 중 오류 (시도 \${retryCount}/\${maxRetries}):\`, error.message);
                
                if (retryCount >= maxRetries) {
                    await this.notifier.sendErrorNotification({
                        errorType: 'Global Claude Hook 실패',
                        message: \`\${maxRetries}회 재시도 후 실패: \${error.message}\`,
                        severity: 'high',
                        context: {
                            project: this.currentProject,
                            timestamp: new Date().toISOString()
                        }
                    });
                    return;
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
        }
    }

    async sendNotification(eventData) {
        const projectName = path.basename(this.currentProject);
        const toolName = eventData.tool_name || 'Unknown';
        
        let taskName, description;
        
        if (toolName === 'TodoWrite') {
            taskName = \`[\${projectName}] TODO 업데이트\`;
            description = 'Claude Code에서 작업 목록이 업데이트되었습니다.';
        } else if (['Edit', 'Write', 'MultiEdit'].includes(toolName)) {
            const fileName = eventData.parameters?.file_path ? 
                path.basename(eventData.parameters.file_path) : '파일';
            taskName = \`[\${projectName}] \${fileName} 수정\`;
            description = 'Claude Code에서 파일이 수정되었습니다.';
        } else {
            taskName = \`[\${projectName}] \${toolName} 실행\`;
            description = 'Claude Code에서 작업이 수행되었습니다.';
        }

        await this.notifier.sendTaskCompletionNotification({
            taskName,
            description,
            status: 'success',
            details: {
                timestamp: new Date().toISOString(),
                project: projectName,
                projectPath: this.currentProject,
                toolUsed: toolName
            }
        });
    }

    async sendDefaultNotification() {
        const projectName = path.basename(this.currentProject);
        
        await this.notifier.sendTaskCompletionNotification({
            taskName: \`[\${projectName}] Claude Code 작업 수행됨\`,
            description: 'Claude Code에서 작업이 수행되었습니다.',
            status: 'success',
            details: {
                timestamp: new Date().toISOString(),
                project: projectName,
                projectPath: this.currentProject,
                note: '전역 훅 (상세 정보 파싱 실패)'
            }
        });
    }

    async readStdin() {
        return new Promise((resolve, reject) => {
            let data = '';
            let timeout;
            process.stdin.setEncoding('utf8');
            
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
            
            process.nextTick(() => {
                if (!process.stdin.isTTY) {
                    process.stdin.end();
                }
            });
        });
    }
}

if (require.main === module) {
    const notifier = new GlobalClaudeHookNotifier();
    notifier.processHookEvent();
}

module.exports = GlobalClaudeHookNotifier;
`;

        fs.writeFileSync(globalHookPath, globalHookScript);
        
        this.log('success', `전역 훅 시스템 생성됨: ${this.globalClaudeDir}`);
        return globalHookPath;
    }

    async createGlobalSettings(globalHookPath) {
        this.log('info', '전역 Claude 설정 생성 중...');
        
        const globalSettingsPath = path.join(this.globalClaudeDir, 'settings.json');
        
        const globalSettings = {
            permissions: {
                allow: [
                    "Bash", "WebFetch", "Task", "TodoWrite", "Edit", "Write", "MultiEdit",
                    "Bash(claude mcp add:*)", "Bash(claude mcp:*)", "Bash(claude --debug)",
                    "Bash(npx:*)", "Bash(timeout:*)", "Bash(echo $OS)", "Bash(node:*)", "Bash(npm:*)",
                    "mcp__context7__resolve-library-id", "mcp__context7__get-library-docs",
                    "mcp__github-mcp__get_file_contents", "mcp__github-mcp__create_or_update_file",
                    "mcp__github-mcp__search_code", "mcp__sequential-thinking__sequentialthinking",
                    "mcp__playwright-stealth__playwright_navigate", "mcp__playwright-stealth__playwright_screenshot",
                    "mcp__playwright-stealth__playwright_evaluate", "mcp__playwright-stealth__playwright_fill",
                    "mcp__playwright-stealth__playwright_select", "mcp__playwright-stealth__playwright_click",
                    "mcp__playwright-stealth__playwright_press_key", "mcp__playwright-stealth__playwright_close",
                    "mcp__notionApi__API-retrieve-a-database", "mcp__mem0-memory-mcp__search-memories",
                    "mcp__notionApi__API-get-self", "mcp__playwright-stealth__playwright_console_logs",
                    "mcp__playwright-stealth__playwright_get_visible_text", "mcp__github-mcp__create_repository",
                    "mcp__notionApi__API-post-database-query", "mcp__playwright-stealth__playwright_get_visible_html",
                    "mcp__playwright-stealth__playwright_get", "mcp__mem0-memory-mcp__add-memory",
                    "mcp__notion-api__API-retrieve-a-database", "mcp__notion-api__API-post-database-query",
                    "mcp__slack__slack_list_channels", "mcp__slack__slack_post_message",
                    "mcp__git-mcp-server__git_status", "mcp__git-mcp-server__git_set_working_dir",
                    "mcp__git-mcp-server__git_add", "mcp__git-mcp-server__git_commit",
                    "mcp__git-mcp-server__git_push", "mcp__git-mcp-server__git_pull",
                    "mcp__git-mcp-server__git_log", "mcp__git-mcp-server__git_reset",
                    "mcp__playwright__browser_resize", "mcp__playwright-stealth__playwright_upload_file",
                    "mcp__notion-api__API-create-a-database", "mcp__notion-api__API-post-page",
                    "mcp__notion-api__API-get-self", "mcp__notion-api__API-post-search",
                    "mcp__notion-api__API-delete-a-block", "mcp__slack__slack_get_channel_history"
                ],
                deny: []
            },
            hooks: {
                PostToolUse: [
                    {
                        matcher: "TodoWrite",
                        hooks: [
                            {
                                type: "command",
                                command: `node "${globalHookPath.replace(/\\\\/g, '/')}"`
                            }
                        ]
                    },
                    {
                        matcher: "Edit|Write|MultiEdit",
                        hooks: [
                            {
                                type: "command",
                                command: `node "${globalHookPath.replace(/\\\\/g, '/')}"`
                            }
                        ]
                    }
                ]
            }
        };

        fs.writeFileSync(globalSettingsPath, JSON.stringify(globalSettings, null, 2));
        
        this.log('success', `전역 Claude 설정 생성됨: ${globalSettingsPath}`);
        return globalSettingsPath;
    }

    async copySlackToken() {
        this.log('info', 'Slack 토큰 환경 변수 확인 중...');
        
        // 현재 프로젝트에서 사용 중인 토큰이 있는지 확인
        const currentToken = process.env.SLACK_BOT_TOKEN;
        
        if (!currentToken) {
            this.log('warning', 'SLACK_BOT_TOKEN이 설정되지 않았습니다.');
            this.log('info', '다음 명령어로 설정하세요:');
            console.log('   setx SLACK_BOT_TOKEN "your_token_here"');
        } else {
            this.log('success', 'SLACK_BOT_TOKEN이 이미 전역으로 설정되어 있습니다.');
        }
    }

    async testGlobalSetup(globalHookPath) {
        this.log('info', '전역 훅 테스트 중...');
        
        return new Promise((resolve) => {
            const { spawn } = require('child_process');
            const testData = JSON.stringify({
                tool_name: 'GlobalTest',
                parameters: { global: true },
                timestamp: new Date().toISOString()
            });
            
            const hookProcess = spawn('node', [globalHookPath]);
            
            hookProcess.stdout.on('data', (data) => {
                console.log('   ', data.toString().trim());
            });
            
            hookProcess.on('close', (code) => {
                if (code === 0) {
                    this.log('success', '전역 훅이 정상 작동합니다!');
                } else {
                    this.log('error', '전역 훅 테스트 실패');
                }
                resolve(code === 0);
            });
            
            hookProcess.stdin.write(testData);
            hookProcess.stdin.end();
        });
    }

    async run() {
        console.log('🌍 전역 Claude Code 슬랙 훅 설정 시작...\n');
        
        try {
            const globalHookPath = await this.createGlobalSlackSystem();
            await this.createGlobalSettings(globalHookPath);
            await this.copySlackToken();
            await this.testGlobalSetup(globalHookPath);
            
            console.log('\n' + '='.repeat(50));
            console.log('🎉 전역 설정 완료!');
            console.log('='.repeat(50));
            console.log('');
            console.log('✅ 이제 모든 프로젝트에서 슬랙 훅이 작동합니다!');
            console.log(`📁 전역 설정 위치: ${this.globalClaudeDir}`);
            console.log('');
            console.log('⚠️  중요: Claude Code를 재시작하면 전역 설정이 적용됩니다.');
            console.log('');
            
        } catch (error) {
            this.log('error', `설정 중 오류: ${error.message}`);
        }
    }
}

if (require.main === module) {
    const setup = new GlobalHookSetup();
    setup.run().catch(console.error);
}

module.exports = GlobalHookSetup;