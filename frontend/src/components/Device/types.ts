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
}
