import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.future import select

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
    """
    初始化資料庫（如有需要）
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        # print(Base.metadata.tables.keys())
        await conn.run_sync(Base.metadata.create_all)
    
# Clean DB Reousrces    
async def clean_db():
    # Close db connection pools
    await engine.dispose()


# 簡單的 CRUD 操作示例
class CRUDBase:
    """
    基礎 CRUD 操作類
    """
    def __init__(self, model):
        self.model = model
    
    async def get(self, db: AsyncSession, id: int):
        """獲取單個項目"""
        result = await db.execute(select(self.model).filter(self.model.id == id))
        return result.scalars().first()
    
    async def get_multi(self, db: AsyncSession, skip: int = 0, limit: int = 100):
        """獲取多個項目"""
        result = await db.execute(select(self.model).offset(skip).limit(limit))
        return result.scalars().all()
    
    async def create(self, db: AsyncSession, obj_in):
        """創建項目"""
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def update(self, db: AsyncSession, db_obj, obj_in):
        """更新項目"""
        obj_data = obj_in
        for field in obj_data:
            if hasattr(db_obj, field) and field != "id":
                setattr(db_obj, field, obj_data[field])
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
    
    async def remove(self, db: AsyncSession, id: int):
        """删除項目"""
        obj = await self.get(db, id)
        if obj:
            await db.delete(obj)
            await db.commit()
        return obj

# 使用示例
"""
# 定義模型示例
class Bird(Base):
    __tablename__ = "birds"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    species = Column(String)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 創建 CRUD 操作類
bird_crud = CRUDBase(Bird)

# 在 FastAPI 路由中使用
@app.get("/birds/{bird_id}")
async def read_bird(bird_id: int, db: AsyncSession = Depends(get_db)):
    bird = await bird_crud.get(db, bird_id)
    if bird is None:
        raise HTTPException(status_code=404, detail="Bird not found")
    return bird
"""

# https://ithelp.ithome.com.tw/articles/10330027