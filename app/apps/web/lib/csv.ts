import * as XLSX from 'xlsx';

export function parseCSV(file: File) {
  return new Promise<any[]>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      resolve(rows as any[]);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
