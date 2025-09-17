from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db

app = FastAPI()

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT 1"))
    scalar = result.scalar()
    return {"status": "ok", "db": scalar}