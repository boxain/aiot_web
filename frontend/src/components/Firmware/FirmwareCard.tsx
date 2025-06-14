import { useState } from 'react';
import { FirmwareProps } from '@/components/firmware/types';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import deleteFirmwaresAPI from '@/api/firmware/deleteFirmwareAPI';
import { processApiError } from '@/lib/error'; 


const FirmwareCard = ({ firmware, setFirmwares } : FirmwareProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteClick = async (id: string) => {
    if(isLoading)return;
    try{
      setIsLoading(true);
      const result = await deleteFirmwaresAPI(id);
      setFirmwares((prev) => prev.filter((fm => fm.id !== id)))

    }catch(error){
      const processedError = processApiError(error);
      const displayMessage = `[${processedError.code}] ${processedError.message}`;
      toast.error(displayMessage);

      if (processedError.details) {
          console.error("API Error Details:", processedError.details);
      } else {
          console.error("Caught Error:", error);
      }
    }finally{
      setIsLoading(false)
    }
  }

  return (
    <div key={firmware.id} className="relative bg-white rounded-lg shadow-md overflow-hidden">
      {/* Content */}
      <div className="p-4">
          {/* Firmware Name */}
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{firmware.name}</h3>

          {/* Creation Date */}
          <p className="text-sm text-gray-600 mb-2">Created: {firmware.created_time}</p>

          {/* Description */}
          <p className="text-gray-700 text-sm">{firmware.description}</p>
      </div>

      {/* Delete icon */}
      <div
        className="absolute top-2 right-2 cursor-pointer p-1 rounded-full hover:bg-gray-200 transition"
        onClick={() => handleDeleteClick(firmware.id)} 
        aria-label="Delete firmware"
      >
        <Trash2 className="w-5 h-5 text-gray-500 hover:text-red-600" /> {/* Adjust icon size and color */}
      </div>

    </div>
  );
};

export default FirmwareCard;