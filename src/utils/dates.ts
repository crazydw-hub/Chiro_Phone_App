const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Manual formatting on purpose: avoids depending on Intl support differences between devices.
export function formatDay(d: Date): string {
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function formatTime(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m < 10 ? '0' : ''}${m} ${suffix}`;
}

export function formatWhen(iso: string): string {
  const d = new Date(iso);
  return `${formatDay(d)} at ${formatTime(d)}`;
}

// Local calendar date as YYYY-MM-DD (not UTC).
export function toDayKey(d: Date): string {
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  return `${d.getFullYear()}-${mm < 10 ? '0' : ''}${mm}-${dd < 10 ? '0' : ''}${dd}`;
}

export function fromDayKey(key: string, hour = 0, minute = 0): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, hour, minute, 0, 0);
}

// The next `count` days (starting today) on which the office is open.
export function nextBookableDays(count: number, isOpenDay: (dayOfWeek: number) => boolean): Date[] {
  const out: Date[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (out.length < count) {
    if (isOpenDay(cursor.getDay())) out.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}
