'use client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState } from 'react';
import { useAuth, hasRole } from '@/lib/auth';

export default function CalendarioSanidad() {
  const [events, setEvents] = useState([
    { title: 'Vacunación Aftosa (Lote 1)', date: new Date().toISOString().slice(0,10) }
  ]);
  const { user } = useAuth();
  const puedeAplicar = hasRole(user, ['OWNER','ADMIN','FOREMAN','WORKER']);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Calendario de Sanidad</h1>
        {puedeAplicar && <button onClick={() => alert('Abrir modal: Nueva aplicación sanitaria')}>+ Aplicación sanitaria</button>}
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={(info) => {
          const title = prompt('Nueva tarea/evento sanitario:');
          if (title) setEvents([...events, { title, date: info.dateStr }]);
        }}
      />
    </div>
  );
}
