class BasedError(Exception):
    """Error format defined class"""
    def __init__(self, message: str, details: str, code: str, status_code: int = 500):
        self.message = message
        self.details = details
        self.code = code
        self.status_code = status_code
        super().__init__(self.message)


class InValidTokenError(BasedError):
    """When given token format is invalid or  expired, throw this error class"""
    def __init__(self, message: str = "Token is invalid or expired", details: str = None):
        super().__init__(message, details, code="TOKEN_INVALID", status_code=401)


class TokenExpiredError(BasedError):
    """When given token expired, throw this error class"""
    def __init__(self, message: str = "Token has expired.", details: str = None):
        super().__init__(message, details, code="TOKEN_EXPIRED", status_code=401)


class DatabaseError(BasedError):
    """When Database operation error occur, throw this error class"""
    def __init__(self, message: str = "Database operation failed", details: str = None):
        super().__init__(message, details, code="DB_ERROR", status_code=500)


class UnknownError(BasedError):
    """When Undefined error occur, throw this error class"""
    def __init__(self, message: str = "Database operation failed", details: str = None):
        super().__init__(message, details, code="UNKNOWN_ERROR", status_code=500)