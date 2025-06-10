import os
import json
import time
import asyncio
import random
import websockets


async def init_task(status: str, delay: int):
    print(f'INIT - status: {status}, delay: {delay}')
    await asyncio.sleep(delay=delay)
    return {
        "action": "INIT",
        "status": status,
    }


async def OTA_task(task_id: str, status: str, delay: int):
    print(f'OTA - status: {status}, delay: {delay}')
    await asyncio.sleep(delay=delay)
    return {
        "action": "OTA",
        "task_id": task_id,
        "status": status,
    }


async def mode_switch_task(task_id: str, status: str, delay: int):
    print(f'MODE SWITCH - status: {status}, delay: {delay}')
    await asyncio.sleep(delay=delay)

    response = {
        "action": "MODE_SWITCH",
        "task_id": task_id,
        "status": status,
    }
    return response


async def inference_task(delay: int):
    print(f'INFERENCE - delay: {delay}')
    await asyncio.sleep(delay=delay)
    image_path = os.path.join(os.path.dirname(__file__), "images", "image_1.png")
    with open(image_path, "rb") as f:
        image_bytes = f.read()

    text_response = {
        "action": "INFERENCE_RESULT",
        "status": "COMPLETED"
    }
    return text_response, image_bytes


async def model_download_task(task_id: str, status: str, delay: int):
    print(f'MODEL DOWNLOAD - status: {status}, delay: {delay}')
    await asyncio.sleep(delay=delay)

    response = {
        "action": "MODEL_DOWNLOAD",
        "task_id": task_id,
        "status": status,
    }
    return response


async def model_switch_task(task_id: str, status: str, delay: int):
    print(f'MODEL SWITCH - status: {status}, delay: {delay}')
    await asyncio.sleep(delay=delay)

    response = {
        "action": "MODEL_SWITCH",
        "task_id": task_id,
        "status": status,
    }
    return response


async def send_periodic_logs(websocket):
    log_levels = ["info", "warning", "error"]
    print("Log sending task started.")
    while True:
        try:
            await asyncio.sleep(1) 
            level = random.choice(log_levels)
            
            # 建立日誌訊息
            log_message = {
                "action": "LOG",
                "level": level,
                "message": f"This is a test log message at {int(time.time())}",
                "status": "COMPLETED"
            }
            
            await websocket.send(json.dumps(log_message))
            print(f"--> Sent log: {log_message}")

        except websockets.exceptions.ConnectionClosed:
            print("Connection closed. Stopping log sending task.")
            break
        except Exception as e:
            print(f"An error occurred in send_periodic_logs: {e}")
            break


async def handle_received_messages(websocket):
    print("Message receiving task started.")
    async for message in websocket:
        try:
            data = json.loads(message)
            action = data.get("action")
            print(f"<-- Received action: {action}")
            print("Received message: ", data)
            print("="*30)

            if action == "INIT":
                response = await init_task(status="COMPLETED", delay=5)
                await websocket.send(json.dumps(response))

            elif action == "OTA":
                task_id = data.get("task_id", None)
                response = await OTA_task(task_id=task_id, status="RECEIVED", delay=3)
                await websocket.send(json.dumps(response))
                response = await OTA_task(task_id=task_id, status="COMPLETED", delay=5)
                await websocket.send(json.dumps(response))

            elif action == "MODE_SWITCH":
                task_id = data.get("task_id", None)
                response = await mode_switch_task(task_id=task_id, status="RECEIVED", delay=3)
                await websocket.send(json.dumps(response))
                response = await mode_switch_task(task_id=task_id, status="COMPLETED", delay=5)
                await websocket.send(json.dumps(response))

            elif action == "MODEL_DOWNLOAD":
                task_id = data.get("task_id", None)
                response = await model_download_task(task_id=task_id, status="RECEIVED", delay=3)
                await websocket.send(json.dumps(response))
                response = await model_download_task(task_id=task_id, status="COMPLETED", delay=5)
                await websocket.send(json.dumps(response))
                
            elif action == "MODEL_SWITCH":
                task_id = data.get("task_id", None)
                response = await model_switch_task(task_id=task_id, status="RECEIVED", delay=3)
                await websocket.send(json.dumps(response))
                response = await model_switch_task(task_id=task_id, status="COMPLETED", delay=5)
                await websocket.send(json.dumps(response))

            elif action == "INFERENCE":
                text_response, bytes_response = await inference_task(delay=2)
                await websocket.send(message=bytes_response)
                await websocket.send(message=json.dumps(text_response))
                
            else:
                print(f"Unknown action received: {action}")
            
            print("="*30)

        except json.JSONDecodeError:
            print("Invalid JSON received from server")
        except Exception as e:
            print(f"An error occurred in handle_received_messages: {e}")


async def websocket_client(uri, token):
    try:
        headers = {
            "Authorization": token
        }

        async with websockets.connect(uri, extra_headers=headers) as websocket:
            print(f"Connection created: {uri}")
            receive_task = asyncio.create_task(handle_received_messages(websocket))
            # log_task = asyncio.create_task(send_periodic_logs(websocket))

            await asyncio.gather(
                receive_task,
                # log_task
            )

    except ConnectionRefusedError:
        print(f"Connection refused: {uri}")
    except websockets.exceptions.InvalidURI:
        print(f"Invalid URI: {uri}")
    except Exception as e:
        print(f"Error Type: {type(e).__name__}")
        print(e)


if __name__ == "__main__":
    protocal = input("Enter protocal(ws or wss): ").strip()
    while not protocal:
        protocal = "ws"
    
    domain = input("Enter domain: ").strip()
    while not domain:
        domain = "127.0.0.1"

    port = input("Enter port: ").strip()
    while not port:
        port = "8000"  
        

    token = input("Enter token: ").strip()
    while not token:
        token = ""

    server_uri=f"{protocal}://{domain}:{port}/api/device/ws"
    
    asyncio.run(websocket_client(server_uri, token))