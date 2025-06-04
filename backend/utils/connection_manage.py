import io
import json
import base64
import asyncio
import traceback
from uuid import uuid4
from fastapi import WebSocket
from PIL import Image, ImageDraw
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
# from controllers.device.controllers import DeviceController


class TaskStatus:
    PENDING_ACK = "PENDING_ACK"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class ConnectionManager:

    active_devices: dict = {}
    active_frontends: dict = {}


    @classmethod
    async def connect_device(cls, user_id: str, device_id: str, websocket: WebSocket):
        if(device_id in cls.active_devices):
            del cls.active_devices[device_id]
            print(f"Removed existed device websocket connection due to new connection for device_id: {device_id}")

        cls.active_devices[device_id] = {
            "websocket": websocket,
            "connection_state": "connected",
            "user_id": user_id,
            "tasks": {}
        }
        print(f"active devices: {cls.active_devices[device_id]}")
        print(f"Created websocket device connection, device_id: {device_id}")
        await cls.active_frontend_task(user_id=user_id, task="CONNECTED", type="text", device_id=device_id)


    @classmethod
    async def disconnect_device(cls, user_id: str, device_id: str):
        if(device_id in cls.active_devices):
            del cls.active_devices[device_id]
            print(f"Cleaned up device websocket connection for device_id: {device_id}")
        print(f"Delete existed device websocket connection, device_id: {device_id}")
        await cls.active_frontend_task(user_id=user_id, task="DISCONNECTED", type="text", device_id=device_id)


    @classmethod    
    async def connect_frontend(cls, user_id: str, websocket: WebSocket):
        if(user_id in cls.active_frontends):
            del cls.active_frontends[user_id]
            print(f"Removed existed frontend websocket connection due to new connection for user_id: {user_id}")
        cls.active_frontends[user_id] = websocket
        print(f"Created websocket frontend connection, user_id: {user_id}")
        

    @classmethod
    async def disconnect_frontend(cls, user_id: str):
        if(user_id in cls.active_frontends):
            del cls.active_frontends[user_id]
            print(f"Cleaned up frontend websocket connection for user_id: {user_id}")
        print(f"Delete existed frontend websocket connection, user_id: {user_id}")


    @classmethod
    def get_device_connection_state(cls, device_id: str):
        if(device_id in cls.active_devices):
            connection_state = cls.active_devices.get(device_id).get("connection_state")
            return connection_state
        else:
            return None


    @classmethod
    def set_device_connection_state(cls, device_id: str, task_id: str, connection_state: str, task_status: str):
        if(device_id in cls.active_devices):
            cls.active_devices.get(device_id)["connection_state"] = connection_state
            cls.active_devices.get(device_id)["tasks"][task_id]["status"] = task_status
            return device_id
        else:
            return None


    @classmethod
    async def send_message_to_device(cls, device_id: str, message: str):
        if(device_id in cls.active_devices):
            websocket_connection: WebSocket = cls.active_devices.get(device_id).get("websocket")
            await websocket_connection.send_json(message)
        else:
            print(f"Websocket connection doen't exist for device_id: {device_id}")  


    @classmethod
    async def send_message_to_frontend(cls, user_id: str, message_type: str, message):
        if(user_id in cls.active_frontends):
            if message_type == "text":
                websocket_connection: WebSocket = cls.active_frontends[user_id]
                await websocket_connection.send_json(message)
            elif message_type == "byte":
                websocket_connection: WebSocket = cls.active_frontends[user_id]
                await websocket_connection.send_bytes(message)
        else:
            print(f"Websocket connection doen't exist for user_id: {user_id}")  


    @classmethod
    async def send_task_to_device(cls, user_id: str, device_id: str, task: str, task_params: Optional[Dict] = None):
       

        task_id = str(uuid4())
        message = {
            "task_id": task_id,
            "action": task,
            **(task_params if task_params else {})
        }

        cls.active_devices[device_id]["tasks"][task_id] = {
            "name": task,
            "status": TaskStatus.PENDING_ACK,
            "params": task_params
        }

        await cls.send_message_to_device(device_id, message)

    
    @classmethod
    async def active_frontend_task(cls, user_id: str, task: str, type: str, **kwargs):
        message = {
            "action": task,
            **kwargs
        }
        await cls.send_message_to_frontend(user_id, type, message)


    @classmethod
    def get_device_task(cls, device_id, task_id):
        if device_id in cls.active_devices:
            return cls.active_devices[device_id]["tasks"][task_id]
        else:
            return None


    @classmethod
    def device_info(cls, device_id: None):
        if device_id:
            if(device_id in cls.active_devices):
                print("Device info: ", cls.active_devices.get(device_id))
            else:
                print(f"Device: {device_id} is not in active devices object.")
        else:
            for key, value in cls.active_devices.items():
                print(f"Device: {key} info", value)


    @classmethod
    async def listen_device_message(cls, text_queue: asyncio.Queue, binary_queue: asyncio.Queue, db: AsyncSession, user_id:str, device_id: str, device_update_callback):
        while True:
            try:
                text_mes = await text_queue.get()
                
                if text_mes is None:
                    break
                    
                data: dict = json.loads(text_mes)
                action = data.get("action", None)
                task_id = data.get("task_id", None)
                status = data.get("status", None)

                if(action is None):
                    print("Error: The message doen't contain action")
                    continue

                if(action != "INFERENCE_RESULT" and task_id is None):
                    print("Error: The message doesn't contain task_id")
                    continue

                if(status is None):
                    print("Error: The message doesn't contain status")
                    continue

                
                match action:
                    case "MODE_SWITCH":
                        log_id = f"{user_id}:{device_id}"
                        print(f"{log_id} - Received MODE_SWITCH task.")

                        if status == "RECEIVED":
                            print(f"{log_id} - status *RECEIVED*")
                            cls.set_device_connection_state(device_id=device_id, task_id=task_id, connection_state="busy", task_status=TaskStatus.ACKNOWLEDGED)
                            cls.device_info(device_id=device_id)
                            await cls.active_frontend_task(user_id=user_id, task="MODE_SWITCH", type="text", device_id=device_id, status="RECEIVED")

                        elif status == "COMPLETED":
                            print(f"{log_id} - status *COMPLETED*")
                            cls.set_device_connection_state(device_id=device_id, task_id=task_id, connection_state="connected", task_status=TaskStatus.COMPLETED)
                            cls.device_info(device_id=device_id)
                            await cls.active_frontend_task(user_id=user_id, task="MODE_SWITCH", type="text", device_id=device_id, status="COMPLETED")
                            task_info = cls.get_device_task(device_id=device_id, task_id=task_id)
                            if task_info:
                                await device_update_callback(db, user_id, device_id, task_info)
                            else:
                                print("task info is None")

                        elif status == "ERROR":
                            print(f"{log_id} - status *ERROR*")
                            cls.set_device_connection_state(device_id=device_id, task_id=task_id, connection_state="connected", task_status=TaskStatus.FAILED)
                            cls.device_info(device_id=device_id)
                            await cls.active_frontend_task(user_id=user_id, task="MODE_SWITCH", type="text", device_id=device_id, status="ERROR")

                    case "OTA":
                        log_id = f"{user_id}:{device_id}"
                        print(f"{log_id} - Received OTA task.")

                        if status == "RECEIVED":
                            print(f"{log_id} - status *RECEIVED*")
                            cls.set_device_connection_state(device_id=device_id, task_id=task_id, connection_state="busy", task_status=TaskStatus.ACKNOWLEDGED)
                            cls.device_info(device_id=device_id)
                            await cls.active_frontend_task(user_id=user_id, task="OTA", type="text", device_id=device_id, status="RECEIVED")

                        elif status == "COMPLETED":
                            print(f"{log_id} - status *COMPLETED*")
                            cls.set_device_connection_state(device_id=device_id, task_id=task_id, connection_state="connected", task_status=TaskStatus.COMPLETED)
                            cls.device_info(device_id=device_id)
                            await cls.active_frontend_task(user_id=user_id, task="OTA", type="text", device_id=device_id, status="COMPLETED")

                        elif status == "ERROR":
                            print(f"{log_id} - status *ERROR*")
                            cls.set_device_connection_state(device_id=device_id, task_id=task_id, connection_state="connected", task_status=TaskStatus.FAILED)
                            cls.device_info(device_id=device_id)
                            await cls.active_frontend_task(user_id=user_id, task="OTA", type="text", device_id=device_id, status="ERROR")

                    case "MODEL_DOWNLOAD":
                        log_id = f"{user_id}:{device_id}"
                        print(f"{log_id} - Received MODEL_DOWNLOAD task.")

                        if status == "RECEIVED":
                            print(f"{log_id} - status *RECEIVED*")
                            cls.set_device_connection_state(device_id=device_id, task_id=task_id, connection_state="busy", task_status=TaskStatus.ACKNOWLEDGED)
                            cls.device_info(device_id=device_id)
                            await cls.active_frontend_task(user_id=user_id, task="MODEL_DOWNLOAD", type="text", device_id=device_id, status="RECEIVED")

                        elif status == "COMPLETED":
                            print(f"{log_id} - status *COMPLETED*")
                            cls.set_device_connection_state(device_id=device_id, task_id=task_id, connection_state="connected", task_status=TaskStatus.COMPLETED)
                            cls.device_info(device_id=device_id)
                            await cls.active_frontend_task(user_id=user_id, task="MODEL_DOWNLOAD", type="text", device_id=device_id, status="COMPLETED")
                            # await DeviceController.model_operational_mode_update(db=db, user_id=user_id, device_id=device_id)

                        elif status == "ERROR":
                            print(f"{log_id} - status *ERROR*")
                            cls.set_device_connection_state(device_id=device_id, task_id=task_id, connection_state="connected", task_status=TaskStatus.FAILED)
                            cls.device_info(device_id=device_id)
                            await cls.active_frontend_task(user_id=user_id, task="MODEL_DOWNLOAD", type="text", device_id=device_id, status="ERROR")

                    case "MODEL_SWITCH":
                        log_id = f"{user_id}:{device_id}"
                        print(f"{log_id} - Received MODEL_SWITCH task.")

                        if status == "RECEIVED":
                            print(f"{log_id} - status *RECEIVED*")
                            cls.set_device_connection_state(device_id=device_id, task_id=task_id, connection_state="busy", task_status=TaskStatus.ACKNOWLEDGED)
                            cls.device_info(device_id=device_id)
                            await cls.active_frontend_task(user_id=user_id, task="MODEL_SWITCH", type="text", device_id=device_id, status="RECEIVED")

                        elif status == "COMPLETED":
                            print(f"{log_id} - status *COMPLETED*")
                            cls.set_device_connection_state(device_id=device_id, task_id=task_id, connection_state="connected", task_status=TaskStatus.COMPLETED)
                            cls.device_info(device_id=device_id)
                            await cls.active_frontend_task(user_id=user_id, task="MODEL_SWITCH", type="text", device_id=device_id, status="COMPLETED")
                            # await DeviceController.model_operational_mode_update(db=db, user_id=user_id, device_id=device_id)

                        elif status == "ERROR":
                            print(f"{log_id} - status *ERROR*")
                            cls.set_device_connection_state(device_id=device_id, task_id=task_id, connection_state="connected", task_status=TaskStatus.FAILED)
                            cls.device_info(device_id=device_id)
                            await cls.active_frontend_task(user_id=user_id, task="MODEL_SWITCH", type="text", device_id=device_id, status="ERROR")

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

                            await cls.send_message_to_frontend(user_id=user_id, message_type="text", message=sending_message)

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

                            await cls.send_message_to_frontend(user_id=user_id, message_type="text", message=sending_message)

            except json.JSONDecodeError:
                print(traceback.format_exc())
            

            except asyncio.CancelledError:
                pass
                
            
            except Exception:
                print(traceback.format_exc())