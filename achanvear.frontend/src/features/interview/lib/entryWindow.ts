export const ENTRY_GRACE_MS = 30 * 60 * 1000;

export function sameInterviewAppointment(interview: { scheduledAt?: string; date?: string; time?: string }, slotValue?: string): boolean {
  const slot = parseInterviewTime(slotValue);
  if (!slot) return false;
  if (interview.scheduledAt) return parseInterviewTime(interview.scheduledAt)?.getTime() === slot.getTime();
  return interview.date === slot.toISOString().slice(0, 10) && interview.time === slot.toISOString().slice(11, 16);
}

export function parseInterviewTime(value?: string): Date | null {
  if (!value) return null;
  const normalized = value.replace(" ", "T");
  const date = new Date(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized) ? normalized : `${normalized}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function interviewEntryState(value: string | undefined, now = Date.now()): "early" | "open" | "expired" | "unknown" {
  const date = parseInterviewTime(value);
  if (!date) return "unknown";
  if (now < date.getTime()) return "early";
  return now > date.getTime() + ENTRY_GRACE_MS ? "expired" : "open";
}
