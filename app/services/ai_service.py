# AI: вільний текст → CommitmentCreate (LangChain + OpenAI)

from datetime import timezone

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from app.core.config import get_settings
from app.schemas.commitment import CommitmentAIParsed, CommitmentCreate, CommitmentStatusSchema

settings = get_settings()


def parse_text_to_commitment(raw_text: str) -> CommitmentCreate:
    """
    1) Перевіряємо ключ OpenAI.
    2) LLM з structured output повертає CommitmentAIParsed.
    3) Перетворюємо на CommitmentCreate (deadline у UTC).
    """
    if not settings.openai_api_key:
        raise ValueError("OPENAI_API_KEY is not set in .env")

    llm = ChatOpenAI(
        model=settings.openai_model,
        api_key=settings.openai_api_key,
        temperature=0,
    )
    structured_llm = llm.with_structured_output(CommitmentAIParsed)

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                (
                    "Parse text into a project commitment. "
                    "Fields: title, description, project, assignee, reviewer, deadline, status. "
                    "Default status: 'to check'. Default reviewer: 'Unknown' if missing. "
                    "Deadline as ISO 8601 UTC. Date only → 17:00 UTC that day."
                ),
            ),
            ("human", "{raw_text}"),
        ]
    )

    chain = prompt | structured_llm
    parsed: CommitmentAIParsed = chain.invoke({"raw_text": raw_text})

    deadline = parsed.deadline
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)
    else:
        deadline = deadline.astimezone(timezone.utc)

    return CommitmentCreate(
        title=parsed.title,
        description=parsed.description,
        project=parsed.project,
        assignee=parsed.assignee,
        reviewer=parsed.reviewer,
        deadline=deadline,
        status=parsed.status or CommitmentStatusSchema.TO_CHECK,
    )
