from app.services.queue_cleanup import cleanup_old_candidates
from celery import Celery
from celery.schedules import crontab

from app.core.config import settings
from app.core.logging import logger
from app.core.source_registry import RSS_FEEDS

from app.services.pipeline_orchestrator import process_rss_pipeline
from app.services.sentiment_client import analyze_article_sentiment

from app.db.database import SessionLocal
from app.db.models import ScrapedArticle



# ✅ Extract clean source name from URL
from urllib.parse import urlparse

def get_source_name(feed_url: str) -> str:
    try:
        domain = urlparse(feed_url).netloc  # gives "feeds.feedburner.com" or "www.ndtv.com"
        domain = domain.replace("www.", "").replace("feeds.", "")
        return domain.split(".")[0].upper()  # gives "NDTV", "BBC", "HINDU" etc
    except:
        return feed_url


celery_app = Celery(
    "scraper_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.beat_schedule = {}

all_feeds = (
    RSS_FEEDS["india"] +
    RSS_FEEDS["global"] +
    RSS_FEEDS["telugu"]
)

for index, feed_url in enumerate(all_feeds):
    celery_app.conf.beat_schedule[
        f"scrape-feed-{index}"
    ] = {
        "task": "app.workers.celery_worker.scrape_rss_task",
        "schedule": crontab(minute="*/1"),
        "args": (feed_url,),
    }
# "schedule": crontab(hour=2,minute="*/5"),
celery_app.conf.beat_schedule[
    "cleanup-queue"
] = {
    "task": "app.workers.celery_worker.cleanup_queue_task",
    "schedule": crontab(hour=3, minute=0),
}

celery_app.conf.timezone = "Asia/Kolkata"

@celery_app.task
def cleanup_queue_task():

    db = SessionLocal()

    try:

        deleted = cleanup_old_candidates(db)

        logger.info(
            f"QUEUE CLEANUP COMPLETED: {deleted} deleted"
        )

    finally:
        db.close()


@celery_app.task
def scrape_rss_task(feed_url: str):
    logger.info(f"Celery RSS scraping started for: {feed_url}")
    db = SessionLocal()
    pending_count = db.query(ScrapedArticle).filter(
        ScrapedArticle.is_candidate == True,
        ScrapedArticle.is_ingested == False
    ).count()
    logger.info(
        f"CURRENT PENDING QUEUE: {pending_count}"
    )

    if pending_count > 500:
        logger.warning(
            f"QUEUE TOO LARGE: {pending_count} pending articles"
        )

        return {
            "message": "Scraping skipped due to queue overload"
        }




    try:
        source_name = get_source_name(feed_url)  # ✅ clean name
        source_type = (
            "telugu"
            if feed_url in RSS_FEEDS["telugu"]
            else "english"
        )
        pipeline_result = process_rss_pipeline(
            feed_url=feed_url,
            db=db,
            category=None,
            source_name=source_name,
            source_type=source_type
        )
        # rest stays same

        articles = pipeline_result["processed_articles"]

        total_scraped = pipeline_result["total_scraped"]

        duplicates_skipped = pipeline_result["duplicates_skipped"]

        high_count = 0
        mid_count = 0
        low_count = 0
        candidate_count = 0

        saved_count = 0

        for article in articles:

            logger.info(
                f"""
                FILTER CHECK:
                title={article['title']}
                content_length={len(article['content'])}
                """
            )

            if not article["content"]:
                logger.info("SKIPPED: Empty content")
                continue

            # if article["title"] == "Google News":
            #     logger.info("SKIPPED: Google News title")
            #     continue

            if len(article["content"]) < 200:
                logger.info(
                    f"SKIPPED: Short content -> {len(article['content'])}"
                )
                continue

            # -----------------------------
            # SENTIMENT + VIRAL ANALYSIS
            # -----------------------------

            sentiment_result = analyze_article_sentiment(
                title=article["title"],
                content=article["content"],
                source_url=article["source_url"],
                category="general",
                published_at=article["publish_date"]
            )
            article["category"] = sentiment_result["detected_category"]
            article["tags"] = sentiment_result["generated_tags"]
            print("SENTIMENT RESULT:", sentiment_result)

            viral_score = 0.0
            priority_level = "low"
            is_candidate = False

            if sentiment_result:
                logger.warning(
                    f"SENTIMENT RESULT:\n{sentiment_result}"
                )

                viral_score = sentiment_result.get(
                    "viral_score",
                    0.0
                )

                # Deterministic classification
                if viral_score >= 0.75:
                    priority_level = "high"

                elif viral_score >= 0.45:
                    priority_level = "mid"

                else:
                    priority_level = "low"

                # Candidate filtering
                is_candidate = priority_level in ["high", "mid"]

                if priority_level == "high":
                    high_count += 1

                elif priority_level == "mid":
                    mid_count += 1

                else:
                    low_count += 1

                if is_candidate:
                    candidate_count += 1

            # -----------------------------
            # SAVE ARTICLE
            # -----------------------------
            new_article = ScrapedArticle(
                title=article["title"],
                content=article["content"],
                summary=None,
                author=article["author"],
                publish_date=article["publish_date"],
                image_url=article["image_url"],
                source_url=article["source_url"],
                category=article["category"],
                tags=article["tags"],
                source_name=article["source_name"],
                source_score=article["source_score"],

                article_city=article["article_city"],
                article_state=article["article_state"],
                language=article["language"],


                # Viral scoring fields
                viral_score=viral_score,
                priority_level=priority_level,
                is_candidate=is_candidate,
            )

            db.add(new_article)

            saved_count += 1

            logger.info(
                f"""
                Saved article:
                title={article['title']}
                viral_score={viral_score}
                priority={priority_level}
                candidate={is_candidate}
                """
            )

        db.commit()

        logger.info(
            f"""
            SCRAPING SUMMARY

            Feed URL: {feed_url}

            Total RSS Articles: {total_scraped}

            Duplicates Skipped: {duplicates_skipped}

            Successfully Processed: {len(articles)}

            Saved Articles: {saved_count}

            HIGH Priority: {high_count}
            MID Priority: {mid_count}
            LOW Priority: {low_count}

            Candidates Selected: {candidate_count}
            """
        )

        return {
            "saved_articles": saved_count
        }

    except Exception as e:

        logger.error(
            f"Celery scraping failed: {str(e)}"
        )

        db.rollback()

    finally:
        db.close()


# from app.services.queue_cleanup import cleanup_old_candidates
#
# from app.core.logging import logger
# from app.core.source_registry import RSS_FEEDS
#
# from app.services.pipeline_orchestrator import process_rss_pipeline
# from app.services.sentiment_client import analyze_article_sentiment
#
# from app.db.database import SessionLocal
# from app.db.models import ScrapedArticle
#
# from urllib.parse import urlparse
#
#
# def get_source_name(feed_url: str) -> str:
#     try:
#         domain = urlparse(feed_url).netloc
#         domain = domain.replace("www.", "").replace("feeds.", "")
#         return domain.split(".")[0].upper()
#
#     except:
#         return feed_url
#
#
# def cleanup_queue_task():
#
#     db = SessionLocal()
#
#     try:
#
#         deleted = cleanup_old_candidates(db)
#
#         logger.info(
#             f"QUEUE CLEANUP COMPLETED: {deleted} deleted"
#         )
#
#     finally:
#         db.close()
#
#
# def scrape_rss_task(feed_url: str):
#
#     logger.info(
#         f"RSS scraping started for: {feed_url}"
#     )
#
#     db = SessionLocal()
#
#     pending_count = db.query(
#         ScrapedArticle
#     ).filter(
#         ScrapedArticle.is_candidate == True,
#         ScrapedArticle.is_ingested == False
#     ).count()
#
#     logger.info(
#         f"CURRENT PENDING QUEUE: {pending_count}"
#     )
#
#     if pending_count > 500:
#
#         logger.warning(
#             f"QUEUE TOO LARGE: {pending_count} pending articles"
#         )
#
#         return {
#             "message": "Scraping skipped due to queue overload"
#         }
#
#     try:
#
#         source_name = get_source_name(feed_url)
#
#         source_type = (
#             "telugu"
#             if feed_url in RSS_FEEDS["telugu"]
#             else "english"
#         )
#
#         pipeline_result = process_rss_pipeline(
#             feed_url=feed_url,
#             db=db,
#             category=None,
#             source_name=source_name,
#             source_type=source_type
#         )
#
#         articles = pipeline_result["processed_articles"]
#
#         total_scraped = pipeline_result["total_scraped"]
#
#         duplicates_skipped = pipeline_result["duplicates_skipped"]
#
#         high_count = 0
#         mid_count = 0
#         low_count = 0
#         candidate_count = 0
#
#         saved_count = 0
#
#         for article in articles:
#
#             logger.info(
#                 f'''
#                 FILTER CHECK:
#                 title={article["title"]}
#                 content_length={len(article["content"])}
#                 '''
#             )
#
#             if not article["content"]:
#                 logger.info("SKIPPED: Empty content")
#                 continue
#
#             if len(article["content"]) < 200:
#
#                 logger.info(
#                     f'SKIPPED: Short content -> {len(article["content"])}'
#                 )
#
#                 continue
#
#             sentiment_result = analyze_article_sentiment(
#                 title=article["title"],
#                 content=article["content"],
#                 source_url=article["source_url"],
#                 category="general",
#                 published_at=article["publish_date"]
#             )
#
#             article["category"] = sentiment_result["detected_category"]
#
#             article["tags"] = sentiment_result["generated_tags"]
#
#             viral_score = 0.0
#             priority_level = "low"
#             is_candidate = False
#
#             if sentiment_result:
#
#                 viral_score = sentiment_result.get(
#                     "viral_score",
#                     0.0
#                 )
#
#                 if viral_score >= 0.75:
#                     priority_level = "high"
#
#                 elif viral_score >= 0.45:
#                     priority_level = "mid"
#
#                 else:
#                     priority_level = "low"
#
#                 is_candidate = priority_level in ["high", "mid"]
#
#                 if priority_level == "high":
#                     high_count += 1
#
#                 elif priority_level == "mid":
#                     mid_count += 1
#
#                 else:
#                     low_count += 1
#
#                 if is_candidate:
#                     candidate_count += 1
#
#             new_article = ScrapedArticle(
#                 title=article["title"],
#                 content=article["content"],
#                 summary=None,
#                 author=article["author"],
#                 publish_date=article["publish_date"],
#                 image_url=article["image_url"],
#                 source_url=article["source_url"],
#                 category=article["category"],
#                 tags=article["tags"],
#                 source_name=article["source_name"],
#                 source_score=article["source_score"],
#                 article_city=article["article_city"],
#                 article_state=article["article_state"],
#                 language=article["language"],
#                 viral_score=viral_score,
#                 priority_level=priority_level,
#                 is_candidate=is_candidate,
#             )
#
#             db.add(new_article)
#
#             saved_count += 1
#
#         db.commit()
#
#         logger.info(
#             f"""
#             SCRAPING SUMMARY
#
#             Feed URL: {feed_url}
#
#             Total RSS Articles: {total_scraped}
#
#             Duplicates Skipped: {duplicates_skipped}
#
#             Successfully Processed: {len(articles)}
#
#             Saved Articles: {saved_count}
#
#             HIGH Priority: {high_count}
#             MID Priority: {mid_count}
#             LOW Priority: {low_count}
#
#             Candidates Selected: {candidate_count}
#             """
#         )
#
#         return {
#             "saved_articles": saved_count
#         }
#
#     except Exception as e:
#
#         logger.error(
#             f"RSS scraping failed: {str(e)}"
#         )
#
#         db.rollback()
#
#     finally:
#         db.close()