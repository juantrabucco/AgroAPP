'use client';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export default function AnimalDetail() {
  const params = useParams() as { id: string };
  const { data: a } = useQuery({ queryKey: ['animal', params.id], queryFn: async () => (await api.get(`/animals/${params.id}`)).data, enabled: !!params.id });
  const { data: moves=[] } = useQuery({ queryKey: ['moves', params.id], queryFn: async () => (await api.get('/movements', { params: { animalId: params.id } })).data, enabled: !!params.id });

  const current = moves.length ? moves[0]?.toPaddock?.name || '-' : '-';
  return <div style={{ display:'grid', gap: 12 }}>
    <h1>Animal {a?.tagId}</h1>
    <div>Especie: {a?.species} · Sexo: {a?.sex} · Campo: {a?.field?.name}</div>
    <div><strong>Potrero actual:</strong> {current}</div>
    <h3>Historial de movimientos</h3>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead><tr><th>Fecha</th><th>Desde</th><th>Hacia</th><th>Motivo</th></tr></thead>
      <tbody>
        {(moves as any[]).map((m:any)=>(
          <tr key={m.id}>
            <td>{new Date(m.date).toLocaleString()}</td>
            <td>{m.fromPaddock?.name||''}</td>
            <td>{m.toPaddock?.name||''}</td>
            <td>{m.reason||''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>;
}
