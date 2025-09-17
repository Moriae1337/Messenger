from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    sender_id = Column(Integer, ForeignKey("users.id"))
    recipient_id = Column(Integer, ForeignKey("users.id"))

    sender = relationship("User", back_populates="messages_sent", foreign_keys=[sender_id])
    recipient = relationship("User", back_populates="messages_received", foreign_keys=[recipient_id])