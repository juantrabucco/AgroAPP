import axios from 'axios';
import { getAuthToken } from './auth';

type OutboxItem = { id: string; method: 'post'|'patch'|'delete'; url: string; data: any; headers: any; ts: number };

const baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
export const api = axios.create({ baseURL });

function loadOutbox(): OutboxItem[] { try { return JSON.parse(localStorage.getItem('outbox')||'[]'); } catch { return []; } }
function saveOutbox(items: OutboxItem[]) { localStorage.setItem('outbox', JSON.stringify(items)); }
function addOutbox(item: OutboxItem) { const arr = loadOutbox(); arr.push(item); saveOutbox(arr); }

export async function flushOutbox() {
  const items = loadOutbox();
  const next: OutboxItem[] = [];
  for (const it of items) {
    try {
      await api.request({ method: it.method, url: it.url, data: it.data, headers: it.headers });
    } catch (e) {
      next.push(it); // keep for retry
    }
  }
  saveOutbox(next);
  return { flushed: items.length - next.length, pending: next.length };
}

api.interceptors.request.use((config) => {
  const token = getAuthToken?.();
  if (token) config.headers = { ...(config.headers||{}), Authorization: `Bearer ${token}` };
  return config;
});

api.interceptors.response.use((r)=>r, async (error) => {
  const cfg = error.config || {};
  const method = (cfg.method||'get').toLowerCase();
  const isWrite = method === 'post' || method === 'patch' || method === 'delete';
  if (!navigator.onLine && isWrite) {
    const item: OutboxItem = { id: crypto.randomUUID(), method, url: cfg.url, data: cfg.data, headers: cfg.headers, ts: Date.now() };
    addOutbox(item);
    return Promise.resolve({ data: { queued: true }, status: 202, statusText: 'Queued offline', headers: {}, config: cfg });
  }
  return Promise.reject(error);
});

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { flushOutbox(); });
}
