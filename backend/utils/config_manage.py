import os
from dotenv import load_dotenv

class ConfigManage:
    load_dotenv()

    # DB Config
    DB_USERNAME=os.getenv("DB_USERNAME")
    DB_PASSWORD=os.getenv("DB_PASSWORD")
    DB_HOST=os.getenv("DB_HOST")
    DB_NAME=os.getenv("DB_NAME")

    # Server Config
    SERVER_HOST=os.getenv("SERVER_HOST")
    SERVER_PORT=os.getenv("SERVER_PORT")
    SERVER_DOMAIN=os.getenv("SERVER_DOMAIN")

    # Local Storage Config
    STORAGE_PATH=os.getenv("STORAGE_PATH")

    # Authentication Config
    SECRET_KEY=os.getenv("SECRET_KEY")
    ALGORITHM=os.getenv("ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES=os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")


    @classmethod
    def get(cls, key, default=None):
        value = os.getenv(key, default)
        if value is None and default is None:
            raise KeyError(f"Enviroment config {key} does not exist")
        return value

