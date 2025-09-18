from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from core import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True,autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    created_at = Column(DateTime, default=func.now())

    messages_sent = relationship("Message", back_populates="sender", foreign_keys="[Message.sender_id]",passive_deletes=True)
    messages_received = relationship("Message", back_populates="recipient", foreign_keys="[Message.recipient_id]",passive_deletes=True)
