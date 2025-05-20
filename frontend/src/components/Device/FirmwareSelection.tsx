"use client";

import React, { useState } from 'react';
import { X, Check, ListRestart } from 'lucide-react';
import { FirmwareSelectionProps } from '@/components/device/types';
import { Firmware } from '@/components/firmware/types';


const FirmwareListItem = ({ firmware, isSelected, onSelect }: { firmware: Firmware; isSelected: boolean; onSelect: (id: string) => void; }) => {
  return (
    <div
      className={`p-4 border mb-3 rounded-lg cursor-pointer transition-all duration-150 ease-in-out
                  hover:shadow-md hover:border-blue-400
                  ${isSelected ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300' : 'bg-white border-gray-300'}`}
      onClick={() => onSelect(firmware.id)}
    >
        <div>
          <h3 className="text-md font-semibold text-gray-800">{firmware.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{firmware.description}</p>
        </div>
        <div className="text-xs text-gray-500 mt-2">
            Created: {new Date(firmware.createdAt).toLocaleDateString()}
        </div>
    </div>
  );
};

const FirmwareSelection: React.FC<FirmwareSelectionProps> = ({ showSelectFirmware, setShowSelectFirmware, cancleSelectDeviceMode }) => {
    const [selectedFirmwareId, setSelectedFirmwareId] = useState<string | null>(null);

    const firmwares : Firmware[] = [
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
        },
        {
            id: "3",
            name: "version_01",
            createdAt: "2024/12/31",
            description: "Bref description"
        },
        {
            id: "4",
            name: "version_02",
            createdAt: "2024/12/31",
            description: "Bref description"
        },
            {
            id: "5",
            name: "version_01",
            createdAt: "2024/12/31",
            description: "Bref description"
        },
        {
            id: "6",
            name: "version_02",
            createdAt: "2024/12/31",
            description: "Bref description"
        }
    ]

    const handleConfirmClick = () => {
        if (selectedFirmwareId) {
            console.log("firmware id: ", selectedFirmwareId);
        }
    };

    const handleCancelClick = () => {
        setSelectedFirmwareId(null); 
        setShowSelectFirmware(false);
        cancleSelectDeviceMode();
    };

    return (
        <div className={`fixed inset-0 bg-black/50 transition-opacity duration-300 flex items-center justify-center z-10 ${!showSelectFirmware && "hidden"}`}>
            <div className={`fixed bottom-0 left-0 right-0 z-20 h-[400px] transition-transform duration-300 ease-in-out ${showSelectFirmware ? "translate-y-0" : "translate-y-full"}`}>
                <div className="bg-white h-full shadow-2xl rounded-t-xl flex flex-col overflow-hidden">
                    {/* Header with Title and Buttons */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-200">
                        <h2 id="firmware-selection-title" className="text-lg font-semibold text-gray-700">
                            Select Firmware for OTA Update
                        </h2>
                        <div className="flex gap-x-2">
                            <button
                                onClick={handleConfirmClick}
                                disabled={!selectedFirmwareId}
                                className={`flex items-center justify-center px-3 py-2 text-white text-xs sm:text-sm rounded-md ${ selectedFirmwareId ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'} transition-colors duration-150`}
                            >
                                <Check className="w-4 h-4 sm:mr-1" />
                                <span className="hidden sm:inline">Confirm</span>
                            </button>
                            <button
                                onClick={handleCancelClick}
                                className="flex items-center justify-center px-3 py-2 bg-gray-200 text-gray-700 text-xs sm:text-sm rounded-md hover:bg-gray-300 transition-colors duration-150"
                                aria-label="Cancel OTA update and close selection"
                            >
                                <X className="w-4 h-4 sm:mr-1" />
                                <span className="hidden sm:inline">Cancel</span>
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Firmware List */}
                    <div className="overflow-y-auto flex-grow p-4 space-y-2 bg-gray-50">

                    {firmwares && firmwares.length > 0 ? 
                        (
                            firmwares.map((fw) => (
                            <FirmwareListItem
                                key={fw.id}
                                firmware={fw}
                                isSelected={selectedFirmwareId === fw.id}
                                onSelect={setSelectedFirmwareId}
                            />
                            ))
                        ) 
                    : 
                        (
                            <div className="text-center text-gray-500 py-10 flex flex-col items-center">
                            <ListRestart className="w-10 h-10 mb-2 text-gray-400" />
                            <p>No firmware versions available.</p>
                            <p className="text-sm">Please upload firmware to proceed.</p>
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
};

export default FirmwareSelection;