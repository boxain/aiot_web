"use client"

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DeviceCard from '@/components/device/DeviceCard';
import Loading from '@/components/Loading';
import { Device } from "@/components/device/types";
import getDevicesAPI from '@/api/device/getDevicesAPI';
import AddDeviceForm from '@/components/device/AddDeviceForm';
import FirmwareSelection from '@/components/device/FirmwareSelection';

const DevicesDashboard = () => {
    
    const [devices, setDevices] = useState<Device[]>([]);
    const [isGetDevices, setIsGetDevices ] = useState(true);
    const [showAddDeviceForm, setShowAddDeviceForm] = useState(false);
    const [isSelectDevice, setIsSelectDevice] = useState(false);
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
    const [showSelectFirmware, setShowSelectFirmware] = useState(false);
    

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
    const openSelectDeviceMode = () => {
        setIsSelectDevice(true);
    };

    /**
     * Cancel selected device for OTA
     */
    const cancleSelectDeviceMode = () => {
        setIsSelectDevice(false);
        setSelectedDevices([]);
        setShowSelectFirmware(false);

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
    const openSelectFirmware = () => {
        setShowSelectFirmware(true);
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
                                onClick={openSelectFirmware}
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
                                onClick={openSelectDeviceMode}
                                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                            >
                                <Plus className='w-4 h-4' />
                                <div>Firmware Update</div>
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
            {/* {showSelectFirmware && (
                <div className="fixed inset-0 bg-black/50 transition-opacity duration-300 flex items-center justify-center z-10"> */}
                    <FirmwareSelection 
                        selectedDevices={selectedDevices}
                        showSelectFirmware={showSelectFirmware} 
                        setShowSelectFirmware={setShowSelectFirmware} 
                        cancleSelectDeviceMode={cancleSelectDeviceMode} 
                    />
                {/* </div>
            )} */}
        </>
    )
}

export default DevicesDashboard