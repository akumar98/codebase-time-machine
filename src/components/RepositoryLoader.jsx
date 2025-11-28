import { useState } from 'react';
import './RepositoryLoader.css';

const RepositoryLoader = ({ onLoad, loading }) => {
    const [error, setError] = useState(null);

    const handleLoadRepository = async () => {
        try {
            setError(null);

            // Check if File System Access API is supported
            if (!('showDirectoryPicker' in window)) {
                setError('Your browser does not support the File System Access API. Please use a modern browser like Chrome or Edge.');
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
                return;
            }

            onLoad(directoryHandle);
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error loading repository:', err);
                setError('Failed to load repository: ' + err.message);
            }
        }
    };

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

                <button
                    className="btn btn-primary loader-button"
                    onClick={handleLoadRepository}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Loading Repository...
                        </>
                    ) : (
                        'Load Git Repository'
                    )}
                </button>

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
