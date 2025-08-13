'use client';
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function LineStockChart({ data }: { data: { mes: string; valor: number }[] }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:16, padding:16, boxShadow:'0 1px 2px rgba(0,0,0,0.04)', height:320 }}>
      <h3 style={{ margin:'0 0 12px 0' }}>Evolución del stock 2024</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid stroke="#F3F4F6" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="valor" stroke="#2E7D32" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
