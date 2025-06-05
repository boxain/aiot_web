import traceback
from datetime import datetime
from sqlalchemy import select, update
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession



from models.device_model import Device
from models.firmware_model import Firmware
from models.model_model import Model
from models.device_to_model_model import DeviceModelRelation
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
            query = select(
                Device,
                Model.name.label("model_name"), # Model 的 name
                Firmware.name.label("firmware_name") # Firmware 的 name
            ).outerjoin(
                Model, Device.current_model_id == Model.id
            ).outerjoin(
                Firmware, Device.firmware_id == Firmware.id
            ).where(
                Device.id==device_id
            )

            print(query)
            result = await db.execute(query)
            row = result.first()
            
            if row:
                device = row[0]
                device.model_name = row.model_name
                device.firmware_name = row.firmware_name

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
            
            else:
                return { 
                    "success": False,
                    "data": {
                        "devices": []
                    },
                    "message": f"Device with ID {device_id} not found."
                }

        except SQLAlchemyError as e:
            print(traceback.format_exc())
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))
            
        except Exception as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))


    @classmethod
    async def firmware_deployment(cls, db: AsyncSession, user_id: str, device_id: str, firmware_id: str):
        try:
            # Make sure device, firmware exist
            query = select(Device).where(Device.id == device_id).where(Device.user_id == user_id).where(Device.deleted_time == None)
            result = await db.execute(query)
            device = result.scalar_one_or_none()
            if device is None:
                print("Dvice not found, raise Error")

            query = select(Firmware).where(Firmware.id == firmware_id ).where(Firmware.user_id == user_id).where(Firmware.deleted_time == None)
            result = await db.execute(query)
            firmware = result.scalar_one_or_none()
            if firmware is None:
                print("Firmware not found, raise Error")

            task_params = {
                "firmware_id": firmware_id,
                "firmware_name": firmware.name,
                "download_path":  f"http://192.168.1.102:8000/api/device/ota/{user_id}/{firmware_id}"
            }
            await ConnectionManager.send_task_to_device(user_id=user_id, device_id=device_id, task="OTA", task_params=task_params)

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

            await ConnectionManager.send_task_to_device(user_id=user_id, device_id=device_id, task="RESET")

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

            await ConnectionManager.send_task_to_device(user_id=user_id, device_id=device_id, task="INFERENCE")

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

            task_params = {
                "mode": mode 
            }

            await ConnectionManager.send_task_to_device(user_id=user_id, device_id=device_id, task="MODE_SWITCH", task_params=task_params)

            return { 
                "success": True,
                "message": f"Send switch {mode} task to device success !"
            }

        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))
            
        except Exception as e:
            print(traceback.format_exc())
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

            task_params = {
                "model_id": model_id,
                "download_path": f"http://192.168.1.103:8000/api/model/download/{user_id}/{model_id}"
            }

            await ConnectionManager.send_task_to_device(user_id=user_id, device_id=device_id, task="MODEL_DOWNLOAD", task_params=task_params)

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
            # Make sure device and model exist
            query = select(Device).where(Device.id == device_id).where(Device.user_id == user_id).where(Device.deleted_time == None)
            result = await db.execute(query)
            device = result.scalar_one_or_none()
            if device is None:
                print("Dvice not found, raise Error")

            query = select(Model).where(Model.id == model_id).where(Model.user_id == user_id).where(Model.deleted_time == None)
            result = await db.execute(query)
            model = result.scalar_one_or_none()
            if model is None:
                print("Model not found, raise Error")

            task_params = {
                "model_id": model_id,
                "model_name": model.name
            }
            await ConnectionManager.send_task_to_device(user_id=user_id, device_id=device_id, task="MODEL_SWITCH", task_params=task_params)

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
    async def task_completion_update(cls, db: AsyncSession, user_id: str, device_id: str, task_info: dict):
        try:
            update_values = {}
            task_name = task_info["name"]
            # result = None
            print("task_info: ", task_info)

            if task_name == "MODEL_DOWNLOAD":
                device_model_relation = DeviceModelRelation(**{"device_id": device_id, "model_id": task_info["params"]["model_id"]})
                db.add(device_model_relation)
                await db.commit()

            else: 
                if task_name == "MODE_SWITCH":
                    update_values["operation_model"] = task_info["params"]["mode"]
                elif task_name == "OTA":
                    update_values["firmware_id"] = task_info["params"]["firmware_id"]
                elif task_name == "MODEL_SWITCH":
                    update_values["current_model_id"] = task_info["params"]["model_id"]

                query = update(Device)                         \
                    .where(Device.id == device_id)             \
                    .where(Device.user_id == user_id)          \
                    .values(update_values)
                await db.execute(query)
                await db.commit()
            
            # affected_rows = result.rowcount
            # if affected_rows == 0 :
            #     print("Dvice not found, raise Error")
            # print("affected_rows: ", affected_rows)


        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))
            
        except Exception as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))