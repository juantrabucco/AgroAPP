'use client';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export default function Contabilidad() {
  const { data } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => (await axios.get(`${API}/accounting/accounts`, { params: { companyId: 'demo' } })).data
  });
  return (
    <div>
      <h1>Contabilidad</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead><tr><th>Código</th><th>Cuenta</th><th>Tipo</th></tr></thead>
        <tbody>{(data||[]).map((a:any)=> <tr key={a.id}><td>{a.code}</td><td>{a.name}</td><td>{a.type}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
