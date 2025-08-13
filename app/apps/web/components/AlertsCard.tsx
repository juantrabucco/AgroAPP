'use client';
import React from 'react';

export function AlertsCard() {
  const Row = ({ icon, title, detail, tone='default' }:{
    icon: React.ReactNode; title: string; detail?: string; tone?: 'default'|'danger'|'warning';
  }) => (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0' }}>
      <div aria-hidden style={{ width:28, height:28, borderRadius:8, background:'#F3F4F6', display:'grid', placeItems:'center' }}>{icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:600 }}>{title}</div>
        {detail && <div style={{ fontSize:13, color: tone==='danger' ? '#DC2626' : '#6B7280' }}>{detail}</div>}
      </div>
    </div>
  );

  return (
    <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:16, padding:16, boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }}>
      <h3 style={{ margin:'0 0 8px 0' }}>Alertas</h3>
      <Row icon={<span>💉</span>} title="Vacunación próxima a vencer" detail="13 alm." tone="warning" />
      <hr style={{ border:'none', borderTop:'1px solid #E5E7EB' }} />
      <Row icon={<span>🏷️</span>} title="Caravana faltante" detail="#1506" />
      <hr style={{ border:'none', borderTop:'1px solid #E5E7EB' }} />
      <Row icon={<span>⚠️</span>} title="Balance negativo" detail="-75,200 ARS" tone="danger" />
    </div>
  );
}
