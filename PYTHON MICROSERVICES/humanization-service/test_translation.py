from app.services.rewrite_engine import (
    rewrite_content
)

title = """
భారీ వర్షాలపై తెలంగాణకు రెడ్ అలర్ట్
"""

content = """
తెలంగాణ రాష్ట్రంలో భారీ వర్షాలు కురిసే అవకాశముందని
వాతావరణ శాఖ హెచ్చరించింది.
హైదరాబాద్ సహా పలు జిల్లాలకు రెడ్ అలర్ట్ జారీ చేశారు.
ప్రజలు అత్యవసరమైతే తప్ప బయటకు రావద్దని సూచించారు.
"""

result = rewrite_content(
    title,
    content,
    "professional"
)

print(result)