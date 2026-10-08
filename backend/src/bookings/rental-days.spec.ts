import { rentalDays } from './rental-days';

describe('rentalDays', () => {
  it('compte les jours entre deux dates', () => {
    const days = rentalDays(new Date('2026-11-02'), new Date('2026-11-05'));
    expect(days).toBe(3);
  });

  it('retourne 0 quand les dates sont identiques', () => {
    const days = rentalDays(new Date('2026-11-02'), new Date('2026-11-02'));
    expect(days).toBe(0);
  });
});
