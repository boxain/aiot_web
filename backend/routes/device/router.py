import os
import io
import json
import base64
import traceback
import asyncio
from datetime import datetime
from typing import Annotated
from PIL import Image, ImageDraw
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import FileResponse
from starlette.websockets import WebSocketState 
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


async def process_device_websocket_data(text_queue: asyncio.Queue, binary_queue: asyncio.Queue, db: AsyncSession, user_id:str, device_id: str, manager: ConnectionManager):
    # update database when received "completed"
    while True:
        try:
            text_mes = await text_queue.get()
            
            if text_mes is None:
                break
                 
            data: dict = json.loads(text_mes)
            
            if(not data.get("action", None)):
                print("Error: The message doen't contain action")
            else:
                match data['action']:
                    case "MODE_SWITCH":
                        log_id = f"{user_id}:{device_id}"
                        print(f"{log_id} - Received MODE_SWITCH task.")

                        status = data.get("status", None)
                        if status is None:
                            print(f"{log_id} - Invalid status.")
                        elif status == "RECEIVED":
                            print(f"{log_id} - status *RECEIVED*")
                            manager.set_device_connection_state(device_id=device_id, connection_state="busy")
                            await manager.active_frontend_task(user_id=user_id, task="MODE_SWITCH", type="text", device_id=device_id, status="RECEIVED")
  
                        elif status == "COMPLETED":
                            print(f"{log_id} - status *COMPLETED*")
                            manager.set_device_connection_state(device_id=device_id, connection_state="connected")
                            await manager.active_frontend_task(user_id=user_id, task="MODE_SWITCH", type="text", device_id=device_id, status="COMPLETED")

                        elif status == "ERROR":
                            print(f"{log_id} - status *ERROR*")
                            manager.set_device_connection_state(device_id=device_id, connection_state="connected")
                            await manager.active_frontend_task(user_id=user_id, task="MODE_SWITCH", type="text", device_id=device_id, status="ERROR")


                    case "OTA":
                        log_id = f"{user_id}:{device_id}"
                        print(f"{log_id} - Received OTA task.")

                        status = data.get("status", None)
                        if status is None:
                            print(f"{log_id} - Invalid status.")
                        elif status == "RECEIVED":
                            print(f"{log_id} - status *RECEIVED*")
                            manager.set_device_connection_state(device_id=device_id, connection_state="busy")
                            await manager.active_frontend_task(user_id=user_id, task="OTA", type="text", device_id=device_id, status="RECEIVED")
  
                        elif status == "COMPLETED":
                            print(f"{log_id} - status *COMPLETED*")
                            manager.set_device_connection_state(device_id=device_id, connection_state="connected")
                            await manager.active_frontend_task(user_id=user_id, task="OTA", type="text", device_id=device_id, status="COMPLETED")

                        elif status == "ERROR":
                            print(f"{log_id} - status *ERROR*")
                            manager.set_device_connection_state(device_id=device_id, connection_state="connected")
                            await manager.active_frontend_task(user_id=user_id, task="OTA", type="text", device_id=device_id, status="ERROR")


                    case "INFERENCE_RESULT":
                        binary_mes = await binary_queue.get()
                        
                        if binary_mes is None:
                            print(f"Server received wrong inference serial from {device_id}")
                            continue

                        content = data.get("content", None)
                        if content is None or "inference_results" not in content:
                            print("INFERENCE_RESULT:", device_id)
                            encoded_image = base64.b64encode(binary_mes).decode("utf-8")
                            sending_message = {
                                "action": "INFERENCE_RESULT",
                                "device_id": device_id,
                                "image_data": encoded_image
                            }

                            await manager.send_message_to_frontend(user_id=user_id, message_type="text", message=sending_message)

                        elif content and "inference_results" in content:
                    
                            inference_results = content.get("inference_results")
                            if not isinstance(inference_results, list):
                                print(f"{device_id} Error: inference_results is not a list.")
                            
                            
                            print(f"{device_id} Processing image...")
                            image_stream = io.BytesIO(binary_mes)
                            image = Image.open(image_stream)
                            if image.mode != "RGB":
                                image = image.convert("RGB")

                            draw = ImageDraw.Draw(image)
                            for result in inference_results:
                                print(f"Inference result category: {result.get('category', None)}, score: {result.get('score', None)}")
                                if len(result["box"]) == 4:
                                    left_up_x, left_up_y, right_down_x, right_down_y = map(int, result["box"])
                                    draw.rectangle(
                                        [(left_up_x, left_up_y), (right_down_x, right_down_y)],
                                        outline="red",
                                        width=3
                                    )
                                else:
                                    print(f"[{device_id}] Warning: Invalid bounding box format: {result.get('box', None)}")
                            
                            output_stream = io.BytesIO()
                            image.save(output_stream, format="JPEG")
                            image_bytes_with_boxes = output_stream.getvalue()
                            encoded_image = base64.b64encode(image_bytes_with_boxes).decode("utf-8")
                            sending_message = {
                                "action": "INFERENCE_RESULT",
                                "device_id": device_id,
                                "image_data": encoded_image
                            }

                            await manager.send_message_to_frontend(user_id=user_id, message_type="text", message=sending_message)


        except json.JSONDecodeError:
            print(traceback.format_exc())
        

        except asyncio.CancelledError:
            pass
            
        
        except Exception:
            print(traceback.format_exc())


