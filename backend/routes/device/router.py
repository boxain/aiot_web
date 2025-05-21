import os
import io
import json
import traceback
import asyncio
from datetime import datetime
from typing import Annotated
from PIL import Image, ImageDraw
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import FileResponse
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, WebSocketException, Depends


from utils.sql_manage import get_db
import routes.device.request_schema as ReqeustScheme
from controllers.device.controllers import DeviceController
from controllers.user.controllers import UserController
from utils.connection_manage import ConnectionManager


router = APIRouter()

@router.post("/")
async def create_device(params: ReqeustScheme.CreateDeviceParams, db: AsyncSession = Depends(get_db), current_user = Depends(UserController.get_current_user)):
    return await DeviceController.create_device(db=db, params=params)


@router.get("/")
async def get_devices(db: AsyncSession = Depends(get_db), current_user = Depends(UserController.get_current_user)):
    return await DeviceController.get_devices(db=db)


@router.get("/{device_id}")
async def get_device_with_id(device_id: str, db: AsyncSession = Depends(get_db), current_user = Depends(UserController.get_current_user)):
    return await DeviceController.get_device_with_deviceId(db=db, device_id=device_id)


async def process_device_websocket_data(text_queue: asyncio.Queue, binary_queue: asyncio.Queue, user_id:str, device_id: str, manager: ConnectionManager):
    while True:
        try:
            text_mes = await text_queue.get()
            
            if text_mes is None:
                print(f"Server received termination signal from {device_id}")
                 
            data = json.loads(text_mes)
            print("Received data: ", data)

            
            if(not data.get("action", None)):
                print("Error: The message doen't contain action")
            else:
                match data['action']:
                    case "START_INFERENCE":
                        print(f"Received action: START_INFERENCE\nStatus: {data['status']}")

                    case "STOP_INFERENCE":
                        print(f"Received action: STOP_INFERENCE\nStatus: {data['status']}")

                    case "INFERENCE_RESULT":
                        binary_mes = await binary_queue.get()
                        
                        if binary_mes is None:
                            print(f"Server received wrong inference serial from {device_id}")
                            continue

                        await manager.send_message_to_frontend(user_id=user_id, message_type="bytes", message=binary_mes)
                        
                        content = data.get("content", None)
                        if content and "bounding_boxes" in content:
                    
                            bounding_boxes = content.get("bounding_boxes")
                            if not isinstance(bounding_boxes, list):
                                print(f"{device_id} Error: bounding_boxes is not a list.")
                            
                            

                            print(f"{device_id} Processing image...")


                            image_stream = io.BytesIO(binary_mes)
                            image = Image.open(image_stream)
                            if image.mode != "RGB":
                                image = image.convert("RGB")

                            draw = ImageDraw.Draw(image)
                            for box in bounding_boxes:
                                if len(box) == 4:
                                    left_up_x, left_up_y, right_down_x, right_down_y = map(int, box)
                                    draw.rectangle(
                                        [(left_up_x, left_up_y), (right_down_x, right_down_y)],
                                        outline="red",
                                        width=3
                                    )
                                else:
                                    print(f"[{device_id}] Warning: Invalid bounding box format: {box}")
                            

                            # try:
                            #     timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                            #     filename = f"{mac_id}_{timestamp}.jpg"
                            #     save_path = os.path.join("public", filename)

                                
                            #     image.save(save_path, format='JPEG') 
                            #     print(f"[{mac_id}] Image successfully saved to: {save_path}")

                            # except Exception as save_err:
                            #     print(f"[{mac_id}] Failed to save image locally to {save_path}: {save_err}")
                            #     traceback.print_exc()



                            output_stream = io.BytesIO()
                            image.save(output_stream, format="JPEG")
                            image_bytes_with_boxes = output_stream.getvalue()

                            await ConnectionManager.send_message_to_frontend(user_id=user_id, message_type="bytes", message=image_bytes_with_boxes)


                
        except json.JSONDecodeError:
            print(traceback.format_exc())
            print(e)
        

        except asyncio.CancelledError:
            print(traceback.format_exc())
            print(e)
        
        except Exception as e:
            print(traceback.format_exc())
            print(e)


@router.websocket("/ws/{user_id}/{mac}")
async def websocket_init(user_id: str, mac: str, websocket: WebSocket, db: AsyncSession = Depends(get_db)):
    text_queue = asyncio.Queue(maxsize=50)
    binary_queue = asyncio.Queue(maxsize=50)
    
    try:
        device_id = await DeviceController.create_device(db=db, user_id=user_id, mac=mac)

        await websocket.accept()
        await ConnectionManager.connect_device(user_id=user_id , device_id=device_id, websocket=websocket)
        asyncio.create_task(process_device_websocket_data(text_queue, binary_queue, user_id, device_id, ConnectionManager))

        while True:
            
            data = await websocket.receive()
            if "text" in data:

                try:
                    await asyncio.wait_for(text_queue.put(data.get("text", None)), timeout=1.0)
                except asyncio.TimeoutError:
                    print(f"Queue put timed out for text message from {device_id}. Queue might be full.")


            elif "bytes" in data:
                try:
                     await asyncio.wait_for(binary_queue.put(data.get("bytes", None)), timeout=1.0)
                except asyncio.TimeoutError:
                     print(f"Queue put timed out for bytes message from {device_id}. Queue might be full.")

            

    except WebSocketDisconnect:
        print("Websocket disconnected")
        await ConnectionManager.disconnect_device(user_id=user_id, device_id=device_id)
    
    except WebSocketException:
        print("Websocket exception")
        await ConnectionManager.disconnect_device(user_id=user_id, device_id=device_id)

    except Exception as e:
        print(traceback.format_exc())
        print("Unknown exception")
        await ConnectionManager.disconnect_device(user_id=user_id, device_id=device_id)


# 換到 firmware route
@router.get("/ota/{user_id}/{firmware_id}")
async def ota_update(user_id: str, firmware_id: str, db: AsyncSession = Depends(get_db)):
    firmware_path = "firmware/version_1.bin"
    return FileResponse(firmware_path)


@router.post("/firmware/deployment")
async def firmware_deployment(params: ReqeustScheme.FirmwareDeploymentParams, db: AsyncSession = Depends(get_db), current_user = Depends(UserController.get_current_user)):
    return await DeviceController.firmware_deployment(db=db, user_id=current_user.get('user_id', None), device_id=params.device_id, firmware_id=params.firmware_id)


@router.get("/reset/{device_id}")
async def device_reset(device_id: str, db: AsyncSession = Depends(get_db), current_user = Depends(UserController.get_current_user)):
    return await DeviceController.device_reset(db=db, user_id=current_user.get('user_id', None), device_id=device_id)


@router.get("/inference/{device_id}")
async def model_inference(device_id: str, db: AsyncSession = Depends(get_db), current_user = Depends(UserController.get_current_user)):
    return await DeviceController.model_inference(db=db, user_id=current_user.get('user_id', None), device_id=device_id)


@router.post("/mode_switch/{device_id}")
async def model_switch(params: ReqeustScheme.ModeSwtichParams, device_id: str, db: AsyncSession = Depends(get_db), current_user = Depends(UserController.get_current_user)):
    return await DeviceController.mode_switch(db=db, user_id=current_user.get('user_id', None), device_id=device_id, mode=params.mode)