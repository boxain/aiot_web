from pydantic import BaseModel
from enum import Enum

class CreateDeviceParams(BaseModel):
    name: str
    mac: str
    description: str

class FirmwareDeploymentParams(BaseModel):
    device_id: str
    firmware_id: str

class ModelDeploymentParams(BaseModel):
    device_id: str
    model_id: str

class ModeEnum(str, Enum):
    CONTINUOUS_MODE = "CONTINUOUS_MODE"
    STAND_BY_MODE = "STAND_BY_MODE"

class ModeSwtichParams(BaseModel):
    mode: ModeEnum