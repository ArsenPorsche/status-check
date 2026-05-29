/**
 * Об'єднує дві форми створення: ручну та AI (крок 5).
 */

import CommitmentAICreate from "./CommitmentAICreate";
import CommitmentCreateForm from "./CommitmentCreateForm";

type Props = {
  onCreated: () => void;
};

export default function CommitmentCreateSection({ onCreated }: Props) {
  return (
    <section className="panel create-section">
      <h2>New commitment</h2>
      <div className="create-grid">
        <CommitmentCreateForm onCreated={onCreated} />
        <CommitmentAICreate onCreated={onCreated} />
      </div>
    </section>
  );
}
