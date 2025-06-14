from utils.exception import BasedError 

class DeviceNotFound(BasedError):
    """當找不到指定的設備時拋出此錯誤。"""
    def __init__(self, message: str = "Device not found.", details: str | None = None):
        super().__init__(message, details, code="DEVICE_NOT_FOUND", status_code=404)

class DeviceAlreadyExists(BasedError):
    """當試圖建立已存在的設備時拋出此錯誤 (例如 MAC 位址重複)。"""
    def __init__(self, message: str = "Device already exists.", details: str | None = None):
        super().__init__(message, details, code="DEVICE_ALREADY_EXISTS", status_code=409)

class DeviceNotConnected(BasedError):
    """當試圖對離線設備執行需要連線的任務時拋出此錯誤。"""
    def __init__(self, message: str = "Device is not connected.", details: str | None = None):
        super().__init__(message, details, code="DEVICE_NOT_CONNECTED", status_code=400)

class DeviceTaskFailed(BasedError):
    """當設備執行任務 (如 OTA、模型部署) 失敗時拋出此錯誤。"""
    def __init__(self, message: str = "Device task failed.", details: str | None = None):
        super().__init__(message, details, code="DEVICE_TASK_FAILED", status_code=500)

class DevicePermissionDenied(BasedError):
    """當使用者試圖存取不屬於他們的設備時拋出此錯誤。"""
    def __init__(self, message: str = "Permission denied for this device.", details: str | None = None):
        super().__init__(message, details, code="DEVICE_PERMISSION_DENIED", status_code=403)