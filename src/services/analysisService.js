/**
 * Analyze commits to detect architectural decisions and patterns
 */
class AnalysisService {
    /**
     * Keywords that indicate architectural decisions
     */
    architectureKeywords = [
        'refactor', 'architecture', 'redesign', 'migrate', 'upgrade',
        'breaking change', 'major', 'restructure', 'framework', 'pattern',
        'implement', 'add', 'remove', 'replace', 'dependency', 'library',
        'performance', 'optimize', 'scale', 'security', 'api', 'database'
    ];

    /**
     * Detect if a commit contains an architectural decision
     */
    isArchitecturalDecision(commit) {
        const message = commit.message.toLowerCase();

        // Check for architectural keywords
        const hasKeyword = this.architectureKeywords.some(keyword =>
            message.includes(keyword)
        );

        // Check for semantic versioning in message (e.g., "v2.0.0", "version 2")
        const hasVersionBump = /v?\d+\.\d+\.\d+|version \d+/i.test(message);

        // Check for longer commit messages (architectural decisions tend to be well-documented)
        const isDetailedMessage = commit.message.length > 100;

        return hasKeyword || hasVersionBump || isDetailedMessage;
    }

    /**
     * Categorize architectural decisions
     */
    categorizeDecision(commit) {
        const message = commit.message.toLowerCase();

        if (message.includes('refactor') || message.includes('restructure')) {
            return 'refactoring';
        } else if (message.includes('migrate') || message.includes('upgrade')) {
            return 'migration';
        } else if (message.includes('add') || message.includes('implement')) {
            return 'feature';
        } else if (message.includes('remove') || message.includes('delete')) {
            return 'removal';
        } else if (message.includes('performance') || message.includes('optimize')) {
            return 'optimization';
        } else if (message.includes('security') || message.includes('fix')) {
            return 'security';
        } else if (message.includes('api') || message.includes('interface')) {
            return 'api-change';
        } else if (message.includes('database') || message.includes('schema')) {
            return 'data';
        } else {
            return 'other';
        }
    }

    /**
     * Analyze all commits and extract architectural decisions
     */
    analyzeCommits(commits) {
        const architecturalCommits = commits
            .filter(commit => this.isArchitecturalDecision(commit))
            .map(commit => ({
                ...commit,
                category: this.categorizeDecision(commit),
                importance: this.calculateImportance(commit)
            }));

        return architecturalCommits;
    }

    /**
     * Calculate importance score for a commit (0-100)
     */
    calculateImportance(commit) {
        let score = 0;
        const message = commit.message.toLowerCase();

        // Message length indicates detail
        if (commit.message.length > 200) score += 30;
        else if (commit.message.length > 100) score += 20;
        else score += 10;

        // Breaking changes are important
        if (message.includes('breaking') || message.includes('major')) score += 40;

        // Migration and refactoring are significant
        if (message.includes('migrate') || message.includes('refactor')) score += 20;

        // Security and performance are important
        if (message.includes('security') || message.includes('performance')) score += 15;

        // Cap at 100
        return Math.min(score, 100);
    }

    /**
     * Analyze file evolution - which files change most frequently
     */
    analyzeFileEvolution(commits, fileChanges) {
        const fileStats = new Map();

        fileChanges.forEach((changes, commitOid) => {
            changes.forEach(change => {
                const stats = fileStats.get(change.path) || {
                    path: change.path,
                    modifications: 0,
                    additions: 0,
                    deletions: 0,
                    commits: []
                };

                if (change.type === 'modified') stats.modifications++;
                else if (change.type === 'added') stats.additions++;
                else if (change.type === 'deleted') stats.deletions++;

                const commit = commits.find(c => c.oid === commitOid);
                if (commit) stats.commits.push(commit);

                fileStats.set(change.path, stats);
            });
        });

        return Array.from(fileStats.values())
            .sort((a, b) => b.modifications - a.modifications);
    }

    /**
     * Identify code hotspots - files that change frequently
     */
    identifyHotspots(fileEvolution, threshold = 5) {
        return fileEvolution.filter(file => file.modifications >= threshold);
    }

    /**
     * Get contributor statistics
     */
    getContributorStats(commits) {
        const contributors = new Map();

        commits.forEach(commit => {
            const authorEmail = commit.author.email;
            const stats = contributors.get(authorEmail) || {
                name: commit.author.name,
                email: authorEmail,
                commits: 0,
                firstCommit: commit.timestamp,
                lastCommit: commit.timestamp
            };

            stats.commits++;
            stats.firstCommit = Math.min(stats.firstCommit, commit.timestamp);
            stats.lastCommit = Math.max(stats.lastCommit, commit.timestamp);

            contributors.set(authorEmail, stats);
        });

        return Array.from(contributors.values())
            .sort((a, b) => b.commits - a.commits);
    }

    /**
     * Analyze commit frequency over time
     */
    analyzeCommitFrequency(commits) {
        const frequency = new Map();

        commits.forEach(commit => {
            const date = new Date(commit.timestamp);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            frequency.set(monthKey, (frequency.get(monthKey) || 0) + 1);
        });

        return Array.from(frequency.entries())
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }

    /**
     * Detect patterns in commit messages
     */
    detectCommitPatterns(commits) {
        const patterns = {
            conventional: 0, // feat:, fix:, etc.
            imperative: 0,   // "Add", "Fix", "Update"
            descriptive: 0,  // Descriptive sentences
            vague: 0         // "WIP", "Update", etc.
        };

        commits.forEach(commit => {
            const message = commit.message.split('\n')[0]; // First line only

            if (/^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?:/.test(message)) {
                patterns.conventional++;
            } else if (/^(Add|Fix|Update|Remove|Implement|Create|Delete|Refactor)\s/.test(message)) {
                patterns.imperative++;
            } else if (message.length > 20 && !/(WIP|wip|update|changes)/i.test(message)) {
                patterns.descriptive++;
            } else {
                patterns.vague++;
            }
        });

        return patterns;
    }
}

export default new AnalysisService();
