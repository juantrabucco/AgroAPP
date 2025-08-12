export type LogEntry = { ts:number; level:'info'|'error'|'warn'; msg:string; stack?:string };
const KEY = 'clientLogs';

export function logError(msg: string, err?: any) {
  const entry: LogEntry = { ts: Date.now(), level:'error', msg, stack: err?.stack || String(err||'') };
  const arr = getLogs(); arr.push(entry); localStorage.setItem(KEY, JSON.stringify(arr).slice(0, 500000)); // cap ~0.5MB
}

export function logInfo(msg: string) {
  const entry: LogEntry = { ts: Date.now(), level:'info', msg };
  const arr = getLogs(); arr.push(entry); localStorage.setItem(KEY, JSON.stringify(arr).slice(0, 500000));
}

export function getLogs(): LogEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function clearLogs() {
  localStorage.removeItem(KEY);
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => logError('window.onerror', e.error || e.message));
  window.addEventListener('unhandledrejection', (e: any) => logError('unhandledrejection', e?.reason || ''));
}
