// Головний екран: крок 4 — список commitments після входу

import { useCallback, useEffect, useState } from "react";
import { fetchMe, logout, type UserResponse } from "./api/auth";
import { getToken } from "./auth/token";
import AuthPanel from "./components/AuthPanel";
import CommitmentList from "./components/CommitmentList";

function App() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  function handleLogout() {
    logout();
    setUser(null);
  }

  if (authLoading) {
    return (
      <main className="app">
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main className="app app-wide">
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
          <CommitmentList currentUserId={user.id} />
        </>
      )}
    </main>
  );
}

export default App;
