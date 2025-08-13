'use client';
import React from 'react';

export function MetricCard({
  title, value, subtitle, tone = 'default', icon,
}: { title: string; value: React.ReactNode; subtitle?: React.ReactNode; tone?: 'default'|'danger'|'warning'; icon?: React.ReactNode }) {
  const color = tone === 'danger' ? '#DC2626' : tone === 'warning' ? '#D97706' : '#111827';
  return (
    <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:16, padding:16, boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, color:'#6B7280', fontSize:14 }}>
        {icon}<span>{title}</span>
      </div>
      <div style={{ marginTop:6, fontSize:32, fontWeight:700, color }}>{value}</div>
      {subtitle ? <div style={{ marginTop:4, color:'#6B7280', fontSize:12 }}>{subtitle}</div> : null}
    </div>
  );
}
