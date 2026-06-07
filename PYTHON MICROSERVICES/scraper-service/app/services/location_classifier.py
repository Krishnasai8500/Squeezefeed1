LOCATION_MAP = {

    "hyderabad": "telangana",
    "secunderabad": "telangana",

    "mumbai": "maharashtra",
    "pune": "maharashtra",

    "delhi": "delhi",

    "chennai": "tamil nadu",

    "bengaluru": "karnataka",

    "kolkata": "west bengal"
}


def detect_article_location(title: str, content: str):

    text = f"{title} {content}".lower()

    detected_city = None
    detected_state = None

    for city, state in LOCATION_MAP.items():

        if city in text:

            detected_city = city
            detected_state = state

            break

    return {
        "city": detected_city,
        "state": detected_state
    }