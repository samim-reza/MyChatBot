"""Lightweight RAG chatbot using ChromaDB + Groq API."""
from typing import AsyncGenerator, Dict, List
from datetime import date
from functools import lru_cache
import json
import logging
from pathlib import Path
import re
import time

from services.chroma_service import get_collection
from services.date_utils import build_age_response, get_current_date, is_age_question
from services.groq_service import stream_response

logger = logging.getLogger(__name__)


def tokenize(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", text.lower()))


PROFILE_PATH = Path(__file__).resolve().parent / "data" / "personal.json"
MONTH_MAP = {
    "jan": 1,
    "january": 1,
    "feb": 2,
    "february": 2,
    "mar": 3,
    "march": 3,
    "apr": 4,
    "april": 4,
    "may": 5,
    "jun": 6,
    "june": 6,
    "jul": 7,
    "july": 7,
    "aug": 8,
    "august": 8,
    "sep": 9,
    "sept": 9,
    "september": 9,
    "oct": 10,
    "october": 10,
    "nov": 11,
    "november": 11,
    "dec": 12,
    "december": 12,
}
FOLLOW_UP_PATTERNS = (
    r"^sure\??$",
    r"^really\??$",
    r"^are you sure\??$",
    r"^why\??$",
    r"^how\??$",
    r"^what about that\??$",
    r"^what about it\??$",
    r"^and\??$",
    r"^then\??$",
)


class SamimBot:
    def __init__(self, max_history_turns: int = 6, compact_keep_turns: int = 4):
        self.max_history_turns = max_history_turns
        self.compact_keep_turns = compact_keep_turns
        self.recent_turns: List[Dict[str, str]] = []
        self.compacted_history = ""
        self.profile = self._load_profile()

    def _get_collection(self):
        # Resolve a fresh Chroma handle so a recreated collection doesn't leave us
        # holding a stale UUID-backed object after population or deploy steps.
        return get_collection()

    @staticmethod
    @lru_cache(maxsize=1)
    def _load_profile() -> dict:
        try:
            with PROFILE_PATH.open("r", encoding="utf-8") as file:
                return json.load(file)
        except Exception as exc:
            logger.warning(f"Unable to load personal profile: {exc}")
            return {}

    def _compact_history(self) -> None:
        if len(self.recent_turns) <= self.max_history_turns:
            return

        turns_to_compact = self.recent_turns[:-self.compact_keep_turns]
        kept_turns = self.recent_turns[-self.compact_keep_turns:]
        summary_lines = []
        for turn in turns_to_compact:
            question = turn["question"].strip().replace("\n", " ")
            answer = turn["answer"].strip().replace("\n", " ")
            summary_lines.append(f"- User asked: {question}")
            summary_lines.append(f"  Assistant answered: {answer}")

        new_summary = "Earlier conversation summary:\n" + "\n".join(summary_lines)
        if self.compacted_history:
            self.compacted_history = f"{self.compacted_history}\n{new_summary}"
        else:
            self.compacted_history = new_summary
        self.recent_turns = kept_turns

    async def update_history(self, question: str, answer: str):
        self.recent_turns.append({"question": question, "answer": answer})
        self._compact_history()

    def _get_last_turn(self) -> Dict[str, str] | None:
        if not self.recent_turns:
            return None
        return self.recent_turns[-1]

    async def get_history(self) -> str:
        recent_history_lines: List[str] = []
        for index, turn in enumerate(self.recent_turns, start=1):
            recent_history_lines.append(f"Turn {index} HUMAN: {turn['question']}")
            recent_history_lines.append(f"Turn {index} AI: {turn['answer']}")

        history_parts = []
        if self.compacted_history:
            history_parts.append(self.compacted_history)
        if recent_history_lines:
            history_parts.append(
                "Recent conversation window (most recent turns kept verbatim):\n"
                + "\n".join(recent_history_lines)
            )
        return "\n\n".join(history_parts)

    def _is_vague_follow_up(self, question: str) -> bool:
        normalized = question.strip().lower()
        if any(re.fullmatch(pattern, normalized) for pattern in FOLLOW_UP_PATTERNS):
            return True
        if len(tokenize(normalized)) <= 4 and any(word in normalized for word in ("it", "that", "this", "same")):
            return True
        return False

    def _expand_follow_up_question(self, question: str) -> str:
        last_turn = self._get_last_turn()
        if not last_turn or not self._is_vague_follow_up(question):
            return question
        return (
            "This is a follow-up to the previous conversation. "
            f"Previous user question: {last_turn['question']} "
            f"Previous assistant answer: {last_turn['answer']} "
            f"Current follow-up question: {question}"
        )

    def _build_confirmation_response(self, question: str) -> str | None:
        last_turn = self._get_last_turn()
        if not last_turn:
            return None

        normalized = question.strip().lower()
        if normalized not in {"sure?", "sure", "really?", "really", "are you sure?", "are you sure"}:
            return None

        last_question = last_turn["question"]
        last_answer = last_turn["answer"]
        if is_age_question(last_question):
            return f"Yes. {last_answer}"
        if self._is_current_role_question(last_question):
            return f"Yes. {last_answer}"
        return None

    def _parse_duration_part(self, part: str, fallback_year: int | None = None) -> tuple[int | None, int | None]:
        normalized = part.strip().lower().replace(".", "")
        if normalized in {"present", "current", "now"}:
            today = get_current_date()
            return today.year, today.month

        year_match = re.search(r"\b(20\d{2}|19\d{2})\b", normalized)
        year = int(year_match.group(1)) if year_match else fallback_year

        month = None
        for name, value in MONTH_MAP.items():
            if re.search(rf"\b{name}\b", normalized):
                month = value
                break

        if month is None and year is not None:
            month = 1
        return year, month

    def _duration_to_months(self, duration: str) -> int | None:
        normalized = re.sub(r"\s+", " ", duration.replace("–", "-").replace("—", "-")).strip()
        if "-" not in normalized:
            return None

        left, right = [part.strip() for part in normalized.split("-", 1)]
        right_year, _ = self._parse_duration_part(right)
        start_year, start_month = self._parse_duration_part(left, fallback_year=right_year)
        end_year, end_month = self._parse_duration_part(right, fallback_year=start_year)

        if None in {start_year, start_month, end_year, end_month}:
            return None

        return max(0, (end_year - start_year) * 12 + (end_month - start_month))

    def _format_months_as_experience(self, months: int) -> str:
        years = months // 12
        remaining_months = months % 12
        parts = []
        if years:
            parts.append(f"{years} year" + ("s" if years != 1 else ""))
        if remaining_months:
            parts.append(f"{remaining_months} month" + ("s" if remaining_months != 1 else ""))
        return " ".join(parts) if parts else "less than a month"

    def _is_experience_duration_question(self, question: str) -> bool:
        normalized = question.lower()
        patterns = (
            r"\bhow many years of working experience\b",
            r"\bhow many years of work experience\b",
            r"\bhow many years of experience\b",
            r"\bhow long have you worked\b",
            r"\bfor how many years\b",
            r"\bwork experience\b",
        )
        return any(re.search(pattern, normalized) for pattern in patterns)

    def _build_experience_duration_response(self, question: str) -> str | None:
        if not self._is_experience_duration_question(question):
            return None

        experience = self.profile.get("experience", [])
        current_experience = next(
            (item for item in experience if "present" in str(item.get("duration", "")).lower()),
            None,
        )
        last_turn = self._get_last_turn()
        normalized = question.strip().lower()

        if current_experience and last_turn and (
            self._is_current_role_question(last_turn["question"])
            or normalized in {"for how many years", "for how many years?", "how long", "how long?"}
        ):
            duration = current_experience.get("duration", "")
            months = self._duration_to_months(duration)
            if months is not None:
                formatted = self._format_months_as_experience(months)
                role = current_experience.get("role", "my current role")
                organization = current_experience.get("organization", "my current company")
                return f"I have been working as a {role} at {organization} for about {formatted}."

        valid_months = [
            months
            for item in experience
            if (months := self._duration_to_months(str(item.get("duration", "")))) is not None
        ]
        if experience and valid_months:
            earliest_start = min(
                (
                    self._parse_duration_part(str(item.get("duration", "")).replace("–", "-").replace("—", "-").split("-", 1)[0].strip(),
                                              fallback_year=get_current_date().year)
                    for item in experience
                ),
                key=lambda value: (value[0] or 9999, value[1] or 12),
            )
            if earliest_start[0] is not None and earliest_start[1] is not None:
                today = get_current_date()
                span_months = max(0, (today.year - earliest_start[0]) * 12 + (today.month - earliest_start[1]))
                formatted = self._format_months_as_experience(span_months)
                return f"I have about {formatted} of working experience, counting my roles from {date(earliest_start[0], earliest_start[1], 1).strftime('%B %Y')} onward."

        return None

    def _is_current_role_question(self, question: str) -> bool:
        normalized = question.lower()
        patterns = (
            r"\bcurrent role\b",
            r"\bcurrently where are you working\b",
            r"\bwhere are you working now\b",
            r"\bwhere do you work\b",
            r"\bwhere do you work now\b",
            r"\bwhat do you do now\b",
            r"\bwhat is your current job\b",
            r"\bwhat is your current role\b",
            r"\bwhere are you currently working\b",
            r"\bcurrent position\b",
        )
        return any(re.search(pattern, normalized) for pattern in patterns)

    def _build_current_role_response(self) -> str | None:
        identity = self.profile.get("basic_identity", {})
        current_role = identity.get("current_role")
        experience = self.profile.get("experience", [])
        current_experience = next(
            (item for item in experience if "present" in str(item.get("duration", "")).lower()),
            None,
        )

        if current_experience:
            role = current_experience.get("role")
            organization = current_experience.get("organization")
            location = current_experience.get("location")
            if role and organization:
                location_part = f" ({location})" if location else ""
                return f"I currently work as a {role} at {organization}{location_part}."

        if current_role:
            return f"I currently work as a {current_role}."

        return None

    def _keyword_rank_documents(self, question: str, limit: int) -> list[str]:
        query_tokens = tokenize(question)
        all_docs = self._get_collection().get(include=["documents", "metadatas"])
        documents = all_docs.get("documents", [])
        metadatas = all_docs.get("metadatas", [])
        scored_docs: list[tuple[int, int, str]] = []

        for index, document in enumerate(documents):
            doc_tokens = tokenize(document)
            overlap = len(query_tokens & doc_tokens)
            metadata = metadatas[index] if index < len(metadatas) else {}
            category = str(metadata.get("category", "")).lower()
            bonus = 0

            if any(term in query_tokens for term in {"research", "thesis", "paper", "publication", "published"}):
                if "research" in category:
                    bonus += 6
                if "cv" in str(metadata.get("source", "")).lower():
                    bonus += 2

            if any(term in query_tokens for term in {"project", "projects"}):
                if "project" in category:
                    bonus += 4

            if any(term in query_tokens for term in {"experience", "work", "job"}):
                if "experience" in category:
                    bonus += 4

            if overlap or bonus:
                scored_docs.append((overlap + bonus, index, document))

        scored_docs.sort(key=lambda item: (-item[0], item[1]))
        return [document for score, _, document in scored_docs[:limit] if score > 0]

    async def _get_relevant_context(self, question: str, limit: int = 12) -> str:
        t_start = time.perf_counter()
        result = self._get_collection().query(query_texts=[question], n_results=limit)
        vector_docs = result.get("documents", [[]])[0]
        keyword_docs = self._keyword_rank_documents(question, limit=limit)
        documents: list[str] = []
        seen = set()
        for document in keyword_docs + vector_docs:
            if document and document not in seen:
                seen.add(document)
                documents.append(document)
        t_end = time.perf_counter()
        logger.info(f"[TIMING] Hybrid search: {len(documents)} docs in {t_end - t_start:.3f}s")
        return "\n\n".join(documents)

    async def ask_bot(self, question: str) -> AsyncGenerator[Dict[str, str], None]:
        start_total = time.perf_counter()
        try:
            confirmation_response = self._build_confirmation_response(question)
            if confirmation_response:
                await self.update_history(question, confirmation_response)
                yield {"type": "chunk", "content": confirmation_response}
                return

            experience_duration_response = self._build_experience_duration_response(question)
            if experience_duration_response:
                await self.update_history(question, experience_duration_response)
                yield {"type": "chunk", "content": experience_duration_response}
                return

            if is_age_question(question):
                safe_answer = build_age_response()
                await self.update_history(question, safe_answer)
                yield {"type": "chunk", "content": safe_answer}
                return

            if self._is_current_role_question(question):
                current_role_answer = self._build_current_role_response()
                if current_role_answer:
                    await self.update_history(question, current_role_answer)
                    yield {"type": "chunk", "content": current_role_answer}
                    return

            effective_question = self._expand_follow_up_question(question)
            chat_history = await self.get_history()
            docs_content = await self._get_relevant_context(effective_question)

            full_content = ""
            llm_start = time.perf_counter()
            first_chunk = True

            async for chunk in stream_response(
                question=effective_question,
                context=docs_content,
                chat_history=chat_history,
            ):
                if first_chunk:
                    logger.info(f"[TIMING] LLM first chunk after {time.perf_counter() - llm_start:.3f}s")
                    first_chunk = False
                full_content += chunk
                yield {"type": "chunk", "content": chunk}

            logger.info(f"[TIMING] Total response time: {time.perf_counter() - start_total:.3f}s")
            await self.update_history(question, full_content)

        except Exception as e:
            logger.error(f"[ERROR] ask_bot: {e}")
            yield {"type": "error", "content": str(e)}


class SessionManager:
    """Keeps one SamimBot (and its chat history) per visitor session.

    Without this every visitor shared a single global history, so answers
    from one visitor leaked into another's follow-up questions.
    """

    def __init__(self, ttl_seconds: int = 1800, max_sessions: int = 500):
        self.ttl_seconds = ttl_seconds
        self.max_sessions = max_sessions
        self._sessions: Dict[str, Dict] = {}

    def _evict(self) -> None:
        now = time.monotonic()
        expired = [
            key
            for key, entry in self._sessions.items()
            if now - entry["last_used"] > self.ttl_seconds
        ]
        for key in expired:
            del self._sessions[key]

        while len(self._sessions) >= self.max_sessions:
            oldest = min(self._sessions, key=lambda key: self._sessions[key]["last_used"])
            del self._sessions[oldest]

    def get_bot(self, session_id: str) -> SamimBot:
        self._evict()
        entry = self._sessions.get(session_id)
        if entry is None:
            entry = {"bot": SamimBot()}
            self._sessions[session_id] = entry
        entry["last_used"] = time.monotonic()
        return entry["bot"]
