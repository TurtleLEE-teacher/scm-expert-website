#!/usr/bin/env node

/**
 * Claude Code 슬랙 훅 환경 검증 스크립트
 * 환경 변수, 파일 존재, 연결성을 자동으로 체크
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class EnvironmentChecker {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            details: []
        };
    }

    log(level, message, details = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            details
        };
        
        this.results.details.push(logEntry);
        
        const symbols = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        console.log(`${symbols[level] || 'ℹ️'} ${message}`);
        if (details) {
            console.log(`   ${JSON.stringify(details, null, 2)}`);
        }
        
        if (level === 'success') this.results.passed++;
        else if (level === 'error') this.results.failed++;
        else if (level === 'warning') this.results.warnings++;
    }

    async checkEnvironmentVariables() {
        console.log('\n=== 환경 변수 검증 ===');
        
        // CLAUDE_PROJECT_DIR 확인
        const claudeProjectDir = process.env.CLAUDE_PROJECT_DIR;
        if (!claudeProjectDir) {
            this.log('error', 'CLAUDE_PROJECT_DIR 환경 변수가 설정되지 않음');
        } else {
            this.log('success', 'CLAUDE_PROJECT_DIR 설정됨', { path: claudeProjectDir });
            
            // 디렉토리 존재 확인
            if (!fs.existsSync(claudeProjectDir)) {
                this.log('error', 'CLAUDE_PROJECT_DIR 경로가 존재하지 않음', { path: claudeProjectDir });
            } else {
                this.log('success', 'CLAUDE_PROJECT_DIR 경로 존재 확인');
            }
        }
        
        // SLACK_BOT_TOKEN 확인
        const slackToken = process.env.SLACK_BOT_TOKEN;
        if (!slackToken) {
            this.log('warning', 'SLACK_BOT_TOKEN 환경 변수가 설정되지 않음 (테스트 모드로 실행)');
        } else {
            if (slackToken.startsWith('xoxb-')) {
                this.log('success', 'SLACK_BOT_TOKEN 형식 올바름', { 
                    length: slackToken.length,
                    prefix: slackToken.substring(0, 10) + '...'
                });
            } else {
                this.log('warning', 'SLACK_BOT_TOKEN 형식이 의심됨 (xoxb-로 시작하지 않음)');
            }
        }
    }

    async checkFileStructure() {
        console.log('\n=== 파일 구조 검증 ===');
        
        const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
        const requiredFiles = [
            'tools/hooks/task-completion-notifier.js',
            'tools/slack-notification-system.js',
            '.claude/settings.json'
        ];
        
        for (const filePath of requiredFiles) {
            const fullPath = path.join(projectDir, filePath);
            if (fs.existsSync(fullPath)) {
                this.log('success', `필수 파일 존재: ${filePath}`);
                
                // 파일 크기도 확인
                const stats = fs.statSync(fullPath);
                if (stats.size === 0) {
                    this.log('warning', `파일이 비어있음: ${filePath}`);
                }
            } else {
                this.log('error', `필수 파일 누락: ${filePath}`, { fullPath });
            }
        }
    }

    async checkNodeJsEnvironment() {
        console.log('\n=== Node.js 환경 검증 ===');
        
        return new Promise((resolve) => {
            const nodeProcess = spawn('node', ['--version']);
            let output = '';
            
            nodeProcess.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            nodeProcess.on('close', (code) => {
                if (code === 0) {
                    this.log('success', `Node.js 설치됨: ${output.trim()}`);
                } else {
                    this.log('error', 'Node.js가 설치되지 않았거나 PATH에 없음');
                }
                resolve();
            });
            
            nodeProcess.on('error', () => {
                this.log('error', 'Node.js 실행 실패');
                resolve();
            });
        });
    }

    async testHookScript() {
        console.log('\n=== 훅 스크립트 테스트 ===');
        
        const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
        const hookScript = path.join(projectDir, 'tools/hooks/task-completion-notifier.js');
        
        if (!fs.existsSync(hookScript)) {
            this.log('error', '훅 스크립트를 찾을 수 없음');
            return;
        }
        
        return new Promise((resolve) => {
            // 테스트 JSON 데이터 전송
            const testData = JSON.stringify({
                tool_name: 'TestTool',
                parameters: { test: true },
                timestamp: new Date().toISOString()
            });
            
            const hookProcess = spawn('node', [hookScript]);
            let output = '';
            let errorOutput = '';
            
            hookProcess.stdout.on('data', (data) => {
                output += data.toString();
            });
            
            hookProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            hookProcess.on('close', (code) => {
                if (code === 0) {
                    this.log('success', '훅 스크립트 실행 성공', { output: output.trim() });
                } else {
                    this.log('error', '훅 스크립트 실행 실패', { 
                        code, 
                        output: output.trim(), 
                        error: errorOutput.trim() 
                    });
                }
                resolve();
            });
            
            hookProcess.on('error', (err) => {
                this.log('error', '훅 스크립트 실행 중 오류', { error: err.message });
                resolve();
            });
            
            // 테스트 데이터 전송
            hookProcess.stdin.write(testData);
            hookProcess.stdin.end();
        });
    }

    async testSlackSystem() {
        console.log('\n=== 슬랙 시스템 테스트 ===');
        
        try {
            const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
            const SlackSystem = require(path.join(projectDir, 'tools/slack-notification-system.js'));
            const slack = new SlackSystem();
            
            if (slack.testMode) {
                this.log('warning', '슬랙 테스트 모드 실행 중 (실제 전송 안됨)');
            } else {
                this.log('success', '슬랙 실제 전송 모드 (토큰 설정됨)');
            }
            
            // 큐 상태 확인
            const queueStatus = slack.getQueueStatus();
            this.log('info', '슬랙 시스템 상태', queueStatus);
            
        } catch (error) {
            this.log('error', '슬랙 시스템 로드 실패', { error: error.message });
        }
    }

    async generateReport() {
        console.log('\n=== 검증 결과 요약 ===');
        
        const total = this.results.passed + this.results.failed + this.results.warnings;
        const successRate = total > 0 ? ((this.results.passed / total) * 100).toFixed(1) : 0;
        
        console.log(`총 검사 항목: ${total}`);
        console.log(`✅ 통과: ${this.results.passed}`);
        console.log(`❌ 실패: ${this.results.failed}`);
        console.log(`⚠️  경고: ${this.results.warnings}`);
        console.log(`성공률: ${successRate}%`);
        
        if (this.results.failed === 0) {
            console.log('\n🎉 모든 필수 검증을 통과했습니다!');
            console.log('Claude Code에서 슬랙 훅이 정상 작동할 것입니다.');
        } else {
            console.log('\n⚠️  일부 문제가 발견되었습니다.');
            console.log('tools/setup-environment.bat를 실행하여 문제를 해결하세요.');
        }
        
        // 상세 로그 파일 저장
        const logFile = path.join(process.cwd(), 'hook-verification.log');
        fs.writeFileSync(logFile, JSON.stringify(this.results, null, 2));
        console.log(`\n상세 로그가 저장됨: ${logFile}`);
        
        return this.results.failed === 0;
    }

    async runAll() {
        console.log('Claude Code 슬랙 훅 환경 검증을 시작합니다...\n');
        
        await this.checkEnvironmentVariables();
        await this.checkFileStructure();
        await this.checkNodeJsEnvironment();
        await this.testHookScript();
        await this.testSlackSystem();
        
        const success = await this.generateReport();
        process.exit(success ? 0 : 1);
    }
}

// 실행
if (require.main === module) {
    const checker = new EnvironmentChecker();
    checker.runAll().catch(console.error);
}

module.exports = EnvironmentChecker;