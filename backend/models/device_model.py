import uuid
from models.base_model import Base
from sqlalchemy.sql import func
from sqlalchemy import Column, String, UUID,  DateTime, ForeignKey

class Device(Base):
    __tablename__ = 'devices'
    id = Column(UUID(as_uuid=True), default=uuid.uuid4 , nullable=False, primary_key=True)
    name = Column(String, nullable=False)
    mac = Column(String, nullable=False)
    operation_model = Column(String, nullable=False, default="stand by mode")
    description = Column(String, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    firmware_id = Column(UUID(as_uuid=True), ForeignKey('firmwares.id'), nullable=True)
    current_model_id = Column(UUID(as_uuid=True), ForeignKey('models.id'), nullable=True)
    created_time = Column(DateTime, nullable=False, server_default=func.now())
    updated_time = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_time = Column(DateTime, nullable=True)