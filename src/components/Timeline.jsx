import { useState, useMemo } from 'react';
import { formatDate, formatRelativeTime, shortHash, getCommitTitle } from '../utils/formatters';
import './Timeline.css';

const Timeline = ({ commits, selectedCommit, onCommitSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('all'); // all, day, week, month, year

    const filteredCommits = useMemo(() => {
        let filtered = commits;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                commit =>
                    commit.message.toLowerCase().includes(query) ||
                    commit.author.name.toLowerCase().includes(query)
            );
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = Date.now();
            const timeRanges = {
                day: 24 * 60 * 60 * 1000,
                week: 7 * 24 * 60 * 60 * 1000,
                month: 30 * 24 * 60 * 60 * 1000,
                year: 365 * 24 * 60 * 60 * 1000
            };
            const range = timeRanges[dateFilter];
            filtered = filtered.filter(commit => now - commit.timestamp < range);
        }

        return filtered;
    }, [commits, searchQuery, dateFilter]);

    return (
        <div className="timeline glass">
            <div className="timeline-header">
                <h2>Commit Timeline</h2>
                <p className="timeline-count">
                    {filteredCommits.length} {filteredCommits.length === 1 ? 'commit' : 'commits'}
                </p>
            </div>

            <div className="timeline-filters">
                <input
                    type="text"
                    className="input"
                    placeholder="Search commits..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />

                <div className="filter-buttons">
                    {['all', 'day', 'week', 'month', 'year'].map(filter => (
                        <button
                            key={filter}
                            className={`btn btn-ghost ${dateFilter === filter ? 'active' : ''}`}
                            onClick={() => setDateFilter(filter)}
                        >
                            {filter === 'all' ? 'All Time' : `Past ${filter}`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="timeline-list">
                {filteredCommits.map((commit, index) => (
                    <div
                        key={commit.oid}
                        className={`timeline-item ${selectedCommit?.oid === commit.oid ? 'selected' : ''}`}
                        onClick={() => onCommitSelect(commit)}
                    >
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                            <div className="commit-header">
                                <span className="commit-hash">{shortHash(commit.oid)}</span>
                                <span className="commit-date">{formatRelativeTime(commit.timestamp)}</span>
                            </div>
                            <div className="commit-message">{getCommitTitle(commit.message)}</div>
                            <div className="commit-author">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
                                </svg>
                                {commit.author.name}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredCommits.length === 0 && (
                    <div className="timeline-empty">
                        <p>No commits found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Timeline;
