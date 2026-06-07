RSS_FEEDS = {

    "india": [

        # General India
        "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
        "https://www.thehindu.com/news/national/feeder/default.rss",
        "https://indianexpress.com/feed/",
        "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
        "https://www.news18.com/rss/india.xml",

        # Finance
        "https://www.moneycontrol.com/rss/latestnews.xml",
        "https://economictimes.indiatimes.com/rssfeedsdefault.cms",

        # Sports
        "https://www.cricbuzz.com/rss-news",

        # Tech
        "https://techcrunch.com/feed/",
        "https://www.theverge.com/rss/index.xml",

        # Entertainment
        "https://www.pinkvilla.com/rss.xml"
    ],

    "global": [

        # World
        "http://feeds.bbci.co.uk/news/rss.xml",
        "http://rss.cnn.com/rss/edition.rss",
        "https://feeds.reuters.com/reuters/topNews"
    ],

    "telugu": [

        # Core Telugu Sources
        "https://tv9telugu.com/feed",
        "https://ntvtelugu.com/feed",

        # # Optional Expansion Later
        # "https://www.greatandhra.com/rss",
        # "https://www.telugu360.com/feed/"
    ]
}


WEBSITES = {

    "india": [

        "https://indianexpress.com",
        "https://www.hindustantimes.com",
        "https://www.news18.com",
        "https://www.moneycontrol.com",
        "https://www.firstpost.com",
        "https://www.aajtak.in"
    ]
}


SOURCE_PRIORITY = {

    "bbc": 10,

    "reuters": 10,

    "thehindu": 9,

    "indianexpress": 8,

    "moneycontrol": 8,

    "economictimes": 8,

    "cricbuzz": 8,

    "techcrunch": 8,
    "theverge": 8,

    "pinkvilla": 6,

    "timesofindia": 7,

    "hindustantimes": 7,

    "news18": 7,

    "cnn": 8,

    "tv9telugu": 9,
    "ntvtelugu": 9,

    # "greatandhra": 7,
    # "telugu360": 7,
}


SOURCE_CATEGORY_MAP = {

    # Sports
    "cricbuzz": "sports",

    # Finance
    "moneycontrol": "finance",
    "economictimes": "finance",

    # Tech
    "techcrunch": "tech",
    "theverge": "tech",

    # Entertainment
    "pinkvilla": "entertainment",

    # World
    "bbc": "world",
    "cnn": "world",
    "reuters": "world",

    # General India
    "indianexpress": "general",
    "hindustantimes": "general",
    "timesofindia": "general",
    "thehindu": "general",
    "news18": "general",


    # Telugu Regional
    "tv9telugu": "general",
    "ntvtelugu": "general",

    # Telugu Entertainment / Mixed
    # "greatandhra": "entertainment",
    # "telugu360": "entertainment",
}

# "google_news_india": [
#     "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",
#     "https://news.google.com/rss/headlines/section/topic/NATION?hl=en-IN&gl=IN&ceid=IN:en",
#     "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-IN&gl=IN&ceid=IN:en",
#     "https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-IN&gl=IN&ceid=IN:en",
#     "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-IN&gl=IN&ceid=IN:en",
#     "https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-IN&gl=IN&ceid=IN:en"
# ],