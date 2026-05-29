// Головний екран: крок 2 — запит до /health

import { useEffect, useState } from "react";
import { fetchHealth, type HealthResponse } from "./api/health";

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        setHealth(data);
        setError(null);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        setHealth(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="app">
      <h1>Status Check</h1>
      <p>Frontend: Vite + React + TypeScript</p>

      <section className="panel">
        <h2>Backend /health</h2>
        {loading && <p>Loading…</p>}
        {error && <p className="error">{error}</p>}
        {health && (
          <pre className="json">{JSON.stringify(health, null, 2)}</pre>
        )}
      </section>
    </main>
  );
}

export default App;
