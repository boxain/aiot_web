import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routes.user.router import router as user_router
from routes.device.router import router as device_router
from routes.firmware.router import router as firmware_router
from routes.model.router import router as model_router
from utils.sql_manage import init_db, clean_db
from middlewares.global_error_handler import global_exc_handler

# https://fastapi.tiangolo.com/advanced/events/#use-case
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await clean_db()


app = FastAPI(lifespan=lifespan)
global_exc_handler(app=app)

# https://fastapi.tiangolo.com/tutorial/cors/#use-corsmiddleware
origins = [
    "http://127.0.0.1:3000",
    "http://localhost:3000"
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user_router, prefix="/api/user", tags=["users"])
app.include_router(device_router, prefix="/api/device", tags=["device"])
app.include_router(firmware_router, prefix="/api/firmware", tags=["firmware"])
app.include_router(model_router, prefix="/api/model", tags=["model"])


if __name__ == '__main__':
    # https://myapollo.com.tw/blog/begin-to-asyncio/#google_vignette
    uvicorn.run("main:app", host='0.0.0.0', port=8000, reload=True, workers=1, ws_ping_interval=600, log_level="debug")

'''
Web Version 1.0
1. 頁面美化          

1. Log 實現 
2. Error handler
3. Error message
'''

'''
Device Version 1.0
1. task completed            
2. Model customizer
3. log
4. refactor
'''

'''
Version 2.0
1. MQTT
2. Notification
3. QR code provisioning
4. HTTPs
'''