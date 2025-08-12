import Dexie, { Table } from 'dexie';

export interface OfflineQueueItem { id?: number; url: string; method: string; body?: any; createdAt: Date; }
export class LocalDB extends Dexie {
  queue!: Table<OfflineQueueItem, number>;
  constructor() {
    super('agro-local');
    this.version(1).stores({ queue: '++id, url, method, createdAt' });
  }
}
export const db = new LocalDB();
