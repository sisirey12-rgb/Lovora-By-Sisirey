/** Downloads a calendar event (with an alarm) for the unlock day, so the phone itself reminds the recipient. */
export function addReminder(date: string, title: string, url: string) {
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lovora Meow//EN', 'BEGIN:VEVENT', `UID:${Date.now()}@lovorameow`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`, `DTSTART:${date.replaceAll('-', '')}T000000`, 'DURATION:PT1H', `SUMMARY:${title}`, `DESCRIPTION:Open your surprise: ${url}`, `URL:${url}`, 'BEGIN:VALARM', 'TRIGGER:PT0S', 'ACTION:DISPLAY', 'DESCRIPTION:Today is the day!', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'open-your-surprise.ics'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}
