import os
from typing import AsyncGenerator
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

from models.base_model import Base
from utils.config_manage import ConfigManage


# DB connection config
DATABASE_URL = os.environ.get("DATABASE_URL", f"postgresql+asyncpg://{ConfigManage.DB_USERNAME}:{ConfigManage.DB_PASSWORD}@{ConfigManage.DB_HOST}/{ConfigManage.DB_NAME}")
print(DATABASE_URL)
# Create Async Engine
engine = create_async_engine(DATABASE_URL, echo=False)

# Create Async session
async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Get DB session
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Init DB Table
async def init_db():
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all)
        # print(Base.metadata.tables.keys())
        await conn.run_sync(Base.metadata.create_all)
    
# Clean DB Reousrces    
async def clean_db():
    # Close db connection pools
    await engine.dispose()

# https://ithelp.ithome.com.tw/articles/10330027