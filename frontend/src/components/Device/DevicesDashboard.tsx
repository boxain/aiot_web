"use client"

import { useState, useEffect } from 'react';
import { Trash2, X, Check, UploadCloud, Package } from 'lucide-react';

import { useWs } from '@/context/WebSocketContext';
import DeviceCard from '@/components/device/DeviceCard';
import Loading from '@/components/Loading';
import { Device } from "@/components/device/types";
import getDevicesAPI from '@/api/device/getDevicesAPI';
import AddDeviceForm from '@/components/device/AddDeviceForm';
import FirmwareSelection from '@/components/device/FirmwareSelection';
import ModelSelection from '@/components/device/ModelSelection';
import deleteDevicesAPI from '@/api/device/deleteDeviceAPI';

const DevicesDashboard = () => {
    const { stateQueue, setStateQueue } = useWs();
    const [devices, setDevices] = useState<Device[]>([]);
    const [isGetDevices, setIsGetDevices ] = useState(true);
    const [isDeleteingDevices, setIsDeleteingDevices] = useState(false);
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
     * Cancel selected device
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

    /**
     * Send delete device API
     */
    const handleDeleteSelectedDevices = async () => {
        if(isDeleteingDevices)return;
        
        try{
            setIsDeleteingDevices(true);
            const result = await deleteDevicesAPI(selectedDevices);
            if(result.success){
                alert("Delete devices success !");
                setDevices((prev) => prev.filter((device => !selectedDevices.includes(device.id))));
                cancleSelectDeviceMode();
            }else{
                alert("Delete devices failed....");
            }
        }finally{
            setIsDeleteingDevices(false)
        }
    }

    /**
     * Depend on is select device mode or not to return different button list
     */
    const buttonList = () => {
        const baseButtonClass = "flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
        
        if(isSelectDevice){
            return (
                <>
                    {/* (OTA/Model Deploy) confirm button */}
                    {(selectedType === "Firmware" || selectedType === "Model") && (
                        <button
                            onClick={openSelectionDashboard}
                            className={`${baseButtonClass} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`}
                            disabled={!checkSelectDeviceLength()}
                        >
                            <Check className='w-4 h-4 mr-2' />
                            <div>Confirm {selectedType}</div>
                        </button>
                    )}

                    {/* Delete confirm button */}
                    {selectedType === "Delete" && (
                        <button
                            onClick={handleDeleteSelectedDevices}
                            className={`${baseButtonClass} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`}
                            disabled={!checkSelectDeviceLength() || isDeleteingDevices}
                        >
                            <Trash2 className='w-4 h-4 mr-2' />
                            <div>{isDeleteingDevices ? "Deleting..." : "Confirm Delete"}</div>
                        </button>
                    )}

                    {/* Cancel confirm button */}
                    <button
                        onClick={cancleSelectDeviceMode}
                        className={`${baseButtonClass} bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400`}
                    >
                        <X className='w-4 h-4 mr-2' />
                        <div>Cancel</div>
                    </button>
                </>
            )
        } else {
            return (
                <>
                    <button
                        onClick={()=>{openSelectDeviceMode("Firmware")}}
                        className={`${baseButtonClass} bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500`}
                    >
                        <UploadCloud className='w-4 h-4 mr-2' />
                        <div>Firmware Update</div>
                    </button>

                    <button
                        onClick={()=>{openSelectDeviceMode("Model")}}
                        className={`${baseButtonClass} bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500`}
                    >
                        <Package className='w-4 h-4 mr-2' />
                        <div>Model Deploy</div>
                    </button>
                    
                    <div className="border-l border-gray-300 h-6"></div>

                    <button
                        onClick={()=>{openSelectDeviceMode("Delete")}}
                        className={`${baseButtonClass} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`}
                    >
                        <Trash2 className='w-4 h-4 mr-2' />
                        <div>Delete Devices</div>
                    </button>
                </>
            )
        }
    }


    if(isGetDevices){
        return <Loading />
    }


    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
            <div className='max-w-7xl mx-auto'>
                {/* Title */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">My Devices</h1>                      
                        <p className="mt-1 text-sm text-gray-600">
                            {isSelectDevice
                                ? `Select devices to ${selectedType}. (${selectedDevices.length} selected)`
                                : "View and manage all your devices."
                            }
                        </p>
                    </div>
                    {/* <button
                        onClick={handleAddDeviceClick}
                        className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        <Plus className='w-5 h-5 mr-1' />
                        Add Device
                    </button> */}
                </div>
            
                {/* Button */}
                <div className='flex items-center gap-x-4 mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-200'>
                    {buttonList()}
                </div>

                {/* Device List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {devices.map((device) => (
                        <DeviceCard 
                            key={device.id} 
                            device={device}
                            selectedType={selectedType}
                            isSelected={selectedDevices.includes(device.id)}
                            isSelectDevice={isSelectDevice} 
                            setSelectedDevices={setSelectedDevices} 
                        />
                    ))}
                </div>

                {devices.length === 0 && !isGetDevices && (
                    <div className="mt-8 text-center col-span-full py-16 px-6 bg-white rounded-lg shadow-sm">
                        <h3 className="text-xl font-medium text-gray-800">No Devices Found</h3>
                        <p className="text-gray-500 mt-2">Click "Add Device" to start managing your devices.</p>
                    </div>
                )}
            </div>


            {showSelectFirmware && (   
                <FirmwareSelection 
                    setDevices={setDevices}
                    selectedDevices={selectedDevices}
                    showSelectFirmware={showSelectFirmware} 
                    setShowSelectFirmware={setShowSelectFirmware} 
                    cancleSelectDeviceMode={cancleSelectDeviceMode} 
                />
            )} 

            {showSelectModel && (
                <ModelSelection 
                    selectedDevices={selectedDevices}
                    showSelectModel={showSelectModel} 
                    setShowSelectModel={setShowSelectModel} 
                    cancleSelectDeviceMode={cancleSelectDeviceMode} 
                />
            )}
        </div>
    )
}

export default DevicesDashboard;