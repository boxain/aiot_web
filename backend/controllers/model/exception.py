from utils.exception import BasedError 

class ModelNotFound(BasedError):
    """當找不到指定的 AI 模型時拋出此錯誤。"""
    def __init__(self, message: str = "Model not found.", details: str | None = None):
        super().__init__(message, details, code="MODEL_NOT_FOUND", status_code=404)

class ModelAlreadyDeployed(BasedError):
    """當試圖對設備重複部署同一個模型時拋出此錯誤。"""
    def __init__(self, message: str = "Model has already been deployed to this device.", details: str | None = None):
        super().__init__(message, details, code="MODEL_ALREADY_DEPLOYED", status_code=409)

class ModelAlreadyExists(BasedError):
    """當試圖建立一個已存在的模型 (例如名稱重複) 時拋出此錯誤。"""
    def __init__(self, message: str = "A model with this name already exists.", details: str | None = None):
        super().__init__(message, details, code="MODEL_ALREADY_EXISTS", status_code=409)

class ModelInUse(BasedError):
    """當試圖刪除一個正在被設備使用的模型時拋出此錯誤。"""
    def __init__(self, message: str = "Model is currently in use and cannot be deleted.", details: str | None = None):
        super().__init__(message, details, code="MODEL_IN_USE", status_code=409)

class ModelUploadFailed(BasedError):
    """當儲存上傳的模型檔案到伺服器時發生 I/O 錯誤時拋出。"""
    def __init__(self, message: str = "Failed to save the uploaded model file.", details: str | None = None):
        super().__init__(message, details, code="MODEL_UPLOAD_IO_ERROR", status_code=500)

class PhysicalModelFileNotFound(BasedError):
    """當資料庫中有紀錄，但實體檔案在伺服器上遺失時拋出。"""
    def __init__(self, message: str = "Model file is missing from the server.", details: str | None = None):
        super().__init__(message, details, code="MODEL_FILE_NOT_FOUND", status_code=404)

class InvalidLabelFormat(BasedError):
    """當提供的 labels 字串不是有效的 JSON 格式時拋出。"""
    def __init__(self, message: str = "Invalid format for labels, must be a valid JSON array string.", details: str | None = None):
        super().__init__(message, details, code="INVALID_LABEL_FORMAT", status_code=400)