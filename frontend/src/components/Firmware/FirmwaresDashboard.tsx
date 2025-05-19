"use client"

import { useState, useEffect } from 'react';
import FirmwareCard from '@/components/firmware/FirmwareCard';
import { Firmware } from '@/components/firmware/types';
import AddFirmwareForm from '@/components/firmware/AddFirmwareForm';
import getDevicesAPI from '@/api/device/getDevicesAPI';

const FirmwareDashboard = () => {
    
    // const [firmwares, setFirmwares] = useState<Firmware[]>([]);
    // const [isGetFirmwares, setIsGetFirmwares ] = useState(false);
    const [showAddFirmwareForm, setShowAddFirmwareForm] = useState(false);
    
    // useEffect(() => {

    //     const getDevices = async () => {
    //         if(isGetDevices)return;
    //         try{
    //             setIsGetDevices(true);
    //             const result = await getDevicesAPI();
                
    //             if(result.success){
    //                 setDevices(result.data.devices)
    //                 alert("Get devices success")
    //             }else{
    //                 alert("Get devices failed")
    //             }

    //         }finally{
    //             setIsGetDevices(false);
    //         }
    //     }

    //     getDevices();

    // }, [])
    
    const firmwares = [
        {
            id: "1",
            name: "version_01",
            createdAt: "2024/12/31",
            description: "Bref description"
        },
        {
            id: "2",
            name: "version_02",
            createdAt: "2024/12/31",
            description: "Bref description"
        }
    ]


    const handleAddFirmwareClick = () => {
        setShowAddFirmwareForm(true);
    };

    const handleCloseAddFimrwareForm = () => {
        setShowAddFirmwareForm(false);
    };
    
    return (
        <>
            <button
                onClick={handleAddFirmwareClick}
                className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 cursor-pointer"
            >
                + Add New Firmware
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {firmwares.map((firmware) => (
                    <FirmwareCard firmware={firmware} key={firmware.id} />
                ))}
            </div>

            {showAddFirmwareForm && (
                <div className="fixed inset-0 bg-black/50 transition-opacity duration-300 flex items-center justify-center z-10">
                    <AddFirmwareForm onClose={handleCloseAddFimrwareForm} />
                </div>
            )}
        </>
    )
}

export default FirmwareDashboard