'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const TourCoach = dynamic(() => import('@/components/TourCoach'), { ssr: false });
import { api, flushOutbox } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useAuth, hasRole } from '@/lib/auth';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Shell({ children }: { children: React.ReactNode }) {
  const { token, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [fieldMode, setFieldMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifCount, setNotifCount] = useState<number>(0);
  const { companyId } = useAuth();

  useEffect(() => {
    if (!token && pathname !== '/login') router.replace('/login');
    const saved = localStorage.getItem('fieldMode'); setFieldMode(saved === '1');
    const d = localStorage.getItem('darkMode'); setDarkMode(d === '1');
  }, [token, pathname, router]);

  useEffect(() => {
    if (fieldMode) document.body.style.fontSize = '18px', document.body.style.lineHeight='1.6'; else document.body.style.fontSize = '', document.body.style.lineHeight='';
    document.body.dataset.theme = darkMode ? 'dark' : 'light';
    localStorage.setItem('fieldMode', fieldMode ? '1':'0');
    localStorage.setItem('darkMode', darkMode ? '1':'0');
  }, [fieldMode]);

  useEffect(()=>{ let t: any; const load=async()=>{ if(companyId){ try{ const r = await api.get('/notifications/count',{ params:{ companyId, status:'unread' } }); setNotifCount(r.data.count||0);}catch{} } t=setTimeout(load, 20000); }; load(); return ()=>clearTimeout(t); },[companyId]);

  if (!token && pathname !== '/login') return <div />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: pathname === '/login' ? '1fr' : '260px 1fr', minHeight: '100vh' }}>
      {pathname !== '/login' && (
        <aside style={{ padding: 16, borderRight: '1px solid #eee' }}>
          <h2>Agro</h2>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>{user?.email}</div>
          <nav style={{ display: 'grid', gap: 8 }}>
            <a href="/ayuda/checklist">Ayuda / Checklist</a>
            <Link href="/buscar">Buscar</Link>
            <Link href="/">Dashboard</Link>
            <Link href="/dashboards/empresa">Dashboard empresa</Link>
            <Link href="/sanidad/calendario">Sanidad</Link>
            <Link href="/sanidad/registros">• Registros</Link>
            <Link href="/sanidad/calendario/pdf">• Calendario PDF</Link>
            <Link href="/animales">Animales</Link>
            <Link href="/campos/potreros">Potreros</Link>
            <Link href="/comercial">Comercial</Link>
            <Link href="/comercial/resumen">• Resumen comercial</Link>
            <Link href="/comercial/ventas">• Ventas</Link>
            <Link href="/comercial/compras">• Compras</Link>
            {hasRole(user, ['OWNER','ADMIN','ACCOUNTANT']) && <Link href="/contabilidad">Contabilidad</Link>}
            {hasRole(user, ['OWNER','ADMIN','ACCOUNTANT']) && <Link href="/contabilidad/resultados">• Resultados</Link>}
            {hasRole(user, ['OWNER','ADMIN','ACCOUNTANT']) && <Link href="/contabilidad/balance">• Balance</Link>
            <Link href="/contabilidad/periodos">• Cierres de período</Link>}
            {hasRole(user, ['OWNER','ADMIN']) && <Link href="/admin/permisos">Permisos</Link>
            <Link href="/admin/series">Series</Link>}
            {hasRole(user, ['OWNER','ADMIN','ACCOUNTANT']) && <Link href="/finanzas/cuentas-corrientes">Cuentas corrientes</Link>}
            {hasRole(user, ['OWNER','ADMIN','ACCOUNTANT']) && <Link href="/finanzas/cobranzas">• Cobranzas</Link>}
            {hasRole(user, ['OWNER','ADMIN','ACCOUNTANT']) && <Link href="/finanzas/pagos">• Pagos</Link>}
            <Link href="/auditoria">Auditoría</Link>
            <Link href="/feedback">Feedback</Link>
            <Link href="/reportes/demo">PDF demo</Link>
            <Link href="/notificaciones">Notificaciones {notifCount>0 && <span style={{background:'#ef4444',color:'#fff',borderRadius:8,padding:'0 6px',marginLeft:6}}>{notifCount}</span>}</Link>
          </nav>
          <div style={{ marginTop: 12, display:'grid', gap:8 }}>
            <label style={{ display:'flex', gap:8, alignItems:'center' }}>
              <input type="checkbox" checked={fieldMode} onChange={e=>setFieldMode(e.target.checked)} />
              Modo campo (táctil/alto contraste)
            </label>
            <div style={{ display:'grid', gap:6 }}>
            <label style={{ display:'flex', gap:8, alignItems:'center' }}>
              <input type="checkbox" checked={darkMode} onChange={e=>setDarkMode(e.target.checked)} />
              Modo oscuro
            </label>
            <button onClick={async()=>{ const r = await flushOutbox(); alert(`Sincronizado: ${r.flushed} enviados, ${r.pending} pendientes`); }}>Sincronizar (offline→online)</button>
          </div>
        </div>
          <button style={{ marginTop: 16 }} onClick={() => { logout(); router.replace('/login'); }}>Cerrar sesión</button>
        </aside>
      )}
      <main style={{ padding: 24 }}>
        <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', color:'#9a3412', borderRadius:12, padding:8, marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div><strong>BETA</strong> — Gracias por probar. Envía <a href='/feedback'>feedback</a> o <a href='/soporte/logs'>descarga logs</a>.</div>
          <div style={{ display:'flex', gap:8 }}>
            <a href='/ayuda/checklist'>Checklist</a>
            <button onClick={()=>{ localStorage.removeItem('tourDone'); location.reload(); }}>Iniciar tour</button>
          </div>
        </div>
        {children}
        <TourCoach />
      </main>
    </div>
  );
}
