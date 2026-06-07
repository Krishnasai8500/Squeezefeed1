from app.services.translator import (
    translate_to_english
)

sample = """
భారీ వర్షాలపై తెలంగాణకు రెడ్ అలర్ట్
"""

translated = translate_to_english(
    sample
)

print(translated)