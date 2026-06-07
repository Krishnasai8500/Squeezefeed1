import re


# =========================================================
# BROAD CATEGORY CLASSIFICATION ONLY
# =========================================================

CATEGORY_KEYWORDS = {

    "sports": {
        "player": 1,
        "team": 1,
        "match": 2,
        "score": 1,
        "coach": 1,
    },

    "entertainment": {
        "movie": 2,
        "film": 2,
        "actor": 2,
        "actress": 2,
        "song": 1,
        "award": 1,
    },

    "politics": {
        "minister": 2,
        "government": 2,
        "party": 1,
        "vote": 2,
        "policy": 2,
        "chief minister": 7,
        "assembly": 5,
        "bjp": 5,
        "congress": 5,
        "mla": 5,
        "mp": 5,
        "supreme court": 5,
        "high court": 5,
    },

    "finance": {
        "bank": 2,
        "profit": 2,
        "loss": 2,
        "shares": 4,
        "stock": 4,
        "q4": 4,
        "revenue": 5,
        "ebitda": 5,
        "market cap": 5,
        "stake": 4,
        "dividend": 4,
        "earnings": 5,
        "fiscal": 3,
        "quarter": 3,
        "market": 3,
        "investor": 4,
        "investors": 4,
        "quarterly": 4,
        "results": 4,
        "brokerage": 4,
        "target price": 5,
    },

    "technology": {
        "artificial intelligence": 8,
        "machine learning": 7,
        "software update": 6,
        "android app": 6,
        "cyber security": 7,
        "programming language": 6,
        "app development": 6,
        "data breach": 7,
        "cloud computing": 6,
        "robotics": 6,
        "smartphone": 5,
        "laptop": 4,
        "software": 5,
        "hardware": 4,
        "internet": 2,
        "app": 2,
        "tech": 5,
        "startup": 2,
        "digital": 2,
        "innovation": 4,
        "gadget": 5,
        "processor": 5,
        "semiconductor": 6,
        "electric vehicle": 6,
    },

    "crime": {
        "murder case": 8,
        "rape case": 8,
        "terror attack": 8,
        "police investigation": 7,
        "court hearing": 6,
        "arrested accused": 7,
        "crime branch": 6,
        "money laundering": 6,
        "drug trafficking": 6,
        "murder": 7,
        "rape": 7,
        "arrested": 6,
        "police": 5,
        "court": 5,
        "crime": 6,
        "theft": 6,
        "fraud": 6,
        "kidnap": 7,
        "scam": 6,
        "corruption": 6,
        "prison": 5,
        "jail": 5,
        "verdict": 5,
        "accused": 5,
        "ed raid": 7,
        "enforcement directorate": 7,
        "cbi": 6,
        "narcotics": 6,
        "smuggling": 6,
        "seized": 5,
        "illegal": 4,
    },

    "education": {
        "students": 1,
        "school": 1,
        "college": 1,
        "teacher": 1,
    },

    "international": {
        "united nations": 8,
        "middle east": 7,
        "russia ukraine": 8,
        "china taiwan": 7,
        "global summit": 6,
        "international sanctions": 6,
        "world leaders": 6,
        "peace talks": 6,
        "war": 6,
        "missile": 6,
        "airstrike": 7,
        "sanctions": 6,
        "nato": 7,
        "diplomat": 5,
        "embassy": 5,
        "treaty": 5,
        "bilateral": 5,
        "ceasefire": 7,
        "refugee": 5,
        "invasion": 7,
    },

    "health": {

        "doctor": 5,
        "hospital": 5,
        "medical": 5,
        "disease": 6,
        "virus": 6,
        "infection": 6,
        "fitness": 5,
        "nutrition": 5,
        "protein powder": 7,
        "thyroid": 7,
        "infertility": 7,
        "pregnancy": 5,
        "vaccine": 6,
        "mental health": 7,
        "health": 5,
        "diet": 4,
        "exercise": 4,
        "heatwave": 5,
        "air pollution": 6,
        "public health": 6,
        "temperature": 4,
    },

    "weather": {

        "heatwave": 7,
        "imd": 6,
        "weather alert": 7,
        "temperature": 5,
        "rainfall": 5,
        "cyclone": 7,
        "storm": 6,
        "flood": 6,
        "heavy rain": 6,
        "weather department": 6,
        "red alert": 7,
    }
}


# =========================================================
# ENTITY TAGS
# =========================================================

ENTITY_KEYWORDS = {
    "openai": "openai",
    "google": "google",
    "apple": "apple",
    "microsoft": "microsoft",
    "tesla": "tesla",
    "spotify": "spotify",
    "netflix": "netflix",
    "amazon": "amazon",
    "nvidia": "nvidia",
    "meta": "meta",
    "modi": "modi",
    "trump": "trump",
    "putin": "putin",
    "virat kohli": "virat-kohli",
    "ms dhoni": "ms-dhoni",
    "iphone": "iphone",
    "android": "android",
    "chatgpt": "chatgpt",
    "instagram": "instagram",
    "youtube": "youtube",
    "elon musk": "elon-musk",
    "rahul gandhi": "rahul-gandhi",
    "biden": "biden",
    "zelensky": "zelensky",
    "xi jinping": "xi-jinping",
    "samsung": "samsung",
    "tata": "tata",
    "reliance": "reliance",
    "adani": "adani",
    "ambani": "ambani",
}


