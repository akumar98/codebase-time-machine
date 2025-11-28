import { useState } from 'react';
import RepositoryLoader from './components/RepositoryLoader';
import Timeline from './components/Timeline';
import CommitBrowser from './components/CommitBrowser';
import CodeViewer from './components/CodeViewer';
import ArchitectureTracker from './components/ArchitectureTracker';
import FeatureEvolution from './components/FeatureEvolution';
import gitService from './services/gitService';
import analysisService from './services/analysisService';
import './App.css';

function App() {
    const [repositoryLoaded, setRepositoryLoaded] = useState(false);
    const [commits, setCommits] = useState([]);
    const [selectedCommit, setSelectedCommit] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [view, setView] = useState('timeline'); // timeline, architecture, evolution
    const [loading, setLoading] = useState(false);
    const [fileChanges, setFileChanges] = useState(new Map());
    const [architecturalDecisions, setArchitecturalDecisions] = useState([]);

    const handleRepositoryLoad = async (directoryHandle) => {
        setLoading(true);

        try {
            const result = await gitService.loadRepository(directoryHandle);

            if (result.success) {
                const commitList = await gitService.getCommits(500);
                setCommits(commitList);
                setRepositoryLoaded(true);

                // Analyze architectural decisions
                const decisions = analysisService.analyzeCommits(commitList);
                setArchitecturalDecisions(decisions);

                // Pre-load file changes for first few commits
                const changes = new Map();
                for (let i = 0; i < Math.min(10, commitList.length); i++) {
                    const commitChanges = await gitService.getCommitChanges(commitList[i].oid);
                    changes.set(commitList[i].oid, commitChanges);
                }
                setFileChanges(changes);
            }
        } catch (error) {
            console.error('Failed to load repository:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCommitSelect = async (commit) => {
        setSelectedCommit(commit);
        setSelectedFile(null);

        // Load commit changes if not already loaded
        if (!fileChanges.has(commit.oid)) {
            const changes = await gitService.getCommitChanges(commit.oid);
            setFileChanges(new Map(fileChanges.set(commit.oid, changes)));
        }
    };

    const handleFileSelect = (file) => {
        setSelectedFile(file);
    };

    if (!repositoryLoaded) {
        return (
            <div className="app">
                <RepositoryLoader onLoad={handleRepositoryLoad} loading={loading} />
            </div>
        );
    }

    return (
        <div className="app">
            <header className="app-header">
                <div className="container">
                    <div className="header-content">
                        <h1 className="app-title">
                            <span className="gradient-text">Codebase Time Machine</span>
                        </h1>
                        <p className="app-subtitle">Navigate through {commits.length} commits</p>

                        <div className="view-switcher">
                            <button
                                className={`btn ${view === 'timeline' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setView('timeline')}
                            >
                                Timeline
                            </button>
                            <button
                                className={`btn ${view === 'architecture' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setView('architecture')}
                            >
                                Architecture
                            </button>
                            <button
                                className={`btn ${view === 'evolution' ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setView('evolution')}
                            >
                                Evolution
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="app-main">
                <div className="container">
                    <div className="app-grid">
                        {view === 'timeline' && (
                            <>
                                <div className="timeline-section">
                                    <Timeline
                                        commits={commits}
                                        selectedCommit={selectedCommit}
                                        onCommitSelect={handleCommitSelect}
                                    />
                                </div>

                                {selectedCommit && (
                                    <div className="details-section">
                                        <CommitBrowser
                                            commit={selectedCommit}
                                            changes={fileChanges.get(selectedCommit.oid) || []}
                                            onFileSelect={handleFileSelect}
                                        />

                                        {selectedFile && (
                                            <CodeViewer
                                                file={selectedFile}
                                                commit={selectedCommit}
                                            />
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {view === 'architecture' && (
                            <ArchitectureTracker
                                commits={commits}
                                architecturalDecisions={architecturalDecisions}
                                onCommitSelect={handleCommitSelect}
                            />
                        )}

                        {view === 'evolution' && (
                            <FeatureEvolution
                                commits={commits}
                                fileChanges={fileChanges}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
