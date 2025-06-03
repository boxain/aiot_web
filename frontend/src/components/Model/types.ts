import { Dispatch, SetStateAction } from 'react';

export interface Model {
  id: string;
  name: string;
  model_type: string;
  created_time: string; 
  description: string;
  labels: Record<string,string>;
}

export interface ModelProps {
  model: Model;
  setModels: Dispatch<SetStateAction<Model[]>>;
  showLabels: boolean;
  toggleLabels: (model_id: string) => void;
}


export interface AddModelFormProps {
  onClose: () => void;
  setModels: Dispatch<SetStateAction<Model[]>>
}


export type ModelTypeOption = 'Classification' | 'Object Detection';