# =========================================================
# TOPIC TAGS
# =========================================================

TOPIC_KEYWORDS = {
    "ai": [
        "artificial intelligence",
        "machine learning",
        "chatgpt",
        "openai",
        "deep learning",
        "llm",
    ],
    "cricket": [
        "ipl",
        "cricket",
        "test series",
        "world cup",
        "wicket",
        "batting",
    ],
    "elections": [
        "election",
        "assembly elections",
        "poll results",
        "voting",
        "constituency",
    ],
    "war": [
        "war",
        "missile attack",
        "air strike",
        "military operation",
        "ceasefire",
        "invasion",
    ],
    "weather": [
        "heatwave",
        "cyclone",
        "heavy rain",
        "flood alert",
        "earthquake",
        "tsunami",
    ],
    "economy": [
        "gdp",
        "inflation",
        "recession",
        "economic growth",
        "budget",
    ],
    "health": [
        "pandemic",
        "virus",
        "vaccine",
        "hospital",
        "disease",
        "outbreak",
    ],
}


# =========================================================
# OVERLAP RESOLVER
# =========================================================

# When two categories are too close in score,
# prefer the more specific one
CATEGORY_PRIORITY = [
    "crime",
    "health",
    "weather",
    "sports",
    "technology",
    "finance",
    "international",
    "politics",
    "entertainment",
    "education",
]

NEGATIVE_KEYWORDS = {

    "sports": [
        "government",
        "minister",
        "parliament"
    ],

    "politics": [
        "cricket match",
        "football",
        "ipl"
    ],

    "entertainment": [
        "murder case",
        "court hearing"
    ],
    "health": [
        "movie",
        "box office",
        "ipl"
    ],

    "weather": [
        "movie",
        "actor",
        "election"
    ]
}

def resolve_overlap(scores: dict) -> str:
    sorted_scores = sorted(
        scores.items(),
        key=lambda x: x[1],
        reverse=True
    )

    top_category, top_score = sorted_scores[0]
    second_category, second_score = sorted_scores[1]

    # If gap is small, prefer more specific category
    if top_score >= 10 and (
            top_score - second_score < 5
    ):
        for category in CATEGORY_PRIORITY:
            if category in [top_category, second_category]:
                return category

    return top_category


# =========================================================
# MAIN CLASSIFIER
# =========================================================

def classify_content(title: str, content: str):

    title_lower = title.lower()
    content_lower = content.lower()
    combined = f"{title_lower} {content_lower}"

    scores = {}

    # -----------------------------------------------------
    # CATEGORY CLASSIFICATION
    # -----------------------------------------------------

    for category, keywords in CATEGORY_KEYWORDS.items():

        score = 0

        # -----------------------------------------
        # POSITIVE KEYWORD MATCHING
        # -----------------------------------------

        for phrase, weight in keywords.items():

            title_match = re.search(
                rf"\b{re.escape(phrase)}\b",
                title_lower
            )

            content_match = re.search(
                rf"\b{re.escape(phrase)}\b",
                content_lower
            )

            # Title boost increased to 3x
            # Title boost increased to 3x
            if title_match:

                score += weight * 2

                # Multi-word phrase bonus
                if len(phrase.split()) >= 2:
                    score += 2

            if content_match:

                score += weight

                # Multi-word phrase bonus
                if len(phrase.split()) >= 2:
                    score += 2

        match_count = 0

        for phrase in keywords.keys():

            if re.search(
                    rf"\b{re.escape(phrase)}\b",
                    combined
            ):
                match_count += 1

        if match_count >= 5:
            score += 10

        if match_count >= 3:
            score += 5

        # -----------------------------------------
        # NEGATIVE KEYWORD PENALTY
        # -----------------------------------------

        for negative_word in NEGATIVE_KEYWORDS.get(category, []):

            if re.search(
                    rf"\b{re.escape(negative_word)}\b",
                    combined
            ):
                score -= 3

        scores[category] = score

    best_score = max(scores.values())

    # Raise threshold to 10 for more confident classification
    if best_score < 8:
        category = "general"
    else:
        category = resolve_overlap(scores)

    # -----------------------------------------------------
    # ENTITY TAG EXTRACTION
    # -----------------------------------------------------

    entity_tags = []

    for keyword, tag in ENTITY_KEYWORDS.items():
        if re.search(
            rf"\b{re.escape(keyword)}\b",
            combined
        ):
            entity_tags.append(tag)

    # -----------------------------------------------------
    # TOPIC TAG EXTRACTION
    # -----------------------------------------------------

    topic_tags = []

    for topic, keywords in TOPIC_KEYWORDS.items():
        for keyword in keywords:
            if re.search(
                rf"\b{re.escape(keyword)}\b",
                combined
            ):
                topic_tags.append(topic)
                break

    # remove duplicates
    entity_tags = list(set(entity_tags))
    topic_tags = list(set(topic_tags))

    # -----------------------------------------------------
    # FINAL OUTPUT
    # -----------------------------------------------------

    print("CLASSIFICATION SCORES:", scores)
    print("CATEGORY:", category)
    print("ENTITY TAGS:", entity_tags)
    print("TOPIC TAGS:", topic_tags)

    all_tags = (
            ([] if category == "general"
             else [category])

            + entity_tags
            + topic_tags
    )

    return {

        "category": category,

        "entity_tags": entity_tags,

        "topic_tags": topic_tags,

        "all_tags": list(set(all_tags))
    }