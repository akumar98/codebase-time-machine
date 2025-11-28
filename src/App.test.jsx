import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the gitService to avoid lightning-fs initialization
vi.mock('./services/gitService', () => ({
    default: {
        loadGitHubRepository: vi.fn(),
        loadLocalRepository: vi.fn(),
        getCommits: vi.fn(),
        getCommitChanges: vi.fn(),
    }
}));

describe('App', () => {
    it('should render RepositoryLoader initially', () => {
        render(<App />);

        // Should show the loader when no repository is loaded
        expect(screen.getByText(/Try a popular repository/i)).toBeInTheDocument();
    });

    it('should display the app title', () => {
        render(<App />);

        expect(screen.getByText(/Codebase Time Machine/i)).toBeInTheDocument();
    });
});
