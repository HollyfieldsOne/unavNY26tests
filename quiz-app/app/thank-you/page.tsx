export default function ThankYouPage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#12121a',
        border: '1px solid #1e1e2e',
        borderRadius: '16px',
        padding: '3rem 2rem',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(108,99,255,0.15)',
          border: '2px solid #6c63ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.5rem',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontWeight: 600,
          fontSize: '1.6rem',
          color: '#f0f0ff',
          lineHeight: 1.3,
        }}>
          Thank you for participating.
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          color: '#8888aa',
          fontSize: '1rem',
          lineHeight: 1.6,
        }}>
          Your responses have been recorded.
        </p>
      </div>
    </main>
  )
}
