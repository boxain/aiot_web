from pydantic import BaseModel
import typing

class CreateDeviceParams(BaseModel):
    name: str
    mac: str
    description: str