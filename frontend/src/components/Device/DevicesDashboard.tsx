"use client"

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DeviceCard from '@/components/device/DeviceCard';
import { Device } from "@/components/device/types";
import getDevicesAPI from '@/api/device/getDevicesAPI';
import AddDeviceForm from '@/components/device/AddDeviceForm';
import FirmwareSelection from './FirmwareSelection';

const DevicesDashboard = () => {
    
    const [devices, setDevices] = useState<Device[]>([]);
    const [isGetDevices, setIsGetDevices ] = useState(false);
    const [showAddDeviceForm, setShowAddDeviceForm] = useState(false);
    const [isSelectDevice, setIsSelectDevice] = useState(false);
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
    const [showSelectFirmware, setShowSelectFirmware] = useState(false);
    

    useEffect(() => {

        const getDevices = async () => {
            if(isGetDevices)return;
            try{
                setIsGetDevices(true);
                const result = await getDevicesAPI();
                
                if(result.success){
                    setDevices(result.data.devices)
                    alert("Get devices success")
                }else{
                    alert("Get devices failed")
                }

            }finally{
                setIsGetDevices(false);
            }
        }

        getDevices();

    }, [])

    const handleAddDeviceClick = () => {
        setShowAddDeviceForm(true);
    };

    const handleCloseAddDeviceForm = () => {
        setShowAddDeviceForm(false);
    };

    const openSelectDeviceMode = () => {
        setIsSelectDevice(true);
    };

    const cancleSelectDeviceMode = () => {
        setIsSelectDevice(false);
        setSelectedDevices([]);
        setShowSelectFirmware(false);

    };

    const checkSelectDeviceLength = () => {
        return selectedDevices.length > 0
    };

    const openSelectFirmware = () => {
        setShowSelectFirmware(true);
    };

    return (
        <>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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

            {showAddDeviceForm && (
                <div className="fixed inset-0 bg-black/50 transition-opacity duration-300 flex items-center justify-center z-10">
                    {/* AddDeviceForm is now centered within this overlay */}
                    <AddDeviceForm onClose={handleCloseAddDeviceForm} />
                </div>
            )}

            {showSelectFirmware && (
                <div className="fixed inset-0 bg-black/50 transition-opacity duration-300 flex items-center justify-center z-10">
                    <FirmwareSelection />
                </div>
            )}
        </>
    )
}

export default DevicesDashboard