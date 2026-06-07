# from apscheduler.schedulers.background import BackgroundScheduler
#
# import app.workers.celery_worker as celery_worker
#
# from app.core.source_registry import RSS_FEEDS
#
# scheduler = BackgroundScheduler(
#     timezone="Asia/Kolkata",
#     daemon=True
# )
#
#
# def start_scheduler():
#
#     all_feeds = (
#         RSS_FEEDS["india"] +
#         RSS_FEEDS["global"] +
#         RSS_FEEDS["telugu"]
#     )
#
#     for feed_url in all_feeds:
#
#         scheduler.add_job(
#             celery_worker.scrape_rss_task,
#             "interval",
#             hours=2,
#             args=[feed_url],
#             id=f"scrape-{hash(feed_url)}",
#             replace_existing=True
#         )
#
#     scheduler.add_job(
#         celery_worker.cleanup_queue_task,
#         "cron",
#         hour=0,
#         minute=0,
#         id="cleanup-queue",
#         replace_existing=True
#     )
#
#     scheduler.start()
#
#     print("Scheduler started...")