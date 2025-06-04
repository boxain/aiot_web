import os
import json
import asyncio
import websockets


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


async def simple_websocket_client(uri):
    try:
      
        async with websockets.connect(uri) as websocket:
            print(f"Connection create {uri}")

            while True:
                message = await websocket.recv()
                try:
                    data = json.loads(message)
                    action = data.get("action")

                    if action == "OTA":
                        print("="*30)
                        print("Start OTA Task")
                        print("Received mesage: ", data)
                        task_id = data.get("task_id", None)
                        response = await OTA_task(task_id=task_id, status="RECEIVED", delay=3)
                        await websocket.send(json.dumps(response))
                        response = await OTA_task(task_id=task_id, status="COMPLETED", delay=5)
                        await websocket.send(json.dumps(response))
                        print("End OTA Task")
                        print("="*30)

                    elif action == "MODE_SWITCH":
                        print("="*30)
                        print("Start MODE_SWITCH Task")
                        print("Received mesage: ", data)
                        task_id = data.get("task_id", None)
                        response = await mode_switch_task(task_id=task_id, status="RECEIVED", delay=3)
                        await websocket.send(json.dumps(response))
                        response = await mode_switch_task(task_id=task_id, status="COMPLETED", delay=5)
                        await websocket.send(json.dumps(response))
                        print("End MODE_SWITCH Task")
                        print("="*30)

                    elif action == "INFERENCE":
                        print("="*30)
                        print("Start INFERENCE Task")
                        text_response, bytes_response = await inference_task(delay=2)
                        await websocket.send(message=bytes_response)
                        await websocket.send(message=json.dumps(text_response))
                        print("End INFERENCE Task")
                        print("="*30)

                    else:
                        print(f"Unknown action received: {action}")

                except json.JSONDecodeError:
                    print("Invalid JSON received from server")

    except ConnectionRefusedError:
        print(f"Connection refuse: {uri}")
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

    user_id = input("Enter user_id: ").strip()
    while not user_id:
        user_id = "b70e1454-75d8-4ff0-bc2f-3f6b055a6e92"
        
    mac_id = input("Enter mac_id: ").strip()
    while not mac_id:
        mac_id = "123"

    server_uri=f"{protocal}://{domain}:{port}/api/device/ws/{user_id}/{mac_id}"
    
    asyncio.run(simple_websocket_client(server_uri))