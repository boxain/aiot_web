import uuid
from models.base_model import Base
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy import Column, String, UUID, DateTime, JSON, ForeignKey

class Model(Base):
    __tablename__ = 'models'
    id = Column(UUID(as_uuid=True), default=uuid.uuid4 , nullable=False, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    model_type = Column(String, nullable=False)
    labels = Column(JSON, nullable=False)
    file_path = Column(String, nullable=False)
    created_time = Column(DateTime, nullable=False, server_default=func.now())
    updated_time = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_time = Column(DateTime, nullable=True)

    devices_using_as_current_model = relationship("Device", foreign_keys="[Device.current_model_id]", back_populates="current_model")
    device_model_relations_to_devices = relationship("DeviceModelRelation", back_populates="model")