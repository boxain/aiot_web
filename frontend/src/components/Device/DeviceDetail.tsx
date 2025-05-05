"use client"

import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {  PowerCircle, Clock, Battery, RefreshCw, AlertTriangle  } from "lucide-react";
import { useWs } from '@/context/WebSocketContext';
import { Device } from './types';
import getDeviceAPI from '@/api/device/getDeviceAPI';

const DeviceDetail = () => {
  const param = useParams<{id:string}>();
  const id = param.id;

  const { lastBinaryData } = useWs();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState('Stand by mode');
  const [device, setDevice] = useState<Device | null>(null);
  const [isGetDevice, setIsGetDevice ] = useState<boolean>(true);
  
  useEffect(() => {
      const getDevice = async () => {
          try{
              setIsGetDevice(true);
              const result = await getDeviceAPI(id);
              
              if(result.success){
                  setDevice(result.data.devices[0])
                  alert("Get device success")
              }else{
                  alert("Get device failed")
              }
          }finally{
              setIsGetDevice(false);
          }
      }

      getDevice();

  }, [])


  useEffect(() => {
    let oldImageUrl = imageUrl;

    if (lastBinaryData) {
        // 創建新的 Blob URL
        const url = URL.createObjectURL(lastBinaryData);
        setImageUrl(url); // 更新顯示圖片的 URL

        // 如果有舊的 URL，釋放它
        if (oldImageUrl) {
              URL.revokeObjectURL(oldImageUrl);
        }

    }

    // clean function
    return () => {
        if (imageUrl) { // 清理最後一個設置的 imageUrl
            URL.revokeObjectURL(imageUrl);
            console.log("Revoked last Blob URL on cleanup:", imageUrl);
        }
    };

  }, [lastBinaryData])


  // Placeholder for ESP32 Log (replace with actual log data)
  const esp32Logs = [
    "[INFO] System initialized successfully.",
    "[INFO] WiFi connected, IP: 192.168.1.100",
    "[INFO] Inference engine loaded.",
    "[EVENT] Motion detected.",
    "[INFERENCE] Bird detected: Sparrow (Confidence: 92%).",
    "[INFO] Capturing image...",
    "[INFERENCE] No object detected.",
    "[INFO] Switching to Power Saving mode.",
    "[WARNING] Battery level low (15%).",
    "[INFO] Uploading log data...",
    "[INFO] System going to deep sleep.",
  ];

  // Placeholder for Inference Result (replace with actual data)
  const inferenceResult = "Last Inference: Bird detected - Robin (Confidence: 88%) at 2023-10-27 10:30:15";

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    console.log(`Changing mode to: ${mode}`);
  };

  const handleRestart = () => {
    console.log(`Restarting device: ${id}`);
  };

  
  if (isGetDevice) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">Loading...</div>;
  }

  if (!device) {
      return <div className="min-h-screen flex items-center justify-center text-xl text-red-700">Failed to load device data.</div>;
  }

  return (
    <div className='h-full grid grid-rows-[auto_1fr] gap-6'>

      {/* Title */}
      <h1 className="text-2xl font-semibold text-gray-800">
        Device Detail: {device?.name}
      </h1>

      {/* Main Content Grid */}
      <div className="grid grid-cols-5 gap-8 min-h-0">

        {/* Left Column: Device Info & Controls */}
        <div className="col-span-2 flex flex-col space-y-8 overflow-y-auto">
          {/* Device Info Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Device Information</h2>
            <div className="space-y-3 text-gray-700">
              <p><span className="font-semibold">Device Name:</span> {device?.name}</p>
              <p><span className="font-semibold">Processor:</span> {"N/A"}</p>
              <p><span className="font-semibold">MAC Address:</span> {device?.mac || "N/A" }</p>
              <p><span className="font-semibold">Firmware Version:</span> {device?.version || "N/A"}</p>
              <p><span className="font-semibold">Model Name:</span> {"N/A"}</p>
              {/* Add other info */}
              <p><span className="font-semibold">Battery Level:</span> {"N/A"}</p>
              <p><span className="font-semibold">SD Card Remaining:</span> {"N/A"}</p>
            </div>
          </div>
          {/* ESP32 Log Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col min-h-0">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Device Log</h2>
            {/* Log output area with scroll */}
            <div className="bg-gray-800 text-gray-100 p-4 rounded-md font-mono text-sm flex-1 overflow-y-auto">
              {esp32Logs.map((log, index) => (
                <p key={index} className="mb-1">{log}</p>
              ))}
                {/* Add a blinking cursor or indicator for real-time logs */}
                <span className="animate-pulse">_</span>
            </div>
          </div>
        </div>

        
        {/* Right Column: Inference & Log */}
        <div className="col-span-3 flex flex-col space-y-8 overflow-auto min-h-0">
          
          {/* Real-time Inference Section */}
          <div className="p-6 flex-1 flex flex-col space-y-4 bg-white rounded-lg shadow-md  overflow-y-auto ">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Real-time Inference</h2>
            
            {/* Placeholder for real-time video/image feed */}
            <div className="w-full flex-1 flex items-center justify-center bg-gray-700 rounded-md text-white text-2xl">
              { imageUrl && <img src={imageUrl} />}
              {/* You would integrate a video stream or refreshing image here */}
              {/* e.g., <img src="/api/device-stream/${id}" alt="Inference Feed" /> */}
            </div>
            {/* Inference Result */}
            <p className="text-base text-gray-800 font-semibold">{inferenceResult}</p>

          </div>

          {/* Mode Switching & Restart Controls */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Device Control</h2>
  
            {/* Mode Selection Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">

              {/* Stand By Mode */}
              <button
                onClick={() => handleModeChange('Stand by mode')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  activeMode === 'Stand by mode' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                <Clock className={`w-8 h-8 mb-2 ${activeMode === 'Stand by mode' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="text-sm font-medium">Stand By Mode</span>
              </button>

              {/* Continuous Mode */}
              <button
                onClick={() => handleModeChange('Continous mode')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  activeMode === 'Continous mode' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                <PowerCircle className={`w-8 h-8 mb-2 ${activeMode === 'Continous mode' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="text-sm font-medium">Continous Mode</span>
              </button>
              
              {/* Power Saving Mode */}
              <button
                onClick={() => handleModeChange('Power saving mode')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  activeMode === 'Power saving mode' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                }`}
              >
                <Battery className={`w-8 h-8 mb-2 ${activeMode === 'Power saving mode' ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className="text-sm font-medium">Power Saving Mode</span>
              </button>

            </div>
  
            {/* Restart Button */}
            <button
              onClick={handleRestart}
              className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors group"
            >
              <RefreshCw className="w-5 h-5 mr-2 group-hover:animate-spin" />
              <span>Restart Device</span>
              <AlertTriangle className="w-5 h-5 ml-2" />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default DeviceDetail;