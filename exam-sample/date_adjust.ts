export function adjust(weeks: number, hours: number, dateStr: string): string {
  if (weeks > 50 || hours > 50) {
    throw new Error('Too many weeks or hours');
  }
  const date = new Date(dateStr.replace('on', ''));
  const newDate = new Date(date.getTime() + (weeks * 7 * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000));
  const time = newDate.toLocaleTimeString('en-GB', { hour12: false }).replace(/:\d\d$/, '');
  const day = newDate.getDate();
  const month = newDate.toLocaleString('en-GB', { month: 'long' });
  const year = newDate.getFullYear();
  return `${time} on ${day} ${month} ${year}`;
}
