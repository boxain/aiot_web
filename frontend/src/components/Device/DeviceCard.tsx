import Link from 'next/link';
import { Camera } from "lucide-react";
import { Device, DeviceCardProps } from "@/components/device/types"

const DeviceCard = ({ device, selectedType, isSelectDevice, setSelectedDevices, isSelected } : DeviceCardProps) => {

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const deviceId = device.id; 
    const isChecked = event.target.checked;

    setSelectedDevices(prevSelectedDevices => {
      if (isChecked) {
        if (!prevSelectedDevices.includes(deviceId)) {
          return [...prevSelectedDevices, deviceId];
        }
      } else {
        return prevSelectedDevices.filter(id => id !== deviceId);
      }
        return prevSelectedDevices;
    });

  };

  const statusCSSColor = () => {
    switch (device.status) {
        case "connected":
            return "bg-green-500"
        case "disconnected":
            return "bg-red-500"
        case "busy":
            return "bg-orange-500"
        default:
            return "bg-purple-500"
    }
  }

  /**
   * Check device status is connected or not
   */
  const checkDeviceState = () => {
     return device.status === "connected";
  }

  const showMask = () => {
    return isSelectDevice && device.status !== "connected" && selectedType !== "Delete"
  }

  const showCheckBox = () => {
    return (isSelectDevice && device.status === "connected") || (isSelectDevice && selectedType == "Delete")
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${showMask() && "bg-black opacity-50"}`}>
        
        {/* Device status */}
        <div className='flex items-center justify-between'>
          <div className={`text-xs font-semibold text-white px-2 py-1 rounded-md inline-block mb-2 ${statusCSSColor()}`}>
            {device.status}
          </div>
          { showCheckBox() &&
            <input 
              type='checkbox' 
              checked={isSelected}
              className="form-checkbox h-5 w-5 text-blue-600 rounded cursor-pointer" 
              onChange={handleCheckboxChange}
            />
          }
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
        <p className="text-sm text-gray-600">Firmware Version: {device.firmware_name ?? "N/A"}</p>
    
    </div>
  );
};

export default DeviceCard;