from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from utils.exception import BasedError


async def based_error_handler(request: Request, exc: BasedError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "code": exc.code,
            "message": exc.message,
            "details": exc.details,
        },
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_details = [
        {"loc": error["loc"], "msg": error["msg"], "type": error["type"]}
        for error in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "code": "VALIDATION_ERROR",
            "message": "Request validation failed.",
            "details": error_details,
        },
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "code": "HTTP_EXCEPTION",
            "message": exc.detail,
            "details": None,
        },
    )

def register_exception_handlers(app: FastAPI):
    app.add_exception_handler(BasedError, based_error_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)