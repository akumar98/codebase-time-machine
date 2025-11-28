import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import FS from '@isomorphic-git/lightning-fs';

const fs = new FS('codebase-time-machine-fs');

class GitService {
    constructor() {
        this.fs = fs;
        this.dir = null;
        this.commits = [];
        this.fileHandle = null;
        this.repositoryType = null; // 'local' or 'github'
    }

    /**
     * Load a repository from GitHub URL
     */
    async loadGitHubRepository(githubUrl) {
        try {
            // Clean up previous repository if it exists
            if (this.dir) {
                try {
                    await this.deleteDirectory(this.dir);
                } catch (e) {
                    console.warn('Cleanup warning:', e);
                }
            }

            // Use a unique directory for each clone to avoid collisions
            this.dir = `/repo-${Date.now()}`;
            await fs.promises.mkdir(this.dir);

            // Parse GitHub URL to get owner and repo
            const urlPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
            const match = githubUrl.match(urlPattern);

            if (!match) {
                throw new Error('Invalid GitHub URL. Please use format: https://github.com/owner/repo');
            }

            const [, owner, repoName] = match;
            const cleanRepoName = repoName.replace(/\.git$/, '');
            const repoUrl = `https://github.com/${owner}/${cleanRepoName}`;
            const proxyUrl = 'https://cors.isomorphic-git.org';

            // Clone the repository
            console.log(`Starting clone of ${owner}/${cleanRepoName}...`);
            console.log(`Using proxy: ${proxyUrl}`);

            await git.clone({
                fs,
                http,
                dir: this.dir,
                url: repoUrl,
                corsProxy: proxyUrl,
                depth: 20, // Reduced depth for stability
                singleBranch: true,
                onProgress: (progress) => {
                    console.log('Git Clone Progress:', progress);
                },
            });

            console.log('Clone completed successfully');
            return { success: true, owner, repo: cleanRepoName };
        } catch (error) {
            console.error('Error loading GitHub repository:', error);

            // Provide more specific error messages
            let errorMessage = error.message;
            if (error.message.includes('404')) {
                errorMessage = 'Repository not found or is private. Please check the URL.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error or CORS issue. The proxy might be blocked by your network.';
            } else if (error.code === 'HttpError') {
                errorMessage = `HTTP Error: ${error.data.statusCode} ${error.data.statusMessage}`;
            }

            return { success: false, error: errorMessage, details: error };
        }
    }

