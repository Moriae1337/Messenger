from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import List, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from core import get_db, verify_token
from models import Message
from functools import wraps
from schemas import MessageRead

ws_router = APIRouter(prefix="/ws", tags=["websockets"])

def get_chat_id(user1_id: int, user2_id: int) -> str:
    """
    Generates stable chat_id for 2 users.
    Returns string in order from lowest to biggest so that the order won
    't matter.
    """
    sorted_ids = sorted([user1_id, user2_id])
    return f"{sorted_ids[0]}_{sorted_ids[1]}"


class ConnectionManager:
    def __init__(self):
        # Save active chats
        # Key: chat_id (string, example "1_2")
        # Value: dictionary {user_id: WebSocket}
        self.active_chats: Dict[str, Dict[int, WebSocket]] = {}

    async def connect(self, chat_id: str, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if chat_id not in self.active_chats:
            self.active_chats[chat_id] = {}
        self.active_chats[chat_id][user_id] = websocket
        print(f"User {user_id} connected to chat {chat_id}")

    def disconnect(self, chat_id: str, user_id: int):
        if chat_id in self.active_chats and user_id in self.active_chats[chat_id]:
            del self.active_chats[chat_id][user_id]
            if not self.active_chats[chat_id]:
                del self.active_chats[chat_id]
        print(f"User {user_id} disconnected from chat {chat_id}")

    async def send_personal_message(self, chat_id: str, user_id: int, message: dict):
        ws = self.active_chats.get(chat_id, {}).get(user_id)
        if ws:
            await ws.send_json(message)

    async def broadcast(self, chat_id: str, message: dict):
        for ws in self.active_chats.get(chat_id, {}).values():
            await ws.send_json(message)

manager = ConnectionManager()

def ws_auth_required(func):
    @wraps(func)
    async def wrapper(websocket: WebSocket, *args, **kwargs):
        token = websocket.query_params.get("token")
        print("Incoming WS connection, token:", token)
        user = verify_token(token)
        if not user:
            await websocket.close(code=1008)
            return
        await func(websocket, *args, **kwargs)
    return wrapper

@ws_router.websocket("/test")
async def websocket_test(ws: WebSocket):
    await ws.accept()
    while True:
        data = await ws.receive_text()
        await ws.send_text(f"Echo: {data}")

@ws_router.websocket("/chat/{user_id}/{peer_id}")
@ws_auth_required
async def chat_endpoint(
    websocket: WebSocket,
    user_id: int,
    peer_id: int,
    db: AsyncSession = Depends(get_db)
):
    chat_id = get_chat_id(user_id, peer_id)
    await manager.connect(chat_id, user_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")
            message_data = data.get("message")

            if action == "add":
                new_message = Message(
                    text=message_data["text"],
                    sender_id=message_data["sender_id"],
                    recipient_id=message_data["recipient_id"]
                )
                db.add(new_message)
                await db.commit()
                await db.refresh(new_message)

                message_out = {
                    "action": "add",
                    "message": {
                        "id": new_message.id,
                        "text": new_message.text,
                        "sender_id": new_message.sender_id,
                        "recipient_id": new_message.recipient_id
                    }
                }

                await manager.broadcast(chat_id, message_out)

            elif action == "update":
                result = await db.execute(select(Message).where(Message.id == message_data["id"]))
                msg = result.scalars().first()
                if msg:
                    msg.text = message_data["text"]
                    db.add(msg)
                    await db.commit()
                    await db.refresh(msg)

                    message_out = {
                        "action": "update",
                        "message": {
                            "id": msg.id,
                            "text": msg.text,
                            "sender_id": msg.sender_id,
                            "recipient_id": msg.recipient_id
                        }
                    }

                    await manager.broadcast(chat_id, message_out)
            elif action == "delete":
                result = await db.execute(select(Message).where(Message.id == message_data["id"]))
                msg = result.scalars().first()
                if msg:
                    await db.delete(msg)
                    await db.commit()

                    message_out = {
                        "action": "delete",
                        "message": {"id": msg.id}
                    }

                    await manager.broadcast(chat_id, message_out)
    except WebSocketDisconnect:
        manager.disconnect(chat_id, user_id)


