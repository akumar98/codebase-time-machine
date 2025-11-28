/**
 * Format timestamp to human-readable date
 */
export const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Format timestamp to human-readable date and time
 */
export const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
};

/**
 * Shorten commit hash
 */
export const shortHash = (hash) => {
    return hash ? hash.substring(0, 7) : '';
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Get first line of commit message
 */
export const getCommitTitle = (message) => {
    return message.split('\n')[0];
};

/**
 * Get commit body (everything after first line)
 */
export const getCommitBody = (message) => {
    const lines = message.split('\n');
    return lines.slice(1).join('\n').trim();
};

/**
 * Parse conventional commit message
 */
export const parseConventionalCommit = (message) => {
    const match = message.match(/^(\w+)(\(.+\))?:\s*(.+)/);

    if (match) {
        return {
            type: match[1],
            scope: match[2] ? match[2].slice(1, -1) : null,
            description: match[3],
            isConventional: true
        };
    }

    return {
        type: null,
        scope: null,
        description: message,
        isConventional: false
    };
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop() : '';
};

/**
 * Get filename from path
 */
export const getFileName = (filepath) => {
    return filepath.split('/').pop();
};

/**
 * Get directory from path
 */
export const getDirectory = (filepath) => {
    const parts = filepath.split('/');
    parts.pop();
    return parts.join('/') || '/';
};

/**
 * Get category color based on category name
 */
export const getCategoryColor = (category) => {
    const colors = {
        'refactoring': '#4f9eff',
        'migration': '#a855f7',
        'feature': '#10b981',
        'removal': '#ef4444',
        'optimization': '#f59e0b',
        'security': '#ec4899',
        'api-change': '#06b6d4',
        'data': '#8b5cf6',
        'other': '#64748b'
    };

    return colors[category] || colors.other;
};

/**
 * Get change type color
 */
export const getChangeTypeColor = (type) => {
    const colors = {
        'added': '#10b981',
        'modified': '#f59e0b',
        'deleted': '#ef4444'
    };

    return colors[type] || '#64748b';
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
