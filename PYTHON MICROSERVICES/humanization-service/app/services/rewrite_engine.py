import re
import json
import time
import os
from groq import Groq
from dotenv import load_dotenv
from app.services.translator import translate_to_english, translate_to_telugu

load_dotenv()
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# ── Tone map (kept tight — every token counts) ───────────────────────────────
TONE_PROMPTS = {
    "aggressive":   "Urgent, punchy. Lead with the most shocking fact. Short sentences.",
    "professional": "Clear, factual, authoritative. Most important fact first.",
    "meme":         "Casual, like texting a friend. Factual but conversational.",
    "emotional":    "Lead with human impact. Make the reader feel the weight.",
    "editorial":    "Insightful. Why it matters. Context-aware, thought-provoking.",
}

ALLOWED_CATEGORIES = {
    "politics",
    "business",
    "technology",
    "sports",
    "entertainment",
    "health",
    "science",
    "international",
    "crime",
    "education",
    "lifestyle",
    "local",
    "general"
}

# ── System prompt (lean — no wasted tokens) ──────────────────────────────────
SYSTEM_PROMPT = """
You are a senior Reuters, AP and InShorts editor.

Rewrite the article into a factual news summary.

Rules:

1. First sentence must identify the person, company, product, event, city, country, or organization involved.

2. Never start with:
- However
- But
- Also
- Meanwhile
- This
- These

3. Never use clickbait.

4. Never write like an advertisement.

5. Reader must understand the story without opening the article.

6. Use proper nouns whenever available.

7. Keep summary between 60 and 80 words.

8. Category must be one of:
- politics
- business
- technology
- sports
- entertainment
- health
- science
- international
- crime
- education
- lifestyle
- local
- general

9. Generate exactly 4 tags.

10. Tags must be keywords, not sentences.

Return ONLY valid JSON:

{
  "summary": "...",
  "category": "...",
  "tags": ["...", "...", "...", "..."]
}
"""

def rewrite_content(title: str, content: str, tone: str = "professional") -> dict:
    """
    Returns:
        {
            "summary": str,
            "category": str,
            "tags": list[str],
            "translated_title":   {"en": str, "te": str},
            "translated_summary": {"en": str, "te": str},
        }
    On hard failure falls back to a cleaned excerpt.
    """
    if not content or len(content.strip()) < 50:
        return _error_result(title, content)

    # ── Telugu detection → translate once upfront ────────────────────────────
    if re.search(r'[\u0C00-\u0C7F]', content):
        print("[rewrite_engine] Telugu detected — translating to English")
        content = translate_to_english(content)
        title   = translate_to_english(title)

    content = _pre_clean(content)
    tone    = tone.lower() if tone.lower() in TONE_PROMPTS else "professional"

    # ── Build user prompt (greedy: only what Groq needs) ─────────────────────
    user_prompt = (
        f"Headline: {title}\n"
        f"Tone: {TONE_PROMPTS[tone]}\n"
        f"Content:\n{content[:2000]}\n\n"          # cap at 1000 chars — enough signal
        f"Categories allowed: {', '.join(sorted(ALLOWED_CATEGORIES))}\n"
        "Write 60-80 words. Output minified JSON only."   # ← explicit reminder
    )

    # ── Call Groq ─────────────────────────────────────────────────────────────
    try:
        print("[Groq] Sleeping 6s for rate limit...")
        time.sleep(6)

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_prompt},
            ],
            temperature=0.4,        # lower = more consistent JSON
            max_tokens=280,         # summary(~80) + category(~10) + tags(~30) + json overhead
            stop=None,
        )

        raw = response.choices[0].message.content.strip()
        print(f"[Groq] Raw response:\n{raw}")

        parsed = _safe_parse(raw)

    except Exception as e:
        print(f"[rewrite_engine] Groq error: {e}")
        parsed = None

    # ── Build final result ────────────────────────────────────────────────────
    if parsed:
        summary_en  = parsed["summary"]
        category    = parsed["category"]
        tags        = parsed["tags"]


    else:
        # graceful degradation — still return something useful
        summary_en  = _fallback_clean(content)
        category    = "general"
        tags        = []

    return {
        "summary":  summary_en,
        "category": category,
        "tags":     tags,
        "translated_title": {
            "en": title,
            "te": translate_to_telugu(title),
        },
        "translated_summary": {
            "en": summary_en,
            "te": translate_to_telugu(summary_en),
        },
    }


