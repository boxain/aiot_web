import { Dispatch, SetStateAction } from 'react';

export interface Firmware {
  id: string;
  name: string;
  created_time: string; 
  description: string;
}


export interface FirmwareProps {
  firmware: Firmware;
  setFirmwares: Dispatch<SetStateAction<Firmware[]>>
}


export interface AddFirmwareFormProps {
  onClose: () => void;
  setFirmwares: Dispatch<SetStateAction<Firmware[]>>
}