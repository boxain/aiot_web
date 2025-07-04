import { RefreshCw, AlertTriangle } from "lucide-react";
import toast from 'react-hot-toast';
import { ResetButtonProps } from "@/components/device/types";
import resetDeviceAPI from '@/api/device/restartDeviceAPI';
import { processApiError } from '@/lib/error'; 

const ResetButton: React.FC<ResetButtonProps> = ({ device_id , device_status, isResetDevice, setIsResetDevice }) => {

    const handleRestart = async () => {
        if(isResetDevice) return;
        // Add a confirmation dialog for critical actions
        if (!window.confirm("Are you sure you want to restart the device?")) {
            return;
        }
        setIsResetDevice(true);
        try{
            const result = await resetDeviceAPI(device_id);
        }catch(error){
            const processedError = processApiError(error);
            const displayMessage = `[${processedError.code}] ${processedError.message}`;
            toast.error(displayMessage);

            if (processedError.details) {
                console.error("API Error Details:", processedError.details);
            } else {
                console.error("Caught Error:", error);
            }
        }finally {
            setIsResetDevice(false);
        }
    };


    const checkIsCanReset = () => {
        if(!isResetDevice && device_status === "connected"){
            return true;
        }else{
            return false;
        }
    }


    return (
        <button
            onClick={handleRestart}
            disabled={!checkIsCanReset()}
            className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 ease-in-out group
                bg-red-500 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300 shadow-md hover:shadow-lg
                disabled:bg-red-300 disabled:cursor-not-allowed disabled:opacity-70
            `}
        >
            <RefreshCw className={`w-5 h-5 mr-2 ${isResetDevice ? 'animate-spin' : 'group-hover:rotate-[-90deg] transition-transform duration-300'}`} />
            <span>{isResetDevice ? 'Restarting...' : 'Restart Device'}</span>
            <AlertTriangle className="w-5 h-5 ml-auto opacity-80 group-hover:opacity-100" />
        </button>
    )
}

export default ResetButton;