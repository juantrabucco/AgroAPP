'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function Feedback() {
  const { companyId, user } = useAuth();
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState<string|undefined>();

  const enviar = async () => {
    await api.post('/feedback', { companyId, userId: user?.id, message: msg });
    setOk('¡Gracias! Registramos tu feedback.');
    setMsg('');
  };

  return <div style={{ display:'grid', gap:12 }}>
    <h1>Enviar Feedback</h1>
    <textarea rows={6} value={msg} onChange={e=>setMsg(e.target.value)} placeholder="¿Qué mejorarías? ¿Qué te gustó?"></textarea>
    <button onClick={enviar} disabled={!msg.trim()}>Enviar</button>
    {ok && <div>{ok}</div>}
  </div>;
}
