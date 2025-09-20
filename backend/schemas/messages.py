from __future__ import annotations
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

from .attachments import AttachmentRead

class MessageBase(BaseModel):
    text: str
    sender_id: int
    recipient_id: int

class MessageCreate(MessageBase):
    attachments: Optional[List[int]] = []

class MessageRead(MessageBase):
    id: int
    created_at: datetime = Field(..., alias="timestamp")
    attachments: Optional[List[AttachmentRead]] = [] 

    class Config:
        orm_mode = True

MessageRead.model_rebuild()