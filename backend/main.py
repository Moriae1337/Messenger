from fastapi import FastAPI, Depends
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from core import get_db, JWTMiddleware
from routers import users_router,messages_router,ws_router

app = FastAPI()

app.add_middleware(JWTMiddleware)

# ================= CORS =================
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ========================================

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT 1"))
    scalar = result.scalar()
    return {"status": "ok", "db": scalar}

app.include_router(users_router)
app.include_router(messages_router)
app.include_router(ws_router)