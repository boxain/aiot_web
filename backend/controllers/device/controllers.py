import time
import json
import traceback
from datetime import datetime
from sqlalchemy import select, update
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from controllers.user.controllers import UserController
from models.device_model import Device, DeviceSchema
from models.firmware_model import Firmware
from models.model_model import Model
from models.device_to_model_model import DeviceModelRelation
import routes.device.request_schema as ReqeustSchema
from utils.connection_manage import ConnectionManager
from utils.config_manage import ConfigManage
import controllers.device.exception as DeviceExc
import controllers.model.exception as ModelExc
import controllers.firmware.exception as FirmwareExc
import controllers.user.exception as UserExc
import utils.exception as GeneralExc


class DeviceController:
    
    @classmethod
    async def create_device(cls, db: AsyncSession, user_name: str, password: str, chip: str, mac: str):
        try:
            query = select(Device.id).where(Device.mac == mac).where(Device.deleted_time == None)
            result = await db.execute(query)
            device_id = result.scalar_one_or_none()
            if device_id:
                device_auth = await UserController.device_authentication(db=db, username=user_name, password=password, device_id=str(device_id))
                return {
                    "success": device_auth.get("success", True),
                    "access_token": f"{device_auth.get('token_type', '')} {device_auth.get('access_token', '')}"
                }
            else:
                user_auth = await UserController.login(db=db, username=user_name, password=password)
                user_id = user_auth.get("data", {}).get("user_id", None)
                formatted_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
                device_name = f"{chip}-{formatted_time}"

                device_dict = {
                    "name": device_name,
                    "chip": chip,
                    "mac": mac,
                    "description": "",
                    "user_id": user_id
                }

                device = Device(**device_dict)
                db.add(device)
                await db.commit()
                await db.refresh(device)
                
                device_pydantic_obj = DeviceSchema.model_validate(device, from_attributes=True)
                device_data = json.loads(device_pydantic_obj.model_dump_json()) 
                await ConnectionManager.active_frontend_task(user_id=user_id, type="text", task="NEW_DEVICE", device=device_data)
                device_auth = await UserController.device_authentication(db=db, username=user_name, password=password, device_id=str(device.id))
                return {
                    "success": device_auth.get("success", True),
                    "access_token": f"{device_auth.get('token_type', '')} {device_auth.get('access_token', '')}"
                }


        except UserExc.AuthenticationError:
            await db.rollback()
            raise

        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Create device failed.", details=str(e))

        except Exception as e:
            await db.rollback()
            raise GeneralExc.UnknownError(message="Create device failed.", details=str(e))


    @classmethod
    async def get_devices(cls, db: AsyncSession, user_id: str):
        try:
            query = select(Device).where(Device.user_id == user_id).where(Device.deleted_time == None)
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
    async def get_device_with_deviceId(cls, db: AsyncSession, device_id: str, user_id: str):
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
            ).where(
                Device.deleted_time == None
            ).where(
                Device.user_id == user_id
            )

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
                raise DeviceExc.DeviceNotFound(details=f"Device with ID {device_id} not found or permission denied.")
            

        except DeviceExc.DeviceNotFound:
            raise

        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))
            
        except Exception as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))


    @classmethod
    async def delete_device(cls, db: AsyncSession, device_ids: list[str], user_id: str):
        try:
            query = update(Device)                           \
                .where(Device.id.in_(device_ids))            \
                .where(Device.user_id == user_id)            \
                .values(deleted_time=datetime.now())
            
            result = await db.execute(query)
            affected_rows = result.rowcount
            print("affected_rows: ", affected_rows)
            return { 
                "success": True,
                "message": "Delete device sucessfully."
            }

        except SQLAlchemyError as e:
            db.rollback()
            raise GeneralExc.DatabaseError(message=f"Delete device failed.", details=str(e))
        
        except Exception as e:
            db.rollback()
            raise GeneralExc.UnknownError(message=f"Delete device failed.", details=str(e))


    @classmethod
    async def firmware_deployment(cls, db: AsyncSession, user_id: str, device_id: str, firmware_id: str):
        try:
            # Make sure device, firmware exist
            query = select(Device).where(Device.id == device_id).where(Device.user_id == user_id).where(Device.deleted_time == None)
            result = await db.execute(query)
            device = result.scalar_one_or_none()
            if device is None:
                raise DeviceExc.DeviceNotFound(details=f"Device with ID {device_id} not found.")

            query = select(Firmware).where(Firmware.id == firmware_id ).where(Firmware.user_id == user_id).where(Firmware.deleted_time == None)
            result = await db.execute(query)
            firmware = result.scalar_one_or_none()
            if firmware is None:
                raise FirmwareExc.FirmwareNotFound(details=f"Firmware with ID {firmware_id} not found.")
            

            if not ConnectionManager.get_device_connection_state(device_id=device_id):
                raise DeviceExc.DeviceNotConnected(details=f"Cannot deploy firmware, device {device_id} is offline.")

            task_params = {
                "firmware_id": firmware_id,
                "firmware_name": firmware.name,
                "download_path":  f"{ConfigManage.SERVER_DOMAIN}/api/firmware/download/{user_id}/{firmware_id}"
            }
            await ConnectionManager.send_task_to_device(user_id=user_id, device_id=device_id, task="OTA", task_params=task_params)

            return { 
                "success": True,
                "message": "Send OTA updated message to device success !"
            }

        except DeviceExc.DeviceNotFound:
            raise

        except FirmwareExc.FirmwareNotFound:
            raise

        except DeviceExc.DeviceNotConnected:
            raise

        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Firmware deployment failed.", details=str(e))
            
        except Exception as e:
            print(traceback.format_exc())
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Firmware deployment failed.", details=str(e))


    @classmethod
    async def device_reset(cls, db: AsyncSession, user_id: str, device_id: str):
        try:
            # Make sure device exist
            query = select(Device).where(Device.id == device_id).where(Device.user_id == user_id).where(Device.deleted_time == None)
            result = await db.execute(query)
            device = result.scalar_one_or_none()

            if device is None:
                raise DeviceExc.DeviceNotFound(details=f"Device with ID {device_id} not found or permission denied.")
            
            if not ConnectionManager.get_device_connection_state(device_id=device_id):
                raise DeviceExc.DeviceNotConnected(details=f"Cannot reset device, device {device_id} is offline.")

            await ConnectionManager.send_task_to_device(user_id=user_id, device_id=device_id, task="RESET")

            return { 
                "success": True,
                "message": "Send reset task to device success !"
            }
        
        except DeviceExc.DeviceNotFound:
            raise

        except DeviceExc.DeviceNotConnected:
            raise

        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Device reset failed.", details=str(e))
            
        except Exception as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Device reset failed.", details=str(e))
        

    @classmethod
    async def model_inference(cls, db: AsyncSession, user_id: str, device_id: str):
        try:
            # Make sure device exist
            query = select(Device).where(Device.id == device_id).where(Device.user_id == user_id).where(Device.deleted_time == None)
            result = await db.execute(query)
            device = result.scalar_one_or_none()

            if device is None:
                raise DeviceExc.DeviceNotFound(details=f"Device with ID {device_id} not found or permission denied.")
            
            if not ConnectionManager.get_device_connection_state(device_id=device_id):
                raise DeviceExc.DeviceNotConnected(details=f"Cannot perform model inference, device {device_id} is offline.")

            await ConnectionManager.send_task_to_device(user_id=user_id, device_id=device_id, task="INFERENCE")

            return { 
                "success": True,
                "message": "Send model inference task to device success !"
            }
        
        except DeviceExc.DeviceNotFound:
            raise

        except DeviceExc.DeviceNotConnected:
            raise

        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Perform model inference failed.", details=str(e))
            
        except Exception as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Perform model inference failed.", details=str(e))
        
    
    @classmethod
    async def mode_switch(cls, db: AsyncSession, user_id: str, device_id: str, mode: str):
        try:
            # Make sure device exist
            query = select(Device).where(Device.id == device_id).where(Device.user_id == user_id).where(Device.deleted_time == None)
            result = await db.execute(query)
            device = result.scalar_one_or_none()

            if device is None:
                raise DeviceExc.DeviceNotFound(details=f"Device with ID {device_id} not found or permission denied.")
            
            if not ConnectionManager.get_device_connection_state(device_id=device_id):
                raise DeviceExc.DeviceNotConnected(details=f"Cannot switch operation mode, device {device_id} is offline.")

            task_params = {
                "mode": mode 
            }

            await ConnectionManager.send_task_to_device(user_id=user_id, device_id=device_id, task="MODE_SWITCH", task_params=task_params)

            return { 
                "success": True,
                "message": f"Send switch {mode} task to device success !"
            }
        

        except DeviceExc.DeviceNotFound:
            raise

        except DeviceExc.DeviceNotFound:
            raise

        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Perform operation mode switch failed.", details=str(e))
            
        except Exception as e:
            print(traceback.format_exc())
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Perform operation mode switch failed.", details=str(e))
        

    @classmethod
    async def model_deploy(cls, db: AsyncSession, user_id: str, device_id: str, model_id: str):
        try:
            # Make sure device exist
            query = select(Device).where(Device.id == device_id).where(Device.user_id == user_id).where(Device.deleted_time == None)
            result = await db.execute(query)
            device = result.scalar_one_or_none()

            if device is None:
                raise DeviceExc.DeviceNotFound(details=f"Device with ID {device_id} not found or permission denied.")

            # Make sure device have not download this model before
            query = select(DeviceModelRelation).where(DeviceModelRelation.device_id == device_id).where(DeviceModelRelation.model_id == model_id).where(DeviceModelRelation.deleted_time == None)
            result = await db.execute(query)
            relation_record = result.scalar_one_or_none()

            if relation_record:
                raise ModelExc.ModelAlreadyDeployed(details=f"Model {model_id} has already been deployed to device {device_id}.")


            if not ConnectionManager.get_device_connection_state(device_id=device_id):
                raise DeviceExc.DeviceNotConnected(details=f"Cannot deploy model, device {device_id} is offline.")

            task_params = {
                "model_id": model_id,
                "download_path": f"{ConfigManage.SERVER_DOMAIN}/api/model/download/{user_id}/{model_id}"
            }

            await ConnectionManager.send_task_to_device(user_id=user_id, device_id=device_id, task="MODEL_DOWNLOAD", task_params=task_params)

            return { 
                "success": True,
                "message": "Send model inference task to device success !"
            }


        except DeviceExc.DeviceNotFound:
            raise
        
        except DeviceExc.DeviceNotConnected:
            raise

        except ModelExc.ModelAlreadyDeployed:
            raise

        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Model deployment failed.", details=str(e))
            
        except Exception as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Model deployment failed.", details=str(e))
        

    @classmethod
    async def model_switch(cls, db: AsyncSession, user_id: str, device_id: str, model_id: str):
        try:
            # Make sure device and model exist
            query = select(Device).where(Device.id == device_id).where(Device.user_id == user_id).where(Device.deleted_time == None)
            result = await db.execute(query)
            device = result.scalar_one_or_none()
            if device is None:
                raise DeviceExc.DeviceNotFound(details=f"Device with ID {device_id} not found or permission denied.")

            query = select(Model).where(Model.id == model_id).where(Model.user_id == user_id).where(Model.deleted_time == None)
            result = await db.execute(query)
            model = result.scalar_one_or_none()
            if model is None:
                raise ModelExc.ModelNotFound(details=f"Model with ID {model_id} not found or permission denied.")
            
            if not ConnectionManager.get_device_connection_state(device_id=device_id):
                raise DeviceExc.DeviceNotConnected(details=f"Cannot switch model, device {device_id} is offline.")

            task_params = {
                "model_id": model_id,
                "model_name": model.name
            }
            await ConnectionManager.send_task_to_device(user_id=user_id, device_id=device_id, task="MODEL_SWITCH", task_params=task_params)

            return { 
                "success": True,
                "message": "Send model inference task to device success !"
            }
        
        except DeviceExc.DeviceNotFound:
            raise

        except ModelExc.ModelNotFound:
            raise

        except DeviceExc.DeviceNotConnected:
            raise

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

        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))
            
        except Exception as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Get device with deviceID failed.", details=str(e))