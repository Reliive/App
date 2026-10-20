/**
 * Formats an event date for the native picker label.
 */
export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Formats an event time for the native picker label.
 */
export function formatDisplayTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Converts a Date to the value expected by an HTML date input.
 */
export function formatIsoDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts a Date to the value expected by an HTML time input.
 */
export function formatIsoTimeString(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Updates only the calendar portion of a Date from an HTML input value.
 */
export function updateDatePart(date: Date, value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  const updatedDate = new Date(date);
  updatedDate.setFullYear(year, month - 1, day);
  return updatedDate;
}

/**
 * Updates only the clock portion of a Date from an HTML input value.
 */
export function updateTimePart(date: Date, value: string): Date {
  const [hours, minutes] = value.split(':').map(Number);
  const updatedDate = new Date(date);
  updatedDate.setHours(hours, minutes);
  return updatedDate;
}
