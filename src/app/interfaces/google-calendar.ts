export interface GoogleCalendar {
  summary: string;
  description: string;
  start: { dateTime: string; timeZone: string; };
  end: { dateTime: string; timeZone: string; };
}
