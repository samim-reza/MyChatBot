"""Helpers for current-date and birthday calculations."""
from datetime import date, datetime
import re
from zoneinfo import ZoneInfo


SAMIM_BIRTH_DATE = date(2000, 11, 21)
DEFAULT_TIMEZONE = "Asia/Dhaka"


def get_current_date(timezone_name: str = DEFAULT_TIMEZONE) -> date:
    """Return the current local date for the configured timezone."""
    return datetime.now(ZoneInfo(timezone_name)).date()


def calculate_age(current_date: date, birth_date: date = SAMIM_BIRTH_DATE) -> int:
    """Return age in whole years on the given date."""
    years = current_date.year - birth_date.year
    if (current_date.month, current_date.day) < (birth_date.month, birth_date.day):
        years -= 1
    return years


def build_birthday_context() -> dict[str, str | int]:
    """Build reusable date facts for prompt injection."""
    current_date = get_current_date()
    return {
        "current_date": current_date.strftime("%d %B %Y"),
        "age": calculate_age(current_date),
    }


def is_age_question(question: str) -> bool:
    """Return True when the user is asking about age."""
    normalized = question.lower()
    patterns = (
        r"\bhow old\b",
        r"\bage\b",
        r"\bold are you\b",
        r"\bwhat'?s your age\b",
    )
    return any(re.search(pattern, normalized) for pattern in patterns)


def build_age_response() -> str:
    """Return a safe age-only response without exposing the birth date."""
    current_date = get_current_date()
    age = calculate_age(current_date)
    return f"I am {age} years old."
