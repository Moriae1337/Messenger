from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from models import User
from schemas import UserCreate, UserRead
from core import hash_password, get_db
from fastapi.security import OAuth2PasswordBearer,OAuth2PasswordRequestForm
from core import verify_password, create_access_token

router = APIRouter(prefix="/users", tags=["users"])

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@router.post("/register", response_model=UserRead)
async def register_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == user_in.username or User.email == user_in.email ))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=hash_password(user_in.password)
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/", response_model=List[UserRead])
async def get_all_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    return users

@router.get("/{user_name}", response_model=List[UserRead])
async def get_user_by_id(user_name:str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username.ilike(f"%{user_name}%")))
    users = result.scalars().all()
    if not users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not exist"
        )
    return users

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(),
                db: AsyncSession = Depends(get_db)):
    
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalars().first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer","user_id":user.id,"username":user.username}

@router.delete("/delete/{user_name}", response_model=dict)
async def delete_user_by_username(user_name: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == user_name))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User does not exist"
        )
    
    await db.execute(delete(User).where(User.username == user_name))
    await db.commit()

    return {"detail": f"User '{user_name}' deleted successfully"}
