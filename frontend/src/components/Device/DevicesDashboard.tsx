"use client"

import { useState, useEffect } from 'react';
import DeviceCard from '@/components/Device/DeviceCard';
import { Device } from "@/components/Device/types";
import getDevicesAPI from '@/api/device/getDevicesAPI';
import AddDeviceForm from './AddDeviceForm';

const DevicesDashboard = () => {
    
    const [devices, setDevices] = useState<Device[]>([]);
    const [isGetDevices, setIsGetDevices ] = useState(false);
    const [showAddDeviceForm, setShowAddDeviceForm] = useState(false);
    
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
    
    return (
        <>

            <button
                onClick={handleAddDeviceClick}
                className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
                + Add New Device
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {devices.map((device, index) => (
                    <DeviceCard key={index} device={device} />
                ))}
            </div>
            {showAddDeviceForm && (
                <div className="fixed inset-0 bg-black/50 transition-opacity duration-300 flex items-center justify-center z-10">
                    {/* AddDeviceForm is now centered within this overlay */}
                    <AddDeviceForm onClose={handleCloseAddDeviceForm} />
                </div>
            )}
        </>
    )
}

export default DevicesDashboard