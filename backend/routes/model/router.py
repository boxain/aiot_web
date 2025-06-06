from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import FileResponse
from fastapi import APIRouter,  Depends, File, UploadFile, Form
from controllers.model.controllers import ModelController
from controllers.user.controllers import UserController
from utils.sql_manage import get_db


router = APIRouter()


@router.post("")
async def create_model(
    file: UploadFile = File(...),
    name: str = Form(...),
    description = Form(...),
    model_type: str = Form(...),
    labels: str = Form(...),
    db: AsyncSession = Depends(get_db), 
    current_user = Depends(UserController.get_current_user)
):
    return await ModelController.create_model(db=db, user_id=current_user.get("user_id", None), file=file, name=name, description=description, model_type=model_type, labels=labels)


@router.get("")
async def get_models(db: AsyncSession = Depends(get_db), current_user = Depends(UserController.get_current_user)):
    return await ModelController.get_models(db=db, user_id=current_user.get("user_id", None))


@router.get("/device/{device_id}")
async def get_models_by_device_id(device_id: str, db: AsyncSession = Depends(get_db), current_user = Depends(UserController.get_current_user)):
    return await ModelController.get_models_by_device_id(db=db, device_id=device_id, user_id=current_user.get("user_id", None))


@router.delete("/{model_id}")
async def delete_model(model_id: str, db: AsyncSession = Depends(get_db), current_user = Depends(UserController.get_current_user)):
    return await ModelController.delete_model(db=db, model_id=model_id, user_id=current_user.get("user_id", None))


@router.get("/download/{user_id}/{model_id}")
async def model_download(user_id: str, model_id: str, db: AsyncSession = Depends(get_db)):
    return await ModelController.download_model(db=db, model_id=model_id, user_id=user_id)