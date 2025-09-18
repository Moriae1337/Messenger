from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey,func 
from sqlalchemy.orm import relationship
from core import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=func.now())

    sender_id = Column(Integer, ForeignKey("users.id",ondelete="CASCADE"),nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id",ondelete="CASCADE"),nullable=False)

    sender = relationship("User", back_populates="messages_sent", foreign_keys=[sender_id])
    recipient = relationship("User", back_populates="messages_received", foreign_keys=[recipient_id])

    attachments = relationship("Attachment", back_populates="message", passive_deletes=True)