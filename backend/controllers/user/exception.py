from utils.exception import BasedError

# class BasedError(Exception):
#     """Error format defined class"""
#     def __init__(self, message: str, details: str, code: str, status_code: int = 500):
#         self.message = message
#         self.details = details
#         self.code = code
#         self.status_code = status_code
#         super().__init__(self.message)

class UserExistError(BasedError):
    """When user exist, throw this error class"""
    def __init__(self, message: str = "User already existed.", details: str = None):
        super().__init__(message, details, code="USER_EXISTED", status_code=409)


class AuthenticationError(BasedError):
    """When give wrong username or password, throw this error class"""
    def __init__(self, message: str = "Username or password wrong.", details: str = None):
        super().__init__(message, details, code="USER_AUTHENTICATION", status_code=401)





