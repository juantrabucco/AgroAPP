'use client';
import { api } from '@/lib/api';

export default function ReporteDemo() {
  const gen = async () => {
    const rows = [
      { Campo: 'Norte', Indicador: 'Cumplimiento Sanitario', Valor: '82%' },
      { Campo: 'Sur',   Indicador: 'Stock', Valor: 420 },
    ];
    const res = await api.post('/reports/pdf', { title: 'KPIs Agro — Demo', rows }, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'reporte.pdf'; a.click();
    URL.revokeObjectURL(url);
  };
  return <div>
    <h1>Reporte PDF (demo)</h1>
    <button onClick={gen}>Generar PDF</button>
  </div>;
}
