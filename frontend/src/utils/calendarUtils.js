/**
 * Calendar and Messaging Utilities for Aadhiraksha CRM
 * Generates universal Google Calendar URLs, .ics calendar files, and formatted WhatsApp meeting invites.
 */

export function generateGoogleCalendarUrl({
  title,
  description = '',
  location = '',
  startTime, // Date object or ISO string
  endTime,   // Date object or ISO string
}) {
  const start = startTime instanceof Date ? startTime : new Date(startTime);
  const end = endTime instanceof Date ? endTime : new Date(endTime);

  const formatIsoForGCal = (date) => {
    return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'Aadhiraksha Insurance Consultation',
    details: description,
    location: location,
    dates: `${formatIsoForGCal(start)}/${formatIsoForGCal(end)}`
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateWhatsAppMeetingMessage({
  clientName,
  title,
  topic,
  datetime,
  durationMinutes = 30,
  googleMeetUrl,
  advisorName,
  calendarUrl
}) {
  const dt = datetime instanceof Date ? datetime : new Date(datetime);
  const dateFormatted = dt.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const timeFormatted = dt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  let message = `📋 *Aadhiraksha Insurance Consultation Confirmed*\n\n`;
  message += `Dear *${clientName || 'Client'}*,\n\n`;
  message += `Your consultation has been scheduled with our advisory team:\n\n`;
  message += `🗓 *Date:* ${dateFormatted}\n`;
  message += `⏰ *Time:* ${timeFormatted} (${durationMinutes} mins)\n`;
  if (topic) message += `🛡 *Topic:* ${topic}\n`;
  if (advisorName) message += `👤 *Advisor:* ${advisorName} (Aadhiraksha Team)\n`;

  if (googleMeetUrl) {
    message += `\n🎥 *Join Google Meet Video Link:*\n${googleMeetUrl}\n`;
  }

  if (calendarUrl) {
    message += `\n📅 *Add to Google Calendar:*\n${calendarUrl}\n`;
  }

  message += `\nPlease feel free to reply directly here if you need to adjust the time.`;

  return message;
}

export function openWhatsAppWithInvite({
  phoneNumber,
  clientName,
  title,
  topic,
  datetime,
  durationMinutes = 30,
  googleMeetUrl,
  advisorName
}) {
  if (!phoneNumber) return;
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const start = datetime instanceof Date ? datetime : new Date(datetime);
  const end = new Date(start.getTime() + (durationMinutes || 30) * 60000);

  const calendarUrl = generateGoogleCalendarUrl({
    title: title || `Insurance Advisory Consultation with ${clientName || 'Client'}`,
    description: `Aadhiraksha Insurance consultation.\nGoogle Meet: ${googleMeetUrl || 'Online'}\nTopic: ${topic || 'Plan Finalization'}`,
    location: googleMeetUrl || 'Google Meet',
    startTime: start,
    endTime: end
  });

  const message = generateWhatsAppMeetingMessage({
    clientName,
    title,
    topic,
    datetime: start,
    durationMinutes,
    googleMeetUrl,
    advisorName,
    calendarUrl
  });

  const waUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}
