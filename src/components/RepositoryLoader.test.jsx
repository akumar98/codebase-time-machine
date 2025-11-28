import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RepositoryLoader from './RepositoryLoader';

// Mock the gitService to avoid lightning-fs initialization
vi.mock('../services/gitService', () => ({
    default: {
        loadGitHubRepository: vi.fn(),
        loadLocalRepository: vi.fn(),
    }
}));

describe('RepositoryLoader', () => {
    it('should render the component title', () => {
        const mockOnLoad = vi.fn();
        render(<RepositoryLoader onLoad={mockOnLoad} loading={false} />);

        expect(screen.getByText(/Codebase Time Machine/i)).toBeInTheDocument();
    });

    it('should display loading state when loading', () => {
        const mockOnLoad = vi.fn();
        render(<RepositoryLoader onLoad={mockOnLoad} loading={true} />);

        expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });

    it('should render popular repository chips', () => {
        const mockOnLoad = vi.fn();
        render(<RepositoryLoader onLoad={mockOnLoad} loading={false} />);

        expect(screen.getByText(/isomorphic-git/i)).toBeInTheDocument();
        expect(screen.getByText(/React/i)).toBeInTheDocument();
    });

    it('should render GitHub URL input field', () => {
        const mockOnLoad = vi.fn();
        render(<RepositoryLoader onLoad={mockOnLoad} loading={false} />);

        const input = screen.getByPlaceholderText(/https:\/\/github.com/i);
        expect(input).toBeInTheDocument();
    });
});
