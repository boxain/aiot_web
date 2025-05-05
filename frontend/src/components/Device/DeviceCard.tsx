import Link from 'next/link';
import { Camera } from "lucide-react";
import { DeviceCardProps } from "@/components/Device/types"

const DeviceCard = ({ device } : DeviceCardProps) => {
  

  const statusCSSColor = () => {
    switch (device.status) {
        case "Connected":
            return "bg-green-500"
        case "Disconnected":
            return "bg-red-500"
        case "Busy":
            return "bg-orange-500"
        default:
            return "bg-purple-500"
    }
  }


  return (
    <div className="bg-white rounded-lg shadow-md p-4">

        {/* Device status */}
        <div className={`text-xs font-semibold text-white px-2 py-1 rounded-md inline-block mb-2 ${statusCSSColor()}`}>
          {device.status || "Developed"}
        </div>

        {/* Device name */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{device.name}</h3>
        
        {/* Device Icon */}
        <Link href={`/device/${device.id}`}>
          <div className="w-full aspect-square mb-2 p-4 flex items-center justify-center bg-gray-300 rounded-md cursor-pointer">     
              <Camera className="w-10 h-10 text-white"/>
          </div>
        </Link>

        {/* Device mac address */}
        <p className="text-sm text-gray-600">MAC: {device.mac}</p>
        
        {/* Device firmware version */}
        <p className="text-sm text-gray-600">Version: {device.version || "developed"}</p>
    
    </div>
  );
};

export default DeviceCard;