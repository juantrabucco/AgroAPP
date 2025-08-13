'use client';
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function BarSalesChart({ data }: { data: { mes: string; ventas: number }[] }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:16, padding:16, boxShadow:'0 1px 2px rgba(0,0,0,0.04)', height:320 }}>
      <h3 style={{ margin:'0 0 12px 0' }}>Ventas mensuales 2024</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid stroke="#F3F4F6" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="ventas" fill="#E9DCC0" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
