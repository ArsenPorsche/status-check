"""
Тестові users і commitments. З кореня проєкту:

    .venv/Scripts/python -m scripts.seed_db

Пароль для всіх тестових акаунтів: password123
"""

from datetime import datetime, timedelta, timezone

from app.core.database import SessionLocal, init_db
from app.models.commitment import Commitment, CommitmentStatus
from app.models.user import User
from app.services.auth_service import hash_password

TEST_PASSWORD = "password123"

USERS = [
    {
        "username": "anna",
        "email": "anna.pm@test.local",
        "full_name": "Anna Koval",
    },
    {
        "username": "misha",
        "email": "misha.dev@test.local",
        "full_name": "Misha Petrenko",
    },
    {
        "username": "olena",
        "email": "olena.qa@test.local",
        "full_name": "Olena Shevchenko",
    },
]


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _deadline(days_from_now: int, hour: int = 17, minute: int = 0) -> datetime:
    base = _utc_now().replace(hour=hour, minute=minute, second=0, microsecond=0)
    return base + timedelta(days=days_from_now)


def main() -> None:
    init_db()
    db = SessionLocal()

    try:
        password_hash = hash_password(TEST_PASSWORD)
        users_by_username: dict[str, User] = {}

        for data in USERS:
            existing = (
                db.query(User)
                .filter(
                    (User.username == data["username"]) | (User.email == data["email"])
                )
                .first()
            )
            if existing:
                users_by_username[data["username"]] = existing
                print(f"User exists: {existing.username}")
                continue

            user = User(
                username=data["username"],
                email=data["email"],
                full_name=data["full_name"],
                hashed_password=password_hash,
            )
            db.add(user)
            db.flush()
            users_by_username[data["username"]] = user
            print(f"Created user: {data['username']}")

        anna = users_by_username["anna"]
        misha = users_by_username["misha"]
        olena = users_by_username["olena"]

        commitments = [
            Commitment(
                author_id=anna.id,
                title="Ship payments API",
                description="Stripe webhooks and refund flow",
                project="Backend",
                assignee="Misha Petrenko",
                reviewer="Anna Koval",
                deadline=_deadline(7),
                status=CommitmentStatus.TO_CHECK,
            ),
            Commitment(
                author_id=misha.id,
                title="Fix login timeout on mobile",
                description=None,
                project="Mobile",
                assignee="Misha Petrenko",
                reviewer="Anna Koval",
                deadline=_deadline(-2),
                status=CommitmentStatus.TO_CHECK,
            ),
            Commitment(
                author_id=misha.id,
                title="Dashboard v2 wireframes",
                description="Share Figma link in Slack",
                project="Frontend",
                assignee="Olena Shevchenko",
                reviewer="Anna Koval",
                deadline=_deadline(14),
                status=CommitmentStatus.DONE,
            ),
            Commitment(
                author_id=olena.id,
                title="Regression pack for release 1.4",
                description="Smoke + critical paths",
                project="QA",
                assignee="Olena Shevchenko",
                reviewer="Anna Koval",
                deadline=_deadline(3),
                status=CommitmentStatus.TO_CHECK,
            ),
            Commitment(
                author_id=anna.id,
                title="Migrate legacy cron to worker queue",
                description="Deprecate old scheduler by end of month",
                project="Backend",
                assignee="Misha Petrenko",
                reviewer="Anna Koval",
                deadline=_deadline(-10),
                status=CommitmentStatus.NOT_ACTUAL,
            ),
            Commitment(
                author_id=olena.id,
                title="Dark mode spike",
                description="Ideas only, no commitment date",
                project="Frontend",
                assignee="Olena Shevchenko",
                reviewer="Anna Koval",
                deadline=_deadline(30),
                status=CommitmentStatus.IDEAS_BACKLOG,
            ),
            Commitment(
                author_id=misha.id,
                title="Document public REST endpoints",
                description="OpenAPI + examples in README",
                project="Backend",
                assignee="Misha Petrenko",
                reviewer="Olena Shevchenko",
                deadline=_deadline(5),
                status=CommitmentStatus.TO_CHECK,
            ),
        ]

        created = 0
        for row in commitments:
            exists = (
                db.query(Commitment)
                .filter(
                    Commitment.author_id == row.author_id,
                    Commitment.title == row.title,
                )
                .first()
            )
            if exists:
                continue
            db.add(row)
            created += 1

        db.commit()
        print(f"Created {created} commitment(s).")
        print(f"Login with any test user, password: {TEST_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
