'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth, hasRole } from '@/lib/auth';

export default function PermisosPage() {
  const { companyId, user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ userId: '', role: 'WORKER', fieldId: '' });

  const canManage = hasRole(user, ['OWNER','ADMIN']);
  if (!canManage) return <div>No autorizado</div>;

  const load = async () => {
    const res = await api.get('/rbac/users', { params: { companyId } });
    setUsers(res.data);
  };

  const assign = async () => {
    await api.post('/rbac/assign', { ...form, companyId });
    alert('Asignado');
    await load();
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h1>Permisos por campo</h1>
      <button onClick={load}>Cargar usuarios</button>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th>Email</th><th>Roles</th></tr></thead>
        <tbody>{users.map(u => <tr key={u.id}><td>{u.email}</td><td>{u.roles.map((r:any)=> `${r.role}${r.fieldId ? ' @'+r.fieldId : ''}`).join(', ')}</td></tr>)}</tbody>
      </table>
      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
        <h3>Asignar rol</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8 }}>
          <input placeholder="User ID" value={form.userId} onChange={e=>setForm({...form, userId:e.target.value})} />
          <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
            <option>OWNER</option><option>ADMIN</option><option>FOREMAN</option><option>WORKER</option><option>ACCOUNTANT</option>
          </select>
          <input placeholder="Field ID (opcional)" value={form.fieldId} onChange={e=>setForm({...form, fieldId:e.target.value})} />
          <button onClick={assign}>Asignar</button>
        </div>
      </div>
    </div>
  );
}
