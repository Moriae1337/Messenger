from sqlalchemy import Column, Integer, String, ForeignKey, DateTime,func
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    url = Column(String(1024), nullable=False)
    content_type = Column(String(50), nullable=False)
    size = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime, default=func.now())
    
    message_id = Column(Integer, ForeignKey("messages.id"))
    message = relationship("Message", back_populates="attachments")
