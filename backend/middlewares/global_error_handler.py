# https://fastapi.tiangolo.com/tutorial/handling-errors/#fastapis-httpexception-vs-starlettes-httpexception
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.requests import Request

import utils.exception as GeneralExc
import controllers.user.exception as UserExc


def database_exe_handler(request: Request, exc: GeneralExc.DatabaseError):
    response_data = {
        "success": False,
        "data": None,
        "message": exc.message,
        "error": {
            "code": exc.code,
            "details": exc.details,
        }
    }
    return JSONResponse(status_code=500, content=response_data)  


def unknown_exe_handler(request: Request, exc: GeneralExc.UnknownError):
    response_data = {
        "success": False,
        "data": None,
        "message": exc.message,
        "error": {
            "code": exc.code,
            "details": exc.details,
        }
    }
    return JSONResponse(status_code=500, content=response_data) 


def invalid_token_exe_handler(request: Request, exc: GeneralExc.InValidTokenError):
    response_data = {
        "success": False,
        "data": None,
        "message": exc.message,
        "error": {
            "code": exc.code,
            "details": exc.details,
        }
    }
    return JSONResponse(status_code=exc.status_code, content=response_data) 


def token_expired_exe_handler(request: Request, exc: GeneralExc.TokenExpiredError):
    response_data = {
        "success": False,
        "data": None,
        "message": exc.message,
        "error": {
            "code": exc.code,
            "details": exc.details,
        }
    }
    return JSONResponse(status_code=exc.status_code, content=response_data)  


def auth_exe_handler(request: Request, exc: UserExc.AuthenticationError):
    response_data = {
        "success": False,
        "data": None,
        "message": exc.message,
        "error": {
            "code": exc.code,
            "details": exc.details,
        }
    }
    return JSONResponse(status_code=exc.status_code, content=response_data)  


def user_exist_exe_handler(request: Request, exc: UserExc.UserExistError):
    response_data = {
        "success": False,
        "data": None,
        "message": exc.message,
        "error": {
            "code": exc.code,
            "details": exc.details,
        }
    }
    return JSONResponse(status_code=exc.status_code, content=response_data)  



def global_exc_handler(app: FastAPI):
    # General Error Handler
    app.add_exception_handler(GeneralExc.DatabaseError, database_exe_handler)
    app.add_exception_handler(GeneralExc.UnknownError, unknown_exe_handler)
    app.add_exception_handler(GeneralExc.InValidTokenError, invalid_token_exe_handler)
    app.add_exception_handler(GeneralExc.TokenExpiredError, token_expired_exe_handler)

    # User Error Handler
    app.add_exception_handler(UserExc.AuthenticationError, auth_exe_handler)
    app.add_exception_handler(UserExc.UserExistError, user_exist_exe_handler)
