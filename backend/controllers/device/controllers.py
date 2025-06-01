import traceback
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


from models.device_model import Device
from models.firmware_model import Firmware
import routes.device.request_schema as ReqeustSchema
from utils.connection_manage import ConnectionManager
import utils.exception as GeneralExc


class DeviceController:
    
    @classmethod
    async def create_device(cls, db: AsyncSession, user_id: str, mac: str):
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
                "user_id": user_id
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

            for dev in devices:
                connection_state = ConnectionManager.get_device_connection_state(device_id=str(dev.id))
                if connection_state:
                    dev.status = connection_state
                else:
                    dev.status = "disconnected"

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

            connection_state = ConnectionManager.get_device_connection_state(device_id=str(device.id))
            if connection_state:
                device.status = connection_state
            else:
                device.status = "disconnected"
            
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
    async def firmware_deployment(cls, db: AsyncSession, user_id: str, device_id: str, firmware_id: str):
        try:
            # Make sure device exist
            query = select(Device).where(Device.id == device_id).where(Device.user_id == user_id).where(Device.deleted_time == None)
            result = await db.execute(query)
            device = result.scalar_one_or_none()

            if device is None:
                print("Dvice not found, raise Error")

            # Make sure firmware exist
            query = select(Firmware).where(Firmware.id == firmware_id ).where(Firmware.user_id == user_id).where(Firmware.deleted_time == None)
            result = await db.execute(query)
            firmware = result.scalar_one_or_none()

            if firmware is None:
                print("Firmware not found, raise Error")

            
            # Prepare params for send task to device
            download_path = f"http://192.168.1.102:8000/api/device/ota/{user_id}/{firmware_id}"
            await ConnectionManager.active_device_task(device_id=device_id, task="OTA", download_path=download_path)

            return { 
                "success": True,
                "message": "Send OTA updated message to device success !"
            }

        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))
            
        except Exception as e:
            print(traceback.format_exc())
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))


    @classmethod
    async def device_reset(cls, db: AsyncSession, user_id: str, device_id: str):
        try:
            # Make sure device exist
            query = select(Device).where(Device.id == device_id).where(Device.user_id == user_id).where(Device.deleted_time == None)
            result = await db.execute(query)
            device = result.scalar_one_or_none()

            if device is None:
                print("Dvice not found, raise Error")

            await ConnectionManager.active_device_task(device_id=device_id, task="RESET")

            return { 
                "success": True,
                "message": "Send reset task to device success !"
            }

        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))
            
        except Exception as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))
        

    @classmethod
    async def model_inference(cls, db: AsyncSession, user_id: str, device_id: str):
        try:
            # Make sure device exist
            query = select(Device).where(Device.id == device_id).where(Device.user_id == user_id).where(Device.deleted_time == None)
            result = await db.execute(query)
            device = result.scalar_one_or_none()

            if device is None:
                print("Dvice not found, raise Error")

            await ConnectionManager.active_device_task(device_id=device_id, task="INFERENCE")

            return { 
                "success": True,
                "message": "Send model inference task to device success !"
            }

        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))
            
        except Exception as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))
        
    
    @classmethod
    async def mode_switch(cls, db: AsyncSession, user_id: str, device_id: str, mode: str):
        try:
            # Make sure device exist
            query = select(Device).where(Device.id == device_id).where(Device.user_id == user_id).where(Device.deleted_time == None)
            result = await db.execute(query)
            device = result.scalar_one_or_none()

            if device is None:
                print("Dvice not found, raise Error")

            await ConnectionManager.active_device_task(device_id=device_id, task="MODE_SWITCH", mode=mode)

            return { 
                "success": True,
                "message": f"Send switch {mode} task to device success !"
            }

        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))
            
        except Exception as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))
        

    @classmethod
    async def model_deploy(cls, db: AsyncSession, user_id: str, device_id: str, model_id: str):
        try:
            # Make sure device exist
            query = select(Device).where(Device.id == device_id).where(Device.user_id == user_id).where(Device.deleted_time == None)
            result = await db.execute(query)
            device = result.scalar_one_or_none()

            if device is None:
                print("Dvice not found, raise Error")

            download_path = f"http://192.168.1.103:8000/api/model/download/{user_id}/{model_id}"
            await ConnectionManager.active_device_task(device_id=device_id, task="MODEL_DOWNLOAD", model_id=model_id, download_path=download_path)

            return { 
                "success": True,
                "message": "Send model inference task to device success !"
            }

        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))
            
        except Exception as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))
        

    @classmethod
    async def model_switch(cls, db: AsyncSession, user_id: str, device_id: str, model_id: str):
        try:
            # Make sure device exist
            query = select(Device).where(Device.id == device_id).where(Device.user_id == user_id).where(Device.deleted_time == None)
            result = await db.execute(query)
            device = result.scalar_one_or_none()

            if device is None:
                print("Dvice not found, raise Error")

            await ConnectionManager.active_device_task(device_id=device_id, task="MODEL_SWITCH", model_id=model_id)

            return { 
                "success": True,
                "message": "Send model inference task to device success !"
            }

        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))
            
        except Exception as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))