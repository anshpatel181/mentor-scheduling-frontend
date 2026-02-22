/**
 * Frontend time handling: display in user's timezone (UTC or IST), send UTC to API.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function getUserOffsetMs(timezone) {
  if (timezone === "IST") return IST_OFFSET_MS;
  return 0;
}

export function toLocalISO(date, timezone) {
  const d = new Date(date);
  if (timezone === "IST") {
    return new Date(d.getTime() + IST_OFFSET_MS);
  }
  return d;
}

export function formatDateLocal(dateStr, timezone) {
  const d = typeof dateStr === "string" ? new Date(dateStr + "T00:00:00Z") : new Date(dateStr);
  const local = timezone === "IST" ? new Date(d.getTime() + IST_OFFSET_MS) : d;
  return local.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: timezone === "IST" ? "Asia/Kolkata" : "UTC",
  });
}

export function formatTimeLocal(isoString, timezone) {
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone === "IST" ? "Asia/Kolkata" : "UTC",
  });
}

export function formatSlotLabel(startISO, endISO, timezone) {
  return `${formatTimeLocal(startISO, timezone)} – ${formatTimeLocal(endISO, timezone)}`;
}

/** Check if date (YYYY-MM-DD) is in the past (UTC) */
export function isPastDate(dateStr) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00Z");
  return d < today;
}

/** Check if datetime is in the past */
export function isPastDateTime(isoString) {
  return new Date(isoString) <= new Date();
}

/** Get start of week (Monday) for a date, in UTC date string YYYY-MM-DD */
export function getWeekStartStr(date) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

/** Build UTC ISO strings for a slot on a given date (YYYY-MM-DD) and hour (0-23) */
export function slotToUTC(dateStr, hour) {
  const start = new Date(dateStr + "T00:00:00.000Z");
  start.setUTCHours(hour, 0, 0, 0);
  const end = new Date(start);
  end.setUTCHours(hour + 1, 0, 0, 0);
  return {
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  };
}

/** Parse local time (HH:mm) on date (YYYY-MM-DD) in user timezone to UTC ISO */
export function localToUTC(dateStr, timeStr, timezone) {
  const [h, m] = timeStr.split(":").map(Number);
  if (timezone === "IST") {
    const local = new Date(dateStr + "T00:00:00Z");
    local.setUTCHours(h, m, 0, 0);
    local.setTime(local.getTime() - IST_OFFSET_MS);
    return local.toISOString();
  }
  const d = new Date(dateStr + "T00:00:00.000Z");
  d.setUTCHours(h, m, 0, 0);
  return d.toISOString();
}

export function getWeekDates(weekStartStr) {
  const start = new Date(weekStartStr + "T00:00:00Z");
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/** Convert UTC (date, hour) to IST (date, hour) for display */
export function convertUTCToIST(utcDateStr, utcHour) {
  const utcMoment = new Date(utcDateStr + "T00:00:00.000Z");
  utcMoment.setUTCHours(utcHour, 0, 0, 0);
  const istMoment = new Date(utcMoment.getTime() + IST_OFFSET_MS);
  return {
    dateStr: istMoment.toISOString().slice(0, 10),
    hour: istMoment.getUTCHours(),
  };
}

/** Convert (UTC date column + IST hour) to UTC (date, hour) for storage */
export function convertISTToUTC(utcDateStr, istHour) {
  const base = new Date(utcDateStr + "T00:00:00.000Z").getTime();
  const utcMoment = new Date(base + (istHour - 5.5) * 3600000);
  return {
    utcDateStr: utcMoment.toISOString().slice(0, 10),
    utcHour: utcMoment.getUTCHours(),
  };
}
