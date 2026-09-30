export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '2rem' }}>
      <header>
        <h1 style={{ color: '#1E3A8A' }}>Campus Navigator</h1>
        <p>Interactive indoor & outdoor campus navigation system</p>
      </header>
      <main style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <h2>System Status: Active</h2>
        <p>Frontend: React (JavaScript JSX) + Vite</p>
        <p>Backend: Python (FastAPI + NetworkX A* + PostGIS)</p>
      </main>
    </div>
  );
}
