#!/usr/bin/env python3
"""Clear ChromaDB and populate with personal data from personal.json and cv.tex."""
import json
import os
from pathlib import Path
import re
from typing import Any

from services.chroma_service import reset_collection

CHUNK_SIZE = 400
DATA_DIR = Path("data")
PERSONAL_INFO_PATH = DATA_DIR / "personal.json"
CV_PATH = DATA_DIR / "cv.tex"


def flatten_json_to_text(data: Any, prefix: str = "") -> list[str]:
    texts = []
    if isinstance(data, dict):
        for key, value in data.items():
            current_key = f"{prefix}.{key}" if prefix else key
            if isinstance(value, (dict, list)):
                texts.extend(flatten_json_to_text(value, current_key))
            else:
                texts.append(f"{current_key}: {value}")
    elif isinstance(data, list):
        for i, item in enumerate(data):
            if isinstance(item, (dict, list)):
                texts.extend(flatten_json_to_text(item, f"{prefix}[{i}]"))
            else:
                texts.append(f"{prefix}[{i}]: {item}")
    return texts


def latex_to_text(content: str) -> str:
    """Convert a small subset of LaTeX CV markup into searchable plain text."""
    text = re.sub(r"(?<!\\)%.*", "", content)
    text = re.sub(r"\\href\{([^}]*)\}\{([^}]*)\}", r"\2 (\1)", text)
    text = re.sub(r"\\(?:faPhone|faEnvelope|faMapMarker|faLinkedin|faGithub|faGlobe)\b", " ", text)
    text = re.sub(r"\\section\{([^}]*)\}", r"\nSection: \1\n", text)
    text = re.sub(r"\\textbf\{([^}]*)\}", r"\1", text)
    text = re.sub(r"\\textit\{([^}]*)\}", r"\1", text)
    text = re.sub(r"\\textcolor\{[^}]*\}\{", "", text)
    text = text.replace("\\resumeSubHeadingListStart", "\n")
    text = text.replace("\\resumeSubHeadingListEnd", "\n")
    text = text.replace("\\resumeItemListStart", "\n")
    text = text.replace("\\resumeItemListEnd", "\n")
    text = re.sub(r"\\resumeSubheading\s*\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}\{([^}]*)\}", r"\1 | \2 | \3 | \4\n", text)
    text = re.sub(r"\\resumeProjectHeading\s*\{([^}]*)\}\{([^}]*)\}", r"\1 | \2\n", text)
    text = re.sub(r"\\resumeItem\{([^}]*)\}", r"- \1\n", text)
    text = re.sub(r"\\begin\{[^}]*\}|\\end\{[^}]*\}", " ", text)
    text = re.sub(r"\\[a-zA-Z]+\*?(?:\[[^]]*\])?(?:\{[^}]*\})?", " ", text)
    text = text.replace("\\&", "&")
    text = text.replace("\\%", "%")
    text = text.replace("\\quad", " ")
    text = text.replace("\\vert", "|")
    text = text.replace("\\\\", "\n")
    text = re.sub(r"[{}$]", " ", text)
    text = re.sub(r"\s+\n", "\n", text)
    text = re.sub(r"\n{2,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def extract_cv_sections(content: str) -> list[tuple[str, str]]:
    """Split cv.tex into named sections with searchable plain text."""
    matches = list(re.finditer(r"\\section\{([^}]*)\}", content))
    sections: list[tuple[str, str]] = []
    for index, match in enumerate(matches):
        section_name = match.group(1).strip()
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(content)
        section_body = content[start:end].strip()
        plain_text = latex_to_text(section_body)
        if plain_text:
            sections.append((section_name, plain_text))
    return sections


def chunk_text(text: str, max_len: int = CHUNK_SIZE) -> list[str]:
    if len(text) <= max_len:
        return [text]
    words = text.split()
    chunks, current = [], []
    current_len = 0
    for word in words:
        if current_len + len(word) + 1 > max_len and current:
            chunks.append(" ".join(current))
            current, current_len = [], 0
        current.append(word)
        current_len += len(word) + 1
    if current:
        chunks.append(" ".join(current))
    return chunks


def build_structured_section_documents(data: dict) -> list[dict]:
    """Create semantically rich documents so retrieval works for natural questions."""
    documents = []
    doc_index = 0

    identity = data.get("basic_identity", {})
    if identity:
        summary = (
            f"Samim Reza profile: full name {identity.get('full_name')}; "
            f"role {identity.get('current_role')}; location {identity.get('location')}; "
            f"email {identity.get('email')}; phone {identity.get('phone')}; "
            f"website {identity.get('website')}."
        )
        documents.append({
            "id": f"summary_{doc_index}",
            "text": summary,
            "metadata": {"source": "personal.json", "category": "basic_identity"},
        })
        doc_index += 1

    for category in ("education", "experience", "research", "projects", "references"):
        for item in data.get(category, []):
            if category == "education":
                text = (
                    f"Education: {item.get('degree')} at {item.get('institution')}, "
                    f"{item.get('location')}, duration {item.get('duration')}, "
                    f"CGPA/GPA {item.get('cgpa') or item.get('gpa')}."
                )
            elif category == "experience":
                responsibilities = "; ".join(item.get("responsibilities", []))
                text = (
                    f"Experience: {item.get('role')} at {item.get('organization')}, "
                    f"{item.get('location')}, duration {item.get('duration')}. "
                    f"Responsibilities: {responsibilities}."
                )
            elif category == "research":
                year_text = f", {item.get('year')}" if item.get("year") else ""
                text = (
                    f"Research and thesis-related work: {item.get('title')} "
                    f"({item.get('status')}{year_text}). "
                    f"Description: {item.get('description')}."
                )
            elif category == "projects":
                links = item.get("links", {})
                links_text = "; ".join(f"{name}: {url}" for name, url in links.items()) or "No public links listed"
                text = (
                    f"Project: {item.get('name')}. Description: {item.get('description')}."
                    f" Links: {links_text}."
                )
            else:
                text = (
                    f"Reference: {item.get('name')}, {item.get('title')} at "
                    f"{item.get('organization')}. Email: {item.get('email')}. "
                    f"Phone: {item.get('phone')}."
                )

            documents.append({
                "id": f"summary_{doc_index}",
                "text": text,
                "metadata": {"source": "personal.json", "category": category},
            })
            doc_index += 1

    achievements = data.get("competitive_programming", {}).get("achievements", [])
    if achievements:
        documents.append({
            "id": f"summary_{doc_index}",
            "text": "Competitive programming: " + "; ".join(achievements) + ".",
            "metadata": {"source": "personal.json", "category": "competitive_programming"},
        })
        doc_index += 1

    awards = data.get("awards", [])
    if awards:
        documents.append({
            "id": f"summary_{doc_index}",
            "text": "Awards and achievements: " + "; ".join(awards) + ".",
            "metadata": {"source": "personal.json", "category": "awards"},
        })

    return documents


def build_documents(data: dict) -> list[dict]:
    raw_texts = flatten_json_to_text(data)
    documents = build_structured_section_documents(data)
    for i, text in enumerate(raw_texts):
        for j, chunk in enumerate(chunk_text(text)):
            category = chunk.split(":")[0].split(".")[0] if ":" in chunk else "general"
            documents.append({
                "id": f"doc_{i}_{j}",
                "text": chunk,
                "metadata": {"source": "personal.json", "category": category},
            })
    return documents


def build_cv_documents(cv_text: str) -> list[dict]:
    documents = []
    sections = extract_cv_sections(cv_text)
    for index, (section_name, section_text) in enumerate(sections):
        chunks = chunk_text(f"CV section {section_name}: {section_text}", max_len=700)
        for chunk_index, chunk in enumerate(chunks):
            documents.append({
                "id": f"cv_{index}_{chunk_index}",
                "text": chunk,
                "metadata": {"source": "cv.tex", "category": section_name.lower().replace(' ', '_')},
            })
    return documents


def main():
    print("Clearing existing vector database...")
    collection = reset_collection()
    print("Vector database cleared.\n")

    with PERSONAL_INFO_PATH.open("r", encoding="utf-8") as f:
        personal_data = json.load(f)
    print("Loaded personal.json\n")
    with CV_PATH.open("r", encoding="utf-8") as f:
        cv_text = f.read()
    print("Loaded cv.tex\n")

    documents = build_documents(personal_data) + build_cv_documents(cv_text)
    print(f"Prepared {len(documents)} document chunks\n")

    collection.upsert(
        ids=[doc["id"] for doc in documents],
        documents=[doc["text"] for doc in documents],
        metadatas=[doc["metadata"] for doc in documents],
    )

    count = collection.count()
    print("=" * 60)
    print(f"ChromaDB population complete: {count} documents")
    print(f"Database location: {os.path.abspath(str(DATA_DIR / 'chroma_db'))}")
    print("=" * 60)


if __name__ == "__main__":
    main()
