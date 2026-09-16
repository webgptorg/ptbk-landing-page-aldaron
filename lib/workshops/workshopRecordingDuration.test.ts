import { getWorkshopRecordingDurationSeconds } from '@/lib/workshops/workshopRecordingDuration';
import { describe, expect, it } from 'vitest';

describe('workshop recording duration', () => {
    it('removes the configured start offset from the total video length', () => {
        expect(getWorkshopRecordingDurationSeconds(5_400, 75)).toBe(5_325);
    });

    it('withholds an impossible or empty replay length', () => {
        expect(getWorkshopRecordingDurationSeconds(75, 75)).toBeNull();
        expect(getWorkshopRecordingDurationSeconds(75, 76)).toBeNull();
        expect(getWorkshopRecordingDurationSeconds(null, 0)).toBeNull();
        expect(getWorkshopRecordingDurationSeconds(75.5, 0)).toBeNull();
        expect(getWorkshopRecordingDurationSeconds(75, -1)).toBeNull();
    });
});
