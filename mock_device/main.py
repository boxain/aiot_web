import asyncio
import websockets
import sys

async def simple_websocket_client(uri):
    try:
      
        async with websockets.connect(uri) as websocket:
            print(f"Connection create {uri}")

            while True:
                try:
                    incoming_message = await websocket.recv()
                    
                except websockets.exceptions.ConnectionClosedOK:
                    print("Connection cloed by Server.")
                    break
                except websockets.exceptions.ConnectionClosedError as e:
                    print(f"Connection closed by Error: {e}")
                    break
                except Exception as e:
                    print(f"Unkown error: {e}")
                    break


    except ConnectionRefusedError:
        print(f"Connection refuse: {uri}")
    except websockets.exceptions.InvalidURI:
         print(f"Invalid URI: {uri}")
    except Exception as e:
        print(f"Error Type: {type(e).__name__}")
        print(e)


if __name__ == "__main__":
    server_uri="ws://127.0.0.1:8000/api/device/ws/79d25121-7f10-4399-9b1c-a1b16c1e40b1/456"
    asyncio.run(simple_websocket_client(server_uri))