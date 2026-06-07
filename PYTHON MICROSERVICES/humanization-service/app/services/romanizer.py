from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

MODEL_NAME = "google/flan-t5-base"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)


def convert_to_roman_telugu(text: str) -> str:
    try:
        prompt = f"""
        Translate this English news summary into natural conversational Telugu
        written in English letters (Roman Telugu).

        Requirements:
        - Sound natural for Telugu speakers
        - Use simple mobile-friendly language
        - Keep emotional impact
        - Avoid Telugu script
        - Output only Roman Telugu

        Text:
        {text}
        """

        inputs = tokenizer(
            prompt,
            return_tensors="pt",
            max_length=512,
            truncation=True
        )

        outputs = model.generate(
            **inputs,
            max_new_tokens=150,
            temperature=0.8,
            do_sample=True,
            top_p=0.9
        )

        result = tokenizer.decode(
            outputs[0],
            skip_special_tokens=True
        )

        return result.strip()

    except Exception:
        return text