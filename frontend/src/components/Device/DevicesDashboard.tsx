"use client"

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

import { useWs } from '@/context/WebSocketContext';
import DeviceCard from '@/components/device/DeviceCard';
import Loading from '@/components/Loading';
import { Device } from "@/components/device/types";
import getDevicesAPI from '@/api/device/getDevicesAPI';
import AddDeviceForm from '@/components/device/AddDeviceForm';
import FirmwareSelection from '@/components/device/FirmwareSelection';
import ModelSelection from '@/components/device/ModelSelection';

const DevicesDashboard = () => {
    const { stateQueue, setStateQueue } = useWs();
    const [devices, setDevices] = useState<Device[]>([]);
    const [isGetDevices, setIsGetDevices ] = useState(true);
    const [showAddDeviceForm, setShowAddDeviceForm] = useState(false);
    const [isSelectDevice, setIsSelectDevice] = useState(false);
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
    const [selectedType, setSelectedType] = useState<string>("");
    const [showSelectFirmware, setShowSelectFirmware] = useState(false);
    const [showSelectModel, setShowSelectModel] = useState(false);
    

    useEffect(() => {

        const getDevices = async () => {         
            try{
                const result = await getDevicesAPI();
                
                if(result.success){
                    setDevices(result.data.devices)
                }else{
                    alert("Get devices failed")
                }

            }finally{
                setIsGetDevices(false);
            }
        }

        getDevices();

    }, [])


    useEffect(() => {
        if (!stateQueue.length) return;
        const message = stateQueue[0];

        if (message.action === "CONNECTED") {
            setDevices(prev =>
                prev.map(device => {
                    if(device.id === message.device_id){
                        if(device.busy_reason==="OTA" && message.firmware_name){
                            return { ...device, status: "connected", firmware_name: message.firmware_name }
                        }else{
                            return { ...device, status: "connected" }
                        }
                    }else{
                        return device
                    }
                })
            );
        } else if (message.action === "DISCONNECTED") {
            setDevices(prev =>
                prev.map(device =>
                    device.id === message.device_id
                        ? { ...device, status: "disconnected" }
                        : device
                )
            );
        } else if (message.action === "BUSY") {
            setDevices(prev =>
                prev.map(device =>
                    device.id === message.device_id
                        ? { ...device, status: "busy" }
                        : device
                )
            );
        }

        setStateQueue(prev => prev.slice(1));
    }, [stateQueue])


    /**
     * Handle add new device submit
     */
    const handleAddDeviceClick = () => {
        setShowAddDeviceForm(true);
    };

    /**
     * Close add new device form
     */
    const handleCloseAddDeviceForm = () => {
        setShowAddDeviceForm(false);
    };

    /**
     * Switch select device mode for OTA
     */
    const openSelectDeviceMode = (type: string) => {
        setSelectedType(type);
        setIsSelectDevice(true);
    };

    /**
     * Cancel selected device for OTA
     */
    const cancleSelectDeviceMode = () => {
        setIsSelectDevice(false);
        setSelectedDevices([]);
        setSelectedType("");
        setShowSelectFirmware(false);
        setShowSelectModel(false);
    };


    /** 
     * Return selected device number
     */
    const checkSelectDeviceLength = () => {
        return selectedDevices.length > 0
    };


    /**
     * Open firmware selection dashboard for OTA
     */
    const openSelectionDashboard = () => {
        if(selectedType === "Firmware"){
            setShowSelectFirmware(true);
        }else if(selectedType === "Model"){
            setShowSelectModel(true);
        }
    };


    if(isGetDevices){
        return <Loading />
    }


    return (
        <>
            {/* Button List */}
            <div className='flex items-center gap-x-4  mb-6'>
                {
                    isSelectDevice ? 
                    (
                        <>
                            <button
                                onClick={openSelectionDashboard}
                                className={`flex items-center justify-center px-4 py-2  text-white text-sm rounded  ${checkSelectDeviceLength() ? "bg-green-500 hover:bg-green-700" : "bg-gray-500"}`}
                                disabled={!checkSelectDeviceLength()}
                            >
                                <Plus className='w-4 h-4' />
                                <div>Confirm</div>
                            </button>

                            <button
                                onClick={cancleSelectDeviceMode}
                                className="flex items-center justify-center px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-700"
                            >
                                <Plus className='w-4 h-4' />
                                <div>Cancel</div>
                            </button>
                        </>
                    ):
                    (
                        <>
                            <button
                                onClick={handleAddDeviceClick}
                                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                            >
                                <Plus className='w-4 h-4' />
                                <div>Add New Device</div>
                            </button>

                            <button
                                onClick={()=>{openSelectDeviceMode("Firmware")}}
                                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                            >
                                <Plus className='w-4 h-4' />
                                <div>Firmware Update</div>
                            </button>

                            <button
                                onClick={()=>{openSelectDeviceMode("Model")}}
                                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                            >
                                <Plus className='w-4 h-4' />
                                <div>Model Deploy</div>
                            </button>
                        </>
                    )
                }
            </div>

            {/* Device List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {devices.map((device, index) => (
                    <DeviceCard 
                        key={index} 
                        device={device}
                        isSelected={selectedDevices.includes(device.id)}
                        isSelectDevice={isSelectDevice} 
                        setSelectedDevices={setSelectedDevices} 
                    />
                ))}
            </div>

            {/* Add Device Form */}
            {showAddDeviceForm && (
                <div className="fixed inset-0 bg-black/50 transition-opacity duration-300 flex items-center justify-center z-10">
                    {/* AddDeviceForm is now centered within this overlay */}
                    <AddDeviceForm onClose={handleCloseAddDeviceForm} />
                </div>
            )}

            {/* Firmware Selection Dashboard */}
            {showSelectFirmware && (
                <FirmwareSelection 
                    setDevices={setDevices}
                    selectedDevices={selectedDevices}
                    showSelectFirmware={showSelectFirmware} 
                    setShowSelectFirmware={setShowSelectFirmware} 
                    cancleSelectDeviceMode={cancleSelectDeviceMode} 
                />
            )} 

            {/* Model Selection Dashboard */}
            {showSelectModel && (
                <ModelSelection 
                    selectedDevices={selectedDevices}
                    showSelectModel={showSelectModel} 
                    setShowSelectModel={setShowSelectModel} 
                    cancleSelectDeviceMode={cancleSelectDeviceMode} 
                />
            )}         
        </>
    )
}

export default DevicesDashboard