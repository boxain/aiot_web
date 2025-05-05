import json
import traceback
from typing import Annotated
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

import routes.user.request_schema as RequestScheme
from controllers.user.controllers import UserController
from utils.sql_manage import get_db
from utils.connection_manage import ConnectionManager


router = APIRouter()


@router.post("/login")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: AsyncSession = Depends(get_db)):
    return await UserController.login(db=db, username=form_data.username, password=form_data.password)


@router.post("/register")
async def register(params: RequestScheme.CreateUserParams, db: AsyncSession = Depends(get_db)):
    return await UserController.register(db=db, params=params)


@router.websocket("/ws/{user_id}")
async def websocket_init(websocket: WebSocket, user_id: str):
    # https://github.com/fastapi/fastapi/issues/2370
    try:
        await websocket.accept()
        await ConnectionManager.connect_frontend(user_id=user_id, websocket=websocket)

        while True:
            data = await websocket.receive_json()
            print(data)

            
    except WebSocketDisconnect:
        print("Websocket disconnected")
        await ConnectionManager.disconnect_frontend(user_id=user_id)
    
    except WebSocketException:
        print("Websocket exception")
        await ConnectionManager.disconnect_frontend(user_id=user_id)

    except Exception as e:
        print(traceback.format_exc())
        print("Unknown excpetion")