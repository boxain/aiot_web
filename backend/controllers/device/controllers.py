import traceback
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

import routes.device.request_schema as ReqeustSchema
import utils.exception as GeneralExc
from models.device_model import Device

class DeviceController:
    
    @classmethod
    async def create_device(cls, db: AsyncSession, mac: str):
        try:

            query = select(Device.id).where(Device.mac == mac)
            result = await db.execute(query)
            device_id = result.scalar_one_or_none()
            if device_id:
                return str(device_id)
            
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            device_dict = {
                "name": f"Device_{timestamp}",
                "mac": mac,
                "description": "",
            }

            device = Device(**device_dict)
            db.add(device)
            await db.commit()
            await db.refresh(device)
            return str(device.id)


        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Create device failed.", details=str(e))

        except Exception as e:
            await db.rollback()
            raise GeneralExc.UnknownError(message="Create device failed.", details=str(e))


    @classmethod
    async def get_devices(cls, db: AsyncSession):
        try:
            query = select(Device)
            result = await db.execute(query)
            devices = result.scalars().all()

            return { 
                "success": True,
                "data": {
                    "devices": devices
                },
                "message": "Get devices sucessfully."
            }

        except SQLAlchemyError as e:
            raise GeneralExc.DatabaseError(message="Get devices failed.", details=str(e))
            
        except Exception as e:
            raise GeneralExc.UnknownError(message="Get devices failed.", details=str(e))


    @classmethod
    async def get_device_with_deviceId(cls, db: AsyncSession, device_id: str):
        try:
            query = select(Device).where(Device.id == device_id)
            result = await db.execute(query)
            device = result.scalar_one_or_none()
            
            return { 
                "success": True,
                "data": {
                    "devices": [device]
                },
                "message": "Get device with deviceID sucessfully."
            }

        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))
            
        except Exception as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))


    @classmethod
    async def connection(cls, params: ReqeustSchema.ConnectionParams): 
        # perform ESP-IDF connection
        print("ssid: ", params.ssid)
        print("password: ", params.password)