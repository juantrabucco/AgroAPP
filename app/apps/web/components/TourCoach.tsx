'use client';
import { useEffect, useState } from 'react';

type Step = { title: string; desc: string };

const STEPS: Step[] = [
  { title: 'Bienvenido', desc: 'Este es un tour rápido por las secciones claves: Comercial, Sanidad, Animales y Contabilidad.' },
  { title: 'Comercial', desc: 'Carga Ventas y Compras, descarga PDFs, filtra y exporta Excel.' },
  { title: 'Sanidad', desc: 'Planifica eventos, genera el calendario PDF y recibe recordatorios.' },
  { title: 'Animales', desc: 'Gestiona animales, lotes, potreros y movimientos.' },
  { title: 'Contabilidad', desc: 'Revisa Resultados y Balance; cierra periodos.' },
  { title: 'Notificaciones', desc: 'Mira vencimientos y mensajes del sistema con badge.' },
];

export default function TourCoach() {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(()=>{
    const seen = localStorage.getItem('tourDone');
    if (!seen) setOpen(true);
  },[]);

  const close = () => { setOpen(false); localStorage.setItem('tourDone','1'); };

  if (!open) return null;
  const s = STEPS[idx];

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:9999, display:'grid', placeItems:'center' }}>
      <div style={{ width:420, background:'#fff', color:'#111', borderRadius:12, padding:16, boxShadow:'0 10px 30px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize:12, color:'#666' }}>Paso {idx+1} / {STEPS.length}</div>
        <h2 style={{ margin:'6px 0 8px' }}>{s.title}</h2>
        <p style={{ margin:0 }}>{s.desc}</p>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:12 }}>
          <button onClick={()=> setIdx(Math.max(0, idx-1))} disabled={idx===0}>Anterior</button>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=> localStorage.removeItem('tourDone') || setIdx(0)}>Reiniciar</button>
            {idx < STEPS.length - 1 ? (
              <button onClick={()=> setIdx(idx+1)}>Siguiente</button>
            ) : (
              <button onClick={close}>Terminar</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
