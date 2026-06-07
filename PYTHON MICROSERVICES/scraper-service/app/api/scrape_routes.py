from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.schemas.scrape_schema import ScrapeRequest
from app.services.rss_scraper import scrape_rss_feed
from app.services.article_extractor import extract_article
from app.services.content_cleaner import clean_content
from app.services.duplicate_checker import is_duplicate

from app.services.pipeline_orchestrator import process_rss_pipeline

from app.db.database import get_db
from app.db.models import ScrapedArticle

from app.core.logging import logger

from app.workers.celery_worker import scrape_rss_task

from sqlalchemy import desc

from datetime import datetime

router = APIRouter(
    prefix="/scrape",
    tags=["Scraper"]
)


@router.post("/")
def scrape_content(
        request: ScrapeRequest,
        db: Session = Depends(get_db)
):

    try:

        # RSS FEED SCRAPING
        if request.rss_feed_url:

            articles = process_rss_pipeline(
                str(request.rss_feed_url),
                db,
                request.category,
                request.source_name
            )

            saved_articles = []

            for article in articles:
                new_article = ScrapedArticle(
                    title=article["title"],
                    content=article["content"],
                    summary=article["summary"],
                    author=article["author"],
                    publish_date=article["publish_date"],
                    image_url=article["image_url"],
                    source_url=article["source_url"],
                    category=article["category"],
                    source_name=request.source_name,
                )

                db.add(new_article)
                db.commit()
                db.refresh(new_article)

                article["source_score"] = 9.0 if (
                        article.get("image_url")
                        and article.get("summary")
                        and len(article.get("content", "")) > 300
                ) else 6.5

                saved_articles.append(article)

            return {
                "source": "rss",
                "saved_articles": len(saved_articles),
                "articles": saved_articles
            }

        # DIRECT ARTICLE SCRAPING
        elif request.url:

            if is_duplicate(db, str(request.url)):
                return {
                    "message": "Article already exists",
                    "source_url": str(request.url)
                }

            article = extract_article(str(request.url))
            article["content"] = clean_content(article["content"])

            new_article = ScrapedArticle(
                title=article["title"],
                content=article["content"],
                summary=article["summary"],
                author=article["author"],
                publish_date=article["publish_date"],
                image_url=article["image_url"],
                source_url=article["source_url"],
                category=request.category,
                source_name=request.source_name
            )

            db.add(new_article)
            db.commit()
            db.refresh(new_article)

            article["source_score"] = 9.0 if (
                    article.get("image_url")
                    and article.get("summary")
                    and len(article.get("content", "")) > 300
            ) else 6.5

            return {
                "source": "direct",
                "article": article,
                "saved_to_db": True
            }

        else:
            raise HTTPException(
                status_code=400,
                detail="Either url or rss_feed_url must be provided."
            )

    except Exception as e:
        logger.error(f"Scraping failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Scraping failed: {str(e)}"
        )
@router.get("/articles")
def get_all_articles(
        db: Session = Depends(get_db)
):
    articles = db.query(ScrapedArticle).all()

    return {
        "count": len(articles),
        "articles": articles
    }

@router.get("/articles/candidates")
def get_candidate_articles(
        db: Session = Depends(get_db)
):

    TARGET_COUNT = 35

    high_articles = db.query(ScrapedArticle).filter(
        ScrapedArticle.is_candidate == True,
        ScrapedArticle.is_processed == False,
        ScrapedArticle.is_ingested == False,
        ScrapedArticle.priority_level == "high"
    ).order_by(
        desc(ScrapedArticle.viral_score)
    ).limit(18).all()

    mid_articles = db.query(ScrapedArticle).filter(
        ScrapedArticle.is_candidate == True,
        ScrapedArticle.is_processed == False,
        ScrapedArticle.is_ingested == False,
        ScrapedArticle.priority_level == "mid"
    ).order_by(
        desc(ScrapedArticle.viral_score)
    ).limit(12).all()

    low_articles = db.query(ScrapedArticle).filter(
        ScrapedArticle.is_candidate == True,
        ScrapedArticle.is_processed == False,
        ScrapedArticle.is_ingested == False,
        ScrapedArticle.priority_level == "low"
    ).order_by(
        desc(ScrapedArticle.viral_score)
    ).limit(5).all()

    articles = (
            high_articles +
            mid_articles +
            low_articles
    )

    current_count = len(articles)

    # FILL REMAINING SLOTS DYNAMICALLY
    if current_count < TARGET_COUNT:

        remaining_needed = TARGET_COUNT - current_count

        used_ids = [a.id for a in articles]

        extra_articles = db.query(ScrapedArticle).filter(
            ScrapedArticle.is_candidate == True,
            ScrapedArticle.is_processed == False,
            ScrapedArticle.is_ingested == False,
            ~ScrapedArticle.id.in_(used_ids)
        ).order_by(
            desc(ScrapedArticle.viral_score)
        ).limit(remaining_needed).all()

        articles.extend(extra_articles)



    print("\n===== INGESTION FETCH =====")
    print(f"HIGH: {len(high_articles)}")
    print(f"MID: {len(mid_articles)}")
    print(f"LOW: {len(low_articles)}")
    print(f"TOTAL RETURNED: {len(articles)}")
    return {
        "count": len(articles),
        "articles": articles
    }
@router.get("/articles/category/{category}")
def get_articles_by_category(
        category: str,
        db: Session = Depends(get_db)
):
    articles = db.query(ScrapedArticle).filter(
        ScrapedArticle.category == category
    ).all()

    return {
        "count": len(articles),
        "category": category,
        "articles": articles
    }

@router.put("/articles/{article_id}/processed")
def mark_article_processed(
        article_id: int,
        db: Session = Depends(get_db)
):

    article = db.query(ScrapedArticle).filter(
        ScrapedArticle.id == article_id
    ).first()

    if not article:
        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )

    article.is_processed = True
    article.is_ingested = True
    article.ingested_at = datetime.utcnow()

    db.commit()

    return {
        "message": "Article marked as processed",
        "article_id": article_id
    }

@router.get("/articles/source/{source_name}")
def get_articles_by_source(
        source_name: str,
        db: Session = Depends(get_db)
):
    articles = db.query(ScrapedArticle).filter(
        ScrapedArticle.source_name == source_name
    ).all()

    return {
        "count": len(articles),
        "source_name": source_name,
        "articles": articles
    }


@router.delete("/articles/{article_id}")
def delete_article(
        article_id: int,
        db: Session = Depends(get_db)
):
    article = db.query(ScrapedArticle).filter(
        ScrapedArticle.id == article_id
    ).first()

    if not article:
        raise HTTPException(
            status_code=404,
            detail="Article not found"
        )

    db.delete(article)
    db.commit()

    return {
        "message": "Article deleted successfully",
        "article_id": article_id
    }

@router.post("/async-rss")
def async_rss_scrape(
        request: ScrapeRequest
):

    if not request.rss_feed_url:
        raise HTTPException(
            status_code=400,
            detail="rss_feed_url is required"
        )

    task = scrape_rss_task.delay(str(request.rss_feed_url))

    return {
        "message": "RSS scraping task started",
        "task_id": task.id
    }