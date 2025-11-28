import { describe, it, expect } from 'vitest';
import analysisService from './analysisService';

describe('analysisService', () => {
    describe('analyzeCommits', () => {
        it('should identify refactoring decisions', () => {
            const commits = [
                {
                    message: 'refactor: reorganize component structure',
                    author: { name: 'Test User', timestamp: Date.now() / 1000 },
                    oid: 'abc123'
                }
            ];

            const decisions = analysisService.analyzeCommits(commits);

            expect(decisions).toHaveLength(1);
            expect(decisions[0].category).toBe('refactoring');
        });

        it('should identify migration decisions', () => {
            const commits = [
                {
                    message: 'migrate from Vue 2 to Vue 3',
                    author: { name: 'Test User', timestamp: Date.now() / 1000 },
                    oid: 'def456'
                }
            ];

            const decisions = analysisService.analyzeCommits(commits);

            expect(decisions).toHaveLength(1);
            expect(decisions[0].category).toBe('migration');
        });

        it('should calculate importance scores', () => {
            const commits = [
                {
                    message: 'BREAKING CHANGE: remove deprecated API endpoints',
                    author: { name: 'Test User', timestamp: Date.now() / 1000 },
                    oid: 'ghi789'
                }
            ];

            const decisions = analysisService.analyzeCommits(commits);

            expect(decisions).toHaveLength(1);
            expect(decisions[0].importance).toBeGreaterThanOrEqual(50);
        });

        it('should return empty array for commits with no architectural decisions', () => {
            const commits = [
                {
                    message: 'fix typo in readme',
                    author: { name: 'Test User', timestamp: Date.now() / 1000 },
                    oid: 'jkl012'
                }
            ];

            const decisions = analysisService.analyzeCommits(commits);

            expect(decisions).toHaveLength(0);
        });
    });

    describe('detectCommitPatterns', () => {
        it('should detect conventional commit format', () => {
            const commits = [
                {
                    message: 'feat: add new search feature',
                    author: { name: 'Test User', timestamp: Date.now() / 1000 }
                },
                {
                    message: 'fix: resolve login bug',
                    author: { name: 'Test User', timestamp: Date.now() / 1000 }
                }
            ];

            const patterns = analysisService.detectCommitPatterns(commits);

            expect(patterns.conventional).toBe(2);
        });
    });
});
