const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function rentalDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / MS_PER_DAY);
}
