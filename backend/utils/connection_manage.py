from fastapi import WebSocket

class ConnectionManager:

    active_devices: dict = {}
    active_frontends: dict = {}


    @classmethod
    async def connect_device(cls, mac_id: str, websocket: WebSocket):
        if(mac_id in cls.active_devices):
            old_connected: WebSocket = cls.active_devices.get(mac_id)
            await old_connected.close()
            del cls.active_devices[mac_id]
            print(f"Delete existed device websocket connection, user_id: {mac_id}")
        cls.active_devices[mac_id] = websocket
        print(f"Created websocket device connection, user_id: {mac_id}")
        

    @classmethod
    async def disconnect_device(cls, mac_id: str):
        if(mac_id in cls.active_devices):
            old_connected: WebSocket = cls.active_devices.get(mac_id)
            await old_connected.close()
            del cls.active_devices[mac_id]
        print(f"Delete existed device websocket connection, user_id: {mac_id}")


    @classmethod
    async def send_message_to_device(cls, mac_id: str, message: str):
        if(mac_id in cls.active_devices):
            websocket_connection: WebSocket = cls.active_devices[mac_id]
            await websocket_connection.send_json(message)
        else:
            print(f"Websocket connection doen't exist for mac_id: {mac_id}")  


    @classmethod    
    async def connect_frontend(cls, user_id: str, websocket: WebSocket):
        if(user_id in cls.active_frontends):
            old_connected: WebSocket = cls.active_frontends.get(user_id)
            await old_connected.close()
            del cls.active_frontends[user_id]
            print(f"Delete existed frontend websocket connection, user_id: {user_id}")
        cls.active_frontends[user_id] = websocket
        print(f"Created websocket frontend connection, user_id: {user_id}")
        

    @classmethod
    async def disconnect_frontend(cls, user_id: str):
        if(user_id in cls.active_frontends):
            old_connected: WebSocket = cls.active_frontends.get(user_id)
            await old_connected.close()
            del cls.active_frontends[user_id]
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
