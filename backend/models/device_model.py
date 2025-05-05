import uuid
from models.base_model import Base
from sqlalchemy.sql import func
from sqlalchemy import Column, Integer, String, UUID, Boolean, JSON, DateTime

class Device(Base):
    __tablename__ = 'devices'
    id = Column(UUID(as_uuid=True), default=uuid.uuid4 , nullable=False, primary_key=True)
    name = Column(String, nullable=False)
    mac = Column(String, nullable=False)
    description = Column(String, nullable=False)
    created_time = Column(DateTime, nullable=False, server_default=func.now())
    updated_time = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_time = Column(DateTime, nullable=True)