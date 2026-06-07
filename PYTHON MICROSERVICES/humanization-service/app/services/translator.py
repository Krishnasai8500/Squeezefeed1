from transformers import (
    AutoTokenizer,
    AutoModelForSeq2SeqLM
)

MODEL_NAME = "facebook/nllb-200-distilled-600M"

print("Loading translation model...")

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME
)

model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_NAME
)

print("Translation model loaded!")


def translate_to_english(text: str) -> str:

    if not text:
        return ""

    try:

        inputs = tokenizer(
            text,
            return_tensors="pt"
        )

        translated_tokens = model.generate(
            **inputs,
            forced_bos_token_id=tokenizer.convert_tokens_to_ids(
                "eng_Latn"
            ),
            max_length=512
        )

        translated_text = tokenizer.batch_decode(
            translated_tokens,
            skip_special_tokens=True
        )[0]

        return translated_text

    except Exception as e:

        print(
            f"Translation failed: {e}"
        )

        return text

def translate_to_telugu(text: str) -> str:

    if not text:
        return ""

    try:

        inputs = tokenizer(
            text,
            return_tensors="pt"
        )

        translated_tokens = model.generate(
            **inputs,
            forced_bos_token_id=tokenizer.convert_tokens_to_ids(
                "tel_Telu"
            ),
            max_length=512
        )

        translated_text = tokenizer.batch_decode(
            translated_tokens,
            skip_special_tokens=True
        )[0]

        return translated_text

    except Exception as e:

        print(
            f"Telugu translation failed: {e}"
        )

        return text