'use client';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export default function Notificaciones() {
  const { companyId } = useAuth();
  const { data: rows=[], refetch } = useQuery({ queryKey:['notifs', companyId], queryFn: async()=> (await api.get('/notifications', { params: { companyId, status: 'unread' } })).data, enabled: !!companyId });

  const leer = async (id: string) => { await api.patch(`/notifications/${id}/read`, {}); refetch(); };

  return <div style={{ display:'grid', gap:12 }}>
    <h1>Notificaciones</h1>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead><tr><th>Fecha</th><th>Título</th><th>Acción</th></tr></thead>
      <tbody>
        {(rows as any[]).map((n:any)=>(
          <tr key={n.id}>
            <td>{n.dueDate ? new Date(n.dueDate).toLocaleString() : new Date(n.createdAt).toLocaleString()}</td>
            <td>{n.title}</td>
            <td><button onClick={()=>leer(n.id)}>Marcar leída</button></td>
          </tr>
        ))}
        {(!rows || rows.length===0) && <tr><td colSpan={3}>Sin notificaciones pendientes</td></tr>}
      </tbody>
    </table>
  </div>;
}
