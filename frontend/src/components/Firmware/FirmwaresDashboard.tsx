"use client"

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Plus, HardDrive } from 'lucide-react';
import FirmwareCard from '@/components/firmware/FirmwareCard';
import Loading from '@/components/Loading';
import { Firmware } from '@/components/firmware/types';
import AddFirmwareForm from '@/components/firmware/AddFirmwareForm';
import getFirmwaresAPI from '@/api/firmware/getFirmwaresAPI';
import { processApiError } from '@/lib/error'; 


const FirmwareDashboard = () => {
    const [firmwares, setFirmwares] = useState<Firmware[]>([]);
    const [isGetFirmwares, setIsGetFirmwares ] = useState(true);
    const [showAddFirmwareForm, setShowAddFirmwareForm] = useState(false);
    
    useEffect(() => {

        const getFirmwares = async () => {
            try{
                const result = await getFirmwaresAPI();
                const formattedFirmwares = result.data.firmwares.map((fm: Firmware) => {
                    return {
                        ...fm,
                        created_time: format(new Date(fm.created_time), 'yyyy/MM/dd HH:mm')
                    }
                })

                setFirmwares(formattedFirmwares)

            }catch(error){
                const processedError = processApiError(error);
                const displayMessage = `[${processedError.code}] ${processedError.message}`;
                toast.error(displayMessage);

                if (processedError.details) {
                    console.error("API Error Details:", processedError.details);
                } else {
                    console.error("Caught Error:", error);
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
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
            <div className='max-w-7xl mx-auto'>
                {/* Title */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Firmware Management</h1>
                        <p className="mt-1 text-sm text-gray-600">Upload, manage, and deploy firmware versions to your devices.</p>
                    </div>
                    <button
                        onClick={handleAddFirmwareClick}
                        className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Firmware
                    </button>
                </div>

                {/* Firemware List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {firmwares && firmwares.length > 0 && (
                        firmwares.map((firmware) => (
                        <FirmwareCard firmware={firmware} setFirmwares={setFirmwares}  key={firmware.id} />
                        ))
                    )}
                </div>

                {!isGetFirmwares && firmwares.length === 0 && (
                        <div className="mt-8 text-center col-span-full py-16 px-6 bg-white rounded-lg shadow-sm">
                        <HardDrive className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-xl font-medium text-gray-800">No Firmware Found</h3>
                        <p className="text-gray-500 mt-2">Click "Add New Firmware" to upload your first version.</p>
                    </div>
                )}

                {showAddFirmwareForm && (
                    <div className="fixed inset-0 bg-black/50 transition-opacity duration-300 flex items-center justify-center z-10">
                        <AddFirmwareForm onClose={handleCloseAddFimrwareForm} setFirmwares={setFirmwares} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default FirmwareDashboard