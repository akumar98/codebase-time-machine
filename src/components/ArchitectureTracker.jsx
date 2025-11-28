import { useState } from 'react';
import { formatDate, shortHash, getCommitTitle, getCategoryColor } from '../utils/formatters';
import './ArchitectureTracker.css';

const ArchitectureTracker = ({ commits, architecturalDecisions, onCommitSelect }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = ['all', ...new Set(architecturalDecisions.map(d => d.category))];

    const filteredDecisions = selectedCategory === 'all'
        ? architecturalDecisions
        : architecturalDecisions.filter(d => d.category === selectedCategory);

    const categoryStats = categories.slice(1).map(category => ({
        name: category,
        count: architecturalDecisions.filter(d => d.category === category).length,
        color: getCategoryColor(category)
    }));

    return (
        <div className="architecture-tracker">
            <div className="tracker-header">
                <h2>
                    <span className="gradient-text">Architectural Decisions</span>
                </h2>
                <p className="tracker-subtitle">
                    {architecturalDecisions.length} significant architectural decisions detected
                </p>
            </div>

            <div className="category-stats">
                {categoryStats.map(stat => (
                    <div
                        key={stat.name}
                        className="category-stat-card glass"
                        style={{ '--category-color': stat.color }}
                    >
                        <div className="stat-color-bar"></div>
                        <div className="stat-count">{stat.count}</div>
                        <div className="stat-name">{stat.name.replace(/-/g, ' ')}</div>
                    </div>
                ))}
            </div>

            <div className="category-filter">
                {categories.map(category => (
                    <button
                        key={category}
                        className={`btn ${selectedCategory === category ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category === 'all' ? 'All' : category.replace(/-/g, ' ')}
                    </button>
                ))}
            </div>

            <div className="decisions-timeline">
                {filteredDecisions.map((decision, index) => (
                    <div
                        key={decision.oid}
                        className="decision-item glass"
                        onClick={() => onCommitSelect(decision)}
                    >
                        <div
                            className="decision-marker"
                            style={{ background: getCategoryColor(decision.category) }}
                        ></div>

                        <div className="decision-content">
                            <div className="decision-header">
                                <span className="decision-category" style={{ color: getCategoryColor(decision.category) }}>
                                    {decision.category.replace(/-/g, ' ')}
                                </span>
                                <span className="decision-importance">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
                                    </svg>
                                    {decision.importance}% importance
                                </span>
                            </div>

                            <div className="decision-message">{getCommitTitle(decision.message)}</div>

                            <div className="decision-meta">
                                <span className="decision-hash">{shortHash(decision.oid)}</span>
                                <span className="decision-separator">•</span>
                                <span className="decision-author">{decision.author.name}</span>
                                <span className="decision-separator">•</span>
                                <span className="decision-date">{formatDate(decision.timestamp)}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredDecisions.length === 0 && (
                    <div className="no-decisions">
                        <p>No architectural decisions found in this category</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArchitectureTracker;
