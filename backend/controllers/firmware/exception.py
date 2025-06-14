from utils.exception import BasedError 

class FirmwareNotFound(BasedError):
    """當找不到指定的韌體時拋出此錯誤。"""
    def __init__(self, message: str = "Firmware not found.", details: str | None = None):
        super().__init__(message, details, code="FIRMWARE_NOT_FOUND", status_code=404)

class FirmwareAlreadyExists(BasedError):
    """當試圖建立一個已存在的韌體 (例如名稱重複) 時拋出此錯誤。"""
    def __init__(self, message: str = "A firmware with this name already exists.", details: str | None = None):
        super().__init__(message, details, code="FIRMWARE_ALREADY_EXISTS", status_code=409)

class FirmwareInUse(BasedError):
    """當試圖刪除一個正在被設備使用的韌體時拋出此錯誤。"""
    def __init__(self, message: str = "Firmware is currently in use and cannot be deleted.", details: str | None = None):
        super().__init__(message, details, code="FIRMWARE_IN_USE", status_code=409)

class FileUploadFailed(BasedError):
    """當儲存上傳的韌體檔案到伺服器時發生 I/O 錯誤時拋出。"""
    def __init__(self, message: str = "Failed to save the uploaded file.", details: str | None = None):
        super().__init__(message, details, code="FIRMWARE_UPLOAD_IO_ERROR", status_code=500)

class PhysicalFileNotFound(BasedError):
    """當資料庫中有紀錄，但實體檔案在伺服器上遺失時拋出。"""
    def __init__(self, message: str = "Firmware file is missing from the server.", details: str | None = None):
        super().__init__(message, details, code="FIRMWARE_FILE_NOT_FOUND", status_code=404)