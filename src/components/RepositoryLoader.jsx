import { useState } from 'react';
import './RepositoryLoader.css';

const RepositoryLoader = ({ onLoad, loading }) => {
    const [error, setError] = useState(null);
    const [loadMode, setLoadMode] = useState('github'); // 'github' or 'local'
    const [githubUrl, setGithubUrl] = useState('');
    const [loadingMessage, setLoadingMessage] = useState('');

    const handleLoadGitHub = async (e) => {
        e?.preventDefault();

        if (!githubUrl.trim()) {
            setError('Please enter a GitHub repository URL');
            return;
        }

        setError(null);
        setLoadingMessage('Cloning repository from GitHub...');

        try {
            await onLoad({ type: 'github', url: githubUrl });
        } catch (err) {
            console.error('Error loading GitHub repository:', err);
            setError('Failed to load GitHub repository: ' + err.message);
        } finally {
            setLoadingMessage('');
        }
    };

    const handleLoadLocal = async () => {
        try {
            setError(null);
            setLoadingMessage('Loading local repository...');

            // Check if File System Access API is supported
            if (!('showDirectoryPicker' in window)) {
                setError('Your browser does not support the File System Access API. Please use a modern browser like Chrome or Edge, or try loading from GitHub instead.');
                setLoadingMessage('');
                return;
            }

            // Open directory picker
            const directoryHandle = await window.showDirectoryPicker({
                mode: 'read'
            });

            // Check if .git directory exists
            let hasGitDir = false;
            for await (const entry of directoryHandle.values()) {
                if (entry.name === '.git' && entry.kind === 'directory') {
                    hasGitDir = true;
                    break;
                }
            }

            if (!hasGitDir) {
                setError('The selected directory does not appear to be a git repository. Please select a directory containing a .git folder.');
                setLoadingMessage('');
                return;
            }

            await onLoad({ type: 'local', directoryHandle });
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error loading local repository:', err);
                setError('Failed to load local repository: ' + err.message);
            }
        } finally {
            setLoadingMessage('');
        }
    };

    const popularRepos = [
        { name: 'React', url: 'https://github.com/facebook/react' },
        { name: 'Vue', url: 'https://github.com/vuejs/vue' },
        { name: 'Next.js', url: 'https://github.com/vercel/next.js' },
        { name: 'isomorphic-git', url: 'https://github.com/isomorphic-git/isomorphic-git' },
    ];

    return (
        <div className="repository-loader">
            <div className="loader-content animate-scale-in">
                <div className="loader-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#gradient1)" />
                        <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="url(#gradient2)" />
                        <defs>
                            <linearGradient id="gradient1" x1="2" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#4f9eff" />
                                <stop offset="1" stopColor="#a855f7" />
                            </linearGradient>
                            <linearGradient id="gradient2" x1="2" y1="12" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#a855f7" />
                                <stop offset="1" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <h1 className="loader-title gradient-text">Codebase Time Machine</h1>
                <p className="loader-description">
                    Navigate any codebase through time, understanding the evolution of features and architectural decisions
                </p>

                <div className="load-mode-switcher">
                    <button
                        className={`mode-btn ${loadMode === 'github' ? 'active' : ''}`}
                        onClick={() => setLoadMode('github')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                        GitHub
                    </button>
                    <button
                        className={`mode-btn ${loadMode === 'local' ? 'active' : ''}`}
                        onClick={() => setLoadMode('local')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" fill="currentColor" />
                        </svg>
                        Local
                    </button>
                </div>

                {loadMode === 'github' && (
                    <div className="github-loader animate-fade-in">
                        <form onSubmit={handleLoadGitHub} className="github-form">
                            <input
                                type="text"
                                className="input github-input"
                                placeholder="https://github.com/owner/repository"
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary loader-button"
                                disabled={loading || !githubUrl.trim()}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        {loadingMessage || 'Loading...'}
                                    </>
                                ) : (
                                    'Load from GitHub'
                                )}
                            </button>
                        </form>

                        <div className="popular-repos">
                            <p className="popular-label">Try a popular repository:</p>
                            <div className="repo-chips">
                                {popularRepos.map((repo) => (
                                    <button
                                        key={repo.url}
                                        className="repo-chip"
                                        onClick={() => setGithubUrl(repo.url)}
                                        disabled={loading}
                                    >
                                        {repo.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {loadMode === 'local' && (
                    <div className="local-loader animate-fade-in">
                        <button
                            className="btn btn-primary loader-button"
                            onClick={handleLoadLocal}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    {loadingMessage || 'Loading...'}
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" fill="currentColor" />
                                    </svg>
                                    Select Local Repository
                                </>
                            )}
                        </button>
                        <p className="local-note">Choose a folder containing a .git directory</p>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" />
                        </svg>
                        {error}
                    </div>
                )}

                <div className="loader-features">
                    <div className="feature-item">
                        <div className="feature-icon">📊</div>
                        <h3>Timeline Visualization</h3>
                        <p>Interactive commit timeline with filtering</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">🏗️</div>
                        <h3>Architecture Tracking</h3>
                        <p>Identify architectural decisions automatically</p>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">🔍</div>
                        <h3>Code Evolution</h3>
                        <p>Track how files evolve over time</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RepositoryLoader;
