'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function CalendarioPDF() {
  const { companyId } = useAuth();
  const [fieldId, setFieldId] = useState('');
  const [month, setMonth] = useState<number>(new Date().getMonth()+1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const descargar = async () => {
    const res = await api.get(`/reports/sanidad/mes`, { params: { companyId, fieldId, month, year }, responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const a = document.createElement('a'); a.href = url; a.download = 'calendario_sanidad.pdf'; a.click();
    URL.revokeObjectURL(url);
  };

  return <div style={{ display:'grid', gap: 12 }}>
    <h1>Calendario Sanitario (PDF)</h1>
    <div style={{ display:'flex', gap:8 }}>
      <input placeholder="Field ID" value={fieldId} onChange={e=>setFieldId(e.target.value)} />
      <input type="number" value={month} onChange={e=>setMonth(Number(e.target.value))} min={1} max={12} />
      <input type="number" value={year} onChange={e=>setYear(Number(e.target.value))} />
      <button onClick={descargar} disabled={!fieldId}>Descargar PDF</button>
    </div>
  </div>;
}
