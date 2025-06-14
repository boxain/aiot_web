import os
import json
import uuid
import traceback
import asyncio
from pathlib import Path
from datetime import datetime
from fastapi import UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from models.model_model import Model
from models.device_model import Device
from models.device_to_model_model import DeviceModelRelation
from utils.config_manage import ConfigManage
import utils.exception as GeneralExc
import controllers.model.exception as ModelExc

class ModelController:
    
    @classmethod
    async def create_model(cls, db: AsyncSession , file: UploadFile,  user_id: str, name: str, description: str, model_type: str, labels: str):
        model = None
        try:
            query = select(Model).where(Model.user_id == user_id, Model.name == name, Model.deleted_time == None)
            result = await db.execute(query)
            if result.scalar_one_or_none():
                raise ModelExc.ModelAlreadyExists(details=f"Model with name '{name}' already exists.")
    
            model_id = uuid.uuid4()
            parsed_labels = json.loads(labels)

            original_filename = file.filename
            file_extension = Path(original_filename).suffix
            directory = f"{ConfigManage.STORAGE_PATH}/models/{user_id}/"
            file_path = f"{directory}{model_id}.{file_extension}"
            
            model = Model(id=model_id, name=name, description=description, user_id=user_id, model_type=model_type, labels=parsed_labels, file_path=file_path)
            db.add(model)
            await db.commit()
            await db.refresh(model)

            
            os.makedirs(directory, exist_ok=True)
            with open(file_path, "wb") as f:
                f.write(await file.read())

            return { 
                "success": True,
                "data": {
                    "models": [model]
                },
                "message": "Upload model sucessfully."
            }
        

        except ModelExc.ModelAlreadyExists:
            raise

        
        except json.JSONDecodeError as e:
            raise ModelExc.InvalidLabelFormat(details=str(e))
        

        except IOError as e:
            if model and model.id:
                await db.delete(model)
                await db.commit()
            raise ModelExc.ModelUploadFailed(details=str(e))

        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Create model failed.", details=str(e))
        
        except Exception as e:
            await db.rollback()
            raise GeneralExc.UnknownError(message="Create model failed.", details=str(e))
        

    @classmethod
    async def get_models(cls, db: AsyncSession, user_id: str):
        try:

            query = select(Model).where(Model.deleted_time == None).where(Model.user_id == user_id)
            result = await db.execute(query)
            models = result.scalars().all()

            return { 
                "success": True,
                "data": {
                    "models": models
                },
                "message": "Get models sucessfully."
            }


        except SQLAlchemyError as e:
            raise GeneralExc.DatabaseError(message="Get models failed.", details=str(e))
        
        except Exception as e:
            raise GeneralExc.UnknownError(message="Get models failed.", details=str(e))


    @classmethod
    async def get_models_by_device_id(cls, db: AsyncSession, user_id: str, device_id: str):
        try:
            # await asyncio.sleep(5)
            query = (
                select(Model)
                .join(DeviceModelRelation, DeviceModelRelation.model_id == Model.id)
                .where(DeviceModelRelation.device_id == device_id)
                .where(Model.user_id == user_id)
                .where(Model.deleted_time == None)
            )

            result = await db.execute(query)
            models = result.scalars().all()

            return { 
                "success": True,
                "data": {
                    "models": models
                },
                "message": "Get models sucessfully."
            }


        except SQLAlchemyError as e:
            raise GeneralExc.DatabaseError(message="Get models failed.", details=str(e))
        
        except Exception as e:
            raise GeneralExc.UnknownError(message="Get models failed.", details=str(e))


    @classmethod
    async def delete_model(cls, db: AsyncSession, model_id: str, user_id: str):
        try:
            query = select(Model).where(Model.user_id == user_id, Model.id == model_id, Model.deleted_time == None)
            result = await db.execute(query)
            if result.scalar_one_or_none() is None:
                raise ModelExc.ModelNotFound(details=f"Model with id '{model_id}' does not exists.")

            query = select(Device.id)                             \
                .where(Device.current_model_id == model_id)       \
                .where(Device.deleted_time == None)
            
            result = await db.execute(query)
            device_id = result.scalar_one_or_none()
            if device_id:
                raise ModelExc.ModelInUse(details=f"Model is the active model for device ID: {device_id}")
            
            query_relation = select(DeviceModelRelation.device_id).where(DeviceModelRelation.model_id == model_id)
            result_relation = await db.execute(query_relation)
            related_device_id = result_relation.scalar_one_or_none()
            if related_device_id:
                raise ModelExc.ModelInUse(details=f"Model has been deployed to device ID: {related_device_id}")


            query = update(Model)                         \
                .where(Model.id == model_id)              \
                .where(Model.user_id == user_id)          \
                .values(deleted_time=datetime.now())
            result = await db.execute(query)
            affected_rows = result.rowcount
            print("affected_rows: ", affected_rows)
            return { 
                "success": True,
                "message": "Delete model sucessfully."
            }


        except ModelExc.ModelNotFound:
            raise

        except ModelExc.ModelInUse:
            raise

        except SQLAlchemyError as e:
            db.rollback()
            raise GeneralExc.DatabaseError(message=f"Delete firmware with {model_id} failed.", details=str(e))
        
        except Exception as e:
            db.rollback()
            raise GeneralExc.UnknownError(message=f"Delete firmware with {model_id} failed.", details=str(e))
        

    @classmethod
    async def download_model(cls, db: AsyncSession, model_id, user_id: str):
        try:

            query = select(Model).where(Model.user_id == user_id).where(Model.id == model_id).where(Model.deleted_time == None)
            result = await db.execute(query)
            model = result.scalar_one_or_none()

            if model is None:
                raise ModelExc.ModelNotFound(details=f"Model with ID {model_id} not found.")
            
            path = model.file_path
            if not os.path.exists(path):
                raise ModelExc.PhysicalModelFileNotFound(details=f"File for model ID {model_id} is missing at path: {path}")

            return FileResponse(path)


        except ModelExc.ModelNotFound:
            raise

        except ModelExc.PhysicalModelFileNotFound:
            raise

        except SQLAlchemyError as e:
            raise GeneralExc.DatabaseError(message="Get models failed.", details=str(e))
        
        except Exception as e:
            raise GeneralExc.UnknownError(message="Get models failed.", details=str(e))