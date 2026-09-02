export default function Loading() {
  return (
    <div
      aria-label="Cargando KevDev"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#0c0f17',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
      }}
    >
      {/* Electric Cyan Pulsating Loader */}
      <div
        style={{
          position: 'relative',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: '2px solid rgba(0, 229, 255, 0.15)',
          borderTopColor: '#00e5ff',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#e8e8e8',
          opacity: 0.85,
        }}
      >
        KevDev
      </span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