# ── Helpers ───────────────────────────────────────────────────────────────────

def _safe_parse(raw: str) -> dict | None:
    """
    Robustly parse Groq output.
    Handles: perfect JSON, JSON wrapped in ```json fences, partial objects.
    """
    # Strip markdown fences if present
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned).strip()

    # Try direct parse first (fastest path)
    try:
        data = json.loads(cleaned)
        return _validate(data)
    except json.JSONDecodeError:
        pass

    # Try extracting first {...} block (handles trailing text)
    match = re.search(r'\{.*\}', cleaned, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group())
            return _validate(data)
        except json.JSONDecodeError:
            pass

    print("[rewrite_engine] Could not parse Groq JSON — falling back")
    return None


def _validate(data: dict) -> dict:
    """Sanitise parsed JSON fields."""
    summary  = str(data.get("summary", "")).strip()
    category = str(data.get("category", "general")).strip().lower()
    tags     = data.get("tags", [])

    BAD_SUMMARY_STARTS = [
        "however",
        "but",
        "also",
        "meanwhile",
        "this",
        "these"
    ]

    summary_lower = summary.lower().strip()

    if any(
            summary_lower.startswith(word)
            for word in BAD_SUMMARY_STARTS
    ):
        raise ValueError("Bad summary start")

    if not summary:
        raise ValueError("Empty summary")

    if category not in ALLOWED_CATEGORIES:
        category = "general"

    if not isinstance(tags, list):
        tags = []

    tags = [str(t).strip() for t in tags if str(t).strip()][:4]

    return {"summary": summary, "category": category, "tags": tags}


def _pre_clean(text: str) -> str:
    """Strip junk before sending to Groq — fewer tokens, better output."""
    junk_patterns = [
        r'click here to follow[^\n]*',
        r'also read\s*[:|][^\n]*',
        r'follow us on[^\n]*',
        r'subscribe(?: to| now)?[^\n]*',
        r'follow[^\n]*(facebook|twitter|instagram|youtube|telegram)[^\n]*',
        r'get the latest[^\n]*',
        r'stay updated[^\n]*',
        r'download (the )?app[^\n]*',
        r'sign up[^\n]*',
        r'newsletter[^\n]*',
        r'disclaimer[^\n]*',
        r'advertisement',
        r'sponsored content',
        r'you are logged in[^\n]*',
        r'loading\.\.\.[^\n]*',
        r'your active subscription[^\n]*',
        r'login to read[^\n]*',
        r"you don't have any active subscription[^\n]*",
        r'account subscription benefits[^\n]*',
        r"products you've access to[^\n]*",
        r'listen to this article[^\n]*',
        r'cookie[^\n]*',
    ]
    for p in junk_patterns:
        text = re.sub(p, '', text, flags=re.IGNORECASE)

    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)   # markdown links → text
    text = re.sub(r'https?://\S+', '', text)                 # bare URLs
    text = re.sub(r'\s{2,}', ' ', text)                      # collapse whitespace

    # Drop lines too short to be news content
    lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 40]
    return ' '.join(lines).strip()


def _fallback_clean(content: str) -> str:
    """Last-resort excerpt when Groq fails entirely."""
    sentences = re.split(r'(?<=[.!?])\s+', content)
    good, total = [], 0
    skip_words = {'subscribe', 'login', 'sign up', 'cookie', 'advertisement', 'follow us'}
    for s in sentences:
        s = s.strip()
        if len(s) < 40:
            continue
        if any(w in s.lower() for w in skip_words):
            continue
        if total + len(s) > 600:
            break
        good.append(s)
        total += len(s)
    result = ' '.join(good).strip()
    return (result[:597] + '...') if len(result) > 500 else result


def _error_result(title: str, content: str) -> dict:
    """Returned when content is too short to process."""
    return {
        "summary":  content or title,
        "category": "general",
        "tags":     [],
        "translated_title":   {"en": title,           "te": translate_to_telugu(title)},
        "translated_summary": {"en": content or title, "te": translate_to_telugu(content or title)},
    }