@router.websocket("/ws/{user_id}/{mac}")
async def websocket_init(user_id: str, mac: str, websocket: WebSocket, db: AsyncSession = Depends(get_db)):
    text_queue = asyncio.Queue(maxsize=50)
    binary_queue = asyncio.Queue(maxsize=50)
    process_task = None
    device_id = None

    try:
        device_id = await DeviceController.create_device(db=db, user_id=user_id, mac=mac)

        await websocket.accept()
        await ConnectionManager.connect_device(user_id=user_id , device_id=device_id, websocket=websocket)
        process_task = asyncio.create_task(process_device_websocket_data(text_queue, binary_queue, db, user_id, device_id, ConnectionManager))

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
        log_id = f"{user_id}:{device_id}" if device_id else f"{user_id}:{mac}"
        print(f"[{log_id}] WebSocket disconnected by client.")

    except Exception as e:
        log_id = f"{user_id}:{device_id}" if device_id else f"{user_id}:{mac}"
        print(f"[{log_id}] An unexpected error occurred in websocket_init: {type(e).__name__} - {e}")
        print(traceback.format_exc())
        # Attempt to close the WebSocket gracefully if it's not already closed by the exception.
        if websocket.client_state != WebSocketState.DISCONNECTED:
            try:
                await websocket.close(code=1011)
            except RuntimeError as re: # e.g., "Cannot call 'close' once a close message has been sent."
                print(f"[{log_id}] Error trying to close websocket during exception handling: {re}")
            except Exception as close_ex:
                 print(f"[{log_id}] Further exception during websocket.close() in error handler: {close_ex}")

    finally:
        log_id = f"{user_id}:{device_id}" if device_id else f"{user_id}:{mac}"
        print(f"[{log_id}] Cleaning up resources for WebSocket connection...")

        if device_id:
            await ConnectionManager.disconnect_device(user_id=user_id, device_id=device_id)

        # 1. Signal the processing task to shut down by putting None in queues.
        if text_queue: # Check if initialized
            try:
                text_queue.put_nowait(None)
                print(f"[{log_id}] Sent None to text_queue for task shutdown.")
            except asyncio.QueueFull:
                print(f"[{log_id}] Text queue full when trying to send None. Task might be stuck or already exited.")
            except Exception as qe_text:
                print(f"[{log_id}] Error putting None to text_queue: {qe_text}")

        # 2. Cancel the task and wait for it to finish.
        if process_task and not process_task.done():
            print(f"[{log_id}] Cancelling process_task...")
            process_task.cancel()
            try:
                await asyncio.wait_for(process_task, timeout=5.0) # Wait for task to finish
                print(f"[{log_id}] process_task joined after cancellation signal.")
            except asyncio.CancelledError:
                print(f"[{log_id}] process_task was cancelled and handled cancellation.")
            except asyncio.TimeoutError:
                print(f"[{log_id}] Timeout waiting for process_task to finish after cancellation.")
            except Exception as e_task:
                print(f"[{log_id}] Exception while awaiting cancelled process_task: {e_task}")
        elif process_task and process_task.done():
            print(f"[{log_id}] process_task was already done.")
        
        print(f"[{log_id}] WebSocket cleanup complete.")


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


@router.get("/model_download/{device_id}/{model_id}")
async def model_download(device_id: str, model_id:str, db: AsyncSession = Depends(get_db)):
    return await DeviceController.model_download(db=db, user_id="6e837227-93b7-461b-bc73-caa9828b7f26", device_id=device_id, model_id=model_id)


@router.get("/model_switch/{device_id}/{model_id}")
async def model_download(device_id: str, model_id:str, db: AsyncSession = Depends(get_db)):
    return await DeviceController.model_switch(db=db, user_id="6e837227-93b7-461b-bc73-caa9828b7f26", device_id=device_id, model_id=model_id)