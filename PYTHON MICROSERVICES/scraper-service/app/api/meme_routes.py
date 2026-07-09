from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import traceback

from app.db.database import get_db
from app.meme_discovery_service.meme_discovery import discover_memes

router = APIRouter(
    prefix="/memes",
    tags=["Meme Discovery"]
)

@router.post("/discover")
async def get_discovered_memes(
        db: Session = Depends(get_db)
):
    try:
        result = await discover_memes(db)
        return {
            "success": True,
            "scraped": result["scraped"],
            "saved": result["saved"]
        }

    except Exception as e:
        traceback.print_exc()  # ← shows full error in terminal
        raise HTTPException(
            status_code=500,
            detail=f"Meme discovery failed: {str(e)}"
        )