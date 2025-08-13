export function MapLotsCard() {
  return (
    <div style={{ background:'#fff', border:'1px solid #E5E7EB', borderRadius:16, padding:16, boxShadow:'0 1px 2px rgba(0,0,0,0.04)' }}>
      <div style={{ marginBottom:12 }}><h3 style={{ margin:0 }}>Lotes</h3></div>
      <div style={{ position:'relative', height:320, borderRadius:12, overflow:'hidden', background:'#e5e7eb' }}>
        {/* Imagen/placeholder */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(45deg,#eef2ff,#f8fafc)' }} />
        {/* Polígono verde */}
        <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position:'absolute', inset:0 }}>
          <polygon points="5,10 55,10 55,60 35,60 35,85 5,85" fill="#94D08E" stroke="#fff" strokeWidth="1" />
          <circle cx="30" cy="55" r="2.5" fill="#111" />
          {/* Polígono beige */}
          <polygon points="60,15 95,20 95,70 60,70" fill="#E9DCC0" stroke="#fff" strokeWidth="1" />
          <circle cx="75" cy="45" r="2.5" fill="#111" />
        </svg>
        <div style={{ position:'absolute', left:8, bottom:6, fontSize:12, color:'#6B7280' }}>Google</div>
      </div>
    </div>
  );
}
