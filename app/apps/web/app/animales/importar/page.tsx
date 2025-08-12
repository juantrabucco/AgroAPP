'use client';
import { parseCSV } from '@/lib/csv';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function ImportAnimales() {
  const { companyId } = useAuth();
  const [fieldId, setFieldId] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [msg, setMsg] = useState<string|undefined>();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = await parseCSV(f);
    setRows(r); setErrors([]); setMsg(undefined);
  };
  const validar = async () => {
    const res = await api.post('/imports/animals/validate', { companyId, fieldId, rows });
    setErrors(res.data.errors || []);
    if (res.data.ok) setMsg('Validación OK: listo para importar'); else setMsg('Hay errores, corrige el archivo y vuelve a subirlo');
  };
  const importar = async () => {
    if (errors.length) { setMsg('No se puede importar: hay errores'); return; }
    await api.post('/imports/animals', { companyId, fieldId, rows });
    setMsg(`Importados: ${rows.length}`);
  };

  return <div style={{ display:'grid', gap: 12 }}>
    <h1>Importar Animales (CSV/Excel)</h1>
    <input placeholder="Field ID" value={fieldId} onChange={e=>setFieldId(e.target.value)} />
    <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={onFile} />
    <div>Registros leídos: {rows.length}</div>
    <div style={{ display:'flex', gap:8 }}>
      <button onClick={validar} disabled={!rows.length || !fieldId}>Validar</button>
      <button onClick={importar} disabled={!rows.length || errors.length>0}>Importar</button>
    </div>
    {msg && <div>{msg}</div>}
    {errors.length>0 && <div style={{ color:'crimson' }}>
      <h3>Errores</h3>
      <ul>{errors.map((e:any,i:number)=><li key={i}>Fila {e.row} — {e.tagId||'(sin tag)'} — {e.errors.join('; ')}</li>)}</ul>
    </div>}
    {rows.length>0 && <pre style={{ maxHeight: 240, overflow:'auto', background:'#fafafa', padding:8 }}>{JSON.stringify(rows.slice(0,5), null, 2)}...</pre>}
  </div>;
}
