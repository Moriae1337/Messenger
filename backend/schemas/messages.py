from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class MessageBase(BaseModel):
    text: str
    sender_id: int
    recipient_id: int

class MessageCreate(MessageBase):
    attachments: Optional[List[int]] = []

class MessageRead(MessageBase):
    id: int
    created_at: datetime
    attachments: Optional[List["AttachmentRead"]] = [] 

    class Config:
        orm_mode = True