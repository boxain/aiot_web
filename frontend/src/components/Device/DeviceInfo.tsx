import { DeviceInfoProps } from '@/components/device/types'; 
import { Battery, Info, Server, Cpu, MemoryStick, HardDrive } from "lucide-react"; // Added more icons


const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined | null }) => (
  <div className="flex items-center space-x-3">
    <span className="text-indigo-500">{icon}</span>
    <p><span className="font-medium text-gray-600">{label}:</span> {value || "N/A"}</p>
  </div>
);

const DeviceInfo: React.FC<DeviceInfoProps> = ({ device }) => {

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold text-gray-700 mb-5 flex items-center">
                <Info className="w-6 h-6 mr-2 text-indigo-500" /> Device Information
            </h2>
            <div className="space-y-4 text-sm text-gray-700">
                <InfoItem icon={<Server size={18} />} label="Device Name" value={device?.name} />
                <InfoItem icon={<Cpu size={18} />} label="Processor" value={"N/A"} />
                <InfoItem icon={<Info size={18} />} label="MAC Address" value={device?.mac} />
                <InfoItem icon={<Info size={18} />} label="Firmware Version" value={device?.version} />
                <InfoItem icon={<MemoryStick size={18} />} label="Model Name" value={"N/A"} />
                <InfoItem icon={<Battery size={18} />} label="Battery Level" value={"N/A"} /> {/* Replace with actual data */}
                <InfoItem icon={<HardDrive size={18} />} label="SD Card Remaining" value={"N/A"} />
            </div>
        </div>
    )
}

export default DeviceInfo;