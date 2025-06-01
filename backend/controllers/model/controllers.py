import os
import json
import traceback
from datetime import datetime
from fastapi import UploadFile
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from models.model_model import Model
from utils.config_manage import ConfigManage
import utils.exception as GeneralExc

class ModelController:
    
    @classmethod
    async def create_model(cls, db: AsyncSession , file: UploadFile,  user_id: str, name: str, description: str, model_type: str, labels: str):
        try:

            parsed_labels = json.loads(labels)
            directory = f"{ConfigManage.STORAGE_PATH}/models/{user_id}/"
            os.makedirs(directory, exist_ok=True)

            location = f"{directory}{name}"
            with open(location, "wb") as f:
                f.write(await file.read())
            
            # 補上儲存路徑
            model = Model(name=name, description=description, user_id=user_id, model_type=model_type, labels=parsed_labels)
            db.add(model)
            await db.commit()
            await db.refresh(model)

            return { 
                "success": True,
                "data": {
                    "models": [model]
                },
                "message": "Upload model sucessfully."
            }
        
        except json.JSONDecodeError:
            print("Not json format")


        except SQLAlchemyError as e:
            print(traceback.format_exc())
            await db.rollback()
            raise GeneralExc.DatabaseError(message="Create model failed.", details=str(e))
        
        except Exception as e:
            print(traceback.format_exc())
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
    async def delete_model(cls, db: AsyncSession, model_id: str, user_id: str):
        try:

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


        except SQLAlchemyError as e:
            db.rollback()
            raise GeneralExc.DatabaseError(message=f"Delete firmware with {model_id} failed.", details=str(e))
        
        except Exception as e:
            db.rollback()
            raise GeneralExc.UnknownError(message=f"Delete firmware with {model_id} failed.", details=str(e))