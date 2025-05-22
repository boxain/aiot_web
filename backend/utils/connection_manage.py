from fastapi import WebSocket

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
            "connection_state": "connected"
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
    def get_device_connection_state(cls, device_id: str):
        if(device_id in cls.active_devices):
            connection_state = cls.active_devices.get(device_id).get("connection_state")
            return connection_state
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
    async def send_message_to_frontend(cls, user_id: str, message_type: str, message):
        if(user_id in cls.active_frontends):
            if message_type == "text":
                websocket_connection: WebSocket = cls.active_frontends[user_id]
                await websocket_connection.send_json(message)
            elif message_type == "bytes":
                websocket_connection: WebSocket = cls.active_frontends[user_id]
                await websocket_connection.send_bytes(message)
        else:
            print(f"Websocket connection doen't exist for user_id: {user_id}")  


    @classmethod
    async def active_device_task(cls, device_id: str, task: str, **kwargs):
        message = {
            "action": task,
            **kwargs
        }
        await cls.send_message_to_device(device_id, message)

    
    @classmethod
    async def active_frontend_task(cls, user_id: str, task: str, type: str, **kwargs):
        message = {
            "action": task,
            **kwargs
        }
        await cls.send_message_to_frontend(user_id, type, message)