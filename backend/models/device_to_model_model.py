import uuid
from models.base_model import Base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy import Column, UUID, DateTime, ForeignKey

class DeviceModelRelation(Base):
    __tablename__ = 'device_to_model'
    id = Column(UUID(as_uuid=True), default=uuid.uuid4 , nullable=False, primary_key=True)
    device_id = Column(UUID(as_uuid=True), ForeignKey('devices.id'), nullable=False)
    model_id = Column(UUID(as_uuid=True), ForeignKey('models.id'), nullable=False)
    created_time = Column(DateTime, nullable=False, server_default=func.now())
    updated_time = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_time = Column(DateTime, nullable=True)

    device = relationship("Device", back_populates="device_model_relations")
    model = relationship("Model", back_populates="device_model_relations_to_devices")