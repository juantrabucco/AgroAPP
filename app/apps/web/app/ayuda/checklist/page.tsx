export default function Checklist() {
  return <div style={{ display:'grid', gap:12 }}>
    <h1>Checklist de Onboarding</h1>
    <ol>
      <li>Crear <strong>Campo</strong> y <strong>Lotes</strong></li>
      <li>Importar <strong>Animales</strong> (CSV) y validar</li>
      <li>Configurar <strong>Series</strong> (Ventas/Compras)</li>
      <li>Cargar <strong>Contrapartes</strong> e <strong>Items</strong></li>
      <li>Registrar primeras <strong>Ventas</strong> y <strong>Compras</strong></li>
      <li>Planificar <strong>Sanidad</strong> (Calendario + Recordatorios)</li>
      <li>Verificar <strong>Cuentas Corrientes</strong></li>
      <li>Revisar <strong>Resultados</strong> y <strong>Balance</strong></li>
      <li>Definir <strong>Cierre de Período</strong></li>
    </ol>
  </div>;
}
