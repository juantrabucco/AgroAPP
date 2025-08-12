'use client';
import { getLogs, clearLogs } from '@/lib/logger';

export default function Logs() {
  const logs = getLogs();
  const descargar = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'agro_logs_cliente.json'; a.click();
    URL.revokeObjectURL(url);
  };
  return <div style={{ display:'grid', gap:12 }}>
    <h1>Logs de cliente</h1>
    <p>Guarda este archivo y envíalo a soporte si tuviste un problema.</p>
    <div style={{ display:'flex', gap:8 }}>
      <button onClick={descargar} disabled={!logs.length}>Descargar JSON</button>
      <button onClick={()=>{ clearLogs(); location.reload(); }} disabled={!logs.length}>Limpiar</button>
    </div>
    <pre style={{ background:'#111', color:'#0f0', padding:12, borderRadius:8, maxHeight:360, overflow:'auto' }}>{JSON.stringify(logs.slice(-500), null, 2)}</pre>
  </div>;
}
