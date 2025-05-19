export interface Firmware {
  id: string;
  name: string;
  createdAt: string; 
  description: string;
}


export interface FirmwareProps {
  firmware: Firmware;
}