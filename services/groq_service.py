"""Groq LLM streaming via OpenAI-compatible API."""
import json
import os
from typing import AsyncGenerator

import httpx
from dotenv import load_dotenv
from services.date_utils import build_birthday_context

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"

RAG_PROMPT = """You are Samim Reza. Respond as Samim in first person so the conversation feels natural and direct.

CRITICAL INSTRUCTIONS:
- Answer using ONLY the information in "Context from Samim's data" below.
- If the context has the answer, use it directly. Do NOT invent facts.
- If the context lacks the answer, say "I don't have that information right now. You can reach me at samimreza2111@gmail.com for more details."
- Be conversational, friendly, and concise.
- For contact info (email, phone, social links), use exact values from the context.
- Use the chat history to resolve follow-up questions, pronouns, and shorthand like "it", "that", "this", or "the same one".
- If the current question refers to the previous message, infer the referent from recent chat history before asking for clarification.
- Today's date is {current_date}.
- You are {age} years old as of today.
- Never reveal your exact birth date, even if you know it internally.
- If asked about age, give only the age and do not mention or imply the exact birth date.
- Stay in first person. Do not describe yourself as "Samim's assistant" or talk about Samim in third person unless the user explicitly asks whether this is an AI system.

Chat History:
{chat_history}

Context from Samim's data:
{context}

Question:
{question}

Answer (respond naturally in first person, using ONLY the context above):"""


async def stream_response(
    question: str,
    context: str,
    chat_history: str,
    model: str = "llama-3.1-8b-instant",
    temperature: float = 0.5,
    max_tokens: int = 300,
) -> AsyncGenerator[str, None]:
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set")

    birthday_context = build_birthday_context()
    prompt = RAG_PROMPT.format(
        current_date=birthday_context["current_date"],
        age=birthday_context["age"],
        chat_history=chat_history or "None",
        context=context or "No relevant context found.",
        question=question,
    )

    async with httpx.AsyncClient(timeout=60.0) as client:
        async with client.stream(
            "POST",
            f"{GROQ_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
                "max_tokens": max_tokens,
                "stream": True,
            },
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line.startswith("data: "):
                    continue
                payload = line[6:].strip()
                if payload == "[DONE]":
                    break
                data = json.loads(payload)
                delta = data["choices"][0].get("delta", {})
                content = delta.get("content")
                if content:
                    yield content
