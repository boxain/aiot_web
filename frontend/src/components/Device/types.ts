import { Dispatch, SetStateAction } from "react";

export interface Device {
  id: string;
  name: string;
  mac: string;
  status: "connected" | "disconnected" | "busy";
  busy_reason: "MODE_SWITCH" | "OTA" | "MODEL_SWITCH" | "MODEL_DOWNLOAD" ;
  version: string;
  user_id: string;
  current_model_id: string;
  firmware_id: string;
  description: string;
}

export interface DeviceCardProps {
  device: Device;
  isSelectDevice: boolean;
  isSelected: boolean;
  setSelectedDevices: Dispatch<SetStateAction<string[]>>;
}

export interface FirmwareSelectionProps {
  selectedDevices: string[];
  showSelectFirmware: boolean;
  setShowSelectFirmware: Dispatch<SetStateAction<boolean>>;
  cancleSelectDeviceMode: () => void;
}

export interface ModelSelectionProps {
  selectedDevices: string[];
  showSelectModel: boolean;
  setShowSelectModel: Dispatch<SetStateAction<boolean>>;
  cancleSelectDeviceMode: () => void;
}

export interface DeviceInfoProps {
  device: Device
}

export interface SwitchButtonProps {
  device: Device;
  setDevice: Dispatch<SetStateAction<Device|null>>;
  activeMode: string;
  setActiveMode: Dispatch<SetStateAction<string>>;
  isSwitchMode: boolean;
  setIsSwitchMode: Dispatch<SetStateAction<boolean>>;
}

export interface ResetButtonProps {
  id: string;
  isResetDevice: boolean;
  setIsResetDevice: Dispatch<SetStateAction<boolean>>;
}

export interface InferenceSectionProps {
  device_id: string;
  activeMode: string;
  isInference: boolean;
  setIsInference: Dispatch<SetStateAction<boolean>>;
}
