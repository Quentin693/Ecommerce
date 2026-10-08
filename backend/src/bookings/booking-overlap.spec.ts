describe('booking date overlap logic', () => {
  function overlaps(
    existingStart: string,
    existingEnd: string,
    start: string,
    end: string,
  ) {
    return existingStart < end && existingEnd > start;
  }

  it('détecte un chevauchement partiel', () => {
    expect(
      overlaps('2026-11-02', '2026-11-05', '2026-11-04', '2026-11-07'),
    ).toBe(true);
  });

  it('autorise une réservation qui commence le jour de fin', () => {
    expect(
      overlaps('2026-11-02', '2026-11-05', '2026-11-05', '2026-11-08'),
    ).toBe(false);
  });

  it('autorise des dates disjointes', () => {
    expect(
      overlaps('2026-11-02', '2026-11-05', '2026-12-01', '2026-12-03'),
    ).toBe(false);
  });
});
