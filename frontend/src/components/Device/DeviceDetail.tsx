"use client"

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AlertTriangle } from "lucide-react";

import { Device } from './types'; 
import { useWs } from '@/context/WebSocketContext';
import Loading from '@/components/Loading'; 
import DeviceInfo from '@/components/device/DeviceInfo';
import DeviceLog from '@/components/device/DeviceLog';
import SwitchButton from '@/components/device/SwitchButton';
import ResetButton from '@/components/device/ResetButton';
import InferenceSection from '@/components/device/InferenceSection';

import getDeviceAPI from '@/api/device/getDeviceAPI';


const DeviceDetail = () => {
  const param = useParams<{id:string}>();
  const id = param.id;
  
  const { stateQueue, setStateQueue } = useWs();
  const [activeMode, setActiveMode] = useState('STAND_BY_MODE');
  const [device, setDevice] = useState<Device | null>(null);
  const [isGetDevice, setIsGetDevice ] = useState<boolean>(true);
  const [isResetDevice, setIsResetDevice ] = useState<boolean>(false);
  const [isSwitchMode, setIsSwitchMode ] = useState<boolean>(false);
  const [isInference, setIsInference ] = useState<boolean>(false);


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
      if (!stateQueue.length) return;
      const message = stateQueue[0];

      if(message.device_id !== id) return;
      if (message.action === "CONNECTED") {
        setDevice(prev => prev ? { ...prev, status: "connected" } : prev);
      } else if (message.action === "DISCONNECTED") {
        setDevice(prev => prev ? { ...prev, status: "disconnected" } : prev);
      } else if (message.action === "BUSY") {
        setDevice(prev => prev ? { ...prev, status: "busy" } : prev);
      }

      setStateQueue(prev => prev.slice(1));
  }, [stateQueue])


  const statusCSSColor = () => {
    switch (device!.status) {
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


  if (isGetDevice) {
    return <Loading />;
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
      <div className='max-w-[1920px] mx-auto'>

        {/* Title */}
        <div className="mb-8">
          <div className='flex items-center gap-x-2'>
            <h1 className="text-3xl font-bold text-gray-800">
              Device: <span className="text-indigo-600">{device?.name}</span>
            </h1>
            <div className={`text-xs font-semibold text-white px-2 py-1 rounded-md inline-block ${statusCSSColor()}`}>
              {device.status}
            </div>
          </div>
          <p className="text-gray-500 mt-1">Manage and monitor your device in real-time.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left Column: Device Info & Logs */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            <DeviceInfo device={device} />

            {/* Device Log */}
            <DeviceLog />
          </div>

          {/* Right Column: Inference & Controls */}
          <div className="lg:col-span-3 flex flex-col space-y-6">
            
            {/* Real-time Inference Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col space-y-4 hover:shadow-xl transition-shadow duration-300 min-h-[400px]">
              <h2 className="text-xl font-semibold text-gray-700 mb-1 flex items-center">
                Real-time Inference
              </h2>
              <InferenceSection activeMode={activeMode} isInference={isInference} setIsInference={setIsInference} />
            </div>

            {/* Mode Switching & Restart Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              {/* Title */}
              <h2 className="text-xl font-semibold text-gray-700 mb-6">
                Device Control
              </h2>
              
              <SwitchButton id={id} activeMode={activeMode} setActiveMode={setActiveMode} isSwitchMode={isSwitchMode} setIsSwitchMode={setIsSwitchMode} />  
              <ResetButton id={id} isResetDevice={isResetDevice} setIsResetDevice={setIsResetDevice} />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default DeviceDetail;