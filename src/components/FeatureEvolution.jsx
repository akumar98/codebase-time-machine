import { useMemo } from 'react';
import analysisService from '../services/analysisService';
import { formatNumber } from '../utils/formatters';
import './FeatureEvolution.css';

const FeatureEvolution = ({ commits, fileChanges }) => {
    const fileEvolution = useMemo(() => {
        return analysisService.analyzeFileEvolution(commits, fileChanges);
    }, [commits, fileChanges]);

    const hotspots = useMemo(() => {
        return analysisService.identifyHotspots(fileEvolution, 3);
    }, [fileEvolution]);

    const contributorStats = useMemo(() => {
        return analysisService.getContributorStats(commits).slice(0, 10);
    }, [commits]);

    const commitFrequency = useMemo(() => {
        return analysisService.analyzeCommitFrequency(commits);
    }, [commits]);

    const commitPatterns = useMemo(() => {
        return analysisService.detectCommitPatterns(commits);
    }, [commits]);

    const totalChanges = fileEvolution.reduce(
        (sum, file) => sum + file.modifications + file.additions + file.deletions,
        0
    );

    return (
        <div className="feature-evolution">
            <div className="evolution-header">
                <h2>
                    <span className="gradient-text">Codebase Evolution</span>
                </h2>
                <p className="evolution-subtitle">
                    Insights into file changes, contributors, and commit patterns
                </p>
            </div>

            <div className="insights-grid">
                <div className="insight-card glass">
                    <h3>Code Hotspots</h3>
                    <p className="insight-description">Files that change most frequently</p>
                    <div className="hotspot-list">
                        {hotspots.slice(0, 10).map((file, index) => (
                            <div key={index} className="hotspot-item">
                                <div className="hotspot-rank">{index + 1}</div>
                                <div className="hotspot-info">
                                    <div className="hotspot-path">{file.path}</div>
                                    <div className="hotspot-stats">
                                        <span className="stat-badge added">{file.additions} added</span>
                                        <span className="stat-badge modified">{file.modifications} modified</span>
                                        {file.deletions > 0 && (
                                            <span className="stat-badge deleted">{file.deletions} deleted</span>
                                        )}
                                    </div>
                                </div>
                                <div className="hotspot-bar">
                                    <div
                                        className="hotspot-bar-fill"
                                        style={{ width: `${(file.modifications / hotspots[0].modifications) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}

                        {hotspots.length === 0 && (
                            <div className="no-data">Not enough data to identify hotspots</div>
                        )}
                    </div>
                </div>

                <div className="insight-card glass">
                    <h3>Top Contributors</h3>
                    <p className="insight-description">Most active contributors to the codebase</p>
                    <div className="contributor-list">
                        {contributorStats.map((contributor, index) => (
                            <div key={index} className="contributor-item">
                                <div className="contributor-avatar">
                                    {contributor.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="contributor-info">
                                    <div className="contributor-name">{contributor.name}</div>
                                    <div className="contributor-email">{contributor.email}</div>
                                </div>
                                <div className="contributor-commits">
                                    <div className="commits-count">{formatNumber(contributor.commits)}</div>
                                    <div className="commits-label">commits</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="insight-card glass">
                    <h3>Commit Frequency</h3>
                    <p className="insight-description">Development activity over time</p>
                    <div className="frequency-chart">
                        {commitFrequency.slice(-12).map((data, index) => (
                            <div key={index} className="frequency-bar-container">
                                <div
                                    className="frequency-bar"
                                    style={{
                                        height: `${(data.count / Math.max(...commitFrequency.map(d => d.count))) * 100}%`
                                    }}
                                    title={`${data.month}: ${data.count} commits`}
                                ></div>
                                <div className="frequency-label">{data.month.split('-')[1]}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="insight-card glass">
                    <h3>Commit Patterns</h3>
                    <p className="insight-description">How developers write commit messages</p>
                    <div className="pattern-chart">
                        <div className="pattern-item">
                            <div className="pattern-label">Conventional</div>
                            <div className="pattern-bar-container">
                                <div
                                    className="pattern-bar"
                                    style={{
                                        width: `${(commitPatterns.conventional / commits.length) * 100}%`,
                                        background: 'var(--color-accent-blue)'
                                    }}
                                ></div>
                            </div>
                            <div className="pattern-count">{commitPatterns.conventional}</div>
                        </div>
                        <div className="pattern-item">
                            <div className="pattern-label">Imperative</div>
                            <div className="pattern-bar-container">
                                <div
                                    className="pattern-bar"
                                    style={{
                                        width: `${(commitPatterns.imperative / commits.length) * 100}%`,
                                        background: 'var(--color-success)'
                                    }}
                                ></div>
                            </div>
                            <div className="pattern-count">{commitPatterns.imperative}</div>
                        </div>
                        <div className="pattern-item">
                            <div className="pattern-label">Descriptive</div>
                            <div className="pattern-bar-container">
                                <div
                                    className="pattern-bar"
                                    style={{
                                        width: `${(commitPatterns.descriptive / commits.length) * 100}%`,
                                        background: 'var(--color-accent-purple)'
                                    }}
                                ></div>
                            </div>
                            <div className="pattern-count">{commitPatterns.descriptive}</div>
                        </div>
                        <div className="pattern-item">
                            <div className="pattern-label">Vague</div>
                            <div className="pattern-bar-container">
                                <div
                                    className="pattern-bar"
                                    style={{
                                        width: `${(commitPatterns.vague / commits.length) * 100}%`,
                                        background: 'var(--color-text-disabled)'
                                    }}
                                ></div>
                            </div>
                            <div className="pattern-count">{commitPatterns.vague}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeatureEvolution;
