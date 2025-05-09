from pydantic import BaseModel
import typing

class CreateDeviceParams(BaseModel):
    name: str
    mac: str
    description: str

class ConnectionParams(BaseModel):
    ssid: str
    password: str