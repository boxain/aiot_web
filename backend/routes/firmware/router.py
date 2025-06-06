from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, File, Form, UploadFile
from utils.sql_manage import get_db
import routes.device.request_schema as ReqeustScheme
from controllers.firmware.controllers import FirmwareController
from controllers.user.controllers import UserController


router = APIRouter()

@router.post("")
async def create_firmware(
    file: UploadFile = File(...),
    name: str = Form(...),
    description = Form(...),
    db: AsyncSession = Depends(get_db), 
    current_user = Depends(UserController.get_current_user)
):
    return await FirmwareController.create_firmware(db=db, user_id=current_user.get("user_id", None), file=file, name=name, description=description)


@router.get("")
async def get_firmwares(db: AsyncSession = Depends(get_db), current_user = Depends(UserController.get_current_user)):
    return await FirmwareController.get_firmwares(db=db, user_id=current_user.get("user_id", None))


@router.delete("/{firmware_id}")
async def delete_firmware(firmware_id: str, db: AsyncSession = Depends(get_db), current_user = Depends(UserController.get_current_user)):
    return await FirmwareController.delete_firmware(db=db, firmware_id=firmware_id, user_id=current_user.get("user_id", None))


@router.get("/download/{user_id}/{firmware_id}")
async def model_download(user_id: str, firmware_id: str, db: AsyncSession = Depends(get_db)):
    return await FirmwareController.download_firmware(db=db, firmware_id=firmware_id, user_id=user_id)
