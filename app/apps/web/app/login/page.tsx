'use client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('changeme');
  const [error, setError] = useState<string|undefined>();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.replace('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <form onSubmit={onSubmit} style={{ width: 360, display: 'grid', gap: 12, border: '1px solid #eee', borderRadius: 12, padding: 24 }}>
        <h1>Ingresar</h1>
        {error && <div style={{ color: 'crimson', fontSize: 14 }}>{error}</div>}
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Email</span>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Contraseña</span>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
