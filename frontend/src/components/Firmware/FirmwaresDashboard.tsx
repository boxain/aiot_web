"use client"

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

import FirmwareCard from '@/components/firmware/FirmwareCard';
import Loading from '@/components/Loading';
import { Firmware } from '@/components/firmware/types';
import AddFirmwareForm from '@/components/firmware/AddFirmwareForm';
import getFirmwaresAPI from '@/api/firmware/getFirmwaresAPI';

const FirmwareDashboard = () => {
    const [firmwares, setFirmwares] = useState<Firmware[]>([]);
    const [isGetFirmwares, setIsGetFirmwares ] = useState(true);
    const [showAddFirmwareForm, setShowAddFirmwareForm] = useState(false);
    
    useEffect(() => {

        const getFirmwares = async () => {
            try{
                const result = await getFirmwaresAPI();
                if(result.success){

                    const formattedFirmwares = result.data.firmwares.map((fm: Firmware) => {
                        return {
                            ...fm,
                            created_time: format(new Date(fm.created_time), 'yyyy/MM/dd HH:mm')
                        }
                    })

                    setFirmwares(formattedFirmwares)
                }else{
                    alert("Get devices failed")
                }
            }finally{
                setIsGetFirmwares(false);
            }
        }

        getFirmwares();

    }, [])
    
    const handleAddFirmwareClick = () => {
        setShowAddFirmwareForm(true);
    };

    const handleCloseAddFimrwareForm = () => {
        setShowAddFirmwareForm(false);
    };
    

    if(isGetFirmwares){
        return <Loading />
    }
    
    return (
        <>
            <button
                onClick={handleAddFirmwareClick}
                className="mb-6 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 cursor-pointer"
            >
                + Add New Firmware
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {
                    firmwares && firmwares.length > 0 &&
                    (   
                        firmwares.map((firmware) => (
                            <FirmwareCard firmware={firmware} setFirmwares={setFirmwares}  key={firmware.id} />
                        ))
                    )
                }
            </div>

            {showAddFirmwareForm && (
                <div className="fixed inset-0 bg-black/50 transition-opacity duration-300 flex items-center justify-center z-10">
                    <AddFirmwareForm onClose={handleCloseAddFimrwareForm} setFirmwares={setFirmwares} />
                </div>
            )}
        </>
    )
}

export default FirmwareDashboard