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
  model_name: string;
  firmware_id: string;
  firmware_name: string;
  description: string;
}

export interface DeviceCardProps {
  device: Device;
  selectedType: string;
  isSelectDevice: boolean;
  isSelected: boolean;
  setSelectedDevices: Dispatch<SetStateAction<string[]>>;
}

export interface FirmwareSelectionProps {
  setDevices: Dispatch<SetStateAction<Device[]>>;
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
  device: Device;
  setDevice: Dispatch<SetStateAction<Device|null>>;
}

export interface DeviceLogsSectionProps {
  device_id: string;
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
  device_id: string;
  device_status: "connected" | "disconnected" | "busy";
  isResetDevice: boolean;
  setIsResetDevice: Dispatch<SetStateAction<boolean>>;
}

export interface InferenceSectionProps {
  device_id: string;
  device_status: "connected" | "disconnected" | "busy";
  activeMode: string;
  isInference: boolean;
  setIsInference: Dispatch<SetStateAction<boolean>>;
}

export interface ModelSwitchProps {
  device: Device;
  setDevice: Dispatch<SetStateAction<Device|null>>;
  showSwitchModel: boolean;
  setShowSwitchModel: Dispatch<SetStateAction<boolean>>;
}