import { useState, useEffect } from 'react';
import gitService from '../services/gitService';
import './CodeViewer.css';

const CodeViewer = ({ file, commit }) => {
    const [content, setContent] = useState({ oldContent: '', newContent: '' });
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('split'); // split, unified

    useEffect(() => {
        loadFileContent();
    }, [file, commit]);

    const loadFileContent = async () => {
        setLoading(true);
        try {
            if (file.type === 'deleted') {
                const oldContent = await gitService.getFileAtCommit(file.path, file.oid);
                setContent({ oldContent, newContent: '' });
            } else if (file.type === 'added') {
                const newContent = await gitService.getFileAtCommit(file.path, file.oid);
                setContent({ oldContent: '', newContent });
            } else {
                // Modified - get both versions
                const diff = await gitService.getDiff(file.path, file.oldOid, file.oid);
                setContent(diff);
            }
        } catch (error) {
            console.error('Error loading file content:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderLineNumbers = (lines) => {
        return lines.map((_, index) => (
            <div key={index} className="line-number">
                {index + 1}
            </div>
        ));
    };

    const renderCodeLines = (lines, type) => {
        return lines.map((line, index) => (
            <div key={index} className={`code-line ${type}`}>
                {line || '\n'}
            </div>
        ));
    };

    if (loading) {
        return (
            <div className="code-viewer glass">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading file content...</p>
                </div>
            </div>
        );
    }

    const oldLines = content.oldContent.split('\n');
    const newLines = content.newContent.split('\n');

    return (
        <div className="code-viewer glass">
            <div className="viewer-header">
                <div className="file-info">
                    <span className="file-name">{file.path}</span>
                    <span className={`file-status ${file.type}`}>{file.type}</span>
                </div>

                <div className="view-mode-toggle">
                    <button
                        className={`btn btn-ghost ${viewMode === 'split' ? 'active' : ''}`}
                        onClick={() => setViewMode('split')}
                    >
                        Split
                    </button>
                    <button
                        className={`btn btn-ghost ${viewMode === 'unified' ? 'active' : ''}`}
                        onClick={() => setViewMode('unified')}
                    >
                        Unified
                    </button>
                </div>
            </div>

            {viewMode === 'split' ? (
                <div className="code-split-view">
                    {file.type !== 'added' && (
                        <div className="code-pane old-pane">
                            <div className="pane-header">Old Version</div>
                            <div className="code-content">
                                <div className="line-numbers">
                                    {renderLineNumbers(oldLines)}
                                </div>
                                <div className="code-lines">
                                    {renderCodeLines(oldLines, 'old')}
                                </div>
                            </div>
                        </div>
                    )}

                    {file.type !== 'deleted' && (
                        <div className="code-pane new-pane">
                            <div className="pane-header">New Version</div>
                            <div className="code-content">
                                <div className="line-numbers">
                                    {renderLineNumbers(newLines)}
                                </div>
                                <div className="code-lines">
                                    {renderCodeLines(newLines, 'new')}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="code-unified-view">
                    <div className="code-content">
                        <div className="code-section old-section">
                            <div className="section-label">- {file.path} (old)</div>
                            <div className="section-content">
                                <div className="line-numbers">
                                    {renderLineNumbers(oldLines)}
                                </div>
                                <div className="code-lines">
                                    {renderCodeLines(oldLines, 'old')}
                                </div>
                            </div>
                        </div>

                        <div className="code-section new-section">
                            <div className="section-label">+ {file.path} (new)</div>
                            <div className="section-content">
                                <div className="line-numbers">
                                    {renderLineNumbers(newLines)}
                                </div>
                                <div className="code-lines">
                                    {renderCodeLines(newLines, 'new')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeViewer;
