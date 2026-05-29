// Головний екран: крок 3 — login / register + /auth/me

import { useCallback, useEffect, useState } from "react";
import { fetchMe, logout, type UserResponse } from "./api/auth";
import { fetchHealth, type HealthResponse } from "./api/health";
import { getToken } from "./auth/token";
import AuthPanel from "./components/AuthPanel";

function App() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      logout();
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!user) {
      return;
    }

    fetchHealth()
      .then((data) => {
        setHealth(data);
        setHealthError(null);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Unknown error";
        setHealthError(message);
      });
  }, [user]);

  function handleLogout() {
    logout();
    setUser(null);
    setHealth(null);
  }

  if (authLoading) {
    return (
      <main className="app">
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="header">
        <h1>Status Check</h1>
        {user && (
          <button type="button" className="link-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </header>

      {!user ? (
        <AuthPanel onSuccess={loadUser} />
      ) : (
        <>
          <p className="welcome">
            Signed in as <strong>{user.full_name}</strong> (@{user.username})
          </p>

          <section className="panel">
            <h2>Backend /health</h2>
            {healthError && <p className="error">{healthError}</p>}
            {health && (
              <pre className="json">{JSON.stringify(health, null, 2)}</pre>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default App;
