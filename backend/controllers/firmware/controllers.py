import os
import traceback
from datetime import datetime
from fastapi import UploadFile
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from models.firmware_model import Firmware
from utils.config_manage import ConfigManage
import utils.exception as GeneralExc

class FirmwareController:
    
    @classmethod
    async def create_firmware(cls, db: AsyncSession , file: UploadFile,  user_id: str, name: str, description: str):
        try:
            directory = f"{ConfigManage.STORAGE_PATH}/firmwares/{user_id}/"
            os.makedirs(directory, exist_ok=True)

            location = f"{directory}{name}"
            with open(location, "wb") as f:
                f.write(await file.read())
            
            firmware = Firmware(name=name, description=description, user_id=user_id)
            db.add(firmware)
            await db.commit()
            await db.refresh(firmware)
            return { 
                "success": True,
                "data": {
                    "firmwares": [firmware]
                },
                "message": "Upload firmware sucessfully."
            }

        except SQLAlchemyError as e:
            print(traceback.format_exc())
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Create firmware failed.", details=str(e))
        
        except Exception as e:
            print(traceback.format_exc())
            await db.rollback()
            raise GeneralExc.UnknownError(message="Create firmware failed.", details=str(e))
        

    @classmethod
    async def get_firmwares(cls, db: AsyncSession, user_id: str):
        try:

            query = select(Firmware).where(Firmware.deleted_time == None).where(Firmware.user_id == user_id)
            result = await db.execute(query)
            firmwares = result.scalars().all()

            return { 
                "success": True,
                "data": {
                    "firmwares": firmwares
                },
                "message": "Get firmwares sucessfully."
            }


        except SQLAlchemyError as e:
            raise GeneralExc.DatabaseError(message="Get firmwares failed.", details=str(e))
        
        except Exception as e:
            raise GeneralExc.UnknownError(message="Get firmwares failed.", details=str(e))


    @classmethod
    async def delete_firmware(cls, db: AsyncSession, firmware_id: str, user_id: str):
        try:

            query = update(Firmware)                         \
                .where(Firmware.id == firmware_id)           \
                .where(Firmware.user_id == user_id)          \
                .values(deleted_time=datetime.now())
            result = await db.execute(query)
            affected_rows = result.rowcount
            print("affected_rows: ", affected_rows)
            return { 
                "success": True,
                "message": "Delete firmware sucessfully."
            }


        except SQLAlchemyError as e:
            db.rollback()
            raise GeneralExc.DatabaseError(message=f"Delete firmware with {firmware_id} failed.", details=str(e))
        
        except Exception as e:
            db.rollback()
            raise GeneralExc.UnknownError(message=f"Delete firmware with {firmware_id} failed.", details=str(e))