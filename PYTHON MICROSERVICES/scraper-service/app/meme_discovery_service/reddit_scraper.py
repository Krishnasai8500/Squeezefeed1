import httpx
from typing import List, Dict

SUBREDDITS = [
    "memes",
    "dankmemes",
    "funny",
    "ProgrammerHumor",
    "IndianDankMemes",
    "meirl"
]

HEADERS = {
    "User-Agent": "SqueezeFeed/1.0"
}

async def fetch_reddit_memes(limit: int = 25) -> List[Dict]:
    memes = []

    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:

        for subreddit in SUBREDDITS:
            try:
                url = (
                    f"https://api.pullpush.io/reddit/search/submission/"
                    f"?subreddit={subreddit}"
                    f"&size={limit}"
                    f"&sort=desc"
                    f"&sort_type=score"
                    f"&is_video=false"
                )

                response = await client.get(url, headers=HEADERS)
                print("STATUS:", response.status_code, "SUBREDDIT:", subreddit)
                response.raise_for_status()

                data = response.json()

                for post in data.get("data", []):

                    # only image posts
                    url_val = post.get("url", "")
                    if not any(url_val.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".gif", ".webp"]):
                        continue

                    # minimum upvotes filter
                    if post.get("score", 0) < 500:
                        continue

                    memes.append({
                        "reddit_id": post.get("id"),
                        "title": post.get("title"),
                        "content": post.get("selftext", ""),
                        "image_url": url_val,
                        "subreddit": subreddit,
                        "upvotes": post.get("score", 0),
                        "comments": post.get("num_comments", 0),
                        "permalink": f"https://reddit.com{post.get('permalink', '')}"
                    })


            except Exception as e:

                print(f"Error fetching {subreddit}: {type(e).__name__}: {e}")

                continue  # skip this subreddit, don't crash the whole run

    memes.sort(key=lambda x: x["upvotes"], reverse=True)
    print(f"Total memes fetched: {len(memes)}")
    return memes