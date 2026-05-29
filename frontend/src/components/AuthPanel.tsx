/**
 * Форми реєстрації та входу (крок 3).
 * Після успішного login викликає onSuccess — батьківський App оновить стан.
 */

import { useState } from "react";
import { login, register, type RegisterBody } from "../api/auth";

type Props = {
  onSuccess: () => void;
};

export default function AuthPanel({ onSuccess }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Поля логіну
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Додаткові поля реєстрації
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        const body: RegisterBody = {
          username,
          email,
          full_name: fullName,
          password,
        };
        await register(body);
        await login(username, password);
      }
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <h2>{mode === "login" ? "Login" : "Register"}</h2>

      <div className="tabs">
        <button
          type="button"
          className={mode === "login" ? "tab active" : "tab"}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={mode === "register" ? "tab active" : "tab"}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
          />
        </label>

        {mode === "register" && (
          <>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Full name
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </label>
          </>
        )}

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Login" : "Register"}
        </button>
      </form>
    </section>
  );
}
