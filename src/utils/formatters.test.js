import { describe, it, expect } from 'vitest';
import { formatDate, truncate } from './formatters';

describe('formatters', () => {
    describe('formatDate', () => {
        it('should format date correctly', () => {
            const timestamp = new Date('2024-01-15T10:30:00').getTime();
            const result = formatDate(timestamp);

            expect(result).toContain('Jan');
            expect(result).toContain('15');
            expect(result).toContain('2024');
        });
    });

    describe('truncate', () => {
        it('should truncate long messages', () => {
            const longMessage = 'This is a very long commit message that should be truncated to fit within the specified length limit';
            const result = truncate(longMessage, 50);

            expect(result.length).toBeLessThanOrEqual(53); // 50 + '...'
            expect(result).toContain('...');
        });

        it('should not truncate short messages', () => {
            const shortMessage = 'Short message';
            const result = truncate(shortMessage, 50);

            expect(result).toBe(shortMessage);
            expect(result).not.toContain('...');
        });
    });
});