    /**
     * Load a local git repository using File System Access API
     */
    async loadLocalRepository(directoryHandle) {
        try {
            this.repositoryType = 'local';
            this.fileHandle = directoryHandle;
            this.dir = '/repo';

            // Clean up any existing repository
            try {
                await this.deleteDirectory(this.dir);
            } catch (e) {
                console.warn('Cleanup warning:', e);
            }

            // Copy files from the directory handle to the virtual filesystem
            await this.copyDirectoryToFS(directoryHandle, this.dir);

            return { success: true };
        } catch (error) {
            console.error('Error loading local repository:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Recursively copy directory from FileSystemDirectoryHandle to lightning-fs
     */
    async copyDirectoryToFS(dirHandle, targetPath) {
        try {
            await fs.promises.mkdir(targetPath, { recursive: true });

            for await (const entry of dirHandle.values()) {
                const entryPath = `${targetPath}/${entry.name}`;

                if (entry.kind === 'file') {
                    const file = await entry.getFile();
                    const contents = await file.arrayBuffer();
                    await fs.promises.writeFile(entryPath, new Uint8Array(contents));
                } else if (entry.kind === 'directory') {
                    await this.copyDirectoryToFS(entry, entryPath);
                }
            }
        } catch (error) {
            console.error('Error copying directory:', error);
            throw error;
        }
    }

    /**
     * Recursively delete a directory and its contents
     */
    async deleteDirectory(dirPath) {
        try {
            const stats = await fs.promises.stat(dirPath).catch(() => null);
            if (!stats) return;

            if (stats.isDirectory()) {
                const files = await fs.promises.readdir(dirPath);
                for (const file of files) {
                    await this.deleteDirectory(`${dirPath}/${file}`);
                }
                await fs.promises.rmdir(dirPath);
            } else {
                await fs.promises.unlink(dirPath);
            }
        } catch (error) {
            console.error(`Error deleting ${dirPath}:`, error);
            // Don't throw, try to continue
        }
    }

    /**
     * Get all commits from the repository
     */
    async getCommits(limit = 100) {
        try {
            const commits = await git.log({
                fs,
                dir: this.dir,
                depth: limit,
            });

            this.commits = commits.map(commit => ({
                oid: commit.oid,
                message: commit.commit.message,
                author: commit.commit.author,
                committer: commit.commit.committer,
                timestamp: commit.commit.author.timestamp * 1000, // Convert to milliseconds
                parents: commit.commit.parent,
            }));

            return this.commits;
        } catch (error) {
            console.error('Error getting commits:', error);
            return [];
        }
    }

    /**
     * Get file content at a specific commit
     */
    async getFileAtCommit(filepath, commitOid) {
        try {
            const { blob } = await git.readBlob({
                fs,
                dir: this.dir,
                oid: commitOid,
                filepath,
            });

            return new TextDecoder().decode(blob);
        } catch (error) {
            console.error('Error reading file:', error);
            return null;
        }
    }

    /**
     * Get all files changed in a commit
     */
    async getCommitChanges(commitOid) {
        try {
            const commit = await git.readCommit({
                fs,
                dir: this.dir,
                oid: commitOid,
            });

            const changes = [];

            // Get the commit tree
            const { tree } = commit.commit;

            // Walk through the tree to get all files
            const files = await this.walkTree(tree);

            // If there's a parent, compare with parent
            if (commit.commit.parent && commit.commit.parent.length > 0) {
                const parentCommit = await git.readCommit({
                    fs,
                    dir: this.dir,
                    oid: commit.commit.parent[0],
                });

                const parentFiles = await this.walkTree(parentCommit.commit.tree);

                // Compare files to find changes
                const fileMap = new Map(files.map(f => [f.path, f]));
                const parentFileMap = new Map(parentFiles.map(f => [f.path, f]));

                // Find added and modified files
                for (const [path, file] of fileMap) {
                    const parentFile = parentFileMap.get(path);
                    if (!parentFile) {
                        changes.push({ path, type: 'added', oid: file.oid });
                    } else if (parentFile.oid !== file.oid) {
                        changes.push({ path, type: 'modified', oid: file.oid, oldOid: parentFile.oid });
                    }
                }

                // Find deleted files
                for (const [path, file] of parentFileMap) {
                    if (!fileMap.has(path)) {
                        changes.push({ path, type: 'deleted', oid: file.oid });
                    }
                }
            } else {
                // Initial commit - all files are added
                changes.push(...files.map(f => ({ path: f.path, type: 'added', oid: f.oid })));
            }

            return changes;
        } catch (error) {
            console.error('Error getting commit changes:', error);
            return [];
        }
    }

    /**
     * Walk through a git tree to get all files
     */
    async walkTree(treeOid, prefix = '') {
        const files = [];

        try {
            const { tree } = await git.readTree({
                fs,
                dir: this.dir,
                oid: treeOid,
            });

            for (const entry of tree) {
                const path = prefix ? `${prefix}/${entry.path}` : entry.path;

                if (entry.type === 'blob') {
                    files.push({ path, oid: entry.oid, mode: entry.mode });
                } else if (entry.type === 'tree') {
                    const subFiles = await this.walkTree(entry.oid, path);
                    files.push(...subFiles);
                }
            }
        } catch (error) {
            console.error('Error walking tree:', error);
        }

        return files;
    }

    /**
     * Get the diff between two file versions
     */
    async getDiff(filepath, oldOid, newOid) {
        try {
            let oldContent = '';
            let newContent = '';

            if (oldOid) {
                const { blob } = await git.readBlob({
                    fs,
                    dir: this.dir,
                    oid: oldOid,
                    filepath,
                });
                oldContent = new TextDecoder().decode(blob);
            }

            if (newOid) {
                const { blob } = await git.readBlob({
                    fs,
                    dir: this.dir,
                    oid: newOid,
                    filepath,
                });
                newContent = new TextDecoder().decode(blob);
            }

            return { oldContent, newContent };
        } catch (error) {
            console.error('Error getting diff:', error);
            return { oldContent: '', newContent: '' };
        }
    }

    /**
     * Search commits by message
     */
    searchCommits(query) {
        if (!query) return this.commits;

        const lowerQuery = query.toLowerCase();
        return this.commits.filter(commit =>
            commit.message.toLowerCase().includes(lowerQuery) ||
            commit.author.name.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get commits within a date range
     */
    getCommitsByDateRange(startDate, endDate) {
        return this.commits.filter(commit => {
            const commitDate = new Date(commit.timestamp);
            return commitDate >= startDate && commitDate <= endDate;
        });
    }

    /**
     * Get commit by OID
     */
    getCommitByOid(oid) {
        return this.commits.find(commit => commit.oid === oid);
    }
}

export default new GitService();
