"use client"

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { PowerCircle, Clock, Battery, RefreshCw, AlertTriangle, Info, ListChecks, Server, Cpu, MemoryStick, HardDrive } from "lucide-react"; // Added more icons

import Loading from '@/components/Loading'; // Assuming you have this component
import { useWs } from '@/context/WebSocketContext'; // Assuming you have this context
import { Device } from './types'; // Assuming you have this type
import getDeviceAPI from '@/api/device/getDeviceAPI';
import switchModeAPI from '@/api/device/switchModeAPI';
import resetDeviceAPI from '@/api/device/restartDeviceAPI';


const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined | null }) => (
  <div className="flex items-center space-x-3">
    <span className="text-indigo-500">{icon}</span>
    <p><span className="font-medium text-gray-600">{label}:</span> {value || "N/A"}</p>
  </div>
);

const DeviceDetail = () => {
  const param = useParams<{id:string}>();
  const id = param.id;

  const { lastBinaryData } = useWs();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [lastInferenceText, setLastInferenceText] = useState<string>("Waiting for inference data..."); // For inference text
  const [activeMode, setActiveMode] = useState('STAND_BY_MODE');
  const [device, setDevice] = useState<Device | null>(null);
  const [isGetDevice, setIsGetDevice ] = useState<boolean>(true);
  const [isResetDevice, setIsResetDevice ] = useState<boolean>(false);
  const [isSwitchMode, setIsSwitchMode ] = useState<boolean>(false);
  const logContainerRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling logs

  useEffect(() => {
      const getDevice = async () => {
          try{
              setIsGetDevice(true);
              const result = await getDeviceAPI(id);
              
              if(result.success){
                  setDevice(result.data.devices[0])
                  // Assuming device object might have an initial mode
                  if (result.data.devices[0]?.currentMode) {
                    setActiveMode(result.data.devices[0].currentMode);
                  }
              }else{
                  // Consider a more user-friendly notification system than alert()
                  console.error("Get device failed:", result.message);
                  alert("Failed to fetch device details. Please try again.");
              }
          } catch (error) {
              console.error("Error fetching device:", error);
              alert("An error occurred while fetching device details.");
          } finally{
              setIsGetDevice(false);
          }
      }
      if (id) {
        getDevice();
      }
  }, [id])


  useEffect(() => {
    let currentImageUrl = imageUrl; // Store current URL to properly revoke it later

    if (lastBinaryData instanceof Blob) { // Check if it's a Blob
        const newUrl = URL.createObjectURL(lastBinaryData);
        setImageUrl(newUrl);
        if (currentImageUrl) {
            URL.revokeObjectURL(currentImageUrl);
        }
    } else if (typeof lastBinaryData === 'string') {
        // If you also get text updates via the same WebSocket connection for inference results
        setLastInferenceText(lastBinaryData);
    }


    // Cleanup function: revoke the last URL when the component unmounts or before the next image is set.
    return () => {
        if (imageUrl) { // This will refer to the imageUrl state at the time of cleanup
            URL.revokeObjectURL(imageUrl);
            // console.log("Revoked Blob URL on cleanup:", imageUrl);
        }
    };
  // IMPORTANT: If imageUrl is in the dependency array, it might cause frequent revoking/creating.
  // The cleanup should revoke the *specific* URL created in *this* effect instance.
  // Let's refine the cleanup. The current `imageUrl` in the cleanup refers to the one from the previous render.
  // The `oldImageUrl` pattern was actually better for immediate revocation.
  // Re-instating a similar pattern but ensuring it's correct:
  // The current setup is mostly fine; the key is that `imageUrl` in the return function
  // captures the `imageUrl` from the scope of that `useEffect` run.
  }, [lastBinaryData]); // Only re-run when lastBinaryData changes

  // Placeholder for ESP32 Log
  const [esp32Logs, setEsp32Logs] = useState<string[]>([
    "[INFO] System initialized successfully.",
    "[INFO] WiFi connected, IP: 192.168.1.100",
    "[INFO] Inference engine loaded.",
    "[EVENT] Motion detected.",
    "[INFERENCE] Bird detected: Sparrow (Confidence: 92%).",
    // Add more initial logs if needed
  ]);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     const newLog = `[TIME] ${new Date().toLocaleTimeString()} - Log entry example.`;
  //     setEsp32Logs(prevLogs => [...prevLogs, newLog].slice(-100)); // Keep last 100 logs
  //   }, 5000); // Add a new log every 5 seconds
  //   return () => clearInterval(intervalId);
  // }, []);

  // Auto-scroll log container
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [esp32Logs]);


  const inferenceResult = "Last Inference: Bird detected - Robin (Confidence: 88%) at 2023-10-27 10:30:15"; // This can be updated via WebSocket too

  const handleModeSwitch = async (mode: string) => {
    if(isSwitchMode || activeMode === mode) return; // Prevent switching if already in mode or switch is in progress
    setIsSwitchMode(true);
    try{
      const result = await switchModeAPI(id, mode);
      if(result.success){
        setActiveMode(mode);
        // Add a success notification (e.g., using a toast library)
      }else{
        alert("Switch Mode Failed"); // Replace with better notification
        console.error("Switch mode failed:", result.message);
      }
    } catch (error) {
        alert("Error switching mode.");
        console.error("Error switching mode:", error);
    } finally{
      setIsSwitchMode(false);
    }
  };

  const handleRestart = async () => {
    if(isResetDevice) return;
    // Add a confirmation dialog for critical actions
    if (!window.confirm("Are you sure you want to restart the device?")) {
        return;
    }
    setIsResetDevice(true);
    try{
      const result = await resetDeviceAPI(id, activeMode); // Assuming activeMode is relevant for restart
      if(result.success){
        // Add success notification
        alert("Device restarting...");
      } else {
        alert("Reset Failed"); // Replace with better notification
        console.error("Reset failed:", result.message);
      }
    } catch (error) {
        alert("Error restarting device.");
        console.error("Error restarting device:", error);
    } finally {
      setIsResetDevice(false);
    }
  };

  
  if (isGetDevice) {
    return <Loading />; // Ensure your Loading component is styled nicely
  }

  if (!device) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        <AlertTriangle className="w-8 h-8 mr-2 text-red-500" />
        Device not found or failed to load.
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto'>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {/* <Server className="inline-block w-8 h-8 mr-3 text-indigo-600" /> */}
            Device Detail: <span className="text-indigo-600">{device?.name || "Test1"}</span>
          </h1>
          <p className="text-gray-500 mt-1">Manage and monitor your device in real-time.</p>
        </div>

        {/* Main Content Grid - Adjusted for responsiveness */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left Column: Device Info & Logs */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            {/* Device Info Panel */}
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

            {/* Device Log Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col flex-grow min-h-[300px] hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                <ListChecks className="w-6 h-6 mr-2 text-indigo-500" /> Device Log
              </h2>
              <div ref={logContainerRef} className="bg-gray-800 text-gray-200 p-4 rounded-lg font-mono text-xs flex-1 overflow-y-auto h-64 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900">
                {esp32Logs.map((log, index) => (
                  <p key={index} className="mb-1 whitespace-pre-wrap break-all">
                    <span className={`mr-2 ${log.includes("[ERROR]") ? "text-red-400" : log.includes("[WARNING]") ? "text-yellow-400" : log.includes("[INFO]") ? "text-blue-400" : log.includes("[EVENT]") ? "text-green-400" : "text-gray-400"}`}>
                      {log.split("]")[0]}
                    </span>
                    {log.split("]").slice(1).join("]")}
                  </p>
                ))}
                <div className="h-2"></div>
              </div>
            </div>
          </div>

          
          {/* Right Column: Inference & Controls */}
          <div className="lg:col-span-3 flex flex-col space-y-6">
            
            {/* Real-time Inference Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col space-y-4 hover:shadow-xl transition-shadow duration-300 min-h-[400px]">
              <h2 className="text-xl font-semibold text-gray-700 mb-1 flex items-center">
                {/* <Camera className="w-6 h-6 mr-2 text-indigo-500" /> */} Real-time Inference
              </h2>
              
              <div className="w-full aspect-video flex items-center justify-center bg-gray-200 rounded-lg text-gray-500 overflow-hidden">
                {imageUrl ? (
                  <img src={imageUrl} alt="Live Inference Feed" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    {/* <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-2" /> */}
                    <p>Live feed initializing...</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 font-medium text-center py-2 bg-gray-50 rounded-md">{lastInferenceText || inferenceResult}</p>
            </div>

            {/* Mode Switching & Restart Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
                {/* <Settings className="w-6 h-6 mr-2 text-indigo-500" /> */} Device Control
              </h2>
      
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* Stand By Mode Button */}
                <button
                  onClick={() => handleModeSwitch('STAND_BY_MODE')}
                  disabled={isSwitchMode}
                  className={`flex flex-col items-center justify-center p-5 rounded-lg border-2 transition-all duration-200 ease-in-out transform hover:scale-105
                    ${activeMode === 'STAND_BY_MODE' 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md' 
                      : 'border-gray-300 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600'
                    } ${isSwitchMode ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <Clock className={`w-10 h-10 mb-2 transition-colors ${activeMode === 'STAND_BY_MODE' ? 'text-indigo-600' : 'text-gray-500'}`} />
                  <span className="text-base font-medium">Stand By Mode</span>
                </button>

                {/* Continuous Mode Button */}
                <button
                  onClick={() => handleModeSwitch('CONTINUOUS_MODE')}
                  disabled={isSwitchMode}
                  className={`flex flex-col items-center justify-center p-5 rounded-lg border-2 transition-all duration-200 ease-in-out transform hover:scale-105
                    ${activeMode === 'CONTINUOUS_MODE' 
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-md' 
                      : 'border-gray-300 bg-gray-50 hover:border-green-300 hover:bg-green-50 text-gray-600 hover:text-green-600'
                    } ${isSwitchMode ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <PowerCircle className={`w-10 h-10 mb-2 transition-colors ${activeMode === 'CONTINUOUS_MODE' ? 'text-green-600' : 'text-gray-500'}`} />
                  <span className="text-base font-medium">Continuous Mode</span>
                </button>
              </div>
      
              {/* Restart Button */}
              <button
                onClick={handleRestart}
                disabled={isResetDevice || isSwitchMode} // Disable if any operation is in progress
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 ease-in-out group
                  bg-red-500 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300 shadow-md hover:shadow-lg
                  disabled:bg-red-300 disabled:cursor-not-allowed disabled:opacity-70
                `}
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${isResetDevice ? 'animate-spin' : 'group-hover:rotate-[-90deg] transition-transform duration-300'}`} />
                <span>{isResetDevice ? 'Restarting...' : 'Restart Device'}</span>
                <AlertTriangle className="w-5 h-5 ml-auto opacity-80 group-hover:opacity-100" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDetail;