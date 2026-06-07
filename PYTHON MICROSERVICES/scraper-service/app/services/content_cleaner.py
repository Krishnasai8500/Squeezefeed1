import re


def clean_content(text: str) -> str:
    if not text:
        return ""

    # Remove "Click here to follow..." lines
    text = re.sub(r'click here to follow[^\n]*', '', text, flags=re.IGNORECASE)

    # Remove "ALSO READ |..." lines
    text = re.sub(r'also read\s*\|[^\n]*', '', text, flags=re.IGNORECASE)

    # Remove "Follow us on..." lines
    text = re.sub(r'follow us on[^\n]*', '', text, flags=re.IGNORECASE)

    # Remove "Subscribe to..." lines
    text = re.sub(r'subscribe to[^\n]*', '', text, flags=re.IGNORECASE)

    # Remove social media CTAs
    text = re.sub(
        r'(follow|like|share|subscribe|join).{0,50}(facebook|twitter|instagram|youtube|telegram|whatsapp)[^\n]*', '',
        text, flags=re.IGNORECASE)

    # Remove markdown links [text](url)
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)

    # Remove bare URLs
    text = re.sub(r'https?://\S+', '', text)

    # Remove slide numbers like "2/15", "3/15"
    text = re.sub(r'\d+/\d+\s*', '', text)

    # Remove "ET Online", "ETMarkets.com", "ANI", "Agencies" attribution lines
    text = re.sub(r'^(ET Online|ETMarkets\.com|ANI|Agencies|TIL Creatives|ETBFSI)\s*$', '', text,
                  flags=re.MULTILINE | re.IGNORECASE)

    # Remove extra whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {2,}', ' ', text)



    return text.strip()