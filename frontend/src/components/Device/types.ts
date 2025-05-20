import { Dispatch, SetStateAction } from "react";

export interface Device {
  status: "Connected" | "Disconnected" | "Busy";
  id: string;
  name: string;
  mac: string;
  version: string;
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