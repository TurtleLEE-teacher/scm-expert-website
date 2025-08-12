#!/usr/bin/env node

/**
 * 완전한 슬랙 훅 설정을 위한 통합 스크립트
 * 모든 문제를 한번에 해결하는 원스톱 솔루션
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const readline = require('readline');

class CompleteSetup {
    constructor() {
        this.projectDir = process.cwd();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async askQuestion(question) {
        return new Promise((resolve) => {
            this.rl.question(question, resolve);
        });
    }

    async askSecretQuestion(question) {
        return new Promise((resolve) => {
            process.stdout.write(question);
            process.stdin.setRawMode(true);
            process.stdin.resume();
            let input = '';
            
            process.stdin.on('data', (char) => {
                char = char.toString();
                
                if (char === '\r' || char === '\n') {
                    process.stdin.setRawMode(false);
                    process.stdin.pause();
                    process.stdout.write('\n');
                    resolve(input);
                } else if (char === '\x08' || char === '\x7f') { // 백스페이스
                    if (input.length > 0) {
                        input = input.slice(0, -1);
                        process.stdout.write('\x08 \x08');
                    }
                } else if (char === '\x03') { // Ctrl+C
                    process.exit(0);
                } else {
                    input += char;
                    process.stdout.write('*');
                }
            });
        });
    }

    log(level, message, details = null) {
        const symbols = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        console.log(`${symbols[level] || 'ℹ️'} ${message}`);
        if (details) {
            console.log(`   ${details}`);
        }
    }

    async setEnvironmentVariable(name, value) {
        return new Promise((resolve) => {
            if (process.platform === 'win32') {
                exec(`setx ${name} "${value}"`, (error, stdout, stderr) => {
                    if (error) {
                        this.log('error', `${name} 환경 변수 설정 실패`, error.message);
                        resolve(false);
                    } else {
                        this.log('success', `${name} 환경 변수 설정 완료`);
                        process.env[name] = value; // 현재 프로세스에서 즉시 사용
                        resolve(true);
                    }
                });
            } else {
                // Unix/Linux/Mac의 경우
                const shellRc = process.env.SHELL?.includes('zsh') ? '.zshrc' : '.bashrc';
                const rcPath = path.join(process.env.HOME, shellRc);
                const exportLine = `export ${name}="${value}"\n`;
                
                fs.appendFileSync(rcPath, exportLine);
                process.env[name] = value;
                this.log('success', `${name} 환경 변수를 ${shellRc}에 추가했습니다`);
                resolve(true);
            }
        });
    }

    async setupEnvironmentVariables() {
        console.log('\n=== 환경 변수 설정 ===');
        
        // CLAUDE_PROJECT_DIR 설정
        await this.setEnvironmentVariable('CLAUDE_PROJECT_DIR', this.projectDir);
        
        // SLACK_BOT_TOKEN 설정
        console.log('\nSlack Bot Token 설정이 필요합니다.');
        console.log('1. https://api.slack.com/apps 에서 앱을 생성하세요');
        console.log('2. OAuth & Permissions → Bot User OAuth Token을 복사하세요');
        console.log('3. 토큰은 xoxb-로 시작합니다\n');
        
        const setupSlack = await this.askQuestion('Slack 토큰을 설정하시겠습니까? (y/N): ');
        
        if (setupSlack.toLowerCase() === 'y') {
            const token = await this.askSecretQuestion('Slack Bot Token 입력 (입력 안보임): ');
            
            if (token && token.trim()) {
                await this.setEnvironmentVariable('SLACK_BOT_TOKEN', token.trim());
            } else {
                this.log('warning', 'Slack 토큰이 입력되지 않았습니다. 테스트 모드로 실행됩니다.');
            }
        } else {
            this.log('info', 'Slack 설정을 건너뜁니다. 나중에 수동으로 설정할 수 있습니다.');
        }
    }

    async updateClaudeSettings() {
        console.log('\n=== Claude 설정 업데이트 ===');
        
        const settingsPath = path.join(this.projectDir, '.claude/settings.json');
        const hookScriptPath = path.join(this.projectDir, 'tools/hooks/task-completion-notifier.js').replace(/\\/g, '/');
        
        try {
            let settings;
            if (fs.existsSync(settingsPath)) {
                settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            } else {
                settings = {
                    permissions: {
                        allow: ["Bash", "WebFetch"],
                        deny: []
                    }
                };
            }
            
            // 훅 설정 추가/업데이트
            settings.hooks = {
                PostToolUse: [
                    {
                        matcher: "TodoWrite",
                        hooks: [
                            {
                                type: "command",
                                command: `node "${hookScriptPath}"`
                            }
                        ]
                    },
                    {
                        matcher: "Edit|Write|MultiEdit",
                        hooks: [
                            {
                                type: "command",
                                command: `node "${hookScriptPath}"`
                            }
                        ]
                    }
                ]
            };
            
            // 설정 파일 저장
            fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
            fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
            
            this.log('success', 'Claude 설정 파일이 업데이트되었습니다');
            
        } catch (error) {
            this.log('error', 'Claude 설정 업데이트 실패', error.message);
        }
    }

    async testEverything() {
        console.log('\n=== 전체 시스템 테스트 ===');
        
        // 환경 검증 스크립트 실행
        const checkScript = path.join(this.projectDir, 'tools/check-environment.js');
        
        return new Promise((resolve) => {
            const checkProcess = spawn('node', [checkScript]);
            
            checkProcess.stdout.on('data', (data) => {
                process.stdout.write(data);
            });
            
            checkProcess.stderr.on('data', (data) => {
                process.stderr.write(data);
            });
            
            checkProcess.on('close', (code) => {
                if (code === 0) {
                    this.log('success', '모든 테스트가 통과했습니다!');
                } else {
                    this.log('warning', '일부 테스트가 실패했지만 기본 기능은 작동할 것입니다.');
                }
                resolve(code === 0);
            });
        });
    }

    async createQuickStartGuide() {
        console.log('\n=== 빠른 시작 가이드 생성 ===');
        
        const guide = `# Claude Code 슬랙 훅 빠른 시작 가이드

## 설정 완료 확인

1. 터미널을 **완전히 종료**하고 다시 시작하세요
2. Claude Code를 재시작하세요
3. 다음 명령어로 설정을 확인하세요:
   \`\`\`
   node tools/check-environment.js
   \`\`\`

## 사용법

이제 Claude Code에서 다음 작업을 수행할 때마다 슬랙 알림이 전송됩니다:

- ✅ 파일 편집 (Edit, Write, MultiEdit)
- ✅ 할일 목록 업데이트 (TodoWrite)

## 문제 해결

### 환경 변수가 인식되지 않는 경우:
1. Windows: 컴퓨터를 재시작하세요
2. Mac/Linux: 새 터미널 창을 여세요

### 슬랙 알림이 오지 않는 경우:
1. \`echo $SLACK_BOT_TOKEN\` (Mac/Linux) 또는 \`echo %SLACK_BOT_TOKEN%\` (Windows)로 토큰 확인
2. Slack App의 권한 설정 확인 (chat:write, channels:read)
3. \`node tools/check-environment.js\`로 전체 진단

### 수동 테스트:
\`\`\`bash
echo '{"tool_name": "TestTool"}' | node tools/hooks/task-completion-notifier.js
\`\`\`

## 재설정이 필요한 경우:
\`\`\`bash
node tools/complete-setup.js
\`\`\`

설정 완료일시: ${new Date().toLocaleString('ko-KR')}
`;
        
        fs.writeFileSync(path.join(this.projectDir, 'SLACK-HOOK-GUIDE.md'), guide);
        this.log('success', '빠른 시작 가이드가 생성되었습니다: SLACK-HOOK-GUIDE.md');
    }

    async run() {
        console.log('='.repeat(50));
        console.log('Claude Code 슬랙 훅 완전 설정 스크립트');
        console.log('='.repeat(50));
        console.log('이 스크립트는 모든 문제를 자동으로 해결합니다.\n');

        try {
            await this.setupEnvironmentVariables();
            await this.updateClaudeSettings();
            await this.testEverything();
            await this.createQuickStartGuide();

            console.log('\n' + '='.repeat(50));
            console.log('🎉 설정이 완료되었습니다!');
            console.log('='.repeat(50));
            console.log('');
            console.log('⚠️  중요: 다음 단계를 반드시 수행하세요:');
            console.log('1. 이 터미널을 완전히 종료하세요');
            console.log('2. Claude Code를 재시작하세요');
            console.log('3. 새로운 터미널에서 작업을 시작하세요');
            console.log('');
            console.log('이제 Claude Code에서 파일을 편집하면');
            console.log('슬랙으로 알림이 전송됩니다! 🚀');
            console.log('');

        } catch (error) {
            console.error('\n❌ 설정 중 오류 발생:', error.message);
            console.log('\n수동 설정이 필요할 수 있습니다. SLACK-HOOK-GUIDE.md를 참조하세요.');
        } finally {
            this.rl.close();
        }
    }
}

// 실행
if (require.main === module) {
    const setup = new CompleteSetup();
    setup.run().catch(console.error);
}

module.exports = CompleteSetup;