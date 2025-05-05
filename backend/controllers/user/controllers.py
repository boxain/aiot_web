import jwt
import traceback
from datetime import datetime, timedelta, timezone
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.user_model import User
import routes.user.request_schema as RequestScheme
import controllers.user.exception as UserExc
import utils.exception as GeneralExc
from utils.config_manage import ConfigManage


class UserController:
    # https://fastapi.tiangolo.com/zh-hant/tutorial/security/oauth2-jwt/#hash-and-verify-the-passwords
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/user/login")


    @classmethod
    def verify_password(cls, plain_password: str, hashed_password: str):
        return cls.pwd_context.verify(plain_password, hashed_password)


    @classmethod
    def get_password_hash(cls, plain_password: str):
        return cls.pwd_context.hash(plain_password)



    @classmethod
    async def authenticate_user(cls, db: AsyncSession, username: str, password: str):
        query = select(User).where(User.name == username)
        result = await db.execute(query)
        user = result.scalar_one_or_none()

        if user is None:
            raise UserExc.AuthenticationError()
        
        if cls.verify_password(plain_password=password, hashed_password=user.password):
            return user
        else:
            raise UserExc.AuthenticationError()


    @classmethod
    def create_access_token(cls, data: dict, expire_delta = None):
        to_encode = data.copy()
        if expire_delta:
            expire = datetime.now(timezone.utc) + expire_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=15)

        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(payload=to_encode, key=ConfigManage.SECRET_KEY, algorithm=ConfigManage.ALGORITHM)
        return encoded_jwt
    

    @classmethod
    async def get_current_user(cls, token: str = Depends(oauth2_scheme)):
        try:
            payload = jwt.decode(jwt=token, key=ConfigManage.SECRET_KEY, algorithms=ConfigManage.ALGORITHM)
            return payload

        except InvalidTokenError as e:
            print(traceback.format_exc())
            raise GeneralExc.InValidTokenError(details=str(e))

        except ExpiredSignatureError as e:
            print(traceback.format_exc())
            raise GeneralExc.TokenExpiredError(details=str(e))

    
    @classmethod
    async def login(cls, db: AsyncSession, username: str, password: str):
        try:
            user = await cls.authenticate_user(db=db, username=username, password=password)
            payload = {
                "user_id": str(user.id),
                "username": user.name,
                "email": user.email
            }
            
            access_token_expires = timedelta(minutes=float(ConfigManage.ACCESS_TOKEN_EXPIRE_MINUTES))
            access_token = cls.create_access_token(data=payload, expire_delta=access_token_expires)

            return {
                "success": True,
                "data": payload,
                "access_token": access_token,
                "token_type": "bearer",
                "message": "login sucessfully."
            }
        
        except UserExc.AuthenticationError:
            raise

        
        except SQLAlchemyError as e:
            raise GeneralExc.DatabaseError(message="login failed", details=str(e))

        except Exception as e:
            raise GeneralExc.UnknownError(message="login failed", details=str(e))


    @classmethod
    async def register(cls, db: AsyncSession, params: RequestScheme.CreateUserParams):
        try:

            query = select(User).where(User.name==params.name)
            result = await db.execute(query)
            user = result.scalar_one_or_none()

            if user:
                raise Exception("Already have user")

            query = select(User).where(User.email==params.email)
            result = await db.execute(query)
            user = result.scalar_one_or_none()

            if user:
                raise Exception("Already have user")


            user_dict = params.model_dump()
            hashed_password = cls.get_password_hash(params.password)
            user_dict.update({"password": hashed_password})


            print("user dict: ", user_dict)
            user = User(**user_dict)
            db.add(user)
            await db.commit()

            return {
                "success": True,
                "message": "Register sucessfully."
            }
        
        except SQLAlchemyError as e:
            await db.rollback()
            raise GeneralExc.DatabaseError(message="register failed", details=str(e))

        except Exception as e:
            await db.rollback()
            raise GeneralExc.UnknownError(message="register failed", details=str(e))
            