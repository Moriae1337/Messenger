from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import and_, or_
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload,aliased
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from core import get_db
from models import Message, User
from schemas import MessageCreate, MessageRead,UserRead

router = APIRouter(
    prefix="/messages",
    tags=["messages"]
)

@router.get("/", response_model=List[MessageRead])
async def get_messages(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Message)
        .options(
            selectinload(Message.attachments),
            selectinload(Message.sender),
            selectinload(Message.recipient)
        )
        .order_by(Message.timestamp)
    )
    messages = result.scalars().all()
    return messages

@router.post("/add", status_code=status.HTTP_201_CREATED)
async def create_message(message: MessageCreate, db: AsyncSession = Depends(get_db)):
    new_message = Message(
        text=message.text,
        sender_id=message.sender_id,
        recipient_id=message.recipient_id
    )
    db.add(new_message)
    await db.commit()
    await db.refresh(new_message)
    return new_message

@router.delete("/delete/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(message_id:int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Message).where(Message.id == message_id))
    message_to_delete = result.scalars().first()
    if not message_to_delete:
        raise HTTPException(status_code=404, detail="Message not found")
    await db.delete(message_to_delete)
    await db.commit()

@router.put("/update/{message_id}", response_model=MessageRead, status_code=status.HTTP_200_OK)
async def update_message(message_id:int, message: MessageCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Message).where(Message.id == message_id).options(selectinload(Message.attachments)))
    message_to_update = result.scalars().first()

    if not message_to_update:
        raise HTTPException(status_code=404,detail="Message not found")
    
    message_to_update.text = message.text
    message_to_update.sender_id = message.sender_id
    message_to_update.recipient_id = message.recipient_id

    db.add(message_to_update)
    await db.commit()
    await db.refresh(message_to_update)

    return message_to_update


@router.get("/contacts", response_model=List[UserRead])
async def get_contacts(current_user_id: int, db: AsyncSession = Depends(get_db)):
    user_alias = aliased(User)
    stmt = (
        select(user_alias)
        .join(
            Message,
            or_(
                (Message.sender_id == current_user_id) & (Message.recipient_id == user_alias.id),
                (Message.recipient_id == current_user_id) & (Message.sender_id == user_alias.id)
            )
        )
        .where(user_alias.id != current_user_id) 
        .distinct()
    )
    result = await db.execute(stmt)
    contacts = result.scalars().all()
    return contacts

@router.get("/{user1_id}/{user2_id}", response_model=List[MessageRead])
async def get_messages_between_users(user1_id: int, user2_id: int, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Message)
        .options(selectinload(Message.attachments))
        .where(
            or_(
                and_(Message.sender_id == user1_id, Message.recipient_id == user2_id),
                and_(Message.sender_id == user2_id, Message.recipient_id == user1_id),
            )
        )
        .order_by(Message.timestamp)
    )

    result = await db.execute(stmt)
    messages = result.scalars().all()
    return messages
