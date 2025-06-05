import uuid
from models.base_model import Base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, UUID,  DateTime, ForeignKey

class Device(Base):
    __tablename__ = 'devices'
    id = Column(UUID(as_uuid=True), default=uuid.uuid4 , nullable=False, primary_key=True)
    name = Column(String, nullable=False)
    mac = Column(String, nullable=False)
    operation_model = Column(String, nullable=False, default="STAND_BY_MODE")
    description = Column(String, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    firmware_id = Column(UUID(as_uuid=True), ForeignKey('firmwares.id'), nullable=True)
    current_model_id = Column(UUID(as_uuid=True), ForeignKey('models.id'), nullable=True)
    created_time = Column(DateTime, nullable=False, server_default=func.now())
    updated_time = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_time = Column(DateTime, nullable=True)
    
    firmware = relationship("Firmware", foreign_keys=[firmware_id], back_populates="devices_using_this_firmware")
    current_model = relationship("Model", foreign_keys=[current_model_id], back_populates="devices_using_as_current_model")
    device_model_relations = relationship("DeviceModelRelation", back_populates="device")