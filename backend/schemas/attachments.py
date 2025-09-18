from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AttachmentBase(BaseModel):
    filename: str
    url: str
    content_type: Optional[str] = None
    size: Optional[int] = None

class AttachmentCreate(AttachmentBase):
    message_id: int

class AttachmentRead(AttachmentBase):
    id: int
    uploaded_at: datetime

    class Config:
        orm_mode = True