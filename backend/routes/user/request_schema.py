from pydantic import BaseModel, EmailStr

class CreateUserParams(BaseModel):
    name: str
    email: EmailStr
    password: str