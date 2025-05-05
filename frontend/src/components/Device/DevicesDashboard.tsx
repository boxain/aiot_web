"use client"

import { useState, useEffect } from 'react';
import DeviceCard from '@/components/Device/DeviceCard';
import { Device } from "@/components/Device/types"
import getDevicesAPI from '@/api/device/getDevicesAPI';

const DevicesDashboard = () => {
    
    const [devices, setDevices] = useState<Device[]>([]);
    const [isGetDevices, setIsGetDevices ] = useState(false);
    
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
    
    
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {devices.map((device, index) => (
                    <DeviceCard key={index} device={device} />
                ))}
            </div>
        </>
    )
}

export default DevicesDashboard