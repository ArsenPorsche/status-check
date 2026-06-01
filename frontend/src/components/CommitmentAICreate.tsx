/**
 * Створення через AI — POST /commitments/ai-create.
 */

import { useState } from "react";
import { aiCreateFromText } from "../api/commitments";
import { LIMITS } from "../config";

type Props = {
  onCreated: () => void;
};

export default function CommitmentAICreate({ onCreated }: Props) {
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await aiCreateFromText(rawText);
      setRawText("");
      onCreated();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form create-form" onSubmit={handleSubmit}>
      <h3>Create with AI</h3>
      <p className="hint">
        Example: Misha promised to deliver the API for Backend by 02.06.26 15:00.
        Anna is the reviewer.
      </p>

      <label>
        Text
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={4}
          required
          minLength={3}
          maxLength={LIMITS.aiRawText}
          placeholder="Paste meeting notes or chat message…"
        />
      </label>

      {error && <p className="error">{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "AI is parsing…" : "Parse and create"}
      </button>
    </form>
  );
}
