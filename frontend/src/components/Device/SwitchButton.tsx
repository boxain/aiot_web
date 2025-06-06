import { PowerCircle, Clock,  } from "lucide-react";
import { SwitchButtonProps } from "@/components/device/types";
import switchModeAPI from "@/api/device/switchModeAPI";

const SwitchButton: React.FC<SwitchButtonProps> = ({ device, setDevice, activeMode, setActiveMode, isSwitchMode, setIsSwitchMode }) => {

    /**
    * Send switch mode API
    */
    const handleModeSwitch = async (mode: string) => {
        if(isSwitchMode || activeMode === mode || device.status==="busy") return; // Prevent switching if already in mode or switch is in progress
        setIsSwitchMode(true);
        try{
            const result = await switchModeAPI(device.id, mode);
            if(result.success){
                setDevice(prevDevice => {
                    if(!prevDevice) return null;
                    return {
                        ...prevDevice,
                        status: "busy",
                        busy_reason: "MODE_SWITCH"
                    }
                })
                //setActiveMode(mode);
            }else{
                alert("Switch Mode Failed");
            }
        } finally{
            setIsSwitchMode(false);
        }
    };

    /**
    * Check device is currently switching mode or not
    */
    const checkCurrentlySwitchingMode = () => {
        return device.status === 'busy' && device.busy_reason === "MODE_SWITCH";
    }

    /**
    * Check device status is connected or not
    */
    const checkDeviceState = () => {
        return device.status === "connected";
    }


    const buttonStyle = (button_type: string) => {
        if(button_type === "STAND_BY_MODE"){
            if(activeMode === "STAND_BY_MODE"){
                return "border-green-500 bg-green-50 text-green-700 shadow-md";
            }else if(activeMode === "CONTINUOUS_MODE"){
                return "border-gray-300 bg-gray-50 hover:border-green-300 hover:bg-green-50 text-gray-600 hover:text-green-600"
            }
        }else if(button_type == "CONTINUOUS_MODE"){
            if(activeMode === "CONTINUOUS_MODE"){
                return "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
            }else if(activeMode === "STAND_BY_MODE"){
                return "border-gray-300 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600"
            }
        }
    }


    const prohibitButtonStyle = () => {
        if(isSwitchMode || !checkDeviceState()){
            return "opacity-50 cursor-not-allowed"
        }else{
            return "cursor-pointer"
        }
    }
 
    
    return (
        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Stand By Mode Button */}
            <button
                onClick={() => handleModeSwitch('STAND_BY_MODE')}
                disabled={isSwitchMode || !checkDeviceState()}
                className={`flex flex-col items-center justify-center p-5 rounded-lg border-2 transition-all duration-200 ease-in-out transform hover:scale-105
                ${buttonStyle("STAND_BY_MODE")} ${prohibitButtonStyle()}`}
            >
                <Clock className={`w-10 h-10 mb-2 transition-colors ${activeMode === 'STAND_BY_MODE' ? 'text-green-600' : 'text-gray-500'}`} />
                <span className="text-base font-medium">Stand By Mode</span>
            </button>

            {/* Continuous Mode Button */}
            <button
                onClick={() => handleModeSwitch('CONTINUOUS_MODE')}
                disabled={isSwitchMode || !checkDeviceState()}
                className={`flex flex-col items-center justify-center p-5 rounded-lg border-2 transition-all duration-200 ease-in-out transform hover:scale-105
                ${buttonStyle("CONTINUOUS_MODE")} ${prohibitButtonStyle()}`}
            >
                <PowerCircle className={`w-10 h-10 mb-2 transition-colors ${activeMode === 'CONTINUOUS_MODE' ? 'text-indigo-600' : 'text-gray-500'}`} />
                <span className="text-base font-medium">Continuous Mode</span>
            </button>
              
            {/* Mask for processing */}
            {checkCurrentlySwitchingMode() && (
            <div className="absolute inset-0 bg-slate-300 bg-opacity-60 dark:bg-slate-700 dark:bg-opacity-70 flex flex-col items-center justify-center z-10 rounded-lg">
                <p className="text-slate-700 dark:text-slate-200 text-md font-medium">
                    mode switch processing...
                </p>
            </div>
            )}
        </div>
    )
}

export default SwitchButton