import { formatDateTime, shortHash, getCommitTitle, getCommitBody, getChangeTypeColor } from '../utils/formatters';
import './CommitBrowser.css';

const CommitBrowser = ({ commit, changes, onFileSelect }) => {
    if (!commit) return null;

    const stats = {
        added: changes.filter(c => c.type === 'added').length,
        modified: changes.filter(c => c.type === 'modified').length,
        deleted: changes.filter(c => c.type === 'deleted').length
    };

    return (
        <div className="commit-browser glass">
            <div className="commit-header-section">
                <div className="commit-meta">
                    <h3 className="commit-title">{getCommitTitle(commit.message)}</h3>
                    <div className="commit-info">
                        <span className="commit-hash-display">{shortHash(commit.oid)}</span>
                        <span className="commit-separator">•</span>
                        <span className="commit-time">{formatDateTime(commit.timestamp)}</span>
                    </div>
                </div>

                <div className="commit-author-section">
                    <div className="author-avatar">
                        {commit.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="author-info">
                        <div className="author-name">{commit.author.name}</div>
                        <div className="author-email">{commit.author.email}</div>
                    </div>
                </div>

                {getCommitBody(commit.message) && (
                    <div className="commit-body">
                        {getCommitBody(commit.message)}
                    </div>
                )}
            </div>

            <div className="commit-stats">
                <div className="stat-item" style={{ '--stat-color': getChangeTypeColor('added') }}>
                    <span className="stat-number">{stats.added}</span>
                    <span className="stat-label">Added</span>
                </div>
                <div className="stat-item" style={{ '--stat-color': getChangeTypeColor('modified') }}>
                    <span className="stat-number">{stats.modified}</span>
                    <span className="stat-label">Modified</span>
                </div>
                <div className="stat-item" style={{ '--stat-color': getChangeTypeColor('deleted') }}>
                    <span className="stat-number">{stats.deleted}</span>
                    <span className="stat-label">Deleted</span>
                </div>
            </div>

            <div className="file-changes">
                <h4>Files Changed ({changes.length})</h4>
                <div className="file-list">
                    {changes.map((change, index) => (
                        <div
                            key={index}
                            className="file-change-item"
                            onClick={() => onFileSelect(change)}
                        >
                            <div className="file-icon" style={{ color: getChangeTypeColor(change.type) }}>
                                {change.type === 'added' ? '+' : change.type === 'deleted' ? '-' : '~'}
                            </div>
                            <div className="file-path">{change.path}</div>
                            <div className="file-badge" style={{
                                background: `${getChangeTypeColor(change.type)}20`,
                                color: getChangeTypeColor(change.type),
                                borderColor: `${getChangeTypeColor(change.type)}40`
                            }}>
                                {change.type}
                            </div>
                        </div>
                    ))}

                    {changes.length === 0 && (
                        <div className="no-changes">No file changes in this commit</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommitBrowser;
