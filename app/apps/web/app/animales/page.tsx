'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { exportToExcel } from '@/lib/exportExcel';
import { useTableFilter } from '@/components/TableFilter';
import { useState } from 'react';

function MoveAnimalButton({ animal }: { animal: any }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: paddocks } = useQuery({
    queryKey: ['paddocks', animal.fieldId],
    queryFn: async () => (await api.get('/paddocks', { params: { fieldId: animal.fieldId } })).data,
    enabled: open
  });
  const [to, setTo] = useState('');
  const move = async () => {
    await api.post('/movements', { animalId: animal.id, toPaddockId: to, date: new Date().toISOString(), reason: 'Movimiento manual' });
    setOpen(false);
    qc.invalidateQueries({ queryKey: ['animals'] });
  };
  return (
    <>
      <button onClick={() => setOpen(!open)}>Mover</button>
      {open && <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <select value={to} onChange={e=>setTo(e.target.value)}>
          <option value="">Selecciona potrero destino</option>
          {(paddocks||[]).map((p:any)=> <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button disabled={!to} onClick={move}>Confirmar</button>
      </div>}
    </>
  );
}

export default function Animales() {
  const { companyId } = useAuth();
  const { data: rows=[] } = useQuery({
    queryKey: ['animals', companyId],
    queryFn: async () => (await api.get('/animals', { params: { companyId } })).data,
    enabled: !!companyId
  });
  const { q, setQ, filtered } = useTableFilter(rows, ['tagId','species','sex','status'] as any);

  return (
    <div>
      <h1>Animales</h1>
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <input placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={() => exportToExcel(filtered || [], 'animales.xlsx')}>Exportar Excel</button>
        <a href="/animales/importar">Importar CSV</a>
      
      <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:8 }}>
        <input placeholder="Lot ID destino" id="lotIdInput" />
        <button onClick={async()=>{
          const lotId = (document.getElementById('lotIdInput') as HTMLInputElement).value;
          const ids = (filtered||[]).filter((a:any)=>a._selected).map((a:any)=>a.id);
          for (const id of ids) { await api.patch('/animals/'+id, { lotId }); }
          location.reload();
        }} disabled={!filtered?.some?.((a:any)=>a._selected)}>Asignar a Lote</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead><tr><th></th><th>ID</th><th>Caravana</th><th>Especie</th><th>Sexo</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {(filtered || []).map((a: any, idx:number) => (
            <tr key={a.id}>
              <td><input type='checkbox' onChange={e=>{ (filtered as any)[idx]._selected = e.target.checked; }}/></td>
              <td>{a.id}</td><td>{a.tagId}</td><td>{a.species}</td><td>{a.sex}</td><td>{a.status}</td>
              <td><MoveAnimalButton animal={a} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
